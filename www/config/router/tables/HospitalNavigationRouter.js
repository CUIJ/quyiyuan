/**
 *产品名称：quyiyuan
 *创建者：杜巍巍
 *任务号：KYEEAPPC-3461
 *创建时间：2015/9/1
 *创建原因：院内导航路由
 *修改者：
 *修改原因：
 *
 */
var HOSPITAL_NAVIGATION_ROUTER_TABLE = {
    "hospital_navigation": {
        url: "/hospital_navigation",
        cache:'false',
        views: {
            "main_view": {
                templateUrl: "modules/business/hospital_navigation/index.html",
                controller: "HospitalNavigationController"

            }

        }
    },
    "navigation_deptinfo": {
        url: "/navigation_deptinfo",
        views: {
            "main_view": {
                templateUrl: "modules/business/hospital_navigation/views/navigation_deptInfo.html",
                controller: "NavigationDeptInfoController"
            }

        }
    },
    "navigation_departmentInfo": {
        url: "/navigation_departmentInfo",
        views: {
            "main_view": {
                templateUrl: "modules/business/hospital_navigation/views/navigation_departmentInfo.html",
                controller: "NavigationDepartmentInfoController"
            }
        }
    },
    "navigation_out": {
        url: "/navigation_out",
        views: {
            "main_view": {
                templateUrl: "modules/business/hospital_navigation/views/navigation_out.html",
                controller: "OutNavigationController"
            }
        }
    },
    "department_column": {
        url: "/department_column",
        views: {
            "main_view": {
                templateUrl: "modules/business/hospital_navigation/views/department_column.html",
                controller: "DepartmentcolumnController"
            }
        }
    }
};