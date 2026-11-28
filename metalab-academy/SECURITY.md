# Security and privacy
MetaLab Academy v0.4 is a **local, single-user** app: no accounts, **no network calls from the app or core package** (enforced by a static test), data in one local unencrypted SQLite file. Do not expose the Streamlit port publicly. No professional penetration test has been done.
## Tested safeguards (tests/test_security_privacy.py)
Parameterised SQL (injection strings stored literally) · CSV formula-injection neutralised in all CSV exports · user text escaped in generated SVG/LaTeX · `unsafe_allow_html` only ever receives constant strings (AST test) · import/restore size limits and malformed-file robustness · backup restore validates column names · append-only audit log · AI/LLM/system labels refused for human-only records (extraction, RoB, verification, results) · contact names never enter the audit log (a leak found and fixed during testing) · shareable backup WITHOUT contacts/profile/notes · irreversible project deletion with typed confirmation.
## Dependency audit
`pip-audit -r requirements.txt` on 2026-11-27: no known vulnerabilities (re-run regularly; CI job included). Dependency licences: DEPENDENCIES.md.
## Known limits
- **Coding Lab executes learner code on your machine** (subprocess with time/CPU/memory limits and a temp directory; NOT a sandbox). Never run code you do not understand.
- The audit log is append-only: after deleting a project, earlier audit rows may still mention its title; delete the SQLite file to remove everything.
- No encryption at rest, no authentication, no multi-user permissions (see FUTURE_COMMUNITY_ARCHITECTURE.md before any shared deployment).
- Report vulnerabilities privately to the project owner (contact to be published with the repository).
