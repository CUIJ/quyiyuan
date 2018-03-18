/**
 * 产品名称：quyiyuan.
 * 创建用户：高玉楼
 * 日期：2015年10月28日10:43:59
 * 创建原因：疾病技术服务
 * 修改人：武帆
 * 修改任务：KYEEAPPC-7361
 * 修改原因：迁移前端涉及ms-guide上海组件到后端调用所需改动
 */
new KyeeModule()
    .group("kyee.quyiyuan.multiplequery.diseaseinfoquery.service")
    .require([])
    .type("service")
    .name("DiseaseInfoQueryService")
    .params(["HttpServiceBus", "CacheServiceBus", "KyeeEnv","KyeeMessageService"])
    .action(function(HttpServiceBus, CacheServiceBus, KyeeEnv, KyeeMessageService){

        var def = {
            diseaseName:undefined,
            diseaseId:undefined,
            depetData:[],
            /**
             * 查询疾病介绍
             * @param diseaseName 疾病名称
             * @param onSuccess 请求成功后的回调
             */
            getDiseaseInfo : function(onSuccess){

                HttpServiceBus.connect({
                    url: "triage/action/DiseaseGuideActionC.jspx",
                    params: {
                        op: "info",
                        diseaseName:def.diseaseName,
                        diseaseId:def.diseaseId,
                        requestSource:"0"//新接口表示

                    },
                    cache: {
                        by: "TIME",
                        value: 10 * 60
                    },
                    onSuccess: function (data) {
                        if (data.status&&data.status === 'SUCCESS') {
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
                                    content: "查询失败！",
                                    duration: 3000
                                });
                            }

                        }

                    },
                    onError: function () {

                    }
                });
            },
            /**
             * 查询疾病标准二级科室
             * @param diseaseName  疾病名称
             * @param onSuccess 请求成功后的回调
             */
            getDeptInfo:function(onSuccess){

                HttpServiceBus.connect({
                    url: "triage/action/DiseaseGuideActionC.jspx",
                    params: {
                        op: "deptInfo",
                        diseaseId:def.diseaseId
                    },
                    cache: {
                        by: "TIME",
                        value: 10 * 60
                    },
                    onSuccess: function (data) {
                        if (data.status&&data.status === 'SUCCESS') {
                            var juniorIds ='',juniorNames = '';
                            if(data.data.length)
                            {
                                for(var i=0;i<data.data.length;i++)
                                {
                                    juniorIds = data.data[i].juniorId+'|';
                                    juniorNames = data.data[i].juniorName+'|';
                                }
                                if(juniorIds.indexOf('|')!=-1)
                                {
                                    juniorIds = juniorIds.substring(0,juniorIds.length-1)
                                }
                                def.getDeparts(juniorIds,juniorNames,data,onSuccess);
                            }
                            else{
                                onSuccess(data);
                            }
                        }
                        else {
                            if(data.message){
                                KyeeMessageService.broadcast({
                                    content: data.message,
                                    duration: 3000
                                });
                            }else{
                                KyeeMessageService.broadcast({
                                    content: "查询失败！",
                                    duration: 3000
                                });
                            }

                        }

                    },
                    onError: function () {

                    }
                });
            },
            /**
             * 通过二级科室查询医院实际科室
             * @param juniorIds  二级科室id，多个用|隔开
             * @param diseaseName  疾病名称
             * @param onSuccess
             */
            getDeparts:function(juniorIds,juniorNames,deptData,onSuccess){
                HttpServiceBus.connect({
                    url: "triage/action/DiseaseGuideActionC.jspx",
                    params: {
                        op: "real",
                        provinceCode:'',
                        cityCode:'',
                        juniorCode: juniorIds,
                        //juniorCode:33,
                        juniorName:juniorNames,
                        diseaseName:def.diseaseName,
                        diseaseId:def.diseaseId
                        //diseaseId:4
                    },
                    cache: {
                        by: "TIME",
                        value: 10 * 60
                    },
                    onSuccess: function (data) {
                        if (data.status &&data.status === 'SUCCESS') {
                            onSuccess(deptData,data.data);
                        }
                        else {
                                if(data.message){
                                KyeeMessageService.broadcast({
                                    content: data.message,
                                    duration: 3000
                                });
                            }else{
                                KyeeMessageService.broadcast({
                                    content: "查询失败！",
                                    duration: 3000
                                });
                            }

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
