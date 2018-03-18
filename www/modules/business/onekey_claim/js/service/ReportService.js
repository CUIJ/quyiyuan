/**
 * Created by 付添 on 2016/10/10.
 描述：门诊报告单处理页面
 */
/**
 * 产品名称：quyiyuan
 * 创建者：程铄闵
 * 创建时间：2016年10月8日10:34:08
 * 创建原因：门诊缴费凭证服务
 * 任务号：
 */
new KyeeModule()
    .group("kyee.quyiyuan.quick_report.service")
    .type("service")
    .name("QuickReportService")
    .params(["HttpServiceBus", "CacheServiceBus", "KyeeUtilsService","PatientCardService"])
    .action(function (HttpServiceBus, CacheServiceBus, KyeeUtilsService,PatientCardService) {
        var def = {
            storageCache: CacheServiceBus.getStorageCache(),
            selectReportNumbers:0,
            //请求报告单数据
            getReportData:function(REPORT_SOURCE,$scope,getData){
                var  hospitalId=null;
                if(this.storageCache.get('hospitalInfo') && this.storageCache.get('hospitalInfo').id){
                    hospitalId= this.storageCache.get('hospitalInfo').id;
                }
                HttpServiceBus.connect({
                    url : "report/action/ExamActionC.jspx",
                    params : {
                        op : "queryReportData",
                        HOSPITAL_ID:hospitalId,
                        IS_TAP_TAB: "HOS",
                        REPORT_SOURCE:REPORT_SOURCE
                    },
                    onSuccess : function(data) {
                        if (data != null) {
                            var resultData = "";
                            //数据获取成功
                            if (data.success) {
                                var data = data.data;
                                //校验检查检验单是否开通
                                if("0"==data.EXAM_STATUS&&"0"==data.LAB_STATUS){
                                    getData(false, "");
                                }else{
                                    //判断是否通过校验
                                    if(data.IS_CHECK_PASS=="1"){//通过信息校验
                                        if(data &&data.REPORT_INFO) {
                                            resultData = JSON.parse(data.REPORT_INFO);
                                            if (parseInt(resultData.total) > 0) {//数据不为空
                                                for(var i=0;i<resultData.rows.length;i++){ //时间格式处理
                                                    var reportTime = def.convertDate(resultData.rows[i].REPORT_DATE);
                                                    resultData.rows[i].formatREPORT_DATE = reportTime;
                                                }
                                                getData(true, resultData);
                                            } else {
                                                getData(false, "");
                                            }
                                        }
                                    }else{
                                        getData(false, "");
                                    }
                                }
                            }else{
                                getData(false, "");
                            }
                        }
                    },
                    onError:function(){}
                });
            },
            //日期格式转换
            convertDate : function(v){
                if(v){
                    var time = KyeeUtilsService.DateUtils.formatFromDate(v,'YYYY/MM/DD');
                    return time;
                }
            }
        };

        return def;
    })
    .
    build();