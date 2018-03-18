/**
 * 产品名称：quyiyuan
 * 创建者：张明
 * 创建时间：2015年9月9日11:21:20
 * 创建原因：特色科室服务交互层
 * 修改者：
 * 修改原因：
 *
 */
new KyeeModule()
    .group('kyee.quyiyuan.telappointment.service')
    .type('service')
    .require([])
    .name('TelAppointmentService')
    .params(["$state",
              "KyeeMessageService",
              "KyeeViewService",
              "HttpServiceBus"])
    .action(function($state,KyeeMessageService,KyeeViewService,HttpServiceBus){
        var def={
            // 电话预约后台转发逻辑
            telAppointRedict:function(telUserInfo,onSuccess){
                var params = telUserInfo;
                params['op'] = 'telAppointLogin';
                HttpServiceBus.connect({
                    url: "/user/action/LoginAction.jspx",
                    params:params,
                    onSuccess: function (data) {
                        if (data.success) {
                            onSuccess(data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 3000
                            });
                            $state.go("login");
                        }
                    }
                });
            }

        }
        return def;
    })
    .build();