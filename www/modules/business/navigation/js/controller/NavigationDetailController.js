/**
 *产品名称：quyiyuan
 *创建者：赵婷
 *创建时间：2015/5/11
 *创建原因：医院楼宇明细控制器
 *修改者：
 *修改原因：
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.navigationDetail.controller")
    .require(["kyee.quyiyuan.center.service",
        "kyee.framework.service.message",
        "kyee.framework.service.view",
        "kyee.quyiyuan.navigation.service.navigationDetail"])
    .type("controller")
    .name("NavigationDetailController")
    .params(["$scope",
        "$state",
        "KyeeMessageService",
        "KyeeViewService",
        "CacheServiceBus",
        "NavigationDetailService"
    ])
    .action(function ($scope,$state, KyeeMessageService, KyeeViewService,CacheServiceBus,NavigationDetailService) {
        $scope.navigationInfro=[];
        $scope.checkIndex=undefined;
        $scope.initView=function(){
        for(var i=0;i<NavigationDetailService.allNavigationInfro.length;i++){
                if(NavigationDetailService.allNavigationInfro[i].HEALTH_NAVIGATION_ID==NavigationDetailService.navigationID){
                    $scope.navigationInfro.push(
                        {
                            navigation_name:NavigationDetailService.allNavigationInfro[i].HOSPITAL_BUILD_NUMBER,
                            navigation_floor:NavigationDetailService.allNavigationInfro[i].HOSPITAL_FLOOR_NUMBER,
                            navigation_deptName:NavigationDetailService.allNavigationInfro[i].HOSPITAL_FLOOR_DEPT
                        });
                }
            }
        }
        $scope.ischeck=function(index){
            $scope.checkIndex=index;
        }
        $scope.isChangeStyle=function(index){
            return  $scope.checkIndex==index;
        }

    })
    .build();