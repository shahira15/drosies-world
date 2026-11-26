#!/usr/bin/env bash
# MetaLab Academy launcher. First run: pip install -r requirements.txt
cd "$(dirname "$0")"
python3 -m streamlit run app.py --server.headless true --browser.gatherUsageStats false "$@"
