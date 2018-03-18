/**
 * 产品名称：quyiyuan.
 * 创建用户：zhangming
 * 日期：2015年12月15日10:04:36
 * 创建原因：KYEEAPPC-4524调用第三方地图客户端
 */
new KyeeModule()
    .group("kyee.quyiyuan.outNavigation.service")
    .require(["kyee.framework.service.baidumap"])
    .type("service")
    .name("OutNavigationService")
    .params(["$state", "HttpServiceBus", "CacheServiceBus", "KyeeMessageService","KyeeBDMapService"])
    .action(function ($state, HttpServiceBus, CacheServiceBus, KyeeMessageService,KyeeBDMapService) {

        var def = {
            hospitalId: undefined,
            /**
             * 获取医院位置
             */
            getHospitalAddress: function (onSuccess) {
                var me = this;
                if (this.hospitalId == undefined || this.hospitalId == '' || this.hospitalId == null) {
                    this.hospitalId = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;
                }
                HttpServiceBus.connect({
                    url: 'area/action/AreaHospitalActionImplC.jspx',
                    params: {
                        hospitalID: this.hospitalId,
                        op: "queryHospitalCoordinatesById"
                    },
                    cache: {
                        by: "TIME",
                        value: 60 * 10
                    },
                    onSuccess: function (data) {
                        var endpoint = {
                            lng: data.data[0].LONGITUDE,
                            lat: data.data[0].LATITUDE
                        }
                        onSuccess(endpoint);
                    }
                });
            },

            /**
             * 打开院外导航页面
             */
            openNavigationOut: function () {
                if (window.device && window.device.platform == "iOS") {
                    this.openNavigationOutByIOS();
                }else if (window.device && window.device.platform == "Android") {
                    this.openThirdMapClient();
                } else {
                    this.openNavigationOutByBMap();
                }
            },
            /**
             *  KYEEAPPC-4524调用第三方地图客户端    张明
             *调用安卓第三方导航地图客户端
             */
            openThirdMapClient: function () {
                this.getHospitalAddress(function (endpoint) {
                    var params = [endpoint.lat, endpoint.lng];
                    KyeeBDMapService.getCurrentPosition(
                        function (location) {
                            KyeeBDMapService.startNavigation(
                                function (success) {
                                    if (success == "JSMap") { //用户手机没有安装百度或者高德地图客户端
                                        def.openNavigationOutByBMap();
                                    } else {
                                        def.hospitalId = undefined;
                                    }
                                },
                                function (error) {
                                    def.openNavigationOutByBMap();
                                },
                                [location.latitude, location.longitude, params[0], params[1]]
                            );
                        },
                        function (err) {
                        }
                    );
                });
            },
            /**
             * 使用百度地图网页版打开院外导航页面
             */
            openNavigationOutByBMap: function () {
                $state.go("navigation_out");
            },

            /**
             * 使用IOS外壳打开院外导航页面
             */
            openNavigationOutByIOS: function () {
                var me = this;
                this.getHospitalAddress(function (hospitalData) {
                    navigator.map.showMap(
                        function () {
                        },
                        function () {
                            KyeeMessageService.message({
                                content: "院外导航失败！"
                            });
                        },
                        [hospitalData.lng, hospitalData.lat]
                    );
                    me.hospitalId = undefined;
                });
            }

        };
        return def;
    }).build();
