# -------------------------------
# Skipper - Cookie
# -------------------------------

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

CookieStorage =
  set: (cname, cvalue, expires, path, domain) ->
    cvalue = JSON.stringify({value: cvalue})
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
