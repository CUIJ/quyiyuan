/**
 * 产品名称：quyiyuan
 * 创建者：章剑飞
 * 创建时间：2015年5月6日15:25:39
 * 创建原因：诊断结果控制器
 * 修改者：
 * 修改原因：
 */
new KyeeModule()
    .group("kyee.quyiyuan.DiagnosticResult.controller")
    .require(["kyee.quyiyuan.DiagnosticResult.service","kyee.quyiyuan.DiagnosticInfo.controller"])
    .type("controller")
    .name("DiagnosticResultController")
    .params(["$scope", "$state", "DiagnosticResultService","AuxiliarySymptomListService"])
    .action(function ($scope, $state, DiagnosticResultService,AuxiliarySymptomListService) {
        $scope.isEmpty = true;
        var deptWidth=0;
        // 动态获取屏幕的宽度
        var totalWidth = window.innerWidth;
        var deptDiv = totalWidth-14-80-18-32-32-20;
        if(AuxiliarySymptomListService.auxiliarySymptomNameList){
            $scope.auxiliarySymptomNameList = AuxiliarySymptomListService.auxiliarySymptomNameList;
            $scope.auxiliarySymptomName="";
            var te="";
            for(var i=0;i<$scope.auxiliarySymptomNameList.length;i++){
                if(i<$scope.auxiliarySymptomNameList.length-1){
                    $scope.auxiliarySymptomName = $scope.auxiliarySymptomName + $scope.auxiliarySymptomNameList[i]　+ "、"　;
                }else{
                    te=$scope.auxiliarySymptomNameList[i];
                }
                $scope.auxiliarySymptomName=$scope.auxiliarySymptomName+te;

            }
        };


        var handelData = function (str){
            var arr = str.trim().split(".");
            var reStr="";
            for(var i=0;i<arr.length;i++){
                reStr=arr[0];
            }
            return reStr;
        };

        var hand = function (type,data) {
            if(type==0){
                var length = 0;
                //data.seniorNew = data.senior;
                data.seniorNew=[];
                for(var i=0;i< data.senior.length;i++){

                    if(i%3 == 0){
                        data.senior[i].bgColor = "color1";
                    }else if(i%3 == 1){
                        data.senior[i].bgColor = "color2";
                    }else{
                        data.senior[i].bgColor = "color3";
                    }
                    length = length+data.senior[i].juniorName.length;
                    deptWidth = length*12 + (i+1)*18;
                        if(deptWidth<deptDiv){
                            data.seniorNew.push(data.senior[i]);
                        }
                }
            }else{
                for(var i=0;i<data.length;i++){
                    data[i].seniorNew= [];
                    var length=0;
                    for(var j=0;j<data[i].senior.length;j++){
                        length= length+data[i].senior[j].juniorName.length;
                        deptWidth = length*12 + (j+1)*18;
                        if(j%3==0){
                            data[i].senior[j].bgColor = "color1";
                        }else if(j%3==1){
                            data[i].senior[j].bgColor = "color2";
                        }else{
                            data[i].senior[j].bgColor = "color3";
                        }

                       if(deptWidth<deptDiv){
                         data[i].seniorNew.push(data[i].senior[j]);
                        }

                    }
                }
            }
            return data;
        };

        DiagnosticResultService.loadResultData(function (data) {
                if(data.length==0){
                    $scope.isEmpty = true;
                    return;
                }else{
                    $scope.isEmpty = false;
                }
                for(var i=0;i<data.length;i++){

                    data[i].correlation = handelData(data[i].correlation);
                    $scope.firstDiagnosticResult = data[0];
                }
                $scope.firstDiagnosticResult = hand(0,$scope.firstDiagnosticResult);
                var resut=angular.copy(data);
                resut.shift();
                $scope.DiagnosticResult = resut;
                $scope.DiagnosticResult = hand(1,$scope.DiagnosticResult);
        });
        //选中
        $scope.choose = function (result) {
            DiagnosticResultService.disease=result;
            DiagnosticResultService.juniorIds=[];
            DiagnosticResultService.seniorIds = [];
            DiagnosticResultService.junioNames=[];
            var senior = result.senior;
            for(var i=0;i<senior.length;i++){
                DiagnosticResultService.juniorIds.push(senior[i].juniorId);
                DiagnosticResultService.seniorIds.push(senior[i].seniorId);
                DiagnosticResultService.junioNames.push(senior[i].juniorName);
            }

            $state.go("diagnosticInfo");
        };


    })
    .build();