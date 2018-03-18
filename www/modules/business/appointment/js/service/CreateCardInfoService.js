/**
 * 产品名称：quyiyuan.
 * 创建用户：章剑飞
 * 日期：2015年8月4日20:02:57
 * 创建原因：申请新卡页面服务层
 */
new KyeeModule()
    .group("kyee.quyiyuan.appointment.create_card.service")
    .type("service")
    .name("AppointmentCreateCardService")
    .params(["HttpServiceBus", "KyeeMessageService"])
    .action(function (HttpServiceBus, KyeeMessageService) {
        var def = {
            password: '',
            address: '',
            enterInfo: false,
            confirmScope: undefined
        };
        return def;
    })
    .build();
