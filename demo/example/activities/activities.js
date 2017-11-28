$(document).ready(function() {
  "use strict";

  var app_id = $('.list').attr('app-id');
  var member = new Skipper({
    api_host: 'http://localhost:5000/crm/external',
    app_id: app_id
  });

  if (member.token()){
    $('.list').show();
  } else {
    $('.list').hide();
  }

  member.appointment.query()
  .then(function(appts){
    for (var i = 0; i < appts.length; i++){
      var appt = appts[i];
      var data_str = '';

      console.log(appt);

      data_str += '<p>Appointee: '+appt.appointee+'</p>';
      data_str += '<p>Contact: '+appt.contact+'</p>';
      data_str += '<p>Date: '+appt.date+'</p>';
      data_str += '<p>Location: '+appt.location+'</p>';
      data_str += '<p>Meta: '+JSON.stringify(appt.meta)+'</p>';
      data_str += '<p>Event: '+appt.event.title+'</p>';
      data_str += '<button>Remove</button>';

      var el_style = 'style="background:#eee;padding:8px;margin:8px;"';
      var element = $('<div '+el_style+'></div>').append(data_str);

      element.find('button').click(function(e){
        e.preventDefault();
        member.appointment.remove(appt.id)
        .then(function(){
          element.remove();
        }).catch(function(error){
          alert(JSON.stringify(error.data));
        });
      });

      $('.list').append(element);
    }
  }).catch(function(error){
    console.log(error.data);
  });

});
