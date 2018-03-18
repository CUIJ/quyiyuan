var MY_REFUND_ROUTER_TABLE = {
    //我的退费 //KYEEAPPC-3596
    "my_refund" : {
        url: "/my_refund",
        views:{
            "main_view" : {
                templateUrl: "modules/business/my_wallet/my_refund/index.html",
                controller : "MyRefundController"
            }
        }
    },
    //申请退款
    "refund_apply" : {
        url: "/refund_apply",
        views:{
            "main_view" : {
                templateUrl: "modules/business/my_wallet/my_refund/views/refund_apply.html",
                controller : "MyRefundApplyController"
            }
        }
    },
    //退费明细
    "refund_detail" : {
        url: "/refund_detail",
        views:{
            "main_view" : {
                templateUrl: "modules/business/my_wallet/my_refund/views/refund_detail.html",
                controller : "MyRefundDetailController"
            }
        }
    },
    //退费历史
    "refund_history" : {
        url: "/refund_history",
        views:{
            "main_view" : {
                templateUrl: "modules/business/my_wallet/my_refund/views/refund_history.html",
                controller : "MyRefundHistoryController"
            }
        }
    },

    //退费详情
    "refund_detail_new": {
        url: "/refund_detail_new",
        views: {
            "main_view": {
                templateUrl: "modules/business/my_wallet/my_refund/views/refund_detail_new.html",
                controller: "MyRefundDetailNewController"
            }
        }
    },
    //申请退费界面
    "clinic_refund_apply": {
        url: "/clinic_refund_apply",
        views: {
            "main_view": {
                templateUrl: "modules/business/my_wallet/my_refund/views/clinic_refund_apply.html",
                controller: "MyClinicRefundApplyController"
            }
        }
    }
};