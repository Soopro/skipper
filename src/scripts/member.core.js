var cookie_domain, owner, resource;
var AjaxRequest;

init = function (owner_alias, app_id) {
  if(!$){
    console.error("Jquery is required!");
    return;
  }
  if(owner_alias == undefined){
    owner = $('html').data("owner");
  }else{
    owner = owner_alias;
  }
  if(typeof(owner) != 'string'){
    console.error("Owner not found!");
    return;
  }
  if(app_id == undefined){
    cookie_domain = $('html').data("app");
  }else{
    cookie_domain = app_id;
  }
  if(typeof(cookie_domain) != 'string'){
    console.error("App not found!");
    return;
  }

  // define api resource
  var api = 'http://api.sup.farm';
  var api_open = api + '/crm/entr/'+owner;
  var api_member = api + '/crm/memb/'+owner;

  resource = {
    //open
    register: {url: api_open + '/register', type: 'POST'},
    login: {url: api_open + '/login', type: 'POST'},
    recover_pwd: {url: api_open + '/recover_pwd', type: 'POST'},
    create_applyment: {url: api_open + '/applyment', type: 'POST'},
    join: {url: api_open + '/join', type: 'POST'},
    //member
    update_pwd: {url: api_member + '/update_pwd', type: 'POST'},
    logout: {url: api_member + '/logout', type: 'GET'},
    profile: {
      'get': {url: api_member + '/profile', type: 'GET'},
      'put': {url: api_member + '/profile', type: 'PUT'}
    },
    applyment: {
      'get': {url: api_member + '/applyment', type: 'GET'},
      'post': {url: api_member + '/applyment', type: 'POST'}
    },
    delete_apply: {url:api_member + '/applyment',type:'DELETE'}
  };

  // define request function
  AjaxRequest = function (request, success_callback, error_callback){
    var requestType = ["POST","GET","DELETE","PUT"];
    var request_data;
    if(requestType.indexOf(request.type) < 0){
      console.error("Request type is not valid.");
      return;
    }
    if(typeof(request.url) != 'string'){
      console.error("Request url is not valid.");
      return;
    }
    if(typeof(request.body) != 'object'){
      console.error("Request body is not valid.");
      return;
    }
    if(request.type != 'GET'){
      try{
        if(typeof(request.body) == 'object'){
          request_data = JSON.stringify(request.body);
        }else{
          request_data = JSON.stringify({});
        }
      }catch(error){
        throw error;
        return;
      }
    }else{
      request_data = null;
    }

    $.ajax({
      type: request.type,
      url: request.url,
      data: request_data,
      crossDomain: true,
      contentType: "application/json",
      headers: {
        'authorization': request.authorization
      },
      success: function (data) {
        success_callback(data);
      },
      error: function (errMsg) {
        if(errMsg && errMsg.responseJSON){
          error_msg = errMsg.responseJSON;
        }else{
          error_msg = errMsg;
        }
        error_callback(error_msg);
      }
    })
  };

};


