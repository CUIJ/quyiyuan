/**
 * 产品名称：quyiyuan.
 * 创建用户：吴伟刚
 * 日期：2015年6月29日10:33:11
 * 创建原因：住院满意度医院评价页面服务
 */
new KyeeModule()
    .group("kyee.quyiyuan.satisfaction.hospitalHospital.service")
    .require([])
    .type("service")
    .name("HospitalHospitalService")
    .params(["HttpServiceBus", "CacheServiceBus"])
    .action(function(HttpServiceBus, CacheServiceBus){

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
                        itemType: 4
                    },
                    onSuccess : function (resp) {
                        onSuccess(resp);
                    }
                });
            },
            /**
             * 查询医院已评价数据
             */
            querySatisfactionData : function(itemHospitalId, regId, onSuccess){
                var me = this;
                HttpServiceBus.connect({
                    url : "/satisfaction/action/InHospitalRecordSurveyActionC.jspx",
                    params : {
                        op: "queryHasBeenSuggestedItemRecord",
                        INHOSPITAL_RECORD_ID: me.data.INHOSPITAL_RECORD_ID,
                        INHOSPITAL_NO:me.data.INHOSPITAL_NO,
                        RECORD_HOSPITAL_ID: itemHospitalId,
                        VISIT_ID:me.data.VISIT_ID,
                        SUGGEST_TYPE:2
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
             * 保存医院评价内容
             */
            saveSatisfactionData : function(postdata, onSuccess){
                HttpServiceBus.connect({
                    url : "/satisfaction/action/InHospitalRecordSurveyActionC.jspx",
                    type: "POST",
                    params : {
                        op: "saveInHospitalSuggest",
                        postdata: postdata
                    },
                    onSuccess : function (resp) {
                        if(!resp){
                            return;
                        }
                        onSuccess(resp);
                    }
                });
            }
        };

        return def;
    })
    .build();
