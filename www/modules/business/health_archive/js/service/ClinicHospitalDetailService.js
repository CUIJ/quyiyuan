
/*
 * 产品名称：健康档案
 * 创建人: 高萌
 * 创建日期:2016年11月17日14:18:29
 * 创建原因：亳州平台健康档案
 */
new KyeeModule()
    .group("kyee.quyiyuan.health.archive.clinic.hospital.detail.service")
    .require([])
    .type("service")
    .name("ClinicHospitalDetailService")
    .params(["KyeeMessageService","HttpServiceBus"])
    .action(function(KyeeMessageService,HttpServiceBus){

        var def = {
            TREATMENT_INFO:null,
            DETAIL_ADVICES_LIST:null,
            //获取门诊详情和住院详情
            getClinicHospitalDetail: function (param, onSuccess) {
                HttpServiceBus.connect({
                    url: "/healthAR/action/HealthARAction.jspx",
                    params: {
                        ID_NO:param.ID_NO,
                        PATIENT_NAME:param.OFTEN_NAME,
                        ORGANIZATION_CODE:param.ORGANIZATION_CODE,
                        IS_IN_HOSPITAL:param.IS_IN_HOSPITAL,
                        NUMBER:param.NUMBER,
                        idCardNo: param.idCardNo,
                        name: param.name,
                        phoneNumber: param.phoneNumber,
                        op: "getClinicHospitalDetailActionC"
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
            },
            // 获取用药及处方详情
            getDetailsRecipeInfo: function (param, onSuccess) {
                HttpServiceBus.connect({
                    url: "/healthAR/action/HealthARAction.jspx",
                    params: {
                        ID_NO:param.ID_NO,
                        PATIENT_NAME:param.OFTEN_NAME,
                        ORGANIZATION_CODE:param.ORGANIZATION_CODE,
                        IS_IN_HOSPITAL:param.IS_IN_HOSPITAL,
                        NUMBER:param.NUMBER,
                        idCardNo: param.idCardNo,
                        name: param.name,
                        phoneNumber: param.phoneNumber,
                        op: "getMediPresDetailActionC"
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


