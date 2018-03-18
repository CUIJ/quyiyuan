new KyeeModule()
    .group("kyee.quyiyuan.config")
    .type("provider")
    .name("RouterConfig")
    .action(function () {

        var tables = [
            GLOBAL_ROUTER_TABLE,
            HOME_ROUTER_TABLE,
            //我的账单路由
            PAYMENT_ROUTER_TABLE,
            MYQUYI_ROUTER_TABLE,
            MESSAGE_CENTER_ROUTER_TABLE,
            //会诊记录
            CONSULATION_NOTE_ROUTER_TABLE,
            REPORT_ROUTER_TABLE,
            //跨院检查检验单
            REPORT_MULTIPLE_ROUTER_TABLE,
            APPOINT_ROUTER_TABLE,
            REGIST_ROUTER_TABLE,
            CENTER_ROUTER_TABLE,
            QUEUE_ROUTER_TABLE,
            NEW_QUEUE_ROUTER_TABLE,
            INTERACTION_TABLE,
            HOSPITAL_ROUTER_TABLE,
            REBATE_ROUTER_TABLE,
            //自我诊断路由
            TRIAGE_ROUTER_TABLE,
            //关于趣医页面路由
            ABOUT_QUYI_TABLE,
            //排班路由
            SCHEDULE_ROUTER_TABLE,
            SATISFACTION_ROUTER_TABLE,
            //c端预约挂号
            APPOINTMENT_ROUTER_TABLE,
            ////我的退费路由
            //REFUND_ROUTER_TABLE,
            MULTIPLE_QUERY_ROUTER_TABLE,
            //毫州新型农村合作医疗
            NCMS_ROUTER_TABLE,
            HOSPITAL_NOTICE_ROUTER_TABLE,
            //就诊卡充值
            PATIENT_RECHARGE,
            //医生角色路由
            DOCTOR_ROLE_ROUTER_TABLE,
            //地址管理路由
            ADDRESS_MANAGE_TABLE,
            //体检单路由
            MEDICAL_ROUTER_TABLE,
            //电子药品订单管理路由

            MEDICINE_ORDER_ROUTER_TABLE,
            //附近医院路由
            NEARBY_HOSPITAL_ROUTER_TABLE,
            //我的钱包--我的退费路由 //KYEEAPPC-3596//KYEEAPPC-3784
            MY_REFUND_ROUTER_TABLE,
            //任务号：KYEEAPPC-3461 新版院內导航路由
            HOSPITAL_NAVIGATION_ROUTER_TABLE,

            //个人中心——常用信息路由
            FREQUENT_INFO_ROUTER_TABLE,
            // 我的钱包路由配置
            MY_WALLET_TABLE,
            //就诊卡余额查询
            CARD_BALANCE,
            //停诊通知
            NOTICE_ROUTER_TABLE,
            //我的钱包--住院业务
            INPATIENT_PAYMENT_ROUTER,
            //价格公示
            PRICE_ROUTER_TABLE,
            //登录注册
            USER_ROUTER_TABLE,
            //预交金充值
            PREPAID_ROUTER_TABLE,
            //就诊卡充值(2.1.60版后) KYEEAPPC-5217
            PATIENT_CARD_RECHARGE_TABLE,
            //最新版叫号
            WAITING_QUEUE_TABLE,
            //门诊缴费 KYEEAPPC-6170
            CLINIC_PAYMENT_ROUTER,
            //缴费返现活动说明 KYEEAPPC-6712
            PAYMENT_CASHBACK_TABLE,
            //病友圈
            PATIENTS_GROUP_ROUTER_TABLE,
            //分诊
            TIERED_MEDICAL_TABLE,
            //一键理赔
            ONEKEY_CLAIM_ROUTER,
            //我的健康档案
            MY_HEALTH_FILES_ROUTER_TABLE,
            //短信全流程跳转
            MESSAGE_SKIP_ROUTER_TABLE,
            //个性化APK就医记录
            SP_MEDICAL_RECORD_ROUTER_TABLE,
            //一键呼救路由
            CALL_FOR_HELP_ROUTER_TABLE,
            // 问诊模块路由
            CONSULTATION_ROUTER_TABLE,
            //医患关系二维码
            DOCTOR_PATIENT_RELATION,
            //健康服务
            HEALTH_SERVE_TABLE,
            //智能导诊

            INTELLIGENT_GUIDE_TABLE,
            //个人健康管理
            HEALTH_MANAGE_TABLE,

            //一卡通
            HEALTH_CARD_ROUTER_TABLE,
            //我的处方
            MY_PRESCRIPTION,
            //周边医院
            SURROUNDING_HOSPITAL_ROUTER_TABLE
        ]


        this.getTables = function () {
            return tables;
        };

        this.$get = function () {
            return {};
        }
    })
    .build();