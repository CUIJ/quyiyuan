/**
 * Created by liwenjuan on 2016/10/20.
 */

new KyeeModule()
    .group("kyee.quyiyuan.patients_group.patients_group_web.service")
    .require([])
    .type("service")
    .name("patientsGroupWebService")
    .params([])
    .action(function(){
        var def = {
            webUrl: ""
        };
        return def;
    })
    .build();
