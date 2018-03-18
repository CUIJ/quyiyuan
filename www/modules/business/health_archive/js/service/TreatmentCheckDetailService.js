/*
 * 产品名称：健康档案
 * 创建人: 王婉
 * 创建日期:2016年11月15日16:11:13
 * 创建原因：检查检验单列表
 */
new KyeeModule()
    .group("kyee.quyiyuan.health.archive.treatment.check.detail.service")
    .require([])
    .type("service")
    .name("TreatmentCheckDetailService")
    .params(["KyeeMessageService","HttpServiceBus"])
    .action(function(KyeeMessageService,HttpServiceBus){

        var def = {
            DETAIL_CHECK_LIST:null,
            getCheckDetail: function (param, onSuccess) {
                HttpServiceBus.connect({
                    url: "/healthAR/action/HealthARAction.jspx",
                    params: {
                        op: "getCheckDetailListActionC",
                        ID_NO: param.ID_NO,
                        PATIENT_NAME: param.PATIENT_NAME,
                        NUMBER: param.NUMBER,
                        SOURCE_TYPE: param.SOURCE_TYPE,
                        ORGANIZATION_CODE: param.ORGANIZATION_CODE,
                        REPORT_NO: param.REPORT_NO,
                        IS_EXAMINATION:param.IS_EXAMINATION,
                        idCardNo: param.idCardNo,
                        name: param.name,
                        phoneNumber: param.phoneNumber
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            onSuccess(data.data.rows);
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


