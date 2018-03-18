
new KyeeModule()
    .group("kyee.quyiyuan.detailMap.controller")
    .require([
        "kyee.quyiyuan.detailMap.service"
    ])
    .type("controller")
    .name("DetailMapController")
    .params(["$scope", "$rootScope", "$state","KyeeListenerRegister","$sce","DetailMapService","$ionicHistory","OutNavigationService","KyeeBDMapService"])
    .action(function ($scope, $rootScope, $state,KyeeListenerRegister,$sce,DetailMapService,$ionicHistory,OutNavigationService,KyeeBDMapService) {
        var map;

        function addMarker(point,id,label,map){  // 创建图标对象
            var myIcon = new BMap.Icon("resource/images/hospitalNavigation/positioning.png", new BMap.Size(35, 38));
            // 创建标注对象并添加到地图
            if(id!=false&&label!=false){
                var marker = new BMap.Marker(point, {icon: myIcon});
            }else{
                var marker = new BMap.Marker(point);
            }
            map.addOverlay(marker);
            if(id!=false&&label!=false) {
                marker.setLabel(label);
                marker.addEventListener("click", function (event) {
                    if (window.device && window.device.platform == "iOS") {
                        var destoryType=[{destoryType:"detailMap"}];
                        KyeeBDMapService.destorySurroundMapIOS(
                            function (info) {},
                            function (info) {},
                            destoryType
                        );
                    }
                    OutNavigationService.hospitalId = id;
                    OutNavigationService.openNavigationOut();
                    event.stopPropagation();
                });
            }
        }
        KyeeListenerRegister.regist({
            focus: "detail_map",
            direction: "both",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            action: function (params) {
                $scope.number = DetailMapService.pointList.length;
                if (window.device && window.device.platform == "iOS") {

                } else {
                    map = new BMap.Map("detailMap");
                    map.setMapStyle({
                        styleJson:[
                            {
                                "featureType": "highway",
                                "elementType": "all",
                                "stylers": {
                                    "visibility": "off"
                                }
                            },
                            {
                                "featureType": "railway",
                                "elementType": "all",
                                "stylers": {
                                    "visibility": "off"
                                }
                            },
                            {
                                "featureType": "subway",
                                "elementType": "all",
                                "stylers": {
                                    "visibility": "off"
                                }
                            }
                        ]
                    });
                    map.enableContinuousZoom();
                    var view = map.getViewport(eval(DetailMapService.lnglatList));
                    var mapZoom = view.zoom;
                    var centerPoint = view.center;
                    map.centerAndZoom(centerPoint, mapZoom);
                    addMarker(DetailMapService.myPoint, false, false, map);
                    for (var i = 0; i < DetailMapService.pointList.length; i++) {
                        addMarker(DetailMapService.pointList[i].position, DetailMapService.pointList[i].id, DetailMapService.pointList[i].label, map);
                    }
                }
            }
        });
        $scope.goBack = function () {
            if (window.device && window.device.platform == "iOS") {
                var destoryType=[{destoryType:"detailMap"}];
                KyeeBDMapService.destorySurroundMapIOS(
                    function (info) {},
                    function (info) {},
                    destoryType
                );
            }
            $ionicHistory.goBack(-1);
        }
        /**
         * 监听物理返回键保证和页面返回键一样
         */
        KyeeListenerRegister.regist({
            focus: "detail_map",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.goBack();
            }
        });
        KyeeListenerRegister.regist({
            focus: "detail_map",
            direction: "both",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_LEAVE,
            action: function (params) {
                if (window.device && window.device.platform == "iOS") {
                    var destoryType=[{destoryType:"detailMap"}];
                    KyeeBDMapService.destorySurroundMapIOS(
                        function (info) {},
                        function (info) {},
                        destoryType
                    );
                }
            }
        });
    }).build();