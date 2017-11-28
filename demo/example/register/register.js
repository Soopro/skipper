$(document).ready(function() {
  "use strict";

  var app_id = $('.form-register').attr('app-id');
  var member = new Skipper({
    api_host: 'http://localhost:5000/crm/external',
    app_id: app_id
  });

  if (member.token()){
    $('.form-register').hide();
  } else {
    $('.form-register').show();
  }

  $('.form-register').submit(function(e){
    e.preventDefault();
    var results_error = $(this).find('.flash .error');
    results_error.hide();

    var login = $(this).find('input[name=login]').val();
    var passwd = $(this).find('input[name=passwd]').val();
    var passwd2 = $(this).find('input[name=passwd2]').val();
    var name = $(this).find('input[name=name]').val();
    var email = $(this).find('input[name=email]').val();
    var avatar = $(this).find('input[name=avatar]').val();
    var mobile = $(this).find('input[name=mobile]').val();

    if (!login || !passwd || passwd != passwd2) {
      results_error.show();
      return
    }

    member.register({
      login: login,
      passwd: passwd,
      meta: {
        name: name,
        email: email,
        avatar: avatar,
        mobile: mobile
      },
      entrypoint: 'test skipper'
    }).then(function(data){
      console.log(data);
      $('.form-register').hide();
    }).catch(function(error){
      console.log(error.data);
      results_error.show();
    });

  });

});
