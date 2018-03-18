/**
 * 产品名称：quyiyuan
 * 创建者：wangyaning
 * 创建时间： 2016/11/25
 * 创建原因：病友圈我的医生控制器
 */
new KyeeModule()
    .group("kyee.quyiyuan.patients_group.my_doctor_list.controller")
    .require([
        "kyee.quyiyuan.patients_group.my_doctor_list.service",
        "kyee.quyiyuan.patients_group.my_doctor_details.controller"
    ])
    .type("controller")
    .name("MyDoctorListController")
    .params([
        "$scope",
        "$state",
        "KyeeListenerRegister",
        "CacheServiceBus",
        "KyeeI18nService",
        "MyDoctorListService",
        "MyDoctorDetailsService"
    ])
    .action(function($scope,$state,KyeeListenerRegister,CacheServiceBus,KyeeI18nService,
                     MyDoctorListService,MyDoctorDetailsService){

        $scope.searchObj = {  // 搜索匹配医生信息 addBy liwenjuan 2016/11/30
            searchKey: ""
        };
        KyeeListenerRegister.regist({
            focus: "my_doctor_list",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function(){
                initDoctorList();
            }
        });

        /**
         * 初始化医生列表数据，包含向医生报到时医生未接受，等待验证的医生信息
         * add by wyn 20161125
         */
        var initDoctorList = function(){
            MyDoctorListService.getMyDoctorList(function(data){
                $scope.doctorList = data.scDoctorFriendList;
            });
        };

        /**
         * 跳转至医生详情界面
         * add by wyn 20161125
         * @param doctor
         */
        $scope.goDoctorDetails = function(doctor){
           MyDoctorDetailsService.doctorInfo = doctor;
           $state.go("my_doctor_details");
        };

        /**
         * 添加医生
         * add by wyn 20161125
         */
        $scope.addMyDoctors = function(){
            $state.go("select_hospital_list");
        };

        /**
         * 清空搜索结果
         * addBy liwenjuan 2016/11/30
         */
        $scope.clearInput = function(){
            $scope.searchObj.searchKey = "";
        };

        /**
         * 搜索完成页面内容滑动到顶部
         * addBy liwenjuan 2016/11/30
         */
        $scope.repeatFinished = function() {
            $ionicScrollDelegate.$getByHandle("my_doctor_list").scrollTop();
        };
    })
    .build();
