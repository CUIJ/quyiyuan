/*
 *废弃controller，因为太多业务模块对其有依赖，暂不删除页面，将其中代码清空
 */
new KyeeModule()
    .group("kyee.quyiyuan.center.controller.update_user")
    .require([])
    .type("controller")
    .name("UpdateUserController")
    .params([])
    .action(function () {
    })
    .build();