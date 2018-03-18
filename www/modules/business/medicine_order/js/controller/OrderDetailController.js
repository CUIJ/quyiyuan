/**
 * 产品名称：quyiyuan.
 * 创建用户：田新
 * 日期：2015年7月3日
 * 创建原因：订单详情页面控制器
 */
new KyeeModule()
    .group("kyee.quyiyuan.medicineOrder.orderDetail.controller")
    .require([
        "kyee.quyiyuan.medicineOrder.logisticsDetail.controller",
        "kyee.quyiyuan.payOrder.service",
        "kyee.quyiyuan.medicineOrder.service",
        "kyee.quyiyuan.medicineOrder.orderDetail.service",
        "kyee.quyiyuan.address_manage.service"
    ])
    .type("controller")
    .name("OrderDetailController")
    .params(["$scope", "$state","KyeeViewService", "PayOrderService", "MedicineOrderService",
            "OrderDetailService", "KyeeListenerRegister", "AddressmanageService"])
    .action(function($scope, $state,KyeeViewService, PayOrderService, MedicineOrderService,
                     OrderDetailService, KyeeListenerRegister, AddressmanageService){

        KyeeListenerRegister.regist({
            focus: "orderDetail",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (params) {
                //每次进入页面前都执行,否则可能受缓存影响
                $scope.order = MedicineOrderService.order;
                //吴伟刚 KYEEAPPC-3116 网络医院物流信息字段优化
                $scope.order.DELIVERY_INFO = JSON.parse(MedicineOrderService.order.DELIVERY_INFO);
            }
        });

        //查看物流详情
        $scope.showLogisticsDetail = function(){
            $state.go("logisticsDetail");
        };

        //确认付款
        $scope.toPay = function(order){
            OrderDetailService.toPay(order, function(payInfo){
                PayOrderService.payData = payInfo;
                $state.go("payOrder");
            });
        };

        //根据状态号码获取状态名称
        $scope.getStatusName = function(orderStatus){
            return MedicineOrderService.getStatusName(orderStatus);
        };

        //根据状态号码获取状态编码
        $scope.getStatusCode = function(orderStatus){
            return MedicineOrderService.getStatusCode(orderStatus);
        };

        //编辑收货地址（只有订单状态为“等待支付”时才可以编辑）
        $scope.editAddress = function(order){
            if($scope.getStatusCode(order.ORDER_STATUS) == "WAIT_PAY"){
                AddressmanageService.queryAddressInfoById(order.ADDRESS_ID, function(addressInfo){
                    addressInfo.fromSource = 1;//吴伟刚 KYEEAPPC-2995 网络医院之电子订单支付是修改地址提示信息
                    addressInfo.ORDER_STATUS = $scope.order.ORDER_STATUS;
                    addressInfo.MASTER_ID = $scope.order.MASTER_ID;
                    AddressmanageService.editAddressModel = addressInfo;
                    $state.go("edit_address");
                });
            }
        };
        //跳转到配送范围页面 吴伟刚 KYEEAPPC-2996 网络医院订单详情页加入配送范围链接
        $scope.toSendAddress = function(){
            KyeeViewService.openModalFromUrl({
                url : "modules/business/appoint/views/send_address.html",
                scope : $scope,
                animation : "scale-in"
            });
        }
    })
    .build();
