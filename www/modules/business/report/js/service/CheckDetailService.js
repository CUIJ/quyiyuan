/*
 * 产品名称：quyiyuan
 * 创建人: 程铄闵
 * 创建日期:2015/7/13
 * 创建原因：检查单详情控制
 * 任务号：KYEEAPPC-2640
 */
new KyeeModule()
    .group("kyee.quyiyuan.checkDetail.service")
    .require([])
    .type("service")
    .name("CheckDetailService")
    .params(["HttpServiceBus"])
    .action(function(HttpServiceBus){
        var def = {
            //初始化图片信息
            loadData:function(detailData,getData){
                HttpServiceBus.connect({
                    url : "report/action/ExamActionC.jspx",
                    params : {
                        op : "queryExamPicture",
                        EXAM_DATE_TIME:detailData.EXAM_DATE_TIME,
                        EXAM_CLASS:detailData.EXAM_CLASS,
                        EXAM_SUB_CLASS: detailData.EXAM_SUB_CLASS,
                        EXAM_PICTURE_SOURCE:detailData.EXAM_SOURCE, //0:表示门诊 1：表示住院
                        PATIENT_ID:detailData.PATIENT_ID
                    },
                    onSuccess : function(data){
                         if(data.success){
                            getData(data,true);
                         }
                         else{
                            getData(data,false);
                         }
                    },
                    onError: function () {
                        getData("",false);
                    }
                });
            }

        };
        return def;
    })
    .build();