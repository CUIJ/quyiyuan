new KyeeModule()
	.group("kyee.quyiyuan.tabs.controller")
	.require(["kyee.framework.service.message", "kyee.framework.service.utils", "kyee.framework.service.view", "kyee.quyiyuan.home.controller"])
	.type("controller")
	.name("TabsController")
	.params(["$scope", "KyeeMessageService", "KyeeUtilsService", "KyeeViewService"])
	.action(function($scope, KyeeMessageService, KyeeUtilsService, KyeeViewService){
		
		$scope.openModal = function(id, template){
			
			KyeeViewService.openModalFromUrl({
				id : id,
				url : template,
				scope : $scope
			});
		};
		
		$scope.hideModal = function(id){
			
			KyeeViewService.hideModal({
				id : id,
				scope : $scope
			});
		}
	})
	.build();