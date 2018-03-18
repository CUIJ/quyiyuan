/**
 * 产品名称：quyiyuan
 * 创建者：wangyaning
 * 创建时间： 2016/11/29
 * 创建原因：病友圈同科室医生列表控制器
 */
new KyeeModule()
    .group("kyee.quyiyuan.patients_group.dept_doctor_list.controller")
    .require([
        "kyee.quyiyuan.patients_group.dept_doctor_list.service",
        "kyee.quyiyuan.patients_group.my_doctor_details.controller"
    ])
    .type("controller")
    .name("DeptDoctorListController")
    .params([
        "$scope",
        "$state",
        "KyeeListenerRegister",
        "CacheServiceBus",
        "KyeeI18nService",
        "DeptDoctorListService",
        "MyDoctorDetailsService"
    ])
    .action(function($scope,$state,KyeeListenerRegister,CacheServiceBus,KyeeI18nService,
                     DeptDoctorListService,MyDoctorDetailsService){

        KyeeListenerRegister.regist({
            focus: "dept_doctor_list",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function(){
                initDoctorList();
            }
        });

        /**
         * 初始化科室医生列表数据，科室信息为从appointment传入信息
         * add by wyn 20161130
         */
        var initDoctorList = function(){
            DeptDoctorListService.getDeptDoctorList(function(data){
                $scope.deptName = data.deptName;
                $scope.doctorList = data.data;
            });
        };

        /**
         * 跳转至医生详情界面
         * add by wyn 20161129
         * @param doctor
         */
        $scope.goDoctorDetails = function(doctor){
            MyDoctorDetailsService.doctorInfo = doctor;
            $state.go("my_doctor_details");
        };
    })
    .build();
