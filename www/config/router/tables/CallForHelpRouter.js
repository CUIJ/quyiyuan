/**
 *
 * @type {{call_ambulance: {url: string, views: {main_view: {templateUrl: string, controller: string}}}}}
 */
var CALL_FOR_HELP_ROUTER_TABLE={

    "callAmbulance" : {
        url:"/callAmbulance",
        views:{
            "main_view":{
                templateUrl:"modules/business/call_for_help/views/callAmbulance.html",
                controller:"CallAmbulanceController"
            }
        }
    }
};
