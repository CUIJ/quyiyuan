/**
 * 产品名称 quyiyuan
 * 创建用户: 张毅
 * 日期: 2017/04/25
 * 创建原因：图文问诊等待接诊页面service
 * 修改原因：
 * 修改用户：
 * 修改时间：
 */
new KyeeModule()
    .group("kyee.quyiyuan.consultation.wait_chatting.service")
    .require([])
    .type("service")
    .name("WaitChattingService")
    .params(["HttpServiceBus", "ConsultOrderDetailService"])
    .action(function (HttpServiceBus, ConsultOrderDetailService) {
        var def = {

            // 是否跳转自等待接着页面
            isFromWaitChattingPage: false,
            /**
             * 取消订单接口
             * @param onSuccess
             * @param onError
             */
            cancelOrder: function (onSuccess, onError) {
                var me = this;
                HttpServiceBus.connect({
                    url: 'third:pay_consult/order/cancel',
                    params: {
                        scConsultId: ConsultOrderDetailService.consultOrderID
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
             * 倒计时结束时的更新接口
             * @param onSuccess
             * @param onError
             */
            updateOrder: function (onSuccess, onError) {
                var me = this;
                HttpServiceBus.connect({
                    url: 'third:pay_consult/order/overtime/doctor/update',
                    params: {
                        scConsultId: ConsultOrderDetailService.consultOrderID
                    },
                    onSuccess: function (retVal) {
                        onSuccess && onSuccess(retVal);
                    },
                    onError: function (retVal) {
                        onError && onError(retVal);
                    }
                });
            }
        };
        return def;
    })
    .build();