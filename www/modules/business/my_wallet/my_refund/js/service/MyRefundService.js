/**
 * 产品名称：quyiyuan
 * 创建者：杜巍巍
 * 创建时间：2015年8月20日
 * 创建原因：我的退款Service
 * 修改者：程铄闵
 * 修改时间：2015年10月17日13:24:46
 * 修改原因：2.0.80版本需求修改
 * 任务号：KYEEAPPC-3596
 */
new KyeeModule()
    .group("kyee.quyiyuan.myRefund.service")
    .require([])
    .type("service")
    .name("MyRefundService")
    .params([
        "HttpServiceBus"
    ])
    .action(function(HttpServiceBus){

        var def = {
            //查询我的退款待处理数据
            getMyRefundInfo : function(flag,callBack,hospitalId) {
                //若从消息跳转则直接用消息医院   update 程铄闵 KYEEAPPC-3738
                if(hospitalId==undefined||hospitalId==''){
                    var storageCache = KyeeAppHelper.getSimpleService("kyee.quyiyuan.service_bus.cache", "CacheServiceBus").getStorageCache();
                    var hospitalInfo = storageCache.get("hospitalInfo");
                    hospitalId = hospitalInfo.id;
                }
                HttpServiceBus.connect({
                    url: "/payment/action/ReturnActionC.jspx",
                    params: {
                        op: "getRegReturnRecsActionC",
                        hospitalID:hospitalId,
                        QUERY_TYPE:flag//0-待处理 1-历史
                    },
                    onSuccess: function (data) {
                        if(data.success){
                            callBack(true,data.message,data.data);
                        }
                        else{
                            callBack(false,data.message);
                        }
                    }
                });
            }
        };
        return def;
    })
    .build();
