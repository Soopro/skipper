// Generated by CoffeeScript 2.0.2
(function() {
  // -------------------------------
  // Skipper - Soopro member system front-end.
  // -------------------------------
  var API_HOST, Ajax, EVENT_FORM_KYES, OPEN_ID_COOKIE, PROFILE_COOKIE, TOKEN_COOKIE, cookie, project, root, utils,
    indexOf = [].indexOf;

  root = window;

  project = {
    name: 'Skipper',
    version: '2.0.0',
    creator: ['Redyyu']
  };

  TOKEN_COOKIE = 'skipper_member_auth';

  OPEN_ID_COOKIE = 'skipper_member_open_id';

  PROFILE_COOKIE = 'skipper_member_profile';

  EVENT_FORM_KYES = ['appointee', 'contact', 'date', 'location'];

  API_HOST = 'https://api.soopro.io/crm/external';

  // --------------
  // Main
  // --------------
  root.Skipper = function(opts) {
    var ajax, api_baseurl, clean_cookies, conf, default_conf, k, parse_appt_data, request, resource, v;
    // config
    default_conf = {
      api_host: API_HOST,
      contentType: 'application/json',
      responseType: 'json',
      withCredentials: false,
      expires: 1000 * 3600 * 24
    };
    conf = default_conf;
    for (k in opts) {
      v = opts[k];
      conf[k] = v;
    }
    if (!conf.app_id) {
      throw 'app id is required!';
      return;
    }
    api_baseurl = conf.api_host + '/' + conf.app_id;
    // define request
    ajax = new Ajax();
    request = function(opts, success_callback, failed_callback) {
      var resp;
      if (!utils.isDict(opts.headers)) {
        opts.headers = {};
      }
      if (opts.token) {
        opts.headers['Authorization'] = 'Bearer ' + opts.token;
      }
      if (!opts.url) {
        opts.url = api_baseurl + opts.path;
      }
      resp = ajax.send({
        type: opts.type,
        url: opts.url,
        params: opts.params,
        data: opts.data,
        contentType: opts.contentType || conf.contentType,
        responseType: opts.responseType || conf.responseType,
        withCredentials: opts.withCredentials || conf.withCredentials,
        headers: opts.headers
      });
      if (typeof success_callback === 'function') {
        resp.then(function(data) {
          var e;
          try {
            success_callback(data);
          } catch (error1) {
            e = error1;
            console.error(e);
          }
          return data;
        });
      }
      if (typeof failed_callback === 'function') {
        resp.catch(function(error) {
          var e;
          try {
            failed_callback(error);
          } catch (error1) {
            e = error1;
            console.error(e);
          }
          return error;
        });
      }
      return resp;
    };
    clean_cookies = function() {
      var e;
      try {
        cookie.remove(PROFILE_COOKIE);
        cookie.remove(TOKEN_COOKIE);
        return cookie.remove(OPEN_ID_COOKIE);
      } catch (error1) {
        e = error1;
        return console.error(e);
      }
    };
    parse_appt_data = function(form_data) {
      var _value, data, field, j, key, len, ref;
      data = {
        event_slug: form_data.action,
        meta: {}
      };
      ref = form_data.fields;
      for (j = 0, len = ref.length; j < len; j++) {
        field = ref[j];
        key = field.name;
        if (indexOf.call(EVENT_FORM_KYES, key) >= 0) {
          data[key] = field.value;
        } else {
          if (data.meta[key]) {
            if (utils.isArray(data.meta[key])) {
              data.meta[key].push(field.value);
            } else {
              _value = data.meta[key];
              data.meta[key] = [_value, field.value];
            }
          } else {
            data.meta[key] = field.value;
          }
        }
      }
      return data;
    };
    // define api resource
    resource = {
      token: function(token) {
        var e;
        if (token === null || token === false) {
          try {
            cookie.remove(TOKEN_COOKIE);
          } catch (error1) {
            e = error1;
            console.error(e);
            return false;
          }
        } else if (token) {
          try {
            cookie.set(TOKEN_COOKIE, token, options.expires);
          } catch (error1) {
            e = error1;
            console.error(e);
            return false;
          }
        }
        return cookie.get(TOKEN_COOKIE);
      },
      open_id: function(open_id) {
        var e;
        if (open_id === null || open_id === false) {
          try {
            cookie.remove(OPEN_ID_COOKIE);
          } catch (error1) {
            e = error1;
            console.error(e);
            return false;
          }
        } else if (open_id) {
          try {
            cookie.set(OPEN_ID_COOKIE, open_id, options.expires);
          } catch (error1) {
            e = error1;
            console.error(e);
            return false;
          }
        }
        return cookie.get(OPEN_ID_COOKIE);
      },
      login: function(data, success, failed) {
        return request({
          path: '/login',
          type: 'POST',
          data: data
        }, function(data) {
          var e;
          try {
            cookie.set(TOKEN_COOKIE, data.token, options.expires);
            cookie.set(OPEN_ID_COOKIE, data.open_id, options.expires);
          } catch (error1) {
            e = error1;
            console.error(e);
          }
          if (utils.isFunction(success)) {
            return success(data);
          }
        }, failed);
      },
      logout: function(success, failed) {
        return request({
          path: '/logout',
          type: 'GET',
          token: cookie.get(TOKEN_COOKIE)
        }, function(data) {
          clean_cookies();
          if (utils.isFunction(success)) {
            return success(data);
          }
        }, function(error) {
          clean_cookies();
          if (utils.isFunction(failed)) {
            return failed(data);
          }
        });
      },
      register: function(data, success, failed) {
        return request({
          url: '/register',
          type: 'POST',
          data: data
        }, success, failed);
      },
      pwd: function(data, success, failed) {
        return request({
          url: '/security/pwd',
          type: 'POST',
          data: data,
          token: cookie.get(TOKEN_COOKIE)
        }, function(data) {
          var e;
          try {
            cookie.set(TOKEN_COOKIE, data.token, options.expires);
          } catch (error1) {
            e = error1;
            console.error(e);
          }
          if (utils.isFunction(success)) {
            return success(data);
          }
        }, failed);
      },
      profile: {
        get: function(success, failed) {
          var profile, promise;
          profile = cookie.get(PROFILE_COOKIE);
          if (profile) {
            promise = Promise.resolve(profile);
            if (utils.isFunction(success)) {
              promise.then(function(data) {
                success(data);
                return data;
              });
            }
            return promise;
          } else {
            return request({
              path: '/profile',
              type: 'GET',
              token: cookie.get(TOKEN_COOKIE)
            }, function(data) {
              var e;
              try {
                cookie.set(PROFILE_COOKIE, data, options.expires);
              } catch (error1) {
                e = error1;
                console.error(e);
              }
              if (utils.isFunction(success)) {
                return success(data);
              }
            }, failed);
          }
        },
        update: function(data, success, failed) {
          return request({
            path: '/profile',
            type: 'PUT',
            data: data,
            token: cookie.get(TOKEN_COOKIE)
          }, function(data) {
            var e;
            try {
              cookie.set(PROFILE_COOKIE, data, options.expires);
            } catch (error1) {
              e = error1;
              console.error(e);
            }
            if (utils.isFunction(success)) {
              return success(data);
            }
          }, failed);
        },
        clear: function() {
          var e;
          try {
            cookie.remove(PROFILE_COOKIE);
            return true;
          } catch (error1) {
            e = error1;
            console.error(e);
            return false;
          }
        }
      },
      mailto: function(form_data) {
        var _mailto, promise;
        _mailto = function() {
          var action, field, idx, j, last_key, len, mail_content, ref, subject;
          action = form_data.action.split("?")[0].split('#')[0];
          if (action.toLowerCase().indexOf('mailto:') !== 0) {
            action = 'mailto:' + action;
          }
          subject = form_data.title || '';
          mail_content = '';
          last_key = null;
          ref = form_data.fields;
          for (idx = j = 0, len = ref.length; j < len; idx = ++j) {
            field = ref[idx];
            if (last_key === field.name) {
              mail_content = mail_content + ', ' + field.value;
            } else {
              if (idx > 0) {
                mail_content += '\n';
              }
              mail_content = mail_content + field.name + ': ' + field.value;
            }
            last_key = field.name;
          }
          mail_content = encodeURIComponent(mail_content);
          return action + '?subject=' + subject + '&body=' + mail_content;
        };
        promise = new Promise(function(resolve, reject) {
          var e;
          try {
            return resolve(_mailto());
          } catch (error1) {
            e = error1;
            return reject(e);
          }
        });
        return promise;
      },
      appointment: {
        query: function(success, failed) {
          return request({
            path: '/appointment',
            type: 'GET',
            token: cookie.get(TOKEN_COOKIE)
          }, success, failed);
        },
        create: function(form_data, success, failed) {
          return request({
            path: '/appointment',
            type: 'POST',
            data: parse_appt_data(form_data),
            token: cookie.get(TOKEN_COOKIE)
          }, success, failed);
        },
        remove: function(appt_id, success, failed) {
          return request({
            path: '/appointment/' + appt_id,
            type: 'DELETE',
            token: cookie.get(TOKEN_COOKIE)
          }, success, failed);
        }
      }
    };
    return resource;
  };

  // --------------
  // Aide
  // --------------

  // Promise
  if (!Promise.prototype['finally']) {
    Promise.prototype['finally'] = function(callback) {
      var constructor;
      constructor = this.constructor;
      return this.then((function(value) {
        return constructor.resolve(callback()).then(function() {
          return value;
        });
      }), function(reason) {
        return constructor.resolve(callback()).then(function() {
          throw reason;
        });
      });
    };
  }

  // utils
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
      return {key, value};
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
        // If first entry with this name
        if (typeof query_args[pair[0]] === 'undefined') {
          query_args[pair[0]] = decodeURIComponent(pair[1]);
        // If second entry with this name
        } else if (typeof query_args[pair[0]] === 'string') {
          arr = [query_args[pair[0]], decodeURIComponent(pair[1])];
          query_args[pair[0]] = arr;
        } else {
          // If third or later entry with this name
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
    // --- str ---
    startswith: function(str, text) {
      if (typeof str !== 'string' || typeof text !== 'string') {
        return null;
      }
      return str.indexOf(text) === 0;
    },
    endswith: function(str, text) {
      if (typeof str !== 'string' || typeof text !== 'string') {
        return null;
      }
      return str.substr(str.length - text.length) === text;
    },
    // --- browser ---
    in_wechat: function() {
      var user_agent;
      try {
        user_agent = root.navigator.userAgent || '';
      } catch (error1) {
        user_agent = '';
      }
      return user_agent.indexOf('MicroMessenger') >= 0;
    },
    // --- is ---
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
    },
    isUrl: function(str) {
      var regex;
      if (typeof url !== 'string') {
        return false;
      }
      regex = /^([\w]+:)?\/\/[a-zA-Z0-9]/i;
      return url.match(regex);
    },
    isArray: function(obj) {
      return Array.isArray(obj);
    },
    isDict: function(obj) {
      return typeof obj === 'object' && !Array.isArray(obj);
    },
    isFunction: function(obj) {
      return typeof obj === 'function';
    }
  };

  // cookie
  cookie = {
    set: function(cname, cvalue, expires, path, domain) {
      var d;
      cvalue = JSON.stringify({
        value: cvalue
      });
      d = new Date();
      d.setTime(d.getTime() + expires);
      expires = expires ? 'expires=' + d.toUTCString() + '; ' : '';
      path = path ? 'path=' + path + '; ' : 'path=/; ';
      domain = domain ? 'domain=' + domain + '; ' : '';
      return document.cookie = cname + '=' + cvalue + '; ' + expires + domain + path;
    },
    get: function(cname) {
      var c, ca, i, name, obj, value;
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
          try {
            obj = JSON.parse(value);
            return obj.value;
          } catch (error1) {
            return value;
          }
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

  // ajax
  Ajax = function() {
    var XHRConnection, ajax, parse_response;
    ajax = {
      get: function(opts) {
        return XHRConnection('GET', opts);
      },
      post: function(opts) {
        return XHRConnection('POST', opts);
      },
      update: function(opts) {
        return XHRConnection('PUT', opts);
      },
      remove: function(opts) {
        return XHRConnection('DELETE', opts);
      },
      send: function(opts) {
        return XHRConnection(opts.type, opts);
      }
    };
    XHRConnection = function(type, opts) {
      var k, promise, ref, send_data, url, v, xhr;
      xhr = new XMLHttpRequest();
      url = utils.addParam(opts.url, opts.params);
      xhr.open(type, url || '', true);
      xhr.responseType = opts.responseType;
      xhr.withCredentials = Boolean(opts.withCredentials);
      xhr.setRequestHeader('Content-Type', opts.contentType);
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      if (typeof opts.headers === 'object') {
        ref = opts.headers;
        for (k in ref) {
          v = ref[k];
          xhr.setRequestHeader(k, v);
        }
      }
      promise = new Promise(function(resolve, reject) {
        var ready;
        ready = function(e) {
          var result;
          xhr = this;
          if (xhr.readyState === xhr.DONE) {
            xhr.removeEventListener('readystatechange', ready);
            result = parse_response(xhr);
            if (xhr.status >= 200 && xhr.status < 399) {
              return resolve(result.data);
            } else {
              return reject(result);
            }
          }
        };
        return xhr.addEventListener('readystatechange', ready);
      });
      // send
      if (type === 'GET' || type === 'DELETE') {
        xhr.send();
      } else {
        send_data = JSON.stringify(opts.data || {});
        xhr.send(send_data);
      }
      return promise;
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

  // expose attributes
  Skipper.utils = utils;

  Skipper.version = project.version;

}).call(this);