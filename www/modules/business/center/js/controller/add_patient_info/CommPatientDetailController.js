/*
 * 产品名称：quyiyuan
 * 创建人: 张家豪
 * 修改人：张家豪
 * 创建日期:2015年5月4日10:18:09
 * 创建原因：个人中心主页开发（APK）
 */
'use strict';
new KyeeModule()
    .group("kyee.quyiyuan.center.controller.comm_patient_detail")
    .require([
        "kyee.quyiyuan.center.service",
        "kyee.framework.service.message",
        "kyee.framework.service.view",
        "kyee.quyiyuan.center.controller.query_his_card",
        "kyee.quyiyuan.center.controller.comm_patient_detail",
        "kyee.quyiyuan.center.comm_patient_detail.service",
        "kyee.quyiyuan.center.authentication.controller",
        "kyee.framework.device.deviceinfo",
        "kyee.framework.device.camera",
        "kyee.quyiyuan.center.bindMSCard.service",
        "kyee.framework.device.message",
        "kyee.quyiyuan.center.bindMSCard.controller"])
    .type("controller")
    .name("CommPatientDetailController")
    .params([
        "$scope",
        "$interval",
        "$state",
        "KyeeMessageService",
        "KyeeViewService",
        "CommPatientDetailService",
        "CacheServiceBus",
        "HospitalSelectorService",
        "UpdateUserService",
        "QueryHisCardService",
        "AuthenticationService",
        'KyeeUtilsService',
        "KyeeDeviceInfoService",
        "KyeeCameraService",
        "AddPatientInfoService",
        "LoginService",
        "BindMSCardService",
        "KyeeDeviceMsgService",
        "PatientCardService",
        "KyeeI18nService",
        "KyeeListenerRegister",
        "ReportMultipleService",
        "$ionicHistory",
        "KyeePhoneService",
        "OperationMonitor",
        "$location",
        "FilterChainInvoker",
        "QrCodeService"])
    .action(function ($scope,
                      $interval,
                      $state,
                      KyeeMessageService,
                      KyeeViewService,
                      CommPatientDetailService,
                      CacheServiceBus,
                      HospitalSelectorService,
                      UpdateUserService,
                      QueryHisCardService,
                      AuthenticationService,
                      KyeeUtilsService,
                      KyeeDeviceInfoService,
                      KyeeCameraService,
                      AddPatientInfoService,
                      LoginService,
                      BindMSCardService,
                      KyeeDeviceMsgService,
                      PatientCardService,
                      KyeeI18nService,
                      KyeeListenerRegister,
                      ReportMultipleService,
                      $ionicHistory,
                      KyeePhoneService,
                      OperationMonitor,
                      $location,
                      FilterChainInvoker,
                      QrCodeService) {

        //初始化一些字段
        $scope.userInfo = {
            phoneText: KyeeI18nService.get("comm_patient_detail.pleaseEnter", "请在此输入手机号"), //手机号输入域默认显示
            validateMsgText: KyeeI18nService.get("update_user.validateMsgText", "获取验证码"),//发送验证码按钮显示
            healthCard: KyeeI18nService.get("comm_patient_detail.query", "查询"),             //医保卡按钮显示
            nameAndIdentityCcardInput: false,  //姓名和身份证输入限制
            validateBtnDisabled: false,//发送验证码按钮置灰
            phoneNumDisabled: false,//手机号输入栏置灰
            clickHealth: false,      //医保卡按钮置灰控制
            medicalPayc: false,      //医保卡显示控制
            experience: true,       //提交按钮显示控制
            isShowIdNo: false,       //身份证是否显示控制
            showCard: false,         //就诊卡显示控制
            realName: false,         //实名认证
            smsInput: false,         //是否显示验证码输入栏
            showAge: false,          //控制生日是否显示
            CLINIC_DATE: "",         //儿童生日
            isDisplayed: "",          //验证码输入栏是否显示
            CARD_SHOW: "",         //虚拟卡隐藏处理标志
            IS_CHILD: "",          //是否是儿童标志位
            CARD_NO: "",           //就诊卡
            FLAG: "",              //实名认证标志
            dateZujian:undefined,
            addressZujian:undefined
        };

        $scope.placeholder = {
            idNo: KyeeI18nService.get("update_user.purYouId", "根据身份证号关联就诊卡号"),
            phone: KyeeI18nService.get("update_user.purYouPhone", "请在此输入手机号"),
            valiteCode: KyeeI18nService.get("update_user.purYouCode", "请输入验证码"),
            sex: KyeeI18nService.get("update_user.purYouSex", "根据身份证自动识别"),
            name: KyeeI18nService.get("update_user.purYouName", "请输入您的名字")
        };
        $scope.PRESENT_ADDRESS_placeholder = KyeeI18nService.get("comm_patient_detail.selectAddress","请选择家庭住址");
        $scope.DETAIL_ADDRESS_placeholder = KyeeI18nService.get("comm_patient_detail.selectCurrentAdd","请选择现居地址");
        $scope.OCCUPATION_placeholder=KyeeI18nService.get("comm_patient_detail.selectOccupation","请选择职业");
        $scope.expandInfo = {
            marriage : undefined,
            parentName : "",
            occupation : "",
            liveText : "",
            isRegGo : false,
            inputStyle : 2   //默认职业为输入形式   2:输入形式 1：下拉选
        };
        var startDate = new Date();//当前时间

        $scope.yearRange = (startDate.getFullYear() - 18) + '->' + (startDate.getFullYear());
        $scope.authenBoolean = false;
        $scope.isIdNoShow = false; //身份证说明标志
        $scope.authenFlag = "";
        $scope.msg = "";
        $scope.marriageFlag = false;
        $scope.occupationFlag = false;
        $scope.parentNameFlag = false;
        $scope.birthAddressFlag = false;
        $scope.liveAddressFlag = false;
        $scope.haveIdNoRe = true;
        var isReportHosEntry = ($ionicHistory.backView().stateName == "index_hosp");
        var isReportEntry = ($ionicHistory.backView().stateName == "report_multiple");
        var storageCache = CacheServiceBus.getStorageCache();
        var memoryCache = CacheServiceBus.getMemoryCache();
        var second = 120;//倒计时
        var savedValue = {};//组件kyee-area-picker-directive调用的方法onFinashAdrress中的默认值
        var occupationListName=[];//职业名称列表
        CommPatientDetailService.scope = $scope;
        //保持用户原始信息
        var oldPatientInfo = {};
        /**
         * 初始化页面是被调用的第一个方法
         */
        $scope.initialize = function () {
            $scope.branchVerCode = DeploymentConfig.BRANCH_VER_CODE;//分支版本号

            if( !CommPatientDetailService.item){
                var urlInfo = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
                // 从微信公众号直接进入就诊者页面
                if(urlInfo && urlInfo.hospitalID && urlInfo.wx_forward == "comm_patient_detail" ||isReportHosEntry ||isReportEntry){
                    var currentPatient = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                    var current = angular.copy(currentPatient);
                    current.orgphone = current.PHONE; //储存一个手机号来对比手机号是否产生变化
                    current.idnumber = current.ID_NO; //储存一个身份证号来对比手机号是否产生变化
                    current.loginNum = "";         //短信验证码制空
                    CommPatientDetailService.item = current;
                }
            }

            $scope.item = angular.copy(CommPatientDetailService.item);//取得由上一页面带来的参数

            oldPatientInfo.ID_NO = $scope.item.ID_NO;
            oldPatientInfo.OFTEN_NAME = $scope.item.OFTEN_NAME;
            oldPatientInfo.isChanged = false;
            oldPatientInfo.isShowIdCard = false;

            saveVirtualIdNo();             //如果是儿童并且是虚拟身份证的情况下对虚拟身份证做一个COPY
            hiddenIdNoParam();             //隐藏身份证中间位处的特殊
            flagCardView();                //对页面和插卡页面传值做准备
            giveChildFlag();               //判断儿童年龄，对页面绑定的儿童控制字段赋值
            dealWithImage();               //对头像进行处理，如果没有则赋值默认头像
            queryAttestationFlag();        //查询实名认证状态
            queryHospitalParam();          //查询是否选择医院来决定是否发送医院参数的查询请求
            inputDisabledflag();           //查询对输入框做限制的参数
            getAppUserId();                //取得用户的USER_ID赋值给全局变量
            giveAuthenticationParameters();//对实名认证做页面跳转前的参数赋值
            giveAuthenticationBlackFlag(); //实名认证页面跳转回来的判断标志
        };

        /**
        * 监听值（姓名和身份证号）改变事件
        * @param type
        */
        $scope.changeInfo = function(type){
            if(type == 1){
                //姓名改变出发
                if($scope.item.OFTEN_NAME != oldPatientInfo.OFTEN_NAME){
                    oldPatientInfo.isChanged = true;
                }else if($scope.item.OFTEN_NAME == oldPatientInfo.OFTEN_NAME
                    && $scope.item.ID_NO == oldPatientInfo.ID_NO){
                    oldPatientInfo.isChanged = false;
                }
            }else if(type == 2){
                //身份证改变出发
                if($scope.item.ID_NO != oldPatientInfo.ID_NO){
                    oldPatientInfo.isChanged = true;
                }else if($scope.item.OFTEN_NAME == oldPatientInfo.OFTEN_NAME
                    && $scope.item.ID_NO == oldPatientInfo.ID_NO){
                    oldPatientInfo.isChanged = false;
                }
            }else{
                oldPatientInfo.isChanged = false;
            }
        }

        /**
         * 已婚
         */
        $scope.selectMarriaged = function () {
            $scope.expandInfo.marriage = 1;
        };

        /**
         * 未婚
         */
        $scope.selectNoMarriage = function () {
            $scope.expandInfo.marriage = 2;
        };
        // 就诊者现居地数据结构
        $scope.addressModelPresent={
            LIVE_ADDRESS_TEXT:null,
            LIVE_PROVINCE_CODE:null,
            LIVE_PROVINCE_NAME:null,
            LIVE_CITY_CODE:null,
            LIVE_CITY_NAME:null,
            LIVE_PLACE_CODE:null,
            LIVE_PLACE_NAME:null,
            ADDRESS:null };
        // 就诊者出生地数据结构
        $scope.addressModelBirth={
            BIRTH_PROVINCE_CODE:null,
            BIRTH_PROVINCE_NAME:null,
            BIRTH_CITY_CODE:null,
            BIRTH_CITY_NAME:null,
            BIRTH_PLACE_CODE:null,
            BIRTH_PLACE_NAME:null,
            ADDRESS:null};
        // 前台展示患者居住地的默认地址
        if (storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.LOAD_CURRENT_CITY_INFO) == "" || storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.LOAD_CURRENT_CITY_INFO) == undefined
            || storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.LOAD_CURRENT_CITY_INFO) == null){
            $scope.addressModelPresent.ADDRESS = "";
            $scope.addressModelBirth.ADDRESS = "";
            $scope.addressModelPresent.LIVE_PROVINCE_NAME = "";
            $scope.addressModelPresent.LIVE_CITY_NAME = "";
            $scope.addressModelPresent.LIVE_PLACE_NAME = "";
            $scope.addressModelPresent.LIVE_PROVINCE_CODE = "";
            $scope.addressModelPresent.LIVE_CITY_CODE = "";
            $scope.addressModelPresent.LIVE_PLACE_CODE = "";
            $scope.addressModelBirth.BIRTH_PROVINCE_NAME = "";
            $scope.addressModelBirth.BIRTH_CITY_NAME = "";
            $scope.addressModelBirth.BIRTH_PLACE_NAME = "";
            $scope.addressModelBirth.BIRTH_PROVINCE_CODE = "";
            $scope.addressModelBirth.BIRTH_CITY_CODE = "";
            $scope.addressModelBirth.BIRTH_PLACE_CODE = "";
            savedValue = {
                "0" : "",
                "1" : "",
                "2" : ""
            };
        } else {
            $scope.nowPosition = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.LOAD_CURRENT_CITY_INFO);
            $scope.addressModelPresent.ADDRESS = $scope.nowPosition.PROVINCE_NAME + "省-"+$scope.nowPosition.CITY_NAME+"-"+$scope.nowPosition.PLACE_NAME;
            $scope.addressModelBirth.ADDRESS = $scope.addressModelPresent.ADDRESS;
            $scope.addressModelPresent.LIVE_PROVINCE_NAME = $scope.nowPosition.PROVINCE_NAME + "省";
            $scope.addressModelPresent.LIVE_CITY_NAME = $scope.nowPosition.CITY_NAME;
            $scope.addressModelPresent.LIVE_PLACE_NAME = $scope.nowPosition.PLACE_NAME;
            $scope.addressModelPresent.LIVE_PROVINCE_CODE = $scope.nowPosition.PROVINCE_CODE;
            $scope.addressModelPresent.LIVE_CITY_CODE = $scope.nowPosition.CITY_CODE;
            $scope.addressModelPresent.LIVE_PLACE_CODE = $scope.nowPosition.PLACE_CODE;
            $scope.addressModelBirth.BIRTH_PROVINCE_NAME = $scope.nowPosition.PROVINCE_NAME + "省";
            $scope.addressModelBirth.BIRTH_CITY_NAME = $scope.nowPosition.CITY_NAME;
            $scope.addressModelBirth.BIRTH_PLACE_NAME = $scope.nowPosition.PLACE_NAME;
            $scope.addressModelBirth.BIRTH_PROVINCE_CODE = $scope.nowPosition.PROVINCE_CODE;
            $scope.addressModelBirth.BIRTH_CITY_CODE = $scope.nowPosition.CITY_CODE;
            $scope.addressModelBirth.BIRTH_PLACE_CODE = $scope.nowPosition.PLACE_CODE;
            savedValue = {
                "0" : $scope.nowPosition.PROVINCE_CODE,
                "1" : $scope.nowPosition.CITY_CODE,
                "2" : $scope.nowPosition.PLACE_CODE
            };
        }
        //html调用kyee-area-picker-directive组件修改现居地和出生地
        $scope.onFinashAdrress = function(params){
            if(showBirthAddress){
                savedValue = {
                    "0" : params[0].value,
                    "1" : params[1].value,
                    "2" : params[2].value
                };
                $scope.rs = params[0].text + "（" + params[0].value + "）" + params[1].text + "（" + params[1].value + "）" + params[2].text + "（" + params[2].value + "）";
                $scope.addressModelBirth.BIRTH_PROVINCE_CODE=params[0].value;
                $scope.addressModelBirth.BIRTH_PROVINCE_NAME=params[0].text;
                $scope.addressModelBirth.BIRTH_CITY_CODE=params[1].value;
                $scope.addressModelBirth.BIRTH_CITY_NAME=params[1].text;
                $scope.addressModelBirth.BIRTH_PLACE_CODE=params[2].value;
                $scope.addressModelBirth.BIRTH_PLACE_NAME=params[2].text;
                //对港澳台地区进行特殊处理
                if( $scope.addressModelBirth.BIRTH_PROVINCE_CODE=='710000' ||  $scope.addressModelBirth.BIRTH_PROVINCE_CODE=='820000' ||   $scope.addressModelBirth.BIRTH_PROVINCE_CODE=='810000'){
                    $scope.addressModelBirth.ADDRESS= $scope.addressModelBirth.BIRTH_PROVINCE_NAME;
                }else{
                    $scope.addressModelBirth.ADDRESS= $scope.addressModelBirth.BIRTH_PROVINCE_NAME+"-"+ $scope.addressModelBirth.BIRTH_CITY_NAME+"-"+ $scope.addressModelBirth.BIRTH_PLACE_NAME;
                }
            } else {
                savedValue = {
                    "0" : params[0].value,
                    "1" : params[1].value,
                    "2" : params[2].value
                };
                $scope.rs = params[0].text + "（" + params[0].value + "）" + params[1].text + "（" + params[1].value + "）" + params[2].text + "（" + params[2].value + "）";
                $scope.addressModelPresent.LIVE_PROVINCE_CODE=params[0].value;
                $scope.addressModelPresent.LIVE_PROVINCE_NAME=params[0].text;
                $scope.addressModelPresent.LIVE_CITY_CODE=params[1].value;
                $scope.addressModelPresent.LIVE_CITY_NAME=params[1].text;
                $scope.addressModelPresent.LIVE_PLACE_CODE=params[2].value;
                $scope.addressModelPresent.LIVE_PLACE_NAME=params[2].text;
                //对港澳台地区进行特殊处理
                if ( $scope.addressModelPresent.LIVE_PROVINCE_CODE=='710000' || $scope.addressModelPresent.LIVE_PROVINCE_CODE=='820000' ||  $scope.addressModelPresent.LIVE_PROVINCE_CODE=='810000'){
                    $scope.addressModelPresent.ADDRESS= $scope.addressModelPresent.LIVE_PROVINCE_NAME;
                } else {
                    $scope.addressModelPresent.ADDRESS= $scope.addressModelPresent.LIVE_PROVINCE_NAME+"-"+ $scope.addressModelPresent.LIVE_CITY_NAME+"-"+ $scope.addressModelPresent.LIVE_PLACE_NAME;
                }
            }
            return true;
        };
        // 获取当前位置
        $scope.bindDirective = function(params){
            $scope.show = params.show;
        };
        var showBirthAddress = true;//区分是触发出生地址还是居住地，若该值为true，表示触发的是出生地址，否则是居住地。
        $scope.goBirthAddress = function(){
            $scope.userInfo.addressZujian = true;
            $scope.userInfo.dateZujian = false;
            showBirthAddress = true;
            $scope.$apply();
            $scope.show(savedValue);
        };
        $scope.goPresentAddress = function(){
            $scope.userInfo.addressZujian = true;
            $scope.userInfo.dateZujian = false;
            showBirthAddress = false;
            $scope.$apply();
            $scope.show(savedValue);
        };
        /**
         * 地址等信息项校验
         * @constructor
         */
        var VerificationAdress = function (){
            var flag = true;
            if($scope.liveAddressFlag ){
                if($scope.addressModelPresent.LIVE_ADDRESS_TEXT && $scope.addressModelPresent.LIVE_ADDRESS_TEXT.length > 50){
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("comm_patient_detail.fillAddressTip","请填写详细地址并且不要大于50个字。")
                    });
                    flag = false;
                }
            }
            if($scope.occupationFlag){
                if((!$scope.expandInfo.occupation && $scope.expandInfo.inputStyle==2)  || ($scope.expandInfo.occupation && $scope.expandInfo.occupation.length > 50 && $scope.expandInfo.inputStyle==2 )){
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("comm_patient_detail.fillOccupationTip","请填写职业信息并且不要大于50个字。")
                    });
                    flag = false;
                }else if((!$scope.expandInfo.occupation && $scope.expandInfo.inputStyle==1)){
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("comm_patient_detail.pleaseSelectOccu","请选择职业。")
                    });
                    flag = false;
                }
            }
            if($scope.marriageFlag){
                if($scope.expandInfo.marriage != 1 && $scope.expandInfo.marriage != 2){
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("comm_patient_detail.isMarriedTip","请选择是否结婚。")
                    });
                    flag = false;
                }
            }
            if($scope.parentNameFlag ){
                if(!$scope.expandInfo.parentName || ($scope.expandInfo.parentName && $scope.expandInfo.parentName.length > 50)){
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("comm_patient_detail.fillParentsName","请填写家长姓名并且不要大于50个字。")
                    });
                    flag = false;
                }
            }
            return flag;
        };
        /**
         * 提交
         */
        var isToSkip = true;
        $scope.submit = function (result) {
            if(result == undefined){
                isToSkip = true;
            }else{
                isToSkip = false;
            }
            $scope.isShowVerificationCode();//是否显示短信验证码的控制
            if ($scope.item.PHONE && ($scope.item.ID_NO || $scope.saveIdNo)) {
                if (CommPatientDetailService.submit($scope) && VerificationAdress()) {
                    dealWithChildBirthday();  //计算、处理儿童生日
                    dealWithIdNo();           //处理身份证字段传参
                    dealWithData();           //整理处理到后台的参数
                    dealWithReport();         //从检查检验单修改就诊者信息过来处理 KYEEAPPC-4621  zhangming   2015.12.25
                    dealWithReportHos();      //从医院检查检验单修改就诊者信息过来处理
                    determineRoad(function(data){
                        result(data);
                    });          //根据儿童成人和身份证的改变来决定走哪个请求
                }
            } else if (!$scope.item.PHONE) {
                CommPatientDetailService.onClickTo();//手机为空的提示框
            } else {
                CommPatientDetailService.idNoNull();//身份证为空的提示框
            }
        };
        /**
         * 从检查检验单修改就诊者信息过来 KYEEAPPC-4621  zhangming   2015.12.25
         */
        var dealWithReport = function () {
            if (ReportMultipleService.reportUpdatePat) {
                ReportMultipleService.detialFlag = false;
                ReportMultipleService.reportUpdatePat = false;
                if ($ionicHistory.backView()) {
                    $ionicHistory.backView().stateId = 'report_multiple';
                    $ionicHistory.backView().stateName = 'report_multiple'
                }
            }
        };

        /**
         * 从检查检验单修改就诊者信息过来
         */
        var dealWithReportHos = function () {
            ReportMultipleService.isFromCommPatientDetail = true;
            if (isReportHosEntry){
                if ($ionicHistory.backView()) {
                    $ionicHistory.backView().stateId = 'index_hosp';
                    $ionicHistory.backView().stateName = 'index_hosp'
                }
            }
        };
        /**
         * 儿童的生日日期选择器
         */
        $scope.selectChildAge = function () {
            if (!$scope.item.ID_NO) {
                $scope.userInfo.dateZujian = true;
                $scope.userInfo.addressZujian = false;
                $scope.show();
            }
        };

        /**
         * 自动计算年龄，有身份证利用身份证计算年龄
         * @returns {*}
         */
        $scope.birthdayAge = function () {
            if ($scope.item.ID_NO && CommPatientDetailService.idNoCheck($scope.item.ID_NO)) {
                $scope.userInfo.CLINIC_DATE = "";
                return CommPatientDetailService.convertIdNo($scope.item.ID_NO);
            } else if ($scope.userInfo.CLINIC_DATE) {
                return $scope.userInfo.CLINIC_DATE;
            }
        };


        /**
         * 是否显示短信验证
         * @constructor
         */
        $scope.isShowVerificationCode = function () {
            if (
                $scope.item.PHONE != null &&
                $scope.item.PHONE != undefined &&
                $scope.item.orgphone == $scope.item.PHONE
            ) {
                $scope.userInfo.smsInput = false;
                $scope.userInfo.isDisplayed = 1;
            } else {
                $scope.userInfo.smsInput = true;
                $scope.userInfo.isDisplayed = 1;
            }
        };

        /**
         * 身份证识别男女
         * @returns {*}
         */
        $scope.createSex = function () {
            idNotoUpperCase();   //身份证存在字母的大小写过滤
            if ($scope.item.IS_CHILD == 0 || ($scope.saveIdNo && $scope.item.ID_NO)) {
                return judgeChildSex(); //是儿童，存在身份证的情况下判断男女的方法
            } else {
                return judgeSex();      //判断男女的方法
                //return judgeChildSex();
            }
        };


        /**
         * 发送验证码
         */
        $scope.getValiteCode = function () {
            if (CommPatientDetailService.getValiteCode($scope.item.PHONE)) {
                $scope.sendRegCheckCodeActionC();
                $scope.userInfo.phoneNumDisabled = true;
                $scope.userInfo.validateBtnDisabled = true;
                //手机验证码自动回填
                KyeeDeviceMsgService.getMessage(
                    function (validateNum) {
                        $scope.item.loginNum = validateNum;
                        setTimeout(function () {
                            $scope.$apply();
                        }, 1);
                    },
                    function () {

                    }
                );
            }

        };

        /**
         * 是儿童，存在身份证的情况下判断男女的方法
         */
        var judgeChildSex = function () {
            if($scope.item.ID_NO.substring(0, 4) != 'XNSF'){
                var ID_NO = $scope.item.ID_NO;
                var Id = ID_NO.trim();
                var sex = Id.substring(16, 17);
                if (!isNaN(sex)) {
                    if (Id.length > 16) {
                        if (sex % 2 == 0) {
                            $scope.item.SEXc = 2;
                            if (!$scope.item.IMAGE_PATH) {
                                $scope.imgUrl = 'url(resource/images/center/headF.png)';//默认头像路径
                            }
                            return KyeeI18nService.get("update_user.women", "女");
                        } else {
                            $scope.item.SEXc = 1;
                            if (!$scope.item.IMAGE_PATH) {
                                $scope.imgUrl = 'url(resource/images/center/headM.png)';//默认头像路径
                            }
                            return KyeeI18nService.get("update_user.man", "男");
                        }
                    }
                }
            }else{
                if($scope.item.SEX && $scope.item.SEX == 2){
                    $scope.item.SEXc = 2;
                    if (!$scope.item.IMAGE_PATH) {
                        $scope.imgUrl = 'url(resource/images/center/headF.png)';//默认头像路径
                    }
                    return KyeeI18nService.get("update_user.women", "女");
                } else {
                    $scope.item.SEXc = 1;
                    if (!$scope.item.IMAGE_PATH) {
                        $scope.imgUrl = 'url(resource/images/center/headM.png)';//默认头像路径
                    }
                    return KyeeI18nService.get("update_user.man", "男");
                }
            }

        };

        /**
         * 隐藏身份证中间位处的特殊
         */
        var hiddenIdNoParam = function () {
            if ($scope.item.ID_NO) {
                $scope.idNoHidden = ($scope.item.ID_NO.replace(/(.{3}).*(.{4})/, "$1********$2"));
            }
        };

        /**
         * 判断男女的方法
         */
        var judgeSex = function () {
            var ID_NO = $scope.item.ID_NO;
            var Id = ID_NO.trim();
            var sex = Id.substring(16, 17);
            if (!isNaN(sex)) {
                if(ID_NO.length==0){
                    judgeSexByLength();
                }
                if (Id.length > 16) {
                    if (sex % 2 == 0) {
                        $scope.item.SEXc = 2;
                        if (!$scope.item.IMAGE_PATH) {
                            $scope.imgUrl = 'url(resource/images/center/headF.png)';//默认头像路径
                        }
                        return KyeeI18nService.get("update_user.women", "女");
                    } else {
                        $scope.item.SEXc = 1;
                        if (!$scope.item.IMAGE_PATH) {
                            $scope.imgUrl = 'url(resource/images/center/headM.png)';//默认头像路径
                        }
                        return KyeeI18nService.get("update_user.man", "男");
                    }
                }
            }else{
                if ($scope.item.SEX == 1 || $scope.item.SEX == "男") {
                    $scope.item.SEXc = 1;
                    if (!$scope.item.IMAGE_PATH) {
                        $scope.imgUrl = 'url(resource/images/center/headM.png)';//默认头像路径
                    }
                     $scope.item.SEX = KyeeI18nService.get("update_user.man", "男");
                    return KyeeI18nService.get("update_user.man", "男");
                } else {
                    if (!$scope.item.IMAGE_PATH) {
                        $scope.imgUrl = 'url(resource/images/center/headF.png)';//默认头像路径
                    }
                    $scope.item.SEXc = 2;
                     $scope.item.SEX = KyeeI18nService.get("update_user.women", "女");
                    return KyeeI18nService.get("update_user.women", "女");
                }
            }
            return $scope.item.SEX;
        };

        var judgeSexByLength = function () {
            if ($scope.item.SEX == 1 || $scope.item.SEX == "男") {
                $scope.item.SEXc = 1;
                if (!$scope.item.IMAGE_PATH) {
                    $scope.imgUrl = 'url(resource/images/center/headM.png)';//默认头像路径
                }
                $scope.item.SEX = KyeeI18nService.get("update_user.man", "男");
                return KyeeI18nService.get("update_user.man", "男");
            } else {
                if (!$scope.item.IMAGE_PATH) {
                    $scope.imgUrl = 'url(resource/images/center/headF.png)';//默认头像路径
                }
                $scope.item.SEXc = 2;
                $scope.item.SEX = KyeeI18nService.get("update_user.women", "女");
                return KyeeI18nService.get("update_user.women", "女");
            }
            return $scope.item.SEX;
        };

        /**
         * 身份证存在字母的大小写过滤
         */
        var idNotoUpperCase = function () {
            if ($scope.item.ID_NO) {
                $scope.item.ID_NO = $scope.item.ID_NO.toUpperCase();
            }
        };


        /**
         * 对页面和插卡页面传值做准备
         */
        var flagCardView = function () {
            if ($scope.item.DETIAL_LIST && $scope.item.DETIAL_LIST != "null") {
                var detailList = JSON.parse($scope.item.DETIAL_LIST);
                for (var i = 0; i < detailList.length; i++) {
                    if (detailList[i].IS_DEFAULT == 1) {
                        $scope.userInfo.CARD_NO = detailList[i].CARD_NO;
                        $scope.userInfo.CARD_SHOW = detailList[i].CARD_SHOW;
                    }
                }
            }
        };

        /**
         * 判断儿童年龄，对页面绑定的儿童控制字段赋值
         */
        var giveChildFlag = function () {
            if ($scope.item.IS_CHILD == 1) {
                $scope.userInfo.showAge = true;
                if ($scope.item.DATE_OF_BIRTH && $scope.item.DATE_OF_BIRTH != "") {   //判断儿童年龄
                    $scope.userInfo.CLINIC_DATE = $scope.item.DATE_OF_BIRTH.substring(0, 10);
                }
                $scope.userInfo.IS_CHILD = 1;
            } else if ($scope.item.IS_CHILD == 0) {
                $scope.userInfo.IS_CHILD = 0;
            }
        };

        /**
         * 对头像进行处理，如果没有则赋值默认头像
         */
        var dealWithImage = function () {
            if ($scope.item.IMAGE_PATH) {
                $scope.userInfo.IMAGE_PATH = $scope.item.IMAGE_PATH;
                $scope.imgUrl = "url(" + $scope.userInfo.IMAGE_PATH + ")";
            } else {
                $scope.imgUrl = 'url(resource/images/center/headM.png)';
            }
        };

        /**
         * 查询对输入框做限制的参数
         */
        var inputDisabledflag = function () {
            $scope.queryBindCardNo();
        };

        /**
         * 取得用户的USER_ID赋值给全局变量
         */
        var getAppUserId = function () {
            var userInfo = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
            $scope.userId = userInfo.USER_ID;
        };


        /**
         * 对实名认证做页面跳转前的参数赋值
         */
        var giveAuthenticationParameters = function () {
            //实名认证参数赋值
            var idNoCopy = "";
            if (!$scope.item.ID_NO && $scope.saveIdNo) {
                idNoCopy = $scope.saveIdNo;
            } else {
                idNoCopy = $scope.item.ID_NO;
            }
            AuthenticationService.HOSPITAL_SM = {
                OFTEN_NAME: $scope.item.OFTEN_NAME,
                ID_NO: idNoCopy,
                PHONE: $scope.item.PHONE,
                USER_VS_ID: $scope.item.USER_VS_ID,
                FLAG: $scope.item.FLAG
            };
        };

        /**
         * 查询是否选择医院来决定是否发送医院参数的查询请求
         */
        var queryHospitalParam = function () {
            var cacheHid = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
            if (cacheHid != undefined && cacheHid != null && cacheHid != "") {
                if (cacheHid.id != undefined && cacheHid.id != null && cacheHid.id != "") {
                    $scope.hospitalId = cacheHid.id;
                    $scope.queryHospitalParam();
                }
            }
        };

        /**
         * 查询实名认证状态
         */
        var queryAttestationFlag = function () {
            $scope.attestation();
        };

        /**
         * 实名认证页面跳转回来的判断标志
         */
        var giveAuthenticationBlackFlag = function () {
            AuthenticationService.lastClass = "COMM_PATIENT_DETAIL"; //实名认证服务返回标记
        };

        /**
         * 查询已绑定的就诊卡
         */
        $scope.queryBindCardNo = function () {
            CommPatientDetailService.queryBindCardNo(
                $scope.item.USER_VS_ID,
                function (data) {
                    if (data.data && data.data.CHANGE_FLAG && data.data.CHANGE_FLAG == 1) {
                        $scope.userInfo.nameAndIdentityCcardInput = true;
                        $scope.userInfo.isShowIdNo = true;
                        $scope.userInfo.CHANGE_FLAG = data.data.CHANGE_FLAG;
                    }
                    if (data.data && data.data.CARD_NO) {
                        $scope.userInfo.CARD_SHOW = data.data.CARD_SHOW;
                    }
                    //职业选项列表赋值
                    if(data.data && data.data.OCCUPATIONS_LIST && data.data.OCCUPATIONS_LIST.length>0){
                        $scope.expandInfo.inputStyle = 1; //设置职业选项为下拉选
                        var occupationList = data.data.OCCUPATIONS_LIST;
                        for(var i = 0;i< occupationList.length ;i++){
                            var menu={}  //封装职业条目组装成弹出组件适用的对象
                            menu["text"] = occupationList[i].ITEM_NAME;
                            menu["value"] = "\""+ i +"\"";
                            occupationListName.push(menu);
                        }
                        $scope.pickerItems=occupationListName;
                    }
                    //更新就诊者主要数据并且更新缓存主要数据
                    if (data.data && data.data.PATIENT_INFO) {
                        $scope.item.OFTEN_NAME = data.data.PATIENT_INFO.OFTEN_NAME;
                        $scope.item.PATIENT_TYPE = data.data.PATIENT_INFO.PATIENT_TYPE;
                        if(""!=data.data.PATIENT_INFO.ID_NO && undefined != data.data.PATIENT_INFO.ID_NO
                            && data.data.PATIENT_INFO.ID_NO.indexOf("X")<0){
                            $scope.item.ID_NO = data.data.PATIENT_INFO.ID_NO;
                        }else{
                            oldPatientInfo.ID_NO = data.data.PATIENT_INFO.ID_NO;
                        }
                        $scope.item.FLAG = data.data.PATIENT_INFO.FLAG;
                        $scope.item.PHONE = data.data.PATIENT_INFO.PHONE;
                        $scope.item.DATE_OF_BIRTH = data.data.PATIENT_INFO.DATE_OF_BIRTH;
                        //就诊者缓存
                        var currentCustomPatient = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                        currentCustomPatient.OFTEN_NAME = $scope.item.OFTEN_NAME;
                        currentCustomPatient.PATIENT_TYPE = $scope.item.PATIENT_TYPE;
                        //currentCustomPatient.ID_NO = $scope.item.ID_NO;
                        currentCustomPatient.PHONE = $scope.item.PHONE;
                        currentCustomPatient.FLAG = $scope.item.FLAG;
                        currentCustomPatient.DATE_OF_BIRTH = $scope.item.DATE_OF_BIRTH;
                    }

                    experienceViewController();    //对体验就诊者的特殊页面显示控制

                    /**
                     * 必选项
                     */
                    if(data.data.PATIENT_EXT_INFO && data.data.PATIENT_EXT_INFO != 0 && $scope.expandInfo.isRegGo){
                        if(data.data.PATIENT_EXT_INFO.indexOf(1)>-1){
                            $scope.birthAddressFlag = true;
                        }
                        if(data.data.PATIENT_EXT_INFO.indexOf(2)>-1){
                            $scope.liveAddressFlag = true;
                        }
                        if(data.data.PATIENT_EXT_INFO.indexOf(3)>-1){
                            $scope.occupationFlag = true;
                        }
                        if(data.data.PATIENT_EXT_INFO.indexOf(4)>-1){
                            $scope.marriageFlag = true;
                        }
                        if(data.data.PATIENT_EXT_INFO.indexOf(5)>-1){
                            $scope.parentNameFlag = true;
                        }
                    }else{
                        $scope.addressModelPresent.LIVE_PROVINCE_CODE = -1;
                    }
                    /**
                     * 隐藏出生地
                     */
                    if ($scope.item.ID_NO && $scope.item.ID_NO.length>15 && $scope.item.ID_NO.substring(0, 4) != 'XNSF'){
                        $scope.birthAddressFlag = false;
                        $scope.haveIdNoRe = false;
                    }
                    /**
                     * 儿童年龄
                     */
                    if (data.data.CHILDREN_AGE_SHOW) {
                        if ($scope.item.DATE_OF_BIRTH && $scope.item.DATE_OF_BIRTH.length > 4) {
                            var yearsOld = $scope.item.DATE_OF_BIRTH.substring(0, 4);
                            var old = new Date().getFullYear() - yearsOld;
                            if (data.data.CHILDREN_AGE_SHOW == -1 || data.data.CHILDREN_AGE_SHOW < old) {
                                $scope.parentNameFlag = false;
                            }else{
                                $scope.expandInfo.marriage = 2;
                            }
                        }
                    }
                    /**
                     * 已有地址信息
                     */
                    if(data.data.EXPAND_INFO){
                        $scope.expandInfo.marriage = data.data.EXPAND_INFO.MARRIAGE;
                        $scope.expandInfo.occupation = data.data.EXPAND_INFO.OCCUPATION;
                        $scope.expandInfo.parentName = data.data.EXPAND_INFO.PARENT_NAME;
                        $scope.addressModelPresent.LIVE_ADDRESS_TEXT = data.data.EXPAND_INFO.LIVE_ADDRESS_TEXT;
                        if(data.data.EXPAND_INFO.BIRTH_PROVINCE_CODE && data.data.EXPAND_INFO.BIRTH_PROVINCE_NAME){
                            $scope.addressModelBirth.BIRTH_PROVINCE_CODE = data.data.EXPAND_INFO.BIRTH_PROVINCE_CODE;
                            $scope.addressModelBirth.BIRTH_PROVINCE_NAME = data.data.EXPAND_INFO.BIRTH_PROVINCE_NAME;
                            $scope.addressModelBirth.BIRTH_CITY_CODE = "";
                            $scope.addressModelBirth.BIRTH_CITY_NAME = "";
                            $scope.addressModelBirth.BIRTH_PLACE_CODE = "";
                            $scope.addressModelBirth.BIRTH_PLACE_NAME = "";
                        }
                        if(data.data.EXPAND_INFO.BIRTH_CITY_CODE && data.data.EXPAND_INFO.BIRTH_CITY_NAME){
                            $scope.addressModelBirth.BIRTH_CITY_CODE = data.data.EXPAND_INFO.BIRTH_CITY_CODE;
                            $scope.addressModelBirth.BIRTH_CITY_NAME = data.data.EXPAND_INFO.BIRTH_CITY_NAME;
                        }
                        if(data.data.EXPAND_INFO.BIRTH_PLACE_CODE && data.data.EXPAND_INFO.BIRTH_PLACE_NAME){
                            $scope.addressModelBirth.BIRTH_PLACE_CODE = data.data.EXPAND_INFO.BIRTH_PLACE_CODE;
                            $scope.addressModelBirth.BIRTH_PLACE_NAME = data.data.EXPAND_INFO.BIRTH_PLACE_NAME;
                        }
                        if(data.data.EXPAND_INFO.LIVE_PROVINCE_CODE && data.data.EXPAND_INFO.LIVE_PROVINCE_NAME){
                            $scope.addressModelPresent.LIVE_PROVINCE_CODE = data.data.EXPAND_INFO.LIVE_PROVINCE_CODE;
                            $scope.addressModelPresent.LIVE_PROVINCE_NAME = data.data.EXPAND_INFO.LIVE_PROVINCE_NAME;
                            $scope.addressModelPresent.LIVE_CITY_CODE = "";
                            $scope.addressModelPresent.LIVE_CITY_NAME = "";
                            $scope.addressModelPresent.LIVE_PLACE_CODE = "";
                            $scope.addressModelPresent.LIVE_PLACE_NAME = "";
                        }
                        if(data.data.EXPAND_INFO.LIVE_CITY_CODE && data.data.EXPAND_INFO.LIVE_CITY_NAME){
                            $scope.addressModelPresent.LIVE_CITY_CODE = data.data.EXPAND_INFO.LIVE_CITY_CODE;
                            $scope.addressModelPresent.LIVE_CITY_NAME = data.data.EXPAND_INFO.LIVE_CITY_NAME;
                        }
                        if(data.data.EXPAND_INFO.LIVE_PLACE_CODE && data.data.EXPAND_INFO.LIVE_PLACE_NAME){
                            $scope.addressModelPresent.LIVE_PLACE_CODE = data.data.EXPAND_INFO.LIVE_PLACE_CODE;
                            $scope.addressModelPresent.LIVE_PLACE_NAME = data.data.EXPAND_INFO.LIVE_PLACE_NAME;
                        }
                        //对港澳台地区进行特殊处理
                        if( $scope.addressModelBirth.BIRTH_PROVINCE_CODE=='710000' ||  $scope.addressModelBirth.BIRTH_PROVINCE_CODE=='820000' ||   $scope.addressModelBirth.BIRTH_PROVINCE_CODE=='810000'){
                            $scope.addressModelBirth.ADDRESS= $scope.addressModelBirth.BIRTH_PROVINCE_NAME;
                        }else{
                            $scope.addressModelBirth.ADDRESS = $scope.addressModelBirth.BIRTH_PROVINCE_NAME + "-"+$scope.addressModelBirth.BIRTH_CITY_NAME+"-"+$scope.addressModelBirth.BIRTH_PLACE_NAME;
                        }
                        //对港澳台地区进行特殊处理
                        if( $scope.addressModelPresent.LIVE_PROVINCE_CODE=='710000' ||  $scope.addressModelPresent.LIVE_PROVINCE_CODE=='820000' ||   $scope.addressModelPresent.LIVE_PROVINCE_CODE=='810000'){
                            $scope.addressModelPresent.ADDRESS= $scope.addressModelPresent.LIVE_PROVINCE_NAME;
                        }else{
                            $scope.addressModelPresent.ADDRESS = $scope.addressModelPresent.LIVE_PROVINCE_NAME + "-"+$scope.addressModelPresent.LIVE_CITY_NAME+"-"+$scope.addressModelPresent.LIVE_PLACE_NAME;
                        }


                    }
                    if(data.data.CHILDREN_AGE_SHOW == -1 && data.data.PATIENT_EXT_INFO == 0){
                        //此次不保存关于拓展信息的字段
                        $scope.addressModelPresent.LIVE_PROVINCE_CODE = -1;
                    }
                    //作为中转拿了一次参数，查卡的时候也可以拿。（写在回调函数中，确保有值）
                    CommPatientDetailService.lastClassInfro = {
                        current_user_record: {
                            USER_VS_ID: $scope.item.USER_VS_ID,
                            OFTEN_NAME: $scope.item.OFTEN_NAME,
                            PHONE: $scope.item.PHONE,
                            ID_NO: $scope.item.ID_NO
                        },
                        commCardNo: $scope.userInfo.CARD_NO
                    };
                    if ($scope.item.ID_NO == "" && $scope.item.IS_CHILD == 1) {
                        $scope.userInfo.isShowIdNo = false;
                    }
                });
        };


        /**
         * 打开一个模态的方法
         * @param url
         */
        $scope.openModal = function (url) {
            KyeeViewService.openModalFromUrl({
                scope: $scope,
                url: url
            });
        };


        /**
         * 对体验就诊者的特殊页面显示控制
         */
        var experienceViewController = function () {
            if ($scope.item.PATIENT_TYPE == 0) {
                $scope.userInfo.isShowIdNo = true;
                $scope.userInfo.phoneNumDisabled = true;
                $scope.userInfo.experience = false;
                $scope.userInfo.realName = true;
                $scope.userInfo.phoneText = KyeeI18nService.get("comm_patient_detail.noPleaseEnter", "暂无手机号");
                $scope.userInfo.FLAG = "1";
            } else {
                $scope.userInfo.experience = true;
            }
        };

        /**
         * 绑定日期组件方法
         * @param params
         */
        $scope.bind = function (params) {
            $scope.show = params.show;
        };


        /**
         * 选择日期完成
         * @param params
         * @returns {boolean}
         */
        $scope.onFinash = function (params) {
            $scope.userInfo.CLINIC_DATE = params[0].value + "-" + params[1].value + "-" + params[2].value;
            return true;
        };


        /**
         * 倒计时
         * @param timer
         */
        var setBtnState = function (timer) {
            try {
                if (second != -1) {
                    $scope.userInfo.phoneNumDisabled = true;
                    $scope.userInfo.validateBtnDisabled = true;
                    $scope.userInfo.validateMsgText =
                        KyeeI18nService.get("update_user.surplus", "剩余")
                        + second +
                        KyeeI18nService.get("update_user.seconds", "秒");
                } else {
                    //个人中心主页开发（APK）  By  张家豪  KYEEAPPC-4404
                    $scope.userInfo.phoneNumDisabled = false;
                    $scope.userInfo.validateBtnDisabled = false;
                    $scope.userInfo.validateMsgText = KyeeI18nService.get("update_user.validateMsgText", "获取验证码");
                    //关闭定时器
                    KyeeUtilsService.cancelInterval(timer);
                }
            } catch (e) {
                //关闭定时器
                KyeeUtilsService.cancelInterval(timer);
            }
        };

        /**
         * 发送短信验证码的请求
         */
        var timer;
        $scope.sendRegCheckCodeActionC = function () {
            CommPatientDetailService.sendRegCheckCodeActionC(
                $scope.hospitalId,
                $scope.item.PHONE,
                $scope.item.OFTEN_NAME,
                function (data) {
                    // 将短信验证码倒计时改为ionic自带的定时器   By  张家豪  KYEEAPPTEST-2890
                    //按钮冻结时间为120秒
                    if(data){
                        if(data.data.SECURITY_CODE=='007'){
                            second = data.data.secondsRange;
                        }
                        else {
                            second =120;
                        }
                    }
                    setBtnState();
                    $scope.userInfo.validateBtnDisabled = true;
                    $scope.userInfo.phoneNumDisabled = true;
                     timer = KyeeUtilsService.interval({
                        time: 1000,
                        action: function () {
                            second--;
                            setBtnState(timer);
                        }
                    });
                }
            );
        };


        /**
         * 提交修改就诊者请求
         */
        $scope.updateCustomPatient = function (result) {
            CommPatientDetailService.updateCustomPatient(
                $scope.post,
                $scope.hospitalId,
                $scope.address,
                function (data) {
                    //将身份证置为最新的身份证
                    $scope.item.idnumber = $scope.realIdNo;

                    //begin 实名认证页面跳转   By  张家豪  KYEEAPPC-2861

                    if (data.data.needAuth) {
                        $scope.authenBoolean = data.data.needAuth;
                        $scope.authenFlag = data.data.flag;
                        $scope.msg = data.data.msg;
                        $scope.item.FLAG = data.data.flag;
                        AuthenticationService.HOSPITAL_SM = {

                            OFTEN_NAME: $scope.item.OFTEN_NAME,
                            ID_NO: $scope.realIdNo,
                            PHONE: $scope.item.PHONE,
                            USER_VS_ID: $scope.item.USER_VS_ID,// 【个人中心】实名认证增加传入后台参数  By  张家豪  KYEEAPPC-3404
                            FLAG: $scope.authenFlag

                        };
                    }

                    if ($scope.item.IS_SELECTED != undefined && $scope.item.IS_SELECTED != null && $scope.item.IS_SELECTED == 1) {
                        //就诊者缓存
                        var currentCustomPatient = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                        //用户缓存
                        var userInfo = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CARD_INFO);
                        LoginService.setPatientName($scope.item.OFTEN_NAME);
                        if (currentCustomPatient != undefined && currentCustomPatient != null && currentCustomPatient != "") {
                            currentCustomPatient.OFTEN_NAME = $scope.item.OFTEN_NAME;
                            currentCustomPatient.SEX = $scope.item.SEXc;
                            currentCustomPatient.ID_NO = $scope.realIdNo;
                            currentCustomPatient.PHONE = $scope.item.PHONE;
                        }
                        if (userInfo != undefined && userInfo != null && userInfo != "") {
                            userInfo.ID_NO = $scope.realIdNo;
                            userInfo.PATIENT_NAME = $scope.item.OFTEN_NAME;
                            userInfo.PHONE = $scope.item.PHONE;
                        }
//                        CommPatientDetailService.CustomPatientSms(data.message);
                        if ($scope.item.IS_SELECTED != undefined && $scope.item.IS_SELECTED != null && $scope.item.IS_SELECTED == 1) {
                            //就诊者缓存
                            var currentCustomPatient = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                            //就诊卡缓存
                            var card = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CARD_INFO);
                            LoginService.setPatientName($scope.item.OFTEN_NAME);
                            var IS_CHILD = $scope.userInfo.IS_CHILD;
                            var BIRTHDAY_DATE = $scope.userInfo.BIRTHDAY;
                            var childBirthday = $scope.userInfo.CLINIC_DATE;
                            if (BIRTHDAY_DATE && BIRTHDAY_DATE != "") {

                            } else if (IS_CHILD == 1) {
                                BIRTHDAY_DATE = childBirthday;
                            } else {
                                BIRTHDAY_DATE = KyeeUtilsService.DateUtils.getDate("YYYY-MM-DD"); //什么都没有的情况下返回当前日期
                            }
                            if (currentCustomPatient != undefined && currentCustomPatient != null && currentCustomPatient != "") {
                                currentCustomPatient.OFTEN_NAME = $scope.item.OFTEN_NAME;
                                currentCustomPatient.SEX = $scope.item.SEXc;
                                currentCustomPatient.ID_NO = $scope.realIdNo;
                                currentCustomPatient.PHONE = $scope.item.PHONE;
                                currentCustomPatient.DATE_OF_BIRTH = BIRTHDAY_DATE;
                            }
                            if (card != undefined && card != null && card != "") {
                                card.ID_NO = $scope.realIdNo;
                                card.PATIENT_NAME = $scope.item.OFTEN_NAME;
                                card.PHONE = $scope.item.PHONE;
                            }
                        }
                    }
                    //上传头像方法
                    if ($scope.imgSrc != null &&
                        $scope.imgSrc != undefined &&
                        $scope.imgSrc != "") {
                        $scope.uploadImage();
                    } else {
                        //begin 实名认证页面跳转   By  张家豪  KYEEAPPC-2861
                        var authenBoolean = $scope.authenBoolean;
                        var authenFlag = $scope.authenFlag;
                        var msg = $scope.msg;
                        CommPatientDetailService.authenBoolean = authenBoolean;
                        CommPatientDetailService.authenFlag = authenFlag;
                        CommPatientDetailService.msg = msg;
                        if (authenBoolean && authenBoolean != "false") {
                            //begin 实名认证消息提示按钮的修改，可统一实名认证消息提示   By  张家豪  KYEEAPPTEST-2786
                            KyeeMessageService.confirm({
                                title: KyeeI18nService.get("update_user.sms", "消息"),
                                content: msg,
                                onSelect: function (select) {
                                    if (select) {
                                        $scope.toRealName(1);
                                    }
                                }
                            });
                            //end 实名认证消息提示按钮的修改，可统一实名认证消息提示   By  张家豪  KYEEAPPTEST-2786
                        } else {
                            if(oldPatientInfo.isChanged && !isToSkip){
                                KyeeMessageService.broadcast({
                                    content: data.message
                                });
                            }else{
                                CommPatientDetailService.CustomPatientSms(data.message);
                            }
                        }
                    }
                    result(data);
                });
        };

        /**
         * 医保卡
         */
        $scope.queryMedicalSecurityCardInfo = function () {
            CommPatientDetailService.queryMedicalSecurityCardInfo(
                $scope.hospitalId,
                $scope.item.USER_VS_ID,
                $scope.item.OFTEN_NAME,
                $scope.item.ID_NO,
                function (data) {
                    if (data.success) {
                        $scope.item.STATUS = data.data.STATUS;
                        if (data.data.STATUS == '0003') {
                            $scope.userInfo.healthCard = KyeeI18nService.get("update_user.noBing", "未绑定");
                            $scope.userInfo.clickHealth = false;
                        } else if (data.data.STATUS == '0002') {
                            $scope.userInfo.healthCard = KyeeI18nService.get("update_user.nowBing", "绑定中");
                            $scope.userInfo.clickHealth = false;
                        } else if (data.data.STATUS == '0001') {
                            $scope.userInfo.healthCard = KyeeI18nService.get("update_user.binged", "已绑定");
                            $scope.userInfo.clickHealth = true;
                            $scope.item.insuredCard = data.data.MEDICAL_SECURITY_CARD_NO;
                        } else if (data.data.STATUS == '0000') {
                            $scope.userInfo.healthCard = KyeeI18nService.get("update_user.bingFalse", "绑定失败");
                            $scope.userInfo.clickHealth = false;
                            $scope.userInfo.bindFail = true;
                            $scope.item.ERROR_MSG = data.data.ERROR_MSG;
                        }
                    }
                }
            );
        };

        /**
         * 就诊卡
         */
        $scope.toSelectCard = function () {
            if ($scope.item.ID_NO != null
                && $scope.item.ID_NO != undefined
                && $scope.item.OFTEN_NAME != null
                && $scope.item.OFTEN_NAME != undefined) {
                if ($scope.item.PHONE != null && $scope.item.PHONE != undefined) {
                    $scope.isShowVerificationCode();//是否显示短信验证码的控制
                    if (CommPatientDetailService.submit($scope)) {

                        PatientCardService.selectUserInfo = $scope.item;
                        $state.go("patient_card_select");
                    }
                } else {
                    CommPatientDetailService.phoneIsNull();
                }
            } else {
                CommPatientDetailService.iDisNull();
            }
        };

        /**
         * 身份证说明
         */
        $scope.showOrHideIdNo = function () {
            var msgObj = {
                content:   KyeeI18nService.get("comm_patient_detail.idNoTlk" ,"身份证号码是您在医院信息系统中唯一的独有身份标识信息 ,与就诊卡、病例等关联。")
            }
            KyeeMessageService.message(msgObj)
        };

        /**
         * 认证状态
         * @returns {*}
         */
        $scope.attestation = function () {
            if ($scope.item.FLAG == 0) {
                $scope.userInfo.realName = true;
                $scope.userInfo.nameAndIdentityCcardInput = true;//  正在实名认证不允许修改个人信息和就诊者信息
                $scope.userInfo.isShowIdNo = true;                // 正在实名认证不允许修改个人信息和就诊者信息  By  张家豪  KYEEAPPC-2939
                return KyeeI18nService.get("comm_patient_detail.isBeingProcessed", "正在处理...");

            } else if ($scope.item.FLAG == 1) {
                $scope.userInfo.realName = true;
                $scope.userInfo.nameAndIdentityCcardInput = true;// 实名认证通过后不允许更改个人信息和就诊者信息  By  张家豪  KYEEAPPC-2939
                $scope.userInfo.isShowIdNo = true;                // 实名认证通过后不允许更改个人信息和就诊者信息  By  张家豪  KYEEAPPC-2939
                return KyeeI18nService.get("comm_patient_detail.isBeingOk", "已通过");
            } else if ($scope.item.FLAG == 2) {
                $scope.userInfo.realName = false;
                //保证就诊卡queryBindCardNo方法中对nameAndIdentityCcardInput,isShowIdNo的控制优先
                if(!$scope.userInfo.CHANGE_FLAG){
                    $scope.userInfo.nameAndIdentityCcardInput = false;
                    $scope.userInfo.isShowIdNo = false;
                }
                return KyeeI18nService.get("comm_patient_detail.isBeingFalse", "认证失败");
            } else if ($scope.item.FLAG == 3) {
                $scope.userInfo.realName = false;
                //保证就诊卡queryBindCardNo方法中对nameAndIdentityCcardInput,isShowIdNo的控制优先
                if(!$scope.userInfo.CHANGE_FLAG){
                    $scope.userInfo.nameAndIdentityCcardInput = false;
                    $scope.userInfo.isShowIdNo = false;
                }
                return KyeeI18nService.get("comm_patient_detail.isBeingNoKnow", "未认证");
            }
        };

        /**
         * 实名认证
         */
        $scope.toRealName = function (selectClickType) {
            if(1==selectClickType&&$scope.userInfo.realName == true){
                return;
            }
            $scope.hospitalId = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;
            //实名认证参数赋值
            var idNoCopy = "";
            if (!$scope.item.ID_NO && $scope.saveIdNo) {
                idNoCopy = $scope.saveIdNo;
            } else {
                idNoCopy = $scope.item.ID_NO;
            }
            if(oldPatientInfo.isChanged){
                KyeeMessageService.confirm({
                    content: KyeeI18nService.get("comm_patient_detail.isSave","是否保存变更信息？"),
                    cancelText: KyeeI18nService.get("comm_patient_detail.cancle","取消"),
                    okText: KyeeI18nService.get("comm_patient_detail.ok","确定"),
                    cancelButtonClass:'qy-bg-grey3',
                    onSelect: function (flag) {
                        if (flag){
                            $scope.isShowVerificationCode();//是否显示短信验证码的控制
                            if (CommPatientDetailService.submit($scope)) {
                                $scope.submit(function(data){
                                    oldPatientInfo.isShowIdCard = true;
                                    oldPatientInfo.isChanged = false;
                                    oldPatientInfo.OFTEN_NAME = $scope.item.OFTEN_NAME;
                                    if($scope.item.ID_NO.length>0){
                                        oldPatientInfo.ID_NO = $scope.item.ID_NO;
                                    }
                                    //确认保存更新
                                    AuthenticationService.HOSPITAL_SM = {
                                        OFTEN_NAME: oldPatientInfo.OFTEN_NAME,
                                        ID_NO: oldPatientInfo.ID_NO,
                                        PHONE: $scope.item.PHONE,
                                        USER_VS_ID: $scope.item.USER_VS_ID,// 【个人中心】实名认证增加传入后台参数  By  张家豪  KYEEAPPC-3404
                                        FLAG: $scope.item.FLAG
                                    }
                                    toRealName(selectClickType);
                                });
                            }
                        }
                        else{
                            AuthenticationService.HOSPITAL_SM = {
                                OFTEN_NAME: oldPatientInfo.OFTEN_NAME,
                                ID_NO: oldPatientInfo.ID_NO,
                                PHONE: $scope.item.PHONE,
                                USER_VS_ID: $scope.item.USER_VS_ID,// 【个人中心】实名认证增加传入后台参数  By  张家豪  KYEEAPPC-3404
                                FLAG: $scope.item.FLAG
                            }
                            toRealName(selectClickType);
                        }
                    }
                })
            }else{
                AuthenticationService.HOSPITAL_SM = {
                    OFTEN_NAME: $scope.item.OFTEN_NAME,
                    ID_NO: idNoCopy,
                    PHONE: $scope.item.PHONE,
                    USER_VS_ID: $scope.item.USER_VS_ID,// 【个人中心】实名认证增加传入后台参数  By  张家豪  KYEEAPPC-3404
                    FLAG: $scope.item.FLAG
                }
                toRealName(selectClickType);
            }
        };

        /**
        * 实名认证校验跳转
        */
        var toRealName = function(selectClickType){
            if (($scope.item.ID_NO && $scope.item.OFTEN_NAME) || ($scope.item.IS_CHILD == 1 && !$scope.item.ID_NO)) {
                if ($scope.item.PHONE) {
                    if (selectClickType == 2) {
                        $scope.isShowVerificationCode();//是否显示短信验证码的控制
                        if (CommPatientDetailService.submit($scope)) {
                            AuthenticationService.AUTH_TYPE = 1;
                            AuthenticationService.AUTH_SOURCE = 0;
                            $scope.openModal('modules/business/center/views/authentication/authentication.html');
                        }
                    } else {
                        $scope.isShowVerificationCode();//是否显示短信验证码的控制
                        if (CommPatientDetailService.submit($scope)) {
                            AuthenticationService.AUTH_TYPE = 0;
                            AuthenticationService.AUTH_SOURCE = 0;
                            $scope.openModal('modules/business/center/views/authentication/authentication.html');
                        }
                    }
                } else {
                    CommPatientDetailService.phoneIsNull();
                }
            } else {
                CommPatientDetailService.iDisNull();
            }
        }

        /**
         * 是否显示参数
         */
        $scope.queryHospitalParam = function () {
            var cacheHid = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);//医院缓存
            //判断是否选择医院
            if (cacheHid != undefined && cacheHid != null) {
                $scope.hospitalId = cacheHid.id;
            } else {
                $scope.hospitalId = "";
            }
            var paramName = "idNo_Check,MedicalPay,showCard";//查询后台参数
            CommPatientDetailService.queryHospitalParam(
                paramName,
                $scope.hospitalId,
                function (data) {
                    $scope.idNo_Check = data.data.idNo_Check;
                    $scope.MedicalPay = data.data.MedicalPay;
                    $scope.showCard = data.data.showCard;
                    if ($scope.MedicalPay == "0") {
                        $scope.userInfo.medicalPayc = false;
                    } else if ($scope.MedicalPay == "1") {
                        $scope.userInfo.medicalPayc = true;
                        $scope.queryMedicalSecurityCardInfo();
                    }
                    if ($scope.showCard == "0") {
                        $scope.userInfo.showCard = true;
                        setTimeout(function () {
                            $scope.$apply();
                        }, 1);                    } else if ($scope.showCard == "1") {
                        $scope.userInfo.showCard = false;
                        setTimeout(function () {
                            $scope.$apply();
                        }, 1);                    }
                });
        };


        /**
         * 页面初始化的方法，任何时候进入页面都会被调用
         */
        KyeeListenerRegister.regist({
            focus: "comm_patient_detail",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (params) {
                //初始化此页面
                $scope.initialize();
                if(params.from == "appoint_confirm" || params.from == "regist_confirm"
                    || params.from == "add_clinic_management_new"){
                    $scope.expandInfo.isRegGo = true;
                }
                if("center->MAIN_TAB" == params.from){
                    $scope.showDelete = false;
                }else{
                    $scope.showDelete = true;
                }
            }
        });


        /**
         * 如果是儿童并且是虚拟身份证的情况下对虚拟身份证做一个COPY
         */
        var saveVirtualIdNo = function () {
            if ($scope.item.IS_CHILD == 1 && $scope.item.ID_NO && $scope.item.ID_NO.substring(0, 4) == 'XNSF') {
                $scope.saveIdNo = angular.copy($scope.item.ID_NO);
                $scope.item.ID_NO = "";
            } else {
                $scope.saveIdNo = "";
            }
        };

        /**
         * 整理处理到后台的参数
         */
        var dealWithData = function () {
            $scope.post = JSON.stringify(
                {
                    STATUS: 1,
                    SECURITY_CODE: $scope.item.loginNum,
                    USER_VS_ID: $scope.item.USER_VS_ID,
                    ROLE_CODE: $scope.item.ROLE_CODE,
                    SEX: $scope.item.SEXc,
                    IS_SELECTED: $scope.item.IS_SELECTED,
                    IS_CHILD: $scope.userInfo.IS_CHILD,
                    IS_DEFAULT: $scope.item.IS_DEFAULT,
                    DATE_OF_BIRTH: $scope.userInfo.BIRTHDAY,
                    USER_ID: $scope.item.USER_ID,
                    OFTEN_NAME: $scope.item.OFTEN_NAME,
                    PATIENT_CARD: null,
                    ADDRESS: null,
                    PHONE: $scope.item.PHONE,
                    CARD_NO: null,
                    ID_NO: $scope.realIdNo,
                    FLAG: $scope.item.FLAG,
                    ID_NO_SECERT: $scope.realIdNo

                }
            );
            if(!$scope.birthAddressFlag && !$scope.haveIdNoRe){
                $scope.addressModelBirth.ADDRESS = "";
                $scope.addressModelBirth.BIRTH_PROVINCE_CODE = "";
                $scope.addressModelBirth.BIRTH_PROVINCE_NAME = "";
                $scope.addressModelBirth.BIRTH_CITY_CODE = "";
                $scope.addressModelBirth.BIRTH_CITY_NAME = "";
                $scope.addressModelBirth.BIRTH_PLACE_CODE = "";
                $scope.addressModelBirth.BIRTH_PLACE_NAME = "";
            }
            $scope.address = JSON.stringify(
                {
                    "USER_VS_ID": $scope.item.USER_VS_ID,
                    "PRESENT_ADDRESS": $scope.addressModelPresent.ADDRESS,//就诊者现居地址
                    "LIVE_ADDRESS_TEXT": $scope.addressModelPresent.LIVE_ADDRESS_TEXT,//就诊者现居详细地址
                    "LIVE_PROVINCE_CODE": $scope.addressModelPresent.LIVE_PROVINCE_CODE,//就诊者现居地省份行政编码
                    "LIVE_PROVINCE_NAME": $scope.addressModelPresent.LIVE_PROVINCE_NAME,//就诊者现居地省份名称
                    "LIVE_PLACE_CODE": $scope.addressModelPresent.LIVE_PLACE_CODE,//就诊者现居地城市行政编码
                    "LIVE_PLACE_NAME": $scope.addressModelPresent.LIVE_PLACE_NAME,//就诊者现居地城市名称
                    "LIVE_CITY_CODE": $scope.addressModelPresent.LIVE_CITY_CODE,//就诊者现居地地区行政编码
                    "LIVE_CITY_NAME": $scope.addressModelPresent.LIVE_CITY_NAME,//就诊者现居地地区名称
                    "BIRTH_ADDRESS": $scope.addressModelBirth.ADDRESS,//就诊者出生地地址
                    "BIRTH_PROVINCE_CODE": $scope.addressModelBirth.BIRTH_PROVINCE_CODE,//就诊者出生地省份行政编码
                    "BIRTH_PROVINCE_NAME": $scope.addressModelBirth.BIRTH_PROVINCE_NAME,//就诊者现居地省份名称
                    "BIRTH_CITY_CODE": $scope.addressModelBirth.BIRTH_CITY_CODE,//就诊者出生地城市行政编码
                    "BIRTH_CITY_NAME": $scope.addressModelBirth.BIRTH_CITY_NAME,//就诊者出生地城市名称
                    "BIRTH_PLACE_CODE": $scope.addressModelBirth.BIRTH_PLACE_CODE,//就诊者出生地地区行政编码
                    "BIRTH_PLACE_NAME": $scope.addressModelBirth.BIRTH_PLACE_NAME,//就诊者出生地地区名称
                    "MARRIAGE":$scope.expandInfo.marriage,
                    "OCCUPATION":$scope.expandInfo.occupation,
                    "PARENT_NAME":$scope.expandInfo.parentName
                }
            );
        };

        /**
         * 计算、处理儿童生日
         */
        var dealWithChildBirthday = function () {
            $scope.userInfo.BIRTHDAY = CommPatientDetailService.convertIdNo($scope.item.ID_NO);
            $scope.hospitalId = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;
            if ($scope.userInfo.BIRTHDAY && $scope.userInfo.BIRTHDAY != "") {

            } else if ($scope.userInfo.IS_CHILD == 1) {
                $scope.userInfo.BIRTHDAY = $scope.userInfo.CLINIC_DATE;
            } else {
                $scope.userInfo.BIRTHDAY = KyeeUtilsService.DateUtils.getDate("YYYY-MM-DD"); //什么都没有的情况下返回当前日期
            }
        };

        /**
         * 处理身份证字段传参
         */
        var dealWithIdNo = function () {
            if ($scope.saveIdNo && $scope.userInfo.IS_CHILD == 1 && !$scope.item.ID_NO) {
                $scope.realIdNo = $scope.saveIdNo;
            } else {
                $scope.realIdNo = $scope.item.ID_NO;
            }
        };

        /**
         * 根据儿童成人和身份证的改变来决定走哪个请求
         */
        var determineRoad = function (result) {
            if ($scope.userInfo.BIRTHDAY || $scope.userInfo.BIRTHDAY == "") {
                if ($scope.userInfo.BIRTHDAY.length > 0) {
                    $scope.updateCustomPatient(function(data){
                        result(data);
                    });
                } else if ($scope.userInfo.IS_CHILD == 1) {
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("comm_patient_detail.pleaseSelectDate", "请选择出生日期！")
                    });
                }
            } else {
                $scope.updateCustomPatient(function(data){
                    result(data);
                });
            }
        };

        /**
         * 点击上传头像
         */
        $scope.clickUpload = function () {
            if(DeploymentConfig.BRANCH_VER_CODE=='03'){return;}
            if(isWeiXin())
            {
                KyeeMessageService.confirm({
                    content: KyeeI18nService.get("comm_patient_detail.wxPhotoTips","微信公众号暂不支持图片裁剪，下载趣医APP，给您更优质的业务体验"),
                    cancelText: KyeeI18nService.get("comm_patient_detail.keepUp","继续上传"),
                    okText: KyeeI18nService.get("comm_patient_detail.goDownload","去下载"),
                    cancelButtonClass:'qy-bg-grey3',
                    tapBgToClose:true,
                    onSelect: function (flag) {
                        if(flag == undefined){
                            return;
                        }else{
                            if (!flag) {
                                var url = $location.$$absUrl;
                                $scope.idCardPic = "";
                                AuthenticationService.chooseImage(function(idCardPic){
                                    $scope.imgSrc = idCardPic[0];  // 上传图片

                                    AuthenticationService.getLocalImgData(idCardPic[0], function(localData){
                                        $scope.imgUrl = 'url(' + localData + ')';  // 图片预览
                                        $scope.item.IMAGE_PATH = 'url(' + localData + ')';
                                        setTimeout(function () {
                                            $scope.$apply();
                                        }, 1);                                    });

                                },url.substring(0,url.indexOf("#")));
                            } else {
                                window.location.href = "http://www.quyiyuan.com/mobileweb/mobiledownload.html";
                            }
                        }
                    }
                });
            }
            else{
                KyeeMessageService.actionsheet({
                    title: KyeeI18nService.get("authentication.pleaseUploadPhotos", "请上传照片"),
                    buttons: [
                        {
                            text: KyeeI18nService.get("authentication.fromPhotos", "从相册选择")
                        }
                    ],
                    onClick: function (index) {
                        if (index == 0) {
                            $scope.goToAlbum();
                        }
                    },
                    cancelButton: true
                });
            }
        };

        /**
         * 点击拍一张
         */
        $scope.goToCamera = function () {
            if ($scope.platform == "Android") {
                var options = {
                    quality: 40,
                    destinationType: Camera.DestinationType.FILE_URI,
                    targetWidth: 900,  //设置图片宽度
                    targetHeight: 900, //设置图片高度
                    allowEdit: true,
                    encodingType: Camera.EncodingType.JPEG,
                    sourceType: Camera.PictureSourceType.CAMERA
                };
                KyeeCameraService.getPicture(
                    // 调用成功时返回的值
                    function (retVal) {
                        $scope.imgSrc = retVal;
                        $scope.imgUrl = 'url(' + retVal + ')';
                        $scope.item.IMAGE_PATH = 'url(' + retVal + ')';
                        setTimeout(function () {
                            $scope.$apply();
                        }, 1);                    },
                    // 调用失败时返回的值
                    function (retVal) {
                    }, options);
            } else if ($scope.platform == "iOS") {
                var options = {
                    quality: 40,
                    destinationType: Camera.DestinationType.FILE_URI,
                    targetWidth: 900,  //设置图片宽度
                    targetHeight: 900, //设置图片高度
                    saveToPhotoAlbum: true,
                    allowEdit: true,
                    sourceType: Camera.PictureSourceType.CAMERA
                };
                KyeeCameraService.getPicture(
                    // 调用成功时返回的值
                    function (retVal) {
                        $scope.imgSrc = retVal;
                        $scope.imgUrl = 'url(' + retVal + ')';
                        $scope.item.IMAGE_PATH = 'url(' + retVal + ')';
                        setTimeout(function () {
                            $scope.$apply();
                        }, 1);                    },
                    // 调用失败时返回的值
                    function (retVal) {
                    }, options);
            }
        };

        /**
         *  判断当前浏览器是否是微信浏览器
         * @returns {boolean}
         */
        function isWeiXin(){
            var ua = window.navigator.userAgent.toLowerCase();
            if(ua.match(/MicroMessenger/i) == 'micromessenger'){
                $scope.isAppPage = false;
                return true;
            }else{
                return false;
            }
        }

        /**
         * 点击从相册选择照片
         */
        $scope.goToAlbum = function () {
             if ($scope.platform == "Android") {
                // android设备选取相册
                var options = {
                    quality: 40,
                    destinationType: Camera.DestinationType.FILE_URI,
                    targetWidth: 900,  //设置图片宽度
                    targetHeight: 900, //设置图片高度
                    allowEdit: false,
                    encodingType: Camera.EncodingType.JPEG,
                    sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM
                };
                KyeeCameraService.getPicture(
                    // 调用成功时返回的值
                    function (retVal) {
                        $scope.imgSrc = retVal;
                        $scope.imgUrl = 'url(' + retVal + ')';
                        $scope.item.IMAGE_PATH = 'url(' + retVal + ')';
                        setTimeout(function () {
                            $scope.$apply();
                        }, 1);                    
                    },
                    // 调用失败时返回的值
                    function (retVal) {
                    }, options);
            } else if ($scope.platform == "iOS") {
                var options = {
                    quality: 40,
                    destinationType: Camera.DestinationType.FILE_URI,
                    targetWidth: 900, //设置图片宽度
                    targetHeight: 900,//设置图片高度
                    saveToPhotoAlbum: true,
                    allowEdit: true,
                    sourceType: Camera.PictureSourceType.PHOTOLIBRARY
                };
                KyeeCameraService.getPicture(
                    // 调用成功时返回的值
                    function (retVal) {
                        $scope.imgSrc = retVal;
                        $scope.imgUrl = 'url(' + retVal + ')';
                        $scope.item.IMAGE_PATH = 'url(' + retVal + ')';
                        setTimeout(function () {
                            $scope.$apply();
                        }, 1);                   
                     },
                    // 调用失败时返回的值
                    function (retVal) {
                    }, options);
            }
        };

        /**
         * 获取当前设备平台 iOS or android
         */
        KyeeDeviceInfoService.getInfo(function (info) {
            $scope.platform = info.platform;
            //alert($scope.platform);
        }, function () {
        });

        /**
         * 上传头像的方法
         */
        $scope.uploadImage = function () {
            if (CommPatientDetailService.item.USER_VS_ID && $scope.imgSrc && $scope.imgSrc != "") {
                if(isWeiXin()){
                    CommPatientDetailService.uploadImageToWxServer(CommPatientDetailService.item.USER_VS_ID, $scope.imgSrc, $scope.item.IS_SELECTED);
                }
                else
                {
                    CommPatientDetailService.uploadImage(CommPatientDetailService.item.USER_VS_ID, $scope.imgSrc, $scope.item.IS_SELECTED);
                }
            }
        };

        /**
         * 去意见反馈
         */
        $scope.goFeedback = function () {
            $state.go("aboutquyi_feedback");
            //统计意见反馈各入口点击数量  by 高萌  KYEEAPPC-5534
            OperationMonitor.record("aboutquyi_feedback", "completeCommPatientInfo");
        };

        /**
         * 拨打客服电话
         */
        $scope.callCustomerService = function () {
            KyeeMessageService.confirm({
                title:  KyeeI18nService.get("login.hint", "提示"),
                content:  KyeeI18nService.get("regist.isCall","拨打客服电话？"),
                onSelect: function (flag) {
                    if (flag) {
                        //拨打客服电话
                        KyeePhoneService.callOnly("4000801010");
                    }
                }
            });
        };
        /**
         * 实名限制方法
         */
        $scope.toBindinsuredCard = function () {
            var user = CommPatientDetailService.lastClassInfro.current_user_record;
            if (user.ID_NO == null && user.ID_NO == undefined && user.ID_NO == "") {
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("update_user.pleaseInformationAndSubmit", "请先完善账号实名信息并提交！")
                });
                return;
            }
            //数据传入下个页面
            var bindModel = {
                USER_VS_ID: user.USER_VS_ID,
                ID_NO: user.ID_NO,
                OFTEN_NAME: user.OFTEN_NAME
            };

            //根据医保状态做不同处理
            if ($scope.item.STATUS == undefined || $scope.item.STATUS == '0003') {
                BindMSCardService.bindModel = bindModel;
                $state.go('bindMSCard');
            } else if ($scope.item.STATUS == '0002') {
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("update_user.yourHealthBang", "您的医保卡正在绑定中！")
                });
            } else if ($scope.item.STATUS == '0001') {
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("update_user.yourHealthBangOk", "您的医保卡已绑定成功！")
                });
            } else if ($scope.item.STATUS == '0000') {
                if ($scope.item.ERROR_MSG == undefined || $scope.item.ERROR_MSG == '') {
                    KyeeMessageService.confirm({
                        title: KyeeI18nService.get("update_user.sms", "消息"),
                        content: KyeeI18nService.get("update_user.yourHealthBangFalse", "您的医保卡绑定失败，是否重新绑定？"),
                        onSelect: function (confirm) {
                            if (confirm) {
                                BindMSCardService.bindModel = bindModel;
                                $state.go('bindMSCard');
                            }
                        }
                    });
                } else {
                    KyeeMessageService.confirm({
                        title: KyeeI18nService.get("update_user.sms", "消息"),
                        content: KyeeI18nService.get("update_user.yourHealthBangFalseRuse", "您的医保卡绑定失败，失败原因：<br>")
                        + $scope.item.ERROR_MSG +
                        KyeeI18nService.get("update_user.yourHealthBangRuseFalse", "。<br>是否重新绑定？"),
                        onSelect: function (confirm) {
                            if (confirm) {
                                BindMSCardService.bindModel = bindModel;
                                $state.go('bindMSCard');
                            }
                        }
                    });
                }
            }
        };
        /**
         * 绑定选择职业组件
         */
        $scope.bindOccupation = function (params) {
            $scope.showPicker = params.show;
        };

        /**
         *选择职业
         */
        $scope.selectItem = function (params){
            $scope.expandInfo.occupation = params.item.text;//展示选择的职业
            $scope.OCCUPATION_placeholder = params.item.text;
        };
        /**
         * 点击选择职业事件，展示职业列表
         */
        $scope.selectOccupations = function(){
            $scope.title=KyeeI18nService.get("comm_patient_detail.occupationItem","职业");
            $scope.showPicker();
        };
        /**
         * 删除就诊者
         */
        $scope.deletePatient = function () {
            $scope.item = CommPatientDetailService.item;
//            saveVirtualIdNo();
            var patientInfo = {
                STATUS: 0,
                USER_VS_ID: $scope.item.USER_VS_ID,
                IS_CHILD: $scope.item.IS_CHILD,
                USER_ID: $scope.item.USER_ID,
                OFTEN_NAME: $scope.item.OFTEN_NAME,
                PHONE: $scope.item.PHONE,
                ID_NO: $scope.item.ID_NO,
                FLAG: $scope.item.FLAG
            };

            KyeeMessageService.confirm({
                title: KyeeI18nService.get("update_user.sms", "消息"),
                content: KyeeI18nService.get("custom_patient.sureToDeleteIt", "该就诊者的数据将全部丢失，您是否确认删除？"),
                onSelect: function (flag) {
                    if (flag) {
                        AddPatientInfoService.deleteCustomPatient(JSON.stringify(patientInfo), function (data) {
                            if (data.message) {
                                KyeeMessageService.message({
                                    title : KyeeI18nService.get("add_patient_info.msg","消息"),
                                    content : data.message,
                                    okText :  KyeeI18nService.get("add_patient_info.iKnow","我知道了"),
                                    onOk: function () {
                                        if (data.success) {
                                            $state.go("custom_patient");
                                        }
                                    }
                                });
                            }
                        });

                    }
                }
            });
        }


        /**
         * 页面回退监听
         */
        $scope.backToFrom = function () {
            $ionicHistory.goBack(-1);
        };
        /**
         * 监听物理返回键保证和页面返回键一样
         */
        KyeeListenerRegister.regist({
            focus: "comm_patient_detail",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.backToFrom();
            }
        });

        KyeeListenerRegister.regist({
            focus: "comm_patient_detail",
            when:  KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_LEAVE,
            action: function (params) {
                $interval.cancel(timer);
            }
        });
        /**
         * 我的二维码调用事件
         */
        var getQyCode = function(){
            var hospitalInfo = storageCache.get("hospitalInfo");
            var hospitalId=hospitalInfo.id;
            var qrCodeType;
            //获取医院二维码参数
            QrCodeService.getQrCode(hospitalId,function(retVal){
                if (retVal.success) {
                    if (retVal.data && retVal.data.qrCodeType && retVal.data.qrCodeType != '') {
                        qrCodeType = retVal.data.qrCodeType;
                    } else {
                        qrCodeType = "CARD_NO";
                    }

                    var currentCardInfo = CacheServiceBus.getMemoryCache().get('currentCardInfo');
                    //去除就诊卡过滤器 二维码内容包含就诊卡或就诊者编号&&就诊者没有就诊卡
                    if((qrCodeType.indexOf("CARD_NO")!=-1||qrCodeType.indexOf("PATIENT_ID")!=-1)
                        &&(!currentCardInfo || !currentCardInfo.USER_VS_ID)){
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
                    }else{
                        QrCodeService.qrCodeType=qrCodeType;
                        $state.go("my_qr_code");
                    }
                }
            });
        };
        /**
         * 我的二维码点击事件
         */
        $scope.myQRCode = function(){
            FilterChainInvoker.invokeChain({
                id: "USER_LOGIN_AND_SELECT_HOSPITAL_AND_SELECT_CUSTOM_PATIENT_FILTER",
                token: "center->MAIN_TAB",
                onFinash: function () {
                    getQyCode();
                }
            });
        };

    })
    .build();