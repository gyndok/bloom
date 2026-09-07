# Bloom pregnancy calculator

A private, browser-based pregnancy planning tool. Supports last menstrual period (21–45 day cycle adjustment), conception/ovulation, embryo transfer (day 3/5/6), ultrasound gestational age, and a known due date. Includes as-of dates, trimester dates, 42-week exploration, milestones, opt-in device storage, clear/reset, printing, and iCalendar export.

## Run

Requires Node 22.13 or newer. Install with `npm ci`; run `npm run dev`. Check with `npm test` and `npx tsc --noEmit`. Build with `npm run build`.

## Vercel

`vercel.json` builds a static export in `dist/client`. No environment variables, database, or account system required. From this folder, run `vercel --prod` after signing in, or import the repository into Vercel with Framework Preset Other. Build command: `npm run build`. Output directory: `dist/client`.

## Privacy and limitations

No analytics or third-party fonts. Dates are computed locally and optionally stored in browser localStorage. Exported calendars contain personal dates. These estimates are educational, not a diagnosis or a substitute for a clinician-assigned due date. Ultrasound milestone windows are illustrative; appointments vary by country and care plan. Dates after 42 weeks are flagged, not capped.

## Validation

Automated coverage includes leap years, cycle adjustment, equivalent estimates across all five methods, trimester boundaries, future/postterm dates, invalid inputs, and calendar events. Production static export and TypeScript are checked. Browser visual/interaction testing has not been performed. Optional WebMCP support is feature-detected; live WebMCP contract validation was unavailable.

References: [ACOG dating guidance](https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2017/05/methods-for-estimating-the-due-date), [NHS scans](https://www.nhs.uk/pregnancy/your-pregnancy-care/ultrasound-scans/).

## First OB visit and patient links

- Link your public website to https://pregnancy-calculator-self.vercel.app/.
- Use https://pregnancy-calculator-self.vercel.app/?visit=1 in the office. This mode starts blank and ignores browser-saved dates. It does not offer saving on the office computer.
- Calculate with the visit information, review/edit **Due date to share**, and copy the patient link or open a Text/Email draft. The clinician addresses and sends the message in their own approved app. There is no sending service integrated into this site.
- **Start next patient** clears the displayed information and local saved data.
- Patient links contain a version, due date, optional handout IDs, language, and optional assigned-date metadata in a URL fragment. Fragments are not part of ordinary HTTP request URLs. Links are not encrypted, signed, revocable, or access-controlled; anyone with the link can see the due date. The patient or a recipient can alter it. Do not use these links as clinical records or proof of clinician approval. No claim of HIPAA compliance is made.
- Links take precedence over previously saved dates and always recalculate against the current local date. Progress also refreshes on focus, visibility change, and while the page remains open.
- Patients may bookmark the full link, create a home-screen shortcut where supported, or opt into saving in browser storage. Home-screen behavior varies by browser; no offline support is provided.
- If the assigned due date changes, send a new link. Previously sent links retain their original date.

Additional automated tests cover link round trips, malformed/ambiguous dates, due-date-only payloads, progress over time, and SMS/email encoding. Real-device SMS/email and home-screen flows have not been tested.

## Patient education library

54 PDF handouts are included as static copies under `public/handouts/`, indexed by `lib/handouts.json`. They are served directly so patients do not have to enter the shared Dropbox folder. Page counts come from the PDFs. Titles and short topic descriptions are catalog metadata, not newly authored medical advice. The original document content is preserved. Dropbox changes do not automatically update this snapshot; re-import reviewed files and redeploy.

The library includes a featured welcome packet, topic and language filters, full-library search, progressive disclosure, office contact details, and per-visit handout selections. Selected guides appear above the full patient library. The clinician can clear the reading list or reset for the next patient. Existing due-date-only links still work. New links with reading lists use version 2 and encode an allowlisted set of document IDs in the URL fragment. These links expose the selected topics to anyone who has them; they are not authenticated clinical records. Selection IDs are persisted only with the user's explicit device-save action. No reading analytics or third-party PDF viewer is used.

Excluded: `fragile X.pdf` contains an identifiable patient result; `Gaucher_Carrier_Result.pdf` is result-oriented and is held back from the general library; `RSV with Rx.pdf` and `nob paperwork.pdf` could not be verified through text extraction; the severe preeclampsia assessment is a clinical form; NOB/VBAC QR sheets and non-PDF source files are not part of the reading library. Do not publish or commit the source download archive. The shared source folder itself should be reviewed for patient data.

21 automated tests cover all calculation methods, all indexed file paths and PDF signatures, catalog exclusions, filtering, link compatibility, reading-list round trips, unknown IDs, maximum payloads, and messaging encoding. Production build and TypeScript checks pass. Browser visual and real-device interaction testing has not been performed.

## GitHub and automatic deployment

Source: https://github.com/gyndok/bloom. The existing Vercel project is connected to this repository. Feature branches and pull requests receive Vercel previews; merging into `main` publishes the production site at https://pregnancy-calculator-self.vercel.app/.

Use a `codex/` branch for changes, open a pull request, review the preview, and merge after the **Tests, types, and build** check passes. This check installs dependencies, runs the automated tests, checks TypeScript, and builds the site. Keep private patient files and original source-folder archives outside the repository.

## Patient experience

The office handoff sheet creates QR codes locally and opens text/email drafts. The clinician explicitly confirms the assigned-date label; it is unsigned informational metadata, not authentication. New links retain version 1/2 compatibility. Revising a due date creates a new link; old links cannot update or be revoked.

Patient links open a bilingual English/Spanish “This week” home, with current/upcoming care windows, selected or stage-relevant reading, a complete care schedule, warning signs, and vaccine guidance. Spanish mode defaults to the one existing Spanish PDF and offers clearly labeled English documents. PDFs are not translated. Calendar exports retain English event text and are labeled accordingly. Clinical Spanish copy is available in the preview for Dr. Klein’s review before production.

Appointments are explicitly entered by the patient and saved only in localStorage under a key scoped to the due date. They do not book visits, sync, send notifications, or travel in shared links. A different browser or revised due date does not inherit an appointment. Home Screen instructions and an Apple touch icon are included; preserve the complete URL fragment when bookmarking. No fixed manifest start URL replaces the personal link.
