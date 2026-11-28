#!/usr/bin/env bash
# Re-generate the R/metafor reference on THIS machine and run the benchmark suite.
# Mac:  brew install --cask r   (or install R from https://cran.r-project.org/)
#       Rscript -e 'install.packages(c("metafor","metadat","jsonlite","clubSandwich","ape","lme4"))'
# Ubuntu: sudo apt-get install r-base-core r-cran-metafor r-cran-metadat r-cran-jsonlite
set -euo pipefail
cd "$(dirname "$0")/.."
Rscript validation/make_reference.R
Rscript validation/make_reference_v04.R     # advanced methods II (needs clubSandwich, ape, lme4 too)
python3 -m pytest -q tests/test_validation_r.py tests/test_advanced_r.py tests/test_advanced2_r.py
echo "Reference provenance:"; python3 - <<'PY'
import json; print(json.load(open("validation/reference/reference.json"))["meta"]); print(json.load(open("validation/reference/reference_v04.json"))["meta"])
PY
