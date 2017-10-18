// pages/archive/index.js
var WxParse = require('../../wxParse/wxParse.js');
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
	
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		this.setData({
			uid:options.uid
		})
	},
	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {
		this.get_info(this.data.uid);
	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {
	
	},
	get_info:function(uid){
		let that=this;
		wx.request({
			header: {'content-type': 'application/x-www-form-urlencoded' },
			method: 'POST',
			data: {'uid': uid },
			url: 'https://api.yunhuangtech.com/house/home/index/get_news_info',
			success:function(e){
				let data=e.data;
				if(data.code==200){
					that.setData({
						content:data.data
					});
					// 微信文章转换
						WxParse.wxParse('article', 'html', that.data.content.post_content, that, 5);
				}
			}
		})
	}
})