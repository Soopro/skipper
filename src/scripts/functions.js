outer_path = [
  'login.html',
  'join.html',
  'register.html',
  'create_applyment.html',
  'recovery.html',
  'free_apply.html'
]


$(document).ready(function() {
  var member = new SupMember({apiBaseURL:'http://localhost:5000'});

  current_path = location.pathname.substr(1)
  
  if(outer_path.indexOf(current_path) < 0 && !member.token()){
    window.location.href = 'login.html';
  }else if(current_path == 'login.html' && member.token()){
    window.location.href = 'index.html';
  }
  
  // wxlink
  if(member.token){
    member.wxlink(function(data){
      console.log(data);
    }, function(error){
      console.log(error.data);
    });
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
    });
    return false;
  });
  
  // Login
  $('#login-form').submit(function(e) {
    member.login({
      log: $(this).find('[name="log"]').val(),
      pwd: $(this).find('[name="pwd"]').val()
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
  $('#register-check-form').submit(function(e){
    var log = $(this).find('[name="log"]').val();
    member.register.check({
      log: log
    }).then(function(data){
      console.log('success:', data);
      if(!data.exists){
        $('#register-new-form').show();
        $('#register-new-form').find('[name="log"]').val(log);
      }else if(!data.belong){
        $('#register-join-form').show();
        $('#register-join-form').find('[name="log"]').val(log);
      }else{
        $('#register-already-member').show();
      }
      $('#register-check-form').hide();
      return data
    }).catch(function(error){
      console.log('failed:', error.data);
    });
    return false;
  });
  
  $('#register-join-form').submit(function(e){
    var log = $(this).find('[name="log"]').val();
    member.register.join({
      log: log,
    }).then(function(data){
      console.log('success:', data);
      console.log('Join!!!')
      timer = setTimeout(function(){
        window.location.href = 'login.html';
        clearTimeout(timer);
      }, 1000);
      return data;
    }).catch(function(error){
      console.log('failed:', error.data);
    });
    return false;
  });
  
  $('#register-new-form').submit(function(e) {
    member.register.newer({
      log: $(this).find('[name="log"]').val(),
      pwd: $(this).find('[name="pwd"]').val(),
      pwd2: $(this).find('[name="pwd2"]').val(),
      name: $(this).find('[name="name"]').val(),
      email: $(this).find('[name="email"]').val(),
      mobile: $(this).find('[name="mobile"]').val(),
      avatar: $(this).find('[name="avatar"]').val()
    }, function(data) {
      console.log('success:', data);
      window.location.href = 'login.html';
    }, function(error) {
      console.log('failed:', error.data);
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
    var pwd = $(this).find('[name="pwd"]').val()
    var pwd2 = $(this).find('[name="pwd2"]').val()
    if(pwd != pwd2){
      console.log('New password not match');
      return
    }
    member.pwd.update({
      opwd: $(this).find('[name="opwd"]').val(),
      pwd: $(this).find('[name="pwd"]').val(),
      pwd2: $(this).find('[name="pwd2"]').val(),
    }, function(data) {
      console.log('success:', data);
    }, function(error) {
      console.log('failed:', error.data);
    });
    return false;
  });
  
  // Recovery
  var resetpwd_url = 'http://localhost:9000/recovery.html'
  var email_template = '<p>Hello {{meta.name or meta.login}}, <br>'+
                       'Click the link below to reset your password.<p>'+
                       '<a href="'+resetpwd_url+'?sid={{meta.sid}}">'+
                       ''+resetpwd_url+'?sid={{meta.sid}}'+
                       '</a>'
  var sid = member.utils.getParam('sid');
  if(!sid){
    $('#recovery-form').show();
    $('#recovery-form').submit(function(e) {
      member.pwd.recovery({
        log: $(this).find('[name="log"]').val(),
        subject: 'Recovery Password',
        template: email_template
      }, function(data) {
        console.log('success:', data);
        $('#msgbox').html('<h2>Recovery Email is send to your mail box</h2>')
      }, function(error) {
        console.log('failed:', error.data);
      });
      return false;
    });
  }else{
    $('#resetpwd-form').show();
    $('#resetpwd-form').submit(function(e) {
      member.pwd.reset({
        sid: sid,
        pwd: $(this).find('[name="pwd"]').val(),
        pwd2: $(this).find('[name="pwd2"]').val(),
      }, function(data) {
        $('#msgbox').html('<h2>Password reseted.</h2>')
        console.log('success:', data);
      }, function(error) {
        $('#msgbox').html('<h2>'+error.data.errmsg+'</h2>')
        console.log('failed:', error.data);
      });
      return false;
    });
  }
  
  // Activity
  if($('#activities').length > 0){
    member.activity.query(function(data) {
      console.log('success:', data);
      for(var i=0; i<data.length; i++){
        var act = data[i];
        $('#activities').append(
          [
           '<p>',
           'Alias: '+act.alias+'<br>',
           'Title: '+act.title+'<br>',
           'Time: '+act.time+'<br>',
           'Location: '+act.location+'<br>',
           'Member Verify: '+(act.permit==1)+'<br>',
           'Update: '+new Date(act.updated*1000)+'<br>',
           '</p>',
           '<a href="apply.html?act_id='+act.id+'">Apply</a>',
           '<hr>'
          ].join('')
        )
      }
    }, function(error) {
      console.log('failed:', error.data);
    });
  }
  
  if($('#activity').length > 0){
    alias = $('#activity').attr('alias') || $('#activity').data('alias');
    member.activity.get(alias
    , function(data) {
      console.log('success:', data);
    }, function(error) {
      console.log('failed:', error.data);
    });
  }
  
  // Applayment
  function add_apply(apply){
    $('#applyments').prepend(
      [
       '<div id='+apply.id+'>',
       '<p>',
       'Name: '+apply.name+'<br>',
       'Message: '+apply.message+'<br>',
       'member: '+Boolean(apply.member_id)+'<br>',
       'Update: '+new Date(apply.updated*1000)+'<br>',
       '</p>',
       '<button name="cancel_apply" apply-id="'+apply.id+'">Cancel</button>',
       '<hr>',
       '<div>'
      ].join('')
    )
  }
  function show_applyments(applyments) {
    $('#applyments').html('');
    var act_id = member.utils.getParam('act_id');
    for(var i=0; i<applyments.length; i++){
      var apply = applyments[i];
      if(act_id && apply.activity_id != act_id){
        continue
      }
      if(apply.canceled){
        continue
      }
      add_apply(apply);
    }
    
    $('button[name="cancel_apply"]').click(function(e){
      var apply_id = $(this).attr('apply-id') || $(this).data('apply-id');
      if(apply_id){
        member.apply.remove(apply_id
        , function(data) {
          console.log('success:', data);
          $('#applyments').children().each(function(e){
            if($(this).attr('id') == apply_id){
              $(this).remove()
            }
          });
        }, function(error) {
          console.log('failed:', error.data);
        });
      }
      
    });
  }


  if($('#applyments').length > 0){
    member.apply.query(function(data) {
      console.log('success:', data);
      show_applyments(data);
    }, function(error) {
      console.log('failed:', error.data);
    });
  }
  
  if($('#create-apply-form').length > 0){
    var act_id = member.utils.getParam('act_id');
    $(this).find('[name="act_id"]').val(act_id);
  }
  
  $('#create-apply-form').submit(function(e) {
    var free_mode = $(this).find('[name="free"]:checked').val();
    var create_func;
    if(free_mode == 1){
      create_func = member.apply.free
    }else{
      create_func = member.apply.create
    }
    create_func({
      name: $(this).find('[name="name"]').val(),
      activity_id: $(this).find('[name="act_id"]').val(),
      message: $(this).find('[name="message"]').val(),
      meta: {}
    }, function(data) {
      console.log('success:', data);
      add_apply(data);
    }, function(error) {
      console.log('failed:', error.data);
    });
    return false;
  });
  
  $('#create-free-apply-form').submit(function(e) {
    member.apply.free({
      name: $(this).find('[name="name"]').val(),
      activity_alias: $(this).find('[name="activity"]').val(),
      message: $(this).find('[name="message"]').val(),
      meta: {}
    }, function(data) {
      console.log('success:', data);
      add_apply(data);
    }, function(error) {
      console.log('failed:', error.data);
    });
    return false;
  });
  
});

// ---
// generated by coffee-script 1.9.2