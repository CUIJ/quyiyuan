/**
 * 产品名称 quyiyuan.
 * 创建用户: 田新
 * 日期: 2015/9/7
 * 创建原因：停诊通知路由
 */
var NOTICE_ROUTER_TABLE = {
    //主页
    "clinicStopNotice" : {
        url : "/clinicStopNotice",
        views : {
            "main_view" : {
                templateUrl : "modules/business/clinic_stop_notice/index.html",
                controller : "NoticeController"
            }
        }
    }
};