/**
 * Created by YANGMIAO on 2015/4/28.
 */
var QUEUE_ROUTER_TABLE = {

    /*切换效果默认全屏，如果想在tab内显示，请保持 url 为如下格式：
     'xxxx->MAIN_TAB'
     */
    //叫号查询queue
    "queue" : {
        url: "/queue",
        views: {
            "main_view": {
                templateUrl:
                    "modules/business/queue/index.html",
                controller :
                    "QueueSelectDeptController"
            }
        }
    },
    "queue_dept_info" : {
        url: "/queue_dept_info",
            views: {
             "main_view": {
                 templateUrl:
                     "modules/business/queue/views/queue_dept_info.html",
                 controller :
                     "QueueDeptInfoController"
             }
        }
    },

    "queue_clinic":{
        url:"/queue_clinic",
        views:{
            "main_view":{
                templateUrl:"modules/business/queue/views/queue_clinic.html",
                controller:"QueueClinicController"
            }
        }
    }
    //叫号查询queue结束

};
