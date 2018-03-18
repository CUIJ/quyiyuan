/**
 * 产品名称 quyiyuan.
 * 创建用户: 淳思博
 * 日期: 2015/5/27.
 * 创建原因：亳州新农合路由
 * 修改： By
 * 修改： By
 */
var NCMS_ROUTER_TABLE = {
    //新农合主页
    "ncms" : {
        url: "/ncms",
        views: {
            "main_view": {
                templateUrl: "modules/business/ncms/index.html",
                controller:"NcmsMainController"
            },
            "ncms_view@ncms": {
                templateUrl: "modules/business/ncms/views/my_family.html",
                controller:"MyFamilyController"
            }
        }
    },
    //我的家庭
    "ncms.famialy" : {
        url: "/famialy",
        views: {
            "ncms_view@ncms": {
                templateUrl: "modules/business/ncms/views/my_family.html",
                controller:"MyFamilyController"
            }
        }
    },
    //家庭成员
    "ncms.famialy_member" : {
        url: "/famialyMember",
        views: {
            "ncms_view@ncms": {
                templateUrl: "modules/business/ncms/views/family_members.html",
                controller:"FamilyMembersController"
            }
        }
    },
    //缴费记录
    "ncms.payment_record" : {
        url: "/payment_record",
        views: {
            "ncms_view@ncms": {
                templateUrl: "modules/business/ncms/views/payment_record.html",
                controller:"PaymentRecordController"
            }
        }
    },
    //门诊报销
    "ncms.out_reim" : {
        url: "/outReim",
        views: {
            "ncms_view@ncms": {
                templateUrl: "modules/business/ncms/views/out_reim.html",
                controller:"OutReimController"
            }
        }
    },
    //住院报销
    "ncms.hosp_reimbursement" : {
        url: "/hospReimbursement",
        views: {
            "ncms_view@ncms": {
                templateUrl: "modules/business/ncms/views/hospitalization_reimbursement.html",
                controller:"HospitalizationReimbursementController"
            }
        }
    }
};