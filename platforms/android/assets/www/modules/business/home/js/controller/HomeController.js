new KyeeModule()
	.group("kyee.quyiyuan.home.controller")
	.require(["kyee.framework.service.view", 
	"kyee.framework.directive.compile", "kyee.framework.directive.slidebox", "kyee.framework.directive.sudoku", "kyee.quyiyuan.home.service", "kyee.framework.service.message", "kyee.quyiyuan.select_hospital.controller"])
	.type("controller")
	.name("HomeController")
	.params(["$scope", "KyeeViewService", "HomeService", "KyeeMessageService"])
	.action(function($scope, KyeeViewService, HomeService, KyeeMessageService){
		
		$scope.data = HomeService.getTestData();
		
		$scope.selectHospital = function(){
			
			KyeeViewService.openModalFromUrl({
				url : "modules/business/home/views/hospital_selector.html",
				scope : $scope
			});
		};
		
		$scope.showHospitalInfo = function(){
			
			KyeeViewService.openModalFromUrl({
				url : "modules/business/home/views/hospital_info.html",
				scope : $scope
			});
		};
		
		$scope.more = function(){
			alert();
		};
		
		$scope.open = function(template){
			
			KyeeViewService.openModalFromUrl({
				url : template,
				scope : $scope
			});
		};
	})
	.build();