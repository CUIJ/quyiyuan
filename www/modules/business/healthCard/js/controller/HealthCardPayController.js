/**
 * 产品名称 quyiyuan.
 */
new KyeeModule()
    .group("kyee.quyiyuan.healthCardPay.controller")
    .require(["kyee.quyiyuan.healthCard.service",
            "kyee.quyiyuan.payOrder.controller",
            "kyee.quyiyuan.patient_card_records.controller"])
    .type("controller")
    .name("HealthCardPayController")
    .params(["$scope","$state","$ionicHistory","CacheServiceBus","KyeeI18nService","KyeeListenerRegister","HealthCardService","KyeeMessageService","PayOrderService","PatientCardRecordsService"])
    .action(function($scope,$state,$ionicHistory,CacheServiceBus,KyeeI18nService,KyeeListenerRegister,HealthCardService,KyeeMessageService,PayOrderService,PatientCardRecordsService){
        $scope.placeholder = {
            text:"请输入充值金额"
        };

        $scope.healthCardMoney = {
            money:""
        };
        $scope.isClick = false;
        if(HealthCardService.healthCardItem){
            $scope.healthCardItem =  HealthCardService.healthCardItem;
        }

        $scope.postData = {};

        $scope.inputMoney= function () {
            if(!$scope.healthCardMoney.money || $scope.healthCardMoney.money==""){
                $scope.isClick = false;
                return;
            }else{
                //校验金额格式
                var reg = new RegExp('^[0-9]+(.[0-9]+)?$');
                if (!reg.test($scope.healthCardMoney.money)) {
                    $scope.isClick = false;
                    KyeeMessageService.broadcast({
                        content: "请输入正确的金额！"
                    });
                    return;
                }else{
                    if($scope.healthCardMoney.money&&$scope.healthCardMoney.money >= 0.01){
                        $scope.isClick = true;
                    }else{
                        $scope.isClick = false;
                        KyeeMessageService.broadcast({
                            content: "请输入正确的金额！"
                        });
                        return
                    }
                }
            }
        };
        //点击下一步
        $scope.doSubmit = function () {
            if($scope.isClick){
                //校验金额格式
                var reg = new RegExp('^[0-9]+(.[0-9]+)?$');
                if (!reg.test($scope.healthCardMoney.money)) {
                    KyeeMessageService.broadcast({
                        content: "请输入正确的金额！"
                    });
                    return;
                }
                HealthCardService.healthCardPatientRecharge($scope.healthCardItem.AREA_CODE,$scope.healthCardItem.patientName,$scope.healthCardItem.phoneNumber,$scope.healthCardItem.idCardNo,$scope.healthCardMoney.money,$scope.healthCardItem.cardNo,$scope.healthCardItem.cardType,function (data,success) {
                    if(success){
                        if(data&&data.data){
                            var TRADE_NO = data.data;
                            var payData = {
                                'MARK_DESC': "健康卡充值",
                                'MARK_DETAIL':  "健康卡充值",
                                'AMOUNT': parseFloat($scope.healthCardMoney.money).toFixed(2),
                                'TRADE_NO': TRADE_NO,
                                'CARD_NO':$scope.healthCardItem.cardNo,
                                'CARD_TYPE':$scope.healthCardItem.cardType,
                                'PATIENT_RECHARGE': true,
                                "KYEE_HOSPITAL":100000,
                                "hospitalID":100000,
                                "ROUTER":"healthCardPay"
                            };
                            PayOrderService.payData = payData;
                            $state.go('payOrder');
                        }
                    }else{
                        if(data.message){
                            KyeeMessageService.broadcast({
                                content: data.message
                            });
                        }else{
                            KyeeMessageService.broadcast({
                                content: "网络异常，请稍后重试"
                            });
                        }
                    }
                })
            }
        };
        $scope.goToPatientRechargeRecords = function () {
            PatientCardRecordsService.isHealthCard = 1;
            HealthCardService.healthCardPayToRecords = true;
            $state.go("patient_card_records");
        };

        KyeeListenerRegister.regist({
            focus: "healthCardPay",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (params) {
                $scope.healthCardMoney.money = "";
            }
        });

        KyeeListenerRegister.regist({
            focus: "healthCardPay",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                $scope.goBack();
            }
        });
        $scope.goBack = function () {
            $ionicHistory.goBack();
        };
    })
    .build();