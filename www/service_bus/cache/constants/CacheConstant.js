/**
 * 缓存全局变量
 *
 * @type {{MEMORY_CACHE: {CURRENT_USER: string, CURRENT_PWD: string, CURRENT_USER_RECORD: string, IS_LOGIN: string, CURRENT_GNQ_USER_TYPE: string}, GETSTORAGE_CACHE: {}}}
 */
var CACHE_CONSTANTS = {

    /**
     * 内存变量
     */
    MEMORY_CACHE : {
        CURRENT_USER : "currentUser",                           //当前登录用户名（手机号）
        CURRENT_PWD : "currentPwd",                             //当前登录密码（明文）
        CURRENT_USER_RECORD : "currentUserRecord",            //登录用户信息(json对象，包含许多具体信息)
        IS_LOGIN : "isLogin",                                   //是否登陆
        CURRENT_GNQ_USER_TYPE : "currentgnqUserType",         //登录用户类型
        CURRENT_CUSTOM_PATIENT : "currentCustomPatient",     //当前就诊者
        CURRENT_CARD_INFO : "currentCardInfo",                 //当前卡信息
        PHONE_TYPE : "phoneType",                               //设备厂商
        VERSION_NUM : "versionNum",                             //版本号
        OPERATING_SYS : "operatingSys",                         //操作系统（“0”：android  “1”：ios）
        MEDICAL_CARDNO:"medicalCardNo",                         //预约需要输入物理卡号，密码时，保存患者输入的卡号
        CURRENT_USER_SOURCE:"currentUserSource",           //用户来源【***】
        CURRENT_USER_ID_FROM_114:"currentUserIdForm114",  //114用户userId【***】
        CURRENT_USER_OPEN_ID:"currentUserOpenId",          //微信公众号openId【***】
        CURRENT_USER_PUBLIC_SERVER_TYPE:"currentUserPublicServerType",//第三方平台类型【***】
        DOCTOR_MENUS_DATA: "doctorMenusData",             //医生视角菜单权限信息
        TOKEN_4_FULL_CHECK : "token4FullCheck",             //用于数据完整行校验的 token
        QUEUE_JUMP_VIEW:"queueJumpView",                   //排队模块做跳转适配
        CHANNEL_ID : "CHANNEL_ID" ,                          //百度推送 ID
        HOME_ADV:'homeAdv',                                  // 首页广告
        PROVINCE_LIST:"provinceList", //省份列表
        CITY_LIST:"cityList",//城市列表
        HOSPITAL_LIST:"hospitalList",//医院列表
        CHECK_USER:"checkUser",               //管理员标示
        WX_OPEN_ID:"WX_OPEN_ID", //微信公众号openId 程铄闵 KYEEAPPC-5231
        IS_CLOSE_HOSPITAL:"isCloseHospital",  //当前医院是否正在维护
        URL_INFO_HOSPITAL:"urlInfoParams",    //访问主页面Url后面的参数
        ROUTER_PATHS:'routerPaths',
        RISK_USER_OPERTER:'riskOperter',//用户是否去掉勾选免费停诊险
        RUSH_MESSAGE_DATA:'rushMessageData', // 抢号状态提醒数据
        CURRENT_VIEW_ROUTER:'currentViewRouter', //当前页面路由
        NO_LOGIN_AND_PATIENT:'noLoginAndPatient', //无须登录和有就诊者
        WX_OPEN_PATIENT:'wxOpenPatient',  //微信就医记录评价标识
        GROUP_HOSPITAL_FLAG:'groupHospitalFlag', //医疗云APP集团医院扫码下载标识
        YSBZ_WX_FLAG:'ysbzWxFlag', //养生亳州微信公众号预约挂号链接进入标识
        USER_TEMP_HOSPITAL:'userTempHospital'//普通用户可以查看的的试上线医院 KYEEAPPTEST-4400
    },

    /**
     * 缓存器变量
     */
    STORAGE_CACHE : {
        USER_VS_ID_BEFORE_1001 : "USER_VS_ID_BEFORE_1001",
        REMEMBER_PWD : "rememberPwd",    //记住密码
        AUTO_LOGIN : "autoLogin",        //自动登录
        USER_ID : "userId",               //用户ID,微信公共号跳转使用。
        USER : "user",                      //用户名
        PWD : "pwd",                          //密码
        LOGIN_TYPE:"type",                          //登录类型 1：手机号+密码 2：手机号+验证码
        SECURITY_CODE:"security_code",   //手机验证码
        AUTHS_CODE:"authsCode",//第三方用户ID
        U_ID:"UId",            //第三方用户ID
        THIRD_LOGIN_TYPE:"loginType",
        CURRENT_UNIQUE_HOSPITAL_ID:'currentUniqueHospitalId', //医疗云APP单家医院扫码下载登录切换医院ID

        /**
         * 医院信息
         * 结构为：
         * {
         *  id : 医院id,
         *  name : 医院名称,
         *  address : 医院地址,
         *  advs : 医院广告,
         *  provinceCode ： 省份编码,
         *  provinceName : 省份名称,
         *  cityCode : 城市编码,
         *  cityName : 城市名称,
         *  is_dept_grade : 是否分级科室,
         *  is_home_appoint_enable : c 端首页立即预约挂号按钮是否允许进入,
         *
         * }
         */
        HOSPITAL_INFO : "hospitalInfo",
        /**
         * 上次选择的医院信息
         */
        OLD_HOSPITAL_INFO: "oldHospitalInfo",
        /**
         * 上次选择的医院功能列表
         */
        OLD_HOME_DATA: "oldHomeData",
        /**
         * 当前选择的医院类型，0：医院，1：诊所
         */
        HOSPITAL_TYPE: "hospitalType",
        /**
         * 当前所选医院的页面元素控制数据
         */
        CURR_HOSPITAL_KAH : "currHospitalKAH",

        /**
         * 主页面信息
         * 结构为：
         * {
         *  rights : 主页面权限描述,
         *  sudokuData : 九宫格数据，
         *  shortcutsData : 首页快捷图标数据
         * }
         */
        HOME_DATA : "homeData",

        /**
         * 最后登录的城市信息
         * 结构为：
         * {
         *  CITY_CODE : 城市编号，
         *  CITY_ID : 城市id,
         *  CITY_NAME : 城市名称,
         *  PROVINCE_CODE : 省份编号,
         *  PROVINCE_ID ： 省份id,
         *  PROVINCE_NAME : 省份名称
         * }
         */
        LAST_CITY_INFO : "lastCityInfo",


        /**
         * 用户搜索历史记录(keywords) 类型为Array
         */
        SEARCH_HISTORIES : "searchHistories",
        /**
         * 药品搜索记录
         */
        MEDICAL_SEARCH_HISTORIES : "medicalsearchHistories",
        /**
         * 项目搜索记录
         */
        PROJECT_SEARCH_HISTORIES : "projectsearchHistories",
        /**
         * 定位获取的城市信息
         * 结构为：
         * {
         *  CITY_NAME : 城市名称
         *  CITY_CODE : 城市编码
         *  PROVINCE_NAME : 城市名称
         *  PROVINCE_CODE : 省份编码
         *  LOCAL_TYPE : 定位方式 0：自动，1：手动,默认为手动
         * }
         */
        LAST_PROVINCE_CITY_INFO : "lastProvinceCityInfo",
        //用于存储用户的定位信息缓存
        LOAD_CURRENT_CITY_INFO:"loadCurrentCityInfo",
        /**
         * 本地存储消息数据
         *
         * 结构为：
         * {
         *  READ_MESSAGE_DATA : 已读消息数据
         *  UNREAD_MESSAGE_DATA : 未读消息数据
         *  LAST_DATE : 本地消息最后更新时间
         *  LAST_DATE格式为{USER_VS_ID: TIME}的集合
         * }
         */
        LOCAL_MESSAGE_DATA : "loaclMessageData",

        TEL_USER_INFO : "telUserInfo",

        INSURANCE_USER_INFO : "insuranceUserInfo",
        /**
         * APP 唯一标示符
         */
        APP_UUID : "APP_UUID",
        /**
         * 科室信息
         * {
         *   DEPT_ID ： 科室ID
		 *	 DEPT_CODE: 科室编号
		 *	 DEPT_NAME:科室名称,
		 *	 DISPLAY_ORDER:序号,
		 *	 IS_ONLINE:是否网络科室
         * }
         */
        DEPT_INFO : "deptInfo",
        /**
         * 首页小铃铛位置信息
         * {
         *   top:  Y轴位置
         *   left: X轴位置
         * }
         */
        BELL_POSITION: "bellPosition",
        BELL_POSITION1: "bellPosition1",
        LANG_TYPE : "KYEE_LATEST_LANG_VALUE" ,  //APP语言类型
        INPUT_CARD_INFO:'inputCardNoInfo', //用于存储就医记录用户输入的就诊卡号和住院号
        INPATIENT_PAYMENT_INFO:'inpatientPaymentInfo',//住院费用 程铄闵 KYEEAPPC-4453
        INPATIENT_PAID_INFO:'inpatientPaidInfo',//住院已结算 程铄闵 KYEEAPPC-4453
        CLINIC_PAYMENT_INFO:'clinicPaymentInfo',//门诊待缴费 程铄闵 KYEEAPPC-4451
        CLINIC_PAID_INFO:'clinicPaidInfo',//门诊已缴费 程铄闵 KYEEAPPC-4451
        /**
         * 用户在是否切换到维语提示框中的选择缓存
         * undefined:app之前没有切换维语的提示
         * true:用户选择了切换维语
         * false:用户没有选择切换维语
         */
        HAS_SELECT_UYG :"hasSelectUYG",
        USER_OPERATION_RECORDS:'userOperationRecords',//用户操作记录数据
        //angular全局异常缓存器
        ANGULAR_EXCEPTION:'angularException',
        /**
         * 病友圈存储数据字段
         */
        RL_LOGIN_INFO: 'rlLoginInfo',//容联登录信息
        YX_LOGIN_INFO: 'yxLoginInfo',//云信登录信息
        USER_ACT_INFO: 'userActInfo',//病友圈用户信息
        GROUP_FIRST_GOIN: 'groupFirstGoIn',//用户首次进入标识存储数据
        RECOMMEND_GROUP: 'recommendGroup',//推荐群组消息列表
        STICK: 'stick', //置顶字段
        RECEIVE_TIME: 'receiveTime', //接收消息时间

        PATIENTS_GROUP_UPGRADE_URL: 'patientsGroupUpgradeUrl', //病友圈服务器升级时图片url

        PATIENTS_GROUP_SWITCH: 'patientsGroupSwitch' , // 病友圈开关
        SESSION_LIST:'sessionList',//会话列表

        SERVER_TIME:'serviceTime',//当前后台服务器时间
        GROUP_ANNOUNCEMENT: 'groupAnnouncement', //群公告
        RISK_PROMOTION_FIRST_SHOW:"riskPromotionFirstShow",  //保险促销活动首次点击
        RISK_PROMOTION_START_TIME_LIST:"riskPromotionStartTimeList", //保险促销活动每次的开始时间集合
        IS_SUPPORT_DB:'isSupportDB',//该页面是否支持并开启数据库
        LOGIN_TIME:'loginTime',
    }
};