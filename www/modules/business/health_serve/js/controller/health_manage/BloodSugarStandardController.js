/*
 * 产品名称：quyiyuan
 * 创建人: cuijin
 * 创建日期: 2017.9.2
 * 创建原因：
 */
new KyeeModule()
    .group("kyee.quyiyuan.center.controller.blood_sugar_standard")
    .require([
    ])
    .type("controller")
    .name("BloodSugarStandardController")
    .params([
        "$scope","KyeeListenerRegister"
    ])
    .action(function ($scope,KyeeListenerRegister
    ) {
        KyeeListenerRegister.regist({
            focus: "weight_manage",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.ENTER,
            direction: "both",
            action: function (params) {
            }
        });
    })
    .build();