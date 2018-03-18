new KyeeModule()
    .group("kyee.quyiyuan.referral_detail.service")
    .require(["kyee.framework.service.message"])
    .type("service")
    .name("ReferralDetailService")
    .params(["HttpServiceBus", "KyeeMessageService", "CacheServiceBus"])
    .action(function (HttpServiceBus, KyeeMessageService, CacheServiceBus) {

        var def = {
            referralData:null
        };
        return def;
    })
    .build();