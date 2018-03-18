/**
 * 产品名称：quyiyuan
 * 创建者：程铄闵
 * 创建时间：2016年2月22日15:09:26
 * 创建原因：就诊卡充值记录(2.1.60版后)控制层
 * 任务号：KYEEAPPC-5217
 */
new KyeeModule()
    .group("kyee.quyiyuan.card_recharge_records.controller")
    .require(["kyee.quyiyuan.card_recharge_records.service"])
    .type("controller")
    .name("CardRechargeRecordsController")
    .params(["$scope", "$state", "$ionicHistory", "KyeeI18nService", "CardRechargeRecordsService", "MyRefundDetailNewService","KyeeListenerRegister",
        "$ionicScrollDelegate","$timeout","PatientCardRechargeService","KyeeMessageService","PayOrderService","CardRechargeConfirmService"])
    .action(function ($scope, $state, $ionicHistory, KyeeI18nService, CardRechargeRecordsService,MyRefundDetailNewService, KyeeListenerRegister,
                      $ionicScrollDelegate,$timeout,PatientCardRechargeService,KyeeMessageService,PayOrderService,CardRechargeConfirmService) {

        //默认显示底部黑框
        $scope.hiddenBar = false;

        $scope.isEmpty = false;
        $scope.emptyText = undefined;
        var currentPage = 1;//当前是第1页
        var rows = 10; //每页显示数据为10条
        $scope.noLoad = true;//初始化加载状态
        $scope.records = [];//历史记录

        //初始化数据
        var initData = function(records,tip,emptyText){
            $timeout(
                function(){
                    var footBar = document.getElementById("cardRechargeRecordsTipId");
                    if(footBar){
                        $scope.footerHeight = (10+parseInt(footBar.offsetHeight)) +'px';
                    }
                }
            );
            if(records){
                loadData(records);
            }
            if(emptyText){
                $scope.isEmpty = true;
                $scope.emptyText = emptyText;
            }else{
                $scope.isEmpty = false;
            }
            $scope.tips = tip;
            $scope.$broadcast('scroll.refreshComplete');
        };

        //加载更多数据
        var loadData = function(data){
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

        //刷新
        $scope.refresh = function(){
            currentPage = 1;
            CardRechargeRecordsService.queryChargeRecord(false,currentPage,rows,function(records,tip,emptyText){
                $scope.records = [];//重置数据
                $scope.noLoad = true;//重置加载状态
                $ionicScrollDelegate.scrollTop();
                initData(records,tip,emptyText);
            });
        };

        //加载更多记录
        $scope.loadMore = function(){
            if(!$scope.isEmpty){
                CardRechargeRecordsService.queryChargeRecord(true,currentPage,rows,function(records,tip,emptyText){
                    initData(records,tip,emptyText);
                });
            }
        };

        //跳转到余额查询页面
        $scope.goCardBalance = function(){
            $state.go('card_balance');
        };

        //监听物理返回键
        KyeeListenerRegister.regist({
            focus: "card_recharge_records",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.goBack();
            }
        });

        //返回
        $scope.goBack = function(){
            //从支付订单的充值返回 程铄闵 KYEEAPPC-7823
            if(PayOrderService.fromRechargeOrder){
                PayOrderService.fromRechargeOrder = false;
                PayOrderService.payData = PayOrderService.lastPayData;
                $state.go('payOrder');
            }
            else{
                PatientCardRechargeService.noLoad = true;//返回到充值首页
                //从支付返回刷新页面
                if($ionicHistory.backView().stateId=='payOrder'&&PatientCardRechargeService.isNextStep!=true){
                    $ionicHistory.goBack(-3);
                }
                else if($ionicHistory.backView().stateId=='payOrder'&&PatientCardRechargeService.isNextStep){
                    PatientCardRechargeService.isNextStep = false;
                    $ionicHistory.goBack(-4);
                }
                //从网页版支付成功直接返回 程铄闵 KYEEAPPC-5420
                else if($ionicHistory.backView().stateId=='webPay'&&PatientCardRechargeService.isNextStep!=true){
                    $ionicHistory.goBack(-4);
                }
                else if($ionicHistory.backView().stateId=='webPay'&&PatientCardRechargeService.isNextStep){
                    PatientCardRechargeService.isNextStep = false;
                    $ionicHistory.goBack(-5);
                }
                else{
                    $ionicHistory.goBack();
                }
            }

        };
        //继续支付按钮
        $scope.nextStep = function(item){
            //KYEEAPPC-7818 程铄闵 增加cardType
            CardRechargeRecordsService.rechargeContinue(item.CARD_NO,item.CARD_TYPE,item.PATIENT_ID,function(route){
                PatientCardRechargeService.isNextStep=true;//充值记录继续支付标记
                if(route=='card_recharge_confirm'){
                    $state.go(route);
                }
                else{
                    $scope.refresh();
                }
            });
        };

        //转换金额
        $scope.convertMoney = function(v){
            if (v != undefined) {
                v = parseFloat(v);
                var data = v.toFixed(2);
                return data;
            }
        };

        //就诊卡充值记录的删除 by 杜巍巍
        $scope.delCardRechargeRecords = function ($index,record) {
            KyeeMessageService.confirm({
                title: KyeeI18nService.get("commonText.msgTitle","消息"),
                content: KyeeI18nService.get("card_recharge_records.delConfirm","请确认是否删除该条记录？"),
                onSelect: function (flag) {
                    if (flag) {
                        CardRechargeRecordsService.delCardRechargeRecords(function(){
                            $scope.records.splice($index, 1);
                            $scope.refresh();
                        },record.PATD_ID);
                    }
                }
            });
        };

        $scope.goRefundDetail = function(item){
            MyRefundDetailNewService.OUT_TRADE_NO=item.OUT_TRADE_NO;
            $state.go('refund_detail_new');
        };

        //关闭底部黑框  KYEEAPPC-5581 程铄闵
        $scope.closeTip = function(){
            $scope.footerHeight = 1 +'px';
            $ionicScrollDelegate.$getByHandle('cardRechargeRecord').resize();
            $scope.hiddenBar = true;
        };
    })
    .build();