/**
 * 名称：quyiyuan
 * 作者: 程志
 * 日期:2015年８月10日
 * 创建原因：个人中心／常用信息(KYEEAPPC-2989)
 * 功能:个人中心--常用信息--就诊卡管理--添加新卡
 */

new KyeeModule()
    .group("kyee.quyiyuan.frequent_info.patient_card_add.controller")
    .require(["kyee.quyiyuan.frequent_info.patient_card_city.controller",
        "kyee.quyiyuan.frequent_info.patient_card_hospital.controller",
        "kyee.quyiyuan.frequent_info.patient_card_type.controller"])
    .type("controller")
    .name("PatientCardAddController")
    .params(["$scope", "$rootScope", "$state",
        "KyeeListenerRegister", "CacheServiceBus", "$ionicHistory",
        "KyeeViewService", "PatientCardService", "QueryHisCardService",
        "KyeeMessageService", "KyeeI18nService", "KyeeUtilsService", "HospitalSelectorService", "KyeeScanService"])
    .action(function ($scope, $rootScope, $state,
                      KyeeListenerRegister, CacheServiceBus, $ionicHistory,
                      KyeeViewService, PatientCardService, QueryHisCardService,
                      KyeeMessageService, KyeeI18nService, KyeeUtilsService, HospitalSelectorService, KyeeScanService) {

        if($ionicHistory.backView()){
            //是否从就诊卡管理页面进入
            $scope.isPatientCardEntry = ($ionicHistory.backView().stateName == "patient_card");
            //是否从选择卡页面进入    KYEEAPPC-9191  yangmingsi
            $scope.isSelectCard = ($ionicHistory.backView().stateName == "patient_card_select");
        }
        //是否可选医院地区
        $scope.canBeSelect = ($rootScope.ROLE_CODE != "5");
        var ELECTRONIC_HEALTH_CARD_RHCM_ISOPEN = 0;
        $scope.addCardDescription = "";
        $scope.data = {};
        $scope.isTiyanHospital = false;
        var memCache = CacheServiceBus.getMemoryCache();
        var stgCache = CacheServiceBus.getStorageCache();
        //默认卡片url
        var defaultCardUrl = "resource/images/center/default_card.png";
        $scope.hasCard = false;
        $scope.iconIsShow = false;
        var curhospInfo = stgCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
        if(curhospInfo&&curhospInfo.id == 1001){
            $scope.isTiyanHospital = true;
        }else{
            $scope.isTiyanHospital = false;
        }
        $scope.healthCardTip = "";

        var publicServiceType = memCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_PUBLIC_SERVER_TYPE);

        var hopCardType = function (hid) {

            //获取医院支持的卡类型    KYEEAPPC-3837
            PatientCardService.loadTypeList(hid, function (data) {


                if (data.length == 1) {
                    //仅一张卡类型
                    $scope.iconIsShow = false;
                    //卡片信息
                    $scope.card.NAME = data[0].ITEM_NAME;
                    $scope.card.TYPE = data[0].ITEM_VALUE;
                    if(data[0].CARD_URL){
                        $scope.card.CARD_URL = data[0].CARD_URL;
                    }else if(data[0].ITEM_VALUE == 1){
                        $scope.card.CARD_URL = defaultCardUrl;
                    }else{
                        $scope.card.CARD_URL = undefined;
                    }
                    $scope.card.defaultText = '请输入'+$scope.card.NAME+'号';
                } else if($scope.card.TYPE == 1){
                    //$scope.card.CARD_URL = defaultCardUrl;
                    if(data[0].CARD_URL){
                        $scope.card.CARD_URL = data[0].CARD_URL;
                    }else if(data[0].ITEM_VALUE == 1){
                        $scope.card.CARD_URL = defaultCardUrl;
                    }else{
                        $scope.card.CARD_URL = undefined;
                    }
                }else{
                    //没有卡类型
                    $scope.iconIsShow = true;
                }
            });
        };

        $scope.showInfo = {
            SHOW_INPUT_BOX: true,
            IS_SCAN_CODE: false,
            MSG: "",
            CARD_SPECIAL_DESCRIPTION:"",
            showSpecialMessage:false

        };

        //地区信息
        $scope.area = {
            PROVINCE_CODE: "",
            PROVINCE_NAME: "",
            CITY_CODE: "",
            CITY_NAME: ""
        };

        //医院信息
        $scope.hospital = {
            ID: "",
            NAME: ""
        };

        //卡片信息
        $scope.card = {
            TYPE: "",
            NAME: "",
            NUM: "",
            CARD_URL:"",
            defaultText:""
        };
        //就诊者信息
        $scope.patientInfo = {
            PATIENT_NAME: "",
            PATIENT_IDNUM: "",
            PATIENT_PHONE:""
        };

        //将其他界面进入和当前就诊者界面进入，设置医院为当前选择的医院
        // 任务号： KYEEAPPC-3455  修改人：高斐  任务描述：添加就诊卡时默认填充已选择医院地区及医院

        var stgCache = CacheServiceBus.getStorageCache();
        var hospInfo = stgCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
        if(hospInfo){
            $scope.area.PROVINCE_CODE = hospInfo.provinceCode;
            $scope.area.PROVINCE_NAME = hospInfo.provinceName;
            $scope.area.CITY_CODE = hospInfo.cityCode;
            $scope.area.CITY_NAME = hospInfo.cityName;
            $scope.hospital.ID = hospInfo.id;
            $scope.hospital.NAME = hospInfo.name;
        }

        //通过医院ID查询支持的卡类型 KYEEAPPC-3837
        if (hospInfo && hospInfo.id) {
            hopCardType(hospInfo.id)
        }




        $scope.go2City = function () {
            if ($scope.isPatientCardEntry && $scope.canBeSelect) {
                $state.go("patient_card_city");
            }
        };

        //跳转医院选择界面，前提是地区已选
        $scope.go2Hospital = function () {
            if ($scope.isPatientCardEntry && $scope.canBeSelect && PatientCardService.validateArea($scope.area)) {
                $state.go("patient_card_hospital");
            }
        };

        //跳转卡类型选择界面，前提是医院已选
        $scope.go2Type = function () {

            if ($scope.iconIsShow == false) {
                return;
            }
            if (PatientCardService.validateHospital($scope.hospital)) {

                $state.go("patient_card_type");
            }
        };

        /**
         * 扫描点击事件
         * zhangjiahao
         * KYEEAPPC-4588
         */
        $scope.scan = function () {
            KyeeScanService.scan(
                function (code) {
                    $scope.card.NUM = code;
                    setTimeout(function () {
                        $scope.$apply();
                    }, 1); // 刷新
                    $scope.addCard();
                },
                function () {
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("regist.failScaner", "扫描失败!")
                    });
                }
            );
        };

        //提交增加卡片
        $scope.addCard = function () {

            //校验表单数据
            if (PatientCardService.validateArea($scope.area)
                && PatientCardService.validateHospital($scope.hospital)
                && PatientCardService.validateCard($scope.card, $scope.showInfo.SHOW_INPUT_BOX)) {

                var userID = "";
                if ($scope.isSelectCard) {
                    userID = PatientCardService.selectUserInfoUsed.USER_VS_ID;
                }else {
                    userID = memCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT).USER_VS_ID;
                }

                var onlyCardNo = "";
                //仅支持虚拟卡,卡类型设为0   KYEEAPPC-3837
                if ($scope.card.onlyCard) {
                    onlyCardNo = 0;
                    $scope.card.onlyCard = undefined;
                } else {
                    onlyCardNo = $scope.card.TYPE;
                }
                var cardInfo = {
                    userVsId: userID,
                    hospitalId: $scope.hospital.ID,
                    cardNo: $scope.card.NUM,
                    cardType: onlyCardNo
                };

                PatientCardService.addCard(cardInfo, function (data) {
                    if (data.success && !$scope.isPatientCardEntry
                        && data.data != null && data.data.SUCCESS_FLAG == "FALSE") {
                        if(PatientCardService.fromSource != "fromAppoint" ){
                            PatientCardService.fromSource = "patientCardSelect";//选择卡页面进入标识 KYEEAPPC-9191
                        }
                        data.message += KyeeI18nService.get("patient_card_add.qur", "请在确认成功添加就诊卡以后再进行后续的业务操作！");
                        PatientCardService.showMessage(data.message);//APPCOMMERCIALBUG-2234  提示框改变  张家豪
                        // 修改路由历史
                        switchState();

                        HospitalSelectorService.isFromPatientRecharge = false;//增加就诊卡充值切医院的标记 程铄闵 KYEEAPPTEST-3222
                        $state.go("patient_card");

                    } else {
                        //仅支持虚拟卡的医院生成虚拟卡不跳转前一个页面 KYEEAPPC-8005
                        if(onlyCardNo && onlyCardNo!=0){
                            if(PatientCardService.fromSource == "fromAppoint") {
                                PatientCardService.fromAppoint = false;
                                PatientCardService.fromSource = undefined;
                            }
                            $ionicHistory.goBack(-1);
                            PatientCardService.showMessage(data.message);
                        }else{
                            KyeeMessageService.broadcast({
                                content: KyeeI18nService.get("patient_card_select.notSupportFictitiousCard", data.message)
                            });
                        }
                    }
                });
            }
        };

        //刷新页面显示信息
        var refreshShowInfo = function (data) {
            if (data) {
                if (data.ADD_CARD_DESCRIPTION) {
                    $scope.addCardDescription = data.ADD_CARD_DESCRIPTION;
                }
                if (data.CARD_TYPE == "true" || data.CARD_TYPE == true) {
                    data.CARD_TYPE = true;
                    //仅支持虚拟卡    KYEEAPPC-3837
                    $scope.card.onlyCard = true;
                } else {
                    data.CARD_TYPE = false;
                    $scope.card.onlyCard = false;
                }
                if (data.SHOW_INPUT_BOX == "true" || data.SHOW_INPUT_BOX == true) {
                    data.SHOW_INPUT_BOX = true;
                } else {
                    //如果是仅支持虚拟卡的话，就不会存在输入框    KYEEAPPC-3837
                    data.SHOW_INPUT_BOX = false;
                }
                if (data.IS_SCAN_CODE == "true" || data.IS_SCAN_CODE == true) {
                    data.IS_SCAN_CODE = true;
                } else {
                    data.IS_SCAN_CODE = false;
                }

                if(PatientCardService.ELECTRONIC_HEALTH_CARD_RHCM_ISOPEN == 1 &&
                    (data.HOS_ELECTRONIC_HEALTH_CARD_RHCM_ISOPEN == "true" || data.HOS_ELECTRONIC_HEALTH_CARD_RHCM_ISOPEN == true) && publicServiceType == "020478"){
                    PatientCardService.electronicHealthCardRhcmIsopen = 1;
                    $scope.healthCardTip = "该医院已开通电子健康卡功能，可直接点击查询按钮，获取电子健康卡后进行就诊";
                    $scope.showHealthCardTip = true;
                }else{
                    $scope.healthCardTip = "";
                    $scope.showHealthCardTip = false;
                    PatientCardService.electronicHealthCardRhcmIsopen = 0;
                }
                if(data.HOS_ELECTRONIC_HEALTH_CARD_RHCM_ISOPEN == "true" || data.HOS_ELECTRONIC_HEALTH_CARD_RHCM_ISOPEN == true){
                    data.HOS_ELECTRONIC_HEALTH_CARD_RHCM_ISOPEN = true;
                }else{
                    data.HOS_ELECTRONIC_HEALTH_CARD_RHCM_ISOPEN = false;
                }

                $scope.showInfo = data;
                //仅支持虚拟卡
                if($scope.showInfo && $scope.showInfo.CARD_TYPE && !$scope.showInfo.SHOW_INPUT_BOX) {
                    $scope.addCard();
                }
            }
            //获取缓存中就诊者信息 KYEEAPPC-8005
            if($scope.showInfo && !$scope.showInfo.CARD_TYPE){
                var currentUser=memCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                $scope.patientInfo.PATIENT_NAME = currentUser.OFTEN_NAME;
                $scope.patientInfo.PATIENT_IDNUM = currentUser.ID_NO;
                $scope.patientInfo.PATIENT_PHONE = currentUser.PHONE;
                handlePatientDate(currentUser);
            }
            //显示支持就诊卡的医院需要特殊说明的情况
            if(!$scope.showInfo.CARD_TYPE && $scope.showInfo.CARD_SPECIAL_DESCRIPTION && $scope.showInfo.CARD_SPECIAL_DESCRIPTION!="NULL"){
                $scope.showInfo.showSpecialMessage = true;
            }

        };

        //KYEEAPPC-3207添加就诊卡界面物理返回健第一次失效
        //add by 程志
        KyeeListenerRegister.regist({
            focus: "patient_card_add",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                $scope.goBack();
            }
        });
        //end

        //选择医院返回此页面时候更新显示信息
        KyeeListenerRegister.regist({
            focus: "patient_card_add",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "back",
            action: function (params) {
                //从选择医院界面过来才刷新页面显示信息
                var forwardView = $ionicHistory.forwardView();
                if (forwardView && forwardView.stateName == "patient_card_hospital") {
                    //如果选择了其他医院 ，给当前页面绑定医院名称和医院id  KYEEAPPC-8555
                    if (PatientCardService.hospIdChange && PatientCardService.hospNameChange) {
                        if(PatientCardService.showInfo
                            && (PatientCardService.showInfo.CARD_TYPE=="false"||PatientCardService.showInfo.CARD_TYPE==false)){
                            $scope.hospital.ID = PatientCardService.hospIdChange;
                            hopCardType(PatientCardService.hospIdChange);
                            refreshShowInfo(PatientCardService.showInfo);
                            $scope.hospital.NAME = PatientCardService.hospNameChange;
                        }else{
                            hopCardType(hospInfo.id);
                            $scope.hospital.NAME = hospInfo.name;
                        }
                    } else {
                        hopCardType(hospInfo.id);
                        $scope.hospital.NAME = hospInfo.name;
                    }
                }
                //监听预约挂号确认页面进入查卡页面进行参数处理（处理返回页面的情况）KYEEAPPC-9191 yangmingsi
                if(PatientCardService.fromAppoint) {
                    if($scope.card.TYPE.length==1&&$scope.card.TYPE!=0){
                        $scope.card = {
                            TYPE: $scope.card.TYPE,
                            NAME: $scope.card.NAME,
                            NUM: "",
                            CARD_URL:$scope.card.CARD_URL,
                            defaultText:$scope.card.defaultText
                        };
                    }else{
                        //卡片信息
                        $scope.card = {
                            TYPE: $scope.card.TYPE,
                            NAME: "",
                            NUM: "",
                            CARD_URL:$scope.card.CARD_URL,
                            defaultText:$scope.card.defaultText
                        };
                    }

                    PatientCardService.fromAppoint = false;
                }
                if (forwardView && forwardView.stateName == "patient_card_type") {
                    //如果选择了其他医院 ，给当前页面绑定医院名称和医院id  KYEEAPPC-8555
                    PatientCardService.getShowInfo(hospInfo.id, function (resp) {
                        refreshShowInfo(resp.data);
                    });
                    var card = PatientCardService.scopeAdd;
                    $scope.card = card.card;
                }
            }
        });

        //修改导航历史
        var switchState = function () {
            var historyId = $ionicHistory.currentHistoryId();
            var viewHistory = $ionicHistory.viewHistory().histories[historyId].stack;
            //修改ionic导航历史
            for (var i = 0; i < viewHistory.length; i++) {
                if (viewHistory[i].stateId == 'patient_card_select') {
                    viewHistory[i].stateId = 'patient_card';
                    viewHistory[i].stateName = 'patient_card';
                    break;
                }
            }
        };

        $scope.goBack = function () {
            PatientCardService.electronicHealthCardRhcmIsopen = undefined;
            PatientCardService.hospIdChange = undefined;
            if(PatientCardService.fromPatientCard){
                $state.go("patient_card")
                PatientCardService.fromPatientCard = false;
            }else{
                $ionicHistory.goBack(-1);
            }

        };

        /**
         * 获取屏幕长宽尺寸
         * @type {*|{width, height}|{width: Number, height: Number}}
         */
        var screenSize = KyeeUtilsService.getInnerSize();

        /**
         * 遮罩
         */
        $scope.bind = function (params) {
            $scope.showOverlay = params.show;//展示浮动层方法
            $scope.hideOverlay = params.hide;//关闭浮动层方法
        };

        /**
         * 放大就诊卡显示
         */
        $scope.imgClick = function () {
            if ($scope.card && $scope.card.CARD_URL) {
                $scope.data = $scope.card.CARD_URL;
                $scope.showOverlay();
            }
        };
        /**
         * 描述：进入添加卡页面，如果是仅支持虚拟卡的医院，自动生成虚拟卡
         * 任务号：KYEEAPPC-8005
         * 作者：yangmingsi
         */
        KyeeListenerRegister.regist({
            focus: "patient_card_add",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.ENTER,
            action: function (params) {
                PatientCardService.scopeAdd = $scope;
                //监听预约挂号确认页面进入查卡页面进行参数处理（处理返回页面的情况）KYEEAPPC-9191 yangmingsi
                if(PatientCardService.fromAppoint) {
                    if($scope.card.TYPE.length==1&&$scope.card.TYPE!=0){
                        $scope.card = {
                            TYPE: $scope.card.TYPE,
                            NAME: $scope.card.NAME,
                            NUM: "",
                            CARD_URL:$scope.card.CARD_URL,
                            defaultText:$scope.card.defaultText
                        };
                    }else{
                        //卡片信息
                        $scope.card = {
                            TYPE: $scope.card.TYPE,
                            NAME: "",
                            NUM: "",
                            CARD_URL:$scope.card.CARD_URL,
                            defaultText:$scope.card.defaultText
                        };
                    }

                    PatientCardService.fromAppoint = false;
                }
                //获取卡片url
                if (hospInfo) {  //有医院直接请求，没有医院选完医院再请求
                    PatientCardService.getShowInfo(hospInfo.id, function (resp) {
                        refreshShowInfo(resp.data);
                    });
                }
            }
        });

        /**
         * 温馨提示 KYEEAPPC-8005 yangmingsi
         */
        $scope.showTipInfo=function(){
            //var messageG=($scope.showInfo.MSG && !$scope.showInfo.SHOW_INPUT_BOX)?(" \n "+$scope.showInfo.MSG):"";
            var tips=$scope.addCardDescription
            KyeeMessageService.message({
                title: KyeeI18nService.get('commonText.warmTipMsg', '温馨提示', null),
                okText: KyeeI18nService.get("commonText.iknowMsg", "确定"),
                content: KyeeI18nService.get('patient_card_select.addNewCardTalk',tips, null)
            });
        };
        /**
         * 任务号：KYEEAPPC-8555
         * 作者：yangmingsi
         * 处理身份证和手机号的展示问题
         * @param patient
         */
        var handlePatientDate = function(patient){
            if (patient.ID_NO && patient.ID_NO.substring(0, 4) != 'XNSF') {
                $scope.patientIdNoShow = (patient.ID_NO.replace(/(.{3}).*(.{4})/,"$1********$2"));
            }
            if(patient.PHONE){
                $scope.patientPhoneShow = (patient.PHONE.replace(/(.{3}).*(.{4})/,"$1****$2"));
            }
        };
    })
    .build();