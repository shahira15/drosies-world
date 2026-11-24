"""Citation formatters (APA 7, MLA 9, Chicago author-date, BibTeX, RIS, EndNote, CFF)."""
import re
import yaml
from resources import *  # noqa: F401,F403


def is_part(r):
    """True for pages/documents that sit inside the Drosie's World website (quoted titles in MLA/Chicago)."""
    return r["ris"] in ("ELEC", "GEN") and r["id"] != "platform"


def _pub(r):
    return r.get("publisher") or PUBLISHER


def _ver(r):
    return " (Version %s)" % r["version"] if r.get("version") else ""


def apa(r):
    # *x* marks italics.
    pub = "" if r["id"] == "platform" else " %s." % _pub(r)
    return "%s (%s). *%s*%s [%s].%s %s" % (AUTHOR_APA, YEAR, r["title"], _ver(r), r["medium"], pub, r["url"])


def mla(r):
    url = r["url"] if r["doi"] else re.sub(r"^https?://", "", r["url"])
    if is_part(r):
        return 'Arzoo, Shahira Helal. "%s." *%s*, %s, %s.' % (r["title"], PUBLISHER, YEAR, url)
    if r["id"] == "platform":
        return "Arzoo, Shahira Helal. *%s*. %s, %s." % (r["title"], YEAR, url)
    ver = "Version %s, " % r["version"] if r.get("version") else ""
    return "Arzoo, Shahira Helal. *%s*. %s%s, %s, %s." % (r["title"], ver, _pub(r), YEAR, url)


def chicago(r):
    if is_part(r):
        return 'Arzoo, Shahira Helal. %s. "%s." %s. %s.' % (YEAR, r["title"], PUBLISHER, r["url"])
    if r["id"] == "platform":
        return "Arzoo, Shahira Helal. %s. *%s*. %s. %s." % (YEAR, r["title"], r["medium"], r["url"])
    ver = " Version %s." % r["version"] if r.get("version") else ""
    return "Arzoo, Shahira Helal. %s. *%s*. %s.%s %s. %s." % (YEAR, r["title"], r["medium"], ver, _pub(r), r["url"])


def _bibval(s):
    s = s.replace("\\", "").replace("&", "\\&").replace("%", "\\%").replace("#", "\\#").replace("_", "\\_")
    return s.replace("Letícia", "Let{\\'\\i}cia")


def bib_key(r):
    return "arzoo%s%s" % (YEAR, re.sub(r"[^a-z0-9]", "", r["id"].lower()))


def bibtex(r):
    f = [("author", "Arzoo, Shahira Helal"), ("title", "{%s}" % _bibval(r["title"])), ("year", YEAR),
         ("publisher", _bibval(_pub(r))), ("howpublished", _bibval(r["medium"]))]
    if r.get("version"):
        f.append(("version", r["version"]))
    if r.get("doi"):
        f.append(("doi", r["doi"]))
    f.append(("url", r["url"]))
    note = r.get("bibnote") or ("Illustrated by Letícia Cavalcanti" if r["id"] == "storybook" else None)
    if note:
        f.append(("note", _bibval(note)))
    out = "@misc{%s,\n" % bib_key(r)
    out += ",\n".join("  %-12s = {%s}" % (k, v) for k, v in f)
    return out + "\n}"


def ris(r):
    L = [("TY", r["ris"]), ("AU", "Arzoo, Shahira Helal"), ("TI", r["title"]), ("PY", YEAR),
         ("PB", _pub(r)), ("M3", r["medium"])]
    if r.get("version"):
        L.append(("ET", r["version"]))
    if r.get("doi"):
        L.append(("DO", r["doi"]))
    L.append(("UR", r["url"]))
    L.append(("AB", r["desc"]))
    if r["id"] == "storybook":
        L.append(("N1", "Illustrated by Letícia Cavalcanti"))
    L.append(("ER", ""))
    return "\n".join("%s  - %s" % (k, v) for k, v in L)


ENW_TYPE = {"COMP": "Computer Program", "ELEC": "Web Page", "GEN": "Generic", "BOOK": "Book"}


def endnote(r):
    L = [("%0", ENW_TYPE[r["ris"]]), ("%A", "Arzoo, Shahira Helal"), ("%T", r["title"]), ("%D", YEAR),
         ("%I", _pub(r)), ("%9", r["medium"])]
    if r.get("version"):
        L.append(("%7", r["version"]))
    if r.get("doi"):
        L.append(("%R", r["doi"]))
    L.append(("%U", r["url"]))
    L.append(("%X", r["desc"]))
    return "\n".join("%s %s" % kv for kv in L)


def plain(s):
    return s.replace("*", "")


def cff():
    ref = BY_ID["storybook"]
    doc = {
        "cff-version": "1.2.0",
        "message": "If you use Drosie's World in teaching, research or publications, please cite it using the metadata in this file. "
                   "Cite individual resources using the formats on https://drosiesworld.com/cite/. "
                   "No software DOI is listed yet; the only DOI listed here is for the storybook.",
        "type": "software",
        "title": "Drosie's World",
        "abstract": "Free fruit fly (Drosophila melanogaster) science games, simulations, an illustrated storybook, lesson activity sheets and teacher resources for children, families and teachers. "
                    "This repository contains the source of the drosiesworld.com website.",
        "authors": [{"family-names": AUTHOR_FAMILY, "given-names": AUTHOR_GIVEN, "affiliation": AFFILIATION}],
        "repository-code": REPO,
        "url": SITE + "/",
        "keywords": ["science education", "Drosophila melanogaster", "fruit fly", "educational games", "genetics education", "teacher resources"],
        "references": [{
            "type": "book",
            "title": ref["title"],
            "authors": [{"family-names": AUTHOR_FAMILY, "given-names": AUTHOR_GIVEN}],
            "year": int(YEAR),
            "version": ref["version"],
            "doi": BOOK_DOI,
            "publisher": {"name": "Zenodo"},
            "url": "https://doi.org/" + BOOK_DOI,
            "notes": "Illustrated children's storybook, archived on Zenodo.",
        }],
    }
    header = ("# CITATION.cff for Drosie's World (https://citation-file-format.github.io/).\n"
              "# Generated by tools/citation/build_cite.py. Edit tools/citation/resources.py, then re-run the script.\n"
              "# Intentionally omitted until they exist and are verified: a software DOI, release version, release date,\n"
              "# ORCID and license. Do not add placeholders for them.\n")
    return header + yaml.safe_dump(doc, sort_keys=False, allow_unicode=True, width=100)
