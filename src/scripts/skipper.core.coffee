# -------------------------------
# Skipper - Soopro member system front-end.
# Version:  0.0.1
# -------------------------------
is_exports = typeof exports isnt "undefined" and exports isnt null
root = if is_exports then exports else this


default_options = 
  apiBaseURL: 'http://localhost:5000'
  contentType: 'application/json'
  responseType: 'json'
  withCredentials: false
  
root.SupMember = (app_id, opts) ->
  options = opts or default_options
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

    ajax.send
      type: request.type
      url: request.url
      params: request.params
      data: request.data
      contentType: request.contentType or options.contentType
      responseType: request.responseType or options.responseType
      withCredentials: request.withCredentials or options.withCredentials
      headers:
        'authorization': request.authorization

    .then (data, xhr)->
      if typeof success_callback is 'function'
        success_callback data, xhr
      return this

    .catch (error, xhr)->
      if typeof failed_callback is 'function'
        failed_callback error
      return this


  # define api resource
  api = options.apiBaseURL
  api_open = api + '/crm/entr/' + app_id
  api_member = api + '/crm/memb/' + app_id
  

  resources =
    request: do_request
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
      , success
      , failed
      
    recover_pwd: (data, success, failed)->
      do_request
        url: api_open + '/recover_pwd'
        type: 'POST'
        data: data
      , success
      , failed

    update_pwd: (data, success, failed)->
      do_request
        url: api_member + '/update_pwd'
        type: 'POST'
        data: data
      , success
      , failed
      
    logout: (data, success, failed)->
      do_request
        url: api_member + '/logout'
        type: 'GET'
        data: data
      , success
      , failed

    get_profile: (data, success, failed)->
      do_request
        url: api_member + '/profile'
        type: 'GET'
        data: data
      , success
      , failed

    update_profile: (data, success, failed)->
      do_request
        url: api_member + '/profile'
        type: 'PUT'
        data: data
      , success
      , failed

    free_apply: (data, success, failed)->
      do_request
        url: api_open + '/applyment'
        type: 'POST'
        data: data
      , success
      , failed

    make_apply: (data, success, failed)->
      do_request
        url: api_member + '/applyment'
        type: 'POST'
        data: data
      , success
      , failed
      
    get_apply: (data, success, failed)->
      do_request
        url: api_member + '/applyment'
        type: 'GET'
        data: data
      , success
      , failed
        
    delete_apply: (data, success, failed)->
      do_request
        url: api_member + '/applyment'
        type: 'DELETE'
        data: data
      , success
      , failed

  return resources
  
  


# Errors
InvalidRequestAPI = new Error('Request API is invaild.')
InvalidRequestType = new Error('Request Type is invaild.')
InvalidRequestData = new Error('Request Data is invaild.')
InvalidRequestParam = new Error('Request Param is invaild.')
ResouceNotFound = new Error('Resource Not Found.')


# AJAX
root.Ajax = ->
  promise_methods =
    then: ->
    catch: ->
    finally: ->

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
    
    xhr.addEventListener 'readystatechange', ready
    
    if type in ['GET', 'DELETE']
      xhr.send()
    else
      try
        send_data = JSON.stringify(request.data)
      catch error
        throw error
      xhr.send(send_data)

    return promises()


  ready = (e)->
    xhr = this
    if xhr.readyState == xhr.DONE
      xhr.removeEventListener 'readystatechange', ready
      promise_methods.finally.apply promise_methods, parse_response(xhr)
      if xhr.status >= 200 and xhr.status < 300
        return promise_methods.then.apply(promise_methods,
                                          parse_response(xhr))
      promise_methods.catch.apply(promise_methods,
                                  parse_response(xhr))
    return

  
  add_params = (url, params)->
    joint = if url.indexOf('?') > -1 then '&' else '?'
    if typeof params isnt 'object'
      return url
    for k, v of params
      url = url+joint+k+'='+v
      joint = '&' if joint != '&'
    return url
  
  parse_response = (xhr) ->
    result = undefined
    if xhr.responseType is 'json'
      result = xhr.response
    else
      try
        result = JSON.parse(xhr.responseText)
      catch e
        result = xhr.responseText
        
    return [result, xhr]

  promises = ->
    all_promises = {}
    Object.keys(promise_methods).forEach ((promise) ->
      all_promises[promise] = generate_promise.call(this, promise)
      return
    ), this
    return all_promises

  generate_promise = (method) ->
    (callback) ->
      promise_methods[method] = callback
      this

  return ajax

# Cookie
root.Cookie =
  set: (cname, cvalue, expires, path, domain) ->
    d = new Date()
    d.setTime(d.getTime()+expires)
    
    expires = if expires then 'expires='+d.toUTCString()+'; ' else ''
    path = if path then 'path='+path+'; ' else 'path=/; '
    domain = if domain then 'domain='+domain+'; ' else ''
    
    document.cookie = cname+'='+cvalue+'; '+expires+domian+path
  
  get: (cname) ->
    name = cname + '='
    ca = document.cookie.split(';')
    i = 0
    while i < ca.length
      c = ca[i]
      while c.charAt(0) == ' '
        c = c.substring(1)
      if c.indexOf(name) == 0
        return c.substring(name.length, c.length)
      i++
    return ''

  remove: (cname)->
    expires='expires=Thu, 01 Jan 1970 00:00:00 UTC; '
    path = if path then 'path='+path+'; ' else 'path=/; '
    domain = if domain then 'domain='+domain+'; ' else ''
    document.cookie = cname+'=; '+expires+domian+path
    