# Security policy
MetaLab Academy v0.2 is a **local, single-user** application: no accounts, no network calls from the app, data in one local SQLite file (unencrypted). Do not expose the Streamlit port publicly. No security audit has been performed; dependency vulnerability scanning is not yet automated.
**Report a vulnerability**: privately to the project owner (contact to be published with the repository); do not file public issues with exploit details.
Design notes: parameterised SQL; backup restore validates column names against the schema (tested); append-only audit log via triggers; AI/LLM labels cannot be recorded as reviewers/extractors; contact details are never copied to the audit log.
Before any multi-user/public deployment: authentication, authorisation, input/file validation, rate limiting, encrypted storage/backups, privacy policy, moderation and abuse reporting, dependency scanning, penetration test - see FUTURE_COMMUNITY_ARCHITECTURE.md.
