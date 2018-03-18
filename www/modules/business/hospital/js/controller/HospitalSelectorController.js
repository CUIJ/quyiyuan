new KyeeModule()
    .group("kyee.quyiyuan.hospital.hospital_selector.controller")
    .require(["kyee.framework.service.messager", "kyee.quyiyuan.hospital.hospital_selector.service", "kyee.framework.service.message", "ionic"])
    .type("controller")
    .name("HospitalSelectorController")
    .params(["$scope", "$ionicScrollDelegate","$ionicHistory", "$timeout","KyeeMessageService",
        "$state", "CacheServiceBus", "HospitalSelectorService",
        "HospitalFilterDef", "MultipleQueryCityService", "InpatientPaidService", "KyeeI18nService",
        "KyeeListenerRegister", "KyeeEnv", "AppointmentDeptGroupService","HomeService",
        "InpatientPaymentService","ClinicPaidService","ClinicPaymentService","$rootScope",
        "PatientCardRechargeService","ReportMultipleService","CenterUtilService","ClinicPaymentReviseService",
        "PerpaidService","PerpaidPayInfoService"])
    .action(function ($scope,$ionicScrollDelegate, $ionicHistory, $timeout,KyeeMessageService,
                      $state, CacheServiceBus, HospitalSelectorService,
                      HospitalFilterDef, MultipleQueryCityService, InpatientPaidService, KyeeI18nService,
                      KyeeListenerRegister, KyeeEnv, AppointmentDeptGroupService,HomeService,
                      InpatientPaymentService,ClinicPaidService,ClinicPaymentService,$rootScope,
                      PatientCardRechargeService,ReportMultipleService,CenterUtilService,ClinicPaymentReviseService,
                      PerpaidService,PerpaidPayInfoService) {

        //存储当前所选省份的索引
        $scope.provinceIdx = 0;
        //取城市名宽度
        $scope.cityWidth = window.innerWidth - 184 + 'px';
        $scope.isAreaHospital = false;
        var storageCache = CacheServiceBus.getStorageCache();
        var cache = CacheServiceBus.getMemoryCache();
        $scope.userSource=cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE);
        var selected = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.LAST_PROVINCE_CITY_INFO);
        //是否可选医院
        $scope.canSelectHospital = ($rootScope.ROLE_CODE!="5");

        /**
         * 加载市下的所有医院
         */
        $scope.loadHospitals = function (city) {

            //清空医院数据
            $scope.hospitals = [];

            $scope.pageTitle = KyeeI18nService.get("hospital_selector.selectHospital", "选择医院");

            if(city.PROVINCE_ID == 0){
                city.PROVINCE_CODE = city.CITY_CODE;
                city.PROVINCE_NAME = $scope.provinceName;
            }
            var storageCityInfo = {
                PROVINCE_NAME: city.PROVINCE_NAME,
                PROVINCE_CODE: city.PROVINCE_CODE,
                CITY_NAME: city.CITY_NAME,
                CITY_CODE: city.CITY_CODE
            };
            var storageCache = CacheServiceBus.getStorageCache();
            var cache = CacheServiceBus.getMemoryCache();
            var userSource=cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE);
            var publicServiceType = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_PUBLIC_SERVER_TYPE);
            //注：洛阳、驻马店卫计委个性化
            if(userSource!="12" || publicServiceType != "020073" ||userSource!="4001"){
                //城市信息存入缓存
                storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.LAST_PROVINCE_CITY_INFO, storageCityInfo);
            }
            $scope.provinceName = city.PROVINCE_NAME;

            //修改首页左上角城市名字 ---选择了该省下所有市
            if (city.CITY_CODE == city.PROVINCE_CODE) {
                $rootScope.localCityName = city.PROVINCE_NAME;
            } else {
                $rootScope.localCityName = city.CITY_NAME;
            }

            //记录当前的选择路径
            // $scope.cityeName = "/" + city.CITY_NAME;
            //判断选择医院页面显示城市信息，如果是省下的所有医院则显示省份，如果是省下具体市显示城市名  by 杜巍巍  KYEEAPPC-4008
            //选择城市下所有市改为所有医院 KYEEAPPC-5215
            if(city.CITY_NAME == "所有医院"){
                $scope.cityeName = city.PROVINCE_NAME;
            }else if(city.CITY_NAME && city.CITY_NAME.length >0){
                $scope.cityeName = city.CITY_NAME;
            }
            $scope.isShowBtn = true;
            //显示无数据提示
            $scope.showEmpty = false;

            //重置标志位
            $scope.hospitalDataLoaded = false;

            //查询医院列表
            HospitalSelectorService.getHospitalListData(city.PROVINCE_CODE, city.CITY_CODE, false,function (data) {
                if(!$scope.canSelectHospital){
                    // 微信公众号个性化需求
                    var urlHospitalId = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL).hospitalID;
                    for(var i = 0 ;i<data.length;i++){
                        if(data[i].HOSPITAL_ID == urlHospitalId){
                            $scope.hospitals.push(data[i]);
                            break;
                        }
                    }
                    $scope.hospitalDataLoaded = true;
                } else {
                    var dataCopy =  angular.copy(data);
                    //医院分区处理  付添
                    hoapitalAreaDataHandle(dataCopy);
                }

                if ($scope.hospitals.length == 0) {
                    $scope.showEmpty = true;
                } else {
                    $scope.showEmpty = false;
                }

                //等到医院数据加载完成的时候再显示"全部医院已显示完毕"
                $scope.hospitalDataLoaded = true;
            });
        };
        var  areaHospital = [];  //分院区数据
        var  areaHospitalObject ={};//记录分院区Id对象
        var  areaHospitalObjectResult ={};//分院区分类对象
        var  t=0; //计数器
        var hoapitalAreaDataHandle = function(data){
            for(var i = 0 ;i<data.length;i++){ //所属院区不为空
                if(data[i].GENERAL_HOSPITALS_ID!=0){
                    areaHospital[t++] = angular.copy(data[i]);  //存储有分院区的数据副本
                    var temp = data[i].GENERAL_HOSPITALS_ID;
                    if(!areaHospitalObject[temp]) {    //显示数组是否存在该区医院
                        areaHospitalObject[temp] = data[i].GENERAL_HOSPITALS_ID;
                        if (!CenterUtilService.isDataBlank(data[i].GENERAL_LOGO_PHOTO)) {//总院区logo
                            data[i].LOGO_PHOTO = data[i].GENERAL_LOGO_PHOTO;
                        }
                        data[i].HOSPITAL_NAME = data[i].GENERAL_HOSPITAL_NAME
                    }else{    //存在删除原数组
                        if(data[i].IS_ONLINE==1){
                            for(var j = 0 ;j<i;j++){
                                if(data[i].GENERAL_HOSPITALS_ID == data[j].GENERAL_HOSPITALS_ID){
                                    data[j].IS_ONLINE= 1;
                                }
                            }
                        }
                        data.splice(i,1);
                        i=i-1;
                    }
                }

            }
            $scope.hospitals = data; //要显示的数据

            for(var s in areaHospitalObject){
                var temp = [];
                for(var j =0 ;j<areaHospital.length;j++){
                    if(areaHospitalObject[s] == areaHospital[j].GENERAL_HOSPITALS_ID ){
                        temp.push(areaHospital[j]);
                    }
                }
                areaHospitalObjectResult[areaHospitalObject[s]] = temp;
            }
        };
        //切换城市，进入省市列表
        $scope.backToProvince = function () {
            //微信公众号禁止切换省市
            if(!$scope.canSelectHospital){
                return;
            }
            var cache = CacheServiceBus.getMemoryCache();
            var userSource=cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE);
            var publicServiceType = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_PUBLIC_SERVER_TYPE);
            //注：洛阳、驻马店卫计委个性化---要求禁止切换省市
            if(userSource == "12" || publicServiceType == "020073"||userSource=="4001"){
                return;
            }
            //进入选择城市页面前，记录当前进入的路径，用于选择完后返回切换城市下的医院列表 By 杜巍巍  KYEEAPPC-4117
            MultipleQueryCityService.goState = "hospital_selector";
            $state.go('multiple_city_list');
        };

        //所有医院
        var selectHospitalAll  =function (hospitalId, hospitalName, hospitalAddress,
                                          provinceCode, provinceName, cityCode, cityName, hospital,isAreaHospitl){
            //普通选择医院
            HospitalSelectorService.selectHospital(hospitalId, hospitalName, hospitalAddress, provinceCode, provinceName, cityCode, cityName,
                "正在加载医院信息...", function (disableInfo) {
                    var cache = CacheServiceBus.getMemoryCache();
                    var userSource=cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE);
                    var publicServiceType = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_PUBLIC_SERVER_TYPE);
                    if (HospitalSelectorService.isFromFiler) {
                        //从过滤器过来
                        HospitalFilterDef.doFinashIfNeed({
                            onBefore : function () {
                                //防止回退到医院选择器页面
                                $ionicHistory.currentView($ionicHistory.backView());
                            }
                        });
                    } else if(HomeService.isFromAppoint){
                        if( HomeService.goState == "seletAppointDate"){
                            //从选择日期进入，清空标记 By 杜巍巍  KYEEAPPTEST-3158
                            HomeService.goState = undefined;
                        }else{
                            //否则清空日期
                            HomeService.selDateStr = undefined;
                        }
                        AppointmentDeptGroupService.ROUTER_STATE = "appointment";
                        var hospitalInfo = CacheServiceBus.getStorageCache().get('hospitalInfo');
                        //根据医院是否开通预约挂号，提示用户是否禁用  By  章剑飞  APPCOMMERCIALBUG-2029
                        if(hospitalInfo && hospitalInfo.is_home_appoint_enable == '1'){
                            //转诊标识2转诊  0不转诊
                            AppointmentDeptGroupService.IS_REFERRAL = 0;
                            $state.go("appointment");
                        }else{
                            KyeeMessageService.broadcast({
                                content:KyeeI18nService.get("home->MAIN_TAB.appointmentNotOpen","该医院预约挂号功能暂未开通")
                            });
                            $state.go("home->MAIN_TAB");
                        }
                    }
                    //从住院费用中过来  KYEEAPPC-4453 程铄闵
                    /*                    else if (HospitalSelectorService.isFromInpatientPay) {
                     InpatientPaymentService.hospitalId = hospitalId;
                     InpatientPaymentService.hospitalName = hospitalName;
                     //从住院业务进入选择医院
                     HospitalSelectorService.isFromInpatientPay = false;
                     InpatientPaymentService.loadData(undefined,function(route){//KYEEAPPC-5128 程铄闵
                     $state.go(route);
                     });
                     }
                     //从住院已结算中过来 KYEEAPPC-4453 程铄闵
                     else if (HospitalSelectorService.isFromInpatientPaid) {
                     InpatientPaidService.hospitalId = hospitalId;
                     InpatientPaidService.hospitalName = hospitalName;
                     //从住院业务进入选择医院
                     HospitalSelectorService.isFromInpatientPaid = false;
                     InpatientPaidService.loadRecordData(undefined,function(route){//KYEEAPPC-5128 程铄闵 从医院首页进入
                     $state.go(route);
                     });
                     }*/
                    //从住院预缴中过来  KYEEAPPC-6601 程铄闵
                    else if (HospitalSelectorService.isFromPerpaid) {
                        HospitalSelectorService.isFromPerpaid = false;
                        PerpaidService.changePatientOrHospital(function(data){
                            if(data){
                                //$ionicHistory.goBack(); 受跳perpaid_pay_info影响，不能back
                                $state.go('perpaid');
                            }
                        });
                    }
                    //从住院预缴中间态页过来  KYEEAPPC-6601 程铄闵
                    else if (HospitalSelectorService.isFromPerpaidPayInfo) {
                        HospitalSelectorService.isFromPerpaidPayInfo = false;
                        PerpaidPayInfoService.changePatientOrHospital(true,function(data){
                            if(data){
                                $state.go('perpaid');
                            }
                        });
                    }
                    //从门诊费用(旧)中过来  KYEEAPPC-4451 程铄闵
                    else if (HospitalSelectorService.isFromClinicPayment) {
                        ClinicPaymentService.hospitalSelId = hospitalId;
                        ClinicPaymentService.hospitalSelName = hospitalName;
                        HospitalSelectorService.isFromClinicPayment = false;
                        $ionicHistory.goBack();
                    }
                    //从门诊费用(2.2.20)中过来  KYEEAPPC-4451 程铄闵
                    else if (HospitalSelectorService.isFromClinicPaymentRevise) {
                        ClinicPaymentReviseService.hospitalSelId = hospitalId;
                        ClinicPaymentReviseService.hospitalSelName = hospitalName;
                        ClinicPaymentReviseService.unNeedRegister = undefined;
                        ClinicPaymentReviseService.fromRecordHospitalId = undefined;
                        HospitalSelectorService.isFromClinicPaymentRevise = false;
                        $ionicHistory.goBack();
                    }
                    //从门诊已缴中过来 KYEEAPPC-4451 程铄闵
                    else if (HospitalSelectorService.isFromClinicPaid) {
                        ClinicPaidService.hospitalId = hospitalId;//默认hospitalId
                        ClinicPaidService.hospitalName = hospitalName;
                        ClinicPaidService.hospitalIdTree = undefined;//就医记录已缴切换医院需清除本有hospitalIdTree
                        ClinicPaidService.hospitalIdTreeName = undefined;
                        ClinicPaidService.fromMsgHospitalId = undefined;//小铃铛待缴费->已缴费需清除本有hospitalIdTree
                        ClinicPaidService.fromMsgHospitalName = undefined;
                        HospitalSelectorService.isFromClinicPaid = false;
                        $ionicHistory.goBack();
                    }
                    //从检查检验单切换医院过来 KYEEAPPC-4621  zhangming   2015.12.25
                    else if(ReportMultipleService.reportSelHos){
                        ReportMultipleService.detialFlag=false;
                        ReportMultipleService.reportSelHos=false;
                        $ionicHistory.goBack();
                    }
                    //从就诊卡充值界面切换医院
                    else if(HospitalSelectorService.isFromPatientRecharge){
                        //HospitalSelectorService.isFromPatientRecharge = false;//标记在此处清除会出现KYEEAPPTEST-3222问题4
                        PatientCardRechargeService.getModule(function (route) {
                            $state.go(route);//KYEEAPPC-5217 程铄闵
                        },$state);
                    }
                    // 从病友圈进入，根据选择的医院科室推荐群组
                    else if(HospitalSelectorService.isFindGroupByHospital){ //edited by zhangyi at 20161121 for KYEEAPPC-8731 : 整合isFromPatientsGroup和goToPatientsGroup控制变量到isFindGroupByHospital中
                        $state.go("appointment");
                    }
                    //进入医院首页
                    else if(HospitalSelectorService.toHospital || userSource == '12'|| publicServiceType == '020073'){
                        HospitalSelectorService.toHospital = false;
                        $state.go("home->MAIN_TAB");
                    }
                    else {
                        $ionicHistory.goBack();
                    }
                    //begin 切换医院判断是否要做维语切换提示 KYEEAPPC-4542 
                    setTimeout(function(){
                        HospitalSelectorService.changeLaguage(true,$rootScope);
                    }, 500);
                    //end KYEEAPPC-4542
                }, hospital);
        };

        /**
         * 选择医院
         */
        $scope.selectHospital = function (hospitalId, hospitalName, hospitalAddress,
                                          provinceCode, provinceName, cityCode, cityName, hospital,isAreaHospitlflag) {
            if(isAreaHospitlflag == false){ //所有医院页面
                //判断是否是分院区
                if(hospital.GENERAL_HOSPITALS_ID!= 0){ //分院区
                    $scope.isAreaHospital = true;
                    $ionicScrollDelegate.scrollTop();
                    $scope.showHospital = areaHospitalObjectResult[hospital.GENERAL_HOSPITALS_ID];

                }else{
                    //非分院区继续用户业务
                    selectHospitalAll(hospitalId, hospitalName, hospitalAddress,
                        provinceCode, provinceName, cityCode, cityName, hospital,isAreaHospitlflag);
                }
            }else{   //分院区页面点击直接继续业务
                //非分院区继续用户业务
                selectHospitalAll(hospitalId, hospitalName, hospitalAddress,
                    provinceCode, provinceName, cityCode, cityName, hospital,isAreaHospitlflag);
            }

        };

        if (selected&&selected.CITY_NAME) {
            //已经选过省市
            $scope.loadHospitals(selected);
        } else {
            //定位
            MultipleQueryCityService.localCityName(true,function(){  // 设置定位
                var selected = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.LAST_PROVINCE_CITY_INFO);
                if (selected) {
                    //已经选过省市
                    $scope.loadHospitals(selected);
                } else {
                    MultipleQueryCityService.cityNotSelect = true;
                    //用户未选择省市
                    MultipleQueryCityService.goState = "hospital_selector";
                    $state.go('multiple_city_list');
                }
            });
        }

        //解决部分机型不支持弹性盒子布局的问题
        $scope.getWidth = function(hospital){
            var width = 0;
            if(hospital.IS_ONLINE == 1){
                width += 25;
            }
            width = window.innerWidth - 75 - width;
            return width+'px';
        };

        //离开页面重置变量
        KyeeListenerRegister.regist({
            focus: "hospital_selector",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_LEAVE,
            action: function (params) {
                if(params.to != 'appointment' && params.to != 'multiple_city_list'){
                    //重置状态位
                    HospitalSelectorService.isFromFiler = false;
                }
                //点击医院首页拦截  By  章剑飞  KYEEAPPTEST-3189
                if(params.to != 'multiple_city_list'){
                    HospitalSelectorService.toHospital = false;
                    HomeService.isFromAppoint = false;
                }
            }
        });
        //返回按钮 程铄闵 KYEEAPPTEST-3222
        $scope.back = function(){
            if($scope.isAreaHospital == true){
                $scope.isAreaHospital = false;
                // $scope.$digest();
                setTimeout(function () {
                    $scope.$apply();
                }, 1);
                return ;
            }
            //返回就诊卡充值界面
            if(HospitalSelectorService.isFromPatientRecharge){
                var forward = $ionicHistory.forwardView();
                //切换医院返回出去首页不合理 KYEEAPPC-5581 程铄闵
                if(forward&&forward.stateId == 'patient_card_select'){
                    $ionicHistory.goBack(-2);
                }else{
                    $ionicHistory.goBack();
                }
                HospitalSelectorService.isFromPatientRecharge = false;
            }
            //程铄闵 KYEEAPPC-6601 2.2.40住院预缴
            else if (HospitalSelectorService.isFromPerpaid){
                HospitalSelectorService.isFromPerpaid = false;
                $state.go('perpaid');
            }
            else if (HospitalSelectorService.isFromPerpaidPayInfo){
                $state.go('perpaid_pay_info');
            }
            else{
                $ionicHistory.goBack();//从历史页面中返回
            }

        };

        //监听物理键返回
        KyeeListenerRegister.regist({
            focus: "hospital_selector",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();   //禁掉默认处理，使物理返回与页面上的返回键一致
                $scope.back();
            }
        });
    })
    .build();