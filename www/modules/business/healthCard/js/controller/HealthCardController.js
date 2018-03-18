/**
 * 产品名称 quyiyuan.
 */
new KyeeModule()
    .group("kyee.quyiyuan.healthCard.controller")
    .require(["kyee.quyiyuan.healthCard.service",
        "kyee.quyiyuan.center.controller.custom_patient",
        "kyee.quyiyuan.supportHospital.controller",
        "kyee.quyiyuan.healthCardPay.controller"])
    .type("controller")
    .name("HealthCardController")
    .params(["$scope","$state","$ionicScrollDelegate","$ionicHistory","CacheServiceBus","CommPatientDetailService","AuthenticationService","KyeeI18nService","KyeeListenerRegister","HealthCardService","KyeeMessageService","MultipleQueryCityService","KyeeUtilsService","PatientCardRechargeService"])
    .action(function($scope,$state,$ionicScrollDelegate,$ionicHistory,CacheServiceBus,CommPatientDetailService,AuthenticationService,KyeeI18nService,KyeeListenerRegister,HealthCardService,KyeeMessageService,MultipleQueryCityService,KyeeUtilsService,PatientCardRechargeService){
        $scope.tipMsg = "";
        $scope.isHasCard = true;
        var memCache = CacheServiceBus.getMemoryCache();
        var stgCache = CacheServiceBus.getStorageCache();
        $scope.reset = true;
        //就诊者信息
        $scope.patientInfo = {
            OFTEN_NAME: "",
            ID_NO: "",
            PHONE:"",
            USER_VS_ID:"",
            FLAG:""
        };
        $scope.placeholder = {
            pHArea:"请选择地区"
        };
        // 动态获取屏幕的宽度
        $scope.totalWidth = window.innerWidth;
        var healthCardArea = [];
        var queryHealthCardAreaInfo = function () {
            HealthCardService.queryHealthCardAreaInfo(function (data,success) {
                if(success){
                    if(data&&data.data){
                        healthCardArea = data.data;
                        goCurrentPosition();
                    }
                }else{
                    KyeeMessageService.broadcast({
                        content: "网络异常，请稍后重试"
                    });
                }
            })
        };

        queryHealthCardAreaInfo();
        /**
         * 点击当前位置更新选择城市信息  By  杜巍巍  KYEEAPPC-4117
         */
        var currentPosition = "";
        var goCurrentPosition = function () {
            currentPosition = stgCache.get(CACHE_CONSTANTS.STORAGE_CACHE.LOAD_CURRENT_CITY_INFO);
            if (!currentPosition) {
                MultipleQueryCityService.selectDevice(function () {
                    currentPosition = stgCache.get(CACHE_CONSTANTS.STORAGE_CACHE.LOAD_CURRENT_CITY_INFO);
                    if(currentPosition){
                        updateCurrentHealthCardArea(currentPosition);
                    }else{
                        //没有选地区
                        if(!$scope.areaInfo.AREA_CODE || $scope.areaInfo.AREA_CODE == ""){
                            $scope.areaInfo.AREA_CODE ="";
                            $scope.isChooseInfo = false;
                            $scope.reset = true;
                            return;
                        }else{
                            $scope.isChooseInfo = true;
                            $scope.reset = false;
                        }
                    }

                });
            } else {
                updateCurrentHealthCardArea(currentPosition);
            }

        };
        var updateCurrentHealthCardArea = function () {
            if(currentPosition&&healthCardArea && healthCardArea.length>0){
                for(var i=0; i<healthCardArea.length; i++){
                    if(healthCardArea[i].areaCode == currentPosition.CITY_CODE){
                        $scope.areaInfo.AREA_NAME = healthCardArea[i].areaName;
                        $scope.areaInfo.AREA_CODE = healthCardArea[i].areaCode;
                        $scope.isChooseInfo = true;
                        $scope.reset = false;
                        queryHealthCardInfo();
                        break;

                    }else{
                        $scope.areaInfo.AREA_NAME="";
                        $scope.areaInfo.AREA_CODE ="";
                        $scope.isChooseInfo = false;
                        $scope.reset = true;
                    }
                }
            }else{
                $scope.areaInfo.AREA_NAME="";
                $scope.areaInfo.AREA_CODE ="";
                $scope.isChooseInfo = false;
                $scope.reset = true;
            }
        };

        KyeeListenerRegister.regist({
            focus: "healthCard",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (params) {
                var currentUser=memCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                if(currentUser){
                    $scope.patientInfo.OFTEN_NAME = currentUser.OFTEN_NAME;
                    $scope.patientInfo.ID_NO = currentUser.ID_NO;
                    $scope.patientInfo.PHONE = currentUser.PHONE;
                    $scope.patientInfo.USER_VS_ID = currentUser.USER_VS_ID;
                }
                if($ionicHistory.forwardView()&&$ionicHistory.forwardView().stateName){
                    //是否从就诊者管理页面进入
                    $scope.isCustomPatientEntry = ($ionicHistory.forwardView().stateName == "custom_patient");
                }
                if($scope.isCustomPatientEntry){
                    resetData();
                    queryHealthCardInfo();
                }
            }
        });


        //组件页面开启时候的bind值
        $scope.areaInfo = {AREA_CODE: "",AREA_NAME:""};
        var setClientinfo = function (areaInfo) {
            var menus = [];
            if (areaInfo != null && areaInfo.length > 0) {
                for (var l = 0; l < areaInfo.length; l++) {
                    var resultMap = {};
                    resultMap["center"] = true;
                    resultMap["text"] = areaInfo[l].areaName;
                    resultMap["value"] = areaInfo[l].areaName;
                    resultMap["code"] = areaInfo[l].areaCode;
                    menus.push(resultMap);
                }
            }
            //控制器中绑定数据
            $scope.pickerItems = menus;
        };
        $scope.tipIsShow = function () {
            $scope.tipsIsShow = false;
        };
        //绑定选择事件
        $scope.bind = function (params) {
            $scope.showPicker = params.show;

        };
        $scope.bind2 = function (params) {
            $scope.showOverlay = params.show;
        }
        //点击选择区域
        $scope.showAreaArray = function () {
            $scope.showType=0;//展示区域组件
            setClientinfo(healthCardArea);
            $scope.title = "请选择地区";
            $scope.showPicker($scope.areaInfo.AREA_NAME);
        };
        $scope.selectItem = function (params) {
            $scope.areaInfo.AREA_NAME = params.item.value;

            $scope.areaInfo.AREA_CODE = params.item.code;
            //将选中的卡号显示到页面上
            /*$scope.selectedAreaCode = params.item.code;
            $scope.selectedAreaName = params.item.value*/;
            resetData();
            queryHealthCardInfo();
        };
        var resetData = function () {
            $scope.tip = "";
            $scope.reset = false;

        };
        var functionStatus = {
            PATIENT_QUERY:"",
            PATIENT_RECHARGE:"",
            PATIENT_RETURN:""
        };
        $scope.healthCardInfo = [];
        var queryHealthCardInfo = function () {
            //没有选地区
            if(!$scope.areaInfo.AREA_CODE || $scope.areaInfo.AREA_CODE == ""){
                $scope.areaInfo.AREA_CODE ="";
                $scope.isChooseInfo = false;
                $scope.reset = true;
                return;
            }else{
                $scope.isChooseInfo = true;
                $scope.reset = false;
            }
            HealthCardService.queryHealthCardInfo($scope.areaInfo.AREA_CODE,$scope.patientInfo.OFTEN_NAME,$scope.patientInfo.PHONE,$scope.patientInfo.ID_NO,function (data,success) {
                if(success){
                    if(data&&data.data){
                       if(data.data.cardInfo){
                           $scope.healthCardInfo = data.data.cardInfo;
                           if($scope.healthCardInfo && $scope.healthCardInfo.length>0){
                               for(var l=0;l<$scope.healthCardInfo.length;l++){
                                   var num = $scope.healthCardInfo[l].cardNo;
                                   $scope.healthCardInfo[l].cardNoShow = handleIdCardNo(num);
                               }
                           }
                           $scope.isHasCard = true;
                           $scope.reset = false;
                           if(data.data.functionStatus){
                               if(data.data.functionStatus.PATIENT_QUERY){
                                   functionStatus.PATIENT_QUERY = data.data.functionStatus.PATIENT_QUERY;
                               }
                               if(data.data.functionStatus.PATIENT_RECHARGE){
                                   functionStatus.PATIENT_RECHARGE = data.data.functionStatus.PATIENT_RECHARGE;
                               }
                               if(data.data.functionStatus.PATIENT_RETURN){
                                   functionStatus.PATIENT_RETURN = data.data.functionStatus.PATIENT_RETURN
                               }
                               PatientCardRechargeService.rechargeInfo = functionStatus;
                           }
                       }else {
                           $scope.isHasCard = false;
                           $scope.reset = true;
                       }
                       if(data.data.tip){
                           if(data.data.tip.tipInfo){
                               $scope.tip = data.data.tip.tipInfo;
                           }
                           if(data.data.tip.supportHosList&&data.data.tip.supportHosList.length>0){
                               $scope.supportHosList = data.data.tip.supportHosList;
                           }
                       }
                    }else {
                        $scope.isHasCard = false;
                        $scope.reset = true;
                    }
                }else{
                    $scope.isHasCard = false;
                    $scope.reset = true;
                }
            })
        };
        var handleIdCardNo = function (card) {
            var len = card.length;
            var a ="";
            var i = 0;
            while(i<len){
                if(len-i<=4){
                    a=a+card.substring(i,len);
                    i=i+4;
                }else{
                    a=a+card.substring(i,i+4)+" ";
                    i=i+4;
                }
            }
            return a;
        };
        $scope.healthCardDetails = {};
        /**
         *  点击详情
         */
        var screenSize = KyeeUtilsService.getInnerSize();
        $scope.overlayData = {
            width: screenSize.width - 50 * 2,
            height: screenSize.height / 2 + 200
        };
        $scope.showHealthCardDetails = function (item) {
            $scope.showType=1;//展示详情组件
            //保存热度
            $scope.overlayData = {
                width: screenSize.width - 50 * 2,
                height: screenSize.height / 2 - 100
            };
            if(item){
                $scope.healthCardDetails = {
                    platformBalance:item.platformBalance,
                    details:item.details

                };
            }
            $ionicScrollDelegate.$getByHandle('mainScroll').scrollTop();
            $scope.showOverlay();
        };

        //切换就诊者按钮
        $scope.goCustomPatient = function(){
            $state.go('custom_patient');
        };
        //充值
        $scope.goToHealthCardPay = function (card) {
            HealthCardService.healthCardItem = card;
            HealthCardService.healthCardItem.AREA_CODE = $scope.areaInfo.AREA_CODE;
            if(card.idCardNo){
                HealthCardService.healthCardItem.idCardNo = card.idCardNo;
            }else{
                HealthCardService.healthCardItem.idCardNo = $scope.patientInfo.ID_NO;
            }

            if(card.patientName){
                HealthCardService.healthCardItem.patientName = card.patientName;
            }else{
                HealthCardService.healthCardItem.patientName = $scope.patientInfo.OFTEN_NAME;
            }

            if(card.phoneNumber){
                HealthCardService.healthCardItem.phoneNumber = card.phoneNumber;
            }else{
                HealthCardService.healthCardItem.phoneNumber = $scope.patientInfo.PHONE;
            }
            $state.go('healthCardPay');
        };
        //支持的医院
        $scope.goToSupportHospital = function () {
            HealthCardService.supportHosList = $scope.supportHosList;
            HealthCardService.tip = $scope.tip;
            $state.go("supportHospital");
        };

        KyeeListenerRegister.regist({
            focus: "healthCard",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                $scope.goBack();
            }
        });

        $scope.goBack = function () {
            $ionicHistory.goBack();
        };
    })
    .build();