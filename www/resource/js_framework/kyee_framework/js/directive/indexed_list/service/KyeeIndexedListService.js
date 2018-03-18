new KyeeModule()
    .group("kyee.framework.directive.indexed_list.service")
    .type("service")
    .name("KyeeIndexedListService")
    .params(["$ionicScrollDelegate"])
    .action(function($ionicScrollDelegate){

        var def = {

            WORDS : ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'],

            //分组数据映射，数据结构为：
            //{ groupName : {upItemsCount(前面所有分组的记录条目总和), groupCount(分组索引)}}
            groupCountMapping : {},

            /**
             * 索引列表拖动时
             *
             * @param a
             */
            doIndexedBarDrag : function(evt, wordHeight){

                var me = this;
                var y = evt.gesture.center.pageY;

                //高亮索引条
                angular.element(document.getElementById("indexed_list_words_bar")).css("background-color", "#DDDDDD");

                //计算当前所处的字母
                var index = Math.round((y - 105) / wordHeight);
                //定义合法范围
                if(index >= 0 && index <= 25){

                    var word = me.WORDS[index];

                    angular.element(document.getElementById("indexed_list_curr_word")).css("display", "block");
                    angular.element(document.getElementById("indexed_list_curr_word")).css("top", (y - 70) + "px");
                    angular.element(document.getElementById("indexed_list_curr_word")).html(word);

                    var metadata = me.groupCountMapping[word];
                    if(metadata != undefined){

                        $ionicScrollDelegate.$getByHandle("indexed_list").scrollTo(0, metadata.upItemsCount * 28 + metadata.groupCount * 8, false);
                    }
                }
            },

            /**
             * 索引列表释放时
             */
            doIndexedBarRelease : function(){

                angular.element(document.getElementById("indexed_list_words_bar")).css("background-color", "white");
                angular.element(document.getElementById("indexed_list_curr_word")).css("display", "none");
            },

            /**
             * 索引列表单击时
             *
             * @param evt
             */
            doIndexedBarClick : function(evt, wordHeight){

                var me = this;
                var y = evt.clientY;

                //高亮索引条
                angular.element(document.getElementById("indexed_list_words_bar")).css("background-color", "#DDDDDD");

                //计算当前所处的字母
                var index = Math.round((y - 105) / wordHeight);
                //定义合法范围
                if(index >= 0 && index <= 25){

                    var word = me.WORDS[index];

                    angular.element(document.getElementById("indexed_list_curr_word")).css("display", "block");
                    angular.element(document.getElementById("indexed_list_curr_word")).css("top", (y - 70) + "px");
                    angular.element(document.getElementById("indexed_list_curr_word")).html(word);

                    var metadata = me.groupCountMapping[word];
                    if(metadata != undefined){

                        $ionicScrollDelegate.$getByHandle("indexed_list").scrollTo(0, metadata.upItemsCount * 28 + metadata.groupCount * 8, false);
                    }
                }

                //高亮 250ms 后消失
                setTimeout(function(){

                    angular.element(document.getElementById("indexed_list_words_bar")).css("background-color", "white");
                    angular.element(document.getElementById("indexed_list_curr_word")).css("display", "none");
                }, 250);
            }
        };

        return def;
    })
    .build();