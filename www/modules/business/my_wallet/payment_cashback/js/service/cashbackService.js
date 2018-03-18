/*
 * 产品名称：quyiyuan
 * 创建人: hemeng
 * 创建日期:2016年6月21日11:01:30
 * 创建原因：缴费返现活动说明页面
 * 任务号：KYEEAPPC-6712
 */
new KyeeModule()
    .group("kyee.quyiyuan.myWallet.cashback.service")
    .require([
        "kyee.framework.service.message"
    ])
    .type("service")
    .name("CashbackService")
    .params(["HttpServiceBus", "CacheServiceBus","KyeeMessageService"])
    .action(function(HttpServiceBus){
        var def = {
            loadData : function(callBack) {
                HttpServiceBus.connect({
                    url: "/apppay/action/PayActionC.jspx",
                    params: {
                        op: "getPaymentCashbackRule"
                    },
                    onSuccess: function (data) {
                        if(data.success){
                            callBack(data.data);
                        }
                        else{
                            callBack(data.message);
                        }
                    }
                });
            }
        };

        return def;
    })
    .build();

