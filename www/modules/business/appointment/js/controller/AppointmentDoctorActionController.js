new KyeeModule()
    .group("kyee.quyiyuan.appointment.doctor_action.controller")
    .require([
        "kyee.quyiyuan.consultation.show_pictures.service",
        "kyee.quyiyuan.appointment.doctor_action.service",
        "kyee.quyiyuan.consultation.view_full_text.service",
        "kyee.quyiyuan.appointment.doctor_detail.service",
        "kyee.quyiyuan.consultation.view_full_text.controller"
    ])
    .type("controller")
    .name("AppointmentDoctorActionController")
    .params(["$scope", "$state", "KyeeViewService","KyeeListenerRegister","ShowPicturesService",
        "AppointmentDoctorActionService","$ionicHistory", "AppointmentDoctorDetailService",
        "$ionicScrollDelegate","ViewFullTextService"])
    .action(function ($scope, $state, KyeeViewService,KyeeListenerRegister,ShowPicturesService,
          AppointmentDoctorActionService,$ionicHistory, AppointmentDoctorDetailService,
          $ionicScrollDelegate,ViewFullTextService) {


        /**
         * 局部变量
         */
        var wordsPreLine = Math.floor((window.innerWidth -10*2)/14);
        //本次下拉加载是否完成
        var loadComplete = true;
        //本次加载时间戳
        var loadTimeStep = null;
        //每页显示记录说
        var count = 10;
        //当前页
        var page = 0;
        /**
         *监听
         */
        KyeeListenerRegister.regist({
            focus: "doctor_action",
            direction: "both",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.ENTER,
            action: function (params) {
                $scope.loadMore();
            }
        });
        KyeeListenerRegister.regist({
            focus: "doctor_action",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.goBack();
            }
        });
        /**
         * 声明对象
         */
        $scope.isShowLoadMore = true;
        $scope.doctorActionList = [];
        /**
         *对外函数
         */
        $scope.toggleShowAll = function(action) {
            //var scrollHeight =  $ionicScrollDelegate.$getByHandle("doctor_action_content").getScrollPosition().top;
            if(action.lines > 6){
                ViewFullTextService.content = action.content;
                $state.go("view_full_text");
                return;
            }
            action.isShowAll = !action.isShowAll;

            //if(!action.isShowAll){
            //    $ionicScrollDelegate.$getByHandle("doctor_action_content").resize();
            //    $ionicScrollDelegate.$getByHandle("doctor_action_content").scrollTo(0,scrollHeight,true)
            //}
        };
        $scope.goBack = function(){
            $ionicHistory.goBack(-1);
        };
        $scope.preview = function(imgList,index){
            ShowPicturesService.ACTIVESLIDE = index; //定义页面初始展示第几张图
            ShowPicturesService.IMGLIST = imgList;
            KyeeViewService.openModalFromUrl({
                url: "modules/business/consultation/views/template/show_picture.html",
                scope: $scope,
                animation: "slide-in-right"
            });
        };
        $scope.loadMore = function(){
            if(!loadComplete){
                return;
            }
            if(!loadTimeStep){
                loadTimeStep = new Date().getTime();
            }else{
                var now = new Date().getTime();
                if (now - loadTimeStep < 500){
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    return;
                } else {
                    loadTimeStep = now;
                }
            }
            loadComplete = false;
            loadDoctorAction();
        };
        /**
         * 私有函数
         */
        function loadDoctorAction(){
            var param = {
                hospitalId:AppointmentDoctorDetailService.doctorInfo.HOSPITAL_ID,
                deptCode:AppointmentDoctorDetailService.doctorInfo.DEPT_CODE,
                doctorCode:AppointmentDoctorDetailService.doctorInfo.DOCTOR_CODE,
                showLoading:false,
                currentPage:page++,
                pageSize:count
            };
            AppointmentDoctorActionService.getDoctorAction(param, function(data){
                var list = data.DoctorDynamicsList;
                if (list.length < count) {   //取回的数据小于每页的数量，则表明数据已全部加载
                    $scope.isShowLoadMore = false;
                }
                if (list.length !== 0) {
                    handleActionPicture(list);
                    $scope.doctorActionList = $scope.doctorActionList.concat(list);
                }
                $scope.$broadcast('scroll.infiniteScrollComplete');
                loadComplete = true;
            }, function(error){
                $scope.$broadcast('scroll.infiniteScrollComplete');
                loadComplete = true;
            });
        }
        function handleActionPicture(list){
            angular.forEach(list,function(item,index,array){
                item.content = item.content.replace(/(\\r|\\n)/g,'');
                item.isShowAll = false;
                item.lines = Math.ceil(item.content.length/wordsPreLine);
                item.pictureArray = [];
                if(item.pictures == ''){
                    return;
                }
                var array = item.pictures.split(",");
                angular.forEach(array,function(pic){
                    item.pictureArray.push({
                        imgUrl:pic
                    });
                });
            });
        }
    })
    .build();

