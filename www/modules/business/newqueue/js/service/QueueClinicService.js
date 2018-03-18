/**
 * 产品名称：quyiyuan
 * 创建者：WANGWAN
 * 创建时间：2015/4/28
 * 创建原因：已预约门诊服务层
 * 修改者：邵鹏辉
 * 修改原因：我的排队功能改进（KYEEAPPC-2655）
 * 修改时间：2015/07/14
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.newqueue.clinic.service")
    .require(["kyee.framework.service.message", "kyee.quyiyuan.service_bus.cache","kyee.framework.service.utils","kyee.framework.directive.i18n.service"])
    .type("service")
    .name("NewQueueClinicService")
    .params(["HttpServiceBus","KyeeMessageService","CacheServiceBus","KyeeUtilsService","KyeeI18nService"])
    .action(function(HttpServiceBus,KyeeMessageService,CacheServiceBus,KyeeUtilsService,KyeeI18nService){

        var def = {
            //前一个页面(1：选择科室)
            frontPage : -1,
            //返回排队信息为空的类型 00011：有预约挂号记录 00010：无预约挂号记录
            emptydetail : "",
            emptyflag:"",
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
                            var handledQueueData=null;
                            var unclinicData = null;
                            emptydetail = "";
                            var code = data.resultCode;
                            if(isSuccess){
                                if(code == undefined || code == "" || code == "0000000"){
                                    queueData=data.data.rows;
                                    var getData = angular.copy(queueData);
                                    handledQueueData = def.handleDataByDept(queueData);   //按照科室整理数据
                                    unclinicData = def.handleUnclinicDataByDept(getData);   //按照科室整理数据
                                }else{
                                    def.dealEmptyData(code);
                                }
                            }else{//查询失败
                                var errorMsg = data.message;
                                KyeeMessageService.broadcast({
                                    content : errorMsg
                                });
                            }
                            onSuccess(handledQueueData,unclinicData);
                        },
                        onError : function(retVal){
                        }
                    }
                );
            },
            //提示信息
            dealEmptyData : function(code){
                def.emptyflag = 1;
              if(code == "00011"){
                  def.emptydetail = KyeeI18nService.get("new_queue_clinic.emptydetail_1","您的预约挂号已经成功，排队系统正在进行排队处理，请稍候");
              } else if(code == "00012") {
                  def. emptydetail= KyeeI18nService.get("new_queue_clinic.emptydetail_2","您今天没有待就诊的记录，请就诊当天查看");
              }else if(code == "00013") {
                  def.emptydetail = KyeeI18nService.get("new_queue_clinic.emptydetail_3","您的预约挂号已经成功，该科室需要在医院分诊台查看排队信息");
              }else {
                  def.emptyflag = 0;
                  def.emptydetail = KyeeI18nService.get("new_queue_clinic.emptydetail_0","您暂无未就诊的预约挂号业务");
              }
            },
            //按照科室整理数据
            handleDataByDept : function(allQueueData){
                var handledQueueData = {};   //处理后的数据
                for(var i = 0; i < allQueueData.length; i++){
                    var queneData = allQueueData[i];
                    this.handleData(queneData);
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
                    this.handleData(queneData);
                    if(queneData.CURRENT_CALL_NUMBER == "--" || queneData.QUEUE_COUNT == "已过号"){
                        var deptName = queneData.DEPT_NAME;   //科室
                        if(!handleUnclinicDataByDept[deptName]){
                            handleUnclinicDataByDept[deptName] = [queneData];
                        }else{
                            handleUnclinicDataByDept[deptName].push(queneData);
                        }
                    }

                }
                return handleUnclinicDataByDept;
            },
            //处理数据(医生照片、排队人数、最后叫号时间)
            handleData : function(queneData){
                //医生照片
                var doctorPic=queneData.DOCTOR_PIC;
                var doctorNewPic=def.doctorPicFun(doctorPic,queneData);
                queneData.DOCTOR_PIC=doctorNewPic;

                //当前叫号
                var currentNumber = def.currentNumber(queneData);
                queneData.CURRENT_CALL_NUMBER=currentNumber;
                //排队人数
                //var queueCount=queneData.QUEUE_COUNT;
                var queueNewCount=def.queueCountFun(queneData);
                queneData.QUEUE_COUNT=queueNewCount;

                //最后叫号时间
                queneData.CURRENT_CALL_TIME = KyeeUtilsService.DateUtils.formatFromString(queneData.CURRENT_CALL_TIME, "YYYY-MM-DD HH:mm:ss.fff", "YYYY/MM/DD HH:mm:ss");
            },
            //医生照片
            doctorPicFun:function(v, rec){
                if(v ==null|| v == undefined||v==''){
                    var tem = "resource/images/icons/headh.png";
                    return tem;
                }else{
                    return v;
                }
            },
            //排队人数
            queueCountFun:function (rec){
                // 修改人:wangchengcheng 修改时间:2016年3月22日 下午2:21:34 任务号: KYEEAPPC-5509 排队剩余人数后台计算
               // var count = rec.PATIENT_NUMBER-rec.CURRENT_CALL_NUMBER;
                var count = rec.REMAINING_NUMBER;
                if(count < 0){
                    return KyeeI18nService.get("new_queue_clinic.nhyg","已过号");
                }else if (isNaN(count)) {
                        return "......";
                }
                return ""+ KyeeI18nService.get("new_queue_clinic.sy","剩余") + count + KyeeI18nService.get("new_queue_clinic.ren","人");
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
