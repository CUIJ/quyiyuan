/**
 * 产品名称：quyiyuan
 * 创建用户：张毅
 * 日期：2017年5月25日
 * 创建原因：患者详情页面控制器
 */
new KyeeModule()
    .group("kyee.quyiyuan.consultation.consult_patient_disease_info.controller")
    .require(["kyee.quyiyuan.patients_group.personal_chat.service", "kyee.quyiyuan.consultation.order.controller", "kyee.quyiyuan.consultation.show_pictures.service"])
    .type("controller")
    .name("ConsultPatientDiseaseInfoController")
    .params(["$scope", "$state", "$ionicHistory",
        "KyeeUtilsService", "KyeeListenerRegister", "KyeeViewService",
        "ConsultOrderDetailService", "ShowPicturesService",
        "CacheServiceBus","PersonalChatService"])
    .action(function ($scope, $state, $ionicHistory,
                      KyeeUtilsService, KyeeListenerRegister, KyeeViewService,
                      ConsultOrderDetailService, ShowPicturesService,
                      CacheServiceBus,PersonalChatService) {
        var memoryCache = CacheServiceBus.getMemoryCache();//全局参数
        var storageCache = CacheServiceBus.getStorageCache();//缓存数据
        var screenSize = KyeeUtilsService.getInnerSize();//屏幕尺寸
        $scope.windowHeight = screenSize.height - 44;//窗口高度
        $scope.windowWidth = screenSize.width;//窗口宽度
        $scope.imageWidth = parseInt((window.innerWidth - 14 * 2 - 10 * 3) / 4);//动态计算每一张图的宽度(按照放四张的比例)

        KyeeListenerRegister.regist({
            focus: "consult_patient_disease_info",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function () {
                initView();
            }
        });

        KyeeListenerRegister.regist({
            focus: "consult_patient_disease_info",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $ionicHistory.goBack();
            }
        });

        /**
         * 页面初始化加载事件
         */
        function initView() {
            console.log("ConsultOrderDetailService.orderDetail.patientAge",ConsultOrderDetailService.orderDetail.patientAge);
            var parentAgeNull =  ConsultOrderDetailService.orderDetail.patientAge;
            if(!parentAgeNull || parentAgeNull=="null" || parentAgeNull=="undefined" || parentAgeNull==undefined){
                parentAgeNull = "";
            }else{
                parentAgeNull = "  /  "+ parentAgeNull;
            }
            if($ionicHistory.backView().stateId == 'personal_chat'){
                PersonalChatService.pullMessageList = false;
            }
            // 患者信息
            $scope.patientInfo = {
                patientName: ConsultOrderDetailService.orderDetail.patientName,
                patientSex: ConsultOrderDetailService.orderDetail.patientSex,
                patientAge: parentAgeNull,
                patientPhone: ConsultOrderDetailService.orderDetail.patientPhone
            };
            // 疾病信息
            $scope.diseaseInfo = {
                diseaseName: ConsultOrderDetailService.orderDetail.diseaseName,
                diseaseDescription: ConsultOrderDetailService.orderDetail.diseaseDescription,
                diseaseHistory: ConsultOrderDetailService.orderDetail.diseaseHistory
            };
            $scope.IMGLIST = ConsultOrderDetailService.orderDetail.diseaseImg && formatImgList(ConsultOrderDetailService.orderDetail.diseaseImg);
        }

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
