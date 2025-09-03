# ClipNotes 📝

ClipNotes is a browser extension that lets you bookmark key moments in YouTube videos and take synchronized notes in the cloud.

![Screenshot of ClipNotes in action] 
(You can add a screenshot here later)

## Features ✨

* **Cloud Sync:** Log in to sync your bookmarks and notes across multiple devices.
* **Timestamp Bookmarking:** Instantly save any moment in a YouTube video.
* **Note-Taking:** Add, edit, and delete detailed notes for each bookmark.
* **Search:** Quickly find any note or bookmark with a built-in search.
* **Export:** Save your notes as a PDF file for offline study or printing.

## Tech Stack 🛠️

* **Frontend:** React, TypeScript, Vite
* **Backend & Database:** Supabase (Auth & Postgres)
* **Styling:** CSS
* **File Generation:** jsPDF

## How to Run Locally

1.  Clone the repository: `git clone https://github.com/Aadish-Vikram-Chakravorty/clipnotes`
2.  Install dependencies: `npm install`
3.  Create a `.env` file in the root and add your Supabase credentials:
    ```
    VITE_SUPABASE_URL=...
    VITE_SUPABASE_ANON_KEY=...
    ```
4.  Build the extension: `npm run build`
5.  Load the `dist` folder as an unpacked extension in Google Chrome.