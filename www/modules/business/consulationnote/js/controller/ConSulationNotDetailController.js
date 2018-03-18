/**
 * Created by lizhihu on 2017/7/5.
 * 会诊详情
 */
new KyeeModule()
    .group("kyee.quyiyuan.consulation.note.detail.controller")
    .require([
        "kyee.quyiyuan.consulation.note.detail.service",
        "kyee.quyiyuan.consulation.note.controller"
    ])
    .type("controller")
    .name("ConsulationNoteDetailController")
    .params(['$scope', '$state','ShowPicturesService','KyeeViewService', 'ConsulationNoteDetailService', 'KyeeListenerRegister','UploadMaterialService','$ionicHistory'])
    .action(function ($scope, $state,ShowPicturesService,KyeeViewService, ConsulationNoteDetailService, KyeeListenerRegister,UploadMaterialService,$ionicHistory) {

        /*
        * 监听页面进入事件
        * */
        KyeeListenerRegister.regist({
            focus: "consulationnotedetail",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.ENTER,
            direction: "both",
            action: function (params) {
                $scope.loadDetail();
            }
        });
        $scope.isLoadComplete = false;
        /**
         * 描述： 格式化日期参数
         * @param m
         * @returns {string}
         */
        function add0(m){return m<10?'0'+m:m }
        $scope.formatTime = function(shijianchuo)
        {
            var time = new Date(shijianchuo);
            var y = time.getFullYear();
            var m = time.getMonth()+1;
            var d = time.getDate();

            return y+'/'+add0(m)+'/'+add0(d);
        };
        $scope.formatEndTime = function(shijianchuo)
        {
            var time = new Date(shijianchuo);
            var h = time.getHours();
            var mm = time.getMinutes();
            var s = time.getSeconds();
            return add0(h)+':'+add0(mm);
        };

        var isUploadMaterialEntry = ($ionicHistory.backView().stateName === "uploadMaterial");
        $scope.loadDetail = function(){
            if(isUploadMaterialEntry){
                ConsulationNoteDetailService.data = UploadMaterialService.reservationId;
            }

            if (ConsulationNoteDetailService.consType === 'MDT'||ConsulationNoteDetailService.consType === 'ORDINARY'||ConsulationNoteDetailService.consType === ''||ConsulationNoteDetailService.consType === null) {
                $scope.isMDT = true;
                $scope.isRPP = false;
                ConsulationNoteDetailService.getMDTDetailList(ConsulationNoteDetailService.data, function (data) {
                    if (data.applyDto.reservationId) {
                        $scope.isShowHZYJ = false;
                        $scope.isShowSuggust = false;
                        $scope.isShowImg = false;
                        $scope.consulationReportList = data;
                        $scope.createDate = $scope.formatTime(data.startDate);
                        $scope.StartTime = $scope.formatEndTime(data.startDate);
                        $scope.endTime = $scope.formatEndTime(data.endDate);
                        $scope.HZSJTime = $scope.StartTime + '-' + $scope.endTime;
                        $scope.applyHospital = data.doctorList[0].doctorDetail.hospitalName;
                        $scope.MDT = data.doctorList[1].doctorDetail.hospitalName + '--' + data.doctorList[1].doctorDetail.deptName;

                        $scope.patientName = data.patientName;
                        $scope.disCription = data.diseaseDescription;
                        $scope.previousDiagnosis = data.purpose;
                        $scope.patientIdCardNo = data.patientIdCardNo;
                        var str = $scope.patientIdCardNo.substr(3, 11);
                        $scope.patientIdCardNo = $scope.patientIdCardNo.replace(str, '***********');
                        if (data.patientSex === 'MALE') {
                            $scope.patientSex = '男'
                        } else {
                            $scope.patientSex = '女'
                        }
                        $scope.patientAge = data.patientAge;
                        $scope.patientAgeAndSex = $scope.patientSex + '/' + $scope.patientAge;
                        if (data.status === 'finished' || data.status === 'ongoing') {
                            $scope.isShowHZYJ = true;
                        } else {
                            $scope.isShowHZYJ = false;
                        }
                        if (data.status === 'finished') {
                            $scope.isShowSuggust = true;
                        } else {
                            $scope.isShowSuggust = false;
                        }
                        $scope.imgList = new Array();
                        var len = 0;
                        angular.forEach(data.fileList, function (data) {
                            if(data.source == 'PATIENT'){
                                ($scope.imgList).push(data);
                                len++;
                            }
                        });
                        UploadMaterialService.UPLOAD_IMGLIST = $scope.imgList;
                        $scope.isSCZL = '';
                        $scope.showUpLoadData = false;
                        if(data.status != 'ongoing' && data.status != 'finished' ) {
                            $scope.showUpLoadData = true;
                            if (len == 0) {
                                $scope.isShowImg = true;
                                $scope.isSCZL = '上传资料';
                            } else{
                                $scope.isShowImg = false;
                                $scope.isSCZL = '完善资料';
                            }
                        }

                        $scope.reservationId = data.applyDto.reservationId;
                        if ($scope.imgList.length > 4) {
                            $scope.imgLen = true;
                        } else {
                            $scope.imgLen = false;
                        }
                        if (data.report.opinion != '' || data.report.opinion != 'undefined' || data.report.opinion != null) {
                            $scope.opinion = data.report.opinion;
                        }
                        $scope.type = data.type;
                    } else {
                        KyeeMessageService.broadcast({
                            content: '获取数据失败，请稍后重试',
                            duration: 3000
                        });
                    }
                    $scope.isLoadComplete = true;
                });

            } else if(ConsulationNoteDetailService.consType === 'RPP'){
                $scope.isMDT = false;
                $scope.isRPP = true;
                ConsulationNoteDetailService.getRPPDetailList(ConsulationNoteDetailService.consultPatientKeyId, function (data) {
                        //页面元素初始化
                        $scope.consulationDetailList = true;

                        $scope.createDate = $scope.formatTime(data.subTime);
                        $scope.HZSJTime = $scope.formatEndTime(data.subTime);
                        $scope.patientAgeAndSex = data.sex + '/' + data.age;
                        $scope.applyHospital = data.inspectionHospital;
                        //病理类型
                        $scope.pathologyTypeName = data.pathologyTypeName;
                        //取材部位
                        $scope.samplingSite = data.samplingSite;
                        $scope.patientName = data.patientName;
                        //获取身份证号并且处理
                        $scope.patientIdCardNo = data.idNo;
                        var str = $scope.patientIdCardNo.substr(3, 11);
                        $scope.patientIdCardNo = $scope.patientIdCardNo.replace(str, '***********');
                        //临床资料
                        $scope.clinicData = data.clinicalData;
                        //大体所见
                        $scope.generalView = data.generalView;
                        //镜下描述
                        $scope.microObservation = data.mirrorDescription;
                        //远程病理专家会诊意见
                        $scope.consulationAdvice = data.diagnosticOpinion;
                        $scope.isLoadComplete = true;
                    }
                )
            }
        };


        $scope.goConsulationReport = function (data) {
            ConsulationNoteDetailService.reportData = data;
            $state.go('consulationnotereport');
        };

        $scope.goToUploadMaterial = function(reservationId){
            UploadMaterialService.reservationId = reservationId;
            $state.go("uploadMaterial");
        };
        /**
         * 显示大图
         * @param index
         */
        $scope.IMGLIST = [];
        $scope.showBigPicture = function (index,imgUrl) {
            ShowPicturesService.ACTIVESLIDE = index; //定义页面初始展示第几张图
            var imgList = angular.copy($scope.imgList);
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
    })
    .build();
