const axios = require('axios');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
require('dotenv').config();

const TARGET_PRICE = 146.5;
const API_URL = 'https://assets.msn.cn/service/Finance/Quotes?apikey=0QfOX3Vn51YCzitbLaRkTTBadtWpgTN8NZLW0C1SEM&activityId=E381A2B8-389E-428F-9AD7-2BAC59F53E0E&ocid=finance-utils-peregrine&cm=zh-cn&it=web&scn=ANON&ids=avyomw&wrapodata=false'; // 替换为你的接口地址

const EMAIL_LIST = process.env.EMAIL_LIST ? process.env.EMAIL_LIST.split(',') : ['1137152932@qq.com'];

async function fetchJpyPrice() {
  try {
    const response = await axios.get(API_URL);
    // 假设返回格式为 { data: [{ price: xxx }, ...] }
    // console.log(15, response)
    const price = response.data[0].price;
    return parseFloat(price);
  } catch (error) {
    console.error('Error fetching JPY price:', error);
    return null;
  }
}

async function sendNotification(price) {
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
    to: EMAIL_LIST.join(','),
    subject: `日元价格警报: ${price}`,
    text: `日元价格已达到 ${price}，请及时关注！`
  };

  await transporter.sendMail(mailOptions);
}

// 每1分钟检查一次
cron.schedule('*/1 * * * *', async () => {
  try {
    const price = await fetchJpyPrice();
    console.log(`正在检查日元价格...当前价格: ${price || '获取失败'}`);
    if (price && price > TARGET_PRICE) {
      console.log(`警报: 日元价格 ${price}`);
      await sendNotification(price);
    }
  } catch (error) {
    console.error('价格检查出错:', error);
  }
});

console.log('日元价格监控服务已启动...');
