/**
 * 产品名称：quyiyuan.
 * 创建用户：程铄闵
 * 日期：2016年6月6日18:37:55
 * 创建原因：住院预缴确认状态服务
 * 任务号：KYEEAPPC-6601
 */
new KyeeModule()
    .group("kyee.quyiyuan.myWallet.perpaidPayInfo.service")
    .require([])
    .type("service")
    .name("PerpaidPayInfoService")
    .params([
        "HttpServiceBus","KyeeMessageService","CacheServiceBus","KyeeI18nService",
        "PerpaidService","KyeeUtilsService","$ionicHistory"
    ])
    .action(function(HttpServiceBus, KyeeMessageService, CacheServiceBus,KyeeI18nService,
                     PerpaidService,KyeeUtilsService,$ionicHistory){
        //日期格式转换
        var convertTime = function(v){
            //param = 'YYYY/MM/DD'||'MM/DD'
            if(v != undefined){
                var date = KyeeUtilsService.DateUtils.formatFromDate(v,'YYYY/MM/DD');
                return date;
                //var time = v.substr(11,8);
                //return date+' '+time;
            }
        };
        var def = {
            perpaidNext:false,//点击下一步到此页面标记
            inpatientEntrance:false,//从住院缴费模块进入标记
            inpatientToPerpaidRecord:false,//没历史权限时右上角跳转标记
            fromInpatient:false,//入口perpaid(从医院首页来只有预缴权限)
            isFromQRCode :false,//从扫描微信二维码进来
            inNoQRCode:'',

            //初始化
            loadData : function(hiddenLoading,getData,inpatientData,homeInpNo){
                var inpNo = '';
                var hInpNo;
                var patientName = CacheServiceBus.getMemoryCache().get('currentCustomPatient').OFTEN_NAME;
                var hospitalId =  CacheServiceBus.getStorageCache().get('hospitalInfo').id;
                if(def.isFromQRCode){
                    inpNo = def.inNoQRCode;
                }
                if(inpatientData){
                    inpNo = inpatientData;
                }
                if(homeInpNo){
                    hInpNo = homeInpNo;
                }

                HttpServiceBus.connect({
                    url : '/inHospitalPat/action/InHosPatientFeeActionC.jspx',
                    showLoading:!hiddenLoading,
                    params : {
                        op : 'queryPreFeeInfoByInpNo',
                        CURRENT_HOSPITAL_ID:hospitalId,
                        PATIENT_NAME: patientName,
                        INPATIENT_NO:inpNo,
                        HOME_INP_NO:hInpNo
                    },
                    onSuccess : function(data){
                        //data = {"success":true,"message":"住院预交信息查询成功!","resultCode":"0000000","data":{"RESULT_TIP":"信息验证中，下拉即可刷新...","KIND_TIP":"为确保您的资金安全，正将您的信息发往医院进行验证，此过程大约需要1-2分钟，请您选择等待或者稍后返回继续操作","QUERY_PROGRESS":"QUERYING","STRAIGHT":"0","TOTAL":"0","DATA":"{\"total\":\"0\",\"rows\":[]}","QUERY_TYPE":"2","FLAG":"0"}};
                        //data = {"success":true,"message":"住院预交信息查询成功!","resultCode":"0000000","data":{"RESULT_TIP":"验证失败","KIND_TIP":"请修改查询条件进行查询","QUERY_PROGRESS":"DONE","STRAIGHT":"0","BOTTOM_TIP":"本预付服务免费，实际费用由医院直接收取","TOTAL":"0","DATA":"{\"total\":\"0\",\"rows\":[]}","HOSPITAL_TIP":"您要预缴住院费的医院：","QUERY_TYPE":"2","FLAG":"1"}};
                        //data = {"success":true,"message":"住院预交信息查询成功!","resultCode":"0000000","data":{"RESULT_TIP":"验证成功","KIND_TIP":"请核对信息并输入充值金额","QUERY_PROGRESS":"DONE","QUERY_NAME":"小鲁","STRAIGHT":"0","BOTTOM_TIP":"* 本预付服务免费，实际费用由医院直接收取","TOTAL":"1","DATA":"{\"total\":\"1\",\"rows\":[{\"SF_NAME\":\"市医保\",\"BALANCE\":1,\"INPATIENT_NO\":\"290104\",\"PATIENT_ID\":\"M00002316\",\"AGE\":1,\"ADMISS_DATE\":\"2015-11-25 16:30:25\",\"DEPO_AMOUNT\":3,\"WARD_NAME\":\"门诊的数据库的凤凰山缴费快睡觉\",\"ADMISS_TIMES\":\"1\",\"BED_NO\":\"+07\",\"ID_NO\":\"34170019890413708X\",\"PATIENT_NAME\":\"小鲁\",\"SEX\":\"男\",\"CHARGE_AMOUNT\":2,\"HOSPITAL_ID\":290104}]}","QUERY_TYPE":"2","FLAG":"0"}};
                        if(data.success){
                            var rec = data.data;
                            if(rec.DATA){
                                var obj = JSON.parse(rec.DATA);
                                var row = obj.rows[0];
                                if(row){
                                    if(row.ADMISS_DATE){
                                        row.ADMISS_DATE = convertTime(row.ADMISS_DATE);
                                    }
                                }
                                rec.DATA = obj.rows[0];
                            }
                            def.payData = rec;
                            def.payData.success = true;
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
            //取消验证
            cancelCheck : function(getData){
                HttpServiceBus.connect({
                    url : '/inHospitalPat/action/InHosPatientFeeActionC.jspx',
                    params : {
                        op : 'cancelCheck'
                    },
                    onSuccess : function(data){
                        //data = {"success":true,"message":"取消成功!","data":{}};
                        //data = {"success":false,"message":"取消失败!","data":{}};
                        if(data.success){
                            getData(true);
                        }
                        KyeeMessageService.broadcast({
                            content:data.message
                        });
                    }
                });
            },
            //支付
            paySubmit : function(payInfo, afterPaySubmit){
                var prePayedMoney = payInfo.prePayedMoney;
                if((/^(([1-9]\d*)|\d)(\.\d{1,2})?$/).test(prePayedMoney) && prePayedMoney != "0"){
                    HttpServiceBus.connect({
                        url : '/PreCharge/action/PreChargeActionC.jspx',
                        params : {
                            op : "preffCharge",
                            MARK_DESC : '住院预交充值',
                            MARK_DETAIL : prePayedMoney+'元',
                            AMOUNT : prePayedMoney,
                            INPATIENT_NO : payInfo.INPATIENT_NO
                        },
                        onSuccess : function(retVal){
                            var success = retVal.success;
                            var message = retVal.message;
                            var hospitalId =  CacheServiceBus.getStorageCache().get('hospitalInfo').id;
                            if(success){
                                var payInfo = {
                                    TRADE_NO : retVal.OUT_TRADE_NO,
                                    MARK_DESC : KyeeI18nService.get("perpaid_pay_info.chargeText","住院预交充值"),
                                    MARK_DETAIL : KyeeI18nService.get("perpaid_pay_info.chargeText","住院预交充值"),
                                    AMOUNT : prePayedMoney,
                                    hospitalID:hospitalId
                                };
                                //跳转到去支付
                                afterPaySubmit(payInfo);
                            }else{
                                if(message){
                                    KyeeMessageService.broadcast({
                                        content:message
                                    });
                                }
                            }
                        },
                        onError : function(retVal){
                        }
                    });
                }else{
                    KyeeMessageService.broadcast({
                        content:KyeeI18nService.get("perpaid_pay_info.checkAmount","请输入正确的金额！")
                    });
                }
            },
            //切换医院or就诊者发请求更新数据
            changePatientOrHospital:function(isHospital,getData){
                HttpServiceBus.connect({
                    url: "/inHospitalPat/action/InHosPatientFeeActionC.jspx",
                    params: {
                        op: "queryPreChargePermission",
                        SWITCH:1
                    },
                    onSuccess: function (data) {
                        if(data.success){
                            var rec = data.data;
                            PerpaidService.permissionData = rec;
                            getData(true);
                        }
                        else{
                            KyeeMessageService.broadcast({
                                content:data.message
                            });
                        }
                    }
                });
            }
        };

        return def;
    })
    .build();