# Build verification record (v1.0.0, provisional)

Built from commit content of branch `claude/ecstatic-planck-jl44t9` at the commit "Build script: ignore release/ outputs in the clean-tree check" (see git log). The ZIP excludes `release/`, so adding this folder to the repository does not change it.

| Item | Value |
|---|---|
| Archive | `release/drosies-world-v1.0.0.zip` |
| SHA-256 | `59b906160cf65fa9b61a9cb35e1346c38889198683e7404db9ce366a704b98eb` (also in `SHA256SUMS`) |
| Size | 1078433 bytes |
| Entries | 228 (226 repository files + `RELEASE_MANIFEST.txt` + `EXCLUDED_FILES.txt`) |
| Excluded from archive | 176 repository files (artwork, portraits, certificate, screenshots, CNAME, stray files) |
| Raster images in archive | 0 |
| `unzip -t` integrity | passed |
| Rebuild in same working tree (`--check`) | byte-identical |
| Rebuild from a fresh `git clone` at the same commit | byte-identical (same SHA-256) |
| Environment | Python 3.13, Linux; compressed bytes may differ with another zlib build, contents will not (compare `RELEASE_MANIFEST.txt`) |

Not verified: that the ZIP was rebuilt on a different operating system or Python version; that the archive runs as a website (it intentionally omits images).
