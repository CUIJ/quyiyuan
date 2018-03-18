/**
 * 产品名称：quyiyuan.
 * 创建用户：田新
 * 日期：2015年7月3日
 * 创建原因：物流详情页面控制器
 */
new KyeeModule()
    .group("kyee.quyiyuan.medicineOrder.logisticsDetail.controller")
    .require([
        "kyee.quyiyuan.medicineOrder.service"
    ])
    .type("controller")
    .name("LogisticsDetailController")
    .params(["$scope", "MedicineOrderService", "KyeeListenerRegister"])
    .action(function($scope, MedicineOrderService, KyeeListenerRegister){

        KyeeListenerRegister.regist({
            focus: "logisticsDetail",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (params) {
                //每次进入页面前都执行,否则可能受缓存影响
                $scope.order = MedicineOrderService.order;
            }
        });

        //根据状态号码获取状态名称
        $scope.getStatusName = function(orderStatus){
            return MedicineOrderService.getStatusName(orderStatus);
        };

        //根据状态号码获取状态编码
        $scope.getStatusCode = function(orderStatus){
            return MedicineOrderService.getStatusCode(orderStatus);
        };
    })
    .build();
