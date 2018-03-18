var HOSPITAL_ROUTER_TABLE = {

    //医院路由表
    "home->MAIN_TAB" : {
        url: "/home->MAIN_TAB",
        views:{
            "main_view":{
                templateUrl: "modules/business/hospital/index.html",
                controller : "HospitalController"
            }
        }
    },
    //医院列表
    "hospital_selector" : {
        url: "/hospital_selector",
        views:{
            "main_view":{
                templateUrl: "modules/business/hospital/views/hospital_selector.html",
                controller : "HospitalSelectorController"
            }
        }
    },

    //医院简介
    "hospital_detail" : {
        url: "/hospital_detail",
        views:{
            "main_view":{
                templateUrl: "modules/business/hospital/views/hospital_detail.html",
                controller : "HospitalDetailController"
            }
        }
    },
    //医院详情
    "hospital_web" : {
        url: "/hospital_web",
        views:{
            "main_view":{
                templateUrl: "modules/business/hospital/views/hospital_web.html",
                controller : "HospitalWebController"
            }
        }
    },
    "hospital_introduce":{
        url:"/hospital_introduce",
        views:{
            "main_view":{
                templateUrl:"modules/business/hospital/views/hospital_introduce.html",
                controller:"HospitalIntroduceController"
            }
        }
    },
    //诊所简介
    "clinic_introduce":{
        url:"/clinic_introduce",
        views:{
            "main_view":{
                templateUrl:"modules/business/hospital/views/clinic_introduce.html",
                controller:"ClinicIntroduceController"
            }
        }
    }
};