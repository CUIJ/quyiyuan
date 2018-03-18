/**
 * 自定定位城市，选择城市
 * lufei
 * 时间：2015年5月15日14:41:19
 * 任务号
 */
new KyeeModule()
    .group("kyee.quyiyuan.multiplequery.multiplequerycity.controller")
    .require(["kyee.quyiyuan.multiplequery.multiplequerycity.service"])
    .type("controller")
    .name("MultipleQueryCityController")
    .params(["$scope", "$state", "KyeeMessageService", "HomeService", "$ionicHistory",
        "MultipleQueryCityService", "CacheServiceBus", "$ionicScrollDelegate", "$timeout", "KyeeI18nService", "KyeeListenerRegister"])
    .action(function ($scope, $state, KyeeMessageService, HomeService, $ionicHistory,
                      MultipleQueryCityService, CacheServiceBus, $ionicScrollDelegate, $timeout, KyeeI18nService, KyeeListenerRegister) {
        //显示用户的定位信息，从定位缓存中取
        var storageCache = CacheServiceBus.getStorageCache();
        $scope.currentPosition = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.LOAD_CURRENT_CITY_INFO);

        /**
         * 获取所有的point
         * @type {number}
         */
        $scope.provinceIdx = 0;
        var cityName = undefined;
        var provinceNameNew = undefined;
        var cityCode = undefined;
        var provinceCodeNew = undefined;
        var hosPoint = undefined;
        // $scope.selectPath = ["全国"];
        $scope.selectPath = [KyeeI18nService.get("multiple_city_list.nationWide", "全国")];


        /**
         * 加载城市列表
         * @param provinceIdx
         * @param provinceId
         * @param provinceCode
         * @param provinceName
         */
        $scope.loadCitys = function (provinceIdx, provinceId, provinceCode, provinceName) {
            $scope.selectPath = [provinceName];
            provinceNameNew = provinceName;
            provinceCodeNew = provinceCode;
            $scope.title = provinceNameNew;
            $scope.provinceIdx = provinceIdx;

            $timeout(function () {
                $ionicScrollDelegate.$getByHandle('multipleCityList').scrollTop();
            }, 200);

            MultipleQueryCityService.getCityListData(provinceId, provinceCode, false, function (data) {
                $scope.citys = data;
            });
        };

        /**
         * 获取省份列表信息
         */
        MultipleQueryCityService.getProvinceListData(false, function (data) {
            var storageCache = CacheServiceBus.getStorageCache();
            var selected = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.LAST_PROVINCE_CITY_INFO);
            $scope.provinces = data;
            //确定上次定位城市省份
            if (selected) {
                if (selected.PROVINCE_NAME != undefined && selected.PROVINCE_NAME != '' && selected.PROVINCE_NAME != null) {
                    var notFindProvince = false;
                    angular.forEach(data, function (item, index, items) {
                        if (item.PROVINCE_NAME == selected.PROVINCE_NAME) {
                            notFindProvince = true;
                            $scope.loadCitys(index, item.PROVINCE_ID, item.PROVINCE_CODE, item.PROVINCE_NAME);

                            $timeout(function () {
                                $ionicScrollDelegate.$getByHandle('multipleProvinceList').scrollTo(0, 40 * index, true);
                            }, 200);
                            $scope.title = selected.PROVINCE_NAME;
                        }
                    });
                    /* 如果用户所选的城市，在趣医没有上线的医院并且该城市没在趣医的城市列表中，则显示全国列表  By 杜巍巍 */
                    if (!notFindProvince && data.length) {
                        var item = data[0];
                        $scope.loadCitys(0, item.PROVINCE_ID, item.PROVINCE_CODE, item.PROVINCE_NAME);
                        $timeout(function () {
                            $ionicScrollDelegate.$getByHandle('multipleProvinceList').scrollTo(0, 0, true);
                        }, 200);
                        $scope.title = item.PROVINCE_NAME;
                    }
                }
            } else {
                /**
                 * 如果用户上次没有选择地区，则默认显示在第一个地区，去掉全国列  By 杜巍巍 KYEEAPPC-4683
                 */
                if (data.length) {
                    var item = data[0];
                    $scope.loadCitys(0, item.PROVINCE_ID, item.PROVINCE_CODE, item.PROVINCE_NAME);
                    $timeout(function () {
                        $ionicScrollDelegate.$getByHandle('multipleProvinceList').scrollTo(0, 0, true);
                    }, 200);
                    $scope.title = item.PROVINCE_NAME;
                }
            }
        });

        /**
         * 定位按钮动作，通过百度地图获取当前用户所在城市及省份
         */
        $scope.navigat = function () {

            MultipleQueryCityService.selectDevice(function () {
                $state.go("home->MAIN_TAB");
            });
        };

        /**
         * 点击当前位置更新选择城市信息  By  杜巍巍  KYEEAPPC-4117
         */
        $scope.goCurrentPosition = function (currentPosition) {
            if (!currentPosition) {
                MultipleQueryCityService.selectDevice(function () {
                    currentPosition = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.LOAD_CURRENT_CITY_INFO);
                    updateCurrentPosition(currentPosition);
                });
            } else {
                updateCurrentPosition(currentPosition);
            }

        };

        //更新选择城市信息
        function updateCurrentPosition(currentPosition) {
            cityName = currentPosition.CITY_NAME;
            cityCode = currentPosition.CITY_CODE;
            provinceNameNew = currentPosition.PROVINCE_NAME;
            provinceCodeNew = currentPosition.PROVINCE_CODE;

            if (provinceNameNew == KyeeI18nService.get("multiple_city_list.nationWide", "全国") && currentPosition.PROVINCE_NAME) {
                $scope.getProvinceInfoByCityName();
            } else {
                $scope.setCachProvniceCity();
                MultipleQueryCityService.localCityName();
                if (MultipleQueryCityService.goState) {
                    $state.go(MultipleQueryCityService.goState);

                } else {
                    $state.go("home->MAIN_TAB");
                }
            }
        }

        /**
         * 选择城市动作
         *
         * 全国所有市编码为空问题修改 by 姚斌 KYEEAPPTEST-2726 2015年7月15日10:35:59
         */
        $scope.selectCity = function (city) {
            cityName = city.CITY_NAME;
            cityCode = city.CITY_CODE;

            if (provinceNameNew == KyeeI18nService.get("multiple_city_list.nationWide", "全国") && city.PROVINCE_NAME) {
                $scope.getProvinceInfoByCityName();
            } else {
                $scope.setCachProvniceCity();
                MultipleQueryCityService.localCityName();
                if (MultipleQueryCityService.goState) {
                    $state.go(MultipleQueryCityService.goState);
                } else {
                    $state.go("home->MAIN_TAB");
                }
            }
        };

        /**
         * 获取详细信息，并存入缓存
         */
         $scope.getProvinceInfoByCityName = function () {
            MultipleQueryCityService.getCityInfoByName(cityName, function (data) {
                //接口规范后处理  By  章剑飞   KYEEAPPC-3420
                if (data.length > 0) {
                    provinceNameNew = data[0].PROVINCE_NAME;
                    cityName = data[0].CITY_NAME;
                    cityCode = data[0].CITY_CODE;
                    provinceCodeNew = data[0].PROVINCE_CODE;
                } else {
                    cityCode = '0000000';
                    //选择城市下所有市改为所有医院 KYEEAPPC-5215
                    cityName = KyeeI18nService.get("multiple_city_list.allCity", "所有医院");
                    provinceCodeNew = '0000000';
                    provinceNameNew = KyeeI18nService.get("multiple_city_list.nationWide", "全国");
                }
                $scope.setCachProvniceCity();
                MultipleQueryCityService.localCityName();
                //如果用户切换城市选择的是全国下的所有市或具体市，跳回所选城市下的医院列表  By 杜巍巍
                if (MultipleQueryCityService.goState) {
                    $state.go(MultipleQueryCityService.goState);

                } else {
                    $state.go("home->MAIN_TAB");
                }
            });
        };

        /**
         * 缓存中存储上一次选择省份和城市名称
         */
        $scope.setCachProvniceCity = function () {
            var storageCache = CacheServiceBus.getStorageCache();
            var result = {
                CITY_NAME: cityName,
                CITY_CODE: cityCode,
                PROVINCE_NAME: provinceNameNew,
                PROVINCE_CODE: provinceCodeNew
            };
            storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.LAST_PROVINCE_CITY_INFO, result);
        };

        //返回键
        $scope.back = function () {
            if (MultipleQueryCityService.cityNotSelect) {
                $ionicHistory.goBack(-2);
            } else {
                $ionicHistory.goBack();
            }
        };
        //监听物理返回键  By  章剑飞
        KyeeListenerRegister.regist({
            focus: "multiple_city_list",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.back();
            }
        });

        //离开页面清空标识  By  章剑飞  KYEEAPPTEST-3161
        KyeeListenerRegister.regist({
            focus: "multiple_city_list",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_LEAVE,
            direction: "both",
            action: function (params) {
                MultipleQueryCityService.cityNotSelect = false;
                if (params.to != 'hospital_selector') {
                    HomeService.isFromAppoint = undefined;
                }
            }
        });
    })
    .build();