#!/usr/bin/env Rscript
# v0.4 reference: advanced methods. Output: validation/reference/reference_v04.json
# Established software used: metafor (trimfill, rma.mv incl. multivariate / phylogenetic / network contrasts), clubSandwich (CR2), base R lm/integrate, ape (phylogeny).
# Packages NOT installable in the build sandbox: netmeta, mada, bayesmeta, dosresmeta, metasens, meta (R/CRAN version constraints) -> no benchmark against them.
suppressMessages({library(metafor); library(metadat); library(jsonlite); library(clubSandwich); library(ape)})
CTRL <- list(threshold = 1e-10, tol = 1e-12, maxiter = 2000)
ref <- list(meta = list(R = R.version.string, metafor = as.character(packageVersion("metafor")), clubSandwich = as.character(packageVersion("clubSandwich")), ape = as.character(packageVersion("ape")), generated = format(Sys.time(), "%Y-%m-%d %H:%M:%S %Z")))
nz <- function(x) { x <- as.numeric(x); x[!is.finite(x)] <- NA; x }
getd <- function(measure, ...) { d <- escalc(measure = measure, ...); list(yi = nz(d$yi), vi = nz(d$vi)) }

## ---- datasets (same as v1) -------------------------------------------------------------
bcg <- dat.bcg; sets <- list(
  bcg_RR = getd("RR", ai = bcg$tpos, bi = bcg$tneg, ci = bcg$cpos, di = bcg$cneg),
  raudenbush = list(yi = dat.raudenbush1985$yi, vi = dat.raudenbush1985$vi),
  bangertdrowns = list(yi = dat.bangertdrowns2004$yi, vi = dat.bangertdrowns2004$vi),
  hackshaw = list(yi = dat.hackshaw1998$yi, vi = dat.hackshaw1998$vi),
  normand_SMD = getd("SMD", m1i = dat.normand1999$m1i, sd1i = dat.normand1999$sd1i, n1i = dat.normand1999$n1i, m2i = dat.normand1999$m2i, sd2i = dat.normand1999$sd2i, n2i = dat.normand1999$n2i))
for (n in names(sets)) { ok <- !is.na(sets[[n]]$yi) & !is.na(sets[[n]]$vi); sets[[n]]$yi <- sets[[n]]$yi[ok]; sets[[n]]$vi <- sets[[n]]$vi[ok] }

## ---- trim-and-fill (L0, R0) ------------------------------------------------------------
ref$trimfill <- list()
for (n in names(sets)) {
  y <- sets[[n]]$yi; v <- sets[[n]]$vi; res <- rma(y, v, method = "REML", control = CTRL); e <- list(yi = y, vi = v)
  for (est in c("L0", "R0")) {
    tf <- tryCatch(trimfill(res, estimator = est, control = CTRL), error = function(e) e)
    e[[est]] <- if (inherits(tf, "condition")) list(error = conditionMessage(tf)) else list(k0 = tf$k0, side = tf$side, est = as.numeric(tf$beta), se = tf$se, ci = c(tf$ci.lb, tf$ci.ub), tau2 = tf$tau2, fill = tf$fill, yi_f = as.numeric(tf$yi), vi_f = as.numeric(tf$vi))
  }
  ref$trimfill[[n]] <- e
}

## ---- PET / PEESE (weighted least squares, multiplicative-error SEs as in base lm) -----------
ref$petpeese <- list()
for (n in names(sets)) {
  y <- sets[[n]]$yi; v <- sets[[n]]$vi; sei <- sqrt(v)
  pet <- summary(lm(y ~ sei, weights = 1 / v)); peese <- summary(lm(y ~ v, weights = 1 / v))
  ref$petpeese[[n]] <- list(yi = y, vi = v, pet = list(coef = as.numeric(pet$coefficients[, 1]), se = as.numeric(pet$coefficients[, 2]), p = as.numeric(pet$coefficients[, 4]), df = pet$df[2]),
                            peese = list(coef = as.numeric(peese$coefficients[, 1]), se = as.numeric(peese$coefficients[, 2]), p = as.numeric(peese$coefficients[, 4]), df = peese$df[2]))
}

