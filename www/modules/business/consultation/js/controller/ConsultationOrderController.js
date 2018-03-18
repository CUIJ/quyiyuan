/**
 * Created by dangl on 2017-04-20.
 * description: 诊后咨询-我的订单页面控制层
 */
new KyeeModule()
.group("kyee.quyiyuan.consultation.order.controller")
.require([
	"kyee.quyiyuan.consultation.order.service",
	"kyee.quyiyuan.consultation.consult_order_detail.controller",
	"kyee.quyiyuan.consultation.consult_order_detail.service",
	"kyee.quyiyuan.consultation.wait_chatting.controller",
	"kyee.quyiyuan.consultation.consult_satisfaction.controller",
	"kyee.quyiyuan.consultation.consult_pay.controller",
	"kyee.quyiyuan.consultation.consult_pay.service",

	"kyee.quyiyuan.myquyi.my_care_doctors.service",
    "kyee.quyiyuan.hospital.hospital_selector.service",
    "kyee.quyiyuan.appointment.doctor_detail.service",
    "kyee.quyiyuan.appointment.service",
    "kyee.quyiyuan.appointment.doctor_info.controller"
])
.type("controller")
.name("ConsultationOrderController")
.params([
	"$scope", "$rootScope", "$state", "$ionicHistory", "$ionicListDelegate","CacheServiceBus", "KyeeI18nService", "KyeeListenerRegister","KyeeMessageService",
	"ConsultationOrderService", "ConsultOrderDetailService", "ConsultPayService", "MyCareDoctorsService", "HospitalSelectorService",
	"AppointmentDoctorDetailService", "AppointmentDeptGroupService"
])
.action(function($scope, $rootScope, $state, $ionicHistory, $ionicListDelegate, CacheServiceBus, KyeeI18nService, KyeeListenerRegister,KyeeMessageService,
	ConsultationOrderService, ConsultOrderDetailService, ConsultPayService, MyCareDoctorsService, HospitalSelectorService,
	AppointmentDoctorDetailService, AppointmentDeptGroupService){
	'use strict';

	/**
	 * 进入页面监听
	 * */
	KyeeListenerRegister.regist({
	    focus: "consultation_order",
	    when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
	    direction: "both",
	    action: function (params) {
	    	initView();
	    }
	});
    /**
     * 页面返回监听事件
     * */
	KyeeListenerRegister.regist({
	    focus: "consultation_order",
	    when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
	    action: function (params) {
	        params.stopAction();
	        $scope.goBack();
	    }
	});

	/**
	 * [goBack 页面返回]
	 * @return {[type]} [description]
	 */
	$scope.goBack = function(){
		$state.go("center->MAIN_TAB");
	};

	/**
	 * [goToOrderDetail 跳转至订单详情页面]
	 * @param  {[type]} order [description]
	 * @return {[type]}       [description]
	 */
	$scope.goToOrderDetail = function(order){
		$scope.tmpOrder = order;
		ConsultOrderDetailService.consultOrderID = order.scConsultId;//调用接口所需参数
		ConsultOrderDetailService.getOrderDetail(function(response){
			if(response.success){
				handlerOrderDetail(response.data);
			}
		});
	};

	/**
	 * [initView 页面初始化]
	 * @return {[type]} [description]
	 */
	function initView(){
		var param = {
			userVsId: CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT).USER_VS_ID
		};
		ConsultationOrderService.getOrderList(param, function(response){
			if(response.success && response.data.orderList.length > 0){
				$scope.isEmpty = false;
				handlerOrderList(response.data.orderList);
			} else {
				$scope.isEmpty = true;
			}
			$scope.loadComplete = true;
			$scope.$broadcast('scroll.refreshComplete');
		}, function(error){
			$scope.isEmpty = true;
			$scope.loadComplete = true;
			$scope.$broadcast('scroll.refreshComplete');
		});
	}

		/**
		 * [handlerOrderList 对订单列表数据做处理]
		 * @param  {[type]} orderList [description]
		 * @return {[type]}           [description]
		 */
		function handlerOrderList(orderList){
			$scope.orderList = orderList;
			var serV = KyeeI18nService,
				imText = serV.get("doctor_info.consultIm", "图文咨询"),
				phoneText = serV.get("doctor_info.consultPhone", "电话咨询"),
				videoText = serV.get("doctor_info.consultVideo", "视频咨询");
			angular.forEach(orderList, function(order){
				order.stateText = order.orderStateDesc;
				order.payStateText = order.payStateDesc;
				order.doctorPhoto = order.doctorPhoto ? order.doctorPhoto :
					(order.doctorSex==1?"resource/images/base/head_default_female.jpg":"resource/images/base/head_default_man.jpg");
				if(order.consultType === 1){			//图文咨询
					order.consultText = imText;
					order.icon = "bg_im icon-wx-chat";
				} else if (order.consultType === 2) {	//电话咨询
					order.consultText = phoneText;
					order.icon = "bg_phone icon-telephone";
				} else {								//视频咨询
					order.consultText = videoText;
					order.icon = "bg_video icon-video";
				}
				if (order.orderState === 5 || order.orderState === 9){
					if (order.evaluationTime === 0){
						order.isShowToToEvaluate = true;
					} else if(order.evaluationTime > 0){
						order.isShowMyEvaluation = true;
						order.scoreIcons = [];
						for(var i = 0, score = parseFloat(order.doctorScore); i < 5; i++){  //根据评分算出图标样式
							score -= 1;
							if (score <= -1){
								order.scoreIcons[i] = "icon-favorite qy-grey4";
							} else if (-1 < score && score < 0) {
								order.scoreIcons[i] = "icon-favorite1 color_ecb32a";
							} else if (score >= 0){
								order.scoreIcons[i] = "icon-favorite2 color_ecb32a";
							}
						}
					}
				}

			});
		}

	/**
	 * [handlerOrderDetail 处理订单详情]
	 * @param  {[object]} order [description]
	 */
	function handlerOrderDetail(order){
		var state = order.orderState,
			router = ConsultationOrderService.getNextRouterByOrderState(state);
		if (state === 0) {  //待支付 跳转至支付页面
			ConsultPayService.orderNo = $scope.tmpOrder.orderNo;
			ConsultPayService.consultParam = order;
			ConsultPayService.order = order;
		}
		$state.go(router);
	}

	/**
	 * [refresh 下拉刷新]
	 * @return {[type]} [description]
	 */
	$scope.refresh = function(){
		initView();
	};

    /**
	 * by jiangpin
     * [deleteOrder 删除订单]
     * @return {[type]} [description]
     */
    $scope.deleteOrder = function(order){
        ConsultationOrderService.scConsultId = order.scConsultId;
        ConsultationOrderService.deleteOrder(function(response){
            if (response.success) {
                $ionicListDelegate.closeOptionButtons();
                $scope.onRefreshList();
                KyeeMessageService.broadcast({
                    content: response.message,
                    duration: 2000
                });
            }
        }, function(error){
            $state.go("consultation_order");
        });
    };
    //删除后刷新咨询订单列表 by jiangpin
    $scope.onRefreshList = function() {
        var param = {
            userVsId: CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT).USER_VS_ID
        };
        ConsultationOrderService.getOrderList(param, function(response){
            if(response.success && response.data.orderList.length > 0){
                $scope.isEmpty = false;
                handlerOrderList(response.data.orderList);
            } else {
                $scope.isEmpty = true;
            }
            $scope.loadComplete = true;
            $scope.$broadcast('scroll.refreshComplete');
        }, function(error){
            $scope.isEmpty = true;
            $scope.loadComplete = true;
            $scope.$broadcast('scroll.refreshComplete');
        });
    };

    //咨询订单删除弹框提醒 by jiangpin
    $scope.deleteOrderReminder = function(order){
    	if(1 == order.delFlag){
            KyeeMessageService.confirm({
                title: "消息",
                content: "咨询订单删除后将无法恢复，确认删除？",
                okText: KyeeI18nService.get("commonText.selectOk", "删除"),
                cancelText: KyeeI18nService.get("commonText.selectCancel", "取消"),
                onSelect: function (res) {
                    if (res) {
                        $scope.deleteOrder(order);
                    }
                }
            });
		}
    };

	/**
	 * [goToConsultSatisfaction 去评价]
	 * @param order {[object]} [description]
	 * @return {[type]} [description]
	 */
	$scope.goToConsultSatisfaction = function(order){
		ConsultOrderDetailService.consultOrderID = order.scConsultId;//调用接口所需参数
		ConsultOrderDetailService.getOrderDetail(function(response){
			if(response.success){
                ConsultOrderDetailService.isFromWeiXin = false;
				$state.go("consult_satisfaction");
			}
		});
	};

	/**
	 * 跳转到医生主页
	 */
	$scope.goToDoctor = function(order){
		ConsultOrderDetailService.consultOrderID = order.scConsultId;//调用接口所需参数
		ConsultOrderDetailService.getOrderDetail(function(response){
			if(response.success){
				var orderDetail = response.data;
				var doctorInfo = {
					DOCTOR_CODE: orderDetail.doctorCode,
					DOCTOR_NAME: orderDetail.doctorName,
					DOCTOR_TITLE: orderDetail.doctorTitle,
					DOCTOR_PIC_PATH: orderDetail.doctorPhoto,
					DOCTOR_SEX: orderDetail.doctorSex
					};
					var deptData = {
			        DEPT_CODE: orderDetail.deptCode,
			        DEPT_NAME: orderDetail.deptName,
			        IS_ONLINE: orderDetail.isOnline,
			        DOCTOR_NAME: doctorInfo.DOCTOR_NAME,
			        DOCTOR_TITLE: doctorInfo.DOCTOR_TITLE,
			        HOSPITAL_NAME: orderDetail.hospitalName
			    };
			    MyCareDoctorsService.queryHospitalInfo(orderDetail.hospitalId, function (retVal) {
			        // 切换医院
			        HospitalSelectorService.selectHospital(orderDetail.hospitalId, retVal.HOSPITAL_NAME,
			            retVal.MAILING_ADDRESS, retVal.PROVINCE_CODE, retVal.PROVINCE_NAME,
			            retVal.CITY_CODE, retVal.CITY_NAME, "医院正在切换中...", function (response) {
			                //获取缓存中当前就诊者信息
			                var userVsId = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT).USER_VS_ID;
			                AppointmentDoctorDetailService.doctorInfo = {
			                    HOSPITAL_ID: orderDetail.hospitalId,
			                    DEPT_CODE: orderDetail.deptCode,
			                    DEPT_NAME: orderDetail.deptName,
			                    USER_VS_ID: userVsId,
			                    DOCTOR_CODE: doctorInfo.DOCTOR_CODE,
						        DOCTOR_NAME: doctorInfo.DOCTOR_NAME,
						        DOCTOR_TITLE: doctorInfo.DOCTOR_TITLE,
						        HOSPITAL_NAME: orderDetail.hospitalName,
                                DOCTOR_PIC_PATH: doctorInfo.DOCTOR_PIC_PATH,
								DOCTOR_SEX:doctorInfo.DOCTOR_SEX
			                };
			                //跳到医生列表页，将科室放入
			                AppointmentDeptGroupService.SELECT_DEPTGROUPDATA = deptData;
			                AppointmentDoctorDetailService.activeTab = 1;
			                $state.go('doctor_info');
			            });
			    });
			}
		});
	};

})
.build();