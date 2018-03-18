/**
 * 产品名称：quyiyuan.
 * 创建用户：姚斌
 * 日期：2015年8月25日14:48:19
 * 创建原因：优惠抵用页面服务
 */
new KyeeModule()
    .group("kyee.quyiyuan.myWallet.coupons.service")
    .require([])
    .type("service")
    .name("CouponsService")
    .params(["HttpServiceBus", "KyeeMessageService"])
    .action(function (HttpServiceBus, KyeeMessageService) {

        var def = {

            /**
             * 查询抵用券兑换记录
             */
            queryCouponsExchangeRecord : function(onSuccess){
                HttpServiceBus.connect({
                    url : "/freeRgtPay/action/freeRgtPayActionC.jspx",
                    params : {
                        op: "queryCouponsRecord"
                    },
                    onSuccess : function (resp) {
                        if(resp.success){
                            onSuccess(resp.data);
                        } else if(resp.alertType == 'ALERT'){
                            KyeeMessageService.broadcast({
                                content: resp.message
                            });
                        }
                    }
                });
            },
            /**
             * 兑换抵用券
             */
            exchangeCoupons : function(couponsNo, onSuccess, onError){
                HttpServiceBus.connect({
                    url : "/freeRgtPay/action/freeRgtPayActionC.jspx",
                    params : {
                        op: "exchangeCoupons",
                        COUPONS_NO: couponsNo
                    },
                    onSuccess : function (resp) {
                        if(resp.success){
                            onSuccess(resp);
                        } else if(resp.alertType == 'ALERT'){
                            KyeeMessageService.broadcast({
                                content: resp.message
                            });
                        }
                    }
                });
            }
        };

        return def;
    })
    .build();
