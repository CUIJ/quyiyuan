/**
 * 产品名称：quyiyuan.
 * 创建用户：杜巍巍
 * 日期：2015年12月15日
 * 任务号：KYEEAPPC-4374
 * 创建原因：更改设置页面控制器
 * 修改日期：2016年3月2日19:12:53
 * 修改任务号：KYEEAPPC-5022
 * 修改原因:就医记录增加体检单查询
 */
new KyeeModule()
    .group("kyee.quyiyuan.changeSetting.controller")
    .require([
        "kyee.quyiyuan.changeSetting.service",
        "kyee.framework.service.message"
    ])
    .type("controller")
    .name("ChangeSettingController")
    .params(["$scope", "$state", "$ionicHistory",
        "CacheServiceBus", "MyquyiService", "ChangeSettingService", "CommPatientDetailService","KyeeI18nService"])
    .action(function ($scope, $state,
                      $ionicHistory, CacheServiceBus, MyquyiService, ChangeSettingService, CommPatientDetailService,KyeeI18nService) {

        $scope.placeholderInputPatientCardNo = KyeeI18nService.get("change_setting.placeholderInputPatientCardNo","该医院就诊记录需要输入就诊卡");
        $scope.placeholderInputHospitalCardNo = KyeeI18nService.get("change_setting.placeholderInputHospitalCardNo","该医院住院记录需要输入住院号");
        $scope.placeholderInputBillCardNo = KyeeI18nService.get("change_setting.placeholderInputBillCardNo","该医院住院记录需要输入发票号");
        //定义一个颜色库用于界面显示医院已开通功能的背景颜色
        $scope.backgroundColor = [
            "#c0e0ac", "#f4c8bd", "#a5dccb", "RGB(148,219,255)", "RGB(221,188,255)"
        ];
        $scope.inputBothCard = {};
        var hospitalId = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;
        $scope.hospitalName = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).name;
        var hospitalInfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
        var inputCardInfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.INPUT_CARD_INFO);
        if (inputCardInfo && inputCardInfo[hospitalInfo.id]) {
            $scope.inputBothCard.PATIENT_CARDNO = inputCardInfo[hospitalInfo.id].PATIENT_CARD_NO;
            $scope.inputBothCard.HOSPITAL_CARDNO = inputCardInfo[hospitalInfo.id].HOSPITAL_CARD_NO;
            $scope.inputBothCard.BILL_CARDNO = inputCardInfo[hospitalInfo.id].BILL_CARD_NO;
        } else {
            $scope.inputBothCard = {
                PATIENT_CARDNO: "",
                HOSPITAL_CARDNO: "",
                BILL_CARDNO: ""
            };
        }

        $scope.isShowTipType = MyquyiService.isShowTipType.resultCode.split("");

        //查询该医院已开通的功能
        var queryOpenedFunction = function () {
            ChangeSettingService.queryOpenedFunction(hospitalId, function (data) {
                if (data) {
                    $scope.showOpened = data.data;
                }
            })
        };

        queryOpenedFunction();
        //点击提交
        $scope.submit = function () {
            //点击提交按钮，先将用户输入的信息存入缓存。
            $scope.setCachCardNoInfo();
            MyquyiService.isFromChangeSetting = true;
            $ionicHistory.goBack();
        };

        //将用户输入的信息存入缓存。
        $scope.setCachCardNoInfo = function () {
            var storageCache = CacheServiceBus.getStorageCache();
            var hospitalId = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;
            var cardInfo = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.INPUT_CARD_INFO);
            if (cardInfo == undefined) {
                cardInfo = {};
            }
            cardInfo[hospitalId] = {
                PATIENT_CARD_NO: $scope.inputBothCard.PATIENT_CARDNO,
                HOSPITAL_CARD_NO: $scope.inputBothCard.HOSPITAL_CARDNO,
                BILL_CARD_NO: $scope.inputBothCard.BILL_CARDNO
            };
            storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.INPUT_CARD_INFO, cardInfo);
        };
        //用户点击修改就诊者信息
        $scope.modifyPatient = function () {
            var currentPatient = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
            var current = angular.copy(currentPatient);//可直接操作缓存问题   By  张家豪  KYEEAPPTEST-3068
            CommPatientDetailService.editPatient(current);
        }

    })
    .build();
