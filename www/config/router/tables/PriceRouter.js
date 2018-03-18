/**
 * 产品名称 quyiyuan.
 * 创建用户: 付添
 * 日期: 2015/9/27
 * 创建原因：价格公示
 * 修改： By
 * 修改： By
 */
var PRICE_ROUTER_TABLE={
    //价格公示
    "price": {
        url: "/price",
        views: {
            "main_view": {
                templateUrl: "modules/business/price/index.html",
                controller: "PriceController"
            }
        }
   } ,
    "price_medical_detail":{
        url: "/price_medical_detail",
        views: {
            "main_view": {
                templateUrl: "modules/business/price/views/price_medical_detail.html",
                controller: "PriceMedicalDetailController"
            }
        }
    }
};
