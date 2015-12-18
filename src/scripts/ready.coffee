ready = ->
  if !readyFired
    # this must be set to true before we start calling callbacks
    readyFired = true
    i = 0
    while i < readyList.length
      readyList[i].fn.call window, readyList[i].ctx
      i++
    # allow any closures held by these functions to free
    readyList = []
  return

readyStateChange = ->
  if document.readyState == 'complete'
    ready()
  return

funcName = 'docReady'
baseObj = window
readyList = []
readyFired = false
readyEventHandlersInstalled = false


window.document.ready = (callback, context) ->
  # if ready has already fired, then just schedule the callback
  # to fire asynchronously, but right away
  if readyFired
    setTimeout ->
      callback context
      return
    , 1
    return
  else
    # add the function and context to the list
    readyList.push
      fn: callback
      ctx: context

  # if document already ready to go, schedule the ready function to run
  if document.readyState == 'complete'
    setTimeout ready, 1
  else if !readyEventHandlersInstalled
    # otherwise if we don't have event handlers installed, install them
    if document.addEventListener
      # first choice is DOMContentLoaded event
      document.addEventListener 'DOMContentLoaded', ready, false
      # backup is window load event
      window.addEventListener 'load', ready, false
    else
      # must be IE
      document.attachEvent 'onreadystatechange', readyStateChange
      window.attachEvent 'onload', ready
    readyEventHandlersInstalled = true
  return

