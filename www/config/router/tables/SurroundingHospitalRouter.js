/**
 * 周边医院
 * @type {{surrounding_hospital: {url: string, views: {main_view: {templateUrl: string, controller: string}}}}}
 */
var SURROUNDING_HOSPITAL_ROUTER_TABLE={
    "surrounding_hospital" : {
        url: "/surrounding_hospital",
        views:{
            "main_view":{
                templateUrl: "modules/business/surrounding_hospital/index.html",
                controller : "SurroundingHospitalController"
            }
        }
    },
    "detail_map":{
        url: "/detail_map",
        views:{
            "main_view":{
                templateUrl: "modules/business/surrounding_hospital/views/detail_map.html",
                controller : "DetailMapController"
            }
        }
    },
    "homeClinic":{
        url: "/homeClinic",
        views:{
            "main_view":{
                templateUrl: "modules/business/surrounding_hospital/views/home_clinic.html",
                controller : "HomeClinicController"
            }
        }
    }

};