# Citation hub tests

```
python3 tests/citation/validate.py            # static: links, anchors, JSON-LD, bibliography files, CITATION.cff, sitemap, honesty guards
python3 -m http.server 8123 &                 # then:
AXE_PATH=path/to/axe.min.js node tests/citation/browser.js   # tabs, copy buttons, keyboard, mobile layout, axe-core
```

`validate.py` runs `cffconvert --validate` when `cffconvert` is on the PATH (`pip install cffconvert`).
External links are listed but never fetched. Regenerate everything with `python3 tools/citation/build_cite.py`.
