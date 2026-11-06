# MemoryX v2

Public app: https://thomasjudes-del.github.io/memoryx/v2/

Static, mobile-first timeline hosted on GitHub Pages. No MemoryX account or paid API required. The original prototype remains at the repository root.

## Experience

Birth-date onboarding; visual calendar with direct month/year selection; exact and approximate dates; narrative or manual entry; optional browser dictation; optional local text AI and audio transcription; photo, ICS calendar and text/email imports. Every proposed event is reviewed before saving.

Photos are selected by the person through the phone picker. JPEG capture date and GPS are read when supplied. Missing metadata remains unknown. A website cannot scan the entire Apple Photos library. HEIC support depends on browser decoding; JPEG is the fallback.

Share an individual memory as a self-contained URL, or a JSON file including its photo. A recipient can prepare a return link; the author explicitly accepts the testimony. No messaging is sent by MemoryX. Links are bearer copies, not authenticated identities, and cannot be revoked. Full-history JSON export/import and calendar reminder ICS downloads are available.

## Local storage and models

Example and personal spaces are isolated in localStorage under `memoryx-public-v2`. JSON export is the backup; clearing browser data removes local history. No server sync, analytics or paid inference backend.

Fast narrative organization is deterministic extraction. Optional AI uses Transformers.js 3.7.2, Qwen2.5-0.5B-Instruct q4 and Whisper tiny q8 in a worker. Models download from Hugging Face and dependencies from jsDelivr on explicit activation; inference then runs on the device. Download size, memory and speed depend on the device. Browser dictation is separate and may use the browser vendor's remote speech service.

Google Calendar/Gmail direct OAuth code requires an owner-configured Google client ID, allowed origins, enabled APIs and relevant Google consent/verification. It is not preconfigured in this deployment. File imports need none of this. Existing ChatGPT connector permissions do not transfer to this website.

## Code and verification

`app.js` handles views/storage; `model.js` handles dates and validation; `intake.js` handles imports and share packets; `experience.js` handles onboarding, capture and sharing; `local-ai.js` runs optional models. CSS is split across base, modern and experience styles.

Run `npm test` and `node tests/mixed-session.test.cjs`. GitHub Actions checks scripts and tests before publication.

Browser QA covered 320/390 px layouts, onboarding, calendar, narrative review, manual edit, JPEG EXIF import, ICS import, memory/reply links and testimony acceptance. Local text inference and Whisper transcription ran in Chromium. Physical iPhone performance, Safari microphone behavior and live Google OAuth have not been verified.
