/**
 * 产品名称：quyiyuan
 * 创建者：刘健
 * 创建时间： 2015/5/5
 * 创建原因：医生排班中科室选择控制器
 */
new KyeeModule()
    .group("kyee.quyiyuan.scheduleDept.controller")
    .require(["kyee.framework.service.view",
        "kyee.quyiyuan.scheduleDept.service",
        "kyee.quyiyuan.scheduleByDoctor.controller"])
    .type("controller")
    .name("ScheduleDeptController")
    .params(["$scope", "$rootScope", "$state", "KyeeViewService","ScheduleDeptService",'CacheServiceBus',"KyeeI18nService","KyeeListenerRegister","MultipleQueryCityService","$ionicScrollDelegate"])
    .action(function($scope, $rootScope, $state,KyeeViewService,ScheduleDeptService,CacheServiceBus,KyeeI18nService,KyeeListenerRegister,MultipleQueryCityService,$ionicScrollDelegate){
        //绑定搜索组件
        $scope.bind = function(params){
            $scope.searchdept = params.search;
        };
        $scope.branch_version = AppConfig.BRANCH_VERSION;
        //字母内科室排序
        $scope.comparator=function(params){
            return params.previous.deptData.DISPLAY_ORDER-params.next.deptData.DISPLAY_ORDER
        };
        //初始化默认张开第一个大科室
        $scope.dksIndex = 0;
        //初始化页面显示为空；
        $scope.empty=0;
        //缓存数据
        var storageCache= CacheServiceBus.getStorageCache();
        //是否可选医院
        $scope.canBeSelect = ($rootScope.ROLE_CODE!="5");
        //页面添加监听事件
        KyeeListenerRegister.regist({
            focus: "schedule",
            direction: "both",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            action: function (params) {
                //获取缓存中医院信息
                var hospitalinfo = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                //医院名称
                $scope.hospitalName=hospitalinfo.name;
                //搜索框底部数据
                $scope.placeholderDept= KyeeI18nService.get("appointment.placeholderDept","搜索科室关键词");
                //头部标题
                $scope.titleName=KyeeI18nService.get("appointment.titleName","医生排班");
                //科室是否分级由后台查询参数控制   APPCOMMERCIALBUG-2707
                ScheduleDeptService.queryDept(hospitalinfo.id, function (resultData,isGroupDept) {
                    //暂无数据
                    $scope.isGroupDept=isGroupDept;
                    if(parseInt($scope.isGroupDept)==0){
                        //获取不分级科室
                        if(resultData.length<=0|| resultData==undefined || resultData==null){
                            $scope.empty=1;
                        }else{
                            $scope.empty=2;
                        }
                        $scope.data=resultData;
                    }else{
                        //获取分级科室
                        if(resultData.length<=0|| resultData==undefined || resultData==null){
                            $scope.empty=1;
                        }else{
                            $scope.empty=2;
                        }
                        if(resultData.length)
                        {
                            $scope.groupDept = resultData;
                            $scope.deptData =  resultData[$scope.dksIndex].children;
                        }
                        else
                        {
                            $scope.groupDept = [];
                            $scope.deptData =  [];
                        }
                    }

                });
            }
        });
        //点击大科室时
        $scope.showdept=function(dksindex){
            $scope.dksIndex=dksindex;
            $scope.deptData =  $scope.groupDept[dksindex].children;
        };
        //点击小科室时，跳转到医生界面
        $scope.selectSecondDept=function(dept){
            ScheduleDeptService.deptData=dept;
            $state.go("schedule_bydoctor");
        };

        //点击某一科室后跳转到排班界面
        $scope.selectDept=function(params){
            ScheduleDeptService.deptData=params.item.deptData;
            $state.go("schedule_bydoctor");
        };
        //搜索科室的keyup事件
        $scope.searchDept = function (keyWords) {
            $scope.searchdept(keyWords);
            $ionicScrollDelegate.resize();
           // $ionicScrollDelegate.$getByHandle("scheduldept_list").scrollTop();
        };
        //点击自我诊断-跳转到智能导诊页面
        $scope.goTriage = function () {
            $state.go("triageMain");
        };

        //点击切换医院
        $scope.changeHospital = function () {

            //如果没选城市，则先选择城市，否则选择医院
            var storageCache = CacheServiceBus.getStorageCache();
            var selected = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.LAST_PROVINCE_CITY_INFO);
            if(selected){
                this.isFromAppoint = true;
                $state.go("hospital_selector");
            } else {
                MultipleQueryCityService.goState = "schedule";
                $state.go('multiple_city_list');
            }
        };
    })
    .build();
