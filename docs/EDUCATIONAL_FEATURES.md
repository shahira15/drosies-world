# Educational Feature Inventory

Version 1.0.0 (draft). This is an inventory of what the software **provides** (technical functionality). It is not evidence that any feature improves learning. **No formal student learning outcomes have been established**, and none of the age bands, time estimates or objectives below has been piloted with learners.

Legend for "Implementation evidence": **T** = covered by automated tests in this repository; **D** = documented in the repository but not independently tested; **U** = observed in the code only.

## A. Learning activities

| # | Component | Intended age (author's target) | Features | Evidence |
|---|---|---|---|---|
| A1 | **Drosie Genetics Lab** | 5-8 (Little), 9-12 (Junior), 13-17 (Researcher), University | 8 stations; 16 missions (L1-L3, J1-J3, R1-R5, U1-U5) graded from the learner's own simulated data; stock center with 7 real alleles, CyO balancer and one fictional lethal; breeding with seeded sampling; microscope viewer; Punnett workbench; chromosome explorer with map positions; chi-square analysis with p-values and cautious interpretation text; research notebook with print report and CSV export | T (engine, 58 tests); D (missions: scripted run reported in QA report) |
| A2 | **The Secret Fly Lab** - Lab 0 Safety Academy | 5-8 | 7 missions: suit-up PPE choice, PPE explanations, hazard spotting, matching gear to job, safe/unsafe judgement, emergency responses, 8-question challenge with retry variants; gentle hints, never punishes; game badge stated not to be a certification | U, D |
| A3 | The Secret Fly Lab - Lab 1 | 5-8 | 7 missions: find the stereomicroscope, microscope parts, specimen preparation, focus/zoom/light controls, anatomy, male/female comparison, Fly Detective (6 cases, 3 difficulty tiers, 3-level hints) | U, D |
| A4 | **Life Cycle Adventure** | 5-8 | Four chapters (egg, larva, pupa, adult), explore-at-own-pace tasks and facts, short quizzes, sequence challenge, badge, deeper-reading panels | U |
| A5 | **Grow Your Own Fruit Fly** | 5-10 | Six chapters: notebook, food preparation (ingredient roles), culture set-up with temperature choice, time-lapse observation, results, printable/downloadable lab report with simulation disclaimer; no live animals | U, D |
| A6 | **Climbing Challenge** | not stated on page; about 7-12 by content | Predict, observe 10 s, record, repeat 3 times; explanation of negative geotaxis and climbing assays; "this is a simulation" disclaimer; badge | U |
| A7 | **Lab Notebook Academy** | 5-12 (levels up to "Research Apprentice", 9-12) | Eight stations on keeping honest records, printable notebook pages, teacher/parent guide, targeted wrong-answer feedback, hypothesis versus conclusion distinction; stated not a validated electronic lab notebook | U (review fixes recorded in commits) |
| A8 | **Scientific Conference** | 7-12 | Ten chapters: invitation, two pathways (guided simulated experiment or the learner's own project), virtual lab with repeated trials, data graphing (three interactive graphs, truncated-axis demo), abstract studio, poster studio (3 layouts, 5 palettes with computed contrast checks), registration and talk ordering, interactive hall with fictional scientists, silent 60 s practice, audience-question feedback honouring "I don't know yet", reflection, participation certificate, printable outputs, JSON backup | T (about 1,000 assertions in 34 scripts; see TESTING.md) |
| A9 | **Storybook** | 5-8 | 56-page illustrated reader, two-page spread on desktop, single page on small screens, page slider, accessible labels | U (page art excluded from software ZIP) |
| A10 | **Letters from Drosie** | 5-8 | Interactive mailbox; letter(s) with narration by browser speech synthesis or a recorded file if supplied; per-phrase highlighting; sound effects | U |
| A11 | **Discovery Library** | families, teachers | Real research explained for children (e.g. "Moonwalker" neurons), grown-up source panels, a pre/post quiz with anonymous aggregate analytics, embedded video | U |
| A12 | **Reference/hub pages** | all | Fruit Fly Biology facts and references, Life Cycle Activities lesson page, Science Activities hub, Teacher Resources hub | U; SEO checker (static) |

## B. Teacher and caregiver supports

| Feature | Location |
|---|---|
| Genetics Lab K-12 teacher guide, undergraduate instructor guide, 6 printable worksheets with keys, resource hub | `drosie-genetics-lab/docs/`, `teacher/` |
| Secret Fly Lab Teacher Mode (adult-gated) with printables (PPE sheet, checklist, hazard hunt, cards, quizzes A/B, guide), optional pre/post check, unlock/reset | `lab/js/teacher.js` |
| Conference teacher and parent guide (objectives, discussion questions, assessment ideas, privacy and accessibility notes, references) | `conference-teacher-guide.html` |
| Seven printable lesson activity sheets (PDF + ZIP), three DOCX lesson-plan documents (marked draft, to be proofread) | repository root |
| Notebook Academy teacher and parent guide | `lab-notebook-academy.html` |

## C. Assessment-like features (formative only; none is a validated instrument)

- In-activity quizzes and challenges with hints and retry (Secret Fly Lab, Life Cycle, Genetics missions).
- Mission grading from the learner's own simulated data (Genetics Lab).
- Pattern-based writing checks (Conference abstract, poster and "overclaim" detectors; stated to be word-pattern based).
- Optional pre/post checks and quiz analytics. The software itself states that these show nothing about learning gains.
- Certificates and badges are explicitly game or participation artefacts, not accredited.

## D. Inclusion and accessibility features implemented

Keyboard operation, visible focus, skip links, landmarks and headings, ARIA live regions, text alternatives for charts (tables, descriptions), reduced-motion (setting and device preference), high-contrast, larger text, extra spacing and calm-mode options (Fly Lab, Life Cycle), button alternatives to drag-and-drop (Conference), optional browser speech narration, no time pressure in most activities, and print-friendly outputs. See `docs/TESTING.md` for what has and has not been tested.

## E. Privacy-supporting features

No accounts; local-only storage with reset controls; nickname or anonymous participation and a personal-information guard in the Conference; no personal data sent to analytics (as stated in-app; see `docs/REPOSITORY_AUDIT.md` for the exceptions).

## F. Scientific-honesty features

Simulation labelling throughout; fictional content labelled; interpretation text avoids "prove"; the Genetics Lab never states a model is proven and warns on small expected counts; Conference graphs include a misleading-axis demonstration and causation caveats; "temp art" and "stylised diagram" disclosures.

## G. What this inventory does not establish

- No evidence of learning gains, engagement, retention, or equity of benefit.
- No measured reading level (a `reading-load.js` test script exists for the Conference but is an automated word-load check, not a validated readability study).
- No alignment to standards other than the informal NGSS/TEKS mapping in the Genetics Lab teacher guide, which is unreviewed.
- No usability study with children, teachers or learners with disabilities.
