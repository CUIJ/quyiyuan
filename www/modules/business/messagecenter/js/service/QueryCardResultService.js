/**
 * 产品名称：quyiyuan.
 * 创建用户：姚斌
 * 日期：2015年5月5日11:06:54
 * 创建原因：查卡结果页面服务
 */
new KyeeModule()
    .group("kyee.quyiyuan.messagecenter.queryCardResult.service")
    .require([])
    .type("service")
    .name("QueryCardResultService")
    .params(["HttpServiceBus", "CacheServiceBus"])
    .action(function(HttpServiceBus, CacheServiceBus){

        var def = {
            /**
             * 保存默认选中就诊卡
             */
            saveDefaultCard : function(userVsId, cardNo, hospitalId, onSuccess){
                HttpServiceBus.connect({
                    url : "/center/action/CustomPatientAction.jspx",
                    params : {
                        op: "updateCardByUserVsId",
                        userVsId: userVsId,
                        cardNo: cardNo,
                        hospitalId: hospitalId
                    },
                    onSuccess : function (resp) {
                        onSuccess(resp);
                    }
                });
            },
            /**
             * 刷新当前就诊者信息
             */
            refreshData : function(hospitalId, onSuccess){
                HttpServiceBus.connect({
                    url : "/center/action/CustomPatientAction.jspx",
                    params : {
                        op: "selectedCustomPatient",
                        userId: CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID,
                        hospitalId: hospitalId
                    },
                    onSuccess : function (resp) {
                        if(!resp.data){
                            return;
                        }
                        onSuccess(resp.data);
                    }
                });
            }
        };

        return def;
    })
    .build();
