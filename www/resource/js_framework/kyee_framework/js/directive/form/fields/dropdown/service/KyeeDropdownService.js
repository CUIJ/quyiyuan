new KyeeModule()
    .group("kyee.framework.directive.form.fields.dropdown.service")
    .type("service")
    .name("KyeeDropdownService")
    .params(["KyeeFrameworkConfig", "$compile", "$ionicScrollDelegate", "KyeeMessagerService"])
    .action(function(KyeeFrameworkConfig, $compile, $ionicScrollDelegate, KyeeMessagerService){

        var def = {

            //保存所有 combobox 的配置信息
            //结构为：{combobox_id : {...}}
            config : {},

            /**
             * 初始化模板
             */
            initTemplate : function(config){

                var me = this;

                var dropdown = me.getDropdownEle(config.id + "_dropmenu");
                if(dropdown == undefined || dropdown == null || dropdown.length == 0){

                    KyeeMessagerService.send({
                        type : "GET",
                        url : KyeeFrameworkConfig.KYEE_FRAMEWORK_BASE_PATH + "js/directive/form/fields/dropdown/templates/dropdown.html",
                        onSuccess : function(data){

                            angular.element(document.body).append(data.replace("DROPMENU_ID", config.id + "_dropmenu"));
                        }
                    });
                }
            },

            /**
             * 初始化获得焦点事件
             *
             * @param id
             */
            initFocusEvent : function(){

                var me = this;

                window.onKyeeframeworkComboboxFocus = function(id){

                    var config = me.config[id];

                    config.disableBlurEvent = false;

                    var inputDom = document.getElementById(config.id);
                    var dropdown = me.getDropdownEle(config.id + "_dropmenu");
                    //BUG 仅考虑滚动容器为 ion-content 的情况
                    var parentScrollHeight = $ionicScrollDelegate.getScrollPosition().top;

                    dropdown.css({
                        "display" : "block",
                        "top" : (inputDom.offsetTop - parentScrollHeight + inputDom.offsetHeight + 45 + parseInt(config.offsetTop)) + "px",
                        "left" : inputDom.offsetLeft + parseInt(config.offsetLeft) + "px",
                        "width" : inputDom.offsetWidth + "px"
                    });

                    if(!config.isCompiled){
                        $compile(dropdown.contents())(config.scope);
                        config.isCompiled = true;
                    }
                };
            },

            /**
             * 初始化失去焦点事件
             */
            initBlurEvent : function(){

                var me = this;

                window.onKyeeframeworkComboboxBlur = function(id){

                    var config = me.config[id];

                    if(!config.disableBlurEvent){
                        me.getDropdownEle(config.id + "_dropmenu").css("display", "none");
                    }
                };
            },

            /**
             * 获取 dropdown 元素
             *
             * @returns {*}
             */
            getDropdownEle : function(dropmenuId){

                return angular.element(document.getElementById(dropmenuId));
            }
        };

        return def;
    })
    .build();