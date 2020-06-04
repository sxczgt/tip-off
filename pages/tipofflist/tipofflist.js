// pages/index/tipofflist.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    reportList:[],
    nickName:null,
    dataEmpty:true,
    reporterName:null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.data.nickName = options.nickName;
    that.setData({
      nickName: that.data.nickName,
    });
    wx.request({
      url: app.globalData.host+'/demo/report/list?userInfo=' + that.data.nickName,
      method: 'POST',
      header: {
        // "Content-Type": "application/x-www-form-urlencoded" // 默认值
        "Content-Type": "application/json;charset=UTF-8"
      },
      success: function (res) {
        that.data.reportList = res.data;
        that.data.dataEmpty = res.data.total == 0;
        console.log(res.data);
        that.setData({
          reportList:res.data.rows,
          dataEmpty:res.data.total==0
        }) 
        // console.log(res.data.rows[4].reporterName);   
      }
      

    })
  },

  reportdetail: function (e) {
      let id = e.currentTarget.dataset.index;
      wx.navigateTo({
        url: '/pages/tipoffdetail/tipoffdetail?id='+id,
         
      })
  }



})