/*
 * 产品名称：quyiyuan
 * 创建人: 程铄闵
 * 创建日期:2016年6月8日16:09:11
 * 创建原因：住院预缴记录服务
 * 任务号：KYEEAPPC-6601
 */
new KyeeModule()
    .group("kyee.quyiyuan.myWallet.perpaidRecord.service")
    .type("service")
    .name("PerpaidRecordService")
    .params([
        "HttpServiceBus"
    ])
    .action(function (HttpServiceBus) {
        var def = {
            fromPayOrder:false,//支付订单后的标记
            fromMyquyiRecord:false,//从就医记录底部的记录中跳转来
            webJump : undefined,//web页面跳转

            //fromInpatientPaymentRecord : false,//从inpatient_payment_record直接跳转到记录
            //加载数据
            loadData : function(hiddenLoading,currentPage,rows,onSuccess){
                HttpServiceBus.connect({
                    url : '/inHospitalPat/action/InHosPatientFeeActionC.jspx',
                    params : {
                        op : 'getPreFeeDetail',
                        PAGE:currentPage,
                        ROWS:rows
                    },
                    showLoading:!hiddenLoading,
                    onSuccess : function(data){
                        //data = {"success":true,"message":"充值记录查询成功","resultCode":"0000000","data":{"total":"2","rows":[{"HOSPITAL_ID":0,"PAYMENT_INFO":"[{\"INPATIENT_NO\":\"290104\",\"HOSPITAL_ID\":\"290104\",\"PATIENT_NAME\":\"小鲁\",\"FORMAT_DATE\":\"2016/06/06\",\"DELETE_FLAG\":1,\"HOSPITAL_NAME\":\"汐漫星空\",\"PRED_ID\":668,\"PRE_ID\":0,\"OUT_TRADE_NO\":\"QY2901041464159170357\",\"DEPO_AMOUNT\":\"33.00\",\"HIS_STATUS\":\"2\",\"USER_ID\":0,\"USER_VS_ID\":0,\"PAY_TIME\":\"2016/06/06 14:15:45.0\"},{\"INPATIENT_NO\":\"290104\",\"HOSPITAL_ID\":\"290104\",\"PATIENT_NAME\":\"小鲁\",\"FORMAT_DATE\":\"2016/06/06\",\"DELETE_FLAG\":1,\"HOSPITAL_NAME\":\"汐漫星空\",\"PRED_ID\":667,\"PRE_ID\":0,\"OUT_TRADE_NO\":\"QY2901041464159105897\",\"DEPO_AMOUNT\":\"22.00\",\"HIS_STATUS\":\"1\",\"USER_ID\":0,\"USER_VS_ID\":0,\"PAY_TIME\":\"2016/06/06 14:15:45.0\"}]","DELETE_FLAG":0,"NEED_REMOVE":true,"YEAR_OF_DATE":"2016","MONTH_OF_YEAR":"本月","MONTH_OF_NUMBER":"06"},{"HOSPITAL_ID":0,"PAYMENT_INFO":"[{\"INPATIENT_NO\":\"290104\",\"HOSPITAL_ID\":\"290104\",\"PATIENT_NAME\":\"小鲁\",\"FORMAT_DATE\":\"2015/12/17\",\"DELETE_FLAG\":1,\"HOSPITAL_NAME\":\"汐漫星空\",\"PRED_ID\":666,\"PRE_ID\":0,\"OUT_TRADE_NO\":\"QY2901041464155270914\",\"DEPO_AMOUNT\":\"11.00\",\"HIS_STATUS\":\"1\",\"USER_ID\":0,\"USER_VS_ID\":0,\"PAY_TIME\":\"2015/12/17 20:49:58.0\"}]","DELETE_FLAG":0,"NEED_REMOVE":true,"YEAR_OF_DATE":"2015","MONTH_OF_YEAR":"十二月","MONTH_OF_NUMBER":"12"}]}};
                        if(data.success){
                            var rows = data.data.rows;
                            if(rows.length>0){
                                for(var i=0;i<rows.length;i++){
                                    var info = rows[i].PAYMENT_INFO;
                                    if(info){
                                        rows[i].PAYMENT_INFO = JSON.parse(info);
                                    }
                                }
                                data.data.loadedAll = data.message=='QUERY_ALL';
                                onSuccess(true,data.data);
                            }
                            else{
                                onSuccess(false,data.message);
                            }
                        }
                        else{
                            onSuccess(false,data.message);
                        }
                    }
                });
            },

            //住院充值记录滑动删除
            deleteRecord: function (getData,PRED_ID) {
                HttpServiceBus.connect({
                    url: "inHospitalPat/action/InHosPatientFeeActionC.jspx",
                    params: {
                        UNION_ID:PRED_ID,
                        op: "hiddenPreFeeDetailByPrimaryKey"
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