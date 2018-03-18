/**
 * 产品名称：quyiyuan.
 * 创建用户：章剑飞
 * 日期：2015年8月25日10:15:13
 * 创建原因：就诊卡余额查询服务层
 */
new KyeeModule()
    .group("kyee.quyiyuan.card_balance.service")
    .type("service")
    .name("CardBalanceService")
    .params(["HttpServiceBus", "KyeeMessageService"])
    .action(function (HttpServiceBus, KyeeMessageService) {

        var def = {
            //查询就诊卡余额
            queryCardBalance: function (onSuccess, cardInfo) {
                HttpServiceBus.connect({
                    url: "/patientRecharge/action/PatientRechargeActionC.jspx",
                    params: {
                        op: "queryPatientRecharge",
                        CARD_NO : cardInfo.cardNo,
                        INPUT_NAME: cardInfo.patientName
                    },
                    onSuccess: function (data) {
                        if(data.success){
                            onSuccess(data.data);
                        }else{
                            onSuccess(false);
                            KyeeMessageService.broadcast({
                                content: data.message
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
