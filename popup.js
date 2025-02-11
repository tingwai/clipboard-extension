document.addEventListener('DOMContentLoaded', async () => {
  // Pause monitoring while popup is open
  browser.runtime.sendMessage({ action: 'pauseMonitoring' });

  // Resume monitoring when popup closes
  window.addEventListener('unload', () => {
    browser.runtime.sendMessage({ action: 'resumeMonitoring' });
  });

  const clipboardList = document.getElementById('clipboardList');
  const clearBtn = document.getElementById('clearBtn');

  // Load and display clipboard history
  async function loadClipboardHistory() {
    const { clipboardHistory = [] } = await browser.storage.local.get('clipboardHistory');
    clipboardList.innerHTML = '';

    clipboardHistory.forEach((item, index) => {
      const itemElement = document.createElement('div');
      itemElement.className = 'clipboard-item';

      const textContainer = document.createElement('div');
      textContainer.className = 'clipboard-text-container';

      const textElement = document.createElement('div');
      textElement.className = 'clipboard-text';
      textElement.textContent = item.text;

      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'button-container';

      const copyBtn = document.createElement('button');
      copyBtn.className = 'copy-btn';
      copyBtn.textContent = '📋';
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(item.text);
        copyBtn.textContent = '✓';
        setTimeout(() => copyBtn.textContent = '📋', 1000);
      });

      const pinBtn = document.createElement('button');
      pinBtn.className = `pin-btn ${item.pinned ? 'pinned' : ''}`;
      pinBtn.textContent = '📌';

      textContainer.appendChild(textElement);
      buttonContainer.appendChild(copyBtn);
      buttonContainer.appendChild(pinBtn);
      itemElement.appendChild(textContainer);
      itemElement.appendChild(buttonContainer);

      pinBtn.addEventListener('click', async () => {
        const { clipboardHistory } = await browser.storage.local.get('clipboardHistory');
        clipboardHistory[index].pinned = !clipboardHistory[index].pinned;
        await browser.storage.local.set({ clipboardHistory });
        loadClipboardHistory();
      });

      clipboardList.appendChild(itemElement);
    });
  }

  // Clear unpinned items
  clearBtn.addEventListener('click', async () => {
    const { clipboardHistory = [] } = await browser.storage.local.get('clipboardHistory');
    const pinnedItems = clipboardHistory.filter(item => item.pinned);
    await browser.storage.local.set({ clipboardHistory: pinnedItems });
    loadClipboardHistory();
  });

  // Initial load
  loadClipboardHistory();
});