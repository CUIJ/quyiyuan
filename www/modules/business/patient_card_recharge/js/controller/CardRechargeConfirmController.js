/*
 * 产品名称：quyiyuan
 * 创建人: 程铄闵
 * 创建日期:2016/2/3
 * 创建原因：就诊卡充值确认信息(2.1.60版后)控制层
 * 任务号：KYEEAPPC-5217
 * 修改者：程铄闵
 * 修改时间：2016年9月27日15:10:43
 * 修改原因：2.3.10版修改增加退费记录
 * 任务号：KYEEAPPC-8088
 */
new KyeeModule()
    .group("kyee.quyiyuan.card_recharge_confirm.controller")
    .require(["kyee.quyiyuan.card_recharge_confirm.service"])
    .type("controller")
    .name("CardRechargeConfirmController")
    .params(["$scope", "$rootScope", "$state", "$ionicHistory", "KyeeI18nService", "KyeeUtilsService", "CardRechargeConfirmService",
        "KyeeMessageService","PayOrderService","PatientCardRechargeService","KyeeListenerRegister","CacheServiceBus","$ionicScrollDelegate"])
    .action(function ($scope, $rootScope, $state, $ionicHistory, KyeeI18nService, KyeeUtilsService, CardRechargeConfirmService,
                      KyeeMessageService,PayOrderService,PatientCardRechargeService,KyeeListenerRegister,CacheServiceBus,$ionicScrollDelegate) {

        var isExistCard = true;//全为趣医虚拟卡
        $scope.recharge = {
            CARD_NO: '',
            CARD_SHOW:'',
            PATIENT_ID:'',
            CARD_TYPE:'',
            CARD_NAME:''
        };
        $scope.placeholder = {
            pHCharge: KyeeI18nService.get("card_recharge_confirm.pHAmount", "请输入您的充值金额")
        };

        //隐藏身份证中间位
        var hiddenIdNo = function (v) {
            if (v) {
                return v.replace(/(.{3}).*(.{4})/, "$1********$2");
            }
        };

        //过滤就诊卡信息&初始化默认卡
        var setCardInfo = function(rechargeInfo){
            var k = 0;
            isExistCard = true;//默认全为趣医虚拟卡
            var cardInfo = [];//就诊者信息（无虚拟卡的）
            if (rechargeInfo != null && rechargeInfo.length > 0) {
                for (var j = 0; j < rechargeInfo.length; j++) {
                    //过滤虚拟卡（趣医）
                    if (rechargeInfo[j] && rechargeInfo[j].CARD_TYPE && rechargeInfo[j].CARD_TYPE == 0 && rechargeInfo[j].CARD_NO != undefined && rechargeInfo[j].CARD_NO.substring(0, 1) == "Q") {
                        break;
                    }
                    else {
                        isExistCard = false;//有卡
                        cardInfo[k] = rechargeInfo[j];
                        k++;
                    }
                }
                setSelectItem(cardInfo);//填充就诊卡
            }
        };

        //填充就诊卡内容
        var setSelectItem = function(cardNoList){
            var menus = [];
            for (var i = 0; i < cardNoList.length; i++) {
                var resultMap = {};
                resultMap["text"] = cardNoList[i].CARD_SHOW;
                resultMap["value"] = cardNoList[i].CARD_NO;//唯一属性CARD_NO
                resultMap["patientID"] = cardNoList[i].PATIENT_ID;
                resultMap["cardType"] = cardNoList[i].CARD_TYPE;
                resultMap["name"] = cardNoList[i].CARD_NAME;
                menus.push(resultMap);
            }
            //控制器中绑定数据
            $scope.pickerItems = menus;
        };

        //重新验证获取参数
        var getCardParams = function(){
            //可输入的
            var isUpdateCardNo = true;//是否手动输入卡号
            //检验用户输入的卡号是否存在于卡列表中
            if($scope.pickerItems){
                for (var i = 0; i < $scope.pickerItems.length; i++) {
                    if ($scope.recharge.CARD_SHOW == $scope.pickerItems[i].text) {
                        //匹配到卡信息则直接使用其信息
                        $scope.recharge.PATIENT_ID = $scope.pickerItems[i].patientID;
                        $scope.recharge.CARD_NO = $scope.pickerItems[i].value;
                        $scope.recharge.CARD_TYPE = $scope.pickerItems[i].cardType;
                        $scope.recharge.CARD_NAME = $scope.pickerItems[i].name;
                        isUpdateCardNo = false;
                        break;
                    }
                }
            }
            //在手动输入时清除卡类型
            if(isUpdateCardNo){
                $scope.recharge.CARD_TYPE = undefined;
            }
            return $scope.recharge;
        };

        //匹配默认卡信息
        //若显示的卡在卡列表中则补充其余信息
        var setDefaultCardItem = function(){
            if($scope.pickerItems){
                for (var i = 0; i < $scope.pickerItems.length; i++) {
                    if ($scope.recharge.CARD_SHOW == $scope.pickerItems[i].value) {
                        $scope.recharge.PATIENT_ID = $scope.pickerItems[i].patientID;
                        $scope.recharge.CARD_NO = $scope.pickerItems[i].value;
                        $scope.recharge.CARD_TYPE = $scope.pickerItems[i].cardType;
                        $scope.recharge.CARD_NAME = $scope.pickerItems[i].name;
                        break;
                    }
                }
            }
        };

        //初始化页面数据
        var init = function () {
            var rechargeInfo = CardRechargeConfirmService.rechargeInfo;//确认信息内容
            var info = rechargeInfo.rows[0];
            $scope.rechargeInfo = rechargeInfo;
            var currentPatient = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
            $scope.rechargeInfo.PATIENT_NAME = currentPatient.OFTEN_NAME;
            if(info){
                $scope.rechargeInfo.HOSPITAL_NAME = rechargeInfo.HOSPITAL_NAME;
                $scope.rechargeInfo.CARD_NO = info.CARD_NO;
                $scope.rechargeInfo.CARD_TYPE = info.CARD_TYPE;
                $scope.rechargeInfo.CARD_NAME = info.CARD_NAME;
                $scope.rechargeInfo.PATIENT_ID = info.PATIENT_ID;
                $scope.rechargeInfo.TOTAL_AMOUNT = (parseFloat(info.TOTAL_AMOUNT)).toFixed(2);
                $scope.rechargeInfo.SHOW_ID_NO = hiddenIdNo(info.ID_NO);
            }
            if($scope.rechargeInfo.CARD_LIST){
                PatientCardRechargeService.rechargeCardInfo = $scope.rechargeInfo.CARD_LIST.rows;
            }
            //重新验证
            if($scope.rechargeInfo.STATUS=='2'){
                $scope.recharge.CARD_SHOW = PatientCardRechargeService.currentCardNo;
                if($scope.rechargeInfo.CARD_NO){
                    $scope.recharge.CARD_SHOW = $scope.rechargeInfo.CARD_NO;
                    PatientCardRechargeService.currentCardNo = $scope.rechargeInfo.CARD_NO;
                }
                setCardInfo(PatientCardRechargeService.rechargeCardInfo);
                setDefaultCardItem();
            }
        };

        init();

        $scope.doRefresh = function(){
            if($scope.rechargeInfo.STATUS==0){
                CardRechargeConfirmService.loadConfirmInfo(function(data){
                    if(data == 'success'){
                        init();
                    }
                    $scope.$broadcast('scroll.refreshComplete');
                    $ionicScrollDelegate.$getByHandle("rechargeConfirm").resize();
                });
            }
            else{
                $ionicScrollDelegate.$getByHandle("rechargeConfirm").resize();
                return;
            }
        };

        //点击选择按钮事件
        $scope.showPatientCardNo = function () {
            //有卡
            if(!isExistCard){
                $scope.title = KyeeI18nService.get("card_recharge_confirm.pHCardNo", "请选择就诊卡");
                //调用显示
                $scope.showPicker($scope.recharge.CARD_NO);
            }
        };

        //同步修改就诊卡输入框中的内容
        $scope.onChangeCardNo = function () {
            //清空相关信息
            $scope.recharge.PATIENT_ID = '';
            $scope.recharge.CARD_TYPE = '';
            $scope.recharge.CARD_NAME = '';
            $scope.recharge.CARD_NO = '';
        };

        //绑定选择事件
        $scope.bind = function (params) {
            $scope.showPicker = params.show;
            params.hideMode = "AUTO";
        };

        //选择卡号
        $scope.selectItem = function (params) {
            $scope.recharge.CARD_SHOW = params.item.text;//展示值
            $scope.recharge.CARD_NO = params.item.value;
            $scope.recharge.PATIENT_ID = params.item.patientID;
            $scope.recharge.CARD_TYPE = params.item.cardType;
            $scope.recharge.CARD_NAME = params.item.name;
        };

        //重新验证按钮事件
        $scope.goRecharge = function () {
            if (!$scope.recharge.CARD_SHOW) {
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("card_recharge_confirm.pHCardNo","请选择或输入就诊卡")
                });
                return;
            }
            var obj = getCardParams();
            obj.INPUT_FLAG = $scope.recharge.CARD_SHOW==$scope.rechargeInfo.CARD_NO?'0':'1';//是否和当前显示卡一致 1--输入
            PatientCardRechargeService.currentCardNo = obj.CARD_SHOW;
            PatientCardRechargeService.goRecharge(obj,function(route){
                init();
            });
        };

