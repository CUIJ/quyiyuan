/**
 * 产品名称：quyiyuan
 * 创建者：yinguangwen
 * 创建时间：2016-4-18 15:57:28
 * 创建原因：退费详情控制器
 * 任务号：KYEEAPPC-5846
 */
new KyeeModule()
    .group("kyee.quyiyuan.myRefundDetailNew.controller")
    .require(["kyee.quyiyuan.myRefundDetailNew.service"])
    .type("controller")
    .name("MyRefundDetailNewController")
    .params(["$scope", "$state","MyRefundDetailNewService","KyeeI18nService","KyeeUtilsService"])
    .action(function ($scope, $state,MyRefundDetailNewService,KyeeI18nService,KyeeUtilsService) {
        //初始化无数据标记
        $scope.isEmpty = true;
        $scope.emptyText = undefined;
        $scope.refundRecords=undefined;
        //获取明细
        MyRefundDetailNewService.loadData(function(success,message,data){
            if(success){
                if(data){
                    var objRefundData=JSON.parse(data.REFUND_DATA);
                    var rows = objRefundData.rows[0];
                    if(objRefundData.total > 0){
                        $scope.isEmpty = false;
                        $scope.refundRecords = rows;
                        if(($scope.refundRecords.ACCOUNT_FLAG==3 || $scope.refundRecords.TRADE_STATUS==4 || $scope.refundRecords.TRADE_STATUS==6 || $scope.refundRecords.PAY_STATUS==5)&&($scope.refundRecords.TRADE_TIME<$scope.refundRecords.CREATE_TIME)){
                            $scope.refundRecords.CREATE_TIME=$scope.refundRecords.TRADE_TIME;
                        }
                        if(($scope.refundRecords.ACCOUNT_FLAG==5||$scope.refundRecords.RETURN_STATUS==2||($scope.refundRecords.RETURN_STATUS==0 && $scope.refundRecords.LEADERSHIP_AUDIT==3))&&($scope.refundRecords.TRANS_TIME<$scope.refundRecords.TRADE_TIME)){
                            $scope.refundRecords.CREATE_TIME=$scope.refundRecords.TRANS_TIME;
                        }
                        $scope.refundTips=data;
                    }
                    else{
                        $scope.isEmpty = true;
                        $scope.emptyText = message;
                    }
                }
                else{
                    $scope.isEmpty = true;
                    $scope.emptyText = message;
                }
            }
            else{
                $scope.isEmpty = true;
                $scope.emptyText = message;
            }
        });
        //转换业务状态
        $scope.convertModelCode = function(v){
            if(v == "01"){
                return KyeeI18nService.get("refund_detail_new.modelCode01","挂号费用");
            }
            else if(v == "02"){
                return KyeeI18nService.get("refund_detail_new.modelCode02","门诊费用");
            }
            else if(v == "03"){
                return KyeeI18nService.get("refund_detail_new.modelCode03","预约预缴");
            }
            else if(v == "04"){
                return KyeeI18nService.get("refund_detail_new.modelCode04","住院预缴");
            }

            else if(v == "05"){
                return KyeeI18nService.get("refund_detail_new.modelCode05","预约转挂号");
            }

            else if(v == "06"){
                return KyeeI18nService.get("refund_detail_new.modelCode06","就诊卡充值");
            }

            else if(v == "07"){
                return KyeeI18nService.get("refund_detail_new.modelCode07","网络医院");
            }

            else if(v == "08"){
                return KyeeI18nService.get("refund_detail_new.modelCode08","新农合");
            }else if(v == "11"){
                return "健康卡充值";
            }
            else{
                return KyeeI18nService.get("refund_detail_new.modelCode0x",v);
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
        $scope.getDealingTime = function(dealTime,operatorCode){
            if(!dealTime){
                return;
            }
            var dayTime = KyeeUtilsService.DateUtils.formatFromDate(dealTime,'YYYY/MM/DD');
            dealTime=KyeeUtilsService.DateUtils.formatFromDate(dealTime,'YYYY/MM/DD HH:mm:ss');
            if(operatorCode==3){
                return dealTime;
            }
            var standardTime=KyeeUtilsService.DateUtils.formatFromDate(dayTime+" 14:00:00",'YYYY/MM/DD HH:mm:ss');
            var aboutTime=undefined;
            if(dealTime>=standardTime) {
                aboutTime=new Date(dayTime);
                var transMonth=undefined;
                var transDay=undefined;
                if(aboutTime.getMonth()<9){
                     transMonth='0'+(aboutTime.getMonth()+1);
                }
                else{
                     transMonth=aboutTime.getMonth()+1;
                }
                if(aboutTime.getDate()<9){
                    transDay='0'+(aboutTime.getDate()+1);
                }
                else{
                    transDay=aboutTime.getDate()+1;
                }
                if (operatorCode == 1) {
                    aboutTime = aboutTime.getFullYear() + '/' + transMonth + '/' + transDay + ' ' + (aboutTime.getHours()+12) + ':' + (aboutTime.getMinutes()+30) + ':0' + aboutTime.getSeconds();
                } else {
                    aboutTime = aboutTime.getFullYear() + '/' + transMonth + '/' + transDay + ' ' + (aboutTime.getHours()+12) + ':' + aboutTime.getMinutes() + '0:0' + aboutTime.getSeconds();
                }
                    return aboutTime;
            }
            else{

                if(operatorCode==0){
                    aboutTime=KyeeUtilsService.DateUtils.formatFromDate(dayTime+" 18:00:00",'YYYY/MM/DD HH:mm:ss');
                    return aboutTime;
                }
                else{
                    aboutTime=KyeeUtilsService.DateUtils.formatFromDate(dayTime+" 18:30:00",'YYYY/MM/DD HH:mm:ss');
                    return aboutTime;
                }
            }
        };
    })
    .build();