new KyeeModule()
	.group("kyee.quyiyuan.select_hospital.controller")
	.require(["kyee.framework.service.view", "kyee.quyiyuan.home.service", "kyee.framework.service.message"])
	.type("controller")
	.name("SelectHospitalController")
	.params(["$scope", "KyeeViewService", "HomeService", "KyeeMessageService"])
	.action(function($scope, KyeeViewService, HomeService, KyeeMessageService){
		
		$scope.close = function(){
			
			KyeeViewService.hideModal({
				scope : $scope
			});
		}
	})
	.build();