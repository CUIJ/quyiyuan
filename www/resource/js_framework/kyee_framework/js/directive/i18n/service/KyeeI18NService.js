new KyeeModule()
    .group("kyee.framework.directive.i18n.service")
    .type("service")
    .name("KyeeI18nService")
    .params(["$translate"])
    .action(function($translate){

        var def = {

            /**
             * 简体中文 key
             */
            SIMPLE_CHINESE_KEY : "zh_CN",

            /**
             * 使用指定语言
             *
             * @param lang
             */
            use : function(lang, rootScope){

                var me = this;

                //更新缓存值
                localStorage.setItem(_KyeeApp._cacheKey4Lang, lang);

                me.applyLookAndFeel(lang, rootScope);
                $translate.use(lang);
            },

            /**
             * 应用感官
             *
             * @param lang
             * @param rootScope
             */
            applyLookAndFeel : function(lang, rootScope){

                var me = this;

                var lookAndFeel = window._KyeeApp.i18nConfig.lookAndFeel;
                if(lookAndFeel != undefined && lookAndFeel[lang] != undefined){
                    rootScope.lookAndFeel = lookAndFeel[lang];
                }else{
                    rootScope.lookAndFeel = null;
                }
            },

            /**
             * 获取当前所使用的语种
             *
             * @returns {*}
             */
            getCurrLangName : function(){
                return $translate.use();
            },

            /**
             * 获取指定的值
             *
             * @param key
             * @param defaultValue
             * @param params
             * @returns {*}
             */
            get : function(key, defaultValue, params){

                var me = this;

                var currLang = me.getCurrLangName();

                //如果不是简体中文，并且取到的不是key，则返回翻译结果，否则返回默认值
                if(currLang != me.SIMPLE_CHINESE_KEY){
                    var result = $translate.instant(key, params);
                    if(result != key){
                        return result;
                    }
                }

                if(params != undefined && params != null){
                    for(var key in params){
                        defaultValue = defaultValue.replace(new RegExp("{{" + key + "}}","g"), params[key]);
                    }
                }
                return defaultValue;
            }
        };

        return def;
    })
    .build();