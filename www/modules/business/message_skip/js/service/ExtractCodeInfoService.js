/**
 * 产品名称：quyiyuan
 * 任务号：KYEEAPPC-9543
 * 创建者：杨旭平
 * 创建时间： 2017/1/9
 * 创建原因：页面提取码服务
 */

new KyeeModule()
    .group("kyee.quyiyuan.messageSkip.ExtractCodeInfo.service")
    .require([])
    .type("service")
    .name("ExtractCodeInfoService")
    .params(["HttpServiceBus","KyeeMessageService","Md5UtilService"])
    .action(function (HttpServiceBus,KyeeMessageService,Md5UtilService) {

        var def = {
            /**
             * 提取码验证，成功后并激活就诊者信息
             */
            checkActivationCodeAndActivate:function(showLoadingFlag, objParams, onSuccess){
                var timestamp = (Date.parse(new Date())/1000000).toString().split(".")[0];
                var mdKey = Md5UtilService.md5("userId="+objParams.userId+"&timestamp="+timestamp+"&key=quyi");
                HttpServiceBus.connect({
                    url: "/user/action/BusinessMessagePushActionC.jspx",
                    showLoading: showLoadingFlag,
                    params: {
                        op: "checkActivationCodeAndActivate",
                        userId: objParams.userId,
                        userVsId: objParams.userVsId,
                        businessType:objParams.businessType,
                        businessCode:objParams.businessCode,
                        activationCode:objParams.activationCode,
                        notCheckUserVsId:objParams.notCheckUserVsId,
                        token:objParams.token,
                        key:mdKey
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            onSuccess(data.data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message
                            });
                        }
                    }
                });
            }


        };

        return def;
    })
    .build();
