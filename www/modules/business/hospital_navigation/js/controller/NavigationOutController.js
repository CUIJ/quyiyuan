/**
 * 产品名称：quyiyuan
 * 创建者：卢飞
 * 创建时间： 2015年5月8日10:41:05
 * 创建原因：医院导航控制器
 * 修改者：吴伟刚
 * 修改原因：KYEEAPPC-4523 院外导航静态导航(步行、公交、驾车三种)
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.outNavigation.controller")
    .require(["kyee.quyiyuan.outNavigation.service", "kyee.framework.service.message"])
    .type("controller")
    .name("OutNavigationController")
    .params(["$scope", "$state", "KyeeViewService", "CacheServiceBus", "OutNavigationService", "KyeeMessageService",
        "KyeeListenerRegister", "KyeeBDMapService","KyeeI18nService","$ionicHistory"])
    .action(function ($scope, $state, KyeeViewService, CacheServiceBus, OutNavigationService, KyeeMessageService,
                      KyeeListenerRegister, KyeeBDMapService,KyeeI18nService,$ionicHistory) {

        var hosPoint = undefined;//医院所在地点
        var currentPoint = undefined;//用户所在地点
        var dis = undefined;//距离
        var map = undefined;//百度地图
        var cfgMessage = {
            content: ''
        };
        $scope.isShow = true;

        KyeeListenerRegister.regist({
            focus: "navigation_out",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_LEAVE,
            direction: "both",
            action: function (params) {
                OutNavigationService.hospitalId = undefined;
            }
        });

        /**
         * 向百度地图发送请求绘制地图
         */
        $scope.showPage = function () {
            $scope.selected = 0;
            $scope.isShowBtns = true;
            OutNavigationService.getHospitalAddress(function (hospitalData) {
                KyeeMessageService.loading();
                var mi = this;
                var geolocation = new BMap.Geolocation();
                hosPoint = new BMap.Point(hospitalData.lng, hospitalData.lat);
                if (window.device && device.platform == "Android") {
                    KyeeBDMapService.getCurrentPosition($scope.getCurrentPointFunction);
                } else {
                    geolocation.getCurrentPosition($scope.getCurrentPointFunction, {
                        enableHighAccuracy: true,
                        racy: 200
                    });
                }
                //加载map至页面
                map = new BMap.Map("l-map");
                map.centerAndZoom(hosPoint, 12);
            });
        };

        /**
         * 获取当前位置信息成功回调方法
         * @param r
         */
        $scope.getCurrentPointFunction = function (r) {
            var city = "";
            if (window.device && device.platform == "Android") {
                currentPoint = new BMap.Point(r.longitude, r.latitude);
                city = r.city;
            } else {
                currentPoint = r.point;
                city = r.address.city;
            }
            var geocoder = new BMap.Geocoder();
            geocoder.getLocation(hosPoint, function (rs) {
                if (city != rs.addressComponents.city) {
                    KyeeMessageService.hideLoading();
                    var cfg = {
                        content: KyeeI18nService.get('navigation_out.InfoMsg','您与医院不在同一个城市，是否继续导航？'),
                        onSelect: function (isSam) {
                            if (isSam) {
                                KyeeMessageService.loading();
                                $scope.findMore();
                            } else {
                                $scope.cancelBtn();
                                $ionicHistory.goBack();
                            }
                        }
                    };
                    KyeeMessageService.confirm(cfg);
                } else {
                    $scope.findByBus();
                }
            });
        };

        /**
         * 出现异常时，取消右上角的附近医院和院外导航按钮
         */
        $scope.cancelBtn = function () {
            $scope.isShow = false;
        };

        /**
         * 公交导航函数
         * @param point
         * @param endpoint
         * @param map
         */
        $scope.findByBus = function () {
            //BMAP_STATUS_SUCCESS	检索成功。对应数值“0”。
            //BMAP_STATUS_CITY_LIST	城市列表。对应数值“1”。
            //BMAP_STATUS_UNKNOWN_LOCATION	位置结果未知。对应数值“2”。
            //BMAP_STATUS_UNKNOWN_ROUTE	导航结果未知。对应数值“3”。
            //BMAP_STATUS_INVALID_KEY	非法密钥。对应数值“4”。
            //BMAP_STATUS_INVALID_REQUEST	非法请求。对应数值“5”。
            //BMAP_STATUS_PERMISSION_DENIED	没有权限。对应数值“6”。(自 1.1 新增)
            //BMAP_STATUS_SERVICE_UNAVAILABLE	服务不可用。对应数值“7”。(自 1.1 新增)
            //BMAP_STATUS_TIMEOUT	超时。对应数值“8”。(自 1.1 新增)
            $scope.selected = 0;
            map.clearOverlays();
            var transit = new BMap.TransitRoute(map, {
                renderOptions: {map: map, panel: "r-result", autoViewport: true}, onSearchComplete: function (result) {
                    if (transit.getStatus() != BMAP_STATUS_SUCCESS) {
                        cfgMessage.content = KyeeI18nService.get('navigation_out.navigationFailure','导航失败，请选择其他方式');
                        KyeeMessageService.broadcast(cfgMessage);
                        $scope.cancelBtn();
                    }
                    KyeeMessageService.hideLoading();
                }
            });
            transit.search(currentPoint, hosPoint);
        };

        /**
         * 当离目标坐标距离小于1000米时，采用步行导航的方式
         * @param point
         * @param endpoint
         * @param map
         */
        $scope.findByFoot = function () {
            $scope.selected = 1;
            map.clearOverlays();
            var walkingRoute = new BMap.WalkingRoute(map, {
                renderOptions: {map: map, panel: "r-result", autoViewport: true}, onSearchComplete: function (result) {
                    if (walkingRoute.getStatus() != BMAP_STATUS_SUCCESS) {
                        cfgMessage.content = KyeeI18nService.get('navigation_out.navigationFail','导航失败，请选择其他方式');//吴伟刚 KYEEAPPC-4573 院外导航国际化
                        KyeeMessageService.broadcast(cfgMessage);
                        $scope.cancelBtn();
                    }
                    KyeeMessageService.hideLoading();
                }
            });
            walkingRoute.search(currentPoint, hosPoint);
        };

        $scope.findByCar = function () {
            $scope.selected = 2;
            map.clearOverlays();
            var drivingRoute = new BMap.DrivingRoute(map, {
                renderOptions: {map: map, panel: "r-result", autoViewport: true}, onSearchComplete: function (result) {
                    if (drivingRoute.getStatus() != BMAP_STATUS_SUCCESS) {
                        cfgMessage.content = KyeeI18nService.get('navigation_out.navigationFail','导航失败，请选择其他方式');
                        KyeeMessageService.broadcast(cfgMessage);
                    }
                    KyeeMessageService.hideLoading();
                }
            });
            drivingRoute.search(currentPoint, hosPoint);
        };

        /**
         * 当患者与所选医院不在同一个城市时的导航方式
         * @param point
         * @param endpoint
         * @param map
         */
        $scope.findMore = function () {
            $scope.isShowBtns = false;
            $scope.findByCar();
        };

        /**
         * 附近医院
         */
        $scope.onNearByTap = function () {
            $scope.isShowBtns = false;
            KyeeMessageService.loading();
            if (currentPoint == undefined || currentPoint == null || currentPoint == 'null' || currentPoint == '') {
                cfgMessage.content = KyeeI18nService.get('navigation_out.navigationFail','导航失败，请选择其他方式');
                KyeeMessageService.broadcast(cfgMessage);
                $scope.cancelBtn();
            }
            var Nmap = new BMap.Map("l-map");
            Nmap.centerAndZoom(currentPoint, 12);
            var local = new BMap.LocalSearch(Nmap, {
                renderOptions: {map: Nmap, panel: "r-result"}
            });
            local.searchInBounds("医院", Nmap.getBounds());
            $scope.isShow = false;
            KyeeMessageService.hideLoading();
        };

        /**
         * 在附近医院界面返回院外导航结果界面
         */
        $scope.onShowRouteTap = function () {
            $scope.isShowBtns = true;
            $scope.isShow = true;
            this.showPage();
        };
        $scope.showPage();
        var distinct = function(array){
            var arr = [];
            for(var i=0;i<array.length;i++){
                var item = array[i];
                if(arr.indexOf(item)==-1){
                    arr.push(item);
                }
            }
            return arr;
        }
    })
    .build();
