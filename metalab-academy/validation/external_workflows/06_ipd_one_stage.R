# one-stage IPD meta-analysis with a stratified intercept and random treatment effect (lme4 is installable here: this script WAS the reference for the simulated data)
library(lme4); library(metafor)
set.seed(42); ipd <- do.call(rbind, lapply(1:6, function(s) { n <- 50 + 10 * s; trt <- rep(0:1, length.out = n); b <- rnorm(1, 0.5, 0.2); data.frame(study = s, trt = trt, y = round(rnorm(1, 0, 0.5) + b * trt + rnorm(n), 4)) }))
print(summary(lmer(y ~ trt + (1 | study) + (0 + trt | study), data = ipd, REML = TRUE)))
# Pitfalls: keep studies stratified (never pool participants as if from one trial); decide on random vs common residual variance; avoid ecological bias in covariate effects (separate within/between-study effects).
