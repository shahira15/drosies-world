# External R workflows (to run on YOUR machine)
These scripts compare MetaLab output with the field-standard packages that could not be installed in the build sandbox (R 4.3.3; CRAN needs newer R for these).
**They were NOT executed by the developer** (that is the point: the packages were unavailable). Status of the corresponding features: `requires_external_validation`.
Run: `Rscript validation/external_workflows/01_netmeta.R` etc. (install packages first: see each header). Compare the printed values with the MetaLab Statistics Lab / `tests/test_advanced2_r.py` references; report mismatches as issues.
