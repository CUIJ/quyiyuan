/**
 * 产品名称 KYMH
 * 创建用户: 朱学亮
 * 日期: 2015/5/10
 * 时间: 15:45
 * 创建原因：实名认证的service
 * 修改原因：
 * 修改用户：
 * 修改时间：
 */
new KyeeModule()
    .group("kyee.quyiyuan.center.authentication.service")
    .require(["kyee.framework.service.messager",
        "kyee.framework.file.upload"])
    .type("service")
    .name("AuthenticationService")
    .params(["KyeeMessagerService", "HttpServiceBus", "RsaUtilService", "KyeeMessageService", "KyeeUploadFileService", "UpdateUserService", "KyeeI18nService"])
    .action(function (KyeeMessagerService, HttpServiceBus, RsaUtilService, KyeeMessageService, KyeeUploadFileService, UpdateUserService, KyeeI18nService) {
        var def = {


            lastClass: null,
            //实名认证信息  By  章剑飞  KYEEAPPC-2862
            HOSPITAL_SM: undefined,

            //就诊者实名修改（APK）  By  张家豪  KYEEAPPC-4434
            AUTH_TYPE: 0,//AUTH_TYPE    0:实名认证  1：追诉认证
            AUTH_SOURCE:0,//AUTH_SOURCE  0:用户   1：账户
            uploadIdCard: function (idCardPic, userInfo, onSuccess) {
                // show loading
                KyeeMessageService.loading();
                var rootServerURL = AppConfig.SERVER_URL;
                var serverURL = rootServerURL + "realname/action/GetPictureActionC.jspx?" + "loc=c&op=saveRealName";
                var params = {};
                params.ID_NO = userInfo.idNo;
                params.serverUrl = rootServerURL;
                params.patientName = userInfo.name;
                params.patientPhone = userInfo.phone;
                params.userId = userInfo.userId;// 【个人中心】实名认证增加传入后台参数  By  张家豪  KYEEAPPC-3404
                params.userVsId = userInfo.userVsID;// 【个人中心】实名认证增加传入后台参数  By  张家豪  KYEEAPPC-3404
                params.opVersion = DeploymentConfig.VERSION;// 【个人中心】实名认证增加传入后台参数  By  张家豪  KYEEAPPC-3404
                params.AUTH_TYPE = def.AUTH_TYPE;//AUTH_TYPE    0:实名认证  1：追诉认证
                params.AUTH_SOURCE = def.AUTH_SOURCE;//AUTH_SOURCE  0:用户   1：账户
                if(def.AUTH_TYPE === 1){
                    params.APPLY_MODIFY_NAME = userInfo.APPLY_MODIFY_NAME;
                    params.APPLY_MODIFY_IDNO = userInfo.APPLY_MODIFY_IDNO;
                }
                KyeeUploadFileService.uploadFile(
                    function (response) {
                        // 取消loading
                        KyeeMessageService.hideLoading();
                        // 上传成功，解析返回数据
                        var data = response.response; // 获得一个Json
                        data = JSON.parse(data);      // 将json转为对象

                        //实名图片上传成功之后提示信息内容修改  APPREQUIREMENT-736
                        if (data && data.message) {
                            KyeeMessageService.broadcast({
                                content: data.message
                            });
                            def.AUTH_TYPE = 0;//AUTH_TYPE    0:实名认证  1：追诉认证
                            def.AUTH_SOURCE = 0;//AUTH_SOURCE  0:用户   1：账户
                        } else {
                            KyeeMessageService.broadcast({
                                content: KyeeI18nService.get("account_authentication.upLoadPictureFail","图片上传失败请重试！")
                            });
                            def.AUTH_TYPE = 0;//AUTH_TYPE    0:实名认证  1：追诉认证
                            def.AUTH_SOURCE = 0;//AUTH_SOURCE  0:用户   1：账户
                        }
                        onSuccess();// 需要实名认证的新就诊者,添加认证过后，回到附加就诊者界面，再次点击刚刚添加过的就诊者认证状态为未认证   By  张家豪  KYEEAPPTEST-2810
                    },
                    function (error) {
                        // 上传失败
                        // 取消loading
                        KyeeMessageService.hideLoading();
                        KyeeMessageService.broadcast({
                            content: KyeeI18nService.get("account_authentication.upLoadPictureFail","图片上传失败请重试！")
                        });
                        def.AUTH_TYPE = 0;//AUTH_TYPE    0:实名认证  1：追诉认证
                        def.AUTH_SOURCE = 0;//AUTH_SOURCE  0:用户   1：账户
                    }, idCardPic, serverURL, "image/jpeg", params);
            },
            getFailedReason: function (Callback, userVsId, idNo) {
                HttpServiceBus.connect({
                    url: 'realname/action/GetPictureActionC.jspx',
                    params: {
                        op: 'queryErrorByIdNo',
                        userVsId: userVsId,
                        idNo: idNo,
                        AUTH_TYPE: def.AUTH_TYPE,
                        AUTH_SOURCE: def.AUTH_SOURCE
                    },
                    onSuccess: function (retVal) {
                        Callback(retVal);
                    },
                    onError: function (retVal) {
                    }
                });

            },
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
                                jsApiList: [
                                    'chooseImage',
                                    'previewImage',
                                    'getLocalImgData',
                                    'uploadImage'] //调用拍照或从手机相册中选图, 预览图片,上传图片插件
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
                                            content: KyeeI18nService.get("account_authentication.readImgFail","读取照片信息失败，请稍后重试")
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
            },
            getLocalImgData: function(localId, success){
                if (window.__wxjs_is_wkwebview){
                    wx.checkJsApi({
                        jsApiList: ['getLocalImgData'], // 需要检测的JS接口列表，所有JS接口列表见附录2,
                        success: function(res) {
                            if (res.checkResult.getLocalImgData) {
                                wx.getLocalImgData({
                                    localId: localId, // 图片的localID
                                    success: function(res) {
                                        var localData = res.localData; // localData是图片的base64数据，可以用img标签显
                                       // localData = localData.replace('jgp', 'jpeg');
                                        success(localData);
                                    },
                                    fail: function(msg){
                                        KyeeMessageService.broadcast({
                                            content: KyeeI18nService.get("account_authentication.readImgFail","读取照片信息失败，请稍后重试")
                                        });
                                    }
                                });
                            } else {
                                KyeeMessageService.broadcast({
                                    content: KyeeI18nService.get("account_authentication.readImgFail","读取照片信息失败，请稍后重试")
                                });
                            }
                        }
                    });
                }else{
                    success(localId);
                }
            },
            /**
             * 将用户照片上传到微信服务器
             * @param success 成功回调
             * @param localId 上传的图片ID
             */
            uploadImageToWxServer : function(localId,userInfo,success){
                wx.uploadImage({
                    localId: '' + localId,
                    isShowProgressTips: 1,
                    success: function(res) {
                        def.saveAuthenticaData(success,res.serverId,userInfo);
                    },
                    fail : function(res){
                        KyeeMessageService.broadcast({
                            content: KyeeI18nService.get("account_authentication.upLoadPictureFail","图片上传失败请重试！")
                        });
                    }
                });
            },
            /**
             * 保存实名认证信息
             * @param success 保存成功的回调
             * @param serverId 要下载的图片ID
             * @param userInfo 用户信息
             */
            saveAuthenticaData: function(success,serverId,userInfo){
                var params = {};
                params.ID_NO = userInfo.idNo;
                params.patientName = userInfo.name;
                params.patientPhone = userInfo.phone;
                params.userId = userInfo.userId;
                params.userVsId = userInfo.userVsID;
                params.opVersion = DeploymentConfig.VERSION;
                params.AUTH_TYPE = def.AUTH_TYPE;//AUTH_TYPE    0:实名认证  1：追诉认证
                params.AUTH_SOURCE = def.AUTH_SOURCE;//AUTH_SOURCE  0:用户   1：账户
                params.op = "saveRealName";
                params.serverId = serverId;
                if(def.AUTH_TYPE === 1){
                    params.APPLY_MODIFY_NAME = userInfo.APPLY_MODIFY_NAME;
                    params.APPLY_MODIFY_IDNO = userInfo.APPLY_MODIFY_IDNO;
                }
                HttpServiceBus.connect({
                    url: 'realname/action/GetPictureActionC.jspx',
                    params: params,
                    onSuccess: function (data) {
                        if (data.success) {
                            success();
                        }
                        else
                        {
                            KyeeMessageService.broadcast({
                                content: data.message
                            });
                        }
                    }
                });
            }
        };
        return def;
    })
    .build();