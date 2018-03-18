/**
 * 产品名称：quyiyuan
 * 创建者：王亚宁
 * 创建时间： 2016/11/24
 * 创建原因：个人设置修改个人昵称跳转至新界面 KYEEAPPC-8874
 */

new KyeeModule()
    .group("kyee.quyiyuan.patients_group.modify_personal_name.controller")
    .require([
        "kyee.framework.service.view",
        "kyee.quyiyuan.patients_group.personal_setting.service"
    ])
    .type("controller")
    .name("ModifyPersonalNameController")
    .params([
        "$scope",
        "$state",
        "$ionicHistory",
        "KyeeListenerRegister",
        "CacheServiceBus",
        "KyeeMessageService",
        "KyeeI18nService",
        "PersonalSettingService"
    ])
    .action(function($scope,$state,$ionicHistory,KyeeListenerRegister,CacheServiceBus,
                     KyeeMessageService,KyeeI18nService,PersonalSettingService){

        /**
         * 监听进入当前页面
         * add by wyn 20161124
         */
        KyeeListenerRegister.regist({
            focus: "modify_personal_name",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (params) {
                initData();
            }
        });

        /**
         * 修改个人昵称界面初始化
         * add by wyn 20161124
         */
        var initData = function(){
            $scope.personal = {
                name: PersonalSettingService.personalName,
                isWrite: false,
                oldName: PersonalSettingService.personalName
            };
        };

        $scope.placeholder = {
            personalNameText: KyeeI18nService.get("update_user.purYouName","请输入个人昵称,最多可输入10个字符")
        };

        /**
         * 显示删除个人昵称按钮
         * add by wyn 20161124
         */
        $scope.showDeleteIcon = function(){
            $scope.personal.isWrite = true;
        };

        /**
         * 隐藏删除个人昵称按钮
         * add by wyn 20161124
         */
        $scope.hideDeleteIcon = function(){
            $scope.personal.isWrite = false;
        };

        /**
         * 删除个人昵称内容
         * add by wyn 20161124
         */
        $scope.clearPersonalName = function(){
            $scope.personal.name = "";
        };

        /**
         * 保存个人昵称
         * 注：因数据库中初始存在相同昵称，故若昵称修改后和原始值相等则不调用后台修改接口
         * add by wyn 20161124
         */
        $scope.savePersonalName = function(){
            var personalName = $scope.personal.name;
            if(personalName == $scope.personal.oldName){
                showSuccessTips();
            } else if (validPersonalName(personalName)){
                PersonalSettingService.doModifyNickName("",personalName,"",function(){
                    showSuccessTips();
                },function(data){
                    KyeeMessageService.broadcast({
                        content: data.message
                    });
                });
            }
        };

        /**
         * 显示个人昵称修改成功提示
         * add by wyn 20161124
         */
        var showSuccessTips = function(){
            $scope.personal.isWrite = false;
            KyeeMessageService.broadcast({
                content: KyeeI18nService.get("personal_name.saveSuccess","个人昵称修改成功！")
            });
            $ionicHistory.goBack();
        };

        /**
         * 校验个人昵称:非空判断、输入字符是否合法、数据库中是否已存在相同值
         * add by wyn 20161124
         * @param personalName
         * @returns {boolean}
         */
        var validPersonalName = function(personalName){
            var validFlag = true;
            if(!personalName){
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("personal_name.noEmptyTips","个人昵称不能为空！")
                });
                validFlag = false;
                return;
            }

            var regx = /^[\u4E00-\u9FA5A-Za-z 0-9]+$/;
            if(!regx.test(personalName)){
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("personal_name.invaildContent","请勿输入中文、英文、数字和空格之外的内容！")
                });
                validFlag = false;
                return;
            }

            PersonalSettingService.isExistsNickName(personalName,function(data){
                validFlag = true;
                if(data.result){
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("personal_name.invaildContent","该昵称已存在，请重新设置！")
                    });
                    validFlag = false;
                }
            });
            return validFlag;
        };
    })
    .build();