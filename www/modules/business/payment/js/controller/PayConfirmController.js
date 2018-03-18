/**
 * 产品名称：quyiyuan
 * 创建者：章剑飞
 * 创建时间：2016年1月19日15:48:07
 * 创建原因：确认支付页面控制器
 */
new KyeeModule()
    .group("kyee.quyiyuan.payConfirm.controller")
    .require(["kyee.quyiyuan.payConfirm.service","kyee.quyiyuan.payResult.controller"])
    .type("controller")
    .name("PayConfirmController")
    .params(["$scope", "$state", "PayConfirmService", "KyeeDeviceMsgService", "KyeeUtilsService",
        "KyeeMessageService","KyeeListenerRegister","KyeeI18nService"])
    .action(function ($scope, $state, PayConfirmService, KyeeDeviceMsgService, KyeeUtilsService,
                      KyeeMessageService, KyeeListenerRegister,KyeeI18nService) {

        var second = 120;
        //定时器
        var timer = {};
        //支付信息
        $scope.payInfo = {
            AMOUNT : '¥' + PayConfirmService.AMOUNT,
            //AMOUNT : '¥50',
            pswd : '',
            msgCode : ''
        };

        $scope.placeholder = {
            pHMsgCode : KyeeI18nService.get("payConfirm.pHMsgCode","请输入您的验证码"),
            pHPwd : KyeeI18nService.get("payConfirm.pHPwd","请输入您的支付密码完成支付")
        };

        //获取验证码按钮文字
        $scope.msgText = KyeeI18nService.get("payConfirm.getMsg","获取验证码");
        //默认获取验证码按钮可用
        $scope.btnDisabled = false;

        //短信验证码倒计时
        function setBtnState(timer) {
            try {
                if (second > 0) {
                    var remainder = KyeeI18nService.get("payConfirm.remainder","剩余");
                    var sec = KyeeI18nService.get("payConfirm.sec","秒");
                    $scope.msgText = remainder + second + sec;
                } else {
                    $scope.btnDisabled = false;
                    $scope.msgText = KyeeI18nService.get("payConfirm.getMsg","获取验证码");
                    //关闭定时器
                    KyeeUtilsService.cancelInterval(timer);
                }
            } catch (e) {
                //关闭定时器
                KyeeUtilsService.cancelInterval(timer);
            }
        }

        /**
         * 获取验证码点击事件
         */
        $scope.getMsgCode = function () {
            //获取短信验证码
            PayConfirmService.getMsgCode(function(data){
                //按钮冻结时间为120秒
                second = 120;
                setBtnState();
                $scope.btnDisabled = true;
                timer = KyeeUtilsService.interval({
                    time: 1000,
                    action: function () {
                        second--;
                        setBtnState(timer);
                    }
                });
            },$scope.CARD_INFO);
        };

        //初始化获取卡表
        var cardInfo = PayConfirmService.CARD_INFO;
        var cardList = PayConfirmService.CARD_INFO.cardList;
        var menus = [];
        if(cardList && cardList.length>0){
            angular.forEach(cardList,function(card,index){

                var cardNoShort = card.cardNo;
                if(cardNoShort.length > 4){
                    cardNoShort = cardNoShort.substr(-4,4);
                }
                var selectCard = {text:"药都银行" + "(尾号" + cardNoShort + ")"  ,value:card};
                menus.push(selectCard);
            });
        }
        //余额
        var selectCard = {text:'钱包余额(¥'+cardInfo.balance+')' ,value:{"mobile":""}};
        menus.push(selectCard);
        $scope.CARD_SHOW = menus[0].text;
        $scope.CARD_INFO = menus[0].value;
        //卡列表
        $scope.pickerItems = menus;

        //绑定选择事件
        $scope.bind = function (params) {
            $scope.showPicker = params.show;
        };

        //选择卡号
        $scope.selectItem = function (params) {
            $scope.CARD_SHOW = params.item.text;
            $scope.CARD_INFO = params.item.value;
        };

        //点击选择就诊卡
        $scope.showCardList = function () {

            if (!$scope.pickerItems.length) {
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("payConfirm.warnCard","选卡异常！")
                })
            } else {
                $scope.title = KyeeI18nService.get("payConfirm.chooseCard","选择支付卡");
                //调用显示
                $scope.showPicker($scope.CARD_INFO);
            }
        };

        //点击支付
        $scope.paySubmit = function(){
            //检验银行卡
            if(!$scope.CARD_INFO){
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("payConfirm.warnCard1","请先选择一张银行卡！")
                });
                return ;
            }
            //检验密码
            if(!$scope.payInfo.pswd){
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("payConfirm.warnPwd","请输入密码！")
                });
                return ;
            }
            //检验验证码
            if(!$scope.payInfo.msgCode){
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("payConfirm.warnMsg","请输入验证码！")
                });
                return ;
            }
            //支付
            PayConfirmService.paySubmit(function(flag){
                if(flag){
                    $state.go('payResult');
                }else{
                    $scope.btnDisabled = false;
                    $scope.msgText = KyeeI18nService.get("payConfirm.getMsg","获取验证码");
                    //关闭定时器
                    KyeeUtilsService.cancelInterval(timer);
                }
            },$scope.payInfo.msgCode, $scope.payInfo.pswd,$scope.CARD_INFO);
        };

        //监听页面进入
        KyeeListenerRegister.regist({
            focus: "payConfirm",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: 'both',
            action: function (params) {
                //支付信息
                $scope.payInfo = {
                    AMOUNT : '¥' + PayConfirmService.AMOUNT,
                    //AMOUNT : '¥50',
                    pswd : '',
                    msgCode : ''
                };
            }
        });


        //监听页面离开
        KyeeListenerRegister.regist({
            focus: "payConfirm",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_LEAVE,
            action: function (params) {
                $scope.btnDisabled = false;
                $scope.msgText = KyeeI18nService.get("payConfirm.getMsg","获取验证码");
                //关闭定时器
                KyeeUtilsService.cancelInterval(timer);
            }
        });
    })
    .build();