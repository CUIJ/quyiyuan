new KyeeModule()
    .group("kyee.quyiyuan.consultation.consult_doctor_main.service")
    .type("service")
    .name("ConsultDoctorMainService")
    .params(["KyeeMessagerService", "HttpServiceBus", "KyeeMessageService","CacheServiceBus"])
    .action(function (KyeeMessagerService, HttpServiceBus, KyeeMessageService,CacheServiceBus) {
        return {
            hospitalId: null,  //从‘咨询医生’入口进入此页面 传递的hospitalId值
            //科室数据,此处与数据库中保持一致
            //若要使用，建议使用angular.copy()方法深度复制一份，不要修改此数据
            deptList: [{
                id: 1,
                name: '内科',
                code: '1',
                icon: 'icon-query'
            },{
                id: 2,
                name: '外科',
                code: '2',
                icon: 'icon-iconfont-icon'
            },{
                id: 3,
                name: '骨科',
                code: '3',
                icon: 'icon-orthopaedic'
            },{
                id: 4,
                name: '妇产科',
                code: '4',
                icon: 'icon-bstetrics'
            },{
                id: 5,
                name: '儿科',
                code: '5',
                icon: 'icon-paediatrics'
            },{
                id: 6,
                name: '眼科',
                code: '6',
                icon: 'icon-eye'
            },{
                id: 7,
                name: '耳鼻喉头颈科',
                code: '7',
                icon: 'icon-ear'
            },{
                id: 8,
                name: '口腔科',
                code: '8',
                icon: 'icon-stomatology'
            },{
                id: 9,
                name: '皮肤性病科',
                code: '9',
                icon: 'icon-dermatologist'
            },{
                id: 10,
                name: '肿瘤科',
                code: '10',
                icon: 'icon-tumor'
            },{
                id: 11,
                name: '麻醉科',
                code: '11',
                icon: 'icon-opiate'
            },{
                id: 12,
                name: '医学影像科',
                code: '12',
                icon: 'icon-yingxiangyixue'
            },{
                id: 13,
                name: '中医科',
                code: '13',
                icon: 'icon-tcm'
            },{
                id: 14,
                name: '精神心理科',
                code: '14',
                icon: 'icon-psychologist'
            },{
                id: 15,
                name: '生殖中心',
                code: '15',
                icon: 'icon-reproductive-center'
            },{
                id: 17,
                name: '康复医学科',
                code: '17',
                icon: 'icon-rehabilitation'
            },{
                id: 18,
                name: '传染病科',
                code: '18',
                icon: 'icon-chuan'
            },{
                id: 19,
                name: '其他',
                code: '19',
                icon: 'icon-normal'
            }],
            /**
             * 查询推荐医生
             */
            queryTopDoctorList:function(success){
                HttpServiceBus.connect({
                    url: "third:pay_consult/getFirstActiveDoctors",
                    params: {},
                    showLoading: true,
                    onSuccess: function(data){
                        if(data.success){
                            typeof success === 'function' && success(data);
                        }else{
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 3000
                            });
                        }
                    },
                    onError: function(data){
                        KyeeMessageService.broadcast({
                            content: data.message,
                            duration: 3000
                        });
                    }
                });
            },
            /**
             * 查询推荐的医院
             */
            queryTopHospital:function(success){
                HttpServiceBus.connect({
                    url: "third:pay_consult/getFirstConsultHospitals",
                    params: {},
                    showLoading: true,
                    onSuccess: function(data){
                        if(data.success){
                            typeof success === 'function' && success(data);
                        }else{
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 3000
                            });
                        }
                    },
                    onError: function(data){
                        KyeeMessageService.broadcast({
                            content: data.message,
                            duration: 3000
                        });
                    }
                });
            },
            /**
             * 查询我的关注的医生
             */
            queryMyCareList: function(params, success){
                HttpServiceBus.connect({
                    url: "third:pay_consult/doctor/query/v2",
                    params: {
                        hospitalId: params.hospitalId,  //该医院的hospitalId
                        deptCode: params.deptCode,		//科室code
                        page: params.page || 0,			//分页所需，需查询第几页，每页的数量在后端控制
                        doctorType: params.doctorType || 'ALL',
                        sortType: params.sortType
                    },
                    showLoading: params.showLoading,
                    onSuccess: function(data){
                        if(data.success){
                            typeof success === 'function' && success(data);
                        }else{
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 3000
                            });
                        }
                    },
                    onError: function(data){
                        KyeeMessageService.broadcast({
                            content: data.message,
                            duration: 3000
                        });
                    }
                });
            },
            /**
             * 查询切换医院所需要的信息
             */
            queryHospitalInfo : function(hospitalId, onSuccess){
                HttpServiceBus.connect({
                    url : "/patientwords/action/PatientWordsActionC.jspx",
                    params : {
                        op: "queryRegistJumpInfo",
                        DOCTOR_HOSPITALID: hospitalId
                    },
                    onSuccess : function (resp) {
                        if(!resp.data){
                            return;
                        }
                        onSuccess(resp.data);
                    }
                });
            }

        };
    })
    .build();