/**
 * 产品名称：quyiyuan.
 * 创建用户：姚斌
 * 日期：2015年8月25日14:48:19
 * 创建原因：优惠抵用页面服务
 */
new KyeeModule()
    .group("kyee.quyiyuan.myWallet.couponsRecord.service")
    .require([])
    .type("service")
    .name("CouponsRecordService")
    .params(["HttpServiceBus", "KyeeMessageService"])
    .action(function (HttpServiceBus, KyeeMessageService) {

        var def = {
            //获取优惠券记录
            getCoupons: function (onSuccess) {
                HttpServiceBus.connect({
                    url: 'freeRgtPay/action/freeRgtPayActionC.jspx',
                    params: {
                        op: "queryCouponsByUserIdActionC"
                    },
                    onSuccess: function (data) {
                        if(data.success){
                            onSuccess(data.data);
                        }else{
                            KyeeMessageService.broadcast({
                                    content:data.message
                            });
                        }
                    }
                });
            }
        };

        return def;
    })
    .build();
