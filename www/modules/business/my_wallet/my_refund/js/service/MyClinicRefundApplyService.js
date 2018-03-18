/*
 * 产品名称：quyiyuan
 * 创建人: 董茁
 * 创建日期:2016/8/24
 * 创建原因：2.2.90版 申请退费服务
 * 任务号：KYEEAPPC-7611
 */
new KyeeModule()
    .group("kyee.quyiyuan.myClinicRefundApply.service")
    .type("service")
    .name("MyClinicRefundApplyService")
    .params([
        "HttpServiceBus",
        "CacheServiceBus",
        "KyeeMessageService",
        "KyeeI18nService"
    ])
    .action(function (HttpServiceBus, CacheServiceBus, KyeeMessageService,KyeeI18nService) {

        var def = {
            //申请退费信息
            refundInformation: undefined,
            //确认按钮 申请退费
            confirmRefundApply:function (onSuccess,checkedRefundRows,trade_no,rec_master_id) {
                HttpServiceBus.connect({
                    url: "/payment/action/ReturnActionC.jspx",
                    type:"POST",
                    params: {
                        op: "applyRefundRecsActionC",
                        OUT_TRADE_NO:trade_no,
                        REFUND_DETAIL:checkedRefundRows,
                        REC_MASTER_ID: rec_master_id
                    },
                    onSuccess: function (result) {
                        if(result.success){
                           onSuccess(result);
                        }
                        else{
                            KyeeMessageService.broadcast({
                                content: result.message
                            });
                        }

                    },
                    onError: function () {

                    }
                });
            }
        };

        return def;
    })
    .build();