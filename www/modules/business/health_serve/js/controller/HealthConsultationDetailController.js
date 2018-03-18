
/*
 * 产品名称：健康服务
 * 创建人: 王婉
 * 创建日期:2017年6月7日11:28:01
 * 创建原因：APP一期优化
 */
new KyeeModule()
    .group("kyee.quyiyuan.health.consultation.detail.controller")
    .require([
        "kyee.quyiyuan.health.serve.service"
    ])
    .type("controller")
    .name("HealthConsultationDetailController")
    .params(["$scope", "$state","KyeeListenerRegister","CacheServiceBus","HomeService",
        "KyeeMessageService","$sce","OperationMonitor","$ionicLoading","$ionicHistory","HealthService"])
    .action(function ($scope, $state,KyeeListenerRegister,CacheServiceBus,HomeService,
                      KyeeMessageService,$sce,OperationMonitor,$ionicLoading,$ionicHistory,HealthService) {

        //显示loading圈
        var loading = function(){
            KyeeMessageService.loading({
                content: undefined,
                duration: 30000,
                mask: false
            });
        };

        loading();//进入页面显示

        var url = HealthService.HEALTH_URL+"appHealthInfo/detail-"+HealthService.HEALTH_DETAIL_CODE;
        $scope.openUrl = $sce.trustAsResourceUrl(url);

        $scope.goBack = function() {
            $ionicHistory.goBack();
        };

        KyeeListenerRegister.regist({
            focus: "health_consultation_detail",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function(params){
                params.stopAction();
                $scope.goBack()

            }
        });

        //隐藏loading圈
        window.hideLoadHealthDetail = function(){
            $ionicLoading.hide();
        };
    })
    .build();


