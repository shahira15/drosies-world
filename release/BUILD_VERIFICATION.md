# Build verification record (v1.0.0, provisional; second pass)

Both archives are built by `python3 tools/build_archive.py` from the repository commit that precedes the commit adding this file (`release/` is excluded from the archives).

| Archive | SHA-256 | Bytes | Entries |
|---|---|---|---|
| `drosies-world-v1.0.0-archival-full.zip` (original illustrations) | `10803be48e10f0d0fb194bdb38ceabc35c1984a5c83e780ecca025d7ff00286b` | 11.3 MB | 336 |
| `drosies-world-v1.0.0-archival-placeholders.zip` (neutral placeholders) | `229a4d398f0309f4984043e316e518efd37aae4ef0c8295f0c521529e6220c3c` | 1.5 MB | 336 |

Checks performed (2026-11-24, Python 3.13, Linux): `unzip -t` passed for both; `--check` rebuild in place byte-identical for both; build from a fresh `git clone` byte-identical for both. Not verified: other operating systems or zlib builds (compressed bytes may differ; compare `RELEASE_MANIFEST.txt`).

Test status of these exact contents is in `docs/TESTING.md`. **Licences are not finalised and the full edition must not be uploaded before the illustrator-agreement scope check.**
