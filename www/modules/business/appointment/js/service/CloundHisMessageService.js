/**
 * 产品名称：quyiyuan
 * 创建者：王婉
 * 创建时间：2016年10月21日18:09:12
 * 创建原因：预缴金金额不足消息提示
 * 修改者：
 * 修改原因：
 *
 */
new KyeeModule()
    .group('kyee.quyiyuan.appointment.clound.his.message.service')
    .type('service')
    .require([])
    .name('CloundHisMessageService')
    .params(["$state",
        "KyeeMessageService",
        "KyeeViewService",
        "HttpServiceBus"])
    .action(function($state,KyeeMessageService,KyeeViewService,HttpServiceBus){
        var def={
            MESSAGE:[]
        }
        return def;
    })
    .build();