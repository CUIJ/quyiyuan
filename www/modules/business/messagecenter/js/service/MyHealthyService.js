/**
 * Created by Hr_ on 2017/9/18.
 */
new KyeeModule()
    .group("kyee.quyiyuan.messagecenter.my_healthy.service")
    .require([])
    .type("service")
    .name("MyHealthyService")
    .params(["HttpServiceBus"])
    .action(function (HttpServiceBus) {

        var def = {
            url: '',
            //页面标题
            title: '我的健康',
            buttoText:'',
            jumpRouter:'',
            getHtml : function(onSuccess){
                HttpServiceBus.connect({
                    url : "/config/action/ParamsystemActionC.jspx",
                    params : {
                        op: "querySysParams",
                        PARA_CODE:"MyHealthUrl"
                    },
                    onSuccess : function (resp) {
                        def.url = resp.data.MyHealthUrl;
                        onSuccess(resp);
                    }
                });
            }
        };

        return def;
    })
    .build();

