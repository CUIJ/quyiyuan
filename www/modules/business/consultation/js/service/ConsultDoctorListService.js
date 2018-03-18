/**
 * 产品名称 quyiyuan
 * 创建用户: dangliming
 * 日期: 2017年6月20日10:29:57
 * 创建原因：咨询医生列表服务层
 */
new KyeeModule()
	.group("kyee.quyiyuan.consultation.consult_doctor_list.service")
	.type("service")
	.name("ConsultDoctorListService")
	.params(["KyeeMessagerService", "HttpServiceBus", "KyeeMessageService"])
	.action(function (KyeeMessagerService, HttpServiceBus, KyeeMessageService) {
		return {
			hospitalId: null,  //从‘咨询医生’入口进入此页面 传递的hospitalId值
			doctorTypeTmp: null,
			queryText1Tmp: null,
			//默认的科室code
			defaultDept:null,
			//科室数据,此处与数据库中保持一致
			//若要使用，建议使用angular.copy()方法深度复制一份，不要修改此数据
			deptList: [{
                id: 0,
                name: '全部',
                code: '0',
                icon: 'icon-all'
            },{
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
			 * [getDoctorListByFilter 根据条件获取医生列表]
			 * @param  {[type]} params  [description]
			 * @param  {[type]} success [description]
			 * @param  {[type]} fail    [description]
			 * @return {[type]}         [description]
			 */
			getDoctorListByFilter: function(params, success, fail){
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
					onSuccess: function(response){
						typeof success === 'function' && success(response);
					},
					onError: function(error){
						typeof fail === 'function' && fail(error);
					}
				});
			},

			/**
			 * [getDoctorListByKeyWords 根据关键词搜索，关键词可以是医院、医生、科室，该接口不分页]
			 * @param  {[type]} params  [description]
			 * @param  {[type]} success [description]
			 * @param  {[type]} fail    [description]
			 * @return {[type]}         [description]
			 */
			getDoctorListByKeyWords: function(params, success, fail){
				HttpServiceBus.connect({
					url: "third:pay_consult/doctor/list/search",
					params: {
						hospitalId: params.hospitalId,  //该医院的hospitalId
						searchText: params.searchText
					},
					onSuccess: function(response){
						typeof success === 'function' && success(response);
					},
					onError: function(error){
						typeof fail === 'function' && fail(error);
					}
				});
			},

		};
	})
	.build();