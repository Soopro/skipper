# -------------------------------
# Skipper - Soopro member system front-end.
# -------------------------------
is_exports = typeof exports isnt "undefined" and exports isnt null
root = if is_exports then exports else this

version = '1.1.0'

TOKEN_COOKIE_NAME = 'sup_member_auth'
PROFILE_COOKIE_NAME = 'sup_member_profile'
WX_OPEN_SID_COOKIE_NAME = 'sup_wx_open_sid'
WX_LINK_COOKIE_NAME = 'sup_wx_link'

WX_OPEN_SID = 'wx_open_sid'

Q = root.Q.noConflict()

utils =
  setParam: (key, value) ->
    key = encodeURIComponent(key)
    value = encodeURIComponent(value)
    s = document.location.search
    kvp = key + '=' + value
    r = new RegExp('(&|\\?)' + key + '=[^&]*')
    s = s.replace(r, '$1' + kvp)
    if !RegExp.$1
      s += (if s.length > 0 then '&' else '?') + kvp
    document.location.search = s
    return {key, value}
  
  addParam: (url, params)->
    if typeof params isnt 'object'
      return url
    _add = (url, key, value)->
      joint = if url.indexOf('?') > -1 then '&' else '?'
      key = encodeURIComponent(key)
      value = encodeURIComponent(value)
      url = url+joint+key+'='+value
      return url

    for k, v of params
      if typeof v is 'object' and typeof v.length is 'number'
        for item in v
          url = _add(url, k, item)
      else  
        url = _add(url, k, v)

    return url
  
  getParam: (key) ->
    query_args = {}
    query = window.location.search.substring(1)
    vars = query.split('&')
    i = 0
    while i < vars.length
      pair = vars[i].split('=')
      # If first entry with this name
      if typeof query_args[pair[0]] == 'undefined'
        query_args[pair[0]] = decodeURIComponent(pair[1])
        # If second entry with this name
      else if typeof query_args[pair[0]] == 'string'
        arr = [
          query_args[pair[0]]
          decodeURIComponent(pair[1])
        ]
        query_args[pair[0]] = arr
        # If third or later entry with this name
      else
        query_args[pair[0]].push decodeURIComponent(pair[1])
      i++

    if key
      return query_args[key]
    else
      return query_args


default_options = 
  apiBaseURL: 'http://api.soopro.com'
  contentType: 'application/json'
  responseType: 'json'
  withCredentials: false
  expires: 1000*3600*24
  
