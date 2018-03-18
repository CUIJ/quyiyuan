/**
 * 产品名称：quyiyuan
 * 创建者：wangsannv
 * 创建时间：2017年4月25日09:58:12
 * 创建原因：联系医生服务器
 * 修改者：
 * 修改原因：
 *
 */

new KyeeModule()
    .group("kyee.quyiyuan.appointment.connect_doctor.service")
    .require([
        "kyee.quyiyuan.patients_group.personal_chat.service",
        "kyee.quyiyuan.emoji.service",
        "kyee.quyiyuan.login.service",
        "kyee.quyiyuan.imUtil.service"
    ])
    .type("service")
    .name("ConntectDoctorService")
    .params(["HttpServiceBus", "PersonalChatService", "EmojiService", "LoginService", "IMUtilService"])
    .action(function (HttpServiceBus, PersonalChatService, EmojiService, LoginService, IMUtilService) {
        var connectData = {
            packageData: function (sender, receiver, scMsgType) {
                var userData = {};
                userData.sender = sender;
                userData.receiver = receiver;
                var nowTime = new Date().getTime();
                var preMsgTime = nowTime;
                userData.userName = sender.userPetname,
                    userData.createTime = nowTime,
                    userData.showTimeFlag = IMUtilService.getShowTimeFlag(preMsgTime, nowTime),
                    userData.scMsgType = scMsgType;
                return userData;
            },
            sendImMsg: function (sender, receiver, scMsgType, desc) {
                var userData = connectData.packageData(sender, receiver, scMsgType);
                var attach = {
                    userName: receiver.userPetname,
                    scMsgType: userData.scMsgType, //是否为唯一的标示
                    scRecordId: userData.sender.scRecordId,
                    visitName: userData.sender.visitName, //就诊者姓名
                    hospitalLogo:receiver.hospitalLogo,
                    buyMedicine:sender.buyMedicine,
                    inspection:sender.inspection
                };
                var remoteExtension = {
                    ver:IMChatting.currentCustomVersion,
                    type:'qypa-custom-'+attach.scMsgType
                };
                var message = {
                    scene: 0,
                    to:receiver.yxUser ,
                    pushContent: '购药开单消息',
                    attach: attach,
                    remoteExtension:remoteExtension
                };
                IMDispatch.sendCustomMessage(message);
            },
            sendContent: function (tmpMessage) {
                connectData.sendTxtMsg(tmpMessage, function (message) {}, function (message) {});
            },
            sendTxtMsg: function (msgContent, index, onSuccess, onError) {
                var sendMessage = angular.copy(msgContent);
                sendMessage.text = EmojiService.formatEmojiImageToChineseSignTo(sendMessage.text);
                var messageResult = PersonalChatService.transferMsgData(sendMessage);
                //YX 保存消息saveMessage

            }
        };
        return connectData;
    })
    .build();