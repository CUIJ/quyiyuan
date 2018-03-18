/*
 * 产品名称：quyiyuan
 * 创建人: 陈艳婷
 * 创建日期:2017年10月31日20:11:13
 * 创建原因：即时随访调用医院+和HCRM获取随访表单
 * 任务号：APP-274
 */
new KyeeModule()
    .group("kyee.quyiyuan.patients_group.questionnaire_search.service")
    .require([])
    .type("service")
    .name("QuestionnaireSearchService")
    .params([])
    .action(function () {
        var def = {
        };
        return def;
    })
    .build();