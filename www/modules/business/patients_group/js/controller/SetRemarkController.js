/**
 * 产品名称：quyiyuan
 * 创建者：dangliming
 * 创建时间： 2017年2月21日09:58:24
 * 创建原因：好友详情页面设置备注跳转至新界面
 */

new KyeeModule()
	.group("kyee.quyiyuan.patients_group.set_remark.controller")
	.require([
		// "kyee.framework.service.view",
		// "kyee.quyiyuan.patients_group.personal_home.service"
		"kyee.quyiyuan.patients_group.set_remark.service",
		"kyee.quyiyuan.patients_group.personal_chat.service",
	])
	.type("controller")
	.name("SetRemarkController")
	.params([
		"$scope",
		"$state",
		"$ionicHistory",
		"KyeeListenerRegister",
		"CacheServiceBus",
		"KyeeMessageService",
		"KyeeI18nService",
		"SetRemarkService",
		"PersonalChatService"
	])
	.action(function($scope,$state,$ionicHistory,KyeeListenerRegister,CacheServiceBus, KyeeMessageService, KyeeI18nService,
	                 SetRemarkService, PersonalChatService){

		/**
		 * 监听进入当前页面
		 */
		KyeeListenerRegister.regist({
			focus: "set_remark",
			when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
			direction: "both",
			action: function (params) {
				initData();
			}
		});

		/**
		 * 修改好友备注界面初始化
		 */
		function initData(){
			var friendInfo = $scope.friendInfo = SetRemarkService.friendInfo;

			$scope.userId = SetRemarkService.userId;
			$scope.oldRemark = friendInfo.remark;

			$scope.model = {
				remark: friendInfo.remark ? friendInfo.remark : friendInfo.userPetname
			};
			
			$scope.isWrite = false;
			$scope.canSave = !$scope.oldRemark || $scope.model.remark != friendInfo.userPetname; //初始化进来如果没有备注名称则不能保存，
		}

		$scope.placeholder = {
			addRemark: KyeeI18nService.get("set_remark.addRemark", "添加备注名")
		};

		/**
		 * 显示删除好友备注按钮
		 */
		$scope.showDeleteIcon = function(){
			$scope.isWrite = true;
		};

		/**
		 * 隐藏删除好友备注按钮
		 */
		$scope.hideDeleteIcon = function(){
			$scope.isWrite = false;
		};

		/**
		 * 删除好友备注内容
		 */
		$scope.clearRemark = function(){
			$scope.model.remark = "";
		};

		/**
		 * 备注不为空且修改后的备注和原备注不一样时  可以保存
		 */

		$scope.$watch("model.remark", function(newRemark){
			$scope.canSave = !(newRemark == $scope.oldRemark && $scope.model.remark!='');
		});
		/**
		 * 保存修改后的好友备注
		 */
		$scope.saveRemark = function(){
			var newRemark = $scope.model.remark;
			if($scope.canSave && (newRemark=='' ||  validRemark(newRemark))){
				var params = {
					scUserId: CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.USER_ACT_INFO).scUserId,
					type: 1,
					scFriendId: $scope.friendInfo.scUserId,
					remark: newRemark
				};
				SetRemarkService.setRemark(params, function(success){
					if(success){
						var newUserName = newRemark ? newRemark : $scope.friendInfo.userPetname;
						PersonalChatService.receiverInfo.remark = newUserName;
						//YX  更新会话列表
						var yxUser = $scope.friendInfo.yxUser;
						var sessionList = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.SESSION_LIST);
						for(var i = 0; i < sessionList.length; i++){
							if(sessionList[i].sessionId == yxUser){
								sessionList[i].petname = petname;
								break;
							}
						}
						CacheServiceBus.getStorageCache().set(CACHE_CONSTANTS.STORAGE_CACHE.SESSION_LIST,sessionList);
						$ionicHistory.goBack(-1);
					}
				});
			}
		};

		/**
		 * 显示备注修改成功提示
		 */
		var showSuccessTips = function(){
			$scope.personal.isWrite = false;
			KyeeMessageService.broadcast({
				content: KyeeI18nService.get("set_remark.saveSuccess","备注修改成功！")
			});
			$ionicHistory.goBack();
		};

		/**
		 * 校验备注:可以为空，输入字符是否合法
		 * @param remark
		 * @returns {boolean}
		 */
		function validRemark(remark){
			var validFlag = true,
				regx = /^[\u4E00-\u9FA5A-Za-z 0-9]+$/;
			if(!regx.test(remark)){
				KyeeMessageService.broadcast({
					content: KyeeI18nService.get("set_remark.invaildContent","请勿输入中文、英文、数字和空格之外的内容！")
				});
				validFlag = false;
			}
			return validFlag;
		}
	})
	.build();