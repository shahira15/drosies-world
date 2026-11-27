# install.packages("dosresmeta")  # dose-response meta-analysis (Greenland-Longnecker + two-stage / one-stage)
library(dosresmeta)
# UNVERIFIED sketch: dataset/column names below are from memory of the package vignette and were NOT checked (package unavailable here). Consult ?dosresmeta and the vignette first.
fit <- dosresmeta(formula = logrr ~ dose, type = type, id = id, se = se, cases = cases, n = n, data = alcohol_cvd, covariance = "gl", proc = "2stage")
print(summary(fit)); print(predict(fit, delta = 1))
# Check: dose-response MA requires per-study covariance between non-reference categories (Greenland & Longnecker 1992), spline shape sensitivity and heterogeneity of curves.
