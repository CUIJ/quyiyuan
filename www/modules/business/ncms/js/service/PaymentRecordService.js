/**
 * 产品名称 quyiyuan.
 * 创建用户: 淳思博
 * 日期: 2015/6/4.
 * 创建原因：缴费记录服务层
 * 修改： By
 * 修改： By
 */
new KyeeModule()
    .group("kyee.quyiyuan.ncms.paymentRecord.service")
    .require([])
    .type("service")
    .name("PaymentRecordService")
    .params(["HttpServiceBus","KyeeMessageService"])
    .action(function(HttpServiceBus,KyeeMessageService) {
        var def = {
            loadPaymentRecord : function(familyCode, year, onSuccess){
                HttpServiceBus.connect({
                    url : "/ncms/action/NCMSAction.jspx",
                    params : {
                        op : "getPaymentRecord",
                        FAMILY_CODE : familyCode,
                        areaCode : 341602,//KYEEAPPC-4337 新农合查询，默认向服务端传递谯城区的编码。
                        YEAR : year
                    },
                    onSuccess : function (resp) {
                        if(!resp){
                            return;
                        }else if(resp.success){
                            onSuccess(resp.data.rows);
                        }else{
                            KyeeMessageService.broadcast({
                                content: resp.message,
                                duration:3000
                            });
                        }
                    }
                });
            }
        };
        return def;

    })
    .build();