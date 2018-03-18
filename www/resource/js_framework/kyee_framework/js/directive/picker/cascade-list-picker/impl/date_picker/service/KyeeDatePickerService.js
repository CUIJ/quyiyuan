new KyeeModule()
    .group("kyee.framework.directive.picker.cascade_list_picker.impl.date_picker.service")
    .type("service")
    .name("KyeeDatePickerService")
    .action(function(){

        var def = {

            /**
             * 获取指定月份下的天数
             *
             * @param year
             * @param month
             * @returns {number}
             */
            getDayCount : function(year, month){

                if(month == 2){

                    return year % 4 == 0 ? 29 : 28;
                }
                if([1,3,5,7,8,10,12].indexOf(month) != -1){

                    return 31;
                }
                return 30;
            }
        };

        return def;
    })
    .build();