chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.create({ url: "https://askyard.firstdeploy.ai/rep" });
});
