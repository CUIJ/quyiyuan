/**
 * 产品名称 KYMH
 * 创建用户: 朱学亮
 * 日期: 2015/5/10
 * 时间: 15:45
 * 创建原因：实名认证的controller
 * 修改原因：添加对报告单和检查单返回时刷新上级页面内容
 * 修改用户：朱学亮
 * 修改时间：2015/5/12 9:54
 *
 * 逻辑说明：
 *      初始化页面时，需要确定此页面的上级页面
 *      a. 若从个人信息维护页面进入，则显示注册用户的信息；
 *      b. 若从附加就诊者页面进入，则显示附加就诊者的信息；
 */
new KyeeModule()
    .group("kyee.quyiyuan.center.authentication.controller")
    .require(["kyee.quyiyuan.center.service",
        "kyee.framework.service.message",
        "kyee.quyiyuan.center.authentication.service",
        "kyee.quyiyuan.center.updateuser.service",
        "kyee.quyiyuan.center.comm_patient_detail.service",
        "kyee.framework.device.deviceinfo",
        "kyee.framework.device.camera"])
    .type("controller")
    .name("AuthenticationController")
    .params([
        "$window",
        "$scope",
        "OperationMonitor",
        "KyeeMessageService",
        "KyeeViewService",
        "AuthenticationService",
        "UpdateUserService",
        "CommPatientDetailService",
        "CacheServiceBus",
        "KyeeDeviceInfoService",
        "KyeeCameraService",
        "KyeeUtilsService",
        "KyeeListenerRegister",
        "AddCustomPatientService",
        "CustomPatientService",
        "AddPatientInfoService",
        "KyeeI18nService",
        "AccountAuthenticationService",
        "MyquyiService",
        "InpatientPaymentService",
        "InpatientPaidService",
        "ClinicPaidService",
        "ClinicPaymentService",
        "$location",
        "ClinicPaymentReviseService"])
    .action(function (
        $window,
        $scope,
        OperationMonitor,
        KyeeMessageService,
        KyeeViewService,
        AuthenticationService,
        UpdateUserService,
        CommPatientDetailService,
        CacheServiceBus,
        KyeeDeviceInfoService,
        KyeeCameraService,
        KyeeUtilsService,
        KyeeListenerRegister,
        AddCustomPatientService,
        CustomPatientService,
        AddPatientInfoService,
        KyeeI18nService,
        AccountAuthenticationService,
        MyquyiService,
        InpatientPaymentService,
        InpatientPaidService,
        ClinicPaidService,
        ClinicPaymentService,
        $location,
        ClinicPaymentReviseService) {
        // 等比例获取上传身份证窗口的宽度和高度
        $scope.divWidth = window.innerWidth
        $scope.picDivWidth = $scope.divWidth  -  92;
        $scope.divHeight = $scope.picDivWidth * 159/256;
        $scope.removeModal = function () {
            KyeeListenerRegister.uninstallOnce(KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK);
            // 判断哪个页面进入的，销毁当前模态窗口时需要刷新上级页面,如果没有走进分支,则是新增就诊者
            if (AuthenticationService.lastClass == "COMM_PATIENT_DETAIL") {
                CommPatientDetailService.updateView();
                //切换就诊者跳转标记
            } else if (AuthenticationService.lastClass == "CustomPatient") {
                CustomPatientService.updateView();
            } else if(AuthenticationService.lastClass == "ACCOUNT_AUTHENTICATION"){
                AccountAuthenticationService.updateView();
            } else if(AuthenticationService.lastClass == "MyQuYi"){   //判断从就医记录页面过来的实名认证 By 杜巍巍 KYEEAPPC-4374
                MyquyiService.updateView();
            }else if(AuthenticationService.lastClass == "report_multiple"){  //zhangming   从检查检验单过来  实名认证后  刷新下
                $scope.doRefresh(true,true);
            } else if(InpatientPaymentService.authFlag){ //程铄闵 KYEEAPPC-4806 住院费用实名认证 KYEEAPPTEST-3262
                InpatientPaymentService.authFlag = false;
                $scope.doRefresh(false);
            } else if(InpatientPaidService.authFlag){//程铄闵 KYEEAPPC-4806 住院已结算实名认证 KYEEAPPTEST-3262
                InpatientPaidService.authFlag = false;
                $scope.doRefresh(false);
            } else if(ClinicPaymentService.authFlag){//程铄闵 KYEEAPPC-4806 门诊待缴费实名认证 KYEEAPPTEST-3262
                ClinicPaymentService.authFlag = false;
                $scope.doRefresh(true);
            } else if(ClinicPaymentReviseService.authFlag){//程铄闵 KYEEAPPC-6170 门诊缴费记录(2.2.20)实名认证
                ClinicPaymentReviseService.authFlag = false;
                $scope.doRefresh(true);
            } else if(ClinicPaidService.authFlag){//程铄闵 KYEEAPPC-4806 门诊缴费记录实名认证 KYEEAPPTEST-3262
                ClinicPaidService.authFlag = false;
                $scope.doRefresh(true);
            }
            setTimeout(function () {
                KyeeViewService.removeModal({
                    scope: $scope
                });
            }, 100)
        };
        /**
         * 获取上级页面传入的参数 OFTEN_NAME，FLAG，ID_NO，PHONE
         * FLAG 表示：0-正在审核；1-认证成功；2-认证失败；3-未认证；
         * HOSPITAL_SM = {OFTEN_NAME,ID_NO,PHONE,FLAG};
         */
        //个人信息维护跳转赋值
        if (AuthenticationService.HOSPITAL_SM) { // 需要实名认证的新就诊者,添加认证过后，回到附加就诊者界面，再次点击刚刚添加过的就诊者认证状态为未认证   By  张家豪  KYEEAPPTEST-2810
            $scope.bindData = AuthenticationService.HOSPITAL_SM;
        } else {
            var cache = CacheServiceBus.getMemoryCache();
            var current_patient = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
            $scope.bindData = current_patient;
        }

        /**
         * 标题名字
         * @type {string}
         * AUTH_TYPE    0:实名认证  1：追诉认证
         */
        if(AuthenticationService.AUTH_TYPE == 0){
            $scope.titleSelectChange = KyeeI18nService.get("authentication.titleSelectChangeOne","实名认证")
        }else{
            $scope.titleSelectChange = KyeeI18nService.get("authentication.titleSelectChangeTwo","修改信息")
        }
        // 显示认证失败的原因
        $scope.failedReason = "";
        if ($scope.bindData.FLAG && $scope.bindData.FLAG == 2) {
            AuthenticationService.getFailedReason(function (retVal) {
                if (retVal.data) {
                    if (retVal.data != "null" && retVal.data) {
                        $scope.failedReason = retVal.data;
                    }
                }
            }, $scope.bindData.USER_VS_ID,$scope.bindData.ID_NO);
        }

        var cache = CacheServiceBus.getMemoryCache();
        $scope.userInfo = {
            name: $scope.bindData.OFTEN_NAME,
            idNo: $scope.bindData.ID_NO,
            phone: $scope.bindData.PHONE,
            userVsID: $scope.bindData.USER_VS_ID,// 【个人中心】实名认证增加传入后台参数  By  张家豪  KYEEAPPC-3404
            userId:cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID// 【个人中心】实名认证增加传入后台参数  By  张家豪  KYEEAPPC-3404
        };
        if($scope.userInfo && $scope.userInfo.phone && $scope.userInfo.idNo){
            //$scope.phoneShow = ($scope.userInfo.phone.replace(/(.{3}).*(.{4})/,"$1****$2"));
            if(0 === AuthenticationService.AUTH_TYPE){//实名认证保护身份证信息
                $scope.userObj = {
                    idNoShow : ($scope.userInfo.idNo.replace(/(.{3}).*(.{4})/,"$1********$2")),
                    nameShow : $scope.userInfo.name
                };
                $scope.idNoShow = ($scope.userInfo.idNo.replace(/(.{3}).*(.{4})/,"$1********$2"));
                $scope.textColor = 'font_color_grey';
                $scope.isEdit = true;
                $scope.authenTipType = 0;
            }else{//实名申诉身份证信息展示完整。
                $scope.userObj = {
                    idNoShow : $scope.userInfo.idNo,
                    nameShow : $scope.userInfo.name
                };
                $scope.textColor = 'font_color_black';
                $scope.isEdit = false;
                $scope.authenTipType = 1;
            }
        }
        $scope.idCardPic = "";
        $scope.idCardPicStyle = "";
        $scope.isAppPage = true;
        /**
         *  判断当前浏览器是否是微信浏览器
         * @returns {boolean}
         */
        function isWeiXin(){
            var ua = window.navigator.userAgent.toLowerCase();
            if(ua.match(/MicroMessenger/i) == 'micromessenger'){
                $scope.isAppPage = false;
                return true;
            }else{
                return false;
            }
        }

        $scope.takePic = function () {
            //edit start APPCOMMERCIALBUG-2267  gaoyulou 如果是微信浏览器，则调用微信的SDK插件
            if(isWeiXin())
            {
                KyeeMessageService.confirm({
                    content: KyeeI18nService.get("comm_patient_detail.wxPhotoTips","微信公众号暂不支持图片裁剪，下载趣医APP，给您更优质的业务体验"),
                    cancelText: KyeeI18nService.get("comm_patient_detail.keepUp","继续上传"),
                    cancelButtonClass:'qy-bg-grey3',
                    okText: KyeeI18nService.get("comm_patient_detail.goDownload","去下载"),
                    onSelect: function (flag) {
                        if (!flag) {
                            var url = $location.$$absUrl;
                            $scope.idCardPic = "";
                            AuthenticationService.chooseImage(function(idCardPic){
                                $scope.idCardPic = idCardPic[0];
                                //$scope.idCardPicStyle = "width:"+$scope.picDivWidth+"px;height:"+$scope.divHeight+"px;margin-bottom: 30px;";
                                // 图片预览
                                AuthenticationService.getLocalImgData(
                                    idCardPic[0],
                                    function(localData){
                                        $scope.idCardPicStyle = "width: 240px;height: 150px;margin-bottom: 30px;";
                                        document.getElementById('idcardImg').src = localData;
                                        setTimeout(function () {
                                            $scope.$apply();
                                        }, 1);
                                });

                            },url.substring(0,url.indexOf("#")));
                        }
                        else
                        {
                            window.location.href = "http://www.quyiyuan.com/mobileweb/mobiledownload.html";
                        }
                    }
                });

            }
            //edit end APPCOMMERCIALBUG-2267
            else{
                KyeeMessageService.actionsheet({
                    buttons: [
                        {
                            text: KyeeI18nService.get("authentication.takePhotos","拍照")
                        },
                        {
                            text: KyeeI18nService.get("authentication.fromPhotos","从相册选择")
                        }
                    ],
                    onClick: function (index) {
                        if (index == 0) {
                            $scope.goToCamera();
                        }
                        else if (index == 1) {
                            $scope.goToAlbum();
                        }
                    },
                    cancelButton: true
                });
            }

        };

        $scope.goToCamera = function () {
            if ($scope.platform == "Android") {
                var options = {
                    quality: 40,
                    destinationType: Camera.DestinationType.FILE_URI,
                    targetWidth: 1200,  //设置图片宽度
                    targetHeight: 900,//设置图片高度
                    allowEdit: true,
                    encodingType: Camera.EncodingType.JPEG,
                    sourceType: Camera.PictureSourceType.CAMERA
                };
                KyeeCameraService.getPicture(
                    // 调用成功时返回的值
                    function (retVal) {
                        $scope.idCardPic = retVal;
                        //$scope.idCardPicStyle = "width:"+$scope.picDivWidth+"px;height:"+$scope.divHeight+"px;margin-bottom: 30px;";
                        $scope.idCardPicStyle = "width: 240px;height: 150px;margin-bottom: 30px;";
                        setTimeout(function () {
                            $scope.$apply();
                        }, 1);
                    },
                    // 调用失败时返回的值
                    function (retVal) {
                    }, options);
            } else if ($scope.platform == "iOS") {
                var options = {
                    quality: 40,
                    destinationType: Camera.DestinationType.FILE_URI,
                    targetWidth: 1200,  //设置图片宽度
                    targetHeight: 900,//设置图片高度
                    saveToPhotoAlbum: true,
                    allowEdit: true,
                    sourceType: Camera.PictureSourceType.CAMERA
                };
                KyeeCameraService.getPicture(
                    // 调用成功时返回的值
                    function (retVal) {
                        $scope.idCardPic = retVal;
                        //$scope.idCardPicStyle = "width:"+$scope.picDivWidth+"px;height:"+$scope.divHeight+"px;margin-bottom: 30px;";
                        $scope.idCardPicStyle = "width: 240px;height: 150px;margin-bottom: 30px;";
                        setTimeout(function () {
                            $scope.$apply();
                        }, 1);
                    },
                    // 调用失败时返回的值
                    function (retVal) {
                    }, options);
            }
        };

        $scope.goToAlbum = function () {
            if ($scope.platform == "Android") {
                // android设备选取相册
                var options = {
                    quality: 40,
                    destinationType: Camera.DestinationType.FILE_URI,
                    targetWidth: 1200,//设置图片宽度
                    targetHeight: 900,//设置图片高度
                    allowEdit: true,
                    encodingType: Camera.EncodingType.JPEG,
                    sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM
                };
                KyeeCameraService.getPicture(
                    // 调用成功时返回的值
                    function (retVal) {
                        $scope.idCardPic = retVal;
                        //$scope.idCardPicStyle = "width:"+$scope.picDivWidth+"px;height:"+$scope.divHeight+"px;margin-bottom: 30px;";
                        $scope.idCardPicStyle = "width: 240px;height: 150px;margin-bottom: 30px;";
                        setTimeout(function () {
                            $scope.$apply();
                        }, 1);
                    },
                    // 调用失败时返回的值
                    function (retVal) {
                    }, options);
            } else if ($scope.platform == "iOS") {
                var options = {
                    quality: 40,
                    destinationType: Camera.DestinationType.FILE_URI,
                    targetWidth: 1200,//设置图片宽度
                    targetHeight: 900,//设置图片高度
                    saveToPhotoAlbum: true,
                    allowEdit: true,
                    sourceType: Camera.PictureSourceType.PHOTOLIBRARY
                };
                KyeeCameraService.getPicture(
                    // 调用成功时返回的值
                    function (retVal) {
                        $scope.idCardPic = retVal;
                        //$scope.idCardPicStyle = "width:"+$scope.picDivWidth+"px;height:"+$scope.divHeight+"px;margin-bottom: 30px;";
                        $scope.idCardPicStyle = "width: 240px;height: 150px;margin-bottom: 30px;";
                        setTimeout(function () {
                            $scope.$apply();
                        }, 1);
                    },
                    // 调用失败时返回的值
                    function (retVal) {
                    }, options);
            }
        };

        // 1. 校验当前就诊者信息是否完善-->
        // 2. 校验是否选择了新的照片-->
        // 3. 使用插件显示进度-->
        // 4. 上传照片。
        $scope.submitPic = function () {

            OperationMonitor.record("submitPic", "authentication");

            //校验当前就诊者信息是否完善
            if (!$scope.bindData.OFTEN_NAME || $scope.bindData.OFTEN_NAME == "" || !$scope.bindData.ID_NO || $scope.bindData.ID_NO == "" || !$scope.bindData.PHONE || $scope.bindData.PHONE == "") {
                // 提示用户需要完善信息
                KyeeMessageService.message({
                    title: KyeeI18nService.get("update_user.sms","消息"),
                    content: KyeeI18nService.get("authentication.pleaseImproveNow","请完善当前就诊者信息！"),
                    okText: KyeeI18nService.get("role_view.iKnow","知道了！")
                });
            } else if ($scope.idCardPic == "") {
                // 提示用户需要选择照片
                KyeeMessageService.message({
                    title: KyeeI18nService.get("update_user.sms","消息"),
                    content: KyeeI18nService.get("authentication.pleaseSelectPhotos","请选择照片！"),
                    okText: KyeeI18nService.get("role_view.iKnow","知道了！")
                });
            } else {
                //判断用户是“实名认证”操作，还是“实名申诉”操作
                if(AuthenticationService.AUTH_TYPE === 1){
                    var editName = $scope.userObj.nameShow;
                    var editId = $scope.userObj.idNoShow;
                    //实名申诉增加用户“申请修改成的姓名”，“申请修改成的id”
                    if(editName && editId){
                        var isLegalName = AddCustomPatientService.validateNameView(editName); //校验姓名
                        var isLegalId = AddCustomPatientService.idNoCheck(editId);//校验身份证号
                        if(isLegalName &&  isLegalId ){
                            $scope.userInfo.APPLY_MODIFY_NAME = editName;
                            $scope.userInfo.APPLY_MODIFY_IDNO = editId;
                        }else{
                            KyeeMessageService.broadcast({
                                content : KyeeI18nService.get('authentication.editIllegalTip','请您输入正确的姓名或者身份证号！'),
                                duration : 2000
                            });
                            return;//用户编辑的身份证与姓名校验不通过，停止上传。
                        }
                    }

                }
                if(isWeiXin()) {
                    AuthenticationService.uploadImageToWxServer($scope.idCardPic,$scope.userInfo,function(){
                        if(CommPatientDetailService.item){
                            CommPatientDetailService.item.FLAG = 0;
                        }
                        AddCustomPatientService.goSource();
                        $scope.removeModal();
                    });
                }
                else{
                    // 上传照片
                    // 需要实名认证的新就诊者,添加认证过后，回到附加就诊者界面，再次点击刚刚添加过的就诊者认证状态为未认证   By  张家豪  KYEEAPPTEST-2810
                    AuthenticationService.uploadIdCard($scope.idCardPic, $scope.userInfo,function(){
                        if(CommPatientDetailService.item){
                            CommPatientDetailService.item.FLAG = 0;
                        }
                        //由于新增是由两个页面进入的，所以需要分别去刷新所对应的页面，此条件来源于新增提交后的条件
                        AddCustomPatientService.goSource();
                        $scope.removeModal();
                    });
                }

            }
        };

        // 获取当前设备平台 iOS or android
        KyeeDeviceInfoService.getInfo(function (info) {
            $scope.platform = info.platform;
            //alert($scope.platform);
        }, function () {
        });

        //监听物理返回键
        KyeeListenerRegister.once({
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();   //禁掉默认处理，使物理返回与页面上的返回键一致
                $scope.removeModal();
            }
        });
        if((typeof(device) == "undefined" || !(device.platform == "Android"||device.platform == "iOS"))) {
            var state = {
                url:""
            };
            $window.history.pushState(state,"","");
            $window.addEventListener("popstate", function (e) {
                $scope.removeModal();
            }, false);
        }
    })
    .build();