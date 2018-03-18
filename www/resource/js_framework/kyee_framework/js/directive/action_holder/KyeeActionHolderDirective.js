angular.module("kyee.framework.directive.action_holder", ["ngSanitize"])
	.directive("kyeeActionHolderDirective", ["$state", "$compile", "KyeeActionHolderDelegate", function ($state, $compile, KyeeActionHolderDelegate) {

		var def = {
			restrict : "A",
			priority: 500,
			scope : {
				kyeeActionHolderDirective : "@"
			},
			link : function(scope, element, attrs){

				//当前路由名称
				var stateId = $state.current.name;
				var shortId = attrs.kyeeActionHolderDirective;
				var fullId = "quyiyuan$" + stateId + "$" + shortId;
				var ngClick = attrs.ngClick;

				//插入 id 属性
				element.attr("id", fullId);
				element.removeAttr("kyee-action-holder-directive");

				//获取该元素的配置
				var action = KyeeActionHolderDelegate.findElementConfig(shortId);

				//如果该元素已配置标签，但无权限配置数据，则放弃执行
				if(action == null){
					return;
				}

				if(action.type == "HIDDEN"){

					element.css("display", "none");
				}else if(action.type == "DISABLE"){

					//配合禁用样式，因为如果 disabled 后将不再响应 click 事件
					element.css("opacity", 0.5);
				}
			}
		};

		return def;
	}]);