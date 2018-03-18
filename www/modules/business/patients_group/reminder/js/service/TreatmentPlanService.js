new KyeeModule()
    .group("kyee.quyiyuan.patients_group.treatment_plan.service")
    .require([])
    .type("service")
    .name("TreatmentPlanService")
    .params(["HttpServiceBus"])
    .action(function (HttpServiceBus) {
        return {

            isFromBar: false,
            treatmentPlan: null,
            messageId: null,
            loadData: function (messageId, successCall) {
                if (messageId) {
                    HttpServiceBus.connect({
                        url: "messageCenter/action/MessageCenterActionC.jspx",
                        params: {
                            op: "loadMessageById",
                            messageId: messageId
                        },
                        onSuccess: function (data) {
                            if (data.success) {
                                var result = JSON.parse(data.data.MESSAGE_PARAMETER);
                                successCall(result);
                            }
                        }
                    });
                }
            }

        };
    })

    .build();
