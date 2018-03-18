/**
 * 产品名称：quyiyuan
 * 创建者：卢飞
 * 创建时间： 2015年5月8日10:41:05
 * 创建原因：医院导航控制器
 * 修改者：
 * 修改原因：
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.navigationOut.controller")
    .require(["kyee.quyiyuan.navigationOut.service","kyee.framework.service.message"])
    .type("controller")
    .name("NavigationOutController")
    .params(["$scope", "$state", "KyeeViewService", "CacheServiceBus", "NavigationOutService","KyeeMessageService","KyeeI18nService"])
    .action(function ($scope, $state, KyeeViewService, CacheServiceBus, NavigationOutService,KyeeMessageService,KyeeI18nService) {

        var hosPoint = undefined;//医院所在地点
        var currentPoint = undefined;//用户所在地点
        var dis = undefined;//距离
        var map = undefined;//百度地图
        var cfgMessage = {
            title:KyeeI18nService.get('add_patient_info.msg','消息'),
            content:''
        };
        $scope.isShow = true;

        /**
         * 向百度地图发送请求绘制地图
         */
        $scope.showPage = function () {
                NavigationOutService.getHospitalAddress(function (hospitalData) {
                    KyeeMessageService.loading();
                    var mi = this;
                    var geolocation = new BMap.Geolocation();
                    hosPoint = new BMap.Point(hospitalData.lng,hospitalData.lat);
                    geolocation.getCurrentPosition( $scope.getCurrentPointFunction, {enableHighAccuracy: true, racy: 200});
                    //加载map至页面
                    map = new BMap.Map("l-map");
                    map.centerAndZoom(hosPoint, 12);
                });
        };

        /**
         * 获取当前位置信息
         * @param r
         */
        $scope.getCurrentPointFunction = function(r) {
            currentPoint =  r.point;
            dis = new BMap.Map().getDistance(currentPoint,hosPoint);
            if (dis<1000) {
                $scope.findByFoot(currentPoint,hosPoint,map);
            }else {
                var geocoder = new BMap.Geocoder();
                geocoder.getLocation(hosPoint,function(rs){
                    if (r.address.city!=rs.addressComponents.city) {
                        KyeeMessageService.hideLoading();
                        var cfg = {
                        title : KyeeI18nService.get('navigation_out.msg','消息'),
                        content :KyeeI18nService.get('navigation_out.diffArea','您与医院不在同一个城市，是否继续导航？'),
                        onSelect:function(isSam){
                            if (isSam) {
                              KyeeMessageService.loading();
                                $scope.findMore(currentPoint,hosPoint,map);
                            }else {
                                $scope.cancelBtn();
                            }
                        }
                    };
                        KyeeMessageService.confirm(cfg);
                    }else {
                        $scope.find(currentPoint,hosPoint,map);
                    }
                });
            }
        };

        /**
         * 出现异常时，取消右上角的附近医院和院外导航按钮
         */
        $scope.cancelBtn=function(){
            $scope.isShow = false;
        };

        /**
         * 公交导航函数
         * @param point
         * @param endpoint
         * @param map
         */
        $scope.find=function(point,endpoint,map) {
            //BMAP_STATUS_SUCCESS	检索成功。对应数值“0”。
            //BMAP_STATUS_CITY_LIST	城市列表。对应数值“1”。
            //BMAP_STATUS_UNKNOWN_LOCATION	位置结果未知。对应数值“2”。
            //BMAP_STATUS_UNKNOWN_ROUTE	导航结果未知。对应数值“3”。
            //BMAP_STATUS_INVALID_KEY	非法密钥。对应数值“4”。
            //BMAP_STATUS_INVALID_REQUEST	非法请求。对应数值“5”。
            //BMAP_STATUS_PERMISSION_DENIED	没有权限。对应数值“6”。(自 1.1 新增)
            //BMAP_STATUS_SERVICE_UNAVAILABLE	服务不可用。对应数值“7”。(自 1.1 新增)
            //BMAP_STATUS_TIMEOUT	超时。对应数值“8”。(自 1.1 新增)

            var transit = new BMap.TransitRoute(map, {renderOptions: {map: map, panel: "r-result",autoViewport:true},onSearchComplete:function(result){
                if(transit.getStatus()==BMAP_STATUS_SUCCESS) {
                    //KyeeMessageService.hideLoading();
                }else if (transit.getStatus()==BMAP_STATUS_UNKNOWN_LOCATION) {
                    cfgMessage.content = KyeeI18nService.get('navigation_out.noArea','位置结果未知');
                    KyeeMessageService.message(cfgMessage);
                    $scope.cancelBtn();
                } else if (transit.getStatus()==BMAP_STATUS_UNKNOWN_ROUTE) {
                    //在同一个城市，距离大余1000米，且没有公交结果时，调用步行导航的方式
                    $scope.findByFoot(point,endpoint,map);
                }else if (transit.getStatus()==BMAP_STATUS_INVALID_KEY) {
                    cfgMessage.content = KyeeI18nService.get('navigation_out.illegalPass','非法密钥');
                    KyeeMessageService.message(cfgMessage);
                    $scope.cancelBtn();
                }else if (transit.getStatus()==BMAP_STATUS_INVALID_REQUEST) {
                    cfgMessage.content =  KyeeI18nService.get('navigation_out.illegalReq','非法请求');
                    KyeeMessageService.message(cfgMessage);
                    $scope.cancelBtn();
                }else if (transit.getStatus()==BMAP_STATUS_PERMISSION_DENIED) {
                    cfgMessage.content =  KyeeI18nService.get('navigation_out.noPermissions','没有权限');
                    KyeeMessageService.message(cfgMessage);
                    $scope.cancelBtn();
                }else if (transit.getStatus()==BMAP_STATUS_SERVICE_UNAVAILABLE) {
                    cfgMessage.content = KyeeI18nService.get('navigation_out.noService','服务不可用');
                    KyeeMessageService.message(cfgMessage);
                    $scope.cancelBtn();
                }else if (transit.getStatus()==BMAP_STATUS_TIMEOUT) {
                    cfgMessage.content =  KyeeI18nService.get('navigation_out.timeOut','请求超时');
                    KyeeMessageService.message(cfgMessage);
                    $scope.cancelBtn();
                }else {
                    cfgMessage.content = KyeeI18nService.get('navigation_out.navigationFailNoWay','导航失败');
                    KyeeMessageService.message(cfgMessage);
                    $scope.cancelBtn();
                }
                KyeeMessageService.hideLoading();
            }});
            transit.search(point, endpoint);
        };

        /**
         * 当离目标坐标距离小于1000米时，采用步行导航的方式
         * @param point
         * @param endpoint
         * @param map
         */
        $scope.findByFoot=function(point,endpoint,map) {
            var walkingRoute = new BMap.WalkingRoute(map, {renderOptions: {map: map, panel: "r-result",autoViewport:true},onSearchComplete:function(result){
                if(walkingRoute.getStatus()!=BMAP_STATUS_SUCCESS) {
                    cfgMessage.content = KyeeI18nService.get('navigation_out.navigationFailNoWay','导航失败');
                    KyeeMessageService.message(cfgMessage);
                    $scope.cancelBtn();
                }
                    KyeeMessageService.hideLoading();
            }});
            walkingRoute.search(point, endpoint);
        };

        /**
         * 当患者与所选医院不在同一个城市时的导航方式
         * @param point
         * @param endpoint
         * @param map
         */
        $scope.findMore=function(point,endpoint,map) {
            var transit = new BMap.DrivingRoute(map, {renderOptions: {map: map, panel: "r-result",autoViewport:true},onSearchComplete:function(result){
                if(transit.getStatus()!=BMAP_STATUS_SUCCESS) {
                    cfgMessage.content = KyeeI18nService.get('navigation_out.navigationFailNoWay','导航失败');
                    KyeeMessageService.message(cfgMessage);
                    $scope.cancelBtn();
                }
                    KyeeMessageService.hideLoading();
            }});
            transit.search(point, endpoint);
        };

        /**
         * 附近医院
         */
        $scope.onNearByTap=function() {
            KyeeMessageService.loading();
            if(currentPoint==undefined||currentPoint==null||currentPoint=='null'||currentPoint=='') {
                cfgMessage.content = KyeeI18nService.get('navigation_out.navigationFailNoWay','导航失败');
                KyeeMessageService.message(cfgMessage);
                $scope.cancelBtn();
            }
            var Nmap = new BMap.Map("l-map");
            Nmap.centerAndZoom(currentPoint, 12);
            var local = new BMap.LocalSearch(Nmap, {
                renderOptions:{map: Nmap,panel:"r-result"}
            });
            local.searchInBounds("医院", Nmap.getBounds());
            $scope.isShow = false;
            KyeeMessageService.hideLoading();
        };

        /**
         * 在附近医院界面返回院外导航结果界面
         */
        $scope.onShowRouteTap=function() {
            $scope.isShow = true;
            this.showPage();
        };
        $scope.showPage();
    })
    .build();
