new KyeeModule()
    .group("kyee.quyiyuan.health.nurse.service.controller")
    .require(["kyee.quyiyuan.health.serve.service"])
    .type("controller")
    .name("HealthNurseServiceController")
    .params(["$scope", "$rootScope","$state","KyeeListenerRegister","$stateParams","CacheServiceBus",
        "HomeService","KyeeMessageService","HealthService"])
    .action(function($scope, $rootScope,$state,KyeeListenerRegister,$stateParams,CacheServiceBus,
                     HomeService,KyeeMessageService,HealthService){
        //局部变量
        var userSource = HealthService.nurseServiceNavControl.userSource;
        var withDiagnosis = HealthService.nurseServiceNavControl.withDiagnosis;
        var cusService = HealthService.nurseServiceNavControl.cusService;
        var loginFalg=CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.IS_LOGIN) == true;

        //对象声明
        $scope.navData = {
            "nurseConsult":{
                isShow:cusService,
                handleClick:withTheCusService,
                showText:(userSource=='4001' || userSource=='3')?"健康咨询":"护士咨询"
            },
            "nurseWithDiagnosis":{
                isShow:withDiagnosis,
                handleClick:withTheDiagnosis
            },
            "nurseCome":{
                isShow:userSource!='3',
                handleClick:nurseComeService
            }
        };
        /**
         *点击护士咨询
         */
        function withTheCusService(){
            if(loginFalg){
                HomeService.withTheDiagnosis = 2;
                $state.go('homeWeb');
            }else{
                $state.go("login");
            }
        }

        /**
         * 点击护士陪诊
         */
        function withTheDiagnosis(){
            if(DeploymentConfig.BRANCH_VER_CODE=='54'){//健康马鞍山
                KyeeMessageService.broadcast({
                    content: "此功能暂未开放"
                });
                return;
            }
            if(loginFalg){
                HomeService.withTheDiagnosis = 1;
                $state.go('homeWeb');
            }else{
                $state.go("login");
            }
        }

        /**
         * 护士上门
         */
        function nurseComeService(){
            HomeService.withTheDiagnosis = 6;

            $state.go('homeWeb');
        }
    })
    .build();

