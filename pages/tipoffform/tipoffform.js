// pages/index/tipoffform.js
const app = getApp()
var util = require('../../utils/util.js');
var amapFile = require('../../libs/amap-wx.js');
var markersData = {
 latitude: '',//纬度
 longitude: '',//经度
 key: "62946283c95ea418dfddbcc879ff4201"//申请的高德地图key
};
Page({

  /**
   * 页面的初始数据
   */
  data: {
    report: null,
    isDetails: "block",
    time: '',
    reportedName: '',
    gender: '男',
    politic: '不详',
    company: '',
    position: '',
    level: '不详',
    problem: '',
    phone: '',
    idNumber: '',
    nameFlag: null,
    arrayGender: ['男', '女'],
    objectArrayGender: [{
        id: 0,
        name: '男'

      },
      {
        id: 1,
        name: '女'
      },

    ],
    indexGender: " ",
    indexGender1: " ",
    arrayPolitic: ['农药', '种子', '肥料', '兽药', '农产品质量', '渔政', '其他'],
    objectArrayPolitic: [{
        id: 0,
        name: '农药'
      },
      {
        id: 1,
        name: '种子'
      },
      {
        id: 2,
        name: '肥料'
      },
      {
        id: 3,
        name: '兽药'
      },
      {
        id: 5,
        name: '农产品质量'
      },
      {
        id: 6,
        name: '渔政'
      },
      {
        id: 7,
        name: '其他'
      },
    ],
    indexPolitic: " ",
    indexPolitic1: " ",
    arrayLevel: ['普通员工', '处科级', '厂局级', '不详'],
    objectArrayLevel: [{
        id: 0,
        name: '普通员工'
      },
      {
        id: 1,
        name: '处科级'
      },
      {
        id: 2,
        name: '厂局级'
      },
      {
        id: 3,
        name: '不详'
      },
    ],
    indexLevel: " ",
    reporterPolitic: '',
    reportProblem: '',
    imgs: [], //本地图片地址数组
    picPaths: [], //网络路径
    fileIDs:[],//存储返回的上传文件id

    //当前定位位置
    latitude: '',
    longitude: '',
    location: '',
  },
//获取当前位置的经纬度
loadInfo: function(){
  var that=this;
 
  wx.getLocation({
   type: 'gcj02', //返回可以用于wx.openLocation的经纬度
   success: function (res) {
    var latitude = res.latitude//维度
    var longitude = res.longitude//经度
    wx.chooseLocation({
      latitude: latitude,
      longitude: longitude//经度
    })
    that.loadCity(latitude,longitude);
   }
  })
 },
//把当前位置的经纬度传给高德地图，调用高德API获取当前地理位置，天气情况等信息
loadCity: function (latitude, longitude){
  var that=this;
  var myAmapFun = new amapFile.AMapWX({ key: markersData.key });
  myAmapFun.getRegeo({
   location: '' + longitude + ',' + latitude + '',//location的格式为'经度,纬度'
   success: function (data) {
    that.setData({
      location: data[0].name
    })
   },
   fail: function (info) { }
  });
 
  myAmapFun.getWeather({
   success: function (data) {
    that.setData({
     weather: data
    })
    //成功回调
   },
   fail: function (info) {
    //失败回调
    console.log(info)
   }
  })
 },
/**
 * 生命周期函数--监听页面加载
 */
onLoad: function (options) {
  let that = this;
  let id = options.id;
  var time = util.formatTime(new Date());
  this.setData({
    nameFlag: options.nameFlag,
    time: time,
  });
  wx.getLocation({
    type: 'gcj02', //返回可以用于wx.openLocation的经纬度
    success: function (res) {
      that.setData({
        latitude: res.latitude,
        longitude: res.longitude//经度
      });
     that.loadCity(res.latitude,res.longitude);
    }
   })
  
},
//添加上传图片
chooseImageTap: function () {
  var that = this;
  wx.showActionSheet({
    itemList: ['从相册中选择', '拍照'],
    itemColor: "#00000",
    success: function (res) {
      if (!res.cancel) {
        if (res.tapIndex == 0) {
          that.chooseWxImage('album')
        } else if (res.tapIndex == 1) {
          that.chooseWxImage('camera')
        }
      }
    }
  })
},
// 图片本地路径
chooseWxImage: function (type) {
  var that = this;
  var imgsPaths = that.data.imgs;
  wx.chooseImage({
    sizeType: ['original', 'compressed'],
    sourceType: [type],
    success: function (res) {
      var len = res.tempFilePaths.length;
      if (len > 9) {
        wx.showToast({
          title: '请小于9张图片',
          duration: 2000
        })
        return
      }
      console.log(len)
      console.log(res.tempFilePaths[0]);
      for (var i = 0; i < len; i++) {
        that.upImgs(res.tempFilePaths[i], i) //调用上传方法
      }

    }
  })
},
//上传服务器
upImgs: function (imgurl, index,fileID) {
  var that = this;
  var sec = new Date().getMilliseconds.toString;
  wx.cloud.uploadFile({
    cloudPath: sec + index + '.jpg', // 上传至云端的路径
    filePath: imgurl, // 小程序临时文件路径
    success: res => {
      // 返回文件 ID
      console.log(res.fileID)
      that.fileIDs[index] = res.fileID
      wx.showToast({
        title: '上传成功！',
        icon: 'none',
        duration: 3000
      })
    },
    fail: console.error
  })
},
reportedNameInput: function (e) {
  let that = this;
  that.setData({
    reportedName: e.detail.value
  })
},

reporterPhoneInput: function (e) {
  let that = this;
  that.setData({
    reporterPhone: e.detail.value
  })
  console.log(e.detail.value);
},

politicInput: function (e) {
  let that = this;
  that.setData({
    politic: e.detail.value
  })
},

companyInput: function (e) {
  let that = this;
  that.setData({
    company: e.detail.value
  })
},

positionInput: function (e) {
  let that = this;
  that.setData({
    position: e.detail.value
  })
},

levelInput: function (e) {
  let that = this;
  that.setData({
    level: e.detail.value
  })
},

problemInput: function (e) {
  let that = this;
  that.setData({
    reportProblem: e.detail.value
  })
},



formSubmit: function (e) {
  let that = this;
  var myregPhone = /^(((1[0-9]{10})))$/;
  var myregIdNumber = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
  if (
    that.data.reporterPolitic.length == 0 ||
    that.data.reportProblem.length == 0) {
    wx.showToast({
      title: '必填字段不能为空！',
      icon: 'none',
      duration: 1500
    })
    return false;
  }
  // 验证手机号是否正确
  if (that.data.reporterPhone.length != 0 && !myregPhone.test(that.data.reporterPhone)) {
    wx.showToast({
      title: '手机号有误！',
      icon: 'none',
      duration: 2000
    })
    return false
  }
  // 验证身份证号是否正确
  // if (that.data.idNumber.length != 0 && !myregIdNumber.test(that.data.idNumber)) {
  //   wx.showToast({
  //     title: '身份证号有误',
  //     icon: 'none',
  //     duration: 2000
  //   })
  //   return false
  // }
  // 页面跳转

  const db = wx.cloud.database()
  const rep = db.collection("report")
  rep.add({

    data: {
      reportTime: that.data.time,
      reporterName: e.detail.value.reporterName,
      reporterPhone: e.detail.value.reporterPhone,
      reporterPolitic: e.detail.value.reporterPolitic,
      reportProblem: e.detail.value.reportProblem,
      reportLocation: e.detail.value.reportLocation,
      userInfo: app.globalData.userInfo.nickName
    },
    success: function (res) {
      // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
      console.log(res)
      wx.showToast({
        title: '提交成功！',
        icon: 'success',
        duration: 3000
      })
      wx.navigateBack({
        url: '/pages/index/clicktipoff',
        delta: 2
      })
    }

  })
  // wx.request({
  //   url: app.globalData.host + '/demo/report/add',
  //   method: 'POST',
  //   header: {
  //     "Content-Type": "application/x-www-form-urlencoded" // 默认值
  //     // "Content-Type": "application/json;charset=UTF-8"
  //   },
  //   data: {
  //     reportTime: that.data.time,
  //     reporterName: e.detail.value.reporterName,
  //     reporterPhone: e.detail.value.reporterPhone,
  //     reporterPolitic: e.detail.value.reporterPolitic,
  //     reporterCompany: e.detail.value.reporterCompany,
  //     reportProblem: e.detail.value.reportProblem,
  //     userInfo: app.globalData.userInfo.nickName,
  //   },
  //   success: function(res) {
  //     console.log(res.data); //这里打印出提交成功信息
  //     wx.showToast({
  //       title: '提交成功！',
  //       icon: 'success',
  //       duration: 3000
  //     })
  //     wx.navigateBack({
  //       url: '/pages/index/clicktipoff',
  //       delta: 2
  //     })
  //   },
  // })
},

// 下拉框选项
bindGenderChange: function (e) {
  let that = this;
  console.log('bindGenderChange picker发送选择改变，携带值为', e.detail.value)
  this.setData({
    indexGender: e.detail.value,
    gender: that.data.arrayGender[e.detail.value]
  })
},

bindPoliticChange: function (e) {
  let that = this;
  console.log('picker发送选择改变，携带值为', e.detail.value)
  this.setData({
    indexPolitic: e.detail.value,
    reporterPolitic: that.data.arrayPolitic[e.detail.value]
  })
},

bindGenderChange1: function (e) {
  var that = this;
  console.log('bindGenderChange1 picker发送选择改变，携带值为', e.detail.value)
  this.setData({
    indexGender1: e.detail.value,
    gender: that.data.arrayGender[e.detail.value]
  })
},

bindPoliticChange1: function (e) {
  let that = this;
  console.log('picker发送选择改变，携带值为', e.detail.value)
  this.setData({
    indexPolitic1: e.detail.value,
    politic: that.data.arrayPolitic[e.detail.value]
  })
},

bindLevelChange: function (e) {
  let that = this;
  console.log('picker发送选择改变，携带值为', e.detail.value)
  this.setData({
    indexLevel: e.detail.value,
    level: that.data.arrayLevel[e.detail.value]
  })
},

})