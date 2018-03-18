/*
 * 产品名称：quyiyuan
 * 创建人: 程铄闵
 * 创建日期:2016/5/10
 * 创建原因：迁出门诊缴费路由
 * 任务号：KYEEAPPC-6170
*/
var CLINIC_PAYMENT_ROUTER = {
    //门诊业务
    "clinicPayment" : {
        url: "/clinicPayment",
        views:{
            "main_view" : {
                templateUrl: "modules/business/my_wallet/clinic_payment/index.html",
                controller : "ClinicPaymentController"
            }
        }
    },
    //新版门诊业务
    "clinic_payment_revise" : {
        url: "/clinic_payment_revise",
        views:{
            "main_view" : {
                templateUrl: "modules/business/my_wallet/clinic_payment/views/clinic_payment_revise.html",
                controller : "ClinicPaymentReviseController"
            }
        }
    },
    //新版门诊业务
    "clinic_payment_hos" : {
        url: "/clinic_payment_hos",
        views:{
            "main_view" : {
                templateUrl: "modules/business/my_wallet/clinic_payment_hos/views/clinic_payment_revise_hos.html",
                controller : "ClinicPaymentReviseHosController"
            }
        }
    },
    //已缴费用
    "clinicPaid" : {
        url: "/clinicPaid",
        views:{
            "main_view" : {
                templateUrl: "modules/business/my_wallet/clinic_payment/views/clinic_paid.html",
                controller : "ClinicPaidController"
            }
        }
    },
    //已缴费用
    "clinicPaidHos" : {
        url: "/clinicPaid",
        views:{
            "main_view" : {
                templateUrl: "modules/business/my_wallet/clinic_payment_hos/views/clinic_paid_hos.html",
                controller : "ClinicPaidHosController"
            }
        }
    },
    //已缴费用详情
    "paid_record" : {
        url: "/paid_record",
        views:{
            "main_view" : {
                templateUrl: "modules/business/my_wallet/clinic_payment/views/delay_views/paid_record.html",
                controller : "PaidRecordController"
            }
        }
    },
    //待缴费查询 KYEEAPPC-4451 程铄闵
    "clinic_payment_query" : {
        url: "/clinic_payment_query",
        views:{
            "main_view" : {
                templateUrl: "modules/business/my_wallet/clinic_payment/views/clinic_payment_query.html",
                controller : "ClinicPaymentQueryController"
            }
        }
    },
    //已缴费查询 KYEEAPPTEST-3186 程铄闵
    "clinic_paid_query" : {
        url: "/clinic_paid_query",
        views:{
            "main_view" : {
                templateUrl: "modules/business/my_wallet/clinic_payment/views/clinic_paid_query.html",
                controller : "ClinicPaidQueryController"
            }
        }
    },
    //已缴费消息记录 KYEEAPPC-7609 程铄闵
    "clinic_paid_message" : {
        url: "/clinic_paid_message",
        views:{
            "main_view" : {
                templateUrl: "modules/business/my_wallet/clinic_payment/views/clinic_paid_message.html",
                controller : "ClinicPaidMessageController"
            }
        }
    }
};