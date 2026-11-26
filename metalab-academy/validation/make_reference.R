#!/usr/bin/env Rscript
# Generates validation/reference/reference.json using metafor + documented
# datasets from the 'metadat' package. Re-run on any machine with:
#   Rscript validation/make_reference.R
# Python then recomputes everything from the RAW exported inputs and compares
# (tests/test_validation_r.py). No numbers are typed in by hand.
suppressMessages({library(metafor); library(jsonlite)})
CTRL <- list(threshold = 1e-10, tol = 1e-12, maxiter = 2000)   # tol: uniroot tolerance used by PM   # tight convergence for the reference
nz <- function(x) { x <- as.numeric(x); x[!is.finite(x)] <- NA; x }

es <- function(measure, ...) {   # pass vectors (not NSE column names)
  d <- escalc(measure = measure, ...)
  list(measure = measure, yi = nz(d$yi), vi = nz(d$vi))
}

fit_summary <- function(y, v, method, knha = FALSE) {
  r <- tryCatch(rma(y, v, method = method, test = if (knha) "knha" else "z", control = CTRL),
                error = function(e) e, warning = function(w) w)
  if (inherits(r, "condition")) return(list(error = conditionMessage(r)))
  k <- r$k
  p <- predict(r)
  riley <- if (method != "FE" && k >= 3) as.numeric(r$beta) + c(-1, 1) * qt(0.975, k - 2) * sqrt(r$tau2 + r$se^2) else NULL
  w <- weights(r)
  out <- list(k = k, est = as.numeric(r$beta), se = r$se, z = r$zval, p = r$pval, ci = c(r$ci.lb, r$ci.ub),
              tau2 = r$tau2, I2_tau = r$I2, H2_tau = r$H2, Q = r$QE, Q_df = k - 1, Q_p = r$QEp,
              weights_pct = as.numeric(w), pi_metafor = c(p$pi.lb, p$pi.ub), pi_riley = riley)
  out
}

pool_case <- function(y, v) {
  res <- list()
  res$common <- fit_summary(y, v, "FE")
  for (m in c("REML", "DL", "PM")) {
    res[[m]] <- fit_summary(y, v, m)
    res[[paste0(m, "_knha")]] <- fit_summary(y, v, m, TRUE)
  }
  r <- tryCatch(rma(y, v, method = "REML", control = CTRL), error = function(e) NULL)
  if (!is.null(r) && length(y) >= 3) {
    loo <- lapply(seq_along(y), function(i) { ri <- rma(y[-i], v[-i], method = "REML", control = CTRL)
      c(est = as.numeric(ri$beta), ci_lb = ri$ci.lb, ci_ub = ri$ci.ub, tau2 = ri$tau2, I2_tau = ri$I2) })
    m <- do.call(rbind, loo)
    res$leave1out_REML <- list(est = m[, "est"], ci_lb = m[, "ci_lb"], ci_ub = m[, "ci_ub"], tau2 = m[, "tau2"], I2_tau = m[, "I2_tau"])
  }
  res
}

mods_fit <- function(y, v, X, method, knha = FALSE) {
  # X: data.frame of moderators (factors allowed)
  r <- tryCatch(rma(y, v, mods = ~ ., data = X, method = method, test = if (knha) "knha" else "z", control = CTRL),
                error = function(e) e)
  if (inherits(r, "condition")) return(list(error = conditionMessage(r)))
  list(k = r$k, p = r$p, beta = as.numeric(r$beta), se = r$se, stat = r$zval, pval = r$pval,
       ci_lb = r$ci.lb, ci_ub = r$ci.ub, QM = r$QM, QMp = r$QMp, QM_df = r$m, QE = r$QE, QE_df = r$k - r$p,
       tau2 = r$tau2, R2 = r$R2, I2_tau = r$I2, H2_tau = r$H2, colnames = rownames(r$beta),
       X = as.matrix(model.matrix(~ ., data = X)))
}

ref <- list(meta = list(R = R.version.string, metafor = as.character(packageVersion("metafor")),
                        metadat = as.character(packageVersion("metadat")), platform = R.version$platform,
                        generated = format(Sys.time(), "%Y-%m-%d %H:%M:%S %Z")), escalc = list(), pool = list(),
            regression = list(), subgroup = list(), edge = list())

