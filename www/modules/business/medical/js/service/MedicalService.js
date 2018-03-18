/**
 * 产品名称 quyiyuan.
 * 创建用户: WangYuFei
 * 日期: 2015年5月7日13:46:40
 * 创建原因：KYEEAPPC-1959 报告单-体检单service
 * 修改时间：2015年7月7日14:04:32
 * 修改人：程铄闵
 * 任务号：KYEEAPPC-2669
 * 修改原因：体检单迁移为独立模块
 * 修改人:gaoyulou
 * 任务号:KYEEAPPC-5391
 * 修改原因:如果从就医记录进入体检单页面，显示跨院数据
 */
new KyeeModule()
    .group("kyee.quyiyuan.medical.service")
    .require(["kyee.framework.service.message"])
    .type("service")
    .name("MedicalService")
    .params(["HttpServiceBus","KyeeMessageService","CacheServiceBus","KyeeI18nService"])
    .action(function(HttpServiceBus,KyeeMessageService,CacheServiceBus,KyeeI18nService){
        var medicalDetailData = null; //体检单明细信息
        var MEDICAL_STATE = null; //医学申明信息
        var def = {
            //获得初始数据
            loadData:function(startNo,currentPage,rows,examId,hospitalId,getData){
                var param = {
                    op : "queryPhysicalExamInfo",
                    EXAM_ID:examId
                };
                if(hospitalId){
                    param.hospitalID = hospitalId;
                }
                HttpServiceBus.connect({
                    url : "report/action/PhysicalExamActionC.jspx",
                    params : param,
                    /*cache:{
                        by:'TIME',
                        value:60
                    },*/
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
                                content: KyeeI18nService.get('commonText.networkErrorMsg', '网络异常，请稍后重试！', null)
                            });
                        }else if(type=='RESPONSE_SYNTAX_ERROR'){
                            KyeeMessageService.broadcast({
                                content: KyeeI18nService.get('commonText.networkErrorMsg', '网络异常，请稍后重试！', null)
                            });
                        }else{
                            KyeeMessageService.broadcast({
                                content: KyeeI18nService.get('commonText.networkErrorMsg', '网络异常，请稍后重试！', null)
                            });
                        }
                    }
                })
            },
			//发送体检单的跨院信息请求
            loadDataFromCloud:function(currentPage,row,showLoading,onSuccess){
                var memoryCache = CacheServiceBus.getMemoryCache();
                var userVsId = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT).USER_VS_ID;
                HttpServiceBus.connect({
                    url : "report/action/PhysicalExamActionC.jspx",
                    showLoading:showLoading,
                    params : {
                        op : 'queryPhysicalExamInCloud',
                        page : currentPage,
                        row : row,
                        USER_VS_ID : userVsId
                    },
                    onSuccess : function(data){
                        if(data !=null ){
                            //数据获取成功
                            if(data.success){
                                onSuccess(data,true);
                            }
                            //数据获取失败
                            else{
                                onSuccess(data,false);
                            }
                        }
                    }
                })
            },
            deletePhysicalRecord : function(record,onSuccess){
                var memoryCache = CacheServiceBus.getMemoryCache();
                var userVsId = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT).USER_VS_ID;
                HttpServiceBus.connect({
                    url : "report/action/PhysicalExamActionC.jspx",
                    params : {
                        op : 'deletePhysicalExamRecord',
                        USER_VS_ID : userVsId,
                        HOSPITAL_ID : record.HOSPITAL_ID,
                        PHYSICAL_NO : record.EXAM_REPORT_ID
                    },
                    onSuccess : function(data){
                        if(data !=null ){
                            //数据获取成功
                            if(data.success){
                                onSuccess();
                            }
                            //数据获取失败
                            else{
                                KyeeMessageService.broadcast({
                                    content: data.message
                                });
                            }
                        }
                    }
                })
            }
        };
        return def;
    })
    .build();