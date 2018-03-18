/**
 * 产品名称：quyiyuan
 * 创建者：付添
 * 创建时间： 2015年12月8日16:28:15
 * 创建原因：快捷登录
 *  任务号：KYEEAPPC-4660
 */
new KyeeModule()
    .group("kyee.quyiyuan.login.quicklogin.service")
    .require([
        "kyee.quyiyuan.login.regist.service",
        "kyee.quyiyuan.login.service",
        "kyee.quyiyuan.center_util.service"
    ])
    .type("service")
    .name("QuickloginService")
    .params([
        "$state", "$timeout", "RegistService", "LoginService", "HttpServiceBus", "KyeeMessageService", "CacheServiceBus", "RsaUtilService", "KyeeI18nService", "CenterUtilService", "ChangePhoneService"
    ])
    .action(function ($state, $timeout, RegistService, LoginService, HttpServiceBus, KyeeMessageService, CacheServiceBus, RsaUtilService, KyeeI18nService, CenterUtilService, ChangePhoneService) {
        var def = {
            /**
             * 发送验证码之前校验手机号
             * @param user
             */
            getCodeByPhone: function (user,pwdLogin) {
                //校验手机号
                if (CenterUtilService.validateMobil(user.phone) == false) {
                    return;
                }
                //检查手机号是否存在,存在则去获取验证码
                HttpServiceBus.connect({
                    url: '/user/action/LoginAction.jspx',
                    params: {
                        op: 'phoneNumExistForLogin',
                        PHONE_NUMBER: user.phone
                    },
                    onSuccess: function (retVal) {
                        var success = retVal.success;
                        var message = retVal.message;
                        if (success) {
                            var retData = retVal.data;
                            if (retData) {
                                if (!retData.IS_PHONE_BIND) { //用户未注册
                                    KyeeMessageService.broadcast({
                                        content: KyeeI18nService.get("quick.canNotlogin", "该手机号未注册，请先注册！"),
                                        duration : 2000
                                    });
                                    //延迟1秒跳转注册页面
                                    $timeout(function () {
                                        LoginService.toRegistFrontPage = "1"; //记录从登陆页面到注册页面
                                        $state.go("regist_user");
                                    }, 1000);
                                } else if (retData.IS_PHONE_BIND && retData.NEED_CHECK) {//用户超过90天未登录
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
                var phone = user.phone;
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
                            user.phoneNumDisabled = true;
                            user.validateBtnDisabled = true;
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

                if(retVal){
                    if('007'==retVal.data.SECURITY_CODE){
                        def.second=retVal.data.secondsRange;
                    }
                    else{
                        def.second = 120;
                    }
                }

                var validateMsgBtn = document.getElementById("login.validateMsgBtn");
                var phoneNumInput = document.getElementById("login.phoneNumInput");
                def.task = window.setInterval(def.setBtnState, 1000, validateMsgBtn, phoneNumInput);
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
                        //if(document.getElementById('males')){
                        //    document.getElementById('males').focus();
                        //    document.getElementById('males').setAttribute('autofocus',true);
                        //    document.getElementById('males').style.display = 'none';
                        //    document.getElementById('males').style.display = 'block';
                        //}
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
