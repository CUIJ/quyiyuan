/**
 * 产品名称：quyiyuan.
 * 创建用户：吴伟刚
 * 日期：2015年6月26日11:06:54
 * 创建原因：住院满意度列表服务
 */
new KyeeModule()
    .group("kyee.quyiyuan.satisfaction.hospitalList.service")
    .require([])
    .type("service")
    .name("HospitalListService")
    .params(["HttpServiceBus", "CacheServiceBus"])
    .action(function(HttpServiceBus, CacheServiceBus){

        var def = {
            /**
             * 查询住院满意度评价记录
             */
            queryItems : function(searchNo, hospitalId, suggestStatus, page, limit, onSuccess){
                HttpServiceBus.connect({
                    url : "/satisfaction/action/InHospitalRecordSurveyActionC.jspx",
                    params : {
                        op: "queryInHospitalRecord",
                        USER_ID:  CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID,
                        USER_VS_ID: CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT).USER_VS_ID,
                        HOSPITAL_ID: hospitalId,
                        PAGE: page,
                        LIMIT: limit,
                        INHOSPITAL_NO:searchNo
                    },
                    onSuccess : function (resp) {
                        onSuccess(resp);
                    }
                });
            }
        };

        return def;
    })
    .build();
