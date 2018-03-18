/**
 * 产品名称：quyiyuan
 * 创建者：程铄闵
 * 创建时间：2016年8月26日14:39:30
 * 创建原因：已缴费用详情服务层
 * 任务号：KYEEAPPC-7609
 */
new KyeeModule()
    .group("kyee.quyiyuan.myWallet.paidRecord.service")
    .type("service")
    .name("PaidRecordService")
    .params(["HttpServiceBus", "CacheServiceBus", "KyeeMessageService","PatientCardService"])
    .action(function (HttpServiceBus, CacheServiceBus, KyeeMessageService,PatientCardService) {
        var def = {
            paidList:undefined,//多笔记录
            paidInfo:undefined,//缴费详情
            errorMsg:undefined,//错误提示信息
            params:undefined,//入参
            webJump:undefined,//web页面跳转表标识

            //获取已缴费详情
            loadPaidRecord : function(params,onSuccess){
                var storageCache = CacheServiceBus.getStorageCache();
                var hospitalId = storageCache.get("hospitalInfo").id;//当前医院信息
                //PLACE：调用此接口地方 0-门诊历史；1-小信封小铃铛；2-就医记录 KYEEAPPTEST-3818
                var para = {
                    HOSPITAL_ID:hospitalId,
                    PLACE:undefined,
                    ORDER_NO:undefined,
                    REC_MASTER_ID:undefined,
                    PAY_TIME:undefined,
                    EXTRA_KEY:undefined,
                    isLargeChannel:undefined
                };
                if(!params){
                    params = def.params;
                }
                if(!params.HOSPITAL_ID){
                    params.HOSPITAL_ID = hospitalId;
                }
                para = params;
                var opName="queryPayDetail";
               if(para.isLargeChannel){
                   opName="queryLargeChannelPayDetail";
                   para.isLargeChannel=undefined;
               }
                HttpServiceBus.connect({
                    url: "payment/action/PaymentActionC.jspx",
                    params: {
                        op: opName,
                        hospitalID:para.HOSPITAL_ID,
                        PLACE:para.PLACE,
                        ORDER_NO:para.ORDER_NO,
                        REC_MASTER_ID:para.REC_MASTER_ID,
                        PAY_TIME:para.PAY_TIME,
                        EXTRA_KEY:para.EXTRA_KEY
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            var rec = data.data;
                            if(rec && rec.total == 1){
                                var paidInfo = rec.rows[0];
                                if(paidInfo.PAYDETAIL){
                                    paidInfo.PAYDETAIL = def.getClassData(paidInfo.PAYDETAIL);
                                }
                                def.paidInfo = paidInfo;
                                def.paidInfo.success = true;
                                onSuccess(true,paidInfo);
                            }
                            else if(rec && rec.total > 1){
                                def.paidList = {};
                                def.paidList.rows = rec.rows;
                                def.paidList.success = true;
                                //多笔列表
                                onSuccess(true, 'clinic_paid_message');
                            }
                            else{
                                def.paidList = {};
                                def.paidInfo = {};
                                def.errorMsg = data.message;
                                onSuccess(false,data.message);
                            }
                        } else {
                            def.paidList = {};
                            def.paidInfo = {};
                            def.errorMsg = data.message;
                            onSuccess(false,data.message);
                        }
                    },
                    onError: function () {
                    }
                })
            },
            //判断是否开启增加确认按钮
            isPermitAddConfirm:function(onSuccess){
                var storageCache = CacheServiceBus.getStorageCache();
                var hospitalId = storageCache.get("hospitalInfo").id;//当前医院信息
                //PLACE：调用此接口地方 0-门诊历史；1-小信封小铃铛；2-就医记录 KYEEAPPTEST-3818
                HttpServiceBus.connect({
                        url: "payment/action/PaymentActionC.jspx",
                        params: {
                            hospitalId:hospitalId,
                            op: "querySysParamsPermitConfirm",
                        },
                        onSuccess: function (retVal){
                            if(retVal){
                                onSuccess(retVal);
                            }
                        }
                })
            },
            //点击确认按钮时更新confirm字段
            updatePaidRecordConfirm : function(primkey){
                HttpServiceBus.connect({
                    url: "payment/action/PaymentActionC.jspx",
                    showLoading:false,
                    params: {
                        op: "updatePaidRecordConfirm",
                        para:JSON.stringify(primkey)
                    },
                })
            },
            //查询退费的信息 by dongzhuo 任务号：KYEEAPPC-761
            refundApply: function (onSuccess,paidInfo) {
                HttpServiceBus.connect({
                    url: 'payment/action/PaymentActionC.jspx',
                    params: {
                        REC_MASTER_ID:paidInfo.REC_MASTER_ID,
                        op: 'queryApplyInfo'//查询要退费的信息
                    },
                    onSuccess: function (data) {

                        if(data.success){
                            var rows = data.data.rows;
                            if(rows){
                                for(var i=0;i<rows.length;i++){
                                    if(rows[i].DETAILS){
                                        rows[i].DETAILS = JSON.parse(rows[i].DETAILS);
                                    }
                                }
                            }
                            onSuccess(data.data);
                        }
                    },
                    onError: function () {
                    }
                })
            },
            //门诊已缴费删除 by 杜巍巍
            deleteClinicPaid: function (getData,PAY_ID,ADD_KEY) {
                HttpServiceBus.connect({
                    url: "payment/action/PaymentActionC.jspx",
                    params: {
                        ADD_KEY:ADD_KEY,//删除门诊附加费用标志 bydongzhuo
                        PAY_ID:PAY_ID,
                        REG_ID:undefined,//新版明细进行删除，无法删除预约挂号记录
                        op: 'hiddenPayHisByPrimaryKey'
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            getData(data);
                        }
                    },
                    onError: function () {
                    }
                })
            },

            //获取取药窗口、执行科室分类数据
            getClassData:function(detail){
                //DRUG_WINDOWS或PERFORMED_BY 有值则分组
                var detailObj = [];//分组后的json数据
                var index = 0;//分组后数组detailObj下标
                var arr = [];//已匹配过的item
                //执行科室和取药窗口都不存在，置标记
                for(var k=0; k<detail.length;k++){
                    var w = detail[k].DRUG_WINDOWS;
                    var p = detail[k].PERFORMED_BY;
                    if(!w && !p){
                        detail[k].DRUG_WINDOWS = 'NoDrugWindowsFlag';//若都无，置标记
                    }
                    else{
                        if(!(w && w.trim()!='') && !(p && p.trim()!='')){
                            detail[k].DRUG_WINDOWS = 'NoDrugWindowsFlag';//若都无，置标记
                        }
                    }
                }
                //数据分组，优先取药窗口
                for (var m = 0; m<detail.length; m++) {
                    var windows = detail[m].DRUG_WINDOWS;
                    var performed = detail[m].PERFORMED_BY;
                    var groupName;
                    if(windows){
                        groupName = windows;
                    }
                    else if(performed){
                        groupName = performed;
                    }

                    var isExist = false;//是否已分组标记，默认未分组
                    var group = [];
                    //判断当前值是否已分组
                    for(var k=0; k<arr.length; k++) {
                        //有取药窗口则有显示
                        if (arr[k] == detail[m].DRUG_WINDOWS) {
                            isExist = true;//已分组
                            break;
                        }
                        else if(arr[k] == detail[m].PERFORMED_BY){
                            isExist = true;//已分组
                            break;
                        }
                    }
                    //未分组的处理
                    if(!isExist){
                        detailObj[index] = {
                            GROUP_NAME:groupName,
                            GROUP_DATA:new Object()
                        };
                        for(var n = m; n<detail.length; n++){
                            if(groupName == windows && detail[n].DRUG_WINDOWS!=undefined && detail[n].DRUG_WINDOWS.trim()!='' && groupName.indexOf(detail[n].DRUG_WINDOWS)>-1){
                                group.push(detail[n]);
                            }
                            else if(groupName == performed && detail[n].PERFORMED_BY!=undefined && detail[n].PERFORMED_BY.trim()!='' && groupName.indexOf(detail[n].PERFORMED_BY)>-1){
                                group.push(detail[n]);
                            }
                        }
                        arr.push(groupName);
                        detailObj[index].GROUP_DATA=group;
                        index++;
                    }
                }
                //数据排序（都没有的在最前面）
                var noNullArr = [];//有执行科室或取药窗口
                var newObj = [];
                for(var p = 0; p<detailObj.length; p++){
                    if(detailObj[p].GROUP_NAME == 'NoDrugWindowsFlag'){
                        newObj.push(detailObj[p]);
                    }
                    else{
                        noNullArr.push(p);
                    }
                }
                for(var t=0;t<noNullArr.length;t++){
                    newObj.push(detailObj[noNullArr[t]]);
                }
                return newObj;
            }
        };
        return def;
    })
    .build();