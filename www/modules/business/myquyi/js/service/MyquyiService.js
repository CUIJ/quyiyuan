/**
 * 产品名称：quyiyuan.
 * 创建用户：杜巍巍
 * 日期：2015年12月3日22:01:26
 * 任务号：KYEEAPPC-4374
 * 创建原因：就医记录主页面服务层
 * 修改日期：2016年3月2日19:12:53
 * 修改任务号：KYEEAPPC-5022
 * 修改原因:就医记录增加体检单查询
 */
//外部接口：
//setBackTabIndex(index)
//从我的趣医页面跳转时设置，标志要返回的标签页
new KyeeModule()
    .group("kyee.quyiyuan.myquyi.service")
    .require([])
    .type("service")
    .name("MyquyiService")
    .params(["$state", "HttpServiceBus", "CacheServiceBus", "KyeeMessageService"])
    .action(function ($state, HttpServiceBus, CacheServiceBus, KyeeMessageService) {

        var def = {
            scope: {},
            //实名认证完成后回来刷新页面
            updateView: function () {
                this.scope.getAppointmentRecord();
            },
            //用来存储重云上返回的数据
            allCloudData: [],
            isSelectPatient: undefined,
            isShowTipType: undefined,
            isFromChangeSetting: undefined,
            dateTime: undefined,
            messageDate:undefined,

            //从云上查取用户的就医记录信息
            queryAppointmentData: function (Callback,userId, userVsId, hospitalId) {
                HttpServiceBus.connect({
                    url: "multibusiness/action/VisitTreeAcionC.jspx",
                    showLoading: true,
                    params: {
                        USER_ID: userId,
                        USER_VS_ID: userVsId,
                        HOSPITAL_ID: hospitalId,
                        op: "getVisitTreeFromCloud"
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            def.dealCloudData(data);
                            Callback(data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message
                            });
                        }
                    }
                });
            },
            //处理云上查到的数据，进行日期的显示
            dealCloudData: function (data) {
                for (var i = 0; i < data.data.cloudData.length; i++) {
                    data.data.cloudData[i].REG_DATE_YEAR = [];
                    if (data.data.cloudData[i].REG_DATE) {
                        data.data.cloudData[i].REG_DATE_YEAR = data.data.cloudData[i].REG_DATE.substr(0, 4);
                        data.data.cloudData[i].REG_DATE = data.data.cloudData[i].REG_DATE.substr(5, 5);
                    }
                }
            },

            //点击刷新是从端上查询用户最新的就医记录信息
            queryNewAppointmentData: function (Callback,userId, userVsId, hospitalId, patientCardNo, hospitalCardNo, billCardNo) {
                HttpServiceBus.connect({
                    url: "multibusiness/action/VisitTreeAcionC.jspx",
                    showLoading: true,
                    params: {
                        USER_ID: userId,
                        USER_VS_ID: userVsId,
                        HOSPITAL_ID: hospitalId,
                        CARD_NO: patientCardNo,
                        HOSPI_NO: hospitalCardNo,
                        INVOICE_NO: billCardNo,
                        op: "synchTerminalDataToCloud"
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            def.dealData(data);
                            Callback(data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message
                            });
                        }
                    }
                });
            },
            dealData: function (data) {
                for (var i = 0; i < data.data.cloudData.length; i++) {
                    data.data.cloudData[i].REG_DATE_YEAR = [];
                    if (data.data.cloudData[i].REG_DATE) {
                        data.data.cloudData[i].REG_DATE_YEAR = data.data.cloudData[i].REG_DATE.substr(0, 4);
                        data.data.cloudData[i].REG_DATE = data.data.cloudData[i].REG_DATE.substr(5, 5);
                    }
                }
            },
            /**
             * 删除就医记录数据  KYEEAPPC-5024
             * 任务 KYEEAPPC-5024
             * @param onSuccess 删除成功后的回调
             * @param record 要删除的数据
             */
            deleteRecord:function(onSuccess,record){
                HttpServiceBus.connect({
                    url: "multibusiness/action/VisitTreeAcionC.jspx",
                    showLoading: true,
                    params: {
                        REG_ID:record.REG_ID,
                        TYPE:record.TYPE,
                        REPORT_FLAG:record.REPORT_FLAG,
                        PATIENT_ID:record.PATIENT_ID,
                        UNION_ID:record.UNION_ID,
                        op: "deleteRecord"
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            onSuccess();
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message
                            });
                        }
                    }
                });
            }
        };
        return def;
    })
    .build();
