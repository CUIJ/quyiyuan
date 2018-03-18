/**
 * 产品名称：quyiyuan
 * 创建者：董茁
 * 创建时间：2016年10月08日10:18:39
 * 创建原因：一键理赔完成页面service
 * 任务号：KYEEAPPC-8140
 */
new KyeeModule()
    .group("kyee.quyiyuan.claim_complete.service")
    .require([])
    .type("service")
    .name("ClaimCompleteService")
    .params(["HttpServiceBus", "KyeeMessageService", "KyeeUtilsService", "KyeeI18nService"])
    .action(function (HttpServiceBus, KyeeMessageService, KyeeUtilsService, KyeeI18nService) {
        var def = {
        };
        return def;
    })
    .build();