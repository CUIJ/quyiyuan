/**
 * 产品名称：quyiyuan
 * 创建者：杜巍巍
 * 创建时间：2015年8月6日
 * 创建原因：附近医院service
 */
new KyeeModule()
    .group("kyee.quyiyuan.nearbyHospital.service")
    .require([
        "kyee.framework.service.message",
        "kyee.framework.device.network",
        "kyee.quyiyuan.home.service"
    ])
    .type("service")
    .name("NearbyHospitalService")
    .params(["HttpServiceBus", "$state", "CacheServiceBus", "KyeeMessageService", "HospitalSelectorService", "HomeService","KyeeI18nService"])
    .action(function (HttpServiceBus, $state, CacheServiceBus, KyeeMessageService, HospitalSelectorService, HomeService,KyeeI18nService) {
        var def = {
            address:"",
            cityName:"",
            lastqueryTimeStamp:undefined,
            showGetLocationFail: function () {
                KyeeMessageService.message({
                    content: KyeeI18nService.get("nearby_hospital.nearbyHospitalTips","当前没有获取到您的定位信息，请进行其他操作!"),
                    okText: KyeeI18nService.get('commonText.iknowMsg', '我知道了', null)
                });
                $state.go("home->MAIN_TAB");
            },
            //获取经纬度查询附近医院
            getNearHospitalInfo: function (callBack) {
                if (window.device && window.device.platform == "iOS") {
                    this.localCityByIOS(callBack);
                }
                else {
                    this.localCityByBMap(callBack);
                }
            },

            //通过ios地图插件查询
            localCityByIOS: function (callBack) {
                navigator.map.getCityName(
                    function (cityName) {

                        if (cityName) {
                            def.cityName = cityName;
                            navigator.map.getLatitudeAndLongtitude(
                                function (retVal) {
                                    if(retVal.address){
                                        def.address = retVal.address;
                                    }
                                    if (retVal && retVal.Latitude && retVal.Longtitude) {
                                        if (cityName == "北京市" || cityName == "天津市" || cityName == "上海市" || cityName == "重庆市"){
                                            var provinceName = cityName.substr(0,2);
                                            def.sendHospitalInfo(provinceName,'', rs.point.lat, rs.point.lng, callBack);
                                        }
                                        else{
                                            def.sendHospitalInfo('',cityName, retVal.Latitude, retVal.Longtitude, callBack);
                                        }
                                    }
                                    else {
                                        def.showGetLocationFail();
                                    }
                                },
                                function (error) {
                                    def.showGetLocationFail();
                                }, []
                            );
                        }
                    },
                    function (error) {
                        def.showGetLocationFail();
                    }, []);
            },
            /**
             * 通过内置百度地图定位附近医院
             */
            localCityByBMap: function (callBack) {
                var geolocation = new BMap.Geolocation();

                geolocation.getCurrentPosition(function (r) {
                    if (this.getStatus() == BMAP_STATUS_SUCCESS) {

                        var mk = new BMap.Marker(r.point);

                        var myGeo = new BMap.Geocoder();

                        myGeo.getLocation(new BMap.Point(r.point.lng, r.point.lat), function (rs) {

                            if (r.point.lat == undefined || r.point.lat == null || r.point.lat == '' || r.point.lng == undefined || r.point.lng == null || r.point.lng == '') {
                                def.showGetLocationFail();
                            }
                            else {

                                var cityName = rs.addressComponents.city;
                                def.cityName = rs.addressComponents.city;
                                var cityDistrict = rs.addressComponents.district;
                                if(rs.address){
                                    def.address = rs.address;
                                }

                                if (cityName == "北京市" || cityName == "天津市" || cityName == "上海市" || cityName == "重庆市"){
                                    var point = new BMap.Point(rs.point.lng, rs.point.lat);

                                    var geocoder = new BMap.Geocoder();

                                    geocoder.getLocation(point, function (rss) {
                                        //如果是四大直辖市，则传省份名，取北京，上海。。。
                                        var provinceName = rss.addressComponents.province.substr(0,2);
                                        def.sendHospitalInfo(provinceName,'', rs.point.lat, rs.point.lng, callBack);
                                    });
                                }else if(cityName == "咸阳市" && cityDistrict == "杨陵区"){
                                     cityName = "杨凌示范区";
                                     def.sendHospitalInfo('',cityName, rs.point.lat, rs.point.lng, callBack);
                                }else if(cityName =="吐鲁番地区"){
                                    cityName = "吐鲁番市";
                                    def.sendHospitalInfo('',cityName, rs.point.lat, rs.point.lng, callBack);
                                } else {
                                    def.sendHospitalInfo('',cityName, rs.point.lat, rs.point.lng, callBack);
                                }
                            }
                        });
                    }
                });
            },


            //向后台查询附近医院
            sendHospitalInfo: function (provinceName,cityName, lat, lng, callBack) {
                var me = this;
                var userType = "";
                var userRecord = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
                if (userRecord != undefined && userRecord != null) {
                    userType = userRecord.USER_TYPE;
                }
                var memoryCache = CacheServiceBus.getMemoryCache();
                var operateUserSource = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE);
                HttpServiceBus.connect({
                    url: "/area/action/AreaHospitalActionImplC.jspx",
                    params: {
                        op: "querySurroundingHospital",
                        provinceName:provinceName,
                        cityName: cityName,
                        longitude: lng,
                        latitude: lat,
                        userType: userType,
                        operateUserSource: operateUserSource
                    },
                    onSuccess: function (resp) {
                        var success = resp.success;
                        var data = resp.data;
                        if (success && data) {
                            if(AppConfig.BRANCH_VERSION=="54"){//健康马鞍山
                                if(cityName=="马鞍山市"){
                                    me.dealData(data);
                                    callBack(data);
                                }else{
                                    KyeeMessageService.broadcast({
                                        content: "该地区未查询到上线医院"
                                    });
                                }

                            }else{
                                me.dealData(data);
                                callBack(data);
                            }
                        } else {
                            KyeeMessageService.broadcast({
                                content: resp.message
                            });
                        }

                    }
                });
            },
            //向后台查询附近医院
            saveClickCount: function (hospitalID) {
                HttpServiceBus.connect({
                    url: "/area/action/AreaHospitalActionImplC.jspx",
                    params: {
                        op: "updateHospitalVistCount",
                        hospitalID:hospitalID
                    },
                    onSuccess: function (resp) {
                        if (!resp.success) {
                            KyeeMessageService.broadcast({
                                content: resp.message
                            });
                        }
                    }
                });
            },
            //处理过长的科室
            dealData: function (data) {
                for (var i=0; i < data.NEARBY.length; i++) {
                    if(data.NEARBY[i].DEPT_NAME && data.NEARBY[i].DEPT_NAME.length>35){
                        data.NEARBY[i].DEPT_NAME = data.NEARBY[i].DEPT_NAME.substr(0, 35) + '...';
                    }
                }
            }
        };
        return def;
    })
    .build();
