/**
 * 产品名称：quyiyuan
 * 创建者：WANGWAN
 * 创建时间：2015/4/28
 * 创建原因：科室排队服务层
 * 修改者：
 * 修改原因：
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.queue.dept.info.service")
    .require(["kyee.framework.service.message","kyee.framework.service.utils","kyee.quyiyuan.service_bus.cache"])
    .type("service")
    .name("QueueDeptInfoService")
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
                                /* hospitalId:"1002",*///济宁附院
                                op:"getQueueDeptList",
                                loc:"c",
                                hospitalID:CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id,
                                deptCode: this.pagedata.DEPT_CODE

                            },
                            onSuccess:function(data){//回调函数
                                var isSuccess = data.success;
                                var queueClinicData=null;
                                var queueUnclinicData=null;
                                if(isSuccess){
                                    if(data.data!=null){
                                        var deptTables=data.data.rows;
                                        var getData = angular.copy(deptTables);
                                        queueClinicData=queueDeptInfo.queueClinicData(deptTables);
                                        queueUnclinicData = queueDeptInfo.queueUnclinicData(getData);
                                    }
                                }else{//查询失败
                                    var errorMsg = data.message;
                                    KyeeMessageService.broadcast({
                                        content : errorMsg
                                    });
                                }
                                onSuccess(queueClinicData,queueUnclinicData);
                            },
                            onError : function(retVal){
                            }
                        }
                    );
            },
            //处理科室排队数据
            queueClinicData:function(queueData){
                if(queueData !=null && queueData !=undefined&&queueData.length>0){
                    var handledQueueData = {};   //处理后的数据
                    for(var i = 0; i < queueData.length; i++){
                        var queneDataItem = queueData[i];
                        this.dealQueueData(queneDataItem);
                        if(queneDataItem.CURRENT_CALL_NUMBER != "--") {
                            var deptName = queneDataItem.DEPT_NAME;   //科室
                            if (!handledQueueData[deptName]) {
                                handledQueueData[deptName] = [queneDataItem];
                            } else {
                                handledQueueData[deptName].push(queneDataItem);
                            }
                        }
                    }
                    return handledQueueData;
                    //for(var j=0;j<queueData.length;j++){
                    //
                    //    dealQueueData()
                    //    //var historyQueue=eval(queueData[j].HIS_LIST);
                    //    //if(historyQueue != null){
                    //    //    for(var i=0;i<historyQueue.length;i++){
                    //    //        var dateStr= historyQueue[i].CALLED_TIME;
                    //    //        var numberStr=historyQueue[i].CAllED_NUMBER;
                    //    //        if(dateStr.indexOf('.'))
                    //    //        {
                    //    //            dateStr=dateStr.substring(0,dateStr.length-2);
                    //    //        }
                    //    //        historyQueue[i].CALLED_TIME= KyeeUtilsService.DateUtils.formatFromString(dateStr,"YYYY-MM-DD HH:mm:ss","HH:mm:ss");
                    //    //        historyQueue[i].CAllED_NUMBER=numberStr+'号';
                    //    //    }
                    //    //    queueData[j].HIS_LIST=historyQueue;
                    //    //}
                    //}
                    //return queueData;
                }
            },
            //处理科室排队数据
            queueUnclinicData:function(queueData){
                if(queueData !=null && queueData !=undefined&&queueData.length>0){
                    var handledQueueData = {};   //处理后的数据
                    for(var i = 0; i < queueData.length; i++){
                        var queneDataItem = queueData[i];
                        this.dealQueueData(queneDataItem);
                        if(queneDataItem.CURRENT_CALL_NUMBER == "--") {
                            var deptName = queneDataItem.DEPT_NAME;   //科室
                            if (!handledQueueData[deptName]) {
                                handledQueueData[deptName] = [queneDataItem];
                            } else {
                                handledQueueData[deptName].push(queneDataItem);
                            }
                        }
                    }
                    return handledQueueData;
                }
            },

            dealQueueData : function (queneDataItem){
                //等待时间
                var waitTime=queneDataItem.WAIT_TIME;
                var waitNewTime=queueDeptInfo.waitTimeFun(waitTime,queneDataItem);
                queneDataItem.WAIT_TIME=waitNewTime;
                ////医生照片
                //var doctorPic=queneDataItem.DOCTOR_PIC;
                //var doctorNewPic=queueDeptInfo.doctorPicFun(doctorPic,queueData[j]);
                //queneDataItem.DOCTOR_PIC=doctorNewPic;
                //排队人数
                var queueCount=queneDataItem.QUEUE_COUNT;
                var queueNewCount=queueDeptInfo.queueCountFun(queueCount,queneDataItem);
                queneDataItem.QUEUE_COUNT=queueNewCount;
                //当前叫号
                var currentNumber = queueDeptInfo.currentNumber(queneDataItem);
                queneDataItem.CURRENT_CALL_NUMBER=currentNumber;

            },
            //医生照片处理
            doctorPicFun:function(v, rec){
                if(v == "null" || v == undefined){
                    var tem = "resource/images/queue/doctor_male.png";
                    return tem;
                }else{
                    return v;
                }
            },
            queueCountFun:function (v, rec){
                var count = 0;
                if(rec.TYPE > 0){
                    count = v;
                }else{
                    count = rec.QUEUE_LAST_NUMBER-rec.CURRENT_CALL_NUMBER;
                }
                if(isNaN(count) || count<0){
                    return "......"
                }
                return ""+ KyeeI18nService.get("queue_clinic.qmyp","共") + count + KyeeI18nService.get("queue_clinic.ren","人");
            },
            //当前叫号
            currentNumber:function(rec){
                var number = rec.CURRENT_CALL_NUMBER;
                if(number==''||number==null||number==undefined){
                    return "--";
                }
                return number;
            },
            waitTimeFun:function (v, rec){
               // var queueCount=parseInt(rec.QUEUE_COUNT);

                if(v == "null" || v == undefined || v==null
                    || v=='' ){
                    var tem = 0;
                    return tem;
                }else{
                    return v;
                }
            }
        };
        return queueDeptInfo;
    })
    .build();
