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
