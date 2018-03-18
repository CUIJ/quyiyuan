/**
 * 消息服务
 */
angular
	.module("kyee.framework.service.view", ["ionic"])
	.factory("KyeeViewService", ["$ionicModal", "$ionicSideMenuDelegate", function($ionicModal, $ionicSideMenuDelegate){
		
		return {

			/**
			 * 从地址打开模式对话框
			 *
			 * @param cfg{
			 * 	url : 地址，
			 * 	scope : $scope,
			 * 	animation : 过渡样式(slide-in-up,slide-in-right,scale-in)
			 * }
			 */
			openModalFromUrl : function(cfg){
				
				$ionicModal.fromTemplateUrl(cfg.url, {
					scope: cfg.scope,
					animation: cfg.animation == undefined ? "slide-in-right" : cfg.animation
				}).then(function(modal) {
					
					if (cfg.scope._kyee_framwwork_modal == undefined) {
						cfg.scope._kyee_framwwork_modal = [];
					}
					
					cfg.scope._kyee_framwwork_modal.push(modal);
					modal.show();
				});
			},

			/**
			 * 隐藏模式对话框
			 *
			 * @param cfg{
			 * 	scope : $scope
			 * }
			 */
			hideModal : function(cfg){
				
				var modal = null;
				if (cfg.scope._kyee_framwwork_modal != undefined && (modal = cfg.scope._kyee_framwwork_modal.pop()) != null){
					
					modal.hide();
				}
			},

			/**
			 * 移除模式对话框
			 *
			 * @param cfg
			 */
			removeModal : function(cfg){

				var modal = null;
				if (cfg.scope._kyee_framwwork_modal != undefined && (modal = cfg.scope._kyee_framwwork_modal.pop()) != null){

					modal.remove();
				}
			},

			/**
			 * 折叠或显示边缘菜单
			 *
			 * @param dir string 菜单方位(LEFT,RIGHT)
			 * @param status boolean 开启或关闭
			 */
			toggleSideMenu : function(cfg){
				
				if (cfg.direction == "LEFT") {
					$ionicSideMenuDelegate.toggleLeft(cfg.status);
				}else if (cfg.direction == "RIGHT") {
					$ionicSideMenuDelegate.toggleRight(cfg.status);
				}
			}
		};
}]);