/**
 * 产品名称：quyiyuan.
 * 创建用户：姚斌
 * 日期：2015年5月5日11:06:54
 * 创建原因：医院评价页面服务
 */
new KyeeModule()
    .group("kyee.quyiyuan.satisfaction.satisfactionHospital.service")
    .require([])
    .type("service")
    .name("SatisfactionHospitalService")
    .params(["HttpServiceBus", "CacheServiceBus","KyeeMessageService"])
    .action(function(HttpServiceBus, CacheServiceBus,KyeeMessageService){

        var def = {
            /**
             * 查询医院评分项目数据
             */
            querySurveyData : function(itemHospitalId, onSuccess){
                HttpServiceBus.connect({
                    url : "/satisfaction/action/HospitalSurveyActionC.jspx",
                    params : {
                        op: "getSurveyItem",
                        itemHospitalId: itemHospitalId,
                        itemType: 1
                    },
                    onSuccess : function (resp) {
                        if(!resp.rows){
                            return;
                        }
                        onSuccess(resp.rows);
                    }
                });
            },
            /**
             * 查询医院已评价数据
             */
            querySatisfactionData : function(itemHospitalId, regId, onSuccess){
                HttpServiceBus.connect({
                    url : "/satisfaction/action/HospitalSurveyActionC.jspx",
                    params : {
                        op: "getHospitalSuggestAndScore",
                        HOSPITAL_ID: itemHospitalId,
                        forceSatification: "YES",
                        REG_ID: regId
                    },
                    onSuccess : function (resp) {
                        if(!resp.data){
                            return;
                        }
                        onSuccess(resp.data);
                    }
                });
            },
            /**
             * 预判医院分数
             * 新的需求变更：无论医院是否开启，均能对医院和医生评价，
             * 因此在参数中增加 forceSatification 字段，绕过后台对医院是否开启的过滤
             * 此字段只针对评价医生和评价医院有效
             */
            calculateDataScore:function(postdata, hospitalId,onSuccess){
                HttpServiceBus.connect({
                    type: "POST",
                    url : "/satisfaction/action/HospitalSurveyActionC.jspx",
                    params : {
                        forceSatification: "YES",
                        op: "calHospitalScore",
                        postdata: postdata,
                        hospitalId:hospitalId
                    },
                    onSuccess : function (resp) {
                        if(!resp){
                            return;
                        }
                        onSuccess(resp);
                    }
                });
            },
            /**
             * 保存医院评价内容
             */
            saveSatisfactionData : function(postdata, onSuccess){
                HttpServiceBus.connect({
                    url : "/satisfaction/action/HospitalSurveyActionC.jspx",
                    type: "POST",
                    params : {
                        op: "saveHospitalScore",
                        HOSPITAL_ID: postdata.HOSPITAL_ID,
                        forceSatification: "YES",
                        USER_VS_ID: CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT).USER_VS_ID,
                        OTHER: postdata.OTHER,
                        REG_ID: postdata.REG_ID,
                        postdata: postdata
                    },
                    onSuccess : function (resp) {
                        if(!resp){
                            return;
                        }
                        if(resp.success){
                            onSuccess(resp);
                        }else{
                            KyeeMessageService.broadcast({
                                content: resp.message
                            });
                            return;
                        }
                    }
                });
            }
        };

        return def;
    })
    .build();
