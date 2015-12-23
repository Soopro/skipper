# -------------------------------
# Skipper - Soopro member system front-end.
# Version:  0.0.1
# -------------------------------
is_exports = typeof exports isnt "undefined" and exports isnt null
root = if is_exports then exports else this

token_cookie_name = 'sup_member_auth'
profile_cookie_name = 'sup_member_profile'


default_options = 
  apiBaseURL: 'http://localhost:5000'
  contentType: 'application/json'
  responseType: 'json'
  withCredentials: false
  expires: 1000*3600*24
  
root.SupMember = (app_id, opts) ->
  options = default_options
  for k,v of opts
    options[k] = v

  cookie_domain = app_id
  if not app_id
    html = document.documentElement
    app_id = (html.getAttribute('app') or html.dataset.app)
    
  if typeof app_id != 'string'
    throw 'App not found!'
    return
  
  request_types = [
    'POST'
    'GET'
    'DELETE'
    'PUT'
  ]
  
  ajax = new Ajax()
  
  # define request function
  do_request = (request, success_callback, failed_callback) ->
    if typeof request.headers isnt 'object'
      request.headers = {}
    if request.token
      request.headers['Authorization'] = 'Bearer '+request.token

    response = ajax.send
      type: request.type
      url: request.url
      params: request.params
      data: request.data
      contentType: request.contentType or options.contentType
      responseType: request.responseType or options.responseType
      withCredentials: request.withCredentials or options.withCredentials
      headers: request.headers
      
    if typeof success_callback is 'function'
      response.then (data)->
        success_callback data
        return data
    
    if typeof failed_callback is 'function'
      response.catch (error)->
        failed_callback error
        return error

    return response
  
  # define api resource
  api = options.apiBaseURL
  api_open = api + '/crm/entr/' + app_id
  api_member = api + '/crm/memb/' + app_id
  
  member =
    request: (request, success, failed)->
      do_request request
      , success
      , failed

    register: (data, success, failed)->
      do_request
        url: api_open + '/register'
        type: 'POST'
        data: data
      , success
      , failed
      
    join: (data, success, failed)->
      do_request
        url: api_open + '/join'
        type: 'POST'
        data: data
      , success
      , failed

    login: (data, success, failed)->
      do_request
        url: api_open + '/login'
        type: 'POST'
        data: data
      , (data)->
        try
          supCookie.set token_cookie_name, data.token, options.expires
        catch e
          console.error e
        if typeof success is 'function'
          success(data)
      , failed
      
    recover_pwd: (data, success, failed)->
      do_request
        url: api_open + '/recover_pwd'
        type: 'POST'
        data: data
      , success
      , failed

    change_pwd: (data, success, failed)->
      do_request
        url: api_member + '/update_pwd'
        type: 'POST'
        data: data
        token: supCookie.get token_cookie_name
      , success
      , failed
      
    logout: (success, failed)->
      do_request
        url: api_member + '/logout'
        type: 'GET'
        token: supCookie.get token_cookie_name
      , (data)->
        try
          supCookie.remove profile_cookie_name
          supCookie.remove token_cookie_name
        catch e
          console.error e
        if typeof success is 'function'
          success(data)
      , failed

    profile:
      get: (success, failed)->
        profile = supCookie.get profile_cookie_name
        if profile
          deferred = Q.defer()
          deferred.resolve(profile)
          if typeof success is 'function'
            deferred.promise.then (data)->
              success data
              return data
          return deferred.promise
        else
          do_request
            url: api_member + '/profile'
            type: 'GET'
            token: supCookie.get token_cookie_name
          , (data)->
            try
              supCookie.set profile_cookie_name, data, options.expires
            catch e
              console.error e
            if typeof success is 'function'
              success(data)
          , failed

      update: (data, success, failed)->
        do_request
          url: api_member + '/profile'
          type: 'PUT'
          data: data
          token: supCookie.get token_cookie_name
        , (data)->
          try
            supCookie.set profile_cookie_name, data, options.expires
          catch e
            console.error e
          if typeof success is 'function'
            success(data)
        , failed
    activity:
      query: (success, failed)->
        do_request
          url: api_open + '/activity'
          type: 'GET'
        , success
        , failed
      get: (alias, success, failed)->
        do_request
          url: api_open + '/activity/' + alias
          type: 'GET'
        , success
        , failed
    apply: 
      free: (data, success, failed)->
        do_request
          url: api_open + '/applyment'
          type: 'POST'
          data: data
        , success
        , failed
      
      query: (success, failed)->
        do_request
          url: api_member + '/applyment'
          type: 'GET'
          token: supCookie.get token_cookie_name
        , success
        , failed
      
      create: (data, success, failed)->
        do_request
          url: api_member + '/applyment'
          type: 'POST'
          data: data
          token: supCookie.get token_cookie_name
        , success
        , failed
      
      remove: (data, success, failed)->
        do_request
          url: api_member + '/applyment'
          type: 'DELETE'
          data: data
          token: supCookie.get token_cookie_name
        , success
        , failed
    
    token: ->
      return supCookie.get token_cookie_name

  return member
  
  


