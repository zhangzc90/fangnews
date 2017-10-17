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
                name:'100万以下',
                low:'',
                high:'100'
            },
            {
                name: '100-150万',
                low: '100',
                high: '150'
            },
            {
                name: '150-200万',
                low: '150',
                high: '200'
            },
            {
                name: '200万以上',
                low: '200',
                high: ''
            },
        ],
        floors:[
            {
                name: '低层',
                value:1 
            },
            {
                name: '中层',
                value:2 
            },
            {
                name: '高层',
                value:3
            },
            {
                name: '别墅',
                value:4
            },
        ],
        layout:[
            {
                name: '一室',
                value:1
            },
            {
                name: '两室',
                value:2
            },
            {
                name: '三室',
                value:3 
            },
            {
                name: '四室',
                value:4
            },
            {
                name: '五室',
                value:5            
            },
            {
                name: '五室以上',
                value: 6
            }
        ],
        map:{
            page: 1,
        },
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
        // 获取列表数据
        this.get_list(this.data.map);
    },
    onShow:function(){
       
    },
    getUserInfo: function(e) {
        app.globalData.userInfo = e.detail.userInfo
        this.setData({
            userInfo: e.detail.userInfo,
            hasUserInfo: true
        })
    },


    //事件处理函数

    // 区域变动
    bindAreaChange:function(e){
        let location=e.detail.value;
        this.setData({
            'map.location':location
        });
        this.get_list(this.data.map,1);
    },
    // 价格变更
    bindPriceChange:function(e){
        let index=e.detail.value;
        let price=this.data.price[index];
        this.setData({
            'map.price': JSON.stringify(price)
        });
        this.get_list(this.data.map,1);
    },
    // 楼层变更
    bindFloorsChange:function(e){
        let index=e.detail.value;
        let floors = this.data.floors[index]['value'];
        this.setData({
            'map.floors': floors
        });
        this.get_list(this.data.map,1);
    },
    // 户型变更
    bindLayoutChange:function(e){
        let index=e.detail.value;
        let layout=this.data.layout[index]['value']; 
        this.setData({
            'map.layout': layout
        });
        this.get_list(this.data.map,1);
    },
    // 查询
    search:function(e){
        let searchText=e.detail.value;
        this.setData({
            map:{
                'search': searchText,
                'page': 1
            }
        });
        this.get_list(this.data.map,1);
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
        this.get_list(this.data.map,1);     
    },
    // 上拉加载
    onReachBottom:function(e){
        console.log('上拉加载');
        wx.showNavigationBarLoading() //在标题栏中显示加载
        this.get_list(this.data.map);     

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
    get_list:function(args,refresh=0){
        if(refresh)
            this.data.map.page=1;
        let that=this;
        wx.request({
            header: { 'content-type': 'application/x-www-form-urlencoded'},
            method:'POST',
            data:args,
            url: 'https://api.yunhuangtech.com/house/home/index/get_house_list',
            success:function(data){               
                let list=data.data;
                if(list.code==200){
                    let datalist=that.data.dataList;
                    // 条件查找
                    if(refresh==1){
                        datalist=[];
                        for (var item of list.data) {
                            if (item.images)
                                item.images = item.images.split(';')[0];
							if (item.tags)
								item.tags=item.tags.split(' ');
                            datalist.push(item);
                        }
                    }else{
                        for (var item of list.data) {
                            if (item.images)
                                item.images = item.images.split(';')[0];
							if (item.tags)
								item.tags = item.tags.split(' ');
                            datalist.push(item);
                        } 
                    }
                    that.setData({
                        'dataList': datalist,
                        'map.page': that.data.map.page + 1,
                    });
                }else{
                    that.setData({
                        tailDisplay:'block',
                        dataList:refresh?null:that.data.dataList
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
