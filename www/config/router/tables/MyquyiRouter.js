var MYQUYI_ROUTER_TABLE = {
    "myquyi->MAIN_TAB": {
        url: "/myquyi->MAIN_TAB",
        cache:'false',
        views: {
            "main_view": {
                templateUrl: "modules/business/myquyi/index.html",
                controller: "MyquyiController"
            }
        }
    },
    "change_setting": {
        url: "/change_setting",
        views: {
            "main_view": {
                templateUrl: "modules/business/myquyi/views/change_setting.html",
                controller: "ChangeSettingController"
            }

        }
    },
    //修改本路由名时，注意修改MyquyiService中
    // doShowMyquyiView方法中的routerMap
    "myquyi->MAIN_TAB.medicalGuide": {
        url: "/medicalGuide",
        views: {
            "myquyiSubview@myquyi->MAIN_TAB": {
                templateUrl: "modules/business/myquyi/views/medical_guide.html",
                controller: "MedicalGuideController"
            }
        }
    },
    /*begin 住院业务*/
    //修改本路由名时，注意修改MyquyiService中
    // doShowMyquyiView方法中的routerMap
    //住院业务首页
    "myquyi->MAIN_TAB.inpatientBusiness": {
        url: "/inpatientBusiness",
        views: {
            "myquyiSubview@myquyi->MAIN_TAB": {
                templateUrl: "modules/business/myquyi/views/inpaitent_business.html",
                controller: "inpatientBusinessController"
            }
        }
    },
    /*end 住院业务*/
    //修改本路由名时，注意修改MyquyiService中
    // doShowMyquyiView方法中的routerMap
    "careDoctors": {
        url: "/careDoctors",
        views: {
            "main_view": {
                templateUrl: "modules/business/myquyi/views/my_care_doctors.html",
                controller: "MyCareDoctorsController"
            }
        }
    }

};