## ---------------- effect sizes (escalc) from documented datasets -------------
bcg <- dat.bcg
ref$escalc$bcg_RR <- c(list(data = bcg[, c("tpos", "tneg", "cpos", "cneg")]), es("RR", ai = bcg$tpos, bi = bcg$tneg, ci = bcg$cpos, di = bcg$cneg))
ref$escalc$bcg_OR <- c(list(data = bcg[, c("tpos", "tneg", "cpos", "cneg")]), es("OR", ai = bcg$tpos, bi = bcg$tneg, ci = bcg$cpos, di = bcg$cneg))
ref$escalc$bcg_RD <- c(list(data = bcg[, c("tpos", "tneg", "cpos", "cneg")]), es("RD", ai = bcg$tpos, bi = bcg$tneg, ci = bcg$cpos, di = bcg$cneg))
nm <- dat.normand1999
for (m in c("MD", "SMD", "ROM")) ref$escalc[[paste0("normand_", m)]] <-
  c(list(data = nm[, c("n1i", "m1i", "sd1i", "n2i", "m2i", "sd2i")]), es(m, m1i = nm$m1i, sd1i = nm$sd1i, n1i = nm$n1i, m2i = nm$m2i, sd2i = nm$sd2i, n2i = nm$n2i))
ref$escalc$molloy_ZCOR <- c(list(data = dat.molloy2014[, c("ri", "ni")]), es("ZCOR", ri = dat.molloy2014$ri, ni = dat.molloy2014$ni))
nw <- dat.nielweise2007   # contains zero-event cells; escalc default add=1/2, to="only0"
nw$bi <- nw$n1i - nw$ai; nw$di <- nw$n2i - nw$ci
for (m in c("OR", "RR", "RD")) ref$escalc[[paste0("nielweise_", m)]] <-
  c(list(data = nw[, c("ai", "n1i", "ci", "n2i")]), es(m, ai = nw$ai, bi = nw$bi, ci = nw$ci, di = nw$di))

## ---------------- pooling on published/derived effect sizes ------------------
pool_sets <- list(
  bcg_RR = ref$escalc$bcg_RR, bcg_OR = ref$escalc$bcg_OR,
  normand_SMD = ref$escalc$normand_SMD, normand_MD = ref$escalc$normand_MD, normand_ROM = ref$escalc$normand_ROM,
  molloy_ZCOR = ref$escalc$molloy_ZCOR, nielweise_OR = ref$escalc$nielweise_OR,
  raudenbush_SMD = list(yi = dat.raudenbush1985$yi, vi = dat.raudenbush1985$vi),
  bangertdrowns_SMD = list(yi = dat.bangertdrowns2004$yi, vi = dat.bangertdrowns2004$vi),
  hackshaw_logOR = list(yi = dat.hackshaw1998$yi, vi = dat.hackshaw1998$vi))
for (n in names(pool_sets)) {
  s <- pool_sets[[n]]; ok <- !is.na(s$yi) & !is.na(s$vi)
  ref$pool[[n]] <- c(list(yi = s$yi[ok], vi = s$vi[ok], n_dropped_missing = sum(!ok)), pool_case(s$yi[ok], s$vi[ok]))
}

