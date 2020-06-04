// pages/index/tipoffdetail.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    report: null,
    nameFlag : null,
    isDetails: "block",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let id = options.id;
    if (id != null) {
      let that = this;
      this.setData({
        nameFlag:app.globalData.nameFlag,
      })
      console.log(id);
      wx.request({
        // url: 'http://localhost:80/demo/report/detail/?id=' + id, //仅为示例，并非真实的接口地址 
        url: app.globalData.host+'/demo/report/detail/?id=' + id, 
        method: 'POST',
        header: {
          // "Content-Type": "application/x-www-form-urlencoded" // 默认值
          "Content-Type": "application/json;charset=UTF-8"
        },
        
        success: function (res) {
          console.log(res.data);
          that.setData({
            report: res.data,
            isDetails: "none",
          }); 
        }
        
      })
    }
    
  },
})