root.SupMember = (opts) ->
  options = default_options
  for k,v of opts
    options[k] = v
  
  if options.app_id
    app_id = options.app_id
  
  if not app_id
    html = document.documentElement
    app_id = (html.getAttribute('app') or html.dataset.app)
  
  if not app_id
    metas = document.getElementsByTagName('meta')
    for meta in metas
      if meta.getAttribute("name") == "app_id"
        app_id = meta.getAttribute("content")
        break
    
  if typeof app_id != 'string' or not app_id
    throw 'App not found!'
    return
  
  request_types = [
    'POST'
    'GET'
    'DELETE'
    'PUT'
  ]
  
  
  # process wx member link
  wx_open_sid = utils.getParam(WX_OPEN_SID)

  if wx_open_sid
    try
      supCookie.set WX_OPEN_SID_COOKIE_NAME, wx_open_sid, options.expires
    catch e
      console.error e
  else
    wx_open_sid = supCookie.get WX_OPEN_SID_COOKIE_NAME
      
  # define request function
  ajax = new Ajax()
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
        try
          success_callback data
        catch e
          console.error e
        return data

    if typeof failed_callback is 'function'
      response.catch (error)->
        try
          failed_callback error
        catch e
          console.error e
        return error

    return response
  
  # define api resource
  api = options.apiBaseURL
  api_open = api + '/crm/entr/' + app_id + '/visitor'
  api_member = api + '/crm/entr/' + app_id + '/member'
  api_wx_link = api+'/wx/link_member'

  member =
    request: (request, success, failed)->
      do_request request
      , success
      , failed

    login: (data, success, failed)->
      do_request
        url: api_open + '/login'
        type: 'POST'
        data: data
      , (data)->
        try
          supCookie.set TOKEN_COOKIE_NAME, data.token, options.expires
        catch e
          console.error e
        if typeof success is 'function'
          success(data)
      , failed
    
    logout: (success, failed)->
      clean_cookies = ->
        try
          supCookie.remove PROFILE_COOKIE_NAME
          supCookie.remove TOKEN_COOKIE_NAME
          supCookie.remove WX_OPEN_SID_COOKIE_NAME
          supCookie.remove WX_LINK_COOKIE_NAME
        catch e
          console.error e
          
      do_request
        url: api_member + '/logout'
        type: 'GET'
        token: supCookie.get TOKEN_COOKIE_NAME
      , (data)->
        clean_cookies()
        if typeof success is 'function'
          success(data)
      , (error)->
        clean_cookies()
        if typeof failed is 'function'
          failed(data)

    register:
      check: (data, success, failed)->
        do_request
          url: api_open + '/check'
          type: 'POST'
          data: data
        , success
        , failed

      create: (data, success, failed)->
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
    
    pwd:
      # recovery: (data, success, failed)->
      #   do_request
      #     url: api_open + '/recover_pwd'
      #     type: 'POST'
      #     data: data
      #   , success
      #   , failed
      #
      # reset: (data, success, failed)->
      #   do_request
      #     url: api_open + '/reset_pwd'
      #     type: 'POST'
      #     data: data
      #   , success
      #   , failed
    
      update: (data, success, failed)->
        do_request
          url: api_member + '/update_pwd'
          type: 'POST'
          data: data
          token: supCookie.get TOKEN_COOKIE_NAME
        , success
        , failed


    profile:
      get: (success, failed)->
        profile = supCookie.get PROFILE_COOKIE_NAME
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
            token: supCookie.get TOKEN_COOKIE_NAME
          , (data)->
            try
              supCookie.set PROFILE_COOKIE_NAME, data, options.expires
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
          token: supCookie.get TOKEN_COOKIE_NAME
        , (data)->
          try
            supCookie.set PROFILE_COOKIE_NAME, data, options.expires
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
      get: (key, success, failed)->
        do_request
          url: api_open + '/activity/' + key
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
          token: supCookie.get TOKEN_COOKIE_NAME
        , success
        , failed
      
      create: (data, success, failed)->
        do_request
          url: api_member + '/applyment'
          type: 'POST'
          data: data
          token: supCookie.get TOKEN_COOKIE_NAME
        , success
        , failed
      
      remove: (key, success, failed)->
        do_request
          url: api_member + '/applyment/' + key
          type: 'DELETE'
          token: supCookie.get TOKEN_COOKIE_NAME
        , success
        , failed
    
    wxlink:
      open_sid: ->
        return supCookie.get WX_OPEN_SID_COOKIE_NAME
      login: (success, failed)->
        wx_open_sid = supCookie.get WX_OPEN_SID_COOKIE_NAME
        do_request
          url: api_wx_link+'/'+wx_open_sid
          type: 'GET'
        , (data)->
          try
            supCookie.set WX_LINK_COOKIE_NAME, data, options.expires
          catch e
            console.error e
          if data.token
            try
              supCookie.set TOKEN_COOKIE_NAME, data.token, options.expires
            catch e
              console.error e
          if typeof success is 'function'
            success(data)
        , failed
      get: (success, failed)->
        wx_link = supCookie.get WX_LINK_COOKIE_NAME
        if wx_link
          deferred = Q.defer()
          deferred.resolve(wx_link)
          if typeof success is 'function'
            deferred.promise.then (data)->
              success data
              return data
          return deferred.promise
        else
          wx_open_sid = supCookie.get WX_OPEN_SID_COOKIE_NAME
          do_request
            url: api_wx_link+'/'+wx_open_sid
            type: 'GET'
          , (data)->
            try
              supCookie.set WX_LINK_COOKIE_NAME, data, options.expires
            catch e
              console.error e
            if typeof success is 'function'
              success(data)
          , failed
      unlink: (success, failed)->
        wx_open_sid = supCookie.get WX_OPEN_SID_COOKIE_NAME
        do_request
          url: api_wx_link+'/'+wx_open_sid
          type: 'DELETE'
          token: supCookie.get TOKEN_COOKIE_NAME
        , (data)->
            try
              supCookie.remove WX_LINK_COOKIE_NAME
            catch e
              console.error e
            if typeof success is 'function'
              success(data)
        , failed
      link: (success, failed)->
        wx_open_sid = supCookie.get WX_OPEN_SID_COOKIE_NAME
        do_request
          url: api_wx_link
          type: 'POST'
          data: 
            open_sid: wx_open_sid
          token: supCookie.get TOKEN_COOKIE_NAME
        , (data)->
            try
              supCookie.set WX_LINK_COOKIE_NAME, data, options.expires
            catch e
              console.error e
            if typeof success is 'function'
              success(data)
        , failed

    token: ->
      return supCookie.get TOKEN_COOKIE_NAME
    set_token: (token)->
      if not token
        return false
      try
        supCookie.set TOKEN_COOKIE_NAME, data.token, options.expires
      catch e
        console.error e
        return false
      return true
      
    utils: utils
    version: version
  return member


# Errors
InvalidRequestAPI = new Error('Request API is invaild.')
InvalidRequestType = new Error('Request Type is invaild.')
InvalidRequestData = new Error('Request Data is invaild.')
InvalidRequestParam = new Error('Request Param is invaild.')
ResouceNotFound = new Error('Resource Not Found.')


# AJAX
Ajax = ->
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
    url = utils.addParam(request.url, request.params)

    xhr.open type, url or '', true

    xhr.responseType = request.responseType
    xhr.withCredentials = Boolean(request.withCredentials)

    xhr.setRequestHeader 'Content-Type', request.contentType
    xhr.setRequestHeader 'X-Requested-With', 'XMLHttpRequest'
    
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
        send_data = JSON.stringify(request.data or {})
      catch error
        throw error

      xhr.send(send_data)

    return deferred.promise

  
  parse_response = (xhr, headers) ->
    if xhr.responseType is 'json'
      data = xhr.response
    else if xhr.responseType in ['blob', 'arraybuffer']
      data = xhr.response
    else if xhr.responseType is 'document'
      data = xhr.responseXML
    else if xhr.responseType in ['', 'text']
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
    return null

  remove: (cname)->
    expires='expires=Thu, 01 Jan 1970 00:00:00 UTC; '
    path = if path then 'path='+path+'; ' else 'path=/; '
    domain = if domain then 'domain='+domain+'; ' else ''
    document.cookie = cname+'=; '+expires+domain+path