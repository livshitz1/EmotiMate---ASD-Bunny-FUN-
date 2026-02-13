# My Bunny Time

Supportive bunny companion app for routine, emotions, and micro-actions.
Diagnostic/research module inside the app: **MeowDiagnostics (RUO)**.

## Project Path
`/Users/danl/Library/Mobile Documents/com~apple~CloudDocs/Projects link/Games /My Bunny Time`

## Git Remote
`https://github.com/livshitz1/EmotiMate---ASD-Bunny-FUN-.git`

## Run
```bash
npm install
npm run dev
```

## Android Sync
```bash
npm run capacitor:sync:android
```

## Required Env
Create `.env.local` (never commit):
```bash
VITE_GEMINI_API_KEY=YOUR_GEMINI_KEY
# optional compatibility aliases:
API_KEY=YOUR_GEMINI_KEY
GEMINI_API_KEY=YOUR_GEMINI_KEY
```

## Data Storage (Local)
- Diagnostics: `emotimate_diagnostic_results`
- Curiosity logs: `emotimate_curiosity_logs`
- Curiosity stats: `emotimate_curiosity_stats`
- Water: `emotimate_water_intake`, `emotimate_water_daily_history`, `emotimate_water_events`
- Social: `emotimate_social_activity_log`, `emotimate_social_stats`

## Backups
- Last safe backup: `/Users/danl/Backups/My-Bunny-Time/20260213_104241`
- Cleanup archive: `/Users/danl/Library/Mobile Documents/com~apple~CloudDocs/Projects link/Games /_ARCHIVE_REPO_CLEANUP_20260213_102326`
- Archived recursive backup: `/Users/danl/Library/Mobile Documents/com~apple~CloudDocs/Projects link/Games /_ARCHIVE_BACKUP_BEFORE_RESTORE_20260213_102252`

## Notes
- Repo name on GitHub is still old (`EmotiMate---ASD-Bunny-FUN-`).
- App branding in code was updated to **My Bunny Time**.
