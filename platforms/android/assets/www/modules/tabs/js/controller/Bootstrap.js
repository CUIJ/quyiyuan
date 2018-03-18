new KyeeApp()
	.name("kyee.framework.bootstrap")
	.home("/tabs/home")
	.controllers(["kyee.quyiyuan.config", "kyee.framework.base.cache", "kyee.quyiyuan.tabs.controller"])
	.hasSplashscreen(true)
	.build();