/*
 * 产品名称：quyiyuan
 * 创建人: 程铄闵
 * 创建日期:2015/7/7
 * 创建原因：体检单
 */

var MEDICAL_ROUTER_TABLE = {
    //体检单首页
    "medical": {
        url: "/medical",
        views: {
            "main_view": {
                templateUrl: "modules/business/medical/index.html",
                controller: "MedicalController"
            }
        }
    },
    //体检单详情
    "medical_detail": {
        url: "/medical_detail",
        views: {
            "main_view": {
                templateUrl: "modules/business/medical/views/medical_detail.html",
                controller: "MedicalDetailController"
            }
        }
    },
    //医学声明
    "medical_statement": {
        url: "/medical_statement",
        views: {
            "main_view": {
                templateUrl: "modules/business/medical/views/medical_statement.html",
                controller: "MedicalStatementController"
            }
        }
    },
    //跨院体检单 KYEEAPPC-5391
    "my_medical":{
        url: "/my_medical",
        views: {
            "main_view": {
                templateUrl: "modules/business/medical/index.html",
                controller: "MedicalController"
            }
        }
    }
};