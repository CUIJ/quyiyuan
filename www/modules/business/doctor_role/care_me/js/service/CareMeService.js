//<!--
//    产品名称：quyiyuan
//    创建人: 张家豪
//    创建日期:2015年7月1日15:01:55
//    创建原因：关注我的患者
//-->
new KyeeModule()
    .group("kyee.quyiyuan.doctor_role.care_me.service")
    .require(["kyee.framework.service.messager"])
    .type("service")
    .name("CareMeService")
    .params(["KyeeMessageService", "HttpServiceBus"])
    .action(function (KyeeMessageService, HttpServiceBus) {

        var def = {

            /**
             * 查询所有关注我的
             */
            queryDoctorFuns: function (doctorCode, hospitalId, page, limit, onSuccess) {
                HttpServiceBus.connect({
                    url: "/patientwords/action/PatientWordsActionC.jspx",
                    params: {
                        doctorCode: doctorCode,
                        hospitalId: hospitalId,
                        page: page,
                        limit: limit,
                        op: "queryDoctorFuns"
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