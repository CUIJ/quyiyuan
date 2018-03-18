new KyeeModule()
    .group("kyee.quyiyuan.consultation.consult_doctor_main.controller")
    .require([
        "kyee.quyiyuan.consultation.consult_doctor_main.service",
        "kyee.quyiyuan.consultation.consult_doctor_list.service",
        "kyee.quyiyuan.myquyi.my_care_doctors.service",
        "kyee.quyiyuan.hospital.hospital_selector.service",
        "kyee.quyiyuan.appointment.doctor_detail.service",
        "kyee.quyiyuan.appointment.service",
        "kyee.quyiyuan.appointment.doctor_info.controller",
        "kyee.quyiyuan.consultation.consult_famous_doctor.controller",
        "kyee.quyiyuan.appointment.doctor_action.service",
        "kyee.quyiyuan.consultation.view_full_text.service",
        "kyee.quyiyuan.consultation.view_full_text.controller"

    ])
    .type("controller")
    .name("ConsultDoctorMainController")
    .params([
        "$scope", "$rootScope", "$timeout", "$location", "$state","$stateParams", "$ionicHistory", "$ionicScrollDelegate",
        "CacheServiceBus", "KyeeListenerRegister", "KyeeMessageService", "KyeeUtilsService", "FilterChainInvoker",
        "ConsultDoctorMainService", "MyCareDoctorsService", "HospitalSelectorService", "AppointmentDoctorDetailService",
        "AppointmentDeptGroupService","ConsultDoctorListService","OperationMonitor","AppointmentDoctorActionService"
    ])
    .action(function($scope, $rootScope, $timeout, $location, $state,$stateParams, $ionicHistory, $ionicScrollDelegate,
                     CacheServiceBus, KyeeListenerRegister, KyeeMessageService, KyeeUtilsService, FilterChainInvoker,
                     ConsultDoctorMainService, MyCareDoctorsService, HospitalSelectorService, AppointmentDoctorDetailService,
                     AppointmentDeptGroupService,ConsultDoctorListService,OperationMonitor,AppointmentDoctorActionService){
        'use strict';
        /**
         * 局部变量
         */
        var wordsPreLine = Math.floor((window.innerWidth -14*2-50-10)/14);
        /**
         * 监听
         */

        KyeeListenerRegister.regist({
            focus: "consult_doctor_main",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.goBack();
            }
        });

        $scope.$on("$ionicView.loaded", function(event, data){
            $scope.enty.getData();
        });
        /**
         *对象声明
         */
        $scope.enty = {
            groups:{
                topDoctor:{
                    items:[]
                },
                careDoctor:{
                    items:[]
                },
                deptList:{
                    items:[]
                },
                famousDoctor:{
                    items:[]
                },
                topHospital:{
                    items:[],
                    clickItem:goTopHospital
                }
            },
            getData:function(){
                //获取推荐医生
                getTopDoctor();
                //获取关注的医生
                getCareDoctor();
                //获取科室
                setDeptList();
                //获取推荐的医院
                getTopHospital();
                //获取名医动态
                getFamousAction();
            }
        };
        $scope.isFolding = true;//科室默认折叠
        $scope.showMore = false;
        $scope.doctorActionList = [];
        /**
         * 对外函数
         */
        $scope.slideDeptList = slideDeptList;

        $scope.goBack = function(){

            $ionicHistory.goBack(-1);
        };

        $scope.searchDoctor = function(){

            $state.go("consult_doctor_list_search");
        };
        $scope.goFamousDoctor = function(){
            $state.go("consult_famous_doctor");
        };
        $scope.chooseDept = function(dept){
            ConsultDoctorListService.hospitalId = null;
            ConsultDoctorListService.defaultDept = {
                code:dept.code,
                name:dept.name
            };
            OperationMonitor.record('dept', "consult_doctor_main");
            $state.go("consult_doctor_list");

        };
        $scope.goDoctorNav = function(doctor,doctorType){
            var currentCustomPatient = CacheServiceBus.getMemoryCache().get('currentCustomPatient');
            var hospitalInfo = CacheServiceBus.getStorageCache().get("hospitalInfo");
            OperationMonitor.record(doctorType, "consult_doctor_main");
            AppointmentDoctorDetailService.doctorInfo = {
                HOSPITAL_ID: doctor.hospitalId,
                DEPT_CODE: doctor.deptCode,
                DEPT_NAME: doctor.dept,
                USER_VS_ID: currentCustomPatient && currentCustomPatient.USER_VS_ID,
                DOCTOR_CODE: doctor.doctorCode,
                DOCTOR_NAME: doctor.name,
                DOCTOR_TITLE: doctor.title,
                IS_ONLINE: doctor.isOnline,
                HOSPITAL_NAME: doctor.hospital,
                DOCTOR_DESC: doctor.description,
                DOCTOR_PIC_PATH: doctor.photo,
                DOCTOR_SEX:doctor.sex
            };
            AppointmentDoctorDetailService.activeTab = 1;
            //切换医院
            if(hospitalInfo && hospitalInfo.id === doctor.hospitalId) {
                $state.go("doctor_info");
                return;
            }
            changeHospital(doctor.hospitalId,function(){
                $state.go("doctor_info");
            });
        };
        $scope.goDoctorInfo = function(doctor){
            var currentCustomPatient = CacheServiceBus.getMemoryCache().get('currentCustomPatient');
            var hospitalInfo = CacheServiceBus.getStorageCache().get("hospitalInfo");

            AppointmentDoctorDetailService.doctorInfo = {
                HOSPITAL_ID: doctor.hospitalId,
                DEPT_CODE: doctor.deptCode,
                DEPT_NAME: doctor.deptName,
                USER_VS_ID: currentCustomPatient && currentCustomPatient.USER_VS_ID,
                DOCTOR_CODE: doctor.doctorCode,
                DOCTOR_NAME: doctor.doctorName,
                DOCTOR_TITLE: doctor.doctorTitle,
                IS_ONLINE: doctor.isOnline,
                HOSPITAL_NAME: doctor.hospitalName,
                DOCTOR_DESC: doctor.description,
                DOCTOR_PIC_PATH: doctor.photo,
                DOCTOR_SEX:doctor.doctorSex
            };
            AppointmentDoctorDetailService.activeTab = 1;
            //切换医院
            if(hospitalInfo && hospitalInfo.id === doctor.hospitalId) {
                $state.go("doctor_info");
                return;
            }
            changeHospital(doctor.hospitalId,function(){
                $state.go("doctor_info");
            });
        };
        $scope.toggleShowAll = function(action) {
            if(action.lines > 6){
                ViewFullTextService.content = action.content;
                $state.go("view_full_text");
                return;
            }
            action.isShowAll = !action.isShowAll;
        };
        $scope.onDragUp = function(){
            $ionicScrollDelegate.$getByHandle('consult_doctor_main').scrollBy(0,300,true);
        };

        $scope.onDragDown = function(){
            $ionicScrollDelegate.$getByHandle('consult_doctor_main').scrollBy(0,-300,true);
        };
        /**
         * 私有函数
         */
        function getTopDoctor(){

            ConsultDoctorMainService.queryTopDoctorList(function(res){
                $scope.enty.groups.topDoctor.items = handleDoctorList(res.data.doctorList);
            });
        }
        function getCareDoctor(){
           var params = {
               deptCode:0,
               page:0,
               doctorType:'CARE',
               sortType:1
           };
            ConsultDoctorMainService.queryMyCareList(params,function(res){

                $scope.enty.groups.careDoctor.items = handleDoctorList(res.data.doctorList);
            });
        }
        function slideDeptList(){
            $scope.isFolding = !$scope.isFolding;
            setDeptList();
        }
        function setDeptList(){
            var deptNum = $scope.isFolding ? ConsultDoctorMainService.deptList.slice(0,8):ConsultDoctorMainService.deptList;
            $scope.enty.groups.deptList.items = angular.copy(deptNum);
            $scope.enty.groups.deptList.items.forEach(function(dept, index, array){
                index++;
                var number = index % 6 + 1;
                dept.icon += ' dept_color' + number + ' dept_bg' + number;
            });
        }
        //切换医院
        function changeHospital(hospitalId,callback){
            ConsultDoctorMainService.queryHospitalInfo(hospitalId, function(result){
                // 切换医院
                HospitalSelectorService.selectHospital(hospitalId, result.HOSPITAL_NAME,
                    result.MAILING_ADDRESS, result.PROVINCE_CODE, result.PROVINCE_NAME,
                    result.CITY_CODE, result.CITY_NAME, "医院正在切换中...", function () {

                        callback && callback();
                    });
            });
        }
        //处理医生头像和医生介绍
        function handleDoctorList(doctorList){
            angular.forEach(doctorList,function(doctor){
                //给医生图片赋默认值 页面仍做一层处理
                if (!doctor.photo) {
                    if(doctor.sex == 1) {
                        doctor.photo = 'resource/images/base/head_default_man.jpg';
                    }else{
                        doctor.photo = 'resource/images/base/head_default_female.jpg';
                    }
                }
                doctor.description = doctor.description ? doctor.description.replace(/(\\r|\\n)/g,'') : '暂无信息';
            });
            return doctorList;
        }

        function getTopHospital(){
            ConsultDoctorMainService.queryTopHospital(function(data){
                $scope.enty.groups.topHospital.items = data.data.hospitalList;
            });
        }
        function goTopHospital(hospital){
            var hospitalInfo = CacheServiceBus.getStorageCache().get("hospitalInfo");
            ConsultDoctorListService.hospitalId = hospital.hospitalId;
            ConsultDoctorListService.defaultDept = null;
            //切换医院
            if(hospitalInfo && hospitalInfo.id === hospital.hospitalId) {
                $state.go("consult_doctor_list");
                return;
            }
            changeHospital(hospital.hospitalId,function(){
                $state.go("consult_doctor_list");
            });
        }
        function getFamousAction(){
            AppointmentDoctorActionService.getFamousAction({
                showLoading:false,
                currentPage:0,
                pageSize:10
            }, function(data){
               if(data && data.DoctorDynamicsList && data.DoctorDynamicsList.length > 0){
                   var list = angular.copy(data.DoctorDynamicsList);
                   angular.forEach(list,function(item){
                       item.content = item.content.replace(/(\\r|\\n)/g,'');
                       item.isShowAll = false;
                       item.lines = Math.ceil(item.content.length/wordsPreLine);
                   });
                   if(list.length > 2){
                       $scope.showMore = true;
                   }
                   $scope.doctorActionList = list.splice(0,2);
               }
            });
        }
    })
    .build();
