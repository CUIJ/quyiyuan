var SATISFACTION_ROUTER_TABLE = {

    //满意度主页
    "satisfaction" : {
        url: "/satisfaction",
        views: {
            "main_view": {
                templateUrl: "modules/business/satisfaction/index.html",
                controller: "SatisfactionMainController"
            }
        }
    },
    //门诊满意度页面
    "satisfaction_clinic" : {
        url: "/satisfaction_clinic",
        views: {
            "main_view": {
                templateUrl: "modules/business/satisfaction/views/satisfaction_clinic.html",
                controller: "SatisfactionClinicController"
            }
        }
    },
    //满意度选择评价页面
    "satisfaction_menu" : {
        url: "/satisfaction_menu",
        views: {
            "main_view": {
                templateUrl: "modules/business/satisfaction/views/satisfaction_menu.html",
                controller: "SatisfactionMenuController"
            },
            "satisfaction_menu_view@satisfaction_menu":{
                templateUrl: "modules/business/satisfaction/views/satisfaction_doctor.html",
                controller: "SatisfactionDoctorController"
            }
        }
    },
    //医生满意度
    "satisfaction_menu.satisfaction_doctor" : {
        url: "/satisfaction_doctor",
        views: {
            "satisfaction_menu_view": {
                templateUrl: "modules/business/satisfaction/views/satisfaction_doctor.html",
                controller: "SatisfactionDoctorController"
            }
        }
    },
    //医院满意度
    "satisfaction_menu.satisfaction_hospital" : {
        url: "/satisfaction_hospital",
        views: {
            "satisfaction_menu_view": {
                templateUrl: "modules/business/satisfaction/views/satisfaction_hospital.html",
                controller: "SatisfactionHospitalController"
            }
        }
    },
    //住院满意度页面
    "satisfaction_hospital_list" : {
        url: "/satisfaction_hospital_list",
        views: {
            "main_view": {
                templateUrl: "modules/business/satisfaction/views/hospital/satisfaction_list.html",
                controller: "HospitalListController"
            }
        }
    },
    //住院满意度选择评价页面
    "satisfaction_hospital_menu" : {
        url: "/satisfaction_hospital_menu",
        views: {
            "main_view": {
                templateUrl: "modules/business/satisfaction/views/hospital/hospital_menu.html",
                controller: "HospitalMenuController"
            },
            "satisfaction_hospital_menu_view@hospital_menu":{
                templateUrl: "modules/business/satisfaction/views/hospital/hospital_doctor.html",
                controller: "HospitalDoctorController"
            }
        }
    },
    //住院满意度医生满意度
    "satisfaction_hospital_menu.hospital_doctor" : {
        url: "/hospital_doctor",
        views: {
            "satisfaction_hospital_menu_view": {
                templateUrl: "modules/business/satisfaction/views/hospital/hospital_doctor.html",
                controller: "HospitalDoctorController"
            }
        }
    },
    //住院满意度医院满意度
    "satisfaction_hospital_menu.hospital_hospital" : {
        url: "/hospital_hospital",
        views: {
            "satisfaction_hospital_menu_view": {
                templateUrl: "modules/business/satisfaction/views/hospital/hospital_hospital.html",
                controller: "HospitalHospitalController"
            }
        }
    }
};