## ---------------- meta-regression and subgroup analysis ----------------------
rb <- dat.raudenbush1985
ref$regression$raudenbush_weeks <- list(yi = rb$yi, vi = rb$vi, mods = list(weeks = rb$weeks))
for (m in c("REML", "DL", "PM")) {
  ref$regression$raudenbush_weeks[[m]] <- mods_fit(rb$yi, rb$vi, data.frame(weeks = rb$weeks), m)
  ref$regression$raudenbush_weeks[[paste0(m, "_knha")]] <- mods_fit(rb$yi, rb$vi, data.frame(weeks = rb$weeks), m, TRUE)
}
b <- escalc(measure = "RR", ai = bcg$tpos, bi = bcg$tneg, ci = bcg$cpos, di = bcg$cneg)
ref$regression$bcg_ablat <- list(yi = nz(b$yi), vi = nz(b$vi), mods = list(ablat = bcg$ablat))
for (m in c("REML", "DL", "PM")) ref$regression$bcg_ablat[[m]] <- mods_fit(b$yi, b$vi, data.frame(ablat = bcg$ablat), m)
ref$regression$bcg_ablat$REML_knha <- mods_fit(b$yi, b$vi, data.frame(ablat = bcg$ablat), "REML", TRUE)
ref$regression$bcg_ablat_year <- list(yi = nz(b$yi), vi = nz(b$vi), mods = list(ablat = bcg$ablat, year = bcg$year))
ref$regression$bcg_ablat_year$REML <- mods_fit(b$yi, b$vi, data.frame(ablat = bcg$ablat, year = bcg$year), "REML")

grp <- as.character(bcg$alloc)
ref$subgroup$bcg_alloc <- list(yi = nz(b$yi), vi = nz(b$vi), group = grp)
ref$subgroup$bcg_alloc$by_group <- lapply(split(seq_along(grp), grp), function(i) fit_summary(b$yi[i], b$vi[i], "REML"))
ref$subgroup$bcg_alloc$mods_REML <- mods_fit(b$yi, b$vi, data.frame(alloc = factor(grp)), "REML")

## ---------------- edge cases (deterministic literals) -------------------------
edge <- list(
  k2 = list(y = c(0.2, 0.6), v = c(0.04, 0.09)),
  k3_small = list(y = c(0.1, 0.4, 0.9), v = c(0.05, 0.05, 0.05)),
  zero_het = list(y = c(0.50, 0.51, 0.49, 0.50, 0.52), v = c(0.2, 0.3, 0.25, 0.4, 0.35)),
  all_identical = list(y = rep(0.3, 5), v = c(0.1, 0.2, 0.3, 0.4, 0.5)),
  extreme_het = list(y = c(-3, -1, 0.2, 2.5, 4), v = c(0.01, 0.02, 0.01, 0.02, 0.01)),
  unequal_sizes = list(y = c(0.3, 0.35, 0.5, 0.1, 0.4), v = c(1e-4, 2e-2, 1, 5, 10)),
  extreme_effects = list(y = c(15, -20, 3, 40, -8), v = c(4, 9, 1, 16, 2)),
  tiny_variances = list(y = c(0.001, 0.0012, 0.0009, 0.0011), v = c(1e-9, 2e-9, 1.5e-9, 1e-9)),
  one_dominant = list(y = c(0.1, 0.2, 0.9, 0.8), v = c(1e-6, 1, 1, 1)))
for (n in names(edge)) ref$edge[[n]] <- c(list(yi = edge[[n]]$y, vi = edge[[n]]$v), pool_case(edge[[n]]$y, edge[[n]]$v))
# tiny-sample SMDs (n = 2-4 per group): checks small-df J correction and variance
tiny <- data.frame(m1i = c(5, 6, 4.5), sd1i = c(1, 1.5, 0.8), n1i = c(2, 3, 4), m2i = c(4, 4.2, 4), sd2i = c(1.1, 1.2, 0.9), n2i = c(2, 3, 4))
ref$edge$tiny_sample_smd <- c(list(data = tiny), es("SMD", m1i = tiny$m1i, sd1i = tiny$sd1i, n1i = tiny$n1i, m2i = tiny$m2i, sd2i = tiny$sd2i, n2i = tiny$n2i))
# missing data: metafor drops NA rows; record what it keeps
miss <- data.frame(y = c(0.2, NA, 0.5, 0.4), v = c(0.04, 0.05, NA, 0.06))
okm <- complete.cases(miss)
ref$edge$missing_rows <- c(list(y = miss$y, v = miss$v, kept = which(okm)), pool_case(miss$y[okm], miss$v[okm]))

writeLines(toJSON(ref, auto_unbox = TRUE, digits = NA, na = "null", null = "null"), "validation/reference/reference.json")
cat("wrote validation/reference/reference.json  (", R.version.string, ", metafor", as.character(packageVersion("metafor")), ")\n")
