outer_path = [
  'login.html',
  'join.html',
  'register.html',
  'create_applyment.html',
  'recover_pwd.html',
]


$(document).ready(function() {
  var member = new SupMember();

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
    });
    return false;
  });
  
  // Login
  
  $('#login-form').submit(function(e) {
    member.login({
      log: $(this).find('[name="LoginName"]').val(),
      pwd: $(this).find('[name="LoginPwd"]').val()
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
  
  $('#register-form').submit(function(e) {
    member.register({
      log: $(this).find('[name="log"]').val(),
      pwd: $(this).find('[name="pwd"]').val(),
      pwd2: $(this).find('[name="pwd2"]').val(),
      name: $(this).find('[name="name"]').val(),
      email: $(this).find('[name="email"]').val()
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
    member.change_pwd({
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
  // Activity
  if($('#activity-list').length > 0){
    member.activity.query(function(data) {
      console.log('success:', data);
    }, function(error) {
      console.log('failed:', error.data);
    });
  }
  if($('#activity').length > 0){
    member.activity.get('test'
    , function(data) {
      console.log('success:', data);
    }, function(error) {
      console.log('failed:', error.data);
    });
  }
  
  // Applayment
  function show_applyments(applyments) {
    for(var i=0; i<applyments.length; i++){
      var apply = appylments[i];
      console.log(apply);
    }
  }

  if($('#applyments').length > 0){
    member.apply.query(function(data) {
      console.log('success:', data);
      show_applyments(data);
    }, function(error) {
      console.log('failed:', error.data);
    });
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
      name: '123',
      activity_alias: 'test',
      message: '........',
      meta: {}
    }, function(data) {
      console.log('success:', data);
    }, function(error) {
      console.log('failed:', error.data);
    });
    return false;
  });
  
});

// ---
// generated by coffee-script 1.9.2