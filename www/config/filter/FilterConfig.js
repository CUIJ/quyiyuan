/**
 * 过滤器配置
 * 任务号：KYEEAPPC-4468
 *修改人：huangxiaomei
 * 修改原因：部分拦截器废弃
 * 修改时间：2015年12月9日20:32:17
 * @type {{FILTER: {ROUTER:hospital_detail: {chainId: string, returnView: string}, ROUTER:appoint: {chainId: string, returnView: string}, ROUTER:navigation: {chainId: string, returnView: string}}}}
 */
var FilterConfig = {

    //视图拦截器
    viewFilter: {

        //医院导航配置
        navigation: {
            chainId: "SELECT_HOSPITAL_FILTER",
            returnView: "navigation"
        },
        //就诊记录拦截
        //去调进就医记录选医院和选择就诊者的拦截 By 杜巍巍 KYEEAPPC-4374
        "myquyi->MAIN_TAB.medicalGuide": {
            chainId: "USER_LOGIN_FILTER",
            returnView: "myquyi->MAIN_TAB.medicalGuide"
        },
        //医院排班拦截
        schedule: {
            chainId: "SELECT_HOSPITAL_FILTER",
            returnView: "schedule"
        },
        //KYEEAPPC-4421 张明 2015.12.07 去掉该功能选择医院过滤器限制  KYEEAPPC-4461 增加就诊者校验
        report_multiple : {
            chainId : "USER_LOGIN_AND_SELECT_HOSPITAL_AND_SELECT_CUSTOM_PATIENT_FILTER",
            returnView : "report_multiple"
        },
        //消息中心
        messagecenter : {
            chainId : "USER_LOGIN_FILTER",
            returnView : "messagecenter"
        },
        //满意度
        satisfaction : {
            chainId : "USER_LOGIN_AND_SELECT_HOSPITAL_AND_SELECT_CUSTOM_PATIENT_FILTER",
            returnView : "satisfaction"
        },
        //预约
        appoint : {
            chainId : "SELECT_HOSPITAL_FILTER",
            returnView : "appoint"
        },
        // 当日挂号
        regist : {
            chainId : "SELECT_HOSPITAL_FILTER",
            returnView : "regist"
        },
        //叫号查询
        queue : {
            chainId : "USER_LOGIN_AND_SELECT_HOSPITAL_FILTER",
            returnView : "queue"
        },
        //叫号查询，直接进入叫号页面情况下拦截
        queue_clinic : {
            chainId : "USER_LOGIN_AND_SELECT_HOSPITAL_FILTER",
            returnView : "queue_clinic"
        },
        //新的叫号查询
        new_queue : {
            chainId : "USER_LOGIN_AND_SELECT_HOSPITAL_FILTER",
            returnView : "new_queue"
        },
        //新的叫号查询,直接进入叫号页面情况下拦截
        new_queue_clinic : {
            chainId : "USER_LOGIN_AND_SELECT_HOSPITAL_FILTER",
            returnView : "new_queue_clinic"
        },
        //我的健康拦截
        my_healthy:{
            chainId : "USER_LOGIN_AND_SELECT_HOSPITAL_FILTER",
            returnView : "my_healthy"
        },
        //最新的叫号查询,直接进入叫号页面情况下拦截
        waiting_queue_clinic : {
            chainId : "USER_LOGIN_AND_SELECT_HOSPITAL_FILTER",
            returnView : "waiting_queue_clinic"
        },
        //最新的叫号查询
        waiting_queue_dept : {
            chainId : "USER_LOGIN_AND_SELECT_HOSPITAL_FILTER",
            returnView : "waiting_queue_dept"
        },
        //免挂号费
        rebate : {
            chainId : "USER_LOGIN_AND_SELECT_HOSPITAL_FILTER",
            returnView : "rebate"
        },
        //我的二维码//提供选择就诊者过滤器（公共）  By  张家豪  KYEEAPPC-4459
        my_qr_code : {
            chainId : "USER_LOGIN_AND_SELECT_HOSPITAL_AND_SELECT_CUSTOM_PATIENT_FILTER",
            needCustomFinishFn:true,
            returnView : "my_qr_code"

        },
        //切换角色
        role_view : {
            chainId : "USER_LOGIN_AND_SELECT_HOSPITAL_FILTER",
            returnView : "role_view"
        },
        //门诊费用 KYEEAPPC-4451
        "clinicPayment" : {
            chainId : "USER_LOGIN_AND_SELECT_CUSTOM_PATIENT_FILTER",
            returnView : "clinicPayment"
        },
        //2.2.10版 门诊费用 KYEEAPPC-6170
        "clinic_payment_revise" : {
            chainId : "USER_LOGIN_AND_SELECT_CUSTOM_PATIENT_FILTER_AND_SELECT_HOSPITAL",
            returnView : "clinic_payment_revise"
        },
        //2.4.80版 门诊费用(就医模块)
        "clinic_payment_hos" : {
            chainId : "USER_LOGIN_AND_SELECT_CUSTOM_PATIENT_FILTER_AND_SELECT_HOSPITAL",
            returnView : "clinic_payment_hos"
        },
      /*  //预约挂号记录
        "appointment_regist_list" : {
            chainId : "SELECT_HOSPITAL_FILTER",
            returnView : "appointment_regist_list"
        },*/
        //自我诊断 选择科室
        "triageSelectDept" : {
            chainId : "SELECT_HOSPITAL_FILTER",
            returnView : "triageSelectDept"
        },
        //自我诊断 查看疾病并且选择科室
        "diagnosticInfo" : {
            chainId : "SELECT_HOSPITAL_FILTER",
            returnView : "diagnosticInfo"
        },
        //新版预约挂号界面
        "appointment" : {
            chainId : "SELECT_HOSPITAL_FILTER",
            returnView : "appointment"
        },
        //预约确认
         "appoint_confirm" : {
            chainId : "SELECT_CUSTOM_PATIENT",
            returnView : "appoint_confirm"
        },

        //挂号确认
        "regist_confirm" : {
            chainId : "SELECT_CUSTOM_PATIENT",
            returnView : "regist_confirm"
        },
        //就诊卡充值  //KYEEAPPC-4687 程铄闵 拦截到就诊卡 //KYEEAPPTEST-3222 去掉就诊卡公共拦截
        //修改为拦截未选物理卡 By 程志 KYEEAPPTEST-3174，2015年12月14日09:30:50
        "wallet_card_recharge" : {
            chainId : "USER_LOGIN_AND_SELECT_HOSPITAL_AND_SELECT_CUSTOM_PATIENT_FILTER",
            needCustomFinishFn:true,//KYEEAPPC-4842 程铄闵 拦截后请求再跳转
            returnView : "wallet_card_recharge"
        },
        //就诊卡充值(2.1.60版后) KYEEAPPC-5217 程铄闵
        "patient_card_recharge" : {
            chainId : "USER_LOGIN_AND_SELECT_HOSPITAL_AND_SELECT_CUSTOM_PATIENT_FILTER",
            needCustomFinishFn:true,
            returnView : "patient_card_recharge"
        },
        //进入就诊卡充值(2.1.60版后)中间态 KYEEAPPC-5217 程铄闵
        //"patient_card_recharge_a" : {
        //    chainId : "USER_LOGIN_AND_SELECT_HOSPITAL_FILTER",
        //    needCustomFinishFn:true,
        //    returnView : ""
        //},
        //体检单拦截
        medical : {
            chainId : "USER_LOGIN_AND_SELECT_HOSPITAL_FILTER",
            returnView : "medical"
        },
        //我的关注 KYEEAPPC-4421 张明 2015.12.07 去掉该功能选择医院过滤器限制
        "careDoctors" : {
            chainId : "USER_INFORMATION_USER_LOGIN_AND_SELECT_CUSTOM_PATIENT",
            returnView : "careDoctors"
        },
        //个人中心-地址管理 添加登录拦截器
        "address_manage" : {
            chainId : "USER_LOGIN_FILTER",
            returnView : "address_manage"
        },
        //免挂号费
        "register_free" : {
            chainId : "USER_LOGIN_AND_SELECT_HOSPITAL_FILTER",
            returnView : "register_free"
        },
        //就诊卡余额
        "card_balance" : {
            chainId : "USER_LOGIN_AND_SELECT_HOSPITAL_FILTER",
            returnView : "card_balance"
        },
        //停诊通知
        "clinicStopNotice" : {
            chainId : "SELECT_HOSPITAL_FILTER",
            returnView : "clinicStopNotice"
        },
        //住院费用 KYEEAPPC-4560
        //"inpatient_payment_record" : {
        //    chainId : "USER_LOGIN_AND_SELECT_CUSTOM_PATIENT_FILTER",
        //    returnView : "center->MAIN_TAB"
        //},
        //我的退款  //KYEEAPPC-4453
        "my_refund" : {
            chainId : "USER_LOGIN_AND_SELECT_CUSTOM_PATIENT_FILTER",
            returnView : "my_refund"
        },
        "aboutquyi_feedback" : {
            chainId : "USER_LOGIN_FILTER",
            returnView : "aboutquyi_feedback"
        },
        //个人中心
        //"center->MAIN_TAB" : {
        //    chainId : "USER_LOGIN_FILTER",
        //    returnView : "center->MAIN_TAB"
        //},
        //住院预缴 //KYEEAPPC-4453
        perpaid : {
            chainId : "USER_LOGIN_AND_SELECT_HOSPITAL_AND_SELECT_CUSTOM_PATIENT_FILTER",
            returnView : "perpaid"
        },
        perpaid_pay_info : {
            chainId : "USER_LOGIN_AND_SELECT_HOSPITAL_AND_SELECT_CUSTOM_PATIENT_FILTER",
            returnView : "perpaid_pay_info"
        },
        //住院满意度
        satisfaction_hospital_list : {
            chainId : "USER_LOGIN_FILTER",
            returnView : "satisfaction_hospital_list"
        },
        //医患互动  //KYEEAPPTEST-3181
        interaction : {
            chainId : "USER_LOGIN_AND_SELECT_HOSPITAL_AND_SELECT_CUSTOM_PATIENT_FILTER",
            returnView : "interaction"
        },
        //电子订单  //KYEEAPPTEST-3181
        medicineOrder:{
            chainId : "USER_LOGIN_AND_SELECT_HOSPITAL_AND_SELECT_CUSTOM_PATIENT_AND_SELECT_CARD_FILTER",
            returnView : "medicineOrder"
        },
        //选择卡
        patient_card:{
            chainId : "USER_LOGIN_AND_SELECT_HOSPITAL_AND_SELECT_CUSTOM_PATIENT_FILTER",
            returnView : "patient_card"
        },
        //完善实名信息
        account_authentication:{
            chainId : "USER_LOGIN_FILTER",
            returnView : "account_authentication"
        },
        //修改手机号
        change_phone:{
            chainId : "USER_LOGIN_FILTER",
            returnView : "change_phone"
        },
        //修改密码
        change_pwd:{
            chainId : "USER_LOGIN_FILTER",
            returnView : "change_pwd"
        },
        //余额提现登录拦截 By 杜巍巍 KYEEAPPC-4692
        apply_cash:{
            chainId : "USER_LOGIN_AND_SELECT_HOSPITAL_FILTER",
            returnView : "apply_cash"
        },
        //银行卡管理登录拦截 By 杜巍巍 KYEEAPPC-4692
        rebateBankAdd:{
            chainId : "USER_LOGIN_FILTER",
            returnView : "rebateBankAdd"
        },
        //总换抵用劵登录拦截 By 杜巍巍 KYEEAPPC-4692
        coupons:{
            chainId : "USER_LOGIN_FILTER",
            returnView : "coupons"
        },
        //跨院体检单 KYEEAPPC-5391
        my_medical:{
            chainId : "USER_LOGIN_FILTER",
            returnView : "my_medical"
        },
        //我的保险
        homeWebNoTitle : {
            chainId : "USER_LOGIN_AND_SELECT_CUSTOM_PATIENT_FILTER",
            returnView : "homeWebNoTitle"
        },
        //住院费用(就医记录入口) KYEEAPPC-6607
        "inpatient_general" : {
            chainId : "USER_LOGIN_AND_SELECT_CUSTOM_PATIENT_FILTER",
            returnView : "inpatient_general"
        },
        // 住院缴费 KYEEAPPC-9632
        "inpatient_payment_query" : {
            chainId : "USER_LOGIN_AND_SELECT_CUSTOM_PATIENT_FILTER",
            returnView : "inpatient_payment_query"
        },
        // 就诊者信息  KYEEAPPC-9632
        "comm_patient_detail" : {
            chainId : "USER_LOGIN_AND_SELECT_CUSTOM_PATIENT_FILTER",
            returnView : "comm_patient_detail"
        },
        //预约记录(就医记录入口) KYEEAPPC-6607
        "appointment_regist_list" : {
            chainId : "USER_LOGIN_AND_SELECT_CUSTOM_PATIENT_FILTER",
            returnView : "appointment_regist_list"
        },
        //医院报告单
        index_hosp : {
            chainId : "USER_LOGIN_AND_SELECT_CUSTOM_PATIENT_FILTER",
            returnView : "index_hosp"
        },
        //病友圈登录APP拦截、病友圈用户信息完善拦截
        "message->MAIN_TAB":{
            chainId : "USER_INFORMATION_USER_LOGIN_FILTER",
            returnView : "message->MAIN_TAB"
        },
        //一键呼救登录拦截、用户信息完善拦截、就诊者拦截
        "callAmbulance":{
            chainId :"USER_INFORMATION_USER_LOGIN_AND_SELECT_CUSTOM_PATIENT",
            returnView :"callAmbulance"
        },
        "rush_clinic_record_list_new":{
            chainId : "USER_LOGIN_AND_SELECT_CUSTOM_PATIENT_FILTER",
            returnView : "rush_clinic_record_list_new"
        },
        //一键理赔
        one_quick_claim : {
            chainId: "USER_LOGIN_AND_SELECT_HOSPITAL_AND_SELECT_CUSTOM_PATIENT_FILTER",
            returnView: "one_quick_claim"
        },
        //健康档案
        "my_health_archive":{
            chainId : "USER_LOGIN_AND_SELECT_CUSTOM_PATIENT_FILTER",
            returnView : "my_health_archive"
        },
        //亳州就医记录
        "sp_medical_record":{
            chainId : "USER_LOGIN_AND_SELECT_CUSTOM_PATIENT_FILTER",
            returnView : "sp_medical_record"
        },
        //预约挂号完成页
        appointment_result : {
            chainId : "USER_LOGIN_FILTER",
            returnView : "appointment_result"
        },
        //体检报告
        medical : {
            chainId: "USER_LOGIN_AND_SELECT_HOSPITAL_AND_SELECT_CUSTOM_PATIENT_FILTER",
            returnView: "medical"
        },
        //预约挂号详情
        appointment_regist_detil : {
            chainId : "USER_LOGIN_AND_SELECT_CUSTOM_PATIENT_FILTER",
            returnView : "appointment_regist_detil"
        },
        //抢号详情
        rush_clinic_detail : {
            chainId : "USER_LOGIN_AND_SELECT_CUSTOM_PATIENT_FILTER",
            returnView : "rush_clinic_detail"
        },
        //我的方便门诊记录
        my_convenience_clinic : {
            chainId : "USER_LOGIN_AND_SELECT_CUSTOM_PATIENT_FILTER",
            returnView : "my_convenience_clinic"
        },
        //住院满意度
        satisfaction_hospital_list : {
            chainId: "USER_LOGIN_AND_SELECT_HOSPITAL_AND_SELECT_CUSTOM_PATIENT_FILTER",
            returnView: "satisfaction_hospital_list"
        },
        medical_orders_reminder:{
            chainId : "USER_LOGIN_FILTER",
            returnView : "medical_record_reminder"
        },
        medical_record_reminder:{
            chainId : "USER_LOGIN_FILTER",
            returnView : "medical_record_reminder"
        },
        report_reminder:{
            chainId: "USER_LOGIN_FILTER",
            returnView: "report_reminder"
        },
        myquyi_inpatient_payment:{
            chainId: "USER_LOGIN_FILTER",
            returnView: "myquyi_inpatient_payment"
        },
        medication_push:{
            chainId: "USER_LOGIN_FILTER",
            returnView: "medication_push"
        },
        unified_push:{
            chainId: "USER_LOGIN_FILTER",
            returnView: "unified_push"
        },
        consultation_order: {
            chainId: "USER_LOGIN_AND_SELECT_CUSTOM_PATIENT_FILTER",
            returnView: "consultation_order"
        },
        //付费咨询拦截用户登录
        add_information: {
            chainId: "USER_INFORMATION_USER_LOGIN_AND_SELECT_CUSTOM_PATIENT",
            returnView: "add_information"
        },
        video_interrogation: {
            chainId: "USER_INFORMATION_USER_LOGIN_AND_SELECT_CUSTOM_PATIENT",
            returnView: "video_interrogation"
        },
        purchase_medince: {
            chainId: "USER_INFORMATION_USER_LOGIN_AND_SELECT_CUSTOM_PATIENT",
            returnView: "purchase_medince"
        },
        //我的会诊记录
        consulationnote: {
            chainId: 'USER_LOGIN_AND_SELECT_CUSTOM_PATIENT_FILTER',
            returnView: 'consult_doctor_list'
        },
        consult_order_detail: {
            chainId:'USER_LOGIN_FILTER',
            returnView:'consult_order_detail'
        },
        wait_chatting:{
            chainId:'USER_LOGIN_FILTER',
            returnView:'wait_chatting'
        },
        consult_pay:{
            chainId:'USER_LOGIN_FILTER',
            returnView:'consult_pay'
        },
        consult_satisfaction:{
            chainId:'USER_LOGIN_FILTER',
            returnView:'consult_satisfaction'
        },
        patient_card_records:{
            chainId:'USER_LOGIN_AND_SELECT_CUSTOM_PATIENT_FILTER',
            returnView:'patient_card_records'
        },
        video_interrogation:{
            chainId:'USER_LOGIN_AND_SELECT_CUSTOM_PATIENT_FILTER',
            returnView:'video_interrogation'
        },
        purchase_medince:{
            chainId:'USER_LOGIN_AND_SELECT_CUSTOM_PATIENT_FILTER',
            returnView:'purchase_medince'
        },
        healthCard:{
            chainId:'USER_LOGIN_AND_SELECT_CUSTOM_PATIENT_FILTER',
            returnView:'healthCard'
        },
         //个人健康管理
        health_manage:{
            chainId : 'USER_LOGIN_FILTER',
            returnView:'health_manage'
        },
        consult_doctor_list:{
            chainId : 'USER_LOGIN_FILTER',
            returnView:'consult_doctor_list'
        },
        consult_doctor_main:{
            chainId : 'USER_LOGIN_FILTER',
            returnView:'consult_doctor_main'
        },
        my_prescription:{
            chainId : "USER_LOGIN_FILTER",
            returnView : "my_prescription"
        }
    }
};