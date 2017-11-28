$(document).ready(function() {
  "use strict";

  $('.form-mailto').each(function(e){
    var results_success = $(this).find('.flash .success');
    var results_error = $(this).find('.flash .error');
    var unsupported = $(this).find('.flash .unsupported');
    results_success.hide();
    results_error.hide();
    unsupported.hide();

    var type = $(this).attr('type');
    var app_id = $(this).attr('app-id');

    var member = new Skipper({app_id: app_id});

    if(Skipper.utils.in_wechat() && type == 'mailto') {
      $(this).children().hide();
      $(this).find('.flash').show();
      unsupported.show();
    }

    $(this).submit(function(e) {
      e.preventDefault();

      var form_data = {
        fields: $(this).serializeArray(),
        title: $(this).attr('title'),
        type: $(this).attr('type'),
        action: $(this).attr('action'),
      };

      member.mailto(form_data).then(function(mail_url){
        window.location.href = mail_url;
        results_success.show();
      }).catch(function(error){
        results_error.show();
      });
      return false;
    });
  });

});
