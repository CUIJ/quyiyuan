/**
 * 产品名称：quyiyuan
 * 创建者：章剑飞
 * 创建时间：2015年5月6日15:25:50
 * 创建原因：诊断结果服务
 * 修改者：
 * 修改原因：对诊断结果请求加10分钟的缓存
 * 修改任务：KYEEAPPC-4269
 * 修改人：武帆
 * 修改任务：KYEEAPPC-7361
 * 修改原因：迁移前端涉及ms-guide上海组件到后端调用所需改动
 */
new KyeeModule()
    .group("kyee.quyiyuan.DiagnosticResult.service")
    .type("service")
    .name("DiagnosticResultService")
    .params([
        "HttpServiceBus",
        "CacheServiceBus",
        "KyeeMessageService",
        "BodySymptomListService",
        "OnSetListService",
        "AuxiliarySymptomListService",
        "TriagePicService",
        "KyeeI18nService"
    ])
    .action(function (HttpServiceBus,CacheServiceBus,KyeeMessageService,BodySymptomListService,OnSetListService,AuxiliarySymptomListService,TriagePicService,KyeeI18nService) {
        var def = {
            disease:{},
            seniorIds:[],
            //发送查询疾病请求
            loadResultData: function (onSuccess) {
                var symptomIds = "";
                //拼装辅症ID
                for(var i=0; i<AuxiliarySymptomListService.auxiliarySymptomIdList.length;i++){
                    if(i==AuxiliarySymptomListService.auxiliarySymptomIdList.length-1){
                        symptomIds = symptomIds + AuxiliarySymptomListService.auxiliarySymptomIdList[i];
                    }else{
                        symptomIds = symptomIds + AuxiliarySymptomListService.auxiliarySymptomIdList[i]+'|';
                    }
                }
                var sex = '';
                if(! TriagePicService.noSex){
                    if(TriagePicService.currentSex=='1'){
                        sex = 'm';
                    }else if(TriagePicService.currentSex=='2'){
                        sex = 'w';
                    }else{
                        sex = 'c'
                    }
                }
                HttpServiceBus.connect({
                    url : "triage/action/DiseaseGuideActionC.jspx",
                    params: {
                        op: "disease",
                        role:sex,
                        mainId:BodySymptomListService.mainId,
                        mainName:BodySymptomListService.mainName,
                        originId:OnSetListService.originId,
                        originName:OnSetListService.originName,
                        secondaryId:symptomIds
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
            //发送查询疾病详情请求
            loadDiseaseInfo: function (diseaseId,diseaseName,onSuccess) {
                var sex = '';
                if(! TriagePicService.noSex){
                    if(TriagePicService.currentSex=='1'){
                        sex = 'm';
                    }else if(TriagePicService.currentSex=='2'){
                        sex = 'w';
                    }else{
                        sex = 'c'
                    }
                }
                HttpServiceBus.connect({
                    url: "triage/action/DiseaseGuideActionC.jspx",
                    params: {
                        op: "info",
                        diseaseId:diseaseId,
                        diseaseName:diseaseName,
                        role:sex,
                        requestSource:"0"
                    },
                    cache: {
                        by: "TIME",
                        value: 10 * 60
                    },
                    onSuccess : function(data){
                        if(data.status&&data.status==='SUCCESS')
                        {
                            onSuccess(data);
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
            //查询推荐医生
            getTopDoctor:function(seniorDeptCodes,onSuccess){
                HttpServiceBus.connect({
                    url: "third:pay_consult/getConsultDoctorsBySeniorIds",
                    params: {
                        seniorDeptCodes: seniorDeptCodes
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            onSuccess(data.data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 3000
                            });
                        }
                    },
                    onError:function(data){
                        KyeeMessageService.broadcast({
                            content: data.message,
                            duration: 3000
                        });
                    }
                });
            },
            //查询疾病对应科室
            /*loadDeptInfo: function (diseaseId,onSuccess) {
                HttpServiceBus.connect({
                    url: "triage/action/DiseaseGuideActionC.jspx",
                    params: {
                        op: "deptInfo",
                        diseaseId:diseaseId
                    },
                    cache: {
                        by: "TIME",
                        value: 10 * 60
                    },
                    onSuccess : function(data){
                        if(data.status==='SUCCESS')
                        {
                            onSuccess(data);
                        }
                        else
                        {
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 3000
                            });
                        }
                    },
                    onError　: function(){

                    }
                })
            }, */

            //选中科室Id
            deptId : '',
            //选中科室名
            deptName : ''
        };

        return def;
    })
    .build();