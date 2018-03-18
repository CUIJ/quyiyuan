/*
 * 产品名称：quyiyuan
 * 创建人: 程铄闵
 * 创建日期:2015/9/2
 * 创建原因：我的钱包--住院业务缴费详细记录控制
 * 任务号：KYEEAPPC-3277
 * 修改者：程铄闵
 * 修改时间：2016年6月17日10:22:51
 * 修改原因：2.2.40版住院费用（医院首页入口）
 * 任务号：KYEEAPPC-6603
 * 修改者：张婧
 * 修改时间：2016年7月27日10:24:42
 * 修改原因：添加单击钮统计
 * 任务号：KYEEAPPC-6641
 */
new KyeeModule()
    .group("kyee.quyiyuan.myWallet.inpatientPaymentDetail.controller")
    .require(["kyee.quyiyuan.myWallet.inpatientPayment.service",
        "kyee.quyiyuan.myWallet.inpatientPaymentDetail.service"])
    .type("controller")
    .name("InpatientPaymentDetailController")
    .params(["$scope", "$state","InpatientPaymentService","KyeeUtilsService","KyeeMessageService","InpatientPaymentDetailService","OperationMonitor"])
    .action(function ($scope, $state,InpatientPaymentService,KyeeUtilsService,KyeeMessageService,InpatientPaymentDetailService,OperationMonitor) {
        $scope.isEmpty = true;
        $scope.isViewAmount = false;
        $scope.isShowAmount = false;//针对数据库是0.0志
        InpatientPaymentDetailService.loadData (function(success,data){
            if(success){
                $scope.isEmpty = false;
                $scope.detailData = data;
                for(var i=0;i< data.DATA.length;i++){
                    var groupData = data.DATA[i].GROUP_DATA;
                    for(var j=0;j < groupData.length;j++){
                        if(groupData[j].AMOUNT && groupData[j].AMOUNT>0){//如果有不为空的就显示
                            $scope.isShowAmount = true;
                            break;
                        }
                    }
                }
                 for(var i=0;i< data.DATA.length;i++){
                     var groupData = data.DATA[i].GROUP_DATA;
                     for(var j=0;j < groupData.length;j++){
                         if(groupData[j].AMOUNT){//如果有不为空的就显示
                             $scope.isViewAmount = true;
                             break;
                         }
                     }
                }
            }
            else{
                $scope.isEmpty = true;
                $scope.emptyText = data;
            }
        });


        //对话框
        var dialog = undefined;

        //日期格式转换
        $scope.convertDate = function (v) {
            if (v != undefined) {
                return KyeeUtilsService.DateUtils.formatFromDate(v, 'YYYY/MM/DD');
            }
        };

        //数量格式转换
        $scope.convertAmount = function (v) {
            if (v != undefined) {
                v = parseFloat(v);
                var data = v.toFixed(2);
                return data;
            }
        };

        //转换金额
        $scope.convertMoney = function(v){
            if (v != undefined) {
                v = parseFloat(v);
                var data = v.toFixed(2);
                return data;
            }
        };

        //点击详情弹框
        $scope.showDetail = function(v){
            OperationMonitor.record("showDetail","inpatient_payment_detail");//添加按钮统计
            //弹出对话框
            $scope.detailPopup = v;//第三层数据
            dialog = KyeeMessageService.dialog({
                template: "modules/business/my_wallet/inpatient_payment/views/payment_detail_popup.html",
                tapBgToClose:true,//程铄闵 KYEEAPPC-5582 点击周围可关闭
                scope: $scope
            });
        };

        //关闭对话框
        $scope.closeDialog = function () {
            dialog.close();
        };
    })
    .build();