LESSON = dict(
 id=18, title="Quantitative data extraction: what to extract, conversions, and what never to invent",
 time_min=100, version="0.1.0", status="AI-drafted; conversion arithmetic machine-tested; awaiting qualified human expert review", content_type="Established practice with stated assumptions",
 last_verified="2026-11-26 (Wan 2014 verified bibliographically via Crossref - content not examined; arithmetic checked in code)",
 prerequisites=["Modules 4, 27"],
 objectives=["Extract the numbers needed for each effect-size type and record where they came from.","Convert SE, CI and combined groups to SD correctly, and know when conversion is invalid.","Handle medians/IQR/ranges, multiple arms, change scores and missing variance without inventing data.","Label estimated or reconstructed values and plan sensitivity analyses."],
 why="Extraction errors are common and propagate directly into pooled estimates. Many errors are conceptual (SE taken as SD; fly n instead of vial n) rather than typing mistakes.",
 plain="""For a two-group continuous outcome you need: **n, mean, SD per group**, plus identifiers (study, report, experiment), the outcome definition, time point and units. For binary outcomes: **events and n per group**. For adjusted observational estimates: estimate, CI/SE, and what was adjusted for.
Papers often report something *else*: SE instead of SD, a 95% CI, a median with range/IQR, or only a figure. Some of these can be converted with stated assumptions; some cannot. **If it cannot be obtained, record it as missing (with a reason) - never fill it in to make the study usable.**""",
 intermediate="""**SE -> SD:** SD = SE·√n. **CI -> SE:** SE = (upper - lower)/(2·t_crit); with n ≤ ~100 use t(n-1) rather than 1.96 (n=10: t=2.262). Only for *symmetric* intervals on the analysis scale - for ratio measures take logs of the limits first. **Combining two groups** into one (e.g. two treatment arms vs one control): pooled n, mean and SD by the Cochrane formula (the SD includes the between-group term).
**Medians/IQR/range:** methods exist to estimate mean and SD from median, range and/or IQR (e.g. Wan et al. 2014 - bibliographic record verified, content not examined here). They assume roughly normal or specific distributions and can be badly biased for skewed data; treat results as *estimated* and run sensitivity analyses with and without them.
**Figures:** digitise only when necessary (Module 19); record calibration and uncertainty.
**Multiple arms:** never reuse the control n in several comparisons without splitting or modelling (dependence).
**Time points / outcomes:** extract those pre-specified; do not cherry-pick.
**Unit of analysis:** record whether n is flies, vials, plots or classrooms.""",
 advanced="""Reconstruction methods carry model assumptions; the extracted *standard error of the estimate of the SD* can exceed the nominal precision. A sound plan: (1) primary analysis uses reported values; (2) sensitivity analysis adds estimated/reconstructed values; (3) contact authors; (4) report the proportion of values at each uncertainty level. For survival outcomes, reconstructing individual data from published Kaplan-Meier curves needs digitised curves plus numbers at risk; treat as estimated. Document every transformation as a reversible step (raw value preserved, transformed value stored separately with method).""",
 formulas=[dict(name="SE ↔ SD", tex=r"SD=SE\sqrt n,\qquad SE=SD/\sqrt n", symbols={"n":"number of independent units"}),
   dict(name="SE from CI", tex=r"SE=\frac{U-L}{2\,t_{n-1,\,0.975}}", symbols={"U, L":"upper/lower limits","t":"t quantile; z=1.96 for large n"}),
   dict(name="Combine two groups", tex=r"N=n_1+n_2,\ \bar x=\frac{n_1\bar x_1+n_2\bar x_2}{N},\ s^2=\frac{(n_1-1)s_1^2+(n_2-1)s_2^2+\frac{n_1n_2}{N}(\bar x_1-\bar x_2)^2}{N-1}", symbols={"s":"SD"})],
 assumptions=["CI symmetric on the analysis scale.","SE/SD labels in the paper are correct (check methods).","n is the number of independent units contributing to the mean."],
 worked_example="""(a) A paper reports mean 12 ± 0.9 'SE' with n = 16 vials -> SD = 0.9·4 = **3.6**.
(b) A 95% CI of 3.2 to 6.8 with n = 10: SE = 3.6/(2·2.262) = **0.796** (using t with 9 df). Using z = 1.96 instead would give 0.918, an SE about 15% too large; using the right quantile matters most at small n.
(c) Two treatment arms (n=12, mean 5.0, SD 2.0) and (n=30, mean 7.0, SD 3.0) merged: N=42, mean **6.43**, SD **2.88** (not 2.5, the naive average: the between-arm difference adds variance).
Check all three in the Statistics Lab -> Calculators.""",
 examples=[("Preclinical","Lifespan median + range only: estimate or contact authors; label 'estimated'."),("Clinical","Change-from-baseline SD missing: do not borrow without sensitivity analysis."),("Plant","Means from bar charts with SE bars: digitise with calibration, label 'reconstructed'."),("Ecology","Multiple measurements per site: extract the unit stated in the design."),("Microbiology","Values below detection limit: record the censoring, not zero.")],
 mistakes=["Treating SE as SD.","Using fly n instead of vial n.","Replacing missing SD with another study's SD without labelling.","Using a normal CI conversion for small n or ratio measures without log-transform.","Treating 'not reported' as zero.","Extracting only significant outcomes."],
 misconceptions=[("'Estimating the mean from the median is always fine.'","It can be biased for skewed data; run sensitivity analyses."),("'Missing means zero.'","Missing is unknown; record the reason.")],
 controversies=["Acceptability of imputing missing SDs.","Use of reconstruction methods in primary analyses.","Double extraction vs single extraction with verification."],
 decision_tree=[("SD reported?","Yes -> use. No -> SE/CI available? convert with checks."),("Only median/range/IQR?","Estimate with a stated method; label; sensitivity analysis."),("Only a figure?","Digitise; label reconstructed; record uncertainty."),("Nothing usable?","Contact authors; else mark missing (reason) and exclude from the quantitative synthesis.")],
 exercises=["Convert: SE 0.5, n 25 -> SD? 95% CI 10.2-14.6, n 40 -> SE?","Take 3 papers from your topic. For each outcome list what is reported (SD/SE/CI/median) and what conversion would be needed.","Decide what you would do if 6 of 15 studies lack an SD - and how you would report it."],
 coding=dict(r='n <- 16; se <- 0.9; sd <- se*sqrt(n)              # 3.6\nL <- 3.2; U <- 6.8; n2 <- 10\n(U-L)/(2*qt(0.975, n2-1))                      # 0.7957 (t-based SE)\n# combine two groups\nn1<-12; m1<-5; s1<-2; n2<-30; m2<-7; s2<-3; N<-n1+n2\nm<-(n1*m1+n2*m2)/N; s<-sqrt(((n1-1)*s1^2+(n2-1)*s2^2+n1*n2/N*(m1-m2)^2)/(N-1)); c(N,m,s)',
   python='from metalab import stats as S\nprint(S.sd_from_se(0.9, 16), S.se_from_ci(3.2, 6.8, 10), S.combine_groups(12,5.0,2.0,30,7.0,3.0))'),
 integrity="Never fabricate or silently impute data. Every estimated/reconstructed/imputed value carries a label and a method note (enforced by the Extraction tab). Contact authors only with your approval.",
 further=["wan2014","mathes2017","jones2005","hedges1999"],
 application="**First-paper task (Milestone 7):** extract with the form; for every non-reported value choose 'calculated/estimated/reconstructed' and write the method. Re-verify 20% of values with a second person or after a delay.",
 checklist=["Conversions documented","Unit of analysis recorded","Missing values have reasons","Estimated values labelled","20% re-verified"],
 quiz=[
  dict(q="A paper reports mean ± SE = 12 ± 0.9 with n = 16. SD?", opts=["3.6","0.9","0.225","14.4"], ans=0, why="SD = 0.9×√16 = 3.6.", numeric=True),
  dict(q="95% CI 3.2-6.8, n = 10, t-based SE (t₉=2.262)?", opts=["0.796","0.918","1.8","0.36"], ans=0, why="(6.8-3.2)/(2×2.262)=0.7957.", numeric=True),
  dict(q="You find the SD is not reported. What is the best first action?", opts=["Use another study's SD silently.","Check SE/CI, contact authors, and if impossible mark missing with a reason; any imputation is a labelled sensitivity analysis.","Set SD=mean/4.","Exclude the whole review."], ans=1, why="Never invent data; label and test sensitivity."),
  dict(q="Merging two treatment arms (n=12 mean 5 SD 2; n=30 mean 7 SD 3) gives SD...", opts=["2.88","2.5","3.0","2.0"], ans=0, why="The Cochrane formula includes the between-arm term (checked: 2.877).", numeric=True),
  dict(q="'Not reported' should be extracted as...", opts=["0","Missing, with a reason","The mean of other studies","Blank without a note"], ans=1, why="Missing ≠ zero."),
 ])
