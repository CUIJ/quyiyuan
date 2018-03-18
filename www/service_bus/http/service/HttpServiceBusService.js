new KyeeModule()
    .group("kyee.quyiyuan.service_bus.http.service")
    .type("service")
    .name("HttpServiceBusService")
    .params(["$state", "KyeeMessageService", "KyeeViewService", "CacheServiceBus", "KyeeEnv",
        "KyeeUtilsService", "$window","$rootScope"
    ])
    .action(function($state, KyeeMessageService, KyeeViewService, CacheServiceBus,
                     KyeeEnv, KyeeUtilsService, $window,$rootScope) {

        var def = {

            //LoginService无法直接注入，因此在TabsController中将其传入
            LoginService : {},

            //url 前缀模式
            URL_PREFIX_PATTERN : RegExp("^(.*:).*$"),

            /**
             * 就绪参数
             */
            prepareParams : function(config){

                var me = this;

                var params = {};
                if(AppConfig.SERVICE_BUS.http.default_params != undefined){
                    for(var name in AppConfig.SERVICE_BUS.http.default_params)	{
                        params[name] = AppConfig.SERVICE_BUS.http.default_params[name];
                    }
                }
                if(config.params != undefined){
                    for(var name in config.params){
                        params[name] = config.params[name];
                    }
                }

                //过滤参数
                var paramsWiper = config.paramsWiper;
                if(paramsWiper != undefined){

                    for(var i in paramsWiper){

                        var expr = paramsWiper[i];
                        if(params[expr] != undefined){
                            params[expr] = undefined;
                        }
                    }
                }

                return params;
            },

            /**
             * 生成数据完整性摘要码（GET）
             *
             * @param config
             * @returns {*}
             */
            generateFullCheckCode4GET : function(config){

                var me = this;

                var token = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.TOKEN_4_FULL_CHECK);

                //注意，此处需要 encodeURI 对 url 编码，否则汉字计算出的 md5 值将于真实 url 计算后的值不匹配
                var paramsDigestCode = KyeeUtilsService.SecurityUtils.md5(config.urlParamsString);
                return KyeeUtilsService.SecurityUtils.md5(paramsDigestCode + "@@" + token);
            },

            /**
             * 生成数据完整性摘要码（POST）
             *
             * @param config
             * @returns {*}
             */
            generateFullCheckCode4POST : function(config){

                var me = this;

                var paramsKey = KyeeKit.keys(config.data).sort();
                var paramsSer = "";
                for(var i in paramsKey){

                    var key = paramsKey[i];
                    var value = config.data[key];

                    //不能序列化 undefined 或 null 的值，因为 angular 会自动忽略
                    if(value != undefined && value != null){

                        //如果是 object 类型的值，则对此值序列化，以保证前端的属性顺序与后端接收的顺序一致
                        if(typeof value == "object"){

                            var valueSer = JSON.stringify(value);

                            //覆盖原始值
                            config.data[key] = valueSer;

                            paramsSer += (key + "=" + valueSer + "&");
                        }else{
                            paramsSer += (key + "=" + value + "&");
                        }
                    }
                }
                paramsSer = paramsSer.substring(0, paramsSer.length - 1);
                config.urlParamsString = paramsSer;

                return me.generateFullCheckCode4GET(config);
            },

            /**
             * 解析 url 地址
             *
             * @param originalUrl
             * @returns {*}
             */
            parseUrl : function(originalUrl){

                var me = this;

                if(me.URL_PREFIX_PATTERN.test(originalUrl)){

                    //抽取 url 标示 key（不包含：）
                    var prefix = me.URL_PREFIX_PATTERN.exec(originalUrl)[1].replace(":", "");

                    return originalUrl.replace(prefix + ":", AppConfig.SERVER_URL_REGISTRY[prefix]);
                }

                return AppConfig.SERVER_URL_REGISTRY.default + originalUrl
            },

            /**
             * onBeforeCache 事件
             */
            doDefaultBeforeCacheAction : function(data){

                if(data != undefined && data != null && data.success != undefined && (data.success === false || data.success === "false")){
                    return false;
                }
                return true;
            },

            /**
             * 请求过滤
             * @param resp
             * @param onSuccess
             */
            filter : function(resp, onSuccess, onError){
                var me = this;
                //处理异常情况
                if(resp != undefined && resp != null && resp.success != undefined && resp.success == false){

                    var resultCode = resp.resultCode;
                    var message = resp.message;
                    var next = resp.next;

                    KyeeLogger.warn("HttpServiceBus：请求不成功，resultCode=" + resultCode);

                    //如果该请求被服务器端 op 拦截，则显示消息后并终止后续业务操作
                    if(next != undefined && next == false){

                        KyeeMessageService.broadcast({
                            content : message
                        });
                        return;
                    }

                    if(resp.data != undefined && resp.data != null && resp.data.type == "CLOSEHOS"){
                        //清空缓存中所保存的医院信息
                        CacheServiceBus.getStorageCache().set(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO, {
                            id : "",
                            name : "",
                            address : "",
                            provinceCode : "",
                            provinceName : "",
                            cityCode : "",
                            cityName : ""
                        });

                        var v=AppConfig.BRANCH_VERSION;//个性化指定医院若正在维护处理
                        if(v=="22"||v=="50"||v=="51"||v=="52"){
                            CacheServiceBus.getMemoryCache().set('CACHE_CONSTANTS.MEMORY_CACHE.IS_CLOSE_HOSPITAL',true);
                        }else{
                            switch($state.current.name){
                                case "appointment_regist_detil":
                                    break;
                                case "satisfaction_menu.satisfaction_doctor":
                                    onSuccess(resp);
                                    return;
                                case "satisfaction_menu.satisfaction_hospital":
                                    onSuccess(resp);
                                    return;
                                default:
                                    KyeeMessageService.broadcast({
                                        content : resp.data.message,
                                        duration : 1500
                                    });
                                    me.handleHospitalClosed();
                            }
                        }
                        onError(resp);
                        return;
                    }

                    if(resp.data != undefined && resp.data != null && resp.data.type == "LOCKEDUSER"){

                        //清掉内存中用户信息，为了避免后续会发请求造成点击后退还会弹出登录页面
                        var cache = CacheServiceBus.getMemoryCache();
                        var storageCache = CacheServiceBus.getStorageCache();
                        cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD, {});
                        cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT, {});
                        cache.set(CACHE_CONSTANTS.MEMORY_CACHE.IS_LOGIN, false);
                        storageCache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT, {});
                        storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.USER, "");
                        storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.PWD, "");

                        var loginService = def.LoginService;
                        var tabsControllerScope = loginService.tabsControllerScope;
                        var _kyee_framwwork_modal = tabsControllerScope._kyee_framwwork_modal;

                        //修改首页页签的就诊者姓名为“未登录”
                        loginService.setPatientName("未登录");

                        //用户引导到登陆页面
                        if(!_kyee_framwwork_modal || _kyee_framwwork_modal.length == 0){  //防止弹出多个登陆窗口
                            //用户被锁定
                            KyeeMessageService.broadcast({
                                content : resp.data.message
                            });
                            $state.go("login");
                            loginService.isFromRequest = true;
                        }

                        return;
                    }

                    //服务器升级
                    if(resp.data != undefined && resp.data != null && resp.data.type == "VERSIONUP"){

                        KyeeEnv.ROOT_SCOPE.upgrade_page_src = KyeeUtilsService.getUrl(resp.data.message);
                        $state.go("upgrade");

                        return;
                    }

                    //病友圈服务器升级
                    if(resp.data != undefined && resp.data != null && resp.data.type == "SC_VERSIONUP"){

                        if(resultCode == "0000503" && $state.current.name != "home->MAIN_TAB"){
                            CacheServiceBus.getStorageCache().set(CACHE_CONSTANTS.STORAGE_CACHE.PATIENTS_GROUP_UPGRADE_URL, resp.data.message);
                            $state.go("patient_group_upgrade");
                            return;
                        }
                    }

                    // 抢号状态系统提醒
                    if(resp.data != undefined && resp.data != null && resp.data.type == "RUSHSTATUS"){
                        def.showRushStatus(resp.data.rushData);
                        return;
                    }

                    //数据完整性校验失败
                    if(resultCode == "0000502"){

                        //由于每个请求可能弹出一次提示，因此需要判断之前是否已经弹出
                        if(!KyeeMessageService.isPopupShown()){
                            KyeeMessageService.message({
                                content : message,
                                okText : "我知道了，重新登录",
                                onOk : function(){
                                    $window.location.reload(true);
                                    var patientsGroupIsOpen = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.PATIENTS_GROUP_SWITCH);
                                    //病友圈判断是外壳，退出容联登录
                                    if($rootScope.IS_SHELL_LOAD && patientsGroupIsOpen){
                                        // def.LoginService.logoutRLService();
                                        IMDispatch.logoutNIM();

                                    }
                                }
                            });
                        }
                        return;
                    }


                    onSuccess();
                } else {
                    onSuccess();
                }
            },
            /**
             * 处理医院关闭跳转
             */
            handleHospitalClosed : function(){

                //特殊页面不需要跳转
                var currentState = $state.current.name;

                var stateWhiteList = [
                    "multiple_query",
                    "multiple_query.multiple_hospitalInfo",
                    "multiple_query.multiple_deptInfo",
                    "multiple_query.multiple_doctorInfo",
                    "multiple_query.disease_info_query",
                    "triageSelectDept",
                    "diagnosticInfo",//KYEEAPPC-10347 yangmingsi 2017年3月10日11:27:27
                    "patient_card_hospital",
					"patient_card_add",
                    //renniu KYEEAPPTEST-3721  2016年9月1日09:58:46
                    "appointment_regist_detil",
                    "login"
                ];

                var isToHospitalSelect = true;
                for(var state in stateWhiteList){
                    if(stateWhiteList[state] == currentState){
                        isToHospitalSelect = false;
                        break;
                    }
                }

                if(isToHospitalSelect){
                    $state.go("hospital_selector");
                }
            },

            // 抢号状态系统提醒
            showRushStatus: function(data){
                var cache = CacheServiceBus.getMemoryCache();
                var params = {
                    status: data.status,
                    pageData: data.detail
                };
                if(data.status == 1){
                    // 有号提醒有余号
                    KyeeEnv.ROOT_SCOPE.searchCount = data.message;
                    KyeeMessageService.confirm({
                        template: "modules/business/appointment/views/clinic_reminder_management/clinic_message.html",
                        cssClass: "message_dialog_only_content",
                        cancelText: "知道了",
                        okText: "立即预约挂号",
                        onSelect: function (flag) {
                            KyeeEnv.ROOT_SCOPE.searchCount = undefined;
                            if (flag) {
                                // 跳转到预约挂号
                                if(data.detail.BUSSINESS_TYPE == "1") {
                                    // 挂号
                                    cache.set(CACHE_CONSTANTS.MEMORY_CACHE.RUSH_MESSAGE_DATA, params);
                                    $state.go("regist_confirm");
                                } else {
                                    // 预约
                                    cache.set(CACHE_CONSTANTS.MEMORY_CACHE.RUSH_MESSAGE_DATA, params);
                                    $state.go("appoint_confirm");
                                }
                            }
                        }
                    });
                } else if(data.status == 2) {
                    // 有号提醒过期
                    KyeeMessageService.confirm({
                        title: "抢号",
                        content: "您添加的一单抢号已过期",
                        cancelText: "知道了",
                        okText: "重新抢号",
                        onSelect: function (flag) {
                            if (flag) {
                                // 跳转到有号提醒添加页
                                cache.set(CACHE_CONSTANTS.MEMORY_CACHE.RUSH_MESSAGE_DATA, params);
                                $state.go("add_clinic_management_new");
                            }
                        }
                    });

                } else if(data.status == 3) {
                    // 自动抢号成功
                    KyeeMessageService.confirm({
                        title: "抢号",
                        content: "恭喜您抢号成功，请按时就医！",
                        cancelText: "知道了",
                        okText: "查看详情",
                        onSelect: function (flag) {
                            if (flag) {
                                // 跳转到抢号成功详情页
                                cache.set(CACHE_CONSTANTS.MEMORY_CACHE.RUSH_MESSAGE_DATA, params);
                                $state.go('rush_clinic_success');
                            }
                        }
                    });
                } else if(data.status == 4) {
                    // 自动抢号失败
                    var message = "您有一单抢号失败了，原因：" + data.message;
                    KyeeMessageService.confirm({
                        title: "抢号",
                        content: message,
                        cancelText: "知道了",
                        okText: "查看详情",
                        onSelect: function (flag) {
                            if (flag) {
                                // 跳转到抢号详情页
                                cache.set(CACHE_CONSTANTS.MEMORY_CACHE.RUSH_MESSAGE_DATA, params);
                                $state.go("rush_clinic_detail");
                            }
                        }
                    });
                } else if(data.status == 5) {
                    // 抢号过期
                    KyeeMessageService.confirm({
                        title: "抢号",
                        content: "您添加的一单抢号已过期",
                        cancelText: "知道了",
                        okText: "查看详情",
                        onSelect: function (flag) {
                            if (flag) {
                                // 跳转到抢号详情页
                                cache.set(CACHE_CONSTANTS.MEMORY_CACHE.RUSH_MESSAGE_DATA, params);
                                $state.go("rush_clinic_detail");
                            }
                        }
                    });

                }
            }
        };

        return def;
    })
    .build();