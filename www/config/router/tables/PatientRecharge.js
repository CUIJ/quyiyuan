var PATIENT_RECHARGE = {
    //就诊卡充值
    "wallet_card_recharge" : {
        url: "/patient_recharge",
        views:{
            "main_view" : {
                templateUrl: "modules/business/patient_recharge/index.html",
                controller : "patientRechargeController"
            }
        }
    },
    //就诊卡充值记录
    "recharge_records" : {
        url: "/recharge_records",
        views:{
            "main_view" : {
                templateUrl: "modules/business/patient_recharge/views/recharge_records.html",
                controller : "RechargeRecordsController"
            }
        }
    }
};