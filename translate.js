const crypto = require('crypto');
const fetch = require('node-fetch');

// 百度翻译 API 配置
const appid = '20250513002356127';
const key = 'B1nBvVIqNfKf1NFrLvtt';

// MD5 加密函数
function MD5(text) {
    return crypto.createHash('md5').update(text).digest('hex');
}

async function translateText(text, from = 'en', to = 'zh') {
    const salt = (new Date).getTime();
    const str1 = appid + text + salt + key;
    const sign = MD5(str1);

    try {
        const url = `https://api.fanyi.baidu.com/api/trans/vip/translate?q=${encodeURIComponent(text)}&appid=${appid}&salt=${salt}&from=${from}&to=${to}&sign=${sign}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        const data = await response.json();
        
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

async function translateWithRetry(text, from = 'en', to = 'zh', maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await translateText(text, from, to);
        } catch (error) {
            console.error(`Translation attempt ${i + 1} failed:`, error);
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
}

// 命令行参数处理
const args = process.argv.slice(2);
if (args.length === 0) {
    console.log('Usage: node translate.js "text to translate" [from] [to]');
    console.log('Example: node translate.js "Hello World" en zh');
    process.exit(1);
}

const text = args[0];
const from = args[1] || 'en';
const to = args[2] || 'zh';

// 执行翻译
translateWithRetry(text, from, to)
    .then(result => {
        console.log('Original:', text);
        console.log('Translated:', result);
    })
    .catch(error => {
        console.error('Translation failed:', error);
        process.exit(1);
    }); 