// Listen for a "saveBookmark" message from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "saveBookmark") {
    // Get the currently active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab && activeTab.url && activeTab.url.includes("youtube.com/watch")) {
        // Ask the content script for the video's details
        chrome.tabs.sendMessage(activeTab.id, { action: "getTimestamp" }, (response) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
            // Optionally send an error response back to the UI
            sendResponse({ error: "Could not connect to the page." });
            return;
          }
          if (response && response.timestamp !== undefined) {
            // Create the bookmark object
            const newBookmark = {
              url: activeTab.url,
              title: response.title.replace(' - YouTube', ''),
              timestamp: response.timestamp,
              note: "Add your note here...",
            };
            // Send the new bookmark object back to the App for saving
            sendResponse({ bookmark: newBookmark });
          }
        });
      }
    });
    return true; // Keep the message channel open for the response
  }
});