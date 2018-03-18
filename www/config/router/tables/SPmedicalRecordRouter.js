var SP_MEDICAL_RECORD_ROUTER_TABLE = {
    "sp_medical_record" : {
        url: "/sp_medical_record",
        views: {
            "main_view": {
                templateUrl: "modules/business/sp_medical_record/index.html",
                controller : "MedicalRecordController"
            }
        }
    },
    "sp_clinic_hos_record" : {
        url: "/sp_clinic_hos_record",
        views: {
            "main_view": {
                templateUrl: "modules/business/sp_medical_record/views/sp_clinic_hos_record.html",
                controller : "ClinicHosRecordController"
            }
        }
    },
    "sp_evaluate" : {
        url: "/sp_evaluate",
        views: {
            "main_view": {
                templateUrl: "modules/business/sp_medical_record/views/sp_evaluate.html",
                controller : "EvaluateController"
            }
        }
    },
    "add_sat_extend_patient_info":{
        url: "/add_sat_extend_patient_info",
        views: {
            "main_view": {
                templateUrl: "modules/business/sp_medical_record/views/add_sat_extend_patient_info.html",
                controller : "addSatExtendPatientInfoController"
            }
        }
    },
    "sms_quick_evaluate":{
        url: "/sms_quick_evaluate",
        views: {
            "main_view": {
                templateUrl: "modules/business/sp_medical_record/views/sms_quick_evaluate.html",
                controller : "SmsQuickEvaluateController"
            }
        }
    }
};