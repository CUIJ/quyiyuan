/**
 * 产品名称：quyiyuan
 * 创建者：程铄闵
 * 创建时间：2015年10月21日15:21:36
 * 创建原因：退费明细控制器
 * 任务号：KYEEAPPC-3596
 * 修改者：程铄闵
 * 修改时间：2016年7月20日21:03:58
 * 修改原因：增加门诊多笔退费
 * 任务号：KYEEAPPC-7114
 */
new KyeeModule()
    .group("kyee.quyiyuan.myRefundDetail.controller")
    .require(["kyee.quyiyuan.myRefundDetail.service"])
    .type("controller")
    .name("MyRefundDetailController")
    .params(["$scope", "$state","MyRefundDetailService","KyeeUtilsService","$ionicScrollDelegate","$ionicHistory",
        "KyeeListenerRegister","$timeout","PatientCardRechargeService"])
    .action(function ($scope, $state,MyRefundDetailService,KyeeUtilsService,$ionicScrollDelegate,$ionicHistory,
                      KyeeListenerRegister,$timeout,PatientCardRechargeService) {
        //初始化无数据标记
        $scope.isEmpty = true;
        $scope.emptyText = undefined;//KYEEAPPTEST-3190 程铄闵
        $scope.isShowClinicAmount = false;//是否显示门诊金额滑动框
        $scope.isClinicDetail = false;//是否显示门诊退费项目详情

        //初始化退费总金额
        var initRefundSum = function(){
            var params = MyRefundDetailService.params;
            if(params && params.flag){
                $scope.refundSum = params.refundSum;
            }
        };

        //获取当前状态  程铄闵 KYEEAPPC-7610
        var getCurrentStatus = function(){
            var arr = [1,0,0,0];
            $scope.status = [false,false,false,false];
            if($scope.record.SECOND_STATUS == "DONE"){
                arr[1] = 1;
            }
            if($scope.record.THIRD_STATUS == "DONE"){
                arr[2] = 1;
            }
            if($scope.record.FOURTH_STATUS == "DONE"){
                arr[3] = 1;
            }
            var i = 3;
            for(; i>0; i--){
                if(arr[i] == 1){
                    break;
                }
            }
            $scope.status[i] = true;
        };

        //初始化滚动部分 程铄闵 KYEEAPPC-7610
        var initScroll = function(){
            var x1 = KyeeUtilsService.getInnerSize().width-72;
            var x2 = x1*2/3;
            $scope.a = [];
            $scope.b = [];
            $scope.a[0] = 0;
            $scope.b[0] = 0;
            for(var k=1;k<$scope.len;k++){
                $scope.a[k] = 36+k*(10+x1)+x2;
                $scope.b[k] = k*(x1+10);
            }
            $timeout(function(){
                $ionicScrollDelegate.$getByHandle("refund_clinic_amount").scrollTo($scope.b[$scope.len-1], 0, false);
                $scope.record = $scope.records[$scope.len-1];//当前显示的数据
            },10);
        };

        //监听滚动事件
        $scope.forceAlign = function(){
            var left = $ionicScrollDelegate.$getByHandle("refund_clinic_amount").getScrollPosition().left+KyeeUtilsService.getInnerSize().width;
            var i=0;
            for(;i< $scope.a.length;i++){
                if(left<$scope.a[i]){
                    break;
                }
            }
            if(i<0){
                i = 0;
            }
            $ionicScrollDelegate.$getByHandle("refund_clinic_amount").scrollTo($scope.b[i-1], 0, false);
            $scope.record = $scope.records[i-1];
            getCurrentStatus();
            $ionicScrollDelegate.$getByHandle("refund_clinic_box").scrollTop();
        };

        //获取明细
        MyRefundDetailService.loadData(function(success,data){
            if(success){
                if(data){
                    $scope.isEmpty = false;
                    $scope.records = data.rows;
                    if(data.total > 1){
                        //多笔退费数目
                        $scope.len = data.total;
                        $scope.isShowClinicAmount = true;
                        initRefundSum();//初始化缴费总金额
                        initScroll();
                        $scope.record = $scope.records[$scope.len-1];
                    }
                    else{
                        $scope.record = $scope.records[0];//当前显示的数据
                    }
                    if($scope.record.RETURN_DETAIL){
                        $scope.isClinicDetail = true;
                    }
                    getCurrentStatus();
                }
                else{
                    $scope.isEmpty = true;
                    $scope.emptyText = data;
                }
            }
            else{
                $scope.isEmpty = true;
                $scope.emptyText = data;
            }
        });

        //返回
        $scope.back = function(){
           var s = $ionicHistory.backView().stateId;
           if(s!=undefined &&s!=''&&s=='patient_card_records'){
               PatientCardRechargeService.flag =true;
           }
            //清除入口参数
            MyRefundDetailService.params = {
                flag:undefined,
                refundSum:undefined,
                RETURN_ID: undefined,
                REFUND_TRADE_NO: undefined,
                OUT_TRADE_NO: undefined,
                REC_MASTER_ID: undefined,
                EXTRA_KEY:undefined,
                PAYTYPE_FLAG:undefined,
                READ_FLAG_ID:undefined
            };
            var backView = $ionicHistory.backView();
            if(backView && backView.stateId == 'clinic_refund_apply'){
                $ionicHistory.goBack(-2);
            }
            else{
                $ionicHistory.goBack();
            }
        };

        //监听物理返回键
        KyeeListenerRegister.regist({
            focus: "refund_detail",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.back();
            }
        });

        //转换金额
        $scope.convertMoney = function(v){
            if (v != undefined) {
                v = parseFloat(v);
                var data = v.toFixed(2);
                return data;
            }
        };
    })
    .build();