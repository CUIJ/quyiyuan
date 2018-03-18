/**
 * 产品名称：quyiyuan.
 * 创建用户：姚斌
 * 日期：2015年5月12日20:05:55
 * 创建原因：模糊搜索页面控制器
 * 修改人：高玉楼
 * 修改任务：KYEEAPPC-3622
 * 修改人：武帆
 * 修改任务：KYEEAPPC-7361
 * 修改原因：迁移前端涉及ms-guide上海组件到后端调用所需改动
 */
new KyeeModule()
    .group("kyee.quyiyuan.multiplequery.multiplequery.controller")
    .require([
        "kyee.quyiyuan.messagecenter.multiplequery.service",
        "kyee.quyiyuan.myquyi.my_care_doctors.service",
        "kyee.quyiyuan.appointment.service",
        "kyee.quyiyuan.multipleDeptInfo.controller",
        "kyee.quyiyuan.multipleHospitalInfo.controller",
        "kyee.quyiyuan.multipleDoctorInfo.controller",
        "kyee.quyiyuan.multiplequery.diseaseinfoquery.controller",
        "kyee.quyiyuan.multiplequery.diseaselist.controller",
        "kyee.quyiyuan.multiplequery.diseaseinfoquery.service",
        "kyee.quyiyuan.currentMultipleInfoController.controller"])
    .type("controller")
    .name("MultipleQueryController")
    .params(["KyeeMessageService","$scope", "$state", "$ionicHistory", "$timeout",
        "MultipleQueryService", "CacheServiceBus",
        "MyCareDoctorsService", "HospitalSelectorService", "HospitalService",
        "AppointmentDeptGroupService", "AppointmentDoctorDetailService", "DiseaseInfoQueryService", "KyeeListenerRegister", "MultipleQueryCityService", "KyeeI18nService"])
    .action(function (KyeeMessageService,$scope, $state, $ionicHistory, $timeout,
                      MultipleQueryService, CacheServiceBus,
                      MyCareDoctorsService, HospitalSelectorService, HospitalService,
                      AppointmentDeptGroupService, AppointmentDoctorDetailService, DiseaseInfoQueryService, KyeeListenerRegister, MultipleQueryCityService, KyeeI18nService) {

        var cityInfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.LAST_PROVINCE_CITY_INFO);
        var memoryCache = CacheServiceBus.getMemoryCache();//全局参数
        var selectedCity, cityName, cityCode;
        if ($state.current.name == 'multiple_query') {
            $scope.keyWords = {keyWordsValue: ""};
        } else {
            $scope.keyWords = MultipleQueryService.keyWords;
        }

        KyeeListenerRegister.regist({
            focus: "multiple_query",
            direction: "both",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            action: function () {
                //清空栈历史
                MultipleQueryService.historyStack = [];
                selectedCity = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.LAST_PROVINCE_CITY_INFO);
                if(selectedCity){
                    cityName = selectedCity.CITY_NAME;
                    cityCode = selectedCity.CITY_CODE;
                }

                //如果从其他搜索页面跳转过来，则搜索其他页面发过来的搜索值
                if (MultipleQueryService.keyWords.keyWordsValue) {
                    $scope.keyWords = MultipleQueryService.keyWords;
                    $scope.onSearch();
                }
            }
        });

        var userSource = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE);
        //如果是正常apk用户，可以搜索疾病；个性化疾病则不能搜索疾病
        if (userSource == '0') {
            //主页搜索模块国际化改造  By  杜巍巍    KYEEAPPC-3927
            $scope.placeHoderText = KyeeI18nService.get("multiple_query.queryAllInfo", "搜索疾病/医院/科室/医生");
        }
        else {
            //主页搜索模块国际化改造  By  杜巍巍    KYEEAPPC-3927
            $scope.placeHoderText = KyeeI18nService.get("multiple_query.queryInfo", "搜索医院/科室/医生");
        }

        //用来控制页面元素的显示
        //1：显示历史搜索记录 2：显示搜索结果 3：未搜索到结果 4：不显示任何结果
        $scope.searchStatus = 1;
        //历史搜索记录容量为30
        var searchHistoriesSize = 30;
        //从cache中读取历史搜索记录
        $scope.searchHistorys = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.SEARCH_HISTORIES);
        if (!$scope.searchHistorys) {
            $scope.searchHistorys = [];
            CacheServiceBus.getStorageCache().set(CACHE_CONSTANTS.STORAGE_CACHE.SEARCH_HISTORIES, $scope.searchHistorys);
        }

        //点击更多搜索相关科室信息
        $scope.goMultipleDept = function () {
            //记录页面跳转的路由栈  By 杜巍巍  KYEEAPPC-3927
            MultipleQueryService.ChangeRouter("multiple_query", "multiple_query.multiple_deptInfo");
            MultipleQueryService.historyStack.push('multiple_query');
            $state.go("multiple_query.multiple_deptInfo");
        };
        //点击更多搜索相关医生信息
        $scope.goMultipleDoctor = function () {
            //记录页面跳转的路由栈  By 杜巍巍  KYEEAPPC-3927
            MultipleQueryService.ChangeRouter("multiple_query", "multiple_query.multiple_doctorInfo");
            MultipleQueryService.historyStack.push('multiple_query');
            $state.go("multiple_query.multiple_doctorInfo");
        };
        //点击更多搜索相关医院信息
        $scope.goMultipleHospital = function () {
            //记录页面跳转的路由栈  By 杜巍巍  KYEEAPPC-3927
            MultipleQueryService.ChangeRouter("multiple_query", "multiple_query.multiple_hospitalInfo");
            MultipleQueryService.historyStack.push('multiple_query');
            $state.go("multiple_query.multiple_hospitalInfo");
        };

        //点击更多搜索相关医院信息
        $scope.goMultipleCurrentHospital = function () {
            MultipleQueryService.ChangeRouter("multiple_query", "multiple_query.multiple_current_info");
            MultipleQueryService.historyStack.push('multiple_query');
            $state.go("multiple_query.multiple_current_info");
        };
        /**
         * 点击搜索事件
         */
        $scope.onSearch = function () {
            var keyWords = $scope.keyWords.keyWordsValue.trim();
            if (!keyWords) {
                return;
            }
            //搜索时，数据未返回，则页面不显示数据
            if ($scope.searchStatus == 1) {
                $scope.searchStatus = 4;
            }
            mngStorageCache(keyWords);

            if ($state.current.name != 'multiple_query') {
                //跳转页面时需要延迟加载
                $timeout(function () {
                    getData(keyWords);
                }, 200);

                //页面不显示数据
                $scope.searchStatus = 4;
                //清空导航栈
                MultipleQueryService.historyStack = [];
                $state.go('multiple_query');
            } else {
                getData(keyWords);
            }
        };

        var getData = function (keyWords) {
            MultipleQueryService.keyWords = keyWords;
            MultipleQueryService.saveSearchKeyWord(keyWords);
            //解决未选地区时，cityInfo为空引起的JS报错 KYEEAPPC-5349
            var cityCode = cityInfo?cityInfo.CITY_CODE:'';
            var cityName = cityInfo?cityInfo.CITY_NAME:'';
            var userType = undefined;
            //超户可以查询到试上线医院
            if(memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.IS_LOGIN)){
                var userInformation = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
                if(undefined != userInformation && null != userInformation && userInformation.USER_TYPE == 1){
                    userType = userInformation.USER_TYPE;
                }
            }
            //发请求时的参数cityCode,cityName 取自缓存
            MultipleQueryService.queryMultipleInfo(userType, cityCode, cityName, keyWords, function (data) {
                $scope.keyWordsValue = keyWords;
                $scope.searchStatus = data.RESULT_TYPE;
                $scope.searchResults = data;
                $scope.currentHosData = MultipleQueryService.currentHosData;
                MultipleQueryService.allCurrentHosData = angular.copy($scope.currentHosData);
                MultipleQueryService.allMetipleInfo = angular.copy(data);
            });
        };


        /**
         * 点击清空搜索历史
         */
        $scope.onClearHistory = function () {
            $scope.searchHistorys = [];
            CacheServiceBus.getStorageCache().set(CACHE_CONSTANTS.STORAGE_CACHE.SEARCH_HISTORIES, $scope.searchHistorys);
        };

        /**
         * 点击清空搜索框
         */
        $scope.clearKeyWords = function () {
            $scope.keyWords.keyWordsValue = '';
            $scope.searchStatus = 1;
            $scope.searchResults = [];
            $scope.currentHosData = [];

        };

        /**
         * 管理本地存储中搜索记录
         * @param keyWords
         */
        function mngStorageCache(keyWords) {
            if ($scope.searchHistorys) {
                if ($scope.searchHistorys.length > searchHistoriesSize) {
                    //pop超出的元素，处理无用处数据
                    var popCount = $scope.searchHistorys.length - searchHistoriesSize;
                    for (var i = 0; i < popCount; i++) {
                        $scope.searchHistorys.pop();
                    }
                }
                //判断本地存储是否包含当前keywords
                var containKeyWordsFlag = false;
                for (var i = 0; i < $scope.searchHistorys.length; i++) {
                    if ($scope.searchHistorys[i] == keyWords) {
                        containKeyWordsFlag = true;
                        break;
                    }
                }
                if (!containKeyWordsFlag) {
                    //本地存储不包含当前关键字
                    if ($scope.searchHistorys.length == searchHistoriesSize) {
                        //缓存只能保持5个历史搜索记录
                        $scope.searchHistorys.pop();
                    }
                    $scope.searchHistorys.unshift(keyWords);
                }
            } else {
                $scope.searchHistorys = [];
                $scope.searchHistorys.unshift(keyWords);
            }
            CacheServiceBus.getStorageCache().set(CACHE_CONSTANTS.STORAGE_CACHE.SEARCH_HISTORIES, $scope.searchHistorys);
        };

        /**
         * 搜索框键盘弹起监听事件
         */
        $scope.onKeyup = function () {
            if (!$scope.keyWords.keyWordsValue.trim()) {
                $scope.searchStatus = 1;
            }
        };

        /**
         * 点击历史搜索记录事件
         * @param item
         */
        $scope.onHistoryClick = function (item) {
            $scope.keyWords.keyWordsValue = item;
            $scope.onSearch();
        };

        /**
         * 点击搜索结果，更新热度信息
         * @param item
         */
        $scope.onSearchResultClick = function (item) {
            //begin KYEEAPPC-5561  gaoyulou  如果点击了疾病信息，则不发送保存热度信息的请求
            if(item.INFO_TYPE != '4'){
                MultipleQueryService.saveSearchHotInfo(item.INFO_MAPPING_ID, item.INFO_TYPE, item.CITY_ID);
            }
            //end KYEEAPPC-5561

            // 切换医院
            changeHospital(item, function () {
                jumpView(item);
            });
        };

        /**
         * 切换医院函数
         * @param data
         */
        var changeHospital = function (data, callBack) {
            var hospitalId = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;
            if (data.HOSPITAL_ID == hospitalId) {
                callBack();
            } else {
                if(data.HOSPITAL_ID){
                    // 切换医院
                    HospitalSelectorService.selectHospital(data.HOSPITAL_ID, data.HOSPITAL_NAME,
                        data.MAILING_ADDRESS, data.PROVINCE_CODE, data.PROVINCE_NAME,
                        data.CITY_CODE, data.CITY_NAME, KyeeI18nService.get("multiple_query.queryInfo", "医院正在切换中..."),
                        function (disableInfo) {
                            //预约挂号禁用权限
                            var hospitalInfo = CacheServiceBus.getStorageCache().get('hospitalInfo');
                            if(hospitalInfo && hospitalInfo.is_home_appoint_enable == '1'){
                                callBack();
                            }else{
                                KyeeMessageService.broadcast({
                                    content:disableInfo
                                });
                            }
                        });
                }else{
                    callBack();
                }
            }
        };

        /**
         * 点击搜索结果跳转页面函数
         * @param data
         */
        var jumpView = function (data) {
            CacheServiceBus.getMemoryCache().set(CACHE_CONSTANTS.MEMORY_CACHE.LAST_APPOINT_ENTRANCE, 1);
            if (data.INFO_TYPE == '1') {
                //转诊标识2转诊  0不转诊
                AppointmentDeptGroupService.IS_REFERRAL = 0;
                //科室
                $state.go("appointment");
            } else if (data.INFO_TYPE == '2') {
                //跳转医生详情
                var deptData = {};
                deptData.DEPT_CODE = data.DEPT_CODE;
                deptData.DEPT_NAME = data.DEPT_NAME;
                deptData.DOCTOR_CODE = data.DOCTOR_CODE;
                deptData.DOCTOR_TITLE = data.DOCTOR_TITLE;
                deptData.DOCTOR_DESC = data.DOCTOR_DESC;
                deptData.DOCTOR_NAME = data.DOCTOR_NAME;
                deptData.HOSPITAL_ID = data.HOSPITAL_ID;
                deptData.HOSPITAL_NAME = data.HOSPITAL_NAME;
                deptData.IS_ONLINE = '0';
                AppointmentDoctorDetailService.doctorInfo = deptData;
                //医生列表的缓存
                AppointmentDeptGroupService.SELECT_DEPTGROUPDATA = deptData;//医生列表的缓存   By  张家豪  KYEEAPPTEST-2933
                $state.go("doctor_info");// 首页搜索模块搜索结果跳转问题   By  张家豪  KYEEAPPTEST-2933
            } else if (data.INFO_TYPE == '3') {
                //跳转医生列表
                var deptData = {};
                deptData.DEPT_CODE = data.DEPT_CODE;
                deptData.DEPT_NAME = data.DEPT_NAME;
                deptData.IS_ONLINE = '0';
                AppointmentDeptGroupService.SELECT_DEPTGROUPDATA = deptData;
                $state.go("appointment_doctor");
            } else if (data.INFO_TYPE == '4') {
                DiseaseInfoQueryService.diseaseName = data.DISEASE_NAME;
                DiseaseInfoQueryService.diseaseId=data.DISEASE_ID;
                //记录页面跳转的路由栈  By 杜巍巍  KYEEAPPC-3927
                MultipleQueryService.ChangeRouter("multiple_query", "multiple_query.disease_info_query");
                MultipleQueryService.historyStack.push('multiple_query');
                $state.go("multiple_query.disease_info_query");
            }
        };

        /**
         * 跳转到疾病列表页面
         */
        $scope.goToDiseaseList = function () {
            DiseaseInfoQueryService.keyWords = $scope.keyWords;
            //记录页面跳转的路由栈  By 杜巍巍  KYEEAPPC-3927
            MultipleQueryService.ChangeRouter("multiple_query", "multiple_query.disease_list_query");
            MultipleQueryService.historyStack.push('multiple_query');
            $state.go("multiple_query.disease_list_query");
        };

        /**
         * 跳转到首页
         */
        $scope.goToHome = function () {
            //记录页面跳转的路由栈  By 杜巍巍  KYEEAPPC-3927
            var customStack = MultipleQueryService.historyStack.pop();

            MultipleQueryService.ChangeRouter($state.current.name, customStack);
            if (customStack == undefined) {
                customStack = "home->MAIN_TAB";
            }
            if (customStack == 'multiple_query') {
                var keyWords = $scope.keyWords.keyWordsValue.trim();
                if (keyWords) {
                    //搜索时，数据未返回，则页面不显示数据
                    if ($scope.searchStatus == 1) {
                        $scope.searchStatus = 4;
                    }
                }
                $timeout(function () {
                    $scope.onSearch();
                }, 200);
            }
            $state.go(customStack);

        };

        //监听物理返回键
        KyeeListenerRegister.regist({
            focus: "multiple_query",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.goToHome();
            }
        });

        //begin by gyl 搜索页面点击物理返回键应该返回上一次进入的页面，而不是直接跳到首页 KYEEAPPC-4055
        //监听医院列表物理返回键
        KyeeListenerRegister.regist({
            focus: "multiple_query.multiple_hospitalInfo",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.goToHome();
            }
        });

        //监听科室列表物理返回键
        KyeeListenerRegister.regist({
            focus: "multiple_query.multiple_deptInfo",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.goToHome();
            }
        });

        //监听医生列表理返回键
        KyeeListenerRegister.regist({
            focus: "multiple_query.multiple_doctorInfo",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.goToHome();
            }
        });

        //监听疾病列表理返回键
        KyeeListenerRegister.regist({
            focus: "multiple_query.disease_list_query",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.goToHome();
            }
        });

        //监听疾病详情理返回键
        KyeeListenerRegister.regist({
            focus: "multiple_query.disease_info_query",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.goToHome();
            }
        });

        //end by gyl KYEEAPPC-4055

        //页面离开之前将搜索关键字放在DiseaseInfoQueryService.keyWords里
        KyeeListenerRegister.regist({
            focus: "multiple_query",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_LEAVE,
            action: function () {
                MultipleQueryService.keyWords = $scope.keyWords;
            }
        });

        //统计进入模块次数  By  章剑飞  KYEEAPPC-4536  2015年12月14日15:54:38
        MultipleQueryService.enterSearch();

    })
    .build();
