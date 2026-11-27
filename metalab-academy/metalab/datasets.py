"""Published example datasets. BCG: Colditz et al. 1994 (JAMA 271:698), as distributed with R package metafor (dat.bcg). Columns: tpos, tneg, cpos, cneg."""
BCG = [(4,119,11,128),(6,300,29,274),(3,228,11,209),(62,13536,248,12619),
       (33,5036,47,5761),(180,1361,372,1079),(8,2537,10,619),(505,87886,499,87892),
       (29,7470,45,7232),(17,1699,65,1600),(186,50448,141,27197),(5,2493,3,2338),
       (27,16886,29,17825)]  # tpos, tneg, cpos, cneg
# Moderators for dat.bcg (metadat): allocation method and absolute latitude, same trial order.
# Values taken from the R export (validation/reference/reference.json) and asserted equal in tests/test_validation_r.py.
BCG_ALLOC = ["random", "random", "random", "random", "alternate", "alternate", "random", "random", "random", "systematic", "systematic", "systematic", "systematic"]
BCG_ABLAT = [44,55,42,52,13,44,19,13,27,42,18,33,33]
BCG_MODERATORS = {"alloc": BCG_ALLOC, "ablat": BCG_ABLAT}

# Konstantopoulos (2011) multisite trial data as distributed in metadat::dat.konstantopoulos2011 (56 school-level effects in 11 districts).
# Values copied from the R export (validation/reference/reference.json) and asserted equal in tests/test_advanced_r.py.
KON_YI = [-0.18, -0.22, 0.23, -0.3, 0.13, -0.26, 0.19, 0.32, 0.45, 0.38, 0.29, 0.16, 0.65, 0.36, 0.6, 0.08, 0.04, 0.19, -0.06, -0.18, 0, 0, -0.28, -0.04, -0.3, 0.07, 0, 0.05, -0.08, -0.09, 0.3, 0.98, 1.19, -0.07, -0.05, -0.01, 0.02, -0.03, 0, 0.01, -0.1, 0.5, 0.66, 0.2, 0, 0.05, 0.07, -0.52, 0.7, -0.03, 0.27, -0.34, 0.12, 0.61, 0.04, -0.05]
KON_VI = [0.118, 0.118, 0.144, 0.144, 0.014, 0.014, 0.015, 0.024, 0.023, 0.043, 0.012, 0.02, 0.004, 0.004, 0.007, 0.019, 0.007, 0.005, 0.004, 0.02, 0.018, 0.019, 0.022, 0.02, 0.021, 0.006, 0.007, 0.007, 0.007, 0.007, 0.015, 0.011, 0.01, 0.001, 0.001, 0.001, 0.001, 0.001, 0.001, 0.001, 0.001, 0.01, 0.011, 0.01, 0.009, 0.013, 0.013, 0.031, 0.031, 0.03, 0.03, 0.03, 0.087, 0.082, 0.067, 0.067]
KON_DISTRICT = [11, 11, 11, 11, 12, 12, 12, 12, 18, 18, 18, 27, 27, 27, 27, 56, 56, 56, 56, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 71, 71, 71, 86, 86, 86, 86, 86, 86, 86, 86, 91, 91, 91, 91, 91, 91, 108, 108, 108, 108, 108, 644, 644, 644, 644]
