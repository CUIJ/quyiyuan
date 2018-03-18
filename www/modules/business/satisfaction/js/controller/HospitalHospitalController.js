/**
 * 产品名称：quyiyuan.
 * 创建用户：吴伟刚
 * 日期：2015年6月26日15:35:06
 * 创建原因：住院满意度医院评价页面控制器
 *
 * 修改人：姚斌 修改时间：2015年7月13日14:40:47
 * 任务号：KYEEAPPTEST-2708 修改原因：满意度模块，提交评价，内容显示不稳定
 *  修改人：张明 修改时间：2015年12月02日14:37:22
 * 任务号：KYEEAPPC-4387 修改原因：提示信息修改
 */
new KyeeModule()
    .group("kyee.quyiyuan.satisfaction.hospitalHospital.controller")
    .require(["kyee.quyiyuan.myquyi.service"])
    .type("controller")
    .name("HospitalHospitalController")
    .params(["$scope", "$state", "KyeeMessageService",
        "HospitalHospitalService", "HospitalDoctorService","CacheServiceBus",
        "KyeeUtilsService","MyquyiService","KyeeI18nService"])
    .action(function($scope, $state, KyeeMessageService,
                     HospitalHospitalService, HospitalDoctorService,CacheServiceBus,
                     KyeeUtilsService,MyquyiService,KyeeI18nService){

        // 初始化页面数据
        $scope.data = HospitalHospitalService.data;
        //MyquyiService.setBackTabIndex(2);

        // 初始化页面评价文字内容数据
        $scope.suggestInfo = {};
        $scope.suggestInfo.suggest = '';
        $scope.placeText= KyeeI18nService.get('satisfaction_hospital_menu.hospital_doctor.zhuYuan_placeTxtPingLun', '请输入评论内容', null);

        /**
         * 星号点击事件
         * @param index
         * @param score
         */
        $scope.starClick = function (index, score) {
            if(HospitalHospitalService.data.HOSPITAL_SUGGEST_SCORE == 0){
                $scope.items[index].SCORE_VALUE = score;
                HospitalHospitalService.pageData.items = $scope.items;
            }
        };

        if(HospitalHospitalService.data.HOSPITAL_SUGGEST_SCORE == 0){
            // 如果未评价则获取待评价项目
            $scope.items = HospitalHospitalService.pageData.items;
        } else {
            // 如果已评价则获取已评价数据
            HospitalHospitalService.querySatisfactionData(
                HospitalHospitalService.data.HOSPITAL_ID,
                HospitalHospitalService.data.REG_ID,
                function(data){
                    $scope.items = data;
                    $scope.data.SUGGEST_TIME = data[0].CREATE_DATE.substr(0,10);
                    $scope.suggestInfo.suggest = HospitalHospitalService.data.HOSPITAL_SUGGEST_TEXT ? HospitalDoctorService.data.HOSPITAL_SUGGEST_TEXT:KyeeI18nService.get('satisfaction_hospital_menu.hospital_doctor.zhuYuan_wuPingjiaTxt', '无评论内容！', null);
                    $scope.SUGGEST_SCORE = HospitalHospitalService.data.HOSPITAL_SUGGEST_SCORE;
                    $scope.data.SUGGEST_TIME = KyeeUtilsService.DateUtils.formatFromString($scope.data.SUGGEST_TIME,"YYYY-MM-DD","YYYY/MM/DD");
                    $scope.SUGGEST_TIME = $scope.data.SUGGEST_TIME;
                })
        }

        /**
         * 保存评价函数
         */
        $scope.saveSuggest = function () {
            var postdata = $scope.data;
            postdata.ITEM_SCORES = $scope.items;
            postdata.SUGGEST_TYPE = 2;
            postdata.SUGGEST_TEXT = $scope.suggestInfo.suggest;
            postdata.USER_ID = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID;
            HospitalHospitalService.saveSatisfactionData(
                postdata,
                function(data){
                    if(data.data){
                        HospitalHospitalService.data.HOSPITAL_SUGGEST_SCORE = data.data;
                        $scope.SUGGEST_SCORE = data.data;
                        //吴伟刚 KYEEAPPC-2753 住院满意度评价内容显示异常
                        HospitalHospitalService.data.HOSPITAL_SUGGEST_TEXT = $scope.suggestInfo.suggest;
                        HospitalHospitalService.data.SUGGEST_TIME = KyeeUtilsService.DateUtils.getDate();
                        KyeeMessageService.message({
                            title: KyeeI18nService.get('commonText.warmTipMsg', '温馨提示', null),
                            okText: KyeeI18nService.get("commonText.iknowMsg", "我知道了"),
                            content:  KyeeI18nService.get('satisfaction_hospital_menu.hospital_doctor.zhuYuan_pingLunOkDoctor', '您已成功完成对医院的评价！', null)
                        });
                    }
                })
        };

        /**
         * 评价提交事件
         */
        $scope.submit = function () {
            // 判断是否有未选择项
            var hasUnSelect = false;
            var hasUnCheck = false;
            var hasUnCheckIndex = -1;
            for(var index = 0; index <$scope.items.length; index++){
                if($scope.items[index].SCORE_VALUE==undefined&&$scope.items[index].SPECIAL_TYPE!=''){
                    hasUnCheck = true;
                    hasUnCheckIndex = index+1;
                    break;
                }
            }
            if(hasUnCheckIndex!=-1){
                KyeeMessageService.message({
                    title: KyeeI18nService.get('commonText.warmTipMsg', '温馨提示', null),
                    content: KyeeI18nService.get('satisfaction_hospital_menu.hospital_hospital.selectOne', '请选择第'+hasUnCheckIndex+'项！', {index: hasUnCheckIndex})
                });
                return;
            }
            for(var index = 0; index <$scope.items.length; index++){
                if(!$scope.items[index].SCORE_VALUE&&$scope.items[index].SCORE_VALUE!=0){
                    hasUnSelect = true;
                    break;
                }
            }
            // 如果有则提示默认值
            if(hasUnSelect){
                KyeeMessageService.confirm({
                    title: KyeeI18nService.get('commonText.warmTipMsg', '温馨提示', null),
                    content:  KyeeI18nService.get('satisfaction_hospital_menu.hospital_doctor.zhuYuan_weiXuanZeAlert', '您有未评价项，未评价项将默认为3颗星，确定要提交？', null),
                    onSelect: function (res) {
                        if(res){
                            for(var index = 0; index <$scope.items.length; index++){
                                if(!$scope.items[index].SCORE_VALUE&&$scope.items[index].SCORE_VALUE!=0){
                                    $scope.items[index].SCORE_VALUE = 3;
                                }
                            }
                            $scope.saveSuggest();
                        }
                    }
                });
            } else {
                $scope.saveSuggest();
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
                    content:  KyeeI18nService.get('satisfaction_hospital_menu.hospital_doctor.zhuYuan_pingLunZiShuAlert', '评论字数不能超过200字！', null),
                    duration: 1000
                });

                $scope.suggestInfo.suggest = $scope.suggestInfo.suggest.substring(0, 200);
            } else {
                HospitalHospitalService.pageData.suggest = $scope.suggestInfo.suggest;
            }

            // 输入框自动增长
            var scrollHeight = document.querySelector("#inHospitalSuggestId").scrollHeight;
            if(scrollHeight < 200 && scrollHeight > 100 && document.querySelector("#inHospitalSuggestId").style.height != scrollHeight + 'px'){
                document.querySelector("#inHospitalSuggestId").style.height = scrollHeight + 'px';
            }
        };

        /**
         * 评价状态判断函数
         * @param status
         * @returns {boolean}
         */
        $scope.suggestStatus = function () {
            if(HospitalHospitalService.data.HOSPITAL_SUGGEST_SCORE == 0){
                return true;
            } else {
                return false;
            }
        };

        //单选框点击事件
        $scope.isItemChecked = function(item,ischeck){
            if(item.SCORE_VALUE ==ischeck){
                return 'ion-android-checkbox-outline';
            }else{
                return 'ion-android-checkbox-outline-blank';
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
