/*
 * 产品名称：quyiyuan
 * 创建人: 程铄闵
 * 创建日期:2016年6月20日19:13:43
 * 创建原因：住院每日清单详情服务
 * 任务号：KYEEAPPC-6603
 */
new KyeeModule()
    .group("kyee.quyiyuan.myWallet.inpatientPaymentDetail.service")
    .type("service")
    .name("InpatientPaymentDetailService")
    .params([
        "HttpServiceBus","KyeeMessageService", "KyeeI18nService","CacheServiceBus","PerpaidService"
    ])
    .action(function (HttpServiceBus,KyeeMessageService,KyeeI18nService,CacheServiceBus,PerpaidService) {
        var def = {
            detailItem:{},//选中记录的内容

            //加载每日清单明细数据
            loadData: function (getData) {
                var obj = def.detailItem;
                HttpServiceBus.connect({
                    url: "inHospitalPat/action/InHosPatientFeeActionC.jspx",
                    params: {
                        op: "queryInHospitalDetail",
                        VISIT_ID:obj.VISIT_ID,
                        BILLING_DATE_TIME:obj.BILLING_DATE_TIME,
                        PATIENT_ID:obj.PATIENT_ID,
                        INP_NO:obj.INP_NO,
                        hospitalID:obj.HOSPITAL_ID
                    },
                    onSuccess: function (data) {
                        //数据获取成功
                        if (data.success) {
                            var rows = data.data.rows;
                            rows  = def.getClassData(rows);
                            rows.SHOULD_PAY_FEE = obj.SHOULD_PAY_FEE;
                            rows.BILLING_DATE_TIME = obj.BILLING_DATE_TIME;
                            rows.REAL_PAY_FEE = obj.REAL_PAY_FEE;
                            getData(true,rows);
                        }
                        //数据获取失败
                        else {
                            getData(false,data.message);
                        }
                    },
                    onError:function(msg){
                    }
                })
            },

            //处理加载明细记录数据格式
            getClassData:function(detail){
                var isGroup = false;//是否分类的标记，默认不分组
                var newData = {};
                //def.isGroup = false;//是否分类的标记，默认不分组
                //var detail = data.DATE_DATA;
                //判断是否有分类
                for (var j = 0; j < detail.length; j++) {
                    if(detail[j].ITEM_CLASS!=undefined){
                        isGroup = true;//分组
                        //def.isGroup = true;//分组
                        break;
                    }
                }
                //如果item_class 有值则明细进行分组
                if(isGroup){
                    var detailObj = [];//分组后的json数据
                    var index = 0;//分组后数组detailObj下标
                    var arr = [];//已匹配过的item
                    for (var m = 0; m<detail.length; m++) {
                        if(!detail[m].ITEM_CLASS){
                            detail[m].ITEM_CLASS = KyeeI18nService.get("inpatient_payment_detail.other","另外");
                        }
                        var itemClass = detail[m].ITEM_CLASS;//不需处理空格
                        var isExist = false;//是否已分组标记，默认未分组
                        var group = [];
                        var sum = 0;//金额小计
                        //判断当前值是否已分组
                        for(var k=0; k<arr.length; k++) {
                            if (arr[k] == detail[m].ITEM_CLASS) {
                                isExist = true;//已分组
                                break;
                            }
                        }
                        //未分组的处理
                        if(!isExist){
                            detailObj[index] = {
                                ITEM_CLASS:itemClass,
                                GROUP_DATA:new Object(),
                                SUM:sum
                            };
                            for(var n = m; n<detail.length; n++){
                                if(itemClass.indexOf(detail[n].ITEM_CLASS)>-1){
                                    group.push(detail[n]);
                                    if(detail[n].SHOULD_PAY_FEE){
                                        sum = sum + parseFloat(detail[n].SHOULD_PAY_FEE);//KYEEAPPC-5226 程铄闵
                                    }
                                }
                            }
                            arr.push(itemClass);
                            detailObj[index].GROUP_DATA=group;
                            detailObj[index].SUM=sum;
                            index++;
                        }
                    }
                    newData.DATA = detailObj;
                    newData.isGroup = true;
                }
                else{
                    newData.DATA = detail;
                    newData.isGroup = false;
                }
                return newData;
            }
        };
        return def;
    })
    .build();