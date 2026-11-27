# install.packages(c("netmeta","metadat","jsonlite"))
suppressMessages({library(netmeta); library(metadat)})
d <- dat.hasselblad1998
pw <- pairwise(treat = trt, event = xi, n = ni, studlab = study, data = d, sm = "OR", incr = 0.5, addincr = TRUE)   # 0.5 added to ALL cells (as in MetaLab)
nm <- netmeta(pw, reference.group = "no_contact", common = TRUE, random = TRUE, method.tau = "REML")
print(nm$TE.random[, "no_contact"]); cat("tau2 =", nm$tau^2, "\n"); print(netrank(nm, small.values = "undesirable"))
print(decomp.design(nm)); print(netsplit(nm))
# MetaLab (tests/test_advanced2_r.py) random-effects log OR vs no_contact: ind 0.686, grp 0.844, self 0.389 (tau2 0.432) from metafor rma.mv; netmeta may differ slightly in tau2 estimator details.
