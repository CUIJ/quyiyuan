/**
 * 产品名称：quyiyuan
 * 创建用户：张毅
 * 日期：2017年4月20日
 * 创建原因：订单详情页面控制器
 */
new KyeeModule()
    .group("kyee.quyiyuan.consultation.consult_order_detail.controller")
    .require(["kyee.quyiyuan.patients_group.personal_chat.service", "kyee.quyiyuan.consultation.order.controller", "kyee.quyiyuan.consultation.show_pictures.service"])
    .type("controller")
    .name("ConsultOrderDetailController")
    .params(["$scope", "$state", "$ionicHistory", "$ionicSlideBoxDelegate",
        "KyeeUtilsService", "KyeeListenerRegister", "KyeeViewService",
        "ConsultationOrderService", "ConsultOrderDetailService", "PersonalChatService", "ShowPicturesService",
        "CenterUtilService", "CacheServiceBus","$location","$window"])
    .action(function ($scope, $state, $ionicHistory, $ionicSlideBoxDelegate,
                      KyeeUtilsService, KyeeListenerRegister, KyeeViewService,
                      ConsultationOrderService, ConsultOrderDetailService, PersonalChatService, ShowPicturesService,
                      CenterUtilService, CacheServiceBus,$location,$window,BootstrapService) {
        var memoryCache = CacheServiceBus.getMemoryCache();//全局参数
        var storageCache = CacheServiceBus.getStorageCache();//缓存数据
        var screenSize = KyeeUtilsService.getInnerSize();//屏幕尺寸
        $scope.windowHeight = screenSize.height - 44;//窗口高度
        $scope.windowWidth = screenSize.width;//窗口宽度
        $scope.imageWidth = parseInt((window.innerWidth - 14 * 2 - 10 * 3) / 4);//动态计算每一张图的宽度(按照放四张的比例)
        $scope.showFootButton = (ConsultOrderDetailService.orderDetail.orderState == 5 || ConsultOrderDetailService.orderDetail.orderState == 9) && (ConsultOrderDetailService.orderDetail.consultType == 1);

        /**
         * [action 页面进入监听]
         */
        KyeeListenerRegister.regist({
            focus: "consult_order_detail",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function () {
                initView();
            }
        });

        /**
         * [action 物理返回监听]
         */
        KyeeListenerRegister.regist({
            focus: "consult_order_detail",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.goBack();
            }
        });

        /**
         *  获取URL参数
         */
        function getQueryString(name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var r = $window.location.search.substr(1).match(reg);
            if (r != null) return unescape(r[2]);
            return null;
        }

        /**
         * 页面初始化加载事件
         */
        function initView() {
            //判断是否为微信推送内容
            if(ConsultOrderDetailService.isFromWeiXin){
                ConsultOrderDetailService.consultOrderID = getQueryString("consultOrderID");
                ConsultOrderDetailService.isFromWeiXin = false;
                ConsultOrderDetailService.getOrderDetail(function (data) {
                    getBaseInfo();
                });
                return;
            }
            // 头部订单类型／状态信息
            getBaseInfo();
        }

        var getBaseInfo = function () {
            var consultName = '';
            var consultIcon = '';
            var orderDetail = ConsultOrderDetailService.orderDetail;
            var orderStateName = orderDetail.orderStateDesc;
            var payStateName = orderDetail.payStateDesc;

            switch (orderDetail.consultType) {
                case 1:
                    consultName = '图文咨询';
                    consultIcon = 'icon-wx-chat  bg_yellowGreen';
                    break;
                case 2:
                    consultName = '电话咨询';
                    consultIcon = 'icon-telephone bg_orange';
                    break;
                case 3:
                    consultName = '视频咨询';
                    consultIcon = 'icon-video bg_lightBlue';
                    break;
                default:
                    consultName = '其他';
            }
            $scope.orderInfo = {
                consultName: consultName,
                consultIcon: consultIcon,
                orderStateName: orderStateName,
                payStateName: payStateName,
                payAmount: orderDetail.payAmount
            };
            //用药信息
            $scope.medicList = orderDetail.smsList;
            // 医生信息
            $scope.doctorInfo = {
                    doctorPhoto: orderDetail.shareDoctorPhoto ? orderDetail.shareDoctorPhoto :
                        (orderDetail.shareDoctorSex==1?"resource/images/base/head_default_female.jpg":"resource/images/base/head_default_man.jpg"),
                    doctorName: orderDetail.shareDoctorName,
                    doctorTitle: orderDetail.shareDoctorTitle,
                    hospitalName: orderDetail.hospitalName,
                    deptName: orderDetail.deptName,
                    orderCreateTime: orderDetail.orderCreateTime,
                    doctorRlUser : orderDetail.shareDoctorRlUser,
                    doctorSex : orderDetail.shareDoctorSex,
                    yxUser:orderDetail.doctorYxUser
            }

            // 患者信息
            $scope.patientInfo = {
                patientName: orderDetail.patientName,
                patientSex: orderDetail.patientSex,
                patientAge: orderDetail.patientAge,
                patientPhone: orderDetail.patientPhone
            };
            // 疾病信息
            $scope.diseaseInfo = {
                diseaseName: orderDetail.diseaseName,
                diseaseDescription: orderDetail.diseaseDescription,
                diseaseHistory: orderDetail.diseaseHistory
            };
            $scope.IMGLIST = orderDetail.diseaseImg && formatImgList(orderDetail.diseaseImg);

            // 评价信息
            $scope.satisfactionData = {
                isShowSatisfaction: !!((orderDetail.orderState == 5 || orderDetail.orderState == 9) && orderDetail.evaluationTime > 0), //订单状态为正常结束或者患者超时未结束且评价过医生的订单才会在详情页面展示评价信息
                items: !!orderDetail.satisfyResult ? orderDetail.satisfyResult.ITEM_SCORES : '',
                suggestValue: !!orderDetail.satisfyResult ? orderDetail.satisfyResult.SUGGEST_VALUE : ''
            };

        };

        /**
         * 整理图片列表
         * */
        function formatImgList(imgList) {
            var tempListArray = imgList.split(',');
            var tempListObj = [];
            var tempImgObj = {
                imgUrl: ""
            };

            for (var i = 0; i < tempListArray.length; i++) {
                if (tempListArray[i]) {
                    tempImgObj.imgUrl = tempListArray[i];
                    tempListObj.push(angular.copy(tempImgObj));
                }
            }
            return tempListObj;
        }

        /**
         * 底部按钮点击事件跳转到聊天页面
         */
        $scope.goToChat = function () {
            //聊天界面所需要的参数
            PersonalChatService.receiverInfo = {
                yxUser:$scope.doctorInfo.yxUser,
                userRole: 2,
                userPetname: $scope.doctorInfo.doctorName,
                sex: $scope.doctorInfo.doctorSex,
                userPhoto: $scope.doctorInfo.doctorPhoto,
                visitName: ConsultOrderDetailService.orderDetail.patientName,
                scUserVsId: ConsultOrderDetailService.orderDetail.scUserVsId
            };
            PersonalChatService.consultParam = {
                scMsgType: 5,
                scRecordId: ConsultOrderDetailService.orderDetail.scConsultId,
                consultType: ConsultOrderDetailService.orderDetail.consultType,
                visitName: ConsultOrderDetailService.orderDetail.patientName,
                sex: ConsultOrderDetailService.orderDetail.patientSex,
                age: ConsultOrderDetailService.orderDetail.patientAge,
                diseaseName: ConsultOrderDetailService.orderDetail.diseaseName,
                diseaseDesc: ConsultOrderDetailService.orderDetail.diseaseDescription
            };
            PersonalChatService.fromView = true;
            PersonalChatService.goPersonalChat();
        };

        $scope.goBack = function () {

            $state.go("consultation_order");
        };
        //得到给药频率名称
        $scope.getFreq = function getFreq(item){
            for (var i = 0;i < medicSuggestionService.frequencyEnum.length;i++){
                if(medicSuggestionService.frequencyEnum[i].code == item){
                    return medicSuggestionService.frequencyEnum[i].name;
                }
            }
        };


        /**
         * 点击小图显示大图
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
    })
    .build();
