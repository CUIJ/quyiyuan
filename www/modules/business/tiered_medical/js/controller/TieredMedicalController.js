new KyeeModule()
    .group("kyee.quyiyuan.tiered_medical.controller")
    .require([
        "kyee.quyiyuan.tiered_medical.service"
    ])
    .type("controller")
    .name("TieredMedicalController")
    .params(["$scope", "$state","CacheServiceBus","$ionicHistory","TieredMedicalService","AppointmentDeptGroupService","HospitalSelectorService","KyeeListenerRegister"])
    .action(function ($scope, $state,CacheServiceBus,$ionicHistory,TieredMedicalService,AppointmentDeptGroupService,HospitalSelectorService,KyeeListenerRegister) {
        $scope.hosp = "";
        var stgCache = CacheServiceBus.getStorageCache();
        var hospInfo = stgCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
        $scope.name = hospInfo.name;
        $scope.hospInfo = {
            hosp : 'resource/images/center/defult.png',
            hospLevel : "三甲"
        };
        var hosId = hospInfo.id;
        /**
         * 回退
         */
        $scope.goBack = function(){
            $state.go("home->MAIN_TAB");
        };
        /**
         * 切换医院
         * @param hospitalId
         * @param hospitalName
         * @param hospitalAddress
         * @param provinceCode
         * @param provinceName
         * @param cityCode
         * @param cityName
         * @param hospital
         */
        var selectHospitalAll = function (hospitalId, hospitalName, hospitalAddress,provinceCode, provinceName, cityCode, cityName, hospital){
            var storageCache = CacheServiceBus.getStorageCache();
            var result = {
                CITY_NAME: cityName,
                CITY_CODE: cityCode,
                PROVINCE_NAME: provinceName,
                PROVINCE_CODE: provinceCode,
                LOCAL_TYPE: 0
            };
            storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.LAST_PROVINCE_CITY_INFO, result);

            //普通选择医院
            HospitalSelectorService.selectHospital(hospitalId, hospitalName, hospitalAddress, provinceCode, provinceName, cityCode, cityName,
                "正在加载医院信息...", function (disableInfo) {
                    //切换医院判断是否要做维语切换提示
                    HospitalSelectorService.changeLaguage(true,$rootScope);}, hospital);
        };
        /**
         * 去预约挂号
         * @param data
         */
        $scope.goHosp = function(data){
            //内存医院列表
            var hospListCache = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.HOSPITAL_LIST);
            if(hospListCache){
                var hospList = hospListCache;
                for(var i=0;i<hospList.length;i++){
                    if(hospList[i].HOSPITAL_ID == data.HOSPITAL_ID){
                        selectHospitalAll(
                            hospList[i].HOSPITAL_ID,
                            hospList[i].HOSPITAL_NAME,
                            hospList[i].MAILING_ADDRESS,
                            hospList[i].PROVINCE_CODE,
                            hospList[i].PROVINCE_NAME,
                            hospList[i].CITY_CODE,
                            hospList[i].CITY_NAME,
                            hospList[i]);
                    }
                }
            }
            AppointmentDeptGroupService.IS_REFERRAL = 2;
            AppointmentDeptGroupService.REFERRAL_DIRECTION = data.REFERRA_LEVEL;
            setTimeout(function () {
                $state.go("appointment");
            }, 800);
        };
        /**
         * 页面初始化
         */
        $scope.executeHosOfReferral = function () {
            TieredMedicalService.executeHosOfReferral(hosId, function (data) {
                if(data && data.length > 0){
                    //内存医院列表
                    var hospListCache = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.HOSPITAL_LIST);
                    $scope.executeData = data;
                    for(var l = 0;l<$scope.executeData.length;l++){
                        if(hospListCache){
                            var hospList = hospListCache;
                            for(var i=0;i<hospList.length;i++){
                                if(hospList[i].HOSPITAL_ID == $scope.executeData[l].HOSPITAL_ID){
                                    $scope.executeData[l].HOSPITAL_LEVEL = hospList[i].HOSPITAL_LEVEL;
                                    $scope.executeData[l].IS_SHOW = true;
                                }
                            }
                        }
                        if($scope.executeData[l].HOSPITAL_ID == hosId && $scope.executeData[l].ADV_URL){
                            $scope.hospInfo.hosp = $scope.executeData[l].ADV_URL;
                            $scope.hospInfo.hospLevel = $scope.executeData[l].HOSPITAL_LEVEL;
                        }
                    }
                }else{
                    $scope.isShow = true;
                }
            });
        };

        KyeeListenerRegister.regist({
            focus: "tiered_medical",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (params) {
                hospInfo = stgCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                $scope.hosp = hospInfo.advs[0].url;
                $scope.name = hospInfo.name;
                hosId = hospInfo.id;
                $scope.executeHosOfReferral();
            }
        });

    })
    .build();