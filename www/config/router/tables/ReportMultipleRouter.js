var REPORT_MULTIPLE_ROUTER_TABLE = {
    //检查检验单初始化页面
    "report_multiple" : {
        url: "/report_multiple",
        views : {
            "main_view" : {
                templateUrl: "modules/business/report_multiple/index.html",
                controller: "ReportMultipleController"
            }
        }
    },
    //检验单明细
    "lab_detail":{
        url:"/lab_detail",
        views:{
            "main_view":{
                templateUrl:"modules/business/report_multiple/views/lab_detail.html",
                controller:"LabDetailMultipleController"
            }
        }
    },
    //j检查单明细
    "exam_detail":{
        url:"/exam_detail",
        views:{
            "main_view":{
                templateUrl:"modules/business/report_multiple/views/exam_detail.html",
                controller:"ExamDetailMultipleController"
            }
        }
    },
    //根据就诊卡号查询检查检验单
    "mulreport_query_by_card":{
        url:"/mulreport_query_by_card",
        views:{
            "main_view":{
                templateUrl:"modules/business/report_multiple/views/query_by_card.html",
                controller:"ReportMultipleQueryByCardController"
            }
        }
    },
    //报告单详情页
    "details_page":{
        url:"/details_page",
        views:{
            "main_view":{
                templateUrl:"modules/business/report_multiple/views/details_page.html",
                controller:"DetailsPageController"
            }
        }
    },
    //添加住院号
    "add_inpatient_number":{
        url:"/add_inpatient_number",
        views:{
            "main_view":{
                templateUrl:"modules/business/report_multiple/views/add_inpatient_number.html",
                controller:"AddInpatientNumberController"
            }
        }
    },
    //检查检验单初始化页面for医院
    "index_hosp":{
        url:"/index_hosp",
        views:{
            "main_view":{
                templateUrl:"modules/business/report_multiple/index_hosp.html",
                controller:"ReportMultipleHospController"
            }
        }
    }



};