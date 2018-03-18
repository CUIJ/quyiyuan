new KyeeModule()
	.group("kyee.quyiyuan.home.service")
	.type("service")
	.name("HomeService")
	.action(function(){
		
		var def = {
			
			getTestData : function(){
				
				return data;
			}
		};
		
		return def;
	})
	.build();