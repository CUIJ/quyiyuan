/**
 * 产品名称：quyiyuan
 * 创建者：刘健
 * 创建时间： 2015/5/5
 * 创建原因：确认预约服务
 * 修改者：
 * 修改原因：
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.callforhelp.callAmbulance.service")
    .require(["kyee.framework.service.message",
        "kyee.quyiyuan.appointment.service",
        "kyee.framework.service.message",
        "kyee.framework.device.network",
        "kyee.quyiyuan.home.service"])
    .type("service")
    .name("CallAmbulanceService")
    .params(["HttpServiceBus", "KyeeMessageService", "CacheServiceBus",
         "$state", "HospitalSelectorService", "HomeService","KyeeI18nService"])
    .action(function (HttpServiceBus, KyeeMessageService, CacheServiceBus,$state,HospitalSelectorService,HomeService,KyeeI18nService) {
        var def = {
            showGetLocationFail: function () {
                KyeeMessageService.message({
                    content: KyeeI18nService.get("nearby_hospital.nearbyHospitalTips","当前没有获取到您的定位信息，请进行其他操作!"),
                    okText: KyeeI18nService.get('commonText.iknowMsg', '我知道了', null)
                });
                $state.go("home->MAIN_TAB");
            },
            //获取经纬度查询
            getUserLocationInfo: function (callBack) {
                if(window.device && window.device.platform == "iOS"){
                    def.localCityByIOS(callBack);
                }else{
                    def.localCityByBMap(callBack);
                }
            },

            /**
             * 通过外壳提供的方法定位
             */
            localCityByIOS: function (callBack) {
                navigator.map.getLatitudeAndLongtitude(
                    function (retVal) {
                        if (retVal.address) {
                            var addressData = {
                                address:retVal.address,
                                latitude:retVal.Latitude,
                                longtitude:retVal.Longtitude
                            }
                            callBack(addressData);
                        }
                    },
                    function (retVal) {
                    },
                    []
                );
            },

            /**
             * 通过内置百度地图定位附近医院
             */
            localCityByBMap: function (callBack) {
                var geolocation = new BMap.Geolocation();

                geolocation.getCurrentPosition(function (r) {

                        var mk = new BMap.Marker(r.point);

                        var myGeo = new BMap.Geocoder();

                        myGeo.getLocation(new BMap.Point(r.point.lng, r.point.lat), function (rs) {

                            if (r.point.lat == undefined || r.point.lat == null || r.point.lat == '' || r.point.lng == undefined || r.point.lng == null || r.point.lng == '') {
                                def.showGetLocationFail();
                            }
                            else {

                                var cityName = rs.addressComponents.city;
                                var cityDistrict = rs.addressComponents.district;
                                var addressData = {
                                    address:rs.address,
                                    cityDistrict:cityDistrict,
                                    latitude:r.point.lat,
                                    longtitude:r.point.lng
                                }
                                if (cityName == "北京市" || cityName == "天津市" || cityName == "上海市" || cityName == "重庆市"){
                                    var point = new BMap.Point(rs.point.lng, rs.point.lat);

                                    var geocoder = new BMap.Geocoder();

                                    geocoder.getLocation(point, function (rss) {
                                        //如果是四大直辖市，则传省份名，取北京，上海。。。
                                        var provinceName = rss.addressComponents.province.substr(0,2);
                                    });
                                }else if(cityName == "咸阳市" && cityDistrict == "杨陵区"){
                                    cityName = "杨凌示范区";
                                }else {
                                }
                            }
                            callBack(addressData);
                        });

                });
            },

            getIMUserInfo: function(callBack){
                HttpServiceBus.connect({
                    url: 'third:userManage/user/accountinfo/get',
                    showLoading: false,
                    params: {},
                    onSuccess: function (retVal) {
                        if (retVal.success) {
                            var userActInfo = retVal.data ;
                            CacheServiceBus.getStorageCache().set(CACHE_CONSTANTS.STORAGE_CACHE.USER_ACT_INFO,userActInfo);
                            callBack(userActInfo);
                        } else {
                            KyeeMessageService.broadcast({
                                content: retVal.message || KyeeI18nService.get("commonText.networkErrorMsg", "网络异常，请稍后重试！"),
                                duration: 2000
                            });
                        }
                    }
                });
            },


            sendInfoToSH:function (params,callBack) {
                HttpServiceBus.connect({
                    url: "third:ambulanceCalling/getPatientInfo",
                    params: {
                        latitude : params.latitude,
                        longitude : params.longitude,
                        adCode : params.placeCode,
                        userId : params.userId,
                        userVsId : params.userVsId,
                        scUserId : params.scUserId,
                        patientName : params.patientName,
                        age : params.age,
                        dateOfBirth : params.dateOfBirth,
                        sex : params.sex,
                        phoneNo : params.phoneNo,
                        idNo :  params.idNo,
                        opVersion: AppConfig.VERSION
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            callBack();
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message || KyeeI18nService.get("commonText.networkErrorMsg", "网络异常，请稍后重试！"),
                                duration: 2000
                            });
                        }
                    }
                });
            },

            queryHelpPhone:function(CITY_CODE,COUNTY_CODE,onSuccess){
                HttpServiceBus.connect({
                    url: "/hospitalInform/action/HospitalinforActionC.jspx",
                    showLoading:false,
                    params: {
                        CITY_CODE:CITY_CODE,
                        COUNTY_CODE:COUNTY_CODE,
                        op: "queryHelpPhoneActionC"
                    },
                    onSuccess: function (data) {
                        onSuccess(data.data);
                    }
                });
            }


        };
        return def;
    })
    .build();

