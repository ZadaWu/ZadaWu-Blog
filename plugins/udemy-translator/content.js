// content.js
let isInitialized = false;


// 配置百度翻译 API
const appid = '**';
const key = '**';


// 翻译函数
async function translateText(text) {
    const salt = (new Date).getTime();
    const from = 'en';
    const to = 'zh';
    const str1 = appid + text + salt + key;
    const sign = MD5(str1);

    try {
        const data = await new Promise((resolve, reject) => {
            $.ajax({
                url: 'https://api.fanyi.baidu.com/api/trans/vip/translate',
                type: 'GET',
                dataType: 'jsonp',
                data: {
                    q: text,
                    appid: appid,
                    salt: salt,
                    from: from,
                    to: to,
                    sign: sign
                },
                success: function(data) {
                    resolve(data);
                },
                error: function(error) {
                    reject(error);
                }
            });
        });

        if (data && data.trans_result && data.trans_result[0]) {
            return data.trans_result[0].dst;
        } else {
            console.error('Translation response:', data);
            throw new Error('Translation failed');
        }
    } catch (error) {
        console.error('Translation error:', error);
        return text;
    }
}

// 设置观察器来监听字幕变化
function setupObserver() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                const subtitles = document.querySelectorAll('.well--text--J1-Qi');
                subtitles.forEach(async (subtitle) => {
                    if (!subtitle.dataset.translated) {
                        const originalText = subtitle.textContent.trim();
                        
                        if (originalText) {
                            try {
                                const translatedText = await translateText(originalText);
                                
                                const translatedSpan = document.createElement('span');
                                translatedSpan.textContent = ` (${translatedText})`;
                                translatedSpan.style.color = '#ff9900';
                                
                                subtitle.appendChild(translatedSpan);
                                subtitle.dataset.translated = 'true';
                            } catch (error) {
                                console.error('Translation error:', error);
                            }
                        }
                    }
                });
            }
        });
    });

    const subtitleContainer = document.querySelector('.well--text--J1-Qi');
    if (subtitleContainer) {
        observer.observe(subtitleContainer.parentElement, {
            childList: true,
            subtree: true
        });
    }
}

// 初始化函数
async function initializeTranslator() {
    // 确保 jQuery 已加载
    // await injectJQuery();
    
    const checkForSubtitles = setInterval(() => {
        const subtitleContainer = document.querySelector('.well--text--J1-Qi');
        if (subtitleContainer) {
            clearInterval(checkForSubtitles);
            setupObserver();
        }
    }, 1000);
}

// 启动翻译器
initializeTranslator();

// 监听 URL 变化
let lastUrl = location.href;
new MutationObserver(() => {
    if (location.href !== lastUrl) {
        lastUrl = location.href;
        initializeTranslator();
    }
}).observe(document, { subtree: true, childList: true });

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

async function translateWithRetry(text, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await translateText(text);
        } catch (error) {
            console.error(`Translation attempt ${i + 1} failed:`, error);
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
}

// 在扩展的 popup 或选项页面中添加配置
chrome.storage.sync.get(['enabled', 'targetLanguage'], (result) => {
    const enabled = result.enabled !== undefined ? result.enabled : true;
    const targetLanguage = result.targetLanguage || 'zh';
    
    if (enabled) {
        initializeTranslator();
    }
});

function showLoadingIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'translation-loading';
    indicator.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 5px 10px;
        border-radius: 4px;
        z-index: 9999;
    `;
    indicator.textContent = '翻译中...';
    document.body.appendChild(indicator);
}

function hideLoadingIndicator() {
    const indicator = document.getElementById('translation-loading');
    if (indicator) {
        indicator.remove();
    }
}