/**
 * 路由配置
 */
new KyeeModule()
	.group("kyee.quyiyuan.config")
	.type("provider")
	.name("RouterConfig")
	.action(function(){
		
		var def = {
			
			"tabs" : {
				url: "/tabs",
				abstract: true,
				templateUrl: "modules/tabs/index.html",
				controller : "TabsController"
			},
			
			"tabs.home" : {
				url: "/home", 
				views: {
					"home-tab": {
						templateUrl: "modules/business/home/index.html",
						controller : "HomeController"
					}
				}
			},
			
			"tabs.more" : {
				url: "/more",
				views: {
				  "home-tab": {
					  templateUrl: "modules/business/home/views/more.html",
					  controller : "HomeController"
				  }
				}
			}
		};
		
		this.getDef = function(){
			return def;
		};
		
		this.$get = function(){
			return {};
		}
	})
	.build();