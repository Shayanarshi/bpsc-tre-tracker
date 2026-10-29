# BPSC TRE 4.0 Study Tracker

A React + Vite tracker for a 30-day study plan beginning November 1, 2026.

## Run locally
1. Install Node.js (LTS).
2. Extract this ZIP.
3. Open a terminal in the extracted `bpsc-tre-tracker` folder.
4. Run:
   ```bash
   npm install
   npm run dev
   ```
5. Open the local URL printed by Vite.

To create a production build, run `npm run build`. The generated site is in `dist/`.

## Included
- 30 selectable study days, November 1–30, 2026.
- Lecture checklist with actual durations supplied in the conversation.
- Daily and overall completion percentages, watched time and remaining time.
- Subject-wise progress, search, subject filter, completed/estimated filters.
- Progress saved in this browser's localStorage.
- Missing course videos are included as clearly labelled 30-minute estimates when the course overview count exceeded the supplied timed list.

## Important data limitations
The dataset uses the course counts and timed lists retained from the user's supplied course information. Some lecture names were not present in the retained source, so those entries are labelled “Lecture N (title not provided in supplied list)”. Missing duration/title entries are not presented as verified facts; they are estimates. Review `src/data/courseData.js` against the course portal before relying on it as a definitive syllabus inventory.

Total scheduled duration is calculated from the included data and is slightly more than 180 hours. Consequently, all listed lectures fit in the 30-day window only with a daily average slightly above six hours. Complete videos are kept intact; the app does not cut a lecture short to force an exact six-hour cap.
