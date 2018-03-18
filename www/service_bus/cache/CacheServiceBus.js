new KyeeModule()
	.group("kyee.quyiyuan.service_bus.cache")
	.require(["kyee.framework.service.utils.cache.base"])
	.type("service")
	.name("CacheServiceBus")
	.params(["KyeeCacheService"])
	.action(function(KyeeCacheService){

		return KyeeCacheService;
	})
	.build();