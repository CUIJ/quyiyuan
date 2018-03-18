new KyeeModule()
    .group("kyee.quyiyuan.home.service")
    .require([
        "kyee.quyiyuan.newqueue.select.dept.service",
        "kyee.quyiyuan.queue.select.dept.service"
    ])
    .type("service")
    .name("HomeService")
    .params(["$rootScope","CacheServiceBus", "HttpServiceBus",
        "KyeeUtilsService", "NewQueueSelectDeptService", "QueueSelectDeptService",
        "KyeeMessageService", "MessageCenterService","KyeeI18nService",
        "$state", "MultipleQueryCityService","$location","PatientCardService"])
    .action(function ($rootScope,CacheServiceBus, HttpServiceBus,
                      KyeeUtilsService, NewQueueSelectDeptService, QueueSelectDeptService,
                      KyeeMessageService, MessageCenterService,KyeeI18nService,
                      $state, MultipleQueryCityService,$location,PatientCardService) {

        var def = {

            //是否陪诊入口进入公共web页面
            withTheDiagnosis:false,

            //陪诊域名
            diagnosisUrl:"",

            //陪诊域名微信公众号
            diagnosisUrlWeiXin:"",

            //在线咨询域名
            cusServiceUrl:"",

            //在线咨询网址密钥
            secureKey:"",

            // 智能导诊--护士导诊入口
            intelligentGuideUrl:"http://t.cn/RKEMKha",

            //公告web页面入参
            queryWebConfig:{
                advName:"",
                openUrl:""
            },


            // 保险页面路由
            insuranceWeb: {
                url: "",
                page: ""
            },

            //是否需要更新快捷按钮，首次需要更新
            isSelectedNewHospital: true,

            //记录首次是否同步医院数据
            isSyncHospitalData: false,

            //当前坐标
            currentCoordinate: new Object(),

            //从首页立即预约挂号进入选择医院
            isFromAppoint: false,

            homeParams:{
                NETWORK_SWITCH:'',
                DIAGNOSIS_SWITCH:'',
                DIAGNOSIS_URL:''
            },

            ADV_DATA: {}, // 广告页数据

            /**
             * 初始化
             */
            init: function () {
                //初始化缓存中的医院信息，此操作仅会在首次使用时执行
                var hospitalInfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                if (hospitalInfo == null) {

                    CacheServiceBus.getStorageCache().set(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO, {
                        id: "",
                        name: "",
                        address: "",
                        provinceCode: "",
                        provinceName: "",
                        cityCode: "",
                        cityName: ""
                    });

                    KyeeLogger.debug("已经初始化 HOSPITAL_INFO 的默认值于 StorageCache 中");
                }
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
                                var cityNameTxt = rs.addressComponents.city;
                                var cityDistrict = rs.addressComponents.district;
                                var districtTxt = rs.addressComponents.district;
                                if (cityName == "北京市" || cityName == "天津市" || cityName == "上海市" || cityName == "重庆市"){
                                    var point = new BMap.Point(rs.point.lng, rs.point.lat);

                                    var geocoder = new BMap.Geocoder();

                                    geocoder.getLocation(point, function (rss) {
                                        //如果是四大直辖市，则传省份名，取北京，上海。。。
                                        var provinceName = rss.addressComponents.province.substr(0,2);
                                        def.queryCityByName(rss.addressComponents.district, districtTxt, callBack);

                                    });
                                }else if(cityNameTxt.city == "咸阳市" && cityNameTxt.district == "杨陵区"){
                                    cityNameTxt.city = "杨凌示范区";
                                    def.queryCityByName(cityNameTxt, districtTxt, callBack);

                                }else {
                                    def.queryCityByName(cityNameTxt, districtTxt, callBack);

                                }
                            }
                        });

                });
            },
            getUserLocationInfo: function (callBack) {
            //ios外壳使用webview满足$location.$$absUrl.indexOf("file:///") != -1，使用wkwebview满足$location.$$absUrl.indexOf("localhost:8080/var") != -1
                if(($location.$$absUrl.indexOf("file:///") != -1 ||$location.$$absUrl.indexOf("localhost:8080/var") != -1)&& navigator.userAgent.toLowerCase().indexOf("iphone")!=-1){
                    KyeeUtilsService.conditionInterval({
                        time : 100,
                        conditionFunc : def.isShellLoadOk,
                        doFunc : function () {
                            def.localCityByIOS(callBack);
                        }
                    });
                }else{
                    def.localCityByBMap(callBack);
                }
            },
            isShellLoadOk:function(){
                return window.device;
            },


        /**
             * 通过外壳提供的方法定位
             */
            localCityByIOS: function (callBack) {
                navigator.map.getCityCode(
                    function (retVal) {
                        if (retVal.city) {
                            def.queryCityByName(retVal.city, retVal.district,callBack);
                        }
                    },
                    function (retVal) {
                    },
                    []
                );
            },

            queryCityByName: function (cityNameTxt, districtTxt, callBack) {
                var cityName = undefined;
                var cityCode = undefined;
                var provinceNameNew = undefined;
                var provinceCodeNew = undefined;

                MultipleQueryCityService.getCityInfoByName(cityNameTxt, function (data) {
                    //接口规范后处理  By  章剑飞   KYEEAPPC-3420
                    if (data.length > 0) {
                        provinceNameNew = data[0].PROVINCE_NAME;
                        cityName = data[0].CITY_NAME;
                        cityCode = data[0].CITY_CODE;
                        provinceCodeNew = data[0].PROVINCE_CODE;
                    } else {
                        cityName = cityNameTxt;
                        cityCode = '0000000';
                        provinceNameNew = KyeeI18nService.get("multiple_city_list.nationWide", "全国");
                        provinceCodeNew = '0000000';
                    }
                    var storageCache = CacheServiceBus.getStorageCache();
                    var placeCodes = CITY_DATA_4_CITY_PICKER.areas[cityCode];
                    //区编码
                    var placeCode = "";
                    //区名字
                    var placeName = "";
                    if(districtTxt && placeCodes){
                        for(var i = 0; i < placeCodes.length; i++){
                            if(districtTxt == placeCodes[i].text){
                                placeCode = placeCodes[i].value;
                                placeName = districtTxt;
                            }
                        };
                    }
                    var result = {
                        CITY_NAME: cityName,
                        CITY_CODE: cityCode,
                        PROVINCE_NAME: provinceNameNew,
                        PROVINCE_CODE: provinceCodeNew,
                        PLACE_NAME: placeName,
                        PLACE_CODE: placeCode,
                        LOCAL_TYPE: 0
                    };
                    storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.LOAD_CURRENT_CITY_INFO, result);

                    //def.loadingCityInformation =storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.LAST_PROVINCE_CITY_INFO);
                    KyeeMessageService.hideLoading();
                    if (callBack) {
                        callBack(result);
                    }
                });
            },


            /**
             * 新版预约挂号入口
             */
            goToAppointment: function () {

                //如果没选城市，则先选择城市，否则选择医院
                var storageCache = CacheServiceBus.getStorageCache();
                var selected = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.LAST_PROVINCE_CITY_INFO);
                //标识从预约挂号进入  By  章剑飞  KYEEAPPTEST-3161
                this.isFromAppoint = true;
                if(selected){
                    $state.go("hospital_selector");
                } else {
                    MultipleQueryCityService.goState = "hospital_selector";
                    $state.go('multiple_city_list');
                }
            },

            /**
             * 获取默认的快捷菜单图标
             *
             * @returns {*[]}
             */
            getDefaultShortcuts: function () {
                var showIcon = [
                    {
                        image_url: "resource/images/home/jiankangzixun.png",
                        name: KyeeI18nService.get('home->MAIN_TAB.healthInformation', '健康资讯', null),
                        href: "hospitalNotice"
                    },
                    {
                        image_url: "resource/images/home/ziwozhenduan.png",
                        name: KyeeI18nService.get('home->MAIN_TAB.symptomCheck', '症状自查', null),
                        href: "triageMain"
                    },
                    {
                        image_url: "resource/images/home/guanyuquyi.png",
                        name: KyeeI18nService.get('home->MAIN_TAB.aboutQuyi', '关于趣医', null),
                        href: "aboutquyi"
                    }

                ];
                var cache = CacheServiceBus.getMemoryCache();
                var userSource = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE);
                if (userSource == '2' || userSource == '4') {//福建12320  、健康河北
                    return showIcon.splice(0, 2);
                } else {
                    return showIcon;
                }
            },
            goQueueView: function ($state) {
                HttpServiceBus.connect(
                    {
                        url: "/sortquery/action/SortQueryActionC.jspx",
                        params: {
                            op: "getSortParams"
                        },
                        onSuccess: function (data) {//回调函数
                            if (data.success) {
                                var queueType = data.data.QUEUE_METHOD_CHOOSE; //1为新版，0为旧版
                                var queueOrCall = data.data.HAS_USER_QUEUELIST;//true为我的叫号有数据
                                var onlyCall = data.data.ONLY_USERQUEUE_INFO;//此医院直接进入我的叫号 1为直接接入我的叫号
                                var cache = CacheServiceBus.getMemoryCache();
                                cache.set(CACHE_CONSTANTS.MEMORY_CACHE.QUEUE_JUMP_VIEW, onlyCall);
                                if (queueType == "1" && (queueOrCall == "true" || onlyCall == "1")) {
                                    $state.go("new_queue_clinic");
                                } else if (queueType == "1" && queueOrCall == "false") {
                                    $state.go("new_queue");
                                } else if (queueType == "0" && (queueOrCall == "true" || onlyCall == "1")) {
                                    $state.go("queue_clinic");
                                } else {
                                    $state.go("queue");
                                }
                                //KYEEAPPTEST-2763   排队模块设置跳转标识    张明
                                NewQueueSelectDeptService.isHomeOrHospital = "home";
                                QueueSelectDeptService.isHomeOrHospital = "home";
                            } else {
                                if (data.alertType == 'ALERT' && data.message) {
                                    KyeeMessageService.broadcast({
                                        content: data.message
                                    });
                                }
                            }
                        }
                    }
                );
            },
            //获取网络医院参数
            getNetParams: function (getData) {
                HttpServiceBus.connect({
                    url: "/config/action/ParamsystemActionC.jspx",
                    params: {
                        op: "querySysParams",
                        PARA_CODE: "NETWORK_SWITCH,DIAGNOSIS_SWITCH,DIAGNOSIS_URL,DIAGNOSIS_URL_WEIXIN,CUS_SERVICE_URL,SECURE_KEY,CUS_SERVICE_SWITCH,PATIENTS_GROUP_SWITCH,RISK_SWITCH,RISK_URL,RISK_URL_WEIXIN,HEALTH_URL,INTELLIGENT_GUIDE_URL,ELECTRONIC_HEALTH_CARD_RHCM_ISOPEN"
                    },
                    cache: {
                        by: "TIME",
                        value: 60 * 60 * 24
                    },//24小时
                    onSuccess: function (data) {//回调函数
                        if (data.success&&data.data) {
                            var userRecord = CacheServiceBus.getMemoryCache().get("currentUserRecord");
                            //超级用户则开启网络医院  By  章剑飞  KYEEAPPC-3639
                            if (userRecord && userRecord.USER_TYPE == 1) {
                                data.data.NETWORK_SWITCH = 1;
                            }
                            if(data.data.DIAGNOSIS_URL){
                                def.diagnosisUrl = data.data.DIAGNOSIS_URL;
                            }
                            if(data.data.DIAGNOSIS_URL_WEIXIN){
                                def.diagnosisUrlWeiXin = data.data.DIAGNOSIS_URL_WEIXIN;
                            }
                            if(data.data.CUS_SERVICE_URL){
                                def.cusServiceUrl = data.data.CUS_SERVICE_URL;
                            }
                            if(data.data.SECURE_KEY){
                                def.secureKey=data.data.SECURE_KEY;
                            }
                            if(data.data.INTELLIGENT_GUIDE_URL){
                                def.intelligentGuideUrl=data.data.INTELLIGENT_GUIDE_URL;
                            }
                            //健康资讯上海地址
                            var healthUrl = "https://m.quyiyuan.com/info/";
                            //var healthUrl = "https://www.quyipay.cn/info/";
                            if(data.data.HEALTH_URL){
                                healthUrl   = data.data.HEALTH_URL;
                            }
                            if(data.data.ELECTRONIC_HEALTH_CARD_RHCM_ISOPEN == 1){
                                PatientCardService.ELECTRONIC_HEALTH_CARD_RHCM_ISOPEN = data.data.ELECTRONIC_HEALTH_CARD_RHCM_ISOPEN;
                            }
                            getData(data.data.NETWORK_SWITCH,data.data.DIAGNOSIS_SWITCH, data.data.DIAGNOSIS_URL,data.data.DIAGNOSIS_URL_WEIXIN,data.data.CUS_SERVICE_URL,data.data.SECURE_KEY,data.data.CUS_SERVICE_SWITCH,data.data.PATIENTS_GROUP_SWITCH,data.data.RISK_SWITCH,data.data.RISK_URL,data.data.RISK_URL_WEIXIN,healthUrl);
                        } else {
                            getData('0','0',"","","","","1",'0','false','','','https://m.quyiyuan.com/info/');
                        }
                    },
                    onError: function () {
                    }
                });
            },
            //检查权限
            checkRight: function (router) {
                var sudokuData = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOME_DATA);
                if (sudokuData) {
                    //更新九宫格权限
                    var menus = sudokuData.rights;

                    //有数据则获取配置信息，缓存中没有配置信息直接跳转，引导用户选择医院和就诊者
                    for (var i = 0; i < menus.length; i++) {
                        if (menus[i].MODULE_CODE == router && (menus[i].IS_ENABLE == 0 || menus[i].IS_VISIBLE == 0)) {
                            KyeeMessageService.message({
                                content: menus[i].DISABLEINFO,
                                okText: KyeeI18nService.get('commonText.iknowMsg', '我知道了', null)
                            });
                            return false;
                        }
                    }
                }
                return true;
            },
            //获取消息中心和小铃铛消息数量
            loadMessageNum: function (onSuccess) {
                var customPatient = CacheServiceBus.getMemoryCache().get('currentCustomPatient');
                var userRecord = CacheServiceBus.getMemoryCache().get('currentUserRecord');
                var userVsId = null;
                if(customPatient){
                    userVsId = customPatient.USER_VS_ID;
                }

                var userId = userRecord.USER_ID;
                // 本地消息数据
                // READ_MESSAGE_DATA : 已读消息数据
                // UNREAD_MESSAGE_DATA : 未读消息数据
                // LAST_DATE : 本地消息最后更新时间
                // COMM_LAST_DATE : 公共消息的最后更新时间
                var localMessageData = MessageCenterService.getLocalMessage('LOCAL_MESSAGE');
                var lastDate = undefined;
                var commLastDate = undefined;
                if (localMessageData) {
                    //个人消息
                    if (localMessageData.LAST_DATE && userVsId) {
                        lastDate = localMessageData.LAST_DATE[userVsId];
                    } else {
                        lastDate = '';
                    }
                    //公共消息
                    if (localMessageData.COMM_LAST_DATE) {
                        commLastDate = localMessageData.COMM_LAST_DATE[userId];
                    } else {
                        commLastDate = '';
                    }
                } else {
                    lastDate = '';
                    commLastDate = '';
                }
                HttpServiceBus.connect({
                    url: "/messageCenter/action/MessageCenterActionC.jspx",
                    showLoading : false,
                    params: {
                        op: "queryMessageNum",
                        USER_LAST_DATE: commLastDate,
                        LAST_DATE: lastDate
                    },
                    onSuccess: function (data) {//回调函数
                        if (data.success) {
                            $rootScope.noticeNum = data.data.messageWindowNum;
                            var localMessage = CacheServiceBus.getStorageCache().get('localMessageData');
                            var unReadNum = 0;
                            var localUnreadMessage = [];
                            if(localMessage && localMessage.UNREAD_MESSAGE_DATA){
                                angular.forEach(localMessage.UNREAD_MESSAGE_DATA, function (data) {
                                    //添加本用户的公共消息提取  By  章剑飞  KYEEAPPC-2965
                                    if (data.USER_VS_ID == userVsId
                                        || (data.MESSAGE_TYPE == '7' && data.USER_ID == userId)
                                        || (data.MESSAGE_TYPE == '13' && data.USER_ID == userId)) {
                                        localUnreadMessage.push(data);
                                    }
                                });
                                unReadNum = localUnreadMessage.length;
                            }
                            $rootScope.unreadMessageCount = parseInt(data.data.messageCenterNum) + unReadNum;
                           
                            
                        }
                    },
                    onError: function () {
                    }
                });
            },

            //加载首页图片
            loadHomeAdv:function(onSuccess){
                HttpServiceBus.connect({
                    url: "/advertisement/action/AdvappActionC.jspx",
                    showLoading:false,
                    params: {
                        op: "queryHomeAdvActionC"
                    },
                    onSuccess: function (data) {//回调函数
                        var imgs = def.setHomeAdv(data.data);
                        onSuccess(imgs);
                    },
                    onError: function () {
                    }
                });
            },
            //设置医院广告
            setHomeAdv:function (Advs){
                //处理广告数据
                var imgs = [];
                for (var i in Advs) {
                    if(Advs[i].ADV_IS_SHARE){
                        imgs.push({
                            id: Advs[i].ADV_ID,
                            url: Advs[i].ADV_URL,
                            web_url:Advs[i].ADV_LOCAL,
                            adv_name:Advs[i].ADV_NAME,
                            adv_class:Advs[i].ADV_CLASS,
                            adv_share:Advs[i].ADV_IS_SHARE,
                            adv_share_title:Advs[i].ADV_SHARE_TITLE,
                            adv_share_desc:Advs[i].ADV_SHARE_DESCRIBE
                        });
                    } else {
                        imgs.push({
                            id: Advs[i].ADV_ID,
                            url: Advs[i].ADV_URL,
                            web_url:Advs[i].ADV_LOCAL,
                            adv_name:Advs[i].ADV_NAME,
                            adv_class:Advs[i].ADV_CLASS,
                            adv_share:Advs[i].ADV_IS_SHARE
                        });
                    }
                }
                //如果该医院没有绑定广告，则显示默认广告
                if (imgs.length == 0 || AppConfig.BRANCH_VERSION != "00") {
                    imgs = HOSPITAL_DATA.defaultSlideboxData();
                }
                //保险广告位放置在第一位
                for(var i=0;i<imgs.length;i++){
                    if(imgs[i].web_url.indexOf("?uid=88888889&way=app_banner") >= 0){
                        var tmp = imgs[i];
                        imgs.splice(i,1);
                        imgs.unshift(tmp);
                    }
                }
                CacheServiceBus.getMemoryCache().set(CACHE_CONSTANTS.MEMORY_CACHE.HOME_ADV, imgs);
                return imgs;
            },
            //获取医院等级
            getHospitalLevel : function(hospitalId, onSuccess){

                HttpServiceBus.connect({
                    url : "/advertisement/action/AdvappActionC.jspx",
                    showLoading:false,
                    params : {
                        hospitalId : hospitalId,
                        op : "queryHospitalIntroduceActionC"
                    },
                    onSuccess : function(data){
                        onSuccess(data.data);
                    }
                });
            },

            isWeiXin: function(){
                var ua = window.navigator.userAgent.toLowerCase();
                if(ua.match(/MicroMessenger/i) == 'micromessenger'){
                    return true;
                }else{
                    return false;
                }
            },

            /**获取保险广告页链接
             * @param insuranceParam
             * {
             *    source 请求来源 APP,WEB,WEIXIN
             *    way   广告进入：advertisement，微信子菜单：submenu，微信文章：article
             *    insurancePage   advertisement 广告， myInsurance 我的保险, insuranceInfoConfirm 信息确认页
             *    riskCode   险种
             * }
             * @param userInfo
             * @param onSuccess
             */
            getInsurancePageUrl: function(insuranceParam, userInfo, onSuccess){
                HttpServiceBus.connect({
                    url: "advertisement/action/AdvappActionC.jspx",
                    showLoading: true,
                    params: {
                        op: "getInsurancePageUrl",
                        source: insuranceParam.source,
                        way: insuranceParam.way,
                        insurancePage: insuranceParam.insurancePage,
                        riskCode: insuranceParam.riskCode,
                        userInfo: userInfo
                    },
                    onSuccess: function(data){
                        onSuccess(data.data);
                    }
                });
            },

            // 进入保险的广告页
            openInsurancePage: function(){
                var currentUserRecord = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);

                var whereIComeFrom = "WEB";//APP WEIXIN WEB
                if (window.device &&(window.device.platform == "Android"||window.device.platform == "iOS")){
                    whereIComeFrom = "APP";
                }
                if(def.isWeiXin()){
                    whereIComeFrom = "WEIXIN";
                }

                var insuranceParam = {
                    source: whereIComeFrom,
                    way: "advertisement",
                    insurancePage: "advertisement"
                };

                def.getInsurancePageUrl(insuranceParam, currentUserRecord, function(url){

                    if(window.device && device.platform == "iOS"){
                        var cache = CacheServiceBus.getMemoryCache();
                        cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_VIEW_ROUTER, "home->MAIN_TAB");
                        window.open(url, "_blank", "location=yes");
                    }else if (whereIComeFrom == "WEIXIN"){
                        var openid = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_OPEN_ID);
                        if(openid){
                            url = url + "&" + openid;
                        }
                        window.location.href = url;
                    }else{
                        def.insuranceWeb ={
                            url : url
                        };
                        $state.go('insuranceWeb');
                    }
                });
            },

            // 在保险链接后面拼接用户参数
            // 证件类型 身份证 01
            getRiskUrl: function(url, userInfo){
                if(userInfo){
                    if(url.indexOf("?") > 0){
                        url = url + "&";
                    } else {
                        url = url + "?";
                    }

                    return url + "loginUid=" + userInfo.USER_ID +
                        "&loginName=" + (userInfo.NAME ? userInfo.NAME : "") +
                        "&loginIDType=" + "01" +
                        "&loginIDNo=" + (userInfo.ID_NO ? userInfo.ID_NO : "") +
                        "&loginPhone=" + (userInfo.PHONE_NUMBER ? userInfo.PHONE_NUMBER : "");
                }
            }
        };
        return def;
    })
    .build();
