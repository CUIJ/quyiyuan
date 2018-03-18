/**
 * Created by YANGMIAO on 2015/4/28.
 */
var NEW_QUEUE_ROUTER_TABLE = {

    /*切换效果默认全屏，如果想在tab内显示，请保持 url 为如下格式：
     'xxxx->MAIN_TAB'
     */
    //叫号查询queue
    "new_queue" : {
        url: "/new_queue",
        views: {
            "main_view": {
                templateUrl:
                    "modules/business/newqueue/index.html",
                controller :
                    "NewQueueSelectDeptController"
            }
        }
    },
    "new_queue_dept_info" : {
        url: "/new_queue_dept_info",
            views: {
             "main_view": {
                 templateUrl:
                     "modules/business/newqueue/views/queue_dept_info.html",
                 controller :
                     "NewQueueDeptInfoController"
             }
        }
    },

    "new_queue_clinic":{
        url:"/new_queue_clinic",
        views:{
            "main_view":{
                templateUrl:"modules/business/newqueue/views/queue_clinic.html",
                controller:"NewQueueClinicController"
            }
        }
    }
    //叫号查询queue结束

};
