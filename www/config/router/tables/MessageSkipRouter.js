var MESSAGE_SKIP_ROUTER_TABLE = {

    "message_skip_controller" : {
        url : "/message_skip_controller",
        views : {
            "main_view":{
                templateUrl: "modules/business/message_skip/index.html",
                controller: "MessageSkipController"
            }
        }
    },
    //信息提取码页面
    "extract_code_info" : {
        url: "/extract_code_info",
        views: {
            "main_view": {
                templateUrl: "modules/business/message_skip/views/extract_code_info.html",
                controller: "ExtractCodeInfoController"
            }
        }
    },

    //信息提取码+个人信息录入
    "extract_all_info" : {
        url: "/extract_all_info",
        views: {
            "main_view": {
                templateUrl: "modules/business/message_skip/views/extract_all_info.html",
                controller: "ExtractAllInfoController"
            }
        }
    },
    "qrcode_skip_controller" : {
        url : "/qrcode_skip_controller",
        views : {
            "main_view":{
                templateUrl: "modules/business/qr_code_bussiness/index.html",
                controller: "QRCodeController"
            }
        }
    }
};