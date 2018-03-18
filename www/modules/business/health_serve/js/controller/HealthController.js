/*
 * 产品名称：健康服务
 * 创建人: 王婉
 * 创建日期:2017年6月7日11:28:01
 * 创建原因：APP一期优化
 */
new KyeeModule()
    .group("kyee.quyiyuan.health.serve.controller")
    .require([
        "kyee.quyiyuan.health.consultation.list.controller",
        "kyee.quyiyuan.health.consultation.detail.controller",
        "kyee.quyiyuan.consultation.consult_doctor_main.controller",
        "kyee.quyiyuan.consultation.consult_doctor_list.controller",
        "kyee.quyiyuan.consultation.consult_doctor_main.service",
        "kyee.quyiyuan.consultation.consult_doctor_list.service",
        "kyee.quyiyuan.health.healthManageHome.controller",
        "kyee.quyiyuan.health.healthManage.service",
        "kyee.quyiyuan.surroundingHospital.controller",
        "kyee.quyiyuan.health.nurse.service.controller"
    ])
    .type("controller")
    .name("HealthController")
    .params(["$scope", "$state","KyeeListenerRegister","CacheServiceBus","HomeService",
        "KyeeMessageService","$sce","OperationMonitor","$ionicLoading","CenterService",
        "MultipleQueryCityService","KyeeUtilsService","PatientsGroupMessageService",
        "KyeeI18nService","$location","HealthService", "ConsultDoctorMainService",
        "ConsultDoctorListService","$ionicScrollDelegate"])
    .action(function ($scope, $state,KyeeListenerRegister,CacheServiceBus,HomeService,
                      KyeeMessageService,$sce,OperationMonitor,$ionicLoading,CenterService,
                      MultipleQueryCityService,KyeeUtilsService,PatientsGroupMessageService,
                      KyeeI18nService,$location,HealthService, ConsultDoctorMainService,
                      ConsultDoctorListService,$ionicScrollDelegate) {
        var userAgent = navigator.userAgent.toLocaleLowerCase();
        $scope.userSource = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE);//用户来源
        $scope.pressed1 = false;
        /**
         * 医院广告方法绑定
         *
         * @param params
         */
        $scope.bindSlideboxImageActions = function (params) {
            $scope.updateSlideboxImage = params.update;
            $scope.playSlideboxImage = params.play;
            $scope.stopSlideboxImage = params.stop;
        };
        //跳转广告页面
        $scope.viewHospitalDetail = function (params) {
            if(DeploymentConfig.BRANCH_VER_CODE!='00'){return;}
            homePageAdvCount(params);

            if(params.item.adv_class == 2){
                // 保险广告
                HomeService.openInsurancePage();
            } else if(params.item.web_url){
                if(params.item.web_url == 'https://www.consultDoctorMain.com'){
                    ConsultDoctorListService.hospitalId = null;
                    $state.go("consult_doctor_main");
                    return;
                }
                HomeService.ADV_DATA = {
                    ADV_LOCAL: params.item.web_url,
                    ADV_NAME: params.item.adv_name,
                    ADV_SHARE: params.item.adv_share
                };
                if(params.item.adv_share){
                    HomeService.ADV_DATA.ADV_SHARE_TITLE = params.item.adv_share_title;
                    HomeService.ADV_DATA.ADV_SHARE_DESC = params.item.adv_share_desc;
                }

                $state.go('homeWeb');
            }else{
                HomeService.ADV_DATA = {
                    ADV_NAME: params.item.adv_name,
                    ADV_ID: params.item.id
                };
                $state.go('homeHtml');
            }
        };
        /**
         * yangmingsi KYEEAPPC-5252
         * 任务描述：C端首页图片点击统计
         * 时间：2016年3月1日11:30:00
         */
        var homePageAdvCount = function (params) {
            if(params && params.item && params.item.url){
                var strArr = params.item.url.split("/");
                var strUrl = strArr[strArr.length - 1];
                var imgUrl = strUrl.split(".")[0];
                OperationMonitor.record(imgUrl,"health->MAIN_TAB");
            }
            OperationMonitor.record("viewHospitalDetail","health->MAIN_TAB");
        };
        KyeeListenerRegister.regist({
            focus: "health->MAIN_TAB",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (params) {
                $scope.showHealthImg = true;
                //区分是ios还是Android
                if(typeof(device) != "undefined" && device.platform == "iOS"){
                    $scope.DEVICE_IOS = true;
                }else{
                    $scope.DEVICE_IOS = false;
                }
                //图片宽高比 498/1242  最大适配到6puls
                var screenSize = KyeeUtilsService.getInnerSize();
                $scope.imgWidth = screenSize.width;
                if(window.innerWidth<414){
                    $scope.imgHeight = window.innerWidth*(300/720);

                    $scope.healthTabHeight =window.innerHeight- window.innerWidth*(180/720)-275-50;//健康咨询所占高度（屏幕高度减去上半部分内容和页面下部tab高度）
                }else{
                    $scope.imgHeight = 414*(300/720);

                    $scope.healthTabHeight =window.innerHeight- (414*(180/720))-275-50;//健康咨询所占高度
                }
                if($scope.DEVICE_IOS){
                    $scope.healthTabHeight = $scope.healthTabHeight-20;//ios多减去一些
                }
                //一键呼救位置初始化
                // var storage = CacheServiceBus.getStorageCache();
                // if (storage.get('bellPosition1')) {
                //     var position1 = storage.get('bellPosition1');
                //     //取缓存中小铃铛位置
                //     $scope.bellLeft1 = position1.left;
                //     //取缓存中小铃铛位置
                //     $scope.bellTop1 = position1.top;
                // } else {
                //     //默认位置
                //     $scope.bellLeft1 = window.innerWidth - 136;
                //     //默认位置
                //     $scope.bellTop1 = 100;
                //
                // }
                var memoryCache = KyeeAppHelper.getSimpleService("kyee.quyiyuan.service_bus.cache", "CacheServiceBus").getMemoryCache();
                var userSource = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE);
                $scope.userSource=userSource;
                KyeeUtilsService.conditionInterval({
                    time : 100,
                    conditionFunc : KyeeI18nService.getCurrLangName,
                    doFunc : function () {
                        if(DeploymentConfig.BRANCH_VER_CODE == '03'){
                            $scope.bzMediacalRecord = true;
                            $scope.withDiagnosis = false;
                        }
                    }
                });
                initHospitalParams();//加载
                //是否展示一键呼救
                HomeService.getUserLocationInfo(function(data){
                    MultipleQueryCityService.queryShowHelp(data.CITY_CODE, data.PLACE_CODE, function (data) {
                        $scope.showHelpAtOnce = data.ShowHelp;
                        setTimeout(function () {
                            $scope.$apply();
                        }, 1);
                    });
                });
                //初始化首页广告
                var homeAdv = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.HOME_ADV);
                if(homeAdv){
                    $scope.slideboxData = homeAdv;
                }else{
                    HomeService.loadHomeAdv(function(data){
                        $scope.slideboxData = data;
                    });
                }
            }
        });
        KyeeListenerRegister.regist({
            focus: "health->MAIN_TAB",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_LEAVE,
            direction: "both",
            action: function (params) {

                //离开页面时停止播放医院广告
                if($scope.stopSlideboxImage != undefined){
                    $scope.stopSlideboxImage();
                }
            }
        });
        var initHospitalParams = function(){
            //初始化APP时获取系统参数
            HomeService.getNetParams(function (NETWORK_SWITCH,DIAGNOSIS_SWITCH,DIAGNOSIS_URL,DIAGNOSIS_URL_WEIXIN,CUS_SERVICE_URL,SECURE_KEY,CUS_SERVICE_SWITCH,PATIENTS_GROUP_SWITCH,MYINSURANCE_SWITCH,MYINSURANCE_URL,MYINSURANCE_URL_WEIXIN,HEALTH_URL) {
                //健康保险
                if (MYINSURANCE_SWITCH == "true"&& MYINSURANCE_URL && MYINSURANCE_URL_WEIXIN) {
                    CenterService.withMyInsurance = '1';
                    CenterService.MyInsuranceUrl = MYINSURANCE_URL;
                    if(isWeiXin()){
                        CenterService.MyInsuranceUrl = MYINSURANCE_URL_WEIXIN;
                    }
                    $scope.withMyInsurance =  CenterService.withMyInsurance;
                } else {
                    CenterService.withMyInsurance = '0';
                }
                //陪诊开关
                if (DIAGNOSIS_SWITCH == '1'&& DIAGNOSIS_URL && DIAGNOSIS_URL_WEIXIN) {
                    $scope.withDiagnosis = true;
                } else {
                    $scope.withDiagnosis = false;
                }
                if($scope.userSource=='4001'||$scope.bzMediacalRecord){
                    $scope.withDiagnosis = false;
                }
                //护士咨询开关
                if(CUS_SERVICE_SWITCH=='1'&&CUS_SERVICE_URL&&CUS_SERVICE_URL!=""&&CUS_SERVICE_URL!=undefined&&CUS_SERVICE_URL!="NULL"&&CUS_SERVICE_URL!="null"&&SECURE_KEY&&SECURE_KEY!=""&&SECURE_KEY!=undefined&&SECURE_KEY!="NULL"&&SECURE_KEY!="null"){
                    $scope.cusService=true;
                }else{
                    $scope.cusService=false;
                }
                HealthService.HEALTH_URL = HEALTH_URL;
                var url = HealthService.HEALTH_URL+"appInsetHealthInfo/";
                $scope.openUrl = $sce.trustAsResourceUrl(url);//加载健康新闻部分
            });
        };
        // $scope.drag1 = function (event) {
        //     if ($scope.pressed1) {
        //         //实时定位铃铛位置,18为高度的一半
        //         $scope.bellTop1 = event.gesture.touches[0].clientY - 20;
        //         //20为宽度的一半
        //         $scope.bellLeft1 = event.gesture.touches[0].clientX - 68;
        //     }
        // };
        // $scope.press1 = function () {
        //     $scope.pressed1 = true;
        // };
        // $scope.leave1 = function (event) {
        //     $scope.pressed1 = false;
        //     if ($scope.bellTop1 < 44) {
        //         $scope.bellTop1 = 44;
        //     } else if ($scope.bellTop1 > window.innerHeight - 90) {
        //         //90为底边栏50px + 铃铛高度40px
        //         $scope.bellTop1 = window.innerHeight - 90;
        //     }
        //
        //     $scope.bellLeft1 = window.innerWidth - 136;
        //
        //     //将当前位置存入缓存
        //     var bellPosition1 = {
        //         top: $scope.bellTop1,
        //         left: $scope.bellLeft1
        //     };
        //     storage.set('bellPosition1', bellPosition1);
        //
        // };
        // //跳转到一键呼救页面
        // $scope.goForHelp = function () {
        //     OperationMonitor.record("calHelp", "health->MAIN_TAB");
        //     $state.go('callAmbulance');
        // };
        //跳转到护士服务页
        $scope.goNurseService = function(){
            if(!$scope.withDiagnosis && !$scope.cusService && $scope.userSource == '3'){
                KyeeMessageService.broadcast({
                    content: "该功能暂不可用"
                });
                return;
            }
            HealthService.nurseServiceNavControl = {
                "userSource":$scope.userSource,
                "withDiagnosis":$scope.withDiagnosis,
                "cusService":$scope.cusService
            };
            $state.go('health_nurse_service');
        };

        $scope.onDragUp = function(){
            if(userAgent.indexOf('iphone') > -1 || userAgent.indexOf('ipad') > -1){
                $ionicScrollDelegate.$getByHandle('health_serve_content').scrollBy(0,150,true);
            }
        };
        $scope.onDragDown = function(){
            if(userAgent.indexOf('iphone') > -1 || userAgent.indexOf('ipad') > -1){
                $ionicScrollDelegate.$getByHandle('health_serve_content').scrollBy(0,-150,true);
            }
        };
        //动态控制nav处的布局样式
        $scope.getNavStyle = function() {
            if($scope.userSource == "3"){

                return $scope.withMyInsurance=="1"?"width_20":"width_25";

            }else if($scope.userSource == "4001"){

                return "width_25";

            }else{

                return "width_33";

            }
        };
        //跳转陪诊页面
        $scope.withTheDiagnosis = function(){
            if(DeploymentConfig.BRANCH_VER_CODE=='54'){//健康马鞍山
                KyeeMessageService.broadcast({
                    content: "此功能暂未开放"
                });
                return;
            }
            var loginFalg=CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.IS_LOGIN) == true;
            if(loginFalg){
                HomeService.withTheDiagnosis = 1;
                $state.go('homeWeb');
            }else{
                $state.go("login");
            }
        };
        //跳转在线咨询页面
        $scope.withTheCusService = function(){
            var loginFalg=CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.IS_LOGIN) == true;
            if(loginFalg){
                HomeService.withTheDiagnosis = 2;
                $state.go('homeWeb');
            }else{
                $state.go("login");
            }
        };
        //护士上门跳转
        $scope.nurseComeService = function(){
                HomeService.withTheDiagnosis = 6;
                $state.go('homeWeb');
        };
        /**
         * 我的保险点击事件
         */
        $scope.HealthInsurance = function(){
            var whereIComeFrom = "WEB";//APP WEIXIN WEB
            if ($location.$$absUrl.indexOf("file:///") != -1||$location.$$absUrl.indexOf("localhost:8080/var") != -1){
                whereIComeFrom = "APP";
            }
            if(isWeiXin()){
                whereIComeFrom = "WEIXIN";
            }
            var userAgents=navigator.userAgent;
            userAgents=userAgents.toLowerCase();
            var loginFalg=CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.IS_LOGIN) == true;
            if(loginFalg){
                var url = CenterService.MyInsuranceUrl;//后台配置所取
                var currentUserRecord =  CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);//用户缓存
                CenterService.queryInsuranceParameters(whereIComeFrom,url,currentUserRecord,'health',function (data) {
                    HomeService.queryWebConfig.openUrl= data;
                    if(window.device && device.platform == "iOS"){
                        var cache = CacheServiceBus.getMemoryCache();
                        cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_VIEW_ROUTER, "health->MAIN_TAB");
                        window.open(data,"_blank","location=yes");
                    }else if (whereIComeFrom == "WEIXIN"){
                        window.location.href = data;
                    }else{
                        $state.go('homeWebNoTitle');
                    }
                });
            }else{
                $state.go("login");
            }
        };

        $scope.healthMore = function(){
            $state.go("health_consultation_list");
        };

        /**
         * [goToConsultDoctor 跳转至咨询医生页面]
         * @return {[type]} [description]
         */
        $scope.goToConsultDoctor = function(){
            ConsultDoctorListService.hospitalId = null;
            $state.go("consult_doctor_main");
        };
        /**
         * [goToConsultDoctor 跳转至网络门诊页面]
         * @return {[type]} [description]
         */
        $scope.goToNetWorkClinic = function(){
            // KyeeMessageService.message({
            //     title: "温馨提示",
            //     content: "此功能暂未开放，敬请期待！",
            //     okText: "我知道了"
            // });
            $state.go('network_clinic_dl')
        };
        //点击附近医院时获取自己的位置
        $scope.getlocation = function(onSuccess){
            //获取IOS中用户所在地理位置的经纬度
            if(window.device && window.device.platform == "iOS"){
                if(navigator.map&&navigator.map.getLatitudeAndLongtitude)
                {
                    navigator.map.getLatitudeAndLongtitude(function(retVal){
                        if(retVal&&retVal.Latitude&&retVal.Longtitude)
                        {
                            onSuccess(retVal.Longtitude,retVal.Latitude);
                        }
                    },function(error) {
                        KyeeMessageService.message({
                            title: KyeeI18nService.get("update_user.sms","温馨提示"),
                            content: $scope.limitAlert,
                            okText: KyeeI18nService.get("role_view.iKnow","知道了")
                        });
                        return false;
                    },[]);
                }
            }
            else if(window.device && window.device.platform == "Android"){
                KyeeBDMapService.getCurrentPosition(function(retval){
                    if(retval&&retval.latitude&&retval.longitude)
                    {
                        onSuccess(retval.longitude,retval.latitude);
                    }
                },function(retval) {
                    KyeeMessageService.message({
                        title: KyeeI18nService.get("update_user.sms","温馨提示"),
                        content: $scope.limitAlert,
                        okText: KyeeI18nService.get("role_view.iKnow","知道了")
                    });
                    return false;
                });
            }
            else {
                new BMap.Geolocation().getCurrentPosition(function(ralation){
                    onSuccess(ralation.point.lng,ralation.point.lat);
                },function (error) {
                    KyeeMessageService.message({
                        title: KyeeI18nService.get("update_user.sms","温馨提示"),
                        content: $scope.limitAlert,
                        okText: KyeeI18nService.get("role_view.iKnow","知道了")
                    });
                    return false;
                });
            }
        };
        /**
         * [goToSurroundingHospital 跳转至周边医院页面]
         * @return {[type]} [description]
         */
        $scope.goToSurroundingHospital = function(){
            // $scope.getlocation(function(userLng,userLat){
            //     $scope.userLng = userLng;
            //     $scope.userLat = userLat;
            // });
            // if($scope.userLat != "" && $scope.userLng != ""){
            //     console.log($scope.userLng,$scope.userLng);
            // }else {
            //
            // }
            $state.go('surrounding_hospital');
        };
        //隐藏loading圈
        window.hideLoadHealthServe = function(){
           $scope.showHealthImg = false;
        };
        $scope.goToHealthManage = function () {
            $state.go("health_manage");
        }
    })
    .build();

