// pages/index/tipoffform.js
const app = getApp()
var util = require('../../utils/util.js');
var amapFile = require('../../libs/amap-wx.js');
var markersData = {
  latitude: '', //纬度
  longitude: '', //经度
  key: "62946283c95ea418dfddbcc879ff4201" //申请的高德地图key
};
const db = wx.cloud.database()
const rep = db.collection("report")
const _ = db.command;

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
    reporterPhone:'',
    indexLevel: " ",
    reporterPolitic: '',
    reportProblem: '',
    reportLocation: '',
    imgs: [], //本地图片地址数组
    tempFilePaths: [], //存储待上传图片的临时路径
    fileIDs: [], //存储返回的上传文件id
    //当前定位位置
    latitude: '',
    longitude: '',
    //行政区，用于区分邮件发送标的
    area :'',
  },
  //获取当前位置的经纬度
  loadInfo: function () {
    var that = this;

    wx.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success: function (res) {
        let latitude = res.latitude //维度
        let longitude = res.longitude //经度
        wx.chooseLocation({
          latitude: latitude,
          longitude: longitude, //经度
          success:function(res){
            that.setData({
              latitude: res.latitude,
              longitude: res.longitude //经度
            });
            that.loadCity(res.latitude, res.longitude);
          }
        })
      }
    })
  },
  //把当前位置的经纬度传给高德地图，调用高德API获取当前地理位置，天气情况等信息
  loadCity: function (latitude, longitude) {
    var that = this;
    var myAmapFun = new amapFile.AMapWX({
      key: markersData.key
    });
    myAmapFun.getRegeo({
      location: '' + longitude + ',' + latitude + '', //location的格式为'经度,纬度'
      success: function (data) {
        console.log(data);
        that.setData({
          reportLocation: data[0].name,
          //设置行政区
          area:data[0].regeocodeData.addressComponent.district,
        })
      },
      fail: function (info) {
        wx.showToast({
          title: info,
        })
      }
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
          longitude: res.longitude, //经度
        });
        that.loadCity(res.latitude, res.longitude);
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
    wx.chooseImage({
      sizeType: ['original', 'compressed'],
      sourceType: [type],
      success: function (res) {
        that.data.tempFilePaths = that.data.tempFilePaths.concat(res.tempFilePaths);
        console.log('图片路径')
        console.log(res.tempFilePaths)
        
        that.setData({
          tempFilePaths: that.data.tempFilePaths
        });
      }
    })
  },
  //上传服务器
  upImgs: function (imgurl, index, record_id, len) {
    var that = this;
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();
    var fileName = year + '' + month + '' + day + '' + hour + '' + minute + '' + second;
    wx.cloud.uploadFile({
      cloudPath: fileName + '_' + index + '.png', // 上传至云端的路径
      filePath: imgurl, // 小程序临时文件路径
      success: res => {
        // 更新存储的文件id
        rep.doc(record_id).update({
          // data 传入需要局部更新的数据
          data: {
            // 表示将 done 字段置为 true
            fileIDs: _.push(res.fileID)
          },
          success: function (res) {
            //文件全部存储成功后发送邮件
            if (index == len - 1) {
              wx.cloud.callFunction({
                name: 'sendEmail',
                data:{
                  record_id:record_id
                },
                success: function (res) {
                  console.log("发送成功", res)
                },
                fail: function (res) {
                  console.log("发送失败", res)
                }
              })
            }

          }
        })
      },
      fail: function(){
        wx.showToast({
          title: '图片上传出现错误，请联系管理员',
          icon: 'none',
          duration: 2000
        })
        return false
      }
    })
  },
  /**
   * 预览图片方法
   */
  listenerButtonPreviewImage: function (e) {
    let index = e.target.dataset.index;
    let that = this;
    wx.previewImage({
      current: that.data.tempFilePaths[index],
      urls: that.data.tempFilePaths,
    })
  },
  /**
   * 长按删除图片
   */
  deleteImage: function (e) {
    var that = this;
    var tempFilePaths = that.data.tempFilePaths;
    var index = e.currentTarget.dataset.index; //获取当前长按图片下标
    wx.showModal({
      title: '提示',
      content: '确定要删除此图片吗？',
      success: function (res) {
        if (res.confirm) {
          console.log('点击确定了');
          tempFilePaths.splice(index, 1);
        } else if (res.cancel) {
          console.log('点击取消了');
          return false;
        }
        that.setData({
          tempFilePaths
        });
      }
    })
  },
  reporterNameInput: function (e) {
    let that = this;
    that.setData({
      reporterName: e.detail.value
    })
  },

  reporterPhoneInput: function (e) {
    let that = this;
    that.setData({
      reporterPhone: e.detail.value
    })

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

  reportLocationInput: function (e) {
    let that = this;
    that.setData({
      reportLocation: e.detail.value
    })
  },

  problemInput: function (e) {
    let that = this;
    that.setData({
      reportProblem: e.detail.value
    })
  },



  formSubmit: function (e) {
    showLoading("提交中"); 
    let that = this;
    var myregPhone = /^(((1[0-9]{10})))$/;
    var myregIdNumber = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    if (
      that.data.reportLocation.length == 0 ||
      that.data.reportProblem.length == 0 ||
      that.data.reporterPhone.length == 0) {
      wx.showToast({
        title: '必填字段不能为空！',
        icon: 'none',
        duration: 1500
      })
      return false;
    }
    // 验证手机号是否正确
    if (!myregPhone.test(that.data.reporterPhone)) {
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
    //数据请求操作
    rep.add({
      data: {
        reportTime: that.data.time,
        reporterName: e.detail.value.reporterName,
        reporterPhone: e.detail.value.reporterPhone,
        reportProblem: e.detail.value.reportProblem,
        reportLocation: e.detail.value.reportLocation,
        fileIDs:that.data.fileIDs,
        longitude: e.detail.value.longitude,
        latitude: e.detail.value.latitude,
        area: that.data.area
      },
      success: function (res) {
        // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
        let len = that.data.tempFilePaths.length;
        if(len == 0){
          wx.cloud.callFunction({
            name: 'sendEmail',
            data:{
              record_id:res._id
            },
            success: function (res) {
              console.log("发送成功", res)
            },
            fail: function (res) {
              console.log("发送失败", res)
            }
          })
        }
        for (var i = 0; i < len; i++) {
          that.upImgs(that.data.tempFilePaths[i], i, res._id, len) //调用上传方法

        }
        hideLoading()
        wx.showModal({
          title: '提示',
          content: '提交成功',
          success(res) {
            wx.navigateBack({
              url: '/pages/index/clicktipoff',
              delta: 2
            })
          }
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

  // bindPoliticChange: function (e) {
  //   let that = this;
  //   console.log('picker发送选择改变，携带值为', e.detail.value)
  //   this.setData({
  //     indexPolitic: e.detail.value,
  //     reporterPolitic: that.data.arrayPolitic[e.detail.value]
  //   })
  // },

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

function showLoading(message) {
  if (wx.showLoading) {
    // 基础库 1.1.0 微信6.5.6版本开始支持，低版本需做兼容处理
    wx.showLoading({
      title: message,
      mask: true
    });
  } else {
    // 低版本采用Toast兼容处理并将时间设为20秒以免自动消失
    wx.showToast({
      title: message,
      icon: 'loading',
      mask: true,
      duration: 20000
    });
  }
}

function hideLoading() {
  if (wx.hideLoading) {
    // 基础库 1.1.0 微信6.5.6版本开始支持，低版本需做兼容处理
    wx.hideLoading();
  } else {
    wx.hideToast();
  }
}


　module.exports = {
　　showLoading:showLoading,
　　hideLoading:hideLoading
　}
