const axios = require('axios');
const cheerio = require('cheerio');
const nodemailer = require('nodemailer');
const cron = require('node-cron');

const TARGET_RATE = 717.01;
require('dotenv').config();

// 从.env读取EMAIL_LIST并分割成数组
const EMAIL_LIST = process.env.EMAIL_LIST ? process.env.EMAIL_LIST.split(',') : ['1137152932@qq.com'];

async function fetchUsdRate() {
  try {
    console.log('正在获取美元汇率...');
    const response = await axios.get('https://www.boc.cn/sourcedb/whpj/index.html');
    const $ = cheerio.load(response.data);
    
    // 解析美元现汇卖出价
    const usdRow = $('tr:contains("美元")');
    const sellRate = usdRow.find('td:nth-child(4)').text().trim();
    
    return parseFloat(sellRate);
  } catch (error) {
    console.error('Error fetching USD rate:', error);
    return null;
  }
}

async function sendNotification(rate) {
  const transporter = nodemailer.createTransport({
    host: "smtp.163.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER || '****.com',
      pass: process.env.EMAIL_PASS || '***'
    }
  });

  const mailOptions = {
    from: `"汇率监控" <${process.env.EMAIL_USER || '****123.com'}>`,
    to: EMAIL_LIST.join(','),  // 发送给所有邮箱
    subject: `美元汇率警报: ${rate}`,
    text: `美元现汇卖出价已达到 ${rate}，请及时关注！`
  };

  await transporter.sendMail(mailOptions);
}

// 每2分钟检查一次
cron.schedule('*/2 * * * *', async () => {
  try {
    const rate = await fetchUsdRate();
    console.log(`正在检查美元汇率...当前汇率: ${rate || '获取失败'}`);
    if (rate && rate <= TARGET_RATE) {
      console.log(`警报: 美元汇率 ${rate}`);
      await sendNotification(rate);
    }
  } catch (error) {
    console.error('汇率检查出错:', error);
  }
});

console.log('美元汇率监控服务已启动...');