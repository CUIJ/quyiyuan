var DOCTOR_DATA = {

    //医生首页功能菜单列表数据
    homeMenuListData : {

        "ZLBR" : {
            name: "诊疗病人",
            description: "您可在此诊疗或查看您诊断过的病人记录",
            image_url: "resource/images/doctorRole/my_patient.png",
            href: "patientScreening",
            name_key:'doctorCenter->MAIN_TAB.name_ZLBR',
            description_key:'doctorCenter->MAIN_TAB.info_ZLBR'
        },
        "GZWD" : {
            name: "关注我的",
            description: "查看关注您的病人列表",
            image_url: "resource/images/doctorRole/care_me.png",
            href: "care_me",
            name_key:'doctorCenter->MAIN_TAB.name_GZWD',
            description_key:'doctorCenter->MAIN_TAB.info_GZWD'
        },
        "PJJL" : {
            name: "评价记录",
            description: "查看病人对您诊断的评价",
            image_url: "resource/images/doctorRole/suggest_record.png",
            href: "evaluation_record",
            name_key:'doctorCenter->MAIN_TAB.name_PJJL',
            description_key:'doctorCenter->MAIN_TAB.info_PJJL'
        }/*,
        "SCHEDULE" : {
            name: "近期排班",
            description: "查看最近医生排班情况",
            image_url: "resource/images/doctorRole/schedule.png",
            href: "appointment"
        }*/
    }
};