/*
 * 产品名称：quyiyuan
 * 创建人: 张家豪
 * 创建日期:2015年9月24日10:18:09
 * 创建原因：密码大于90天的信息寻回机制
   修改人：付添
 * 任务号：KYEEAPPC-4506
 */

new KyeeModule()
    .group("kyee.quyiyuan.login.verify_name.controller")
    .require([
        "kyee.quyiyuan.login.regist.service",
        "kyee.framework.service.view",
        "kyee.framework.service.scanning",
        "kyee.quyiyuan.login.service",
        "kyee.quyiyuan.login.agreement.controller",
        "kyee.framework.device.message"
    ])
    .type("controller")
    .name("VerifyNameController")
    .params([
        "$scope","$interval", "$state", "RegistService", "KyeeViewService", "KyeeScanService", "UserFilterDef", "LoginService", "KyeeDeviceMsgService", "KyeeListenerRegister", "KyeeMessageService", "KyeeUtilsService", "CacheServiceBus", "UpdateUserService", "RsaUtilService", "KyeeI18nService", "$ionicHistory", "CenterUtilService"
    ])
    .action(function ($scope, $interval,$state, RegistService, KyeeViewService, KyeeScanService, UserFilterDef, LoginService, KyeeDeviceMsgService, KyeeListenerRegister, KyeeMessageService, KyeeUtilsService, CacheServiceBus, UpdateUserService, RsaUtilService, KyeeI18nService, $ionicHistory, CenterUtilService) {
        var timeCtrl = 60;                          // 设置每隔60秒点击一次 By  付添  KYEEAPPC-3540
        var isTimer = undefined;
        var second = 120;                          //倒计时
        $scope.userInfo = [];

        /**
         * 监听进入当前页面
         */
        KyeeListenerRegister.regist({
            focus: "verify_name",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (params) {
                pageElementInit();                       //页面元素控制初始化
            }
        });
        /**
         * 页面元素控制初始化
         */
        var pageElementInit = function () {
            $scope.userInfo = {
                user: "",
                pwd: "",
                autoLogin: true,
                rememberPwd: true,
                name: "",//初始化姓名
                securityCode: "",
                PASSWORD: "",
                validateBtnDisabled: false,//发送验证码按钮置灰
                loginNum: "",       //验证码校验
                phoneNumDisabled: "", //无用字段，为了调用服务层密码不报错
                validateMsgText: KyeeI18nService.get("regist.getCode", "获取验证码")//发送验证码按钮显示
            };
            $scope.buttonOne = KyeeI18nService.get("verify_name.checkAndLoginAnain", "验证并登陆");
            $scope.isVoiceVerificationCode = false; //控制语音短信验证码的字段
            $scope.hintName = KyeeI18nService.get("login.hintName", "请输入您的姓名");
            $scope.hintPass = KyeeI18nService.get("regist.hintPassFormat", "请设置密码（6到16位数字或字母）");
            $scope.hintCode = KyeeI18nService.get("regist.hintCode", "请输入验证码");
        };
        /**
         * 发送验证短信点击事件
         */
        $scope.getValiteCode = function () {
            RegistService.voiceCode.voiceCode = undefined;
            RegistService.voiceCode.isCountdown = undefined;
            getCode();
        };
        /**
         * 语音验证码点击事件
         */
        $scope.voiceVerificationCode = function () {
            if (!isTimer) {
                RegistService.voiceCode.voiceCode = 1;   //语音短信验证码标记  By  付添  KYEEAPPC-3540
                RegistService.voiceCode.isCountdown = 1; //发送短信验证码流程    By  付添  KYEEAPPC-3540
                getCode();
            } else {
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("regist.bigOperation", "操作频繁，请于60秒后重试"),
                    duration: 1000
                });
            }
        };
        /**
         * 监听验证码输入框不为空 语音短信提示显示
         */
        $scope.$watch('userInfo.loginNum', function () {
            var code=  $scope.userInfo.loginNum;
            if(code){
                $scope.isVoiceVerificationCode = false;
            }
        });
        /**
         * 验证码输入框点击事件。显示语音验证提示
         */
        $scope.isVoiceVerificationCodeFalse = function () {
            $scope.isVoiceVerificationCode = false;
        };
        /**
         * 提交点击事件
         */
        $scope.verifyAndLogin = function () {
            var name = trim($scope.userInfo.name);
            var phoneNumber = RegistService.IS_PHONE_NUMBER;
            var securityCode = $scope.userInfo.loginNum;
            var PASSWORD = RsaUtilService.getRsaResult($scope.userInfo.PASSWORD);
            //效验手机号、密码、验证码
            if (!CenterUtilService.validateMobil(phoneNumber) || !CenterUtilService.validatePassWord($scope.userInfo.PASSWORD) || !CenterUtilService.isDataBlankAndHint(securityCode, KyeeI18nService.get("regist.emptyCode", "验证码不能为空！"))) {
                return;
            }
            RegistService.verifyName(name, phoneNumber, securityCode, PASSWORD, function (data) {
                    if (data.success) {
                        $scope.userInfo.user = phoneNumber;
                        $scope.userInfo.pwd = $scope.userInfo.PASSWORD;
                        $scope.doLogin();//再登录
                    } else if (data.data == 0 && data.message) {
                        KyeeMessageService.broadcast({
                            content: data.message
                        });
                        RegistService.NORMAL_PROCESS = 1;
                    } else if (data.message) {
                        KyeeMessageService.broadcast({
                            content: data.message
                        });
                    }
                }
            );
        };
        /**
         * 发送短信验证码和语音验证码共同调用方法
         */
        var getCode = function () {
            var userInfo = $scope.userInfo;
            var phoneNumber = RegistService.IS_PHONE_NUMBER;
            if (phoneNumber) {
                if (UpdateUserService.getValiteCode(phoneNumber)) {
                    sendRegCheckCodeActionC();
                    //手机验证码自动回填
                    KyeeDeviceMsgService.getMessage(
                        function (validateNum) {
                            $scope.userInfo.loginNum = validateNum;
                            $scope.$digest();
                        }
                    );
                }
            } else {
                UpdateUserService.PHONEisNulls();
            }
        };

        /**
         * 验证完用户姓名做登录操作
         */
        $scope.doLogin = function () {
            LoginService.doLogin($scope.userInfo, afterLogin);
        };
        /**
         * 登录完页面跳转
         */
        var afterLogin = function () {
            $state.go("home->MAIN_TAB");
        };
        /**
         *  发送验证码调service
         */
        var timer;
        var sendRegCheckCodeActionC = function () {
            var cache = CacheServiceBus.getMemoryCache();
            var storageCache = CacheServiceBus.getStorageCache();
            var phoneNum = RegistService.IS_PHONE_NUMBER;
            RegistService.isFlag = true;
            //发送短信获取验证码
            RegistService.getMsgData(phoneNum, storageCache, storageCache, $scope,
                function (data) {
                    if (data.success) {
                        //语音验证分支 KYEEAPPC-3540
                        if (RegistService.voiceCode.isCountdown == 1) {
                            KyeeMessageService.broadcast({
                                content: KyeeI18nService.get("regist.voiceCall", "请您稍等，[语音验证码]电话马上就来"),
                                duration: 5000
                            });
                            RegistService.voiceCode.isCountdown = undefined;
                            //倒计时60秒  By  付添  KYEEAPPC-3540
                            timeCtrl = 60;
                              timer = KyeeUtilsService.interval({
                                time: 1000,
                                action: function () {
                                    voiceSetBtnState(timer);
                                }
                            });
                            isTimer = 1;
                        } else {
                            if(data){
                                if(data.data.SECURITY_CODE=='007'){
                                    second = data.data.secondsRange;
                                }
                                else {
                                    //按钮冻结时间为120秒
                                    second = 120;
                                }
                            }

                            setBtnState();
                            $scope.userInfo.validateBtnDisabled = true;
                             timer = KyeeUtilsService.interval({
                                time: 1000,
                                action: function () {
                                    second--;
                                    setBtnState(timer);
                                }
                            });
                            if('007'!=data.data.SECURITY_CODE){
                            KyeeMessageService.broadcast({
                                content: data.message
                            });}
                        }
                    } else if (data.message) {
                        KyeeMessageService.broadcast({
                            content: data.message
                        });
                    }
                    setTimeout(function () {
                        $scope.isVoiceVerificationCode = true;
                    }, 1000);
                });
        };

        /**
         *  获取语音验证码间隔 定时器内容   付添  KYEEAPPC-3540
         * @param timer
         */
        var voiceSetBtnState = function (timer) {
            try {
                if (timeCtrl != -1) {
                    timeCtrl--;
                } else {
                    isTimer = undefined;
                    KyeeUtilsService.cancelInterval(timer);//关闭定时器
                }
            } catch (e) {
                //关闭定时器
                KyeeUtilsService.cancelInterval(timer); //关闭定时器
            }
        };
        /**
         * 短信验证码倒计时120s
         * @param timer
         */
        var setBtnState = function (timer) {
            try {
                if (second != -1) {
                    $scope.userInfo.validateMsgText =
                        KyeeI18nService.get("regist.Surplus", "剩余 ") +
                        second +
                        KyeeI18nService.get("regist.seconds", "秒");
                } else {
                    $scope.userInfo.validateBtnDisabled = false;
                    $scope.userInfo.validateMsgText = KyeeI18nService.get("regist.getCode", "获取验证码");
                    //关闭定时器
                    KyeeUtilsService.cancelInterval(timer);
                }
            } catch (e) {
                //关闭定时器
                KyeeUtilsService.cancelInterval(timer);
            }
        };
        /**
         * 去空格方法
         * @param string
         * @returns {*|string}
         */
        var trim = function (string) {
            if (string) {
                var str = string.trim();
            }
            return str;
        };

        /**
         * 页面回退监听
         */
        $scope.backToFrom = function () {
            $ionicHistory.goBack(-1);
        };
        /**
         * 监听物理返回键保证和页面返回键一样
         */
        KyeeListenerRegister.regist({
            focus: "verify_name",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.backToFrom();
            }
        });

        KyeeListenerRegister.regist({
            focus: "verify_name",
            when:  KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_LEAVE,
            action: function (params) {
                $interval.cancel(timer);
            }
        });
    })
    .build();
