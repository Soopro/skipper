$(document).ready(function() {
  "use strict";

  var app_id = $('#login').attr('app-id');
  var member = new Skipper({
    api_host: 'http://localhost:5000/crm/external',
    app_id: app_id
  });

  var profile = null;

  function get_profile(){
    member.profile.get().then(function(data){
      $('#profile [member-log]').html(data.login);
      if (data.role.slug) {
        $('#profile [member-role]').html(data.role.name);
        $('#profile [member-role-slug]').html(data.role.slug);
      }
      $('#profile [member-entrypoint]').html(data.entrypoint);
      $('#profile [member-status]').html(data.status);

      $('#profile input[name="name"]').val(data.meta.name);
      $('#profile input[name="email"]').html(data.meta.email);
      $('#profile input[name=avatar]').html(data.meta.avatar);
      $('#profile input[name=mobile]').html(data.meta.mobile);
    });
  }

  if (member.token()){
    $('#login').hide();
    $('#logout').show();
    $('#profile').show();
    get_profile();
  } else {
    $('#login').show();
    $('#logout').hide();
    $('#profile').hide();
  }


  $('.form-login').submit(function(e){
    e.preventDefault();
    var results_error = $(this).find('.flash .error');
    results_error.hide();

    var login = $(this).find('input[name=login]').val();
    var passwd = $(this).find('input[name=passwd]').val();

    if (!login || !passwd) {
      results_error.show();
      return
    }

    member.login({
      login: login,
      passwd: passwd,
    }).then(function(data){
      console.log(data);
      $('#login').hide();
      $('#profile').show();
      get_profile();
    }).catch(function(error){
      console.log(error.data);
      results_error.show();
    });

  });

  $('.form-profile').submit(function(e){
    e.preventDefault();

    var results_success = $(this).find('.flash .success');
    var results_error = $(this).find('.flash .error');
    results_success.hide();
    results_error.hide();

    member.profile.update({
      meta: meta,
    }).then(function(data){
      get_profile();
    }).catch(function(error){
      console.log(error.data);
      results_error.show();
    });

  });

  $('#logout').click(function(e){
    e.preventDefault();
    member.logout().then(function(){
      $('#login').show();
      $('#profile').hide();
    });
  });

});
