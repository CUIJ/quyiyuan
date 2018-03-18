var HOSPITAL_DATA = {

    //默认广告，第一次使用时或者医院没有广告时将会自动显示此广告
    defaultSlideboxData : function(){
        if(AppConfig.BRANCH_VERSION=="00"){//趣医
            return [
                {
                    url : "resource/images/ads/default_banner.jpg"
                }
            ];
        }else if(AppConfig.BRANCH_VERSION=="02"){//福建12320
            return [
                {
                    url : "resource/images/ads/fujian12320_banner.jpg"
                }
            ];
        }else{
            return [
                {
                    url : "resource/images/ads/default_banner2.jpg"
                }
            ];
        }
    },

    //首页九宫格元数据
    homeSudokuMetaData : {

        //图标序列
        data : {
            "APPOINTREGIST" : {
                name: "预约挂号",
                image_url: "icon-redcross2",
                shortcuts_image_url : "提前预约快人一步",
                href: "appointment",
                default : true,
                name_key:'home->MAIN_TAB.name_APPOINTREGIST',
                shortcuts_image_url_key:'home->MAIN_TAB.info_APPOINTREGIST',
                name_org:'预约挂号',
                shortcuts_image_url_org:'提前预约快人一步',
                elementCode:'appointment',
                image_new_url:"resource/images/hospital/order.png",
                image_new_url_next:"resource/images/hospital/order-ico.png",
                icon:"icon-doctor-registration"
            },
            "DOCTOR_CONSULT": {
                name: "咨询医生",
                shortcuts_image_url: "在线咨询医生，康复问题答疑",
                href: "consult_doctor_list",
                default: true,
                name_key: 'home->MAIN_TAB.name_CONSULT_DOCTOR',
                shortcuts_image_url_key: 'home->MAIN_TAB.info_CONSULT_DOCTOR',
                name_org: '咨询医生',
                shortcuts_image_url_org: '在线咨询医生，康复问题答疑',
                elementCode: 'doctorConsult',
                image_new_url: "resource/images/hospital/consult.png",
                image_new_url_next:"resource/images/hospital/consult-ico.png",
                icon:"icon-doctor-consult"
            },
            "QUEUING" : {
                name: "排队叫号",
                image_url: "icon-line",
                shortcuts_image_url : "实时查看门诊叫号",
                href: "queue",
                default : true,
                name_key:'home->MAIN_TAB.name_QUEUING',
                shortcuts_image_url_key:'home->MAIN_TAB.info_QUEUING',
                name_org:'排队叫号',
                shortcuts_image_url_org:'实时查看门诊叫号',
                elementCode:'queue',
                image_new_url:"resource/images/hospital/line-up.png",
                image_new_url_next:"resource/images/hospital/line-up-ico.png",
                icon:"icon-line-up"
            },
            //一键理赔首页
            "EXAM" : {
                name: "报告查询",
                image_url: "icon-inspect",
                shortcuts_image_url : "及时查看检查报告",
                href: "index_hosp",
                default : true,
                name_key:'home->MAIN_TAB.name_EXAM',
                shortcuts_image_url_key:'home->MAIN_TAB.info_EXAM',
                name_org:'报告查询',
                shortcuts_image_url_org:'及时查看检查报告',
                elementCode:'reportMultiple',
                image_new_url:"resource/images/hospital/select.png",
                image_new_url_next:"resource/images/hospital/select-ico.png",
                icon:"icon-report"
            },
            "JZKCZ" : {
                name: "就诊卡充值",
                image_url: "icon-card2",
                shortcuts_image_url : "就诊卡在线快速充值、退费",
                href: "patient_card_recharge",
                default : true,
                name_key:'home->MAIN_TAB.name_JZKCZ',
                shortcuts_image_url_key:'home->MAIN_TAB.info_JZKCZ',
                name_org:'就诊卡充值',
                shortcuts_image_url_org:'就诊卡在线快速充值、退费',
                elementCode:'walletCardRecharge',
                image_new_url:"resource/images/hospital/top-up.png",
                image_new_url_next:"resource/images/hospital/top-up-ico.png",
                icon:"icon-medical-card-recharge"
            },
            "SCHEDULE" : {
                name: "医生排班",
                image_url: "icon-doctors",
                shortcuts_image_url : "医生简介及排班",
                href: "schedule",
                default : true,
                name_key:'home->MAIN_TAB.name_SCHEDULE',
                shortcuts_image_url_key:'home->MAIN_TAB.info_SCHEDULE',
                name_org:'医生排班',
                shortcuts_image_url_org:'医生简介及排班',
                elementCode:'schedule',
                image_new_url:"resource/images/hospital/scheduling.png",
                image_new_url_next:"resource/images/hospital/scheduling-ico.png",
                icon:"icon-doctor-scheduling"
            },
            "NAVIGATION" : {
                name: "院内布局",
                image_url: "icon-nav",
                shortcuts_image_url : "地理位置楼层布局",
                href: "hospital_navigation",
                default : true,
                name_key:'home->MAIN_TAB.name_NAVIGATION',
                shortcuts_image_url_key:'home->MAIN_TAB.info_NAVIGATION',
                name_org:'院内布局',
                shortcuts_image_url_org:'地理位置楼层布局',
                elementCode:'hospitalNavigation',
                image_new_url:"resource/images/hospital/map.png",
                image_new_url_next:"resource/images/hospital/map-ico.png",
                icon:"icon-hospital-navigation"
            },

            "FEATURESDEPT" : {
                name: "特色科室",
                image_url: "icon-feature",
                shortcuts_image_url : "医院重点主推科室",
                href: "features_dept",
                default : true,
                name_key:'home->MAIN_TAB.name_FEATUREDEPT',
                shortcuts_image_url_key:'home->MAIN_TAB.info_FEATUREDEPT',
                name_org:'特色科室',
                shortcuts_image_url_org:'医院重点主推科室',
                elementCode:'featuresDept',
                image_new_url:"resource/images/hospital/features.png",
                image_new_url_next:"resource/images/hospital/features-ico.png",
                icon:"icon-featured-unit"
            },
            "INTERACTION" : {
                name: "医患互动",
                image_url: "icon-doctor2",
                shortcuts_image_url : "医生与患者沟通的平台",
                href: "interaction",
                default : true,
                name_key:'home->MAIN_TAB.name_INTERACTION',
                shortcuts_image_url_key:'home->MAIN_TAB.info_INTERACTION',
                name_org:'医患互动',
                shortcuts_image_url_org:'医生与患者沟通的平台',
                elementCode:'interaction',
                image_new_url:"resource/images/hospital/chat.png",
                icon:"icon-interaction"
            },
            "PRICEBOARD" : {
                name: "价格公示",
                image_url: "icon-drug",
                shortcuts_image_url : "查询医院药品、就诊项目的价格",
                href: "price",
                default : true,
                name_key:'home->MAIN_TAB.name_PRICEBOARD',
                shortcuts_image_url_key:'home->MAIN_TAB.info_PRICEBOARD',
                name_org:'价格公示',
                shortcuts_image_url_org:'查询医院药品、就诊项目的价格',
                elementCode:'price',
                image_new_url:"resource/images/hospital/price.png",
                icon:"icon-price-publicity"
            },
            "YYGG" : {
                name: "医院资讯",
                image_url: "icon-news",
                shortcuts_image_url : "提供最新最全的趣医及医院的资讯信息",
                href: "hospitalNotice",
                default : true,
                name_key:'home->MAIN_TAB.name_YYGG',
                shortcuts_image_url_key:'home->MAIN_TAB.info_YYGG',
                name_org:'医院资讯',
                shortcuts_image_url_org:'提供最新最全的趣医及医院的资讯信息',
                elementCode:'hospitalNotice',
                image_new_url:"resource/images/hospital/news.png",
                icon:"icon-hospital-information"
            },
            "NCMS" : {
                name: "新农合",
                image_url: "icon-xnh",
                shortcuts_image_url : "查询门诊报销和住院报销记录",
                href: "ncms.famialy",
                default : AppConfig.BRANCH_VERSION == "03",
                name_key:'home->MAIN_TAB.name_NCMS',
                shortcuts_image_url_key:'home->MAIN_TAB.info_NCMS',
                name_org:'新农合',
                shortcuts_image_url_org:'查询门诊报销和住院报销记录',
                elementCode:'ncmsFamialy',
                image_new_url:"resource/images/hospital/xinnonghe.png",
                icon:"icon-xnh"
            },
            "MEDICAL" : {
                name: "体检报告",
                image_url: "icon-examination3",
                shortcuts_image_url : "及时查看体检报告",
                href: "medical",
                default : true,
                name_key:'home->MAIN_TAB.name_MEDICAL',
                shortcuts_image_url_key:'home->MAIN_TAB.info_MEDICAL',
                name_org:'体检报告',
                shortcuts_image_url_org:'及时查看体检报告',
                elementCode:'medical',
                image_new_url:"resource/images/hospital/report.png",
                icon:"icon-drug-orders"
            },

            "HOSPITALINFO" : {
                name: "医院简介",
                image_url: "icon-redcross",
                shortcuts_image_url : "医院相关信息",
                href: "hospital_introduce",
                default : true,
                name_key:'home->MAIN_TAB.name_HOSPITALINFO',
                shortcuts_image_url_key:'home->MAIN_TAB.info_HOSPITALINFO',
                name_org:'医院简介',
                shortcuts_image_url_org:'医院相关信息',
                elementCode:'hospitalIntroduce',
                image_new_url:"resource/images/hospital/about.png",
                image_new_url_next:"resource/images/hospital/hospital-ico.png",
                icon:"icon-hospital-introduction"
            },
            "STOPNOTICE" : {
                name: "停诊通知",
                image_url: "icon-stop",
                shortcuts_image_url : "医生停诊告知",
                href: "clinicStopNotice",
                default : true,
                name_key:'home->MAIN_TAB.name_STOPNOTICE',
                shortcuts_image_url_key:'home->MAIN_TAB.info_STOPNOTICE',
                name_org:'停诊通知',
                shortcuts_image_url_org:'医生停诊告知',
                elementCode:'clinicStopNotice',
                image_new_url:"resource/images/hospital/notice.png",
                icon:"icon-stopping-admission"
            },
            "PAYMENT" : {
                name: "门诊缴费",
                image_url: "icon-echoscope",
                shortcuts_image_url : "门诊费用查询&缴费",
                href: "clinicPayment",
                default : true,
                name_key:'home->MAIN_TAB.name_PAYMENT',
                shortcuts_image_url_key:'home->MAIN_TAB.info_PAYMENT',
                name_org:'门诊缴费',
                shortcuts_image_url_org:'门诊费用查询&缴费',
                elementCode:'clinicPayment',
                image_new_url:"resource/images/hospital/pay-cost.png",
                image_new_url_next:"resource/images/hospital/pay-cost-ico.png",
                icon:"icon-outpatient-payment"
            },
            "INPATIENTPAYMENTRECORD" : {
                name: "住院缴费",
                image_url: "icon-hospital2",
                shortcuts_image_url : "住院费用查询&缴费",
                href: "inpatient_payment_record",
                default : true,
                name_key:'home->MAIN_TAB.name_INPATIENTPAYMENTRECORD',
                shortcuts_image_url_key:'home->MAIN_TAB.info_INPATIENTPAYMENTRECORD',
                name_org:'住院缴费',
                shortcuts_image_url_org:'住院费用查询&缴费',
                elementCode:'inpatientPaymentRecord',
                image_new_url:"resource/images/hospital/hospital-pay-cost.png",
                image_new_url_next:"resource/images/hospital/hospital-pay-cost-ico.png",
                icon:"icon-hospital-costs"
            },
            "INPATIENTSATISFACTION" : {
                name: "住院满意度",
                image_url: "icon-good",
                shortcuts_image_url : "患者住院评价",
                href: "satisfaction_hospital_list",
                default : true,
                name_key:'home->MAIN_TAB.name_INPATIENTSATISFACTION',
                shortcuts_image_url_key:'home->MAIN_TAB.info_INPATIENTSATISFACTION',
                name_org:'住院满意度',
                shortcuts_image_url_org:'患者住院评价',
                elementCode:'satisfactionHospitalList',
                image_new_url:"resource/images/hospital/evaluation.png",
                icon:"icon-hospitalization-satisfaction"
            },
            //新增护士陪诊功能
            "NURSE_DIAGNOSIS": {
                name: "护士陪诊",
                image_url:'icon-nurse f35',
                shortcuts_image_url : "排队取号、规划就诊",
                href: "homeWeb",
                default : true,
                name_key:'home->MAIN_TAB.name_NURSE_DIAGNOSIS',
                shortcuts_image_url_key:'home->MAIN_TAB.info_NURSE_DIAGNOSIS',
                name_org:'护士陪诊',
                shortcuts_image_url_org:'排队取号、规划就诊',
                elementCode:'homeWeb',
                image_new_url:"resource/images/hospital/nurse.png",
                icon:"icon-nurse-acco"
            },
            //一键理赔
            "ONE_KEY_CLAIM": {
                name: "理赔",
                image_url:'icon-insurance f35',
                shortcuts_image_url : "便捷、快速的线上理赔",
                href: "one_quick_claim",
                default : true,
                name_key:'home->MAIN_TAB.name_ONE_KEY_CLAIM',
                shortcuts_image_url_key:'home->MAIN_TAB.info_ONE_KEY_CLAIM',
                name_org:'理赔',
                shortcuts_image_url_org:'便捷、快速的线上理赔',
                elementCode:'oneQuickClaim',
                image_new_url: "resource/images/hospital/claims.png",
                icon:"icon-claims"
            },
            //网络门诊
            "NETWORK_CLINIC": {
                name: "网络门诊",
                image_url: "",
                shortcuts_image_url: "视频问诊、远程购药开单",
                href: "network_clinic_dl",
                default: true,
                name_key: "home->MAIN_TAB.name_NETWORK_CLINIC",
                shortcuts_image_url_key: 'home->MAIN_TAB.info_NETWORK_CLINIC',
                name_org: '网络门诊',
                shortcuts_image_url_org: '视频问诊、远程购药开单',
                elementCode: 'networkClinic',
                image_new_url: "resource/images/hospital/net-hospital.png",
                image_new_url_next:"resource/images/hospital/net-hospital-ico.png",
                icon:"icon-online-medical"
            },
            //新增住院陪护功能
            "NURSE_ESCORT": {
                name: "治疗陪护",
                image_url:'icon-nurse f35',
                shortcuts_image_url : "护士陪伴、缓解病痛",
                href: "escortWeb",
                default : true,
                name_key:'home->MAIN_TAB.name_NURSE_ESCORT',
                shortcuts_image_url_key:'home->MAIN_TAB.info_NURSE_ESCORT',
                name_org:'治疗陪护',
                shortcuts_image_url_org:'护士陪伴、缓解病痛',
                elementCode:'escortWeb',
                image_new_url:"resource/images/hospital/inpatientCare.png",
                icon:"icon-group"
            },
            //新增服务满意度评价功能
            "SERVICE_SATISFACTION": {
                name: "服务满意度评价",
                image_url:'icon-SATISFACTION f35',
                shortcuts_image_url : "国家卫计委调查医院服务满意度入口",
                href: "service_satisfaction",
                default : true,
                name_key:'home->MAIN_TAB.name_SERVICE_SATISFACTION',
                shortcuts_image_url_key:'home->MAIN_TAB.info_SERVICE_SATISFACTION',
                name_org:'服务满意度评价',
                shortcuts_image_url_org:'国家卫计委调查医院服务满意度入口',
                elementCode:'service_satisfaction',
                image_new_url:"resource/images/hospital/evaluate.png",
                icon:"icon-group"
            }
        }
    }
};