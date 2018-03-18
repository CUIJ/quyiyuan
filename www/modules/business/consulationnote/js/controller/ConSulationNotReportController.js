/**
 * Created by lizhihu on 2017/7/6.
 */
new KyeeModule()
    .group("kyee.quyiyuan.consulation.note.report.controller")
    .require([
        "kyee.quyiyuan.consulation.note.detail.service"
    ])
    .type("controller")
    .name("ConsulationNoteReportController")
    .params(['$scope','$state','ConsulationNoteDetailService'])
    .action(function ($scope,$state,ConsulationNoteDetailService) {

        $scope.consulationReport = ConsulationNoteDetailService.reportData;
        //console.log("$scope.consulationReport",$scope.consulationReport)
        //console.log($scope.consulationReport.doctorList[1].doctorDetail.hospitalName)
        $scope.hospitalName = $scope.consulationReport.doctorList[1].doctorDetail.hospitalName;
        $scope.deptName = $scope.consulationReport.doctorList[1].doctorDetail.deptName;
        $scope.MDT = $scope.deptName+"MDT会诊意见";
        if($scope.consulationReport.report.startTime != null
            && $scope.consulationReport.report.startTime != undefined
        && !$scope.consulationReport.report.startTime) {
            $scope.HZSJ = formatTime($scope.consulationReport.report.startTime);
        }else{
            $scope.HZSJ = formatTime($scope.consulationReport.applyDto.startTime);
        }
        $scope.HZXM = $scope.consulationReport.patientName;
        $scope.genter = $scope.consulationReport.patientSex;
        $scope.age = $scope.consulationReport.patientAge;
        $scope.phoneNum = $scope.consulationReport.report.patientPhone;
        $scope.patientParameter = $scope.consulationReport.report.patientParameter;
        $scope.consultCode = $scope.consulationReport.report.consultCode;

        $scope.purpose = $scope.consulationReport.report.purpose;
        $scope.opinion = $scope.consulationReport.report.opinion;

        $scope.medicalHistory = $scope.consulationReport.report.medicalHistory;

        if($scope.consulationReport.patientSex == 'MALE'){
            $scope.patientSex = '男'
        }else{
            $scope.patientSex = '女'
        }
        $scope.patientAge = $scope.consulationReport.patientAge;
        function add0(m){return m<10?'0'+m:m }
        function formatTime(shijianchuo)
        {
            var time = new Date(shijianchuo);
            var y = time.getFullYear();
            var m = time.getMonth()+1;
            var d = time.getDate();
            var h = time.getHours();
            var mm = time.getMinutes();
            var s = time.getSeconds();
            return y+'/'+add0(m)+'/'+add0(d)+' '+add0(h)+':'+add0(mm)+':'+add0(s);
        }

    })
    .build();