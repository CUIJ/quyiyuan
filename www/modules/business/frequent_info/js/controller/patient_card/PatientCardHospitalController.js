/**
 * 产品名称：quyiyuan
 * 创建人: 程志
 * 创建日期:2015年８月10日
 * 医院分区 付添 KYEEAPPC-5310
 * 创建原因：个人中心--常用信息--就诊卡管理--地区选择
 */

new KyeeModule()
    .group("kyee.quyiyuan.frequent_info.patient_card_hospital.controller")
    .require(["kyee.quyiyuan.frequent_info.patient_card.service",
        "ionic"])
    .type("controller")
    .name("PatientCardHospitalController")
    .params(["$scope","$rootScope","CenterUtilService","KyeeListenerRegister","$state", "HttpServiceBus", "CacheServiceBus", "$ionicScrollDelegate", "$ionicHistory", "PatientCardService","ClinicPaidService","InpatientGeneralService","KyeeMessageService", "KyeeI18nService","HospitalSelectorService"])
    .action(function ($scope,$rootScope,CenterUtilService, KyeeListenerRegister,$state, HttpServiceBus, CacheServiceBus, $ionicScrollDelegate, $ionicHistory, PatientCardService,ClinicPaidService,InpatientGeneralService,KyeeMessageService,KyeeI18nService,HospitalSelectorService) {

        $scope.hospitalDataLoaded = false;
        $scope.openBotten = [];
        $scope.openBottenArea = [];
        $scope.isAreaHospital = false;
        $scope.showHospital = [];
        $scope.headerCityName = undefined;//默认没有选择的城市名（有切换城市功能）
        //是否可选医院
        $scope.canSelectHospital = ($rootScope.ROLE_CODE!="5");
        //卡片信息
        $scope.card = {
            TYPE: "",
            NAME: "",
            NUM: "",
            CARD_URL:""
        };
        var memCache = CacheServiceBus.getMemoryCache();
        var stgCache = CacheServiceBus.getStorageCache();
        /**
         * 处理医院名字过长的情况
         */
        $scope.handleHospitalName = function (hospitals) {
            $scope.openBotten = [];
            if (hospitals && hospitals.length) {
                for (var index = 0; index < hospitals.length; index++) {
                    if (hospitals[index].HOSPITAL_NAME.length > 17) {
                        $scope.openBotten.push(true);
                    } else {
                        $scope.openBotten.push(false);
                    }
                }
            }
        };
        var  areaHospital = [];  //分院区数据
        var  areaHospitalObject ={};//记录分院区Id对象
        var  areaHospitalObjectResult ={};//分院区分类对象
        var  t=0; //计数器
        /**
         * 处理医院数据
         * @param data
         */
        $scope.hospitalAreaDataHandle = function(data){
            areaHospital = [];  //分院区数据
            areaHospitalObject ={};//记录分院区Id对象
            areaHospitalObjectResult ={};//分院区分类对象
            t=0; //计数器
            $scope.isAreaHospital = false;
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
                    }else{            //存在删除原数组
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

            /**
             * 任务号：KYEEAPPC-8555
             * 作者：yangmingsi
             * 描述：对体验医院做特殊处理
             * @param hospitalId
             */
            $scope.removeTiYanHospital = function(data){
                for(var i = 0 ;i< data.length;i++){
                    if(data[i].HOSPITAL_ID == 1001){
                        data.splice(i,1);
                        i=i-1;
                    }
                }
            };

            $scope.hospitals = data; //要显示的数据

            $scope.handleHospitalName($scope.hospitals);
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

        //页面添加监听事件
        KyeeListenerRegister.regist({
            focus: "patient_card_hospital",
            direction: 'both',
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            action: function (params) {
                $scope.headerCityName = PatientCardService.scopeAdd.area.CITY_NAME;//有选择省份城市操作
                loadHospitalList();
            }
        });

        //选择城市点击事件
        $scope.selectCityClick = function(){
            if(!$scope.canSelectHospital){
                return;
            }
            $state.go('patient_card_city');
        };

        //获取医院
        var loadHospitalList = function(){
            //获取医院
            PatientCardService.loadHospitalList(function (data) {
                if(!$scope.canSelectHospital){
                    // 微信公众号个性化需求
                    $scope.hospitals = [];
                    var rows = data.data.rows;
                    var urlHospitalId = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL).hospitalID;
                    for(var i = 0 ;i< rows.length;i++){
                        if(rows[i].HOSPITAL_ID == urlHospitalId){
                            $scope.hospitals.push(rows[i]);
                            break;
                        }
                    }
                    $scope.handleHospitalName($scope.hospitals);
                } else {
                    var dataCopy =  angular.copy(data);
                    $scope.hospitalAreaDataHandle(dataCopy.data.rows);
                    $scope.removeTiYanHospital(dataCopy.data.rows);
                }

                $scope.hospitalDataLoaded = true;
            });
        };
        //loadHospitalList();

        //选了医院
        $scope.hospitalSelected = function (hospitalId, hospitalName,hospital,isAreaHospitalfalg) {
            //门诊已缴费 KYEEAPPC-6170 程铄闵
            if(hospital.GENERAL_HOSPITALS_ID != 0 && !$scope.isAreaHospital){
                $ionicScrollDelegate.scrollTop();
                $scope.showHospital = areaHospitalObjectResult[hospital.GENERAL_HOSPITALS_ID];
                $scope.openBottenArea =  $scope.openBotten ;
                $scope.handleHospitalName($scope.showHospital);
                $scope.isAreaHospital = true;
            }else{

                if(PatientCardService.fromOtherRoute == 'clinicPaid'){
                    PatientCardService.oldHospitalInfoCopy = angular.copy(CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO));//KYEEAPPTEST-3712 程铄闵
                    ClinicPaidService.getHospitalClose(hospitalId,function(){
                        PatientCardService.fromOtherRoute = undefined;
                        ClinicPaidService.popupHospitalId = hospitalId;
                        $state.go('clinicPaid');
                    });
                }
                //住院费用（就医记录）跳转来  KYEEAPPC-6607 程铄闵
                else if(PatientCardService.fromOtherRoute == 'inpatient_general'){
                    PatientCardService.oldHospitalInfoCopy = angular.copy(CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO));//KYEEAPPTEST-3712 程铄闵
                    PatientCardService.fromOtherRoute = undefined;
                    InpatientGeneralService.changeHospitalId = hospitalId;
                    InpatientGeneralService.afterChangeHospital(function(route){
                        InpatientGeneralService.lastChangeHospitalId = hospitalId;//存可以正常使用的最近一次的hospitalId KYEEAPPTEST-3712 程铄闵
                        $state.go(route);
                    });
                }
                else{
                    //从缓存中获取当前选择的医院
                    PatientCardService.oldHospitalInfoCopy = angular.copy(CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO));
                    if(isAreaHospitalfalg == false){ //所有医院页面
                        //判断是否是分院区
                        if(hospital.GENERAL_HOSPITALS_ID!= 0){ //分院区
                            $scope.isAreaHospital = true;
                            $ionicScrollDelegate.scrollTop();
                            $scope.showHospital = areaHospitalObjectResult[hospital.GENERAL_HOSPITALS_ID];
                            $scope.openBottenArea =  $scope.openBotten ;
                            $scope.handleHospitalName($scope.showHospital);
                        }else{
                            selectHospital(hospitalId, hospitalName,hospital);
                        }
                    }else{   //分院区页面点击直接继续业务
                        //非分院区继续用户业务
                        selectHospital(hospitalId, hospitalName,hospital);
                    }
                }
            }
        };
        var selectHospital =  function(hospitalId, hospitalName,hospital){
            //如果选择的医院改变了,卡类型要重置  仅支持虚拟卡   KYEEAPPC-3837
            PatientCardService.setCardType("", "");
            PatientCardService.getShowInfo(hospitalId, function (resp) {
                    if(resp.success){
                        //仅支持虚拟卡的医院
                        if(resp.data.CARD_TYPE && resp.data.CARD_TYPE=="true"&& resp.data.SHOW_INPUT_BOX=="false") {
                            addVCard(hospital);
                        }else{
                            PatientCardService.hospIdChange = hospitalId;
                            PatientCardService.hospNameChange = hospitalName;
                            PatientCardService.showInfo = resp.data;
                            PatientCardService.setHospital(hospitalId, hospitalName);
                            $ionicHistory.goBack(-1);
                        }
                }
            });
        };

        $scope.back = function(){
            PatientCardService.fromOtherRoute = undefined;//KYEEAPPC-6170 程铄闵
          $scope.openBotten = $scope.openBottenArea ;
            if($scope.isAreaHospital == true){
                $scope.isAreaHospital = false;
                setTimeout(function () {
                    $scope.$apply();
                }, 1);
                return ;
            }
            $ionicHistory.goBack(-1);
        };

        //监听物理键返回
        KyeeListenerRegister.regist({
            focus: "patient_card_hospital",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();   //禁掉默认处理，使物理返回与页面上的返回键一致
                $scope.back();
            }
        });

        //添加虚拟卡 KYEEAPPC-8005 yangmingsi
       var addVCard = function (hospital) {
            if (PatientCardService.validateArea(hospital)
                && PatientCardService.validateHospital(hospital)) {

                var userVsId =  memCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT).USER_VS_ID;
                var cardInfo = {
                    userVsId: userVsId,
                    hospitalId: hospital.HOSPITAL_ID,
                    cardNo:"",
                    cardType: 0
                };

                PatientCardService.addCard(cardInfo, function (data) {
                    if (data.success&& data.data != null && data.data.SUCCESS_FLAG == "TRUE") {
                        KyeeMessageService.broadcast({
                            content: KyeeI18nService.get("patient_card_select.notSupportFictitiousCard", data.message)
                        });
                    } else {
                        KyeeMessageService.broadcast({
                            content: KyeeI18nService.get("patient_card_select.notSupportFictitiousCard", data.message)
                        });
                    }
                });
            }
        };
    })
    .build();