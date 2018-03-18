var MY_HEALTH_FILES_ROUTER_TABLE = {

    "my_health_archive" : {
        url: "/my_health_archive",
        views: {
            "main_view": {
                templateUrl: "modules/business/health_archive/index.html",
                controller : "MyHealthArchiveController"
            }
        }
    },
    "my_personal_information" : {
        url: "/my_personal_information",
        views: {
            "main_view": {
                templateUrl: "modules/business/health_archive/views/my_personal_information.html",
                controller : "MyPersonalInformationController"
            }
        }
    },
    "my_health_information" : {
        url: "/my_health_information",
        views: {
            "main_view": {
                templateUrl: "modules/business/health_archive/views/my_health_information.html",
                controller : "MyHealthInformationController"
            }
        }
    },
    "clinic_hospital_detail" : {
        url: "/clinic_hospital_detail",
        views: {
            "main_view": {
                templateUrl: "modules/business/health_archive/views/clinic_hospital_detail.html",
                controller : "ClinicHospitalDetailController"
            }
        }
    },
    "medication_prescription_detail" : {
        url: "/medication_prescription_detail",
        views: {
            "main_view": {
                templateUrl: "modules/business/health_archive/views/medication_prescription_detail.html",
                controller : "MedicationPrescriptionDetailController"
            }
        }
    },
    "medical_information" : {
        url: "/medical_information",
        views: {
            "main_view": {
                templateUrl: "modules/business/health_archive/views/medical_information.html",
                controller : "MedicalInformationController"
            }
        }
    },
    "treatment_info_list" : {
        url: "/treatment_info_list",
        views: {
            "main_view": {
                templateUrl: "modules/business/health_archive/views/treatment_information_list.html",
                controller : "TreatmentInformationListController"
            }
        }
    },
    "treatment_check_list" : {
        url: "/treatment_check_list",
        views: {
            "main_view": {
                templateUrl: "modules/business/health_archive/views/treatment_check_list.html",
                controller : "TreatmentCheckListController"
            }
        }
    },
    "treatment_check_detail" : {
        url: "/treatment_check_detail",
        views: {
            "main_view": {
                templateUrl: "modules/business/health_archive/views/treatment_check_detail.html",
                controller : "TreatmentCheckDetailController"
            }
        }
    }
};