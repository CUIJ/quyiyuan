/**
 * 产品名称：quyiyuan
 * 创建者：wangwan
 * 创建时间： 2015/5/16
 * 创建原因：科室分级控制器
 * 修改者：
 * 修改原因：
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.appointment.find_doctor_dept_info.controller")
    .require([
        "kyee.framework.service.view",
        "kyee.quyiyuan.appointment.service",
        "kyee.quyiyuan.appointment.appointment_doctor.controller",
        "kyee.quyiyuan.appointment.find_doctor_list.controller"
    ])
    .type("controller")
    .name("FindDoctorDeptInfoController")
    .params(["$scope", "$state", "KyeeViewService", "AppointmentDeptGroupService", "CacheServiceBus",
        "KyeeListenerRegister","HospitalFilterDef","HospitalSelectorService","KyeeI18nService",
        "$ionicScrollDelegate","HomeService","AppointmentDoctorService"])
    .action(function ($scope, $state, KyeeViewService, AppointmentDeptGroupService, CacheServiceBus,
                      KyeeListenerRegister,HospitalFilterDef,HospitalSelectorService,KyeeI18nService,
                      $ionicScrollDelegate,HomeService,AppointmentDoctorService) {
        //绑定搜索组件
        $scope.bind = function(params){
            $scope.searchdept = params.search;
        };
        //字母内科室排序
        $scope.comparator=function(params){
            return params.previous.deptData.DISPLAY_ORDER-params.next.deptData.DISPLAY_ORDER
        };
        $scope.isGroupDept = '1';
        //初始化默认张开第一个大科室
        $scope.dksIndex = 0;
        //初始化页面显示为空；
        $scope.empty=0;
        //缓存数据
        var storageCache= CacheServiceBus.getStorageCache();
        //页面添加监听事件
        KyeeListenerRegister.regist({
            focus: "find_doctor_dept_info",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            action: function (params) {
                $scope.dksIndex = 0;
                $scope.empty=0;
                $scope.smallIndex = null;//默认选中第1个二级科室
               //搜索框底部数据
                $scope.placeholderDept= KyeeI18nService.get("appointment.placeholderDept","搜索科室关键词");
                AppointmentDeptGroupService.queryGroupDeptByCity(function (resultData) {
                    //暂无数据
                    if(resultData.length<=0|| resultData==undefined || resultData==null){
                        $scope.empty=1;
                    }else{
                        $scope.empty=3;
                    }
                    if(resultData.length)
                    {
                        $scope.groupDept = resultData;
                        $scope.deptData =  resultData[$scope.dksIndex].JUNIOR_DEPT_LIST;
                    }
                    else
                    {
                        $scope.groupDept = [];
                        $scope.deptData =  [];
                    }
                });
            }
        });
        //begin 选择医生排班时如果C端首页没有选择科室，则跳转到科室页面 By 高玉楼 APPCOMMERCIALBUG-1364
        //离开科室选择页面是清除科室选择后的跳转设置
        KyeeListenerRegister.regist({
            focus: "find_doctor_dept_info",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.AFTER_LEAVE,
            action: function (params) {
                HospitalSelectorService.returnView = undefined;
                AppointmentDeptGroupService.TO_ROUTER_STATE = undefined;
                //返回选择医院列表时，标记此次业务是预约挂号  BY  章剑飞  KYEEAPPTEST-3189
                /*if(params.to == 'hospital_selector'){
                    HomeService.isFromAppoint = true;//??????
                }*/
            }
        });
        //end By 高玉楼 APPCOMMERCIALBUG-1364
        //点击大科室时
        $scope.showSmallDept=function(dksindex){
            $scope.smallIndex = null;
            $scope.dksIndex=dksindex;
            $scope.deptData =  $scope.groupDept[dksindex].JUNIOR_DEPT_LIST;
        };
        //点击小科室时，跳转到医生界面
        $scope.selectSmallSecondDept=function(index,dept){
            $scope.smallIndex = index;
            fowardPage(dept);
        };
        function fowardPage(dept)
        {
            var isFromFiler = false;
            HospitalFilterDef.doFinashIfNeed({
                onBefore : function(){
                    isFromFiler = true;
                }
            });
            AppointmentDoctorService.JUNIORDEPT_DEPT =dept;
            //将点击的某一科室对象放入科室服务中
            //storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.DEPT_INFO,dept);//??????????放缓存吗？
            $state.go("find_doctor_list");

        };

        //搜索科室的keyup事件
        $scope.searchDept = function (keyWords) {
            $scope.searchdept(keyWords);
            $ionicScrollDelegate.resize();
            // $ionicScrollDelegate.$getByHandle("dept_list").scrollTop();
        };
        //点击自我诊断-跳转到智能导诊页面
        $scope.goTriage = function () {
            $state.go("triageMain");
        };
    })
    .build();