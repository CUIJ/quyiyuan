new KyeeModule()
    .group("kyee.quyiyuan.consultation.consult_famous_doctor.controller")
    .require([
        "kyee.quyiyuan.appointment.doctor_action.service",
        "kyee.quyiyuan.appointment.doctor_detail.service",
        "kyee.quyiyuan.appointment.doctor_info.controller",
        "kyee.quyiyuan.hospital.hospital_selector.service",
        "kyee.quyiyuan.consultation.consult_doctor_main.service",
        "kyee.quyiyuan.consultation.show_pictures.service",
        "kyee.quyiyuan.consultation.view_full_text.service",
        "kyee.quyiyuan.consultation.view_full_text.controller"])
    .type("controller")
    .name("ConsultFamousDoctorController")
    .params(["$scope", "$rootScope", "$timeout", "$location", "$state","KyeeListenerRegister",
        "AppointmentDoctorActionService","ShowPicturesService","KyeeViewService","$ionicHistory",
        "CacheServiceBus","AppointmentDoctorDetailService","HospitalSelectorService",
        "ConsultDoctorMainService","ViewFullTextService"])
    .action(function($scope, $rootScope, $timeout, $location, $state, KyeeListenerRegister,
         AppointmentDoctorActionService,ShowPicturesService,KyeeViewService,$ionicHistory,
         CacheServiceBus,AppointmentDoctorDetailService,HospitalSelectorService,
         ConsultDoctorMainService,ViewFullTextService){
        'use strict';
        /**
         * 局部变量
         */
        var wordsPreLine = Math.floor((window.innerWidth -14*2-50-10)/14);
        //本次下拉加载是否完成
        var loadComplete = true;
        //本次加载时间戳
        var loadTimeStep = null;
        //每页显示记录说
        var count = 10;
        //当前页
        var page = 0;
        /**
         * 监听
         */
        KyeeListenerRegister.regist({
            focus: "consult_famous_doctor",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.ENTER,
            direction: "both",
            action: function (params) {
                $scope.loadMore();
            }
        });
        KyeeListenerRegister.regist({
            focus: "consult_famous_doctor",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $ionicHistory.goBack(-1);
            }
        });

        /**
         *声明对象
         */
        $scope.imageWidth = parseInt((window.innerWidth - 14 * 2 - 50 -10 - 10 * 3) / 3);
        $scope.isShowLoadMore = true;
        $scope.doctorActionList = [];
        /**
         * 对外函数
         */
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
        $scope.preview = function(imgList,index){
            ShowPicturesService.ACTIVESLIDE = index; //定义页面初始展示第几张图
            ShowPicturesService.IMGLIST = imgList;
            KyeeViewService.openModalFromUrl({
                url: "modules/business/consultation/views/template/show_picture.html",
                scope: $scope,
                animation: "slide-in-right"
            });
        };
        $scope.loadMore = function(){
            if(!loadComplete){
                return;
            }
            if(!loadTimeStep){
                loadTimeStep = new Date().getTime();
            }else{
                var now = new Date().getTime();
                if (now - loadTimeStep < 500){
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    return;
                } else {
                    loadTimeStep = now;
                }
            }
            loadComplete = false;
            loadDoctorAction();
        };
        /**
         * 私有函数
         */
        function loadDoctorAction(){
            var param = {
                showLoading:false,
                currentPage:page++,
                pageSize:count
            };
            AppointmentDoctorActionService.getFamousAction(param, function(data){
                var list = data.DoctorDynamicsList;
                if (list.length < count) {   //取回的数据小于每页的数量，则表明数据已全部加载
                    $scope.isShowLoadMore = false;
                }
                if (list.length !== 0) {
                    handleActionPicture(list);
                    $scope.doctorActionList = $scope.doctorActionList.concat(list);
                }
                $scope.$broadcast('scroll.infiniteScrollComplete');
                loadComplete = true;
            }, function(error){
                $scope.$broadcast('scroll.infiniteScrollComplete');
                loadComplete = true;
            });
        }
        function handleActionPicture(list){
            angular.forEach(list,function(item,index,array){
                item.content = item.content.replace(/(\\r|\\n)/g,'');
                item.isShowAll = false;
                item.lines = Math.ceil(item.content.length/wordsPreLine);
                item.pictureArray = [];
                if(item.pictures == ''){
                    return;
                }
                var array = item.pictures.split(",");
                angular.forEach(array,function(pic){
                    item.pictureArray.push({
                        imgUrl:pic
                    });
                });
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
    })
    .build();
