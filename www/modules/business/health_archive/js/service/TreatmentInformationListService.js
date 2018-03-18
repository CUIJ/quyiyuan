/*
 * 产品名称：健康档案
 * 创建人: 王婉
 * 创建日期:2016年11月15日16:11:13
 * 创建原因：亳州平台健康档案
 */
new KyeeModule()
    .group("kyee.quyiyuan.health.archive.treatment.information.list.service")
    .require([])
    .type("service")
    .name("TreatmentInformationListService")
    .params(["KyeeMessageService","HttpServiceBus"])
    .action(function(KyeeMessageService,HttpServiceBus){

        var def = {
            getTreatmentInfo: function (param, onSuccess) {
                HttpServiceBus.connect({
                    url: "/healthAR/action/HealthARAction.jspx",
                    params: {
                        op: "getTreatmentInformationActionC",
                        ID_NO:param.ID_NO,
                        PATIENT_NAME:param.PATIENT_NAME,
                        idCardNo: param.idCardNo,
                        name: param.name,
                        phoneNumber: param.phoneNumber
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


