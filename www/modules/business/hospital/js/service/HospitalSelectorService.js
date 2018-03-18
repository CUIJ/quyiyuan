new KyeeModule()
    .group("kyee.quyiyuan.hospital.hospital_selector.service")
    .type("service")
    .name("HospitalSelectorService")
    .params(["KyeeMessagerService", "HttpServiceBus", "CacheServiceBus", "HospitalService", "$state", "KyeeMessageService", "UpdateUserService", "HomeService", "KyeeActionHolderDelegate", "KyeeI18nService", "$filter", "ChangeLanguageService"])
    .action(function (KyeeMessagerService, HttpServiceBus, CacheServiceBus, HospitalService, $state, KyeeMessageService, UpdateUserService, HomeService, KyeeActionHolderDelegate, KyeeI18nService, $filter, ChangeLanguageService) {

        var def = {

            //在登录时选择就诊者后由拦截器触发的跳转问题
            loginFrom: undefined,

            //当前所选的医院 id
            currHospitalId: null,

            returnView: null,

            //记录上次选择的医院ID
            oldHospitalInfoCopy: undefined,
            //记录返回历史
            backHistoryStack: [],

            //是否从住院已结算进入选择医院 KYEEAPPC-4453 程铄闵
            isFromInpatientPaid: false,

            //是否从住院费用进入选择医院 KYEEAPPC-4453 程铄闵
            isFromInpatientPay: false,

            //从住院预缴模块进入 KYEEAPPC-6601 程铄闵
            isFromPerpaid: false,

            //从住院预缴中间态页进入 KYEEAPPC-6601 程铄闵
            isFromPerpaidPayInfo: false,

            //是否从门诊待缴进入选择医院 KYEEAPPC-4451 程铄闵
            isFromClinicPayment: false,

            //是否从门诊已缴进入选择医院 KYEEAPPC-4451 程铄闵
            isFromClinicPaid: false,

            //是否从就诊卡充值进入选择医院 KYEEAPPC-4687 程铄闵
            isFromPatientRecharge: false,

            // 是否通过医院->科室 查找群组
            isFindGroupByHospital: false, //edited by zhangyi at 20161121 for KYEEAPPC-8731 : 整合isFromPatientsGroup和goToPatientsGroup控制变量到isFindGroupByHospital中
            hospitalIsOpen: 1, //医院是否开启
            toSelectCustomer: undefined, //切换医院完毕 之后切换就诊者

            toSwitchCustomer: undefined, //切换就诊者
            isSwitchCustomerFlag: false, //是否执行了切换就诊者操作，true：执行，false：未执行


            /**
             * 设置医院选择后的返回视图
             *
             * @param view
             */
            setReturnView: function (view) {

                var me = this;

                me.returnView = view;
                me.backHistoryStack.push(view);
            },

            /**
             * 为第三方开放的医院选择器接口
             *
             * @param routerState 选择成功后返回的路由地址
             */
            enter: function (routerState) {

                var me = this;

                me.setReturnView(routerState);
                $state.go("hospital_selector");
            },

            /**
             * 加载医院数据列表
             *
             * @param provinceCode
             * @param cityCode
             * @param onSuccess
             */
            getHospitalListData: function (provinceCode, cityCode, isLoading, onSuccess) {
                var hospitalList = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.HOSPITAL_LIST);

                //判断用户是否是超级用户
                var cUser = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
                var userType = '0';
                if (cUser) {
                    userType = cUser.USER_TYPE;
                }

                //如果isLoading为true，则直接请求后台，更新缓存
                if (!isLoading && hospitalList) {
                    //过滤医院
                    hospitalList = def.hospitalFilter(hospitalList, provinceCode, cityCode, userType);
                    onSuccess(hospitalList);
                    return;
                }

                var groupHospitalFlag = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.GROUP_HOSPITAL_FLAG); //集团医院标识
                if (groupHospitalFlag == null || groupHospitalFlag == undefined || groupHospitalFlag == "" || groupHospitalFlag == "null" || groupHospitalFlag == "NULL") {
                    groupHospitalFlag = ""; //默认为所有医院
                }
                HttpServiceBus.connect({
                    url: "/area/action/AreaHospitalActionImplC.jspx",
                    params: {
                        PROVINCE_CODE: '0000000',
                        CITY_CODE: '0000000',
                        USER_TYPE: '1',
                        op: "queryHospitalName",
                        GROUP_HOSPITAL_FLAG: groupHospitalFlag
                    },
                    cache: {
                        by: "TIME",
                        value: 30 * 60
                    },
                    showLoading: !isLoading,
                    onSuccess: function (data) {
                        if (data && data.data) {
                            CacheServiceBus.getMemoryCache().set(CACHE_CONSTANTS.MEMORY_CACHE.HOSPITAL_LIST, data.data.rows);
                        }
                        //如果请求过慢，医院等级和医院默认跳转页不能刷入缓存，在此处刷入
                        var hospitalInfo = CacheServiceBus.getStorageCache().get('hospitalInfo');
                        if (hospitalInfo) {
                            //医院等级与医院默认进入页面标识赋值
                            for (var i = 0; i < data.data.rows.length; i++) {
                                if (hospitalInfo.id == data.data.rows[i].HOSPITAL_ID) {
                                    hospitalInfo.level = data.data.rows[i].HOSPITAL_LEVEL;
                                    hospitalInfo.mainPageFlag = data.data.rows[i].C_MAINPAGEFLAG;
                                    CacheServiceBus.getStorageCache().set('hospitalInfo', hospitalInfo);
                                    break;
                                }
                            }
                        }

                        if (!hospitalList) {
                            //过滤医院
                            hospitalList = def.hospitalFilter(data.data.rows, provinceCode, cityCode, userType);
                            onSuccess(hospitalList);
                        }
                    }
                });
            },

            //过滤医院
            hospitalFilter: function (hospitalList, provinceCode, cityCode, userType) {
                //根据用户类型过滤医院列表
                if (userType != '1') {
                    hospitalList = $filter('filter')(hospitalList, {
                        STATUS: '1'
                    });
                    //针对pst为060067的显示用户可访问的试上线医院  KYEEAPPC-11825
                    try {
                        var userId = '';
                        var userInfo = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
                        if (userInfo) {
                            userId = userInfo.USER_ID;
                        }
                        //KYEEAPPTEST-4400
                        var hospitalAddList = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.USER_TEMP_HOSPITAL);
                        if (userInfo && userId != '' && userId != undefined && userId != null && hospitalAddList && hospitalAddList.length > 0) {
                            for (var i = 0; i < hospitalAddList.length; i++) {
                                hospitalList.push(hospitalAddList[i]);
                            }
                            hospitalList = $filter('orderBy')(hospitalList, 'HOSPITAL_ID', false);
                        }
                    } catch (e) {

                    }
                }
                //判断用户所选的省市进行过滤医院
                if (provinceCode == "0000000" && "0000000" == cityCode) {
                    hospitalList = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.HOSPITAL_LIST);
                } else if (provinceCode != cityCode) {
                    hospitalList = $filter('filter')(hospitalList, {
                        CITY_CODE: cityCode
                    });
                } else if (provinceCode == cityCode) {
                    hospitalList = $filter('filter')(hospitalList, {
                        PROVINCE_CODE: provinceCode
                    });
                }
                return hospitalList;
            },
            /**
             * 选择医院
             * <br/>
             * 注意：
             * 该方法为公开方法，请勿修改方法签名
             *
             * @param hospitalId
             * @param hospitalName
             * @param hospitalAddress
             * @param onFinash
             */
            selectHospital: function (hospitalId, hospitalName, hospitalAddress, provinceCode, provinceName, cityCode, cityName, loadingText, onFinash, hospital) {

                var me = this;
                //选择体验医院时提示
                if (hospitalId == "1001") {

                    KyeeMessageService.message({
                        //医院首页模块国际化改造  by  杜巍巍  KYEEAPPC-3811
                        title: KyeeI18nService.get("hospital_selector.message", "温馨提示"),
                        content: KyeeI18nService.get("hospital_selector.experienceHospitalDataIsReference", "体验医院仅供用户参考，不能作为实际就诊依据"),
                        onOk: function () {

                            me.selectHospitalAction(hospitalId, hospitalName, hospitalAddress, provinceCode, provinceName, cityCode, cityName, loadingText, onFinash, hospital);
                        }
                    });
                } else {

                    me.selectHospitalAction(hospitalId, hospitalName, hospitalAddress, provinceCode, provinceName, cityCode, cityName, loadingText, onFinash, hospital);
                }
            },
            //判断是否要弹出切换为维语的确认框，任务号：KYEEAPPC-4542
            changeLaguage: function (changeByHospitalAble, $rootScope) {
                var storageCache = CacheServiceBus.getStorageCache();
                var hasSelectUYG = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HAS_SELECT_UYG);
                var hospitalInfo = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                var laguageType = KyeeI18nService.getCurrLangName();
                var cityInfo = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.LAST_PROVINCE_CITY_INFO);

                //新疆编码：650000
                if (changeByHospitalAble) {
                    if (!hospitalInfo || hospitalInfo.provinceCode !== '650000') {
                        return;
                    }
                } else {
                    if (!cityInfo || cityInfo.PROVINCE_CODE !== '650000') {
                        return;
                    }
                }
                //如果是首次到新疆地区且当前语言不是维语，则给用户提示是否切换到维语版
                if ((undefined === hasSelectUYG || null == hasSelectUYG) && laguageType != 'uyg') {
                    ChangeLanguageService.queryLanguageSwitch(
                        function (languageSwitchFlag) {
                            //如果多语言功能开关开启
                            if (languageSwitchFlag == 1) {
                                if (!KyeeMessageService.isPopupShown()) {
                                    KyeeMessageService.confirm({
                                        title: "温馨提示(<font class='uygLookAndFeel'>سەمىمي ئەسكەرتىش </font>)",
                                        content: "您可以切换语言到维语版，是否想要切换？(<font class='uygLookAndFeel'>سىز تىلنى ئۇيغۇرچە بەتكە يۆتكىسىڭىز بۇلىدۇ، يۆتكىگىڭىز بارمۇ؟</font>)",
                                        cancelText: "否(<font class='uygLookAndFeel'>ياق</font>)",
                                        okText: "是(<font class='uygLookAndFeel'>ھە</font>)",
                                        onSelect: function (flag) {
                                            if (flag) {
                                                KyeeI18nService.use('uyg', $rootScope);
                                                setTimeout(function () {
                                                    ChangeLanguageService.updateRootScopeLangText();
                                                }, 1000);
                                            }
                                            storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.HAS_SELECT_UYG, flag);
                                        }
                                    });
                                }

                            }
                        }
                    );

                }
            },
            /**
             * 选择医院执行动作
             *
             * @param hospitalId
             * @param hospitalName
             * @param hospitalAddress
             * @param provinceCode
             * @param provinceName
             * @param cityCode
             * @param cityName
             * @param loadingText
             * @param onFinash
             * @param loadingText
             * @param APP_INIT
             */
            selectHospitalAction: function (hospitalId, hospitalName, hospitalAddress, provinceCode, provinceName, cityCode, cityName, loadingText, onFinash, hospital, isShowLoading, APP_INIT) {

                var me = this,
                    storageCache = CacheServiceBus.getStorageCache();

                me.currHospitalId = hospitalId;
                var loading = false;
                //手动显示提示框
                //没有特殊指定的情况下均有提示
                if (isShowLoading == undefined || isShowLoading == true) {
                    loading = true;
                }
                var oldHospitalInfo = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                def.oldHospitalInfoCopy = angular.copy(oldHospitalInfo);
                //当选择的医院切换后，清空缓存中的科室信息
                if (oldHospitalInfo && oldHospitalInfo.id && hospitalId != oldHospitalInfo.id) {
                    storageCache.remove(CACHE_CONSTANTS.STORAGE_CACHE.DEPT_INFO);
                }
                //医院等级
                var hospitalLevel = '';
                //该医院默认进入页面标识   0：C端首页，1：医院首页
                var mainPageFlag = '';
                //医院是否在线    0:不在线，1：在线
                var isOnline;
                //医院照片
                var logoPhoto;
                //医院列表
                var hospital_list = CacheServiceBus.getMemoryCache().get('hospitalList');
                //从首页和选择医院进入会传入 hospital
                if (hospital) {
                    hospitalLevel = hospital.level;
                    mainPageFlag = hospital.mainPageFlag;
                    isOnline = hospital.isOnline != undefined ? hospital.isOnline : hospital.IS_ONLINE;
                    logoPhoto = hospital.hospitalPhoto != undefined ? hospital.hospitalPhoto : hospital.LOGO_PHOTO;
                    //医院等级赋值
                    if (!hospitalLevel) {
                        hospitalLevel = hospital.HOSPITAL_LEVEL;
                    }
                    //该医院默认进入页面标识   0：C端首页，1：医院首页
                    if (mainPageFlag === undefined || mainPageFlag === '') {
                        mainPageFlag = hospital.C_MAINPAGEFLAG;
                    }
                    //医院列表已经从缓存刷入，并且两个标识其中一个没有，则从医院列表缓存中取值
                    if (hospital_list && 　(!hospitalLevel || (mainPageFlag === undefined || mainPageFlag === ''))) {
                        //医院等级与医院默认进入页面标识赋值
                        for (var i = 0; i < hospital_list.length; i++) {
                            if (hospitalId == hospital_list[i].HOSPITAL_ID) {
                                if (!hospitalLevel) {
                                    hospitalLevel = hospital_list[i].HOSPITAL_LEVEL;
                                }
                                if (mainPageFlag === undefined || mainPageFlag === '') {
                                    mainPageFlag = hospital_list[i].C_MAINPAGEFLAG;
                                }
                                break;
                            }
                        }
                    }

                } else if (hospital_list) {
                    //医院等级与医院默认进入页面标识赋值
                    for (var i = 0; i < hospital_list.length; i++) {
                        if (hospitalId == hospital_list[i].HOSPITAL_ID) {
                            hospitalLevel = hospital_list[i].HOSPITAL_LEVEL;
                            mainPageFlag = hospital_list[i].C_MAINPAGEFLAG;
                            isOnline = hospital_list[i].IS_ONLINE != undefined ? hospital_list[i].IS_ONLINE : hospital_list[i].isOnline;
                            logoPhoto = hospital_list[i].LOGO_PHOTO != undefined ? hospital_list[i].LOGO_PHOTO : hospital_list[i].hospitalPhoto;
                            break;
                        }
                    }
                }
                //存储城市信息到缓存
                CacheServiceBus.getStorageCache().set(CACHE_CONSTANTS.STORAGE_CACHE.LAST_PROVINCE_CITY_INFO, {
                    CITY_CODE: cityCode,
                    CITY_NAME: cityName,
                    PROVINCE_CODE: provinceCode,
                    PROVINCE_NAME: provinceName
                });
                HttpServiceBus.connect({
                    url: "/hospitalInform/action/HospitalinforActionC.jspx",
                    params: {
                        hospitalID: hospitalId,
                        hospitalId: hospitalId,
                        USER_ROLE: "0",
                        paramName: "IS_DEPT_GRADE,isAppointToRegistCardPwd,isRegistCardPwd,CONSULT_DOCTOR,NETWORK_CLINIC,SHOW_CLINIC_NUMBER",
                        op: "queryHosConfig"
                    },
                    showLoading: loading,
                    onSuccess: function (data) {
                        //隐藏提示框
                        if (isShowLoading == undefined || isShowLoading == true) {
                            KyeeMessageService.hideLoading();
                        }

                        if (data.success) {
                            //存储医院信息到缓存
                            CacheServiceBus.getStorageCache().set(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO, {
                                id: hospitalId,
                                name: hospitalName,
                                //医院首页模块国际化改造  by  杜巍巍  KYEEAPPC-3811
                                address: hospitalAddress == "" ? KyeeI18nService.get("hospital_selector.thisHospitalNoAddress", "该医院暂无地址信息") : hospitalAddress,
                                provinceCode: provinceCode,
                                provinceName: provinceName,
                                cityCode: cityCode,
                                cityName: cityName,
                                level: hospitalLevel,
                                mainPageFlag: mainPageFlag,
                                //选择医院获取抢号权限   by   杨旭平   KYEEAPPC-10260
                                showRush: data.data.ShowRush,
                                isOnline: isOnline, //update by 陈艳婷
                                hospitalPhoto: logoPhoto //update by 陈艳婷
                            });
                            def.canReferral = data.data.CAN_REFERRAL;
                            def.regId = data.data.REG_ID;
                            //更换URL地址中的医院ID
                            var cache = CacheServiceBus.getMemoryCache();
                            var objParams = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
                            if (objParams && objParams.hospitalID) {
                                objParams.hospitalID = hospitalId;
                                objParams.HOSPITAL_ID = hospitalId;
                                objParams.hospitalId = hospitalId;
                                cache.set(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL, objParams);
                            }
                            //从微信公共号跳转过来时切换就诊者操作，其余不执行。
                            if (def.toSwitchCustomer) {
                                def.toSwitchCustomer();
                                def.toSwitchCustomer = undefined;
                                def.isSwitchCustomerFlag = true; //执行切换就诊者表志
                            }
                            var result = data.data;
                            var ModuleTOAPP = undefined;
                            try {
                                ModuleTOAPP = JSON.parse(result.ModuleTOAPP).data;
                            } catch (e) {
                                ModuleTOAPP = [];
                            }

                            var userInfo = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
                            //将用户选择的医院ID存入缓存
                            /*if(userInfo && userInfo.USER_ID){
                                me.saveHidInUserInfo(userInfo.USER_ID,hospitalId);
                            }*/
                            //设置医院功能列表权限配置
                            var disableMsg = me.setConfigs(ModuleTOAPP);
                            //设置页面元素权限
                            me.setElement(result.AppPageConfig);
                            //设置医院参数
                            me.setHosParam(result.HosParam);
                            //设置医院广告
                            me.setAdv(result.ADV);
                            //选择就诊者信息
                            var currUserRecord = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
                            //APP_INIT 首次进入APP，自动登录会选择就诊者
                            if (currUserRecord != undefined && currUserRecord != null && !APP_INIT && !def.loginFrom) {
                                HospitalService.hosSelectCustomPatient = true;
                                UpdateUserService.selectedCustomPatient(currUserRecord.USER_ID, hospitalId, function (data) {

                                    if (onFinash != undefined) {
                                        onFinash(disableMsg);
                                    }
                                });
                            } else {
                                if (onFinash != undefined) {
                                    onFinash(disableMsg);
                                }
                            }
                            def.hospitalIsOpen = 1;
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message
                            });
                            def.hospitalIsOpen = 0;
                        }
                        //查询就诊者信息操作  任务号：KYEEAPPC-7762 解决登录时 切换关闭医院 体验就诊者串医院问题 作者：付添
                        //如果执行了切换就诊者操作则不执行获取就诊者信息操作，因为切换成功后会执行获取就诊者信息操作。
                        if (def.toSelectCustomer && def.isSwitchCustomerFlag == false) {
                            def.toSelectCustomer();
                            def.toSelectCustomer = undefined;
                        }
                        def.loginFrom = undefined;
                        def.isSwitchCustomerFlag = false; //重置标志。
                    },
                    onError: function () {
                        if (def.oldHospitalInfoCopy) {
                            CacheServiceBus.getStorageCache().set(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO, def.oldHospitalInfoCopy);
                        } else {
                            CacheServiceBus.getStorageCache().set(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO, {
                                id: "",
                                name: "",
                                address: "",
                                provinceCode: "",
                                provinceName: "",
                                cityCode: "",
                                cityName: "",
                                level: "",
                                mainPageFlag: ""
                            })
                        }
                        def.hospitalIsOpen = 0;
                        //切换就诊者  任务号：KYEEAPPC-7762 解决登录时 切换关闭医院 体验就诊者串医院问题 作者：付添
                        if (def.toSelectCustomer) {
                            def.toSelectCustomer();
                            def.toSelectCustomer = undefined;
                        }
                    }
                });
            },
            //将用户选择的医院ID存入缓存
            saveHidInUserInfo: function (userId, hid) {
                HttpServiceBus.connect({
                    url: "/user/action/LoginAction.jspx",
                    params: {
                        hospitalId: hid,
                        userId: userId,
                        op: "updateUserHospital"
                    },
                    onSuccess: function (data) {
                        if (!data.success) {
                            KyeeMessageService.broadcast({
                                content: data.message
                            })
                        }
                     }
                });
            },
            //设置医院广告
            setAdv: function (Advs) {
                //处理广告数据
                var imgs = [];
                for (var i in Advs) {
                    imgs.push({
                        id: Advs[i].ADV_ID,
                        url: Advs[i].ADV_URL
                    });
                }
                //如果该医院没有绑定广告，则显示默认广告
                if (imgs.length == 0) {
                    imgs = HOSPITAL_DATA.defaultSlideboxData();
                }
                CacheServiceBus.getStorageCache().apply(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO, "advs", imgs);
            },

            //设置医院参数
            setHosParam: function (HosParam) {
                //分级科室
                var value = HosParam.IS_DEPT_GRADE;
                CacheServiceBus.getStorageCache().apply(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO, "is_dept_grade", value);
                CacheServiceBus.getStorageCache().apply(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO, "CONSULT_DOCTOR", HosParam.CONSULT_DOCTOR);
                CacheServiceBus.getStorageCache().apply(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO, "NETWORK_CLINIC", HosParam.NETWORK_CLINIC);
                CacheServiceBus.getStorageCache().apply(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO, "SHOW_CLINIC_NUMBER", HosParam.SHOW_CLINIC_NUMBER);
                //--缓存增加 预约转挂号、挂号 是否输入就诊卡密码标识  张明   begin    2015-08-11
                var appToRegFlag = HosParam.isAppointToRegistCardPwd;
                var regFlag = HosParam.isRegistCardPwd;
                CacheServiceBus.getStorageCache().apply(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO, "is_appoint_to_regist_card_pwd", appToRegFlag);
                CacheServiceBus.getStorageCache().apply(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO, "is_regist_card_pwd", regFlag);
                //--缓存增加 预约转挂号、挂号 是否输入就诊卡密码标识  张明   end
            },
            //设置医院功能列表权限配置
            setConfigs: function (ModuleTOAPP) {

                //模块排序
                ModuleTOAPP = ModuleTOAPP.sort(function (a, b) {
                    if (a.MODULE_ORDER == b.MODULE_ORDER && a.MODULE_NAME == "网络门诊") {
                        return 1;
                    } else {
                        return a.MODULE_ORDER - b.MODULE_ORDER;
                    }
                });
                var item = ModuleTOAPP[4]; //如果网络门诊排在第四位，将其移至第五位
                if (item.MODULE_NAME == "网络门诊") {
                    ModuleTOAPP.splice(4, 1);
                    ModuleTOAPP.splice(5, 0, item);
                }

                //存储权限信息
                CacheServiceBus.getStorageCache().set(CACHE_CONSTANTS.STORAGE_CACHE.HOME_DATA, {
                    rights: ModuleTOAPP
                });

                //判断是否开通预约挂号
                var count = 0;
                var disableInfo = '';
                var videoCount = 0,
                    medicineCount = 0;
                for (var i in ModuleTOAPP) {

                    var module = ModuleTOAPP[i];

                    var visible = module.IS_VISIBLE;
                    var enable = module.IS_ENABLE;
                    disableInfo = module.DISABLEINFO; // edit by wangsannv
                    if (0 == enable || 0 == visible) { // edit by wangsannv
                        if ("APPOINT" == module.MODULE_CODE || "REGIST" == module.MODULE_CODE) {
                            //预约挂号关闭时的提示  By  章剑飞  APPCOMMERCIALBUG-2029
                            count++;
                        } else if ("41" == module.MODULE_ID) { //edit by wangsannv 判断视频问诊功能是否开通
                            videoCount++;
                        } else if ("42" == module.MODULE_ID) { //edit by wangsannv 判断远程购药功能是否开通
                            medicineCount++;
                        }
                    }
                }
                if (count >= 2) {
                    //未开通预约和挂号
                    CacheServiceBus.getStorageCache().apply(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO, "is_home_appoint_enable", "0");
                    //未开通视频问诊 edit by wangsannv
                    CacheServiceBus.getStorageCache().apply(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO, "is_video_inteergation_enable", "0");
                    //未开通远程购药  edit by wangsannv
                    CacheServiceBus.getStorageCache().apply(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO, "is_remote_purchase_enable", "0");
                    return disableInfo;
                } else {
                    //开通预约或挂号
                    CacheServiceBus.getStorageCache().apply(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO, "is_home_appoint_enable", "1");
                    //开通视频问诊 edit by wangsannv 判断视频问诊功能是否开通
                    if (videoCount == 0) {
                        CacheServiceBus.getStorageCache().apply(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO, "is_video_inteergation_enable", "1");
                    } else {
                        CacheServiceBus.getStorageCache().apply(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO, "is_video_inteergation_enable", "0");
                    }
                    //开通远程购药  edit by wangsannv 判断远程购药功能是否开通
                    if (medicineCount == 0) {
                        CacheServiceBus.getStorageCache().apply(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO, "is_remote_purchase_enable", "1");
                    } else {
                        CacheServiceBus.getStorageCache().apply(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO, "is_remote_purchase_enable", "0");
                    }
                }
            },
            //设置页面元素权限
            setElement: function (AppPageConfig) {
                //存数权限数据并刷新
                CacheServiceBus.getStorageCache().set(CACHE_CONSTANTS.STORAGE_CACHE.CURR_HOSPITAL_KAH, AppPageConfig);
                KyeeActionHolderDelegate.refreshData();

                //更新标志，以便首页以及九宫格可以及时更新相关数据
                HospitalService.isSelectedNewHospital = true;
                HomeService.isSelectedNewHospital = true;
            },
            /**
             * 任务:KYEEAPPTEST-3535
             * 描述:切换医院，适用只知道医院ID的情况。
             *     1、从内存中寻找该医院信息
             *     2、通过医院的疾病信息调用切换医院的方法 def.selectHospital
             * 注意：此方法在只知道医院ID的情况下使用，如果医院的其他信息都已知的情况请调用selectHospital方法
             * @param hospitalId 医院Id
             * @param callBack
             */
            selectHospitalById: function (hospitalId, callBack) {
                //获取内存中的所有医院信息
                var hospitalDatas = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.HOSPITAL_LIST);
                if (hospitalDatas) {
                    var hospitalInfo = undefined;
                    for (var i = 0; i < hospitalDatas.length; i++) {
                        hospitalInfo = hospitalDatas[i];
                        if (hospitalInfo.HOSPITAL_ID === hospitalId) {
                            break;
                        }
                    }
                    //获取医院信息成功后，切换医院
                    def.selectHospital(hospitalInfo.HOSPITAL_ID, hospitalInfo.HOSPITAL_NAME,
                        hospitalInfo.ADDRESS, hospitalInfo.PROVINCE_CODE, hospitalInfo.PROVINCE_NAME,
                        hospitalInfo.CITY_CODE, hospitalInfo.CITY_NAME, '', callBack, hospitalInfo);
                }
            }
        };

        return def;
    })
    .build();