/**
 * 产品名称：quyiyuan
 * 创建者：张明
 * 创建时间：2015年9月9日10:51:20
 * 创建原因：特色科室逻辑控制层
 * 修改者：
 * 修改原因：
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.appointment.features_dept.controller")
    .require(["kyee.framework.service.message",
        'kyee.quyiyuan.appointment.features_dept.service',
        "kyee.quyiyuan.appointment.service"
    ])
    .type("controller")
    .name("FeaturesDeptController")
    .params(["$scope", "$state", "$ionicHistory", "$ionicScrollDelegate","$location","CacheServiceBus", "KyeeMessageService","FeaturesDeptService","AppointmentDeptGroupService","HospitalSelectorService","AppointmentDoctorService","AppointmentDoctorDetailService","KyeeI18nService"])
    .action(function ($scope, $state, $ionicHistory, $ionicScrollDelegate,$location,CacheServiceBus, KyeeMessageService,FeaturesDeptService,AppointmentDeptGroupService,HospitalSelectorService,AppointmentDoctorService,AppointmentDoctorDetailService,KyeeI18nService) {

        var memoryCache = CacheServiceBus.getMemoryCache();
        var storagecache = CacheServiceBus.getStorageCache();
        //是否有显示数据标识
        $scope.hasDataFlag = false;
        //初始化页面
        $scope.initView = function () {
            var hospitalInfo=storagecache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
            //如果预约挂号都禁掉，不显示全部科室，且医生名字没有下划线  wangwan  KYEEAPPTEST-3472
            $scope.showAllDept = false;
            if(hospitalInfo && hospitalInfo.is_home_appoint_enable == '1'){
                $scope.showAllDept = true;
            }
            FeaturesDeptService.queryAllFeaturesDeptData(hospitalInfo.id,function(data){
                        if(data.success && data.data && data.data.rows.length>0){
                            $scope.hasDataFlag = false;
                            //对科室简介长度进行处理
                            for(var i=0;i<data.data.rows.length;i++){
                                var deptDicList=[];
                                if(data.data.rows[i].DEPT_DIC.length>90)
                                {
                                    data.data.rows[i].DEPT_DIC_SHOW = data.data.rows[i].DEPT_DIC.substr(0,90)+'...';
                                    //以<br>为断点，将简介分为几段  wangwan 2015年12月16日18:23:27  APPCOMMERCIALBUG-1905
                                    deptDicList= data.data.rows[i].DEPT_DIC_SHOW.split('<br>');
                                    data.data.rows[i].DEPT_DIC_SHOW = deptDicList;
                                }
                                else
                                {
                                    data.data.rows[i].DEPT_DIC_SHOW= data.data.rows[i].DEPT_DIC;
                                    //以<br>为断点，将简介分为几段  wangwan 2015年12月16日18:23:27  APPCOMMERCIALBUG-1905
                                    deptDicList= data.data.rows[i].DEPT_DIC_SHOW.split('<br>');
                                    data.data.rows[i].DEPT_DIC_SHOW = deptDicList;
                                }
                                data.data.rows[i].SHOW_STATUS=false;
                            }
                             $scope.allFeaturesData=data.data.rows;
                             //保持页面整齐显示，对数据进行改造封装begin
                             var  rowNum=4; //定义每行显示4列医生名称
                             for( var i=0;i<$scope.allFeaturesData.length;i++){ //循环每条数据，对其中的DOCTOR对象进行提取改造
                                  var  showRowDoctor=new Array();//行对象
                                  var doctors=$scope.allFeaturesData[i].DOCTOR;
                                  var doc_length= doctors.length;
                                  var loop_length=Math.ceil(doc_length/rowNum);//得到需要展现的行数
                                  for(var j=0;j<loop_length;j++){
                                      var showColDoctor=new Array();//列对象
                                      for(var z=0;z<rowNum;z++){
                                          if(doctors[j*rowNum+z]){
                                              showColDoctor.push(doctors[j*rowNum+z]);//给列对象push值
                                          }else{
                                              var obj=new Object();
                                              showColDoctor.push(obj);//保证页面的列整齐，不足4(rowNum)个的，添加空对象。注意点击事件需要判断传入的doctor对象是否为空。
                                          }
                                      }
                                      showRowDoctor.push(showColDoctor);//给每条数据的行对象push列对象
                                  }
                                 $scope.allFeaturesData[i].SHOW_DOCTOR= showRowDoctor;

                            }
                            //保持页面整齐显示，对数据进行改造封装end

                        }else{
                            $scope.hasDataFlag = true;
                        }
            })
        },
        //跳转到全部科室界面
        $scope.goAllDept=function(){

            var hospitalInfo = CacheServiceBus.getStorageCache().get('hospitalInfo');
            if(hospitalInfo && hospitalInfo.is_home_appoint_enable == '1'){
                HospitalSelectorService.returnView = "appointment_doctor";
                //转诊标识2转诊  0不转诊
                AppointmentDeptGroupService.IS_REFERRAL = 0;
                $state.go("appointment");
            }else{
                //如果预约挂号都禁掉，不跳转  wangwan  KYEEAPPTEST-3472
                return;
            }

        };
        //跳转到医生主页
        $scope.goDoctorPage=function(dept_code,dept_name,IS_ONLINE,doctor){
            if(!doctor.DOCTOR_CODE){
                return;
            }
            var hospitalInfo = CacheServiceBus.getStorageCache().get('hospitalInfo');
            if(hospitalInfo && hospitalInfo.is_home_appoint_enable == '1'){
                var hospitalInfo=storagecache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                var currentPatient = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                var userVsId =   currentPatient?currentPatient.USER_VS_ID:'';
                var params={
                    hospitalId: hospitalInfo.id,
                    deptCode: dept_code,
                    USER_VS_ID: userVsId,
                    bussinessType:2,
                    DOCTOR_CODE: doctor.DOCTOR_CODE,
                    IS_ONLINE:IS_ONLINE//查医生列表增加IS_ONLINE 参数

                };
                AppointmentDoctorService.queryDoctorData(params, function (doctor, resultData) {
                    if(doctor && doctor.rows && doctor.rows.length>0){
                        AppointmentDoctorDetailService.doctorInfo=doctor.rows[0];
                        AppointmentDoctorDetailService.doctorInfo.DEPT_NAME = dept_name;
                        //跳到医生列表页，将科室放入
                        var deptData = {};
                        deptData.DEPT_CODE = dept_code;
                        deptData.DEPT_NAME = dept_name;
                        deptData.IS_ONLINE = IS_ONLINE;
                        AppointmentDeptGroupService.SELECT_DEPTGROUPDATA = deptData;
                        $state.go("doctor_info");
                    }else{
                        KyeeMessageService.message({
                            content: KyeeI18nService.get("features_dept.noDoctorSchedule","抱歉，该医生暂无排班！")
                        });
                    }


                });
            }else{
                //如果预约挂号都禁掉，点击医生名字，不跳转  wangwan  KYEEAPPTEST-3472
                return;
            }

        };
        //展开、收起科室简介
        $scope.changeShowStatus=function(item,id){
            var deptDicList = [];
                 if(item.SHOW_STATUS){
                     item.SHOW_STATUS=false;
                     if(item.DEPT_DIC.length>90){
                         item.DEPT_DIC_SHOW=item.DEPT_DIC.substr(0,90)+'...';
                         //以<br>为断点，将简介分为几段  wangwan 2015年12月16日18:23:27  APPCOMMERCIALBUG-1905
                         deptDicList= item.DEPT_DIC_SHOW.split('<br>');
                         item.DEPT_DIC_SHOW = deptDicList;
                         //$location.hash(id);
                         //$ionicScrollDelegate.anchorScroll(true);
                     }else{
                         item.DEPT_DIC_SHOW=item.DEPT_DIC;
                         //以<br>为断点，将简介分为几段  wangwan 2015年12月16日18:23:27  APPCOMMERCIALBUG-1905
                         deptDicList= item.DEPT_DIC_SHOW.split('<br>');
                         item.DEPT_DIC_SHOW = deptDicList;
                     }
                     //$ionicScrollDelegate.resize();
                     $ionicScrollDelegate.$getByHandle("features_dept").resize();

                 }else{
                     item.SHOW_STATUS=true;
                     item.DEPT_DIC_SHOW=item.DEPT_DIC;
                     //以<br>为断点，将简介分为几段  wangwan 2015年12月16日18:23:27  APPCOMMERCIALBUG-1905
                     deptDicList= item.DEPT_DIC_SHOW.split('<br>');
                     item.DEPT_DIC_SHOW = deptDicList;
                     //$ionicScrollDelegate.resize();
                     $ionicScrollDelegate.$getByHandle("features_dept").resize();
                 }
        }


    })
    .build();
