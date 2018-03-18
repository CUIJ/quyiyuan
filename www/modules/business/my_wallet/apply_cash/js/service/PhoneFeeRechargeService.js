/**
 * 任务号:KYEEAPPC-3678
 * 产品名称：quyiyuan.
 * 创建用户：huabo
 * 日期：2015年10月28日11:13:59
 * 创建原因：申请提现页面服务
 */
new KyeeModule()
    .group("kyee.quyiyuan.myWallet.phoneFeeRecharge.service")
    .require([])
    .type("service")
    .name("PhoneFeeRechargeService")
    .params(["HttpServiceBus", "CacheServiceBus", "KyeeMessageService", "AuthenticationService", 'KyeeViewService'])
    .action(function (HttpServiceBus, CacheServiceBus, KyeeMessageService, AuthenticationService, KyeeViewService) {

        var def = {
            //可用余额
            AMOUNT: '' ,
            /**
             * 获取提现记录数据
             */
            getPageInitData: function (onSuccess) {

                //获取用户的电话号码
                var userPhoneNumber = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).PHONE_NUMBER;

                HttpServiceBus.connect({
                    url: 'freeRgtPay/action/freeRgtPayActionC.jspx',
                    params: {
                        op: 'phoneFeePageDataInit',
                        PHONE_NUMBER: userPhoneNumber
                    },
                    onSuccess: function (resp) {
                        if (resp.success) {
                            var data = resp.data;
                            data.USER_PHONENUMBER = userPhoneNumber;
                            onSuccess(data);
                        } else if (resp.alertType == 'ALERT') {
                            KyeeMessageService.broadcast({
                                content: resp.message
                            });
                        }
                    }
                });
            },
            //检测充值条件
            checkPhoneFeeCharge: function (phoneNumber, price, onSuccess) {

                HttpServiceBus.connect({
                    url: 'freeRgtPay/action/freeRgtPayActionC.jspx',
                    params: {
                        op: 'checkPhoneFeeCharge',
                        PHONE_NUMBER: phoneNumber,
                        CHARGE_AMOUNT: price
                    },
                    onSuccess: function (resp) {
                        if (resp.success) {
                            onSuccess(resp.data);
                        } else if (resp.resultCode == '0150100') {
                            KyeeMessageService.broadcast({
                                content: resp.message
                            });

                        } else if (resp.resultCode == '0150101' || resp.resultCode == '0150102') {
                            def.processError(resp);
                        } else {
                            KyeeMessageService.broadcast({
                                content: resp.message
                            });
                        }
                    }
                });
            },

            /**
             * 提现错误处理函数 By章剑飞 2015年12月29日17:28:53
             */
            processError: function (resultRecords) {
                KyeeMessageService.confirm({
                    title: "消息",
                    content: resultRecords.message,
                    okText:'立即前往',
                    cancelText:'以后再说',
                    onSelect: function (res) {
                        if (res) {
                            var flag = '';
                            if (resultRecords.resultCode == '0150101') {
                                flag = 2;
                            }
                            var userInfo = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
                            AuthenticationService.HOSPITAL_SM = {
                                OFTEN_NAME: userInfo.NAME,
                                ID_NO: userInfo.ID_NO,
                                PHONE: userInfo.PHONE_NUMBER,
                                FLAG: flag
                            };
                            //认证类型： 0：实名认证，1：实名追述
                            AuthenticationService.AUTH_TYPE = 0;
                            //0：就诊者，1：用户
                            AuthenticationService.AUTH_SOURCE = 1;

                            KyeeViewService.openModalFromUrl({
                                scope: def.scope,
                                url: 'modules/business/center/views/authentication/authentication.html'
                            });

                        }
                    }
                });
            },
            //话费充值
            phoneFeeRecharge: function (phoneNumber, price, onSuccess) {

                var currentCardInfo = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CARD_INFO);
                var userInfo = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                var opreateName = '';
                var patientId = '';
                if (userInfo) {
                    opreateName = userInfo.OFTEN_NAME;
                }
                // 获取就诊卡信息
                if (currentCardInfo) {
                    patientId = currentCardInfo.PATIENT_ID;
                }
                HttpServiceBus.connect({
                    url: 'freeRgtPay/action/freeRgtPayActionC.jspx',
                    params: {
                        op: 'doPhoneFeeChargeProcess',
                        PHONE_NUMBER: phoneNumber,
                        CHARGE_AMOUNT: price,
                        OPERATE_NAME: opreateName,
                        PATIENT_ID: patientId
                    },
                    onSuccess: function (resp) {
                        if (resp.success) {
                            onSuccess(resp.data);
                        } else if (resp.resultCode == '0150100') {
                            KyeeMessageService.broadcast({
                                content: resp.message
                            });

                        } else if (resp.resultCode == '0150101' || resp.resultCode == '0150102') {
                            def.processError(resp);
                        } else {
                            KyeeMessageService.broadcast({
                                content: resp.message
                            });
                        }
                    }
                });
            }
        };


        return def;
    })
    .build();
