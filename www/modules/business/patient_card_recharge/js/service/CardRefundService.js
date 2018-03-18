new KyeeModule()
    .group("kyee.quyiyuan.card_refund.service")
    .require([""])
    .type("service")
    .name("CardRefundService")
    .params(["HttpServiceBus", "KyeeMessageService", "CacheServiceBus","KyeeUtilsService"])
    .action(function (HttpServiceBus, KyeeMessageService, CacheServiceBus,KyeeUtilsService) {
        var def = {


        };
        return def;
    })
    .build();