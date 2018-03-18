/**
 * 产品名称：quyiyuan
 * 创建者：高玉楼
 * 创建时间：2015年6月26日17:11:58
 * 创建原因：列表导诊和小部位主症服务
 * 修改者：
 * 修改原因：对列表导诊请求加10分钟的缓存
 * 修改任务：KYEEAPPC-4269
 * 修改人：武帆
 * 修改任务：KYEEAPPC-7361
 * 修改原因：迁移前端涉及ms-guide上海组件到后端调用所需改动
 */
new KyeeModule()
    .group("kyee.quyiyuan.bodySymptomList.service")
    .type("service")
    .name("BodySymptomListService")
    .params([
        "HttpServiceBus",
        "CacheServiceBus",
        "KyeeMessageService"
    ])
    .action(function (HttpServiceBus, CacheServiceBus, KyeeMessageService) {

        var def = {
            //根据大部位查找小部位
            loadPartData: function (bodyId, currentSex, onSuccess) {
                var sex = '';
                if (currentSex == '1') {
                    sex = 'm';
                } else if (currentSex == '2') {
                    sex = 'w';
                } else {
                    sex = 'c'
                }
                HttpServiceBus.connect({
                    url: "triage/action/DiseaseGuideActionC.jspx",
                    params: {
                        op: "bodyAndMain",
                        role: sex,
                        mainPartId: bodyId
                    },
                    cache: {
                        by: "TIME",
                        value: 10 * 60
                    },
                    onSuccess: function (data) {
                        if (data.status&&data.status === 'SUCCESS') {
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
                    onError: function () {

                    }
                });
            },
            //查找所有小部位
            loadAllPartData: function (noSex, currentSex, onSuccess) {
                var sex = '';
                if (!noSex) {
                    if(currentSex=='1'){
                        sex = 'm';
                    }else if(currentSex=='2'){
                        sex = 'w';
                    }else{
                        sex = 'c'
                    }
                }
                HttpServiceBus.connect({
                    url: "triage/action/DiseaseGuideActionC.jspx",
                    params: {
                        op: "bodyAndMain",
                        role: sex
                    },
                    cache: {
                        by: "TIME",
                        value: 10 * 60
                    },
                    onSuccess: function (data) {
                        if (data.status&&data.status === 'SUCCESS') {
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
                    onError: function () {

                    }
                });
            },
            //根据部位查找症状
            loadSymptomData: function (partId, currentSex, onSuccess) {
                HttpServiceBus.connect({
                    url: "",
                    params: {
                        op: "initBodyPosition",
                        role: currentSex == '1' ? 'm' : 'w',
                        bodyPart: partId
                    },
                    cache: {
                        by: "TIME",
                        value: 10 * 60
                    },
                    onSuccess: function (data) {
                        if (data.status === 'SUCCESS') {
                            onSuccess(data.data);
                        }
                        else {
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 3000
                            });
                        }

                    },
                    onError: function () {

                    }
                });
            }
        };

        return def;
    })
    .build();