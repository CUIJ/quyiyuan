/**
 * Created by Administrator on 2015/4/26.
 */
new KyeeModule()
    .group("kyee.quyiyuan.center.controller.administrator_login")
    .require(["kyee.quyiyuan.center.service",
        "kyee.framework.service.message",
        "kyee.framework.service.view",
        "kyee.quyiyuan.login.rsautil.service",
        "kyee.quyiyuan.login.service",
        "kyee.quyiyuan.center.administrator_login"])
    .type("controller")
    .name("AdministratorLogin")
    .params([
        "$scope",
        "$state",
        "KyeeMessageService",
        "KyeeViewService",
        "RsaUtilService",
        "CacheServiceBus",
        "LoginService",
        "KyeeI18nService",
        "KyeeListenerRegister",
        "KyeeDeviceMsgService",
        "CommPatientDetailService",
        "KyeeUtilsService",
        "AdministratorLoginService"])
    .action(function ($scope,
                      $state,
                      KyeeMessageService,
                      KyeeViewService,
                      RsaUtilService,
                      CacheServiceBus,
                      LoginService,
                      KyeeI18nService,
                      KyeeListenerRegister,
                      KyeeDeviceMsgService,
                      CommPatientDetailService,
                      KyeeUtilsService,
                      AdministratorLoginService) {

        //初始化一些字段
        $scope.validateMsgText = KyeeI18nService.get("update_user.validateMsgText", "获取验证码");//发送验证码按钮显示
        $scope.nameAndIdentityCcardInput = false;                                                  //姓名和身份证输入限制
        $scope.validateBtnDisabled = false;                                                        //发送验证码按钮置灰
        var second = 120;                                                                           //倒计时
        $scope.data = {};                                                                          //浮动层绑定参数
        $scope.currentAccount = KyeeI18nService.get("administrator_login.selectPhone","请选择验证手机");                                                 //授权人选定前默认显示
        $scope.info = {
            userAccount: "",                                                                  //登用户账号
            identifyingCode: ""                                                               //验证码
        };
        $scope.currentAccountPhone = "";                                                      //当前授权人手机号
        $scope.currentAccountName = "";                                                      //当前授权人姓名

        /**
         * 查询授权人--页面初始化唯一请求
         */
        var queryAuthorizedPerson = function () {
            AdministratorLoginService.queryAuthorizedPerson(
                function (data) {
                    if (data) {
                        if (data.data) {
                            $scope.administrators = data.data;
                            $scope.data = $scope.administrators;//授权人集合
                            $scope.data.currentAuthorizedAccount = $scope.currentAuthorizedAccount;//关闭浮动层方法
                        }
                        /**
                         * 浮动层长宽高
                         * @type {{width: number, height: number}}
                         */
                        $scope.overlayData = {
                            width: screenSize.width - 50 * 2,
                            height: $scope.administrators.length * 50
                        };
                    }
                }
            );
        };

        /**
         * 切换手机号
         */
        $scope.customPhone = function () {
            if ($scope.administrators && $scope.administrators.length > 0) {
                $scope.showOverlay();
            } else {
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("administrator_login.noLicencTip","当前不存在授权人。")
                });
            }
        };

        /**
         * 获取屏幕长宽尺寸
         * @type {*|{width, height}|{width: Number, height: Number}}
         */
        var screenSize = KyeeUtilsService.getInnerSize();

        /**
         * 选中授权人后所做的操作
         * @param item
         */
        $scope.currentAuthorizedAccount = function (item) {
            $scope.showOverlay = AdministratorLoginService.floatingLayerParameters.show;
            $scope.hideOverlay = AdministratorLoginService.floatingLayerParameters.hide;
            if (item) {
                $scope.currentAccount = item.PHONE_NUMBER + " " + item.NAME;
                $scope.currentAccountPhone = item.PHONE_NUMBER.trim();
                $scope.currentAccountName = item.NAME.trim();
            }
            $scope.hideOverlay();
        };

        /**
         * 发送验证码
         */
        $scope.getValiteCode = function () {
            if (CommPatientDetailService.getValiteCode($scope.currentAccountPhone)) {
                $scope.sendRegCheckCodeActionC();
                $scope.phoneNumDisabled = true;
                $scope.validateBtnDisabled = true;
                //手机验证码自动回填
                KyeeDeviceMsgService.getMessage(
                    function (validateNum) {
                        $scope.item.loginNum = validateNum;
                        setTimeout(function () {
                            $scope.$apply();
                        }, 1);                    
                    }
                );
            }
        };

        /**
         * 发送短信验证码的请求
         */
        $scope.sendRegCheckCodeActionC = function () {
            AdministratorLoginService.sendRegCheckCodeActionC(
                $scope.currentAccountPhone,
                function (data) {
                    //按钮冻结时间为120秒
                    if(data){
                        if(data.data.SECURITY_CODE=='007'){
                            second = data.data.secondsRange;
                        }
                        else {
                            second = 120;
                        }
                    }

                    setBtnState();
                    $scope.validateBtnDisabled = true;
                    $scope.phoneNumDisabled = true;
                    var timer = KyeeUtilsService.interval({
                        time: 1000,
                        action: function () {
                            second--;
                            setBtnState(timer);
                        }
                    });
                }
            );
        };

        /**
         * 登录后跳转处理
         */
        var afterLogin = function () {
            LoginService.afterLogin();
        };

        /**
         * 倒计时
         * @param timer
         */
        var setBtnState = function (timer) {
            try {
                if (second != -1) {
                    $scope.validateMsgText =
                        KyeeI18nService.get("update_user.surplus", "剩余")
                        + second +
                        KyeeI18nService.get("update_user.seconds", "秒");
                } else {
                    $scope.phoneNumDisabled = false;
                    $scope.validateBtnDisabled = false;
                    $scope.validateMsgText = KyeeI18nService.get("update_user.validateMsgText", "获取验证码");
                    //关闭定时器
                    KyeeUtilsService.cancelInterval(timer);
                }
            } catch (e) {
                //关闭定时器
                KyeeUtilsService.cancelInterval(timer);
            }
        };

        /**
         * 遮罩
         */
        $scope.bind = function (params) {
            $scope.data = $scope.administrators;//授权人集合
            $scope.showOverlay = params.show;//展示浮动层方法
            $scope.hideOverlay = params.hide;//关闭浮动层方法
            AdministratorLoginService.floatingLayerParameters = params;//备份浮动层内部提供方法
        };

        /**
         * 登陆
         */
        $scope.directLogin = function () {
            //登陆请求参数赋值
            var userInfo = {};
            userInfo = {
                phoneNumber: $scope.currentAccountPhone,
                securityCode: $scope.info.identifyingCode,
                userCode: $scope.info.userAccount
            };
            //调用登陆方法
            AdministratorLoginService.doLogin(userInfo, afterLogin);
        };

        /**
         * 进入页面时触发
         */
        KyeeListenerRegister.regist({
            focus: "administrator_login",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (params) {
                $scope.administrators = {}; //授权人集合初始化
                queryAuthorizedPerson();     //发送页面初始化唯一请求
            }
        });
    })
    .build();