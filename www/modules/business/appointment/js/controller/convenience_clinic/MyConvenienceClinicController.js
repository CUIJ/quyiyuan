/**
 * 产品名称：我的方便门诊记录
 * 创建者：王婉
 * 创建时间： 2017年4月11日14:44:35
 * 创建原因：登录页面的controller
 * 修改者：王婉
 * 任务号：
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.my.convenience.clinic.controller")
    .require([
        "kyee.quyiyuan.appointment.video_interrogation.controller",
        "kyee.quyiyuan.appointment.purchase_medincine.controller"
    ])
    .type("controller")
    .name("MyConvenienceClinicController")
    .params(["$scope","KyeeListenerRegister","MyConvenienceClinicService","$state",
        "AppointmentRegistListService","VideoInterrogationService","PurchaseMedinceService","PersonalChatService","LoginService"])
    .action(function ($scope,KyeeListenerRegister,MyConvenienceClinicService,$state,
                      AppointmentRegistListService,VideoInterrogationService,PurchaseMedinceService,PersonalChatService,LoginService) {
        /**
         * 监听进入当前页面
         */
        var curPage = 0 ;
        KyeeListenerRegister.regist({
            focus: "my_convenience_clinic",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (params) {
                curPage = 0 ;
                $scope.NO_DATA = false;
                $scope.HAS_MORE = false;
                $scope.loadConvenienceMore(0);
            }
        });
        $scope.loadConvenienceMore = function(type) {
            //type 0 页面初始化 1.上啦加载
            curPage++;
            if(type=='0'){//初始化
                curPage=1;
            }
            MyConvenienceClinicService.getConvenienceClinicList(curPage,function (resultData) {
                if(!$scope.CONVENIENCE_LIST){
                    $scope.CONVENIENCE_LIST=resultData;
                }else{
                    if(type=='0'){
                        //如果是初始化
                        $scope.CONVENIENCE_LIST=resultData;
                    }else{
                        //如果是上拉加载更多
                        $scope.CONVENIENCE_LIST=$scope.CONVENIENCE_LIST.concat(resultData);
                    }
                }
                $scope.HAS_MORE=resultData.length>0;
                if($scope.CONVENIENCE_LIST.length>0){
                    $scope.NO_DATA = false;
                }else{
                    $scope.NO_DATA = true;
                }
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
        };
        //意见反馈
        $scope.goFeedBack = function () {
            if($scope.dialog){
                $scope.dialog.close();
            }
            $state.go("aboutquyi_feedback");
        };
        //去点评
        $scope.goToComment = function(appointList) {
            appointList.DOCTOR_PIC_PATH =appointList.DOCTOR_PHOTO;
            AppointmentRegistListService.goToComment(appointList);
        };
        $scope.goToVideoInterrogation = function(CONVENIENCE){
            if(CONVENIENCE.ONLINE_BUSINESS_TYPE=='0'){
                //VideoInterrogationService.REG_ID=CONVENIENCE.REG_ID;
                VideoInterrogationService.REG_ID=CONVENIENCE.REG_ID;
                VideoInterrogationService.ROUTER = "my_convenience_clinic";
                $state.go("video_interrogation");
            }else{
                PurchaseMedinceService.REG_ID=CONVENIENCE.REG_ID;
                PurchaseMedinceService.ROUTER = "my_convenience_clinic";
                $state.go("purchase_medince");
            }
        }
        /**
         * 联系医生
         */
        $scope.chatWithDoctor = function (DETAIL_DATA) {
            var param={
                hospitalId:DETAIL_DATA.HOSPITAL_ID,
                deptCode:DETAIL_DATA.DEPT_CODE,
                doctorCode:DETAIL_DATA.DOCTOR_CODE
            };
            PurchaseMedinceService.queryDoctorDetail(param,function(data){
                var userInf=LoginService.storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.USER_ACT_INFO);
                if(!userInf){
                    LoginService.getIMLoginInfo();
                }
                PersonalChatService.receiverInfo = { //接收者医生信息
                    yxUser: data.yxUser,
                    userRole: 2,
                    userPetname: data.doctorName, //医生姓名
                    userPhoto: data.doctorPhoto,
                    sex: data.doctorSex,
                  /*  scUserVsId: $scope.scUserVsId,*/
                    scUserId:userInf.scUserId,
                    visitName: $scope.petientName //就诊者真是姓名
                };
                PersonalChatService.goPersonalChat();
            });
        };
        $scope.showButton  = function(CONVENIENCE){
            if((CONVENIENCE.ONLINE_BUSINESS_STATUS=='2'&&CONVENIENCE.ONLINE_BUSINESS_TYPE=='1')||
                CONVENIENCE.SUGGEST_FLAG||CONVENIENCE.COMMENT_FLAG||
                (CONVENIENCE.ONLINE_BUSINESS_STATUS=='0'&&CONVENIENCE.ONLINE_BUSINESS_TYPE=='1')||
                CONVENIENCE.CONTACT_DOCTOR_FLAG){
                return true;
            }else{
                return false;
            }
        };
        $scope.getTextColor = function(CONVENIENCE){
            //ONLINE_BUSINESS_STATUS  购药阶段：  -1表示失败或者预约挂号中 0:申请填单中;1:等待医生响应;2:购药/开单完成;3:超时未响应,4:订单失效 5:取消问诊
            //视频问诊的阶段：-1确认阶段；1等待接诊；2问诊完成；3超时未处理
            var flag = 1;//1绿色，2 红色，3灰色#666
            if(CONVENIENCE.TYPE=='0'){
                if(CONVENIENCE.APPOINT_TYPE=='2'||CONVENIENCE.APPOINT_TYPE=='4'||(CONVENIENCE.APPOINT_TYPE=='1'&&CONVENIENCE.ONLINE_BUSINESS_STATUS=='6')){
                    flag = 2;
                }else if(CONVENIENCE.APPOINT_TYPE=='1'&&(CONVENIENCE.ONLINE_BUSINESS_STATUS=='3'||CONVENIENCE.ONLINE_BUSINESS_STATUS=='4')){
                    flag = 3;
                }else{
                    flag = 1;
                }
            }else {
                if(CONVENIENCE.REGIST_TYPE=='2'||CONVENIENCE.REGIST_TYPE=='5'){
                    flag = 2;
                }else if(CONVENIENCE.REGIST_TYPE=='1'&&(CONVENIENCE.ONLINE_BUSINESS_STATUS=='3'||CONVENIENCE.ONLINE_BUSINESS_STATUS=='4')){
                    flag = 3;
                }else{
                    flag = 1;
                }
            }
            return flag;
        }
    })
    .build();
