/**
 * 页面效果类服务
 */
angular
	.module("kyee.framework.service.view.effect", [])
	.factory("KyeeEffectService", [function(){
		
		return {

			/**
			 * 单击类效果
			 */
			ClickEffect : {

				/**
				 * 添加单击效果
				 *
				 * @param cfg{
				 * 		onBefore : boolean function({top, left}),
				 * 		onFinish : function()
				 * }
				 */
				addCircleEffect : function(cfg){

					//绑定到 window 上，以便在 document.onclick 中访问
					window._KYEE_CIRCLE_EFFECT_CONFIG = cfg;
					document.onclick = function(evt){

						var config = window._KYEE_CIRCLE_EFFECT_CONFIG;

						var _event = evt || event;
						var left = _event.clientX;
						var top = _event.clientY;

						var isNext = true;
						if(config.onBefore != undefined){
							isNext = config.onBefore({
								left : left,
								top : top
							});
						}
						if(!isNext){
							return;
						}

						var id = "id_" + new Date().getTime();

						var div = document.createElement("div");
						div.setAttribute("class", "kyee-circle-effect-animate");
						div.setAttribute("id", id);
						div.style.width = 60 + "px";
						div.style.height = 60 + "px";
						div.style.position = "absolute";
						div.style.top = (top - 30) + "px";
						div.style.left = (left - 30) + "px";
						div.style.zIndex = 9999;
						document.body.appendChild(div);

						setTimeout(function(){

							var ele = document.getElementById(id);
							ele.parentNode.removeChild(ele);

							if(config.onFinish != undefined){
								config.onFinish();
							}
						}, 500);
					}
				},

				/**
				 * 移除单击效果
				 */
				removeCircleEffect : function(){

					document.onclick = null;
				}
			}
		};
}]);