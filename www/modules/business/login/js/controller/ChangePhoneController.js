/**
 * 产品名称：quyiyuan
 * 创建者：付添
 * 创建时间： 2015年12月8日16:28:15
 * 创建原因：更换手机号
 * 任务号：KYEEAPPC-4398
 */
new KyeeModule()
    .group("kyee.quyiyuan.login.changephone.controller")
    .require([
        "kyee.quyiyuan.login.service",
        "kyee.quyiyuan.login.changephone.service"
    ])
    .type("controller")
    .name("ChangePhoneController")
    .params([
        "$scope",
        "$state",
        "KyeeViewService",
        "LoginService",
        "KyeeListenerRegister",
        "KyeeI18nService",
        "CacheServiceBus",
        "ChangePhoneService",
        "KyeeDeviceMsgService",
        "KyeeI18nService",
        "KyeeMessageService",
        "$ionicHistory"
    ])
    .action(function($scope,$state ,KyeeViewService, LoginService, KyeeListenerRegister,KyeeI18nService,CacheServiceBus,ChangePhoneService,
                     KyeeDeviceMsgService,KyeeI18nService,KyeeMessageService,$ionicHistory){
        /**
         * 监听进入当前页面
         */
        KyeeListenerRegister.regist({
            focus: "change_phone",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (params) {
                enterFun();
            }
        });
        /**
         * 进入当前页面初始化方法
         */
        var enterFun= function(){
            //初始化用户注册信息
            $scope.user = {
                phone: "",
                hintPhone:KyeeI18nService.get("change_phone.hintPhone","请输入您新绑定的手机号"),
                phoneNumDisabled:false,
                validateBtnDisabled:false,
                checkCode:"",
                title:KyeeI18nService.get("change_phone.changePhone","更换手机号"),
                btnShow:KyeeI18nService.get("change_phone.getCode","获取验证码"),
                hintCode:KyeeI18nService.get("change_phone.hintCode","请输入验证码")
            };
        };
        /**
         * 页面返回键监听
         */
        $scope.goOut = function(){
            ChangePhoneService.clearTask();
            $ionicHistory.goBack();
        }
        /**
         * 获取验证码点击事件
         */
        $scope.getValiteCode = function () {
            ChangePhoneService.getCodeByPhone($scope.user);
                //手机验证码自动回填
            KyeeDeviceMsgService.getMessage(
                    function (validateNum) {
                        $scope.user.checkCode = validateNum;
                        $scope.$digest();
                    }
                );
        };
        /**
         * 提交点击事件
         */
        $scope.submit=function(){
            var phone= $scope.user.phone;
            var checkCode=$scope.user.checkCode;
            ChangePhoneService.requestChangePhone(phone,checkCode,function(data){
                if(data.success) {
                  $state.go("login");
                }});
        };
        /**
         *   物理返回键监听保证和页面返回键一致
         */
        KyeeListenerRegister.regist({
            focus: "change_phone",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.goOut();
            }
        });
    })
    .build();
