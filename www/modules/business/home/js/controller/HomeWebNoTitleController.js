
new KyeeModule()
    .group("kyee.quyiyuan.home.homeWebNoTitleController.controller")
    .require(["kyee.quyiyuan.home.service"])
    .type("controller")
    .name("homeWebNoTitleController")
    .params(["$ionicLoading","CenterService","$ionicHistory","KyeeMessageService","$scope","HomeService","$sce","CacheServiceBus","Md5UtilService"])
    .action(function($ionicLoading,CenterService,$ionicHistory,KyeeMessageService,$scope,HomeService,$sce,CacheServiceBus,Md5UtilService){

        //显示loading圈
        var loading = function(){
            KyeeMessageService.loading({
                content: undefined,
                duration: 30000,
                mask: false
            });
        };
        loading();//进入页面显示

        $scope.openUrl =  $sce.trustAsResourceUrl(HomeService.queryWebConfig.openUrl);

        //隐藏loading圈
        window.hideLoadByHomeWebNoTitle = function(){
            $ionicLoading.hide();
        };
    })
    .build();