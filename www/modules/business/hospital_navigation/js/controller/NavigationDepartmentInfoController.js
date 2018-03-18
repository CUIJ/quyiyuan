/**
 *产品名称：quyiyuan
 *创建者：杜巍巍
 *任务号：KYEEAPPC-3461
 *创建时间：2015/9/6
 *创建原因：平面导航根据科室定位（选择科室）控制器
 *修改者：
 *修改原因：
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.navigationDepartmentInfo.controller")
    .require([
        "kyee.quyiyuan.navigationDepartmentInfo.service",
        "kyee.quyiyuan.hospitalNavigation.service"
    ])
    .type("controller")
    .name("NavigationDepartmentInfoController")
    .params(["$scope", "$state", "KyeeMessageService", "NavigationDepartmentInfoService", "HospitalNavigationService"])
    .action(function ($scope,$state, KyeeMessageService, NavigationDepartmentInfoService,HospitalNavigationService) {
        $scope.departmentInfro=[];
        $scope.hospitalId=NavigationDepartmentInfoService.hospitalId;
        //组件绑定
        $scope.bind = function(params){
            $scope.searchdept = params.search;
        };
        $scope.initView = function () {
            NavigationDepartmentInfoService.queryDepatmentInfro($scope.hospitalId, function (resultData) {
                $scope.departmentInfro = resultData;
            });
        };
        //搜索科室的keyup事件
        $scope.searchDept = function (keyWords) {
            $scope.searchdept(keyWords);
        };
        //点击某一科室后跳转到平面导航定位界面
        $scope.onClick=function(params){
            //将点击的某一科室对象放入科室服务中
            HospitalNavigationService.fixedPositionInfro={
                HOSPITAL_ID:params.item.deptData.HOSPITAL_ID,
                DEPT_NAME:params.item.deptData.DEPT_NAME
            };
            HospitalNavigationService.lastClassName='navigation_departmentInfo'; //KYEEAPPTEST-2710  修改医院定位缓存异常

            $state.go("hospital_navigation");
        };

    })
    .build();