# Errors
InvalidRequestAPI = new Error('Request API is invaild.')
InvalidRequestType = new Error('Request Type is invaild.')
InvalidRequestData = new Error('Request Data is invaild.')
InvalidRequestParam = new Error('Request Param is invaild.')
ResouceNotFound = new Error('Resource Not Found.')


# AJAX
root.Ajax = ->
  ajax =
    get: (request) ->
      XHRConnection 'GET', request
    post: (request) ->
      XHRConnection 'POST', request
    update: (request) ->
      XHRConnection 'PUT', request
    remove: (request) ->
      XHRConnection 'DELETE', request
    send: (request) ->
      XHRConnection request.type, request


  XHRConnection = (type, request) ->
    xhr = new XMLHttpRequest()
    url = add_params(request.url, request.params)

    xhr.open type, url or '', true

    xhr.responseType = request.responseType
    xhr.withCredentials = Boolean(request.withCredentials)

    xhr.setRequestHeader 'Content-Type', request.contentType

    if typeof request.headers is 'object'
      for k,v of request.headers
        xhr.setRequestHeader k, v
    
    # listener
    deferred = Q.defer()
    
    ready = (e)->
      xhr = this
      if xhr.readyState == xhr.DONE
        xhr.removeEventListener 'readystatechange', ready
        result = parse_response(xhr)
        if xhr.status >= 200 and xhr.status < 399
          deferred.resolve(result.data)
        else
          deferred.reject(result)
    
    xhr.addEventListener 'readystatechange', ready
    
    # send
    if type in ['GET', 'DELETE']
      xhr.send()
    else
      try
        send_data = JSON.stringify(request.data)
      catch error
        throw error

      xhr.send(send_data)

    return deferred.promise

  add_params = (url, params)->
    joint = if url.indexOf('?') > -1 then '&' else '?'
    if typeof params isnt 'object'
      return url
    for k, v of params
      url = url+joint+k+'='+v
      joint = '&' if joint != '&'
    return url
  
  parse_response = (xhr, headers) ->
    if xhr.responseType is 'json'
      try
        data = xhr.response or JSON.parse(xhr.responseText)
      catch
        data = xhr.responseText
    else
      data = xhr.responseText

    result =
      data: data
      headers: xhr.getAllResponseHeaders()
      status: xhr.status
      statusText: xhr.statusText
      responseType: xhr.responseType
      responseURL: xhr.responseURL
    
    return result

  return ajax

# Cookie
procces_cookie_output = (value)->
  if value is 'undefined'
    return undefined
  if value is 'null'
    return null
  try
    value = JSON.parse(value)
  catch
    value = value
  return value

procces_cookie_input = (value)->
  if typeof value == 'object'
    value = JSON.stringify(value)
  return value
  
supCookie =
  set: (cname, cvalue, expires, path, domain) ->
    cvalue = procces_cookie_input(cvalue)
    d = new Date()
    d.setTime(d.getTime()+expires)
    expires = if expires then 'expires='+d.toUTCString()+'; ' else ''
    path = if path then 'path='+path+'; ' else 'path=/; '
    domain = if domain then 'domain='+domain+'; ' else ''
    document.cookie = cname+'='+cvalue+'; '+expires+domain+path
    
  get: (cname) ->
    name = cname + '='
    ca = document.cookie.split(';')
    i = 0
    while i < ca.length
      c = ca[i]
      while c.charAt(0) == ' '
        c = c.substring(1)
      if c.indexOf(name) == 0
        value = c.substring(name.length, c.length)
        return procces_cookie_output(value)
      i++
    return ''

  remove: (cname)->
    expires='expires=Thu, 01 Jan 1970 00:00:00 UTC; '
    path = if path then 'path='+path+'; ' else 'path=/; '
    domain = if domain then 'domain='+domain+'; ' else ''
    document.cookie = cname+'=; '+expires+domain+path
