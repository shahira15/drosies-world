"""Claim-level verification registry. A lesson statement is only as strong as its row here.
Fields: id, lesson, claim, source_key (-> references.REFS), source_type, locator, examined (abstract/full text/none),
supports_directly (yes/partial/unverified), limitations, verified_on, human_review ('none' until a qualified human signs), status."""
import json
from pathlib import Path
from . import references
_D = Path(__file__).parent
CLAIMS = json.loads((_D / "claims.json").read_text())
CORRECTIONS = json.loads((_D / "corrections.json").read_text())
EXAMINED_OK = ("abstract", "full text", "software output")

def for_lesson(n): return [c for c in CLAIMS if c["lesson"] == n]
def summary():
    return dict(total=len(CLAIMS),
                supported=sum(c["supports_directly"].startswith("yes") for c in CLAIMS),
                partial=sum(c["supports_directly"] == "partial" for c in CLAIMS),
                unverified=sum(c["supports_directly"] == "unverified" for c in CLAIMS),
                human_reviewed=sum(c["human_review"] != "none" for c in CLAIMS))
