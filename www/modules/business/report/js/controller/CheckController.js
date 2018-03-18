/**
 * 产品名称 quyiyuan.
 * 创建用户: WangYuFei
 * 日期: 2015年5月7日13:46:40
 * 创建原因：KYEEAPPC-1958 报告单-检查单controller
 * 修改人: 程铄闵
 * 修改日期:2015/7/13
 * 原因：增加检查单详情控制
 * 任务号：KYEEAPPC-2640
 * 修改人: 程铄闵
 * 修改日期:2015/7/29
 * 原因：报告单儿童显示具体年龄
 * 任务号：KYEEAPPC-2879
 * 修改人: 吴伟刚
 * 修改日期:2015/11/16
 * 原因：检查检验单页面数据超过一页显示时，点击“本周”、“本月”按钮显示不全修复
 * 任务号：KYEEAPPTEST-3116
 */
new KyeeModule()
    .group("kyee.quyiyuan.report.check.controller")
    .require(["kyee.quyiyuan.check.service",
        "kyee.quyiyuan.report.checkDetail.controller",
        "kyee.quyiyuan.center.authentication.controller"
    ])
    .type("controller")
    .name("CheckController")
    .params(["$scope","CheckService",
        "ReportService","HttpServiceBus",
        "CacheServiceBus","KyeeUtilsService",
        "KyeeMessageService","KyeeViewService",
        "AuthenticationService","QueryHisCardService",
        "$rootScope","$state", "PatientCardService","$ionicScrollDelegate"])
    .action(function($scope,CheckService,ReportService,HttpServiceBus,
                     CacheServiceBus,KyeeUtilsService,KyeeMessageService,KyeeViewService,
                     AuthenticationService,QueryHisCardService,$rootScope,$state, PatientCardService,$ionicScrollDelegate){
        //初始化默认选中第一项(全部)
        $rootScope.isCheckTabActive='0';
        $scope.isShowMarkedWords=false;//引导信息是否显示
        //点击页签过滤
        $scope.clickTab = function(index){
            $rootScope.isCheckTabActive = index;
            $ionicScrollDelegate.resize();
            $ionicScrollDelegate.scrollTop();
        };
        //单击项目
        $scope.clickItem= function(checkDetailData){
            CheckService.selectDetailData = checkDetailData;//选中数据
            $state.go('check_detail');//跳转到详情页面
        };
        //页签数据过滤器
        $scope.isDisplayAll = true;
        $scope.filterData = function(data){
            if($rootScope.isCheckTabActive=='1'){
                //本周数据
                var _day = 1000 * 60 * 60 * 24;
                var now = new Date();
                // 第一天日期
                var firstDay = new Date(now - (now.getDay() - 1) * _day);
                // 最后一天日期
                var lastDay = new Date((firstDay * 1) + 6 * _day);
                //格式化日期
                var formatFirstDay = ReportService.getNowFormatDate(firstDay);
                var formatLastDay = ReportService.getNowFormatDate(lastDay);
                //返回本周数据
                $scope.isDisplayAll = false;
                return (data.EXAM_DATE_TIME >= formatFirstDay &&
                    data.EXAM_DATE_TIME <= formatLastDay)|| data.EXAM_DATE_TIME == null;
            }else if($rootScope.isCheckTabActive=='2'){
                //本月数据
                var date = new Date();
                //计算当前和下个月日期
                var currentDate = date;
                currentDate.setDate(1);
                var currentMonth=date.getMonth();
                var nextMonth=++currentMonth;
                var nextMonthFirstDay=new Date(date.getFullYear(),nextMonth,1);
                var oneDay=1000*60*60*24;
                var nextDate = new Date(nextMonthFirstDay-oneDay);
                //格式化日期
                var formatCurrentDate = ReportService.getNowFormatDate(currentDate);
                var formatNextDate = ReportService.getNowFormatDate(nextDate);
                //返回本月数据
                $scope.isDisplayAll = false;
                var time = null;
                if(data.EXAM_DATE_TIME){
                    time = data.EXAM_DATE_TIME.substr(0,10);
                }
                return (time >= formatCurrentDate &&
                    time <= formatNextDate)|| time == null;
            }else{
                //返回全部数据
                $scope.isDisplayAll = true;
                return data;
            }
        };

        //初始化分页加载信息
        CheckService.scope = $scope;
        var currentPage = 1; //当前是第一页
        var count = 10; //每页显示数据为10条
        var startNo = 0; //数据开始NO
        var rows = currentPage * count;
        //是否显示数据已加载完毕标识
        $scope.noLoad = true;
        //默认当前数据为空
        $scope.checkData=[];
        //加载更多
        $scope.loadMore = function(){
            var datas ="";
            CheckService.loadData(startNo,currentPage,rows,$scope,function(data,success){
                if(success){
                    $scope.isEmpty = false;
                    if(data.data.total==0){
                        $scope.isDisplayAll = false;
                        $scope.emptyText = '您目前还没有检查单记录';
                        return;
                    }
                    var total = data.data.total;//记录总数
                    datas = data.data.rows;
                    if(data.message!='' && data.message!=null && data.message!=undefined){
                        $scope.isShowMarkedWords=true;
                        $scope.markedWords=data.message;
                    }
                    //校验数据是否加载完
                    var currentNum =  $scope.checkData.length+datas.length;
                    if(currentNum >= total){
                        $scope.noLoad = false;//已加载完成
                    }
                    //追加加载数据
                    for(var i=0;i<datas.length;i++){
                        $scope.checkData.push(datas[i]);
                    }
                    currentPage = currentPage+1; //下一页
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                }
                else{
                    $scope.isEmpty = true;
                    $scope.isShowMarkedWords=false;
                    if(data.message != '' && data.message != null && data.message != undefined){
                        var array = data.message.split('|');
                        //功能未开放
                        if((array[0] == 0||array[0] == '0')&&array[1]!=undefined){
                            $scope.emptyText = array[1];
                            return;
                        }
                        //实名认证正在处理--HANGLEING 实名认证失败--FAILURE 实名认证未认证--UNAUTHENTICATED
                        else if((array[0] == 'HANGLEING'|| array[0] == 'FAILURE' || array[0] == 'UNAUTHENTICATED')
                            && array[1]!=undefined){
                            KyeeMessageService.confirm({
                                title:'消息',
                                content:array[1],
                                onSelect:function(btnId){
                                    if(btnId){
                                        //点击确定，页面跳转到“实名认证”页面
                                        AuthenticationService.lastClass=2;
                                        KyeeViewService.openModalFromUrl({
                                            scope : $scope,
                                            url :  'modules/business/center/views/authentication/authentication.html'
                                        });
                                    }
                                }
                            });
                            return;
                        }
                        //选择就诊卡
                        else if((array[0] == 'CARD')&&array[1]!=undefined){
                            KyeeMessageService.confirm({
                                title:'消息',
                                content:array[1],
                                onSelect:function(btnId){
                                    if(btnId){
                                        //点击确定，页面跳转到“查询就诊卡”页面
                                        PatientCardService.fromPage = 'check';
                                        $state.go("patient_card_select");
                                    }
                                }
                            });
                            return;
                        }
                        //后台错误提示
                        else if((array[0] == 'WARN')&&array[1]!=undefined){
                            $scope.emptyText = array[1];
                            return;
                        }
                        else if(data.alertType == 'ALERT'&&data.message!=undefined){
                            $scope.emptyText = data.message;
                            return;
                        }
                        else{
                            $scope.emptyText = '当前网络不太给力';
                            return;
                        }
                    }
                    else{
                        $scope.emptyText = '当前网络不太给力';
                        return;
                    }
                }
            });
        };

        //用户信息
        //当前就诊者信息
        var userInfo = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
        if(userInfo){
            //就诊者信息不为空
            $scope.patientEmpty = false;
            //姓名
            $scope.USER_NAME = userInfo.OFTEN_NAME;
            //年龄判空
            var age = -1;
            if(userInfo.DATE_OF_BIRTH && userInfo.DATE_OF_BIRTH!=""){
                var birthYear = KyeeUtilsService.DateUtils.formatFromDate(userInfo.DATE_OF_BIRTH,'YYYY');
                age = new Date().getFullYear()-birthYear;/*new Date(userInfo.DATE_OF_BIRTH).getFullYear();*/
            }
            if(age==0||(age && age != -1)){
                $scope.AGE = age;
                $scope.ageEmpty = false;//年龄非空不显示岁
            }
            else{
                $scope.AGE = '';
                $scope.ageEmpty = true;//年龄为空不显示岁
            }
            //性别判空转换
            var sex = userInfo.SEX;
            if(sex && (sex==1 || sex=='1' || sex=='男')){
                $scope.sexEmpty = false;//性别判空显示斜杠
                $scope.SEX = '男';
            }
            else if(sex && (sex==2 || sex=='2' || sex=='女')){
                $scope.sexEmpty = false;//性别判空显示斜杠
                $scope.SEX = '女';
            }
            else{
                $scope.SEX = '';
                $scope.sexEmpty = true;//性别判空不显示斜杠
            }
        }
        else{
            $scope.patientEmpty = 'none';//就诊者信息为空不显示头部用户信息栏
        }
        //日期格式化
        $scope.getDate = function(param){
            if(param && param !=""){
                return KyeeUtilsService.DateUtils.formatFromDate(param,'YYYY/MM/DD');
            }
        };
    })
    .build();