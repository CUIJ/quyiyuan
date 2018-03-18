var MESSAGE_CENTER_ROUTER_TABLE = {

    //消息中心
    "messagecenter" : {
        url: "/messagecenter",
        views: {
            "main_view": {
                templateUrl: "modules/business/messagecenter/index.html",
                controller: "MessageCenterController"
            }
        }
    },

    //查卡结果页面
    "query_card_result" : {
        url: "/query_card_result",
        views: {
            "main_view": {
                templateUrl: "modules/business/messagecenter/views/query_card_result.html",
                controller: "QueryCardResultController"
            }
        }
    },
    //显示指定url网页
    "show_web_page" : {
        url: "/show_web_page",
        views: {
            "main_view": {
                templateUrl: "modules/business/messagecenter/views/show_web_page.html",
                controller: "ShowWebPageController"
            }
        }
    },
    //显示指定url网页
    "show_html" : {
        url: "/show_html",
        views: {
            "main_view": {
                templateUrl: "modules/business/messagecenter/views/show_html.html",
                controller: "ShowHtmlController"
            }
        }
    },
    //我的健康页面
    "my_healthy":{
        url: "/my_healthy",
        views: {
            "main_view": {
                templateUrl: "modules/business/messagecenter/views/my_healthy.html",
                controller: "MyHealthyController"
            }
        }
    }
};