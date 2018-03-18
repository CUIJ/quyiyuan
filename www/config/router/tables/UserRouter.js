//登录界面的路由
var USER_ROUTER_TABLE={
    //登录
    "login":{
        url:"/login",
        views:{
            "main_view":{
                templateUrl:"modules/business/login/index.html",
                controller:"LoginController"
            }
        }
    } ,
    //注册
    "regist_user":{
        url:"/regist",
        views:{
            "main_view":{
                templateUrl:"modules/business/login/views/regist.html",
                controller:"RegistController"
            }
        }
    } ,
    //验证用户信息
    "verify_name":{
        url:"/verify_name",
        views:{
            "main_view":{
                templateUrl:"modules/business/login/views/verify_name.html",
                controller:"VerifyNameController"
            }
        }
    } ,
    //密码找回
    "find_password":{
        url:"/find_password",
        views:{
            "main_view":{
                templateUrl:"modules/business/login/views/find_password.html",
                controller:"FindPasswordController"
            }
        }
    },
    //趣医协议
    "q_agreement":{
        url:"/agreement",
        views:{
            "main_view":{
                templateUrl:"modules/business/login/views/agreement.html",
                controller:"AgreementController"
            }
        }
    },

//Edit Begin 修改人：futian  任务号：KYEEAPPC-4398 账户认证  修改时间:2015年12月10日09:07:39
    "account_authentication":{
        url:"/account_authentication",
        views:{
            "main_view":{
                templateUrl:"modules/business/login/views/account_authentication.html",
                controller:"AccountAuthenticationController"
            }
        }
    },
    //Edit Begin 修改人：futian  任务号：KYEEAPPC-4225  账户认证  修改时间:2015年12月10日09:07:39
    "change_phone": {
        url: "/chang_phone",
        views: {
            "main_view": {
                templateUrl: "modules/business/login/views/chang_phone.html",
                controller: "ChangePhoneController"
            }
        }
    }

};