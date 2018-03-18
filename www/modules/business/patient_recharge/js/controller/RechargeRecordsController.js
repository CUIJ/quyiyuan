/**
 * 产品名称：quyiyuan
 * 创建者：章剑飞
 * 创建时间：2016年1月6日15:49:09
 * 创建原因：就诊卡充值记录控制层
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.recharge_records.controller")
    .require(["kyee.quyiyuan.recharge_records.service"])
    .type("controller")
    .name("RechargeRecordsController")
    .params(["$scope", "$state", "$ionicHistory", "KyeeI18nService", "RechargeRecordsService",
        "KyeeListenerRegister","$timeout","$ionicScrollDelegate"])
    .action(function ($scope, $state, $ionicHistory, KyeeI18nService, RechargeRecordsService,
                      KyeeListenerRegister,$timeout,$ionicScrollDelegate) {

        //跳转到余额查询页面
        $scope.goCardBalance = function(){
            $state.go('card_balance');
        };

        var isFromPayOrder = false;
        //默认显示底部黑框
        $scope.hiddenBar = false;

        $scope.emptyText = KyeeI18nService.get("recharge_record.emptyText","暂无充值记录");//KYEEAPPC-5217 程铄闵
        $scope.isEmpty = false;
        //是否显示充值记录明细 by 杜巍巍 KYEEAPPC-5312
        $scope.inShowRechargeDetail = false;

        //刷新
        $scope.refresh = function(flag){

            RechargeRecordsService.queryChargeRecord(function(records, message){

                $scope.records = records;
                if($scope.records.length > 0){
                    $scope.isEmpty = false;
                    $scope.inShowRechargeDetail = true;
                }else{
                    $scope.isEmpty = true;
                }
                $scope.tips = message;

                //计算底部高度 KYEEAPPC-5581 程铄闵
                $timeout(
                    function(){
                        var footBar = document.getElementById("rechargeRecordsTipId");
                        if(footBar){
                            $scope.footerHeight = (53+parseInt(footBar.offsetHeight));
                        }
                    }
                );

                $scope.$broadcast('scroll.refreshComplete');
            }, flag);
        };

        //监听页面进入
        KyeeListenerRegister.regist({
            focus: "recharge_records",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            action: function (params) {
                if(params.from == 'payOrder'){
                    isFromPayOrder = true;
                }else{
                    isFromPayOrder = false;
                }
            }
        });

        //监听物理返回键
        KyeeListenerRegister.regist({
            focus: "recharge_records",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.goBack();
            }
        });

        //返回
        $scope.goBack = function(){
            if(isFromPayOrder){
                $ionicHistory.goBack(-2);
            }
            //从网页版支付成功直接返回 程铄闵 KYEEAPPC-5420
            else if($ionicHistory.backView().stateId=='webPay'){
                $ionicHistory.goBack(-3);
            }
            else{
                $ionicHistory.goBack();
            }
        };

        $scope.refresh(true);

        //关闭底部黑框  KYEEAPPC-5581 程铄闵
        $scope.closeTip = function(){
            $scope.footerHeight = 43;
            $ionicScrollDelegate.$getByHandle('rechargeRecord').resize();
            $scope.hiddenBar = true;
        };

    })
    .build();

