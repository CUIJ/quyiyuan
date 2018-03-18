/**
 * Created by dangl on 2017年6月15日14:54:37
 * description: 咨询医生 医生列表页面
 */
new KyeeModule()
.group("kyee.quyiyuan.consultation.consult_doctor_list.controller")
.require([
	"kyee.quyiyuan.consultation.consult_doctor_list.service",
	"kyee.quyiyuan.myquyi.my_care_doctors.service",
    "kyee.quyiyuan.hospital.hospital_selector.service",
    "kyee.quyiyuan.appointment.doctor_detail.service",
    "kyee.quyiyuan.appointment.service",
    "kyee.quyiyuan.appointment.doctor_info.controller",
    "kyee.quyiyuan.login.service"
])
.type("controller")
.name("ConsultDoctorListController")
.params([
	"$scope", "$rootScope", "$timeout", "$location", "$state", "$ionicHistory", "$ionicScrollDelegate",
	"CacheServiceBus", "KyeeListenerRegister", "KyeeMessageService", "KyeeUtilsService", "FilterChainInvoker",
	"ConsultDoctorListService", "MyCareDoctorsService", "HospitalSelectorService", "AppointmentDoctorDetailService",
	"AppointmentDeptGroupService","LoginService"
])
.action(function($scope, $rootScope, $timeout, $location, $state, $ionicHistory, $ionicScrollDelegate,
	CacheServiceBus, KyeeListenerRegister, KyeeMessageService, KyeeUtilsService, FilterChainInvoker,
	ConsultDoctorListService, MyCareDoctorsService, HospitalSelectorService, AppointmentDoctorDetailService,
    AppointmentDeptGroupService,LoginService){


    /**
	 * 进入此页面前会要求用户登录
     */

	/**
	 * [action 页面进入监听]
	 */
	KyeeListenerRegister.regist({
	    focus: "consult_doctor_list",
	    when: KYEE_LISTENER_WHEN_TYPES.VIEW.ENTER,
	    direction: "forward",
	    action: function (params) {
	    	initPageData();
	    	initView();
	    }
	});

	/**
	 * [action 监听物理返回键]
	 */
	KyeeListenerRegister.regist({
	    focus: "consult_doctor_list",
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

        $scope.isShowFilter = false;  //展示过滤搜索的标识
		$scope.isShowLoadMore = false; //能否上拉加载更多的标识
		$scope.currentPage = 0;       //分页当前页数
		$scope.keyWords = {			  //搜索关键词
			keyWordsValue: ''
		};
        $scope.viewDoctorList = false; //搜索界面医生列表初始化时不显示
		$scope.emptyText = '暂无医生开通在线咨询'; //在过滤条件为'全部'且查询为空的时候 展示文字
		$scope.loadComplete = true;   //请求是否加载完成
		$scope.deptlistClass = '';    //科室列表动画样式

		$scope.hospitalId = ConsultDoctorListService.hospitalId;  //上个页面带过来的数据


		//目前只有全部情况下存在数据的分页
        $scope.doctorType = ConsultDoctorListService.doctorTypeTmp || 'ALL';
        $scope.sortType = 2;
        $scope.deptCode = (ConsultDoctorListService.defaultDept && ConsultDoctorListService.defaultDept.code) || 0;
        $scope.queryText1 = ConsultDoctorListService.queryText1Tmp || '全部';
		$scope.queryText2 = (ConsultDoctorListService.defaultDept && ConsultDoctorListService.defaultDept.name) || '全部科室';
        $scope.queryText3 = '按咨询量排序';
		setDeptList();
        var yxLoginInfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.YX_LOGIN_INFO);
		if(!yxLoginInfo){
			LoginService.getIMLoginInfo();
		}
        FilterChainInvoker.invokeChain({
            id: "USER_LOGIN_FILTER",
            token: "consult_doctor_list",
            onFinash: function (){
                $state.go('consult_doctor_list');
                $scope.currentPage = 0;
                var param = getParam();
                param.showLoading = true;
                ConsultDoctorListService.getDoctorListByFilter(param, function(response){
                    if (response.success){
                        var data = response.data,
                            list = data.doctorList;
                        $scope.isShowLoadMore = false;
                        //取回的数据小于每页的数量，则表明数据已全部加载 或者选中了医院 就不分页 没有加载更多
                        if (list.length < data.pageSize || $scope.hospitalId ) {
                            $scope.isShowLoadMore = false;
                        } else if(list.length >= data.pageSize && $scope.deptCode == 0 && $scope.doctorType == 'ALL'){
                            $scope.isShowLoadMore = true;
                        }
                        //$scope.loadAll();
                        if (list.length !== 0) {
                            handlerDoctorList(list);
                            $scope.doctorList = list;
                        }else{
                            $scope.emptyText = '暂无匹配的医生';
                            $scope.doctorList = [];
                        	//$scope.loadAll();
                        }
                        $ionicScrollDelegate.$getByHandle('consult_doctor_list').scrollTop();
                    } else {
                        KyeeMessageService.broadcast({
                            content: response.message
                        });
                    }

                });

            }
        });

	}

	function getDoctorList(){

        $scope.currentPage = 0;
        var param = getParam();
        param.showLoading = true;
        ConsultDoctorListService.getDoctorListByFilter(param, function(response){
            if (response.success){
                var data = response.data,
                    list = data.doctorList;
                $scope.isShowLoadMore = false;
                //取回的数据小于每页的数量，则表明数据已全部加载 或者选中了医院 就不分页 没有加载更多
                if (list.length < data.pageSize || $scope.hospitalId ) {
                    $scope.isShowLoadMore = false;
                }else if(list.length >= data.pageSize && $scope.deptCode == 0 && $scope.doctorType == 'ALL'){
                    $scope.isShowLoadMore = true;
                }
                if (list.length !== 0) {
                    handlerDoctorList(list);
                    $scope.doctorList = list;
                }else{
                    $scope.emptyText = '暂无匹配的医生';
                    $scope.doctorList = [];
				}

                $ionicScrollDelegate.$getByHandle('consult_doctor_list').scrollTop();
            } else {
                KyeeMessageService.broadcast({
                    content: response.message
                });
            }

        });
	};

	function getParam(){
		var param = {
            doctorType: $scope.doctorType,
            sortType:$scope.sortType,
			deptCode:$scope.deptCode
		};
		var urlParm = '';
		if($scope.doctorType == 'ALL' && $scope.deptCode == 0){
			param.page = $scope.currentPage;
		}
		if ($scope.hospitalId) {
			param.hospitalId = $scope.hospitalId;
		}
		return param;
	}

	/**
	 * [initView 页面初始化加载数据]
	 * @return {[type]} [description]
	 */
	function initView(){
	}

	/**
	 * [handlerDoctorList 对数据做处理]
	 * @param  {[type]} doctorList [description]
	 * @return {[type]}            [description]
	 */
	function handlerDoctorList(doctorList){
		angular.forEach(doctorList, function(doctor){
            if(doctor.score != null) {
                doctor.score = parseFloat(doctor.score).toFixed(1);
            }
			doctor.feature = doctor.description ? doctor.description.replace(/(\\r|\\n)/g,'') : '暂无信息';

            //给医生图片赋默认值 页面仍做一层处理
			if (!doctor.photo) {
				if(doctor.sex == 1) {
                    doctor.photo = 'resource/images/base/head_default_man.jpg';
                }else{
					doctor.photo = 'resource/images/base/head_default_female.jpg';
				}
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
	 * [setDeptList 设置科室列表]
	 */
	function setDeptList(){
		$scope.deptList = angular.copy(ConsultDoctorListService.deptList);
		$scope.deptList.forEach(function(dept, index, array){
			var number = index % 6 + 1;
			dept.icon += ' dept_color' + number + ' dept_bg' + number;
		});
	}
	/**
	 * [goBack 页面返回]
	 * @return {[type]} [description]
	 */
	$scope.goBack = function(){
		var backView = $ionicHistory.backView();
		if (backView && (backView.stateName === "doctor_patient_relation" || backView.stateName === "login")){
			$state.go('home->MAIN_TAB');
		}else{
            $ionicHistory.goBack(-1);
		}
	};

	/**
	 * [toggleFilter 切换 隐藏/显示 过滤条件]
	 * @return {[type]} [description]
	 */
	$scope.toggleFilter = function(number){
		switch(number) {
			case 1:
				$scope.isShowFilter1 = !$scope.isShowFilter1;
				if($scope.isShowFilter1){
                    $scope.isShowFilter2 = false;
                    $scope.isShowFilter3 = false;
                }
				break;
            case 2:
                $scope.isShowFilter2 = !$scope.isShowFilter2;
                if($scope.isShowFilter2){
                    $scope.isShowFilter1 = false;
                    $scope.isShowFilter3 = false;
                }
                break;
            case 3:
                $scope.isShowFilter3 = !$scope.isShowFilter3;
                if($scope.isShowFilter3){
                    $scope.isShowFilter2 = false;
                    $scope.isShowFilter1 = false;
                }
                break;
            case 4:
                $scope.isShowFilter = !$scope.isShowFilter;
                break;
        }
	};

	/**
	 * [showFilter 显示过滤条件]
	 * @return {[type]} [description]
	 */
	$scope.showFilter = function(){
		$scope.isShowFilter = true;
	};

	/**
	 * [hideFilter 隐藏过滤条件]
	 * @return {[type]} [description]
	 */
	$scope.hideFilter = function(){
		if($scope.isShowFilter1){
            $scope.isShowFilter1 = false;
        }else if($scope.isShowFilter3){
			$scope.isShowFilter3 = false;
		}else if($scope.isShowFilter2){
            $scope.isShowFilter2 = false;
        }else if($scope.isShowFilter){
            $scope.isShowFilter = false;
        }
	};

	/**
	 * [loadAll 点击过滤条件'全部']
	 * @return {[type]} [description]
	 */
	$scope.loadAll = function(){
		$scope.clearKeyWords();
		if ($scope.doctorType === 'ALL') { return; }
        $scope.queryText1 = '全部';
		$scope.doctorType = "ALL";
        getDoctorList();
	};

	$scope.LoadMyCare = function(){
		if( $scope.doctorType == 'CARE'){
			return;
		}
        $scope.doctorType = 'CARE';
        $scope.queryText1 = '关注的医生';
        $scope.doctorList = undefined;
        FilterChainInvoker.invokeChain({
            id: "USER_LOGIN_FILTER",
            token: "consult_doctor_list",
            onFinash: function () {
                $state.go('consult_doctor_list');
                getDoctorList();
            }
        });
    }

	$scope.OrderByVisit = function(){
        if($scope.sortType == 2){
            return;
        }
        $scope.sortType = 2;
        $scope.queryText3 = '按咨询量排序';
        getDoctorList();

	}

	$scope.OrderByScore = function(){
		if($scope.sortType == 1){
			return;
		}
        $scope.sortType = 1;
        $scope.queryText3 = '按评分排序';
        getDoctorList();
	}
	/**
	 * [loadVisitedDoctorList 加载就咨询历史中的医生列表]
	 * @return {[type]} [description]
	 */
	$scope.loadVisitedDoctorList = function(){

		$scope.clearKeyWords();
		if ($scope.doctorType === 'CONSULT') { return; }
		$scope.isShowLoadMore = false;
        $scope.doctorType = 'CONSULT';
        $scope.queryText1 = '咨询历史';
        $scope.doctorList = undefined;
        FilterChainInvoker.invokeChain({
            id: "USER_LOGIN_FILTER",
            token: "consult_doctor_list",
            onFinash: function () {
                $state.go('consult_doctor_list');
                getDoctorList();
            }
        });
	};

	/**
	 * [showDeptList 展示科室列表]
	 * @return {[type]} [description]
	 */
	$scope.showDeptList = function(){
		$scope.isShowDeptList = true;
		$scope.deptlistClass = 'enter_in';
		$timeout(function(){
            document.getElementById("modal_header").scrollIntoView();
        }, 100);
	};
	$scope.searchDoctor = function(){
        ConsultDoctorListService.hospital = $scope.hospitalId;
		$state.go("consult_doctor_list_search");
	}

	/**
	 * [hideDeptList 隐藏科室列表]
	 * @return {[type]} [description]
	 */
	$scope.hideDeptList = function(){
		$scope.deptlistClass = 'leave';
		$timeout(function(){
			$scope.isShowDeptList = false;
		}, 500);
	};

	/**
	 * [clearKeyWords 清除搜索词]
	 * @return {[type]} [description]
	 */
	$scope.clearKeyWords = function(){
		var keyWords = $scope.keyWords;
		keyWords.keyWordsValue = '';
		$scope.lastSearchText = '';
	};

	/**
	 * [search 根据输入的词搜索医院、科室、医生等]
	 * @return {[type]} [description]
	 */
	$scope.search = function(){
		var text = $scope.keyWords.keyWordsValue.trim();
		if (!text) { return; } // || $scope.lastSearchText === text
								// $scope.lastSearchText = text;
		$scope.isShowLoadMore = false;
		$scope.viewDoctorList = true;
		var param = {
			searchText: text
		};
        $scope.hospitalId = ConsultDoctorListService.hospital;
		if ($scope.hospitalId) { param.hospitalId = $scope.hospitalId; }
		ConsultDoctorListService.getDoctorListByKeyWords(param, function(response){
			if (response.success) {
				var data = response.data;
					$scope.doctorListSearched = data.doctorList;
				if (data.doctorList.length === 0) {
					$scope.emptyText = '没有找到相关医生';
				} else {
					handlerDoctorList($scope.doctorListSearched);
				}
				$ionicScrollDelegate.$getByHandle('consult_doctor_list_search').scrollTop();
			} else {
				KyeeMessageService.broadcast({
					content: response.message
				});
			}
		});
	};

    /**
	 * 跳转至医生主页前 向service中存值
     * @param doctor 医生信息
     * @param deptData 科室信息
     */
	function setDoctorInfoData(doctor, deptData){
        var customPatient = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
        var doctorInfo = {
            HOSPITAL_ID: doctor.hospitalId,
            DEPT_CODE: doctor.deptCode,
            DEPT_NAME: doctor.dept,
            DOCTOR_CODE: doctor.doctorCode,
            DOCTOR_NAME: doctor.name,
            DOCTOR_TITLE: doctor.title,
            HOSPITAL_NAME: doctor.hospital,
            DOCTOR_DESC: doctor.feature,
            DOCTOR_PIC_PATH: doctor.photo,
            DOCTOR_SEX:doctor.sex
        };
        if (customPatient && customPatient.USER_VS_ID) { doctorInfo.USER_VS_ID = customPatient.USER_VS_ID; }
        AppointmentDoctorDetailService.doctorInfo = doctorInfo;
        //跳到医生列表页，将科室放入
        AppointmentDeptGroupService.SELECT_DEPTGROUPDATA = deptData;
        AppointmentDoctorDetailService.activeTab = 1;  //医生主页显示咨询医生tab
        $state.go('doctor_info');
	}

	/**
	 * [goToDoctorInfo 跳转至医生主页]
	 * @param  {[type]} doctor [description]
	 * @return {[type]}        [description]
	 * 咨询医生列表
	 */
	$scope.goToDoctorInfo = function(doctor){
		var deptData = {
	        DEPT_CODE: doctor.deptCode,
	        DEPT_NAME: doctor.dept,
	        IS_ONLINE: doctor.isOnline,
	        DOCTOR_NAME: doctor.name,
	        DOCTOR_TITLE: doctor.title,
	        HOSPITAL_NAME: doctor.hospital
	    };
		var hospitalInfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
		if(hospitalInfo && hospitalInfo.id === doctor.hospitalId) {  //若当前选择的医院与该医生所在的医院一样 不切换医院
            setDoctorInfoData(doctor, deptData);
		} else { //当前选择的医院与该医生所在的医院不一样 需要切换医院
            MyCareDoctorsService.queryHospitalInfo(doctor.hospitalId, function (responseData) {  //查询医院信息
                HospitalSelectorService.selectHospital(doctor.hospitalId, responseData.HOSPITAL_NAME, // 切换医院
                    responseData.MAILING_ADDRESS, responseData.PROVINCE_CODE, responseData.PROVINCE_NAME,
                    responseData.CITY_CODE, responseData.CITY_NAME, "医院正在切换中...", function (response) {
                        setDoctorInfoData(doctor, deptData);
                    });
            });
		}
	};

	/**
	 * [chooseDept 选中科室，根据科室筛选]
	 * @param  {[type]} dept [description]
	 * @return {[type]}      [description]
	 */
	$scope.chooseDept = function(dept){

		$scope.clearKeyWords();
		$scope.hideDeptList();
		if(dept.code == 0){
            $scope.queryText2 = '全部科室';
		}else {
            $scope.queryText2 = dept.name;
        }
		$scope.deptCode = dept.code;
		$scope.isShowLoadMore = false;
        getDoctorList();
	};

	/**
	 * [loadMore 上拉加载更多]
	 * @return {[type]} [description]
	 */
	$scope.loadTimeStep = null;
	$scope.loadMore = function(){
		if (!$scope.loadComplete){
			return;
		}
		if(!$scope.loadTimeStep){
			$scope.loadTimeStep = new Date().getTime();
		} else {
			var now = new Date().getTime();
			if (now - $scope.loadTimeStep < 500){
				$scope.$broadcast('scroll.infiniteScrollComplete');
				return;
			} else {
				$scope.loadTimeStep = null;
			}
		}
		$scope.currentPage++;
		var param = getParam();
		param.showLoading = false;
		$scope.loadComplete = false;

		ConsultDoctorListService.getDoctorListByFilter(param, function(response){
			if (response.success){
				var data = response.data,
					list = data.doctorList;
                if (list.length < data.pageSize) {   //取回的数据小于每页的数量，则表明数据已全部加载
                    $scope.isShowLoadMore = false;
                }
                if (list.length !== 0) {
                    handlerDoctorList(list);
                    $scope.doctorList = $scope.doctorList.concat(list);
                }
			} else {
				KyeeMessageService.broadcast({
					content: response.message
				});
			}
			$scope.$broadcast('scroll.infiniteScrollComplete');
			$scope.loadComplete = true;
		}, function(error){
			$scope.$broadcast('scroll.infiniteScrollComplete');
			$scope.loadComplete = true;
		});
	};

	/**
	 * [页面离开的监听]
	 * @param  {[type]} evt                [description]
	 * @return {[type]} data                [description]
	 */
	$scope.$on("$ionicView.leave", function(event, data){
		ConsultDoctorListService.hospitalId = null;
		ConsultDoctorListService.doctorTypeTmp = null;
		ConsultDoctorListService.queryText1Tmp = null;
		ConsultDoctorListService.defaultDept = null;
	});

	$scope.$on("$ionicView.loaded", function(event, data){
		//页面上的过滤条件默认隐藏(使用.hide样式类)，不隐藏会在$scope创建之前展示在页面上 页面加载后需要移除.hide类

		$timeout(function() {
			var el = document.querySelector("div.position-r.has-header.hide");
			if(el) {
				angular.element(el).removeClass("hide");
			}
		}, 2000);
	});
})
.build();