$(document).ready(function() {
  "use strict";

  $('.form-appt').each(function(){
    var results_success = $(this).find('.flash .success');
    var results_error = $(this).find('.flash .error');
    results_success.hide();
    results_error.hide();

    var type = $(this).attr('type');
    var app_id = $(this).attr('app-id');

    var member = new Skipper({
      api_host: 'http://localhost:5000/crm/external',
      app_id: app_id
    });

    $(this).submit(function(e) {
      e.preventDefault();

      var form_data = {
        fields: $(this).serializeArray(),
        title: $(this).attr('title'),
        type: $(this).attr('type'),
        action: $(this).attr('action'),
      };

      member.appointment.create(form_data).then(function(data){
        console.log(data);
        results_success.show();
      }).catch(function(error){
        console.error(error.data);
        results_error.show();
      });

      return false;
    });
  });

});
