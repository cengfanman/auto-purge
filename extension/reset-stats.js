// Reset statistics in Chrome extension storage
chrome.storage.local.get(['usage'], (result) => {
  const currentUsage = result.usage || { deletionsToday: 0, deletionsTotal: 0 };
  
  console.log('Current statistics:', currentUsage);
  
  // Reset to 0
  chrome.storage.local.set({ 
    usage: { deletionsToday: 0, deletionsTotal: 0 } 
  }, () => {
    console.log('Statistics reset to 0');
  });
});
