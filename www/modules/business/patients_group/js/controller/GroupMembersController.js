/**
 * 产品名称：quyiyuan
 * 创建者：licong
 * 创建时间： 2016/7/22
 * 创建原因：群成员列表控制层
 */

new KyeeModule()
    .group("kyee.quyiyuan.patients_group.group_members.controller")
    .require(["kyee.quyiyuan.patients_group.personal_home.controller",
        "kyee.quyiyuan.patients_group.group_list.service",
        "kyee.quyiyuan.patients_group.personal_home.service",
        "kyee.quyiyuan.patients_group.my_doctor_details.service"
    ])
    .type("controller")
    .name("GroupMembersController")
    .params([
        "$scope",
        "$state",
        "$timeout",
        "GroupListService",
        "PersonalHomeService",
        "KyeeMessageService",
        "KyeeI18nService",
        "CacheServiceBus",
        "KyeeListenerRegister",
        "ContractsListService",
        "$ionicScrollDelegate",
        "GroupDetailsService",
        "KyeeUtilsService",
        "MyDoctorDetailsService"
    ])
    .action(function($scope, $state,$timeout, GroupListService, PersonalHomeService,
                     KyeeMessageService,KyeeI18nService,CacheServiceBus,KyeeListenerRegister,ContractsListService,$ionicScrollDelegate,GroupDetailsService,KyeeUtilsService,MyDoctorDetailsService){

        var memoryCache = CacheServiceBus.getMemoryCache();
        $scope.currentUserId = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID;
        $scope.keywords = {
           value: ""
        };
        $scope.words = ['医','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','#'];
        $scope.wordHeight = (KyeeUtilsService.getInnerSize().height - 50) / 28 - 2;
        $scope.showWordInfo = {
            text:"",
            flag:false,
            top:0
        };

        /**
         * 监听进入当前页面
         * 显示群组成员列表
         * add by wyn 20160803
         */
        KyeeListenerRegister.regist({
            focus: "group_members",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function () {
                $scope.groupName=GroupDetailsService.groupName;
                $scope.memberCount=GroupDetailsService.memberCount;
               GroupDetailsService.queryGroupMember(GroupListService.groupInfo.groupId,function(data){
                    $scope.doctorList = data.doctorList; //医生成员列表
                    $scope.patientList = data.patientList; //患者成员列表
                    $scope.groupId = data.groupId; // TODO 后台添加groupId字段
                   // $scope.groupName = data.groupName;
                    $scope.isInGroup = data.isInGroup; // TODO 后台添加isInGroup字段
                 //   $scope.memberCount = data.memberCount;
                    //add by zhangyi at 20161128 解决群成员列表搜索功能无效问题 KYEEAPPC-8971 START
                    GroupListService.groupInfo = {
                        groupId: data.groupId,
                        groupName: data.groupName,
                        memberCount: data.memberCount,
                        doctorList: data.doctorList,
                        patientList: data.patientList,
                        isInGroup: data.isInGroup ? 1 : 0
                    };
                    //add by zhangyi at 20161128 解决群成员列表搜索功能无效问题 KYEEAPPC-8971 END
                });
            }
        });

        /**
         * 搜索群成员
         * @param keywords
         */
        $scope.searchInGroup = function(keywords){
            if (keywords.trim()){
                var selectedResult = GroupListService.searchGroupMember(keywords.trim());
                $scope.doctorList = selectedResult.doctorList;
                $scope.patientList = selectedResult.patientList;
            } else {
                $scope.doctorList = GroupListService.groupInfo.doctorList;
                $scope.patientList = GroupListService.groupInfo.patientList;
                $ionicScrollDelegate.$getByHandle("group_member_list").scrollTop();
            }
            $ionicScrollDelegate.resize();
        };

        /**
         * 清空搜索框内容
         */
        $scope.clearInput = function() {
            $scope.keywords.value = "";
            $scope.doctorList = GroupListService.groupInfo.doctorList;
            $scope.patientList = GroupListService.groupInfo.patientList;
            $ionicScrollDelegate.$getByHandle("group_member_list").scrollTop();
        };

        /**
         * 显示病友详情
         * @param user
         * edited by zhangyi at 20161124 for KYEEAPPC-8731
         */
        $scope.getPatientDetail = function(user){
            var userId = user.yxUser.substring(4,user.yxUser.length);
            if(userId == $scope.currentUserId){ //点击自己，跳转至个人设置界面
                $state.go("personal_setting");
                return;
            }
            jsInterface.routerRecords.push($scope.groupId); //KYEEAPPC-8731 由成员列表跳转到病友详情的时候，记录下当前的群ID
            PersonalHomeService.userInfo = {
                userId: userId,
                fromGroupId: $scope.isInGroup == 1 ? $scope.groupId : undefined
            };
            $state.go("personal_home");
        };
        /**
         * TODO:添加医生(暂时去掉，后续可能会放开)
         * @param doctorId
         * @param index
         */
        // $scope.addDoctor = function (doctorId,index) {
        //
        // };

        /**
         *进入医生详情 addBy liwenjuan 2016/12/19
         * @param doctorId
         * @param index
         */
        $scope.getDoctorDetail = function (doctor) {
            jsInterface.routerRecords.push($scope.groupId); //KYEEAPPC-8731 由成员列表跳转到病友详情的时候，记录下当前的群ID
            MyDoctorDetailsService.doctorInfo = doctor;
            $state.go("my_doctor_details");
        };



        /**
         * 索引列表单击时
         * @param evt
         */
        $scope.doIndexedBarClick = function(evt){

            var y = evt.clientY;

            //高亮索引条
            // angular.element(document.getElementById("indexed_list_words_bar")).css("background-color", "#DDDDDD");

            //计算当前所处的字母
            var index = Math.floor((y - 105) / $scope.wordHeight);

            //定义合法范围
            if(index == 0){
                $scope.showWordInfo.text = $scope.words[index];
                $scope.showWordInfo.flag = true;
                $scope.showWordInfo.top = y - 70;

                if($scope.doctorList.length > 0){
                    $ionicScrollDelegate.$getByHandle("group_member_list").scrollTop();
                }
            } else if(index > 0 && index <= 27){

                $scope.showWordInfo.text = $scope.words[index];
                $scope.showWordInfo.flag = true;
                $scope.showWordInfo.top = y - 70;

                if(document.getElementById("group_"+$scope.words[index])){
                    $ionicScrollDelegate.$getByHandle("group_member_list").scrollTo(0, document.getElementById("group_"+$scope.words[index]).offsetTop, false);
                }
            }

            //高亮 250ms 后消失
            $timeout(function(){
                $scope.showWordInfo.flag = false;
            }, 250);
        }

        /**
         * 索引列表拖动时
         * @param evt
         */
        $scope.doIndexedBarDrag = function(evt){

            var y = evt.gesture.center.pageY;

            //高亮索引条
            // angular.element(document.getElementById("indexed_list_words_bar")).css("background-color", "#DDDDDD");

            //计算当前所处的字母
            var index = Math.floor((y - 105) / $scope.wordHeight);
            //定义合法范围
            if(index == 0){
                $scope.showWordInfo.text = $scope.words[index];
                $scope.showWordInfo.flag = true;
                $scope.showWordInfo.top = y - 70;

                if($scope.doctorList.length > 0){
                    $ionicScrollDelegate.$getByHandle("group_member_list").scrollTop();
                }
            } else if(index > 0 && index <= 27){
                $scope.showWordInfo.text = $scope.words[index];
                $scope.showWordInfo.flag = true;
                $scope.showWordInfo.top = y - 70;

                if(document.getElementById("group_"+$scope.words[index])){
                    $ionicScrollDelegate.$getByHandle("group_member_list").scrollTo(0, document.getElementById("group_"+$scope.words[index]).offsetTop, false);
                }
            }
        }

        /**
         * 索引列表释放时
         */
        $scope.doIndexedBarRelease = function(){
            $scope.showWordInfo.flag = false;
        }

    })
    .build();