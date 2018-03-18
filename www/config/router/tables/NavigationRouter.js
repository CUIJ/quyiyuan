var NAVIGATION_ROUTER_TABLE = {
    "navigation": {
        url: "/navigation",
        views: {
            "main_view": {
                templateUrl: "modules/business/navigation/index.html",
                controller: "NavigationController"
            }

        }
    },
    "navigation_out": {
        url: "/navigation_out",
        views: {
            "main_view": {
                templateUrl: "modules/business/navigation/views/hospital_navigation.html",
                controller: "NavigationOutController"
            }

        }
    },
    "navigation_main": {
        url: "/navigation_main",
        views: {
            "main_view": {
                templateUrl: "modules/business/navigation/views/navigation_main.html",
                controller: "NavigationMainController"
            }

        }
    },
    "navigation_floor": {
        url: "/navigation_floor",
        views: {
            "main_view": {
                templateUrl: "modules/business/navigation/views/navigation_floor.html",
                controller: "NavigationFloorController"
            }

        }
    },
    "navigation_detail": {
        url: "/navigation_detail",
        views: {
            "main_view": {
                templateUrl: "modules/business/navigation/views/navigation_detail.html",
                controller: "NavigationDetailController"
            }

        }
    },
    "navigation_department": {
        url: "/navigation_department",
        views: {
            "main_view": {
                templateUrl: "modules/business/navigation/views/navigation_department.html",
                controller: "NavigationDepartmentController"
            }

        }
    }
};