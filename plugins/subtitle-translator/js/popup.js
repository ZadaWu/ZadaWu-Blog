document.addEventListener('DOMContentLoaded', function() {
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const status = document.getElementById('status');
  const apiKeyInput = document.getElementById('apiKey');
  const appidInput = document.getElementById('appId')
  const saveApiKeyBtn = document.getElementById('saveApiKey');
  console.log(7, saveApiKeyBtn)


  // Load saved API key
  chrome.storage.sync.get(['apiKey', 'appid'], function(result) {
    if (result.apiKey) {
      apiKeyInput.value = result.apiKey;
    }
    if (result.appid) {
      appidInput.value = result.appid;
    }
  });

  if (apiKeyInput.value.trim() && appidInput.value.trim()) {
    document.querySelector('.translation-section').style.display = 'block';
  }

  saveApiKeyBtn.addEventListener('click', function() {
    const apiKey = apiKeyInput.value.trim();
    const appid = appidInput.value.trim();
    console.log(apiKey, appid)
    if (apiKey && appid) {
      chrome.storage.sync.set({ 
        apiKey: apiKey,
        appid: appid 
      }, function() {
        document.querySelector('.translation-section').style.display = 'block';
        alert('API credentials saved successfully!');
      });
    } else {
      alert('Please enter both API key and App ID');
    }
  });

  // 检查当前标签页是否支持翻译
  function checkCurrentTab() {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({active: true, currentWindow: true}, async function(tabs) {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        const currentTab = tabs[0];
        const url = currentTab.url;
        
        // 检查URL是否支持
        if (url.includes('youtube.com') || url.includes('coursera.org') || url.includes('udemy.com')) {
          try {
            // 尝试注入content script
            await chrome.scripting.executeScript({
              target: { tabId: currentTab.id },
              files: ['js/content.js']
            });
            resolve(currentTab);
          } catch (error) {
            reject(new Error('Failed to inject content script'));
          }
        } else {
          reject(new Error('Current page is not supported'));
        }
      });
    });
  }

  async function translateText(text) {
    // 百度翻译API参数
    const appid = '20250513002356127';
    const salt = Date.now();
    const secretKey = 'B1nBvVIqNfKf1NFrLvtt'; // 替换为你的密钥
    const sign = MD5(appid + text + salt + secretKey);
    
    // 使用Fetch API发送请求
    try {
        const response = await fetch(`https://api.fanyi.baidu.com/api/trans/vip/translate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `q=${encodeURIComponent(text)}&from=en&to=zh&appid=${appid}&salt=${salt}&sign=${sign}`
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log(100, result)
        // document.getElementById('result').textContent = result.trans_result[0].dst;
    } catch (error) {
        console.error('翻译请求失败:', error);
        // document.getElementById('result').textContent = '翻译失败: ' + error.message;
    }
}


  // 向content script发送消息
  async function sendMessageToContentScript(tabId, message) {
    try {
      await chrome.tabs.sendMessage(tabId, message);
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }

  // Start translation
  startBtn.addEventListener('click', async function() {
    try {
      const currentTab = await checkCurrentTab();
      
      chrome.storage.sync.get(['apiKey'], async function(result) {
        if (!result.apiKey) {
          alert('Please enter your Baidu Translation API key first');
          return;
        }

        startBtn.style.display = 'none';
        stopBtn.style.display = 'block';
        status.textContent = 'Translation is active';
        status.className = 'status active';

        await sendMessageToContentScript(currentTab.id, {action: "startTranslation"})
        
      });
    } catch (error) {
      alert(error.message);
    }
  });

  // Stop translation
  stopBtn.addEventListener('click', async function() {
    try {
      startBtn.style.display = 'block';
      stopBtn.style.display = 'none';
      status.textContent = 'Translation is inactive';
      status.className = 'status inactive';

      const currentTab = await checkCurrentTab();
      await sendMessageToContentScript(currentTab.id, {action: "stopTranslation"});
    } catch (error) {
      alert(error.message);
    }
  });
}); 