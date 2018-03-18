/**
 * 产品名称：quyiyuan.
 * 创建用户：姚斌
 * 日期：2015年5月5日11:06:54
 * 创建原因：医患互动未读留言列表页面服务
 */
new KyeeModule()
    .group("kyee.quyiyuan.interaction.unreadMessage.service")
    .type("service")
    .name("UnreadMessageService")
    .params(["HttpServiceBus", "CacheServiceBus"])
    .action(function(HttpServiceBus, CacheServiceBus){

        var def = {

        };
        return def;
    })
    .build();
