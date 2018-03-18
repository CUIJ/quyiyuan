/**
 * 产品名称：quyiyuan
 * 创建者：刘健
 * 创建时间： 2015/5/5
 * 创建原因：确认预约控制器
 * 修改者：
 * 修改原因：
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.callforhelp.callAmbulance.controller")
    .require([
        "kyee.framework.service.view",
        "kyee.quyiyuan.callforhelp.callAmbulance.service",
        "kyee.framework.service.message",
        "kyee.quyiyuan.center.service.QueryHisCardService",
        "kyee.quyiyuan.login.rsautil.service",
        "kyee.quyiyuan.address_manage.controller",
        "kyee.quyiyuan.appointment.create_card.controller",
        "kyee.quyiyuan.appoint.sendAddressController.controller",
    ])
    .type("controller")
    .name("CallAmbulanceController")
    .params(["$scope", "$state","$ionicHistory", "KyeeViewService",  "CallAmbulanceService",
        "CacheServiceBus", "KyeeMessageService", "QueryHisCardService", "CustomPatientService",
        "KyeeListenerRegister", "HospitalService", "RsaUtilService", "AuthenticationService",
        "KyeePhoneService","$ionicScrollDelegate","KyeeI18nService","CenterUtilService","KyeeUtilsService"])
    .action(function ($scope, $state,$ionicHistory, KyeeViewService, CallAmbulanceService,
                      CacheServiceBus, KyeeMessageService, QueryHisCardService, CustomPatientService,
                      KyeeListenerRegister, HospitalService, RsaUtilService, AuthenticationService,
                      KyeePhoneService,$ionicScrollDelegate,KyeeI18nService,CenterUtilService,KyeeUtilsService) {

        //监听物理返回键
        KyeeListenerRegister.regist({
            focus: "callAmbulance",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $state.go("home->MAIN_TAB");
            }
        });
        var patientInfoList = CallAmbulanceService.patientInfoList;
        var cache = CacheServiceBus.getMemoryCache();
        var userId = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID;

        $scope.nowPosition = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.LOAD_CURRENT_CITY_INFO);

        $scope.bind = function (params) {
            $scope.showPicker = params.show;
            $scope.hidePicker = params.cancel;;
        };
        $scope.goBack=function(){
            $state.go("home->MAIN_TAB");
        };
        //页面添加监听事件
        KyeeListenerRegister.regist({
            focus: "callAmbulance",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (params) {
                KyeeMessageService.loading({mask: true});
                CallAmbulanceService.getUserLocationInfo(function (data) {
                    $scope.address = data.address;
                    $scope.latitude = data.latitude;
                    $scope.longtitude = data.longtitude;
                    $scope.placeCode = $scope.nowPosition.PLACE_CODE;
                    $scope.cityCode = $scope.nowPosition.CITY_CODE;
                    if($scope.placeCode == undefined || $scope.placeCode == ''|| $scope.placeCode == null){
                        $scope.placeCode = $scope.cityCode;
                    }
                    setTimeout(function () {
                        $scope.$apply();
                    }, 1);
                    KyeeMessageService.hideLoading();//取消遮罩
                    CallAmbulanceService.queryHelpPhone($scope.cityCode,$scope.placeCode,function(data){
                        $scope.helpPhoneNum = data;
                        if($scope.helpPhoneNum == null || $scope.helpPhoneNum == '' || $scope.helpPhoneNum == undefined){
                            $scope.helpPhoneNum = '120';
                        }
                    })
                });

            }
        });



        $scope.selectItem = function (params) {
            $scope.scUserId = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.USER_ACT_INFO).scUserId;
            $scope.patientInfo.OFTEN_NAME = params.item.text;//展示值
            $scope.patientInfo.USER_VS_ID = params.item.value;//唯一属性
            $scope.patientInfo.PHONE = params.item.value1;//第二属性
            $scope.patientInfo.ID_NO = params.item.value2;//第二属性
            $scope.patientInfo.SEX = params.item.value3;//第二属性
            $scope.patientInfo.DATE_OF_BIRTH = params.item.value4;//第二属性
            KyeeMessageService.confirm({
                title:  KyeeI18nService.get("login.hint", "拨打急救电话"),
                content:  KyeeI18nService.get("regist.isCall","呼叫急救中心，请点击确定拨打电话。"),
                onSelect: function (flag) {
                    if (flag) {
                        //拨打客服电话
                        var userVsId = $scope.patientInfo.USER_VS_ID;
                        var name = $scope.patientInfo.OFTEN_NAME;
                        var phone = $scope.patientInfo.PHONE;
                        var idNo = $scope.patientInfo.ID_NO;
                        var sex = $scope.patientInfo.SEX;
                        var dateOfBirth = KyeeUtilsService.DateUtils.formatFromDate($scope.patientInfo.DATE_OF_BIRTH,'YYYY-MM-DD');
                        var Age = CenterUtilService.ageBydateOfBirth(dateOfBirth);
                        if(Age.indexOf("个月")!=-1){
                            var age = 0;
                        }else{
                            var age  = Age.substring(0,Age.indexOf("岁"));
                        }

                        var params = {
                            "latitude" : $scope.latitude,        //患者纬度
                            "longitude" : $scope.longtitude,   //患者经度
                            "placeCode" : $scope.placeCode,     //区域编码
                            "userId" : userId,
                            "userVsId" : userVsId,
                            "scUserId" : $scope.scUserId,       //病友圈患者用户id
                            "patientName" : name,
                            "age" : age,                       //年龄
                            "dateOfBirth" : dateOfBirth,      //生日
                            "sex" : sex,                       //性别
                            "idNo" : idNo,                     //身份证号
                            "phoneNo" : phone                  //手机号
                        }

                        CallAmbulanceService.sendInfoToSH(params, function(data)
                        {
                            if (!window.device) {//网页版
                                window.location.href = "tel:" + $scope.helpPhoneNum;
                            } else {
                                KyeePhoneService.callOnly($scope.helpPhoneNum);
                            }
                        })
                    }
                }
            });
        }
        /*取消选择就诊人*/
        $scope.toCancel = function() {
            $scope.hidePicker($scope.patientInfo.USER_VS_ID);
        };
        /**
         * 过滤虚拟就诊人
         * @param patientInfoList
         */
        $scope.checkPatientInfoList = function(patientInfoList){
            if($scope.patientInfoList && $scope.patientInfoList.length == 1){
                KyeeMessageService.confirm({
                    title:  KyeeI18nService.get("login.hint", "拨打急救电话"),
                    content:  KyeeI18nService.get("regist.isCall","呼叫急救中心，请点击确定拨打电话。"),
                    onSelect: function (flag) {
                        if (flag) {
                            //拨打客服电话
                            var userVsId = $scope.patientInfoList[0].USER_VS_ID;
                            var name = $scope.patientInfoList[0].OFTEN_NAME;
                            var phone = $scope.patientInfoList[0].PHONE;
                            var idNo = $scope.patientInfoList[0].ID_NO;
                            var sex = $scope.patientInfoList[0].SEX;
                            var dateOfBirth = KyeeUtilsService.DateUtils.formatFromDate( $scope.patientInfoList[0].DATE_OF_BIRTH,'YYYY-MM-DD');
                            var Age = CenterUtilService.ageBydateOfBirth(dateOfBirth);
                            if(Age.indexOf("个月")!=-1){
                                var age = 0;
                            }else{
                                var age  = Age.substring(0,Age.indexOf("岁"));
                            }

                            var params = {
                                "latitude" : $scope.latitude,        //患者纬度
                                "longitude" : $scope.longtitude,   //患者经度
                                "placeCode" : $scope.placeCode,     //区域编码
                                "userId" : userId,
                                "userVsId" : userVsId,
                                "scUserId" : $scope.scUserId,       //病友圈患者用户id
                                "patientName" : name,
                                "age" : age,                       //年龄
                                "dateOfBirth" : dateOfBirth,      //生日
                                "sex" : sex,                       //性别
                                "idNo" : idNo,                     //身份证号
                                "phoneNo" : phone                  //手机号
                            }

                            CallAmbulanceService.sendInfoToSH( params, function(data)
                            {
                                if (!window.device) {//网页版
                                    window.location.href = "tel:" + $scope.helpPhoneNum;
                                } else {
                                    KyeePhoneService.callOnly($scope.helpPhoneNum);
                                }
                            })
                        }
                    }
                });
            }else if($scope.patientInfoList && $scope.patientInfoList.length > 1){
                $scope.title = KyeeI18nService.get("appoint_confirm.chooseCardNo","请选择待急救者");

                $scope.showPicker($scope.patientInfo.USER_VS_ID);

            }else{
                KyeeMessageService.confirm({
                    title: KyeeI18nService.get("commonText.warmTipMsg","温馨提示"),
                    content: KyeeI18nService.get("commonText.selectPatientMsg","该项业务需要您先添加就诊者信息"),
                    okText: KyeeI18nService.get("commonText.selectOk","前往添加"),
                    cancelText: KyeeI18nService.get("commonText.selectCancel","以后再说"),
                    onSelect: function (res) {
                        if (res) {
                            $state.go("custom_patient");
                        }
                    }
                });
            }
        }

        /**
         * 点击紧急呼救事件
         */
        $scope.callForHelp = function(){
            CustomPatientService.queryCustomPatient(userId,function(result) {
                $scope.patientInfoList = [];
                if (result.success) {
                    if (result.data && result.data.length > 0) {
                        for (var i = 0; i < result.data.length; i++) {
                            var patientInfo = result.data[i];
                            if (patientInfo.PATIENT_TYPE != 0) {
                                $scope.patientInfoList.push(patientInfo);
                            }
                        }
                    }
                    var menus = [];
                    if ($scope.patientInfoList != null && $scope.patientInfoList.length > 0) {
                        for (var i = 0; i < $scope.patientInfoList.length; i++) {
                            if ($scope.patientInfoList[i].IS_DEFAULT == '1') {
                                if($scope.patientInfoList[i].IS_SELECTED=="1"){
                                    $scope.patientInfo = $scope.patientInfoList[i];
                                    break;
                                }
                            } else {
                                if($scope.patientInfoList[i].IS_SELECTED=="1"){
                                    $scope.patientInfo = $scope.patientInfoList[i];
                                    break;
                                }else{
                                    $scope.patientInfo = $scope.patientInfoList[0];
                                    break;
                                }
                            }
                        }

                        //选择卡组件赋值
                        for (var i = 0; i < $scope.patientInfoList.length; i++) {
                            var resultMap = {};
                            resultMap["value"] = $scope.patientInfoList[i].USER_VS_ID;
                            resultMap["text"] = $scope.patientInfoList[i].OFTEN_NAME;
                            resultMap["value1"] = $scope.patientInfoList[i].PHONE;
                            resultMap["value2"] = $scope.patientInfoList[i].ID_NO;
                            resultMap["value3"] = $scope.patientInfoList[i].SEX;
                            resultMap["value4"] = $scope.patientInfoList[i].DATE_OF_BIRTH;
                            menus.push(resultMap);
                        }
                        $scope.pickerItems = menus;
                    };
                    var scUser = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.USER_ACT_INFO);
                    if(!scUser){
                        CallAmbulanceService.getIMUserInfo(function(data){
                            $scope.scUserId = data.scUserId;
                            $scope.checkPatientInfoList($scope.patientInfoList);
                        });
                    }else{
                        $scope.scUserId = scUser.scUserId;
                        $scope.checkPatientInfoList($scope.patientInfoList);
                    }

                }
            });

        };
    })
    .build();


