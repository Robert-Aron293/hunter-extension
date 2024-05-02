import { DetectionService } from "./services/detection_service";

chrome.tabs.onUpdated.addListener(async (tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
    if (changeInfo?.status === 'complete' && tab.active) {
      let url = tab.url;
      if (!url || url.indexOf('chrome-extension') !== -1) {
        return;
      }

      console.log(url);
      const result = await DetectionService.getInstance().scanUrl(url);
      if (result === false) {
        return;
      }

      chrome.tabs.update(tabId, { url: chrome.runtime.getURL('./block.html') });
    }
});
