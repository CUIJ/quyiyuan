/**
 * Created by Administrator on 2015/4/28.
 */
var CENTER_ROUTER_TABLE = {
    // certer 个人中心配置
    "center->MAIN_TAB" : {
        url: "/center->MAIN_TAB",
        views: {
            "main_view": {
                templateUrl: "modules/business/center/index.html",
                controller : "CenterController"
            }
        }
    },
    //切换就诊者
    "custom_patient" : {
        url: "/custom_patient",
        views: {
            "main_view": {
                templateUrl: "modules/business/center/views/custom_patient/custom_patient.html",
                controller : "CustomPatientController"
            }
        }
    },
    //查询就诊者
    "comm_patient_detail" : {
        url: "/comm_patient_detail",
        cache:'false',
        views: {
            "main_view": {
                templateUrl: "modules/business/center/views/add_patient_info/comm_patient_detail.html",
                controller : "CommPatientDetailController"
            }
        }
    },
    //附加就诊者
    "add_patient_info" : {
        url: "/add_patient_info",
        views: {
            "main_view": {
                templateUrl: "modules/business/center/views/add_patient_info/add_patient_info.html",
                controller : "AddPatientInfoController"
            }
        }
    },
    //切换角色
    "role_view" : {
        url: "/role_view",
        cache: 'false',
        views: {
            "main_view": {
                templateUrl: "modules/business/center/views/role_view/role_view.html",
                controller : "RoleViewController"
            }
        }
    },
    //修改密码
    "change_pwd" : {
        url: "/change_pwd",
        views: {
            "main_view": {
                templateUrl: "modules/business/center/views/change_pwd/change_pwd.html",
                controller : "ChangePwdController"
            }
        }
    },
    //个人信息维护
    "update_user" : {
        url: "/update_user",
        cache:'false',
        views: {
            "main_view": {
                templateUrl: "modules/business/center/views/update_user/update_user.html",
                controller : "UpdateUserController"
            }
        }
    },
    //绑定医保卡
    "bindMSCard" : {
        url: "/bindMSCard",
        views: {
            "main_view": {
                templateUrl: "modules/business/center/views/update_user/bind_ms_card.html",
                controller : "BindMSCardController"
            }
        }
    },
    //新增医保卡
    "add_medical_card" : {
        url: "/add_medical_card",
        views: {
            "main_view": {
                templateUrl: "modules/business/center/views/update_user/add_medical_card.html",
                controller : "AddMedicalCardController"
            }
        }
    },
    //选择卡类型
    "type_medical_card" : {
        url: "/type_medical_card",
        views: {
            "main_view": {
                templateUrl: "modules/business/center/views/update_user/type_medical_card.html",
                controller : "TypeMedicalCardController"
            }
        }
    },
    //多语言切换
    "changeLanguage" : {
        url: "/changeLanguage",
        views: {
            "main_view": {
                templateUrl: "modules/business/center/views/change_language/change_language.html",
                controller : "ChangeLanguageController"
            }
        }
    },
    //健康档案
    "jiankangdangan" : {
        url: "/jiankangdangan",
        views: {
            "main_view": {
                templateUrl: "modules/business/center/views/luoyang_web_url.html",
                controller : "WebUrlController"
            }
        }
    },
    //设置//个人中心主页开发（APK）  By  张家豪  KYEEAPPC-4404
    "set_up" : {
        url: "/set_up",
        views: {
            "main_view": {
                templateUrl: "modules/business/center/views/set_up/set_up.html",
                controller : "SetUpController"
            }
        }
    },
    "administrator_login" : {
        url: "/administrator_login",
        views: {
            "main_view": {
                templateUrl: "modules/business/center/views/administrator_login/administrator_login.html",
                controller : "AdministratorLogin"
            }
        }
    }
};