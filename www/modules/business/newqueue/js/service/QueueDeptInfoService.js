/**
 * 产品名称：quyiyuan
 * 创建者：WANGWAN
 * 创建时间：2015/4/28
 * 创建原因：科室排队服务层
 * 修改者：邵鹏辉
 * 修改原因：我的排队功能改进（KYEEAPPC-2655）
 * 修改时间：2015/07/14
 */
new KyeeModule()
    .group("kyee.quyiyuan.newqueue.dept.info.service")
    .require(["kyee.framework.service.message","kyee.framework.service.utils","kyee.quyiyuan.service_bus.cache","kyee.framework.directive.i18n.service"])
    .type("service")
    .name("NewQueueDeptInfoService")
    .params(["HttpServiceBus","KyeeMessageService","KyeeUtilsService","CacheServiceBus","KyeeI18nService"])
    .action(function(HttpServiceBus,KyeeMessageService,KyeeUtilsService,CacheServiceBus,KyeeI18nService){

        var queueDeptInfo = {
            //获取传递来的参数
            doSetQueueDeptInfoParams:function(pagedata){
                //console.log(pagedata)
                this.pagedata = pagedata;
            },
            //获取科室排队数据
            getDeptInfoData:function(onSuccess){
                //我的叫号请求
                    HttpServiceBus.connect(
                        {
                            url : "/sortquery/action/SortQueryActionC.jspx",
                            showLoading:false,
                            params : {
                                op:"getQueueDeptList",
                                loc:"c",
                                hospitalID:CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id,
                                deptCode: this.pagedata.DEPT_CODE
                            },
                            onSuccess:function(data){//回调函数
                                var isSuccess = data.success;
                                var clinicData=null;
                                var unclinicData = null;
                                if(isSuccess){
                                    if(data.data!=null){
                                        var callBackData=data.data.rows;
                                        var getData = angular.copy(callBackData);
                                        clinicData=queueDeptInfo.handleDataByDept(callBackData);
                                        unclinicData = queueDeptInfo.handleUnclinicDataByDept(getData);
                                    }
                                }else{//查询失败
                                    var errorMsg = data.message;
                                    KyeeMessageService.broadcast({
                                        content : errorMsg
                                    });
                                }
                                onSuccess(clinicData,unclinicData);
                            },
                            onError : function(retVal){
                            }
                        }
                    );
            },
            //按照科室整理数据
            handleDataByDept : function(allQueueData){
                var handledQueueData = {};   //处理后的数据
                for(var i = 0; i < allQueueData.length; i++){
                    var queneData = allQueueData[i];
                    this.dealDeptData(queneData);
                    if(queneData.CURRENT_CALL_NUMBER != "--"&& queneData.QUEUE_COUNT != "已过号") {
                        var deptName = queneData.DEPT_NAME;   //科室
                        if (!handledQueueData[deptName]) {
                            handledQueueData[deptName] = [queneData];
                        } else {
                            handledQueueData[deptName].push(queneData);
                        }
                    }
                }
                return handledQueueData;
            },
            //按照科室整理数据
            handleUnclinicDataByDept : function(allQueueData){
                var handleUnclinicDataByDept = {};   //处理后的数据
                for(var i = 0; i < allQueueData.length; i++){
                    var queneData = allQueueData[i];
                    this.dealDeptData(queneData);
                    if(queneData.CURRENT_CALL_NUMBER == "--" || queneData.QUEUE_COUNT == "已过号" ){
                        var deptName = queneData.DEPT_NAME;   //科室
                        if (!handleUnclinicDataByDept[deptName]) {
                            handleUnclinicDataByDept[deptName] = [queneData];
                        } else {
                            handleUnclinicDataByDept[deptName].push(queneData);
                        }
                    }

                }
                return handleUnclinicDataByDept;
            },
            //处理科室排队数据
            dealDeptData:function(queueData){
                //医生照片
                var doctorPic=queueData.DOCTOR_PIC;
                var doctorNewPic=queueDeptInfo.doctorPicFun(doctorPic,queueData);
                queueData.DOCTOR_PIC=doctorNewPic;
                //我的叫号
                var myCall=queueData.PATIENT_NUMBER;
                var  myNewCall= queueDeptInfo.myCallFun(myCall);
                queueData.PATIENT_NUMBER=myNewCall;

                //我的排队
                //var queueCount=queueData.QUEUE_COUNT;
                var currentCallNum=queueData.CURRENT_CALL_NUMBER;
                // 修改人:wangchengcheng 修改时间:2016年3月22日 下午2:21:34 任务号: KYEEAPPC-5509 排队剩余人数后台计算
                var remainingNumber = queueData.REMAINING_NUMBER;
                var queueNewCount=queueDeptInfo.queueCountFun(myCall,remainingNumber);
                queueData.QUEUE_COUNT=queueNewCount;
                //当前叫号
                var currentCallNum=queueData.CURRENT_CALL_NUMBER;
                var CurrentNumber=queueDeptInfo.CurrentNumberFun(currentCallNum);
                queueData.CURRENT_CALL_NUMBER=CurrentNumber;

                //最后叫号时间
                queueData.CURRENT_CALL_TIME = KyeeUtilsService.DateUtils.formatFromString(queueData.CURRENT_CALL_TIME, "YYYY-MM-DD HH:mm:ss.fff", "YYYY/MM/DD HH:mm:ss");

                return queueData;
            },
            //医生照片处理
            doctorPicFun:function(v, rec){
                if(v == "null" || v == undefined){
                    var tem = "resource/images/icons/headh.png";
                    return tem;
                }else{
                    return v;
                }
            },
           //我的叫号
            myCallFun:function(v){
                if(v==null||v==undefined||v==''){
                    return '';
                }else{
                    return v;
                }
            },
            //我的排队
            queueCountFun:function(myCall,remainingNumber){
                if(myCall==null||myCall==undefined||myCall=='') {
                    return "......";
                }else{
                    var v=remainingNumber;
                    if (isNaN(v)) {
                        return "......";
                    }else if(v<0){
                        return  KyeeI18nService.get("new_queue_dept_info.nhyg","已过号");
                    }
                    return ""+ KyeeI18nService.get("new_queue_dept_info.sy","剩余") + v + KyeeI18nService.get("new_queue_dept_info.ren","人");
                }
            },
            //当前叫号
            CurrentNumberFun:function(currentCallNum){
                if(currentCallNum==null||currentCallNum==undefined||currentCallNum==''){
                    return "--";
                }else{
                    return currentCallNum;
                }
            }

        };
        return queueDeptInfo;
    })
    .build();
