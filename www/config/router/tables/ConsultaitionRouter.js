/**
 * 产品名称 quyiyuan.
 * 创建用户: 张毅
 * 日期: 2017/4/20
 * 创建原因：问诊模块路由
 */
var CONSULTATION_ROUTER_TABLE = {
    // 补充信息页面
    "add_information": {
        url: "/add_information",
        views: {
            "main_view": {
                templateUrl: "modules/business/consultation/views/add_information.html",
                controller: "AddInformationController"
            }
        }
    },
    "consult_pay": {
        url: "/consult_pay",
        views: {
            "main_view": {
                templateUrl: "modules/business/consultation/views/consult_pay.html",
                controller: "ConsultPayController"
            }
        }
    },
    // (支付成功后的)等待接诊页面
    "wait_chatting": {
        url: "/wait_chatting",
        views: {
            "main_view": {
                templateUrl: "modules/business/consultation/views/wait_chatting.html",
                controller: "WaitChattingController"
            }
        }
    },
    // 咨询条款
    "consult_contract": {
        url: "/consult_contract",
        views: {
            "main_view": {
                templateUrl: "modules/business/consultation/views/consult_contract.html",
                controller: "ConsultContractController"
            }
        }
    },
    // 问诊订单详情页面
    "consult_order_detail": {
        url: "/consult_order_detail",
        views: {
            "main_view": {
                templateUrl: "modules/business/consultation/views/consult_order_detail.html",
                controller: "ConsultOrderDetailController"
            }
        }
    },
    // 订单列表页面
    "consultation_order": {
        url: "/consultation_order",
        views: {
            "main_view": {
                templateUrl: "modules/business/consultation/views/consultation_order.html",
                controller: "ConsultationOrderController"
            }
        }
    },
    // 评价订单页面
    "consult_satisfaction": {
        url: "/consult_satisfaction",
        views: {
            "main_view": {
                templateUrl: "modules/business/consultation/views/consult_satisfaction.html",
                controller: "ConsultationSatisfactionController"
            }
        }
    },
    // 患者信息页面
    "consult_patient_disease_info":{
        url:"/consult_patient_disease_info",
        views:{
            "main_view":{
                templateUrl:"modules/business/consultation/views/consult_patient_disease_info.html",
                controller:"ConsultPatientDiseaseInfoController"
            }
        }
    },

    // 咨询医生 医生列表页
    "consult_doctor_list":{
        url:"/consult_doctor_list",
        views:{
            "main_view":{
                templateUrl: "modules/business/consultation/views/consult_doctor_list.html",
                controller: "ConsultDoctorListController"
            }
        }
    },
    // 咨询医生 医院医生列表主页
    "consult_doctor_main":{
        url:"/consult_doctor_main",
        views:{
            "main_view":{
                templateUrl: "modules/business/consultation/views/consult_doctor_main.html",
                controller: "ConsultDoctorMainController"
            }
        }
    },
    //名医历史动态
    "consult_famous_doctor":{
        url:"/consult_famous_doctor",
        views:{
            "main_view":{
                templateUrl: "modules/business/consultation/views/consult_famous_doctor.html",
                controller: "ConsultFamousDoctorController"
            }
        }
    },
    // 咨询医生 医生列表页搜索页 V2.4.70
    "consult_doctor_list_search":{
        url:"/consult_doctor_list_search",
        views:{
            "main_view":{
                templateUrl: "modules/business/consultation/views/consult_doctor_list_search.html",
                controller: "ConsultDoctorListController"
            }
        }
    },
    "view_full_text":{
        url:"/view_full_text",
        views:{
            "main_view":{
                templateUrl: "modules/business/consultation/views/view_full_text.html",
                controller: "ViewFullTextController"
            }
        }
    }
};
