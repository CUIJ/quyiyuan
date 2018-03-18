/**
 * 产品名称：quyiyuan
 * 创建者：王亚宁
 * 创建时间： 2016/7/27
 * 创建原因：群组详情界面开发 KYEESUPPORT-47
 */

new KyeeModule()
    .group("kyee.quyiyuan.patients_group.modify_group_card.controller")
    .require([
        "kyee.framework.service.view",
        "kyee.quyiyuan.patients_group.group_details.service"
    ])
    .type("controller")
    .name("ModifyGroupCardController")
    .params([
        "$scope",
        "$state",
        "KyeeListenerRegister",
        "CacheServiceBus",
        "KyeeMessageService",
        "KyeeI18nService",
        "GroupDetailsService",
        "$ionicHistory",
        "ConversationService"
    ])
    .action(function($scope,$state,KyeeListenerRegister,CacheServiceBus,
                     KyeeMessageService,KyeeI18nService,GroupDetailsService,$ionicHistory,ConversationService){

        /**
         * 监听进入当前页面
         */
        KyeeListenerRegister.regist({
            focus: "modify_group_card",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (params) {
                init();
            }
        });

        /**
         * 界面初始化
         */
        var init = function(){
            $scope.member = {
                groupCard: GroupDetailsService.groupCard,
                isWrite: false
            };
            $scope.oldGroupCard = GroupDetailsService.groupCard;
        };

        $scope.placeholder = {
            groupCardText: KyeeI18nService.get("update_user.purYouName","请输入群名片,最多可输入10个字符")
        };

        /**
         * 显示删除群名片按钮
         */
        $scope.showDeleteIcon = function(){
            $scope.member.isWrite = true;
        };

        /**
         * 隐藏删除群名片按钮
         */
        $scope.hideDeleteIcon = function(){
            $scope.member.isWrite = false;
        };

        /**
         * 删除群名片内容
         */
        $scope.clearNickname = function(){
            $scope.member.groupCard = "";
        };

        /**
         * 保存群名片
         */
        $scope.saveMyGroupCard = function(){
          //校验群名片
            if(!$scope.member.groupCard){
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("group_details.groupCardEmptyTips","群名片不能为空！")
                });
                return;
            }
            if($scope.member.groupCard != $scope.oldGroupCard){
                var regx = /^[\u4E00-\u9FA5A-Za-z 0-9]+$/;
                if(!regx.test($scope.member.groupCard)){
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("contracts_list.invaildContent","请勿输入中文、英文、数字和空格之外的内容！")
                    });
                    return;
                }
                var params = {
                    owner:ConversationService.groupInfo.owner,
                    groupId:ConversationService.groupInfo.tid,
                    nick:$scope.member.groupCard
                }
                //执行保存群名片
                GroupDetailsService.saveGroupCard(params,function(data){
                    $scope.member.isWrite = false;
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("group_details.groupCardSaveSuccess","群名片修改成功！")
                    });
                    $ionicHistory.goBack();
                },function(data){
                    $scope.member.isWrite = true;
                    KyeeMessageService.broadcast({
                        content: data.message
                    });
                });
            } else {
                 $scope.member.isWrite = false;
                //群名片修改前后一致,不调修改接口
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("group_details.groupCardSaveSuccess","群名片修改成功！")
                });
                $ionicHistory.goBack();
            }
        }
    })
    .build();