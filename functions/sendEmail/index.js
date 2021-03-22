// 云函数入口文件
const cloud = require('wx-server-sdk')
//引入office操作类库
const officegen = require('officegen');
const fs = require('fs');
//引入发送邮件的类库
var nodemailer = require('nodemailer')

cloud.init({
  env: 'sxczgt-d6vfq',
  traceUser : true
});

const db = cloud.database();
const _ = db.command;
const reportCollection = db.collection('report');
const configCollection = db.collection('config');
const log = cloud.logger();





// 云函数入口函数
exports.main = async (event, context) => {
 
  var nowDate = new Date();
 
  var year = nowDate.getFullYear();
 
  var month = nowDate.getMonth() + 1 < 10 ? "0" + (nowDate.getMonth() + 1) : nowDate.getMonth() + 1;
 
  var day = nowDate.getDate() < 10 ? "0" + nowDate.getDate() : nowDate.getDate();
 
  var dateStr = year +''+ month  +''+ day;
  //获取传参
  console.log("event======" + event.record_id);
  let record_id = event.record_id;
  //查数据库记录并下载上传文件
  const report = reportCollection.doc(record_id);
  try {
    //从云服务器上获取到一条举报记录
    var record = await report.get();
  
    let fileIDs = record.data.fileIDs;
    console.log(fileIDs)
    //附件数组
    let tempFiles = [];
    if(fileIDs.length>0){
      const result = await cloud.getTempFileURL({
        fileList: fileIDs,
      })
      console.log(result.fileList);
      let len = result.fileList.length;
      console.log(len);
      for(let i = 0;i<len;i++){
        console.log("进入循环")
        tempFiles.push({
          filename: i+'_.png',
          path: result.fileList[i].tempFileURL
        })
      }
    }
    
    //封装一个word文档
    var docx = officegen ({
      'type': 'docx', // or 'xlsx', etc
    });

    let pObj = docx.createP({
      align : 'center'
    });
    pObj.addText('长治市农业综合行政执法队', {
      font_size: 22
    });
    pObj.addLineBreak();
    pObj.addText('农业执法举报受理单', {
      font_size: 22
    });
    pObj = docx.createP()
    pObj.addLineBreak();
    pObj = docx.createP()
    pObj.addText('编号: '+ dateStr +"  (           号)");
    pObj = docx.createP()
    pObj.addLineBreak();

    var table = [

      ['举报人',record.data.reporterName,'举报日期',record.data.reportTime],
      ['电话',record.data.reporterPhone,'违法行为发生经纬度',['经度：'+record.data.longitude, '纬度：'+record.data.latitude]],
      ['违法行为发生地',record.data.reportLocation,'',''],
      ['举报材料','一份','图片',fileIDs.length+' 张'],
      ['举报内容',['举报类型：'+record.data.reporterPolitic,record.data.reportProblem],'',''],
      ['受理机构','案件受理科','受理日期',''],
      ['案件受理科意见','','',''],
      ['分管队长意见','','',''],
      ['现场核查情况',['现场核查日期：     年    月    日 至       年    月    日 ', '附核查材料：     件     页    份（照片或图件     张）'],'',''],
      ['处理结果','','',''],
      ['向举报人反馈情况','','',''],
      ['备注','','','']
    ]
    
    var tableStyle = {
      tableColWidth: 4261,
      tableSize: 18,
      tableColor: "ada",
      tableAlign: "left",
      tableFontFamily: "Comic Sans MS",
      spacingBefor: 100, // default is 100
      spacingAfter: 100, // default is 100
      spacingLine: 140, // default is 240
      spacingLineRule: 'atLeast', // default is atLeast
      indent: 300, // table indent, default is 0
      fixedLayout: true, // default is false
      borders: true, // default is false. if true, default border size is 4
      borderSize: 4, // To use this option, the 'borders' must set as true, default is 4
      columns: [{ width: 1122 }, {width:4261}, { width: 1122 }, {width:4261}], // Table logical columns
    }

    docx.createTable (table, tableStyle);

    let out = fs.createWriteStream('/tmp/'+record.data._id+'.docx');
    out.on('finish', function() {
      console.log("写入完成。");
      out.close();
    });
    
    out.on('error', function (err) {
      console.log(err)
    })
    docx.generate(out,{
      'finalize': function ( written ) {
        console.log("生成完成。");
        console.log ( written );
        tempFiles.push({
          filename: 'report.docx',
          path: '/tmp/'+record.data._id+'.docx'
        })
       
      // 创建一个邮件对象
      var to = '';
      //从数据库获取发件对象email
      console.log('开始获取email，地点为：'+record.data.area);
      configCollection.where({
        area: _.eq(''+record.data.area)
      }).get().then(res => {
        if(0 == res.data.length){
          console.log('获取到的发送邮件为空，添加默认值')
          to = 'nyzf3701001@163.com;1014091930@qq.com'
        }else{
          to = to.concat(res.data[0].email);
        }
        var mail = {
          // 发件人
          from: '<1014091930@qq.com>',
          // 主题
          subject: '测试举报邮件发送',
          // 收件人
           to: to,
          //to: '377591031@qq.com;1014091930@qq.com',
          // 邮件内容，text或者html格式
          text: '附件为举报上传图片', //可以是链接，也可以是验证码
          attachments: tempFiles
        };
        // 创建一个SMTP客户端配置
        var config;
        var transporter;
        const configFromDb = configCollection.where({
          type: _.eq('@qq.com')
        }).get().then(res => {
          config = {
            host: res.data[0].host, //网易163邮箱 smtp.163.com
            port: res.data[0].port, //网易邮箱端口 25
            auth: {
              user: res.data[0].user, //邮箱账号
              pass: res.data[0].pass //邮箱的授权码
            }
          };
   // 创建一个SMTP客户端对象
          console.log(mail)
          transporter = nodemailer.createTransport(config);
          transporter.sendMail(mail);
        });
      });
      },
      'error': function ( err ) {
        console.log ( err );
      }
    });

    
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
  
}