"""Citation formatters: APA 7, MLA 9, Chicago (author-date), BibTeX, RIS, EndNote, CITATION.cff.

Only the storybook is dated (it has a Zenodo record). All other resources are cited as undated
(n.d.) with an access date. `acc=True` inserts access-date tokens ([[ACC:<style>]]) that the /cite/
page fills in with the reader's own access date; `acc=False` (downloadable files, JSON-LD) omits them.
Italics are marked *like this*.
"""
import os
import re
import sys
import yaml

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from resources import *  # noqa: E402,F401,F403


def is_part(r):
    """Pages/documents inside the Drosie's World website (quoted titles in MLA/Chicago)."""
    return r["ris"] in ("ELEC", "GEN") and r["id"] != "platform"


def _pub(r):
    return r.get("publisher") or PUBLISHER


def _illus(r):
    return r.get("illustrator")


def _initials(name):
    return ". ".join(p[0] for p in name.split()) + "."


def apa(r, acc=True):
    extra = []
    if r.get("version"):
        extra.append("Version %s" % r["version"])
    if _illus(r):
        extra.append("%s, Illus." % ("%s %s" % (_initials(_illus(r).split()[0]), _illus(r).split()[-1])))
    ver = " (%s)" % "; ".join(extra) if extra else ""
    pub = "" if r["id"] == "platform" else " %s." % _pub(r)
    date = r["year"] or "n.d."
    tail = ("Retrieved [[ACC:apa]], from %s" % r["url"]) if (acc and not r["year"]) else r["url"]
    return "%s (%s). *%s*%s [%s].%s %s" % (AUTHOR_APA, date, r["title"], ver, r["medium"], pub, tail)


def _site_no_scheme(r):
    return r["url"] if r["doi"] else re.sub(r"^https?://", "", r["url"])


def mla(r, acc=True):
    url = _site_no_scheme(r)
    date = (", %s" % r["year"]) if r["year"] else ""
    access = (" Accessed [[ACC:mla]]." if (acc and not r["year"]) else "")
    if is_part(r):
        return 'Arzoo, Shahira Helal. "%s." *%s*%s, %s.%s' % (r["title"], PUBLISHER, date, url, access)
    if r["id"] == "platform":
        return "Arzoo, Shahira Helal. *%s*. %s.%s" % (r["title"], url, access)
    if r["year"]:
        parts = (["Illustrated by %s" % _illus(r)] if _illus(r) else []) + (["Version %s" % r["version"]] if r.get("version") else []) + [_pub(r), r["year"], url]
        return "Arzoo, Shahira Helal. *%s*. %s.%s" % (r["title"], ", ".join(parts), access)
    return "Arzoo, Shahira Helal. *%s*. %s, %s.%s" % (r["title"], _pub(r), url, access)


def chicago(r, acc=True):
    date = (r["year"] + ".") if r["year"] else "n.d."
    access = (" Accessed [[ACC:chi]]." if (acc and not r["year"]) else "")
    if is_part(r):
        return 'Arzoo, Shahira Helal. %s "%s." %s.%s %s.' % (date, r["title"], PUBLISHER, access, r["url"])
    if r["id"] == "platform":
        return "Arzoo, Shahira Helal. %s *%s*. %s.%s %s." % (date, r["title"], r["medium"], access, r["url"])
    illus = " Illustrated by %s." % _illus(r) if _illus(r) else ""
    ver = " Version %s." % r["version"] if r.get("version") else ""
    return "Arzoo, Shahira Helal. %s *%s*. %s.%s%s %s.%s %s." % (date, r["title"], r["medium"], illus, ver, _pub(r), access, r["url"])


def _bibval(s):
    s = s.replace("\\", "").replace("&", "\\&").replace("%", "\\%").replace("#", "\\#").replace("_", "\\_")
    return s.replace("Letícia", "Let{\\'\\i}cia")


def bib_key(r):
    return "arzoo%s" % re.sub(r"[^a-z0-9]", "", r["id"].lower()) + (r["year"] or "nd")


def bibtex(r, acc=True):
    f = [("author", "Arzoo, Shahira Helal"), ("title", "{%s}" % _bibval(r["title"]))]
    if r["year"]:
        f.append(("year", r["year"]))
    f += [("publisher", _bibval(_pub(r))), ("howpublished", _bibval(r["medium"]))]
    if r.get("version"):
        f.append(("version", r["version"]))
    if r.get("doi"):
        f.append(("doi", r["doi"]))
    f.append(("url", r["url"]))
    if acc and not r["year"]:
        f.append(("urldate", "[[ACC:iso]]"))
    note = ("Illustrated by %s" % _illus(r)) if _illus(r) else ("Undated web resource" if not r["year"] else None)
    if note:
        f.append(("note", _bibval(note)))
    out = "@misc{%s,\n" % bib_key(r)
    return out + ",\n".join("  %-12s = {%s}" % (k, v) for k, v in f) + "\n}"


