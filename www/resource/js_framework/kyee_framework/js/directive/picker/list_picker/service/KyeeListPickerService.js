new KyeeModule()
    .group("kyee.framework.directive.picker.list_picker.service")
    .type("service")
    .name("KyeeListPickerService")
    .params(["KyeeUtilsService"])
    .action(function(KyeeUtilsService){

        var def = {

            /**
             * 根据值获取条目
             *
             * @param data
             * @param value
             * @returns {*}
             */
            getItemByValue : function(data, value){

                for(var i in data){

                    var item = data[i];
                    if(item.value == value){
                        return item;
                    }
                }

                return null;
            },

            /**
             * 获取 checkbox 模式下所选择的列表
             *
             * @param data
             * @returns {Array}
             */
            getSelectedCheckboxItems : function(data){

                var me = this;

                var selected = [];
                for(var i in data){

                    var item = data[i];
                    if(item._kyee_checked != undefined && item._kyee_checked == true){
                        delete item["_kyee_checked"];
                        selected.push(item);
                    }
                }

                return selected;
            },

            /**
             * 显示选择器
             *
             * @param id
             */
            showPickerDom : function(id){

                var picker = angular.element(document.getElementById(id));
                var backdrop = angular.element(document.getElementById(id + "_backdrop"));

                picker.removeClass("kyee-framework-picker-down");
                picker.css("display", "block");
                picker.addClass("kyee-framework-picker-up");

                backdrop.removeClass("kyee-framework-picker-backdrop-up");
                backdrop.removeClass("kyee-framework-picker-backdrop-down");
                backdrop.css("opacity", 0.7);

                //picker 运行到 250ms 后开始 backdrop 动画
                setTimeout(function(){
                    backdrop.css("display", "block");
                    backdrop.addClass("kyee-framework-picker-backdrop-up");
                }, 250);
            },

            /**
             * 隐藏选择器
             *
             * @param id
             */
            hidePickerDom : function(id){

                var picker = angular.element(document.getElementById(id));
                var backdrop = angular.element(document.getElementById(id + "_backdrop"));

                picker.removeClass("kyee-framework-picker-up");
                picker.addClass("kyee-framework-picker-down");

                backdrop.removeClass("kyee-framework-picker-backdrop-up");
                backdrop.css("opacity", 0);
                backdrop.addClass("kyee-framework-picker-backdrop-down");

                //500ms 后 backdrop 隐藏
                setTimeout(function(){
                    backdrop.css("display", "none");
                }, 500);

                //550ms 后 picker 隐藏
                setTimeout(function(){
                    picker.css("display", "none");
                }, 550);
            },

            /**
             * 计算组件位置信息
             *
             * @returns {{width: number, left: number}}
             */
            calcPosi : function(){

                var me = this;

                if(!KyeeUtilsService.isPad()){
                    return {
                        width : "100%",
                        left : "0"
                    };
                }

                //计算组件应展示的宽度
                //如果是手机，则左右保留 10px 的边距
                var width = KyeeUtilsService.getInnerSize().width - 20;
                if(KyeeUtilsService.isPad()){
                    width = 400;
                }

                var left = KyeeUtilsService.getInnerSize().width / 2 - (width / 2);

                return {
                    width : width + "px",
                    left : left + "px"
                };
            }
        };

        return def;
    })
    .build();