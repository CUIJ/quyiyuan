new KyeeModule()
    .group("kyee.framework.base.env")
    .type("service")
    .name("KyeeEnv")
    .params(["KyeeUtilsService"])
    .action(function(KyeeUtilsService){

        var def = {

            /**
             * 当前运行平台
             * <br/>
             * 可能值为：android,ios
             */
            PLATFORM : ionic.Platform.platform(),

            /**
             * 是否运行在设备内
             */
            IS_IN_DEVICE : null,

            /**
             * $rootScope 对象
             */
            ROOT_SCOPE : null,

            /**
             * 初始化 rootScope 级别变量
             *
             * @param rootScope
             */
            initScopeEnv : function(rootScope){

                var me = this;

                me.ROOT_SCOPE = rootScope;

                rootScope.KyeeEnv = {
                    innerSize : KyeeUtilsService.getInnerSizeForDevice(),
                    innerSizeSource : KyeeUtilsService.getInnerSize()
                };
            }
        };

        return def;
    })
    .build();