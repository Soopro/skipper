# -------------------------------
# Skipper - Soopro member system front-end.
# -------------------------------
root = window

project =
  name: 'Skipper'
  version: '2.0.1'
  creator: [
    'Redyyu'
  ]

TOKEN_COOKIE = 'skipper_member_auth'
OPEN_ID_COOKIE = 'skipper_member_open_id'
PROFILE_COOKIE = 'skipper_member_profile'

EVENT_FORM_KYES = ['appointee', 'contact', 'date', 'location']

API_HOST = 'https://api.soopro.io/crm/external'


# --------------
# Main
# --------------
root.Skipper = (opts) ->

  # config
  default_conf =
    api_host: API_HOST
    contentType: 'application/json'
    responseType: 'json'
    withCredentials: false
    expires_in: 3600*24*30  # in second, 30 days.

  conf = default_conf
  for k, v of opts
    conf[k] = v

  if not conf.app_id
    throw 'app id is required!'
    return

  api_baseurl = conf.api_host + '/' + conf.app_id

  # define request
  ajax = new Ajax()
  request = (opts, success_callback, failed_callback) ->
    if not utils.isDict(opts.headers)
      opts.headers = {}
    if opts.token
      opts.headers['Authorization'] = 'Bearer '+opts.token

    if not opts.url
      opts.url = api_baseurl + opts.path

    resp = ajax.send
      type: opts.type
      url: opts.url
      params: opts.params
      data: opts.data
      contentType: opts.contentType or conf.contentType
      responseType: opts.responseType or conf.responseType
      withCredentials: opts.withCredentials or conf.withCredentials
      headers: opts.headers

    if typeof success_callback is 'function'
      resp.then (data)->
        try
          success_callback data
        catch e
          console.error e
        return data

    if typeof failed_callback is 'function'
      resp.catch (error)->
        try
          failed_callback error
        catch e
          console.error e
        return error

    return resp

  clean_cookies = ->
    try
      cookie.remove PROFILE_COOKIE
      cookie.remove TOKEN_COOKIE
      cookie.remove OPEN_ID_COOKIE
    catch e
      console.error e

  parse_mail_data = (form_data)->
    data = {}
    if utils.isDict(form_data.fields)
      for k, v of form_data.fields
        data[k] = v
    else if utils.isArray(form_data.fields)
      for field in form_data.fields
        key = field.name
        if data[key]
          if utils.isArray(data[key])
            data[key].push field.value
          else
            data[key] = [data[key], field.value]
        else
          data[key] = field.value
    return data


  parse_appt_data = (form_data)->
    data =
      event_slug: form_data.action
      meta: {}
    if utils.isDict(form_data.fields)
      for k, v of form_data.fields
        if k in EVENT_FORM_KYES
          data[k] = v
        else
          data.meta[k] = v
    else if utils.isArray(form_data.fields)
      for field in form_data.fields
        key = field.name
        if key in EVENT_FORM_KYES
          data[key] = field.value
        else
          if data.meta[key]
            if utils.isArray(data.meta[key])
              data.meta[key].push field.value
            else
              _value = data.meta[key]
              data.meta[key] = [_value, field.value]
          else
            data.meta[key] = field.value
    return data

  # define api resource
  resource =
    token: (token)->
      if token in [null, false]
        try
          cookie.remove TOKEN_COOKIE
        catch e
          console.error e
          return false

      else if token
        try
          cookie.set TOKEN_COOKIE, token, conf.expires_in
        catch e
          console.error e
          return false

      return cookie.get TOKEN_COOKIE


    open_id: (open_id)->
      if open_id in [null, false]
        try
          cookie.remove OPEN_ID_COOKIE
        catch e
          console.error e
          return false

      else if open_id
        try
          cookie.set OPEN_ID_COOKIE, open_id, conf.expires_in
        catch e
          console.error e
          return false

      return cookie.get OPEN_ID_COOKIE


    login: (data, success, failed)->
      request
        path: '/login'
        type: 'POST'
        data: data
      , (data)->
        try
          cookie.set TOKEN_COOKIE, data.token, conf.expires_in
          cookie.set OPEN_ID_COOKIE, data.open_id, conf.expires_in
        catch e
          console.error e
        if utils.isFunction(success)
          success(data)
      , failed

    logout: (success, failed)->
      request
        path: '/logout'
        type: 'GET'
        token: cookie.get TOKEN_COOKIE
      , (data)->
        clean_cookies()
        if utils.isFunction(success)
          success(data)
      , (error)->
        clean_cookies()
        if utils.isFunction(failed)
          failed(data)

    register: (data, success, failed)->
      request
        path: '/register'
        type: 'POST'
        data: data
      , success
      , failed

    security:
      pwd: (data, success, failed)->
        request
          path: '/security/pwd'
          type: 'PUT'
          data: data
          token: cookie.get TOKEN_COOKIE
        , (data)->
          try
            cookie.set TOKEN_COOKIE, data.token, conf.expires_in
            cookie.set OPEN_ID_COOKIE, data.open_id, conf.expires_in
          catch e
            console.error e
          if utils.isFunction(success)
            success(data)
        , failed

    profile:
      get: (success, failed)->
        profile = cookie.get PROFILE_COOKIE
        if profile
          promise = Promise.resolve(profile)
          if utils.isFunction(success)
            promise.then (data)->
              success data
              return data
          return promise
        else
          request
            path: '/profile'
            type: 'GET'
            token: cookie.get TOKEN_COOKIE
          , (data)->
            try
              cookie.set PROFILE_COOKIE, data, conf.expires_in
            catch e
              console.error e
            if utils.isFunction(success)
              success(data)
          , failed

      update: (data, success, failed)->
        request
          path: '/profile'
          type: 'PUT'
          data: data
          token: cookie.get TOKEN_COOKIE
        , (data)->
          try
            cookie.set PROFILE_COOKIE, data, conf.expires_in
          catch e
            console.error e
          if utils.isFunction(success)
            success(data)
        , failed

      clear: ->
        try
          cookie.remove PROFILE_COOKIE
          return true
        catch e
          console.error e
          return false

    mailto: (form_data)->
      _mailto = ->
        action = form_data.action.split("?")[0].split('#')[0]
        if action.toLowerCase().indexOf('mailto:') != 0
          action = 'mailto:' + action
        subject = form_data.title or ''
        mail_content = ''

        for k, v of parse_mail_data(form_data)
          _value = if utils.isArray(v) then v.join(', ') else v
          mail_content = mail_content+k+': '+_value+'\n'

        mail_content = encodeURIComponent(mail_content)
        return action+'?subject='+subject+'&body='+mail_content

      promise = new Promise (resolve, reject)->
        try
          resolve(_mailto())
        catch e
          reject(e)

      return promise

    appointment:
      query: (success, failed)->
        request
          path: '/appointment'
          type: 'GET'
          token: cookie.get TOKEN_COOKIE
        , success
        , failed

      create: (form_data, success, failed)->
        request
          path: '/appointment'
          type: 'POST'
          data: parse_appt_data(form_data)
          token: cookie.get TOKEN_COOKIE
        , success
        , failed

      remove: (appt_id, success, failed)->
        request
          path: '/appointment/' + appt_id
          type: 'DELETE'
          token: cookie.get TOKEN_COOKIE
        , success
        , failed

  return resource


