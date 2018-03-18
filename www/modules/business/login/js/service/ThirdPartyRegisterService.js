
new KyeeModule()
    .group("kyee.quyiyuan.login.thirdParty.service")
    .require([
        "kyee.framework.service.message",
        "kyee.quyiyuan.login.regist.service",
        "kyee.quyiyuan.login.service",
        "kyee.quyiyuan.login.rsautil.service"
    ])
    .type("service")
    .name("ThirdPartyRegisterService")
    .params([
        "$timeout",
        "CenterUtilService",
        "$state",
        "KyeeMessageService",
        "RegistService",
        "LoginService",
        "RsaUtilService",
        "HttpServiceBus",
        "KyeeI18nService",
        "CacheServiceBus"
    ])
    .action(function($timeout,CenterUtilService,$state, KyeeMessageService, RegistService, LoginService, RsaUtilService,
                     HttpServiceBus,KyeeI18nService,CacheServiceBus){

        var def = {
            thirdUserInfo:{},
            cache: CacheServiceBus.getMemoryCache(),//缓存

            getCodeByPhoneWinXin: function (user,pwdLogin) {
                //+86开头手机号去掉前三位
                var phone = user.thirdPhone;
                if (phone == 14) {
                    phone = phone.substring(3)
                }
                //校验手机号
                if (CenterUtilService.validateMobil(phone) == false) {
                    return;
                }
                //检查手机号是否存在,存在则去获取验证码
                HttpServiceBus.connect({
                    url: '/user/action/LoginAction.jspx',
                    params: {
                        op: 'phoneNumExistForLogin',
                        PHONE_NUMBER:phone
                    },
                    onSuccess: function (retVal) {
                        var success = retVal.success;
                        var message = retVal.message;
                        if (success) {
                            var retData = retVal.data;
                            if (retData) {
                                if (retData.IS_PHONE_BIND && retData.NEED_CHECK) {//用户超过90天未登录
                                    KyeeMessageService.broadcast({
                                        content: KyeeI18nService.get("login.needToPwdLogin", "该账号长时间未登录，为确保账户安全请您使用密码登录。"),
                                        duration : 3000
                                    });
                                    //延迟1秒跳转密码登录页面
                                    $timeout(function () {
                                        pwdLogin();
                                    }, 1000);
                                } else { //账户已存在
                                    def.getMsgData(user);//获取验证码
                                }
                            }
                        } else {
                            KyeeMessageService.broadcast({
                                content: KyeeI18nService.get("bindMSCard.netMiss", "网络异常！")
                            });
                        }
                    }
                });

            },
            /**
             * 发送短信获取验证码请求
             * @param user
             */
            getMsgData: function (user) {
                //+86开头手机号去掉前三位
                var phone = user.thirdPhone;
                if (phone == 14) {
                    phone = phone.substring(3)
                }
                var hospitalId = "";
                var storageCache = CacheServiceBus.getStorageCache();
                var hospitalInfo=  storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                if(hospitalInfo){
                    hospitalId= hospitalInfo.id;
                }
                HttpServiceBus.connect({
                    url: '/user/action/DataValidationActionC.jspx',
                    params: {
                        op: 'sendRegCheckCodeActionC',
                        hospitalId: hospitalId,
                        PHONE_NUMBER: RsaUtilService.getRsaResult(phone),
                        modId: '10001',
                        messageType: '2',
                        businessType:'0'
                    },
                    onSuccess: function (retVal) {
                        var success = retVal.success;
                        var message = retVal.message;
                        if (success) {
                            user.thirdPhoneNumDisabled = true;
                            user.thirdValidateBtnDisabled = true;
                            def.onRefreshDataviewDelay(retVal);
                        }else {
                            if (message) {
                                KyeeMessageService.broadcast({
                                    content: message
                                });
                            } else {
                                KyeeMessageService.broadcast({
                                    content: KyeeI18nService.get("login.netFailed","网络连接异常！")
                                });
                            }
                        }
                    },
                    onError:function(){
                        KyeeMessageService.broadcast({
                            content: KyeeI18nService.get("login.netFailed","网络连接异常！")
                        });
                    }
                });
            },
            /**
             * 取消倒计时任务
             */
            clearTask: function () {
                if (def.task) {
                    def.second = -1;
                    var validateMsgBtn = document.getElementById("login.validateMsgBtn");
                    if (validateMsgBtn) {
                        validateMsgBtn.innerText = KyeeI18nService.get("change_phone.getCode", "获取验证码");
                    }
                    clearInterval(def.task);
                }
            },
            /**
             *  进入倒计时
             */
            onRefreshDataviewDelay: function (retVal) {
                def.second = 120;
                if(retVal){
                    if('007'==retVal.data.SECURITY_CODE){
                        def.second=retVal.data.secondsRange;
                    }
                }
                var validateMsgBtn = document.getElementById("third_party_user.validateMsgBtn");
                var phoneNumInput = document.getElementById("third_party_user.phoneNumInput");
                def.task = window.setInterval(def.setBtnState, 1000, validateMsgBtn, phoneNumInput);
            },
            /**
             * 获取或注册APP用户
             * @param $scope
             * @param afterRegistAndLogin
             * @returns {boolean}
             */
            getAPPuserOrRegister: function ($scope,onSuccess) {
                var phone = $scope.user.thirdPhone;
                var checkCode = $scope.user.thirdCheckCode;
                //效验手机号
                if (!CenterUtilService.isDataBlankAndHint(checkCode,"您需要输入验证码")||!CenterUtilService.validateMobil(phone)){
                    return;
                }
                if (phone.length == 14) {
                    phone = phone.substring(3);
                }
                var storageCache = CacheServiceBus.getStorageCache();
                HttpServiceBus.connect({
                    url: '/user/action/LoginAction.jspx',
                    params: {
                        op: 'registerThirdPartyUser',
                        PHONE_NUMBER: phone,
                        SECURITY_CODE: checkCode,
                        TOKEN: def.cache.get(CACHE_CONSTANTS.MEMORY_CACHE.TOKEN_4_FULL_CHECK),
                        IS_ONLY_REGISTER:"1",
                        userSource: def.cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE)//用户来源
                    },
                    onSuccess: function (retVal) {
                        var success = retVal.success;
                        var message = retVal.message;
                        if (success) {
                            onSuccess(retVal.data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: message
                            });
                        }
                    }
                });
            },
            /**
             * 绑定第三方账号
             * @param $scope
             * @param afterRegistAndLogin
             * @returns {boolean}
             */
            bindThirdPartyUser: function (onSuccess) {
                HttpServiceBus.connect({
                    url: '/user/action/LoginAction.jspx',
                    params: {
                        op: 'bindThirdPartyUser',
                        LOGIN_TYPE: LoginService.thirdUserInfo.THIRD_LOGIN_TYPE,
                        AUTHS_CODE: RsaUtilService.getRsaResult(LoginService.thirdUserInfo.ENCRY_AUTHS_CODE),
                        USERID:LoginService.thirdUserInfo.USER_ID,
                        AUTHS_NAME:LoginService.thirdUserInfo.AUTHS_NAME,
                        AUTHS_SEX:LoginService.thirdUserInfo.AUTHS_SEX,
                        HEAD_IMG_URL:LoginService.thirdUserInfo.HEAD_IMG_URL,
                        PHONE_NUMBER:LoginService.thirdUserInfo.PHONE_NUMBER,
                        userSource: def.cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE),//用户来源
                        IS_ONLY_REGISTER:"1",
                        U_ID:RsaUtilService.getRsaResult(LoginService.thirdUserInfo.U_ID)
                    },
                    onSuccess: function (retVal) {
                        var success = retVal.success;
                        var message = retVal.message;
                        if (success) {
                            onSuccess(retVal.data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: message
                            });
                        }
                    }
                });
            },

            /**
             * 修改页面元素倒计时
             * @param validateMsgBtn
             * @param phoneNumInput
             */
            setBtnState: function (validateMsgBtn, phoneNumInput) {
                try {
                    if (def.second != -1) {
                        //直接操作$scope中的模型效率低下并且页面无法更新,因此直接操作dom
                        validateMsgBtn.innerText =
                            KyeeI18nService.get("change_phone.Surplus", "剩余 ") +
                            def.second +
                            KyeeI18nService.get("change_phone.seconds", "秒");
                        def.second--;
                    } else {
                        //直接操作$scope中的模型使页面无法更新,因此直接操作dom
                        validateMsgBtn.removeAttribute("disabled");
                        phoneNumInput.removeAttribute("disabled");
                        validateMsgBtn.innerText = KyeeI18nService.get("change_phone.getCode", "获取验证码");
                        clearInterval(def.task);
                    }

                } catch (e) {
                    clearInterval(def.task);
                }
            }
        };
        return def;
    })
    .build();
