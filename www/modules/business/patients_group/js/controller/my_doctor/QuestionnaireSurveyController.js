/**
 * 产品名称：趣医院
 * 创建者：张毅
 * 创建时间：2016/12/19
 * 创建原因：病友圈三期[精准医患管理系统]之随访回访列表controller
 * 修改者：
 * 修改原因：
 *
 */

new KyeeModule()
    .group("kyee.quyiyuan.patients_group.questionnaire_survey.controller")
    .require(["kyee.quyiyuan.patients_group.questionnaire_survey.service"])
    .type("controller")
    .name("QuestionnaireSurveyController")
    .params(["$scope", "$state", "$ionicHistory", "$ionicViewSwitcher",
        "KyeeListenerRegister", "KyeeI18nService", "KyeeMessageService", "CacheServiceBus",
        "QuestionnaireSurveyService","PersonalChatService"])
    .action(function ($scope, $state, $ionicHistory, $ionicViewSwitcher,
                      KyeeListenerRegister, KyeeI18nService, KyeeMessageService, CacheServiceBus,
                      QuestionnaireSurveyService,PersonalChatService) {
        // 从缓存中获取登录用户基本信息
        var personalInfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.USER_ACT_INFO);
        // 页面添加初始化监听事件
        KyeeListenerRegister.regist({
            focus: "questionnaire_survey",
            direction: "both",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            action: function () {
                initPage();
            }
        });

        //统一物理返回键和APP返回键
        KyeeListenerRegister.regist({
            focus: "questionnaire_survey",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.back();
            }
        });

        //返回按钮点击事件
        $scope.back = function () {
            if ($scope.visitStatus == 1) {
                KyeeMessageService.confirm({
                    title: KyeeI18nService.get("set_up.sms", "消息"),
                    content: "您还未完成随访单的提交，确认放弃？",
                    cancelText: "放弃",
                    okText: "继续填写",
                    onSelect: function (select) {
                        if (!select) {
                            PersonalChatService.updateEndMessageList(function(){
                                $ionicHistory.goBack(-1);
                            });
                        }
                    }
                });
            } else {
                PersonalChatService.updateEndMessageList(function(){
                    $ionicHistory.goBack(-1);
                });
            }
        };

        var initPage = function () {
            // 获取随访回访数据
            QuestionnaireSurveyService.queryQuestionInfo(function (resultData) {
                $scope.patientInfo = {
                    userPhoto:personalInfo.userPhoto,
                    userName:resultData.visitName,
                    sex:resultData.sex,
                    age:resultData.age
                };
                $scope.visitStatus = resultData.visitStatus; // 0:未推送；1:已推送未达； 2:已回答且成功提交
                $scope.questionnaireSurveyData = resultData;
                if ($scope.visitStatus == 2) { //已回答过的问卷调查，格式化展示数据
                    formatDisplayData();
                }
            })
        };

        /**
         * 满意度问题笑脸点击事件 误删！
         * @param templateIndex
         * @param topicIndex
         * @param score
         */
        // $scope.confirmSatisfactionScore = function (templateIndex, topicIndex, score) {
        //     $scope.questionnaireSurveyData.templateList[templateIndex].topicList[topicIndex].objectAnswer = score;
        // };

        /**
         * 主观题答案 暂时不用
         * @param event
         * @param templateIndex
         * @param topicIndex
         */
        // $scope.confirmSubjectAnswer = function (event, templateIndex, topicIndex) {
        //     $scope.questionnaireSurveyData.templateList[templateIndex].topicList[topicIndex].subjectAnswer = event.target.value;
        // };

        /**
         * 带选项的客观题答案点击事件
         * @param topicTypeCode
         * @param templateIndex
         * @param topicIndex
         * @param itemIndex
         * @param checked
         */
        $scope.confirmObjectAnswer = function (topicTypeCode, templateIndex, topicIndex, itemIndex, checked) {
            // console.log("templateIndex: " + templateIndex + " ;topicIndex: " + topicIndex + " ;itemIndex: " + itemIndex);
            // 01700010:单选题；01700020:多选题；01700030:主观题；01700040:单选主观题；01700050:多选主观题
            if ($scope.visitStatus == 1) {
                if (topicTypeCode == "01700010" || topicTypeCode == "01700040") {
                    for (var i = 0, j = $scope.questionnaireSurveyData.templateList[templateIndex].topicList[topicIndex].itemList.length; i < j; i++) {
                        $scope.questionnaireSurveyData.templateList[templateIndex].topicList[topicIndex].itemList[i].isChecked = false; // 清空其他选中的项目
                    }
                    $scope.questionnaireSurveyData.templateList[templateIndex].topicList[topicIndex].itemList[itemIndex].isChecked = true; // 选中所点击项目
                } else if (topicTypeCode == "01700020" || topicTypeCode == "01700050") {
                    $scope.questionnaireSurveyData.templateList[templateIndex].topicList[topicIndex].itemList[itemIndex].isChecked = !$scope.questionnaireSurveyData.templateList[templateIndex].topicList[topicIndex].itemList[itemIndex].isChecked;
                }
            }
        };

        /**
         * 底部提交按钮点击事件
         */
        $scope.submitButtonClick = function () {
            var answer = {
                hospitalId: $scope.questionnaireSurveyData.hospitalId,   // 医院ID
                scRecordId: $scope.questionnaireSurveyData.scRecordId,  // 病友圈随访记录ID
                hcrmRecordId: $scope.questionnaireSurveyData.hcrmRecordId,  // HCRM随访记录ID
                templateList: []
            };
            //check必答题是否全部回答完毕
            for (var templateIndex = 0; templateIndex < $scope.questionnaireSurveyData.templateList.length; templateIndex++) {
                var template = $scope.questionnaireSurveyData.templateList[templateIndex];
                var answerTemplate = {
                    scTemplateId: template.scTemplateId,
                    hcrmTemplateId: template.hcrmTemplateId,
                    topicList: []
                };

                for (var topicIndex = 0; topicIndex < template.topicList.length; topicIndex++) {
                    var topic = template.topicList[topicIndex];
                    if (!topic.objectAnswer) {
                        var objectAnswer = [];
                        for (var itemIndex = 0; topic.itemList && (itemIndex < topic.itemList.length); itemIndex++) {
                            if (topic.itemList[itemIndex].isChecked) {
                                objectAnswer.push(topic.itemList[itemIndex].scItemId);
                            }
                        }
                        topic.objectAnswer = objectAnswer.join(",");
                    }
                    if (topic.isFacing
                        && !topic.subjectAnswer
                        && !topic.objectAnswer) {
                        KyeeMessageService.message({
                            title: KyeeI18nService.get("update_user.sms", "消息"),
                            content: "为了帮助医生全面了解您的就医情况，请完成全部问题后提交。",
                            okText: KyeeI18nService.get("custom_patient.iRealKnow", "我知道了！")
                        });
                        return;
                    } else {
                        var answerTopic = {
                            scTopicId: topic.scTopicId,                               //题目ID
                            hcrmTopicId: topic.hcrmTopicId,                         //HCRM题目ID
                            objectAnswer: topic.objectAnswer,
                            subjectAnswer: topic.subjectAnswer
                        };
                        answerTemplate.topicList.push(answerTopic);
                    }
                }

                answer.templateList.push(answerTemplate);
            }
            QuestionnaireSurveyService.submitAnswer(answer, function () {
                QuestionnaireSurveyService.queryQuestionInfoParams.patientName = $scope.questionnaireSurveyData.visitName; //个人聊天界面显示用就诊者名称
                QuestionnaireSurveyService.isFromQuestionnairePageFlag = true;
                PersonalChatService.updateEndMessageList(function(){
                    // 提交数据到后台后，进行页面跳转
                    $ionicViewSwitcher.nextDirection("back");
                    $state.go("personal_chat");
                });
            });

        };

        /**
         * 将后台返回的数据转换成页面展示用的数据
         */
        var formatDisplayData = function () {
            for (var templateIndex = 0; templateIndex < $scope.questionnaireSurveyData.templateList.length; templateIndex++) {
                var template = $scope.questionnaireSurveyData.templateList[templateIndex];
                for (var topicIndex = 0; topicIndex < template.topicList.length; topicIndex++) {
                    var topic = template.topicList[topicIndex];
                    var objectAnswer = topic.objectAnswer || "";
                    for (var itemIndex = 0; itemIndex < topic.itemList.length; itemIndex++) {
                        var item = topic.itemList[itemIndex];
                        if (objectAnswer.indexOf(item.scItemId) > -1) {
                            $scope.questionnaireSurveyData.templateList[templateIndex].topicList[topicIndex].itemList[itemIndex].isChecked = true;
                        }
                    }
                }
            }
        }
    })
    .build();