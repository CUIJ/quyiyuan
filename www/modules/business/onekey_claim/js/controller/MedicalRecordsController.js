/**
 * 产品名称：quyiyuan
 * 创建者：程铄闵
 * 创建时间：2016年10月10日15:23:40
 * 创建原因：添加病历资料控制器
 * 任务号：KYEEAPPC-8136
 */
new KyeeModule()
    .group("kyee.quyiyuan.medicalRecords.controller")
    .require(["kyee.quyiyuan.medicalRecords.service",
        "kyee.quyiyuan.accidentRecords.controller"])
    .type("controller")
    .name("MedicalRecordsController")
    .params(["$scope", "$state","KyeeMessageService","KyeeI18nService","KyeeListenerRegister",
        "KyeeCameraService","KyeeDeviceInfoService","MedicalRecordsService","$location"])
    .action(function ($scope, $state,KyeeMessageService,KyeeI18nService,KyeeListenerRegister,
                      KyeeCameraService,KyeeDeviceInfoService,MedicalRecordsService,$location) {

        var rows;//行数
        var cols;//列数

        //初始化
        var init = function(){
            $scope.pictures = [['addImageBtn@']];//显示的图片
            $scope.picSource = ['addImageBtn@'];//图片源数据
            $scope.isAppPage = true;
            //获取列数
            var width = window.innerWidth;
            rows = 0;
            cols = Math.floor((width-108)/100)+1;//列数
        };

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
                $scope.isAppPage = true;
                return false;
            }
        }

        //获取待显示的照片
        var getDisplayPic = function(pic,isDel){
            var len = $scope.picSource.length;
            //非删除添加数据
            if(!isDel){
                if(len > 1){
                    $scope.picSource.splice(len-1,0,pic)
                }
                else{
                    $scope.picSource.unshift(pic);
                }
            }
            len = $scope.picSource.length;//更新长度
            rows = Math.ceil(len/cols);//行数
            if(rows > 0){
                $scope.pictures = [];
                var arr = [];
                var start = 0;
                var end = cols;
                for(var i=0;i<rows;i++){
                    if(start < len){
                        arr[i] = $scope.picSource.slice(start,end);
                        start = start + cols;
                        end = end + cols;
                        $scope.pictures.push(arr[i]);
                    }
                }
            }
        };

        //下一步按钮
        $scope.nextStep = function(){
            if($scope.picSource.length > 1){
                MedicalRecordsService.pictureTotal = $scope.picSource.length - 1;
                $state.go('accident_records');
            }
            else{
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("medical_records.checkNull", "请添加病历资料")
                });
            }
        };

        //删除照片
        $scope.deletePic = function(index){
            $scope.picSource.splice(index,1);
            getDisplayPic('',true);
            if(isWeiXin()){
                var imgContainer = document.getElementById('imgContainer');
                var img = document.getElementsByClassName('img_box')[index];
                imgContainer.removeChild(img);
            }
        };

        $scope.addPicture = function () {
/*            if(isWeiXin()){
                var pic = 'resource/images/aboutquyi/qrcode.png';
                getDisplayPic(pic);
                var len = $scope.picSource.length;
                document.getElementsByClassName('wxImgs')[len-2].src = pic;
            }
            else{
                var pic = 'resource/images/aboutquyi/qrcode.png';
                getDisplayPic(pic);
            }*/
            if(isWeiXin())
            {
                KyeeMessageService.confirm({
                    content: "微信公众号暂不支持图片裁剪，下载趣医APP，给您更优质的业务体验",
                    cancelText: "继续上传",
                    cancelButtonClass:'qy-bg-grey3',
                    okText: "去下载",
                    onSelect: function (flag) {
                        if (!flag) {
                            var url = $location.$$absUrl;
                            MedicalRecordsService.chooseImage(function(pic){
                                getDisplayPic(pic[0]);
                                var len = $scope.picSource.length;
                                document.getElementsByClassName('wxImgs')[len-1].src = pic[0];
                                $scope.$digest();
                            },url.substring(0,url.indexOf("#")));
                        }
                        else
                        {
                            window.location.href = "http://www.quyiyuan.com/mobileweb/mobiledownload.html";
                        }
                    }
                });
            }
            else{
                KyeeMessageService.actionsheet({
                    buttons: [
                        {
                            text: KyeeI18nService.get("medical_records.takePhotos","拍照")
                        },
                        {
                            text: KyeeI18nService.get("medical_records.fromPhotos","从相册选择")
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
                    targetWidth: 900,  //设置图片宽度
                    targetHeight: 1200,//设置图片高度
                    allowEdit: true,
                    encodingType: Camera.EncodingType.JPEG,
                    sourceType: Camera.PictureSourceType.CAMERA
                };
                KyeeCameraService.getPicture(
                    // 调用成功时返回的值
                    function (retVal) {
                        getDisplayPic(retVal);
                        $scope.$digest();
                    },
                    // 调用失败时返回的值
                    function (retVal) {
                    }, options);
            } else if ($scope.platform == "iOS") {
                var options = {
                    quality: 40,
                    destinationType: Camera.DestinationType.FILE_URI,
                    targetWidth: 900,  //设置图片宽度
                    targetHeight: 1200,//设置图片高度
                    saveToPhotoAlbum: true,
                    allowEdit: true,
                    sourceType: Camera.PictureSourceType.CAMERA
                };
                KyeeCameraService.getPicture(
                    // 调用成功时返回的值
                    function (retVal) {
                        getDisplayPic(retVal);
                        $scope.$digest();
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
                    targetWidth: 900,//设置图片宽度
                    targetHeight: 1200,//设置图片高度
                    allowEdit: false,
                    encodingType: Camera.EncodingType.JPEG,
                    sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM
                };
                KyeeCameraService.getPicture(
                    // 调用成功时返回的值
                    function (retVal) {
                        getDisplayPic(retVal);
                        $scope.$digest();
                    },
                    // 调用失败时返回的值
                    function (retVal) {
                    }, options);
            } else if ($scope.platform == "iOS") {
                var options = {
                    quality: 40,
                    destinationType: Camera.DestinationType.FILE_URI,
                    targetWidth: 900,//设置图片宽度
                    targetHeight: 1200,//设置图片高度
                    saveToPhotoAlbum: true,
                    allowEdit: true,
                    sourceType: Camera.PictureSourceType.PHOTOLIBRARY
                };
                KyeeCameraService.getPicture(
                    // 调用成功时返回的值
                    function (retVal) {
                        getDisplayPic(retVal);
                        $scope.$digest();
                    },
                    // 调用失败时返回的值
                    function (retVal) {
                    }, options);
            }
        };

        // 获取当前设备平台 iOS or android
        KyeeDeviceInfoService.getInfo(function (info) {
                $scope.platform = info.platform;
            }, function () {
        });

        KyeeListenerRegister.regist({
            focus: "medical_records",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "forward",
            action: function (params) {
                init();
            }
        });
    })
    .build();