new KyeeModule()
    .group("kyee.quyiyuan.tiered_medical.service")
    .require(["kyee.framework.service.message"])
    .type("service")
    .name("TieredMedicalService")
    .params(["HttpServiceBus", "KyeeMessageService", "CacheServiceBus"])
    .action(function (HttpServiceBus, KyeeMessageService, CacheServiceBus) {

        var def = {
            executeHosOfReferral: function (id, onSuccess) {
                var storageCache = CacheServiceBus.getStorageCache();//»º´æÊý¾Ý
                HttpServiceBus.connect({
                    url: '/hospital/action/ReferralHospitalQueryActionC.jspx',
                    showLoading: false,
                    params: {
                        op: 'executeHosOfReferral',
                        hospitalId: id
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