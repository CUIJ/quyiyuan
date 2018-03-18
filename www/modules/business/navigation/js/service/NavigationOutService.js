/**
 * 产品名称：quyiyuan.
 * 创建用户：zhangming
 * 日期：2015年6月25日10:04:36
 * 创建原因：院外导航页面服务
 */
new KyeeModule()
    .group("kyee.quyiyuan.navigationOut.service")
    .require([])
    .type("service")
    .name("NavigationOutService")
    .params(["$state", "HttpServiceBus", "CacheServiceBus", "KyeeMessageService","KyeeI18nService"])
    .action(function ($state, HttpServiceBus, CacheServiceBus, KyeeMessageService,KyeeI18nService) {

        var def = {
            hospitalId:undefined,
            /**
             * 获取医院位置
             */
            getHospitalAddress: function (onSuccess) {
                var me = this;
                if(this.hospitalId == undefined || this.hospitalId == '' || this.hospitalId == null){
                    this.hospitalId = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;
                };
                HttpServiceBus.connect({
                    url: 'area/action/AreaHospitalActionImplC.jspx',
                    params: {
                        hospitalID: this.hospitalId,
                        op: "queryHospitalCoordinatesById"
                    },
                    cache : {
                        by : "TIME",
                        value : 60*10
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
                if(window.device && window.device.platform == "iOS"){
                    this.openNavigationOutByIOS();
                } else {
                    this.openNavigationOutByBMap();
                }
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
                this.getHospitalAddress(function (hospitalData) {
                    navigator.map.showMap(
                        function () {},
                        function (){
                            KyeeMessageService.message({
                                content: KyeeI18nService.get("navigation_out.outNavigationFail","院外导航失败！")
                            });
                        },
                        [hospitalData.lng, hospitalData.lat]
                    );
                });
            }
        };
        return def;
    }).build();
