new KyeeModule()
    .group("kyee.quyiyuan.hospital.HospitalIsRefferService.service")
    .type("service")
    .name("HospitalIsRefferService")
    .params(["HttpServiceBus"])
    .action(function(HttpServiceBus ){

        var def = {
            isHasRefferHospital : function(hospitalId,userVsId,onSuccess){
                HttpServiceBus.connect({
                    url: '/appoint/action/ReferralAction.jspx',
                    params: {
                        op: 'isOpenReferralActionC',
                        hospitalId: hospitalId,
                        USER_VS_ID: userVsId
                    },
                    onSuccess: function (retVal) {
                        var success = retVal.success;
                        var data = retVal.data;
                        if (success) {
                            onSuccess(data);
                        }
                    }
                });

            }
        };
        return def;
    })
    .build();