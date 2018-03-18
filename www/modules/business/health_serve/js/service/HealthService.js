/*
 * 产品名称：健康服务
 * 创建人: 王婉
 * 创建日期:2017年6月7日11:28:01
 * 创建原因：APP一期优化
 */
new KyeeModule()
    .group("kyee.quyiyuan.health.serve.service")
    .require([])
    .type("service")
    .name("HealthService")
    .params([])
    .action(function(){

        var def = {
            HEALTH_DETAIL_CODE:null,
            HEALTH_URL:null,
            nurseServiceNavControl:null
        };

        return def;
    })
    .build();


