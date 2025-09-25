if (location.pathname.startsWith('/shorts')) {
  location.href = 'https://www.youtube.com';
}

function waitForElm(selector) {
  return new Promise(resolve => {
    const el = document.querySelector(selector);
    if (el) return resolve(el);
    const observer = new MutationObserver(() => {
      const elNow = document.querySelector(selector);
      if (elNow) {
        resolve(elNow);
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
}

function hideElements(selectors) {
  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => (el.style.display = 'none'));
  });
}

function applyHides({
  filterShorts = false,
  hideComments = false,
  hideSuggestions = false,
  hideThumbnails = false
} = {}) {
if (filterShorts) {
  const sidebarShorts = document.querySelector('a#endpoint[title="Shorts"]');
  if (sidebarShorts) sidebarShorts.style.display = 'none';
  document.querySelectorAll('ytd-rich-item-renderer, ytd-video-renderer').forEach(el => {
    if (el.querySelector('a[href*="/shorts/"]')) {
      el.style.display = 'none';
    }
  });
  const selectors = [
    'yt-tab-shape[tab-title="Shorts"]',
    'ytd-rich-shelf-renderer[is-shorts]',
    'ytd-reel-shelf-renderer',
    'ytd-reel-item-renderer',
    'grid-shelf-view-model',
    'yt-chip-cloud-chip-renderer[title="Shorts"]'
  ];
  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      el.style.display = 'none';
    });
  });
  document.querySelectorAll('ytd-rich-shelf-renderer span#title').forEach(span => {
    if (span.textContent.trim() === 'Shorts') {
      const parent = span.closest('ytd-rich-shelf-renderer');
      if (parent) parent.style.display = 'none';
    }
  });
  if (window.location.href.includes("/shorts/")) {
    const match = window.location.href.match(/shorts\/([\w-]+)/);
    if (match && match[1]) {
      const videoId = match[1];
      const normalUrl = `https://www.youtube.com/watch?v=${videoId}`;
      history.replaceState(null, null, normalUrl);
      window.location.href = normalUrl;
    }
  }
  const style = document.createElement('style');
  style.textContent = `
    a[title="Shorts"],
    yt-tab-shape[tab-title="Shorts"],
    ytd-rich-shelf-renderer[is-shorts],
    ytd-reel-shelf-renderer,
    ytd-reel-item-renderer,
    grid-shelf-view-model,
    yt-chip-cloud-chip-renderer[title="Shorts"] {
      display: none !important;
    }
  `;
  document.head.appendChild(style);
}
  if (hideComments) {
    const comments = document.querySelector('ytd-comments');
    if (comments) comments.style.display = 'none';
  }
  if (hideSuggestions) {
    const isHomepage = location.pathname === '/';
    const homepageElements = [
      'ytd-rich-grid-renderer',
      'ytd-rich-item-renderer',
      '#contents ytd-rich-grid-row',
      '#contents ytd-rich-shelf-renderer'
    ];
    const watchPageElements = [
      '#related',
      '#secondary',
      'ytd-watch-next-secondary-results-renderer',
      'ytd-compact-video-renderer',
      'ytd-vertical-list-renderer'
    ];
    if (isHomepage) {
      hideElements(homepageElements);
    }
    if (location.pathname.startsWith('/watch')) {
      hideElements(watchPageElements);
    }
  }
  if (hideThumbnails) {
    let style = document.getElementById('yt-custom-style');
    if (!style) {
      style = document.createElement('style');
      style.id = 'yt-custom-style';
      document.head.appendChild(style);
    }
    style.textContent = `
      ytd-thumbnail img,
      yt-thumbnail-view-model img.ytCoreImageHost,
      .ytThumbnailViewModelImage img,
      a.yt-lockup-view-model__content-image img {
        visibility: hidden !important;
      }
    `;
  }
}

function handleScrollTimerBasedOnLocation(durationSec) {
  let timerId;
  let previousPath = location.pathname;
  const clearExistingTimer = () => {
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
  };
  const startTimer = () => {
    clearExistingTimer();
    timerId = setTimeout(() => {
      if (location.pathname.startsWith('/shorts')) {
        window.location.href = 'https://www.youtube.com';
      }
    }, durationSec * 1000);
  };
  if (previousPath.startsWith('/shorts')) {
    startTimer();
  }
  setInterval(() => {
    if (location.pathname !== previousPath) {
      const wasShorts = previousPath.startsWith('/shorts');
      const isShorts = location.pathname.startsWith('/shorts');
      previousPath = location.pathname;
      if (isShorts && !wasShorts) {
        startTimer();
      } else if (!isShorts && wasShorts) {
        clearExistingTimer();
      }
    }
  }, 1000);
}

async function main() {
  const data = await chrome.storage.sync.get([
    'scrollTimer', 'enableTimer',
    'filterShorts', 'hideComments', 'hideSuggestions', 'hideThumbnails'
  ]);
  const options = {
    filterShorts: data.filterShorts === true,
    hideComments: data.hideComments === true,
    hideSuggestions: data.hideSuggestions === true,
    hideThumbnails: data.hideThumbnails === true
  };
  applyHides(options);
  if (data.enableTimer === true && data.scrollTimer > 0) {
    handleScrollTimerBasedOnLocation(data.scrollTimer * 60);
  }
  const observer = new MutationObserver(() => applyHides(options));
  observer.observe(document.body, { childList: true, subtree: true });
}

main();