# AJB Leaders Academy Website

A multi-page static website (HTML, CSS, JavaScript). **News & Events** and **Gallery**
update from a Google Sheet and a Google Drive folder, so staff never edit code to post updates.

## Project structure

```
index.html          Home
about.html          About Us
academics.html      Academics (four clickable level cards)
ece.html            Early Childhood Education (ECE) level page
lower-elementary.html  Lower Elementary level page
upper-elementary.html  Upper Elementary level page
junior-high.html    Junior High level page
admissions.html     Admissions
news.html          News & Events (short previews + Read more)
story.html         One full news story (story.html?id=...)
staff.html         Our Staff (grouped cards)
gallery.html        Gallery (categories, captions, See more)
support.html        Support Us
contact.html        Contact
partials/
  principal.html    Principal's welcome message (edit the text here)
  header.html       Top bar + navigation (shared by every page)
  footer.html       Footer (shared by every page)
images/principal.jpg Principal photo (replace the file, keep the name)
css/style.css       Main styling (colors are CSS variables at the top)
css/pages.css       News cards, story page, gallery grid (loaded by js/layout.js)
js/config.js        Your Apps Script URL goes here
js/layout.js        Loads the shared header/footer, highlights the current page
js/site.js          Loads news + gallery from the Apps Script URL
apps-script/Code.gs Google Apps Script backend (paste into script.google.com)
```

Each navigation item has its own file. To change the menu or footer links, edit
`partials/header.html` or `partials/footer.html` once and every page updates.

## Run locally in VS Code

1. Open this folder in VS Code.
2. Install the **Live Server** extension.
3. Right-click `index.html` and choose **Open with Live Server**.

Live Server (or any web host) is required. Double-clicking the HTML files will not
load the shared header/footer. With `API_URL` empty, the pages show a "not connected yet" message. If the school data cannot be loaded (for example a bad connection), visitors see "We could not load this right now" with a Try again button. The site never shows made-up content.

## Add a new page

1. Copy an inner page such as `about.html` and rename it.
2. Change the title, heading and content.
3. Add a link in `partials/header.html` (and `partials/footer.html` if wanted).

## Set up automatic news and gallery

### 1. Google Sheet (news)

1. Create a Google Sheet. Rename the first tab to **News**.
2. Row 1 headers, exactly: `Title | Date | Summary | PhotoURL | Show`
3. Add one row per story. Put the **full story** in the `Summary` column. The site shows the first two sentences, then a "Read more" link to the full story. `PhotoURL` can be a Drive share link or any image link. Type `yes` in **Show** to publish it.
4. Copy the Sheet ID from its URL (between `/d/` and `/edit`).

### 2. Drive folder (gallery)

1. Create a Drive folder named **Gallery**.
2. Share it: **Anyone with the link → Viewer**. Only this folder becomes public.
3. Copy the Folder ID from its URL (after `/folders/`).

### 3. Apps Script

1. Go to https://script.google.com and create a new project.
2. Paste in `apps-script/Code.gs` and set `SHEET_ID` and `GALLERY_FOLDER_ID`.
3. **Deploy → New deployment → Web app**. Execute as: **Me**. Who has access: **Anyone**.
4. Authorize when asked, then copy the Web app URL.

### 4. Connect the site

Paste the Web app URL into `API_URL` in `js/config.js`.

After changing Apps Script code, use **Deploy → Manage deployments → Edit → New version**.

## Gallery tab, Staff tab and the Principal's message

### Gallery tab (captions and categories)

Add a tab named **Gallery** with headers: `Photo | Caption | Category | Date | Show`

- **Photo:** upload the image to the Gallery Drive folder, right-click it, choose Share → Copy link, and paste the link.
- **Caption:** one short line describing the photo. Do not use children's full names.
- **Category:** School Events, Academic Activities, Sports Events, Staff, Campus & Facilities or Other. Tip: add a dropdown (Data → Data validation) so nobody mistypes it.
- **Show:** `yes` to publish.
  The Gallery page shows 10 photos at first, then 10 more each time someone clicks **See more**. Category filter buttons appear only for categories that have photos. Without a Gallery tab, all photos in the Drive folder show under "Other".

### Staff tab

Add a tab named **Staff** with headers: `Name | Role | Group | Photo | Bio | Show`. Group = Administration, Teachers or Support Staff. Photo = Drive share link.

### Principal's message

Edit `partials/principal.html` (text, name, title). Replace `images/principal.jpg` to change the photo. The message appears on the home page after the four feature icons.

### Add the Staff link to the menu

