# MemoryX v2

Public demo: https://thomasjudes-del.github.io/memoryx/v2/

Timeline-first, mobile browser interface. No build tools or external services are required. Serve this directory with any static web server. The original demo remains at the repository root.

## Files

- `app.js`: views, interaction and browser storage.
- `model.js`: date precision, examples, filters, recall questions and validated import.
- `styles.css` and `modern.css`: base layout and the current visual treatment.
- `assets/`: two generated fictional example photographs and the icon.

Run `npm test` from the repository root. GitHub Actions also checks the original demo before publishing both versions.

## Data

The two spaces, example and personal history, are isolated under `memoryx-public-v2` in localStorage. The previous demo's storage is not read or modified. JSON export/import provides manual portability. No API calls, analytics, account creation or external fonts are used.

Sharing the application link shares no stored memories. AI sources, friend invitations and replies are interactive previews with no outbound messaging. Their conditions are centralized under the header information button. The data management screen provides export, import, trash and reset.

The timeline keeps uncertain dates as intervals. A month is not converted to an exact day. Unknown dates stay separate. Recall uses confirmed fields only; source suggestions and contributions keep their provenance and hypothesis status.

## QA

Checked at 320 px, 390 px and desktop: first timeline display, adding and editing, month selection, reload persistence, the mixed recall/exploration session and centralized conditions. Model tests cover date precision, invalid dates, import validation, category/date filtering and incomplete editor dates.
