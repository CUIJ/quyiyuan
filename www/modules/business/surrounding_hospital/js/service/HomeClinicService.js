new KyeeModule()
    .group("kyee.quyiyuan.homeClinic.service")
    .require([
        "kyee.framework.service.message",
        "kyee.framework.device.network",
        "kyee.quyiyuan.home.service"
    ])
    .type("service")
    .name("HomeClinicService")
    .params(["HttpServiceBus", "$state", "CacheServiceBus", "KyeeMessageService", "HospitalSelectorService", "HomeService","KyeeI18nService"])
    .action(function (HttpServiceBus, $state, CacheServiceBus, KyeeMessageService, HospitalSelectorService, HomeService,KyeeI18nService) {
        var def = {
            myPoint: "",
            getNearClinicInfo: function (HOSPITAL_ID, onSuccess) {
                HttpServiceBus.connect({
                    url: "/area/action/AreaHospitalActionImplC.jspx",
                    params: {
                        op: "queryDeptNameOrDoctorName4clinic",
                        hospitalID: HOSPITAL_ID
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            onSuccess(data.data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.data,
                                duration: 3000
                            });
                        }
                    }
                })
            },
            queryClinicConfig: function (hospitalId,onSuccess) {
                    HttpServiceBus.connect({
                    url: "/hospitalInform/action/HospitalinforActionC.jspx",
                    params: {
                        hospitalID: hospitalId,
                        hospitalId: hospitalId,
                        USER_ROLE: "0",
                        paramName: "IS_DEPT_GRADE,isAppointToRegistCardPwd,isRegistCardPwd,CONSULT_DOCTOR,NETWORK_CLINIC,SHOW_CLINIC_NUMBER",
                        op: "queryHosConfig"
                    },
                    onSuccess: function (data) {
                        if(data.success) {
                            var result = data.data;
                            var ModuleTOAPP = undefined;
                            try {
                                ModuleTOAPP = JSON.parse(result.ModuleTOAPP).data;
                            } catch (e) {
                                ModuleTOAPP = [];
                            }
                            onSuccess(ModuleTOAPP);
                        }else{
                            KyeeMessageService.broadcast({
                                content: data.data,
                                duration: 3000
                            });
                        }

                    }
                })
            }
        };
        return def;
    }).build();
