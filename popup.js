const scrollTimerInput = document.getElementById('scrollTimer');
const enableTimerCheckbox = document.getElementById('enableTimer');
const filterShortsCheckbox = document.getElementById('filterShorts');
const hideCommentsCheckbox = document.getElementById('hideComments');
const hideSuggestionsCheckbox = document.getElementById('hideSuggestions');
const hideThumbnailsCheckbox = document.getElementById('hideThumbnails');
const status = document.getElementById('status');
const saveBtn = document.getElementById('saveBtn');
const resetBtn = document.getElementById('resetBtn');

function reloadYouTubeTabs() {
  chrome.tabs.query({ url: "*://www.youtube.com/*" }, tabs => {
    for (const tab of tabs) {
      if (tab.id) chrome.tabs.reload(tab.id);
    }
  });
}

function showStatusMessage(msg) {
  status.textContent = msg;
  setTimeout(() => { status.textContent = ''; }, 2000);
}

chrome.storage.sync.get([
  'scrollTimer',
  'enableTimer',
  'filterShorts',
  'hideComments',
  'hideSuggestions',
  'hideThumbnails'
], data => {
  scrollTimerInput.value = data.scrollTimer ?? 0;
  enableTimerCheckbox.checked = !!data.enableTimer;

  filterShortsCheckbox.checked = !!data.filterShorts;
  hideCommentsCheckbox.checked = !!data.hideComments;
  hideSuggestionsCheckbox.checked = !!data.hideSuggestions;
  hideThumbnailsCheckbox.checked = !!data.hideThumbnails;
});

saveBtn.addEventListener('click', () => {
  const settings = {
    scrollTimer: parseInt(scrollTimerInput.value, 10) || 0,
    enableTimer: enableTimerCheckbox.checked,
    filterShorts: filterShortsCheckbox.checked,
    hideComments: hideCommentsCheckbox.checked,
    hideSuggestions: hideSuggestionsCheckbox.checked,
    hideThumbnails: hideThumbnailsCheckbox.checked
  };

  chrome.storage.sync.set(settings, () => {
    reloadYouTubeTabs();
  });
});

resetBtn.addEventListener('click', () => {
  chrome.storage.sync.set({
    scrollTimer: 0,
    enableTimer: false,
    filterShorts: false,
    hideComments: false,
    hideSuggestions: false,
    hideThumbnails: false
  }, () => {
    scrollTimerInput.value = '0';
    enableTimerCheckbox.checked = false;
    filterShortsCheckbox.checked = false;
    hideCommentsCheckbox.checked = false;
    hideSuggestionsCheckbox.checked = false;
    hideThumbnailsCheckbox.checked = false;
    reloadYouTubeTabs();
  });
});