/**
 * 产品名称 KYMH
 * 创建用户: 李文娟
 * 日期: 2015/4/30
 * 时间: 17:42
 * 创建原因：
 * 修改原因：
 * 修改时间：
 */
new KyeeModule()
    .group("kyee.quyiyuan.aboutquyi.feedback.controller")
    .require(["kyee.quyiyuan.aboutquyi.service"])
    .type("controller")
    .name("FeedbackController")
    .params(["KyeePhoneService","$scope", "$state", "AboutQuyiService",
        "KyeeI18nService", "KyeeMessageService","KyeeListenerRegister"
    ])
    .action(function(KyeePhoneService,$scope, $state, AboutQuyiService,
                     KyeeI18nService, KyeeMessageService,KyeeListenerRegister){

        $scope.placeholderText = KyeeI18nService.get("aboutquyi_feedback.placeHolder","请输入反馈意见，我们会尽快为您处理哦（少于200字）");
        $scope.suggest = AboutQuyiService.suggest;
        $scope.serviceTime = AboutQuyiService.SERVICE_TIME;
        $scope.submit = function(){
            var editText = $scope.suggest.EditText.trim();
            AboutQuyiService.submit(editText);

        };
        $scope.submitSuggest = function(){

            if(!$scope.suggest.EditText){
                KyeeMessageService.message({
                    content : KyeeI18nService.get("aboutquyi_feedback.resetCheck","请填写反馈以后再提交！")
                });

                return;
            }

            //成功后回调方法
            var afterSubmitSuggest=function(){
                $scope.suggest.EditText="";
                $state.go("aboutquyi_feedback");
            };
            AboutQuyiService.submitSuggest($scope, afterSubmitSuggest);
        };

        $scope.querySuggest=function(){
            AboutQuyiService.querySuggest($scope);
        };
        /**
         * 拨打客服电话
         */
        $scope.callCustomerService = function () {
            KyeeMessageService.confirm({
                title:  KyeeI18nService.get("login.hint", "提示"),
                content:  KyeeI18nService.get("regist.isCall","拨打客服电话？"),
                onSelect: function (flag) {
                    if (flag) {
                        //拨打客服电话
                        if(!window.device){//网页版
                            window.location.href="tel:4000801010";
                        }else{
                            KyeePhoneService.callOnly("4000801010");
                        }
                    }
                }
            });
        };
    })
    .build();