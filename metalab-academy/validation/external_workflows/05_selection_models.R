# metafor >= 3.x provides selmodel(); metasens provides Copas/limit meta-analysis. install.packages(c("metafor","metasens"))
library(metafor); library(metadat)
res <- rma(yi, vi, data = dat.hackshaw1998, method = "ML")
print(selmodel(res, type = "halfnorm")); print(selmodel(res, type = "stepfun", steps = 0.025))
# Selection models assume a particular publication process; treat as sensitivity analyses and report several.
