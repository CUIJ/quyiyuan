var HOME_ROUTER_TABLE = {
    "seletAppointDate" : {
        url: "/seletAppointDate",
        views:{
            "main_view":{
                templateUrl: "modules/business/home/views/selectAppointDate.html",
                controller : "SelectAppointDateController"
            }
        }
    },
    //广告web链接页面
    "homeWeb":{
        url: "/homeWeb",
        views:{
            "main_view":{
                templateUrl: "modules/business/home/views/home_web.html",
                controller : "HomeWebController"
            }
        }
    },
    //广告html页面
    "homeHtml":{
        url: "/homeHtml",
        views:{
            "main_view":{
                templateUrl: "modules/business/home/views/home_html.html",
                controller : "HomeHtmlController"
            }
        }
    },
    //我的保险调用链接页面
    "homeWebNoTitle":{
        url: "/homeWebNoTitle",
        views:{
            "main_view":{
                templateUrl: "modules/business/home/views/home_web_no_title.html",
                controller : "homeWebNoTitleController"
            }
        }
    },

    "insuranceWeb":{
        url: "/insuranceWeb",
        views:{
            "main_view":{
                templateUrl: "modules/business/home/views/insurance_web.html",
                controller : "InsuranceWebController"
            }
        }
    },
    "service_satisfaction":{
        url: "/service_satisfaction",
        views:{
            "main_view":{
                templateUrl: "modules/business/home/views/service_satisfaction.html",
                controller : "ServiceSatisfactionController"
            }
        }
    }
};