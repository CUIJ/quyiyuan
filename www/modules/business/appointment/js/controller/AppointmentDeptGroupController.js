/**
 * 产品名称：quyiyuan
 * 创建者：刘健
 * 创建时间： 2015/5/16
 * 创建原因：科室分级控制器
 * 修改者：
 * 修改原因：
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.appointment.controller")
    .require([
        "kyee.framework.service.view",
        "kyee.quyiyuan.appointment.service",
        "kyee.quyiyuan.appointment.appointment_doctor.controller",
        "kyee.quyiyuan.patients_group.recommend_group.controller"
    ])
    .type("controller")
    .name("AppointmentDeptGroupController")
    .params(["$scope", "$state", "KyeeViewService", "AppointmentDeptGroupService",
    "CacheServiceBus","KyeeListenerRegister","HospitalFilterDef","HospitalSelectorService","KyeeI18nService","$ionicScrollDelegate","HomeService",'HospitalService',"MyCareDoctorsService","$ionicHistory","GroupListService","KyeeMessageService"])
    .action(function ($scope, $state, KyeeViewService, AppointmentDeptGroupService,
    CacheServiceBus,KyeeListenerRegister,HospitalFilterDef,HospitalSelectorService,KyeeI18nService,$ionicScrollDelegate,HomeService,HospitalService,MyCareDoctorsService,$ionicHistory,GroupListService,KyeeMessageService) {
        //绑定搜索组件
        $scope.bind = function(params){
            $scope.searchdept = params.search;
        };
        //字母内科室排序
        $scope.comparator=function(params){
            return params.previous.deptData.DISPLAY_ORDER-params.next.deptData.DISPLAY_ORDER;
        };

        //初始化默认张开第一个大科室
        $scope.dksIndex = 0;
        //初始化页面显示为空；
        $scope.empty=0;
        //缓存数据
        var storageCache= CacheServiceBus.getStorageCache();
        //页面添加监听事件
        KyeeListenerRegister.regist({
            focus: "appointment",
            direction: "both",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            action: function (params) {
                $scope.IS_REFERRAL =AppointmentDeptGroupService.IS_REFERRAL;

                //获取缓存中医院信息
                var hospitalinfo = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                //医院名称
                $scope.hospitalName=hospitalinfo.name;
                //搜索框底部数据
                $scope.placeholderDept= KyeeI18nService.get("appointment.placeholderDept","搜索科室关键词");
                //获取科室
                //科室是否分级由后台查询参数控制   APPCOMMERCIALBUG-2707
                AppointmentDeptGroupService.queryDept(hospitalinfo.id, function (resultData,isGroupDept,deptReasonTips) {
                    //获取不分级科室
                    $scope.isGroupDept=isGroupDept;
                    $scope.DEPT_REASON_TIPS = deptReasonTips;
                    if(parseInt($scope.isGroupDept)==0){
                        //暂无数据
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

                })
            }
        });
        //begin 选择医生排班时如果C端首页没有选择科室，则跳转到科室页面 By 高玉楼 APPCOMMERCIALBUG-1364
        //离开科室选择页面是清除科室选择后的跳转设置
        KyeeListenerRegister.regist({
            focus: "appointment",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.AFTER_LEAVE,
            action: function (params) {
                HospitalSelectorService.returnView = undefined;
                AppointmentDeptGroupService.TO_ROUTER_STATE = undefined;
                //返回选择医院列表时，标记此次业务是预约挂号  BY  章剑飞  KYEEAPPTEST-3189
                if(params.to == 'hospital_selector'){
                    HomeService.isFromAppoint = true;
                }
            }
        });
        KyeeListenerRegister.regist({
            focus: "appointment_regist_list",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.back();
            }
        });
        $scope.back = function () {
            if($scope.IS_REFERRAL==2&&AppointmentDeptGroupService.HOSPITAL_ID_HISTORY){
                MyCareDoctorsService.queryHospitalInfo(AppointmentDeptGroupService.HOSPITAL_ID_HISTORY, function(result){
                    // 切换医院
                    HospitalSelectorService.selectHospital(AppointmentDeptGroupService.HOSPITAL_ID_HISTORY, result.HOSPITAL_NAME,
                        result.MAILING_ADDRESS, result.PROVINCE_CODE, result.PROVINCE_NAME,
                        result.CITY_CODE, result.CITY_NAME, "医院正在切换中...", function () {
                        });
                });
                setTimeout(function () {
                    $ionicHistory.goBack(-1);
                }, 500);
            }else{
                $ionicHistory.goBack(-1);
            }
        };
        //end By 高玉楼 APPCOMMERCIALBUG-1364
        //点击大科室时
        $scope.showdept=function(dksindex){
            $scope.dksIndex=dksindex;
            $scope.deptData =  $scope.groupDept[dksindex].children;
        };
        //点击小科室时，跳转到医生界面或病友圈推荐群组页面
        $scope.selectSecondDept=function(dept){
            if(HospitalSelectorService.isFindGroupByHospital){ //edited by zhangyi at 20161121 for KYEEAPPC-8731 : 整合isFromPatientsGroup和goToPatientsGroup控制变量到isFindGroupByHospital中

                // 根据医院科室推荐群组
                var deptCode = dept.DEPT_CODE;
                var hospitalInfo = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                GroupListService.recommendGroupsParams = {
                    "provinceCode": hospitalInfo.provinceCode,
                    "hospitalId": hospitalInfo.id,
                    "deptCode": deptCode
                };
                $state.go("recommend_group");
            }else{
                fowardPage(dept);
            }
        };

        //点击某一科室后跳转到排班界面或病友圈推荐群组页面
        $scope.selectDept=function(params){
            if(HospitalSelectorService.isFindGroupByHospital){ //edited by zhangyi at 20161121 for KYEEAPPC-8731 : 整合isFromPatientsGroup和goToPatientsGroup控制变量到isFindGroupByHospital中

                // 根据医院科室推荐群组
                var deptCode = params.item.deptData.DEPT_CODE;
                var hospitalInfo = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                GroupListService.recommendGroupsParams = {
                    "provinceCode": hospitalInfo.provinceCode,
                    "hospitalId": hospitalInfo.id,
                    "deptCode": deptCode
                };
                $state.go("recommend_group");

            }else{
                fowardPage(params.item.deptData);
            }
        };

        function fowardPage(dept)
        {
            var isFromFiler = false;
            HospitalFilterDef.doFinashIfNeed({
                onBefore : function(){
                    isFromFiler = true;
                }
            });
            $scope.WARN_MSG = '';
            if($scope.DEPT_REASON_TIPS!=undefined&&$scope.DEPT_REASON_TIPS!=''&&$scope.DEPT_REASON_TIPS!=null){
                for (var i = 0; i < $scope.DEPT_REASON_TIPS.length; i++){
                    if(dept.DEPT_CODE== $scope.DEPT_REASON_TIPS[i].DEPT_CODE){
                        $scope.WARN_MSG=$scope.DEPT_REASON_TIPS[i].RELEASE_MSG;
                        //$scope.SUGGESTION_MSG = "是否继续？";
                        break;
                    }

                }
            }
            if($scope.WARN_MSG!='' && $scope.WARN_MSG!=undefined && $scope.WARN_MSG!=null){
                $scope.dialog = KyeeMessageService.dialog({
                    tapBgToClose : true,
                    template: "modules/business/appointment/views/delay_views/warmPrompt.html",
                    scope: $scope,
                    title: KyeeI18nService.get("appointment.messageTitle", "提示"),
                    buttons: [
                        {
                            text: KyeeI18nService.get("appointment.ok", "知道了"),
                            style: 'button-size-l',
                            click: function () {
                                $scope.dialog.close();
                                //之前首页如果没有科室，则选择选择科室后会跳回首页，现在首页没有科室，则不需要判断，直接选择可事后跳到排班
                                dept.IS_REFERRAL =AppointmentDeptGroupService.IS_REFERRAL ;//科室分级在科室信息中传递
                                AppointmentDeptGroupService.SELECT_DEPTGROUPDATA =dept;
                                //将点击的某一科室对象放入科室服务中
                                storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.DEPT_INFO,dept);
                                $state.go("appointment_doctor");
                            }
                        }
                    ]
                });
            } else{
                //之前首页如果没有科室，则选择选择科室后会跳回首页，现在首页没有科室，则不需要判断，直接选择可事后跳到排班
                //
                dept.IS_REFERRAL =AppointmentDeptGroupService.IS_REFERRAL ;//科室分级在科室信息中传递
                AppointmentDeptGroupService.SELECT_DEPTGROUPDATA =dept;
                //将点击的某一科室对象放入科室服务中
                storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.DEPT_INFO,dept);
                $state.go("appointment_doctor");
            }
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

        //by gaomeng 选择科室新增切换医院功能
        //切换医院，进入该市下所有医院列表
        $scope.hospitalWidth = window.innerWidth - 195 + 'px';
        $scope.selectHospital = function () {
            if($scope.IS_REFERRAL==2){
                return;//转诊，禁止切换医院
            }
            if (HospitalService.isHospitalSelecterBtnDisabled) {
                return;//禁用选择医院
            }
            $state.go("hospital_selector");
        };
        //是否可选医院
        $scope.canBeSelect = !HospitalService.isHospitalSelecterBtnDisabled;
        //add by zhangyi at 20161118 for KYEEAPPC-8731 : 添加群组的时候隐藏侧边栏和症状自查功能
        $scope.displayRightMenu = !HospitalSelectorService.isFindGroupByHospital;
    })
    .build();
