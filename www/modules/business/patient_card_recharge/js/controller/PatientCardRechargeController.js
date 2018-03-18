/**
 * 产品名称：quyiyuan
 * 创建者：程铄闵
 * 创建时间：2016年2月22日15:09:26
 * 创建原因：就诊卡充值(2.1.60版后)控制层
 * 任务号：KYEEAPPC-5217
 * 修改者：程铄闵
 * 修改时间：2016年9月27日15:10:43
 * 修改原因：2.3.10版修改增加退费记录
 * 任务号：KYEEAPPC-8088
 */
new KyeeModule()
    .group("kyee.quyiyuan.patient_card_recharge.controller")
    .require(["kyee.quyiyuan.patient_card_recharge.service",
        "kyee.quyiyuan.payOrder.service",
        "kyee.quyiyuan.patient_card_records.controller",
        "kyee.quyiyuan.card_recharge_confirm.controller",
        "kyee.quyiyuan.patient_card_refund.controller"])
    .type("controller")
    .name("PatientCardRechargeController")
    .params(["$timeout","$scope", "$rootScope", "$state", "$ionicHistory", "CacheServiceBus", "PatientCardRechargeService", "KyeeMessageService", "KyeeActionHolderDelegate",
        "KyeeListenerRegister", "PayOrderService", "KyeeI18nService", "HospitalSelectorService", "KyeeVersionCheckService","KyeeEnv","PatientCardRefundService","WebPayService"])
    .action(function ($timeout,$scope, $rootScope, $state, $ionicHistory, CacheServiceBus, PatientCardRechargeService, KyeeMessageService, KyeeActionHolderDelegate,
                      KyeeListenerRegister, PayOrderService, KyeeI18nService, HospitalSelectorService, KyeeVersionCheckService,KyeeEnv,PatientCardRefundService,WebPayService) {
        var isExistCard = true;//全为趣医虚拟卡
        $scope.recharge = {
            CARD_NO: '',
            CARD_SHOW:'',
            PATIENT_ID:'',
            CARD_TYPE:'',
            CARD_NAME:''
        };
        $scope.placeholder = {
            pHCardNo:KyeeI18nService.get("patient_card_recharge.pHCardNo","请选择或输入就诊卡")
        };
        $scope.emptyText = undefined;
        $scope.isEmpty = true;
        $scope.fromHospital = true;
        $scope.fromQRCode = false;  //从扫描二维码页面跳转过来
        $scope.cardIsDisabled = false;
        var isSupportThirdRechargeMethed = false;//是否支持调第三方支付
        var isWeiXin = false;//是否是微信公众号
        var thirdRechargeMethedUrl = "";//调第三方支付地址
        //外部通知跳转进来，显示返回键
        if(PatientCardRechargeService.webJump){
            $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
                viewData.enableBack = true;
            });
        };
        var cache = CacheServiceBus.getMemoryCache();
        var publicSreviceType = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_PUBLIC_SERVER_TYPE);
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
                //begin KYEEAPPC-4494 By chengzhi,选卡界面重复选中问题
                var resultMap = {};
                resultMap["name"] = cardNoList[i].CARD_NAME;
                resultMap["text"] = cardNoList[i].CARD_SHOW;
                resultMap["value"] = cardNoList[i].CARD_NO;//唯一属性CARD_NO
                resultMap["patientID"] = cardNoList[i].PATIENT_ID;
                resultMap["cardType"] = cardNoList[i].CARD_TYPE;
                //end KYEEAPPC-4494
                menus.push(resultMap);
            }
            //控制器中绑定数据：
            $scope.pickerItems = menus;
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

        //初始化页面
        var init = function(){

            $scope.emptyText = undefined;
            $scope.isEmpty = true;
            $scope.fromHospital = PatientCardRechargeService.fromView=='home->MAIN_TAB';
            var storageCache = CacheServiceBus.getStorageCache();
            $scope.hospitalName = storageCache.get('hospitalInfo').name;
            //返回false
            if(PatientCardRechargeService.emptyText){
                $scope.emptyText = PatientCardRechargeService.emptyText;
            }
            else{
                $scope.rechargeInfo = PatientCardRechargeService.rechargeInfo;

                if(publicSreviceType == 020478){
                    $scope.rechargeInfo.PATIENT_RECHARGE = 0;
                    $scope.rechargeInfo.PATIENT_RETURN = 0;
                }
                var info = $scope.rechargeInfo;

                if(info &&info.IS_OPEN_RHCMS==1){
                    $scope.cardIsDisabled = true;
                    $scope.placeholder = {
                        pHCardNo:KyeeI18nService.get("patient_card_recharge.pHCardNo","请选择就诊卡")
                    };
                }else{
                    $scope.cardIsDisabled = false;
                }
                //权限都没开
                if(info && info.PATIENT_RECHARGE == 0 && info.PATIENT_QUERY == 0 && info.PATIENT_RETURN == 0){
                    $scope.emptyText = info.MESSAGE;
                }
                else{
                    $scope.isEmpty = false;
                    //显示当前默认就诊者
                    var currentPatient = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                    $scope.rechargeInfo.PATIENT_NAME = currentPatient.OFTEN_NAME;
                    $scope.rechargeInfo.idCardCard = currentPatient.ID_NO;
                    $scope.rechargeInfo.mobile = currentPatient.PHONE;
                    $scope.rechargeInfo.USER_VS_ID = currentPatient.USER_VS_ID;
                    PatientCardRechargeService.currentCardNo = info.CARD_NO;
                    $scope.recharge.CARD_SHOW = PatientCardRechargeService.currentCardNo;
                    //切换医院
                    setCardInfo(PatientCardRechargeService.rechargeCardInfo);//填充就诊卡信息
                    setDefaultCardItem();
                }
                //调第三方支付
                if(info && info.IS_SUPPORT_THIRD_RECHARGE_METHED==1){
                    isSupportThirdRechargeMethed = true;
                    if(info.ACCESS_TYPE && info.ACCESS_TYPE == 02){
                        isWeiXin = true;
                    }
                    ////调第三方支付地址
                    if(info.THIRD_RECHARGE_METHED_URL){
                        thirdRechargeMethedUrl = info.THIRD_RECHARGE_METHED_URL;
                    }
                }
            }
            if(PatientCardRechargeService.rechargeInfo&&
                PatientCardRechargeService.rechargeInfo.IS_OPEN_RHCMS==1&&
                (PatientCardRechargeService.rechargeInfo.HOS_CARD_TYPE==2)){
                console.log("message");
                KyeeMessageService.message({
                    content : "未查询到您的社保卡，社保局发卡之后您才能进行在线充值！",
                    okText : "我知道了"
                });
            }
        };

        //查询余额&充值卡获取参数
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

        //页面添加监听事件
        KyeeListenerRegister.regist({
            focus: "patient_card_recharge",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (params) {
                if($ionicHistory.backView()){
                    if($ionicHistory.backView().stateName == "message_skip_controller"
                        || $ionicHistory.backView().stateName == "extract_code_info"
                        || $ionicHistory.backView().stateName == "extract_all_info"
                        || $ionicHistory.backView().stateName == "qrcode_skip_controller"
                        || $ionicHistory.backView().stateName == "doctor_patient_relation"
                        || PatientCardRechargeService.webJump){

                        if(($ionicHistory.backView().stateName == "qrcode_skip_controller"
                                || $ionicHistory.backView().stateName == "doctor_patient_relation")
                            &&PatientCardRechargeService.isSelectHos!=false){
                            $scope.fromQRCode = true;
                        }

                        if(PatientCardRechargeService.message||PatientCardRechargeService.webJump){

                            KyeeMessageService.loading({
                                mask: true
                            });
                            PatientCardRechargeService.getModule(function (route) {
                                KyeeMessageService.hideLoading();//取消遮罩
                                PatientCardRechargeService.isFirstEnter = false;

                                init();

                            },$state);
                            PatientCardRechargeService.message = false;
                        }
                    }else{
                        $scope.fromQRCode = false;
                    }
                }

                if(HospitalSelectorService.isFromPatientRecharge || PatientCardRechargeService.isFirstEnter) {
                    KyeeMessageService.loading({
                        mask: true
                    });
                }
            }
        });
        KyeeListenerRegister.regist({
            focus: "patient_card_recharge",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.ENTER,
            direction: "both",
            action: function (params) {
                //从医院选择、医院首页、我的进入
                if(HospitalSelectorService.isFromPatientRecharge || PatientCardRechargeService.isFirstEnter){
                    HospitalSelectorService.isFromPatientRecharge = false;//清除从医院选择进入的标记  程铄闵 KYEEAPPTEST-3222
                    PatientCardRechargeService.isFirstEnter = false;
                    PatientCardRechargeService.currentCardNo = undefined;
                    init();//初始化页面
                    KyeeMessageService.hideLoading();
                }
                else{
                    $scope.recharge.CARD_SHOW = PatientCardRechargeService.currentCardNo;
                    setCardInfo(PatientCardRechargeService.rechargeCardInfo);//填充就诊卡信息
                    $scope.queryBalance(1);
                }

            }
        });

        //返回
        $scope.back = function () {
            PatientCardRechargeService.rechargeCardInfo = undefined;
            PatientCardRechargeService.selectCard = false;
            PatientCardRechargeService.fromView = undefined;
            PatientCardRechargeService.isFirstEnter = false;
            PatientCardRechargeService.currentCardNo = undefined;
            if($ionicHistory.backView().stateName == "message_skip_controller"
                || $ionicHistory.backView().stateName == "extract_code_info"
                || $ionicHistory.backView().stateName == "extract_all_info"){
                 $state.go('center->MAIN_TAB');
            }
            else if ($ionicHistory.backView().stateName == "qrcode_skip_controller"
                ||$ionicHistory.backView().stateName == "doctor_patient_relation"
 				||$ionicHistory.backView().stateName == "login" || PatientCardRechargeService.webJump){
                PatientCardRechargeService.webJump = undefined;//外部通知跳转进来,返回到首页
                $state.go('home->MAIN_TAB');
            }
            else{
                $ionicHistory.goBack();
            }
        };

        //点击选择按钮事件
        $scope.showPatientCardNo = function () {
            //有卡
            if(!isExistCard){
                $scope.title = KyeeI18nService.get("patient_card_recharge.pHCardNo", "请选择就诊卡");
                //调用显示
                $scope.showPicker($scope.recharge.CARD_NO);
            }
        };

        //同步修改就诊卡输入框中的内容
        $scope.onChangeCardNo = function () {
            //清空相关信息
            $scope.recharge.PATIENT_ID = '';
            $scope.recharge.CARD_TYPE = '';
            $scope.recharge.CARD_NO = '';
            $scope.recharge.CARD_NAME = '';
            $scope.rechargeInfo.REST_AMOUNT = '--.--';
            $scope.rechargeInfo.BUTTON = KyeeI18nService.get("patient_card_recharge.queryBalance", "查询余额");
        };

        //绑定选择事件
        $scope.bind = function (params) {
            $scope.showPicker = params.show;
            params.hideMode = "AUTO";
        };

        //选择卡号
        $scope.selectItem = function (params) {
            $scope.recharge.CARD_SHOW = params.item.text;//展示值
            //begin KYEEAPPC-4494 By chengzhi,选卡界面重复选中问题
            $scope.recharge.CARD_NO = params.item.value;
            $scope.recharge.CARD_TYPE = params.item.cardType;
            $scope.recharge.CARD_NAME = params.item.name;
            $scope.recharge.PATIENT_ID = params.item.patientID;
            //end KYEEAPPC-4494
            //更新余额
            //一卡通临时卡
            if($scope.recharge&&$scope.recharge.CARD_TYPE==7){
                PatientCardRechargeService.getModule(function (route) {
                    KyeeMessageService.hideLoading();//取消遮罩
                    PatientCardRechargeService.isFirstEnter = false;

                    init();
                    $scope.queryBalance(1);
                },$state,"1");
            } else{
                $scope.queryBalance(1);
            }
        };

        //问号提示按钮事件
        $scope.showChardNoInfo = function(){
            KyeeMessageService.message({
                title: KyeeI18nService.get('commonText.warmTipMsg', '温馨提示', null),
                okText: KyeeI18nService.get("commonText.iknowMsg", "确定"),
                content: $scope.rechargeInfo.HRCM_PATIENTRECHARGE_TIP
            });
            //var dialog = KyeeMessageService.dialog({
            //    template: "modules/business/patient_card_recharge/views/delay_views/card_recharge_popup.html",
            //    scope: $scope,
            //    title:KyeeI18nService.get("patient_card_recharge.messageTitle","温馨提示"),
            //    buttons: [
            //        {
            //            text:  KyeeI18nService.get("patient_card_recharge.isOk","确定"),
            //            style:'button-size-l',
            //            click: function () {
            //                dialog.close();
            //            }
            //        }
            //    ]
            //});
        };

        //切换就诊者按钮
        $scope.goCustomPatient = function(){
            $state.go('custom_patient');
        };

        //查询余额按钮事件
        $scope.queryBalance = function(queryType){
            if($scope.rechargeInfo && $scope.rechargeInfo.PATIENT_QUERY==1){
                if (queryType==0 && !$scope.recharge.CARD_SHOW) {
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("patient_card_recharge.pHCardNo","请选择或输入就诊卡")
                    });
                    return;
                }
                var obj = getCardParams();
                obj.INPUT_NAME = $scope.rechargeInfo.PATIENT_NAME;
                obj.QUERY_TYPE = queryType;
                PatientCardRechargeService.currentCardNo = obj.CARD_SHOW;
                PatientCardRechargeService.queryBalance(obj,function(data){
                    $scope.rechargeInfo.REST_AMOUNT = data.REST_AMOUNT;
                    $scope.rechargeInfo.BUTTON = data.BUTTON;
                    setCardInfo(PatientCardRechargeService.rechargeCardInfo);
                });
            }
        };

        //就诊卡充值按钮事件
        $scope.goRecharge = function () {
            //调第三方支付
            if(isSupportThirdRechargeMethed){
                if(isWeiXin){
                    //异常接收与提示
                    KyeeMessageService.message({
                        title:  "消息",
                        content:  "请下载趣医APP进行充值！",
                        okText:  "我知道了"
                    });
                    return;
                }else{
                    var params = getCardParams();
                    PatientCardRechargeService.currentCardNo = params.CARD_SHOW;
                    if (!params.CARD_SHOW) {
                        KyeeMessageService.broadcast({
                            content: KyeeI18nService.get("patient_card_recharge.pHCardNo","请选择或输入就诊卡")
                        });
                        return;
                    }
                    var healthCardId = params.CARD_SHOW;
                    if($scope.rechargeInfo){
                        var patientName = $scope.rechargeInfo.PATIENT_NAME;
                        var customerId = $scope.rechargeInfo.USER_VS_ID;
                        var idCardCard = $scope.rechargeInfo.idCardCard;
                        var mobile = $scope.rechargeInfo.mobile;
                    }else{
                        KyeeMessageService.broadcast({
                            content: "系统繁忙，请稍后重试"
                        });
                        return;
                    }
                    var orderSource = "qyapp";
                    var goToUrl = thirdRechargeMethedUrl + "?" + "healthCardId=" + healthCardId + "&"
                        + "patientName=" + patientName + "&" + "idCardCard=" + idCardCard
                        + "&" + "mobile=" + mobile + "&" + "customerId=" + customerId + "&" + "orderSource=" + orderSource;

                    //KyeeMessageService.hideLoading();//取消遮罩
                    WebPayService.patientRechargeThirdPay = true;
                    WebPayService.url = goToUrl;
                    //跳转支付网页
                    $state.go('webPay');
                    return;
                }

            }else{
                if($scope.rechargeInfo.PATIENT_RECHARGE==1){
                    if (!$scope.recharge.CARD_SHOW) {
                        KyeeMessageService.broadcast({
                            content: KyeeI18nService.get("patient_card_recharge.pHCardNo","请选择或输入就诊卡")
                        });
                        return;
                    }
                    var obj = getCardParams();
                    obj.INPUT_FLAG = $scope.recharge.CARD_SHOW==$scope.rechargeInfo.CARD_NO?'0':'1';//是否和当前显示卡一致 1--输入
                    PatientCardRechargeService.currentCardNo = obj.CARD_SHOW;
                    //KYEEAPPC-7818 程铄闵 增加cardType
                    PatientCardRechargeService.goRecharge(obj,function(route){
                        $state.go(route);
                    });
                }
            }
        };



        //就诊卡退费按钮事件
        $scope.refundSubmit = function () {
            //要判断就诊卡余额退费开关是否开启
            var PATIENTNAME = $scope.rechargeInfo.PATIENT_NAME;
            var CARD_NO =  $scope.recharge.CARD_SHOW;
            //开通就诊卡退费权限才会跳转
            if($scope.rechargeInfo.PATIENT_RETURN == 1 ) {
                PatientCardRefundService.getCardChargeRefund(function (data) {
                    PatientCardRechargeService.currentCardNo = data.CARD_NO;
                    PatientCardRefundService.rechargeInfo = data;
                    $state.go("patient_card_refund");
                }, PATIENTNAME, CARD_NO);
            }
        };

        //跳转到历史记录
        $scope.goRecords = function () {
            $state.go('patient_card_records');
        };

        //切换医院
        $scope.changeHospital = function () {
            if($scope.fromHospital && $rootScope.ROLE_CODE=="5"){
                return;
            }
            HospitalSelectorService.isFromPatientRecharge = true;
            $state.go("hospital_selector");
        };

        //转换金额
        $scope.convertMoney = function(v){
            var data = v;
            if (v != undefined) {
                v = parseFloat(v);
                if(!isNaN(v)){
                    data = '¥'+(v.toFixed(2));
                }
            }
            return data;
        };

        //监听物理键返回
        KyeeListenerRegister.regist({
            focus: "patient_card_recharge",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();   //禁掉默认处理，使物理返回与页面上的返回键一致
                $scope.back();
            }
        });

    })
    .build();

