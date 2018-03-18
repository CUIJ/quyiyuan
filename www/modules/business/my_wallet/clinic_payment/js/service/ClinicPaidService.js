/**
 * 产品名称：quyiyuan
 * 创建者：章剑飞
 * 创建时间：2015年9月13日21:42:35
 * 创建原因：已缴费用服务层
 * 任务号：KYEEAPPC-3276
 * 修改者：程铄闵
 * 修改时间：2015年9月26日16:43:08
 * 修改原因：2.0.70版本需求修改
 * 任务号：KYEEAPPC-3468
 * 修改者：程铄闵
 * 修改时间：2015年12月13日21:10:53
 * 修改原因：门诊费用增加切换医院的功能（2.1.10）
 * 任务号：KYEEAPPC-4451
 * 修改者：张婧
 * 修改时间：2016年5月23日14:37:55
 * 修改原因：2.2.20门诊费用查询展示优化(APK)
 * 任务号：KYEEAPPC-5848
 */
new KyeeModule()
    .group("kyee.quyiyuan.myWallet.clinicPaid.service")
    .type("service")
    .name("ClinicPaidService")
    .params(["HttpServiceBus", "CacheServiceBus", "KyeeMessageService","PatientCardService"])
    .action(function (HttpServiceBus, CacheServiceBus, KyeeMessageService,PatientCardService) {
        var def = {
            memoryCache: CacheServiceBus.getMemoryCache(),
            storageCache: CacheServiceBus.getStorageCache(),
            configTips:undefined,//查询页默认提示语
            authFlag:false,//是否重实名认证跳转来 程铄闵 KYEEAPPC-4806
            fromMedicalGuide:false,//是否跨院 false-非跨院
            fromMsgHospitalId:undefined,//小铃铛所选医院
            fromMsgHospitalName:undefined,//小铃铛所选医院名
            hospitalIdTree:undefined,//有值-就医记录直接跳转的
            hospitalIdTreeName:undefined,//有值-就医记录直接跳转的
            sortRule:1,//排序方式 1-按时间；2-按医院
            paidInfoSelected:undefined,//所选的已缴费数据
            popupHospitalId:undefined,//医院选择弹出框选中的医院id KYEEAPPC-6170 程铄闵
            recordBack:false,//是否从详情页面返回标记 true-不刷新历史缴费界面

            paymentPayhisParms : {
                QUERY_PAY_TYPE:undefined,////QUERY_PAY_TYPE: 1:就诊卡；2：就诊卡+姓名；3：身份证+姓名；4：手机号+姓名; 5:查询方式选择了1和2，但是仅支持虚拟卡
                PAYMENT_FLAG:undefined,
                PAYMENT_PAYHIS_FLAG:undefined,
                PAY_SUBMIT_FLAG:undefined
            },//门诊已缴费参数（权限和查询方式）//PAYMENT_FLAG：门诊待缴费；PAYMENT_PAYHIS_FLAG：门诊已缴费；PAY_SUBMIT_FLAG：门诊缴费
            cardInfo: [],//卡列表
            //获取已缴费数据
            loadData: function (sortRule,fromHospitalView,getData, showLoading) {
                var patientId;
                var cardNo;
                var storageCache = CacheServiceBus.getStorageCache();
                var hospitalInfo = storageCache.get("hospitalInfo");//当前医院信息
                var hospitalId = undefined;//默认医院id
                var hospitalIdTree = undefined;//获取此医院数据（非跨院）
                var PHONE_NUMBER;
                if(hospitalInfo){
                    hospitalId = hospitalInfo.id;
                }
                if(def.PHONE_NUMBER){
                    PHONE_NUMBER = def.PHONE_NUMBER;
                    def.PHONE_NUMBER = undefined;
                }
                //门诊已缴费查询方式
                if(def.paymentPayhisParms && def.paymentPayhisParms.QUERY_PAY_TYPE){
                    var QUERY_PAY_TYPE = def.paymentPayhisParms.QUERY_PAY_TYPE;
                }
                //门诊已缴费和门诊缴费
                if(def.paymentPayhisParms && def.paymentPayhisParms.PAYMENT_PAYHIS_FLAG &&
                    def.paymentPayhisParms.PAY_SUBMIT_FLAG){
                    var PAYMENT_PAYHIS_FLAG= def.paymentPayhisParms.PAYMENT_PAYHIS_FLAG;
                    var PAY_SUBMIT_FLAG = def.paymentPayhisParms.PAY_SUBMIT_FLAG;
                }
                //输就诊卡号的操作
                if(def.queryObj){
                    patientId = def.queryObj.patientId;
                    cardNo = def.queryObj.cardNo;
                    if(def.hospitalId){
                        hospitalId = def.hospitalId;
                        def.hospitalId = undefined;
                    }
                    var obj = {
                        patientId:patientId,
                        hospitalId:hospitalId,
                        cardNo:cardNo
                    };
                    //存就诊卡号到缓存
                    var storageCache = CacheServiceBus.getStorageCache();
                    storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.CLINIC_PAYMENT_INFO,obj);
                    def.queryObj = undefined;
                }
                else{
                    cardNo = undefined;
                    patientId = undefined;
                    //选完医院后的传新医院
                    if(def.hospitalId){
                        hospitalId = def.hospitalId;
                        def.hospitalId = undefined;
                    }
                    //若有就诊卡号缓存，则取缓存传数据
                    var info = storageCache.get('clinicPaymentInfo');
                    if(info!=undefined&&info.patientId!=undefined&&info.hospitalId==hospitalId&&info.cardNo!=undefined){
                        patientId = info.patientId;
                        cardNo = info.cardNo;
                    }
                }
                //非跨院判断hospitalIdTree值
                if(!def.fromMedicalGuide){
                    if(def.hospitalIdTree){
                        hospitalIdTree = def.hospitalIdTree;//获取就医记录选中医院的非跨院数据（就医记录->已缴费）
                    }
                    else if(def.fromMsgHospitalId){
                        hospitalIdTree = def.fromMsgHospitalId;//获取小铃铛待缴费选中医院的非跨院数据（小铃铛待缴费->已缴费）
                    }
                    else{
                        hospitalIdTree = hospitalId;//获取默认医院非跨院数据（我的/医院）
                    }
                }
                else{
                    //弹出框选医院后赋值（若从医院选择弹出框选择医院后和选后下拉刷新请求单家医院记录） KYEEAPPC-6170 程铄闵
                    if(def.popupHospitalId){
                        hospitalIdTree = def.popupHospitalId;
                    }
                    else{
                        hospitalIdTree = def.hospitalIdTree;
                    }
                }
                HttpServiceBus.connect({
                    url: "payment/action/PaymentActionC.jspx",
                    showLoading: showLoading,
                    params: {
                        op: "getPayHis",
                        hospitalID:hospitalId,
                        HOSPITALID_TREE:hospitalIdTree,
                        INPUT_PATIENT_ID:patientId,
                        CARD_NO:cardNo,
                        SORT_RULE:sortRule,
                        USER_VS_ID: this.memoryCache.get('currentCustomPatient').USER_VS_ID,
                        FROM_HOSPITAL_VIEW:fromHospitalView,
                        QUERY_PAY_TYPE: QUERY_PAY_TYPE,
                        PAYMENT_PAYHIS_FLAG: PAYMENT_PAYHIS_FLAG,
                        PAY_SUBMIT_FLAG: PAY_SUBMIT_FLAG,
                        PHONE_NUMBER: PHONE_NUMBER

                        //KYEEAPPC-5128 程铄闵 从医院首页进入
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            if(data.message){
                                try{ //KYEEAPPTEST-3181 程铄闵
                                    var message = JSON.parse(data.message);
                                    def.tips = message.TIPS;//底部提示信息
                                    def.configTips= message.CONFIG_TIPS;//查询页默认提示 //程铄闵 KYEEAPPC-4560 修改提示
                                }
                                catch(e){
                                    def.tips = undefined;
                                }
                            }
                            var paidData = data.data.rows;
                            //将JSON字符串装换为对象
                            for (var i = 0; i < paidData.length; i++) {
                                paidData[i].PAYMENT_INFO = JSON.parse(paidData[i].PAYMENT_INFO);
                                /*
                                                                //程铄闵 KYEEAPPC-7609 精简接口参数
                                                                var payInfo = paidData[i].PAYMENT_INFO;
                                                                for(var j=0;j<payInfo.length;j++){
                                                                    if(payInfo[j].PAYDETAIL){
                                                                        payInfo[j].PAYDETAIL = def.getClassData(payInfo[j].PAYDETAIL);
                                                                    }
                                                                }*/
                            }
                            def.paidData = paidData;
                            getData(true,data.data.rows,message);
                        } else {
                            getData(false,'',data.message);
                        }
                    },
                    onError: function () {
                    }
                })
            },
            //获取已缴费数据
            loadHosData: function (sortRule,fromHospitalView,getData, showLoading) {
                var patientId;
                var cardNo;
                var storageCache = CacheServiceBus.getStorageCache();
                var hospitalInfo = storageCache.get("hospitalInfo");//当前医院信息
                var hospitalId = undefined;//默认医院id
                var hospitalIdTree = undefined;//获取此医院数据（非跨院）
                var PHONE_NUMBER;
                if(hospitalInfo){
                    hospitalId = hospitalInfo.id;
                    hospitalIdTree = hospitalInfo.id;
                }
                if(def.PHONE_NUMBER){
                    PHONE_NUMBER = def.PHONE_NUMBER;
                    def.PHONE_NUMBER = undefined;
                }
                //门诊已缴费查询方式
                if(def.paymentPayhisParms && def.paymentPayhisParms.QUERY_PAY_TYPE){
                    var QUERY_PAY_TYPE = def.paymentPayhisParms.QUERY_PAY_TYPE;
                }
                //门诊已缴费和门诊缴费
                if(def.paymentPayhisParms && def.paymentPayhisParms.PAYMENT_PAYHIS_FLAG &&
                    def.paymentPayhisParms.PAY_SUBMIT_FLAG){
                    var PAYMENT_PAYHIS_FLAG= def.paymentPayhisParms.PAYMENT_PAYHIS_FLAG;
                    var PAY_SUBMIT_FLAG = def.paymentPayhisParms.PAY_SUBMIT_FLAG;
                }
                //输就诊卡号的操作
                if(def.queryObj){
                    patientId = def.queryObj.patientId;
                    cardNo = def.queryObj.cardNo;
                    if(def.hospitalId){
                        hospitalId = def.hospitalId;
                        def.hospitalId = undefined;
                    }
                    def.queryObj = undefined;
                }
                else{
                    cardNo = undefined;
                    patientId = undefined;
                    //若有就诊卡号缓存，则取缓存传数据
                    var info = storageCache.get('clinicPaymentInfo');
                    if(info!=undefined&&info.patientId!=undefined&&info.hospitalId==hospitalId&&info.cardNo!=undefined){
                        patientId = info.patientId;
                        cardNo = info.cardNo;
                    }
                }
                HttpServiceBus.connect({
                    url: "payment/action/PaymentActionC.jspx",
                    showLoading: showLoading,
                    params: {
                        op: "getPayHis",
                        hospitalID:hospitalId,
                        HOSPITALID_TREE:hospitalIdTree,
                        INPUT_PATIENT_ID:patientId,
                        CARD_NO:cardNo,
                        SORT_RULE:sortRule,
                        USER_VS_ID: this.memoryCache.get('currentCustomPatient').USER_VS_ID,
                        FROM_HOSPITAL_VIEW:fromHospitalView,
                        QUERY_PAY_TYPE: QUERY_PAY_TYPE,
                        PAYMENT_PAYHIS_FLAG: PAYMENT_PAYHIS_FLAG,
                        PAY_SUBMIT_FLAG: PAY_SUBMIT_FLAG,
                        PHONE_NUMBER: PHONE_NUMBER

                        //KYEEAPPC-5128 程铄闵 从医院首页进入
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            if(data.message){
                                try{ //KYEEAPPTEST-3181 程铄闵
                                    var message = JSON.parse(data.message);
                                    def.tips = message.TIPS;//底部提示信息
                                    def.configTips= message.CONFIG_TIPS;//查询页默认提示 //程铄闵 KYEEAPPC-4560 修改提示
                                }
                                catch(e){
                                    def.tips = undefined;
                                }
                            }
                            var paidData;
                            if(data.data&&data.data.rows){
                                paidData = data.data.rows;
                            }

                            //将JSON字符串装换为对象
                            for (var i = 0; i < paidData.length; i++) {
                                paidData[i].PAYMENT_INFO = JSON.parse(paidData[i].PAYMENT_INFO);
                            }
                            def.paidData = paidData;
                            getData(true,data,message);
                        } else {
                            getData(false,'',data.message);
                        }
                    },
                    onError: function () {
                    }
                })
            },
            //获取是否此医院正在维护(框架拦截) 程铄闵 KYEEAPPC-6810
            getHospitalClose: function (hospitalId,onSuccess) {
                HttpServiceBus.connect({
                    url: "/hospitalInform/action/HospitalinforActionC.jspx",
                    params: {
                        hospitalID: hospitalId,
                        paramName: 'showCard',
                        op: "queryHospitalParam"
                    },
                    onSuccess: function (data) {
                        onSuccess(true);
                    },
                    onError:function(){
                        //KYEEAPPTEST-3712 程铄闵
                        if(PatientCardService.oldHospitalInfoCopy){
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
            },

            //加载账单详情（消息跳转时）
            //缴费成功提醒 by 程铄闵 KYEEAPPC-3868  已废弃
            loadPaidRecord : function(orderNo,onSuccess){
                HttpServiceBus.connect({
                    url: "payment/action/PaymentActionC.jspx",
                    params: {
                        op: "getPayInfoByTradeNo",
                        ORDER_NO:orderNo
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            var payInfo = data.data.rows[0];
                            if(payInfo.PAYDETAIL){
                                payInfo.PAYDETAIL = def.getClassData(payInfo.PAYDETAIL);
                            }//KYEEAPPTEST-3709 小信封入口
                            onSuccess(true,payInfo);
                        } else {
                            onSuccess(false,data.message);
                        }
                    },
                    onError: function () {
                    }
                })
            }
        };
        return def;
    })
    .
    build();