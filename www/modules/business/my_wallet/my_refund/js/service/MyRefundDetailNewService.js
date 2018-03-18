/**
 * 产品名称：quyiyuan
 * 创建者：yinguangwen
 * 创建时间：2016-4-18 16:05:28
 * 创建原因：退费详情服务
 * 任务号：KYEEAPPC-5846
 */
new KyeeModule()
    .group("kyee.quyiyuan.myRefundDetailNew.service")
    .type("service")
    .name("MyRefundDetailNewService")
    .params([
        "HttpServiceBus"
    ])
    .action(function (HttpServiceBus) {
        var def = {
            RUSH_TYPE:undefined,//抢号
            REFUND_TRADE_NO:undefined,
            loadData : function(getData) {
                var tradeNo = def.OUT_TRADE_NO;
                HttpServiceBus.connect({
                    url: "/payment/action/ReturnActionC.jspx",
                    params: {
                        op: "getRefundDetail",
                        OUT_TRADE_NO:tradeNo,
                        RUSH_TYPE:def.RUSH_TYPE,//抢号
                        REFUND_TRADE_NO:def.REFUND_TRADE_NO
                    },
                    onSuccess: function (data) {
                        def.OUT_TRADE_NO=undefined;
                        def.RUSH_TYPE = undefined;
                        if(data.success){
                            getData(true,data.message,data.data);
                        }
                        else{
                            getData(false,data.message,"");
                        }
                    }
                });
            }
        };
        return def;
    })
    .build();