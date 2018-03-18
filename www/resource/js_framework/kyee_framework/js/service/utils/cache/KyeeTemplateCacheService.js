/**
 * 模板缓存服务
 */
angular
	.module("kyee.framework.service.utils.cache.template_cache", ["kyee.framework.service.messager"])
	.factory("KyeeTemplateCacheService", ["KyeeMessagerService", function(KyeeMessagerService){
		
		var def = {
			
			cacheTemplateList : [],
			
			cacheData : [],
			
			setTemplates : function(list){
				
				var me = this;
				
				me.cacheTemplateList = list;
				
				return me;
			},
			
			build : function(){
				
				var me = this;
				
				if (me.cacheTemplateList != null) {
					
					//擦除 cache
					me.cacheData = [];
					
					for(var i in me.cacheTemplateList){
						
						var item = me.cacheTemplateList[i];
						
						KyeeMessagerService.send({
							type : "GET",
							url : item.path,
							onSuccess : function(data){
								
								me.cacheData.push({
									key : item.key,
									data : data
								});
							}
						});
					}
				}
			},
			
			get : function(key){
				
				var me = this;
								
				for(var i in me.cacheData){
					
					var item = me.cacheData[i];
					if (key == item.key) {
						return item;
					}
				}
				
				return null;
			}
		};
		
		return def;
	}]);