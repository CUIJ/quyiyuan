var PAYMENT_ROUTER_TABLE = {
    //支付订单
    "payOrder" : {
        url: "/payOrder",
        views:{
            "main_view" : {
                templateUrl: "modules/business/payment/views/pay_order.html",
                controller : "PayOrderController"
            }
        }
    },
    //药都银行支付确认页面
    "payConfirm" : {
        url: "/payConfirm",
        views:{
            "main_view" : {
                templateUrl: "modules/business/payment/views/pay_confirm.html",
                controller : "PayConfirmController"
            }
        }
    },
    //药都银行支付结果页面
    "payResult" : {
        url: "/payResult",
        views:{
            "main_view" : {
                templateUrl: "modules/business/payment/views/pay_result.html",
                controller : "PayResultController"
            }
        }
    },
    //银行通用网页支付
    "webPay" : {
        url: "/webPay",
        views:{
            "main_view" : {
                templateUrl: "modules/business/payment/views/web_pay.html",
                controller : "WebPayController"
            }
        }
    }
};