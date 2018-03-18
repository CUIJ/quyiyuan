new KyeeModule()
    .group("kyee.framework.base.support.filter")
    .type("service")
    .name("FilterChainInvoker")
    .params(["KyeeMessageService", "FilterChainRegister"])
    .action(function(KyeeMessageService, FilterChainRegister){

        var def = {

            def : FilterChainRegister.getChains(),

            params : null,

            /**
             * 根据令牌判断该请求能否通过
             *
             * @param params
             * @returns {boolean}
             */
            isPass : function(params){

                var me = this;

                var def = me.def[params.id];
                if(def != undefined){

                    var passFlag = 0;
                    for(var i in def.chain){

                        var result = def.chain[i].test();

                        //如果令牌审核通过，则排除此过滤器
                        if(result){
                            passFlag ++;
                        }else{
                            return false;
                        }
                    }

                    return passFlag == def.chain.length;
                }

                return true;
            },

            /**
             * 执行过滤器链
             *
             * @param cfg
             */
            invokeChain : function(params){

                var me = this;

                me.params = params;

                var def = me.def[me.params.id];
                if(def != undefined){

                    //阻止页面跳转
                    //仅在拦截页面时拦截事件
                    if(me.params.event != undefined){
                        me.params.event.preventDefault();
                    }

                    //测试过滤器链中，哪些过滤器需要执行
                    var filters = [];
                    for(var i in def.chain){

                        var filter = def.chain[i];
                        var result = filter.test();
                        var token = result.token;

                        //如果令牌审核通过，则排除此过滤器
                        if(token == me.params.token){
                            continue;
                        }

                        if(!result){
                            filters.push(filter);
                        }
                    }

                    if(filters.length > 0){

                        me.doAction(filters, 0);
                    }else{

                        me.params.onFinash();
                    }
                }
            },

            /**
             * 过滤器动作执行
             *
             * @param filters
             */
            doAction : function(filters, pointer){

                var me = this;

                filters[pointer].run({
                    event : me.params.event,
                    token : me.params.token,
                    onFinash : function(){

                        pointer ++;
                        if(pointer < filters.length){

                            //判定完下一个过滤器的测试再决定下一步操作
                            var result = filters[pointer].test();
                            if(!result){
                                me.doAction(filters, pointer);
                            } else {
                                me.params.onFinash();
                            }

                        }else{

                            me.params.onFinash();
                        }
                    }
                });
            }
        };

        return def;
    })
    .build();