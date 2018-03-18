/**
 * 产品名称：quyiyuan
 * 创建者：章剑飞
 * 创建时间：2015年6月23日17:14:31
 * 创建原因：就诊卡充值控制层
 * 修改者：程铄闵
 * 修改原因：2.1.20优化
 * 任务号：KYEEAPPC-4687
 * 修改时间：2015年12月23日23:09:39
 * 修改者：张婧
 * 修改时间：2016年7月28日11:34:25
 * 修改原因：添加单击钮统计
 * 任务号：KYEEAPPC-6641
 */
new KyeeModule()
    .group("kyee.quyiyuan.patient_recharge.controller")
    .require(["kyee.quyiyuan.patient_recharge.service",
        "kyee.quyiyuan.payOrder.service",
        "kyee.quyiyuan.recharge_records.controller",
        "kyee.quyiyuan.recharge_records.service"])
    .type("controller")
    .name("patientRechargeController")
    .params(["$scope", "$rootScope", "$state", "$ionicHistory", "CacheServiceBus", "patientRechargeService", "KyeeMessageService", "KyeeActionHolderDelegate",
        "KyeeListenerRegister", "PayOrderService", "KyeeI18nService", "HospitalSelectorService", "PatientCardService", "RechargeRecordsService", "OperationMonitor"])
    .action(function ($scope, $rootScope, $state, $ionicHistory, CacheServiceBus, patientRechargeService, KyeeMessageService, KyeeActionHolderDelegate,
                      KyeeListenerRegister, PayOrderService, KyeeI18nService, HospitalSelectorService, PatientCardService, RechargeRecordsService, OperationMonitor) {

        // 是否可选择医院
        $scope.canBeSelect = ($rootScope.ROLE_CODE!="5");
        var storageCache = CacheServiceBus.getStorageCache();
        var cardInfo = [];//就诊者信息（无虚拟卡的）
        //给充值记录页面余额查询赋权
        var cardBalanceAuthorization = function(){
            var config = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.CURR_HOSPITAL_KAH);
            var record_balance = {
                id: 'recharge_records',
                items: []
            };
            //复制此页面余额查询权限并赋权
            for (var i = 0; i < config.length; i++) {
                if (config[i].id == 'wallet_card_recharge') {
                    var items = config[i].items;
                    for (var j = 0; j < items.length; j++) {
                        if (items[j].id == 'card_balance') {
                            record_balance.items.push(items[j]);
                            config.push(record_balance);
                            CacheServiceBus.getStorageCache().set(CACHE_CONSTANTS.STORAGE_CACHE.CURR_HOSPITAL_KAH, config);
                            break;
                        }
                    }
                    break;
                }
            }
            //更新配置
            KyeeActionHolderDelegate.refreshData();
        };

        //绑定页面数据
        $scope.placetxt = KyeeI18nService.get("wallet_card_recharge.inputMoney", "请输入充值金额");
        $scope.recharge = {
            CARD_NO: '',
            hospitalName: '',
            AMOUNT: ''
        };
        //更新提示语
        var prompt = function () {
            //有权限
            if (patientRechargeService.permission) {
                $scope.isEmpty = false;
                $scope.prompt = patientRechargeService.prompt;
            }
            else {
                $scope.isEmpty = true;
                $scope.emptyText = patientRechargeService.emptyText;
            }
        };
        //prompt();
        $scope.recharge.hospitalName = storageCache.get('hospitalInfo').name;
        //页面添加监听事件
        KyeeListenerRegister.regist({
            focus: "wallet_card_recharge",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (params) {
                HospitalSelectorService.isFromPatientRecharge = false;//清除从医院选择进入的标记  程铄闵 KYEEAPPTEST-3222
                $scope.recharge.hospitalName = storageCache.get('hospitalInfo').name;
                cardBalanceAuthorization();//KYEEAPPC-5217 程铄闵
                patientRechargeService.queryCardInfo(function (rechargeInfo) {
                    var k = 0;
                    var flag = false;//全为虚拟卡
                    if (rechargeInfo != null && rechargeInfo.length > 0) {
                        for (var j = 0; j < rechargeInfo.length; j++) {
                            //过滤虚拟卡（趣医）
                            if (rechargeInfo[j] && rechargeInfo[j].CARD_TYPE && rechargeInfo[j].CARD_TYPE == 0 && rechargeInfo[j].CARD_NO != undefined && rechargeInfo[j].CARD_NO.substring(0, 1) == "Q") {
                                break;
                            }
                            else {
                                flag = true;
                                cardInfo[k] = rechargeInfo[j];
                                k++;
                            }
                        }
                        if (flag) {
                            for (var i = 0; i < cardInfo.length; i++) {
                                if (cardInfo[i].IS_DEFAULT == '1') {
                                    $scope.recharge.CARD_NO = cardInfo[i].CARD_NO;
                                    $scope.recharge.PATIENT_ID = cardInfo[i].PATIENT_ID;
                                    break;
                                } else {
                                    $scope.recharge.CARD_NO = cardInfo[0].CARD_NO;
                                    $scope.recharge.PATIENT_ID = cardInfo[0].PATIENT_ID;
                                }
                            }
                        }
                        else {
                            $scope.recharge.CARD_NO = undefined;
                            $scope.recharge.PATIENT_ID = undefined;
                            $scope.recharge.AMOUNT = undefined;
                            cardInfo = [];
                        }
                    }
                    else {
                        $scope.recharge.CARD_NO = undefined;
                        $scope.recharge.PATIENT_ID = undefined;
                        $scope.recharge.AMOUNT = undefined;
                        cardInfo = [];
                    }
                    $scope.cardInfo = cardInfo;
                    //保存卡号和病人ID
                    RechargeRecordsService.CARD_NO = $scope.recharge.CARD_NO;
                    RechargeRecordsService.PATIENT_ID = $scope.recharge.PATIENT_ID;
                });
                //获取提示信息
                prompt();
                //从支付返回获取提示语
                if ($ionicHistory.forwardView()) {
                    var lastPage = $ionicHistory.forwardView().stateId;
                    if (lastPage == 'payOrder') {
                        if ($scope.recharge) {
                            $scope.recharge.AMOUNT = undefined;
                        }
                        patientRechargeService.loadMsg(function (permission) {
                            //开通权限
                            prompt();
                        });
                    }
                }
            }
        });

        //返回
        $scope.back = function () {
            if ($ionicHistory.backView()) {
                var lastPage = $ionicHistory.backView().stateId;
                if (lastPage == 'patient_card_select') { //KYEEAPPC-4842 程铄闵 跳转到查卡页
                    PatientCardService.filteringVirtualCard.isFilteringVirtual = true;
                    PatientCardService.filteringVirtualCard.routingAddress = "wallet_card_recharge"
                }
            }
            $ionicHistory.goBack();
            KyeeListenerRegister.uninstallOnce(KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK);
        };
        //监听物理键返回
        KyeeListenerRegister.regist({
            focus: "patient_recharge",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();   //禁掉默认处理，使物理返回与页面上的返回键一致
                $scope.back();
            }
        });

        //点击选择就诊卡
        $scope.showpatientCardNo = function () {
            OperationMonitor.record("showPatientCardNo","wallet_card_recharge");//添加按钮统计
            var menus = [];
            var cardNoList = $scope.cardInfo;
            for (var i = 0; i < cardNoList.length; i++) {
                if (cardNoList[i].IS_DEFAULT == '1') {
                    $scope.recharge.CARD_NO = cardNoList[i].CARD_NO;
                    $scope.recharge.PATIENT_ID = cardNoList[i].PATIENT_ID;
                }
                //begin KYEEAPPC-4494 By chengzhi,选卡界面重复选中问题
                var resultMap = {};
                resultMap["text"] = cardNoList[i].CARD_NO;
                resultMap["value"] = cardNoList[i].CARD_NO;//唯一属性CARD_NO
                resultMap["patientID"] = cardNoList[i].PATIENT_ID;
                //end KYEEAPPC-4494
                menus.push(resultMap);
            }
            //控制器中绑定数据：
            $scope.pickerItems = menus;
            $scope.title = KyeeI18nService.get("wallet_card_recharge.selCard", "请选择就诊卡");
            //调用显示
            $scope.showPicker($scope.recharge.CARD_NO);
        };
        //绑定选择事件
        $scope.bind = function (params) {
            $scope.showPicker = params.show;
        };
        //选择卡号
        $scope.selectItem = function (params) {
            //begin KYEEAPPC-4494 By chengzhi,选卡界面重复选中问题
            $scope.recharge.CARD_NO = params.item.value;
            $scope.recharge.PATIENT_ID = params.item.patientID;
            //end KYEEAPPC-4494
        };
        //确认充值
        $scope.rechargeSubmit = function () {
            if ($scope.recharge.CARD_NO == undefined || $scope.recharge.CARD_NO == '') {
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("wallet_card_recharge.selCard", "请选择就诊卡")
                });
                return;
            }
            if ($scope.recharge.AMOUNT == '' || $scope.recharge.AMOUNT == undefined) {
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("wallet_card_recharge.inputMoney", "请输入充值金额")
                });
                return;
            }
            //校验金额格式  By  章剑飞  KYEEAPPTEST-2779
            var reg = new RegExp('^[0-9]+(.[0-9]+)?$');
            if (!reg.test($scope.recharge.AMOUNT)) {
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("wallet_card_recharge.inputValidMoney", "请输入正确的金额！")
                });
                return;
            }
            patientRechargeService.rechargeSubmit(function (data) {
                data.ROUTER = 'recharge_records';
                PayOrderService.payData = data;
                //刷新数据
                $state.go('payOrder');
            }, $scope.recharge.CARD_NO, $scope.recharge.PATIENT_ID, $scope.recharge.AMOUNT);
        };

        //跳转查询就诊卡余额 By  程志 KYEEAPPC-3570 就诊卡优化
        $scope.goCardBalance = function () {
            $state.go('card_balance');
        };

        //跳转到充值记录  By  章剑飞
        $scope.goRechargeRecords = function () {
            $state.go('recharge_records');
        };

        //切换医院
        $scope.changeHospital = function () {
            if(!$scope.canBeSelect){
                return;
            }
            HospitalSelectorService.isFromPatientRecharge = true;
            $state.go("hospital_selector");
        };

    })
    .build();

