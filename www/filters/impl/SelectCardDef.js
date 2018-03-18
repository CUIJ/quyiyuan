/**
 * 产品名称：quyiyuan
 * 创建者：章剑飞
 * 创建时间：2015年6月4日10:51:50
 * 创建原因：选择就诊者拦截器
 * 修改者：
 * 修改原因：
 */
new KyeeModule()
    .group("kyee.quyiyuan.filters.impl.selectCard")
    .type("service")
    .name("SelectCardDef")
    .params(["CacheServiceBus", "KyeeMessageService", "$state", "KyeeViewService","QueryHisCardService","LoginService", "KyeeI18nService"])
    .action(function(CacheServiceBus, KyeeMessageService, $state, KyeeViewService, QueryHisCardService, LoginService, KyeeI18nService){

        var def = {

            params : null,

            isUnFinash : false,

            token : null,

            /**
             * 获取简短描述
             *
             * @returns {string}
             */
            getShortname : function(){

                return KyeeI18nService.get("commonText.selectCardTips","选择就诊卡");
            },

            /**
             * 获取测试
             *
             * @returns {boolean}
             */
            test : function(){

                //提供选择就诊者过滤器（公共） zhangjiahao KYEEAPPC-4459
                var currentCardInfo = CacheServiceBus.getMemoryCache().get('currentCardInfo');
                if(currentCardInfo && currentCardInfo.USER_VS_ID){
                    return true;
                }else{
                    return false;
                }
            },

            /**
             * 执行过滤器
             *
             * @param params
             */
            run : function(params){

                var me = this;

                KyeeMessageService.confirm({
                    title: KyeeI18nService.get("commonText.warmTipMsg","温馨提示"),
                    content: KyeeI18nService.get("commonText.selectCardMsg","该项业务需要您先添加就诊卡信息"),
                    okText: KyeeI18nService.get("commonText.selectOk","前往添加"),
                    cancelText: KyeeI18nService.get("commonText.selectCancel","以后再说"),
                    onSelect: function (res) {
                        if (res) {


                            me.params = params;
                            me.isUnFinash = true;
                            me.isFromFiler = true;
                            me.doFilter();
                        }
                    }
                });
            },

            /**
             * 执行过滤器
             *
             * @param params
             * @returns {boolean}
             */
            doFilter : function(){
                $state.go("patient_card_select");
            },

            /**
             * 执行完成，如果需要
             */
            doFinashIfNeed : function(params){

                var me = this;

                if(me.isUnFinash && me.test()){

                    if(params != undefined){

                        if(params.onBefore != undefined){
                            params.onBefore();
                        }
                    }

                    me.token = me.params.token;
                    me.isUnFinash = false;
                    me.params.onFinash();
                }
            }
        };

        return def;
    })
    .build();