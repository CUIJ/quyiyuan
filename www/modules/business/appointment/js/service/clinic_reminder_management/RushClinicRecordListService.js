/**
 * 产品名称：quyiyuan
 * 创建者：gaomeng
 * 创建时间：2016年12月4日 13:02:43
 * 创建原因：抢号管理记录服务层
 * 修改者：
 * 修改原因：
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.appointment.rush.cliic.record.service")
    .require(["kyee.framework.service.message",
        "kyee.quyiyuan.service_bus.cache",
        "kyee.quyiyuan.interaction.doctorMessageBoard.service",
        "kyee.quyiyuan.payOrder.service",
        "kyee.framework.service.utils"
    ])
    .type("service")
    .name("RushClinicRecordListService")
    .params([
        "HttpServiceBus",
        "KyeeMessageService",
        "$state","CacheServiceBus",
        "DoctorMessageBoardService",
        "PayOrderService",
        "KyeeUtilsService"])
    .action(function(HttpServiceBus,KyeeMessageService,$state,CacheServiceBus,DoctorMessageBoardService,
                     PayOrderService,KyeeUtilsService){
        var def ={
            ////获取传递来的参数
            //doSetAppointListParams:function(pagedata){
            //    this.pagedata = pagedata;
            //},
            //请求抢号和有号记录数据
            getRushClinicList:function(showLoading,curPage, onSuccess){
                if(showLoading=='1'){
                    var showLoad = false;
                }else{
                    var showLoad = true;
                }
                var appointListData=[];
                var me=this;
                if ( CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT)== undefined) {
                    return;
                }
                if(appointListData.length===0){
                    HttpServiceBus.connect(
                        {
                            url : "/appoint/action/AppointActionC.jspx",
                            params : {
                                op:"getRushClinicAppointMoreRecsActionC",
                                loc:"c",
                                USER_ID: CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID,
                                USER_VS_ID:CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT).USER_VS_ID,
                                HOSPITAL_ID:CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id,
                                CURRENT_PAGE:curPage
                            },
                            showLoading: showLoad,
                            onSuccess:function(data){
                                if(data.success){
                                    if(data.data!=null&&data.data!=""&&data.data!=undefined){
                                        var appointListNotHidden=true;
                                        var resultData = data.data;
                                    }
                                }else{
                                    //显示无数据提示
                                    appointListNotHidden=false;
                                    KyeeMessageService.broadcast({
                                        content: data.message,
                                        duration: 3000
                                    });
                                }
                                var appointListData={
                                    "resultData":resultData,
                                    "appointListNotHidden":appointListNotHidden
                                };
                                onSuccess(appointListData);
                            }
                        }
                    );
                }
            },
            //高萌 2016年9月9日01:16:52 删除抢号管理记录
            deleteRushRecord: function (Callback,rushId,userId) {
                HttpServiceBus.connect({
                    url: "appoint/action/AppointActionC.jspx",
                    showLoading: true,
                    params: {
                        RUSH_ID:rushId,
                        USE_ID:userId,
                        op: "deleteRushClinicRecordActionC"
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            //def.dealCloudData(data);
                            Callback(data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message
                            });
                        }
                    }
                });
            },
            //高萌 2016年9月9日01:16:52 清空失效记录
            clearFailureRecord: function (Callback,userId) {
                HttpServiceBus.connect({
                    url: "appoint/action/AppointActionC.jspx",
                    showLoading: true,
                    params: {
                        USE_ID:userId,
                        op: "clearRushFailureRecordActionC"
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            Callback(data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message
                            });
                        }
                    }
                });
            },
            //高萌 2016年9月9日01:16:52 校验是否有可删除的记录
            checkHasClearFailureRecord: function (Callback,userId) {
                HttpServiceBus.connect({
                    url: "appoint/action/AppointActionC.jspx",
                    showLoading: true,
                    params: {
                        USE_ID:userId,
                        op: "checkHasClearFailureRecordActionC"
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            Callback(data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message
                            });
                        }
                    }
                });
            },
            // 高萌 2016年9月9日01:16:24 更新抢号管理记录状态
            updateRushRecord: function (Callback,rushId,userId,status) {
                HttpServiceBus.connect({
                    url: "appoint/action/AppointActionC.jspx",
                    showLoading: true,
                    params: {
                        RUSH_ID:rushId,
                        USE_ID:userId,
                        STATUS:status,
                        op: "updateRushRecordStatusActionC"
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            //def.dealCloudData(data);
                            Callback(data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message
                            });
                        }
                    }
                });
            },
            /**
             * 若用户长时间停留在抢号管理页面并未进行预约挂号，则需要反查该记录状态是否已过期
             * @param appointListData
             */
            getRushRecordStatus:function(rushId, userId, onSuccess){
                HttpServiceBus.connect(
                    {
                        url : "appoint/action/AppointActionC.jspx",
                        params : {
                            op:"getRushStatusByRushIdActionC",
                            loc:"c",
                            RUSH_ID:rushId,
                            USER_ID: userId
                        },
                        onSuccess: function (data) {
                            if (data.success) {
                                onSuccess(data.data);
                            } else {
                                KyeeMessageService.broadcast({
                                    content: data.message
                                });
                            }
                        }
                    }
                );
            }
        };
        return def;
    })
    .build();
