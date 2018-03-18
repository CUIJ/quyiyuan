/**
 *产品名称：quyiyuan
 *创建者：赵婷
 *创建时间：2015/5/11
 *创建原因：医院导航首页服务层
 *修改者：
 *修改原因：
 *
 */
/**
 *产品名称：quyiyuan
 *创建者：赵婷
 *创建时间：2015/5/4
 *创建原因：修改密码功能实现
 *修改者：
 *修改原因：
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.center.service.navigation")
    .require(["kyee.framework.service.messager"])
    .type("service")
    .name("NavigationService")
    .params(["KyeeMessagerService"])
    .action(function(KyeeMessagerService){
        var def = {



        };
        return def;
    })
    .build();
