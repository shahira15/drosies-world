#!/usr/bin/env bash
# Re-generate the R/metafor reference on THIS machine and run the benchmark suite.
# Mac:  brew install --cask r   (or install R from https://cran.r-project.org/)
#       Rscript -e 'install.packages(c("metafor","metadat","jsonlite"))'
# Ubuntu: sudo apt-get install r-base-core r-cran-metafor r-cran-metadat r-cran-jsonlite
set -euo pipefail
cd "$(dirname "$0")/.."
Rscript validation/make_reference.R
python3 -m pytest -q tests/test_validation_r.py
echo "Reference provenance:"; python3 - <<'PY'
import json; print(json.load(open("validation/reference/reference.json"))["meta"])
PY
