/*
 * 产品名称：quyiyuan
 * 创建人: 程铄闵
 * 创建日期:2015年10月14日16:08:26
 * 创建原因：住院已结算服务
 * 任务号：KYEEAPPC-3523
 * 修改者：程铄闵
 * 修改时间：2015年12月13日21:27:16
 * 修改原因：住院费用优化（2.1.10）
 * 任务号：KYEEAPPC-4453
 * 修改者：程铄闵
 * 修改时间：2016年6月17日10:22:51
 * 修改原因：2.2.40版住院已结算（医院首页入口）
 * 任务号：KYEEAPPC-6605
 */
new KyeeModule()
    .group("kyee.quyiyuan.myWallet.inpatientPaid.service")
    .type("service")
    .name("InpatientPaidService")
    .params([
        "HttpServiceBus",
        "KyeeMessageService",
        "CacheServiceBus",
        "KyeeUtilsService",
        "KyeeI18nService"
    ])
    .action(function (HttpServiceBus,KyeeMessageService,CacheServiceBus,KyeeUtilsService,KyeeI18nService) {
        var def = {
            authFlag:false,//是否重实名认证跳转来 程铄闵 KYEEAPPC-4806（废弃）
            isModifyMode:undefined,//是否是从修改查询条件处跳转来（1--是）
            afterDelete:false,//明细删除后返回
            fromMyquyiRecord:false,//从就医记录底部记录进入单历史
            myquyiHospitalId:undefined,//从就医记录底部进入单历史的hospitalId

            //加载住院历史记录数据
            loadRecordData: function (getData,queryObj,hiddenLoading,isDo) {

                var invoiceNo = '';//发票号
                var inpatientNo = '';//住院号
                var hospitalId = CacheServiceBus.getStorageCache().get("hospitalInfo").id;//当前医院id

                //从就医记录底部记录进入
                if(def.fromMyquyiRecord){
                    hospitalId = def.myquyiHospitalId;
                    def.fromMyquyiRecord = false;
                    def.myquyiHospitalId = undefined;
                }

                //住院号或发票号方式
                if(queryObj){
                    invoiceNo = queryObj.invoiceNo;
                    inpatientNo = queryObj.hospitalCode;
                }

                HttpServiceBus.connect({
                    url: "inHospitalPat/action/InHospitalPatientHistoryFeeActionC.jspx",
                    params: {
                        op: "queryInHospitalPatientHistoryFeeNew",//新的
                        CHANGE_QUERY:def.isModifyMode,
                        INVOICE_NO:invoiceNo,
                        INHOSPITAL_NO:inpatientNo,
                        hospitalID:hospitalId
                    },
                    showLoading: !hiddenLoading, //程铄闵 KYEEAPPC-4560 下拉刷新
                    onSuccess: function (data) {
                        if(data.success){
                            var data = data.data;
                            data.success = true;
                            var info = [];
                            //有数据
                            if(data.TOTAL>0){
                                for(var i=0;i<data.INFO.length;i++){
                                    var payInfo = data.INFO[i].PAYMENT_INFO;
                                    if(payInfo){
                                        payInfo = JSON.parse(payInfo);
                                        for(var j=0;j<payInfo.length;j++){
                                            var detail = payInfo[j].DETAIL_DATA;
                                            if(detail){
                                                payInfo[j].DETAIL_DATA = JSON.parse(detail);
                                            }
                                            payInfo[j] = def.convertDate(payInfo[j]);
                                            info.push(payInfo[j]);
                                        }
                                    }
                                }
                                data.INFO = info;
                            }
                            def.paidData = data;
                            getData(true);
                        }
                        else{
                            data.success = false;
                            def.emptyText = data.message;
                            getData(true);
                        }
                    }
                })
            },
            //转换日期为头部显示格式
            convertDate:function(payInfo){
                var date = payInfo.ADMISSION_DATE;
                payInfo.year = date.substr(0,4);
                var m = KyeeI18nService.get("inpatient_paid_record.month","月");
                payInfo.month = date.substr(5,5).replace('/',m);
                var cur = KyeeUtilsService.DateUtils.formatFromDate(new Date(),'YYYY/MM/DD');
                var dateNew = KyeeUtilsService.DateUtils.formatFromDate(date,'YYYY/MM/DD');
                payInfo.isCurrent = cur==dateNew;
                return payInfo;
            },
            //住院已结算滑动删除 by 杜巍巍
            delInpatientPaidRecord: function (getData,C_INPM_ID) {
                HttpServiceBus.connect({
                    url: "inHospitalPat/action/InHospitalPatientHistoryFeeActionC.jspx",
                    params: {
                        UNION_ID:C_INPM_ID,
                        op: "hiddenInHospitalHistoryByPrimaryKey"
                    },
                    onSuccess: function (data) {
                        getData(data);
                    }
                })
            }
        };
        return def;
    })
    .build();