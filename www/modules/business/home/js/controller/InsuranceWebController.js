
new KyeeModule()
    .group("kyee.quyiyuan.home.insurance_web.controller")
    .require(["kyee.quyiyuan.home.service"])
    .type("controller")
    .name("InsuranceWebController")
    .params(["$ionicLoading","CenterService","$ionicHistory","KyeeMessageService","$scope","HomeService","$sce","KyeeListenerRegister","$ionicHistory"])
    .action(function($ionicLoading,CenterService,$ionicHistory,KyeeMessageService,$scope,HomeService,$sce,KyeeListenerRegister,$ionicHistory){

        //显示loading圈
        var loading = function(){
            KyeeMessageService.loading({
                content: undefined,
                duration: 30000,
                mask: false
            });
        };
        loading();//进入页面显示

        KyeeListenerRegister.regist({
            focus: "insuranceWeb",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function(){
                if(HomeService.insuranceWeb && HomeService.insuranceWeb.url){
                    $scope.openUrl = $sce.trustAsResourceUrl(HomeService.insuranceWeb.url);
                }
            }
        });

        //隐藏loading圈
        window.hideLoadByInsuranceWeb = function(){
            $ionicLoading.hide();
        };
    })
    .build();