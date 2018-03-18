/**
 * 产品名称 quyiyuan.
 */
new KyeeModule()
    .group("kyee.quyiyuan.supportHospital.controller")
    .require(["kyee.quyiyuan.healthCard.service"])
    .type("controller")
    .name("SupportHospitalController")
    .params(["$scope","$ionicHistory","CacheServiceBus","KyeeI18nService","KyeeListenerRegister","HealthCardService","KyeeMessageService"])
    .action(function($scope,$ionicHistory,CacheServiceBus,KyeeI18nService,KyeeListenerRegister,HealthCardService,KyeeMessageService){

        if(HealthCardService.supportHosList){
            $scope.supportHosList =  HealthCardService.supportHosList;
        }
        if(HealthCardService.tip){
            $scope.tip = HealthCardService.tip;
        }

        KyeeListenerRegister.regist({
            focus: "supportHospital",
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