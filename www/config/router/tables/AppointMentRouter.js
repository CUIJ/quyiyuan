/**
 * 产品名称：quyiyuan
 * 创建者：刘健
 * 创建时间： 2015/5/16
 * 创建原因：c端预约挂号路由
 * 修改者：
 * 修改原因：
 *
 */
var APPOINTMENT_ROUTER_TABLE={
    "appointment":{
        url:"/appointment",
        views:{
            "main_view":{
                templateUrl:"modules/business/appointment/index.html",
                controller:"AppointmentDeptGroupController"
            }

        }
    },
    //医生详情
    "doctor_info":{
        url:"/doctor_info",
        views:{
            "main_view":{
                templateUrl:"modules/business/appointment/views/doctor_info.html",
                controller:"AppointmentDoctorInfoController"
            }

        }
    },
    //医生动态
    "doctor_action":{
        url:"/doctor_action",
        views:{
            "main_view":{
                templateUrl:"modules/business/appointment/views/doctor_action.html",
                controller:"AppointmentDoctorActionController"
            }

        }
    },
    "appointment_doctor":{
        url:"/appointment_doctor",
        views:{
            "main_view":{
                templateUrl:"modules/business/appointment/views/doctor_list.html",
                controller:"AppointmentDoctorController"
            }

        }
    },
    "appointment_regist_list":{
        url:"/appointment_regist_list",
        views:{
            "main_view":{
                templateUrl:"modules/business/appointment/views/appointment_regist_list.html",
                controller:"AppointmentRegistListController"
            }

        }
    },
    //预约挂号详情
    "appointment_regist_detil":{
        url:"/appointment_regist_detil",
        views:{
            "main_view":{
                templateUrl:"modules/business/appointment/views/appointment_regist_detil.html",
                controller:"AppointmentRegistDetilController"
            }

        }
    },
    //申请新卡
    "create_card_info":{
        url:"/create_card_info",
        views:{
            "main_view":{
                templateUrl:"modules/business/appointment/views/create_card_info.html",
                controller:"AppointmentCreateCardController"
            }

        }
    },
    //预约挂号登录注册集成
    "appointment_register":{
        url:"/appointment_register",
        views:{
            "main_view":{
                templateUrl:"modules/business/appointment/views/appointment_register.html",
                controller:"AppointmentRegisterController"
            }

        }
    },
    //预约挂号密码
    "appointmentRegisterPassword":{
        url:"/appointment_register_password",
        views:{
            "main_view":{
                templateUrl:"modules/business/appointment/views/appointment_register_password.html",
                controller:"AppointmentRegisterPasswordController"
            }

        }
    },
    //预约挂号成功页面
    "appointment_result":{
        url:"/appointment_result",
        views:{
            "main_view":{
                templateUrl:"modules/business/appointment/views/appointment_result.html",
                controller:"AppointmentResultController"
            }

        }
    },
    //特色科室路由 zm 2015-09-09
    "features_dept":{
        url:"/features_dept",
        views:{
            "main_view":{
                templateUrl:"modules/business/appointment/views/features_dept.html",
                controller:"FeaturesDeptController"
            }
        }
    },
    "find_doctor_list":{
        url:"/find_doctor_list",
        views : {
            "main_view":{
                templateUrl:"modules/business/appointment/views/find_doctor/find_doctor_list.html",
                controller:"FindDoctorListController"

            }
        }
    },
    "find_doctor_dept_info":{
        url:"/find_doctor_dept_info",
        views : {
            "main_view":{
                templateUrl:"modules/business/appointment/views/find_doctor/find_doctor_dept_info.html",
                controller:"FindDoctorDeptInfoController"

            }
        }
    },
    //KYEEAPPC-5358   预约挂号页面改版  wangwan 2016年3月9日19:47:51
    "appointment_notice":{
        url:"/appointment_notice",
        views : {
            "main_view":{
                templateUrl:"modules/business/appointment/views/appointment_notice.html",
                controller:"AppointmentNoticeController"

            }
        }
    },
    "tel_appointment":{
        url:"/tel_appointment",
        views : {
            "main_view":{
                templateUrl:"modules/business/appointment/views/tel_appointment.html",
                controller: "TelAppointmentController"
            }

        }
    },
    "insurance_back_app":{
        url:"/insurance_back_app",
        views : {
            "main_view":{
                templateUrl:"modules/business/appointment/views/insurance_back_app.html",
                controller: "InsuranceBackAPPController"
            }

        }
    },
    "rush_clinic_record_list":{
        url:"/rush_clinic_record_list",
        views : {
            "main_view":{
                templateUrl:"modules/business/appointment/views/clinic_reminder_management/rush_clinic_record_list.html",
                controller: "RushClinicRecordListController"
            }

        }
    },
    "rush_clinic_record_list_new":{
        url:"/rush_clinic_record_list_new",
        views : {
            "main_view":{
                templateUrl:"modules/business/appointment/views/clinic_reminder_management/rush_clinic_record_list_new.html",
                controller: "RushClinicRecordListControllerNew"
            }

        }
    },
    "rush_clinic_detail": {
        url: "/rush_clinic_detail",
        views: {
            "main_view": {
                templateUrl: "modules/business/appointment/views/clinic_reminder_management/rush_clinic_detail.html",
                controller: "RushClinicDetailController"

            }
        }
    },
    "add_clinic_management_new": {
        url: "/add_clinic_management_new",
        views: {
            "main_view": {
                templateUrl: "modules/business/appointment/views/clinic_reminder_management/add_clinic_management_new.html",
                controller: "AddClinicManagementControllerNew"

            }
        }
    },
    "clound_his_message":{
        url:"/clound_his_message",
        views : {
            "main_view":{
                templateUrl:"modules/business/appointment/views/clound_his_message.html",
                controller: "CloundHisMessageController"

            }
        }
    },
    "rush_clinic_success":{
        url:"/rush_clinic_success",
        views : {
            "main_view":{
                templateUrl: "modules/business/appointment/views/clinic_reminder_management/rush_clinic_success.html",
                controller: "RushClinicResultSuccessController"
            }
        }
    },
    "waiting_for_payment_detail":{
        url:"/waiting_for_payment_detail",
            views : {
            "main_view":{
                templateUrl: "modules/business/appointment/views/clinic_reminder_management/waiting_for_payment_detail.html",
                    controller: "WaitingForPaymentDetailController"
            }
        }
    },
    "my_convenience_clinic":{
        url:"/my_convenience_clinic",
        views : {
            "main_view":{
                templateUrl: "modules/business/appointment/views/convenience_clinic/my_convenience_clinic.html",
                controller: "MyConvenienceClinicController"
            }
        }
    },
    "video_interrogation" : {  //add by wangsannv  新增视频问诊
        url : "video_interrogation",
        views :{
            "main_view" :{
                templateUrl : "modules/business/appointment/views/convenience_clinic/video_interrogation.html",
                controller : "VideoInterrogationController"
            }
        }
    },
    "purchase_medince" : {  //add by wangsannv  新增远程购药
        url : "purchase_medince",
        views :{
            "main_view" :{
                templateUrl : "modules/business/appointment/views/convenience_clinic/purchase_medince.html",
                controller : "PurchaseMedicineController"
            }
        }
    },
    "network_clinic_dl" : {  //网络门诊医生列表页
        url : "network_clinic_dl",
        views :{
            "main_view" :{
                templateUrl : "modules/business/appointment/views/convenience_clinic/network_clinic_dl.html",
                controller : "NetworkClinicDLController"
            }
        }
    }

};
