/**
 * 产品名称：保险页面返回到APP
 * 创建者：高萌
 * 创建时间： 2017年1月18日15:36:40
 * 创建原因：登录页面的service
 * 修改者：高萌
 * 任务号：KYEEAPPC-8861
 *
 */
new KyeeModule()
    .group('kyee.quyiyuan.insurancebackapp.service')
    .type('service')
    .require([])
    .name('InsuranceBackAPPService')
    .params(["$state",
              "KyeeMessageService",
              "KyeeViewService",
              "HttpServiceBus"])
    .action(function($state,KyeeMessageService,KyeeViewService,HttpServiceBus){
        var def={
            // 微信公众号预约挂号完成页进入保险后返回键的的逻辑
            insuranceBackAPP:function(insuranceUserInfo,onSuccess){
                var params = insuranceUserInfo;
                params['op'] = 'insuranceBackAppLogin';
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