var HEALTH_SERVE_TABLE = {
    "health->MAIN_TAB" : {
        url: "/health->MAIN_TAB",
        views:{
            "main_view":{
                templateUrl: "modules/business/health_serve/index.html",
                controller : "HealthController"
            }
        }
    },
    "health_consultation_list" : {
        url: "/health_consultation_list",
        views:{
            "main_view":{
                templateUrl: "modules/business/health_serve/views/health_consultation_list.html",
                controller : "HealthConsultationListController"
            }
        }
    },
    "health_consultation_detail" : {
        url: "/health_consultation_detail",
        views:{
            "main_view":{
                templateUrl: "modules/business/health_serve/views/health_consultation_detail.html",
                controller : "HealthConsultationDetailController"
            }
        }
    },
    //个人健康管理
    "health_manage" : {
        url: "/health_manage",
        views: {
            "main_view": {
                templateUrl: "modules/business/health_serve/views/health_manage/manage_home.html",
                controller : "HealthManageHomeController"
            }
        }
    },
    "health_nurse_service":{
      url:"/health_nurse_service"  ,
      views:{
          "main_view":{
              templateUrl:"modules/business/health_serve/views/health_nurse_service.html",
              controller:"HealthNurseServiceController"
          }
      }
    }
};