/**
 * 视图服务
 */
angular
	.module("kyee.framework.service.view", [])
	.factory("KyeeViewService", ["$ionicModal", "$ionicSideMenuDelegate", "$ionicTabsDelegate", "$ionicViewSwitcher", "$state", function($ionicModal, $ionicSideMenuDelegate, $ionicTabsDelegate, $ionicViewSwitcher, $state){
		
		return {

			/**
			 * 视图跳转
			 *
			 * @param state 跳转到的路由
			 * @param animate 是否使用动画（默认不显示动画）
			 */
			go : function(state, animate){

				var me = this;

				//默认不显示动画
				if(animate == undefined || animate == null || animate === false){
					$ionicViewSwitcher.nextTransition("none");
				}

				$state.go(state);
			},

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
					animation:  cfg.animation == undefined ? "slide-in-right" : cfg.animation
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
			},

			/**
			 * 判断快捷菜单是否开启
			 *
			 * @returns {boolean}
			 */
			isSideMenuOpened : function(){

				return $ionicSideMenuDelegate.isOpen();
			},

			/**
			 * 选择 tab 视图
			 *
			 * @param tabName
			 * @param index
			 */
			selectTabView : function(tabName, index){

				$ionicTabsDelegate.$getByHandle(tabName).select(index);
			}
		};
}]);