# install.packages("mada")
library(mada)
TP <- c(70,95,106,160,55,127,118,107,96,40,67,65); FN <- c(12,5,26,25,17,57,73,39,45,10,6,3)
FP <- c(42,32,24,13,25,24,27,23,29,12,13,16); TN <- c(258,171,302,226,285,373,175,306,350,136,276,104)   # SYNTHETIC table
fit <- reitsma(data.frame(TP, FN, FP, TN), correction = 0.5, correction.control = "all"); print(summary(fit))
# metafor rma.mv reference (reference_v04.json): sens = 0.8130, spec = 0.9104, tau2 = 0.4869/0.1427, rho = -0.316