/*        //转换金额为大写
        $scope.changeToUppercase = function () {
            $scope.rechargeInfo.uppercaseAmount = KyeeUtilsService.convertMoneyToChinese($scope.rechargeInfo.rechargeAmount);
        };*/

        //确认充值
        $scope.rechargeSubmit = function () {
            if ($scope.rechargeInfo.rechargeAmount == '' || $scope.rechargeInfo.rechargeAmount == undefined) {
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("card_recharge_confirm.inputMoney", "请输入充值金额")
                });
                return;
            }
            //校验金额格式  By  章剑飞  KYEEAPPTEST-2779
            var reg = new RegExp('^[0-9]+(.[0-9]+)?$');
            if (!reg.test($scope.rechargeInfo.rechargeAmount)) {
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("card_recharge_confirm.inputValidMoney", "请输入正确的金额！")
                });
                return;
            }
            var amount = $scope.rechargeInfo.rechargeAmount;
            CardRechargeConfirmService.rechargeSubmit(function (data) {
                data.ROUTER = 'patient_card_records';
                PayOrderService.payData = data;
                CardRechargeConfirmService.rechargeToOrder = true;
                //刷新数据
                $state.go('payOrder');
            }, $scope.rechargeInfo.CARD_NO,$scope.rechargeInfo.CARD_TYPE,$scope.rechargeInfo.PATIENT_ID,amount);//KYEEAPPC-7818 程铄闵 增加cardType
        };

        //返回
        $scope.back = function(){
            CardRechargeConfirmService.rechargeToOrder = false;
            if(PayOrderService.fromRechargeOrder){
                PayOrderService.fromRechargeOrder = false;
                $state.go('payOrder');
            }
            else{
                $ionicHistory.goBack();
            }
        };

        //监听物理键返回
        KyeeListenerRegister.regist({
            focus: "card_recharge_confirm",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();   //禁掉默认处理，使物理返回与页面上的返回键一致
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

        //问号提示按钮事件
        $scope.showChardNoInfo = function(){
            var dialog = KyeeMessageService.dialog({
                template: "modules/business/patient_card_recharge/views/delay_views/card_recharge_popup.html",
                scope: $scope,
                title:KyeeI18nService.get("patient_card_recharge.messageTitle","温馨提示"),
                buttons: [
                    {
                        text:  KyeeI18nService.get("patient_card_recharge.isOk","确定"),
                        style:'button-size-l',
                        click: function () {
                            dialog.close();
                        }
                    }
                ]
            });
        };
    })
    .build();