var REBATE_ROUTER_TABLE = {
    "rebate" : {
        url: "/rebate",
        views: {
            "main_view": {
                templateUrl: "modules/business/rebate/index.html",
                controller : "RebateController"
            }
        }
    },
    "rebateDetail" : {
        url: "/rebateDetail",
        views: {
            "main_view": {
                templateUrl: "modules/business/rebate/views/rebate_detail.html",
                controller:"RebateDetailController"
            }
        }
    },
    "rebateDetail.rebateDetailIn" : {
        url: "/rebateDetailIn",
        views: {
            "rebateSubview@rebateDetail": {
                templateUrl: "modules/business/rebate/views/rebate_detail_in.html",
                controller:"RebateDetailInController"
            }
        }
    },

    "rebateDetail.rebateDetailOut" : {
        url: "/rebateDetailOut",
        views: {
            "rebateSubview@rebateDetail": {
                templateUrl: "modules/business/rebate/views/rebate_detail_out.html",
                controller:"RebateDetailOutController"
            }
        }
    },
    "myCoupons":{
        url: "/myCoupons",
        views: {
            "main_view": {
                templateUrl: "modules/business/rebate/views/my_coupons.html",
                controller:"MyCouponsController"
            }
        }
    }
};