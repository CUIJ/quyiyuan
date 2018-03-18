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
    .group("kyee.quyiyuan.consultation.add_information.service")
    .require([])
    .type("service")
    .name("AddInformationService")
    .params(["KyeeUploadFileService", "KyeeMessageService", "HttpServiceBus", "$http"])
    .action(function (KyeeUploadFileService, KyeeMessageService, HttpServiceBus, $http) {
        var def = {
            // 补充资料页面所需参数
            consultParam: {
                hospitalId: '',
                deptCode: '',
                doctorCode: '',
                consultType: '',            //付费咨询类型 [Number]
                payAmount: '',              //需支付金额 [Number]
                free: '',                   //是否免费 [Boolean]
                beforeConsultAmount: 0,     //诊前价格 [Number]
                afterConsultAmount: 0,      //诊后价格 [Number]
                isRegular: '',              //是否就诊过 [Boolean]
                doctorName: '',             //医生姓名 [String]
                isOnline: "",
                reminder:""                 //在线咨询提示语
            },
            shouldBeFree: false,           //若是诊后价格为0，标识计算出来的免费
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

            switchCPforConsult: false,  //跳转至切换就诊者页面的标志

            patientId: '',//病人ID
            patientPosition: '',//患者位置

            /**
             * by jiangpin 2017年8月9号11:17 任务号： KYEEAPPC-11834
             * [chooseImReminder 获取图文咨询填写资料提示语]
             * @param  {[type]} param   [description]
             * @param  {[type]} success [description]
             * @param  {[type]} fail    [description]
             * @return {[type]}         [description]
             */
            chooseImReminder:function(param, success, fail){
                HttpServiceBus.connect({
                    url:"third:pay_consult/reminder/im",
                    params:{
                        hospitalId: param,
                    },
                    onSuccess:function (response) {
                        if(response.success){
                            typeof success === 'function' && success(response);
                        }else{
                            KyeeMessagerService.broadcast({
                                content: response.message
                            });
                        }
                    },
                    onError:function (error) {
                        typeof fail === 'function' && fail(error);
                    }
                });
            },
            /**
             * by jiangpin 2017年8月9号11:17 任务号： KYEEAPPC-11834
             * [choosePhoneReminder 获取电话咨询填写资料提示语]
             * @param  {[type]} param   [description]
             * @param  {[type]} success [description]
             * @param  {[type]} fail    [description]
             * @return {[type]}         [description]
             */
            choosePhoneReminder:function(param, success, fail){
                HttpServiceBus.connect({
                    url:"third:pay_consult/reminder/phone",
                    params:{
                        hospitalId: param,
                    },
                    onSuccess:function (response) {
                        if(response.success){
                            typeof success === 'function' && success(response);
                        }else{
                            KyeeMessagerService.broadcast({
                                content: response.message
                            });
                        }
                    },
                    onError:function (error) {
                        typeof fail === 'function' && fail(error);
                    }
                });
            },

            /**
             * by jiangpin 2017年8月9号11:17 任务号： KYEEAPPC-11834
             * [chooseVideoReminder 获取视频咨询填写资料提示语]
             * @param  {[type]} param   [description]
             * @param  {[type]} success [description]
             * @param  {[type]} fail    [description]
             * @return {[type]}         [description]
             */
            chooseVideoReminder:function(param, success, fail){
                HttpServiceBus.connect({
                    url:"third:pay_consult/reminder/video",
                    params:{
                        hospitalId: param,
                    },
                    onSuccess:function (response) {
                        if(response.success){
                            typeof success === 'function' && success(response);
                        }else{
                            KyeeMessagerService.broadcast({
                                content: response.message
                            });
                        }
                    },
                    onError:function (error) {
                        typeof fail === 'function' && fail(error);
                    }
                });
            },

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
                        } else {
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
            submit: function (diseaseInfo, userInfo, onSuccess, onError) {
                var me = this;
                HttpServiceBus.connect({
                    url: 'third:pay_consult/order/write',
                    params: {
                        diseaseName: diseaseInfo.name,
                        diseaseDescription: diseaseInfo.description,
                        diseaseHistory: diseaseInfo.history,
                        hospitalId: me.consultParam.hospitalId,
                        deptCode: me.consultParam.deptCode,
                        doctorCode: me.consultParam.doctorCode,
                        userVsId: userInfo.USER_VS_ID,
                        contactPhone: userInfo.contactPhone,
                        consultType: me.consultParam.consultType, //咨询类型 1：图文 2：电话 3：视频
                        free: me.consultParam.free || me.shouldBeFree,
                        isRegular: me.consultParam.isRegular, //诊后:true；诊前:false
                        sequenceNo: me.sequenceNo,
                        payAmount: me.consultParam.payAmount,
                        isShare: me.chooseShare, //是否允许共享抢单
                        patientId: me.patientId,//病人ID
                        patientPosition: me.patientPosition//患者位置
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
                if (me.isFromWeiXin) {
                    wx.uploadImage({
                        localId: '' + me.uploadPicList.shift().localId,
                        isShowProgressTips: 0,
                        success: function (res) {
                            var webImg = new FormData();
                            webImg.append('sequenceNo', me.sequenceNo);
                            webImg.append('serverId', res.serverId);
                            webImg.append('weChatFlag', true);
                            $http({
                                method: 'POST',
                                url: DeploymentConfig.SERVER_URL_REGISTRY.third + 'pay_consult/order/image/upload',
                                data: webImg,
                                headers: {'Content-Type': undefined},
                                transformRequest: angular.identity
                            }).success(function () {
                                if (me.uploadPicList.length > 0) {
                                    me.submitPictures(onSuccess);
                                } else {
                                    KyeeMessageService.hideLoading(); //隐藏loading
                                    onSuccess && onSuccess();
                                }
                            }).error(function () {
                                KyeeMessageService.hideLoading(); //隐藏loading
                                KyeeMessageService.broadcast({
                                    content: "图片上传失败，请稍后重试"
                                });
                            });
                        },
                        fail: function (res) {
                            KyeeMessageService.hideLoading(); //隐藏loading
                            KyeeMessageService.broadcast({
                                content: "图片上传失败，请稍后重试"
                            });
                        }
                    });
                } else {
                    var serverURL = DeploymentConfig.SERVER_URL_REGISTRY.third + 'pay_consult/order/image/upload';
                    var params = {
                        sequenceNo: me.sequenceNo,
                        weChatFlag: false
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
            }
        };
        return def;
    })
    .build();