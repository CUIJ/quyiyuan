/**
 * 产品名称：quyiyuan.
 * 创建用户：gouchaohui
 * 日期：2017年10月18日19:09:22
 * 创建原因：周边医院
 */
new KyeeModule()
    .group("kyee.quyiyuan.surroundingHospital.controller")
    .require([
        "kyee.quyiyuan.nearbyHospital.service",
        "kyee.framework.base.support.listener",
        "kyee.quyiyuan.home.service",
        "kyee.framework.service.message",
        "kyee.quyiyuan.detailMap.controller",
        "kyee.quyiyuan.detailMap.service",
        "kyee.quyiyuan.homeClinic.controller",
        "kyee.quyiyuan.homeClinic.service"
    ])
    .type("controller")
    .name("SurroundingHospitalController")
    .params(["$scope", "$state", "KyeeListenerRegister",
        "NearbyHospitalService", "HospitalSelectorService", "CacheServiceBus",
        "HomeService", "KyeeMessageService","KyeeI18nService",
        "AppointmentDeptGroupService","DetailMapService","HomeClinicService","$ionicScrollDelegate","$ionicHistory","KyeeBDMapService","IMUtilService"])
    .action(function ($scope, $state, KyeeListenerRegister,
                      NearbyHospitalService, HospitalSelectorService, CacheServiceBus,
                      HomeService, KyeeMessageService,KyeeI18nService,
                      AppointmentDeptGroupService,DetailMapService,HomeClinicService,$ionicScrollDelegate,$ionicHistory,KyeeBDMapService,IMUtilService) {
        $scope.NearbyHasData = false;
        $scope.NearbyText = false;
        $scope.RecommendText = false;
        $scope.NearDeptNameHasData = [];
        $scope.NearClinicFun =[];
        $scope.showClinic = true;
        $scope.showHospital = true;
        $scope.showMenu = false;
        $scope.clinicEmpty = -1;
        $scope.hospitalEmpty = -1;
        var first = false;
        var pointList=[];
        var lnglatList=[];
        var myPoint;
        var hospitalInfo;
        // //判断pc还是移动端浏览器
        // $scope.isPC = function (){
        //     var sUserAgent = navigator.userAgent.toLowerCase();
        //     var bIsIphoneOs = sUserAgent.match(/iphone/i) == "iphone";
        //     var iOS= window.device && window.device.platform == "iOS";
        //     if (bIsIphoneOs||iOS) {
        //         alert("1"+sUserAgent)
        //         $scope.offsetWidth = 202;
        //     } else {
        //         alert("2"+sUserAgent)
        //         $scope.offsetWidth = 202;
        //     }
        // }
        // $scope.isPC();
        var storageCache = CacheServiceBus.getStorageCache();
        function addMarker(point,label,map){  // 创建图标对象
            var myIcon = new BMap.Icon("resource/images/hospitalNavigation/smallposition.png", new BMap.Size(32, 34));
            // 创建标注对象并添加到地图
            if(label!=false) {
                var marker = new BMap.Marker(point, {icon: myIcon});
            }else{
                var marker = new BMap.Marker(point);
            }
            map.addOverlay(marker);
            if(label!=false){
                marker.setLabel(label);
            }
        }
        KyeeListenerRegister.regist({
            focus: "surrounding_hospital",
            direction: "both",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            action: function (params) {
                var map;
                first = true;
                //附件的医院数据缓存五分钟
                if(NearbyHospitalService.lastqueryTimeStamp&&new Date().getTime()-NearbyHospitalService.lastqueryTimeStamp<5*60000){
                    hospitalInfo = NearbyHospitalService.nearbyHospitalData.NEARBY;
                    $scope.city = NearbyHospitalService.cityName;
                    showNearbyHospitalData(NearbyHospitalService.nearbyHospitalData,true);
                    //多次进入退出再进入后，显示当前位置信息  任务号：KYEEAPPTEST-3909   by-杨旭平
                    $scope.address = NearbyHospitalService.address;
                    var point = [];
                    if (window.device && window.device.platform == "iOS") {
                        KyeeBDMapService.showSurroundingMapIOS(
                            function(info){},
                            function(info){ $scope.city = ""; },
                            hospitalInfo
                        );
                    }else{
                        for (var i = 0; i < hospitalInfo.length; i++) {
                            if (hospitalInfo[i].LONGITUDE != null && hospitalInfo[i].LONGITUDE != '' && hospitalInfo[i].LONGITUDE != undefined
                                && hospitalInfo[i].LATITUDE != null && hospitalInfo[i].LATITUDE != '' && hospitalInfo[i].LATITUDE != undefined
                            ) {
                                point[i] = {position: {}, name: "", label: {}, id: ""};
                                point[i].position = new BMap.Point(hospitalInfo[i].LONGITUDE, hospitalInfo[i].LATITUDE);
                                lnglatList[i] = point[i].position;
                                point[i].name = hospitalInfo[i].HOSPITAL_NAME;
                                point[i].id = hospitalInfo[i].HOSPITAL_ID;
                                var label = new BMap.Label(hospitalInfo[i].HOSPITAL_NAME, {offset: new BMap.Size(33, 6)});
                                label.setStyle({
                                    fontSize: "14px",
                                    color: "#333333",
                                    backgroundColor: null,
                                    border: "0",
                                    fontWeight: "bold",
                                });
                                point[i].label = label;
                                pointList[i] = point[i];
                            }
                        }
                        setTimeout(function () {
                            map = new BMap.Map("s-result");
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
                            var geolocation = new BMap.Geolocation();
                            geolocation.getCurrentPosition(function (r) {
                                if (this.getStatus() == BMAP_STATUS_SUCCESS) {
                                    myPoint = r.point;
                                    var view = map.getViewport(eval(lnglatList));
                                    var mapZoom = view.zoom;
                                    var centerPoint = view.center;
                                    map.centerAndZoom(centerPoint, mapZoom);
                                    addMarker(myPoint, false, map);
                                    for (var i = 0; i < pointList.length; i++) {
                                        addMarker(pointList[i].position, pointList[i].label, map);
                                    }
                                } else {

                                }
                            }, {
                                enableHighAccuracy: true,
                                racy: 200
                            });
                        }, 300);
                    }
                }else{
                    //点击附近医院时去查用户的定位信息时，进行数据加载提示。
                    KyeeMessageService.loading({mask: false});
                    //获取附近医院的信息
                    NearbyHospitalService.getNearHospitalInfo(function (data) {
                        NearbyHospitalService.nearbyHospitalData = data;
                        hospitalInfo = data.NEARBY;
                        NearbyHospitalService.lastqueryTimeStamp = new Date().getTime();
                        showNearbyHospitalData(data,false);
                        $scope.address = NearbyHospitalService.address;
                        $scope.city = NearbyHospitalService.cityName;
                        var point = [];
                        if(window.device && window.device.platform == "iOS") {
                            KyeeBDMapService.showSurroundingMapIOS(
                                function(info){},
                                function(info){},
                                hospitalInfo
                            );
                        }else{
                            for (var i = 0; i < hospitalInfo.length; i++) {
                                point[i] = {position: {}, name: "", label: {}, id: ""};
                                point[i].position = new BMap.Point(hospitalInfo[i].LONGITUDE, hospitalInfo[i].LATITUDE);
                                lnglatList[i] = point[i].position;
                                point[i].name = hospitalInfo[i].HOSPITAL_NAME;
                                point[i].id = hospitalInfo[i].HOSPITAL_ID;
                                var label = new BMap.Label(hospitalInfo[i].HOSPITAL_NAME, {offset: new BMap.Size(33, 6)});
                                label.setStyle({
                                    fontSize: "14px",
                                    color: "#333333",
                                    backgroundColor: null,
                                    border: "0",
                                    fontWeight: "bold",
                                });
                                point[i].label = label;
                                pointList[i] = point[i];
                            }
                            setTimeout(function () {
                                map = new BMap.Map("s-result");
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
                                var geolocation = new BMap.Geolocation();
                                geolocation.getCurrentPosition(function (r) {
                                    if (this.getStatus() == BMAP_STATUS_SUCCESS) {
                                        myPoint = r.point;
                                        var view = map.getViewport(eval(lnglatList));
                                        var mapZoom = view.zoom;
                                        var centerPoint = view.center;
                                        map.centerAndZoom(centerPoint, mapZoom);
                                        addMarker(myPoint, false, map);
                                        for (var i = 0; i < pointList.length; i++) {
                                            addMarker(pointList[i].position, pointList[i].label, map);
                                        }
                                    } else {
                                    }
                                }, {
                                    enableHighAccuracy: true,
                                    racy: 200
                                });
                            }, 300);
                        }
                    });
                }
            }
        });
        KyeeListenerRegister.regist({
            focus: "surrounding_hospital",
            direction: "both",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_LEAVE,
            action: function (params) {
                if (window.device && window.device.platform == "iOS") {
                    var destoryType=[{destoryType:"surroundingMap"}];
                    KyeeBDMapService.destorySurroundMapIOS(
                        function (info) { },
                        function (info) { },
                        destoryType
                    );
                }
            }
        });

        //选择附近医院后跳回C端主页，并且把C端主页的医院名字切换成所选择的医院
        $scope.selectNearHospital = function (index) {
            if (window.device && window.device.platform == "iOS") {
                var destoryType=[{destoryType:"surroundingMap"}];
                KyeeBDMapService.destorySurroundMapIOS(
                    function (info) {},
                    function (info) { },
                    destoryType
                );
            }
            if(CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_TYPE)) {
                var type = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_TYPE).type;
            }
            CacheServiceBus.getStorageCache().set(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_TYPE,{type:$scope.nearbyhospitalinfo[index].HOSPITAL_TYPE});
            var oldHospitalInfo = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
            var oldMenu = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOME_DATA);
            var info = $scope.nearbyhospitalinfo[index];
            NearbyHospitalService.saveClickCount(info.HOSPITAL_ID);
            //切换医院
            HospitalSelectorService.selectHospital(info.HOSPITAL_ID, info.HOSPITAL_NAME,
                info.MAILING_ADDRESS, info.PROVINCE_CODE, info.PROVINCE_NAME,
                info.CITY_CODE, info.CITY_NAME, KyeeI18nService.get('nearby_hospital.switchHospital', '医院正在切换中...'), function () {
                    if(info.HOSPITAL_TYPE === '1'){
                        HospitalSelectorService.surroundingGoBack = true;
                        $state.go("home->MAIN_TAB");
                    }else{
                        HomeClinicService.clinicInfo = info;
                        if(type === "1" || type === undefined) {
                            storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.OLD_HOSPITAL_INFO, oldHospitalInfo);
                            storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.OLD_HOME_DATA,oldMenu);
                        }
                        $state.go("homeClinic");
                    }
                });
        };
        //判断附近医院信息里面是否有特色科室，如果没有把NearDeptNameHasData 置为false,并在界面上隐藏
        $scope.NearDeptNameHasData = function (index) {
            if (!$scope.nearbyhospitalinfo[index].DEPT_NAME) {
                return false;
            }else{
                $scope.nearbyhospitalinfo[index].DEPT_NAME_SHOW = $scope.nearbyhospitalinfo[index].DEPT_NAME.split("/");
            }
            return true;
        };
        //判断附近医院信息里面是否有地址，如果没有把NearMailingAddressData 置为false,并在界面上隐藏
        $scope.NearMailingAddressData = function (index) {
            if (!$scope.nearbyhospitalinfo[index].MAILING_ADDRESS) {
                return false;
            }
            return true;
        };
        //判断附近诊所信息里面是否有开通服务，如果没有把NearClinicFun 置为false,并在界面上隐藏
        $scope.NearClinicFun = function (index) {
            if ($scope.nearbyhospitalinfo[index].ELEMENT_NAMES==''||$scope.nearbyhospitalinfo[index].ELEMENT_NAMES.length==0) {
                return false;
            }else{
                $scope.nearbyhospitalinfo[index].FUN_NAME_SHOW = $scope.nearbyhospitalinfo[index].ELEMENT_NAMES.split("/");
                for(var i=0;i<$scope.nearbyhospitalinfo[index].FUN_NAME_SHOW.length;i++){
                    if($scope.nearbyhospitalinfo[index].FUN_NAME_SHOW[i] == '满意度'){
                        $scope.nearbyhospitalinfo[index].FUN_NAME_SHOW[i] = '门诊满意度';
                    }else if($scope.nearbyhospitalinfo[index].FUN_NAME_SHOW[i] == '我的排队'){
                        $scope.nearbyhospitalinfo[index].FUN_NAME_SHOW[i] = '排队叫号';
                    }else if($scope.nearbyhospitalinfo[index].FUN_NAME_SHOW[i] == '我的报告单'){
                        $scope.nearbyhospitalinfo[index].FUN_NAME_SHOW[i] = '报告查询';
                    }else if($scope.nearbyhospitalinfo[index].FUN_NAME_SHOW[i] == '我的费用'){
                        $scope.nearbyhospitalinfo[index].FUN_NAME_SHOW[i] = '门诊缴费';
                    }else if($scope.nearbyhospitalinfo[index].FUN_NAME_SHOW[i] == '住院费用'){
                        $scope.nearbyhospitalinfo[index].FUN_NAME_SHOW[i] = '住院缴费';
                    }else if($scope.nearbyhospitalinfo[index].FUN_NAME_SHOW[i] == '医院导航'){
                        $scope.nearbyhospitalinfo[index].FUN_NAME_SHOW[i] = '院内导航';
                    }else if($scope.nearbyhospitalinfo[index].FUN_NAME_SHOW[i] == '体检单'){
                        $scope.nearbyhospitalinfo[index].FUN_NAME_SHOW[i] = '体检报告';
                    }
                }
            }
            return true;
        };
        /** 任务号：KYEEAPPC-3962
         *  修改人：高玉楼
         *  修改原因：附件的医院数据缓存5分钟
         *  任务号：KYEEAPPTEST-3909
         *  修改人：杨旭平
         *  修改原因：附近医院多次进入退出后拿不到用户的“当前信息”和“距离信息错误"
         */
        function showNearbyHospitalData(data,flag){
            var point=[];
            $scope.nearbyhospitalinfo = data.NEARBY;
            for(var i = 0; i<$scope.nearbyhospitalinfo.length;i++){
                //判断如果是缓存的数据，则不需要处理距离信息（原因：第一次加载的时候已经处理过了） 任务号：KYEEAPPTEST-3909   by-杨旭平
                if(null !=$scope.nearbyhospitalinfo[i] && undefined != $scope.nearbyhospitalinfo[i].DISTANCE && !flag){
                    $scope.nearbyhospitalinfo[i].DISTANCE = $scope.nearbyhospitalinfo[i].DISTANCE/1000;
                    $scope.nearbyhospitalinfo[i].DISTANCE = Math.round($scope.nearbyhospitalinfo[i].DISTANCE*Math.pow(10, 1))/Math.pow(10, 1);
                }
                else if(null ==$scope.nearbyhospitalinfo[i] || undefined == $scope.nearbyhospitalinfo[i].DISTANCE){
                    $scope.nearbyhospitalinfo[i].DISTANCE = 0;
                }
                if($scope.nearbyhospitalinfo[i].HOSPITAL_TYPE ==='0'){
                    $scope.clinicEmpty = 1;
                }
                if($scope.nearbyhospitalinfo[i].HOSPITAL_TYPE ==='1'){
                    $scope.hospitalEmpty = 1;
                }
                if($scope.clinicEmpty == -1){
                    $scope.clinicEmpty = 0;
                }
                if($scope.hospitalEmpty == -1){
                    $scope.hospitalEmpty = 0;
                }
            }
            var len = $scope.nearbyhospitalinfo;
            if (len && len.length > 0) {    //没有数据显示提示信息
                $scope.NearbyHasData = true;
                $scope.NearbyText = false;
            } else {
                $scope.NearbyText = true;
            }
        }

        $scope.refresh = function () {
            //点击附近医院时去查用户的定位信息时，进行数据加载提示。
            KyeeMessageService.loading({mask: false});
            //获取附近医院的信息
            NearbyHospitalService.getNearHospitalInfo(function (data) {
                NearbyHospitalService.nearbyHospitalData = data;
                NearbyHospitalService.lastqueryTimeStamp = new Date().getTime();
                showNearbyHospitalData(data,false);
                $scope.address = NearbyHospitalService.address;
            });
        };
        $scope.turnChoose = function (type) {
            if(type === 'hospital'){
                $scope.showClinic = false;
                $scope.showHospital = true;
            }else if(type === 'clinic'){
                $scope.showClinic = true;
                $scope.showHospital = false;
            }else if(type === 'all'){
                $scope.showClinic = true;
                $scope.showHospital = true;
            }
            $ionicScrollDelegate.$getByHandle("mainScroll").resize();
        };
        $scope.detailMap = function () {
            DetailMapService.myPoint = myPoint;
            DetailMapService.pointList = pointList;
            DetailMapService.lnglatList = lnglatList;
            $state.go("detail_map");
        };
        $scope.goBack = function () {
            if (window.device && window.device.platform == "iOS") {
                var destoryType=[{destoryType:"surroundingMap"}];
                KyeeBDMapService.destorySurroundMapIOS(
                    function (info) { },
                    function (info) { },
                    destoryType
                 );
            }
            HospitalSelectorService.surroundingGoBack = false;
            $ionicHistory.goBack();
        };
        $scope.hideRightMenu = function(){
            $scope.showMenu = false;
        };
        $scope.showRightMenu = function(){
            var a = document.getElementById("choosebox");
            var clientRect = a.getBoundingClientRect().bottom;
            $scope.myScrollTop = clientRect;
            $scope.showMenu = true;
        }
        //计算距离的位数
        $scope.numCount = function (i) {
            i = i/1000;
            var l=0;
            while(i>=1){
                i=i/10;
                l++;
            }
            return l;
        };
    })
    .build();
