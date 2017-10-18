// pages/news/index.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		page:1,
		tailDisplay:'none',
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
	
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
		this.get_list(this.data.page);
	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function () {
		wx.showNavigationBarLoading() //在标题栏中显示加载
		this.get_list(1);
	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {
		wx.showNavigationBarLoading() //在标题栏中显示加载
		this.get_list(this.data.page);
	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {
	
	},
	bindOpenUrl:function(e){
		let uid=e.currentTarget.dataset.uid;
		wx.navigateTo({
			url: '/pages/archive/index?uid='+uid,
		})
	},
	get_list:function(page){
		var that=this;
		wx.request({
			header: { 'content-type': 'application/x-www-form-urlencoded' },
			method: 'POST',
			data:{'page':page},
			url: 'https://api.yunhuangtech.com/house/home/index/get_news_list',
			success:function(e){
				if(e.data.code==200){
					let elist = e.data.data.list;
					let list=[];
					list=list.concat(elist);
					that.setData({
						page: that.data.page + 1,
						list: list
					});
				}else{
					that.setData({
						tailDisplay:'block',
					});
				}
			
			},
			complete:function () {
				wx.hideNavigationBarLoading() //完成停止加载
				wx.stopPullDownRefresh() //停止下拉刷新
			}
		})
	}
})