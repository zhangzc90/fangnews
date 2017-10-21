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
				width:20,
				height:20,
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
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {
		this.get_info(this.data.detail_uid);
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
					if(imgs){
						var imglist = imgs.split(';');
						info.data.images = imglist;
					}
					// 转换地图坐标
					if(info.data.map){
						var map = JSON.parse(info.data.map);
						map = that.Convert_BD09_To_GCJ02(map.lat, map.lng);
						info.data.map = map;
						// 设置markers地图标记
						that.setData({
							'markers[0].latitude': map.lat,
							'markers[0].longitude': map.lng,
							'markers[0].callout.content': info.data.location_d,
						});
					}
					// 设置标签
					if (info.data.tags){
						var tags = info.data.tags.split(' ');
						info.data.tags = tags;
					}
				
					// 微信文章转换
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
		wx.getSetting({
			success: (res) => {
				console.log(res);
				if (!res.authSetting['scope.userLocation']) {
					wx.authorize({
						scope: 'scope.userLocation',
						success() {
							wx.openLocation({
								latitude: that.data.detail.map.lat,
								longitude: that.data.detail.map.lng,
								scale: 28,
							})  
						}
					})
				}else{
					wx.openLocation({
						latitude: that.data.detail.map.lat,
						longitude: that.data.detail.map.lng,
						scale: 28,
					})  
				}
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
			}
		});
	}
})