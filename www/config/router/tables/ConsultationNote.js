/**
 * Created by lizhihu on 2017/7/5.
 * 会诊记录
 */
var CONSULATION_NOTE_ROUTER_TABLE={
    //会诊记录
    "consulationnote" : {
        url: "/consulationnote",
        views: {
            "main_view": {
                templateUrl: "modules/business/consulationnote/index.html",
                controller: "ConsulationNoteController"
            }
        }
    },
    "consulationnotedetail" : {
        url: "/consulationnotedetail",
        views: {
            "main_view": {
                templateUrl: "modules/business/consulationnote/views/consulation_detail.html",
                controller: "ConsulationNoteDetailController"
            }
        }
    },
    "consulationnotereport" : {
        url: "/consulationnotereport",
        views: {
            "main_view": {
                templateUrl: "modules/business/consulationnote/views/consulation_report.html",
                controller: "ConsulationNoteReportController"
            }
        }
    },
    "uploadMaterial" : {
        url: "/uploadMaterial",
        views: {
            "main_view": {
                templateUrl: "modules/business/consulationnote/views/upload_material.html",
                controller: "UploadMaterialController"
            }
        }
    }


}