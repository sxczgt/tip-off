//app.js
App({
  onLaunch: function () {
    
    wx.cloud.init({
      env: 'sxczgt-d6vfq',
      traceUser : true
    })
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        } else {
          wx.showToast({
            title: '您的授权信息将不会在后台显示！',
            icon: "none",
            duration: 2000
          })
        }
      }
    })
  },
  globalData: {
    userInfo: null,
    nameFlag: null,
    // host: "http://10.10.10.10:86",
    // host: "http://110.16.89.187:11011",
    host: "https://jjjd.power.bhynm.net"
  }
})