In `partials/header.html` add `<a href="staff.html">Staff</a>` after the About Us link, and in `partials/footer.html` add `<li><a href="staff.html">Staff</a></li>`.

## Academics level pages

Each level page shows photos at the top, then the details, then the Donate / Support button. The photos come from Google Drive through the Sheet, so they are not stored in the project.

1. In Drive, create a folder named **Academics** inside the **Gallery** folder (it is already shared). Upload the photos there.
2. In the Google Sheet add a tab named **Academics** with headers: `Level | Photo | Caption | Show`
3. **Level:** ECE, Lower Elementary, Upper Elementary or Junior High (tip: add a dropdown with Data → Data validation).
4. **Photo:** right-click the image in Drive, Share → Copy link, paste it. **Caption:** one short line (optional, no children's full names). **Show:** `yes`.
5. Add 3 or 4 photos per level. They show in the same order as the sheet, up to 8 per level.
6. Update Apps Script: paste in the new `apps-script/Code.gs`, then Deploy → Manage deployments → Edit → New version.

While photos load, the page shows grey boxes (no flashing placeholder photos). If a level has no photos in the sheet, 4 default school photos are shown. Edit the subjects and text directly in each level's HTML file (look for the `TODO` comment).

## School permit (renews every year)

The permit is NOT stored in the project. It lives in Google Drive and the Sheet, and shows on the About and Support pages (a preview picture, details, the "valid until" date and a "View document" button). Works with an image or a PDF.

1. Upload the permit to Drive (for example in a folder inside the shared Gallery folder). Right-click → Share → "Anyone with the link" → Viewer.
2. In the Google Sheet add a tab named **Documents** with headers: `Title | File | Details | Valid Until | Show`
3. Add a row. **Title:** `School Operational Permit` (keep this exact name). **File:** the Drive "Copy link". **Details:** one or two lines of text. **Valid Until:** the expiry date. **Show:** `yes`.
4. **Every year:** either (a) in Drive right-click the file → Manage versions → Upload new version (the link stays the same), or (b) upload the new file and paste its new link in the row. Then update **Valid Until**. Allow up to 5 minutes for the site to update.
5. To hide it, set **Show** to `no`. If there is no row, the section does not appear at all.

## Contact form

Visitors can send a message from the Contact page. Each message is saved as a new row in a Sheet tab named **Messages** (Time | Name | Contact | Message | Status). The tab is created automatically the first time a message arrives. After pasting in the new `Code.gs`, deploy a new version. Check the Messages tab regularly and set **Status** to Done when you have replied.

## Sharing preview (WhatsApp, Facebook) and icon

Every page has a title, description, icon and a preview picture (`images/share.jpg`, 1200x630). These tags need the real web address. Once you know it, in VS Code press Ctrl+Shift+H, find `https://hul2024.github.io/ajb-site`, replace it with your address (for example `https://yourname.github.io/ajb-site`, no slash at the end) and click Replace All. To change the preview picture, replace `images/share.jpg` (keep the name and size). After changing it, test the link in the Facebook Sharing Debugger, because WhatsApp and Facebook remember old previews.

## Speed

- The site remembers the last data it loaded, so pages open instantly on a return visit and refresh quietly in the background.
- After a page finishes loading, the site quietly loads the first photos of the other pages (Academics, Gallery, News, Staff) so they are ready when a visitor opens them. It skips this on slow or Save-Data connections. To turn it off, set `PREFETCH = false` at the top of `js/site.js`.
- Apps Script keeps its answer for 5 minutes (`CACHE_SECONDS` in `Code.gs`), so a change in the Sheet can take up to 5 minutes to show. Set it to `0` to turn this off.
- Keep photos small before uploading to Drive (about 1600 px wide is plenty).

## Everyday use

- **Post news:** add a row in the News sheet, set Show to `yes`.
- **Add gallery photos:** drop images into the Gallery folder. The home page shows the 4 newest, the Gallery page shows up to 40.

## Publish the site

Upload the whole folder to a static host (GitHub Pages, Netlify, Cloudflare Pages) and point your domain at it.

## To do

- Replace placeholder text in `about.html`, `academics.html`, `admissions.html`, `support.html` (search for `TODO` and `[...]`).
- Confirm phone, address and email in `partials/header.html`, `partials/footer.html` and `contact.html`.
- Replace the "AJB" text crest with the real logo (`<div class="crest">` in the partials).
- Add real photos for the hero, school building and globe sections (currently CSS color blocks).
- Add real links for Donate and the social icons.