## ---- CR2 robust variance (clubSandwich) on rma.mv fits ---------------------------------------
kon <- dat.konstantopoulos2011
mv0 <- rma.mv(yi, vi, random = ~ 1 | district/school, data = kon, method = "REML")
ct0 <- coef_test(mv0, vcov = "CR2", cluster = kon$district)
mv1 <- rma.mv(yi, vi, mods = ~ year, random = ~ 1 | district/school, data = kon, method = "REML")
ct1 <- coef_test(mv1, vcov = "CR2", cluster = kon$district)
ref$cr2 <- list(yi = kon$yi, vi = kon$vi, district = kon$district, school = kon$school, year = kon$year,
  intercept = list(beta = ct0$beta, se = ct0$SE, tstat = ct0$tstat, df = ct0$df_Satt, p = ct0$p_Satt, sigma2 = as.numeric(mv0$sigma2)),
  year = list(beta = ct1$beta, se = ct1$SE, tstat = ct1$tstat, df = ct1$df_Satt, p = ct1$p_Satt, sigma2 = as.numeric(mv1$sigma2)))

## ---- multivariate (Berkey 1998): bivariate unstructured random effects --------------------------
b <- dat.berkey1998; Vl <- lapply(split(b[, c("v1i", "v2i")], b$trial), as.matrix); V <- bldiag(Vl)
mvb <- rma.mv(yi, V, mods = ~ 0 + outcome, random = ~ outcome | trial, struct = "UN", data = b, method = "REML")
ref$multivariate <- list(trial = b$trial, outcome = as.character(b$outcome), yi = b$yi, V = lapply(Vl, function(m) as.numeric(m)), beta = as.numeric(mvb$beta), se = mvb$se, tau2 = as.numeric(mvb$tau2), rho = as.numeric(mvb$rho), ll = as.numeric(logLik(mvb)))

## ---- diagnostic test accuracy (bivariate logit sens/spec) on a synthetic table ---------------------
dta <- data.frame(study = 1:8, TP = c(45, 30, 62, 20, 80, 15, 50, 38), FN = c(5, 10, 8, 4, 20, 5, 12, 7), FP = c(8, 6, 15, 3, 30, 2, 9, 12), TN = c(92, 64, 115, 77, 170, 58, 129, 143))
sens <- (dta$TP + 0.5) / (dta$TP + dta$FN + 1); spec <- (dta$TN + 0.5) / (dta$TN + dta$FP + 1)
yi <- c(qlogis(sens), qlogis(spec)); vi <- c(1 / (dta$TP + 0.5) + 1 / (dta$FN + 0.5), 1 / (dta$TN + 0.5) + 1 / (dta$FP + 0.5))
dd <- data.frame(study = rep(dta$study, 2), outcome = factor(rep(c("sens", "spec"), each = 8)), yi = yi, vi = vi)
dd <- dd[order(dd$study, dd$outcome), ]
mvd <- rma.mv(yi, vi, mods = ~ 0 + outcome, random = ~ outcome | study, struct = "UN", data = dd, method = "REML")
ref$dta <- list(table = dta, beta = as.numeric(mvd$beta), se = mvd$se, tau2 = as.numeric(mvd$tau2), rho = as.numeric(mvd$rho), ll = as.numeric(logLik(mvd)),
                sens = plogis(as.numeric(mvd$beta[1])), spec = plogis(as.numeric(mvd$beta[2])))

