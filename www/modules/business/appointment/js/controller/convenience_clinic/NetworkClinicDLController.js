/**
 * 网络门诊医生列表页
 */
new KyeeModule()
.group("kyee.quyiyuan.my.convenience.networkclinicDL.controller")
.require([
	"kyee.quyiyuan.consultation.consult_doctor_list.service",
	"kyee.quyiyuan.myquyi.my_care_doctors.service",
    "kyee.quyiyuan.hospital.hospital_selector.service",
    "kyee.quyiyuan.appointment.doctor_detail.service",
    "kyee.quyiyuan.appointment.service",
    "kyee.quyiyuan.appointment.doctor_info.controller",
	"kyee.quyiyuan.my.convenience.networkclinicDL.service"
])
.type("controller")
.name("NetworkClinicDLController")
.params(["$scope", "$rootScope", "$timeout", "$state", "$ionicHistory", "$ionicScrollDelegate",
	"CacheServiceBus", "KyeeListenerRegister", "KyeeMessageService",
	"ConsultDoctorListService", "MyCareDoctorsService", "HospitalSelectorService",
	"AppointmentDoctorDetailService", "AppointmentDeptGroupService","NetWorkClinicService"])
.action(function ($scope, $rootScope, $timeout, $state, $ionicHistory, $ionicScrollDelegate,
	CacheServiceBus, KyeeListenerRegister, KyeeMessageService, ConsultDoctorListService,
	MyCareDoctorsService, HospitalSelectorService, AppointmentDoctorDetailService, AppointmentDeptGroupService,NetWorkClinicService) {
	'use strict';
    /**
	 * [action 页面进入监听]
	 */
	KyeeListenerRegister.regist({
	    focus: "network_clinic_dl",
	    when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
	    direction: "forward",
	    action: function (params) {
	    	initPageData();
            $scope.loadVisitDL();
	    }
	});

	/**
	 * [loadVisitDL 从服务端加载医生列表]
	 * @return {[type]} [description]
	 */
    $scope.loadVisitDL = function(){
    	var param = {};
    	if ($scope.hospitalId) {
    		param.hospitalId = $scope.hospitalId;
    	}
        NetWorkClinicService.getDoctorListByClinic(param,function(response){
            if (response.success){
                var data = response.data,
                    list = data.onlineDoctorListVos;
                if (list.length === 0) {
                    $scope.emptyText = '暂无网络门诊医生';
                    $scope.isHasData = true;
                }
                handlerDoctorList(list);
                $scope.doctorList = list;
                $ionicScrollDelegate.$getByHandle('consult_doctor_list').scrollTop();
            } else {
                KyeeMessageService.broadcast({
                    content: response.message
                });
            }
        });
    };

	/**
	 * [action 监听物理返回键]
	 */
	KyeeListenerRegister.regist({
	    focus: "network_clinic_dl",
	    when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
	    action: function (params) {
	        params.stopAction();
	        $scope.goBack();
	    }
	});

	/**
	 * [initPageData 初始化页面上的额数据绑定]
	 * @return {[type]} [description]
	 */
	function initPageData(){
        $scope.doctorList = [];       //初始化页面将医生数据置为空
		$scope.isShowFilter = false;  //展示过滤搜索的标识
		$scope.isShowLoadMore = true; //能否上拉加载更多的标识//分页当前页数
		$scope.emptyText = '暂无网络门诊医生'; //在过滤条件为'全部'且查询为空的时候 展示文字
		$scope.loadComplete = true;   //请求是否加载完成
		$scope.deptlistClass = '';    //科室列表动画样式
        $scope.isHasData = false;

        $scope.hospitalId = NetWorkClinicService.hospitalId;  //上个页面带过来的数据
		var backView = $ionicHistory.backView();
		if (backView && backView.stateId === "home->MAIN_TAB"){  //如果此前是从就医页跳转过来的
			$scope.hospitalId = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;
		}
	}

	/**
	 * [handlerDoctorList 对数据做处理]
	 * @param  {[type]} doctorList [description]
	 * @return {[type]}            [description]
	 */
	function handlerDoctorList(doctorList){
		angular.forEach(doctorList, function(doctor){
            if(doctor.score != null && doctor.score != 'null'){
                doctor.score = parseFloat(doctor.score).toFixed(1);
            }
			doctor.feature = doctor.description ? doctor.description.replace(/(\\r|\\n)/g,'') : '暂无信息';
			if (!doctor.photo) {
				doctor.photo = 'resource/images/base/head_default_man.jpg';
			}
			var icons = doctor.scoreIcon = [];
			for(var i = 0, score = parseFloat(doctor.score); i < 5; i++){  //根据评分算出图标样式
				score -= 1;
				if (score <= -1){
					break;
				} else if (-1 < score && score < 0) {
					icons[i] = "icon-favorite1";
				} else if (score >= 0){
					icons[i] = "icon-favorite2";
				}
			}
		});
	}

	/**
	 * [goBack 页面返回]
	 * @return {[type]} [description]
	 */
	$scope.goBack = function(){
		$ionicHistory.goBack(-1);
	};

    /**
     * 跳转至医生主页前 向service中存值
     * @param doctor 医生信息
     * @param deptData 科室信息
     */
    function setDoctorInfoData(doctor, deptData){
        //获取缓存中当前就诊者信息
        var patientInfo = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT),
            userVsId;
        if (patientInfo) {
            userVsId = patientInfo.USER_VS_ID;
        }
        AppointmentDoctorDetailService.doctorInfo = {
            HOSPITAL_ID: doctor.hospitalId,
            DEPT_CODE: doctor.deptCode,
            DEPT_NAME: doctor.dept,
            USER_VS_ID: userVsId,
            DOCTOR_CODE: doctor.doctorCode,
            DOCTOR_NAME: doctor.name,
            DOCTOR_TITLE: doctor.title,
            HOSPITAL_NAME: doctor.hospital,
            DOCTOR_DESC: doctor.feature,
            DOCTOR_PIC_PATH: doctor.photo
        };
        //跳到医生列表页，将科室放入
        AppointmentDeptGroupService.SELECT_DEPTGROUPDATA = deptData;
        AppointmentDoctorDetailService.activeTab = 2;
        $state.go('doctor_info');
    }

	/**
	 * [goToDoctorInfo 跳转至医生主页]
	 * @param  {[type]} doctor [description]
	 * @return {[type]}        [description]
	 */
	$scope.goToDoctorInfo = function(doctor){
		var deptData = {
	        DEPT_CODE: doctor.deptCode,
	        DEPT_NAME: doctor.dept,
	        IS_ONLINE: doctor.isOnline,
	        DOCTOR_NAME: doctor.name,
	        DOCTOR_TITLE: doctor.title,
	        HOSPITAL_NAME: doctor.hospital,
	        DOCTOR_DESC: doctor.feature,
	        DOCTOR_SEX: doctor.sex
	    };
        var hospitalInfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
        if(hospitalInfo && hospitalInfo.id === doctor.hospitalId) {  //若当前选择的医院与该医生所在的医院一样 不切换医院
            setDoctorInfoData(doctor, deptData);
        } else {
            MyCareDoctorsService.queryHospitalInfo(doctor.hospitalId, function (responseData) {
                // 切换医院
                HospitalSelectorService.selectHospital(doctor.hospitalId, responseData.HOSPITAL_NAME,
                    responseData.MAILING_ADDRESS, responseData.PROVINCE_CODE, responseData.PROVINCE_NAME,
                    responseData.CITY_CODE, responseData.CITY_NAME, "医院正在切换中...", function (response) {
                        setDoctorInfoData(doctor, deptData)
                    });
            });
		}

	};

	/**
	 * [页面离开的监听]
	 * @param  {[type]} evt                [description]
	 * @return {[type]} data                [description]
	 */
	$scope.$on("$ionicView.leave", function(event, data){
		NetWorkClinicService.hospitalId = null;
	});
})
.build();
