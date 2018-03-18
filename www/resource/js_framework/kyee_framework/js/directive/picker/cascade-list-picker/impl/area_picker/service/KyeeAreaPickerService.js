new KyeeModule()
    .group("kyee.framework.directive.picker.cascade_list_picker.impl.area_picker.service")
    .type("service")
    .name("KyeeAreaPickerService")
    .action(function(){

        var def = {

            /**
             * 过滤数据
             *
             * @param raw
             * @param allow
             * @returns {Array}
             */
            filter : function(raw, allow){

                var result = [];
                for(var i in raw){

                    var rawRecord = raw[i];
                    for(var j in allow){

                        var allowRecord = allow[j];
                        if(rawRecord.value == allowRecord){
                            result.push(rawRecord);
                        }
                    }
                }

                return result;
            }
        };

        return def;
    })
    .build();