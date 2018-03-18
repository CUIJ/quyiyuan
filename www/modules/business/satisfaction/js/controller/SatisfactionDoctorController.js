/**
 * 产品名称：quyiyuan.
 * 创建用户：姚斌
 * 日期：2015年5月5日11:06:54
 * 创建原因：医生评价页面控制器
 *
 * 修改人：姚斌 修改时间：2015年7月13日14:40:47
 * 任务号：KYEEAPPTEST-2708 修改原因：满意度模块，提交评价，内容显示不稳定
 *  修改人：张明 修改时间：2015年12月02日14:37:22
 * 任务号：KYEEAPPC-4387 修改原因：提示信息修改
 */
new KyeeModule()
    .group("kyee.quyiyuan.satisfaction.satisfactionDoctor.controller")
    .require(["kyee.quyiyuan.satisfaction.appendSuggest.controller"])
    .type("controller")
    .name("SatisfactionDoctorController")
    .params(["$scope", "$state",'$location', '$anchorScroll', "KyeeMessageService",
        "SatisfactionDoctorService", "KyeeViewService",
        "SatisfactionHospitalService", "CacheServiceBus",
        "KyeeUtilsService","KyeeI18nService","FilterChainInvoker","AppointmentDoctorDetailService"])
    .action(function($scope, $state, $location, $anchorScroll,KyeeMessageService,
                     SatisfactionDoctorService, KyeeViewService, SatisfactionHospitalService,
                     CacheServiceBus, KyeeUtilsService,KyeeI18nService,FilterChainInvoker,AppointmentDoctorDetailService){

        // 初始化页面数据
        $scope.data = SatisfactionDoctorService.data;
        // 初始化页面评价文字内容数据
        $scope.suggestInfo = {};
        $scope.suggestInfo.suggest = '';
        $scope.suggestInfo.placeholderTxt = KyeeI18nService.get('satisfaction_menu.satisfaction_doctor.placeholderTxt', '写下评价吧，对其他患者也有帮助哦~', null);
        var caretype=false;
        var doctorInfo={
            DOCTOR_CODE:$scope.data.DOCTOR_CODE,
            DEPT_CODE:$scope.data.DEPT_CODE
        };
        var hospitalInfo={
            HOSPITAL_ID:$scope.data.HOSPITAL_ID
        };
        SatisfactionDoctorService.doctorInfo=doctorInfo;
        SatisfactionDoctorService.hospitalInfo=hospitalInfo;
        /**
         * 星号点击事件
         * @param index
         * @param score
         */
        $scope.starClick = function (index, score) {
            if(SatisfactionDoctorService.data.IS_SUGGEST == 0){
                $scope.items[index].SCORE_VALUE = score;
                SatisfactionDoctorService.pageData.items = $scope.items;
            }
        };

        if(SatisfactionDoctorService.data.IS_SUGGEST == 0){
            // 如果未评价则获取待评价项目
            SatisfactionDoctorService.querySurveyData(
                SatisfactionDoctorService.data.HOSPITAL_ID,
                function(data){
                    $scope.IS_SUPPORT_NEWITEM=data.IS_SUPPORT_NEWITEM;
                    $scope.IS_NEW_FLAG=1;
                    $scope.items = data.rows;
                    SatisfactionDoctorService.pageData = {};
                    SatisfactionDoctorService.pageData.items = $scope.items;
            })
        } else {
            // 如果已评价则获取已评价数据
            SatisfactionDoctorService.querySatisfactionData(
                SatisfactionDoctorService.data.HOSPITAL_ID,
                SatisfactionDoctorService.data.REG_ID,
                function(data){
                    $scope.IS_SUPPORT_NEWITEM=data.IS_SUPPORT_NEWITEM;
                    $scope.IS_NEW_FLAG=data.IS_NEW_FLAG;
                    $scope.items = data.ITEM_SCORES;
                    $scope.data.SUGGEST_TIME = data.SUGGEST_TIME;
                    //$scope.suggestInfo.suggest = data.SUGGEST_VALUE ? data.SUGGEST_VALUE:KyeeI18nService.get('satisfaction_menu.satisfaction_doctor.wuPingjiaTxt', '无评论内容！', null);
                    // 评价内容为空不显示暂未评价内容 KYEEAPPC-8154 yangmingsi
                    if(data.SUGGEST_VALUE&&data.SUGGEST_VALUE.length>0){
                        $scope.suggestDoctorInfo = data.SUGGEST_VALUE;
                        $scope.isShow=true;
                    }else{
                        $scope.isShow=false;
                    }
                    $scope.data.SUGGEST_APPEND = data.SUGGEST_APPEND;
                    $scope.SUGGEST_SCORE = data.SUGGEST_SCORE;
                    $scope.SUGGEST_TIME = $scope.data.SUGGEST_TIME;
                    if(data.APPEND_SUGGEST_TIME&&data.APPEND_SUGGEST_TIME.length>0){
                        $scope.APPEND_SUGGEST_TIME = data.APPEND_SUGGEST_TIME;
                    }
            })
        };

        /**
         * 保存评价函数
         */
        $scope.saveSuggest = function () {
            var postdata = $scope.data;
            postdata.ITEM_SCORES = $scope.items;
            postdata.SUGGEST_VALUE = $scope.suggestInfo.suggest;
            postdata.USER_ID = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID;
            SatisfactionDoctorService.saveSatisfactionData(
                postdata,
                function(data){
                    SatisfactionDoctorService.data.IS_SUGGEST = 1;
                    SatisfactionDoctorService.data.SUGGEST_TIME = KyeeUtilsService.DateUtils.getDate();
                    KyeeMessageService.message({
                        title: KyeeI18nService.get('commonText.warmTipMsg', '温馨提示', null),
                        okText: KyeeI18nService.get("commonText.iknowMsg", "我知道了"),
                        content: KyeeI18nService.get('satisfaction_menu.satisfaction_doctor.pingLunTiJiaoOk',"您已成功完成对医生的评价！", null),
                        onOk:function(){
                            if($scope.suggestInfo.suggest && $scope.suggestInfo.suggest.length > 0){
                                $scope.isShow  = true;
                                $scope.suggestDoctorInfo = $scope.suggestInfo.suggest;
                            }else{
                                $scope.isShow  = false;
                            }
                        }
                    });

                    //评价完成后显示整体评价
                    if($scope.items.length){
                        $scope.SUGGEST_SCORE = data.data;
                    }
                })
        };
        /**
         * 预判医生评分函数
         */
        $scope.calculateScore=function(){
            var postdata = $scope.data;
            postdata.ITEM_SCORES = $scope.items;
            postdata.SUGGEST_VALUE = $scope.suggestInfo.suggest;
            postdata.USER_ID = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID;
            var hospitalId=SatisfactionDoctorService.data.HOSPITAL_ID;
            var doctorSuggestText = document.getElementById("doctorSuggestId");
            var doctorSuggestTextNew = document.getElementById("doctorSuggestIdNew");
            // 添加提前预判医院整体评价分数，若低于2，则提示添加评价内容 ，修改者：武帆
            SatisfactionDoctorService.calculateDataScore(postdata,hospitalId,
                function(data){
                    if(data.data){
                        if(data.data.score<3&&data.data.isBadPopup==1&&(postdata.SUGGEST_VALUE==""||postdata.SUGGEST_VALUE==null||postdata.SUGGEST_VALUE==undefined)){
                            KyeeMessageService.confirm({
                                title:  KyeeI18nService.get('commonText.warmTipMsg', '温馨提示', null),
                                cancelText:KyeeI18nService.get("commonText.upMsg", "坚持提交"),
                                okText: KyeeI18nService.get("commonText.backwriteMsg", "去填写"),
                                content: KyeeI18nService.get('satisfaction_menu.satisfaction.selectAlertTxt',"就医体验不满意？写下您的评价意见可以帮助医院提升医疗服务哦~", null),
                                onSelect: function (res) {
                                    if(res){
                                        var aCtrl = null;
                                        var aCtrlNew = null;
                                        if(doctorSuggestText){
                                            aCtrl = doctorSuggestText;
                                        }
                                        if(doctorSuggestTextNew){
                                            aCtrlNew =doctorSuggestTextNew;
                                        }

                                        setTimeout(function() {
                                            if(aCtrl){
                                                aCtrl.setSelectionRange(0, 0); //将光标定位在textarea的开头，需要定位到其他位置的请自行修改
                                                aCtrl.focus();
                                            }else if(aCtrlNew){
                                                aCtrlNew.setSelectionRange(0, 0); //将光标定位在textarea的开头
                                                aCtrlNew.focus();
                                            }
                                        }, 0);
                                        //document.getElementById('doctorSuggestId').focus();
                                        //document.getElementById('doctorSuggestId').setAttribute('autofocus',true);
                                        //document.getElementById('doctorSuggestId').style.display = 'none';
                                        //document.getElementById('doctorSuggestId').style.display = 'block';
                                        }else {
                                        $scope.saveSuggest();
                                    }
                                }
                            });
                        }
                        else{
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
                    title:  KyeeI18nService.get('commonText.warmTipMsg', '温馨提示', null),
                    content: KyeeI18nService.get('satisfaction_menu.satisfaction_doctor.selectAlertTxt',"您有未评价项，未评价项将默认为3颗星，确定要提交？", null),
                    onSelect: function (res) {
                        if(res){
                            for(var index = 0; index <$scope.items.length; index++){
                                if(!$scope.items[index].SCORE_VALUE){
                                    $scope.items[index].SCORE_VALUE = 3;
                                }
                            }
                            $scope.calculateScore();
                        }
                    }
                });
                // for(var index = 0; index <$scope.items.length; index++){
                //     if(!$scope.items[index].SCORE_VALUE){
                //         $scope.items[index].SCORE_VALUE = 5;
                //     }
                // }
                // $scope.calculateScore();
            }else {
                $scope.calculateScore();
            }
        };

        /**
         * 跳转追加评论页面
         */
        $scope.appendSuggest = function () {
            KyeeViewService.openModalFromUrl({
                url: "modules/business/satisfaction/views/append_suggest.html",
                scope: $scope
            });
        };
        /**
         * 评论内容监听事件
         */
        $scope.writeSuggest = function () {// modify by yaobin KYEEAPPTEST-2722 修改输入框监听事件 2015年7月23日11:07:43
            // 监听输入事件，限制评论长度不超过200
            if($scope.suggestInfo.suggest.length > 200){
                KyeeMessageService.broadcast({
                    content:  KyeeI18nService.get('satisfaction_menu.satisfaction_doctor.AlertTxtNumber',"评论字数不能超过200字！", null),
                    duration: 1000
                });

                $scope.suggestInfo.suggest = $scope.suggestInfo.suggest.substring(0, 200);
            } else {
                SatisfactionDoctorService.pageData.suggest = $scope.suggestInfo.suggest;
            }

            // 输入框自动增长
            var scrollHeight = document.querySelector("#doctorSuggestId").scrollHeight;
            var scrollHeightNew = document.querySelector("#doctorSuggestIdNew").scrollHeight;
            if(scrollHeight < 200 && scrollHeight > 100 && document.querySelector("#doctorSuggestId").style.height != scrollHeight + 'px'){
                document.querySelector("#doctorSuggestId").style.height = scrollHeight + 'px';
            }
            if(scrollHeightNew < 200 && scrollHeightNew > 100 && document.querySelector("#doctorSuggestIdNew").style.height != scrollHeightNew + 'px'){
                document.querySelector("#doctorSuggestIdNew").style.height = scrollHeightNew + 'px';
            }
        };

        /**
         * 评价状态判断函数
         * @param status
         * @returns {boolean}
         */
        $scope.suggestStatus = function (status) {
            if(SatisfactionDoctorService.data.IS_SUGGEST == status || (
                status == 2 && SatisfactionDoctorService.data.IS_SUGGEST == 1)){
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
                cls = "icon-favorite2 empty_star";
            }
            return cls;
        };

        // 初始化页面评价文字内容数据
        $scope.appendSuggestInfo = {};
        $scope.appendSuggestInfo.suggest = '';
        /**
         * 提交追加评论函数 KYEEAPPC-8154 yangmingsi
         */
        $scope.appendSubmmitNew = function () {
            if($scope.appendSuggestInfo.suggest && $scope.appendSuggestInfo.suggest.trim()){
                var paramData =  angular.copy($scope.data);
                paramData["SUGGEST_APPEND"]=  $scope.appendSuggestInfo.suggest;
                SatisfactionDoctorService.saveSatisfactionData(
                    paramData,
                    function(data){
                        SatisfactionDoctorService.data.IS_SUGGEST = 2;
                        $scope.data["SUGGEST_APPEND"] = $scope.appendSuggestInfo.suggest;
                        $scope.close();
                    });
            } else {
                KyeeMessageService.message({
                    title: KyeeI18nService.get("commonText.warmTipMsg","温馨提示"),
                    okText: KyeeI18nService.get("commonText.iknowMsg", "我知道了"),
                    content:KyeeI18nService.get('satisfaction_menu.satisfaction_doctor.zhujiaAlertContent', '追加评论内容不能为空！', null)
                });
            }
        };

        /**
         * 检测输入框变化函数
         */
        $scope.checkSuggestNew = function () {

            // 监听输入事件，限制评论长度不超过200
            if($scope.appendSuggestInfo.suggest.length > 200){
                KyeeMessageService.broadcast({
                    content:KyeeI18nService.get('satisfaction_menu.satisfaction_doctor.zhujiazishuAlertContent', '评论字数不能超过200字！', null),
                    duration: 1000
                });

                $scope.appendSuggestInfo.suggest = $scope.appendSuggestInfo.suggest.substring(0, 200);
            }

            // 输入框自动增长
            var scrollHeight = document.querySelector("#appendSuggestIdNew").scrollHeight;
            if(scrollHeight > 100 && document.querySelector("#appendSuggestIdNew").style.height != scrollHeight + 'px'){
                document.querySelector("#appendSuggestIdNew").style.height = scrollHeight + 'px';
            }
        };

        //医生评价页是否关注医生 KYEEAPPC-8154 yangmingsi
        $scope.careDoctor = function () {
            FilterChainInvoker.invokeChain({
                id: "USER_LOGIN_FILTER",
                token: "satisfaction_menu.satisfaction_doctor",
                onFinash: function () {
                    $state.go("satisfaction_menu.satisfaction_doctor");
                    var currentCustomPatient = CacheServiceBus.getMemoryCache().get('currentCustomPatient');
                    if (!currentCustomPatient || !currentCustomPatient.USER_VS_ID) {
                        KyeeMessageService.confirm({
                            title: KyeeI18nService.get("satisfaction_menu.satisfaction_doctor.message","消息"),
                            content: KyeeI18nService.get("satisfaction_menu.satisfaction_doctor.choosePatient","您还没有选择就诊者，是否选择？"),
                            onSelect: function (res) {
                                if (res) {
                                    $state.go('custom_patient');
                                }
                            }
                        });
                    }else {
                        //修改是否关注状态
                        $scope.CARE = !$scope.CARE;
                        var careStatus = '';
                        //根据是否关注状态设置人数
                        if ($scope.CARE) {
                            $scope.careNum++;
                            careStatus = '1';
                            KyeeMessageService.broadcast({
                                content: KyeeI18nService.get("satisfaction_menu.satisfaction_doctor.isCancelAppoint", "您已成功关注该医生"),
                                duration: 3000
                            });
                            if(SatisfactionDoctorService.doctorCare){
                                //医生详情页关注数问题优化
                                if(!caretype){
                                    SatisfactionDoctorService.doctorCare.careFlag = 1;
                                }else{
                                    SatisfactionDoctorService.doctorCare.careFlag =0;
                                }
                            }
                        }else {
                            $scope.careNum--;
                            careStatus = '0';
                            KyeeMessageService.broadcast({
                                content: KyeeI18nService.get("satisfaction_menu.satisfaction_doctor.isCancelAppoint","您已取消关注该医生"),
                                duration: 3000
                            });
                            if(SatisfactionDoctorService.doctorCare){
                                // 医生详情页关注数问题优化
                                if(caretype){
                                    SatisfactionDoctorService.doctorCare.careFlag = -1;
                                }else{
                                    SatisfactionDoctorService.doctorCare.careFlag =0;
                                }
                            }
                        }

                        //AppointmentDoctorDetailService.doctorInfo = doctorInfo;
                        //AppointmentDoctorDetailService.closeHospitalDate = hospitalInfo;
                        //保存数据
                        SatisfactionDoctorService.careDoctor(careStatus,doctorInfo,hospitalInfo);
                    }
                }
            });

            OperationMonitor.record("countFavoritBox", "satisfaction_menu.satisfaction_doctor");
        };
        //加载医生关注信息 KYEEAPPC-8154 yangmingsi
        SatisfactionDoctorService.queryDoctorCareInfo(doctorInfo,hospitalInfo,function (data) {
            if (data.careFlag == undefined||data.careFlag==='0') {
                $scope.CARE = false;
            }else {
                $scope.CARE = true;
            }
        }, $scope.data)
    })
    .build();
