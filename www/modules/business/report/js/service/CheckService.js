/**
 * 产品名称 quyiyuan.
 * 创建用户: WangYuFei
 * 日期: 2015年5月7日13:46:40
 * 创建原因：KYEEAPPC-1958 报告单-检查单service
 * 修改：
 */
new KyeeModule()
    .group("kyee.quyiyuan.check.service")
    .require(["kyee.quyiyuan.center.service.QueryHisCardService",
        "kyee.quyiyuan.center.authentication.service"
    ])
    .type("service")
    .name("CheckService")
    .params(["HttpServiceBus","KyeeMessageService","$state","KyeeViewService","CacheServiceBus",
        "QueryHisCardService","AuthenticationService"])
    .action(function(HttpServiceBus,KyeeMessageService,$state,KyeeViewService,CacheServiceBus,QueryHisCardService,AuthenticationService){
        var def = {
            //其他页面返回当前页面刷新数据
            scope:{},
            backRefreshData:function(){
                this.scope.loadMore();
            },
            storageCache: CacheServiceBus.getStorageCache(),
            //初始化加载检查单数据
            loadData:function(start,page,rows,$scope,getData){
                var hospitalId;
                if(def.skipRoute == 'notice_check'){
                    hospitalId = def.hospitalId;
                }
                else{
                    hospitalId = this.storageCache.get('hospitalInfo').id;
                }
                HttpServiceBus.connect({
                    url : "report/action/ExamActionC.jspx",
                    params : {
                        op : "queryDetailExam",
                        hospitalID:hospitalId,
                        start:start,
                        page:page,
                        rows:rows
                    },
                    onSuccess : function(data){
                        if(data !=null ){
                            //数据获取成功
                            if(data.success){
                                getData(data,true);
                            }
                            //数据获取失败
                            else{
                                getData(data,false);
                            }
                        }
                    },
                    onError: function(type){
                        if(type=='NETWORK_ERROR'){
                            KyeeMessageService.broadcast({
                                content:'当前网络不太给力'
                            });
                        }else if(type=='RESPONSE_SYNTAX_ERROR'){
                            KyeeMessageService.broadcast({
                                content:'相应结果语法错误'
                            });
                        }else{
                            KyeeMessageService.broadcast({
                                content:'当前网络不太给力'
                            });
                        }
                    }
                })
            }

        };
        return def;
    })
    .build();