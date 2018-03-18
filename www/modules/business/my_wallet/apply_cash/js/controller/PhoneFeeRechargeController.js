/**
 * 任务号:KYEEAPPC-3678
 * 产品名称：quyiyuan.
 * 创建用户：华博
 * 日期：2015年8月25日14:48:19
 * 创建原因：申请提现页面控制器
 */
new KyeeModule()
    .group("kyee.quyiyuan.myWallet.phoneFeeRecharge.controller")
    .require([])
    .type("controller")
    .name("PhoneFeeRechargeController")
    .params(["$scope", "$state", "PhoneFeeRechargeService","KyeeMessageService","KyeeListenerRegister","KyeeI18nService"])
    .action(function ($scope, $state, PhoneFeeRechargeService,KyeeMessageService,KyeeListenerRegister,KyeeI18nService) {
        //初始化按钮是否可点
        $scope.fiveYuanBtn = false;
        $scope.tenYuanBtn = false;
        $scope.twentyYuanBtn = false;
        $scope.thirtyYuanBtn = false;
        $scope.fiftyYuanBtn = false;
        $scope.oneHundredYuanBtn = false;
        $scope.twoHundredYuanBtn = false;
        $scope.threeHundredYuanBtn = false;
        $scope.fiveHundredYuanBtn = false;
        $scope.AMOUNT = PhoneFeeRechargeService.AMOUNT;
        var phoneNum = '';
        PhoneFeeRechargeService.scope = $scope;

        KyeeListenerRegister.regist({
            focus: "phone_fee_charging",
            direction:'both',
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            action: function (params) {
                /**
                 * 获取提现记录数据
                 */
                PhoneFeeRechargeService.getPageInitData(function(data){
                    //归属地
                    $scope.GameArea = data.GameArea;
                    //获取用户的电话号码
                    phoneNum = data.USER_PHONENUMBER;
                    var head = data.USER_PHONENUMBER.substr(0, 3);
                    var body = data.USER_PHONENUMBER.substr(3, 4);
                    var tail = data.USER_PHONENUMBER.substr(7, 4);
                    $scope.USER_PHONENUMBER = head + '-' + body + '-' + tail;
                    //提示语
                    $scope.firstTipHead = "1."+ KyeeI18nService.get('phone_fee_charging.firstTipHead','此业务仅支持向当前账号')+"（";
                    $scope.firstTipTail = "）"+KyeeI18nService.get('phone_fee_charging.firstTipHead','充值');
                    $scope.firstTip ="1."+ $scope.firstTipHead + "（"+$scope.USER_PHONENUMBER +"）"+ $scope.firstTipTail;
                    $scope.secondTip = "2."+KyeeI18nService.get('phone_fee_charging.secondTip','话费充值提交审核后，我们会在三个工作日内为您处理，请您耐心等待');
                    //初始化默认选中按钮
                    $scope.isSelected = data.DEFAULT_SELECTED;
                    var canRechargeArray = data.CAN_RECHARGE_ARRAY;
                    if(canRechargeArray.indexOf('5')==-1){
                        $scope.fiveYuanBtn = true;
                    }
                    if(canRechargeArray.indexOf('10')==-1){
                        $scope.tenYuanBtn = true;
                    }
                    if(canRechargeArray.indexOf('20')==-1){
                        $scope.twentyYuanBtn = true;
                    }
                    if(canRechargeArray.indexOf('30')==-1){
                        $scope.thirtyYuanBtn = true;
                    }
                    if(canRechargeArray.indexOf('50')==-1){
                        $scope.fiftyYuanBtn = true;
                    }
                    if(canRechargeArray.indexOf('100')==-1){
                        $scope.oneHundredYuanBtn = true;
                    }

                });
            }
        });

        //选择金额
        $scope.selectAmountButton = function (isSelected) {
            $scope.isSelected = isSelected;
        };
        //点击充值
        $scope.chargeSubmit = function () {
            var price = $scope.isSelected;
            //PhoneFeeRechargeService.checkPhoneFeeCharge(phoneNum,price,function(data){
            //    KyeeMessageService.confirm({
            //        title: KyeeI18nService.get('phone_fee_charging.rechargeDetail','充值详情',null),
            //        content: data.GameArea+'-'+data.Cardname,
            //        onSelect: function (ok) {
            //            if (ok) {
            //                PhoneFeeRechargeService.phoneFeeRecharge(phoneNum,price,function(data){
            //                    KyeeMessageService.broadcast({
            //                        content: data
            //                    });
            //                    $state.go("apply_cash");
            //                });
            //            }
            //        }
            //    });
            //});
            PhoneFeeRechargeService.phoneFeeRecharge(phoneNum,price,function(data){
                KyeeMessageService.broadcast({
                    content: data
                });
                $state.go("apply_cash");
            });
        }
    })
    .build();