## ---- network meta-analysis (contrast-based, multi-arm) on Hasselblad (1998) smoking cessation ---------
h <- dat.hasselblad1998[order(dat.hasselblad1998$study, dat.hasselblad1998$id), ]
h$ya <- log((h$xi + 0.5) / (h$ni - h$xi + 0.5)); h$va <- 1 / (h$xi + 0.5) + 1 / (h$ni - h$xi + 0.5)
trts <- c("no_contact", setdiff(unique(as.character(h$trt)), "no_contact"))
rows <- list(); Vblocks <- list(); k <- 0
for (s in unique(h$study)) {
  d <- h[h$study == s, ]; if (nrow(d) < 2) next
  base <- d[1, ]; oth <- d[-1, ]; m <- nrow(oth)
  Vs <- matrix(base$va, m, m); diag(Vs) <- oth$va + base$va
  X <- matrix(0, m, length(trts) - 1, dimnames = list(NULL, trts[-1]))
  for (j in seq_len(m)) { if (as.character(oth$trt[j]) != "no_contact") X[j, as.character(oth$trt[j])] <- 1; if (as.character(base$trt) != "no_contact") X[j, as.character(base$trt)] <- -1 }
  rows[[s]] <- data.frame(study = s, comp = seq_len(m), yi = oth$ya - base$ya, t1 = as.character(base$trt), t2 = as.character(oth$trt)); Vblocks[[s]] <- Vs; ref_X <- X
  rows[[s]] <- cbind(rows[[s]], X)
}
nd <- do.call(rbind, rows); Vn <- bldiag(Vblocks); Xn <- as.matrix(nd[, trts[-1]])
fe <- rma.mv(yi, Vn, mods = Xn, intercept = FALSE, method = "FE", data = nd)
re <- rma.mv(yi, Vn, mods = Xn, intercept = FALSE, random = ~ comp | study, rho = 1 / 2, struct = "CS", method = "REML", data = nd)
ref$nma <- list(arms = h[, c("study", "id", "trt", "xi", "ni")], treatments = trts,
  common = list(beta = as.numeric(fe$beta), se = fe$se, QE = fe$QE, vcov = as.numeric(vcov(fe))),
  random = list(beta = as.numeric(re$beta), se = re$se, tau2 = as.numeric(re$tau2), vcov = as.numeric(vcov(re)), ll = as.numeric(logLik(re))))

## ---- phylogenetic meta-analysis (subset of Moura et al. 2021; Fisher z) ---------------------------------
mo <- dat.moura2021$dat; tr <- dat.moura2021$tree
cnt <- sort(table(mo$species.id), decreasing = TRUE); sp <- names(cnt)[1:25]; sp <- sp[sp %in% tr$tip.label]
sub <- do.call(rbind, lapply(sp, function(s) head(mo[mo$species.id == s, ], 6))); sub$yi <- atanh(sub$ri); sub$vi <- 1 / (sub$ni - 3)
sub <- sub[is.finite(sub$yi) & is.finite(sub$vi), ]; sub$species2 <- sub$species.id; sub$obs <- seq_len(nrow(sub))
tr2 <- keep.tip(tr, unique(sub$species.id)); A <- vcv(tr2, corr = TRUE)
ph <- rma.mv(yi, vi, random = list(~ 1 | species.id, ~ 1 | species2, ~ 1 | obs), R = list(species.id = A), data = sub, method = "REML")
sp_u <- rownames(A)
ref$phylo <- list(yi = sub$yi, vi = sub$vi, species = sub$species.id, species_levels = sp_u, A = lapply(seq_len(nrow(A)), function(i) as.numeric(A[i, ])), beta = as.numeric(ph$beta), se = ph$se, sigma2 = as.numeric(ph$sigma2), ll = as.numeric(logLik(ph)))

