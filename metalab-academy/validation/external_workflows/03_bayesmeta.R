# install.packages(c("bayesmeta","metafor","metadat"))
library(bayesmeta); library(metafor)
d <- escalc("RR", ai = tpos, bi = tneg, ci = cpos, di = cneg, data = dat.bcg)
b <- bayesmeta(y = d$yi, sigma = sqrt(d$vi), tau.prior = function(t) dhalfnormal(t, scale = 0.5), mu.prior = NULL)   # improper flat prior on mu
print(b$summary); print(b$summary["median", ]); 
# MetaLab bayes_meta(halfnormal, 0.5) from independent R quadrature: tau median 0.554 (95% CrI 0.346-0.902); mu median -0.709 (-1.091, -0.347)
