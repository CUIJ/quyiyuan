/**
 * Created by Administrator on 2015/5/19.
 */
var HOSPITAL_NOTICE_ROUTER_TABLE = {
    "hospitalNotice" : {
        url: "/hospitalNotice",
        views: {
            "main_view": {
                templateUrl: "modules/business/hospitalnotice/index.html",
                controller : "HospitalNoticeController"
            }
        }
    },
    "hospitalNoticeDetail" : {
        url: "/hospitalNoticeDetail",
        views: {
            "main_view": {
                templateUrl: "modules/business/hospitalnotice/views/hospitalNoticeDetail.html",
                controller : "HospitalNoticeDetailController"
            }
        }
    }
}
