/**
 * 产品名称：quyiyuan
 * 创建用户：张毅
 * 日期：2017年4月20日
 * 创建原因：添加信息页面控制器
 */
new KyeeModule()
    .group("kyee.quyiyuan.consultation.add_information.controller")
    .require([
        "kyee.quyiyuan.center.controller.custom_patient",
        "kyee.quyiyuan.consultation.wait_chatting.controller",
        "kyee.quyiyuan.consultation.add_information.service",
        "kyee.quyiyuan.consultation.wait_chatting.service",
        "kyee.quyiyuan.consultation.consult_order_detail.service",
        "kyee.quyiyuan.appointment.doctor_detail.service",
        "kyee.quyiyuan.consultation.show_pictures.controller",
        "kyee.quyiyuan.consultation.show_pictures.service",
        "kyee.quyiyuan.consultation.consult_pay.controller",
        "kyee.quyiyuan.consultation.consult_pay.service",
        "kyee.quyiyuan.imUtil.service",
        "kyee.quyiyuan.center_util.service",
        "kyee.quyiyuan.consultation.consult_contract.controller"
    ])
    .type("controller")
    .name("AddInformationController")
    .params(["$scope", "$state", "$ionicHistory", "$ionicSlideBoxDelegate", "$timeout", "$ionicScrollDelegate", "$location",
        "KyeeUtilsService", "KyeeListenerRegister", "KyeeViewService", "KyeeMessageService", "KyeeCameraService", "CacheServiceBus",
        "IMUtilService", "AddInformationService", "WaitChattingService", "ConsultOrderDetailService", "ShowPicturesService",
        "CenterUtilService", "AppointmentDoctorDetailService", "ConsultPayService","KyeeI18nService"
    ])
    .action(function ($scope, $state, $ionicHistory, $ionicSlideBoxDelegate, $timeout, $ionicScrollDelegate, $location,
                      KyeeUtilsService, KyeeListenerRegister, KyeeViewService, KyeeMessageService, KyeeCameraService, CacheServiceBus,
                      IMUtilService, AddInformationService, WaitChattingService, ConsultOrderDetailService, ShowPicturesService,
                      CenterUtilService, AppointmentDoctorDetailService, ConsultPayService, KyeeI18nService) {
        var memoryCache = CacheServiceBus.getMemoryCache(); //全局参数
        var storageCache = CacheServiceBus.getStorageCache(); //缓存数据
        var screenSize = KyeeUtilsService.getInnerSize(); //屏幕尺寸
        var isWeiXinWkwebview = false; //是否为微信WK内核浏览器
        $scope.windowHeight = screenSize.height - 44; //窗口高度
        $scope.windowWidth = screenSize.width; //窗口宽度
        $scope.imageWidth = parseInt((window.innerWidth - 14 * 2 - 10 * 3) / 4); //动态计算每一张图的宽度(按照放四张的比例)
        $scope.isSubmitError = false; //提交失败状态
        $scope.IMGLIST = []; //初始化图片列表
        $scope.chooseShare = true; //默认共享订单

        // 用户填写的疾病信息
        $scope.diseaseInfo = {
            name: '',
            description: '',
            history: ''
        };

        $scope.tip = ""; //提示信息

        $scope.isAgree = true;

        /**
         *  “咨询条款”点击事件
         */
        $scope.consultAgree = function () {
            $scope.isAgree = !$scope.isAgree;
        };

        /**
         点击事件阅读咨询条款
         */
        $scope.readConsultContract = function () {

            var name = $scope.diseaseInfo.name;
            var description = $scope.diseaseInfo.description;
            var history = $scope.diseaseInfo.history;
            var chooseShare = $scope.chooseShare;
            storageCache.set("DISEASEINFO_NAME",name);
            storageCache.set("DISEASEINFO_DESCRIPTION",description);
            storageCache.set("DISEASEINFO_HISTORY",history);
            storageCache.set("DISEASEINFO_CHOOSESHARE",chooseShare);
            var imageList = [];
            if($scope.IMGLIST.length==0){
                imageList = "";
            }else{
                imageList = JSON.stringify($scope.IMGLIST);
            }
            CacheServiceBus.getStorageCache().set("DISEASEINFO_IMGLIST",imageList);

            $state.go("consult_contract");

        };
        KyeeListenerRegister.regist({
                focus: "add_information",
                when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_LEAVE,
                direction: "both",
                action: function (param) {
                    if (param.to == "consult_contract"){
                        $scope.diseaseInfo.name =  storageCache.get("DISEASEINFO_NAME");
                        $scope.diseaseInfo.description = storageCache.get("DISEASEINFO_DESCRIPTION");
                        $scope.diseaseInfo.history = storageCache.get("DISEASEINFO_HISTORY");
                        $scope.chooseShare = storageCache.get("DISEASEINFO_CHOOSESHARE");
                        if(!storageCache.get("DISEASEINFO_IMGLIST").length){
                            $scope.IMGLIST = [];
                        }else{
                            $scope.IMGLIST = JSON.parse(storageCache.get("DISEASEINFO_IMGLIST"));
                        }

                    }
                    else{
                        storageCache.remove("DISEASEINFO_NAME");
                        storageCache.remove("DISEASEINFO_DESCRIPTION");
                        storageCache.remove("DISEASEINFO_HISTORY");
                        storageCache.remove("DISEASEINFO_CHOOSESHARE");
                        storageCache.remove("DISEASEINFO_IMGLIST");

                    }
                }

        });

        KyeeListenerRegister.regist({
            focus: "add_information",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (param) {
                initView();
            }
        });

        KyeeListenerRegister.regist({
            focus: "add_information",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.goBack();
            }
        });


        /**
         * 页面初始化加载事件
         */
        function initView() {
            var name =  storageCache.get("DISEASEINFO_NAME");
            var description = storageCache.get("DISEASEINFO_DESCRIPTION");
            var history = storageCache.get("DISEASEINFO_HISTORY");
            var chooseShare = storageCache.get("DISEASEINFO_CHOOSESHARE");
            var imageList = storageCache.get("DISEASEINFO_IMGLIST");
            if(chooseShare == "false" || chooseShare == false){
                chooseShare = false;
            }else{
                chooseShare = true;
            }
            $scope.diseaseInfo.name = name?name:"";
            $scope.diseaseInfo.description = description?description:"";
            $scope.diseaseInfo.history = history?history:"";
            $scope.chooseShare = chooseShare;
            $scope.IMGLIST = imageList?JSON.parse(imageList):[];
                // 设置头部状态栏
            setHeadStatus(AddInformationService.consultParam.consultType);
            // 获取就诊者信息
            $scope.currentPatientInfo = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
            $scope.currentPatientInfo.age = CenterUtilService.ageBydateOfBirth($scope.currentPatientInfo.DATE_OF_BIRTH);
            $scope.currentPatientInfo.SEX_TEXT = $scope.currentPatientInfo.SEX == 1 ? '男' : '女';
            // 获取登录用户手机号(非就诊者的手机号)
            $scope.currentPatientInfo.contactPhone = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).PHONE_NUMBER;
            // 订单信息
            ConsultOrderDetailService.orderDetail.consultType = AddInformationService.consultParam.consultType;
            ConsultOrderDetailService.orderDetail.free = AddInformationService.consultParam.free;
            ConsultOrderDetailService.orderDetail.payAmount = AddInformationService.consultParam.payAmount;
            ConsultOrderDetailService.orderDetail.doctorName = AddInformationService.consultParam.doctorName;
            ConsultOrderDetailService.orderDetail.deptName = AddInformationService.consultParam.deptName;
            ConsultOrderDetailService.orderDetail.hospitalName = AddInformationService.consultParam.hospitalName;

            //根据不同类型的付费咨询展示不同的提示文字
            switch(AddInformationService.consultParam.consultType) {
                case 1:             //图文咨询
                    $scope.tip = AddInformationService.consultParam.reminder;
                    break;  
                case 2:             //电话咨询
                    $scope.tip = AddInformationService.consultParam.reminder;
                    break;
                case 3:             //视频咨询
                    $scope.tip = AddInformationService.consultParam.reminder;
                    break;
                default:
                    $scope.tip = '咨询期间不限交流次数，医生未接诊自动退款。';
            }
            $scope.isShowSwitchBtn = AddInformationService.consultParam.hospitalId != 1001; //若是体验医院，则不展示切换就诊者按钮
            $scope.isOpenShare =AddInformationService.consultParam.isOpenShare;
            $scope.deptName = AddInformationService.consultParam.deptName;
            $scope.doctorName = AddInformationService.consultParam.doctorName;
            $scope.shareReminder = AddInformationService.consultParam.shareReminder;
        }
        //更改页面输入病情描述
        $scope.illDescipt = function(){
            var observe;
            if (window.attachEvent) {
                observe = function (element, event, handler) {
                    element.attachEvent('on'+event, handler);
                };
            }
            else {
                observe = function (element, event, handler) {
                    element.addEventListener(event, handler, false);
                };
            }
            var descript = document.getElementById('illDescript');
            function resize () {
                descript.style.height = 'auto';
                descript.style.height = descript.scrollHeight+'px';

            }
            /* 0-timeout to get the already changed text */
            function delayedResize () {
                window.setTimeout(resize, 20);
                //resize();
            }
            observe(descript, 'input',  delayedResize);

            observe(descript, 'cut',     delayedResize);
            observe(descript, 'paste',   delayedResize);

        };
        $scope.illDescipt();
        //更改吸烟史输入
        $scope.illHistory = function(){
            var observe;
            if (window.attachEvent) {
                observe = function (element, event, handler) {
                    element.attachEvent('on'+event, handler);
                };
            }
            else {
                observe = function (element, event, handler) {
                    element.addEventListener(event, handler, false);
                };
            }
            var history = document.getElementById('illHistory');
            function resize () {
                history.style.height = '20'+'px';
                history.style.height = (history.scrollHeight)+'px';

            }
            /* 0-timeout to get the already changed text */
            function delayedResize () {

                window.setTimeout(resize, 20);
            }
            observe(history, 'input',  delayedResize);

            observe(history, 'cut',     delayedResize);
            observe(history, 'paste',   delayedResize);

        };
         $scope.illHistory();
        /**
         * 根据订单类型设置头部状态
         * @param consultType 1:图文；2:电话；3:视频
         */
        function setHeadStatus(consultType) {
            if (consultType == 1) {
                // 头部状态栏展示所需数据
                $scope.statusData = [{
                    'statusCode': 1,
                    'statusName': '补充资料'
                }, {
                    'statusCode': 2,
                    'statusName': '支付费用'

                }, {
                    'statusCode': 3,
                    'statusName': '等待接诊'
                }, {
                    'statusCode': 4,
                    'statusName': '咨询完成'
                }];
                $scope.currentStatusCode = '1'; //当前页面处于的状态-补充资料
                $scope.consultTypeName = '图文咨询';
            } else if (consultType == 2 || consultType == 3) {
                // 头部状态栏展示所需数据
                $scope.statusData = [{
                    'statusCode': 1,
                    'statusName': '补充资料'
                }, {
                    'statusCode': 2,
                    'statusName': '支付费用'

                }, {
                    'statusCode': 3,
                    'statusName': '等待接诊'
                }, {
                    'statusCode': 4,
                    'statusName': '医生回拨'
                }, {
                    'statusCode': 5,
                    'statusName': '咨询完成'
                }];
                $scope.currentStatusCode = '1'; //当前页面处于的状态-补充资料
                if (consultType == 2) {
                    $scope.consultTypeName = '电话咨询';
                } else {
                    $scope.consultTypeName = '视频咨询';
                }
            }
        }

        /**
         * 检查页面必须输入项
         */
        function checkInput() {
            if (!$scope.diseaseInfo.name) {
                KyeeMessageService.broadcast({
                    content: "请填写疾病名称",
                    duration: 2000
                });
                return false;
            } else if (!$scope.diseaseInfo.description || $scope.diseaseInfo.description.length<20) {
                KyeeMessageService.broadcast({
                    content: "请填写病情描述（至少20个字）",
                    duration: 2000
                });
                return false;
            }
            // else if (!$scope.diseaseInfo.history) {
            //     KyeeMessageService.broadcast({
            //         content: "请填写疾病史",
            //         duration: 2000
            //     });
            //     return false;
            // }
            else {
                return validInputValue($scope.diseaseInfo.name) && validInputValue($scope.diseaseInfo.description) && validInputValue($scope.diseaseInfo.history);
            }
        }

        /**
         * 输入有效验证(汉子，字母，数字，标点符号)
         * @param text
         */
        function validInputValue(text) {
            var reg = /^[\u4E00-\u9FA5A-Za-z 0-9，。、？！.“”（）\-/／：；¥@<>()【】《》{}｛｝\[\]#%^*+=_—\\|～$&·…:;"~£•,?!']*$/;
            if (!reg.test(text)) {
                KyeeMessageService.broadcast({
                    content: "请勿输入中文、英文、数字和常用标点之外的内容！",
                    duration: 3000
                });
                return false;
            }
            return true;
        }

        /**
         * 格式化图片
         * @param imgList
         * @returns {Array}
         */
        function formatImgList(imgList) {
            var tempList = [];
            if (imgList && imgList.length > 0) {
                var tempImg = {
                    imgUrl: "", //页面展示用数据（可能是本地图片路径,也可能是base64位数据）
                    localId: "" //微信返回的图片localId,用于wx.uploadImage接口
                };
                for (var i = 0; i < imgList.length; i++) {
                    if (isWeiXinWkwebview) {
                        tempImg.imgUrl = imgList[i].imgUrl;
                        tempImg.localId = imgList[i].localId;
                    } else {
                        tempImg.imgUrl = imgList[i];
                        tempImg.localId = imgList[i];
                    }
                    tempList.push(angular.copy(tempImg));
                }
            }
            return tempList;
        }

        /**
         * 创建订单方法
         * @param diseaseInfo
         * @param currentPatientInfo
         */
        function createOrder(diseaseInfo, currentPatientInfo) {
            var cParam = AddInformationService.consultParam;
            if (!cParam.free && cParam.isRegular && parseFloat(cParam.afterConsultAmount) === 0) {
                AddInformationService.shouldBeFree = true;
            } else {
                AddInformationService.shouldBeFree = false;
            }
            AddInformationService.chooseShare = $scope.chooseShare?"1":"0";
            AddInformationService.submit(diseaseInfo, currentPatientInfo, function (returnData) {
                if (returnData.success) {
                    if(cParam.free || AddInformationService.shouldBeFree){ //免费咨询 不需要跳转至支付页面
                        ConsultOrderDetailService.consultOrderID = returnData.data.scConsultId; //记录生成的订单ID
                        ConsultOrderDetailService.getOrderDetail(function (response) {
                            KyeeMessageService.broadcast({
                                content: "资料提交成功",
                                duration: 1000
                            });
                            $timeout(function () {
                                $state.go("wait_chatting");
                            }, 2000);
                        });
                    } else {
                        KyeeMessageService.broadcast({
                            content: "资料提交成功",
                            duration: 1000
                        });
                        var consultParam = ConsultPayService.consultParam = angular.copy(AddInformationService.consultParam);
                        var data = returnData.data;
                        angular.extend(consultParam, data);
                        ConsultPayService.orderNo = data.qyOrderNo;
                        $timeout(function () {
                            $state.go("consult_pay");
                        }, 2000);
                    }
                } else {
                    $scope.isSubmitError = true; //提交失败
                    $ionicScrollDelegate.scrollTop(false);
                    KyeeMessageService.broadcast({
                        content: returnData.message,
                        duration: 1000
                    });
                }
            }, function (returnData) {
                $scope.isSubmitError = true; //提交失败
                $ionicScrollDelegate.scrollTop(false);
                KyeeMessageService.broadcast({
                    content: "资料提交失败",
                    duration: 1000
                });
            });
        }

        /**
         * 给页面上隐藏的input标签绑定监听函数
         * 增加网页版发送图片大小限制
         */
        // document.getElementById("webChoosePicture").addEventListener("change", function () {
        //     var webSelectImgs = this.files;
        //     if ($scope.IMGLIST.length + webSelectImgs.length > 9) {
        //         KyeeMessageService.broadcast({
        //             content: "您最多可以上传9张图片",
        //             duration: 3000
        //         });
        //     } else {
        //         var localPathArray = [];
        //         window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
        //         for (var i = 0, j = webSelectImgs.length; i < j; i++) {
        //             localPathArray.push(window.URL.createObjectURL(webSelectImgs[i]));
        //         }
        //         $scope.IMGLIST = $scope.IMGLIST.concat(formatImgList(localPathArray));
        //     }
        //     this.value = ""; //清除选择文件
        //     $scope.$digest();
        // });

        /**
         * 点击选择从相册中选择图片
         */
        $scope.choosePhoto = function () {
            // 外壳选择图片方法
            if (window.device && (window.device.platform == "iOS" || window.device.platform == "Android")) {
                var options = {
                    maximumImagesCount: 9 - $scope.IMGLIST.length, //最多选择9张
                    quality: 50
                };
                KyeeCameraService.getPictures(
                    // 调用成功时返回的值
                    function (retVal) {
                        setTimeout(function () {
                            $scope.$apply(function () {
                                $scope.IMGLIST = $scope.IMGLIST.concat(formatImgList(retVal));
                            });
                        }, 100);
                        //setTimeout(function(){
                        //    $scope.$digest();
                        //},100)
                    },
                    // 调用失败时返回的值
                    function (retVal) {
                        KyeeMessageService.broadcast({
                            content: "选择照片失败",
                            duration: 2000
                        });
                    }, options);
            } else if (jsInterface.isWeiXin()) { // 微信公众号选择图片方法
                var absUrl = $location.$$absUrl; //获取当前完整的url路径
                AddInformationService.chooseImg(absUrl.split("#")[0], 9 - $scope.IMGLIST.length, function (retVal) {
                    // 获取本地图片接口 (此接口仅在 iOS WKWebview 下提供，用于兼容 iOS WKWebview 不支持 localId 直接显示图片的问题)
                    if (window.__wxjs_is_wkwebview) {
                        isWeiXinWkwebview = true;
                        AddInformationService.convertPicList = [];
                        AddInformationService.convertedPicList = [];
                        AddInformationService.convertPicList = angular.copy(retVal);
                        AddInformationService.getLocalImagesData(function (convertedPicList) {
                            $scope.IMGLIST = $scope.IMGLIST.concat(formatImgList(convertedPicList));
                            setTimeout(function () {
                                $scope.$apply();
                            }, 1);
                        });
                    } else {
                        $scope.IMGLIST = $scope.IMGLIST.concat(formatImgList(retVal));
                        setTimeout(function(){
                            $scope.$digest();
                        },100)
                    }
                });
            } else {
                KyeeMessageService.message({
                    title: "温馨提示",
                    okText: "我知道了",
                    content: '您的版本暂不支持图片上传功能，下载最新版趣医院APP给您更优质的服务。'
                });
            }

        };

        /**
         * 底部提交按钮点击事件
         */
        $scope.doSubmit = function () {
            $scope.isSubmitError = false;
            if (!checkInput()) {
                return;
            }
            //咨询条款判断是否选中
            if (!CenterUtilService.isDataBlankAndHint($scope.isAgree,KyeeI18nService.get("regist.needAgrement","请选择同意在线咨询条款！"))){
                return;
            }
            AddInformationService.uploadPicList = angular.copy($scope.IMGLIST);
            AddInformationService.sequenceNo = '' + $scope.currentPatientInfo.USER_ID + new Date().getTime();
            if ($scope.IMGLIST.length > 0) { //有图片的情况下先上传图片，再创建订单
                AddInformationService.submitPictures(function () {
                    createOrder($scope.diseaseInfo, $scope.currentPatientInfo);
                });
            } else {
                createOrder($scope.diseaseInfo, $scope.currentPatientInfo);
            }
        };

        /**
         * 显示大图
         * @param index
         */
        $scope.showBigPicture = function (index) {
            ShowPicturesService.ACTIVESLIDE = index; //定义页面初始展示第几张图
            ShowPicturesService.IMGLIST = $scope.IMGLIST;
            KyeeViewService.openModalFromUrl({
                url: "modules/business/consultation/views/template/show_picture.html",
                scope: $scope,
                animation: "slide-in-right"
            });
        };

        /**
         * 点击删除图标事件
         * @param index
         * @param event
         */
        $scope.doDeleteImg = function (index, event) {
            $scope.IMGLIST.splice(index, 1);
            event.stopPropagation();
        };

        /**
         * [goBack description]
         * @return {[type]} [description]
         */
        $scope.goBack = function () {
            AppointmentDoctorDetailService.activeTab = 1; //返回医生主页,此时展示付费咨询tab
            $ionicHistory.goBack(-1);
        };

        /**
         * [switchCP 点击切换就诊者，跳转至切换就诊者页面]
         * @return {[type]} [description]
         */
        $scope.switchCP = function(){
            var cParam = AddInformationService.consultParam;
            if (!cParam.free && cParam.beforeConsultAmount != cParam.afterConsultAmount){  //若是付费咨询，并且诊前诊后价格不一样 跳转至切换就诊者页面时，记录标识
                AddInformationService.switchCPforConsult = true;
            }
            $state.go("custom_patient");
        };

        /**
         * [switchShare 点击切换订单共享状态]
         * @return {[type]} [description]
         */
        $scope.switchShare = function(){
            $scope.chooseShare = !$scope.chooseShare;
        };

    })
    .build();