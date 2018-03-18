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
    .group("kyee.quyiyuan.center.service.ChangePwdService")
    .require(["kyee.framework.service.messager",
               "kyee.quyiyuan.login.rsautil.service",
               "kyee.quyiyuan.service_bus.http"])
    .type("service")
    .name("ChangePwdService")
    .params(["KyeeMessagerService",
             "RsaUtilService",
              "HttpServiceBus"])
    .action(function(KyeeMessagerService,RsaUtilService,HttpServiceBus){
        var def = {
            //验证旧密码
            checkOldPwd:function(Callback,userCode,oldPwd,$scope){
                HttpServiceBus.connect({
                    url : "user/action/LoginAction.jspx",
                    params : {
                        loc : "c",
                        op : "checkOldPassword",
                        USER_CODE:userCode,
                        OLD_PSWD:oldPwd
                    },
                    onSuccess : function (resp) {
                        Callback(resp);
                    }
                });
            },
            //修改密码
            changePwdService:function(Callback,getData,$scope){
                HttpServiceBus.connect({
                    url : "user/action/LoginAction.jspx",
                    params : {
                        loc : "c",
                        op : "changepwd",
                        postdata: getData
                    },
                    onSuccess : function (resp) {
                        Callback(resp);
                    }
                });
            }

        };
        return def;
    })
    .build();
