/**
 * 产品名称：quyiyuan
 * 创建者：程铄闵
 * 创建时间：2016年10月12日09:22:29
 * 创建原因：添加事故资料服务
 * 任务号：KYEEAPPC-8137
 */
new KyeeModule()
    .group("kyee.quyiyuan.accidentRecords.service")
    .type("service")
    .name("AccidentRecordsService")
    .params(["HttpServiceBus", "KyeeMessageService"])
    .action(function (HttpServiceBus, KyeeMessageService) {
        var def = {
            pictureTotal:0,//照片总数

            /**
             * 调用微信插件获取用户照片
             * 任务:APPCOMMERCIALBUG-2267
             * 作者:gaoyulou
             */
            chooseImage: function(onSuccess,currentUrl){
                HttpServiceBus.connect({
                    url: 'realname/action/GetPictureActionC.jspx',
                    params: {
                        op: 'getWXConfig',
                        currentUrl:currentUrl
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            var result = data.data;
                            wx.config({
                                debug: false,
                                appId: result.appId, // 必填，公众号的唯一标识
                                timestamp: result.timeStamp, // 必填，生成签名的时间戳
                                nonceStr: result.nonceStr, // 必填，生成签名的随机串
                                signature: result.signature,// 必填，签名
                                jsApiList: ['chooseImage','previewImage','uploadImage'] //调用拍照或从手机相册中选图, 预览图片,上传图片插件
                            });
                            wx.ready(function(){
                                wx.chooseImage({
                                    count: 1, // 选取一张图片
                                    sizeType: ['original'], // 可以指定是原图还
                                    sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机
                                    success: function (res) {
                                        onSuccess(res.localIds);
                                    },
                                    fail : function(res){
                                        KyeeMessageService.broadcast({
                                            content: '读取照片信息失败，请稍后重试'
                                        });
                                    }
                                });
                            });
                        }
                        else
                        {
                            KyeeMessageService.broadcast({
                                content: data.message
                            });
                        }
                    },
                    onError: function (retVal) {
                    }
                });
            }
        };
        return def;
    })
    .build();