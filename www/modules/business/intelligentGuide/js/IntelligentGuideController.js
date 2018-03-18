new KyeeModule()
    .group("kyee.quyiyuan.interaction.IntelligentGuide.controller")
    .require([
        "kyee.quyiyuan.home.homeWeb.controller",
        "kyee.quyiyuan.home.service"
    ])
    .type("controller")
    .name("IntelligentGuideController")
    .params(["$scope", "$state","HomeService","KyeeListenerRegister","CacheServiceBus"])
    .action(function($scope,$state,HomeService,KyeeListenerRegister,CacheServiceBus){

        $scope.goOnlineQuery = function(){
            $scope.state = 1;
            HomeService.withTheDiagnosis = 4;
            $state.go('homeWeb');
        };
        $scope.selfCheck = function(){
            $scope.state = 2;
            $state.go("triageMain");
        };
        KyeeListenerRegister.regist({
            focus: "smartGuide",
            direction: "both",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            action: function (params) {
                HomeService.getNetParams();
                $scope.state = 0;
            }
        });

    })
    .build();
