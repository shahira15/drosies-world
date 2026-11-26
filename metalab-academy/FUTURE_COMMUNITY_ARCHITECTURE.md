# Future multi-user / community architecture (design only - NOT implemented)
Nothing here exists today and nothing is simulated.
- **Identity**: email/ORCID sign-in (OAuth) via an auth provider; roles (learner, mentor, moderator, admin); optional ORCID record linking by the user (never scraped).
- **Data**: PostgreSQL; the current `Store` tables already carry `project_id`/`actor`; add `user_id`, row-level permissions (owner/editor/reviewer/viewer), per-project invitations, blinded-reviewer mode.
- **Profiles**: voluntary fields only (discipline, expertise, languages, availability, ORCID); default private; explicit opt-in to be discoverable; delete/export on request.
- **Matching**: transparent criteria (discipline, skills, language, time zone, project stage) shown to both sides; no ranking by hidden scores; never implies availability unless the user set it.
- **Project listings**: question, stage, expected contribution, authorship expectations per ICMJE/CRediT, data-access terms, integrity expectations; moderation queue; ban on authorship-for-pay.
- **Forums/journal clubs/messaging**: moderation tooling, report/block, rate limits, retention policy, no unpublished-data leakage warnings.
- **Safety**: abuse reporting, audit trail, content policy, privacy policy, legal review (GDPR/FERPA as applicable), accessibility audit, security review, expert scientific review board, sustainable hosting costs.
- **Gate**: no public deployment or cost without explicit owner approval.
