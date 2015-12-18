# -------------------------------
# Skipper - Soopro member system front-end.
# Version:  0.0.1
# -------------------------------
is_exports = typeof exports isnt "undefined" and exports isnt null
root = if is_exports then exports else this


default_options = 
  apiBaseURL: 'http://api.sup.farm'
  contentType: 'application/json'
  withCredentials: true
  
root.SupMember = (owner, app_id, opts) ->
  options = opts or default_options
  owner = owner or $('html').data('owner')
  cookie_domain = app_id or $('html').data('app')
      
  if typeof owner != 'string'
    console.error 'Owner not found!'
    return

  if typeof cookie_domain != 'string'
    console.error 'App not found!'
    return
  
  request_types = [
    'POST'
    'GET'
    'DELETE'
    'PUT'
  ]
  
  ajax = new Ajax()
  
  # define request function
  request = (request, success_callback, error_callback) ->
    if typeof request.api isnt 'string' or not request.api
      throw InvalidRequestAPI

    if request.type not in request_types
      throw InvalidRequestType

    res = resource[request.api]
    
    if not res
      throw ResouceNotFound

    if request.type not in ['GET', 'DELETE']
      try
        request_data = JSON.stringify(request.data)
      catch error
        throw error
    else
      request_data = null

    ajax.send
      type: request.type
      url: request.url
      params: request.params
      data: request_data
      contentType: request.contentType or options.contentType
      withCredentials: request.withCredentials or options.withCredentials
      headers: 'authorization': request.authorization
    
    .then (data, xhr)->
      if typeof success_callback is 'function'
        success_callback data, xhr
      console.log this
      return this

    .catch (error, xhr)->
      if typeof error_callback is 'function'
        error_callback error
      console.log this
      return this
  

  # define api resource
  api = options.apiBaseURL
  api_open = api + '/crm/entr/' + owner
  api_member = api + '/crm/memb/' + owner
  
  resources =
    register: (params, data)->
      request
        url: api_open + '/register'
        type: 'POST'
        data: data
        params: params
      
      
    join: (params, data)->
      request
        url: api_open + '/join'
        type: 'POST'
        data: data
        params: params
     

    login: (params, data)->
      request
        url: api_open + '/login'
        type: 'POST'
        data: data
        params: params
      
      
    recover_pwd: (params, data)->
      request
        url: api_open + '/recover_pwd'
        type: 'POST'
        data: data
        params: params
      

    update_pwd: (params, data)->
      request
        url: api_member + '/update_pwd'
        type: 'POST'
        data: data
        params: params
      
      
    logout: (params, data)->
      request
        url: api_member + '/logout'
        type: 'GET'
        data: data
        params: params
      

    get_profile: (params, data)->
      request
        url: api_member + '/profile'
        type: 'GET'
        data: data
        params: params
      

    update_profile: (params, data)->
      request
        url: api_member + '/profile'
        type: 'PUT'
        data: data
        params: params
        

    free_apply: (params, data)->
      request
        url: api_open + '/applyment'
        type: 'POST'
        data: data
        params: params
      

    make_apply: (params, data)->
      request
        url: api_member + '/applyment'
        type: 'POST'
        data: data
        params: params
        
    get_apply: (params, data)->
      request
        url: api_member + '/applyment'
        type: 'GET'
        data: data
        params: params
        
    delete_apply: (params, data)->
      request
        url: api_member + '/applyment'
        type: 'DELETE'
        data: data
        params: params

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

  request:
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
    xhr = new XMLHttpRequest
    url = add_params(request.url, request.params)
    
    xhr.open type, url or '', true

    xhr.setRequestHeader 'Content-Type', request.contentType
    for k,v of request.headers
      xhr.setRequestHeader k, v
    xhr.withCredentials = Boolean(request.withCredentials)
    xhr.addEventListener 'readystatechange', ready
    
    if type in ['GET', 'DELETE']
      xhr.send()
    else
      try
        send_data = JSON.stringify(data)
      catch error
        throw error
      xhr.send(send_data)

    return promises()


  ready = (e)->
    console.log e
    xhr = this
    if xhr.readyState == xhr.DONE
      xhr.removeEventListener 'readystatechange', ready
      promise_methods.always.apply promise_methods, parse_response(xhr)
      if xhr.status >= 200 and xhr.status < 300
        return promise_methods.done.apply(promise_methods,
                                          parse_response(xhr))
      promise_methods.error.apply(promise_methods,
                                  parse_response(xhr))
    return

  
  add_params = (url, params)->
    joint = if url.indexOf('?') > -1 then '&' else '?'
    for param in params
      url = url+joint+param
      joint = '&' if joint != '&'
    return url
  
  parse_response = (xhr) ->
    result = undefined
    try
      result = JSON.parse(xhr.responseText)
    catch e
      result = xhr.responseText
    [
      result
      xhr
    ]

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

  return request

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
    