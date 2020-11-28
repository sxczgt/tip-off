// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database();
const reportCollection = db.collection('report');
const log = cloud.logger();
//引入发送邮件的类库
var nodemailer = require('nodemailer')
// 创建一个SMTP客户端配置
var config = {
  host: 'smtp.qq.com', //网易163邮箱 smtp.163.com
  port: 465, //网易邮箱端口 25
  auth: {
    user: '1014091930@qq.com', //邮箱账号
    pass: 'tzzrxelzfkbtbahe' //邮箱的授权码
  }
};
// 创建一个SMTP客户端对象
var transporter = nodemailer.createTransport(config);
// 云函数入口函数
exports.main = async(event, context) => {
  //获取传参
    console.log("event======"+event.record_id);
    let record_id = event.record_id;
    //查数据库记录并下载上传文件
    const report = reportCollection.doc(record_id);
    
    try {
      var data = await report.get();
      let fileIDs = data.data.fileIDs;
    } catch (error) {
      log.info({
        name: error,
        cost: 10,
        attributes: {
          width: 100,
          height: 200,
        },
        colors: ['red', 'blue'],
      })
    }
    
  // 创建一个邮件对象
  var mail = {
    // 发件人
    from: '来自郭涛 <1014091930@qq.com>',
    // 主题
    subject: '测试举报邮件发送',
    // 收件人
     //to: '377591031@qq.com',
    to: '1014091930@qq.com',
    // 邮件内容，text或者html格式
    text: 'cs', //可以是链接，也可以是验证码
    // attachments:[{
    //   filename:'pic.zip',
    //   path:'./temp/pic.zip'

    // },
    // {
    
    //   filename:'report.docx',
    //   path:'./temp/report.docx'

    // }]
  };

  let res = await transporter.sendMail(mail);
  return res;
}