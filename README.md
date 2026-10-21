# Drosie’s World — free website starter

This is a complete static website (HTML, CSS, JavaScript, SVG) that works on phones, tablets, and desktops. It has no paid dependencies, database, signup system, or build step.

## What is included

- `index.html` — home page, book section, seven lesson cards, activity library, and About section.
- `styles.css` — colors, layout, responsive design, and typography.
- `script.js` — mobile menu, live lesson search, and share button.
- `assets/drosie-mascot.svg` — an original temporary cartoon illustration; **replace with your approved book artwork** before launch.
- `resources/lesson-1-activity-sheet.pdf` through `lesson-7-activity-sheet.pdf` — seven printable student activities, each with a short teacher mini-guide.
- `resources/all-activity-sheets.zip` — all seven activity PDFs together.
- Existing editable Word lesson guides for Lesson 2 and Lessons 3–7. These are draft educator materials and should be proofread before public release.

## IMPORTANT: Add your actual storybook

**The final storybook PDF was not provided.** The site intentionally says **coming soon** rather than offering a fake or broken book download.

1. Export your finished book from Canva as a PDF, ensuring that you have the right to publish all illustrations and text.
2. Rename the file `drosie-the-fruit-fly.pdf` and put it in `resources/`.
3. Open `index.html` in a text editor and locate `<div class="book-download" id="bookDownload">`.
4. Replace that whole block (up to its closing `</div>`) with:

```html
<div class="book-download" id="bookDownload">
  <div><strong>Read Drosie, the Fruit Fly</strong><p>Download the free digital storybook PDF.</p></div>
  <a class="button button-dark" href="resources/drosie-the-fruit-fly.pdf" download>Download the free book ↓</a>
</div>
```

5. Replace `assets/drosie-mascot.svg` and the book-cover design with artwork from your approved illustrator files, if desired. Ensure you have rights to publish the artwork.

## Publish for free with GitHub Pages

1. Create a free account at https://github.com/.
2. Create a new **public** repository named `drosies-world` (or another available name).
3. Select **Add file → Upload files**, then upload the **contents of this folder** (not the outer folder). Keep `index.html` in the repository root. You may need to upload folders/files in batches.
4. Select **Commit changes**.
5. Open the repository **Settings → Pages**.
6. Under **Build and deployment**, choose **Deploy from a branch**, select branch `main` and folder `/(root)`, and save.
7. GitHub will display the website address once publishing completes. It will resemble `https://YOUR-USERNAME.github.io/drosies-world/`.
8. Open the website and test the lesson PDFs, ZIP download, search, and mobile navigation.

The URL is only an example. No live site or GitHub repository has been created on your behalf.

### Updating resources later

In your repository, upload a replacement PDF using the same filename and commit the change. For a new filename, also update the corresponding `href` in `index.html`. Changes appear after GitHub Pages finishes deploying.

## Preview on your computer

Double-click `index.html`. Basic navigation and downloads work locally. For a local development server (optional), run `python -m http.server 8000` inside the website folder, then open `http://localhost:8000`.

## Customize

- Site title, author bio, and wording: edit `index.html`.
- Colors: edit `:root` values at the top of `styles.css`.
- Lessons: update the seven `<article class="lesson-card">` elements in `index.html`.
- Site mascot: replace `assets/drosie-mascot.svg` with your illustration and adjust the two image references in `index.html`.
- To use your own fonts or remove external font requests, remove the Google Fonts `@import` line from `styles.css`; local fallback fonts are already included.

## Privacy, accessibility, and permissions

The site does not collect personal information, use analytics, or require an account. All downloads are public. The optional share button uses your browser’s native share feature or clipboard when available. Avoid uploading children's personal information, private photos, or copyrighted images without permission. Confirm licenses and credits for book artwork and any photographs you add. Provide image alt text and check contrast when changing the design.

**Note:** Free GitHub Pages is intended for public static sites and has usage limits and terms; check https://docs.github.com/en/pages for current details.
