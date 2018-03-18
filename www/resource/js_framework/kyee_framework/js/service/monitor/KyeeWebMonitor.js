/**
 * Created by shaopenghui on 2017/11/10.
 */
angular
    .module('kyee.framework.exception',[])
    .factory('$exceptionHandler',function(){
        return function(exception,cause){
            console.error(exception);
            clairvoyant.handleError(exception);
        }

    });




