new KyeeModule()
    .group("kyee.quyiyuan.consultation.view_full_text.service")
    .require([])
    .type("service")
    .name("ViewFullTextService")
    .params([])
    .action(function() {
        var def = {
            //ȫ������
            content:""
        };
        return def;
    })
    .build();
