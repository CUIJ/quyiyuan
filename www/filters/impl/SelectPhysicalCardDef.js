/**
 * 产品名称：quyiyuan
 * 创建者：程志
 * 创建时间：2015年12月14日09:30:50
 * 创建原因：KYEEAPPTEST-3174,选择物理卡拦截器,就诊卡充值只支持物理卡
 */
new KyeeModule()
    .group("kyee.quyiyuan.filters.impl.selectPhysicalCard")
    .type("service")
    .name("SelectPhysicalCardDef")
    .params(["CacheServiceBus", "KyeeMessageService", "$state", "KyeeViewService","QueryHisCardService","LoginService", "KyeeI18nService"])
    .action(function(CacheServiceBus, KyeeMessageService, $state, KyeeViewService, QueryHisCardService, LoginService, KyeeI18nService){

        var def = {
            params : null,
            isUnFinash : false,
            token : null,

            /**
             * 获取简短描述
             * @returns {string}
             */
            getShortname : function(){
                return KyeeI18nService.get("commonText.selectCardTips","选择就诊卡");
            },

            /**
             * 获取测试
             * @returns {boolean}
             */
            test : function(){
                var currentCardInfo = CacheServiceBus.getMemoryCache().get('currentCardInfo');
                //如果是虚拟卡,拦截
                if(currentCardInfo && currentCardInfo.USER_VS_ID&& currentCardInfo.CARD_NO != currentCardInfo.VCARD_NO){
                    return true;
                }else{
                    return false;
                }
            },

            /**
             * 执行过滤器
             * @param params
             */
            run : function(params){
                var me = this;
                me.params = params;
                me.isUnFinash = true;
                me.isFromFiler = true;
                me.doFilter();
            },

            /**
             * 执行过滤器
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