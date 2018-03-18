/*
 * 产品名称：quyiyuan
 * 创建人: 程铄闵
 * 创建日期:2015年10月14日16:17:24
 * 创建原因：住院已结算详情控制
 * 任务号：KYEEAPPC-3523
 * 修改者：程铄闵
 * 修改时间：2015年12月13日21:27:16
 * 修改原因：住院费用优化（2.1.10）
 * 任务号：KYEEAPPC-4453
 * 修改者：程铄闵
 * 修改时间：2016年6月17日10:22:51
 * 修改原因：2.2.40版住院已结算（医院首页入口）
 * 任务号：KYEEAPPC-6605
 */
new KyeeModule()
    .group("kyee.quyiyuan.myWallet.inpatientDetailRecord.controller")
    .require(["kyee.quyiyuan.myWallet.inpatientPaid.service"])
    .type("controller")
    .name("InpatientPaidDetailController")
    .params(["$scope","$state","KyeeMessageService","InpatientPaidService","KyeeUtilsService",
        "InpatientGeneralService","KyeeI18nService"])
    .action(function ($scope,$state,KyeeMessageService,InpatientPaidService,KyeeUtilsService,
                      InpatientGeneralService,KyeeI18nService) {
        //初始化账单详情数据
        $scope.detailData = InpatientPaidService.paidDetail;

        var dialog;
        //点击详情弹框
        $scope.showDetail = function(v){
            //弹出对话框
            $scope.detailPopup = v;//第三层数据
            dialog = KyeeMessageService.dialog({
                template: "modules/business/my_wallet/inpatient_payment/views/paid_detail_popup.html",
                tapBgToClose:true,//程铄闵 KYEEAPPC-5582 点击周围可关闭
                scope: $scope
            });
        };

        //删除
        $scope.delete = function () {
            KyeeMessageService.confirm({
                title: KyeeI18nService.get("commonText.msgTitle","消息"),
                content: KyeeI18nService.get("inpatient_paid_record.delTip","请确认是否删除该条记录？"),
                onSelect: function (flag) {
                    if (flag) {
                        InpatientPaidService.delInpatientPaidRecord(function(){
                            if(InpatientPaidService.afterDelete){
                                $state.go('inpatient_paid_record');
                            }
                            else if(InpatientGeneralService.fromDetail){
                                InpatientGeneralService.afterDelete = true;
                                $state.go('inpatient_general');
                            }
                        },$scope.detailData.C_INPM_ID);
                    }
                }
            });
        };

        //关闭对话框
        $scope.closeDialog = function () {
            dialog.close();
        };

        //转换金额
        $scope.convertMoney = function(v,isSum){
            if (v != undefined) {
                v = parseFloat(v);
                var data = v.toFixed(2);
                if(isSum){
                    return data;
                }
                return '¥ '+data;
            }
        };

        //日期格式转换
        $scope.convertDate = function(v){
            if(v){
                var time = KyeeUtilsService.DateUtils.formatFromDate(v,'YYYY/MM/DD');
                return time;
            }
        };
    })
    .build();