outer_path = [
  'login.html',
  'join.html',
  'register.html',
  'create_demand.html',
  'recovery.html',
  'free_demand.html'
]


$(document).ready(function() {
  var member = new Skipper({
    apiBaseURL:'http://localhost:5000'
  });

  current_path = location.pathname.substr(1)

  if(outer_path.indexOf(current_path) < 0 && !member.token()){
    window.location.href = 'login.html';
  }else if(current_path == 'login.html' && member.token()){
    window.location.href = 'index.html';
  }

  // Logout

  $('#logout').click(function(e) {
    member.logout()
    .then(function(data) {
      console.log('success:', data);
      window.location.href = 'login.html';
      return data;
    }).catch(function(error) {
      console.log('failed:', error.data);
    }).finally(function() {
      console.log('finally');
      window.location.href = 'login.html';
    });
    return false;
  });

  // Login
  $('#login-form').submit(function(e) {
    member.login({
      login: $(this).find('[name="log"]').val(),
      passwd: $(this).find('[name="pwd"]').val()
    }).then(function(data) {
      console.log('success:', data);
      window.location.href = 'index.html';
      return data;
    }).catch(function(error) {
      console.log('failed:', error.data);
    }).finally(function() {
      console.log('finally');
    });
    return false;
  });


  // Register

  $('#register-new-form').submit(function(e) {
    var passwd = $(this).find('[name="pwd"]').val();
    var passwd2 = $(this).find('[name="pwd2"]').val();
    if(passwd != passwd2){
      console.log('Confirm password not match');
      return
    }
    member.register({
      login: $(this).find('[name="log"]').val(),
      passwd: $(this).find('[name="pwd"]').val(),
      name: $(this).find('[name="name"]').val(),
      email: $(this).find('[name="email"]').val(),
      mobile: $(this).find('[name="mobile"]').val(),
      avatar: $(this).find('[name="avatar"]').val(),
      code: $(this).find('[name="code"]').val()
    }, function(data) {
      console.log('success:', data);
      $('#msgbox').html('You are registered! Go Login');
      $('#register-new-form').hide();
    }, function(error) {
      console.log('failed:', error.data);
      $('#msgbox').html(error.data.errmsg);
    });

    return false;
  });

  // Profile

  function show_profile(profile){
    $('#profile').find('[member-log]').html(profile.login);
    $('#profile').find('[member-name]').html(profile.name);
    $('#profile').find('[member-email]').html(profile.email);
    $('#profile').find('[member-avatar]').html(profile.avatar);
    $('#profile').find('[member-mobile]').html(profile.mobile);
  }
  function show_profile_form(profile){
    $('#profile-form').find('[name="name"]').val(profile.name);
    $('#profile-form').find('[name="email"]').val(profile.email);
    $('#profile-form').find('[name="avatar"]').val(profile.avatar);
    $('#profile-form').find('[name="mobile"]').val(profile.mobile);
  }

  if($('#profile').length > 0) {
    member.profile.get(function(data) {
      console.log('success:', data);
      show_profile(data);
    }, function(error) {
      console.log('failed:', error.data);
    });
  }

  if($('#profile-form').length > 0){
    member.profile.get(function(data) {
      console.log('success:', data);
      show_profile_form(data);
    }, function(error) {
      console.log('failed:', error.data);
    });
  }

  $('#profile-form').submit(function(e) {
    member.profile.update({
      name: $(this).find('[name="name"]').val(),
      email: $(this).find('[name="email"]').val(),
      avatar: $(this).find('[name="avatar"]').val(),
      mobile: $(this).find('[name="mobile"]').val(),
    }, function(data) {
      console.log('success:', data);
      show_profile(data, '#profile-form');
    }, function(error) {
      console.log('failed:', error.data);
    });
    return false;
  });

  $('#pwd-form').submit(function(e) {
    var passwd = $(this).find('[name="pwd"]').val()
    var passwd2 = $(this).find('[name="pwd2"]').val()
    if(passwd != passwd2){
      console.log('New password not match');
      return
    }
    member.pwd({
      old_passwd: $(this).find('[name="opwd"]').val(),
      passwd: $(this).find('[name="pwd"]').val(),
    }, function(data) {
      console.log('success:', data);
    }, function(error) {
      console.log('failed:', error.data);
    });
    return false;
  });

  // Demand
  function render_demand(demand){
    $('#demands').prepend(
      [
       '<div id='+demand.id+'>',
       '<p>',
       'Name: '+demand.name+'<br>',
       'Message: '+demand.message+'<br>',
       'member: '+Boolean(demand.member_id)+'<br>',
       'Update: '+new Date(demand.updated*1000)+'<br>',
       '</p>',
       '<button name="cancel_demand" demand-id="'+demand.id+'">',
       'Cancel',
       '</button>',
       '<hr>',
       '<div>'
      ].join('')
    )
  }
  function show_demand_list(demands) {
    $('#demands').html('');
    for(var i=0; i < demands.length; i++){
      render_demand(demands[i]);
    }

    $('button[name="cancel_demand"]').click(function(e){
      var demand_id = $(this).attr('demand-id') || $(this).data('demand-id');
      if(demand_id){
        member.demand.remove(demand_id
        , function(data) {
          console.log('success:', data);
          $('#demands').children().each(function(e){
            if($(this).attr('id') == demand_id){
              $(this).remove()
            }
          });
        }, function(error) {
          console.log('failed:', error.data);
        });
      }

    });
  }

  if($('#demands').length > 0){
    member.demand.query(function(data) {
      console.log('success:', data);
      show_demand_list(data);
    }, function(error) {
      console.log('failed:', error.data);
    });
  }

  if($('#create-demand-form').length > 0){
    member.profile.get(function(profile) {
      $('#create-demand-form').find('[name="name"]').val(profile.name);
    });
  }

  $('#create-demand-form').submit(function(e) {
    var free_mode = $(this).find('[name="free"]:checked').val();
    var create_func;
    if(free_mode == 1){
      create_func = member.demand.free
    }else{
      create_func = member.demand.create
    }
    create_func({
      name: $(this).find('[name="name"]').val(),
      event_id: $(this).find('[name="demand_id"]').val(),
      meta: {
        message: $(this).find('[name="message"]').val()
      }
    }, function(data) {
      console.log('success:', data);
      render_demand(data);
    }, function(error) {
      console.log('failed:', error.data);
    });
    return false;
  });

  $('#create-free-demand-form').submit(function(e) {

    member.demand.free({
      name: $(this).find('[name="name"]').val(),
      event_slug: $(this).find('[name="event"]').val(),
      meta: {
        message: $(this).find('[name="message"]').val()
      }
    }, function(data) {
      console.log('success:', data);
      render_demand(data);
    }, function(error) {
      console.log('failed:', error.data);
    });
    return false;
  });

  // wxlink
  if(member.token() && member.wxlink.open_sid()){
    member.wxlink.get(function(data){
      if(data.token){
        $('#wx-unlink-btn').show();
      }else{
        $('#wx-link-btn').show();
      }
    }, function(error){
      console.log('fuck');
      console.log(error.data);
    });
  }
  $('#wx-link-btn').click(function(e){
    member.wxlink.link(function(data){
      console.log(data);
      $('#wx-unlink-btn').show();
      $('#wx-link-btn').hide();
    }, function(error){
      console.log(error.data);
    });
  });
  $('#wx-unlink-btn').click(function(e){
    member.wxlink.unlink(function(data){
      console.log(data);
      $('#wx-unlink-btn').hide();
      $('#wx-link-btn').show();
    }, function(error){
      console.log(error.data);
    });
  });

  // automatic login by wechat openid
  if(!member.token() && member.wxlink.open_sid()){
    console.log('Try use WX open id to login')
    member.wxlink.login(function(data){
      console.log(data);
      if(member.token()){
        window.location.href = 'index.html';
      }
    }, function(error){
      console.log(error.data);
    });
  };
});

// ---
// generated by coffee-script 1.9.2