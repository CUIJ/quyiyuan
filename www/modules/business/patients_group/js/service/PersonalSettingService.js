/**
 * 产品名称：quyiyuan
 * 创建者：wangyaning
 * 创建时间： 2016/7/22
 * 创建原因：消息tab界面
 */
new KyeeModule()
    .group("kyee.quyiyuan.patients_group.personal_setting.service")
    .require([
        "kyee.framework.service.message",
        "kyee.framework.file.upload"
    ])
    .type("service")
    .name("PersonalSettingService")
    .params([
        "HttpServiceBus",
        "KyeeMessageService",
        "KyeeUtilsService",
        "CacheServiceBus",
        "KyeeI18nService",
        "KyeeUploadFileService"
    ])
    .action(function(
        HttpServiceBus,KyeeMessageService,KyeeUtilsService,
        CacheServiceBus,KyeeI18nService,
        KyeeUploadFileService){

        var resultData = {
            modifyUserId : "", // add by wyn 20161124 修改个人昵称新界面所需userId

            /**
             * 获取个人设置信息
             * @param callBack
             */
            getPersonalSettingInfo:function(callBack){
                HttpServiceBus.connect({
                    url: 'third:userManage/user/accountinfo/get',
                    onSuccess: function (retVal) {
                        if (retVal.success) {
                            resultData.updateStorageCache(retVal.data.userPetname, retVal.data.userPhoto, retVal.data.userRegion, retVal.data.sex);
                            callBack(retVal.data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: retVal.message || KyeeI18nService.get("commonText.networkErrorMsg", "网络异常，请稍后重试！"),
                                duration: 2000
                            });
                        }
                    }
                });
            },

            /**
             * 判断昵称是否已存在
             */
            isExistsNickName:function(nickName,callBack){
                HttpServiceBus.connect({
                    url: "third:userManage/user/accountinfo/checkPetname",
                    params: {
                        userPetname: nickName
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            callBack(data.data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message || KyeeI18nService.get("commonText.networkErrorMsg", "网络异常，请稍后重试！"),
                                duration: 2000
                            });
                        }
                    }
                });
            },

            /**
             *  执行修改昵称
             *  modify by wyn 20161124 :任务内容：个人昵称修改为跳转至新界面
             */
            doModifyNickName:function(userId,nickName,userRegion,callBack){
                HttpServiceBus.connect({
                    url: "third:userManage/user/accountinfo/update/userpetname",
                    params: {
                        USER_ID: userId || resultData.modifyUserId,
                        userPetname: nickName || "",
                        userRegion: userRegion || ""
                    },
                    onSuccess: function (data) {
                         if (data.success) {
                             resultData.updateStorageCache(nickName, "", userRegion);
                             callBack(data.data);
                         } else {
                             KyeeMessageService.broadcast({
                                 content: data.message || KyeeI18nService.get("commonText.networkErrorMsg", "网络异常，请稍后重试！"),
                                 duration: 2000
                             });
                         }
                    }
                });
            },

            /**
             * 上传图像
             * @param userPhoto
             * modify by wyn 20161124 增加更新缓存
             */
            uploadUserPhoto:function(userId,userPhoto,callBack){
                //显示loading
                KyeeMessageService.loading({
                    mask: true
                });
                var serverURL = DeploymentConfig.SERVER_URL_REGISTRY.third + "userManage/user/accountinfo/update/userphoto";
                var params = {
                    USER_ID: userId
                };
                KyeeUploadFileService.uploadFile(
                    function (response) {
                        KyeeMessageService.hideLoading();  //隐藏loading
                        // 上传成功，解析返回数据
                        var data = JSON.parse(response.response);
                        if (data.success) {
                            resultData.updateStorageCache("", data.data.userPhoto, "");
                            callBack && callBack(true);
                        } else {
                            KyeeMessageService.broadcast({
                                content: KyeeI18nService.get("comm_patient_detail.loadHearFalse", "上传头像失败请重试！")
                            });
                        }
                    },
                    function (error) {
                        KyeeMessageService.hideLoading();//隐藏loading
                        // 上传失败
                        KyeeMessageService.broadcast({
                            content: KyeeI18nService.get("comm_patient_detail.loadHearFalse", "上传头像出错请重试！")
                        });
                    }, userPhoto, serverURL, "image/jpeg", params);
            },

            /**
             *  调用前端DB清除聊天记录数据、同时清除聊天记录中的缓存图片
             *  modifyBy liwenjuan 2016/12/06
             */
            clearHistoryData:function(){
                //YX 清除图片、文件缓存
                CacheServiceBus.getStorageCache().set(CACHE_CONSTANTS.STORAGE_CACHE.RECOMMEND_GROUP,null);
                CacheServiceBus.getStorageCache().set(CACHE_CONSTANTS.STORAGE_CACHE.GROUP_ANNOUNCEMENT,null);
            },

            /**
             * 更新本地缓存用户信息:根据传入参数值更新缓存对应字段
             * add by wyn 20161124
             * @param nickName
             * @param userPhoto
             * @param userRegion
             */
            updateStorageCache: function(nickName, userPhoto, userRegion,sex){
                var imUserInfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.USER_ACT_INFO);
                if(nickName){
                    imUserInfo.userPetname = nickName;
                }
                if(userPhoto){
                    imUserInfo.userPhoto = userPhoto;
                }
                if(userRegion){
                    imUserInfo.userRegion = userRegion;
                }

                if(sex){
                    imUserInfo.sex = sex;
                }
                CacheServiceBus.getStorageCache().set(CACHE_CONSTANTS.STORAGE_CACHE.USER_ACT_INFO,imUserInfo);
            }
        };
        return resultData;
    })
    .build();