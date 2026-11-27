# Proposed Privacy Notice (DRAFT FOR HUMAN AND LEGAL REVIEW)

**This is a proposal. It is not legal advice, has not been reviewed by a lawyer or privacy professional, and must not be published or relied on as a statement of legal compliance until it has been.** Bracketed items need the owner's decisions. Statements marked (verify) describe what the live site appears to do from its source code and must be confirmed against the real configuration.

---

## Drosie's World Privacy Notice

*Last updated: [date]*

### Who we are
Drosie's World is a free science education website created by Shahira Helal Arzoo. Contact: drosiesworld@gmail.com. [Add postal address or institutional contact if required.]

### The short version
- You do not need an account. We do not ask for children's names.
- Most activities run entirely in your own browser. Your progress and settings are saved **only on your device** and can be deleted from the activity's reset control or by clearing your browser data.
- The activities do not send your answers, scores or notebook entries to us.
- A few parts of the website use outside services (listed below). They can see technical information such as your IP address and browser type when your browser contacts them.

### What stays on your device
Progress, preferences and any notebook or conference work you create are stored in your browser's local storage. We do not receive them. If you use a shared computer, use the reset or "clear my work" option when you finish. Downloads and printouts are created on your device.

### Information we may receive
| Where | What | Why | Who handles it |
|---|---|---|---|
| Visitor feedback form (home page) | The role you choose, a star rating, your message, and optionally your country | To read feedback and, after review, show some of it on the website | Supabase (database and server function) (verify); Cloudflare Turnstile (spam protection) |
| Website visit counts | Page visited, activity events (for example "level completed"), approximate counts | To see which resources are used | GoatCounter (verify: privacy-oriented analytics, no cookies, no names or scores) |
| Email you send us | Whatever you write, your email address | To reply | Gmail |
| Outreach-contact form (map section) | Prepares an email on your device; **nothing is sent until you press Send in your own email program** | To let educators tell us how they used Drosie | You send it by email |

**Please do not put children's names, photos, school names or other personal information in feedback or emails.** If you do, tell us and we will delete it.

### Outside services that may see your IP address and browser details
Google Fonts (letter styles), unpkg (map software), OpenStreetMap (map tiles), jsDelivr (storybook page-turn software), YouTube (privacy-enhanced embedded video), Cloudflare (spam check), GoatCounter (visit counts), Supabase (feedback). [Owner: remove from this list any service you have stopped using. A copy of the website that can be used offline, the "archival edition", contacts none of them.]

### How long we keep information
[Owner to decide, for example: feedback is kept until you ask us to delete it or [period]; visit counts are kept in aggregate; emails are kept for [period].]

### Children
This website is designed for children to use with a parent or teacher. We do not knowingly collect personal information from children. If you believe a child has sent us personal information, contact us and we will delete it. [Legal review needed for COPPA, GDPR-K and similar rules that apply to your audience and locations.]

### Your choices and rights
You can use almost everything on the website without sending us any information. You can ask us to delete feedback or emails you sent. Depending on where you live you may have additional rights (access, correction, deletion, objection); contact us to exercise them. [Legal review needed.]

### Security
We use reputable hosting and services and limit what is collected. No system is perfectly secure.

### Changes
We will update this page and its date when practices change.

---

### Notes for the owner (delete before publishing)
1. Do not publish statements such as "we comply with COPPA/GDPR" unless counsel confirms.
2. Make every other page's privacy wording consistent with this notice (for example the "No personal information is collected" footers).
3. Complete the retention and contact bracketed items.
4. Confirm each service row against the real settings of your Supabase project and GoatCounter site; see `docs/LIVE_SITE_PRIVACY_SECURITY_AUDIT.md`.
5. The archival edition removes the feedback form, analytics, visitor counter, map, fonts, CDN scripts and video embed. If you publish the archive, state that it makes no external requests.
