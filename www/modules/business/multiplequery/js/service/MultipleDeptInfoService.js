/**
 * 产品名称：quyiyuan.
 * 创建用户：杜巍巍
 * 日期：2015年10月27日20:06:25
 * 创建原因：模糊搜索页面查询搜索相关科室服务
 * 任务号：KYEEAPPC-3675
 */
new KyeeModule()
    .group("kyee.quyiyuan.messagecenter.multipledeptinfo.service")
    .require([
        "kyee.framework.service.message"
    ])
    .type("service")
    .name("MultipleDeptInfoService")
    .params(["HttpServiceBus", "CacheServiceBus","KyeeMessageService"])
    .action(function(HttpServiceBus, CacheServiceBus,KyeeMessageService){

        var def = {
        };

        return def;
    })
    .build();

