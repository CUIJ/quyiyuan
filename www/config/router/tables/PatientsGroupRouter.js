var PATIENTS_GROUP_ROUTER_TABLE = {
    //ҽ������
    "medical_orders_reminder": {
        url: "/medical_orders_reminder",
        views: {
            "main_view": {
                templateUrl: "modules/business/patients_group/reminder/views/medical_orders_reminder.html",
                controller: "MedicalOrdersReminderController"
            }
        }
    },

    "medical_record_reminder": {
        url: "/medical_record_reminder",
        views: {
            "main_view": {
                templateUrl: "modules/business/patients_group/reminder/views/medical_record_reminder.html",
                controller: "MedicalRecordReminderController"
            }
        }
    },

    "report_reminder": {
        url: "/report_reminder",
        views: {
            "main_view": {
                templateUrl: "modules/business/patients_group/reminder/views/report_reminder.html",
                controller: "ReportReminderController"
            }
        }
    },

    "patients_group_message": {
        url: "/patients_group_message",
        views: {
            "main_view": {
                templateUrl: "modules/business/patients_group/reminder/views/patients_group_message.html",
                controller: "PatientsGroupMessageController"
            }
        }
    },

    "disable_send_message": {
        url: "/disable_send_message",
        views: {
            "main_view": {
                templateUrl: "modules/business/patients_group/reminder/views/disable_send_message.html",
                controller: "DisableSendMessageController"
            }
        }
    },

    "message->MAIN_TAB": {
        url: "/message->MAIN_TAB",
        views: {
            "main_view": {
                templateUrl: "modules/business/patients_group/index.html",
                controller: "MessageController"
            }
        }
    },

    "personal_setting": {
        url: "/personal_setting",
        views: {
            "main_view": {
                templateUrl: "modules/business/patients_group/views/personal_setting.html",
                controller: "PersonalSettingController"
            }
        }
    },

    "new_friends": {
        url: "/new_friends",
        views: {
            "main_view": {
                templateUrl: "modules/business/patients_group/views/new_friends.html",
                controller: "NewFriendsController"
            }
        }
    },

    "personal_home": {
        url: "/personal_home",
        views: {
            "main_view": {
                templateUrl: "modules/business/patients_group/views/personal_home.html",
                controller: "PersonalHomeController"
            }
        }
    },

    "group_list": {
        url: "/group_list",
        views: {
            "main_view": {
                templateUrl: "modules/business/patients_group/views/group_list.html",
                controller: "GroupListController"
            }
        }
    },

    "recommend_group": {
        url: "/recommend_group",
        views: {
            "main_view": {
                templateUrl: "modules/business/patients_group/views/recommend_group.html",
                controller: "RecommendGroupController"
            }
        }
    },

    "add_friends": {
        url: "/add_friends",
        views: {
            "main_view": {
                templateUrl: "modules/business/patients_group/views/add_friends.html",
                controller: "AddFriendsController"
            }
        }
    },

    "query_friends": {
        url: "/query_friends",
        views: {
            "main_view": {
                templateUrl: "modules/business/patients_group/views/query_friends.html",
                controller: "QueryFriendsController"
            }
        }
    },

    "group_members": {
        url: "/group_members",
        views: {
            "main_view": {
                templateUrl: "modules/business/patients_group/views/group_members.html",
                controller: "GroupMembersController"
            }
        }
    },

    "conversation": {
        url: "/conversation",
        views: {
            "main_view": {
                templateUrl: "modules/business/patients_group/views/conversation.html",
                controller: "ConversationController"
            }
        }
    },

    "choose_at_members": {
        url: "/choose_at_members",
        views: {
            "main_view": {
                templateUrl: "modules/business/patients_group/views/choose_at_members.html",
                controller: "ChooseAtMembersController"
            }
        }
    },

    "search_group_list": {
        url: "/search_group_list",
        views: {
            "main_view": {
                templateUrl: "modules/business/patients_group/views/search_group_list.html",
                controller: "SearchGroupListController"
            }
        }
    },

    "patients_report": {
        url: "/patients_report",
        views: {
            "main_view": {
                templateUrl: "modules/business/patients_group/views/patients_report.html",
                controller: "PatientsReportController"
            }
        }
    },

    "group_details": {
        url: "/group_details",
        views: {
            "main_view": {
                templateUrl: "modules/business/patients_group/views/group_details.html",
                controller: "GroupDetailsController"
            }
        }
    },

    "modify_group_card": {
        url: "/modify_group_card",
        views: {
            "main_view": {
                templateUrl: "modules/business/patients_group/views/modify_group_card.html",
                controller: "ModifyGroupCardController"
            }
        }
    },
    "personal_chat": {
        url: "/personal_chat",
        views: {
            "main_view": {
                templateUrl: "modules/business/patients_group/views/personal_chat.html",
                controller: "PersonalChatController"
            }
        }
    },
    "patient_group_web": {
        url: "/patient_group_web",
        views: {
            "main_view": {
                templateUrl: "modules/business/patients_group/views/patients_group_web.html",
                controller: "patientsGroupWebController"
            }
        }
    },
    "patient_group_upgrade": {
        url: "/patient_group_upgrade",
        views: {
            "main_view": {
                templateUrl: "modules/business/patients_group/views/patient_group_upgrade.html",
                controller: "upgradeController"
            }
        }
    },
    "modify_personal_name":{
        url: "/modify_personal_name",
        views: {
            "main_view": {
                templateUrl: "modules/business/patients_group/views/modify_personal_name.html",
                controller: "ModifyPersonalNameController"
            }
        }
    },
    "select_patients":{
        url: "/select_patients",
        views: {
            "main_view": {
                templateUrl: "modules/business/patients_group/views/my_doctor/select_patients.html",
                controller: "SelectPatientsController"
            }
        }
    },
    "select_hospital_list":{
        url: "/select_hospital_list",
        views: {
            "main_view": {
                templateUrl: "modules/business/patients_group/views/my_doctor/select_hospital_list.html",
                controller: "SelectHospitalListController"
            }
        }
    },
    "select_patient_list":{
        url: "/select_patient_list",
        views: {
            "main_view": {
                templateUrl: "modules/business/patients_group/views/my_doctor/select_patient_list.html",
                controller: "SelectPatientListController"
            }
        }
    },
    "my_doctor_list":{
        url: "/my_doctor_list",
        views: {
            "main_view": {
                templateUrl: "modules/business/patients_group/views/my_doctor/my_doctor_list.html",
                controller: "MyDoctorListController"
            }
        }
    },
    "my_doctor_details":{
        url: "/my_doctor_details",
        views: {
            "main_view": {
                templateUrl: "modules/business/patients_group/views/my_doctor/my_doctor_details.html",
                controller: "MyDoctorDetailsController"
            }
        }
    },
    "dept_doctor_list":{
        url: "/dept_doctor_list",
        views: {
            "main_view": {
                templateUrl: "modules/business/patients_group/views/my_doctor/dept_doctor_list.html",
                controller: "DeptDoctorListController"
            }
        }
    },
    "hospital_dept_list":{
        url: "/hospital_dept_list",
        views: {
            "main_view": {
                templateUrl: "modules/business/patients_group/views/my_doctor/hospital_dept_list.html",
                controller: "HospitalDeptListController"
            }
        }
    },
    "questionnaire_survey":{
        url: "/questionnaire_survey",
        views: {
            "main_view": {
                templateUrl: "modules/business/patients_group/views/my_doctor/questionnaire_survey.html",
                controller: "QuestionnaireSurveyController"
            }
        }
    },
    "questionnaire_search":{
        url: "/questionnaire_search",
        views: {
            "main_view": {
                templateUrl: "modules/business/patients_group/views/my_doctor/questionnaire_search.html",
                controller: "QuestionnaireSearchController"
            }
        }
    },
	"medication_push": {
		url: "/medication_push",
		views: {
			"main_view": {
				templateUrl: "modules/business/patients_group/reminder/views/medication_push.html",
				controller: "MedicationPushController"
			}
		}
	},
    "unified_push": {
        url: "/unified_push",
        views: {
            "main_view": {
                templateUrl: "modules/business/patients_group/reminder/views/unified_push.html",
                controller: "UnifiedPushController"
            }
        }
    },
    "set_remark": {
	    url: "/set_remark",
	    views: {
		    "main_view": {
			    templateUrl: "modules/business/patients_group/views/set_remark.html",
			    controller: "SetRemarkController"
		    }
	    }
    },
    "group_search": {
        url: "/group_search",
        views: {
            "main_view": {
                templateUrl: "modules/business/patients_group/views/group_search.html",
                controller: "GroupSearcherController"
            }
        }
    },
    "treatment_plan_push" : {
        url: "/treatment_plan_push",
        views: {
            "main_view": {
                templateUrl: "modules/business/patients_group/reminder/views/treatment_plan.html",
                controller: "TreatmentPlanController"
            }
        }
    },
    "group_announcement" : {
        url: "/group_announcement",
        views: {
            "main_view": {
                templateUrl: "modules/business/patients_group/views/group_announcement.html",
                controller: "GroupAnnouncementController"
            }
        }
    },
    "attending_doctor":{
        url:"/attending_doctor",
        views: {
            "main_view": {
                templateUrl: "modules/business/patients_group/views/attending_doctor.html",
                controller: "AttendingDoctorController"
            }
        }

    }
};