"""Reference registry. `verified` entries were checked against PubMed record
metadata (title/authors/journal/DOI) on the date given. Nothing else is claimed."""
VERIFIED_ON = "2026-11-26"
SOURCE = "PubMed (NCBI) record metadata"

REFS = {
 "page2021": dict(cite="Page MJ, McKenzie JE, Bossuyt PM, et al. The PRISMA 2020 statement: an updated guideline for reporting systematic reviews. BMJ 2021;372:n71.", doi="10.1136/bmj.n71", pmid="33782057"),
 "page2021ee": dict(cite="Page MJ, Moher D, Bossuyt PM, et al. PRISMA 2020 explanation and elaboration. BMJ 2021;372:n160.", doi="10.1136/bmj.n160", pmid="33781993"),
 "munn2018": dict(cite="Munn Z, Peters MDJ, Stern C, et al. Systematic review or scoping review? BMC Med Res Methodol 2018;18:143.", doi="10.1186/s12874-018-0611-x", pmid="30453902"),
 "tricco2018": dict(cite="Tricco AC, Lillie E, Zarin W, et al. PRISMA Extension for Scoping Reviews (PRISMA-ScR). Ann Intern Med 2018;169:467-473.", doi="10.7326/M18-0850", pmid="30178033"),
 "campbell2020": dict(cite="Campbell M, McKenzie JE, Sowden A, et al. Synthesis without meta-analysis (SWiM) in systematic reviews: reporting guideline. BMJ 2020;368:l6890.", doi="10.1136/bmj.l6890", pmid="31948937"),
 "schardt2007": dict(cite="Schardt C, Adams MB, Owens T, et al. Utilization of the PICO framework to improve searching PubMed for clinical questions. BMC Med Inform Decis Mak 2007;7:16.", doi="10.1186/1472-6947-7-16", pmid="17573961"),
 "higgins2002": dict(cite="Higgins JPT, Thompson SG. Quantifying heterogeneity in a meta-analysis. Stat Med 2002;21:1539-1558.", doi="10.1002/sim.1186", pmid="12111919"),
 "rucker2008": dict(cite="Rücker G, Schwarzer G, Carpenter JR, Schumacher M. Undue reliance on I2 in assessing heterogeneity may mislead. BMC Med Res Methodol 2008;8:79.", doi="10.1186/1471-2288-8-79", pmid="19036172"),
 "borenstein2010": dict(cite="Borenstein M, Hedges LV, Higgins JPT, Rothstein HR. A basic introduction to fixed-effect and random-effects models for meta-analysis. Res Synth Methods 2010;1:97-111.", doi="10.1002/jrsm.12", pmid="26061376"),
 "riley2011": dict(cite="Riley RD, Higgins JPT, Deeks JJ. Interpretation of random effects meta-analyses. BMJ 2011;342:d549.", doi="10.1136/bmj.d549", pmid="21310794"),
 "hartung2001": dict(cite="Hartung J, Knapp G. A refined method for the meta-analysis of controlled clinical trials with binary outcome. Stat Med 2001;20:3875-3889.", doi="10.1002/sim.1009", pmid="11782040"),
 "veroniki2016": dict(cite="Veroniki AA, Jackson D, Viechtbauer W, et al. Methods to estimate the between-study variance and its uncertainty in meta-analysis. Res Synth Methods 2016;7:55-79.", doi="10.1002/jrsm.1164", pmid="26332144"),
 "langan2019": dict(cite="Langan D, Higgins JPT, Jackson D, et al. A comparison of heterogeneity variance estimators in simulated random-effects meta-analyses. Res Synth Methods 2019;10:83-98.", doi="10.1002/jrsm.1316", pmid="30067315"),
 "guyatt2008": dict(cite="Guyatt GH, Oxman AD, Vist GE, et al. GRADE: an emerging consensus on rating quality of evidence and strength of recommendations. BMJ 2008;336:924-926.", doi="10.1136/bmj.39489.470347.AD", pmid="18436948"),
 "colditz1994": dict(cite="Colditz GA, Brewer TF, Berkey CS, et al. Efficacy of BCG vaccine in the prevention of tuberculosis. JAMA 1994;271:698-702.", doi=None, pmid="8309034"),
}
for r in REFS.values():
    r.update(verified=True, verified_on=VERIFIED_ON, verified_via=SOURCE)

import json as _json
from pathlib import Path as _P
_extra = _P(__file__).with_name("refs_verified.json")
if _extra.exists():
    for _k, _v in _json.loads(_extra.read_text()).items():
        _auth = _v["first_author"] + (" et al." if _v["n_authors"] > 1 else "")
        _loc = ", ".join(x for x in [_v["volume"], _v["pages"]] if x)
        REFS[_k] = dict(cite=f"{_auth} {_v['title']}. {_v['journal']} {_v['year']}" + (f";{_loc}" if _loc else "") + ".",
                        doi=_v["doi"], pmid=_v.get("pmid"), verified=True, verified_on=_v["verified_on"],
                        verified_via=_v["verified_via"], verification=_v["verification"])
for _r in REFS.values():
    _r.setdefault("verification", "bibliographic")


def link(key):
    r = REFS[key]
    url = f"https://doi.org/{r['doi']}" if r["doi"] else f"https://pubmed.ncbi.nlm.nih.gov/{r['pmid']}/"
    return f"{r['cite']} [{'DOI' if r['doi'] else 'PubMed'}]({url})" + (f" · PMID {r['pmid']}" if r.get("pmid") else "")
