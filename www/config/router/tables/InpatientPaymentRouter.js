/*
 * 产品名称：quyiyuan
 * 创建人: 程铄闵
 * 创建日期:2015/9/2
 * 创建原因：我的钱包下的住院业务
 */

var INPATIENT_PAYMENT_ROUTER = {
    //每日清单查询
    "inpatient_payment_query": {
        url: "/inpatient_payment_query",
        cache:false,
        views: {
            "main_view": {
                templateUrl: "modules/business/my_wallet/inpatient_payment/views/inpatient_payment_query.html",
                controller: "InpatientPaymentQueryController"
            }
        }
    },
    //每日清单
    "inpatient_payment_record": {
        url: "/inpatient_payment_record",
        views: {
            "main_view": {
                templateUrl: "modules/business/my_wallet/inpatient_payment/views/inpatient_payment_record.html",
                controller: "InpatientPaymentRecordController"
            }
        }
    },
    //每日清单详情
    "inpatient_payment_detail": {
        url: "/inpatient_payment_detail",
        views: {
            "main_view": {
                templateUrl: "modules/business/my_wallet/inpatient_payment/views/inpatient_payment_detail.html",
                controller: "InpatientPaymentDetailController"
            }
        }
    },
    //住院历史记录
    "inpatient_paid_record": {
        url: "/inpatient_paid_record",
        views: {
            "main_view": {
                templateUrl: "modules/business/my_wallet/inpatient_payment/views/inpatient_paid_record.html",
                controller: "InpatientPaidRecordController"
            }
        }
    },
    //住院历史记录详情
    "inpatient_paid_detail": {
        url: "/inpatient_paid_detail",
        views: {
            "main_view": {
                templateUrl: "modules/business/my_wallet/inpatient_payment/views/inpatient_paid_detail.html",
                controller: "InpatientPaidDetailController"
            }
        }
    },
    //住院历史记录
    "inpatient_general": {
        url: "/inpatient_general",
        views: {
            "main_view": {
                templateUrl: "modules/business/my_wallet/inpatient_payment/views/general/inpatient_general.html",
                controller: "InpatientGeneralController"
            }
        }
    },
    //住院历史记录
    "inpatient_general_query": {
        url: "/inpatient_general_query",
        views: {
            "main_view": {
                templateUrl: "modules/business/my_wallet/inpatient_payment/views/general/inpatient_general_query.html",
                controller: "InpatientGeneralQueryController"
            }
        }
    },
    //从就医记录跳到每日清单
    "myquyi_inpatient_payment": {
        url: "/myquyi_inpatient_payment",
        views: {
            "main_view": {
                templateUrl: "modules/business/my_wallet/inpatient_payment/views/myquyi_inpatient_payment.html",
                controller: "MyquyiInpatientPaymentController"
            }
        }
    }
};
