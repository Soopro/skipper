$(document).ready(function() {
  "use strict";

  var app_id = $('.form-security').attr('app-id');
  var member = new Skipper({
    api_host: 'http://localhost:5000/crm/external',
    app_id: app_id
  });

  if (member.token()){
    $('.form-security').show();
  } else {
    $('.form-security').hide();
  }

  $('.form-security').submit(function(e){
    e.preventDefault();

    var results_success = $(this).find('.flash .success');
    var results_error = $(this).find('.flash .error');
    results_success.hide();
    results_error.hide();

    var old_passwd = $(this).find('input[name=old_passwd]').val();
    var passwd = $(this).find('input[name=passwd]').val();
    var passwd2 = $(this).find('input[name=passwd2]').val();

    if (!old_passwd || !passwd || passwd != passwd2) {
      results_error.show();
      return
    }

    member.security.pwd({
      old_passwd: old_passwd,
      passwd: passwd,
    }).then(function(data){
      console.log(data);
      $(this).find('input[name=old_passwd]').val('');
      $(this).find('input[name=passwd]').val('');
      $(this).find('input[name=passwd2]').val('');
      results_success.show();
    }).catch(function(error){
      console.log(error.data);
      results_error.show();
    });

  });

});
