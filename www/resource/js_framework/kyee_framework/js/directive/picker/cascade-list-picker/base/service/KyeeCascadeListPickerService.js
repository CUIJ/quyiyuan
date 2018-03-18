new KyeeModule()
    .group("kyee.framework.directive.picker.cascade_list_picker.base.service")
    .type("service")
    .name("KyeeCascadeListPickerService")
    .params(["KyeeUtilsService"])
    .action(function(KyeeUtilsService){

        var def = {

            /**
             * 数据转换
             *
             * @param originalData
             */
            convertData : function(originalData){

                var data = {};
                if(originalData != null){

                    for(var i in originalData){

                        var record = originalData[i];

                        //为每个分组的数据集合中添加一条占位记录
                        //仅能添加一次
                        if(record.items != undefined && record.items.length > 0) {

                            var lastItem = record.items[record.items.length - 1];
                            if (lastItem != undefined && lastItem.value != "KYEE_PLACEHOLDER_ITEM") {

                                record.items.push({
                                    text: "-",
                                    value: "KYEE_PLACEHOLDER_ITEM"
                                });
                            }
                        }

                        data[record.groupIndex] = record.items;
                    }
                }

                return data;
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
                    width : (width+"px"),
                    left : (left+"px")
                };
            }
        };

        return def;
    })
    .build();