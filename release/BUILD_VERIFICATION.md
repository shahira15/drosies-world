# Build verification record (v1.0.0, provisional)

Built from commit content of branch `claude/ecstatic-planck-jl44t9` after commit "Prepare v1.0.0 scholarly software release documentation (draft)". The ZIP excludes `release/`, so adding this folder to the repository does not change it.

| Item | Value |
|---|---|
| Archive | `release/drosies-world-v1.0.0.zip` |
| SHA-256 | `35215d9884c9315e3faf37b5de5a21a7088103b176474151407d449a74823c01` (also in `SHA256SUMS`) |
| Size | 1,078,363 bytes |
| Entries | 228 (226 repository files + `RELEASE_MANIFEST.txt` + `EXCLUDED_FILES.txt`) |
| Excluded from archive | 176 repository files (artwork, portraits, certificate, screenshots, CNAME, stray files) |
| Raster images in archive | 0 |
| `unzip -t` integrity | passed |
| Rebuild in same working tree (`--check`) | byte-identical |
| Rebuild from a fresh `git clone` at the same commit | byte-identical (same SHA-256) |
| Environment | Python 3.13, Linux; compressed bytes may differ with another zlib build, contents will not (compare `RELEASE_MANIFEST.txt`) |

Not verified: that the ZIP was rebuilt on a different operating system or Python version; that the archive runs as a website (it intentionally omits images).