def ris(r, acc=True):
    L = [("TY", r["ris"]), ("AU", "Arzoo, Shahira Helal"), ("TI", r["title"])]
    if r["year"]:
        L.append(("PY", r["year"]))
    L += [("PB", _pub(r)), ("M3", r["medium"])]
    if r.get("version"):
        L.append(("ET", r["version"]))
    if r.get("doi"):
        L.append(("DO", r["doi"]))
    L.append(("UR", r["url"]))
    if acc and not r["year"]:
        L.append(("Y2", "[[ACC:ris]]"))
    L.append(("AB", r["desc"]))
    if _illus(r):
        L.append(("N1", "Illustrated by %s" % _illus(r)))
    L.append(("ER", ""))
    return "\n".join("%s  - %s" % (k, v) for k, v in L)


ENW_TYPE = {"COMP": "Computer Program", "ELEC": "Web Page", "GEN": "Generic", "BOOK": "Book"}


def endnote(r, acc=True):
    L = [("%0", ENW_TYPE[r["ris"]]), ("%A", "Arzoo, Shahira Helal"), ("%T", r["title"])]
    if r["year"]:
        L.append(("%D", r["year"]))
    L += [("%I", _pub(r)), ("%9", r["medium"])]
    if r.get("version"):
        L.append(("%7", r["version"]))
    if r.get("doi"):
        L.append(("%R", r["doi"]))
    L.append(("%U", r["url"]))
    L.append(("%X", r["desc"]))
    if _illus(r):
        L.append(("%Z", "Illustrated by %s" % _illus(r)))
    return "\n".join("%s %s" % kv for kv in L)


def plain(s):
    return s.replace("*", "")


GEN_MARK = "# Generated by tools/citation/build_cite.py from tools/citation/metadata.json."


def cff_data():
    """CITATION.cff content as a dict, built only from metadata.json (nothing invented)."""
    sw = SOFTWARE
    author = {"family-names": AUTHOR_FAMILY, "given-names": AUTHOR_GIVEN, "affiliation": AFFILIATION}
    if ORCID:
        author["orcid"] = ORCID
    book = BY_ID["storybook"]
    msg = ("If you use Drosie's World in teaching, research or publications, please cite it using the metadata in this file. "
           "Cite individual resources using the formats on %s/cite/." % SITE)
    if not sw.get("doi"):
        msg += " No software DOI is listed yet; the only DOI listed here is for the storybook."
    doc = {"cff-version": "1.2.0", "message": msg, "type": "software",
           "title": sw.get("title") or "Drosie's World",
           "abstract": "Free fruit fly (Drosophila melanogaster) science games, simulations, an illustrated storybook, lesson activity sheets and teacher resources "
                       "for children, families and teachers. This repository contains the source of the drosiesworld.com website.",
           "authors": [author], "repository-code": REPO, "url": SITE + "/",
           "keywords": ["science education", "Drosophila melanogaster", "fruit fly", "educational games", "genetics education", "teacher resources"]}
    if sw.get("version"):
        doc["version"] = sw["version"]
    if sw.get("doi"):
        doc["doi"] = sw["doi"]
    if sw.get("date_released"):
        doc["date-released"] = sw["date_released"]
    if LICENSE:
        doc["license"] = LICENSE
    doc["references"] = [{
        "type": "book", "title": book["title"],
        "authors": [{"family-names": AUTHOR_FAMILY, "given-names": AUTHOR_GIVEN}],
        "year": int(book["year"]), "version": book["version"], "doi": BOOK_DOI,
        "publisher": {"name": book["publisher"]}, "url": "https://doi.org/" + BOOK_DOI,
        "notes": "Illustrated children's storybook, archived on Zenodo. Illustrated by %s." % ILLUSTRATOR}]
    return doc


def cff():
    header = (GEN_MARK + "\n"
              "# Do not hand-edit: edit metadata.json and re-run the script. The generator refuses to overwrite a hand-maintained file\n"
              "# or any DOI, ORCID, version, release date or licence that it does not find in metadata.json.\n")
    return header + yaml.safe_dump(cff_data(), sort_keys=False, allow_unicode=True, width=100)
