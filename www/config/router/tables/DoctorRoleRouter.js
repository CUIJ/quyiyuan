var DOCTOR_ROLE_ROUTER_TABLE = {

    //医生登录页面
    "doctor_login" : {
        url: "/doctor_login",
        cache:'false',
        views: {
            "main_view": {
                templateUrl: "modules/business/doctor_role/login/index.html",
                controller: "DoctorLoginController"
            }
        }
    },
    //医生手机号码认证页面
    "doctor_pwd_init" : {
        url: "/doctor_pwd_init",
        cache:'false',
        views: {
            "main_view": {
                templateUrl: "modules/business/doctor_role/login/views/doctor_pwd_init.html",
                controller: "DoctorPwdInitController"
            }
        }
    },
    //医生角色主页
    "doctorHome->MAIN_TAB" : {
        url: "/doctorHome->MAIN_TAB",
        views: {
            "main_view": {
                templateUrl: "modules/business/doctor_role/home/index.html",
                controller: "DoctorHomeController"
            }
        }
    },
    //医生角色个人中心
    "doctorCenter->MAIN_TAB" : {
        url: "/doctorCenter->MAIN_TAB",
        views: {
            "main_view": {
                templateUrl: "modules/business/doctor_role/home/views/doctor_center.html",
                controller: "DoctorCenterController"
            }
        }
    },
    //医生角色修改
    "change_doctor_pwd" : {
        url: "/change_doctor_pwd",
        views: {
            "main_view": {
                templateUrl: "modules/business/doctor_role/home/views/change_doctor_pwd.html",
                controller: "DoctorChangePwdController"
            }
        }
    },
    //患者信息页面
    "patientInfo" : {
        url: "/patientInfo",
        views: {
            "main_view": {
                templateUrl: "modules/business/doctor_role/interaction/index.html",
                controller: "DoctorInteractionController"
            }
        }
    },
    //和患者聊天页面
    "patientInfo.doctorMessageBoard" : {
        url: "/doctorMessageBoard",
        views: {
            "doctor_patient_view": {
                templateUrl: "modules/business/doctor_role/interaction/views/doctor_patient_chat.html",
                controller: "MessageBoardController"
            }
        }
    },
    //就诊记录页面
    "patientInfo.visitRecords" : {
        url: "/visitRecords",
        views: {
            "doctor_patient_view": {
                templateUrl: "modules/business/doctor_role/interaction/views/visit_records.html",
                controller: "visitRecordsController"
            }
        }
    },
    //诊疗病人页面
    "patientScreening" : {
        url: "/patientScreening",
        views: {
            "main_view": {
                templateUrl: "modules/business/doctor_role/patient_screening/index.html",
                controller: "patientScreeningController"
            }
        }
    },
    //未读留言列表页面
    "doctorUnreadMessage" : {
        url: "/doctorUnreadMessage",
        views: {
            "main_view": {
                templateUrl: "modules/business/doctor_role/interaction/views/message_board/unread_message.html",
                controller:"DoctorUnreadMessageController"
            }
        }
    },
    //未读留言详情页面
    "doctorUnreadMessageDetail" : {
        url: "/doctorUnreadMessageDetail",
        views: {
            "main_view": {
                templateUrl: "modules/business/doctor_role/interaction/views/message_board/unread_message_detail.html",
                controller:"DoctorUnreadMessageDetailController"
            }
        }
    },
    //关注我的患者
    "care_me" : {
        url: "/care_me",
        views: {
            "main_view": {
                templateUrl: "modules/business/doctor_role/care_me/index.html",
                controller: "CareMeController"
            }
        }
    },
    //我的评价
    "evaluation_record" : {
        url: "/evaluation_record",
        views: {
            "main_view": {
                templateUrl: "modules/business/doctor_role/evaluation_record/index.html",
                controller: "EvaluationRecordController"
            }
        }
    }
};