/**
 * 产品名称：quyiyuan
 * 创建者：高玉楼
 * 创建时间：2015年6月26日17:11:58
 * 创建原因：起病列表服务
 * 修改原因：对起病列表请求加10分钟的缓存
 * 修改任务：KYEEAPPC-4269
 * 修改原因：
 * 修改人：武帆
 * 修改任务：KYEEAPPC-7361
 * 修改原因：迁移前端涉及ms-guide上海组件到后端调用所需改动
 */
new KyeeModule()
    .group("kyee.quyiyuan.onSetList.service")
    .type("service")
    .name("OnSetListService")
    .params([
        "HttpServiceBus",
        "CacheServiceBus",
        "KyeeMessageService",
        "KyeeI18nService"
    ])
    .action(function (HttpServiceBus,CacheServiceBus,KyeeMessageService,KyeeI18nService) {

        var def = {
            loadOnSetData:function(mainId,mainName,currentSex,noSex,onSuccess)
            {
                var sex = '';
                if(!noSex){
                    if(currentSex=='1'){
                        sex = 'm';
                    }else if(currentSex=='2'){
                        sex = 'w';
                    }else{
                        sex = 'c'
                    }
                }
                HttpServiceBus.connect({
                    url : "triage/action/DiseaseGuideActionC.jspx",
                    params : {
                        op:"origin",
                        role:sex,
                        mainId:mainId,
                        mainName:mainName
                    },
                    cache: {
                        by: "TIME",
                        value: 10 * 60
                    },
                    onSuccess : function(data){
                        if(data.status&&data.status==='SUCCESS')
                        {
                            onSuccess(data.data);
                        }
                        else {
                            if(data.message){
                                KyeeMessageService.broadcast({
                                    content: data.message,
                                    duration: 3000
                                });
                            }else{
                                KyeeMessageService.broadcast({
                                    content:KyeeI18nService.get("triage.queryFail","查询失败！"),
                                    duration: 3000
                                });
                            }

                        }

                    },
                    onError　: function(){

                    }
                })
            }
        };

        return def;
    })
    .build();