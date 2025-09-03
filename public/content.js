// Listens for a message from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getTimestamp") {
    // Find the video element on the page
    const video = document.querySelector('video');
    if (video) {
      const timestamp = video.currentTime; // Get the current time in seconds
      const videoTitle = document.title;
      
      // Send the timestamp and title back to the background script
      sendResponse({ timestamp: timestamp, title: videoTitle });
    }
  }
  return true; // Keep the message channel open for the asynchronous response
});