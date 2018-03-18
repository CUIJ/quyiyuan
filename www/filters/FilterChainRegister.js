new KyeeModule()
    .group("kyee.quyiyuan.filters")
    .require([
        "kyee.quyiyuan.filters.impl.hospital",
        "kyee.quyiyuan.filters.impl.user",
        "kyee.quyiyuan.filters.impl.selectCustomPatient",
        "kyee.quyiyuan.filters.impl.selectCard",
        "kyee.quyiyuan.filters.impl.BozhouCustomized",
        "kyee.quyiyuan.filters.impl.selectPhysicalCard",
        "kyee.quyiyuan.filters.impl.firstpage",
        "kyee.quyiyuan.filters.impl.userInformation"
    ])
    .type("service")
    .name("FilterChainRegister")
    .params(["HospitalFilterDef", "UserFilterDef","SelectCardDef","BozhouCustomized","SelectCustomPatientDef","SelectPhysicalCardDef","StartFirstPage","UserInfFilterDef"])
    .action(function(HospitalFilterDef,UserFilterDef,SelectCardDef,BozhouCustomized,SelectCustomPatientDef,SelectPhysicalCardDef,StartFirstPage,UserInfFilterDef){

        var def = {

            //过滤器链定义
            chains : {

                //医院选择
                SELECT_HOSPITAL_FILTER : {
                    chain : [HospitalFilterDef]
                },
                //选择就诊者  By  张家豪  KYEEAPPC-4459
                SELECT_CUSTOM_PATIENT:{
                    chain : [SelectCustomPatientDef]
                },
                //登录
                USER_LOGIN_FILTER : {
                    chain : [UserFilterDef]
                },
                //医院选择 & 用户登录
                //请不要调整顺序
                USER_LOGIN_AND_SELECT_HOSPITAL_FILTER : {
                    //chain : [HospitalFilterDef, UserFilterDef]
                    chain : [UserFilterDef,HospitalFilterDef]
                },

                //用户登录 & 选择就诊者  By  张家豪  KYEEAPPC-4459
                USER_LOGIN_AND_SELECT_CUSTOM_PATIENT_FILTER : {
                    chain : [UserFilterDef,SelectCustomPatientDef]
                },
                //医院选择 & 用户登录 & 选择就诊者  By  张家豪  KYEEAPPC-4459
                USER_LOGIN_AND_SELECT_HOSPITAL_AND_SELECT_CUSTOM_PATIENT_FILTER : {
                    chain : [HospitalFilterDef, UserFilterDef,SelectCustomPatientDef]
                },
                // 用户登录 & 选择就诊者 & 医院选择  By  李聪  KYEEAPPC-10795
                USER_LOGIN_AND_SELECT_CUSTOM_PATIENT_FILTER_AND_SELECT_HOSPITAL : {
                    chain : [UserFilterDef,SelectCustomPatientDef,HospitalFilterDef]
                },
                //医院选择 & 用户登录 & 选择就诊者 & 选择就诊卡  By  张家豪  KYEEAPPC-4459
                USER_LOGIN_AND_SELECT_HOSPITAL_AND_SELECT_CUSTOM_PATIENT_AND_SELECT_CARD_FILTER : {
                    chain : [HospitalFilterDef, UserFilterDef,SelectCustomPatientDef,SelectCardDef]
                },
                //医院选择 & 用户登录 & 选择就诊者 & 选择物理就诊卡  By  程志 KYEEAPPTEST-3174，2015年12月14日09:30:50
                USER_LOGIN_AND_SELECT_HOSPITAL_AND_SELECT_CUSTOM_PATIENT_AND_SELECT_PHYSICAL_CARD_FILTER : {
                    chain : [HospitalFilterDef, UserFilterDef,SelectCustomPatientDef,SelectPhysicalCardDef]
                },

                //亳州定制登陆
                BO_CITY_CUSTOMIZED : {
                    chain : [BozhouCustomized]
                },

                //启动首页
                START_FIRST_PAGE:{
                    chain : [StartFirstPage]
                },
                //用户信息完善
                USER_INFORMATION_USER_LOGIN_FILTER:{
                    chain : [UserFilterDef,UserInfFilterDef]
                },
                //用户信息完善
                USER_INFORMATION_USER_LOGIN_AND_SELECT_CUSTOM_PATIENT:{
                    chain : [UserFilterDef,UserInfFilterDef,SelectCustomPatientDef]
                }

            },

            /**
             * 获取过滤器链定义
             *
             * @returns {def.chains|{SELECT_HOSPITAL_FILTER, USER_AND_HOSPITAL_FILTER}}
             */
            getChains : function(){

                return this.chains;
            }
        };

        return def;
    })
    .build();