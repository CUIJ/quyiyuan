/**
 * 描述： 远程购药服务器
 * 作者:  wangsannv
 * 时间:  2017年3月31日11:32:27
 */
new KyeeModule()
    .group("kyee.quyiyuan.appointment.purchase_medince.service")
    .require([])
    .type("service")
    .name("PurchaseMedinceService")
    .params(["HttpServiceBus","KyeeMessageService","KyeeUploadFileService"])
    .action(function(HttpServiceBus,KyeeMessageService,KyeeUploadFileService){
        var  videoGationData={
            wxJoin:false,
            clinicDue:1,  //默认为初始阶段    1  2  3
            Clientinfo:undefined,
            clinicSource:undefined,  //医生的号源信息
            netWorkShedule:undefined,//医生的排版信息
            isTodetail:undefined,//是否有详情，用来判断是展示详情还是确认预约页面，默认是确认页面
            medicineConfirmDetail:undefined,//购药申请的详情
            regId:undefined,

            /**
             * 公共判空
             * @param data
             * @returns {boolean}
             */
            isDataBlank: function (data) {
                return ( data == undefined || null == data || data == false || "" == data || "NULL" == data || "null" == data);
            },
            //回调函数
            setClientinfo: function (fn) {
                videoGationData.Clientinfo = fn;
            },
            //查看配送范围
            checkDistributionScope : function( param,onSuccess){
                HttpServiceBus.connect({
                    url: "/appoint/action/NetworkHospitalActionC.jspx",
                    params: {
                        op: "isInDistributionRangeActionC",
                        hospitalID:param.hospitalID,
                        ADDRESS_ID:param.addressId
                    },
                    onSuccess: function (data) {
                        onSuccess(data);
                    }
                });
            },
            //查询详情
            queryDetail : function( param,onSuccess){
                HttpServiceBus.connect({
                    url: "/appoint/action/OnlinePrescriptionActionC.jspx",
                    params: {
                        op: "getOnlineRecordDetailActionC",
                        REG_ID:param.REG_ID,
                        HOSPITAL_ID:param.HOSPITAL_ID
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            onSuccess(data.data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 3000
                            });
                        }
                    }
                });
            },
            //一张一张上传照片(生成购药开单记录)
            uploadPictures: function(onSuccess) {
                var me = this;
                var param =me.PICTURE_PARAM;
                var serverURL = DeploymentConfig.SERVER_URL_REGISTRY.default + "appoint/action/OnlinePrescriptionActionC.jspx?"+"loc=c&op=uploadPictureActionC";
                var params = {
                    IMG_SEQUENCE_NO:param.IMG_SEQUENCE_NO,
                    HOSPITAL_ID:param.HOSPITAL_ID,
                    INDEX :param.INDEX,
                    opVersion: param.opVersion
                };
                //显示loading
                KyeeMessageService.loading({
                    mask: true
                });
                KyeeUploadFileService.uploadFile(
                    function(response) {
                        var data = JSON.parse(response.response);
                        if (data.success) {
                            if (me.uploadPicList.length > 0) {
                                me.PICTURE_PARAM.INDEX  = param.INDEX+1;
                                me.uploadPictures(onSuccess);
                            } else {
                                KyeeMessageService.hideLoading(); //隐藏loading
                                onSuccess && onSuccess();
                            }
                        } else {
                            KyeeMessageService.hideLoading(); //隐藏loading
                            KyeeMessageService.broadcast({
                                content: "图片上传失败，请稍后重试",
                                duration: 1000
                            });
                        }
                    },
                    function(response) {
                        KyeeMessageService.hideLoading(); //隐藏loading
                        KyeeMessageService.broadcast({
                            content: "图片上传失败，请稍后重试",
                            duration: 1000
                        });
                    }, me.uploadPicList.shift().imgUrl, serverURL, "image/jpeg", params
                );
            },
            //保存填单数据，同时更新regId
            confirmPurchaseInfo: function(param, onSuccess){
                HttpServiceBus.connect({
                    url: "/appoint/action/OnlinePrescriptionActionC.jspx",
                    params: {
                        op: "submitActionC",
                        REG_ID:param.REG_ID,
                        IMG_SEQUENCE_NO:param.IMG_SEQUENCE_NO,//图片上传序列
                        CONDITION_DESCRIPTION:param.CONDITION_DESCRIPTION, //病情描述
                        DRUG_LIST:param.DRUG_LIST, //药品清单
                        EXAM_TEST_ITEMS:param.EXAM_TEST_ITEMS  //检查检验项目
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            onSuccess(data.data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 3000
                            });
                        }
                    }
                });
            },

            //更新购药发送IM消息状态
            updateBusinessStatus:function(regId){
                HttpServiceBus.connect({
                    url: "/appoint/action/OnlinePrescriptionActionC.jspx",
                    params: {
                        op: "updateBusinessStatusActionC",
                        REG_ID: regId
                    },
                    onSuccess: function (data) {
                    }
                });
            },
            //查询医生的信息(rlUser)
            queryDoctorDetail : function( param,onSuccess){
                HttpServiceBus.connect({
                    url: 'third:forApp/doctor/get/yxAccount',
                    params: {
                        hospitalId:param.hospitalId,
                        deptCode:param.deptCode,
                        doctorCode:param.doctorCode,
                        type:param.type,
                        doctorName:param.doctorName
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            onSuccess(data.data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 3000
                            });
                        }
                    }
                });
            }
        };
        return videoGationData;
    })
    .build();