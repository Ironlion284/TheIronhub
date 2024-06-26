var Module,
  Module = Module || (void 0 !== Module ? Module : null) || {},
  moduleOverrides = {},
  key
for (key in Module) Module.hasOwnProperty(key) && (moduleOverrides[key] = Module[key])
var ENVIRONMENT_IS_WEB = !1,
  ENVIRONMENT_IS_WORKER = !1,
  ENVIRONMENT_IS_NODE = !1,
  ENVIRONMENT_IS_SHELL = !1,
  nodeFS,
  nodePath,
  TRY_USE_DUMP,
  key
if (Module.ENVIRONMENT)
  if ('WEB' === Module.ENVIRONMENT) ENVIRONMENT_IS_WEB = !0
  else if ('WORKER' === Module.ENVIRONMENT) ENVIRONMENT_IS_WORKER = !0
  else if ('NODE' === Module.ENVIRONMENT) ENVIRONMENT_IS_NODE = !0
  else {
    if ('SHELL' !== Module.ENVIRONMENT)
      throw new Error(
        "The provided Module['ENVIRONMENT'] value is not valid. It must be one of: WEB|WORKER|NODE|SHELL."
      )
    ENVIRONMENT_IS_SHELL = !0
  }
else
  (ENVIRONMENT_IS_WEB = 'object' == typeof window),
    (ENVIRONMENT_IS_WORKER = 'function' == typeof importScripts),
    (ENVIRONMENT_IS_NODE =
      'object' == typeof process && 'function' == typeof require && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER),
    (ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER)
if (ENVIRONMENT_IS_NODE)
  Module.print || (Module.print = console.log),
    Module.printErr || (Module.printErr = console.warn),
    (Module.read = function (e, r) {
      ;(nodeFS = nodeFS || require('fs')), (e = (nodePath = nodePath || require('path')).normalize(e))
      e = nodeFS.readFileSync(e)
      return r ? e : e.toString()
    }),
    (Module.readBinary = function (e) {
      e = Module.read(e, !0)
      return e.buffer || (e = new Uint8Array(e)), assert(e.buffer), e
    }),
    (Module.load = function (e) {
      globalEval(read(e))
    }),
    Module.thisProgram ||
      (1 < process.argv.length
        ? (Module.thisProgram = process.argv[1].replace(/\\/g, '/'))
        : (Module.thisProgram = 'unknown-program')),
    (Module.arguments = process.argv.slice(2)),
    'undefined' != typeof module && (module.exports = Module),
    process.on('uncaughtException', function (e) {
      if (!(e instanceof ExitStatus)) throw e
    }),
    (Module.inspect = function () {
      return '[Emscripten Module object]'
    })
else if (ENVIRONMENT_IS_SHELL)
  Module.print || (Module.print = print),
    'undefined' != typeof printErr && (Module.printErr = printErr),
    'undefined' != typeof read
      ? (Module.read = read)
      : (Module.read = function () {
          throw 'no read() available'
        }),
    (Module.readBinary = function (e) {
      if ('function' == typeof readbuffer) return new Uint8Array(readbuffer(e))
      e = read(e, 'binary')
      return assert('object' == typeof e), e
    }),
    'undefined' != typeof scriptArgs
      ? (Module.arguments = scriptArgs)
      : 'undefined' != typeof arguments && (Module.arguments = arguments)
else {
  if (!ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER) throw 'Unknown runtime environment. Where are we?'
  ;(Module.read = function (e) {
    var r = new XMLHttpRequest()
    return r.open('GET', e, !1), r.send(null), r.responseText
  }),
    (Module.readAsync = function (e, r, t) {
      var n = new XMLHttpRequest()
      n.open('GET', e, !0),
        (n.responseType = 'arraybuffer'),
        (n.onload = function () {
          200 == n.status || (0 == n.status && n.response) ? r(n.response) : t()
        }),
        (n.onerror = t),
        n.send(null)
    }),
    'undefined' != typeof arguments && (Module.arguments = arguments),
    'undefined' != typeof console
      ? (Module.print ||
          (Module.print = function (e) {
            console.log(e)
          }),
        Module.printErr ||
          (Module.printErr = function (e) {
            console.warn(e)
          }))
      : ((TRY_USE_DUMP = !1),
        Module.print ||
          (Module.print =
            TRY_USE_DUMP && 'undefined' != typeof dump
              ? function (e) {
                  dump(e)
                }
              : function (e) {})),
    ENVIRONMENT_IS_WORKER && (Module.load = importScripts),
    void 0 === Module.setWindowTitle &&
      (Module.setWindowTitle = function (e) {
        document.title = e
      })
}
function globalEval(e) {
  eval.call(null, e)
}
for (key in (!Module.load &&
  Module.read &&
  (Module.load = function (e) {
    globalEval(Module.read(e))
  }),
Module.print || (Module.print = function () {}),
Module.printErr || (Module.printErr = Module.print),
Module.arguments || (Module.arguments = []),
Module.thisProgram || (Module.thisProgram = './this.program'),
(Module.print = Module.print),
(Module.printErr = Module.printErr),
(Module.preRun = []),
(Module.postRun = []),
moduleOverrides))
  moduleOverrides.hasOwnProperty(key) && (Module[key] = moduleOverrides[key])
moduleOverrides = void 0
var Runtime = {
  setTempRet0: function (e) {
    tempRet0 = e
  },
  getTempRet0: function () {
    return tempRet0
  },
  stackSave: function () {
    return STACKTOP
  },
  stackRestore: function (e) {
    STACKTOP = e
  },
  getNativeTypeSize: function (e) {
    switch (e) {
      case 'i1':
      case 'i8':
        return 1
      case 'i16':
        return 2
      case 'i32':
        return 4
      case 'i64':
        return 8
      case 'float':
        return 4
      case 'double':
        return 8
      default:
        if ('*' === e[e.length - 1]) return Runtime.QUANTUM_SIZE
        if ('i' !== e[0]) return 0
        var r = parseInt(e.substr(1))
        return assert(r % 8 == 0), r / 8
    }
  },
  getNativeFieldSize: function (e) {
    return Math.max(Runtime.getNativeTypeSize(e), Runtime.QUANTUM_SIZE)
  },
  STACK_ALIGN: 16,
  prepVararg: function (e, r) {
    return 'double' === r || 'i64' === r ? 7 & e && (assert(4 == (7 & e)), (e += 4)) : assert(0 == (3 & e)), e
  },
  getAlignSize: function (e, r, t) {
    return t || ('i64' != e && 'double' != e)
      ? e
        ? Math.min(r || (e ? Runtime.getNativeFieldSize(e) : 0), Runtime.QUANTUM_SIZE)
        : Math.min(r, 8)
      : 8
  },
  dynCall: function (e, r, t) {
    return t && t.length
      ? (assert(t.length == e.length - 1),
        assert('dynCall_' + e in Module, "bad function pointer type - no table for sig '" + e + "'"),
        Module['dynCall_' + e].apply(null, [r].concat(t)))
      : (assert(1 == e.length),
        assert('dynCall_' + e in Module, "bad function pointer type - no table for sig '" + e + "'"),
        Module['dynCall_' + e].call(null, r))
  },
  functionPointers: [],
  addFunction: function (e) {
    for (var r = 0; r < Runtime.functionPointers.length; r++)
      if (!Runtime.functionPointers[r]) return (Runtime.functionPointers[r] = e), 2 * (1 + r)
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.'
  },
  removeFunction: function (e) {
    Runtime.functionPointers[(e - 2) / 2] = null
  },
  warnOnce: function (e) {
    Runtime.warnOnce.shown || (Runtime.warnOnce.shown = {}),
      Runtime.warnOnce.shown[e] || ((Runtime.warnOnce.shown[e] = 1), Module.printErr(e))
  },
  funcWrappers: {},
  getFuncWrapper: function (r, t) {
    assert(t), Runtime.funcWrappers[t] || (Runtime.funcWrappers[t] = {})
    var e = Runtime.funcWrappers[t]
    return (
      e[r] ||
        (1 === t.length
          ? (e[r] = function () {
              return Runtime.dynCall(t, r)
            })
          : 2 === t.length
            ? (e[r] = function (e) {
                return Runtime.dynCall(t, r, [e])
              })
            : (e[r] = function () {
                return Runtime.dynCall(t, r, Array.prototype.slice.call(arguments))
              })),
      e[r]
    )
  },
  getCompilerSetting: function (e) {
    throw 'You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work'
  },
  stackAlloc: function (e) {
    var r = STACKTOP
    return assert(((0 | (STACKTOP = ((STACKTOP = (STACKTOP + e) | 0) + 15) & -16)) < (0 | STACK_MAX)) | 0), r
  },
  staticAlloc: function (e) {
    var r = STATICTOP
    return (STATICTOP = ((STATICTOP = (STATICTOP + (assert(!staticSealed), e)) | 0) + 15) & -16), r
  },
  dynamicAlloc: function (e) {
    assert(DYNAMICTOP_PTR)
    var r = HEAP32[DYNAMICTOP_PTR >> 2],
      e = -16 & ((r + e + 15) | 0)
    if (((HEAP32[DYNAMICTOP_PTR >> 2] = e), TOTAL_MEMORY <= e) && !enlargeMemory())
      return (HEAP32[DYNAMICTOP_PTR >> 2] = r), 0
    return r
  },
  alignMemory: function (e, r) {
    return (e = Math.ceil(e / (r || 16)) * (r || 16))
  },
  makeBigInt: function (e, r, t) {
    return t ? +(e >>> 0) + 4294967296 * (r >>> 0) : +(e >>> 0) + 4294967296 * (0 | r)
  },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0,
}
Module.Runtime = Runtime
var ABORT = 0,
  EXITSTATUS = 0,
  cwrap,
  ccall
function assert(e, r) {
  e || abort('Assertion failed: ' + r)
}
function getCFunc(_0x222174) {
  var _0x54cf7b = Module['_' + _0x222174]
  if (!_0x54cf7b)
    try {
      _0x54cf7b = eval('_' + _0x222174)
    } catch (_0x4b65d1) {}
  return (
    assert(
      _0x54cf7b,
      'Cannot call unknown function ' + _0x222174 + ' (perhaps LLVM optimizations or closure removed it?)'
    ),
    _0x54cf7b
  )
}
function setValue(e, r, t, n) {
  switch (('*' === (t = t || 'i8').charAt(t.length - 1) && (t = 'i32'), t)) {
    case 'i1':
    case 'i8':
      HEAP8[e >> 0] = r
      break
    case 'i16':
      HEAP16[e >> 1] = r
      break
    case 'i32':
      HEAP32[e >> 2] = r
      break
    case 'i64':
      ;(tempI64 = [
        r >>> 0,
        ((tempDouble = r),
        1 <= +Math_abs(tempDouble)
          ? 0 < tempDouble
            ? (0 | Math_min(+Math_floor(tempDouble / 4294967296), 4294967295)) >>> 0
            : ~~+Math_ceil((tempDouble - (~~tempDouble >>> 0)) / 4294967296) >>> 0
          : 0),
      ]),
        (HEAP32[e >> 2] = tempI64[0]),
        (HEAP32[(e + 4) >> 2] = tempI64[1])
      break
    case 'float':
      HEAPF32[e >> 2] = r
      break
    case 'double':
      HEAPF64[e >> 3] = r
      break
    default:
      abort('invalid type for setValue: ' + t)
  }
}
function getValue(e, r, t) {
  switch (('*' === (r = r || 'i8').charAt(r.length - 1) && (r = 'i32'), r)) {
    case 'i1':
    case 'i8':
      return HEAP8[e >> 0]
    case 'i16':
      return HEAP16[e >> 1]
    case 'i32':
    case 'i64':
      return HEAP32[e >> 2]
    case 'float':
      return HEAPF32[e >> 2]
    case 'double':
      return HEAPF64[e >> 3]
    default:
      abort('invalid type for setValue: ' + r)
  }
  return null
}
!(function () {
  var _0x17b09f = {
      stackSave: function () {
        Runtime.stackSave()
      },
      stackRestore: function () {
        Runtime.stackRestore()
      },
      arrayToC: function (e) {
        var r = Runtime.stackAlloc(e.length)
        return writeArrayToMemory(e, r), r
      },
      stringToC: function (e) {
        var r,
          t = 0
        return null != e && 0 !== e && ((r = 1 + (e.length << 2)), stringToUTF8(e, (t = Runtime.stackAlloc(r)), r)), t
      },
    },
    _0x237e8c = { string: _0x17b09f.stringToC, array: _0x17b09f.arrayToC }
  ccall = function (e, r, t, n, i) {
    var e = getCFunc(e),
      o = [],
      a = 0
    if ((assert('array' !== r, 'Return type should not be "array".'), n))
      for (var u = 0; u < n.length; u++) {
        var s = _0x237e8c[t[u]]
        s ? (0 === a && (a = Runtime.stackSave()), (o[u] = s(n[u]))) : (o[u] = n[u])
      }
    e = e.apply(null, o)
    if (
      ((i && i.async) ||
        'object' != typeof EmterpreterAsync ||
        assert(!EmterpreterAsync.state, 'cannot start async op with normal JS calling ccall'),
      i && i.async && assert(!r, 'async ccalls cannot return values'),
      'string' === r && (e = Pointer_stringify(e)),
      0 !== a)
    ) {
      if (i && i.async)
        return void EmterpreterAsync.asyncFinalizers.push(function () {
          Runtime.stackRestore(a)
        })
      Runtime.stackRestore(a)
    }
    return e
  }
  var _0x10eb99 = /^function\s*[a-zA-Z$_0-9]*\s*\(([^)]*)\)\s*{\s*([^*]*?)[\s;]*(?:return\s*(.*?)[;\s]*)?}$/
  function _0xcdf97(e) {
    e = e.toString().match(_0x10eb99).slice(1)
    return { arguments: e[0], body: e[1], returnValue: e[2] }
  }
  var _0xe7fbac = null
  function _0x1182dc() {
    if (!_0xe7fbac)
      for (var e in ((_0xe7fbac = {}), _0x17b09f))
        _0x17b09f.hasOwnProperty(e) && (_0xe7fbac[e] = _0xcdf97(_0x17b09f[e]))
  }
  cwrap = function cwrap(_0x405d7e, _0x2bdb59, _0x4f818b) {
    _0x4f818b = _0x4f818b || []
    var _0x47dcc4 = getCFunc(_0x405d7e),
      _0x139014 = _0x4f818b.every(function (e) {
        return 'number' === e
      }),
      _0x117d20 = 'string' !== _0x2bdb59
    if (_0x117d20 && _0x139014) return _0x47dcc4
    var _0x309efb = _0x4f818b.map(function (e, r) {
        return '$' + r
      }),
      _0x370f8c = '(function(' + _0x309efb.join(',') + ') {',
      _0x3604e6 = _0x4f818b.length
    if (!_0x139014) {
      _0x1182dc(), (_0x370f8c += 'var stack = ' + _0xe7fbac.stackSave.body + ';')
      for (var _0x5bb697 = 0; _0x5bb697 < _0x3604e6; _0x5bb697++) {
        var _0x4474ac = _0x309efb[_0x5bb697],
          _0x57b51e = _0x4f818b[_0x5bb697],
          _0x416e0c
        'number' !== _0x57b51e &&
          ((_0x416e0c = _0xe7fbac[_0x57b51e + 'ToC']),
          (_0x370f8c += 'var ' + _0x416e0c.arguments + ' = ' + _0x4474ac + ';'),
          (_0x370f8c += _0x416e0c.body + ';'),
          (_0x370f8c += _0x4474ac + '=(' + _0x416e0c.returnValue + ');'))
      }
    }
    var _0x3e7fb4 = _0xcdf97(function () {
        return _0x47dcc4
      }).returnValue,
      _0xc5e88c
    return (
      (_0x370f8c += 'var ret = ' + _0x3e7fb4 + '(' + _0x309efb.join(',') + ');'),
      _0x117d20 ||
        ((_0xc5e88c = _0xcdf97(function () {
          return Pointer_stringify
        }).returnValue),
        (_0x370f8c += 'ret = ' + _0xc5e88c + '(ret);')),
      (_0x370f8c +=
        "if (typeof EmterpreterAsync === 'object') { assert(!EmterpreterAsync.state, 'cannot start async op with normal JS calling cwrap') }"),
      _0x139014 || (_0x1182dc(), (_0x370f8c += _0xe7fbac.stackRestore.body.replace('()', '(stack)') + ';')),
      (_0x370f8c += 'return ret})'),
      eval(_0x370f8c)
    )
  }
})(),
  (Module.ccall = ccall),
  (Module.cwrap = cwrap),
  (Module.setValue = setValue),
  (Module.getValue = getValue)
var ALLOC_NORMAL = 0,
  ALLOC_STACK = 1,
  ALLOC_STATIC = 2,
  ALLOC_DYNAMIC = 3,
  ALLOC_NONE = 4
function allocate(e, r, t, n) {
  var i,
    o = 'number' == typeof e ? ((i = !0), e) : ((i = !1), e.length),
    a = 'string' == typeof r ? r : null,
    u =
      t == ALLOC_NONE
        ? n
        : [
            'function' == typeof _malloc ? _malloc : Runtime.staticAlloc,
            Runtime.stackAlloc,
            Runtime.staticAlloc,
            Runtime.dynamicAlloc,
          ][void 0 === t ? ALLOC_STATIC : t](Math.max(o, a ? 1 : r.length))
  if (i) {
    var s,
      n = u
    for (assert(0 == (3 & u)), s = u + (-4 & o); n < s; n += 4) HEAP32[n >> 2] = 0
    for (s = u + o; n < s; ) HEAP8[n++ >> 0] = 0
    return u
  }
  if ('i8' === a) return e.subarray || e.slice ? HEAPU8.set(e, u) : HEAPU8.set(new Uint8Array(e), u), u
  for (var f, l, c, d = 0; d < o; ) {
    var E = e[d]
    'function' == typeof E && (E = Runtime.getFunctionIndex(E)),
      0 !== (f = a || r[d])
        ? (assert(f, 'Must know what type to store in allocate!'),
          'i64' == f && (f = 'i32'),
          setValue(u + d, E, f),
          c !== f && ((l = Runtime.getNativeTypeSize(f)), (c = f)),
          (d += l))
        : d++
  }
  return u
}
function getMemory(e) {
  return staticSealed ? (runtimeInitialized ? _malloc(e) : Runtime.dynamicAlloc(e)) : Runtime.staticAlloc(e)
}
function Pointer_stringify(e, r) {
  if (0 === r || !e) return ''
  for (
    var t, n = 0, i = 0;
    assert(e + i < TOTAL_MEMORY), (n |= t = HEAPU8[(e + i) >> 0]), (0 != t || r) && (i++, !r || i != r);

  );
  r = r || i
  var o = ''
  if (n < 128) {
    for (var a; 0 < r; )
      (a = String.fromCharCode.apply(String, HEAPU8.subarray(e, e + Math.min(r, 1024)))),
        (o = o ? o + a : a),
        (e += 1024),
        (r -= 1024)
    return o
  }
  return Module.UTF8ToString(e)
}
function AsciiToString(e) {
  for (var r = ''; ; ) {
    var t = HEAP8[e++ >> 0]
    if (!t) return r
    r += String.fromCharCode(t)
  }
}
function stringToAscii(e, r) {
  return writeAsciiToMemory(e, r, !1)
}
;(Module.ALLOC_NORMAL = ALLOC_NORMAL),
  (Module.ALLOC_STACK = ALLOC_STACK),
  (Module.ALLOC_STATIC = ALLOC_STATIC),
  (Module.ALLOC_DYNAMIC = ALLOC_DYNAMIC),
  (Module.ALLOC_NONE = ALLOC_NONE),
  (Module.allocate = allocate),
  (Module.getMemory = getMemory),
  (Module.Pointer_stringify = Pointer_stringify),
  (Module.AsciiToString = AsciiToString),
  (Module.stringToAscii = stringToAscii)
var UTF8Decoder = 'undefined' != typeof TextDecoder ? new TextDecoder('utf8') : void 0
function UTF8ArrayToString(e, r) {
  for (var t = r; e[t]; ) ++t
  if (16 < t - r && e.subarray && UTF8Decoder) return UTF8Decoder.decode(e.subarray(r, t))
  for (var n, i, o, a, u, s = ''; ; ) {
    if (!(a = e[r++])) return s
    128 & a
      ? ((u = 63 & e[r++]),
        192 != (224 & a)
          ? ((o = 63 & e[r++]),
            (a =
              224 == (240 & a)
                ? ((15 & a) << 12) | (u << 6) | o
                : ((n = 63 & e[r++]),
                  240 == (248 & a)
                    ? ((7 & a) << 18) | (u << 12) | (o << 6) | n
                    : ((i = 63 & e[r++]),
                      248 == (252 & a)
                        ? ((3 & a) << 24) | (u << 18) | (o << 12) | (n << 6) | i
                        : ((1 & a) << 30) | (u << 24) | (o << 18) | (n << 12) | (i << 6) | (63 & e[r++])))) < 65536
              ? (s += String.fromCharCode(a))
              : ((i = a - 65536), (s += String.fromCharCode(55296 | (i >> 10), 56320 | (1023 & i)))))
          : (s += String.fromCharCode(((31 & a) << 6) | u)))
      : (s += String.fromCharCode(a))
  }
}
function UTF8ToString(e) {
  return UTF8ArrayToString(HEAPU8, e)
}
function stringToUTF8Array(e, r, t, n) {
  if (!(0 < n)) return 0
  for (var i = t, o = t + n - 1, a = 0; a < e.length; ++a) {
    var u = e.charCodeAt(a)
    if ((55296 <= u && u <= 57343 && (u = (65536 + ((1023 & u) << 10)) | (1023 & e.charCodeAt(++a))), u <= 127)) {
      if (o <= t) break
      r[t++] = u
    } else if (u <= 2047) {
      if (o <= t + 1) break
      ;(r[t++] = 192 | (u >> 6)), (r[t++] = 128 | (63 & u))
    } else if (u <= 65535) {
      if (o <= t + 2) break
      ;(r[t++] = 224 | (u >> 12)), (r[t++] = 128 | ((u >> 6) & 63)), (r[t++] = 128 | (63 & u))
    } else if (u <= 2097151) {
      if (o <= t + 3) break
      ;(r[t++] = 240 | (u >> 18)),
        (r[t++] = 128 | ((u >> 12) & 63)),
        (r[t++] = 128 | ((u >> 6) & 63)),
        (r[t++] = 128 | (63 & u))
    } else if (u <= 67108863) {
      if (o <= t + 4) break
      ;(r[t++] = 248 | (u >> 24)),
        (r[t++] = 128 | ((u >> 18) & 63)),
        (r[t++] = 128 | ((u >> 12) & 63)),
        (r[t++] = 128 | ((u >> 6) & 63)),
        (r[t++] = 128 | (63 & u))
    } else {
      if (o <= t + 5) break
      ;(r[t++] = 252 | (u >> 30)),
        (r[t++] = 128 | ((u >> 24) & 63)),
        (r[t++] = 128 | ((u >> 18) & 63)),
        (r[t++] = 128 | ((u >> 12) & 63)),
        (r[t++] = 128 | ((u >> 6) & 63)),
        (r[t++] = 128 | (63 & u))
    }
  }
  return (r[t] = 0), t - i
}
function stringToUTF8(e, r, t) {
  return (
    assert(
      'number' == typeof t,
      'stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!'
    ),
    stringToUTF8Array(e, HEAPU8, r, t)
  )
}
function lengthBytesUTF8(e) {
  for (var r = 0, t = 0; t < e.length; ++t) {
    var n = e.charCodeAt(t)
    55296 <= n && n <= 57343 && (n = (65536 + ((1023 & n) << 10)) | (1023 & e.charCodeAt(++t))),
      n <= 127 ? ++r : (r += n <= 2047 ? 2 : n <= 65535 ? 3 : n <= 2097151 ? 4 : n <= 67108863 ? 5 : 6)
  }
  return r
}
;(Module.UTF8ArrayToString = UTF8ArrayToString),
  (Module.UTF8ToString = UTF8ToString),
  (Module.stringToUTF8Array = stringToUTF8Array),
  (Module.stringToUTF8 = stringToUTF8),
  (Module.lengthBytesUTF8 = lengthBytesUTF8)
var UTF16Decoder = 'undefined' != typeof TextDecoder ? new TextDecoder('utf-16le') : void 0,
  HEAP,
  buffer,
  HEAP8,
  HEAPU8,
  HEAP16,
  HEAPU16,
  HEAP32,
  HEAPU32,
  HEAPF32,
  HEAPF64,
  STATIC_BASE,
  STATICTOP,
  staticSealed,
  STACK_BASE,
  STACKTOP,
  STACK_MAX,
  DYNAMIC_BASE,
  DYNAMICTOP_PTR,
  byteLength
function demangle(e) {
  if (!Module.___cxa_demangle)
    return Runtime.warnOnce('warning: build with  -s DEMANGLE_SUPPORT=1  to link in libcxxabi demangling'), e
  try {
    var r = e.substr(1),
      t = lengthBytesUTF8(r) + 1,
      n = _malloc(t)
    stringToUTF8(r, n, t)
    var i = _malloc(4),
      o = Module.___cxa_demangle(n, 0, 0, i)
    if (0 === getValue(i, 'i32') && o) return Pointer_stringify(o)
  } catch (e) {
  } finally {
    n && _free(n), i && _free(i), o && _free(o)
  }
  return e
}
function demangleAll(e) {
  return e.replace(/__Z[\w\d_]+/g, function (e) {
    var r = demangle(e)
    return e === r ? e : e + ' [' + r + ']'
  })
}
function jsStackTrace() {
  var r = new Error()
  if (!r.stack) {
    try {
      throw new Error(0)
    } catch (e) {
      r = e
    }
    if (!r.stack) return '(no stack trace available)'
  }
  return r.stack.toString()
}
function stackTrace() {
  var e = jsStackTrace()
  return Module.extraStackTrace && (e += '\n' + Module.extraStackTrace()), demangleAll(e)
}
function alignMemoryPage(e) {
  return 0 < e % 4096 && (e += 4096 - (e % 4096)), e
}
function updateGlobalBuffer(e) {
  Module.buffer = buffer = e
}
function updateGlobalBufferViews() {
  ;(Module.HEAP8 = HEAP8 = new Int8Array(buffer)),
    (Module.HEAP16 = HEAP16 = new Int16Array(buffer)),
    (Module.HEAP32 = HEAP32 = new Int32Array(buffer)),
    (Module.HEAPU8 = HEAPU8 = new Uint8Array(buffer)),
    (Module.HEAPU16 = HEAPU16 = new Uint16Array(buffer)),
    (Module.HEAPU32 = HEAPU32 = new Uint32Array(buffer)),
    (Module.HEAPF32 = HEAPF32 = new Float32Array(buffer)),
    (Module.HEAPF64 = HEAPF64 = new Float64Array(buffer))
}
function writeStackCookie() {
  assert(0 == (3 & STACK_MAX)), (HEAPU32[(STACK_MAX >> 2) - 1] = 34821223), (HEAPU32[(STACK_MAX >> 2) - 2] = 2310721022)
}
function checkStackCookie() {
  if (
    ((34821223 == HEAPU32[(STACK_MAX >> 2) - 1] && 2310721022 == HEAPU32[(STACK_MAX >> 2) - 2]) ||
      abort(
        'Stack overflow! Stack cookie has been overwritten, expected hex dwords 0x89BACDFE and 0x02135467, but received 0x' +
          HEAPU32[(STACK_MAX >> 2) - 2].toString(16) +
          ' ' +
          HEAPU32[(STACK_MAX >> 2) - 1].toString(16)
      ),
    1668509029 !== HEAP32[0])
  )
    throw 'Runtime error: The application has corrupted its heap memory area (address zero)!'
}
function abortStackOverflow(e) {
  abort(
    'Stack overflow! Attempted to allocate ' +
      e +
      ' bytes on the stack, but stack has only ' +
      (STACK_MAX - asm.stackSave() + e) +
      ' bytes available!'
  )
}
function abortOnCannotGrowMemory() {
  abort(
    'Cannot enlarge memory arrays. Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value ' +
      TOTAL_MEMORY +
      ', (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which adjusts the size at runtime but prevents some optimizations, (3) set Module.TOTAL_MEMORY to a higher value before the program runs, or if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 '
  )
}
function enlargeMemory() {
  assert(HEAP32[DYNAMICTOP_PTR >> 2] > TOTAL_MEMORY), assert(4 < TOTAL_MEMORY)
  var e = TOTAL_MEMORY,
    r = Math.pow(2, 31)
  if (HEAP32[DYNAMICTOP_PTR >> 2] >= r) return !1
  for (; TOTAL_MEMORY < HEAP32[DYNAMICTOP_PTR >> 2]; )
    if (TOTAL_MEMORY < r / 2) TOTAL_MEMORY = alignMemoryPage(2 * TOTAL_MEMORY)
    else {
      var t = TOTAL_MEMORY
      if ((TOTAL_MEMORY = alignMemoryPage((3 * TOTAL_MEMORY + r) / 4)) <= t) return !1
    }
  if (r <= (TOTAL_MEMORY = Math.max(TOTAL_MEMORY, 16777216))) return !1
  Module.printErr('Warning: Enlarging memory arrays, this is not fast! ' + [e, TOTAL_MEMORY])
  var n = Date.now(),
    i = Module.reallocBuffer(TOTAL_MEMORY)
  return (
    !!i &&
    (updateGlobalBuffer(i),
    updateGlobalBufferViews(),
    Module.printErr(
      'enlarged memory arrays from ' +
        e +
        ' to ' +
        TOTAL_MEMORY +
        ', took ' +
        (Date.now() - n) +
        ' ms (has ArrayBuffer.transfer? ' +
        !!ArrayBuffer.transfer +
        ')'
    ),
    !0)
  )
}
;(Module.stackTrace = stackTrace),
  (STATIC_BASE = STATICTOP = STACK_BASE = STACKTOP = STACK_MAX = DYNAMIC_BASE = DYNAMICTOP_PTR = 0),
  (staticSealed = !1),
  Module.reallocBuffer ||
    (Module.reallocBuffer = function (e) {
      var r, t
      try {
        ArrayBuffer.transfer
          ? (t = ArrayBuffer.transfer(buffer, e))
          : ((r = HEAP8), (t = new ArrayBuffer(e)), new Int8Array(t).set(r))
      } catch (e) {
        return !1
      }
      return !!_emscripten_replace_memory(t) && t
    })
try {
  ;(byteLength = Function.prototype.call.bind(
    Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, 'byteLength').get
  )),
    byteLength(new ArrayBuffer(4))
} catch (_0x294e13) {
  byteLength = function (e) {
    return e.byteLength
  }
}
for (
  var TOTAL_STACK = Module.TOTAL_STACK || 5242880,
    TOTAL_MEMORY = Module.TOTAL_MEMORY || 16777216,
    WASM_PAGE_SIZE = 65536,
    totalMemory = WASM_PAGE_SIZE;
  totalMemory < TOTAL_MEMORY || totalMemory < 2 * TOTAL_STACK;

)
  totalMemory < 16777216 ? (totalMemory *= 2) : (totalMemory += 16777216)
function getTotalMemory() {
  return TOTAL_MEMORY
}
if (
  ((totalMemory = Math.max(totalMemory, 16777216)),
  totalMemory !== TOTAL_MEMORY &&
    (Module.printErr(
      'increasing TOTAL_MEMORY to ' +
        totalMemory +
        ' to be compliant with the asm.js spec (and given that TOTAL_STACK=' +
        TOTAL_STACK +
        ')'
    ),
    (TOTAL_MEMORY = totalMemory)),
  assert(
    'undefined' != typeof Int32Array &&
      'undefined' != typeof Float64Array &&
      !!new Int32Array(1).subarray &&
      !!new Int32Array(1).set,
    'JS engine does not provide full typed array support'
  ),
  Module.buffer
    ? ((buffer = Module.buffer),
      assert(
        buffer.byteLength === TOTAL_MEMORY,
        'provided buffer should be ' + TOTAL_MEMORY + ' bytes, but it is ' + buffer.byteLength
      ))
    : ((buffer = new ArrayBuffer(TOTAL_MEMORY)), assert(buffer.byteLength === TOTAL_MEMORY)),
  updateGlobalBufferViews(),
  (HEAP32[0] = 1668509029),
  (HEAP16[1] = 25459),
  115 !== HEAPU8[2] || 99 !== HEAPU8[3])
)
  throw 'Runtime error: expected the system to be little-endian!'
function callRuntimeCallbacks(e) {
  for (; 0 < e.length; ) {
    var r,
      t = e.shift()
    'function' != typeof t
      ? 'number' == typeof (r = t.func)
        ? void 0 === t.arg
          ? Runtime.dynCall('v', r)
          : Runtime.dynCall('vi', r, [t.arg])
        : r(void 0 === t.arg ? null : t.arg)
      : t()
  }
}
;(Module.HEAP = HEAP),
  (Module.buffer = buffer),
  (Module.HEAP8 = HEAP8),
  (Module.HEAP16 = HEAP16),
  (Module.HEAP32 = HEAP32),
  (Module.HEAPU8 = HEAPU8),
  (Module.HEAPU16 = HEAPU16),
  (Module.HEAPU32 = HEAPU32),
  (Module.HEAPF32 = HEAPF32),
  (Module.HEAPF64 = HEAPF64)
var __ATPRERUN__ = [],
  __ATINIT__ = [],
  __ATMAIN__ = [],
  __ATEXIT__ = [],
  __ATPOSTRUN__ = [],
  runtimeInitialized = !1,
  runtimeExited = !1
function preRun() {
  if (Module.preRun)
    for ('function' == typeof Module.preRun && (Module.preRun = [Module.preRun]); Module.preRun.length; )
      addOnPreRun(Module.preRun.shift())
  callRuntimeCallbacks(__ATPRERUN__)
}
function ensureInitRuntime() {
  checkStackCookie(), runtimeInitialized || ((runtimeInitialized = !0), callRuntimeCallbacks(__ATINIT__))
}
function preMain() {
  checkStackCookie(), callRuntimeCallbacks(__ATMAIN__)
}
function exitRuntime() {
  checkStackCookie(), callRuntimeCallbacks(__ATEXIT__), (runtimeExited = !0)
}
function postRun() {
  if ((checkStackCookie(), Module.postRun))
    for ('function' == typeof Module.postRun && (Module.postRun = [Module.postRun]); Module.postRun.length; )
      addOnPostRun(Module.postRun.shift())
  callRuntimeCallbacks(__ATPOSTRUN__)
}
function addOnPreRun(e) {
  __ATPRERUN__.unshift(e)
}
function addOnInit(e) {
  __ATINIT__.unshift(e)
}
function addOnPreMain(e) {
  __ATMAIN__.unshift(e)
}
function addOnExit(e) {
  __ATEXIT__.unshift(e)
}
function addOnPostRun(e) {
  __ATPOSTRUN__.unshift(e)
}
function intArrayFromString(e, r, t) {
  ;(t = 0 < t ? t : lengthBytesUTF8(e) + 1), (t = new Array(t)), (e = stringToUTF8Array(e, t, 0, t.length))
  return r && (t.length = e), t
}
function intArrayToString(e) {
  for (var r = [], t = 0; t < e.length; t++) {
    var n = e[t]
    255 < n &&
      (assert(!1, 'Character code ' + n + ' (' + String.fromCharCode(n) + ')  at offset ' + t + ' not in 0x00-0xFF.'),
      (n &= 255)),
      r.push(String.fromCharCode(n))
  }
  return r.join('')
}
function writeStringToMemory(e, r, t) {
  var n, i
  Runtime.warnOnce('writeStringToMemory is deprecated and should not be called! Use stringToUTF8() instead!'),
    t && ((i = r + lengthBytesUTF8(e)), (n = HEAP8[i])),
    stringToUTF8(e, r, 1 / 0),
    t && (HEAP8[i] = n)
}
function writeArrayToMemory(e, r) {
  HEAP8.set(e, r)
}
function writeAsciiToMemory(e, r, t) {
  for (var n = 0; n < e.length; ++n)
    assert((e.charCodeAt(n) === e.charCodeAt(n)) & 255), (HEAP8[r++ >> 0] = e.charCodeAt(n))
  t || (HEAP8[r >> 0] = 0)
}
;(Module.addOnPreRun = addOnPreRun),
  (Module.addOnInit = addOnInit),
  (Module.addOnPreMain = addOnPreMain),
  (Module.addOnExit = addOnExit),
  (Module.addOnPostRun = addOnPostRun),
  (Module.intArrayFromString = intArrayFromString),
  (Module.intArrayToString = intArrayToString),
  (Module.writeStringToMemory = writeStringToMemory),
  (Module.writeArrayToMemory = writeArrayToMemory),
  (Module.writeAsciiToMemory = writeAsciiToMemory),
  (Math.imul && -5 === Math.imul(4294967295, 5)) ||
    (Math.imul = function (e, r) {
      var t = 65535 & e,
        n = 65535 & r
      return (t * n + (((e >>> 16) * n + t * (r >>> 16)) << 16)) | 0
    }),
  (Math.imul = Math.imul),
  Math.clz32 ||
    (Math.clz32 = function (e) {
      e >>>= 0
      for (var r = 0; r < 32; r++) if (e & (1 << (31 - r))) return r
      return 32
    }),
  (Math.clz32 = Math.clz32),
  Math.trunc ||
    (Math.trunc = function (e) {
      return e < 0 ? Math.ceil(e) : Math.floor(e)
    }),
  (Math.trunc = Math.trunc)
var Math_abs = Math.abs,
  Math_cos = Math.cos,
  Math_sin = Math.sin,
  Math_tan = Math.tan,
  Math_acos = Math.acos,
  Math_asin = Math.asin,
  Math_atan = Math.atan,
  Math_atan2 = Math.atan2,
  Math_exp = Math.exp,
  Math_log = Math.log,
  Math_sqrt = Math.sqrt,
  Math_ceil = Math.ceil,
  Math_floor = Math.floor,
  Math_pow = Math.pow,
  Math_imul = Math.imul,
  Math_fround = Math.fround,
  Math_min = Math.min,
  Math_clz32 = Math.clz32,
  Math_trunc = Math.trunc,
  runDependencies = 0,
  runDependencyWatcher = null,
  dependenciesFulfilled = null,
  runDependencyTracking = {}
function getUniqueRunDependency(e) {
  for (var r = e; ; ) {
    if (!runDependencyTracking[e]) return e
    e = r + Math.random()
  }
  return e
}
function addRunDependency(e) {
  runDependencies++,
    Module.monitorRunDependencies && Module.monitorRunDependencies(runDependencies),
    e
      ? (assert(!runDependencyTracking[e]),
        (runDependencyTracking[e] = 1),
        null === runDependencyWatcher &&
          'undefined' != typeof setInterval &&
          (runDependencyWatcher = setInterval(function () {
            if (ABORT) return clearInterval(runDependencyWatcher), void (runDependencyWatcher = null)
            var e,
              r = !1
            for (e in runDependencyTracking)
              r || ((r = !0), Module.printErr('still waiting on run dependencies:')),
                Module.printErr('dependency: ' + e)
            r && Module.printErr('(end of list)')
          }, 1e4)))
      : Module.printErr('warning: run dependency added without ID')
}
function removeRunDependency(e) {
  runDependencies--,
    Module.monitorRunDependencies && Module.monitorRunDependencies(runDependencies),
    e
      ? (assert(runDependencyTracking[e]), delete runDependencyTracking[e])
      : Module.printErr('warning: run dependency removed without ID'),
    0 == runDependencies &&
      (null !== runDependencyWatcher && (clearInterval(runDependencyWatcher), (runDependencyWatcher = null)),
      dependenciesFulfilled && ((e = dependenciesFulfilled), (dependenciesFulfilled = null), e()))
}
;(Module.addRunDependency = addRunDependency),
  (Module.removeRunDependency = removeRunDependency),
  (Module.preloadedImages = {}),
  (Module.preloadedAudios = {})
var ASM_CONSTS = [
  function (e, r, t) {
    for (var n = new Uint8Array(r), i = 0; i < r; i++) n[i] = getValue(t + i)
    postMessage({ t: 2, file: Pointer_stringify(e), size: r, data: n })
  },
  function () {
    postMessage({ t: 1 })
  },
  function (e, r) {
    postMessage({ t: 4, current: e, total: r })
  },
]
function _emscripten_asm_const_iiii(e, r, t, n) {
  return ASM_CONSTS[e](r, t, n)
}
function _emscripten_asm_const_iii(e, r, t) {
  return ASM_CONSTS[e](r, t)
}
function _emscripten_asm_const_v(e) {
  return ASM_CONSTS[e]()
}
;(STATIC_BASE = 8),
  (STATICTOP = STATIC_BASE + 12624),
  __ATINIT__.push(),
  allocate(
    [
      3, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 24, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 80, 45, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 24, 0, 0, 0, 114, 98, 0, 123, 32, 112, 111, 115, 116, 77,
      101, 115, 115, 97, 103, 101, 40, 123, 34, 116, 34, 58, 49, 125, 41, 59, 32, 125, 0, 101, 114, 114, 111, 114, 32,
      37, 100, 10, 0, 123, 32, 118, 97, 114, 32, 100, 97, 116, 97, 32, 61, 32, 110, 101, 119, 32, 85, 105, 110, 116, 56,
      65, 114, 114, 97, 121, 40, 36, 49, 41, 59, 32, 102, 111, 114, 40, 118, 97, 114, 32, 105, 61, 48, 59, 105, 60, 36,
      49, 59, 105, 43, 43, 41, 32, 123, 32, 100, 97, 116, 97, 91, 105, 93, 32, 61, 32, 103, 101, 116, 86, 97, 108, 117,
      101, 40, 36, 50, 43, 105, 41, 59, 32, 125, 32, 112, 111, 115, 116, 77, 101, 115, 115, 97, 103, 101, 40, 123, 34,
      116, 34, 58, 50, 44, 32, 34, 102, 105, 108, 101, 34, 58, 80, 111, 105, 110, 116, 101, 114, 95, 115, 116, 114, 105,
      110, 103, 105, 102, 121, 40, 36, 48, 41, 44, 32, 34, 115, 105, 122, 101, 34, 58, 36, 49, 44, 32, 34, 100, 97, 116,
      97, 34, 58, 100, 97, 116, 97, 125, 41, 32, 125, 0, 192, 224, 240, 248, 252, 55, 122, 188, 175, 39, 28, 1, 1, 1, 0,
      1, 0, 0, 0, 0, 1, 2, 2, 3, 3, 3, 3, 123, 32, 112, 111, 115, 116, 77, 101, 115, 115, 97, 103, 101, 40, 123, 34,
      116, 34, 58, 52, 44, 32, 34, 99, 117, 114, 114, 101, 110, 116, 34, 58, 36, 48, 44, 32, 34, 116, 111, 116, 97, 108,
      34, 58, 36, 49, 125, 41, 32, 125, 0, 17, 0, 10, 0, 17, 17, 17, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 9, 0, 0, 0, 0, 11,
      0, 0, 0, 0, 0, 0, 0, 0, 17, 0, 15, 10, 17, 17, 17, 3, 10, 7, 0, 1, 19, 9, 11, 11, 0, 0, 9, 6, 11, 0, 0, 11, 0, 6,
      17, 0, 0, 0, 17, 17, 17, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0, 17, 0, 10,
      10, 17, 17, 17, 0, 10, 0, 0, 2, 0, 9, 11, 0, 0, 0, 9, 0, 11, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 12, 0, 0, 0, 0, 9, 12, 0, 0,
      0, 0, 0, 12, 0, 0, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 13, 0, 0, 0, 4, 13, 0, 0, 0, 0, 9, 14, 0, 0, 0, 0, 0, 14, 0, 0, 14, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 0, 0, 0, 0, 15, 0, 0,
      0, 0, 9, 16, 0, 0, 0, 0, 0, 16, 0, 0, 16, 0, 0, 18, 0, 0, 0, 18, 18, 18, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 18, 0, 0, 0, 18, 18, 18, 0, 0, 0, 0, 0, 0, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 0,
      0, 0, 0, 10, 0, 0, 0, 0, 9, 11, 0, 0, 0, 0, 0, 11, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 12, 0, 0, 0, 0, 9, 12, 0, 0, 0, 0, 0,
      12, 0, 0, 12, 0, 0, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 65, 66, 67, 68, 69, 70, 45, 43, 32, 32, 32, 48, 88,
      48, 120, 0, 40, 110, 117, 108, 108, 41, 0, 45, 48, 88, 43, 48, 88, 32, 48, 88, 45, 48, 120, 43, 48, 120, 32, 48,
      120, 0, 105, 110, 102, 0, 73, 78, 70, 0, 110, 97, 110, 0, 78, 65, 78, 0, 46, 0, 84, 33, 34, 25, 13, 1, 2, 3, 17,
      75, 28, 12, 16, 4, 11, 29, 18, 30, 39, 104, 110, 111, 112, 113, 98, 32, 5, 6, 15, 19, 20, 21, 26, 8, 22, 7, 40,
      36, 23, 24, 9, 10, 14, 27, 31, 37, 35, 131, 130, 125, 38, 42, 43, 60, 61, 62, 63, 67, 71, 74, 77, 88, 89, 90, 91,
      92, 93, 94, 95, 96, 97, 99, 100, 101, 102, 103, 105, 106, 107, 108, 114, 115, 116, 121, 122, 123, 124, 0, 73, 108,
      108, 101, 103, 97, 108, 32, 98, 121, 116, 101, 32, 115, 101, 113, 117, 101, 110, 99, 101, 0, 68, 111, 109, 97,
      105, 110, 32, 101, 114, 114, 111, 114, 0, 82, 101, 115, 117, 108, 116, 32, 110, 111, 116, 32, 114, 101, 112, 114,
      101, 115, 101, 110, 116, 97, 98, 108, 101, 0, 78, 111, 116, 32, 97, 32, 116, 116, 121, 0, 80, 101, 114, 109, 105,
      115, 115, 105, 111, 110, 32, 100, 101, 110, 105, 101, 100, 0, 79, 112, 101, 114, 97, 116, 105, 111, 110, 32, 110,
      111, 116, 32, 112, 101, 114, 109, 105, 116, 116, 101, 100, 0, 78, 111, 32, 115, 117, 99, 104, 32, 102, 105, 108,
      101, 32, 111, 114, 32, 100, 105, 114, 101, 99, 116, 111, 114, 121, 0, 78, 111, 32, 115, 117, 99, 104, 32, 112,
      114, 111, 99, 101, 115, 115, 0, 70, 105, 108, 101, 32, 101, 120, 105, 115, 116, 115, 0, 86, 97, 108, 117, 101, 32,
      116, 111, 111, 32, 108, 97, 114, 103, 101, 32, 102, 111, 114, 32, 100, 97, 116, 97, 32, 116, 121, 112, 101, 0, 78,
      111, 32, 115, 112, 97, 99, 101, 32, 108, 101, 102, 116, 32, 111, 110, 32, 100, 101, 118, 105, 99, 101, 0, 79, 117,
      116, 32, 111, 102, 32, 109, 101, 109, 111, 114, 121, 0, 82, 101, 115, 111, 117, 114, 99, 101, 32, 98, 117, 115,
      121, 0, 73, 110, 116, 101, 114, 114, 117, 112, 116, 101, 100, 32, 115, 121, 115, 116, 101, 109, 32, 99, 97, 108,
      108, 0, 82, 101, 115, 111, 117, 114, 99, 101, 32, 116, 101, 109, 112, 111, 114, 97, 114, 105, 108, 121, 32, 117,
      110, 97, 118, 97, 105, 108, 97, 98, 108, 101, 0, 73, 110, 118, 97, 108, 105, 100, 32, 115, 101, 101, 107, 0, 67,
      114, 111, 115, 115, 45, 100, 101, 118, 105, 99, 101, 32, 108, 105, 110, 107, 0, 82, 101, 97, 100, 45, 111, 110,
      108, 121, 32, 102, 105, 108, 101, 32, 115, 121, 115, 116, 101, 109, 0, 68, 105, 114, 101, 99, 116, 111, 114, 121,
      32, 110, 111, 116, 32, 101, 109, 112, 116, 121, 0, 67, 111, 110, 110, 101, 99, 116, 105, 111, 110, 32, 114, 101,
      115, 101, 116, 32, 98, 121, 32, 112, 101, 101, 114, 0, 79, 112, 101, 114, 97, 116, 105, 111, 110, 32, 116, 105,
      109, 101, 100, 32, 111, 117, 116, 0, 67, 111, 110, 110, 101, 99, 116, 105, 111, 110, 32, 114, 101, 102, 117, 115,
      101, 100, 0, 72, 111, 115, 116, 32, 105, 115, 32, 100, 111, 119, 110, 0, 72, 111, 115, 116, 32, 105, 115, 32, 117,
      110, 114, 101, 97, 99, 104, 97, 98, 108, 101, 0, 65, 100, 100, 114, 101, 115, 115, 32, 105, 110, 32, 117, 115,
      101, 0, 66, 114, 111, 107, 101, 110, 32, 112, 105, 112, 101, 0, 73, 47, 79, 32, 101, 114, 114, 111, 114, 0, 78,
      111, 32, 115, 117, 99, 104, 32, 100, 101, 118, 105, 99, 101, 32, 111, 114, 32, 97, 100, 100, 114, 101, 115, 115,
      0, 66, 108, 111, 99, 107, 32, 100, 101, 118, 105, 99, 101, 32, 114, 101, 113, 117, 105, 114, 101, 100, 0, 78, 111,
      32, 115, 117, 99, 104, 32, 100, 101, 118, 105, 99, 101, 0, 78, 111, 116, 32, 97, 32, 100, 105, 114, 101, 99, 116,
      111, 114, 121, 0, 73, 115, 32, 97, 32, 100, 105, 114, 101, 99, 116, 111, 114, 121, 0, 84, 101, 120, 116, 32, 102,
      105, 108, 101, 32, 98, 117, 115, 121, 0, 69, 120, 101, 99, 32, 102, 111, 114, 109, 97, 116, 32, 101, 114, 114,
      111, 114, 0, 73, 110, 118, 97, 108, 105, 100, 32, 97, 114, 103, 117, 109, 101, 110, 116, 0, 65, 114, 103, 117,
      109, 101, 110, 116, 32, 108, 105, 115, 116, 32, 116, 111, 111, 32, 108, 111, 110, 103, 0, 83, 121, 109, 98, 111,
      108, 105, 99, 32, 108, 105, 110, 107, 32, 108, 111, 111, 112, 0, 70, 105, 108, 101, 110, 97, 109, 101, 32, 116,
      111, 111, 32, 108, 111, 110, 103, 0, 84, 111, 111, 32, 109, 97, 110, 121, 32, 111, 112, 101, 110, 32, 102, 105,
      108, 101, 115, 32, 105, 110, 32, 115, 121, 115, 116, 101, 109, 0, 78, 111, 32, 102, 105, 108, 101, 32, 100, 101,
      115, 99, 114, 105, 112, 116, 111, 114, 115, 32, 97, 118, 97, 105, 108, 97, 98, 108, 101, 0, 66, 97, 100, 32, 102,
      105, 108, 101, 32, 100, 101, 115, 99, 114, 105, 112, 116, 111, 114, 0, 78, 111, 32, 99, 104, 105, 108, 100, 32,
      112, 114, 111, 99, 101, 115, 115, 0, 66, 97, 100, 32, 97, 100, 100, 114, 101, 115, 115, 0, 70, 105, 108, 101, 32,
      116, 111, 111, 32, 108, 97, 114, 103, 101, 0, 84, 111, 111, 32, 109, 97, 110, 121, 32, 108, 105, 110, 107, 115, 0,
      78, 111, 32, 108, 111, 99, 107, 115, 32, 97, 118, 97, 105, 108, 97, 98, 108, 101, 0, 82, 101, 115, 111, 117, 114,
      99, 101, 32, 100, 101, 97, 100, 108, 111, 99, 107, 32, 119, 111, 117, 108, 100, 32, 111, 99, 99, 117, 114, 0, 83,
      116, 97, 116, 101, 32, 110, 111, 116, 32, 114, 101, 99, 111, 118, 101, 114, 97, 98, 108, 101, 0, 80, 114, 101,
      118, 105, 111, 117, 115, 32, 111, 119, 110, 101, 114, 32, 100, 105, 101, 100, 0, 79, 112, 101, 114, 97, 116, 105,
      111, 110, 32, 99, 97, 110, 99, 101, 108, 101, 100, 0, 70, 117, 110, 99, 116, 105, 111, 110, 32, 110, 111, 116, 32,
      105, 109, 112, 108, 101, 109, 101, 110, 116, 101, 100, 0, 78, 111, 32, 109, 101, 115, 115, 97, 103, 101, 32, 111,
      102, 32, 100, 101, 115, 105, 114, 101, 100, 32, 116, 121, 112, 101, 0, 73, 100, 101, 110, 116, 105, 102, 105, 101,
      114, 32, 114, 101, 109, 111, 118, 101, 100, 0, 68, 101, 118, 105, 99, 101, 32, 110, 111, 116, 32, 97, 32, 115,
      116, 114, 101, 97, 109, 0, 78, 111, 32, 100, 97, 116, 97, 32, 97, 118, 97, 105, 108, 97, 98, 108, 101, 0, 68, 101,
      118, 105, 99, 101, 32, 116, 105, 109, 101, 111, 117, 116, 0, 79, 117, 116, 32, 111, 102, 32, 115, 116, 114, 101,
      97, 109, 115, 32, 114, 101, 115, 111, 117, 114, 99, 101, 115, 0, 76, 105, 110, 107, 32, 104, 97, 115, 32, 98, 101,
      101, 110, 32, 115, 101, 118, 101, 114, 101, 100, 0, 80, 114, 111, 116, 111, 99, 111, 108, 32, 101, 114, 114, 111,
      114, 0, 66, 97, 100, 32, 109, 101, 115, 115, 97, 103, 101, 0, 70, 105, 108, 101, 32, 100, 101, 115, 99, 114, 105,
      112, 116, 111, 114, 32, 105, 110, 32, 98, 97, 100, 32, 115, 116, 97, 116, 101, 0, 78, 111, 116, 32, 97, 32, 115,
      111, 99, 107, 101, 116, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 97, 100, 100, 114, 101, 115,
      115, 32, 114, 101, 113, 117, 105, 114, 101, 100, 0, 77, 101, 115, 115, 97, 103, 101, 32, 116, 111, 111, 32, 108,
      97, 114, 103, 101, 0, 80, 114, 111, 116, 111, 99, 111, 108, 32, 119, 114, 111, 110, 103, 32, 116, 121, 112, 101,
      32, 102, 111, 114, 32, 115, 111, 99, 107, 101, 116, 0, 80, 114, 111, 116, 111, 99, 111, 108, 32, 110, 111, 116,
      32, 97, 118, 97, 105, 108, 97, 98, 108, 101, 0, 80, 114, 111, 116, 111, 99, 111, 108, 32, 110, 111, 116, 32, 115,
      117, 112, 112, 111, 114, 116, 101, 100, 0, 83, 111, 99, 107, 101, 116, 32, 116, 121, 112, 101, 32, 110, 111, 116,
      32, 115, 117, 112, 112, 111, 114, 116, 101, 100, 0, 78, 111, 116, 32, 115, 117, 112, 112, 111, 114, 116, 101, 100,
      0, 80, 114, 111, 116, 111, 99, 111, 108, 32, 102, 97, 109, 105, 108, 121, 32, 110, 111, 116, 32, 115, 117, 112,
      112, 111, 114, 116, 101, 100, 0, 65, 100, 100, 114, 101, 115, 115, 32, 102, 97, 109, 105, 108, 121, 32, 110, 111,
      116, 32, 115, 117, 112, 112, 111, 114, 116, 101, 100, 32, 98, 121, 32, 112, 114, 111, 116, 111, 99, 111, 108, 0,
      65, 100, 100, 114, 101, 115, 115, 32, 110, 111, 116, 32, 97, 118, 97, 105, 108, 97, 98, 108, 101, 0, 78, 101, 116,
      119, 111, 114, 107, 32, 105, 115, 32, 100, 111, 119, 110, 0, 78, 101, 116, 119, 111, 114, 107, 32, 117, 110, 114,
      101, 97, 99, 104, 97, 98, 108, 101, 0, 67, 111, 110, 110, 101, 99, 116, 105, 111, 110, 32, 114, 101, 115, 101,
      116, 32, 98, 121, 32, 110, 101, 116, 119, 111, 114, 107, 0, 67, 111, 110, 110, 101, 99, 116, 105, 111, 110, 32,
      97, 98, 111, 114, 116, 101, 100, 0, 78, 111, 32, 98, 117, 102, 102, 101, 114, 32, 115, 112, 97, 99, 101, 32, 97,
      118, 97, 105, 108, 97, 98, 108, 101, 0, 83, 111, 99, 107, 101, 116, 32, 105, 115, 32, 99, 111, 110, 110, 101, 99,
      116, 101, 100, 0, 83, 111, 99, 107, 101, 116, 32, 110, 111, 116, 32, 99, 111, 110, 110, 101, 99, 116, 101, 100, 0,
      67, 97, 110, 110, 111, 116, 32, 115, 101, 110, 100, 32, 97, 102, 116, 101, 114, 32, 115, 111, 99, 107, 101, 116,
      32, 115, 104, 117, 116, 100, 111, 119, 110, 0, 79, 112, 101, 114, 97, 116, 105, 111, 110, 32, 97, 108, 114, 101,
      97, 100, 121, 32, 105, 110, 32, 112, 114, 111, 103, 114, 101, 115, 115, 0, 79, 112, 101, 114, 97, 116, 105, 111,
      110, 32, 105, 110, 32, 112, 114, 111, 103, 114, 101, 115, 115, 0, 83, 116, 97, 108, 101, 32, 102, 105, 108, 101,
      32, 104, 97, 110, 100, 108, 101, 0, 82, 101, 109, 111, 116, 101, 32, 73, 47, 79, 32, 101, 114, 114, 111, 114, 0,
      81, 117, 111, 116, 97, 32, 101, 120, 99, 101, 101, 100, 101, 100, 0, 78, 111, 32, 109, 101, 100, 105, 117, 109,
      32, 102, 111, 117, 110, 100, 0, 87, 114, 111, 110, 103, 32, 109, 101, 100, 105, 117, 109, 32, 116, 121, 112, 101,
      0, 78, 111, 32, 101, 114, 114, 111, 114, 32, 105, 110, 102, 111, 114, 109, 97, 116, 105, 111, 110, 0, 0, 114, 119,
      97, 0,
    ],
    'i8',
    ALLOC_NONE,
    Runtime.GLOBAL_BASE
  )
var tempDoublePtr = STATICTOP
function _pthread_cleanup_push(e, r) {
  __ATEXIT__.push(function () {
    Runtime.dynCall('vi', e, [r])
  }),
    (_pthread_cleanup_push.level = __ATEXIT__.length)
}
function _pthread_cleanup_pop() {
  assert(_pthread_cleanup_push.level == __ATEXIT__.length, 'cannot pop if something else added meanwhile!'),
    __ATEXIT__.pop(),
    (_pthread_cleanup_push.level = __ATEXIT__.length)
}
function _abort() {
  Module.abort()
}
;(STATICTOP += 16),
  assert(tempDoublePtr % 8 == 0),
  (Module._i64Subtract = _i64Subtract),
  (Module._i64Add = _i64Add),
  (Module._memset = _memset),
  (Module._bitshift64Lshr = _bitshift64Lshr),
  (Module._bitshift64Shl = _bitshift64Shl)
var ERRNO_CODES = {
    EPERM: 1,
    ENOENT: 2,
    ESRCH: 3,
    EINTR: 4,
    EIO: 5,
    ENXIO: 6,
    E2BIG: 7,
    ENOEXEC: 8,
    EBADF: 9,
    ECHILD: 10,
    EAGAIN: 11,
    EWOULDBLOCK: 11,
    ENOMEM: 12,
    EACCES: 13,
    EFAULT: 14,
    ENOTBLK: 15,
    EBUSY: 16,
    EEXIST: 17,
    EXDEV: 18,
    ENODEV: 19,
    ENOTDIR: 20,
    EISDIR: 21,
    EINVAL: 22,
    ENFILE: 23,
    EMFILE: 24,
    ENOTTY: 25,
    ETXTBSY: 26,
    EFBIG: 27,
    ENOSPC: 28,
    ESPIPE: 29,
    EROFS: 30,
    EMLINK: 31,
    EPIPE: 32,
    EDOM: 33,
    ERANGE: 34,
    ENOMSG: 42,
    EIDRM: 43,
    ECHRNG: 44,
    EL2NSYNC: 45,
    EL3HLT: 46,
    EL3RST: 47,
    ELNRNG: 48,
    EUNATCH: 49,
    ENOCSI: 50,
    EL2HLT: 51,
    EDEADLK: 35,
    ENOLCK: 37,
    EBADE: 52,
    EBADR: 53,
    EXFULL: 54,
    ENOANO: 55,
    EBADRQC: 56,
    EBADSLT: 57,
    EDEADLOCK: 35,
    EBFONT: 59,
    ENOSTR: 60,
    ENODATA: 61,
    ETIME: 62,
    ENOSR: 63,
    ENONET: 64,
    ENOPKG: 65,
    EREMOTE: 66,
    ENOLINK: 67,
    EADV: 68,
    ESRMNT: 69,
    ECOMM: 70,
    EPROTO: 71,
    EMULTIHOP: 72,
    EDOTDOT: 73,
    EBADMSG: 74,
    ENOTUNIQ: 76,
    EBADFD: 77,
    EREMCHG: 78,
    ELIBACC: 79,
    ELIBBAD: 80,
    ELIBSCN: 81,
    ELIBMAX: 82,
    ELIBEXEC: 83,
    ENOSYS: 38,
    ENOTEMPTY: 39,
    ENAMETOOLONG: 36,
    ELOOP: 40,
    EOPNOTSUPP: 95,
    EPFNOSUPPORT: 96,
    ECONNRESET: 104,
    ENOBUFS: 105,
    EAFNOSUPPORT: 97,
    EPROTOTYPE: 91,
    ENOTSOCK: 88,
    ENOPROTOOPT: 92,
    ESHUTDOWN: 108,
    ECONNREFUSED: 111,
    EADDRINUSE: 98,
    ECONNABORTED: 103,
    ENETUNREACH: 101,
    ENETDOWN: 100,
    ETIMEDOUT: 110,
    EHOSTDOWN: 112,
    EHOSTUNREACH: 113,
    EINPROGRESS: 115,
    EALREADY: 114,
    EDESTADDRREQ: 89,
    EMSGSIZE: 90,
    EPROTONOSUPPORT: 93,
    ESOCKTNOSUPPORT: 94,
    EADDRNOTAVAIL: 99,
    ENETRESET: 102,
    EISCONN: 106,
    ENOTCONN: 107,
    ETOOMANYREFS: 109,
    EUSERS: 87,
    EDQUOT: 122,
    ESTALE: 116,
    ENOTSUP: 95,
    ENOMEDIUM: 123,
    EILSEQ: 84,
    EOVERFLOW: 75,
    ECANCELED: 125,
    ENOTRECOVERABLE: 131,
    EOWNERDEAD: 130,
    ESTRPIPE: 86,
  },
  ERRNO_MESSAGES = {
    0: 'Success',
    1: 'Not super-user',
    2: 'No such file or directory',
    3: 'No such process',
    4: 'Interrupted system call',
    5: 'I/O error',
    6: 'No such device or address',
    7: 'Arg list too long',
    8: 'Exec format error',
    9: 'Bad file number',
    10: 'No children',
    11: 'No more processes',
    12: 'Not enough core',
    13: 'Permission denied',
    14: 'Bad address',
    15: 'Block device required',
    16: 'Mount device busy',
    17: 'File exists',
    18: 'Cross-device link',
    19: 'No such device',
    20: 'Not a directory',
    21: 'Is a directory',
    22: 'Invalid argument',
    23: 'Too many open files in system',
    24: 'Too many open files',
    25: 'Not a typewriter',
    26: 'Text file busy',
    27: 'File too large',
    28: 'No space left on device',
    29: 'Illegal seek',
    30: 'Read only file system',
    31: 'Too many links',
    32: 'Broken pipe',
    33: 'Math arg out of domain of func',
    34: 'Math result not representable',
    35: 'File locking deadlock error',
    36: 'File or path name too long',
    37: 'No record locks available',
    38: 'Function not implemented',
    39: 'Directory not empty',
    40: 'Too many symbolic links',
    42: 'No message of desired type',
    43: 'Identifier removed',
    44: 'Channel number out of range',
    45: 'Level 2 not synchronized',
    46: 'Level 3 halted',
    47: 'Level 3 reset',
    48: 'Link number out of range',
    49: 'Protocol driver not attached',
    50: 'No CSI structure available',
    51: 'Level 2 halted',
    52: 'Invalid exchange',
    53: 'Invalid request descriptor',
    54: 'Exchange full',
    55: 'No anode',
    56: 'Invalid request code',
    57: 'Invalid slot',
    59: 'Bad font file fmt',
    60: 'Device not a stream',
    61: 'No data (for no delay io)',
    62: 'Timer expired',
    63: 'Out of streams resources',
    64: 'Machine is not on the network',
    65: 'Package not installed',
    66: 'The object is remote',
    67: 'The link has been severed',
    68: 'Advertise error',
    69: 'Srmount error',
    70: 'Communication error on send',
    71: 'Protocol error',
    72: 'Multihop attempted',
    73: 'Cross mount point (not really error)',
    74: 'Trying to read unreadable message',
    75: 'Value too large for defined data type',
    76: 'Given log. name not unique',
    77: 'f.d. invalid for this operation',
    78: 'Remote address changed',
    79: 'Can   access a needed shared lib',
    80: 'Accessing a corrupted shared lib',
    81: '.lib section in a.out corrupted',
    82: 'Attempting to link in too many libs',
    83: 'Attempting to exec a shared library',
    84: 'Illegal byte sequence',
    86: 'Streams pipe error',
    87: 'Too many users',
    88: 'Socket operation on non-socket',
    89: 'Destination address required',
    90: 'Message too long',
    91: 'Protocol wrong type for socket',
    92: 'Protocol not available',
    93: 'Unknown protocol',
    94: 'Socket type not supported',
    95: 'Not supported',
    96: 'Protocol family not supported',
    97: 'Address family not supported by protocol family',
    98: 'Address already in use',
    99: 'Address not available',
    100: 'Network interface is not configured',
    101: 'Network is unreachable',
    102: 'Connection reset by network',
    103: 'Connection aborted',
    104: 'Connection reset by peer',
    105: 'No buffer space available',
    106: 'Socket is already connected',
    107: 'Socket is not connected',
    108: "Can't send after socket shutdown",
    109: 'Too many references',
    110: 'Connection timed out',
    111: 'Connection refused',
    112: 'Host is down',
    113: 'Host is unreachable',
    114: 'Socket already connected',
    115: 'Connection already in progress',
    116: 'Stale file handle',
    122: 'Quota exceeded',
    123: 'No medium (in tape drive)',
    125: 'Operation canceled',
    130: 'Previous owner died',
    131: 'State not recoverable',
  }
function ___setErrNo(e) {
  return (
    Module.___errno_location
      ? (HEAP32[Module.___errno_location() >> 2] = e)
      : Module.printErr('failed to set errno from JS'),
    e
  )
}
var PATH = {
    splitPath: function (e) {
      return /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/.exec(e).slice(1)
    },
    normalizeArray: function (e, r) {
      for (var t = 0, n = e.length - 1; 0 <= n; n--) {
        var i = e[n]
        '.' === i ? e.splice(n, 1) : '..' === i ? (e.splice(n, 1), t++) : t && (e.splice(n, 1), t--)
      }
      if (r) for (; t--; ) e.unshift('..')
      return e
    },
    normalize: function (e) {
      var r = '/' === e.charAt(0),
        t = '/' === e.substr(-1)
      return (
        (e = PATH.normalizeArray(
          e.split('/').filter(function (e) {
            return !!e
          }),
          !r
        ).join('/')) ||
          r ||
          (e = '.'),
        e && t && (e += '/'),
        (r ? '/' : '') + e
      )
    },
    dirname: function (e) {
      var r = PATH.splitPath(e),
        e = r[0],
        r = r[1]
      return e || r ? e + (r = r && r.substr(0, r.length - 1)) : '.'
    },
    basename: function (e) {
      if ('/' === e) return '/'
      var r = e.lastIndexOf('/')
      return -1 === r ? e : e.substr(r + 1)
    },
    extname: function (e) {
      return PATH.splitPath(e)[3]
    },
    join: function () {
      var e = Array.prototype.slice.call(arguments, 0)
      return PATH.normalize(e.join('/'))
    },
    join2: function (e, r) {
      return PATH.normalize(e + '/' + r)
    },
    resolve: function () {
      for (var e = '', r = !1, t = arguments.length - 1; -1 <= t && !r; t--) {
        var n = 0 <= t ? arguments[t] : FS.cwd()
        if ('string' != typeof n) throw new TypeError('Arguments to path.resolve must be strings')
        if (!n) return ''
        ;(e = n + '/' + e), (r = '/' === n.charAt(0))
      }
      return (
        (r ? '/' : '') +
          (e = PATH.normalizeArray(
            e.split('/').filter(function (e) {
              return !!e
            }),
            !r
          ).join('/')) || '.'
      )
    },
    relative: function (e, r) {
      function t(e) {
        for (var r = 0; r < e.length && '' === e[r]; r++);
        for (var t = e.length - 1; 0 <= t && '' === e[t]; t--);
        return t < r ? [] : e.slice(r, t - r + 1)
      }
      ;(e = PATH.resolve(e).substr(1)), (r = PATH.resolve(r).substr(1))
      for (var n = t(e.split('/')), i = t(r.split('/')), o = Math.min(n.length, i.length), a = o, u = 0; u < o; u++)
        if (n[u] !== i[u]) {
          a = u
          break
        }
      for (var s = [], u = a; u < n.length; u++) s.push('..')
      return (s = s.concat(i.slice(a))).join('/')
    },
  },
  TTY = {
    ttys: [],
    init: function () {},
    shutdown: function () {},
    register: function (e, r) {
      ;(TTY.ttys[e] = { input: [], output: [], ops: r }), FS.registerDevice(e, TTY.stream_ops)
    },
    stream_ops: {
      open: function (e) {
        var r = TTY.ttys[e.node.rdev]
        if (!r) throw new FS.ErrnoError(ERRNO_CODES.ENODEV)
        ;(e.tty = r), (e.seekable = !1)
      },
      close: function (e) {
        e.tty.ops.flush(e.tty)
      },
      flush: function (e) {
        e.tty.ops.flush(e.tty)
      },
      read: function (e, r, t, n, i) {
        if (!e.tty || !e.tty.ops.get_char) throw new FS.ErrnoError(ERRNO_CODES.ENXIO)
        for (var o, a = 0, u = 0; u < n; u++) {
          try {
            o = e.tty.ops.get_char(e.tty)
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO)
          }
          if (void 0 === o && 0 === a) throw new FS.ErrnoError(ERRNO_CODES.EAGAIN)
          if (null == o) break
          a++, (r[t + u] = o)
        }
        return a && (e.node.timestamp = Date.now()), a
      },
      write: function (e, r, t, n, i) {
        if (!e.tty || !e.tty.ops.put_char) throw new FS.ErrnoError(ERRNO_CODES.ENXIO)
        for (var o = 0; o < n; o++)
          try {
            e.tty.ops.put_char(e.tty, r[t + o])
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO)
          }
        return n && (e.node.timestamp = Date.now()), o
      },
    },
    default_tty_ops: {
      get_char: function (e) {
        if (!e.input.length) {
          var r = null
          if (ENVIRONMENT_IS_NODE) {
            var t = new Buffer(256),
              n = 0,
              i = 'win32' != process.platform,
              o = process.stdin.fd
            if (i) {
              var a = !1
              try {
                ;(o = fs.openSync('/dev/stdin', 'r')), (a = !0)
              } catch (e) {}
            }
            try {
              n = fs.readSync(o, t, 0, 256, null)
            } catch (e) {
              if (-1 == e.toString().indexOf('EOF')) throw e
              n = 0
            }
            a && fs.closeSync(o), (r = 0 < n ? t.slice(0, n).toString('utf-8') : null)
          } else
            'undefined' != typeof window && 'function' == typeof window.prompt
              ? null !== (r = window.prompt('Input: ')) && (r += '\n')
              : 'function' == typeof readline && null !== (r = readline()) && (r += '\n')
          if (!r) return null
          e.input = intArrayFromString(r, !0)
        }
        return e.input.shift()
      },
      put_char: function (e, r) {
        null === r || 10 === r
          ? (Module.print(UTF8ArrayToString(e.output, 0)), (e.output = []))
          : 0 != r && e.output.push(r)
      },
      flush: function (e) {
        e.output && 0 < e.output.length && (Module.print(UTF8ArrayToString(e.output, 0)), (e.output = []))
      },
    },
    default_tty1_ops: {
      put_char: function (e, r) {
        null === r || 10 === r
          ? (Module.printErr(UTF8ArrayToString(e.output, 0)), (e.output = []))
          : 0 != r && e.output.push(r)
      },
      flush: function (e) {
        e.output && 0 < e.output.length && (Module.printErr(UTF8ArrayToString(e.output, 0)), (e.output = []))
      },
    },
  },
  MEMFS = {
    ops_table: null,
    mount: function (e) {
      return MEMFS.createNode(null, '/', 16895, 0)
    },
    createNode: function (e, r, t, n) {
      if (FS.isBlkdev(t) || FS.isFIFO(t)) throw new FS.ErrnoError(ERRNO_CODES.EPERM)
      MEMFS.ops_table ||
        (MEMFS.ops_table = {
          dir: {
            node: {
              getattr: MEMFS.node_ops.getattr,
              setattr: MEMFS.node_ops.setattr,
              lookup: MEMFS.node_ops.lookup,
              mknod: MEMFS.node_ops.mknod,
              rename: MEMFS.node_ops.rename,
              unlink: MEMFS.node_ops.unlink,
              rmdir: MEMFS.node_ops.rmdir,
              readdir: MEMFS.node_ops.readdir,
              symlink: MEMFS.node_ops.symlink,
            },
            stream: { llseek: MEMFS.stream_ops.llseek },
          },
          file: {
            node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr },
            stream: {
              llseek: MEMFS.stream_ops.llseek,
              read: MEMFS.stream_ops.read,
              write: MEMFS.stream_ops.write,
              allocate: MEMFS.stream_ops.allocate,
              mmap: MEMFS.stream_ops.mmap,
              msync: MEMFS.stream_ops.msync,
            },
          },
          link: {
            node: {
              getattr: MEMFS.node_ops.getattr,
              setattr: MEMFS.node_ops.setattr,
              readlink: MEMFS.node_ops.readlink,
            },
            stream: {},
          },
          chrdev: {
            node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr },
            stream: FS.chrdev_stream_ops,
          },
        })
      n = FS.createNode(e, r, t, n)
      return (
        FS.isDir(n.mode)
          ? ((n.node_ops = MEMFS.ops_table.dir.node), (n.stream_ops = MEMFS.ops_table.dir.stream), (n.contents = {}))
          : FS.isFile(n.mode)
            ? ((n.node_ops = MEMFS.ops_table.file.node),
              (n.stream_ops = MEMFS.ops_table.file.stream),
              (n.usedBytes = 0),
              (n.contents = null))
            : FS.isLink(n.mode)
              ? ((n.node_ops = MEMFS.ops_table.link.node), (n.stream_ops = MEMFS.ops_table.link.stream))
              : FS.isChrdev(n.mode) &&
                ((n.node_ops = MEMFS.ops_table.chrdev.node), (n.stream_ops = MEMFS.ops_table.chrdev.stream)),
        (n.timestamp = Date.now()),
        e && (e.contents[r] = n),
        n
      )
    },
    getFileDataAsRegularArray: function (e) {
      if (e.contents && e.contents.subarray) {
        for (var r = [], t = 0; t < e.usedBytes; ++t) r.push(e.contents[t])
        return r
      }
      return e.contents
    },
    getFileDataAsTypedArray: function (e) {
      return e.contents
        ? e.contents.subarray
          ? e.contents.subarray(0, e.usedBytes)
          : new Uint8Array(e.contents)
        : new Uint8Array()
    },
    expandFileStorage: function (e, r) {
      if (
        (e.contents &&
          e.contents.subarray &&
          r > e.contents.length &&
          ((e.contents = MEMFS.getFileDataAsRegularArray(e)), (e.usedBytes = e.contents.length)),
        !e.contents || e.contents.subarray)
      ) {
        var t = e.contents ? e.contents.buffer.byteLength : 0
        if (r <= t) return
        ;(r = Math.max(r, (t * (t < 1048576 ? 2 : 1.125)) | 0)), 0 != t && (r = Math.max(r, 256))
        t = e.contents
        return (e.contents = new Uint8Array(r)), void (0 < e.usedBytes && e.contents.set(t.subarray(0, e.usedBytes), 0))
      }
      for (!e.contents && 0 < r && (e.contents = []); e.contents.length < r; ) e.contents.push(0)
    },
    resizeFileStorage: function (e, r) {
      if (e.usedBytes != r) {
        if (0 == r) return (e.contents = null), void (e.usedBytes = 0)
        if (!e.contents || e.contents.subarray) {
          var t = e.contents
          return (
            (e.contents = new Uint8Array(new ArrayBuffer(r))),
            t && e.contents.set(t.subarray(0, Math.min(r, e.usedBytes))),
            void (e.usedBytes = r)
          )
        }
        if ((e.contents || (e.contents = []), e.contents.length > r)) e.contents.length = r
        else for (; e.contents.length < r; ) e.contents.push(0)
        e.usedBytes = r
      }
    },
    node_ops: {
      getattr: function (e) {
        var r = {}
        return (
          (r.dev = FS.isChrdev(e.mode) ? e.id : 1),
          (r.ino = e.id),
          (r.mode = e.mode),
          (r.nlink = 1),
          (r.uid = 0),
          (r.gid = 0),
          (r.rdev = e.rdev),
          FS.isDir(e.mode)
            ? (r.size = 4096)
            : FS.isFile(e.mode)
              ? (r.size = e.usedBytes)
              : FS.isLink(e.mode)
                ? (r.size = e.link.length)
                : (r.size = 0),
          (r.atime = new Date(e.timestamp)),
          (r.mtime = new Date(e.timestamp)),
          (r.ctime = new Date(e.timestamp)),
          (r.blksize = 4096),
          (r.blocks = Math.ceil(r.size / r.blksize)),
          r
        )
      },
      setattr: function (e, r) {
        void 0 !== r.mode && (e.mode = r.mode),
          void 0 !== r.timestamp && (e.timestamp = r.timestamp),
          void 0 !== r.size && MEMFS.resizeFileStorage(e, r.size)
      },
      lookup: function (e, r) {
        throw FS.genericErrors[ERRNO_CODES.ENOENT]
      },
      mknod: function (e, r, t, n) {
        return MEMFS.createNode(e, r, t, n)
      },
      rename: function (e, r, t) {
        if (FS.isDir(e.mode)) {
          var n
          try {
            n = FS.lookupNode(r, t)
          } catch (e) {}
          if (n) for (var i in n.contents) throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY)
        }
        delete e.parent.contents[e.name], (e.name = t), ((r.contents[t] = e).parent = r)
      },
      unlink: function (e, r) {
        delete e.contents[r]
      },
      rmdir: function (e, r) {
        for (var t in FS.lookupNode(e, r).contents) throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY)
        delete e.contents[r]
      },
      readdir: function (e) {
        var r,
          t = ['.', '..']
        for (r in e.contents) e.contents.hasOwnProperty(r) && t.push(r)
        return t
      },
      symlink: function (e, r, t) {
        r = MEMFS.createNode(e, r, 41471, 0)
        return (r.link = t), r
      },
      readlink: function (e) {
        if (!FS.isLink(e.mode)) throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
        return e.link
      },
    },
    stream_ops: {
      read: function (e, r, t, n, i) {
        var o = e.node.contents
        if (i >= e.node.usedBytes) return 0
        var a = Math.min(e.node.usedBytes - i, n)
        if ((assert(0 <= a), 8 < a && o.subarray)) r.set(o.subarray(i, i + a), t)
        else for (var u = 0; u < a; u++) r[t + u] = o[i + u]
        return a
      },
      write: function (e, r, t, n, i, o) {
        if (!n) return 0
        var a = e.node
        if (((a.timestamp = Date.now()), r.subarray && (!a.contents || a.contents.subarray))) {
          if (o)
            return (
              assert(0 === i, 'canOwn must imply no weird position inside the file'),
              (a.contents = r.subarray(t, t + n)),
              (a.usedBytes = n)
            )
          if (0 === a.usedBytes && 0 === i)
            return (a.contents = new Uint8Array(r.subarray(t, t + n))), (a.usedBytes = n)
          if (i + n <= a.usedBytes) return a.contents.set(r.subarray(t, t + n), i), n
        }
        if ((MEMFS.expandFileStorage(a, i + n), a.contents.subarray && r.subarray))
          a.contents.set(r.subarray(t, t + n), i)
        else for (var u = 0; u < n; u++) a.contents[i + u] = r[t + u]
        return (a.usedBytes = Math.max(a.usedBytes, i + n)), n
      },
      llseek: function (e, r, t) {
        if ((1 === t ? (r += e.position) : 2 === t && FS.isFile(e.node.mode) && (r += e.node.usedBytes), r < 0))
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
        return r
      },
      allocate: function (e, r, t) {
        MEMFS.expandFileStorage(e.node, r + t), (e.node.usedBytes = Math.max(e.node.usedBytes, r + t))
      },
      mmap: function (e, r, t, n, i, o, a) {
        if (!FS.isFile(e.node.mode)) throw new FS.ErrnoError(ERRNO_CODES.ENODEV)
        var u,
          s,
          f = e.node.contents
        if (2 & a || (f.buffer !== r && f.buffer !== r.buffer)) {
          if (
            ((0 < i || i + n < e.node.usedBytes) &&
              (f = f.subarray ? f.subarray(i, i + n) : Array.prototype.slice.call(f, i, i + n)),
            (s = !0),
            !(u = _malloc(n)))
          )
            throw new FS.ErrnoError(ERRNO_CODES.ENOMEM)
          r.set(f, u)
        } else (s = !1), (u = f.byteOffset)
        return { ptr: u, allocated: s }
      },
      msync: function (e, r, t, n, i) {
        if (!FS.isFile(e.node.mode)) throw new FS.ErrnoError(ERRNO_CODES.ENODEV)
        if (2 & i) return 0
        MEMFS.stream_ops.write(e, r, 0, n, t, !1)
        return 0
      },
    },
  },
  IDBFS = {
    dbs: {},
    indexedDB: function () {
      if ('undefined' != typeof indexedDB) return indexedDB
      var e = null
      return (
        'object' == typeof window &&
          (e = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB),
        assert(e, 'IDBFS used, but indexedDB not supported'),
        e
      )
    },
    DB_VERSION: 21,
    DB_STORE_NAME: 'FILE_DATA',
    mount: function (e) {
      return MEMFS.mount.apply(null, arguments)
    },
    syncfs: function (r, n, i) {
      IDBFS.getLocalSet(r, function (e, t) {
        return e
          ? i(e)
          : void IDBFS.getRemoteSet(r, function (e, r) {
              if (e) return i(e)
              ;(e = n ? r : t), (r = n ? t : r)
              IDBFS.reconcile(e, r, i)
            })
      })
    },
    getDB: function (e, r) {
      var t,
        n = IDBFS.dbs[e]
      if (n) return r(null, n)
      try {
        t = IDBFS.indexedDB().open(e, IDBFS.DB_VERSION)
      } catch (e) {
        return r(e)
      }
      if (!t) return r('Unable to connect to IndexedDB')
      ;(t.onupgradeneeded = function (e) {
        var r = e.target.result,
          e = e.target.transaction,
          r = r.objectStoreNames.contains(IDBFS.DB_STORE_NAME)
            ? e.objectStore(IDBFS.DB_STORE_NAME)
            : r.createObjectStore(IDBFS.DB_STORE_NAME)
        r.indexNames.contains('timestamp') || r.createIndex('timestamp', 'timestamp', { unique: !1 })
      }),
        (t.onsuccess = function () {
          ;(n = t.result), (IDBFS.dbs[e] = n), r(null, n)
        }),
        (t.onerror = function (e) {
          r(this.error), e.preventDefault()
        })
    },
    getLocalSet: function (e, r) {
      var t = {}
      function n(e) {
        return '.' !== e && '..' !== e
      }
      function i(r) {
        return function (e) {
          return PATH.join2(r, e)
        }
      }
      for (var o = FS.readdir(e.mountpoint).filter(n).map(i(e.mountpoint)); o.length; ) {
        var a,
          u = o.pop()
        try {
          a = FS.stat(u)
        } catch (e) {
          return r(e)
        }
        FS.isDir(a.mode) && o.push.apply(o, FS.readdir(u).filter(n).map(i(u))), (t[u] = { timestamp: a.mtime })
      }
      return r(null, { type: 'local', entries: t })
    },
    getRemoteSet: function (e, t) {
      var n = {}
      IDBFS.getDB(e.mountpoint, function (e, r) {
        if (e) return t(e)
        e = r.transaction([IDBFS.DB_STORE_NAME], 'readonly')
        ;(e.onerror = function (e) {
          t(this.error), e.preventDefault()
        }),
          (e.objectStore(IDBFS.DB_STORE_NAME).index('timestamp').openKeyCursor().onsuccess = function (e) {
            e = e.target.result
            if (!e) return t(null, { type: 'remote', db: r, entries: n })
            ;(n[e.primaryKey] = { timestamp: e.key }), e.continue()
          })
      })
    },
    loadLocalEntry: function (e, r) {
      try {
        var t = FS.lookupPath(e).node,
          n = FS.stat(e)
      } catch (e) {
        return r(e)
      }
      return FS.isDir(n.mode)
        ? r(null, { timestamp: n.mtime, mode: n.mode })
        : FS.isFile(n.mode)
          ? ((t.contents = MEMFS.getFileDataAsTypedArray(t)),
            r(null, { timestamp: n.mtime, mode: n.mode, contents: t.contents }))
          : r(new Error('node type not supported'))
    },
    storeLocalEntry: function (e, r, t) {
      try {
        if (FS.isDir(r.mode)) FS.mkdir(e, r.mode)
        else {
          if (!FS.isFile(r.mode)) return t(new Error('node type not supported'))
          FS.writeFile(e, r.contents, { encoding: 'binary', canOwn: !0 })
        }
        FS.chmod(e, r.mode), FS.utime(e, r.timestamp, r.timestamp)
      } catch (e) {
        return t(e)
      }
      t(null)
    },
    removeLocalEntry: function (e, r) {
      try {
        FS.lookupPath(e)
        var t = FS.stat(e)
        FS.isDir(t.mode) ? FS.rmdir(e) : FS.isFile(t.mode) && FS.unlink(e)
      } catch (e) {
        return r(e)
      }
      r(null)
    },
    loadRemoteEntry: function (e, r, t) {
      r = e.get(r)
      ;(r.onsuccess = function (e) {
        t(null, e.target.result)
      }),
        (r.onerror = function (e) {
          t(this.error), e.preventDefault()
        })
    },
    storeRemoteEntry: function (e, r, t, n) {
      r = e.put(t, r)
      ;(r.onsuccess = function () {
        n(null)
      }),
        (r.onerror = function (e) {
          n(this.error), e.preventDefault()
        })
    },
    removeRemoteEntry: function (e, r, t) {
      r = e.delete(r)
      ;(r.onsuccess = function () {
        t(null)
      }),
        (r.onerror = function (e) {
          t(this.error), e.preventDefault()
        })
    },
    reconcile: function (n, i, r) {
      var o = 0,
        a = []
      Object.keys(n.entries).forEach(function (e) {
        var r = n.entries[e],
          t = i.entries[e]
        ;(!t || r.timestamp > t.timestamp) && (a.push(e), o++)
      })
      var t = []
      if (
        (Object.keys(i.entries).forEach(function (e) {
          i.entries[e]
          n.entries[e] || (t.push(e), o++)
        }),
        !o)
      )
        return r(null)
      var u = 0,
        e = ('remote' === n.type ? n : i).db.transaction([IDBFS.DB_STORE_NAME], 'readwrite'),
        s = e.objectStore(IDBFS.DB_STORE_NAME)
      function f(e) {
        return e ? (f.errored ? void 0 : ((f.errored = !0), r(e))) : ++u >= o ? r(null) : void 0
      }
      ;(e.onerror = function (e) {
        f(this.error), e.preventDefault()
      }),
        a.sort().forEach(function (t) {
          'local' === i.type
            ? IDBFS.loadRemoteEntry(s, t, function (e, r) {
                return e ? f(e) : void IDBFS.storeLocalEntry(t, r, f)
              })
            : IDBFS.loadLocalEntry(t, function (e, r) {
                return e ? f(e) : void IDBFS.storeRemoteEntry(s, t, r, f)
              })
        }),
        t
          .sort()
          .reverse()
          .forEach(function (e) {
            'local' === i.type ? IDBFS.removeLocalEntry(e, f) : IDBFS.removeRemoteEntry(s, e, f)
          })
    },
  },
  NODEFS = {
    isWindows: !1,
    staticInit: function () {
      NODEFS.isWindows = !!process.platform.match(/^win/)
    },
    mount: function (e) {
      return assert(ENVIRONMENT_IS_NODE), NODEFS.createNode(null, '/', NODEFS.getMode(e.opts.root), 0)
    },
    createNode: function (e, r, t, n) {
      if (!FS.isDir(t) && !FS.isFile(t) && !FS.isLink(t)) throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
      t = FS.createNode(e, r, t)
      return (t.node_ops = NODEFS.node_ops), (t.stream_ops = NODEFS.stream_ops), t
    },
    getMode: function (e) {
      var r
      try {
        ;(r = fs.lstatSync(e)), NODEFS.isWindows && (r.mode = r.mode | ((146 & r.mode) >> 1))
      } catch (e) {
        if (!e.code) throw e
        throw new FS.ErrnoError(ERRNO_CODES[e.code])
      }
      return r.mode
    },
    realPath: function (e) {
      for (var r = []; e.parent !== e; ) r.push(e.name), (e = e.parent)
      return r.push(e.mount.opts.root), r.reverse(), PATH.join.apply(null, r)
    },
    flagsToPermissionStringMap: {
      0: 'r',
      1: 'r+',
      2: 'r+',
      64: 'r',
      65: 'r+',
      66: 'r+',
      129: 'rx+',
      193: 'rx+',
      514: 'w+',
      577: 'w',
      578: 'w+',
      705: 'wx',
      706: 'wx+',
      1024: 'a',
      1025: 'a',
      1026: 'a+',
      1089: 'a',
      1090: 'a+',
      1153: 'ax',
      1154: 'ax+',
      1217: 'ax',
      1218: 'ax+',
      4096: 'rs',
      4098: 'rs+',
    },
    flagsToPermissionString: function (e) {
      if (((e &= -2097153), (e &= -2049), (e &= -32769), (e &= -524289) in NODEFS.flagsToPermissionStringMap))
        return NODEFS.flagsToPermissionStringMap[e]
      throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
    },
    node_ops: {
      getattr: function (e) {
        var r,
          t = NODEFS.realPath(e)
        try {
          r = fs.lstatSync(t)
        } catch (e) {
          if (!e.code) throw e
          throw new FS.ErrnoError(ERRNO_CODES[e.code])
        }
        return (
          NODEFS.isWindows && !r.blksize && (r.blksize = 4096),
          NODEFS.isWindows && !r.blocks && (r.blocks = ((r.size + r.blksize - 1) / r.blksize) | 0),
          {
            dev: r.dev,
            ino: r.ino,
            mode: r.mode,
            nlink: r.nlink,
            uid: r.uid,
            gid: r.gid,
            rdev: r.rdev,
            size: r.size,
            atime: r.atime,
            mtime: r.mtime,
            ctime: r.ctime,
            blksize: r.blksize,
            blocks: r.blocks,
          }
        )
      },
      setattr: function (e, r) {
        var t,
          n = NODEFS.realPath(e)
        try {
          void 0 !== r.mode && (fs.chmodSync(n, r.mode), (e.mode = r.mode)),
            void 0 !== r.timestamp && ((t = new Date(r.timestamp)), fs.utimesSync(n, t, t)),
            void 0 !== r.size && fs.truncateSync(n, r.size)
        } catch (e) {
          if (!e.code) throw e
          throw new FS.ErrnoError(ERRNO_CODES[e.code])
        }
      },
      lookup: function (e, r) {
        var t = PATH.join2(NODEFS.realPath(e), r),
          t = NODEFS.getMode(t)
        return NODEFS.createNode(e, r, t)
      },
      mknod: function (e, r, t, n) {
        var i = NODEFS.createNode(e, r, t, n),
          o = NODEFS.realPath(i)
        try {
          FS.isDir(i.mode) ? fs.mkdirSync(o, i.mode) : fs.writeFileSync(o, '', { mode: i.mode })
        } catch (e) {
          if (!e.code) throw e
          throw new FS.ErrnoError(ERRNO_CODES[e.code])
        }
        return i
      },
      rename: function (e, r, t) {
        var n = NODEFS.realPath(e),
          i = PATH.join2(NODEFS.realPath(r), t)
        try {
          fs.renameSync(n, i)
        } catch (e) {
          if (!e.code) throw e
          throw new FS.ErrnoError(ERRNO_CODES[e.code])
        }
      },
      unlink: function (e, r) {
        var t = PATH.join2(NODEFS.realPath(e), r)
        try {
          fs.unlinkSync(t)
        } catch (e) {
          if (!e.code) throw e
          throw new FS.ErrnoError(ERRNO_CODES[e.code])
        }
      },
      rmdir: function (e, r) {
        var t = PATH.join2(NODEFS.realPath(e), r)
        try {
          fs.rmdirSync(t)
        } catch (e) {
          if (!e.code) throw e
          throw new FS.ErrnoError(ERRNO_CODES[e.code])
        }
      },
      readdir: function (e) {
        var r = NODEFS.realPath(e)
        try {
          return fs.readdirSync(r)
        } catch (e) {
          if (!e.code) throw e
          throw new FS.ErrnoError(ERRNO_CODES[e.code])
        }
      },
      symlink: function (e, r, t) {
        var n = PATH.join2(NODEFS.realPath(e), r)
        try {
          fs.symlinkSync(t, n)
        } catch (e) {
          if (!e.code) throw e
          throw new FS.ErrnoError(ERRNO_CODES[e.code])
        }
      },
      readlink: function (e) {
        var r = NODEFS.realPath(e)
        try {
          return (r = fs.readlinkSync(r)), NODEJS_PATH.relative(NODEJS_PATH.resolve(e.mount.opts.root), r)
        } catch (e) {
          if (!e.code) throw e
          throw new FS.ErrnoError(ERRNO_CODES[e.code])
        }
      },
    },
    stream_ops: {
      open: function (e) {
        var r = NODEFS.realPath(e.node)
        try {
          FS.isFile(e.node.mode) && (e.nfd = fs.openSync(r, NODEFS.flagsToPermissionString(e.flags)))
        } catch (e) {
          if (!e.code) throw e
          throw new FS.ErrnoError(ERRNO_CODES[e.code])
        }
      },
      close: function (e) {
        try {
          FS.isFile(e.node.mode) && e.nfd && fs.closeSync(e.nfd)
        } catch (e) {
          if (!e.code) throw e
          throw new FS.ErrnoError(ERRNO_CODES[e.code])
        }
      },
      read: function (e, r, t, n, i) {
        if (0 === n) return 0
        var o,
          a = new Buffer(n)
        try {
          o = fs.readSync(e.nfd, a, 0, n, i)
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES[e.code])
        }
        if (0 < o) for (var u = 0; u < o; u++) r[t + u] = a[u]
        return o
      },
      write: function (e, r, t, n, i) {
        var o,
          a = new Buffer(r.subarray(t, t + n))
        try {
          o = fs.writeSync(e.nfd, a, 0, n, i)
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES[e.code])
        }
        return o
      },
      llseek: function (e, r, t) {
        var n = r
        if (1 === t) n += e.position
        else if (2 === t && FS.isFile(e.node.mode))
          try {
            n += fs.fstatSync(e.nfd).size
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code])
          }
        if (n < 0) throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
        return n
      },
    },
  },
  WORKERFS = {
    DIR_MODE: 16895,
    FILE_MODE: 33279,
    reader: null,
    mount: function (e) {
      assert(ENVIRONMENT_IS_WORKER), WORKERFS.reader || (WORKERFS.reader = new FileReaderSync())
      var o = WORKERFS.createNode(null, '/', WORKERFS.DIR_MODE, 0),
        a = {}
      function n(e) {
        for (var r = e.split('/'), t = o, n = 0; n < r.length - 1; n++) {
          var i = r.slice(0, n + 1).join('/')
          a[i] || (a[i] = WORKERFS.createNode(t, r[n], WORKERFS.DIR_MODE, 0)), (t = a[i])
        }
        return t
      }
      function i(e) {
        e = e.split('/')
        return e[e.length - 1]
      }
      return (
        Array.prototype.forEach.call(e.opts.files || [], function (e) {
          WORKERFS.createNode(n(e.name), i(e.name), WORKERFS.FILE_MODE, 0, e, e.lastModifiedDate)
        }),
        (e.opts.blobs || []).forEach(function (e) {
          WORKERFS.createNode(n(e.name), i(e.name), WORKERFS.FILE_MODE, 0, e.data)
        }),
        (e.opts.packages || []).forEach(function (t) {
          t.metadata.files.forEach(function (e) {
            var r = e.filename.substr(1)
            WORKERFS.createNode(n(r), i(r), WORKERFS.FILE_MODE, 0, t.blob.slice(e.start, e.end))
          })
        }),
        o
      )
    },
    createNode: function (e, r, t, n, i, o) {
      var a = FS.createNode(e, r, t)
      return (
        (a.mode = t),
        (a.node_ops = WORKERFS.node_ops),
        (a.stream_ops = WORKERFS.stream_ops),
        (a.timestamp = (o || new Date()).getTime()),
        assert(WORKERFS.FILE_MODE !== WORKERFS.DIR_MODE),
        t === WORKERFS.FILE_MODE ? ((a.size = i.size), (a.contents = i)) : ((a.size = 4096), (a.contents = {})),
        e && (e.contents[r] = a),
        a
      )
    },
    node_ops: {
      getattr: function (e) {
        return {
          dev: 1,
          ino: void 0,
          mode: e.mode,
          nlink: 1,
          uid: 0,
          gid: 0,
          rdev: void 0,
          size: e.size,
          atime: new Date(e.timestamp),
          mtime: new Date(e.timestamp),
          ctime: new Date(e.timestamp),
          blksize: 4096,
          blocks: Math.ceil(e.size / 4096),
        }
      },
      setattr: function (e, r) {
        void 0 !== r.mode && (e.mode = r.mode), void 0 !== r.timestamp && (e.timestamp = r.timestamp)
      },
      lookup: function (e, r) {
        throw new FS.ErrnoError(ERRNO_CODES.ENOENT)
      },
      mknod: function (e, r, t, n) {
        throw new FS.ErrnoError(ERRNO_CODES.EPERM)
      },
      rename: function (e, r, t) {
        throw new FS.ErrnoError(ERRNO_CODES.EPERM)
      },
      unlink: function (e, r) {
        throw new FS.ErrnoError(ERRNO_CODES.EPERM)
      },
      rmdir: function (e, r) {
        throw new FS.ErrnoError(ERRNO_CODES.EPERM)
      },
      readdir: function (e) {
        throw new FS.ErrnoError(ERRNO_CODES.EPERM)
      },
      symlink: function (e, r, t) {
        throw new FS.ErrnoError(ERRNO_CODES.EPERM)
      },
      readlink: function (e) {
        throw new FS.ErrnoError(ERRNO_CODES.EPERM)
      },
    },
    stream_ops: {
      read: function (e, r, t, n, i) {
        if (i >= e.node.size) return 0
        ;(i = e.node.contents.slice(i, i + n)), (n = WORKERFS.reader.readAsArrayBuffer(i))
        return r.set(new Uint8Array(n), t), i.size
      },
      write: function (e, r, t, n, i) {
        throw new FS.ErrnoError(ERRNO_CODES.EIO)
      },
      llseek: function (e, r, t) {
        if ((1 === t ? (r += e.position) : 2 === t && FS.isFile(e.node.mode) && (r += e.node.size), r < 0))
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
        return r
      },
    },
  }
;(STATICTOP += 16), (STATICTOP += 16), (STATICTOP += 16)
var FS = {
    root: null,
    mounts: [],
    devices: [null],
    streams: [],
    nextInode: 1,
    nameTable: null,
    currentPath: '/',
    initialized: !1,
    ignorePermissions: !0,
    trackingDelegate: {},
    tracking: { openFlags: { READ: 1, WRITE: 2 } },
    ErrnoError: null,
    genericErrors: {},
    filesystems: null,
    syncFSRequests: 0,
    handleFSError: function (e) {
      if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + stackTrace()
      return ___setErrNo(e.errno)
    },
    lookupPath: function (e, r) {
      if (((r = r || {}), !(e = PATH.resolve(FS.cwd(), e)))) return { path: '', node: null }
      var t,
        n = { follow_mount: !0, recurse_count: 0 }
      for (t in n) void 0 === r[t] && (r[t] = n[t])
      if (8 < r.recurse_count) throw new FS.ErrnoError(ERRNO_CODES.ELOOP)
      for (
        var i = PATH.normalizeArray(
            e.split('/').filter(function (e) {
              return !!e
            }),
            !1
          ),
          o = FS.root,
          a = '/',
          u = 0;
        u < i.length;
        u++
      ) {
        var s = u === i.length - 1
        if (s && r.parent) break
        if (
          ((o = FS.lookupNode(o, i[u])),
          (a = PATH.join2(a, i[u])),
          FS.isMountpoint(o) && (!s || (s && r.follow_mount)) && (o = o.mounted.root),
          !s || r.follow)
        )
          for (var f = 0; FS.isLink(o.mode); ) {
            var l = FS.readlink(a),
              a = PATH.resolve(PATH.dirname(a), l),
              o = FS.lookupPath(a, { recurse_count: r.recurse_count }).node
            if (40 < f++) throw new FS.ErrnoError(ERRNO_CODES.ELOOP)
          }
      }
      return { path: a, node: o }
    },
    getPath: function (e) {
      for (var r; ; ) {
        if (FS.isRoot(e)) {
          var t = e.mount.mountpoint
          return r ? ('/' !== t[t.length - 1] ? t + '/' + r : t + r) : t
        }
        ;(r = r ? e.name + '/' + r : e.name), (e = e.parent)
      }
    },
    hashName: function (e, r) {
      for (var t = 0, n = 0; n < r.length; n++) t = ((t << 5) - t + r.charCodeAt(n)) | 0
      return ((e + t) >>> 0) % FS.nameTable.length
    },
    hashAddNode: function (e) {
      var r = FS.hashName(e.parent.id, e.name)
      ;(e.name_next = FS.nameTable[r]), (FS.nameTable[r] = e)
    },
    hashRemoveNode: function (e) {
      var r = FS.hashName(e.parent.id, e.name)
      if (FS.nameTable[r] === e) FS.nameTable[r] = e.name_next
      else
        for (var t = FS.nameTable[r]; t; ) {
          if (t.name_next === e) {
            t.name_next = e.name_next
            break
          }
          t = t.name_next
        }
    },
    lookupNode: function (e, r) {
      var t = FS.mayLookup(e)
      if (t) throw new FS.ErrnoError(t, e)
      for (var t = FS.hashName(e.id, r), n = FS.nameTable[t]; n; n = n.name_next) {
        var i = n.name
        if (n.parent.id === e.id && i === r) return n
      }
      return FS.lookup(e, r)
    },
    createNode: function (e, r, t, n) {
      FS.FSNode ||
        ((FS.FSNode = function (e, r, t, n) {
          ;(e = e || this),
            (this.parent = e),
            (this.mount = e.mount),
            (this.mounted = null),
            (this.id = FS.nextInode++),
            (this.name = r),
            (this.mode = t),
            (this.node_ops = {}),
            (this.stream_ops = {}),
            (this.rdev = n)
        }),
        (FS.FSNode.prototype = {}),
        Object.defineProperties(FS.FSNode.prototype, {
          read: {
            get: function () {
              return 365 == (365 & this.mode)
            },
            set: function (e) {
              e ? (this.mode |= 365) : (this.mode &= -366)
            },
          },
          write: {
            get: function () {
              return 146 == (146 & this.mode)
            },
            set: function (e) {
              e ? (this.mode |= 146) : (this.mode &= -147)
            },
          },
          isFolder: {
            get: function () {
              return FS.isDir(this.mode)
            },
          },
          isDevice: {
            get: function () {
              return FS.isChrdev(this.mode)
            },
          },
        }))
      n = new FS.FSNode(e, r, t, n)
      return FS.hashAddNode(n), n
    },
    destroyNode: function (e) {
      FS.hashRemoveNode(e)
    },
    isRoot: function (e) {
      return e === e.parent
    },
    isMountpoint: function (e) {
      return !!e.mounted
    },
    isFile: function (e) {
      return 32768 == (61440 & e)
    },
    isDir: function (e) {
      return 16384 == (61440 & e)
    },
    isLink: function (e) {
      return 40960 == (61440 & e)
    },
    isChrdev: function (e) {
      return 8192 == (61440 & e)
    },
    isBlkdev: function (e) {
      return 24576 == (61440 & e)
    },
    isFIFO: function (e) {
      return 4096 == (61440 & e)
    },
    isSocket: function (e) {
      return 49152 == (49152 & e)
    },
    flagModes: {
      r: 0,
      rs: 1052672,
      'r+': 2,
      w: 577,
      wx: 705,
      xw: 705,
      'w+': 578,
      'wx+': 706,
      'xw+': 706,
      a: 1089,
      ax: 1217,
      xa: 1217,
      'a+': 1090,
      'ax+': 1218,
      'xa+': 1218,
    },
    modeStringToFlags: function (e) {
      var r = FS.flagModes[e]
      if (void 0 === r) throw new Error('Unknown file open mode: ' + e)
      return r
    },
    flagsToPermissionString: function (e) {
      var r = ['r', 'w', 'rw'][3 & e]
      return 512 & e && (r += 'w'), r
    },
    nodePermissions: function (e, r) {
      return FS.ignorePermissions ||
        ((-1 === r.indexOf('r') || 292 & e.mode) &&
          (-1 === r.indexOf('w') || 146 & e.mode) &&
          (-1 === r.indexOf('x') || 73 & e.mode))
        ? 0
        : ERRNO_CODES.EACCES
    },
    mayLookup: function (e) {
      var r = FS.nodePermissions(e, 'x')
      return r || (e.node_ops.lookup ? 0 : ERRNO_CODES.EACCES)
    },
    mayCreate: function (e, r) {
      try {
        FS.lookupNode(e, r)
        return ERRNO_CODES.EEXIST
      } catch (e) {}
      return FS.nodePermissions(e, 'wx')
    },
    mayDelete: function (e, r, t) {
      var n
      try {
        n = FS.lookupNode(e, r)
      } catch (e) {
        return e.errno
      }
      var i = FS.nodePermissions(e, 'wx')
      if (i) return i
      if (t) {
        if (!FS.isDir(n.mode)) return ERRNO_CODES.ENOTDIR
        if (FS.isRoot(n) || FS.getPath(n) === FS.cwd()) return ERRNO_CODES.EBUSY
      } else if (FS.isDir(n.mode)) return ERRNO_CODES.EISDIR
      return 0
    },
    mayOpen: function (e, r) {
      return e
        ? FS.isLink(e.mode)
          ? ERRNO_CODES.ELOOP
          : FS.isDir(e.mode) && ('r' !== FS.flagsToPermissionString(r) || 512 & r)
            ? ERRNO_CODES.EISDIR
            : FS.nodePermissions(e, FS.flagsToPermissionString(r))
        : ERRNO_CODES.ENOENT
    },
    MAX_OPEN_FDS: 4096,
    nextfd: function (e, r) {
      ;(e = e || 0), (r = r || FS.MAX_OPEN_FDS)
      for (var t = e; t <= r; t++) if (!FS.streams[t]) return t
      throw new FS.ErrnoError(ERRNO_CODES.EMFILE)
    },
    getStream: function (e) {
      return FS.streams[e]
    },
    createStream: function (e, r, t) {
      FS.FSStream ||
        ((FS.FSStream = function () {}),
        (FS.FSStream.prototype = {}),
        Object.defineProperties(FS.FSStream.prototype, {
          object: {
            get: function () {
              return this.node
            },
            set: function (e) {
              this.node = e
            },
          },
          isRead: {
            get: function () {
              return 1 != (2097155 & this.flags)
            },
          },
          isWrite: {
            get: function () {
              return 0 != (2097155 & this.flags)
            },
          },
          isAppend: {
            get: function () {
              return 1024 & this.flags
            },
          },
        }))
      var n,
        i = new FS.FSStream()
      for (n in e) i[n] = e[n]
      e = i
      t = FS.nextfd(r, t)
      return (e.fd = t), (FS.streams[t] = e)
    },
    closeStream: function (e) {
      FS.streams[e] = null
    },
    chrdev_stream_ops: {
      open: function (e) {
        var r = FS.getDevice(e.node.rdev)
        ;(e.stream_ops = r.stream_ops), e.stream_ops.open && e.stream_ops.open(e)
      },
      llseek: function () {
        throw new FS.ErrnoError(ERRNO_CODES.ESPIPE)
      },
    },
    major: function (e) {
      return e >> 8
    },
    minor: function (e) {
      return 255 & e
    },
    makedev: function (e, r) {
      return (e << 8) | r
    },
    registerDevice: function (e, r) {
      FS.devices[e] = { stream_ops: r }
    },
    getDevice: function (e) {
      return FS.devices[e]
    },
    getMounts: function (e) {
      for (var r = [], t = [e]; t.length; ) {
        var n = t.pop()
        r.push(n), t.push.apply(t, n.mounts)
      }
      return r
    },
    syncfs: function (r, t) {
      'function' == typeof r && ((t = r), (r = !1)),
        FS.syncFSRequests++,
        1 < FS.syncFSRequests &&
          console.log(
            'warning: ' + FS.syncFSRequests + ' FS.syncfs operations in flight at once, probably just doing extra work'
          )
      var n = FS.getMounts(FS.root.mount),
        i = 0
      function o(e) {
        return assert(0 < FS.syncFSRequests), FS.syncFSRequests--, t(e)
      }
      function a(e) {
        if (e) return a.errored ? void 0 : ((a.errored = !0), o(e))
        ++i >= n.length && o(null)
      }
      n.forEach(function (e) {
        return e.type.syncfs ? void e.type.syncfs(e, r, a) : a(null)
      })
    },
    mount: function (e, r, t) {
      var n = '/' === t,
        i = !t
      if (n && FS.root) throw new FS.ErrnoError(ERRNO_CODES.EBUSY)
      if (!n && !i) {
        var o = FS.lookupPath(t, { follow_mount: !1 })
        if (((t = o.path), (o = o.node), FS.isMountpoint(o))) throw new FS.ErrnoError(ERRNO_CODES.EBUSY)
        if (!FS.isDir(o.mode)) throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR)
      }
      ;(t = { type: e, opts: r, mountpoint: t, mounts: [] }), (e = e.mount(t))
      return ((e.mount = t).root = e), n ? (FS.root = e) : o && ((o.mounted = t), o.mount && o.mount.mounts.push(t)), e
    },
    unmount: function (e) {
      var r = FS.lookupPath(e, { follow_mount: !1 })
      if (!FS.isMountpoint(r.node)) throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
      var e = r.node,
        r = e.mounted,
        n = FS.getMounts(r)
      Object.keys(FS.nameTable).forEach(function (e) {
        for (var r = FS.nameTable[e]; r; ) {
          var t = r.name_next
          ;-1 !== n.indexOf(r.mount) && FS.destroyNode(r), (r = t)
        }
      }),
        (e.mounted = null)
      r = e.mount.mounts.indexOf(r)
      assert(-1 !== r), e.mount.mounts.splice(r, 1)
    },
    lookup: function (e, r) {
      return e.node_ops.lookup(e, r)
    },
    mknod: function (e, r, t) {
      var n = FS.lookupPath(e, { parent: !0 }).node,
        i = PATH.basename(e)
      if (!i || '.' === i || '..' === i) throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
      e = FS.mayCreate(n, i)
      if (e) throw new FS.ErrnoError(e)
      if (!n.node_ops.mknod) throw new FS.ErrnoError(ERRNO_CODES.EPERM)
      return n.node_ops.mknod(n, i, r, t)
    },
    create: function (e, r) {
      return (r = void 0 !== r ? r : 438), (r &= 4095), (r |= 32768), FS.mknod(e, r, 0)
    },
    mkdir: function (e, r) {
      return (r = void 0 !== r ? r : 511), (r &= 1023), (r |= 16384), FS.mknod(e, r, 0)
    },
    mkdirTree: function (e, r) {
      for (var t = e.split('/'), n = '', i = 0; i < t.length; ++i) {
        n += '/' + t[i]
        try {
          FS.mkdir(n, r)
        } catch (e) {
          if (e.errno != ERRNO_CODES.EEXIST) throw e
        }
      }
    },
    mkdev: function (e, r, t) {
      return void 0 === t && ((t = r), (r = 438)), (r |= 8192), FS.mknod(e, r, t)
    },
    symlink: function (e, r) {
      if (!PATH.resolve(e)) throw new FS.ErrnoError(ERRNO_CODES.ENOENT)
      var t = FS.lookupPath(r, { parent: !0 }).node
      if (!t) throw new FS.ErrnoError(ERRNO_CODES.ENOENT)
      var n = PATH.basename(r),
        r = FS.mayCreate(t, n)
      if (r) throw new FS.ErrnoError(r)
      if (!t.node_ops.symlink) throw new FS.ErrnoError(ERRNO_CODES.EPERM)
      return t.node_ops.symlink(t, n, e)
    },
    rename: function (r, t) {
      var e,
        n,
        i = PATH.dirname(r),
        o = PATH.dirname(t),
        a = PATH.basename(r),
        u = PATH.basename(t)
      try {
        ;(e = FS.lookupPath(r, { parent: !0 }).node), (n = FS.lookupPath(t, { parent: !0 }).node)
      } catch (e) {
        throw new FS.ErrnoError(ERRNO_CODES.EBUSY)
      }
      if (!e || !n) throw new FS.ErrnoError(ERRNO_CODES.ENOENT)
      if (e.mount !== n.mount) throw new FS.ErrnoError(ERRNO_CODES.EXDEV)
      var s,
        f = FS.lookupNode(e, a),
        o = PATH.relative(r, o)
      if ('.' !== o.charAt(0)) throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
      if ('.' !== (o = PATH.relative(t, i)).charAt(0)) throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY)
      try {
        s = FS.lookupNode(n, u)
      } catch (e) {}
      if (f !== s) {
        ;(o = FS.isDir(f.mode)), (a = FS.mayDelete(e, a, o))
        if (a) throw new FS.ErrnoError(a)
        if ((a = s ? FS.mayDelete(n, u, o) : FS.mayCreate(n, u))) throw new FS.ErrnoError(a)
        if (!e.node_ops.rename) throw new FS.ErrnoError(ERRNO_CODES.EPERM)
        if (FS.isMountpoint(f) || (s && FS.isMountpoint(s))) throw new FS.ErrnoError(ERRNO_CODES.EBUSY)
        if (n !== e && (a = FS.nodePermissions(e, 'w'))) throw new FS.ErrnoError(a)
        try {
          FS.trackingDelegate.willMovePath && FS.trackingDelegate.willMovePath(r, t)
        } catch (e) {
          console.log("FS.trackingDelegate['willMovePath']('" + r + "', '" + t + "') threw an exception: " + e.message)
        }
        FS.hashRemoveNode(f)
        try {
          e.node_ops.rename(f, n, u)
        } catch (e) {
          throw e
        } finally {
          FS.hashAddNode(f)
        }
        try {
          FS.trackingDelegate.onMovePath && FS.trackingDelegate.onMovePath(r, t)
        } catch (e) {
          console.log("FS.trackingDelegate['onMovePath']('" + r + "', '" + t + "') threw an exception: " + e.message)
        }
      }
    },
    rmdir: function (r) {
      var e = FS.lookupPath(r, { parent: !0 }).node,
        t = PATH.basename(r),
        n = FS.lookupNode(e, t),
        i = FS.mayDelete(e, t, !0)
      if (i) throw new FS.ErrnoError(i)
      if (!e.node_ops.rmdir) throw new FS.ErrnoError(ERRNO_CODES.EPERM)
      if (FS.isMountpoint(n)) throw new FS.ErrnoError(ERRNO_CODES.EBUSY)
      try {
        FS.trackingDelegate.willDeletePath && FS.trackingDelegate.willDeletePath(r)
      } catch (e) {
        console.log("FS.trackingDelegate['willDeletePath']('" + r + "') threw an exception: " + e.message)
      }
      e.node_ops.rmdir(e, t), FS.destroyNode(n)
      try {
        FS.trackingDelegate.onDeletePath && FS.trackingDelegate.onDeletePath(r)
      } catch (e) {
        console.log("FS.trackingDelegate['onDeletePath']('" + r + "') threw an exception: " + e.message)
      }
    },
    readdir: function (e) {
      e = FS.lookupPath(e, { follow: !0 }).node
      if (!e.node_ops.readdir) throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR)
      return e.node_ops.readdir(e)
    },
    unlink: function (r) {
      var e = FS.lookupPath(r, { parent: !0 }).node,
        t = PATH.basename(r),
        n = FS.lookupNode(e, t),
        i = FS.mayDelete(e, t, !1)
      if (i) throw new FS.ErrnoError(i)
      if (!e.node_ops.unlink) throw new FS.ErrnoError(ERRNO_CODES.EPERM)
      if (FS.isMountpoint(n)) throw new FS.ErrnoError(ERRNO_CODES.EBUSY)
      try {
        FS.trackingDelegate.willDeletePath && FS.trackingDelegate.willDeletePath(r)
      } catch (e) {
        console.log("FS.trackingDelegate['willDeletePath']('" + r + "') threw an exception: " + e.message)
      }
      e.node_ops.unlink(e, t), FS.destroyNode(n)
      try {
        FS.trackingDelegate.onDeletePath && FS.trackingDelegate.onDeletePath(r)
      } catch (e) {
        console.log("FS.trackingDelegate['onDeletePath']('" + r + "') threw an exception: " + e.message)
      }
    },
    readlink: function (e) {
      e = FS.lookupPath(e).node
      if (!e) throw new FS.ErrnoError(ERRNO_CODES.ENOENT)
      if (!e.node_ops.readlink) throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
      return PATH.resolve(FS.getPath(e.parent), e.node_ops.readlink(e))
    },
    stat: function (e, r) {
      r = FS.lookupPath(e, { follow: !r }).node
      if (!r) throw new FS.ErrnoError(ERRNO_CODES.ENOENT)
      if (!r.node_ops.getattr) throw new FS.ErrnoError(ERRNO_CODES.EPERM)
      return r.node_ops.getattr(r)
    },
    lstat: function (e) {
      return FS.stat(e, !0)
    },
    chmod: function (e, r, t) {
      if (!(e = 'string' == typeof e ? FS.lookupPath(e, { follow: !t }).node : e).node_ops.setattr)
        throw new FS.ErrnoError(ERRNO_CODES.EPERM)
      e.node_ops.setattr(e, { mode: (4095 & r) | (-4096 & e.mode), timestamp: Date.now() })
    },
    lchmod: function (e, r) {
      FS.chmod(e, r, !0)
    },
    fchmod: function (e, r) {
      e = FS.getStream(e)
      if (!e) throw new FS.ErrnoError(ERRNO_CODES.EBADF)
      FS.chmod(e.node, r)
    },
    chown: function (e, r, t, n) {
      if (!(e = 'string' == typeof e ? FS.lookupPath(e, { follow: !n }).node : e).node_ops.setattr)
        throw new FS.ErrnoError(ERRNO_CODES.EPERM)
      e.node_ops.setattr(e, { timestamp: Date.now() })
    },
    lchown: function (e, r, t) {
      FS.chown(e, r, t, !0)
    },
    fchown: function (e, r, t) {
      e = FS.getStream(e)
      if (!e) throw new FS.ErrnoError(ERRNO_CODES.EBADF)
      FS.chown(e.node, r, t)
    },
    truncate: function (e, r) {
      if (r < 0) throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
      var t
      if (!(t = 'string' == typeof e ? FS.lookupPath(e, { follow: !0 }).node : e).node_ops.setattr)
        throw new FS.ErrnoError(ERRNO_CODES.EPERM)
      if (FS.isDir(t.mode)) throw new FS.ErrnoError(ERRNO_CODES.EISDIR)
      if (!FS.isFile(t.mode)) throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
      e = FS.nodePermissions(t, 'w')
      if (e) throw new FS.ErrnoError(e)
      t.node_ops.setattr(t, { size: r, timestamp: Date.now() })
    },
    ftruncate: function (e, r) {
      e = FS.getStream(e)
      if (!e) throw new FS.ErrnoError(ERRNO_CODES.EBADF)
      if (0 == (2097155 & e.flags)) throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
      FS.truncate(e.node, r)
    },
    utime: function (e, r, t) {
      e = FS.lookupPath(e, { follow: !0 }).node
      e.node_ops.setattr(e, { timestamp: Math.max(r, t) })
    },
    open: function (r, e, t, n, i) {
      if ('' === r) throw new FS.ErrnoError(ERRNO_CODES.ENOENT)
      if (
        ((t = void 0 === t ? 438 : t),
        (t = 64 & (e = 'string' == typeof e ? FS.modeStringToFlags(e) : e) ? (4095 & t) | 32768 : 0),
        'object' == typeof r)
      )
        o = r
      else {
        r = PATH.normalize(r)
        try {
          var o = FS.lookupPath(r, { follow: !(131072 & e) }).node
        } catch (e) {}
      }
      var a = !1
      if (64 & e)
        if (o) {
          if (128 & e) throw new FS.ErrnoError(ERRNO_CODES.EEXIST)
        } else (o = FS.mknod(r, t, 0)), (a = !0)
      if (!o) throw new FS.ErrnoError(ERRNO_CODES.ENOENT)
      if ((FS.isChrdev(o.mode) && (e &= -513), 65536 & e && !FS.isDir(o.mode)))
        throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR)
      if (!a) {
        a = FS.mayOpen(o, e)
        if (a) throw new FS.ErrnoError(a)
      }
      512 & e && FS.truncate(o, 0), (e &= -641)
      var u,
        i = FS.createStream(
          {
            node: o,
            path: FS.getPath(o),
            flags: e,
            seekable: !0,
            position: 0,
            stream_ops: o.stream_ops,
            ungotten: [],
            error: !1,
          },
          n,
          i
        )
      i.stream_ops.open && i.stream_ops.open(i),
        !Module.logReadFiles ||
          1 & e ||
          (FS.readFiles || (FS.readFiles = {}),
          r in FS.readFiles || ((FS.readFiles[r] = 1), Module.printErr('read file: ' + r)))
      try {
        FS.trackingDelegate.onOpenFile &&
          ((u = 0),
          1 != (2097155 & e) && (u |= FS.tracking.openFlags.READ),
          0 != (2097155 & e) && (u |= FS.tracking.openFlags.WRITE),
          FS.trackingDelegate.onOpenFile(r, u))
      } catch (e) {
        console.log("FS.trackingDelegate['onOpenFile']('" + r + "', flags) threw an exception: " + e.message)
      }
      return i
    },
    close: function (e) {
      e.getdents && (e.getdents = null)
      try {
        e.stream_ops.close && e.stream_ops.close(e)
      } catch (e) {
        throw e
      } finally {
        FS.closeStream(e.fd)
      }
    },
    llseek: function (e, r, t) {
      if (!e.seekable || !e.stream_ops.llseek) throw new FS.ErrnoError(ERRNO_CODES.ESPIPE)
      return (e.position = e.stream_ops.llseek(e, r, t)), (e.ungotten = []), e.position
    },
    read: function (e, r, t, n, i) {
      if (n < 0 || i < 0) throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
      if (1 == (2097155 & e.flags)) throw new FS.ErrnoError(ERRNO_CODES.EBADF)
      if (FS.isDir(e.node.mode)) throw new FS.ErrnoError(ERRNO_CODES.EISDIR)
      if (!e.stream_ops.read) throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
      var o = !0
      if (void 0 === i) (i = e.position), (o = !1)
      else if (!e.seekable) throw new FS.ErrnoError(ERRNO_CODES.ESPIPE)
      i = e.stream_ops.read(e, r, t, n, i)
      return o || (e.position += i), i
    },
    write: function (e, r, t, n, i, o) {
      if (n < 0 || i < 0) throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
      if (0 == (2097155 & e.flags)) throw new FS.ErrnoError(ERRNO_CODES.EBADF)
      if (FS.isDir(e.node.mode)) throw new FS.ErrnoError(ERRNO_CODES.EISDIR)
      if (!e.stream_ops.write) throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
      1024 & e.flags && FS.llseek(e, 0, 2)
      var a = !0
      if (void 0 === i) (i = e.position), (a = !1)
      else if (!e.seekable) throw new FS.ErrnoError(ERRNO_CODES.ESPIPE)
      o = e.stream_ops.write(e, r, t, n, i, o)
      a || (e.position += o)
      try {
        e.path && FS.trackingDelegate.onWriteToFile && FS.trackingDelegate.onWriteToFile(e.path)
      } catch (e) {
        console.log("FS.trackingDelegate['onWriteToFile']('" + path + "') threw an exception: " + e.message)
      }
      return o
    },
    allocate: function (e, r, t) {
      if (r < 0 || t <= 0) throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
      if (0 == (2097155 & e.flags)) throw new FS.ErrnoError(ERRNO_CODES.EBADF)
      if (!FS.isFile(e.node.mode) && !FS.isDir(node.mode)) throw new FS.ErrnoError(ERRNO_CODES.ENODEV)
      if (!e.stream_ops.allocate) throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP)
      e.stream_ops.allocate(e, r, t)
    },
    mmap: function (e, r, t, n, i, o, a) {
      if (1 == (2097155 & e.flags)) throw new FS.ErrnoError(ERRNO_CODES.EACCES)
      if (!e.stream_ops.mmap) throw new FS.ErrnoError(ERRNO_CODES.ENODEV)
      return e.stream_ops.mmap(e, r, t, n, i, o, a)
    },
    msync: function (e, r, t, n, i) {
      return e && e.stream_ops.msync ? e.stream_ops.msync(e, r, t, n, i) : 0
    },
    munmap: function (e) {
      return 0
    },
    ioctl: function (e, r, t) {
      if (!e.stream_ops.ioctl) throw new FS.ErrnoError(ERRNO_CODES.ENOTTY)
      return e.stream_ops.ioctl(e, r, t)
    },
    readFile: function (e, r) {
      if (
        (((r = r || {}).flags = r.flags || 'r'),
        (r.encoding = r.encoding || 'binary'),
        'utf8' !== r.encoding && 'binary' !== r.encoding)
      )
        throw new Error('Invalid encoding type "' + r.encoding + '"')
      var t,
        n = FS.open(e, r.flags),
        i = FS.stat(e).size,
        e = new Uint8Array(i)
      return (
        FS.read(n, e, 0, i, 0),
        'utf8' === r.encoding ? (t = UTF8ArrayToString(e, 0)) : 'binary' === r.encoding && (t = e),
        FS.close(n),
        t
      )
    },
    writeFile: function (e, r, t) {
      if (
        (((t = t || {}).flags = t.flags || 'w'),
        (t.encoding = t.encoding || 'utf8'),
        'utf8' !== t.encoding && 'binary' !== t.encoding)
      )
        throw new Error('Invalid encoding type "' + t.encoding + '"')
      var n,
        i = FS.open(e, t.flags, t.mode)
      'utf8' === t.encoding
        ? ((e = stringToUTF8Array(r, (n = new Uint8Array(lengthBytesUTF8(r) + 1)), 0, n.length)),
          FS.write(i, n, 0, e, 0, t.canOwn))
        : 'binary' === t.encoding && FS.write(i, r, 0, r.length, 0, t.canOwn),
        FS.close(i)
    },
    cwd: function () {
      return FS.currentPath
    },
    chdir: function (e) {
      var r = FS.lookupPath(e, { follow: !0 })
      if (!FS.isDir(r.node.mode)) throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR)
      e = FS.nodePermissions(r.node, 'x')
      if (e) throw new FS.ErrnoError(e)
      FS.currentPath = r.path
    },
    createDefaultDirectories: function () {
      FS.mkdir('/tmp'), FS.mkdir('/home'), FS.mkdir('/home/web_user')
    },
    createDefaultDevices: function () {
      var e, r
      FS.mkdir('/dev'),
        FS.registerDevice(FS.makedev(1, 3), {
          read: function () {
            return 0
          },
          write: function (e, r, t, n, i) {
            return n
          },
        }),
        FS.mkdev('/dev/null', FS.makedev(1, 3)),
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops),
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops),
        FS.mkdev('/dev/tty', FS.makedev(5, 0)),
        FS.mkdev('/dev/tty1', FS.makedev(6, 0)),
        (r =
          'undefined' != typeof crypto
            ? ((e = new Uint8Array(1)),
              function () {
                return crypto.getRandomValues(e), e[0]
              })
            : ENVIRONMENT_IS_NODE
              ? function () {
                  return require('crypto').randomBytes(1)[0]
                }
              : function () {
                  return (256 * Math.random()) | 0
                }),
        FS.createDevice('/dev', 'random', r),
        FS.createDevice('/dev', 'urandom', r),
        FS.mkdir('/dev/shm'),
        FS.mkdir('/dev/shm/tmp')
    },
    createSpecialDirectories: function () {
      FS.mkdir('/proc'),
        FS.mkdir('/proc/self'),
        FS.mkdir('/proc/self/fd'),
        FS.mount(
          {
            mount: function () {
              var e = FS.createNode('/proc/self', 'fd', 16895, 73)
              return (
                (e.node_ops = {
                  lookup: function (e, r) {
                    var r = +r,
                      t = FS.getStream(r)
                    if (!t) throw new FS.ErrnoError(ERRNO_CODES.EBADF)
                    r = {
                      parent: null,
                      mount: { mountpoint: 'fake' },
                      node_ops: {
                        readlink: function () {
                          return t.path
                        },
                      },
                    }
                    return (r.parent = r)
                  },
                }),
                e
              )
            },
          },
          {},
          '/proc/self/fd'
        )
    },
    createStandardStreams: function () {
      Module.stdin ? FS.createDevice('/dev', 'stdin', Module.stdin) : FS.symlink('/dev/tty', '/dev/stdin'),
        Module.stdout ? FS.createDevice('/dev', 'stdout', null, Module.stdout) : FS.symlink('/dev/tty', '/dev/stdout'),
        Module.stderr ? FS.createDevice('/dev', 'stderr', null, Module.stderr) : FS.symlink('/dev/tty1', '/dev/stderr')
      var e = FS.open('/dev/stdin', 'r')
      assert(0 === e.fd, 'invalid handle for stdin (' + e.fd + ')')
      e = FS.open('/dev/stdout', 'w')
      assert(1 === e.fd, 'invalid handle for stdout (' + e.fd + ')')
      e = FS.open('/dev/stderr', 'w')
      assert(2 === e.fd, 'invalid handle for stderr (' + e.fd + ')')
    },
    ensureErrnoError: function () {
      FS.ErrnoError ||
        ((FS.ErrnoError = function (e, r) {
          ;(this.node = r),
            (this.setErrno = function (e) {
              for (var r in ((this.errno = e), ERRNO_CODES))
                if (ERRNO_CODES[r] === e) {
                  this.code = r
                  break
                }
            }),
            this.setErrno(e),
            (this.message = ERRNO_MESSAGES[e]),
            this.stack && (this.stack = demangleAll(this.stack))
        }),
        (FS.ErrnoError.prototype = new Error()),
        (FS.ErrnoError.prototype.constructor = FS.ErrnoError),
        [ERRNO_CODES.ENOENT].forEach(function (e) {
          ;(FS.genericErrors[e] = new FS.ErrnoError(e)), (FS.genericErrors[e].stack = '<generic error, no stack>')
        }))
    },
    staticInit: function () {
      FS.ensureErrnoError(),
        (FS.nameTable = new Array(4096)),
        FS.mount(MEMFS, {}, '/'),
        FS.createDefaultDirectories(),
        FS.createDefaultDevices(),
        FS.createSpecialDirectories(),
        (FS.filesystems = { MEMFS: MEMFS, IDBFS: IDBFS, NODEFS: NODEFS, WORKERFS: WORKERFS })
    },
    init: function (e, r, t) {
      assert(
        !FS.init.initialized,
        'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)'
      ),
        (FS.init.initialized = !0),
        FS.ensureErrnoError(),
        (Module.stdin = e || Module.stdin),
        (Module.stdout = r || Module.stdout),
        (Module.stderr = t || Module.stderr),
        FS.createStandardStreams()
    },
    quit: function () {
      FS.init.initialized = !1
      var e = Module._fflush
      e && e(0)
      for (var r = 0; r < FS.streams.length; r++) {
        var t = FS.streams[r]
        t && FS.close(t)
      }
    },
    getMode: function (e, r) {
      var t = 0
      return e && (t |= 365), r && (t |= 146), t
    },
    joinPath: function (e, r) {
      e = PATH.join.apply(null, e)
      return r && '/' == e[0] && (e = e.substr(1)), e
    },
    absolutePath: function (e, r) {
      return PATH.resolve(r, e)
    },
    standardizePath: function (e) {
      return PATH.normalize(e)
    },
    findObject: function (e, r) {
      r = FS.analyzePath(e, r)
      return r.exists ? r.object : (___setErrNo(r.error), null)
    },
    analyzePath: function (e, r) {
      try {
        e = (n = FS.lookupPath(e, { follow: !r })).path
      } catch (e) {}
      var t = {
        isRoot: !1,
        exists: !1,
        error: 0,
        name: null,
        path: null,
        object: null,
        parentExists: !1,
        parentPath: null,
        parentObject: null,
      }
      try {
        var n = FS.lookupPath(e, { parent: !0 })
        ;(t.parentExists = !0),
          (t.parentPath = n.path),
          (t.parentObject = n.node),
          (t.name = PATH.basename(e)),
          (n = FS.lookupPath(e, { follow: !r })),
          (t.exists = !0),
          (t.path = n.path),
          (t.object = n.node),
          (t.name = n.node.name),
          (t.isRoot = '/' === n.path)
      } catch (e) {
        t.error = e.errno
      }
      return t
    },
    createFolder: function (e, r, t, n) {
      ;(r = PATH.join2('string' == typeof e ? e : FS.getPath(e), r)), (n = FS.getMode(t, n))
      return FS.mkdir(r, n)
    },
    createPath: function (e, r, t, n) {
      e = 'string' == typeof e ? e : FS.getPath(e)
      for (var i = r.split('/').reverse(); i.length; ) {
        var o = i.pop()
        if (o) {
          var a = PATH.join2(e, o)
          try {
            FS.mkdir(a)
          } catch (e) {}
          e = a
        }
      }
      return a
    },
    createFile: function (e, r, t, n, i) {
      ;(r = PATH.join2('string' == typeof e ? e : FS.getPath(e), r)), (i = FS.getMode(n, i))
      return FS.create(r, i)
    },
    createDataFile: function (e, r, t, n, i, o) {
      ;(e = r ? PATH.join2('string' == typeof e ? e : FS.getPath(e), r) : e),
        (n = FS.getMode(n, i)),
        (i = FS.create(e, n))
      if (t) {
        if ('string' == typeof t) {
          for (var a = new Array(t.length), u = 0, s = t.length; u < s; ++u) a[u] = t.charCodeAt(u)
          t = a
        }
        FS.chmod(i, 146 | n)
        e = FS.open(i, 'w')
        FS.write(e, t, 0, t.length, 0, o), FS.close(e), FS.chmod(i, n)
      }
      return i
    },
    createDevice: function (e, r, s, a) {
      var t = PATH.join2('string' == typeof e ? e : FS.getPath(e), r),
        e = FS.getMode(!!s, !!a)
      FS.createDevice.major || (FS.createDevice.major = 64)
      r = FS.makedev(FS.createDevice.major++, 0)
      return (
        FS.registerDevice(r, {
          open: function (e) {
            e.seekable = !1
          },
          close: function (e) {
            a && a.buffer && a.buffer.length && a(10)
          },
          read: function (e, r, t, n, i) {
            for (var o, a = 0, u = 0; u < n; u++) {
              try {
                o = s()
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO)
              }
              if (void 0 === o && 0 === a) throw new FS.ErrnoError(ERRNO_CODES.EAGAIN)
              if (null == o) break
              a++, (r[t + u] = o)
            }
            return a && (e.node.timestamp = Date.now()), a
          },
          write: function (e, r, t, n, i) {
            for (var o = 0; o < n; o++)
              try {
                a(r[t + o])
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO)
              }
            return n && (e.node.timestamp = Date.now()), o
          },
        }),
        FS.mkdev(t, e, r)
      )
    },
    createLink: function (e, r, t, n, i) {
      r = PATH.join2('string' == typeof e ? e : FS.getPath(e), r)
      return FS.symlink(t, r)
    },
    forceLoadFile: function (e) {
      if (e.isDevice || e.isFolder || e.link || e.contents) return !0
      var r = !0
      if ('undefined' != typeof XMLHttpRequest)
        throw new Error(
          'Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.'
        )
      if (!Module.read) throw new Error('Cannot load without read() or XMLHttpRequest.')
      try {
        ;(e.contents = intArrayFromString(Module.read(e.url), !0)), (e.usedBytes = e.contents.length)
      } catch (e) {
        r = !1
      }
      return r || ___setErrNo(ERRNO_CODES.EIO), r
    },
    createLazyFile: function (e, r, a, t, n) {
      function i() {
        ;(this.lengthKnown = !1), (this.chunks = [])
      }
      if (
        ((i.prototype.get = function (e) {
          if (!(e > this.length - 1 || e < 0)) {
            var r = e % this.chunkSize,
              e = (e / this.chunkSize) | 0
            return this.getter(e)[r]
          }
        }),
        (i.prototype.setDataGetter = function (e) {
          this.getter = e
        }),
        (i.prototype.cacheLength = function () {
          var e = new XMLHttpRequest()
          if ((e.open('HEAD', a, !1), e.send(null), !((200 <= e.status && e.status < 300) || 304 === e.status)))
            throw new Error("Couldn't load " + a + '. Status: ' + e.status)
          var n = Number(e.getResponseHeader('Content-length')),
            r = (t = e.getResponseHeader('Accept-Ranges')) && 'bytes' === t,
            t = (t = e.getResponseHeader('Content-Encoding')) && 'gzip' === t,
            i = 1048576
          r || (i = n)
          var o = this
          o.setDataGetter(function (e) {
            var r = e * i,
              t = (e + 1) * i - 1,
              t = Math.min(t, n - 1)
            if (
              (void 0 === o.chunks[e] &&
                (o.chunks[e] = (function (e, r) {
                  if (r < e) throw new Error('invalid range (' + e + ', ' + r + ') or no bytes requested!')
                  if (n - 1 < r) throw new Error('only ' + n + ' bytes available! programmer error!')
                  var t = new XMLHttpRequest()
                  if (
                    (t.open('GET', a, !1),
                    n !== i && t.setRequestHeader('Range', 'bytes=' + e + '-' + r),
                    'undefined' != typeof Uint8Array && (t.responseType = 'arraybuffer'),
                    t.overrideMimeType && t.overrideMimeType('text/plain; charset=x-user-defined'),
                    t.send(null),
                    !((200 <= t.status && t.status < 300) || 304 === t.status))
                  )
                    throw new Error("Couldn't load " + a + '. Status: ' + t.status)
                  return void 0 !== t.response
                    ? new Uint8Array(t.response || [])
                    : intArrayFromString(t.responseText || '', !0)
                })(r, t)),
              void 0 === o.chunks[e])
            )
              throw new Error('doXHR failed!')
            return o.chunks[e]
          }),
            (!t && n) ||
              ((i = n = 1),
              (n = this.getter(0).length),
              (i = n),
              console.log('LazyFiles on gzip forces download of the whole file when length is accessed')),
            (this._length = n),
            (this._chunkSize = i),
            (this.lengthKnown = !0)
        }),
        'undefined' != typeof XMLHttpRequest)
      ) {
        if (!ENVIRONMENT_IS_WORKER)
          throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc'
        var o = new i()
        Object.defineProperties(o, {
          length: {
            get: function () {
              return this.lengthKnown || this.cacheLength(), this._length
            },
          },
          chunkSize: {
            get: function () {
              return this.lengthKnown || this.cacheLength(), this._chunkSize
            },
          },
        })
        o = { isDevice: !1, contents: o }
      } else o = { isDevice: !1, url: a }
      var s = FS.createFile(e, r, o, t, n)
      o.contents ? (s.contents = o.contents) : o.url && ((s.contents = null), (s.url = o.url)),
        Object.defineProperties(s, {
          usedBytes: {
            get: function () {
              return this.contents.length
            },
          },
        })
      var u = {}
      return (
        Object.keys(s.stream_ops).forEach(function (e) {
          var r = s.stream_ops[e]
          u[e] = function () {
            if (!FS.forceLoadFile(s)) throw new FS.ErrnoError(ERRNO_CODES.EIO)
            return r.apply(null, arguments)
          }
        }),
        (u.read = function (e, r, t, n, i) {
          if (!FS.forceLoadFile(s)) throw new FS.ErrnoError(ERRNO_CODES.EIO)
          var o = e.node.contents
          if (i >= o.length) return 0
          var a = Math.min(o.length - i, n)
          if ((assert(0 <= a), o.slice)) for (var u = 0; u < a; u++) r[t + u] = o[i + u]
          else for (u = 0; u < a; u++) r[t + u] = o.get(i + u)
          return a
        }),
        (s.stream_ops = u),
        s
      )
    },
    createPreloadedFile: function (i, o, e, a, u, s, f, l, c, d) {
      Browser.init()
      var E = o ? PATH.resolve(PATH.join2(i, o)) : i,
        _ = getUniqueRunDependency('cp ' + E)
      function r(r) {
        function t(e) {
          d && d(), l || FS.createDataFile(i, o, e, a, u, c), s && s(), removeRunDependency(_)
        }
        var n = !1
        Module.preloadPlugins.forEach(function (e) {
          n ||
            (e.canHandle(E) &&
              (e.handle(r, E, t, function () {
                f && f(), removeRunDependency(_)
              }),
              (n = !0)))
        }),
          n || t(r)
      }
      addRunDependency(_),
        'string' == typeof e
          ? Browser.asyncLoad(
              e,
              function (e) {
                r(e)
              },
              f
            )
          : r(e)
    },
    indexedDB: function () {
      return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB
    },
    DB_NAME: function () {
      return 'EM_FS_' + window.location.pathname
    },
    DB_VERSION: 20,
    DB_STORE_NAME: 'FILE_DATA',
    saveFilesToDB: function (a, u, s) {
      ;(u = u || function () {}), (s = s || function () {})
      var e = FS.indexedDB()
      try {
        var f = e.open(FS.DB_NAME(), FS.DB_VERSION)
      } catch (e) {
        return s(e)
      }
      ;(f.onupgradeneeded = function () {
        console.log('creating db'), f.result.createObjectStore(FS.DB_STORE_NAME)
      }),
        (f.onsuccess = function () {
          var e = f.result.transaction([FS.DB_STORE_NAME], 'readwrite'),
            r = e.objectStore(FS.DB_STORE_NAME),
            t = 0,
            n = 0,
            i = a.length
          function o() {
            ;(0 == n ? u : s)()
          }
          a.forEach(function (e) {
            e = r.put(FS.analyzePath(e).object.contents, e)
            ;(e.onsuccess = function () {
              ++t + n == i && o()
            }),
              (e.onerror = function () {
                t + ++n == i && o()
              })
          }),
            (e.onerror = s)
        }),
        (f.onerror = s)
    },
    loadFilesFromDB: function (u, s, f) {
      ;(s = s || function () {}), (f = f || function () {})
      var e = FS.indexedDB()
      try {
        var l = e.open(FS.DB_NAME(), FS.DB_VERSION)
      } catch (e) {
        return f(e)
      }
      ;(l.onupgradeneeded = f),
        (l.onsuccess = function () {
          var e = l.result
          try {
            var r = e.transaction([FS.DB_STORE_NAME], 'readonly')
          } catch (e) {
            return void f(e)
          }
          var t = r.objectStore(FS.DB_STORE_NAME),
            n = 0,
            i = 0,
            o = u.length
          function a() {
            ;(0 == i ? s : f)()
          }
          u.forEach(function (e) {
            var r = t.get(e)
            ;(r.onsuccess = function () {
              FS.analyzePath(e).exists && FS.unlink(e),
                FS.createDataFile(PATH.dirname(e), PATH.basename(e), r.result, !0, !0, !0),
                ++n + i == o && a()
            }),
              (r.onerror = function () {
                n + ++i == o && a()
              })
          }),
            (r.onerror = f)
        }),
        (l.onerror = f)
    },
  },
  SYSCALLS = {
    DEFAULT_POLLMASK: 5,
    mappings: {},
    umask: 511,
    calculateAt: function (e, r) {
      if ('/' !== r[0]) {
        var t
        if (-100 === e) t = FS.cwd()
        else {
          e = FS.getStream(e)
          if (!e) throw new FS.ErrnoError(ERRNO_CODES.EBADF)
          t = e.path
        }
        r = PATH.join2(t, r)
      }
      return r
    },
    doStat: function (e, r, t) {
      try {
        var n = e(r)
      } catch (e) {
        if (e && e.node && PATH.normalize(r) !== PATH.normalize(FS.getPath(e.node))) return -ERRNO_CODES.ENOTDIR
        throw e
      }
      return (
        (HEAP32[t >> 2] = n.dev),
        (HEAP32[(t + 4) >> 2] = 0),
        (HEAP32[(t + 8) >> 2] = n.ino),
        (HEAP32[(t + 12) >> 2] = n.mode),
        (HEAP32[(t + 16) >> 2] = n.nlink),
        (HEAP32[(t + 20) >> 2] = n.uid),
        (HEAP32[(t + 24) >> 2] = n.gid),
        (HEAP32[(t + 28) >> 2] = n.rdev),
        (HEAP32[(t + 32) >> 2] = 0),
        (HEAP32[(t + 36) >> 2] = n.size),
        (HEAP32[(t + 40) >> 2] = 4096),
        (HEAP32[(t + 44) >> 2] = n.blocks),
        (HEAP32[(t + 48) >> 2] = (n.atime.getTime() / 1e3) | 0),
        (HEAP32[(t + 52) >> 2] = 0),
        (HEAP32[(t + 56) >> 2] = (n.mtime.getTime() / 1e3) | 0),
        (HEAP32[(t + 60) >> 2] = 0),
        (HEAP32[(t + 64) >> 2] = (n.ctime.getTime() / 1e3) | 0),
        (HEAP32[(t + 68) >> 2] = 0),
        (HEAP32[(t + 72) >> 2] = n.ino),
        0
      )
    },
    doMsync: function (e, r, t, n) {
      e = new Uint8Array(HEAPU8.subarray(e, e + t))
      FS.msync(r, e, 0, t, n)
    },
    doMkdir: function (e, r) {
      return '/' === (e = PATH.normalize(e))[e.length - 1] && (e = e.substr(0, e.length - 1)), FS.mkdir(e, r, 0), 0
    },
    doMknod: function (e, r, t) {
      switch (61440 & r) {
        case 32768:
        case 8192:
        case 24576:
        case 4096:
        case 49152:
          break
        default:
          return -ERRNO_CODES.EINVAL
      }
      return FS.mknod(e, r, t), 0
    },
    doReadlink: function (e, r, t) {
      if (t <= 0) return -ERRNO_CODES.EINVAL
      var n = FS.readlink(e),
        i = Math.min(t, lengthBytesUTF8(n)),
        e = HEAP8[r + i]
      return stringToUTF8(n, r, t + 1), (HEAP8[r + i] = e), i
    },
    doAccess: function (e, r) {
      if (-8 & r) return -ERRNO_CODES.EINVAL
      var t = FS.lookupPath(e, { follow: !0 }).node,
        e = ''
      return (
        4 & r && (e += 'r'),
        2 & r && (e += 'w'),
        1 & r && (e += 'x'),
        e && FS.nodePermissions(t, e) ? -ERRNO_CODES.EACCES : 0
      )
    },
    doDup: function (e, r, t) {
      var n = FS.getStream(t)
      return n && FS.close(n), FS.open(e, r, 0, t, t).fd
    },
    doReadv: function (e, r, t, n) {
      for (var i = 0, o = 0; o < t; o++) {
        var a = HEAP32[(r + 8 * o) >> 2],
          u = HEAP32[(r + (8 * o + 4)) >> 2],
          a = FS.read(e, HEAP8, a, u, n)
        if (a < 0) return -1
        if (((i += a), a < u)) break
      }
      return i
    },
    doWritev: function (e, r, t, n) {
      for (var i = 0, o = 0; o < t; o++) {
        var a = HEAP32[(r + 8 * o) >> 2],
          u = HEAP32[(r + (8 * o + 4)) >> 2],
          u = FS.write(e, HEAP8, a, u, n)
        if (u < 0) return -1
        i += u
      }
      return i
    },
    varargs: 0,
    get: function (e) {
      return (SYSCALLS.varargs += 4), HEAP32[(SYSCALLS.varargs - 4) >> 2]
    },
    getStr: function () {
      return Pointer_stringify(SYSCALLS.get())
    },
    getStreamFromFD: function () {
      var e = FS.getStream(SYSCALLS.get())
      if (!e) throw new FS.ErrnoError(ERRNO_CODES.EBADF)
      return e
    },
    getSocketFromFD: function () {
      var e = SOCKFS.getSocket(SYSCALLS.get())
      if (!e) throw new FS.ErrnoError(ERRNO_CODES.EBADF)
      return e
    },
    getSocketAddress: function (e) {
      var r = SYSCALLS.get(),
        t = SYSCALLS.get()
      if (e && 0 === r) return null
      t = __read_sockaddr(r, t)
      if (t.errno) throw new FS.ErrnoError(t.errno)
      return (t.addr = DNS.lookup_addr(t.addr) || t.addr), t
    },
    get64: function () {
      var e = SYSCALLS.get(),
        r = SYSCALLS.get()
      return assert(0 <= e ? 0 === r : -1 === r), e
    },
    getZero: function () {
      assert(0 === SYSCALLS.get())
    },
  }
function ___syscall5(e, r) {
  SYSCALLS.varargs = r
  try {
    var t = SYSCALLS.getStr(),
      n = SYSCALLS.get(),
      i = SYSCALLS.get()
    return FS.open(t, n, i).fd
  } catch (e) {
    return (void 0 !== FS && e instanceof FS.ErrnoError) || abort(e), -e.errno
  }
}
function ___lock() {}
function ___unlock() {}
function ___syscall6(e, r) {
  SYSCALLS.varargs = r
  try {
    var t = SYSCALLS.getStreamFromFD()
    return FS.close(t), 0
  } catch (e) {
    return (void 0 !== FS && e instanceof FS.ErrnoError) || abort(e), -e.errno
  }
}
var cttz_i8 = allocate(
    [
      8, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 5, 0, 1, 0, 2, 0,
      1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 6, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0,
      2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 5, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0,
      1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 7, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0,
      3, 0, 1, 0, 2, 0, 1, 0, 5, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0,
      1, 0, 6, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 5, 0, 1, 0,
      2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0,
    ],
    'i8',
    ALLOC_STATIC
  ),
  fs,
  NODEJS_PATH
function _emscripten_memcpy_big(e, r, t) {
  return HEAPU8.set(HEAPU8.subarray(r, r + t), e), e
}
function ___syscall140(e, r) {
  SYSCALLS.varargs = r
  try {
    var t = SYSCALLS.getStreamFromFD(),
      n = SYSCALLS.get(),
      i = SYSCALLS.get(),
      o = SYSCALLS.get(),
      a = SYSCALLS.get(),
      i = i
    return (
      assert(0 === n),
      FS.llseek(t, i, a),
      (HEAP32[o >> 2] = t.position),
      t.getdents && 0 === i && 0 === a && (t.getdents = null),
      0
    )
  } catch (e) {
    return (void 0 !== FS && e instanceof FS.ErrnoError) || abort(e), -e.errno
  }
}
function ___syscall146(e, r) {
  SYSCALLS.varargs = r
  try {
    var t = SYSCALLS.getStreamFromFD(),
      n = SYSCALLS.get(),
      i = SYSCALLS.get()
    return SYSCALLS.doWritev(t, n, i)
  } catch (e) {
    return (void 0 !== FS && e instanceof FS.ErrnoError) || abort(e), -e.errno
  }
}
function ___syscall54(e, r) {
  SYSCALLS.varargs = r
  try {
    var t = SYSCALLS.getStreamFromFD(),
      n = SYSCALLS.get()
    switch (n) {
      case 21505:
      case 21506:
        return t.tty ? 0 : -ERRNO_CODES.ENOTTY
      case 21519:
        if (!t.tty) return -ERRNO_CODES.ENOTTY
        var i = SYSCALLS.get()
        return (HEAP32[i >> 2] = 0)
      case 21520:
        return t.tty ? -ERRNO_CODES.EINVAL : -ERRNO_CODES.ENOTTY
      case 21531:
        i = SYSCALLS.get()
        return FS.ioctl(t, n, i)
      default:
        abort('bad ioctl syscall ' + n)
    }
  } catch (e) {
    return (void 0 !== FS && e instanceof FS.ErrnoError) || abort(e), -e.errno
  }
}
function ___syscall221(e, r) {
  SYSCALLS.varargs = r
  try {
    var t = SYSCALLS.getStreamFromFD()
    switch (SYSCALLS.get()) {
      case 0:
        return (n = SYSCALLS.get()) < 0 ? -ERRNO_CODES.EINVAL : FS.open(t.path, t.flags, 0, n).fd
      case 1:
      case 2:
        return 0
      case 3:
        return t.flags
      case 4:
        var n = SYSCALLS.get()
        return (t.flags |= n), 0
      case 12:
      case 12:
        n = SYSCALLS.get()
        return (HEAP16[(n + 0) >> 1] = 2), 0
      case 13:
      case 14:
      case 13:
      case 14:
        return 0
      case 16:
      case 8:
        return -ERRNO_CODES.EINVAL
      case 9:
        return ___setErrNo(ERRNO_CODES.EINVAL), -1
      default:
        return -ERRNO_CODES.EINVAL
    }
  } catch (e) {
    return (void 0 !== FS && e instanceof FS.ErrnoError) || abort(e), -e.errno
  }
}
function ___syscall145(e, r) {
  SYSCALLS.varargs = r
  try {
    var t = SYSCALLS.getStreamFromFD(),
      n = SYSCALLS.get(),
      i = SYSCALLS.get()
    return SYSCALLS.doReadv(t, n, i)
  } catch (e) {
    return (void 0 !== FS && e instanceof FS.ErrnoError) || abort(e), -e.errno
  }
}
function nullFunc_iiii(e) {
  Module.printErr(
    "Invalid function pointer called with signature 'iiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
  ),
    Module.printErr('Build with ASSERTIONS=2 for more info.'),
    abort(e)
}
function nullFunc_vi(e) {
  Module.printErr(
    "Invalid function pointer called with signature 'vi'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
  ),
    Module.printErr('Build with ASSERTIONS=2 for more info.'),
    abort(e)
}
function nullFunc_vii(e) {
  Module.printErr(
    "Invalid function pointer called with signature 'vii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
  ),
    Module.printErr('Build with ASSERTIONS=2 for more info.'),
    abort(e)
}
function nullFunc_ii(e) {
  Module.printErr(
    "Invalid function pointer called with signature 'ii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
  ),
    Module.printErr('Build with ASSERTIONS=2 for more info.'),
    abort(e)
}
function nullFunc_iiiii(e) {
  Module.printErr(
    "Invalid function pointer called with signature 'iiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
  ),
    Module.printErr('Build with ASSERTIONS=2 for more info.'),
    abort(e)
}
function nullFunc_iii(e) {
  Module.printErr(
    "Invalid function pointer called with signature 'iii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)"
  ),
    Module.printErr('Build with ASSERTIONS=2 for more info.'),
    abort(e)
}
function invoke_iiii(e, r, t, n) {
  try {
    return Module.dynCall_iiii(e, r, t, n)
  } catch (e) {
    if ('number' != typeof e && 'longjmp' !== e) throw e
    asm.setThrew(1, 0)
  }
}
function invoke_vi(e, r) {
  try {
    Module.dynCall_vi(e, r)
  } catch (e) {
    if ('number' != typeof e && 'longjmp' !== e) throw e
    asm.setThrew(1, 0)
  }
}
function invoke_vii(e, r, t) {
  try {
    Module.dynCall_vii(e, r, t)
  } catch (e) {
    if ('number' != typeof e && 'longjmp' !== e) throw e
    asm.setThrew(1, 0)
  }
}
function invoke_ii(e, r) {
  try {
    return Module.dynCall_ii(e, r)
  } catch (e) {
    if ('number' != typeof e && 'longjmp' !== e) throw e
    asm.setThrew(1, 0)
  }
}
function invoke_iiiii(e, r, t, n, i) {
  try {
    return Module.dynCall_iiiii(e, r, t, n, i)
  } catch (e) {
    if ('number' != typeof e && 'longjmp' !== e) throw e
    asm.setThrew(1, 0)
  }
}
function invoke_iii(e, r, t) {
  try {
    return Module.dynCall_iii(e, r, t)
  } catch (e) {
    if ('number' != typeof e && 'longjmp' !== e) throw e
    asm.setThrew(1, 0)
  }
}
;(Module._llvm_cttz_i32 = _llvm_cttz_i32),
  (Module.___udivmoddi4 = ___udivmoddi4),
  (Module.___udivdi3 = ___udivdi3),
  (Module._sbrk = _sbrk),
  (Module.___uremdi3 = ___uremdi3),
  (Module._memcpy = _memcpy),
  (Module._pthread_self = _pthread_self),
  FS.staticInit(),
  __ATINIT__.unshift(function () {
    Module.noFSInit || FS.init.initialized || FS.init()
  }),
  __ATMAIN__.push(function () {
    FS.ignorePermissions = !1
  }),
  __ATEXIT__.push(function () {
    FS.quit()
  }),
  (Module.FS_createFolder = FS.createFolder),
  (Module.FS_createPath = FS.createPath),
  (Module.FS_createDataFile = FS.createDataFile),
  (Module.FS_createPreloadedFile = FS.createPreloadedFile),
  (Module.FS_createLazyFile = FS.createLazyFile),
  (Module.FS_createLink = FS.createLink),
  (Module.FS_createDevice = FS.createDevice),
  (Module.FS_unlink = FS.unlink),
  __ATINIT__.unshift(function () {
    TTY.init()
  }),
  __ATEXIT__.push(function () {
    TTY.shutdown()
  }),
  ENVIRONMENT_IS_NODE && ((fs = require('fs')), (NODEJS_PATH = require('path')), NODEFS.staticInit()),
  (DYNAMICTOP_PTR = allocate(1, 'i32', ALLOC_STATIC)),
  (STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP)),
  (STACK_MAX = STACK_BASE + TOTAL_STACK),
  (DYNAMIC_BASE = Runtime.alignMemory(STACK_MAX)),
  (HEAP32[DYNAMICTOP_PTR >> 2] = DYNAMIC_BASE),
  (staticSealed = !0),
  assert(DYNAMIC_BASE < TOTAL_MEMORY, 'TOTAL_MEMORY not big enough for stack'),
  (Module.asmGlobalArg = {
    Math: Math,
    Int8Array: Int8Array,
    Int16Array: Int16Array,
    Int32Array: Int32Array,
    Uint8Array: Uint8Array,
    Uint16Array: Uint16Array,
    Uint32Array: Uint32Array,
    Float32Array: Float32Array,
    Float64Array: Float64Array,
    NaN: NaN,
    Infinity: 1 / 0,
    byteLength: byteLength,
  }),
  (Module.asmLibraryArg = {
    abort: abort,
    assert: assert,
    enlargeMemory: enlargeMemory,
    getTotalMemory: getTotalMemory,
    abortOnCannotGrowMemory: abortOnCannotGrowMemory,
    abortStackOverflow: abortStackOverflow,
    nullFunc_iiii: nullFunc_iiii,
    nullFunc_vi: nullFunc_vi,
    nullFunc_vii: nullFunc_vii,
    nullFunc_ii: nullFunc_ii,
    nullFunc_iiiii: nullFunc_iiiii,
    nullFunc_iii: nullFunc_iii,
    invoke_iiii: invoke_iiii,
    invoke_vi: invoke_vi,
    invoke_vii: invoke_vii,
    invoke_ii: invoke_ii,
    invoke_iiiii: invoke_iiiii,
    invoke_iii: invoke_iii,
    _pthread_cleanup_pop: _pthread_cleanup_pop,
    ___syscall221: ___syscall221,
    _emscripten_asm_const_iiii: _emscripten_asm_const_iiii,
    ___lock: ___lock,
    _abort: _abort,
    ___setErrNo: ___setErrNo,
    ___syscall6: ___syscall6,
    ___syscall140: ___syscall140,
    ___syscall146: ___syscall146,
    ___syscall5: ___syscall5,
    _emscripten_memcpy_big: _emscripten_memcpy_big,
    ___syscall54: ___syscall54,
    ___unlock: ___unlock,
    _emscripten_asm_const_v: _emscripten_asm_const_v,
    _pthread_cleanup_push: _pthread_cleanup_push,
    ___syscall145: ___syscall145,
    _emscripten_asm_const_iii: _emscripten_asm_const_iii,
    STACKTOP: STACKTOP,
    STACK_MAX: STACK_MAX,
    DYNAMICTOP_PTR: DYNAMICTOP_PTR,
    tempDoublePtr: tempDoublePtr,
    ABORT: ABORT,
    cttz_i8: cttz_i8,
  })
var asm = (function (e, r, t) {
    var n = e.Int8Array,
      i = e.Int16Array,
      o = e.Int32Array,
      a = e.Uint8Array,
      u = e.Uint16Array,
      s = e.Uint32Array,
      f = e.Float32Array,
      l = e.Float64Array,
      Et = new n(t),
      _t = new i(t),
      St = new o(t),
      mt = new a(t),
      re = new u(t),
      ht = (new s(t), new f(t), new l(t)),
      c = e.byteLength,
      pt = 0 | r.STACKTOP,
      bt = 0 | r.STACK_MAX,
      d = 0 | r.DYNAMICTOP_PTR,
      kt = 0 | r.tempDoublePtr,
      E = (r.ABORT, 0 | r.cttz_i8),
      _ = 0,
      Ft = (e.NaN, e[1 / 0], 0),
      wt =
        (e.Math.floor,
        e.Math.abs,
        e.Math.sqrt,
        e.Math.pow,
        e.Math.cos,
        e.Math.sin,
        e.Math.tan,
        e.Math.acos,
        e.Math.asin,
        e.Math.atan,
        e.Math.atan2,
        e.Math.exp,
        e.Math.log,
        e.Math.ceil,
        e.Math.imul),
      D = (e.Math.min, e.Math.max, e.Math.clz32),
      S = (r.abort, r.assert, r.enlargeMemory),
      m = r.getTotalMemory,
      h = r.abortOnCannotGrowMemory,
      yt = r.abortStackOverflow,
      p = r.nullFunc_iiii,
      b = r.nullFunc_vi,
      k = r.nullFunc_vii,
      F = r.nullFunc_ii,
      w = r.nullFunc_iiiii,
      y = r.nullFunc_iii,
      v = (r.invoke_iiii, r.invoke_vi, r.invoke_vii, r.invoke_ii, r.invoke_iiiii, r.invoke_iii, r._pthread_cleanup_pop),
      x = r.___syscall221,
      B = r._emscripten_asm_const_iiii,
      H = r.___lock,
      Me = r._abort,
      M = r.___setErrNo,
      U = r.___syscall6,
      O = r.___syscall140,
      A = r.___syscall146,
      z = r.___syscall5,
      R = r._emscripten_memcpy_big,
      Y = r.___syscall54,
      V = r.___unlock,
      K = r._emscripten_asm_const_v,
      g = r._pthread_cleanup_push,
      T = r.___syscall145,
      Q = r._emscripten_asm_const_iii
    function W(e, r, t, n, i, o, a, u, s, f, l, c) {
      ;(r |= 0), (t |= 0), (n |= 0), (i |= 0), (o |= 0), (a |= 0), (u |= 0), (s |= 0), (f |= 0), (l |= 0), (c |= 0)
      var d,
        E,
        _,
        S,
        m,
        h = 0,
        p = 0,
        b = 0,
        k = 0,
        h = 0 | St[((0 | St[((e |= 0) + 60) >> 2]) + (t << 2)) >> 2]
      if (((St[a >> 2] = 0), -1 == ((St[u >> 2] = 0) | h)))
        return (
          or[3 & St[(s + 4) >> 2]](s, 0 | St[i >> 2]), (St[n >> 2] = -1), (St[i >> 2] = 0), (p = St[o >> 2] = 0) | p
        )
      if (0 == (0 | St[i >> 2]) || (0 | St[n >> 2]) != (0 | h)) {
        if (
          ((E = 0 | G((d = ((b = 0 | St[(e + 12) >> 2]) + ((40 * h) | 0)) | 0))),
          (_ = Ft),
          (S =
            0 |
            (function (e, r, t) {
              ;(e |= 0), (r |= 0), (t |= 0)
              var n = 0,
                i = 0,
                o = 0,
                a = 0
              ;(0 | (pt = ((n = pt) + 16) | 0)) >= (0 | bt) && yt(16)
              return (
                (o = (n + 4) | 0),
                (St[(i = ((a = n) + 8) | 0) >> 2] = e),
                (St[o >> 2] = r),
                (St[a >> 2] = t),
                (t = (40 + (0 | St[i >> 2])) | 0),
                (r =
                  ((0 | St[(52 + (0 | St[i >> 2])) >> 2]) +
                    (((0 | St[((0 | St[(48 + (0 | St[i >> 2])) >> 2]) + (St[o >> 2] << 2)) >> 2]) + (0 | St[a >> 2])) <<
                      3)) |
                  0),
                (a = 0 | Dt(0 | St[t >> 2], 0 | St[(t + 4) >> 2], 0 | St[r >> 2], 0 | St[(r + 4) >> 2])),
                (pt = n),
                0 | a
              )
            })(e, h, 0)),
          (m = Ft),
          !(((0 | E) == (0 | E)) & (0 == (0 | _))))
        )
          return 0 | (p = 2)
        if (((St[n >> 2] = h), or[3 & St[(s + 4) >> 2]](s, 0 | St[i >> 2]), (St[i >> 2] = 0) | (n = 0 | he(r, S, m))))
          return 0 | (p = n)
        if ((St[o >> 2] = E)) {
          if (((n = 0 | sr[3 & St[s >> 2]](s, E)), !(St[i >> 2] = n))) return 0 | (p = 2)
          k = n
        } else k = 0 | St[i >> 2]
        if (
          0 |
          (n =
            0 |
            Re(
              d,
              ((0 | St[e >> 2]) + (St[((0 | St[(e + 48) >> 2]) + (h << 2)) >> 2] << 3)) | 0,
              r,
              S,
              m,
              k,
              E,
              f,
              l,
              c
            ))
        )
          return 0 | (p = n)
        if (
          0 | St[(b + ((40 * h) | 0) + 28) >> 2] &&
          (0 | (n = 0 | Pe(0 | St[i >> 2], E))) != (0 | St[(b + ((40 * h) | 0) + 32) >> 2])
        )
          return 0 | (p = 3)
      }
      if (
        ((b = 0 | St[(e + 16) >> 2]),
        (n = (St[a >> 2] = 0) | St[((0 | St[(e + 56) >> 2]) + (h << 2)) >> 2]) >>> 0 < t >>> 0)
      ) {
        for (h = n, n = 0; (n = (n + (0 | St[(b + (h << 5) + 8) >> 2])) | 0), (h = (h + 1) | 0), (0 | h) != (0 | t); );
        St[a >> 2] = n
      }
      return (
        (n = 0 | St[(b + (t << 5) + 8) >> 2]),
        (St[u >> 2] = n),
        (((u = 0 | St[a >> 2]) + n) | 0) >>> 0 > (0 | St[o >> 2]) >>> 0
          ? 0 | (p = 11)
          : 0 | Et[(b + (t << 5) + 27) >> 0]
            ? 0 | (p = (0 | (o = 0 | Pe(((0 | St[i >> 2]) + u) | 0, n))) == (0 | St[(b + (t << 5) + 16) >> 2]) ? 0 : 3)
            : (p = 0) | p
      )
    }
    function j(e, r, t, n) {
      ;(e |= 0), (r |= 0), (t |= 0), (n |= 0)
      var i,
        o,
        a,
        u,
        s,
        f,
        l,
        c,
        d,
        E,
        _ = 0,
        S = 0,
        m = pt
      ;(0 | bt) <= (0 | (pt = (pt + 48) | 0)) && yt(48),
        (i = (m + 36) | 0),
        (a = (m + 28) | 0),
        (u = (m + 24) | 0),
        (s = (m + 20) | 0),
        (f = (m + 16) | 0),
        (l = (m + 12) | 0),
        (c = (m + 8) | 0),
        (d = (m + 4) | 0),
        (St[(o = ((E = m) + 32) | 0) >> 2] = e),
        (St[a >> 2] = r),
        (St[u >> 2] = t),
        (St[s >> 2] = n),
        (St[f >> 2] = 0),
        (St[l >> 2] = 0)
      e: for (;;) {
        if ((0 | St[l >> 2]) == (0 | St[s >> 2])) {
          _ = 3
          break
        }
        if (
          ((n = 0 | St[l >> 2]),
          (St[l >> 2] = n + 1),
          (St[d >> 2] = re[((0 | St[u >> 2]) + (n << 1)) >> 1]),
          (0 | St[d >> 2]) >>> 0 < 128)
        )
          0 | St[o >> 2] && (Et[((0 | St[o >> 2]) + (0 | St[f >> 2])) >> 0] = St[d >> 2]),
            (St[f >> 2] = 1 + (0 | St[f >> 2]))
        else {
          if ((55296 <= (0 | St[d >> 2]) >>> 0) & ((0 | St[d >> 2]) >>> 0 < 57344)) {
            if (56320 <= (0 | St[d >> 2]) >>> 0) {
              _ = 23
              break
            }
            if ((0 | St[l >> 2]) == (0 | St[s >> 2])) {
              _ = 23
              break
            }
            if (
              ((n = 0 | St[l >> 2]),
              (St[l >> 2] = n + 1),
              (St[E >> 2] = re[((0 | St[u >> 2]) + (n << 1)) >> 1]),
              ((0 | St[E >> 2]) >>> 0 < 56320) | (57344 <= (0 | St[E >> 2]) >>> 0))
            ) {
              _ = 23
              break
            }
            St[d >> 2] = 65536 + ((((0 | St[d >> 2]) - 55296) << 10) | ((0 | St[E >> 2]) - 56320))
          }
          for (
            St[c >> 2] = 1;
            !(5 <= (0 | St[c >> 2]) >>> 0 || (0 | St[d >> 2]) >>> 0 < (1 << (6 + ((5 * (0 | St[c >> 2])) | 0))) >>> 0);

          )
            St[c >> 2] = 1 + (0 | St[c >> 2])
          for (
            0 | St[o >> 2] &&
              (Et[((0 | St[o >> 2]) + (0 | St[f >> 2])) >> 0] =
                (0 | mt[((0 | St[c >> 2]) - 1 + 341) >> 0]) + ((0 | St[d >> 2]) >>> ((6 * (0 | St[c >> 2])) | 0))),
              St[f >> 2] = 1 + (0 | St[f >> 2]);
            ;

          )
            if (
              ((St[c >> 2] = (0 | St[c >> 2]) - 1),
              0 | St[o >> 2] &&
                (Et[((0 | St[o >> 2]) + (0 | St[f >> 2])) >> 0] =
                  128 + (((0 | St[d >> 2]) >>> ((6 * (0 | St[c >> 2])) | 0)) & 63)),
              (St[f >> 2] = 1 + (0 | St[f >> 2])),
              !(0 | St[c >> 2]))
            )
              continue e
        }
      }
      return 3 == (0 | _)
        ? ((St[St[a >> 2] >> 2] = St[f >> 2]), (Et[i >> 0] = 1), (S = 0 | Et[i >> 0]), (pt = m), 0 | (1 & S))
        : 23 == (0 | _)
          ? ((St[St[a >> 2] >> 2] = St[f >> 2]), (S = (Et[i >> 0] = 0) | Et[i >> 0]), (pt = m), 0 | (1 & S))
          : 0
    }
    function X(e) {
      e |= 0
      var r,
        t = pt
      ;(0 | bt) <= (0 | (pt = (pt + 16) | 0)) && yt(16),
        (St[(r = t) >> 2] = e),
        Ce((16 + (0 | St[r >> 2])) | 0),
        (pt = t)
    }
    function P(e) {
      e |= 0
      var r,
        t = pt
      ;(0 | bt) <= (0 | (pt = (pt + 16) | 0)) && yt(16),
        (St[(r = t) >> 2] = e),
        (St[St[r >> 2] >> 2] = 0),
        (St[(4 + (0 | St[r >> 2])) >> 2] = 0),
        (St[(8 + (0 | St[r >> 2])) >> 2] = 0),
        (St[(12 + (0 | St[r >> 2])) >> 2] = 0),
        (St[(16 + (0 | St[r >> 2])) >> 2] = 0),
        (St[(20 + (0 | St[r >> 2])) >> 2] = 0),
        (St[(24 + (0 | St[r >> 2])) >> 2] = 0),
        (St[(28 + (0 | St[r >> 2])) >> 2] = 0),
        (St[(32 + (0 | St[r >> 2])) >> 2] = 0),
        (St[(36 + (0 | St[r >> 2])) >> 2] = 0),
        (pt = t)
    }
    function N(e, r) {
      ;(e |= 0), (r |= 0)
      var t,
        n,
        i,
        o = pt
      ;(0 | bt) <= (0 | (pt = (pt + 16) | 0)) && yt(16),
        (n = (o + 4) | 0),
        (St[(t = ((i = o) + 8) | 0) >> 2] = e),
        (St[n >> 2] = r)
      e: do {
        if (0 | St[St[t >> 2] >> 2])
          for (St[i >> 2] = 0; ; ) {
            if ((0 | St[i >> 2]) >>> 0 >= (0 | St[(16 + (0 | St[t >> 2])) >> 2]) >>> 0) break e
            !(function (e, r) {
              ;(e |= 0), (r |= 0)
              var t,
                n,
                i = pt
              ;(0 | bt) <= (0 | (pt = (pt + 16) | 0)) && yt(16),
                (St[(t = ((n = i) + 4) | 0) >> 2] = e),
                (St[n >> 2] = r),
                Le((16 + (0 | St[t >> 2])) | 0, 0 | St[n >> 2]),
                X(0 | St[t >> 2]),
                (pt = i)
            })(((0 | St[St[t >> 2] >> 2]) + ((24 * (0 | St[i >> 2])) | 0)) | 0, 0 | St[n >> 2]),
              (St[i >> 2] = 1 + (0 | St[i >> 2]))
          }
      } while (0)
      or[3 & St[(4 + (0 | St[n >> 2])) >> 2]](0 | St[n >> 2], 0 | St[St[t >> 2] >> 2]),
        or[3 & St[(4 + (0 | St[n >> 2])) >> 2]](0 | St[n >> 2], 0 | St[(4 + (0 | St[t >> 2])) >> 2]),
        or[3 & St[(4 + (0 | St[n >> 2])) >> 2]](0 | St[n >> 2], 0 | St[(8 + (0 | St[t >> 2])) >> 2]),
        or[3 & St[(4 + (0 | St[n >> 2])) >> 2]](0 | St[n >> 2], 0 | St[(12 + (0 | St[t >> 2])) >> 2]),
        P(0 | St[t >> 2]),
        (pt = o)
    }
    function C(e) {
      e |= 0
      var r,
        t,
        n,
        i = pt
      for (
        (0 | bt) <= (0 | (pt = (pt + 16) | 0)) && yt(16),
          t = (i + 4) | 0,
          St[(r = ((n = i) + 8) | 0) >> 2] = e,
          St[t >> 2] = 0,
          St[n >> 2] = 0;
        !((0 | St[n >> 2]) >>> 0 >= (0 | St[(16 + (0 | St[r >> 2])) >> 2]) >>> 0);

      )
        (St[t >> 2] =
          (0 | St[t >> 2]) + (0 | St[((0 | St[St[r >> 2] >> 2]) + ((24 * (0 | St[n >> 2])) | 0) + 4) >> 2])),
          (St[n >> 2] = 1 + (0 | St[n >> 2]))
      return (pt = i), 0 | St[t >> 2]
    }
    function G(e) {
      e |= 0
      var r,
        t,
        n,
        i,
        o = 0,
        a = 0,
        u = 0,
        s = pt
      ;(0 | bt) <= (0 | (pt = (pt + 16) | 0)) && yt(16),
        (n = ((r = s) + 8) | 0),
        (St[(t = (s + 12) | 0) >> 2] = e),
        (e = 0 | C(0 | St[t >> 2])),
        (St[n >> 2] = e)
      do {
        if (0 | St[n >> 2]) {
          for (St[n >> 2] = (0 | St[n >> 2]) - 1; ; ) {
            if ((0 | St[n >> 2]) < 0) {
              o = 8
              break
            }
            if (
              ((e =
                (0 |
                  (function (e, r) {
                    ;(e |= 0), (r |= 0)
                    var t,
                      n,
                      i,
                      o,
                      a = 0,
                      u = 0,
                      s = 0,
                      f = pt
                    for (
                      (0 | bt) <= (0 | (pt = (pt + 16) | 0)) && yt(16),
                        t = (f + 12) | 0,
                        i = (f + 4) | 0,
                        St[(n = ((o = f) + 8) | 0) >> 2] = e,
                        St[i >> 2] = r,
                        St[o >> 2] = 0;
                      ;

                    ) {
                      if ((0 | St[o >> 2]) >>> 0 >= (0 | St[(20 + (0 | St[n >> 2])) >> 2]) >>> 0) {
                        a = 6
                        break
                      }
                      if (
                        ((u = 0 | St[o >> 2]),
                        (0 | St[((0 | St[(4 + (0 | St[n >> 2])) >> 2]) + (St[o >> 2] << 3) + 4) >> 2]) ==
                          (0 | St[i >> 2]))
                      ) {
                        a = 4
                        break
                      }
                      St[o >> 2] = u + 1
                    }
                    return 4 == (0 | a)
                      ? ((St[t >> 2] = u), (s = 0 | St[t >> 2]), (pt = f), 0 | s)
                      : 6 == (0 | a)
                        ? ((St[t >> 2] = -1), (s = 0 | St[t >> 2]), (pt = f), 0 | s)
                        : 0
                  })(0 | St[t >> 2], 0 | St[n >> 2])) <
                0),
              (a = 0 | St[n >> 2]),
              e)
            ) {
              o = 6
              break
            }
            St[n >> 2] = a + -1
          }
          if (6 == (0 | o)) {
            ;(e = ((0 | St[(12 + (0 | St[t >> 2])) >> 2]) + (a << 3)) | 0),
              (u = 0 | St[(e + 4) >> 2]),
              (St[(i = r) >> 2] = St[e >> 2]),
              (St[(i + 4) >> 2] = u)
            break
          }
          if (8 == (0 | o)) {
            ;(St[(u = r) >> 2] = 0), (St[(u + 4) >> 2] = 0)
            break
          }
        } else (St[(u = r) >> 2] = 0), (St[(u + 4) >> 2] = 0)
      } while (0)
      return (Ft = 0 | St[((o = r) + 4) >> 2]), (pt = s), 0 | St[o >> 2]
    }
    function q(e) {
      e |= 0
      var r,
        t = pt
      ;(0 | bt) <= (0 | (pt = (pt + 16) | 0)) && yt(16),
        (St[(r = t) >> 2] = e),
        (St[St[r >> 2] >> 2] = 0),
        (St[(4 + (0 | St[r >> 2])) >> 2] = 0),
        (St[(8 + (0 | St[r >> 2])) >> 2] = 0),
        (St[(12 + (0 | St[r >> 2])) >> 2] = 0),
        (St[(16 + (0 | St[r >> 2])) >> 2] = 0),
        (St[(20 + (0 | St[r >> 2])) >> 2] = 0),
        (St[(24 + (0 | St[r >> 2])) >> 2] = 0),
        (St[(28 + (0 | St[r >> 2])) >> 2] = 0),
        (pt = t)
    }
    function Z(e, r) {
      ;(e |= 0), (r |= 0)
      var t,
        n,
        i,
        o = pt
      ;(0 | bt) <= (0 | (pt = (pt + 16) | 0)) && yt(16),
        (n = (o + 4) | 0),
        (St[(t = ((i = o) + 8) | 0) >> 2] = e),
        (St[n >> 2] = r)
      e: do {
        if (0 | St[(12 + (0 | St[t >> 2])) >> 2])
          for (St[i >> 2] = 0; ; ) {
            if ((0 | St[i >> 2]) >>> 0 >= (0 | St[(24 + (0 | St[t >> 2])) >> 2]) >>> 0) break e
            N(((0 | St[(12 + (0 | St[t >> 2])) >> 2]) + ((40 * (0 | St[i >> 2])) | 0)) | 0, 0 | St[n >> 2]),
              (St[i >> 2] = 1 + (0 | St[i >> 2]))
          }
      } while (0)
      or[3 & St[(4 + (0 | St[n >> 2])) >> 2]](0 | St[n >> 2], 0 | St[St[t >> 2] >> 2]),
        or[3 & St[(4 + (0 | St[n >> 2])) >> 2]](0 | St[n >> 2], 0 | St[(4 + (0 | St[t >> 2])) >> 2]),
        or[3 & St[(4 + (0 | St[n >> 2])) >> 2]](0 | St[n >> 2], 0 | St[(8 + (0 | St[t >> 2])) >> 2]),
        or[3 & St[(4 + (0 | St[n >> 2])) >> 2]](0 | St[n >> 2], 0 | St[(12 + (0 | St[t >> 2])) >> 2]),
        or[3 & St[(4 + (0 | St[n >> 2])) >> 2]](0 | St[n >> 2], 0 | St[(16 + (0 | St[t >> 2])) >> 2]),
        q(0 | St[t >> 2]),
        (pt = o)
    }
    function J(e) {
      e |= 0
      var r,
        t = pt
      ;(0 | bt) <= (0 | (pt = (pt + 16) | 0)) && yt(16),
        (St[(r = t) >> 2] = e),
        q(0 | St[r >> 2]),
        (St[(48 + (0 | St[r >> 2])) >> 2] = 0),
        (St[(52 + (0 | St[r >> 2])) >> 2] = 0),
        (St[(56 + (0 | St[r >> 2])) >> 2] = 0),
        (St[(60 + (0 | St[r >> 2])) >> 2] = 0),
        Ce((68 + ((St[(64 + (0 | St[r >> 2])) >> 2] = 0) | St[r >> 2])) | 0),
        (pt = t)
    }
    function $(e, r) {
      ;(e |= 0), (r |= 0)
      var t,
        n,
        i = pt
      ;(0 | bt) <= (0 | (pt = (pt + 16) | 0)) && yt(16),
        (St[(t = ((n = i) + 4) | 0) >> 2] = e),
        (St[n >> 2] = r),
        or[3 & St[(4 + (0 | St[n >> 2])) >> 2]](0 | St[n >> 2], 0 | St[(48 + (0 | St[t >> 2])) >> 2]),
        or[3 & St[(4 + (0 | St[n >> 2])) >> 2]](0 | St[n >> 2], 0 | St[(52 + (0 | St[t >> 2])) >> 2]),
        or[3 & St[(4 + (0 | St[n >> 2])) >> 2]](0 | St[n >> 2], 0 | St[(56 + (0 | St[t >> 2])) >> 2]),
        or[3 & St[(4 + (0 | St[n >> 2])) >> 2]](0 | St[n >> 2], 0 | St[(60 + (0 | St[t >> 2])) >> 2]),
        or[3 & St[(4 + (0 | St[n >> 2])) >> 2]](0 | St[n >> 2], 0 | St[(64 + (0 | St[t >> 2])) >> 2]),
        Le((68 + (0 | St[t >> 2])) | 0, 0 | St[n >> 2]),
        Z(0 | St[t >> 2], 0 | St[n >> 2]),
        J(0 | St[t >> 2]),
        (pt = i)
    }
    function ee(e, r, t) {
      ;(e |= 0), (r |= 0), (t |= 0)
      var n,
        i,
        o,
        a,
        u,
        s,
        f = 0,
        l = pt
      if (
        ((0 | bt) <= (0 | (pt = (pt + 32) | 0)) && yt(32),
        (i = (l + 16) | 0),
        (o = (l + 12) | 0),
        (a = (l + 8) | 0),
        (u = (l + 4) | 0),
        (St[(n = ((s = l) + 20) | 0) >> 2] = e),
        (St[i >> 2] = r),
        (St[o >> 2] = t),
        (St[a >> 2] =
          (0 | St[((0 | St[(64 + (0 | St[n >> 2])) >> 2]) + ((1 + (0 | St[i >> 2])) << 2)) >> 2]) -
          (0 | St[((0 | St[(64 + (0 | St[n >> 2])) >> 2]) + (St[i >> 2] << 2)) >> 2])),
        !(0 | St[o >> 2]))
      )
        return (f = 0 | St[a >> 2]), (pt = l), 0 | f
      for (
        St[s >> 2] =
          (0 | St[(68 + (0 | St[n >> 2])) >> 2]) +
          (St[((0 | St[(64 + (0 | St[n >> 2])) >> 2]) + (St[i >> 2] << 2)) >> 2] << 1),
          St[u >> 2] = 0;
        !((0 | St[u >> 2]) >>> 0 >= (0 | St[a >> 2]) >>> 0);

      )
        (_t[((0 | St[o >> 2]) + (St[u >> 2] << 1)) >> 1] =
          0 |
          mt[((0 | St[s >> 2]) + (St[u >> 2] << 1)) >> 0] |
          ((65535 & (0 | mt[((0 | St[s >> 2]) + (St[u >> 2] << 1) + 1) >> 0])) << 8)),
          (St[u >> 2] = 1 + (0 | St[u >> 2]))
      return (f = 0 | St[a >> 2]), (pt = l), 0 | f
    }
    function ue(e, r) {
      ;(e |= 0), (r |= 0)
      var t,
        n,
        i = pt
      return (
        (0 | bt) <= (0 | (pt = (pt + 16) | 0)) && yt(16),
        (St[(t = ((n = i) + 4) | 0) >> 2] = e),
        (St[n >> 2] = r),
        (r = 0 | le(0 | St[t >> 2], 0 | St[n >> 2])),
        (pt = i),
        0 | r
      )
    }
    function se(e, r, t, n, i, o, a, u, s) {
      ;(e |= 0), (r |= 0), (t |= 0), (n |= 0), (i |= 0), (o |= 0), (a |= 0), (u |= 0), (s |= 0)
      var f,
        l,
        c,
        d,
        E,
        _,
        S,
        m,
        h,
        p,
        b,
        k,
        F,
        w,
        y,
        v = 0,
        M = 0,
        O = pt
      ;(0 | bt) <= (0 | (pt = (pt + 64) | 0)) && yt(64),
        (f = (O + 60) | 0),
        (c = (O + 52) | 0),
        (d = (O + 48) | 0),
        (E = (O + 44) | 0),
        (_ = (O + 40) | 0),
        (S = (O + 36) | 0),
        (m = (O + 32) | 0),
        (h = (O + 28) | 0),
        (p = (O + 24) | 0),
        (k = ((b = O) + 20) | 0),
        (F = (O + 16) | 0),
        (w = (O + 12) | 0),
        (y = (O + 8) | 0),
        (St[(l = (O + 56) | 0) >> 2] = e),
        (St[c >> 2] = r),
        (St[d >> 2] = t),
        (St[E >> 2] = n),
        (St[_ >> 2] = i),
        (St[S >> 2] = o),
        (St[m >> 2] = a),
        (St[h >> 2] = u),
        (St[p >> 2] = s)
      e: for (;;) {
        if (((s = 0 | ue(0 | St[l >> 2], b)), (St[k >> 2] = s), 0 | St[k >> 2])) {
          v = 3
          break
        }
        if (
          (0 | (s = 0 | St[b >> 2])) != (0 | St[(u = b) >> 2]) ||
          (((((0 | s) < 0) << 31) >> 31) | 0) != (0 | St[(u + 4) >> 2])
        ) {
          v = 5
          break
        }
        switch (0 | St[b >> 2]) {
          case 0:
            v = 7
            break e
          case 6:
            if (
              ((u =
                0 |
                (function (e, r, t, n, i, o, a) {
                  ;(e |= 0), (r |= 0), (t |= 0), (n |= 0), (i |= 0), (o |= 0), (a |= 0)
                  var u = 0,
                    s = 0,
                    f = 0,
                    l = 0,
                    c = 0,
                    d = 0,
                    E = 0,
                    _ = 0,
                    S = 0,
                    m = 0,
                    h = 0,
                    p = 0,
                    b = 0,
                    k = 0,
                    F = 0,
                    w = 0,
                    y = 0,
                    v = 0,
                    M = 0,
                    O = 0
                  ;(0 | (pt = ((u = pt) + 80) | 0)) >= (0 | bt) && yt(80)
                  if (
                    ((s = (u + 68) | 0),
                    (l = (u + 60) | 0),
                    (c = (u + 56) | 0),
                    (d = (u + 52) | 0),
                    (E = (u + 48) | 0),
                    (_ = (u + 44) | 0),
                    (S = (u + 40) | 0),
                    (m = (u + 36) | 0),
                    (h = (u + 32) | 0),
                    (p = (u + 28) | 0),
                    (b = (u + 24) | 0),
                    (k = (u + 20) | 0),
                    (w = ((F = u) + 16) | 0),
                    (y = (u + 12) | 0),
                    (v = (u + 8) | 0),
                    (St[(f = (u + 64) | 0) >> 2] = e),
                    (St[l >> 2] = r),
                    (St[c >> 2] = t),
                    (St[d >> 2] = n),
                    (St[E >> 2] = i),
                    (St[_ >> 2] = o),
                    (St[S >> 2] = a),
                    (a = 0 | le(0 | St[f >> 2], 0 | St[l >> 2])),
                    (St[h >> 2] = a),
                    0 | St[h >> 2])
                  )
                    return (St[s >> 2] = St[h >> 2]), (M = 0 | St[s >> 2]), (pt = u), 0 | M
                  if (((h = 0 | fe(0 | St[f >> 2], 0 | St[c >> 2])), (St[p >> 2] = h), 0 | St[p >> 2]))
                    return (St[s >> 2] = St[p >> 2]), (M = 0 | St[s >> 2]), (pt = u), 0 | M
                  if (((p = 0 | I(0 | St[f >> 2], 9, 0)), (St[b >> 2] = p), 0 | St[b >> 2]))
                    return (St[s >> 2] = St[b >> 2]), (M = 0 | St[s >> 2]), (pt = u), 0 | M
                  if (0 | St[St[c >> 2] >> 2]) {
                    if (
                      ((b = 0 | sr[3 & St[St[S >> 2] >> 2]](0 | St[S >> 2], St[St[c >> 2] >> 2] << 3)),
                      !(St[St[d >> 2] >> 2] = b))
                    )
                      return (St[s >> 2] = 2), (M = 0 | St[s >> 2]), (pt = u), 0 | M
                  } else St[St[d >> 2] >> 2] = 0
                  St[m >> 2] = 0
                  for (; !((0 | St[m >> 2]) >>> 0 >= (0 | St[St[c >> 2] >> 2]) >>> 0); ) {
                    if (
                      ((b = 0 | le(0 | St[f >> 2], ((0 | St[St[d >> 2] >> 2]) + (St[m >> 2] << 3)) | 0)),
                      (St[k >> 2] = b),
                      0 | St[k >> 2])
                    ) {
                      O = 14
                      break
                    }
                    St[m >> 2] = 1 + (0 | St[m >> 2])
                  }
                  if (14 == (0 | O)) return (St[s >> 2] = St[k >> 2]), (M = 0 | St[s >> 2]), (pt = u), 0 | M
                  for (;;) {
                    if (((k = 0 | ue(0 | St[f >> 2], F)), (St[w >> 2] = k), 0 | St[w >> 2])) {
                      O = 17
                      break
                    }
                    if ((0 == (0 | St[(k = F) >> 2])) & (0 == (0 | St[(k + 4) >> 2]))) {
                      O = 24
                      break
                    }
                    if (((k = F), (d = 0 | St[f >> 2]), (10 == (0 | St[k >> 2])) & (0 == (0 | St[(k + 4) >> 2])))) {
                      if (
                        ((k = 0 | ne(d, 0 | St[St[c >> 2] >> 2], 0 | St[E >> 2], 0 | St[_ >> 2], 0 | St[S >> 2])),
                        (St[y >> 2] = k),
                        0 | St[y >> 2])
                      ) {
                        O = 21
                        break
                      }
                    } else if (((k = 0 | me(d)), (St[v >> 2] = k), 0 | St[v >> 2])) {
                      O = 23
                      break
                    }
                  }
                  {
                    if (17 == (0 | O)) return (St[s >> 2] = St[w >> 2]), (M = 0 | St[s >> 2]), (pt = u), 0 | M
                    if (21 == (0 | O)) return (St[s >> 2] = St[y >> 2]), (M = 0 | St[s >> 2]), (pt = u), 0 | M
                    if (23 == (0 | O)) return (St[s >> 2] = St[v >> 2]), (M = 0 | St[s >> 2]), (pt = u), 0 | M
                    if (24 == (0 | O)) {
                      r: do {
                        if (!(0 | St[St[E >> 2] >> 2])) {
                          if (0 | St[St[c >> 2] >> 2]) {
                            if (
                              ((O = 0 | sr[3 & St[St[S >> 2] >> 2]](0 | St[S >> 2], 0 | St[St[c >> 2] >> 2])),
                              !(St[St[E >> 2] >> 2] = O))
                            )
                              return (St[s >> 2] = 2), (M = 0 | St[s >> 2]), (pt = u), 0 | M
                          } else St[St[E >> 2] >> 2] = 0
                          if (0 | St[St[c >> 2] >> 2]) {
                            if (
                              ((O = 0 | sr[3 & St[St[S >> 2] >> 2]](0 | St[S >> 2], St[St[c >> 2] >> 2] << 2)),
                              !(St[St[_ >> 2] >> 2] = O))
                            )
                              return (St[s >> 2] = 2), (M = 0 | St[s >> 2]), (pt = u), 0 | M
                          } else St[St[_ >> 2] >> 2] = 0
                          for (St[m >> 2] = 0; ; ) {
                            if ((0 | St[m >> 2]) >>> 0 >= (0 | St[St[c >> 2] >> 2]) >>> 0) break r
                            ;(Et[((0 | St[St[E >> 2] >> 2]) + (0 | St[m >> 2])) >> 0] = 0),
                              (St[((0 | St[St[_ >> 2] >> 2]) + (St[m >> 2] << 2)) >> 2] = 0),
                              (St[m >> 2] = 1 + (0 | St[m >> 2]))
                          }
                        }
                      } while (0)
                      return (St[s >> 2] = 0), (M = 0 | St[s >> 2]), (pt = u), 0 | M
                    }
                  }
                  return 0
                })(
                  0 | St[l >> 2],
                  0 | St[c >> 2],
                  (20 + (0 | St[d >> 2])) | 0,
                  0 | St[d >> 2],
                  (4 + (0 | St[d >> 2])) | 0,
                  (8 + (0 | St[d >> 2])) | 0,
                  0 | St[h >> 2]
                )),
              (St[F >> 2] = u),
              0 | St[F >> 2])
            ) {
              v = 9
              break e
            }
            continue e
          case 7:
            if (
              ((u =
                0 |
                (function (e, r, t, n, i) {
                  ;(e |= 0), (r |= 0), (t |= 0), (n |= 0), (i |= 0)
                  var o = 0,
                    a = 0,
                    u = 0,
                    s = 0,
                    f = 0,
                    l = 0,
                    c = 0,
                    d = 0,
                    E = 0,
                    _ = 0,
                    S = 0,
                    m = 0,
                    h = 0,
                    p = 0,
                    b = 0,
                    k = 0,
                    F = 0,
                    w = 0,
                    y = 0,
                    v = 0,
                    M = 0,
                    O = 0,
                    A = 0,
                    R = 0,
                    g = 0,
                    T = 0,
                    N = 0,
                    D = 0
                  ;(0 | (pt = ((o = pt) + 112) | 0)) >= (0 | bt) && yt(112)
                  if (
                    ((a = (o + 96) | 0),
                    (s = (o + 88) | 0),
                    (f = (o + 84) | 0),
                    (l = (o + 80) | 0),
                    (c = (o + 76) | 0),
                    (d = (o + 72) | 0),
                    (E = (o + 68) | 0),
                    (_ = (o + 64) | 0),
                    (S = (o + 60) | 0),
                    (m = (o + 56) | 0),
                    (h = (o + 52) | 0),
                    (p = (o + 48) | 0),
                    (b = (o + 44) | 0),
                    (k = (o + 40) | 0),
                    (F = (o + 36) | 0),
                    (y = ((w = o) + 32) | 0),
                    (v = (o + 28) | 0),
                    (M = (o + 24) | 0),
                    (O = (o + 20) | 0),
                    (A = (o + 16) | 0),
                    (R = (o + 12) | 0),
                    (g = (o + 8) | 0),
                    (St[(u = (o + 92) | 0) >> 2] = e),
                    (St[s >> 2] = r),
                    (St[f >> 2] = t),
                    (St[l >> 2] = n),
                    (St[c >> 2] = i),
                    (i = 0 | I(0 | St[u >> 2], 11, 0)),
                    (St[E >> 2] = i),
                    0 | St[E >> 2])
                  )
                    return (St[a >> 2] = St[E >> 2]), (T = 0 | St[a >> 2]), (pt = o), 0 | T
                  if (((E = 0 | fe(0 | St[u >> 2], 0 | St[s >> 2])), (St[_ >> 2] = E), 0 | St[_ >> 2]))
                    return (St[a >> 2] = St[_ >> 2]), (T = 0 | St[a >> 2]), (pt = o), 0 | T
                  if (((_ = 0 | de(0 | St[u >> 2])), (St[S >> 2] = _), 0 | St[S >> 2]))
                    return (St[a >> 2] = St[S >> 2]), (T = 0 | St[a >> 2]), (pt = o), 0 | T
                  if (0 | St[St[s >> 2] >> 2]) {
                    if (
                      ((S = 0 | sr[3 & St[St[l >> 2] >> 2]](0 | St[l >> 2], (40 * (0 | St[St[s >> 2] >> 2])) | 0)),
                      !(St[St[f >> 2] >> 2] = S))
                    )
                      return (St[a >> 2] = 2), (T = 0 | St[a >> 2]), (pt = o), 0 | T
                  } else St[St[f >> 2] >> 2] = 0
                  St[d >> 2] = 0
                  for (; !((0 | St[d >> 2]) >>> 0 >= (0 | St[St[s >> 2] >> 2]) >>> 0); )
                    P(((0 | St[St[f >> 2] >> 2]) + ((40 * (0 | St[d >> 2])) | 0)) | 0),
                      (St[d >> 2] = 1 + (0 | St[d >> 2]))
                  St[d >> 2] = 0
                  for (; (N = 0 | St[u >> 2]), !((0 | St[d >> 2]) >>> 0 >= (0 | St[St[s >> 2] >> 2]) >>> 0); ) {
                    if (
                      ((S =
                        0 |
                        (function (e, r, t) {
                          ;(e |= 0), (r |= 0), (t |= 0)
                          var n = 0,
                            i = 0,
                            o = 0,
                            a = 0,
                            u = 0,
                            s = 0,
                            f = 0,
                            l = 0,
                            c = 0,
                            d = 0,
                            E = 0,
                            _ = 0,
                            S = 0,
                            m = 0,
                            h = 0,
                            p = 0,
                            b = 0,
                            k = 0,
                            F = 0,
                            w = 0,
                            y = 0,
                            v = 0,
                            M = 0,
                            O = 0,
                            A = 0,
                            R = 0,
                            g = 0,
                            T = 0,
                            N = 0,
                            D = 0,
                            P = 0,
                            C = 0,
                            I = 0,
                            L = 0,
                            x = 0,
                            B = 0,
                            H = 0,
                            U = 0,
                            z = 0
                          ;(0 | (pt = ((n = pt) + 160) | 0)) >= (0 | bt) && yt(160)
                          if (
                            ((i = (n + 136) | 0),
                            (a = (n + 128) | 0),
                            (u = (n + 124) | 0),
                            (s = (n + 120) | 0),
                            (f = (n + 116) | 0),
                            (l = (n + 112) | 0),
                            (c = (n + 108) | 0),
                            (d = (n + 104) | 0),
                            (E = (n + 100) | 0),
                            (_ = (n + 96) | 0),
                            (S = (n + 155) | 0),
                            (m = (n + 92) | 0),
                            (h = (n + 88) | 0),
                            (p = (n + 84) | 0),
                            (b = (n + 140) | 0),
                            (k = (n + 80) | 0),
                            (F = (n + 76) | 0),
                            (w = (n + 72) | 0),
                            (y = (n + 68) | 0),
                            (v = (n + 8) | 0),
                            (M = (n + 64) | 0),
                            (O = (n + 60) | 0),
                            (A = (n + 56) | 0),
                            (R = (n + 52) | 0),
                            (g = (n + 48) | 0),
                            (T = (n + 44) | 0),
                            (N = (n + 40) | 0),
                            (P = ((D = n) + 36) | 0),
                            (C = (n + 32) | 0),
                            (I = (n + 28) | 0),
                            (L = (n + 24) | 0),
                            (x = (n + 20) | 0),
                            (B = (n + 16) | 0),
                            (St[(o = (n + 132) | 0) >> 2] = e),
                            (St[a >> 2] = r),
                            (St[u >> 2] = t),
                            (St[d >> 2] = 0),
                            (St[E >> 2] = 0),
                            (t = 0 | fe(0 | St[o >> 2], s)),
                            (St[_ >> 2] = t),
                            0 | St[_ >> 2])
                          )
                            return (St[i >> 2] = St[_ >> 2]), (H = 0 | St[i >> 2]), (pt = n), 0 | H
                          if (32 < (0 | St[s >> 2]) >>> 0)
                            return (St[i >> 2] = 4), (H = 0 | St[i >> 2]), (pt = n), 0 | H
                          if (((St[(16 + (0 | St[a >> 2])) >> 2] = St[s >> 2]), 0 | St[s >> 2])) {
                            if (
                              ((_ = 0 | sr[3 & St[St[u >> 2] >> 2]](0 | St[u >> 2], (24 * (0 | St[s >> 2])) | 0)),
                              !(St[St[a >> 2] >> 2] = _))
                            )
                              return (St[i >> 2] = 2), (H = 0 | St[i >> 2]), (pt = n), 0 | H
                          } else St[St[a >> 2] >> 2] = 0
                          St[c >> 2] = 0
                          for (; !((0 | St[c >> 2]) >>> 0 >= (0 | St[s >> 2]) >>> 0); )
                            X(((0 | St[St[a >> 2] >> 2]) + ((24 * (0 | St[c >> 2])) | 0)) | 0),
                              (St[c >> 2] = 1 + (0 | St[c >> 2]))
                          St[c >> 2] = 0
                          r: for (;;) {
                            if ((0 | St[c >> 2]) >>> 0 >= (0 | St[s >> 2]) >>> 0) {
                              U = 55
                              break
                            }
                            if (
                              ((St[m >> 2] = (0 | St[St[a >> 2] >> 2]) + ((24 * (0 | St[c >> 2])) | 0)),
                              (_ = 0 | te(0 | St[o >> 2], S)),
                              (St[k >> 2] = _),
                              0 | St[k >> 2])
                            ) {
                              U = 15
                              break
                            }
                            if (
                              ((St[h >> 2] = 15 & (0 | mt[S >> 0])),
                              (_ = 0 | ie(0 | St[o >> 2], b, 0 | St[h >> 2])),
                              (St[F >> 2] = _),
                              0 | St[F >> 2])
                            ) {
                              U = 17
                              break
                            }
                            if (8 < (0 | St[h >> 2]) >>> 0) {
                              U = 19
                              break
                            }
                            for (
                              _ = (8 + (0 | St[m >> 2])) | 0, St[_ >> 2] = 0, St[(_ + 4) >> 2] = 0, St[p >> 2] = 0;
                              !((0 | St[p >> 2]) >>> 0 >= (0 | St[h >> 2]) >>> 0);

                            )
                              (_ =
                                0 |
                                It(
                                  0 | mt[(b + ((0 | St[h >> 2]) - 1 - (0 | St[p >> 2]))) >> 0],
                                  0,
                                  (St[p >> 2] << 3) | 0
                                )),
                                (t = (8 + (0 | St[m >> 2])) | 0),
                                (e = St[((r = t) + 4) >> 2] | Ft),
                                (St[(z = t) >> 2] = St[r >> 2] | _),
                                (St[(z + 4) >> 2] = e),
                                (St[p >> 2] = 1 + (0 | St[p >> 2]))
                            if ((16 & (0 | mt[S >> 0])) | 0) {
                              if (((e = 0 | fe(0 | St[o >> 2], 0 | St[m >> 2])), (St[w >> 2] = e), 0 | St[w >> 2])) {
                                U = 25
                                break
                              }
                              if (
                                ((e = 0 | fe(0 | St[o >> 2], (4 + (0 | St[m >> 2])) | 0)),
                                (St[y >> 2] = e),
                                0 | St[y >> 2])
                              ) {
                                U = 27
                                break
                              }
                              if (32 < (0 | St[St[m >> 2] >> 2]) >>> 0) {
                                U = 30
                                break
                              }
                              if (32 < (0 | St[(4 + (0 | St[m >> 2])) >> 2]) >>> 0) {
                                U = 30
                                break
                              }
                            } else (St[St[m >> 2] >> 2] = 1), (St[(4 + (0 | St[m >> 2])) >> 2] = 1)
                            if ((32 & (0 | mt[S >> 0])) | 0) {
                              if (
                                ((St[(e = v) >> 2] = 0),
                                (St[(e + 4) >> 2] = 0),
                                (e = 0 | le(0 | St[o >> 2], v)),
                                (St[M >> 2] = e),
                                0 | St[M >> 2])
                              ) {
                                U = 34
                                break
                              }
                              if (!(0 | Ie((16 + (0 | St[m >> 2])) | 0, 0 | St[v >> 2], 0 | St[u >> 2]))) {
                                U = 36
                                break
                              }
                              if (
                                ((e = 0 | ie(0 | St[o >> 2], 0 | St[(16 + (0 | St[m >> 2])) >> 2], 0 | St[v >> 2])),
                                (St[O >> 2] = e),
                                0 | St[O >> 2])
                              ) {
                                U = 38
                                break
                              }
                            }
                            for (; 128 & (0 | mt[S >> 0]); ) {
                              if (((e = 0 | te(0 | St[o >> 2], S)), (St[A >> 2] = e), 0 | St[A >> 2])) {
                                U = 41
                                break r
                              }
                              if (
                                ((e = 15 & (0 | mt[S >> 0])),
                                (z = 0 | ce(0 | St[o >> 2], e, (((0 | e) < 0) << 31) >> 31)),
                                (St[R >> 2] = z),
                                0 | St[R >> 2])
                              ) {
                                U = 43
                                break r
                              }
                              if ((16 & (0 | mt[S >> 0])) | 0) {
                                if (((z = 0 | fe(0 | St[o >> 2], g)), (St[T >> 2] = z), 0 | St[T >> 2])) {
                                  U = 46
                                  break r
                                }
                                if (((z = 0 | fe(0 | St[o >> 2], g)), (St[N >> 2] = z), 0 | St[N >> 2])) {
                                  U = 48
                                  break r
                                }
                              }
                              if (32 & (0 | mt[S >> 0])) {
                                if (
                                  ((St[(z = D) >> 2] = 0),
                                  (St[(z + 4) >> 2] = 0),
                                  (z = 0 | le(0 | St[o >> 2], D)),
                                  (St[P >> 2] = z),
                                  0 | St[P >> 2])
                                ) {
                                  U = 51
                                  break r
                                }
                                if (
                                  ((z = D),
                                  (e = 0 | ce(0 | St[o >> 2], 0 | St[z >> 2], 0 | St[(z + 4) >> 2])),
                                  (St[C >> 2] = e),
                                  0 | St[C >> 2])
                                ) {
                                  U = 53
                                  break r
                                }
                              }
                            }
                            ;(St[d >> 2] = (0 | St[d >> 2]) + (0 | St[St[m >> 2] >> 2])),
                              (St[E >> 2] = (0 | St[E >> 2]) + (0 | St[(4 + (0 | St[m >> 2])) >> 2])),
                              (St[c >> 2] = 1 + (0 | St[c >> 2]))
                          }
                          switch (0 | U) {
                            case 15:
                              return (St[i >> 2] = St[k >> 2]), (H = 0 | St[i >> 2]), (pt = n), 0 | H
                            case 17:
                              return (St[i >> 2] = St[F >> 2]), (H = 0 | St[i >> 2]), (pt = n), 0 | H
                            case 19:
                              return (St[i >> 2] = 4), (H = 0 | St[i >> 2]), (pt = n), 0 | H
                            case 25:
                              return (St[i >> 2] = St[w >> 2]), (H = 0 | St[i >> 2]), (pt = n), 0 | H
                            case 27:
                              return (St[i >> 2] = St[y >> 2]), (H = 0 | St[i >> 2]), (pt = n), 0 | H
                            case 30:
                              return (St[i >> 2] = 4), (H = 0 | St[i >> 2]), (pt = n), 0 | H
                            case 34:
                              return (St[i >> 2] = St[M >> 2]), (H = 0 | St[i >> 2]), (pt = n), 0 | H
                            case 36:
                              return (St[i >> 2] = 2), (H = 0 | St[i >> 2]), (pt = n), 0 | H
                            case 38:
                              return (St[i >> 2] = St[O >> 2]), (H = 0 | St[i >> 2]), (pt = n), 0 | H
                            case 41:
                              return (St[i >> 2] = St[A >> 2]), (H = 0 | St[i >> 2]), (pt = n), 0 | H
                            case 43:
                              return (St[i >> 2] = St[R >> 2]), (H = 0 | St[i >> 2]), (pt = n), 0 | H
                            case 46:
                              return (St[i >> 2] = St[T >> 2]), (H = 0 | St[i >> 2]), (pt = n), 0 | H
                            case 48:
                              return (St[i >> 2] = St[N >> 2]), (H = 0 | St[i >> 2]), (pt = n), 0 | H
                            case 51:
                              return (St[i >> 2] = St[P >> 2]), (H = 0 | St[i >> 2]), (pt = n), 0 | H
                            case 53:
                              return (St[i >> 2] = St[C >> 2]), (H = 0 | St[i >> 2]), (pt = n), 0 | H
                            case 55:
                              if (!(0 | St[E >> 2])) return (St[i >> 2] = 4), (H = 0 | St[i >> 2]), (pt = n), 0 | H
                              if (
                                ((C = ((0 | St[E >> 2]) - 1) | 0),
                                (St[f >> 2] = C),
                                (St[(20 + (0 | St[a >> 2])) >> 2] = C),
                                0 | St[f >> 2])
                              ) {
                                if (
                                  ((C = 0 | sr[3 & St[St[u >> 2] >> 2]](0 | St[u >> 2], St[f >> 2] << 3)),
                                  !(St[(4 + (0 | St[a >> 2])) >> 2] = C))
                                )
                                  return (St[i >> 2] = 2), (H = 0 | St[i >> 2]), (pt = n), 0 | H
                              } else St[(4 + (0 | St[a >> 2])) >> 2] = 0
                              for (St[c >> 2] = 0; ; ) {
                                if ((0 | St[c >> 2]) >>> 0 >= (0 | St[f >> 2]) >>> 0) {
                                  U = 68
                                  break
                                }
                                if (
                                  ((St[I >> 2] = (0 | St[(4 + (0 | St[a >> 2])) >> 2]) + (St[c >> 2] << 3)),
                                  (C = 0 | fe(0 | St[o >> 2], 0 | St[I >> 2])),
                                  (St[L >> 2] = C),
                                  0 | St[L >> 2])
                                ) {
                                  U = 64
                                  break
                                }
                                if (
                                  ((C = 0 | fe(0 | St[o >> 2], (4 + (0 | St[I >> 2])) | 0)),
                                  (St[x >> 2] = C),
                                  0 | St[x >> 2])
                                ) {
                                  U = 66
                                  break
                                }
                                St[c >> 2] = 1 + (0 | St[c >> 2])
                              }
                              if (64 == (0 | U)) return (St[i >> 2] = St[L >> 2]), (H = 0 | St[i >> 2]), (pt = n), 0 | H
                              if (66 == (0 | U)) return (St[i >> 2] = St[x >> 2]), (H = 0 | St[i >> 2]), (pt = n), 0 | H
                              if (68 != (0 | U)) break
                              if ((0 | St[d >> 2]) >>> 0 < (0 | St[f >> 2]) >>> 0)
                                return (St[i >> 2] = 4), (H = 0 | St[i >> 2]), (pt = n), 0 | H
                              if (
                                ((U = ((0 | St[d >> 2]) - (0 | St[f >> 2])) | 0),
                                (St[l >> 2] = U),
                                (St[(24 + (0 | St[a >> 2])) >> 2] = U),
                                0 | St[l >> 2])
                              ) {
                                if (
                                  ((U = 0 | sr[3 & St[St[u >> 2] >> 2]](0 | St[u >> 2], St[l >> 2] << 2)),
                                  !(St[(8 + (0 | St[a >> 2])) >> 2] = U))
                                )
                                  return (St[i >> 2] = 2), (H = 0 | St[i >> 2]), (pt = n), 0 | H
                              } else St[(8 + (0 | St[a >> 2])) >> 2] = 0
                              ;(U = 1 == (0 | St[l >> 2])), (St[c >> 2] = 0)
                              r: do {
                                if (U) {
                                  for (
                                    ;
                                    !(
                                      (0 | St[c >> 2]) >>> 0 >= (0 | St[d >> 2]) >>> 0 ||
                                      (0 |
                                        (function (e, r) {
                                          ;(e |= 0), (r |= 0)
                                          var t,
                                            n,
                                            i,
                                            o,
                                            a = 0,
                                            u = 0,
                                            s = 0,
                                            f = pt
                                          for (
                                            (0 | bt) <= (0 | (pt = (pt + 16) | 0)) && yt(16),
                                              t = (f + 12) | 0,
                                              i = (f + 4) | 0,
                                              St[(n = ((o = f) + 8) | 0) >> 2] = e,
                                              St[i >> 2] = r,
                                              St[o >> 2] = 0;
                                            ;

                                          ) {
                                            if (
                                              (0 | St[o >> 2]) >>> 0 >=
                                              (0 | St[(20 + (0 | St[n >> 2])) >> 2]) >>> 0
                                            ) {
                                              a = 6
                                              break
                                            }
                                            if (
                                              ((u = 0 | St[o >> 2]),
                                              (0 |
                                                St[((0 | St[(4 + (0 | St[n >> 2])) >> 2]) + (St[o >> 2] << 3)) >> 2]) ==
                                                (0 | St[i >> 2]))
                                            ) {
                                              a = 4
                                              break
                                            }
                                            St[o >> 2] = u + 1
                                          }
                                          return 4 == (0 | a)
                                            ? ((St[t >> 2] = u), (s = 0 | St[t >> 2]), (pt = f), 0 | s)
                                            : 6 == (0 | a)
                                              ? ((St[t >> 2] = -1), (s = 0 | St[t >> 2]), (pt = f), 0 | s)
                                              : 0
                                        })(0 | St[a >> 2], 0 | St[c >> 2])) <
                                        0
                                    );

                                  )
                                    St[c >> 2] = 1 + (0 | St[c >> 2])
                                  if ((0 | St[c >> 2]) == (0 | St[d >> 2]))
                                    return (St[i >> 2] = 4), (H = 0 | St[i >> 2]), (pt = n), 0 | H
                                  St[St[(8 + (0 | St[a >> 2])) >> 2] >> 2] = St[c >> 2]
                                  break
                                }
                                for (;;) {
                                  if ((0 | St[c >> 2]) >>> 0 >= (0 | St[l >> 2]) >>> 0) break r
                                  if (
                                    ((u =
                                      0 |
                                      fe(
                                        0 | St[o >> 2],
                                        ((0 | St[(8 + (0 | St[a >> 2])) >> 2]) + (St[c >> 2] << 2)) | 0
                                      )),
                                    (St[B >> 2] = u),
                                    0 | St[B >> 2])
                                  )
                                    break
                                  St[c >> 2] = 1 + (0 | St[c >> 2])
                                }
                                return (St[i >> 2] = St[B >> 2]), (H = 0 | St[i >> 2]), (pt = n), 0 | H
                              } while (0)
                              return (St[i >> 2] = 0), (H = 0 | St[i >> 2]), (pt = n), 0 | H
                          }
                          return 0
                        })(N, ((0 | St[St[f >> 2] >> 2]) + ((40 * (0 | St[d >> 2])) | 0)) | 0, 0 | St[l >> 2])),
                      (St[m >> 2] = S),
                      0 | St[m >> 2])
                    ) {
                      D = 17
                      break
                    }
                    St[d >> 2] = 1 + (0 | St[d >> 2])
                  }
                  if (17 == (0 | D)) return (St[a >> 2] = St[m >> 2]), (T = 0 | St[a >> 2]), (pt = o), 0 | T
                  if (((m = 0 | I(N, 12, 0)), (St[h >> 2] = m), 0 | St[h >> 2]))
                    return (St[a >> 2] = St[h >> 2]), (T = 0 | St[a >> 2]), (pt = o), 0 | T
                  St[d >> 2] = 0
                  r: for (;;) {
                    if ((0 | St[d >> 2]) >>> 0 >= (0 | St[St[s >> 2] >> 2]) >>> 0) {
                      D = 33
                      break
                    }
                    if (
                      ((St[b >> 2] = (0 | St[St[f >> 2] >> 2]) + ((40 * (0 | St[d >> 2])) | 0)),
                      (h = 0 | C(0 | St[b >> 2])),
                      (St[k >> 2] = h),
                      0 | St[k >> 2])
                    ) {
                      if (
                        ((h = 0 | sr[3 & St[St[l >> 2] >> 2]](0 | St[l >> 2], St[k >> 2] << 3)),
                        !(St[(12 + (0 | St[b >> 2])) >> 2] = h))
                      ) {
                        D = 26
                        break
                      }
                    } else St[(12 + (0 | St[b >> 2])) >> 2] = 0
                    for (St[p >> 2] = 0; !((0 | St[p >> 2]) >>> 0 >= (0 | St[k >> 2]) >>> 0); ) {
                      if (
                        ((h = 0 | le(0 | St[u >> 2], ((0 | St[(12 + (0 | St[b >> 2])) >> 2]) + (St[p >> 2] << 3)) | 0)),
                        (St[F >> 2] = h),
                        0 | St[F >> 2])
                      ) {
                        D = 30
                        break r
                      }
                      St[p >> 2] = 1 + (0 | St[p >> 2])
                    }
                    St[d >> 2] = 1 + (0 | St[d >> 2])
                  }
                  {
                    if (26 == (0 | D)) return (St[a >> 2] = 2), (T = 0 | St[a >> 2]), (pt = o), 0 | T
                    if (30 == (0 | D)) return (St[a >> 2] = St[F >> 2]), (T = 0 | St[a >> 2]), (pt = o), 0 | T
                    if (33 == (0 | D)) {
                      for (;;) {
                        if (((F = (D = 0) | ue(0 | St[u >> 2], w)), (St[y >> 2] = F), 0 | St[y >> 2])) {
                          D = 34
                          break
                        }
                        if ((0 == (0 | St[(F = w) >> 2])) & (0 == (0 | St[(F + 4) >> 2]))) {
                          D = 36
                          break
                        }
                        if ((10 == (0 | St[(F = w) >> 2])) & (0 == (0 | St[(F + 4) >> 2]))) {
                          ;(St[M >> 2] = 0),
                            (St[O >> 2] = 0),
                            (F = 0 | ne(0 | St[u >> 2], 0 | St[St[s >> 2] >> 2], M, O, 0 | St[c >> 2])),
                            (St[v >> 2] = F)
                          r: do {
                            if (!(0 | St[v >> 2]))
                              for (St[d >> 2] = 0; ; ) {
                                if ((0 | St[d >> 2]) >>> 0 >= (0 | St[St[s >> 2] >> 2]) >>> 0) break r
                                ;(St[A >> 2] = (0 | St[St[f >> 2] >> 2]) + ((40 * (0 | St[d >> 2])) | 0)),
                                  (St[(28 + (0 | St[A >> 2])) >> 2] = mt[((0 | St[M >> 2]) + (0 | St[d >> 2])) >> 0]),
                                  (St[(32 + (0 | St[A >> 2])) >> 2] = St[((0 | St[O >> 2]) + (St[d >> 2] << 2)) >> 2]),
                                  (St[d >> 2] = 1 + (0 | St[d >> 2]))
                              }
                          } while (0)
                          if (
                            (or[3 & St[(4 + (0 | St[c >> 2])) >> 2]](0 | St[c >> 2], 0 | St[O >> 2]),
                            or[3 & St[(4 + (0 | St[c >> 2])) >> 2]](0 | St[c >> 2], 0 | St[M >> 2]),
                            (St[R >> 2] = St[v >> 2]),
                            0 | St[R >> 2])
                          ) {
                            D = 43
                            break
                          }
                          D = 33
                        } else {
                          if (((F = 0 | me(0 | St[u >> 2])), (St[g >> 2] = F), 0 | St[g >> 2])) {
                            D = 45
                            break
                          }
                          D = 33
                        }
                      }
                      if (34 == (0 | D)) return (St[a >> 2] = St[y >> 2]), (T = 0 | St[a >> 2]), (pt = o), 0 | T
                      if (36 == (0 | D)) return (St[a >> 2] = 0), (T = 0 | St[a >> 2]), (pt = o), 0 | T
                      if (43 == (0 | D)) return (St[a >> 2] = St[R >> 2]), (T = 0 | St[a >> 2]), (pt = o), 0 | T
                      if (45 == (0 | D)) return (St[a >> 2] = St[g >> 2]), (T = 0 | St[a >> 2]), (pt = o), 0 | T
                    }
                  }
                  return 0
                })(
                  0 | St[l >> 2],
                  (24 + (0 | St[d >> 2])) | 0,
                  (12 + (0 | St[d >> 2])) | 0,
                  0 | St[h >> 2],
                  0 | St[p >> 2]
                )),
              (St[w >> 2] = u),
              0 | St[w >> 2])
            ) {
              v = 11
              break e
            }
            continue e
          case 8:
            if (
              ((u =
                0 |
                (function (e, r, t, n, i, o, a, u) {
                  ;(e |= 0), (r |= 0), (t |= 0), (n |= 0), (i |= 0), (o |= 0), (a |= 0), (u |= 0)
                  var s = 0,
                    f = 0,
                    l = 0,
                    c = 0,
                    d = 0,
                    E = 0,
                    _ = 0,
                    S = 0,
                    m = 0,
                    h = 0,
                    p = 0,
                    b = 0,
                    k = 0,
                    F = 0,
                    w = 0,
                    y = 0,
                    v = 0,
                    M = 0,
                    O = 0,
                    A = 0,
                    R = 0,
                    g = 0,
                    T = 0,
                    N = 0,
                    D = 0,
                    P = 0,
                    C = 0,
                    I = 0,
                    L = 0,
                    x = 0,
                    B = 0,
                    H = 0,
                    U = 0,
                    z = 0,
                    Y = 0,
                    V = 0,
                    K = 0
                  ;(0 | (pt = ((s = pt) + 160) | 0)) >= (0 | bt) && yt(160)
                  ;(f = (s + 144) | 0),
                    (c = (s + 136) | 0),
                    (d = (s + 132) | 0),
                    (E = (s + 128) | 0),
                    (_ = (s + 124) | 0),
                    (S = (s + 120) | 0),
                    (m = (s + 116) | 0),
                    (h = (s + 112) | 0),
                    (p = (s + 16) | 0),
                    (b = (s + 108) | 0),
                    (k = (s + 104) | 0),
                    (F = (s + 100) | 0),
                    (w = (s + 96) | 0),
                    (y = (s + 92) | 0),
                    (v = (s + 88) | 0),
                    (M = (s + 84) | 0),
                    (O = (s + 8) | 0),
                    (A = (s + 80) | 0),
                    (R = (s + 76) | 0),
                    (T = ((g = s) + 72) | 0),
                    (N = (s + 68) | 0),
                    (D = (s + 64) | 0),
                    (P = (s + 60) | 0),
                    (C = (s + 56) | 0),
                    (I = (s + 52) | 0),
                    (L = (s + 48) | 0),
                    (x = (s + 44) | 0),
                    (B = (s + 40) | 0),
                    (H = (s + 36) | 0),
                    (U = (s + 32) | 0),
                    (z = (s + 28) | 0),
                    (Y = (s + 24) | 0),
                    (St[(l = (s + 140) | 0) >> 2] = e),
                    (St[c >> 2] = r),
                    (St[d >> 2] = t),
                    (St[E >> 2] = n),
                    (St[_ >> 2] = i),
                    (St[S >> 2] = o),
                    (St[m >> 2] = a),
                    (St[h >> 2] = u),
                    (St[(u = p) >> 2] = 0),
                    (St[(u + 4) >> 2] = 0),
                    (St[k >> 2] = 0),
                    (St[F >> 2] = 0),
                    (St[b >> 2] = 0)
                  for (; !((0 | St[b >> 2]) >>> 0 >= (0 | St[c >> 2]) >>> 0); )
                    (St[((0 | St[d >> 2]) + ((40 * (0 | St[b >> 2])) | 0) + 36) >> 2] = 1),
                      (St[b >> 2] = 1 + (0 | St[b >> 2]))
                  St[St[E >> 2] >> 2] = St[c >> 2]
                  r: for (;;) {
                    if (((u = 0 | ue(0 | St[l >> 2], p)), (St[w >> 2] = u), 0 | St[w >> 2])) {
                      V = 6
                      break
                    }
                    if ((13 == (0 | St[(u = p) >> 2])) & (0 == (0 | St[(u + 4) >> 2])))
                      for (St[St[E >> 2] >> 2] = 0, St[b >> 2] = 0; ; ) {
                        if ((0 | St[b >> 2]) >>> 0 >= (0 | St[c >> 2]) >>> 0) continue r
                        if (((o = 0 | fe(0 | St[l >> 2], y)), (St[v >> 2] = o), 0 | St[v >> 2])) {
                          V = 11
                          break r
                        }
                        ;(St[((0 | St[d >> 2]) + ((40 * (0 | St[b >> 2])) | 0) + 36) >> 2] = St[y >> 2]),
                          (o = 0 | St[E >> 2]),
                          (St[o >> 2] = (0 | St[o >> 2]) + (0 | St[y >> 2])),
                          (St[b >> 2] = 1 + (0 | St[b >> 2]))
                      }
                    else {
                      if (
                        ((o = a = u = p),
                        ((10 == (0 | St[u >> 2])) & (0 == (0 | St[(u + 4) >> 2]))) |
                          ((9 == (0 | St[a >> 2])) & (0 == (0 | St[(a + 4) >> 2]))) |
                          ((0 == (0 | St[o >> 2])) & (0 == (0 | St[(o + 4) >> 2]))))
                      ) {
                        V = 16
                        break
                      }
                      if (((o = 0 | me(0 | St[l >> 2])), (St[M >> 2] = o), 0 | St[M >> 2])) {
                        V = 15
                        break
                      }
                    }
                  }
                  {
                    if (6 == (0 | V)) return (St[f >> 2] = St[w >> 2]), (K = 0 | St[f >> 2]), (pt = s), 0 | K
                    if (11 == (0 | V)) return (St[f >> 2] = St[v >> 2]), (K = 0 | St[f >> 2]), (pt = s), 0 | K
                    if (15 == (0 | V)) return (St[f >> 2] = St[M >> 2]), (K = 0 | St[f >> 2]), (pt = s), 0 | K
                    if (16 == (0 | V)) {
                      if (0 | St[St[E >> 2] >> 2]) {
                        if (
                          ((M = 0 | sr[3 & St[St[h >> 2] >> 2]](0 | St[h >> 2], St[St[E >> 2] >> 2] << 3)),
                          (St[St[_ >> 2] >> 2] = M),
                          !(0 | St[St[_ >> 2] >> 2]))
                        )
                          return (St[f >> 2] = 2), (K = 0 | St[f >> 2]), (pt = s), 0 | K
                        if (
                          ((M = 0 | sr[3 & St[St[h >> 2] >> 2]](0 | St[h >> 2], 0 | St[St[E >> 2] >> 2])),
                          (St[St[S >> 2] >> 2] = M),
                          !(0 | St[St[S >> 2] >> 2]))
                        )
                          return (St[f >> 2] = 2), (K = 0 | St[f >> 2]), (pt = s), 0 | K
                        if (
                          ((M = 0 | sr[3 & St[St[h >> 2] >> 2]](0 | St[h >> 2], St[St[E >> 2] >> 2] << 2)),
                          (St[St[m >> 2] >> 2] = M),
                          !(0 | St[St[m >> 2] >> 2]))
                        )
                          return (St[f >> 2] = 2), (K = 0 | St[f >> 2]), (pt = s), 0 | K
                      } else (St[St[_ >> 2] >> 2] = 0), (St[St[S >> 2] >> 2] = 0), (St[St[m >> 2] >> 2] = 0)
                      St[b >> 2] = 0
                      r: for (; !((0 | St[b >> 2]) >>> 0 >= (0 | St[c >> 2]) >>> 0); ) {
                        if (
                          ((St[(M = O) >> 2] = 0),
                          (St[(M + 4) >> 2] = 0),
                          (St[R >> 2] = St[((0 | St[d >> 2]) + ((40 * (0 | St[b >> 2])) | 0) + 36) >> 2]),
                          0 | St[R >> 2])
                        ) {
                          M = p
                          t: do {
                            if ((9 == (0 | St[M >> 2])) & (0 == (0 | St[(M + 4) >> 2])))
                              for (St[A >> 2] = 1; ; ) {
                                if ((0 | St[A >> 2]) >>> 0 >= (0 | St[R >> 2]) >>> 0) break t
                                if (((v = 0 | le(0 | St[l >> 2], g)), (St[T >> 2] = v), 0 | St[T >> 2])) {
                                  V = 31
                                  break r
                                }
                                ;(w = 0 | St[(v = g) >> 2]),
                                  (y = 0 | St[(v + 4) >> 2]),
                                  (v = 0 | St[k >> 2]),
                                  (St[k >> 2] = v + 1),
                                  (o = ((0 | St[St[_ >> 2] >> 2]) + (v << 3)) | 0),
                                  (St[o >> 2] = w),
                                  (St[(o + 4) >> 2] = y),
                                  (y = g),
                                  (w =
                                    0 |
                                    Dt(
                                      0 | St[(o = O) >> 2],
                                      0 | St[(o + 4) >> 2],
                                      0 | St[y >> 2],
                                      0 | St[(y + 4) >> 2]
                                    )),
                                  (St[(y = O) >> 2] = w),
                                  (St[(y + 4) >> 2] = Ft),
                                  (St[A >> 2] = 1 + (0 | St[A >> 2]))
                              }
                          } while (0)
                          ;(M = 0 | G(((0 | St[d >> 2]) + ((40 * (0 | St[b >> 2])) | 0)) | 0)),
                            (w = 0 | Nt(0 | M, 0 | Ft, 0 | St[(y = O) >> 2], 0 | St[(y + 4) >> 2])),
                            (y = 0 | St[k >> 2]),
                            (St[k >> 2] = y + 1),
                            (M = ((0 | St[St[_ >> 2] >> 2]) + (y << 3)) | 0),
                            (St[M >> 2] = w),
                            (St[(M + 4) >> 2] = Ft)
                        }
                        St[b >> 2] = 1 + (0 | St[b >> 2])
                      }
                      if (31 == (0 | V)) return (St[f >> 2] = St[T >> 2]), (K = 0 | St[f >> 2]), (pt = s), 0 | K
                      if (
                        (9 == (0 | St[(T = p) >> 2])) & (0 == (0 | St[(T + 4) >> 2])) &&
                        ((T = 0 | ue(0 | St[l >> 2], p)), (St[N >> 2] = T), 0 | St[N >> 2])
                      )
                        return (St[f >> 2] = St[N >> 2]), (K = 0 | St[f >> 2]), (pt = s), 0 | K
                      for (St[b >> 2] = 0; !((0 | St[b >> 2]) >>> 0 >= (0 | St[St[E >> 2] >> 2]) >>> 0); )
                        (Et[((0 | St[St[S >> 2] >> 2]) + (0 | St[b >> 2])) >> 0] = 0),
                          (St[((0 | St[St[m >> 2] >> 2]) + (St[b >> 2] << 2)) >> 2] = 0),
                          (St[b >> 2] = 1 + (0 | St[b >> 2]))
                      for (St[b >> 2] = 0; !((0 | St[b >> 2]) >>> 0 >= (0 | St[c >> 2]) >>> 0); )
                        (St[D >> 2] = St[((0 | St[d >> 2]) + ((40 * (0 | St[b >> 2])) | 0) + 36) >> 2]),
                          (1 == (0 | St[D >> 2]) &&
                            0 != (0 | St[((0 | St[d >> 2]) + ((40 * (0 | St[b >> 2])) | 0) + 28) >> 2])) ||
                            (St[F >> 2] = (0 | St[F >> 2]) + (0 | St[D >> 2])),
                          (St[b >> 2] = 1 + (0 | St[b >> 2]))
                      for (St[k >> 2] = 0; ; ) {
                        if ((10 == (0 | St[(D = p) >> 2])) & (0 == (0 | St[(D + 4) >> 2]))) {
                          ;(St[P >> 2] = 0),
                            (St[C >> 2] = 0),
                            (St[I >> 2] = 0),
                            (D = 0 | ne(0 | St[l >> 2], 0 | St[F >> 2], C, I, 0 | St[h >> 2])),
                            (St[L >> 2] = D)
                          r: do {
                            if (!(0 | St[L >> 2]))
                              for (St[b >> 2] = 0; ; ) {
                                if ((0 | St[b >> 2]) >>> 0 >= (0 | St[c >> 2]) >>> 0) break r
                                ;(St[x >> 2] = (0 | St[d >> 2]) + ((40 * (0 | St[b >> 2])) | 0)),
                                  (St[B >> 2] = St[(36 + (0 | St[x >> 2])) >> 2]),
                                  1 == (0 | St[B >> 2]) && 0 | St[(28 + (0 | St[x >> 2])) >> 2]
                                    ? ((Et[((0 | St[St[S >> 2] >> 2]) + (0 | St[k >> 2])) >> 0] = 1),
                                      (St[((0 | St[St[m >> 2] >> 2]) + (St[k >> 2] << 2)) >> 2] =
                                        St[(32 + (0 | St[x >> 2])) >> 2]),
                                      (St[k >> 2] = 1 + (0 | St[k >> 2])))
                                    : (V = 55)
                                t: do {
                                  if (55 == (0 | V))
                                    for (V = 0, St[H >> 2] = 0; ; ) {
                                      if ((0 | St[H >> 2]) >>> 0 >= (0 | St[B >> 2]) >>> 0) break t
                                      ;(Et[((0 | St[St[S >> 2] >> 2]) + (0 | St[k >> 2])) >> 0] =
                                        0 | Et[((0 | St[C >> 2]) + (0 | St[P >> 2])) >> 0]),
                                        (St[((0 | St[St[m >> 2] >> 2]) + (St[k >> 2] << 2)) >> 2] =
                                          St[((0 | St[I >> 2]) + (St[P >> 2] << 2)) >> 2]),
                                        (St[k >> 2] = 1 + (0 | St[k >> 2])),
                                        (St[H >> 2] = 1 + (0 | St[H >> 2])),
                                        (St[P >> 2] = 1 + (0 | St[P >> 2]))
                                    }
                                } while (0)
                                St[b >> 2] = 1 + (0 | St[b >> 2])
                              }
                          } while (0)
                          if (
                            (or[3 & St[(4 + (0 | St[h >> 2])) >> 2]](0 | St[h >> 2], 0 | St[C >> 2]),
                            or[3 & St[(4 + (0 | St[h >> 2])) >> 2]](0 | St[h >> 2], 0 | St[I >> 2]),
                            (St[U >> 2] = St[L >> 2]),
                            0 | St[U >> 2])
                          ) {
                            V = 60
                            break
                          }
                        } else {
                          if ((0 == (0 | St[(D = p) >> 2])) & (0 == (0 | St[(D + 4) >> 2]))) {
                            V = 62
                            break
                          }
                          if (((D = 0 | me(0 | St[l >> 2])), (St[z >> 2] = D), 0 | St[z >> 2])) {
                            V = 64
                            break
                          }
                        }
                        if (((D = 0 | ue(0 | St[l >> 2], p)), (St[Y >> 2] = D), 0 | St[Y >> 2])) {
                          V = 66
                          break
                        }
                      }
                      if (60 == (0 | V)) return (St[f >> 2] = St[U >> 2]), (K = 0 | St[f >> 2]), (pt = s), 0 | K
                      if (62 == (0 | V)) return (St[f >> 2] = 0), (K = 0 | St[f >> 2]), (pt = s), 0 | K
                      if (64 == (0 | V)) return (St[f >> 2] = St[z >> 2]), (K = 0 | St[f >> 2]), (pt = s), 0 | K
                      if (66 == (0 | V)) return (St[f >> 2] = St[Y >> 2]), (K = 0 | St[f >> 2]), (pt = s), 0 | K
                    }
                  }
                  return 0
                })(
                  0 | St[l >> 2],
                  0 | St[(24 + (0 | St[d >> 2])) >> 2],
                  0 | St[(12 + (0 | St[d >> 2])) >> 2],
                  0 | St[E >> 2],
                  0 | St[_ >> 2],
                  0 | St[S >> 2],
                  0 | St[m >> 2],
                  0 | St[p >> 2]
                )),
              (St[y >> 2] = u),
              0 | St[y >> 2])
            ) {
              v = 13
              break e
            }
            continue e
          default:
            v = 14
            break e
        }
      }
      return 3 == (0 | v)
        ? ((St[f >> 2] = St[k >> 2]), (M = 0 | St[f >> 2]), (pt = O), 0 | M)
        : 5 == (0 | v)
          ? ((St[f >> 2] = 4), (M = 0 | St[f >> 2]), (pt = O), 0 | M)
          : 7 == (0 | v)
            ? ((M = (St[f >> 2] = 0) | St[f >> 2]), (pt = O), 0 | M)
            : 9 == (0 | v)
              ? ((St[f >> 2] = St[F >> 2]), (M = 0 | St[f >> 2]), (pt = O), 0 | M)
              : 11 == (0 | v)
                ? ((St[f >> 2] = St[w >> 2]), (M = 0 | St[f >> 2]), (pt = O), 0 | M)
                : 13 == (0 | v)
                  ? ((St[f >> 2] = St[y >> 2]), (M = 0 | St[f >> 2]), (pt = O), 0 | M)
                  : 14 == (0 | v)
                    ? ((St[f >> 2] = 4), (M = 0 | St[f >> 2]), (pt = O), 0 | M)
                    : 0
    }
    function fe(e, r) {
      ;(e |= 0), (r |= 0)
      var t,
        n,
        i,
        o,
        a = 0,
        u = 0,
        s = pt
      return (
        (0 | bt) <= (0 | (pt = (pt + 32) | 0)) && yt(32),
        (t = (s + 20) | 0),
        (i = (s + 12) | 0),
        (a = ((o = s) + 8) | 0),
        (St[(n = (s + 16) | 0) >> 2] = e),
        (St[i >> 2] = r),
        (r = 0 | le(0 | St[n >> 2], o)),
        (St[a >> 2] = r),
        (pt =
          ((u =
            0 | St[a >> 2]
              ? ((St[t >> 2] = St[a >> 2]), 0 | St[t >> 2])
              : (0 < (r = 0 | St[((a = o) + 4) >> 2]) >>> 0) | ((0 == (0 | r)) & (2147483648 <= (0 | St[a >> 2]) >>> 0))
                ? ((St[t >> 2] = 4), 0 | St[t >> 2])
                : (0 < (r = 0 | St[((a = o) + 4) >> 2]) >>> 0) | ((0 == (0 | r)) & (67108864 <= (0 | St[a >> 2]) >>> 0))
                  ? ((St[t >> 2] = 4), 0 | St[t >> 2])
                  : ((St[St[i >> 2] >> 2] = St[o >> 2]), (St[t >> 2] = 0) | St[t >> 2])),
          s)),
        0 | u
      )
    }
    function le(e, r) {
      ;(e |= 0), (r |= 0)
      var t,
        n,
        i,
        o,
        a,
        u,
        s,
        f = 0,
        l = 0,
        c = 0,
        d = 0,
        E = 0,
        _ = 0,
        S = 0,
        m = pt
      if (
        ((0 | bt) <= (0 | (pt = (pt + 48) | 0)) && yt(48),
        (t = (m + 28) | 0),
        (f = (m + 20) | 0),
        (i = (m + 34) | 0),
        (l = (m + 33) | 0),
        (c = (m + 16) | 0),
        (d = (m + 12) | 0),
        (E = (m + 32) | 0),
        (a = ((o = m) + 8) | 0),
        (St[(n = (m + 24) | 0) >> 2] = e),
        (St[f >> 2] = r),
        (Et[l >> 0] = -128),
        (r = 0 | te(0 | St[n >> 2], i)),
        (St[d >> 2] = r),
        0 | St[d >> 2])
      )
        return (St[t >> 2] = St[d >> 2]), (_ = 0 | St[t >> 2]), (pt = m), 0 | _
      for (d = 0 | St[f >> 2], St[d >> 2] = 0, St[(d + 4) >> 2] = 0, St[c >> 2] = 0; ; ) {
        if (8 <= (0 | St[c >> 2])) {
          S = 10
          break
        }
        if (!((0 | mt[i >> 0]) & (0 | mt[l >> 0]))) {
          S = 6
          break
        }
        if (((d = 0 | te(0 | St[n >> 2], E)), (St[a >> 2] = d), 0 | St[a >> 2])) {
          S = 8
          break
        }
        ;(d = 0 | It(0 | mt[E >> 0], 0, (St[c >> 2] << 3) | 0)),
          (r = 0 | St[f >> 2]),
          (u = St[((e = r) + 4) >> 2] | Ft),
          (St[(s = r) >> 2] = St[e >> 2] | d),
          (St[(s + 4) >> 2] = u),
          (Et[l >> 0] = (0 | mt[l >> 0]) >> 1),
          (St[c >> 2] = 1 + (0 | St[c >> 2]))
      }
      return 6 == (0 | S)
        ? ((E = (0 | mt[i >> 0]) & ((0 | mt[l >> 0]) - 1)),
          (St[(l = o) >> 2] = E),
          (St[(l + 4) >> 2] = (((0 | E) < 0) << 31) >> 31),
          (o = 0 | It(0 | St[(E = o) >> 2], 0 | St[(E + 4) >> 2], (St[c >> 2] << 3) | 0)),
          (c = 0 | St[f >> 2]),
          (E = 0 | Dt(0 | St[(f = c) >> 2], 0 | St[(f + 4) >> 2], 0 | o, 0 | Ft)),
          (St[(o = c) >> 2] = E),
          (St[(o + 4) >> 2] = Ft),
          (_ = (St[t >> 2] = 0) | St[t >> 2]),
          (pt = m),
          0 | _)
        : 8 == (0 | S)
          ? ((St[t >> 2] = St[a >> 2]), (_ = 0 | St[t >> 2]), (pt = m), 0 | _)
          : 10 == (0 | S)
            ? ((_ = (St[t >> 2] = 0) | St[t >> 2]), (pt = m), 0 | _)
            : 0
    }
    function ce(e, r, t) {
      ;(e |= 0), (r |= 0), (t |= 0)
      var n,
        i,
        o,
        a = 0,
        u = pt
      return (
        (0 | bt) <= (0 | (pt = (pt + 16) | 0)) && yt(16),
        (n = (u + 12) | 0),
        (St[(i = ((o = u) + 8) | 0) >> 2] = e),
        (St[(e = o) >> 2] = r),
        (St[(e + 4) >> 2] = t),
        (e = 0 | St[((t = o) + 4) >> 2]),
        (pt =
          ((a =
            (0 < e >>> 0) | (0 == (0 | e) ? (0 | St[t >> 2]) >>> 0 > (0 | St[(4 + (0 | St[i >> 2])) >> 2]) >>> 0 : 0)
              ? ((St[n >> 2] = 16), 0 | St[n >> 2])
              : ((t = (4 + (0 | St[i >> 2])) | 0),
                (St[t >> 2] = (0 | St[t >> 2]) - (0 | St[o >> 2])),
                (t = 0 | St[i >> 2]),
                (St[t >> 2] = (0 | St[t >> 2]) + (0 | St[o >> 2])),
                (St[n >> 2] = 0) | St[n >> 2])),
          u)),
        0 | a
      )
    }
    function de(e) {
      e |= 0
      var r,
        t,
        n,
        i,
        o = 0,
        a = pt
      return (
        (0 | bt) <= (0 | (pt = (pt + 16) | 0)) && yt(16),
        (r = (a + 8) | 0),
        (n = (a + 12) | 0),
        (St[(t = ((i = a) + 4) | 0) >> 2] = e),
        (e = 0 | te(0 | St[t >> 2], n)),
        (St[i >> 2] = e),
        (pt =
          ((o =
            (0 | St[i >> 2] ? (St[r >> 2] = St[i >> 2]) : (St[r >> 2] = 0 == (0 | mt[n >> 0]) ? 0 : 4),
            0 | St[r >> 2])),
          a)),
        0 | o
      )
    }
    function Ee(e, r, t, n) {
      ;(e |= 0), (r |= 0), (t |= 0), (n |= 0)
      var i,
        o,
        a,
        u,
        s,
        f,
        l,
        c,
        d,
        E = 0,
        _ = 0,
        S = pt
      if (
        ((0 | bt) <= (0 | (pt = (pt + 32) | 0)) && yt(32),
        (i = (S + 24) | 0),
        (a = (S + 16) | 0),
        (u = (S + 12) | 0),
        (s = (S + 8) | 0),
        (f = (S + 29) | 0),
        (l = (S + 28) | 0),
        (c = (S + 4) | 0),
        (St[(o = ((d = S) + 20) | 0) >> 2] = e),
        (St[a >> 2] = r),
        (St[u >> 2] = t),
        (St[s >> 2] = n),
        (Et[f >> 0] = 0),
        (Et[l >> 0] = 0) | St[a >> 2])
      ) {
        if (((n = 0 | sr[3 & St[St[s >> 2] >> 2]](0 | St[s >> 2], 0 | St[a >> 2])), !(St[St[u >> 2] >> 2] = n)))
          return (St[i >> 2] = 2), (E = 0 | St[i >> 2]), (pt = S), 0 | E
      } else St[St[u >> 2] >> 2] = 0
      for (St[c >> 2] = 0; ; ) {
        if ((0 | St[c >> 2]) >>> 0 >= (0 | St[a >> 2]) >>> 0) {
          _ = 12
          break
        }
        if (!(0 | mt[l >> 0])) {
          if (((n = 0 | te(0 | St[o >> 2], f)), (St[d >> 2] = n), 0 | St[d >> 2])) {
            _ = 9
            break
          }
          Et[l >> 0] = -128
        }
        ;(Et[((0 | St[St[u >> 2] >> 2]) + (0 | St[c >> 2])) >> 0] = ((0 | mt[f >> 0]) & (0 | mt[l >> 0])) | 0 ? 1 : 0),
          (Et[l >> 0] = (0 | mt[l >> 0]) >> 1),
          (St[c >> 2] = 1 + (0 | St[c >> 2]))
      }
      return 9 == (0 | _)
        ? ((St[i >> 2] = St[d >> 2]), (E = 0 | St[i >> 2]), (pt = S), 0 | E)
        : 12 == (0 | _)
          ? ((E = (St[i >> 2] = 0) | St[i >> 2]), (pt = S), 0 | E)
          : 0
    }
    function _e(e, r, t, n) {
      ;(e |= 0), (r |= 0), (t |= 0), (n |= 0)
      var i,
        o,
        a,
        u,
        s,
        f,
        l,
        c = 0,
        d = 0,
        E = pt
      if (
        ((0 | bt) <= (0 | (pt = (pt + 32) | 0)) && yt(32),
        (i = (E + 24) | 0),
        (a = (E + 16) | 0),
        (u = (E + 12) | 0),
        (s = (E + 8) | 0),
        (c = (E + 28) | 0),
        (f = (E + 4) | 0),
        (St[(o = ((l = E) + 20) | 0) >> 2] = e),
        (St[a >> 2] = r),
        (St[u >> 2] = t),
        (St[s >> 2] = n),
        (n = 0 | te(0 | St[o >> 2], c)),
        (St[l >> 2] = n),
        0 | St[l >> 2])
      )
        return (St[i >> 2] = St[l >> 2]), (d = 0 | St[i >> 2]), (pt = E), 0 | d
      if (!(0 | mt[c >> 0]))
        return (
          (c = 0 | Ee(0 | St[o >> 2], 0 | St[a >> 2], 0 | St[u >> 2], 0 | St[s >> 2])),
          (St[i >> 2] = c),
          (d = 0 | St[i >> 2]),
          (pt = E),
          0 | d
        )
      if (0 | St[a >> 2]) {
        if (((c = 0 | sr[3 & St[St[s >> 2] >> 2]](0 | St[s >> 2], 0 | St[a >> 2])), !(St[St[u >> 2] >> 2] = c)))
          return (St[i >> 2] = 2), (d = 0 | St[i >> 2]), (pt = E), 0 | d
      } else St[St[u >> 2] >> 2] = 0
      for (St[f >> 2] = 0; !((0 | St[f >> 2]) >>> 0 >= (0 | St[a >> 2]) >>> 0); )
        (Et[((0 | St[St[u >> 2] >> 2]) + (0 | St[f >> 2])) >> 0] = 1), (St[f >> 2] = 1 + (0 | St[f >> 2]))
      return (d = (St[i >> 2] = 0) | St[i >> 2]), (pt = E), 0 | d
    }
    function Se(e, r) {
      ;(e |= 0), (r |= 0)
      var t,
        n,
        i,
        o,
        a,
        u,
        s = 0,
        f = 0,
        l = pt
      for (
        (0 | bt) <= (0 | (pt = (pt + 32) | 0)) && yt(32),
          t = (l + 16) | 0,
          i = (l + 8) | 0,
          o = (l + 4) | 0,
          a = (l + 20) | 0,
          St[(n = ((u = l) + 12) | 0) >> 2] = e,
          St[i >> 2] = r,
          St[St[i >> 2] >> 2] = 0,
          St[o >> 2] = 0;
        ;

      ) {
        if (4 <= (0 | St[o >> 2])) {
          s = 6
          break
        }
        if (((r = 0 | te(0 | St[n >> 2], a)), (St[u >> 2] = r), 0 | St[u >> 2])) {
          s = 4
          break
        }
        ;(r = 0 | St[i >> 2]),
          (St[r >> 2] = St[r >> 2] | ((0 | mt[a >> 0]) << (St[o >> 2] << 3))),
          (St[o >> 2] = 1 + (0 | St[o >> 2]))
      }
      return 4 == (0 | s)
        ? ((St[t >> 2] = St[u >> 2]), (f = 0 | St[t >> 2]), (pt = l), 0 | f)
        : 6 == (0 | s)
          ? ((f = (St[t >> 2] = 0) | St[t >> 2]), (pt = l), 0 | f)
          : 0
    }
    function te(e, r) {
      ;(e |= 0), (r |= 0)
      var t,
        n,
        i,
        o = 0,
        a = pt
      return (
        (0 | bt) <= (0 | (pt = (pt + 16) | 0)) && yt(16),
        (t = (a + 8) | 0),
        (St[(n = ((i = a) + 4) | 0) >> 2] = e),
        (St[i >> 2] = r),
        (pt =
          ((o =
            0 | St[(4 + (0 | St[n >> 2])) >> 2]
              ? ((r = (4 + (0 | St[n >> 2])) | 0),
                (St[r >> 2] = (0 | St[r >> 2]) - 1),
                (r = 0 | St[n >> 2]),
                (n = 0 | St[r >> 2]),
                (St[r >> 2] = 1 + n),
                (Et[St[i >> 2] >> 0] = 0 | Et[n >> 0]),
                (St[t >> 2] = 0) | St[t >> 2])
              : ((St[t >> 2] = 16), 0 | St[t >> 2])),
          a)),
        0 | o
      )
    }
    function me(e) {
      e |= 0
      var r,
        t,
        n,
        i = 0,
        o = 0,
        a = pt
      return (
        (0 | bt) <= (0 | (pt = (pt + 32) | 0)) && yt(32),
        (r = (a + 16) | 0),
        (i = ((n = a) + 8) | 0),
        (St[(t = (a + 12) | 0) >> 2] = e),
        (e = 0 | le(0 | St[t >> 2], n)),
        (St[i >> 2] = e),
        (pt =
          ((o =
            (0 | St[i >> 2]
              ? (St[r >> 2] = St[i >> 2])
              : ((i = n), (n = 0 | ce(0 | St[t >> 2], 0 | St[i >> 2], 0 | St[(i + 4) >> 2])), (St[r >> 2] = n)),
            0 | St[r >> 2])),
          a)),
        0 | o
      )
    }
    function ne(e, r, t, n, i) {
      ;(e |= 0), (r |= 0), (t |= 0), (n |= 0), (i |= 0)
      var o,
        a,
        u,
        s,
        f,
        l,
        c,
        d,
        E = 0,
        _ = 0,
        S = 0,
        m = pt
      if (
        ((0 | bt) <= (0 | (pt = (pt + 48) | 0)) && yt(48),
        (o = (m + 32) | 0),
        (u = (m + 24) | 0),
        (s = (m + 20) | 0),
        (f = (m + 16) | 0),
        (l = (m + 12) | 0),
        (c = (m + 8) | 0),
        (E = (m + 4) | 0),
        (St[(a = ((d = m) + 28) | 0) >> 2] = e),
        (St[u >> 2] = r),
        (St[s >> 2] = t),
        (St[f >> 2] = n),
        (St[l >> 2] = i),
        (i = 0 | _e(0 | St[a >> 2], 0 | St[u >> 2], 0 | St[s >> 2], 0 | St[l >> 2])),
        (St[E >> 2] = i),
        0 | St[E >> 2])
      )
        return (St[o >> 2] = St[E >> 2]), (_ = 0 | St[o >> 2]), (pt = m), 0 | _
      if (0 | St[u >> 2]) {
        if (((E = 0 | sr[3 & St[St[l >> 2] >> 2]](0 | St[l >> 2], St[u >> 2] << 2)), !(St[St[f >> 2] >> 2] = E)))
          return (St[o >> 2] = 2), (_ = 0 | St[o >> 2]), (pt = m), 0 | _
      } else St[St[f >> 2] >> 2] = 0
      for (St[c >> 2] = 0; ; ) {
        if ((0 | St[c >> 2]) >>> 0 >= (0 | St[u >> 2]) >>> 0) {
          S = 13
          break
        }
        if (
          0 | Et[((0 | St[St[s >> 2] >> 2]) + (0 | St[c >> 2])) >> 0] &&
          ((E = 0 | Se(0 | St[a >> 2], ((0 | St[St[f >> 2] >> 2]) + (St[c >> 2] << 2)) | 0)),
          (St[d >> 2] = E),
          0 | St[d >> 2])
        ) {
          S = 11
          break
        }
        St[c >> 2] = 1 + (0 | St[c >> 2])
      }
      return 11 == (0 | S)
        ? ((St[o >> 2] = St[d >> 2]), (_ = 0 | St[o >> 2]), (pt = m), 0 | _)
        : 13 == (0 | S)
          ? ((_ = (St[o >> 2] = 0) | St[o >> 2]), (pt = m), 0 | _)
          : 0
    }
    function I(e, r, t) {
      ;(e |= 0), (r |= 0), (t |= 0)
      var n,
        i,
        o,
        a,
        u,
        s,
        f = 0,
        l = 0,
        c = pt
      for (
        (0 | bt) <= (0 | (pt = (pt + 32) | 0)) && yt(32),
          n = (c + 28) | 0,
          o = (c + 8) | 0,
          u = ((a = c) + 20) | 0,
          s = (c + 16) | 0,
          St[(i = (c + 24) | 0) >> 2] = e,
          St[(e = o) >> 2] = r,
          St[(e + 4) >> 2] = t;
        ;

      ) {
        if (((t = 0 | ue(0 | St[i >> 2], a)), (St[u >> 2] = t), 0 | St[u >> 2])) {
          f = 3
          break
        }
        if (((e = o), (0 | St[(t = a) >> 2]) == (0 | St[e >> 2]) && (0 | St[(t + 4) >> 2]) == (0 | St[(e + 4) >> 2]))) {
          f = 5
          break
        }
        if ((0 == (0 | St[(e = a) >> 2])) & (0 == (0 | St[(e + 4) >> 2]))) {
          f = 7
          break
        }
        if (((e = 0 | me(0 | St[i >> 2])), (St[s >> 2] = e), 0 | St[s >> 2])) {
          f = 9
          break
        }
      }
      return 3 == (0 | f)
        ? ((St[n >> 2] = St[u >> 2]), (l = 0 | St[n >> 2]), (pt = c), 0 | l)
        : 5 == (0 | f)
          ? ((l = (St[n >> 2] = 0) | St[n >> 2]), (pt = c), 0 | l)
          : 7 == (0 | f)
            ? ((St[n >> 2] = 16), (l = 0 | St[n >> 2]), (pt = c), 0 | l)
            : 9 == (0 | f)
              ? ((St[n >> 2] = St[s >> 2]), (l = 0 | St[n >> 2]), (pt = c), 0 | l)
              : 0
    }
    function ie(e, r, t) {
      ;(e |= 0), (r |= 0), (t |= 0)
      var n,
        i,
        o,
        a,
        u,
        s,
        f = 0,
        l = 0,
        c = pt
      for (
        (0 | bt) <= (0 | (pt = (pt + 32) | 0)) && yt(32),
          n = (c + 20) | 0,
          o = (c + 12) | 0,
          a = (c + 8) | 0,
          u = (c + 4) | 0,
          St[(i = ((s = c) + 16) | 0) >> 2] = e,
          St[o >> 2] = r,
          St[a >> 2] = t,
          St[u >> 2] = 0;
        ;

      ) {
        if ((0 | St[u >> 2]) >>> 0 >= (0 | St[a >> 2]) >>> 0) {
          f = 6
          break
        }
        if (
          ((t = 0 | te(0 | St[i >> 2], ((0 | St[o >> 2]) + (0 | St[u >> 2])) | 0)), (St[s >> 2] = t), 0 | St[s >> 2])
        ) {
          f = 4
          break
        }
        St[u >> 2] = 1 + (0 | St[u >> 2])
      }
      return 4 == (0 | f)
        ? ((St[n >> 2] = St[s >> 2]), (l = 0 | St[n >> 2]), (pt = c), 0 | l)
        : 6 == (0 | f)
          ? ((l = (St[n >> 2] = 0) | St[n >> 2]), (pt = c), 0 | l)
          : 0
    }
    function oe(e) {
      e |= 0
      var r,
        t,
        n,
        i = 0,
        o = pt
      ;(0 | bt) <= (0 | (pt = (pt + 16) | 0)) && yt(16), (r = (o + 8) | 0), (St[(t = ((n = o) + 4) | 0) >> 2] = e)
      do {
        if (0 | St[St[t >> 2] >> 2]) {
          if (
            ((e =
              0 |
              (function (e) {
                var r = 0,
                  t = 0,
                  n = 0,
                  i = 0
                ;-1 < (0 | St[(76 + (e |= 0)) >> 2]) && ze()
                ;(r = 0 != ((1 & St[e >> 2]) | 0)) ||
                  (H(11076),
                  (t = 0 | St[(e + 52) >> 2]),
                  (n = (e + 56) | 0),
                  0 | t && (St[(t + 56) >> 2] = St[n >> 2]),
                  0 | (i = 0 | St[n >> 2]) && (St[(i + 52) >> 2] = t),
                  (0 | St[2768]) == (0 | e) && (St[2768] = i),
                  V(11076))
                ;(i = 0 | Ve(e)), (t = 0 | ar[1 & St[(e + 12) >> 2]](e) | i), 0 | (i = 0 | St[(e + 92) >> 2]) && Ge(i)
                r || Ge(e)
                return 0 | t
              })(0 | St[St[t >> 2] >> 2])),
            (St[n >> 2] = e),
            0 | St[n >> 2])
          )
            return (St[r >> 2] = St[n >> 2]), (i = 0 | St[r >> 2]), (pt = o), 0 | i
          St[St[t >> 2] >> 2] = 0
          break
        }
      } while (0)
      return (i = (St[r >> 2] = 0) | St[r >> 2]), (pt = o), 0 | i
    }
    function L(e, r, t) {
      ;(e |= 0), (r |= 0), (t |= 0)
      var n,
        i,
        o,
        a,
        u,
        s = 0,
        f = pt
      return (
        (0 | bt) <= (0 | (pt = (pt + 32) | 0)) && yt(32),
        (n = (f + 16) | 0),
        (o = (f + 8) | 0),
        (a = (f + 4) | 0),
        (St[(i = ((u = f) + 12) | 0) >> 2] = e),
        (St[o >> 2] = r),
        (St[a >> 2] = t),
        (St[u >> 2] = St[St[a >> 2] >> 2]),
        (pt =
          ((s =
            0 | St[u >> 2]
              ? ((t =
                  0 |
                  (function (e, r, t, n) {
                    ;(e |= 0), (n |= 0)
                    var i = 0,
                      o = 0,
                      a = 0,
                      u = 0,
                      s = 0,
                      f = 0,
                      l = 0,
                      c = 0,
                      d = 0,
                      E = 0
                    ;(i = 0 | wt((t |= 0), (r |= 0))), (o = -1 < (0 | St[(n + 76) >> 2]) ? 0 | ze() : 0)
                    ;(u = 0 | Et[(a = (n + 74) | 0) >> 0]),
                      (Et[a >> 0] = (u + 255) | u),
                      (a = 0 | St[(u = (n + 4) | 0) >> 2]),
                      (s = ((0 | St[(n + 8) >> 2]) - a) | 0),
                      (f = a),
                      (c =
                        0 < (0 | s)
                          ? (Je(0 | e, 0 | f, 0 | (a = s >>> 0 < i >>> 0 ? s : i)),
                            (St[u >> 2] = f + a),
                            (l = (i - a) | 0),
                            (e + a) | 0)
                          : ((l = i), e))
                    e: do {
                      if (l) {
                        for (
                          e = (n + 32) | 0, a = l, f = c;
                          !(
                            0 |
                              (function (e) {
                                var r = 0,
                                  t = 0,
                                  n = 0
                                ;(t = 0 | Et[(r = (74 + (e |= 0)) | 0) >> 0]),
                                  (Et[r >> 0] = (t + 255) | t),
                                  (r = (e + 44) | 0),
                                  (0 | St[(t = (e + 20) | 0) >> 2]) >>> 0 > (0 | St[r >> 2]) >>> 0 &&
                                    nr[15 & St[(e + 36) >> 2]](e, 0, 0)
                                ;(St[(e + 16) >> 2] = 0),
                                  (St[(e + 28) >> 2] = 0),
                                  (St[t >> 2] = 0),
                                  (n =
                                    20 & (t = 0 | St[e >> 2])
                                      ? (4 & t && (St[e >> 2] = 32 | t), -1)
                                      : ((t = 0 | St[r >> 2]), (St[(e + 8) >> 2] = t), (St[(e + 4) >> 2] = t), 0))
                                return 0 | n
                              })(n) || (((u = 0 | nr[15 & St[e >> 2]](n, f, a)) + 1) | 0) >>> 0 < 2
                          );

                        ) {
                          if (!(s = (a - u) | 0)) {
                            d = 13
                            break e
                          }
                          ;(a = s), (f = (f + u) | 0)
                        }
                        0 | o && He(), (E = ((((i - a) | 0) >>> 0) / (r >>> 0)) | 0)
                      } else d = 13
                    } while (0)
                    13 == (0 | d) && (E = (o && He(), t))
                    return 0 | E
                  })(0 | St[o >> 2], 1, 0 | St[u >> 2], 0 | St[St[i >> 2] >> 2])),
                (St[St[a >> 2] >> 2] = t),
                (0 | St[St[a >> 2] >> 2]) == (0 | St[u >> 2])
                  ? (St[n >> 2] = 0) | St[n >> 2]
                  : ((u =
                      0 |
                      (function (e) {
                        var r = 0,
                          t = 0,
                          n = 0
                        n =
                          -1 < (0 | St[(76 + (e |= 0)) >> 2])
                            ? ((r = 0 == (0 | ze())), (t = ((0 | St[e >> 2]) >>> 5) & 1), r || He(), t)
                            : ((0 | St[e >> 2]) >>> 5) & 1
                        return 0 | n
                      })(0 | St[St[i >> 2] >> 2])),
                    (St[n >> 2] = u),
                    0 | St[n >> 2]))
              : (St[n >> 2] = 0) | St[n >> 2]),
          f)),
        0 | s
      )
    }
    function ae(e, r, t) {
      ;(e |= 0), (r |= 0), (t |= 0)
      var n,
        i,
        o,
        a,
        u,
        s,
        f = 0,
        l = pt
      switch (
        ((0 | bt) <= (0 | (pt = (pt + 32) | 0)) && yt(32),
        (n = (l + 20) | 0),
        (o = (l + 12) | 0),
        (a = (l + 8) | 0),
        (u = (l + 4) | 0),
        (St[(i = ((s = l) + 16) | 0) >> 2] = e),
        (St[o >> 2] = r),
        (St[a >> 2] = t),
        0 | St[a >> 2])
      ) {
        case 0:
          St[u >> 2] = 0
          break
        case 1:
          St[u >> 2] = 1
          break
        case 2:
          St[u >> 2] = 2
          break
        default:
          return (St[n >> 2] = 1), (f = 0 | St[n >> 2]), (pt = l), 0 | f
      }
      return (
        (a =
          0 |
          ((e = 0 | St[St[i >> 2] >> 2]),
          (r = 0 | St[St[o >> 2] >> 2]),
          (t = 0 | St[u >> 2]),
          0 |
            (function (e, r, t) {
              ;(r |= 0), (t |= 0)
              var n = 0,
                i = 0,
                o = 0
              o =
                -1 < (0 | St[(76 + (e |= 0)) >> 2])
                  ? ((n = 0 == (0 | ze())), (i = 0 | We(e, r, t)), n || He(), i)
                  : 0 | We(e, r, t)
              return 0 | o
            })((e |= 0), (r |= 0), (t |= 0)))),
        (St[s >> 2] = a),
        (a =
          0 |
          ((t = 0 | St[St[i >> 2] >> 2]),
          0 |
            (function (e) {
              var r = 0,
                t = 0,
                n = 0
              n =
                -1 < (0 | St[(76 + (e |= 0)) >> 2]) ? ((r = 0 == (0 | ze())), (t = 0 | je(e)), r || He(), t) : 0 | je(e)
              return 0 | n
            })((t |= 0)))),
        (i = 0 | St[o >> 2]),
        (St[i >> 2] = a),
        (St[(4 + i) >> 2] = (((0 | a) < 0) << 31) >> 31),
        (St[n >> 2] = St[s >> 2]),
        (f = 0 | St[n >> 2]),
        (pt = l),
        0 | f
      )
    }
    function he(e, r, t) {
      ;(e |= 0), (r |= 0), (t |= 0)
      var n,
        i,
        o,
        a = pt
      return (
        (0 | bt) <= (0 | (pt = (pt + 32) | 0)) && yt(32),
        (i = (a + 8) | 0),
        (St[(n = ((o = a) + 16) | 0) >> 2] = e),
        (St[(e = i) >> 2] = r),
        (St[(e + 4) >> 2] = t),
        (i = 0 | St[((t = i) + 4) >> 2]),
        (St[(e = o) >> 2] = St[t >> 2]),
        (St[(e + 4) >> 2] = i),
        (i = 0 | nr[15 & St[(12 + (0 | St[n >> 2])) >> 2]](0 | St[n >> 2], o, 0)),
        (pt = a),
        0 | i
      )
    }
    function pe(e, r, t, n) {
      ;(e |= 0), (r |= 0), (t |= 0), (n |= 0)
      var i,
        o,
        a,
        u,
        s,
        f,
        l,
        c = 0,
        d = 0,
        E = pt
      for (
        (0 | bt) <= (0 | (pt = (pt + 32) | 0)) && yt(32),
          i = (E + 24) | 0,
          a = (E + 16) | 0,
          u = (E + 12) | 0,
          s = (E + 8) | 0,
          f = (E + 4) | 0,
          St[(o = ((l = E) + 20) | 0) >> 2] = e,
          St[a >> 2] = r,
          St[u >> 2] = t,
          St[s >> 2] = n;
        ;

      ) {
        if (!(0 | St[u >> 2])) {
          c = 8
          break
        }
        if (
          ((St[f >> 2] = St[u >> 2]),
          (n = 0 | nr[15 & St[(8 + (0 | St[o >> 2])) >> 2]](0 | St[o >> 2], 0 | St[a >> 2], f)),
          (St[l >> 2] = n),
          0 | St[l >> 2])
        ) {
          c = 4
          break
        }
        if (!(0 | St[f >> 2])) {
          c = 6
          break
        }
        ;(St[a >> 2] = (0 | St[a >> 2]) + (0 | St[f >> 2])), (St[u >> 2] = (0 | St[u >> 2]) - (0 | St[f >> 2]))
      }
      return 4 == (0 | c)
        ? ((St[i >> 2] = St[l >> 2]), (d = 0 | St[i >> 2]), (pt = E), 0 | d)
        : 6 == (0 | c)
          ? ((St[i >> 2] = St[s >> 2]), (d = 0 | St[i >> 2]), (pt = E), 0 | d)
          : 8 == (0 | c)
            ? ((d = (St[i >> 2] = 0) | St[i >> 2]), (pt = E), 0 | d)
            : 0
    }
    function be(e, r, t) {
      ;(e |= 0), (r |= 0), (t |= 0)
      var n,
        i,
        o,
        a = pt
      ;(0 | bt) <= (0 | (pt = (pt + 16) | 0)) && yt(16),
        (i = (a + 4) | 0),
        (St[(n = ((o = a) + 8) | 0) >> 2] = e),
        (St[i >> 2] = r),
        (St[o >> 2] = t),
        (St[(76 + (0 | St[n >> 2])) >> 2] = 1),
        (St[(72 + (0 | St[n >> 2])) >> 2] = 0),
        (St[(88 + (0 | St[n >> 2])) >> 2] = 0) | St[i >> 2] &&
          ((St[(44 + (0 | St[n >> 2])) >> 2] = 0),
          (St[(48 + (0 | St[n >> 2])) >> 2] = 0),
          (St[(80 + (0 | St[n >> 2])) >> 2] = 1)),
        (pt = (0 | St[o >> 2] && (St[(80 + (0 | St[n >> 2])) >> 2] = 1), a))
    }
    function ke(e) {
      e |= 0
      var r,
        t = pt
      ;(0 | bt) <= (0 | (pt = (pt + 16) | 0)) && yt(16),
        (St[(r = t) >> 2] = e),
        be((St[(36 + (0 | St[r >> 2])) >> 2] = 0) | St[r >> 2], 1, 1),
        (pt = t)
    }
    function Fe(e, r, t, n, i, o) {
      ;(e |= 0), (r |= 0), (t |= 0), (n |= 0), (i |= 0), (o |= 0)
      var a,
        u,
        s,
        f,
        l,
        c,
        d,
        E,
        _,
        S,
        m,
        h,
        p,
        b = 0,
        k = 0,
        F = 0,
        w = 0,
        y = 0,
        v = pt
      for (
        (0 | bt) <= (0 | (pt = (pt + 64) | 0)) && yt(64),
          a = (v + 56) | 0,
          s = (v + 48) | 0,
          b = (v + 44) | 0,
          f = (v + 40) | 0,
          l = (v + 36) | 0,
          c = (v + 32) | 0,
          k = (v + 28) | 0,
          d = (v + 24) | 0,
          E = (v + 20) | 0,
          _ = (v + 16) | 0,
          S = (v + 12) | 0,
          m = (v + 8) | 0,
          h = (v + 4) | 0,
          St[(u = ((p = v) + 52) | 0) >> 2] = e,
          St[s >> 2] = r,
          St[b >> 2] = t,
          St[f >> 2] = n,
          St[l >> 2] = i,
          St[c >> 2] = o,
          St[k >> 2] = St[St[f >> 2] >> 2],
          we((St[St[f >> 2] >> 2] = 0) | St[u >> 2], 0 | St[s >> 2]),
          St[St[c >> 2] >> 2] = 0;
        ;

      ) {
        if (((F = 0 | St[u >> 2]), 274 == (0 | St[(72 + (0 | St[u >> 2])) >> 2]))) {
          w = 46
          break
        }
        if (0 | St[(F + 76) >> 2]) {
          for (; !((0 | St[k >> 2]) >>> 0 <= 0 || 5 <= (0 | St[(88 + (0 | St[u >> 2])) >> 2]) >>> 0); )
            (o = 0 | St[b >> 2]),
              (St[b >> 2] = o + 1),
              (i = 0 | Et[o >> 0]),
              (o = (88 + (0 | St[u >> 2])) | 0),
              (n = 0 | St[o >> 2]),
              (St[o >> 2] = n + 1),
              (Et[(92 + (0 | St[u >> 2]) + n) >> 0] = i),
              (i = 0 | St[f >> 2]),
              (St[i >> 2] = 1 + (0 | St[i >> 2])),
              (St[k >> 2] = (0 | St[k >> 2]) - 1)
          if ((0 | St[(88 + (0 | St[u >> 2])) >> 2]) >>> 0 < 5) {
            w = 8
            break
          }
          if (0 | mt[(92 + (0 | St[u >> 2])) >> 0]) {
            w = 10
            break
          }
          !(function (e, r) {
            ;(e |= 0), (r |= 0)
            var t = 0,
              n = 0,
              i = 0
            ;(0 | (pt = ((t = pt) + 16) | 0)) >= (0 | bt) && yt(16),
              (St[(n = ((i = t) + 4) | 0) >> 2] = e),
              (St[i >> 2] = r),
              (St[(32 + (0 | St[n >> 2])) >> 2] =
                ((0 | mt[(1 + (0 | St[i >> 2])) >> 0]) << 24) |
                ((0 | mt[(2 + (0 | St[i >> 2])) >> 0]) << 16) |
                ((0 | mt[(3 + (0 | St[i >> 2])) >> 0]) << 8) |
                0 |
                mt[(4 + (0 | St[i >> 2])) >> 0]),
              (St[(28 + (0 | St[n >> 2])) >> 2] = -1),
              (St[(76 + (0 | St[n >> 2])) >> 2] = 0),
              (pt = t)
          })(0 | St[u >> 2], (92 + (0 | St[u >> 2])) | 0),
            (St[(88 + (0 | St[u >> 2])) >> 2] = 0)
        }
        if (((St[d >> 2] = 0) | St[(36 + (0 | St[u >> 2])) >> 2]) >>> 0 >= (0 | St[s >> 2]) >>> 0) {
          if (0 == (0 | St[(72 + (0 | St[u >> 2])) >> 2]) && 0 == (0 | St[(32 + (0 | St[u >> 2])) >> 2])) {
            w = 15
            break
          }
          if (!(0 | St[l >> 2])) {
            w = 17
            break
          }
          if (0 | St[(72 + (0 | St[u >> 2])) >> 2]) {
            w = 19
            break
          }
          St[d >> 2] = 1
        }
        if (
          (0 | St[(80 + (0 | St[u >> 2])) >> 2] &&
            (function (e) {
              e |= 0
              var r = 0,
                t = 0,
                n = 0,
                i = 0,
                o = 0
              for (
                (0 | (pt = ((r = pt) + 16) | 0)) >= (0 | bt) && yt(16),
                  n = (r + 8) | 0,
                  i = (r + 4) | 0,
                  St[(t = ((o = r) + 12) | 0) >> 2] = e,
                  St[n >> 2] = 1846 + (768 << ((0 | St[St[t >> 2] >> 2]) + (0 | St[(4 + (0 | St[t >> 2])) >> 2]))),
                  St[o >> 2] = St[(16 + (0 | St[t >> 2])) >> 2],
                  St[i >> 2] = 0;
                !((0 | St[i >> 2]) >>> 0 >= (0 | St[n >> 2]) >>> 0);

              )
                (_t[((0 | St[o >> 2]) + (St[i >> 2] << 1)) >> 1] = 1024), (St[i >> 2] = 1 + (0 | St[i >> 2]))
              ;(St[(56 + (0 | St[t >> 2]) + 12) >> 2] = 1),
                (St[(56 + (0 | St[t >> 2]) + 8) >> 2] = 1),
                (St[(56 + (0 | St[t >> 2]) + 4) >> 2] = 1),
                (St[(56 + (0 | St[t >> 2])) >> 2] = 1),
                (St[(52 + (0 | St[t >> 2])) >> 2] = 0),
                (St[(80 + (0 | St[t >> 2])) >> 2] = 0),
                (pt = r)
            })(0 | St[u >> 2]),
          0 | St[(88 + (0 | St[u >> 2])) >> 2])
        ) {
          for (
            St[m >> 2] = St[(88 + (0 | St[u >> 2])) >> 2], St[h >> 2] = 0;
            !(20 <= (0 | St[m >> 2]) >>> 0 || (0 | St[h >> 2]) >>> 0 >= (0 | St[k >> 2]) >>> 0);

          )
            (i = 0 | St[h >> 2]),
              (St[h >> 2] = i + 1),
              (n = 0 | Et[((0 | St[b >> 2]) + i) >> 0]),
              (i = 0 | St[m >> 2]),
              (St[m >> 2] = i + 1),
              (Et[(92 + (0 | St[u >> 2]) + i) >> 0] = n)
          if (
            ((St[(88 + (0 | St[u >> 2])) >> 2] = St[m >> 2]), ((0 | St[m >> 2]) >>> 0 < 20) | (0 != (0 | St[d >> 2])))
          ) {
            if (
              ((n = 0 | ye(0 | St[u >> 2], (92 + (0 | St[u >> 2])) | 0, 0 | St[m >> 2])),
              (St[p >> 2] = n),
              !(0 | St[p >> 2]))
            ) {
              w = 40
              break
            }
            if ((0 != (0 | St[d >> 2])) & (2 != (0 | St[p >> 2]))) {
              w = 42
              break
            }
          }
          if (
            ((St[(24 + (0 | St[u >> 2])) >> 2] = 92 + (0 | St[u >> 2])),
            0 | ve(0 | St[u >> 2], 0 | St[s >> 2], 0 | St[(24 + (0 | St[u >> 2])) >> 2]))
          ) {
            w = 44
            break
          }
          ;(St[h >> 2] =
            (0 | St[h >> 2]) - ((0 | St[m >> 2]) - ((0 | St[(24 + (0 | St[u >> 2])) >> 2]) - (92 + (0 | St[u >> 2]))))),
            (n = 0 | St[f >> 2]),
            (St[n >> 2] = (0 | St[n >> 2]) + (0 | St[h >> 2])),
            (St[b >> 2] = (0 | St[b >> 2]) + (0 | St[h >> 2])),
            (St[k >> 2] = (0 | St[k >> 2]) - (0 | St[h >> 2])),
            (St[(88 + (0 | St[u >> 2])) >> 2] = 0)
        } else {
          if (((0 | St[k >> 2]) >>> 0 < 20) | (0 != (0 | St[d >> 2]))) {
            if (((i = 0 | ye(0 | St[u >> 2], 0 | St[b >> 2], 0 | St[k >> 2])), (St[S >> 2] = i), !(0 | St[S >> 2]))) {
              w = 26
              break
            }
            if ((0 != (0 | St[d >> 2])) & (2 != (0 | St[S >> 2]))) {
              w = 28
              break
            }
            St[_ >> 2] = St[b >> 2]
          } else St[_ >> 2] = (0 | St[b >> 2]) + (0 | St[k >> 2]) - 20
          if (
            ((St[(24 + (0 | St[u >> 2])) >> 2] = St[b >> 2]), 0 | ve(0 | St[u >> 2], 0 | St[s >> 2], 0 | St[_ >> 2]))
          ) {
            w = 32
            break
          }
          ;(St[E >> 2] = (0 | St[(24 + (0 | St[u >> 2])) >> 2]) - (0 | St[b >> 2])),
            (i = 0 | St[f >> 2]),
            (St[i >> 2] = (0 | St[i >> 2]) + (0 | St[E >> 2])),
            (St[b >> 2] = (0 | St[b >> 2]) + (0 | St[E >> 2])),
            (St[k >> 2] = (0 | St[k >> 2]) - (0 | St[E >> 2]))
        }
      }
      switch (0 | w) {
        case 8:
          return (St[St[c >> 2] >> 2] = 3), (y = (St[a >> 2] = 0) | St[a >> 2]), (pt = v), 0 | y
        case 10:
          return (St[a >> 2] = 1), (y = 0 | St[a >> 2]), (pt = v), 0 | y
        case 15:
          return (St[St[c >> 2] >> 2] = 4), (y = (St[a >> 2] = 0) | St[a >> 2]), (pt = v), 0 | y
        case 17:
          return (St[St[c >> 2] >> 2] = 2), (y = (St[a >> 2] = 0) | St[a >> 2]), (pt = v), 0 | y
        case 19:
          return (St[St[c >> 2] >> 2] = 2), (St[a >> 2] = 1), (y = 0 | St[a >> 2]), (pt = v), 0 | y
        case 26:
          return (
            Je((92 + (0 | St[u >> 2])) | 0, 0 | St[b >> 2], 0 | St[k >> 2]),
            (St[(88 + (0 | St[u >> 2])) >> 2] = St[k >> 2]),
            (b = 0 | St[f >> 2]),
            (St[b >> 2] = (0 | St[b >> 2]) + (0 | St[k >> 2])),
            (St[St[c >> 2] >> 2] = 3),
            (y = (St[a >> 2] = 0) | St[a >> 2]),
            (pt = v),
            0 | y
          )
        case 28:
          return (St[St[c >> 2] >> 2] = 2), (St[a >> 2] = 1), (y = 0 | St[a >> 2]), (pt = v), 0 | y
        case 32:
          return (St[a >> 2] = 1), (y = 0 | St[a >> 2]), (pt = v), 0 | y
        case 40:
          return (
            (k = 0 | St[f >> 2]),
            (St[k >> 2] = (0 | St[k >> 2]) + (0 | St[h >> 2])),
            (St[St[c >> 2] >> 2] = 3),
            (y = (St[a >> 2] = 0) | St[a >> 2]),
            (pt = v),
            0 | y
          )
        case 42:
          return (St[St[c >> 2] >> 2] = 2), (St[a >> 2] = 1), (y = 0 | St[a >> 2]), (pt = v), 0 | y
        case 44:
          return (St[a >> 2] = 1), (y = 0 | St[a >> 2]), (pt = v), 0 | y
        case 46:
          return (
            0 | St[(F + 32) >> 2] || (St[St[c >> 2] >> 2] = 1),
            (St[a >> 2] = 0 == (0 | St[(32 + (0 | St[u >> 2])) >> 2]) ? 0 : 1),
            (y = 0 | St[a >> 2]),
            (pt = v),
            0 | y
          )
      }
      return 0
    }
    function we(e, r) {
      ;(e |= 0), (r |= 0)
      var t,
        n,
        i,
        o,
        a,
        u,
        s = 0,
        f = 0,
        l = pt
      if (
        ((0 | bt) <= (0 | (pt = (pt + 32) | 0)) && yt(32),
        (s = (l + 20) | 0),
        (n = (l + 16) | 0),
        (i = (l + 12) | 0),
        (o = (l + 8) | 0),
        (a = (l + 4) | 0),
        (St[(t = ((u = l) + 24) | 0) >> 2] = e),
        (St[s >> 2] = r),
        0 | St[(72 + (0 | St[t >> 2])) >> 2])
      )
        if (274 <= (0 | St[(72 + (0 | St[t >> 2])) >> 2]) >>> 0) pt = l
        else {
          for (
            St[n >> 2] = St[(20 + (0 | St[t >> 2])) >> 2],
              St[i >> 2] = St[(36 + (0 | St[t >> 2])) >> 2],
              St[o >> 2] = St[(40 + (0 | St[t >> 2])) >> 2],
              St[a >> 2] = St[(72 + (0 | St[t >> 2])) >> 2],
              St[u >> 2] = St[(56 + (0 | St[t >> 2])) >> 2],
              (((0 | St[s >> 2]) - (0 | St[i >> 2])) | 0) >>> 0 < (0 | St[a >> 2]) >>> 0 &&
                (St[a >> 2] = (0 | St[s >> 2]) - (0 | St[i >> 2])),
              0 == (0 | St[(48 + (0 | St[t >> 2])) >> 2]) &&
                (((0 | St[(12 + (0 | St[t >> 2])) >> 2]) - (0 | St[(44 + (0 | St[t >> 2])) >> 2])) | 0) >>> 0 <=
                  (0 | St[a >> 2]) >>> 0 &&
                (St[(48 + (0 | St[t >> 2])) >> 2] = St[(12 + (0 | St[t >> 2])) >> 2]),
              s = (44 + (0 | St[t >> 2])) | 0,
              St[s >> 2] = (0 | St[s >> 2]) + (0 | St[a >> 2]),
              s = (72 + (0 | St[t >> 2])) | 0,
              St[s >> 2] = (0 | St[s >> 2]) - (0 | St[a >> 2]);
            (s = 0 | St[a >> 2]), (St[a >> 2] = s + -1), (f = 0 | St[i >> 2]), s;

          )
            (Et[((0 | St[n >> 2]) + (0 | St[i >> 2])) >> 0] =
              0 |
              Et[
                ((0 | St[n >> 2]) +
                  (f - (0 | St[u >> 2]) + ((0 | St[i >> 2]) >>> 0 < (0 | St[u >> 2]) >>> 0 ? 0 | St[o >> 2] : 0))) >>
                  0
              ]),
              (St[i >> 2] = 1 + (0 | St[i >> 2]))
          ;(St[(36 + (0 | St[t >> 2])) >> 2] = f), (pt = l)
        }
      else pt = l
    }
    function ye(e, r, t) {
      ;(e |= 0), (r |= 0), (t |= 0)
      var n,
        i,
        o,
        a,
        u,
        s,
        f,
        l,
        c,
        d,
        E,
        _,
        S,
        m,
        h,
        p,
        b,
        k,
        F,
        w,
        y,
        v,
        M,
        O,
        A = 0,
        R = 0,
        g = 0,
        T = 0,
        N = 0,
        D = 0,
        P = 0,
        C = pt
      ;(0 | bt) <= (0 | (pt = (pt + 112) | 0)) && yt(112),
        (n = (C + 104) | 0),
        (o = (C + 96) | 0),
        (A = (C + 92) | 0),
        (a = (C + 88) | 0),
        (u = (C + 84) | 0),
        (s = (C + 80) | 0),
        (f = (C + 76) | 0),
        (l = (C + 72) | 0),
        (c = (C + 68) | 0),
        (d = (C + 64) | 0),
        (E = (C + 60) | 0),
        (_ = (C + 56) | 0),
        (S = (C + 52) | 0),
        (m = (C + 48) | 0),
        (h = (C + 44) | 0),
        (p = (C + 40) | 0),
        (R = (C + 36) | 0),
        (g = (C + 32) | 0),
        (b = (C + 28) | 0),
        (k = (C + 24) | 0),
        (F = (C + 20) | 0),
        (w = (C + 16) | 0),
        (y = (C + 12) | 0),
        (v = (C + 8) | 0),
        (M = (C + 4) | 0),
        (St[(i = ((O = C) + 100) | 0) >> 2] = e),
        (St[o >> 2] = r),
        (St[A >> 2] = t),
        (St[a >> 2] = St[(28 + (0 | St[i >> 2])) >> 2]),
        (St[u >> 2] = St[(32 + (0 | St[i >> 2])) >> 2]),
        (St[s >> 2] = (0 | St[o >> 2]) + (0 | St[A >> 2])),
        (St[f >> 2] = St[(16 + (0 | St[i >> 2])) >> 2]),
        (St[l >> 2] = St[(52 + (0 | St[i >> 2])) >> 2]),
        (St[S >> 2] = St[(44 + (0 | St[i >> 2])) >> 2] & ((1 << St[(8 + (0 | St[i >> 2])) >> 2]) - 1)),
        (St[d >> 2] = (0 | St[f >> 2]) + ((St[l >> 2] << 4) << 1) + (St[S >> 2] << 1)),
        (St[_ >> 2] = re[St[d >> 2] >> 1])
      do {
        if ((0 | St[a >> 2]) >>> 0 < 16777216) {
          if ((0 | St[o >> 2]) >>> 0 < (0 | St[s >> 2]) >>> 0) {
            ;(St[a >> 2] = St[a >> 2] << 8),
              (A = St[u >> 2] << 8),
              (t = 0 | St[o >> 2]),
              (St[o >> 2] = t + 1),
              (St[u >> 2] = 0 | A | mt[t >> 0])
            break
          }
          return (T = (St[n >> 2] = 0) | St[n >> 2]), (pt = C), 0 | T
        }
      } while (0)
      ;(t = 0 | wt((0 | St[a >> 2]) >>> 11, 0 | St[_ >> 2])), (St[E >> 2] = t), (t = 0 | St[E >> 2])
      e: do {
        if ((0 | St[u >> 2]) >>> 0 >= (0 | St[E >> 2]) >>> 0) {
          ;(St[a >> 2] = (0 | St[a >> 2]) - t),
            (St[u >> 2] = (0 | St[u >> 2]) - (0 | St[E >> 2])),
            (St[d >> 2] = 384 + (0 | St[f >> 2]) + (St[l >> 2] << 1)),
            (St[_ >> 2] = re[St[d >> 2] >> 1])
          do {
            if ((0 | St[a >> 2]) >>> 0 < 16777216) {
              if ((0 | St[o >> 2]) >>> 0 < (0 | St[s >> 2]) >>> 0) {
                ;(St[a >> 2] = St[a >> 2] << 8),
                  (A = St[u >> 2] << 8),
                  (r = 0 | St[o >> 2]),
                  (St[o >> 2] = r + 1),
                  (St[u >> 2] = 0 | A | mt[r >> 0])
                break
              }
              return (T = (St[n >> 2] = 0) | St[n >> 2]), (pt = C), 0 | T
            }
          } while (0)
          if (
            ((r = 0 | wt((0 | St[a >> 2]) >>> 11, 0 | St[_ >> 2])),
            (St[E >> 2] = r),
            (r = 0 | St[E >> 2]),
            (0 | St[u >> 2]) >>> 0 < (0 | St[E >> 2]) >>> 0)
          )
            (St[a >> 2] = r), (St[l >> 2] = 0), (St[d >> 2] = 1636 + (0 | St[f >> 2])), (St[c >> 2] = 2)
          else {
            ;(St[a >> 2] = (0 | St[a >> 2]) - r),
              (St[u >> 2] = (0 | St[u >> 2]) - (0 | St[E >> 2])),
              (St[c >> 2] = 3),
              (St[d >> 2] = 408 + (0 | St[f >> 2]) + (St[l >> 2] << 1)),
              (St[_ >> 2] = re[St[d >> 2] >> 1])
            do {
              if ((0 | St[a >> 2]) >>> 0 < 16777216) {
                if ((0 | St[o >> 2]) >>> 0 < (0 | St[s >> 2]) >>> 0) {
                  ;(St[a >> 2] = St[a >> 2] << 8),
                    (r = St[u >> 2] << 8),
                    (A = 0 | St[o >> 2]),
                    (St[o >> 2] = A + 1),
                    (St[u >> 2] = 0 | r | mt[A >> 0])
                  break
                }
                return (T = (St[n >> 2] = 0) | St[n >> 2]), (pt = C), 0 | T
              }
            } while (0)
            ;(A = 0 | wt((0 | St[a >> 2]) >>> 11, 0 | St[_ >> 2])), (St[E >> 2] = A), (A = 0 | St[E >> 2])
            do {
              if ((0 | St[u >> 2]) >>> 0 >= (0 | St[E >> 2]) >>> 0) {
                ;(St[a >> 2] = (0 | St[a >> 2]) - A),
                  (St[u >> 2] = (0 | St[u >> 2]) - (0 | St[E >> 2])),
                  (St[d >> 2] = 432 + (0 | St[f >> 2]) + (St[l >> 2] << 1)),
                  (St[_ >> 2] = re[St[d >> 2] >> 1])
                do {
                  if ((0 | St[a >> 2]) >>> 0 < 16777216) {
                    if ((0 | St[o >> 2]) >>> 0 < (0 | St[s >> 2]) >>> 0) {
                      ;(St[a >> 2] = St[a >> 2] << 8),
                        (r = St[u >> 2] << 8),
                        (e = 0 | St[o >> 2]),
                        (St[o >> 2] = e + 1),
                        (St[u >> 2] = 0 | r | mt[e >> 0])
                      break
                    }
                    return (T = (St[n >> 2] = 0) | St[n >> 2]), (pt = C), 0 | T
                  }
                } while (0)
                if (
                  ((e = 0 | wt((0 | St[a >> 2]) >>> 11, 0 | St[_ >> 2])),
                  (St[E >> 2] = e),
                  (e = 0 | St[E >> 2]),
                  (0 | St[u >> 2]) >>> 0 < (0 | St[E >> 2]) >>> 0)
                ) {
                  St[a >> 2] = e
                  break
                }
                ;(St[a >> 2] = (0 | St[a >> 2]) - e),
                  (St[u >> 2] = (0 | St[u >> 2]) - (0 | St[E >> 2])),
                  (St[d >> 2] = 456 + (0 | St[f >> 2]) + (St[l >> 2] << 1)),
                  (St[_ >> 2] = re[St[d >> 2] >> 1])
                do {
                  if ((0 | St[a >> 2]) >>> 0 < 16777216) {
                    if ((0 | St[o >> 2]) >>> 0 < (0 | St[s >> 2]) >>> 0) {
                      ;(St[a >> 2] = St[a >> 2] << 8),
                        (e = St[u >> 2] << 8),
                        (r = 0 | St[o >> 2]),
                        (St[o >> 2] = r + 1),
                        (St[u >> 2] = 0 | e | mt[r >> 0])
                      break
                    }
                    return (T = (St[n >> 2] = 0) | St[n >> 2]), (pt = C), 0 | T
                  }
                } while (0)
                if (
                  ((r = 0 | wt((0 | St[a >> 2]) >>> 11, 0 | St[_ >> 2])),
                  (St[E >> 2] = r),
                  (r = 0 | St[E >> 2]),
                  (0 | St[u >> 2]) >>> 0 < (0 | St[E >> 2]) >>> 0)
                ) {
                  St[a >> 2] = r
                  break
                }
                ;(St[a >> 2] = (0 | St[a >> 2]) - r), (St[u >> 2] = (0 | St[u >> 2]) - (0 | St[E >> 2]))
                break
              }
              ;(St[a >> 2] = A),
                (St[d >> 2] = 480 + (0 | St[f >> 2]) + ((St[l >> 2] << 4) << 1) + (St[S >> 2] << 1)),
                (St[_ >> 2] = re[St[d >> 2] >> 1])
              do {
                if ((0 | St[a >> 2]) >>> 0 < 16777216) {
                  if ((0 | St[o >> 2]) >>> 0 < (0 | St[s >> 2]) >>> 0) {
                    ;(St[a >> 2] = St[a >> 2] << 8),
                      (r = St[u >> 2] << 8),
                      (e = 0 | St[o >> 2]),
                      (St[o >> 2] = e + 1),
                      (St[u >> 2] = 0 | r | mt[e >> 0])
                    break
                  }
                  return (T = (St[n >> 2] = 0) | St[n >> 2]), (pt = C), 0 | T
                }
              } while (0)
              if (
                ((e = 0 | wt((0 | St[a >> 2]) >>> 11, 0 | St[_ >> 2])),
                (St[E >> 2] = e),
                (e = 0 | St[E >> 2]),
                (0 | St[u >> 2]) >>> 0 >= (0 | St[E >> 2]) >>> 0)
              ) {
                ;(St[a >> 2] = (0 | St[a >> 2]) - e), (St[u >> 2] = (0 | St[u >> 2]) - (0 | St[E >> 2]))
                break
              }
              St[a >> 2] = e
              do {
                if ((0 | St[a >> 2]) >>> 0 < 16777216) {
                  if ((0 | St[o >> 2]) >>> 0 < (0 | St[s >> 2]) >>> 0) {
                    ;(St[a >> 2] = St[a >> 2] << 8),
                      (e = St[u >> 2] << 8),
                      (r = 0 | St[o >> 2]),
                      (St[o >> 2] = r + 1),
                      (St[u >> 2] = 0 | e | mt[r >> 0])
                    break
                  }
                  return (T = (St[n >> 2] = 0) | St[n >> 2]), (pt = C), 0 | T
                }
              } while (0)
              return (St[n >> 2] = 3), (T = 0 | St[n >> 2]), (pt = C), 0 | T
            } while (0)
            ;(St[l >> 2] = 12), (St[d >> 2] = 2664 + (0 | St[f >> 2]))
          }
          ;(St[y >> 2] = St[d >> 2]), (St[_ >> 2] = re[St[y >> 2] >> 1])
          do {
            if ((0 | St[a >> 2]) >>> 0 < 16777216) {
              if ((0 | St[o >> 2]) >>> 0 < (0 | St[s >> 2]) >>> 0) {
                ;(St[a >> 2] = St[a >> 2] << 8),
                  (A = St[u >> 2] << 8),
                  (r = 0 | St[o >> 2]),
                  (St[o >> 2] = r + 1),
                  (St[u >> 2] = 0 | A | mt[r >> 0])
                break
              }
              return (T = (St[n >> 2] = 0) | St[n >> 2]), (pt = C), 0 | T
            }
          } while (0)
          ;(r = 0 | wt((0 | St[a >> 2]) >>> 11, 0 | St[_ >> 2])), (St[E >> 2] = r), (r = 0 | St[E >> 2])
          do {
            if ((0 | St[u >> 2]) >>> 0 >= (0 | St[E >> 2]) >>> 0) {
              ;(St[a >> 2] = (0 | St[a >> 2]) - r),
                (St[u >> 2] = (0 | St[u >> 2]) - (0 | St[E >> 2])),
                (St[y >> 2] = 2 + (0 | St[d >> 2])),
                (St[_ >> 2] = re[St[y >> 2] >> 1])
              do {
                if ((0 | St[a >> 2]) >>> 0 < 16777216) {
                  if ((0 | St[o >> 2]) >>> 0 < (0 | St[s >> 2]) >>> 0) {
                    ;(St[a >> 2] = St[a >> 2] << 8),
                      (A = St[u >> 2] << 8),
                      (e = 0 | St[o >> 2]),
                      (St[o >> 2] = e + 1),
                      (St[u >> 2] = 0 | A | mt[e >> 0])
                    break
                  }
                  return (T = (St[n >> 2] = 0) | St[n >> 2]), (pt = C), 0 | T
                }
              } while (0)
              if (
                ((e = 0 | wt((0 | St[a >> 2]) >>> 11, 0 | St[_ >> 2])),
                (St[E >> 2] = e),
                (e = 0 | St[E >> 2]),
                (0 | St[u >> 2]) >>> 0 < (0 | St[E >> 2]) >>> 0)
              ) {
                ;(St[a >> 2] = e),
                  (St[y >> 2] = 260 + (0 | St[d >> 2]) + ((St[S >> 2] << 3) << 1)),
                  (St[w >> 2] = 8),
                  (St[F >> 2] = 8)
                break
              }
              ;(St[a >> 2] = (0 | St[a >> 2]) - e),
                (St[u >> 2] = (0 | St[u >> 2]) - (0 | St[E >> 2])),
                (St[y >> 2] = 516 + (0 | St[d >> 2])),
                (St[w >> 2] = 16),
                (St[F >> 2] = 256)
              break
            }
          } while (
            ((St[a >> 2] = r),
            (St[y >> 2] = 4 + (0 | St[d >> 2]) + ((St[S >> 2] << 3) << 1)),
            (St[w >> 2] = 0),
            (St[F >> 2] = 8),
            0)
          )
          St[k >> 2] = 1
          do {
            if (((St[_ >> 2] = re[((0 | St[y >> 2]) + (St[k >> 2] << 1)) >> 1]), (0 | St[a >> 2]) >>> 0 < 16777216)) {
              if ((0 | St[o >> 2]) >>> 0 >= (0 | St[s >> 2]) >>> 0) {
                N = 86
                break
              }
              ;(St[a >> 2] = St[a >> 2] << 8),
                (r = St[u >> 2] << 8),
                (e = 0 | St[o >> 2]),
                (St[o >> 2] = e + 1),
                (St[u >> 2] = 0 | r | mt[e >> 0])
            }
          } while (
            ((e = 0 | wt((0 | St[a >> 2]) >>> 11, 0 | St[_ >> 2])),
            (St[E >> 2] = e),
            (e = 0 | St[E >> 2]),
            (0 | St[u >> 2]) >>> 0 < (0 | St[E >> 2]) >>> 0
              ? ((St[a >> 2] = e), (St[k >> 2] = (0 | St[k >> 2]) + (0 | St[k >> 2])))
              : ((St[a >> 2] = (0 | St[a >> 2]) - e),
                (St[u >> 2] = (0 | St[u >> 2]) - (0 | St[E >> 2])),
                (St[k >> 2] = (0 | St[k >> 2]) + (0 | St[k >> 2]) + 1)),
            (0 | St[k >> 2]) >>> 0 < (0 | St[F >> 2]) >>> 0)
          )
          if (86 == (0 | N)) return (T = (St[n >> 2] = 0) | St[n >> 2]), (pt = C), 0 | T
          if (
            ((St[k >> 2] = (0 | St[k >> 2]) - (0 | St[F >> 2])),
            (St[k >> 2] = (0 | St[k >> 2]) + (0 | St[w >> 2])),
            (0 | St[l >> 2]) >>> 0 < 4)
          ) {
            ;(St[d >> 2] = 864 + (0 | St[f >> 2]) + ((((0 | St[k >> 2]) >>> 0 < 4 ? 0 | St[k >> 2] : 3) << 6) << 1)),
              (St[v >> 2] = 1)
            do {
              if (((St[_ >> 2] = re[((0 | St[d >> 2]) + (St[v >> 2] << 1)) >> 1]), (0 | St[a >> 2]) >>> 0 < 16777216)) {
                if ((0 | St[o >> 2]) >>> 0 >= (0 | St[s >> 2]) >>> 0) {
                  N = 96
                  break
                }
                ;(St[a >> 2] = St[a >> 2] << 8),
                  (e = St[u >> 2] << 8),
                  (r = 0 | St[o >> 2]),
                  (St[o >> 2] = r + 1),
                  (St[u >> 2] = 0 | e | mt[r >> 0])
              }
            } while (
              ((r = 0 | wt((0 | St[a >> 2]) >>> 11, 0 | St[_ >> 2])),
              (St[E >> 2] = r),
              (r = 0 | St[E >> 2]),
              (0 | St[u >> 2]) >>> 0 < (0 | St[E >> 2]) >>> 0
                ? ((St[a >> 2] = r), (St[v >> 2] = (0 | St[v >> 2]) + (0 | St[v >> 2])))
                : ((St[a >> 2] = (0 | St[a >> 2]) - r),
                  (St[u >> 2] = (0 | St[u >> 2]) - (0 | St[E >> 2])),
                  (St[v >> 2] = (0 | St[v >> 2]) + (0 | St[v >> 2]) + 1)),
              (0 | St[v >> 2]) >>> 0 < 64)
            )
            if (96 == (0 | N)) return (T = (St[n >> 2] = 0) | St[n >> 2]), (pt = C), 0 | T
            if (((St[v >> 2] = (0 | St[v >> 2]) - 64), 4 <= (0 | St[v >> 2]) >>> 0)) {
              St[M >> 2] = ((0 | St[v >> 2]) >>> 1) - 1
              do {
                if (!((0 | St[v >> 2]) >>> 0 < 14)) {
                  for (St[M >> 2] = (0 | St[M >> 2]) - 4; ; ) {
                    if ((0 | St[a >> 2]) >>> 0 < 16777216) {
                      if ((0 | St[o >> 2]) >>> 0 >= (0 | St[s >> 2]) >>> 0) break
                      ;(St[a >> 2] = St[a >> 2] << 8),
                        (r = St[u >> 2] << 8),
                        (e = 0 | St[o >> 2]),
                        (St[o >> 2] = e + 1),
                        (St[u >> 2] = 0 | r | mt[e >> 0])
                    }
                    if (
                      ((St[a >> 2] = (0 | St[a >> 2]) >>> 1),
                      (St[u >> 2] =
                        (0 | St[u >> 2]) - (St[a >> 2] & (((((0 | St[u >> 2]) - (0 | St[a >> 2])) | 0) >>> 31) - 1))),
                      (e = ((0 | St[M >> 2]) - 1) | 0),
                      !(St[M >> 2] = e))
                    ) {
                      N = 111
                      break
                    }
                  }
                  if (111 != (0 | N)) return (T = (St[n >> 2] = 0) | St[n >> 2]), (pt = C), 0 | T
                  ;(St[d >> 2] = 1604 + (0 | St[f >> 2])), (St[M >> 2] = 4)
                  break
                }
              } while (
                ((St[d >> 2] =
                  1376 +
                  (0 | St[f >> 2]) +
                  (((2 | (1 & St[v >> 2])) << St[M >> 2]) << 1) +
                  ((0 - (0 | St[v >> 2])) << 1) -
                  2),
                0)
              )
              for (St[O >> 2] = 1; ; ) {
                if (
                  ((St[_ >> 2] = re[((0 | St[d >> 2]) + (St[O >> 2] << 1)) >> 1]), (0 | St[a >> 2]) >>> 0 < 16777216)
                ) {
                  if ((0 | St[o >> 2]) >>> 0 >= (0 | St[s >> 2]) >>> 0) break
                  ;(St[a >> 2] = St[a >> 2] << 8),
                    (e = St[u >> 2] << 8),
                    (r = 0 | St[o >> 2]),
                    (St[o >> 2] = r + 1),
                    (St[u >> 2] = 0 | e | mt[r >> 0])
                }
                if (
                  ((r = 0 | wt((0 | St[a >> 2]) >>> 11, 0 | St[_ >> 2])),
                  (St[E >> 2] = r),
                  (r = 0 | St[E >> 2]),
                  (0 | St[u >> 2]) >>> 0 < (0 | St[E >> 2]) >>> 0
                    ? ((St[a >> 2] = r), (St[O >> 2] = (0 | St[O >> 2]) + (0 | St[O >> 2])))
                    : ((St[a >> 2] = (0 | St[a >> 2]) - r),
                      (St[u >> 2] = (0 | St[u >> 2]) - (0 | St[E >> 2])),
                      (St[O >> 2] = (0 | St[O >> 2]) + (0 | St[O >> 2]) + 1)),
                  (r = ((0 | St[M >> 2]) - 1) | 0),
                  !(St[M >> 2] = r))
                )
                  break e
              }
              return (T = (St[n >> 2] = 0) | St[n >> 2]), (pt = C), 0 | T
            }
          }
        } else {
          ;(St[a >> 2] = t),
            (St[d >> 2] = 3692 + (0 | St[f >> 2])),
            (0 | St[(48 + (0 | St[i >> 2])) >> 2] || 0 | St[(44 + (0 | St[i >> 2])) >> 2]) &&
              ((r = 0 | St[i >> 2]),
              (D = 0 | St[(36 + (0 | St[i >> 2])) >> 2] ? 0 | St[(r + 36) >> 2] : 0 | St[(r + 40) >> 2]),
              (St[d >> 2] =
                (0 | St[d >> 2]) +
                ((768 *
                  ((((St[(44 + (0 | St[i >> 2])) >> 2] & ((1 << St[(4 + (0 | St[i >> 2])) >> 2]) - 1)) <<
                    St[St[i >> 2] >> 2]) +
                    ((0 | mt[((0 | St[(20 + (0 | St[i >> 2])) >> 2]) + (D - 1)) >> 0]) >>
                      (8 - (0 | St[St[i >> 2] >> 2])))) |
                    0)) <<
                  1)))
          r: do {
            if ((0 | St[l >> 2]) >>> 0 < 7) {
              for (St[m >> 2] = 1; ; ) {
                if (
                  ((St[_ >> 2] = re[((0 | St[d >> 2]) + (St[m >> 2] << 1)) >> 1]), (0 | St[a >> 2]) >>> 0 < 16777216)
                ) {
                  if ((0 | St[o >> 2]) >>> 0 >= (0 | St[s >> 2]) >>> 0) break
                  ;(St[a >> 2] = St[a >> 2] << 8),
                    (r = St[u >> 2] << 8),
                    (e = 0 | St[o >> 2]),
                    (St[o >> 2] = e + 1),
                    (St[u >> 2] = 0 | r | mt[e >> 0])
                }
                if (
                  ((e = 0 | wt((0 | St[a >> 2]) >>> 11, 0 | St[_ >> 2])),
                  (St[E >> 2] = e),
                  (e = 0 | St[E >> 2]),
                  (0 | St[u >> 2]) >>> 0 < (0 | St[E >> 2]) >>> 0
                    ? ((St[a >> 2] = e), (St[m >> 2] = (0 | St[m >> 2]) + (0 | St[m >> 2])))
                    : ((St[a >> 2] = (0 | St[a >> 2]) - e),
                      (St[u >> 2] = (0 | St[u >> 2]) - (0 | St[E >> 2])),
                      (St[m >> 2] = (0 | St[m >> 2]) + (0 | St[m >> 2]) + 1)),
                  256 <= (0 | St[m >> 2]) >>> 0)
                )
                  break r
              }
              return (T = (St[n >> 2] = 0) | St[n >> 2]), (pt = C), 0 | T
            }
            for (
              P =
                (0 | St[(36 + (0 | St[i >> 2])) >> 2]) >>> 0 < (0 | St[(56 + (0 | St[i >> 2])) >> 2]) >>> 0
                  ? 0 | St[(40 + (0 | St[i >> 2])) >> 2]
                  : 0,
                St[h >> 2] =
                  mt[
                    ((0 | St[(20 + (0 | St[i >> 2])) >> 2]) +
                      ((0 | St[(36 + (0 | St[i >> 2])) >> 2]) - (0 | St[(56 + (0 | St[i >> 2])) >> 2]) + P)) >>
                      0
                  ],
                St[p >> 2] = 256,
                St[R >> 2] = 1;
              ;

            ) {
              if (
                ((St[h >> 2] = St[h >> 2] << 1),
                (St[g >> 2] = St[h >> 2] & St[p >> 2]),
                (St[b >> 2] = (0 | St[d >> 2]) + (St[p >> 2] << 1) + (St[g >> 2] << 1) + (St[R >> 2] << 1)),
                (St[_ >> 2] = re[St[b >> 2] >> 1]),
                (0 | St[a >> 2]) >>> 0 < 16777216)
              ) {
                if ((0 | St[o >> 2]) >>> 0 >= (0 | St[s >> 2]) >>> 0) break
                ;(St[a >> 2] = St[a >> 2] << 8),
                  (e = St[u >> 2] << 8),
                  (r = 0 | St[o >> 2]),
                  (St[o >> 2] = r + 1),
                  (St[u >> 2] = 0 | e | mt[r >> 0])
              }
              if (
                ((r = 0 | wt((0 | St[a >> 2]) >>> 11, 0 | St[_ >> 2])),
                (St[E >> 2] = r),
                (r = 0 | St[E >> 2]),
                (0 | St[u >> 2]) >>> 0 < (0 | St[E >> 2]) >>> 0
                  ? ((St[a >> 2] = r),
                    (St[R >> 2] = (0 | St[R >> 2]) + (0 | St[R >> 2])),
                    (St[p >> 2] = St[p >> 2] & ~St[g >> 2]))
                  : ((St[a >> 2] = (0 | St[a >> 2]) - r),
                    (St[u >> 2] = (0 | St[u >> 2]) - (0 | St[E >> 2])),
                    (St[R >> 2] = (0 | St[R >> 2]) + (0 | St[R >> 2]) + 1),
                    (St[p >> 2] = St[p >> 2] & St[g >> 2])),
                256 <= (0 | St[R >> 2]) >>> 0)
              )
                break r
            }
            return (T = (St[n >> 2] = 0) | St[n >> 2]), (pt = C), 0 | T
          } while (0)
          St[c >> 2] = 1
        }
      } while (0)
      do {
        if ((0 | St[a >> 2]) >>> 0 < 16777216) {
          if ((0 | St[o >> 2]) >>> 0 < (0 | St[s >> 2]) >>> 0) {
            ;(St[a >> 2] = St[a >> 2] << 8),
              (R = St[u >> 2] << 8),
              (g = 0 | St[o >> 2]),
              (St[o >> 2] = g + 1),
              (St[u >> 2] = 0 | R | mt[g >> 0])
            break
          }
          return (T = (St[n >> 2] = 0) | St[n >> 2]), (pt = C), 0 | T
        }
      } while (0)
      return (St[n >> 2] = St[c >> 2]), (T = 0 | St[n >> 2]), (pt = C), 0 | T
    }
    function ve(e, r, t) {
      ;(e |= 0), (r |= 0), (t |= 0)
      var n,
        i,
        o,
        a,
        u,
        s,
        f,
        l = 0,
        c = 0,
        d = pt
      ;(0 | bt) <= (0 | (pt = (pt + 32) | 0)) && yt(32),
        (n = (d + 24) | 0),
        (o = (d + 16) | 0),
        (a = (d + 12) | 0),
        (u = (d + 8) | 0),
        (s = (d + 4) | 0),
        (St[(i = ((f = d) + 20) | 0) >> 2] = e),
        (St[o >> 2] = r),
        (St[a >> 2] = t)
      do {
        if (
          ((St[u >> 2] = St[o >> 2]),
          0 == (0 | St[(48 + (0 | St[i >> 2])) >> 2]) &&
            ((St[s >> 2] = (0 | St[(12 + (0 | St[i >> 2])) >> 2]) - (0 | St[(44 + (0 | St[i >> 2])) >> 2])),
            (((0 | St[o >> 2]) - (0 | St[(36 + (0 | St[i >> 2])) >> 2])) | 0) >>> 0 > (0 | St[s >> 2]) >>> 0) &&
            (St[u >> 2] = (0 | St[(36 + (0 | St[i >> 2])) >> 2]) + (0 | St[s >> 2])),
          (t =
            0 |
            (function (e, r, t) {
              ;(e |= 0), (r |= 0), (t |= 0)
              var n = 0,
                i = 0,
                o = 0,
                a = 0,
                u = 0,
                s = 0,
                f = 0,
                l = 0,
                c = 0,
                d = 0,
                E = 0,
                _ = 0,
                S = 0,
                m = 0,
                h = 0,
                p = 0,
                b = 0,
                k = 0,
                F = 0,
                w = 0,
                y = 0,
                v = 0,
                M = 0,
                O = 0,
                A = 0,
                R = 0,
                g = 0,
                T = 0,
                N = 0,
                D = 0,
                P = 0,
                C = 0,
                I = 0,
                L = 0,
                x = 0,
                B = 0,
                H = 0,
                U = 0,
                z = 0,
                Y = 0,
                V = 0,
                K = 0,
                W = 0,
                j = 0,
                X = 0,
                G = 0,
                q = 0,
                Q = 0,
                Z = 0,
                J = 0,
                $ = 0,
                ee = 0
              ;(0 | (pt = ((n = pt) + 192) | 0)) >= (0 | bt) && yt(192)
              ;(i = (n + 188) | 0),
                (a = (n + 180) | 0),
                (u = (n + 176) | 0),
                (s = (n + 172) | 0),
                (f = (n + 168) | 0),
                (l = (n + 164) | 0),
                (c = (n + 160) | 0),
                (d = (n + 156) | 0),
                (E = (n + 152) | 0),
                (_ = (n + 148) | 0),
                (S = (n + 144) | 0),
                (m = (n + 140) | 0),
                (h = (n + 136) | 0),
                (p = (n + 132) | 0),
                (b = (n + 128) | 0),
                (k = (n + 124) | 0),
                (F = (n + 120) | 0),
                (w = (n + 116) | 0),
                (y = (n + 112) | 0),
                (v = (n + 108) | 0),
                (M = (n + 104) | 0),
                (O = (n + 100) | 0),
                (A = (n + 96) | 0),
                (R = (n + 92) | 0),
                (g = (n + 88) | 0),
                (T = (n + 84) | 0),
                (N = (n + 80) | 0),
                (D = (n + 76) | 0),
                (P = (n + 72) | 0),
                (C = (n + 68) | 0),
                (I = (n + 64) | 0),
                (L = (n + 60) | 0),
                (x = (n + 56) | 0),
                (B = (n + 52) | 0),
                (H = (n + 48) | 0),
                (U = (n + 44) | 0),
                (z = (n + 40) | 0),
                (Y = (n + 36) | 0),
                (V = (n + 32) | 0),
                (K = (n + 28) | 0),
                (W = (n + 24) | 0),
                (j = (n + 20) | 0),
                (X = (n + 16) | 0),
                (G = (n + 12) | 0),
                (q = (n + 8) | 0),
                (Q = (n + 4) | 0),
                (St[(o = ((Z = n) + 184) | 0) >> 2] = e),
                (St[a >> 2] = r),
                (St[u >> 2] = t),
                (St[s >> 2] = St[(16 + (0 | St[o >> 2])) >> 2]),
                (St[f >> 2] = St[(52 + (0 | St[o >> 2])) >> 2]),
                (St[l >> 2] = St[(56 + (0 | St[o >> 2])) >> 2]),
                (St[c >> 2] = St[(56 + (0 | St[o >> 2]) + 4) >> 2]),
                (St[d >> 2] = St[(56 + (0 | St[o >> 2]) + 8) >> 2]),
                (St[E >> 2] = St[(56 + (0 | St[o >> 2]) + 12) >> 2]),
                (St[_ >> 2] = (1 << St[(8 + (0 | St[o >> 2])) >> 2]) - 1),
                (St[S >> 2] = (1 << St[(4 + (0 | St[o >> 2])) >> 2]) - 1),
                (St[m >> 2] = St[St[o >> 2] >> 2]),
                (St[h >> 2] = St[(20 + (0 | St[o >> 2])) >> 2]),
                (St[p >> 2] = St[(40 + (0 | St[o >> 2])) >> 2]),
                (St[b >> 2] = St[(36 + (0 | St[o >> 2])) >> 2]),
                (St[k >> 2] = St[(44 + (0 | St[o >> 2])) >> 2]),
                (St[F >> 2] = St[(48 + (0 | St[o >> 2])) >> 2]),
                (St[w >> 2] = 0),
                (St[y >> 2] = St[(24 + (0 | St[o >> 2])) >> 2]),
                (St[v >> 2] = St[(28 + (0 | St[o >> 2])) >> 2]),
                (St[M >> 2] = St[(32 + (0 | St[o >> 2])) >> 2])
              e: do {
                ;(St[g >> 2] = St[k >> 2] & St[_ >> 2]),
                  (St[O >> 2] = (0 | St[s >> 2]) + ((St[f >> 2] << 4) << 1) + (St[g >> 2] << 1)),
                  (St[R >> 2] = re[St[O >> 2] >> 1]),
                  (0 | St[v >> 2]) >>> 0 < 16777216 &&
                    ((St[v >> 2] = St[v >> 2] << 8),
                    (t = St[M >> 2] << 8),
                    (r = 0 | St[y >> 2]),
                    (St[y >> 2] = r + 1),
                    (St[M >> 2] = 0 | t | mt[r >> 0])),
                  (r = 0 | wt((0 | St[v >> 2]) >>> 11, 0 | St[R >> 2])),
                  (St[A >> 2] = r),
                  (r = 0 | St[A >> 2])
                r: do {
                  if ((0 | St[M >> 2]) >>> 0 < (0 | St[A >> 2]) >>> 0) {
                    if (
                      ((St[v >> 2] = r),
                      (_t[St[O >> 2] >> 1] = (0 | St[R >> 2]) + (((2048 - (0 | St[R >> 2])) | 0) >>> 5)),
                      (St[O >> 2] = 3692 + (0 | St[s >> 2])),
                      (0 != (0 | St[F >> 2])) | (0 != (0 | St[k >> 2])) &&
                        (St[O >> 2] =
                          (0 | St[O >> 2]) +
                          ((768 *
                            ((((St[k >> 2] & St[S >> 2]) << St[m >> 2]) +
                              ((0 |
                                mt[
                                  ((0 | St[h >> 2]) +
                                    ((0 == (0 | St[b >> 2]) ? 0 | St[p >> 2] : 0 | St[b >> 2]) - 1)) >>
                                    0
                                ]) >>
                                (8 - (0 | St[m >> 2])))) |
                              0)) <<
                            1)),
                      (0 | St[f >> 2]) >>> 0 < 7)
                    )
                      for (
                        St[f >> 2] = (0 | St[f >> 2]) - ((0 | St[f >> 2]) >>> 0 < 4 ? 0 | St[f >> 2] : 3),
                          St[T >> 2] = 1;
                        (St[R >> 2] = re[((0 | St[O >> 2]) + (St[T >> 2] << 1)) >> 1]),
                          (0 | St[v >> 2]) >>> 0 < 16777216 &&
                            ((St[v >> 2] = St[v >> 2] << 8),
                            (t = St[M >> 2] << 8),
                            (e = 0 | St[y >> 2]),
                            (St[y >> 2] = e + 1),
                            (St[M >> 2] = 0 | t | mt[e >> 0])),
                          (e = 0 | wt((0 | St[v >> 2]) >>> 11, 0 | St[R >> 2])),
                          (St[A >> 2] = e),
                          (e = 0 | St[A >> 2]),
                          (0 | St[M >> 2]) >>> 0 < (0 | St[A >> 2]) >>> 0
                            ? ((St[v >> 2] = e),
                              (_t[((0 | St[O >> 2]) + (St[T >> 2] << 1)) >> 1] =
                                (0 | St[R >> 2]) + (((2048 - (0 | St[R >> 2])) | 0) >>> 5)),
                              (St[T >> 2] = (0 | St[T >> 2]) + (0 | St[T >> 2])))
                            : ((St[v >> 2] = (0 | St[v >> 2]) - e),
                              (St[M >> 2] = (0 | St[M >> 2]) - (0 | St[A >> 2])),
                              (_t[((0 | St[O >> 2]) + (St[T >> 2] << 1)) >> 1] =
                                (0 | St[R >> 2]) - ((0 | St[R >> 2]) >>> 5)),
                              (St[T >> 2] = (0 | St[T >> 2]) + (0 | St[T >> 2]) + 1)),
                          (0 | St[T >> 2]) >>> 0 < 256;

                      );
                    else
                      for (
                        St[N >> 2] =
                          mt[
                            ((0 | St[(20 + (0 | St[o >> 2])) >> 2]) +
                              ((0 | St[b >> 2]) -
                                (0 | St[l >> 2]) +
                                ((0 | St[b >> 2]) >>> 0 < (0 | St[l >> 2]) >>> 0 ? 0 | St[p >> 2] : 0))) >>
                              0
                          ],
                          St[D >> 2] = 256,
                          St[f >> 2] = (0 | St[f >> 2]) - ((0 | St[f >> 2]) >>> 0 < 10 ? 3 : 6),
                          St[T >> 2] = 1;
                        (St[N >> 2] = St[N >> 2] << 1),
                          (St[P >> 2] = St[N >> 2] & St[D >> 2]),
                          (St[C >> 2] = (0 | St[O >> 2]) + (St[D >> 2] << 1) + (St[P >> 2] << 1) + (St[T >> 2] << 1)),
                          (St[R >> 2] = re[St[C >> 2] >> 1]),
                          (0 | St[v >> 2]) >>> 0 < 16777216 &&
                            ((St[v >> 2] = St[v >> 2] << 8),
                            (e = St[M >> 2] << 8),
                            (t = 0 | St[y >> 2]),
                            (St[y >> 2] = t + 1),
                            (St[M >> 2] = 0 | e | mt[t >> 0])),
                          (t = 0 | wt((0 | St[v >> 2]) >>> 11, 0 | St[R >> 2])),
                          (St[A >> 2] = t),
                          (t = 0 | St[A >> 2]),
                          (0 | St[M >> 2]) >>> 0 < (0 | St[A >> 2]) >>> 0
                            ? ((St[v >> 2] = t),
                              (_t[St[C >> 2] >> 1] = (0 | St[R >> 2]) + (((2048 - (0 | St[R >> 2])) | 0) >>> 5)),
                              (St[T >> 2] = (0 | St[T >> 2]) + (0 | St[T >> 2])),
                              (St[D >> 2] = St[D >> 2] & ~St[P >> 2]))
                            : ((St[v >> 2] = (0 | St[v >> 2]) - t),
                              (St[M >> 2] = (0 | St[M >> 2]) - (0 | St[A >> 2])),
                              (_t[St[C >> 2] >> 1] = (0 | St[R >> 2]) - ((0 | St[R >> 2]) >>> 5)),
                              (St[T >> 2] = (0 | St[T >> 2]) + (0 | St[T >> 2]) + 1),
                              (St[D >> 2] = St[D >> 2] & St[P >> 2])),
                          (0 | St[T >> 2]) >>> 0 < 256;

                      );
                    ;(t = 255 & St[T >> 2]),
                      (e = 0 | St[b >> 2]),
                      (St[b >> 2] = e + 1),
                      (Et[((0 | St[h >> 2]) + e) >> 0] = t),
                      (St[k >> 2] = 1 + (0 | St[k >> 2]))
                  } else {
                    if (
                      ((St[v >> 2] = (0 | St[v >> 2]) - r),
                      (St[M >> 2] = (0 | St[M >> 2]) - (0 | St[A >> 2])),
                      (_t[St[O >> 2] >> 1] = (0 | St[R >> 2]) - ((0 | St[R >> 2]) >>> 5)),
                      (St[O >> 2] = 384 + (0 | St[s >> 2]) + (St[f >> 2] << 1)),
                      (St[R >> 2] = re[St[O >> 2] >> 1]),
                      (0 | St[v >> 2]) >>> 0 < 16777216 &&
                        ((St[v >> 2] = St[v >> 2] << 8),
                        (t = St[M >> 2] << 8),
                        (e = 0 | St[y >> 2]),
                        (St[y >> 2] = e + 1),
                        (St[M >> 2] = 0 | t | mt[e >> 0])),
                      (e = 0 | wt((0 | St[v >> 2]) >>> 11, 0 | St[R >> 2])),
                      (St[A >> 2] = e),
                      (e = 0 | St[A >> 2]),
                      (0 | St[M >> 2]) >>> 0 < (0 | St[A >> 2]) >>> 0)
                    )
                      (St[v >> 2] = e),
                        (_t[St[O >> 2] >> 1] = (0 | St[R >> 2]) + (((2048 - (0 | St[R >> 2])) | 0) >>> 5)),
                        (St[f >> 2] = 12 + (0 | St[f >> 2])),
                        (St[O >> 2] = 1636 + (0 | St[s >> 2]))
                    else {
                      if (
                        ((St[v >> 2] = (0 | St[v >> 2]) - e),
                        (St[M >> 2] = (0 | St[M >> 2]) - (0 | St[A >> 2])),
                        (_t[St[O >> 2] >> 1] = (0 | St[R >> 2]) - ((0 | St[R >> 2]) >>> 5)),
                        (0 == (0 | St[F >> 2])) & (0 == (0 | St[k >> 2])))
                      ) {
                        J = 28
                        break e
                      }
                      ;(St[O >> 2] = 408 + (0 | St[s >> 2]) + (St[f >> 2] << 1)),
                        (St[R >> 2] = re[St[O >> 2] >> 1]),
                        (0 | St[v >> 2]) >>> 0 < 16777216 &&
                          ((St[v >> 2] = St[v >> 2] << 8),
                          (e = St[M >> 2] << 8),
                          (t = 0 | St[y >> 2]),
                          (St[y >> 2] = t + 1),
                          (St[M >> 2] = 0 | e | mt[t >> 0])),
                        (t = 0 | wt((0 | St[v >> 2]) >>> 11, 0 | St[R >> 2])),
                        (St[A >> 2] = t),
                        (t = 0 | St[A >> 2])
                      do {
                        if ((0 | St[M >> 2]) >>> 0 < (0 | St[A >> 2]) >>> 0) {
                          if (
                            ((St[v >> 2] = t),
                            (_t[St[O >> 2] >> 1] = (0 | St[R >> 2]) + (((2048 - (0 | St[R >> 2])) | 0) >>> 5)),
                            (St[O >> 2] = 480 + (0 | St[s >> 2]) + ((St[f >> 2] << 4) << 1) + (St[g >> 2] << 1)),
                            (St[R >> 2] = re[St[O >> 2] >> 1]),
                            (0 | St[v >> 2]) >>> 0 < 16777216 &&
                              ((St[v >> 2] = St[v >> 2] << 8),
                              (e = St[M >> 2] << 8),
                              ($ = 0 | St[y >> 2]),
                              (St[y >> 2] = $ + 1),
                              (St[M >> 2] = 0 | e | mt[$ >> 0])),
                            ($ = 0 | wt((0 | St[v >> 2]) >>> 11, 0 | St[R >> 2])),
                            (St[A >> 2] = $),
                            ($ = 0 | St[A >> 2]),
                            (0 | St[M >> 2]) >>> 0 < (0 | St[A >> 2]) >>> 0)
                          ) {
                            ;(St[v >> 2] = $),
                              (_t[St[O >> 2] >> 1] = (0 | St[R >> 2]) + (((2048 - (0 | St[R >> 2])) | 0) >>> 5)),
                              (Et[((0 | St[h >> 2]) + (0 | St[b >> 2])) >> 0] =
                                0 |
                                Et[
                                  ((0 | St[h >> 2]) +
                                    ((0 | St[b >> 2]) -
                                      (0 | St[l >> 2]) +
                                      ((0 | St[b >> 2]) >>> 0 < (0 | St[l >> 2]) >>> 0 ? 0 | St[p >> 2] : 0))) >>
                                    0
                                ]),
                              (St[b >> 2] = 1 + (0 | St[b >> 2])),
                              (St[k >> 2] = 1 + (0 | St[k >> 2])),
                              (St[f >> 2] = (0 | St[f >> 2]) >>> 0 < 7 ? 9 : 11)
                            break r
                          }
                          ;(St[v >> 2] = (0 | St[v >> 2]) - $),
                            (St[M >> 2] = (0 | St[M >> 2]) - (0 | St[A >> 2])),
                            (_t[St[O >> 2] >> 1] = (0 | St[R >> 2]) - ((0 | St[R >> 2]) >>> 5))
                          break
                        }
                      } while (
                        ((St[v >> 2] = (0 | St[v >> 2]) - t),
                        (St[M >> 2] = (0 | St[M >> 2]) - (0 | St[A >> 2])),
                        (_t[St[O >> 2] >> 1] = (0 | St[R >> 2]) - ((0 | St[R >> 2]) >>> 5)),
                        (St[O >> 2] = 432 + (0 | St[s >> 2]) + (St[f >> 2] << 1)),
                        (St[R >> 2] = re[St[O >> 2] >> 1]),
                        (0 | St[v >> 2]) >>> 0 < 16777216 &&
                          ((St[v >> 2] = St[v >> 2] << 8),
                          ($ = St[M >> 2] << 8),
                          (e = 0 | St[y >> 2]),
                          (St[y >> 2] = e + 1),
                          (St[M >> 2] = 0 | $ | mt[e >> 0])),
                        (e = 0 | wt((0 | St[v >> 2]) >>> 11, 0 | St[R >> 2])),
                        (St[A >> 2] = e),
                        (e = 0 | St[A >> 2]),
                        (0 | St[M >> 2]) >>> 0 < (0 | St[A >> 2]) >>> 0
                          ? ((St[v >> 2] = e),
                            (_t[St[O >> 2] >> 1] = (0 | St[R >> 2]) + (((2048 - (0 | St[R >> 2])) | 0) >>> 5)),
                            (St[I >> 2] = St[c >> 2]))
                          : ((St[v >> 2] = (0 | St[v >> 2]) - e),
                            (St[M >> 2] = (0 | St[M >> 2]) - (0 | St[A >> 2])),
                            (_t[St[O >> 2] >> 1] = (0 | St[R >> 2]) - ((0 | St[R >> 2]) >>> 5)),
                            (St[O >> 2] = 456 + (0 | St[s >> 2]) + (St[f >> 2] << 1)),
                            (St[R >> 2] = re[St[O >> 2] >> 1]),
                            (0 | St[v >> 2]) >>> 0 < 16777216 &&
                              ((St[v >> 2] = St[v >> 2] << 8),
                              (e = St[M >> 2] << 8),
                              ($ = 0 | St[y >> 2]),
                              (St[y >> 2] = $ + 1),
                              (St[M >> 2] = 0 | e | mt[$ >> 0])),
                            ($ = 0 | wt((0 | St[v >> 2]) >>> 11, 0 | St[R >> 2])),
                            (St[A >> 2] = $),
                            ($ = 0 | St[A >> 2]),
                            (0 | St[M >> 2]) >>> 0 < (0 | St[A >> 2]) >>> 0
                              ? ((St[v >> 2] = $),
                                (_t[St[O >> 2] >> 1] = (0 | St[R >> 2]) + (((2048 - (0 | St[R >> 2])) | 0) >>> 5)),
                                (St[I >> 2] = St[d >> 2]))
                              : ((St[v >> 2] = (0 | St[v >> 2]) - $),
                                (St[M >> 2] = (0 | St[M >> 2]) - (0 | St[A >> 2])),
                                (_t[St[O >> 2] >> 1] = (0 | St[R >> 2]) - ((0 | St[R >> 2]) >>> 5)),
                                (St[I >> 2] = St[E >> 2]),
                                (St[E >> 2] = St[d >> 2])),
                            (St[d >> 2] = St[c >> 2])),
                        (St[c >> 2] = St[l >> 2]),
                        (St[l >> 2] = St[I >> 2]),
                        0)
                      )
                      ;(St[f >> 2] = (0 | St[f >> 2]) >>> 0 < 7 ? 8 : 11), (St[O >> 2] = 2664 + (0 | St[s >> 2]))
                    }
                    ;(St[B >> 2] = St[O >> 2]),
                      (St[R >> 2] = re[St[B >> 2] >> 1]),
                      (0 | St[v >> 2]) >>> 0 < 16777216 &&
                        ((St[v >> 2] = St[v >> 2] << 8),
                        (t = St[M >> 2] << 8),
                        ($ = 0 | St[y >> 2]),
                        (St[y >> 2] = $ + 1),
                        (St[M >> 2] = 0 | t | mt[$ >> 0])),
                      ($ = 0 | wt((0 | St[v >> 2]) >>> 11, 0 | St[R >> 2])),
                      (St[A >> 2] = $),
                      ($ = 0 | St[A >> 2])
                    do {
                      if ((0 | St[M >> 2]) >>> 0 >= (0 | St[A >> 2]) >>> 0) {
                        if (
                          ((St[v >> 2] = (0 | St[v >> 2]) - $),
                          (St[M >> 2] = (0 | St[M >> 2]) - (0 | St[A >> 2])),
                          (_t[St[B >> 2] >> 1] = (0 | St[R >> 2]) - ((0 | St[R >> 2]) >>> 5)),
                          (St[B >> 2] = 2 + (0 | St[O >> 2])),
                          (St[R >> 2] = re[St[B >> 2] >> 1]),
                          (0 | St[v >> 2]) >>> 0 < 16777216 &&
                            ((St[v >> 2] = St[v >> 2] << 8),
                            (t = St[M >> 2] << 8),
                            (e = 0 | St[y >> 2]),
                            (St[y >> 2] = e + 1),
                            (St[M >> 2] = 0 | t | mt[e >> 0])),
                          (e = 0 | wt((0 | St[v >> 2]) >>> 11, 0 | St[R >> 2])),
                          (St[A >> 2] = e),
                          (e = 0 | St[A >> 2]),
                          (0 | St[M >> 2]) >>> 0 < (0 | St[A >> 2]) >>> 0)
                        ) {
                          ;(St[v >> 2] = e),
                            (_t[St[B >> 2] >> 1] = (0 | St[R >> 2]) + (((2048 - (0 | St[R >> 2])) | 0) >>> 5)),
                            (St[B >> 2] = 260 + (0 | St[O >> 2]) + ((St[g >> 2] << 3) << 1)),
                            (St[x >> 2] = 8),
                            (St[L >> 2] = 8)
                          break
                        }
                        ;(St[v >> 2] = (0 | St[v >> 2]) - e),
                          (St[M >> 2] = (0 | St[M >> 2]) - (0 | St[A >> 2])),
                          (_t[St[B >> 2] >> 1] = (0 | St[R >> 2]) - ((0 | St[R >> 2]) >>> 5)),
                          (St[B >> 2] = 516 + (0 | St[O >> 2])),
                          (St[x >> 2] = 16),
                          (St[L >> 2] = 256)
                        break
                      }
                    } while (
                      ((St[v >> 2] = $),
                      (_t[St[B >> 2] >> 1] = (0 | St[R >> 2]) + (((2048 - (0 | St[R >> 2])) | 0) >>> 5)),
                      (St[B >> 2] = 4 + (0 | St[O >> 2]) + ((St[g >> 2] << 3) << 1)),
                      (St[x >> 2] = 0),
                      (St[L >> 2] = 8),
                      0)
                    )
                    for (
                      St[w >> 2] = 1;
                      (St[R >> 2] = re[((0 | St[B >> 2]) + (St[w >> 2] << 1)) >> 1]),
                        (0 | St[v >> 2]) >>> 0 < 16777216 &&
                          ((St[v >> 2] = St[v >> 2] << 8),
                          ($ = St[M >> 2] << 8),
                          (e = 0 | St[y >> 2]),
                          (St[y >> 2] = e + 1),
                          (St[M >> 2] = 0 | $ | mt[e >> 0])),
                        (e = 0 | wt((0 | St[v >> 2]) >>> 11, 0 | St[R >> 2])),
                        (St[A >> 2] = e),
                        (e = 0 | St[A >> 2]),
                        (0 | St[M >> 2]) >>> 0 < (0 | St[A >> 2]) >>> 0
                          ? ((St[v >> 2] = e),
                            (_t[((0 | St[B >> 2]) + (St[w >> 2] << 1)) >> 1] =
                              (0 | St[R >> 2]) + (((2048 - (0 | St[R >> 2])) | 0) >>> 5)),
                            (St[w >> 2] = (0 | St[w >> 2]) + (0 | St[w >> 2])))
                          : ((St[v >> 2] = (0 | St[v >> 2]) - e),
                            (St[M >> 2] = (0 | St[M >> 2]) - (0 | St[A >> 2])),
                            (_t[((0 | St[B >> 2]) + (St[w >> 2] << 1)) >> 1] =
                              (0 | St[R >> 2]) - ((0 | St[R >> 2]) >>> 5)),
                            (St[w >> 2] = (0 | St[w >> 2]) + (0 | St[w >> 2]) + 1)),
                        (0 | St[w >> 2]) >>> 0 < (0 | St[L >> 2]) >>> 0;

                    );
                    if (
                      ((St[w >> 2] = (0 | St[w >> 2]) - (0 | St[L >> 2])),
                      (St[w >> 2] = (0 | St[w >> 2]) + (0 | St[x >> 2])),
                      12 <= (0 | St[f >> 2]) >>> 0)
                    ) {
                      ;(St[O >> 2] =
                        864 + (0 | St[s >> 2]) + ((((0 | St[w >> 2]) >>> 0 < 4 ? 0 | St[w >> 2] : 3) << 6) << 1)),
                        (St[H >> 2] = 1),
                        (St[R >> 2] = re[((0 | St[O >> 2]) + (St[H >> 2] << 1)) >> 1]),
                        (0 | St[v >> 2]) >>> 0 < 16777216 &&
                          ((St[v >> 2] = St[v >> 2] << 8),
                          (e = St[M >> 2] << 8),
                          ($ = 0 | St[y >> 2]),
                          (St[y >> 2] = $ + 1),
                          (St[M >> 2] = 0 | e | mt[$ >> 0])),
                        ($ = 0 | wt((0 | St[v >> 2]) >>> 11, 0 | St[R >> 2])),
                        (St[A >> 2] = $),
                        ($ = 0 | St[A >> 2]),
                        (0 | St[M >> 2]) >>> 0 < (0 | St[A >> 2]) >>> 0
                          ? ((St[v >> 2] = $),
                            (_t[((0 | St[O >> 2]) + (St[H >> 2] << 1)) >> 1] =
                              (0 | St[R >> 2]) + (((2048 - (0 | St[R >> 2])) | 0) >>> 5)),
                            (St[H >> 2] = (0 | St[H >> 2]) + (0 | St[H >> 2])))
                          : ((St[v >> 2] = (0 | St[v >> 2]) - $),
                            (St[M >> 2] = (0 | St[M >> 2]) - (0 | St[A >> 2])),
                            (_t[((0 | St[O >> 2]) + (St[H >> 2] << 1)) >> 1] =
                              (0 | St[R >> 2]) - ((0 | St[R >> 2]) >>> 5)),
                            (St[H >> 2] = (0 | St[H >> 2]) + (0 | St[H >> 2]) + 1)),
                        (St[R >> 2] = re[((0 | St[O >> 2]) + (St[H >> 2] << 1)) >> 1]),
                        (0 | St[v >> 2]) >>> 0 < 16777216 &&
                          ((St[v >> 2] = St[v >> 2] << 8),
                          ($ = St[M >> 2] << 8),
                          (e = 0 | St[y >> 2]),
                          (St[y >> 2] = e + 1),
                          (St[M >> 2] = 0 | $ | mt[e >> 0])),
                        (e = 0 | wt((0 | St[v >> 2]) >>> 11, 0 | St[R >> 2])),
                        (St[A >> 2] = e),
                        (e = 0 | St[A >> 2]),
                        (0 | St[M >> 2]) >>> 0 < (0 | St[A >> 2]) >>> 0
                          ? ((St[v >> 2] = e),
                            (_t[((0 | St[O >> 2]) + (St[H >> 2] << 1)) >> 1] =
                              (0 | St[R >> 2]) + (((2048 - (0 | St[R >> 2])) | 0) >>> 5)),
                            (St[H >> 2] = (0 | St[H >> 2]) + (0 | St[H >> 2])))
                          : ((St[v >> 2] = (0 | St[v >> 2]) - e),
                            (St[M >> 2] = (0 | St[M >> 2]) - (0 | St[A >> 2])),
                            (_t[((0 | St[O >> 2]) + (St[H >> 2] << 1)) >> 1] =
                              (0 | St[R >> 2]) - ((0 | St[R >> 2]) >>> 5)),
                            (St[H >> 2] = (0 | St[H >> 2]) + (0 | St[H >> 2]) + 1)),
                        (St[R >> 2] = re[((0 | St[O >> 2]) + (St[H >> 2] << 1)) >> 1]),
                        (0 | St[v >> 2]) >>> 0 < 16777216 &&
                          ((St[v >> 2] = St[v >> 2] << 8),
                          (e = St[M >> 2] << 8),
                          ($ = 0 | St[y >> 2]),
                          (St[y >> 2] = $ + 1),
                          (St[M >> 2] = 0 | e | mt[$ >> 0])),
                        ($ = 0 | wt((0 | St[v >> 2]) >>> 11, 0 | St[R >> 2])),
                        (St[A >> 2] = $),
                        ($ = 0 | St[A >> 2]),
                        (0 | St[M >> 2]) >>> 0 < (0 | St[A >> 2]) >>> 0
                          ? ((St[v >> 2] = $),
                            (_t[((0 | St[O >> 2]) + (St[H >> 2] << 1)) >> 1] =
                              (0 | St[R >> 2]) + (((2048 - (0 | St[R >> 2])) | 0) >>> 5)),
                            (St[H >> 2] = (0 | St[H >> 2]) + (0 | St[H >> 2])))
                          : ((St[v >> 2] = (0 | St[v >> 2]) - $),
                            (St[M >> 2] = (0 | St[M >> 2]) - (0 | St[A >> 2])),
                            (_t[((0 | St[O >> 2]) + (St[H >> 2] << 1)) >> 1] =
                              (0 | St[R >> 2]) - ((0 | St[R >> 2]) >>> 5)),
                            (St[H >> 2] = (0 | St[H >> 2]) + (0 | St[H >> 2]) + 1)),
                        (St[R >> 2] = re[((0 | St[O >> 2]) + (St[H >> 2] << 1)) >> 1]),
                        (0 | St[v >> 2]) >>> 0 < 16777216 &&
                          ((St[v >> 2] = St[v >> 2] << 8),
                          ($ = St[M >> 2] << 8),
                          (e = 0 | St[y >> 2]),
                          (St[y >> 2] = e + 1),
                          (St[M >> 2] = 0 | $ | mt[e >> 0])),
                        (e = 0 | wt((0 | St[v >> 2]) >>> 11, 0 | St[R >> 2])),
                        (St[A >> 2] = e),
                        (e = 0 | St[A >> 2]),
                        (0 | St[M >> 2]) >>> 0 < (0 | St[A >> 2]) >>> 0
                          ? ((St[v >> 2] = e),
                            (_t[((0 | St[O >> 2]) + (St[H >> 2] << 1)) >> 1] =
                              (0 | St[R >> 2]) + (((2048 - (0 | St[R >> 2])) | 0) >>> 5)),
                            (St[H >> 2] = (0 | St[H >> 2]) + (0 | St[H >> 2])))
                          : ((St[v >> 2] = (0 | St[v >> 2]) - e),
                            (St[M >> 2] = (0 | St[M >> 2]) - (0 | St[A >> 2])),
                            (_t[((0 | St[O >> 2]) + (St[H >> 2] << 1)) >> 1] =
                              (0 | St[R >> 2]) - ((0 | St[R >> 2]) >>> 5)),
                            (St[H >> 2] = (0 | St[H >> 2]) + (0 | St[H >> 2]) + 1)),
                        (St[R >> 2] = re[((0 | St[O >> 2]) + (St[H >> 2] << 1)) >> 1]),
                        (0 | St[v >> 2]) >>> 0 < 16777216 &&
                          ((St[v >> 2] = St[v >> 2] << 8),
                          (e = St[M >> 2] << 8),
                          ($ = 0 | St[y >> 2]),
                          (St[y >> 2] = $ + 1),
                          (St[M >> 2] = 0 | e | mt[$ >> 0])),
                        ($ = 0 | wt((0 | St[v >> 2]) >>> 11, 0 | St[R >> 2])),
                        (St[A >> 2] = $),
                        ($ = 0 | St[A >> 2]),
                        (0 | St[M >> 2]) >>> 0 < (0 | St[A >> 2]) >>> 0
                          ? ((St[v >> 2] = $),
                            (_t[((0 | St[O >> 2]) + (St[H >> 2] << 1)) >> 1] =
                              (0 | St[R >> 2]) + (((2048 - (0 | St[R >> 2])) | 0) >>> 5)),
                            (St[H >> 2] = (0 | St[H >> 2]) + (0 | St[H >> 2])))
                          : ((St[v >> 2] = (0 | St[v >> 2]) - $),
                            (St[M >> 2] = (0 | St[M >> 2]) - (0 | St[A >> 2])),
                            (_t[((0 | St[O >> 2]) + (St[H >> 2] << 1)) >> 1] =
                              (0 | St[R >> 2]) - ((0 | St[R >> 2]) >>> 5)),
                            (St[H >> 2] = (0 | St[H >> 2]) + (0 | St[H >> 2]) + 1)),
                        (St[R >> 2] = re[((0 | St[O >> 2]) + (St[H >> 2] << 1)) >> 1]),
                        (0 | St[v >> 2]) >>> 0 < 16777216 &&
                          ((St[v >> 2] = St[v >> 2] << 8),
                          ($ = St[M >> 2] << 8),
                          (e = 0 | St[y >> 2]),
                          (St[y >> 2] = e + 1),
                          (St[M >> 2] = 0 | $ | mt[e >> 0])),
                        (e = 0 | wt((0 | St[v >> 2]) >>> 11, 0 | St[R >> 2])),
                        (St[A >> 2] = e),
                        (e = 0 | St[A >> 2]),
                        (0 | St[M >> 2]) >>> 0 < (0 | St[A >> 2]) >>> 0
                          ? ((St[v >> 2] = e),
                            (_t[((0 | St[O >> 2]) + (St[H >> 2] << 1)) >> 1] =
                              (0 | St[R >> 2]) + (((2048 - (0 | St[R >> 2])) | 0) >>> 5)),
                            (St[H >> 2] = (0 | St[H >> 2]) + (0 | St[H >> 2])))
                          : ((St[v >> 2] = (0 | St[v >> 2]) - e),
                            (St[M >> 2] = (0 | St[M >> 2]) - (0 | St[A >> 2])),
                            (_t[((0 | St[O >> 2]) + (St[H >> 2] << 1)) >> 1] =
                              (0 | St[R >> 2]) - ((0 | St[R >> 2]) >>> 5)),
                            (St[H >> 2] = (0 | St[H >> 2]) + (0 | St[H >> 2]) + 1)),
                        (St[H >> 2] = (0 | St[H >> 2]) - 64)
                      t: do {
                        if (4 <= (0 | St[H >> 2]) >>> 0) {
                          if (
                            ((St[U >> 2] = St[H >> 2]),
                            (St[z >> 2] = ((0 | St[H >> 2]) >>> 1) - 1),
                            (St[H >> 2] = 2 | (1 & St[H >> 2])),
                            (e = 0 | St[z >> 2]),
                            (0 | St[U >> 2]) >>> 0 < 14)
                          )
                            for (
                              St[H >> 2] = St[H >> 2] << e,
                                St[O >> 2] =
                                  1376 + (0 | St[s >> 2]) + (St[H >> 2] << 1) + ((0 - (0 | St[U >> 2])) << 1) - 2,
                                St[Y >> 2] = 1,
                                St[V >> 2] = 1;
                              ;

                            )
                              if (
                                ((St[R >> 2] = re[((0 | St[O >> 2]) + (St[V >> 2] << 1)) >> 1]),
                                (0 | St[v >> 2]) >>> 0 < 16777216 &&
                                  ((St[v >> 2] = St[v >> 2] << 8),
                                  ($ = St[M >> 2] << 8),
                                  (t = 0 | St[y >> 2]),
                                  (St[y >> 2] = t + 1),
                                  (St[M >> 2] = 0 | $ | mt[t >> 0])),
                                (t = 0 | wt((0 | St[v >> 2]) >>> 11, 0 | St[R >> 2])),
                                (St[A >> 2] = t),
                                (t = 0 | St[A >> 2]),
                                (0 | St[M >> 2]) >>> 0 < (0 | St[A >> 2]) >>> 0
                                  ? ((St[v >> 2] = t),
                                    (_t[((0 | St[O >> 2]) + (St[V >> 2] << 1)) >> 1] =
                                      (0 | St[R >> 2]) + (((2048 - (0 | St[R >> 2])) | 0) >>> 5)),
                                    (St[V >> 2] = (0 | St[V >> 2]) + (0 | St[V >> 2])))
                                  : ((St[v >> 2] = (0 | St[v >> 2]) - t),
                                    (St[M >> 2] = (0 | St[M >> 2]) - (0 | St[A >> 2])),
                                    (_t[((0 | St[O >> 2]) + (St[V >> 2] << 1)) >> 1] =
                                      (0 | St[R >> 2]) - ((0 | St[R >> 2]) >>> 5)),
                                    (St[V >> 2] = (0 | St[V >> 2]) + (0 | St[V >> 2]) + 1),
                                    (St[H >> 2] = St[H >> 2] | St[Y >> 2])),
                                (St[Y >> 2] = St[Y >> 2] << 1),
                                (t = ((0 | St[z >> 2]) - 1) | 0),
                                !(St[z >> 2] = t))
                              )
                                break t
                          for (
                            St[z >> 2] = e - 4;
                            (0 | St[v >> 2]) >>> 0 < 16777216 &&
                              ((St[v >> 2] = St[v >> 2] << 8),
                              (t = St[M >> 2] << 8),
                              ($ = 0 | St[y >> 2]),
                              (St[y >> 2] = $ + 1),
                              (St[M >> 2] = 0 | t | mt[$ >> 0])),
                              (St[v >> 2] = (0 | St[v >> 2]) >>> 1),
                              (St[M >> 2] = (0 | St[M >> 2]) - (0 | St[v >> 2])),
                              (St[K >> 2] = 0 - ((0 | St[M >> 2]) >>> 31)),
                              (St[H >> 2] = (St[H >> 2] << 1) + (1 + (0 | St[K >> 2]))),
                              (St[M >> 2] = (0 | St[M >> 2]) + (St[v >> 2] & St[K >> 2])),
                              ($ = ((0 | St[z >> 2]) - 1) | 0),
                              (St[z >> 2] = $),
                              0 != (0 | $);

                          );
                          if (
                            ((St[O >> 2] = 1604 + (0 | St[s >> 2])),
                            (St[H >> 2] = St[H >> 2] << 4),
                            (St[W >> 2] = 1),
                            (St[R >> 2] = re[((0 | St[O >> 2]) + (St[W >> 2] << 1)) >> 1]),
                            (0 | St[v >> 2]) >>> 0 < 16777216 &&
                              ((St[v >> 2] = St[v >> 2] << 8),
                              (e = St[M >> 2] << 8),
                              ($ = 0 | St[y >> 2]),
                              (St[y >> 2] = $ + 1),
                              (St[M >> 2] = 0 | e | mt[$ >> 0])),
                            ($ = 0 | wt((0 | St[v >> 2]) >>> 11, 0 | St[R >> 2])),
                            (St[A >> 2] = $),
                            ($ = 0 | St[A >> 2]),
                            (0 | St[M >> 2]) >>> 0 < (0 | St[A >> 2]) >>> 0
                              ? ((St[v >> 2] = $),
                                (_t[((0 | St[O >> 2]) + (St[W >> 2] << 1)) >> 1] =
                                  (0 | St[R >> 2]) + (((2048 - (0 | St[R >> 2])) | 0) >>> 5)),
                                (St[W >> 2] = (0 | St[W >> 2]) + (0 | St[W >> 2])))
                              : ((St[v >> 2] = (0 | St[v >> 2]) - $),
                                (St[M >> 2] = (0 | St[M >> 2]) - (0 | St[A >> 2])),
                                (_t[((0 | St[O >> 2]) + (St[W >> 2] << 1)) >> 1] =
                                  (0 | St[R >> 2]) - ((0 | St[R >> 2]) >>> 5)),
                                (St[W >> 2] = (0 | St[W >> 2]) + (0 | St[W >> 2]) + 1),
                                (St[H >> 2] = 1 | St[H >> 2])),
                            (St[R >> 2] = re[((0 | St[O >> 2]) + (St[W >> 2] << 1)) >> 1]),
                            (0 | St[v >> 2]) >>> 0 < 16777216 &&
                              ((St[v >> 2] = St[v >> 2] << 8),
                              ($ = St[M >> 2] << 8),
                              (e = 0 | St[y >> 2]),
                              (St[y >> 2] = e + 1),
                              (St[M >> 2] = 0 | $ | mt[e >> 0])),
                            (e = 0 | wt((0 | St[v >> 2]) >>> 11, 0 | St[R >> 2])),
                            (St[A >> 2] = e),
                            (e = 0 | St[A >> 2]),
                            (0 | St[M >> 2]) >>> 0 < (0 | St[A >> 2]) >>> 0
                              ? ((St[v >> 2] = e),
                                (_t[((0 | St[O >> 2]) + (St[W >> 2] << 1)) >> 1] =
                                  (0 | St[R >> 2]) + (((2048 - (0 | St[R >> 2])) | 0) >>> 5)),
                                (St[W >> 2] = (0 | St[W >> 2]) + (0 | St[W >> 2])))
                              : ((St[v >> 2] = (0 | St[v >> 2]) - e),
                                (St[M >> 2] = (0 | St[M >> 2]) - (0 | St[A >> 2])),
                                (_t[((0 | St[O >> 2]) + (St[W >> 2] << 1)) >> 1] =
                                  (0 | St[R >> 2]) - ((0 | St[R >> 2]) >>> 5)),
                                (St[W >> 2] = (0 | St[W >> 2]) + (0 | St[W >> 2]) + 1),
                                (St[H >> 2] = 2 | St[H >> 2])),
                            (St[R >> 2] = re[((0 | St[O >> 2]) + (St[W >> 2] << 1)) >> 1]),
                            (0 | St[v >> 2]) >>> 0 < 16777216 &&
                              ((St[v >> 2] = St[v >> 2] << 8),
                              (e = St[M >> 2] << 8),
                              ($ = 0 | St[y >> 2]),
                              (St[y >> 2] = $ + 1),
                              (St[M >> 2] = 0 | e | mt[$ >> 0])),
                            ($ = 0 | wt((0 | St[v >> 2]) >>> 11, 0 | St[R >> 2])),
                            (St[A >> 2] = $),
                            ($ = 0 | St[A >> 2]),
                            (0 | St[M >> 2]) >>> 0 < (0 | St[A >> 2]) >>> 0
                              ? ((St[v >> 2] = $),
                                (_t[((0 | St[O >> 2]) + (St[W >> 2] << 1)) >> 1] =
                                  (0 | St[R >> 2]) + (((2048 - (0 | St[R >> 2])) | 0) >>> 5)),
                                (St[W >> 2] = (0 | St[W >> 2]) + (0 | St[W >> 2])))
                              : ((St[v >> 2] = (0 | St[v >> 2]) - $),
                                (St[M >> 2] = (0 | St[M >> 2]) - (0 | St[A >> 2])),
                                (_t[((0 | St[O >> 2]) + (St[W >> 2] << 1)) >> 1] =
                                  (0 | St[R >> 2]) - ((0 | St[R >> 2]) >>> 5)),
                                (St[W >> 2] = (0 | St[W >> 2]) + (0 | St[W >> 2]) + 1),
                                (St[H >> 2] = 4 | St[H >> 2])),
                            (St[R >> 2] = re[((0 | St[O >> 2]) + (St[W >> 2] << 1)) >> 1]),
                            (0 | St[v >> 2]) >>> 0 < 16777216 &&
                              ((St[v >> 2] = St[v >> 2] << 8),
                              ($ = St[M >> 2] << 8),
                              (e = 0 | St[y >> 2]),
                              (St[y >> 2] = e + 1),
                              (St[M >> 2] = 0 | $ | mt[e >> 0])),
                            (e = 0 | wt((0 | St[v >> 2]) >>> 11, 0 | St[R >> 2])),
                            (St[A >> 2] = e),
                            (e = 0 | St[A >> 2]),
                            (0 | St[M >> 2]) >>> 0 < (0 | St[A >> 2]) >>> 0
                              ? ((St[v >> 2] = e),
                                (_t[((0 | St[O >> 2]) + (St[W >> 2] << 1)) >> 1] =
                                  (0 | St[R >> 2]) + (((2048 - (0 | St[R >> 2])) | 0) >>> 5)),
                                (St[W >> 2] = (0 | St[W >> 2]) + (0 | St[W >> 2])))
                              : ((St[v >> 2] = (0 | St[v >> 2]) - e),
                                (St[M >> 2] = (0 | St[M >> 2]) - (0 | St[A >> 2])),
                                (_t[((0 | St[O >> 2]) + (St[W >> 2] << 1)) >> 1] =
                                  (0 | St[R >> 2]) - ((0 | St[R >> 2]) >>> 5)),
                                (St[W >> 2] = (0 | St[W >> 2]) + (0 | St[W >> 2]) + 1),
                                (St[H >> 2] = 8 | St[H >> 2])),
                            -1 == (0 | St[H >> 2]))
                          ) {
                            J = 130
                            break e
                          }
                        }
                      } while (0)
                      if (
                        ((St[E >> 2] = St[d >> 2]),
                        (St[d >> 2] = St[c >> 2]),
                        (St[c >> 2] = St[l >> 2]),
                        (St[l >> 2] = 1 + (0 | St[H >> 2])),
                        (e = 0 | St[H >> 2]),
                        0 | St[F >> 2])
                      ) {
                        if (e >>> 0 >= (0 | St[F >> 2]) >>> 0) {
                          J = 135
                          break e
                        }
                      } else if (e >>> 0 >= (0 | St[k >> 2]) >>> 0) {
                        J = 133
                        break e
                      }
                      St[f >> 2] = (0 | St[f >> 2]) >>> 0 < 19 ? 7 : 10
                    }
                    if (((St[w >> 2] = 2 + (0 | St[w >> 2])), (0 | St[a >> 2]) == (0 | St[b >> 2]))) {
                      J = 138
                      break e
                    }
                    if (
                      ((St[j >> 2] = (0 | St[a >> 2]) - (0 | St[b >> 2])),
                      (St[X >> 2] = (0 | St[j >> 2]) >>> 0 < (0 | St[w >> 2]) >>> 0 ? 0 | St[j >> 2] : 0 | St[w >> 2]),
                      (St[G >> 2] =
                        (0 | St[b >> 2]) -
                        (0 | St[l >> 2]) +
                        ((0 | St[b >> 2]) >>> 0 < (0 | St[l >> 2]) >>> 0 ? 0 | St[p >> 2] : 0)),
                      (St[k >> 2] = (0 | St[k >> 2]) + (0 | St[X >> 2])),
                      (St[w >> 2] = (0 | St[w >> 2]) - (0 | St[X >> 2])),
                      (((0 | St[G >> 2]) + (0 | St[X >> 2])) | 0) >>> 0 > (0 | St[p >> 2]) >>> 0)
                    )
                      for (;;)
                        if (
                          ((e = 0 | Et[((0 | St[h >> 2]) + (0 | St[G >> 2])) >> 0]),
                          ($ = 0 | St[b >> 2]),
                          (St[b >> 2] = $ + 1),
                          (Et[((0 | St[h >> 2]) + $) >> 0] = e),
                          (e = (1 + (0 | St[G >> 2])) | 0),
                          (St[G >> 2] = e),
                          (St[G >> 2] = (0 | e) == (0 | St[p >> 2]) ? 0 : e),
                          (e = ((0 | St[X >> 2]) - 1) | 0),
                          !(St[X >> 2] = e))
                        )
                          break r
                    for (
                      St[q >> 2] = (0 | St[h >> 2]) + (0 | St[b >> 2]),
                        St[Q >> 2] = (0 | St[G >> 2]) - (0 | St[b >> 2]),
                        St[Z >> 2] = (0 | St[q >> 2]) + (0 | St[X >> 2]),
                        St[b >> 2] = (0 | St[b >> 2]) + (0 | St[X >> 2]);
                      (Et[St[q >> 2] >> 0] = 0 | Et[((0 | St[q >> 2]) + (0 | St[Q >> 2])) >> 0]),
                        (e = (1 + (0 | St[q >> 2])) | 0),
                        (St[q >> 2] = e),
                        (0 | e) != (0 | St[Z >> 2]);

                    );
                  }
                } while (0)
              } while (
                !((0 | St[b >> 2]) >>> 0 >= (0 | St[a >> 2]) >>> 0) &&
                (0 | St[y >> 2]) >>> 0 < (0 | St[u >> 2]) >>> 0
              )
              {
                if (28 == (0 | J)) return (St[i >> 2] = 1), (ee = 0 | St[i >> 2]), (pt = n), 0 | ee
                if (130 == (0 | J)) (St[w >> 2] = 274 + (0 | St[w >> 2])), (St[f >> 2] = (0 | St[f >> 2]) - 12)
                else {
                  if (133 == (0 | J)) return (St[i >> 2] = 1), (ee = 0 | St[i >> 2]), (pt = n), 0 | ee
                  if (135 == (0 | J)) return (St[i >> 2] = 1), (ee = 0 | St[i >> 2]), (pt = n), 0 | ee
                  if (138 == (0 | J)) return (St[i >> 2] = 1), (ee = 0 | St[i >> 2]), (pt = n), 0 | ee
                }
              }
              ;(0 | St[v >> 2]) >>> 0 < 16777216 &&
                ((St[v >> 2] = St[v >> 2] << 8),
                (J = St[M >> 2] << 8),
                (u = 0 | St[y >> 2]),
                (St[y >> 2] = u + 1),
                (St[M >> 2] = 0 | J | mt[u >> 0]))
              return (
                (St[(24 + (0 | St[o >> 2])) >> 2] = St[y >> 2]),
                (St[(28 + (0 | St[o >> 2])) >> 2] = St[v >> 2]),
                (St[(32 + (0 | St[o >> 2])) >> 2] = St[M >> 2]),
                (St[(72 + (0 | St[o >> 2])) >> 2] = St[w >> 2]),
                (St[(36 + (0 | St[o >> 2])) >> 2] = St[b >> 2]),
                (St[(44 + (0 | St[o >> 2])) >> 2] = St[k >> 2]),
                (St[(56 + (0 | St[o >> 2])) >> 2] = St[l >> 2]),
                (St[(56 + (0 | St[o >> 2]) + 4) >> 2] = St[c >> 2]),
                (St[(56 + (0 | St[o >> 2]) + 8) >> 2] = St[d >> 2]),
                (St[(56 + (0 | St[o >> 2]) + 12) >> 2] = St[E >> 2]),
                (St[(52 + (0 | St[o >> 2])) >> 2] = St[f >> 2]),
                (St[i >> 2] = 0),
                (ee = 0 | St[i >> 2]),
                (pt = n),
                0 | ee
              )
            })(0 | St[i >> 2], 0 | St[u >> 2], 0 | St[a >> 2])),
          (St[f >> 2] = t),
          0 | St[f >> 2])
        ) {
          l = 6
          break
        }
      } while (
        ((0 | St[(44 + (0 | St[i >> 2])) >> 2]) >>> 0 >= (0 | St[(12 + (0 | St[i >> 2])) >> 2]) >>> 0 &&
          (St[(48 + (0 | St[i >> 2])) >> 2] = St[(12 + (0 | St[i >> 2])) >> 2]),
        we(0 | St[i >> 2], 0 | St[o >> 2]),
        !((0 | St[(36 + (0 | St[i >> 2])) >> 2]) >>> 0 >= (0 | St[o >> 2]) >>> 0)) &&
        !((0 | St[(24 + (0 | St[i >> 2])) >> 2]) >>> 0 >= (0 | St[a >> 2]) >>> 0) &&
        (0 | St[(72 + (0 | St[i >> 2])) >> 2]) >>> 0 < 274
      )
      return (
        (pt =
          ((c =
            6 == (0 | l)
              ? ((St[n >> 2] = St[f >> 2]), 0 | St[n >> 2])
              : (274 < (0 | St[(72 + (0 | St[i >> 2])) >> 2]) >>> 0 && (St[(72 + (0 | St[i >> 2])) >> 2] = 274),
                (St[n >> 2] = 0) | St[n >> 2])),
          d)),
        0 | c
      )
    }
    function Oe(e, r) {
      ;(e |= 0), (r |= 0)
      var t,
        n,
        i = pt
      ;(0 | bt) <= (0 | (pt = (pt + 16) | 0)) && yt(16),
        (St[(t = ((n = i) + 4) | 0) >> 2] = e),
        (St[n >> 2] = r),
        or[3 & St[(4 + (0 | St[n >> 2])) >> 2]](0 | St[n >> 2], 0 | St[(16 + (0 | St[t >> 2])) >> 2]),
        (St[(16 + (0 | St[t >> 2])) >> 2] = 0),
        (pt = i)
    }
    function Ae(e, r, t, n) {
      ;(e |= 0), (r |= 0), (t |= 0), (n |= 0)
      var i,
        o,
        a,
        u,
        s,
        f,
        l = 0,
        c = 0,
        d = 0,
        E = pt
      return (
        (0 | bt) <= (0 | (pt = (pt + 48) | 0)) && yt(48),
        (i = (E + 40) | 0),
        (a = (E + 32) | 0),
        (u = (E + 28) | 0),
        (s = (E + 24) | 0),
        (f = (E + 8) | 0),
        (l = (E + 4) | 0),
        (St[(o = ((c = E) + 36) | 0) >> 2] = e),
        (St[a >> 2] = r),
        (St[u >> 2] = t),
        (St[s >> 2] = n),
        (n =
          0 |
          (function (e, r, t) {
            ;(e |= 0), (r |= 0), (t |= 0)
            var n,
              i,
              o,
              a,
              u,
              s,
              f = 0,
              l = pt
            return (
              (0 | bt) <= (0 | (pt = (pt + 32) | 0)) && yt(32),
              (n = (l + 16) | 0),
              (o = (l + 8) | 0),
              (a = (l + 4) | 0),
              (s = ((u = l) + 20) | 0),
              (St[(i = (l + 12) | 0) >> 2] = e),
              (St[o >> 2] = r),
              (St[a >> 2] = t),
              (pt =
                ((f =
                  (0 | St[a >> 2]) >>> 0 < 5
                    ? ((St[n >> 2] = 4), 0 | St[n >> 2])
                    : ((a =
                        0 |
                        mt[(1 + (0 | St[o >> 2])) >> 0] |
                        ((0 | mt[(2 + (0 | St[o >> 2])) >> 0]) << 8) |
                        ((0 | mt[(3 + (0 | St[o >> 2])) >> 0]) << 16) |
                        ((0 | mt[(4 + (0 | St[o >> 2])) >> 0]) << 24)),
                      (St[u >> 2] = a),
                      (St[u >> 2] = (0 | St[u >> 2]) >>> 0 < 4096 ? 4096 : a),
                      (St[(12 + (0 | St[i >> 2])) >> 2] = St[u >> 2]),
                      (Et[s >> 0] = 0 | Et[St[o >> 2] >> 0]),
                      225 <= (0 | mt[s >> 0])
                        ? ((St[n >> 2] = 4), 0 | St[n >> 2])
                        : ((St[St[i >> 2] >> 2] = (0 | mt[s >> 0]) % 9 | 0),
                          (Et[s >> 0] = ((0 | mt[s >> 0]) / 9) | 0),
                          (St[(8 + (0 | St[i >> 2])) >> 2] = ((0 | mt[s >> 0]) / 5) | 0),
                          (St[(4 + (0 | St[i >> 2])) >> 2] = (0 | mt[s >> 0]) % 5 | 0),
                          (St[n >> 2] = 0) | St[n >> 2]))),
                l)),
              0 | f
            )
          })(f, 0 | St[a >> 2], 0 | St[u >> 2])),
        (St[l >> 2] = n),
        (pt =
          ((d =
            0 | St[l >> 2]
              ? ((St[i >> 2] = St[l >> 2]), 0 | St[i >> 2])
              : ((l =
                  0 |
                  (function (e, r, t) {
                    ;(e |= 0), (r |= 0), (t |= 0)
                    var n = 0,
                      i = 0,
                      o = 0,
                      a = 0,
                      u = 0,
                      s = 0,
                      f = 0,
                      l = 0
                    ;(0 | (pt = ((n = pt) + 32) | 0)) >= (0 | bt) && yt(32)
                    ;(i = (n + 16) | 0),
                      (a = (n + 8) | 0),
                      (u = (n + 4) | 0),
                      (St[(o = ((s = n) + 12) | 0) >> 2] = e),
                      (St[a >> 2] = r),
                      (St[u >> 2] = t),
                      (St[s >> 2] =
                        1846 + (768 << ((0 | St[St[a >> 2] >> 2]) + (0 | St[(4 + (0 | St[a >> 2])) >> 2])))),
                      (0 != (0 | St[(16 + (0 | St[o >> 2])) >> 2]) &&
                        (0 | St[s >> 2]) == (0 | St[(84 + (0 | St[o >> 2])) >> 2])) ||
                        (f = 3)
                    if (
                      3 == (0 | f) &&
                      (Oe(0 | St[o >> 2], 0 | St[u >> 2]),
                      (f = 0 | sr[3 & St[St[u >> 2] >> 2]](0 | St[u >> 2], St[s >> 2] << 1)),
                      (St[(16 + (0 | St[o >> 2])) >> 2] = f),
                      (St[(84 + (0 | St[o >> 2])) >> 2] = St[s >> 2]),
                      0 == (0 | St[(16 + (0 | St[o >> 2])) >> 2]))
                    )
                      return (St[i >> 2] = 2), (l = 0 | St[i >> 2]), (pt = n), 0 | l
                    return (St[i >> 2] = 0), (l = 0 | St[i >> 2]), (pt = n), 0 | l
                  })(0 | St[o >> 2], f, 0 | St[s >> 2])),
                (St[c >> 2] = l),
                0 | St[c >> 2]
                  ? ((St[i >> 2] = St[c >> 2]), 0 | St[i >> 2])
                  : ((c = 0 | St[o >> 2]),
                    (St[c >> 2] = St[f >> 2]),
                    (St[(c + 4) >> 2] = St[(4 + f) >> 2]),
                    (St[(c + 8) >> 2] = St[(8 + f) >> 2]),
                    (St[(c + 12) >> 2] = St[(12 + f) >> 2]),
                    (St[i >> 2] = 0) | St[i >> 2]))),
          E)),
        0 | d
      )
    }
    function Re(e, r, t, n, i, o, a, u, s, f) {
      ;(e |= 0), (r |= 0), (t |= 0), (n |= 0), (i |= 0), (o |= 0), (a |= 0), (u |= 0), (s |= 0), (f |= 0)
      var l,
        c,
        d,
        E,
        _,
        S,
        m,
        h,
        p,
        b,
        k,
        F,
        w = pt
      for (
        (0 | bt) <= (0 | (pt = (pt + 64) | 0)) && yt(64),
          c = (w + 52) | 0,
          d = (w + 48) | 0,
          _ = ((E = w) + 44) | 0,
          S = (w + 40) | 0,
          m = (w + 36) | 0,
          h = (w + 32) | 0,
          p = (w + 28) | 0,
          b = (w + 16) | 0,
          k = (w + 12) | 0,
          F = (w + 8) | 0,
          St[(l = (w + 56) | 0) >> 2] = e,
          St[c >> 2] = r,
          St[d >> 2] = t,
          St[(t = E) >> 2] = n,
          St[(t + 4) >> 2] = i,
          St[_ >> 2] = o,
          St[S >> 2] = a,
          St[m >> 2] = u,
          St[h >> 2] = s,
          St[p >> 2] = f,
          St[b >> 2] = 0,
          St[(4 + b) >> 2] = 0,
          f = E,
          E =
            (St[(8 + b) >> 2] = 0) |
            (function (e, r, t, n, i, o, a, u, s, f, l) {
              ;(e |= 0),
                (r |= 0),
                (t |= 0),
                (n |= 0),
                (i |= 0),
                (o |= 0),
                (a |= 0),
                (u |= 0),
                (s |= 0),
                (f |= 0),
                (l |= 0)
              var c = 0,
                d = 0,
                E = 0,
                _ = 0,
                S = 0,
                m = 0,
                h = 0,
                p = 0,
                b = 0,
                k = 0,
                F = 0,
                w = 0,
                y = 0,
                v = 0,
                M = 0,
                O = 0,
                A = 0,
                R = 0,
                g = 0,
                T = 0,
                N = 0,
                D = 0,
                P = 0,
                C = 0,
                I = 0,
                L = 0,
                x = 0,
                B = 0,
                H = 0,
                U = 0,
                z = 0,
                Y = 0,
                V = 0,
                K = 0,
                W = 0,
                j = 0,
                X = 0,
                G = 0,
                q = 0
              ;(0 | (pt = ((c = pt) + 192) | 0)) >= (0 | bt) && yt(192)
              if (
                ((d = (c + 180) | 0),
                (_ = (c + 172) | 0),
                (S = (c + 168) | 0),
                (m = (c + 40) | 0),
                (h = (c + 164) | 0),
                (p = (c + 160) | 0),
                (b = (c + 156) | 0),
                (k = (c + 152) | 0),
                (F = (c + 148) | 0),
                (w = (c + 144) | 0),
                (y = (c + 140) | 0),
                (v = (c + 128) | 0),
                (M = (c + 124) | 0),
                (O = (c + 120) | 0),
                (A = (c + 116) | 0),
                (R = (c + 112) | 0),
                (g = (c + 108) | 0),
                (T = (c + 32) | 0),
                (N = (c + 24) | 0),
                (D = (c + 104) | 0),
                (P = (c + 100) | 0),
                (C = (c + 88) | 0),
                (I = (c + 16) | 0),
                (L = (c + 84) | 0),
                (x = (c + 80) | 0),
                (B = (c + 76) | 0),
                (H = (c + 72) | 0),
                (U = (c + 68) | 0),
                (z = (c + 8) | 0),
                (V = ((Y = c) + 64) | 0),
                (K = (c + 60) | 0),
                (W = (c + 56) | 0),
                (j = (c + 52) | 0),
                (X = (c + 48) | 0),
                (St[(E = (c + 176) | 0) >> 2] = e),
                (St[_ >> 2] = r),
                (St[S >> 2] = t),
                (St[(t = m) >> 2] = n),
                (St[(t + 4) >> 2] = i),
                (St[h >> 2] = o),
                (St[p >> 2] = a),
                (St[b >> 2] = u),
                (St[k >> 2] = s),
                (St[F >> 2] = f),
                (St[w >> 2] = l),
                (St[v >> 2] = 0),
                (St[(4 + v) >> 2] = 0),
                (St[(8 + v) >> 2] = 0),
                (St[M >> 2] = 0),
                (St[O >> 2] = 0),
                (l =
                  0 |
                  (function (e) {
                    e |= 0
                    var r = 0,
                      t = 0,
                      n = 0,
                      i = 0,
                      o = 0,
                      a = 0,
                      u = 0
                    ;(0 | (pt = ((r = pt) + 16) | 0)) >= (0 | bt) && yt(16)
                    if (
                      ((t = (r + 8) | 0),
                      (St[(n = ((i = r) + 4) | 0) >> 2] = e),
                      1 <= (0 | St[(16 + (0 | St[n >> 2])) >> 2]) >>> 0 &&
                        (0 | St[(16 + (0 | St[n >> 2])) >> 2]) >>> 0 <= 4)
                    ) {
                      if (!(0 | De(0 | St[St[n >> 2] >> 2])))
                        return (St[t >> 2] = 4), (o = 0 | St[t >> 2]), (pt = r), 0 | o
                      if (((e = 0 | St[n >> 2]), 1 == (0 | St[(16 + (0 | St[n >> 2])) >> 2])))
                        return (
                          (pt =
                            ((o =
                              (1 == (0 | St[(e + 24) >> 2]) &&
                              0 == (0 | St[St[(8 + (0 | St[n >> 2])) >> 2] >> 2]) &&
                              0 == (0 | St[(20 + (0 | St[n >> 2])) >> 2])
                                ? (St[t >> 2] = 0)
                                : (St[t >> 2] = 4),
                              0 | St[t >> 2])),
                            r)),
                          0 | o
                        )
                      if (((a = 0 | St[n >> 2]), 2 == (0 | St[(e + 16) >> 2]))) {
                        if (
                          ((St[i >> 2] = 24 + (0 | St[a >> 2])),
                          (e = (8 + (0 | St[i >> 2])) | 0),
                          !(
                            (0 < (u = 0 | St[(e + 4) >> 2]) >>> 0) |
                              ((0 == (0 | u)) & (4294967295 < (0 | St[e >> 2]) >>> 0)) ||
                            1 != (0 | St[St[i >> 2] >> 2]) ||
                            1 != (0 | St[(4 + (0 | St[i >> 2])) >> 2]) ||
                            1 != (0 | St[(24 + (0 | St[n >> 2])) >> 2]) ||
                            0 != (0 | St[St[(8 + (0 | St[n >> 2])) >> 2] >> 2]) ||
                            1 != (0 | St[(20 + (0 | St[n >> 2])) >> 2]) ||
                            1 != (0 | St[St[(4 + (0 | St[n >> 2])) >> 2] >> 2])
                          ) && 0 == (0 | St[(4 + (0 | St[(4 + (0 | St[n >> 2])) >> 2])) >> 2]))
                        )
                          switch (0 | St[(8 + (0 | St[i >> 2])) >> 2]) {
                            case 50529537:
                            case 50528515:
                              return (St[t >> 2] = 0), (o = 0 | St[t >> 2]), (pt = r), 0 | o
                            default:
                              return (St[t >> 2] = 4), (o = 0 | St[t >> 2]), (pt = r), 0 | o
                          }
                        return (St[t >> 2] = 4), (o = 0 | St[t >> 2]), (pt = r), 0 | o
                      }
                      if (4 != (0 | St[(a + 16) >> 2])) return (St[t >> 2] = 4), (o = 0 | St[t >> 2]), (pt = r), 0 | o
                      if (
                        0 | De((24 + (0 | St[St[n >> 2] >> 2])) | 0) &&
                        0 | De((48 + (0 | St[St[n >> 2] >> 2])) | 0) &&
                        ((a = (72 + (0 | St[St[n >> 2] >> 2]) + 8) | 0),
                        (50528539 == (0 | St[a >> 2])) & (0 == (0 | St[(a + 4) >> 2]))) &&
                        4 == (0 | St[(72 + (0 | St[St[n >> 2] >> 2])) >> 2]) &&
                        1 == (0 | St[(72 + (0 | St[St[n >> 2] >> 2]) + 4) >> 2])
                      ) {
                        do {
                          if (
                            4 == (0 | St[(24 + (0 | St[n >> 2])) >> 2]) &&
                            2 == (0 | St[St[(8 + (0 | St[n >> 2])) >> 2] >> 2]) &&
                            6 == (0 | St[(4 + (0 | St[(8 + (0 | St[n >> 2])) >> 2])) >> 2]) &&
                            1 == (0 | St[(8 + (0 | St[(8 + (0 | St[n >> 2])) >> 2])) >> 2]) &&
                            0 == (0 | St[(12 + (0 | St[(8 + (0 | St[n >> 2])) >> 2])) >> 2]) &&
                            3 == (0 | St[(20 + (0 | St[n >> 2])) >> 2])
                          ) {
                            if (5 != (0 | St[St[(4 + (0 | St[n >> 2])) >> 2] >> 2])) break
                            if (0 | St[(4 + (0 | St[(4 + (0 | St[n >> 2])) >> 2])) >> 2]) break
                            if (4 != (0 | St[(8 + (0 | St[(4 + (0 | St[n >> 2])) >> 2])) >> 2])) break
                            if (1 != (0 | St[(8 + (0 | St[(4 + (0 | St[n >> 2])) >> 2]) + 4) >> 2])) break
                            if (3 != (0 | St[(16 + (0 | St[(4 + (0 | St[n >> 2])) >> 2])) >> 2])) break
                            if (2 != (0 | St[(16 + (0 | St[(4 + (0 | St[n >> 2])) >> 2]) + 4) >> 2])) break
                            return (St[t >> 2] = 0), (o = 0 | St[t >> 2]), (pt = r), 0 | o
                          }
                        } while (0)
                        return (St[t >> 2] = 4), (o = 0 | St[t >> 2]), (pt = r), 0 | o
                      }
                      return (St[t >> 2] = 4), (o = 0 | St[t >> 2]), (pt = r), 0 | o
                    }
                    return (St[t >> 2] = 4), (o = 0 | St[t >> 2]), (pt = r), 0 | o
                  })(0 | St[E >> 2])),
                (St[A >> 2] = l),
                0 | St[A >> 2])
              )
                return (St[d >> 2] = St[A >> 2]), (G = 0 | St[d >> 2]), (pt = c), 0 | G
              St[y >> 2] = 0
              e: for (;;) {
                if ((0 | St[y >> 2]) >>> 0 >= (0 | St[(16 + (0 | St[E >> 2])) >> 2]) >>> 0) {
                  q = 55
                  break
                }
                St[R >> 2] = (0 | St[St[E >> 2] >> 2]) + ((24 * (0 | St[y >> 2])) | 0)
                r: do {
                  if (0 | ge(0 | St[(8 + (0 | St[R >> 2])) >> 2])) {
                    ;(St[g >> 2] = 0), (St[D >> 2] = St[h >> 2]), (St[P >> 2] = St[p >> 2])
                    do {
                      if (4 == (0 | St[(16 + (0 | St[E >> 2])) >> 2])) {
                        if (
                          ((St[C >> 2] = St[2]),
                          (St[(4 + C) >> 2] = St[3]),
                          (St[(8 + C) >> 2] = St[4]),
                          (A = ((0 | St[(12 + (0 | St[E >> 2])) >> 2]) + (St[y >> 2] << 3)) | 0),
                          (l = 0 | St[(A + 4) >> 2]),
                          (St[(f = I) >> 2] = St[A >> 2]),
                          (St[(f + 4) >> 2] = l),
                          (St[g >> 2] = St[(C + (St[y >> 2] << 2)) >> 2]),
                          (0 | St[y >> 2]) >>> 0 < 2)
                        ) {
                          if (
                            ((St[P >> 2] = St[I >> 2]),
                            0 != (0 | St[((l = I) + 4) >> 2]) || (0 | St[P >> 2]) != (0 | St[l >> 2]))
                          ) {
                            q = 9
                            break e
                          }
                          if (
                            ((l = 0 | sr[3 & St[St[b >> 2] >> 2]](0 | St[b >> 2], 0 | St[P >> 2])),
                            (St[L >> 2] = l),
                            (0 == (0 | St[L >> 2])) & (0 != (0 | St[P >> 2])))
                          ) {
                            q = 11
                            break e
                          }
                          ;(l = 0 | St[L >> 2]),
                            (St[((0 | St[k >> 2]) + ((1 - (0 | St[y >> 2])) << 2)) >> 2] = l),
                            (St[D >> 2] = l),
                            (St[(v + ((1 - (0 | St[y >> 2])) << 2)) >> 2] = St[P >> 2])
                          break
                        }
                        if (2 != (0 | St[y >> 2])) {
                          q = 17
                          break e
                        }
                        if (
                          (0 < (f = 0 | St[((l = I) + 4) >> 2]) >>> 0) |
                          (0 == (0 | f) ? (0 | St[l >> 2]) >>> 0 > (0 | St[p >> 2]) >>> 0 : 0)
                        ) {
                          q = 15
                          break e
                        }
                        ;(l = ((0 | St[h >> 2]) + ((0 | St[p >> 2]) - (0 | St[I >> 2]))) | 0),
                          (St[D >> 2] = l),
                          (St[O >> 2] = l),
                          (l = 0 | St[I >> 2]),
                          (St[P >> 2] = l),
                          (St[M >> 2] = l)
                        break
                      }
                    } while (0)
                    if (
                      ((l = 0 | Te(0 | St[_ >> 2], 0 | St[g >> 2])),
                      (St[(f = T) >> 2] = l),
                      (St[(f + 4) >> 2] = Ft),
                      (f = ((0 | St[_ >> 2]) + (St[g >> 2] << 3)) | 0),
                      (l = 0 | St[(f + 4) >> 2]),
                      (St[(A = N) >> 2] = St[f >> 2]),
                      (St[(A + 4) >> 2] = l),
                      (l = 0 | St[S >> 2]),
                      (f = T),
                      (s = 0 | Dt(0 | St[(A = m) >> 2], 0 | St[(A + 4) >> 2], 0 | St[f >> 2], 0 | St[(f + 4) >> 2])),
                      (f = 0 | he(l, s, Ft)),
                      (St[x >> 2] = f),
                      0 | St[x >> 2])
                    ) {
                      q = 19
                      break e
                    }
                    if (((f = (8 + (0 | St[R >> 2])) | 0), (0 == (0 | St[f >> 2])) & (0 == (0 | St[(f + 4) >> 2])))) {
                      if (0 | St[((f = N) + 4) >> 2] || (0 | St[f >> 2]) != (0 | St[P >> 2])) {
                        q = 22
                        break e
                      }
                      if (
                        ((s =
                          0 |
                          Ne(
                            0 | St[(f = N) >> 2],
                            0 | St[(f + 4) >> 2],
                            0 | St[S >> 2],
                            0 | St[D >> 2],
                            0 | St[F >> 2],
                            0 | St[w >> 2]
                          )),
                        (St[B >> 2] = s),
                        0 | St[B >> 2])
                      ) {
                        q = 24
                        break e
                      }
                      break
                    }
                    if (
                      ((s = (8 + (0 | St[R >> 2])) | 0),
                      (f = 0 | St[R >> 2]),
                      (196865 == (0 | St[s >> 2])) & (0 == (0 | St[(s + 4) >> 2])))
                    ) {
                      if (
                        ((l =
                          0 |
                          (function (e, r, t, n, i, o, a, u, s) {
                            ;(e |= 0), (r |= 0), (t |= 0), (n |= 0), (i |= 0), (o |= 0), (a |= 0), (u |= 0), (s |= 0)
                            var f = 0,
                              l = 0,
                              c = 0,
                              d = 0,
                              E = 0,
                              _ = 0,
                              S = 0,
                              m = 0,
                              h = 0,
                              p = 0,
                              b = 0,
                              k = 0,
                              F = 0,
                              w = 0,
                              y = 0,
                              v = 0,
                              M = 0,
                              O = 0,
                              A = 0,
                              R = 0
                            ;(0 | (pt = ((f = pt) + 192) | 0)) >= (0 | bt) && yt(192)
                            if (
                              ((l = (f + 180) | 0),
                              (E = ((d = f) + 172) | 0),
                              (_ = (f + 168) | 0),
                              (S = (f + 164) | 0),
                              (m = (f + 160) | 0),
                              (h = (f + 156) | 0),
                              (p = (f + 152) | 0),
                              (b = (f + 40) | 0),
                              (k = (f + 32) | 0),
                              (F = (f + 28) | 0),
                              (w = (f + 24) | 0),
                              (y = (f + 20) | 0),
                              (v = (f + 16) | 0),
                              (M = (f + 12) | 0),
                              (O = (f + 8) | 0),
                              (St[(c = (f + 176) | 0) >> 2] = e),
                              (St[(e = d) >> 2] = r),
                              (St[(e + 4) >> 2] = t),
                              (St[E >> 2] = n),
                              (St[_ >> 2] = i),
                              (St[S >> 2] = o),
                              (St[m >> 2] = a),
                              (St[h >> 2] = u),
                              (St[p >> 2] = s),
                              (St[k >> 2] = 0),
                              (St[(20 + b) >> 2] = 0),
                              (St[(16 + b) >> 2] = 0),
                              (s =
                                0 |
                                Ae(
                                  b,
                                  0 | St[(16 + (0 | St[c >> 2])) >> 2],
                                  0 | St[(16 + (0 | St[c >> 2]) + 4) >> 2],
                                  0 | St[m >> 2]
                                )),
                              (St[F >> 2] = s),
                              0 | St[F >> 2])
                            )
                              return (St[l >> 2] = St[F >> 2]), (A = 0 | St[l >> 2]), (pt = f), 0 | A
                            ;(St[(20 + b) >> 2] = St[_ >> 2]),
                              (St[(40 + b) >> 2] = St[S >> 2]),
                              ke(b),
                              (St[p >> 2] = (0 | St[p >> 2]) + (0 | St[S >> 2]))
                            do {
                              if (
                                ((St[w >> 2] = 0),
                                (St[y >> 2] = 262144),
                                ((F = 0 | St[((_ = d) + 4) >> 2]) >>> 0 < 0) |
                                  (0 == (0 | F) ? (0 | St[y >> 2]) >>> 0 > (0 | St[_ >> 2]) >>> 0 : 0) &&
                                  (St[y >> 2] = St[d >> 2]),
                                (_ = 0 | nr[15 & St[St[E >> 2] >> 2]](0 | St[E >> 2], w, y)),
                                (St[k >> 2] = _),
                                0 | St[k >> 2])
                              )
                                break
                              if (
                                ((St[v >> 2] = St[y >> 2]),
                                (St[M >> 2] = St[(36 + b) >> 2]),
                                (_ = 0 | Fe(b, 0 | St[S >> 2], 0 | St[w >> 2], v, 1, O)),
                                (St[k >> 2] = _),
                                (St[y >> 2] = (0 | St[y >> 2]) - (0 | St[v >> 2])),
                                (F = 0 | Nt(0 | St[(_ = d) >> 2], 0 | St[(_ + 4) >> 2], 0 | St[v >> 2], 0)),
                                (St[(_ = d) >> 2] = F),
                                (St[(_ + 4) >> 2] = Ft),
                                Q(2, ((0 | St[p >> 2]) - (0 | St[S >> 2]) + (0 | St[M >> 2])) | 0, 0 | St[h >> 2]),
                                0 | St[k >> 2])
                              )
                                break
                              if ((0 | St[(36 + b) >> 2]) == (0 | St[(40 + b) >> 2])) {
                                R = 11
                                break
                              }
                              if (0 == (0 | St[v >> 2]) && (0 | St[M >> 2]) == (0 | St[(36 + b) >> 2])) {
                                R = 11
                                break
                              }
                            } while (
                              ((_ = 0 | sr[3 & St[(4 + (0 | St[E >> 2])) >> 2]](0 | St[E >> 2], 0 | St[v >> 2])),
                              (St[k >> 2] = _),
                              !(0 | St[k >> 2]))
                            )
                            do {
                              if (11 == (0 | R)) {
                                if (
                                  !(0 | St[y >> 2] || (0 | St[(40 + b) >> 2]) != (0 | St[S >> 2])) &&
                                  !((1 != (0 | St[O >> 2])) & (4 != (0 | St[O >> 2])))
                                )
                                  break
                                St[k >> 2] = 1
                              }
                            } while (0)
                            return (
                              Oe(b, 0 | St[m >> 2]), (St[l >> 2] = St[k >> 2]), (A = 0 | St[l >> 2]), (pt = f), 0 | A
                            )
                          })(
                            f,
                            0 | St[(s = N) >> 2],
                            0 | St[(s + 4) >> 2],
                            0 | St[S >> 2],
                            0 | St[D >> 2],
                            0 | St[P >> 2],
                            0 | St[b >> 2],
                            0 | St[F >> 2],
                            0 | St[w >> 2]
                          )),
                        (St[H >> 2] = l),
                        0 | St[H >> 2])
                      ) {
                        q = 27
                        break e
                      }
                      break
                    }
                    if (!((33 == (0 | St[(l = (f + 8) | 0) >> 2])) & (0 == (0 | St[(l + 4) >> 2])))) {
                      q = 31
                      break e
                    }
                    if (
                      ((l = N),
                      (f =
                        0 |
                        (function (e, r, t, n, i, o, a, u, s) {
                          ;(e |= 0), (r |= 0), (t |= 0), (n |= 0), (i |= 0), (o |= 0), (a |= 0), (u |= 0), (s |= 0)
                          var f = 0,
                            l = 0,
                            c = 0,
                            d = 0,
                            E = 0,
                            _ = 0,
                            S = 0,
                            m = 0,
                            h = 0,
                            p = 0,
                            b = 0,
                            k = 0,
                            F = 0,
                            w = 0,
                            y = 0,
                            v = 0,
                            M = 0,
                            O = 0,
                            A = 0,
                            R = 0
                          ;(0 | (pt = ((f = pt) + 208) | 0)) >= (0 | bt) && yt(208)
                          if (
                            ((l = (f + 204) | 0),
                            (E = ((d = f) + 196) | 0),
                            (_ = (f + 192) | 0),
                            (S = (f + 188) | 0),
                            (m = (f + 184) | 0),
                            (h = (f + 180) | 0),
                            (p = (f + 176) | 0),
                            (b = (f + 36) | 0),
                            (k = (f + 32) | 0),
                            (F = (f + 28) | 0),
                            (w = (f + 24) | 0),
                            (y = (f + 20) | 0),
                            (v = (f + 16) | 0),
                            (M = (f + 12) | 0),
                            (O = (f + 8) | 0),
                            (St[(c = (f + 200) | 0) >> 2] = e),
                            (St[(e = d) >> 2] = r),
                            (St[(e + 4) >> 2] = t),
                            (St[E >> 2] = n),
                            (St[_ >> 2] = i),
                            (St[S >> 2] = o),
                            (St[m >> 2] = a),
                            (St[h >> 2] = u),
                            (St[p >> 2] = s),
                            (St[k >> 2] = 0),
                            (St[(20 + b) >> 2] = 0),
                            (St[(16 + b) >> 2] = 0),
                            1 != (0 | St[(16 + (0 | St[c >> 2]) + 4) >> 2]))
                          )
                            return (St[l >> 2] = 1), (A = 0 | St[l >> 2]), (pt = f), 0 | A
                          if (
                            ((s =
                              0 |
                              (function (e, r, t) {
                                ;(e |= 0), (r |= 0), (t |= 0)
                                var n = 0,
                                  i = 0,
                                  o = 0,
                                  a = 0,
                                  u = 0,
                                  s = 0,
                                  f = 0,
                                  l = 0
                                ;(0 | (pt = ((n = pt) + 32) | 0)) >= (0 | bt) && yt(32)
                                return (
                                  (i = (n + 12) | 0),
                                  (a = (n + 21) | 0),
                                  (u = (n + 4) | 0),
                                  (s = (n + 16) | 0),
                                  (St[(o = ((f = n) + 8) | 0) >> 2] = e),
                                  (Et[a >> 0] = r),
                                  (St[u >> 2] = t),
                                  (t =
                                    0 |
                                    (function (e, r) {
                                      ;(e |= 0), (r |= 0)
                                      var t = 0,
                                        n = 0,
                                        i = 0,
                                        o = 0,
                                        a = 0,
                                        u = 0,
                                        s = 0
                                      ;(0 | (pt = ((t = pt) + 16) | 0)) >= (0 | bt) && yt(16)
                                      if (
                                        ((n = (t + 8) | 0),
                                        (o = (t + 4) | 0),
                                        (Et[(i = ((a = t) + 12) | 0) >> 0] = e),
                                        (St[o >> 2] = r),
                                        40 < (0 | mt[i >> 0]))
                                      )
                                        return (St[n >> 2] = 4), (u = 0 | St[n >> 2]), (pt = t), 0 | u
                                      s =
                                        40 == (0 | mt[i >> 0])
                                          ? -1
                                          : (2 | (1 & (0 | mt[i >> 0]))) << (11 + (((0 | mt[i >> 0]) / 2) | 0))
                                      return (
                                        (St[a >> 2] = s),
                                        (Et[St[o >> 2] >> 0] = 4),
                                        (Et[(1 + (0 | St[o >> 2])) >> 0] = St[a >> 2]),
                                        (Et[(2 + (0 | St[o >> 2])) >> 0] = (0 | St[a >> 2]) >>> 8),
                                        (Et[(3 + (0 | St[o >> 2])) >> 0] = (0 | St[a >> 2]) >>> 16),
                                        (Et[(4 + (0 | St[o >> 2])) >> 0] = (0 | St[a >> 2]) >>> 24),
                                        (St[n >> 2] = 0),
                                        (u = 0 | St[n >> 2]),
                                        (pt = t),
                                        0 | u
                                      )
                                    })(0 | Et[a >> 0], s)),
                                  (St[f >> 2] = t),
                                  (pt =
                                    ((l =
                                      (0 | St[f >> 2]
                                        ? (St[i >> 2] = St[f >> 2])
                                        : ((f = 0 | Ae(0 | St[o >> 2], s, 5, 0 | St[u >> 2])), (St[i >> 2] = f)),
                                      0 | St[i >> 2])),
                                    n)),
                                  0 | l
                                )
                              })(b, 0 | Et[St[(16 + (0 | St[c >> 2])) >> 2] >> 0], 0 | St[m >> 2])),
                            (St[F >> 2] = s),
                            0 | St[F >> 2])
                          )
                            return (St[l >> 2] = St[F >> 2]), (A = 0 | St[l >> 2]), (pt = f), 0 | A
                          ;(St[(20 + b) >> 2] = St[_ >> 2]),
                            (St[(40 + b) >> 2] = St[S >> 2]),
                            (function (e) {
                              e |= 0
                              var r = 0,
                                t = 0
                              ;(0 | (pt = ((r = pt) + 16) | 0)) >= (0 | bt) && yt(16),
                                (St[(t = r) >> 2] = e),
                                (St[(120 + (0 | St[t >> 2])) >> 2] = 0),
                                (St[(128 + (0 | St[t >> 2])) >> 2] = 1),
                                (St[(132 + (0 | St[t >> 2])) >> 2] = 1),
                                (St[(136 + (0 | St[t >> 2])) >> 2] = 1),
                                ke(0 | St[t >> 2]),
                                (pt = r)
                            })(b),
                            (St[p >> 2] = (0 | St[p >> 2]) + (0 | St[S >> 2]))
                          do {
                            if (
                              ((St[w >> 2] = 0),
                              (St[y >> 2] = 262144),
                              ((F = 0 | St[((_ = d) + 4) >> 2]) >>> 0 < 0) |
                                (0 == (0 | F) ? (0 | St[y >> 2]) >>> 0 > (0 | St[_ >> 2]) >>> 0 : 0) &&
                                (St[y >> 2] = St[d >> 2]),
                              (_ = 0 | nr[15 & St[St[E >> 2] >> 2]](0 | St[E >> 2], w, y)),
                              (St[k >> 2] = _),
                              0 | St[k >> 2])
                            )
                              break
                            if (
                              ((St[v >> 2] = St[y >> 2]),
                              (St[M >> 2] = St[(36 + b) >> 2]),
                              (_ =
                                0 |
                                (function (e, r, t, n, i, o) {
                                  ;(e |= 0), (r |= 0), (t |= 0), (n |= 0), (i |= 0), (o |= 0)
                                  var a = 0,
                                    u = 0,
                                    s = 0,
                                    f = 0,
                                    l = 0,
                                    c = 0,
                                    d = 0,
                                    E = 0,
                                    _ = 0,
                                    S = 0,
                                    m = 0,
                                    h = 0,
                                    p = 0,
                                    b = 0,
                                    k = 0,
                                    F = 0,
                                    w = 0,
                                    y = 0,
                                    v = 0,
                                    M = 0,
                                    O = 0,
                                    A = 0
                                  ;(0 | (pt = ((a = pt) + 80) | 0)) >= (0 | bt) && yt(80)
                                  ;(u = (a + 72) | 0),
                                    (f = (a + 64) | 0),
                                    (l = (a + 60) | 0),
                                    (c = (a + 56) | 0),
                                    (d = (a + 52) | 0),
                                    (E = (a + 48) | 0),
                                    (_ = (a + 44) | 0),
                                    (S = (a + 40) | 0),
                                    (m = (a + 36) | 0),
                                    (h = (a + 32) | 0),
                                    (p = (a + 28) | 0),
                                    (b = (a + 24) | 0),
                                    (k = (a + 20) | 0),
                                    (F = (a + 16) | 0),
                                    (w = (a + 12) | 0),
                                    (y = (a + 8) | 0),
                                    (v = (a + 4) | 0),
                                    (St[(s = ((M = a) + 68) | 0) >> 2] = e),
                                    (St[f >> 2] = r),
                                    (St[l >> 2] = t),
                                    (St[c >> 2] = n),
                                    (St[d >> 2] = i),
                                    (St[E >> 2] = o),
                                    (St[_ >> 2] = St[St[c >> 2] >> 2]),
                                    (St[St[c >> 2] >> 2] = 0),
                                    (St[St[E >> 2] >> 2] = 0)
                                  for (;;) {
                                    if (8 == (0 | St[(120 + (0 | St[s >> 2])) >> 2])) {
                                      O = 49
                                      break
                                    }
                                    if (
                                      ((St[S >> 2] = St[(36 + (0 | St[s >> 2])) >> 2]),
                                      9 == (0 | St[(120 + (0 | St[s >> 2])) >> 2]))
                                    ) {
                                      O = 4
                                      break
                                    }
                                    if (0 == (0 | St[d >> 2]) && (0 | St[S >> 2]) == (0 | St[f >> 2])) {
                                      O = 6
                                      break
                                    }
                                    if (
                                      6 == (0 | St[(120 + (0 | St[s >> 2])) >> 2]) ||
                                      7 == (0 | St[(120 + (0 | St[s >> 2])) >> 2])
                                    )
                                      if (
                                        ((St[m >> 2] = (0 | St[f >> 2]) - (0 | St[S >> 2])),
                                        (St[h >> 2] = (0 | St[_ >> 2]) - (0 | St[St[c >> 2] >> 2])),
                                        ((St[p >> 2] = 0) | St[(116 + (0 | St[s >> 2])) >> 2]) >>> 0 <=
                                          (0 | St[m >> 2]) >>> 0 &&
                                          ((St[m >> 2] = St[(116 + (0 | St[s >> 2])) >> 2]), (St[p >> 2] = 1)),
                                        128 & (0 | mt[(124 + (0 | St[s >> 2])) >> 0]))
                                      ) {
                                        if (6 == (0 | St[(120 + (0 | St[s >> 2])) >> 2])) {
                                          if (
                                            ((St[w >> 2] = ((0 | mt[(124 + (0 | St[s >> 2])) >> 0]) >> 5) & 3),
                                            (St[y >> 2] = (3 == (0 | St[w >> 2])) & 1),
                                            (St[v >> 2] = (0 < (0 | St[w >> 2])) & 1),
                                            0 == (0 | St[y >> 2]) && 0 | St[(128 + (0 | St[s >> 2])) >> 2])
                                          ) {
                                            O = 33
                                            break
                                          }
                                          if (0 == (0 | St[v >> 2]) && 0 | St[(132 + (0 | St[s >> 2])) >> 2]) {
                                            O = 33
                                            break
                                          }
                                          be(0 | St[s >> 2], 0 | St[y >> 2], 0 | St[v >> 2]),
                                            (St[(128 + (0 | St[s >> 2])) >> 2] = 0),
                                            (St[(132 + (0 | St[s >> 2])) >> 2] = 0),
                                            (St[(120 + (0 | St[s >> 2])) >> 2] = 7)
                                        }
                                        if (
                                          ((0 | St[h >> 2]) >>> 0 > (0 | St[(112 + (0 | St[s >> 2])) >> 2]) >>> 0 &&
                                            (St[h >> 2] = St[(112 + (0 | St[s >> 2])) >> 2]),
                                          (n =
                                            0 |
                                            Fe(
                                              0 | St[s >> 2],
                                              ((0 | St[S >> 2]) + (0 | St[m >> 2])) | 0,
                                              0 | St[l >> 2],
                                              h,
                                              0 | St[p >> 2],
                                              0 | St[E >> 2]
                                            )),
                                          (St[F >> 2] = n),
                                          (St[l >> 2] = (0 | St[l >> 2]) + (0 | St[h >> 2])),
                                          (n = 0 | St[c >> 2]),
                                          (St[n >> 2] = (0 | St[n >> 2]) + (0 | St[h >> 2])),
                                          (n = (112 + (0 | St[s >> 2])) | 0),
                                          (St[n >> 2] = (0 | St[n >> 2]) - (0 | St[h >> 2])),
                                          (St[k >> 2] = (0 | St[(36 + (0 | St[s >> 2])) >> 2]) - (0 | St[S >> 2])),
                                          (n = (116 + (0 | St[s >> 2])) | 0),
                                          (St[n >> 2] = (0 | St[n >> 2]) - (0 | St[k >> 2])),
                                          (St[M >> 2] = St[F >> 2]),
                                          0 | St[M >> 2])
                                        ) {
                                          O = 38
                                          break
                                        }
                                        if (3 == (0 | St[St[E >> 2] >> 2])) {
                                          O = 40
                                          break
                                        }
                                        if ((0 == (0 | St[h >> 2])) & (0 == (0 | St[k >> 2]))) {
                                          if (4 != (0 | St[St[E >> 2] >> 2])) {
                                            O = 45
                                            break
                                          }
                                          if (0 | St[(116 + (0 | St[s >> 2])) >> 2]) {
                                            O = 45
                                            break
                                          }
                                          if (0 | St[(112 + (0 | St[s >> 2])) >> 2]) {
                                            O = 45
                                            break
                                          }
                                          St[(120 + (0 | St[s >> 2])) >> 2] = 0
                                        }
                                        4 == (0 | St[St[E >> 2] >> 2]) && (St[St[E >> 2] >> 2] = 2)
                                      } else {
                                        if ((0 | St[St[c >> 2] >> 2]) == (0 | St[_ >> 2])) {
                                          O = 16
                                          break
                                        }
                                        if (6 == (0 | St[(120 + (0 | St[s >> 2])) >> 2])) {
                                          if (
                                            ((St[b >> 2] = (1 == (0 | mt[(124 + (0 | St[s >> 2])) >> 0])) & 1),
                                            (n = 0 | St[s >> 2]),
                                            0 | St[b >> 2])
                                          )
                                            (St[(n + 132) >> 2] = 1), (St[(136 + (0 | St[s >> 2])) >> 2] = 1)
                                          else if (0 | St[(n + 128) >> 2]) {
                                            O = 21
                                            break
                                          }
                                          be((St[(128 + (0 | St[s >> 2])) >> 2] = 0) | St[s >> 2], 0 | St[b >> 2], 0)
                                        }
                                        if (
                                          ((0 | St[h >> 2]) >>> 0 > (0 | St[m >> 2]) >>> 0 && (St[h >> 2] = St[m >> 2]),
                                          !(0 | St[h >> 2]))
                                        ) {
                                          O = 26
                                          break
                                        }
                                        !(function (e, r, t) {
                                          ;(e |= 0), (r |= 0), (t |= 0)
                                          var n = 0,
                                            i = 0,
                                            o = 0,
                                            a = 0
                                          ;(0 | (pt = ((n = pt) + 16) | 0)) >= (0 | bt) && yt(16),
                                            (o = (n + 4) | 0),
                                            (St[(i = ((a = n) + 8) | 0) >> 2] = e),
                                            (St[o >> 2] = r),
                                            (St[a >> 2] = t),
                                            Je(
                                              ((0 | St[(20 + (0 | St[i >> 2])) >> 2]) +
                                                (0 | St[(36 + (0 | St[i >> 2])) >> 2])) |
                                                0,
                                              0 | St[o >> 2],
                                              0 | St[a >> 2]
                                            ),
                                            (o = (36 + (0 | St[i >> 2])) | 0),
                                            (St[o >> 2] = (0 | St[o >> 2]) + (0 | St[a >> 2])),
                                            0 == (0 | St[(48 + (0 | St[i >> 2])) >> 2]) &&
                                              (((0 | St[(12 + (0 | St[i >> 2])) >> 2]) -
                                                (0 | St[(44 + (0 | St[i >> 2])) >> 2])) |
                                                0) >>>
                                                0 <=
                                                (0 | St[a >> 2]) >>> 0 &&
                                              (St[(48 + (0 | St[i >> 2])) >> 2] = St[(12 + (0 | St[i >> 2])) >> 2]),
                                            (o = (44 + (0 | St[i >> 2])) | 0),
                                            (St[o >> 2] = (0 | St[o >> 2]) + (0 | St[a >> 2])),
                                            (pt = n)
                                        })(0 | St[s >> 2], 0 | St[l >> 2], 0 | St[h >> 2]),
                                          (St[l >> 2] = (0 | St[l >> 2]) + (0 | St[h >> 2])),
                                          (n = 0 | St[c >> 2]),
                                          (St[n >> 2] = (0 | St[n >> 2]) + (0 | St[h >> 2])),
                                          (n = (116 + (0 | St[s >> 2])) | 0),
                                          (St[n >> 2] = (0 | St[n >> 2]) - (0 | St[h >> 2])),
                                          (St[(120 + (0 | St[s >> 2])) >> 2] =
                                            0 == (0 | St[(116 + (0 | St[s >> 2])) >> 2]) ? 0 : 7)
                                      }
                                    else {
                                      if ((0 | St[St[c >> 2] >> 2]) == (0 | St[_ >> 2])) {
                                        O = 10
                                        break
                                      }
                                      ;(o = 0 | St[c >> 2]),
                                        (St[o >> 2] = 1 + (0 | St[o >> 2])),
                                        (o = 0 | St[s >> 2]),
                                        (i = 0 | St[l >> 2]),
                                        (St[l >> 2] = i + 1),
                                        (n =
                                          0 |
                                          (function (e, r) {
                                            ;(e |= 0), (r |= 0)
                                            var t = 0,
                                              n = 0,
                                              i = 0,
                                              o = 0,
                                              a = 0,
                                              u = 0,
                                              s = 0,
                                              f = 0
                                            ;(0 | (pt = ((t = pt) + 32) | 0)) >= (0 | bt) && yt(32)
                                            switch (
                                              ((n = (t + 12) | 0),
                                              (o = (t + 16) | 0),
                                              (a = (t + 4) | 0),
                                              (St[(i = ((u = t) + 8) | 0) >> 2] = e),
                                              (Et[o >> 0] = r),
                                              0 | St[(120 + (0 | St[i >> 2])) >> 2])
                                            ) {
                                              case 0:
                                                if (
                                                  ((Et[(124 + (0 | St[i >> 2])) >> 0] = 0 | Et[o >> 0]),
                                                  !(0 | mt[(124 + (0 | St[i >> 2])) >> 0]))
                                                )
                                                  return (St[n >> 2] = 8), (s = 0 | St[n >> 2]), (pt = t), 0 | s
                                                r = 0 | mt[(124 + (0 | St[i >> 2])) >> 0]
                                                do {
                                                  if (!(128 & (0 | mt[(124 + (0 | St[i >> 2])) >> 0]))) {
                                                    if (((127 & r) | 0) <= 2) {
                                                      St[(116 + (0 | St[i >> 2])) >> 2] = 0
                                                      break
                                                    }
                                                    return (St[n >> 2] = 9), (s = 0 | St[n >> 2]), (pt = t), 0 | s
                                                  }
                                                } while (((St[(116 + (0 | St[i >> 2])) >> 2] = (31 & r) << 16), 0))
                                                return (St[n >> 2] = 1), (s = 0 | St[n >> 2]), (pt = t), 0 | s
                                              case 1:
                                                return (
                                                  (r = (116 + (0 | St[i >> 2])) | 0),
                                                  (St[r >> 2] = St[r >> 2] | ((0 | mt[o >> 0]) << 8)),
                                                  (St[n >> 2] = 2),
                                                  (s = 0 | St[n >> 2]),
                                                  (pt = t),
                                                  0 | s
                                                )
                                              case 2:
                                                return (
                                                  (r = (116 + (0 | St[i >> 2])) | 0),
                                                  (St[r >> 2] = 0 | St[r >> 2] | mt[o >> 0]),
                                                  (r = (116 + (0 | St[i >> 2])) | 0),
                                                  (St[r >> 2] = 1 + (0 | St[r >> 2])),
                                                  (St[n >> 2] =
                                                    0 == ((128 & (0 | mt[(124 + (0 | St[i >> 2])) >> 0])) | 0) ? 6 : 3),
                                                  (s = 0 | St[n >> 2]),
                                                  (pt = t),
                                                  0 | s
                                                )
                                              case 3:
                                                return (
                                                  (St[(112 + (0 | St[i >> 2])) >> 2] = (0 | mt[o >> 0]) << 8),
                                                  (St[n >> 2] = 4),
                                                  (s = 0 | St[n >> 2]),
                                                  (pt = t),
                                                  0 | s
                                                )
                                              case 4:
                                                return (
                                                  (r = (112 + (0 | St[i >> 2])) | 0),
                                                  (St[r >> 2] = 0 | St[r >> 2] | mt[o >> 0]),
                                                  (r = (112 + (0 | St[i >> 2])) | 0),
                                                  (St[r >> 2] = 1 + (0 | St[r >> 2])),
                                                  (f =
                                                    2 <= ((((0 | mt[(124 + (0 | St[i >> 2])) >> 0]) >> 5) & 3) | 0)
                                                      ? 5
                                                      : 0 | St[(136 + (0 | St[i >> 2])) >> 2]
                                                        ? 9
                                                        : 6),
                                                  (St[n >> 2] = f),
                                                  (s = 0 | St[n >> 2]),
                                                  (pt = t),
                                                  0 | s
                                                )
                                              case 5:
                                                return (
                                                  (pt =
                                                    ((s =
                                                      (225 <= (0 | mt[o >> 0])
                                                        ? (St[n >> 2] = 9)
                                                        : ((St[a >> 2] = (0 | mt[o >> 0]) % 9 | 0),
                                                          (Et[o >> 0] = ((0 | mt[o >> 0]) / 9) | 0),
                                                          (St[(8 + (0 | St[i >> 2])) >> 2] =
                                                            ((0 | mt[o >> 0]) / 5) | 0),
                                                          (St[u >> 2] = (0 | mt[o >> 0]) % 5 | 0),
                                                          4 < (((0 | St[a >> 2]) + (0 | St[u >> 2])) | 0)
                                                            ? (St[n >> 2] = 9)
                                                            : ((St[St[i >> 2] >> 2] = St[a >> 2]),
                                                              (St[(4 + (0 | St[i >> 2])) >> 2] = St[u >> 2]),
                                                              (St[(136 + (0 | St[i >> 2])) >> 2] = 0),
                                                              (St[n >> 2] = 6))),
                                                      0 | St[n >> 2])),
                                                    t)),
                                                  0 | s
                                                )
                                              default:
                                                return (St[n >> 2] = 9), (s = 0 | St[n >> 2]), (pt = t), 0 | s
                                            }
                                            return 0
                                          })(o, 0 | Et[i >> 0])),
                                        (St[(120 + (0 | St[s >> 2])) >> 2] = n)
                                    }
                                  }
                                  switch (0 | O) {
                                    case 4:
                                      return (St[u >> 2] = 1), (A = 0 | St[u >> 2]), (pt = a), 0 | A
                                    case 6:
                                      return (
                                        (St[St[E >> 2] >> 2] = 2),
                                        (St[u >> 2] = 0),
                                        (A = 0 | St[u >> 2]),
                                        (pt = a),
                                        0 | A
                                      )
                                    case 10:
                                    case 16:
                                      return (
                                        (St[St[E >> 2] >> 2] = 3),
                                        (St[u >> 2] = 0),
                                        (A = 0 | St[u >> 2]),
                                        (pt = a),
                                        0 | A
                                      )
                                    case 21:
                                    case 26:
                                    case 33:
                                      return (St[u >> 2] = 1), (A = 0 | St[u >> 2]), (pt = a), 0 | A
                                    case 38:
                                      return (St[u >> 2] = St[M >> 2]), (A = 0 | St[u >> 2]), (pt = a), 0 | A
                                    case 40:
                                      return (St[u >> 2] = St[F >> 2]), (A = 0 | St[u >> 2]), (pt = a), 0 | A
                                    case 45:
                                      return (St[u >> 2] = 1), (A = 0 | St[u >> 2]), (pt = a), 0 | A
                                    case 49:
                                      return (
                                        (St[St[E >> 2] >> 2] = 1),
                                        (St[u >> 2] = 0),
                                        (A = 0 | St[u >> 2]),
                                        (pt = a),
                                        0 | A
                                      )
                                  }
                                  return 0
                                })(b, 0 | St[S >> 2], 0 | St[w >> 2], v, 1, O)),
                              (St[k >> 2] = _),
                              (St[y >> 2] = (0 | St[y >> 2]) - (0 | St[v >> 2])),
                              (F = 0 | Nt(0 | St[(_ = d) >> 2], 0 | St[(_ + 4) >> 2], 0 | St[v >> 2], 0)),
                              (St[(_ = d) >> 2] = F),
                              (St[(_ + 4) >> 2] = Ft),
                              Q(2, ((0 | St[p >> 2]) - (0 | St[S >> 2]) + (0 | St[M >> 2])) | 0, 0 | St[h >> 2]),
                              0 | St[k >> 2])
                            )
                              break
                            if ((0 | St[(36 + b) >> 2]) == (0 | St[(40 + b) >> 2])) {
                              R = 13
                              break
                            }
                            if (0 == (0 | St[v >> 2]) && (0 | St[M >> 2]) == (0 | St[(36 + b) >> 2])) {
                              R = 13
                              break
                            }
                          } while (
                            ((_ = 0 | sr[3 & St[(4 + (0 | St[E >> 2])) >> 2]](0 | St[E >> 2], 0 | St[v >> 2])),
                            (St[k >> 2] = _),
                            !(0 | St[k >> 2]))
                          )
                          13 == (0 | R) &&
                            (0 | St[y >> 2] ? 1 : (0 | St[(40 + b) >> 2]) != (0 | St[S >> 2])) |
                              (1 != (0 | St[O >> 2])) &&
                            (St[k >> 2] = 1)
                          return Oe(b, 0 | St[m >> 2]), (St[l >> 2] = St[k >> 2]), (A = 0 | St[l >> 2]), (pt = f), 0 | A
                        })(
                          0 | St[R >> 2],
                          0 | St[l >> 2],
                          0 | St[(l + 4) >> 2],
                          0 | St[S >> 2],
                          0 | St[D >> 2],
                          0 | St[P >> 2],
                          0 | St[b >> 2],
                          0 | St[F >> 2],
                          0 | St[w >> 2]
                        )),
                      (St[U >> 2] = f),
                      0 | St[U >> 2])
                    ) {
                      q = 30
                      break e
                    }
                  } else {
                    if (
                      ((f = (8 + (0 | St[R >> 2])) | 0),
                      !((50528539 == (0 | St[f >> 2])) & (0 == (0 | St[(f + 4) >> 2]))))
                    ) {
                      if (1 != (0 | St[y >> 2])) {
                        q = 47
                        break e
                      }
                      switch (((f = (8 + (0 | St[R >> 2])) | 0), (l = 0 | St[(f + 4) >> 2]), 0 | St[f >> 2])) {
                        case 50528515:
                          if (0 | l) {
                            q = 53
                            break e
                          }
                          ;(function (e, r, t, n, i) {
                            ;(e |= 0), (r |= 0), (t |= 0), (n |= 0), (i |= 0)
                            var o,
                              a,
                              u,
                              s,
                              f,
                              l,
                              c,
                              d,
                              E,
                              _,
                              S,
                              m,
                              h,
                              p,
                              b,
                              k,
                              F = 0,
                              w = 0,
                              y = pt
                            if (
                              ((0 | bt) <= (0 | (pt = (pt + 64) | 0)) && yt(64),
                              (o = (y + 52) | 0),
                              (u = (y + 44) | 0),
                              (s = (y + 40) | 0),
                              (f = (y + 36) | 0),
                              (l = (y + 32) | 0),
                              (c = (y + 28) | 0),
                              (d = (y + 24) | 0),
                              (E = (y + 20) | 0),
                              (_ = (y + 16) | 0),
                              (S = (y + 12) | 0),
                              (m = (y + 57) | 0),
                              (h = (y + 8) | 0),
                              (p = (y + 4) | 0),
                              (b = (y + 56) | 0),
                              (St[(a = ((k = y) + 48) | 0) >> 2] = e),
                              (St[u >> 2] = r),
                              (St[s >> 2] = t),
                              (St[f >> 2] = n),
                              (St[l >> 2] = i),
                              (St[c >> 2] = 0),
                              (St[E >> 2] = 7 & St[St[f >> 2] >> 2]),
                              (0 | St[u >> 2]) >>> 0 < 5)
                            )
                              return (St[o >> 2] = 0), St[o >> 2], (pt = y)
                            ;(St[s >> 2] = 5 + (0 | St[s >> 2])), (St[d >> 2] = -1)
                            t: for (;;) {
                              for (
                                St[_ >> 2] = (0 | St[a >> 2]) + (0 | St[c >> 2]),
                                  St[S >> 2] = (0 | St[a >> 2]) + (0 | St[u >> 2]) - 4;
                                !((0 | St[_ >> 2]) >>> 0 >= (0 | St[S >> 2]) >>> 0) &&
                                232 != ((254 & mt[St[_ >> 2] >> 0]) | 0);

                              )
                                St[_ >> 2] = 1 + (0 | St[_ >> 2])
                              if (
                                ((St[c >> 2] = (0 | St[_ >> 2]) - (0 | St[a >> 2])),
                                (i = (0 | St[_ >> 2]) >>> 0 >= (0 | St[S >> 2]) >>> 0),
                                (St[d >> 2] = (0 | St[c >> 2]) - (0 | St[d >> 2])),
                                (F = 3 < (0 | St[d >> 2]) >>> 0),
                                i)
                              )
                                break
                              do {
                                if (F) St[E >> 2] = 0
                                else if (((St[E >> 2] = (St[E >> 2] << ((0 | St[d >> 2]) - 1)) & 7), 0 | St[E >> 2])) {
                                  if (
                                    ((Et[m >> 0] =
                                      0 | Et[((0 | St[_ >> 2]) + (4 - (0 | mt[(360 + (0 | St[E >> 2])) >> 0]))) >> 0]),
                                    0 | Et[(352 + (0 | St[E >> 2])) >> 0] && 0 | mt[m >> 0] && 255 != (0 | mt[m >> 0]))
                                  )
                                    break
                                  ;(St[d >> 2] = St[c >> 2]),
                                    (St[E >> 2] = ((St[E >> 2] << 1) & 7) | 1),
                                    (St[c >> 2] = 1 + (0 | St[c >> 2]))
                                  continue t
                                }
                              } while (0)
                              if (
                                ((St[d >> 2] = St[c >> 2]),
                                0 | mt[(4 + (0 | St[_ >> 2])) >> 0] && 255 != (0 | mt[(4 + (0 | St[_ >> 2])) >> 0]))
                              )
                                (St[E >> 2] = ((St[E >> 2] << 1) & 7) | 1), (St[c >> 2] = 1 + (0 | St[c >> 2]))
                              else {
                                for (
                                  St[h >> 2] =
                                    (mt[(4 + (0 | St[_ >> 2])) >> 0] << 24) |
                                    (mt[(3 + (0 | St[_ >> 2])) >> 0] << 16) |
                                    (mt[(2 + (0 | St[_ >> 2])) >> 0] << 8) |
                                    mt[(1 + (0 | St[_ >> 2])) >> 0];
                                  0 | St[l >> 2]
                                    ? (St[p >> 2] = (0 | St[s >> 2]) + (0 | St[c >> 2]) + (0 | St[h >> 2]))
                                    : (St[p >> 2] = (0 | St[h >> 2]) - ((0 | St[s >> 2]) + (0 | St[c >> 2]))),
                                    0 | St[E >> 2] &&
                                      ((St[k >> 2] = mt[(360 + (0 | St[E >> 2])) >> 0] << 3),
                                      (Et[b >> 0] = (0 | St[p >> 2]) >>> ((24 - (0 | St[k >> 2])) | 0)),
                                      !(0 | mt[b >> 0] && 255 != (0 | mt[b >> 0])));

                                )
                                  St[h >> 2] = St[p >> 2] ^ ((1 << (32 - (0 | St[k >> 2]))) - 1)
                                ;(Et[(4 + (0 | St[_ >> 2])) >> 0] = ~((((0 | St[p >> 2]) >>> 24) & 1) - 1)),
                                  (Et[(3 + (0 | St[_ >> 2])) >> 0] = (0 | St[p >> 2]) >>> 16),
                                  (Et[(2 + (0 | St[_ >> 2])) >> 0] = (0 | St[p >> 2]) >>> 8),
                                  (Et[(1 + (0 | St[_ >> 2])) >> 0] = St[p >> 2]),
                                  (St[c >> 2] = 5 + (0 | St[c >> 2]))
                              }
                            }
                            ;(w = F ? 0 : (St[E >> 2] << ((0 | St[d >> 2]) - 1)) & 7),
                              (St[St[f >> 2] >> 2] = w),
                              (St[o >> 2] = St[c >> 2]),
                              St[o >> 2],
                              (pt = y)
                          })((St[X >> 2] = 0) | St[h >> 2], 0 | St[p >> 2], 0, X, 0)
                          break r
                        case 50529537:
                          if (0 | l) {
                            q = 53
                            break e
                          }
                          !(function (e, r, t, n) {
                            ;(e |= 0), (r |= 0), (t |= 0), (n |= 0)
                            var i,
                              o,
                              a,
                              u,
                              s,
                              f,
                              l,
                              c,
                              d = 0,
                              E = pt
                            if (
                              ((0 | bt) <= (0 | (pt = (pt + 32) | 0)) && yt(32),
                              (i = (E + 28) | 0),
                              (a = (E + 20) | 0),
                              (u = (E + 16) | 0),
                              (s = (E + 12) | 0),
                              (f = (E + 8) | 0),
                              (l = (E + 4) | 0),
                              (St[(o = ((c = E) + 24) | 0) >> 2] = e),
                              (St[a >> 2] = r),
                              (St[u >> 2] = t),
                              (St[s >> 2] = n),
                              (0 | St[a >> 2]) >>> 0 < 4)
                            )
                              return (St[i >> 2] = 0), St[i >> 2], (pt = E)
                            for (
                              St[a >> 2] = (0 | St[a >> 2]) - 4, St[u >> 2] = 8 + (0 | St[u >> 2]), St[f >> 2] = 0;
                              (d = 0 | St[f >> 2]), !((0 | St[f >> 2]) >>> 0 > (0 | St[a >> 2]) >>> 0);

                            )
                              235 == (0 | mt[((0 | St[o >> 2]) + (d + 3)) >> 0]) &&
                                ((St[c >> 2] =
                                  ((0 | mt[((0 | St[o >> 2]) + (2 + (0 | St[f >> 2]))) >> 0]) << 16) |
                                  ((0 | mt[((0 | St[o >> 2]) + (1 + (0 | St[f >> 2]))) >> 0]) << 8) |
                                  0 |
                                  mt[((0 | St[o >> 2]) + (0 | St[f >> 2])) >> 0]),
                                (St[c >> 2] = St[c >> 2] << 2),
                                0 | St[s >> 2]
                                  ? (St[l >> 2] = (0 | St[u >> 2]) + (0 | St[f >> 2]) + (0 | St[c >> 2]))
                                  : (St[l >> 2] = (0 | St[c >> 2]) - ((0 | St[u >> 2]) + (0 | St[f >> 2]))),
                                (St[l >> 2] = (0 | St[l >> 2]) >>> 2),
                                (Et[((0 | St[o >> 2]) + (2 + (0 | St[f >> 2]))) >> 0] = (0 | St[l >> 2]) >>> 16),
                                (Et[((0 | St[o >> 2]) + (1 + (0 | St[f >> 2]))) >> 0] = (0 | St[l >> 2]) >>> 8),
                                (Et[((0 | St[o >> 2]) + (0 | St[f >> 2])) >> 0] = St[l >> 2])),
                                (St[f >> 2] = 4 + (0 | St[f >> 2]))
                            ;(St[i >> 2] = d), St[i >> 2], (pt = E)
                          })(0 | St[h >> 2], 0 | St[p >> 2], 0, 0)
                          break r
                        default:
                          q = 53
                          break e
                      }
                    }
                    if (
                      ((l = 0 | Te(0 | St[_ >> 2], 1)),
                      (St[(f = z) >> 2] = l),
                      (St[(f + 4) >> 2] = Ft),
                      (f = (8 + (0 | St[_ >> 2])) | 0),
                      (l = 0 | St[(f + 4) >> 2]),
                      (St[(s = Y) >> 2] = St[f >> 2]),
                      (St[(s + 4) >> 2] = l),
                      3 != (0 | St[y >> 2]))
                    ) {
                      q = 34
                      break e
                    }
                    if (
                      ((l = 0 | St[S >> 2]),
                      (f = z),
                      (A = 0 | Dt(0 | St[(s = m) >> 2], 0 | St[(s + 4) >> 2], 0 | St[f >> 2], 0 | St[(f + 4) >> 2])),
                      (f = 0 | he(l, A, Ft)),
                      (St[K >> 2] = f),
                      0 | St[K >> 2])
                    ) {
                      q = 36
                      break e
                    }
                    if (
                      ((St[(8 + v) >> 2] = St[Y >> 2]),
                      0 != (0 | St[((f = Y) + 4) >> 2]) || (0 | St[(8 + v) >> 2]) != (0 | St[f >> 2]))
                    ) {
                      q = 38
                      break e
                    }
                    if (
                      ((f = 0 | sr[3 & St[St[b >> 2] >> 2]](0 | St[b >> 2], 0 | St[(8 + v) >> 2])),
                      (St[(8 + (0 | St[k >> 2])) >> 2] = f),
                      0 == (0 | St[(8 + (0 | St[k >> 2])) >> 2]) && 0 | St[(8 + v) >> 2])
                    ) {
                      q = 41
                      break e
                    }
                    if (
                      ((A =
                        0 |
                        Ne(
                          0 | St[(f = Y) >> 2],
                          0 | St[(f + 4) >> 2],
                          0 | St[S >> 2],
                          0 | St[(8 + (0 | St[k >> 2])) >> 2],
                          0 | St[F >> 2],
                          0 | St[w >> 2]
                        )),
                      (St[V >> 2] = A),
                      (St[W >> 2] = St[V >> 2]),
                      0 | St[W >> 2])
                    ) {
                      q = 43
                      break e
                    }
                    if (
                      ((A =
                        0 |
                        (function (e, r, t, n, i, o, a, u, s, f) {
                          ;(e |= 0),
                            (r |= 0),
                            (t |= 0),
                            (n |= 0),
                            (i |= 0),
                            (o |= 0),
                            (a |= 0),
                            (u |= 0),
                            (s |= 0),
                            (f |= 0)
                          var l = 0,
                            c = 0,
                            d = 0,
                            E = 0,
                            _ = 0,
                            S = 0,
                            m = 0,
                            h = 0,
                            p = 0,
                            b = 0,
                            k = 0,
                            F = 0,
                            w = 0,
                            y = 0,
                            v = 0,
                            M = 0,
                            O = 0,
                            A = 0,
                            R = 0,
                            g = 0,
                            T = 0,
                            N = 0,
                            D = 0,
                            P = 0,
                            C = 0,
                            I = 0,
                            L = 0,
                            x = 0,
                            B = 0,
                            H = 0
                          ;(0 | (pt = ((l = pt) + 624) | 0)) >= (0 | bt) && yt(624)
                          ;(c = (l + 92) | 0),
                            (E = (l + 84) | 0),
                            (_ = (l + 80) | 0),
                            (S = (l + 76) | 0),
                            (m = (l + 72) | 0),
                            (h = (l + 68) | 0),
                            (p = (l + 64) | 0),
                            (b = (l + 60) | 0),
                            (k = (l + 56) | 0),
                            (F = (l + 52) | 0),
                            (w = (l + 96) | 0),
                            (y = (l + 48) | 0),
                            (v = (l + 44) | 0),
                            (M = (l + 40) | 0),
                            (O = (l + 36) | 0),
                            (A = (l + 32) | 0),
                            (R = (l + 28) | 0),
                            (g = (l + 613) | 0),
                            (T = (l + 24) | 0),
                            (N = (l + 612) | 0),
                            (D = (l + 20) | 0),
                            (P = (l + 16) | 0),
                            (C = (l + 12) | 0),
                            (I = (l + 8) | 0),
                            (L = (l + 4) | 0),
                            (St[(d = ((x = l) + 88) | 0) >> 2] = e),
                            (St[E >> 2] = r),
                            (St[_ >> 2] = t),
                            (St[S >> 2] = n),
                            (St[m >> 2] = i),
                            (St[h >> 2] = o),
                            (St[p >> 2] = a),
                            (St[b >> 2] = u),
                            (St[k >> 2] = s),
                            (St[F >> 2] = f),
                            (St[y >> 2] = 0),
                            (St[v >> 2] = 0),
                            (St[R >> 2] = 0),
                            (Et[g >> 0] = 0),
                            (St[T >> 2] = 0)
                          for (; !(258 <= (0 | St[T >> 2]) >>> 0); )
                            (_t[(w + (St[T >> 2] << 1)) >> 1] = 1024), (St[T >> 2] = 1 + (0 | St[T >> 2]))
                          ;(St[M >> 2] = St[p >> 2]),
                            (St[O >> 2] = (0 | St[M >> 2]) + (0 | St[b >> 2])),
                            (St[A >> 2] = -1),
                            (St[T >> 2] = 0)
                          for (; !(5 <= (0 | St[T >> 2]) >>> 0); ) {
                            if ((0 | St[M >> 2]) == (0 | St[O >> 2])) {
                              B = 7
                              break
                            }
                            ;(b = St[R >> 2] << 8),
                              (p = 0 | St[M >> 2]),
                              (St[M >> 2] = p + 1),
                              (St[R >> 2] = 0 | b | mt[p >> 0]),
                              (St[T >> 2] = 1 + (0 | St[T >> 2]))
                          }
                          if (7 == (0 | B)) return (St[c >> 2] = 1), (H = 0 | St[c >> 2]), (pt = l), 0 | H
                          if (!(0 | St[F >> 2])) return (St[c >> 2] = 0), (H = 0 | St[c >> 2]), (pt = l), 0 | H
                          for (;;) {
                            for (
                              St[I >> 2] = (0 | St[E >> 2]) - (0 | St[y >> 2]),
                                (((0 | St[F >> 2]) - (0 | St[v >> 2])) | 0) >>> 0 < (0 | St[I >> 2]) >>> 0 &&
                                  (St[I >> 2] = (0 | St[F >> 2]) - (0 | St[v >> 2]));
                              0 | St[I >> 2] &&
                              ((Et[N >> 0] = 0 | Et[((0 | St[d >> 2]) + (0 | St[y >> 2])) >> 0]),
                              (T = 0 | Et[N >> 0]),
                              (p = 0 | St[v >> 2]),
                              (St[v >> 2] = p + 1),
                              (Et[((0 | St[k >> 2]) + p) >> 0] = T),
                              232 != ((254 & (0 | mt[N >> 0])) | 0)) &&
                              (15 != (0 | mt[g >> 0]) || 128 != ((240 & (0 | mt[N >> 0])) | 0));

                            )
                              (St[y >> 2] = 1 + (0 | St[y >> 2])),
                                (Et[g >> 0] = 0 | Et[N >> 0]),
                                (St[I >> 2] = (0 | St[I >> 2]) - 1)
                            if (!(0 | St[I >> 2])) {
                              B = 46
                              break
                            }
                            if ((0 | St[v >> 2]) == (0 | St[F >> 2])) {
                              B = 46
                              break
                            }
                            ;(T = 0 | St[y >> 2]),
                              (St[y >> 2] = T + 1),
                              (Et[N >> 0] = 0 | Et[((0 | St[d >> 2]) + T) >> 0])
                            do {
                              if (232 != (0 | mt[N >> 0])) {
                                if (233 == (0 | mt[N >> 0])) {
                                  St[D >> 2] = 512 + w
                                  break
                                }
                                St[D >> 2] = 514 + w
                                break
                              }
                            } while (((St[D >> 2] = w + ((0 | mt[g >> 0]) << 1)), 0))
                            if (
                              ((St[C >> 2] = re[St[D >> 2] >> 1]),
                              (T = 0 | wt((0 | St[A >> 2]) >>> 11, 0 | St[C >> 2])),
                              (St[P >> 2] = T),
                              (T = 0 | St[P >> 2]),
                              (0 | St[R >> 2]) >>> 0 < (0 | St[P >> 2]) >>> 0)
                            ) {
                              if (
                                ((St[A >> 2] = T),
                                (_t[St[D >> 2] >> 1] = (0 | St[C >> 2]) + (((2048 - (0 | St[C >> 2])) | 0) >>> 5)),
                                (0 | St[A >> 2]) >>> 0 < 16777216)
                              ) {
                                if ((0 | St[M >> 2]) == (0 | St[O >> 2])) {
                                  B = 28
                                  break
                                }
                                ;(St[A >> 2] = St[A >> 2] << 8),
                                  (p = St[R >> 2] << 8),
                                  (b = 0 | St[M >> 2]),
                                  (St[M >> 2] = b + 1),
                                  (St[R >> 2] = 0 | p | mt[b >> 0])
                              }
                              Et[g >> 0] = 0 | Et[N >> 0]
                            } else {
                              if (
                                ((St[A >> 2] = (0 | St[A >> 2]) - T),
                                (St[R >> 2] = (0 | St[R >> 2]) - (0 | St[P >> 2])),
                                (_t[St[D >> 2] >> 1] = (0 | St[C >> 2]) - ((0 | St[C >> 2]) >>> 5)),
                                (0 | St[A >> 2]) >>> 0 < 16777216)
                              ) {
                                if ((0 | St[M >> 2]) == (0 | St[O >> 2])) {
                                  B = 33
                                  break
                                }
                                ;(St[A >> 2] = St[A >> 2] << 8),
                                  (T = St[R >> 2] << 8),
                                  (b = 0 | St[M >> 2]),
                                  (St[M >> 2] = b + 1),
                                  (St[R >> 2] = 0 | T | mt[b >> 0])
                              }
                              if (232 == (0 | mt[N >> 0])) {
                                if (((St[x >> 2] = St[_ >> 2]), (0 | St[S >> 2]) >>> 0 < 4)) {
                                  B = 37
                                  break
                                }
                                ;(St[_ >> 2] = 4 + (0 | St[_ >> 2])), (St[S >> 2] = (0 | St[S >> 2]) - 4)
                              } else {
                                if (((St[x >> 2] = St[m >> 2]), (0 | St[h >> 2]) >>> 0 < 4)) {
                                  B = 40
                                  break
                                }
                                ;(St[m >> 2] = 4 + (0 | St[m >> 2])), (St[h >> 2] = (0 | St[h >> 2]) - 4)
                              }
                              if (
                                ((St[L >> 2] =
                                  (((0 | mt[St[x >> 2] >> 0]) << 24) |
                                    ((0 | mt[(1 + (0 | St[x >> 2])) >> 0]) << 16) |
                                    ((0 | mt[(2 + (0 | St[x >> 2])) >> 0]) << 8) |
                                    0 |
                                    mt[(3 + (0 | St[x >> 2])) >> 0]) -
                                  (4 + (0 | St[v >> 2]))),
                                (b = 255 & St[L >> 2]),
                                (T = 0 | St[v >> 2]),
                                (St[v >> 2] = T + 1),
                                (Et[((0 | St[k >> 2]) + T) >> 0] = b),
                                (0 | St[v >> 2]) == (0 | St[F >> 2]))
                              ) {
                                B = 46
                                break
                              }
                              if (
                                ((b = ((0 | St[L >> 2]) >>> 8) & 255),
                                (T = 0 | St[v >> 2]),
                                (St[v >> 2] = T + 1),
                                (Et[((0 | St[k >> 2]) + T) >> 0] = b),
                                (0 | St[v >> 2]) == (0 | St[F >> 2]))
                              ) {
                                B = 46
                                break
                              }
                              if (
                                ((b = ((0 | St[L >> 2]) >>> 16) & 255),
                                (T = 0 | St[v >> 2]),
                                (St[v >> 2] = T + 1),
                                (Et[((0 | St[k >> 2]) + T) >> 0] = b),
                                (0 | St[v >> 2]) == (0 | St[F >> 2]))
                              ) {
                                B = 46
                                break
                              }
                              ;(b = ((0 | St[L >> 2]) >>> 24) & 255),
                                (Et[g >> 0] = b),
                                (T = 0 | St[v >> 2]),
                                (St[v >> 2] = T + 1),
                                (Et[((0 | St[k >> 2]) + T) >> 0] = b)
                            }
                          }
                          {
                            if (28 == (0 | B)) return (St[c >> 2] = 1), (H = 0 | St[c >> 2]), (pt = l), 0 | H
                            if (33 == (0 | B)) return (St[c >> 2] = 1), (H = 0 | St[c >> 2]), (pt = l), 0 | H
                            if (37 == (0 | B)) return (St[c >> 2] = 1), (H = 0 | St[c >> 2]), (pt = l), 0 | H
                            if (40 == (0 | B)) return (St[c >> 2] = 1), (H = 0 | St[c >> 2]), (pt = l), 0 | H
                            if (46 == (0 | B))
                              return (
                                (St[c >> 2] = (0 | St[v >> 2]) == (0 | St[F >> 2]) ? 0 : 1),
                                (H = 0 | St[c >> 2]),
                                (pt = l),
                                0 | H
                              )
                          }
                          return 0
                        })(
                          0 | St[O >> 2],
                          0 | St[M >> 2],
                          0 | St[St[k >> 2] >> 2],
                          0 | St[v >> 2],
                          0 | St[(4 + (0 | St[k >> 2])) >> 2],
                          0 | St[(4 + v) >> 2],
                          0 | St[(8 + (0 | St[k >> 2])) >> 2],
                          0 | St[(8 + v) >> 2],
                          0 | St[h >> 2],
                          0 | St[p >> 2]
                        )),
                      (St[V >> 2] = A),
                      (St[j >> 2] = St[V >> 2]),
                      0 | St[j >> 2])
                    ) {
                      q = 45
                      break e
                    }
                  }
                } while (0)
                St[y >> 2] = 1 + (0 | St[y >> 2])
              }
              switch (0 | q) {
                case 9:
                case 11:
                  return (St[d >> 2] = 2), (G = 0 | St[d >> 2]), (pt = c), 0 | G
                case 15:
                  return (St[d >> 2] = 5), (G = 0 | St[d >> 2]), (pt = c), 0 | G
                case 17:
                  return (St[d >> 2] = 4), (G = 0 | St[d >> 2]), (pt = c), 0 | G
                case 19:
                  return (St[d >> 2] = St[x >> 2]), (G = 0 | St[d >> 2]), (pt = c), 0 | G
                case 22:
                  return (St[d >> 2] = 1), (G = 0 | St[d >> 2]), (pt = c), 0 | G
                case 24:
                  return (St[d >> 2] = St[B >> 2]), (G = 0 | St[d >> 2]), (pt = c), 0 | G
                case 27:
                  return (St[d >> 2] = St[H >> 2]), (G = 0 | St[d >> 2]), (pt = c), 0 | G
                case 30:
                  return (St[d >> 2] = St[U >> 2]), (G = 0 | St[d >> 2]), (pt = c), 0 | G
                case 31:
                case 34:
                  return (St[d >> 2] = 4), (G = 0 | St[d >> 2]), (pt = c), 0 | G
                case 36:
                  return (St[d >> 2] = St[K >> 2]), (G = 0 | St[d >> 2]), (pt = c), 0 | G
                case 38:
                case 41:
                  return (St[d >> 2] = 2), (G = 0 | St[d >> 2]), (pt = c), 0 | G
                case 43:
                  return (St[d >> 2] = St[W >> 2]), (G = 0 | St[d >> 2]), (pt = c), 0 | G
                case 45:
                  return (St[d >> 2] = St[j >> 2]), (G = 0 | St[d >> 2]), (pt = c), 0 | G
                case 47:
                case 53:
                  return (St[d >> 2] = 4), (G = 0 | St[d >> 2]), (pt = c), 0 | G
                case 55:
                  return (St[d >> 2] = 0), (G = 0 | St[d >> 2]), (pt = c), 0 | G
              }
              return 0
            })(
              0 | St[l >> 2],
              0 | St[c >> 2],
              0 | St[d >> 2],
              0 | St[f >> 2],
              0 | St[(f + 4) >> 2],
              0 | St[_ >> 2],
              0 | St[S >> 2],
              0 | St[m >> 2],
              b,
              0 | St[h >> 2],
              0 | St[p >> 2]
            ),
          St[F >> 2] = E,
          St[k >> 2] = 0;
        !(3 <= (0 | St[k >> 2]));

      )
        or[3 & St[(4 + (0 | St[m >> 2])) >> 2]](0 | St[m >> 2], 0 | St[(b + (St[k >> 2] << 2)) >> 2]),
          (St[k >> 2] = 1 + (0 | St[k >> 2]))
      return (pt = w), 0 | St[F >> 2]
    }
    function ge(e) {
      e |= 0
      var r,
        t,
        n = 0,
        i = pt
      ;(0 | bt) <= (0 | (pt = (pt + 16) | 0)) && yt(16), (r = (i + 4) | 0), (St[(t = i) >> 2] = e), (e = 0 | St[t >> 2])
      e: do {
        if (33 <= (0 | e)) {
          if ((0 | e) < 196865) {
            if (33 == (0 | e)) {
              n = 2
              break e
            }
            n = 3
            break e
          }
          if (196865 == (0 | e)) {
            n = 2
            break e
          }
          n = 3
          break e
        }
      } while (((n = 0 == (0 | e) ? 2 : 3), 0))
      return 2 == (0 | n) ? (St[r >> 2] = 1) : 3 == (0 | n) && (St[r >> 2] = 0), (pt = i), 0 | St[r >> 2]
    }
    function Te(e, r) {
      ;(e |= 0), (r |= 0)
      var t,
        n,
        i,
        o,
        a = 0,
        u = pt
      for (
        (0 | bt) <= (0 | (pt = (pt + 32) | 0)) && yt(32),
          n = (u + 12) | 0,
          a = ((i = u) + 8) | 0,
          St[(t = (u + 16) | 0) >> 2] = e,
          St[n >> 2] = r,
          St[(r = i) >> 2] = 0,
          St[(r + 4) >> 2] = 0,
          St[a >> 2] = 0;
        !((0 | St[a >> 2]) >>> 0 >= (0 | St[n >> 2]) >>> 0);

      )
        (r = ((0 | St[t >> 2]) + (St[a >> 2] << 3)) | 0),
          (o = 0 | Dt(0 | St[(e = i) >> 2], 0 | St[(e + 4) >> 2], 0 | St[r >> 2], 0 | St[(r + 4) >> 2])),
          (St[(r = i) >> 2] = o),
          (St[(r + 4) >> 2] = Ft),
          (St[a >> 2] = 1 + (0 | St[a >> 2]))
      return (Ft = 0 | St[((a = i) + 4) >> 2]), (pt = u), 0 | St[a >> 2]
    }
    function Ne(e, r, t, n, i, o) {
      ;(e |= 0), (r |= 0), (t |= 0), (n |= 0), (i |= 0), (o |= 0)
      var a,
        u,
        s,
        f,
        l,
        c,
        d,
        E,
        _,
        S,
        m = 0,
        h = 0,
        p = pt
      for (
        (0 | bt) <= (0 | (pt = (pt + 48) | 0)) && yt(48),
          a = (p + 40) | 0,
          s = ((u = p) + 36) | 0,
          f = (p + 32) | 0,
          l = (p + 28) | 0,
          c = (p + 20) | 0,
          d = (p + 16) | 0,
          E = (p + 12) | 0,
          _ = (p + 8) | 0,
          St[(S = u) >> 2] = e,
          St[(S + 4) >> 2] = r,
          St[s >> 2] = t,
          St[f >> 2] = n,
          St[l >> 2] = i,
          St[(p + 24) >> 2] = o;
        ;

      ) {
        if (!((0 < (i = 0 | St[((o = u) + 4) >> 2]) >>> 0) | ((0 == (0 | i)) & (0 < (0 | St[o >> 2]) >>> 0)))) {
          m = 11
          break
        }
        if (
          ((St[d >> 2] = 262144),
          ((i = 0 | St[((o = u) + 4) >> 2]) >>> 0 < 0) |
            (0 == (0 | i) ? (0 | St[d >> 2]) >>> 0 > (0 | St[o >> 2]) >>> 0 : 0) && (St[d >> 2] = St[u >> 2]),
          (o = 0 | nr[15 & St[St[s >> 2] >> 2]](0 | St[s >> 2], c, d)),
          (St[E >> 2] = o),
          0 | St[E >> 2])
        ) {
          m = 6
          break
        }
        if (!(0 | St[d >> 2])) {
          m = 8
          break
        }
        if (
          (Je(0 | St[f >> 2], 0 | St[c >> 2], 0 | St[d >> 2]),
          (St[f >> 2] = (0 | St[f >> 2]) + (0 | St[d >> 2])),
          (i = 0 | Nt(0 | St[(o = u) >> 2], 0 | St[(o + 4) >> 2], 0 | St[d >> 2], 0)),
          (St[(o = u) >> 2] = i),
          (St[(o + 4) >> 2] = Ft),
          Q(2, 0 | St[d >> 2], 0 | St[l >> 2]),
          (o = 0 | sr[3 & St[(4 + (0 | St[s >> 2])) >> 2]](0 | St[s >> 2], 0 | St[d >> 2])),
          (St[_ >> 2] = o),
          0 | St[_ >> 2])
        ) {
          m = 10
          break
        }
      }
      return 6 == (0 | m)
        ? ((St[a >> 2] = St[E >> 2]), (h = 0 | St[a >> 2]), (pt = p), 0 | h)
        : 8 == (0 | m)
          ? ((St[a >> 2] = 6), (h = 0 | St[a >> 2]), (pt = p), 0 | h)
          : 10 == (0 | m)
            ? ((St[a >> 2] = St[_ >> 2]), (h = 0 | St[a >> 2]), (pt = p), 0 | h)
            : 11 == (0 | m)
              ? ((h = (St[a >> 2] = 0) | St[a >> 2]), (pt = p), 0 | h)
              : 0
    }
    function De(e) {
      e |= 0
      var r,
        t,
        n = 0,
        i = pt
      return (
        (0 | bt) <= (0 | (pt = (pt + 16) | 0)) && yt(16),
        (St[(r = i) >> 2] = e),
        1 != (0 | St[St[r >> 2] >> 2]) || 1 != (0 | St[(4 + (0 | St[r >> 2])) >> 2])
          ? ((pt = i), (n = 0) | (1 & n))
          : ((e = (8 + (0 | St[r >> 2])) | 0),
            ((t = 0 | St[(e + 4) >> 2]) >>> 0 < 0) | ((0 == (0 | t)) & ((0 | St[e >> 2]) >>> 0 <= 4294967295))
              ? ((n = 0 != (0 | ge(0 | St[(8 + (0 | St[r >> 2])) >> 2]))), (pt = i), 0 | (1 & n))
              : ((pt = i), (n = 0) | (1 & n)))
      )
    }
    function Pe(e, r) {
      ;(e |= 0), (r |= 0)
      var t,
        n,
        i = pt
      return (
        (0 | bt) <= (0 | (pt = (pt + 16) | 0)) && yt(16),
        (St[(t = ((n = i) + 4) | 0) >> 2] = e),
        (St[n >> 2] = r),
        (r = ~(0 | ur[1 & St[2761]](-1, 0 | St[t >> 2], 0 | St[n >> 2], 2852))),
        (pt = i),
        0 | r
      )
    }
    function Ce(e) {
      e |= 0
      var r,
        t = pt
      ;(0 | bt) <= (0 | (pt = (pt + 16) | 0)) && yt(16),
        (St[(r = t) >> 2] = e),
        (St[St[r >> 2] >> 2] = 0),
        (St[(4 + (0 | St[r >> 2])) >> 2] = 0),
        (pt = t)
    }
    function Ie(e, r, t) {
      ;(e |= 0), (r |= 0), (t |= 0)
      var n,
        i,
        o,
        a,
        u = 0,
        s = pt
      return (
        (0 | bt) <= (0 | (pt = (pt + 16) | 0)) && yt(16),
        (n = (s + 12) | 0),
        (o = (s + 4) | 0),
        (St[(i = ((a = s) + 8) | 0) >> 2] = e),
        (St[o >> 2] = r),
        (St[a >> 2] = t),
        (pt =
          ((u =
            (St[(4 + (0 | St[i >> 2])) >> 2] = 0) | St[o >> 2]
              ? ((t = 0 | sr[3 & St[St[a >> 2] >> 2]](0 | St[a >> 2], 0 | St[o >> 2])),
                (St[St[i >> 2] >> 2] = t),
                0 | St[St[i >> 2] >> 2]
                  ? ((St[(4 + (0 | St[i >> 2])) >> 2] = St[o >> 2]), (St[n >> 2] = 1), 0 | St[n >> 2])
                  : (St[n >> 2] = 0) | St[n >> 2])
              : ((St[St[i >> 2] >> 2] = 0), (St[n >> 2] = 1), 0 | St[n >> 2])),
          s)),
        0 | u
      )
    }
    function Le(e, r) {
      ;(e |= 0), (r |= 0)
      var t,
        n,
        i = pt
      ;(0 | bt) <= (0 | (pt = (pt + 16) | 0)) && yt(16),
        (St[(t = ((n = i) + 4) | 0) >> 2] = e),
        (St[n >> 2] = r),
        or[3 & St[(4 + (0 | St[n >> 2])) >> 2]](0 | St[n >> 2], 0 | St[St[t >> 2] >> 2]),
        (St[St[t >> 2] >> 2] = 0),
        (St[(4 + (0 | St[t >> 2])) >> 2] = 0),
        (pt = i)
    }
    function xe(e, r, t) {
      ;(e |= 0), (r |= 0), (t |= 0)
      var n,
        i,
        o,
        a,
        u,
        s,
        f = 0,
        l = 0,
        c = 0,
        d = 0,
        E = 0,
        _ = 0,
        S = 0,
        m = 0,
        h = 0,
        p = 0,
        b = 0,
        k = 0,
        F = pt
      for (
        (0 | bt) <= (0 | (pt = (pt + 48) | 0)) && yt(48),
          n = (F + 16) | 0,
          f = ((i = F) + 32) | 0,
          l = 0 | St[(o = (e + 28) | 0) >> 2],
          St[f >> 2] = l,
          c = ((0 | St[(a = (e + 20) | 0) >> 2]) - l) | 0,
          St[(f + 4) >> 2] = c,
          St[(f + 8) >> 2] = r,
          r = (e + 60) | 0,
          l = (e + 44) | 0,
          E = (c + (St[(f + 12) >> (d = 2)] = t)) | 0,
          c = f;
        ;

      ) {
        if (
          (0 | E) ==
          (0 |
            (_ =
              0 | St[2762]
                ? (g(1, 0 | e),
                  (St[i >> 2] = St[r >> 2]),
                  (St[(i + 4) >> 2] = c),
                  (St[(i + 8) >> 2] = d),
                  (f = 0 | Be(0 | A(146, 0 | i))),
                  v(0),
                  f)
                : ((St[n >> 2] = St[r >> 2]),
                  (St[(4 + n) >> 2] = c),
                  (St[(8 + n) >> 2] = d),
                  0 | Be(0 | A(146, 0 | n)))))
        ) {
          S = 6
          break
        }
        if ((0 | _) < 0) {
          S = 8
          break
        }
        ;(f = (E - _) | 0),
          (b =
            _ >>> 0 <= (u = 0 | St[(c + 4) >> 2]) >>> 0
              ? ((p = ((h = 2 == (0 | d) ? ((St[o >> 2] = (0 | St[o >> 2]) + _), (m = _), 2) : ((m = _), d)), c)), u)
              : ((s = 0 | St[l >> 2]),
                (St[o >> 2] = s),
                (St[a >> 2] = s),
                (m = (_ - u) | 0),
                (h = (d + -1) | 0),
                (p = (c + 8) | 0),
                0 | St[(c + 12) >> 2])),
          (St[p >> 2] = (0 | St[p >> 2]) + m),
          (St[(p + 4) >> 2] = b - m),
          (d = h),
          (E = f),
          (c = p)
      }
      return (
        6 == (0 | S)
          ? ((p = 0 | St[l >> 2]),
            (St[(e + 16) >> 2] = p + (0 | St[(e + 48) >> 2])),
            (l = p),
            (St[o >> 2] = l),
            (St[a >> 2] = l),
            (k = t))
          : 8 == (0 | S) &&
            ((St[(e + 16) >> 2] = 0),
            (St[o >> 2] = 0),
            (St[a >> 2] = 0),
            (St[e >> 2] = 32 | St[e >> 2]),
            (k = 2 == (0 | d) ? 0 : (t - (0 | St[(c + 4) >> 2])) | 0)),
        (pt = F),
        0 | k
      )
    }
    function Be(e) {
      var r
      return 0 | (4294963200 < (e |= 0) >>> 0 ? ((r = 0 | vt()), (St[r >> 2] = 0 - e), -1) : e)
    }
    function vt() {
      return 0 | (0 | St[2762] ? 0 | St[16] : 11092)
    }
    function He() {
      0
    }
    function Ue(e, r, t, n, i) {
      ;(e |= 0), (r |= 0), (t |= 0), (n |= 0), (i |= 0)
      var o,
        a,
        u,
        s,
        f,
        l,
        c,
        d,
        E,
        _,
        S,
        m,
        h,
        p,
        b,
        k,
        F,
        w,
        y,
        v,
        M,
        O,
        A,
        R,
        g,
        T,
        N = 0,
        D = 0,
        P = 0,
        C = 0,
        I = 0,
        L = 0,
        x = 0,
        B = 0,
        H = 0,
        U = 0,
        z = 0,
        Y = 0,
        V = 0,
        K = 0,
        W = 0,
        j = 0,
        X = 0,
        G = 0,
        q = 0,
        Q = 0,
        Z = 0,
        J = 0,
        $ = 0,
        ee = 0,
        re = 0,
        te = 0,
        ne = 0,
        ie = 0,
        oe = 0,
        ae = 0,
        ue = 0,
        se = 0,
        fe = 0,
        le = 0,
        ce = 0,
        de = 0,
        Ee = 0,
        _e = 0,
        Se = 0,
        me = 0,
        he = 0,
        pe = 0,
        be = 0,
        ke = 0,
        Fe = 0,
        we = 0,
        ye = 0,
        ve = 0,
        Me = 0,
        Oe = 0,
        Ae = 0,
        Re = 0,
        ge = 0,
        Te = 0,
        Ne = 0,
        De = 0,
        Pe = 0,
        Ce = 0,
        Ie = 0,
        Le = 0,
        xe = 0,
        Be = 0,
        He = 0,
        Ue = 0,
        ze = 0,
        Ye = 0,
        Ve = 0,
        Ke = 0,
        We = 0,
        je = 0,
        Xe = 0,
        Ge = 0,
        qe = 0,
        Qe = 0,
        Ze = 0,
        Je = 0,
        $e = 0,
        er = 0,
        rr = 0,
        tr = 0,
        nr = 0,
        ir = 0,
        or = 0,
        ar = 0,
        ur = 0,
        sr = 0,
        fr = 0,
        lr = 0,
        cr = 0,
        dr = 0,
        Er = 0,
        _r = 0,
        Sr = 0,
        mr = 0,
        hr = 0,
        pr = 0,
        br = 0,
        kr = 0,
        Fr = 0,
        wr = 0,
        yr = 0,
        vr = 0,
        Mr = 0,
        Or = 0,
        Ar = 0,
        Rr = 0,
        gr = 0,
        Tr = 0,
        Nr = 0,
        Dr = 0,
        Pr = 0,
        Cr = 0,
        Ir = 0,
        Lr = 0,
        xr = 0,
        Br = 0,
        Hr = 0,
        Ur = 0,
        zr = 0,
        Yr = 0,
        Vr = 0,
        Kr = 0,
        Wr = 0,
        jr = 0,
        Xr = 0,
        Gr = 0,
        qr = 0,
        Qr = 0,
        Zr = 0,
        Jr = 0,
        $r = 0,
        et = 0,
        rt = 0,
        tt = 0,
        nt = 0,
        it = 0,
        ot = 0,
        at = 0,
        ut = 0,
        st = 0,
        ft = 0,
        lt = 0,
        ct = 0,
        dt = pt
      ;(0 | bt) <= (0 | (pt = (pt + 624) | 0)) && yt(624),
        (a = (dt + 16) | 0),
        (d = ((f = dt) + 528) | 0),
        (E = 0 != (0 | e)),
        (S = _ = (40 + (l = (dt + 536) | 0)) | 0),
        (m = (39 + l) | 0),
        (l = (4 + (c = (dt + 8) | 0)) | 0),
        (p = (0 - (h = u = (dt + 588) | 0)) | 0),
        (k = (11 + (s = (dt + 576) | 0)) | 0),
        (F = ((s = b = (12 + s) | 0) - h) | 0),
        (w = (-2 - h) | 0),
        (y = (2 + s) | 0),
        (v = (288 + (o = (dt + 24) | 0)) | 0),
        (O = M = (9 + u) | 0),
        (A = (8 + u) | 0),
        (P = D = N = 0),
        (C = r)
      e: for (;;) {
        do {
          if (-1 < (0 | D)) {
            if (((2147483647 - D) | 0) < (0 | N)) {
              ;(r = 0 | vt()), (St[r >> 2] = 75), (I = -1)
              break
            }
            I = (N + D) | 0
            break
          }
        } while (((I = D), 0))
        if (!(((r = 0 | Et[C >> 0]) << 24) >> 24)) {
          L = 243
          break
        }
        ;(x = C), (B = r)
        r: for (;;) {
          switch ((B << 24) >> 24) {
            case 37:
              ;(U = H = x), (L = 9)
              break r
            case 0:
              Y = z = x
              break r
          }
          B = 0 | Et[(x = r = (x + 1) | 0) >> 0]
        }
        r: do {
          if (9 == (0 | L))
            for (;;) {
              if (37 != ((L = 0) | Et[(U + 1) >> 0])) {
                ;(z = H), (Y = U)
                break r
              }
              if (((r = (H + 1) | 0), 37 != (0 | Et[(V = (U + 2) | 0) >> 0]))) {
                ;(z = r), (Y = V)
                break
              }
              ;(H = r), (U = V), (L = 9)
            }
        } while (0)
        if (((V = (z - C) | 0), E && 0 == ((32 & St[e >> 2]) | 0) && Mt(C, V, e), 0 | V)) (N = V), (D = I), (C = Y)
        else {
          ;(Q =
            (K = ((((r = 0 | Et[(V = (Y + 1) | 0) >> 0]) << 24) >> 24) - 48) | 0) >>> 0 < 10
              ? ((X = (W = 36 == (0 | Et[(Y + 2) >> 0])) ? K : -1),
                (G = W ? 1 : P),
                (q = 0 | Et[(j = W ? (Y + 3) | 0 : V) >> 0]),
                j)
              : ((X = -1), (G = P), (q = r), V)),
            (V = (((q << 24) >> 24) - 32) | 0)
          r: do {
            if (V >>> 0 < 32)
              for (r = 0, j = V, W = q, K = Q; ; ) {
                if (!((1 << j) & 75913)) {
                  ;(Z = r), (J = W), ($ = K)
                  break r
                }
                if (
                  ((ee = (1 << (((W << 24) >> 24) - 32)) | r),
                  32 <= (j = ((((te = 0 | Et[(re = (K + 1) | 0) >> 0]) << 24) >> 24) - 32) | 0) >>> 0)
                ) {
                  ;(Z = ee), (J = te), ($ = re)
                  break
                }
                ;(r = ee), (W = te), (K = re)
              }
            else (Z = 0), (J = q), ($ = Q)
          } while (0)
          do {
            if ((J << 24) >> 24 != 42)
              if ((V = (((J << 24) >> 24) - 48) | 0) >>> 0 < 10) {
                for (
                  K = 0, W = $, r = V;
                  (K = (((10 * K) | 0) + r) | 0),
                    (r = ((((ne = 0 | Et[(W = (W + 1) | 0) >> 0]) << 24) >> 24) - 48) | 0),
                    r >>> 0 < 10;

                );
                if ((0 | K) < 0) {
                  ie = -1
                  break e
                }
                ;(oe = K), (ae = Z), (ue = G), (se = W), (fe = ne)
              } else (oe = 0), (ae = Z), (ue = G), (se = $), (fe = J)
            else {
              if (
                (j = ((((V = 0 | Et[(r = ($ + 1) | 0) >> 0]) << 24) >> 24) - 48) | 0) >>> 0 < 10 &&
                36 == (0 | Et[($ + 2) >> 0])
              )
                (St[(i + (j << 2)) >> 2] = 10),
                  (le = 0 | St[(n + (((0 | Et[r >> 0]) - 48) << 3)) >> 2]),
                  (ce = 1),
                  (de = ($ + 3) | 0)
              else {
                if (0 | G) {
                  ie = -1
                  break e
                }
                if (!E) {
                  ;(ae = Z), (ue = oe = 0), (se = r), (fe = V)
                  break
                }
                ;(V = (3 + (0 | St[t >> 2])) & -4),
                  (j = 0 | St[V >> 2]),
                  (St[t >> 2] = V + 4),
                  (le = j),
                  (ce = 0),
                  (de = r)
              }
              ;(oe = (r = (0 | le) < 0) ? (0 - le) | 0 : le),
                (ae = r ? 8192 | Z : Z),
                (ue = ce),
                (fe = 0 | Et[(se = de) >> 0])
            }
          } while (0)
          r: do {
            if ((fe << 24) >> 24 == 46) {
              if (((j = 0 | Et[(r = (se + 1) | 0) >> 0]) << 24) >> 24 != 42) {
                if (!((V = (((j << 24) >> 24) - 48) | 0) >>> 0 < 10)) {
                  ;(me = 0), (he = r)
                  break
                }
                for (Ee = 0, _e = r, Se = V; ; ) {
                  if (
                    ((r = (((10 * Ee) | 0) + Se) | 0), 10 <= (Se = ((0 | Et[(V = (_e + 1) | 0) >> 0]) - 48) | 0) >>> 0)
                  ) {
                    ;(me = r), (he = V)
                    break r
                  }
                  ;(Ee = r), (_e = V)
                }
              }
              if ((K = ((0 | Et[(W = (se + 2) | 0) >> 0]) - 48) | 0) >>> 0 < 10 && 36 == (0 | Et[(se + 3) >> 0])) {
                ;(St[(i + (K << 2)) >> 2] = 10),
                  (me = 0 | St[(n + (((0 | Et[W >> 0]) - 48) << 3)) >> 2]),
                  (he = (se + 4) | 0)
                break
              }
              if (0 | ue) {
                ie = -1
                break e
              }
              he =
                ((me = E ? ((K = (3 + (0 | St[t >> 2])) & -4), (V = 0 | St[K >> 2]), (St[t >> 2] = K + 4), V) : 0), W)
            } else (me = -1), (he = se)
          } while (0)
          for (W = 0, V = he; ; ) {
            if (57 < (K = ((0 | Et[V >> 0]) - 65) | 0) >>> 0) {
              ie = -1
              break e
            }
            if (
              ((pe = (V + 1) | 0),
              !((((ke = 255 & (be = 0 | Et[(419 + ((58 * W) | 0) + K) >> 0])) + -1) | 0) >>> 0 < 8))
            )
              break
            ;(W = ke), (V = pe)
          }
          if (!((be << 24) >> 24)) {
            ie = -1
            break
          }
          K = -1 < (0 | X)
          do {
            if ((be << 24) >> 24 == 19) {
              if (K) {
                ie = -1
                break e
              }
              L = 51
            } else {
              if (K) {
                ;(St[(i + (X << 2)) >> 2] = ke),
                  (j = 0 | St[((r = (n + (X << 3)) | 0) + 4) >> 2]),
                  (St[(re = f) >> 2] = St[r >> 2]),
                  (St[(re + 4) >> 2] = j),
                  (L = 51)
                break
              }
              if (!E) {
                ie = 0
                break e
              }
              Ot(f, ke, t)
            }
          } while (0)
          if (51 != (0 | L) || ((L = 0), E)) {
            ;(j = (0 != (0 | W)) & (3 == ((15 & (K = 0 | Et[V >> 0])) | 0)) ? -33 & K : K),
              (K = -65537 & ae),
              (re = 0 == ((8192 & ae) | 0) ? ae : K)
            r: do {
              switch (0 | j) {
                case 110:
                  switch (((255 & W) << 24) >> 24) {
                    case 0:
                    case 1:
                      ;(N = 0), (D = St[St[f >> 2] >> 2] = I), (P = ue), (C = pe)
                      continue e
                    case 2:
                      ;(r = 0 | St[f >> 2]),
                        (St[r >> 2] = I),
                        (St[(r + 4) >> 2] = (((0 | I) < 0) << 31) >> 31),
                        (N = 0),
                        (D = I),
                        (P = ue),
                        (C = pe)
                      continue e
                    case 3:
                      ;(N = 0), (D = _t[St[f >> 2] >> 1] = I), (P = ue), (C = pe)
                      continue e
                    case 4:
                      ;(N = 0), (D = Et[St[f >> 2] >> 0] = I), (P = ue), (C = pe)
                      continue e
                    case 6:
                      ;(N = 0), (D = St[St[f >> 2] >> 2] = I), (P = ue), (C = pe)
                      continue e
                    case 7:
                      ;(r = 0 | St[f >> 2]),
                        (St[r >> 2] = I),
                        (St[(r + 4) >> 2] = (((0 | I) < 0) << 31) >> 31),
                        (N = 0),
                        (D = I),
                        (P = ue),
                        (C = pe)
                      continue e
                    default:
                      ;(N = 0), (D = I), (P = ue), (C = pe)
                      continue e
                  }
                  break
                case 112:
                  ;(Fe = 120), (we = 8 < me >>> 0 ? me : 8), (ye = 8 | re), (L = 63)
                  break
                case 88:
                case 120:
                  ;(Fe = j), (we = me), (ye = re), (L = 63)
                  break
                case 111:
                  if ((0 == (0 | (te = 0 | St[(r = f) >> 2]))) & (0 == (0 | (ee = 0 | St[(r + 4) >> 2])))) ve = _
                  else
                    for (r = _, Me = te, te = ee; ; ) {
                      if (
                        ((Et[(ee = (r + -1) | 0) >> 0] = (7 & Me) | 48),
                        (0 == (0 | (Me = 0 | Ct(0 | Me, 0 | te, 3)))) & (0 == (0 | (te = Ft))))
                      ) {
                        ve = ee
                        break
                      }
                      r = ee
                    }
                  L =
                    ((Te =
                      ((ge =
                        8 & re
                          ? ((Re = 899), ((Ae = 0) | (r = (S - (Oe = ve)) | 0)) < (0 | me) ? me : (r + 1) | 0)
                          : ((Oe = ve), (Ae = 0), (Re = 899), me)),
                      re)),
                    76)
                  break
                case 105:
                case 100:
                  if (((te = 0 | St[(r = f) >> 2]), (0 | (Me = 0 | St[(r + 4) >> 2])) < 0)) {
                    ;(r = 0 | Nt(0, 0, 0 | te, 0 | Me)),
                      (ee = Ft),
                      (De = 1),
                      (Pe = 899),
                      (Ce = St[(Ne = f) >> 2] = r),
                      (Ie = St[(Ne + 4) >> 2] = ee),
                      (L = 75)
                    break r
                  }
                  L =
                    ((Ie =
                      ((Ce = ((Pe = 2048 & re ? ((De = 1), 900) : 0 == (0 | (De = ee = 1 & re)) ? 899 : 901), te)),
                      Me)),
                    75)
                  break
                case 117:
                  ;(Pe = 899), (Ce = (De = 0) | St[(Me = f) >> 2]), (Ie = 0 | St[(Me + 4) >> 2]), (L = 75)
                  break
                case 99:
                  ;(Et[m >> 0] = St[f >> 2]), (Le = m), (xe = 0), (Be = 899), (He = _), (Ue = 1), (ze = K)
                  break
                case 109:
                  ;(Me = 0 | vt()),
                    (Ye =
                      0 |
                      (function (e) {
                        e |= 0
                        var r = 0,
                          t = 0,
                          n = 0,
                          i = 0,
                          o = 0,
                          a = 0
                        r = 0
                        for (;;) {
                          if ((0 | mt[(953 + r) >> 0]) == (0 | e)) {
                            t = 2
                            break
                          }
                          if (87 == (0 | (n = (r + 1) | 0))) {
                            ;(i = 1041), (o = 87), (t = 5)
                            break
                          }
                          r = n
                        }
                        2 == (0 | t) && (r ? ((i = 1041), (o = r), (t = 5)) : (a = 1041))
                        if (5 == (0 | t))
                          for (;;) {
                            for (t = 0, r = i; (r = ((e = r) + 1) | 0), 0 != (0 | Et[e >> 0]); );
                            if (!(o = (o + -1) | 0)) {
                              a = r
                              break
                            }
                            ;(i = r), (t = 5)
                          }
                        return 0 | a
                      })(0 | St[Me >> 2])),
                    (L = 81)
                  break
                case 115:
                  ;(Ye = 0 | (Me = 0 | St[f >> 2]) ? Me : 909), (L = 81)
                  break
                case 67:
                  ;(St[c >> 2] = St[f >> 2]), (St[l >> 2] = 0), (Ve = -1), (Ke = St[f >> 2] = c), (L = 85)
                  break
                case 83:
                  ;(Me = 0 | St[f >> 2]), (L = me ? ((Ve = me), (Ke = Me), 85) : (gt(e, 32, oe, 0, re), (We = 0), 96))
                  break
                case 65:
                case 71:
                case 70:
                case 69:
                case 97:
                case 103:
                case 102:
                case 101:
                  ;(je = +ht[f >> 3]),
                    (St[a >> 2] = 0),
                    (ht[kt >> 3] = je),
                    (qe =
                      0 <= (0 | St[(kt + 4) >> 2])
                        ? ((Me = 1 & re),
                          2048 & re ? ((Xe = je), (Ge = 1), 919) : ((Xe = je), 0 == (0 | (Ge = Me)) ? 917 : 922))
                        : ((Xe = -je), (Ge = 1), 916)),
                    (ht[kt >> 3] = Xe),
                    (Me = 2146435072 & St[(kt + 4) >> 2])
                  do {
                    if ((Me >>> 0 < 2146435072) | ((2146435072 == (0 | Me)) & !1)) {
                      if (
                        ((te =
                          0 !=
                          (je =
                            2 *
                            ((T = a),
                            +(+(+(function e(r, t) {
                              r = +r
                              t |= 0
                              var n = 0,
                                i = 0,
                                o = 0,
                                a = 0,
                                u = 0,
                                s = 0,
                                f = 0
                              ht[kt >> 3] = r
                              n = 0 | St[kt >> 2]
                              i = 0 | St[(kt + 4) >> 2]
                              o = 0 | Ct(0 | n, 0 | i, 52)
                              switch (2047 & o) {
                                case 0:
                                  ;(s =
                                    0 != r
                                      ? ((a = +e(0x10000000000000000 * r, t)), (u = a), ((0 | St[t >> 2]) - 64) | 0)
                                      : ((u = r), 0)),
                                    (St[t >> 2] = s),
                                    (f = u)
                                  break
                                case 2047:
                                  f = r
                                  break
                                default:
                                  ;(St[t >> 2] = (2047 & o) - 1022),
                                    (St[kt >> 2] = n),
                                    (St[(kt + 4) >> 2] = (-2146435073 & i) | 1071644672),
                                    (f = +ht[kt >> 3])
                              }
                              return +f
                            })(+Xe, (T |= 0))))))) && (St[a >> 2] = (0 | St[a >> 2]) - 1),
                        97 == (0 | (ee = 32 | j)))
                      ) {
                        ;(Ne = 0 == (0 | (r = 32 & j)) ? qe : (qe + 9) | 0), (Qe = 2 | Ge), (Ze = (12 - me) | 0)
                        do {
                          if (!((11 < me >>> 0) | (0 == (0 | Ze)))) {
                            for (Je = 8, $e = Ze; ($e = ($e + -1) | 0), (Je *= 16), 0 != (0 | $e); );
                            if (45 == (0 | Et[Ne >> 0])) {
                              er = -(Je + (-je - Je))
                              break
                            }
                            er = je + Je - Je
                            break
                          }
                        } while (((er = je), 0))
                        for (
                          tr =
                            (0 |
                              (rr =
                                0 |
                                At(
                                  ($e = (0 | (Ze = 0 | St[a >> 2])) < 0 ? (0 - Ze) | 0 : Ze),
                                  (((0 | $e) < 0) << 31) >> 31,
                                  b
                                ))) ==
                            (0 | b)
                              ? ((Et[k >> 0] = 48), k)
                              : rr,
                            Et[(tr + -1) >> 0] = 43 + ((Ze >> 31) & 2),
                            Et[(Ze = (tr + -2) | 0) >> 0] = j + 15,
                            rr = (0 | me) < 1,
                            $e = 0 == ((8 & re) | 0),
                            nr = u,
                            ir = er;
                          ;

                        ) {
                          ;(or = ~~ir),
                            (ar = (nr + 1) | 0),
                            (Et[nr >> 0] = mt[(883 + or) >> 0] | r),
                            (ir = 16 * (ir - (0 | or)))
                          do {
                            if (1 == ((ar - h) | 0)) {
                              if ($e & rr & (0 == ir)) {
                                ur = ar
                                break
                              }
                              ;(Et[ar >> 0] = 46), (ur = (nr + 2) | 0)
                            } else ur = ar
                          } while (0)
                          if (0 == ir) break
                          nr = ur
                        }
                        ;(rr = Ze),
                          gt(
                            e,
                            32,
                            oe,
                            (r =
                              (($e =
                                (0 != (0 | me)) & (((w + (nr = ur)) | 0) < (0 | me))
                                  ? (y + me - rr) | 0
                                  : (F - rr + nr) | 0) +
                                Qe) |
                              0),
                            re
                          ),
                          32 & St[e >> 2] || Mt(Ne, Qe, e),
                          gt(e, 48, oe, r, 65536 ^ re),
                          (ar = (nr - h) | 0),
                          32 & St[e >> 2] || Mt(u, ar, e),
                          gt(e, 48, ($e - (ar + (nr = (s - rr) | 0))) | 0, 0, 0),
                          32 & St[e >> 2] || Mt(Ze, nr, e),
                          gt(e, 32, oe, r, 8192 ^ re),
                          (sr = (0 | r) < (0 | oe) ? oe : r)
                        break
                      }
                      for (
                        r = (0 | me) < 0 ? 6 : me,
                          lr = te
                            ? ((nr = ((0 | St[a >> 2]) - 28) | 0), (fr = 268435456 * je), (St[a >> 2] = nr))
                            : ((fr = je), 0 | St[a >> 2]),
                          nr = (0 | lr) < 0 ? o : v,
                          ar = nr,
                          ir = fr;
                        ($e = ~~ir >>> 0),
                          (St[ar >> 2] = $e),
                          (ar = (ar + 4) | 0),
                          (ir = 1e9 * (ir - ($e >>> 0))),
                          0 != ir;

                      );
                      if (0 < (0 | lr))
                        for (te = nr, Ze = ar, Qe = lr; ; ) {
                          ;(Ne = 29 < (0 | Qe) ? 29 : Qe), ($e = (Ze + -4) | 0)
                          do {
                            if ($e >>> 0 < te >>> 0) cr = te
                            else {
                              for (
                                rr = $e, or = 0;
                                (_r =
                                  0 |
                                  xt(
                                    0 | (Er = 0 | Dt(0 | (dr = 0 | It(0 | St[rr >> 2], 0, 0 | Ne)), 0 | Ft, 0 | or, 0)),
                                    0 | (dr = Ft),
                                    1e9,
                                    0
                                  )),
                                  (St[rr >> 2] = _r),
                                  (or = 0 | Lt(0 | Er, 0 | dr, 1e9, 0)),
                                  (rr = (rr + -4) | 0),
                                  te >>> 0 <= rr >>> 0;

                              );
                              if (!or) {
                                cr = te
                                break
                              }
                              ;(St[(rr = (te + -4) | 0) >> 2] = or), (cr = rr)
                            }
                          } while (0)
                          for ($e = Ze; !($e >>> 0 <= cr >>> 0 || 0 | St[(rr = ($e + -4) | 0) >> 2]); ) $e = rr
                          if (((rr = ((0 | St[a >> 2]) - Ne) | 0), !(0 < (0 | (St[a >> 2] = rr))))) {
                            ;(Sr = cr), (mr = $e), (hr = rr)
                            break
                          }
                          ;(te = cr), (Ze = $e), (Qe = rr)
                        }
                      else (Sr = nr), (mr = ar), (hr = lr)
                      if ((0 | hr) < 0)
                        for (
                          Qe = (1 + ((((r + 25) | 0) / 9) | 0)) | 0, Ze = 102 == (0 | ee), te = Sr, rr = mr, dr = hr;
                          ;

                        ) {
                          _r = 9 < (0 | (Er = (0 - dr) | 0)) ? 9 : Er
                          do {
                            if (te >>> 0 < rr >>> 0) {
                              for (
                                Er = ((1 << _r) - 1) | 0, R = 1e9 >>> _r, pr = 0, br = te;
                                (g = 0 | St[br >> 2]),
                                  (St[br >> 2] = (g >>> _r) + pr),
                                  (pr = 0 | wt(g & Er, R)),
                                  (br = (br + 4) | 0),
                                  br >>> 0 < rr >>> 0;

                              );
                              if (((br = 0 == (0 | St[te >> 2]) ? (te + 4) | 0 : te), !pr)) {
                                ;(kr = br), (Fr = rr)
                                break
                              }
                              ;(St[rr >> 2] = pr), (kr = br), (Fr = (rr + 4) | 0)
                            } else (kr = 0 == (0 | St[te >> 2]) ? (te + 4) | 0 : te), (Fr = rr)
                          } while (0)
                          if (
                            ((Ne = (0 | Qe) < (((Fr - ($e = Ze ? nr : kr)) >> 2) | 0) ? ($e + (Qe << 2)) | 0 : Fr),
                            (dr = ((0 | St[a >> 2]) + _r) | 0),
                            0 <= (0 | (St[a >> 2] = dr)))
                          ) {
                            ;(wr = kr), (yr = Ne)
                            break
                          }
                          ;(te = kr), (rr = Ne)
                        }
                      else (wr = Sr), (yr = mr)
                      rr = nr
                      do {
                        if (wr >>> 0 < yr >>> 0) {
                          if (((te = (9 * ((rr - wr) >> 2)) | 0), (dr = 0 | St[wr >> 2]) >>> 0 < 10)) {
                            vr = te
                            break
                          }
                          for (Mr = te, Or = 10; ; ) {
                            if (((te = (Mr + 1) | 0), dr >>> 0 < (Or = (10 * Or) | 0) >>> 0)) {
                              vr = te
                              break
                            }
                            Mr = te
                          }
                        } else vr = 0
                      } while (0)
                      if (
                        (0 |
                          (te =
                            (r -
                              (102 != (0 | ee) ? vr : 0) +
                              ((((_r = 0 != (0 | r)) & (dr = 103 == (0 | ee))) << 31) >> 31)) |
                            0)) <
                        ((((9 * ((yr - rr) >> 2)) | 0) - 9) | 0)
                      ) {
                        if (
                          ((te = (nr + 4 + (((((0 | (Qe = (te + 9216) | 0)) / 9) | 0) - 1024) << 2)) | 0),
                          (0 | (Ze = (1 + ((0 | Qe) % 9 | 0)) | 0)) < 9)
                        )
                          for (Qe = Ze, Ze = 10; ; ) {
                            if (((ar = (10 * Ze) | 0), 9 == (0 | (Qe = (Qe + 1) | 0)))) {
                              Ar = ar
                              break
                            }
                            Ze = ar
                          }
                        else Ar = 10
                        ;(Qe = ((Ze = 0 | St[te >> 2]) >>> 0) % (Ar >>> 0) | 0), (ee = ((te + 4) | 0) == (0 | yr))
                        do {
                          if (ee & (0 == (0 | Qe))) (Rr = te), (gr = vr), (Tr = wr)
                          else {
                            ;(ir =
                              0 == ((1 & (((Ze >>> 0) / (Ar >>> 0)) | 0)) | 0) ? 9007199254740992 : 9007199254740994),
                              (Nr =
                                Qe >>> 0 < (ar = ((0 | Ar) / 2) | 0) >>> 0
                                  ? 0.5
                                  : ee & ((0 | Qe) == (0 | ar))
                                    ? 1
                                    : 1.5)
                            do {
                              if (Ge) {
                                if (45 != (0 | Et[qe >> 0])) {
                                  ;(Dr = Nr), (Pr = ir)
                                  break
                                }
                                ;(Dr = -Nr), (Pr = -ir)
                              } else (Dr = Nr), (Pr = ir)
                            } while (0)
                            if (((ar = (Ze - Qe) | 0), (St[te >> 2] = ar), Pr + Dr == Pr)) {
                              ;(Rr = te), (gr = vr), (Tr = wr)
                              break
                            }
                            if (((Ne = (ar + Ar) | 0), 999999999 < (St[te >> 2] = Ne) >>> 0))
                              for (Ne = te, ar = wr; ; ) {
                                if (
                                  ((Cr =
                                    ($e = (Ne + -4) | 0) >>> (St[Ne >> 2] = 0) < ar >>> 0
                                      ? ((St[(br = (ar + -4) | 0) >> 2] = 0), br)
                                      : ar),
                                  (br = (1 + (0 | St[$e >> 2])) | 0),
                                  !(999999999 < (St[$e >> 2] = br) >>> 0))
                                ) {
                                  ;(Ir = $e), (Lr = Cr)
                                  break
                                }
                                ;(Ne = $e), (ar = Cr)
                              }
                            else (Ir = te), (Lr = wr)
                            if (((ar = (9 * ((rr - Lr) >> 2)) | 0), (Ne = 0 | St[Lr >> 2]) >>> 0 < 10)) {
                              ;(Rr = Ir), (gr = ar), (Tr = Lr)
                              break
                            }
                            for (xr = ar, Br = 10; ; ) {
                              if (((ar = (xr + 1) | 0), Ne >>> 0 < (Br = (10 * Br) | 0) >>> 0)) {
                                ;(Rr = Ir), (gr = ar), (Tr = Lr)
                                break
                              }
                              xr = ar
                            }
                          }
                        } while (0)
                        ;(Hr = gr), (Ur = (te = (Rr + 4) | 0) >>> 0 < yr >>> 0 ? te : yr), (zr = Tr)
                      } else (Hr = vr), (Ur = yr), (zr = wr)
                      for (te = (0 - Hr) | 0, Qe = Ur; ; ) {
                        if (Qe >>> 0 <= zr >>> 0) {
                          Yr = 0
                          break
                        }
                        if (0 | St[(Ze = (Qe + -4) | 0) >> 2]) {
                          Yr = 1
                          break
                        }
                        Qe = Ze
                      }
                      do {
                        if (dr) {
                          if (
                            ((Kr =
                              ((0 | Hr) < (0 | (Ze = (((1 & _r) ^ 1) + r) | 0))) & (-5 < (0 | Hr))
                                ? ((Vr = (j + -1) | 0), (Ze + -1 - Hr) | 0)
                                : ((Vr = (j + -2) | 0), (Ze + -1) | 0)),
                            0 | (Ze = 8 & re))
                          ) {
                            ;(Wr = Vr), (jr = Kr), (Xr = Ze)
                            break
                          }
                          do {
                            if (Yr) {
                              if (!(Ze = 0 | St[(Qe + -4) >> 2])) {
                                Gr = 9
                                break
                              }
                              if ((Ze >>> 0) % 10 | 0) {
                                Gr = 0
                                break
                              }
                              for (qr = 0, Qr = 10; ; ) {
                                if (((ee = (qr + 1) | 0), (Ze >>> 0) % ((Qr = (10 * Qr) | 0) >>> 0) | 0)) {
                                  Gr = ee
                                  break
                                }
                                qr = ee
                              }
                            } else Gr = 9
                          } while (0)
                          if (((Ze = (((9 * ((Qe - rr) >> 2)) | 0) - 9) | 0), 102 == (32 | Vr))) {
                            ;(Wr = Vr),
                              (jr = (0 | Kr) < (0 | (ee = (0 | (pr = (Ze - Gr) | 0)) < 0 ? 0 : pr)) ? Kr : ee),
                              (Xr = 0)
                            break
                          }
                          ;(Wr = Vr),
                            (jr = (0 | Kr) < (0 | (Ze = (0 | (ee = (Ze + Hr - Gr) | 0)) < 0 ? 0 : ee)) ? Kr : Ze),
                            (Xr = 0)
                          break
                        }
                      } while (((Wr = j), (jr = r), (Xr = 8 & re), 0))
                      if (((rr = (0 != (0 | (r = jr | Xr))) & 1), (_r = 102 == (32 | Wr))))
                        Jr = (Zr = 0) < (0 | Hr) ? Hr : 0
                      else {
                        if (
                          ((s - (Ze = 0 | At((dr = (0 | Hr) < 0 ? te : Hr), (((0 | dr) < 0) << 31) >> 31, b))) | 0) <
                          2
                        )
                          for (dr = Ze; ; ) {
                            if (((Et[(ee = (dr + -1) | 0) >> 0] = 48), !(((s - ee) | 0) < 2))) {
                              $r = ee
                              break
                            }
                            dr = ee
                          }
                        else $r = Ze
                        ;(Et[($r + -1) >> 0] = 43 + ((Hr >> 31) & 2)),
                          (Et[(dr = ($r + -2) | 0) >> 0] = Wr),
                          (Jr = (s - (Zr = dr)) | 0)
                      }
                      gt(e, 32, oe, (dr = (Ge + 1 + jr + rr + Jr) | 0), re),
                        32 & St[e >> 2] || Mt(qe, Ge, e),
                        gt(e, 48, oe, dr, 65536 ^ re)
                      do {
                        if (_r) {
                          ee = te = nr >>> 0 < zr >>> 0 ? nr : zr
                          do {
                            pr = 0 | At(0 | St[ee >> 2], 0, M)
                            do {
                              if ((0 | ee) == (0 | te)) {
                                if ((0 | pr) != (0 | M)) {
                                  et = pr
                                  break
                                }
                                ;(Et[A >> 0] = 48), (et = A)
                              } else {
                                if (pr >>> 0 <= u >>> 0) {
                                  et = pr
                                  break
                                }
                                for (Pt(0 | u, 48, (pr - h) | 0), Ne = pr; ; ) {
                                  if (!(u >>> 0 < (ar = (Ne + -1) | 0) >>> 0)) {
                                    et = ar
                                    break
                                  }
                                  Ne = ar
                                }
                              }
                            } while (0)
                          } while ((32 & St[e >> 2] || Mt(et, (O - et) | 0, e), (ee = (ee + 4) | 0) >>> 0 <= nr >>> 0))
                          do {
                            if (0 | r) {
                              if ((32 & St[e >> 2]) | 0) break
                              Mt(951, 1, e)
                            }
                          } while (0)
                          if ((0 < (0 | jr)) & (ee >>> 0 < Qe >>> 0))
                            for (te = jr, pr = ee; ; ) {
                              if (u >>> 0 < (Ne = 0 | At(0 | St[pr >> 2], 0, M)) >>> 0)
                                for (Pt(0 | u, 48, (Ne - h) | 0), ar = Ne; ; ) {
                                  if (!(u >>> 0 < ($e = (ar + -1) | 0) >>> 0)) {
                                    rt = $e
                                    break
                                  }
                                  ar = $e
                                }
                              else rt = Ne
                              if (
                                (32 & St[e >> 2] || Mt(rt, 9 < (0 | te) ? 9 : te, e),
                                (ar = (te + -9) | 0),
                                !((9 < (0 | te)) & ((pr = (pr + 4) | 0) >>> 0 < Qe >>> 0)))
                              ) {
                                tt = ar
                                break
                              }
                              te = ar
                            }
                          else tt = jr
                          gt(e, 48, (tt + 9) | 0, 9, 0)
                        } else {
                          if (((te = Yr ? Qe : (zr + 4) | 0), -1 < (0 | jr)))
                            for (pr = 0 == (0 | Xr), ee = jr, ar = zr; ; ) {
                              nt = (0 | ($e = 0 | At(0 | St[ar >> 2], 0, M))) == (0 | M) ? ((Et[A >> 0] = 48), A) : $e
                              do {
                                if ((0 | ar) == (0 | zr)) {
                                  if ((($e = (nt + 1) | 0), 32 & St[e >> 2] || Mt(nt, 1, e), pr & ((0 | ee) < 1))) {
                                    it = $e
                                    break
                                  }
                                  if ((32 & St[e >> 2]) | 0) {
                                    it = $e
                                    break
                                  }
                                  Mt(951, 1, e), (it = $e)
                                } else {
                                  if (nt >>> 0 <= u >>> 0) {
                                    it = nt
                                    break
                                  }
                                  for (Pt(0 | u, 48, (nt + p) | 0), $e = nt; ; ) {
                                    if (!(u >>> 0 < (br = ($e + -1) | 0) >>> 0)) {
                                      it = br
                                      break
                                    }
                                    $e = br
                                  }
                                }
                              } while (0)
                              if (
                                ((Ne = (O - it) | 0),
                                32 & St[e >> 2] || Mt(it, (0 | Ne) < (0 | ee) ? Ne : ee, e),
                                !(((ar = (ar + 4) | 0) >>> 0 < te >>> 0) & (-1 < (0 | ($e = (ee - Ne) | 0)))))
                              ) {
                                ot = $e
                                break
                              }
                              ee = $e
                            }
                          else ot = jr
                          if ((gt(e, 48, (ot + 18) | 0, 18, 0), (32 & St[e >> 2]) | 0)) break
                          Mt(Zr, (s - Zr) | 0, e)
                        }
                      } while (0)
                      gt(e, 32, oe, dr, 8192 ^ re), (sr = (0 | dr) < (0 | oe) ? oe : dr)
                    } else
                      (Qe = 0 != ((32 & j) | 0)),
                        gt(e, 32, oe, (_r = ((nr = (r = (Xe != Xe) | !1) ? 0 : Ge) + 3) | 0), K),
                        32 & (32 & (rr = 0 | St[e >> 2]) ? rr : (Mt(qe, nr, e), 0 | St[e >> 2])) ||
                          Mt(r ? (Qe ? 943 : 947) : Qe ? 935 : 939, 3, e),
                        gt(e, 32, oe, _r, 8192 ^ re),
                        (sr = (0 | _r) < (0 | oe) ? oe : _r)
                  } while (0)
                  ;(N = sr), (D = I), (P = ue), (C = pe)
                  continue e
                default:
                  ;(Le = C), (xe = 0), (Be = 899), (He = _), (Ue = me), (ze = re)
              }
            } while (0)
            r: do {
              if (63 == (0 | L)) {
                if (
                  ((W = (L = 0) | St[(j = f) >> 2]),
                  (V = 0 | St[(j + 4) >> 2]),
                  (j = 32 & Fe),
                  (0 == (0 | W)) & (0 == (0 | V)))
                )
                  (at = _), (st = ut = 0)
                else {
                  for (
                    Me = _, _r = W, W = V;
                    (Et[(Me = (Me + -1) | 0) >> 0] = mt[(883 + (15 & _r)) >> 0] | j),
                      (_r = 0 | Ct(0 | _r, 0 | W, 4)),
                      (W = Ft),
                      !((0 == (0 | _r)) & (0 == (0 | W)));

                  );
                  ;(at = Me), (ut = 0 | St[(W = f) >> 2]), (st = 0 | St[(W + 4) >> 2])
                }
                ;(Oe = at),
                  (Ae = (W = (0 == ((8 & ye) | 0)) | ((0 == (0 | ut)) & (0 == (0 | st)))) ? 0 : 2),
                  (Re = W ? 899 : (899 + (Fe >> 4)) | 0),
                  (ge = we),
                  (Te = ye),
                  (L = 76)
              } else if (75 == (0 | L))
                (Oe = (L = 0) | At(Ce, Ie, _)), (Ae = De), (Re = Pe), (ge = me), (Te = re), (L = 76)
              else if (81 == (0 | L))
                (Be = 899),
                  (He = (_r = (xe = L = 0) == (0 | (W = 0 | Rt((Le = Ye), 0, me)))) ? (Ye + me) | 0 : W),
                  (Ue = _r ? me : (W - Ye) | 0),
                  (ze = K)
              else if (85 == (0 | L)) {
                for (W = Ke, j = _r = L = 0; ; ) {
                  if (!(V = 0 | St[W >> 2])) {
                    ;(ft = _r), (lt = j)
                    break
                  }
                  if (((0 | (Qe = 0 | Tt(d, V))) < 0) | (((Ve - _r) | 0) >>> 0 < Qe >>> 0)) {
                    ;(ft = _r), (lt = Qe)
                    break
                  }
                  if (!((V = (Qe + _r) | 0) >>> 0 < Ve >>> 0)) {
                    ;(ft = V), (lt = Qe)
                    break
                  }
                  ;(W = (W + 4) | 0), (_r = V), (j = Qe)
                }
                if ((0 | lt) < 0) {
                  ie = -1
                  break e
                }
                if ((gt(e, 32, oe, ft, re), ft))
                  for (j = Ke, _r = 0; ; ) {
                    if (!(W = 0 | St[j >> 2])) {
                      ;(We = ft), (L = 96)
                      break r
                    }
                    if ((0 | ft) < (0 | (_r = ((Me = 0 | Tt(d, W)) + _r) | 0))) {
                      ;(We = ft), (L = 96)
                      break r
                    }
                    if ((32 & St[e >> 2] || Mt(d, Me, e), ft >>> 0 <= _r >>> 0)) {
                      ;(We = ft), (L = 96)
                      break
                    }
                    j = (j + 4) | 0
                  }
                else (We = 0), (L = 96)
              }
            } while (0)
            C =
              ((P =
                ((D =
                  ((N =
                    96 != (0 | L)
                      ? (76 == (0 | L) &&
                          ((K = -1 < ((L = 0) | ge) ? -65537 & Te : Te),
                          (ze =
                            ((Ue =
                              (0 != (0 | ge)) | (_r = (0 != (0 | St[(j = f) >> 2])) | (0 != (0 | St[(j + 4) >> 2])))
                                ? ((xe = Ae),
                                  (Be = Re),
                                  (He = _),
                                  (0 | (j = (S - (Le = Oe) + ((1 & _r) ^ 1)) | 0)) < (0 | ge) ? ge : j)
                                : ((xe = Ae), (Be = Re), (He = Le = _), 0)),
                            K))),
                        gt(
                          e,
                          32,
                          (Me =
                            (0 | oe) < (0 | (_r = ((j = (0 | Ue) < (0 | (K = (He - Le) | 0)) ? K : Ue) + xe) | 0))
                              ? _r
                              : oe),
                          _r,
                          ze
                        ),
                        32 & St[e >> 2] || Mt(Be, xe, e),
                        gt(e, 48, Me, _r, 65536 ^ ze),
                        gt(e, 48, j, K, 0),
                        32 & St[e >> 2] || Mt(Le, K, e),
                        gt(e, 32, Me, _r, 8192 ^ ze),
                        Me)
                      : ((L = 0), gt(e, 32, oe, We, 8192 ^ re), (0 | We) < (0 | oe) ? oe : We)),
                  I)),
                ue)),
              pe)
          } else (N = 0), (D = I), (P = ue), (C = pe)
        }
      }
      e: do {
        if (243 == (0 | L))
          if (e) ie = I
          else if (P) {
            for (pe = 1; ; ) {
              if (!(C = 0 | St[(i + (pe << 2)) >> 2])) {
                ct = pe
                break
              }
              if ((Ot((n + (pe << 3)) | 0, C, t), 10 <= (0 | (pe = (pe + 1) | 0)))) {
                ie = 1
                break e
              }
            }
            for (;;) {
              if (0 | St[(i + (ct << 2)) >> 2]) {
                ie = -1
                break e
              }
              if (10 <= (0 | (ct = (ct + 1) | 0))) {
                ie = 1
                break
              }
            }
          } else ie = 0
      } while (0)
      return (pt = dt), 0 | ie
    }
    function ze() {
      return 0
    }
    function Mt(e, r, t) {
      ;(e |= 0), (r |= 0)
      var n,
        i,
        o = 0,
        a = 0,
        u = 0,
        s = 0,
        f = 0,
        l = 0,
        c = 0,
        d = 0,
        E = 0
      ;(a = 0 | St[(o = ((t |= 0) + 16) | 0) >> 2])
        ? ((u = a), (s = 5))
        : 0 |
            (function (e) {
              var r = 0,
                t = 0,
                n = 0
              ;(t = 0 | Et[(r = (74 + (e |= 0)) | 0) >> 0]),
                (Et[r >> 0] = (255 + t) | t),
                (n =
                  8 & (t = 0 | St[e >> 2])
                    ? ((St[e >> 2] = 32 | t), -1)
                    : ((St[(e + 8) >> 2] = 0),
                      (St[(e + 4) >> 2] = 0),
                      (r = 0 | St[(e + 44) >> 2]),
                      (St[(e + 28) >> 2] = r),
                      (St[(e + 20) >> 2] = r),
                      (St[(e + 16) >> 2] = r + (0 | St[(e + 48) >> 2])),
                      0))
              return 0 | n
            })(t)
          ? (f = 0)
          : ((u = 0 | St[o >> 2]), (s = 5))
      e: do {
        if (5 == (0 | s)) {
          if (((u - (n = o = 0 | St[(a = (t + 20) | 0) >> 2])) | 0) >>> 0 < r >>> 0) {
            f = 0 | nr[15 & St[(t + 36) >> 2]](t, e, r)
            break
          }
          r: do {
            if (-1 < (0 | Et[(t + 75) >> 0])) {
              for (o = r; ; ) {
                if (!o) {
                  ;(l = r), (c = e), (d = 0), (E = n)
                  break r
                }
                if (10 == (0 | Et[(e + (i = (o + -1) | 0)) >> 0])) break
                o = i
              }
              if ((0 | nr[15 & St[(t + 36) >> 2]](t, e, o)) >>> 0 < o >>> 0) {
                f = o
                break e
              }
              ;(l = (r - o) | 0), (c = (e + o) | 0), (d = o), (E = 0 | St[a >> 2])
            } else (l = r), (c = e), (d = 0), (E = n)
          } while (0)
          Je(0 | E, 0 | c, 0 | l), (St[a >> 2] = (0 | St[a >> 2]) + l), (f = (d + l) | 0)
        }
      } while (0)
      return 0 | f
    }
    function Ot(e, r, t) {
      ;(e |= 0), (r |= 0), (t |= 0)
      var n,
        i = 0,
        o = 0,
        a = 0,
        u = 0
      e: do {
        if (r >>> 0 <= 20) {
          switch (0 | r) {
            case 9:
              ;(i = (3 + (0 | St[t >> 2])) & -4), (o = 0 | St[i >> 2]), (St[t >> 2] = i + 4), (St[e >> 2] = o)
              break e
            case 10:
              ;(o = (3 + (0 | St[t >> 2])) & -4),
                (i = 0 | St[o >> 2]),
                (St[t >> 2] = o + 4),
                (St[(o = e) >> 2] = i),
                (St[(o + 4) >> 2] = (((0 | i) < 0) << 31) >> 31)
              break e
            case 11:
              ;(i = (3 + (0 | St[t >> 2])) & -4),
                (o = 0 | St[i >> 2]),
                (St[t >> 2] = i + 4),
                (St[(i = e) >> 2] = o),
                (St[(i + 4) >> 2] = 0)
              break e
            case 12:
              ;(i = (7 + (0 | St[t >> 2])) & -8),
                (n = 0 | St[(o = i) >> 2]),
                (a = 0 | St[(o + 4) >> 2]),
                (St[t >> 2] = i + 8),
                (St[(i = e) >> 2] = n),
                (St[(i + 4) >> 2] = a)
              break e
            case 13:
              ;(a = (3 + (0 | St[t >> 2])) & -4),
                (i = 0 | St[a >> 2]),
                (St[t >> 2] = a + 4),
                (a = ((65535 & i) << 16) >> 16),
                (St[(i = e) >> 2] = a),
                (St[(i + 4) >> 2] = (((0 | a) < 0) << 31) >> 31)
              break e
            case 14:
              ;(a = (3 + (0 | St[t >> 2])) & -4),
                (i = 0 | St[a >> 2]),
                (St[t >> 2] = a + 4),
                (St[(a = e) >> 2] = 65535 & i),
                (St[(a + 4) >> 2] = 0)
              break e
            case 15:
              ;(a = (3 + (0 | St[t >> 2])) & -4),
                (i = 0 | St[a >> 2]),
                (St[t >> 2] = a + 4),
                (a = ((255 & i) << 24) >> 24),
                (St[(i = e) >> 2] = a),
                (St[(i + 4) >> 2] = (((0 | a) < 0) << 31) >> 31)
              break e
            case 16:
              ;(a = (3 + (0 | St[t >> 2])) & -4),
                (i = 0 | St[a >> 2]),
                (St[t >> 2] = a + 4),
                (St[(a = e) >> 2] = 255 & i),
                (St[(a + 4) >> 2] = 0)
              break e
            case 17:
            case 18:
              ;(a = (7 + (0 | St[t >> 2])) & -8), (u = +ht[a >> 3]), (St[t >> 2] = a + 8), (ht[e >> 3] = u)
              break e
            default:
              break e
          }
        }
      } while (0)
    }
    function At(e, r, t) {
      t |= 0
      var n = 0,
        i = 0,
        o = 0,
        a = 0,
        u = 0,
        s = 0
      if ((0 < (r |= 0) >>> 0) | ((0 == (0 | r)) & (4294967295 < (e |= 0) >>> 0))) {
        for (
          n = t, i = e, o = r;
          (r = 0 | xt(0 | i, 0 | o, 10, 0)),
            (Et[(n = (n + -1) | 0) >> 0] = 48 | r),
            (i = 0 | Lt(0 | (r = i), 0 | o, 10, 0)),
            (9 < o >>> 0) | ((9 == (0 | o)) & (4294967295 < r >>> 0));

        )
          o = Ft
        ;(a = i), (u = n)
      } else (a = e), (u = t)
      if (a)
        for (t = a, a = u; ; ) {
          if (((Et[(u = (a + -1) | 0) >> 0] = (t >>> 0) % 10 | 48), t >>> 0 < 10)) {
            s = u
            break
          }
          ;(t = ((t >>> 0) / 10) | 0), (a = u)
        }
      else s = u
      return 0 | s
    }
    function Rt(e, r, t) {
      e |= 0
      var n,
        i,
        o,
        a,
        u = 0,
        s = 0,
        f = 0,
        l = 0,
        c = 0,
        d = 0,
        E = 0,
        _ = 0,
        S = 0,
        m = 0,
        h = 0,
        p = 0,
        b = 0,
        k = 0,
        F = 0,
        w = 255 & (r |= 0),
        u = 0 != (0 | (t |= 0))
      e: do {
        if (u & (0 != ((3 & e) | 0)))
          for (n = 255 & r, s = e, f = t; ; ) {
            if ((0 | Et[s >> 0]) == (n << 24) >> 24) {
              ;(l = s), (c = f), (d = 6)
              break e
            }
            if (!((a = 0 != (0 | (o = (f + -1) | 0))) & (0 != ((3 & (i = (s + 1) | 0)) | 0)))) {
              ;(E = i), (_ = o), (S = a), (d = 5)
              break
            }
            ;(s = i), (f = o)
          }
        else (E = e), (_ = t), (S = u), (d = 5)
      } while (0)
      5 == (0 | d) && (S ? ((l = E), (c = _), (d = 6)) : ((m = E), (h = 0)))
      e: do {
        if (6 == (0 | d))
          if (((E = 255 & r), (0 | Et[l >> 0]) == (E << 24) >> 24)) (m = l), (h = c)
          else {
            _ = 0 | wt(w, 16843009)
            r: do {
              if (3 < c >>> 0) {
                for (S = l, u = c; !((((-2139062144 & (t = St[S >> 2] ^ _)) ^ -2139062144) & (t + -16843009)) | 0); ) {
                  if (((t = (S + 4) | 0), !(3 < (e = (u + -4) | 0) >>> 0))) {
                    ;(p = t), (b = e), (d = 11)
                    break r
                  }
                  ;(S = t), (u = e)
                }
                ;(k = S), (F = u)
              } else (p = l), (b = c), (d = 11)
            } while (0)
            if (11 == (0 | d)) {
              if (!b) {
                ;(m = p), (h = 0)
                break
              }
              ;(k = p), (F = b)
            }
            for (;;) {
              if ((0 | Et[k >> 0]) == (E << 24) >> 24) {
                ;(m = k), (h = F)
                break e
              }
              if (((_ = (k + 1) | 0), !(F = (F + -1) | 0))) {
                ;(m = _), (h = 0)
                break
              }
              k = _
            }
          }
      } while (0)
      return 0 | (0 | h ? m : 0)
    }
    function gt(e, r, t, n, i) {
      ;(e |= 0), (r |= 0), (t |= 0), (n |= 0), (i |= 0)
      var o,
        a,
        u,
        s,
        f = 0,
        l = 0,
        c = 0,
        d = 0,
        E = 0,
        _ = pt
      ;(0 | bt) <= (0 | (pt = (pt + 256) | 0)) && yt(256), (o = _)
      do {
        if (((0 | n) < (0 | t)) & (0 == ((73728 & i) | 0))) {
          if (
            (Pt(0 | o, 0 | r, 0 | (256 < (a = (t - n) | 0) >>> 0 ? 256 : a)),
            (u = 0 == ((32 & (f = 0 | St[e >> 2])) | 0)),
            255 < a >>> 0)
          ) {
            for (
              s = (t - n) | 0, l = a, c = f, f = u;
              (f = 0 == ((32 & (d = f ? (Mt(o, 256, e), 0 | St[e >> 2]) : c)) | 0)),
                !((l = (l + -256) | 0) >>> 0 <= 255);

            )
              c = d
            if (!f) break
            E = 255 & s
          } else {
            if (!u) break
            E = a
          }
          Mt(o, E, e)
        }
      } while (0)
      pt = _
    }
    function Tt(e, r) {
      r |= 0
      return (
        0 |
        ((e |= 0)
          ? 0 |
            (function (e, r, t) {
              ;(e |= 0), (r |= 0), (t |= 0)
              var n = 0
              do {
                if (e) {
                  if (r >>> 0 < 128) {
                    ;(Et[e >> 0] = r), (n = 1)
                    break
                  }
                  if (r >>> 0 < 2048) {
                    ;(Et[e >> 0] = (r >>> 6) | 192), (Et[(e + 1) >> 0] = (63 & r) | 128), (n = 2)
                    break
                  }
                  if ((r >>> 0 < 55296) | (57344 == ((-8192 & r) | 0))) {
                    ;(Et[e >> 0] = (r >>> 12) | 224),
                      (Et[(e + 1) >> 0] = ((r >>> 6) & 63) | 128),
                      (Et[(e + 2) >> 0] = (63 & r) | 128),
                      (n = 3)
                    break
                  }
                  if (((r + -65536) | 0) >>> 0 < 1048576) {
                    ;(Et[e >> 0] = (r >>> 18) | 240),
                      (Et[(e + 1) >> 0] = ((r >>> 12) & 63) | 128),
                      (Et[(e + 2) >> 0] = ((r >>> 6) & 63) | 128),
                      (Et[(e + 3) >> 0] = (63 & r) | 128),
                      (n = 4)
                    break
                  }
                  ;(t = 0 | vt()), (St[t >> 2] = 84), (n = -1)
                  break
                }
              } while (((n = 1), 0))
              return 0 | n
            })(e, r, 0)
          : 0)
      )
    }
    function Ye(e, r) {
      var t =
        0 |
        (function (e, r) {
          e |= 0
          var t = 0,
            n = 0,
            i = 0,
            o = 0,
            a = 0,
            u = 0,
            s = 0,
            f = 0,
            l = 0
          t = 255 & (r |= 0)
          e: do {
            if (t) {
              if (3 & e)
                for (o = 255 & r, a = e; ; ) {
                  if (((u = 0 | Et[a >> 0]) << 24) >> 24 == 0 || (u << 24) >> 24 == (o << 24) >> 24) {
                    n = a
                    break e
                  }
                  if (!(3 & (u = (a + 1) | 0))) {
                    i = u
                    break
                  }
                  a = u
                }
              else i = e
              ;(a = 0 | wt(t, 16843009)), (o = 0 | St[i >> 2])
              r: do {
                if (((-2139062144 & o) ^ -2139062144) & (o + -16843009)) l = i
                else
                  for (u = i, s = o; ; ) {
                    if ((((-2139062144 & (f = s ^ a)) ^ -2139062144) & (f - 16843009)) | 0) {
                      l = u
                      break r
                    }
                    if ((((-2139062144 & (s = 0 | St[(f = (u + 4) | 0) >> 2])) ^ -2139062144) & (s + -16843009)) | 0) {
                      l = f
                      break
                    }
                    u = f
                  }
              } while (0)
              for (a = 255 & r, o = l; ; ) {
                if (((u = 0 | Et[o >> 0]) << 24) >> 24 == 0 || (u << 24) >> 24 == (a << 24) >> 24) {
                  n = o
                  break
                }
                o = (o + 1) | 0
              }
            } else
              n =
                (e +
                  (0 |
                    (function (e) {
                      var r,
                        t = 0,
                        n = 0,
                        i = 0,
                        o = 0,
                        a = 0,
                        u = 0,
                        s = 0,
                        f = 0,
                        t = (e |= 0)
                      r: do {
                        if (3 & t)
                          for (o = e, a = t; ; ) {
                            if (!(0 | Et[o >> 0])) {
                              u = a
                              break r
                            }
                            if (!(3 & (a = r = (o + 1) | 0))) {
                              ;(n = r), (i = 4)
                              break
                            }
                            o = r
                          }
                        else (n = e), (i = 4)
                      } while (0)
                      if (4 == (0 | i)) {
                        for (i = n; !(((-2139062144 & (s = 0 | St[i >> 2])) ^ -2139062144) & (s + -16843009)); )
                          i = (i + 4) | 0
                        if (((255 & s) << 24) >> 24)
                          for (s = i; ; ) {
                            if (!(0 | Et[(i = (s + 1) | 0) >> 0])) {
                              f = i
                              break
                            }
                            s = i
                          }
                        else f = i
                        u = f
                      }
                      return (u - t) | 0
                    })(e))) |
                0
          } while (0)
          return 0 | n
        })((e |= 0), (r |= 0))
      return 0 | ((0 | Et[t >> 0]) == ((255 & r) << 24) >> 24 ? t : 0)
    }
    function Ve(e) {
      e |= 0
      var r = 0,
        t = 0,
        n = 0,
        i = 0,
        o = 0,
        a = 0,
        u = 0
      do {
        if (e) {
          if ((0 | St[(e + 76) >> 2]) <= -1) {
            r = 0 | Ke(e)
            break
          }
          r = ((t = !0) || He(), (n = 0 | Ke(e)))
        } else {
          if (((i = 0 | St[34] ? 0 | Ve(0 | St[34]) : 0), H(11076), (n = 0 | St[2768])))
            for (t = n, n = i; ; ) {
              if (
                ((a = (St[(t + 76) >> 2], 0)),
                (u = (0 | St[(t + 20) >> 2]) >>> 0 > (0 | St[(t + 28) >> 2]) >>> 0 ? 0 | Ke(t) | n : n),
                0 | a && He(),
                !(t = 0 | St[(t + 56) >> 2]))
              ) {
                o = u
                break
              }
              n = u
            }
          else o = i
          V(11076), (r = o)
        }
      } while (0)
      return 0 | r
    }
    function Ke(e) {
      var r,
        t,
        n,
        i,
        o = 0,
        a = ((e |= 0) + 28) | 0
      return (
        0 |
        ((0 | St[(o = (e + 20) | 0) >> 2]) >>> 0 > (0 | St[a >> 2]) >>> 0 &&
        (nr[15 & St[(e + 36) >> 2]](e, 0, 0), 0 == (0 | St[o >> 2]))
          ? -1
          : ((t = 0 | St[(r = (e + 4) | 0) >> 2]) >>> 0 < (i = 0 | St[(n = (e + 8) | 0) >> 2]) >>> 0 &&
              nr[15 & St[(e + 40) >> 2]](e, (t - i) | 0, 1),
            (St[(e + 16) >> 2] = 0),
            (St[a >> 2] = 0),
            (St[o >> 2] = 0),
            (St[n >> 2] = 0),
            (St[r >> 2] = 0)))
      )
    }
    function We(e, r, t) {
      ;(e |= 0), (r |= 0)
      var n = 0,
        n = 1 == (0 | (t |= 0)) ? (r - (0 | St[(e + 8) >> 2]) + (0 | St[(e + 4) >> 2])) | 0 : r,
        i = (e + 28) | 0
      return (
        0 |
        ((0 | St[(r = (e + 20) | 0) >> 2]) >>> 0 > (0 | St[i >> 2]) >>> 0 &&
        (nr[15 & St[(e + 36) >> 2]](e, 0, 0), 0 == (0 | St[r >> 2]))
          ? -1
          : ((St[(e + 16) >> 2] = 0),
            (St[i >> 2] = 0),
            ((St[r >> 2] = 0) | nr[15 & St[(e + 40) >> 2]](e, n, t)) < 0
              ? -1
              : ((St[(e + 8) >> 2] = 0), (St[(e + 4) >> 2] = 0), (St[e >> 2] = -17 & St[e >> 2]), 0)))
      )
    }
    function je(e) {
      var r = 0,
        t = 0,
        r = 128 & St[(e |= 0) >> 2] && (0 | St[(e + 20) >> 2]) >>> 0 > (0 | St[(e + 28) >> 2]) >>> 0 ? 2 : 1
      return (
        0 |
        ((0 | (t = 0 | nr[15 & St[(e + 40) >> 2]](e, 0, r))) < 0
          ? t
          : (t - (0 | St[(e + 8) >> 2]) + (0 | St[(e + 4) >> 2]) + (0 | St[(e + 20) >> 2]) - (0 | St[(e + 28) >> 2])) |
            0)
      )
    }
    function Xe(e) {
      e |= 0
      var r,
        t = 0,
        n = 0,
        i = 0,
        o = 0,
        a = 0,
        u = 0,
        s = 0,
        f = 0,
        l = 0,
        c = 0,
        d = 0,
        E = 0,
        _ = 0,
        S = 0,
        m = 0,
        h = 0,
        p = 0,
        b = 0,
        k = 0,
        F = 0,
        w = 0,
        y = 0,
        v = 0,
        M = 0,
        O = 0,
        A = 0,
        R = 0,
        g = 0,
        T = 0,
        N = 0,
        D = 0,
        P = 0,
        C = 0,
        I = 0,
        L = 0,
        x = 0,
        B = 0,
        H = 0,
        U = 0,
        z = 0,
        Y = 0,
        V = 0,
        K = 0,
        W = 0,
        j = 0,
        X = 0,
        G = 0,
        q = 0,
        Q = 0,
        Z = 0,
        J = 0,
        $ = 0,
        ee = 0,
        re = 0,
        te = 0,
        ne = 0,
        ie = 0,
        oe = 0,
        ae = 0,
        ue = 0,
        se = 0,
        fe = 0,
        le = 0,
        ce = 0,
        de = 0,
        Ee = 0,
        _e = 0,
        Se = 0,
        me = 0,
        he = 0,
        pe = 0,
        be = 0,
        ke = 0,
        Fe = 0,
        we = 0,
        ye = 0,
        ve = pt
      ;(0 | bt) <= (0 | (pt = (pt + 16) | 0)) && yt(16), (t = ve)
      do {
        if (e >>> 0 < 245) {
          if (((i = (n = e >>> 0 < 11 ? 16 : (e + 11) & -8) >>> 3), (3 & (a = (o = 0 | St[2774]) >>> i)) | 0)) {
            ;(l = 0 | St[(f = ((s = (11136 + (((u = (((1 & a) ^ 1) + i) | 0) << 1) << 2)) | 0) + 8) | 0) >> 2]),
              (d = 0 | St[(c = (l + 8) | 0) >> 2])
            do {
              if ((0 | s) != (0 | d)) {
                if ((d >>> 0 < (0 | St[2778]) >>> 0 && Me(), (0 | St[(E = (d + 12) | 0) >> 2]) == (0 | l))) {
                  ;(St[E >> 2] = s), (St[f >> 2] = d)
                  break
                }
                Me()
              } else St[2774] = o & ~(1 << u)
            } while (0)
            return (
              (d = u << 3),
              (St[(l + 4) >> 2] = 3 | d),
              (St[(f = (l + d + 4) | 0) >> 2] = 1 | St[f >> 2]),
              (pt = ve),
              0 | (_ = c)
            )
          }
          if ((f = 0 | St[2776]) >>> 0 < n >>> 0) {
            if (0 | a) {
              ;(S =
                0 |
                St[
                  (h =
                    ((m =
                      (11136 +
                        (((p =
                          (((d =
                            ((E =
                              (d = (((s = (a << i) & ((d = 2 << i) | (0 - d))) & (0 - s)) - 1) | 0) >>>
                              (s = (d >>> 12) & 16)) >>>
                              5) &
                            8) |
                            s |
                            (E = ((S = E >>> d) >>> 2) & 4) |
                            (S = ((m = S >>> E) >>> 1) & 2) |
                            (m = ((h = m >>> S) >>> 1) & 1)) +
                            (h >>> m)) |
                          0) <<
                          1) <<
                          2)) |
                      0) +
                      8) |
                    0) >> 2
                ]),
                (s = 0 | St[(E = (S + 8) | 0) >> 2])
              do {
                if ((0 | m) != (0 | s)) {
                  if ((s >>> 0 < (0 | St[2778]) >>> 0 && Me(), (0 | St[(d = (s + 12) | 0) >> 2]) == (0 | S))) {
                    ;(St[d >> 2] = m), (St[h >> 2] = s), (b = o)
                    break
                  }
                  Me()
                } else (d = o & ~(1 << p)), (b = St[2774] = d)
              } while (0)
              return (
                (s = ((p << 3) - n) | 0),
                (St[(S + 4) >> 2] = 3 | n),
                (St[((h = (S + n) | 0) + 4) >> 2] = 1 | s),
                (St[(h + s) >> 2] = s),
                0 | f &&
                  ((m = 0 | St[2779]),
                  (a = (11136 + (((i = f >>> 3) << 1) << 2)) | 0),
                  b & (c = 1 << i)
                    ? (l = 0 | St[(i = (a + 8) | 0) >> 2]) >>> 0 < (0 | St[2778]) >>> 0
                      ? Me()
                      : ((k = l), (F = i))
                    : ((St[2774] = b | c), (F = ((k = a) + 8) | 0)),
                  (St[F >> 2] = m),
                  (St[(k + 12) >> 2] = m),
                  (St[(m + 8) >> 2] = k),
                  (St[(m + 12) >> 2] = a)),
                (St[2776] = s),
                (St[2779] = h),
                (pt = ve),
                0 | (_ = E)
              )
            }
            if ((h = 0 | St[2775])) {
              for (
                u =
                  0 |
                  St[
                    (11400 +
                      ((((s = ((m = (s = ((h & (0 - h)) - 1) | 0) >>> (a = (s >>> 12) & 16)) >>> 5) & 8) |
                        a |
                        (m = ((c = m >>> s) >>> 2) & 4) |
                        (c = ((i = c >>> m) >>> 1) & 2) |
                        (i = ((l = i >>> c) >>> 1) & 1)) +
                        (l >>> i)) <<
                        2)) >>
                      2
                  ],
                  c = ((-8 & St[((l = i = u) + 4) >> 2]) - n) | 0;
                ;

              ) {
                if ((u = 0 | St[(i + 16) >> 2])) w = u
                else {
                  if (!(m = 0 | St[(i + 20) >> 2])) break
                  w = m
                }
                ;(l = (m = (u = ((-8 & St[((i = w) + 4) >> 2]) - n) | 0) >>> 0 < c >>> 0) ? w : l), (c = m ? u : c)
              }
              l >>> 0 < (i = 0 | St[2778]) >>> 0 && Me(),
                (E = (l + n) | 0) >>> 0 <= l >>> 0 && Me(),
                (S = 0 | St[(l + 24) >> 2]),
                (p = 0 | St[(l + 12) >> 2])
              do {
                if ((0 | p) == (0 | l)) {
                  if ((m = 0 | St[(u = (l + 20) | 0) >> 2])) (v = m), (M = u)
                  else {
                    if (!(s = 0 | St[(a = (l + 16) | 0) >> 2])) {
                      y = 0
                      break
                    }
                    ;(v = s), (M = a)
                  }
                  for (;;)
                    if (0 | (m = 0 | St[(u = (v + 20) | 0) >> 2])) (v = m), (M = u)
                    else {
                      if (!(m = 0 | St[(u = (v + 16) | 0) >> 2])) break
                      ;(v = m), (M = u)
                    }
                  if (!(M >>> 0 < i >>> 0)) {
                    ;(St[M >> 2] = 0), (y = v)
                    break
                  }
                  Me()
                } else {
                  if (
                    ((u = 0 | St[(l + 8) >> 2]) >>> 0 < i >>> 0 && Me(),
                    (0 | St[(m = (u + 12) | 0) >> 2]) != (0 | l) && Me(),
                    (0 | St[(a = (p + 8) | 0) >> 2]) == (0 | l))
                  ) {
                    ;(St[m >> 2] = p), (St[a >> 2] = u), (y = p)
                    break
                  }
                  Me()
                }
              } while (0)
              do {
                if (0 | S) {
                  if (((p = 0 | St[(l + 28) >> 2]), (0 | l) == (0 | St[(i = (11400 + (p << 2)) | 0) >> 2]))) {
                    if (!(St[i >> 2] = y)) {
                      St[2775] = h & ~(1 << p)
                      break
                    }
                  } else if (
                    (S >>> 0 < (0 | St[2778]) >>> 0 && Me(),
                    (0 | St[(p = (S + 16) | 0) >> 2]) == (0 | l) ? (St[p >> 2] = y) : (St[(S + 20) >> 2] = y),
                    !y)
                  )
                    break
                  y >>> 0 < (p = 0 | St[2778]) >>> 0 && Me(), (St[(y + 24) >> 2] = S), (i = 0 | St[(l + 16) >> 2])
                  do {
                    if (0 | i) {
                      if (!(i >>> 0 < p >>> 0)) {
                        ;(St[(y + 16) >> 2] = i), (St[(i + 24) >> 2] = y)
                        break
                      }
                      Me()
                    }
                  } while (0)
                  if (0 | (i = 0 | St[(l + 20) >> 2])) {
                    if (!(i >>> 0 < (0 | St[2778]) >>> 0)) {
                      ;(St[(y + 20) >> 2] = i), (St[(i + 24) >> 2] = y)
                      break
                    }
                    Me()
                  }
                }
              } while (0)
              return (
                c >>> 0 < 16
                  ? ((S = (c + n) | 0), (St[(l + 4) >> 2] = 3 | S), (St[(h = (l + S + 4) | 0) >> 2] = 1 | St[h >> 2]))
                  : ((St[(l + 4) >> 2] = 3 | n),
                    (St[(E + 4) >> 2] = 1 | c),
                    (St[(E + c) >> 2] = c),
                    0 | f &&
                      ((h = 0 | St[2779]),
                      (i = (11136 + (((S = f >>> 3) << 1) << 2)) | 0),
                      o & (p = 1 << S)
                        ? (u = 0 | St[(S = (i + 8) | 0) >> 2]) >>> 0 < (0 | St[2778]) >>> 0
                          ? Me()
                          : ((O = u), (A = S))
                        : ((St[2774] = o | p), (A = ((O = i) + 8) | 0)),
                      (St[A >> 2] = h),
                      (St[(O + 12) >> 2] = h),
                      (St[(h + 8) >> 2] = O),
                      (St[(h + 12) >> 2] = i)),
                    (St[2776] = c),
                    (St[2779] = E)),
                (pt = ve),
                0 | (_ = (l + 8) | 0)
              )
            }
            R = n
          } else R = n
        } else if (e >>> 0 <= 4294967231)
          if (((h = -8 & (i = (e + 11) | 0)), (p = 0 | St[2775]))) {
            ;(S = (0 - h) | 0),
              (g = (u = i >>> 8)
                ? 16777215 < h >>> 0
                  ? 31
                  : ((h >>>
                      (((s =
                        (14 -
                          ((u = ((((a = u << (i = (((u + 1048320) | 0) >>> 16) & 8)) + 520192) | 0) >>> 16) & 4) |
                            i |
                            (a = ((((m = a << u) + 245760) | 0) >>> 16) & 2)) +
                          ((m << a) >>> 15)) |
                        0) +
                        7) |
                        0)) &
                      1) |
                    (s << 1)
                : 0),
              (s = 0 | St[(11400 + (g << 2)) >> 2])
            e: do {
              if (s)
                for (m = S, i = s, u = h << (31 == ((a = 0) | g) ? 0 : (25 - (g >>> 1)) | 0), d = 0; ; ) {
                  if ((C = ((-8 & St[(i + 4) >> 2]) - h) | 0) >>> 0 < m >>> 0) {
                    if (!C) {
                      ;(L = 0), (x = I = i), (P = 90)
                      break e
                    }
                    ;(B = i), (H = C)
                  } else (B = a), (H = m)
                  if (
                    ((r =
                      (0 == (0 | (C = 0 | St[(i + 20) >> 2]))) |
                      ((0 | C) == (0 | (i = 0 | St[(i + 16 + ((u >>> 31) << 2)) >> 2])))
                        ? d
                        : C),
                    (C = 0 == (0 | i)))
                  ) {
                    ;(T = r), (N = B), (D = H), (P = 86)
                    break
                  }
                  ;(a = B), (m = H), (u <<= (1 & C) ^ 1), (d = r)
                }
              else (N = T = 0), (D = S), (P = 86)
            } while (0)
            if (86 == (0 | P)) {
              if ((0 == (0 | T)) & (0 == (0 | N))) {
                if (!(S = p & ((s = 2 << g) | (0 - s)))) {
                  R = h
                  break
                }
                U =
                  0 |
                  St[
                    (11400 +
                      ((((s = ((n = (s = ((S & (0 - S)) - 1) | 0) >>> (S = (s >>> 12) & 16)) >>> 5) & 8) |
                        S |
                        (n = ((l = n >>> s) >>> 2) & 4) |
                        (l = ((E = l >>> n) >>> 1) & 2) |
                        (E = ((c = E >>> l) >>> 1) & 1)) +
                        (c >>> E)) <<
                        2)) >>
                      2
                  ]
              } else U = T
              U ? ((I = N), (L = D), (x = U), (P = 90)) : ((z = N), (Y = D))
            }
            if (90 == (0 | P))
              for (;;)
                if (
                  ((P = 0),
                  (l = (c = (E = ((-8 & St[(x + 4) >> 2]) - h) | 0) >>> 0 < L >>> 0) ? E : L),
                  (E = c ? x : I),
                  0 | (c = 0 | St[(x + 16) >> 2]))
                )
                  (I = E), (L = l), (x = c), (P = 90)
                else {
                  if (!(x = 0 | St[(x + 20) >> 2])) {
                    ;(z = E), (Y = l)
                    break
                  }
                  ;(I = E), (L = l), (P = 90)
                }
            if (0 != (0 | z) && Y >>> 0 < (((0 | St[2776]) - h) | 0) >>> 0) {
              z >>> 0 < (l = 0 | St[2778]) >>> 0 && Me(),
                (E = (z + h) | 0) >>> 0 <= z >>> 0 && Me(),
                (c = 0 | St[(z + 24) >> 2]),
                (n = 0 | St[(z + 12) >> 2])
              do {
                if ((0 | n) == (0 | z)) {
                  if ((s = 0 | St[(S = (z + 20) | 0) >> 2])) (K = s), (W = S)
                  else {
                    if (!(f = 0 | St[(o = (z + 16) | 0) >> 2])) {
                      V = 0
                      break
                    }
                    ;(K = f), (W = o)
                  }
                  for (;;)
                    if (0 | (s = 0 | St[(S = (K + 20) | 0) >> 2])) (K = s), (W = S)
                    else {
                      if (!(s = 0 | St[(S = (K + 16) | 0) >> 2])) break
                      ;(K = s), (W = S)
                    }
                  if (!(W >>> 0 < l >>> 0)) {
                    ;(St[W >> 2] = 0), (V = K)
                    break
                  }
                  Me()
                } else {
                  if (
                    ((S = 0 | St[(z + 8) >> 2]) >>> 0 < l >>> 0 && Me(),
                    (0 | St[(s = (S + 12) | 0) >> 2]) != (0 | z) && Me(),
                    (0 | St[(o = (n + 8) | 0) >> 2]) == (0 | z))
                  ) {
                    ;(St[s >> 2] = n), (St[o >> 2] = S), (V = n)
                    break
                  }
                  Me()
                }
              } while (0)
              do {
                if (c) {
                  if (((n = 0 | St[(z + 28) >> 2]), (0 | z) == (0 | St[(l = (11400 + (n << 2)) | 0) >> 2]))) {
                    if (!(St[l >> 2] = V)) {
                      ;(l = p & ~(1 << n)), (j = St[2775] = l)
                      break
                    }
                  } else if (
                    (c >>> 0 < (0 | St[2778]) >>> 0 && Me(),
                    (0 | St[(l = (c + 16) | 0) >> 2]) == (0 | z) ? (St[l >> 2] = V) : (St[(c + 20) >> 2] = V),
                    !V)
                  ) {
                    j = p
                    break
                  }
                  V >>> 0 < (l = 0 | St[2778]) >>> 0 && Me(), (St[(V + 24) >> 2] = c), (n = 0 | St[(z + 16) >> 2])
                  do {
                    if (0 | n) {
                      if (!(n >>> 0 < l >>> 0)) {
                        ;(St[(V + 16) >> 2] = n), (St[(n + 24) >> 2] = V)
                        break
                      }
                      Me()
                    }
                  } while (0)
                  if ((n = 0 | St[(z + 20) >> 2])) {
                    if (!(n >>> 0 < (0 | St[2778]) >>> 0)) {
                      ;(St[(V + 20) >> 2] = n), (St[(n + 24) >> 2] = V), (j = p)
                      break
                    }
                    Me()
                  } else j = p
                } else j = p
              } while (0)
              do {
                if (16 <= Y >>> 0) {
                  if (
                    ((St[(z + 4) >> 2] = 3 | h),
                    (St[(E + 4) >> 2] = 1 | Y),
                    (p = (St[(E + Y) >> 2] = Y) >>> 3),
                    Y >>> 0 < 256)
                  ) {
                    ;(c = (11136 + ((p << 1) << 2)) | 0),
                      (n = 0 | St[2774]) & (l = 1 << p)
                        ? (S = 0 | St[(p = (c + 8) | 0) >> 2]) >>> 0 < (0 | St[2778]) >>> 0
                          ? Me()
                          : ((X = S), (G = p))
                        : ((St[2774] = n | l), (G = ((X = c) + 8) | 0)),
                      (St[G >> 2] = E),
                      (St[(X + 12) >> 2] = E),
                      (St[(E + 8) >> 2] = X),
                      (St[(E + 12) >> 2] = c)
                    break
                  }
                  if (
                    ((S =
                      (11400 +
                        ((q = (c = Y >>> 8)
                          ? 16777215 < Y >>> 0
                            ? 31
                            : ((Y >>>
                                (((S =
                                  (14 -
                                    ((c =
                                      ((((n = c << (l = (((c + 1048320) | 0) >>> 16) & 8)) + 520192) | 0) >>> 16) & 4) |
                                      l |
                                      (n = ((((p = n << c) + 245760) | 0) >>> 16) & 2)) +
                                    ((p << n) >>> 15)) |
                                  0) +
                                  7) |
                                  0)) &
                                1) |
                              (S << 1)
                          : 0) <<
                          2)) |
                      0),
                    (St[(E + 28) >> 2] = q),
                    (St[((n = (E + 16) | 0) + 4) >> 2] = 0),
                    (St[n >> 2] = 0),
                    !(j & (n = 1 << q)))
                  ) {
                    ;(St[2775] = j | n),
                      (St[S >> 2] = E),
                      (St[(E + 24) >> 2] = S),
                      (St[(E + 12) >> 2] = E),
                      (St[(E + 8) >> 2] = E)
                    break
                  }
                  for (n = Y << (31 == (0 | q) ? 0 : (25 - (q >>> 1)) | 0), p = 0 | St[S >> 2]; ; ) {
                    if (((-8 & St[(p + 4) >> 2]) | 0) == (0 | Y)) {
                      P = 148
                      break
                    }
                    if (!(S = 0 | St[(Q = (p + 16 + ((n >>> 31) << 2)) | 0) >> 2])) {
                      P = 145
                      break
                    }
                    ;(n <<= 1), (p = S)
                  }
                  if (145 == (0 | P)) {
                    if (!(Q >>> 0 < (0 | St[2778]) >>> 0)) {
                      ;(St[Q >> 2] = E), (St[(E + 24) >> 2] = p), (St[(E + 12) >> 2] = E), (St[(E + 8) >> 2] = E)
                      break
                    }
                    Me()
                  } else if (148 == (0 | P)) {
                    if (
                      ((S = 0 | St[(n = (p + 8) | 0) >> 2]),
                      ((l = 0 | St[2778]) >>> 0 <= S >>> 0) & (l >>> 0 <= p >>> 0))
                    ) {
                      ;(St[(S + 12) >> 2] = E),
                        (St[n >> 2] = E),
                        (St[(E + 8) >> 2] = S),
                        (St[(E + 12) >> 2] = p),
                        (St[(E + 24) >> 2] = 0)
                      break
                    }
                    Me()
                  }
                } else (S = (Y + h) | 0), (St[(z + 4) >> 2] = 3 | S), (St[(n = (z + S + 4) | 0) >> 2] = 1 | St[n >> 2])
              } while (0)
              return (pt = ve), 0 | (_ = (z + 8) | 0)
            }
            R = h
          } else R = h
        else R = -1
      } while (0)
      if (R >>> 0 <= (z = 0 | St[2776]) >>> 0)
        return (
          (Y = (z - R) | 0),
          (Q = 0 | St[2779]),
          15 < Y >>> 0
            ? ((q = (Q + R) | 0),
              (St[2779] = q),
              (St[2776] = Y),
              (St[(q + 4) >> 2] = 1 | Y),
              (St[(q + Y) >> 2] = Y),
              (St[(Q + 4) >> 2] = 3 | R))
            : ((St[2776] = 0),
              (St[2779] = 0),
              (St[(Q + 4) >> 2] = 3 | z),
              (St[(Y = (Q + z + 4) | 0) >> 2] = 1 | St[Y >> 2])),
          (pt = ve),
          0 | (_ = (Q + 8) | 0)
        )
      if (R >>> 0 < (Q = 0 | St[2777]) >>> 0)
        return (
          (Y = (Q - R) | 0),
          (St[2777] = Y),
          (q = ((z = 0 | St[2780]) + R) | 0),
          (St[2780] = q),
          (St[(q + 4) >> 2] = 1 | Y),
          (St[(z + 4) >> 2] = 3 | R),
          (pt = ve),
          0 | (_ = (z + 8) | 0)
        )
      if (
        ((Z =
          0 | St[2892]
            ? 0 | St[2894]
            : ((St[2894] = 4096),
              (St[2893] = 4096),
              (St[2895] = -1),
              (St[2896] = -1),
              (St[2897] = 0),
              (St[2885] = 0),
              (z = (-16 & t) ^ 1431655768),
              (St[t >> 2] = z),
              (St[2892] = z),
              4096)),
        (z = (R + 48) | 0),
        (Z = (Y = (Z + (t = (R + 47) | 0)) | 0) & (q = (0 - Z) | 0)) >>> 0 <= R >>> 0)
      )
        return (pt = ve), (_ = 0) | _
      if (0 | (j = 0 | St[2884]) && ((G = ((X = 0 | St[2882]) + Z) | 0) >>> 0 <= X >>> 0) | (j >>> 0 < G >>> 0))
        return (pt = ve), (_ = 0) | _
      e: do {
        if (4 & St[2885]) P = 187
        else {
          j = 0 | St[2780]
          r: do {
            if (j) {
              for (
                G = 11544;
                !(
                  (X = 0 | St[G >> 2]) >>> 0 <= j >>> 0 && ((X + (0 | St[(J = (G + 4) | 0) >> 2])) | 0) >>> 0 > j >>> 0
                );

              ) {
                if (!(X = 0 | St[(G + 8) >> 2])) {
                  P = 172
                  break r
                }
                G = X
              }
              if ((p = (Y - Q) & q) >>> 0 < 2147483647)
                if ((0 | (X = 0 | Ze(0 | p))) == (((0 | St[G >> 2]) + (0 | St[J >> 2])) | 0)) {
                  if (-1 != (0 | X)) {
                    ;($ = p), (ee = X), (P = 190)
                    break e
                  }
                } else (re = X), (te = p), (P = 180)
            } else P = 172
          } while (0)
          do {
            if (
              172 == (0 | P) &&
              -1 != (0 | (j = 0 | Ze(0))) &&
              ((h = j),
              (p =
                ((V =
                  ((0 == (((X = ((p = 0 | St[2893]) + -1) | 0) & h) | 0) ? 0 : (((X + h) & (0 - p)) - h) | 0) + Z) |
                  0) +
                  (h = 0 | St[2882])) |
                0),
              (R >>> 0 < V >>> 0) & (V >>> 0 < 2147483647))
            ) {
              if (0 | (X = 0 | St[2884]) && (p >>> 0 <= h >>> 0) | (X >>> 0 < p >>> 0)) break
              if ((0 | (X = 0 | Ze(0 | V))) == (0 | j)) {
                ;($ = V), (ee = j), (P = 190)
                break e
              }
              ;(re = X), (te = V), (P = 180)
            }
          } while (0)
          r: do {
            if (180 == (0 | P)) {
              V = (0 - te) | 0
              do {
                if (
                  (te >>> 0 < z >>> 0) & (te >>> 0 < 2147483647) & (-1 != (0 | re)) &&
                  (j = (t - te + (X = 0 | St[2894])) & (0 - X)) >>> 0 < 2147483647
                ) {
                  if (-1 == (0 | Ze(0 | j))) {
                    Ze(0 | V)
                    break r
                  }
                  ne = (j + te) | 0
                  break
                }
              } while (((ne = te), 0))
              if (-1 != (0 | re)) {
                ;($ = ne), (ee = re), (P = 190)
                break e
              }
            }
          } while (0)
          ;(St[2885] = 4 | St[2885]), (P = 187)
        }
      } while (0)
      if (
        (187 == (0 | P) &&
          Z >>> 0 < 2147483647 &&
          ((re = 0 | Ze(0 | Z)) >>> 0 < (Z = 0 | Ze(0)) >>> 0) & (-1 != (0 | re)) & (-1 != (0 | Z)) &&
          ((R + 40) | 0) >>> 0 < (ne = (Z - re) | 0) >>> 0 &&
          (($ = ne), (ee = re), (P = 190)),
        190 == (0 | P))
      ) {
        ;(re = ((0 | St[2882]) + $) | 0),
          (St[2882] = re) >>> 0 > (0 | St[2883]) >>> 0 && (St[2883] = re),
          (re = 0 | St[2780])
        do {
          if (re) {
            for (ne = 11544; ; ) {
              if ((0 | ee) == (((ie = 0 | St[ne >> 2]) + (ae = 0 | St[(oe = (ne + 4) | 0) >> 2])) | 0)) {
                P = 200
                break
              }
              if (!(Z = 0 | St[(ne + 8) >> 2])) break
              ne = Z
            }
            if (
              200 == (0 | P) &&
              0 == ((8 & St[(ne + 12) >> 2]) | 0) &&
              (re >>> 0 < ee >>> 0) & (ie >>> 0 <= re >>> 0)
            ) {
              ;(St[oe >> 2] = ae + $),
                (Z = (re + (te = 0 == ((7 & (Z = (re + 8) | 0)) | 0) ? 0 : (0 - Z) & 7)) | 0),
                (t = ($ - te + (0 | St[2777])) | 0),
                (St[2780] = Z),
                (St[2777] = t),
                (St[(Z + 4) >> 2] = 1 | t),
                (St[(Z + t + 4) >> 2] = 40),
                (St[2781] = St[2896])
              break
            }
            for (ue = ee >>> 0 < (t = 0 | St[2778]) >>> 0 ? (St[2778] = ee) : t, t = (ee + $) | 0, Z = 11544; ; ) {
              if ((0 | St[Z >> 2]) == (0 | t)) {
                P = 208
                break
              }
              if (!(te = 0 | St[(Z + 8) >> 2])) {
                se = 11544
                break
              }
              Z = te
            }
            if (208 == (0 | P)) {
              if (!(8 & St[(Z + 12) >> 2])) {
                ;(St[Z >> 2] = ee),
                  (St[(ne = (Z + 4) | 0) >> 2] = (0 | St[ne >> 2]) + $),
                  (te = (ee + (0 == ((7 & (ne = (ee + 8) | 0)) | 0) ? 0 : (0 - ne) & 7)) | 0),
                  (z = (t + (0 == ((7 & (ne = (t + 8) | 0)) | 0) ? 0 : (0 - ne) & 7)) | 0),
                  (ne = (te + R) | 0),
                  (J = (z - te - R) | 0),
                  (St[(te + 4) >> 2] = 3 | R)
                do {
                  if ((0 | z) != (0 | re)) {
                    if ((0 | z) == (0 | St[2779])) {
                      ;(q = ((0 | St[2776]) + J) | 0),
                        (St[2776] = q),
                        (St[2779] = ne),
                        (St[(ne + 4) >> 2] = 1 | q),
                        (St[(ne + q) >> 2] = q)
                      break
                    }
                    if (1 == ((3 & (q = 0 | St[(z + 4) >> 2])) | 0)) {
                      ;(Q = -8 & q), (Y = q >>> 3)
                      e: do {
                        if (256 <= q >>> 0) {
                          ;(V = 0 | St[(z + 24) >> 2]), (G = 0 | St[(z + 12) >> 2])
                          do {
                            if ((0 | G) == (0 | z)) {
                              if ((p = 0 | St[(X = ((j = (z + 16) | 0) + 4) | 0) >> 2])) (le = p), (ce = X)
                              else {
                                if (!(h = 0 | St[j >> 2])) {
                                  fe = 0
                                  break
                                }
                                ;(le = h), (ce = j)
                              }
                              for (;;)
                                if (0 | (p = 0 | St[(X = (le + 20) | 0) >> 2])) (le = p), (ce = X)
                                else {
                                  if (!(p = 0 | St[(X = (le + 16) | 0) >> 2])) break
                                  ;(le = p), (ce = X)
                                }
                              if (!(ce >>> 0 < ue >>> 0)) {
                                ;(St[ce >> 2] = 0), (fe = le)
                                break
                              }
                              Me()
                            } else {
                              if (
                                ((X = 0 | St[(z + 8) >> 2]) >>> 0 < ue >>> 0 && Me(),
                                (0 | St[(p = (X + 12) | 0) >> 2]) != (0 | z) && Me(),
                                (0 | St[(j = (G + 8) | 0) >> 2]) == (0 | z))
                              ) {
                                ;(St[p >> 2] = G), (St[j >> 2] = X), (fe = G)
                                break
                              }
                              Me()
                            }
                          } while (0)
                          if (!V) break
                          X = (11400 + ((G = 0 | St[(z + 28) >> 2]) << 2)) | 0
                          do {
                            if ((0 | z) == (0 | St[X >> 2])) {
                              if (0 | (St[X >> 2] = fe)) break
                              St[2775] = St[2775] & ~(1 << G)
                              break e
                            }
                            if (
                              (V >>> 0 < (0 | St[2778]) >>> 0 && Me(),
                              (0 | St[(j = (V + 16) | 0) >> 2]) == (0 | z)
                                ? (St[j >> 2] = fe)
                                : (St[(V + 20) >> 2] = fe),
                              !fe)
                            )
                              break e
                          } while (0)
                          fe >>> 0 < (G = 0 | St[2778]) >>> 0 && Me(),
                            (St[(fe + 24) >> 2] = V),
                            (j = 0 | St[(X = (z + 16) | 0) >> 2])
                          do {
                            if (0 | j) {
                              if (!(j >>> 0 < G >>> 0)) {
                                ;(St[(fe + 16) >> 2] = j), (St[(j + 24) >> 2] = fe)
                                break
                              }
                              Me()
                            }
                          } while (0)
                          if (!(j = 0 | St[(X + 4) >> 2])) break
                          if (!(j >>> 0 < (0 | St[2778]) >>> 0)) {
                            ;(St[(fe + 20) >> 2] = j), (St[(j + 24) >> 2] = fe)
                            break
                          }
                          Me()
                        } else {
                          ;(j = 0 | St[(z + 8) >> 2]), (G = 0 | St[(z + 12) >> 2]), (V = (11136 + ((Y << 1) << 2)) | 0)
                          do {
                            if ((0 | j) != (0 | V)) {
                              if ((j >>> 0 < ue >>> 0 && Me(), (0 | St[(j + 12) >> 2]) == (0 | z))) break
                              Me()
                            }
                          } while (0)
                          if ((0 | G) == (0 | j)) {
                            St[2774] = St[2774] & ~(1 << Y)
                            break
                          }
                          do {
                            if ((0 | G) == (0 | V)) de = (G + 8) | 0
                            else {
                              if ((G >>> 0 < ue >>> 0 && Me(), (0 | St[(X = (G + 8) | 0) >> 2]) == (0 | z))) {
                                de = X
                                break
                              }
                              Me()
                            }
                          } while (0)
                          ;(St[(j + 12) >> 2] = G), (St[de >> 2] = j)
                        }
                      } while (0)
                      ;(Ee = (z + Q) | 0), (_e = (Q + J) | 0)
                    } else (Ee = z), (_e = J)
                    if (
                      ((St[(Y = (Ee + 4) | 0) >> 2] = -2 & St[Y >> 2]),
                      (St[(ne + 4) >> 2] = 1 | _e),
                      (Y = (St[(ne + _e) >> 2] = _e) >>> 3),
                      _e >>> 0 < 256)
                    ) {
                      ;(q = (11136 + ((Y << 1) << 2)) | 0), (V = 0 | St[2774]), (X = 1 << Y)
                      do {
                        if (V & X) {
                          if ((p = 0 | St[(Y = (q + 8) | 0) >> 2]) >>> 0 >= (0 | St[2778]) >>> 0) {
                            ;(Se = p), (me = Y)
                            break
                          }
                          Me()
                        } else (St[2774] = V | X), (me = ((Se = q) + 8) | 0)
                      } while (0)
                      ;(St[me >> 2] = ne), (St[(Se + 12) >> 2] = ne), (St[(ne + 8) >> 2] = Se), (St[(ne + 12) >> 2] = q)
                      break
                    }
                    X = _e >>> 8
                    do {
                      if (X) {
                        if (16777215 < _e >>> 0) {
                          he = 31
                          break
                        }
                        he =
                          ((_e >>>
                            (((h =
                              (14 -
                                ((Y = ((((Q = X << (V = (((X + 1048320) | 0) >>> 16) & 8)) + 520192) | 0) >>> 16) & 4) |
                                  V |
                                  (Q = ((((p = Q << Y) + 245760) | 0) >>> 16) & 2)) +
                                ((p << Q) >>> 15)) |
                              0) +
                              7) |
                              0)) &
                            1) |
                          (h << 1)
                      } else he = 0
                    } while (0)
                    if (
                      ((X = (11400 + (he << 2)) | 0),
                      (St[(ne + 28) >> 2] = he),
                      (St[((q = (ne + 16) | 0) + 4) >> 2] = 0),
                      !((q = (St[q >> 2] = 0) | St[2775]) & (h = 1 << he)))
                    ) {
                      ;(St[2775] = q | h),
                        (St[X >> 2] = ne),
                        (St[(ne + 24) >> 2] = X),
                        (St[(ne + 12) >> 2] = ne),
                        (St[(ne + 8) >> 2] = ne)
                      break
                    }
                    for (h = _e << (31 == (0 | he) ? 0 : (25 - (he >>> 1)) | 0), q = 0 | St[X >> 2]; ; ) {
                      if (((-8 & St[(q + 4) >> 2]) | 0) == (0 | _e)) {
                        P = 278
                        break
                      }
                      if (!(X = 0 | St[(pe = (q + 16 + ((h >>> 31) << 2)) | 0) >> 2])) {
                        P = 275
                        break
                      }
                      ;(h <<= 1), (q = X)
                    }
                    if (275 == (0 | P)) {
                      if (!(pe >>> 0 < (0 | St[2778]) >>> 0)) {
                        ;(St[pe >> 2] = ne),
                          (St[(ne + 24) >> 2] = q),
                          (St[(ne + 12) >> 2] = ne),
                          (St[(ne + 8) >> 2] = ne)
                        break
                      }
                      Me()
                    } else if (278 == (0 | P)) {
                      if (
                        ((X = 0 | St[(h = (q + 8) | 0) >> 2]),
                        ((Q = 0 | St[2778]) >>> 0 <= X >>> 0) & (Q >>> 0 <= q >>> 0))
                      ) {
                        ;(St[(X + 12) >> 2] = ne),
                          (St[h >> 2] = ne),
                          (St[(ne + 8) >> 2] = X),
                          (St[(ne + 12) >> 2] = q),
                          (St[(ne + 24) >> 2] = 0)
                        break
                      }
                      Me()
                    }
                  } else (X = ((0 | St[2777]) + J) | 0), (St[2777] = X), (St[2780] = ne), (St[(ne + 4) >> 2] = 1 | X)
                } while (0)
                return (pt = ve), 0 | (_ = (te + 8) | 0)
              }
              se = 11544
            }
            for (
              ;
              !((ne = 0 | St[se >> 2]) >>> 0 <= re >>> 0 && re >>> 0 < (be = (ne + (0 | St[(se + 4) >> 2])) | 0) >>> 0);

            )
              se = 0 | St[(se + 8) >> 2]
            for (
              te = (be + -47) | 0,
                ne = (te + 8) | 0,
                J = (te + (0 == ((7 & ne) | 0) ? 0 : (0 - ne) & 7)) | 0,
                ne = (re + 16) | 0,
                te = J >>> 0 < ne >>> 0 ? re : J,
                J = (te + 8) | 0,
                z = (ee + 8) | 0,
                t = 0 == ((7 & z) | 0) ? 0 : (0 - z) & 7,
                z = (ee + t) | 0,
                Z = ($ + -40 - t) | 0,
                St[2780] = z,
                St[2777] = Z,
                St[(z + 4) >> 2] = 1 | Z,
                St[(z + Z + 4) >> 2] = 40,
                St[2781] = St[2896],
                Z = (te + 4) | 0,
                St[Z >> 2] = 27,
                St[J >> 2] = St[2886],
                St[(J + 4) >> 2] = St[2887],
                St[(J + 8) >> 2] = St[2888],
                St[(J + 12) >> 2] = St[2889],
                St[2886] = ee,
                St[2887] = $,
                St[2889] = 0,
                St[2888] = J,
                J = (te + 24) | 0;
              (St[(J = (J + 4) | 0) >> 2] = 7), ((J + 4) | 0) >>> 0 < be >>> 0;

            );
            if ((0 | te) != (0 | re)) {
              if (
                ((J = (te - re) | 0),
                (St[Z >> 2] = -2 & St[Z >> 2]),
                (St[(re + 4) >> 2] = 1 | J),
                (z = (St[te >> 2] = J) >>> 3),
                J >>> 0 < 256)
              ) {
                ;(t = (11136 + ((z << 1) << 2)) | 0),
                  (X = 0 | St[2774]) & (h = 1 << z)
                    ? (Q = 0 | St[(z = (t + 8) | 0) >> 2]) >>> 0 < (0 | St[2778]) >>> 0
                      ? Me()
                      : ((ke = Q), (Fe = z))
                    : ((St[2774] = X | h), (Fe = ((ke = t) + 8) | 0)),
                  (St[Fe >> 2] = re),
                  (St[(ke + 12) >> 2] = re),
                  (St[(re + 8) >> 2] = ke),
                  (St[(re + 12) >> 2] = t)
                break
              }
              if (
                ((Q =
                  (11400 +
                    ((we = (t = J >>> 8)
                      ? 16777215 < J >>> 0
                        ? 31
                        : ((J >>>
                            (((Q =
                              (14 -
                                ((t = ((((X = t << (h = (((t + 1048320) | 0) >>> 16) & 8)) + 520192) | 0) >>> 16) & 4) |
                                  h |
                                  (X = ((((z = X << t) + 245760) | 0) >>> 16) & 2)) +
                                ((z << X) >>> 15)) |
                              0) +
                              7) |
                              0)) &
                            1) |
                          (Q << 1)
                      : 0) <<
                      2)) |
                  0),
                (St[(re + 28) >> 2] = we),
                (St[(re + 20) >> 2] = 0),
                !((X = (St[ne >> 2] = 0) | St[2775]) & (z = 1 << we)))
              ) {
                ;(St[2775] = X | z),
                  (St[Q >> 2] = re),
                  (St[(re + 24) >> 2] = Q),
                  (St[(re + 12) >> 2] = re),
                  (St[(re + 8) >> 2] = re)
                break
              }
              for (z = J << (31 == (0 | we) ? 0 : (25 - (we >>> 1)) | 0), X = 0 | St[Q >> 2]; ; ) {
                if (((-8 & St[(X + 4) >> 2]) | 0) == (0 | J)) {
                  P = 304
                  break
                }
                if (!(Q = 0 | St[(ye = (X + 16 + ((z >>> 31) << 2)) | 0) >> 2])) {
                  P = 301
                  break
                }
                ;(z <<= 1), (X = Q)
              }
              if (301 == (0 | P)) {
                if (!(ye >>> 0 < (0 | St[2778]) >>> 0)) {
                  ;(St[ye >> 2] = re), (St[(re + 24) >> 2] = X), (St[(re + 12) >> 2] = re), (St[(re + 8) >> 2] = re)
                  break
                }
                Me()
              } else if (304 == (0 | P)) {
                if (
                  ((J = 0 | St[(z = (X + 8) | 0) >> 2]), ((ne = 0 | St[2778]) >>> 0 <= J >>> 0) & (ne >>> 0 <= X >>> 0))
                ) {
                  ;(St[(J + 12) >> 2] = re),
                    (St[z >> 2] = re),
                    (St[(re + 8) >> 2] = J),
                    (St[(re + 12) >> 2] = X),
                    (St[(re + 24) >> 2] = 0)
                  break
                }
                Me()
              }
            }
          } else {
            for (
              J = 0 | St[2778],
                (0 == (0 | J)) | (ee >>> 0 < J >>> 0) && (St[2778] = ee),
                St[2886] = ee,
                St[2887] = $,
                St[2889] = 0,
                St[2783] = St[2892],
                St[2782] = -1,
                J = 0;
              (St[((z = (11136 + ((J << 1) << 2)) | 0) + 12) >> 2] = z),
                (St[(z + 8) >> 2] = z),
                (J = (J + 1) | 0),
                32 != (0 | J);

            );
            ;(J = (ee + (X = 0 == ((7 & (J = (ee + 8) | 0)) | 0) ? 0 : (0 - J) & 7)) | 0),
              (z = ($ + -40 - X) | 0),
              (St[2780] = J),
              (St[2777] = z),
              (St[(J + 4) >> 2] = 1 | z),
              (St[(J + z + 4) >> 2] = 40),
              (St[2781] = St[2896])
          }
        } while (0)
        if (R >>> 0 < ($ = 0 | St[2777]) >>> 0)
          return (
            (ee = ($ - R) | 0),
            (St[2777] = ee),
            (re = (($ = 0 | St[2780]) + R) | 0),
            (St[2780] = re),
            (St[(re + 4) >> 2] = 1 | ee),
            (St[($ + 4) >> 2] = 3 | R),
            (pt = ve),
            0 | (_ = ($ + 8) | 0)
          )
      }
      return ($ = 0 | vt()), (St[$ >> 2] = 12), (pt = ve), (_ = 0) | _
    }
    function Ge(e) {
      var r,
        t,
        n = 0,
        i = 0,
        o = 0,
        a = 0,
        u = 0,
        s = 0,
        f = 0,
        l = 0,
        c = 0,
        d = 0,
        E = 0,
        _ = 0,
        S = 0,
        m = 0,
        h = 0,
        p = 0,
        b = 0,
        k = 0,
        F = 0,
        w = 0,
        y = 0,
        v = 0,
        M = 0,
        O = 0,
        A = 0,
        R = 0,
        g = 0,
        T = 0
      if ((e |= 0)) {
        ;(n = (e + -8) | 0) >>> 0 < (i = 0 | St[2778]) >>> 0 && Me(),
          1 == (0 | (e = 3 & (o = 0 | St[(e + -4) >> 2]))) && Me(),
          (r = (n + (a = -8 & o)) | 0)
        do {
          if (1 & o) (d = n), (E = a)
          else {
            if (((u = 0 | St[n >> 2]), !e)) return
            if (((f = (u + a) | 0), (s = (n + (0 - u)) | 0) >>> 0 < i >>> 0 && Me(), (0 | s) == (0 | St[2779]))) {
              if (3 == ((3 & (c = 0 | St[(l = (4 + r) | 0) >> 2])) | 0))
                return (St[2776] = f), (St[l >> 2] = -2 & c), (St[(s + 4) >> 2] = 1 | f), void (St[(s + f) >> 2] = f)
              ;(d = s), (E = f)
              break
            }
            if (((c = u >>> 3), u >>> 0 < 256)) {
              if (
                ((u = 0 | St[(s + 8) >> 2]),
                (l = 0 | St[(s + 12) >> 2]),
                (0 | u) != (0 | (_ = (11136 + ((c << 1) << 2)) | 0)) &&
                  (u >>> 0 < i >>> 0 && Me(), (0 | St[(u + 12) >> 2]) != (0 | s) && Me()),
                (0 | l) == (0 | u))
              ) {
                ;(St[2774] = St[2774] & ~(1 << c)), (d = s), (E = f)
                break
              }
              ;(0 | l) != (0 | _)
                ? (l >>> 0 < i >>> 0 && Me(), (0 | St[(_ = (l + 8) | 0) >> 2]) == (0 | s) ? (S = _) : Me())
                : (S = (l + 8) | 0),
                (St[(u + 12) >> 2] = l),
                (St[S >> 2] = u),
                (d = s),
                (E = f)
              break
            }
            ;(u = 0 | St[(s + 24) >> 2]), (l = 0 | St[(s + 12) >> 2])
            do {
              if ((0 | l) == (0 | s)) {
                if ((m = 0 | St[(c = ((_ = (s + 16) | 0) + 4) | 0) >> 2])) (p = m), (b = c)
                else {
                  if (!(t = 0 | St[_ >> 2])) {
                    h = 0
                    break
                  }
                  ;(p = t), (b = _)
                }
                for (;;)
                  if (0 | (m = 0 | St[(c = (p + 20) | 0) >> 2])) (p = m), (b = c)
                  else {
                    if (!(m = 0 | St[(c = (p + 16) | 0) >> 2])) break
                    ;(p = m), (b = c)
                  }
                if (!(b >>> 0 < i >>> 0)) {
                  ;(St[b >> 2] = 0), (h = p)
                  break
                }
                Me()
              } else {
                if (
                  ((c = 0 | St[(s + 8) >> 2]) >>> 0 < i >>> 0 && Me(),
                  (0 | St[(m = (c + 12) | 0) >> 2]) != (0 | s) && Me(),
                  (0 | St[(_ = (l + 8) | 0) >> 2]) == (0 | s))
                ) {
                  ;(St[m >> 2] = l), (St[_ >> 2] = c), (h = l)
                  break
                }
                Me()
              }
            } while (0)
            if (u) {
              if (((l = 0 | St[(s + 28) >> 2]), (0 | s) == (0 | St[(c = (11400 + (l << 2)) | 0) >> 2]))) {
                if (!(St[c >> 2] = h)) {
                  ;(St[2775] = St[2775] & ~(1 << l)), (d = s), (E = f)
                  break
                }
              } else if (
                (u >>> 0 < (0 | St[2778]) >>> 0 && Me(),
                (0 | St[(l = (u + 16) | 0) >> 2]) == (0 | s) ? (St[l >> 2] = h) : (St[(u + 20) >> 2] = h),
                !h)
              ) {
                ;(d = s), (E = f)
                break
              }
              h >>> 0 < (l = 0 | St[2778]) >>> 0 && Me(), (St[(h + 24) >> 2] = u), (_ = 0 | St[(c = (s + 16) | 0) >> 2])
              do {
                if (0 | _) {
                  if (!(_ >>> 0 < l >>> 0)) {
                    ;(St[(h + 16) >> 2] = _), (St[(_ + 24) >> 2] = h)
                    break
                  }
                  Me()
                }
              } while (0)
              if ((_ = 0 | St[(c + 4) >> 2])) {
                if (!(_ >>> 0 < (0 | St[2778]) >>> 0)) {
                  ;(St[(h + 20) >> 2] = _), (St[(_ + 24) >> 2] = h), (d = s), (E = f)
                  break
                }
                Me()
              } else (d = s), (E = f)
            } else (d = s), (E = f)
          }
        } while (0)
        if ((r >>> 0 <= d >>> 0 && Me(), 1 & (n = 0 | St[(a = (4 + r) | 0) >> 2]) || Me(), 2 & n))
          (St[a >> 2] = -2 & n), (St[(d + 4) >> 2] = 1 | E), (v = St[(d + E) >> 2] = E)
        else {
          if ((0 | r) == (0 | St[2780]))
            return (
              (h = ((0 | St[2777]) + E) | 0),
              (St[2777] = h),
              (St[2780] = d),
              (St[(d + 4) >> 2] = 1 | h),
              (0 | d) != (0 | St[2779]) ? void 0 : ((St[2779] = 0), void (St[2776] = 0))
            )
          if ((0 | r) == (0 | St[2779]))
            return (
              (h = ((0 | St[2776]) + E) | 0),
              (St[2776] = h),
              (St[2779] = d),
              (St[(d + 4) >> 2] = 1 | h),
              void (St[(d + h) >> 2] = h)
            )
          ;(h = ((-8 & n) + E) | 0), (i = n >>> 3)
          do {
            if (256 <= n >>> 0) {
              ;(p = 0 | St[(24 + r) >> 2]), (b = 0 | St[(12 + r) >> 2])
              do {
                if ((0 | b) == (0 | r)) {
                  if ((o = 0 | St[(e = ((S = (16 + r) | 0) + 4) | 0) >> 2])) (F = o), (w = e)
                  else {
                    if (!(_ = 0 | St[S >> 2])) {
                      k = 0
                      break
                    }
                    ;(F = _), (w = S)
                  }
                  for (;;)
                    if (0 | (o = 0 | St[(e = (F + 20) | 0) >> 2])) (F = o), (w = e)
                    else {
                      if (!(o = 0 | St[(e = (F + 16) | 0) >> 2])) break
                      ;(F = o), (w = e)
                    }
                  if (!(w >>> 0 < (0 | St[2778]) >>> 0)) {
                    ;(St[w >> 2] = 0), (k = F)
                    break
                  }
                  Me()
                } else {
                  if (
                    ((e = 0 | St[(8 + r) >> 2]) >>> 0 < (0 | St[2778]) >>> 0 && Me(),
                    (0 | St[(o = (e + 12) | 0) >> 2]) != (0 | r) && Me(),
                    (0 | St[(S = (b + 8) | 0) >> 2]) == (0 | r))
                  ) {
                    ;(St[o >> 2] = b), (St[S >> 2] = e), (k = b)
                    break
                  }
                  Me()
                }
              } while (0)
              if (0 | p) {
                if (((b = 0 | St[(28 + r) >> 2]), (0 | r) == (0 | St[(f = (11400 + (b << 2)) | 0) >> 2]))) {
                  if (!(St[f >> 2] = k)) {
                    St[2775] = St[2775] & ~(1 << b)
                    break
                  }
                } else if (
                  (p >>> 0 < (0 | St[2778]) >>> 0 && Me(),
                  (0 | St[(b = (p + 16) | 0) >> 2]) == (0 | r) ? (St[b >> 2] = k) : (St[(p + 20) >> 2] = k),
                  !k)
                )
                  break
                k >>> 0 < (b = 0 | St[2778]) >>> 0 && Me(),
                  (St[(k + 24) >> 2] = p),
                  (s = 0 | St[(f = (16 + r) | 0) >> 2])
                do {
                  if (0 | s) {
                    if (!(s >>> 0 < b >>> 0)) {
                      ;(St[(k + 16) >> 2] = s), (St[(s + 24) >> 2] = k)
                      break
                    }
                    Me()
                  }
                } while (0)
                if (0 | (s = 0 | St[(f + 4) >> 2])) {
                  if (!(s >>> 0 < (0 | St[2778]) >>> 0)) {
                    ;(St[(k + 20) >> 2] = s), (St[(s + 24) >> 2] = k)
                    break
                  }
                  Me()
                }
              }
            } else {
              if (
                ((s = 0 | St[(8 + r) >> 2]),
                (b = 0 | St[(12 + r) >> 2]),
                (0 | s) != (0 | (p = (11136 + ((i << 1) << 2)) | 0)) &&
                  (s >>> 0 < (0 | St[2778]) >>> 0 && Me(), (0 | St[(s + 12) >> 2]) != (0 | r) && Me()),
                (0 | b) == (0 | s))
              ) {
                St[2774] = St[2774] & ~(1 << i)
                break
              }
              ;(0 | b) != (0 | p)
                ? (b >>> 0 < (0 | St[2778]) >>> 0 && Me(), (0 | St[(p = (b + 8) | 0) >> 2]) == (0 | r) ? (y = p) : Me())
                : (y = (b + 8) | 0),
                (St[(s + 12) >> 2] = b),
                (St[y >> 2] = s)
            }
          } while (0)
          if (((St[(d + 4) >> 2] = 1 | h), (St[(d + h) >> 2] = h), (0 | d) == (0 | St[2779])))
            return void (St[2776] = h)
          v = h
        }
        if (((E = v >>> 3), v >>> 0 < 256))
          return (
            (n = (11136 + ((E << 1) << 2)) | 0),
            (a = 0 | St[2774]) & (h = 1 << E)
              ? (y = 0 | St[(E = (n + 8) | 0) >> 2]) >>> 0 < (0 | St[2778]) >>> 0
                ? Me()
                : ((M = y), (O = E))
              : ((St[2774] = a | h), (O = ((M = n) + 8) | 0)),
            (St[O >> 2] = d),
            (St[(M + 12) >> 2] = d),
            (St[(d + 8) >> 2] = M),
            void (St[(d + 12) >> 2] = n)
          )
        ;(a =
          (11400 +
            ((A = (n = v >>> 8)
              ? 16777215 < v >>> 0
                ? 31
                : ((v >>>
                    (((a =
                      (14 -
                        ((n = ((((O = n << (M = (((n + 1048320) | 0) >>> 16) & 8)) + 520192) | 0) >>> 16) & 4) |
                          M |
                          (O = ((((h = O << n) + 245760) | 0) >>> 16) & 2)) +
                        ((h << O) >>> 15)) |
                      0) +
                      7) |
                      0)) &
                    1) |
                  (a << 1)
              : 0) <<
              2)) |
          0),
          (St[(d + 28) >> 2] = A),
          (St[(d + 20) >> 2] = 0),
          (O = (St[(d + 16) >> 2] = 0) | St[2775]),
          (h = 1 << A)
        do {
          if (O & h) {
            for (M = v << (31 == (0 | A) ? 0 : (25 - (A >>> 1)) | 0), n = 0 | St[a >> 2]; ; ) {
              if (((-8 & St[(n + 4) >> 2]) | 0) == (0 | v)) {
                R = 130
                break
              }
              if (!(E = 0 | St[(g = (n + 16 + ((M >>> 31) << 2)) | 0) >> 2])) {
                R = 127
                break
              }
              ;(M <<= 1), (n = E)
            }
            if (127 == (0 | R)) {
              if (!(g >>> 0 < (0 | St[2778]) >>> 0)) {
                ;(St[g >> 2] = d), (St[(d + 24) >> 2] = n), (St[(d + 12) >> 2] = d), (St[(d + 8) >> 2] = d)
                break
              }
              Me()
            } else if (130 == (0 | R)) {
              if (
                ((f = 0 | St[(M = (n + 8) | 0) >> 2]), ((E = 0 | St[2778]) >>> 0 <= f >>> 0) & (E >>> 0 <= n >>> 0))
              ) {
                ;(St[(f + 12) >> 2] = d),
                  (St[M >> 2] = d),
                  (St[(d + 8) >> 2] = f),
                  (St[(d + 12) >> 2] = n),
                  (St[(d + 24) >> 2] = 0)
                break
              }
              Me()
            }
          } else
            (St[2775] = O | h),
              (St[a >> 2] = d),
              (St[(d + 24) >> 2] = a),
              (St[(d + 12) >> 2] = d),
              (St[(d + 8) >> 2] = d)
        } while (0)
        if (((d = ((0 | St[2782]) - 1) | 0), !(St[2782] = d))) {
          for (T = 11552; (d = 0 | St[T >> 2]); ) T = (d + 8) | 0
          St[2782] = -1
        }
      }
    }
    function Nt(e, r, t, n) {
      ;(r |= 0), (n |= 0)
      return 0 | ((Ft = (r - n - (((e |= 0) >>> 0 < (t |= 0) >>> 0) | 0)) >>> 0), ((e - t) >>> 0) | 0)
    }
    function Dt(e, r, t, n) {
      var i = 0
      return 0 | ((Ft = ((r |= 0) + (n |= 0) + (((i = ((e |= 0) + (t |= 0)) >>> 0) >>> 0 < e >>> 0) | 0)) >>> 0), 0 | i)
    }
    function Pt(e, r, t) {
      r |= 0
      var n,
        i,
        o,
        a = ((e |= 0) + (t |= 0)) | 0
      if (20 <= (0 | t)) {
        if (((i = (r &= 255) | (r << 8) | (r << 16) | (r << 24)), (o = -4 & a), (n = 3 & e)))
          for (n = (e + 4 - n) | 0; (0 | e) < (0 | n); ) (Et[e >> 0] = r), (e = (e + 1) | 0)
        for (; (0 | e) < (0 | o); ) (St[e >> 2] = i), (e = (e + 4) | 0)
      }
      for (; (0 | e) < (0 | a); ) (Et[e >> 0] = r), (e = (e + 1) | 0)
      return (e - t) | 0
    }
    function Ct(e, r, t) {
      return (
        (e |= 0),
        (r |= 0),
        (0 | (t |= 0)) < 32
          ? ((Ft = r >>> t), (e >>> t) | ((r & ((1 << t) - 1)) << (32 - t)))
          : (r >>> (t - 32)) | (Ft = 0)
      )
    }
    function It(e, r, t) {
      return (
        (e |= 0),
        (r |= 0),
        (0 | (t |= 0)) < 32
          ? ((Ft = (r << t) | ((e & (((1 << t) - 1) << (32 - t))) >>> (32 - t))), e << t)
          : ((Ft = e << (t - 32)), 0)
      )
    }
    function qe(e) {
      var r = 0
      return (0 | (r = 0 | Et[(E + (255 & (e |= 0))) >> 0])) < 8
        ? 0 | r
        : (0 | (r = 0 | Et[(E + ((e >> 8) & 255)) >> 0])) < 8
          ? (r + 8) | 0
          : (0 | (r = 0 | Et[(E + ((e >> 16) & 255)) >> 0])) < 8
            ? (r + 16) | 0
            : (24 + (0 | Et[(E + (e >>> 24)) >> 0])) | 0
    }
    function Qe(e, r, t, n, i) {
      i |= 0
      var o,
        a,
        u,
        s = 0,
        f = 0,
        l = 0,
        c = 0,
        d = 0,
        E = 0,
        _ = 0,
        S = 0,
        m = 0,
        h = 0,
        p = 0,
        b = 0,
        k = 0,
        F = 0,
        w = 0,
        y = 0,
        v = 0,
        M = 0,
        O = 0,
        A = 0,
        R = 0,
        g = 0,
        T = 0,
        N = 0,
        s = (e |= 0),
        c = (t |= 0),
        E = (d = n |= 0)
      if (!(l = f = r |= 0))
        return (
          (_ = 0 != (0 | i)),
          E
            ? (_ && ((St[i >> 2] = 0 | e), (St[(i + 4) >> 2] = 0 & r)), (m = S = 0) | ((Ft = S), m))
            : (_ && ((St[i >> 2] = (s >>> 0) % (c >>> 0)), (St[(i + 4) >> 2] = 0)),
              (S = 0) | ((Ft = S), (m = ((s >>> 0) / (c >>> 0)) >>> 0)))
        )
      _ = 0 == (0 | E)
      do {
        if (c) {
          if (!_) {
            if ((h = ((0 | D(0 | E)) - (0 | D(0 | l))) | 0) >>> 0 <= 31) {
              ;(w = ((s >>> ((F = p = (h + 1) | 0) >>> 0)) & (k = (h - 31) >> 31)) | (l << (b = (31 - h) | 0))),
                (y = (l >>> (p >>> 0)) & k),
                (v = 0),
                (M = s << b)
              break
            }
            return i
              ? ((St[i >> 2] = 0 | e), (St[(i + 4) >> 2] = f | (0 & r)), (m = S = 0) | ((Ft = S), m))
              : (m = S = 0) | ((Ft = S), m)
          }
          if (((b = (c - 1) | 0) & c) | 0) {
            ;(w =
              ((((h = (32 - (k = (33 + (0 | D(0 | c)) - (0 | D(0 | l))) | 0)) | 0) - 1) >> 31) &
                (l >>> ((a = (k - 32) | 0) >>> 0))) |
              (((l << h) | (s >>> ((F = k) >>> 0))) & (u = a >> 31))),
              (y = u & (l >>> (k >>> 0))),
              (v = (s << (p = (64 - k) | 0)) & (o = h >> 31)),
              (M = (((l << p) | (s >>> (a >>> 0))) & o) | ((s << h) & ((k - 33) >> 31)))
            break
          }
          return (
            0 | i && ((St[i >> 2] = b & s), (St[(i + 4) >> 2] = 0)),
            1 == (0 | c)
              ? 0 | ((Ft = S = f | (0 & r)), (m = 0 | e))
              : ((b = 0 | qe(0 | c)),
                0 | ((Ft = S = (l >>> (b >>> 0)) | 0), (m = (l << (32 - b)) | (s >>> (b >>> 0)) | 0)))
          )
        }
        if (_)
          return (
            0 | i && ((St[i >> 2] = (l >>> 0) % (c >>> 0)), (St[(i + 4) >> 2] = 0)),
            (S = 0) | ((Ft = S), (m = ((l >>> 0) / (c >>> 0)) >>> 0))
          )
        if (!s)
          return (
            0 | i && ((St[i >> 2] = 0), (St[(i + 4) >> 2] = (l >>> 0) % (E >>> 0))),
            (S = 0) | ((Ft = S), (m = ((l >>> 0) / (E >>> 0)) >>> 0))
          )
        if (!((b = (E - 1) | 0) & E))
          return (
            0 | i && ((St[i >> 2] = 0 | e), (St[(i + 4) >> 2] = (b & l) | (0 & r))),
            (m = l >>> (((S = 0) | qe(0 | E)) >>> 0)),
            0 | ((Ft = S), m)
          )
        if ((b = ((0 | D(0 | E)) - (0 | D(0 | l))) | 0) >>> 0 <= 30) {
          ;(w = (l << (h = (31 - b) | 0)) | (s >>> ((F = k = (b + 1) | 0) >>> 0))),
            (y = l >>> (k >>> 0)),
            (v = 0),
            (M = s << h)
          break
        }
        return i && ((St[i >> 2] = 0 | e), (St[(i + 4) >> 2] = f | (0 & r))), (m = S = 0) | ((Ft = S), m)
      } while (0)
      if (F) {
        for (
          r = 0 | t,
            t = d | (0 & n),
            n = 0 | Dt(0 | r, 0 | t, -1, -1),
            d = Ft,
            f = M,
            M = v,
            v = y,
            y = w,
            w = F,
            F = 0;
          (f = (M >>> 31) | ((e = f) << 1)),
            (M = F | (M << 1)),
            Nt(0 | n, 0 | d, 0 | (s = (y << 1) | (e >>> 31) | 0), 0 | (e = (y >>> 31) | (v << 1) | 0)),
            (F = 1 & (E = ((l = Ft) >> 31) | (((0 | l) < 0 ? -1 : 0) << 1))),
            (y =
              0 |
              Nt(
                0 | s,
                0 | e,
                (E & r) | 0,
                (((((0 | l) < 0 ? -1 : 0) >> 31) | (((0 | l) < 0 ? -1 : 0) << 1)) & t) | 0
              )),
            (v = Ft),
            (w = (w - 1) | 0),
            0 != (0 | w);

        );
        ;(O = f), (A = M), (R = v), (g = y), (T = 0), (N = F)
      } else (O = M), (A = v), (R = y), (g = w), (N = T = 0)
      return (
        (F = A),
        (A = 0) | i && ((St[i >> 2] = g), (St[(i + 4) >> 2] = R)),
        0 |
          ((Ft = S = ((0 | F) >>> 31) | ((O | A) << 1) | (0 & ((A << 1) | (F >>> 31))) | T),
          (m = (-2 & ((F << 1) | 0)) | N))
      )
    }
    function Lt(e, r, t, n) {
      return 0 | Qe((e |= 0), (r |= 0), (t |= 0), (n |= 0), 0)
    }
    function Ze(e) {
      var r, t
      return ((0 < (0 | (e = (((e |= 0) + 15) & -16) | 0))) & ((0 | (t = ((r = 0 | St[d >> 2]) + e) | 0)) < (0 | r))) |
        ((0 | t) < 0)
        ? (h(), M(12), -1)
        : (0 | (St[d >> 2] = t)) > (0 | m()) && 0 == (0 | S())
          ? (M(12), (St[d >> 2] = r), -1)
          : 0 | r
    }
    function xt(e, r, t, n) {
      var i,
        o = pt
      return (
        (pt = (pt + 16) | 0),
        Qe((e |= 0), (r |= 0), (t |= 0), (n |= 0), (i = 0 | o)),
        (pt = o),
        0 | ((Ft = 0 | St[(4 + i) >> 2]), 0 | St[i >> 2])
      )
    }
    function Je(e, r, t) {
      ;(e |= 0), (r |= 0)
      var n
      if (4096 <= (0 | (t |= 0))) return 0 | R(0 | e, 0 | r, 0 | t)
      if (((n = 0 | e), (3 & e) == (3 & r))) {
        for (; 3 & e; ) {
          if (!t) return 0 | n
          ;(Et[e >> 0] = 0 | Et[r >> 0]), (e = (e + 1) | 0), (r = (r + 1) | 0), (t = (t - 1) | 0)
        }
        for (; 4 <= (0 | t); ) (St[e >> 2] = St[r >> 2]), (e = (e + 4) | 0), (r = (r + 4) | 0), (t = (t - 4) | 0)
      }
      for (; 0 < (0 | t); ) (Et[e >> 0] = 0 | Et[r >> 0]), (e = (e + 1) | 0), (r = (r + 1) | 0), (t = (t - 1) | 0)
      return 0 | n
    }
    function $e() {
      return 0
    }
    function er(e, r, t) {
      return p(0), 0
    }
    function rr(e) {
      b(1)
    }
    function tr(e, r) {
      k(2)
    }
    var nr = [
        er,
        function (e, r, t) {
          ;(e |= 0), (r |= 0), (t |= 0)
          var n = 0,
            i = pt
          return (
            (0 | bt) <= (0 | (pt = (pt + 80) | 0)) && yt(80),
            (n = i),
            (St[(e + 36) >> 2] = 9),
            0 == ((64 & St[e >> 2]) | 0) &&
              ((St[n >> 2] = St[(e + 60) >> 2]),
              (St[(n + 4) >> 2] = 21505),
              (St[(n + 8) >> 2] = i + 12),
              0 | Y(54, 0 | n)) &&
              (Et[(e + 75) >> 0] = -1),
            (n = 0 | xe(e, r, t)),
            (pt = i),
            0 | n
          )
        },
        function (e, r, t) {
          ;(e |= 0), (r |= 0), (t |= 0)
          var n,
            i,
            o = 0,
            a = pt
          return (
            (0 | bt) <= (0 | (pt = (pt + 32) | 0)) && yt(32),
            (i = ((n = a) + 20) | 0),
            (St[n >> 2] = St[(e + 60) >> 2]),
            (St[(n + 4) >> 2] = 0),
            (St[(n + 8) >> 2] = r),
            (St[(n + 12) >> 2] = i),
            (St[(n + 16) >> 2] = t),
            (o = (0 | Be(0 | O(140, 0 | n))) < 0 ? (St[i >> 2] = -1) : 0 | St[i >> 2]),
            (pt = a),
            0 | o
          )
        },
        function (e, r, t) {
          ;(e |= 0), (r |= 0), (t |= 0)
          var n,
            i,
            o,
            a,
            u = pt
          return (
            (0 | bt) <= (0 | (pt = (pt + 16) | 0)) && yt(16),
            (i = (u + 8) | 0),
            (o = (u + 4) | 0),
            (St[(n = ((a = u) + 12) | 0) >> 2] = e),
            (St[i >> 2] = r),
            (St[o >> 2] = t),
            (St[a >> 2] = St[n >> 2]),
            (n = 0 == (0 | L((8 + (0 | St[a >> 2])) | 0, 0 | St[i >> 2], 0 | St[o >> 2]))),
            (pt = u),
            0 | (n ? 0 : 8)
          )
        },
        function (e, r, t) {
          ;(e |= 0), (r |= 0), (t |= 0)
          var n,
            i,
            o,
            a,
            u = pt
          return (
            (0 | bt) <= (0 | (pt = (pt + 16) | 0)) && yt(16),
            (i = (u + 8) | 0),
            (o = (u + 4) | 0),
            (St[(n = ((a = u) + 12) | 0) >> 2] = e),
            (St[i >> 2] = r),
            (St[o >> 2] = t),
            (St[a >> 2] = St[n >> 2]),
            (n = 0 | ae((8 + (0 | St[a >> 2])) | 0, 0 | St[i >> 2], 0 | St[o >> 2])),
            (pt = u),
            0 | n
          )
        },
        function (e, r, t) {
          ;(e |= 0), (r |= 0), (t |= 0)
          var n,
            i,
            o,
            a,
            u,
            s,
            f = 0,
            l = 0,
            c = 0,
            d = 0,
            E = 0,
            _ = pt
          return (
            (0 | bt) <= (0 | (pt = (pt + 32) | 0)) && yt(32),
            (i = (_ + 16) | 0),
            (o = (_ + 12) | 0),
            (a = (_ + 8) | 0),
            (u = (_ + 4) | 0),
            (St[(n = ((s = _) + 20) | 0) >> 2] = e),
            (St[i >> 2] = r),
            (St[o >> 2] = t),
            (St[a >> 2] = 0),
            (St[u >> 2] = St[n >> 2]),
            (St[s >> 2] = (0 | St[(24 + (0 | St[u >> 2])) >> 2]) - (0 | St[(20 + (0 | St[u >> 2])) >> 2])),
            0 == (0 | St[s >> 2]) &&
              0 < (0 | St[St[o >> 2] >> 2]) >>> 0 &&
              (16384 < ((St[(20 + (0 | St[u >> 2])) >> 2] = 0) | St[St[o >> 2] >> 2]) >>> 0 &&
                (St[St[o >> 2] >> 2] = 16384),
              (n =
                0 |
                nr[15 & St[St[(16 + (0 | St[u >> 2])) >> 2] >> 2]](
                  0 | St[(16 + (0 | St[u >> 2])) >> 2],
                  (28 + (0 | St[u >> 2])) | 0,
                  0 | St[o >> 2]
                )),
              (St[a >> 2] = n),
              (n = 0 | St[St[o >> 2] >> 2]),
              (St[(24 + (0 | St[u >> 2])) >> 2] = n),
              (St[s >> 2] = n)),
            (pt =
              ((E =
                ((d =
                  ((c =
                    ((l =
                      ((f =
                        ((0 | St[s >> 2]) >>> 0 >= (0 | St[St[o >> 2] >> 2]) >>> 0 ||
                          (St[St[o >> 2] >> 2] = St[s >> 2]),
                        ((0 | St[u >> 2]) + 28) | 0)),
                      0 | St[u >> 2])),
                    (f + (0 | St[((l + 20) | 0) >> 2])) | 0)),
                  0 | St[i >> 2])),
                (St[d >> 2] = c),
                0 | St[a >> 2])),
              _)),
            0 | E
          )
        },
        function (e, r, t) {
          ;(e |= 0), (r |= 0), (t |= 0)
          var n,
            i,
            o,
            a,
            u,
            s,
            f = 0,
            l = 0,
            c = 0,
            d = 0,
            E = 0,
            _ = pt
          return (
            (0 | bt) <= (0 | (pt = (pt + 32) | 0)) && yt(32),
            (i = (_ + 16) | 0),
            (o = (_ + 12) | 0),
            (a = (_ + 8) | 0),
            (u = (_ + 4) | 0),
            (St[(n = ((s = _) + 20) | 0) >> 2] = e),
            (St[i >> 2] = r),
            (St[o >> 2] = t),
            (St[a >> 2] = 0),
            (St[u >> 2] = St[n >> 2]),
            (St[s >> 2] = (0 | St[(24 + (0 | St[u >> 2])) >> 2]) - (0 | St[(20 + (0 | St[u >> 2])) >> 2])),
            0 == (0 | St[s >> 2]) &&
              0 < (0 | St[St[o >> 2] >> 2]) >>> 0 &&
              ((St[(20 + (0 | St[u >> 2])) >> 2] = 0),
              (St[s >> 2] = 16384),
              (n =
                0 |
                nr[15 & St[St[(16 + (0 | St[u >> 2])) >> 2] >> 2]](
                  0 | St[(16 + (0 | St[u >> 2])) >> 2],
                  (28 + (0 | St[u >> 2])) | 0,
                  s
                )),
              (St[a >> 2] = n),
              (St[(24 + (0 | St[u >> 2])) >> 2] = St[s >> 2])),
            (pt =
              ((E =
                ((d =
                  ((c =
                    ((l =
                      ((f =
                        ((0 | St[s >> 2]) >>> 0 >= (0 | St[St[o >> 2] >> 2]) >>> 0 ||
                          (St[St[o >> 2] >> 2] = St[s >> 2]),
                        ((0 | St[u >> 2]) + 28) | 0)),
                      0 | St[u >> 2])),
                    (f + (0 | St[((l + 20) | 0) >> 2])) | 0)),
                  0 | St[i >> 2])),
                (St[d >> 2] = c),
                0 | St[a >> 2])),
              _)),
            0 | E
          )
        },
        function (e, r, t) {
          ;(e |= 0), (r |= 0), (t |= 0)
          var n,
            i,
            o,
            a,
            u,
            s = 0,
            f = 0,
            l = pt
          return (
            (0 | bt) <= (0 | (pt = (pt + 32) | 0)) && yt(32),
            (n = (l + 20) | 0),
            (s = (l + 12) | 0),
            (o = (l + 8) | 0),
            (a = (l + 4) | 0),
            (St[(i = ((u = l) + 16) | 0) >> 2] = e),
            (St[s >> 2] = r),
            (St[o >> 2] = t),
            (St[a >> 2] = St[i >> 2]),
            (St[u >> 2] = (0 | St[(24 + (0 | St[a >> 2])) >> 2]) - (0 | St[(20 + (0 | St[a >> 2])) >> 2])),
            (pt =
              ((f =
                0 | St[u >> 2]
                  ? ((0 | St[u >> 2]) >>> 0 > (0 | St[St[o >> 2] >> 2]) >>> 0 && (St[u >> 2] = St[St[o >> 2] >> 2]),
                    Je(
                      0 | St[s >> 2],
                      (28 + (0 | St[a >> 2]) + (0 | St[(20 + (0 | St[a >> 2])) >> 2])) | 0,
                      0 | St[u >> 2]
                    ),
                    (s = (20 + (0 | St[a >> 2])) | 0),
                    (St[s >> 2] = (0 | St[s >> 2]) + (0 | St[u >> 2])),
                    (St[St[o >> 2] >> 2] = St[u >> 2]),
                    (St[n >> 2] = 0) | St[n >> 2])
                  : ((i =
                      0 |
                      nr[15 & St[St[(16 + (0 | St[a >> 2])) >> 2] >> 2]](
                        0 | St[(16 + (0 | St[a >> 2])) >> 2],
                        0 | St[s >> 2],
                        0 | St[o >> 2]
                      )),
                    (St[n >> 2] = i),
                    0 | St[n >> 2])),
              l)),
            0 | f
          )
        },
        function (e, r, t) {
          ;(e |= 0), (r |= 0), (t |= 0)
          var n,
            i,
            o,
            a,
            u = pt
          return (
            (0 | bt) <= (0 | (pt = (pt + 16) | 0)) && yt(16),
            (i = (u + 8) | 0),
            (o = (u + 4) | 0),
            (St[(n = ((a = u) + 12) | 0) >> 2] = e),
            (St[i >> 2] = r),
            (St[o >> 2] = t),
            (St[a >> 2] = St[n >> 2]),
            (St[(24 + (0 | St[a >> 2])) >> 2] = 0),
            (n =
              (St[(20 + (0 | St[a >> 2])) >> 2] = 0) |
              nr[15 & St[(4 + (0 | St[(16 + (0 | St[a >> 2])) >> 2])) >> 2]](
                0 | St[(16 + (0 | St[a >> 2])) >> 2],
                0 | St[i >> 2],
                0 | St[o >> 2]
              )),
            (pt = u),
            0 | n
          )
        },
        xe,
        function (e, r, t) {
          ;(e |= 0), (r |= 0), (t |= 0)
          var n,
            i,
            o,
            a,
            u = 0,
            s = 0,
            f = 0,
            l = 0,
            c = 0,
            d = pt
          return (
            (0 | bt) <= (0 | (pt = (pt + 48) | 0)) && yt(48),
            (n = (d + 16) | 0),
            (St[(s = ((u = d) + 32) | 0) >> 2] = r),
            (f = (s + 4) | 0),
            (o = 0 | St[(i = (e + 48) | 0) >> 2]),
            (St[f >> 2] = t - ((0 != (0 | o)) & 1)),
            (a = (e + 44) | 0),
            (St[(s + 8) >> 2] = St[a >> 2]),
            (St[(s + 12) >> 2] = o),
            (c =
              1 <=
              (0 |
                (l =
                  0 | St[2762]
                    ? (g(2, 0 | e),
                      (St[u >> 2] = St[(e + 60) >> 2]),
                      (St[(u + 4) >> 2] = s),
                      (St[(u + 8) >> 2] = 2),
                      (s = 0 | Be(0 | T(145, 0 | u))),
                      v(0),
                      s)
                    : ((St[n >> 2] = St[(e + 60) >> 2]),
                      (St[(4 + n) >> 2] = s),
                      (St[(8 + n) >> 2] = 2),
                      0 | Be(0 | T(145, 0 | n)))))
                ? (s = 0 | St[f >> 2]) >>> 0 < l >>> 0
                  ? ((f = 0 | St[a >> 2]),
                    (u = St[(a = (e + 4) | 0) >> 2] = f),
                    (St[(e + 8) >> 2] = u + (l - s)),
                    0 | St[i >> 2] && ((St[a >> 2] = u + 1), (Et[(r + (t + -1)) >> 0] = 0 | Et[u >> 0])),
                    t)
                  : l
                : ((St[e >> 2] = St[e >> 2] | ((48 & l) ^ 16)), (St[(e + 8) >> 2] = 0), (St[(e + 4) >> 2] = 0), l)),
            (pt = d),
            0 | c
          )
        },
        er,
        er,
        er,
        er,
        er,
      ],
      ir = [
        rr,
        function (e) {
          0 | St[((e |= 0) + 68) >> 2] || He()
        },
        function (e) {
          0 | St[((e |= 0) + 68) >> 2] || He()
        },
        rr,
      ],
      or = [
        tr,
        function (e, r) {
          ;(e |= 0), (r |= 0)
          var t,
            n = pt
          ;(0 | bt) <= (0 | (pt = (pt + 16) | 0)) && yt(16),
            (St[((t = n) + 4) >> 2] = e),
            (St[t >> 2] = r),
            Ge(0 | St[t >> 2]),
            (pt = n)
        },
        function (e, r) {
          ;(e |= 0), (r |= 0)
          var t,
            n = pt
          ;(0 | bt) <= (0 | (pt = (pt + 16) | 0)) && yt(16),
            (St[((t = n) + 4) >> 2] = e),
            (St[t >> 2] = r),
            Ge(0 | St[t >> 2]),
            (pt = n)
        },
        tr,
      ],
      ar = [
        function (e) {
          return F(3), 0
        },
        function (e) {
          e |= 0
          var r,
            t = pt
          return (
            (0 | bt) <= (0 | (pt = (pt + 16) | 0)) && yt(16),
            (St[(r = t) >> 2] = St[(e + 60) >> 2]),
            (e = 0 | Be(0 | U(6, 0 | r))),
            (pt = t),
            0 | e
          )
        },
      ],
      ur = [
        function (e, r, t, n) {
          return w(4), 0
        },
        function (e, r, t, n) {
          ;(e |= 0), (r |= 0), (t |= 0), (n |= 0)
          var i,
            o,
            a,
            u,
            s,
            f = 0,
            l = pt
          for (
            (0 | bt) <= (0 | (pt = (pt + 32) | 0)) && yt(32),
              o = (l + 12) | 0,
              a = (l + 8) | 0,
              u = (l + 4) | 0,
              St[(i = ((s = l) + 16) | 0) >> 2] = e,
              St[o >> 2] = r,
              St[a >> 2] = t,
              St[u >> 2] = n,
              St[s >> 2] = St[o >> 2];
            !((0 | St[a >> 2]) >>> 0 <= 0) && 3 & St[s >> 2];

          )
            (St[i >> 2] =
              St[((0 | St[u >> 2]) + ((255 & (St[i >> 2] ^ (0 | mt[St[s >> 2] >> 0]))) << 2)) >> 2] ^
              ((0 | St[i >> 2]) >>> 8)),
              (St[a >> 2] = (0 | St[a >> 2]) - 1),
              (St[s >> 2] = 1 + (0 | St[s >> 2]))
          for (; !((0 | St[a >> 2]) >>> 0 < 4); )
            (St[i >> 2] = St[i >> 2] ^ St[St[s >> 2] >> 2]),
              (St[i >> 2] =
                St[((0 | St[u >> 2]) + ((768 + (255 & St[i >> 2])) << 2)) >> 2] ^
                St[((0 | St[u >> 2]) + ((512 + (((0 | St[i >> 2]) >>> 8) & 255)) << 2)) >> 2] ^
                St[((0 | St[u >> 2]) + ((256 + (((0 | St[i >> 2]) >>> 16) & 255)) << 2)) >> 2] ^
                St[((0 | St[u >> 2]) + (((0 | St[i >> 2]) >>> 24) << 2)) >> 2]),
              (St[a >> 2] = (0 | St[a >> 2]) - 4),
              (St[s >> 2] = 4 + (0 | St[s >> 2]))
          for (; (f = 0 | St[i >> 2]), !((0 | St[a >> 2]) >>> 0 <= 0); )
            (St[i >> 2] =
              St[((0 | St[u >> 2]) + ((255 & (f ^ (0 | mt[St[s >> 2] >> 0]))) << 2)) >> 2] ^ ((0 | St[i >> 2]) >>> 8)),
              (St[a >> 2] = (0 | St[a >> 2]) - 1),
              (St[s >> 2] = 1 + (0 | St[s >> 2]))
          return (pt = l), 0 | f
        },
      ],
      sr = [
        function (e, r) {
          return y(5), 0
        },
        function (e, r) {
          ;(e |= 0), (r |= 0)
          var t,
            n,
            i = pt
          return (
            (0 | bt) <= (0 | (pt = (pt + 16) | 0)) && yt(16),
            (t = (i + 8) | 0),
            (St[((n = i) + 4) >> 2] = e),
            (St[n >> 2] = r),
            0 | St[n >> 2] ? ((r = 0 | Xe(0 | St[n >> 2])), (St[t >> 2] = r)) : (St[t >> 2] = 0),
            (pt = i),
            0 | St[t >> 2]
          )
        },
        function (e, r) {
          ;(e |= 0), (r |= 0)
          var t,
            n,
            i = pt
          return (
            (0 | bt) <= (0 | (pt = (pt + 16) | 0)) && yt(16),
            (t = (i + 8) | 0),
            (St[((n = i) + 4) >> 2] = e),
            (St[n >> 2] = r),
            0 | St[n >> 2] ? ((r = 0 | Xe(0 | St[n >> 2])), (St[t >> 2] = r)) : (St[t >> 2] = 0),
            (pt = i),
            0 | St[t >> 2]
          )
        },
        function (e, r) {
          ;(e |= 0), (r |= 0)
          var t,
            n,
            i,
            o = pt
          return (
            (0 | bt) <= (0 | (pt = (pt + 16) | 0)) && yt(16),
            (n = (o + 4) | 0),
            (St[(t = ((i = o) + 8) | 0) >> 2] = e),
            (St[n >> 2] = r),
            (St[i >> 2] = St[t >> 2]),
            (t = (20 + (0 | St[i >> 2])) | 0),
            (St[t >> 2] = (0 | St[t >> 2]) + (0 | St[n >> 2])),
            (pt = o),
            0
          )
        },
      ]
    return {
      _sbrk: Ze,
      _i64Subtract: Nt,
      _free: Ge,
      ___udivmoddi4: Qe,
      _i64Add: Dt,
      _extract: function (e, r) {
        ;(e |= 0), (r |= 0)
        var t,
          n,
          i,
          o,
          a,
          u,
          s,
          f,
          l,
          c,
          d,
          E,
          _,
          S,
          m,
          h,
          p,
          b = 0,
          k = 0,
          F = 0,
          w = 0,
          y = 0,
          v = 0,
          M = 0,
          O = 0,
          A = 0,
          R = 0,
          g = 0,
          T = 0,
          N = 0,
          D = 0,
          P = 0,
          C = 0,
          I = 0,
          L = 0
        if (
          ((0 | bt) <= (0 | (pt = ((r = pt) + 16816) | 0)) && yt(16816),
          (t = (r + 80) | 0),
          (n = (r + 16544) | 0),
          (i = (r + 16532) | 0),
          (o = (r + 120) | 0),
          (a = (r + 112) | 0),
          (u = (r + 104) | 0),
          (f = ((s = r) + 100) | 0),
          (l = (r + 96) | 0),
          (c = (r + 92) | 0),
          (d = (r + 16548) | 0),
          (E = (r + 88) | 0),
          (_ = (r + 84) | 0),
          (S =
            0 |
            (function (e, r) {
              ;(e |= 0), (r |= 0)
              var t = 0,
                n = 0,
                i = 0,
                o = 0,
                a = 0
              ;(0 | (pt = ((t = pt) + 32) | 0)) >= (0 | bt) && yt(32)
              ;(n = (t + 16) | 0),
                (i = t),
                (a =
                  0 | Rt(2845, 0 | Et[r >> 0], 4)
                    ? ((o =
                        32768 |
                        (function (e) {
                          var r = 0,
                            t = 0,
                            n = 0,
                            i = 0
                          return (
                            (r = 0 == (0 | Ye((e = e | 0), 43))),
                            (t = 0 | Et[e >> 0]),
                            (n = r ? ((t << 24) >> 24 != 114) & 1 : 2),
                            (r = 0 == (0 | Ye(e, 120))),
                            (i = r ? n : 128 | n),
                            (n = 0 == (0 | Ye(e, 101))),
                            (e = n ? i : 524288 | i),
                            (i = (t << 24) >> 24 == 114 ? e : 64 | e),
                            (e = (t << 24) >> 24 == 119 ? 512 | i : i),
                            0 | ((t << 24) >> 24 == 97 ? 1024 | e : e)
                          )
                        })(r)),
                      (St[i >> 2] = e),
                      (St[(i + 4) >> 2] = o),
                      (St[(i + 8) >> 2] = 438),
                      (o = 0 | Be(0 | z(5, 0 | i))),
                      0 <= (0 | o)
                        ? (i =
                            0 |
                            (function (e, r) {
                              ;(e |= 0), (r |= 0)
                              var t = 0,
                                n = 0,
                                i = 0,
                                o = 0,
                                a = 0,
                                u = 0,
                                s = 0,
                                f = 0,
                                l = 0,
                                c = 0,
                                d = 0,
                                E = 0,
                                _ = 0
                              ;(0 | (pt = ((t = pt) + 112) | 0)) >= (0 | bt) && yt(112)
                              if (
                                ((n = (t + 40) | 0),
                                (i = (t + 24) | 0),
                                (o = (t + 16) | 0),
                                (u = ((a = t) + 52) | 0),
                                0 | Rt(2845, ((s = 0 | Et[r >> 0]) << 24) >> 24, 4))
                              )
                                if ((f = 0 | Xe(1144))) {
                                  for (
                                    c = f, d = (c + 112) | 0;
                                    (St[c >> 2] = 0), (c = (c + 4) | 0), (0 | c) < (0 | d);

                                  );
                                  0 | Ye(r, 43) || (St[f >> 2] = (s << 24) >> 24 == 114 ? 8 : 4),
                                    (E =
                                      0 | Ye(r, 101)
                                        ? ((St[a >> 2] = e),
                                          (St[(a + 4) >> 2] = 2),
                                          (St[(a + 8) >> 2] = 1),
                                          x(221, 0 | a),
                                          0 | Et[r >> 0])
                                        : s),
                                    (_ =
                                      (E << 24) >> 24 == 97
                                        ? ((St[o >> 2] = e),
                                          (St[(4 + o) >> 2] = 3),
                                          1024 & (E = 0 | x(221, 0 | o)) ||
                                            ((St[i >> 2] = e),
                                            (St[(i + 4) >> 2] = 4),
                                            (St[(i + 8) >> 2] = 1024 | E),
                                            x(221, 0 | i)),
                                          (i = 128 | St[f >> 2]),
                                          (St[f >> 2] = i))
                                        : 0 | St[f >> 2]),
                                    (St[(f + 60) >> 2] = e),
                                    (St[(f + 44) >> 2] = f + 120),
                                    (St[(f + 48) >> 2] = 1024),
                                    (Et[(i = (f + 75) | 0) >> 0] = -1),
                                    0 == ((8 & _) | 0) &&
                                      ((St[n >> 2] = e),
                                      (St[(4 + n) >> 2] = 21505),
                                      (St[(8 + n) >> 2] = u),
                                      0 == (0 | Y(54, 0 | n))) &&
                                      (Et[i >> 0] = 10),
                                    (St[(f + 32) >> 2] = 10),
                                    (St[(f + 36) >> 2] = 9),
                                    (St[(f + 40) >> 2] = 2),
                                    (St[(f + 12) >> 2] = 1),
                                    0 | St[2763] || (St[(f + 76) >> 2] = -1),
                                    H(11076),
                                    (i = 0 | St[2768]),
                                    0 | (St[(f + 56) >> 2] = i) && (St[(i + 52) >> 2] = f),
                                    (St[2768] = f),
                                    V(11076),
                                    (l = f)
                                } else l = 0
                              else (f = 0 | vt()), (St[f >> 2] = 22), (l = 0)
                              return (pt = t), 0 | l
                            })(o, r)) || ((St[n >> 2] = o), U(6, 0 | n), 0)
                        : 0)
                    : ((i = 0 | vt()), (St[i >> 2] = 22), 0))
              return (pt = t), 0 | a
            })(e, 140)),
          (St[f >> 2] = 0),
          (St[a >> 2] = 1),
          (St[(e = (4 + a) | 0) >> 2] = 1),
          (St[u >> 2] = 2),
          (St[(4 + u) >> 2] = 2),
          (St[(m = (8 + i) | 0) >> 2] = S),
          (function (e) {
            e |= 0
            var r = 0,
              t = 0
            ;(0 | (pt = ((r = pt) + 16) | 0)) >= (0 | bt) && yt(16),
              (St[(t = r) >> 2] = e),
              (St[St[t >> 2] >> 2] = 3),
              (St[(4 + (0 | St[t >> 2])) >> 2] = 4),
              (pt = r)
          })(i),
          (function (e, r) {
            ;(e |= 0), (r |= 0)
            var t = 0,
              n = 0,
              i = 0
            ;(0 | (pt = ((t = pt) + 16) | 0)) >= (0 | bt) && yt(16),
              (St[(n = ((i = t) + 4) | 0) >> 2] = e),
              (St[i >> 2] = r),
              (St[St[n >> 2] >> 2] = 0 | St[i >> 2] ? 6 : 5),
              (St[(4 + (0 | St[n >> 2])) >> 2] = 3),
              (St[(8 + (0 | St[n >> 2])) >> 2] = 7),
              (St[(12 + (0 | St[n >> 2])) >> 2] = 8),
              (pt = t)
          })(o, 0),
          (St[(16 + o) >> 2] = i),
          (function (e) {
            e |= 0
            var r = 0,
              t = 0
            ;(0 | (pt = ((r = pt) + 16) | 0)) >= (0 | bt) && yt(16),
              (St[(t = r) >> 2] = e),
              (St[(24 + (0 | St[t >> 2])) >> 2] = 0),
              (St[(20 + (0 | St[t >> 2])) >> 2] = 0),
              (pt = r)
          })(o),
          (function () {
            var e = 0,
              r = 0,
              t = 0,
              n = 0,
              i = 0,
              o = 0
            for (
              (0 | (pt = ((e = pt) + 16) | 0)) >= (0 | bt) && yt(16),
                t = (e + 8) | 0,
                n = (e + 4) | 0,
                St[(r = ((i = e) + 12) | 0) >> 2] = 0;
              !(256 <= (0 | St[r >> 2]) >>> 0);

            ) {
              for (St[t >> 2] = St[r >> 2], St[n >> 2] = 0; (o = 0 | St[t >> 2]), !(8 <= (0 | St[n >> 2]) >>> 0); )
                (St[t >> 2] = (o >>> 1) ^ (-306674912 & ~((1 & St[t >> 2]) - 1))), (St[n >> 2] = 1 + (0 | St[n >> 2]))
              ;(St[(2852 + (St[r >> 2] << 2)) >> 2] = o), (St[r >> 2] = 1 + (0 | St[r >> 2]))
            }
            for (; !(2048 <= (0 | St[r >> 2]) >>> 0); )
              (St[i >> 2] = St[(2852 + (((0 | St[r >> 2]) - 256) << 2)) >> 2]),
                (St[(2852 + (St[r >> 2] << 2)) >> 2] =
                  St[(2852 + ((255 & St[i >> 2]) << 2)) >> 2] ^ ((0 | St[i >> 2]) >>> 8)),
                (St[r >> 2] = 1 + (0 | St[r >> 2]))
            ;(St[2761] = 1), (pt = e)
          })(),
          J(s),
          0 |
            (function (e, r, t, n) {
              ;(e |= 0), (r |= 0), (t |= 0), (n |= 0)
              var i = 0,
                o = 0,
                a = 0,
                u = 0,
                s = 0,
                f = 0,
                l = 0
              ;(0 | (pt = ((i = pt) + 32) | 0)) >= (0 | bt) && yt(32)
              return (
                (a = (i + 12) | 0),
                (u = (i + 8) | 0),
                (s = (i + 4) | 0),
                (St[(o = ((f = i) + 16) | 0) >> 2] = e),
                (St[a >> 2] = r),
                (St[u >> 2] = t),
                (St[s >> 2] = n),
                (n =
                  0 |
                  (function (e, r, t, n) {
                    ;(e |= 0), (r |= 0), (t |= 0), (n |= 0)
                    var i = 0,
                      o = 0,
                      a = 0,
                      u = 0,
                      s = 0,
                      f = 0,
                      l = 0,
                      c = 0,
                      d = 0,
                      E = 0,
                      _ = 0,
                      S = 0,
                      m = 0,
                      h = 0,
                      p = 0,
                      b = 0,
                      k = 0,
                      F = 0,
                      w = 0,
                      y = 0,
                      v = 0,
                      M = 0,
                      O = 0
                    ;(0 | (pt = ((i = pt) + 160) | 0)) >= (0 | bt) && yt(160)
                    if (
                      ((o = (i + 112) | 0),
                      (u = (i + 104) | 0),
                      (s = (i + 100) | 0),
                      (f = (i + 96) | 0),
                      (l = (i + 120) | 0),
                      (c = (i + 32) | 0),
                      (d = (i + 24) | 0),
                      (E = (i + 16) | 0),
                      (_ = (i + 92) | 0),
                      (S = (i + 88) | 0),
                      (m = (i + 80) | 0),
                      (h = (i + 72) | 0),
                      (p = (i + 68) | 0),
                      (b = (i + 64) | 0),
                      (k = (i + 8) | 0),
                      (F = (i + 60) | 0),
                      (w = (i + 56) | 0),
                      (y = (i + 48) | 0),
                      (M = ((v = i) + 40) | 0),
                      (St[(a = (i + 108) | 0) >> 2] = e),
                      (St[u >> 2] = r),
                      (St[s >> 2] = t),
                      (St[f >> 2] = n),
                      (St[(n = c) >> 2] = 0),
                      (St[(n + 4) >> 2] = 0),
                      (n = 0 | nr[15 & St[(12 + (0 | St[u >> 2])) >> 2]](0 | St[u >> 2], c, 1)),
                      (St[p >> 2] = n),
                      0 | St[p >> 2])
                    )
                      return (St[o >> 2] = St[p >> 2]), (O = 0 | St[o >> 2]), (pt = i), 0 | O
                    if (((p = 0 | pe(0 | St[u >> 2], l, 32, 17)), (St[b >> 2] = p), 0 | St[b >> 2]))
                      return (St[o >> 2] = St[b >> 2]), (O = 0 | St[o >> 2]), (pt = i), 0 | O
                    if (
                      !(
                        0 |
                        (function (e) {
                          e |= 0
                          var r = 0,
                            t = 0,
                            n = 0,
                            i = 0,
                            o = 0,
                            a = 0
                          ;(0 | (pt = ((r = pt) + 16) | 0)) >= (0 | bt) && yt(16)
                          ;(t = (r + 8) | 0), (St[(n = ((i = r) + 4) | 0) >> 2] = e), (St[i >> 2] = 0)
                          for (;;) {
                            if (6 <= (0 | St[i >> 2]) >>> 0) {
                              o = 6
                              break
                            }
                            if (
                              (0 | mt[((0 | St[n >> 2]) + (0 | St[i >> 2])) >> 0]) !=
                              (0 | mt[(346 + (0 | St[i >> 2])) >> 0])
                            ) {
                              o = 4
                              break
                            }
                            St[i >> 2] = 1 + (0 | St[i >> 2])
                          }
                          {
                            if (4 == (0 | o)) return (St[t >> 2] = 0), (a = 0 | St[t >> 2]), (pt = r), 0 | a
                            if (6 == (0 | o)) return (St[t >> 2] = 1), (a = 0 | St[t >> 2]), (pt = r), 0 | a
                          }
                          return 0
                        })(l)
                      )
                    )
                      return (St[o >> 2] = 17), (O = 0 | St[o >> 2]), (pt = i), 0 | O
                    if (0 | mt[(l + 6) >> 0]) return (St[o >> 2] = 4), (O = 0 | St[o >> 2]), (pt = i), 0 | O
                    if (
                      ((b =
                        0 |
                        mt[(l + 12 + 4) >> 0] |
                        ((0 | mt[(l + 12 + 4 + 1) >> 0]) << 8) |
                        ((0 | mt[(l + 12 + 4 + 2) >> 0]) << 16) |
                        ((0 | mt[(l + 12 + 4 + 3) >> 0]) << 24)),
                      (St[(p = d) >> 2] =
                        0 |
                        mt[(l + 12) >> 0] |
                        ((0 | mt[(l + 12 + 1) >> 0]) << 8) |
                        ((0 | mt[(l + 12 + 2) >> 0]) << 16) |
                        ((0 | mt[(l + 12 + 3) >> 0]) << 24)),
                      (St[(p + 4) >> 2] = b),
                      (b =
                        0 |
                        mt[(l + 20 + 4) >> 0] |
                        ((0 | mt[(l + 20 + 4 + 1) >> 0]) << 8) |
                        ((0 | mt[(l + 20 + 4 + 2) >> 0]) << 16) |
                        ((0 | mt[(l + 20 + 4 + 3) >> 0]) << 24)),
                      (St[(p = E) >> 2] =
                        0 |
                        mt[(l + 20) >> 0] |
                        ((0 | mt[(l + 20 + 1) >> 0]) << 8) |
                        ((0 | mt[(l + 20 + 2) >> 0]) << 16) |
                        ((0 | mt[(l + 20 + 3) >> 0]) << 24)),
                      (St[(p + 4) >> 2] = b),
                      (St[S >> 2] =
                        0 |
                        mt[(l + 28) >> 0] |
                        ((0 | mt[(l + 28 + 1) >> 0]) << 8) |
                        ((0 | mt[(l + 28 + 2) >> 0]) << 16) |
                        ((0 | mt[(l + 28 + 3) >> 0]) << 24)),
                      (p = 0 | Dt(0 | St[(b = c) >> 2], 0 | St[(b + 4) >> 2], 32, 0)),
                      (b = (32 + (0 | St[a >> 2])) | 0),
                      (St[b >> 2] = p),
                      (St[(b + 4) >> 2] = Ft),
                      (0 | (b = 0 | Pe((l + 12) | 0, 20))) !=
                        (0 |
                          mt[(l + 8) >> 0] |
                          ((0 | mt[(l + 8 + 1) >> 0]) << 8) |
                          ((0 | mt[(l + 8 + 2) >> 0]) << 16) |
                          ((0 | mt[(l + 8 + 3) >> 0]) << 24) |
                          0))
                    )
                      return (St[o >> 2] = 3), (O = 0 | St[o >> 2]), (pt = i), 0 | O
                    if (
                      ((St[_ >> 2] = St[E >> 2]),
                      0 != (0 | St[((l = E) + 4) >> 2]) || (0 | St[_ >> 2]) != (0 | St[l >> 2]))
                    )
                      return (St[o >> 2] = 2), (O = 0 | St[o >> 2]), (pt = i), 0 | O
                    if (!(0 | St[_ >> 2])) return (St[o >> 2] = 0), (O = 0 | St[o >> 2]), (pt = i), 0 | O
                    if (
                      ((b = 0 | St[(l = d) >> 2]),
                      (p = 0 | St[(l + 4) >> 2]),
                      (n = E),
                      (t = 0 | Dt(0 | St[(l = d) >> 2], 0 | St[(l + 4) >> 2], 0 | St[n >> 2], 0 | St[(n + 4) >> 2])),
                      (p >>> 0 > (n = Ft) >>> 0) | (((0 | p) == (0 | n)) & (t >>> 0 < b >>> 0)) ||
                        ((b = 0 | St[(t = d) >> 2]),
                        (n = 0 | St[(t + 4) >> 2]),
                        (p = E),
                        (l = 0 | Dt(0 | St[(t = d) >> 2], 0 | St[(t + 4) >> 2], 0 | St[p >> 2], 0 | St[(p + 4) >> 2])),
                        (p = 0 | Dt(0 | l, 0 | Ft, 32, 0)),
                        (n >>> 0 > (l = Ft) >>> 0) | (((0 | n) == (0 | l)) & (p >>> 0 < b >>> 0))))
                    )
                      return (St[o >> 2] = 17), (O = 0 | St[o >> 2]), (pt = i), 0 | O
                    if (
                      ((St[(p = k) >> 2] = 0),
                      (St[(p + 4) >> 2] = 0),
                      (p = 0 | nr[15 & St[(12 + (0 | St[u >> 2])) >> 2]](0 | St[u >> 2], k, 2)),
                      (St[F >> 2] = p),
                      0 | St[F >> 2])
                    )
                      return (St[o >> 2] = St[F >> 2]), (O = 0 | St[o >> 2]), (pt = i), 0 | O
                    if (
                      ((p = 0 | St[(F = k) >> 2]),
                      (b = 0 | St[(F + 4) >> 2]),
                      (l = d),
                      (n = 0 | Dt(0 | St[(F = c) >> 2], 0 | St[(F + 4) >> 2], 0 | St[l >> 2], 0 | St[(l + 4) >> 2])),
                      (b >>> 0 < (l = Ft) >>> 0) | (((0 | b) == (0 | l)) & (p >>> 0 < n >>> 0)) ||
                        ((p = 0 | St[(n = k) >> 2]),
                        (l = 0 | St[(n + 4) >> 2]),
                        (b = 0 | Dt(0 | St[(n = c) >> 2], 0 | St[(n + 4) >> 2], 32, 0)),
                        (F = 0 | Dt(0 | b, 0 | Ft, 0 | St[(n = d) >> 2], 0 | St[(n + 4) >> 2])),
                        (l >>> 0 < (n = Ft) >>> 0) | (((0 | l) == (0 | n)) & (p >>> 0 < F >>> 0))) ||
                        ((k = 0 | St[(F = k) >> 2]),
                        (p = 0 | St[(F + 4) >> 2]),
                        (n = 0 | Dt(0 | St[(F = c) >> 2], 0 | St[(F + 4) >> 2], 32, 0)),
                        (l = 0 | Dt(0 | n, 0 | Ft, 0 | St[(F = d) >> 2], 0 | St[(F + 4) >> 2])),
                        (E = 0 | Dt(0 | l, 0 | Ft, 0 | St[(F = E) >> 2], 0 | St[(F + 4) >> 2])),
                        (p >>> 0 < (F = Ft) >>> 0) | (((0 | p) == (0 | F)) & (k >>> 0 < E >>> 0))))
                    )
                      return (St[o >> 2] = 6), (O = 0 | St[o >> 2]), (pt = i), 0 | O
                    if (
                      ((E = 0 | St[u >> 2]),
                      (c = 0 | Dt(0 | St[(k = c) >> 2], 0 | St[(k + 4) >> 2], 32, 0)),
                      (d = 0 | Dt(0 | c, 0 | Ft, 0 | St[(k = d) >> 2], 0 | St[(k + 4) >> 2])),
                      (k = 0 | he(E, d, Ft)),
                      (St[w >> 2] = k),
                      0 | St[w >> 2])
                    )
                      return (St[o >> 2] = St[w >> 2]), (O = 0 | St[o >> 2]), (pt = i), 0 | O
                    if (!(0 | Ie(m, 0 | St[_ >> 2], 0 | St[f >> 2])))
                      return (St[o >> 2] = 2), (O = 0 | St[o >> 2]), (pt = i), 0 | O
                    ;(w =
                      0 |
                      (function (e, r, t) {
                        ;(e |= 0), (r |= 0), (t |= 0)
                        var n = 0,
                          i = 0,
                          o = 0,
                          a = 0
                        ;(0 | (pt = ((n = pt) + 16) | 0)) >= (0 | bt) && yt(16)
                        return (
                          (o = (n + 4) | 0),
                          (St[(i = ((a = n) + 8) | 0) >> 2] = e),
                          (St[o >> 2] = r),
                          (St[a >> 2] = t),
                          (t = 0 | pe(0 | St[i >> 2], 0 | St[o >> 2], 0 | St[a >> 2], 6)),
                          (pt = n),
                          0 | t
                        )
                      })(0 | St[u >> 2], 0 | St[m >> 2], 0 | St[_ >> 2])),
                      (St[h >> 2] = w)
                    do {
                      if (
                        0 == (0 | St[h >> 2]) &&
                        ((St[h >> 2] = 16), (0 | (w = 0 | Pe(0 | St[m >> 2], 0 | St[_ >> 2]))) == (0 | St[S >> 2]))
                      ) {
                        ;(St[y >> 2] = St[m >> 2]),
                          (St[(4 + y) >> 2] = St[(4 + m) >> 2]),
                          (w = 0 | ue(y, v)),
                          (St[h >> 2] = w),
                          (w = v)
                        do {
                          if ((0 == (0 | St[h >> 2])) & ((23 == (0 | St[w >> 2])) & (0 == (0 | St[(w + 4) >> 2])))) {
                            if (
                              (Ce(M),
                              (k = (32 + (0 | St[a >> 2])) | 0),
                              (d =
                                0 |
                                (function (e, r, t, n, i, o) {
                                  ;(e |= 0), (r |= 0), (t |= 0), (n |= 0), (i |= 0), (o |= 0)
                                  var a = 0,
                                    u = 0,
                                    s = 0,
                                    f = 0,
                                    l = 0,
                                    c = 0,
                                    d = 0,
                                    E = 0,
                                    _ = 0,
                                    S = 0,
                                    m = 0
                                  ;(0 | (pt = ((a = pt) + 80) | 0)) >= (0 | bt) && yt(80)
                                  return (
                                    (s = (a + 64) | 0),
                                    (f = (a + 60) | 0),
                                    (c = ((l = a) + 56) | 0),
                                    (d = (a + 24) | 0),
                                    (E = (a + 20) | 0),
                                    (_ = (a + 16) | 0),
                                    (S = (a + 12) | 0),
                                    (m = (a + 8) | 0),
                                    (St[(u = (a + 68) | 0) >> 2] = e),
                                    (St[s >> 2] = r),
                                    (St[f >> 2] = t),
                                    (St[(t = l) >> 2] = n),
                                    (St[(t + 4) >> 2] = i),
                                    (St[c >> 2] = o),
                                    (St[E >> 2] = 0),
                                    (St[_ >> 2] = 0),
                                    (St[S >> 2] = 0),
                                    q(d),
                                    (o = l),
                                    (l =
                                      0 |
                                      (function (e, r, t, n, i, o, a, u, s, f) {
                                        ;(e |= 0),
                                          (r |= 0),
                                          (t |= 0),
                                          (n |= 0),
                                          (i |= 0),
                                          (o |= 0),
                                          (a |= 0),
                                          (u |= 0),
                                          (s |= 0),
                                          (f |= 0)
                                        var l = 0,
                                          c = 0,
                                          d = 0,
                                          E = 0,
                                          _ = 0,
                                          S = 0,
                                          m = 0,
                                          h = 0,
                                          p = 0,
                                          b = 0,
                                          k = 0,
                                          F = 0,
                                          w = 0,
                                          y = 0,
                                          v = 0,
                                          M = 0,
                                          O = 0,
                                          A = 0,
                                          R = 0,
                                          g = 0
                                        ;(0 | (pt = ((l = pt) + 96) | 0)) >= (0 | bt) && yt(96)
                                        if (
                                          ((c = (l + 80) | 0),
                                          (E = (l + 72) | 0),
                                          (_ = (l + 68) | 0),
                                          (S = (l + 16) | 0),
                                          (m = (l + 64) | 0),
                                          (h = (l + 60) | 0),
                                          (p = (l + 56) | 0),
                                          (b = (l + 52) | 0),
                                          (k = (l + 48) | 0),
                                          (F = (l + 44) | 0),
                                          (w = (l + 8) | 0),
                                          (y = (l + 40) | 0),
                                          (M = ((v = l) + 36) | 0),
                                          (O = (l + 32) | 0),
                                          (A = (l + 28) | 0),
                                          (R = (l + 24) | 0),
                                          (St[(d = (l + 76) | 0) >> 2] = e),
                                          (St[E >> 2] = r),
                                          (St[_ >> 2] = t),
                                          (St[(t = S) >> 2] = n),
                                          (St[(t + 4) >> 2] = i),
                                          (St[m >> 2] = o),
                                          (St[h >> 2] = a),
                                          (St[p >> 2] = u),
                                          (St[b >> 2] = s),
                                          (St[k >> 2] = f),
                                          (St[F >> 2] = 0),
                                          (f =
                                            0 |
                                            se(
                                              0 | St[E >> 2],
                                              w,
                                              0 | St[m >> 2],
                                              F,
                                              0 | St[h >> 2],
                                              0 | St[p >> 2],
                                              0 | St[b >> 2],
                                              0 | St[k >> 2],
                                              0 | St[k >> 2]
                                            )),
                                          (St[O >> 2] = f),
                                          0 | St[O >> 2])
                                        )
                                          return (St[c >> 2] = St[O >> 2]), (g = 0 | St[c >> 2]), (pt = l), 0 | g
                                        if (
                                          ((O = S),
                                          (f =
                                            0 |
                                            Dt(
                                              0 | St[(S = w) >> 2],
                                              0 | St[(4 + S) >> 2],
                                              0 | St[O >> 2],
                                              0 | St[(O + 4) >> 2]
                                            )),
                                          (St[(O = w) >> 2] = f),
                                          (St[(O + 4) >> 2] = Ft),
                                          1 != (0 | St[(24 + (0 | St[m >> 2])) >> 2]))
                                        )
                                          return (St[c >> 2] = 16), (g = 0 | St[c >> 2]), (pt = l), 0 | g
                                        if (
                                          ((St[y >> 2] = St[(12 + (0 | St[m >> 2])) >> 2]),
                                          (O = 0 | G(0 | St[y >> 2])),
                                          (St[(f = v) >> 2] = O),
                                          (St[(f + 4) >> 2] = Ft),
                                          (f = w),
                                          (O = 0 | he(0 | St[d >> 2], 0 | St[f >> 2], 0 | St[(f + 4) >> 2])),
                                          (St[A >> 2] = O),
                                          0 | St[A >> 2])
                                        )
                                          return (St[c >> 2] = St[A >> 2]), (g = 0 | St[c >> 2]), (pt = l), 0 | g
                                        if (!(0 | Ie(0 | St[_ >> 2], 0 | St[v >> 2], 0 | St[k >> 2])))
                                          return (St[c >> 2] = 2), (g = 0 | St[c >> 2]), (pt = l), 0 | g
                                        if (
                                          ((A = w),
                                          (w =
                                            0 |
                                            Re(
                                              0 | St[y >> 2],
                                              0 | St[St[m >> 2] >> 2],
                                              0 | St[d >> 2],
                                              0 | St[A >> 2],
                                              0 | St[(A + 4) >> 2],
                                              0 | St[St[_ >> 2] >> 2],
                                              0 | St[v >> 2],
                                              0 | St[k >> 2],
                                              0,
                                              0
                                            )),
                                          (St[M >> 2] = w),
                                          (St[R >> 2] = St[M >> 2]),
                                          0 | St[R >> 2])
                                        )
                                          return (St[c >> 2] = St[R >> 2]), (g = 0 | St[c >> 2]), (pt = l), 0 | g
                                        if (
                                          0 | St[(28 + (0 | St[y >> 2])) >> 2] &&
                                          (0 | (R = 0 | Pe(0 | St[St[_ >> 2] >> 2], 0 | St[v >> 2]))) !=
                                            (0 | St[(32 + (0 | St[y >> 2])) >> 2])
                                        )
                                          return (St[c >> 2] = 3), (g = 0 | St[c >> 2]), (pt = l), 0 | g
                                        return (St[c >> 2] = 0), (g = 0 | St[c >> 2]), (pt = l), 0 | g
                                      })(
                                        0 | St[u >> 2],
                                        0 | St[s >> 2],
                                        0 | St[f >> 2],
                                        0 | St[o >> 2],
                                        0 | St[(o + 4) >> 2],
                                        d,
                                        E,
                                        _,
                                        S,
                                        0 | St[c >> 2]
                                      )),
                                    (St[m >> 2] = l),
                                    Z(d, 0 | St[c >> 2]),
                                    or[3 & St[(4 + (0 | St[c >> 2])) >> 2]](0 | St[c >> 2], 0 | St[E >> 2]),
                                    or[3 & St[(4 + (0 | St[c >> 2])) >> 2]](0 | St[c >> 2], 0 | St[_ >> 2]),
                                    or[3 & St[(4 + (0 | St[c >> 2])) >> 2]](0 | St[c >> 2], 0 | St[S >> 2]),
                                    (pt = a),
                                    0 | St[m >> 2]
                                  )
                                })(0 | St[u >> 2], y, M, 0 | St[k >> 2], 0 | St[(k + 4) >> 2], 0 | St[f >> 2])),
                              (St[h >> 2] = d),
                              (d = 0 | St[f >> 2]),
                              0 | St[h >> 2])
                            ) {
                              Le(M, d)
                              break
                            }
                            Le(m, d),
                              (St[m >> 2] = St[M >> 2]),
                              (St[(4 + m) >> 2] = St[(4 + M) >> 2]),
                              (St[y >> 2] = St[m >> 2]),
                              (St[(4 + y) >> 2] = St[(4 + m) >> 2]),
                              (d = 0 | ue(y, v)),
                              (St[h >> 2] = d)
                            break
                          }
                        } while (0)
                        if (0 | St[h >> 2]) break
                        if ((1 == (0 | St[(w = v) >> 2])) & (0 == (0 | St[(w + 4) >> 2]))) {
                          ;(w =
                            0 |
                            (function (e, r, t, n) {
                              ;(e |= 0), (r |= 0), (t |= 0), (n |= 0)
                              var i = 0,
                                o = 0,
                                a = 0,
                                u = 0,
                                s = 0,
                                f = 0,
                                l = 0,
                                c = 0,
                                d = 0,
                                E = 0,
                                _ = 0,
                                S = 0
                              ;(0 | (pt = ((i = pt) + 48) | 0)) >= (0 | bt) && yt(48)
                              return (
                                (a = (i + 36) | 0),
                                (u = (i + 32) | 0),
                                (s = (i + 28) | 0),
                                (f = (i + 24) | 0),
                                (l = (i + 20) | 0),
                                (c = (i + 16) | 0),
                                (d = (i + 12) | 0),
                                (E = (i + 8) | 0),
                                (_ = (i + 4) | 0),
                                (St[(o = ((S = i) + 40) | 0) >> 2] = e),
                                (St[a >> 2] = r),
                                (St[u >> 2] = t),
                                (St[s >> 2] = n),
                                (St[f >> 2] = 0),
                                (St[l >> 2] = 0),
                                (St[c >> 2] = 0),
                                (St[d >> 2] = 0),
                                (St[E >> 2] = 0),
                                (St[_ >> 2] = 0),
                                (n =
                                  0 |
                                  (function (e, r, t, n, i, o, a, u, s, f) {
                                    ;(e |= 0),
                                      (r |= 0),
                                      (t |= 0),
                                      (n |= 0),
                                      (i |= 0),
                                      (o |= 0),
                                      (a |= 0),
                                      (u |= 0),
                                      (s |= 0),
                                      (f |= 0)
                                    var l = 0,
                                      c = 0,
                                      d = 0,
                                      E = 0,
                                      _ = 0,
                                      S = 0,
                                      m = 0,
                                      h = 0,
                                      p = 0,
                                      b = 0,
                                      k = 0,
                                      F = 0,
                                      w = 0,
                                      y = 0,
                                      v = 0,
                                      M = 0,
                                      O = 0,
                                      A = 0,
                                      R = 0,
                                      g = 0,
                                      T = 0,
                                      N = 0,
                                      D = 0,
                                      P = 0,
                                      C = 0,
                                      I = 0,
                                      L = 0,
                                      x = 0,
                                      B = 0,
                                      H = 0,
                                      U = 0,
                                      z = 0,
                                      Y = 0,
                                      V = 0,
                                      K = 0,
                                      W = 0,
                                      j = 0,
                                      X = 0,
                                      G = 0,
                                      q = 0,
                                      Q = 0,
                                      Z = 0,
                                      J = 0,
                                      $ = 0,
                                      ee = 0,
                                      re = 0,
                                      te = 0,
                                      ne = 0,
                                      ie = 0,
                                      oe = 0,
                                      ae = 0
                                    ;(0 | (pt = ((l = pt) + 208) | 0)) >= (0 | bt) && yt(208)
                                    if (
                                      ((c = (l + 188) | 0),
                                      (E = (l + 180) | 0),
                                      (_ = (l + 176) | 0),
                                      (S = (l + 172) | 0),
                                      (m = (l + 168) | 0),
                                      (h = (l + 164) | 0),
                                      (p = (l + 160) | 0),
                                      (b = (l + 156) | 0),
                                      (k = (l + 152) | 0),
                                      (F = (l + 148) | 0),
                                      (w = (l + 8) | 0),
                                      (y = (l + 144) | 0),
                                      (v = (l + 140) | 0),
                                      (M = (l + 136) | 0),
                                      (O = (l + 132) | 0),
                                      (A = (l + 128) | 0),
                                      (R = (l + 124) | 0),
                                      (g = (l + 120) | 0),
                                      (T = (l + 116) | 0),
                                      (N = (l + 112) | 0),
                                      (D = (l + 108) | 0),
                                      (P = (l + 104) | 0),
                                      (I = ((C = l) + 100) | 0),
                                      (L = (l + 96) | 0),
                                      (x = (l + 92) | 0),
                                      (B = (l + 88) | 0),
                                      (H = (l + 84) | 0),
                                      (U = (l + 80) | 0),
                                      (z = (l + 76) | 0),
                                      (Y = (l + 72) | 0),
                                      (V = (l + 68) | 0),
                                      (K = (l + 64) | 0),
                                      (W = (l + 60) | 0),
                                      (j = (l + 56) | 0),
                                      (X = (l + 193) | 0),
                                      (G = (l + 52) | 0),
                                      (q = (l + 48) | 0),
                                      (Q = (l + 44) | 0),
                                      (Z = (l + 40) | 0),
                                      (J = (l + 192) | 0),
                                      ($ = (l + 36) | 0),
                                      (ee = (l + 32) | 0),
                                      (re = (l + 28) | 0),
                                      (te = (l + 24) | 0),
                                      (ne = (l + 20) | 0),
                                      (ie = (l + 16) | 0),
                                      (St[(d = (l + 184) | 0) >> 2] = e),
                                      (St[E >> 2] = r),
                                      (St[_ >> 2] = t),
                                      (St[S >> 2] = n),
                                      (St[m >> 2] = i),
                                      (St[h >> 2] = o),
                                      (St[p >> 2] = a),
                                      (St[b >> 2] = u),
                                      (St[k >> 2] = s),
                                      (St[F >> 2] = f),
                                      (St[y >> 2] = 0),
                                      (St[v >> 2] = 0),
                                      (St[M >> 2] = 0),
                                      (St[O >> 2] = 0),
                                      (f = 0 | ue(0 | St[E >> 2], w)),
                                      (St[R >> 2] = f),
                                      0 | St[R >> 2])
                                    )
                                      return (St[c >> 2] = St[R >> 2]), (oe = 0 | St[c >> 2]), (pt = l), 0 | oe
                                    if ((2 == (0 | St[(R = w) >> 2])) & (0 == (0 | St[(R + 4) >> 2]))) {
                                      if (
                                        ((R =
                                          0 |
                                          (function (e) {
                                            e |= 0
                                            var r = 0,
                                              t = 0,
                                              n = 0,
                                              i = 0,
                                              o = 0,
                                              a = 0,
                                              u = 0
                                            ;(0 | (pt = ((r = pt) + 32) | 0)) >= (0 | bt) && yt(32)
                                            ;(t = (r + 16) | 0),
                                              (o = ((i = r) + 8) | 0),
                                              (St[(n = (r + 12) | 0) >> 2] = e)
                                            for (;;) {
                                              if (((e = 0 | ue(0 | St[n >> 2], i)), (St[o >> 2] = e), 0 | St[o >> 2])) {
                                                a = 3
                                                break
                                              }
                                              if ((0 == (0 | St[(e = i) >> 2])) & (0 == (0 | St[(e + 4) >> 2]))) {
                                                a = 6
                                                break
                                              }
                                              me(0 | St[n >> 2])
                                            }
                                            {
                                              if (3 == (0 | a))
                                                return (St[t >> 2] = St[o >> 2]), (u = 0 | St[t >> 2]), (pt = r), 0 | u
                                              if (6 == (0 | a))
                                                return (St[t >> 2] = 0), (u = 0 | St[t >> 2]), (pt = r), 0 | u
                                            }
                                            return 0
                                          })(0 | St[E >> 2])),
                                        (St[g >> 2] = R),
                                        0 | St[g >> 2])
                                      )
                                        return (St[c >> 2] = St[g >> 2]), (oe = 0 | St[c >> 2]), (pt = l), 0 | oe
                                      if (((g = 0 | ue(0 | St[E >> 2], w)), (St[T >> 2] = g), 0 | St[T >> 2]))
                                        return (St[c >> 2] = St[T >> 2]), (oe = 0 | St[c >> 2]), (pt = l), 0 | oe
                                    }
                                    if ((4 == (0 | St[(T = w) >> 2])) & (0 == (0 | St[(T + 4) >> 2]))) {
                                      if (
                                        ((T =
                                          0 |
                                          se(
                                            0 | St[E >> 2],
                                            (40 + (0 | St[d >> 2])) | 0,
                                            0 | St[d >> 2],
                                            y,
                                            0 | St[_ >> 2],
                                            0 | St[S >> 2],
                                            0 | St[m >> 2],
                                            0 | St[k >> 2],
                                            0 | St[F >> 2]
                                          )),
                                        (St[N >> 2] = T),
                                        0 | St[N >> 2])
                                      )
                                        return (St[c >> 2] = St[N >> 2]), (oe = 0 | St[c >> 2]), (pt = l), 0 | oe
                                      if (
                                        ((N = (32 + (0 | St[d >> 2])) | 0),
                                        (T = (40 + (0 | St[d >> 2])) | 0),
                                        (g =
                                          0 |
                                          Dt(
                                            0 | St[(y = T) >> 2],
                                            0 | St[(y + 4) >> 2],
                                            0 | St[N >> 2],
                                            0 | St[(N + 4) >> 2]
                                          )),
                                        (St[(N = T) >> 2] = g),
                                        (St[(N + 4) >> 2] = Ft),
                                        (N = 0 | ue(0 | St[E >> 2], w)),
                                        (St[D >> 2] = N),
                                        0 | St[D >> 2])
                                      )
                                        return (St[c >> 2] = St[D >> 2]), (oe = 0 | St[c >> 2]), (pt = l), 0 | oe
                                    }
                                    if ((0 == (0 | St[(D = w) >> 2])) & (0 == (0 | St[(D + 4) >> 2])))
                                      return (St[c >> 2] = 0), (oe = 0 | St[c >> 2]), (pt = l), 0 | oe
                                    if ((5 != (0 | St[(D = w) >> 2])) | (0 != (0 | St[(D + 4) >> 2])))
                                      return (St[c >> 2] = 16), (oe = 0 | St[c >> 2]), (pt = l), 0 | oe
                                    if (((D = 0 | fe(0 | St[E >> 2], v)), (St[P >> 2] = D), 0 | St[P >> 2]))
                                      return (St[c >> 2] = St[P >> 2]), (oe = 0 | St[c >> 2]), (pt = l), 0 | oe
                                    if (((St[(28 + (0 | St[d >> 2])) >> 2] = St[v >> 2]), 0 | St[v >> 2])) {
                                      if (
                                        ((P = 0 | sr[3 & St[St[k >> 2] >> 2]](0 | St[k >> 2], St[v >> 2] << 5)),
                                        !(St[M >> 2] = P))
                                      )
                                        return (St[c >> 2] = 2), (oe = 0 | St[c >> 2]), (pt = l), 0 | oe
                                    } else St[M >> 2] = 0
                                    ;(St[(16 + (0 | St[d >> 2])) >> 2] = St[M >> 2]), (St[A >> 2] = 0)
                                    for (; !((0 | St[A >> 2]) >>> 0 >= (0 | St[v >> 2]) >>> 0); )
                                      !(function (e) {
                                        e |= 0
                                        var r = 0,
                                          t = 0
                                        ;(0 | (pt = ((r = pt) + 16) | 0)) >= (0 | bt) && yt(16),
                                          (St[(t = r) >> 2] = e),
                                          (Et[(24 + (0 | St[t >> 2])) >> 0] = 1),
                                          (Et[(25 + (0 | St[t >> 2])) >> 0] = 0),
                                          (Et[(26 + (0 | St[t >> 2])) >> 0] = 0),
                                          (Et[(27 + (0 | St[t >> 2])) >> 0] = 0),
                                          (Et[(28 + (0 | St[t >> 2])) >> 0] = 0),
                                          (pt = r)
                                      })(((0 | St[M >> 2]) + (St[A >> 2] << 5)) | 0),
                                        (St[A >> 2] = 1 + (0 | St[A >> 2]))
                                    e: for (;;) {
                                      if (((P = 0 | ue(0 | St[E >> 2], w)), (St[I >> 2] = P), 0 | St[I >> 2])) {
                                        ae = 27
                                        break
                                      }
                                      if ((0 == (0 | St[(P = w) >> 2])) & (0 == (0 | St[(P + 4) >> 2]))) {
                                        ae = 86
                                        break
                                      }
                                      if (((P = 0 | le(0 | St[E >> 2], C)), (St[L >> 2] = P), 0 | St[L >> 2])) {
                                        ae = 30
                                        break
                                      }
                                      if (
                                        (0 < (D = 0 | St[((P = C) + 4) >> 2]) >>> 0) |
                                        (0 == (0 | D)
                                          ? (0 | St[P >> 2]) >>> 0 > (0 | St[(4 + (0 | St[E >> 2])) >> 2]) >>> 0
                                          : 0)
                                      ) {
                                        ae = 32
                                        break
                                      }
                                      if (
                                        (0 | (P = 0 | St[w >> 2])) == (0 | St[(D = w) >> 2]) &&
                                        (((((0 | P) < 0) << 31) >> 31) | 0) == (0 | St[(D + 4) >> 2])
                                      )
                                        switch (0 | St[w >> 2]) {
                                          case 17:
                                            if (((P = 0 | de(0 | St[E >> 2])), (St[H >> 2] = P), 0 | St[H >> 2])) {
                                              ae = 38
                                              break e
                                            }
                                            if (((St[B >> 2] = (0 | St[C >> 2]) - 1), (1 & St[B >> 2]) | 0)) {
                                              ae = 40
                                              break e
                                            }
                                            if (
                                              !(0 | Ie((68 + (0 | St[d >> 2])) | 0, 0 | St[B >> 2], 0 | St[k >> 2]))
                                            ) {
                                              ae = 42
                                              break e
                                            }
                                            if ((1 + (0 | St[v >> 2])) | 0) {
                                              if (
                                                ((P =
                                                  0 |
                                                  sr[3 & St[St[k >> 2] >> 2]](
                                                    0 | St[k >> 2],
                                                    (1 + (0 | St[v >> 2])) << 2
                                                  )),
                                                !(St[(64 + (0 | St[d >> 2])) >> 2] = P))
                                              ) {
                                                ae = 46
                                                break e
                                              }
                                            } else St[(64 + (0 | St[d >> 2])) >> 2] = 0
                                            if (
                                              (Je(
                                                0 | St[(68 + (0 | St[d >> 2])) >> 2],
                                                0 | St[St[E >> 2] >> 2],
                                                0 | St[B >> 2]
                                              ),
                                              (P =
                                                0 |
                                                (function (e, r, t, n) {
                                                  ;(e |= 0), (r |= 0), (t |= 0), (n |= 0)
                                                  var i = 0,
                                                    o = 0,
                                                    a = 0,
                                                    u = 0,
                                                    s = 0,
                                                    f = 0,
                                                    l = 0,
                                                    c = 0,
                                                    d = 0,
                                                    E = 0
                                                  ;(0 | (pt = ((i = pt) + 32) | 0)) >= (0 | bt) && yt(32)
                                                  ;(o = (i + 24) | 0),
                                                    (u = (i + 16) | 0),
                                                    (s = (i + 12) | 0),
                                                    (f = (i + 8) | 0),
                                                    (l = (i + 4) | 0),
                                                    (St[(a = ((c = i) + 20) | 0) >> 2] = e),
                                                    (St[u >> 2] = r),
                                                    (St[s >> 2] = t),
                                                    (St[f >> 2] = n),
                                                    (St[c >> 2] = 0),
                                                    (St[l >> 2] = 0)
                                                  r: for (;;) {
                                                    if (
                                                      ((n = (0 | St[l >> 2]) >>> 0 < (0 | St[s >> 2]) >>> 0),
                                                      (St[((0 | St[f >> 2]) + (St[l >> 2] << 2)) >> 2] = St[c >> 2]),
                                                      !n)
                                                    ) {
                                                      d = 9
                                                      break
                                                    }
                                                    for (;;) {
                                                      if ((0 | St[c >> 2]) >>> 0 >= (0 | St[u >> 2]) >>> 0) {
                                                        d = 4
                                                        break r
                                                      }
                                                      if (
                                                        0 == (0 | mt[((0 | St[a >> 2]) + (St[c >> 2] << 1)) >> 0]) &&
                                                        0 == (0 | mt[((0 | St[a >> 2]) + (1 + (St[c >> 2] << 1))) >> 0])
                                                      )
                                                        break
                                                      St[c >> 2] = 1 + (0 | St[c >> 2])
                                                    }
                                                    ;(St[c >> 2] = 1 + (0 | St[c >> 2])),
                                                      (St[l >> 2] = 1 + (0 | St[l >> 2]))
                                                  }
                                                  {
                                                    if (4 == (0 | d))
                                                      return (St[o >> 2] = 16), (E = 0 | St[o >> 2]), (pt = i), 0 | E
                                                    if (9 == (0 | d))
                                                      return (
                                                        (St[o >> 2] = (0 | St[c >> 2]) == (0 | St[u >> 2]) ? 0 : 16),
                                                        (E = 0 | St[o >> 2]),
                                                        (pt = i),
                                                        0 | E
                                                      )
                                                  }
                                                  return 0
                                                })(
                                                  0 | St[St[E >> 2] >> 2],
                                                  (0 | St[B >> 2]) >>> 1,
                                                  0 | St[v >> 2],
                                                  0 | St[(64 + (0 | St[d >> 2])) >> 2]
                                                )),
                                              (St[U >> 2] = P),
                                              0 | St[U >> 2])
                                            ) {
                                              ae = 48
                                              break e
                                            }
                                            if (
                                              ((P = 0 | ce(0 | St[E >> 2], 0 | St[B >> 2], 0)),
                                              (St[z >> 2] = P),
                                              0 | St[z >> 2])
                                            ) {
                                              ae = 50
                                              break e
                                            }
                                            continue e
                                          case 14:
                                            if (
                                              ((P =
                                                0 | Ee(0 | St[E >> 2], 0 | St[v >> 2], 0 | St[h >> 2], 0 | St[F >> 2])),
                                              (St[Y >> 2] = P),
                                              0 | St[Y >> 2])
                                            ) {
                                              ae = 52
                                              break e
                                            }
                                            for (St[O >> 2] = 0, St[A >> 2] = 0; ; ) {
                                              if ((0 | St[A >> 2]) >>> 0 >= (0 | St[v >> 2]) >>> 0) continue e
                                              0 | Et[((0 | St[St[h >> 2] >> 2]) + (0 | St[A >> 2])) >> 0] &&
                                                (St[O >> 2] = 1 + (0 | St[O >> 2])),
                                                (St[A >> 2] = 1 + (0 | St[A >> 2]))
                                            }
                                            break
                                          case 15:
                                            if (
                                              ((P =
                                                0 | Ee(0 | St[E >> 2], 0 | St[O >> 2], 0 | St[p >> 2], 0 | St[F >> 2])),
                                              (St[V >> 2] = P),
                                              0 | St[V >> 2])
                                            ) {
                                              ae = 59
                                              break e
                                            }
                                            continue e
                                          case 21:
                                            if (
                                              ((P =
                                                0 | _e(0 | St[E >> 2], 0 | St[v >> 2], 0 | St[b >> 2], 0 | St[F >> 2])),
                                              (St[K >> 2] = P),
                                              0 | St[K >> 2])
                                            ) {
                                              ae = 61
                                              break e
                                            }
                                            if (((P = 0 | de(0 | St[E >> 2])), (St[W >> 2] = P), 0 | St[W >> 2])) {
                                              ae = 63
                                              break e
                                            }
                                            for (
                                              St[A >> 2] = 0;
                                              !((0 | St[A >> 2]) >>> 0 >= (0 | St[v >> 2]) >>> 0);

                                            ) {
                                              if (
                                                ((St[j >> 2] = (0 | St[M >> 2]) + (St[A >> 2] << 5)),
                                                (Et[X >> 0] =
                                                  0 | Et[((0 | St[St[b >> 2] >> 2]) + (0 | St[A >> 2])) >> 0]),
                                                (Et[(29 + (0 | St[j >> 2])) >> 0] = 0 | Et[X >> 0]),
                                                (St[(20 + (0 | St[j >> 2])) >> 2] = 0) | Et[X >> 0] &&
                                                  ((P = 0 | Se(0 | St[E >> 2], (20 + (0 | St[j >> 2])) | 0)),
                                                  (St[G >> 2] = P),
                                                  0 | St[G >> 2]))
                                              ) {
                                                ae = 68
                                                break e
                                              }
                                              St[A >> 2] = 1 + (0 | St[A >> 2])
                                            }
                                            or[3 & St[(4 + (0 | St[F >> 2])) >> 2]](
                                              0 | St[F >> 2],
                                              0 | St[St[b >> 2] >> 2]
                                            ),
                                              (St[St[b >> 2] >> 2] = 0)
                                            continue e
                                          case 20:
                                            if (
                                              ((P =
                                                0 | _e(0 | St[E >> 2], 0 | St[v >> 2], 0 | St[b >> 2], 0 | St[F >> 2])),
                                              (St[q >> 2] = P),
                                              0 | St[q >> 2])
                                            ) {
                                              ae = 72
                                              break e
                                            }
                                            if (((P = 0 | de(0 | St[E >> 2])), (St[Q >> 2] = P), 0 | St[Q >> 2])) {
                                              ae = 74
                                              break e
                                            }
                                            for (
                                              St[A >> 2] = 0;
                                              !((0 | St[A >> 2]) >>> 0 >= (0 | St[v >> 2]) >>> 0);

                                            ) {
                                              if (
                                                ((St[Z >> 2] = (0 | St[M >> 2]) + (St[A >> 2] << 5)),
                                                (Et[J >> 0] =
                                                  0 | Et[((0 | St[St[b >> 2] >> 2]) + (0 | St[A >> 2])) >> 0]),
                                                (Et[(28 + (0 | St[Z >> 2])) >> 0] = 0 | Et[J >> 0]),
                                                (St[(4 + (0 | St[Z >> 2])) >> 2] = 0),
                                                (St[St[Z >> 2] >> 2] = 0) | Et[J >> 0])
                                              ) {
                                                if (
                                                  ((P = 0 | Se(0 | St[E >> 2], 0 | St[Z >> 2])),
                                                  (St[$ >> 2] = P),
                                                  0 | St[$ >> 2])
                                                ) {
                                                  ae = 79
                                                  break e
                                                }
                                                if (
                                                  ((P = 0 | Se(0 | St[E >> 2], (4 + (0 | St[Z >> 2])) | 0)),
                                                  (St[ee >> 2] = P),
                                                  0 | St[ee >> 2])
                                                ) {
                                                  ae = 81
                                                  break e
                                                }
                                              }
                                              St[A >> 2] = 1 + (0 | St[A >> 2])
                                            }
                                            or[3 & St[(4 + (0 | St[F >> 2])) >> 2]](
                                              0 | St[F >> 2],
                                              0 | St[St[b >> 2] >> 2]
                                            ),
                                              (St[St[b >> 2] >> 2] = 0)
                                            continue e
                                          default:
                                            if (
                                              ((P = C),
                                              (D = 0 | ce(0 | St[E >> 2], 0 | St[P >> 2], 0 | St[(P + 4) >> 2])),
                                              (St[re >> 2] = D),
                                              0 | St[re >> 2])
                                            ) {
                                              ae = 85
                                              break e
                                            }
                                            continue e
                                        }
                                      else if (
                                        ((D = C),
                                        (P = 0 | ce(0 | St[E >> 2], 0 | St[D >> 2], 0 | St[(D + 4) >> 2])),
                                        (St[x >> 2] = P),
                                        0 | St[x >> 2])
                                      ) {
                                        ae = 35
                                        break
                                      }
                                    }
                                    switch (0 | ae) {
                                      case 27:
                                        return (St[c >> 2] = St[I >> 2]), (oe = 0 | St[c >> 2]), (pt = l), 0 | oe
                                      case 30:
                                        return (St[c >> 2] = St[L >> 2]), (oe = 0 | St[c >> 2]), (pt = l), 0 | oe
                                      case 32:
                                        return (St[c >> 2] = 16), (oe = 0 | St[c >> 2]), (pt = l), 0 | oe
                                      case 35:
                                        return (St[c >> 2] = St[x >> 2]), (oe = 0 | St[c >> 2]), (pt = l), 0 | oe
                                      case 38:
                                        return (St[c >> 2] = St[H >> 2]), (oe = 0 | St[c >> 2]), (pt = l), 0 | oe
                                      case 40:
                                        return (St[c >> 2] = 16), (oe = 0 | St[c >> 2]), (pt = l), 0 | oe
                                      case 42:
                                      case 46:
                                        return (St[c >> 2] = 2), (oe = 0 | St[c >> 2]), (pt = l), 0 | oe
                                      case 48:
                                        return (St[c >> 2] = St[U >> 2]), (oe = 0 | St[c >> 2]), (pt = l), 0 | oe
                                      case 50:
                                        return (St[c >> 2] = St[z >> 2]), (oe = 0 | St[c >> 2]), (pt = l), 0 | oe
                                      case 52:
                                        return (St[c >> 2] = St[Y >> 2]), (oe = 0 | St[c >> 2]), (pt = l), 0 | oe
                                      case 59:
                                        return (St[c >> 2] = St[V >> 2]), (oe = 0 | St[c >> 2]), (pt = l), 0 | oe
                                      case 61:
                                        return (St[c >> 2] = St[K >> 2]), (oe = 0 | St[c >> 2]), (pt = l), 0 | oe
                                      case 63:
                                        return (St[c >> 2] = St[W >> 2]), (oe = 0 | St[c >> 2]), (pt = l), 0 | oe
                                      case 68:
                                        return (St[c >> 2] = St[G >> 2]), (oe = 0 | St[c >> 2]), (pt = l), 0 | oe
                                      case 72:
                                        return (St[c >> 2] = St[q >> 2]), (oe = 0 | St[c >> 2]), (pt = l), 0 | oe
                                      case 74:
                                        return (St[c >> 2] = St[Q >> 2]), (oe = 0 | St[c >> 2]), (pt = l), 0 | oe
                                      case 79:
                                        return (St[c >> 2] = St[$ >> 2]), (oe = 0 | St[c >> 2]), (pt = l), 0 | oe
                                      case 81:
                                        return (St[c >> 2] = St[ee >> 2]), (oe = 0 | St[c >> 2]), (pt = l), 0 | oe
                                      case 85:
                                        return (St[c >> 2] = St[re >> 2]), (oe = 0 | St[c >> 2]), (pt = l), 0 | oe
                                      case 86:
                                        for (
                                          St[te >> 2] = 0, St[ne >> 2] = 0, St[A >> 2] = 0;
                                          !((0 | St[A >> 2]) >>> 0 >= (0 | St[v >> 2]) >>> 0);

                                        )
                                          (St[ie >> 2] = (0 | St[M >> 2]) + (St[A >> 2] << 5)),
                                            (Et[(26 + (0 | St[ie >> 2])) >> 0] = 0) | St[St[h >> 2] >> 2]
                                              ? (Et[(24 + (0 | St[ie >> 2])) >> 0] =
                                                  0 | mt[((0 | St[St[h >> 2] >> 2]) + (0 | St[A >> 2])) >> 0] ? 0 : 1)
                                              : (Et[(24 + (0 | St[ie >> 2])) >> 0] = 1),
                                            0 | Et[(24 + (0 | St[ie >> 2])) >> 0]
                                              ? ((Et[(25 + (0 | St[ie >> 2])) >> 0] = 0),
                                                (re = ((0 | St[St[_ >> 2] >> 2]) + (St[ne >> 2] << 3)) | 0),
                                                (ee = 0 | St[(re + 4) >> 2]),
                                                ($ = (8 + (0 | St[ie >> 2])) | 0),
                                                (St[$ >> 2] = St[re >> 2]),
                                                (St[($ + 4) >> 2] = ee),
                                                (St[(16 + (0 | St[ie >> 2])) >> 2] =
                                                  St[((0 | St[St[m >> 2] >> 2]) + (St[ne >> 2] << 2)) >> 2]),
                                                (Et[(27 + (0 | St[ie >> 2])) >> 0] =
                                                  0 | Et[((0 | St[St[S >> 2] >> 2]) + (0 | St[ne >> 2])) >> 0]),
                                                (St[ne >> 2] = 1 + (0 | St[ne >> 2])))
                                              : (0 | St[St[p >> 2] >> 2]
                                                  ? (Et[(25 + (0 | St[ie >> 2])) >> 0] =
                                                      0 | mt[((0 | St[St[p >> 2] >> 2]) + (0 | St[te >> 2])) >> 0]
                                                        ? 0
                                                        : 1)
                                                  : (Et[(25 + (0 | St[ie >> 2])) >> 0] = 1),
                                                (St[te >> 2] = 1 + (0 | St[te >> 2])),
                                                (ee = (8 + (0 | St[ie >> 2])) | 0),
                                                (St[ee >> 2] = 0),
                                                (St[(ee + 4) >> 2] = 0),
                                                (St[(16 + (0 | St[ie >> 2])) >> 2] = 0),
                                                (Et[(27 + (0 | St[ie >> 2])) >> 0] = 0)),
                                            (St[A >> 2] = 1 + (0 | St[A >> 2]))
                                        return (
                                          (A =
                                            0 |
                                            (function (e, r) {
                                              ;(e |= 0), (r |= 0)
                                              var t = 0,
                                                n = 0,
                                                i = 0,
                                                o = 0,
                                                a = 0,
                                                u = 0,
                                                s = 0,
                                                f = 0,
                                                l = 0,
                                                c = 0,
                                                d = 0,
                                                E = 0,
                                                _ = 0
                                              ;(0 | (pt = ((t = pt) + 48) | 0)) >= (0 | bt) && yt(48)
                                              if (
                                                ((n = (t + 40) | 0),
                                                (o = (t + 32) | 0),
                                                (a = (t + 28) | 0),
                                                (s = ((u = t) + 24) | 0),
                                                (f = (t + 20) | 0),
                                                (l = (t + 16) | 0),
                                                (c = (t + 12) | 0),
                                                (d = (t + 8) | 0),
                                                (St[(i = (t + 36) | 0) >> 2] = e),
                                                (St[o >> 2] = r),
                                                (St[a >> 2] = 0),
                                                (St[(r = u) >> 2] = 0),
                                                (St[(r + 4) >> 2] = 0),
                                                (St[f >> 2] = 0),
                                                (St[l >> 2] = 0),
                                                0 | St[(24 + (0 | St[i >> 2])) >> 2])
                                              ) {
                                                if (
                                                  ((r =
                                                    0 |
                                                    sr[3 & St[St[o >> 2] >> 2]](
                                                      0 | St[o >> 2],
                                                      St[(24 + (0 | St[i >> 2])) >> 2] << 2
                                                    )),
                                                  !(St[(48 + (0 | St[i >> 2])) >> 2] = r))
                                                )
                                                  return (St[n >> 2] = 2), (E = 0 | St[n >> 2]), (pt = t), 0 | E
                                              } else St[(48 + (0 | St[i >> 2])) >> 2] = 0
                                              St[s >> 2] = 0
                                              for (
                                                ;
                                                !(
                                                  (0 | St[s >> 2]) >>> 0 >=
                                                  (0 | St[(24 + (0 | St[i >> 2])) >> 2]) >>> 0
                                                );

                                              )
                                                (St[((0 | St[(48 + (0 | St[i >> 2])) >> 2]) + (St[s >> 2] << 2)) >> 2] =
                                                  St[a >> 2]),
                                                  (St[a >> 2] =
                                                    (0 | St[a >> 2]) +
                                                    (0 |
                                                      St[
                                                        ((0 | St[(12 + (0 | St[i >> 2])) >> 2]) +
                                                          ((40 * (0 | St[s >> 2])) | 0) +
                                                          24) >>
                                                          2
                                                      ])),
                                                  (St[s >> 2] = 1 + (0 | St[s >> 2]))
                                              if (0 | St[(20 + (0 | St[i >> 2])) >> 2]) {
                                                if (
                                                  ((a =
                                                    0 |
                                                    sr[3 & St[St[o >> 2] >> 2]](
                                                      0 | St[o >> 2],
                                                      St[(20 + (0 | St[i >> 2])) >> 2] << 3
                                                    )),
                                                  !(St[(52 + (0 | St[i >> 2])) >> 2] = a))
                                                )
                                                  return (St[n >> 2] = 2), (E = 0 | St[n >> 2]), (pt = t), 0 | E
                                              } else St[(52 + (0 | St[i >> 2])) >> 2] = 0
                                              St[s >> 2] = 0
                                              for (
                                                ;
                                                !(
                                                  (0 | St[s >> 2]) >>> 0 >=
                                                  (0 | St[(20 + (0 | St[i >> 2])) >> 2]) >>> 0
                                                );

                                              )
                                                (r = 0 | St[((a = u) + 4) >> 2]),
                                                  (e =
                                                    ((0 | St[(52 + (0 | St[i >> 2])) >> 2]) + (St[s >> 2] << 3)) | 0),
                                                  (St[e >> 2] = St[a >> 2]),
                                                  (St[(e + 4) >> 2] = r),
                                                  (r = ((0 | St[St[i >> 2] >> 2]) + (St[s >> 2] << 3)) | 0),
                                                  (a =
                                                    0 |
                                                    Dt(
                                                      0 | St[(e = u) >> 2],
                                                      0 | St[(e + 4) >> 2],
                                                      0 | St[r >> 2],
                                                      0 | St[(r + 4) >> 2]
                                                    )),
                                                  (St[(r = u) >> 2] = a),
                                                  (St[(r + 4) >> 2] = Ft),
                                                  (St[s >> 2] = 1 + (0 | St[s >> 2]))
                                              if (0 | St[(24 + (0 | St[i >> 2])) >> 2]) {
                                                if (
                                                  ((u =
                                                    0 |
                                                    sr[3 & St[St[o >> 2] >> 2]](
                                                      0 | St[o >> 2],
                                                      St[(24 + (0 | St[i >> 2])) >> 2] << 2
                                                    )),
                                                  !(St[(56 + (0 | St[i >> 2])) >> 2] = u))
                                                )
                                                  return (St[n >> 2] = 2), (E = 0 | St[n >> 2]), (pt = t), 0 | E
                                              } else St[(56 + (0 | St[i >> 2])) >> 2] = 0
                                              if (0 | St[(28 + (0 | St[i >> 2])) >> 2]) {
                                                if (
                                                  ((u =
                                                    0 |
                                                    sr[3 & St[St[o >> 2] >> 2]](
                                                      0 | St[o >> 2],
                                                      St[(28 + (0 | St[i >> 2])) >> 2] << 2
                                                    )),
                                                  !(St[(60 + (0 | St[i >> 2])) >> 2] = u))
                                                )
                                                  return (St[n >> 2] = 2), (E = 0 | St[n >> 2]), (pt = t), 0 | E
                                              } else St[(60 + (0 | St[i >> 2])) >> 2] = 0
                                              St[s >> 2] = 0
                                              e: for (;;) {
                                                if (
                                                  (0 | St[s >> 2]) >>> 0 >=
                                                  (0 | St[(28 + (0 | St[i >> 2])) >> 2]) >>> 0
                                                ) {
                                                  _ = 36
                                                  break
                                                }
                                                if (
                                                  ((St[c >> 2] =
                                                    (0 | St[(16 + (0 | St[i >> 2])) >> 2]) + (St[s >> 2] << 5)),
                                                  (St[d >> 2] =
                                                    1 & ((0 != (0 | Et[(24 + (0 | St[c >> 2])) >> 0])) ^ 1)),
                                                  (0 != (0 | St[d >> 2])) & (0 == (0 | St[l >> 2])))
                                                )
                                                  St[
                                                    ((0 | St[(60 + (0 | St[i >> 2])) >> 2]) + (St[s >> 2] << 2)) >> 2
                                                  ] = -1
                                                else {
                                                  r: do {
                                                    if (!(0 | St[l >> 2]))
                                                      for (;;) {
                                                        if (
                                                          (0 | St[f >> 2]) >>> 0 >=
                                                          (0 | St[(24 + (0 | St[i >> 2])) >> 2]) >>> 0
                                                        ) {
                                                          _ = 29
                                                          break e
                                                        }
                                                        if (
                                                          ((St[
                                                            ((0 | St[(56 + (0 | St[i >> 2])) >> 2]) +
                                                              (St[f >> 2] << 2)) >>
                                                              2
                                                          ] = St[s >> 2]),
                                                          0 |
                                                            St[
                                                              ((0 | St[(12 + (0 | St[i >> 2])) >> 2]) +
                                                                ((40 * (0 | St[f >> 2])) | 0) +
                                                                36) >>
                                                                2
                                                            ])
                                                        )
                                                          break r
                                                        St[f >> 2] = 1 + (0 | St[f >> 2])
                                                      }
                                                  } while (0)
                                                  ;(St[
                                                    ((0 | St[(60 + (0 | St[i >> 2])) >> 2]) + (St[s >> 2] << 2)) >> 2
                                                  ] = St[f >> 2]),
                                                    0 == (0 | St[d >> 2]) &&
                                                      ((St[l >> 2] = 1 + (0 | St[l >> 2])),
                                                      (0 | St[l >> 2]) >>> 0 >=
                                                        (0 |
                                                          St[
                                                            ((0 | St[(12 + (0 | St[i >> 2])) >> 2]) +
                                                              ((40 * (0 | St[f >> 2])) | 0) +
                                                              36) >>
                                                              2
                                                          ]) >>>
                                                          0) &&
                                                      ((St[f >> 2] = 1 + (0 | St[f >> 2])), (St[l >> 2] = 0))
                                                }
                                                St[s >> 2] = 1 + (0 | St[s >> 2])
                                              }
                                              {
                                                if (29 == (0 | _))
                                                  return (St[n >> 2] = 16), (E = 0 | St[n >> 2]), (pt = t), 0 | E
                                                if (36 == (0 | _))
                                                  return (St[n >> 2] = 0), (E = 0 | St[n >> 2]), (pt = t), 0 | E
                                              }
                                              return 0
                                            })(0 | St[d >> 2], 0 | St[k >> 2])),
                                          (St[c >> 2] = A),
                                          (oe = 0 | St[c >> 2]),
                                          (pt = l),
                                          0 | oe
                                        )
                                    }
                                    return 0
                                  })(0 | St[o >> 2], 0 | St[a >> 2], f, l, c, d, E, _, 0 | St[u >> 2], 0 | St[s >> 2])),
                                (St[S >> 2] = n),
                                or[3 & St[(4 + (0 | St[s >> 2])) >> 2]](0 | St[s >> 2], 0 | St[f >> 2]),
                                or[3 & St[(4 + (0 | St[s >> 2])) >> 2]](0 | St[s >> 2], 0 | St[l >> 2]),
                                or[3 & St[(4 + (0 | St[s >> 2])) >> 2]](0 | St[s >> 2], 0 | St[c >> 2]),
                                or[3 & St[(4 + (0 | St[s >> 2])) >> 2]](0 | St[s >> 2], 0 | St[d >> 2]),
                                or[3 & St[(4 + (0 | St[s >> 2])) >> 2]](0 | St[s >> 2], 0 | St[E >> 2]),
                                or[3 & St[(4 + (0 | St[s >> 2])) >> 2]](0 | St[s >> 2], 0 | St[_ >> 2]),
                                (pt = i),
                                0 | St[S >> 2]
                              )
                            })(0 | St[a >> 2], y, 0 | St[s >> 2], 0 | St[f >> 2])),
                            (St[h >> 2] = w)
                          break
                        }
                        St[h >> 2] = 4
                        break
                      }
                    } while (0)
                    return Le(m, 0 | St[f >> 2]), (St[o >> 2] = St[h >> 2]), (O = 0 | St[o >> 2]), (pt = i), 0 | O
                  })(0 | St[o >> 2], 0 | St[a >> 2], 0 | St[u >> 2], 0 | St[s >> 2])),
                (St[f >> 2] = n),
                (pt = ((l = (0 | St[f >> 2] && $(0 | St[o >> 2], 0 | St[u >> 2]), 0 | St[f >> 2])), i)),
                0 | l
              )
            })(s, o, a, u))
        )
          return $(s, a), oe(m), K(1), void (pt = r)
        ;(St[l >> 2] = -1), (S = (St[c >> 2] = 0) | St[(i = (s + 28) | 0) >> 2])
        e: do {
          if (S) {
            for (
              h = (s + 16) | 0, p = 0 | St[h >> 2], k = 0, F = 0;
              (F = 0 | Dt(0 | St[(w = (p + (k << 5) + 8) | 0) >> 2], 0 | St[(w + 4) >> 2], 0 | F, 0)),
                (k = (k + 1) | 0),
                (0 | k) != (0 | S);

            );
            for (v = y = w = k = 0, M = p, O = S; ; ) {
              if ((Pt(0 | d, 0, 255), (St[E >> 2] = 0), (St[_ >> 2] = 0) | Et[(M + (v << 5) + 25) >> 0]))
                (P = y), (C = k), (I = w), (L = O)
              else {
                if (w >>> 0 < (A = 0 | ee(s, v, 0)) >>> 0) {
                  if ((Ge(k), !(R = 0 | Xe(A << 1)))) break
                  ;(g = R), (T = A)
                } else (g = k), (T = w)
                if ((ee(s, v, g), 0 | g)) {
                  for (A = St[n >> 2] = 0; 0 | _t[(g + (A << 1)) >> 1]; ) A = (A + 1) | 0
                  j(0, n, g, A),
                    (N = (1 + (0 | St[n >> 2])) | 0),
                    0 | (D = 0 | Xe((St[n >> 2] = N))) &&
                      0 | j(D, n, g, A) &&
                      ((Et[(D + (0 | St[n >> 2])) >> 0] = 0),
                      (function (e, r, t) {
                        ;(e |= 0), (r |= 0), (t |= 0)
                        var n = 0,
                          i = 0,
                          o = 0,
                          a = 0,
                          u = 0,
                          s = 0
                        ;(0 | (pt = ((n = pt) + 32) | 0)) >= (0 | bt) && yt(32),
                          (o = (n + 12) | 0),
                          (a = (n + 8) | 0),
                          (u = (n + 4) | 0),
                          (St[(i = ((s = n) + 16) | 0) >> 2] = e),
                          (St[o >> 2] = r),
                          (St[a >> 2] = t),
                          (St[u >> 2] = 0),
                          (St[s >> 2] = St[a >> 2])
                        r: do {
                          if (0 | St[s >> 2])
                            for (;;) {
                              if (((t = ((0 | St[s >> 2]) - 1) | 0), !(St[s >> 2] = t))) break r
                              if (
                                ((t = 0 | St[o >> 2]),
                                (St[o >> 2] = t + 1),
                                (r = 0 | Et[t >> 0]),
                                (t = 0 | St[i >> 2]),
                                (St[i >> 2] = t + 1),
                                !(((Et[t >> 0] = r) << 24) >> 24))
                              )
                                break r
                              St[u >> 2] = 1 + (0 | St[u >> 2])
                            }
                        } while (0)
                        if (0 | St[s >> 2]) return St[u >> 2], (pt = n)
                        for (
                          0 | St[a >> 2] && (Et[St[i >> 2] >> 0] = 0);
                          (i = 0 | St[o >> 2]), (St[o >> 2] = i + 1), 0 | Et[i >> 0];

                        )
                          St[u >> 2] = 1 + (0 | St[u >> 2])
                        St[u >> 2], (pt = n)
                      })(d, D, 255)),
                    Ge(D)
                }
                ;(D = 0 | St[(M + (v << 5) + 8) >> 2]),
                  0 | (N = 0 | W(s, o, v, l, f, c, E, _, a, u, F, y)) &&
                    ((St[t >> 2] = N),
                    (function (e, r) {
                      ;(e |= 0), (r |= 0)
                      var t = 0,
                        n = 0
                      ;(0 | (pt = ((t = pt) + 16) | 0)) >= (0 | bt) && yt(16),
                        (St[(n = t) >> 2] = r),
                        (r =
                          0 |
                          (function (e, r, t) {
                            ;(e |= 0), (r |= 0), (t |= 0)
                            var n = 0,
                              i = 0,
                              o = 0,
                              a = 0,
                              u = 0,
                              s = 0,
                              f = 0,
                              l = 0,
                              c = 0,
                              d = 0,
                              E = 0,
                              _ = 0,
                              S = 0,
                              m = 0,
                              h = 0
                            ;(0 | (pt = ((n = pt) + 224) | 0)) >= (0 | bt) && yt(224)
                            ;(i = (n + 120) | 0), (u = ((a = n) + 136) | 0), (f = (40 + (s = o = (n + 80) | 0)) | 0)
                            for (; (St[s >> 2] = 0), (s = (s + 4) | 0), (0 | s) < (0 | f); );
                            ;(St[i >> 2] = St[t >> 2]),
                              (l =
                                (0 | Ue(0, r, i, a, o)) < 0
                                  ? -1
                                  : ((c = -1 < (0 | St[(e + 76) >> 2]) ? 0 | ze() : 0),
                                    (t = 0 | St[e >> 2]),
                                    (s = 32 & t),
                                    (0 | Et[(e + 74) >> 0]) < 1 && (St[e >> 2] = -33 & t),
                                    (m =
                                      0 | St[(t = (e + 48) | 0) >> 2]
                                        ? 0 | Ue(e, r, i, a, o)
                                        : ((d = 0 | St[(f = (e + 44) | 0) >> 2]),
                                          (St[f >> 2] = u),
                                          (St[(E = (e + 28) | 0) >> 2] = u),
                                          (St[(_ = (e + 20) | 0) >> 2] = u),
                                          (St[t >> 2] = 80),
                                          (St[(S = (e + 16) | 0) >> 2] = 80 + u),
                                          (u = 0 | Ue(e, r, i, a, o)),
                                          d
                                            ? (nr[15 & St[(e + 36) >> 2]](e, 0, 0),
                                              (h = 0 == (0 | St[_ >> 2]) ? -1 : u),
                                              (St[f >> 2] = d),
                                              (St[t >> 2] = 0),
                                              (St[S >> 2] = 0),
                                              (St[E >> 2] = 0),
                                              (St[_ >> 2] = 0),
                                              h)
                                            : u)),
                                    (o = 0 | St[e >> 2]),
                                    (St[e >> 2] = o | s),
                                    0 | c && He(),
                                    0 == ((32 & o) | 0) ? m : -1))
                            return (pt = n), 0 | l
                          })(0 | St[5], e, n)),
                        (pt = t)
                    })(169, t)),
                  B(0, 0 | d, 0 | D, ((0 | St[f >> 2]) + (0 | St[E >> 2])) | 0),
                  (P = (D + y) | 0),
                  (C = g),
                  (I = T),
                  (L = 0 | St[i >> 2])
              }
              if (L >>> 0 <= (D = (v + 1) | 0) >>> 0) {
                b = C
                break e
              }
              ;(k = C), (w = I), (y = P), (v = D), (M = 0 | St[h >> 2]), (O = L)
            }
            b = R
          } else b = 0
        } while (0)
        Ge(b), or[3 & St[e >> 2]](a, 0 | St[f >> 2]), $(s, a), oe(m), K(1), (pt = r)
      },
      _pthread_self: $e,
      _memset: Pt,
      _llvm_cttz_i32: qe,
      _malloc: Xe,
      _memcpy: Je,
      _bitshift64Lshr: Ct,
      _fflush: Ve,
      ___udivdi3: Lt,
      ___uremdi3: xt,
      ___errno_location: vt,
      _bitshift64Shl: It,
      runPostSets: function () {},
      _emscripten_replace_memory: function (e) {
        return (
          !(16777215 & c(e) || c(e) <= 16777215 || 2147483648 < c(e)) &&
          ((Et = new n(e)),
          (_t = new i(e)),
          (St = new o(e)),
          (mt = new a(e)),
          (re = new u(e)),
          new s(e),
          new f(e),
          (ht = new l(e)),
          !0)
        )
      },
      stackAlloc: function (e) {
        var r = pt
        return (0 | bt) <= (0 | (pt = ((pt = (pt + (e |= 0)) | 0) + 15) & -16)) && yt(0 | e), 0 | r
      },
      stackSave: function () {
        return 0 | pt
      },
      stackRestore: function (e) {
        pt = e |= 0
      },
      establishStackSpace: function (e, r) {
        ;(pt = e |= 0), (bt = r |= 0)
      },
      setThrew: function (e, r) {
        ;(e |= 0), (r |= 0), _ || ((_ = e), 0)
      },
      setTempRet0: function (e) {
        Ft = e |= 0
      },
      getTempRet0: function () {
        return 0 | Ft
      },
      dynCall_iiii: function (e, r, t, n) {
        return (r |= 0), (t |= 0), (n |= 0), 0 | nr[15 & (e |= 0)](0 | r, 0 | t, 0 | n)
      },
      dynCall_vi: function (e, r) {
        ;(r |= 0), ir[3 & (e |= 0)](0 | r)
      },
      dynCall_vii: function (e, r, t) {
        ;(r |= 0), (t |= 0), or[3 & (e |= 0)](0 | r, 0 | t)
      },
      dynCall_ii: function (e, r) {
        return (r |= 0), 0 | ar[1 & (e |= 0)](0 | r)
      },
      dynCall_iiiii: function (e, r, t, n, i) {
        return (r |= 0), (t |= 0), (n |= 0), (i |= 0), 0 | ur[1 & (e |= 0)](0 | r, 0 | t, 0 | n, 0 | i)
      },
      dynCall_iii: function (e, r, t) {
        return (r |= 0), (t |= 0), 0 | sr[3 & (e |= 0)](0 | r, 0 | t)
      },
    }
  })(Module.asmGlobalArg, Module.asmLibraryArg, buffer),
  real__malloc = asm._malloc
asm._malloc = function () {
  return (
    assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)'),
    assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)'),
    real__malloc.apply(null, arguments)
  )
}
var real__i64Subtract = asm._i64Subtract
asm._i64Subtract = function () {
  return (
    assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)'),
    assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)'),
    real__i64Subtract.apply(null, arguments)
  )
}
var real__free = asm._free
asm._free = function () {
  return (
    assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)'),
    assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)'),
    real__free.apply(null, arguments)
  )
}
var real____udivmoddi4 = asm.___udivmoddi4
asm.___udivmoddi4 = function () {
  return (
    assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)'),
    assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)'),
    real____udivmoddi4.apply(null, arguments)
  )
}
var real__i64Add = asm._i64Add
asm._i64Add = function () {
  return (
    assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)'),
    assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)'),
    real__i64Add.apply(null, arguments)
  )
}
var real__extract = asm._extract
asm._extract = function () {
  return (
    assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)'),
    assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)'),
    real__extract.apply(null, arguments)
  )
}
var real__pthread_self = asm._pthread_self
asm._pthread_self = function () {
  return (
    assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)'),
    assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)'),
    real__pthread_self.apply(null, arguments)
  )
}
var real__llvm_cttz_i32 = asm._llvm_cttz_i32
asm._llvm_cttz_i32 = function () {
  return (
    assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)'),
    assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)'),
    real__llvm_cttz_i32.apply(null, arguments)
  )
}
var real__sbrk = asm._sbrk
asm._sbrk = function () {
  return (
    assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)'),
    assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)'),
    real__sbrk.apply(null, arguments)
  )
}
var real__bitshift64Lshr = asm._bitshift64Lshr
asm._bitshift64Lshr = function () {
  return (
    assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)'),
    assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)'),
    real__bitshift64Lshr.apply(null, arguments)
  )
}
var real__fflush = asm._fflush
asm._fflush = function () {
  return (
    assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)'),
    assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)'),
    real__fflush.apply(null, arguments)
  )
}
var real____udivdi3 = asm.___udivdi3
asm.___udivdi3 = function () {
  return (
    assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)'),
    assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)'),
    real____udivdi3.apply(null, arguments)
  )
}
var real____uremdi3 = asm.___uremdi3
asm.___uremdi3 = function () {
  return (
    assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)'),
    assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)'),
    real____uremdi3.apply(null, arguments)
  )
}
var real____errno_location = asm.___errno_location
asm.___errno_location = function () {
  return (
    assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)'),
    assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)'),
    real____errno_location.apply(null, arguments)
  )
}
var real__bitshift64Shl = asm._bitshift64Shl
asm._bitshift64Shl = function () {
  return (
    assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)'),
    assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)'),
    real__bitshift64Shl.apply(null, arguments)
  )
}
var _malloc = (Module._malloc = asm._malloc),
  _i64Subtract = (Module._i64Subtract = asm._i64Subtract),
  _free = (Module._free = asm._free),
  ___udivmoddi4 = (Module.___udivmoddi4 = asm.___udivmoddi4),
  _i64Add = (Module._i64Add = asm._i64Add),
  runPostSets = (Module.runPostSets = asm.runPostSets),
  _extract = (Module._extract = asm._extract),
  _pthread_self = (Module._pthread_self = asm._pthread_self),
  _memset = (Module._memset = asm._memset),
  _llvm_cttz_i32 = (Module._llvm_cttz_i32 = asm._llvm_cttz_i32),
  _sbrk = (Module._sbrk = asm._sbrk),
  _memcpy = (Module._memcpy = asm._memcpy),
  _emscripten_replace_memory = (Module._emscripten_replace_memory = asm._emscripten_replace_memory),
  _bitshift64Lshr = (Module._bitshift64Lshr = asm._bitshift64Lshr),
  _fflush = (Module._fflush = asm._fflush),
  ___udivdi3 = (Module.___udivdi3 = asm.___udivdi3),
  ___uremdi3 = (Module.___uremdi3 = asm.___uremdi3),
  ___errno_location = (Module.___errno_location = asm.___errno_location),
  _bitshift64Shl = (Module._bitshift64Shl = asm._bitshift64Shl),
  dynCall_iiii = (Module.dynCall_iiii = asm.dynCall_iiii),
  dynCall_vi = (Module.dynCall_vi = asm.dynCall_vi),
  dynCall_vii = (Module.dynCall_vii = asm.dynCall_vii),
  dynCall_ii = (Module.dynCall_ii = asm.dynCall_ii),
  dynCall_iiiii = (Module.dynCall_iiiii = asm.dynCall_iiiii),
  dynCall_iii = (Module.dynCall_iii = asm.dynCall_iii),
  initialStackTop
function ExitStatus(e) {
  ;(this.name = 'ExitStatus'), (this.message = 'Program terminated with exit(' + e + ')'), (this.status = e)
}
;(Runtime.stackAlloc = asm.stackAlloc),
  (Runtime.stackSave = asm.stackSave),
  (Runtime.stackRestore = asm.stackRestore),
  (Runtime.establishStackSpace = asm.establishStackSpace),
  (Runtime.setTempRet0 = asm.setTempRet0),
  (Runtime.getTempRet0 = asm.getTempRet0),
  (ExitStatus.prototype = new Error()),
  (ExitStatus.prototype.constructor = ExitStatus)
var preloadStartTime = null,
  calledMain = !1
function run(e) {
  function r() {
    Module.calledRun ||
      ((Module.calledRun = !0),
      ABORT ||
        (ensureInitRuntime(),
        preMain(),
        ENVIRONMENT_IS_WEB &&
          null !== preloadStartTime &&
          Module.printErr('pre-main prep time: ' + (Date.now() - preloadStartTime) + ' ms'),
        Module.onRuntimeInitialized && Module.onRuntimeInitialized(),
        Module._main && shouldRunNow && Module.callMain(e),
        postRun()))
  }
  ;(e = e || Module.arguments),
    null === preloadStartTime && (preloadStartTime = Date.now()),
    0 < runDependencies
      ? Module.printErr('run() called, but dependencies remain, so not running')
      : (writeStackCookie(),
        preRun(),
        0 < runDependencies ||
          Module.calledRun ||
          (Module.setStatus
            ? (Module.setStatus('Running...'),
              setTimeout(function () {
                setTimeout(function () {
                  Module.setStatus('')
                }, 1),
                  r()
              }, 1))
            : r(),
          checkStackCookie()))
}
function exit(e, r) {
  if (!r || !Module.noExitRuntime)
    throw (
      (Module.noExitRuntime
        ? Module.printErr(
            'exit(' +
              e +
              ') called, but noExitRuntime, so halting execution but not exiting the runtime or preventing further async execution (you can use emscripten_force_exit, if you want to force a true shutdown)'
          )
        : ((ABORT = !0),
          (EXITSTATUS = e),
          (STACKTOP = initialStackTop),
          exitRuntime(),
          Module.onExit && Module.onExit(e)),
      ENVIRONMENT_IS_NODE ? process.exit(e) : ENVIRONMENT_IS_SHELL && 'function' == typeof quit && quit(e),
      new ExitStatus(e))
    )
  Module.printErr(
    'exit(' +
      e +
      ') implicitly called by end of main(), but noExitRuntime, so not exiting the runtime (you can use emscripten_force_exit, if you want to force a true shutdown)'
  )
}
;(dependenciesFulfilled = function e() {
  Module.calledRun || run(), Module.calledRun || (dependenciesFulfilled = e)
}),
  (Module.callMain = Module.callMain =
    function (e) {
      assert(0 == runDependencies, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)'),
        assert(0 == __ATPRERUN__.length, 'cannot call main when preRun functions remain to be called'),
        (e = e || []),
        ensureInitRuntime()
      var r = e.length + 1
      function t() {
        for (var e = 0; e < 3; e++) n.push(0)
      }
      var n = [allocate(intArrayFromString(Module.thisProgram), 'i8', ALLOC_NORMAL)]
      t()
      for (var i = 0; i < r - 1; i += 1) n.push(allocate(intArrayFromString(e[i]), 'i8', ALLOC_NORMAL)), t()
      n.push(0), (n = allocate(n, 'i32', ALLOC_NORMAL))
      try {
        exit(Module._main(r, n, 0), !0)
      } catch (e) {
        if (e instanceof ExitStatus) return
        if ('SimulateInfiniteLoop' == e) return void (Module.noExitRuntime = !0)
        throw (e && 'object' == typeof e && e.stack && Module.printErr('exception thrown: ' + [e, e.stack]), e)
      } finally {
        calledMain = !0
      }
    }),
  (Module.run = Module.run = run),
  (Module.exit = Module.exit = exit)
var abortDecorators = []
function abort(r) {
  ;(r = void 0 !== r ? (Module.print(r), Module.printErr(r), JSON.stringify(r)) : ''), (ABORT = !0), (EXITSTATUS = 1)
  var t = 'abort(' + r + ') at ' + stackTrace()
  throw (
    (abortDecorators &&
      abortDecorators.forEach(function (e) {
        t = e(t, r)
      }),
    t)
  )
}
if (((Module.abort = Module.abort = abort), Module.preInit))
  for ('function' == typeof Module.preInit && (Module.preInit = [Module.preInit]); 0 < Module.preInit.length; )
    Module.preInit.pop()()
var shouldRunNow = !0
Module.noInitialRun && (shouldRunNow = !1),
  run(),
  (un7zip = Module.cwrap('extract', 'number', ['string'])),
  (onmessage = function (e) {
    try {
      Module.FS_createDataFile('/', '1.7z', e.data, !0, !1)
    } catch (e) {
      console.log(e)
    }
    un7zip('1.7z'), FS.unlink('1.7z'), close()
  })
