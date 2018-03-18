new KyeeModule()
    .group("kyee.quyiyuan.appointment.doctor_action.service")
    .require(["kyee.framework.service.message"])
    .type("service")
    .name("AppointmentDoctorActionService")
    .params(["HttpServiceBus", "KyeeMessageService", "KyeeUtilsService", "CacheServiceBus"])
    .action(function (HttpServiceBus, KyeeMessageService, KyeeUtilsService, CacheServiceBus,KyeeI18nService) {
        var def = {

            getDoctorAction:function(params,onSuccess,onError){
                HttpServiceBus.connect({
                    url: "third:doctor_dynamics/getDoctorDynamicsInf",
                    params: {
                        hospitalId:params.hospitalId,
                        deptCode:params.deptCode,
                        doctorCode:params.doctorCode,
                        currentPage:params.currentPage,
                        pageSize:params.pageSize
                    },
                    showLoading: params.showLoading,
                    onSuccess: function(response){
                        if(response.success){
                            typeof onSuccess === 'function' && onSuccess(response.data);
                        }
                    },
                    onError: function(error){
                        typeof onError === 'function' && onError(error);
                        KyeeMessageService.broadcast({
                            content: error.message || KyeeI18nService.get("commonText.networkErrorMsg", "网络异常，请稍后重试！"),
                            duration: 2000
                        });
                    }
                });
            },
            getFamousAction:function(params,onSuccess,onError){
                HttpServiceBus.connect({
                    url: "third:doctor_dynamics/getDynamicsInf",
                    params: {
                        currentPage:params.currentPage,
                        pageSize:params.pageSize
                    },
                    showLoading: params.showLoading,
                    onSuccess: function(response){
                        if(response.success){
                            typeof onSuccess === 'function' && onSuccess(response.data);
                        }
                    },
                    onError: function(error){
                        typeof onError === 'function' && onError(error);
                        KyeeMessageService.broadcast({
                            content: error.message || KyeeI18nService.get("commonText.networkErrorMsg", "网络异常，请稍后重试！"),
                            duration: 2000
                        });
                    }
                });
            }

        };
        return def;
    })
    .build();


