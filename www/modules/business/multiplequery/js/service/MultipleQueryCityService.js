/**
 * 产品名称：quyiyuan.
 * 创建用户：姚斌
 * 日期：2015年5月12日20:06:25
 * 创建原因：城市选择服务
 */
new KyeeModule()
    .group("kyee.quyiyuan.multiplequery.multiplequerycity.service")
    .require([])
    .type("service")
    .name("MultipleQueryCityService")
    .params(["HttpServiceBus", "CacheServiceBus", "KyeeEnv", "KyeeMessageService", "KyeeI18nService", "$filter","$rootScope"])
    .action(function (HttpServiceBus, CacheServiceBus, KyeeEnv, KyeeMessageService, KyeeI18nService, $filter,$rootScope) {

        var def = {
            loadingCityInformation: undefined,
            /**
             * 查询省份列表
             */
            getProvinceListData: function (isLoading, onSuccess) {

                var provinceList = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.PROVINCE_LIST);
                //用户类型：1:超级用户 0:普通用户
                var userType = "";
                var userRecord = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
                var groupHosFlag=CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.GROUP_HOSPITAL_FLAG);
                if (userRecord != undefined && userRecord != null) {
                    userType = userRecord.USER_TYPE;
                }
                if (!isLoading && provinceList) {
                    if(userType != '1'){
                        var type = 1;//0:过滤城市列表1：过滤省份列表
                        provinceList = def.filterUserCity(userRecord,userType,provinceList,type,null,null);
                    }
                    onSuccess(provinceList);
                    return;
                }

                HttpServiceBus.connect({
                    url: "/area/action/AreaHospitalActionImplC.jspx",
                    params: {
                        op: "queryProvince",
                        USER_TYPE: '1',
                        GROUP_HOSPITAL_FLAG:groupHosFlag
                    },
                    showLoading: !isLoading,
                    onSuccess: function (data) {
                        CacheServiceBus.getMemoryCache().set(CACHE_CONSTANTS.MEMORY_CACHE.PROVINCE_LIST, data);
                        if (!isLoading) {
                            if(userType != '1'){
                                var type = 1;//0:过滤城市列表1：过滤省份列表
                                data = def.filterUserCity(userRecord,userType,data,type,null,null);
                            }
                            onSuccess(data);
                        }
                    }
                });
            },

            /**
             * 查询城市列表
             */
            getCityListData: function (provinceId, provinceCode, isLoading, onSuccess) {
                var cityList = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CITY_LIST);
                //选择城市下所有市改为所有医院 KYEEAPPC-5215
                var firstCity = {
                    HOSPITAL_ACCOUNT:0,
                    CITY_ID:0,
                    PROVINCE_ID:0,
                    CITY_CODE:provinceCode,
                    CITY_NAME:'所有医院',
                    SORT_CODE:0
                };

                //用户类型：1:超级用户 0:普通用户
                var userType = "";
                var userRecord = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
                var groupHosFlag=CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.GROUP_HOSPITAL_FLAG);
                if (userRecord != undefined && userRecord != null) {
                    userType = userRecord.USER_TYPE;
                }

                //如果isLoading为true，则直接请求后台，更新缓存
                if (!isLoading && cityList) {
                    //根据用户类型过滤省份列表
                    if(userType != '1'){
                        var type = 0;//0:过滤城市列表1：过滤省份列表
                        cityList = def.filterUserCity(userRecord,userType,cityList,type,provinceId,provinceCode);
                    }
                    //如果缓存有就不再请求
                    if (provinceId != "0" && "0000000" != provinceCode) {
                        cityList = $filter('filter')(cityList, {PROVINCE_CODE: provinceCode});
                        cityList.unshift(firstCity);//过滤后把所有医院放在首位置
                    }
                    onSuccess(cityList);
                    return;
                }

                HttpServiceBus.connect({
                    url: "/area/action/AreaHospitalActionImplC.jspx",
                    params: {
                        op: "queryCity",
                        PROVINCE_ID: '0',
                        PROVINCE_CODE: '0000000',
                        USER_TYPE: '1',
                        GROUP_HOSPITAL_FLAG:groupHosFlag
                    },
                    showLoading: !isLoading,
                    onSuccess: function (data) {
                        CacheServiceBus.getMemoryCache().set(CACHE_CONSTANTS.MEMORY_CACHE.CITY_LIST, data);
                        if (!isLoading) {
                            //根据用户类型过滤省份列表
                            if(userType != '1'){
                                var type = 0;//0:过滤城市列表1：过滤省份列表
                                data = def.filterUserCity(userRecord,userType,data,type,provinceId,provinceCode);
                            }
                            if (provinceId != "0" && "0000000" != provinceCode) {
                                data = $filter('filter')(data, {PROVINCE_CODE: provinceCode});
                                data.unshift(firstCity);
                            }
                            onSuccess(data);
                        }
                    }
                });
            },
            /**
             * 城市、省份列表处理 KYEEAPPTEST-4400
             */
            filterUserCity: function (userRecord,userType,TempList,type,provinceId,provinceCode){
                var list = angular.copy(TempList);
                var userId='';
                if(userRecord){
                    userId = userRecord.USER_ID;
                }
                var hospitalAddList = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.USER_TEMP_HOSPITAL);
                //非超户、个性化、用户id不能为空、用户可访问的试上线医院数据不能为空
                if(userType != '1'&&userId!=''&&userId!=undefined&&userId!=null&&hospitalAddList&&hospitalAddList.length>0){
                    //判断试上线医院对应的省市是否状态为2，如果为2，则设置为1
                    if(hospitalAddList&&hospitalAddList.length>0){
                        for(var i=0;i<hospitalAddList.length;i++){
                            var userCityCode =hospitalAddList[i].CITY_CODE;
                            var userProvinceCode =hospitalAddList[i].PROVINCE_CODE;
                            var listStatusTwo = [];
                            if(type==1){
                                listStatusTwo = $filter('filter')(list, {STATUS:'2',PROVINCE_CODE:userProvinceCode});
                            }else{
                                if (provinceId != "0" && "0000000" != provinceCode&&provinceCode==userProvinceCode){
                                    listStatusTwo = $filter('filter')(list, {STATUS:'2',PROVINCE_CODE:userProvinceCode,CITY_CODE:userCityCode});
                                }else{
                                    listStatusTwo = [];
                                }
                            }
                            if(listStatusTwo&&listStatusTwo.length>0){
                                //将列表的相应状态修改为1
                                for(var j=0;j<list.length;j++){
                                    if(type==1){
                                        if(list[j].PROVINCE_CODE==userProvinceCode){
                                            list[j].STATUS = '1';
                                            break;
                                        }
                                    }else{
                                        if(list[j].CITY_CODE==userCityCode&&list[j].PROVINCE_CODE==userProvinceCode){
                                            list[j].STATUS = '1';
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                list = $filter('filter')(list, {STATUS:'1'});
                return list
            },

            /**
             * 根据城市名称查询城市的相关信息
             * @param cityName
             * @param onSuccess
             */
            getCityInfoByName: function (cityName, onSuccess) {
                HttpServiceBus.connect({
                    url: "/area/action/AreaHospitalActionImplC.jspx",
                    showLoading: false,
                    params: {
                        op: "queryCityByName",
                        cityName: cityName
                    },
                    onSuccess: function (data) {
                        //接口规范处理  By  章剑飞   KYEEAPPC-3420
                        if (data.success) {
                            onSuccess(data.data.rows);

                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message
                            });
                        }
                    }
                });
            },
            queryShowHelp:function(CITY_CODE,COUNTY_CODE,onSuccess){
                HttpServiceBus.connect({
                    url: "/hospitalInform/action/HospitalinforActionC.jspx",
                    showLoading:false,
                    params: {
                        CITY_CODE:CITY_CODE,
                        COUNTY_CODE:COUNTY_CODE,
                        op: "queryShowHelpActionC"
                    },
                    onSuccess: function (data) {
                        onSuccess(data.data);
                    }
                });
            },

            /**
             * 定位并且更新城市名称
             */
            localCityName: function (notShowLoading,callBack) {
                var storageCache = CacheServiceBus.getStorageCache();
                var selected = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.LAST_PROVINCE_CITY_INFO);
                var cityNameTxt = undefined;
                if (selected && selected.LOCAL_TYPE != 0) {
                    cityNameTxt = selected.CITY_NAME;
                    //主页搜索模块国际化改造  By  杜巍巍    KYEEAPPC-3927
                    //选择城市下所有市改为所有医院 KYEEAPPC-5215
                    if (cityNameTxt == KyeeI18nService.get("multiple_city_list.allCity", "所有医院")) {
                        cityNameTxt = selected.PROVINCE_NAME;
                    }
                    this.changePageCityName(cityNameTxt);
                    //判断用户首次进来有没有LOAD_CURRENT_CITY_INFO缓存信息，如果有显示上次定位城市，再去重新定位，更新后替换上次定位信息
                    if (storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.LOAD_CURRENT_CITY_INFO) == "" || storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.LOAD_CURRENT_CITY_INFO) == undefined
                        || storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.LOAD_CURRENT_CITY_INFO) == null) {
                        this.selectDevice(undefined, function (result) {
                            KyeeEnv.ROOT_SCOPE.currentCityName = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.LOAD_CURRENT_CITY_INFO).CITY_NAME;
                            if(callBack){
                                callBack();
                            }
                        },notShowLoading);
                    } else {
                        KyeeEnv.ROOT_SCOPE.currentCityName = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.LOAD_CURRENT_CITY_INFO).CITY_NAME;
                        this.selectDevice(undefined, function (result) {
                            KyeeEnv.ROOT_SCOPE.currentCityName = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.LOAD_CURRENT_CITY_INFO).CITY_NAME;
                            if(callBack){
                                callBack();
                            }
                        },notShowLoading);
                    }
                } else {
                    // 初始化定位信息
                    KyeeEnv.ROOT_SCOPE.localCityName = KyeeI18nService.get("multiple_city_list.city", "城市");
                    this.selectDevice(function (result) {
                        KyeeEnv.ROOT_SCOPE.currentCityName = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.LOAD_CURRENT_CITY_INFO).CITY_NAME;
                        if(callBack){
                            callBack();
                        }
                    },undefined,notShowLoading);
                }
            },



            /**
             * 判断是android或者是ios
             */
            selectDevice: function (callBack, beforeNotStorage,notShowLoading) {
                if(!notShowLoading){
                    KyeeMessageService.loading({mask: false});
                }
                if (window.device && window.device.platform == "iOS") {
                    this.localCityByIOS(callBack, beforeNotStorage);
                } else {
                    this.localCityByBMap(callBack, beforeNotStorage);
                }
            },

            /**
             * 通过内置百度地图定位
             */
            localCityByBMap: function (callBack, beforeNotStorage) {
                var geolocation = new BMap.Geolocation();
                var me = this;
                geolocation.getCurrentPosition(function (r) {
                    if (this.getStatus() == BMAP_STATUS_SUCCESS) {
                        var mk = new BMap.Marker(r.point);
                        var myGeo = new BMap.Geocoder();
                        myGeo.getLocation(new BMap.Point(r.point.lng, r.point.lat), function (rs) {
                            var cityNameTxt = rs.addressComponents.city;
                            //取得定位的区
                            var districtTxt = rs.addressComponents.district;
                            //主页搜索模块国际化改造  By  杜巍巍    KYEEAPPC-3927
                            if (cityNameTxt == KyeeI18nService.get("multiple_city_list.Beijing", "北京市") ||
                                cityNameTxt == KyeeI18nService.get("multiple_city_list.TianJing", "天津市") ||
                                cityNameTxt == KyeeI18nService.get("multiple_city_list.ShangHai", "上海市") ||
                                cityNameTxt == KyeeI18nService.get("multiple_city_list.ChongQing", "重庆市")) {
                                var point = new BMap.Point(rs.point.lng, rs.point.lat);
                                var geocoder = new BMap.Geocoder();
                                geocoder.getLocation(point, function (rss) {
                                    me.queryCityByName(rss.addressComponents.district, districtTxt, callBack, beforeNotStorage);
                                });
                            }else if(cityNameTxt.city == "咸阳市" && cityNameTxt.district == "杨陵区"){
                                cityNameTxt.city = "杨凌示范区";
                                me.queryCityByName(cityNameTxt, districtTxt, callBack, beforeNotStorage);
                            } else {
                                me.queryCityByName(cityNameTxt, districtTxt, callBack, beforeNotStorage);
                            }
                        });
                    }
                });
            },

            /**
             * 通过外壳提供的方法定位
             */
            localCityByIOS: function (callBack, beforeNotStorage) {
                var me = this;
                navigator.map.getCityName(
                    function (retVal) {
                        if (retVal) {
                            me.queryCityByName(retVal, false,callBack, beforeNotStorage);
                        }
                    },
                    function (retVal) {
                    },
                    []
                );
            },

            /**
             * 根据城市名称查询城市信息
             * @param cityNameTxt
             */
            queryCityByName: function (cityNameTxt, districtTxt, callBack, beforeNotStorage) {
                var cityName = undefined;
                var cityCode = undefined;
                var provinceNameNew = undefined;
                var provinceCodeNew = undefined;

                this.getCityInfoByName(cityNameTxt, function (data) {
                    //接口规范后处理  By  章剑飞   KYEEAPPC-3420
                    if (data.length > 0) {
                        provinceNameNew = data[0].PROVINCE_NAME;
                        cityName = data[0].CITY_NAME;
                        cityCode = data[0].CITY_CODE;
                        provinceCodeNew = data[0].PROVINCE_CODE;
                    } else {
                        cityName = cityNameTxt;
                        cityCode = '0000000';
                        provinceNameNew = KyeeI18nService.get("multiple_city_list.nationWide", "全国");
                        provinceCodeNew = '0000000';
                    }
                    var storageCache = CacheServiceBus.getStorageCache();
                    var placeCodes = CITY_DATA_4_CITY_PICKER.areas[cityCode];
                    //区编码
                    var placeCode = "";
                    //区名字
                    var placeName = "";
                    if(districtTxt && placeCodes){
                        for(var i = 0; i < placeCodes.length; i++){
                            if(districtTxt == placeCodes[i].text){
                                placeCode = placeCodes[i].value;
                                placeName = districtTxt;
                            }
                        };
                    }
                    var result = {
                        CITY_NAME: cityName,
                        CITY_CODE: cityCode,
                        PROVINCE_NAME: provinceNameNew,
                        PROVINCE_CODE: provinceCodeNew,
                        PLACE_NAME: placeName,
                        PLACE_CODE: placeCode,
                        LOCAL_TYPE: 0
                    };
                    /*def.queryShowHelp(result.CITY_CODE, function (data) {
                        $rootScope.showHelpAtOnce = data;
                    })*/

                    if (beforeNotStorage) {
                        //如果用户非第一次登陆，再去实时定位，把定位信息写入缓存中，用于显示新的定位信息
                        storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.LOAD_CURRENT_CITY_INFO, result);
                        beforeNotStorage(result);
                        KyeeMessageService.hideLoading();
                        return;
                    }
                    storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.LAST_PROVINCE_CITY_INFO, result);
                    //用户首次登录的定位信息存起来
                    storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.LOAD_CURRENT_CITY_INFO, result);
                    //def.loadingCityInformation =storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.LAST_PROVINCE_CITY_INFO);
                    KyeeMessageService.hideLoading();
                    if (callBack) {
                        callBack();
                    }
                });
                if (!beforeNotStorage) {
                    this.changePageCityName(cityNameTxt);
                }
            },

            /**
             * 修改rootscope中城市的名称
             * @param cityNameTxt
             */
            changePageCityName: function (cityNameTxt) {
                if (cityNameTxt) {
                    if (cityNameTxt.length > 7) {
                        cityNameTxt = cityNameTxt.substring(0, 5);
                        KyeeEnv.ROOT_SCOPE.localCityName = cityNameTxt + "...";
                    } else {
                        KyeeEnv.ROOT_SCOPE.localCityName = cityNameTxt;
                    }
                }
            }
        };

        return def;
    })
    .build();
