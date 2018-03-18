/**
 * 系统助手类
 *
 * @type {{getSimpleService: Function}}
 */
var KyeeAppHelper = {

    /**
     * 获取简单类型服务
     *
     * @param group
     * @param name
     * @returns {*|$value|s|{add, remove, toggle, contains, item}}
     */
    getSimpleService : function(group, name){

        return angular.injector([group]).get(name);
    }
};