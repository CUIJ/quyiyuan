var HEALTH_CARD_ROUTER_TABLE = {
    "healthCard" : {
        url: "/healthCard",
        views: {
            "main_view": {
                templateUrl: "modules/business/healthCard/index.html",
                controller : "HealthCardController"
            }
        }
    },
    "supportHospital" : {
        url: "/supportHospital",
        views: {
            "main_view": {
                templateUrl: "modules/business/healthCard/views/supportHospital.html",
                controller : "SupportHospitalController"
            }
        }
    },
    "healthCardPay" : {
        url: "/healthCardPay",
        views: {
            "main_view": {
                templateUrl: "modules/business/healthCard/views/healthCardPay.html",
                controller : "HealthCardPayController"
            }
        }
    }
};