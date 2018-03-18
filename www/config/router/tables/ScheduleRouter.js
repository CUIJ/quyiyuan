/**
 * 产品名称：quyiyuan
 * 创建者：刘健
 * 创建时间： 2015/5/5
 * 创建原因：排班路由
 */
var SCHEDULE_ROUTER_TABLE={
    "schedule":{
        url:"/schedule",
        views:{
            "main_view":{
                templateUrl:"modules/business/schedule/index.html",
                controller:"ScheduleDeptController"
            }
        }
    },
    "schedule_bydoctor":{
        url:"/schedule_bydoctor",
        views : {
            "main_view":{
                templateUrl:"modules/business/schedule/views/schedule_bydoctor.html",
                controller:"ScheduleByDoctorController"
            }
        }
    }
};
