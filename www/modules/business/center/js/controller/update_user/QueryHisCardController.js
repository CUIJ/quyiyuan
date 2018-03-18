/**
 * Created by Administrator on 2015/4/26.
 */
new KyeeModule()
    .group("kyee.quyiyuan.center.controller.query_his_card")
    .require(["kyee.quyiyuan.center.service",
        "kyee.framework.service.message",
        "kyee.quyiyuan.center.service.QueryHisCardService",
        "kyee.quyiyuan.center.updateuser.service",
        "kyee.quyiyuan.center.comm_patient_detail.service",
        "kyee.quyiyuan.report.service",
        "kyee.quyiyuan.check.service",
        "kyee.quyiyuan.appoint.appoint_appointConfirm.service",
        "kyee.quyiyuan.regist.regist_registConfirm.service",
        "kyee.quyiyuan.home.service",
        "kyee.quyiyuan.frequent_info.patient_card_add.controller"
    ])
    .type("controller")
    .name("QueryHisCardController")
    .params([])
    .action(function(){

    })
    .build();