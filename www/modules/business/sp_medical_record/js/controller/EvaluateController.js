/**
 * 产品名称 quyiyuan.
 * 创建用户: yangmingsi
 * 日期: 2017年2月21日09:40:54
 * 创建原因：KYEEAPPC-10018 满意度评价controller
 */
new KyeeModule()
    .group("kyee.quyiyuan.evaluateController.controller")
    .require([
        "kyee.framework.service.message",
        "kyee.framework.service.view",
        "kyee.quyiyuan.login.service",
        "kyee.quyiyuan.account_authentication.service",
        "kyee.quyiyuan.center.updateuser.service",
        "kyee.quyiyuan.aboutquyi.service",
        "kyee.quyiyuan.center.controller.administrator_login",
        "kyee.quyiyuan.center.administrator_login",
        "kyee.quyiyuan.medicalRecordController.clinic_hos_record.controller",
        "kyee.quyiyuan.center.medicalRecord.service"
    ])
    .type("controller")
    .name("EvaluateController")
    .params([
        "$scope",
        "$state",
        "KyeeViewService",
        "KyeeListenerRegister",
        "KyeeI18nService",
        "KyeeMessageService",
        "LoginService",
        "CacheServiceBus",
        "MedicalRecordService",
        "$ionicScrollDelegate",
        "$timeout",
        "$ionicHistory"
    ])
    .action(function($scope, $state, KyeeViewService, KyeeListenerRegister, KyeeI18nService, KyeeMessageService, LoginService, CacheServiceBus,MedicalRecordService,$ionicScrollDelegate,$timeout,$ionicHistory){
        $scope.top = false;
        $scope.suggestInfo = {};
        $scope.suggestInfo.suggest = '';
        $scope.total = 0;
        $scope.avgSCORE = 0;
        $scope.disSatReason=0;//是否显示不满意原因  0不显示，1显示
        $scope.reasonListHead='';// 不满意原因开头
        $scope.disSatReasonList=[];  //不满意原因列表
        $scope.fairSatReasonList=[];  //一般满意原因列表
        $scope.disSatReasonShowList=[];  //展示不满意原因列表
        $scope.disSatSelectList=[];
        //$scope.backColor='white';
        var rows = 6; //每页显示数据为6条
        var currentPage = 0; // 初始化当前页
        var postData = {};
        if(MedicalRecordService.medicalContent) {
            $scope.suggestFlag = MedicalRecordService.medicalContent.isEvaluated;
            var recordId = MedicalRecordService.medicalContent.recordId;//门诊/住院ID
            if(MedicalRecordService.medicalRecordItem){
                var hospitalId = MedicalRecordService.medicalRecordItem.hospitalId;//医院ID
                $scope.hospitalName = MedicalRecordService.medicalRecordItem.hospitalName;
            }
            var deptCode = MedicalRecordService.medicalContent.deptCode.trim();//科室ID
            var doctorCode = MedicalRecordService.medicalContent.doctorCode.trim();//医生ID
            var treatmentType = MedicalRecordService.queryType;//查询类型
            var gradeCode = MedicalRecordService.medicalContent.gradeCode;//医生称谓
            $scope.doctorName = MedicalRecordService.medicalContent.doctorName.trim();//医生姓名
            $scope.deptName = MedicalRecordService.medicalContent.deptName.trim();//科室名称
            $scope.gradeName = MedicalRecordService.medicalContent.gradeName; //医生职称
            $scope.doctorImage=MedicalRecordService.medicalContent.doctorImage.trim(); //医生图片
            postData = {
                recordId: recordId,
                hospitalId: hospitalId,
                deptCode: deptCode,
                doctorCode: doctorCode,
                treatmentType: treatmentType,
                gradeCode: gradeCode,
                sourceFlag : "1"
            };
        }


         $scope.showKeyBoard = function(){
            $scope.top = true;
        };
        $scope.hideKeyBoard = function(){
            $scope.top = false;
        };
        var loadData = function(){
            MedicalRecordService.querySuggest(recordId,postData.sourceFlag,function(data){
                if(data && data.success){
                    $scope.suggestInfo = data.data;
                    $scope.score = $scope.suggestInfo.scoreValue;
                }else if (data && !data.success) {
                    $scope.isEmpty = true;
                    //异常接收与提示
                    KyeeMessageService.broadcast({
                        content:  "查询失败,请稍后重试！"
                    });
                } else {
                    $scope.isEmpty = true;
                    KyeeMessageService.broadcast({
                        content:  "查询失败，请稍后重试！"
                    });
                }
            });
        };

        var loadAllSuggest = function () {
            $scope.noLoad = false;//是否显示数据已加载完毕标识
            MedicalRecordService.queryAllSuggest(hospitalId,deptCode,doctorCode,gradeCode,currentPage,rows,function(data){
                if(data&&data.success){
                    if(data.data.row.length==0){
                        $scope.isEmpty = true;
                    }
                    $scope.suggestAllInfo = data.data.datas;
                    if(data.data.total){
                        $scope.total = data.data.total;
                    }
                  //  $scope.avgSCORE = data.data.avgScore;
                    if(data.data.datas.length < rows){
                        $scope.noLoad = false;
                    }else{
                        $scope.noLoad = true;
                    }

                    for (var i = 0; i < data.data.datas.length; i++) {
                        data.data.datas[i].patientName = handelNmae(data.data.datas[i].patientName);
                    }

                }else {
                    $scope.isEmpty = true;
                    KyeeMessageService.broadcast({
                        content:  "查询失败，请稍后重试！"
                    });
                }
            });
        };
        /*计算医生评价平均分**/
        var loadDoctorAvgScore = function(){
            MedicalRecordService.queryDoctorAvgScore(hospitalId,deptCode,doctorCode,gradeCode,postData.sourceFlag,function(data){
                if(data && data.success){
                    $scope.avgSCORE = data.data.avgScore;
                }else if (data && !data.success) {
                    $scope.isEmpty = true;
                    //异常接收与提示
                    KyeeMessageService.broadcast({
                        content:  "查询失败,请稍后重试！"
                    });
                } else {
                    $scope.isEmpty = true;
                    KyeeMessageService.broadcast({
                        content:  "查询失败，请稍后重试！"
                    });
                }
            });
        };

        /**
         *  不满意原因列表查询
         */
        var loadDisSatReasonListInfo=function(){
            MedicalRecordService.queryDisSatReasonList(0,function(data){
                if(data && data.success){
                    $scope.disSatReasonList = data.data;
                }else if (data && !data.success) {
                    $scope.isEmpty = true;
                    //异常接收与提示
                    KyeeMessageService.broadcast({
                        content:  "查询失败,请稍后重试！"
                    });
                } else {
                    $scope.isEmpty = true;
                    KyeeMessageService.broadcast({
                        content:  "查询失败，请稍后重试！"
                    });
                }
            });
        }

        /**
         * 查询一般满意原因列表
         */
        var loadFairSatReasonListInfo=function(){
            MedicalRecordService.queryDisSatReasonList(1,function(data){
                if(data && data.success){
                    $scope.fairSatReasonList = data.data;
                }else if (data && !data.success) {
                    $scope.isEmpty = true;
                    //异常接收与提示
                    KyeeMessageService.broadcast({
                        content:  "查询失败,请稍后重试！"
                    });
                } else {
                    $scope.isEmpty = true;
                    KyeeMessageService.broadcast({
                        content:  "查询失败，请稍后重试！"
                    });
                }
            });
        }

        if($scope.suggestFlag&&$scope.suggestFlag ==1){
            loadData();
        }
        if($scope.suggestFlag !=1){
            loadDisSatReasonListInfo();
            loadFairSatReasonListInfo();

        }
        loadAllSuggest();
        //查询医生平均分
        loadDoctorAvgScore();
        $scope.loadMore = function () {
            $scope.noLoad = false;
            if($scope.pageType == 2){
            currentPage++;
            MedicalRecordService.queryAllSuggest(hospitalId,deptCode,doctorCode,gradeCode,currentPage,rows,function(data){
                if(data&&data.success){
                    if(data.data.datas.length==0){
                        $scope.isEmpty = true;
                        $scope.noLoad = false;
                    }
                    if(data.data.datas.length < rows){
                        $scope.noLoad = false;
                    }else{
                        $scope.noLoad = true;
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    }
                    //追加加载数据
                    for (var i = 0; i < data.data.datas.length; i++) {
                        data.data.datas[i].patientName = handelNmae(data.data.datas[i].patientName);
                        $scope.suggestAllInfo.push(data.data.datas[i]);
                    }

                    if(data.data.total){
                        $scope.total = data.data.total;
                    }
                    $ionicScrollDelegate.$getByHandle("sp_evaluate").scrollBottom(true);

                    $scope.$broadcast('scroll.infiniteScrollComplete');
                } else {
                    $scope.isEmpty = true;
                    $scope.noLoad = false;
                    KyeeMessageService.broadcast({
                        content:  "查询失败，请稍后重试！"
                    });
                }
            });
            }
        };
        /**
         * 评价状态判断函数
         * @param status
         * @returns {boolean}
         */
        $scope.suggestStatus = function (status) {
            if(suggestFlag == status){
                return true;
            } else {
                return false;
            }
        };
        // 动态获取屏幕盒子的宽度
        var totalWidth = window.innerWidth;
        //124=50+50+12+12 50:左右边距；12：文字左右边距;文字宽度:84
        $scope.boxWidth = (totalWidth - 124 - 84)/2 ;
        $scope.textLeft =$scope.boxWidth+12+50;
        $scope.text2Left =$scope.boxWidth+12+50+20;
        // 180:五个星星的总宽度;starLeft：星星div左边距离
        $scope.starLeft = (totalWidth -180)/2 ;
        $scope.textareaWidth = totalWidth - 100;
        //$scope.headTop=30;
        $scope.SUGGEST_SCORE=4.5;
        //获取当前星星的样式：空星、半星、满星
        $scope.getXingCls = function(score,idx){

                var cls = "";
                var x = score- idx;
                if(x >= 0){
                    //满星
                    cls = "icon-favorite2";
                }else if(x >= -0.5){
                    //半星
                    cls = "icon-favorite1";
                }else if(x < -0.5){
                    //空星
                    cls = "icon-favorite2 empty_star";
                }
                return cls;
        };
        $scope.pageType =1;
        $scope.choosePage = function (type) {
           if(type==1){
               $scope.pageType =2;
           }else{
               $scope.pageType =1;
           }

        };
        /**
         * 星号点击事件
         * @param index
         * @param score
         */
        $scope.starClick = function (index, score) {
            $scope.SCORE_VALUE = score;
            if((score==0&&$scope.disSatReasonList.length>0)||(score==1&&$scope.fairSatReasonList.length>0)){
                $scope.disSatReason=1;
                //$scope.headTop=50;
                if(score==0){
                    $scope.reasonListHead='不满意原因';
                    $scope.disSatReasonShowList=$scope.disSatReasonList;
                }else{
                    $scope.reasonListHead='一般原因';
                    $scope.disSatReasonShowList=$scope.fairSatReasonList;
                }
            }else{
                $scope.disSatReason=0;
                //$scope.headTop=30;
                $scope.disSatReasonShowList=[];
            }

        };
        /*
         /**
         * 检测输入框变化函数
         */
        $scope.checkSuggest = function () {
            // 监听输入事件，限制评论长度不超过150
            if($scope.suggestInfo.suggest.length > 150){
                KyeeMessageService.broadcast({
                    content:'评论字数不能超过150字！',
                    duration: 1000
                });

                $scope.suggestInfo.suggest = $scope.suggestInfo.suggest.substring(0, 150);
            }

            // 输入框自动增长
            var scrollHeight = document.querySelector("#suggestContent").scrollHeight;
            if(scrollHeight > 100 && document.querySelector("#suggestContent").style.height != scrollHeight + 'px'){
                document.querySelector("#suggestContent").style.height = scrollHeight + 'px';
            }
        };

        /**
         * 保存评价函数
         */
        $scope.saveSuggest = function () {
            postData.scoreValue = $scope.SCORE_VALUE;
            var noLoginAndPatient = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.NO_LOGIN_AND_PATIENT);
            var wxFlag=CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.WX_OPEN_PATIENT);
            if(wxFlag==1){
                postData.sourceFlag="2";
            }else{
				postData.sourceFlag="1";
			}
            var dissatisfactionReasons='';
            for(var i=0;i<$scope.disSatSelectList.length;i++){
                dissatisfactionReasons=dissatisfactionReasons+$scope.disSatSelectList[i]+",";
            }
            if(dissatisfactionReasons.length>0){
                dissatisfactionReasons=dissatisfactionReasons.substring(0,dissatisfactionReasons.length-1);
            }
            postData.dissatisfactionReasons=dissatisfactionReasons;

            if($scope.suggestInfo.suggest&&$scope.suggestInfo.suggest!==""){
                postData.suggestValue = $scope.suggestInfo.suggest;
            }else{
                postData.suggest="暂无文字评价内容！";
            }

            MedicalRecordService.saveSuggestData(
                postData,
                function(data){
                    MedicalRecordService.medicalContent.SUGGEST_FLAG =1;
                    KyeeMessageService.message({
                        title: KyeeI18nService.get('commonText.warmTipMsg', '温馨提示', null),
                        okText: KyeeI18nService.get("commonText.iknowMsg", "我知道了"),
                        content: KyeeI18nService.get('satisfaction_menu.satisfaction_doctor.pingLunTiJiaoOk',"您已成功完成对医生的评价！", null),
                        onOk:function(){
                            $scope.suggestFlag  = 1;
                            $scope.suggest  = postData.suggest;
                            $scope.disSatReason=0;
                            $scope.headTop=30;
                            $scope.disSatReasonShowList=[];
                            loadData();
                            loadAllSuggest();
                            loadDoctorAvgScore();
                        }
                    });
                })
        };

        /**
         * 评价提交事件
         */
        $scope.submit = function () {
                    if($scope.SCORE_VALUE==undefined||$scope.SCORE_VALUE===""||$scope.SCORE_VALUE==null||$scope.SCORE_VALUE<0){
                        KyeeMessageService.broadcast({
                            content:"请先给出星值再提交！",
                            duration: 1000
                        });
                    }else if((($scope.SCORE_VALUE==0&&$scope.disSatReasonList.length>0)||($scope.SCORE_VALUE==1&&$scope.fairSatReasonList.length>0))&&($scope.disSatSelectList.length<1)){
                        KyeeMessageService.broadcast({
                            content:"评分过低，请选择不满意原因后提交！",
                            duration: 1000
                        });
                    }else{
                        $scope.saveSuggest();
                    }
            };
        var handelNmae = function (name) {
              var  handleName =  name.replace(/(.{1}).*(.{0})/,"$1*$2");

            return handleName;
        };
        /**
         * 监听物理返回键
         */
        KyeeListenerRegister.regist({
            focus: "sp_evaluate",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.back();
            }
        });
        $scope.back = function(){
            $ionicHistory.goBack(-1);
        };

        $scope.selectReason=function(disSatReason){
            if(disSatReason.selectFlag!=1){
                var length=$scope.disSatSelectList.length;
                $scope.disSatSelectList[length]=disSatReason.reasonName;
                disSatReason.selectFlag=1;
                //disSatReason.backColor='#2e9ee6';
            }else{
                removeByValue($scope.disSatSelectList,disSatReason.reasonName);
                disSatReason.selectFlag=0;
                //disSatReason.backColor='white';
            }
        }

        function removeByValue(arr, val) {
            for(var i=0; i<arr.length; i++) {
                if(arr[i] == val) {
                    arr.splice(i, 1);
                    break;
                }
            }
        }
    })
    .build();

