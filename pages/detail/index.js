// pages/detail/detail.js
var WxParse = require('../../wxParse/wxParse.js');
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		markers: [
			{
				iconPath: '../images/mark.png',
				id: 1,
				latitude: '',
				longitude: '',
				callout: {
					content: '',
					borderRadius: 5,
					padding: 5,
					bgColor: '#ffffff',
					color: '#000000',
					display: 'ALWAYS'
				}
			},
		]
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		this.setData({
			detail_uid:options.uid,
		});
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {
	
	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {
		this.get_info(this.data.detail_uid);
	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () {
	
	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () {
	
	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function () {
	
	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {
	
	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {
		let that=this;
		return{
			title:that.data.detail.name+'('+that.data.detail.acreage+'㎡+'+that.data.detail.price+'万)',
		}
	},
	get_info:function(args){
		let that=this;
		wx.request({
			header: { 'content-type': 'application/x-www-form-urlencoded' },
			method: 'POST',
			data: {'uid':args},
			url: 'https://api.yunhuangtech.com/house/home/index/get_house_info',
			success: function (data) { 
				let info=data.data;
				if(info.code==200){
					// 设置图片列表
					var imgs=info.data.images;
					var imglist=imgs.split(';');
					info.data.images=imglist;
					// 转换地图坐标
					var map = JSON.parse(info.data.map);
					map = that.Convert_BD09_To_GCJ02(map.lat,map.lng);
					// 设置标签
					var tags=info.data.tags.split(' ');
					info.data.tags=tags;
					that.setData({
						'markers[0].latitude':map.lat,
						'markers[0].longitude': map.lng,
						'markers[0].callout.content': info.data.location_d,
					});
					info.data.map=map;
					WxParse.wxParse('article', 'html', info.data.description, that, 5);
					that.setData({
						detail:info.data
					});
				}
			}              
		})
	},
	// 地图信息转换
	Convert_BD09_To_GCJ02: function(lat,lng){
		var x_pi = 3.14159265358979324 * 3000.0 / 180.0;
		var x = lng - 0.0065;
		var y = lat - 0.006;
		var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
		var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
		var lng = z * Math.cos(theta);
		var lat = z * Math.sin(theta);
		return {'lng':lng, 'lat':lat};
	},
	// 打开导航
	openNavi:function(){
		var that = this;
		console.log('导航');
		wx.openLocation({
			latitude: that.data.detail.map.lat,
			longitude: that.data.detail.map.lng,
			scale: 28,
			complete: function () {
				console.log(this.data);
			}
		})  
	},
	// 拨打电话
	bindCall:function(e){
		let phoneNumber=e.currentTarget.dataset.tel;
		wx.makePhoneCall({
			phoneNumber:phoneNumber,
			success:function(){
				console.log('拨打成功');
			},
			error:function(e){
				console.log(e);
			},
			complete(){
				console.log('完成');
			}
		});
	}
})