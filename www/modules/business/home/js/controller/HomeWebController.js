
new KyeeModule()
    .group("kyee.quyiyuan.home.homeWeb.controller")
    .require(["kyee.quyiyuan.home.service"])
    .type("controller")
    .name("HomeWebController")
    .params(["$ionicLoading","CenterService","$ionicHistory","KyeeMessageService","$scope","HomeService","HttpServiceBus","$sce","CacheServiceBus","Md5UtilService","KyeeShareService","KyeeDeviceInfoService","KyeeI18nService","KyeeListenerRegister","$location"])
    .action(function($ionicLoading,CenterService,$ionicHistory,KyeeMessageService,$scope,HomeService,HttpServiceBus,$sce,CacheServiceBus,Md5UtilService,KyeeShareService,KyeeDeviceInfoService,KyeeI18nService,KyeeListenerRegister,$location){

        //显示loading圈
        var loading = function(){
            KyeeMessageService.loading({
                content: undefined,
                duration: 30000,
                mask: false
            });
        };

        loading();//进入页面显示
        // 判断当前浏览器是否是微信浏览器
        function isWeiXin(){
            var ua = window.navigator.userAgent.toLowerCase();
            if(ua.match(/MicroMessenger/i) == 'micromessenger'){
                return true;
            }else{
                return false;
            }
        }

        //获取趣护的新连接
        function goDiagosisUrlWeb(){
            HttpServiceBus.connect({
                url:"/appoint/action/DiagnosisActionC.jspx",
                params: {
                    op: "DealDiagnosisUrlFromSysParam"
                },
                onSuccess: function (result) {
                    if(result.success){
                        if(isWeiXin()){
                            $scope.openUrl = $sce.trustAsResourceUrl(result.data.DIAGNOSIS_URL_WEIXIN);
                        }else{
                            $scope.openUrl = $sce.trustAsResourceUrl(result.data.DIAGNOSIS_URL);
                        }
                    }
                    return diagnosisUrl;
                },
                onError:function(){
                }
            });
        }
        //获取趣护的新连接gch
        function goNurseEscortUrlWeb(goodsType,tag){
            var loginFalg=CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.IS_LOGIN) == true;
            if(loginFalg){
                goNurseEscortUrlWebWithLogin(goodsType,tag);
            }else{
                goNurseEscortUrlWebWithUnLogin(goodsType,tag);
            }

        }
        function goNurseEscortUrlWebWithLogin(goodsType,tag){
            var hospitalInfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
            var currentUser = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
            HttpServiceBus.connect({
                url:"/appoint/action/DiagnosisActionC.jspx",
                params: {
                    op: "getNurseEscortUrlFromQuHu",
                    HOSPITAL_ID: hospitalInfo.id,
                    HOSPITAL_NAME: hospitalInfo.name,
                    PHONE_NUMBER: currentUser.PHONE_NUMBER,
                    ID_NO: currentUser.ID_NO,
                    USER_NAME: currentUser.NAME,
                    CITY_ID: hospitalInfo.cityCode,
                    goodsType: goodsType,
                    tag: tag,
                    isLog: 1
                },
                onSuccess: function (result) {
                    if(result.success){
                        if(isWeiXin()){
                            $scope.openUrl = $sce.trustAsResourceUrl(result.data.DIAGNOSIS_URL_WEIXIN);
                        }else{
                            $scope.openUrl = $sce.trustAsResourceUrl(result.data.DIAGNOSIS_URL);
                        }
                    }
                },
                onError:function(){
                }
            });
        }
        function goNurseEscortUrlWebWithUnLogin(goodsType,tag){
            HttpServiceBus.connect({
                url:"/appoint/action/DiagnosisActionC.jspx",
                params: {
                    op: "getNurseEscortUrlFromQuHu",
                    goodsType: goodsType,
                    tag: tag,
                    isLog: 0
                },
                onSuccess: function (result) {
                    if(result.success){
                        if(isWeiXin()){
                            $scope.openUrl = $sce.trustAsResourceUrl(result.data.DIAGNOSIS_URL_WEIXIN);
                        }else{
                            $scope.openUrl = $sce.trustAsResourceUrl(result.data.DIAGNOSIS_URL);
                        }
                    }
                },
                onError:function(){
                }
            });
        }
        //0：默认广告页 1：就诊陪诊页 2：护士咨询页 3：医院主页护士陪诊页 4:智能导诊--护士导诊入口
        switch(HomeService.withTheDiagnosis)
        {
            case 1:{// 1：就诊陪诊页
                HomeService.withTheDiagnosis = 0;
                $scope.advName = KyeeI18nService.get("homeWeb.doctorAccompany","护士陪诊");
                goDiagosisUrlWeb();
            }
                break;
            case 2:{// 2：护士咨询页
                HomeService.withTheDiagnosis = 0;
                $scope.advName =KyeeI18nService.get('homeWeb.nurseCall','护士咨询');
                var url= HomeService.cusServiceUrl;
                var userId = "QY_APP_";
                var timestamp = Date.parse(new Date())/1000;
                var userName="";
                var secureKey=HomeService.secureKey;
                var memoryCache = CacheServiceBus.getMemoryCache();//全局参数
                var currentUserRecord = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);//用户缓存
                if(currentUserRecord && currentUserRecord.USER_ID){
                    userId =userId+ currentUserRecord.USER_ID;
                }
                var currentUser=memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                if(currentUser && currentUser.OFTEN_NAME){
                    userName = currentUser.OFTEN_NAME;
                }
                var signature = Md5UtilService.md5(secureKey+timestamp+userId+userName);
                url = url+"?userId="+userId+"&userName="+userName+"&timestamp="+timestamp+"&signature="+signature;
                $scope.openUrl = $sce.trustAsResourceUrl(url);
            }
                break;
            case 3:{// 1：就诊陪诊页
                HomeService.withTheDiagnosis = 0;
                $scope.advName = KyeeI18nService.get("homeWeb.doctorAccompany","护士陪诊");
               goDiagosisUrlWeb();
            }
            case 4:{
                HomeService.withTheDiagnosis = 0;
                var url = HomeService.intelligentGuideUrl;
                $scope.openUrl = $sce.trustAsResourceUrl(url);
            }
                break;
            //治疗陪护
            case 5:{
                HomeService.withTheDiagnosis = 0;
                $scope.advName = "治疗陪护";
                //goodsType,tag =3,4治疗陪护
                goNurseEscortUrlWeb(3,4);
            }
                break;
            //护士上门
            case 6:{
                HomeService.withTheDiagnosis = 0;
                $scope.advName = "护士上门";
                //goodsType,tag =3,护士上门
                goNurseEscortUrlWeb(2,8);
            }
                break;
            default: //默认广告页
                var url =  HomeService.ADV_DATA.ADV_LOCAL;
                $scope.openUrl = $sce.trustAsResourceUrl(url);
                $scope.advName = HomeService.ADV_DATA.ADV_NAME;
                $scope.advShare = HomeService.ADV_DATA.ADV_SHARE;
                $scope.shareData = []; // 参数顺序：url, title, description
                if($scope.advShare) {
                    $scope.shareData.push(url);
                    $scope.shareData.push(HomeService.ADV_DATA.ADV_SHARE_TITLE);
                    $scope.shareData.push(HomeService.ADV_DATA.ADV_SHARE_DESC);
                }
                //edit by cuijin APP-361 趣医APP新增保险广告位
                if(url.indexOf("?uid=88888889&way=app_banner") >= 0){
                    //未登录默认"88888889"
                    var userId = "";
                    var memoryCache = CacheServiceBus.getMemoryCache();//全局参数
                    var currentUserRecord = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);//用户缓存
                    if(currentUserRecord && currentUserRecord.USER_ID){
                        userId =currentUserRecord.USER_ID;
                    }
                    if(userId != ""){
                        var userUrl = "uid=" + userId;
                        url = url.replace("uid=88888889", userUrl);
                    }
                    $scope.openUrl = $sce.trustAsResourceUrl(url);
                    window.location.href = $scope.openUrl;
                }
                // end by cuijin
                $scope.hasShareMenu = false; // 分享区域是否显示在页面上
        }

        // 分享面板方法绑定
        $scope.bind = function(params){
            $scope.showShareMenu = params.show;
            $scope.hideShareMenu = params.hide;
        };

        $scope.goBack = function() {
            $ionicHistory.goBack();
        };

        KyeeListenerRegister.regist({
            focus: "homeWeb",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function(params){
                params.stopAction();
                if($scope.hasShareMenu){
                    $scope.hideShareMenu();
                } else {
                    $scope.goBack()
                }
            }
        });

        //隐藏loading圈
        window.hideLoadByHomeWeb = function(){
            $ionicLoading.hide();
        };

    })
    .build();