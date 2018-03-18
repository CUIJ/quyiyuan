var TRIAGE_ROUTER_TABLE = {
    //自我诊断
    "triage" : {
        url: "/triage",
        views:{
            "main_view" : {
                templateUrl: "modules/business/triage/index.html",
                controller : "TriageMainController"
            },
            "triage-main@triage":{
                templateUrl: "modules/business/triage/views/triage_pic.html",
                controller : "TriagePicController"
            }
        }
    },
    //图片导诊
    "triageMain" : {
        url: "/triageMain",
        views:{
            "main_view" : {
                templateUrl: "modules/business/triage/views/triage_pic.html",
                controller : "TriagePicController"
            }
        }
    },
    //列表导诊
    "triage.triageList" : {
        url: "/triageList",
        views:{
            "triage-main" : {
                templateUrl: "modules/business/triage/views/triage_list.html",
                controller : "BodySymptomListController"
            }
        }
    },
    //身体小部位及主症状列表
    "bodySymptomList" : {
        url: "/bodySymptomList",
        views:{
            "main_view" : {
                templateUrl: "modules/business/triage/views/body_symptom_list.html",
                controller : "BodySymptomListController"
            }
        }
    },
    //起病列表
    "onSetList" : {
        url: "/onSetList",
        views:{
            "main_view" : {
                templateUrl: "modules/business/triage/views/onset_list.html",
                controller : "OnSetListController"
            }
        }
    },
    //辅症状列表
    "auxiliarySymptomList" : {
        url: "/auxiliarySymptomList",
        views:{
            "main_view" : {
                templateUrl: "modules/business/triage/views/auxiliary_symptom_list.html",
                controller : "AuxiliarySymptomListController"
            }
        }
    },
    //查看疾病并且选择科室
    "DiagnosticResult" : {
        url: "/DiagnosticResult",
        views:{
            "main_view" : {
                templateUrl: "modules/business/triage/views/diagnostic_result.html",
                controller : "DiagnosticResultController"
            }
        }
    },
    //查看疾病推荐选择科室
    "diagnosticInfo" : {
        url: "/diagnosticInfo",
        views:{
            "main_view" : {
                templateUrl: "modules/business/triage/views/diagnostic_info.html",
                controller : "DiagnosticInfoController"
            }
        }
    },
    //疾病详情
    "diagnosticDetail" : {
        url: "/diagnosticDetail",
        views:{
            "main_view" : {
                templateUrl: "modules/business/triage/views/diagnostic_detail.html",
                controller : "DiagnosticDetailController"
            }
        }
    },
    //选择科室
    "triageSelectDept" : {
        url: "/triageSelectDept",
        views:{
            "main_view" : {
                templateUrl: "modules/business/triage/views/select_dept.html",
                controller : "TriageSelectDeptController"
            }
        }
    }
};