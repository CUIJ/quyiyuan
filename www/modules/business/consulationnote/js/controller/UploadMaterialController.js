/**
 * 产品名称：quyiyuan
 * 创建用户：张毅
 * 日期：2017年4月20日
 * 创建原因：添加信息页面控制器
 */
new KyeeModule()
    .group("kyee.quyiyuan.consultation.UploadMaterial.controller")
    .require([
        "kyee.quyiyuan.consultation.upload_material.service"
    ])
    .type("controller")
    .name("UploadMaterialController")
    .params(["$scope","KyeeI18nService", "KyeeListenerRegister","$state", "$ionicHistory","ShowPicturesService","KyeeCameraService","UploadMaterialService","KyeeMessageService","KyeeViewService","CacheServiceBus","KyeeUtilsService"
    ])
    .action(function ($scope,KyeeI18nService,KyeeListenerRegister, $state, $ionicHistory,ShowPicturesService,KyeeCameraService,UploadMaterialService,KyeeMessageService,KyeeViewService,CacheServiceBus,KyeeUtilsService) {
        //是否从就诊卡管理页面进入
        var isConsulationnoteEntry = ($ionicHistory.backView().stateName == "consulationnote");
        var memoryCache = CacheServiceBus.getMemoryCache(); //全局参数
        var storageCache = CacheServiceBus.getStorageCache(); //缓存数据
        var screenSize = KyeeUtilsService.getInnerSize(); //屏幕尺寸
        var isWeiXinWkwebview = false; //是否为微信WK内核浏览器
        $scope.windowHeight = screenSize.height - 44; //窗口高度
        $scope.windowWidth = screenSize.width; //窗口宽度
        if(window.innerWidth<=320){
            $scope.chooseImageWidth = parseInt((window.innerWidth - 14 - 10 * 4) / 4);  //动态计算每一张图的宽度(按照放五张的比例)
        }else{
            $scope.chooseImageWidth = parseInt((window.innerWidth - 14  - 10 * 5) / 5); //动态计算每一张图的宽度(按照放五张的比例)
        }
        $scope.imageWidth = parseInt((window.innerWidth - 14 - 10 * 4) / 4); //动态计算每一张图的宽度(按照放四张的比例)
        $scope.isSubmitError = false; //提交失败状态
        $scope.IMGLIST = []; //初始化图片列表
        $scope.UPLOAD_IMGLIST = [];
        angular.forEach(UploadMaterialService.UPLOAD_IMGLIST, function (data) {
            if(data.source === 'PATIENT'){
                ($scope.UPLOAD_IMGLIST).push(data);
            }
        });
        $scope.length = 9- $scope.imgLength - $scope.UPLOAD_IMGLIST.length;
        $scope.isClick = false;
        /**
         * 格式化图片
         * @param imgList
         * @returns {Array}
         */
        function formatImgList(imgList,type) {
            var tempList = [];
            var imgText = "";
            if(type == 1){
                imgText = "检查"
            }else if(type == 2){
                imgText = "检验"
            }else if(type == 3){
                imgText = "病历"
            }else if(type == 4){
                imgText = "影像"
            }else {
                imgText = "其他"
            }
            if (imgList && imgList.length > 0) {
                var tempImg = {
                    imgUrl: "", //页面展示用数据（可能是本地图片路径,也可能是base64位数据）
                    localId: "", //微信返回的图片localId,用于wx.uploadImage接口
                    imgType: "",
                    imgText: "",
                    imgName: ""
                };
                for (var i = 0; i < imgList.length; i++) {
                     tempImg.imgUrl = imgList[i];
                     tempImg.localId = imgList[i];
                    if(tempImg&&tempImg.imgUrl.lastIndexOf(".")>0)//如果包含有"."号 从最后一个"."号+1的位置开始截取字符串
                    {
                        tempImg.imgName=tempImg.imgUrl.substring(tempImg.imgUrl.lastIndexOf(".")-5);
                    }
                    else
                    {
                        tempImg.imgName=tempImg.imgUrl;
                    }
                    tempImg.imgType = type;
                    tempImg.imgText = imgText;
                    tempList.push(angular.copy(tempImg));
                }
            }
            if(tempList && tempList.length>0){
                $scope.isClick = true;

            }
            return tempList;
        }

        /**
         * 点击选择从相册中选择图片
         */
        $scope.choosePhoto = function (type) {
            $scope.length = 9- $scope.IMGLIST.length - $scope.UPLOAD_IMGLIST.length;
            if($scope.length <= 0){
                KyeeMessageService.broadcast({
                    content: "最多只能上传9张图片"
                });
            }else{
                // 外壳选择图片方法
                if (window.device && (window.device.platform == "iOS" || window.device.platform == "Android")) {
                    var options = {
                        maximumImagesCount:$scope.length, //最多选择9张
                        quality: 50 //50%压缩 此处不需要
                    };
                    KyeeCameraService.getPictures(
                        // 调用成功时返回的值
                        function (retVal) {
                            $scope.IMGLIST = $scope.IMGLIST.concat(formatImgList(retVal,type));
                            if($scope.IMGLIST &&　$scope.IMGLIST.length > 0){
                                $scope.isClick = true;
                            }
                            setTimeout(function () {
                                $scope.$apply();
                            }, 1);
                        },
                        // 调用失败时返回的值
                        function (retVal) {
                            KyeeMessageService.broadcast({
                                content: "选择照片失败",
                                duration: 2000
                            });
                        }, options);
                } else {
                    KyeeMessageService.message({
                        title: "温馨提示",
                        okText: "我知道了",
                        content: '您的版本暂不支持图片上传功能，下载最新版趣医院APP给您更优质的服务。'
                    });
                }
            }

        };
        /**
         * 底部提交按钮点击事件
         */
        $scope.doSubmit = function () {
            $scope.isSubmitError = false;
            UploadMaterialService.uploadPicList = angular.copy($scope.IMGLIST);
            if ($scope.IMGLIST.length > 0) { //有图片的情况下先上传图片，再创建订单
                UploadMaterialService.submitPictures(function () {
                    if(isConsulationnoteEntry){
                        $state.go("consulationnotedetail");
                    }else{
                        $ionicHistory.goBack(-1);
                    }
                });
            } else {
                KyeeMessageService.broadcast({
                    content: "请选择要上传的资料",
                    duration: 2000
                });
            }
        };


        /**
         * 显示大图
         * @param index
         */
        $scope.showUpLoadBigPicture = function (index) {
            ShowPicturesService.ACTIVESLIDE = index; //定义页面初始展示第几张图
            var imgList = angular.copy($scope.UPLOAD_IMGLIST);
            for(var img in  imgList){
                imgList[img].imgUrl = imgList[img].url;
            }
            ShowPicturesService.IMGLIST = imgList;
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

        $scope.handleTempImg = function(imgUrl){
            var imgName ="";
            if(imgUrl&&imgUrl.lastIndexOf(".")>0)//如果包含有"."号 从最后一个"."号+1的位置开始截取字符串
            {
              imgName=imgUrl.substring(imgUrl.lastIndexOf(".")-5);
            }
            else
            {
               imgName=imgUrl;
            }
            return imgName;
        }
        $scope.handleName = function(fileType){
            if(fileType == "EXAMINATION"){
                return "检查";
            }else if(fileType == "INSPECTION"){
                return "检验"
            }else if(fileType == "MEDICAL_RECORD"){
                return "病历"
            }else if(fileType == "PACS"){
                return "影像"
            }else if(fileType == "OTHER"){
                return "其他"
            }

        }
        KyeeListenerRegister.regist({
            focus: "uploadMaterial",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                if ($scope.isClick) {
                    KyeeMessageService.confirm({
                        title: '温馨提示',
                        content: "您的会诊资料暂未提交，是否确认离开",
                        okText: "是",
                        cancelText: "否",
                        onSelect: function (confirm) {
                            if (confirm) {
                                $ionicHistory.goBack(-1);
                            } else {
                                return;
                            }

                        }

                    });
                }
                else {
                    $ionicHistory.goBack(-1);
                }
            }
        });
        $scope.goBack = function() {
            if ($scope.isClick) {
                KyeeMessageService.confirm({
                    title: '温馨提示',
                    content: "您的会诊资料暂未提交，是否确认离开",
                    okText: "是",
                    cancelText: "否",
                    onSelect: function (confirm) {
                        if (confirm) {

                            $ionicHistory.goBack(-1);
                        }

                    }
                });
            }else{

                $ionicHistory.goBack(-1);

            }
        }

    })
    .build();