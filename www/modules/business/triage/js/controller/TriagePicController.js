/**
 * 产品名称：quyiyuan
 * 创建者：章剑飞
 * 创建时间：2015年5月6日15:24:13
 * 创建原因：图片导诊控制器
 * 修改者：
 * 修改原因：
 */
new KyeeModule()
    .group("kyee.quyiyuan.triagePic.controller")
    .require(["kyee.quyiyuan.triagePic.service", "kyee.quyiyuan.bodySymptomList.controller", "kyee.quyiyuan.bodySymptomList.service"])
    .type("controller")
    .name("TriagePicController")
    .params(["$scope", "$state", "TriagePicService", "CacheServiceBus", "KyeeListenerRegister", "BodySymptomListService", "KyeeEffectService","LoginService","$ionicHistory"])
    .action(function ($scope, $state, TriagePicService, CacheServiceBus, KyeeListenerRegister, BodySymptomListService, KyeeEffectService,LoginService,$ionicHistory) {
        //TriageMainService.picScope = $scope;

        var body_position = BODY_POSITION;
        //数据集
        var TriageData = undefined;
        $scope.otherBodyPicSrc = "resource/images/triage/bt.png";
        //是否点击了部位
        var touched = false;

        //当前设备的高度
        var phone_height = window.innerHeight;
        //当前设备的宽度
        var phone_width = window.innerWidth;
        //图片能填充的最大高度,94为 标题栏高度+底边栏高度
        var max_height = phone_height - 94;
        //图片缩放比例
        var scale = 0;
        //分支版本号
        $scope.branchVerCode=DeploymentConfig.BRANCH_VER_CODE;
        $scope.fromBozhou=LoginService.fromBozhou;
        if($scope.branchVerCode=='03'&& LoginService.fromBozhou==true){
            $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
                viewData.enableBack = true;
            });
        }
        var isIOS = window.device && (window.device.platform == "iOS");
        $scope.isIos = !!isIOS;
        if (max_height / phone_width > 500 / 340) {
            //高度过高，以屏幕宽为图片宽度
            scale = phone_width / 340;
            $scope.usePhoneWidth = true;
        } else {
            //宽度过宽，以填充最大高度为图片高度
            scale = max_height / 500;
            $scope.usePhoneWidth = false;
        }
        //切换部位，只有部位，无坐标
        $scope.coordsSwitch = function () {
            if (TriagePicService.currentDirection == '01') {
                //正面
                $scope.TriageMainData = TriageData[0];
            } else if (TriagePicService.currentDirection == '00') {
                //背面
                $scope.TriageMainData = TriageData[1];
            }
        };
        //更新身体图片
        $scope.switchPic = function () {
            $scope.currentSex = TriagePicService.currentSex;
            if (TriagePicService.currentSex == '1' && TriagePicService.currentDirection == '01') {
                //主体图
                $scope.bodyPicSrc = "resource/images/triage/man_f.png";
                //坐标
                $scope.coords = angular.copy(body_position.man.front);
            } else if (TriagePicService.currentSex == '1' && TriagePicService.currentDirection == '00') {
                //主体图
                $scope.bodyPicSrc = "resource/images/triage/man_b.png";
                //坐标
                $scope.coords = angular.copy(body_position.man.back);
            } else if (TriagePicService.currentSex == '2' && TriagePicService.currentDirection == '01') {
                //主体图
                $scope.bodyPicSrc = "resource/images/triage/wemen_f.png";
                //坐标
                $scope.coords = angular.copy(body_position.woman.front);
            } else if (TriagePicService.currentSex == '2' && TriagePicService.currentDirection == '00') {
                //主体图
                $scope.bodyPicSrc = "resource/images/triage/wemen_b.png";
                //坐标
                $scope.coords = angular.copy(body_position.woman.back);
            } else if (TriagePicService.currentSex == '3' && TriagePicService.currentDirection == '01') {
                //主体图
                $scope.bodyPicSrc = "resource/images/triage/child_f.png";
                //坐标
                $scope.coords = angular.copy(body_position.child.front);
            } else if (TriagePicService.currentSex == '3' && TriagePicService.currentDirection == '00') {
                //主体图
                $scope.bodyPicSrc = "resource/images/triage/child_b.png";
                //坐标
                $scope.coords = angular.copy(body_position.child.back);
            }
            $scope.coordsSwitch();
            $scope.coords = TriagePicService.coordsConvert($scope.coords, $scope.TriageMainData, scale);
        };

        //页面数据
        TriagePicService.dealData(function (data) {
            TriageData = data;
            $scope.switchPic();
        }, body_position);
        //如果从外界进入自我诊断，重置缓存性别
        KyeeListenerRegister.regist({
            focus: "triageMain",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            action: function (params) {
                //全局参数
                var memoryCache = CacheServiceBus.getMemoryCache();
                //默认为正面
                TriagePicService.currentDirection = '01';
                if (memoryCache.get('currentCustomPatient') != undefined) {
                    if (memoryCache.get('currentCustomPatient').SEX != '1'
                        && memoryCache.get('currentCustomPatient').SEX != '2') {
                        TriagePicService.currentSex = '1';
                    } else {
                        TriagePicService.currentSex = memoryCache.get('currentCustomPatient').SEX;
                    }
                } else {
                    //默认为男
                    TriagePicService.currentSex = '1';
                }
                if (TriageData) {
                    $scope.switchPic();
                }
            }
        });
        KyeeListenerRegister.regist({
            focus: "triageMain",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.AFTER_ENTER,
            direction: "both",
            action: function (params) {
                KyeeEffectService.ClickEffect.addCircleEffect({
                    onBefore: function (cfg) {
                        return (cfg.top >= 45 && cfg.top <= window.innerHeight - 50);
                    },
                    onFinish: function () {
                        if (touched) {
                            touched = false;
                            $state.go("bodySymptomList");
                        }
                    }
                });
            }
        });
        KyeeListenerRegister.regist({
            focus: "triageMain",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_LEAVE,
            action: function (params) {
                KyeeEffectService.ClickEffect.removeCircleEffect();
            }
        });
        //切换性别
        $scope.sexSwitch = function (flag) {
            TriagePicService.currentSex = flag;
            //切换为正面
            TriagePicService.currentDirection = '01';
            //更新身体图片
            $scope.switchPic();
        };
        //切换面向
        $scope.directionSwitch = function () {
            if (TriagePicService.currentDirection == '00') {
                //背面则切换为正面
                TriagePicService.currentDirection = '01';
            } else if (TriagePicService.currentDirection == '01') {
                //正面则切换为背面
                TriagePicService.currentDirection = '00';
            }
            //更新身体图片
            $scope.switchPic();
        };
        //跳转到身体部位及主症列表页面
        $scope.showBodySymptomList = function (event) {
            if(!event){
                //点击右上角列表导诊
                TriagePicService.noSex = false;
                $state.go("bodySymptomList");
                return;
            }
            var x = 0;
            var y = event.y - 44;
            if ($scope.usePhoneWidth) {//屏幕宽度作为图片宽度
                x = event.x;
            } else {//填充最大高度为图片高度
                var imgWidth = scale * 340;
                //图片距离边距
                var space = (window.innerWidth - imgWidth) / 2;
                x = parseInt(event.x - space);
            }
            //判断点击的是否为人体部位
            TriagePicService.isPointInPolygon(function (flag, bodyId, bodyName) {
                //点击的是人体部位
                if (flag) {
                    touched = true;
                    //清除列表选中的部位
                    BodySymptomListService.partId = undefined;
                    TriagePicService.noSex = false;
                    TriagePicService.bodyId = bodyId;
                    TriagePicService.bodyName = bodyName;
                    if (!bodyId && !bodyName) {
                        $state.go("bodySymptomList");
                    }
                }
            }, $scope.coords, $scope.TriageMainData, x, y);
        };

        $scope.goBack = function(){
            if($scope.branchVerCode == '03'&&$scope.fromBozhou){
                backToBoZhou();
            }else{
                $ionicHistory.goBack();
            }
        };

        /**
         * 返回到我家亳州APP页面
         */
        backToBoZhou=function(){
            javascript:myObject.goBack();
        };
    })
    .build();