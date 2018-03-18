var HEALTH_MANAGE_TABLE = {
    "weight_manage": {
        url: "/weight_manage",
        views: {
            "main_view": {
                templateUrl: "modules/business/health_serve/views/health_manage/weight_manage.html",
                controller: "WeightManageController"
            }
        }
    },
    "weight_add": {
        url: "/weight_add",
        views: {
            "main_view": {
                templateUrl: "modules/business/health_serve/views/health_manage/weight_add.html",
                controller: "WeightAddController"
            }
        }
    },
    "weight_standard": {
        url: "/weight_standard",
        views: {
            "main_view": {
                templateUrl: "modules/business/health_serve/views/health_manage/weight_standard.html",
                controller: "WeightStandardController"
            }
        }
    },
    "blood_sugar_standard": {
        url: "/blood_sugar_standard",
        views: {
            "main_view": {
                templateUrl: "modules/business/health_serve/views/health_manage/blood_sugar_standard.html",
                controller: "BloodSugarStandardController"
            }
        }
    },
    "blood_pressure_standard": {
        url: "/blood_pressure_standard",
        views: {
            "main_view": {
                templateUrl: "modules/business/health_serve/views/health_manage/blood_pressure_standard.html",
                controller: "BloodPressureStandardController"
            }
        }
    }
}