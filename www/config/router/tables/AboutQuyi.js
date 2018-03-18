/**
 * 产品名称 KYMH
 * 创建用户: 李文娟
 * 日期: 2015/4/30
 * 时间: 13:12
 * 创建原因：关于趣医页面的路由
 * 修改原因：
 * 修改时间：
 */
var ABOUT_QUYI_TABLE={
    "aboutquyi":{
        url:"/aboutquyi",
        views:{
            "main_view":{
                templateUrl:"modules/business/aboutquyi/index.html",
                controller:"AboutQuyiController"
            }

        }
    },
    "aboutquyi_help":{
        url:"/aboutquyi/help",
        views:{
            "main_view":{
                templateUrl:"modules/business/aboutquyi/views/help.html",
                controller:"HelpController"
            }

        }
    },
    "aboutquyi_newFeedback":{
        url:"/aboutquyi/feedback",
        views:{
            "main_view":{
                templateUrl:"modules/business/aboutquyi/views/feedback.html",
                controller:"FeedbackController"
            }

        }
    },
    "aboutquyi_feedback":{
        url:"/aboutquyi/newFeedback",
        views:{
            "main_view":{
                templateUrl:"modules/business/aboutquyi/views/newFeedback.html",
                controller:"NewFeedbackController"
            }

        }
    },
    "aboutquyi_login":{
        url:"/aboutquyi/login",
        views:{
            "main_view":{
                templateUrl:"modules/business/login/index.html",
                controller:"LoginController"
            }

        }
    },
    "aboutquyi_webview":{
        url:"/aboutquyi/webview",
        views:{
            "main_view":{
                templateUrl:"modules/business/aboutquyi/views/weburl.html",
                controller:"WebUrlController"
            }

        }
    },
    "other_web_url":{
        url:"/aboutquyi/other_web_url",
        views:{
            "main_view":{
                templateUrl:"modules/business/aboutquyi/views/other_web_url.html",
                controller:"OtherWebUrlController"
            }

        }
    },
    //上海停诊险跳转页面
    "risk_web_url":{
        url:"/aboutquyi/risk_web_url",
        views:{
            "main_view":{
                templateUrl:"modules/business/aboutquyi/views/risk_web_url.html",
                controller:"RiskWebUrlController"
            }

        }
    }
};