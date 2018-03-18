var REPORT_ROUTER_TABLE = {
    //我的报告单开始
    "report" : {
        url: "/report",
        views : {
            "main_view" : {
                templateUrl: "modules/business/report/index.html",
                controller: "ReportMainController"
            }
        }
    },
    //我的报告单结束

    //检验单详情
    "inspectiondetail" : {
        url: "/inspectiondetail",
        views : {
            "main_view": {
                templateUrl: "modules/business/report/views/inspection_detail.html",
                controller: "InspectionDetailController"
            }
        }
    },

    //检查单详情
    "check_detail" : {
        url: "/check_detail",
        views : {
            "main_view": {
                templateUrl: "modules/business/report/views/check_detail.html",
                controller: "CheckDetailController"
            }
        }
    },

    //C端首页公告跳转检查单
    "notice_check" : {
        url: "/notice_check",
        views : {
            "main_view": {
                templateUrl: "modules/business/report/views/notice_check.html",
                controller: "CheckController"
            }
        }
    },
    //C端首页公告跳转检验单
    "notice_inspection" : {
        url: "/notice_inspection",
        views : {
            "main_view": {
                templateUrl: "modules/business/report/views/notice_inspection.html",
                controller: "InspectionController"
            }
        }
    }
};