//<!--
//    产品名称：quyiyuan
//    创建人: 张家豪
//    创建日期:2015年7月1日15:01:55
//    创建原因：关注我的患者
//-->
new KyeeModule()
    .group("kyee.quyiyuan.doctor_role.evaluation_record.service")
    .require(["kyee.framework.service.messager"])
    .type("service")
    .name("EvaluationRecordService")
    .params(["KyeeMessageService", "HttpServiceBus"])
    .action(function (KyeeMessageService, HttpServiceBus) {

        var def = {
            //查询所有关注我的
            queryDoctorSatisfactionRecord: function (page, limit, doctorCode, hospitalId, onSuccess) {
                HttpServiceBus.connect({
                    url: "/satisfaction/action/DoctorSurveyActionC.jspx",
                    params: {
                        doctorCode: doctorCode,
                        hospitalId: hospitalId,
                        page: page,
                        limit: limit,
                        op: "queryDoctorSatisfactionRecord"
                    },
                    onSuccess: function (resp) {
                        if(resp.success){
                            onSuccess(resp.data.rows);
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