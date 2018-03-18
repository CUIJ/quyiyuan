/**
 * 产品名称：quyiyuan
 * 创建者：赵婷
 * 创建时间： 2015年5月12日10:41:05
 * 创建原因：医院楼宇明细服务
 * 修改者：
 * 修改原因：
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.navigation.service.navigationDetail")
    .require(["kyee.framework.service.messager"])
    .type("service")
    .name("NavigationDetailService")
    .params(["KyeeMessagerService","HttpServiceBus"])
    .action(function(KyeeMessagerService,HttpServiceBus){
        var def = {
           navigationID:undefined,
           allNavigationInfro:undefined
        };
        return def;
    })
    .build();
