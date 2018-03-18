/**
 * 产品名称：我的方便门诊记录
 * 创建者：王婉
 * 创建时间： 2017年4月11日14:44:35
 * 创建原因：登录页面的controller
 * 修改者：王婉
 * 任务号：
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.my.convenience.clinic.service")
    .type("service")
    .name("MyConvenienceClinicService")
    .params(["HttpServiceBus","CacheServiceBus","KyeeMessageService"])
    .action(function (HttpServiceBus,CacheServiceBus,KyeeMessageService) {
        //获取预约科室
        var convenienceData = {
            getConvenienceClinicList :function(curPage,onSuccess) {
                HttpServiceBus.connect({
                    url:"/appoint/action/OnlinePrescriptionActionC.jspx",
                    params: {
                        op:"getAllOnlineRecordsActionC",
                        USER_ID : CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID,
                        PAGE:curPage
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            onSuccess(data.data.rows);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 3000
                            });
                        }
                    }
                })
            }
        };
        return convenienceData;
    })
    .build();
