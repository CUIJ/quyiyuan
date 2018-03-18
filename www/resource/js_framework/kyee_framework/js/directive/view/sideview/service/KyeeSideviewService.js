new KyeeModule()
    .group("kyee.framework.directive.view.sideview.service")
    .type("service")
    .name("KyeeSideviewService")
    .params([])
    .action(function(){

        var def = {

            /**
             * 激活指定 id 的 tab
             *
             * @param tabId
             * @param scope
             */
            activeTab : function(tabId, scope){

                if(tabId != null){

                    for(var i in scope.config){

                        var item = scope.config[i];

                        item.activeTabColor = null;
                        if(item.id == tabId){
                            scope.config[i].activeTabColor = scope.activeTabColor;
                            scope.template = item.template;
                        }
                    }
                }
            }
        };

        return def;
    })
    .build();