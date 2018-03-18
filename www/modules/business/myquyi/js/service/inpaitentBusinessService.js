/*
 * 产品名称：quyiyuan
 * 创建人: 杜巍巍
 * 创建日期:2015年9月28日15:49:00
 * 创建原因：门诊记录住院业务服务
 * 任务号：KYEEAPPC-3438
 */
new KyeeModule()
    .group("kyee.quyiyuan.myquyi.inpatientBusiness.service")
    .type("service")
    .name("inpatientBusinessService")
    .params([
        "HttpServiceBus",
        "KyeeMessageService"
    ])
    .action(function (HttpServiceBus, KyeeMessageService) {

        var def = {
            inpaitentData: [],
            scope: undefined,
            showInp:undefined,
            noRecord:undefined,
            //加载数据
            loadData: function (showLoadingFlag, isInit, getData, $scope) {
                var me = this;
                HttpServiceBus.connect({
                    url: "inHospitalPat/action/InHosPatientFeeActionC.jspx",
                    showLoading: showLoadingFlag,
                    params: {
                        op: "queryInHospitalPayment",
                        INP_NO: '',//住院号
                        PATIENT_NAME: '',//病人姓名
                        INPUT_FLAG: ''
                    },
                    onSuccess: function (data) {
                        def.inPaymentData = [];
                        if (!isInit) {
                            $scope.$broadcast('scroll.refreshComplete');
                        }
                        def.noRecord = undefined;
                        //数据获取成功
                        if (data.success) {
                            var inPayment = data.data[0];//第一层数据
                            //支持住院号查询：SHOW_INP==1；
                            if (inPayment.SHOW_INP == 1) {
                                def.showInp = true;//是否开启住院号查询 true-开启
                            }
                            else {
                                def.showInp = false;//是否开启住院号查询
                            }
                            //无数据 && 开启显示住院号查询页
                            if (inPayment.SHOW_INP == 1 && inPayment.PATIENT_ID == undefined) {
                                getData('queryView');
                                //隐藏查询结果内容
                                //取后台message的信息
                                if (data.message && data.alertType == 'ALERT') {
                                    KyeeMessageService.broadcast({
                                        content: data.message
                                    });
                                }
                                return;
                            }
                            //无数据 && 未开启显示住院号查询页
                            if (inPayment.SHOW_INP != 1 && inPayment.PATIENT_ID == undefined) {
                                getData('failView');
                                def.noRecord = data.message;
                                return;
                            }
                            //有数据
                            def.inPaymentData = inPayment; //第一层数据
                            if (inPayment.BILL_DATE_DATA) {
                                var bill = JSON.parse(inPayment.BILL_DATE_DATA);
                                def.inPaymentData.billData = bill;//第二层数据
                                for (var i = 0; i < bill.length; i++) {
                                    if (bill[i].DATE_DATA) {
                                        var detailData = JSON.parse(bill[i].DATE_DATA);
                                        for (var j = 0; j < detailData.length; j++) {
                                            me.convertUn(detailData[j].ITEM_NAME);
                                            me.convertUn(detailData[j].ITEM_SPEC);
                                            me.convertUn(detailData[j].AMOUNT);
                                            me.convertUn(detailData[j].UNITS);
                                        }
                                        def.inPaymentData.billData[i].dateData = detailData;//第三层数据
                                    }
                                }
                            }
                            if (!isInit) {
                                getData('refreshSuccess');
                            }
                            else {
                                getData('recordView');
                            }
                        }
                        //数据获取失败
                        else {
                            KyeeMessageService.broadcast({
                                content: data.message
                            });
                        }
                    }
                })
            },
            //undefined的处理
            convertUn: function (v) {
                if (v == undefined || v == 'undefined') {
                    v = '';
                }
                return v;
            },
            refresh: function () {
                def.scope.refresh();
            }
        };
        return def;
    })
    .build();
