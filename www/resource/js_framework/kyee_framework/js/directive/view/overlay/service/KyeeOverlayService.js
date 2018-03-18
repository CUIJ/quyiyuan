new KyeeModule()
    .group("kyee.framework.directive.view.overlay.service")
    .type("service")
    .name("KyeeOverlayService")
    .params(["KyeeUtilsService"])
    .action(function(KyeeUtilsService){

        var def = {

            screenSize : KyeeUtilsService.getInnerSize(),

            /**
             * 显示浮动层
             *
             * @param id
             */
            showOverlayDom : function(id, location, animate){

                var picker = angular.element(document.getElementById(id));
                var backdrop = angular.element(document.getElementById(id + "_backdrop"));

                if(animate === "true"){

                    //删除所有可能的动画类
                    picker.removeClass("kyee-framework-overlay-left-hide");
                    picker.removeClass("kyee-framework-overlay-right-hide");
                    picker.removeClass("kyee-framework-overlay-top-hide");
                    picker.removeClass("kyee-framework-overlay-bottom-hide");
                    picker.removeClass("kyee-framework-overlay-center-hide");

                    picker.css("display", "block");
                    picker.addClass("kyee-framework-overlay-" + location + "-show");

                    backdrop.removeClass("kyee-framework-overlay-backdrop-show");
                    backdrop.removeClass("kyee-framework-overlay-backdrop-hide");
                    backdrop.css("opacity", 0.7);

                    //picker 运行到 250ms 后开始 backdrop 动画
                    setTimeout(function(){
                        backdrop.css("display", "block");
                        backdrop.addClass("kyee-framework-overlay-backdrop-show");
                    }, 250);
                }else{
                    picker.css("display", "block");
                    backdrop.css("display", "block");
                }
            },

            /**
             * 隐藏浮动层
             *
             * @param id
             */
            hideOverlayDom : function(id, location, animate){

                var picker = angular.element(document.getElementById(id));
                var backdrop = angular.element(document.getElementById(id + "_backdrop"));

                if(animate === "true"){

                    //删除所有可能的动画类
                    picker.removeClass("kyee-framework-overlay-left-show");
                    picker.removeClass("kyee-framework-overlay-right-show");
                    picker.removeClass("kyee-framework-overlay-top-show");
                    picker.removeClass("kyee-framework-overlay-bottom-show");
                    picker.removeClass("kyee-framework-overlay-center-show");

                    picker.addClass("kyee-framework-overlay-" + location + "-hide");

                    backdrop.removeClass("kyee-framework-overlay-backdrop-show");
                    backdrop.css("opacity", 0);
                    backdrop.addClass("kyee-framework-overlay-backdrop-hide");

                    //500ms 后 backdrop 隐藏
                    setTimeout(function(){
                        backdrop.css("display", "none");
                    }, 500);

                    //600/550 ms 后 picker 隐藏
                    //对于 center 类 overlay，动画周期为 550ms，其他均为 600ms
                    setTimeout(function(){
                        picker.css("display", "none");
                    }, location == "center" ? 550 : 600);
                }else{
                    setTimeout(function(){
                        backdrop.css("display", "none");
                        picker.css("display", "none");
                    }, 500);
                }
            },

            /**
             * 动态计算 overlay 大小以及显示方位
             */
            calcSizeAndPosition : function($scope){

                var me = this;

                $scope.widthCpy = angular.copy($scope.width);
                $scope.heightCpy = angular.copy($scope.height);
                $scope.topCpy = angular.copy($scope.top);
                $scope.leftCpy = angular.copy($scope.left);

                if($scope.location == "left"){

                    if($scope.width == undefined){
                        //右方保留 50px 间隙
                        $scope.widthCpy = me.screenSize.width - 50;
                    }
                    if($scope.height == undefined){
                        $scope.heightCpy = me.screenSize.height;
                    }
                    if($scope.top == undefined){
                        $scope.topCpy = me.screenSize.height / 2 - $scope.heightCpy / 2;
                    }
                    if($scope.left == undefined){
                        $scope.leftCpy = 0;
                    }
                }else if($scope.location == "right"){

                    if($scope.width == undefined){
                        //左方保留 50px 间隙
                        $scope.widthCpy = me.screenSize.width - 50;
                    }
                    if($scope.height == undefined){
                        $scope.heightCpy = me.screenSize.height;
                    }
                    if($scope.top == undefined){
                        $scope.topCpy = me.screenSize.height / 2 - $scope.heightCpy / 2;
                    }
                    if($scope.left == undefined){
                        $scope.leftCpy = me.screenSize.width - $scope.widthCpy;
                    }
                }else if($scope.location == "bottom"){

                    if($scope.width == undefined){
                        $scope.widthCpy = me.screenSize.width;
                    }
                    if($scope.height == undefined){
                        $scope.heightCpy = me.screenSize.height / 2;
                    }
                    if($scope.top == undefined){
                        $scope.topCpy = me.screenSize.height - $scope.heightCpy;
                    }
                    if($scope.left == undefined){
                        $scope.leftCpy = me.screenSize.width / 2 - $scope.widthCpy / 2;
                    }
                }else if($scope.location == "top"){

                    if($scope.width == undefined){
                        $scope.widthCpy = me.screenSize.width;
                    }
                    if($scope.height == undefined){
                        $scope.heightCpy = me.screenSize.height / 2;
                    }
                    if($scope.top == undefined){
                        $scope.topCpy = 0;
                    }
                    if($scope.left == undefined){
                        $scope.leftCpy = me.screenSize.width / 2 - $scope.widthCpy / 2;
                    }
                }else if($scope.location == "center"){

                    if($scope.width == undefined){
                        //左右两侧各保留 50px 间隙
                        $scope.widthCpy = me.screenSize.width - 50 * 2;
                    }
                    if($scope.height == undefined){
                        $scope.heightCpy = me.screenSize.height / 2;
                    }
                    if($scope.top == undefined){
                        $scope.topCpy = me.screenSize.height / 2 - $scope.heightCpy / 2;
                    }
                    if($scope.left == undefined){
                        $scope.leftCpy = me.screenSize.width / 2 - $scope.widthCpy / 2;
                    }
                }
            }
        };

        return def;
    })
    .build();