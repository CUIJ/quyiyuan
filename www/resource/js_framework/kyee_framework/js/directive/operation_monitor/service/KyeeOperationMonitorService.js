/**
 * 用户操作监控服务
 */
new KyeeModule()
    .group("kyee.framework.directive.operation_monitor.service")
    .type("service")
    .name("KyeeOperationMonitorService")
    .action(function(){

        var def = {

            /**
             * 监控用户操作所使用的服务名称
             */
            monitorServiceName : null,

            /**
             * 监控用户操作所使用的方法名称
             */
            monitorMethodName : null

        };

        return def;
    })
    .build();