// pages/index/starttipoff.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    term_checked:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {

  },

  gototipoffformpageWithName:function(e){
    app.globalData.nameFlag = 1;
    if(this.data.term_checked==true){
      wx.navigateTo({
        url: '/pages/index/tipoffFormWithName?nameFlag=' + app.globalData.nameFlag,
      })
    }
    else{
      wx.showToast({
        title : '请仔细阅读条款!',
        icon : 'none',
        duration: 1500
      })
    }
  },
  gototipoffformpageWithoutName: function (e) {
    app.globalData.nameFlag = 0;
    if (this.data.term_checked == true) {
      wx.navigateTo({
        url: '/pages/tipoffform/tipoffform?nameFlag=' + app.globalData.nameFlag,
      })
    }
    else {
      wx.showToast({
        title: '请仔细阅读条款!',
        icon: 'none',
        duration: 1500
      })
    }
  },
  
  onCheckboxChanged: function () {
    let that = this;
    that.data.term_checked = !that.data.term_checked;
    that.setData({
      term_checked:that.data.term_checked,
    })
  }

})