/*
 * 产品名称：quyiyuan
 * 创建人: 程铄闵
 * 创建日期:2015/9/2
 * 创建原因：住院每日清单服务
 * 任务号：KYEEAPPC-3277
 * 修改者：程铄闵
 * 修改时间：2015年12月13日21:27:16
 * 修改原因：住院费用优化（2.1.10）
 * 任务号：KYEEAPPC-4453
 * 修改者：程铄闵
 * 修改时间：2016年6月17日10:22:51
 * 修改原因：2.2.40版住院费用（医院首页入口）
 * 任务号：KYEEAPPC-6603
 */
new KyeeModule()
    .group("kyee.quyiyuan.myWallet.inpatientPayment.service")
    .type("service")
    .name("InpatientPaymentService")
    .params([
        "HttpServiceBus","KyeeMessageService", "KyeeI18nService","CacheServiceBus","PerpaidService","PerpaidPayInfoService","InpatientPaidService"
    ])
    .action(function (HttpServiceBus,KyeeMessageService,KyeeI18nService,CacheServiceBus,PerpaidService,PerpaidPayInfoService,InpatientPaidService) {
        var def = {
            permissionData:undefined,//权限
            fromModifyMode:false,//从切换查询条件切换到查住院号(清除默认住院号)
            authFlag:false,//是否重实名认证跳转来 程铄闵 KYEEAPPC-4806(已废弃)
            queryObj:{},//输入住院号
            messageCenterParams:undefined,//从小信封传的参数
            isOutPush:false,//是否是从外部推送跳转到内部推送  edit by wangsanv
            inPatientData:undefined,//保存将外部推送传过来的数据 edit by  wangsannv
            isFromWeiXin:false,//是否是从微信跳转过来的    edit by wangsannv
            messageId:undefined,
            //获取权限+每日清单查询方式
            loadPermission:function(getData){
                HttpServiceBus.connect({
                    url: "inHospitalPat/action/InHosPatientFeeActionC.jspx",
                    params: {
                        op: "getHospitalFeePermission"
                    },
                    onSuccess:function(data){
                        if(data.success){
                            KyeeMessageService.hideLoading();//取消遮罩
                            var data = data.data;
                            def.permissionData = data;
                            //每日清单开通
                            if(data.INHOSPITAL_PERMISSION == '1'){
                                //单住院号查询方式&非验证中状态
                                var objParams = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
                                var  msg_source_flag = false;
                                if(objParams!=null&& objParams!=undefined && objParams.msgSourceFlag  ){
                                   msg_source_flag = objParams.msgSourceFlag;
                                }

                                if(data.INHOSPITA_QUERYTYPE == 1 && data.SHOW_INPUT_VIEW != 1 && !msg_source_flag){
                                    getData('inpatient_payment_query');
                                }
                                else{
                                    def.loadRecordData(false,function(route){
                                        getData(route);
                                    });
                                }
                            }
                            //每日清单未开通&住院预缴开通
                            else if(data.PRECHARGE_PERMISSION == '1'){
                                PerpaidService.permissionData={};
                                PerpaidService.permissionData.PERMISSION = 1;
                                PerpaidService.permissionData.QUERY_TYPE = data.PRECHARGE_QUERYTYPE;
                                PerpaidService.permissionData.PERMISSION_TIP = data.PREFEE_PERMISSION_TIP;
                                PerpaidService.permissionData.BOTTOM_TIP = data.BOTTOM_TIP;
                                if(data.SHOW_INPUT_VIEW != 1){
                                    PerpaidPayInfoService.inpatientEntrance  = true;
                                    getData('perpaid');
                                }
                                else{
                                    PerpaidPayInfoService.inpatientEntrance = true;
                                    getData('perpaid_pay_info');
                                }
                            }
                            //每日清单未开通&住院预缴未开通&住院历史开通
                            else if(data.INHOSPITALHISTORY_PERMISSION){
                                InpatientPaidService.loadRecordData(function(){
                                    getData('inpatient_paid_record');
                                });
                            }
                        }
                        else{
                            KyeeMessageService.broadcast({
                                content:data.message
                            });
                        }
                    },
                    onError:function(){

                    }
                });
            },

            //加载每日清单数据
            loadRecordData: function (hiddenLoading,getData,queryObj) {
                var inpNo;//住院号
                var patientName;//病人姓名
                var inputFlag;//搜索标志
                patientName = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT).OFTEN_NAME;
                var objParams = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
                if(objParams!=null&& objParams!=undefined && objParams.msgSourceFlag){
                    var msg_source_flag = objParams.msgSourceFlag;
                    var inp_no = objParams.inpNo;
                    if(msg_source_flag){
                        inpNo = inp_no;
                        patientName = patientName;
                    }
                }
                //输住院号的操作
                if(queryObj){
                    inpNo = queryObj.hospitalCode;
                    patientName = queryObj.patientName;
                    inputFlag = queryObj.searchFlag;
                }
                def.queryObj = queryObj;
                KyeeMessageService.loading({
                    mask: true
                });
                HttpServiceBus.connect({
                    url: "inHospitalPat/action/InHosPatientFeeActionC.jspx",
                    params: {
                        op: "queryInHospitalPatInfoNew",//KYEEAPPTEST-3205 程铄闵
                        INP_NO:inpNo,//住院号
                        PATIENT_NAME:patientName,//病人姓名
                        INPUT_FLAG:inputFlag
                    },
                    timeout:60000,//KYEEAPPTEST-3250 程铄闵
                    showLoading: !hiddenLoading,//程铄闵 KYEEAPPC-4560 下拉刷新
                    onSuccess: function (data) {
                        //数据获取成功
                        if (data.success) {
                            var data = data.data;
                            data.success = true;
                            //有数据
                            if(data.TOTAL>0){
                                if(data.INFO){
                                    data.INFO = JSON.parse(data.INFO);
                                }
                                def.paymentData = data;
                                getData('inpatient_payment_record');
                            }
                            //无数据
                            else{
                                def.paymentData = data;
                                //住院号加个人信息&直连没有数据直接到查询页
                                if(data.SHOW_INP_INPUT == 1){
                                    getData('inpatient_payment_query');
                                }
                                else{
                                    getData('inpatient_payment_record');
                                }
                            }
                        }
                        //数据获取失败
                        else {
                            def.paymentData = {};
                            def.paymentData.success = false;
                            def.emptyText = data.message;
                            getData('inpatient_payment_record');
                        }
                    },
                    onError:function(msg){
                        KyeeLogger.warn('**onError**op:queryInHospitalPatInfo:'+msg);
                    }
                })
            },

            //切换医院请求预缴权限更新住院号
            changePatient:function(getData){
                HttpServiceBus.connect({
                    url: "/inHospitalPat/action/InHosPatientFeeActionC.jspx",
                    params: {
                        op: "queryPreChargePermission"
                    },
                    onSuccess: function (data) {
                        if(data.success){
                            if(data.data){
                                def.PerInpNo = data.data.PRE_INP_NO;//新的住院号
                            }
                            getData(true);
                        }
                        else{
                            KyeeMessageService.broadcast({
                                content:data.message
                            });
                        }
                    }
                });
            },

            //加载从就医记录跳到每日清单数据
            loadMyquyiPayData:function(getData){
                var obj = def.messageCenterParams;
                var isMsg;
                if(obj){
                    isMsg = 1;
                    def.messageCenterParams = undefined;
                }
                //SEX，DATE_OF_BIRTH，PATIENT_TYPE
                HttpServiceBus.connect({
                    url: "/inHospitalPat/action/InHospitalPatientHistoryFeeActionC.jspx",
                    params: {
                        URL_DATA:obj,
                        IS_ENVELOPE_CALL:isMsg,
                        op: "queryInHospitalFromCloud"
                    },
                    onSuccess: function (data) {
                        if(data.success){
                            if(data.data){
                                var rec = data.data;
                                //有数据
                                if(rec.total>0){
                                    getData(true,rec.rows[0],rec.IS_SHOW_BALANCE);
                                }
                                else{
                                    getData(false,data.message);
                                }
                            }
                        }
                        else{
                            getData(false,data.message);
                        }
                    }
                });

            },
            //edit by wangsannv 从微信跳转过来的，根据messageId查询每日清单
            loadData: function(messageId,successCall){
                var self = this;
                if(messageId){
                    HttpServiceBus.connect({
                        url: "messageCenter/action/MessageCenterActionC.jspx",
                        params: {
                            op: "loadMessageById",
                            messageId:messageId
                        },
                        onSuccess: function (data) {
                            if (data.success) {
                                var result=data.data.MESSAGE_PARAMETER;
                                var jsonData=JSON.parse(result);
                                successCall(jsonData);
                            }
                        }
                    });
                    self.isFromWeiXin=false;
                    self.messageId=undefined;
                }
            }
        };

        return def;
    })
    .build();