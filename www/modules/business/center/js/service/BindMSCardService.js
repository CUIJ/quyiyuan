/**
 * Created by zhuxueliang on 15/5/6.
 */
new KyeeModule()
    .group("kyee.quyiyuan.center.bindMSCard.service")
    .require(["kyee.framework.service.messager", "kyee.quyiyuan.login.md5util.service"])
    .type("service")
    .name("BindMSCardService")
    .params(["KyeeMessagerService", "HttpServiceBus", "Md5UtilService", "KyeeMessageService","KyeeI18nService"])
    .action(function (KyeeMessagerService, HttpServiceBus, Md5UtilService, KyeeMessageService,KyeeI18nService) {
        var def = {
            bindModel: undefined,
            //发送短信请求
            getValidateNum: function (getData, hospitalId, insuranceCardNo) {
                var me = this;
                HttpServiceBus.connect({
                    url: 'medicalSecurity/action/MedicalSecurityActionC.jspx',
                    params: {
                        op: 'getMessageCodeRequest',
                        HOSPITAL_ID: hospitalId,
                        USER_VS_ID: me.bindModel.USER_VS_ID,
                        OFTEN_NAME: me.bindModel.OFTEN_NAME,
                        ID_NO: me.bindModel.ID_NO,
                        MEDICAL_SECURITY_CARD_NO: insuranceCardNo,
                        BUSINESS_TYPE: '4001'
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            getData();
                        }
                    },
                    onError: function () {
                    }
                });
            },
            //绑定医保卡
            doBindInsuranceCard: function (getData, userInfo, hospitalId, $scope) {
                var me = this;
                var onlinePwd = Md5UtilService.md5(userInfo.insuranceCardPassword);
                onlinePwd = onlinePwd + '|' + userInfo.validationNum;
                onlinePwd = Md5UtilService.md5(onlinePwd);
                HttpServiceBus.connect({
                    url: '/medicalSecurity/action/MedicalSecurityActionC.jspx',
                    params: {
                        op: 'signMedicalSecurityCard',
                        MSG_CODE: userInfo.validationNum,// 获取的验证码
                        MS_ONLINE_PASSWORD: onlinePwd,// 加密的密码
                        HOSPITAL_ID: hospitalId,
                        USER_VS_ID: me.bindModel.USER_VS_ID,
                        OFTEN_NAME: me.bindModel.OFTEN_NAME,
                        ID_NO: me.bindModel.ID_NO,
                        MEDICAL_SECURITY_CARD_NO: userInfo.insuranceCardNum
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            KyeeMessageService.broadcast({
                                content: KyeeI18nService.get('bindMSCard.queryBindStatus','请稍后查询绑定状态！')
                            });
                            getData();
                        } else {
                            KyeeMessageService.message({
                                title:  KyeeI18nService.get("bindMSCard.msg","消息"),
                                content: KyeeI18nService.get("bindMSCard.netMiss","网络异常！"),
                                okText: KyeeI18nService.get("bindMSCard.know","知道了")
                            });
                        }
                    },
                    onError: function () {
                    }
                });
            }
        };
        return def;
    })
    .build();