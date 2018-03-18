/*
 * 产品名称：quyiyuan
 * 创建人: 张家豪、付添
 * 创建日期:2015年9月25日10:18:09
 * 创建原因：医院-价格公示-药品价格
 */
new KyeeModule()
    .group("kyee.quyiyuan.price.medicaldetail.service")
    .require([
        "kyee.framework.service.message"
    ])
    .type("service")
    .name("PriceMedicalDetailService")
    .params([])
    .action(function () {
        var def = {};
        return def;
    })
    .build();
