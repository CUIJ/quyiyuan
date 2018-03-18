/**
 * 产品名称：quyiyuan
 * 创建者：高玉楼
 * 创建时间：2015年5月6日15:26:37
 * 创建原因：辅症列表服务
 * 修改者：
 * 修改原因：对辅症列表请求加10分钟的缓存
 * 修改任务号:KYEEAPPC-4269
 * 修改人：武帆
 * 修改任务：KYEEAPPC-7361
 * 修改原因：迁移前端涉及ms-guide上海组件到后端调用所需改动
 */
new KyeeModule()
    .group("kyee.quyiyuan.auxiliarySymptomList.service")
    .type("service")
    .name("AuxiliarySymptomListService")
    .params([
        "HttpServiceBus",
        "CacheServiceBus",
        "KyeeMessageService",
        "KyeeI18nService"
    ])
    .action(function (HttpServiceBus,CacheServiceBus,KyeeMessageService,KyeeI18nService) {

        var def = {
            //发送请求
            loadData: function (mainId,mainName,originId,originName,currentSex,noSex,onSuccess) {
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
                //每次加载行数
                HttpServiceBus.connect({
                    //url: "second:api/ms-guide/v1/symptoms/secondary"
                    url: "triage/action/DiseaseGuideActionC.jspx",
                    params: {
                        op: "secondary",
                        role:sex,
                        mainId:mainId,
                        mainName:mainName,
                        originId:originId,
                        originName:originName
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
                                    content: KyeeI18nService.get("triage.queryFail","查询失败！"),
                                    duration: 3000
                                });
                            }

                        }

                    },
                    onError　: function(){

                    }
                })
            },
            //选中辅症Id
            auxiliarySymptomIdList : [],
            auxiliarySymptomNameList:[]
        };

        return def;
    })
    .build();