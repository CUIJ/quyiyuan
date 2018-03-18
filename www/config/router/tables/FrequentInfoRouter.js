//个人中心/常用信息
var FREQUENT_INFO_ROUTER_TABLE = {

    "frequent_info" : {
        url: "/frequent_info",
        views: {
            "main_view": {
                templateUrl: "modules/business/frequent_info/index.html",
                controller : "FrequentInfoController"
            }
        }
    },

    "patient_card" : {
        url: "/patient_card",
        views: {
            "main_view": {
                templateUrl: "modules/business/frequent_info/views/patient_card/patient_card.html",
                controller : "PatientCardController"
            }
        }
    },

    "patient_card_add" : {
        url: "/patient_card_add",
        views: {
            "main_view": {
                templateUrl: "modules/business/frequent_info/views/patient_card/patient_card_add.html",
                controller : "PatientCardAddController"
            }
        }
    },

    "patient_card_city" : {
        url: "/patient_card_city",
        views: {
            "main_view": {
                templateUrl: "modules/business/frequent_info/views/patient_card/patient_card_city.html",
                controller : "PatientCardCityController"
            }
        }
    },

    "patient_card_hospital" : {
        url: "/patient_card_hospital",
        views: {
            "main_view": {
                templateUrl: "modules/business/frequent_info/views/patient_card/patient_card_hospital.html",
                controller : "PatientCardHospitalController"
            }
        }
    },
    "patient_card_type" : {
        url: "/patient_card_type",
        views: {
            "main_view": {
                templateUrl: "modules/business/frequent_info/views/patient_card/patient_card_type.html",
                controller : "PatientCardTypeController"
            }
        }
    },

    "patient_card_edit" : {
        url: "/patient_card_edit",
        views: {
            "main_view": {
                templateUrl: "modules/business/frequent_info/views/patient_card/patient_card_edit.html",
                controller : "PatientCardEditController"
            }
        }
    },

    "patient_card_select" : {
        url: "/patient_card_select",
        cache:'false',
        views: {
            "main_view": {
                templateUrl: "modules/business/frequent_info/views/patient_card/patient_card_select.html",
                controller : "PatientCardSelectController"
            }
        }
    },

    //就诊者实名修改（APK）  By  张家豪  KYEEAPPC-4434
    "my_qr_code" : {
        url: "/my_qr_code",
        views: {
            "main_view": {
                templateUrl: "modules/business/center/views/update_user/qr_code.html",
                controller : "QrCodeController"
            }
        }
    }

};