/**
 * 产品名称：quyiyuan
 * 创建者：dangliming
 * 创建时间： 2017/02/22
 * 创建原因：增加修改好友备注功能
 */
new KyeeModule()
	.group("kyee.quyiyuan.patients_group.set_remark.service")
	.require([
		"kyee.framework.service.message",
		"kyee.framework.file.upload",
		"kyee.quyiyuan.patients_group.personal_home.service"
	])
	.type("service")
	.name("SetRemarkService")
	.params([
		"HttpServiceBus",
		"KyeeMessageService",
		"KyeeUtilsService",
		"CacheServiceBus",
		"KyeeI18nService",
		"PersonalHomeService"
	])
	.action(function(HttpServiceBus, KyeeMessageService, KyeeUtilsService, CacheServiceBus, KyeeI18nService, PersonalHomeService){

		return {
			scUserId: null, //当前用户id

			friendInfo: null,  //好友信息

			/**
			 *  执行设置备注
			 *  @param params:
		     * userId     必传 当前用户的userId
			 * type       必传--好友类型: 1--患患好友;  2--医患好友
			 * remark     必传 可以为空
			 * friendId   修改患患好友时必传
			 * hospitalId 修改医生备注时必传
			 * deptCode   修改医生备注时必传
			 * doctorCode 修改医生备注时必传
			 * @param callBack  成功回调
			 * @param fail  失败回调
			 * @return Boolean
			 */
			setRemark: function (params, callBack, fail) {
				HttpServiceBus.connect({
					url: "third:userAtten/remark/set",
					params: params,
					onSuccess: function (data) {
						var success = true;
						if(!data.success){
							KyeeMessageService.broadcast({
								content: data.message || KyeeI18nService.get("commonText.networkErrorMsg", "网络异常，请稍后重试！"),
								duration: 2000
							});
							success = false;
						}
						typeof callBack == "function" && callBack(success);
					},
					onError: function(response){
						typeof fail == "function" && fail(response);
					}
				});
			}
		};
	})
	.build();