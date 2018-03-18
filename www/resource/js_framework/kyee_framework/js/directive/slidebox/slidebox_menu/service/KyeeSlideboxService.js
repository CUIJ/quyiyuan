new KyeeModule()
    .group("kyee.framework.directive.slidebox.slidebox_menu.service")
    .type("service")
    .name("KyeeSlideboxService")
    .action(function(){

        var def = {

            /**
             * 数据格式转换
             */
            convert : function(data, perpage){

                //数据格式转换，转换为二维数据，以便于视图分页渲染
                var innerData = [];
                var row = [];
                for(var i = 0; i < data.length; i ++){

                    var item = data[i];

                    if(i != 0 && i % perpage == 0){

                        innerData.push(row);
                        row = [item];
                    }else{
                        row.push(item);
                    }
                }
                innerData.push(row);

                return innerData;
            }
        };

        return def;
    })
    .build();