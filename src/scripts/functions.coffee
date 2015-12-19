$(document).ready ->
  
  member = new SupMember()
  
  $('#login-form').submit (e)->
    
    $('#failed').hide()
    $('#seccesed').hide()

    member.login
      log: $('[name="LoginName"]').val()
      pwd: $('[name="LoginPwd"]').val()
    , (data)->
      console.log data
    , (error)->
      console.log error

    return false
    
  
  $('#register-form').submit (e)->
    
    member.register
      log: $('[name="log"]').val()
      pwd: $('[name="pwd"]').val()
      pwd2: $('[name="pwd2"]').val()
      name: $('[name="name"]').val()
      email: $('[name="email"]').val()
      
    , (data)->
      console.log data
    , (error)->
      console.log error
    return false