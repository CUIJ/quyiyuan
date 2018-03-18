/**
 * 产品名称：quyiyuan
 * 创建者：章剑飞
 * 创建时间：2015年6月23日17:18:59
 * 创建原因：就诊卡充值服务层
 * 修改者：程铄闵
 * 修改原因：2.1.20优化
 * 任务号：KYEEAPPC-4687
 * 修改时间：2015年12月23日23:09:39
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.patient_recharge.service")
    .require([])
    .type("service")
    .name("patientRechargeService")
    .params(["HttpServiceBus", "KyeeMessageService", "KyeeUtilsService", "CacheServiceBus","KyeeI18nService","PatientCardService"])
    .action(function (HttpServiceBus, KyeeMessageService, KyeeUtilsService, CacheServiceBus,KyeeI18nService,PatientCardService) {
        var def = {
            memoryCache: CacheServiceBus.getMemoryCache(),
            storageCache: CacheServiceBus.getStorageCache(),
            prompt:undefined,//底部提示语
            emptyText:undefined,//无权限提示语
            permission:undefined,//权限标记
            //获取就诊卡信息
            queryCardInfo: function (getData) {
                //获取医院信息
                var hospitalInfo = this.storageCache.get('hospitalInfo');
                //获取缓存中当前就诊者信息
                var currentPatient = this.memoryCache.get('currentCustomPatient');
                HttpServiceBus.connect({
                    url: "/center/action/CustomPatientAction.jspx",
                    params: {
                        op: "queryCardInAppoint",
                        opVersion:'2.1.50',//KYEEAPPC-5217 程铄闵
                        USER_VS_ID: currentPatient.USER_VS_ID
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            getData(data.data.rows);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 3000
                            });
                        }
                    }
                });
            },
            loadMsg: function(getData){
                HttpServiceBus.connect({
                    url: "patientRecharge/action/PatientRechargeActionC.jspx",
                    params: {
                        op: "patientRechargeToMsg",
                        opVersion:'2.1.50'//KYEEAPPC-5217 程铄闵
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            //有权限
                            if(data.data.permission=='SUCCESS'){
                                def.prompt = data.data.message;
                                def.permission = true;
                                var view = def.isPermission(true);
                                getData(view);
                            }
                            //无权限
                            else{
                                def.permission = false;
                                def.emptyText = data.data.message;
                                var view = def.isPermission(false);
                                getData(view);
                            }
                        } else {
                            def.permission = false;
                            def.emptyText = data.message;
                            var view = def.isPermission(false);
                            getData(view);
                        }
                    }
                });
            },
            //确认充值
            rechargeSubmit: function(getData, cardNo, patientId, amount){
                //获取缓存中当前就诊者信息
                var currentPatient = this.memoryCache.get('currentCustomPatient');
                var userInfo = this.memoryCache.get('currentUserRecord');
                //获取医院信息
                var hospitalInfo = this.storageCache.get('hospitalInfo');
                HttpServiceBus.connect({
                    url: "patientRecharge/action/PatientRechargeActionC.jspx",
                    params: {
                        op: "patientRecharge",
                        opVersion:'2.1.50',//KYEEAPPC-5217 程铄闵
                        USER_VS_ID: currentPatient.USER_VS_ID,
                        PATIENT_ID: patientId,
                        CARD_NO: cardNo,
                        USER_ID: userInfo.USER_ID,
                        AMOUNT: amount
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            var mark =KyeeI18nService.get("wallet_card_recharge.title","就诊卡充值");
                            var payData = {
                                'hospitalID':hospitalInfo.id,
                                'MARK_DESC': mark,
                                'MARK_DETAIL': mark,
                                'AMOUNT': parseFloat(amount).toFixed(2),
                                'TRADE_NO': data.data,
                                'PATIENT_RECHARGE': true
                            };
                            getData(payData);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 3000
                            });
                        }
                    }
                });
            },
            //判断跳转到就诊卡添加页面or就诊卡充值页 KYEEAPPC-4842 程铄闵
            isPermission:function(permission){
                //开通权限
                if(permission){
                    var card = CacheServiceBus.getMemoryCache().get('currentCardInfo');
					//有卡 KYEEAPPTEST-3409 程铄闵 
					if(card && card.CARD_TYPE){
						//如果是虚拟卡（趣医）,拦截
						if(card.CARD_TYPE == 0 && card.CARD_NO!=undefined && card.CARD_NO.substring(0, 1) == "Q"){
							PatientCardService.filteringVirtualCard.isFilteringVirtual = true;
							PatientCardService.filteringVirtualCard.routingAddress = "wallet_card_recharge";
							return 'patient_card_select';
						}else{
							return 'wallet_card_recharge';
						}
                    }
					else{
                        return 'patient_card_select';
					}
                }
                else{
                    return 'wallet_card_recharge';
                }
            }
        };
        return def;
    })
    .build();

