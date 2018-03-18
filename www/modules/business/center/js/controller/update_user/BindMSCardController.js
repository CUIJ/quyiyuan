/**
 * 产品名称 KYMH
 * 创建用户: 章剑飞
 * 创建时间: 2015年5月28日19:23:48
 * 创建原因：绑定医保卡控制器
 */
new KyeeModule()
    .group("kyee.quyiyuan.center.bindMSCard.controller")
    .require(["kyee.quyiyuan.center.service",
        "kyee.framework.service.message",
        "kyee.quyiyuan.center.bindMSCard.service",
        "kyee.quyiyuan.center.updateuser.service",
        "kyee.quyiyuan.center.comm_patient_detail.service"])
    .type("controller")
    .name("BindMSCardController")
    .params(["$scope", "$ionicHistory", "KyeeMessageService", "KyeeViewService", "BindMSCardService", "CommPatientDetailService", "CacheServiceBus", "$interval", "KyeeI18nService"])
    .action(function ($scope, $ionicHistory, KyeeMessageService, KyeeViewService, BindMSCardService, CommPatientDetailService, CacheServiceBus, $interval,KyeeI18nService) {
        //初始化用户信息
        $scope.userInfo = {
            name: "",
            insuranceCardNum: "",
            insuranceCardPassword: "",
            validationNum: ""
        };
        $scope.userInfo.name = BindMSCardService.bindModel.OFTEN_NAME;
        // 获取当前医院信息
        var storageCache = CacheServiceBus.getStorageCache();
        var hospitalInfo = storageCache.get("hospitalInfo");
        var second = 0;
        var task = undefined;
        $scope.innerText =  KyeeI18nService.get('bindMSCard.getCheckCode','获取验证码');
        // 发送验证码
        $scope.getValidateNum = function () {
            if ($scope.userInfo.insuranceCardNum == undefined||$scope.userInfo.insuranceCardNum == '') {
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get('bindMSCard.writeCardNum','请输入医保卡号！')
                });
                return;
            }
            BindMSCardService.getValidateNum(function () {
                second = 120;
                // 使此按钮失效
                $scope.mdBtnDisabled = true;
                this.setBtnState();
                // 开启定时任务
                task = $interval(this.setBtnState, 1000);
            }, hospitalInfo.id, $scope.userInfo.insuranceCardNum);

            setBtnState = function (validateMsgBtn) {
                try {
                    if (second > 0) {
                        $scope.innerText = KyeeI18nService.get('regist.Surplus','剩余') + second + KyeeI18nService.get('bindMSCard.seconds','秒');
                        second--;
                    } else {
                        $scope.mdBtnDisabled = false;
                        $scope.innerText = KyeeI18nService.get('bindMSCard.getCheckCode','获取验证码');
                        clearInterval(task);
                    }
                } catch (e) {
                    validateMsgBtn.mdBtnDisabled = false;
                    clearInterval(task);
                }
            }
        };

        // 绑定医保卡按钮点击事件
        $scope.doBindInsuranceCard = function () {
            if ($scope.userInfo.insuranceCardNum == undefined||$scope.userInfo.insuranceCardNum == '') {
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get('bindMSCard.writeCardNum','请输入医保卡号！')
                });
                return;
            }
            if ($scope.userInfo.insuranceCardPassword == undefined||$scope.userInfo.insuranceCardPassword == '') {
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get('bindMSCard.writePassword','请输入密码！')
                });
                return;
            }
            if ($scope.userInfo.validationNum == undefined||$scope.userInfo.validationNum == '') {
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get('bindMSCard.writCheckCode','请输入验证码！')
                });
                return;
            }
            BindMSCardService.doBindInsuranceCard(function(){
                $ionicHistory.goBack(-2);
            },$scope.userInfo, hospitalInfo.id, $scope);
        };
    })
    .build();