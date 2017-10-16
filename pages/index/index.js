//index.js
//获取应用实例
const app = getApp()

Page({
    data: {
        userInfo: {},
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        region:['海南省','海口市'],
        price:[
            {
                name:'1000-1500元',
                low:'1000',
                high:'1500'
            },
            {
                name: '1500-2000元',
                low: '1500',
                high: '2000'
            },
            {
                name: '2000元以上',
                low: '2000',
                high: ''
            },
        ],
        floors:[
            {
                name: '低层', 
            },
            {
                name: '中层', 
            },
            {
                name: '高层', 
            },
            {
                name: '别墅',
            },
        ],
        layout:[
            {
                name: '一室一厅',
            },
            {
                name: '两室一厅',
            },
            {
                name: '三室一厅', 
            },
            {
                name: '四室一厅',
            }
        ],
        page:1,
        tailDisplay:'none',
        dataList:[]
    },

    onLoad: function () {
        if (app.globalData.userInfo) {
            this.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: true
            })
        }else if (this.data.canIUse){
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
    onShow:function(){
        // 获取列表数据
        this.get_list(this.data.page);
    },
    getUserInfo: function(e) {
        console.log(e)
        app.globalData.userInfo = e.detail.userInfo
        this.setData({
            userInfo: e.detail.userInfo,
            hasUserInfo: true
        })
    },


    //事件处理函数

    // 区域变动
    bindAreaChange:function(e){
        console.log(e.detail.value);
    },
    // 价格变更
    bindPriceChange:function(e){
        let index=e.detail.value;
        console.log(this.data.price[index]);
    },
    // 楼层变更
    bindFloorsChange:function(e){
        console.log(e.detail.value);
    },
    //打开详情页   
    openDetail:function(e){
        let uid=e.currentTarget.dataset.uid
        wx.navigateTo({
            url: '/pages/detail/index?uid='+uid,
        })
    },
    // 下拉刷新
    onPullDownRefresh:function(e){       
        console.log('下拉刷新');
        wx.showNavigationBarLoading() //在标题栏中显示加载
        this.get_list(1);     
    },
    // 上拉加载
    onReachBottom:function(e){
        console.log('上拉加载');
        wx.showNavigationBarLoading() //在标题栏中显示加载
        this.get_list(this.data.page);     

    },
    onShareAppMessage: function () {
        return{
            title:'我的小程序',
            path:'/pages/index/index',
            success:function(){

            }
        }
    },
    // 获取列表信息
    get_list:function(page){
        let that=this;
        wx.request({
            header: { 'content-type': 'application/x-www-form-urlencoded'},
            method:'POST',
            data:{'page':page},
            url: 'https://api.yunhuangtech.com/house/home/index/get_house_list',
            success:function(data){
                let list=data.data;
                console.log(list);
                if(list.code==200){
                    let datalist=that.data.dataList;
                    for(var item of list.data){
                        if(item.images)
                            item.images=item.images.split(';')[0];
                        datalist.push(item);
                    }
                    that.setData({
                        dataList:datalist,
                        page:page+1,
                    });

                }else{
                    that.setData({
                        tailDisplay:'block'
                    });
                    console.log('没有更多的数据了');
                }
            },
            complete:function(){
                wx.hideNavigationBarLoading() //完成停止加载
                wx.stopPullDownRefresh() //停止下拉刷新
            }
        })
    }
})
