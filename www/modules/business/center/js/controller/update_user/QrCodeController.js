/**
 * 产品名称 KYMH
 * 创建用户: 朱学亮
 * 日期: 2015/5/10
 * 时间: 15:45
 * 创建原因：个人二维码controller
 */
new KyeeModule()
    .group("kyee.quyiyuan.center.qr_code.controller")
    .require(["kyee.quyiyuan.center.service",
        "kyee.framework.service.message",
        "kyee.quyiyuan.center.qr_code.service",
        "kyee.quyiyuan.center.updateuser.service",
        "kyee.quyiyuan.center.service.QueryHisCardService"])
    .type("controller")
    .name("QrCodeController")
    .params(["$scope", "$state",
        "KyeeMessageService",
        "KyeeViewService",
        "QrCodeService",
        "UpdateUserService",
        "CacheServiceBus",
        "KyeeListenerRegister",
        "QueryHisCardService",
        "HospitalSelectorService",
        "CommPatientDetailService",
        "UpdateUserService",
        "KyeeI18nService"])
    .action(function ($scope, $state, KyeeMessageService, KyeeViewService, QrCodeService, UpdateUserControllerService, CacheServiceBus, KyeeListenerRegister, QueryHisCardService, HospitalSelectorService, CommPatientDetailService, UpdateUserService,KyeeI18nService) {
        var memoryCache = CacheServiceBus.getMemoryCache();//Memory缓存
        $scope.userInfo = {
            name: '',
            patientId: '',
            cardNo: ''
        };
        // 初始化选择二维码
        $scope.activityClass = 0;

        // 获取当前用户与就诊者基本信息
        //就诊者实名修改（APK）  By  张家豪  KYEEAPPC-4434
        var cache = CacheServiceBus.getMemoryCache();
        var current_user = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
        var current_patient = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
        var storageCache = KyeeAppHelper.getSimpleService("kyee.quyiyuan.service_bus.cache", "CacheServiceBus").getStorageCache();
        var hospitalInfo = storageCache.get("hospitalInfo");
        // 当前就诊者是默认就诊者时
        KyeeListenerRegister.regist({
            focus: "my_qr_code",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (params) {
                var current_card = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CARD_INFO);
                if(current_card&&current_card.USER_VS_ID){//有就诊卡
                    $scope.userInfo = {
                        name:current_patient.OFTEN_NAME,
                        patientId: current_card.PATIENT_ID,
                        cardNo: current_card.CARD_NO
                    };
                }else{
                    $scope.userInfo = {
                        name:current_patient.OFTEN_NAME
                    };
                }
                var patientId="";
                if(current_card&&current_card.PATIENT_ID){
                    patientId=current_card.PATIENT_ID;
                }
                QrCodeService.getQrImage(hospitalInfo.id, patientId, QrCodeService.qrCodeType,$scope)
            }
        });


        // 切换二维码和条形名
        // status = 0 二维码；status = 1 条形码
        $scope.selectStatus = function (status) {
            if (status == 0) {
                $scope.activityClass = 0;
                $scope.picSrc = QrCodeService.qrImage;
            } else if (status == 1) {//查看调条形码事件 判断是否有就诊卡
                var current_card = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CARD_INFO);
                if(current_card&&current_card.USER_VS_ID){//有就诊卡
                    $scope.activityClass = 1;
                    $scope.picSrc = QrCodeService.eanImage;
                }else{
                    KyeeMessageService.confirm({
                        title: KyeeI18nService.get("commonText.warmTipMsg","温馨提示"),
                        content: KyeeI18nService.get("commonText.selectCardMsg","该项业务需要您先添加就诊卡信息"),
                        okText: KyeeI18nService.get("commonText.selectOk","前往添加"),
                        cancelText: KyeeI18nService.get("commonText.selectCancel","以后再说"),
                        onSelect: function (res) {
                            if (res) {
                                $state.go("patient_card_select");
                            }
                        }
                    });
                }

            }
        };
    })
    .build();