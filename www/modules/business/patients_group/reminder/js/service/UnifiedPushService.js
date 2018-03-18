/**
 * Created by lizhihu on 2017/8/28.
 */
/**
 * 产品名称：quyiyuan
 * 创建者：dangliming
 * 创建时间：2017年2月15日13:54:30
 * 创建原因：病友圈消息中心药品推送服务层
 */

new KyeeModule()
    .group("kyee.quyiyuan.patients_group.unified_push.service")
    .require([])
    .type("service")
    .name("UnifiedPushService")
    .params(["HttpServiceBus"])
    .action(function (HttpServiceBus) {
        return {
            msgData: null,
            isFromOuterPush: false,  //是否是外部推送
            isFromWeChat: false, //微信推送
            messageId: undefined,
            loadData: function (messageId, successCall) {  //edit by wangsannv KYEEAPPC-10248
                if (messageId) {
                    HttpServiceBus.connect({
                        url: "messageCenter/action/MessageCenterActionC.jspx",
                        params: {
                            op: "loadMessageById",
                            messageId: messageId
                        },
                        onSuccess: function (data) {
                            if (data.success) {
                                var result = JSON.parse(data.data.MESSAGE_PARAMETER);
                                successCall(result);
                            }
                        }
                    });
                }
            }
        };
    })

    .build();
