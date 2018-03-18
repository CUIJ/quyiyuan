var ONEKEY_CLAIM_ROUTER = {
    //一键理赔首页
    "one_quick_claim": {
        url: "/one_quick_claim",
        views: {
            "main_view": {
                templateUrl: "modules/business/onekey_claim/index.html",
                controller: "OneQuickClaimController"
            }
        }
    },
    //病历资料
    "medical_records": {
        url: "/medical_records",
        views: {
            "main_view": {
                templateUrl: "modules/business/onekey_claim/views/medical_records.html",
                controller: "MedicalRecordsController"
            }
        }
    },
    //事故资料
    "accident_records": {
        url: "/accident_records",
        views: {
            "main_view": {
                templateUrl: "modules/business/onekey_claim/views/accident_records.html",
                controller: "AccidentRecordsController"
            }
        }
    },
    //门诊凭证
    "clinic_claim": {
        url: "/clinic_claim",
        views: {
            "main_view": {
                templateUrl: "modules/business/onekey_claim/views/clinic_claim.html",
                controller: "ClinicClaimController"
            }
        }
    },
    //一键理赔 住院已经结算数据
    "claim_inpatient_general": {
        url: "/claim_inpatient_general",
        views: {
            "main_view": {
                templateUrl: "modules/business/onekey_claim/views/claim_inpatient_general.html",
                controller:  "ClaimInpatientGeneralController"
            }
        }
    },
    /**
     * 门诊报告单
     */
    "clinic_report": {
        url: "/clinic_report",
        views: {
            "main_view": {
                templateUrl: "modules/business/onekey_claim/views/clinic_report.html",
                controller: "ClinicReportController"
            }
        }
    },
    /**
     * 住院报告单
     */
    "in_hospital_report": {
        url: "/in_hospital_report",
        views: {
            "main_view": {
                templateUrl: "modules/business/onekey_claim/views/in_hospital_report.html",
                controller: "InHospitalReportController"
            }
        }
    },
    //一键理赔完成页面
    "claim_complete": {
        url: "/claim_complete",
        views: {
            "main_view": {
                templateUrl: "modules/business/onekey_claim/views/claim_complete.html",
                controller: "ClaimCompleteController"
            }
        }
    }
};
