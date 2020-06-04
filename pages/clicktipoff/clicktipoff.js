// pages/index/clicktipoff.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },

  getUserInfo: function(e) {
    // 拿到授权信息
    console.log(e);
    if (e.detail.userInfo) {
      app.globalData.userInfo = e.detail.userInfo
      this.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true
      });
    } else {
      return false;
    }
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
    // console.log(app.globalData.userInfo)
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },

  gotostarttipoffpage: function() {
    console.log(app.globalData.userInfo)
    wx.request({
      url: app.globalData.host + '/demo/report/limitReport?userInfo=' + app.globalData.userInfo.nickName,
      method: 'POST',
      header: {
        // "Content-Type": "application/x-www-form-urlencoded" // 默认值
        "Content-Type": "application/json;charset=UTF-8"
      },
      success: function(res) {
        if(res.data == true){
          wx.navigateTo({
            url: '/pages/starttipoff/starttipoff',
          })
        }else{
          wx.showToast({
            title: '每天仅限举报一次!',
            icon: 'none',
            duration: 2000,

          })
        }
      },
      fail: function(){
        wx.showToast({
          title: '调用失败！',
          icon: 'none',
          duration: 2000,
        })
      }
      
    })
    
  },

  onReportList: function() {
    //console.log(this.data.userInfo.nickName);
    wx.navigateTo({
      url: '/pages/tipofflist/tipofflist?nickName=' + app.globalData.userInfo.nickName,
    });

  },
})