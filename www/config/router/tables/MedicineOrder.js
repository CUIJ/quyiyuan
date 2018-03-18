var MEDICINE_ORDER_ROUTER_TABLE = {

    "medicineOrder" : {
        url: "/medicineOrder",
        cache: false,
        views:{
            "main_view":{
                templateUrl: "modules/business/medicine_order/index.html",
                controller : "MedicineOrderController"
            }
        }
    },
    "orderDetail" : {
        url: "/orderDetail",
        views:{
            "main_view":{
                templateUrl: "modules/business/medicine_order/views/order_detail.html",
                controller : "OrderDetailController"
            }
        }
    },
    "logisticsDetail" : {
        url: "/logisticsDetail",
        views:{
            "main_view":{
                templateUrl: "modules/business/medicine_order/views/logistics_detail.html",
                controller : "LogisticsDetailController"
            }
        }
    }
};