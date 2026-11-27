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


# ---- v0.4 example data (published example datasets from the R package metadat; SYNTHETIC where stated)
# Hasselblad (1998) smoking-cessation network: (study, treatment, quitters, n)
HASSELBLAD = [(1, 'no_contact', 75, 731), (1, 'ind_counseling', 363, 714), (2, 'no_contact', 9, 140), (2, 'ind_counseling', 23, 140), (2, 'grp_counseling', 10, 138), (3, 'no_contact', 2, 106), (3, 'ind_counseling', 9, 205), (4, 'no_contact', 58, 549), (4, 'ind_counseling', 237, 1561), (5, 'no_contact', 0, 33), (5, 'ind_counseling', 9, 48), (6, 'self_help', 20, 49), (6, 'ind_counseling', 16, 43), (7, 'no_contact', 3, 100), (7, 'ind_counseling', 31, 98), (8, 'no_contact', 1, 31), (8, 'ind_counseling', 26, 95), (9, 'self_help', 11, 78), (9, 'ind_counseling', 12, 85), (9, 'grp_counseling', 29, 170), (10, 'no_contact', 6, 39), (10, 'ind_counseling', 17, 77), (11, 'no_contact', 79, 702), (11, 'self_help', 77, 694), (12, 'no_contact', 18, 671), (12, 'self_help', 21, 535), (13, 'no_contact', 64, 642), (13, 'ind_counseling', 107, 761), (14, 'ind_counseling', 12, 76), (14, 'grp_counseling', 20, 74), (15, 'ind_counseling', 9, 55), (15, 'grp_counseling', 3, 26), (16, 'self_help', 7, 66), (16, 'grp_counseling', 32, 127), (17, 'no_contact', 5, 62), (17, 'ind_counseling', 8, 90), (18, 'no_contact', 20, 234), (18, 'ind_counseling', 34, 237), (19, 'no_contact', 0, 20), (19, 'grp_counseling', 9, 20), (20, 'no_contact', 8, 116), (20, 'self_help', 19, 149), (21, 'no_contact', 95, 1107), (21, 'ind_counseling', 143, 1031), (22, 'no_contact', 15, 187), (22, 'ind_counseling', 36, 504), (23, 'no_contact', 78, 584), (23, 'ind_counseling', 73, 675), (24, 'no_contact', 69, 1177), (24, 'ind_counseling', 54, 888)]
# Berkey et al. (1998) periodontal trials, 2 outcomes per trial: AL (attachment level), PD (probing depth): yi and 2x2 within-trial covariance (metadat dat.berkey1998)
BERKEY_TRIAL = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5]
BERKEY_OUTCOME = ['PD', 'AL', 'PD', 'AL', 'PD', 'AL', 'PD', 'AL', 'PD', 'AL']
BERKEY_YI = [0.47, -0.32, 0.2, -0.6, 0.4, -0.12, 0.26, -0.31, 0.56, -0.39]
BERKEY_V = {1: [[0.0075, 0.003], [0.003, 0.0077]], 2: [[0.0057, 0.0009], [0.0009, 0.0008]], 3: [[0.0021, 0.0007], [0.0007, 0.0014]], 4: [[0.0029, 0.0009], [0.0009, 0.0015]], 5: [[0.0148, 0.0072], [0.0072, 0.0304]]}
# SYNTHETIC diagnostic-accuracy teaching table (simulated with seed 1; NOT real studies): TP, FN, FP, TN
DTA_SYNTHETIC = [(70, 12, 42, 258), (95, 5, 32, 171), (106, 26, 24, 302), (160, 25, 13, 226), (55, 17, 25, 285), (127, 57, 24, 373), (118, 73, 27, 175), (107, 39, 23, 306), (96, 45, 29, 350), (40, 10, 12, 136), (67, 6, 13, 276), (65, 3, 16, 104)]
