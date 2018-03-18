
/*
 * 产品名称：健康档案—个人健康信息
 * 创建人: 高萌
 * 创建日期:2016年11月17日14:18:13
 * 创建原因：亳州平台健康档案
 */
new KyeeModule()
    .group("kyee.quyiyuan.health.archive.my.health.information.service")
    .require([])
    .type("service")
    .name("MyHealthInformationService")
    .params(["KyeeMessageService","HttpServiceBus"])
    .action(function(KyeeMessageService,HttpServiceBus){

        var def = {
            getMyHealthInfo: function (param, onSuccess) {
                HttpServiceBus.connect({
                    url: "/healthAR/action/HealthARAction.jspx",
                    params: {
                        ID_NO:param.ID_NO,
                        PATIENT_NAME:param.PATIENT_NAME,
                        idCardNo: param.idCardNo,
                        name: param.name,
                        phoneNumber: param.phoneNumber,
                        op: "getMyHealthInfoAction"
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            onSuccess(data.data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 3000
                            });
                        }
                    }
                });
            }
        };

        return def;
    })
    .build();


