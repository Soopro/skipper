# -------------------------------
# Skipper - AJAX
# -------------------------------

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
      send_data = JSON.stringify(request.data or {})
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
