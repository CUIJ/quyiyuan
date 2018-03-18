/*
 * 产品名称：quyiyuan
 * 创建人: 程铄闵
 * 创建日期:2016年6月24日14:17:30
 * 创建原因：2.2.40版住院费用（就医记录入口）控制
 * 任务号：KYEEAPPC-6607
 */
new KyeeModule()
    .group("kyee.quyiyuan.myWallet.inpatientGeneral.service")
    .type("service")
    .name("InpatientGeneralService")
    .params([
        "HttpServiceBus",
        "PatientCardService",
        "CacheServiceBus",
        "KyeeMessageService",
        "KyeeUtilsService",
        "KyeeI18nService"
    ])
    .action(function (HttpServiceBus,PatientCardService,CacheServiceBus,KyeeMessageService,KyeeUtilsService,KyeeI18nService) {
        var def = {
            afterDelete:false,//历史明细删除后回来
            changeHospitalId:undefined,//选择医院后的hospitalId
            queryData:undefined,//查询页数据
            generalData:undefined,//查询页数据
            nextStepFlag: false,//从下一步到inpatient_general
            fromDetail:false,//从明细返回页面
            lastChangeHospitalId:undefined,//旧医院Id(拷贝正在维护前选择的医院)

            //加载数据
            loadData: function (getData,hiddenLoading,queryObj) {

                //初始化医院
                var hospitalId;
                if(def.changeHospitalId){
                    hospitalId = def.changeHospitalId;
                }
                else{
                    var hospInfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                    hospitalId = hospInfo.id;
                }

                //初始化搜索值
                var invoiceNo = '';
                var inpatientNo = '';
                if(queryObj){
                    invoiceNo = queryObj.invoiceNo;
                    inpatientNo = queryObj.hospitalCode;
                }

                HttpServiceBus.connect({
                    url: "inHospitalPat/action/InHospitalPatientHistoryFeeActionC.jspx",
                    params: {
                        op: "queryHospitalFeeForTree",
                        hospitalID:hospitalId,
                        INVOICE_NO:invoiceNo,
                        INHOSPITAL_NO:inpatientNo
                    },
                    showLoading: !hiddenLoading,
                    onSuccess: function (data) {
                        if(data.success){
                            var rec = data.data;
                            var info = [];
                            //有数据
                            if(rec.total>0){
                                for(var i=0;i<rec.rows.length;i++){
                                    var payInfo = rec.rows[i].PAYMENT_INFO;
                                    if(payInfo){
                                        payInfo = JSON.parse(payInfo);
                                        for(var j=0;j<payInfo.length;j++){
                                            //历史明细
                                            var detail = payInfo[j].DETAIL_DATA;
                                            if(detail){
                                                payInfo[j].DETAIL_DATA = JSON.parse(detail);
                                            }
                                            payInfo[j] = def.convertDate(payInfo[j]);
                                            info.push(payInfo[j]);
                                        }
                                        //data.data.rows[i].PAYMENT_INFO = payInfo;
                                    }
                                }
                                data.data.rows = info;
                                def.generalData = data;
                                def.generalData.success = true;
                                getData(true,data);
                            }
                            else{
                                def.generalData = data;
                                def.generalData.success = false;
                                getData(false,data);
                            }
                        }
                        else{
                            def.generalData = data;
                            def.generalData.success = false;
                            getData(false,data);
                        }
                    }
                });
            },

            //转换日期为头部显示格式
            convertDate:function(payInfo){
                var date;
                if(payInfo.ARRAYINFO){
                    date = payInfo.INHOSPITAL_DATE;
                }
                if(payInfo.DETAIL_DATA){
                    date = payInfo.ADMISSION_DATE;
                }
                if(date){
                    payInfo.year = date.substr(0,4);
                    var m = KyeeI18nService.get("inpatient_paid_record.month","月");
                    payInfo.month = date.substr(5,5).replace('/',m);
                    //payInfo.month = date.substr(5,5).replace('/','月');
                    var cur = KyeeUtilsService.DateUtils.formatFromDate(new Date(),'YYYY/MM/DD');
                    var dateNew = KyeeUtilsService.DateUtils.formatFromDate(date,'YYYY/MM/DD');
                    payInfo.isCurrent = cur==dateNew;
                }
                return payInfo;
            },

            //跳转选择医院参数赋值
            setHospitalValue : function(){
                PatientCardService.fromOtherRoute = 'inpatient_general';
                var stgCache = CacheServiceBus.getStorageCache();
                var hospInfo = stgCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                PatientCardService.scopeAdd = {};
                PatientCardService.scopeAdd.area = {};
                PatientCardService.scopeAdd.area.PROVINCE_CODE = hospInfo.provinceCode;
                PatientCardService.scopeAdd.area.PROVINCE_NAME = hospInfo.provinceName;
                PatientCardService.scopeAdd.area.CITY_CODE = hospInfo.cityCode;
                PatientCardService.scopeAdd.area.CITY_NAME = hospInfo.cityName;
            },

            //选完医院页面跳转
            afterChangeHospital : function(getData){
                HttpServiceBus.connect({
                    url: "inHospitalPat/action/InHospitalPatientHistoryFeeActionC.jspx",
                    params: {
                        op: "getQueryInHospitalAndHistoryType",
                        hospitalID:def.changeHospitalId
                    },
                    onSuccess: function (data) {
                        if(data.success){
                            var rec = data.data;
                            if(rec.SHOW_INPUT_VIEW == 0){
                                def.queryData = rec;
                                getData('inpatient_general_query');
                            }
                            else{
                                getData('inpatient_general');
                            }
                        }
                        else{
                            KyeeMessageService.broadcast({
                                content: data.message
                            });
                        }
                    },
                    onError:function(data){
                        def.changeHospitalId = undefined;
                        PatientCardService.fromOtherRoute = 'inpatient_general';
                        //KYEEAPPTEST-3712 程铄闵
                        if(PatientCardService.oldHospitalInfoCopy){
                            def.changeHospitalId = def.lastChangeHospitalId;
                            CacheServiceBus.getStorageCache().set(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO, PatientCardService.oldHospitalInfoCopy);
                        }else{
                            CacheServiceBus.getStorageCache().set(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO, {
                                    id: "",
                                    name: "",
                                    address: "",
                                    provinceCode: "",
                                    provinceName: "",
                                    cityCode: "",
                                    cityName: "",
                                    level: "",
                                    mainPageFlag: ""}
                            )
                        }
                    }
                });
            }
        };
        return def;
    })
    .build();