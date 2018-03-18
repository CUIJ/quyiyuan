/**
 * 产品名称：quyiyuan
 * 创建者：田新
 * 创建时间： 2015/4/30
 * 创建原因：注册页面的controller
 * 修改人：付添
 * 任务号：KYEEAPPC-4506
 */
new KyeeModule()
    .group("kyee.quyiyuan.login.regist.controller")
    .require([
        "kyee.quyiyuan.login.regist.service",
        "kyee.framework.service.view",
        "kyee.framework.service.scanning",
        "kyee.quyiyuan.login.service",
        "kyee.quyiyuan.login.agreement.controller",
        "kyee.framework.device.message",
        "kyee.quyiyuan.login.findpassword.controller",
        "kyee.quyiyuan.login.verify_name.controller",
        "kyee.quyiyuan.account_authentication.service"
    ])
    .type("controller")
    .name("RegistController")
    .params(["CenterUtilService","$scope", "$state", "RegistService", "KyeeViewService", "KyeeScanService", "UserFilterDef", "LoginService", "KyeeDeviceMsgService", "KyeeListenerRegister", "KyeeMessageService", "KyeeUtilsService", "KyeeI18nService", "$ionicHistory", "AccountAuthenticationService"
    ])
    .action(function (CenterUtilService,$scope, $state, RegistService, KyeeViewService, KyeeScanService, UserFilterDef, LoginService, KyeeDeviceMsgService, KyeeListenerRegister, KyeeMessageService, KyeeUtilsService,KyeeI18nService,$ionicHistory,AccountAuthenticationService) {

        $scope.userInfo = {
            phoneNum: "",
            loginNum: "",
            password: "",
            pwdType: "password",
            passwordAgain: "",
            phoneNumDisabled: false,                              //手机号输入框是否可输入
            validateBtnDisabled: false,                           //发送短信验证码是否可点击
            validateMsgText: KyeeI18nService.get("regist.getCode", "获取验证码"),
            isAgreementShow: AppConfig.BRANCH_VERSION == "00",   //只有核心版本（"00"）显示
            guideNum: "",                                           //导医编号
            remark: "",                                             //备注
            isGuideShow: false,                                    //是否显示导医
            isActive: false,                                        //密码眼睛
            isRemarkShow: false,                                  //是否显示备注
            isAgree: true      //同意协议与否的样式//修复注册不选择协议可注册问题   By  张家豪  KYEEAPPC-3409
        };
        var isFromFiler = LoginService.isFromFiler;    //全局-判断登录页面是否从过滤器引导出来

        $scope.totalWidth = window.innerWidth;
        /**
         * 监听进入当前页面
         */
        KyeeListenerRegister.regist({
            focus: "regist_user",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (params) {
                pageElementInit(params);                       //页面元素控制初始化
                judgeIsShowElement($scope.userInfo);    //判断是否需要显示“导医”“备注”“短信验证码”
            }
        });
        /**
         * 眼睛点击事件
         */
        $scope.iconClick = function () {
            if ($scope.userInfo.isActive == true) {
                $scope.userInfo.pwdType = "password";
                $scope.userInfo.isActive = false;
            } else {
                $scope.userInfo.pwdType = "text";
                $scope.userInfo.isActive = true;
            }
        };
        /**
         * 验证码输入框点击事件
         */
        $scope.isVoiceVerificationCodeFalse = function () {
            $scope.isVoiceVerificationCode = false;        //一旦点击验证码输入框语音验证码提示出现
        };
        /**
         *  获取验证码点击事件
         */
        $scope.sendRegCheckCode = function () {
            RegistService.voiceCode.voiceCode = undefined;
            RegistService.voiceCode.isCountdown = undefined;
            if (RegistService.NORMAL_PROCESS == 1) {        //用户从校验用户信息过来走正常流程
                getCheckCode(2);                              //发送短信验证码正常流程
            } else {
                getCheckCode(3);                               //短信验证非正常流程标识
            }

        };
        /**
         * 语音验证码点击事件
         */
        $scope.voiceVerificationCode = function () {
            if (!RegistService.isTimer) {                     //距上次发送语音短信是否60s
                RegistService.voiceCode.voiceCode = 1;       //语音短信验证码标记  By  付添  KYEEAPPC-3540
                getCheckCode(1);                               //语音验证正常流程
            } else {
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("regist.bigOperation","操作频繁，请于60秒后重试"),
                    duration: 1000
                });
            }
        };
        /**
         * 注册点击事件
         */
        $scope.registAndLogin = function () {
            if(false ==CenterUtilService.validateGuideNum($scope.userInfo.guideNum)){
                //判断导医编号
                KyeeMessageService.confirm({
                    title: KyeeI18nService.get("login.hint","提示"),
                    content: "您录入的导医编号无效，是否重新录入？",
                    onSelect: function (flag) {
                        if (flag) {
                            $scope.userInfo.guideNum="";
                        }else{
                            RegistService.registAndLogin($scope, afterRegistAndLogin); //注册并登录后调用afterRegistAndLogin方法，跳转到相应的页面
                        }
                    }
                });
            }else{
                RegistService.registAndLogin($scope, afterRegistAndLogin); //注册并登录后调用afterRegistAndLogin方法，跳转到相应的页面
            }

        };
        /**
         * 扫描二维码点击事件
         */
        $scope.scan = function () {
            KyeeScanService.scan(
                function (code) {
                    $scope.userInfo.guideNum = code;
                    $scope.$digest(); // 刷新
                },
                function () {
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("regist.failScaner","扫描二维码失败!")
                    });
                }
            );
        };
        /**
         *  “同意协议”点击事件
         */
        $scope.agree = function () {
            $scope.userInfo.isAgree = !$scope.userInfo.isAgree;//修复注册不选择协议可注册问题   By  张家豪  KYEEAPPC-3409
        };
        /**
         点击事件阅读协议
         */
        $scope.readContract = function () {
            $state.go("q_agreement"); // 	模态改路由 付添  KYEEAPPC-3658 1
        };
        /**
         * 页面元素初始化
         */
        var pageElementInit = function(params){
            $scope.isVoiceVerificationCode = false;         //语音验证是否显示控制
            RegistService.voiceCode.isCountdown = undefined; //是否是语音验证码的倒计时标记字段滞空
            $scope.hintPhone= KyeeI18nService.get("login.hintPhone","请输入您的手机号码");
            $scope.hintPassFormat=KyeeI18nService.get("regist.hintPassFormat","请设置密码（6到16位数字或字母）");
            $scope.hintCode=KyeeI18nService.get("regist.hintCode","请输入验证码");
            $scope.hintMedicalDoctor=KyeeI18nService.get("regist.placeholderNumber","请输入导医编号（选填）");
            $scope.hintRemark=KyeeI18nService.get("regist.hintRemark","请输入备注信息");
            if( params.from=="login"){  //直接从登陆页面过来清空注册信息 解决有时不清空问题
                $scope.userInfo = {
                    phoneNum: "",
                    loginNum: "",
                    password: "",
                    pwdType: "password",
                    passwordAgain: "",
                    phoneNumDisabled: false,                              //手机号输入框是否可输入
                    validateBtnDisabled: false,                           //发送短信验证码是否可点击
                    validateMsgText: KyeeI18nService.get("regist.getCode", "获取验证码"),
                    isAgreementShow: AppConfig.BRANCH_VERSION == "00",   //只有核心版本（"00"）显示
                    guideNum: "",                                           //导医编号
                    remark: "",                                             //备注
                    isGuideShow: false,                                    //是否显示导医
                    isActive: false,                                        //密码眼睛
                    isRemarkShow: false,                                  //是否显示备注
                    isAgree: true      //同意协议与否的样式//修复注册不选择协议可注册问题   By  张家豪  KYEEAPPC-3409
                };
            }

        };
        /**
         *  判断是否需要显示“导医”“备注”“短信验证码”
         */
        var  judgeIsShowElement = function(userInfo){
            RegistService.isShow(userInfo);
        };
        /**
         * 用户登录点击事件
         */
        $scope.doLogin = function(){
            $state.go("login");
        };
        /**
         * 各个情况发送短信验证码
         * @param vioceFlge
         */
        var getCheckCode = function (vioceFlge) {              //入参 1 语音验证码过来 2、校验用户姓名失败过来 3、直接注册手机号存在
            if(vioceFlge == 1|| vioceFlge == 2) {
                $scope.getValiteCode();                         //直接发送短信 不做是否手机号存在、90天判断
                RegistService.NORMAL_PROCESS = undefined;      //将用户从验证姓名过来标记制空
            }
            if(vioceFlge == 3){
                mobilePhoneNumberIsInvalid();                   //判断手机号是否存在、以及90天
            }
        };
        /**
         *  发送验证码，做手机号90天验证  集成注册在调用service代码先不整改
         */
        var mobilePhoneNumberIsInvalid = function () {
            var phoneNumber = $scope.userInfo.phoneNum;
            RegistService.mobilePhoneNumberIsInvalid(
                phoneNumber,
                $scope,
                function (data) {
                    if (data.success) {
                        var data = data.data;
                        //判断是否是已注册//优化注册、找回密码逻辑（前台）   By  张家豪  KYEEAPPC-3317
                        if (data.isRegist == true || data.isRegist == "true") {
                            //判断是否大于90天未使用//优化注册、找回密码逻辑（前台）   By  张家豪  KYEEAPPC-3317
                            if (data.isGreaterThanNinety == false || data.isGreaterThanNinety == "false") {
                                KyeeMessageService.confirm({
                                    title:  KyeeI18nService.get("login.hint", "提示"),
                                    content:  KyeeI18nService.get("regist.hintFindPass","您的账号已经注册过，是否去找回密码？"),
                                    onSelect: function (flag) {
                                        if (flag) {
                                            //跳转到找回密码页面
                                            $state.go("find_password");  // 	模态该路由 付添  KYEEAPPC-3658 1
                                            //存储phoneNum，以便带入到找回密码页面
                                            LoginService.userInfo.user = phoneNumber;
                                            //记录从注册页面跳转到找回密码页面
                                            LoginService.toFindPwdFrontPage = "2";
                                        }
                                    }
                                });
                            } else if (data.isGreaterThanNinety == true || data.isGreaterThanNinety == "true") {
                                //取消倒计时任务,否则此任务一直在执行
                                RegistService.clearTask();
                                //激活上一个页面的物理返回
                                // activeFrontBackButton();
                                //存储phoneNum，以便带入那一页
                                RegistService.IS_PHONE_NUMBER = phoneNumber;
                                //手机号置灰
                                $scope.userInfo.phoneNumDisabled = true;
                                KyeeMessageService.confirm({
                                    title:  KyeeI18nService.get("regist.registHint","注册提醒"),
                                    content:  KyeeI18nService.get("regist.MessagePhoneExist","该手机号已被注册，若您是账号持有者，请找回账户后登录，非本人账号请重新注册。"),
                                    okText:KyeeI18nService.get("regist.fingdUserMessage", "找回账号"),
                                    cancelText: KyeeI18nService.get("regist.reRegist","重新注册"),
                                    onSelect: function (string) {
                                        if (string) {
                                            $state.go("verify_name"); // 	模态该路由 付添  KYEEAPPC-3658
                                        } else {
                                            //正常流程//优化注册、找回密码逻辑（前台）   By  张家豪  KYEEAPPC-3317
                                            $scope.getValiteCode();
                                            //从预约挂号过去的要重新制空
                                            RegistService.APPOINTMENT_REGISTER = undefined;
                                        }
                                    }
                                });
                            }
                        } else {
                            //正常流程//优化注册、找回密码逻辑（前台）   By  张家豪  KYEEAPPC-3317
                            $scope.getValiteCode();
                        }
                    } else if (data.message) {
                        KyeeMessageService.broadcast({
                            content: data.message
                        });
                    }
                }
            );
        };
        /**
         * 直接发送短信 不做是否手机号存在、90天判断
         */
        $scope.getValiteCode = function () {
            RegistService.getValiteCode($scope);
            setTimeout(function () {
                $scope.isVoiceVerificationCode = true;
            }, 1000);
            //手机验证码自动回填
            KyeeDeviceMsgService.getMessage(
                function (validateNum) {
                    $scope.userInfo.loginNum = validateNum;
                    $scope.$digest();
                }
            );
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
         * 注册并登录后页面跳转
         */
        var afterRegistAndLogin = function () {
            AccountAuthenticationService.isAuthSuccess = "0"; //完善信息标识  --刚注册完不可能完善信息
            AccountAuthenticationService.ifFromRegist="1";    //来源标识
            if (isFromFiler) {                                 //不是从过滤器产生的注册页面
                UserFilterDef.doFinashIfNeed();                 //通知此过滤节点完成
                LoginService.isFromFiler = false;              //重置此状态位
            }
            if(LoginService.frontPage == "5"){
                // 记录通过保险的注册量
                LoginService.recordRiskOperation("registFromInsurance", "regist", LoginService.insuranceUrl);
            }
            $state.go("account_authentication");
        };
        /**
         * 页面回退监听
         */
        $scope.backToFrom = function () {
            $ionicHistory.goBack(-1);                  // 模态改路由 付添  KYEEAPPC-3658 1
            RegistService.clearTask();                 //取消倒计时任务,否则此任务一直在执行
            RegistService.NORMAL_PROCESS = undefined; //正常登陆流程表示字段制为空
            RegistService.isTimer = undefined;           //关闭定时器
            KyeeUtilsService.cancelInterval(RegistService.timer);
        };
        /**
         * 监听物理返回键保证和页面返回键一样
         */
        KyeeListenerRegister.regist({
            focus: "regist_user",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.backToFrom();
            }
        });
    })
    .build();