## ---- Bayesian normal-normal meta-analysis (flat prior on mu) via numerical integration in R --------------------
byes <- function(y, v, prior = c("halfnormal", "halfcauchy"), scale = 0.5) {
  prior <- match.arg(prior)
  pd <- function(t) if (prior == "halfnormal") 2 * dnorm(t, 0, scale) else 2 / (pi * scale * (1 + (t / scale)^2))
  muhat <- function(t) { w <- 1 / (v + t^2); sum(w * y) / sum(w) }
  sdmu <- function(t) sqrt(1 / sum(1 / (v + t^2)))
  lik <- function(t) { w <- 1 / (v + t^2); sw <- sum(w); mh <- sum(w * y) / sw; exp(-0.5 * sum(log(v + t^2)) - 0.5 * log(sw) - 0.5 * sum(w * (y - mh)^2)) }
  up <- 10
  f <- Vectorize(function(t) pd(t) * lik(t))
  Z <- integrate(f, 0, up, subdivisions = 2000, rel.tol = 1e-10)$value
  post <- function(t) f(t) / Z
  Et <- integrate(function(t) t * post(t), 0, up, subdivisions = 2000, rel.tol = 1e-10)$value
  Et2 <- integrate(function(t) t^2 * post(t), 0, up, subdivisions = 2000, rel.tol = 1e-10)$value
  Em <- integrate(Vectorize(function(t) muhat(t) * post(t)), 0, up, subdivisions = 2000, rel.tol = 1e-10)$value
  Em2 <- integrate(Vectorize(function(t) (sdmu(t)^2 + muhat(t)^2) * post(t)), 0, up, subdivisions = 2000, rel.tol = 1e-10)$value
  cdf_mu <- function(m) integrate(Vectorize(function(t) pnorm(m, muhat(t), sdmu(t)) * post(t)), 0, up, subdivisions = 2000, rel.tol = 1e-10)$value
  q <- function(p) uniroot(function(m) cdf_mu(m) - p, c(-5, 5), tol = 1e-10)$root
  cdf_t <- function(x) integrate(post, 0, x, subdivisions = 2000, rel.tol = 1e-10)$value
  qt_ <- function(p) uniroot(function(x) cdf_t(x) - p, c(1e-8, up), tol = 1e-10)$root
  list(tau_mean = Et, tau_sd = sqrt(Et2 - Et^2), tau_median = qt_(0.5), tau_ci = c(qt_(0.025), qt_(0.975)), mu_mean = Em, mu_sd = sqrt(Em2 - Em^2), mu_ci = c(q(0.025), q(0.975)), mu_median = q(0.5), log_marginal = log(Z))
}
ref$bayes <- list(yi = sets$bcg_RR$yi, vi = sets$bcg_RR$vi, halfnormal_0.5 = byes(sets$bcg_RR$yi, sets$bcg_RR$vi, "halfnormal", 0.5), halfcauchy_0.5 = byes(sets$bcg_RR$yi, sets$bcg_RR$vi, "halfcauchy", 0.5))

## ---- IPD: simulated data, two-stage reference + one-stage lme4 (workflow reference) -----------------------------
set.seed(42); ipd <- do.call(rbind, lapply(1:6, function(s) { n <- 50 + 10 * s; trt <- rep(0:1, length.out = n); b <- rnorm(1, 0.5, 0.2); data.frame(study = s, trt = trt, y = round(rnorm(1, 0, 0.5) + b * trt + rnorm(n), 4)) }))
st <- do.call(rbind, lapply(split(ipd, ipd$study), function(d) { f <- summary(lm(y ~ trt, d)); data.frame(est = f$coefficients["trt", 1], se = f$coefficients["trt", 2], n = nrow(d)) }))
ts <- rma(st$est, st$se^2, method = "REML", control = CTRL)
library(lme4); os <- lmer(y ~ trt + (1 | study) + (0 + trt | study), data = ipd, REML = TRUE)
ref$ipd <- list(data = ipd, two_stage = list(est = st$est, se = st$se, pooled = as.numeric(ts$beta), pooled_se = ts$se, tau2 = ts$tau2),
                one_stage_lme4 = list(fixed = as.numeric(fixef(os)), se = as.numeric(sqrt(diag(vcov(os)))), vc = as.data.frame(VarCorr(os))$vcov))

## ---- rare events: sensitivity to the continuity correction -------------------------------------------------------
nw <- dat.nielweise2007; nw$bi <- nw$n1i - nw$ai; nw$di <- nw$n2i - nw$ci
cc_ref <- list()
for (nm in c("nielweise", "bcg")) {
  A <- if (nm == "nielweise") list(ai = nw$ai, bi = nw$bi, ci = nw$ci, di = nw$di) else list(ai = bcg$tpos, bi = bcg$tneg, ci = bcg$cpos, di = bcg$cneg)
  cc_ref[[nm]] <- list(data = as.data.frame(A))
  for (m in c("OR", "RR")) for (a in c(0.01, 0.1, 0.5, 1)) {
    d <- escalc(measure = m, ai = A$ai, bi = A$bi, ci = A$ci, di = A$di, add = a, to = "only0"); ok <- !is.na(d$yi)
    r <- rma(d$yi[ok], d$vi[ok], method = "REML", control = CTRL); cc_ref[[nm]][[paste0(m, "_", a)]] <- list(est = as.numeric(r$beta), se = r$se, tau2 = r$tau2, k = r$k)
  }
}
ref$cc <- cc_ref

writeLines(toJSON(ref, auto_unbox = TRUE, digits = NA, na = "null", null = "null"), "validation/reference/reference_v04.json")
cat("wrote reference_v04.json\n")
