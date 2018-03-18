/**
 * 产品名称：quyiyuan.
 * 创建用户：田新
 * 日期：2015年7月3日
 * 创建原因：药品订单页面控制器
 */
new KyeeModule()
    .group("kyee.quyiyuan.medicineOrder.controller")
    .require([
        "kyee.quyiyuan.medicineOrder.orderDetail.controller",
        "kyee.framework.base.support.listener",
        "kyee.quyiyuan.medicineOrder.service"
    ])
    .type("controller")
    .name("MedicineOrderController")
    .params(["$scope", "$state", "KyeeListenerRegister", "MedicineOrderService",
            "$ionicHistory", "$q", "KyeeMessageService", "KyeeI18nService","KyeeFrameworkConfig"])
    .action(function($scope, $state, KyeeListenerRegister, MedicineOrderService,
                     $ionicHistory, $q, KyeeMessageService,KyeeI18nService, KyeeFrameworkConfig){

        $scope.ordersInfo = {
            orders : [],
            pageNum : 1,
            pageSize : 10,
            hasData : true
        };

        $scope.moreDataCanBeLoadedFlag = false;

        //获取订单信息
        $scope.getOrderInfo = function(pageNum, pageSize, stopFresh, stopDownFresh){
            MedicineOrderService.getOrderInfo(pageNum, pageSize, stopDownFresh, function(orderInfos){
                var len = orderInfos.length;
                if(len == 0 && pageNum == 1){    //没有数据显示提示信息
                    $scope.ordersInfo.hasData = false;
                }
                if(len == 0 || len < pageSize){    //如果没有数据或数据填充不满当前页，则取消上拉刷新
                    $scope.moreDataCanBeLoadedFlag = false;
                }else{
                    $scope.moreDataCanBeLoadedFlag = true;
                }
                for(var i= 0; i<len; i++){
                    var orderInfo = orderInfos[i];
                    $scope.ordersInfo.orders.push(orderInfo);
                }
                if(stopFresh){    // 下拉刷新完成后通知directive已加载完成,取消转圈
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                }
                if(stopDownFresh){
                    $scope.$broadcast('scroll.refreshComplete');
                }
            });
        };

        //进入页面加载第一页的记录
        $scope.getOrderInfo($scope.ordersInfo.pageNum, $scope.ordersInfo.pageSize);

        //上拉刷新,显示下一页的订单信息
        $scope.getMoreOrderInfo = function(){
            $scope.getOrderInfo(++$scope.ordersInfo.pageNum, $scope.ordersInfo.pageSize, true);
        };

        //根据状态号码获取状态名称
        $scope.getStatusName = function(orderStatus){
            return MedicineOrderService.getStatusName(orderStatus);
        };

        //根据状态号码获取状态编码
        $scope.getStatusCode = function(orderStatus){
            return MedicineOrderService.getStatusCode(orderStatus);
        };

        //查看订单详情(点击订单信息或付款按钮跳转到订单详情页面),首先需要查询物流信息
        $scope.showDetail = function(order){
            var getLogisticsInfoPromise = MedicineOrderService.getLogisticsInfo(order);
            var getLatestOrderInfoPromise = MedicineOrderService.getLatestOrderInfo(order);
            $q.all([getLogisticsInfoPromise, getLatestOrderInfoPromise])
                .then(function(result){
                    var logisticsInfo = result[0];
                    var latestOrderInfo = result[1];
                    latestOrderInfo.logisticsInfo = logisticsInfo;
                    MedicineOrderService.order = latestOrderInfo;
                    $state.go("orderDetail");
                });
        };

        //查看物流详情
        $scope.showLogisticsInfo = function(order){
            MedicineOrderService.getLogisticsInfo(order)
                .then(function(result){
                    order.logisticsInfo = result;
                    MedicineOrderService.order = order;
                    $state.go("logisticsDetail");
                });
        };

        // 获取供应商信息
        $scope.getSupplierInfo = function(order){
            MedicineOrderService.getSupplierInfo(order, function(data){
                $scope.supplierInfo = data;
                var dialog = KyeeMessageService.dialog({
                    title : order.MERCHANT_NAME,
                    template : "modules/business/medicine_order/views/supplier_info.html",
                    scope : $scope,
                    buttons : [
                        {
                            text :  KyeeI18nService.get("commonText.ensureMsg","确定"),
                            style : "kyee_framework_message_dialog_ok_button",
                            click : function(){
                                dialog.close();
                            }
                        }
                    ]
                });
            });
        };

        //下拉刷新,显示第一页记录
        $scope.onRefresh = function(){
            $scope.ordersInfo.orders = [];
            $scope.getOrderInfo(1, $scope.ordersInfo.pageSize, false, true);
        };

        //修改导航历史,从支付页面跳转到药品订单后，将上一个页面的历史记录改为个人中心，以便使用导航回退时回到个人中心
        var backView = $ionicHistory.viewHistory().backView;
        if(backView.stateId == "payOrder"){
            backView.stateId = "center->MAIN_TAB";
            backView.stateName = "center->MAIN_TAB";
        }
    })
    .build();
