/**
 * 产品名称：quyiyuan
 * 创建者：章剑飞
 * 创建时间：2016年1月19日20:02:17
 * 创建原因：支付结果服务
 * 修改者：
 * 修改原因：
 */
new KyeeModule()
    .group("kyee.quyiyuan.payResult.service")
    .type("service")
    .name("PayResultService")
    .params(["HttpServiceBus", "CacheServiceBus"])
    .action(function (HttpServiceBus, CacheServiceBus) {
        var def = {


        };

        return def;
    })
    .build();