new KyeeModule()
    .group("kyee.quyiyuan.detailMap.service")
    .require([
        "kyee.framework.service.message",
        "kyee.framework.device.network",
        "kyee.quyiyuan.home.service"
    ])
    .type("service")
    .name("DetailMapService")
    .params(["HttpServiceBus", "$state", "CacheServiceBus", "KyeeMessageService", "HospitalSelectorService", "HomeService","KyeeI18nService"])
    .action(function (HttpServiceBus, $state, CacheServiceBus, KyeeMessageService, HospitalSelectorService, HomeService,KyeeI18nService) {
        var def = {
            myPoint:"",
            //使用ios外壳绘制地图
            deatDetailMap:function (data) {
                navigator.map.showDetailMap(data);
            },
            //销毁ios地图
            destoryIOSMap:function () {
                navigator.map.destoryDetailMap();
            }
        };
        return def;
    })
    .build();
