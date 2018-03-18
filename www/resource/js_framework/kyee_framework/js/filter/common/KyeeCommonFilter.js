/**
 * 常用过滤器
 */
new KyeeModule()
    .group("kyee.framework.filter.common")
    .type("filter")
    .name("kyee_to_html")
    .params(["$sce"])
    .action(function($sce){

        return function (input) {

            //如果为空时赋值空 html，否则在某些机型上内容无法正常展示
            if(input == null || input == ""){
                input = "&nbsp;";
            }

            return $sce.trustAsHtml(input);
        }
    })
    .build();