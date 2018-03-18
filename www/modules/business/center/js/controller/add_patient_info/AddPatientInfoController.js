/*
 * 产品名称：quyiyuan
 * 创建人: 张家豪
 * 创建日期:2015年5月4日10:18:09
 * 创建原因：附加就诊者控制
 */
new KyeeModule()
    .group("kyee.quyiyuan.center.controller.add_patient_info")
    .require(["kyee.quyiyuan.center.service",
        "kyee.framework.service.message",
        "kyee.framework.service.view",
        "kyee.quyiyuan.center.add_patient_info.service",
        "kyee.quyiyuan.center.controller.add_custom_patient",
        "kyee.quyiyuan.center.controller.comm_patient_detail",
        "kyee.quyiyuan.center.add_patient_info.service",
        "kyee.quyiyuan.center.comm_patient_detail.service"])
    .type("controller")
    .name("AddPatientInfoController")
    .params([])
        .action(function(){
        })
    .build();