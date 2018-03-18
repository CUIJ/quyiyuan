/**
 * 产品名称：quyiyuan
 * 创建者：田新
 * 创建时间：2015年7月3日
 * 创建原因：药品订单service
 */
new KyeeModule()
    .group("kyee.quyiyuan.medicineOrder.service")
    .require([
        "kyee.framework.service.message",
        "kyee.quyiyuan.login.rsautil.service",
        "kyee.framework.service.push",
        "kyee.framework.device.deviceinfo",
        "kyee.framework.device.network",
        "kyee.quyiyuan.home.noticeCenter.service",
        "kyee.quyiyuan.home.user.service"
    ])
    .type("service")
    .name("MedicineOrderService")
    .params([
        "HttpServiceBus", "$q", "KyeeMessageService"
    ])
    .action(function(HttpServiceBus, $q, KyeeMessageService){
        //订单状态。
        //0＝等待支付，1＝支付完成（等待发货），2＝已发货，3=订单配送完成，4=订单已取消，（5=订单关闭）
        var orderStateConf = {
            0 : {
                statusName : "等待支付",
                statusCode : "WAIT_PAY"
            },
            1 : {
                statusName : "支付完成",
                statusCode : "COMPLETE_PAY"
            },
            2 : {
                statusName : "已发货",
                statusCode : "DELIVER_GOODS"
            },
            3 : {
                statusName : "订单配送完成",
                statusCode : "COMPLETE_ORDER"
            },
            4 : {
                statusName : "订单已取消",
                statusCode : "CANCEL_ORDER"
            },
            5 : {
                statusName : "订单关闭",
                statusCode : "CLOSE_ORDER"
            }
        };
        var def = {
            getStatusName : function(orderStatus){
                if(orderStatus == undefined || orderStatus == null){
                    return "";
                }
                return orderStateConf[orderStatus].statusName;
            },
            getStatusCode : function(orderStatus){
                if(orderStatus == undefined || orderStatus == null || !orderStateConf[orderStatus]){
                    return "";
                }
                return orderStateConf[orderStatus].statusCode;
            },
            order : {},
            getOrderInfo : function(pageNum, pageSize, stopDownFresh, callBack){
                HttpServiceBus.connect({
                    url : "/netorder/action/NetOrderActionC.jspx",
                    params : {
                        op: "getNetOrderInfo",
                        PAGE : pageNum,
                        ROWS : pageSize
                    },
                    showLoading : !stopDownFresh,
                    onSuccess : function (resp) {
                        var success = resp.success;
                        var data = resp.data;
                        if(success && data){
                            callBack(data.rows);
                        } else{
                            KyeeMessageService.broadcast({
                                content : resp.message
                            });
                        }
                    }
                });
            },
            //查询物流信息
            getLogisticsInfo : function(order){
                var orderStatus = def.getStatusCode(order.ORDER_STATUS);
                var deferred = $q.defer();
                HttpServiceBus.connect({
                    url : "/netorder/action/NetOrderActionC.jspx",
                    params : {
                        op: "getDeliveryInfo",
                        MASTER_ID : order.MASTER_ID
                    },
                    onSuccess : function (resp) {
                        var success = resp.success;
                        var data = resp.data;
                        if(success && data){
                            deferred.resolve(data);
                        }else{
                            if(orderStatus!='WAIT_PAY'&&orderStatus!='COMPLETE_PAY'){//吴伟刚 KYEEAPPC-3064 网络医院电子订单等待支付和支付成功状态不弹出物流信息获取失败框
                                KyeeMessageService.broadcast({
                                    content : resp.message
                                });
                            }
                            deferred.resolve({});  //吴伟刚 KYEEAPPC-3046 网络医院订单跨状态显示界面优化
                        }
                    }
                });
                return deferred.promise;
            },
            //查询实时订单信息
            getLatestOrderInfo : function(order){
                var deferred = $q.defer();
                HttpServiceBus.connect({
                    url : "/netorder/action/NetOrderActionC.jspx",
                    params : {
                        op: "getOrderInfo",
                        MASTER_ID : order.MASTER_ID
                    },
                    onSuccess : function (resp) {
                        var success = resp.success;
                        var data = resp.data;
                        if(success && data){
                            deferred.resolve(data);
                        } else{
                            KyeeMessageService.broadcast({
                                content : resp.message
                            });
                        }
                    }
                });
                return deferred.promise;
            },
            //获取供应商信息
            getSupplierInfo : function(order, callBack){
                HttpServiceBus.connect({
                    url : "/netorder/action/NetOrderRuleAction.jspx",
                    params : {
                        op: "getOrderRuleInfo",
                        MERCHANT_ID : order.MERCHANT_CODE
                    },
                    onSuccess : function (resp) {
                        var success = resp.success;
                        var data = resp.data;
                        if(success && data){
                            callBack(data);
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
