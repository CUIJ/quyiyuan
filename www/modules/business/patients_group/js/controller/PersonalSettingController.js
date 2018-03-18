/**
 * 产品名称：quyiyuan
 * 创建者：wangyaning
 * 创建时间： 2016/7/22
 * 创建原因：个人设置界面
 */
new KyeeModule()
    .group("kyee.quyiyuan.patients_group.personal_setting.controller")
    .require([
        "kyee.framework.service.view",
        "kyee.framework.service.message",
        "kyee.quyiyuan.patients_group.personal_setting.service",
        "kyee.framework.device.deviceinfo",
        "kyee.framework.device.message",
        "kyee.framework.device.camera",
        "kyee.quyiyuan.center.bindMSCard.service",
        "kyee.quyiyuan.center.bindMSCard.controller",
        "kyee.quyiyuan.patients_group.modify_personal_name.controller",
        "kyee.quyiyuan.patients_group.personal_chat.service",
        "kyee.quyiyuan.patients_group.conversation.service",
        "kyee.quyiyuan.imUtil.service"
    ])
    .type("controller")
    .name("PersonalSettingController")
    .params([
        "$scope",
        "$state",
        "$ionicHistory",
        "KyeeViewService",
        "CacheServiceBus",
        "KyeeMessageService",
        "KyeeListenerRegister",
        "KyeeI18nService",
        "$ionicScrollDelegate",
        "AuthenticationService",
        "KyeeCameraService",
        'KyeeUtilsService',
        "KyeeDeviceInfoService",
        "PersonalSettingService",
        "PersonalChatService",
        "ConversationService",
        "IMUtilService"
    ])
    .action(function ($scope, $state, $ionicHistory, KyeeViewService, CacheServiceBus, KyeeMessageService,
        KyeeListenerRegister, KyeeI18nService, $ionicScrollDelegate, AuthenticationService,
        KyeeCameraService, KyeeUtilsService, KyeeDeviceInfoService, PersonalSettingService,
        PersonalChatService, ConversationService, IMUtilService) {
        var memoryCache = CacheServiceBus.getMemoryCache();
        var userId = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID;
        var storageCache = CacheServiceBus.getStorageCache();
        var personalSetInfo = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.USER_ACT_INFO);
        $scope.userInfo = {
            nickName: personalSetInfo.userPetname,
            patientImage: personalSetInfo.userPhoto,
            phoneNum: personalSetInfo.userPhone,
            sex: personalSetInfo.sex,
            userRegion: "" //地区字段位通过病友圈缓存维护，故初始值为空，在初始化请求回调后处理
        };
        $scope.showSubmitBtn = false; //是否显示提交按钮，默认不显示
        $scope.placeholder = {
            nickNameText: KyeeI18nService.get("update_user.putYourName", "最多可输入10字"),
            addressText: KyeeI18nService.get("update_user.selectAddress", "请选择地区")
        };

        /**
         * 监听进入当前页面
         */
        KyeeListenerRegister.regist({
            focus: "personal_setting",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (params) {
                init();
            }
        });

        /**
         * 界面初始化
         * add by wyn 21060725
         * modify by licong  增加个人所在地区 userRegion
         * modify by wyn 20161124 提取更新缓存方法
         */
        var init = function () {
            //根据上一个页面判断是否返回是需要加载聊天记录等信息
            var backView = $ionicHistory.backView();
            var lastView = $ionicHistory.backView().stateId;
            if(lastView == 'conversation'){
                ConversationService.pullMessageList  = false;
            }else if (lastView == 'personal_chat'){
                PersonalChatService.pullMessageList = false;
            }
            PersonalSettingService.getPersonalSettingInfo(function (data) {
                $scope.userInfo.nickName = data.userPetname; //用户昵称
                $scope.userInfo.phoneNum = data.userPhone; //手机号码
                $scope.userInfo.patientImage = data.userPhoto; //用户照片
                $scope.userInfo.sex = data.sex; //0:其他;1:男;2:女;
                $scope.oldNickName = data.userPetname; //设置修改前用户昵称
                $scope.oldUserPhoto = data.userPhoto; //设置修改前用户图像
                if (data.userRegion) {
                    $scope.userInfo.userRegion = data.userRegion;
                    $scope.oldUserRegion = data.userRegion;
                } else {
                    $scope.userInfo.userRegion = "";
                    $scope.oldUserRegion = "";
                    //modify by wyn 20170105 提取获取用户定位信息至公共方法
                    //YX 获取用户的定位方法

                    /* var nowPosition = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.LOAD_CURRENT_CITY_INFO);
                     if(nowPosition && nowPosition.PROVINCE_NAME){
                          $scope.userInfo.userRegion = nowPosition.PROVINCE_NAME;
                          if(nowPosition.CITY_NAME){
                              $scope.userInfo.userRegion = $scope.userInfo.userRegion + "-" + nowPosition.CITY_NAME;
                              if(nowPosition.PLACE_NAME){
                                  $scope.userInfo.userRegion = $scope.userInfo.userRegion + "-" + nowPosition.PLACE_NAME;
                              }
                          }
                      }*/
                }
            });
        };

        $scope.bind = function (params) {
            $scope.show = params.show;
        };
        var savedValue = {
            "0": "", //PROVINCE_CODE,
            "1": "", //CITY_CODE,
            "2": "" //PLACE_CODE
        };

        /**
         * 脏值检测及强制刷新
         */
        function checkApply() {
            if ($scope.$$phase != '$apply' && $scope.$$phase != '$digest') {
                $scope.$apply();
            }
        };
        /**
         * add by licong
         */
        $scope.editAddress = function () {
            $scope.show(savedValue);
            checkApply();
        };

        /**
         * add by licong
         * 增加个人所在地区
         * @param params
         * @returns {boolean}
         */
        $scope.onFinash = function (params) {
            $scope.showSubmitBtn = true;
            savedValue = {
                "0": params[0].value,
                "1": params[1].value,
                "2": params[2].value
            };

            //对港澳台地区进行特殊处理
            if (params[0].value == '710000' || params[0].value == '820000' || params[0].value == '810000') {
                $scope.userInfo.userRegion = params[0].text;
            } else {
                $scope.userInfo.userRegion = params[0].text + "-" + params[1].text + "-" + params[2].text;
            }
            return true;
        };

        /**
         * 点击上传头像
         */
        $scope.clickUpload = function () {
            if (DeploymentConfig.BRANCH_VER_CODE == '03') { //03代表分支版本号为"我家亳州"
                return;
            }
            if (jsInterface.isPatientGroupLegalWebApp()) { //edited by zhangyi at 20161102 删除多余函数定义(isWeiXin)，改为调用既存的方法(IMUtilService.isWeiXin);删掉弹框样式(cancelButtonClass:'qy-bg-grey3')
                var content = "";
                if (IMUtilService.isWeiXin()) {
                    content = "微信公众号暂不支持更换头像，下载趣医APP，给您更优质的业务体验。";
                } else if (IMUtilService.isZFB()) {
                    content = "支付宝生活号暂不支持更换头像，下载趣医APP，给您更优质的业务体验。";
                } else {
                    content = "您的版本暂不支持更换头像，下载趣医APP，给您更优质的业务体验。"
                }
                KyeeMessageService.confirm({
                    content: content,
                    cancelText: "我知道了",
                    okText: "去下载",
                    onSelect: function (flag) {
                        if (flag) {
                            window.location.href = "http://www.quyiyuan.com/mobileweb/mobiledownload.html";
                        }
                    }
                });
            } else {
                KyeeMessageService.actionsheet({
                    title: KyeeI18nService.get("authentication.pleaseUploadPhotos", "请上传照片"),
                    buttons: [{
                        text: KyeeI18nService.get("authentication.fromPhotos", "从相册选择")
                    }],
                    onClick: function (index) {
                        if (index == 0) {
                            $scope.goToAlbum();
                        }
                    },
                    cancelButton: true
                });
            }
        };

        /**
         * 获取当前设备平台 iOS or android
         */
        KyeeDeviceInfoService.getInfo(function (info) {
            $scope.platform = info.platform;
        }, function () {
        });

        /**
         * 点击从相册选择照片
         */
        $scope.goToAlbum = function () {
            if ($scope.platform == "Android") {
                var options = {
                    quality: 40,
                    destinationType: Camera.DestinationType.FILE_URI,
                    targetWidth: 900, //设置图片宽度
                    targetHeight: 900, //设置图片高度
                    allowEdit: true,
                    encodingType: Camera.EncodingType.JPEG,
                    sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM
                };
                KyeeCameraService.getPicture(
                    // 调用成功时返回的值
                    function (retVal) {
                        $scope.userInfo.patientImage = retVal;
                        $scope.$digest();
                    },
                    // 调用失败时返回的值
                    function (retVal) {}, options);
            } else if ($scope.platform == "iOS") {
                var options = {
                    quality: 40,
                    destinationType: Camera.DestinationType.FILE_URI,
                    targetWidth: 900, //设置图片宽度
                    targetHeight: 900, //设置图片高度
                    saveToPhotoAlbum: false,
                    allowEdit: true,
                    sourceType: Camera.PictureSourceType.PHOTOLIBRARY
                };
                KyeeCameraService.getPicture(
                    // 调用成功时返回的值
                    function (retVal) {
                        $scope.userInfo.patientImage = retVal;
                        $scope.$digest();
                    },
                    // 调用失败时返回的值
                    function (retVal) {
                    }, options);
            }
            $scope.showSubmitBtn = true;
        };

        /**
         * 显示修改成功提示
         */
        $scope.showSuccessMessage = function () {
            KyeeMessageService.broadcast({
                title: KyeeI18nService.get("commonText.msgTitle", "消息"),
                content: KyeeI18nService.get("personal_setting_modify_sucess", "修改个人信息成功！"),
                okText: KyeeI18nService.get("commonText.iknowMsg", "我知道了")
            });
        };

        /**
         * 修改个人设置信息：个人图像、昵称
         * modify by wyn 20161124 修改个人昵称改为跳转至新界面
         */
        $scope.modifyPersonalInfo = function () {
            var newNickName = $scope.userInfo.nickName; //修改后用户昵称
            var newUserPhoto = $scope.userInfo.patientImage; //修改后用户图像
            var newUserRegion = $scope.userInfo.userRegion; //修改后用户地址

            /* if(!newNickName){
                KyeeMessageService.message({
                    content: KyeeI18nService.get("clinic_payment_query.checkPatient","昵称不能为空！")
                });
                return;
            }
            checkNickNameFormat(newNickName,function(){
                //勿删勿改：用户未修改昵称--考虑数据库中初始存在相同昵称
                if (newNickName != $scope.oldNickName) {
                    // 验证昵称是否已存在
                    $scope.validNickName(newNickName, function () {
                        // 修改昵称，地址
                        $scope.updateUserInfo(newNickName, newUserPhoto, newUserRegion);
                    });
                } else if(newUserRegion && newUserRegion != $scope.oldUserRegion) {
                    // 修改地址
                    $scope.updateUserInfo(newNickName, newUserPhoto, newUserRegion);
                } else if(newUserPhoto && newUserPhoto != $scope.oldUserPhoto) {
                    // 更新照片
                    uploadUserPhoto(newUserPhoto, function(data){
                        $scope.showSubmitBtn = false;
                        $scope.updateStorageCache(newNickName, data.userPhoto, newUserRegion);
                        $scope.showSuccessMessage();
                    });
                } else {
                    // 没有更改信息
                    $scope.showSubmitBtn = false;//隐藏修改按钮
                }*/
            if (newUserRegion && newUserRegion != $scope.oldUserRegion) {
                // 修改地址
                updateUserInfo(newNickName, newUserPhoto, newUserRegion);
            } else if (newUserPhoto && newUserPhoto != $scope.oldUserPhoto) {
                // 更新照片
                uploadUserPhoto(newUserPhoto, function () {
                    $scope.showSubmitBtn = false;
                    $scope.showSuccessMessage();
                });
            } else {
                $scope.showSubmitBtn = false; //没有更改信息 隐藏修改按钮
            }
        };

        /**
         * 更新用户信息
         * modify by licong
         * modify by wyn 20161124 更新缓存迁移至PersonalSettingService中
         * @param newNickName
         * @param newUserPhoto
         * @param newUserRegion
         */
        var updateUserInfo = function (newNickName, newUserPhoto, newUserRegion) {
            if (newUserPhoto && newUserPhoto != $scope.oldUserPhoto) {
                uploadUserPhoto(newUserPhoto, function (data) {
                    // 更新昵称和地区
                    PersonalSettingService.doModifyNickName(userId, newNickName, newUserRegion, function () {
                        $scope.showSubmitBtn = false; //隐藏修改按钮
                        $scope.showSuccessMessage();
                    });
                });
            } else {
                PersonalSettingService.doModifyNickName(userId, newNickName, newUserRegion, function () {
                    $scope.showSubmitBtn = false; //隐藏修改按钮
                    $scope.showSuccessMessage();
                });
            }
        };

        /**
         * 上传个人设置照片
         */
        var uploadUserPhoto = function (newUserPhoto, onSuccess) {
            PersonalSettingService.uploadUserPhoto(userId, newUserPhoto, function () {
                onSuccess();
            });
        };

        /**
         * 清除本地存储所有聊天数据
         */
        $scope.clearChatData = function () {
            KyeeMessageService.confirm({
                title: KyeeI18nService.get("update_user.sms", "消息"),
                content: KyeeI18nService.get("appointment_regist_deti.sureToDeleteIt", "确认删除聊天记录？"),
                onSelect: function (flag) {
                    if (flag) {
                       IMDispatch.clearMessageData();
                    }
                }
            });
        };

        /**
         * add by wyn 20161124
         * 修改个人昵称跳转至新界面
         */
        $scope.goModifyPersonalName = function () {
            PersonalSettingService.personalName = $scope.userInfo.nickName;
            PersonalSettingService.modifyUserId = userId;
            $state.go("modify_personal_name");
        }

        /**
         * 监听物理键返回
         * addBy liwenjuan 2016/12/09
         */
        KyeeListenerRegister.regist({
            focus: "personal_setting",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction(); //禁掉默认处理，使物理返回与页面上的返回键一致
                $scope.goBack();
            }
        });

        /**
         * 返回事件 addBy liwenjuan 2016/12/09
         * 处理返回聊天界面更新对应的最后10条聊天记录
         */
        $scope.goBack = function () {
            var backView = $ionicHistory.backView() || {}; //默认赋值为{}
            if ("personal_chat" == backView.stateId) {
                    $ionicHistory.goBack(-1);
            } else if ("conversation" == backView.stateId) {
                $ionicHistory.goBack(-1);
            } else {
                $ionicHistory.goBack(-1);
            }
        }
    })
    .build();