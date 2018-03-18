/**
 * 产品名称：quyiyuan
 * 创建者：WANGWAN
 * 创建时间：2015/4/28
 * 创建原因：已预约门诊服务层
 * 修改者：
 * 修改原因：
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.queue.clinic.service")
    .require(["kyee.framework.service.message", "kyee.quyiyuan.service_bus.cache","kyee.framework.service.utils","kyee.framework.directive.i18n.service"])
    .type("service")
    .name("QueueClinicService")
    .params(["HttpServiceBus","KyeeMessageService","CacheServiceBus","KyeeUtilsService","KyeeI18nService"])
    .action(function(HttpServiceBus,KyeeMessageService,CacheServiceBus,KyeeUtilsService,KyeeI18nService){

        var def = {
            //返回排队信息为空的类型 00011：有预约挂号记录 00010：无预约挂号记录
            emptydetail : "",
            emptyflag :"",
            getData:[],

            /*获取数据的函数*/
            doSetQueueClinicParams:function(pagedata){
                this.pagedata = pagedata;
            },
            //请求我的排队数据
            myQueueInfo:function(onSuccess){
                var hospitalID=CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;
                HttpServiceBus.connect(
                    {
                        url : "/sortquery/action/SortQueryActionC.jspx",
                        showLoading:false,
                        params : {
                            loc : "c",
                            op : "getUserQueueList",
                            hospitalID:hospitalID
                        },
                        onSuccess:function(data){//回调函数
                            var isSuccess = data.success;
                            var queueData=null;
                            var queueClinicData=null;
                            var queueUnclinicData = null;
                            var emptyCode = data.resultCode;
                            if(isSuccess){
                                if(emptyCode == undefined || emptyCode == "" || emptyCode == "0000000"){
                                    queueData=data.data.rows;
                                    getData = angular.copy(queueData);
                                    queueClinicData = def.queueClinicData(queueData);
                                    queueUnclinicData =  def.queueUnclinicData(getData);

                                }else{
                                    def.dealEmptyData(emptyCode);
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
            //按科室整理数据
            queueClinicData : function(allQueueData){
                var handledQueueData = {};   //处理后的数据
                for(var i = 0; i < allQueueData.length; i++){
                    var queneDataItem = allQueueData[i];
                    this.handleData(queneDataItem);
                    if(queneDataItem.CURRENT_CALL_NUMBER != "--"&& queneDataItem.QUEUE_COUNT != "已过号") {
                        var deptName = queneDataItem.DEPT_NAME;   //科室
                        if (!handledQueueData[deptName]) {
                            handledQueueData[deptName] = [queneDataItem];
                        } else {
                            handledQueueData[deptName].push(queneDataItem);
                        }
                    }
                }
                return handledQueueData;
            },
            //按科室整理数据
            queueUnclinicData : function(allQueueData){
                var handledQueueData = {};   //处理后的数据
                for(var i = 0; i < allQueueData.length; i++){
                    var queneDataItem = allQueueData[i];
                    this.handleData(queneDataItem);
                    if(queneDataItem.CURRENT_CALL_NUMBER == "--" || queneDataItem.QUEUE_COUNT == "已过号") {
                        var deptName = queneDataItem.DEPT_NAME;   //科室
                        if (!handledQueueData[deptName]) {
                            handledQueueData[deptName] = [queneDataItem];
                        } else {
                            handledQueueData[deptName].push(queneDataItem);
                        }
                    }
                }
                return handledQueueData;
            },
            //处理排队信息
            handleData : function (queneDataItem){
                //剩余时间
                var waitTime=queneDataItem.WAIT_TIME;
                var waitNewTime=def.myWaitTimeFun(waitTime,queneDataItem);
                queneDataItem.WAIT_TIME=waitNewTime;
                //医生照片
                var doctorPic=queneDataItem.DOCTOR_PIC;
                var doctorNewPic=def.doctorPicFun(doctorPic,queneDataItem);
                queneDataItem.DOCTOR_PIC=doctorNewPic;
                //排队人数
                // var queueCount=queneDataItem.QUEUE_COUNT;
                var queueNewCount=def.queueCountFun(queneDataItem);
                queneDataItem.QUEUE_COUNT=queueNewCount;

                //当前叫号
                var currentNumber = def.currentNumber(queneDataItem);
                queneDataItem.CURRENT_CALL_NUMBER=currentNumber;
            },

            //提示信息
            dealEmptyData : function(code){
                def.emptyflag = 1;
                if(code == "00011"){
                    def.emptydetail = KyeeI18nService.get("queue_clinic.emptydetail_1","您的预约挂号已经成功，排队系统正在进行排队处理，请稍候");
                } else if(code == "00012") {
                    def.emptydetail = KyeeI18nService.get("queue_clinic.emptydetail_2","您今天没有待就诊的记录，请就诊当天查看");
                } else if(code == "00013") {
                    def.emptydetail = KyeeI18nService.get("queue_clinic.emptydetail_3","您的预约挂号已经成功，该科室需要在医院分诊台查看排队信息");
                }else {
                    def.emptyflag = 0;
                    def.emptydetail = KyeeI18nService.get("queue_clinic.emptydetail_0","您暂无未就诊的预约挂号业务");
                }
            },
            //医生照片
            doctorPicFun:function(v, rec){
                if(v == "null" || v == undefined){
                    var tem = "resource/images/icons/headh.png";
                    return tem;
                }else{
                    return v;
                }
            },
            //排队人数
            queueCountFun:function (rec){
                // 修改人:wangchengcheng 修改时间:2016年3月22日 下午2:21:34 任务号: KYEEAPPC-5509 排队剩余人数后台计算
                var count = rec.REMAINING_NUMBER;
                if(count < 0){
                    return KyeeI18nService.get("queue_clinic.nyjzw","已过号");
                }else if(isNaN(count)){
                    return "......"
                }
                return ""+ KyeeI18nService.get("queue_clinic.qmyp","剩余") + count + KyeeI18nService.get("queue_clinic.ren","人");
            },
            //等待时间
            myWaitTimeFun:function (v, rec){
                var mycount = 0;
                if(rec.TYPE > 0){
                    mycount = rec.QUEUE_COUNT;
                }else{
                    mycount = rec.PATIENT_NUMBER-rec.CURRENT_CALL_NUMBER;
                }
                if(isNaN(mycount)){
                    return 0;
                }
                mycount=Math.abs(mycount);
                var time = rec.WAIT_TIME*mycount;
                return time;
            },
            //当前叫号
            currentNumber:function(rec){
                var number = rec.CURRENT_CALL_NUMBER;
                if(number==''||number==null||number==undefined){
                    return "--";
                }
                return number;
            }
        };
        return def;
    })
    .build();
