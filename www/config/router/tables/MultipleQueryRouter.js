var MULTIPLE_QUERY_ROUTER_TABLE = {

     // 模糊查询页面
    "multiple_query" : {
        url: "/multiple_query",
        views:{
            "main_view":{
                templateUrl: "modules/business/multiplequery/index.html",
                controller : "MultipleQueryController"
            },
            "multiple_query_list_view@multiple_query":{
                templateUrl: "modules/business/multiplequery/views/multiple_query.html"
            }
        }
    },
    // 更多医生列表
    "multiple_query.multiple_doctorInfo" : {
        url: "/multiple_doctorInfo",
        views:{
            "multiple_query_list_view":{
                templateUrl: "modules/business/multiplequery/views/multiple_doctorinfo.html",
                controller : "MultipleDoctorInfoController"
            }
        }
    },
    // 更多科室列表
    "multiple_query.multiple_deptInfo" : {
        url: "/multiple_deptInfo",
        views: {
            "multiple_query_list_view":{
                templateUrl: "modules/business/multiplequery/views/multiple_deptInfo.html",
                controller: "MultipleDeptInfoController"
            }
        }
    },
    //当前医院搜索信息
    "multiple_query.multiple_current_info" : {
        url: "/multiple_current_info",
        views: {
            "multiple_query_list_view": {
                templateUrl: "modules/business/multiplequery/views/multiple_current_info.html",
                controller: "CurrentMultipleInfoController"
            }
        }
    },
    // 更多医院列表
    "multiple_query.multiple_hospitalInfo" : {
        url: "/multiple_hospitalInfo",
        views: {
            "multiple_query_list_view":{
                templateUrl: "modules/business/multiplequery/views/multiple_hosptialInfo.html",
                controller: "MultipleHospitalInfoController"
            }
        }
    },
    //疾病列表
    "multiple_query.disease_list_query" : {
        url: "/disease_list_query",
        views: {
            "multiple_query_list_view":{
                templateUrl: "modules/business/multiplequery/views/disease_list_query.html",
                controller: "DiseaseListController"
            }
        }
    },
    //疾病详情查询
    "multiple_query.disease_info_query" : {
        url: "/disease_info_query",
        views: {
            "multiple_query_list_view":{
                templateUrl: "modules/business/multiplequery/views/disease_info_query.html",
                controller: "DiseaseInfoQueryController"
            }
        }
    },

    // 城市定位页面
    "multiple_city_list" : {
        url: "/multiple_city_list",
        views: {
            "main_view": {
                templateUrl: "modules/business/multiplequery/views/multiple_city_list.html",
                controller: "MultipleQueryCityController"
            }
        }
    },
    //疾病详情
    "disease_info" : {
        url: "/disease_info",
        views: {
            "main_view": {
                templateUrl: "modules/business/multiplequery/views/disease_info.html",
                controller: "DiseaseInfoController"
            }
        }
    }
};