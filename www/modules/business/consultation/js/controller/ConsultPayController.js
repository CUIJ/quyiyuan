/**
 * Created by dangliming on 2017年5月26日10:17:05.
 * description: 付费咨询-订单支付页面控制层
 */
new KyeeModule()
.group("kyee.quyiyuan.consultation.consult_pay.controller")
.require([
	"kyee.quyiyuan.consultation.consult_pay.service",
	"kyee.quyiyuan.consultation.wait_chatting.controller",
	"kyee.quyiyuan.payOrder.service",
	"kyee.quyiyuan.consultation.order.controller",
	"kyee.quyiyuan.consultation.consult_order_detail.service",
	"kyee.quyiyuan.consultation.consult_order_detail.controller",
	"kyee.quyiyuan.consultation.wait_chatting.service",
	"kyee.quyiyuan.consultation.order.service"
])
.type("controller")
.name("ConsultPayController")
.params([
	"$scope", "$rootScope", "$timeout", "$state", "$ionicHistory", "$ionicLoading",
	"CacheServiceBus", "KyeeListenerRegister", "KyeeMessageService",
	"ConsultPayService", "PayOrderService", "ConsultOrderDetailService", "WaitChattingService", "ConsultationOrderService","$window"
])
.action(function($scope, $rootScope, $timeout, $state, $ionicHistory, $ionicLoading,
	CacheServiceBus, KyeeListenerRegister, KyeeMessageService,
	ConsultPayService, PayOrderService, ConsultOrderDetailService, WaitChattingService, ConsultationOrderService,$window){
	'use strict';
	KyeeListenerRegister.regist({
	    focus: "consult_pay",
	    when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
	    direction: "both",
	    action: function (params) {
	    	initPageData();
	    	var order = $scope.order = ConsultPayService.order;
	    	if (order && order.orderState === 0 && order.payState === 6){ //支付处理中
	    		$scope.title = '支付处理中';
	    		$scope.payIsHandlering = true;
	    		KyeeMessageService.loading({
					mask: true,
					content: '处理中...',
					duration: 50000
				});
				$scope.countTimeout = 0;
				getOrderState();
	    	} else {
	    		initView();
	    	}
	    }
	});

	KyeeListenerRegister.regist({
	    focus: "consult_pay",
	    when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
	    action: function (params) {
	        params.stopAction();
	        $scope.goBack();
	    }
	});

    /**
     *  获取URL参数
     */
    function getQueryString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = $window.location.search.substr(1).match(reg);
        if (r != null) {
            return decodeURI(r[2]);
        }
        return null;
    };

	/**
	 * [initPageData 页面初始化加载的操作]
	 * @return {[type]} [description]
	 */
	function initPageData(){
		/*处理微信推送页面加载*/
        //判断是否为微信推送内容 如果为微信推送跳转则获取参数
        if(ConsultOrderDetailService.isFromWeiXin){
            ConsultOrderDetailService.consultOrderID = getQueryString("consultOrderID");
            ConsultOrderDetailService.getOrderDetail(function (data) {
                if(ConsultOrderDetailService.orderDetail.orderState == 5 ||
                    ConsultOrderDetailService.orderDetail.orderState == 4 ||
                    ConsultOrderDetailService.orderDetail.orderState == 6 ||
                    ConsultOrderDetailService.orderDetail.orderState == 9){
                    KyeeMessageService.broadcast({
                        content: "订单已完成"
                    });
                    $state.go("consult_order_detail");
                }else if(ConsultOrderDetailService.orderDetail.orderState == 1 ||
                    ConsultOrderDetailService.orderDetail.orderState == 2 ||
                    ConsultOrderDetailService.orderDetail.orderState == 7 ||
                    ConsultOrderDetailService.orderDetail.orderState == 8 ||
                    ConsultOrderDetailService.orderDetail.orderState == 10
				){
                    KyeeMessageService.broadcast({
                        content: "订单状态已变更"
                    });
                	$state.go("wait_chatting");
				}else{
                    ConsultOrderDetailService.isFromWeiXin = false;
                    ConsultPayService.orderNo = ConsultOrderDetailService.orderDetail.orderNo;
                    ConsultPayService.order = ConsultOrderDetailService.orderDetail;
                    var consultParam = $scope.consultParam = ConsultOrderDetailService.orderDetail;

                    $scope.title = "选择支付方式";
                    if (consultParam.payDueDate){
                        var params = consultParam.hospitalId;
                        //by jiangpin 任务号：KYEEAPPC-11834 获取后台'选择支付方式'提示语
                        var contentReminder = '';
                        ConsultPayService.choosePaymentReminder(params, function(response){
                            if(response.success && response.data){
                                contentReminder = response.data.reminder;
                                $scope.tip = "请您于" + consultParam.payDueDate + "前完成支付，"+contentReminder;
                            }else{
                                $scope.tip = "请您于" + consultParam.payDueDate + "前完成支付，超时订单自动关闭，医生未接诊自动退款。";
                            }
                        });
                        //$scope.tip = "请您于" + consultParam.payDueDate + "前完成支付，超时订单自动关闭";
                    } else {
                        $scope.tip = null;
                    }
                    $scope.confirmPayText = "确认支付￥" + (consultParam.payAmount).toFixed(2); //底部按钮
                    setHeadStatus(consultParam.consultType); //设置头部状态

                    $scope.orderInfo = {    //订单相关信息
                        doctorName: consultParam.doctorName,
                        payAmount: consultParam.payAmount,
                        consultTypeText: ""
                    };

                    var orderInfo = $scope.orderInfo;
                    switch (consultParam.consultType){
                        case 1 :
                            orderInfo.consultTypeText = "图文咨询";
                            break;
                        case 2 :
                            orderInfo.consultTypeText = "电话咨询";
                            break;
                        case 3 :
                            orderInfo.consultTypeText = "视频咨询";
                            break;
                        default:
                            orderInfo.consultTypeText = "图文咨询";
                    }

                    $scope.payStyle = [];  //初始化无支付方式
                    $scope.payTypeValue = -1; //初始化未选中支付方式
                    $scope.payIsHandlering = false;  //是否展示底部按钮

                    $scope.payData = {
                        AMOUNT: consultParam.payAmount + "",
                        TRADE_NO: ConsultPayService.orderNo,
                        MARK_DESC: orderInfo.consultTypeText,
                        MARK_DETAIL: orderInfo.consultTypeText,
                        ROUTER: "wait_chatting",
                        hospitalID: consultParam.hospitalId
                    }
                    initView();
				}
            });
            return;
        }else {
            // 头部订单类型／状态信息
            var consultParam = $scope.consultParam = ConsultPayService.consultParam;

            $scope.title = "选择支付方式";
            if (consultParam.payDueDate) {
                var params = consultParam.hospitalId;
                ////by jiangpin 任务号：KYEEAPPC-11834 获取后台'选择支付方式'提示语
                var contentReminder = '';
                ConsultPayService.choosePaymentReminder(params, function(response){
                    if(response.success && response.data){
                        contentReminder = response.data.reminder;
                        $scope.tip = "请您于" + consultParam.payDueDate + "前完成支付，"+contentReminder;
                    }else{
                        $scope.tip = "请您于" + consultParam.payDueDate + "前完成支付，超时订单自动关闭，医生未接诊自动退款。";
                    }
                });
                //$scope.tip = "请您于" + consultParam.payDueDate + "前完成支付，超时订单自动关闭";
            } else {
                $scope.tip = null;
            }
            $scope.confirmPayText = "确认支付￥" + (consultParam.payAmount).toFixed(2); //底部按钮
            setHeadStatus(consultParam.consultType); //设置头部状态

            $scope.orderInfo = {    //订单相关信息
                doctorName: consultParam.doctorName,
                payAmount: consultParam.payAmount,
                consultTypeText: ""
            };

            var orderInfo = $scope.orderInfo;
            switch (consultParam.consultType) {
                case 1 :
                    orderInfo.consultTypeText = "图文咨询";
                    break;
                case 2 :
                    orderInfo.consultTypeText = "电话咨询";
                    break;
                case 3 :
                    orderInfo.consultTypeText = "视频咨询";
                    break;
                default:
                    orderInfo.consultTypeText = "图文咨询";
            }

            $scope.payStyle = [];  //初始化无支付方式
            $scope.payTypeValue = -1; //初始化未选中支付方式
            $scope.payIsHandlering = false;  //是否展示底部按钮

            $scope.payData = {
                AMOUNT: consultParam.payAmount + "",
                TRADE_NO: ConsultPayService.orderNo,
                MARK_DESC: orderInfo.consultTypeText,
                MARK_DETAIL: orderInfo.consultTypeText,
                ROUTER: "wait_chatting",
                hospitalID: consultParam.hospitalId
            }
        }
	}

	/**
	 * 根据订单类型设置头部状态
	 * @param consultType 1:图文；2:电话；3:视频
	 */
	function setHeadStatus(consultType) {
	    if (consultType == 1) {
	        // 头部状态栏展示所需数据
	        $scope.statusData = [{
	            'statusCode': 1,
	            'statusName': '补充资料'
	        }, {
	            'statusCode': 2,
	            'statusName': '支付费用'

	        }, {
	            'statusCode': 3,
	            'statusName': '等待接诊'
	        }, {
	            'statusCode': 4,
	            'statusName': '咨询完成'
	        }];
	        $scope.consultTypeName = '图文咨询';
	        $scope.currentStatusCode = 2; //当前页面处于的状态-等待接诊
	    } else if (consultType === 2 || consultType === 3) {
	        // 头部状态栏展示所需数据
	        $scope.statusData = [{
	            'statusCode': 1,
	            'statusName': '补充资料'
	        }, {
	            'statusCode': 2,
	            'statusName': '支付费用'

	        }, {
	            'statusCode': 3,
	            'statusName': '等待接诊'
	        }, {
	            'statusCode': 4,
	            'statusName': '医生回拨'
	        }, {
	            'statusCode': 5,
	            'statusName': '咨询完成'
	        }];
	        $scope.currentStatusCode = 2; //当前页面处于的状态-等待接诊
	        if (consultType == 2) {
	            $scope.consultTypeName = '电话咨询';
	        } else {
	            $scope.consultTypeName = '视频咨询';
	        }
	    }
	}
	
	/**
	 * [goBack 页面返回]
	 * @return {[type]} [description]
	 */
	$scope.goBack = function(){

		if ($scope.payIsHandlering) {   //支付处理中 直接返回
			$state.go("consultation_order");
		} else {
			KyeeMessageService.confirm({
	            content: "您的订单已经成功创建，超时将自动取消，请及时支付。",
	            okText: "继续支付",
	            cancelText: "确认退出",
	            onSelect: function (confirm) {
	                if (!confirm) {
	                	$state.go("consultation_order");
	                }
	            }
	        });
		}
	};
	/**
	 * [cancelOrder 取消订单]
	 * @return {[type]} [description]
	 */
	$scope.cancelOrder = function(){
		ConsultOrderDetailService.consultOrderID = $scope.consultParam.scConsultId;
		WaitChattingService.cancelOrder(function(response){
			$ionicLoading.hide();
			if (!response.success) {
				KyeeMessageService.broadcast({
                    content: response.message,
                    duration: 2000
                });
			}
			ConsultOrderDetailService.isShowLoading = false;
			ConsultOrderDetailService.getOrderDetail(function(res){
            	if (response.success && res.success) {
            		$state.go("wait_chatting");
            	} else {
            		$state.go('consult_order_detail');
            	}
            }, function(error){
            	$state.go("consultation_order");
            });
		}, function(error){
			$state.go("consultation_order");
		});
	};

	/**
	 * [getParams 组装获取支付方式列表的参数]
	 * @return {[type]} [description]
	 */
	function getParams(){
		var consultParam = ConsultPayService.consultParam;
		return {
			hospitalId: consultParam.hospitalId,
			modeCode: "10",   //10-付费咨询
			orderNo: ConsultPayService.orderNo  //订单号
		};
	}



	/**
	 * [initView 页面初始化]
	 * @return {[type]} [description]
	 */
	function initView(){
		var params = getParams();
		ConsultPayService.getPayTypeList(params, function(response){
			if (response.success){
				var payStyle = response.data.payStyle,
					getPayType = PayOrderService.payImage;  //后端返回的payStyle是个String, 需要转为JSON数组

				payStyle = (typeof payStyle === 'string') ? JSON.parse(payStyle): (Array.isArray(payStyle) ? payStyle : []);
				if (Array.isArray(payStyle) && payStyle.length > 0){
					angular.forEach(payStyle, function(payType){
						payType.imgUrl = getPayType(payType.ITEM_VALUE);
					});
					$scope.payStyle = payStyle;
					$scope.payTypeValue = payStyle[0].ITEM_VALUE;
				}
			}
		});
	}

	/**
	 * [choosePayType 点击选择支付方式]
	 * @param  {[type]} payTypeValue [description]
	 * @return {[type]}              [description]
	 */
	$scope.choosePayType = function(payTypeValue){
		$scope.payTypeValue = payTypeValue;
	};

	/**
	 * [goPay 点击"确认支付"按钮去支付]
	 * @return {[type]} [description]
	 */
	$scope.goPay = function(){
		var payType = $scope.payTypeValue,
			msgCode = "",
			param = {
				scConsultId : $scope.consultParam.scConsultId	
			};
		ConsultPayService.checkOrderIsPayAvaliable(param, function(response){
			if (response.success) {
				if (response.data.payAvailable) {
					PayOrderService.payData = $scope.payData;
					PayOrderService.paySubmit(backToLastPage, payType, msgCode, $state);
				} else {
					KyeeMessageService.message({
						content: '支付已逾期，您的订单失效，请重新发起咨询。',
						onOk: function(){
							ConsultOrderDetailService.consultOrderID = $scope.consultParam.scConsultId;
							ConsultOrderDetailService.getOrderDetail(function (response) {
								if (response.success) {
									$state.go("consult_order_detail");    //跳转至订单详情页
								}
							});
						}
					});
				}
			} else {
				KyeeMessageService.broadcast({
					content: response.message
				});
			}
		});
	};

	/**
	 * [backToLastPage 调用第三方支付后的回调函数]
	 * @param  {[type]} flag [description]
	 * @return {[type]}      [description]
	 */
	var backToLastPage = function(flag){
		var router = PayOrderService.payData.ROUTER;
		if (flag === 'failed') {  //支付失败则取消订单
		    // $scope.title = "支付失败";
		} else {  //支付完成
			KyeeMessageService.loading({
				mask: true,
				content: '处理中...',
				duration: 50000
			});
		    //跳转页面清除数据
			var scConsultId = ConsultOrderDetailService.consultOrderID = $scope.consultParam.scConsultId,
				param = {
					scConsultId: scConsultId
				};
			ConsultOrderDetailService.isShowLoading = false;
            ConsultOrderDetailService.getOrderDetail(function (response) {
            	if (response.success) {
            		var orderState = response.data.orderState;
            			router = ConsultationOrderService.getNextRouterByOrderState(orderState);
            		if (orderState !== 0) {
            			$state.go(router);
            			return;
            		}
            	}
    			$scope.countTimeout = 0; //定时器执行次数计数
    	 		$scope.payTypeValue = -1;
    	 		$scope.payIsHandlering = true;
    	 		ConsultPayService.changePayStateToHandlering(param);
    			getOrderState();
            }, function(){
            	$scope.countTimeout = 0; //定时器执行次数计数
           		$scope.payTypeValue = -1;
           		$scope.payIsHandlering = true;
            	ConsultPayService.changePayStateToHandlering(param);
        		getOrderState();
            });
		    PayOrderService.payData = undefined;
		}
	};

	/**
	 * [getOrderState 定时获取订单状态]
	 * @return {[type]} [description]
	 */
	function getOrderState(){
		$scope.orderTimeOut = $timeout(function(){
			ConsultOrderDetailService.consultOrderID = $scope.consultParam.scConsultId;
			ConsultOrderDetailService.isShowLoading = false;
            ConsultOrderDetailService.getOrderDetail(function (response) {
            	if (response.success) {
            		var orderState = response.data.orderState,
            			router = ConsultationOrderService.getNextRouterByOrderState(orderState);
	            	if (orderState != 0) {
            			$state.go(router);
            			return;
            		}
            	}
            	if (++$scope.countTimeout >= 30){  //等待超过30s
            		$ionicLoading.hide();
            		$state.go("consultation_order");    //跳转至订单详情页
            	} else {
        			getOrderState();
        		}
            }, function(){
            	if (++$scope.countTimeout >= 30){  //等待超过30s
            		$state.go("consultation_order");
            	} else {
            		getOrderState();
            	}
            });
		}, 1000);
	}

	/**
	 * [页面离开的监听]
	 * @param  {[type]} evt                [description]
	 * @return {[type]} data                [description]
	 */
	$scope.$on("$ionicView.leave", function(event, data){
		if ($scope.orderTimeOut) {
			$timeout.cancel($scope.orderTimeOut);
			$scope.orderTimeOut = null;
		}
		ConsultPayService.order = null;
		ConsultPayService.orderNo = null;
	});
})
.build();