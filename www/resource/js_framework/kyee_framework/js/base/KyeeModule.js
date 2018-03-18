var KyeeModule = function(){
	
	var def = {
		
		groupName : null,
		requireList : [],
		nameList : [],
		typeList : [],
		paramsList : [],
		actionList : [],
		
		group : function(name){
			this.groupName = name;
			return this;
		},
		
		require : function(require){
			this.requireList = require;
			return this;
		},
	
		name : function(name){
			this.nameList.push(name);
			return this;
		},
		
		type : function(name){
			this.typeList.push(name);
			return this;
		},
		
		params : function(params){
			this.paramsList.push(params);
			return this;
		},
		
		action : function(action){
			this.actionList.push(action);
			return this;
		},
		
		add : function(){
			
			//为前一个对象设置可选项
			//详见 setOptionalAttr() 备注
			this.setOptionalAttr();
			
			return this;
		},
		
		setOptionalAttr : function(){
			
			//如果本次添加的对象没有设置可选参数，则自动设置空值
			//注意：可选参数一定要进行设置，因为后面使用 pop 取值，这样才能保证各个属性之间的对应性
			if (this.paramsList.length == this.nameList.length - 1) {
				this.paramsList.push([]);
			}
		},
		
		build : function(){
			
			//为最后对象自动设置可选参数，详见 setOptionalAttr() 备注
			this.setOptionalAttr();

			var module = angular.module(this.groupName, this.requireList);

			while(this.nameList.length > 0){
				
				var name = this.nameList.pop();
				var type = this.typeList.pop();
				var action = this.actionList.pop();
				var params = this.paramsList.pop();
				
				//将 action 作为 params 的最后一个参数
				params.push(action);
				
				if(type == "controller"){
					
					module = module.controller(name, params);
				}else if (type == "service") {
					
					module = module.factory(name, params);
				}else if (type == "provider") {
					
					module = module.provider(name, params);
				}else if(type == "filter"){

					module = module.filter(name, params);
				}
			}
		}
	};
	
	return def;
};