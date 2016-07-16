// Generated by CoffeeScript 1.10.0
(function() {
  var Ajax, InvalidRequestAPI, InvalidRequestData, InvalidRequestParam, InvalidRequestType, OPEN_ID_COOKIE, PARAM_WX_OPEN_SID, PROFILE_COOKIE, Q, ResouceNotFound, TOKEN_COOKIE, WX_LINK_COOKIE, WX_OPEN_SID_COOKIE, default_options, is_exports, procces_cookie_input, procces_cookie_output, root, supCookie, utils, version;

  is_exports = typeof exports !== "undefined" && exports !== null;

  root = is_exports ? exports : this;

  version = '1.4.1';

  TOKEN_COOKIE = 'sup_member_auth';

  OPEN_ID_COOKIE = 'sup_member_open_id';

  PROFILE_COOKIE = 'sup_member_profile';

  WX_OPEN_SID_COOKIE = 'sup_wx_open_sid';

  WX_LINK_COOKIE = 'sup_wx_link';

  PARAM_WX_OPEN_SID = 'wx_open_sid';

  Q = root.Q.noConflict();

  utils = {
    setParam: function(key, value) {
      var kvp, r, s;
      key = encodeURIComponent(key);
      value = encodeURIComponent(value);
      s = document.location.search;
      kvp = key + '=' + value;
      r = new RegExp('(&|\\?)' + key + '=[^&]*');
      s = s.replace(r, '$1' + kvp);
      if (!RegExp.$1) {
        s += (s.length > 0 ? '&' : '?') + kvp;
      }
      document.location.search = s;
      return {
        key: key,
        value: value
      };
    },
    addParam: function(url, params) {
      var _add, item, j, k, len, v;
      if (typeof params !== 'object') {
        return url;
      }
      _add = function(url, key, value) {
        var joint;
        joint = url.indexOf('?') > -1 ? '&' : '?';
        key = encodeURIComponent(key);
        value = encodeURIComponent(value);
        url = url + joint + key + '=' + value;
        return url;
      };
      for (k in params) {
        v = params[k];
        if (v !== null && typeof v === 'object' && typeof v.length === 'number') {
          for (j = 0, len = v.length; j < len; j++) {
            item = v[j];
            url = _add(url, k, item);
          }
        } else {
          url = _add(url, k, v);
        }
      }
      return url;
    },
    getParam: function(key) {
      var arr, i, pair, query, query_args, vars;
      query_args = {};
      query = window.location.search.substring(1);
      vars = query.split('&');
      i = 0;
      while (i < vars.length) {
        pair = vars[i].split('=');
        if (typeof query_args[pair[0]] === 'undefined') {
          query_args[pair[0]] = decodeURIComponent(pair[1]);
        } else if (typeof query_args[pair[0]] === 'string') {
          arr = [query_args[pair[0]], decodeURIComponent(pair[1])];
          query_args[pair[0]] = arr;
        } else {
          query_args[pair[0]].push(decodeURIComponent(pair[1]));
        }
        i++;
      }
      if (key) {
        return query_args[key];
      } else {
        return query_args;
      }
    },
    isNode: function(o) {
      if (typeof Node === 'object') {
        return o instanceof Node;
      } else if (o && typeof o === 'object') {
        return typeof o.nodeType === 'number' && typeof o.nodeName === 'string';
      } else {
        return false;
      }
    },
    isElement: function(o) {
      if (typeof HTMLElement === 'object') {
        return o instanceof HTMLElement;
      } else if (o && typeof o === 'object' && o !== null) {
        return o.nodeType === 1 && typeof o.nodeName === 'string';
      } else {
        return false;
      }
    }
  };

  default_options = {
    apiBaseURL: 'http://api.soopro.com',
    contentType: 'application/json',
    responseType: 'json',
    withCredentials: false,
    expires: 1000 * 3600 * 24
  };

  root.Skipper = function(opts) {
    var ajax, api, api_member, api_open, api_wx_link, app_id, clean_cookies, do_request, e, error1, html, j, k, len, member, meta, metas, options, v, wx_open_sid;
    options = default_options;
    for (k in opts) {
      v = opts[k];
      options[k] = v;
    }
    if (options.app_id) {
      app_id = options.app_id;
    }
    if (!app_id) {
      html = document.documentElement;
      app_id = html.getAttribute('app') || html.dataset.app;
    }
    if (!app_id) {
      metas = document.getElementsByTagName('meta');
      for (j = 0, len = metas.length; j < len; j++) {
        meta = metas[j];
        if (meta.getAttribute("name") === "app_id") {
          app_id = meta.getAttribute("content");
          break;
        }
      }
    }
    if (typeof app_id !== 'string' || !app_id) {
      throw 'App not found!';
      return;
    }
    wx_open_sid = utils.getParam(PARAM_WX_OPEN_SID);
    if (wx_open_sid) {
      try {
        supCookie.set(WX_OPEN_SID_COOKIE, wx_open_sid, options.expires);
      } catch (error1) {
        e = error1;
        console.error(e);
      }
    } else {
      wx_open_sid = supCookie.get(WX_OPEN_SID_COOKIE);
    }
    ajax = new Ajax();
    do_request = function(request, success_callback, failed_callback) {
      var response;
      if (typeof request.headers !== 'object') {
        request.headers = {};
      }
      if (request.token) {
        request.headers['Authorization'] = 'Bearer ' + request.token;
      }
      response = ajax.send({
        type: request.type,
        url: request.url,
        params: request.params,
        data: request.data,
        contentType: request.contentType || options.contentType,
        responseType: request.responseType || options.responseType,
        withCredentials: request.withCredentials || options.withCredentials,
        headers: request.headers
      });
      if (typeof success_callback === 'function') {
        response.then(function(data) {
          var error2;
          try {
            success_callback(data);
          } catch (error2) {
            e = error2;
            console.error(e);
          }
          return data;
        });
      }
      if (typeof failed_callback === 'function') {
        response["catch"](function(error) {
          var error2;
          try {
            failed_callback(error);
          } catch (error2) {
            e = error2;
            console.error(e);
          }
          return error;
        });
      }
      return response;
    };
    clean_cookies = function() {
      var error2;
      try {
        supCookie.remove(PROFILE_COOKIE);
        supCookie.remove(TOKEN_COOKIE);
        supCookie.remove(OPEN_ID_COOKIE);
        supCookie.remove(WX_OPEN_SID_COOKIE);
        return supCookie.remove(WX_LINK_COOKIE);
      } catch (error2) {
        e = error2;
        return console.error(e);
      }
    };
    api = options.apiBaseURL;
    api_open = api + '/crm/entr/' + app_id + '/visitor';
    api_member = api + '/crm/entr/' + app_id + '/member';
    api_wx_link = api + '/wx/link_member';
    member = {
      request: function(request, success, failed) {
        return do_request(request, success, failed);
      },
      login: function(data, success, failed) {
        return do_request({
          url: api_open + '/login',
          type: 'POST',
          data: data
        }, function(data) {
          var error2;
          try {
            supCookie.set(TOKEN_COOKIE, data.token, options.expires);
            supCookie.set(OPEN_ID_COOKIE, data.open_id, options.expires);
          } catch (error2) {
            e = error2;
            console.error(e);
          }
          if (typeof success === 'function') {
            return success(data);
          }
        }, failed);
      },
      logout: function(success, failed) {
        return do_request({
          url: api_member + '/logout',
          type: 'GET',
          token: supCookie.get(TOKEN_COOKIE)
        }, function(data) {
          clean_cookies();
          if (typeof success === 'function') {
            return success(data);
          }
        }, function(error) {
          clean_cookies();
          if (typeof failed === 'function') {
            return failed(data);
          }
        });
      },
      register: function(data, success, failed) {
        return do_request({
          url: api_open + '/register',
          type: 'POST',
          data: data
        }, success, failed);
      },
      pwd: function(data, success, failed) {
        return do_request({
          url: api_member + '/update_pwd',
          type: 'POST',
          data: data,
          token: supCookie.get(TOKEN_COOKIE)
        }, function(data) {
          var error2;
          try {
            supCookie.set(TOKEN_COOKIE, data.token, options.expires);
          } catch (error2) {
            e = error2;
            console.error(e);
          }
          if (typeof success === 'function') {
            return success(data);
          }
        }, failed);
      },
      profile: {
        get: function(success, failed) {
          var deferred, profile;
          profile = supCookie.get(PROFILE_COOKIE);
          if (profile) {
            deferred = Q.defer();
            deferred.resolve(profile);
            if (typeof success === 'function') {
              deferred.promise.then(function(data) {
                success(data);
                return data;
              });
            }
            return deferred.promise;
          } else {
            return do_request({
              url: api_member + '/profile',
              type: 'GET',
              token: supCookie.get(TOKEN_COOKIE)
            }, function(data) {
              var error2;
              try {
                supCookie.set(PROFILE_COOKIE, data, options.expires);
              } catch (error2) {
                e = error2;
                console.error(e);
              }
              if (typeof success === 'function') {
                return success(data);
              }
            }, failed);
          }
        },
        update: function(data, success, failed) {
          return do_request({
            url: api_member + '/profile',
            type: 'PUT',
            data: data,
            token: supCookie.get(TOKEN_COOKIE)
          }, function(data) {
            var error2;
            try {
              supCookie.set(PROFILE_COOKIE, data, options.expires);
            } catch (error2) {
              e = error2;
              console.error(e);
            }
            if (typeof success === 'function') {
              return success(data);
            }
          }, failed);
        },
        clean: function() {
          var error2;
          try {
            supCookie.remove(PROFILE_COOKIE);
            return true;
          } catch (error2) {
            e = error2;
            console.error(e);
            return false;
          }
        }
      },
      parse_form: function(form_element) {
        var _get_field, action, data, data_fields, elem, elems, error2, invalid_fields, l, len1, len2, len3, m, msg, msgs, n, status;
        try {
          action = form_element.action || form_element.getAttribute('action');
          action = action.trim();
          if (typeof action !== 'string' || !action) {
            throw 'Form action not found!';
          }
          elems = form_element.querySelectorAll('[field]');
        } catch (error2) {
          e = error2;
          console.error(e);
          return false;
        }
        _get_field = function(el) {
          var checked, field_type, item, label, name, opt, value;
          name = el.getAttribute('name') || Date.now().toString();
          label = el.getAttribute('label') || '';
          field_type = el.getAttribute('field');
          if (field_type === 'select') {
            value = el.options[el.selectedIndex || 0].value;
          } else if (field_type === 'multi-select') {
            value = (function() {
              var l, len1, ref, results;
              ref = el.options;
              results = [];
              for (l = 0, len1 = ref.length; l < len1; l++) {
                opt = ref[l];
                if (opt.selected) {
                  results.push(opt.value || opt.text);
                }
              }
              return results;
            })();
          } else if (field_type === 'radio' || field_type === 'checkbox') {
            checked = el.querySelectorAll(':checked');
            if (checked.length > 1) {
              value = (function() {
                var l, len1, results;
                results = [];
                for (l = 0, len1 = checked.length; l < len1; l++) {
                  item = checked[l];
                  results.push(item.value);
                }
                return results;
              })();
            } else if (checked.length === 1) {
              value = checked[0].value;
            } else {
              value = void 0;
            }
          } else {
            value = el.value || el.text;
          }
          return {
            "name": name.trim(),
            "label": label.trim(),
            "value": value || ''
          };
        };
        invalid_fields = [];
        data_fields = [];
        for (l = 0, len1 = elems.length; l < len1; l++) {
          elem = elems[l];
          data = _get_field(elem);
          msgs = form_element.querySelectorAll('[messages][for="' + data.name + '"], .messages[for="' + data.name + '"]');
          for (m = 0, len2 = msgs.length; m < len2; m++) {
            msg = msgs[m];
            msg.style.display = 'none';
          }
          if (elem.hasAttribute('required') && data.value.length <= 0) {
            for (n = 0, len3 = msgs.length; n < len3; n++) {
              msg = msgs[n];
              msg.style.display = 'block';
            }
            invalid_fields.push(data);
          }
          data_fields.push(data);
        }
        status = invalid_fields.length > 0 ? 0 : 1;
        return {
          "action": action,
          "fields": status ? data_fields : invalid_fields,
          "status": status
        };
      },
      mailto: function(data) {
        var action, field, l, len1, mail_content, mail_data, ref, subject;
        action = data.action.split("?")[0].split('#')[0];
        subject = '';
        mail_content = '';
        ref = data.fields || [];
        for (l = 0, len1 = ref.length; l < len1; l++) {
          field = ref[l];
          if (field.name === 'subject') {
            subject = field.value;
          } else {
            mail_content = mail_content + field.label + ': ' + field.value + '\n';
          }
        }
        mail_content = encodeURIComponent(mail_content) || '';
        mail_data = action + '?subject=' + subject + '&body=' + mail_content;
        return mail_data;
      },
      demand: {
        free: function(data, success, failed) {
          var event_slug, field, fields, l, len1, ref, subject;
          subject = '';
          event_slug = data.action;
          fields = [];
          ref = data.fields || [];
          for (l = 0, len1 = ref.length; l < len1; l++) {
            field = ref[l];
            if (field.name === 'subject') {
              subject = field.value;
            } else {
              fields.push(field);
            }
          }
          return do_request({
            url: api_open + '/demand',
            type: 'POST',
            data: {
              event_slug: event_slug,
              subject: subject,
              fields: fields
            }
          }, success, failed);
        },
        query: function(success, failed) {
          return do_request({
            url: api_member + '/demand',
            type: 'GET',
            token: supCookie.get(TOKEN_COOKIE)
          }, success, failed);
        },
        create: function(data, success, failed) {
          var event_slug, field, fields, l, len1, ref, subject;
          subject = '';
          event_slug = data.action;
          fields = [];
          ref = data.fields || [];
          for (l = 0, len1 = ref.length; l < len1; l++) {
            field = ref[l];
            if (field.name === 'subject') {
              subject = field.value;
            } else {
              fields.push(field);
            }
          }
          return do_request({
            url: api_member + '/demand',
            type: 'POST',
            data: {
              event_slug: event_slug,
              subject: subject,
              fields: fields
            },
            token: supCookie.get(TOKEN_COOKIE)
          }, success, failed);
        },
        remove: function(key, success, failed) {
          return do_request({
            url: api_member + '/demand/' + key,
            type: 'DELETE',
            token: supCookie.get(TOKEN_COOKIE)
          }, success, failed);
        }
      },
      wxlink: {
        open_sid: function() {
          return supCookie.get(WX_OPEN_SID_COOKIE);
        },
        login: function(success, failed) {
          wx_open_sid = supCookie.get(WX_OPEN_SID_COOKIE);
          return do_request({
            url: api_wx_link + '/' + wx_open_sid,
            type: 'GET'
          }, function(data) {
            var error2, error3;
            try {
              supCookie.set(WX_LINK_COOKIE, data, options.expires);
            } catch (error2) {
              e = error2;
              console.error(e);
            }
            if (data.token) {
              try {
                supCookie.set(TOKEN_COOKIE, data.token, options.expires);
                supCookie.set(OPEN_ID_COOKIE, data.open_id, options.expires);
              } catch (error3) {
                e = error3;
                console.error(e);
              }
            }
            if (typeof success === 'function') {
              return success(data);
            }
          }, function(error) {
            var error2;
            try {
              supCookie.remove(WX_OPEN_SID_COOKIE);
            } catch (error2) {
              e = error2;
              console.error(e);
            }
            if (typeof failed === 'function') {
              return failed(error);
            }
          });
        },
        get: function(success, failed) {
          var deferred, wx_link;
          wx_link = supCookie.get(WX_LINK_COOKIE);
          if (wx_link) {
            deferred = Q.defer();
            deferred.resolve(wx_link);
            if (typeof success === 'function') {
              deferred.promise.then(function(data) {
                success(data);
                return data;
              });
            }
            return deferred.promise;
          } else {
            wx_open_sid = supCookie.get(WX_OPEN_SID_COOKIE);
            return do_request({
              url: api_wx_link + '/' + wx_open_sid,
              type: 'GET'
            }, function(data) {
              var error2;
              try {
                supCookie.set(WX_LINK_COOKIE, data, options.expires);
              } catch (error2) {
                e = error2;
                console.error(e);
              }
              if (typeof success === 'function') {
                return success(data);
              }
            }, function(error) {
              var error2;
              try {
                supCookie.remove(WX_OPEN_SID_COOKIE);
              } catch (error2) {
                e = error2;
                console.error(e);
              }
              if (typeof failed === 'function') {
                return failed(error);
              }
            });
          }
        },
        unlink: function(success, failed) {
          wx_open_sid = supCookie.get(WX_OPEN_SID_COOKIE);
          return do_request({
            url: api_wx_link + '/' + wx_open_sid,
            type: 'DELETE',
            token: supCookie.get(TOKEN_COOKIE)
          }, function(data) {
            var error2;
            try {
              supCookie.remove(WX_LINK_COOKIE);
            } catch (error2) {
              e = error2;
              console.error(e);
            }
            if (typeof success === 'function') {
              return success(data);
            }
          }, failed);
        },
        link: function(success, failed) {
          wx_open_sid = supCookie.get(WX_OPEN_SID_COOKIE);
          return do_request({
            url: api_wx_link,
            type: 'POST',
            data: {
              open_sid: wx_open_sid
            },
            token: supCookie.get(TOKEN_COOKIE)
          }, function(data) {
            var error2;
            try {
              supCookie.set(WX_LINK_COOKIE, data, options.expires);
            } catch (error2) {
              e = error2;
              console.error(e);
            }
            if (typeof success === 'function') {
              return success(data);
            }
          }, failed);
        },
        clean: function() {
          var error2;
          try {
            supCookie.remove(WX_OPEN_SID_COOKIE);
            supCookie.remove(WX_LINK_COOKIE);
            return true;
          } catch (error2) {
            e = error2;
            console.error(e);
            return false;
          }
        }
      },
      token: function(token) {
        var error2, error3;
        if (token === null || token === false) {
          try {
            supCookie.remove(TOKEN_COOKIE);
          } catch (error2) {
            e = error2;
            console.error(e);
            return false;
          }
        } else if (token) {
          try {
            supCookie.set(TOKEN_COOKIE, token, options.expires);
          } catch (error3) {
            e = error3;
            console.error(e);
            return false;
          }
        }
        return supCookie.get(TOKEN_COOKIE);
      },
      open_id: function(open_id) {
        var error2, error3;
        if (open_id === null || open_id === false) {
          try {
            supCookie.remove(OPEN_ID_COOKIE);
          } catch (error2) {
            e = error2;
            console.error(e);
            return false;
          }
        } else if (open_id) {
          try {
            supCookie.set(OPEN_ID_COOKIE, open_id, options.expires);
          } catch (error3) {
            e = error3;
            console.error(e);
            return false;
          }
        }
        return supCookie.get(OPEN_ID_COOKIE);
      },
      utils: utils,
      version: version
    };
    return member;
  };

  InvalidRequestAPI = new Error('Request API is invaild.');

  InvalidRequestType = new Error('Request Type is invaild.');

  InvalidRequestData = new Error('Request Data is invaild.');

  InvalidRequestParam = new Error('Request Param is invaild.');

  ResouceNotFound = new Error('Resource Not Found.');

  Ajax = function() {
    var XHRConnection, ajax, parse_response;
    ajax = {
      get: function(request) {
        return XHRConnection('GET', request);
      },
      post: function(request) {
        return XHRConnection('POST', request);
      },
      update: function(request) {
        return XHRConnection('PUT', request);
      },
      remove: function(request) {
        return XHRConnection('DELETE', request);
      },
      send: function(request) {
        return XHRConnection(request.type, request);
      }
    };
    XHRConnection = function(type, request) {
      var deferred, error, error1, k, ready, ref, send_data, url, v, xhr;
      xhr = new XMLHttpRequest();
      url = utils.addParam(request.url, request.params);
      xhr.open(type, url || '', true);
      xhr.responseType = request.responseType;
      xhr.withCredentials = Boolean(request.withCredentials);
      xhr.setRequestHeader('Content-Type', request.contentType);
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      if (typeof request.headers === 'object') {
        ref = request.headers;
        for (k in ref) {
          v = ref[k];
          xhr.setRequestHeader(k, v);
        }
      }
      deferred = Q.defer();
      ready = function(e) {
        var result;
        xhr = this;
        if (xhr.readyState === xhr.DONE) {
          xhr.removeEventListener('readystatechange', ready);
          result = parse_response(xhr);
          if (xhr.status >= 200 && xhr.status < 399) {
            return deferred.resolve(result.data);
          } else {
            return deferred.reject(result);
          }
        }
      };
      xhr.addEventListener('readystatechange', ready);
      if (type === 'GET' || type === 'DELETE') {
        xhr.send();
      } else {
        try {
          send_data = JSON.stringify(request.data || {});
        } catch (error1) {
          error = error1;
          throw error;
        }
        xhr.send(send_data);
      }
      return deferred.promise;
    };
    parse_response = function(xhr, headers) {
      var data, ref, ref1, result;
      if (xhr.responseType === 'json') {
        data = xhr.response;
      } else if ((ref = xhr.responseType) === 'blob' || ref === 'arraybuffer') {
        data = xhr.response;
      } else if (xhr.responseType === 'document') {
        data = xhr.responseXML;
      } else if ((ref1 = xhr.responseType) === '' || ref1 === 'text') {
        data = xhr.responseText;
      }
      result = {
        data: data,
        headers: xhr.getAllResponseHeaders(),
        status: xhr.status,
        statusText: xhr.statusText,
        responseType: xhr.responseType,
        responseURL: xhr.responseURL
      };
      return result;
    };
    return ajax;
  };

  procces_cookie_output = function(value) {
    var error1;
    if (value === 'undefined') {
      return void 0;
    }
    if (value === 'null') {
      return null;
    }
    try {
      value = JSON.parse(value);
    } catch (error1) {
      value = value;
    }
    return value;
  };

  procces_cookie_input = function(value) {
    if (typeof value === 'object') {
      value = JSON.stringify(value);
    }
    return value;
  };

  supCookie = {
    set: function(cname, cvalue, expires, path, domain) {
      var d;
      cvalue = procces_cookie_input(cvalue);
      d = new Date();
      d.setTime(d.getTime() + expires);
      expires = expires ? 'expires=' + d.toUTCString() + '; ' : '';
      path = path ? 'path=' + path + '; ' : 'path=/; ';
      domain = domain ? 'domain=' + domain + '; ' : '';
      return document.cookie = cname + '=' + cvalue + '; ' + expires + domain + path;
    },
    get: function(cname) {
      var c, ca, i, name, value;
      name = cname + '=';
      ca = document.cookie.split(';');
      i = 0;
      while (i < ca.length) {
        c = ca[i];
        while (c.charAt(0) === ' ') {
          c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
          value = c.substring(name.length, c.length);
          return procces_cookie_output(value);
        }
        i++;
      }
      return null;
    },
    remove: function(cname) {
      var domain, expires, path;
      expires = 'expires=Thu, 01 Jan 1970 00:00:00 UTC; ';
      path = path ? 'path=' + path + '; ' : 'path=/; ';
      domain = domain ? 'domain=' + domain + '; ' : '';
      return document.cookie = cname + '=; ' + expires + domain + path;
    }
  };

}).call(this);
