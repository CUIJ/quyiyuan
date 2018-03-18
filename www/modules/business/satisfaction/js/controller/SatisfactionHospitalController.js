/**
 * 产品名称：quyiyuan.
 * 创建用户：姚斌
 * 日期：2015年5月5日11:06:54
 * 创建原因：医院评价页面控制器
 *
 * 修改人：姚斌 修改时间：2015年7月13日14:40:47
 * 任务号：KYEEAPPTEST-2708 修改原因：满意度模块，提交评价，内容显示不稳定
 *  修改人：张明 修改时间：2015年12月02日14:37:22
 * 任务号：KYEEAPPC-4387 修改原因：提示信息修改
 */
new KyeeModule()
    .group("kyee.quyiyuan.satisfaction.satisfactionHospital.controller")
    .require([])
    .type("controller")
    .name("SatisfactionHospitalController")
    .params(["$scope", "$state",'$location', '$anchorScroll', "KyeeMessageService",
        "SatisfactionHospitalService", "SatisfactionDoctorService",
        "KyeeUtilsService","KyeeI18nService"])
    .action(function($scope, $state,$location, $anchorScroll, KyeeMessageService,
                     SatisfactionHospitalService, SatisfactionDoctorService,
                     KyeeUtilsService,KyeeI18nService){

        // 初始化页面数据
        $scope.data = SatisfactionHospitalService.data;

        // 初始化页面评价文字内容数据
        $scope.suggestInfo = {};
        $scope.suggestInfo.suggest = '';
        $scope.placeTxt =KyeeI18nService.get('satisfaction_menu.satisfaction_hospital.hos_placeTxt', '  请输入评论内容！', null);

        /**
         * 星号点击事件
         * @param index
         * @param score
         */
        $scope.starClick = function (index, score) {
            if(SatisfactionHospitalService.data.IS_SCORE == 0){
                $scope.items[index].SCORE_VALUE = score;
                SatisfactionHospitalService.pageData.items = $scope.items;
            }
        };

        if(SatisfactionHospitalService.data.IS_SCORE == 0){
            // 如果未评价则获取待评价项目
            SatisfactionHospitalService.querySurveyData(
                SatisfactionHospitalService.data.HOSPITAL_ID,
                function(data){
                    $scope.items = data;
                    SatisfactionHospitalService.pageData = {};
                    SatisfactionHospitalService.pageData.items = $scope.items;
            })
        } else {
            // 如果已评价则获取已评价数据
            SatisfactionHospitalService.querySatisfactionData(
                SatisfactionHospitalService.data.HOSPITAL_ID,
                SatisfactionHospitalService.data.REG_ID,
                function(data){
                    $scope.items = data.ITEM_SCORES;
                    $scope.data.SUGGEST_TIME = data.SUGGEST_TIME;
                    $scope.suggestInfo.suggest = data.SUGGEST_VALUE ? data.SUGGEST_VALUE:KyeeI18nService.get('satisfaction_menu.satisfaction_hospital.hos_wuPingjiaTxt', '无评论内容！', null);
                    $scope.SUGGEST_SCORE = data.SUGGEST_SCORE;
                    $scope.SUGGEST_TIME = $scope.data.SUGGEST_TIME;
            })
        }

        /**
         * 保存评价函数
         */
        $scope.saveSuggest = function () {
            var postdata = $scope.data;
            postdata.ITEM_SCORES = $scope.items;
            postdata.OTHER = $scope.suggestInfo.suggest;
            SatisfactionHospitalService.saveSatisfactionData(
                postdata,
                function(data){
                    SatisfactionHospitalService.data.IS_SCORE = 1;
                    SatisfactionHospitalService.data.SUGGEST_TIME = KyeeUtilsService.DateUtils.getDate();
                    KyeeMessageService.message({
                        title: KyeeI18nService.get('commonText.warmTipMsg', '温馨提示', null),
                        okText: KyeeI18nService.get("commonText.iknowMsg", "我知道了"),
                        content: KyeeI18nService.get('satisfaction_menu.satisfaction_hospital.hos_pingLunTiJiaoOk', '您已成功完成对医院的评价！', null)
                    });

                    //评价完成后显示整体评价
                    if($scope.items.length){
                        $scope.SUGGEST_SCORE = data.data;
                    }
                })
        };
        /**
         * 计算医院评价分数函数
         */
        $scope.calculateScore=function(){
            var postdata = $scope.data;
            postdata.ITEM_SCORES = $scope.items;
            postdata.OTHER = $scope.suggestInfo.suggest;
            var hosptialId=SatisfactionHospitalService.data.HOSPITAL_ID;
            // 添加提前预判医院整体评价分数，若低于3，则提示添加评价内容 ，修改者：武帆
            SatisfactionHospitalService.calculateDataScore(postdata,hosptialId,
                function(data){
                    if(data.data){
                        if(data.data.score<3&&data.data.isBadPopup==1&&(postdata.OTHER==""||postdata.OTHER==null||postdata.OTHER==undefined)){
                            KyeeMessageService.confirm({
                                title:  KyeeI18nService.get('commonText.warmTipMsg', '温馨提示', null),
                                cancelText:KyeeI18nService.get("commonText.upMsg", "坚持提交"),
                                okText: KyeeI18nService.get("commonText.backwriteMsg", "去填写"),
                                content: KyeeI18nService.get('satisfaction_menu.satisfaction.selectAlertTxt',"就医体验不满意？写下您的评价意见可以帮助医院提升医疗服务哦~", null),
                                onSelect: function (res) {
                                    if(res){
                                        //$location.hash('hospitalSuggestId');
                                        //$anchorScroll();
                                        var aCtrl2 = document.getElementById("hospitalSuggestId");
                                        setTimeout(function() {
                                            aCtrl2.setSelectionRange(0, 0); //将光标定位在textarea的开头，需要定位到其他位置的请自行修改
                                            aCtrl2.focus();
                                        }, 0);
                                    }else{
                                        $scope.saveSuggest();
                                    }
                                }

                            });
                        }else{
                            $scope.saveSuggest();
                        }
                    }else{
                        $scope.saveSuggest();
                    }
                }
            )
        }

        /**
         * 评价提交事件
         */
        $scope.submit = function () {
            // 判断是否有未选择项
            var hasUnSelect = false;
            for(var index = 0; index <$scope.items.length; index++){
                if(!$scope.items[index].SCORE_VALUE){
                    hasUnSelect = true;
                    break;
                }
            }

            // 如果有则提示默认值
            if(hasUnSelect){
                KyeeMessageService.confirm({
                    title: KyeeI18nService.get('commonText.warmTipMsg', '温馨提示', null),
                    content: KyeeI18nService.get('satisfaction_menu.satisfaction_hospital.hos_weiXuanZe', '您有未评价项，未评价项将默认为5颗星，确定要提交？', null),
                    onSelect: function (res) {
                        if(res){
                            for(var index = 0; index <$scope.items.length; index++){
                                if(!$scope.items[index].SCORE_VALUE){
                                    $scope.items[index].SCORE_VALUE = 5;
                                }
                            }
                            $scope.calculateScore();
                        }
                    }
                });
            } else {
                $scope.calculateScore();
            }
        };

        /**
         * 评论内容监听事件
         */
        $scope.writeSuggest = function () {

            // modify by yaobin KYEEAPPTEST-2722 修改输入框监听事件 2015年7月23日11:07:43
            // 监听输入事件，限制评论长度不超过200
            if($scope.suggestInfo.suggest.length > 200){
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get('satisfaction_menu.satisfaction_hospital.hos_pingLunShuZi', '评论字数不能超过200字！', null),
                    duration: 1000
                });

                $scope.suggestInfo.suggest = $scope.suggestInfo.suggest.substring(0, 200);
            } else {
                SatisfactionHospitalService.pageData.suggest = $scope.suggestInfo.suggest;
            }

            // 输入框自动增长
            var scrollHeight = document.querySelector("#hospitalSuggestId").scrollHeight;
            if(scrollHeight < 200 && scrollHeight > 100 && document.querySelector("#hospitalSuggestId").style.height != scrollHeight + 'px'){
                document.querySelector("#hospitalSuggestId").style.height = scrollHeight + 'px';
            }
        };

        /**
         * 评价状态判断函数
         * @param status
         * @returns {boolean}
         */
        $scope.suggestStatus = function (status) {
            if(SatisfactionHospitalService.data.IS_SCORE == status){
                return true;
            } else {
                return false;
            }
        };

        //获取当前星星的样式：空星、半星、满星
        $scope.getXingCls = function(score, idx){
            var cls = "";
            var x = score - idx;
            if(x >= 0){
                //满星
                cls = "icon-favorite2";//吴伟刚 KYEEAPPC-4773 满意度页面细节优化
            }else if(x >= -0.5){
                //半星
                cls = "icon-favorite1";
            }else if(x < -0.5){
                //空星
                cls = "icon-favorite empty_star";
            }
            return cls;
        };
    })
    .build();
