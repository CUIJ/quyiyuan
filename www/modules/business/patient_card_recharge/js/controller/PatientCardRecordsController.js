/**
 * 产品名称：quyiyuan
 * 创建者：程铄闵
 * 创建时间：2016年2月22日15:09:26
 * 创建原因：就诊卡充值记录(2.1.60版后)控制层
 * 任务号：KYEEAPPC-5217
 * 修改者：程铄闵
 * 修改时间：2016年9月27日15:10:43
 * 修改原因：2.3.10版修改增加退费记录
 * 任务号：KYEEAPPC-8089
 */
new KyeeModule()
    .group("kyee.quyiyuan.patient_card_records.controller")
    .require(["kyee.quyiyuan.patient_card_records.service"])
    .type("controller")
    .name("PatientCardRecordsController")
    .params(["$scope", "$state", "$ionicHistory", "KyeeI18nService", "PatientCardRecordsService", "MyRefundDetailNewService","KyeeListenerRegister",
        "$ionicScrollDelegate","$timeout","PatientCardRechargeService","KyeeMessageService","PayOrderService","CardRechargeConfirmService",
        "PatientCardRefundService","MyRefundDetailService","HealthCardService","StatusBarPushService"])
    .action(function ($scope, $state, $ionicHistory, KyeeI18nService, PatientCardRecordsService,MyRefundDetailNewService, KyeeListenerRegister,
                      $ionicScrollDelegate,$timeout,PatientCardRechargeService,KyeeMessageService,PayOrderService,CardRechargeConfirmService,
                      PatientCardRefundService,MyRefundDetailService,HealthCardService,StatusBarPushService) {

        $scope.isEmpty = false;
        $scope.emptyText = undefined;
        var currentPage = 1;//当前是第1页
        var rows = 10; //每页显示数据为10条
        $scope.noLoad = true;//初始化加载状态
        $scope.records = [];//历史记录

        $scope.fromHospital = false;//默认不是从医院首页进入
        $scope.showRecharge = false;//默认不显示充值记录
        $scope.showRefund = false;//默认不显示充值记录
        //外部通知跳转进来，显示返回键
        if(StatusBarPushService.webJump){
            $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
                viewData.enableBack = true;
            });
        };
        /* 充值部分 begin */
        //初始化数据
        var initRecharge = function(records,emptyText){
            if(records){
                loadRechargeData(records);
            }
            if(emptyText){
                $scope.showView = '';
                $scope.isEmpty = true;
                $scope.emptyText = emptyText;
            }else{
                $scope.isEmpty = false;
            }
            $scope.$broadcast('scroll.refreshComplete');
        };

        //加载更多数据
        var loadRechargeData = function(data){
            if(data.data){
                var total = data.data.total;//记录总数
                if(total>0){
                    var arr = data.data.rows;
                    //校验数据是否加载完
                    var currentNum =  $scope.records.length + arr.length;
                    currentPage++;
                    if(currentNum >= total){
                        $scope.noLoad = false;//已加载完成
                    }
                    //追加加载数据
                    for(var i=0;i<arr.length;i++){
                        $scope.records.push(arr[i]);
                    }
                }
            }
            $scope.$broadcast('scroll.infiniteScrollComplete');
        };

        //加载更多记录
        $scope.loadRechargeMore = function(){
            if($scope.showHead == 'recharge'){
                PatientCardRecordsService.queryChargeRecord(true,currentPage,rows,function(records,emptyText){
                    initRecharge(records,emptyText);
                });
            }
        };

        //加载充值记录
        $scope.loadRecharge = function(showLoading){
            $scope.showHead = 'recharge';
            currentPage = 1;
            PatientCardRecordsService.queryChargeRecord(showLoading,currentPage,rows,function(records,emptyText){
                $scope.showView = 'recharge';
                $scope.records = [];//重置数据
                $scope.noLoad = true;//重置加载状态
                $ionicScrollDelegate.scrollTop();
                initRecharge(records,emptyText);
                resizeView();
            });
        };

        //就诊卡充值记录的删除 by 杜巍巍
        $scope.delCardRechargeRecords = function ($index,record) {
            KyeeMessageService.confirm({
                title: KyeeI18nService.get("commonText.msgTitle","消息"),
                content: KyeeI18nService.get("patient_card_records.delConfirm","请确认是否删除该条记录？"),
                onSelect: function (flag) {
                    if (flag) {
                        PatientCardRecordsService.delCardRechargeRecords(function(){
                            $scope.records.splice($index, 1);
                            $scope.loadRecharge(true);
                        },record.PATD_ID);
                    }
                }
            });
        };

        //跳转到退费充值详情
        $scope.goRefundDetail = function(item){
            HealthCardService.healthCardPayToRecords = true;
            MyRefundDetailNewService.OUT_TRADE_NO=item.OUT_TRADE_NO;
            $state.go('refund_detail_new');
        };


        /* 充值部分 end */

        /* 退费部分 begin */
        $scope.loadRefund = function(){
            $scope.isEmpty = false;
            $scope.showView = 'refund';
            $scope.showHead = 'refund';
            resizeView();
            PatientCardRefundService.getRefund(function(data){
                if(data.data && data.data.total>0) {
                    $scope.refundRecord = data.data;
                }
                else{
                    $scope.showView = '';
                    $scope.isEmpty = true;
                    $scope.emptyText = data.message;
                }
            });
            $scope.$broadcast('scroll.refreshComplete');
        };

        //退费详情
        $scope.showDetail = function(index,detail,refundSerialNo,refundApplyStatus){
            var outTradeNo = detail[index].OUT_TRADE_NO;
            MyRefundDetailService.fromView = 'patient_card_refund';
            MyRefundDetailService.param = {
                OUT_TRADE_NO:outTradeNo,
                REFUND_SERIAL_NO:refundSerialNo
            };
            if(refundApplyStatus==1) {
                $state.go('refund_detail');
            }
        };
        /* 退费部分 end */

       //弹出失败信息
        $scope.alertFailue =function(item){
            if(item!=undefined){
                KyeeMessageService.message({
                    title : KyeeI18nService.get("patient_card_records.noticeMessage","失败原因"),
                    content : KyeeI18nService.get("patient_card_records.message",item),
                    okText: KyeeI18nService.get("commonText.iknowMsg","我知道了")
                });
            }
        };

        /* 公共 begin */
        //重置页面滚动
        var resizeView = function(){
            $timeout(
                function () {
                    if($ionicScrollDelegate.$getByHandle("patient_card_records")){
                        $ionicScrollDelegate.$getByHandle("patient_card_records").resize();
                    }
                },
                500
            );
        };

        //初始化权限
        var init = function(){
            $scope.fromHospital = PatientCardRechargeService.fromView=='home->MAIN_TAB';
            //预缴未开通直接初始化历史数据
            var info = PatientCardRechargeService.rechargeInfo;
            $scope.showRecharge = info.PATIENT_RECHARGE==1;//充值权限
            $scope.showRefund = info.PATIENT_RETURN==1;//退费权限
            resizeView();
            $scope.fromPayOrder = PayOrderService.fromRechargeOrder;//从支付订单的充值进入
            $scope.fromApplyRefund  = PatientCardRefundService.fromApplyRefund;//从申请退费进入
            $scope.fromRefund = MyRefundDetailService.fromRefund;//从退费详情进入
            /**
             * 健康卡充值页面进入
             */
            if(!HealthCardService.healthCardPayToRecords){
                PatientCardRecordsService.isHealthCard = 0;
            }
            if($scope.fromPayOrder || CardRechargeConfirmService.rechargeToOrder || HealthCardService.healthCardPayToRecords){
                HealthCardService.healthCardPayToRecords = false;
                CardRechargeConfirmService.rechargeToOrder = false;
                $scope.fromRefund = false;
                PatientCardRefundService.fromRefund = false;
                $scope.showRecharge = true;
                $scope.showRefund = false;
                $scope.fromHospital = true;
                $scope.loadRecharge(true);
            }
            else if($scope.fromApplyRefund){
                PatientCardRefundService.fromApplyRefund = false;
                $scope.showRecharge = false;
                $scope.showRefund = true;
                $scope.fromHospital = true;
                $scope.loadRefund(); //退费
            }/*else if($scope.fromRefund){//从退费详情返回
                PatientCardRefundService.fromRefund = false;
                $scope.fromHospital = true;
                $scope.loadRefund(); //退费
            }*/
            else{
                //从医院首页进入
                if($scope.fromHospital){
                    if(PatientCardRechargeService.flag){
                        PatientCardRechargeService.flag = false;
                        $scope.showRefund = true;
                        $scope.showRecharge = true;
                        $scope.loadRefund(); //退费
                    }else{
                        $scope.loadRecharge(true);
                        $scope.showRecharge = true;
                        $scope.showRefund = true;
                    }
                 /*   if(info.PATIENT_RECHARGE == 1){
                        $scope.showRecharge = true;
                        $scope.loadRecharge(true);
                        if(info.PATIENT_RETURN == 1){
                            $scope.showRefund = true;
                        }
                        else{
                            $scope.showRefund = false;
                        }
                    }
                    else if(info.PATIENT_RETURN == 1){
                        $scope.showRefund = true;
                        $scope.showRecharge = false;
                        $scope.loadRefund(); //退费
                    }*/
                } else{
                    if(PatientCardRechargeService.flag){
                        PatientCardRechargeService.flag = false;
                        $scope.showRefund = true;
                        $scope.showRecharge = false;
                        $scope.loadRefund(); //退费
                    }else{
                        $scope.loadRecharge(true);
                        $scope.showRecharge = true;
                        $scope.showRefund = true;
                    }
                }
            }
        };

        //下拉刷新
        $scope.doRefresh = function(){
            if($scope.showHead == 'recharge'){
                $scope.loadRecharge(false);
                resizeView();
            }
            else{
                resizeView();
                $scope.loadRefund();
                $scope.$broadcast('scroll.refreshComplete');
                return;
            }
        };

        init();

        //返回
        $scope.goBack = function(){
            if(StatusBarPushService.webJump){
                StatusBarPushService.webJump = false;
                $state.go('home->MAIN_TAB');
                return;
            }
            else{
            PatientCardRecordsService.isHealthCard = 0;
            HealthCardService.healthCardPayToRecords = false;
            //就诊卡充值 支付成功之后跳转充值记录页面，点击充值记录页面的返回按钮，跳转查卡页面
            if(PayOrderService.healthCardPayOrder == 1){
                PayOrderService.healthCardPayOrder = 0;
                $state.go("healthCard")
            }else{
                //从支付订单的充值返回 程铄闵 KYEEAPPC-7823
                if(PayOrderService.fromRechargeOrder){
                    PayOrderService.fromRechargeOrder = false;
                    PayOrderService.payData = PayOrderService.lastPayData;
                    $state.go('payOrder');
                }
                else{
                    //从支付返回刷新页面
                    if($ionicHistory.backView().stateId=='payOrder' || PayOrderService.fromPayOrderNew){
                        PayOrderService.fromPayOrderNew = false;
                        $ionicHistory.goBack(-3);
                    }
                    else if($scope.fromApplyRefund){//从退费记录中返回
                        PayOrderService.fromRechargeOrder = false;
                        $ionicHistory.goBack(-2);
                    }
                    /*                //从网页版支付成功直接返回 程铄闵 KYEEAPPC-5420
                                    else if($ionicHistory.backView().stateId=='webPay'){
                                        $ionicHistory.goBack(-4);
                                    }*/
                    else{
                        $ionicHistory.goBack();
                    }
                }
            }}
        };

        //监听物理返回键
        KyeeListenerRegister.regist({
            focus: "patient_card_records",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.goBack();
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
        /* 公共 end */
    })
    .build();