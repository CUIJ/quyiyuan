/**
 * 元素元素执行器
 * <br/>
 * 注意：每个 pageId 只能出现一次
 */
angular
    .module("kyee.framework.directive.action_holder.delegate", [])
    .factory("KyeeActionHolderDelegate", ["$state", "$cacheFactory", "KyeeMessageService", "CacheServiceBus", "KyeeEnv", "KyeeFrameworkConfig", "KyeeI18nService", function($state, $cacheFactory, KyeeMessageService, CacheServiceBus, KyeeEnv, KyeeFrameworkConfig, KyeeI18nService) {

        var def = {

            //所使用的 storage cache key
            cacheKey : null,

            data : null,

            /**
             * action 映射对象
             * <br/>
             * 注意：
             * 此映射数据默认为空，当元素首次执行样式扫描时自动添加到此映射表，以便于 invokeAction 的快速访问（invokeStyle 总是先于 invokeAction 执行）
             * <br/>
             * 其中：
             * key：元素完整 id，
             * value：此元素的 action 描述
             */
            actionMappingCahe : $cacheFactory("kyee.action_holder.cache", {capacity: 500}),

            /**
             * 初始化
             */
            init : function(cfg){

                var me = this;

                me.cacheKey = cfg.cacheKey;
            },

            /**
             * 刷新数据
             */
            refreshData : function(){

                var me = this;

                var config = CacheServiceBus.getStorageCache().get(me.cacheKey);
                if(config != null){

                    me.data = config;

                    //清空缓存
                    me.actionMappingCahe.removeAll();
                }
            },

            /**
             * 执行动作拦截
             *
             * @param evt
             */
            invokeAction : function(evt){

                var me = def;
                var eleId = null;

                //手动单击
                if(evt.currentTarget != undefined){

                    //手动单击，则包含 currentTarget 元素
                    eleId = evt.currentTarget.id;

                    //获取此元素 action 配置，由于 kyeeActionHolderDirective 总是先于此方法的执行，因此如果缓存中没有，则必然此元素没有配置权限数据
                    var action = me.actionMappingCahe.get(eleId);
                    if(action != undefined){

                        var type = action.type;

                        if(type == "DISABLE"){

                            KyeeMessageService.message({
                                content : action.message
                            });

                            return true;
                        }

                        if(type == "ALERT"){

                            KyeeMessageService.message({
                                content : action.content
                            });

                            return false;
                        }

                        if(type == "CONFIRM"){

                            //协议条款
                            KyeeEnv.ROOT_SCOPE.kyee_action_holder_confirm_message = action.content;

                            //标记不弹出条款的元素  By  章剑飞  KYEEAPPTEST-2758
                            var target = ["quyiyuan$hospital->MAIN_TAB$shortcuts_to_appoint","quyiyuan$hospital->MAIN_TAB$shortcuts_to_regist",
                                "quyiyuan$home->MAIN_TAB$shortcuts_to_appoint","quyiyuan$home->MAIN_TAB$shortcuts_to_regist"];
                            if(target.indexOf(eleId) != -1){
                                //如果为标记中的元素则不弹出条款，直接进入模块  By  章剑飞  KYEEAPPTEST-2758
                                setTimeout(function(){
                                    angular.element(document.getElementById(eleId)).triggerHandler("click");
                                }, 10);
                                return true;
                            }

                            var dialog = KyeeMessageService.dialog({
                                title : KyeeI18nService.get("commonText.agreementTitle","协议条款"),
                                template : KyeeFrameworkConfig.KYEE_FRAMEWORK_BASE_PATH + "js/directive/action_holder/templates/confirm_dialog.html",
                                scope : KyeeEnv.ROOT_SCOPE,
                                buttons : [
                                    {
                                        text : KyeeI18nService.get("commonText.cancelMsg","取消"),
                                        click : function(){

                                            dialog.close();
                                        }
                                    },
                                    {
                                        text : KyeeI18nService.get("commonText.ensureMsg","确定"),
                                        style : "kyee_framework_message_dialog_ok_button",
                                        click : function(){

                                            dialog.close();

                                            setTimeout(function(){
                                                angular.element(document.getElementById(eleId)).triggerHandler("click");
                                            }, 10);
                                        }
                                    }
                                ]
                            });

                            return true;
                        }
                    }

                    return false;
                }else{

                    //模拟单击
                    //模拟单击，无 currentTarget 属性，使用 target 属性
                    eleId = evt.target.id;

                    return false;
                }
            },

            /**
             * 查找指定元素配置
             *
             * @param id
             * @returns {*}
             */
            findElementConfig : function(id){

                var me = this;

                //首次初始化数据
                if(me.data == null){
                    me.refreshData();
                }

                //当前路由名称
                var stateId = $state.current.name;
                //完整 id
                var fullId = "quyiyuan$" + stateId + "$" + id;

                //优先从缓存中取此元素的 action，如果没有，则遍历数据
                var targetEleAction = me.actionMappingCahe.get(fullId);
                if(targetEleAction != undefined){

                    return targetEleAction;
                }

                for(var i in me.data){

                    var page = me.data[i];

                    //确定所在 page
                    if(page.id.replace("#", "->") != stateId){
                        continue;
                    }

                    for(var j in page.items){

                        var ele = page.items[j];

                        if(ele != undefined && ele != null && ele.id == id){

                            var action = ele.action;

                            //将此元素存储到映射缓存
                            me.actionMappingCahe.put(fullId, action);

                            return action;
                        }
                    }
                }

                return null;
            }
        };

        return def;
    }]);