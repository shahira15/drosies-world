"""16-week 'My First Meta-Analysis Paper' plan (5-7 h/week). Tasks are generic
research actions; none presumes a topic or a result. Gates require human sign-off."""
WEEKS = [
 (1, "Foundations & topic exploration", "Foundations", [
   ("w1a", "Complete Module 3 lesson + quiz (>=80%)", 75, "learn"),
   ("w1b", "List 3-5 candidate topics (the platform's candidates are ideas, not verified gaps)", 60, "research"),
   ("w1c", "Create your real project in the Research Workspace", 20, "research")]),
 (2, "Foundations & topic exploration", "Foundations", [
   ("w2a", "Complete Module 4 lesson + quiz; fill Question Builder for each candidate", 120, "learn"),
   ("w2b", "Preliminary look (not yet a formal search) at how many studies exist per candidate; record counts and sources honestly", 90, "research")]),
 (3, "Novelty, feasibility, protocol", "Protocol", [
   ("w3a", "Search for existing systematic reviews and registered protocols on top 2 candidates; log every search in the Search Log", 150, "research"),
   ("w3b", "Write novelty assessment with evidence for each claim (no 'first review' without documented searches)", 90, "research")]),
 (4, "Novelty, feasibility, protocol", "Protocol", [
   ("w4a", "Feasibility check: are variance/n reportable? what is the experimental unit? Choose ONE topic (your decision - log it)", 120, "research"),
   ("w4b", "Draft protocol: question, eligibility, outcomes, planned model (Module 32 application task)", 180, "deliverable"),
   ("w4c", "GATE: Review protocol with a mentor/statistician if possible; decide on registration venue after reading its current rules", 30, "gate")]),
 (5, "Search & screening", "Search", [
   ("w5a", "Build database-specific searches; run them yourself; log date, query, count; save raw exports", 240, "research")]),
 (6, "Search & screening", "Screening", [
   ("w6a", "Import records, deduplicate (check merges), calibrate eligibility on 20-50 records", 120, "research"),
   ("w6b", "Title/abstract screening (single reviewer unless collaborators exist - document limitation)", 200, "research"),
   ("w6c", "GATE: PRISMA counts consistent, no missing exclusion reasons", 20, "gate")]),
 (7, "Extraction & risk of bias", "Extraction", [
   ("w7a", "Full-text screening with documented exclusion reasons", 240, "research"),
   ("w7b", "Design extraction form; pilot on 3 studies; record source page/table for every value", 120, "research")]),
 (8, "Extraction & risk of bias", "Extraction", [
   ("w8a", "Extract all included studies (provenance for each value)", 300, "research")]),
 (9, "Extraction & risk of bias", "Risk of bias", [
   ("w9a", "Choose an appropriate RoB tool for your design (e.g. SYRCLE for animal intervention studies - confirm suitability)", 60, "research"),
   ("w9b", "Assess risk of bias; re-verify 20% of extracted values", 240, "research"),
   ("w9c", "GATE: unresolved data queries listed; author contacts sent only after your approval", 20, "gate")]),
 (10, "Effect sizes & primary analysis", "Analysis", [
   ("w10a", "Compute effect sizes with calculators; check units, direction, dependence (shared controls, repeated outcomes)", 240, "research")]),
 (11, "Effect sizes & primary analysis", "Analysis", [
   ("w11a", "Run pre-specified primary model; save code + versions; compare against R/metafor", 240, "research")]),
 (12, "Heterogeneity, robustness, interpretation", "Analysis", [
   ("w12a", "Report tau², Q, I², prediction interval; pre-specified subgroups/meta-regression only", 180, "research")]),
 (13, "Heterogeneity, robustness, interpretation", "Analysis", [
   ("w13a", "Sensitivity (leave-one-out, alt. estimator); publication-bias assessment with caveats; certainty assessment", 240, "research"),
   ("w13b", "GATE: every conclusion traceable to a verified result", 20, "gate")]),
 (14, "Manuscript & submission prep", "Writing", [
   ("w14a", "Draft Methods + Results from verified outputs only; PRISMA checklist", 300, "deliverable")]),
 (15, "Manuscript & submission prep", "Writing", [
   ("w15a", "Draft Introduction/Discussion/Limitations; figures; supplements", 300, "deliverable")]),
 (16, "Manuscript & submission prep", "Writing", [
   ("w16a", "Reproducibility package; journal fit check from official journal pages; AI-use disclosure; co-author review", 240, "deliverable"),
   ("w16b", "GATE: YOU decide whether and where to submit. The platform never submits.", 15, "gate")]),
]
def all_tasks():
    return [(w, title, phase, k, label, mins, kind) for (w, title, phase, ts) in WEEKS for (k, label, mins, kind) in ts]
