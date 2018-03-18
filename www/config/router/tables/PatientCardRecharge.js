var PATIENT_CARD_RECHARGE_TABLE = {
    //就诊卡充值(2.1.60版后) KYEEAPPC-5217 程铄闵
    "patient_card_recharge": {
        url: "/patient_card_recharge",
        views: {
            "main_view": {
                templateUrl: "modules/business/patient_card_recharge/index.html",
                controller: "PatientCardRechargeController"
            }
        }
    },
    //就诊卡充值记录(2.1.60版后) KYEEAPPC-8088 程铄闵 2.3.10充值功能改版
    "patient_card_records": {
        url: "/patient_card_records",
        cache:false,
        views: {
            "main_view": {
                templateUrl: "modules/business/patient_card_recharge/views/patient_card_records.html",
                controller: "PatientCardRecordsController"
            }
        }
    },
    //就诊卡充值确认信息(2.1.60版后)
    "card_recharge_confirm": {
        url: "/card_recharge_confirm",
        views: {
            "main_view": {
                templateUrl: "modules/business/patient_card_recharge/views/card_recharge_confirm.html",
                controller: "CardRechargeConfirmController"
            }
        }
    },
//就诊卡申请退费记录
    "patient_card_refund": {
        url: "/patient_card_refund",
            views: {
            "main_view": {
                templateUrl: "modules/business/patient_card_recharge/views/patient_card_refund.html",
                    controller: "PatientCardRefundController"
            }
        }
    },
    "card_refund": {
        url: "/card_refund",
        views: {
            "main_view": {
                templateUrl: "modules/business/patient_card_recharge/views/delay_views/card_refund.html",
                controller: "CardRefundController"
            }
        }
    }
};