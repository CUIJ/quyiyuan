/**
 * 产品名称：quyiyuan.
 * 创建用户：姚斌
 * 日期：2015年5月5日11:06:54
 * 创建原因：追加评价页面控制器
 */
new KyeeModule()
    .group("kyee.quyiyuan.satisfaction.appendSuggest.controller")
    .require([])
    .type("controller")
    .name("AppendSuggestController")
    .params(["$scope", "SatisfactionDoctorService", "KyeeViewService", "KyeeMessageService","KyeeListenerRegister","KyeeI18nService"])
    .action(function($scope, SatisfactionDoctorService, KyeeViewService, KyeeMessageService,KyeeListenerRegister,KyeeI18nService){

        // 初始化页面评价文字内容数据
        $scope.suggestInfo = {};
        $scope.suggestInfo.suggest = '';
        $scope.zhujiaplaceholderTxt=KyeeI18nService.get('satisfaction_menu.satisfaction_doctor.zhujiaplaceholderTxt', '请输入追加评价内容！', null);
        /**
         * 返回按钮函数
         */
        $scope.close = function(){
            KyeeViewService.hideModal({
                scope : $scope
            });
            //离开此页面的时候将一次性事件卸载掉，否则会影响到其他的物理回退
            KyeeListenerRegister.uninstallOnce(KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK);
        };

        /**
         * 提交追加评论函数
         */
        $scope.appendSubmmit = function () {

            if($scope.suggestInfo.suggest && $scope.suggestInfo.suggest.trim()){
                $scope.data["SUGGEST_APPEND"] = $scope.suggestInfo.suggest;
                SatisfactionDoctorService.saveSatisfactionData(
                    $scope.data,
                    function(data){
                        SatisfactionDoctorService.data.IS_SUGGEST = 2;
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

        //监听物理返回键
        KyeeListenerRegister.once({
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();   //禁掉默认处理，使物理返回与页面上的返回键一致
                $scope.close();
            }
        });

        /**
         * 检测输入框变化函数
         * modify by yaobin KYEEAPPTEST-2722 修改输入框监听事件 2015年7月23日11:07:43
         */
        $scope.checkSuggest = function () {

            // 监听输入事件，限制评论长度不超过200
            if($scope.suggestInfo.suggest.length > 200){
                KyeeMessageService.broadcast({
                    content:KyeeI18nService.get('satisfaction_menu.satisfaction_doctor.zhujiazishuAlertContent', '评论字数不能超过200字！', null),
                    duration: 1000
                });

                $scope.suggestInfo.suggest = $scope.suggestInfo.suggest.substring(0, 200);
            }

            // 输入框自动增长
            var scrollHeight = document.querySelector("#appendSuggestId").scrollHeight;
            if(scrollHeight > 100 && document.querySelector("#appendSuggestId").style.height != scrollHeight + 'px'){
                document.querySelector("#appendSuggestId").style.height = scrollHeight + 'px';
            }
        }
    })
    .build();
