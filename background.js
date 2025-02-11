// Keep track of last copied text
let lastCopiedText = '';
let isMonitoring = true;

// Function to check clipboard periodically
async function checkClipboard() {
  if (!isMonitoring) return;

  try {
    const text = await navigator.clipboard.readText();

    // If text is different from last copied text
    if (text && text !== lastCopiedText) {
      lastCopiedText = text;

      const { clipboardHistory = [] } = await browser.storage.local.get('clipboardHistory');

      // Don't add if it's the same as any existing entry
      const isDuplicate = clipboardHistory.some(item => item.text === text);

      // Only add if it's not a duplicate
      if (!isDuplicate) {
        clipboardHistory.unshift({
          text,
          timestamp: Date.now(),
          pinned: false
        });

        await browser.storage.local.set({ clipboardHistory });
      }
    }
  } catch (error) {
    console.error('Error checking clipboard:', error);
  }
}

// Start monitoring with a more reasonable interval
let checkInterval = setInterval(checkClipboard, 2000);

// Pause monitoring when popup is open
browser.runtime.onMessage.addListener((message) => {
  if (message.action === 'pauseMonitoring') {
    isMonitoring = false;
  } else if (message.action === 'resumeMonitoring') {
    isMonitoring = true;
  }
});

// Initial check
checkClipboard();