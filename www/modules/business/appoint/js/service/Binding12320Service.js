/**
 * 产品名称：quyiyuan
 * 创建者：刘健
 * 创建时间： 2015/5/14
 * 创建原因：绑定12320用户服务
 * 修改者：
 * 修改原因：
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.appoint.binding12320.service")
    .require(["kyee.framework.service.message"])
    .type("service")
    .name("Binding12320Service")
    .params(["HttpServiceBus", "KyeeMessageService"])
    .action(function (HttpServiceBus, KyeeMessageService) {
        var bandingresult = {
            //绑定南京12320用户
            bandingUser: function (params, onSuccess) {
                HttpServiceBus.connect({
                    url: "/appoint/action/AppointActionC.jspx",
                    params: {
                        op: "save12320Pswd",
                        hospitalID: params.hospitalId,
                        PHONE_NUMBER: params.phoneNum,
                        USERCODE: params.userCode,
                        USER_ID: params.userId,
                        PSWD: MD5.encode(params.pswd)
                    },
                    onSuccess: function (data) {
                        onSuccess(data);
                    }
                });
            }
        }
        return bandingresult;
    })
    .build();

