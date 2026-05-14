# CodeNinja Onboarding Dashboard — Local Setup Guide

A complete walkthrough to get the dashboard running on your Windows machine
and connected to a dummy Google Sheet.

Estimated time: 20–30 minutes.

---

## Phase 1 — Install Node.js (5 min)

Node.js is what runs the dashboard locally.

1. Open https://nodejs.org in your browser.
2. Click the big green **LTS** button (it will say something like "20.x.x LTS"
   or "22.x.x LTS"). Download starts automatically.
3. Run the downloaded `.msi` installer.
4. Click **Next** through everything. Accept defaults. Tick "Automatically
   install necessary tools" if it asks. Click **Install**. Wait.
5. If a black PowerShell window pops up at the end, let it finish and press
   any key to close it.

**Verify it worked**:
- Open VS Code.
- Top menu: **Terminal → New Terminal**.
- A panel opens at the bottom. Click into it and type:
  ```
  node -v
  ```
  Press Enter. You should see something like `v20.15.0`. Then type:
  ```
  npm -v
  ```
  Press Enter. You should see something like `10.8.0`.

If both show version numbers, you're done with Phase 1. If `node` is "not
recognized", close VS Code completely and reopen it — the PATH variable
won't refresh until you do.

---

## Phase 2 — Set up the project folder (5 min)

1. In VS Code: **File → Open Folder**. Pick or create a folder somewhere
   simple, like `Documents\onboarding-dashboard`.
2. Copy every file from this `starter-kit` folder into your project folder.
   Your folder should look like this:
   ```
   onboarding-dashboard\
     ├─ index.html
     ├─ package.json
     ├─ postcss.config.js
     ├─ tailwind.config.js
     ├─ vite.config.js
     ├─ sample-joiners.csv
     └─ src\
         ├─ App.jsx
         ├─ index.css
         └─ main.jsx
   ```
3. Open the VS Code terminal again (**Terminal → New Terminal**).
4. Make sure the terminal is in your project folder. The prompt should end
   with `\onboarding-dashboard>`. If not, type:
   ```
   cd "C:\Users\YourName\Documents\onboarding-dashboard"
   ```
   (Replace with your actual path. Tip: right-click the folder in VS Code's
   file explorer and "Copy Path".)
5. Install all the libraries the dashboard needs. In the terminal, type:
   ```
   npm install
   ```
   Press Enter. This takes 2–4 minutes. You'll see lots of scrolling text
   and possibly some yellow warnings — that's normal. Wait until you get
   your prompt back (the `>` cursor returns).

---

## Phase 3 — Run the dashboard (1 min)

1. Still in the VS Code terminal, type:
   ```
   npm run dev
   ```
   Press Enter.
2. After 2–3 seconds you'll see something like:
   ```
   VITE v5.3.1  ready in 412 ms
   ➜  Local:   http://localhost:5173/
   ```
3. Your browser should open automatically. If not, hold **Ctrl** and click
   the `http://localhost:5173/` link in the terminal.

You should see the dashboard running with sample data. Congratulations —
Phase 1, 2, and 3 are done.

**To stop the server later**: click into the terminal and press **Ctrl+C**.
To restart: type `npm run dev` again.

---

## Phase 4 — Create your dummy Google Sheet (5 min)

The dashboard fetches a CSV URL on a 2-minute interval. Google Sheets gives
us a clean public URL with no permission headaches.

1. Open https://sheets.google.com and sign in.
2. Click the big **+** for a blank sheet. Name it "Onboarding Joiners".
3. Open the `sample-joiners.csv` file from the starter kit (you can open
   it in Excel or in Notepad).
4. Select all the contents (Ctrl+A) and copy (Ctrl+C).
5. In your Google Sheet, click cell A1 and paste (Ctrl+V).
6. The data may all land in one column. If it does:
   - Select column A.
   - Menu: **Data → Split text to columns**.
   - A dropdown appears at the bottom — choose "Comma".
7. You should now have 9 clean columns: Name, Designation, Department,
   Team, Date of Joining, Confirmation Date, Reporting Manager,
   Project/Department, Location.
8. Now publish the sheet as CSV:
   - Menu: **File → Share → Publish to web**.
   - In the dialog: change the dropdown from "Web page" to **"Comma-separated
     values (.csv)"**.
   - Click **Publish**. Confirm if it asks.
   - Copy the long URL it gives you. It will look something like:
     ```
     https://docs.google.com/spreadsheets/d/e/2PACX-1vAB.../pub?output=csv
     ```
   - Click **Done**.

Keep this URL — you'll paste it into the dashboard in the next step.

---

## Phase 5 — Connect the dashboard to your sheet (1 min)

1. Go back to your browser tab with the dashboard running.
2. Top right of the dashboard: click the **⚙ settings icon**.
3. A modal opens. Paste your Google Sheet CSV URL into the field.
4. Click **Apply**.
5. The dashboard reloads using your live sheet data.

To test live updates: open your Google Sheet in another tab. Add a new
row with a name, today's date, etc. Wait up to 2 minutes (or click the
refresh icon next to settings in the dashboard) — the new joiner should
appear in the dashboard with their full onboarding workflow auto-generated.

You're done.

---

## Troubleshooting

**"`npm` is not recognized"** — Node.js didn't install correctly, or VS
Code was open when you installed it. Close VS Code completely, reopen it,
and try `node -v` again. If still nothing, reinstall Node.js.

**Browser shows a blank page or errors** — Click into the dashboard's
browser tab, press F12 to open developer tools, click the "Console" tab,
and copy any red error messages. Paste them back to me.

**"Cannot find module '@vitejs/plugin-react'" or similar** — `npm install`
didn't finish or had an error. Run it again.

**Dashboard loads but shows sample data, not my sheet** — Check that your
Google Sheet is actually published (Phase 4 step 8), not just shared. The
URL must contain `/pub?output=csv` at the end. Shared-only sheets won't
work because the browser can't fetch them.

**Dashboard says "Could not reach the sheet"** — The URL might have
extra spaces, or you copied the share link instead of the publish link.
Re-do Phase 4 step 8 carefully.

**Port 5173 is busy** — Stop any other dev server (Ctrl+C in its terminal)
or change the port in `vite.config.js` from `5173` to `5174`.

---

## What about Excel in OneDrive?

The dashboard would work with it, but OneDrive/SharePoint CSV links often
return errors when fetched from a browser (it's called a CORS error — the
OneDrive servers say "no" to direct browser requests). Workarounds exist
(a small proxy server, or using Microsoft Graph API with auth), but they're
out of scope for a first functional test. Once you've confirmed the
dashboard works end-to-end with Google Sheets, we can revisit the OneDrive
path.
