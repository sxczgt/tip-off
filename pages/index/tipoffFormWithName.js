// pages/index/tipoffform.js
const app = getApp()
var util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    report: null,
    isDetails: "block",
    time: '',
    // date: '2019-01-01',
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
    reporterName: '',
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
    arrayPolitic: ['中共党员', '共青团员', '群众', '不详'],
    objectArrayPolitic: [{
        id: 0,
        name: '中共党员'
      },
      {
        id: 1,
        name: '共青团员'
      },
      {
        id: 2,
        name: '群众'
      },
      {
        id: 3,
        name: '不详'
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

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let id = options.id;
    let that = this;
    var time = util.formatTime(new Date());
    this.setData({
      nameFlag: options.nameFlag, 
      time: time
    });
    if (id != null) {
      console.log(id);
      wx.request({
        url: app.globalData.host + '/demo/report/detail/?id=' + id,
        method: 'POST',
        header: {
          // "Content-Type": "application/x-www-form-urlencoded" // 默认值
          "Content-Type": "application/json;charset=UTF-8"
        },
        success: function(res) {
          that.setData({
            report: res.data,
            isDetails: "none",
          });
        }
      })
    }
  },

  reportedNameInput: function(e) {
    let that = this;
    that.setData({
      reportedName: e.detail.value
    })
  },

  genderInput: function(e) {
    let that = this;
    that.setData({
      gender: e.detail.value
    })
  },

  politicInput: function(e) {
    let that = this;
    that.setData({
      politic: e.detail.value
    })
  },

  companyInput: function(e) {
    let that = this;
    that.setData({
      company: e.detail.value
    })
  },

  positionInput: function(e) {
    let that = this;
    that.setData({
      position: e.detail.value
    })
  },

  levelInput: function(e) {
    let that = this;
    that.setData({
      level: e.detail.value
    })
  },

  problemInput: function(e) {
    let that = this;
    that.setData({
      problem: e.detail.value
    })
  },

  reporterNameInput: function(e) {
    let that = this;
    that.setData({
      reporterName: e.detail.value
    })
  },

  formSubmit: function(e) {
    let that = this;
    this.setData({
      phone: e.detail.value.reporterPhone,
      idNumber: e.detail.value.reporterIdNumber
    })
    var myregPhone = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
    var myregIdNumber = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    if (that.data.gender.length != 1 ||
      that.data.politic.length == 0 ||
      that.data.position.length == 0 ||
      that.data.problem.length == 0 ||
      that.data.company.length == 0 ||
      that.data.level.length == 0 ||
      that.data.reportedName.length == 0 ||
      that.data.reporterName.length == 0) {
      wx.showToast({
        title: '必填字段不能为空！',
        icon: 'none',
        duration: 1500
      })
      return false;
    }
    // 验证手机号是否正确
    if (that.data.phone.length != 0 && !myregPhone.test(that.data.phone)) {
      wx.showToast({
        title: '手机号有误！',
        icon: 'none',
        duration: 2000
      })
      return false
    }
    // 验证身份证号是否正确
    if (that.data.idNumber.length != 0 && !myregIdNumber.test(that.data.idNumber)) {
      wx.showToast({
        title: '身份证号有误',
        icon: 'none',
        duration: 2000
      })
      return false
    }
    // 页面跳转
    wx.request({
      url: app.globalData.host + '/demo/report/add',
      method: 'POST',
      header: {
        "Content-Type": "application/x-www-form-urlencoded" // 默认值
        // "Content-Type": "application/json;charset=UTF-8"
      },
      data: {
        reportTime: that.data.time,
        reporterName: e.detail.value.reporterName,
        reporterGender: e.detail.value.reporterGender,
        reporterIdNumber: e.detail.value.reporterIdNumber,
        reporterPhone: e.detail.value.reporterPhone,
        reporterPolitic: e.detail.value.reporterPolitic,
        reporterCompany: e.detail.value.reporterCompany,
        reporterPosition: e.detail.value.reporterPosition,
        reportedName: e.detail.value.reportedName,
        reportedGender: that.data.gender,
        reportedPolitic: that.data.politic,
        reportedCompany: e.detail.value.reportedCompany,
        reportedPosition: e.detail.value.reportedPosition,
        reportedLevel: that.data.politic,
        reportTitle: e.detail.value.reportTitle,
        reportProblem: e.detail.value.reportProblem,
        userInfo: app.globalData.userInfo.nickName,
      },
      success: function(res) {
        console.log(res.data);
        wx.showToast({
          title: '提交成功！！！', //这里打印出提交成功
          icon: 'success',
          duration: 2000
        })
        wx.navigateBack({
          url: '/pages/index/clicktipoff',
          delta: 2
        })
      },
    })
},

bindDateChange: function(e) {
  console.log('picker发送选择改变，携带值为', e.detail.value)
  this.setData({
    date: e.detail.value
  })
},

bindGenderChange: function(e) {
  let that = this;
  console.log('picker发送选择改变，携带值为', e.detail.value)
  this.setData({
    indexGender: e.detail.value,
    gender: that.data.arrayGender[e.detail.value]
  })
},

bindPoliticChange: function(e) {
  let that = this;
  console.log('picker发送选择改变，携带值为', e.detail.value)
  this.setData({
    indexPolitic: e.detail.value,
    politic: that.data.arrayPolitic[e.detail.value]
  })
},

bindGenderChange1: function(e) {
  var that = this;
  this.setData({
    indexGender1: e.detail.value,
    gender: that.data.arrayGender[e.detail.value]
  })
  console.log(e.detail.value);
},

bindPoliticChange1: function(e) {
  let that = this;
  console.log('picker发送选择改变，携带值为', e.detail.value)
  this.setData({
    indexPolitic1: e.detail.value,
    politic: that.data.arrayPolitic[e.detail.value]
  })
},

bindLevelChange: function(e) {
  let that = this;
  console.log('picker发送选择改变，携带值为', e.detail.value)
  this.setData({
    indexLevel: e.detail.value,
    level: that.data.arrayLevel[e.detail.value]
  })
}



})