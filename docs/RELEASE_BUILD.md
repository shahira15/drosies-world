# Reproducible Release Build

The release archive is produced by `tools/build_release.py` (Python 3 standard library only, plus `git`).

```bash
git checkout <the release commit>      # clean tree required
python3 tools/build_release.py          # writes release/drosies-world-v1.0.0.zip and release/SHA256SUMS
python3 tools/build_release.py --check  # rebuilds to a temp file and compares bytes with the existing ZIP
python3 tools/build_release.py --list   # show what is included and excluded, with reasons
```

## What makes it deterministic
- File list from `git ls-files`, sorted; only committed files are archived (the script refuses a dirty tracked tree unless `--allow-dirty`).
- Fixed timestamp (2026-11-24 00:00:00), fixed permissions (0644), fixed compression level, files copied byte for byte, single top-level folder `drosies-world-v1.0.0/`.
- `RELEASE_MANIFEST.txt` (SHA-256 of every included file) and `EXCLUDED_FILES.txt` (excluded paths with reasons) are generated inside the archive.
- Compressed bytes depend on the zlib implementation. The same Python/zlib build yields identical ZIP bytes; a different zlib may produce a different ZIP with **identical contents**. Compare `RELEASE_MANIFEST.txt` for content equality across machines.

## What is excluded (and why)
Mascot and storybook artwork, brand marks, portrait photographs, the Canva-made certificate, build outputs, deployment `CNAME`, a stray empty file, and QA screenshots. The authoritative rules are the `EXCLUDE_RULES` list in the script; the generated `EXCLUDED_FILES.txt` lists every file. Changing the rules requires the author's rights decisions (`docs/LICENSING_PROPOSAL.md`).

## Verification record
The build, a second build and a clean-clone build were compared during this release preparation; results are in `docs/RELEASE_READINESS_REPORT.md` §3. The ZIP's SHA-256 is in `release/SHA256SUMS`.

## Limitations
- The archive excludes images that pages reference, so pages show broken-image gaps there. This is intentional.
- The archive is not a deployable website without replacement artwork and the owner's configuration (feedback backend, analytics).
- The release commit is not recorded inside the ZIP (a file cannot contain the hash of the commit that includes it); record the commit hash in the Zenodo notes.
