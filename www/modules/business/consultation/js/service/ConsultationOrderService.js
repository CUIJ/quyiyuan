/**
 * 产品名称 quyiyuan
 * 创建用户: dangliming
 * 日期: 2017/04/26
 * 创建原因：图文咨询-我的订单service
 */
new KyeeModule()
	.group("kyee.quyiyuan.consultation.order.service")
	.require([])
	.type("service")
	.name("ConsultationOrderService")
	.params(["KyeeMessagerService", "HttpServiceBus", "KyeeI18nService"])
	.action(function (KyeeMessagerService, HttpServiceBus, KyeeI18nService) {
		return {

			order: null,	//跳转至订单详情页时需缓存的订单数据
            scConsultId: null,//删除订单的ID
			/**
			 * 获取我的订单列表
			 */
			getOrderList: function (param, success, fail) {
				HttpServiceBus.connect({
					url: 'third:pay_consult/order/list',
					params: {
						userVsId: param.userVsId
					},
					onSuccess: function (response) {
						typeof success === 'function' && success(response);
					},
					onError: function (error) {
						typeof fail === 'function' && fail(error);
					}
				});
			},

            /**
             * by jiangpin 订单删除接口
             * @param onSuccess
             * @param onError
             */
            deleteOrder: function (onSuccess, onError) {
                HttpServiceBus.connect({
                    url: 'third:pay_consult/order/delete',
                    params: {
                        scConsultId: this.scConsultId,
                    },
                    onSuccess: function (retVal) {
                        onSuccess && onSuccess(retVal);
                    },
                    onError: function (retVal) {
                        onError && onError(retVal);
                    }
                });
            },
			
			/**
			 * [getNextRouterByOrderState 根据订单状态 获取下一个要去的页面]
			 * @param  {[type]} state [description]
			 * @return {[type]}       [description]
			 */
			getNextRouterByOrderState: function(state){
				//1,2,3,7,8,10状态跳转至等待接诊页面
				if (state === 1 || state === 2 || state === 3 || state === 7 || state === 8 || state === 10){
					return "wait_chatting";
				} else if (state === 4 || state === 5 || state === 6 || state === 9){
					//4,5,6,9状态跳转至订单详情页
					return "consult_order_detail";
				} else if (state === 0) {  //待支付 跳转至支付页面
					return "consult_pay";
				}
			}
		};
	})
	.build();