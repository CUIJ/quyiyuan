/**
 * 产品名称：quyiyuan.
 * 创建用户：姚斌
 * 日期：2015年5月5日11:06:54
 * 创建原因：医患互动未读留言详情页面服务
 */
new KyeeModule()
    .group("kyee.quyiyuan.interaction.unreadMessageDetail.service")
    .type("service")
    .name("UnreadMessageDetailService")
    .params(["HttpServiceBus", "CacheServiceBus"])
    .action(function(HttpServiceBus, CacheServiceBus){

        var def = {

        };
        return def;
    })
    .build();
