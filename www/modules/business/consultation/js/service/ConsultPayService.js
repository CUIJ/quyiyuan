/**
 * 产品名称 quyiyuan
 * 创建用户: dangliming
 * 日期: 2017年5月26日14:40:54
 * 创建原因：付费咨询-支付页面service
 */
new KyeeModule()
	.group("kyee.quyiyuan.consultation.consult_pay.service")
	.type("service")
	.name("ConsultPayService")
	.params(["KyeeMessagerService", "HttpServiceBus", "KyeeMessageService"])
	.action(function (KyeeMessagerService, HttpServiceBus, KyeeMessageService) {
		return {
			orderNo: null,  //创建的订单号

			order: null,    //订单信息

			/**
			 * [consultParam 支付页面所需的参数]
			 * @type {Object}
			 */
			consultParam: {
				hospitalId: "",
				payDueDate: "",
				qyOrderNo: "",
				scConsultId: 0,
				isNeedPay: 0,
				acceptDueTime: ""
			},
			/**
			 * [getPayTypeList 获取支付方式 参考链接http://w.quyiyuan.com/pages/viewpage.action?pageId=23374133]
			 * @param  {[type]} params  [description]
			 * @param  {[type]} success [description]
			 * @param  {[type]} fail    [description]
			 * @return {[type]}         [description]
			 */
			getPayTypeList: function(params, success, fail){
				HttpServiceBus.connect({
					url: "/payment/action/PaymentActionC.jspx",
					params: {
						op: "getPayMethodForSuffCircle",
						hospitalId: params.hospitalId,  //该医院的hospitalId
						modeCode: params.modeCode || "09",  	//09-付费咨询
						orderNo: params.orderNo			//订单号
					},
					onSuccess: function(response){
						if (response.success) {
							typeof success === 'function' && success(response);
						} else {
							KyeeMessageService.broadcast({
								content: response.message
							});
						}
					},
					onError: function(error){
						typeof fail === 'function' && fail(error);
					}
				});
			},

            /**
             * by jiangpin 2017年8月9号11:17 任务号： KYEEAPPC-11834
             * [choosePaymentReminder 获取'选择支付方式'页面提示语]
             * @param  {[type]} param   [description]
             * @param  {[type]} success [description]
             * @param  {[type]} fail    [description]
             * @return {[type]}         [description]
             */
            choosePaymentReminder:function(params, success, fail){
                HttpServiceBus.connect({
                    url:"third:pay_consult/reminder/pay",
                    params:{
                        hospitalId: params,
                    },
                    onSuccess:function (response) {
                        if(response.success){
                            typeof success === 'function' && success(response);
                        }else{
                            KyeeMessagerService.broadcast({
                                content: response.message
                            });
                        }
                    },
                    onError:function (error) {
                        typeof fail === 'function' && fail(error);
                    }
                });
            },

			/**
			 * [checkOrderIsPayAvaliable 获取订单能否支付接口]
			 * @param  {[type]} param   [description]
			 * @param  {[type]} success [description]
			 * @param  {[type]} fail    [description]
			 * @return {[type]}         [description]
			 */
			checkOrderIsPayAvaliable: function(param, success, fail){
				var showLoading = param.showLoading !== false;
				HttpServiceBus.connect({
					url: "third:pay_consult/pay/available",
					params: {
						scConsultId: param.scConsultId
					},
					showLoading: showLoading,
					onSuccess: function(response){
						typeof success === 'function' && success(response);
					},
					onError: function(error){
						typeof fail === 'function' && fail(error);
					}
				});
			},

			/**
			 * [changePayStateToHandlering 将订单状态为0(待支付)的订单的支付状态(payState)改为支付处理中(6)]
			 * @param  {[type]} param   [description]
			 * @param  {[type]} success [description]
			 * @param  {[type]} fail    [description]
			 * @return {[type]}         [description]
			 */
			changePayStateToHandlering: function(param, success, fail){
				HttpServiceBus.connect({
					url: "third:pay_consult/pay/state/revert",
					params: {
						scConsultId: param.scConsultId
					},
					showLoading: Boolean(param.isShowLoading),  //默认不展示遮罩层
					onSuccess: function(response){
						typeof success === 'function' && success(response);
					},
					onError: function(error){
						typeof fail === 'function' && fail(error);
					}
				});
			}
		};
	})
	.build();