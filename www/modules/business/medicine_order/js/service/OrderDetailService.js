/**
 * 产品名称：quyiyuan
 * 创建者：田新
 * 创建时间： 2015年7月3日
 * 创建原因：订单详情service
 */
new KyeeModule()
    .group("kyee.quyiyuan.medicineOrder.orderDetail.service")
    .require([
    ])
    .type("service")
    .name("OrderDetailService")
    .params([
        "HttpServiceBus", "KyeeMessageService"
    ])
    .action(function(HttpServiceBus, KyeeMessageService){
        var def = {
            toPay : function(order, callBack){
                HttpServiceBus.connect({
                     url : "/netorder/action/NetOrderActionC.jspx",
                     params : {
                         op: "createQyOrder",
                         MASTER_ID : order.MASTER_ID
                     },
                     onSuccess : function (resp) {
                         var success = resp.success;
                         var data = resp.data;
                         if(success && data){
                             var payInfo = {
                                 TRADE_NO : data.OUT_TRADE_NO,
                                 MARK_DESC : data.DESC,
                                 MARK_DETAIL : data.DETAIL_DESC,
                                 AMOUNT : data.TOTAL_FEE,
                                 ROUTER : "medicineOrder",
                                 MASTER_ID : order.MASTER_ID
                             };
                             callBack(payInfo);
                         } else{
                             KyeeMessageService.broadcast({
                                 content : resp.message
                             });
                         }
                     }
                 });

            }
        };
        return def;
    })
    .build();
