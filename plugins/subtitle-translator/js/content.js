let isTranslating = false;
let translationInterval = null;
let lastSubtitle = null;
let originalSubtitle = null;

// 配置不同网站的字幕选择器
const subtitleSelectors = {
  'youtube.com': '.ytp-caption-segment',
  'coursera.org': '.rc-CaptionText',
  'udemy.com': '.well--text--J1-Qi'
};

// 获取当前网站的字幕选择器
function getSubtitleSelector() {
  const hostname = window.location.hostname;
  for (const [domain, selector] of Object.entries(subtitleSelectors)) {
    if (hostname.includes(domain)) {
      return selector;
    }
  }
  return null;
}

// 创建翻译后的字幕元素
function createTranslatedSubtitle(originalElement, translatedText) {
  const translatedElement = document.createElement('div');
  translatedElement.className = 'translated-subtitle';
  translatedElement.style.cssText = `
    color: #ff6b6b;
    font-size: 1.1em;
    margin-top: 5px;
    padding: 5px;
    background-color: rgba(0, 0, 0, 0.7);
    border-radius: 4px;
  `;
  translatedElement.textContent = translatedText;
  
  // 将翻译后的字幕插入到原始字幕后面
  const parent = originalElement.parentElement;
  if (parent) {
    parent.appendChild(translatedElement);
  }
}


// 检查并翻译字幕
async function checkAndTranslateSubtitles() {
  if (!isTranslating) return;

  const selector = getSubtitleSelector();
  if (!selector) return;

  try {
    const subtitleElements = document.querySelectorAll(selector);
    const element = subtitleElements[0];
    const currentSubtitle = element.textContent.trim();
    if (currentSubtitle === originalSubtitle) return;
    originalSubtitle = currentSubtitle;
    try {
      chrome.runtime.sendMessage({action: "UpdateSubTitle", message: currentSubtitle});
    } catch (error) {
      console.error('Error sending message to background:', error);
    }
    

  } catch (error) {
    console.error('Error in checkAndTranslateSubtitles:', error);
  }
}

// // 开始翻译
function startTranslation() {
  if (isTranslating) return;
  
  isTranslating = true;
  translationInterval = setInterval(checkAndTranslateSubtitles, 1000);

}

// 停止翻译
function stopTranslation() {
  if (!isTranslating) return;
  
  isTranslating = false;
  if (translationInterval) {
    clearInterval(translationInterval);
    translationInterval = null;
  }
  
  // 移除所有翻译后的字幕
  const translatedSubtitles = document.querySelectorAll('.translated-subtitle');
  translatedSubtitles.forEach(element => element.remove());
  
  // 通知background script翻译已停止
  try {
    chrome.runtime.sendMessage({action: "log", message: "Translation stopped"});
  } catch (error) {
    console.error('Error sending message to background:', error);
  }
}

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    if (request.action === "startTranslation") {
      startTranslation();
      chrome.runtime.sendMessage({action: "log", message: "Translation started"});
    } else if (request.action === "stopTranslation") {
      stopTranslation();
      chrome.runtime.sendMessage({action: "log", message: "Translation stopped"});
    } else if (request.action === "updateTranslatedSubtitle") {
      console.log(359,'updateTranslatedSubtitle', request.message)
      const selector = getSubtitleSelector();
      if (!selector) return;
        const subtitleElements = document.querySelectorAll(selector);
        const element = subtitleElements[0];

        // 检查是否已经有翻译
        const parent = element.parentElement;
        const existingTranslation = parent.querySelector('.translated-subtitle');
        if (existingTranslation) {
          existingTranslation.remove();
        }
      createTranslatedSubtitle(element, request.message);
    }
  } catch (error) {
    console.error('Error handling message:', error);
  }
  return true; // 保持消息通道开放
});

// // 页面加载完成后通知background script
window.addEventListener('load', () => {
  try {
    chrome.runtime.sendMessage({action: "log", message: "Content script loaded"});
  } catch (error) {
    console.error('Error sending load message:', error);
  }
}); 