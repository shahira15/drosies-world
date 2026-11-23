# Adding the invitation to the Drosie's World homepage

This is optional. Your homepage file is **not** modified by this project; these are copy-and-paste additions.

The file `letter-invite-snippet.html` has two parts. Both are self-contained: styles are prefixed `dl-` and the script is wrapped so it can't touch anything else on the page.

## Part A: "💌 A Little Letter for You" section
**Where:** in your homepage `index.html`, directly **after the section whose heading is "Science belongs to everyone."** That section's message matches the letter's message. Paste the whole `<section class="dl-invite">…</section>` block between the closing `</section>` (or `</div>`) of that section and the opening of the next one.

It shows a small envelope with the wax seal, the heading **A Little Letter for You**, the line *"Psst… Drosie has something special to tell you."* and an **Open My Letter** button linking to `/letters/`.

## Part B: gentle popup (optional)
**Where:** just before the closing `</body>` tag of your homepage.

How it behaves:
- It never appears on page load. It shows only after 25 seconds on the page, or once the visitor has scrolled about halfway.
- It appears **once per browser**. After "Maybe later", × or Esc, it never comes back. It also won't appear for anyone who has already opened the letter, or who clicks any `/letters/` link.
- It sits in the bottom-left corner and is not modal. It doesn't take keyboard focus, doesn't cover your navigation, and doesn't block the page.
- It respects reduced-motion settings.

## A nav link (optional)
If you'd like a menu entry too, add a link wherever your menu items are:
```html
<a href="/letters/">💌 Letters from Drosie</a>
```
