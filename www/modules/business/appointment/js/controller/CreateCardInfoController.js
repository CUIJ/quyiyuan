/**
 * 产品名称：quyiyuan
 * 创建者：章剑飞
 * 创建时间：2015年8月4日18:58:50
 * 创建原因：申请新卡页面控制层
 * 修改者：
 * 修改原因：
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.appointment.create_card.controller")
    .require([
        "kyee.framework.service.view",
        "kyee.quyiyuan.appointment.create_card.service"
    ])
    .type("controller")
    .name("AppointmentCreateCardController")
    .params(["$scope", "$state", "$ionicHistory", "AppointmentCreateCardService", "CacheServiceBus", "KyeeMessageService", "RsaUtilService", "AppointConfirmService","KyeeI18nService","KyeeListenerRegister","$ionicScrollDelegate"])
    .action(function ($scope, $state, $ionicHistory, AppointmentCreateCardService, CacheServiceBus, KyeeMessageService, RsaUtilService, AppointConfirmService,KyeeI18nService,KyeeListenerRegister,$ionicScrollDelegate) {
        var memoryCache = CacheServiceBus.getMemoryCache();
        var a = CacheServiceBus.getStorageCache();
        //病人信息
        $scope.patientInfo = {
            name: memoryCache.get('currentCustomPatient').OFTEN_NAME,
            idNo: memoryCache.get('currentCustomPatient').ID_NO,
            phoneNo: memoryCache.get('currentCustomPatient').PHONE,
            pwdType: 'password',
            password: '',
            address:''
        };
        //是否显示地址输入框
        $scope.needAddress = AppointmentCreateCardService.needAddress;
        $scope.placeholderAddress = "XX市XX区XX街道XX小区XX号";
        //是否显示密码输入框
        $scope.needPassword = AppointmentCreateCardService.needPassword;
        //默认不显示密码
        $scope.isActive = false;
        $scope.placeholderNumber= KyeeI18nService.get("create_card_info.placeholderNumberNew","请输入6位数字");
        //点击显示密码或不显示密码
        $scope.iconClick = function () {
            //切换为显示或不显示状态
            $scope.isActive = !$scope.isActive;
            if ($scope.isActive) {
                //如果为显示密码状态
                $scope.patientInfo.pwdType = 'text';
            } else {
                //如果为不显示密码状态
                $scope.patientInfo.pwdType = 'password';
            }
        };
        //确认提交信息
        $scope.submit = function () {
            //校验地址
            if($scope.needAddress == '1'){
                if($scope.patientInfo.address == ''){
                    KyeeMessageService.broadcast({
                        content: "请输入地址"
                    });
                    return;
                } else if($scope.patientInfo.address.length < 8){
                    KyeeMessageService.broadcast({
                        content: "输入的地址太短！"
                    });
                    return;
                } else if($scope.patientInfo.address.length > 100){
                    KyeeMessageService.broadcast({
                        content: "输入的地址太长！"
                    });
                    return;
                } else if(/^[0-9]+$/.test($scope.patientInfo.address)){
                    KyeeMessageService.broadcast({
                        content: "地址不能全为数字！"
                    });
                    return;
                } else if(/^[A-Za-z]+$/.test($scope.patientInfo.address)){
                    KyeeMessageService.broadcast({
                        content: "地址不能全为字母！"
                    });
                    return;
                }
            }
            if($scope.needPassword) {
                if ($scope.patientInfo.password == '') {
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("create_card_info.inputPwd", "请输入密码")
                    });
                    return;
                } else if ($scope.patientInfo.password.length > 6) {
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("create_card_info.PwdLengthNot", "请输入6位数字！")
                    });
                    return;
                } else if ($scope.patientInfo.password.length < 6) {
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("create_card_info.PwdLengthNot", "请输入6位数字！")
                    });
                    return;
                }
            }
            //校验金额格式
            var reg = new RegExp('^[0-9]*$');
            if (!reg.test($scope.patientInfo.password)) {
                KyeeMessageService.broadcast({
                    content:  KyeeI18nService.get("create_card_info.rightPwd","请输入正确的密码！")
                });
                return;
            }
            //提交信息
            AppointmentCreateCardService.password = RsaUtilService.getRsaResult($scope.patientInfo.password);
            AppointmentCreateCardService.enterInfo = true;
            AppointmentCreateCardService.address = $scope.patientInfo.address;
            AppointmentCreateCardService.needAddress = 0;
            $ionicHistory.goBack();
        };
        //监听
        KyeeListenerRegister.regist({
            focus: "create_card_info",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.AFTER_ENTER,
            direction: "both",
            action: function (params) {
                if(window.device){
                    var inputTop = 0;
                    if($scope.needAddress != '1' && !$scope.needPassword){
                        inputTop = angular.element(document.getElementById("phoneInput"))[0].offsetTop;
                    }
                    if($scope.needAddress == '1'){
                        inputTop = angular.element(document.getElementById("addressInput"))[0].offsetTop;
                    }
                    if($scope.needPassword){
                        inputTop = angular.element(document.getElementById("passInput"))[0].offsetTop;
                    }
                    // 监听键盘弹出，隐藏
                    window.addEventListener('native.keyboardshow', keyboardShowHandlerGC);
                }
                keyboardShowHandlerGC();
            }
        });
        var keyboardShowHandlerGC = function (e) {
            var inputTop = 0;
            if($scope.needAddress != '1' && !$scope.needPassword){
                inputTop = angular.element(document.getElementById("phoneInput"))[0].offsetTop;
            }
            if($scope.needAddress == '1'){
                inputTop = angular.element(document.getElementById("addressInput"))[0].offsetTop;
            }
            if($scope.needPassword){
                inputTop = angular.element(document.getElementById("passInput"))[0].offsetTop;
            }
            if(document.documentElement.clientHeight-inputTop-44-40-50-64<=0){
                $ionicScrollDelegate.$getByHandle().resize();
                $ionicScrollDelegate.$getByHandle().scrollBottom(true);
            }
        };
        KyeeListenerRegister.regist({
            focus: "create_card_info",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.LEAVE,
            direction: "both",
            action: function (params) {
                if(window.device) {
                    // 注销键盘监听
                    window.removeEventListener('native.keyboardshow', keyboardShowHandlerGC);
                }
            }
        });
    })
    .build();
