/**
 * 产品名称 quyiyuan.
 * 创建用户: WangYuFei
 * 日期: 2015年5月6日09:05:22
 * 创建原因：KYEEAPPC-1957 报告单-主界面、检验单service
 * 修改时间：2015年7月7日14:04:32
 * 修改人：程铄闵
 * 任务号：KYEEAPPC-2669
 * 修改原因：体检单迁移为独立模块
 */
new KyeeModule()
    .group("kyee.quyiyuan.report.service")
    .require(["kyee.framework.service.message",
        "kyee.quyiyuan.center.service.QueryHisCardService",
        "kyee.quyiyuan.center.authentication.service"])
    .type("service")
    .name("ReportService")
    .params(["HttpServiceBus","KyeeMessageService","$state","KyeeViewService",
        "CacheServiceBus","QueryHisCardService","AuthenticationService"])
    .action(function(HttpServiceBus,KyeeMessageService,$state,KyeeViewService,CacheServiceBus,QueryHisCardService,AuthenticationService){
        var INSPECTION_DETAIL = null; //检验单明细
        var def = {
            tabIndex : null, //跳转页签id
            isOtherView :false, //是否是其他页面跳转
            storageCache: CacheServiceBus.getStorageCache(),
            //跳转至报告单某页面：0 检验单 1 检查单 2 体检报告
            goToReport :function(id){
                $state.go('report');
                this.tabIndex = id;
                this.isOtherView=true;
            },
            //其他页面返回当前页面刷新数据
            scope:{},
            backRefreshData:function(){
                this.scope.loadMore();
            },
            //获得初始数据
            loadData:function(start,page,rows,$scope,getData){
                var hospitalId;
                if(def.skipRoute == 'notice_inspection'){
                    hospitalId = def.hospitalId;
                }
                else{
                    hospitalId = this.storageCache.get('hospitalInfo').id;
                }
                HttpServiceBus.connect({
                    url : "report/action/LabActionC.jspx",
                    params : {
                        op : "queryLabDetail",
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
                    onError　: function(type){
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
            },
            //获得是否显示搜索框参数
            getIsDisplayQueryParam:function(onSuccess){
                HttpServiceBus.connect({
                    url : "hospitalInform/action/HospitalinforActionC.jspx",
                    params : {
                        op : "queryHospitalParam",
                        hospitalId : function () {
                            //获取 StorageCache 服务
                            var storageCache = CacheServiceBus.getStorageCache();
                            var hospitalInfo = storageCache.get("hospitalInfo");
                            if (hospitalInfo != null) {
                                return hospitalInfo.id;
                            }
                            return null;
                        },
                        paramName:"QUERY_LAB_SHOW"
                    },
                    cache:{
                      by:'TIME',
                        value:60
                    },
                    onSuccess : function(data){
                        if(data !=null ){
                            //数据获取成功
                            if(data.success){
                                onSuccess(data);
                            }
                            //数据获取失败
                            else{

                            }
                        }
                    },
                    onError　: function(type){
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
            },
            //检索报告单
            searchData:function($scope,testNo,getData){
                HttpServiceBus.connect({
                    url : "report/action/LabActionC.jspx",
                    params : {
                        op : "queryLabByTestNo",
                        start:0,
                        page:1,
                        rows:8,
                        TEST_NO:testNo

                    },
                    onSuccess : function(data){
                        if(data !=null ){
                            //数据获取成功
                            if(data.success){
                                getData(true,data);
                            }
                            //数据获取失败
                            else{
                                getData(false,data);
                            }
                        }
                    },
                    onError　: function(type){
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
            },
            //日期格式化为yyyy-mm-dd格式
            getNowFormatDate :function (dateString) {
                var day = dateString;
                var Year = 0;
                var Month = 0;
                var Day = 0;
                var CurrentDate = "";
                //初始化时间
                Year= day.getFullYear();//ie火狐下都可以
                Month= day.getMonth()+1;
                Day = day.getDate();
                CurrentDate += Year + "-";
                if (Month >= 10 )
                {
                    CurrentDate += Month + "-";
                }
                else
                {
                    CurrentDate += "0" + Month + "-";
                }
                if (Day >= 10 )
                {
                    CurrentDate += Day ;
                }
                else
                {
                    CurrentDate += "0" + Day ;
                }
                return CurrentDate;
            }
        };
        return def;
    })
    .build();