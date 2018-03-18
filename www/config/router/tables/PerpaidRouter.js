var PREPAID_ROUTER_TABLE = {
    //预交金充值
    "perpaid" : {
        url: "/perpaid",
        views:{
            "main_view" : {
                templateUrl: "modules/business/my_wallet/perpaid/index.html",
                controller : "PerpaidController"
            }
        }
    },
    "perpaid_pay_info" : {
        url: "/perpaid_pay_info",
        views:{
            "main_view" : {
                templateUrl: "modules/business/my_wallet/perpaid/views/perpaid_pay_info.html",
                controller : "PerpaidPayInfoController"
            }
        }
    },
    "perpaid_record" : {
        url: "/perpaid_record",
        views:{
            "main_view" : {
                templateUrl: "modules/business/my_wallet/perpaid/views/perpaid_record.html",
                controller : "PerpaidRecordController"
            }
        }
    }
};