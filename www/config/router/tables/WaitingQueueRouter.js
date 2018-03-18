/**
 * Created by Αυ½¨ on 2016/4/21.
 */
var WAITING_QUEUE_TABLE = {
    "waiting_queue_dept" : {
        url: "/waiting_queue_dept",
        views: {
            "main_view": {
                templateUrl:
                    "modules/business/waiting_queue/views/queue_dept.html",
                controller :
                    "WaitingQueueDeptController"
            }
        }
    },
    "waiting_queue_clinic" : {
        url: "/waiting_queue_clinic",
        views: {
            "main_view": {
                templateUrl:
                    "modules/business/waiting_queue/views/queue_clinic.html",
                controller :
                    "WaitingQueueClinicController"
            }
        }
    }
};