# --------------
# Aide
# --------------

# Promise
if not Promise.prototype['finally']
  Promise.prototype['finally'] = (callback) ->
    constructor = @constructor
    @then ((value) ->
      constructor.resolve(callback()).then ->
        value
    ), (reason) ->
      constructor.resolve(callback()).then ->
        throw reason
        return

# utils
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
    return {key: value}

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
      if v isnt null and typeof v is 'object' and typeof v.length is 'number'
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

  # --- str ---
  startswith: (str, text) ->
    if typeof(str) isnt 'string' or typeof(text) isnt 'string'
      return null
    return str.indexOf(text) is 0

  endswith: (str, text) ->
    if typeof(str) isnt 'string' or typeof(text) isnt 'string'
      return null
    return str.substr(str.length - text.length) == text

  # --- browser ---
  in_wechat: ->
    try
      user_agent = root.navigator.userAgent or ''
    catch
      user_agent = ''
    return user_agent.indexOf('MicroMessenger') >= 0

  # --- is ---
  isNode: (o) ->
    if typeof Node == 'object'
      return o instanceof Node
    else if o and typeof o == 'object'
      return (typeof o.nodeType == 'number' and typeof o.nodeName == 'string')
    else
      return false

  isElement: (o) ->
    if typeof HTMLElement == 'object'
      return o instanceof HTMLElement
    else if o and typeof o == 'object' and o != null
      return (o.nodeType == 1 and typeof o.nodeName == 'string')
    else
      return false

  isUrl: (str)->
    if typeof(url) isnt 'string'
      return false
    regex = /^([\w]+:)?\/\/[a-zA-Z0-9]/i
    return url.match(regex)

  isArray: (obj) ->
    return Array.isArray(obj)

  isDict: (obj)->
    return typeof(obj) is 'object' and not Array.isArray(obj)

  isFunction: (obj)->
    return typeof(obj) is 'function'


# cookie
cookie =
  set: (cname, cvalue, expires_in, path, domain) ->
    expires_in = expires_in * 1000  # to js timestamp, 13d.
    cvalue = JSON.stringify({value: cvalue})
    d = new Date()
    d.setTime(d.getTime()+expires_in)
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
        try
          obj = JSON.parse(value)
          return obj.value
        catch
          return value
      i++
    return null

  remove: (cname)->
    expires='expires=Thu, 01 Jan 1970 00:00:00 UTC; '
    path = if path then 'path='+path+'; ' else 'path=/; '
    domain = if domain then 'domain='+domain+'; ' else ''
    document.cookie = cname+'=; '+expires+domain+path


# ajax
Ajax = ->
  ajax =
    get: (opts) ->
      XHRConnection 'GET', opts
    post: (opts) ->
      XHRConnection 'POST', opts
    update: (opts) ->
      XHRConnection 'PUT', opts
    remove: (opts) ->
      XHRConnection 'DELETE', opts
    send: (opts) ->
      XHRConnection opts.type, opts


  XHRConnection = (type, opts) ->
    xhr = new XMLHttpRequest()
    url = utils.addParam(opts.url, opts.params)

    xhr.open(type, url, true)

    xhr.responseType = opts.responseType or 'json'
    xhr.withCredentials = Boolean(opts.withCredentials)

    xhr.setRequestHeader 'Content-Type', opts.contentType
    xhr.setRequestHeader 'X-Requested-With', 'XMLHttpRequest'

    if typeof opts.headers is 'object'
      for k, v of opts.headers
        xhr.setRequestHeader k, v

    promise = new Promise (resolve, reject)->
      ready = (e)->
        xhr = this
        if xhr.readyState == xhr.DONE
          xhr.removeEventListener 'readystatechange', ready
          result = parse_response(xhr)
          if xhr.status >= 200 and xhr.status < 399
            resolve(result.data)
          else
            reject(result)

      xhr.addEventListener 'readystatechange', ready

    # send
    if type in ['GET', 'DELETE']
      xhr.send()
    else
      send_data = JSON.stringify(opts.data or {})
      xhr.send(send_data)

    return promise


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


# expose attributes
Skipper.utils = utils
Skipper.version = project.version
