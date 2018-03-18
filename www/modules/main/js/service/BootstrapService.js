/**
 * 启动器服务
 */
new KyeeModule()
    .group("kyee.quyiyuan.bootstrap.service")
    .type("service")
    .name("BootstrapService")
    .params(["CacheServiceBus", "HttpServiceBus",
        "KyeePushService", "MultipleQueryCityService", "WebUrlParamsService",
        "ChangeLanguageService","KyeeFileService",
        "HospitalSelectorService","HospitalNavigationService", "OperationMonitor",
        "KyeeOperationMonitorService", "KyeeActionHolderDelegate", "$rootScope",
        "KyeeEnv", "KyeeViewService", "$location",
        "KyeeUtilsService", "$state","PatientCardRechargeService",
        "$ionicHistory","LoginService","WXByLongYanService","CenterUtilService","HomeService","ReminderService","InpatientPaymentService",
        "MedicationPushService", "AppointmentDoctorDetailService", "AppointmentDeptGroupService","HealthService","ConsultOrderDetailService",
        "QuestionnaireSearchService"])
    .action(function(CacheServiceBus, HttpServiceBus,
                     KyeePushService, MultipleQueryCityService, WebUrlParamsService,
                     ChangeLanguageService, KyeeFileService,
                     HospitalSelectorService, HospitalNavigationService, OperationMonitor,
                     KyeeOperationMonitorService, KyeeActionHolderDelegate, $rootScope,
                     KyeeEnv, KyeeViewService, $location,
                     KyeeUtilsService, $state, PatientCardRechargeService,
                     $ionicHistory,LoginService,WXByLongYanService,CenterUtilService,HomeService,ReminderService,InpatientPaymentService,
                     MedicationPushService,AppointmentDoctorDetailService, AppointmentDeptGroupService,HealthService,ConsultOrderDetailService,
                     QuestionnaireSearchService){
        var def = {
            riskData: { // 打开保险页面的参数
                page: "",
                riskCode: ""
            },
            memoryCache: CacheServiceBus.getMemoryCache(),
            storageCache: CacheServiceBus.getStorageCache(),

            /**
             * 自定义过滤器完成函数
             */
            customFinishFn : function(returnView){
                if(returnView == "patient_card_recharge"){ //从就诊卡充值跳转  KYEEAPPC-4842 程铄闵
                    PatientCardRechargeService.getModule(function (route) {
                        PatientCardRechargeService.isFirstEnter = true;// KYEEAPPC-8088 程铄闵 2.3.10充值功能改版
                        $state.go(route);//KYEEAPPC-5217 程铄闵
                    },$state);
                }
            },

            /**
             * 准备App配置(App启动初始化的时候)
             */
            prepareAppConfigOnInit : function() {
                def.initMemoryCacheData();

                // APP不用处理个性化链接
                if($location.$$absUrl.indexOf("file:///") == -1||$location.$$absUrl.indexOf("localhost:8080/var") != -1){
                    def.judgeHomePageUrl();
                    def.forwardToUrl();
                    WebUrlParamsService.dealWithUrlParams($location.search());

                    var urlInfo = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL) || {};
                    //isShowAllTab=1标识趣医微信消息连接过来，展示所有标签
                    if(urlInfo.showAllRouter != 1 && urlInfo.hospitalID &&
                        !urlInfo.businessType && !urlInfo.isShowAllTab){
                        $rootScope.ROLE_CODE = "5";
                    }

                    // 安庆市第一人民医院公众号不显示侧边栏
                    if(urlInfo.PublicServiceType == "020064" && urlInfo.hospitalID == "5560001"){
                        $rootScope.hideRightMenu = true;
                    }
                }

                def.initIFrameNestingListener();
                $rootScope.IS_SHELL_LOAD = true;
            },

            initMemoryCacheData: function(){
                def.memoryCache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE, "0");
                def.memoryCache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_PUBLIC_SERVER_TYPE, DeploymentConfig.PUBLIC_SERVICE_TYPE);

                // 医疗云单家医院
                var singleHospitalId = def.storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.CURRENT_UNIQUE_HOSPITAL_ID);
                if(DeploymentConfig.SINGLE_HOSPITAL_ID != undefined && singleHospitalId != ""){
                    def.storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.CURRENT_UNIQUE_HOSPITAL_ID,DeploymentConfig.SINGLE_HOSPITAL_ID);
                }else{
                    def.storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.CURRENT_UNIQUE_HOSPITAL_ID,"");
                }

                if(DeploymentConfig.GROUP_HOSPITAL_FLAG != undefined){
                    def.memoryCache.set(CACHE_CONSTANTS.MEMORY_CACHE.GROUP_HOSPITAL_FLAG,DeploymentConfig.GROUP_HOSPITAL_FLAG);
                }else{
                    def.memoryCache.set(CACHE_CONSTANTS.MEMORY_CACHE.GROUP_HOSPITAL_FLAG,"");
                }

                var token = new Date().getTime(); // 自动生成用于完整性校验的 token
                def.memoryCache.set(CACHE_CONSTANTS.MEMORY_CACHE.TOKEN_4_FULL_CHECK, token);
            },

            /**
             * 准备App配置(App启动完成以后)
             */
            prepareAppConfigOnFinash : function () {
                 localStorage.setItem("appVersion",AppConfig.VERSION) ;
                clairvoyant.config({
                    appId:"378bd9334d5657d78942341fb7c60df3"
                })
                def.initAppUUID();
                KyeeActionHolderDelegate.init({ // 初始化 KyeeActionHolder 配置
                    cacheKey: CACHE_CONSTANTS.STORAGE_CACHE.CURR_HOSPITAL_KAH
                });
                def.openBaiDuPush(); // 开启百度推送
                KyeeLogger.setLevel(AppConfig.LOG_LEVEL); // 设置日志级别
                def.enableAddToHomeScreenPlugins(); // 仅在 IOS 设备上并且为发布模式时才启用 addToHomeScreen 插件
                def.initServerUrl(); // 获取配置给运维使用的指向指定IP的参数
            },

            /**
             * 准备App数据(App启动完成以后)
             */
            prepareAppData : function () {
                if($location.$$absUrl.indexOf("file:///") != -1||$location.$$absUrl.indexOf("localhost:8080/var") != -1){
                    document.addEventListener("resume", function () { // 应用唤醒事件，刷新城市和医院
                        def.initCityData();
                    }, false);
                }

                def.initCityData(function(){
                    if(LoginService.autoLoginFlag!=2){
                        LoginService.autoLoginFlag = 1;
                        LoginService.autoLoad();
                    }
                });
                ChangeLanguageService.updateRootScopeLangText(); // 更新全局待翻译数据
                ChangeLanguageService.checkLanguageSwitch(); // 检测多语言开关是否开启
                OperationMonitor.sendOperationRecordsOnStartUp(); // 程序初始化的时候发送上一次剩余的操作记录

                // 向服务器请求保险链接
                if(def.riskData && def.riskData.page){
                    def.initInsurancePageUrl(def.riskData.page, def.riskData.riskCode);
                }
            },

            /**
             * 准备rootScope(App启动完成以后)
             */
            prepareRootScope : function () {
                $rootScope.openRightMenu = function () { // 打开右侧快捷菜单
                    KyeeViewService.toggleSideMenu({
                        direction: "RIGHT",
                        status: true
                    });
                };
                $rootScope.rightMenuGo = function (action) { // 右侧快捷菜单功能
                    KyeeViewService.toggleSideMenu({
                        direction: "RIGHT",
                        status: false
                    });
                    var patientsGroupIsOpen = def.storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.PATIENTS_GROUP_SWITCH);
                    if(action == "messagecenter" && $rootScope.IS_SHELL_LOAD && patientsGroupIsOpen){
                        action = "message->MAIN_TAB";
                    }
                    if(action != "messagecenter") {
                        $ionicHistory.clearCache();
                    }
                    $state.go(action);
                };
                $rootScope.isShowClientPage =function(){
                    var urlInfo = def.memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
                    if(urlInfo && urlInfo.hospitalID && !urlInfo.businessType){
                        return false;
                    }else{
                        return true;
                    }
                };
            },

            /**
             * 获取配置给运维使用的指向指定IP的参数，如有则修改指向IP，无则什么都不做
             */
            initServerUrl : function(){
                var address = $location.search()["address"];
                if(address){
                    var defaultUrl = DeploymentConfig.SERVER_URL_REGISTRY.default || ""; //获取旧的指向IP或域名
                    var begin = (address.indexOf("http") != -1) ? 0 : defaultUrl.indexOf("//") + 2;
                    var end = 0;
                    var reg = /^.*:[0-9]*$/;
                    if(reg.test(address)){
                        end = defaultUrl.indexOf("/APP", begin);
                    } else {
                        var firstIndex = defaultUrl.indexOf(":");
                        end = defaultUrl.indexOf(":", firstIndex + 1);
                    }
                    var oldAddress = defaultUrl.slice(begin, end);
                    DeploymentConfig.SERVER_URL_REGISTRY.default = defaultUrl.replace(oldAddress, address);
                }
            },

            // 处理wx_forward路由及url参数
            dealWxForwardParams: function(data){
                // 标识微信满意度评价来源
                def.memoryCache.set(CACHE_CONSTANTS.MEMORY_CACHE.WX_OPEN_PATIENT, 1);
                var wx_forward = data.wx_forward || "";
                var state = wx_forward;  // 跳转页面路由
                switch(wx_forward){
                    case "message_main":
                        state = "message->MAIN_TAB";
                        break;
                    case "medication_push":
                        if(data.hcrmMsgType){//大通道推送的用药到消息中心页面
                            state = "message->MAIN_TAB";
                        }else {
                            state = "medication_push";
                        }
                        break;
                    case "hospital_navigation":
                        HospitalNavigationService.lastClassName = "appointment_regist_detil";
                        HospitalNavigationService.fixedPositionInfro = {
                            // 兼容之前的版本，以后统一使用hospitalID
                            HOSPITAL_ID: data.hospitalId ? data.hospitalId: data.hospitalID,
                            DEPT_NAME: decodeURI(data.deptName)
                        };
                        state = wx_forward;
                        break;
                    case "clinic_payment_revise":
                        if(data.SEND_ID){
                            def.SMSparameterConfiguration(data.SEND_ID);
                        }else{
                            state = wx_forward;
                        }
                        break;
                    case "hospital_selector":
                        if('12' == data.userSource){
                            var storageCityInfo = {
                                PROVINCE_NAME: '河南',
                                PROVINCE_CODE: '410000',
                                CITY_NAME: '洛阳市',
                                CITY_CODE: '410300'
                            };
                            def.storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.LAST_PROVINCE_CITY_INFO, storageCityInfo);
                        }else if('020073' == data.PublicServiceType){ // 驻马店市卫计委：若上次有已选择医院则跳转至医院界面；否则重定位为医院选择界面
                            var storageCityInfo = {
                                PROVINCE_NAME: '河南',
                                PROVINCE_CODE: '410000',
                                CITY_NAME: '驻马店市',
                                CITY_CODE: '411700'
                            };
                            def.storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.LAST_PROVINCE_CITY_INFO, storageCityInfo);
                            var selected = def.storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                            if(selected && selected.id){
                                state = "home->MAIN_TAB";
                            } else {
                                state = wx_forward.replace(/\./g,"/");
                            }
                        }
                        break;
                    default: state = wx_forward.replace(/\./g,"/");
                }

                if(state == "insuranceWeb" || state == "insuranceInfoConfirm"){
                    def.riskData.page = state;
                    if(data.riskCode){
                        def.riskData.riskCode = data.riskCode;
                    }
                    state = "insuranceWeb";
                }
                if(state == "login" && data.riskUrl){
                    // 替换保险链接中的特殊字符
                    data.riskUrl = data.riskUrl.replace(/@@/g, "#").replace(/\$@\$/g, "?").replace(/!@!/g, "=").replace(/\*@\*/g, "&");
                    LoginService.insuranceUrl = data.riskUrl;
                    LoginService.frontPage = "5";
                    def.clearStorageHistory(); // 从微信保险进来清除缓存数据记录，不执行自动登录
                }

                if(data.wxPublicService){
                    def.dealPatientsGroupMessageUrl(data);
                }

                return state;
            },

            /**
             * 提供直接跳转到具体页面的url
             */
            forwardToUrl : function(){
                var url = $location.$$absUrl;
                var state = "";

              /*  if(url.indexOf("?") == -1){
                    return;
                }*/

                var urlParams = url.substring(url.indexOf("?") + 1, url.indexOf("#"));
                if(urlParams.length > 0){
                    var data = KyeeUtilsService.parseUrlParams(urlParams);

                    // 处理wx_forward链接参数
                    if(data.wx_forward){
                        //更新data数据对应的具体属性值到缓存
                        def.dealDataInfo(data);
                        state = def.dealWxForwardParams(data);
                    }
                    //处理我家亳州链接参数
                    else if(url.indexOf("boZhouAppQuickEvaluated") != -1){
                        if(data.boZhouAppQuickEvaluated == "sms_quick_evaluate"){
                            //更新data数据对应的具体属性值到缓存
                            def.dealDataInfo(data);
                            state = data.boZhouAppQuickEvaluated;
                        }
                        if(data.boZhouAppQuickEvaluated == "triageMain"){
                            def.dealDataInfo(data);
                            state = data.boZhouAppQuickEvaluated;
                            LoginService.fromBozhou = true;
                        }
                    }

                    if('medicalGuide'== state || 'appoint_medicalGuide'== state){
                        $location.$$path = '/myquyi->MAIN_TAB/medicalGuide';
                    } else if('home'== state){
                        $location.$$path = '/home->MAIN_TAB';
                    }else if(state){
                        $location.$$path = "/" + state;
                    }

                    //短信链接跳转到检查检验单Url的控制
                    if(data.isShortMessageUrl){
                        def.shortMessageUrlToReportCtr(data);
                    }
                }

                // 电话预约
                if(url.indexOf("wx_forward") == -1 && url.indexOf("telappoint") != -1){
                    var urlArray = url.substr(url.lastIndexOf('telappoint/') + 'telappoint/'.length).split('/');
                    if (urlArray.length >= 3) {
                        var storageTelUserInfo = {
                            HOSPITAL_ID: urlArray[0],
                            PHONE_NUMBER : urlArray[1],
                            TEL_USER_ID : urlArray[2],
                            KEY:urlArray[3]
                        };
                        def.storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.TEL_USER_INFO, storageTelUserInfo);
                        def.storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO,[]);
                        $location.$$path = '/tel_appointment';
                    }
                }
                // 保险
                if(url.indexOf("wx_forward") == -1 && url.indexOf("insuranceToAPP") != -1) {
                    var urlArray = url.substr(url.lastIndexOf('insuranceToAPP/') + 'insuranceToAPP/'.length).split('/');
                    if (urlArray.length >= 5) {
                        var storageTelUserInfo = {
                            APP_ROUTER: urlArray[0],
                            HOSPITAL_ID: urlArray[1],
                            REG_ID: urlArray[2],
                            T_USER_ID: urlArray[3],
                            USERVS_ID: urlArray[4],
                            PHONE_NUMBER: urlArray[5],
                            KEY: urlArray[6],
                            URL_SOURCE: "insurance"
                        };
                        def.storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.INSURANCE_USER_INFO, storageTelUserInfo);
                        def.storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO, []);
                        $location.$$path = '/insurance_back_app';
                    }
                }
            },
            /**
             * 处理病友圈消息链接
             */
            dealPatientsGroupMessageUrl : function(urlParamData){
                if(CenterUtilService.isDataBlank(urlParamData.hospitalId) && CenterUtilService.isDataBlank(urlParamData.hospitalID)){
                    return;
                }
                if(CenterUtilService.isDataBlank(urlParamData.wx_forward) || CenterUtilService.isDataBlank( urlParamData.openId)){
                    return;
                }
                //patientType合法性校验 0:体验就诊者;1: 非体验就诊者
                if("0" != urlParamData.patientType &&  "1" != urlParamData.patientType){
                    return;
                }
                //参数合法性校验：体验就诊者hospital_id为"1001",非体验就诊者则hospital_id不能为“1001”
                if(("0" == urlParamData.patientType && urlParamData.hospitalId != "1001")
                    || ("1" == urlParamData.patientType && urlParamData.hospitalId == "1001")){
                    return;
                }
                //标识校验
                if("0" != urlParamData.userSource || "020000" != urlParamData.PublicServiceType ||
                    "1" != urlParamData.wxPublicService){
                    return;
                }
                //edit by wangsannv   KYEEAPPC-10248
                var urlForward = urlParamData.wx_forward;
                var messagePkValue = urlParamData.messagePkValue;

                //微信跳转页面需要用户信息（用于自动登录判断）
                if (CenterUtilService.isDataBlank(urlParamData.userId)
                    || CenterUtilService.isDataBlank(urlParamData.userVsId)) {
                    return;
                }
                //是否是病历提醒
                if (urlForward == "medical_record_reminder") {
                    ReminderService.messageId = messagePkValue;
                    ReminderService.isMedicalRecordFromWeiXin = true;
                }
                //是否是医嘱提醒
                else if (urlForward == "medical_orders_reminder") {
                    ReminderService.messageId = messagePkValue;
                    ReminderService.isDoctorOrderFromWeiXin = true;
                }
                //是否是检验检查单提醒
                else if (urlForward == "report_reminder") {
                    ReminderService.isReportFromWeiXin = true;
                    ReminderService.messageId = messagePkValue;
                }
                //是否是每日清单提醒
                else if (urlForward == "myquyi_inpatient_payment") {
                    InpatientPaymentService.messageId = messagePkValue;
                    InpatientPaymentService.isFromWeiXin = true;
                }
                //用药提醒
                else if ("medication_push" == urlForward
                    && urlParamData.hcrmMsgType == undefined) {
                    MedicationPushService.isFromWeChat = true;
                    MedicationPushService.messageId = messagePkValue;
                }
                else if("consult_order_detail" == urlForward || "consult_pay" == urlForward ||
                    "wait_chatting" == urlForward || "consult_satisfaction" == urlForward ||
                    "purchase_medince" == urlForward){

                    ConsultOrderDetailService.isFromWeiXin = true;
                }

                LoginService.isWeiXinReqFlag = 1; //设置微信请求标识

                LoginService.wxParamObj = { //设置微信请求参数
                    wxForward:urlParamData.wx_forward,
                    wxUserId : urlParamData.userId,
                    wxUserVsId : urlParamData.userVsId,
                    wxUserSource : urlParamData.userSource,
                    wxOpenId : urlParamData.openId,
                    wxPatientType : urlParamData.patientType,
                    wxHospitalId : urlParamData.hospitalId,
                    wxHcrmMsgType:urlParamData.hcrmMsgType,
                    wxDeptCode: urlParamData.deptCode,//一级科室Code
                    wxPushType: urlParamData.pushType,//微信推送类型
                };
            },

            /**
             * 从短信跳转过来的链接处理
             */
            shortMessageUrlToReportCtr : function(urlParamData){
                if(CenterUtilService.isDataBlank(urlParamData.hospitalId) && CenterUtilService.isDataBlank(urlParamData.hospitalID)){
                    return;
                }
                //isShortMessageUrl合法性校验 1 代表从短信链接请求过来的
                if("1" != urlParamData.isShortMessageUrl && "2" != urlParamData.isShortMessageUrl){
                    return;
                }
                //必传参数校验，无则不做处理。isShortMessageUrl：1 代表从短信链接请求过来的
                if(urlParamData.isShortMessageUrl=="1" && (CenterUtilService.isDataBlank(urlParamData.userVsId)||
                    CenterUtilService.isDataBlank(urlParamData.userId))){
                    return;
                }
                if(urlParamData.isShortMessageUrl=="2" && CenterUtilService.isDataBlank(urlParamData.name)){
                    return;
                }
                def.clearStorageHistory(); //清除缓存数据 modifyBy liwenjuan
                if("1" == urlParamData.isShortMessageUrl){
                    LoginService.isShortMesReqFlag = 1;
                    $location.$$path = "/login";
                }else if("2" == urlParamData.isShortMessageUrl){
                    LoginService.isShortMesReqFlag = 2;
                    $location.$$path = "/regist";
                }
                LoginService.smParamObj = { //设置短信请求参数
                    smHospitalId : urlParamData.hospitalId,
                    smUserVsId : urlParamData.userVsId,
                    smUserId : urlParamData.userId,
                    smName : decodeURIComponent(urlParamData.name)
                };
            },

            /**
             * 保险事业部调用的JS接口
             * @param params
             */
            onCallFromBX: function (result) {
                if (result == "qy_close") {
                    var cache = CacheServiceBus.getMemoryCache();
                    var currentViewRouter = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_VIEW_ROUTER);
                    $state.go(currentViewRouter,{}, { reload: true });
                }
                if (result == "qy_to_medicalGuide") {
                    $state.go("myquyi->MAIN_TAB.medicalGuide");
                }
                if(result.indexOf("qy_login_") == 0){
                    var url = result.slice(9);
                    if(url.indexOf("http//") != -1){
                        url = url.replace("http//", "http://");
                    }
                    if(url.indexOf("https//") != -1){
                        url = url.replace("https//", "https://");
                    }
                    LoginService.insuranceUrl = url;
                    LoginService.frontPage = "5";
                    $state.go("login");
                }
                //健康资讯详情页
                if(result.indexOf("qy_healthInfo_detail_") == 0){
                    HealthService.HEALTH_DETAIL_CODE = result.slice(21);
                    $state.go("health_consultation_detail");
                }
            },

            /**
             * 判断默认跳转到C端首页时进行判断 addBy liwenjuan 2017/3/3
             */
            judgeHomePageUrl: function(){
                var homePathArr = ['/home->MAIN_TAB', '/health->MAIN_TAB', '/myquyi->MAIN_TAB/medicalGuide','/center->MAIN_TAB','/my_health_archive'];
                if(-1 == homePathArr.indexOf($location.$$path)){
                    var hospitalInfo = def.storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO); //获取医院信息缓存  by  章剑飞  APPCOMMERCIALBUG-2003
                    var mainPageFlag = -1; //-1默认跳转至首页
                    if(hospitalInfo){
                        mainPageFlag = Math.round(hospitalInfo.value || -1);
                    }
                    //缓存中有医院默认跳转页标识  by  章剑飞  APPCOMMERCIALBUG-2003
                    switch(mainPageFlag){
                        case 1: $location.$$path = homePathArr[0]; break;
                        case 2: $location.$$path = homePathArr[1]; break;
                        case 3: $location.$$path = homePathArr[2]; break;
                        default: $location.$$path = '/home->MAIN_TAB';
                    }
                }
            },

            /**
             * 短信接入参数配置 addBy liwnejuan 2017/3/3
             * @param sendId
             * @constructor
             */
            SMSparameterConfiguration: function(sendId){
                if(sendId){
                    HttpServiceBus.connect({ //如果短信点击进入，则更新短信点击标识
                        url: "payment/action/PaymentActionC.jspx",
                        params: {
                            SEND_ID:sendId,
                            op: "updateSmsClickFlag"
                        }
                    })
                }
            },

            /**
             * 处理data相关属性的信息更新到缓存 addBy liwenjuan 2017/3/3
             * @param data
             */
            dealDataInfo: function(data){
                def.memoryCache.set(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL, data);
                if(data.hospitalID){
                    WXByLongYanService.getWXHospitalInfro(data);
                }
                if(data.userSource){
                    def.memoryCache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE,data.userSource);
                }
                if(data.PublicServiceType){
                    def.memoryCache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_PUBLIC_SERVER_TYPE, data.PublicServiceType);
                }
                if(data.openid){
                    def.memoryCache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_OPEN_ID, data.openid);
                }
                if(data.noLoginAndPatient){
                    def.memoryCache.set(CACHE_CONSTANTS.MEMORY_CACHE.NO_LOGIN_AND_PATIENT, data.noLoginAndPatient);
                }
                if(data.isYsbzWx){
                    def.memoryCache.set(CACHE_CONSTANTS.MEMORY_CACHE.YSBZ_WX_FLAG, data.isYsbzWx);
                }

            },

            /**
             * 清除缓存数据 addBy liwenjuan 2017/3/7
             */
            clearStorageHistory: function(){
                def.storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.USER, "");
                def.storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.PWD, "");
                def.storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.SECURITY_CODE, "");
                def.storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.YX_LOGIN_INFO,undefined);
                def.storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.USER_ACT_INFO,undefined);
                def.storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.USER_ID,undefined);
                def.memoryCache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_PWD,undefined);  //MemoryCache中的密码
                def.memoryCache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CARD_INFO, undefined);
                def.memoryCache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD, undefined);
                def.memoryCache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT, undefined);
                def.memoryCache.set(CACHE_CONSTANTS.MEMORY_CACHE.IS_LOGIN, false);
            },

            /**
             * 初始化irame嵌套全局监听器 addBy liwenjuan 2017/3/6
             */
            initIFrameNestingListener: function(){
                KyeeOperationMonitorService.monitorServiceName = "OperationMonitor";
                KyeeOperationMonitorService.monitorMethodName = "record";

                window.addEventListener("message", function(event){
                    if(event.data == "qy_close"){
                        $ionicHistory.goBack();
                    }
                    if(event.data == "qy_to_medicalGuide"){
                        $state.go("appointment_regist_list");
                    }
                    if(event && event.data && event.data.indexOf("qy_login_") == 0){
                        LoginService.insuranceUrl = event.data.slice(9);
                        LoginService.frontPage = "5";
                        $state.go("login");
                    }
                    //健康资讯详情页
                    if(event && event.data && event.data.indexOf("qy_healthInfo_detail_") == 0){
                        HealthService.HEALTH_DETAIL_CODE = event.data.slice(21);
                        $state.go("health_consultation_detail");
                    }
                },false);
            },

            initAppUUID: function(){
                if (window.device && window.device.platform == "Android"){
                    var appUUId = def.storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.APP_UUID);
                    if(!appUUId){
                        def.setAppUUID("readFile");
                    }
                }
            },

            /**
             * 设置以及初始化app_UUID addBy liwenjuan 2017/3/6
             * @param type writeFile（app_uuid必传）写入app_uuid  readFile读取app_uuid
             * @param appUUId
             */
            setAppUUID: function(type, appUUId){
                if (window.device && window.device.platform == "Android"){ // 从SD卡读取APP_UUID
                    if("writeFile" == type){
                        def.storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.APP_UUID, appUUId);
                        KyeeFileService.writeFile(
                            function(evt){
                            },
                            function(evt){
                            },
                            [appUUId,"qyrec","stores.txt"]
                        );
                    }else if("readFile" == type){
                        KyeeFileService.readFile(
                            function(evt){
                                var result= evt.target.result;
                                if(result){
                                    def.storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.APP_UUID,result);
                                }else{
                                    def.getAppUUID();
                                }
                            },
                            function(evt){
                                def.getAppUUID();
                            },
                            "qyrec/stores.txt");
                    }
                }
            },

            /**
             * 生成程序唯一标示符
             */
            getAppUUID : function(){
                HttpServiceBus.connect({ //从服务器端拉取 UUID
                    url : "/user/action/LoginAction.jspx",
                    params : {
                        op : "getAppUUID"
                    },
                    showLoading : false,
                    onSuccess : function(data){
                        if(data.success){
                            def.setAppUUID("writeFile", data.data.APP_UUID);
                        }
                    }
                });
            },

            /**
             * 开启百度推送 addBy liwenjuan 2017/3/6
             */
            openBaiDuPush: function(){
                if($location.$$absUrl.indexOf("file:///") == -1||$location.$$absUrl.indexOf("localhost:8080/var") != -1){
                    return; // 网页版没有推送功能
                }

                if (window.device && navigator.push) { // 开启百度推送
                    if (window.device.platform == "Android") {
                        navigator.push.init("");
                    } else if (window.device.platform == "iOS") {
                        navigator.push.init();
                    }
                }
                var delay = KyeeUtilsService.delay({
                    time:3000,
                    action:function(){
                        var channelId = KyeePushService.getChannelId();
                        def.memoryCache.set(CACHE_CONSTANTS.MEMORY_CACHE.CHANNEL_ID, channelId);
                        KyeeUtilsService.cancelDelay(delay);
                    }
                });
            },

            /**
             * addBy liwenjuan 2017/3/6
             * 仅在 IOS 设备上并且为发布模式时才启用 addToHomeScreen 插件
             */
            enableAddToHomeScreenPlugins: function(){
                if (AppConfig.MODE == "DEPLOYMENT" && window.device.platform == "iOS") {
                    addToHomescreen({
                        skipFirstVisit: false,
                        startDelay: 2,
                        lifespan: 0,
                        displayPace: 0,
                        privateModeOverride: true,
                        maxDisplayCount: 0
                    });
                }
            },

            /**
             * 初始化，直接刷新城市和医院
             * @param callback
             */
            initCityData: function(callback){
                MultipleQueryCityService.getProvinceListData(true,function(){});
                MultipleQueryCityService.getCityListData('0','0000000',true,function(){});
                HospitalSelectorService.getHospitalListData('0000000','0000000',true,function(){
                    callback && callback();
                });
            },

            /**
             * 初始化保险参数相关
             * @param page
             * @param code
             */
            initInsurancePageUrl: function(page, code){
                var insuranceParam = null;
                if(page == "insuranceWeb"){
                    insuranceParam = {
                        source: "WEIXIN",
                        way: "submenu",
                        insurancePage: "myInsurance"
                    };
                } else if(page == "insuranceInfoConfirm"){
                    insuranceParam = {
                        source: "WEIXIN",
                        way: "article",
                        insurancePage: "insuranceInfoConfirm",
                        riskCode: code
                    };
                }
                HomeService.getInsurancePageUrl(insuranceParam, null, function(url) {
                    var openid = def.memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_OPEN_ID);
                    if(page == "insuranceWeb" && openid){
                        url = url + "&openid=" + openid;
                    }
                    window.location.href = url;
                });
            },

            /**
             * 初始化拦截器 addBy liwenjuan 2017/3/7
             * @param routerName
             */
            initFilter: function(routerName,event,filterChainInvoker){
                var filter = FilterConfig.viewFilter[routerName];
                if (filter) {
                    var rs = filterChainInvoker.isPass({
                        id: filter.chainId
                    });
                    if (!rs) {
                        filterChainInvoker.invokeChain({ //执行过滤器链
                            id: filter.chainId,
                            token: routerName, //使用 routerName 作为 token
                            event: event,
                            onFinash: function () { //返回到执行的视图
                                if(filter.needCustomFinishFn){
                                    def.customFinishFn(filter.returnView);//KYEEAPPC-4842 跳转后执行其它操作
                                } else {
                                    $state.go(filter.returnView);
                                }
                            },
                            onCancel : function(){}
                        });
                    }
                }
            },

            /**
             * 初始化主页面菜单tab
             * @param routerName
             */
            initTabMenu: function(routerName){
                var tabMenu = ['home->MAIN_TAB','health->MAIN_TAB','message->MAIN_TAB','myquyi->MAIN_TAB.medicalGuide','center->MAIN_TAB'];
                if(-1 == tabMenu.indexOf(routerName)){
                    return;
                }
                if($rootScope.ROLE_CODE == "5"){
                    var subTabMenu = tabMenu.slice(0,1).concat(tabMenu.slice(2)); //服务、病友圈  'health->MAIN_TAB'、'message->MAIN_TAB'去掉
                    var index = subTabMenu.indexOf(routerName);
                    KyeeViewService.selectTabView('tabbar',index);
                } else if($rootScope.IS_SHELL_LOAD){
                    var subTabMenu = tabMenu;
                    var index = subTabMenu.indexOf(routerName);
                    KyeeViewService.selectTabView('tabbar',index);
                } else {
                    var subTabMenu = tabMenu.slice(0,2).concat(tabMenu.slice(3)); //病友圈  'message->MAIN_TAB' 去掉
                    var index = subTabMenu.indexOf(routerName);
                    KyeeViewService.selectTabView('tabbar',index);
                }
            }
        };
        return def;
    })
    .build();