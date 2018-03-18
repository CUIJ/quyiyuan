var INTERACTION_TABLE = {

    //选择医生页面
    "interaction" : {
        url: "/interaction",
        views: {
            "main_view": {
                templateUrl: "modules/business/interaction/index.html",
                controller:"DoctorSelectController"
            }
        }
    },
    //咨询留言
    "doctorMessageBoard" : {
        url: "/doctorMessageBoard",
        views: {
            "main_view": {
                templateUrl: "modules/business/interaction/views/doctor_message_board.html",
                controller:"DoctorMessageBoardController"
            }
        }
    },
    //未读留言列表页面
    "patientUnreadMessage" : {
        url: "/patientUnreadMessage",
        views: {
            "main_view": {
                templateUrl: "modules/business/interaction/views/message_board/unread_message.html",
                controller:"UnreadMessageController"
            }
        }
    },
    //未读留言详情页面
    "patientUnreadMessageDetail" : {
        url: "/patientUnreadMessageDetail",
        views: {
            "main_view": {
                templateUrl: "modules/business/interaction/views/message_board/unread_message_detail.html",
                controller:"UnreadMessageDetailController"
            }
        }
    }
};