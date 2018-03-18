/**
 * 名称：quyiyuan
 * 作者: 程志
 * 日期:2015年８月10日
 * 创建原因：个人中心／常用信息(KYEEAPPC-2989)
 * 功能:个人中心--常用信息--就诊卡管理
 */

new KyeeModule()
    .group("kyee.quyiyuan.frequent_info.patient_card.service")
    .type("service")
    .name("PatientCardService")
    .params(["$state", "HttpServiceBus", "CacheServiceBus",
        "KyeeMessageService","KyeeI18nService"])
    .action(function($state, HttpServiceBus, CacheServiceBus,
                     KyeeMessageService,KyeeI18nService){
        var def = {
            hospIdChange : undefined, //最新选中的医院ID

            scopeAdd : undefined,//添加就诊卡页面、门诊已缴费页面的scope

            showInfo : undefined, //页面显示信息

            editCard : undefined,

            fromOtherRoute: undefined,//从其它业务跳入本模块的路由 KYEEAPPC-6170 程铄闵

            oldHospitalInfoCopy:undefined,//旧医院信息(拷贝正在维护前选择的医院)
            cardName :undefined,//卡名称

            /**
             * 过滤虚拟卡的标记，可以单独给需要实现的功能赋值，都不赋值执行默认
             */
            filteringVirtualCard : {
                isFilteringVirtual:undefined,  //是否过滤虚拟卡，默认不过滤
                routingAddress:undefined       //选中卡之后的跳转地址，默认goBack（-1）
            },
            cache : CacheServiceBus.getMemoryCache(),
            selectUserInfo: undefined, // 接收到的就诊者信息
            selectUserInfoUsed: undefined, // 使用的就诊者信息

            fromSource: undefined, //就诊卡管理页面的路由来源
            fromPage: undefined, //就诊卡选择页面的路由来源
            fromAppoint:false,//预约挂号确认页面来源标识
            fromPatientCard:false,//就诊卡管理页面标识

            //获取用户所有就诊卡数据
            // PROVINCE_NAME ，CITY_NAME，HOSPITAL_NAME，PATIENT_NAME，
            // CARD_NO，CARD_TYPE，CARD_STATUS,SYS_PATIENT_ID
            loadPatientCards:function(userID, onSuccess){

                HttpServiceBus.connect({
                    url : 'center/action/CustomPatientAction.jspx',
                    params : {
                        op: 'queryAllCard',
                        userVsId:userID,
                        isFromAddCard:def.isFromAddCard
                    },
                    onSuccess : function(data){
                        if(data.success){
                            onSuccess(data.data);
                        }
                        else{
                            def.showMessage(data.message);
                        }

                    },
                    onError : function(data){
                    }
                });
            },

            /**
             * 为选卡界面加载就诊卡
             * @param param
             * @param onSuccess
             */
            loadPatientCardsForSelect:function(onSuccess){

                //选卡页面赋值
                var userInfo = def.selectUserInfoUsed;
                var hospitalId = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;
                var param = {
                    NAME: userInfo.OFTEN_NAME,
                    ID_NO: userInfo.ID_NO,
                    PHONE: userInfo.PHONE,
                    CARD_NO: "",
                    USER_VS_ID: userInfo.USER_VS_ID,
                    HOSPITAL_ID : hospitalId
                };

                HttpServiceBus.connect({
                    url: "center/action/CustomPatientAction.jspx",
                    params: {
                        op: "queryCardList",
                        loc: "c",
                        hospitalId: param.HOSPITAL_ID,
                        NAME: param.NAME,
                        ID_NO: param.ID_NO,
                        CARD_NO: param.CARD_NO,
                        PHONE: param.PHONE,
                        USER_VS_ID: param.USER_VS_ID,
                        isAutoQueryHisCard: false
                    },
                    onSuccess: function (data) {
                        onSuccess(data);
                    },
                    onError : function(data){
                    }
                });
            },

            /**
             * 更新用户的默认就诊卡
             * @param param
             * @param onSuccess
             */
            updateUserDefaultCard: function (cardNo, onSuccess) {
                var me = this;

                //选卡页面赋值
                var userInfo = def.selectUserInfoUsed
                var hospitalId = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;
                var param = {
                    NAME: userInfo.OFTEN_NAME,
                    ID_NO: userInfo.ID_NO,
                    PHONE: userInfo.PHONE,
                    CARD_NO: cardNo,
                    USER_VS_ID: userInfo.USER_VS_ID,
                    HOSPITAL_ID : hospitalId
                };

                HttpServiceBus.connect({
                    url: "center/action/CustomPatientAction.jspx",
                    params: {
                        op: "updateCardByUserVsId",
                        loc: "c",
                        userVsId: param.USER_VS_ID,
                        cardNo: param.CARD_NO,
                        hospitalId: param.HOSPITAL_ID
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            me.refreshCache(param, onSuccess);
                        }
                        else{
                            KyeeMessageService.broadcast({content : data.message});
                        }
                    },
                    onError: function (data) {
                    }
                });
            },

            /**
             * 刷新缓存
             * @param param
             * @param onSuccess
             */
            refreshCache : function(param, onSuccess){

                var memCache = CacheServiceBus.getMemoryCache();

                var curPatient = memCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);

                if (param.USER_VS_ID == curPatient.USER_VS_ID) {

                    var userID = memCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID;

                    var hospID = param.HOSPITAL_ID;

                    this.selectedCustomPatient(function (rsp) {
                        if (rsp.success) {
                            if (rsp.data.length <= 0) {
                                return;
                            }
                            var data = rsp.data;
                            //成功并且有数据，解析该就诊者的卡信息
                            var detialList = JSON.parse(data[0].DETIAL_LIST);
                            data[0].PATIENT_CARD = [];
                            if (detialList != null) {
                                for (var index = 0; index < detialList.length; index++) {
                                    detialList[index].USER_VS_ID = data[0].USER_VS_ID;
                                    //排除重复的卡号，并且清理空的身份证
                                    var isExist = true;
                                    for (var indexCard = 0; indexCard < data[0].PATIENT_CARD.length; indexCard++) {
                                        if (data[0].PATIENT_CARD[indexCard].PATIENT_ID == detialList[index].PATIENT_ID) {
                                            if (data[0].PATIENT_CARD[indexCard].ID_NO == null
                                                || data[0].PATIENT_CARD[indexCard].ID_NO == undefined) {
                                                data[0].PATIENT_CARD[indexCard] = detialList[index];
                                            }
                                            else {
                                                isExist = false;
                                            }
                                        }
                                    }
                                    if (isExist) {
                                        data[0].PATIENT_CARD.push(detialList[index]);
                                    }
                                }
                            }
                            CacheServiceBus.getMemoryCache().set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CARD_INFO, data[0].PATIENT_CARD[0]);
                            data[0].CARD_NO = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CARD_INFO).CARD_NO;
                            CacheServiceBus.getMemoryCache().set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT, data[0]);

                            onSuccess();
                        }
                    }, userID, hospID);
                }
                else{
                    onSuccess();
                }
            },

            /**
             * 查询自定义就诊者
             * @param onSuccess
             * @param userId
             * @param hospitalID
             */
            selectedCustomPatient: function (onSuccess, userId, hospitalID) {

                HttpServiceBus.connect({
                    url: "center/action/CustomPatientAction.jspx",
                    params: {
                        op: "selectedCustomPatient",
                        loc: "c",
                        userId: userId,
                        hospitalId: hospitalID
                    },
                    onSuccess: function (data) {
                        onSuccess(data);
                    },
                    onError: function (data) {
                    }
                });
            },

            //加载省份列表
            loadProvinceList : function(onSuccess){

                var userType = this.cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_TYPE;

                HttpServiceBus.connect({
                    url : "/area/action/AreaHospitalActionImplC.jspx",
                    params : {
                        op : "queryProvince",
                        USER_TYPE : userType
                    },
                    cache : {
                        by : "TIME",
                        value : 300
                    },
                    onSuccess : function(data){
                        onSuccess(data);
                    },
                    onError : function(data){
                    }
                });
            },

            //加载城市列表
            loadCityList : function(provinceId, provinceCode, onSuccess){

                var userType = this.cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_TYPE;
                HttpServiceBus.connect({
                    url : "/area/action/AreaHospitalActionImplC.jspx",
                    params : {
                        op : "queryCity",
                        PROVINCE_ID : provinceId,
                        PROVINCE_CODE : provinceCode,
                        USER_TYPE : userType
                    },
                    cache : {
                        by : "TIME",
                        value : 100
                    },
                    onSuccess : function(data){
                        var ret = data.concat(); //拷贝以便操作

                        if(ret && ret.length>0 && ret[0].CITY_NAME == "所有医院"){
                            ret[0].PROVINCE_NAME = ret[1].PROVINCE_NAME;
                            ret[0].PROVINCE_CODE = ret[1].PROVINCE_CODE;
                        }
                        //ret.shift(); //去掉第一项"所有医院"

                        onSuccess(ret);
                    },
                    onError: function (data) {
                    }
                });
            },

            //加载医院数据列表
            loadHospitalList : function(onSuccess){
                //判断用户是否是超级用户
                var userType = this.cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_TYPE;

                var area = this.getArea();

                HttpServiceBus.connect({
                    url : "/area/action/AreaHospitalActionImplC.jspx",
                    params : {
                        PROVINCE_CODE : area.PROVINCE_CODE,
                        CITY_CODE : area.CITY_CODE,
                        USER_TYPE : userType,
                        op : "queryHospitalName"
                    },
                    cache : {
                        by : "TIME",
                        value : 60
                    },
                    onSuccess : function(data){
                        onSuccess(data);
                    }
                });
            },

            //加载医院支持的卡类型
            loadTypeList : function(hospID, onSuccess){

                HttpServiceBus.connect({
                    url : "center/action/CustomPatientAction.jspx",
                    params : {
                        op : "queryCardType",
                        hospitalId:hospID
                    },
                    cache : {
                        by : "TIME",
                        value : 60
                    },
                    onSuccess : function(data){
                        if(data.success){
                            onSuccess(data.data);
                        }

                    },
                    onError : function(data){
                    }
                });
            },

            getArea : function(){
                return this.scopeAdd.area;
            },

            setArea : function(provinceCode, provinceName, cityCode, cityName){
                var area = this.getArea();
                area.PROVINCE_CODE = provinceCode;
                area.PROVINCE_NAME = provinceName;
                area.CITY_CODE = cityCode;
                area.CITY_NAME = cityName;
            },

            setProvince : function(provinceCode, provinceName){
                var area = this.getArea();
                area.PROVINCE_CODE = provinceCode;
                area.PROVINCE_NAME = provinceName;
            },

            setCity : function(cityCode, cityName, provinceName, provinceCode){
                var area = this.getArea();

                if(area.CITY_CODE == cityCode && area.CITY_NAME == cityName && area.PROVINCE_NAME == provinceName){
                    return false;
                }

                area.CITY_CODE = cityCode;
                area.CITY_NAME = cityName;
                area.PROVINCE_NAME = provinceName;
                area.PROVINCE_CODE = provinceCode;

                return true;
            },

            getHospital : function(){
                return this.scopeAdd.hospital;
            },

            setHospital : function(id, name){

                var hospital = this.getHospital();

                hospital.ID = id;
                hospital.NAME = name;

                return true;
            },

            getCard : function(){
                return this.scopeAdd.card;
            },

            setCardType : function(type, name, url){
                var card = this.scopeAdd.card;
                card.TYPE = type;
                card.NAME = name;
                card.defaultText = '';
                if(card.NAME){
                    card.defaultText = '请输入'+card.NAME+'号';
                }
                if(!url && type == 1){
                    card.CARD_URL = "resource/images/center/default_card.png";
                }else{
                    card.CARD_URL = url;
                }
                return card;
            },

            validateArea : function (area) {

                if (area.PROVINCE_NAME == "" || area.CITY_NAME == "") {
                    this.showMessage(KyeeI18nService.get("patient_card.localNotNull","地区不能为空！"));

                    return false;
                }

                return true;
            },


            validateHospital : function (hospital) {
                if (hospital.NAME == "") {
                    this.showMessage(KyeeI18nService.get("patient_card.hospNotNull","医院不能为空！"));

                    return false;
                }

                return true;
            },

            validateCard : function (card, isCardShow) {
                if (card.TYPE == "" && !card.onlyCard) {
                    this.showMessage(KyeeI18nService.get("patient_card.selectCardTypePur","请选择卡类型！"));

                    return false;
                }

                //如果不显示卡，则不效验
                if(!isCardShow || isCardShow == "false" || def.electronicHealthCardRhcmIsopen == 1){
                    return true;
                }

                return this.validateCardNum(card.NUM);
            },

            validateCardNum : function (num) {
                if (num == "") {
                    this.showMessage(KyeeI18nService.get("patient_card.CardNotNullPur","卡号不能为空！"));

                    return false;
                }

                return true;
            },

            //新增卡片
            addCard : function (cardInfo, onSuccess) {

                HttpServiceBus.connect({
                    url: "center/action/CustomPatientAction.jspx",
                    params: {
                        op: "addCard",
                        userVsId: cardInfo.userVsId,
                        hospitalId:cardInfo.hospitalId,
                        cardNo: cardInfo.cardNo,
                        cardType:cardInfo.cardType
                    },
                    onSuccess: function (data) {
                        onSuccess(data);
                    },
                    onError : function(data){
                    }
                });
            },

            //删除卡片
            deleteCard : function (cardID, isRecord, onSuccess) {
                HttpServiceBus.connect({
                    url: "center/action/CustomPatientAction.jspx",
                    params: {
                        op:"deleteCard",
                        SYS_PATIENT_ID:cardID,
                        IS_RECORD:isRecord
                    },
                    onSuccess: function (data) {
                        onSuccess(data);
                    },
                    onError : function(data){

                    }
                });
            },

            //更新卡片信息
            updateCard : function (cardInfo, newCardNum, onSuccess) {
                //校验表单数据
                if(this.validateCardNum(newCardNum)){
                    if(def.selectUserInfoUsed){
                        if(def.selectUserInfoUsed.USER_VS_ID){
                            var userID = def.selectUserInfoUsed.USER_VS_ID;
                        }else{
                            var userID = this.cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT).USER_VS_ID;
                        }
                    }else{
                        var userID = this.cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT).USER_VS_ID;
                    }
                    HttpServiceBus.connect({
                        url: "center/action/CustomPatientAction.jspx",
                        params: {
                            op:"editCard",
                            userVsId:userID,
                            hospitalId:cardInfo.HOSPITAL_ID,
                            oldCardNo:cardInfo.CARD_NO,
                            cardType:cardInfo.CARD_TYPE,
                            newCardNo:newCardNum
                        },

                        onSuccess: function (data) {
                            onSuccess(data);
                        },
                        onError : function(data){

                        }
                    });
                }
            },
            //提示
            showMessage : function (msg) {
                KyeeMessageService.broadcast({
                    content : msg,
                    duration : 5000
                });
            },
            //获取显示信息（卡片url、卡号是否显示、提示问题）
            getShowInfo : function(hospitalId, onSuccess){
                    HttpServiceBus.connect({
                        url: "center/action/CustomPatientAction.jspx",
                        params: {
                            op : "queryParameterInAddCard",
                            HOSPITAL_ID : hospitalId,
                            hospitalId : hospitalId,
                            hospitalID : hospitalId
                        },
                        onSuccess: function (data) {
                            onSuccess(data);
                        },

                        onError: function () {
                            //医院关闭，重新把上一次选择的医院放入缓存中 KYEEAPPC-8555 yangmingsi
                            if(def.oldHospitalInfoCopy){
                                CacheServiceBus.getStorageCache().set(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO,def.oldHospitalInfoCopy);
                            }else{
                                CacheServiceBus.getStorageCache().set(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO, {
                                        id: "",
                                        name: "",
                                        address: "",
                                        provinceCode: "",
                                        provinceName: "",
                                        cityCode: "",
                                        cityName: "",
                                        level: "",
                                        mainPageFlag: ""}
                                )
                            }
                        }
                    });
            },
            refreshTerminalData: function(userID, onSuccess){
                HttpServiceBus.connect({
                    url : 'center/action/CustomPatientAction.jspx',
                    params : {
                        op: 'refreshTerminalData',
                        userVsId:userID
                    },
                    onSuccess : function(data){
                        if(data.success){
                            onSuccess(data.data);
                        }
                        else{
                            def.showMessage(data.message);
                        }

                    },
                    onError : function(data){
                    }
                });
            }
        }

        return def;
    })
    .build();