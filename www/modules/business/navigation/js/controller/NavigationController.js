/**
 *产品名称：quyiyuan
 *创建者：赵婷
 *创建时间：2015/5/11
 *创建原因：医院导航首页控制器
 *修改者：
 *修改原因：
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.navigation.controller")
    .require(["kyee.quyiyuan.center.service",
        "kyee.framework.service.message",
        "kyee.framework.service.view",
        "kyee.quyiyuan.navigationOut.controller",
        "kyee.quyiyuan.navigationMain.controller",
        "kyee.quyiyuan.navigationFloor.controller",
        "kyee.quyiyuan.navigationDetail.controller"])
    .type("controller")
    .name("NavigationController")
    .params(["$scope",
        "$state",
        "KyeeMessageService",
        "KyeeViewService",
        "CacheServiceBus",
        "NavigationOutService",
        "$ionicScrollDelegate",
        "KyeeI18nService"
     ])
    .action(function ($scope,$state, KyeeMessageService,
                      KyeeViewService, CacheServiceBus, NavigationOutService,$ionicScrollDelegate,KyeeI18nService) {

        $scope.hospitalId=undefined;  //定义当前医院ID
        $scope.isHidden=false;
        // 初始化按钮选中样式
        $scope.activityClass = '0';

        $scope.initView=function(){
            $scope.hospitalId = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;
            if($scope.hospitalId==undefined||$scope.hospitalId=="")
            {
                $scope.isHidden=true;
            }

        }
        //加载页面
        $scope.onLoadView=function(index){
            $scope.activityClass = index
            $ionicScrollDelegate.$getByHandle("mainContent").scrollTop();  //初始化滚动条（在切换页面的过程中，将滚动条默认拉到最顶部）
        }

        $scope.openOutNav=function(){
            NavigationOutService.openNavigationOut();
        }

        $scope.selectStatus = function (status) {
            $scope.activityClass = status;
            $scope.doRefresh(true);
        };
        //预警提示
        $scope.warnMessage = function (message) {
            KyeeMessageService.message({
                title: KyeeI18nService.get("navigation.msg","消息"),
                content: message,
                okText: KyeeI18nService.get("navigation.know","知道了")
            });
        }
    })
    .build();