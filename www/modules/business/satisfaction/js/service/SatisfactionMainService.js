/**
 * 产品名称：quyiyuan.
 * 创建用户：姚斌
 * 日期：2015年5月5日11:06:54
 * 创建原因：满意度选择医生页面服务
 */
new KyeeModule()
    .group("kyee.quyiyuan.satisfaction.satisfactionMain.service")
    .require([])
    .type("service")
    .name("SatisfactionMainService")
    .params(["HttpServiceBus", "CacheServiceBus"])
    .action(function(HttpServiceBus, CacheServiceBus){

        var def = {
            /**
             * 查询满意度评价记录
             */
            queryItems : function(doctorCode, hospitalId, suggestStatus, page, limit, onSuccess){
                HttpServiceBus.connect({
                    url : "/satisfaction/action/DoctorSurveyActionC.jspx",
                    params : {
                        op: "getRegistData",
                        USER_ID:  CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID,
                        USER_VS_ID: CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT).USER_VS_ID,
                        HOSPITAL_ID: hospitalId,
                        DOCTOR_CODE: doctorCode,
                        PAGE: page,
                        LIMIT: limit,
                        SUGGEST_STATUS: suggestStatus
                    },
                    onSuccess : function (resp) {
                        onSuccess(resp.data);
                    }
                });
            }
        };

        return def;
    })
    .build();
