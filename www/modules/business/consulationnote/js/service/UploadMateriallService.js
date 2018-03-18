/**
 * 产品名称 quyiyuan
 * 创建用户: 张毅
 * 日期: 2017/04/25
 * 创建原因：图文问诊补充信息页面service
 * 修改原因：
 * 修改用户：
 * 修改时间：
 */
new KyeeModule()
    .group("kyee.quyiyuan.consultation.upload_material.service")
    .require([])
    .type("service")
    .name("UploadMaterialService")
    .params(["KyeeUploadFileService", "KyeeMessageService", "HttpServiceBus", "$http"])
    .action(function (KyeeUploadFileService, KyeeMessageService, HttpServiceBus, $http) {
        var def = {
            // 上传图片列表
            uploadPicList: [],
            // 调用wx.getLocalImgData接口的图片列表
            convertPicList: [],
            // 转换后的图片列表
            convertedPicList: [],
            // 上传图片唯一标示
            sequenceNo: '',
            // 是否是微信浏览器
            isFromWeiXin: jsInterface.isWeiXin() ? true : false,
            reservationId:'',

            /**
             * 调用微信插件获取用户照片
             * @param url
             * @param count 可选择的图片张数
             * @param onSuccess
             */
            chooseImg: function (url, count, onSuccess) {
                HttpServiceBus.connect({
                    url: 'realname/action/GetPictureActionC.jspx',
                    params: {
                        op: 'getWXConfig',
                        currentUrl: url
                    },
                    onSuccess: function (retVal) {
                        if (retVal.success) {
                            var result = retVal.data;
                            wx.config({
                                debug: false,
                                appId: result.appId, // 必填，公众号的唯一标识
                                timestamp: result.timeStamp, // 必填，生成签名的时间戳
                                nonceStr: result.nonceStr, // 必填，生成签名的随机串
                                signature: result.signature,// 必填，签名
                                jsApiList: [
                                    'chooseImage',
                                    'previewImage',
                                    'getLocalImgData',
                                    'uploadImage']
                            });
                            wx.ready(function () {
                                wx.chooseImage({
                                    count: count, // 可选取图片数量
                                    sizeType: ['compressed'], // 指定缩略图
                                    sourceType: ['album'], // 指定来源是相册
                                    success: function (res) {
                                        onSuccess && onSuccess(res.localIds); // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
                                    },
                                    fail: function (res) {
                                        KyeeMessageService.broadcast({
                                            content: "读取照片信息失败，请稍后重试"
                                        });
                                    }
                                });
                            });
                        }else {
                            KyeeMessageService.broadcast({
                                content: retVal.message
                            });
                        }
                    },
                    onError: function (retVal) {
                        KyeeMessageService.broadcast({
                            content: retVal.message
                        });
                    }
                });
            },

            /**
             * 页面通过LocalID预览图片（针对1.2.0以下版本的适配）此接口仅在 iOS WKWebview 下提供，用于兼容 iOS WKWebview 不支持 localId 直接显示图片的问题
             * @param onSuccess
             */
            getLocalImagesData: function (onSuccess) {
                var me = this;
                wx.getLocalImgData({
                    localId: me.convertPicList[0], // 图片的localID
                    success: function (res) {
                        me.convertedPicList.push({
                            imgUrl: res.localData,
                            localId: me.convertPicList.shift()
                        });
                        if (me.convertPicList.length > 0) {
                            me.getLocalImagesData(onSuccess);
                        } else {
                            onSuccess && onSuccess(me.convertedPicList);
                        }
                    },
                    fail: function (msg) {
                        KyeeMessageService.broadcast({
                            content: "读取照片信息失败，请稍后重试"
                        });
                    }
                });
            },

            /**
             * 提交按钮点击请求后台方法
             * @param diseaseInfo 用户填写的疾病信息
             * @param userInfo 用户(就诊者)信息
             * @param onSuccess
             * @param onError
             */
            submit: function (imgType, onSuccess, onError) {
                var me = this;
                HttpServiceBus.connect({
                    url: 'consultation/action/ConsultationRecordActionC.jspx',
                    params: {
                        op:"uploadPictureActionC",
                        RESERVATION_ID: me.consultParam.hospitalId,
                        imgType:imgType
                    },
                    onSuccess: function (retVal) {
                        onSuccess && onSuccess(retVal);
                    },
                    onError: function (retVal) {
                        onError && onError(retVal);
                    }
                });
            },

            /**
             * 上传图片方法
             * @param onSuccess
             */
            submitPictures: function (onSuccess) {
                var me = this;
                //显示loading
                KyeeMessageService.loading({
                    mask: true
                });
                var serverURL = DeploymentConfig.SERVER_URL_REGISTRY.default + "consultation/action/ConsultationRecordActionC.jspx?"+"loc=c&op=uploadPictureActionC";
                var params = {
                    RESERVATION_ID:def.reservationId,
                    FILE_TYPE: me.uploadPicList[0].imgType
                };
                    KyeeUploadFileService.uploadFile(
                        function (response) {
                            var data = JSON.parse(response.response);
                            if (data.success) {
                                if (me.uploadPicList.length > 0) {
                                    me.submitPictures(onSuccess);
                                } else {
                                    KyeeMessageService.hideLoading(); //隐藏loading
                                    onSuccess && onSuccess();
                                }
                            } else {
                                KyeeMessageService.hideLoading(); //隐藏loading
                                KyeeMessageService.broadcast({
                                    content: "图片上传失败，请稍后重试",
                                    duration: 1000
                                });
                            }
                        },
                        function (response) {
                            KyeeMessageService.hideLoading(); //隐藏loading
                            KyeeMessageService.broadcast({
                                content: "图片上传失败，请稍后重试",
                                duration: 1000
                            });
                        }, me.uploadPicList.shift().imgUrl, serverURL, "image/jpeg", params);

            }
        };
        return def;
    })
    .build();
