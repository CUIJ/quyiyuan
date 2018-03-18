new KyeeModule()
    .group("kyee.quyiyuan.health.weight.add.service")
    .require(["kyee.framework.service.messager"])
    .type("service")
    .name("WeightAddService")
    .params([
        "HttpServiceBus","KyeeMessageService"])
    .action(function (HttpServiceBus,KyeeMessageService) {
        var def = {
            HEALTH_MANAGE_TYPE:null,
            addHealthInfo: function (params, onSuccess) {
                HttpServiceBus.connect({
                    url: "/healthManagement/action/HealthManagementActionC.jspx",
                    params: params,
                    onSuccess: function (data) {
                        if (data.success) {
                            onSuccess(data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message
                            });
                        }
                    }
                });
            }
        };
        return def;
    })
    .build();

