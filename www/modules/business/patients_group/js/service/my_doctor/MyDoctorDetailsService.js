/**
 * 产品名称：quyiyuan
 * 创建者：wangyaning
 * 创建时间： 2016/11/25
 * 创建原因：病友圈我的医生详情服务
 */
new KyeeModule()
    .group("kyee.quyiyuan.patients_group.my_doctor_details.service")
    .require([])
    .type("service")
    .name("MyDoctorDetailsService")
    .params([
        "HttpServiceBus",
        "KyeeMessageService",
        "KyeeI18nService"
    ])
    .action(function(HttpServiceBus,KyeeMessageService,KyeeI18nService){
        var def = {
            doctorInfo: "", //医生信息
            /**
             * 获取医生信息
             * add by wyn 20161125
             */
            getMyDoctorInfo: function(callBack){
                HttpServiceBus.connect({
                    "url": "third:patientDoctor/getdoctordetail",
                    "params": {
                        yxUser:def.doctorInfo.yxUser,
                        userRole: 2
                    },
                    onSuccess: function(data){
                        if (data.success) {
                            callBack(data.data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message || KyeeI18nService.get("commonText.networkErrorMsg", "网络异常，请稍后重试！"),
                                duration: 2000
                            });
                        }
                    }
                });
            },

	        /**
             * 获取患者和医生聊天所需的数据,用于从预约挂号详情页点击'诊后咨询'跳转至和医生对话页面
             * 若患者和医生不是好友，则会置为好友
	         * @param params
	         * @param successCall
	         */
            getChatDataForConsult: function(params, successCall){
		        HttpServiceBus.connect({
			        url: "third:patientDoctor/chat/info/doctor",
			        params: {
				        scUserId: params.scUserId,
				        userVsId: params.userVsId,
				        scDoctorId: params.scDoctorId,
				        idNo: params.idNo,
				        dateOfBirth: params.dateOfBirth,
				        visitName: params.visitName,
				        sex: params.sex,
				        phone: params.phone
			        },
			        onSuccess: function(response){
				        if (response.success) {
					        successCall(response.data);
				        } else {
					        KyeeMessageService.broadcast({
						        content: response.message || KyeeI18nService.get("commonText.networkErrorMsg", "网络异常，请稍后重试！"),
						        duration: 2000
					        });
				        }
			        }
		        });
            }
        };
        return def;
    }).build();