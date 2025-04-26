"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __esm = (fn2, res) => function __init() {
  return fn2 && (res = (0, fn2[__getOwnPropNames(fn2)[0]])(fn2 = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to2, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to2, key) && key !== except)
        __defProp(to2, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to2;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// src/shared/prisma-client.ts
var import_db, connectWithRetry;
var init_prisma_client = __esm({
  "src/shared/prisma-client.ts"() {
    "use strict";
    import_db = require("@ngdi/db");
    connectWithRetry = async (retries = 5, delay = 2e3) => {
      let currentRetry = 0;
      while (currentRetry < retries) {
        try {
          await import_db.prisma.$connect();
          console.log("API: Prisma connected successfully to the database");
          return true;
        } catch (error) {
          currentRetry++;
          console.error(
            `API: Prisma connection error (attempt ${currentRetry}/${retries}):`,
            error
          );
          if (currentRetry >= retries) {
            console.error(
              "API: Maximum connection retries reached. Using database in disconnected mode."
            );
            return false;
          }
          console.log(`Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
      return false;
    };
    connectWithRetry().catch((error) => {
      console.error("API: Failed to establish database connection:", error);
    });
  }
});

// src/lib/prisma.ts
var init_prisma = __esm({
  "src/lib/prisma.ts"() {
    "use strict";
    init_prisma_client();
  }
});

// src/config/index.ts
var import_dotenv, config2;
var init_config = __esm({
  "src/config/index.ts"() {
    "use strict";
    import_dotenv = __toESM(require("dotenv"));
    import_dotenv.default.config();
    config2 = {
      env: process.env.NODE_ENV || "development",
      port: parseInt(process.env.PORT || "3001", 10),
      // Application info
      appName: process.env.APP_NAME || "NGDI Portal API",
      frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
      // Rate limiting configuration
      rateLimit: {
        // General API rate limit
        standard: {
          window: parseInt(process.env.RATE_LIMIT_WINDOW || "60000", 10),
          // 1 minute in milliseconds
          max: parseInt(process.env.RATE_LIMIT_MAX || "100", 10)
          // 100 requests per minute
        },
        // Auth endpoints rate limit (stricter)
        auth: {
          window: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW || "60000", 10),
          // 1 minute in milliseconds
          max: parseInt(process.env.AUTH_RATE_LIMIT_MAX || "10", 10)
          // 10 requests per minute
        }
      },
      // JWT configuration
      jwt: {
        secret: process.env.JWT_SECRET || "your-default-secret-for-dev-only",
        refreshSecret: process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET || "your-default-secret-for-dev-only",
        expiresIn: process.env.JWT_EXPIRES_IN || "1h",
        refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
        issuer: process.env.JWT_ISSUER || "ngdi-portal-api",
        audience: process.env.JWT_AUDIENCE || "ngdi-portal-client"
      },
      // CORS configuration
      cors: {
        origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : ["http://localhost:3000", "http://127.0.0.1:3000"],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allowedHeaders: [
          "Content-Type",
          "Authorization",
          "X-Request-ID",
          "X-Client-Version",
          "X-Client-Platform"
        ],
        credentials: true
        // Allow cookies to be sent with requests
      },
      // Database configuration
      database: {
        url: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/myapp"
      },
      // Supabase configuration
      supabase: {
        url: process.env.SUPABASE_URL || "",
        anonKey: process.env.SUPABASE_ANON_KEY || ""
      },
      // Logging
      logging: {
        level: process.env.LOG_LEVEL || "info"
      },
      server: {
        host: process.env.HOST || "localhost",
        nodeEnv: process.env.NODE_ENV || "development"
      },
      db: {
        directUrl: process.env.DIRECT_URL
      },
      corsOrigins: process.env.ALLOWED_ORIGINS?.split(",") || [
        "http://localhost:3000"
      ],
      email: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        user: process.env.SMTP_USER,
        password: process.env.SMTP_PASSWORD,
        from: process.env.EMAIL_FROM || "noreply@example.com"
      },
      logLevel: process.env.LOG_LEVEL || "info",
      redis: {
        url: process.env.REDIS_URL || "redis://localhost:6379",
        token: process.env.REDIS_TOKEN || ""
      }
    };
  }
});

// ../../node_modules/crypto-js/core.js
var require_core = __commonJS({
  "../../node_modules/crypto-js/core.js"(exports2, module2) {
    "use strict";
    (function(root, factory) {
      if (typeof exports2 === "object") {
        module2.exports = exports2 = factory();
      } else if (typeof define === "function" && define.amd) {
        define([], factory);
      } else {
        root.CryptoJS = factory();
      }
    })(exports2, function() {
      var CryptoJS = CryptoJS || function(Math2, undefined2) {
        var crypto4;
        if (typeof window !== "undefined" && window.crypto) {
          crypto4 = window.crypto;
        }
        if (typeof self !== "undefined" && self.crypto) {
          crypto4 = self.crypto;
        }
        if (typeof globalThis !== "undefined" && globalThis.crypto) {
          crypto4 = globalThis.crypto;
        }
        if (!crypto4 && typeof window !== "undefined" && window.msCrypto) {
          crypto4 = window.msCrypto;
        }
        if (!crypto4 && typeof global !== "undefined" && global.crypto) {
          crypto4 = global.crypto;
        }
        if (!crypto4 && typeof require === "function") {
          try {
            crypto4 = require("crypto");
          } catch (err) {
          }
        }
        var cryptoSecureRandomInt = function() {
          if (crypto4) {
            if (typeof crypto4.getRandomValues === "function") {
              try {
                return crypto4.getRandomValues(new Uint32Array(1))[0];
              } catch (err) {
              }
            }
            if (typeof crypto4.randomBytes === "function") {
              try {
                return crypto4.randomBytes(4).readInt32LE();
              } catch (err) {
              }
            }
          }
          throw new Error("Native crypto module could not be used to get secure random number.");
        };
        var create = Object.create || function() {
          function F() {
          }
          return function(obj) {
            var subtype;
            F.prototype = obj;
            subtype = new F();
            F.prototype = null;
            return subtype;
          };
        }();
        var C2 = {};
        var C_lib = C2.lib = {};
        var Base = C_lib.Base = function() {
          return {
            /**
             * Creates a new object that inherits from this object.
             *
             * @param {Object} overrides Properties to copy into the new object.
             *
             * @return {Object} The new object.
             *
             * @static
             *
             * @example
             *
             *     var MyType = CryptoJS.lib.Base.extend({
             *         field: 'value',
             *
             *         method: function () {
             *         }
             *     });
             */
            extend: function(overrides) {
              var subtype = create(this);
              if (overrides) {
                subtype.mixIn(overrides);
              }
              if (!subtype.hasOwnProperty("init") || this.init === subtype.init) {
                subtype.init = function() {
                  subtype.$super.init.apply(this, arguments);
                };
              }
              subtype.init.prototype = subtype;
              subtype.$super = this;
              return subtype;
            },
            /**
             * Extends this object and runs the init method.
             * Arguments to create() will be passed to init().
             *
             * @return {Object} The new object.
             *
             * @static
             *
             * @example
             *
             *     var instance = MyType.create();
             */
            create: function() {
              var instance = this.extend();
              instance.init.apply(instance, arguments);
              return instance;
            },
            /**
             * Initializes a newly created object.
             * Override this method to add some logic when your objects are created.
             *
             * @example
             *
             *     var MyType = CryptoJS.lib.Base.extend({
             *         init: function () {
             *             // ...
             *         }
             *     });
             */
            init: function() {
            },
            /**
             * Copies properties into this object.
             *
             * @param {Object} properties The properties to mix in.
             *
             * @example
             *
             *     MyType.mixIn({
             *         field: 'value'
             *     });
             */
            mixIn: function(properties) {
              for (var propertyName in properties) {
                if (properties.hasOwnProperty(propertyName)) {
                  this[propertyName] = properties[propertyName];
                }
              }
              if (properties.hasOwnProperty("toString")) {
                this.toString = properties.toString;
              }
            },
            /**
             * Creates a copy of this object.
             *
             * @return {Object} The clone.
             *
             * @example
             *
             *     var clone = instance.clone();
             */
            clone: function() {
              return this.init.prototype.extend(this);
            }
          };
        }();
        var WordArray = C_lib.WordArray = Base.extend({
          /**
           * Initializes a newly created word array.
           *
           * @param {Array} words (Optional) An array of 32-bit words.
           * @param {number} sigBytes (Optional) The number of significant bytes in the words.
           *
           * @example
           *
           *     var wordArray = CryptoJS.lib.WordArray.create();
           *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607]);
           *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607], 6);
           */
          init: function(words, sigBytes) {
            words = this.words = words || [];
            if (sigBytes != undefined2) {
              this.sigBytes = sigBytes;
            } else {
              this.sigBytes = words.length * 4;
            }
          },
          /**
           * Converts this word array to a string.
           *
           * @param {Encoder} encoder (Optional) The encoding strategy to use. Default: CryptoJS.enc.Hex
           *
           * @return {string} The stringified word array.
           *
           * @example
           *
           *     var string = wordArray + '';
           *     var string = wordArray.toString();
           *     var string = wordArray.toString(CryptoJS.enc.Utf8);
           */
          toString: function(encoder) {
            return (encoder || Hex2).stringify(this);
          },
          /**
           * Concatenates a word array to this word array.
           *
           * @param {WordArray} wordArray The word array to append.
           *
           * @return {WordArray} This word array.
           *
           * @example
           *
           *     wordArray1.concat(wordArray2);
           */
          concat: function(wordArray) {
            var thisWords = this.words;
            var thatWords = wordArray.words;
            var thisSigBytes = this.sigBytes;
            var thatSigBytes = wordArray.sigBytes;
            this.clamp();
            if (thisSigBytes % 4) {
              for (var i = 0; i < thatSigBytes; i++) {
                var thatByte = thatWords[i >>> 2] >>> 24 - i % 4 * 8 & 255;
                thisWords[thisSigBytes + i >>> 2] |= thatByte << 24 - (thisSigBytes + i) % 4 * 8;
              }
            } else {
              for (var j2 = 0; j2 < thatSigBytes; j2 += 4) {
                thisWords[thisSigBytes + j2 >>> 2] = thatWords[j2 >>> 2];
              }
            }
            this.sigBytes += thatSigBytes;
            return this;
          },
          /**
           * Removes insignificant bits.
           *
           * @example
           *
           *     wordArray.clamp();
           */
          clamp: function() {
            var words = this.words;
            var sigBytes = this.sigBytes;
            words[sigBytes >>> 2] &= 4294967295 << 32 - sigBytes % 4 * 8;
            words.length = Math2.ceil(sigBytes / 4);
          },
          /**
           * Creates a copy of this word array.
           *
           * @return {WordArray} The clone.
           *
           * @example
           *
           *     var clone = wordArray.clone();
           */
          clone: function() {
            var clone = Base.clone.call(this);
            clone.words = this.words.slice(0);
            return clone;
          },
          /**
           * Creates a word array filled with random bytes.
           *
           * @param {number} nBytes The number of random bytes to generate.
           *
           * @return {WordArray} The random word array.
           *
           * @static
           *
           * @example
           *
           *     var wordArray = CryptoJS.lib.WordArray.random(16);
           */
          random: function(nBytes) {
            var words = [];
            for (var i = 0; i < nBytes; i += 4) {
              words.push(cryptoSecureRandomInt());
            }
            return new WordArray.init(words, nBytes);
          }
        });
        var C_enc = C2.enc = {};
        var Hex2 = C_enc.Hex = {
          /**
           * Converts a word array to a hex string.
           *
           * @param {WordArray} wordArray The word array.
           *
           * @return {string} The hex string.
           *
           * @static
           *
           * @example
           *
           *     var hexString = CryptoJS.enc.Hex.stringify(wordArray);
           */
          stringify: function(wordArray) {
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;
            var hexChars = [];
            for (var i = 0; i < sigBytes; i++) {
              var bite = words[i >>> 2] >>> 24 - i % 4 * 8 & 255;
              hexChars.push((bite >>> 4).toString(16));
              hexChars.push((bite & 15).toString(16));
            }
            return hexChars.join("");
          },
          /**
           * Converts a hex string to a word array.
           *
           * @param {string} hexStr The hex string.
           *
           * @return {WordArray} The word array.
           *
           * @static
           *
           * @example
           *
           *     var wordArray = CryptoJS.enc.Hex.parse(hexString);
           */
          parse: function(hexStr) {
            var hexStrLength = hexStr.length;
            var words = [];
            for (var i = 0; i < hexStrLength; i += 2) {
              words[i >>> 3] |= parseInt(hexStr.substr(i, 2), 16) << 24 - i % 8 * 4;
            }
            return new WordArray.init(words, hexStrLength / 2);
          }
        };
        var Latin1 = C_enc.Latin1 = {
          /**
           * Converts a word array to a Latin1 string.
           *
           * @param {WordArray} wordArray The word array.
           *
           * @return {string} The Latin1 string.
           *
           * @static
           *
           * @example
           *
           *     var latin1String = CryptoJS.enc.Latin1.stringify(wordArray);
           */
          stringify: function(wordArray) {
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;
            var latin1Chars = [];
            for (var i = 0; i < sigBytes; i++) {
              var bite = words[i >>> 2] >>> 24 - i % 4 * 8 & 255;
              latin1Chars.push(String.fromCharCode(bite));
            }
            return latin1Chars.join("");
          },
          /**
           * Converts a Latin1 string to a word array.
           *
           * @param {string} latin1Str The Latin1 string.
           *
           * @return {WordArray} The word array.
           *
           * @static
           *
           * @example
           *
           *     var wordArray = CryptoJS.enc.Latin1.parse(latin1String);
           */
          parse: function(latin1Str) {
            var latin1StrLength = latin1Str.length;
            var words = [];
            for (var i = 0; i < latin1StrLength; i++) {
              words[i >>> 2] |= (latin1Str.charCodeAt(i) & 255) << 24 - i % 4 * 8;
            }
            return new WordArray.init(words, latin1StrLength);
          }
        };
        var Utf8 = C_enc.Utf8 = {
          /**
           * Converts a word array to a UTF-8 string.
           *
           * @param {WordArray} wordArray The word array.
           *
           * @return {string} The UTF-8 string.
           *
           * @static
           *
           * @example
           *
           *     var utf8String = CryptoJS.enc.Utf8.stringify(wordArray);
           */
          stringify: function(wordArray) {
            try {
              return decodeURIComponent(escape(Latin1.stringify(wordArray)));
            } catch (e) {
              throw new Error("Malformed UTF-8 data");
            }
          },
          /**
           * Converts a UTF-8 string to a word array.
           *
           * @param {string} utf8Str The UTF-8 string.
           *
           * @return {WordArray} The word array.
           *
           * @static
           *
           * @example
           *
           *     var wordArray = CryptoJS.enc.Utf8.parse(utf8String);
           */
          parse: function(utf8Str) {
            return Latin1.parse(unescape(encodeURIComponent(utf8Str)));
          }
        };
        var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm = Base.extend({
          /**
           * Resets this block algorithm's data buffer to its initial state.
           *
           * @example
           *
           *     bufferedBlockAlgorithm.reset();
           */
          reset: function() {
            this._data = new WordArray.init();
            this._nDataBytes = 0;
          },
          /**
           * Adds new data to this block algorithm's buffer.
           *
           * @param {WordArray|string} data The data to append. Strings are converted to a WordArray using UTF-8.
           *
           * @example
           *
           *     bufferedBlockAlgorithm._append('data');
           *     bufferedBlockAlgorithm._append(wordArray);
           */
          _append: function(data) {
            if (typeof data == "string") {
              data = Utf8.parse(data);
            }
            this._data.concat(data);
            this._nDataBytes += data.sigBytes;
          },
          /**
           * Processes available data blocks.
           *
           * This method invokes _doProcessBlock(offset), which must be implemented by a concrete subtype.
           *
           * @param {boolean} doFlush Whether all blocks and partial blocks should be processed.
           *
           * @return {WordArray} The processed data.
           *
           * @example
           *
           *     var processedData = bufferedBlockAlgorithm._process();
           *     var processedData = bufferedBlockAlgorithm._process(!!'flush');
           */
          _process: function(doFlush) {
            var processedWords;
            var data = this._data;
            var dataWords = data.words;
            var dataSigBytes = data.sigBytes;
            var blockSize = this.blockSize;
            var blockSizeBytes = blockSize * 4;
            var nBlocksReady = dataSigBytes / blockSizeBytes;
            if (doFlush) {
              nBlocksReady = Math2.ceil(nBlocksReady);
            } else {
              nBlocksReady = Math2.max((nBlocksReady | 0) - this._minBufferSize, 0);
            }
            var nWordsReady = nBlocksReady * blockSize;
            var nBytesReady = Math2.min(nWordsReady * 4, dataSigBytes);
            if (nWordsReady) {
              for (var offset = 0; offset < nWordsReady; offset += blockSize) {
                this._doProcessBlock(dataWords, offset);
              }
              processedWords = dataWords.splice(0, nWordsReady);
              data.sigBytes -= nBytesReady;
            }
            return new WordArray.init(processedWords, nBytesReady);
          },
          /**
           * Creates a copy of this object.
           *
           * @return {Object} The clone.
           *
           * @example
           *
           *     var clone = bufferedBlockAlgorithm.clone();
           */
          clone: function() {
            var clone = Base.clone.call(this);
            clone._data = this._data.clone();
            return clone;
          },
          _minBufferSize: 0
        });
        var Hasher = C_lib.Hasher = BufferedBlockAlgorithm.extend({
          /**
           * Configuration options.
           */
          cfg: Base.extend(),
          /**
           * Initializes a newly created hasher.
           *
           * @param {Object} cfg (Optional) The configuration options to use for this hash computation.
           *
           * @example
           *
           *     var hasher = CryptoJS.algo.SHA256.create();
           */
          init: function(cfg) {
            this.cfg = this.cfg.extend(cfg);
            this.reset();
          },
          /**
           * Resets this hasher to its initial state.
           *
           * @example
           *
           *     hasher.reset();
           */
          reset: function() {
            BufferedBlockAlgorithm.reset.call(this);
            this._doReset();
          },
          /**
           * Updates this hasher with a message.
           *
           * @param {WordArray|string} messageUpdate The message to append.
           *
           * @return {Hasher} This hasher.
           *
           * @example
           *
           *     hasher.update('message');
           *     hasher.update(wordArray);
           */
          update: function(messageUpdate) {
            this._append(messageUpdate);
            this._process();
            return this;
          },
          /**
           * Finalizes the hash computation.
           * Note that the finalize operation is effectively a destructive, read-once operation.
           *
           * @param {WordArray|string} messageUpdate (Optional) A final message update.
           *
           * @return {WordArray} The hash.
           *
           * @example
           *
           *     var hash = hasher.finalize();
           *     var hash = hasher.finalize('message');
           *     var hash = hasher.finalize(wordArray);
           */
          finalize: function(messageUpdate) {
            if (messageUpdate) {
              this._append(messageUpdate);
            }
            var hash2 = this._doFinalize();
            return hash2;
          },
          blockSize: 512 / 32,
          /**
           * Creates a shortcut function to a hasher's object interface.
           *
           * @param {Hasher} hasher The hasher to create a helper for.
           *
           * @return {Function} The shortcut function.
           *
           * @static
           *
           * @example
           *
           *     var SHA256 = CryptoJS.lib.Hasher._createHelper(CryptoJS.algo.SHA256);
           */
          _createHelper: function(hasher) {
            return function(message, cfg) {
              return new hasher.init(cfg).finalize(message);
            };
          },
          /**
           * Creates a shortcut function to the HMAC's object interface.
           *
           * @param {Hasher} hasher The hasher to use in this HMAC helper.
           *
           * @return {Function} The shortcut function.
           *
           * @static
           *
           * @example
           *
           *     var HmacSHA256 = CryptoJS.lib.Hasher._createHmacHelper(CryptoJS.algo.SHA256);
           */
          _createHmacHelper: function(hasher) {
            return function(message, key) {
              return new C_algo.HMAC.init(hasher, key).finalize(message);
            };
          }
        });
        var C_algo = C2.algo = {};
        return C2;
      }(Math);
      return CryptoJS;
    });
  }
});

// ../../node_modules/crypto-js/enc-hex.js
var require_enc_hex = __commonJS({
  "../../node_modules/crypto-js/enc-hex.js"(exports2, module2) {
    "use strict";
    (function(root, factory) {
      if (typeof exports2 === "object") {
        module2.exports = exports2 = factory(require_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports2, function(CryptoJS) {
      return CryptoJS.enc.Hex;
    });
  }
});

// ../../node_modules/crypto-js/sha1.js
var require_sha1 = __commonJS({
  "../../node_modules/crypto-js/sha1.js"(exports2, module2) {
    "use strict";
    (function(root, factory) {
      if (typeof exports2 === "object") {
        module2.exports = exports2 = factory(require_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports2, function(CryptoJS) {
      (function() {
        var C2 = CryptoJS;
        var C_lib = C2.lib;
        var WordArray = C_lib.WordArray;
        var Hasher = C_lib.Hasher;
        var C_algo = C2.algo;
        var W = [];
        var SHA1 = C_algo.SHA1 = Hasher.extend({
          _doReset: function() {
            this._hash = new WordArray.init([
              1732584193,
              4023233417,
              2562383102,
              271733878,
              3285377520
            ]);
          },
          _doProcessBlock: function(M2, offset) {
            var H2 = this._hash.words;
            var a = H2[0];
            var b2 = H2[1];
            var c = H2[2];
            var d2 = H2[3];
            var e = H2[4];
            for (var i = 0; i < 80; i++) {
              if (i < 16) {
                W[i] = M2[offset + i] | 0;
              } else {
                var n = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16];
                W[i] = n << 1 | n >>> 31;
              }
              var t = (a << 5 | a >>> 27) + e + W[i];
              if (i < 20) {
                t += (b2 & c | ~b2 & d2) + 1518500249;
              } else if (i < 40) {
                t += (b2 ^ c ^ d2) + 1859775393;
              } else if (i < 60) {
                t += (b2 & c | b2 & d2 | c & d2) - 1894007588;
              } else {
                t += (b2 ^ c ^ d2) - 899497514;
              }
              e = d2;
              d2 = c;
              c = b2 << 30 | b2 >>> 2;
              b2 = a;
              a = t;
            }
            H2[0] = H2[0] + a | 0;
            H2[1] = H2[1] + b2 | 0;
            H2[2] = H2[2] + c | 0;
            H2[3] = H2[3] + d2 | 0;
            H2[4] = H2[4] + e | 0;
          },
          _doFinalize: function() {
            var data = this._data;
            var dataWords = data.words;
            var nBitsTotal = this._nDataBytes * 8;
            var nBitsLeft = data.sigBytes * 8;
            dataWords[nBitsLeft >>> 5] |= 128 << 24 - nBitsLeft % 32;
            dataWords[(nBitsLeft + 64 >>> 9 << 4) + 14] = Math.floor(nBitsTotal / 4294967296);
            dataWords[(nBitsLeft + 64 >>> 9 << 4) + 15] = nBitsTotal;
            data.sigBytes = dataWords.length * 4;
            this._process();
            return this._hash;
          },
          clone: function() {
            var clone = Hasher.clone.call(this);
            clone._hash = this._hash.clone();
            return clone;
          }
        });
        C2.SHA1 = Hasher._createHelper(SHA1);
        C2.HmacSHA1 = Hasher._createHmacHelper(SHA1);
      })();
      return CryptoJS.SHA1;
    });
  }
});

// ../../node_modules/@upstash/redis/chunk-56TVFNIH.mjs
function parseRecursive(obj) {
  const parsed = Array.isArray(obj) ? obj.map((o) => {
    try {
      return parseRecursive(o);
    } catch {
      return o;
    }
  }) : JSON.parse(obj);
  if (typeof parsed === "number" && parsed.toString() !== obj) {
    return obj;
  }
  return parsed;
}
function parseResponse(result) {
  try {
    return parseRecursive(result);
  } catch {
    return result;
  }
}
function deserializeScanResponse(result) {
  return [result[0], ...parseResponse(result.slice(1))];
}
function mergeHeaders(...headers) {
  const merged = {};
  for (const header of headers) {
    if (!header)
      continue;
    for (const [key, value] of Object.entries(header)) {
      if (value !== void 0 && value !== null) {
        merged[key] = value;
      }
    }
  }
  return merged;
}
function base64decode(b64) {
  let dec = "";
  try {
    const binString = atob(b64);
    const size = binString.length;
    const bytes = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
      bytes[i] = binString.charCodeAt(i);
    }
    dec = new TextDecoder().decode(bytes);
  } catch {
    dec = b64;
  }
  return dec;
}
function decode(raw2) {
  let result = void 0;
  switch (typeof raw2) {
    case "undefined": {
      return raw2;
    }
    case "number": {
      result = raw2;
      break;
    }
    case "object": {
      if (Array.isArray(raw2)) {
        result = raw2.map(
          (v) => typeof v === "string" ? base64decode(v) : Array.isArray(v) ? v.map((element) => decode(element)) : v
        );
      } else {
        result = null;
      }
      break;
    }
    case "string": {
      result = raw2 === "OK" ? "OK" : base64decode(raw2);
      break;
    }
    default: {
      break;
    }
  }
  return result;
}
function merge(obj, key, value) {
  if (!value) {
    return obj;
  }
  obj[key] = obj[key] ? [obj[key], value].join(",") : value;
  return obj;
}
function deserialize(result) {
  if (result.length === 0) {
    return null;
  }
  const obj = {};
  for (let i = 0; i < result.length; i += 2) {
    const key = result[i];
    const value = result[i + 1];
    try {
      obj[key] = JSON.parse(value);
    } catch {
      obj[key] = value;
    }
  }
  return obj;
}
function transform(result) {
  const final = [];
  for (const pos of result) {
    if (!pos?.[0] || !pos?.[1]) {
      continue;
    }
    final.push({ lng: Number.parseFloat(pos[0]), lat: Number.parseFloat(pos[1]) });
  }
  return final;
}
function deserialize2(result) {
  if (result.length === 0) {
    return null;
  }
  const obj = {};
  for (let i = 0; i < result.length; i += 2) {
    const key = result[i];
    const value = result[i + 1];
    try {
      const valueIsNumberAndNotSafeInteger = !Number.isNaN(Number(value)) && !Number.isSafeInteger(Number(value));
      obj[key] = valueIsNumberAndNotSafeInteger ? value : JSON.parse(value);
    } catch {
      obj[key] = value;
    }
  }
  return obj;
}
function deserialize3(fields, result) {
  if (result.every((field) => field === null)) {
    return null;
  }
  const obj = {};
  for (const [i, field] of fields.entries()) {
    try {
      obj[field] = JSON.parse(result[i]);
    } catch {
      obj[field] = result[i];
    }
  }
  return obj;
}
function deserialize4(result) {
  const obj = {};
  for (const e of result) {
    for (let i = 0; i < e.length; i += 2) {
      const streamId = e[i];
      const entries = e[i + 1];
      if (!(streamId in obj)) {
        obj[streamId] = {};
      }
      for (let j2 = 0; j2 < entries.length; j2 += 2) {
        const field = entries[j2];
        const value = entries[j2 + 1];
        try {
          obj[streamId][field] = JSON.parse(value);
        } catch {
          obj[streamId][field] = value;
        }
      }
    }
  }
  return obj;
}
function deserialize5(result) {
  const obj = {};
  for (const e of result) {
    for (let i = 0; i < e.length; i += 2) {
      const streamId = e[i];
      const entries = e[i + 1];
      if (!(streamId in obj)) {
        obj[streamId] = {};
      }
      for (let j2 = 0; j2 < entries.length; j2 += 2) {
        const field = entries[j2];
        const value = entries[j2 + 1];
        try {
          obj[streamId][field] = JSON.parse(value);
        } catch {
          obj[streamId][field] = value;
        }
      }
    }
  }
  return obj;
}
function createAutoPipelineProxy(_redis, json) {
  const redis3 = _redis;
  if (!redis3.autoPipelineExecutor) {
    redis3.autoPipelineExecutor = new AutoPipelineExecutor(redis3);
  }
  return new Proxy(redis3, {
    get: (redis22, command) => {
      if (command === "pipelineCounter") {
        return redis22.autoPipelineExecutor.pipelineCounter;
      }
      if (command === "json") {
        return createAutoPipelineProxy(redis22, true);
      }
      const commandInRedisButNotPipeline = command in redis22 && !(command in redis22.autoPipelineExecutor.pipeline);
      if (commandInRedisButNotPipeline) {
        return redis22[command];
      }
      const isFunction = json ? typeof redis22.autoPipelineExecutor.pipeline.json[command] === "function" : typeof redis22.autoPipelineExecutor.pipeline[command] === "function";
      if (isFunction) {
        return (...args) => {
          return redis22.autoPipelineExecutor.withAutoPipeline((pipeline) => {
            if (json) {
              pipeline.json[command](
                ...args
              );
            } else {
              pipeline[command](...args);
            }
          });
        };
      }
      return redis22.autoPipelineExecutor.pipeline[command];
    }
  });
}
var import_enc_hex, import_sha1, __defProp2, __export2, error_exports, UpstashError, UrlError, HttpClient, defaultSerializer, Command, HRandFieldCommand, AppendCommand, BitCountCommand, BitFieldCommand, BitOpCommand, BitPosCommand, CopyCommand, DBSizeCommand, DecrCommand, DecrByCommand, DelCommand, EchoCommand, EvalCommand, EvalshaCommand, ExecCommand, ExistsCommand, ExpireCommand, ExpireAtCommand, FlushAllCommand, FlushDBCommand, GeoAddCommand, GeoDistCommand, GeoHashCommand, GeoPosCommand, GeoSearchCommand, GeoSearchStoreCommand, GetCommand, GetBitCommand, GetDelCommand, GetExCommand, GetRangeCommand, GetSetCommand, HDelCommand, HExistsCommand, HGetCommand, HGetAllCommand, HIncrByCommand, HIncrByFloatCommand, HKeysCommand, HLenCommand, HMGetCommand, HMSetCommand, HScanCommand, HSetCommand, HSetNXCommand, HStrLenCommand, HValsCommand, IncrCommand, IncrByCommand, IncrByFloatCommand, JsonArrAppendCommand, JsonArrIndexCommand, JsonArrInsertCommand, JsonArrLenCommand, JsonArrPopCommand, JsonArrTrimCommand, JsonClearCommand, JsonDelCommand, JsonForgetCommand, JsonGetCommand, JsonMGetCommand, JsonMSetCommand, JsonNumIncrByCommand, JsonNumMultByCommand, JsonObjKeysCommand, JsonObjLenCommand, JsonRespCommand, JsonSetCommand, JsonStrAppendCommand, JsonStrLenCommand, JsonToggleCommand, JsonTypeCommand, KeysCommand, LIndexCommand, LInsertCommand, LLenCommand, LMoveCommand, LmPopCommand, LPopCommand, LPosCommand, LPushCommand, LPushXCommand, LRangeCommand, LRemCommand, LSetCommand, LTrimCommand, MGetCommand, MSetCommand, MSetNXCommand, PersistCommand, PExpireCommand, PExpireAtCommand, PfAddCommand, PfCountCommand, PfMergeCommand, PingCommand, PSetEXCommand, PTtlCommand, PublishCommand, RandomKeyCommand, RenameCommand, RenameNXCommand, RPopCommand, RPushCommand, RPushXCommand, SAddCommand, ScanCommand, SCardCommand, ScriptExistsCommand, ScriptFlushCommand, ScriptLoadCommand, SDiffCommand, SDiffStoreCommand, SetCommand, SetBitCommand, SetExCommand, SetNxCommand, SetRangeCommand, SInterCommand, SInterStoreCommand, SIsMemberCommand, SMembersCommand, SMIsMemberCommand, SMoveCommand, SPopCommand, SRandMemberCommand, SRemCommand, SScanCommand, StrLenCommand, SUnionCommand, SUnionStoreCommand, TimeCommand, TouchCommand, TtlCommand, TypeCommand, UnlinkCommand, XAckCommand, XAddCommand, XAutoClaim, XClaimCommand, XDelCommand, XGroupCommand, XInfoCommand, XLenCommand, XPendingCommand, XRangeCommand, UNBALANCED_XREAD_ERR, XReadCommand, UNBALANCED_XREADGROUP_ERR, XReadGroupCommand, XRevRangeCommand, XTrimCommand, ZAddCommand, ZCardCommand, ZCountCommand, ZIncrByCommand, ZInterStoreCommand, ZLexCountCommand, ZPopMaxCommand, ZPopMinCommand, ZRangeCommand, ZRankCommand, ZRemCommand, ZRemRangeByLexCommand, ZRemRangeByRankCommand, ZRemRangeByScoreCommand, ZRevRankCommand, ZScanCommand, ZScoreCommand, ZUnionCommand, ZUnionStoreCommand, ZDiffStoreCommand, ZMScoreCommand, Pipeline, AutoPipelineExecutor, PSubscribeCommand, Subscriber, SubscribeCommand, Script, Redis, VERSION;
var init_chunk_56TVFNIH = __esm({
  "../../node_modules/@upstash/redis/chunk-56TVFNIH.mjs"() {
    "use strict";
    import_enc_hex = __toESM(require_enc_hex(), 1);
    import_sha1 = __toESM(require_sha1(), 1);
    __defProp2 = Object.defineProperty;
    __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    error_exports = {};
    __export2(error_exports, {
      UpstashError: () => UpstashError,
      UrlError: () => UrlError
    });
    UpstashError = class extends Error {
      constructor(message) {
        super(message);
        this.name = "UpstashError";
      }
    };
    UrlError = class extends Error {
      constructor(url) {
        super(
          `Upstash Redis client was passed an invalid URL. You should pass a URL starting with https. Received: "${url}". `
        );
        this.name = "UrlError";
      }
    };
    HttpClient = class {
      constructor(config3) {
        __publicField(this, "baseUrl");
        __publicField(this, "headers");
        __publicField(this, "options");
        __publicField(this, "readYourWrites");
        __publicField(this, "upstashSyncToken", "");
        __publicField(this, "hasCredentials");
        __publicField(this, "retry");
        this.options = {
          backend: config3.options?.backend,
          agent: config3.agent,
          responseEncoding: config3.responseEncoding ?? "base64",
          // default to base64
          cache: config3.cache,
          signal: config3.signal,
          keepAlive: config3.keepAlive ?? true
        };
        this.upstashSyncToken = "";
        this.readYourWrites = config3.readYourWrites ?? true;
        this.baseUrl = (config3.baseUrl || "").replace(/\/$/, "");
        const urlRegex = /^https?:\/\/[^\s#$./?].\S*$/;
        if (this.baseUrl && !urlRegex.test(this.baseUrl)) {
          throw new UrlError(this.baseUrl);
        }
        this.headers = {
          "Content-Type": "application/json",
          ...config3.headers
        };
        this.hasCredentials = Boolean(this.baseUrl && this.headers.authorization.split(" ")[1]);
        if (this.options.responseEncoding === "base64") {
          this.headers["Upstash-Encoding"] = "base64";
        }
        this.retry = typeof config3.retry === "boolean" && !config3.retry ? {
          attempts: 1,
          backoff: () => 0
        } : {
          attempts: config3.retry?.retries ?? 5,
          backoff: config3.retry?.backoff ?? ((retryCount) => Math.exp(retryCount) * 50)
        };
      }
      mergeTelemetry(telemetry) {
        this.headers = merge(this.headers, "Upstash-Telemetry-Runtime", telemetry.runtime);
        this.headers = merge(this.headers, "Upstash-Telemetry-Platform", telemetry.platform);
        this.headers = merge(this.headers, "Upstash-Telemetry-Sdk", telemetry.sdk);
      }
      async request(req) {
        const requestHeaders = mergeHeaders(this.headers, req.headers ?? {});
        const requestUrl = [this.baseUrl, ...req.path ?? []].join("/");
        const isEventStream = requestHeaders.Accept === "text/event-stream";
        const requestOptions = {
          //@ts-expect-error this should throw due to bun regression
          cache: this.options.cache,
          method: "POST",
          headers: requestHeaders,
          body: JSON.stringify(req.body),
          keepalive: this.options.keepAlive,
          agent: this.options.agent,
          signal: req.signal ?? this.options.signal,
          /**
           * Fastly specific
           */
          backend: this.options.backend
        };
        if (!this.hasCredentials) {
          console.warn(
            "[Upstash Redis] Redis client was initialized without url or token. Failed to execute command."
          );
        }
        if (this.readYourWrites) {
          const newHeader = this.upstashSyncToken;
          this.headers["upstash-sync-token"] = newHeader;
        }
        let res = null;
        let error = null;
        for (let i = 0; i <= this.retry.attempts; i++) {
          try {
            res = await fetch(requestUrl, requestOptions);
            break;
          } catch (error_) {
            if (this.options.signal?.aborted) {
              const myBlob = new Blob([
                JSON.stringify({ result: this.options.signal.reason ?? "Aborted" })
              ]);
              const myOptions = {
                status: 200,
                statusText: this.options.signal.reason ?? "Aborted"
              };
              res = new Response(myBlob, myOptions);
              break;
            }
            error = error_;
            if (i < this.retry.attempts) {
              await new Promise((r) => setTimeout(r, this.retry.backoff(i)));
            }
          }
        }
        if (!res) {
          throw error ?? new Error("Exhausted all retries");
        }
        if (!res.ok) {
          const body2 = await res.json();
          throw new UpstashError(`${body2.error}, command was: ${JSON.stringify(req.body)}`);
        }
        if (this.readYourWrites) {
          const headers = res.headers;
          this.upstashSyncToken = headers.get("upstash-sync-token") ?? "";
        }
        if (isEventStream && req && req.onMessage && res.body) {
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          (async () => {
            try {
              while (true) {
                const { value, done } = await reader.read();
                if (done)
                  break;
                const chunk = decoder.decode(value);
                const lines = chunk.split("\n");
                for (const line of lines) {
                  if (line.startsWith("data: ")) {
                    const data = line.slice(6);
                    req.onMessage?.(data);
                  }
                }
              }
            } catch (error2) {
              if (error2 instanceof Error && error2.name === "AbortError") {
              } else {
                console.error("Stream reading error:", error2);
              }
            } finally {
              try {
                await reader.cancel();
              } catch {
              }
            }
          })();
          return { result: 1 };
        }
        const body = await res.json();
        if (this.readYourWrites) {
          const headers = res.headers;
          this.upstashSyncToken = headers.get("upstash-sync-token") ?? "";
        }
        if (this.options.responseEncoding === "base64") {
          if (Array.isArray(body)) {
            return body.map(({ result: result2, error: error2 }) => ({
              result: decode(result2),
              error: error2
            }));
          }
          const result = decode(body.result);
          return { result, error: body.error };
        }
        return body;
      }
    };
    defaultSerializer = (c) => {
      switch (typeof c) {
        case "string":
        case "number":
        case "boolean": {
          return c;
        }
        default: {
          return JSON.stringify(c);
        }
      }
    };
    Command = class {
      /**
       * Create a new command instance.
       *
       * You can define a custom `deserialize` function. By default we try to deserialize as json.
       */
      constructor(command, opts) {
        __publicField(this, "command");
        __publicField(this, "serialize");
        __publicField(this, "deserialize");
        __publicField(this, "headers");
        __publicField(this, "path");
        __publicField(this, "onMessage");
        __publicField(this, "isStreaming");
        __publicField(this, "signal");
        this.serialize = defaultSerializer;
        this.deserialize = opts?.automaticDeserialization === void 0 || opts.automaticDeserialization ? opts?.deserialize ?? parseResponse : (x2) => x2;
        this.command = command.map((c) => this.serialize(c));
        this.headers = opts?.headers;
        this.path = opts?.path;
        this.onMessage = opts?.streamOptions?.onMessage;
        this.isStreaming = opts?.streamOptions?.isStreaming ?? false;
        this.signal = opts?.streamOptions?.signal;
        if (opts?.latencyLogging) {
          const originalExec = this.exec.bind(this);
          this.exec = async (client) => {
            const start = performance.now();
            const result = await originalExec(client);
            const end = performance.now();
            const loggerResult = (end - start).toFixed(2);
            console.log(
              `Latency for \x1B[38;2;19;185;39m${this.command[0].toString().toUpperCase()}\x1B[0m: \x1B[38;2;0;255;255m${loggerResult} ms\x1B[0m`
            );
            return result;
          };
        }
      }
      /**
       * Execute the command using a client.
       */
      async exec(client) {
        const { result, error } = await client.request({
          body: this.command,
          path: this.path,
          upstashSyncToken: client.upstashSyncToken,
          headers: this.headers,
          onMessage: this.onMessage,
          isStreaming: this.isStreaming,
          signal: this.signal
        });
        if (error) {
          throw new UpstashError(error);
        }
        if (result === void 0) {
          throw new TypeError("Request did not return a result");
        }
        return this.deserialize(result);
      }
    };
    HRandFieldCommand = class extends Command {
      constructor(cmd, opts) {
        const command = ["hrandfield", cmd[0]];
        if (typeof cmd[1] === "number") {
          command.push(cmd[1]);
        }
        if (cmd[2]) {
          command.push("WITHVALUES");
        }
        super(command, {
          // @ts-expect-error to silence compiler
          deserialize: cmd[2] ? (result) => deserialize(result) : opts?.deserialize,
          ...opts
        });
      }
    };
    AppendCommand = class extends Command {
      constructor(cmd, opts) {
        super(["append", ...cmd], opts);
      }
    };
    BitCountCommand = class extends Command {
      constructor([key, start, end], opts) {
        const command = ["bitcount", key];
        if (typeof start === "number") {
          command.push(start);
        }
        if (typeof end === "number") {
          command.push(end);
        }
        super(command, opts);
      }
    };
    BitFieldCommand = class {
      constructor(args, client, opts, execOperation = (command) => command.exec(this.client)) {
        __publicField(this, "command");
        this.client = client;
        this.opts = opts;
        this.execOperation = execOperation;
        this.command = ["bitfield", ...args];
      }
      chain(...args) {
        this.command.push(...args);
        return this;
      }
      get(...args) {
        return this.chain("get", ...args);
      }
      set(...args) {
        return this.chain("set", ...args);
      }
      incrby(...args) {
        return this.chain("incrby", ...args);
      }
      overflow(overflow) {
        return this.chain("overflow", overflow);
      }
      exec() {
        const command = new Command(this.command, this.opts);
        return this.execOperation(command);
      }
    };
    BitOpCommand = class extends Command {
      constructor(cmd, opts) {
        super(["bitop", ...cmd], opts);
      }
    };
    BitPosCommand = class extends Command {
      constructor(cmd, opts) {
        super(["bitpos", ...cmd], opts);
      }
    };
    CopyCommand = class extends Command {
      constructor([key, destinationKey, opts], commandOptions) {
        super(["COPY", key, destinationKey, ...opts?.replace ? ["REPLACE"] : []], {
          ...commandOptions,
          deserialize(result) {
            if (result > 0) {
              return "COPIED";
            }
            return "NOT_COPIED";
          }
        });
      }
    };
    DBSizeCommand = class extends Command {
      constructor(opts) {
        super(["dbsize"], opts);
      }
    };
    DecrCommand = class extends Command {
      constructor(cmd, opts) {
        super(["decr", ...cmd], opts);
      }
    };
    DecrByCommand = class extends Command {
      constructor(cmd, opts) {
        super(["decrby", ...cmd], opts);
      }
    };
    DelCommand = class extends Command {
      constructor(cmd, opts) {
        super(["del", ...cmd], opts);
      }
    };
    EchoCommand = class extends Command {
      constructor(cmd, opts) {
        super(["echo", ...cmd], opts);
      }
    };
    EvalCommand = class extends Command {
      constructor([script, keys, args], opts) {
        super(["eval", script, keys.length, ...keys, ...args ?? []], opts);
      }
    };
    EvalshaCommand = class extends Command {
      constructor([sha, keys, args], opts) {
        super(["evalsha", sha, keys.length, ...keys, ...args ?? []], opts);
      }
    };
    ExecCommand = class extends Command {
      constructor(cmd, opts) {
        const normalizedCmd = cmd.map((arg) => typeof arg === "string" ? arg : String(arg));
        super(normalizedCmd, opts);
      }
    };
    ExistsCommand = class extends Command {
      constructor(cmd, opts) {
        super(["exists", ...cmd], opts);
      }
    };
    ExpireCommand = class extends Command {
      constructor(cmd, opts) {
        super(["expire", ...cmd.filter(Boolean)], opts);
      }
    };
    ExpireAtCommand = class extends Command {
      constructor(cmd, opts) {
        super(["expireat", ...cmd], opts);
      }
    };
    FlushAllCommand = class extends Command {
      constructor(args, opts) {
        const command = ["flushall"];
        if (args && args.length > 0 && args[0].async) {
          command.push("async");
        }
        super(command, opts);
      }
    };
    FlushDBCommand = class extends Command {
      constructor([opts], cmdOpts) {
        const command = ["flushdb"];
        if (opts?.async) {
          command.push("async");
        }
        super(command, cmdOpts);
      }
    };
    GeoAddCommand = class extends Command {
      constructor([key, arg1, ...arg2], opts) {
        const command = ["geoadd", key];
        if ("nx" in arg1 && arg1.nx) {
          command.push("nx");
        } else if ("xx" in arg1 && arg1.xx) {
          command.push("xx");
        }
        if ("ch" in arg1 && arg1.ch) {
          command.push("ch");
        }
        if ("latitude" in arg1 && arg1.latitude) {
          command.push(arg1.longitude, arg1.latitude, arg1.member);
        }
        command.push(
          ...arg2.flatMap(({ latitude, longitude, member }) => [longitude, latitude, member])
        );
        super(command, opts);
      }
    };
    GeoDistCommand = class extends Command {
      constructor([key, member1, member2, unit = "M"], opts) {
        super(["GEODIST", key, member1, member2, unit], opts);
      }
    };
    GeoHashCommand = class extends Command {
      constructor(cmd, opts) {
        const [key] = cmd;
        const members = Array.isArray(cmd[1]) ? cmd[1] : cmd.slice(1);
        super(["GEOHASH", key, ...members], opts);
      }
    };
    GeoPosCommand = class extends Command {
      constructor(cmd, opts) {
        const [key] = cmd;
        const members = Array.isArray(cmd[1]) ? cmd[1] : cmd.slice(1);
        super(["GEOPOS", key, ...members], {
          deserialize: (result) => transform(result),
          ...opts
        });
      }
    };
    GeoSearchCommand = class extends Command {
      constructor([key, centerPoint, shape, order, opts], commandOptions) {
        const command = ["GEOSEARCH", key];
        if (centerPoint.type === "FROMMEMBER" || centerPoint.type === "frommember") {
          command.push(centerPoint.type, centerPoint.member);
        }
        if (centerPoint.type === "FROMLONLAT" || centerPoint.type === "fromlonlat") {
          command.push(centerPoint.type, centerPoint.coordinate.lon, centerPoint.coordinate.lat);
        }
        if (shape.type === "BYRADIUS" || shape.type === "byradius") {
          command.push(shape.type, shape.radius, shape.radiusType);
        }
        if (shape.type === "BYBOX" || shape.type === "bybox") {
          command.push(shape.type, shape.rect.width, shape.rect.height, shape.rectType);
        }
        command.push(order);
        if (opts?.count) {
          command.push("COUNT", opts.count.limit, ...opts.count.any ? ["ANY"] : []);
        }
        const transform2 = (result) => {
          if (!opts?.withCoord && !opts?.withDist && !opts?.withHash) {
            return result.map((member) => {
              try {
                return { member: JSON.parse(member) };
              } catch {
                return { member };
              }
            });
          }
          return result.map((members) => {
            let counter = 1;
            const obj = {};
            try {
              obj.member = JSON.parse(members[0]);
            } catch {
              obj.member = members[0];
            }
            if (opts.withDist) {
              obj.dist = Number.parseFloat(members[counter++]);
            }
            if (opts.withHash) {
              obj.hash = members[counter++].toString();
            }
            if (opts.withCoord) {
              obj.coord = {
                long: Number.parseFloat(members[counter][0]),
                lat: Number.parseFloat(members[counter][1])
              };
            }
            return obj;
          });
        };
        super(
          [
            ...command,
            ...opts?.withCoord ? ["WITHCOORD"] : [],
            ...opts?.withDist ? ["WITHDIST"] : [],
            ...opts?.withHash ? ["WITHHASH"] : []
          ],
          {
            deserialize: transform2,
            ...commandOptions
          }
        );
      }
    };
    GeoSearchStoreCommand = class extends Command {
      constructor([destination, key, centerPoint, shape, order, opts], commandOptions) {
        const command = ["GEOSEARCHSTORE", destination, key];
        if (centerPoint.type === "FROMMEMBER" || centerPoint.type === "frommember") {
          command.push(centerPoint.type, centerPoint.member);
        }
        if (centerPoint.type === "FROMLONLAT" || centerPoint.type === "fromlonlat") {
          command.push(centerPoint.type, centerPoint.coordinate.lon, centerPoint.coordinate.lat);
        }
        if (shape.type === "BYRADIUS" || shape.type === "byradius") {
          command.push(shape.type, shape.radius, shape.radiusType);
        }
        if (shape.type === "BYBOX" || shape.type === "bybox") {
          command.push(shape.type, shape.rect.width, shape.rect.height, shape.rectType);
        }
        command.push(order);
        if (opts?.count) {
          command.push("COUNT", opts.count.limit, ...opts.count.any ? ["ANY"] : []);
        }
        super([...command, ...opts?.storeDist ? ["STOREDIST"] : []], commandOptions);
      }
    };
    GetCommand = class extends Command {
      constructor(cmd, opts) {
        super(["get", ...cmd], opts);
      }
    };
    GetBitCommand = class extends Command {
      constructor(cmd, opts) {
        super(["getbit", ...cmd], opts);
      }
    };
    GetDelCommand = class extends Command {
      constructor(cmd, opts) {
        super(["getdel", ...cmd], opts);
      }
    };
    GetExCommand = class extends Command {
      constructor([key, opts], cmdOpts) {
        const command = ["getex", key];
        if (opts) {
          if ("ex" in opts && typeof opts.ex === "number") {
            command.push("ex", opts.ex);
          } else if ("px" in opts && typeof opts.px === "number") {
            command.push("px", opts.px);
          } else if ("exat" in opts && typeof opts.exat === "number") {
            command.push("exat", opts.exat);
          } else if ("pxat" in opts && typeof opts.pxat === "number") {
            command.push("pxat", opts.pxat);
          } else if ("persist" in opts && opts.persist) {
            command.push("persist");
          }
        }
        super(command, cmdOpts);
      }
    };
    GetRangeCommand = class extends Command {
      constructor(cmd, opts) {
        super(["getrange", ...cmd], opts);
      }
    };
    GetSetCommand = class extends Command {
      constructor(cmd, opts) {
        super(["getset", ...cmd], opts);
      }
    };
    HDelCommand = class extends Command {
      constructor(cmd, opts) {
        super(["hdel", ...cmd], opts);
      }
    };
    HExistsCommand = class extends Command {
      constructor(cmd, opts) {
        super(["hexists", ...cmd], opts);
      }
    };
    HGetCommand = class extends Command {
      constructor(cmd, opts) {
        super(["hget", ...cmd], opts);
      }
    };
    HGetAllCommand = class extends Command {
      constructor(cmd, opts) {
        super(["hgetall", ...cmd], {
          deserialize: (result) => deserialize2(result),
          ...opts
        });
      }
    };
    HIncrByCommand = class extends Command {
      constructor(cmd, opts) {
        super(["hincrby", ...cmd], opts);
      }
    };
    HIncrByFloatCommand = class extends Command {
      constructor(cmd, opts) {
        super(["hincrbyfloat", ...cmd], opts);
      }
    };
    HKeysCommand = class extends Command {
      constructor([key], opts) {
        super(["hkeys", key], opts);
      }
    };
    HLenCommand = class extends Command {
      constructor(cmd, opts) {
        super(["hlen", ...cmd], opts);
      }
    };
    HMGetCommand = class extends Command {
      constructor([key, ...fields], opts) {
        super(["hmget", key, ...fields], {
          deserialize: (result) => deserialize3(fields, result),
          ...opts
        });
      }
    };
    HMSetCommand = class extends Command {
      constructor([key, kv], opts) {
        super(["hmset", key, ...Object.entries(kv).flatMap(([field, value]) => [field, value])], opts);
      }
    };
    HScanCommand = class extends Command {
      constructor([key, cursor, cmdOpts], opts) {
        const command = ["hscan", key, cursor];
        if (cmdOpts?.match) {
          command.push("match", cmdOpts.match);
        }
        if (typeof cmdOpts?.count === "number") {
          command.push("count", cmdOpts.count);
        }
        super(command, {
          deserialize: deserializeScanResponse,
          ...opts
        });
      }
    };
    HSetCommand = class extends Command {
      constructor([key, kv], opts) {
        super(["hset", key, ...Object.entries(kv).flatMap(([field, value]) => [field, value])], opts);
      }
    };
    HSetNXCommand = class extends Command {
      constructor(cmd, opts) {
        super(["hsetnx", ...cmd], opts);
      }
    };
    HStrLenCommand = class extends Command {
      constructor(cmd, opts) {
        super(["hstrlen", ...cmd], opts);
      }
    };
    HValsCommand = class extends Command {
      constructor(cmd, opts) {
        super(["hvals", ...cmd], opts);
      }
    };
    IncrCommand = class extends Command {
      constructor(cmd, opts) {
        super(["incr", ...cmd], opts);
      }
    };
    IncrByCommand = class extends Command {
      constructor(cmd, opts) {
        super(["incrby", ...cmd], opts);
      }
    };
    IncrByFloatCommand = class extends Command {
      constructor(cmd, opts) {
        super(["incrbyfloat", ...cmd], opts);
      }
    };
    JsonArrAppendCommand = class extends Command {
      constructor(cmd, opts) {
        super(["JSON.ARRAPPEND", ...cmd], opts);
      }
    };
    JsonArrIndexCommand = class extends Command {
      constructor(cmd, opts) {
        super(["JSON.ARRINDEX", ...cmd], opts);
      }
    };
    JsonArrInsertCommand = class extends Command {
      constructor(cmd, opts) {
        super(["JSON.ARRINSERT", ...cmd], opts);
      }
    };
    JsonArrLenCommand = class extends Command {
      constructor(cmd, opts) {
        super(["JSON.ARRLEN", cmd[0], cmd[1] ?? "$"], opts);
      }
    };
    JsonArrPopCommand = class extends Command {
      constructor(cmd, opts) {
        super(["JSON.ARRPOP", ...cmd], opts);
      }
    };
    JsonArrTrimCommand = class extends Command {
      constructor(cmd, opts) {
        const path = cmd[1] ?? "$";
        const start = cmd[2] ?? 0;
        const stop = cmd[3] ?? 0;
        super(["JSON.ARRTRIM", cmd[0], path, start, stop], opts);
      }
    };
    JsonClearCommand = class extends Command {
      constructor(cmd, opts) {
        super(["JSON.CLEAR", ...cmd], opts);
      }
    };
    JsonDelCommand = class extends Command {
      constructor(cmd, opts) {
        super(["JSON.DEL", ...cmd], opts);
      }
    };
    JsonForgetCommand = class extends Command {
      constructor(cmd, opts) {
        super(["JSON.FORGET", ...cmd], opts);
      }
    };
    JsonGetCommand = class extends Command {
      constructor(cmd, opts) {
        const command = ["JSON.GET"];
        if (typeof cmd[1] === "string") {
          command.push(...cmd);
        } else {
          command.push(cmd[0]);
          if (cmd[1]) {
            if (cmd[1].indent) {
              command.push("INDENT", cmd[1].indent);
            }
            if (cmd[1].newline) {
              command.push("NEWLINE", cmd[1].newline);
            }
            if (cmd[1].space) {
              command.push("SPACE", cmd[1].space);
            }
          }
          command.push(...cmd.slice(2));
        }
        super(command, opts);
      }
    };
    JsonMGetCommand = class extends Command {
      constructor(cmd, opts) {
        super(["JSON.MGET", ...cmd[0], cmd[1]], opts);
      }
    };
    JsonMSetCommand = class extends Command {
      constructor(cmd, opts) {
        const command = ["JSON.MSET"];
        for (const c of cmd) {
          command.push(c.key, c.path, c.value);
        }
        super(command, opts);
      }
    };
    JsonNumIncrByCommand = class extends Command {
      constructor(cmd, opts) {
        super(["JSON.NUMINCRBY", ...cmd], opts);
      }
    };
    JsonNumMultByCommand = class extends Command {
      constructor(cmd, opts) {
        super(["JSON.NUMMULTBY", ...cmd], opts);
      }
    };
    JsonObjKeysCommand = class extends Command {
      constructor(cmd, opts) {
        super(["JSON.OBJKEYS", ...cmd], opts);
      }
    };
    JsonObjLenCommand = class extends Command {
      constructor(cmd, opts) {
        super(["JSON.OBJLEN", ...cmd], opts);
      }
    };
    JsonRespCommand = class extends Command {
      constructor(cmd, opts) {
        super(["JSON.RESP", ...cmd], opts);
      }
    };
    JsonSetCommand = class extends Command {
      constructor(cmd, opts) {
        const command = ["JSON.SET", cmd[0], cmd[1], cmd[2]];
        if (cmd[3]) {
          if (cmd[3].nx) {
            command.push("NX");
          } else if (cmd[3].xx) {
            command.push("XX");
          }
        }
        super(command, opts);
      }
    };
    JsonStrAppendCommand = class extends Command {
      constructor(cmd, opts) {
        super(["JSON.STRAPPEND", ...cmd], opts);
      }
    };
    JsonStrLenCommand = class extends Command {
      constructor(cmd, opts) {
        super(["JSON.STRLEN", ...cmd], opts);
      }
    };
    JsonToggleCommand = class extends Command {
      constructor(cmd, opts) {
        super(["JSON.TOGGLE", ...cmd], opts);
      }
    };
    JsonTypeCommand = class extends Command {
      constructor(cmd, opts) {
        super(["JSON.TYPE", ...cmd], opts);
      }
    };
    KeysCommand = class extends Command {
      constructor(cmd, opts) {
        super(["keys", ...cmd], opts);
      }
    };
    LIndexCommand = class extends Command {
      constructor(cmd, opts) {
        super(["lindex", ...cmd], opts);
      }
    };
    LInsertCommand = class extends Command {
      constructor(cmd, opts) {
        super(["linsert", ...cmd], opts);
      }
    };
    LLenCommand = class extends Command {
      constructor(cmd, opts) {
        super(["llen", ...cmd], opts);
      }
    };
    LMoveCommand = class extends Command {
      constructor(cmd, opts) {
        super(["lmove", ...cmd], opts);
      }
    };
    LmPopCommand = class extends Command {
      constructor(cmd, opts) {
        const [numkeys, keys, direction, count] = cmd;
        super(["LMPOP", numkeys, ...keys, direction, ...count ? ["COUNT", count] : []], opts);
      }
    };
    LPopCommand = class extends Command {
      constructor(cmd, opts) {
        super(["lpop", ...cmd], opts);
      }
    };
    LPosCommand = class extends Command {
      constructor(cmd, opts) {
        const args = ["lpos", cmd[0], cmd[1]];
        if (typeof cmd[2]?.rank === "number") {
          args.push("rank", cmd[2].rank);
        }
        if (typeof cmd[2]?.count === "number") {
          args.push("count", cmd[2].count);
        }
        if (typeof cmd[2]?.maxLen === "number") {
          args.push("maxLen", cmd[2].maxLen);
        }
        super(args, opts);
      }
    };
    LPushCommand = class extends Command {
      constructor(cmd, opts) {
        super(["lpush", ...cmd], opts);
      }
    };
    LPushXCommand = class extends Command {
      constructor(cmd, opts) {
        super(["lpushx", ...cmd], opts);
      }
    };
    LRangeCommand = class extends Command {
      constructor(cmd, opts) {
        super(["lrange", ...cmd], opts);
      }
    };
    LRemCommand = class extends Command {
      constructor(cmd, opts) {
        super(["lrem", ...cmd], opts);
      }
    };
    LSetCommand = class extends Command {
      constructor(cmd, opts) {
        super(["lset", ...cmd], opts);
      }
    };
    LTrimCommand = class extends Command {
      constructor(cmd, opts) {
        super(["ltrim", ...cmd], opts);
      }
    };
    MGetCommand = class extends Command {
      constructor(cmd, opts) {
        const keys = Array.isArray(cmd[0]) ? cmd[0] : cmd;
        super(["mget", ...keys], opts);
      }
    };
    MSetCommand = class extends Command {
      constructor([kv], opts) {
        super(["mset", ...Object.entries(kv).flatMap(([key, value]) => [key, value])], opts);
      }
    };
    MSetNXCommand = class extends Command {
      constructor([kv], opts) {
        super(["msetnx", ...Object.entries(kv).flat()], opts);
      }
    };
    PersistCommand = class extends Command {
      constructor(cmd, opts) {
        super(["persist", ...cmd], opts);
      }
    };
    PExpireCommand = class extends Command {
      constructor(cmd, opts) {
        super(["pexpire", ...cmd], opts);
      }
    };
    PExpireAtCommand = class extends Command {
      constructor(cmd, opts) {
        super(["pexpireat", ...cmd], opts);
      }
    };
    PfAddCommand = class extends Command {
      constructor(cmd, opts) {
        super(["pfadd", ...cmd], opts);
      }
    };
    PfCountCommand = class extends Command {
      constructor(cmd, opts) {
        super(["pfcount", ...cmd], opts);
      }
    };
    PfMergeCommand = class extends Command {
      constructor(cmd, opts) {
        super(["pfmerge", ...cmd], opts);
      }
    };
    PingCommand = class extends Command {
      constructor(cmd, opts) {
        const command = ["ping"];
        if (cmd?.[0] !== void 0) {
          command.push(cmd[0]);
        }
        super(command, opts);
      }
    };
    PSetEXCommand = class extends Command {
      constructor(cmd, opts) {
        super(["psetex", ...cmd], opts);
      }
    };
    PTtlCommand = class extends Command {
      constructor(cmd, opts) {
        super(["pttl", ...cmd], opts);
      }
    };
    PublishCommand = class extends Command {
      constructor(cmd, opts) {
        super(["publish", ...cmd], opts);
      }
    };
    RandomKeyCommand = class extends Command {
      constructor(opts) {
        super(["randomkey"], opts);
      }
    };
    RenameCommand = class extends Command {
      constructor(cmd, opts) {
        super(["rename", ...cmd], opts);
      }
    };
    RenameNXCommand = class extends Command {
      constructor(cmd, opts) {
        super(["renamenx", ...cmd], opts);
      }
    };
    RPopCommand = class extends Command {
      constructor(cmd, opts) {
        super(["rpop", ...cmd], opts);
      }
    };
    RPushCommand = class extends Command {
      constructor(cmd, opts) {
        super(["rpush", ...cmd], opts);
      }
    };
    RPushXCommand = class extends Command {
      constructor(cmd, opts) {
        super(["rpushx", ...cmd], opts);
      }
    };
    SAddCommand = class extends Command {
      constructor(cmd, opts) {
        super(["sadd", ...cmd], opts);
      }
    };
    ScanCommand = class extends Command {
      constructor([cursor, opts], cmdOpts) {
        const command = ["scan", cursor];
        if (opts?.match) {
          command.push("match", opts.match);
        }
        if (typeof opts?.count === "number") {
          command.push("count", opts.count);
        }
        if (opts?.type && opts.type.length > 0) {
          command.push("type", opts.type);
        }
        super(command, {
          deserialize: deserializeScanResponse,
          ...cmdOpts
        });
      }
    };
    SCardCommand = class extends Command {
      constructor(cmd, opts) {
        super(["scard", ...cmd], opts);
      }
    };
    ScriptExistsCommand = class extends Command {
      constructor(hashes, opts) {
        super(["script", "exists", ...hashes], {
          deserialize: (result) => result,
          ...opts
        });
      }
    };
    ScriptFlushCommand = class extends Command {
      constructor([opts], cmdOpts) {
        const cmd = ["script", "flush"];
        if (opts?.sync) {
          cmd.push("sync");
        } else if (opts?.async) {
          cmd.push("async");
        }
        super(cmd, cmdOpts);
      }
    };
    ScriptLoadCommand = class extends Command {
      constructor(args, opts) {
        super(["script", "load", ...args], opts);
      }
    };
    SDiffCommand = class extends Command {
      constructor(cmd, opts) {
        super(["sdiff", ...cmd], opts);
      }
    };
    SDiffStoreCommand = class extends Command {
      constructor(cmd, opts) {
        super(["sdiffstore", ...cmd], opts);
      }
    };
    SetCommand = class extends Command {
      constructor([key, value, opts], cmdOpts) {
        const command = ["set", key, value];
        if (opts) {
          if ("nx" in opts && opts.nx) {
            command.push("nx");
          } else if ("xx" in opts && opts.xx) {
            command.push("xx");
          }
          if ("get" in opts && opts.get) {
            command.push("get");
          }
          if ("ex" in opts && typeof opts.ex === "number") {
            command.push("ex", opts.ex);
          } else if ("px" in opts && typeof opts.px === "number") {
            command.push("px", opts.px);
          } else if ("exat" in opts && typeof opts.exat === "number") {
            command.push("exat", opts.exat);
          } else if ("pxat" in opts && typeof opts.pxat === "number") {
            command.push("pxat", opts.pxat);
          } else if ("keepTtl" in opts && opts.keepTtl) {
            command.push("keepTtl");
          }
        }
        super(command, cmdOpts);
      }
    };
    SetBitCommand = class extends Command {
      constructor(cmd, opts) {
        super(["setbit", ...cmd], opts);
      }
    };
    SetExCommand = class extends Command {
      constructor(cmd, opts) {
        super(["setex", ...cmd], opts);
      }
    };
    SetNxCommand = class extends Command {
      constructor(cmd, opts) {
        super(["setnx", ...cmd], opts);
      }
    };
    SetRangeCommand = class extends Command {
      constructor(cmd, opts) {
        super(["setrange", ...cmd], opts);
      }
    };
    SInterCommand = class extends Command {
      constructor(cmd, opts) {
        super(["sinter", ...cmd], opts);
      }
    };
    SInterStoreCommand = class extends Command {
      constructor(cmd, opts) {
        super(["sinterstore", ...cmd], opts);
      }
    };
    SIsMemberCommand = class extends Command {
      constructor(cmd, opts) {
        super(["sismember", ...cmd], opts);
      }
    };
    SMembersCommand = class extends Command {
      constructor(cmd, opts) {
        super(["smembers", ...cmd], opts);
      }
    };
    SMIsMemberCommand = class extends Command {
      constructor(cmd, opts) {
        super(["smismember", cmd[0], ...cmd[1]], opts);
      }
    };
    SMoveCommand = class extends Command {
      constructor(cmd, opts) {
        super(["smove", ...cmd], opts);
      }
    };
    SPopCommand = class extends Command {
      constructor([key, count], opts) {
        const command = ["spop", key];
        if (typeof count === "number") {
          command.push(count);
        }
        super(command, opts);
      }
    };
    SRandMemberCommand = class extends Command {
      constructor([key, count], opts) {
        const command = ["srandmember", key];
        if (typeof count === "number") {
          command.push(count);
        }
        super(command, opts);
      }
    };
    SRemCommand = class extends Command {
      constructor(cmd, opts) {
        super(["srem", ...cmd], opts);
      }
    };
    SScanCommand = class extends Command {
      constructor([key, cursor, opts], cmdOpts) {
        const command = ["sscan", key, cursor];
        if (opts?.match) {
          command.push("match", opts.match);
        }
        if (typeof opts?.count === "number") {
          command.push("count", opts.count);
        }
        super(command, {
          deserialize: deserializeScanResponse,
          ...cmdOpts
        });
      }
    };
    StrLenCommand = class extends Command {
      constructor(cmd, opts) {
        super(["strlen", ...cmd], opts);
      }
    };
    SUnionCommand = class extends Command {
      constructor(cmd, opts) {
        super(["sunion", ...cmd], opts);
      }
    };
    SUnionStoreCommand = class extends Command {
      constructor(cmd, opts) {
        super(["sunionstore", ...cmd], opts);
      }
    };
    TimeCommand = class extends Command {
      constructor(opts) {
        super(["time"], opts);
      }
    };
    TouchCommand = class extends Command {
      constructor(cmd, opts) {
        super(["touch", ...cmd], opts);
      }
    };
    TtlCommand = class extends Command {
      constructor(cmd, opts) {
        super(["ttl", ...cmd], opts);
      }
    };
    TypeCommand = class extends Command {
      constructor(cmd, opts) {
        super(["type", ...cmd], opts);
      }
    };
    UnlinkCommand = class extends Command {
      constructor(cmd, opts) {
        super(["unlink", ...cmd], opts);
      }
    };
    XAckCommand = class extends Command {
      constructor([key, group, id2], opts) {
        const ids = Array.isArray(id2) ? [...id2] : [id2];
        super(["XACK", key, group, ...ids], opts);
      }
    };
    XAddCommand = class extends Command {
      constructor([key, id2, entries, opts], commandOptions) {
        const command = ["XADD", key];
        if (opts) {
          if (opts.nomkStream) {
            command.push("NOMKSTREAM");
          }
          if (opts.trim) {
            command.push(opts.trim.type, opts.trim.comparison, opts.trim.threshold);
            if (opts.trim.limit !== void 0) {
              command.push("LIMIT", opts.trim.limit);
            }
          }
        }
        command.push(id2);
        for (const [k2, v] of Object.entries(entries)) {
          command.push(k2, v);
        }
        super(command, commandOptions);
      }
    };
    XAutoClaim = class extends Command {
      constructor([key, group, consumer, minIdleTime, start, options], opts) {
        const commands = [];
        if (options?.count) {
          commands.push("COUNT", options.count);
        }
        if (options?.justId) {
          commands.push("JUSTID");
        }
        super(["XAUTOCLAIM", key, group, consumer, minIdleTime, start, ...commands], opts);
      }
    };
    XClaimCommand = class extends Command {
      constructor([key, group, consumer, minIdleTime, id2, options], opts) {
        const ids = Array.isArray(id2) ? [...id2] : [id2];
        const commands = [];
        if (options?.idleMS) {
          commands.push("IDLE", options.idleMS);
        }
        if (options?.idleMS) {
          commands.push("TIME", options.timeMS);
        }
        if (options?.retryCount) {
          commands.push("RETRYCOUNT", options.retryCount);
        }
        if (options?.force) {
          commands.push("FORCE");
        }
        if (options?.justId) {
          commands.push("JUSTID");
        }
        if (options?.lastId) {
          commands.push("LASTID", options.lastId);
        }
        super(["XCLAIM", key, group, consumer, minIdleTime, ...ids, ...commands], opts);
      }
    };
    XDelCommand = class extends Command {
      constructor([key, ids], opts) {
        const cmds = Array.isArray(ids) ? [...ids] : [ids];
        super(["XDEL", key, ...cmds], opts);
      }
    };
    XGroupCommand = class extends Command {
      constructor([key, opts], commandOptions) {
        const command = ["XGROUP"];
        switch (opts.type) {
          case "CREATE": {
            command.push("CREATE", key, opts.group, opts.id);
            if (opts.options) {
              if (opts.options.MKSTREAM) {
                command.push("MKSTREAM");
              }
              if (opts.options.ENTRIESREAD !== void 0) {
                command.push("ENTRIESREAD", opts.options.ENTRIESREAD.toString());
              }
            }
            break;
          }
          case "CREATECONSUMER": {
            command.push("CREATECONSUMER", key, opts.group, opts.consumer);
            break;
          }
          case "DELCONSUMER": {
            command.push("DELCONSUMER", key, opts.group, opts.consumer);
            break;
          }
          case "DESTROY": {
            command.push("DESTROY", key, opts.group);
            break;
          }
          case "SETID": {
            command.push("SETID", key, opts.group, opts.id);
            if (opts.options?.ENTRIESREAD !== void 0) {
              command.push("ENTRIESREAD", opts.options.ENTRIESREAD.toString());
            }
            break;
          }
          default: {
            throw new Error("Invalid XGROUP");
          }
        }
        super(command, commandOptions);
      }
    };
    XInfoCommand = class extends Command {
      constructor([key, options], opts) {
        const cmds = [];
        if (options.type === "CONSUMERS") {
          cmds.push("CONSUMERS", key, options.group);
        } else {
          cmds.push("GROUPS", key);
        }
        super(["XINFO", ...cmds], opts);
      }
    };
    XLenCommand = class extends Command {
      constructor(cmd, opts) {
        super(["XLEN", ...cmd], opts);
      }
    };
    XPendingCommand = class extends Command {
      constructor([key, group, start, end, count, options], opts) {
        const consumers = options?.consumer === void 0 ? [] : Array.isArray(options.consumer) ? [...options.consumer] : [options.consumer];
        super(
          [
            "XPENDING",
            key,
            group,
            ...options?.idleTime ? ["IDLE", options.idleTime] : [],
            start,
            end,
            count,
            ...consumers
          ],
          opts
        );
      }
    };
    XRangeCommand = class extends Command {
      constructor([key, start, end, count], opts) {
        const command = ["XRANGE", key, start, end];
        if (typeof count === "number") {
          command.push("COUNT", count);
        }
        super(command, {
          deserialize: (result) => deserialize4(result),
          ...opts
        });
      }
    };
    UNBALANCED_XREAD_ERR = "ERR Unbalanced XREAD list of streams: for each stream key an ID or '$' must be specified";
    XReadCommand = class extends Command {
      constructor([key, id2, options], opts) {
        if (Array.isArray(key) && Array.isArray(id2) && key.length !== id2.length) {
          throw new Error(UNBALANCED_XREAD_ERR);
        }
        const commands = [];
        if (typeof options?.count === "number") {
          commands.push("COUNT", options.count);
        }
        if (typeof options?.blockMS === "number") {
          commands.push("BLOCK", options.blockMS);
        }
        commands.push(
          "STREAMS",
          ...Array.isArray(key) ? [...key] : [key],
          ...Array.isArray(id2) ? [...id2] : [id2]
        );
        super(["XREAD", ...commands], opts);
      }
    };
    UNBALANCED_XREADGROUP_ERR = "ERR Unbalanced XREADGROUP list of streams: for each stream key an ID or '$' must be specified";
    XReadGroupCommand = class extends Command {
      constructor([group, consumer, key, id2, options], opts) {
        if (Array.isArray(key) && Array.isArray(id2) && key.length !== id2.length) {
          throw new Error(UNBALANCED_XREADGROUP_ERR);
        }
        const commands = [];
        if (typeof options?.count === "number") {
          commands.push("COUNT", options.count);
        }
        if (typeof options?.blockMS === "number") {
          commands.push("BLOCK", options.blockMS);
        }
        if (typeof options?.NOACK === "boolean" && options.NOACK) {
          commands.push("NOACK");
        }
        commands.push(
          "STREAMS",
          ...Array.isArray(key) ? [...key] : [key],
          ...Array.isArray(id2) ? [...id2] : [id2]
        );
        super(["XREADGROUP", "GROUP", group, consumer, ...commands], opts);
      }
    };
    XRevRangeCommand = class extends Command {
      constructor([key, end, start, count], opts) {
        const command = ["XREVRANGE", key, end, start];
        if (typeof count === "number") {
          command.push("COUNT", count);
        }
        super(command, {
          deserialize: (result) => deserialize5(result),
          ...opts
        });
      }
    };
    XTrimCommand = class extends Command {
      constructor([key, options], opts) {
        const { limit, strategy, threshold, exactness = "~" } = options;
        super(["XTRIM", key, strategy, exactness, threshold, ...limit ? ["LIMIT", limit] : []], opts);
      }
    };
    ZAddCommand = class extends Command {
      constructor([key, arg1, ...arg2], opts) {
        const command = ["zadd", key];
        if ("nx" in arg1 && arg1.nx) {
          command.push("nx");
        } else if ("xx" in arg1 && arg1.xx) {
          command.push("xx");
        }
        if ("ch" in arg1 && arg1.ch) {
          command.push("ch");
        }
        if ("incr" in arg1 && arg1.incr) {
          command.push("incr");
        }
        if ("lt" in arg1 && arg1.lt) {
          command.push("lt");
        } else if ("gt" in arg1 && arg1.gt) {
          command.push("gt");
        }
        if ("score" in arg1 && "member" in arg1) {
          command.push(arg1.score, arg1.member);
        }
        command.push(...arg2.flatMap(({ score, member }) => [score, member]));
        super(command, opts);
      }
    };
    ZCardCommand = class extends Command {
      constructor(cmd, opts) {
        super(["zcard", ...cmd], opts);
      }
    };
    ZCountCommand = class extends Command {
      constructor(cmd, opts) {
        super(["zcount", ...cmd], opts);
      }
    };
    ZIncrByCommand = class extends Command {
      constructor(cmd, opts) {
        super(["zincrby", ...cmd], opts);
      }
    };
    ZInterStoreCommand = class extends Command {
      constructor([destination, numKeys, keyOrKeys, opts], cmdOpts) {
        const command = ["zinterstore", destination, numKeys];
        if (Array.isArray(keyOrKeys)) {
          command.push(...keyOrKeys);
        } else {
          command.push(keyOrKeys);
        }
        if (opts) {
          if ("weights" in opts && opts.weights) {
            command.push("weights", ...opts.weights);
          } else if ("weight" in opts && typeof opts.weight === "number") {
            command.push("weights", opts.weight);
          }
          if ("aggregate" in opts) {
            command.push("aggregate", opts.aggregate);
          }
        }
        super(command, cmdOpts);
      }
    };
    ZLexCountCommand = class extends Command {
      constructor(cmd, opts) {
        super(["zlexcount", ...cmd], opts);
      }
    };
    ZPopMaxCommand = class extends Command {
      constructor([key, count], opts) {
        const command = ["zpopmax", key];
        if (typeof count === "number") {
          command.push(count);
        }
        super(command, opts);
      }
    };
    ZPopMinCommand = class extends Command {
      constructor([key, count], opts) {
        const command = ["zpopmin", key];
        if (typeof count === "number") {
          command.push(count);
        }
        super(command, opts);
      }
    };
    ZRangeCommand = class extends Command {
      constructor([key, min, max, opts], cmdOpts) {
        const command = ["zrange", key, min, max];
        if (opts?.byScore) {
          command.push("byscore");
        }
        if (opts?.byLex) {
          command.push("bylex");
        }
        if (opts?.rev) {
          command.push("rev");
        }
        if (opts?.count !== void 0 && opts.offset !== void 0) {
          command.push("limit", opts.offset, opts.count);
        }
        if (opts?.withScores) {
          command.push("withscores");
        }
        super(command, cmdOpts);
      }
    };
    ZRankCommand = class extends Command {
      constructor(cmd, opts) {
        super(["zrank", ...cmd], opts);
      }
    };
    ZRemCommand = class extends Command {
      constructor(cmd, opts) {
        super(["zrem", ...cmd], opts);
      }
    };
    ZRemRangeByLexCommand = class extends Command {
      constructor(cmd, opts) {
        super(["zremrangebylex", ...cmd], opts);
      }
    };
    ZRemRangeByRankCommand = class extends Command {
      constructor(cmd, opts) {
        super(["zremrangebyrank", ...cmd], opts);
      }
    };
    ZRemRangeByScoreCommand = class extends Command {
      constructor(cmd, opts) {
        super(["zremrangebyscore", ...cmd], opts);
      }
    };
    ZRevRankCommand = class extends Command {
      constructor(cmd, opts) {
        super(["zrevrank", ...cmd], opts);
      }
    };
    ZScanCommand = class extends Command {
      constructor([key, cursor, opts], cmdOpts) {
        const command = ["zscan", key, cursor];
        if (opts?.match) {
          command.push("match", opts.match);
        }
        if (typeof opts?.count === "number") {
          command.push("count", opts.count);
        }
        super(command, {
          deserialize: deserializeScanResponse,
          ...cmdOpts
        });
      }
    };
    ZScoreCommand = class extends Command {
      constructor(cmd, opts) {
        super(["zscore", ...cmd], opts);
      }
    };
    ZUnionCommand = class extends Command {
      constructor([numKeys, keyOrKeys, opts], cmdOpts) {
        const command = ["zunion", numKeys];
        if (Array.isArray(keyOrKeys)) {
          command.push(...keyOrKeys);
        } else {
          command.push(keyOrKeys);
        }
        if (opts) {
          if ("weights" in opts && opts.weights) {
            command.push("weights", ...opts.weights);
          } else if ("weight" in opts && typeof opts.weight === "number") {
            command.push("weights", opts.weight);
          }
          if ("aggregate" in opts) {
            command.push("aggregate", opts.aggregate);
          }
          if (opts.withScores) {
            command.push("withscores");
          }
        }
        super(command, cmdOpts);
      }
    };
    ZUnionStoreCommand = class extends Command {
      constructor([destination, numKeys, keyOrKeys, opts], cmdOpts) {
        const command = ["zunionstore", destination, numKeys];
        if (Array.isArray(keyOrKeys)) {
          command.push(...keyOrKeys);
        } else {
          command.push(keyOrKeys);
        }
        if (opts) {
          if ("weights" in opts && opts.weights) {
            command.push("weights", ...opts.weights);
          } else if ("weight" in opts && typeof opts.weight === "number") {
            command.push("weights", opts.weight);
          }
          if ("aggregate" in opts) {
            command.push("aggregate", opts.aggregate);
          }
        }
        super(command, cmdOpts);
      }
    };
    ZDiffStoreCommand = class extends Command {
      constructor(cmd, opts) {
        super(["zdiffstore", ...cmd], opts);
      }
    };
    ZMScoreCommand = class extends Command {
      constructor(cmd, opts) {
        const [key, members] = cmd;
        super(["zmscore", key, ...members], opts);
      }
    };
    Pipeline = class {
      constructor(opts) {
        __publicField(this, "client");
        __publicField(this, "commands");
        __publicField(this, "commandOptions");
        __publicField(this, "multiExec");
        __publicField(this, "exec", async (options) => {
          if (this.commands.length === 0) {
            throw new Error("Pipeline is empty");
          }
          const path = this.multiExec ? ["multi-exec"] : ["pipeline"];
          const res = await this.client.request({
            path,
            body: Object.values(this.commands).map((c) => c.command)
          });
          return options?.keepErrors ? res.map(({ error, result }, i) => {
            return {
              error,
              result: this.commands[i].deserialize(result)
            };
          }) : res.map(({ error, result }, i) => {
            if (error) {
              throw new UpstashError(
                `Command ${i + 1} [ ${this.commands[i].command[0]} ] failed: ${error}`
              );
            }
            return this.commands[i].deserialize(result);
          });
        });
        /**
         * @see https://redis.io/commands/append
         */
        __publicField(this, "append", (...args) => this.chain(new AppendCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/bitcount
         */
        __publicField(this, "bitcount", (...args) => this.chain(new BitCountCommand(args, this.commandOptions)));
        /**
         * Returns an instance that can be used to execute `BITFIELD` commands on one key.
         *
         * @example
         * ```typescript
         * redis.set("mykey", 0);
         * const result = await redis.pipeline()
         *   .bitfield("mykey")
         *   .set("u4", 0, 16)
         *   .incr("u4", "#1", 1)
         *   .exec();
         * console.log(result); // [[0, 1]]
         * ```
         *
         * @see https://redis.io/commands/bitfield
         */
        __publicField(this, "bitfield", (...args) => new BitFieldCommand(args, this.client, this.commandOptions, this.chain.bind(this)));
        /**
         * @see https://redis.io/commands/bitop
         */
        __publicField(this, "bitop", (op2, destinationKey, sourceKey, ...sourceKeys) => this.chain(
          new BitOpCommand([op2, destinationKey, sourceKey, ...sourceKeys], this.commandOptions)
        ));
        /**
         * @see https://redis.io/commands/bitpos
         */
        __publicField(this, "bitpos", (...args) => this.chain(new BitPosCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/copy
         */
        __publicField(this, "copy", (...args) => this.chain(new CopyCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/zdiffstore
         */
        __publicField(this, "zdiffstore", (...args) => this.chain(new ZDiffStoreCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/dbsize
         */
        __publicField(this, "dbsize", () => this.chain(new DBSizeCommand(this.commandOptions)));
        /**
         * @see https://redis.io/commands/decr
         */
        __publicField(this, "decr", (...args) => this.chain(new DecrCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/decrby
         */
        __publicField(this, "decrby", (...args) => this.chain(new DecrByCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/del
         */
        __publicField(this, "del", (...args) => this.chain(new DelCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/echo
         */
        __publicField(this, "echo", (...args) => this.chain(new EchoCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/eval
         */
        __publicField(this, "eval", (...args) => this.chain(new EvalCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/evalsha
         */
        __publicField(this, "evalsha", (...args) => this.chain(new EvalshaCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/exists
         */
        __publicField(this, "exists", (...args) => this.chain(new ExistsCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/expire
         */
        __publicField(this, "expire", (...args) => this.chain(new ExpireCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/expireat
         */
        __publicField(this, "expireat", (...args) => this.chain(new ExpireAtCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/flushall
         */
        __publicField(this, "flushall", (args) => this.chain(new FlushAllCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/flushdb
         */
        __publicField(this, "flushdb", (...args) => this.chain(new FlushDBCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/geoadd
         */
        __publicField(this, "geoadd", (...args) => this.chain(new GeoAddCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/geodist
         */
        __publicField(this, "geodist", (...args) => this.chain(new GeoDistCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/geopos
         */
        __publicField(this, "geopos", (...args) => this.chain(new GeoPosCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/geohash
         */
        __publicField(this, "geohash", (...args) => this.chain(new GeoHashCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/geosearch
         */
        __publicField(this, "geosearch", (...args) => this.chain(new GeoSearchCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/geosearchstore
         */
        __publicField(this, "geosearchstore", (...args) => this.chain(new GeoSearchStoreCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/get
         */
        __publicField(this, "get", (...args) => this.chain(new GetCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/getbit
         */
        __publicField(this, "getbit", (...args) => this.chain(new GetBitCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/getdel
         */
        __publicField(this, "getdel", (...args) => this.chain(new GetDelCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/getex
         */
        __publicField(this, "getex", (...args) => this.chain(new GetExCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/getrange
         */
        __publicField(this, "getrange", (...args) => this.chain(new GetRangeCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/getset
         */
        __publicField(this, "getset", (key, value) => this.chain(new GetSetCommand([key, value], this.commandOptions)));
        /**
         * @see https://redis.io/commands/hdel
         */
        __publicField(this, "hdel", (...args) => this.chain(new HDelCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/hexists
         */
        __publicField(this, "hexists", (...args) => this.chain(new HExistsCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/hget
         */
        __publicField(this, "hget", (...args) => this.chain(new HGetCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/hgetall
         */
        __publicField(this, "hgetall", (...args) => this.chain(new HGetAllCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/hincrby
         */
        __publicField(this, "hincrby", (...args) => this.chain(new HIncrByCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/hincrbyfloat
         */
        __publicField(this, "hincrbyfloat", (...args) => this.chain(new HIncrByFloatCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/hkeys
         */
        __publicField(this, "hkeys", (...args) => this.chain(new HKeysCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/hlen
         */
        __publicField(this, "hlen", (...args) => this.chain(new HLenCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/hmget
         */
        __publicField(this, "hmget", (...args) => this.chain(new HMGetCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/hmset
         */
        __publicField(this, "hmset", (key, kv) => this.chain(new HMSetCommand([key, kv], this.commandOptions)));
        /**
         * @see https://redis.io/commands/hrandfield
         */
        __publicField(this, "hrandfield", (key, count, withValues) => this.chain(new HRandFieldCommand([key, count, withValues], this.commandOptions)));
        /**
         * @see https://redis.io/commands/hscan
         */
        __publicField(this, "hscan", (...args) => this.chain(new HScanCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/hset
         */
        __publicField(this, "hset", (key, kv) => this.chain(new HSetCommand([key, kv], this.commandOptions)));
        /**
         * @see https://redis.io/commands/hsetnx
         */
        __publicField(this, "hsetnx", (key, field, value) => this.chain(new HSetNXCommand([key, field, value], this.commandOptions)));
        /**
         * @see https://redis.io/commands/hstrlen
         */
        __publicField(this, "hstrlen", (...args) => this.chain(new HStrLenCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/hvals
         */
        __publicField(this, "hvals", (...args) => this.chain(new HValsCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/incr
         */
        __publicField(this, "incr", (...args) => this.chain(new IncrCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/incrby
         */
        __publicField(this, "incrby", (...args) => this.chain(new IncrByCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/incrbyfloat
         */
        __publicField(this, "incrbyfloat", (...args) => this.chain(new IncrByFloatCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/keys
         */
        __publicField(this, "keys", (...args) => this.chain(new KeysCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/lindex
         */
        __publicField(this, "lindex", (...args) => this.chain(new LIndexCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/linsert
         */
        __publicField(this, "linsert", (key, direction, pivot, value) => this.chain(new LInsertCommand([key, direction, pivot, value], this.commandOptions)));
        /**
         * @see https://redis.io/commands/llen
         */
        __publicField(this, "llen", (...args) => this.chain(new LLenCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/lmove
         */
        __publicField(this, "lmove", (...args) => this.chain(new LMoveCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/lpop
         */
        __publicField(this, "lpop", (...args) => this.chain(new LPopCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/lmpop
         */
        __publicField(this, "lmpop", (...args) => this.chain(new LmPopCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/lpos
         */
        __publicField(this, "lpos", (...args) => this.chain(new LPosCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/lpush
         */
        __publicField(this, "lpush", (key, ...elements) => this.chain(new LPushCommand([key, ...elements], this.commandOptions)));
        /**
         * @see https://redis.io/commands/lpushx
         */
        __publicField(this, "lpushx", (key, ...elements) => this.chain(new LPushXCommand([key, ...elements], this.commandOptions)));
        /**
         * @see https://redis.io/commands/lrange
         */
        __publicField(this, "lrange", (...args) => this.chain(new LRangeCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/lrem
         */
        __publicField(this, "lrem", (key, count, value) => this.chain(new LRemCommand([key, count, value], this.commandOptions)));
        /**
         * @see https://redis.io/commands/lset
         */
        __publicField(this, "lset", (key, index, value) => this.chain(new LSetCommand([key, index, value], this.commandOptions)));
        /**
         * @see https://redis.io/commands/ltrim
         */
        __publicField(this, "ltrim", (...args) => this.chain(new LTrimCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/mget
         */
        __publicField(this, "mget", (...args) => this.chain(new MGetCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/mset
         */
        __publicField(this, "mset", (kv) => this.chain(new MSetCommand([kv], this.commandOptions)));
        /**
         * @see https://redis.io/commands/msetnx
         */
        __publicField(this, "msetnx", (kv) => this.chain(new MSetNXCommand([kv], this.commandOptions)));
        /**
         * @see https://redis.io/commands/persist
         */
        __publicField(this, "persist", (...args) => this.chain(new PersistCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/pexpire
         */
        __publicField(this, "pexpire", (...args) => this.chain(new PExpireCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/pexpireat
         */
        __publicField(this, "pexpireat", (...args) => this.chain(new PExpireAtCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/pfadd
         */
        __publicField(this, "pfadd", (...args) => this.chain(new PfAddCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/pfcount
         */
        __publicField(this, "pfcount", (...args) => this.chain(new PfCountCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/pfmerge
         */
        __publicField(this, "pfmerge", (...args) => this.chain(new PfMergeCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/ping
         */
        __publicField(this, "ping", (args) => this.chain(new PingCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/psetex
         */
        __publicField(this, "psetex", (key, ttl, value) => this.chain(new PSetEXCommand([key, ttl, value], this.commandOptions)));
        /**
         * @see https://redis.io/commands/pttl
         */
        __publicField(this, "pttl", (...args) => this.chain(new PTtlCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/publish
         */
        __publicField(this, "publish", (...args) => this.chain(new PublishCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/randomkey
         */
        __publicField(this, "randomkey", () => this.chain(new RandomKeyCommand(this.commandOptions)));
        /**
         * @see https://redis.io/commands/rename
         */
        __publicField(this, "rename", (...args) => this.chain(new RenameCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/renamenx
         */
        __publicField(this, "renamenx", (...args) => this.chain(new RenameNXCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/rpop
         */
        __publicField(this, "rpop", (...args) => this.chain(new RPopCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/rpush
         */
        __publicField(this, "rpush", (key, ...elements) => this.chain(new RPushCommand([key, ...elements], this.commandOptions)));
        /**
         * @see https://redis.io/commands/rpushx
         */
        __publicField(this, "rpushx", (key, ...elements) => this.chain(new RPushXCommand([key, ...elements], this.commandOptions)));
        /**
         * @see https://redis.io/commands/sadd
         */
        __publicField(this, "sadd", (key, member, ...members) => this.chain(new SAddCommand([key, member, ...members], this.commandOptions)));
        /**
         * @see https://redis.io/commands/scan
         */
        __publicField(this, "scan", (...args) => this.chain(new ScanCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/scard
         */
        __publicField(this, "scard", (...args) => this.chain(new SCardCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/script-exists
         */
        __publicField(this, "scriptExists", (...args) => this.chain(new ScriptExistsCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/script-flush
         */
        __publicField(this, "scriptFlush", (...args) => this.chain(new ScriptFlushCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/script-load
         */
        __publicField(this, "scriptLoad", (...args) => this.chain(new ScriptLoadCommand(args, this.commandOptions)));
        /*)*
         * @see https://redis.io/commands/sdiff
         */
        __publicField(this, "sdiff", (...args) => this.chain(new SDiffCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/sdiffstore
         */
        __publicField(this, "sdiffstore", (...args) => this.chain(new SDiffStoreCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/set
         */
        __publicField(this, "set", (key, value, opts) => this.chain(new SetCommand([key, value, opts], this.commandOptions)));
        /**
         * @see https://redis.io/commands/setbit
         */
        __publicField(this, "setbit", (...args) => this.chain(new SetBitCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/setex
         */
        __publicField(this, "setex", (key, ttl, value) => this.chain(new SetExCommand([key, ttl, value], this.commandOptions)));
        /**
         * @see https://redis.io/commands/setnx
         */
        __publicField(this, "setnx", (key, value) => this.chain(new SetNxCommand([key, value], this.commandOptions)));
        /**
         * @see https://redis.io/commands/setrange
         */
        __publicField(this, "setrange", (...args) => this.chain(new SetRangeCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/sinter
         */
        __publicField(this, "sinter", (...args) => this.chain(new SInterCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/sinterstore
         */
        __publicField(this, "sinterstore", (...args) => this.chain(new SInterStoreCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/sismember
         */
        __publicField(this, "sismember", (key, member) => this.chain(new SIsMemberCommand([key, member], this.commandOptions)));
        /**
         * @see https://redis.io/commands/smembers
         */
        __publicField(this, "smembers", (...args) => this.chain(new SMembersCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/smismember
         */
        __publicField(this, "smismember", (key, members) => this.chain(new SMIsMemberCommand([key, members], this.commandOptions)));
        /**
         * @see https://redis.io/commands/smove
         */
        __publicField(this, "smove", (source, destination, member) => this.chain(new SMoveCommand([source, destination, member], this.commandOptions)));
        /**
         * @see https://redis.io/commands/spop
         */
        __publicField(this, "spop", (...args) => this.chain(new SPopCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/srandmember
         */
        __publicField(this, "srandmember", (...args) => this.chain(new SRandMemberCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/srem
         */
        __publicField(this, "srem", (key, ...members) => this.chain(new SRemCommand([key, ...members], this.commandOptions)));
        /**
         * @see https://redis.io/commands/sscan
         */
        __publicField(this, "sscan", (...args) => this.chain(new SScanCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/strlen
         */
        __publicField(this, "strlen", (...args) => this.chain(new StrLenCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/sunion
         */
        __publicField(this, "sunion", (...args) => this.chain(new SUnionCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/sunionstore
         */
        __publicField(this, "sunionstore", (...args) => this.chain(new SUnionStoreCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/time
         */
        __publicField(this, "time", () => this.chain(new TimeCommand(this.commandOptions)));
        /**
         * @see https://redis.io/commands/touch
         */
        __publicField(this, "touch", (...args) => this.chain(new TouchCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/ttl
         */
        __publicField(this, "ttl", (...args) => this.chain(new TtlCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/type
         */
        __publicField(this, "type", (...args) => this.chain(new TypeCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/unlink
         */
        __publicField(this, "unlink", (...args) => this.chain(new UnlinkCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/zadd
         */
        __publicField(this, "zadd", (...args) => {
          if ("score" in args[1]) {
            return this.chain(
              new ZAddCommand([args[0], args[1], ...args.slice(2)], this.commandOptions)
            );
          }
          return this.chain(
            new ZAddCommand(
              [args[0], args[1], ...args.slice(2)],
              this.commandOptions
            )
          );
        });
        /**
         * @see https://redis.io/commands/xadd
         */
        __publicField(this, "xadd", (...args) => this.chain(new XAddCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/xack
         */
        __publicField(this, "xack", (...args) => this.chain(new XAckCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/xdel
         */
        __publicField(this, "xdel", (...args) => this.chain(new XDelCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/xgroup
         */
        __publicField(this, "xgroup", (...args) => this.chain(new XGroupCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/xread
         */
        __publicField(this, "xread", (...args) => this.chain(new XReadCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/xreadgroup
         */
        __publicField(this, "xreadgroup", (...args) => this.chain(new XReadGroupCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/xinfo
         */
        __publicField(this, "xinfo", (...args) => this.chain(new XInfoCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/xlen
         */
        __publicField(this, "xlen", (...args) => this.chain(new XLenCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/xpending
         */
        __publicField(this, "xpending", (...args) => this.chain(new XPendingCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/xclaim
         */
        __publicField(this, "xclaim", (...args) => this.chain(new XClaimCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/xautoclaim
         */
        __publicField(this, "xautoclaim", (...args) => this.chain(new XAutoClaim(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/xtrim
         */
        __publicField(this, "xtrim", (...args) => this.chain(new XTrimCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/xrange
         */
        __publicField(this, "xrange", (...args) => this.chain(new XRangeCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/xrevrange
         */
        __publicField(this, "xrevrange", (...args) => this.chain(new XRevRangeCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/zcard
         */
        __publicField(this, "zcard", (...args) => this.chain(new ZCardCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/zcount
         */
        __publicField(this, "zcount", (...args) => this.chain(new ZCountCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/zincrby
         */
        __publicField(this, "zincrby", (key, increment, member) => this.chain(new ZIncrByCommand([key, increment, member], this.commandOptions)));
        /**
         * @see https://redis.io/commands/zinterstore
         */
        __publicField(this, "zinterstore", (...args) => this.chain(new ZInterStoreCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/zlexcount
         */
        __publicField(this, "zlexcount", (...args) => this.chain(new ZLexCountCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/zmscore
         */
        __publicField(this, "zmscore", (...args) => this.chain(new ZMScoreCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/zpopmax
         */
        __publicField(this, "zpopmax", (...args) => this.chain(new ZPopMaxCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/zpopmin
         */
        __publicField(this, "zpopmin", (...args) => this.chain(new ZPopMinCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/zrange
         */
        __publicField(this, "zrange", (...args) => this.chain(new ZRangeCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/zrank
         */
        __publicField(this, "zrank", (key, member) => this.chain(new ZRankCommand([key, member], this.commandOptions)));
        /**
         * @see https://redis.io/commands/zrem
         */
        __publicField(this, "zrem", (key, ...members) => this.chain(new ZRemCommand([key, ...members], this.commandOptions)));
        /**
         * @see https://redis.io/commands/zremrangebylex
         */
        __publicField(this, "zremrangebylex", (...args) => this.chain(new ZRemRangeByLexCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/zremrangebyrank
         */
        __publicField(this, "zremrangebyrank", (...args) => this.chain(new ZRemRangeByRankCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/zremrangebyscore
         */
        __publicField(this, "zremrangebyscore", (...args) => this.chain(new ZRemRangeByScoreCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/zrevrank
         */
        __publicField(this, "zrevrank", (key, member) => this.chain(new ZRevRankCommand([key, member], this.commandOptions)));
        /**
         * @see https://redis.io/commands/zscan
         */
        __publicField(this, "zscan", (...args) => this.chain(new ZScanCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/zscore
         */
        __publicField(this, "zscore", (key, member) => this.chain(new ZScoreCommand([key, member], this.commandOptions)));
        /**
         * @see https://redis.io/commands/zunionstore
         */
        __publicField(this, "zunionstore", (...args) => this.chain(new ZUnionStoreCommand(args, this.commandOptions)));
        /**
         * @see https://redis.io/commands/zunion
         */
        __publicField(this, "zunion", (...args) => this.chain(new ZUnionCommand(args, this.commandOptions)));
        this.client = opts.client;
        this.commands = [];
        this.commandOptions = opts.commandOptions;
        this.multiExec = opts.multiExec ?? false;
        if (this.commandOptions?.latencyLogging) {
          const originalExec = this.exec.bind(this);
          this.exec = async (options) => {
            const start = performance.now();
            const result = await (options ? originalExec(options) : originalExec());
            const end = performance.now();
            const loggerResult = (end - start).toFixed(2);
            console.log(
              `Latency for \x1B[38;2;19;185;39m${this.multiExec ? ["MULTI-EXEC"] : ["PIPELINE"].toString().toUpperCase()}\x1B[0m: \x1B[38;2;0;255;255m${loggerResult} ms\x1B[0m`
            );
            return result;
          };
        }
      }
      /**
       * Returns the length of pipeline before the execution
       */
      length() {
        return this.commands.length;
      }
      /**
       * Pushes a command into the pipeline and returns a chainable instance of the
       * pipeline
       */
      chain(command) {
        this.commands.push(command);
        return this;
      }
      /**
       * @see https://redis.io/commands/?group=json
       */
      get json() {
        return {
          /**
           * @see https://redis.io/commands/json.arrappend
           */
          arrappend: (...args) => this.chain(new JsonArrAppendCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.arrindex
           */
          arrindex: (...args) => this.chain(new JsonArrIndexCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.arrinsert
           */
          arrinsert: (...args) => this.chain(new JsonArrInsertCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.arrlen
           */
          arrlen: (...args) => this.chain(new JsonArrLenCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.arrpop
           */
          arrpop: (...args) => this.chain(new JsonArrPopCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.arrtrim
           */
          arrtrim: (...args) => this.chain(new JsonArrTrimCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.clear
           */
          clear: (...args) => this.chain(new JsonClearCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.del
           */
          del: (...args) => this.chain(new JsonDelCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.forget
           */
          forget: (...args) => this.chain(new JsonForgetCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.get
           */
          get: (...args) => this.chain(new JsonGetCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.mget
           */
          mget: (...args) => this.chain(new JsonMGetCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.mset
           */
          mset: (...args) => this.chain(new JsonMSetCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.numincrby
           */
          numincrby: (...args) => this.chain(new JsonNumIncrByCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.nummultby
           */
          nummultby: (...args) => this.chain(new JsonNumMultByCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.objkeys
           */
          objkeys: (...args) => this.chain(new JsonObjKeysCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.objlen
           */
          objlen: (...args) => this.chain(new JsonObjLenCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.resp
           */
          resp: (...args) => this.chain(new JsonRespCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.set
           */
          set: (...args) => this.chain(new JsonSetCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.strappend
           */
          strappend: (...args) => this.chain(new JsonStrAppendCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.strlen
           */
          strlen: (...args) => this.chain(new JsonStrLenCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.toggle
           */
          toggle: (...args) => this.chain(new JsonToggleCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.type
           */
          type: (...args) => this.chain(new JsonTypeCommand(args, this.commandOptions))
        };
      }
    };
    AutoPipelineExecutor = class {
      // to keep track of how many times a pipeline was executed
      constructor(redis3) {
        __publicField(this, "pipelinePromises", /* @__PURE__ */ new WeakMap());
        __publicField(this, "activePipeline", null);
        __publicField(this, "indexInCurrentPipeline", 0);
        __publicField(this, "redis");
        __publicField(this, "pipeline");
        // only to make sure that proxy can work
        __publicField(this, "pipelineCounter", 0);
        this.redis = redis3;
        this.pipeline = redis3.pipeline();
      }
      async withAutoPipeline(executeWithPipeline) {
        const pipeline = this.activePipeline ?? this.redis.pipeline();
        if (!this.activePipeline) {
          this.activePipeline = pipeline;
          this.indexInCurrentPipeline = 0;
        }
        const index = this.indexInCurrentPipeline++;
        executeWithPipeline(pipeline);
        const pipelineDone = this.deferExecution().then(() => {
          if (!this.pipelinePromises.has(pipeline)) {
            const pipelinePromise = pipeline.exec({ keepErrors: true });
            this.pipelineCounter += 1;
            this.pipelinePromises.set(pipeline, pipelinePromise);
            this.activePipeline = null;
          }
          return this.pipelinePromises.get(pipeline);
        });
        const results = await pipelineDone;
        const commandResult = results[index];
        if (commandResult.error) {
          throw new UpstashError(`Command failed: ${commandResult.error}`);
        }
        return commandResult.result;
      }
      async deferExecution() {
        await Promise.resolve();
        await Promise.resolve();
      }
    };
    PSubscribeCommand = class extends Command {
      constructor(cmd, opts) {
        const sseHeaders = {
          Accept: "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive"
        };
        super([], {
          ...opts,
          headers: sseHeaders,
          path: ["psubscribe", ...cmd],
          streamOptions: {
            isStreaming: true,
            onMessage: opts?.streamOptions?.onMessage,
            signal: opts?.streamOptions?.signal
          }
        });
      }
    };
    Subscriber = class extends EventTarget {
      constructor(client, channels, isPattern = false) {
        super();
        __publicField(this, "subscriptions");
        __publicField(this, "client");
        __publicField(this, "listeners");
        this.client = client;
        this.subscriptions = /* @__PURE__ */ new Map();
        this.listeners = /* @__PURE__ */ new Map();
        for (const channel of channels) {
          if (isPattern) {
            this.subscribeToPattern(channel);
          } else {
            this.subscribeToChannel(channel);
          }
        }
      }
      subscribeToChannel(channel) {
        const controller = new AbortController();
        const command = new SubscribeCommand([channel], {
          streamOptions: {
            signal: controller.signal,
            onMessage: (data) => this.handleMessage(data, false)
          }
        });
        command.exec(this.client).catch((error) => {
          if (error.name !== "AbortError") {
            this.dispatchToListeners("error", error);
          }
        });
        this.subscriptions.set(channel, {
          command,
          controller,
          isPattern: false
        });
      }
      subscribeToPattern(pattern) {
        const controller = new AbortController();
        const command = new PSubscribeCommand([pattern], {
          streamOptions: {
            signal: controller.signal,
            onMessage: (data) => this.handleMessage(data, true)
          }
        });
        command.exec(this.client).catch((error) => {
          if (error.name !== "AbortError") {
            this.dispatchToListeners("error", error);
          }
        });
        this.subscriptions.set(pattern, {
          command,
          controller,
          isPattern: true
        });
      }
      handleMessage(data, isPattern) {
        const messageData = data.replace(/^data:\s*/, "");
        const firstCommaIndex = messageData.indexOf(",");
        const secondCommaIndex = messageData.indexOf(",", firstCommaIndex + 1);
        const thirdCommaIndex = isPattern ? messageData.indexOf(",", secondCommaIndex + 1) : -1;
        if (firstCommaIndex !== -1 && secondCommaIndex !== -1) {
          const type = messageData.slice(0, firstCommaIndex);
          if (isPattern && type === "pmessage" && thirdCommaIndex !== -1) {
            const pattern = messageData.slice(firstCommaIndex + 1, secondCommaIndex);
            const channel = messageData.slice(secondCommaIndex + 1, thirdCommaIndex);
            const messageStr = messageData.slice(thirdCommaIndex + 1);
            try {
              const message = JSON.parse(messageStr);
              this.dispatchToListeners("pmessage", { pattern, channel, message });
              this.dispatchToListeners(`pmessage:${pattern}`, { pattern, channel, message });
            } catch (error) {
              this.dispatchToListeners("error", new Error(`Failed to parse message: ${error}`));
            }
          } else {
            const channel = messageData.slice(firstCommaIndex + 1, secondCommaIndex);
            const messageStr = messageData.slice(secondCommaIndex + 1);
            try {
              if (type === "subscribe" || type === "psubscribe" || type === "unsubscribe" || type === "punsubscribe") {
                const count = Number.parseInt(messageStr);
                this.dispatchToListeners(type, count);
              } else {
                const message = JSON.parse(messageStr);
                this.dispatchToListeners(type, { channel, message });
                this.dispatchToListeners(`${type}:${channel}`, { channel, message });
              }
            } catch (error) {
              this.dispatchToListeners("error", new Error(`Failed to parse message: ${error}`));
            }
          }
        }
      }
      dispatchToListeners(type, data) {
        const listeners = this.listeners.get(type);
        if (listeners) {
          for (const listener of listeners) {
            listener(data);
          }
        }
      }
      on(type, listener) {
        if (!this.listeners.has(type)) {
          this.listeners.set(type, /* @__PURE__ */ new Set());
        }
        this.listeners.get(type)?.add(listener);
      }
      removeAllListeners() {
        this.listeners.clear();
      }
      async unsubscribe(channels) {
        if (channels) {
          for (const channel of channels) {
            const subscription = this.subscriptions.get(channel);
            if (subscription) {
              try {
                subscription.controller.abort();
              } catch {
              }
              this.subscriptions.delete(channel);
            }
          }
        } else {
          for (const subscription of this.subscriptions.values()) {
            try {
              subscription.controller.abort();
            } catch {
            }
          }
          this.subscriptions.clear();
          this.removeAllListeners();
        }
      }
      getSubscribedChannels() {
        return [...this.subscriptions.keys()];
      }
    };
    SubscribeCommand = class extends Command {
      constructor(cmd, opts) {
        const sseHeaders = {
          Accept: "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive"
        };
        super([], {
          ...opts,
          headers: sseHeaders,
          path: ["subscribe", ...cmd],
          streamOptions: {
            isStreaming: true,
            onMessage: opts?.streamOptions?.onMessage,
            signal: opts?.streamOptions?.signal
          }
        });
      }
    };
    Script = class {
      constructor(redis3, script) {
        __publicField(this, "script");
        __publicField(this, "sha1");
        __publicField(this, "redis");
        this.redis = redis3;
        this.sha1 = this.digest(script);
        this.script = script;
      }
      /**
       * Send an `EVAL` command to redis.
       */
      async eval(keys, args) {
        return await this.redis.eval(this.script, keys, args);
      }
      /**
       * Calculates the sha1 hash of the script and then calls `EVALSHA`.
       */
      async evalsha(keys, args) {
        return await this.redis.evalsha(this.sha1, keys, args);
      }
      /**
       * Optimistically try to run `EVALSHA` first.
       * If the script is not loaded in redis, it will fall back and try again with `EVAL`.
       *
       * Following calls will be able to use the cached script
       */
      async exec(keys, args) {
        const res = await this.redis.evalsha(this.sha1, keys, args).catch(async (error) => {
          if (error instanceof Error && error.message.toLowerCase().includes("noscript")) {
            return await this.redis.eval(this.script, keys, args);
          }
          throw error;
        });
        return res;
      }
      /**
       * Compute the sha1 hash of the script and return its hex representation.
       */
      digest(s) {
        return import_enc_hex.default.stringify((0, import_sha1.default)(s));
      }
    };
    Redis = class {
      /**
       * Create a new redis client
       *
       * @example
       * ```typescript
       * const redis = new Redis({
       *  url: "<UPSTASH_REDIS_REST_URL>",
       *  token: "<UPSTASH_REDIS_REST_TOKEN>",
       * });
       * ```
       */
      constructor(client, opts) {
        __publicField(this, "client");
        __publicField(this, "opts");
        __publicField(this, "enableTelemetry");
        __publicField(this, "enableAutoPipelining");
        /**
         * Wrap a new middleware around the HTTP client.
         */
        __publicField(this, "use", (middleware) => {
          const makeRequest = this.client.request.bind(this.client);
          this.client.request = (req) => middleware(req, makeRequest);
        });
        /**
         * Technically this is not private, we can hide it from intellisense by doing this
         */
        __publicField(this, "addTelemetry", (telemetry) => {
          if (!this.enableTelemetry) {
            return;
          }
          try {
            this.client.mergeTelemetry(telemetry);
          } catch {
          }
        });
        /**
         * Create a new pipeline that allows you to send requests in bulk.
         *
         * @see {@link Pipeline}
         */
        __publicField(this, "pipeline", () => new Pipeline({
          client: this.client,
          commandOptions: this.opts,
          multiExec: false
        }));
        __publicField(this, "autoPipeline", () => {
          return createAutoPipelineProxy(this);
        });
        /**
         * Create a new transaction to allow executing multiple steps atomically.
         *
         * All the commands in a transaction are serialized and executed sequentially. A request sent by
         * another client will never be served in the middle of the execution of a Redis Transaction. This
         * guarantees that the commands are executed as a single isolated operation.
         *
         * @see {@link Pipeline}
         */
        __publicField(this, "multi", () => new Pipeline({
          client: this.client,
          commandOptions: this.opts,
          multiExec: true
        }));
        /**
         * Returns an instance that can be used to execute `BITFIELD` commands on one key.
         *
         * @example
         * ```typescript
         * redis.set("mykey", 0);
         * const result = await redis.bitfield("mykey")
         *   .set("u4", 0, 16)
         *   .incr("u4", "#1", 1)
         *   .exec();
         * console.log(result); // [0, 1]
         * ```
         *
         * @see https://redis.io/commands/bitfield
         */
        __publicField(this, "bitfield", (...args) => new BitFieldCommand(args, this.client, this.opts));
        /**
         * @see https://redis.io/commands/append
         */
        __publicField(this, "append", (...args) => new AppendCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/bitcount
         */
        __publicField(this, "bitcount", (...args) => new BitCountCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/bitop
         */
        __publicField(this, "bitop", (op2, destinationKey, sourceKey, ...sourceKeys) => new BitOpCommand([op2, destinationKey, sourceKey, ...sourceKeys], this.opts).exec(
          this.client
        ));
        /**
         * @see https://redis.io/commands/bitpos
         */
        __publicField(this, "bitpos", (...args) => new BitPosCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/copy
         */
        __publicField(this, "copy", (...args) => new CopyCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/dbsize
         */
        __publicField(this, "dbsize", () => new DBSizeCommand(this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/decr
         */
        __publicField(this, "decr", (...args) => new DecrCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/decrby
         */
        __publicField(this, "decrby", (...args) => new DecrByCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/del
         */
        __publicField(this, "del", (...args) => new DelCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/echo
         */
        __publicField(this, "echo", (...args) => new EchoCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/eval
         */
        __publicField(this, "eval", (...args) => new EvalCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/evalsha
         */
        __publicField(this, "evalsha", (...args) => new EvalshaCommand(args, this.opts).exec(this.client));
        /**
         * Generic method to execute any Redis command.
         */
        __publicField(this, "exec", (args) => new ExecCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/exists
         */
        __publicField(this, "exists", (...args) => new ExistsCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/expire
         */
        __publicField(this, "expire", (...args) => new ExpireCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/expireat
         */
        __publicField(this, "expireat", (...args) => new ExpireAtCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/flushall
         */
        __publicField(this, "flushall", (args) => new FlushAllCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/flushdb
         */
        __publicField(this, "flushdb", (...args) => new FlushDBCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/geoadd
         */
        __publicField(this, "geoadd", (...args) => new GeoAddCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/geopos
         */
        __publicField(this, "geopos", (...args) => new GeoPosCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/geodist
         */
        __publicField(this, "geodist", (...args) => new GeoDistCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/geohash
         */
        __publicField(this, "geohash", (...args) => new GeoHashCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/geosearch
         */
        __publicField(this, "geosearch", (...args) => new GeoSearchCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/geosearchstore
         */
        __publicField(this, "geosearchstore", (...args) => new GeoSearchStoreCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/get
         */
        __publicField(this, "get", (...args) => new GetCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/getbit
         */
        __publicField(this, "getbit", (...args) => new GetBitCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/getdel
         */
        __publicField(this, "getdel", (...args) => new GetDelCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/getex
         */
        __publicField(this, "getex", (...args) => new GetExCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/getrange
         */
        __publicField(this, "getrange", (...args) => new GetRangeCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/getset
         */
        __publicField(this, "getset", (key, value) => new GetSetCommand([key, value], this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/hdel
         */
        __publicField(this, "hdel", (...args) => new HDelCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/hexists
         */
        __publicField(this, "hexists", (...args) => new HExistsCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/hget
         */
        __publicField(this, "hget", (...args) => new HGetCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/hgetall
         */
        __publicField(this, "hgetall", (...args) => new HGetAllCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/hincrby
         */
        __publicField(this, "hincrby", (...args) => new HIncrByCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/hincrbyfloat
         */
        __publicField(this, "hincrbyfloat", (...args) => new HIncrByFloatCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/hkeys
         */
        __publicField(this, "hkeys", (...args) => new HKeysCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/hlen
         */
        __publicField(this, "hlen", (...args) => new HLenCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/hmget
         */
        __publicField(this, "hmget", (...args) => new HMGetCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/hmset
         */
        __publicField(this, "hmset", (key, kv) => new HMSetCommand([key, kv], this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/hrandfield
         */
        __publicField(this, "hrandfield", (key, count, withValues) => new HRandFieldCommand([key, count, withValues], this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/hscan
         */
        __publicField(this, "hscan", (...args) => new HScanCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/hset
         */
        __publicField(this, "hset", (key, kv) => new HSetCommand([key, kv], this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/hsetnx
         */
        __publicField(this, "hsetnx", (key, field, value) => new HSetNXCommand([key, field, value], this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/hstrlen
         */
        __publicField(this, "hstrlen", (...args) => new HStrLenCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/hvals
         */
        __publicField(this, "hvals", (...args) => new HValsCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/incr
         */
        __publicField(this, "incr", (...args) => new IncrCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/incrby
         */
        __publicField(this, "incrby", (...args) => new IncrByCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/incrbyfloat
         */
        __publicField(this, "incrbyfloat", (...args) => new IncrByFloatCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/keys
         */
        __publicField(this, "keys", (...args) => new KeysCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/lindex
         */
        __publicField(this, "lindex", (...args) => new LIndexCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/linsert
         */
        __publicField(this, "linsert", (key, direction, pivot, value) => new LInsertCommand([key, direction, pivot, value], this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/llen
         */
        __publicField(this, "llen", (...args) => new LLenCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/lmove
         */
        __publicField(this, "lmove", (...args) => new LMoveCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/lpop
         */
        __publicField(this, "lpop", (...args) => new LPopCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/lmpop
         */
        __publicField(this, "lmpop", (...args) => new LmPopCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/lpos
         */
        __publicField(this, "lpos", (...args) => new LPosCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/lpush
         */
        __publicField(this, "lpush", (key, ...elements) => new LPushCommand([key, ...elements], this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/lpushx
         */
        __publicField(this, "lpushx", (key, ...elements) => new LPushXCommand([key, ...elements], this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/lrange
         */
        __publicField(this, "lrange", (...args) => new LRangeCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/lrem
         */
        __publicField(this, "lrem", (key, count, value) => new LRemCommand([key, count, value], this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/lset
         */
        __publicField(this, "lset", (key, index, value) => new LSetCommand([key, index, value], this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/ltrim
         */
        __publicField(this, "ltrim", (...args) => new LTrimCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/mget
         */
        __publicField(this, "mget", (...args) => new MGetCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/mset
         */
        __publicField(this, "mset", (kv) => new MSetCommand([kv], this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/msetnx
         */
        __publicField(this, "msetnx", (kv) => new MSetNXCommand([kv], this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/persist
         */
        __publicField(this, "persist", (...args) => new PersistCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/pexpire
         */
        __publicField(this, "pexpire", (...args) => new PExpireCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/pexpireat
         */
        __publicField(this, "pexpireat", (...args) => new PExpireAtCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/pfadd
         */
        __publicField(this, "pfadd", (...args) => new PfAddCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/pfcount
         */
        __publicField(this, "pfcount", (...args) => new PfCountCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/pfmerge
         */
        __publicField(this, "pfmerge", (...args) => new PfMergeCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/ping
         */
        __publicField(this, "ping", (args) => new PingCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/psetex
         */
        __publicField(this, "psetex", (key, ttl, value) => new PSetEXCommand([key, ttl, value], this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/psubscribe
         */
        __publicField(this, "psubscribe", (patterns) => {
          const patternArray = Array.isArray(patterns) ? patterns : [patterns];
          return new Subscriber(this.client, patternArray, true);
        });
        /**
         * @see https://redis.io/commands/pttl
         */
        __publicField(this, "pttl", (...args) => new PTtlCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/publish
         */
        __publicField(this, "publish", (...args) => new PublishCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/randomkey
         */
        __publicField(this, "randomkey", () => new RandomKeyCommand().exec(this.client));
        /**
         * @see https://redis.io/commands/rename
         */
        __publicField(this, "rename", (...args) => new RenameCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/renamenx
         */
        __publicField(this, "renamenx", (...args) => new RenameNXCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/rpop
         */
        __publicField(this, "rpop", (...args) => new RPopCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/rpush
         */
        __publicField(this, "rpush", (key, ...elements) => new RPushCommand([key, ...elements], this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/rpushx
         */
        __publicField(this, "rpushx", (key, ...elements) => new RPushXCommand([key, ...elements], this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/sadd
         */
        __publicField(this, "sadd", (key, member, ...members) => new SAddCommand([key, member, ...members], this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/scan
         */
        __publicField(this, "scan", (...args) => new ScanCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/scard
         */
        __publicField(this, "scard", (...args) => new SCardCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/script-exists
         */
        __publicField(this, "scriptExists", (...args) => new ScriptExistsCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/script-flush
         */
        __publicField(this, "scriptFlush", (...args) => new ScriptFlushCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/script-load
         */
        __publicField(this, "scriptLoad", (...args) => new ScriptLoadCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/sdiff
         */
        __publicField(this, "sdiff", (...args) => new SDiffCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/sdiffstore
         */
        __publicField(this, "sdiffstore", (...args) => new SDiffStoreCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/set
         */
        __publicField(this, "set", (key, value, opts) => new SetCommand([key, value, opts], this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/setbit
         */
        __publicField(this, "setbit", (...args) => new SetBitCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/setex
         */
        __publicField(this, "setex", (key, ttl, value) => new SetExCommand([key, ttl, value], this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/setnx
         */
        __publicField(this, "setnx", (key, value) => new SetNxCommand([key, value], this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/setrange
         */
        __publicField(this, "setrange", (...args) => new SetRangeCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/sinter
         */
        __publicField(this, "sinter", (...args) => new SInterCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/sinterstore
         */
        __publicField(this, "sinterstore", (...args) => new SInterStoreCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/sismember
         */
        __publicField(this, "sismember", (key, member) => new SIsMemberCommand([key, member], this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/smismember
         */
        __publicField(this, "smismember", (key, members) => new SMIsMemberCommand([key, members], this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/smembers
         */
        __publicField(this, "smembers", (...args) => new SMembersCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/smove
         */
        __publicField(this, "smove", (source, destination, member) => new SMoveCommand([source, destination, member], this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/spop
         */
        __publicField(this, "spop", (...args) => new SPopCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/srandmember
         */
        __publicField(this, "srandmember", (...args) => new SRandMemberCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/srem
         */
        __publicField(this, "srem", (key, ...members) => new SRemCommand([key, ...members], this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/sscan
         */
        __publicField(this, "sscan", (...args) => new SScanCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/strlen
         */
        __publicField(this, "strlen", (...args) => new StrLenCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/subscribe
         */
        __publicField(this, "subscribe", (channels) => {
          const channelArray = Array.isArray(channels) ? channels : [channels];
          return new Subscriber(this.client, channelArray);
        });
        /**
         * @see https://redis.io/commands/sunion
         */
        __publicField(this, "sunion", (...args) => new SUnionCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/sunionstore
         */
        __publicField(this, "sunionstore", (...args) => new SUnionStoreCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/time
         */
        __publicField(this, "time", () => new TimeCommand().exec(this.client));
        /**
         * @see https://redis.io/commands/touch
         */
        __publicField(this, "touch", (...args) => new TouchCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/ttl
         */
        __publicField(this, "ttl", (...args) => new TtlCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/type
         */
        __publicField(this, "type", (...args) => new TypeCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/unlink
         */
        __publicField(this, "unlink", (...args) => new UnlinkCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/xadd
         */
        __publicField(this, "xadd", (...args) => new XAddCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/xack
         */
        __publicField(this, "xack", (...args) => new XAckCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/xdel
         */
        __publicField(this, "xdel", (...args) => new XDelCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/xgroup
         */
        __publicField(this, "xgroup", (...args) => new XGroupCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/xread
         */
        __publicField(this, "xread", (...args) => new XReadCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/xreadgroup
         */
        __publicField(this, "xreadgroup", (...args) => new XReadGroupCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/xinfo
         */
        __publicField(this, "xinfo", (...args) => new XInfoCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/xlen
         */
        __publicField(this, "xlen", (...args) => new XLenCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/xpending
         */
        __publicField(this, "xpending", (...args) => new XPendingCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/xclaim
         */
        __publicField(this, "xclaim", (...args) => new XClaimCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/xautoclaim
         */
        __publicField(this, "xautoclaim", (...args) => new XAutoClaim(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/xtrim
         */
        __publicField(this, "xtrim", (...args) => new XTrimCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/xrange
         */
        __publicField(this, "xrange", (...args) => new XRangeCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/xrevrange
         */
        __publicField(this, "xrevrange", (...args) => new XRevRangeCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/zadd
         */
        __publicField(this, "zadd", (...args) => {
          if ("score" in args[1]) {
            return new ZAddCommand([args[0], args[1], ...args.slice(2)], this.opts).exec(
              this.client
            );
          }
          return new ZAddCommand(
            [args[0], args[1], ...args.slice(2)],
            this.opts
          ).exec(this.client);
        });
        /**
         * @see https://redis.io/commands/zcard
         */
        __publicField(this, "zcard", (...args) => new ZCardCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/zcount
         */
        __publicField(this, "zcount", (...args) => new ZCountCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/zdiffstore
         */
        __publicField(this, "zdiffstore", (...args) => new ZDiffStoreCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/zincrby
         */
        __publicField(this, "zincrby", (key, increment, member) => new ZIncrByCommand([key, increment, member], this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/zinterstore
         */
        __publicField(this, "zinterstore", (...args) => new ZInterStoreCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/zlexcount
         */
        __publicField(this, "zlexcount", (...args) => new ZLexCountCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/zmscore
         */
        __publicField(this, "zmscore", (...args) => new ZMScoreCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/zpopmax
         */
        __publicField(this, "zpopmax", (...args) => new ZPopMaxCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/zpopmin
         */
        __publicField(this, "zpopmin", (...args) => new ZPopMinCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/zrange
         */
        __publicField(this, "zrange", (...args) => new ZRangeCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/zrank
         */
        __publicField(this, "zrank", (key, member) => new ZRankCommand([key, member], this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/zrem
         */
        __publicField(this, "zrem", (key, ...members) => new ZRemCommand([key, ...members], this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/zremrangebylex
         */
        __publicField(this, "zremrangebylex", (...args) => new ZRemRangeByLexCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/zremrangebyrank
         */
        __publicField(this, "zremrangebyrank", (...args) => new ZRemRangeByRankCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/zremrangebyscore
         */
        __publicField(this, "zremrangebyscore", (...args) => new ZRemRangeByScoreCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/zrevrank
         */
        __publicField(this, "zrevrank", (key, member) => new ZRevRankCommand([key, member], this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/zscan
         */
        __publicField(this, "zscan", (...args) => new ZScanCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/zscore
         */
        __publicField(this, "zscore", (key, member) => new ZScoreCommand([key, member], this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/zunion
         */
        __publicField(this, "zunion", (...args) => new ZUnionCommand(args, this.opts).exec(this.client));
        /**
         * @see https://redis.io/commands/zunionstore
         */
        __publicField(this, "zunionstore", (...args) => new ZUnionStoreCommand(args, this.opts).exec(this.client));
        this.client = client;
        this.opts = opts;
        this.enableTelemetry = opts?.enableTelemetry ?? true;
        if (opts?.readYourWrites === false) {
          this.client.readYourWrites = false;
        }
        this.enableAutoPipelining = opts?.enableAutoPipelining ?? true;
      }
      get readYourWritesSyncToken() {
        return this.client.upstashSyncToken;
      }
      set readYourWritesSyncToken(session) {
        this.client.upstashSyncToken = session;
      }
      get json() {
        return {
          /**
           * @see https://redis.io/commands/json.arrappend
           */
          arrappend: (...args) => new JsonArrAppendCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.arrindex
           */
          arrindex: (...args) => new JsonArrIndexCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.arrinsert
           */
          arrinsert: (...args) => new JsonArrInsertCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.arrlen
           */
          arrlen: (...args) => new JsonArrLenCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.arrpop
           */
          arrpop: (...args) => new JsonArrPopCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.arrtrim
           */
          arrtrim: (...args) => new JsonArrTrimCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.clear
           */
          clear: (...args) => new JsonClearCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.del
           */
          del: (...args) => new JsonDelCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.forget
           */
          forget: (...args) => new JsonForgetCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.get
           */
          get: (...args) => new JsonGetCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.mget
           */
          mget: (...args) => new JsonMGetCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.mset
           */
          mset: (...args) => new JsonMSetCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.numincrby
           */
          numincrby: (...args) => new JsonNumIncrByCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.nummultby
           */
          nummultby: (...args) => new JsonNumMultByCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.objkeys
           */
          objkeys: (...args) => new JsonObjKeysCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.objlen
           */
          objlen: (...args) => new JsonObjLenCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.resp
           */
          resp: (...args) => new JsonRespCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.set
           */
          set: (...args) => new JsonSetCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.strappend
           */
          strappend: (...args) => new JsonStrAppendCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.strlen
           */
          strlen: (...args) => new JsonStrLenCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.toggle
           */
          toggle: (...args) => new JsonToggleCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.type
           */
          type: (...args) => new JsonTypeCommand(args, this.opts).exec(this.client)
        };
      }
      createScript(script) {
        return new Script(this, script);
      }
    };
    VERSION = "v1.34.6";
  }
});

// ../../node_modules/@upstash/redis/nodejs.mjs
var Redis2;
var init_nodejs = __esm({
  "../../node_modules/@upstash/redis/nodejs.mjs"() {
    "use strict";
    init_chunk_56TVFNIH();
    if (typeof atob === "undefined") {
      global.atob = (b64) => Buffer.from(b64, "base64").toString("utf8");
    }
    Redis2 = class _Redis extends Redis {
      /**
       * Create a new redis client by providing a custom `Requester` implementation
       *
       * @example
       * ```ts
       *
       * import { UpstashRequest, Requester, UpstashResponse, Redis } from "@upstash/redis"
       *
       *  const requester: Requester = {
       *    request: <TResult>(req: UpstashRequest): Promise<UpstashResponse<TResult>> => {
       *      // ...
       *    }
       *  }
       *
       * const redis = new Redis(requester)
       * ```
       */
      constructor(configOrRequester) {
        if ("request" in configOrRequester) {
          super(configOrRequester);
          return;
        }
        if (!configOrRequester.url) {
          console.warn(
            `[Upstash Redis] The 'url' property is missing or undefined in your Redis config.`
          );
        } else if (configOrRequester.url.startsWith(" ") || configOrRequester.url.endsWith(" ") || /\r|\n/.test(configOrRequester.url)) {
          console.warn(
            "[Upstash Redis] The redis url contains whitespace or newline, which can cause errors!"
          );
        }
        if (!configOrRequester.token) {
          console.warn(
            `[Upstash Redis] The 'token' property is missing or undefined in your Redis config.`
          );
        } else if (configOrRequester.token.startsWith(" ") || configOrRequester.token.endsWith(" ") || /\r|\n/.test(configOrRequester.token)) {
          console.warn(
            "[Upstash Redis] The redis token contains whitespace or newline, which can cause errors!"
          );
        }
        const client = new HttpClient({
          baseUrl: configOrRequester.url,
          retry: configOrRequester.retry,
          headers: { authorization: `Bearer ${configOrRequester.token}` },
          agent: configOrRequester.agent,
          responseEncoding: configOrRequester.responseEncoding,
          cache: configOrRequester.cache ?? "no-store",
          signal: configOrRequester.signal,
          keepAlive: configOrRequester.keepAlive,
          readYourWrites: configOrRequester.readYourWrites
        });
        super(client, {
          automaticDeserialization: configOrRequester.automaticDeserialization,
          enableTelemetry: !process.env.UPSTASH_DISABLE_TELEMETRY,
          latencyLogging: configOrRequester.latencyLogging,
          enableAutoPipelining: configOrRequester.enableAutoPipelining
        });
        this.addTelemetry({
          runtime: (
            // @ts-expect-error to silence compiler
            typeof EdgeRuntime === "string" ? "edge-light" : `node@${process.version}`
          ),
          platform: process.env.VERCEL ? "vercel" : process.env.AWS_REGION ? "aws" : "unknown",
          sdk: `@upstash/redis@${VERSION}`
        });
        if (this.enableAutoPipelining) {
          return this.autoPipeline();
        }
      }
      /**
       * Create a new Upstash Redis instance from environment variables.
       *
       * Use this to automatically load connection secrets from your environment
       * variables. For instance when using the Vercel integration.
       *
       * This tries to load `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` from
       * your environment using `process.env`.
       */
      static fromEnv(config3) {
        if (process.env === void 0) {
          throw new TypeError(
            '[Upstash Redis] Unable to get environment variables, `process.env` is undefined. If you are deploying to cloudflare, please import from "@upstash/redis/cloudflare" instead'
          );
        }
        const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
        if (!url) {
          console.warn("[Upstash Redis] Unable to find environment variable: `UPSTASH_REDIS_REST_URL`");
        }
        const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
        if (!token) {
          console.warn(
            "[Upstash Redis] Unable to find environment variable: `UPSTASH_REDIS_REST_TOKEN`"
          );
        }
        return new _Redis({ ...config3, url, token });
      }
    };
  }
});

// src/services/redis.service.ts
var redis_service_exports = {};
__export(redis_service_exports, {
  redisService: () => redisService
});
var redis, redisService;
var init_redis_service = __esm({
  "src/services/redis.service.ts"() {
    "use strict";
    init_nodejs();
    init_config();
    redis = null;
    try {
      if (config2.redis?.url && config2.redis?.token) {
        redis = new Redis2({
          url: config2.redis.url,
          token: config2.redis.token
        });
        console.log("Redis client initialized");
      } else {
        console.warn("Redis configuration missing, some features will be disabled");
      }
    } catch (error) {
      console.error("Failed to initialize Redis client:", error);
    }
    redisService = {
      /**
       * Check if Redis is available
       */
      isAvailable() {
        return redis !== null;
      },
      /**
       * Get a value from Redis
       */
      async get(key) {
        if (!redis)
          return null;
        try {
          return await redis.get(key);
        } catch (error) {
          console.error(`Redis get error for key "${key}":`, error);
          return null;
        }
      },
      /**
       * Set a value in Redis with optional expiration
       */
      async set(key, value, expireSeconds) {
        if (!redis)
          return;
        try {
          if (expireSeconds) {
            await redis.set(key, value, { ex: expireSeconds });
          } else {
            await redis.set(key, value);
          }
        } catch (error) {
          console.error(`Redis set error for key "${key}":`, error);
        }
      },
      /**
       * Delete a key from Redis
       */
      async delete(key) {
        if (!redis)
          return;
        try {
          await redis.del(key);
        } catch (error) {
          console.error(`Redis delete error for key "${key}":`, error);
        }
      },
      /**
       * Delete keys matching a pattern
       */
      async deleteByPattern(pattern) {
        if (!redis)
          return;
        try {
          const keys = await redis.keys(pattern);
          if (keys && keys.length > 0) {
            await redis.del(...keys);
          }
        } catch (error) {
          console.error(`Redis delete by pattern error for "${pattern}":`, error);
        }
      },
      /**
       * Check if a token is blacklisted
       */
      async isTokenBlacklisted(token) {
        if (!redis)
          return false;
        try {
          const key = `blacklist:${token}`;
          const blacklisted = await redis.get(key);
          return !!blacklisted;
        } catch (error) {
          console.error("Redis token blacklist check error:", error);
          return false;
        }
      },
      /**
       * Add a token to the blacklist with expiration
       */
      async blacklistToken(token, expireSeconds = 86400) {
        if (!redis)
          return;
        try {
          const key = `blacklist:${token}`;
          await redis.set(key, "1", { ex: expireSeconds });
        } catch (error) {
          console.error("Redis token blacklist error:", error);
        }
      },
      /**
       * Increment a rate limit counter
       */
      async incrementRateLimit(key, expireSeconds) {
        if (!redis)
          return 0;
        try {
          const count = await redis.incr(key);
          if (count === 1) {
            await redis.expire(key, expireSeconds);
          }
          return count;
        } catch (error) {
          console.error(`Redis rate limit error for key "${key}":`, error);
          return 0;
        }
      },
      /**
       * Get rate limit counter
       */
      async getRateLimit(key) {
        if (!redis)
          return 0;
        try {
          const count = await redis.get(key);
          return count ? Number(count) : 0;
        } catch (error) {
          console.error(`Redis get rate limit error for key "${key}":`, error);
          return 0;
        }
      },
      /**
       * Get time-to-live (TTL) for a key
       */
      async getTTL(key) {
        if (!redis)
          return 0;
        try {
          return await redis.ttl(key);
        } catch (error) {
          console.error(`Redis TTL error for key "${key}":`, error);
          return 0;
        }
      },
      /**
       * Get TTL for a rate limit key
       */
      async getRateLimitTTL(key) {
        return this.getTTL(key);
      },
      /**
       * Decrement a rate limit counter (for successful requests)
       */
      async decrementRateLimit(key) {
        if (!redis)
          return 0;
        try {
          const count = await redis.decr(key);
          if (count < 0) {
            await redis.set(key, 0);
            return 0;
          }
          return count;
        } catch (error) {
          console.error(`Redis decrement rate limit error for key "${key}":`, error);
          return 0;
        }
      },
      /**
       * Reset a rate limit counter
       */
      async resetRateLimit(key) {
        if (!redis)
          return;
        try {
          await redis.del(key);
        } catch (error) {
          console.error(`Redis reset rate limit error for key "${key}":`, error);
        }
      }
    };
  }
});

// ../../node_modules/@prisma/client/runtime/library.js
var require_library = __commonJS({
  "../../node_modules/@prisma/client/runtime/library.js"(exports, module) {
    "use strict";
    var mu = Object.create;
    var Jt = Object.defineProperty;
    var fu = Object.getOwnPropertyDescriptor;
    var gu = Object.getOwnPropertyNames;
    var hu = Object.getPrototypeOf;
    var yu = Object.prototype.hasOwnProperty;
    var Eu = (e, t, r) => t in e ? Jt(e, t, { enumerable: true, configurable: true, writable: true, value: r }) : e[t] = r;
    var K = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports);
    var Wt = (e, t) => {
      for (var r in t)
        Jt(e, r, { get: t[r], enumerable: true });
    };
    var Ao = (e, t, r, n) => {
      if (t && typeof t == "object" || typeof t == "function")
        for (let i of gu(t))
          !yu.call(e, i) && i !== r && Jt(e, i, { get: () => t[i], enumerable: !(n = fu(t, i)) || n.enumerable });
      return e;
    };
    var D = (e, t, r) => (r = e != null ? mu(hu(e)) : {}, Ao(t || !e || !e.__esModule ? Jt(r, "default", { value: e, enumerable: true }) : r, e));
    var bu = (e) => Ao(Jt({}, "__esModule", { value: true }), e);
    var d = (e, t, r) => Eu(e, typeof t != "symbol" ? t + "" : t, r);
    var Zo = K((Kf, pi) => {
      "use strict";
      var v = pi.exports;
      pi.exports.default = v;
      var N = "\x1B[", Zt = "\x1B]", gt = "\x07", Kr = ";", zo = process.env.TERM_PROGRAM === "Apple_Terminal";
      v.cursorTo = (e, t) => {
        if (typeof e != "number")
          throw new TypeError("The `x` argument is required");
        return typeof t != "number" ? N + (e + 1) + "G" : N + (t + 1) + ";" + (e + 1) + "H";
      };
      v.cursorMove = (e, t) => {
        if (typeof e != "number")
          throw new TypeError("The `x` argument is required");
        let r = "";
        return e < 0 ? r += N + -e + "D" : e > 0 && (r += N + e + "C"), t < 0 ? r += N + -t + "A" : t > 0 && (r += N + t + "B"), r;
      };
      v.cursorUp = (e = 1) => N + e + "A";
      v.cursorDown = (e = 1) => N + e + "B";
      v.cursorForward = (e = 1) => N + e + "C";
      v.cursorBackward = (e = 1) => N + e + "D";
      v.cursorLeft = N + "G";
      v.cursorSavePosition = zo ? "\x1B7" : N + "s";
      v.cursorRestorePosition = zo ? "\x1B8" : N + "u";
      v.cursorGetPosition = N + "6n";
      v.cursorNextLine = N + "E";
      v.cursorPrevLine = N + "F";
      v.cursorHide = N + "?25l";
      v.cursorShow = N + "?25h";
      v.eraseLines = (e) => {
        let t = "";
        for (let r = 0; r < e; r++)
          t += v.eraseLine + (r < e - 1 ? v.cursorUp() : "");
        return e && (t += v.cursorLeft), t;
      };
      v.eraseEndLine = N + "K";
      v.eraseStartLine = N + "1K";
      v.eraseLine = N + "2K";
      v.eraseDown = N + "J";
      v.eraseUp = N + "1J";
      v.eraseScreen = N + "2J";
      v.scrollUp = N + "S";
      v.scrollDown = N + "T";
      v.clearScreen = "\x1Bc";
      v.clearTerminal = process.platform === "win32" ? `${v.eraseScreen}${N}0f` : `${v.eraseScreen}${N}3J${N}H`;
      v.beep = gt;
      v.link = (e, t) => [Zt, "8", Kr, Kr, t, gt, e, Zt, "8", Kr, Kr, gt].join("");
      v.image = (e, t = {}) => {
        let r = `${Zt}1337;File=inline=1`;
        return t.width && (r += `;width=${t.width}`), t.height && (r += `;height=${t.height}`), t.preserveAspectRatio === false && (r += ";preserveAspectRatio=0"), r + ":" + e.toString("base64") + gt;
      };
      v.iTerm = { setCwd: (e = process.cwd()) => `${Zt}50;CurrentDir=${e}${gt}`, annotation: (e, t = {}) => {
        let r = `${Zt}1337;`, n = typeof t.x < "u", i = typeof t.y < "u";
        if ((n || i) && !(n && i && typeof t.length < "u"))
          throw new Error("`x`, `y` and `length` must be defined when `x` or `y` is defined");
        return e = e.replace(/\|/g, ""), r += t.isHidden ? "AddHiddenAnnotation=" : "AddAnnotation=", t.length > 0 ? r += (n ? [e, t.length, t.x, t.y] : [t.length, e]).join("|") : r += e, r + gt;
      } };
    });
    var di = K((Yf, Xo) => {
      "use strict";
      Xo.exports = (e, t = process.argv) => {
        let r = e.startsWith("-") ? "" : e.length === 1 ? "-" : "--", n = t.indexOf(r + e), i = t.indexOf("--");
        return n !== -1 && (i === -1 || n < i);
      };
    });
    var rs = K((zf, ts) => {
      "use strict";
      var ac = require("os"), es = require("tty"), he = di(), { env: W } = process, We;
      he("no-color") || he("no-colors") || he("color=false") || he("color=never") ? We = 0 : (he("color") || he("colors") || he("color=true") || he("color=always")) && (We = 1);
      "FORCE_COLOR" in W && (W.FORCE_COLOR === "true" ? We = 1 : W.FORCE_COLOR === "false" ? We = 0 : We = W.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(W.FORCE_COLOR, 10), 3));
      function mi(e) {
        return e === 0 ? false : { level: e, hasBasic: true, has256: e >= 2, has16m: e >= 3 };
      }
      function fi(e, t) {
        if (We === 0)
          return 0;
        if (he("color=16m") || he("color=full") || he("color=truecolor"))
          return 3;
        if (he("color=256"))
          return 2;
        if (e && !t && We === void 0)
          return 0;
        let r = We || 0;
        if (W.TERM === "dumb")
          return r;
        if (process.platform === "win32") {
          let n = ac.release().split(".");
          return Number(n[0]) >= 10 && Number(n[2]) >= 10586 ? Number(n[2]) >= 14931 ? 3 : 2 : 1;
        }
        if ("CI" in W)
          return ["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI", "GITHUB_ACTIONS", "BUILDKITE"].some((n) => n in W) || W.CI_NAME === "codeship" ? 1 : r;
        if ("TEAMCITY_VERSION" in W)
          return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(W.TEAMCITY_VERSION) ? 1 : 0;
        if (W.COLORTERM === "truecolor")
          return 3;
        if ("TERM_PROGRAM" in W) {
          let n = parseInt((W.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
          switch (W.TERM_PROGRAM) {
            case "iTerm.app":
              return n >= 3 ? 3 : 2;
            case "Apple_Terminal":
              return 2;
          }
        }
        return /-256(color)?$/i.test(W.TERM) ? 2 : /^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(W.TERM) || "COLORTERM" in W ? 1 : r;
      }
      function lc(e) {
        let t = fi(e, e && e.isTTY);
        return mi(t);
      }
      ts.exports = { supportsColor: lc, stdout: mi(fi(true, es.isatty(1))), stderr: mi(fi(true, es.isatty(2))) };
    });
    var os = K((Zf, is) => {
      "use strict";
      var uc = rs(), ht = di();
      function ns(e) {
        if (/^\d{3,4}$/.test(e)) {
          let r = /(\d{1,2})(\d{2})/.exec(e);
          return { major: 0, minor: parseInt(r[1], 10), patch: parseInt(r[2], 10) };
        }
        let t = (e || "").split(".").map((r) => parseInt(r, 10));
        return { major: t[0], minor: t[1], patch: t[2] };
      }
      function gi(e) {
        let { env: t } = process;
        if ("FORCE_HYPERLINK" in t)
          return !(t.FORCE_HYPERLINK.length > 0 && parseInt(t.FORCE_HYPERLINK, 10) === 0);
        if (ht("no-hyperlink") || ht("no-hyperlinks") || ht("hyperlink=false") || ht("hyperlink=never"))
          return false;
        if (ht("hyperlink=true") || ht("hyperlink=always") || "NETLIFY" in t)
          return true;
        if (!uc.supportsColor(e) || e && !e.isTTY || process.platform === "win32" || "CI" in t || "TEAMCITY_VERSION" in t)
          return false;
        if ("TERM_PROGRAM" in t) {
          let r = ns(t.TERM_PROGRAM_VERSION);
          switch (t.TERM_PROGRAM) {
            case "iTerm.app":
              return r.major === 3 ? r.minor >= 1 : r.major > 3;
            case "WezTerm":
              return r.major >= 20200620;
            case "vscode":
              return r.major > 1 || r.major === 1 && r.minor >= 72;
          }
        }
        if ("VTE_VERSION" in t) {
          if (t.VTE_VERSION === "0.50.0")
            return false;
          let r = ns(t.VTE_VERSION);
          return r.major > 0 || r.minor >= 50;
        }
        return false;
      }
      is.exports = { supportsHyperlink: gi, stdout: gi(process.stdout), stderr: gi(process.stderr) };
    });
    var as = K((Xf, Xt) => {
      "use strict";
      var cc = Zo(), hi = os(), ss = (e, t, { target: r = "stdout", ...n } = {}) => hi[r] ? cc.link(e, t) : n.fallback === false ? e : typeof n.fallback == "function" ? n.fallback(e, t) : `${e} (\u200B${t}\u200B)`;
      Xt.exports = (e, t, r = {}) => ss(e, t, r);
      Xt.exports.stderr = (e, t, r = {}) => ss(e, t, { target: "stderr", ...r });
      Xt.exports.isSupported = hi.stdout;
      Xt.exports.stderr.isSupported = hi.stderr;
    });
    var us = K((ug, pc) => {
      pc.exports = { name: "@prisma/internals", version: "6.5.0", description: "This package is intended for Prisma's internal use", main: "dist/index.js", types: "dist/index.d.ts", repository: { type: "git", url: "https://github.com/prisma/prisma.git", directory: "packages/internals" }, homepage: "https://www.prisma.io", author: "Tim Suchanek <suchanek@prisma.io>", bugs: "https://github.com/prisma/prisma/issues", license: "Apache-2.0", scripts: { dev: "DEV=true tsx helpers/build.ts", build: "tsx helpers/build.ts", test: "dotenv -e ../../.db.env -- jest --silent", prepublishOnly: "pnpm run build" }, files: ["README.md", "dist", "!**/libquery_engine*", "!dist/get-generators/engines/*", "scripts"], devDependencies: { "@antfu/ni": "0.21.12", "@babel/helper-validator-identifier": "7.25.9", "@opentelemetry/api": "1.9.0", "@swc/core": "1.11.5", "@swc/jest": "0.2.37", "@types/babel__helper-validator-identifier": "7.15.2", "@types/jest": "29.5.14", "@types/node": "18.19.76", "@types/resolve": "1.20.6", archiver: "6.0.2", "checkpoint-client": "1.1.33", "cli-truncate": "4.0.0", dotenv: "16.4.7", esbuild: "0.24.2", "escape-string-regexp": "4.0.0", execa: "5.1.1", "fast-glob": "3.3.3", "find-up": "7.0.0", "fp-ts": "2.16.9", "fs-extra": "11.3.0", "fs-jetpack": "5.1.0", "global-dirs": "4.0.0", globby: "11.1.0", "identifier-regex": "1.0.0", "indent-string": "4.0.0", "is-windows": "1.0.2", "is-wsl": "3.1.0", jest: "29.7.0", "jest-junit": "16.0.0", kleur: "4.1.5", "mock-stdin": "1.0.0", "new-github-issue-url": "0.2.1", "node-fetch": "3.3.2", "npm-packlist": "5.1.3", open: "7.4.2", "p-map": "4.0.0", "read-package-up": "11.0.0", resolve: "1.22.10", "string-width": "4.2.3", "strip-ansi": "6.0.1", "strip-indent": "3.0.0", "temp-dir": "2.0.0", tempy: "1.0.1", "terminal-link": "2.1.1", tmp: "0.2.3", "ts-node": "10.9.2", "ts-pattern": "5.6.2", "ts-toolbelt": "9.6.0", typescript: "5.4.5", yarn: "1.22.22" }, dependencies: { "@prisma/config": "workspace:*", "@prisma/debug": "workspace:*", "@prisma/engines": "workspace:*", "@prisma/fetch-engine": "workspace:*", "@prisma/generator-helper": "workspace:*", "@prisma/get-platform": "workspace:*", "@prisma/prisma-schema-wasm": "6.5.0-73.173f8d54f8d52e692c7e27e72a88314ec7aeff60", "@prisma/schema-files-loader": "workspace:*", arg: "5.0.2", prompts: "2.4.2" }, peerDependencies: { typescript: ">=5.1.0" }, peerDependenciesMeta: { typescript: { optional: true } }, sideEffects: false };
    });
    var bi = K((pg, mc) => {
      mc.exports = { name: "@prisma/engines-version", version: "6.5.0-73.173f8d54f8d52e692c7e27e72a88314ec7aeff60", main: "index.js", types: "index.d.ts", license: "Apache-2.0", author: "Tim Suchanek <suchanek@prisma.io>", prisma: { enginesVersion: "173f8d54f8d52e692c7e27e72a88314ec7aeff60" }, repository: { type: "git", url: "https://github.com/prisma/engines-wrapper.git", directory: "packages/engines-version" }, devDependencies: { "@types/node": "18.19.76", typescript: "4.9.5" }, files: ["index.js", "index.d.ts"], scripts: { build: "tsc -d" } };
    });
    var wi = K((Yr) => {
      "use strict";
      Object.defineProperty(Yr, "__esModule", { value: true });
      Yr.enginesVersion = void 0;
      Yr.enginesVersion = bi().prisma.enginesVersion;
    });
    var ds = K((kg, hc) => {
      hc.exports = { name: "dotenv", version: "16.4.7", description: "Loads environment variables from .env file", main: "lib/main.js", types: "lib/main.d.ts", exports: { ".": { types: "./lib/main.d.ts", require: "./lib/main.js", default: "./lib/main.js" }, "./config": "./config.js", "./config.js": "./config.js", "./lib/env-options": "./lib/env-options.js", "./lib/env-options.js": "./lib/env-options.js", "./lib/cli-options": "./lib/cli-options.js", "./lib/cli-options.js": "./lib/cli-options.js", "./package.json": "./package.json" }, scripts: { "dts-check": "tsc --project tests/types/tsconfig.json", lint: "standard", pretest: "npm run lint && npm run dts-check", test: "tap run --allow-empty-coverage --disable-coverage --timeout=60000", "test:coverage": "tap run --show-full-coverage --timeout=60000 --coverage-report=lcov", prerelease: "npm test", release: "standard-version" }, repository: { type: "git", url: "git://github.com/motdotla/dotenv.git" }, funding: "https://dotenvx.com", keywords: ["dotenv", "env", ".env", "environment", "variables", "config", "settings"], readmeFilename: "README.md", license: "BSD-2-Clause", devDependencies: { "@types/node": "^18.11.3", decache: "^4.6.2", sinon: "^14.0.1", standard: "^17.0.0", "standard-version": "^9.5.0", tap: "^19.2.0", typescript: "^4.8.4" }, engines: { node: ">=12" }, browser: { fs: false } };
    });
    var hs = K((Og, Fe) => {
      "use strict";
      var Ti = require("fs"), Ci = require("path"), yc = require("os"), Ec = require("crypto"), bc = ds(), Ri = bc.version, wc = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;
      function xc(e) {
        let t = {}, r = e.toString();
        r = r.replace(/\r\n?/mg, `
`);
        let n;
        for (; (n = wc.exec(r)) != null; ) {
          let i = n[1], o = n[2] || "";
          o = o.trim();
          let s = o[0];
          o = o.replace(/^(['"`])([\s\S]*)\1$/mg, "$2"), s === '"' && (o = o.replace(/\\n/g, `
`), o = o.replace(/\\r/g, "\r")), t[i] = o;
        }
        return t;
      }
      function Pc(e) {
        let t = gs(e), r = G.configDotenv({ path: t });
        if (!r.parsed) {
          let s = new Error(`MISSING_DATA: Cannot parse ${t} for an unknown reason`);
          throw s.code = "MISSING_DATA", s;
        }
        let n = fs(e).split(","), i = n.length, o;
        for (let s = 0; s < i; s++)
          try {
            let a = n[s].trim(), l = Cc(r, a);
            o = G.decrypt(l.ciphertext, l.key);
            break;
          } catch (a) {
            if (s + 1 >= i)
              throw a;
          }
        return G.parse(o);
      }
      function vc(e) {
        console.log(`[dotenv@${Ri}][INFO] ${e}`);
      }
      function Tc(e) {
        console.log(`[dotenv@${Ri}][WARN] ${e}`);
      }
      function zr(e) {
        console.log(`[dotenv@${Ri}][DEBUG] ${e}`);
      }
      function fs(e) {
        return e && e.DOTENV_KEY && e.DOTENV_KEY.length > 0 ? e.DOTENV_KEY : process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0 ? process.env.DOTENV_KEY : "";
      }
      function Cc(e, t) {
        let r;
        try {
          r = new URL(t);
        } catch (a) {
          if (a.code === "ERR_INVALID_URL") {
            let l = new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");
            throw l.code = "INVALID_DOTENV_KEY", l;
          }
          throw a;
        }
        let n = r.password;
        if (!n) {
          let a = new Error("INVALID_DOTENV_KEY: Missing key part");
          throw a.code = "INVALID_DOTENV_KEY", a;
        }
        let i = r.searchParams.get("environment");
        if (!i) {
          let a = new Error("INVALID_DOTENV_KEY: Missing environment part");
          throw a.code = "INVALID_DOTENV_KEY", a;
        }
        let o = `DOTENV_VAULT_${i.toUpperCase()}`, s = e.parsed[o];
        if (!s) {
          let a = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${o} in your .env.vault file.`);
          throw a.code = "NOT_FOUND_DOTENV_ENVIRONMENT", a;
        }
        return { ciphertext: s, key: n };
      }
      function gs(e) {
        let t = null;
        if (e && e.path && e.path.length > 0)
          if (Array.isArray(e.path))
            for (let r of e.path)
              Ti.existsSync(r) && (t = r.endsWith(".vault") ? r : `${r}.vault`);
          else
            t = e.path.endsWith(".vault") ? e.path : `${e.path}.vault`;
        else
          t = Ci.resolve(process.cwd(), ".env.vault");
        return Ti.existsSync(t) ? t : null;
      }
      function ms(e) {
        return e[0] === "~" ? Ci.join(yc.homedir(), e.slice(1)) : e;
      }
      function Rc(e) {
        vc("Loading env from encrypted .env.vault");
        let t = G._parseVault(e), r = process.env;
        return e && e.processEnv != null && (r = e.processEnv), G.populate(r, t, e), { parsed: t };
      }
      function Sc(e) {
        let t = Ci.resolve(process.cwd(), ".env"), r = "utf8", n = !!(e && e.debug);
        e && e.encoding ? r = e.encoding : n && zr("No encoding is specified. UTF-8 is used by default");
        let i = [t];
        if (e && e.path)
          if (!Array.isArray(e.path))
            i = [ms(e.path)];
          else {
            i = [];
            for (let l of e.path)
              i.push(ms(l));
          }
        let o, s = {};
        for (let l of i)
          try {
            let u = G.parse(Ti.readFileSync(l, { encoding: r }));
            G.populate(s, u, e);
          } catch (u) {
            n && zr(`Failed to load ${l} ${u.message}`), o = u;
          }
        let a = process.env;
        return e && e.processEnv != null && (a = e.processEnv), G.populate(a, s, e), o ? { parsed: s, error: o } : { parsed: s };
      }
      function Ac(e) {
        if (fs(e).length === 0)
          return G.configDotenv(e);
        let t = gs(e);
        return t ? G._configVault(e) : (Tc(`You set DOTENV_KEY but you are missing a .env.vault file at ${t}. Did you forget to build it?`), G.configDotenv(e));
      }
      function Ic(e, t) {
        let r = Buffer.from(t.slice(-64), "hex"), n = Buffer.from(e, "base64"), i = n.subarray(0, 12), o = n.subarray(-16);
        n = n.subarray(12, -16);
        try {
          let s = Ec.createDecipheriv("aes-256-gcm", r, i);
          return s.setAuthTag(o), `${s.update(n)}${s.final()}`;
        } catch (s) {
          let a = s instanceof RangeError, l = s.message === "Invalid key length", u = s.message === "Unsupported state or unable to authenticate data";
          if (a || l) {
            let c = new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");
            throw c.code = "INVALID_DOTENV_KEY", c;
          } else if (u) {
            let c = new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");
            throw c.code = "DECRYPTION_FAILED", c;
          } else
            throw s;
        }
      }
      function kc(e, t, r = {}) {
        let n = !!(r && r.debug), i = !!(r && r.override);
        if (typeof t != "object") {
          let o = new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");
          throw o.code = "OBJECT_REQUIRED", o;
        }
        for (let o of Object.keys(t))
          Object.prototype.hasOwnProperty.call(e, o) ? (i === true && (e[o] = t[o]), n && zr(i === true ? `"${o}" is already defined and WAS overwritten` : `"${o}" is already defined and was NOT overwritten`)) : e[o] = t[o];
      }
      var G = { configDotenv: Sc, _configVault: Rc, _parseVault: Pc, config: Ac, decrypt: Ic, parse: xc, populate: kc };
      Fe.exports.configDotenv = G.configDotenv;
      Fe.exports._configVault = G._configVault;
      Fe.exports._parseVault = G._parseVault;
      Fe.exports.config = G.config;
      Fe.exports.decrypt = G.decrypt;
      Fe.exports.parse = G.parse;
      Fe.exports.populate = G.populate;
      Fe.exports = G;
    });
    var Ps = K(($g, xs) => {
      "use strict";
      xs.exports = (e) => {
        let t = e.match(/^[ \t]*(?=\S)/gm);
        return t ? t.reduce((r, n) => Math.min(r, n.length), 1 / 0) : 0;
      };
    });
    var Ts = K((qg, vs) => {
      "use strict";
      var Nc = Ps();
      vs.exports = (e) => {
        let t = Nc(e);
        if (t === 0)
          return e;
        let r = new RegExp(`^[ \\t]{${t}}`, "gm");
        return e.replace(r, "");
      };
    });
    var Oi = K((Jg, Rs) => {
      "use strict";
      Rs.exports = (e, t = 1, r) => {
        if (r = { indent: " ", includeEmptyLines: false, ...r }, typeof e != "string")
          throw new TypeError(`Expected \`input\` to be a \`string\`, got \`${typeof e}\``);
        if (typeof t != "number")
          throw new TypeError(`Expected \`count\` to be a \`number\`, got \`${typeof t}\``);
        if (typeof r.indent != "string")
          throw new TypeError(`Expected \`options.indent\` to be a \`string\`, got \`${typeof r.indent}\``);
        if (t === 0)
          return e;
        let n = r.includeEmptyLines ? /^/gm : /^(?!\s*$)/gm;
        return e.replace(n, r.indent.repeat(t));
      };
    });
    var ks = K((Kg, Is) => {
      "use strict";
      Is.exports = ({ onlyFirst: e = false } = {}) => {
        let t = ["[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)", "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))"].join("|");
        return new RegExp(t, e ? void 0 : "g");
      };
    });
    var Li = K((Yg, Os) => {
      "use strict";
      var Bc = ks();
      Os.exports = (e) => typeof e == "string" ? e.replace(Bc(), "") : e;
    });
    var _s = K((Xg, tn) => {
      "use strict";
      tn.exports = (e = {}) => {
        let t;
        if (e.repoUrl)
          t = e.repoUrl;
        else if (e.user && e.repo)
          t = `https://github.com/${e.user}/${e.repo}`;
        else
          throw new Error("You need to specify either the `repoUrl` option or both the `user` and `repo` options");
        let r = new URL(`${t}/issues/new`), n = ["body", "title", "labels", "template", "milestone", "assignee", "projects"];
        for (let i of n) {
          let o = e[i];
          if (o !== void 0) {
            if (i === "labels" || i === "projects") {
              if (!Array.isArray(o))
                throw new TypeError(`The \`${i}\` option should be an array`);
              o = o.join(",");
            }
            r.searchParams.set(i, o);
          }
        }
        return r.toString();
      };
      tn.exports.default = tn.exports;
    });
    var Qi = K((hy, ea) => {
      "use strict";
      ea.exports = function() {
        function e(t, r, n, i, o) {
          return t < r || n < r ? t > n ? n + 1 : t + 1 : i === o ? r : r + 1;
        }
        return function(t, r) {
          if (t === r)
            return 0;
          if (t.length > r.length) {
            var n = t;
            t = r, r = n;
          }
          for (var i = t.length, o = r.length; i > 0 && t.charCodeAt(i - 1) === r.charCodeAt(o - 1); )
            i--, o--;
          for (var s = 0; s < i && t.charCodeAt(s) === r.charCodeAt(s); )
            s++;
          if (i -= s, o -= s, i === 0 || o < 3)
            return o;
          var a = 0, l, u, c, p, m, g, h, y, O, T, S, R, _ = [];
          for (l = 0; l < i; l++)
            _.push(l + 1), _.push(t.charCodeAt(s + l));
          for (var I = _.length - 1; a < o - 3; )
            for (O = r.charCodeAt(s + (u = a)), T = r.charCodeAt(s + (c = a + 1)), S = r.charCodeAt(s + (p = a + 2)), R = r.charCodeAt(s + (m = a + 3)), g = a += 4, l = 0; l < I; l += 2)
              h = _[l], y = _[l + 1], u = e(h, u, c, O, y), c = e(u, c, p, T, y), p = e(c, p, m, S, y), g = e(p, m, g, R, y), _[l] = g, m = p, p = c, c = u, u = h;
          for (; a < o; )
            for (O = r.charCodeAt(s + (u = a)), g = ++a, l = 0; l < I; l += 2)
              h = _[l], _[l] = g = e(h, u, g, O, _[l + 1]), u = h;
          return g;
        };
      }();
    });
    var pf = {};
    Wt(pf, { Debug: () => ri, Decimal: () => Ce, Extensions: () => Kn, MetricsClient: () => Dt, PrismaClientInitializationError: () => C, PrismaClientKnownRequestError: () => te, PrismaClientRustPanicError: () => pe, PrismaClientUnknownRequestError: () => U, PrismaClientValidationError: () => re, Public: () => Yn, Sql: () => le, createParam: () => xa, defineDmmfProperty: () => Aa, deserializeJsonResponse: () => Pt, deserializeRawResult: () => Jn, dmmfToRuntimeDataModel: () => Sa, empty: () => Oa, getPrismaClient: () => cu, getRuntime: () => Fn, join: () => ka, makeStrictEnum: () => pu, makeTypedQueryFactory: () => Ia, objectEnumValues: () => Pn, raw: () => Xi, serializeJsonQuery: () => In, skip: () => An, sqltag: () => eo, warnEnvConflicts: () => du, warnOnce: () => or });
    module.exports = bu(pf);
    var Kn = {};
    Wt(Kn, { defineExtension: () => Io, getExtensionContext: () => ko });
    function Io(e) {
      return typeof e == "function" ? e : (t) => t.$extends(e);
    }
    function ko(e) {
      return e;
    }
    var Yn = {};
    Wt(Yn, { validator: () => Oo });
    function Oo(...e) {
      return (t) => t;
    }
    function zn(e) {
      return e.name === "DriverAdapterError" && typeof e.cause == "object";
    }
    function qr(e) {
      return { ok: true, value: e, map(t) {
        return qr(t(e));
      }, flatMap(t) {
        return t(e);
      } };
    }
    function nt(e) {
      return { ok: false, error: e, map() {
        return nt(e);
      }, flatMap() {
        return nt(e);
      } };
    }
    var Zn = class {
      constructor() {
        d(this, "registeredErrors", []);
      }
      consumeError(t) {
        return this.registeredErrors[t];
      }
      registerNewError(t) {
        let r = 0;
        for (; this.registeredErrors[r] !== void 0; )
          r++;
        return this.registeredErrors[r] = { error: t }, r;
      }
    };
    var Xn = (e) => {
      let t = new Zn(), r = me(t, e.transactionContext.bind(e)), n = { adapterName: e.adapterName, errorRegistry: t, queryRaw: me(t, e.queryRaw.bind(e)), executeRaw: me(t, e.executeRaw.bind(e)), executeScript: me(t, e.executeScript.bind(e)), dispose: me(t, e.dispose.bind(e)), provider: e.provider, transactionContext: async (...i) => (await r(...i)).map((s) => wu(t, s)) };
      return e.getConnectionInfo && (n.getConnectionInfo = Pu(t, e.getConnectionInfo.bind(e))), n;
    };
    var wu = (e, t) => {
      let r = me(e, t.startTransaction.bind(t));
      return { adapterName: t.adapterName, provider: t.provider, queryRaw: me(e, t.queryRaw.bind(t)), executeRaw: me(e, t.executeRaw.bind(t)), startTransaction: async (...n) => (await r(...n)).map((o) => xu(e, o)) };
    };
    var xu = (e, t) => ({ adapterName: t.adapterName, provider: t.provider, options: t.options, queryRaw: me(e, t.queryRaw.bind(t)), executeRaw: me(e, t.executeRaw.bind(t)), commit: me(e, t.commit.bind(t)), rollback: me(e, t.rollback.bind(t)) });
    function me(e, t) {
      return async (...r) => {
        try {
          return qr(await t(...r));
        } catch (n) {
          if (zn(n))
            return nt(n.cause);
          let i = e.registerNewError(n);
          return nt({ kind: "GenericJs", id: i });
        }
      };
    }
    function Pu(e, t) {
      return (...r) => {
        try {
          return qr(t(...r));
        } catch (n) {
          if (zn(n))
            return nt(n.cause);
          let i = e.registerNewError(n);
          return nt({ kind: "GenericJs", id: i });
        }
      };
    }
    var Vr = {};
    Wt(Vr, { $: () => Fo, bgBlack: () => _u, bgBlue: () => Fu, bgCyan: () => $u, bgGreen: () => Nu, bgMagenta: () => Mu, bgRed: () => Du, bgWhite: () => qu, bgYellow: () => Lu, black: () => Au, blue: () => it, bold: () => Y, cyan: () => Ne, dim: () => _e, gray: () => Ht, green: () => je, grey: () => Ou, hidden: () => Ru, inverse: () => Cu, italic: () => Tu, magenta: () => Iu, red: () => fe, reset: () => vu, strikethrough: () => Su, underline: () => ee, white: () => ku, yellow: () => De });
    var ei;
    var _o;
    var Do;
    var No;
    var Lo = true;
    typeof process < "u" && ({ FORCE_COLOR: ei, NODE_DISABLE_COLORS: _o, NO_COLOR: Do, TERM: No } = process.env || {}, Lo = process.stdout && process.stdout.isTTY);
    var Fo = { enabled: !_o && Do == null && No !== "dumb" && (ei != null && ei !== "0" || Lo) };
    function q(e, t) {
      let r = new RegExp(`\\x1b\\[${t}m`, "g"), n = `\x1B[${e}m`, i = `\x1B[${t}m`;
      return function(o) {
        return !Fo.enabled || o == null ? o : n + (~("" + o).indexOf(i) ? o.replace(r, i + n) : o) + i;
      };
    }
    var vu = q(0, 0);
    var Y = q(1, 22);
    var _e = q(2, 22);
    var Tu = q(3, 23);
    var ee = q(4, 24);
    var Cu = q(7, 27);
    var Ru = q(8, 28);
    var Su = q(9, 29);
    var Au = q(30, 39);
    var fe = q(31, 39);
    var je = q(32, 39);
    var De = q(33, 39);
    var it = q(34, 39);
    var Iu = q(35, 39);
    var Ne = q(36, 39);
    var ku = q(37, 39);
    var Ht = q(90, 39);
    var Ou = q(90, 39);
    var _u = q(40, 49);
    var Du = q(41, 49);
    var Nu = q(42, 49);
    var Lu = q(43, 49);
    var Fu = q(44, 49);
    var Mu = q(45, 49);
    var $u = q(46, 49);
    var qu = q(47, 49);
    var Vu = 100;
    var Mo = ["green", "yellow", "blue", "magenta", "cyan", "red"];
    var Kt = [];
    var $o = Date.now();
    var ju = 0;
    var ti = typeof process < "u" ? process.env : {};
    globalThis.DEBUG ?? (globalThis.DEBUG = ti.DEBUG ?? "");
    globalThis.DEBUG_COLORS ?? (globalThis.DEBUG_COLORS = ti.DEBUG_COLORS ? ti.DEBUG_COLORS === "true" : true);
    var Yt = { enable(e) {
      typeof e == "string" && (globalThis.DEBUG = e);
    }, disable() {
      let e = globalThis.DEBUG;
      return globalThis.DEBUG = "", e;
    }, enabled(e) {
      let t = globalThis.DEBUG.split(",").map((i) => i.replace(/[.+?^${}()|[\]\\]/g, "\\$&")), r = t.some((i) => i === "" || i[0] === "-" ? false : e.match(RegExp(i.split("*").join(".*") + "$"))), n = t.some((i) => i === "" || i[0] !== "-" ? false : e.match(RegExp(i.slice(1).split("*").join(".*") + "$")));
      return r && !n;
    }, log: (...e) => {
      let [t, r, ...n] = e;
      (console.warn ?? console.log)(`${t} ${r}`, ...n);
    }, formatters: {} };
    function Bu(e) {
      let t = { color: Mo[ju++ % Mo.length], enabled: Yt.enabled(e), namespace: e, log: Yt.log, extend: () => {
      } }, r = (...n) => {
        let { enabled: i, namespace: o, color: s, log: a } = t;
        if (n.length !== 0 && Kt.push([o, ...n]), Kt.length > Vu && Kt.shift(), Yt.enabled(o) || i) {
          let l = n.map((c) => typeof c == "string" ? c : Uu(c)), u = `+${Date.now() - $o}ms`;
          $o = Date.now(), globalThis.DEBUG_COLORS ? a(Vr[s](Y(o)), ...l, Vr[s](u)) : a(o, ...l, u);
        }
      };
      return new Proxy(r, { get: (n, i) => t[i], set: (n, i, o) => t[i] = o });
    }
    var ri = new Proxy(Bu, { get: (e, t) => Yt[t], set: (e, t, r) => Yt[t] = r });
    function Uu(e, t = 2) {
      let r = /* @__PURE__ */ new Set();
      return JSON.stringify(e, (n, i) => {
        if (typeof i == "object" && i !== null) {
          if (r.has(i))
            return "[Circular *]";
          r.add(i);
        } else if (typeof i == "bigint")
          return i.toString();
        return i;
      }, t);
    }
    function qo(e = 7500) {
      let t = Kt.map(([r, ...n]) => `${r} ${n.map((i) => typeof i == "string" ? i : JSON.stringify(i)).join(" ")}`).join(`
`);
      return t.length < e ? t : t.slice(-e);
    }
    function Vo() {
      Kt.length = 0;
    }
    var M = ri;
    var jo = D(require("fs"));
    function ni() {
      let e = process.env.PRISMA_QUERY_ENGINE_LIBRARY;
      if (!(e && jo.default.existsSync(e)) && process.arch === "ia32")
        throw new Error('The default query engine type (Node-API, "library") is currently not supported for 32bit Node. Please set `engineType = "binary"` in the "generator" block of your "schema.prisma" file (or use the environment variables "PRISMA_CLIENT_ENGINE_TYPE=binary" and/or "PRISMA_CLI_QUERY_ENGINE_TYPE=binary".)');
    }
    var ii = ["darwin", "darwin-arm64", "debian-openssl-1.0.x", "debian-openssl-1.1.x", "debian-openssl-3.0.x", "rhel-openssl-1.0.x", "rhel-openssl-1.1.x", "rhel-openssl-3.0.x", "linux-arm64-openssl-1.1.x", "linux-arm64-openssl-1.0.x", "linux-arm64-openssl-3.0.x", "linux-arm-openssl-1.1.x", "linux-arm-openssl-1.0.x", "linux-arm-openssl-3.0.x", "linux-musl", "linux-musl-openssl-3.0.x", "linux-musl-arm64-openssl-1.1.x", "linux-musl-arm64-openssl-3.0.x", "linux-nixos", "linux-static-x64", "linux-static-arm64", "windows", "freebsd11", "freebsd12", "freebsd13", "freebsd14", "freebsd15", "openbsd", "netbsd", "arm"];
    var jr = "libquery_engine";
    function Br(e, t) {
      let r = t === "url";
      return e.includes("windows") ? r ? "query_engine.dll.node" : `query_engine-${e}.dll.node` : e.includes("darwin") ? r ? `${jr}.dylib.node` : `${jr}-${e}.dylib.node` : r ? `${jr}.so.node` : `${jr}-${e}.so.node`;
    }
    var Go = D(require("child_process"));
    var ui = D(require("fs/promises"));
    var Wr = D(require("os"));
    var Le = Symbol.for("@ts-pattern/matcher");
    var Qu = Symbol.for("@ts-pattern/isVariadic");
    var Qr = "@ts-pattern/anonymous-select-key";
    var oi = (e) => !!(e && typeof e == "object");
    var Ur = (e) => e && !!e[Le];
    var Pe = (e, t, r) => {
      if (Ur(e)) {
        let n = e[Le](), { matched: i, selections: o } = n.match(t);
        return i && o && Object.keys(o).forEach((s) => r(s, o[s])), i;
      }
      if (oi(e)) {
        if (!oi(t))
          return false;
        if (Array.isArray(e)) {
          if (!Array.isArray(t))
            return false;
          let n = [], i = [], o = [];
          for (let s of e.keys()) {
            let a = e[s];
            Ur(a) && a[Qu] ? o.push(a) : o.length ? i.push(a) : n.push(a);
          }
          if (o.length) {
            if (o.length > 1)
              throw new Error("Pattern error: Using `...P.array(...)` several times in a single pattern is not allowed.");
            if (t.length < n.length + i.length)
              return false;
            let s = t.slice(0, n.length), a = i.length === 0 ? [] : t.slice(-i.length), l = t.slice(n.length, i.length === 0 ? 1 / 0 : -i.length);
            return n.every((u, c) => Pe(u, s[c], r)) && i.every((u, c) => Pe(u, a[c], r)) && (o.length === 0 || Pe(o[0], l, r));
          }
          return e.length === t.length && e.every((s, a) => Pe(s, t[a], r));
        }
        return Reflect.ownKeys(e).every((n) => {
          let i = e[n];
          return (n in t || Ur(o = i) && o[Le]().matcherType === "optional") && Pe(i, t[n], r);
          var o;
        });
      }
      return Object.is(t, e);
    };
    var Je = (e) => {
      var t, r, n;
      return oi(e) ? Ur(e) ? (t = (r = (n = e[Le]()).getSelectionKeys) == null ? void 0 : r.call(n)) != null ? t : [] : Array.isArray(e) ? zt(e, Je) : zt(Object.values(e), Je) : [];
    };
    var zt = (e, t) => e.reduce((r, n) => r.concat(t(n)), []);
    function ge(e) {
      return Object.assign(e, { optional: () => Gu(e), and: (t) => B(e, t), or: (t) => Ju(e, t), select: (t) => t === void 0 ? Bo(e) : Bo(t, e) });
    }
    function Gu(e) {
      return ge({ [Le]: () => ({ match: (t) => {
        let r = {}, n = (i, o) => {
          r[i] = o;
        };
        return t === void 0 ? (Je(e).forEach((i) => n(i, void 0)), { matched: true, selections: r }) : { matched: Pe(e, t, n), selections: r };
      }, getSelectionKeys: () => Je(e), matcherType: "optional" }) });
    }
    function B(...e) {
      return ge({ [Le]: () => ({ match: (t) => {
        let r = {}, n = (i, o) => {
          r[i] = o;
        };
        return { matched: e.every((i) => Pe(i, t, n)), selections: r };
      }, getSelectionKeys: () => zt(e, Je), matcherType: "and" }) });
    }
    function Ju(...e) {
      return ge({ [Le]: () => ({ match: (t) => {
        let r = {}, n = (i, o) => {
          r[i] = o;
        };
        return zt(e, Je).forEach((i) => n(i, void 0)), { matched: e.some((i) => Pe(i, t, n)), selections: r };
      }, getSelectionKeys: () => zt(e, Je), matcherType: "or" }) });
    }
    function k(e) {
      return { [Le]: () => ({ match: (t) => ({ matched: !!e(t) }) }) };
    }
    function Bo(...e) {
      let t = typeof e[0] == "string" ? e[0] : void 0, r = e.length === 2 ? e[1] : typeof e[0] == "string" ? void 0 : e[0];
      return ge({ [Le]: () => ({ match: (n) => {
        let i = { [t ?? Qr]: n };
        return { matched: r === void 0 || Pe(r, n, (o, s) => {
          i[o] = s;
        }), selections: i };
      }, getSelectionKeys: () => [t ?? Qr].concat(r === void 0 ? [] : Je(r)) }) });
    }
    function we(e) {
      return typeof e == "number";
    }
    function Be(e) {
      return typeof e == "string";
    }
    function Ue(e) {
      return typeof e == "bigint";
    }
    var Nf = ge(k(function(e) {
      return true;
    }));
    var Qe = (e) => Object.assign(ge(e), { startsWith: (t) => {
      return Qe(B(e, (r = t, k((n) => Be(n) && n.startsWith(r)))));
      var r;
    }, endsWith: (t) => {
      return Qe(B(e, (r = t, k((n) => Be(n) && n.endsWith(r)))));
      var r;
    }, minLength: (t) => Qe(B(e, ((r) => k((n) => Be(n) && n.length >= r))(t))), length: (t) => Qe(B(e, ((r) => k((n) => Be(n) && n.length === r))(t))), maxLength: (t) => Qe(B(e, ((r) => k((n) => Be(n) && n.length <= r))(t))), includes: (t) => {
      return Qe(B(e, (r = t, k((n) => Be(n) && n.includes(r)))));
      var r;
    }, regex: (t) => {
      return Qe(B(e, (r = t, k((n) => Be(n) && !!n.match(r)))));
      var r;
    } });
    var Lf = Qe(k(Be));
    var xe = (e) => Object.assign(ge(e), { between: (t, r) => xe(B(e, ((n, i) => k((o) => we(o) && n <= o && i >= o))(t, r))), lt: (t) => xe(B(e, ((r) => k((n) => we(n) && n < r))(t))), gt: (t) => xe(B(e, ((r) => k((n) => we(n) && n > r))(t))), lte: (t) => xe(B(e, ((r) => k((n) => we(n) && n <= r))(t))), gte: (t) => xe(B(e, ((r) => k((n) => we(n) && n >= r))(t))), int: () => xe(B(e, k((t) => we(t) && Number.isInteger(t)))), finite: () => xe(B(e, k((t) => we(t) && Number.isFinite(t)))), positive: () => xe(B(e, k((t) => we(t) && t > 0))), negative: () => xe(B(e, k((t) => we(t) && t < 0))) });
    var Ff = xe(k(we));
    var Ge = (e) => Object.assign(ge(e), { between: (t, r) => Ge(B(e, ((n, i) => k((o) => Ue(o) && n <= o && i >= o))(t, r))), lt: (t) => Ge(B(e, ((r) => k((n) => Ue(n) && n < r))(t))), gt: (t) => Ge(B(e, ((r) => k((n) => Ue(n) && n > r))(t))), lte: (t) => Ge(B(e, ((r) => k((n) => Ue(n) && n <= r))(t))), gte: (t) => Ge(B(e, ((r) => k((n) => Ue(n) && n >= r))(t))), positive: () => Ge(B(e, k((t) => Ue(t) && t > 0))), negative: () => Ge(B(e, k((t) => Ue(t) && t < 0))) });
    var Mf = Ge(k(Ue));
    var $f = ge(k(function(e) {
      return typeof e == "boolean";
    }));
    var qf = ge(k(function(e) {
      return typeof e == "symbol";
    }));
    var Vf = ge(k(function(e) {
      return e == null;
    }));
    var jf = ge(k(function(e) {
      return e != null;
    }));
    var si = class extends Error {
      constructor(t) {
        let r;
        try {
          r = JSON.stringify(t);
        } catch {
          r = t;
        }
        super(`Pattern matching error: no pattern matches value ${r}`), this.input = void 0, this.input = t;
      }
    };
    var ai = { matched: false, value: void 0 };
    function ft(e) {
      return new li(e, ai);
    }
    var li = class e {
      constructor(t, r) {
        this.input = void 0, this.state = void 0, this.input = t, this.state = r;
      }
      with(...t) {
        if (this.state.matched)
          return this;
        let r = t[t.length - 1], n = [t[0]], i;
        t.length === 3 && typeof t[1] == "function" ? i = t[1] : t.length > 2 && n.push(...t.slice(1, t.length - 1));
        let o = false, s = {}, a = (u, c) => {
          o = true, s[u] = c;
        }, l = !n.some((u) => Pe(u, this.input, a)) || i && !i(this.input) ? ai : { matched: true, value: r(o ? Qr in s ? s[Qr] : s : this.input, this.input) };
        return new e(this.input, l);
      }
      when(t, r) {
        if (this.state.matched)
          return this;
        let n = !!t(this.input);
        return new e(this.input, n ? { matched: true, value: r(this.input, this.input) } : ai);
      }
      otherwise(t) {
        return this.state.matched ? this.state.value : t(this.input);
      }
      exhaustive() {
        if (this.state.matched)
          return this.state.value;
        throw new si(this.input);
      }
      run() {
        return this.exhaustive();
      }
      returnType() {
        return this;
      }
    };
    var Jo = require("util");
    var Wu = { warn: De("prisma:warn") };
    var Hu = { warn: () => !process.env.PRISMA_DISABLE_WARNINGS };
    function Gr(e, ...t) {
      Hu.warn() && console.warn(`${Wu.warn} ${e}`, ...t);
    }
    var Ku = (0, Jo.promisify)(Go.default.exec);
    var ie = M("prisma:get-platform");
    var Yu = ["1.0.x", "1.1.x", "3.0.x"];
    async function Wo() {
      let e = Wr.default.platform(), t = process.arch;
      if (e === "freebsd") {
        let s = await Hr("freebsd-version");
        if (s && s.trim().length > 0) {
          let l = /^(\d+)\.?/.exec(s);
          if (l)
            return { platform: "freebsd", targetDistro: `freebsd${l[1]}`, arch: t };
        }
      }
      if (e !== "linux")
        return { platform: e, arch: t };
      let r = await Zu(), n = await sc(), i = ec({ arch: t, archFromUname: n, familyDistro: r.familyDistro }), { libssl: o } = await tc(i);
      return { platform: "linux", libssl: o, arch: t, archFromUname: n, ...r };
    }
    function zu(e) {
      let t = /^ID="?([^"\n]*)"?$/im, r = /^ID_LIKE="?([^"\n]*)"?$/im, n = t.exec(e), i = n && n[1] && n[1].toLowerCase() || "", o = r.exec(e), s = o && o[1] && o[1].toLowerCase() || "", a = ft({ id: i, idLike: s }).with({ id: "alpine" }, ({ id: l }) => ({ targetDistro: "musl", familyDistro: l, originalDistro: l })).with({ id: "raspbian" }, ({ id: l }) => ({ targetDistro: "arm", familyDistro: "debian", originalDistro: l })).with({ id: "nixos" }, ({ id: l }) => ({ targetDistro: "nixos", originalDistro: l, familyDistro: "nixos" })).with({ id: "debian" }, { id: "ubuntu" }, ({ id: l }) => ({ targetDistro: "debian", familyDistro: "debian", originalDistro: l })).with({ id: "rhel" }, { id: "centos" }, { id: "fedora" }, ({ id: l }) => ({ targetDistro: "rhel", familyDistro: "rhel", originalDistro: l })).when(({ idLike: l }) => l.includes("debian") || l.includes("ubuntu"), ({ id: l }) => ({ targetDistro: "debian", familyDistro: "debian", originalDistro: l })).when(({ idLike: l }) => i === "arch" || l.includes("arch"), ({ id: l }) => ({ targetDistro: "debian", familyDistro: "arch", originalDistro: l })).when(({ idLike: l }) => l.includes("centos") || l.includes("fedora") || l.includes("rhel") || l.includes("suse"), ({ id: l }) => ({ targetDistro: "rhel", familyDistro: "rhel", originalDistro: l })).otherwise(({ id: l }) => ({ targetDistro: void 0, familyDistro: void 0, originalDistro: l }));
      return ie(`Found distro info:
${JSON.stringify(a, null, 2)}`), a;
    }
    async function Zu() {
      let e = "/etc/os-release";
      try {
        let t = await ui.default.readFile(e, { encoding: "utf-8" });
        return zu(t);
      } catch {
        return { targetDistro: void 0, familyDistro: void 0, originalDistro: void 0 };
      }
    }
    function Xu(e) {
      let t = /^OpenSSL\s(\d+\.\d+)\.\d+/.exec(e);
      if (t) {
        let r = `${t[1]}.x`;
        return Ho(r);
      }
    }
    function Uo(e) {
      let t = /libssl\.so\.(\d)(\.\d)?/.exec(e);
      if (t) {
        let r = `${t[1]}${t[2] ?? ".0"}.x`;
        return Ho(r);
      }
    }
    function Ho(e) {
      let t = (() => {
        if (Yo(e))
          return e;
        let r = e.split(".");
        return r[1] = "0", r.join(".");
      })();
      if (Yu.includes(t))
        return t;
    }
    function ec(e) {
      return ft(e).with({ familyDistro: "musl" }, () => (ie('Trying platform-specific paths for "alpine"'), ["/lib", "/usr/lib"])).with({ familyDistro: "debian" }, ({ archFromUname: t }) => (ie('Trying platform-specific paths for "debian" (and "ubuntu")'), [`/usr/lib/${t}-linux-gnu`, `/lib/${t}-linux-gnu`])).with({ familyDistro: "rhel" }, () => (ie('Trying platform-specific paths for "rhel"'), ["/lib64", "/usr/lib64"])).otherwise(({ familyDistro: t, arch: r, archFromUname: n }) => (ie(`Don't know any platform-specific paths for "${t}" on ${r} (${n})`), []));
    }
    async function tc(e) {
      let t = 'grep -v "libssl.so.0"', r = await Qo(e);
      if (r) {
        ie(`Found libssl.so file using platform-specific paths: ${r}`);
        let o = Uo(r);
        if (ie(`The parsed libssl version is: ${o}`), o)
          return { libssl: o, strategy: "libssl-specific-path" };
      }
      ie('Falling back to "ldconfig" and other generic paths');
      let n = await Hr(`ldconfig -p | sed "s/.*=>s*//" | sed "s|.*/||" | grep libssl | sort | ${t}`);
      if (n || (n = await Qo(["/lib64", "/usr/lib64", "/lib", "/usr/lib"])), n) {
        ie(`Found libssl.so file using "ldconfig" or other generic paths: ${n}`);
        let o = Uo(n);
        if (ie(`The parsed libssl version is: ${o}`), o)
          return { libssl: o, strategy: "ldconfig" };
      }
      let i = await Hr("openssl version -v");
      if (i) {
        ie(`Found openssl binary with version: ${i}`);
        let o = Xu(i);
        if (ie(`The parsed openssl version is: ${o}`), o)
          return { libssl: o, strategy: "openssl-binary" };
      }
      return ie("Couldn't find any version of libssl or OpenSSL in the system"), {};
    }
    async function Qo(e) {
      for (let t of e) {
        let r = await rc(t);
        if (r)
          return r;
      }
    }
    async function rc(e) {
      try {
        return (await ui.default.readdir(e)).find((r) => r.startsWith("libssl.so.") && !r.startsWith("libssl.so.0"));
      } catch (t) {
        if (t.code === "ENOENT")
          return;
        throw t;
      }
    }
    async function ot() {
      let { binaryTarget: e } = await Ko();
      return e;
    }
    function nc(e) {
      return e.binaryTarget !== void 0;
    }
    async function ci() {
      let { memoized: e, ...t } = await Ko();
      return t;
    }
    var Jr = {};
    async function Ko() {
      if (nc(Jr))
        return Promise.resolve({ ...Jr, memoized: true });
      let e = await Wo(), t = ic(e);
      return Jr = { ...e, binaryTarget: t }, { ...Jr, memoized: false };
    }
    function ic(e) {
      let { platform: t, arch: r, archFromUname: n, libssl: i, targetDistro: o, familyDistro: s, originalDistro: a } = e;
      t === "linux" && !["x64", "arm64"].includes(r) && Gr(`Prisma only officially supports Linux on amd64 (x86_64) and arm64 (aarch64) system architectures (detected "${r}" instead). If you are using your own custom Prisma engines, you can ignore this warning, as long as you've compiled the engines for your system architecture "${n}".`);
      let l = "1.1.x";
      if (t === "linux" && i === void 0) {
        let c = ft({ familyDistro: s }).with({ familyDistro: "debian" }, () => "Please manually install OpenSSL via `apt-get update -y && apt-get install -y openssl` and try installing Prisma again. If you're running Prisma on Docker, add this command to your Dockerfile, or switch to an image that already has OpenSSL installed.").otherwise(() => "Please manually install OpenSSL and try installing Prisma again.");
        Gr(`Prisma failed to detect the libssl/openssl version to use, and may not work as expected. Defaulting to "openssl-${l}".
${c}`);
      }
      let u = "debian";
      if (t === "linux" && o === void 0 && ie(`Distro is "${a}". Falling back to Prisma engines built for "${u}".`), t === "darwin" && r === "arm64")
        return "darwin-arm64";
      if (t === "darwin")
        return "darwin";
      if (t === "win32")
        return "windows";
      if (t === "freebsd")
        return o;
      if (t === "openbsd")
        return "openbsd";
      if (t === "netbsd")
        return "netbsd";
      if (t === "linux" && o === "nixos")
        return "linux-nixos";
      if (t === "linux" && r === "arm64")
        return `${o === "musl" ? "linux-musl-arm64" : "linux-arm64"}-openssl-${i || l}`;
      if (t === "linux" && r === "arm")
        return `linux-arm-openssl-${i || l}`;
      if (t === "linux" && o === "musl") {
        let c = "linux-musl";
        return !i || Yo(i) ? c : `${c}-openssl-${i}`;
      }
      return t === "linux" && o && i ? `${o}-openssl-${i}` : (t !== "linux" && Gr(`Prisma detected unknown OS "${t}" and may not work as expected. Defaulting to "linux".`), i ? `${u}-openssl-${i}` : o ? `${o}-openssl-${l}` : `${u}-openssl-${l}`);
    }
    async function oc(e) {
      try {
        return await e();
      } catch {
        return;
      }
    }
    function Hr(e) {
      return oc(async () => {
        let t = await Ku(e);
        return ie(`Command "${e}" successfully returned "${t.stdout}"`), t.stdout;
      });
    }
    async function sc() {
      return typeof Wr.default.machine == "function" ? Wr.default.machine() : (await Hr("uname -m"))?.trim();
    }
    function Yo(e) {
      return e.startsWith("1.");
    }
    var ls = D(as());
    function yi(e) {
      return (0, ls.default)(e, e, { fallback: ee });
    }
    var dc = us();
    var Ei = dc.version;
    var fc = D(wi());
    var V = D(require("path"));
    var gc = D(wi());
    var xg = M("prisma:engines");
    function cs() {
      return V.default.join(__dirname, "../");
    }
    var Pg = "libquery-engine";
    V.default.join(__dirname, "../query-engine-darwin");
    V.default.join(__dirname, "../query-engine-darwin-arm64");
    V.default.join(__dirname, "../query-engine-debian-openssl-1.0.x");
    V.default.join(__dirname, "../query-engine-debian-openssl-1.1.x");
    V.default.join(__dirname, "../query-engine-debian-openssl-3.0.x");
    V.default.join(__dirname, "../query-engine-linux-static-x64");
    V.default.join(__dirname, "../query-engine-linux-static-arm64");
    V.default.join(__dirname, "../query-engine-rhel-openssl-1.0.x");
    V.default.join(__dirname, "../query-engine-rhel-openssl-1.1.x");
    V.default.join(__dirname, "../query-engine-rhel-openssl-3.0.x");
    V.default.join(__dirname, "../libquery_engine-darwin.dylib.node");
    V.default.join(__dirname, "../libquery_engine-darwin-arm64.dylib.node");
    V.default.join(__dirname, "../libquery_engine-debian-openssl-1.0.x.so.node");
    V.default.join(__dirname, "../libquery_engine-debian-openssl-1.1.x.so.node");
    V.default.join(__dirname, "../libquery_engine-debian-openssl-3.0.x.so.node");
    V.default.join(__dirname, "../libquery_engine-linux-arm64-openssl-1.0.x.so.node");
    V.default.join(__dirname, "../libquery_engine-linux-arm64-openssl-1.1.x.so.node");
    V.default.join(__dirname, "../libquery_engine-linux-arm64-openssl-3.0.x.so.node");
    V.default.join(__dirname, "../libquery_engine-linux-musl.so.node");
    V.default.join(__dirname, "../libquery_engine-linux-musl-openssl-3.0.x.so.node");
    V.default.join(__dirname, "../libquery_engine-rhel-openssl-1.0.x.so.node");
    V.default.join(__dirname, "../libquery_engine-rhel-openssl-1.1.x.so.node");
    V.default.join(__dirname, "../libquery_engine-rhel-openssl-3.0.x.so.node");
    V.default.join(__dirname, "../query_engine-windows.dll.node");
    var xi = D(require("fs"));
    var ps = M("chmodPlusX");
    function Pi(e) {
      if (process.platform === "win32")
        return;
      let t = xi.default.statSync(e), r = t.mode | 64 | 8 | 1;
      if (t.mode === r) {
        ps(`Execution permissions of ${e} are fine`);
        return;
      }
      let n = r.toString(8).slice(-3);
      ps(`Have to call chmodPlusX on ${e}`), xi.default.chmodSync(e, n);
    }
    function vi(e) {
      let t = e.e, r = (a) => `Prisma cannot find the required \`${a}\` system library in your system`, n = t.message.includes("cannot open shared object file"), i = `Please refer to the documentation about Prisma's system requirements: ${yi("https://pris.ly/d/system-requirements")}`, o = `Unable to require(\`${_e(e.id)}\`).`, s = ft({ message: t.message, code: t.code }).with({ code: "ENOENT" }, () => "File does not exist.").when(({ message: a }) => n && a.includes("libz"), () => `${r("libz")}. Please install it and try again.`).when(({ message: a }) => n && a.includes("libgcc_s"), () => `${r("libgcc_s")}. Please install it and try again.`).when(({ message: a }) => n && a.includes("libssl"), () => {
        let a = e.platformInfo.libssl ? `openssl-${e.platformInfo.libssl}` : "openssl";
        return `${r("libssl")}. Please install ${a} and try again.`;
      }).when(({ message: a }) => a.includes("GLIBC"), () => `Prisma has detected an incompatible version of the \`glibc\` C standard library installed in your system. This probably means your system may be too old to run Prisma. ${i}`).when(({ message: a }) => e.platformInfo.platform === "linux" && a.includes("symbol not found"), () => `The Prisma engines are not compatible with your system ${e.platformInfo.originalDistro} on (${e.platformInfo.archFromUname}) which uses the \`${e.platformInfo.binaryTarget}\` binaryTarget by default. ${i}`).otherwise(() => `The Prisma engines do not seem to be compatible with your system. ${i}`);
      return `${o}
${s}

Details: ${t.message}`;
    }
    var Ai = D(hs());
    var Zr = D(require("fs"));
    var yt = D(require("path"));
    function ys(e) {
      let t = e.ignoreProcessEnv ? {} : process.env, r = (n) => n.match(/(.?\${(?:[a-zA-Z0-9_]+)?})/g)?.reduce(function(o, s) {
        let a = /(.?)\${([a-zA-Z0-9_]+)?}/g.exec(s);
        if (!a)
          return o;
        let l = a[1], u, c;
        if (l === "\\")
          c = a[0], u = c.replace("\\$", "$");
        else {
          let p = a[2];
          c = a[0].substring(l.length), u = Object.hasOwnProperty.call(t, p) ? t[p] : e.parsed[p] || "", u = r(u);
        }
        return o.replace(c, u);
      }, n) ?? n;
      for (let n in e.parsed) {
        let i = Object.hasOwnProperty.call(t, n) ? t[n] : e.parsed[n];
        e.parsed[n] = r(i);
      }
      for (let n in e.parsed)
        t[n] = e.parsed[n];
      return e;
    }
    var Si = M("prisma:tryLoadEnv");
    function er({ rootEnvPath: e, schemaEnvPath: t }, r = { conflictCheck: "none" }) {
      let n = Es(e);
      r.conflictCheck !== "none" && Oc(n, t, r.conflictCheck);
      let i = null;
      return bs(n?.path, t) || (i = Es(t)), !n && !i && Si("No Environment variables loaded"), i?.dotenvResult.error ? console.error(fe(Y("Schema Env Error: ")) + i.dotenvResult.error) : { message: [n?.message, i?.message].filter(Boolean).join(`
`), parsed: { ...n?.dotenvResult?.parsed, ...i?.dotenvResult?.parsed } };
    }
    function Oc(e, t, r) {
      let n = e?.dotenvResult.parsed, i = !bs(e?.path, t);
      if (n && t && i && Zr.default.existsSync(t)) {
        let o = Ai.default.parse(Zr.default.readFileSync(t)), s = [];
        for (let a in o)
          n[a] === o[a] && s.push(a);
        if (s.length > 0) {
          let a = yt.default.relative(process.cwd(), e.path), l = yt.default.relative(process.cwd(), t);
          if (r === "error") {
            let u = `There is a conflict between env var${s.length > 1 ? "s" : ""} in ${ee(a)} and ${ee(l)}
Conflicting env vars:
${s.map((c) => `  ${Y(c)}`).join(`
`)}

We suggest to move the contents of ${ee(l)} to ${ee(a)} to consolidate your env vars.
`;
            throw new Error(u);
          } else if (r === "warn") {
            let u = `Conflict for env var${s.length > 1 ? "s" : ""} ${s.map((c) => Y(c)).join(", ")} in ${ee(a)} and ${ee(l)}
Env vars from ${ee(l)} overwrite the ones from ${ee(a)}
      `;
            console.warn(`${De("warn(prisma)")} ${u}`);
          }
        }
      }
    }
    function Es(e) {
      if (_c(e)) {
        Si(`Environment variables loaded from ${e}`);
        let t = Ai.default.config({ path: e, debug: process.env.DOTENV_CONFIG_DEBUG ? true : void 0 });
        return { dotenvResult: ys(t), message: _e(`Environment variables loaded from ${yt.default.relative(process.cwd(), e)}`), path: e };
      } else
        Si(`Environment variables not found at ${e}`);
      return null;
    }
    function bs(e, t) {
      return e && t && yt.default.resolve(e) === yt.default.resolve(t);
    }
    function _c(e) {
      return !!(e && Zr.default.existsSync(e));
    }
    var ws = "library";
    function Et(e) {
      let t = Dc();
      return t || (e?.config.engineType === "library" ? "library" : e?.config.engineType === "binary" ? "binary" : e?.config.engineType === "client" ? "client" : ws);
    }
    function Dc() {
      let e = process.env.PRISMA_CLIENT_ENGINE_TYPE;
      return e === "library" ? "library" : e === "binary" ? "binary" : e === "client" ? "client" : void 0;
    }
    var Cs = "prisma+postgres";
    var Xr = `${Cs}:`;
    function Ii(e) {
      return e?.startsWith(`${Xr}//`) ?? false;
    }
    var tr;
    ((t) => {
      let e;
      ((I) => (I.findUnique = "findUnique", I.findUniqueOrThrow = "findUniqueOrThrow", I.findFirst = "findFirst", I.findFirstOrThrow = "findFirstOrThrow", I.findMany = "findMany", I.create = "create", I.createMany = "createMany", I.createManyAndReturn = "createManyAndReturn", I.update = "update", I.updateMany = "updateMany", I.updateManyAndReturn = "updateManyAndReturn", I.upsert = "upsert", I.delete = "delete", I.deleteMany = "deleteMany", I.groupBy = "groupBy", I.count = "count", I.aggregate = "aggregate", I.findRaw = "findRaw", I.aggregateRaw = "aggregateRaw"))(e = t.ModelAction || (t.ModelAction = {}));
    })(tr || (tr = {}));
    var rr = D(require("path"));
    function ki(e) {
      return rr.default.sep === rr.default.posix.sep ? e : e.split(rr.default.sep).join(rr.default.posix.sep);
    }
    var Ss = D(Oi());
    function Di(e) {
      return String(new _i(e));
    }
    var _i = class {
      constructor(t) {
        this.config = t;
      }
      toString() {
        let { config: t } = this, r = t.provider.fromEnvVar ? `env("${t.provider.fromEnvVar}")` : t.provider.value, n = JSON.parse(JSON.stringify({ provider: r, binaryTargets: Lc(t.binaryTargets) }));
        return `generator ${t.name} {
${(0, Ss.default)(Fc(n), 2)}
}`;
      }
    };
    function Lc(e) {
      let t;
      if (e.length > 0) {
        let r = e.find((n) => n.fromEnvVar !== null);
        r ? t = `env("${r.fromEnvVar}")` : t = e.map((n) => n.native ? "native" : n.value);
      } else
        t = void 0;
      return t;
    }
    function Fc(e) {
      let t = Object.keys(e).reduce((r, n) => Math.max(r, n.length), 0);
      return Object.entries(e).map(([r, n]) => `${r.padEnd(t)} = ${Mc(n)}`).join(`
`);
    }
    function Mc(e) {
      return JSON.parse(JSON.stringify(e, (t, r) => Array.isArray(r) ? `[${r.map((n) => JSON.stringify(n)).join(", ")}]` : JSON.stringify(r)));
    }
    var ir = {};
    Wt(ir, { error: () => Vc, info: () => qc, log: () => $c, query: () => jc, should: () => As, tags: () => nr, warn: () => Ni });
    var nr = { error: fe("prisma:error"), warn: De("prisma:warn"), info: Ne("prisma:info"), query: it("prisma:query") };
    var As = { warn: () => !process.env.PRISMA_DISABLE_WARNINGS };
    function $c(...e) {
      console.log(...e);
    }
    function Ni(e, ...t) {
      As.warn() && console.warn(`${nr.warn} ${e}`, ...t);
    }
    function qc(e, ...t) {
      console.info(`${nr.info} ${e}`, ...t);
    }
    function Vc(e, ...t) {
      console.error(`${nr.error} ${e}`, ...t);
    }
    function jc(e, ...t) {
      console.log(`${nr.query} ${e}`, ...t);
    }
    function en(e, t) {
      if (!e)
        throw new Error(`${t}. This should never happen. If you see this error, please, open an issue at https://pris.ly/prisma-prisma-bug-report`);
    }
    function Me(e, t) {
      throw new Error(t);
    }
    function Fi(e, t) {
      return Object.prototype.hasOwnProperty.call(e, t);
    }
    var Mi = (e, t) => e.reduce((r, n) => (r[t(n)] = n, r), {});
    function bt(e, t) {
      let r = {};
      for (let n of Object.keys(e))
        r[n] = t(e[n], n);
      return r;
    }
    function $i(e, t) {
      if (e.length === 0)
        return;
      let r = e[0];
      for (let n = 1; n < e.length; n++)
        t(r, e[n]) < 0 && (r = e[n]);
      return r;
    }
    function x(e, t) {
      Object.defineProperty(e, "name", { value: t, configurable: true });
    }
    var Ds = /* @__PURE__ */ new Set();
    var or = (e, t, ...r) => {
      Ds.has(e) || (Ds.add(e), Ni(t, ...r));
    };
    var C = class e extends Error {
      constructor(r, n, i) {
        super(r);
        d(this, "clientVersion");
        d(this, "errorCode");
        d(this, "retryable");
        this.name = "PrismaClientInitializationError", this.clientVersion = n, this.errorCode = i, Error.captureStackTrace(e);
      }
      get [Symbol.toStringTag]() {
        return "PrismaClientInitializationError";
      }
    };
    x(C, "PrismaClientInitializationError");
    var te = class extends Error {
      constructor(r, { code: n, clientVersion: i, meta: o, batchRequestIdx: s }) {
        super(r);
        d(this, "code");
        d(this, "meta");
        d(this, "clientVersion");
        d(this, "batchRequestIdx");
        this.name = "PrismaClientKnownRequestError", this.code = n, this.clientVersion = i, this.meta = o, Object.defineProperty(this, "batchRequestIdx", { value: s, enumerable: false, writable: true });
      }
      get [Symbol.toStringTag]() {
        return "PrismaClientKnownRequestError";
      }
    };
    x(te, "PrismaClientKnownRequestError");
    var pe = class extends Error {
      constructor(r, n) {
        super(r);
        d(this, "clientVersion");
        this.name = "PrismaClientRustPanicError", this.clientVersion = n;
      }
      get [Symbol.toStringTag]() {
        return "PrismaClientRustPanicError";
      }
    };
    x(pe, "PrismaClientRustPanicError");
    var U = class extends Error {
      constructor(r, { clientVersion: n, batchRequestIdx: i }) {
        super(r);
        d(this, "clientVersion");
        d(this, "batchRequestIdx");
        this.name = "PrismaClientUnknownRequestError", this.clientVersion = n, Object.defineProperty(this, "batchRequestIdx", { value: i, writable: true, enumerable: false });
      }
      get [Symbol.toStringTag]() {
        return "PrismaClientUnknownRequestError";
      }
    };
    x(U, "PrismaClientUnknownRequestError");
    var re = class extends Error {
      constructor(r, { clientVersion: n }) {
        super(r);
        d(this, "name", "PrismaClientValidationError");
        d(this, "clientVersion");
        this.clientVersion = n;
      }
      get [Symbol.toStringTag]() {
        return "PrismaClientValidationError";
      }
    };
    x(re, "PrismaClientValidationError");
    var wt = 9e15;
    var ze = 1e9;
    var qi = "0123456789abcdef";
    var sn = "2.3025850929940456840179914546843642076011014886287729760333279009675726096773524802359972050895982983419677840422862486334095254650828067566662873690987816894829072083255546808437998948262331985283935053089653777326288461633662222876982198867465436674744042432743651550489343149393914796194044002221051017141748003688084012647080685567743216228355220114804663715659121373450747856947683463616792101806445070648000277502684916746550586856935673420670581136429224554405758925724208241314695689016758940256776311356919292033376587141660230105703089634572075440370847469940168269282808481184289314848524948644871927809676271275775397027668605952496716674183485704422507197965004714951050492214776567636938662976979522110718264549734772662425709429322582798502585509785265383207606726317164309505995087807523710333101197857547331541421808427543863591778117054309827482385045648019095610299291824318237525357709750539565187697510374970888692180205189339507238539205144634197265287286965110862571492198849978748873771345686209167058";
    var an = "3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989380952572010654858632789";
    var Vi = { precision: 20, rounding: 4, modulo: 1, toExpNeg: -7, toExpPos: 21, minE: -wt, maxE: wt, crypto: false };
    var Ms;
    var $e;
    var w = true;
    var un = "[DecimalError] ";
    var Ye = un + "Invalid argument: ";
    var $s = un + "Precision limit exceeded";
    var qs = un + "crypto unavailable";
    var Vs = "[object Decimal]";
    var ne = Math.floor;
    var J = Math.pow;
    var Uc = /^0b([01]+(\.[01]*)?|\.[01]+)(p[+-]?\d+)?$/i;
    var Qc = /^0x([0-9a-f]+(\.[0-9a-f]*)?|\.[0-9a-f]+)(p[+-]?\d+)?$/i;
    var Gc = /^0o([0-7]+(\.[0-7]*)?|\.[0-7]+)(p[+-]?\d+)?$/i;
    var js = /^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i;
    var ye = 1e7;
    var b = 7;
    var Jc = 9007199254740991;
    var Wc = sn.length - 1;
    var ji = an.length - 1;
    var f = { toStringTag: Vs };
    f.absoluteValue = f.abs = function() {
      var e = new this.constructor(this);
      return e.s < 0 && (e.s = 1), E(e);
    };
    f.ceil = function() {
      return E(new this.constructor(this), this.e + 1, 2);
    };
    f.clampedTo = f.clamp = function(e, t) {
      var r, n = this, i = n.constructor;
      if (e = new i(e), t = new i(t), !e.s || !t.s)
        return new i(NaN);
      if (e.gt(t))
        throw Error(Ye + t);
      return r = n.cmp(e), r < 0 ? e : n.cmp(t) > 0 ? t : new i(n);
    };
    f.comparedTo = f.cmp = function(e) {
      var t, r, n, i, o = this, s = o.d, a = (e = new o.constructor(e)).d, l = o.s, u = e.s;
      if (!s || !a)
        return !l || !u ? NaN : l !== u ? l : s === a ? 0 : !s ^ l < 0 ? 1 : -1;
      if (!s[0] || !a[0])
        return s[0] ? l : a[0] ? -u : 0;
      if (l !== u)
        return l;
      if (o.e !== e.e)
        return o.e > e.e ^ l < 0 ? 1 : -1;
      for (n = s.length, i = a.length, t = 0, r = n < i ? n : i; t < r; ++t)
        if (s[t] !== a[t])
          return s[t] > a[t] ^ l < 0 ? 1 : -1;
      return n === i ? 0 : n > i ^ l < 0 ? 1 : -1;
    };
    f.cosine = f.cos = function() {
      var e, t, r = this, n = r.constructor;
      return r.d ? r.d[0] ? (e = n.precision, t = n.rounding, n.precision = e + Math.max(r.e, r.sd()) + b, n.rounding = 1, r = Hc(n, Js(n, r)), n.precision = e, n.rounding = t, E($e == 2 || $e == 3 ? r.neg() : r, e, t, true)) : new n(1) : new n(NaN);
    };
    f.cubeRoot = f.cbrt = function() {
      var e, t, r, n, i, o, s, a, l, u, c = this, p = c.constructor;
      if (!c.isFinite() || c.isZero())
        return new p(c);
      for (w = false, o = c.s * J(c.s * c, 1 / 3), !o || Math.abs(o) == 1 / 0 ? (r = z(c.d), e = c.e, (o = (e - r.length + 1) % 3) && (r += o == 1 || o == -2 ? "0" : "00"), o = J(r, 1 / 3), e = ne((e + 1) / 3) - (e % 3 == (e < 0 ? -1 : 2)), o == 1 / 0 ? r = "5e" + e : (r = o.toExponential(), r = r.slice(0, r.indexOf("e") + 1) + e), n = new p(r), n.s = c.s) : n = new p(o.toString()), s = (e = p.precision) + 3; ; )
        if (a = n, l = a.times(a).times(a), u = l.plus(c), n = $(u.plus(c).times(a), u.plus(l), s + 2, 1), z(a.d).slice(0, s) === (r = z(n.d)).slice(0, s))
          if (r = r.slice(s - 3, s + 1), r == "9999" || !i && r == "4999") {
            if (!i && (E(a, e + 1, 0), a.times(a).times(a).eq(c))) {
              n = a;
              break;
            }
            s += 4, i = 1;
          } else {
            (!+r || !+r.slice(1) && r.charAt(0) == "5") && (E(n, e + 1, 1), t = !n.times(n).times(n).eq(c));
            break;
          }
      return w = true, E(n, e, p.rounding, t);
    };
    f.decimalPlaces = f.dp = function() {
      var e, t = this.d, r = NaN;
      if (t) {
        if (e = t.length - 1, r = (e - ne(this.e / b)) * b, e = t[e], e)
          for (; e % 10 == 0; e /= 10)
            r--;
        r < 0 && (r = 0);
      }
      return r;
    };
    f.dividedBy = f.div = function(e) {
      return $(this, new this.constructor(e));
    };
    f.dividedToIntegerBy = f.divToInt = function(e) {
      var t = this, r = t.constructor;
      return E($(t, new r(e), 0, 1, 1), r.precision, r.rounding);
    };
    f.equals = f.eq = function(e) {
      return this.cmp(e) === 0;
    };
    f.floor = function() {
      return E(new this.constructor(this), this.e + 1, 3);
    };
    f.greaterThan = f.gt = function(e) {
      return this.cmp(e) > 0;
    };
    f.greaterThanOrEqualTo = f.gte = function(e) {
      var t = this.cmp(e);
      return t == 1 || t === 0;
    };
    f.hyperbolicCosine = f.cosh = function() {
      var e, t, r, n, i, o = this, s = o.constructor, a = new s(1);
      if (!o.isFinite())
        return new s(o.s ? 1 / 0 : NaN);
      if (o.isZero())
        return a;
      r = s.precision, n = s.rounding, s.precision = r + Math.max(o.e, o.sd()) + 4, s.rounding = 1, i = o.d.length, i < 32 ? (e = Math.ceil(i / 3), t = (1 / pn(4, e)).toString()) : (e = 16, t = "2.3283064365386962890625e-10"), o = xt(s, 1, o.times(t), new s(1), true);
      for (var l, u = e, c = new s(8); u--; )
        l = o.times(o), o = a.minus(l.times(c.minus(l.times(c))));
      return E(o, s.precision = r, s.rounding = n, true);
    };
    f.hyperbolicSine = f.sinh = function() {
      var e, t, r, n, i = this, o = i.constructor;
      if (!i.isFinite() || i.isZero())
        return new o(i);
      if (t = o.precision, r = o.rounding, o.precision = t + Math.max(i.e, i.sd()) + 4, o.rounding = 1, n = i.d.length, n < 3)
        i = xt(o, 2, i, i, true);
      else {
        e = 1.4 * Math.sqrt(n), e = e > 16 ? 16 : e | 0, i = i.times(1 / pn(5, e)), i = xt(o, 2, i, i, true);
        for (var s, a = new o(5), l = new o(16), u = new o(20); e--; )
          s = i.times(i), i = i.times(a.plus(s.times(l.times(s).plus(u))));
      }
      return o.precision = t, o.rounding = r, E(i, t, r, true);
    };
    f.hyperbolicTangent = f.tanh = function() {
      var e, t, r = this, n = r.constructor;
      return r.isFinite() ? r.isZero() ? new n(r) : (e = n.precision, t = n.rounding, n.precision = e + 7, n.rounding = 1, $(r.sinh(), r.cosh(), n.precision = e, n.rounding = t)) : new n(r.s);
    };
    f.inverseCosine = f.acos = function() {
      var e = this, t = e.constructor, r = e.abs().cmp(1), n = t.precision, i = t.rounding;
      return r !== -1 ? r === 0 ? e.isNeg() ? ve(t, n, i) : new t(0) : new t(NaN) : e.isZero() ? ve(t, n + 4, i).times(0.5) : (t.precision = n + 6, t.rounding = 1, e = new t(1).minus(e).div(e.plus(1)).sqrt().atan(), t.precision = n, t.rounding = i, e.times(2));
    };
    f.inverseHyperbolicCosine = f.acosh = function() {
      var e, t, r = this, n = r.constructor;
      return r.lte(1) ? new n(r.eq(1) ? 0 : NaN) : r.isFinite() ? (e = n.precision, t = n.rounding, n.precision = e + Math.max(Math.abs(r.e), r.sd()) + 4, n.rounding = 1, w = false, r = r.times(r).minus(1).sqrt().plus(r), w = true, n.precision = e, n.rounding = t, r.ln()) : new n(r);
    };
    f.inverseHyperbolicSine = f.asinh = function() {
      var e, t, r = this, n = r.constructor;
      return !r.isFinite() || r.isZero() ? new n(r) : (e = n.precision, t = n.rounding, n.precision = e + 2 * Math.max(Math.abs(r.e), r.sd()) + 6, n.rounding = 1, w = false, r = r.times(r).plus(1).sqrt().plus(r), w = true, n.precision = e, n.rounding = t, r.ln());
    };
    f.inverseHyperbolicTangent = f.atanh = function() {
      var e, t, r, n, i = this, o = i.constructor;
      return i.isFinite() ? i.e >= 0 ? new o(i.abs().eq(1) ? i.s / 0 : i.isZero() ? i : NaN) : (e = o.precision, t = o.rounding, n = i.sd(), Math.max(n, e) < 2 * -i.e - 1 ? E(new o(i), e, t, true) : (o.precision = r = n - i.e, i = $(i.plus(1), new o(1).minus(i), r + e, 1), o.precision = e + 4, o.rounding = 1, i = i.ln(), o.precision = e, o.rounding = t, i.times(0.5))) : new o(NaN);
    };
    f.inverseSine = f.asin = function() {
      var e, t, r, n, i = this, o = i.constructor;
      return i.isZero() ? new o(i) : (t = i.abs().cmp(1), r = o.precision, n = o.rounding, t !== -1 ? t === 0 ? (e = ve(o, r + 4, n).times(0.5), e.s = i.s, e) : new o(NaN) : (o.precision = r + 6, o.rounding = 1, i = i.div(new o(1).minus(i.times(i)).sqrt().plus(1)).atan(), o.precision = r, o.rounding = n, i.times(2)));
    };
    f.inverseTangent = f.atan = function() {
      var e, t, r, n, i, o, s, a, l, u = this, c = u.constructor, p = c.precision, m = c.rounding;
      if (u.isFinite()) {
        if (u.isZero())
          return new c(u);
        if (u.abs().eq(1) && p + 4 <= ji)
          return s = ve(c, p + 4, m).times(0.25), s.s = u.s, s;
      } else {
        if (!u.s)
          return new c(NaN);
        if (p + 4 <= ji)
          return s = ve(c, p + 4, m).times(0.5), s.s = u.s, s;
      }
      for (c.precision = a = p + 10, c.rounding = 1, r = Math.min(28, a / b + 2 | 0), e = r; e; --e)
        u = u.div(u.times(u).plus(1).sqrt().plus(1));
      for (w = false, t = Math.ceil(a / b), n = 1, l = u.times(u), s = new c(u), i = u; e !== -1; )
        if (i = i.times(l), o = s.minus(i.div(n += 2)), i = i.times(l), s = o.plus(i.div(n += 2)), s.d[t] !== void 0)
          for (e = t; s.d[e] === o.d[e] && e--; )
            ;
      return r && (s = s.times(2 << r - 1)), w = true, E(s, c.precision = p, c.rounding = m, true);
    };
    f.isFinite = function() {
      return !!this.d;
    };
    f.isInteger = f.isInt = function() {
      return !!this.d && ne(this.e / b) > this.d.length - 2;
    };
    f.isNaN = function() {
      return !this.s;
    };
    f.isNegative = f.isNeg = function() {
      return this.s < 0;
    };
    f.isPositive = f.isPos = function() {
      return this.s > 0;
    };
    f.isZero = function() {
      return !!this.d && this.d[0] === 0;
    };
    f.lessThan = f.lt = function(e) {
      return this.cmp(e) < 0;
    };
    f.lessThanOrEqualTo = f.lte = function(e) {
      return this.cmp(e) < 1;
    };
    f.logarithm = f.log = function(e) {
      var t, r, n, i, o, s, a, l, u = this, c = u.constructor, p = c.precision, m = c.rounding, g = 5;
      if (e == null)
        e = new c(10), t = true;
      else {
        if (e = new c(e), r = e.d, e.s < 0 || !r || !r[0] || e.eq(1))
          return new c(NaN);
        t = e.eq(10);
      }
      if (r = u.d, u.s < 0 || !r || !r[0] || u.eq(1))
        return new c(r && !r[0] ? -1 / 0 : u.s != 1 ? NaN : r ? 0 : 1 / 0);
      if (t)
        if (r.length > 1)
          o = true;
        else {
          for (i = r[0]; i % 10 === 0; )
            i /= 10;
          o = i !== 1;
        }
      if (w = false, a = p + g, s = Ke(u, a), n = t ? ln(c, a + 10) : Ke(e, a), l = $(s, n, a, 1), sr(l.d, i = p, m))
        do
          if (a += 10, s = Ke(u, a), n = t ? ln(c, a + 10) : Ke(e, a), l = $(s, n, a, 1), !o) {
            +z(l.d).slice(i + 1, i + 15) + 1 == 1e14 && (l = E(l, p + 1, 0));
            break;
          }
        while (sr(l.d, i += 10, m));
      return w = true, E(l, p, m);
    };
    f.minus = f.sub = function(e) {
      var t, r, n, i, o, s, a, l, u, c, p, m, g = this, h = g.constructor;
      if (e = new h(e), !g.d || !e.d)
        return !g.s || !e.s ? e = new h(NaN) : g.d ? e.s = -e.s : e = new h(e.d || g.s !== e.s ? g : NaN), e;
      if (g.s != e.s)
        return e.s = -e.s, g.plus(e);
      if (u = g.d, m = e.d, a = h.precision, l = h.rounding, !u[0] || !m[0]) {
        if (m[0])
          e.s = -e.s;
        else if (u[0])
          e = new h(g);
        else
          return new h(l === 3 ? -0 : 0);
        return w ? E(e, a, l) : e;
      }
      if (r = ne(e.e / b), c = ne(g.e / b), u = u.slice(), o = c - r, o) {
        for (p = o < 0, p ? (t = u, o = -o, s = m.length) : (t = m, r = c, s = u.length), n = Math.max(Math.ceil(a / b), s) + 2, o > n && (o = n, t.length = 1), t.reverse(), n = o; n--; )
          t.push(0);
        t.reverse();
      } else {
        for (n = u.length, s = m.length, p = n < s, p && (s = n), n = 0; n < s; n++)
          if (u[n] != m[n]) {
            p = u[n] < m[n];
            break;
          }
        o = 0;
      }
      for (p && (t = u, u = m, m = t, e.s = -e.s), s = u.length, n = m.length - s; n > 0; --n)
        u[s++] = 0;
      for (n = m.length; n > o; ) {
        if (u[--n] < m[n]) {
          for (i = n; i && u[--i] === 0; )
            u[i] = ye - 1;
          --u[i], u[n] += ye;
        }
        u[n] -= m[n];
      }
      for (; u[--s] === 0; )
        u.pop();
      for (; u[0] === 0; u.shift())
        --r;
      return u[0] ? (e.d = u, e.e = cn(u, r), w ? E(e, a, l) : e) : new h(l === 3 ? -0 : 0);
    };
    f.modulo = f.mod = function(e) {
      var t, r = this, n = r.constructor;
      return e = new n(e), !r.d || !e.s || e.d && !e.d[0] ? new n(NaN) : !e.d || r.d && !r.d[0] ? E(new n(r), n.precision, n.rounding) : (w = false, n.modulo == 9 ? (t = $(r, e.abs(), 0, 3, 1), t.s *= e.s) : t = $(r, e, 0, n.modulo, 1), t = t.times(e), w = true, r.minus(t));
    };
    f.naturalExponential = f.exp = function() {
      return Bi(this);
    };
    f.naturalLogarithm = f.ln = function() {
      return Ke(this);
    };
    f.negated = f.neg = function() {
      var e = new this.constructor(this);
      return e.s = -e.s, E(e);
    };
    f.plus = f.add = function(e) {
      var t, r, n, i, o, s, a, l, u, c, p = this, m = p.constructor;
      if (e = new m(e), !p.d || !e.d)
        return !p.s || !e.s ? e = new m(NaN) : p.d || (e = new m(e.d || p.s === e.s ? p : NaN)), e;
      if (p.s != e.s)
        return e.s = -e.s, p.minus(e);
      if (u = p.d, c = e.d, a = m.precision, l = m.rounding, !u[0] || !c[0])
        return c[0] || (e = new m(p)), w ? E(e, a, l) : e;
      if (o = ne(p.e / b), n = ne(e.e / b), u = u.slice(), i = o - n, i) {
        for (i < 0 ? (r = u, i = -i, s = c.length) : (r = c, n = o, s = u.length), o = Math.ceil(a / b), s = o > s ? o + 1 : s + 1, i > s && (i = s, r.length = 1), r.reverse(); i--; )
          r.push(0);
        r.reverse();
      }
      for (s = u.length, i = c.length, s - i < 0 && (i = s, r = c, c = u, u = r), t = 0; i; )
        t = (u[--i] = u[i] + c[i] + t) / ye | 0, u[i] %= ye;
      for (t && (u.unshift(t), ++n), s = u.length; u[--s] == 0; )
        u.pop();
      return e.d = u, e.e = cn(u, n), w ? E(e, a, l) : e;
    };
    f.precision = f.sd = function(e) {
      var t, r = this;
      if (e !== void 0 && e !== !!e && e !== 1 && e !== 0)
        throw Error(Ye + e);
      return r.d ? (t = Bs(r.d), e && r.e + 1 > t && (t = r.e + 1)) : t = NaN, t;
    };
    f.round = function() {
      var e = this, t = e.constructor;
      return E(new t(e), e.e + 1, t.rounding);
    };
    f.sine = f.sin = function() {
      var e, t, r = this, n = r.constructor;
      return r.isFinite() ? r.isZero() ? new n(r) : (e = n.precision, t = n.rounding, n.precision = e + Math.max(r.e, r.sd()) + b, n.rounding = 1, r = Yc(n, Js(n, r)), n.precision = e, n.rounding = t, E($e > 2 ? r.neg() : r, e, t, true)) : new n(NaN);
    };
    f.squareRoot = f.sqrt = function() {
      var e, t, r, n, i, o, s = this, a = s.d, l = s.e, u = s.s, c = s.constructor;
      if (u !== 1 || !a || !a[0])
        return new c(!u || u < 0 && (!a || a[0]) ? NaN : a ? s : 1 / 0);
      for (w = false, u = Math.sqrt(+s), u == 0 || u == 1 / 0 ? (t = z(a), (t.length + l) % 2 == 0 && (t += "0"), u = Math.sqrt(t), l = ne((l + 1) / 2) - (l < 0 || l % 2), u == 1 / 0 ? t = "5e" + l : (t = u.toExponential(), t = t.slice(0, t.indexOf("e") + 1) + l), n = new c(t)) : n = new c(u.toString()), r = (l = c.precision) + 3; ; )
        if (o = n, n = o.plus($(s, o, r + 2, 1)).times(0.5), z(o.d).slice(0, r) === (t = z(n.d)).slice(0, r))
          if (t = t.slice(r - 3, r + 1), t == "9999" || !i && t == "4999") {
            if (!i && (E(o, l + 1, 0), o.times(o).eq(s))) {
              n = o;
              break;
            }
            r += 4, i = 1;
          } else {
            (!+t || !+t.slice(1) && t.charAt(0) == "5") && (E(n, l + 1, 1), e = !n.times(n).eq(s));
            break;
          }
      return w = true, E(n, l, c.rounding, e);
    };
    f.tangent = f.tan = function() {
      var e, t, r = this, n = r.constructor;
      return r.isFinite() ? r.isZero() ? new n(r) : (e = n.precision, t = n.rounding, n.precision = e + 10, n.rounding = 1, r = r.sin(), r.s = 1, r = $(r, new n(1).minus(r.times(r)).sqrt(), e + 10, 0), n.precision = e, n.rounding = t, E($e == 2 || $e == 4 ? r.neg() : r, e, t, true)) : new n(NaN);
    };
    f.times = f.mul = function(e) {
      var t, r, n, i, o, s, a, l, u, c = this, p = c.constructor, m = c.d, g = (e = new p(e)).d;
      if (e.s *= c.s, !m || !m[0] || !g || !g[0])
        return new p(!e.s || m && !m[0] && !g || g && !g[0] && !m ? NaN : !m || !g ? e.s / 0 : e.s * 0);
      for (r = ne(c.e / b) + ne(e.e / b), l = m.length, u = g.length, l < u && (o = m, m = g, g = o, s = l, l = u, u = s), o = [], s = l + u, n = s; n--; )
        o.push(0);
      for (n = u; --n >= 0; ) {
        for (t = 0, i = l + n; i > n; )
          a = o[i] + g[n] * m[i - n - 1] + t, o[i--] = a % ye | 0, t = a / ye | 0;
        o[i] = (o[i] + t) % ye | 0;
      }
      for (; !o[--s]; )
        o.pop();
      return t ? ++r : o.shift(), e.d = o, e.e = cn(o, r), w ? E(e, p.precision, p.rounding) : e;
    };
    f.toBinary = function(e, t) {
      return Ui(this, 2, e, t);
    };
    f.toDecimalPlaces = f.toDP = function(e, t) {
      var r = this, n = r.constructor;
      return r = new n(r), e === void 0 ? r : (ae(e, 0, ze), t === void 0 ? t = n.rounding : ae(t, 0, 8), E(r, e + r.e + 1, t));
    };
    f.toExponential = function(e, t) {
      var r, n = this, i = n.constructor;
      return e === void 0 ? r = Te(n, true) : (ae(e, 0, ze), t === void 0 ? t = i.rounding : ae(t, 0, 8), n = E(new i(n), e + 1, t), r = Te(n, true, e + 1)), n.isNeg() && !n.isZero() ? "-" + r : r;
    };
    f.toFixed = function(e, t) {
      var r, n, i = this, o = i.constructor;
      return e === void 0 ? r = Te(i) : (ae(e, 0, ze), t === void 0 ? t = o.rounding : ae(t, 0, 8), n = E(new o(i), e + i.e + 1, t), r = Te(n, false, e + n.e + 1)), i.isNeg() && !i.isZero() ? "-" + r : r;
    };
    f.toFraction = function(e) {
      var t, r, n, i, o, s, a, l, u, c, p, m, g = this, h = g.d, y = g.constructor;
      if (!h)
        return new y(g);
      if (u = r = new y(1), n = l = new y(0), t = new y(n), o = t.e = Bs(h) - g.e - 1, s = o % b, t.d[0] = J(10, s < 0 ? b + s : s), e == null)
        e = o > 0 ? t : u;
      else {
        if (a = new y(e), !a.isInt() || a.lt(u))
          throw Error(Ye + a);
        e = a.gt(t) ? o > 0 ? t : u : a;
      }
      for (w = false, a = new y(z(h)), c = y.precision, y.precision = o = h.length * b * 2; p = $(a, t, 0, 1, 1), i = r.plus(p.times(n)), i.cmp(e) != 1; )
        r = n, n = i, i = u, u = l.plus(p.times(i)), l = i, i = t, t = a.minus(p.times(i)), a = i;
      return i = $(e.minus(r), n, 0, 1, 1), l = l.plus(i.times(u)), r = r.plus(i.times(n)), l.s = u.s = g.s, m = $(u, n, o, 1).minus(g).abs().cmp($(l, r, o, 1).minus(g).abs()) < 1 ? [u, n] : [l, r], y.precision = c, w = true, m;
    };
    f.toHexadecimal = f.toHex = function(e, t) {
      return Ui(this, 16, e, t);
    };
    f.toNearest = function(e, t) {
      var r = this, n = r.constructor;
      if (r = new n(r), e == null) {
        if (!r.d)
          return r;
        e = new n(1), t = n.rounding;
      } else {
        if (e = new n(e), t === void 0 ? t = n.rounding : ae(t, 0, 8), !r.d)
          return e.s ? r : e;
        if (!e.d)
          return e.s && (e.s = r.s), e;
      }
      return e.d[0] ? (w = false, r = $(r, e, 0, t, 1).times(e), w = true, E(r)) : (e.s = r.s, r = e), r;
    };
    f.toNumber = function() {
      return +this;
    };
    f.toOctal = function(e, t) {
      return Ui(this, 8, e, t);
    };
    f.toPower = f.pow = function(e) {
      var t, r, n, i, o, s, a = this, l = a.constructor, u = +(e = new l(e));
      if (!a.d || !e.d || !a.d[0] || !e.d[0])
        return new l(J(+a, u));
      if (a = new l(a), a.eq(1))
        return a;
      if (n = l.precision, o = l.rounding, e.eq(1))
        return E(a, n, o);
      if (t = ne(e.e / b), t >= e.d.length - 1 && (r = u < 0 ? -u : u) <= Jc)
        return i = Us(l, a, r, n), e.s < 0 ? new l(1).div(i) : E(i, n, o);
      if (s = a.s, s < 0) {
        if (t < e.d.length - 1)
          return new l(NaN);
        if (e.d[t] & 1 || (s = 1), a.e == 0 && a.d[0] == 1 && a.d.length == 1)
          return a.s = s, a;
      }
      return r = J(+a, u), t = r == 0 || !isFinite(r) ? ne(u * (Math.log("0." + z(a.d)) / Math.LN10 + a.e + 1)) : new l(r + "").e, t > l.maxE + 1 || t < l.minE - 1 ? new l(t > 0 ? s / 0 : 0) : (w = false, l.rounding = a.s = 1, r = Math.min(12, (t + "").length), i = Bi(e.times(Ke(a, n + r)), n), i.d && (i = E(i, n + 5, 1), sr(i.d, n, o) && (t = n + 10, i = E(Bi(e.times(Ke(a, t + r)), t), t + 5, 1), +z(i.d).slice(n + 1, n + 15) + 1 == 1e14 && (i = E(i, n + 1, 0)))), i.s = s, w = true, l.rounding = o, E(i, n, o));
    };
    f.toPrecision = function(e, t) {
      var r, n = this, i = n.constructor;
      return e === void 0 ? r = Te(n, n.e <= i.toExpNeg || n.e >= i.toExpPos) : (ae(e, 1, ze), t === void 0 ? t = i.rounding : ae(t, 0, 8), n = E(new i(n), e, t), r = Te(n, e <= n.e || n.e <= i.toExpNeg, e)), n.isNeg() && !n.isZero() ? "-" + r : r;
    };
    f.toSignificantDigits = f.toSD = function(e, t) {
      var r = this, n = r.constructor;
      return e === void 0 ? (e = n.precision, t = n.rounding) : (ae(e, 1, ze), t === void 0 ? t = n.rounding : ae(t, 0, 8)), E(new n(r), e, t);
    };
    f.toString = function() {
      var e = this, t = e.constructor, r = Te(e, e.e <= t.toExpNeg || e.e >= t.toExpPos);
      return e.isNeg() && !e.isZero() ? "-" + r : r;
    };
    f.truncated = f.trunc = function() {
      return E(new this.constructor(this), this.e + 1, 1);
    };
    f.valueOf = f.toJSON = function() {
      var e = this, t = e.constructor, r = Te(e, e.e <= t.toExpNeg || e.e >= t.toExpPos);
      return e.isNeg() ? "-" + r : r;
    };
    function z(e) {
      var t, r, n, i = e.length - 1, o = "", s = e[0];
      if (i > 0) {
        for (o += s, t = 1; t < i; t++)
          n = e[t] + "", r = b - n.length, r && (o += He(r)), o += n;
        s = e[t], n = s + "", r = b - n.length, r && (o += He(r));
      } else if (s === 0)
        return "0";
      for (; s % 10 === 0; )
        s /= 10;
      return o + s;
    }
    function ae(e, t, r) {
      if (e !== ~~e || e < t || e > r)
        throw Error(Ye + e);
    }
    function sr(e, t, r, n) {
      var i, o, s, a;
      for (o = e[0]; o >= 10; o /= 10)
        --t;
      return --t < 0 ? (t += b, i = 0) : (i = Math.ceil((t + 1) / b), t %= b), o = J(10, b - t), a = e[i] % o | 0, n == null ? t < 3 ? (t == 0 ? a = a / 100 | 0 : t == 1 && (a = a / 10 | 0), s = r < 4 && a == 99999 || r > 3 && a == 49999 || a == 5e4 || a == 0) : s = (r < 4 && a + 1 == o || r > 3 && a + 1 == o / 2) && (e[i + 1] / o / 100 | 0) == J(10, t - 2) - 1 || (a == o / 2 || a == 0) && (e[i + 1] / o / 100 | 0) == 0 : t < 4 ? (t == 0 ? a = a / 1e3 | 0 : t == 1 ? a = a / 100 | 0 : t == 2 && (a = a / 10 | 0), s = (n || r < 4) && a == 9999 || !n && r > 3 && a == 4999) : s = ((n || r < 4) && a + 1 == o || !n && r > 3 && a + 1 == o / 2) && (e[i + 1] / o / 1e3 | 0) == J(10, t - 3) - 1, s;
    }
    function nn(e, t, r) {
      for (var n, i = [0], o, s = 0, a = e.length; s < a; ) {
        for (o = i.length; o--; )
          i[o] *= t;
        for (i[0] += qi.indexOf(e.charAt(s++)), n = 0; n < i.length; n++)
          i[n] > r - 1 && (i[n + 1] === void 0 && (i[n + 1] = 0), i[n + 1] += i[n] / r | 0, i[n] %= r);
      }
      return i.reverse();
    }
    function Hc(e, t) {
      var r, n, i;
      if (t.isZero())
        return t;
      n = t.d.length, n < 32 ? (r = Math.ceil(n / 3), i = (1 / pn(4, r)).toString()) : (r = 16, i = "2.3283064365386962890625e-10"), e.precision += r, t = xt(e, 1, t.times(i), new e(1));
      for (var o = r; o--; ) {
        var s = t.times(t);
        t = s.times(s).minus(s).times(8).plus(1);
      }
      return e.precision -= r, t;
    }
    var $ = function() {
      function e(n, i, o) {
        var s, a = 0, l = n.length;
        for (n = n.slice(); l--; )
          s = n[l] * i + a, n[l] = s % o | 0, a = s / o | 0;
        return a && n.unshift(a), n;
      }
      function t(n, i, o, s) {
        var a, l;
        if (o != s)
          l = o > s ? 1 : -1;
        else
          for (a = l = 0; a < o; a++)
            if (n[a] != i[a]) {
              l = n[a] > i[a] ? 1 : -1;
              break;
            }
        return l;
      }
      function r(n, i, o, s) {
        for (var a = 0; o--; )
          n[o] -= a, a = n[o] < i[o] ? 1 : 0, n[o] = a * s + n[o] - i[o];
        for (; !n[0] && n.length > 1; )
          n.shift();
      }
      return function(n, i, o, s, a, l) {
        var u, c, p, m, g, h, y, O, T, S, R, _, I, ce, Gt, Q, se, Oe, Z, mt, $r = n.constructor, Hn = n.s == i.s ? 1 : -1, X = n.d, F = i.d;
        if (!X || !X[0] || !F || !F[0])
          return new $r(!n.s || !i.s || (X ? F && X[0] == F[0] : !F) ? NaN : X && X[0] == 0 || !F ? Hn * 0 : Hn / 0);
        for (l ? (g = 1, c = n.e - i.e) : (l = ye, g = b, c = ne(n.e / g) - ne(i.e / g)), Z = F.length, se = X.length, T = new $r(Hn), S = T.d = [], p = 0; F[p] == (X[p] || 0); p++)
          ;
        if (F[p] > (X[p] || 0) && c--, o == null ? (ce = o = $r.precision, s = $r.rounding) : a ? ce = o + (n.e - i.e) + 1 : ce = o, ce < 0)
          S.push(1), h = true;
        else {
          if (ce = ce / g + 2 | 0, p = 0, Z == 1) {
            for (m = 0, F = F[0], ce++; (p < se || m) && ce--; p++)
              Gt = m * l + (X[p] || 0), S[p] = Gt / F | 0, m = Gt % F | 0;
            h = m || p < se;
          } else {
            for (m = l / (F[0] + 1) | 0, m > 1 && (F = e(F, m, l), X = e(X, m, l), Z = F.length, se = X.length), Q = Z, R = X.slice(0, Z), _ = R.length; _ < Z; )
              R[_++] = 0;
            mt = F.slice(), mt.unshift(0), Oe = F[0], F[1] >= l / 2 && ++Oe;
            do
              m = 0, u = t(F, R, Z, _), u < 0 ? (I = R[0], Z != _ && (I = I * l + (R[1] || 0)), m = I / Oe | 0, m > 1 ? (m >= l && (m = l - 1), y = e(F, m, l), O = y.length, _ = R.length, u = t(y, R, O, _), u == 1 && (m--, r(y, Z < O ? mt : F, O, l))) : (m == 0 && (u = m = 1), y = F.slice()), O = y.length, O < _ && y.unshift(0), r(R, y, _, l), u == -1 && (_ = R.length, u = t(F, R, Z, _), u < 1 && (m++, r(R, Z < _ ? mt : F, _, l))), _ = R.length) : u === 0 && (m++, R = [0]), S[p++] = m, u && R[0] ? R[_++] = X[Q] || 0 : (R = [X[Q]], _ = 1);
            while ((Q++ < se || R[0] !== void 0) && ce--);
            h = R[0] !== void 0;
          }
          S[0] || S.shift();
        }
        if (g == 1)
          T.e = c, Ms = h;
        else {
          for (p = 1, m = S[0]; m >= 10; m /= 10)
            p++;
          T.e = p + c * g - 1, E(T, a ? o + T.e + 1 : o, s, h);
        }
        return T;
      };
    }();
    function E(e, t, r, n) {
      var i, o, s, a, l, u, c, p, m, g = e.constructor;
      e:
        if (t != null) {
          if (p = e.d, !p)
            return e;
          for (i = 1, a = p[0]; a >= 10; a /= 10)
            i++;
          if (o = t - i, o < 0)
            o += b, s = t, c = p[m = 0], l = c / J(10, i - s - 1) % 10 | 0;
          else if (m = Math.ceil((o + 1) / b), a = p.length, m >= a)
            if (n) {
              for (; a++ <= m; )
                p.push(0);
              c = l = 0, i = 1, o %= b, s = o - b + 1;
            } else
              break e;
          else {
            for (c = a = p[m], i = 1; a >= 10; a /= 10)
              i++;
            o %= b, s = o - b + i, l = s < 0 ? 0 : c / J(10, i - s - 1) % 10 | 0;
          }
          if (n = n || t < 0 || p[m + 1] !== void 0 || (s < 0 ? c : c % J(10, i - s - 1)), u = r < 4 ? (l || n) && (r == 0 || r == (e.s < 0 ? 3 : 2)) : l > 5 || l == 5 && (r == 4 || n || r == 6 && (o > 0 ? s > 0 ? c / J(10, i - s) : 0 : p[m - 1]) % 10 & 1 || r == (e.s < 0 ? 8 : 7)), t < 1 || !p[0])
            return p.length = 0, u ? (t -= e.e + 1, p[0] = J(10, (b - t % b) % b), e.e = -t || 0) : p[0] = e.e = 0, e;
          if (o == 0 ? (p.length = m, a = 1, m--) : (p.length = m + 1, a = J(10, b - o), p[m] = s > 0 ? (c / J(10, i - s) % J(10, s) | 0) * a : 0), u)
            for (; ; )
              if (m == 0) {
                for (o = 1, s = p[0]; s >= 10; s /= 10)
                  o++;
                for (s = p[0] += a, a = 1; s >= 10; s /= 10)
                  a++;
                o != a && (e.e++, p[0] == ye && (p[0] = 1));
                break;
              } else {
                if (p[m] += a, p[m] != ye)
                  break;
                p[m--] = 0, a = 1;
              }
          for (o = p.length; p[--o] === 0; )
            p.pop();
        }
      return w && (e.e > g.maxE ? (e.d = null, e.e = NaN) : e.e < g.minE && (e.e = 0, e.d = [0])), e;
    }
    function Te(e, t, r) {
      if (!e.isFinite())
        return Gs(e);
      var n, i = e.e, o = z(e.d), s = o.length;
      return t ? (r && (n = r - s) > 0 ? o = o.charAt(0) + "." + o.slice(1) + He(n) : s > 1 && (o = o.charAt(0) + "." + o.slice(1)), o = o + (e.e < 0 ? "e" : "e+") + e.e) : i < 0 ? (o = "0." + He(-i - 1) + o, r && (n = r - s) > 0 && (o += He(n))) : i >= s ? (o += He(i + 1 - s), r && (n = r - i - 1) > 0 && (o = o + "." + He(n))) : ((n = i + 1) < s && (o = o.slice(0, n) + "." + o.slice(n)), r && (n = r - s) > 0 && (i + 1 === s && (o += "."), o += He(n))), o;
    }
    function cn(e, t) {
      var r = e[0];
      for (t *= b; r >= 10; r /= 10)
        t++;
      return t;
    }
    function ln(e, t, r) {
      if (t > Wc)
        throw w = true, r && (e.precision = r), Error($s);
      return E(new e(sn), t, 1, true);
    }
    function ve(e, t, r) {
      if (t > ji)
        throw Error($s);
      return E(new e(an), t, r, true);
    }
    function Bs(e) {
      var t = e.length - 1, r = t * b + 1;
      if (t = e[t], t) {
        for (; t % 10 == 0; t /= 10)
          r--;
        for (t = e[0]; t >= 10; t /= 10)
          r++;
      }
      return r;
    }
    function He(e) {
      for (var t = ""; e--; )
        t += "0";
      return t;
    }
    function Us(e, t, r, n) {
      var i, o = new e(1), s = Math.ceil(n / b + 4);
      for (w = false; ; ) {
        if (r % 2 && (o = o.times(t), Ls(o.d, s) && (i = true)), r = ne(r / 2), r === 0) {
          r = o.d.length - 1, i && o.d[r] === 0 && ++o.d[r];
          break;
        }
        t = t.times(t), Ls(t.d, s);
      }
      return w = true, o;
    }
    function Ns(e) {
      return e.d[e.d.length - 1] & 1;
    }
    function Qs(e, t, r) {
      for (var n, i, o = new e(t[0]), s = 0; ++s < t.length; ) {
        if (i = new e(t[s]), !i.s) {
          o = i;
          break;
        }
        n = o.cmp(i), (n === r || n === 0 && o.s === r) && (o = i);
      }
      return o;
    }
    function Bi(e, t) {
      var r, n, i, o, s, a, l, u = 0, c = 0, p = 0, m = e.constructor, g = m.rounding, h = m.precision;
      if (!e.d || !e.d[0] || e.e > 17)
        return new m(e.d ? e.d[0] ? e.s < 0 ? 0 : 1 / 0 : 1 : e.s ? e.s < 0 ? 0 : e : NaN);
      for (t == null ? (w = false, l = h) : l = t, a = new m(0.03125); e.e > -2; )
        e = e.times(a), p += 5;
      for (n = Math.log(J(2, p)) / Math.LN10 * 2 + 5 | 0, l += n, r = o = s = new m(1), m.precision = l; ; ) {
        if (o = E(o.times(e), l, 1), r = r.times(++c), a = s.plus($(o, r, l, 1)), z(a.d).slice(0, l) === z(s.d).slice(0, l)) {
          for (i = p; i--; )
            s = E(s.times(s), l, 1);
          if (t == null)
            if (u < 3 && sr(s.d, l - n, g, u))
              m.precision = l += 10, r = o = a = new m(1), c = 0, u++;
            else
              return E(s, m.precision = h, g, w = true);
          else
            return m.precision = h, s;
        }
        s = a;
      }
    }
    function Ke(e, t) {
      var r, n, i, o, s, a, l, u, c, p, m, g = 1, h = 10, y = e, O = y.d, T = y.constructor, S = T.rounding, R = T.precision;
      if (y.s < 0 || !O || !O[0] || !y.e && O[0] == 1 && O.length == 1)
        return new T(O && !O[0] ? -1 / 0 : y.s != 1 ? NaN : O ? 0 : y);
      if (t == null ? (w = false, c = R) : c = t, T.precision = c += h, r = z(O), n = r.charAt(0), Math.abs(o = y.e) < 15e14) {
        for (; n < 7 && n != 1 || n == 1 && r.charAt(1) > 3; )
          y = y.times(e), r = z(y.d), n = r.charAt(0), g++;
        o = y.e, n > 1 ? (y = new T("0." + r), o++) : y = new T(n + "." + r.slice(1));
      } else
        return u = ln(T, c + 2, R).times(o + ""), y = Ke(new T(n + "." + r.slice(1)), c - h).plus(u), T.precision = R, t == null ? E(y, R, S, w = true) : y;
      for (p = y, l = s = y = $(y.minus(1), y.plus(1), c, 1), m = E(y.times(y), c, 1), i = 3; ; ) {
        if (s = E(s.times(m), c, 1), u = l.plus($(s, new T(i), c, 1)), z(u.d).slice(0, c) === z(l.d).slice(0, c))
          if (l = l.times(2), o !== 0 && (l = l.plus(ln(T, c + 2, R).times(o + ""))), l = $(l, new T(g), c, 1), t == null)
            if (sr(l.d, c - h, S, a))
              T.precision = c += h, u = s = y = $(p.minus(1), p.plus(1), c, 1), m = E(y.times(y), c, 1), i = a = 1;
            else
              return E(l, T.precision = R, S, w = true);
          else
            return T.precision = R, l;
        l = u, i += 2;
      }
    }
    function Gs(e) {
      return String(e.s * e.s / 0);
    }
    function on(e, t) {
      var r, n, i;
      for ((r = t.indexOf(".")) > -1 && (t = t.replace(".", "")), (n = t.search(/e/i)) > 0 ? (r < 0 && (r = n), r += +t.slice(n + 1), t = t.substring(0, n)) : r < 0 && (r = t.length), n = 0; t.charCodeAt(n) === 48; n++)
        ;
      for (i = t.length; t.charCodeAt(i - 1) === 48; --i)
        ;
      if (t = t.slice(n, i), t) {
        if (i -= n, e.e = r = r - n - 1, e.d = [], n = (r + 1) % b, r < 0 && (n += b), n < i) {
          for (n && e.d.push(+t.slice(0, n)), i -= b; n < i; )
            e.d.push(+t.slice(n, n += b));
          t = t.slice(n), n = b - t.length;
        } else
          n -= i;
        for (; n--; )
          t += "0";
        e.d.push(+t), w && (e.e > e.constructor.maxE ? (e.d = null, e.e = NaN) : e.e < e.constructor.minE && (e.e = 0, e.d = [0]));
      } else
        e.e = 0, e.d = [0];
      return e;
    }
    function Kc(e, t) {
      var r, n, i, o, s, a, l, u, c;
      if (t.indexOf("_") > -1) {
        if (t = t.replace(/(\d)_(?=\d)/g, "$1"), js.test(t))
          return on(e, t);
      } else if (t === "Infinity" || t === "NaN")
        return +t || (e.s = NaN), e.e = NaN, e.d = null, e;
      if (Qc.test(t))
        r = 16, t = t.toLowerCase();
      else if (Uc.test(t))
        r = 2;
      else if (Gc.test(t))
        r = 8;
      else
        throw Error(Ye + t);
      for (o = t.search(/p/i), o > 0 ? (l = +t.slice(o + 1), t = t.substring(2, o)) : t = t.slice(2), o = t.indexOf("."), s = o >= 0, n = e.constructor, s && (t = t.replace(".", ""), a = t.length, o = a - o, i = Us(n, new n(r), o, o * 2)), u = nn(t, r, ye), c = u.length - 1, o = c; u[o] === 0; --o)
        u.pop();
      return o < 0 ? new n(e.s * 0) : (e.e = cn(u, c), e.d = u, w = false, s && (e = $(e, i, a * 4)), l && (e = e.times(Math.abs(l) < 54 ? J(2, l) : st.pow(2, l))), w = true, e);
    }
    function Yc(e, t) {
      var r, n = t.d.length;
      if (n < 3)
        return t.isZero() ? t : xt(e, 2, t, t);
      r = 1.4 * Math.sqrt(n), r = r > 16 ? 16 : r | 0, t = t.times(1 / pn(5, r)), t = xt(e, 2, t, t);
      for (var i, o = new e(5), s = new e(16), a = new e(20); r--; )
        i = t.times(t), t = t.times(o.plus(i.times(s.times(i).minus(a))));
      return t;
    }
    function xt(e, t, r, n, i) {
      var o, s, a, l, u = 1, c = e.precision, p = Math.ceil(c / b);
      for (w = false, l = r.times(r), a = new e(n); ; ) {
        if (s = $(a.times(l), new e(t++ * t++), c, 1), a = i ? n.plus(s) : n.minus(s), n = $(s.times(l), new e(t++ * t++), c, 1), s = a.plus(n), s.d[p] !== void 0) {
          for (o = p; s.d[o] === a.d[o] && o--; )
            ;
          if (o == -1)
            break;
        }
        o = a, a = n, n = s, s = o, u++;
      }
      return w = true, s.d.length = p + 1, s;
    }
    function pn(e, t) {
      for (var r = e; --t; )
        r *= e;
      return r;
    }
    function Js(e, t) {
      var r, n = t.s < 0, i = ve(e, e.precision, 1), o = i.times(0.5);
      if (t = t.abs(), t.lte(o))
        return $e = n ? 4 : 1, t;
      if (r = t.divToInt(i), r.isZero())
        $e = n ? 3 : 2;
      else {
        if (t = t.minus(r.times(i)), t.lte(o))
          return $e = Ns(r) ? n ? 2 : 3 : n ? 4 : 1, t;
        $e = Ns(r) ? n ? 1 : 4 : n ? 3 : 2;
      }
      return t.minus(i).abs();
    }
    function Ui(e, t, r, n) {
      var i, o, s, a, l, u, c, p, m, g = e.constructor, h = r !== void 0;
      if (h ? (ae(r, 1, ze), n === void 0 ? n = g.rounding : ae(n, 0, 8)) : (r = g.precision, n = g.rounding), !e.isFinite())
        c = Gs(e);
      else {
        for (c = Te(e), s = c.indexOf("."), h ? (i = 2, t == 16 ? r = r * 4 - 3 : t == 8 && (r = r * 3 - 2)) : i = t, s >= 0 && (c = c.replace(".", ""), m = new g(1), m.e = c.length - s, m.d = nn(Te(m), 10, i), m.e = m.d.length), p = nn(c, 10, i), o = l = p.length; p[--l] == 0; )
          p.pop();
        if (!p[0])
          c = h ? "0p+0" : "0";
        else {
          if (s < 0 ? o-- : (e = new g(e), e.d = p, e.e = o, e = $(e, m, r, n, 0, i), p = e.d, o = e.e, u = Ms), s = p[r], a = i / 2, u = u || p[r + 1] !== void 0, u = n < 4 ? (s !== void 0 || u) && (n === 0 || n === (e.s < 0 ? 3 : 2)) : s > a || s === a && (n === 4 || u || n === 6 && p[r - 1] & 1 || n === (e.s < 0 ? 8 : 7)), p.length = r, u)
            for (; ++p[--r] > i - 1; )
              p[r] = 0, r || (++o, p.unshift(1));
          for (l = p.length; !p[l - 1]; --l)
            ;
          for (s = 0, c = ""; s < l; s++)
            c += qi.charAt(p[s]);
          if (h) {
            if (l > 1)
              if (t == 16 || t == 8) {
                for (s = t == 16 ? 4 : 3, --l; l % s; l++)
                  c += "0";
                for (p = nn(c, i, t), l = p.length; !p[l - 1]; --l)
                  ;
                for (s = 1, c = "1."; s < l; s++)
                  c += qi.charAt(p[s]);
              } else
                c = c.charAt(0) + "." + c.slice(1);
            c = c + (o < 0 ? "p" : "p+") + o;
          } else if (o < 0) {
            for (; ++o; )
              c = "0" + c;
            c = "0." + c;
          } else if (++o > l)
            for (o -= l; o--; )
              c += "0";
          else
            o < l && (c = c.slice(0, o) + "." + c.slice(o));
        }
        c = (t == 16 ? "0x" : t == 2 ? "0b" : t == 8 ? "0o" : "") + c;
      }
      return e.s < 0 ? "-" + c : c;
    }
    function Ls(e, t) {
      if (e.length > t)
        return e.length = t, true;
    }
    function zc(e) {
      return new this(e).abs();
    }
    function Zc(e) {
      return new this(e).acos();
    }
    function Xc(e) {
      return new this(e).acosh();
    }
    function ep(e, t) {
      return new this(e).plus(t);
    }
    function tp(e) {
      return new this(e).asin();
    }
    function rp(e) {
      return new this(e).asinh();
    }
    function np(e) {
      return new this(e).atan();
    }
    function ip(e) {
      return new this(e).atanh();
    }
    function op(e, t) {
      e = new this(e), t = new this(t);
      var r, n = this.precision, i = this.rounding, o = n + 4;
      return !e.s || !t.s ? r = new this(NaN) : !e.d && !t.d ? (r = ve(this, o, 1).times(t.s > 0 ? 0.25 : 0.75), r.s = e.s) : !t.d || e.isZero() ? (r = t.s < 0 ? ve(this, n, i) : new this(0), r.s = e.s) : !e.d || t.isZero() ? (r = ve(this, o, 1).times(0.5), r.s = e.s) : t.s < 0 ? (this.precision = o, this.rounding = 1, r = this.atan($(e, t, o, 1)), t = ve(this, o, 1), this.precision = n, this.rounding = i, r = e.s < 0 ? r.minus(t) : r.plus(t)) : r = this.atan($(e, t, o, 1)), r;
    }
    function sp(e) {
      return new this(e).cbrt();
    }
    function ap(e) {
      return E(e = new this(e), e.e + 1, 2);
    }
    function lp(e, t, r) {
      return new this(e).clamp(t, r);
    }
    function up(e) {
      if (!e || typeof e != "object")
        throw Error(un + "Object expected");
      var t, r, n, i = e.defaults === true, o = ["precision", 1, ze, "rounding", 0, 8, "toExpNeg", -wt, 0, "toExpPos", 0, wt, "maxE", 0, wt, "minE", -wt, 0, "modulo", 0, 9];
      for (t = 0; t < o.length; t += 3)
        if (r = o[t], i && (this[r] = Vi[r]), (n = e[r]) !== void 0)
          if (ne(n) === n && n >= o[t + 1] && n <= o[t + 2])
            this[r] = n;
          else
            throw Error(Ye + r + ": " + n);
      if (r = "crypto", i && (this[r] = Vi[r]), (n = e[r]) !== void 0)
        if (n === true || n === false || n === 0 || n === 1)
          if (n)
            if (typeof crypto < "u" && crypto && (crypto.getRandomValues || crypto.randomBytes))
              this[r] = true;
            else
              throw Error(qs);
          else
            this[r] = false;
        else
          throw Error(Ye + r + ": " + n);
      return this;
    }
    function cp(e) {
      return new this(e).cos();
    }
    function pp(e) {
      return new this(e).cosh();
    }
    function Ws(e) {
      var t, r, n;
      function i(o) {
        var s, a, l, u = this;
        if (!(u instanceof i))
          return new i(o);
        if (u.constructor = i, Fs(o)) {
          u.s = o.s, w ? !o.d || o.e > i.maxE ? (u.e = NaN, u.d = null) : o.e < i.minE ? (u.e = 0, u.d = [0]) : (u.e = o.e, u.d = o.d.slice()) : (u.e = o.e, u.d = o.d ? o.d.slice() : o.d);
          return;
        }
        if (l = typeof o, l === "number") {
          if (o === 0) {
            u.s = 1 / o < 0 ? -1 : 1, u.e = 0, u.d = [0];
            return;
          }
          if (o < 0 ? (o = -o, u.s = -1) : u.s = 1, o === ~~o && o < 1e7) {
            for (s = 0, a = o; a >= 10; a /= 10)
              s++;
            w ? s > i.maxE ? (u.e = NaN, u.d = null) : s < i.minE ? (u.e = 0, u.d = [0]) : (u.e = s, u.d = [o]) : (u.e = s, u.d = [o]);
            return;
          }
          if (o * 0 !== 0) {
            o || (u.s = NaN), u.e = NaN, u.d = null;
            return;
          }
          return on(u, o.toString());
        }
        if (l === "string")
          return (a = o.charCodeAt(0)) === 45 ? (o = o.slice(1), u.s = -1) : (a === 43 && (o = o.slice(1)), u.s = 1), js.test(o) ? on(u, o) : Kc(u, o);
        if (l === "bigint")
          return o < 0 ? (o = -o, u.s = -1) : u.s = 1, on(u, o.toString());
        throw Error(Ye + o);
      }
      if (i.prototype = f, i.ROUND_UP = 0, i.ROUND_DOWN = 1, i.ROUND_CEIL = 2, i.ROUND_FLOOR = 3, i.ROUND_HALF_UP = 4, i.ROUND_HALF_DOWN = 5, i.ROUND_HALF_EVEN = 6, i.ROUND_HALF_CEIL = 7, i.ROUND_HALF_FLOOR = 8, i.EUCLID = 9, i.config = i.set = up, i.clone = Ws, i.isDecimal = Fs, i.abs = zc, i.acos = Zc, i.acosh = Xc, i.add = ep, i.asin = tp, i.asinh = rp, i.atan = np, i.atanh = ip, i.atan2 = op, i.cbrt = sp, i.ceil = ap, i.clamp = lp, i.cos = cp, i.cosh = pp, i.div = dp, i.exp = mp, i.floor = fp, i.hypot = gp, i.ln = hp, i.log = yp, i.log10 = bp, i.log2 = Ep, i.max = wp, i.min = xp, i.mod = Pp, i.mul = vp, i.pow = Tp, i.random = Cp, i.round = Rp, i.sign = Sp, i.sin = Ap, i.sinh = Ip, i.sqrt = kp, i.sub = Op, i.sum = _p, i.tan = Dp, i.tanh = Np, i.trunc = Lp, e === void 0 && (e = {}), e && e.defaults !== true)
        for (n = ["precision", "rounding", "toExpNeg", "toExpPos", "maxE", "minE", "modulo", "crypto"], t = 0; t < n.length; )
          e.hasOwnProperty(r = n[t++]) || (e[r] = this[r]);
      return i.config(e), i;
    }
    function dp(e, t) {
      return new this(e).div(t);
    }
    function mp(e) {
      return new this(e).exp();
    }
    function fp(e) {
      return E(e = new this(e), e.e + 1, 3);
    }
    function gp() {
      var e, t, r = new this(0);
      for (w = false, e = 0; e < arguments.length; )
        if (t = new this(arguments[e++]), t.d)
          r.d && (r = r.plus(t.times(t)));
        else {
          if (t.s)
            return w = true, new this(1 / 0);
          r = t;
        }
      return w = true, r.sqrt();
    }
    function Fs(e) {
      return e instanceof st || e && e.toStringTag === Vs || false;
    }
    function hp(e) {
      return new this(e).ln();
    }
    function yp(e, t) {
      return new this(e).log(t);
    }
    function Ep(e) {
      return new this(e).log(2);
    }
    function bp(e) {
      return new this(e).log(10);
    }
    function wp() {
      return Qs(this, arguments, -1);
    }
    function xp() {
      return Qs(this, arguments, 1);
    }
    function Pp(e, t) {
      return new this(e).mod(t);
    }
    function vp(e, t) {
      return new this(e).mul(t);
    }
    function Tp(e, t) {
      return new this(e).pow(t);
    }
    function Cp(e) {
      var t, r, n, i, o = 0, s = new this(1), a = [];
      if (e === void 0 ? e = this.precision : ae(e, 1, ze), n = Math.ceil(e / b), this.crypto)
        if (crypto.getRandomValues)
          for (t = crypto.getRandomValues(new Uint32Array(n)); o < n; )
            i = t[o], i >= 429e7 ? t[o] = crypto.getRandomValues(new Uint32Array(1))[0] : a[o++] = i % 1e7;
        else if (crypto.randomBytes) {
          for (t = crypto.randomBytes(n *= 4); o < n; )
            i = t[o] + (t[o + 1] << 8) + (t[o + 2] << 16) + ((t[o + 3] & 127) << 24), i >= 214e7 ? crypto.randomBytes(4).copy(t, o) : (a.push(i % 1e7), o += 4);
          o = n / 4;
        } else
          throw Error(qs);
      else
        for (; o < n; )
          a[o++] = Math.random() * 1e7 | 0;
      for (n = a[--o], e %= b, n && e && (i = J(10, b - e), a[o] = (n / i | 0) * i); a[o] === 0; o--)
        a.pop();
      if (o < 0)
        r = 0, a = [0];
      else {
        for (r = -1; a[0] === 0; r -= b)
          a.shift();
        for (n = 1, i = a[0]; i >= 10; i /= 10)
          n++;
        n < b && (r -= b - n);
      }
      return s.e = r, s.d = a, s;
    }
    function Rp(e) {
      return E(e = new this(e), e.e + 1, this.rounding);
    }
    function Sp(e) {
      return e = new this(e), e.d ? e.d[0] ? e.s : 0 * e.s : e.s || NaN;
    }
    function Ap(e) {
      return new this(e).sin();
    }
    function Ip(e) {
      return new this(e).sinh();
    }
    function kp(e) {
      return new this(e).sqrt();
    }
    function Op(e, t) {
      return new this(e).sub(t);
    }
    function _p() {
      var e = 0, t = arguments, r = new this(t[e]);
      for (w = false; r.s && ++e < t.length; )
        r = r.plus(t[e]);
      return w = true, E(r, this.precision, this.rounding);
    }
    function Dp(e) {
      return new this(e).tan();
    }
    function Np(e) {
      return new this(e).tanh();
    }
    function Lp(e) {
      return E(e = new this(e), e.e + 1, 1);
    }
    f[Symbol.for("nodejs.util.inspect.custom")] = f.toString;
    f[Symbol.toStringTag] = "Decimal";
    var st = f.constructor = Ws(Vi);
    sn = new st(sn);
    an = new st(an);
    var Ce = st;
    function Pt(e) {
      return e === null ? e : Array.isArray(e) ? e.map(Pt) : typeof e == "object" ? Fp(e) ? Mp(e) : bt(e, Pt) : e;
    }
    function Fp(e) {
      return e !== null && typeof e == "object" && typeof e.$type == "string";
    }
    function Mp({ $type: e, value: t }) {
      switch (e) {
        case "BigInt":
          return BigInt(t);
        case "Bytes": {
          let { buffer: r, byteOffset: n, byteLength: i } = Buffer.from(t, "base64");
          return new Uint8Array(r, n, i);
        }
        case "DateTime":
          return new Date(t);
        case "Decimal":
          return new Ce(t);
        case "Json":
          return JSON.parse(t);
        default:
          Me(t, "Unknown tagged value");
      }
    }
    function vt(e) {
      return e.substring(0, 1).toLowerCase() + e.substring(1);
    }
    function Tt(e) {
      return e instanceof Date || Object.prototype.toString.call(e) === "[object Date]";
    }
    function dn(e) {
      return e.toString() !== "Invalid Date";
    }
    function Ct(e) {
      return st.isDecimal(e) ? true : e !== null && typeof e == "object" && typeof e.s == "number" && typeof e.e == "number" && typeof e.toFixed == "function" && Array.isArray(e.d);
    }
    var Xs = D(Oi());
    var Zs = D(require("fs"));
    var Hs = { keyword: Ne, entity: Ne, value: (e) => Y(it(e)), punctuation: it, directive: Ne, function: Ne, variable: (e) => Y(it(e)), string: (e) => Y(je(e)), boolean: De, number: Ne, comment: Ht };
    var $p = (e) => e;
    var mn = {};
    var qp = 0;
    var P = { manual: mn.Prism && mn.Prism.manual, disableWorkerMessageHandler: mn.Prism && mn.Prism.disableWorkerMessageHandler, util: { encode: function(e) {
      if (e instanceof Ee) {
        let t = e;
        return new Ee(t.type, P.util.encode(t.content), t.alias);
      } else
        return Array.isArray(e) ? e.map(P.util.encode) : e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\u00a0/g, " ");
    }, type: function(e) {
      return Object.prototype.toString.call(e).slice(8, -1);
    }, objId: function(e) {
      return e.__id || Object.defineProperty(e, "__id", { value: ++qp }), e.__id;
    }, clone: function e(t, r) {
      let n, i, o = P.util.type(t);
      switch (r = r || {}, o) {
        case "Object":
          if (i = P.util.objId(t), r[i])
            return r[i];
          n = {}, r[i] = n;
          for (let s in t)
            t.hasOwnProperty(s) && (n[s] = e(t[s], r));
          return n;
        case "Array":
          return i = P.util.objId(t), r[i] ? r[i] : (n = [], r[i] = n, t.forEach(function(s, a) {
            n[a] = e(s, r);
          }), n);
        default:
          return t;
      }
    } }, languages: { extend: function(e, t) {
      let r = P.util.clone(P.languages[e]);
      for (let n in t)
        r[n] = t[n];
      return r;
    }, insertBefore: function(e, t, r, n) {
      n = n || P.languages;
      let i = n[e], o = {};
      for (let a in i)
        if (i.hasOwnProperty(a)) {
          if (a == t)
            for (let l in r)
              r.hasOwnProperty(l) && (o[l] = r[l]);
          r.hasOwnProperty(a) || (o[a] = i[a]);
        }
      let s = n[e];
      return n[e] = o, P.languages.DFS(P.languages, function(a, l) {
        l === s && a != e && (this[a] = o);
      }), o;
    }, DFS: function e(t, r, n, i) {
      i = i || {};
      let o = P.util.objId;
      for (let s in t)
        if (t.hasOwnProperty(s)) {
          r.call(t, s, t[s], n || s);
          let a = t[s], l = P.util.type(a);
          l === "Object" && !i[o(a)] ? (i[o(a)] = true, e(a, r, null, i)) : l === "Array" && !i[o(a)] && (i[o(a)] = true, e(a, r, s, i));
        }
    } }, plugins: {}, highlight: function(e, t, r) {
      let n = { code: e, grammar: t, language: r };
      return P.hooks.run("before-tokenize", n), n.tokens = P.tokenize(n.code, n.grammar), P.hooks.run("after-tokenize", n), Ee.stringify(P.util.encode(n.tokens), n.language);
    }, matchGrammar: function(e, t, r, n, i, o, s) {
      for (let y in r) {
        if (!r.hasOwnProperty(y) || !r[y])
          continue;
        if (y == s)
          return;
        let O = r[y];
        O = P.util.type(O) === "Array" ? O : [O];
        for (let T = 0; T < O.length; ++T) {
          let S = O[T], R = S.inside, _ = !!S.lookbehind, I = !!S.greedy, ce = 0, Gt = S.alias;
          if (I && !S.pattern.global) {
            let Q = S.pattern.toString().match(/[imuy]*$/)[0];
            S.pattern = RegExp(S.pattern.source, Q + "g");
          }
          S = S.pattern || S;
          for (let Q = n, se = i; Q < t.length; se += t[Q].length, ++Q) {
            let Oe = t[Q];
            if (t.length > e.length)
              return;
            if (Oe instanceof Ee)
              continue;
            if (I && Q != t.length - 1) {
              S.lastIndex = se;
              var p = S.exec(e);
              if (!p)
                break;
              var c = p.index + (_ ? p[1].length : 0), m = p.index + p[0].length, a = Q, l = se;
              for (let F = t.length; a < F && (l < m || !t[a].type && !t[a - 1].greedy); ++a)
                l += t[a].length, c >= l && (++Q, se = l);
              if (t[Q] instanceof Ee)
                continue;
              u = a - Q, Oe = e.slice(se, l), p.index -= se;
            } else {
              S.lastIndex = 0;
              var p = S.exec(Oe), u = 1;
            }
            if (!p) {
              if (o)
                break;
              continue;
            }
            _ && (ce = p[1] ? p[1].length : 0);
            var c = p.index + ce, p = p[0].slice(ce), m = c + p.length, g = Oe.slice(0, c), h = Oe.slice(m);
            let Z = [Q, u];
            g && (++Q, se += g.length, Z.push(g));
            let mt = new Ee(y, R ? P.tokenize(p, R) : p, Gt, p, I);
            if (Z.push(mt), h && Z.push(h), Array.prototype.splice.apply(t, Z), u != 1 && P.matchGrammar(e, t, r, Q, se, true, y), o)
              break;
          }
        }
      }
    }, tokenize: function(e, t) {
      let r = [e], n = t.rest;
      if (n) {
        for (let i in n)
          t[i] = n[i];
        delete t.rest;
      }
      return P.matchGrammar(e, r, t, 0, 0, false), r;
    }, hooks: { all: {}, add: function(e, t) {
      let r = P.hooks.all;
      r[e] = r[e] || [], r[e].push(t);
    }, run: function(e, t) {
      let r = P.hooks.all[e];
      if (!(!r || !r.length))
        for (var n = 0, i; i = r[n++]; )
          i(t);
    } }, Token: Ee };
    P.languages.clike = { comment: [{ pattern: /(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/, lookbehind: true }, { pattern: /(^|[^\\:])\/\/.*/, lookbehind: true, greedy: true }], string: { pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/, greedy: true }, "class-name": { pattern: /((?:\b(?:class|interface|extends|implements|trait|instanceof|new)\s+)|(?:catch\s+\())[\w.\\]+/i, lookbehind: true, inside: { punctuation: /[.\\]/ } }, keyword: /\b(?:if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/, boolean: /\b(?:true|false)\b/, function: /\w+(?=\()/, number: /\b0x[\da-f]+\b|(?:\b\d+\.?\d*|\B\.\d+)(?:e[+-]?\d+)?/i, operator: /--?|\+\+?|!=?=?|<=?|>=?|==?=?|&&?|\|\|?|\?|\*|\/|~|\^|%/, punctuation: /[{}[\];(),.:]/ };
    P.languages.javascript = P.languages.extend("clike", { "class-name": [P.languages.clike["class-name"], { pattern: /(^|[^$\w\xA0-\uFFFF])[_$A-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\.(?:prototype|constructor))/, lookbehind: true }], keyword: [{ pattern: /((?:^|})\s*)(?:catch|finally)\b/, lookbehind: true }, { pattern: /(^|[^.])\b(?:as|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/, lookbehind: true }], number: /\b(?:(?:0[xX](?:[\dA-Fa-f](?:_[\dA-Fa-f])?)+|0[bB](?:[01](?:_[01])?)+|0[oO](?:[0-7](?:_[0-7])?)+)n?|(?:\d(?:_\d)?)+n|NaN|Infinity)\b|(?:\b(?:\d(?:_\d)?)+\.?(?:\d(?:_\d)?)*|\B\.(?:\d(?:_\d)?)+)(?:[Ee][+-]?(?:\d(?:_\d)?)+)?/, function: /[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/, operator: /-[-=]?|\+[+=]?|!=?=?|<<?=?|>>?>?=?|=(?:==?|>)?|&[&=]?|\|[|=]?|\*\*?=?|\/=?|~|\^=?|%=?|\?|\.{3}/ });
    P.languages.javascript["class-name"][0].pattern = /(\b(?:class|interface|extends|implements|instanceof|new)\s+)[\w.\\]+/;
    P.languages.insertBefore("javascript", "keyword", { regex: { pattern: /((?:^|[^$\w\xA0-\uFFFF."'\])\s])\s*)\/(\[(?:[^\]\\\r\n]|\\.)*]|\\.|[^/\\\[\r\n])+\/[gimyus]{0,6}(?=\s*($|[\r\n,.;})\]]))/, lookbehind: true, greedy: true }, "function-variable": { pattern: /[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*)\s*=>))/, alias: "function" }, parameter: [{ pattern: /(function(?:\s+[_$A-Za-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*)?\s*\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\))/, lookbehind: true, inside: P.languages.javascript }, { pattern: /[_$a-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*=>)/i, inside: P.languages.javascript }, { pattern: /(\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\)\s*=>)/, lookbehind: true, inside: P.languages.javascript }, { pattern: /((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:[_$A-Za-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*\s*)\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\)\s*\{)/, lookbehind: true, inside: P.languages.javascript }], constant: /\b[A-Z](?:[A-Z_]|\dx?)*\b/ });
    P.languages.markup && P.languages.markup.tag.addInlined("script", "javascript");
    P.languages.js = P.languages.javascript;
    P.languages.typescript = P.languages.extend("javascript", { keyword: /\b(?:abstract|as|async|await|break|case|catch|class|const|constructor|continue|debugger|declare|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|is|keyof|let|module|namespace|new|null|of|package|private|protected|public|readonly|return|require|set|static|super|switch|this|throw|try|type|typeof|var|void|while|with|yield)\b/, builtin: /\b(?:string|Function|any|number|boolean|Array|symbol|console|Promise|unknown|never)\b/ });
    P.languages.ts = P.languages.typescript;
    function Ee(e, t, r, n, i) {
      this.type = e, this.content = t, this.alias = r, this.length = (n || "").length | 0, this.greedy = !!i;
    }
    Ee.stringify = function(e, t) {
      return typeof e == "string" ? e : Array.isArray(e) ? e.map(function(r) {
        return Ee.stringify(r, t);
      }).join("") : Vp(e.type)(e.content);
    };
    function Vp(e) {
      return Hs[e] || $p;
    }
    function Ks(e) {
      return jp(e, P.languages.javascript);
    }
    function jp(e, t) {
      return P.tokenize(e, t).map((n) => Ee.stringify(n)).join("");
    }
    var Ys = D(Ts());
    function zs(e) {
      return (0, Ys.default)(e);
    }
    var fn = class e {
      constructor(t, r) {
        d(this, "firstLineNumber");
        d(this, "lines");
        this.firstLineNumber = t, this.lines = r;
      }
      static read(t) {
        let r;
        try {
          r = Zs.default.readFileSync(t, "utf-8");
        } catch {
          return null;
        }
        return e.fromContent(r);
      }
      static fromContent(t) {
        let r = t.split(/\r?\n/);
        return new e(1, r);
      }
      get lastLineNumber() {
        return this.firstLineNumber + this.lines.length - 1;
      }
      mapLineAt(t, r) {
        if (t < this.firstLineNumber || t > this.lines.length + this.firstLineNumber)
          return this;
        let n = t - this.firstLineNumber, i = [...this.lines];
        return i[n] = r(i[n]), new e(this.firstLineNumber, i);
      }
      mapLines(t) {
        return new e(this.firstLineNumber, this.lines.map((r, n) => t(r, this.firstLineNumber + n)));
      }
      lineAt(t) {
        return this.lines[t - this.firstLineNumber];
      }
      prependSymbolAt(t, r) {
        return this.mapLines((n, i) => i === t ? `${r} ${n}` : `  ${n}`);
      }
      slice(t, r) {
        let n = this.lines.slice(t - 1, r).join(`
`);
        return new e(t, zs(n).split(`
`));
      }
      highlight() {
        let t = Ks(this.toString());
        return new e(this.firstLineNumber, t.split(`
`));
      }
      toString() {
        return this.lines.join(`
`);
      }
    };
    var Bp = { red: fe, gray: Ht, dim: _e, bold: Y, underline: ee, highlightSource: (e) => e.highlight() };
    var Up = { red: (e) => e, gray: (e) => e, dim: (e) => e, bold: (e) => e, underline: (e) => e, highlightSource: (e) => e };
    function Qp({ message: e, originalMethod: t, isPanic: r, callArguments: n }) {
      return { functionName: `prisma.${t}()`, message: e, isPanic: r ?? false, callArguments: n };
    }
    function Gp({ callsite: e, message: t, originalMethod: r, isPanic: n, callArguments: i }, o) {
      let s = Qp({ message: t, originalMethod: r, isPanic: n, callArguments: i });
      if (!e || typeof window < "u" || process.env.NODE_ENV === "production")
        return s;
      let a = e.getLocation();
      if (!a || !a.lineNumber || !a.columnNumber)
        return s;
      let l = Math.max(1, a.lineNumber - 3), u = fn.read(a.fileName)?.slice(l, a.lineNumber), c = u?.lineAt(a.lineNumber);
      if (u && c) {
        let p = Wp(c), m = Jp(c);
        if (!m)
          return s;
        s.functionName = `${m.code})`, s.location = a, n || (u = u.mapLineAt(a.lineNumber, (h) => h.slice(0, m.openingBraceIndex))), u = o.highlightSource(u);
        let g = String(u.lastLineNumber).length;
        if (s.contextLines = u.mapLines((h, y) => o.gray(String(y).padStart(g)) + " " + h).mapLines((h) => o.dim(h)).prependSymbolAt(a.lineNumber, o.bold(o.red("\u2192"))), i) {
          let h = p + g + 1;
          h += 2, s.callArguments = (0, Xs.default)(i, h).slice(h);
        }
      }
      return s;
    }
    function Jp(e) {
      let t = Object.keys(tr.ModelAction).join("|"), n = new RegExp(String.raw`\.(${t})\(`).exec(e);
      if (n) {
        let i = n.index + n[0].length, o = e.lastIndexOf(" ", n.index) + 1;
        return { code: e.slice(o, i), openingBraceIndex: i };
      }
      return null;
    }
    function Wp(e) {
      let t = 0;
      for (let r = 0; r < e.length; r++) {
        if (e.charAt(r) !== " ")
          return t;
        t++;
      }
      return t;
    }
    function Hp({ functionName: e, location: t, message: r, isPanic: n, contextLines: i, callArguments: o }, s) {
      let a = [""], l = t ? " in" : ":";
      if (n ? (a.push(s.red(`Oops, an unknown error occurred! This is ${s.bold("on us")}, you did nothing wrong.`)), a.push(s.red(`It occurred in the ${s.bold(`\`${e}\``)} invocation${l}`))) : a.push(s.red(`Invalid ${s.bold(`\`${e}\``)} invocation${l}`)), t && a.push(s.underline(Kp(t))), i) {
        a.push("");
        let u = [i.toString()];
        o && (u.push(o), u.push(s.dim(")"))), a.push(u.join("")), o && a.push("");
      } else
        a.push(""), o && a.push(o), a.push("");
      return a.push(r), a.join(`
`);
    }
    function Kp(e) {
      let t = [e.fileName];
      return e.lineNumber && t.push(String(e.lineNumber)), e.columnNumber && t.push(String(e.columnNumber)), t.join(":");
    }
    function gn(e) {
      let t = e.showColors ? Bp : Up, r;
      return r = Gp(e, t), Hp(r, t);
    }
    var sa = D(Qi());
    function na(e, t, r) {
      let n = ia(e), i = Yp(n), o = Zp(i);
      o ? hn(o, t, r) : t.addErrorMessage(() => "Unknown error");
    }
    function ia(e) {
      return e.errors.flatMap((t) => t.kind === "Union" ? ia(t) : [t]);
    }
    function Yp(e) {
      let t = /* @__PURE__ */ new Map(), r = [];
      for (let n of e) {
        if (n.kind !== "InvalidArgumentType") {
          r.push(n);
          continue;
        }
        let i = `${n.selectionPath.join(".")}:${n.argumentPath.join(".")}`, o = t.get(i);
        o ? t.set(i, { ...n, argument: { ...n.argument, typeNames: zp(o.argument.typeNames, n.argument.typeNames) } }) : t.set(i, n);
      }
      return r.push(...t.values()), r;
    }
    function zp(e, t) {
      return [...new Set(e.concat(t))];
    }
    function Zp(e) {
      return $i(e, (t, r) => {
        let n = ta(t), i = ta(r);
        return n !== i ? n - i : ra(t) - ra(r);
      });
    }
    function ta(e) {
      let t = 0;
      return Array.isArray(e.selectionPath) && (t += e.selectionPath.length), Array.isArray(e.argumentPath) && (t += e.argumentPath.length), t;
    }
    function ra(e) {
      switch (e.kind) {
        case "InvalidArgumentValue":
        case "ValueTooLarge":
          return 20;
        case "InvalidArgumentType":
          return 10;
        case "RequiredArgumentMissing":
          return -10;
        default:
          return 0;
      }
    }
    var de = class {
      constructor(t, r) {
        this.name = t;
        this.value = r;
        d(this, "isRequired", false);
      }
      makeRequired() {
        return this.isRequired = true, this;
      }
      write(t) {
        let { colors: { green: r } } = t.context;
        t.addMarginSymbol(r(this.isRequired ? "+" : "?")), t.write(r(this.name)), this.isRequired || t.write(r("?")), t.write(r(": ")), typeof this.value == "string" ? t.write(r(this.value)) : t.write(this.value);
      }
    };
    var Rt = class {
      constructor(t = 0, r) {
        this.context = r;
        d(this, "lines", []);
        d(this, "currentLine", "");
        d(this, "currentIndent", 0);
        d(this, "marginSymbol");
        d(this, "afterNextNewLineCallback");
        this.currentIndent = t;
      }
      write(t) {
        return typeof t == "string" ? this.currentLine += t : t.write(this), this;
      }
      writeJoined(t, r, n = (i, o) => o.write(i)) {
        let i = r.length - 1;
        for (let o = 0; o < r.length; o++)
          n(r[o], this), o !== i && this.write(t);
        return this;
      }
      writeLine(t) {
        return this.write(t).newLine();
      }
      newLine() {
        this.lines.push(this.indentedCurrentLine()), this.currentLine = "", this.marginSymbol = void 0;
        let t = this.afterNextNewLineCallback;
        return this.afterNextNewLineCallback = void 0, t?.(), this;
      }
      withIndent(t) {
        return this.indent(), t(this), this.unindent(), this;
      }
      afterNextNewline(t) {
        return this.afterNextNewLineCallback = t, this;
      }
      indent() {
        return this.currentIndent++, this;
      }
      unindent() {
        return this.currentIndent > 0 && this.currentIndent--, this;
      }
      addMarginSymbol(t) {
        return this.marginSymbol = t, this;
      }
      toString() {
        return this.lines.concat(this.indentedCurrentLine()).join(`
`);
      }
      getCurrentLineLength() {
        return this.currentLine.length;
      }
      indentedCurrentLine() {
        let t = this.currentLine.padStart(this.currentLine.length + 2 * this.currentIndent);
        return this.marginSymbol ? this.marginSymbol + t.slice(1) : t;
      }
    };
    var yn = class {
      constructor(t) {
        this.value = t;
      }
      write(t) {
        t.write(this.value);
      }
      markAsError() {
        this.value.markAsError();
      }
    };
    var En = (e) => e;
    var bn = { bold: En, red: En, green: En, dim: En, enabled: false };
    var oa = { bold: Y, red: fe, green: je, dim: _e, enabled: true };
    var St = { write(e) {
      e.writeLine(",");
    } };
    var Re = class {
      constructor(t) {
        this.contents = t;
        d(this, "isUnderlined", false);
        d(this, "color", (t2) => t2);
      }
      underline() {
        return this.isUnderlined = true, this;
      }
      setColor(t) {
        return this.color = t, this;
      }
      write(t) {
        let r = t.getCurrentLineLength();
        t.write(this.color(this.contents)), this.isUnderlined && t.afterNextNewline(() => {
          t.write(" ".repeat(r)).writeLine(this.color("~".repeat(this.contents.length)));
        });
      }
    };
    var Ze = class {
      constructor() {
        d(this, "hasError", false);
      }
      markAsError() {
        return this.hasError = true, this;
      }
    };
    var At = class extends Ze {
      constructor() {
        super(...arguments);
        d(this, "items", []);
      }
      addItem(r) {
        return this.items.push(new yn(r)), this;
      }
      getField(r) {
        return this.items[r];
      }
      getPrintWidth() {
        return this.items.length === 0 ? 2 : Math.max(...this.items.map((n) => n.value.getPrintWidth())) + 2;
      }
      write(r) {
        if (this.items.length === 0) {
          this.writeEmpty(r);
          return;
        }
        this.writeWithItems(r);
      }
      writeEmpty(r) {
        let n = new Re("[]");
        this.hasError && n.setColor(r.context.colors.red).underline(), r.write(n);
      }
      writeWithItems(r) {
        let { colors: n } = r.context;
        r.writeLine("[").withIndent(() => r.writeJoined(St, this.items).newLine()).write("]"), this.hasError && r.afterNextNewline(() => {
          r.writeLine(n.red("~".repeat(this.getPrintWidth())));
        });
      }
      asObject() {
      }
    };
    var It = class e extends Ze {
      constructor() {
        super(...arguments);
        d(this, "fields", {});
        d(this, "suggestions", []);
      }
      addField(r) {
        this.fields[r.name] = r;
      }
      addSuggestion(r) {
        this.suggestions.push(r);
      }
      getField(r) {
        return this.fields[r];
      }
      getDeepField(r) {
        let [n, ...i] = r, o = this.getField(n);
        if (!o)
          return;
        let s = o;
        for (let a of i) {
          let l;
          if (s.value instanceof e ? l = s.value.getField(a) : s.value instanceof At && (l = s.value.getField(Number(a))), !l)
            return;
          s = l;
        }
        return s;
      }
      getDeepFieldValue(r) {
        return r.length === 0 ? this : this.getDeepField(r)?.value;
      }
      hasField(r) {
        return !!this.getField(r);
      }
      removeAllFields() {
        this.fields = {};
      }
      removeField(r) {
        delete this.fields[r];
      }
      getFields() {
        return this.fields;
      }
      isEmpty() {
        return Object.keys(this.fields).length === 0;
      }
      getFieldValue(r) {
        return this.getField(r)?.value;
      }
      getDeepSubSelectionValue(r) {
        let n = this;
        for (let i of r) {
          if (!(n instanceof e))
            return;
          let o = n.getSubSelectionValue(i);
          if (!o)
            return;
          n = o;
        }
        return n;
      }
      getDeepSelectionParent(r) {
        let n = this.getSelectionParent();
        if (!n)
          return;
        let i = n;
        for (let o of r) {
          let s = i.value.getFieldValue(o);
          if (!s || !(s instanceof e))
            return;
          let a = s.getSelectionParent();
          if (!a)
            return;
          i = a;
        }
        return i;
      }
      getSelectionParent() {
        let r = this.getField("select")?.value.asObject();
        if (r)
          return { kind: "select", value: r };
        let n = this.getField("include")?.value.asObject();
        if (n)
          return { kind: "include", value: n };
      }
      getSubSelectionValue(r) {
        return this.getSelectionParent()?.value.fields[r].value;
      }
      getPrintWidth() {
        let r = Object.values(this.fields);
        return r.length == 0 ? 2 : Math.max(...r.map((i) => i.getPrintWidth())) + 2;
      }
      write(r) {
        let n = Object.values(this.fields);
        if (n.length === 0 && this.suggestions.length === 0) {
          this.writeEmpty(r);
          return;
        }
        this.writeWithContents(r, n);
      }
      asObject() {
        return this;
      }
      writeEmpty(r) {
        let n = new Re("{}");
        this.hasError && n.setColor(r.context.colors.red).underline(), r.write(n);
      }
      writeWithContents(r, n) {
        r.writeLine("{").withIndent(() => {
          r.writeJoined(St, [...n, ...this.suggestions]).newLine();
        }), r.write("}"), this.hasError && r.afterNextNewline(() => {
          r.writeLine(r.context.colors.red("~".repeat(this.getPrintWidth())));
        });
      }
    };
    var H = class extends Ze {
      constructor(r) {
        super();
        this.text = r;
      }
      getPrintWidth() {
        return this.text.length;
      }
      write(r) {
        let n = new Re(this.text);
        this.hasError && n.underline().setColor(r.context.colors.red), r.write(n);
      }
      asObject() {
      }
    };
    var ar = class {
      constructor() {
        d(this, "fields", []);
      }
      addField(t, r) {
        return this.fields.push({ write(n) {
          let { green: i, dim: o } = n.context.colors;
          n.write(i(o(`${t}: ${r}`))).addMarginSymbol(i(o("+")));
        } }), this;
      }
      write(t) {
        let { colors: { green: r } } = t.context;
        t.writeLine(r("{")).withIndent(() => {
          t.writeJoined(St, this.fields).newLine();
        }).write(r("}")).addMarginSymbol(r("+"));
      }
    };
    function hn(e, t, r) {
      switch (e.kind) {
        case "MutuallyExclusiveFields":
          ed(e, t);
          break;
        case "IncludeOnScalar":
          td(e, t);
          break;
        case "EmptySelection":
          rd(e, t, r);
          break;
        case "UnknownSelectionField":
          sd(e, t);
          break;
        case "InvalidSelectionValue":
          ad(e, t);
          break;
        case "UnknownArgument":
          ld(e, t);
          break;
        case "UnknownInputField":
          ud(e, t);
          break;
        case "RequiredArgumentMissing":
          cd(e, t);
          break;
        case "InvalidArgumentType":
          pd(e, t);
          break;
        case "InvalidArgumentValue":
          dd(e, t);
          break;
        case "ValueTooLarge":
          md(e, t);
          break;
        case "SomeFieldsMissing":
          fd(e, t);
          break;
        case "TooManyFieldsGiven":
          gd(e, t);
          break;
        case "Union":
          na(e, t, r);
          break;
        default:
          throw new Error("not implemented: " + e.kind);
      }
    }
    function ed(e, t) {
      let r = t.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject();
      r && (r.getField(e.firstField)?.markAsError(), r.getField(e.secondField)?.markAsError()), t.addErrorMessage((n) => `Please ${n.bold("either")} use ${n.green(`\`${e.firstField}\``)} or ${n.green(`\`${e.secondField}\``)}, but ${n.red("not both")} at the same time.`);
    }
    function td(e, t) {
      let [r, n] = lr(e.selectionPath), i = e.outputType, o = t.arguments.getDeepSelectionParent(r)?.value;
      if (o && (o.getField(n)?.markAsError(), i))
        for (let s of i.fields)
          s.isRelation && o.addSuggestion(new de(s.name, "true"));
      t.addErrorMessage((s) => {
        let a = `Invalid scalar field ${s.red(`\`${n}\``)} for ${s.bold("include")} statement`;
        return i ? a += ` on model ${s.bold(i.name)}. ${ur(s)}` : a += ".", a += `
Note that ${s.bold("include")} statements only accept relation fields.`, a;
      });
    }
    function rd(e, t, r) {
      let n = t.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject();
      if (n) {
        let i = n.getField("omit")?.value.asObject();
        if (i) {
          nd(e, t, i);
          return;
        }
        if (n.hasField("select")) {
          id(e, t);
          return;
        }
      }
      if (r?.[vt(e.outputType.name)]) {
        od(e, t);
        return;
      }
      t.addErrorMessage(() => `Unknown field at "${e.selectionPath.join(".")} selection"`);
    }
    function nd(e, t, r) {
      r.removeAllFields();
      for (let n of e.outputType.fields)
        r.addSuggestion(new de(n.name, "false"));
      t.addErrorMessage((n) => `The ${n.red("omit")} statement includes every field of the model ${n.bold(e.outputType.name)}. At least one field must be included in the result`);
    }
    function id(e, t) {
      let r = e.outputType, n = t.arguments.getDeepSelectionParent(e.selectionPath)?.value, i = n?.isEmpty() ?? false;
      n && (n.removeAllFields(), ua(n, r)), t.addErrorMessage((o) => i ? `The ${o.red("`select`")} statement for type ${o.bold(r.name)} must not be empty. ${ur(o)}` : `The ${o.red("`select`")} statement for type ${o.bold(r.name)} needs ${o.bold("at least one truthy value")}.`);
    }
    function od(e, t) {
      let r = new ar();
      for (let i of e.outputType.fields)
        i.isRelation || r.addField(i.name, "false");
      let n = new de("omit", r).makeRequired();
      if (e.selectionPath.length === 0)
        t.arguments.addSuggestion(n);
      else {
        let [i, o] = lr(e.selectionPath), a = t.arguments.getDeepSelectionParent(i)?.value.asObject()?.getField(o);
        if (a) {
          let l = a?.value.asObject() ?? new It();
          l.addSuggestion(n), a.value = l;
        }
      }
      t.addErrorMessage((i) => `The global ${i.red("omit")} configuration excludes every field of the model ${i.bold(e.outputType.name)}. At least one field must be included in the result`);
    }
    function sd(e, t) {
      let r = ca(e.selectionPath, t);
      if (r.parentKind !== "unknown") {
        r.field.markAsError();
        let n = r.parent;
        switch (r.parentKind) {
          case "select":
            ua(n, e.outputType);
            break;
          case "include":
            hd(n, e.outputType);
            break;
          case "omit":
            yd(n, e.outputType);
            break;
        }
      }
      t.addErrorMessage((n) => {
        let i = [`Unknown field ${n.red(`\`${r.fieldName}\``)}`];
        return r.parentKind !== "unknown" && i.push(`for ${n.bold(r.parentKind)} statement`), i.push(`on model ${n.bold(`\`${e.outputType.name}\``)}.`), i.push(ur(n)), i.join(" ");
      });
    }
    function ad(e, t) {
      let r = ca(e.selectionPath, t);
      r.parentKind !== "unknown" && r.field.value.markAsError(), t.addErrorMessage((n) => `Invalid value for selection field \`${n.red(r.fieldName)}\`: ${e.underlyingError}`);
    }
    function ld(e, t) {
      let r = e.argumentPath[0], n = t.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject();
      n && (n.getField(r)?.markAsError(), Ed(n, e.arguments)), t.addErrorMessage((i) => aa(i, r, e.arguments.map((o) => o.name)));
    }
    function ud(e, t) {
      let [r, n] = lr(e.argumentPath), i = t.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject();
      if (i) {
        i.getDeepField(e.argumentPath)?.markAsError();
        let o = i.getDeepFieldValue(r)?.asObject();
        o && pa(o, e.inputType);
      }
      t.addErrorMessage((o) => aa(o, n, e.inputType.fields.map((s) => s.name)));
    }
    function aa(e, t, r) {
      let n = [`Unknown argument \`${e.red(t)}\`.`], i = wd(t, r);
      return i && n.push(`Did you mean \`${e.green(i)}\`?`), r.length > 0 && n.push(ur(e)), n.join(" ");
    }
    function cd(e, t) {
      let r;
      t.addErrorMessage((l) => r?.value instanceof H && r.value.text === "null" ? `Argument \`${l.green(o)}\` must not be ${l.red("null")}.` : `Argument \`${l.green(o)}\` is missing.`);
      let n = t.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject();
      if (!n)
        return;
      let [i, o] = lr(e.argumentPath), s = new ar(), a = n.getDeepFieldValue(i)?.asObject();
      if (a)
        if (r = a.getField(o), r && a.removeField(o), e.inputTypes.length === 1 && e.inputTypes[0].kind === "object") {
          for (let l of e.inputTypes[0].fields)
            s.addField(l.name, l.typeNames.join(" | "));
          a.addSuggestion(new de(o, s).makeRequired());
        } else {
          let l = e.inputTypes.map(la).join(" | ");
          a.addSuggestion(new de(o, l).makeRequired());
        }
    }
    function la(e) {
      return e.kind === "list" ? `${la(e.elementType)}[]` : e.name;
    }
    function pd(e, t) {
      let r = e.argument.name, n = t.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject();
      n && n.getDeepFieldValue(e.argumentPath)?.markAsError(), t.addErrorMessage((i) => {
        let o = wn("or", e.argument.typeNames.map((s) => i.green(s)));
        return `Argument \`${i.bold(r)}\`: Invalid value provided. Expected ${o}, provided ${i.red(e.inferredType)}.`;
      });
    }
    function dd(e, t) {
      let r = e.argument.name, n = t.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject();
      n && n.getDeepFieldValue(e.argumentPath)?.markAsError(), t.addErrorMessage((i) => {
        let o = [`Invalid value for argument \`${i.bold(r)}\``];
        if (e.underlyingError && o.push(`: ${e.underlyingError}`), o.push("."), e.argument.typeNames.length > 0) {
          let s = wn("or", e.argument.typeNames.map((a) => i.green(a)));
          o.push(` Expected ${s}.`);
        }
        return o.join("");
      });
    }
    function md(e, t) {
      let r = e.argument.name, n = t.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject(), i;
      if (n) {
        let s = n.getDeepField(e.argumentPath)?.value;
        s?.markAsError(), s instanceof H && (i = s.text);
      }
      t.addErrorMessage((o) => {
        let s = ["Unable to fit value"];
        return i && s.push(o.red(i)), s.push(`into a 64-bit signed integer for field \`${o.bold(r)}\``), s.join(" ");
      });
    }
    function fd(e, t) {
      let r = e.argumentPath[e.argumentPath.length - 1], n = t.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject();
      if (n) {
        let i = n.getDeepFieldValue(e.argumentPath)?.asObject();
        i && pa(i, e.inputType);
      }
      t.addErrorMessage((i) => {
        let o = [`Argument \`${i.bold(r)}\` of type ${i.bold(e.inputType.name)} needs`];
        return e.constraints.minFieldCount === 1 ? e.constraints.requiredFields ? o.push(`${i.green("at least one of")} ${wn("or", e.constraints.requiredFields.map((s) => `\`${i.bold(s)}\``))} arguments.`) : o.push(`${i.green("at least one")} argument.`) : o.push(`${i.green(`at least ${e.constraints.minFieldCount}`)} arguments.`), o.push(ur(i)), o.join(" ");
      });
    }
    function gd(e, t) {
      let r = e.argumentPath[e.argumentPath.length - 1], n = t.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject(), i = [];
      if (n) {
        let o = n.getDeepFieldValue(e.argumentPath)?.asObject();
        o && (o.markAsError(), i = Object.keys(o.getFields()));
      }
      t.addErrorMessage((o) => {
        let s = [`Argument \`${o.bold(r)}\` of type ${o.bold(e.inputType.name)} needs`];
        return e.constraints.minFieldCount === 1 && e.constraints.maxFieldCount == 1 ? s.push(`${o.green("exactly one")} argument,`) : e.constraints.maxFieldCount == 1 ? s.push(`${o.green("at most one")} argument,`) : s.push(`${o.green(`at most ${e.constraints.maxFieldCount}`)} arguments,`), s.push(`but you provided ${wn("and", i.map((a) => o.red(a)))}. Please choose`), e.constraints.maxFieldCount === 1 ? s.push("one.") : s.push(`${e.constraints.maxFieldCount}.`), s.join(" ");
      });
    }
    function ua(e, t) {
      for (let r of t.fields)
        e.hasField(r.name) || e.addSuggestion(new de(r.name, "true"));
    }
    function hd(e, t) {
      for (let r of t.fields)
        r.isRelation && !e.hasField(r.name) && e.addSuggestion(new de(r.name, "true"));
    }
    function yd(e, t) {
      for (let r of t.fields)
        !e.hasField(r.name) && !r.isRelation && e.addSuggestion(new de(r.name, "true"));
    }
    function Ed(e, t) {
      for (let r of t)
        e.hasField(r.name) || e.addSuggestion(new de(r.name, r.typeNames.join(" | ")));
    }
    function ca(e, t) {
      let [r, n] = lr(e), i = t.arguments.getDeepSubSelectionValue(r)?.asObject();
      if (!i)
        return { parentKind: "unknown", fieldName: n };
      let o = i.getFieldValue("select")?.asObject(), s = i.getFieldValue("include")?.asObject(), a = i.getFieldValue("omit")?.asObject(), l = o?.getField(n);
      return o && l ? { parentKind: "select", parent: o, field: l, fieldName: n } : (l = s?.getField(n), s && l ? { parentKind: "include", field: l, parent: s, fieldName: n } : (l = a?.getField(n), a && l ? { parentKind: "omit", field: l, parent: a, fieldName: n } : { parentKind: "unknown", fieldName: n }));
    }
    function pa(e, t) {
      if (t.kind === "object")
        for (let r of t.fields)
          e.hasField(r.name) || e.addSuggestion(new de(r.name, r.typeNames.join(" | ")));
    }
    function lr(e) {
      let t = [...e], r = t.pop();
      if (!r)
        throw new Error("unexpected empty path");
      return [t, r];
    }
    function ur({ green: e, enabled: t }) {
      return "Available options are " + (t ? `listed in ${e("green")}` : "marked with ?") + ".";
    }
    function wn(e, t) {
      if (t.length === 1)
        return t[0];
      let r = [...t], n = r.pop();
      return `${r.join(", ")} ${e} ${n}`;
    }
    var bd = 3;
    function wd(e, t) {
      let r = 1 / 0, n;
      for (let i of t) {
        let o = (0, sa.default)(e, i);
        o > bd || o < r && (r = o, n = i);
      }
      return n;
    }
    function da(e) {
      return e.substring(0, 1).toLowerCase() + e.substring(1);
    }
    var cr = class {
      constructor(t, r, n, i, o) {
        d(this, "modelName");
        d(this, "name");
        d(this, "typeName");
        d(this, "isList");
        d(this, "isEnum");
        this.modelName = t, this.name = r, this.typeName = n, this.isList = i, this.isEnum = o;
      }
      _toGraphQLInputType() {
        let t = this.isList ? "List" : "", r = this.isEnum ? "Enum" : "";
        return `${t}${r}${this.typeName}FieldRefInput<${this.modelName}>`;
      }
    };
    function kt(e) {
      return e instanceof cr;
    }
    var xn = Symbol();
    var Gi = /* @__PURE__ */ new WeakMap();
    var qe = class {
      constructor(t) {
        t === xn ? Gi.set(this, `Prisma.${this._getName()}`) : Gi.set(this, `new Prisma.${this._getNamespace()}.${this._getName()}()`);
      }
      _getName() {
        return this.constructor.name;
      }
      toString() {
        return Gi.get(this);
      }
    };
    var pr = class extends qe {
      _getNamespace() {
        return "NullTypes";
      }
    };
    var dr = class extends pr {
    };
    Ji(dr, "DbNull");
    var mr = class extends pr {
    };
    Ji(mr, "JsonNull");
    var fr = class extends pr {
    };
    Ji(fr, "AnyNull");
    var Pn = { classes: { DbNull: dr, JsonNull: mr, AnyNull: fr }, instances: { DbNull: new dr(xn), JsonNull: new mr(xn), AnyNull: new fr(xn) } };
    function Ji(e, t) {
      Object.defineProperty(e, "name", { value: t, configurable: true });
    }
    var ma = ": ";
    var vn = class {
      constructor(t, r) {
        this.name = t;
        this.value = r;
        d(this, "hasError", false);
      }
      markAsError() {
        this.hasError = true;
      }
      getPrintWidth() {
        return this.name.length + this.value.getPrintWidth() + ma.length;
      }
      write(t) {
        let r = new Re(this.name);
        this.hasError && r.underline().setColor(t.context.colors.red), t.write(r).write(ma).write(this.value);
      }
    };
    var Wi = class {
      constructor(t) {
        d(this, "arguments");
        d(this, "errorMessages", []);
        this.arguments = t;
      }
      write(t) {
        t.write(this.arguments);
      }
      addErrorMessage(t) {
        this.errorMessages.push(t);
      }
      renderAllMessages(t) {
        return this.errorMessages.map((r) => r(t)).join(`
`);
      }
    };
    function Ot(e) {
      return new Wi(fa(e));
    }
    function fa(e) {
      let t = new It();
      for (let [r, n] of Object.entries(e)) {
        let i = new vn(r, ga(n));
        t.addField(i);
      }
      return t;
    }
    function ga(e) {
      if (typeof e == "string")
        return new H(JSON.stringify(e));
      if (typeof e == "number" || typeof e == "boolean")
        return new H(String(e));
      if (typeof e == "bigint")
        return new H(`${e}n`);
      if (e === null)
        return new H("null");
      if (e === void 0)
        return new H("undefined");
      if (Ct(e))
        return new H(`new Prisma.Decimal("${e.toFixed()}")`);
      if (e instanceof Uint8Array)
        return Buffer.isBuffer(e) ? new H(`Buffer.alloc(${e.byteLength})`) : new H(`new Uint8Array(${e.byteLength})`);
      if (e instanceof Date) {
        let t = dn(e) ? e.toISOString() : "Invalid Date";
        return new H(`new Date("${t}")`);
      }
      return e instanceof qe ? new H(`Prisma.${e._getName()}`) : kt(e) ? new H(`prisma.${da(e.modelName)}.$fields.${e.name}`) : Array.isArray(e) ? xd(e) : typeof e == "object" ? fa(e) : new H(Object.prototype.toString.call(e));
    }
    function xd(e) {
      let t = new At();
      for (let r of e)
        t.addItem(ga(r));
      return t;
    }
    function Tn(e, t) {
      let r = t === "pretty" ? oa : bn, n = e.renderAllMessages(r), i = new Rt(0, { colors: r }).write(e).toString();
      return { message: n, args: i };
    }
    function Cn({ args: e, errors: t, errorFormat: r, callsite: n, originalMethod: i, clientVersion: o, globalOmit: s }) {
      let a = Ot(e);
      for (let p of t)
        hn(p, a, s);
      let { message: l, args: u } = Tn(a, r), c = gn({ message: l, callsite: n, originalMethod: i, showColors: r === "pretty", callArguments: u });
      throw new re(c, { clientVersion: o });
    }
    var Se = class {
      constructor() {
        d(this, "_map", /* @__PURE__ */ new Map());
      }
      get(t) {
        return this._map.get(t)?.value;
      }
      set(t, r) {
        this._map.set(t, { value: r });
      }
      getOrCreate(t, r) {
        let n = this._map.get(t);
        if (n)
          return n.value;
        let i = r();
        return this.set(t, i), i;
      }
    };
    function gr(e) {
      let t;
      return { get() {
        return t || (t = { value: e() }), t.value;
      } };
    }
    function Ae(e) {
      return e.replace(/^./, (t) => t.toLowerCase());
    }
    function ya(e, t, r) {
      let n = Ae(r);
      return !t.result || !(t.result.$allModels || t.result[n]) ? e : Pd({ ...e, ...ha(t.name, e, t.result.$allModels), ...ha(t.name, e, t.result[n]) });
    }
    function Pd(e) {
      let t = new Se(), r = (n, i) => t.getOrCreate(n, () => i.has(n) ? [n] : (i.add(n), e[n] ? e[n].needs.flatMap((o) => r(o, i)) : [n]));
      return bt(e, (n) => ({ ...n, needs: r(n.name, /* @__PURE__ */ new Set()) }));
    }
    function ha(e, t, r) {
      return r ? bt(r, ({ needs: n, compute: i }, o) => ({ name: o, needs: n ? Object.keys(n).filter((s) => n[s]) : [], compute: vd(t, o, i) })) : {};
    }
    function vd(e, t, r) {
      let n = e?.[t]?.compute;
      return n ? (i) => r({ ...i, [t]: n(i) }) : r;
    }
    function Ea(e, t) {
      if (!t)
        return e;
      let r = { ...e };
      for (let n of Object.values(t))
        if (e[n.name])
          for (let i of n.needs)
            r[i] = true;
      return r;
    }
    function ba(e, t) {
      if (!t)
        return e;
      let r = { ...e };
      for (let n of Object.values(t))
        if (!e[n.name])
          for (let i of n.needs)
            delete r[i];
      return r;
    }
    var Rn = class {
      constructor(t, r) {
        this.extension = t;
        this.previous = r;
        d(this, "computedFieldsCache", new Se());
        d(this, "modelExtensionsCache", new Se());
        d(this, "queryCallbacksCache", new Se());
        d(this, "clientExtensions", gr(() => this.extension.client ? { ...this.previous?.getAllClientExtensions(), ...this.extension.client } : this.previous?.getAllClientExtensions()));
        d(this, "batchCallbacks", gr(() => {
          let t2 = this.previous?.getAllBatchQueryCallbacks() ?? [], r2 = this.extension.query?.$__internalBatch;
          return r2 ? t2.concat(r2) : t2;
        }));
      }
      getAllComputedFields(t) {
        return this.computedFieldsCache.getOrCreate(t, () => ya(this.previous?.getAllComputedFields(t), this.extension, t));
      }
      getAllClientExtensions() {
        return this.clientExtensions.get();
      }
      getAllModelExtensions(t) {
        return this.modelExtensionsCache.getOrCreate(t, () => {
          let r = Ae(t);
          return !this.extension.model || !(this.extension.model[r] || this.extension.model.$allModels) ? this.previous?.getAllModelExtensions(t) : { ...this.previous?.getAllModelExtensions(t), ...this.extension.model.$allModels, ...this.extension.model[r] };
        });
      }
      getAllQueryCallbacks(t, r) {
        return this.queryCallbacksCache.getOrCreate(`${t}:${r}`, () => {
          let n = this.previous?.getAllQueryCallbacks(t, r) ?? [], i = [], o = this.extension.query;
          return !o || !(o[t] || o.$allModels || o[r] || o.$allOperations) ? n : (o[t] !== void 0 && (o[t][r] !== void 0 && i.push(o[t][r]), o[t].$allOperations !== void 0 && i.push(o[t].$allOperations)), t !== "$none" && o.$allModels !== void 0 && (o.$allModels[r] !== void 0 && i.push(o.$allModels[r]), o.$allModels.$allOperations !== void 0 && i.push(o.$allModels.$allOperations)), o[r] !== void 0 && i.push(o[r]), o.$allOperations !== void 0 && i.push(o.$allOperations), n.concat(i));
        });
      }
      getAllBatchQueryCallbacks() {
        return this.batchCallbacks.get();
      }
    };
    var _t = class e {
      constructor(t) {
        this.head = t;
      }
      static empty() {
        return new e();
      }
      static single(t) {
        return new e(new Rn(t));
      }
      isEmpty() {
        return this.head === void 0;
      }
      append(t) {
        return new e(new Rn(t, this.head));
      }
      getAllComputedFields(t) {
        return this.head?.getAllComputedFields(t);
      }
      getAllClientExtensions() {
        return this.head?.getAllClientExtensions();
      }
      getAllModelExtensions(t) {
        return this.head?.getAllModelExtensions(t);
      }
      getAllQueryCallbacks(t, r) {
        return this.head?.getAllQueryCallbacks(t, r) ?? [];
      }
      getAllBatchQueryCallbacks() {
        return this.head?.getAllBatchQueryCallbacks() ?? [];
      }
    };
    var Sn = class {
      constructor(t) {
        this.name = t;
      }
    };
    function wa(e) {
      return e instanceof Sn;
    }
    function xa(e) {
      return new Sn(e);
    }
    var Pa = Symbol();
    var hr = class {
      constructor(t) {
        if (t !== Pa)
          throw new Error("Skip instance can not be constructed directly");
      }
      ifUndefined(t) {
        return t === void 0 ? An : t;
      }
    };
    var An = new hr(Pa);
    function Ie(e) {
      return e instanceof hr;
    }
    var Td = { findUnique: "findUnique", findUniqueOrThrow: "findUniqueOrThrow", findFirst: "findFirst", findFirstOrThrow: "findFirstOrThrow", findMany: "findMany", count: "aggregate", create: "createOne", createMany: "createMany", createManyAndReturn: "createManyAndReturn", update: "updateOne", updateMany: "updateMany", updateManyAndReturn: "updateManyAndReturn", upsert: "upsertOne", delete: "deleteOne", deleteMany: "deleteMany", executeRaw: "executeRaw", queryRaw: "queryRaw", aggregate: "aggregate", groupBy: "groupBy", runCommandRaw: "runCommandRaw", findRaw: "findRaw", aggregateRaw: "aggregateRaw" };
    var va = "explicitly `undefined` values are not allowed";
    function In({ modelName: e, action: t, args: r, runtimeDataModel: n, extensions: i = _t.empty(), callsite: o, clientMethod: s, errorFormat: a, clientVersion: l, previewFeatures: u, globalOmit: c }) {
      let p = new Hi({ runtimeDataModel: n, modelName: e, action: t, rootArgs: r, callsite: o, extensions: i, selectionPath: [], argumentPath: [], originalMethod: s, errorFormat: a, clientVersion: l, previewFeatures: u, globalOmit: c });
      return { modelName: e, action: Td[t], query: yr(r, p) };
    }
    function yr({ select: e, include: t, ...r } = {}, n) {
      let i = r.omit;
      return delete r.omit, { arguments: Ca(r, n), selection: Cd(e, t, i, n) };
    }
    function Cd(e, t, r, n) {
      return e ? (t ? n.throwValidationError({ kind: "MutuallyExclusiveFields", firstField: "include", secondField: "select", selectionPath: n.getSelectionPath() }) : r && n.throwValidationError({ kind: "MutuallyExclusiveFields", firstField: "omit", secondField: "select", selectionPath: n.getSelectionPath() }), Id(e, n)) : Rd(n, t, r);
    }
    function Rd(e, t, r) {
      let n = {};
      return e.modelOrType && !e.isRawAction() && (n.$composites = true, n.$scalars = true), t && Sd(n, t, e), Ad(n, r, e), n;
    }
    function Sd(e, t, r) {
      for (let [n, i] of Object.entries(t)) {
        if (Ie(i))
          continue;
        let o = r.nestSelection(n);
        if (Ki(i, o), i === false || i === void 0) {
          e[n] = false;
          continue;
        }
        let s = r.findField(n);
        if (s && s.kind !== "object" && r.throwValidationError({ kind: "IncludeOnScalar", selectionPath: r.getSelectionPath().concat(n), outputType: r.getOutputTypeDescription() }), s) {
          e[n] = yr(i === true ? {} : i, o);
          continue;
        }
        if (i === true) {
          e[n] = true;
          continue;
        }
        e[n] = yr(i, o);
      }
    }
    function Ad(e, t, r) {
      let n = r.getComputedFields(), i = { ...r.getGlobalOmit(), ...t }, o = ba(i, n);
      for (let [s, a] of Object.entries(o)) {
        if (Ie(a))
          continue;
        Ki(a, r.nestSelection(s));
        let l = r.findField(s);
        n?.[s] && !l || (e[s] = !a);
      }
    }
    function Id(e, t) {
      let r = {}, n = t.getComputedFields(), i = Ea(e, n);
      for (let [o, s] of Object.entries(i)) {
        if (Ie(s))
          continue;
        let a = t.nestSelection(o);
        Ki(s, a);
        let l = t.findField(o);
        if (!(n?.[o] && !l)) {
          if (s === false || s === void 0 || Ie(s)) {
            r[o] = false;
            continue;
          }
          if (s === true) {
            l?.kind === "object" ? r[o] = yr({}, a) : r[o] = true;
            continue;
          }
          r[o] = yr(s, a);
        }
      }
      return r;
    }
    function Ta(e, t) {
      if (e === null)
        return null;
      if (typeof e == "string" || typeof e == "number" || typeof e == "boolean")
        return e;
      if (typeof e == "bigint")
        return { $type: "BigInt", value: String(e) };
      if (Tt(e)) {
        if (dn(e))
          return { $type: "DateTime", value: e.toISOString() };
        t.throwValidationError({ kind: "InvalidArgumentValue", selectionPath: t.getSelectionPath(), argumentPath: t.getArgumentPath(), argument: { name: t.getArgumentName(), typeNames: ["Date"] }, underlyingError: "Provided Date object is invalid" });
      }
      if (wa(e))
        return { $type: "Param", value: e.name };
      if (kt(e))
        return { $type: "FieldRef", value: { _ref: e.name, _container: e.modelName } };
      if (Array.isArray(e))
        return kd(e, t);
      if (ArrayBuffer.isView(e)) {
        let { buffer: r, byteOffset: n, byteLength: i } = e;
        return { $type: "Bytes", value: Buffer.from(r, n, i).toString("base64") };
      }
      if (Od(e))
        return e.values;
      if (Ct(e))
        return { $type: "Decimal", value: e.toFixed() };
      if (e instanceof qe) {
        if (e !== Pn.instances[e._getName()])
          throw new Error("Invalid ObjectEnumValue");
        return { $type: "Enum", value: e._getName() };
      }
      if (_d(e))
        return e.toJSON();
      if (typeof e == "object")
        return Ca(e, t);
      t.throwValidationError({ kind: "InvalidArgumentValue", selectionPath: t.getSelectionPath(), argumentPath: t.getArgumentPath(), argument: { name: t.getArgumentName(), typeNames: [] }, underlyingError: `We could not serialize ${Object.prototype.toString.call(e)} value. Serialize the object to JSON or implement a ".toJSON()" method on it` });
    }
    function Ca(e, t) {
      if (e.$type)
        return { $type: "Raw", value: e };
      let r = {};
      for (let n in e) {
        let i = e[n], o = t.nestArgument(n);
        Ie(i) || (i !== void 0 ? r[n] = Ta(i, o) : t.isPreviewFeatureOn("strictUndefinedChecks") && t.throwValidationError({ kind: "InvalidArgumentValue", argumentPath: o.getArgumentPath(), selectionPath: t.getSelectionPath(), argument: { name: t.getArgumentName(), typeNames: [] }, underlyingError: va }));
      }
      return r;
    }
    function kd(e, t) {
      let r = [];
      for (let n = 0; n < e.length; n++) {
        let i = t.nestArgument(String(n)), o = e[n];
        if (o === void 0 || Ie(o)) {
          let s = o === void 0 ? "undefined" : "Prisma.skip";
          t.throwValidationError({ kind: "InvalidArgumentValue", selectionPath: i.getSelectionPath(), argumentPath: i.getArgumentPath(), argument: { name: `${t.getArgumentName()}[${n}]`, typeNames: [] }, underlyingError: `Can not use \`${s}\` value within array. Use \`null\` or filter out \`${s}\` values` });
        }
        r.push(Ta(o, i));
      }
      return r;
    }
    function Od(e) {
      return typeof e == "object" && e !== null && e.__prismaRawParameters__ === true;
    }
    function _d(e) {
      return typeof e == "object" && e !== null && typeof e.toJSON == "function";
    }
    function Ki(e, t) {
      e === void 0 && t.isPreviewFeatureOn("strictUndefinedChecks") && t.throwValidationError({ kind: "InvalidSelectionValue", selectionPath: t.getSelectionPath(), underlyingError: va });
    }
    var Hi = class e {
      constructor(t) {
        this.params = t;
        d(this, "modelOrType");
        this.params.modelName && (this.modelOrType = this.params.runtimeDataModel.models[this.params.modelName] ?? this.params.runtimeDataModel.types[this.params.modelName]);
      }
      throwValidationError(t) {
        Cn({ errors: [t], originalMethod: this.params.originalMethod, args: this.params.rootArgs ?? {}, callsite: this.params.callsite, errorFormat: this.params.errorFormat, clientVersion: this.params.clientVersion, globalOmit: this.params.globalOmit });
      }
      getSelectionPath() {
        return this.params.selectionPath;
      }
      getArgumentPath() {
        return this.params.argumentPath;
      }
      getArgumentName() {
        return this.params.argumentPath[this.params.argumentPath.length - 1];
      }
      getOutputTypeDescription() {
        if (!(!this.params.modelName || !this.modelOrType))
          return { name: this.params.modelName, fields: this.modelOrType.fields.map((t) => ({ name: t.name, typeName: "boolean", isRelation: t.kind === "object" })) };
      }
      isRawAction() {
        return ["executeRaw", "queryRaw", "runCommandRaw", "findRaw", "aggregateRaw"].includes(this.params.action);
      }
      isPreviewFeatureOn(t) {
        return this.params.previewFeatures.includes(t);
      }
      getComputedFields() {
        if (this.params.modelName)
          return this.params.extensions.getAllComputedFields(this.params.modelName);
      }
      findField(t) {
        return this.modelOrType?.fields.find((r) => r.name === t);
      }
      nestSelection(t) {
        let r = this.findField(t), n = r?.kind === "object" ? r.type : void 0;
        return new e({ ...this.params, modelName: n, selectionPath: this.params.selectionPath.concat(t) });
      }
      getGlobalOmit() {
        return this.params.modelName && this.shouldApplyGlobalOmit() ? this.params.globalOmit?.[vt(this.params.modelName)] ?? {} : {};
      }
      shouldApplyGlobalOmit() {
        switch (this.params.action) {
          case "findFirst":
          case "findFirstOrThrow":
          case "findUniqueOrThrow":
          case "findMany":
          case "upsert":
          case "findUnique":
          case "createManyAndReturn":
          case "create":
          case "update":
          case "updateManyAndReturn":
          case "delete":
            return true;
          case "executeRaw":
          case "aggregateRaw":
          case "runCommandRaw":
          case "findRaw":
          case "createMany":
          case "deleteMany":
          case "groupBy":
          case "updateMany":
          case "count":
          case "aggregate":
          case "queryRaw":
            return false;
          default:
            Me(this.params.action, "Unknown action");
        }
      }
      nestArgument(t) {
        return new e({ ...this.params, argumentPath: this.params.argumentPath.concat(t) });
      }
    };
    function Ra(e) {
      if (!e._hasPreviewFlag("metrics"))
        throw new re("`metrics` preview feature must be enabled in order to access metrics API", { clientVersion: e._clientVersion });
    }
    var Dt = class {
      constructor(t) {
        d(this, "_client");
        this._client = t;
      }
      prometheus(t) {
        return Ra(this._client), this._client._engine.metrics({ format: "prometheus", ...t });
      }
      json(t) {
        return Ra(this._client), this._client._engine.metrics({ format: "json", ...t });
      }
    };
    function Sa(e) {
      return { models: Yi(e.models), enums: Yi(e.enums), types: Yi(e.types) };
    }
    function Yi(e) {
      let t = {};
      for (let { name: r, ...n } of e)
        t[r] = n;
      return t;
    }
    function Aa(e, t) {
      let r = gr(() => Dd(t));
      Object.defineProperty(e, "dmmf", { get: () => r.get() });
    }
    function Dd(e) {
      return { datamodel: { models: zi(e.models), enums: zi(e.enums), types: zi(e.types) } };
    }
    function zi(e) {
      return Object.entries(e).map(([t, r]) => ({ name: t, ...r }));
    }
    var Zi = /* @__PURE__ */ new WeakMap();
    var kn = "$$PrismaTypedSql";
    var Er = class {
      constructor(t, r) {
        Zi.set(this, { sql: t, values: r }), Object.defineProperty(this, kn, { value: kn });
      }
      get sql() {
        return Zi.get(this).sql;
      }
      get values() {
        return Zi.get(this).values;
      }
    };
    function Ia(e) {
      return (...t) => new Er(e, t);
    }
    function On(e) {
      return e != null && e[kn] === kn;
    }
    var su = D(bi());
    var au = require("async_hooks");
    var lu = require("events");
    var uu = D(require("fs"));
    var Mr = D(require("path"));
    var le = class e {
      constructor(t, r) {
        if (t.length - 1 !== r.length)
          throw t.length === 0 ? new TypeError("Expected at least 1 string") : new TypeError(`Expected ${t.length} strings to have ${t.length - 1} values`);
        let n = r.reduce((s, a) => s + (a instanceof e ? a.values.length : 1), 0);
        this.values = new Array(n), this.strings = new Array(n + 1), this.strings[0] = t[0];
        let i = 0, o = 0;
        for (; i < r.length; ) {
          let s = r[i++], a = t[i];
          if (s instanceof e) {
            this.strings[o] += s.strings[0];
            let l = 0;
            for (; l < s.values.length; )
              this.values[o++] = s.values[l++], this.strings[o] = s.strings[l];
            this.strings[o] += a;
          } else
            this.values[o++] = s, this.strings[o] = a;
        }
      }
      get sql() {
        let t = this.strings.length, r = 1, n = this.strings[0];
        for (; r < t; )
          n += `?${this.strings[r++]}`;
        return n;
      }
      get statement() {
        let t = this.strings.length, r = 1, n = this.strings[0];
        for (; r < t; )
          n += `:${r}${this.strings[r++]}`;
        return n;
      }
      get text() {
        let t = this.strings.length, r = 1, n = this.strings[0];
        for (; r < t; )
          n += `$${r}${this.strings[r++]}`;
        return n;
      }
      inspect() {
        return { sql: this.sql, statement: this.statement, text: this.text, values: this.values };
      }
    };
    function ka(e, t = ",", r = "", n = "") {
      if (e.length === 0)
        throw new TypeError("Expected `join([])` to be called with an array of multiple elements, but got an empty array");
      return new le([r, ...Array(e.length - 1).fill(t), n], e);
    }
    function Xi(e) {
      return new le([e], []);
    }
    var Oa = Xi("");
    function eo(e, ...t) {
      return new le(e, t);
    }
    function br(e) {
      return { getKeys() {
        return Object.keys(e);
      }, getPropertyValue(t) {
        return e[t];
      } };
    }
    function oe(e, t) {
      return { getKeys() {
        return [e];
      }, getPropertyValue() {
        return t();
      } };
    }
    function at(e) {
      let t = new Se();
      return { getKeys() {
        return e.getKeys();
      }, getPropertyValue(r) {
        return t.getOrCreate(r, () => e.getPropertyValue(r));
      }, getPropertyDescriptor(r) {
        return e.getPropertyDescriptor?.(r);
      } };
    }
    var _n = { enumerable: true, configurable: true, writable: true };
    function Dn(e) {
      let t = new Set(e);
      return { getPrototypeOf: () => Object.prototype, getOwnPropertyDescriptor: () => _n, has: (r, n) => t.has(n), set: (r, n, i) => t.add(n) && Reflect.set(r, n, i), ownKeys: () => [...t] };
    }
    var _a = Symbol.for("nodejs.util.inspect.custom");
    function be(e, t) {
      let r = Nd(t), n = /* @__PURE__ */ new Set(), i = new Proxy(e, { get(o, s) {
        if (n.has(s))
          return o[s];
        let a = r.get(s);
        return a ? a.getPropertyValue(s) : o[s];
      }, has(o, s) {
        if (n.has(s))
          return true;
        let a = r.get(s);
        return a ? a.has?.(s) ?? true : Reflect.has(o, s);
      }, ownKeys(o) {
        let s = Da(Reflect.ownKeys(o), r), a = Da(Array.from(r.keys()), r);
        return [.../* @__PURE__ */ new Set([...s, ...a, ...n])];
      }, set(o, s, a) {
        return r.get(s)?.getPropertyDescriptor?.(s)?.writable === false ? false : (n.add(s), Reflect.set(o, s, a));
      }, getOwnPropertyDescriptor(o, s) {
        let a = Reflect.getOwnPropertyDescriptor(o, s);
        if (a && !a.configurable)
          return a;
        let l = r.get(s);
        return l ? l.getPropertyDescriptor ? { ..._n, ...l?.getPropertyDescriptor(s) } : _n : a;
      }, defineProperty(o, s, a) {
        return n.add(s), Reflect.defineProperty(o, s, a);
      }, getPrototypeOf: () => Object.prototype });
      return i[_a] = function() {
        let o = { ...this };
        return delete o[_a], o;
      }, i;
    }
    function Nd(e) {
      let t = /* @__PURE__ */ new Map();
      for (let r of e) {
        let n = r.getKeys();
        for (let i of n)
          t.set(i, r);
      }
      return t;
    }
    function Da(e, t) {
      return e.filter((r) => t.get(r)?.has?.(r) ?? true);
    }
    function Nt(e) {
      return { getKeys() {
        return e;
      }, has() {
        return false;
      }, getPropertyValue() {
      } };
    }
    function Lt(e, t) {
      return { batch: e, transaction: t?.kind === "batch" ? { isolationLevel: t.options.isolationLevel } : void 0 };
    }
    function Na(e) {
      if (e === void 0)
        return "";
      let t = Ot(e);
      return new Rt(0, { colors: bn }).write(t).toString();
    }
    var Ld = "P2037";
    function Ft({ error: e, user_facing_error: t }, r, n) {
      return t.error_code ? new te(Fd(t, n), { code: t.error_code, clientVersion: r, meta: t.meta, batchRequestIdx: t.batch_request_idx }) : new U(e, { clientVersion: r, batchRequestIdx: t.batch_request_idx });
    }
    function Fd(e, t) {
      let r = e.message;
      return (t === "postgresql" || t === "postgres" || t === "mysql") && e.error_code === Ld && (r += `
Prisma Accelerate has built-in connection pooling to prevent such errors: https://pris.ly/client/error-accelerate`), r;
    }
    var wr = "<unknown>";
    function La(e) {
      var t = e.split(`
`);
      return t.reduce(function(r, n) {
        var i = qd(n) || jd(n) || Qd(n) || Hd(n) || Jd(n);
        return i && r.push(i), r;
      }, []);
    }
    var Md = /^\s*at (.*?) ?\(((?:file|https?|blob|chrome-extension|native|eval|webpack|rsc|<anonymous>|\/|[a-z]:\\|\\\\).*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i;
    var $d = /\((\S*)(?::(\d+))(?::(\d+))\)/;
    function qd(e) {
      var t = Md.exec(e);
      if (!t)
        return null;
      var r = t[2] && t[2].indexOf("native") === 0, n = t[2] && t[2].indexOf("eval") === 0, i = $d.exec(t[2]);
      return n && i != null && (t[2] = i[1], t[3] = i[2], t[4] = i[3]), { file: r ? null : t[2], methodName: t[1] || wr, arguments: r ? [t[2]] : [], lineNumber: t[3] ? +t[3] : null, column: t[4] ? +t[4] : null };
    }
    var Vd = /^\s*at (?:((?:\[object object\])?.+) )?\(?((?:file|ms-appx|https?|webpack|rsc|blob):.*?):(\d+)(?::(\d+))?\)?\s*$/i;
    function jd(e) {
      var t = Vd.exec(e);
      return t ? { file: t[2], methodName: t[1] || wr, arguments: [], lineNumber: +t[3], column: t[4] ? +t[4] : null } : null;
    }
    var Bd = /^\s*(.*?)(?:\((.*?)\))?(?:^|@)((?:file|https?|blob|chrome|webpack|rsc|resource|\[native).*?|[^@]*bundle)(?::(\d+))?(?::(\d+))?\s*$/i;
    var Ud = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i;
    function Qd(e) {
      var t = Bd.exec(e);
      if (!t)
        return null;
      var r = t[3] && t[3].indexOf(" > eval") > -1, n = Ud.exec(t[3]);
      return r && n != null && (t[3] = n[1], t[4] = n[2], t[5] = null), { file: t[3], methodName: t[1] || wr, arguments: t[2] ? t[2].split(",") : [], lineNumber: t[4] ? +t[4] : null, column: t[5] ? +t[5] : null };
    }
    var Gd = /^\s*(?:([^@]*)(?:\((.*?)\))?@)?(\S.*?):(\d+)(?::(\d+))?\s*$/i;
    function Jd(e) {
      var t = Gd.exec(e);
      return t ? { file: t[3], methodName: t[1] || wr, arguments: [], lineNumber: +t[4], column: t[5] ? +t[5] : null } : null;
    }
    var Wd = /^\s*at (?:((?:\[object object\])?[^\\/]+(?: \[as \S+\])?) )?\(?(.*?):(\d+)(?::(\d+))?\)?\s*$/i;
    function Hd(e) {
      var t = Wd.exec(e);
      return t ? { file: t[2], methodName: t[1] || wr, arguments: [], lineNumber: +t[3], column: t[4] ? +t[4] : null } : null;
    }
    var to = class {
      getLocation() {
        return null;
      }
    };
    var ro = class {
      constructor() {
        d(this, "_error");
        this._error = new Error();
      }
      getLocation() {
        let t = this._error.stack;
        if (!t)
          return null;
        let n = La(t).find((i) => {
          if (!i.file)
            return false;
          let o = ki(i.file);
          return o !== "<anonymous>" && !o.includes("@prisma") && !o.includes("/packages/client/src/runtime/") && !o.endsWith("/runtime/binary.js") && !o.endsWith("/runtime/library.js") && !o.endsWith("/runtime/edge.js") && !o.endsWith("/runtime/edge-esm.js") && !o.startsWith("internal/") && !i.methodName.includes("new ") && !i.methodName.includes("getCallSite") && !i.methodName.includes("Proxy.") && i.methodName.split(".").length < 4;
        });
        return !n || !n.file ? null : { fileName: n.file, lineNumber: n.lineNumber, columnNumber: n.column };
      }
    };
    function Xe(e) {
      return e === "minimal" ? typeof $EnabledCallSite == "function" && e !== "minimal" ? new $EnabledCallSite() : new to() : new ro();
    }
    var Fa = { _avg: true, _count: true, _sum: true, _min: true, _max: true };
    function Mt(e = {}) {
      let t = Yd(e);
      return Object.entries(t).reduce((n, [i, o]) => (Fa[i] !== void 0 ? n.select[i] = { select: o } : n[i] = o, n), { select: {} });
    }
    function Yd(e = {}) {
      return typeof e._count == "boolean" ? { ...e, _count: { _all: e._count } } : e;
    }
    function Nn(e = {}) {
      return (t) => (typeof e._count == "boolean" && (t._count = t._count._all), t);
    }
    function Ma(e, t) {
      let r = Nn(e);
      return t({ action: "aggregate", unpacker: r, argsMapper: Mt })(e);
    }
    function zd(e = {}) {
      let { select: t, ...r } = e;
      return typeof t == "object" ? Mt({ ...r, _count: t }) : Mt({ ...r, _count: { _all: true } });
    }
    function Zd(e = {}) {
      return typeof e.select == "object" ? (t) => Nn(e)(t)._count : (t) => Nn(e)(t)._count._all;
    }
    function $a(e, t) {
      return t({ action: "count", unpacker: Zd(e), argsMapper: zd })(e);
    }
    function Xd(e = {}) {
      let t = Mt(e);
      if (Array.isArray(t.by))
        for (let r of t.by)
          typeof r == "string" && (t.select[r] = true);
      else
        typeof t.by == "string" && (t.select[t.by] = true);
      return t;
    }
    function em(e = {}) {
      return (t) => (typeof e?._count == "boolean" && t.forEach((r) => {
        r._count = r._count._all;
      }), t);
    }
    function qa(e, t) {
      return t({ action: "groupBy", unpacker: em(e), argsMapper: Xd })(e);
    }
    function Va(e, t, r) {
      if (t === "aggregate")
        return (n) => Ma(n, r);
      if (t === "count")
        return (n) => $a(n, r);
      if (t === "groupBy")
        return (n) => qa(n, r);
    }
    function ja(e, t) {
      let r = t.fields.filter((i) => !i.relationName), n = Mi(r, (i) => i.name);
      return new Proxy({}, { get(i, o) {
        if (o in i || typeof o == "symbol")
          return i[o];
        let s = n[o];
        if (s)
          return new cr(e, o, s.type, s.isList, s.kind === "enum");
      }, ...Dn(Object.keys(n)) });
    }
    var Ba = (e) => Array.isArray(e) ? e : e.split(".");
    var no = (e, t) => Ba(t).reduce((r, n) => r && r[n], e);
    var Ua = (e, t, r) => Ba(t).reduceRight((n, i, o, s) => Object.assign({}, no(e, s.slice(0, o)), { [i]: n }), r);
    function tm(e, t) {
      return e === void 0 || t === void 0 ? [] : [...t, "select", e];
    }
    function rm(e, t, r) {
      return t === void 0 ? e ?? {} : Ua(t, r, e || true);
    }
    function io(e, t, r, n, i, o) {
      let a = e._runtimeDataModel.models[t].fields.reduce((l, u) => ({ ...l, [u.name]: u }), {});
      return (l) => {
        let u = Xe(e._errorFormat), c = tm(n, i), p = rm(l, o, c), m = r({ dataPath: c, callsite: u })(p), g = nm(e, t);
        return new Proxy(m, { get(h, y) {
          if (!g.includes(y))
            return h[y];
          let T = [a[y].type, r, y], S = [c, p];
          return io(e, ...T, ...S);
        }, ...Dn([...g, ...Object.getOwnPropertyNames(m)]) });
      };
    }
    function nm(e, t) {
      return e._runtimeDataModel.models[t].fields.filter((r) => r.kind === "object").map((r) => r.name);
    }
    var im = ["findUnique", "findUniqueOrThrow", "findFirst", "findFirstOrThrow", "create", "update", "upsert", "delete"];
    var om = ["aggregate", "count", "groupBy"];
    function oo(e, t) {
      let r = e._extensions.getAllModelExtensions(t) ?? {}, n = [sm(e, t), lm(e, t), br(r), oe("name", () => t), oe("$name", () => t), oe("$parent", () => e._appliedParent)];
      return be({}, n);
    }
    function sm(e, t) {
      let r = Ae(t), n = Object.keys(tr.ModelAction).concat("count");
      return { getKeys() {
        return n;
      }, getPropertyValue(i) {
        let o = i, s = (a) => (l) => {
          let u = Xe(e._errorFormat);
          return e._createPrismaPromise((c) => {
            let p = { args: l, dataPath: [], action: o, model: t, clientMethod: `${r}.${i}`, jsModelName: r, transaction: c, callsite: u };
            return e._request({ ...p, ...a });
          }, { action: o, args: l, model: t });
        };
        return im.includes(o) ? io(e, t, s) : am(i) ? Va(e, i, s) : s({});
      } };
    }
    function am(e) {
      return om.includes(e);
    }
    function lm(e, t) {
      return at(oe("fields", () => {
        let r = e._runtimeDataModel.models[t];
        return ja(t, r);
      }));
    }
    function Qa(e) {
      return e.replace(/^./, (t) => t.toUpperCase());
    }
    var so = Symbol();
    function xr(e) {
      let t = [um(e), cm(e), oe(so, () => e), oe("$parent", () => e._appliedParent)], r = e._extensions.getAllClientExtensions();
      return r && t.push(br(r)), be(e, t);
    }
    function um(e) {
      let t = Object.getPrototypeOf(e._originalClient), r = [...new Set(Object.getOwnPropertyNames(t))];
      return { getKeys() {
        return r;
      }, getPropertyValue(n) {
        return e[n];
      } };
    }
    function cm(e) {
      let t = Object.keys(e._runtimeDataModel.models), r = t.map(Ae), n = [...new Set(t.concat(r))];
      return at({ getKeys() {
        return n;
      }, getPropertyValue(i) {
        let o = Qa(i);
        if (e._runtimeDataModel.models[o] !== void 0)
          return oo(e, o);
        if (e._runtimeDataModel.models[i] !== void 0)
          return oo(e, i);
      }, getPropertyDescriptor(i) {
        if (!r.includes(i))
          return { enumerable: false };
      } });
    }
    function Ga(e) {
      return e[so] ? e[so] : e;
    }
    function Ja(e) {
      if (typeof e == "function")
        return e(this);
      if (e.client?.__AccelerateEngine) {
        let r = e.client.__AccelerateEngine;
        this._originalClient._engine = new r(this._originalClient._accelerateEngineConfig);
      }
      let t = Object.create(this._originalClient, { _extensions: { value: this._extensions.append(e) }, _appliedParent: { value: this, configurable: true }, $use: { value: void 0 }, $on: { value: void 0 } });
      return xr(t);
    }
    function Wa({ result: e, modelName: t, select: r, omit: n, extensions: i }) {
      let o = i.getAllComputedFields(t);
      if (!o)
        return e;
      let s = [], a = [];
      for (let l of Object.values(o)) {
        if (n) {
          if (n[l.name])
            continue;
          let u = l.needs.filter((c) => n[c]);
          u.length > 0 && a.push(Nt(u));
        } else if (r) {
          if (!r[l.name])
            continue;
          let u = l.needs.filter((c) => !r[c]);
          u.length > 0 && a.push(Nt(u));
        }
        pm(e, l.needs) && s.push(dm(l, be(e, s)));
      }
      return s.length > 0 || a.length > 0 ? be(e, [...s, ...a]) : e;
    }
    function pm(e, t) {
      return t.every((r) => Fi(e, r));
    }
    function dm(e, t) {
      return at(oe(e.name, () => e.compute(t)));
    }
    function Ln({ visitor: e, result: t, args: r, runtimeDataModel: n, modelName: i }) {
      if (Array.isArray(t)) {
        for (let s = 0; s < t.length; s++)
          t[s] = Ln({ result: t[s], args: r, modelName: i, runtimeDataModel: n, visitor: e });
        return t;
      }
      let o = e(t, i, r) ?? t;
      return r.include && Ha({ includeOrSelect: r.include, result: o, parentModelName: i, runtimeDataModel: n, visitor: e }), r.select && Ha({ includeOrSelect: r.select, result: o, parentModelName: i, runtimeDataModel: n, visitor: e }), o;
    }
    function Ha({ includeOrSelect: e, result: t, parentModelName: r, runtimeDataModel: n, visitor: i }) {
      for (let [o, s] of Object.entries(e)) {
        if (!s || t[o] == null || Ie(s))
          continue;
        let l = n.models[r].fields.find((c) => c.name === o);
        if (!l || l.kind !== "object" || !l.relationName)
          continue;
        let u = typeof s == "object" ? s : {};
        t[o] = Ln({ visitor: i, result: t[o], args: u, modelName: l.type, runtimeDataModel: n });
      }
    }
    function Ka({ result: e, modelName: t, args: r, extensions: n, runtimeDataModel: i, globalOmit: o }) {
      return n.isEmpty() || e == null || typeof e != "object" || !i.models[t] ? e : Ln({ result: e, args: r ?? {}, modelName: t, runtimeDataModel: i, visitor: (a, l, u) => {
        let c = Ae(l);
        return Wa({ result: a, modelName: c, select: u.select, omit: u.select ? void 0 : { ...o?.[c], ...u.omit }, extensions: n });
      } });
    }
    var mm = ["$connect", "$disconnect", "$on", "$transaction", "$use", "$extends"];
    var Ya = mm;
    function za(e) {
      if (e instanceof le)
        return fm(e);
      if (On(e))
        return gm(e);
      if (Array.isArray(e)) {
        let r = [e[0]];
        for (let n = 1; n < e.length; n++)
          r[n] = Pr(e[n]);
        return r;
      }
      let t = {};
      for (let r in e)
        t[r] = Pr(e[r]);
      return t;
    }
    function fm(e) {
      return new le(e.strings, e.values);
    }
    function gm(e) {
      return new Er(e.sql, e.values);
    }
    function Pr(e) {
      if (typeof e != "object" || e == null || e instanceof qe || kt(e))
        return e;
      if (Ct(e))
        return new Ce(e.toFixed());
      if (Tt(e))
        return /* @__PURE__ */ new Date(+e);
      if (ArrayBuffer.isView(e))
        return e.slice(0);
      if (Array.isArray(e)) {
        let t = e.length, r;
        for (r = Array(t); t--; )
          r[t] = Pr(e[t]);
        return r;
      }
      if (typeof e == "object") {
        let t = {};
        for (let r in e)
          r === "__proto__" ? Object.defineProperty(t, r, { value: Pr(e[r]), configurable: true, enumerable: true, writable: true }) : t[r] = Pr(e[r]);
        return t;
      }
      Me(e, "Unknown value");
    }
    function Xa(e, t, r, n = 0) {
      return e._createPrismaPromise((i) => {
        let o = t.customDataProxyFetch;
        return "transaction" in t && i !== void 0 && (t.transaction?.kind === "batch" && t.transaction.lock.then(), t.transaction = i), n === r.length ? e._executeRequest(t) : r[n]({ model: t.model, operation: t.model ? t.action : t.clientMethod, args: za(t.args ?? {}), __internalParams: t, query: (s, a = t) => {
          let l = a.customDataProxyFetch;
          return a.customDataProxyFetch = nl(o, l), a.args = s, Xa(e, a, r, n + 1);
        } });
      });
    }
    function el(e, t) {
      let { jsModelName: r, action: n, clientMethod: i } = t, o = r ? n : i;
      if (e._extensions.isEmpty())
        return e._executeRequest(t);
      let s = e._extensions.getAllQueryCallbacks(r ?? "$none", o);
      return Xa(e, t, s);
    }
    function tl(e) {
      return (t) => {
        let r = { requests: t }, n = t[0].extensions.getAllBatchQueryCallbacks();
        return n.length ? rl(r, n, 0, e) : e(r);
      };
    }
    function rl(e, t, r, n) {
      if (r === t.length)
        return n(e);
      let i = e.customDataProxyFetch, o = e.requests[0].transaction;
      return t[r]({ args: { queries: e.requests.map((s) => ({ model: s.modelName, operation: s.action, args: s.args })), transaction: o ? { isolationLevel: o.kind === "batch" ? o.isolationLevel : void 0 } : void 0 }, __internalParams: e, query(s, a = e) {
        let l = a.customDataProxyFetch;
        return a.customDataProxyFetch = nl(i, l), rl(a, t, r + 1, n);
      } });
    }
    var Za = (e) => e;
    function nl(e = Za, t = Za) {
      return (r) => e(t(r));
    }
    var il = M("prisma:client");
    var ol = { Vercel: "vercel", "Netlify CI": "netlify" };
    function sl({ postinstall: e, ciName: t, clientVersion: r }) {
      if (il("checkPlatformCaching:postinstall", e), il("checkPlatformCaching:ciName", t), e === true && t && t in ol) {
        let n = `Prisma has detected that this project was built on ${t}, which caches dependencies. This leads to an outdated Prisma Client because Prisma's auto-generation isn't triggered. To fix this, make sure to run the \`prisma generate\` command during the build process.

Learn how: https://pris.ly/d/${ol[t]}-build`;
        throw console.error(n), new C(n, r);
      }
    }
    function al(e, t) {
      return e ? e.datasources ? e.datasources : e.datasourceUrl ? { [t[0]]: { url: e.datasourceUrl } } : {} : {};
    }
    var hm = () => globalThis.process?.release?.name === "node";
    var ym = () => !!globalThis.Bun || !!globalThis.process?.versions?.bun;
    var Em = () => !!globalThis.Deno;
    var bm = () => typeof globalThis.Netlify == "object";
    var wm = () => typeof globalThis.EdgeRuntime == "object";
    var xm = () => globalThis.navigator?.userAgent === "Cloudflare-Workers";
    function Pm() {
      return [[bm, "netlify"], [wm, "edge-light"], [xm, "workerd"], [Em, "deno"], [ym, "bun"], [hm, "node"]].flatMap((r) => r[0]() ? [r[1]] : []).at(0) ?? "";
    }
    var vm = { node: "Node.js", workerd: "Cloudflare Workers", deno: "Deno and Deno Deploy", netlify: "Netlify Edge Functions", "edge-light": "Edge Runtime (Vercel Edge Functions, Vercel Edge Middleware, Next.js (Pages Router) Edge API Routes, Next.js (App Router) Edge Route Handlers or Next.js Middleware)" };
    function Fn() {
      let e = Pm();
      return { id: e, prettyName: vm[e] || e, isEdge: ["workerd", "deno", "netlify", "edge-light"].includes(e) };
    }
    var dl = D(require("fs"));
    var vr = D(require("path"));
    function Mn(e) {
      let { runtimeBinaryTarget: t } = e;
      return `Add "${t}" to \`binaryTargets\` in the "schema.prisma" file and run \`prisma generate\` after saving it:

${Tm(e)}`;
    }
    function Tm(e) {
      let { generator: t, generatorBinaryTargets: r, runtimeBinaryTarget: n } = e, i = { fromEnvVar: null, value: n }, o = [...r, i];
      return Di({ ...t, binaryTargets: o });
    }
    function et(e) {
      let { runtimeBinaryTarget: t } = e;
      return `Prisma Client could not locate the Query Engine for runtime "${t}".`;
    }
    function tt(e) {
      let { searchedLocations: t } = e;
      return `The following locations have been searched:
${[...new Set(t)].map((i) => `  ${i}`).join(`
`)}`;
    }
    function ll(e) {
      let { runtimeBinaryTarget: t } = e;
      return `${et(e)}

This happened because \`binaryTargets\` have been pinned, but the actual deployment also required "${t}".
${Mn(e)}

${tt(e)}`;
    }
    function $n(e) {
      return `We would appreciate if you could take the time to share some information with us.
Please help us by answering a few questions: https://pris.ly/${e}`;
    }
    function qn(e) {
      let { errorStack: t } = e;
      return t?.match(/\/\.next|\/next@|\/next\//) ? `

We detected that you are using Next.js, learn how to fix this: https://pris.ly/d/engine-not-found-nextjs.` : "";
    }
    function ul(e) {
      let { queryEngineName: t } = e;
      return `${et(e)}${qn(e)}

This is likely caused by a bundler that has not copied "${t}" next to the resulting bundle.
Ensure that "${t}" has been copied next to the bundle or in "${e.expectedLocation}".

${$n("engine-not-found-bundler-investigation")}

${tt(e)}`;
    }
    function cl(e) {
      let { runtimeBinaryTarget: t, generatorBinaryTargets: r } = e, n = r.find((i) => i.native);
      return `${et(e)}

This happened because Prisma Client was generated for "${n?.value ?? "unknown"}", but the actual deployment required "${t}".
${Mn(e)}

${tt(e)}`;
    }
    function pl(e) {
      let { queryEngineName: t } = e;
      return `${et(e)}${qn(e)}

This is likely caused by tooling that has not copied "${t}" to the deployment folder.
Ensure that you ran \`prisma generate\` and that "${t}" has been copied to "${e.expectedLocation}".

${$n("engine-not-found-tooling-investigation")}

${tt(e)}`;
    }
    var Cm = M("prisma:client:engines:resolveEnginePath");
    var Rm = () => new RegExp("runtime[\\\\/]library\\.m?js$");
    async function ml(e, t) {
      let r = { binary: process.env.PRISMA_QUERY_ENGINE_BINARY, library: process.env.PRISMA_QUERY_ENGINE_LIBRARY }[e] ?? t.prismaPath;
      if (r !== void 0)
        return r;
      let { enginePath: n, searchedLocations: i } = await Sm(e, t);
      if (Cm("enginePath", n), n !== void 0 && e === "binary" && Pi(n), n !== void 0)
        return t.prismaPath = n;
      let o = await ot(), s = t.generator?.binaryTargets ?? [], a = s.some((m) => m.native), l = !s.some((m) => m.value === o), u = __filename.match(Rm()) === null, c = { searchedLocations: i, generatorBinaryTargets: s, generator: t.generator, runtimeBinaryTarget: o, queryEngineName: fl(e, o), expectedLocation: vr.default.relative(process.cwd(), t.dirname), errorStack: new Error().stack }, p;
      throw a && l ? p = cl(c) : l ? p = ll(c) : u ? p = ul(c) : p = pl(c), new C(p, t.clientVersion);
    }
    async function Sm(engineType, config) {
      let binaryTarget = await ot(), searchedLocations = [], dirname = eval("__dirname"), searchLocations = [config.dirname, vr.default.resolve(dirname, ".."), config.generator?.output?.value ?? dirname, vr.default.resolve(dirname, "../../../.prisma/client"), "/tmp/prisma-engines", config.cwd];
      __filename.includes("resolveEnginePath") && searchLocations.push(cs());
      for (let e of searchLocations) {
        let t = fl(engineType, binaryTarget), r = vr.default.join(e, t);
        if (searchedLocations.push(e), dl.default.existsSync(r))
          return { enginePath: r, searchedLocations };
      }
      return { enginePath: void 0, searchedLocations };
    }
    function fl(e, t) {
      return e === "library" ? Br(t, "fs") : `query-engine-${t}${t === "windows" ? ".exe" : ""}`;
    }
    var ao = D(Li());
    function gl(e) {
      return e ? e.replace(/".*"/g, '"X"').replace(/[\s:\[]([+-]?([0-9]*[.])?[0-9]+)/g, (t) => `${t[0]}5`) : "";
    }
    function hl(e) {
      return e.split(`
`).map((t) => t.replace(/^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)\s*/, "").replace(/\+\d+\s*ms$/, "")).join(`
`);
    }
    var yl = D(_s());
    function El({ title: e, user: t = "prisma", repo: r = "prisma", template: n = "bug_report.yml", body: i }) {
      return (0, yl.default)({ user: t, repo: r, template: n, title: e, body: i });
    }
    function bl({ version: e, binaryTarget: t, title: r, description: n, engineVersion: i, database: o, query: s }) {
      let a = qo(6e3 - (s?.length ?? 0)), l = hl((0, ao.default)(a)), u = n ? `# Description
\`\`\`
${n}
\`\`\`` : "", c = (0, ao.default)(`Hi Prisma Team! My Prisma Client just crashed. This is the report:
## Versions

| Name            | Version            |
|-----------------|--------------------|
| Node            | ${process.version?.padEnd(19)}| 
| OS              | ${t?.padEnd(19)}|
| Prisma Client   | ${e?.padEnd(19)}|
| Query Engine    | ${i?.padEnd(19)}|
| Database        | ${o?.padEnd(19)}|

${u}

## Logs
\`\`\`
${l}
\`\`\`

## Client Snippet
\`\`\`ts
// PLEASE FILL YOUR CODE SNIPPET HERE
\`\`\`

## Schema
\`\`\`prisma
// PLEASE ADD YOUR SCHEMA HERE IF POSSIBLE
\`\`\`

## Prisma Engine Query
\`\`\`
${s ? gl(s) : ""}
\`\`\`
`), p = El({ title: r, body: c });
      return `${r}

This is a non-recoverable error which probably happens when the Prisma Query Engine has a panic.

${ee(p)}

If you want the Prisma team to look into it, please open the link above \u{1F64F}
To increase the chance of success, please post your schema and a snippet of
how you used Prisma Client in the issue. 
`;
    }
    function $t({ inlineDatasources: e, overrideDatasources: t, env: r, clientVersion: n }) {
      let i, o = Object.keys(e)[0], s = e[o]?.url, a = t[o]?.url;
      if (o === void 0 ? i = void 0 : a ? i = a : s?.value ? i = s.value : s?.fromEnvVar && (i = r[s.fromEnvVar]), s?.fromEnvVar !== void 0 && i === void 0)
        throw new C(`error: Environment variable not found: ${s.fromEnvVar}.`, n);
      if (i === void 0)
        throw new C("error: Missing URL environment variable, value, or override.", n);
      return i;
    }
    var Vn = class extends Error {
      constructor(r, n) {
        super(r);
        d(this, "clientVersion");
        d(this, "cause");
        this.clientVersion = n.clientVersion, this.cause = n.cause;
      }
      get [Symbol.toStringTag]() {
        return this.name;
      }
    };
    var ue = class extends Vn {
      constructor(r, n) {
        super(r, n);
        d(this, "isRetryable");
        this.isRetryable = n.isRetryable ?? true;
      }
    };
    function A(e, t) {
      return { ...e, isRetryable: t };
    }
    var qt = class extends ue {
      constructor(r) {
        super("This request must be retried", A(r, true));
        d(this, "name", "ForcedRetryError");
        d(this, "code", "P5001");
      }
    };
    x(qt, "ForcedRetryError");
    var lt = class extends ue {
      constructor(r, n) {
        super(r, A(n, false));
        d(this, "name", "InvalidDatasourceError");
        d(this, "code", "P6001");
      }
    };
    x(lt, "InvalidDatasourceError");
    var ut = class extends ue {
      constructor(r, n) {
        super(r, A(n, false));
        d(this, "name", "NotImplementedYetError");
        d(this, "code", "P5004");
      }
    };
    x(ut, "NotImplementedYetError");
    var j = class extends ue {
      constructor(r, n) {
        super(r, n);
        d(this, "response");
        this.response = n.response;
        let i = this.response.headers.get("prisma-request-id");
        if (i) {
          let o = `(The request id was: ${i})`;
          this.message = this.message + " " + o;
        }
      }
    };
    var ct = class extends j {
      constructor(r) {
        super("Schema needs to be uploaded", A(r, true));
        d(this, "name", "SchemaMissingError");
        d(this, "code", "P5005");
      }
    };
    x(ct, "SchemaMissingError");
    var lo = "This request could not be understood by the server";
    var Tr = class extends j {
      constructor(r, n, i) {
        super(n || lo, A(r, false));
        d(this, "name", "BadRequestError");
        d(this, "code", "P5000");
        i && (this.code = i);
      }
    };
    x(Tr, "BadRequestError");
    var Cr = class extends j {
      constructor(r, n) {
        super("Engine not started: healthcheck timeout", A(r, true));
        d(this, "name", "HealthcheckTimeoutError");
        d(this, "code", "P5013");
        d(this, "logs");
        this.logs = n;
      }
    };
    x(Cr, "HealthcheckTimeoutError");
    var Rr = class extends j {
      constructor(r, n, i) {
        super(n, A(r, true));
        d(this, "name", "EngineStartupError");
        d(this, "code", "P5014");
        d(this, "logs");
        this.logs = i;
      }
    };
    x(Rr, "EngineStartupError");
    var Sr = class extends j {
      constructor(r) {
        super("Engine version is not supported", A(r, false));
        d(this, "name", "EngineVersionNotSupportedError");
        d(this, "code", "P5012");
      }
    };
    x(Sr, "EngineVersionNotSupportedError");
    var uo = "Request timed out";
    var Ar = class extends j {
      constructor(r, n = uo) {
        super(n, A(r, false));
        d(this, "name", "GatewayTimeoutError");
        d(this, "code", "P5009");
      }
    };
    x(Ar, "GatewayTimeoutError");
    var Am = "Interactive transaction error";
    var Ir = class extends j {
      constructor(r, n = Am) {
        super(n, A(r, false));
        d(this, "name", "InteractiveTransactionError");
        d(this, "code", "P5015");
      }
    };
    x(Ir, "InteractiveTransactionError");
    var Im = "Request parameters are invalid";
    var kr = class extends j {
      constructor(r, n = Im) {
        super(n, A(r, false));
        d(this, "name", "InvalidRequestError");
        d(this, "code", "P5011");
      }
    };
    x(kr, "InvalidRequestError");
    var co = "Requested resource does not exist";
    var Or = class extends j {
      constructor(r, n = co) {
        super(n, A(r, false));
        d(this, "name", "NotFoundError");
        d(this, "code", "P5003");
      }
    };
    x(Or, "NotFoundError");
    var po = "Unknown server error";
    var Vt = class extends j {
      constructor(r, n, i) {
        super(n || po, A(r, true));
        d(this, "name", "ServerError");
        d(this, "code", "P5006");
        d(this, "logs");
        this.logs = i;
      }
    };
    x(Vt, "ServerError");
    var mo = "Unauthorized, check your connection string";
    var _r = class extends j {
      constructor(r, n = mo) {
        super(n, A(r, false));
        d(this, "name", "UnauthorizedError");
        d(this, "code", "P5007");
      }
    };
    x(_r, "UnauthorizedError");
    var fo = "Usage exceeded, retry again later";
    var Dr = class extends j {
      constructor(r, n = fo) {
        super(n, A(r, true));
        d(this, "name", "UsageExceededError");
        d(this, "code", "P5008");
      }
    };
    x(Dr, "UsageExceededError");
    async function km(e) {
      let t;
      try {
        t = await e.text();
      } catch {
        return { type: "EmptyError" };
      }
      try {
        let r = JSON.parse(t);
        if (typeof r == "string")
          switch (r) {
            case "InternalDataProxyError":
              return { type: "DataProxyError", body: r };
            default:
              return { type: "UnknownTextError", body: r };
          }
        if (typeof r == "object" && r !== null) {
          if ("is_panic" in r && "message" in r && "error_code" in r)
            return { type: "QueryEngineError", body: r };
          if ("EngineNotStarted" in r || "InteractiveTransactionMisrouted" in r || "InvalidRequestError" in r) {
            let n = Object.values(r)[0].reason;
            return typeof n == "string" && !["SchemaMissing", "EngineVersionNotSupported"].includes(n) ? { type: "UnknownJsonError", body: r } : { type: "DataProxyError", body: r };
          }
        }
        return { type: "UnknownJsonError", body: r };
      } catch {
        return t === "" ? { type: "EmptyError" } : { type: "UnknownTextError", body: t };
      }
    }
    async function Nr(e, t) {
      if (e.ok)
        return;
      let r = { clientVersion: t, response: e }, n = await km(e);
      if (n.type === "QueryEngineError")
        throw new te(n.body.message, { code: n.body.error_code, clientVersion: t });
      if (n.type === "DataProxyError") {
        if (n.body === "InternalDataProxyError")
          throw new Vt(r, "Internal Data Proxy error");
        if ("EngineNotStarted" in n.body) {
          if (n.body.EngineNotStarted.reason === "SchemaMissing")
            return new ct(r);
          if (n.body.EngineNotStarted.reason === "EngineVersionNotSupported")
            throw new Sr(r);
          if ("EngineStartupError" in n.body.EngineNotStarted.reason) {
            let { msg: i, logs: o } = n.body.EngineNotStarted.reason.EngineStartupError;
            throw new Rr(r, i, o);
          }
          if ("KnownEngineStartupError" in n.body.EngineNotStarted.reason) {
            let { msg: i, error_code: o } = n.body.EngineNotStarted.reason.KnownEngineStartupError;
            throw new C(i, t, o);
          }
          if ("HealthcheckTimeout" in n.body.EngineNotStarted.reason) {
            let { logs: i } = n.body.EngineNotStarted.reason.HealthcheckTimeout;
            throw new Cr(r, i);
          }
        }
        if ("InteractiveTransactionMisrouted" in n.body) {
          let i = { IDParseError: "Could not parse interactive transaction ID", NoQueryEngineFoundError: "Could not find Query Engine for the specified host and transaction ID", TransactionStartError: "Could not start interactive transaction" };
          throw new Ir(r, i[n.body.InteractiveTransactionMisrouted.reason]);
        }
        if ("InvalidRequestError" in n.body)
          throw new kr(r, n.body.InvalidRequestError.reason);
      }
      if (e.status === 401 || e.status === 403)
        throw new _r(r, jt(mo, n));
      if (e.status === 404)
        return new Or(r, jt(co, n));
      if (e.status === 429)
        throw new Dr(r, jt(fo, n));
      if (e.status === 504)
        throw new Ar(r, jt(uo, n));
      if (e.status >= 500)
        throw new Vt(r, jt(po, n));
      if (e.status >= 400)
        throw new Tr(r, jt(lo, n));
    }
    function jt(e, t) {
      return t.type === "EmptyError" ? e : `${e}: ${JSON.stringify(t)}`;
    }
    function wl(e) {
      let t = Math.pow(2, e) * 50, r = Math.ceil(Math.random() * t) - Math.ceil(t / 2), n = t + r;
      return new Promise((i) => setTimeout(() => i(n), n));
    }
    var Ve = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    function xl(e) {
      let t = new TextEncoder().encode(e), r = "", n = t.byteLength, i = n % 3, o = n - i, s, a, l, u, c;
      for (let p = 0; p < o; p = p + 3)
        c = t[p] << 16 | t[p + 1] << 8 | t[p + 2], s = (c & 16515072) >> 18, a = (c & 258048) >> 12, l = (c & 4032) >> 6, u = c & 63, r += Ve[s] + Ve[a] + Ve[l] + Ve[u];
      return i == 1 ? (c = t[o], s = (c & 252) >> 2, a = (c & 3) << 4, r += Ve[s] + Ve[a] + "==") : i == 2 && (c = t[o] << 8 | t[o + 1], s = (c & 64512) >> 10, a = (c & 1008) >> 4, l = (c & 15) << 2, r += Ve[s] + Ve[a] + Ve[l] + "="), r;
    }
    function Pl(e) {
      if (!!e.generator?.previewFeatures.some((r) => r.toLowerCase().includes("metrics")))
        throw new C("The `metrics` preview feature is not yet available with Accelerate.\nPlease remove `metrics` from the `previewFeatures` in your schema.\n\nMore information about Accelerate: https://pris.ly/d/accelerate", e.clientVersion);
    }
    function Om(e) {
      return e[0] * 1e3 + e[1] / 1e6;
    }
    function go(e) {
      return new Date(Om(e));
    }
    var vl = { "@prisma/debug": "workspace:*", "@prisma/engines-version": "6.5.0-73.173f8d54f8d52e692c7e27e72a88314ec7aeff60", "@prisma/fetch-engine": "workspace:*", "@prisma/get-platform": "workspace:*" };
    var Lr = class extends ue {
      constructor(r, n) {
        super(`Cannot fetch data from service:
${r}`, A(n, true));
        d(this, "name", "RequestError");
        d(this, "code", "P5010");
      }
    };
    x(Lr, "RequestError");
    async function pt(e, t, r = (n) => n) {
      let { clientVersion: n, ...i } = t, o = r(fetch);
      try {
        return await o(e, i);
      } catch (s) {
        let a = s.message ?? "Unknown error";
        throw new Lr(a, { clientVersion: n, cause: s });
      }
    }
    var Dm = /^[1-9][0-9]*\.[0-9]+\.[0-9]+$/;
    var Tl = M("prisma:client:dataproxyEngine");
    async function Nm(e, t) {
      let r = vl["@prisma/engines-version"], n = t.clientVersion ?? "unknown";
      if (process.env.PRISMA_CLIENT_DATA_PROXY_CLIENT_VERSION)
        return process.env.PRISMA_CLIENT_DATA_PROXY_CLIENT_VERSION;
      if (e.includes("accelerate") && n !== "0.0.0" && n !== "in-memory")
        return n;
      let [i, o] = n?.split("-") ?? [];
      if (o === void 0 && Dm.test(i))
        return i;
      if (o !== void 0 || n === "0.0.0" || n === "in-memory") {
        if (e.startsWith("localhost") || e.startsWith("127.0.0.1"))
          return "0.0.0";
        let [s] = r.split("-") ?? [], [a, l, u] = s.split("."), c = Lm(`<=${a}.${l}.${u}`), p = await pt(c, { clientVersion: n });
        if (!p.ok)
          throw new Error(`Failed to fetch stable Prisma version, unpkg.com status ${p.status} ${p.statusText}, response body: ${await p.text() || "<empty body>"}`);
        let m = await p.text();
        Tl("length of body fetched from unpkg.com", m.length);
        let g;
        try {
          g = JSON.parse(m);
        } catch (h) {
          throw console.error("JSON.parse error: body fetched from unpkg.com: ", m), h;
        }
        return g.version;
      }
      throw new ut("Only `major.minor.patch` versions are supported by Accelerate.", { clientVersion: n });
    }
    async function Cl(e, t) {
      let r = await Nm(e, t);
      return Tl("version", r), r;
    }
    function Lm(e) {
      return encodeURI(`https://unpkg.com/prisma@${e}/package.json`);
    }
    var Rl = 3;
    var jn = M("prisma:client:dataproxyEngine");
    var ho = class {
      constructor({ apiKey: t, tracingHelper: r, logLevel: n, logQueries: i, engineHash: o }) {
        d(this, "apiKey");
        d(this, "tracingHelper");
        d(this, "logLevel");
        d(this, "logQueries");
        d(this, "engineHash");
        this.apiKey = t, this.tracingHelper = r, this.logLevel = n, this.logQueries = i, this.engineHash = o;
      }
      build({ traceparent: t, interactiveTransaction: r } = {}) {
        let n = { Authorization: `Bearer ${this.apiKey}`, "Prisma-Engine-Hash": this.engineHash };
        this.tracingHelper.isEnabled() && (n.traceparent = t ?? this.tracingHelper.getTraceParent()), r && (n["X-transaction-id"] = r.id);
        let i = this.buildCaptureSettings();
        return i.length > 0 && (n["X-capture-telemetry"] = i.join(", ")), n;
      }
      buildCaptureSettings() {
        let t = [];
        return this.tracingHelper.isEnabled() && t.push("tracing"), this.logLevel && t.push(this.logLevel), this.logQueries && t.push("query"), t;
      }
    };
    var Fr = class {
      constructor(t) {
        d(this, "name", "DataProxyEngine");
        d(this, "inlineSchema");
        d(this, "inlineSchemaHash");
        d(this, "inlineDatasources");
        d(this, "config");
        d(this, "logEmitter");
        d(this, "env");
        d(this, "clientVersion");
        d(this, "engineHash");
        d(this, "tracingHelper");
        d(this, "remoteClientVersion");
        d(this, "host");
        d(this, "headerBuilder");
        d(this, "startPromise");
        Pl(t), this.config = t, this.env = { ...t.env, ...typeof process < "u" ? process.env : {} }, this.inlineSchema = xl(t.inlineSchema), this.inlineDatasources = t.inlineDatasources, this.inlineSchemaHash = t.inlineSchemaHash, this.clientVersion = t.clientVersion, this.engineHash = t.engineVersion, this.logEmitter = t.logEmitter, this.tracingHelper = t.tracingHelper;
      }
      apiKey() {
        return this.headerBuilder.apiKey;
      }
      version() {
        return this.engineHash;
      }
      async start() {
        this.startPromise !== void 0 && await this.startPromise, this.startPromise = (async () => {
          let [t, r] = this.extractHostAndApiKey();
          this.host = t, this.headerBuilder = new ho({ apiKey: r, tracingHelper: this.tracingHelper, logLevel: this.config.logLevel, logQueries: this.config.logQueries, engineHash: this.engineHash }), this.remoteClientVersion = await Cl(t, this.config), jn("host", this.host);
        })(), await this.startPromise;
      }
      async stop() {
      }
      propagateResponseExtensions(t) {
        t?.logs?.length && t.logs.forEach((r) => {
          switch (r.level) {
            case "debug":
            case "trace":
              jn(r);
              break;
            case "error":
            case "warn":
            case "info": {
              this.logEmitter.emit(r.level, { timestamp: go(r.timestamp), message: r.attributes.message ?? "", target: r.target });
              break;
            }
            case "query": {
              this.logEmitter.emit("query", { query: r.attributes.query ?? "", timestamp: go(r.timestamp), duration: r.attributes.duration_ms ?? 0, params: r.attributes.params ?? "", target: r.target });
              break;
            }
            default:
              r.level;
          }
        }), t?.traces?.length && this.tracingHelper.dispatchEngineSpans(t.traces);
      }
      onBeforeExit() {
        throw new Error('"beforeExit" hook is not applicable to the remote query engine');
      }
      async url(t) {
        return await this.start(), `https://${this.host}/${this.remoteClientVersion}/${this.inlineSchemaHash}/${t}`;
      }
      async uploadSchema() {
        let t = { name: "schemaUpload", internal: true };
        return this.tracingHelper.runInChildSpan(t, async () => {
          let r = await pt(await this.url("schema"), { method: "PUT", headers: this.headerBuilder.build(), body: this.inlineSchema, clientVersion: this.clientVersion });
          r.ok || jn("schema response status", r.status);
          let n = await Nr(r, this.clientVersion);
          if (n)
            throw this.logEmitter.emit("warn", { message: `Error while uploading schema: ${n.message}`, timestamp: /* @__PURE__ */ new Date(), target: "" }), n;
          this.logEmitter.emit("info", { message: `Schema (re)uploaded (hash: ${this.inlineSchemaHash})`, timestamp: /* @__PURE__ */ new Date(), target: "" });
        });
      }
      request(t, { traceparent: r, interactiveTransaction: n, customDataProxyFetch: i }) {
        return this.requestInternal({ body: t, traceparent: r, interactiveTransaction: n, customDataProxyFetch: i });
      }
      async requestBatch(t, { traceparent: r, transaction: n, customDataProxyFetch: i }) {
        let o = n?.kind === "itx" ? n.options : void 0, s = Lt(t, n);
        return (await this.requestInternal({ body: s, customDataProxyFetch: i, interactiveTransaction: o, traceparent: r })).map((l) => (l.extensions && this.propagateResponseExtensions(l.extensions), "errors" in l ? this.convertProtocolErrorsToClientError(l.errors) : l));
      }
      requestInternal({ body: t, traceparent: r, customDataProxyFetch: n, interactiveTransaction: i }) {
        return this.withRetry({ actionGerund: "querying", callback: async ({ logHttpCall: o }) => {
          let s = i ? `${i.payload.endpoint}/graphql` : await this.url("graphql");
          o(s);
          let a = await pt(s, { method: "POST", headers: this.headerBuilder.build({ traceparent: r, interactiveTransaction: i }), body: JSON.stringify(t), clientVersion: this.clientVersion }, n);
          a.ok || jn("graphql response status", a.status), await this.handleError(await Nr(a, this.clientVersion));
          let l = await a.json();
          if (l.extensions && this.propagateResponseExtensions(l.extensions), "errors" in l)
            throw this.convertProtocolErrorsToClientError(l.errors);
          return "batchResult" in l ? l.batchResult : l;
        } });
      }
      async transaction(t, r, n) {
        let i = { start: "starting", commit: "committing", rollback: "rolling back" };
        return this.withRetry({ actionGerund: `${i[t]} transaction`, callback: async ({ logHttpCall: o }) => {
          if (t === "start") {
            let s = JSON.stringify({ max_wait: n.maxWait, timeout: n.timeout, isolation_level: n.isolationLevel }), a = await this.url("transaction/start");
            o(a);
            let l = await pt(a, { method: "POST", headers: this.headerBuilder.build({ traceparent: r.traceparent }), body: s, clientVersion: this.clientVersion });
            await this.handleError(await Nr(l, this.clientVersion));
            let u = await l.json(), { extensions: c } = u;
            c && this.propagateResponseExtensions(c);
            let p = u.id, m = u["data-proxy"].endpoint;
            return { id: p, payload: { endpoint: m } };
          } else {
            let s = `${n.payload.endpoint}/${t}`;
            o(s);
            let a = await pt(s, { method: "POST", headers: this.headerBuilder.build({ traceparent: r.traceparent }), clientVersion: this.clientVersion });
            await this.handleError(await Nr(a, this.clientVersion));
            let l = await a.json(), { extensions: u } = l;
            u && this.propagateResponseExtensions(u);
            return;
          }
        } });
      }
      extractHostAndApiKey() {
        let t = { clientVersion: this.clientVersion }, r = Object.keys(this.inlineDatasources)[0], n = $t({ inlineDatasources: this.inlineDatasources, overrideDatasources: this.config.overrideDatasources, clientVersion: this.clientVersion, env: this.env }), i;
        try {
          i = new URL(n);
        } catch {
          throw new lt(`Error validating datasource \`${r}\`: the URL must start with the protocol \`prisma://\``, t);
        }
        let { protocol: o, host: s, searchParams: a } = i;
        if (o !== "prisma:" && o !== Xr)
          throw new lt(`Error validating datasource \`${r}\`: the URL must start with the protocol \`prisma://\``, t);
        let l = a.get("api_key");
        if (l === null || l.length < 1)
          throw new lt(`Error validating datasource \`${r}\`: the URL must contain a valid API key`, t);
        return [s, l];
      }
      metrics() {
        throw new ut("Metrics are not yet supported for Accelerate", { clientVersion: this.clientVersion });
      }
      async withRetry(t) {
        for (let r = 0; ; r++) {
          let n = (i) => {
            this.logEmitter.emit("info", { message: `Calling ${i} (n=${r})`, timestamp: /* @__PURE__ */ new Date(), target: "" });
          };
          try {
            return await t.callback({ logHttpCall: n });
          } catch (i) {
            if (!(i instanceof ue) || !i.isRetryable)
              throw i;
            if (r >= Rl)
              throw i instanceof qt ? i.cause : i;
            this.logEmitter.emit("warn", { message: `Attempt ${r + 1}/${Rl} failed for ${t.actionGerund}: ${i.message ?? "(unknown)"}`, timestamp: /* @__PURE__ */ new Date(), target: "" });
            let o = await wl(r);
            this.logEmitter.emit("warn", { message: `Retrying after ${o}ms`, timestamp: /* @__PURE__ */ new Date(), target: "" });
          }
        }
      }
      async handleError(t) {
        if (t instanceof ct)
          throw await this.uploadSchema(), new qt({ clientVersion: this.clientVersion, cause: t });
        if (t)
          throw t;
      }
      convertProtocolErrorsToClientError(t) {
        return t.length === 1 ? Ft(t[0], this.config.clientVersion, this.config.activeProvider) : new U(JSON.stringify(t), { clientVersion: this.config.clientVersion });
      }
      applyPendingMigrations() {
        throw new Error("Method not implemented.");
      }
    };
    function Sl(e) {
      if (e?.kind === "itx")
        return e.options.id;
    }
    var Eo = D(require("os"));
    var Al = D(require("path"));
    var yo = Symbol("PrismaLibraryEngineCache");
    function Fm() {
      let e = globalThis;
      return e[yo] === void 0 && (e[yo] = {}), e[yo];
    }
    function Mm(e) {
      let t = Fm();
      if (t[e] !== void 0)
        return t[e];
      let r = Al.default.toNamespacedPath(e), n = { exports: {} }, i = 0;
      return process.platform !== "win32" && (i = Eo.default.constants.dlopen.RTLD_LAZY | Eo.default.constants.dlopen.RTLD_DEEPBIND), process.dlopen(n, r, i), t[e] = n.exports, n.exports;
    }
    var Il = { async loadLibrary(e) {
      let t = await ci(), r = await ml("library", e);
      try {
        return e.tracingHelper.runInChildSpan({ name: "loadLibrary", internal: true }, () => Mm(r));
      } catch (n) {
        let i = vi({ e: n, platformInfo: t, id: r });
        throw new C(i, e.clientVersion);
      }
    } };
    var bo;
    var kl = { async loadLibrary(e) {
      let { clientVersion: t, adapter: r, engineWasm: n } = e;
      if (r === void 0)
        throw new C(`The \`adapter\` option for \`PrismaClient\` is required in this context (${Fn().prettyName})`, t);
      if (n === void 0)
        throw new C("WASM engine was unexpectedly `undefined`", t);
      bo === void 0 && (bo = (async () => {
        let o = n.getRuntime(), s = await n.getQueryEngineWasmModule();
        if (s == null)
          throw new C("The loaded wasm module was unexpectedly `undefined` or `null` once loaded", t);
        let a = { "./query_engine_bg.js": o }, l = new WebAssembly.Instance(s, a), u = l.exports.__wbindgen_start;
        return o.__wbg_set_wasm(l.exports), u(), o.QueryEngine;
      })());
      let i = await bo;
      return { debugPanic() {
        return Promise.reject("{}");
      }, dmmf() {
        return Promise.resolve("{}");
      }, version() {
        return { commit: "unknown", version: "unknown" };
      }, QueryEngine: i };
    } };
    var $m = "P2036";
    var ke = M("prisma:client:libraryEngine");
    function qm(e) {
      return e.item_type === "query" && "query" in e;
    }
    function Vm(e) {
      return "level" in e ? e.level === "error" && e.message === "PANIC" : false;
    }
    var Ol = [...ii, "native"];
    var jm = 0xffffffffffffffffn;
    var wo = 1n;
    function Bm() {
      let e = wo++;
      return wo > jm && (wo = 1n), e;
    }
    var Bt = class {
      constructor(t, r) {
        d(this, "name", "LibraryEngine");
        d(this, "engine");
        d(this, "libraryInstantiationPromise");
        d(this, "libraryStartingPromise");
        d(this, "libraryStoppingPromise");
        d(this, "libraryStarted");
        d(this, "executingQueryPromise");
        d(this, "config");
        d(this, "QueryEngineConstructor");
        d(this, "libraryLoader");
        d(this, "library");
        d(this, "logEmitter");
        d(this, "libQueryEnginePath");
        d(this, "binaryTarget");
        d(this, "datasourceOverrides");
        d(this, "datamodel");
        d(this, "logQueries");
        d(this, "logLevel");
        d(this, "lastQuery");
        d(this, "loggerRustPanic");
        d(this, "tracingHelper");
        d(this, "versionInfo");
        this.libraryLoader = r ?? Il, t.engineWasm !== void 0 && (this.libraryLoader = r ?? kl), this.config = t, this.libraryStarted = false, this.logQueries = t.logQueries ?? false, this.logLevel = t.logLevel ?? "error", this.logEmitter = t.logEmitter, this.datamodel = t.inlineSchema, this.tracingHelper = t.tracingHelper, t.enableDebugLogs && (this.logLevel = "debug");
        let n = Object.keys(t.overrideDatasources)[0], i = t.overrideDatasources[n]?.url;
        n !== void 0 && i !== void 0 && (this.datasourceOverrides = { [n]: i }), this.libraryInstantiationPromise = this.instantiateLibrary();
      }
      wrapEngine(t) {
        return { applyPendingMigrations: t.applyPendingMigrations?.bind(t), commitTransaction: this.withRequestId(t.commitTransaction.bind(t)), connect: this.withRequestId(t.connect.bind(t)), disconnect: this.withRequestId(t.disconnect.bind(t)), metrics: t.metrics?.bind(t), query: this.withRequestId(t.query.bind(t)), rollbackTransaction: this.withRequestId(t.rollbackTransaction.bind(t)), sdlSchema: t.sdlSchema?.bind(t), startTransaction: this.withRequestId(t.startTransaction.bind(t)), trace: t.trace.bind(t) };
      }
      withRequestId(t) {
        return async (...r) => {
          let n = Bm().toString();
          try {
            return await t(...r, n);
          } finally {
            if (this.tracingHelper.isEnabled()) {
              let i = await this.engine?.trace(n);
              if (i) {
                let o = JSON.parse(i);
                this.tracingHelper.dispatchEngineSpans(o.spans);
              }
            }
          }
        };
      }
      async applyPendingMigrations() {
        throw new Error("Cannot call this method from this type of engine instance");
      }
      async transaction(t, r, n) {
        await this.start();
        let i = JSON.stringify(r), o;
        if (t === "start") {
          let a = JSON.stringify({ max_wait: n.maxWait, timeout: n.timeout, isolation_level: n.isolationLevel });
          o = await this.engine?.startTransaction(a, i);
        } else
          t === "commit" ? o = await this.engine?.commitTransaction(n.id, i) : t === "rollback" && (o = await this.engine?.rollbackTransaction(n.id, i));
        let s = this.parseEngineResponse(o);
        if (Um(s)) {
          let a = this.getExternalAdapterError(s);
          throw a ? a.error : new te(s.message, { code: s.error_code, clientVersion: this.config.clientVersion, meta: s.meta });
        } else if (typeof s.message == "string")
          throw new U(s.message, { clientVersion: this.config.clientVersion });
        return s;
      }
      async instantiateLibrary() {
        if (ke("internalSetup"), this.libraryInstantiationPromise)
          return this.libraryInstantiationPromise;
        ni(), this.binaryTarget = await this.getCurrentBinaryTarget(), await this.tracingHelper.runInChildSpan("load_engine", () => this.loadEngine()), this.version();
      }
      async getCurrentBinaryTarget() {
        {
          if (this.binaryTarget)
            return this.binaryTarget;
          let t = await this.tracingHelper.runInChildSpan("detect_platform", () => ot());
          if (!Ol.includes(t))
            throw new C(`Unknown ${fe("PRISMA_QUERY_ENGINE_LIBRARY")} ${fe(Y(t))}. Possible binaryTargets: ${je(Ol.join(", "))} or a path to the query engine library.
You may have to run ${je("prisma generate")} for your changes to take effect.`, this.config.clientVersion);
          return t;
        }
      }
      parseEngineResponse(t) {
        if (!t)
          throw new U("Response from the Engine was empty", { clientVersion: this.config.clientVersion });
        try {
          return JSON.parse(t);
        } catch {
          throw new U("Unable to JSON.parse response from engine", { clientVersion: this.config.clientVersion });
        }
      }
      async loadEngine() {
        if (!this.engine) {
          this.QueryEngineConstructor || (this.library = await this.libraryLoader.loadLibrary(this.config), this.QueryEngineConstructor = this.library.QueryEngine);
          try {
            let t = new WeakRef(this), { adapter: r } = this.config;
            r && ke("Using driver adapter: %O", r), this.engine = this.wrapEngine(new this.QueryEngineConstructor({ datamodel: this.datamodel, env: process.env, logQueries: this.config.logQueries ?? false, ignoreEnvVarErrors: true, datasourceOverrides: this.datasourceOverrides ?? {}, logLevel: this.logLevel, configDir: this.config.cwd, engineProtocol: "json", enableTracing: this.tracingHelper.isEnabled() }, (n) => {
              t.deref()?.logger(n);
            }, r));
          } catch (t) {
            let r = t, n = this.parseInitError(r.message);
            throw typeof n == "string" ? r : new C(n.message, this.config.clientVersion, n.error_code);
          }
        }
      }
      logger(t) {
        let r = this.parseEngineResponse(t);
        r && (r.level = r?.level.toLowerCase() ?? "unknown", qm(r) ? this.logEmitter.emit("query", { timestamp: /* @__PURE__ */ new Date(), query: r.query, params: r.params, duration: Number(r.duration_ms), target: r.module_path }) : Vm(r) ? this.loggerRustPanic = new pe(xo(this, `${r.message}: ${r.reason} in ${r.file}:${r.line}:${r.column}`), this.config.clientVersion) : this.logEmitter.emit(r.level, { timestamp: /* @__PURE__ */ new Date(), message: r.message, target: r.module_path }));
      }
      parseInitError(t) {
        try {
          return JSON.parse(t);
        } catch {
        }
        return t;
      }
      parseRequestError(t) {
        try {
          return JSON.parse(t);
        } catch {
        }
        return t;
      }
      onBeforeExit() {
        throw new Error('"beforeExit" hook is not applicable to the library engine since Prisma 5.0.0, it is only relevant and implemented for the binary engine. Please add your event listener to the `process` object directly instead.');
      }
      async start() {
        if (await this.libraryInstantiationPromise, await this.libraryStoppingPromise, this.libraryStartingPromise)
          return ke(`library already starting, this.libraryStarted: ${this.libraryStarted}`), this.libraryStartingPromise;
        if (this.libraryStarted)
          return;
        let t = async () => {
          ke("library starting");
          try {
            let r = { traceparent: this.tracingHelper.getTraceParent() };
            await this.engine?.connect(JSON.stringify(r)), this.libraryStarted = true, ke("library started");
          } catch (r) {
            let n = this.parseInitError(r.message);
            throw typeof n == "string" ? r : new C(n.message, this.config.clientVersion, n.error_code);
          } finally {
            this.libraryStartingPromise = void 0;
          }
        };
        return this.libraryStartingPromise = this.tracingHelper.runInChildSpan("connect", t), this.libraryStartingPromise;
      }
      async stop() {
        if (await this.libraryStartingPromise, await this.executingQueryPromise, this.libraryStoppingPromise)
          return ke("library is already stopping"), this.libraryStoppingPromise;
        if (!this.libraryStarted)
          return;
        let t = async () => {
          await new Promise((n) => setTimeout(n, 5)), ke("library stopping");
          let r = { traceparent: this.tracingHelper.getTraceParent() };
          await this.engine?.disconnect(JSON.stringify(r)), this.libraryStarted = false, this.libraryStoppingPromise = void 0, ke("library stopped");
        };
        return this.libraryStoppingPromise = this.tracingHelper.runInChildSpan("disconnect", t), this.libraryStoppingPromise;
      }
      version() {
        return this.versionInfo = this.library?.version(), this.versionInfo?.version ?? "unknown";
      }
      debugPanic(t) {
        return this.library?.debugPanic(t);
      }
      async request(t, { traceparent: r, interactiveTransaction: n }) {
        ke(`sending request, this.libraryStarted: ${this.libraryStarted}`);
        let i = JSON.stringify({ traceparent: r }), o = JSON.stringify(t);
        try {
          await this.start(), this.executingQueryPromise = this.engine?.query(o, i, n?.id), this.lastQuery = o;
          let s = this.parseEngineResponse(await this.executingQueryPromise);
          if (s.errors)
            throw s.errors.length === 1 ? this.buildQueryError(s.errors[0]) : new U(JSON.stringify(s.errors), { clientVersion: this.config.clientVersion });
          if (this.loggerRustPanic)
            throw this.loggerRustPanic;
          return { data: s };
        } catch (s) {
          if (s instanceof C)
            throw s;
          if (s.code === "GenericFailure" && s.message?.startsWith("PANIC:"))
            throw new pe(xo(this, s.message), this.config.clientVersion);
          let a = this.parseRequestError(s.message);
          throw typeof a == "string" ? s : new U(`${a.message}
${a.backtrace}`, { clientVersion: this.config.clientVersion });
        }
      }
      async requestBatch(t, { transaction: r, traceparent: n }) {
        ke("requestBatch");
        let i = Lt(t, r);
        await this.start(), this.lastQuery = JSON.stringify(i), this.executingQueryPromise = this.engine.query(this.lastQuery, JSON.stringify({ traceparent: n }), Sl(r));
        let o = await this.executingQueryPromise, s = this.parseEngineResponse(o);
        if (s.errors)
          throw s.errors.length === 1 ? this.buildQueryError(s.errors[0]) : new U(JSON.stringify(s.errors), { clientVersion: this.config.clientVersion });
        let { batchResult: a, errors: l } = s;
        if (Array.isArray(a))
          return a.map((u) => u.errors && u.errors.length > 0 ? this.loggerRustPanic ?? this.buildQueryError(u.errors[0]) : { data: u });
        throw l && l.length === 1 ? new Error(l[0].error) : new Error(JSON.stringify(s));
      }
      buildQueryError(t) {
        if (t.user_facing_error.is_panic)
          return new pe(xo(this, t.user_facing_error.message), this.config.clientVersion);
        let r = this.getExternalAdapterError(t.user_facing_error);
        return r ? r.error : Ft(t, this.config.clientVersion, this.config.activeProvider);
      }
      getExternalAdapterError(t) {
        if (t.error_code === $m && this.config.adapter) {
          let r = t.meta?.id;
          en(typeof r == "number", "Malformed external JS error received from the engine");
          let n = this.config.adapter.errorRegistry.consumeError(r);
          return en(n, "External error with reported id was not registered"), n;
        }
      }
      async metrics(t) {
        await this.start();
        let r = await this.engine.metrics(JSON.stringify(t));
        return t.format === "prometheus" ? r : this.parseEngineResponse(r);
      }
    };
    function Um(e) {
      return typeof e == "object" && e !== null && e.error_code !== void 0;
    }
    function xo(e, t) {
      return bl({ binaryTarget: e.binaryTarget, title: t, version: e.config.clientVersion, engineVersion: e.versionInfo?.commit, database: e.config.activeProvider, query: e.lastQuery });
    }
    function _l({ copyEngine: e = true }, t) {
      let r;
      try {
        r = $t({ inlineDatasources: t.inlineDatasources, overrideDatasources: t.overrideDatasources, env: { ...t.env, ...process.env }, clientVersion: t.clientVersion });
      } catch {
      }
      let n = !!(r?.startsWith("prisma://") || Ii(r));
      e && n && or("recommend--no-engine", "In production, we recommend using `prisma generate --no-engine` (See: `prisma generate --help`)");
      let i = Et(t.generator), o = n || !e, s = !!t.adapter, a = i === "library", l = i === "binary", u = i === "client";
      if (o && s || s && false) {
        let c;
        throw e ? r?.startsWith("prisma://") ? c = ["Prisma Client was configured to use the `adapter` option but the URL was a `prisma://` URL.", "Please either use the `prisma://` URL or remove the `adapter` from the Prisma Client constructor."] : c = ["Prisma Client was configured to use both the `adapter` and Accelerate, please chose one."] : c = ["Prisma Client was configured to use the `adapter` option but `prisma generate` was run with `--no-engine`.", "Please run `prisma generate` without `--no-engine` to be able to use Prisma Client with the adapter."], new re(c.join(`
`), { clientVersion: t.clientVersion });
      }
      return o ? new Fr(t) : a ? new Bt(t) : new Bt(t);
    }
    function Bn({ generator: e }) {
      return e?.previewFeatures ?? [];
    }
    var Dl = (e) => ({ command: e });
    var Nl = (e) => e.strings.reduce((t, r, n) => `${t}@P${n}${r}`);
    function Ut(e) {
      try {
        return Ll(e, "fast");
      } catch {
        return Ll(e, "slow");
      }
    }
    function Ll(e, t) {
      return JSON.stringify(e.map((r) => Ml(r, t)));
    }
    function Ml(e, t) {
      if (Array.isArray(e))
        return e.map((r) => Ml(r, t));
      if (typeof e == "bigint")
        return { prisma__type: "bigint", prisma__value: e.toString() };
      if (Tt(e))
        return { prisma__type: "date", prisma__value: e.toJSON() };
      if (Ce.isDecimal(e))
        return { prisma__type: "decimal", prisma__value: e.toJSON() };
      if (Buffer.isBuffer(e))
        return { prisma__type: "bytes", prisma__value: e.toString("base64") };
      if (Qm(e))
        return { prisma__type: "bytes", prisma__value: Buffer.from(e).toString("base64") };
      if (ArrayBuffer.isView(e)) {
        let { buffer: r, byteOffset: n, byteLength: i } = e;
        return { prisma__type: "bytes", prisma__value: Buffer.from(r, n, i).toString("base64") };
      }
      return typeof e == "object" && t === "slow" ? $l(e) : e;
    }
    function Qm(e) {
      return e instanceof ArrayBuffer || e instanceof SharedArrayBuffer ? true : typeof e == "object" && e !== null ? e[Symbol.toStringTag] === "ArrayBuffer" || e[Symbol.toStringTag] === "SharedArrayBuffer" : false;
    }
    function $l(e) {
      if (typeof e != "object" || e === null)
        return e;
      if (typeof e.toJSON == "function")
        return e.toJSON();
      if (Array.isArray(e))
        return e.map(Fl);
      let t = {};
      for (let r of Object.keys(e))
        t[r] = Fl(e[r]);
      return t;
    }
    function Fl(e) {
      return typeof e == "bigint" ? e.toString() : $l(e);
    }
    var Gm = /^(\s*alter\s)/i;
    var ql = M("prisma:client");
    function Po(e, t, r, n) {
      if (!(e !== "postgresql" && e !== "cockroachdb") && r.length > 0 && Gm.exec(t))
        throw new Error(`Running ALTER using ${n} is not supported
Using the example below you can still execute your query with Prisma, but please note that it is vulnerable to SQL injection attacks and requires you to take care of input sanitization.

Example:
  await prisma.$executeRawUnsafe(\`ALTER USER prisma WITH PASSWORD '\${password}'\`)

More Information: https://pris.ly/d/execute-raw
`);
    }
    var vo = ({ clientMethod: e, activeProvider: t }) => (r) => {
      let n = "", i;
      if (On(r))
        n = r.sql, i = { values: Ut(r.values), __prismaRawParameters__: true };
      else if (Array.isArray(r)) {
        let [o, ...s] = r;
        n = o, i = { values: Ut(s || []), __prismaRawParameters__: true };
      } else
        switch (t) {
          case "sqlite":
          case "mysql": {
            n = r.sql, i = { values: Ut(r.values), __prismaRawParameters__: true };
            break;
          }
          case "cockroachdb":
          case "postgresql":
          case "postgres": {
            n = r.text, i = { values: Ut(r.values), __prismaRawParameters__: true };
            break;
          }
          case "sqlserver": {
            n = Nl(r), i = { values: Ut(r.values), __prismaRawParameters__: true };
            break;
          }
          default:
            throw new Error(`The ${t} provider does not support ${e}`);
        }
      return i?.values ? ql(`prisma.${e}(${n}, ${i.values})`) : ql(`prisma.${e}(${n})`), { query: n, parameters: i };
    };
    var Vl = { requestArgsToMiddlewareArgs(e) {
      return [e.strings, ...e.values];
    }, middlewareArgsToRequestArgs(e) {
      let [t, ...r] = e;
      return new le(t, r);
    } };
    var jl = { requestArgsToMiddlewareArgs(e) {
      return [e];
    }, middlewareArgsToRequestArgs(e) {
      return e[0];
    } };
    function To(e) {
      return function(r, n) {
        let i, o = (s = e) => {
          try {
            return s === void 0 || s?.kind === "itx" ? i ?? (i = Bl(r(s))) : Bl(r(s));
          } catch (a) {
            return Promise.reject(a);
          }
        };
        return { get spec() {
          return n;
        }, then(s, a) {
          return o().then(s, a);
        }, catch(s) {
          return o().catch(s);
        }, finally(s) {
          return o().finally(s);
        }, requestTransaction(s) {
          let a = o(s);
          return a.requestTransaction ? a.requestTransaction(s) : a;
        }, [Symbol.toStringTag]: "PrismaPromise" };
      };
    }
    function Bl(e) {
      return typeof e.then == "function" ? e : Promise.resolve(e);
    }
    var Jm = Ei.split(".")[0];
    var Wm = { isEnabled() {
      return false;
    }, getTraceParent() {
      return "00-10-10-00";
    }, dispatchEngineSpans() {
    }, getActiveContext() {
    }, runInChildSpan(e, t) {
      return t();
    } };
    var Co = class {
      isEnabled() {
        return this.getGlobalTracingHelper().isEnabled();
      }
      getTraceParent(t) {
        return this.getGlobalTracingHelper().getTraceParent(t);
      }
      dispatchEngineSpans(t) {
        return this.getGlobalTracingHelper().dispatchEngineSpans(t);
      }
      getActiveContext() {
        return this.getGlobalTracingHelper().getActiveContext();
      }
      runInChildSpan(t, r) {
        return this.getGlobalTracingHelper().runInChildSpan(t, r);
      }
      getGlobalTracingHelper() {
        let t = globalThis[`V${Jm}_PRISMA_INSTRUMENTATION`], r = globalThis.PRISMA_INSTRUMENTATION;
        return t?.helper ?? r?.helper ?? Wm;
      }
    };
    function Ul() {
      return new Co();
    }
    function Ql(e, t = () => {
    }) {
      let r, n = new Promise((i) => r = i);
      return { then(i) {
        return --e === 0 && r(t()), i?.(n);
      } };
    }
    function Gl(e) {
      return typeof e == "string" ? e : e.reduce((t, r) => {
        let n = typeof r == "string" ? r : r.level;
        return n === "query" ? t : t && (r === "info" || t === "info") ? "info" : n;
      }, void 0);
    }
    var Un = class {
      constructor() {
        d(this, "_middlewares", []);
      }
      use(t) {
        this._middlewares.push(t);
      }
      get(t) {
        return this._middlewares[t];
      }
      has(t) {
        return !!this._middlewares[t];
      }
      length() {
        return this._middlewares.length;
      }
    };
    var Wl = D(Li());
    function Qn(e) {
      return typeof e.batchRequestIdx == "number";
    }
    function Jl(e) {
      if (e.action !== "findUnique" && e.action !== "findUniqueOrThrow")
        return;
      let t = [];
      return e.modelName && t.push(e.modelName), e.query.arguments && t.push(Ro(e.query.arguments)), t.push(Ro(e.query.selection)), t.join("");
    }
    function Ro(e) {
      return `(${Object.keys(e).sort().map((r) => {
        let n = e[r];
        return typeof n == "object" && n !== null ? `(${r} ${Ro(n)})` : r;
      }).join(" ")})`;
    }
    var Hm = { aggregate: false, aggregateRaw: false, createMany: true, createManyAndReturn: true, createOne: true, deleteMany: true, deleteOne: true, executeRaw: true, findFirst: false, findFirstOrThrow: false, findMany: false, findRaw: false, findUnique: false, findUniqueOrThrow: false, groupBy: false, queryRaw: false, runCommandRaw: true, updateMany: true, updateManyAndReturn: true, updateOne: true, upsertOne: true };
    function So(e) {
      return Hm[e];
    }
    var Gn = class {
      constructor(t) {
        this.options = t;
        d(this, "batches");
        d(this, "tickActive", false);
        this.batches = {};
      }
      request(t) {
        let r = this.options.batchBy(t);
        return r ? (this.batches[r] || (this.batches[r] = [], this.tickActive || (this.tickActive = true, process.nextTick(() => {
          this.dispatchBatches(), this.tickActive = false;
        }))), new Promise((n, i) => {
          this.batches[r].push({ request: t, resolve: n, reject: i });
        })) : this.options.singleLoader(t);
      }
      dispatchBatches() {
        for (let t in this.batches) {
          let r = this.batches[t];
          delete this.batches[t], r.length === 1 ? this.options.singleLoader(r[0].request).then((n) => {
            n instanceof Error ? r[0].reject(n) : r[0].resolve(n);
          }).catch((n) => {
            r[0].reject(n);
          }) : (r.sort((n, i) => this.options.batchOrder(n.request, i.request)), this.options.batchLoader(r.map((n) => n.request)).then((n) => {
            if (n instanceof Error)
              for (let i = 0; i < r.length; i++)
                r[i].reject(n);
            else
              for (let i = 0; i < r.length; i++) {
                let o = n[i];
                o instanceof Error ? r[i].reject(o) : r[i].resolve(o);
              }
          }).catch((n) => {
            for (let i = 0; i < r.length; i++)
              r[i].reject(n);
          }));
        }
      }
      get [Symbol.toStringTag]() {
        return "DataLoader";
      }
    };
    function dt(e, t) {
      if (t === null)
        return t;
      switch (e) {
        case "bigint":
          return BigInt(t);
        case "bytes": {
          let { buffer: r, byteOffset: n, byteLength: i } = Buffer.from(t, "base64");
          return new Uint8Array(r, n, i);
        }
        case "decimal":
          return new Ce(t);
        case "datetime":
        case "date":
          return new Date(t);
        case "time":
          return /* @__PURE__ */ new Date(`1970-01-01T${t}Z`);
        case "bigint-array":
          return t.map((r) => dt("bigint", r));
        case "bytes-array":
          return t.map((r) => dt("bytes", r));
        case "decimal-array":
          return t.map((r) => dt("decimal", r));
        case "datetime-array":
          return t.map((r) => dt("datetime", r));
        case "date-array":
          return t.map((r) => dt("date", r));
        case "time-array":
          return t.map((r) => dt("time", r));
        default:
          return t;
      }
    }
    function Jn(e) {
      let t = [], r = Km(e);
      for (let n = 0; n < e.rows.length; n++) {
        let i = e.rows[n], o = { ...r };
        for (let s = 0; s < i.length; s++)
          o[e.columns[s]] = dt(e.types[s], i[s]);
        t.push(o);
      }
      return t;
    }
    function Km(e) {
      let t = {};
      for (let r = 0; r < e.columns.length; r++)
        t[e.columns[r]] = null;
      return t;
    }
    var Ym = M("prisma:client:request_handler");
    var Wn = class {
      constructor(t, r) {
        d(this, "client");
        d(this, "dataloader");
        d(this, "logEmitter");
        this.logEmitter = r, this.client = t, this.dataloader = new Gn({ batchLoader: tl(async ({ requests: n, customDataProxyFetch: i }) => {
          let { transaction: o, otelParentCtx: s } = n[0], a = n.map((p) => p.protocolQuery), l = this.client._tracingHelper.getTraceParent(s), u = n.some((p) => So(p.protocolQuery.action));
          return (await this.client._engine.requestBatch(a, { traceparent: l, transaction: zm(o), containsWrite: u, customDataProxyFetch: i })).map((p, m) => {
            if (p instanceof Error)
              return p;
            try {
              return this.mapQueryEngineResult(n[m], p);
            } catch (g) {
              return g;
            }
          });
        }), singleLoader: async (n) => {
          let i = n.transaction?.kind === "itx" ? Hl(n.transaction) : void 0, o = await this.client._engine.request(n.protocolQuery, { traceparent: this.client._tracingHelper.getTraceParent(), interactiveTransaction: i, isWrite: So(n.protocolQuery.action), customDataProxyFetch: n.customDataProxyFetch });
          return this.mapQueryEngineResult(n, o);
        }, batchBy: (n) => n.transaction?.id ? `transaction-${n.transaction.id}` : Jl(n.protocolQuery), batchOrder(n, i) {
          return n.transaction?.kind === "batch" && i.transaction?.kind === "batch" ? n.transaction.index - i.transaction.index : 0;
        } });
      }
      async request(t) {
        try {
          return await this.dataloader.request(t);
        } catch (r) {
          let { clientMethod: n, callsite: i, transaction: o, args: s, modelName: a } = t;
          this.handleAndLogRequestError({ error: r, clientMethod: n, callsite: i, transaction: o, args: s, modelName: a, globalOmit: t.globalOmit });
        }
      }
      mapQueryEngineResult({ dataPath: t, unpacker: r }, n) {
        let i = n?.data, o = this.unpack(i, t, r);
        return process.env.PRISMA_CLIENT_GET_TIME ? { data: o } : o;
      }
      handleAndLogRequestError(t) {
        try {
          this.handleRequestError(t);
        } catch (r) {
          throw this.logEmitter && this.logEmitter.emit("error", { message: r.message, target: t.clientMethod, timestamp: /* @__PURE__ */ new Date() }), r;
        }
      }
      handleRequestError({ error: t, clientMethod: r, callsite: n, transaction: i, args: o, modelName: s, globalOmit: a }) {
        if (Ym(t), Zm(t, i))
          throw t;
        if (t instanceof te && Xm(t)) {
          let u = Kl(t.meta);
          Cn({ args: o, errors: [u], callsite: n, errorFormat: this.client._errorFormat, originalMethod: r, clientVersion: this.client._clientVersion, globalOmit: a });
        }
        let l = t.message;
        if (n && (l = gn({ callsite: n, originalMethod: r, isPanic: t.isPanic, showColors: this.client._errorFormat === "pretty", message: l })), l = this.sanitizeMessage(l), t.code) {
          let u = s ? { modelName: s, ...t.meta } : t.meta;
          throw new te(l, { code: t.code, clientVersion: this.client._clientVersion, meta: u, batchRequestIdx: t.batchRequestIdx });
        } else {
          if (t.isPanic)
            throw new pe(l, this.client._clientVersion);
          if (t instanceof U)
            throw new U(l, { clientVersion: this.client._clientVersion, batchRequestIdx: t.batchRequestIdx });
          if (t instanceof C)
            throw new C(l, this.client._clientVersion);
          if (t instanceof pe)
            throw new pe(l, this.client._clientVersion);
        }
        throw t.clientVersion = this.client._clientVersion, t;
      }
      sanitizeMessage(t) {
        return this.client._errorFormat && this.client._errorFormat !== "pretty" ? (0, Wl.default)(t) : t;
      }
      unpack(t, r, n) {
        if (!t || (t.data && (t = t.data), !t))
          return t;
        let i = Object.keys(t)[0], o = Object.values(t)[0], s = r.filter((u) => u !== "select" && u !== "include"), a = no(o, s), l = i === "queryRaw" ? Jn(a) : Pt(a);
        return n ? n(l) : l;
      }
      get [Symbol.toStringTag]() {
        return "RequestHandler";
      }
    };
    function zm(e) {
      if (e) {
        if (e.kind === "batch")
          return { kind: "batch", options: { isolationLevel: e.isolationLevel } };
        if (e.kind === "itx")
          return { kind: "itx", options: Hl(e) };
        Me(e, "Unknown transaction kind");
      }
    }
    function Hl(e) {
      return { id: e.id, payload: e.payload };
    }
    function Zm(e, t) {
      return Qn(e) && t?.kind === "batch" && e.batchRequestIdx !== t.index;
    }
    function Xm(e) {
      return e.code === "P2009" || e.code === "P2012";
    }
    function Kl(e) {
      if (e.kind === "Union")
        return { kind: "Union", errors: e.errors.map(Kl) };
      if (Array.isArray(e.selectionPath)) {
        let [, ...t] = e.selectionPath;
        return { ...e, selectionPath: t };
      }
      return e;
    }
    var Yl = "6.5.0";
    var zl = Yl;
    var ru = D(Qi());
    var L = class extends Error {
      constructor(t) {
        super(t + `
Read more at https://pris.ly/d/client-constructor`), this.name = "PrismaClientConstructorValidationError";
      }
      get [Symbol.toStringTag]() {
        return "PrismaClientConstructorValidationError";
      }
    };
    x(L, "PrismaClientConstructorValidationError");
    var Zl = ["datasources", "datasourceUrl", "errorFormat", "adapter", "log", "transactionOptions", "omit", "__internal"];
    var Xl = ["pretty", "colorless", "minimal"];
    var eu = ["info", "query", "warn", "error"];
    var tf = { datasources: (e, { datasourceNames: t }) => {
      if (e) {
        if (typeof e != "object" || Array.isArray(e))
          throw new L(`Invalid value ${JSON.stringify(e)} for "datasources" provided to PrismaClient constructor`);
        for (let [r, n] of Object.entries(e)) {
          if (!t.includes(r)) {
            let i = Qt(r, t) || ` Available datasources: ${t.join(", ")}`;
            throw new L(`Unknown datasource ${r} provided to PrismaClient constructor.${i}`);
          }
          if (typeof n != "object" || Array.isArray(n))
            throw new L(`Invalid value ${JSON.stringify(e)} for datasource "${r}" provided to PrismaClient constructor.
It should have this form: { url: "CONNECTION_STRING" }`);
          if (n && typeof n == "object")
            for (let [i, o] of Object.entries(n)) {
              if (i !== "url")
                throw new L(`Invalid value ${JSON.stringify(e)} for datasource "${r}" provided to PrismaClient constructor.
It should have this form: { url: "CONNECTION_STRING" }`);
              if (typeof o != "string")
                throw new L(`Invalid value ${JSON.stringify(o)} for datasource "${r}" provided to PrismaClient constructor.
It should have this form: { url: "CONNECTION_STRING" }`);
            }
        }
      }
    }, adapter: (e, t) => {
      if (!e && Et(t.generator) === "client")
        throw new L('Using engine type "client" requires a driver adapter to be provided to PrismaClient constructor.');
      if (e === null)
        return;
      if (e === void 0)
        throw new L('"adapter" property must not be undefined, use null to conditionally disable driver adapters.');
      if (!Bn(t).includes("driverAdapters"))
        throw new L('"adapter" property can only be provided to PrismaClient constructor when "driverAdapters" preview feature is enabled.');
      if (Et(t.generator) === "binary")
        throw new L('Cannot use a driver adapter with the "binary" Query Engine. Please use the "library" Query Engine.');
    }, datasourceUrl: (e) => {
      if (typeof e < "u" && typeof e != "string")
        throw new L(`Invalid value ${JSON.stringify(e)} for "datasourceUrl" provided to PrismaClient constructor.
Expected string or undefined.`);
    }, errorFormat: (e) => {
      if (e) {
        if (typeof e != "string")
          throw new L(`Invalid value ${JSON.stringify(e)} for "errorFormat" provided to PrismaClient constructor.`);
        if (!Xl.includes(e)) {
          let t = Qt(e, Xl);
          throw new L(`Invalid errorFormat ${e} provided to PrismaClient constructor.${t}`);
        }
      }
    }, log: (e) => {
      if (!e)
        return;
      if (!Array.isArray(e))
        throw new L(`Invalid value ${JSON.stringify(e)} for "log" provided to PrismaClient constructor.`);
      function t(r) {
        if (typeof r == "string" && !eu.includes(r)) {
          let n = Qt(r, eu);
          throw new L(`Invalid log level "${r}" provided to PrismaClient constructor.${n}`);
        }
      }
      for (let r of e) {
        t(r);
        let n = { level: t, emit: (i) => {
          let o = ["stdout", "event"];
          if (!o.includes(i)) {
            let s = Qt(i, o);
            throw new L(`Invalid value ${JSON.stringify(i)} for "emit" in logLevel provided to PrismaClient constructor.${s}`);
          }
        } };
        if (r && typeof r == "object")
          for (let [i, o] of Object.entries(r))
            if (n[i])
              n[i](o);
            else
              throw new L(`Invalid property ${i} for "log" provided to PrismaClient constructor`);
      }
    }, transactionOptions: (e) => {
      if (!e)
        return;
      let t = e.maxWait;
      if (t != null && t <= 0)
        throw new L(`Invalid value ${t} for maxWait in "transactionOptions" provided to PrismaClient constructor. maxWait needs to be greater than 0`);
      let r = e.timeout;
      if (r != null && r <= 0)
        throw new L(`Invalid value ${r} for timeout in "transactionOptions" provided to PrismaClient constructor. timeout needs to be greater than 0`);
    }, omit: (e, t) => {
      if (typeof e != "object")
        throw new L('"omit" option is expected to be an object.');
      if (e === null)
        throw new L('"omit" option can not be `null`');
      let r = [];
      for (let [n, i] of Object.entries(e)) {
        let o = nf(n, t.runtimeDataModel);
        if (!o) {
          r.push({ kind: "UnknownModel", modelKey: n });
          continue;
        }
        for (let [s, a] of Object.entries(i)) {
          let l = o.fields.find((u) => u.name === s);
          if (!l) {
            r.push({ kind: "UnknownField", modelKey: n, fieldName: s });
            continue;
          }
          if (l.relationName) {
            r.push({ kind: "RelationInOmit", modelKey: n, fieldName: s });
            continue;
          }
          typeof a != "boolean" && r.push({ kind: "InvalidFieldValue", modelKey: n, fieldName: s });
        }
      }
      if (r.length > 0)
        throw new L(of(e, r));
    }, __internal: (e) => {
      if (!e)
        return;
      let t = ["debug", "engine", "configOverride"];
      if (typeof e != "object")
        throw new L(`Invalid value ${JSON.stringify(e)} for "__internal" to PrismaClient constructor`);
      for (let [r] of Object.entries(e))
        if (!t.includes(r)) {
          let n = Qt(r, t);
          throw new L(`Invalid property ${JSON.stringify(r)} for "__internal" provided to PrismaClient constructor.${n}`);
        }
    } };
    function nu(e, t) {
      for (let [r, n] of Object.entries(e)) {
        if (!Zl.includes(r)) {
          let i = Qt(r, Zl);
          throw new L(`Unknown property ${r} provided to PrismaClient constructor.${i}`);
        }
        tf[r](n, t);
      }
      if (e.datasourceUrl && e.datasources)
        throw new L('Can not use "datasourceUrl" and "datasources" options at the same time. Pick one of them');
    }
    function Qt(e, t) {
      if (t.length === 0 || typeof e != "string")
        return "";
      let r = rf(e, t);
      return r ? ` Did you mean "${r}"?` : "";
    }
    function rf(e, t) {
      if (t.length === 0)
        return null;
      let r = t.map((i) => ({ value: i, distance: (0, ru.default)(e, i) }));
      r.sort((i, o) => i.distance < o.distance ? -1 : 1);
      let n = r[0];
      return n.distance < 3 ? n.value : null;
    }
    function nf(e, t) {
      return tu(t.models, e) ?? tu(t.types, e);
    }
    function tu(e, t) {
      let r = Object.keys(e).find((n) => vt(n) === t);
      if (r)
        return e[r];
    }
    function of(e, t) {
      let r = Ot(e);
      for (let o of t)
        switch (o.kind) {
          case "UnknownModel":
            r.arguments.getField(o.modelKey)?.markAsError(), r.addErrorMessage(() => `Unknown model name: ${o.modelKey}.`);
            break;
          case "UnknownField":
            r.arguments.getDeepField([o.modelKey, o.fieldName])?.markAsError(), r.addErrorMessage(() => `Model "${o.modelKey}" does not have a field named "${o.fieldName}".`);
            break;
          case "RelationInOmit":
            r.arguments.getDeepField([o.modelKey, o.fieldName])?.markAsError(), r.addErrorMessage(() => 'Relations are already excluded by default and can not be specified in "omit".');
            break;
          case "InvalidFieldValue":
            r.arguments.getDeepFieldValue([o.modelKey, o.fieldName])?.markAsError(), r.addErrorMessage(() => "Omit field option value must be a boolean.");
            break;
        }
      let { message: n, args: i } = Tn(r, "colorless");
      return `Error validating "omit" option:

${i}

${n}`;
    }
    function iu(e) {
      return e.length === 0 ? Promise.resolve([]) : new Promise((t, r) => {
        let n = new Array(e.length), i = null, o = false, s = 0, a = () => {
          o || (s++, s === e.length && (o = true, i ? r(i) : t(n)));
        }, l = (u) => {
          o || (o = true, r(u));
        };
        for (let u = 0; u < e.length; u++)
          e[u].then((c) => {
            n[u] = c, a();
          }, (c) => {
            if (!Qn(c)) {
              l(c);
              return;
            }
            c.batchRequestIdx === u ? l(c) : (i || (i = c), a());
          });
      });
    }
    var rt = M("prisma:client");
    typeof globalThis == "object" && (globalThis.NODE_CLIENT = true);
    var sf = { requestArgsToMiddlewareArgs: (e) => e, middlewareArgsToRequestArgs: (e) => e };
    var af = Symbol.for("prisma.client.transaction.id");
    var lf = { id: 0, nextId() {
      return ++this.id;
    } };
    function cu(e) {
      class t {
        constructor(n) {
          d(this, "_originalClient", this);
          d(this, "_runtimeDataModel");
          d(this, "_requestHandler");
          d(this, "_connectionPromise");
          d(this, "_disconnectionPromise");
          d(this, "_engineConfig");
          d(this, "_accelerateEngineConfig");
          d(this, "_clientVersion");
          d(this, "_errorFormat");
          d(this, "_tracingHelper");
          d(this, "_middlewares", new Un());
          d(this, "_previewFeatures");
          d(this, "_activeProvider");
          d(this, "_globalOmit");
          d(this, "_extensions");
          d(this, "_engine");
          d(this, "_appliedParent");
          d(this, "_createPrismaPromise", To());
          d(this, "$metrics", new Dt(this));
          d(this, "$extends", Ja);
          e = n?.__internal?.configOverride?.(e) ?? e, sl(e), n && nu(n, e);
          let i = new lu.EventEmitter().on("error", () => {
          });
          this._extensions = _t.empty(), this._previewFeatures = Bn(e), this._clientVersion = e.clientVersion ?? zl, this._activeProvider = e.activeProvider, this._globalOmit = n?.omit, this._tracingHelper = Ul();
          let o = { rootEnvPath: e.relativeEnvPaths.rootEnvPath && Mr.default.resolve(e.dirname, e.relativeEnvPaths.rootEnvPath), schemaEnvPath: e.relativeEnvPaths.schemaEnvPath && Mr.default.resolve(e.dirname, e.relativeEnvPaths.schemaEnvPath) }, s;
          if (n?.adapter) {
            s = Xn(n.adapter);
            let l = e.activeProvider === "postgresql" ? "postgres" : e.activeProvider;
            if (s.provider !== l)
              throw new C(`The Driver Adapter \`${s.adapterName}\`, based on \`${s.provider}\`, is not compatible with the provider \`${l}\` specified in the Prisma schema.`, this._clientVersion);
            if (n.datasources || n.datasourceUrl !== void 0)
              throw new C("Custom datasource configuration is not compatible with Prisma Driver Adapters. Please define the database connection string directly in the Driver Adapter configuration.", this._clientVersion);
          }
          let a = !s && er(o, { conflictCheck: "none" }) || e.injectableEdgeEnv?.();
          try {
            let l = n ?? {}, u = l.__internal ?? {}, c = u.debug === true;
            c && M.enable("prisma:client");
            let p = Mr.default.resolve(e.dirname, e.relativePath);
            uu.default.existsSync(p) || (p = e.dirname), rt("dirname", e.dirname), rt("relativePath", e.relativePath), rt("cwd", p);
            let m = u.engine || {};
            if (l.errorFormat ? this._errorFormat = l.errorFormat : process.env.NODE_ENV === "production" ? this._errorFormat = "minimal" : process.env.NO_COLOR ? this._errorFormat = "colorless" : this._errorFormat = "colorless", this._runtimeDataModel = e.runtimeDataModel, this._engineConfig = { cwd: p, dirname: e.dirname, enableDebugLogs: c, allowTriggerPanic: m.allowTriggerPanic, datamodelPath: Mr.default.join(e.dirname, e.filename ?? "schema.prisma"), prismaPath: m.binaryPath ?? void 0, engineEndpoint: m.endpoint, generator: e.generator, showColors: this._errorFormat === "pretty", logLevel: l.log && Gl(l.log), logQueries: l.log && !!(typeof l.log == "string" ? l.log === "query" : l.log.find((g) => typeof g == "string" ? g === "query" : g.level === "query")), env: a?.parsed ?? {}, flags: [], engineWasm: e.engineWasm, compilerWasm: e.compilerWasm, clientVersion: e.clientVersion, engineVersion: e.engineVersion, previewFeatures: this._previewFeatures, activeProvider: e.activeProvider, inlineSchema: e.inlineSchema, overrideDatasources: al(l, e.datasourceNames), inlineDatasources: e.inlineDatasources, inlineSchemaHash: e.inlineSchemaHash, tracingHelper: this._tracingHelper, transactionOptions: { maxWait: l.transactionOptions?.maxWait ?? 2e3, timeout: l.transactionOptions?.timeout ?? 5e3, isolationLevel: l.transactionOptions?.isolationLevel }, logEmitter: i, isBundled: e.isBundled, adapter: s }, this._accelerateEngineConfig = { ...this._engineConfig, accelerateUtils: { resolveDatasourceUrl: $t, getBatchRequestPayload: Lt, prismaGraphQLToJSError: Ft, PrismaClientUnknownRequestError: U, PrismaClientInitializationError: C, PrismaClientKnownRequestError: te, debug: M("prisma:client:accelerateEngine"), engineVersion: su.version, clientVersion: e.clientVersion } }, rt("clientVersion", e.clientVersion), this._engine = _l(e, this._engineConfig), this._requestHandler = new Wn(this, i), l.log)
              for (let g of l.log) {
                let h = typeof g == "string" ? g : g.emit === "stdout" ? g.level : null;
                h && this.$on(h, (y) => {
                  ir.log(`${ir.tags[h] ?? ""}`, y.message || y.query);
                });
              }
          } catch (l) {
            throw l.clientVersion = this._clientVersion, l;
          }
          return this._appliedParent = xr(this);
        }
        get [Symbol.toStringTag]() {
          return "PrismaClient";
        }
        $use(n) {
          this._middlewares.use(n);
        }
        $on(n, i) {
          return n === "beforeExit" ? this._engine.onBeforeExit(i) : n && this._engineConfig.logEmitter.on(n, i), this;
        }
        $connect() {
          try {
            return this._engine.start();
          } catch (n) {
            throw n.clientVersion = this._clientVersion, n;
          }
        }
        async $disconnect() {
          try {
            await this._engine.stop();
          } catch (n) {
            throw n.clientVersion = this._clientVersion, n;
          } finally {
            Vo();
          }
        }
        $executeRawInternal(n, i, o, s) {
          let a = this._activeProvider;
          return this._request({ action: "executeRaw", args: o, transaction: n, clientMethod: i, argsMapper: vo({ clientMethod: i, activeProvider: a }), callsite: Xe(this._errorFormat), dataPath: [], middlewareArgsMapper: s });
        }
        $executeRaw(n, ...i) {
          return this._createPrismaPromise((o) => {
            if (n.raw !== void 0 || n.sql !== void 0) {
              let [s, a] = ou(n, i);
              return Po(this._activeProvider, s.text, s.values, Array.isArray(n) ? "prisma.$executeRaw`<SQL>`" : "prisma.$executeRaw(sql`<SQL>`)"), this.$executeRawInternal(o, "$executeRaw", s, a);
            }
            throw new re("`$executeRaw` is a tag function, please use it like the following:\n```\nconst result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`\n```\n\nOr read our docs at https://www.prisma.io/docs/concepts/components/prisma-client/raw-database-access#executeraw\n", { clientVersion: this._clientVersion });
          });
        }
        $executeRawUnsafe(n, ...i) {
          return this._createPrismaPromise((o) => (Po(this._activeProvider, n, i, "prisma.$executeRawUnsafe(<SQL>, [...values])"), this.$executeRawInternal(o, "$executeRawUnsafe", [n, ...i])));
        }
        $runCommandRaw(n) {
          if (e.activeProvider !== "mongodb")
            throw new re(`The ${e.activeProvider} provider does not support $runCommandRaw. Use the mongodb provider.`, { clientVersion: this._clientVersion });
          return this._createPrismaPromise((i) => this._request({ args: n, clientMethod: "$runCommandRaw", dataPath: [], action: "runCommandRaw", argsMapper: Dl, callsite: Xe(this._errorFormat), transaction: i }));
        }
        async $queryRawInternal(n, i, o, s) {
          let a = this._activeProvider;
          return this._request({ action: "queryRaw", args: o, transaction: n, clientMethod: i, argsMapper: vo({ clientMethod: i, activeProvider: a }), callsite: Xe(this._errorFormat), dataPath: [], middlewareArgsMapper: s });
        }
        $queryRaw(n, ...i) {
          return this._createPrismaPromise((o) => {
            if (n.raw !== void 0 || n.sql !== void 0)
              return this.$queryRawInternal(o, "$queryRaw", ...ou(n, i));
            throw new re("`$queryRaw` is a tag function, please use it like the following:\n```\nconst result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`\n```\n\nOr read our docs at https://www.prisma.io/docs/concepts/components/prisma-client/raw-database-access#queryraw\n", { clientVersion: this._clientVersion });
          });
        }
        $queryRawTyped(n) {
          return this._createPrismaPromise((i) => {
            if (!this._hasPreviewFlag("typedSql"))
              throw new re("`typedSql` preview feature must be enabled in order to access $queryRawTyped API", { clientVersion: this._clientVersion });
            return this.$queryRawInternal(i, "$queryRawTyped", n);
          });
        }
        $queryRawUnsafe(n, ...i) {
          return this._createPrismaPromise((o) => this.$queryRawInternal(o, "$queryRawUnsafe", [n, ...i]));
        }
        _transactionWithArray({ promises: n, options: i }) {
          let o = lf.nextId(), s = Ql(n.length), a = n.map((l, u) => {
            if (l?.[Symbol.toStringTag] !== "PrismaPromise")
              throw new Error("All elements of the array need to be Prisma Client promises. Hint: Please make sure you are not awaiting the Prisma client calls you intended to pass in the $transaction function.");
            let c = i?.isolationLevel ?? this._engineConfig.transactionOptions.isolationLevel, p = { kind: "batch", id: o, index: u, isolationLevel: c, lock: s };
            return l.requestTransaction?.(p) ?? l;
          });
          return iu(a);
        }
        async _transactionWithCallback({ callback: n, options: i }) {
          let o = { traceparent: this._tracingHelper.getTraceParent() }, s = { maxWait: i?.maxWait ?? this._engineConfig.transactionOptions.maxWait, timeout: i?.timeout ?? this._engineConfig.transactionOptions.timeout, isolationLevel: i?.isolationLevel ?? this._engineConfig.transactionOptions.isolationLevel }, a = await this._engine.transaction("start", o, s), l;
          try {
            let u = { kind: "itx", ...a };
            l = await n(this._createItxClient(u)), await this._engine.transaction("commit", o, a);
          } catch (u) {
            throw await this._engine.transaction("rollback", o, a).catch(() => {
            }), u;
          }
          return l;
        }
        _createItxClient(n) {
          return be(xr(be(Ga(this), [oe("_appliedParent", () => this._appliedParent._createItxClient(n)), oe("_createPrismaPromise", () => To(n)), oe(af, () => n.id)])), [Nt(Ya)]);
        }
        $transaction(n, i) {
          let o;
          typeof n == "function" ? this._engineConfig.adapter?.adapterName === "@prisma/adapter-d1" ? o = () => {
            throw new Error("Cloudflare D1 does not support interactive transactions. We recommend you to refactor your queries with that limitation in mind, and use batch transactions with `prisma.$transactions([])` where applicable.");
          } : o = () => this._transactionWithCallback({ callback: n, options: i }) : o = () => this._transactionWithArray({ promises: n, options: i });
          let s = { name: "transaction", attributes: { method: "$transaction" } };
          return this._tracingHelper.runInChildSpan(s, o);
        }
        _request(n) {
          n.otelParentCtx = this._tracingHelper.getActiveContext();
          let i = n.middlewareArgsMapper ?? sf, o = { args: i.requestArgsToMiddlewareArgs(n.args), dataPath: n.dataPath, runInTransaction: !!n.transaction, action: n.action, model: n.model }, s = { middleware: { name: "middleware", middleware: true, attributes: { method: "$use" }, active: false }, operation: { name: "operation", attributes: { method: o.action, model: o.model, name: o.model ? `${o.model}.${o.action}` : o.action } } }, a = -1, l = async (u) => {
            let c = this._middlewares.get(++a);
            if (c)
              return this._tracingHelper.runInChildSpan(s.middleware, (O) => c(u, (T) => (O?.end(), l(T))));
            let { runInTransaction: p, args: m, ...g } = u, h = { ...n, ...g };
            m && (h.args = i.middlewareArgsToRequestArgs(m)), n.transaction !== void 0 && p === false && delete h.transaction;
            let y = await el(this, h);
            return h.model ? Ka({ result: y, modelName: h.model, args: h.args, extensions: this._extensions, runtimeDataModel: this._runtimeDataModel, globalOmit: this._globalOmit }) : y;
          };
          return this._tracingHelper.runInChildSpan(s.operation, () => new au.AsyncResource("prisma-client-request").runInAsyncScope(() => l(o)));
        }
        async _executeRequest({ args: n, clientMethod: i, dataPath: o, callsite: s, action: a, model: l, argsMapper: u, transaction: c, unpacker: p, otelParentCtx: m, customDataProxyFetch: g }) {
          try {
            n = u ? u(n) : n;
            let h = { name: "serialize" }, y = this._tracingHelper.runInChildSpan(h, () => In({ modelName: l, runtimeDataModel: this._runtimeDataModel, action: a, args: n, clientMethod: i, callsite: s, extensions: this._extensions, errorFormat: this._errorFormat, clientVersion: this._clientVersion, previewFeatures: this._previewFeatures, globalOmit: this._globalOmit }));
            return M.enabled("prisma:client") && (rt("Prisma Client call:"), rt(`prisma.${i}(${Na(n)})`), rt("Generated request:"), rt(JSON.stringify(y, null, 2) + `
`)), c?.kind === "batch" && await c.lock, this._requestHandler.request({ protocolQuery: y, modelName: l, action: a, clientMethod: i, dataPath: o, callsite: s, args: n, extensions: this._extensions, transaction: c, unpacker: p, otelParentCtx: m, otelChildCtx: this._tracingHelper.getActiveContext(), globalOmit: this._globalOmit, customDataProxyFetch: g });
          } catch (h) {
            throw h.clientVersion = this._clientVersion, h;
          }
        }
        _hasPreviewFlag(n) {
          return !!this._engineConfig.previewFeatures?.includes(n);
        }
        $applyPendingMigrations() {
          return this._engine.applyPendingMigrations();
        }
      }
      return t;
    }
    function ou(e, t) {
      return uf(e) ? [new le(e, t), Vl] : [e, jl];
    }
    function uf(e) {
      return Array.isArray(e) && Array.isArray(e.raw);
    }
    var cf = /* @__PURE__ */ new Set(["toJSON", "$$typeof", "asymmetricMatch", Symbol.iterator, Symbol.toStringTag, Symbol.isConcatSpreadable, Symbol.toPrimitive]);
    function pu(e) {
      return new Proxy(e, { get(t, r) {
        if (r in t)
          return t[r];
        if (!cf.has(r))
          throw new TypeError(`Invalid enum value: ${String(r)}`);
      } });
    }
    function du(e) {
      er(e, { conflictCheck: "warn" });
    }
  }
});

// ../../node_modules/.prisma/client/index.js
var require_client = __commonJS({
  "../../node_modules/.prisma/client/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var {
      PrismaClientKnownRequestError: PrismaClientKnownRequestError2,
      PrismaClientUnknownRequestError: PrismaClientUnknownRequestError2,
      PrismaClientRustPanicError: PrismaClientRustPanicError2,
      PrismaClientInitializationError: PrismaClientInitializationError2,
      PrismaClientValidationError: PrismaClientValidationError2,
      getPrismaClient: getPrismaClient2,
      sqltag: sqltag2,
      empty: empty2,
      join: join2,
      raw: raw2,
      skip: skip2,
      Decimal: Decimal2,
      Debug: Debug2,
      objectEnumValues: objectEnumValues2,
      makeStrictEnum: makeStrictEnum2,
      Extensions: Extensions2,
      warnOnce: warnOnce2,
      defineDmmfProperty: defineDmmfProperty2,
      Public: Public2,
      getRuntime: getRuntime2,
      createParam: createParam2
    } = require_library();
    var Prisma = {};
    exports2.Prisma = Prisma;
    exports2.$Enums = {};
    Prisma.prismaVersion = {
      client: "6.5.0",
      engine: "173f8d54f8d52e692c7e27e72a88314ec7aeff60"
    };
    Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError2;
    Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError2;
    Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError2;
    Prisma.PrismaClientInitializationError = PrismaClientInitializationError2;
    Prisma.PrismaClientValidationError = PrismaClientValidationError2;
    Prisma.Decimal = Decimal2;
    Prisma.sql = sqltag2;
    Prisma.empty = empty2;
    Prisma.join = join2;
    Prisma.raw = raw2;
    Prisma.validator = Public2.validator;
    Prisma.getExtensionContext = Extensions2.getExtensionContext;
    Prisma.defineExtension = Extensions2.defineExtension;
    Prisma.DbNull = objectEnumValues2.instances.DbNull;
    Prisma.JsonNull = objectEnumValues2.instances.JsonNull;
    Prisma.AnyNull = objectEnumValues2.instances.AnyNull;
    Prisma.NullTypes = {
      DbNull: objectEnumValues2.classes.DbNull,
      JsonNull: objectEnumValues2.classes.JsonNull,
      AnyNull: objectEnumValues2.classes.AnyNull
    };
    var path = require("path");
    exports2.Prisma.TransactionIsolationLevel = makeStrictEnum2({
      ReadUncommitted: "ReadUncommitted",
      ReadCommitted: "ReadCommitted",
      RepeatableRead: "RepeatableRead",
      Serializable: "Serializable"
    });
    exports2.Prisma.AccountScalarFieldEnum = {
      id: "id",
      userId: "userId",
      type: "type",
      provider: "provider",
      providerAccountId: "providerAccountId",
      refresh_token: "refresh_token",
      access_token: "access_token",
      expires_at: "expires_at",
      token_type: "token_type",
      scope: "scope",
      id_token: "id_token",
      session_state: "session_state"
    };
    exports2.Prisma.SessionScalarFieldEnum = {
      id: "id",
      sessionToken: "sessionToken",
      userId: "userId",
      expires: "expires"
    };
    exports2.Prisma.UserScalarFieldEnum = {
      id: "id",
      name: "name",
      email: "email",
      emailVerified: "emailVerified",
      image: "image",
      password: "password",
      role: "role",
      organization: "organization",
      department: "department",
      phone: "phone",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    };
    exports2.Prisma.MetadataScalarFieldEnum = {
      id: "id",
      title: "title",
      author: "author",
      organization: "organization",
      dateFrom: "dateFrom",
      dateTo: "dateTo",
      frameworkType: "frameworkType",
      categories: "categories",
      numFeatures: "numFeatures",
      softwareReqs: "softwareReqs",
      updateCycle: "updateCycle",
      lastUpdate: "lastUpdate",
      nextUpdate: "nextUpdate",
      dataType: "dataType",
      dataName: "dataName",
      cloudCoverPercentage: "cloudCoverPercentage",
      productionDate: "productionDate",
      fundamentalDatasets: "fundamentalDatasets",
      abstract: "abstract",
      purpose: "purpose",
      thumbnailUrl: "thumbnailUrl",
      imageName: "imageName",
      coordinateUnit: "coordinateUnit",
      minLatitude: "minLatitude",
      minLongitude: "minLongitude",
      maxLatitude: "maxLatitude",
      maxLongitude: "maxLongitude",
      coordinateSystem: "coordinateSystem",
      projection: "projection",
      scale: "scale",
      resolution: "resolution",
      accuracyLevel: "accuracyLevel",
      completeness: "completeness",
      consistencyCheck: "consistencyCheck",
      validationStatus: "validationStatus",
      fileFormat: "fileFormat",
      fileSize: "fileSize",
      country: "country",
      geopoliticalZone: "geopoliticalZone",
      state: "state",
      lga: "lga",
      townCity: "townCity",
      assessment: "assessment",
      updateFrequency: "updateFrequency",
      accessConstraints: "accessConstraints",
      useConstraints: "useConstraints",
      otherConstraints: "otherConstraints",
      accessRestrictions: "accessRestrictions",
      licenseType: "licenseType",
      usageTerms: "usageTerms",
      attributionRequirements: "attributionRequirements",
      distributionFormat: "distributionFormat",
      accessMethod: "accessMethod",
      downloadUrl: "downloadUrl",
      apiEndpoint: "apiEndpoint",
      metadataCreationDate: "metadataCreationDate",
      metadataReviewDate: "metadataReviewDate",
      metadataContactName: "metadataContactName",
      metadataContactAddress: "metadataContactAddress",
      metadataContactEmail: "metadataContactEmail",
      metadataContactPhone: "metadataContactPhone",
      logicalConsistencyReport: "logicalConsistencyReport",
      completenessReport: "completenessReport",
      attributeAccuracyReport: "attributeAccuracyReport",
      positionalAccuracy: "positionalAccuracy",
      sourceInformation: "sourceInformation",
      processingDescription: "processingDescription",
      softwareVersion: "softwareVersion",
      processedDate: "processedDate",
      processorName: "processorName",
      processorEmail: "processorEmail",
      processorAddress: "processorAddress",
      distributorName: "distributorName",
      distributorAddress: "distributorAddress",
      distributorEmail: "distributorEmail",
      distributorPhone: "distributorPhone",
      distributorWebLink: "distributorWebLink",
      distributorSocialMedia: "distributorSocialMedia",
      isCustodian: "isCustodian",
      custodianName: "custodianName",
      custodianContact: "custodianContact",
      distributionLiability: "distributionLiability",
      customOrderProcess: "customOrderProcess",
      technicalPrerequisites: "technicalPrerequisites",
      fees: "fees",
      turnaroundTime: "turnaroundTime",
      orderingInstructions: "orderingInstructions",
      maximumResponseTime: "maximumResponseTime",
      contactPerson: "contactPerson",
      email: "email",
      department: "department",
      userId: "userId",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    };
    exports2.Prisma.VerificationTokenScalarFieldEnum = {
      identifier: "identifier",
      token: "token",
      expires: "expires"
    };
    exports2.Prisma.SettingsScalarFieldEnum = {
      id: "id",
      siteName: "siteName",
      siteDescription: "siteDescription",
      supportEmail: "supportEmail",
      maxUploadSize: "maxUploadSize",
      defaultLanguage: "defaultLanguage",
      maintenanceMode: "maintenanceMode",
      enableRegistration: "enableRegistration",
      requireEmailVerification: "requireEmailVerification",
      metadataValidation: "metadataValidation",
      autoBackup: "autoBackup",
      backupFrequency: "backupFrequency",
      storageProvider: "storageProvider",
      apiRateLimit: "apiRateLimit",
      updatedAt: "updatedAt"
    };
    exports2.Prisma.DraftScalarFieldEnum = {
      id: "id",
      userId: "userId",
      title: "title",
      data: "data",
      lastUpdated: "lastUpdated",
      createdAt: "createdAt"
    };
    exports2.Prisma.SortOrder = {
      asc: "asc",
      desc: "desc"
    };
    exports2.Prisma.NullableJsonNullValueInput = {
      DbNull: Prisma.DbNull,
      JsonNull: Prisma.JsonNull
    };
    exports2.Prisma.JsonNullValueInput = {
      JsonNull: Prisma.JsonNull
    };
    exports2.Prisma.QueryMode = {
      default: "default",
      insensitive: "insensitive"
    };
    exports2.Prisma.NullsOrder = {
      first: "first",
      last: "last"
    };
    exports2.Prisma.JsonNullValueFilter = {
      DbNull: Prisma.DbNull,
      JsonNull: Prisma.JsonNull,
      AnyNull: Prisma.AnyNull
    };
    exports2.UserRole = exports2.$Enums.UserRole = {
      USER: "USER",
      ADMIN: "ADMIN",
      NODE_OFFICER: "NODE_OFFICER"
    };
    exports2.Prisma.ModelName = {
      Account: "Account",
      Session: "Session",
      User: "User",
      Metadata: "Metadata",
      VerificationToken: "VerificationToken",
      Settings: "Settings",
      Draft: "Draft"
    };
    var config3 = {
      "generator": {
        "name": "client",
        "provider": {
          "fromEnvVar": null,
          "value": "prisma-client-js"
        },
        "output": {
          "value": "/Users/yakky/Dev/ngdi-v1/node_modules/@prisma/client",
          "fromEnvVar": null
        },
        "config": {
          "engineType": "library"
        },
        "binaryTargets": [
          {
            "fromEnvVar": null,
            "value": "darwin",
            "native": true
          }
        ],
        "previewFeatures": [],
        "sourceFilePath": "/Users/yakky/Dev/ngdi-v1/prisma/schema.prisma"
      },
      "relativeEnvPaths": {
        "rootEnvPath": null,
        "schemaEnvPath": "../../../.env"
      },
      "relativePath": "../../../prisma",
      "clientVersion": "6.5.0",
      "engineVersion": "173f8d54f8d52e692c7e27e72a88314ec7aeff60",
      "datasourceNames": [
        "db"
      ],
      "activeProvider": "postgresql",
      "postinstall": false,
      "inlineDatasources": {
        "db": {
          "url": {
            "fromEnvVar": "DATABASE_URL",
            "value": null
          }
        }
      },
      "inlineSchema": `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?
// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

/// Authentication account information for OAuth providers
model Account {
  /// Unique identifier for the account
  id                String  @id @default(cuid())
  /// Reference to the user who owns this account
  userId            String
  /// Type of the account (oauth, email, etc.)
  type              String
  /// OAuth provider name
  provider          String
  /// Account ID from the provider
  providerAccountId String
  /// OAuth refresh token
  refresh_token     String?
  /// OAuth access token
  access_token      String?
  /// Token expiration timestamp
  expires_at        Int?
  /// OAuth token type
  token_type        String?
  /// OAuth scope
  scope             String?
  /// OAuth ID token
  id_token          String?
  /// OAuth session state
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

/// User session information
model Session {
  /// Unique identifier for the session
  id           String   @id @default(cuid())
  /// Session token used for authentication
  sessionToken String   @unique
  /// Reference to the user who owns this session
  userId       String
  /// Session expiration timestamp
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

/// User account information
model User {
  /// Unique identifier for the user
  id            String    @id @default(uuid())
  /// User's full name
  name          String?
  /// User's email address
  email         String    @unique
  /// Timestamp of email verification
  emailVerified DateTime?
  /// User's profile image URL
  image         String?
  /// Hashed password for local authentication
  password      String
  /// User's role in the system
  role          UserRole  @default(USER)
  /// User's organization name
  organization  String?
  /// User's department within the organization
  department    String?
  /// User's contact phone number
  phone         String?

  accounts  Account[]
  sessions  Session[]
  metadata  Metadata[]
  drafts    Draft[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}

/// User roles for access control
enum UserRole {
  /// Regular user with basic access
  USER
  /// System administrator with full access
  ADMIN
  /// Node officer with specific privileges
  NODE_OFFICER
}

/// Geospatial metadata information following NGDI standards
model Metadata {
  /// Unique identifier for the metadata entry
  id String @id @default(uuid())

  // Legacy fields from original Metadata model
  /// Title of the dataset (legacy field - use dataName instead)
  title         String
  /// Author of the dataset (legacy field)
  author        String?
  /// Organization name (legacy field)
  organization  String?
  /// Start date of the dataset (legacy field)
  dateFrom      String?
  /// End date of the dataset (legacy field)
  dateTo        String?
  /// Framework type (legacy field - use dataType instead)
  frameworkType String?
  /// Categories of the dataset (legacy field)
  categories    String[]  @default([])
  /// Number of features (legacy field)
  numFeatures   Int?
  /// Software requirements (legacy field - use technicalPrerequisites instead)
  softwareReqs  String?
  /// Update cycle (legacy field - use updateFrequency instead)
  updateCycle   String?
  /// Last update date (legacy field)
  lastUpdate    DateTime?
  /// Next update date (legacy field)
  nextUpdate    DateTime?

  // Form 1: General Information
  // Data Information
  /// Type of data (Raster, Vector, Table)
  dataType             String?
  /// Name of the dataset
  dataName             String
  /// Percentage of cloud cover for imagery
  cloudCoverPercentage String?
  /// Date when the dataset was produced
  productionDate       String

  // Fundamental Datasets (stored as JSON)
  /// Information about fundamental dataset types
  fundamentalDatasets Json?

  // Description
  /// Abstract/description of the dataset
  abstract     String? @db.Text
  /// Purpose of the dataset
  purpose      String? @db.Text
  /// URL to the thumbnail image
  thumbnailUrl String?
  /// Name of the image file
  imageName    String?

  // Spatial Domain
  /// Unit system for coordinates (DD or DMS)
  coordinateUnit   String?
  /// Southernmost latitude value
  minLatitude      Float?
  /// Westernmost longitude value
  minLongitude     Float?
  /// Northernmost latitude value
  maxLatitude      Float?
  /// Easternmost longitude value
  maxLongitude     Float?
  /// Coordinate system used
  coordinateSystem String?
  /// Projection used
  projection       String?
  /// Scale of the dataset
  scale            Int?
  /// Resolution of the dataset
  resolution       String?
  /// Accuracy level
  accuracyLevel    String?
  /// Completeness percentage
  completeness     Int?
  /// Consistency check status
  consistencyCheck Boolean?
  /// Validation status
  validationStatus String?
  /// File format
  fileFormat       String?
  /// File size in bytes
  fileSize         BigInt?

  // Location
  /// Country covered by the dataset
  country          String?
  /// Geopolitical zone within Nigeria
  geopoliticalZone String?
  /// State or province
  state            String?
  /// Local Government Area
  lga              String?
  /// Town or city
  townCity         String?

  // Data Status
  /// Completion status (Complete or Incomplete)
  assessment      String?
  /// Frequency of updates (Monthly, Quarterly, etc.)
  updateFrequency String?

  // Resource Constraint
  /// Limitations on access to the dataset
  accessConstraints       String?  @db.Text
  /// Limitations on use of the dataset
  useConstraints          String?  @db.Text
  /// Other constraints or legal prerequisites
  otherConstraints        String?  @db.Text
  /// Access restrictions
  accessRestrictions      String[] @default([])
  /// License type
  licenseType             String?
  /// Usage terms
  usageTerms              String?
  /// Attribution requirements
  attributionRequirements String?
  /// Distribution format
  distributionFormat      String?
  /// Access method
  accessMethod            String?
  /// Download URL
  downloadUrl             String?
  /// API endpoint
  apiEndpoint             String?

  // Metadata Reference
  /// Date when the metadata was created
  metadataCreationDate   String?
  /// Date when the metadata was last reviewed
  metadataReviewDate     String?
  /// Name of the contact person for metadata
  metadataContactName    String?
  /// Address of the contact person
  metadataContactAddress String? @db.Text
  /// Email of the contact person
  metadataContactEmail   String?
  /// Phone number of the contact person
  metadataContactPhone   String?

  // Form 2: Data Quality Information
  // General Section
  /// Report on logical consistency
  logicalConsistencyReport String? @db.Text
  /// Report on completeness
  completenessReport       String? @db.Text

  // Attribute Accuracy
  /// Report on attribute accuracy
  attributeAccuracyReport String? @db.Text

  // Positional Accuracy (stored as JSON)
  /// Information about horizontal and vertical accuracy
  positionalAccuracy Json?

  // Source Information (stored as JSON)
  /// Information about the source of the dataset
  sourceInformation Json?

  // Data Processing Information
  /// Description of processing steps
  processingDescription String? @db.Text
  /// Version of software used for processing
  softwareVersion       String?
  /// Date when the data was processed
  processedDate         String?

  // Processor Contact Information
  /// Name of the processor
  processorName    String?
  /// Email of the processor
  processorEmail   String?
  /// Address of the processor
  processorAddress String? @db.Text

  // Form 3: Data Distribution Information
  // Distributor Information
  /// Name of the distributor
  distributorName        String?
  /// Address of the distributor
  distributorAddress     String?  @db.Text
  /// Email of the distributor
  distributorEmail       String?
  /// Phone number of the distributor
  distributorPhone       String?
  /// Website of the distributor
  distributorWebLink     String?
  /// Social media handle of the distributor
  distributorSocialMedia String?
  /// Indicates if distributor is also the custodian
  isCustodian            Boolean? @default(true)
  /// Name of the custodian if different from distributor
  custodianName          String?
  /// Contact information for the custodian if different from distributor
  custodianContact       String?

  // Distribution Details
  /// Statement of liability
  distributionLiability  String? @db.Text
  /// Process for custom orders
  customOrderProcess     String? @db.Text
  /// Technical prerequisites for using the dataset
  technicalPrerequisites String? @db.Text

  // Standard Order Process
  /// Fees for obtaining the dataset
  fees                 String?
  /// Typical time between order and delivery
  turnaroundTime       String?
  /// Instructions for ordering the dataset
  orderingInstructions String? @db.Text
  /// Maximum time for response about dataset availability
  maximumResponseTime  String?

  // Contact details from original Metadata model
  /// Contact person
  contactPerson String?
  /// Contact email
  email         String?
  /// Department
  department    String?

  /// Reference to the user who created this entry
  userId String
  user   User   @relation(fields: [userId], references: [id])

  /// Creation timestamp
  createdAt DateTime @default(now())
  /// Last update timestamp
  updatedAt DateTime @updatedAt

  @@index([userId])
}

/// Token for email verification and password reset
model VerificationToken {
  /// Email or identifier to verify
  identifier String
  /// Verification token
  token      String   @unique
  /// Token expiration timestamp
  expires    DateTime

  @@unique([identifier, token])
}

/// System settings for the application
model Settings {
  /// Unique identifier for the settings record
  id                       String   @id
  /// Site name
  siteName                 String
  /// Site description
  siteDescription          String
  /// Support email address
  supportEmail             String
  /// Maximum upload size in MB
  maxUploadSize            Int
  /// Default language
  defaultLanguage          String
  /// Maintenance mode flag
  maintenanceMode          Boolean  @default(false)
  /// Registration enabled flag
  enableRegistration       Boolean  @default(true)
  /// Email verification required flag
  requireEmailVerification Boolean  @default(true)
  /// Metadata validation required flag
  metadataValidation       Boolean  @default(true)
  /// Auto backup enabled flag
  autoBackup               Boolean  @default(true)
  /// Backup frequency (daily, weekly, monthly)
  backupFrequency          String
  /// Storage provider (local, s3, etc.)
  storageProvider          String
  /// API rate limit per minute
  apiRateLimit             Int
  /// Last update timestamp
  updatedAt                DateTime @updatedAt
}

/// Model for storing form drafts
model Draft {
  /// Unique identifier for the draft
  id          String   @id @default(cuid())
  /// Reference to the user who owns this draft
  userId      String
  /// Title of the draft
  title       String   @default("Untitled Draft")
  /// Draft data as JSON
  data        Json
  /// Last updated timestamp
  lastUpdated String
  /// Creation timestamp
  createdAt   DateTime @default(now())
  /// User who owns this draft
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
`,
      "inlineSchemaHash": "313261d2e5771c4202d0df2329c551dd998a1b6ef7539a0cd5590ebd2eb66bc9",
      "copyEngine": true
    };
    var fs = require("fs");
    config3.dirname = __dirname;
    if (!fs.existsSync(path.join(__dirname, "schema.prisma"))) {
      const alternativePaths = [
        "node_modules/.prisma/client",
        ".prisma/client"
      ];
      const alternativePath = alternativePaths.find((altPath) => {
        return fs.existsSync(path.join(process.cwd(), altPath, "schema.prisma"));
      }) ?? alternativePaths[0];
      config3.dirname = path.join(process.cwd(), alternativePath);
      config3.isBundled = true;
    }
    config3.runtimeDataModel = JSON.parse(`{"models":{"Account":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"cuid","args":[1]},"isGenerated":false,"isUpdatedAt":false,"documentation":"Unique identifier for the account"},{"name":"userId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Reference to the user who owns this account"},{"name":"type","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Type of the account (oauth, email, etc.)"},{"name":"provider","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"OAuth provider name"},{"name":"providerAccountId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Account ID from the provider"},{"name":"refresh_token","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"OAuth refresh token"},{"name":"access_token","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"OAuth access token"},{"name":"expires_at","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Token expiration timestamp"},{"name":"token_type","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"OAuth token type"},{"name":"scope","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"OAuth scope"},{"name":"id_token","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"OAuth ID token"},{"name":"session_state","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"OAuth session state"},{"name":"user","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","nativeType":null,"relationName":"AccountToUser","relationFromFields":["userId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[["provider","providerAccountId"]],"uniqueIndexes":[{"name":null,"fields":["provider","providerAccountId"]}],"isGenerated":false,"documentation":"Authentication account information for OAuth providers"},"Session":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"cuid","args":[1]},"isGenerated":false,"isUpdatedAt":false,"documentation":"Unique identifier for the session"},{"name":"sessionToken","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Session token used for authentication"},{"name":"userId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Reference to the user who owns this session"},{"name":"expires","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Session expiration timestamp"},{"name":"user","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","nativeType":null,"relationName":"SessionToUser","relationFromFields":["userId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false,"documentation":"User session information"},"User":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false,"documentation":"Unique identifier for the user"},{"name":"name","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"User's full name"},{"name":"email","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"User's email address"},{"name":"emailVerified","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Timestamp of email verification"},{"name":"image","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"User's profile image URL"},{"name":"password","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Hashed password for local authentication"},{"name":"role","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"UserRole","nativeType":null,"default":"USER","isGenerated":false,"isUpdatedAt":false,"documentation":"User's role in the system"},{"name":"organization","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"User's organization name"},{"name":"department","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"User's department within the organization"},{"name":"phone","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"User's contact phone number"},{"name":"accounts","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Account","nativeType":null,"relationName":"AccountToUser","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"sessions","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Session","nativeType":null,"relationName":"SessionToUser","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"metadata","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Metadata","nativeType":null,"relationName":"MetadataToUser","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"drafts","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Draft","nativeType":null,"relationName":"DraftToUser","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false,"documentation":"User account information"},"Metadata":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false,"documentation":"Unique identifier for the metadata entry"},{"name":"title","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Title of the dataset (legacy field - use dataName instead)"},{"name":"author","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Author of the dataset (legacy field)"},{"name":"organization","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Organization name (legacy field)"},{"name":"dateFrom","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Start date of the dataset (legacy field)"},{"name":"dateTo","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"End date of the dataset (legacy field)"},{"name":"frameworkType","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Framework type (legacy field - use dataType instead)"},{"name":"categories","kind":"scalar","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":[],"isGenerated":false,"isUpdatedAt":false,"documentation":"Categories of the dataset (legacy field)"},{"name":"numFeatures","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Number of features (legacy field)"},{"name":"softwareReqs","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Software requirements (legacy field - use technicalPrerequisites instead)"},{"name":"updateCycle","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Update cycle (legacy field - use updateFrequency instead)"},{"name":"lastUpdate","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Last update date (legacy field)"},{"name":"nextUpdate","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Next update date (legacy field)"},{"name":"dataType","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Type of data (Raster, Vector, Table)"},{"name":"dataName","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Name of the dataset"},{"name":"cloudCoverPercentage","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Percentage of cloud cover for imagery"},{"name":"productionDate","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Date when the dataset was produced"},{"name":"fundamentalDatasets","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Json","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Information about fundamental dataset types"},{"name":"abstract","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["Text",[]],"isGenerated":false,"isUpdatedAt":false,"documentation":"Abstract/description of the dataset"},{"name":"purpose","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["Text",[]],"isGenerated":false,"isUpdatedAt":false,"documentation":"Purpose of the dataset"},{"name":"thumbnailUrl","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"URL to the thumbnail image"},{"name":"imageName","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Name of the image file"},{"name":"coordinateUnit","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Unit system for coordinates (DD or DMS)"},{"name":"minLatitude","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Float","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Southernmost latitude value"},{"name":"minLongitude","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Float","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Westernmost longitude value"},{"name":"maxLatitude","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Float","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Northernmost latitude value"},{"name":"maxLongitude","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Float","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Easternmost longitude value"},{"name":"coordinateSystem","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Coordinate system used"},{"name":"projection","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Projection used"},{"name":"scale","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Scale of the dataset"},{"name":"resolution","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Resolution of the dataset"},{"name":"accuracyLevel","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Accuracy level"},{"name":"completeness","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Completeness percentage"},{"name":"consistencyCheck","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Boolean","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Consistency check status"},{"name":"validationStatus","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Validation status"},{"name":"fileFormat","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"File format"},{"name":"fileSize","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"BigInt","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"File size in bytes"},{"name":"country","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Country covered by the dataset"},{"name":"geopoliticalZone","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Geopolitical zone within Nigeria"},{"name":"state","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"State or province"},{"name":"lga","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Local Government Area"},{"name":"townCity","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Town or city"},{"name":"assessment","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Completion status (Complete or Incomplete)"},{"name":"updateFrequency","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Frequency of updates (Monthly, Quarterly, etc.)"},{"name":"accessConstraints","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["Text",[]],"isGenerated":false,"isUpdatedAt":false,"documentation":"Limitations on access to the dataset"},{"name":"useConstraints","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["Text",[]],"isGenerated":false,"isUpdatedAt":false,"documentation":"Limitations on use of the dataset"},{"name":"otherConstraints","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["Text",[]],"isGenerated":false,"isUpdatedAt":false,"documentation":"Other constraints or legal prerequisites"},{"name":"accessRestrictions","kind":"scalar","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":[],"isGenerated":false,"isUpdatedAt":false,"documentation":"Access restrictions"},{"name":"licenseType","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"License type"},{"name":"usageTerms","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Usage terms"},{"name":"attributionRequirements","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Attribution requirements"},{"name":"distributionFormat","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Distribution format"},{"name":"accessMethod","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Access method"},{"name":"downloadUrl","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Download URL"},{"name":"apiEndpoint","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"API endpoint"},{"name":"metadataCreationDate","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Date when the metadata was created"},{"name":"metadataReviewDate","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Date when the metadata was last reviewed"},{"name":"metadataContactName","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Name of the contact person for metadata"},{"name":"metadataContactAddress","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["Text",[]],"isGenerated":false,"isUpdatedAt":false,"documentation":"Address of the contact person"},{"name":"metadataContactEmail","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Email of the contact person"},{"name":"metadataContactPhone","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Phone number of the contact person"},{"name":"logicalConsistencyReport","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["Text",[]],"isGenerated":false,"isUpdatedAt":false,"documentation":"Report on logical consistency"},{"name":"completenessReport","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["Text",[]],"isGenerated":false,"isUpdatedAt":false,"documentation":"Report on completeness"},{"name":"attributeAccuracyReport","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["Text",[]],"isGenerated":false,"isUpdatedAt":false,"documentation":"Report on attribute accuracy"},{"name":"positionalAccuracy","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Json","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Information about horizontal and vertical accuracy"},{"name":"sourceInformation","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Json","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Information about the source of the dataset"},{"name":"processingDescription","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["Text",[]],"isGenerated":false,"isUpdatedAt":false,"documentation":"Description of processing steps"},{"name":"softwareVersion","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Version of software used for processing"},{"name":"processedDate","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Date when the data was processed"},{"name":"processorName","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Name of the processor"},{"name":"processorEmail","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Email of the processor"},{"name":"processorAddress","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["Text",[]],"isGenerated":false,"isUpdatedAt":false,"documentation":"Address of the processor"},{"name":"distributorName","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Name of the distributor"},{"name":"distributorAddress","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["Text",[]],"isGenerated":false,"isUpdatedAt":false,"documentation":"Address of the distributor"},{"name":"distributorEmail","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Email of the distributor"},{"name":"distributorPhone","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Phone number of the distributor"},{"name":"distributorWebLink","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Website of the distributor"},{"name":"distributorSocialMedia","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Social media handle of the distributor"},{"name":"isCustodian","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":true,"isGenerated":false,"isUpdatedAt":false,"documentation":"Indicates if distributor is also the custodian"},{"name":"custodianName","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Name of the custodian if different from distributor"},{"name":"custodianContact","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Contact information for the custodian if different from distributor"},{"name":"distributionLiability","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["Text",[]],"isGenerated":false,"isUpdatedAt":false,"documentation":"Statement of liability"},{"name":"customOrderProcess","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["Text",[]],"isGenerated":false,"isUpdatedAt":false,"documentation":"Process for custom orders"},{"name":"technicalPrerequisites","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["Text",[]],"isGenerated":false,"isUpdatedAt":false,"documentation":"Technical prerequisites for using the dataset"},{"name":"fees","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Fees for obtaining the dataset"},{"name":"turnaroundTime","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Typical time between order and delivery"},{"name":"orderingInstructions","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["Text",[]],"isGenerated":false,"isUpdatedAt":false,"documentation":"Instructions for ordering the dataset"},{"name":"maximumResponseTime","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Maximum time for response about dataset availability"},{"name":"contactPerson","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Contact person"},{"name":"email","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Contact email"},{"name":"department","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Department"},{"name":"userId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Reference to the user who created this entry"},{"name":"user","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","nativeType":null,"relationName":"MetadataToUser","relationFromFields":["userId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false,"documentation":"Creation timestamp"},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true,"documentation":"Last update timestamp"}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false,"documentation":"Geospatial metadata information following NGDI standards"},"VerificationToken":{"dbName":null,"schema":null,"fields":[{"name":"identifier","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Email or identifier to verify"},{"name":"token","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Verification token"},{"name":"expires","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Token expiration timestamp"}],"primaryKey":null,"uniqueFields":[["identifier","token"]],"uniqueIndexes":[{"name":null,"fields":["identifier","token"]}],"isGenerated":false,"documentation":"Token for email verification and password reset"},"Settings":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Unique identifier for the settings record"},{"name":"siteName","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Site name"},{"name":"siteDescription","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Site description"},{"name":"supportEmail","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Support email address"},{"name":"maxUploadSize","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Maximum upload size in MB"},{"name":"defaultLanguage","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Default language"},{"name":"maintenanceMode","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":false,"isGenerated":false,"isUpdatedAt":false,"documentation":"Maintenance mode flag"},{"name":"enableRegistration","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":true,"isGenerated":false,"isUpdatedAt":false,"documentation":"Registration enabled flag"},{"name":"requireEmailVerification","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":true,"isGenerated":false,"isUpdatedAt":false,"documentation":"Email verification required flag"},{"name":"metadataValidation","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":true,"isGenerated":false,"isUpdatedAt":false,"documentation":"Metadata validation required flag"},{"name":"autoBackup","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":true,"isGenerated":false,"isUpdatedAt":false,"documentation":"Auto backup enabled flag"},{"name":"backupFrequency","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Backup frequency (daily, weekly, monthly)"},{"name":"storageProvider","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Storage provider (local, s3, etc.)"},{"name":"apiRateLimit","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"API rate limit per minute"},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true,"documentation":"Last update timestamp"}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false,"documentation":"System settings for the application"},"Draft":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"cuid","args":[1]},"isGenerated":false,"isUpdatedAt":false,"documentation":"Unique identifier for the draft"},{"name":"userId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Reference to the user who owns this draft"},{"name":"title","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":"Untitled Draft","isGenerated":false,"isUpdatedAt":false,"documentation":"Title of the draft"},{"name":"data","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Json","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Draft data as JSON"},{"name":"lastUpdated","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false,"documentation":"Last updated timestamp"},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false,"documentation":"Creation timestamp"},{"name":"user","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","nativeType":null,"relationName":"DraftToUser","relationFromFields":["userId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false,"documentation":"User who owns this draft"}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false,"documentation":"Model for storing form drafts"}},"enums":{"UserRole":{"values":[{"name":"USER","dbName":null,"documentation":"Regular user with basic access"},{"name":"ADMIN","dbName":null,"documentation":"System administrator with full access"},{"name":"NODE_OFFICER","dbName":null,"documentation":"Node officer with specific privileges"}],"dbName":null,"documentation":"User roles for access control"}},"types":{}}`);
    defineDmmfProperty2(exports2.Prisma, config3.runtimeDataModel);
    config3.engineWasm = void 0;
    config3.compilerWasm = void 0;
    var { warnEnvConflicts: warnEnvConflicts2 } = require_library();
    warnEnvConflicts2({
      rootEnvPath: config3.relativeEnvPaths.rootEnvPath && path.resolve(config3.dirname, config3.relativeEnvPaths.rootEnvPath),
      schemaEnvPath: config3.relativeEnvPaths.schemaEnvPath && path.resolve(config3.dirname, config3.relativeEnvPaths.schemaEnvPath)
    });
    var PrismaClient = getPrismaClient2(config3);
    exports2.PrismaClient = PrismaClient;
    Object.assign(exports2, Prisma);
    path.join(__dirname, "libquery_engine-darwin.dylib.node");
    path.join(process.cwd(), "node_modules/.prisma/client/libquery_engine-darwin.dylib.node");
    path.join(__dirname, "schema.prisma");
    path.join(process.cwd(), "node_modules/.prisma/client/schema.prisma");
  }
});

// ../../node_modules/.prisma/client/default.js
var require_default = __commonJS({
  "../../node_modules/.prisma/client/default.js"(exports2, module2) {
    "use strict";
    module2.exports = { ...require_client() };
  }
});

// ../../node_modules/@prisma/client/default.js
var require_default2 = __commonJS({
  "../../node_modules/@prisma/client/default.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      ...require_default()
    };
  }
});

// src/utils/permissions.ts
var permissions_exports = {};
__export(permissions_exports, {
  canAccessOwnResource: () => canAccessOwnResource,
  createDynamicCondition: () => createDynamicCondition,
  getAllPermissionsForRole: () => getAllPermissionsForRole,
  getAllPermissionsForUser: () => getAllPermissionsForUser,
  getPermissionByActionAndSubject: () => getPermissionByActionAndSubject,
  getPermissionsByAction: () => getPermissionsByAction,
  getPermissionsBySubject: () => getPermissionsBySubject,
  getResourceActivity: () => getResourceActivity,
  getUserActivity: () => getUserActivity,
  grantPermissionToUser: () => grantPermissionToUser,
  hasAllPermissions: () => hasAllPermissions,
  hasAnyPermission: () => hasAnyPermission,
  hasPermission: () => hasPermission,
  logPermissionCheck: () => logPermissionCheck,
  revokePermissionFromUser: () => revokePermissionFromUser
});
async function getAllPermissionsForRole(roleId) {
  const role = await import_db.prisma.role.findUnique({
    where: { id: roleId },
    include: {
      rolePermissions: {
        include: {
          permission: true
        }
      }
    }
  });
  if (!role) {
    return [];
  }
  return role.rolePermissions.map((rp2) => rp2.permission);
}
async function getAllPermissionsForUser(userId) {
  const user = await import_db.prisma.user.findUnique({
    where: { id: userId },
    include: {
      customRole: {
        include: {
          rolePermissions: {
            include: {
              permission: true
            }
          }
        }
      },
      userPermissions: {
        where: {
          granted: true,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: /* @__PURE__ */ new Date() } }
          ]
        },
        include: {
          permission: true
        }
      }
    }
  });
  if (!user) {
    return [];
  }
  const rolePermissions = user.customRole ? user.customRole.rolePermissions.map((rp2) => ({
    ...rp2.permission
  })) : [];
  const userPermissions = user.userPermissions.map((up2) => ({
    ...up2.permission,
    conditions: up2.conditions
  }));
  const allPermissions = [...rolePermissions];
  for (const userPerm of userPermissions) {
    const existingIndex = allPermissions.findIndex(
      (p) => p.action === userPerm.action && p.subject === userPerm.subject
    );
    if (existingIndex >= 0) {
      allPermissions[existingIndex] = userPerm;
    } else {
      allPermissions.push(userPerm);
    }
  }
  return allPermissions;
}
async function hasPermission(user, action, subject, resource) {
  if (user.role === "ADMIN") {
    return { granted: true };
  }
  const userPermissions = await getAllPermissionsForUser(user.id);
  const permission = userPermissions.find(
    (p) => p.action === action && p.subject === subject
  );
  if (!permission) {
    return {
      granted: false,
      reason: `User does not have the ${action}:${subject} permission`
    };
  }
  if (permission.conditions || resource) {
    if (permission.conditions?.dynamic) {
      try {
        const dynamicResult = permission.conditions.dynamic.evaluate(user, resource);
        if (!dynamicResult) {
          return {
            granted: false,
            reason: "Dynamic condition evaluation failed"
          };
        }
      } catch (error) {
        console.error("Error evaluating dynamic condition:", error);
        return {
          granted: false,
          reason: "Error evaluating dynamic condition"
        };
      }
    }
    if (permission.conditions?.organizationId && resource?.organizationId) {
      if (permission.conditions.organizationId !== resource.organizationId) {
        return {
          granted: false,
          reason: "Organization condition not met"
        };
      }
    }
    if (permission.conditions?.userId && resource?.userId) {
      if (permission.conditions.userId !== resource.userId && user.id !== resource.userId) {
        return {
          granted: false,
          reason: "User ownership condition not met"
        };
      }
    }
  }
  return { granted: true };
}
async function hasAllPermissions(user, permissions, resource) {
  if (user.role === "ADMIN") {
    return { granted: true };
  }
  for (const { action, subject } of permissions) {
    const result = await hasPermission(user, action, subject, resource);
    if (!result.granted) {
      return result;
    }
  }
  return { granted: true };
}
async function hasAnyPermission(user, permissions, resource) {
  if (user.role === "ADMIN") {
    return { granted: true };
  }
  for (const { action, subject } of permissions) {
    const result = await hasPermission(user, action, subject, resource);
    if (result.granted) {
      return result;
    }
  }
  return {
    granted: false,
    reason: "User does not have any of the required permissions"
  };
}
async function canAccessOwnResource(user, action, subject, resourceUserId) {
  if (user.role === "ADMIN") {
    return { granted: true };
  }
  if (user.id === resourceUserId) {
    return { granted: true };
  }
  return await hasPermission(user, action, subject, { userId: resourceUserId });
}
async function logPermissionCheck(user, action, subject, resource, result, ipAddress, userAgent) {
  try {
    await import_db.prisma.activityLog.create({
      data: {
        userId: user.id,
        action,
        subject,
        subjectId: resource?.id,
        metadata: {
          result,
          resource: resource ? JSON.stringify(resource) : null,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        },
        ipAddress,
        userAgent
      }
    });
  } catch (error) {
    console.error("Error logging permission check:", error);
  }
}
async function getUserActivity(userId, limit = 10) {
  return import_db.prisma.activityLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit
  });
}
async function getResourceActivity(subject, subjectId, limit = 10) {
  return import_db.prisma.activityLog.findMany({
    where: { subject, subjectId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });
}
function createDynamicCondition(conditionFn) {
  return {
    evaluate: conditionFn
  };
}
async function grantPermissionToUser(userId, permissionId, conditions, expiresAt) {
  return import_db.prisma.userPermission.upsert({
    where: {
      userId_permissionId: {
        userId,
        permissionId
      }
    },
    update: {
      granted: true,
      conditions,
      expiresAt
    },
    create: {
      userId,
      permissionId,
      granted: true,
      conditions,
      expiresAt
    }
  });
}
async function revokePermissionFromUser(userId, permissionId) {
  await import_db.prisma.userPermission.delete({
    where: {
      userId_permissionId: {
        userId,
        permissionId
      }
    }
  });
}
async function getPermissionsBySubject(subject) {
  return import_db.prisma.permission.findMany({
    where: { subject }
  });
}
async function getPermissionsByAction(action) {
  return import_db.prisma.permission.findMany({
    where: { action }
  });
}
async function getPermissionByActionAndSubject(action, subject) {
  return import_db.prisma.permission.findUnique({
    where: {
      action_subject: {
        action,
        subject
      }
    }
  });
}
var init_permissions = __esm({
  "src/utils/permissions.ts"() {
    "use strict";
    init_prisma();
  }
});

// src/index.ts
var src_exports = {};
__export(src_exports, {
  default: () => src_default
});
module.exports = __toCommonJS(src_exports);
var import_hono5 = require("hono");
var import_cors = require("hono/cors");
var import_logger4 = require("hono/logger");
var import_pretty_json = require("hono/pretty-json");
var import_zod_openapi9 = require("@hono/zod-openapi");
var import_swagger_ui = require("@hono/swagger-ui");

// src/routes/auth.routes.ts
var import_hono = require("hono");
var import_zod_validator = require("@hono/zod-validator");
init_prisma();

// src/middleware/error-handler.ts
var import_http_exception = require("hono/http-exception");

// src/types/error.types.ts
var AuthErrorCode = /* @__PURE__ */ ((AuthErrorCode2) => {
  AuthErrorCode2["INVALID_CREDENTIALS"] = "AUTH001";
  AuthErrorCode2["ACCOUNT_LOCKED"] = "AUTH002";
  AuthErrorCode2["TOKEN_EXPIRED"] = "AUTH003";
  AuthErrorCode2["INSUFFICIENT_PERMISSIONS"] = "AUTH004";
  AuthErrorCode2["TOKEN_BLACKLISTED"] = "AUTH005";
  AuthErrorCode2["RATE_LIMITED"] = "AUTH006";
  AuthErrorCode2["INVALID_TOKEN"] = "AUTH007";
  AuthErrorCode2["EMAIL_NOT_VERIFIED"] = "AUTH008";
  AuthErrorCode2["PASSWORD_POLICY"] = "AUTH009";
  AuthErrorCode2["MFA_REQUIRED"] = "AUTH010";
  AuthErrorCode2["FORBIDDEN"] = "AUTH011";
  AuthErrorCode2["CSRF_TOKEN_INVALID"] = "AUTH012";
  AuthErrorCode2["INVALID_CSRF"] = "AUTH013";
  AuthErrorCode2["REGISTRATION_FAILED"] = "AUTH014";
  AuthErrorCode2["VERIFICATION_FAILED"] = "AUTH015";
  AuthErrorCode2["RESET_PASSWORD_FAILED"] = "AUTH016";
  AuthErrorCode2["SERVER_ERROR"] = "AUTH017";
  return AuthErrorCode2;
})(AuthErrorCode || {});
var AuthError = class extends Error {
  constructor(code, message, status = 401, details) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
    this.name = "AuthError";
  }
};

// src/middleware/error-handler.ts
var ApiError = class extends Error {
  constructor(message, status = 500, code = "SYS001" /* INTERNAL_SERVER_ERROR */, details) {
    super(message);
    this.message = message;
    this.status = status;
    this.code = code;
    this.details = details;
    this.name = "ApiError";
  }
};
var errorMiddleware = async (c, next) => {
  try {
    await next();
  } catch (error) {
    console.error("API Error:", error);
    const errorResponse = formatError(error);
    if (errorResponse.status >= 500) {
      console.error("Server Error:", {
        path: c.req.path,
        method: c.req.method,
        error: error instanceof Error ? error.stack : error
      });
    }
    return c.json(errorResponse.body, errorResponse.status);
  }
};
function formatError(error) {
  if (error instanceof ApiError) {
    return {
      status: error.status,
      body: {
        success: false,
        code: error.code,
        message: error.message,
        details: error.details
      }
    };
  }
  if (error instanceof AuthError) {
    return {
      status: error.status,
      body: {
        success: false,
        code: error.code,
        message: error.message,
        details: error.details
      }
    };
  }
  if (error instanceof import_http_exception.HTTPException) {
    return {
      status: error.status,
      body: {
        success: false,
        code: mapHttpStatusToErrorCode(error.status),
        message: error.message || getDefaultMessageForStatus(error.status),
        details: error.res?.body ? { body: error.res.body } : void 0
      }
    };
  }
  if (error instanceof Error) {
    if (error.name === "PrismaClientKnownRequestError") {
      return handlePrismaError(error);
    }
    return {
      status: 500,
      body: {
        success: false,
        code: "SYS001" /* INTERNAL_SERVER_ERROR */,
        message: "An unexpected error occurred",
        details: process.env.NODE_ENV === "development" ? { name: error.name, message: error.message } : void 0
      }
    };
  }
  return {
    status: 500,
    body: {
      success: false,
      code: "SYS001" /* INTERNAL_SERVER_ERROR */,
      message: "An unexpected error occurred",
      details: process.env.NODE_ENV === "development" ? { error: String(error) } : void 0
    }
  };
}
function mapHttpStatusToErrorCode(status) {
  switch (status) {
    case 400:
      return "REQ001" /* BAD_REQUEST */;
    case 401:
      return "AUTH007" /* INVALID_TOKEN */;
    case 403:
      return "AUTH011" /* FORBIDDEN */;
    case 404:
      return "REQ003" /* RESOURCE_NOT_FOUND */;
    case 405:
      return "REQ004" /* METHOD_NOT_ALLOWED */;
    case 409:
      return "REQ005" /* CONFLICT */;
    case 413:
      return "REQ006" /* PAYLOAD_TOO_LARGE */;
    case 422:
      return "REQ002" /* VALIDATION_ERROR */;
    case 500:
      return "SYS001" /* INTERNAL_SERVER_ERROR */;
    case 502:
      return "SYS003" /* BAD_GATEWAY */;
    case 503:
      return "SYS002" /* SERVICE_UNAVAILABLE */;
    case 504:
      return "SYS004" /* GATEWAY_TIMEOUT */;
    default:
      return "SYS001" /* INTERNAL_SERVER_ERROR */;
  }
}
function getDefaultMessageForStatus(status) {
  switch (status) {
    case 400:
      return "Bad request";
    case 401:
      return "Unauthorized";
    case 403:
      return "Forbidden";
    case 404:
      return "Resource not found";
    case 405:
      return "Method not allowed";
    case 409:
      return "Conflict";
    case 413:
      return "Payload too large";
    case 422:
      return "Validation error";
    case 500:
      return "Internal server error";
    case 502:
      return "Bad gateway";
    case 503:
      return "Service unavailable";
    case 504:
      return "Gateway timeout";
    default:
      return "An error occurred";
  }
}
function handlePrismaError(error) {
  const details = {};
  if (error.message.includes("Unique constraint failed")) {
    return {
      status: 409,
      body: {
        success: false,
        code: "DB003" /* UNIQUE_VIOLATION */,
        message: "A record with this data already exists",
        details
      }
    };
  }
  if (error.message.includes("Foreign key constraint failed")) {
    return {
      status: 400,
      body: {
        success: false,
        code: "DB004" /* FOREIGN_KEY_VIOLATION */,
        message: "Referenced record does not exist",
        details
      }
    };
  }
  return {
    status: 500,
    body: {
      success: false,
      code: "DB001" /* DATABASE_ERROR */,
      message: "Database operation failed",
      details: process.env.NODE_ENV === "development" ? { error: error.message } : void 0
    }
  };
}
var errorHandler = (err, c) => {
  if (!c) {
    const { status: status2, body: body2 } = formatError(err);
    return { status: status2, body: body2 };
  }
  const { status, body } = formatError(err);
  return c.json(body, status);
};

// src/routes/auth.routes.ts
var crypto3 = __toESM(require("crypto"));

// src/utils/jwt.ts
var import_jose = require("jose");
init_config();
var textEncoder = new TextEncoder();
var jwtSecret = textEncoder.encode(config2.jwt.secret);
var refreshSecret = textEncoder.encode(config2.jwt.refreshSecret);
function generateJwtId() {
  return crypto.randomUUID();
}
async function generateToken(payload, expiresIn = config2.jwt.expiresIn, options = {}) {
  let jwt = new import_jose.SignJWT({ ...payload }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setIssuedAt().setExpirationTime(expiresIn).setSubject(payload.userId);
  if (options.includeJti !== false) {
    jwt = jwt.setJti(payload.jti || generateJwtId());
  }
  if (options.issuer || config2.jwt.issuer) {
    jwt = jwt.setIssuer(options.issuer || config2.jwt.issuer);
  }
  if (options.audience || config2.jwt.audience) {
    jwt = jwt.setAudience(options.audience || config2.jwt.audience);
  }
  const token = await jwt.sign(jwtSecret);
  return token;
}
async function generateRefreshToken(payload, expiresIn = config2.jwt.refreshExpiresIn, options = {}) {
  let jwt = new import_jose.SignJWT({
    ...payload,
    // Add token family if provided (for refresh token rotation)
    family: options.family || payload.family || generateJwtId()
  }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setIssuedAt().setExpirationTime(expiresIn).setSubject(payload.userId);
  if (options.includeJti !== false) {
    jwt = jwt.setJti(payload.jti || generateJwtId());
  }
  if (options.issuer || config2.jwt.issuer) {
    jwt = jwt.setIssuer(options.issuer || config2.jwt.issuer);
  }
  if (options.audience || config2.jwt.audience) {
    jwt = jwt.setAudience(options.audience || config2.jwt.audience);
  }
  const token = await jwt.sign(refreshSecret);
  return token;
}
async function revokeToken(token, expiresIn = config2.jwt.expiresIn) {
  const { redisService: redisService2 } = await Promise.resolve().then(() => (init_redis_service(), redis_service_exports));
  if (redisService2.isAvailable()) {
    await redisService2.blacklistToken(token, expiresIn);
  }
}
async function storeTokenFamily(family, tokenId, expiresIn = config2.jwt.refreshExpiresIn) {
  const { redisService: redisService2 } = await Promise.resolve().then(() => (init_redis_service(), redis_service_exports));
  if (redisService2.isAvailable()) {
    const key = `token_family:${family}`;
    await redisService2.set(key, tokenId, expiresIn);
  }
}
async function verifyRefreshToken(token, options = {}) {
  try {
    if (options.checkBlacklist !== false) {
      const { redisService: redisService2 } = await Promise.resolve().then(() => (init_redis_service(), redis_service_exports));
      if (redisService2.isAvailable() && await redisService2.isTokenBlacklisted(token)) {
        throw new Error("Refresh token has been revoked");
      }
    }
    const { payload } = await (0, import_jose.jwtVerify)(token, refreshSecret, {
      // Add additional verification options
      issuer: options.issuer || config2.jwt.issuer,
      audience: options.audience || config2.jwt.audience
    });
    if (options.checkFamily !== false && payload.family) {
      const { redisService: redisService2 } = await Promise.resolve().then(() => (init_redis_service(), redis_service_exports));
      if (redisService2.isAvailable()) {
        const familyKey = `token_family:${payload.family}`;
        const latestTokenId = await redisService2.get(familyKey);
        if (latestTokenId && latestTokenId !== payload.jti) {
          await redisService2.blacklistToken(token);
          throw new Error("Refresh token has been superseded");
        }
      }
    }
    return payload;
  } catch (error) {
    console.error("Refresh token verification error:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Invalid refresh token");
  }
}

// src/services/token-validation.service.ts
var import_jose2 = require("jose");
init_config();
init_redis_service();
init_prisma();

// src/services/security-log.service.ts
init_prisma();
var SecurityLogService = class {
  /**
   * Log a security event
   */
  async logEvent(entry) {
    try {
      if (import_db.prisma) {
        try {
          await import_db.prisma.securityLog.create({
            data: {
              userId: entry.userId,
              email: entry.email,
              eventType: entry.eventType,
              ipAddress: entry.ipAddress,
              userAgent: entry.userAgent,
              deviceId: entry.deviceId,
              details: entry.details ? JSON.stringify(entry.details) : null
            }
          });
        } catch (error) {
          console.warn(
            "SecurityLog model not available, logging to console only"
          );
          this.logToConsole(entry);
        }
      } else {
        this.logToConsole(entry);
      }
    } catch (error) {
      console.error("Error logging security event:", error);
      this.logToConsole(entry);
    }
  }
  /**
   * Log a security event to the console
   */
  logToConsole(entry) {
    const timestamp2 = (/* @__PURE__ */ new Date()).toISOString();
    const userInfo = entry.userId ? `User: ${entry.userId}` : entry.email ? `Email: ${entry.email}` : "Anonymous";
    const location = entry.ipAddress ? `IP: ${entry.ipAddress}` : "";
    const device = entry.deviceId ? `Device: ${entry.deviceId}` : entry.userAgent ? `UA: ${entry.userAgent}` : "";
    console.log(
      `[SECURITY] ${timestamp2} | ${entry.eventType} | ${userInfo} | ${location} | ${device}`
    );
    if (entry.details) {
      console.log(`[SECURITY] Details:`, entry.details);
    }
  }
  /**
   * Log a successful login
   */
  async logLoginSuccess(userId, email, ipAddress, userAgent, deviceId) {
    await this.logEvent({
      userId,
      email,
      eventType: "LOGIN_SUCCESS" /* LOGIN_SUCCESS */,
      ipAddress,
      userAgent,
      deviceId
    });
  }
  /**
   * Log a failed login attempt
   */
  async logLoginFailure(email, ipAddress, userAgent, reason) {
    await this.logEvent({
      email,
      eventType: "LOGIN_FAILURE" /* LOGIN_FAILURE */,
      ipAddress,
      userAgent,
      details: reason ? { reason } : void 0
    });
  }
  /**
   * Log a logout event
   */
  async logLogout(userId, email, ipAddress, userAgent) {
    await this.logEvent({
      userId,
      email,
      eventType: "LOGOUT" /* LOGOUT */,
      ipAddress,
      userAgent
    });
  }
  /**
   * Log an account lockout
   */
  async logAccountLocked(userId, email, reason, ipAddress) {
    await this.logEvent({
      userId,
      email,
      eventType: "ACCOUNT_LOCKED" /* ACCOUNT_LOCKED */,
      ipAddress,
      details: { reason }
    });
  }
  /**
   * Log suspicious activity
   */
  async logSuspiciousActivity(email, userId, activityType, ipAddress, details) {
    await this.logEvent({
      userId,
      email,
      eventType: "SUSPICIOUS_ACTIVITY" /* SUSPICIOUS_ACTIVITY */,
      ipAddress,
      details: {
        activityType,
        ...details
      }
    });
  }
  /**
   * Log a CSRF violation
   */
  async logCsrfViolation(ipAddress, userAgent, path) {
    await this.logEvent({
      eventType: "CSRF_VIOLATION" /* CSRF_VIOLATION */,
      ipAddress,
      userAgent,
      details: { path }
    });
  }
  /**
   * Log a rate limit exceeded event
   */
  async logRateLimitExceeded(ipAddress, path, method) {
    await this.logEvent({
      eventType: "RATE_LIMIT_EXCEEDED" /* RATE_LIMIT_EXCEEDED */,
      ipAddress,
      details: { path, method }
    });
  }
};
var securityLogService = new SecurityLogService();

// src/services/token-validation.service.ts
var textEncoder2 = new TextEncoder();
var jwtSecret2 = textEncoder2.encode(config2.jwt.secret);
var refreshSecret2 = textEncoder2.encode(config2.jwt.refreshSecret);
var tokenCache = /* @__PURE__ */ new Map();
var CACHE_EXPIRY = 5 * 60 * 1e3;
var TokenValidationService = class {
  /**
   * Validate an access token with full security checks
   */
  async validateAccessToken(token, options = {}) {
    try {
      const cachedResult = this.getCachedValidation(token);
      if (cachedResult) {
        return {
          isValid: true,
          userId: cachedResult.userId,
          email: cachedResult.email,
          role: cachedResult.role,
          exp: cachedResult.expiry
        };
      }
      const quickResult = this.quickValidateToken(token);
      if (!quickResult.isValid) {
        if (options.logFailures && options.clientInfo) {
          await this.logValidationFailure(
            token,
            quickResult.error || "Unknown error",
            options.clientInfo
          );
        }
        return quickResult;
      }
      if (options.checkBlacklist !== false && redisService.isAvailable()) {
        const isBlacklisted = await redisService.isTokenBlacklisted(token);
        if (isBlacklisted) {
          if (options.logFailures && options.clientInfo) {
            await this.logValidationFailure(
              token,
              "Token has been revoked",
              options.clientInfo
            );
          }
          return {
            isValid: false,
            error: "Token has been revoked"
          };
        }
      }
      const { payload } = await (0, import_jose2.jwtVerify)(token, jwtSecret2, {
        issuer: options.issuer || config2.jwt.issuer,
        audience: options.audience || config2.jwt.audience
      });
      const jwtPayload = payload;
      this.cacheValidationResult(token, jwtPayload);
      return {
        isValid: true,
        userId: jwtPayload.userId,
        email: jwtPayload.email,
        role: jwtPayload.role,
        exp: jwtPayload.exp
      };
    } catch (error) {
      if (options.logFailures && options.clientInfo) {
        await this.logValidationFailure(
          token,
          error instanceof Error ? error.message : "Unknown error",
          options.clientInfo
        );
      }
      console.error("Token validation error:", error);
      if (error instanceof Error) {
        if (error.message.includes("expired")) {
          return {
            isValid: false,
            error: "Token has expired"
          };
        }
        return {
          isValid: false,
          error: error.message
        };
      }
      return {
        isValid: false,
        error: "Invalid token"
      };
    }
  }
  /**
   * Validate a refresh token with full security checks
   */
  async validateRefreshToken(token, options = {}) {
    try {
      const quickResult = this.quickValidateToken(token);
      if (!quickResult.isValid) {
        if (options.logFailures && options.clientInfo) {
          await this.logValidationFailure(
            token,
            quickResult.error || "Unknown error",
            options.clientInfo,
            true
          );
        }
        return quickResult;
      }
      if (options.checkBlacklist !== false && redisService.isAvailable()) {
        const isBlacklisted = await redisService.isTokenBlacklisted(token);
        if (isBlacklisted) {
          if (options.logFailures && options.clientInfo) {
            await this.logValidationFailure(
              token,
              "Refresh token has been revoked",
              options.clientInfo,
              true
            );
          }
          return {
            isValid: false,
            error: "Refresh token has been revoked"
          };
        }
      }
      const { payload } = await (0, import_jose2.jwtVerify)(token, refreshSecret2, {
        issuer: options.issuer || config2.jwt.issuer,
        audience: options.audience || config2.jwt.audience
      });
      const jwtPayload = payload;
      if (options.checkFamily !== false && jwtPayload.family && redisService.isAvailable()) {
        const familyKey = `token_family:${jwtPayload.family}`;
        const latestTokenId = await redisService.get(familyKey);
        if (latestTokenId && latestTokenId !== jwtPayload.jti) {
          if (options.logFailures && options.clientInfo) {
            await this.logValidationFailure(
              token,
              "Refresh token has been superseded",
              options.clientInfo,
              true
            );
          }
          await redisService.blacklistToken(token);
          return {
            isValid: false,
            error: "Refresh token has been superseded"
          };
        }
      }
      return {
        isValid: true,
        userId: jwtPayload.userId,
        email: jwtPayload.email,
        role: jwtPayload.role,
        exp: jwtPayload.exp,
        details: {
          family: jwtPayload.family,
          jti: jwtPayload.jti
        }
      };
    } catch (error) {
      if (options.logFailures && options.clientInfo) {
        await this.logValidationFailure(
          token,
          error instanceof Error ? error.message : "Unknown error",
          options.clientInfo,
          true
        );
      }
      console.error("Refresh token validation error:", error);
      if (error instanceof Error) {
        if (error.message.includes("expired")) {
          return {
            isValid: false,
            error: "Refresh token has expired"
          };
        }
        return {
          isValid: false,
          error: error.message
        };
      }
      return {
        isValid: false,
        error: "Invalid refresh token"
      };
    }
  }
  /**
   * Quick validation of JWT token (synchronous)
   * This performs basic validation without cryptographic verification
   */
  quickValidateToken(token) {
    try {
      if (!token || token.trim() === "") {
        return { isValid: false, error: "Empty token provided" };
      }
      if (!token.includes(".") || token.split(".").length !== 3) {
        return {
          isValid: false,
          error: "Invalid token format (not a JWT)"
        };
      }
      try {
        const decoded = (0, import_jose2.decodeJwt)(token);
        const currentTime = Math.floor(Date.now() / 1e3);
        if (decoded.exp && decoded.exp < currentTime) {
          return {
            isValid: false,
            error: "Token expired",
            exp: decoded.exp
          };
        }
        const userId = typeof decoded.sub === "string" ? decoded.sub : typeof decoded.userId === "string" ? decoded.userId : "";
        if (!userId) {
          return { isValid: false, error: "Missing user ID in token" };
        }
        return {
          isValid: true,
          userId,
          email: typeof decoded.email === "string" ? decoded.email : void 0,
          role: typeof decoded.role === "string" ? decoded.role : void 0,
          exp: typeof decoded.exp === "number" ? decoded.exp : void 0
        };
      } catch (decodeError) {
        return { isValid: false, error: "Failed to decode token" };
      }
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : "Unknown validation error"
      };
    }
  }
  /**
   * Get cached validation result
   */
  getCachedValidation(token) {
    const cached = tokenCache.get(token);
    if (!cached) {
      return null;
    }
    const now = Date.now();
    if (now - cached.timestamp > CACHE_EXPIRY) {
      tokenCache.delete(token);
      return null;
    }
    const currentTime = Math.floor(now / 1e3);
    if (cached.expiry < currentTime) {
      tokenCache.delete(token);
      return null;
    }
    return cached;
  }
  /**
   * Cache validation result
   */
  cacheValidationResult(token, payload) {
    try {
      if (payload.userId && payload.exp) {
        tokenCache.set(token, {
          userId: payload.userId,
          email: payload.email,
          role: payload.role,
          expiry: payload.exp,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.warn("Failed to cache token validation result:", error);
    }
  }
  /**
   * Log token validation failure
   */
  async logValidationFailure(token, reason, clientInfo, isRefreshToken = false) {
    try {
      let userId;
      let email;
      try {
        const decoded = (0, import_jose2.decodeJwt)(token);
        userId = decoded.sub?.toString() || decoded.userId?.toString();
        email = decoded.email?.toString();
      } catch (error) {
      }
      await securityLogService.logEvent({
        userId,
        email,
        eventType: "TOKEN_VALIDATION_FAILURE" /* TOKEN_VALIDATION_FAILURE */,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        deviceId: clientInfo.deviceId,
        details: {
          reason,
          isRefreshToken,
          tokenFragment: token.length > 10 ? `${token.substring(0, 10)}...` : token
        }
      });
    } catch (error) {
      console.error("Error logging token validation failure:", error);
    }
  }
  /**
   * Validate a user exists and is active
   */
  async validateUser(userId) {
    try {
      const user = await import_db.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, locked: true }
      });
      return !!user && !user.locked;
    } catch (error) {
      console.error("User validation error:", error);
      return false;
    }
  }
  /**
   * Extract token from Authorization header
   */
  extractTokenFromHeader(header) {
    if (!header) {
      throw new AuthError(
        "AUTH007" /* INVALID_TOKEN */,
        "No authorization header provided",
        401
      );
    }
    const [type, token] = header.split(" ");
    if (type !== "Bearer" || !token) {
      throw new AuthError(
        "AUTH007" /* INVALID_TOKEN */,
        "Invalid authorization header format",
        401
      );
    }
    return token;
  }
  /**
   * Get token from request (header or cookie)
   */
  getTokenFromRequest(c) {
    const authHeader = c.req.header("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return this.extractTokenFromHeader(authHeader);
    }
    const cookieHeader = c.req.raw.headers.get("cookie");
    if (cookieHeader) {
      const cookies = cookieHeader.split(";");
      const possibleCookieNames = ["auth_token", "accessToken", "token"];
      for (const cookieName of possibleCookieNames) {
        const authCookie = cookies.find(
          (cookie) => cookie.trim().startsWith(`${cookieName}=`)
        );
        if (authCookie) {
          return authCookie.split("=")[1];
        }
      }
    }
    throw new AuthError(
      "AUTH007" /* INVALID_TOKEN */,
      "No authentication token found",
      401
    );
  }
};
var tokenValidationService = new TokenValidationService();

// src/services/auth.service.ts
init_prisma();
var import_bcryptjs = require("bcryptjs");
var import_jsonwebtoken = require("jsonwebtoken");
var import_http_exception2 = require("hono/http-exception");
var import_client = __toESM(require_default2());
var import_crypto = require("crypto");

// src/types/auth.types.ts
var import_zod_openapi = require("@hono/zod-openapi");
var UserRole = /* @__PURE__ */ ((UserRole3) => {
  UserRole3["ADMIN"] = "ADMIN";
  UserRole3["NODE_OFFICER"] = "NODE_OFFICER";
  UserRole3["USER"] = "USER";
  UserRole3["GUEST"] = "GUEST";
  return UserRole3;
})(UserRole || {});
var passwordSchema = import_zod_openapi.z.string().min(8, "Password must be at least 8 characters").regex(/[A-Z]/, "Must contain at least one uppercase letter").regex(/[a-z]/, "Must contain at least one lowercase letter").regex(/[0-9]/, "Must contain at least one number").regex(/[^A-Za-z0-9]/, "Must contain at least one special character");
var loginSchema = import_zod_openapi.z.object({
  email: import_zod_openapi.z.string().email("Invalid email address").openapi({
    example: "user@example.com",
    description: "User's email address"
  }),
  password: passwordSchema.openapi({
    example: "StrongP@ss123",
    description: "User's password - must contain uppercase, lowercase, number, and special character"
  }),
  // Additional fields for security tracking
  ipAddress: import_zod_openapi.z.string().optional().openapi({
    example: "192.168.1.1",
    description: "Client IP address for security tracking"
  }),
  userAgent: import_zod_openapi.z.string().optional().openapi({
    example: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    description: "Client user agent for security tracking"
  }),
  deviceId: import_zod_openapi.z.string().optional().openapi({
    example: "device-123",
    description: "Client device identifier for security tracking"
  })
}).openapi("LoginRequest");
var registerSchema = import_zod_openapi.z.object({
  name: import_zod_openapi.z.string().min(2, "Name must be at least 2 characters").openapi({
    example: "John Doe",
    description: "User's full name"
  }),
  email: import_zod_openapi.z.string().email("Invalid email address").openapi({
    example: "user@example.com",
    description: "User's email address"
  }),
  password: passwordSchema.openapi({
    example: "StrongP@ss123",
    description: "User's password - must contain uppercase, lowercase, number, and special character"
  }),
  organization: import_zod_openapi.z.string().optional().openapi({
    example: "ACME Corp",
    description: "User's organization"
  }),
  department: import_zod_openapi.z.string().optional().openapi({
    example: "Engineering",
    description: "User's department"
  }),
  phone: import_zod_openapi.z.string().optional().openapi({
    example: "+1234567890",
    description: "User's phone number"
  }),
  // Additional fields for security tracking
  ipAddress: import_zod_openapi.z.string().optional().openapi({
    example: "192.168.1.1",
    description: "Client IP address for security tracking"
  }),
  userAgent: import_zod_openapi.z.string().optional().openapi({
    example: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    description: "Client user agent for security tracking"
  }),
  deviceId: import_zod_openapi.z.string().optional().openapi({
    example: "device-123",
    description: "Client device identifier for security tracking"
  })
}).openapi("RegisterRequest");
var requestPasswordResetSchema = import_zod_openapi.z.object({
  email: import_zod_openapi.z.string().email().openapi({
    example: "user@example.com",
    description: "Email address to send password reset link to"
  })
}).openapi("RequestPasswordResetRequest");
var forgotPasswordSchema = requestPasswordResetSchema;
var resetPasswordSchema = import_zod_openapi.z.object({
  token: import_zod_openapi.z.string().openapi({
    example: "reset-token-123",
    description: "Password reset token"
  }),
  password: import_zod_openapi.z.string().min(8, "Password must be at least 8 characters").openapi({
    example: "newpassword123",
    description: "New password"
  })
}).openapi("ResetPasswordRequest");
var changePasswordSchema = import_zod_openapi.z.object({
  currentPassword: import_zod_openapi.z.string().openapi({
    example: "oldpassword123",
    description: "Current password"
  }),
  newPassword: import_zod_openapi.z.string().min(8, "Password must be at least 8 characters").openapi({
    example: "newpassword123",
    description: "New password"
  })
}).openapi("ChangePasswordRequest");
var refreshTokenSchema = import_zod_openapi.z.object({
  refreshToken: import_zod_openapi.z.string().openapi({
    example: "refresh-token-123",
    description: "Refresh token"
  })
}).openapi("RefreshTokenRequest");
var verifyEmailSchema = import_zod_openapi.z.object({
  token: import_zod_openapi.z.string().openapi({
    example: "verification-token-123",
    description: "Email verification token"
  })
}).openapi("VerifyEmailRequest");
var authResponseSchema = import_zod_openapi.z.object({
  user: import_zod_openapi.z.object({
    id: import_zod_openapi.z.string().openapi({
      example: "user-123",
      description: "User ID"
    }),
    name: import_zod_openapi.z.string().openapi({
      example: "John Doe",
      description: "User's full name"
    }),
    email: import_zod_openapi.z.string().openapi({
      example: "user@example.com",
      description: "User's email address"
    }),
    role: import_zod_openapi.z.nativeEnum(UserRole).openapi({
      example: "USER" /* USER */,
      description: "User's role"
    }),
    organization: import_zod_openapi.z.string().optional().openapi({
      example: "ACME Corp",
      description: "User's organization"
    }),
    department: import_zod_openapi.z.string().optional().openapi({
      example: "Engineering",
      description: "User's department"
    })
  }),
  accessToken: import_zod_openapi.z.string().openapi({
    example: "access-token-123",
    description: "JWT access token"
  }),
  refreshToken: import_zod_openapi.z.string().openapi({
    example: "refresh-token-123",
    description: "JWT refresh token"
  })
}).openapi("AuthResponse");

// src/utils/role-mapper.ts
function mapPrismaRoleToAppRole(prismaRole) {
  switch (prismaRole) {
    case "USER":
      return "USER" /* USER */;
    case "ADMIN":
      return "ADMIN" /* ADMIN */;
    case "NODE_OFFICER":
      return "NODE_OFFICER" /* NODE_OFFICER */;
    default:
      return "USER" /* USER */;
  }
}
function mapAppRoleToPrismaRole(appRole) {
  switch (appRole) {
    case "USER" /* USER */:
      return "USER";
    case "ADMIN" /* ADMIN */:
      return "ADMIN";
    case "NODE_OFFICER" /* NODE_OFFICER */:
      return "NODE_OFFICER";
    default:
      return "USER";
  }
}

// src/services/email.service.ts
init_config();
var import_nodemailer = __toESM(require("nodemailer"));
var EmailService = class {
  /**
   * Send a verification email to a user
   * @param email Email address to send to
   * @param token Verification token
   */
  async sendVerificationEmail(email, token) {
    const verificationUrl = `${config2.frontendUrl}/verify-email?token=${token}`;
    console.log(`\u{1F4E7} Verification email for ${email}:`);
    console.log(`Verification URL: ${verificationUrl}`);
    console.log(`Token: ${token}`);
  }
  /**
   * Send a password reset email to a user
   * @param email Email address to send to
   * @param token Password reset token
   */
  async sendPasswordResetEmail(email, token) {
    const resetUrl = `${config2.frontendUrl}/reset-password/${token}`;
    console.log(`\u{1F4E7} Password reset email for ${email}:`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log(`Token: ${token}`);
  }
  /**
   * Send a welcome email after registration
   */
  async sendWelcomeEmail(email, name) {
    const subject = "Welcome to our platform";
    const html = `
      <h1>Welcome!</h1>
      <p>Hello ${name},</p>
      <p>Thank you for joining our platform. We're excited to have you on board!</p>
      <p>If you have any questions, please don't hesitate to contact our support team.</p>
    `;
    await this.sendEmail(email, subject, html);
  }
  /**
   * Send an email using the configured email provider
   * @param to Recipient email address
   * @param subject Email subject
   * @param html Email HTML content
   */
  async sendEmail(to2, subject, html) {
    console.log(`\u{1F4E7} Email to ${to2}:`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${html}`);
  }
};
var emailService = new EmailService();

// src/services/account-lockout.service.ts
init_prisma();
var DEFAULT_LOCKOUT_CONFIG = {
  maxAttempts: 5,
  lockoutDuration: 15 * 60,
  // 15 minutes
  resetWindow: 60 * 60
  // 1 hour
};
var AccountLockoutService = class {
  constructor(config3 = {}) {
    this.config = { ...DEFAULT_LOCKOUT_CONFIG, ...config3 };
  }
  /**
   * Check if an account is locked
   */
  async isAccountLocked(email) {
    try {
      const user = await import_db.prisma.user.findUnique({
        where: { email },
        select: { locked: true, lockedUntil: true }
      });
      if (!user) {
        return false;
      }
      if (user.locked && user.lockedUntil && user.lockedUntil < /* @__PURE__ */ new Date()) {
        await this.unlockAccount(email);
        return false;
      }
      return user.locked;
    } catch (error) {
      console.error("Error checking account lock status:", error);
      return false;
    }
  }
  /**
   * Record a failed login attempt
   */
  async recordFailedAttempt(email, ipAddress, userAgent) {
    try {
      const now = /* @__PURE__ */ new Date();
      const user = await import_db.prisma.user.findUnique({
        where: { email },
        select: { failedAttempts: true, lastFailedAttempt: true }
      });
      if (user) {
        const shouldReset = user.lastFailedAttempt && now.getTime() - user.lastFailedAttempt.getTime() > this.config.resetWindow * 1e3;
        const newAttemptCount = shouldReset ? 1 : user.failedAttempts + 1;
        await import_db.prisma.user.update({
          where: { email },
          data: {
            failedAttempts: newAttemptCount,
            lastFailedAttempt: now,
            // Lock account if max attempts reached
            locked: newAttemptCount >= this.config.maxAttempts,
            lockedUntil: newAttemptCount >= this.config.maxAttempts ? new Date(now.getTime() + this.config.lockoutDuration * 1e3) : null
          }
        });
        if (newAttemptCount >= this.config.maxAttempts) {
          console.warn(
            `Account ${email} locked after ${newAttemptCount} failed attempts`
          );
          await securityLogService.logEvent({
            email,
            eventType: "ACCOUNT_LOCKED" /* ACCOUNT_LOCKED */,
            ipAddress,
            userAgent,
            details: {
              reason: "Too many failed login attempts",
              attempts: newAttemptCount,
              lockDuration: this.config.lockoutDuration
            }
          });
        }
      }
      await import_db.prisma.failedLogin.upsert({
        where: { email },
        update: {
          attempts: {
            increment: 1
          },
          ipAddress,
          userAgent,
          lastAttempt: now,
          lockedUntil: (user?.failedAttempts || 0) + 1 >= this.config.maxAttempts ? new Date(now.getTime() + this.config.lockoutDuration * 1e3) : null
        },
        create: {
          email,
          attempts: 1,
          ipAddress,
          userAgent,
          firstAttempt: now,
          lastAttempt: now
        }
      });
    } catch (error) {
      console.error("Error recording failed login attempt:", error);
    }
  }
  /**
   * Reset failed attempts counter after successful login
   */
  async resetFailedAttempts(email) {
    try {
      await import_db.prisma.user.update({
        where: { email },
        data: {
          failedAttempts: 0,
          lastFailedAttempt: null,
          locked: false,
          lockedUntil: null
        }
      });
      await import_db.prisma.failedLogin.update({
        where: { email },
        data: {
          attempts: 0,
          resetAt: /* @__PURE__ */ new Date(),
          lockedUntil: null
        }
      });
    } catch (error) {
      console.error("Error resetting failed attempts:", error);
    }
  }
  /**
   * Unlock an account manually
   */
  async unlockAccount(email) {
    try {
      await import_db.prisma.user.update({
        where: { email },
        data: {
          failedAttempts: 0,
          locked: false,
          lockedUntil: null
        }
      });
      await import_db.prisma.failedLogin.update({
        where: { email },
        data: {
          attempts: 0,
          resetAt: /* @__PURE__ */ new Date(),
          lockedUntil: null
        }
      });
      console.log(`Account ${email} unlocked`);
      await securityLogService.logEvent({
        email,
        eventType: "ACCOUNT_UNLOCKED" /* ACCOUNT_UNLOCKED */,
        details: {
          reason: "Manual unlock"
        }
      });
    } catch (error) {
      console.error("Error unlocking account:", error);
    }
  }
  /**
   * Check account status and throw error if locked
   */
  async checkAccountStatus(email) {
    const isLocked = await this.isAccountLocked(email);
    if (isLocked) {
      const user = await import_db.prisma.user.findUnique({
        where: { email },
        select: { lockedUntil: true }
      });
      const lockedUntil = user?.lockedUntil;
      throw new AuthError(
        "AUTH002" /* ACCOUNT_LOCKED */,
        "Account is locked due to too many failed login attempts",
        403,
        {
          lockedUntil: lockedUntil?.toISOString(),
          remainingSeconds: lockedUntil ? Math.max(
            0,
            Math.floor(
              (lockedUntil.getTime() - (/* @__PURE__ */ new Date()).getTime()) / 1e3
            )
          ) : this.config.lockoutDuration
        }
      );
    }
  }
};
var accountLockoutService = new AccountLockoutService();

// src/services/auth.service.ts
var AuthService = class {
  constructor() {
  }
  static generateToken(user) {
    return (0, import_jsonwebtoken.sign)(
      {
        userId: user.id,
        email: user.email,
        role: mapPrismaRoleToAppRole(user.role)
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
  }
  static async validatePassword(password, hashedPassword) {
    return (0, import_bcryptjs.compare)(password, hashedPassword);
  }
  static async login(data) {
    console.log("AuthService.login called with email:", data.email);
    try {
      await accountLockoutService.checkAccountStatus(data.email);
      const user = await import_db.prisma.user.findUnique({
        where: { email: data.email }
      });
      console.log("User found:", user ? "Yes" : "No");
      const ipAddress = data.ipAddress || "unknown";
      const userAgent = data.userAgent || "unknown";
      if (!user) {
        console.log("User not found, recording failed attempt");
        await accountLockoutService.recordFailedAttempt(
          data.email,
          ipAddress,
          userAgent
        );
        await securityLogService.logLoginFailure(
          data.email,
          ipAddress,
          userAgent,
          "User not found"
        );
        throw new import_http_exception2.HTTPException(401, { message: "Invalid credentials" });
      }
      console.log("Validating password");
      const isValidPassword = await this.validatePassword(
        data.password,
        user.password
      );
      console.log("Password valid:", isValidPassword);
      if (!isValidPassword) {
        console.log("Invalid password, recording failed attempt");
        await accountLockoutService.recordFailedAttempt(
          user.email,
          ipAddress,
          userAgent
        );
        await securityLogService.logLoginFailure(
          user.email,
          ipAddress,
          userAgent,
          "Invalid password"
        );
        throw new import_http_exception2.HTTPException(401, { message: "Invalid credentials" });
      }
      await accountLockoutService.resetFailedAttempts(user.email);
      await securityLogService.logLoginSuccess(
        user.id,
        user.email,
        ipAddress,
        userAgent,
        data.deviceId
      );
      console.log("Generating tokens with enhanced security");
      const tokenFamily = generateJwtId();
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: mapPrismaRoleToAppRole(user.role),
        // Add additional security claims
        jti: generateJwtId()
      };
      const accessToken = await generateToken(tokenPayload, "15m", {
        includeJti: true
      });
      const refreshTokenId = generateJwtId();
      const refreshToken = await generateRefreshToken(
        tokenPayload,
        "7d",
        // 7 days
        {
          includeJti: true,
          family: tokenFamily
        }
      );
      await storeTokenFamily(tokenFamily, refreshTokenId);
      const { password: _, ...userWithoutPassword } = user;
      console.log("Login successful, returning response");
      return {
        user: {
          id: user.id,
          name: user.name || "",
          email: user.email,
          role: mapPrismaRoleToAppRole(user.role),
          organization: user.organization || void 0,
          department: user.department || void 0
        },
        accessToken,
        refreshToken
      };
    } catch (error) {
      console.error("Login error:", error);
      throw new import_http_exception2.HTTPException(500, { message: "Authentication failed" });
    }
  }
  static async register(data) {
    try {
      const existingUser = await import_db.prisma.user.findUnique({
        where: { email: data.email }
      });
      if (existingUser) {
        throw new import_http_exception2.HTTPException(400, { message: "Email already registered" });
      }
      const hashedPassword = await (0, import_bcryptjs.hash)(data.password, 10);
      const user = await import_db.prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.name,
          role: import_client.UserRole.USER,
          organization: data.organization,
          department: data.department,
          phone: data.phone
        }
      });
      const tokenFamily = generateJwtId();
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: mapPrismaRoleToAppRole(user.role),
        // Add additional security claims
        jti: generateJwtId()
      };
      const accessToken = await generateToken(tokenPayload, "15m", {
        includeJti: true
      });
      const refreshTokenId = generateJwtId();
      const refreshToken = await generateRefreshToken(
        tokenPayload,
        "7d",
        // 7 days
        {
          includeJti: true,
          family: tokenFamily
        }
      );
      await storeTokenFamily(tokenFamily, refreshTokenId);
      const { password: _, ...userWithoutPassword } = user;
      return {
        user: {
          id: user.id,
          name: user.name || "",
          email: user.email,
          role: mapPrismaRoleToAppRole(user.role),
          organization: user.organization || void 0,
          department: user.department || void 0
        },
        accessToken,
        refreshToken
      };
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof import_http_exception2.HTTPException) {
        throw error;
      }
      throw new import_http_exception2.HTTPException(500, { message: "Registration failed" });
    }
  }
  static async validateToken(token) {
    try {
      const decoded = (0, import_jsonwebtoken.verify)(token, process.env.JWT_SECRET);
      const user = await import_db.prisma.user.findUnique({
        where: { id: decoded.userId }
      });
      if (!user) {
        throw new import_http_exception2.HTTPException(401, { message: "User not found" });
      }
      return user;
    } catch (error) {
      console.error("Token validation error:", error);
      throw new import_http_exception2.HTTPException(401, { message: "Invalid token" });
    }
  }
  async verifyEmail(token) {
    try {
      const user = await import_db.prisma.user.findUnique({
        where: { id: token }
      });
      if (!user) {
        return { success: false, error: "Invalid verification token" };
      }
      await import_db.prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: /* @__PURE__ */ new Date() }
      });
      return { success: true };
    } catch (error) {
      console.error("Email verification error:", error);
      return { success: false, error: "Email verification failed" };
    }
  }
  async refreshToken(refreshToken) {
    try {
      const jwtPayload = await verifyRefreshToken(refreshToken);
      const tokenPayload = {
        userId: jwtPayload.userId,
        email: jwtPayload.email,
        role: jwtPayload.role
      };
      const accessToken = await generateToken(tokenPayload);
      const newRefreshToken = await generateRefreshToken(jwtPayload);
      return { success: true, token: accessToken };
    } catch (error) {
      console.error("Refresh token error:", error);
      return { success: false, error: "Refresh token failed" };
    }
  }
  async forgotPassword(email) {
    const user = await import_db.prisma.user.findUnique({
      where: { email }
    });
    if (!user) {
      return;
    }
    const token = (0, import_crypto.randomUUID)();
    const expires = /* @__PURE__ */ new Date();
    expires.setHours(expires.getHours() + 1);
    await import_db.prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires
      }
    });
    await emailService.sendPasswordResetEmail(email, token);
  }
  async resetPassword(token, newPassword) {
    const verificationToken = await import_db.prisma.verificationToken.findUnique({
      where: { token }
    });
    if (!verificationToken) {
      throw new AuthError(
        "AUTH007" /* INVALID_TOKEN */,
        "Invalid or expired token",
        400
      );
    }
    if (verificationToken.expires < /* @__PURE__ */ new Date()) {
      await import_db.prisma.verificationToken.delete({
        where: { token }
      });
      throw new AuthError("AUTH003" /* TOKEN_EXPIRED */, "Token has expired", 400);
    }
    const hashedPassword = await (0, import_bcryptjs.hash)(newPassword, 10);
    await import_db.prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { password: hashedPassword }
    });
    await import_db.prisma.verificationToken.delete({
      where: { token }
    });
  }
  static async verifyEmail(token) {
    try {
      const verificationToken = await import_db.prisma.verificationToken.findFirst({
        where: {
          token,
          expires: {
            gt: /* @__PURE__ */ new Date()
          }
        }
      });
      if (!verificationToken) {
        throw new AuthError(
          "AUTH007" /* INVALID_TOKEN */,
          "Invalid or expired token",
          400
        );
      }
      await import_db.prisma.user.update({
        where: { email: verificationToken.identifier },
        data: { emailVerified: /* @__PURE__ */ new Date() }
      });
      await import_db.prisma.verificationToken.delete({
        where: { token }
      });
    } catch (error) {
      console.error("Email verification error:", error);
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError(
        "AUTH015" /* VERIFICATION_FAILED */,
        "Email verification failed",
        500
      );
    }
  }
  static async forgotPassword(email) {
    try {
      const user = await import_db.prisma.user.findUnique({
        where: { email }
      });
      if (!user) {
        return;
      }
      const token = (0, import_crypto.randomUUID)();
      const expires = /* @__PURE__ */ new Date();
      expires.setHours(expires.getHours() + 1);
      await import_db.prisma.verificationToken.create({
        data: {
          identifier: email,
          token,
          expires
        }
      });
      try {
        await emailService.sendPasswordResetEmail(email, token);
      } catch (error) {
        console.error("Email service error:", error);
        if (process.env.NODE_ENV === "development") {
          console.log(`[DEV] Password reset token for ${email}: ${token}`);
        }
      }
    } catch (error) {
      console.error("Forgot password error:", error);
    }
  }
  static async resetPassword(token, newPassword) {
    try {
      const verificationToken = await import_db.prisma.verificationToken.findUnique({
        where: { token }
      });
      if (!verificationToken) {
        throw new AuthError(
          "AUTH007" /* INVALID_TOKEN */,
          "Invalid or expired token",
          400
        );
      }
      if (verificationToken.expires < /* @__PURE__ */ new Date()) {
        await import_db.prisma.verificationToken.delete({
          where: { token }
        });
        throw new AuthError(
          "AUTH003" /* TOKEN_EXPIRED */,
          "Token has expired",
          400
        );
      }
      const hashedPassword = await (0, import_bcryptjs.hash)(newPassword, 10);
      await import_db.prisma.user.update({
        where: { email: verificationToken.identifier },
        data: { password: hashedPassword }
      });
      await import_db.prisma.verificationToken.delete({
        where: { token }
      });
    } catch (error) {
      console.error("Password reset error:", error);
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError(
        "AUTH016" /* RESET_PASSWORD_FAILED */,
        "Failed to reset password",
        500
      );
    }
  }
};
var authService = new AuthService();

// src/routes/auth.routes.ts
var import_http_exception3 = require("hono/http-exception");

// src/middleware/auth.middleware.ts
init_prisma();
async function authMiddleware(c, next) {
  try {
    const clientInfo = {
      ipAddress: c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || c.req.header("cf-connecting-ip") || "unknown",
      userAgent: c.req.header("user-agent") || "unknown",
      deviceId: c.req.header("x-device-id") || "unknown"
    };
    let token;
    try {
      token = tokenValidationService.getTokenFromRequest(c);
    } catch (error) {
      throw new AuthError(
        "AUTH007" /* INVALID_TOKEN */,
        "No authentication token provided",
        401
      );
    }
    const validationResult = await tokenValidationService.validateAccessToken(
      token,
      {
        checkBlacklist: true,
        logFailures: true,
        clientInfo
      }
    );
    if (!validationResult.isValid) {
      throw new AuthError(
        "AUTH007" /* INVALID_TOKEN */,
        validationResult.error || "Invalid token",
        401
      );
    }
    const userIsValid = await tokenValidationService.validateUser(
      validationResult.userId
    );
    if (!userIsValid) {
      throw new AuthError(
        AuthErrorCode.USER_NOT_FOUND,
        "User not found or account is locked",
        401
      );
    }
    const user = await import_db.prisma.user.findUnique({
      where: { id: validationResult.userId },
      include: {
        customRole: true
      }
    });
    if (!user) {
      throw new AuthError(AuthErrorCode.USER_NOT_FOUND, "User not found", 401);
    }
    c.set("userId", user.id);
    c.set("userEmail", user.email);
    c.set("userRole", user.role);
    c.set("user", user);
    await next();
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    console.error("Authentication middleware error:", error);
    throw new AuthError(
      "AUTH017" /* SERVER_ERROR */,
      "Authentication failed",
      500
    );
  }
}

// src/utils/cookie.utils.ts
var DEFAULT_COOKIE_OPTIONS = {
  path: "/",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  // Changed from strict to lax for better compatibility
  maxAge: 60 * 60 * 24 * 7
  // 7 days
};
function getCookieDomain() {
  if (process.env.NODE_ENV === "production") {
    const cookieDomain = process.env.COOKIE_DOMAIN;
    return cookieDomain || void 0;
  }
  return void 0;
}
function setCookieWithOptions(c, name, value, options = {}) {
  const finalOptions = { ...DEFAULT_COOKIE_OPTIONS, ...options };
  const domain = getCookieDomain();
  let cookie = `${name}=${value}; Path=${finalOptions.path}`;
  if (finalOptions.httpOnly)
    cookie += "; HttpOnly";
  if (finalOptions.secure)
    cookie += "; Secure";
  cookie += `; SameSite=${finalOptions.sameSite}; Max-Age=${finalOptions.maxAge}`;
  if (domain)
    cookie += `; Domain=${domain}`;
  console.log(
    `Setting cookie: ${name} (SameSite=${finalOptions.sameSite}, Secure=${finalOptions.secure}, HttpOnly=${finalOptions.httpOnly})`
  );
  c.header("Set-Cookie", cookie, { append: true });
}
function clearCookie(c, name) {
  let cookie = `${name}=; Path=/; Max-Age=0; HttpOnly`;
  if (process.env.NODE_ENV === "production")
    cookie += "; Secure";
  cookie += `; SameSite=${DEFAULT_COOKIE_OPTIONS.sameSite}`;
  const domain = getCookieDomain();
  if (domain)
    cookie += `; Domain=${domain}`;
  console.log(`Clearing cookie: ${name}`);
  c.header("Set-Cookie", cookie, { append: true });
}

// src/middleware/rate-limit.middleware.ts
init_redis_service();
init_config();
var defaultOptions = {
  windowSeconds: config2.rateLimit.auth.window,
  maxRequests: config2.rateLimit.auth.max,
  keyPrefix: "rate:auth:",
  message: "Too many requests, please try again later",
  statusCode: 429,
  skipSuccessfulRequests: false,
  identifyClient: (c) => {
    return c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || c.req.header("cf-connecting-ip") || c.req.raw.headers.get("x-forwarded-for") || "unknown";
  }
};
function rateLimit(options = {}) {
  const opts = { ...defaultOptions, ...options };
  return async (c, next) => {
    const clientId = opts.identifyClient(c);
    const path = c.req.path;
    const method = c.req.method;
    const key = `${opts.keyPrefix}${clientId}:${method}:${path}`;
    try {
      if (!redisService.isAvailable()) {
        console.warn("Rate limiting skipped: Redis not available");
        await next();
        return;
      }
      const attempts = await redisService.incrementRateLimit(
        key,
        opts.windowSeconds
      );
      const ttl = await redisService.getRateLimitTTL(key) || opts.windowSeconds;
      const resetTime = new Date(Date.now() + ttl * 1e3).toUTCString();
      c.header("X-RateLimit-Limit", opts.maxRequests.toString());
      c.header(
        "X-RateLimit-Remaining",
        Math.max(0, opts.maxRequests - attempts).toString()
      );
      c.header("X-RateLimit-Reset", resetTime);
      if (attempts > opts.maxRequests) {
        console.warn(`Rate limit exceeded for ${clientId} on ${path}`);
        c.header("Retry-After", ttl.toString());
        await securityLogService.logRateLimitExceeded(clientId, path, method);
        throw new AuthError(
          "AUTH006" /* RATE_LIMITED */,
          opts.message || "Too many requests, please try again later",
          opts.statusCode || 429,
          {
            windowSeconds: opts.windowSeconds,
            retryAfter: ttl
          }
        );
      }
      c.set("rateLimitAttempts", attempts);
      c.set("rateLimitKey", key);
      await next();
      if (opts.skipSuccessfulRequests && c.res.status >= 200 && c.res.status < 400) {
        await redisService.decrementRateLimit(key);
      }
    } catch (error) {
      if (error instanceof AuthError && error.code === "AUTH006" /* RATE_LIMITED */) {
        throw error;
      }
      console.error("Rate limiting error:", error);
      await next();
    }
  };
}

// src/routes/auth.routes.ts
init_redis_service();

// src/middleware/csrf.ts
var import_cookie = require("hono/cookie");
var import_crypto2 = __toESM(require("crypto"));
init_config();
var defaultOptions2 = {
  cookie: {
    name: "csrf_token",
    path: "/",
    maxAge: 60 * 60 * 24,
    // 24 hours
    httpOnly: false,
    // Allow JavaScript access to CSRF token
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax"
  },
  ignoreMethods: ["GET", "HEAD", "OPTIONS"],
  // Methods that don't need CSRF protection
  ignorePaths: [
    "/health",
    "/api/health",
    "/api/auth/login",
    "/auth/login",
    "/api/auth/register",
    "/auth/register",
    "/api/auth/refresh-token",
    "/auth/refresh-token",
    "/api/auth/csrf-token",
    // Endpoint to get a CSRF token
    "/auth/csrf-token"
  ],
  // Paths that don't need CSRF protection
  tokenHeader: "X-CSRF-Token"
};
var generateToken2 = () => {
  return import_crypto2.default.randomBytes(16).toString("hex");
};
var csrf = (options = {}) => {
  const opts = {
    ...defaultOptions2,
    ...options,
    cookie: {
      ...defaultOptions2.cookie,
      ...options.cookie
    }
  };
  return async (c, next) => {
    const method = c.req.method;
    const path = c.req.path;
    console.log(`CSRF Middleware - Method: ${method}, Path: ${path}`);
    const origin = c.req.header("Origin") || config2.corsOrigins[0];
    c.res.headers.set("Access-Control-Allow-Origin", origin);
    c.res.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    c.res.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, X-CSRF-Token"
    );
    c.res.headers.set("Access-Control-Allow-Credentials", "true");
    if (method === "OPTIONS") {
      return c.text("OK", 200);
    }
    if (opts.ignoreMethods?.includes(method) || opts.ignorePaths?.some((p) => path.startsWith(p))) {
      console.log(`CSRF Middleware - Skipping validation for ${path}`);
      if (method === "GET") {
        let token = (0, import_cookie.getCookie)(c, opts.cookie.name);
        if (!token) {
          token = generateToken2();
          (0, import_cookie.setCookie)(c, opts.cookie.name, token, opts.cookie);
          console.log(`CSRF Middleware - Generated new token for GET request`);
        }
      }
      await next();
      return;
    }
    const cookieToken = (0, import_cookie.getCookie)(c, opts.cookie.name);
    if (!cookieToken) {
      const newToken2 = generateToken2();
      (0, import_cookie.setCookie)(c, opts.cookie.name, newToken2, opts.cookie);
      console.log(`CSRF Middleware - No token in cookie, generated new one`);
      return c.json({ error: "CSRF token is missing" }, 403);
    }
    const headerToken = c.req.header(opts.tokenHeader || "X-CSRF-Token");
    if (!headerToken || headerToken !== cookieToken) {
      console.log(
        `CSRF Middleware - Invalid token: ${headerToken} vs ${cookieToken}`
      );
      return c.json({ error: "Invalid CSRF token" }, 403);
    }
    console.log(`CSRF Middleware - Token valid, proceeding with request`);
    await next();
    const newToken = generateToken2();
    (0, import_cookie.setCookie)(c, opts.cookie.name, newToken, opts.cookie);
  };
};
var csrf_default = csrf;

// src/routes/auth.routes.ts
init_config();
var csrfProtection = csrf_default();
var auth = new import_hono.Hono();
var honoErrorHandler = (err, c) => {
  const result = errorHandler(err, c);
  if ("status" in result && "body" in result) {
    return c.json(result.body, result.status);
  }
  return result;
};
auth.onError(honoErrorHandler);
auth.use(
  "/login",
  rateLimit({
    windowSeconds: 300,
    // 5 minutes
    maxRequests: 5,
    // 5 attempts
    keyPrefix: "rate:login:",
    message: "Too many login attempts. Please try again later.",
    skipSuccessfulRequests: true
    // Don't count successful logins against the limit
  })
);
auth.use(
  "/register",
  rateLimit({
    windowSeconds: 3600,
    // 1 hour
    maxRequests: 3,
    // 3 attempts
    keyPrefix: "rate:register:",
    message: "Too many registration attempts. Please try again later."
  })
);
auth.use(
  "/forgot-password",
  rateLimit({
    windowSeconds: 3600,
    // 1 hour
    maxRequests: 3,
    // 3 attempts
    keyPrefix: "rate:forgot:",
    message: "Too many password reset requests. Please try again later."
  })
);
auth.use(
  "/reset-password",
  rateLimit({
    windowSeconds: 3600,
    // 1 hour
    maxRequests: 5,
    // 5 attempts
    keyPrefix: "rate:reset:",
    message: "Too many password reset attempts. Please try again later."
  })
);
auth.post(
  "/login",
  csrfProtection,
  (0, import_zod_validator.zValidator)("json", loginSchema),
  async (c) => {
    try {
      const data = await c.req.json();
      console.log(`Login attempt for email: ${data.email}`);
      data.ipAddress = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || c.req.header("cf-connecting-ip") || "unknown";
      data.userAgent = c.req.header("user-agent") || "unknown";
      data.deviceId = c.req.header("x-device-id") || "unknown";
      console.log(
        `Login attempt from IP: ${data.ipAddress}, Device: ${data.deviceId}`
      );
      const result = await AuthService.login(data);
      setCookieWithOptions(c, "auth_token", result.accessToken, {
        sameSite: "lax",
        secure: false,
        // Set to false for local development
        httpOnly: true,
        path: "/"
      });
      setCookieWithOptions(c, "accessToken", result.accessToken, {
        sameSite: "lax",
        secure: false,
        // Set to false for local development
        httpOnly: true,
        path: "/"
      });
      setCookieWithOptions(c, "token", result.accessToken, {
        sameSite: "lax",
        secure: false,
        // Set to false for local development
        httpOnly: true,
        path: "/"
      });
      setCookieWithOptions(c, "refresh_token", result.refreshToken, {
        sameSite: "lax",
        secure: false,
        // Set to false for local development
        httpOnly: true,
        path: "/"
      });
      setCookieWithOptions(c, "authenticated", "true", {
        httpOnly: false,
        sameSite: "lax",
        secure: false,
        // Set to false for local development
        path: "/",
        maxAge: 7 * 24 * 60 * 60
      });
      console.log("Set auth cookies for user:", result.user.email);
      return c.json(result);
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError(
        "AUTH001" /* INVALID_CREDENTIALS */,
        "Authentication failed",
        401
      );
    }
  }
);
auth.post(
  "/register",
  csrfProtection,
  (0, import_zod_validator.zValidator)("json", registerSchema),
  async (c) => {
    try {
      const data = await c.req.json();
      console.log(`Registration attempt for email: ${data.email}`);
      data.ipAddress = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || c.req.header("cf-connecting-ip") || "unknown";
      data.userAgent = c.req.header("user-agent") || "unknown";
      data.deviceId = c.req.header("x-device-id") || "unknown";
      console.log(`Registration attempt from IP: ${data.ipAddress}`);
      const result = await AuthService.register(data);
      setCookieWithOptions(c, "auth_token", result.accessToken, {
        sameSite: "lax",
        secure: false,
        // Set to false for local development
        httpOnly: true,
        path: "/"
      });
      setCookieWithOptions(c, "accessToken", result.accessToken, {
        sameSite: "lax",
        secure: false,
        // Set to false for local development
        httpOnly: true,
        path: "/"
      });
      setCookieWithOptions(c, "token", result.accessToken, {
        sameSite: "lax",
        secure: false,
        // Set to false for local development
        httpOnly: true,
        path: "/"
      });
      setCookieWithOptions(c, "refresh_token", result.refreshToken, {
        sameSite: "lax",
        secure: false,
        // Set to false for local development
        httpOnly: true,
        path: "/"
      });
      setCookieWithOptions(c, "authenticated", "true", {
        httpOnly: false,
        sameSite: "lax",
        secure: false,
        // Set to false for local development
        path: "/",
        maxAge: 7 * 24 * 60 * 60
      });
      console.log("Set auth cookies for new user:", result.user.email);
      return c.json(result);
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof AuthError) {
        throw error;
      }
      if (error instanceof import_http_exception3.HTTPException) {
        throw error;
      }
      throw new AuthError(
        "AUTH014" /* REGISTRATION_FAILED */,
        "Registration failed",
        400
      );
    }
  }
);
auth.get("/verify-email", (0, import_zod_validator.zValidator)("query", verifyEmailSchema), async (c) => {
  try {
    const { token } = c.req.valid("query");
    await AuthService.verifyEmail(token);
    return c.json({
      success: true,
      message: "Email verified successfully"
    });
  } catch (error) {
    console.error("Email verification error:", error);
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError(
      "AUTH015" /* VERIFICATION_FAILED */,
      "Email verification failed",
      400
    );
  }
});
auth.post("/refresh-token", async (c) => {
  try {
    const data = await c.req.json();
    const { refreshToken } = data;
    if (!refreshToken) {
      throw new AuthError(
        "AUTH007" /* INVALID_TOKEN */,
        "Refresh token is required",
        400
      );
    }
    const clientInfo = {
      ipAddress: c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || c.req.header("cf-connecting-ip") || "unknown",
      userAgent: c.req.header("user-agent") || "unknown",
      deviceId: c.req.header("x-device-id") || "unknown"
    };
    const validationResult = await tokenValidationService.validateRefreshToken(
      refreshToken,
      {
        checkBlacklist: true,
        checkFamily: true,
        logFailures: true,
        clientInfo
      }
    );
    if (!validationResult.isValid) {
      throw new AuthError(
        AuthErrorCode.INVALID_REFRESH_TOKEN,
        validationResult.error || "Invalid refresh token",
        401
      );
    }
    const jwtPayload = {
      userId: validationResult.userId,
      email: validationResult.email,
      role: validationResult.role,
      family: validationResult.details?.family,
      jti: validationResult.details?.jti
    };
    const tokenFamily = jwtPayload.family || generateJwtId();
    const newTokenId = generateJwtId();
    const tokenPayload = {
      userId: jwtPayload.userId,
      email: jwtPayload.email,
      role: jwtPayload.role,
      // Add device info if available
      deviceId: jwtPayload.deviceId || c.req.header("x-device-id"),
      ipAddress: c.req.header("x-forwarded-for") || c.req.header("x-real-ip"),
      userAgent: c.req.header("user-agent")
    };
    const accessToken = await generateToken(tokenPayload, "15m", {
      includeJti: true
    });
    const newRefreshToken = await generateRefreshToken(
      tokenPayload,
      config2.jwt.refreshExpiresIn,
      {
        includeJti: true,
        family: tokenFamily
      }
    );
    await storeTokenFamily(tokenFamily, newTokenId);
    await revokeToken(refreshToken, 60 * 60 * 24);
    setCookieWithOptions(c, "auth_token", accessToken, {
      sameSite: "lax",
      secure: false,
      // Set to false for local development
      httpOnly: true,
      path: "/"
    });
    setCookieWithOptions(c, "accessToken", accessToken, {
      sameSite: "lax",
      secure: false,
      // Set to false for local development
      httpOnly: true,
      path: "/"
    });
    setCookieWithOptions(c, "token", accessToken, {
      sameSite: "lax",
      secure: false,
      // Set to false for local development
      httpOnly: true,
      path: "/"
    });
    setCookieWithOptions(c, "refresh_token", newRefreshToken, {
      sameSite: "lax",
      secure: false,
      // Set to false for local development
      httpOnly: true,
      path: "/"
    });
    setCookieWithOptions(c, "authenticated", "true", {
      httpOnly: false,
      sameSite: "lax",
      secure: false,
      // Set to false for local development
      path: "/",
      maxAge: 7 * 24 * 60 * 60
    });
    console.log("Refreshed auth cookies");
    return c.json({
      success: true,
      message: "Token refreshed",
      data: {
        accessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError(
      "AUTH007" /* INVALID_TOKEN */,
      "Failed to refresh token",
      401
    );
  }
});
auth.post(
  "/forgot-password",
  csrfProtection,
  (0, import_zod_validator.zValidator)("json", forgotPasswordSchema),
  async (c) => {
    try {
      const { email } = await c.req.json();
      console.log(`Password reset requested for: ${email}`);
      await AuthService.forgotPassword(email);
      return c.json({
        success: true,
        message: "Password reset email sent"
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      return c.json({
        success: true,
        message: "If the email exists, a password reset link has been sent"
      });
    }
  }
);
auth.post(
  "/reset-password",
  csrfProtection,
  (0, import_zod_validator.zValidator)("json", resetPasswordSchema),
  async (c) => {
    try {
      const { token, password } = await c.req.json();
      await AuthService.resetPassword(token, password);
      return c.json({
        success: true,
        message: "Password reset successfully"
      });
    } catch (error) {
      console.error("Reset password error:", error);
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError(
        "AUTH016" /* RESET_PASSWORD_FAILED */,
        "Failed to reset password",
        400
      );
    }
  }
);
auth.post("/logout", csrfProtection, async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    let token;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else {
      const cookieHeader = c.req.raw.headers.get("cookie");
      if (cookieHeader) {
        const cookies = cookieHeader.split(";");
        const authCookie = cookies.find(
          (cookie) => cookie.trim().startsWith("auth_token=")
        );
        if (authCookie) {
          token = authCookie.split("=")[1];
        }
      }
    }
    if (token) {
      try {
        const clientInfo = {
          ipAddress: c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || c.req.header("cf-connecting-ip") || "unknown",
          userAgent: c.req.header("user-agent") || "unknown",
          deviceId: c.req.header("x-device-id") || "unknown"
        };
        const validationResult = await tokenValidationService.validateAccessToken(token, {
          checkBlacklist: false,
          clientInfo
        });
        if (!validationResult.isValid) {
          console.log(
            "Token validation failed during logout:",
            validationResult.error
          );
        }
        const payload = {
          userId: validationResult.userId || "unknown",
          email: validationResult.email || "unknown"
        };
        await revokeToken(token);
        const cookieHeader = c.req.raw.headers.get("cookie");
        if (cookieHeader) {
          const cookies = cookieHeader.split(";");
          const refreshCookie = cookies.find(
            (cookie) => cookie.trim().startsWith("refresh_token=")
          );
          if (refreshCookie) {
            const refreshToken = refreshCookie.split("=")[1];
            await revokeToken(refreshToken);
          }
        }
        console.log(`User ${payload.userId} logged out successfully`);
        await securityLogService.logLogout(
          payload.userId,
          payload.email,
          c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown",
          c.req.header("user-agent") || "unknown"
        );
      } catch (error) {
        console.error("Error during token revocation:", error);
      }
    }
    clearCookie(c, "auth_token");
    clearCookie(c, "accessToken");
    clearCookie(c, "token");
    clearCookie(c, "refresh_token");
    clearCookie(c, "authenticated");
    console.log("Cleared all auth cookies");
    return c.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    clearCookie(c, "auth_token");
    clearCookie(c, "accessToken");
    clearCookie(c, "token");
    clearCookie(c, "refresh_token");
    clearCookie(c, "authenticated");
    console.log("Cleared all auth cookies (error case)");
    return c.json({ success: true, message: "Logged out successfully" });
  }
});
auth.use("/me", authMiddleware);
auth.get("/me", async (c) => {
  const userId = c.var.userId;
  if (!userId) {
    throw new import_http_exception3.HTTPException(401, { message: "Unauthorized" });
  }
  try {
    const user = await import_db.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true
      }
    });
    if (!user) {
      throw new AuthError(
        "AUTH001" /* INVALID_CREDENTIALS */,
        "User not found",
        404
      );
    }
    return c.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error("Get current user error:", error);
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError(
      "AUTH001" /* INVALID_CREDENTIALS */,
      "Authentication failed",
      401
    );
  }
});
auth.get("/check", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    let token;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else {
      const cookieHeader = c.req.raw.headers.get("cookie");
      console.log("Auth check - Cookie header:", cookieHeader);
      if (cookieHeader) {
        const cookies = cookieHeader.split(";");
        const possibleCookieNames = ["auth_token", "accessToken", "token"];
        for (const cookieName of possibleCookieNames) {
          const authCookie = cookies.find(
            (cookie) => cookie.trim().startsWith(`${cookieName}=`)
          );
          if (authCookie) {
            token = authCookie.split("=")[1];
            console.log(`Auth check - Found token in cookie: ${cookieName}`);
            break;
          }
        }
      }
    }
    if (!token) {
      return c.json(
        {
          authenticated: false,
          message: "No authentication token found"
        },
        200
      );
    }
    if (redisService.isAvailable()) {
      const isBlacklisted = await redisService.isTokenBlacklisted(token);
      if (isBlacklisted) {
        return c.json(
          {
            authenticated: false,
            message: "Token has been invalidated"
          },
          200
        );
      }
    }
    try {
      const clientInfo = {
        ipAddress: c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || c.req.header("cf-connecting-ip") || "unknown",
        userAgent: c.req.header("user-agent") || "unknown",
        deviceId: c.req.header("x-device-id") || "unknown"
      };
      const validationResult = await tokenValidationService.validateAccessToken(
        token,
        {
          checkBlacklist: true,
          clientInfo
        }
      );
      if (!validationResult.isValid) {
        return c.json(
          {
            authenticated: false,
            message: validationResult.error || "Invalid token"
          },
          200
        );
      }
      return c.json(
        {
          authenticated: true,
          user: {
            id: validationResult.userId,
            email: validationResult.email,
            role: validationResult.role
          }
        },
        200
      );
    } catch (tokenError) {
      console.log("Token verification failed:", tokenError);
      return c.json(
        {
          authenticated: false,
          message: "Invalid or expired token"
        },
        200
      );
    }
  } catch (error) {
    console.error("Auth check error:", error);
    return c.json(
      {
        authenticated: false,
        message: "Authentication check failed"
      },
      200
    );
  }
});
auth.get("/csrf", async (c) => {
  try {
    const csrfToken = crypto3.randomUUID();
    setCookieWithOptions(c, "csrfToken", csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60
      // 1 hour
    });
    return c.json({ success: true, csrfToken });
  } catch (error) {
    console.error("CSRF token generation error:", error);
    throw new AuthError(
      "AUTH001" /* INVALID_CREDENTIALS */,
      "Could not generate security token",
      500
    );
  }
});
auth.post("/validate-token", async (c) => {
  try {
    const { token } = await c.req.json();
    if (!token) {
      return c.json({
        isValid: false,
        message: "No token provided"
      });
    }
    try {
      const clientInfo = {
        ipAddress: c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || c.req.header("cf-connecting-ip") || "unknown",
        userAgent: c.req.header("user-agent") || "unknown",
        deviceId: c.req.header("x-device-id") || "unknown"
      };
      const validationResult = await tokenValidationService.validateAccessToken(
        token,
        {
          checkBlacklist: true,
          logFailures: true,
          clientInfo
        }
      );
      if (validationResult.isValid) {
        return c.json({
          isValid: true,
          userId: validationResult.userId,
          email: validationResult.email,
          role: validationResult.role,
          exp: validationResult.exp
        });
      } else {
        return c.json({
          isValid: false,
          message: validationResult.error || "Invalid token"
        });
      }
    } catch (tokenError) {
      return c.json({
        isValid: false,
        message: "Invalid or expired token"
      });
    }
  } catch (error) {
    console.error("Token validation error:", error);
    return c.json({
      isValid: false,
      message: "Token validation failed"
    });
  }
});
auth.get("/csrf-token", async (c) => {
  try {
    const token = crypto3.randomBytes(32).toString("hex");
    setCookieWithOptions(c, "csrf_token", token, {
      httpOnly: false,
      // Allow JavaScript access
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24
      // 24 hours
    });
    return c.json({
      success: true,
      csrfToken: token
    });
  } catch (error) {
    console.error("CSRF token generation error:", error);
    throw new AuthError(
      "AUTH017" /* SERVER_ERROR */,
      "Failed to generate CSRF token",
      500
    );
  }
});
var auth_routes_default = auth;

// src/routes/user.routes.ts
var import_zod_openapi3 = require("@hono/zod-openapi");

// src/services/user.service.ts
init_prisma();
var import_http_exception4 = require("hono/http-exception");

// src/utils/password.ts
var import_bcryptjs2 = __toESM(require("bcryptjs"));
async function hashPassword(password) {
  const salt = await import_bcryptjs2.default.genSalt(12);
  return import_bcryptjs2.default.hash(password, salt);
}
async function comparePassword(password, hashedPassword) {
  return import_bcryptjs2.default.compare(password, hashedPassword);
}

// src/services/user.service.ts
var userService = {
  /**
   * Get user profile
   */
  getProfile: async (userId) => {
    const user = await import_db.prisma.user.findUnique({
      where: { id: userId }
    });
    if (!user) {
      throw new import_http_exception4.HTTPException(404, { message: "User not found" });
    }
    return {
      id: user.id,
      name: user.name || "",
      email: user.email,
      role: mapPrismaRoleToAppRole(user.role),
      organization: user.organization || void 0,
      department: user.department || void 0,
      phone: user.phone || void 0,
      image: user.image || void 0,
      emailVerified: !!user.emailVerified,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    };
  },
  /**
   * Update user profile
   */
  updateProfile: async (userId, data) => {
    if (data.email) {
      const existingUser = await import_db.prisma.user.findUnique({
        where: { email: data.email }
      });
      if (existingUser && existingUser.id !== userId) {
        throw new import_http_exception4.HTTPException(400, { message: "Email already taken" });
      }
    }
    try {
      const updatedUser = await import_db.prisma.user.update({
        where: { id: userId },
        data
      });
      return {
        id: updatedUser.id,
        name: updatedUser.name || "",
        email: updatedUser.email,
        role: mapPrismaRoleToAppRole(updatedUser.role),
        organization: updatedUser.organization || void 0,
        department: updatedUser.department || void 0,
        phone: updatedUser.phone || void 0,
        image: updatedUser.image || void 0,
        emailVerified: !!updatedUser.emailVerified,
        createdAt: updatedUser.createdAt.toISOString(),
        updatedAt: updatedUser.updatedAt.toISOString()
      };
    } catch (error) {
      throw new import_http_exception4.HTTPException(500, { message: "Failed to update user" });
    }
  },
  /**
   * Change user password
   */
  changePassword: async (userId, currentPassword, newPassword) => {
    const user = await import_db.prisma.user.findUnique({
      where: { id: userId }
    });
    if (!user) {
      throw new import_http_exception4.HTTPException(404, { message: "User not found" });
    }
    if (!newPassword) {
      const hashedPassword2 = await hashPassword(currentPassword);
      await import_db.prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword2 }
      });
      return;
    }
    const isPasswordValid = await comparePassword(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      throw new import_http_exception4.HTTPException(400, { message: "Current password is incorrect" });
    }
    const hashedPassword = await hashPassword(newPassword);
    await import_db.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });
  },
  /**
   * Get all users
   */
  getAllUsers: async (query) => {
    const {
      page = 1,
      limit = 10,
      search = "",
      role,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = query;
    const where = {
      AND: [
        search ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } }
          ]
        } : {},
        role ? { role: mapAppRoleToPrismaRole(role) } : {}
      ]
    };
    const [users, total] = await Promise.all([
      import_db.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder
        }
      }),
      import_db.prisma.user.count({ where })
    ]);
    return {
      users: users.map((user) => ({
        id: user.id,
        name: user.name || "",
        email: user.email,
        role: mapPrismaRoleToAppRole(user.role),
        emailVerified: user.emailVerified !== null,
        organization: user.organization || "",
        department: user.department || void 0,
        phone: user.phone || void 0,
        image: user.image || void 0,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  },
  /**
   * Get user by ID
   */
  getUserById: async (userId) => {
    const user = await import_db.prisma.user.findUnique({
      where: { id: userId }
    });
    if (!user) {
      throw new import_http_exception4.HTTPException(404, { message: "User not found" });
    }
    return {
      id: user.id,
      name: user.name || "",
      email: user.email,
      role: mapPrismaRoleToAppRole(user.role),
      organization: user.organization || void 0,
      department: user.department || void 0,
      phone: user.phone || void 0,
      image: user.image || void 0,
      emailVerified: !!user.emailVerified,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    };
  },
  /**
   * Update user role
   */
  updateUserRole: async (userId, role) => {
    const user = await import_db.prisma.user.findUnique({
      where: { id: userId }
    });
    if (!user) {
      throw new import_http_exception4.HTTPException(404, { message: "User not found" });
    }
    const updatedUser = await import_db.prisma.user.update({
      where: { id: userId },
      data: {
        role: mapAppRoleToPrismaRole(role)
      }
    });
    return {
      id: updatedUser.id,
      name: updatedUser.name || "",
      email: updatedUser.email,
      role: mapPrismaRoleToAppRole(updatedUser.role),
      organization: updatedUser.organization || void 0,
      department: updatedUser.department || void 0,
      phone: updatedUser.phone || void 0,
      image: updatedUser.image || void 0,
      emailVerified: !!updatedUser.emailVerified,
      createdAt: updatedUser.createdAt.toISOString(),
      updatedAt: updatedUser.updatedAt.toISOString()
    };
  },
  /**
   * Delete user (admin only)
   */
  deleteUser: async (userId) => {
    try {
      await import_db.prisma.user.delete({
        where: { id: userId }
      });
    } catch (error) {
      throw new import_http_exception4.HTTPException(500, { message: "Failed to delete user" });
    }
  }
};

// src/types/user.types.ts
var import_zod_openapi2 = require("@hono/zod-openapi");
var userProfileSchema = import_zod_openapi2.z.object({
  name: import_zod_openapi2.z.string().min(2, "Name must be at least 2 characters").openapi({
    example: "John Doe",
    description: "User's full name"
  }),
  organization: import_zod_openapi2.z.string().optional().openapi({
    example: "ACME Corp",
    description: "User's organization"
  }),
  department: import_zod_openapi2.z.string().optional().openapi({
    example: "Engineering",
    description: "User's department"
  }),
  phone: import_zod_openapi2.z.string().optional().openapi({
    example: "+1234567890",
    description: "User's phone number"
  }),
  image: import_zod_openapi2.z.string().url().optional().openapi({
    example: "https://example.com/avatar.jpg",
    description: "User's profile image URL"
  })
}).openapi("UserProfile");
var UserIdParamSchema = import_zod_openapi2.z.object({
  id: import_zod_openapi2.z.string().uuid("Invalid user ID format").openapi({
    example: "123e4567-e89b-12d3-a456-426614174000",
    description: "User's unique identifier"
  })
}).openapi("UserIdParam");
var ChangePasswordSchema = import_zod_openapi2.z.object({
  currentPassword: import_zod_openapi2.z.string().openapi({
    example: "oldpassword123",
    description: "Current password"
  }),
  newPassword: import_zod_openapi2.z.string().min(8, "Password must be at least 8 characters").openapi({
    example: "newpassword123",
    description: "New password"
  })
}).openapi("ChangePassword");
var userResponseSchema = import_zod_openapi2.z.object({
  id: import_zod_openapi2.z.string().openapi({
    example: "123e4567-e89b-12d3-a456-426614174000",
    description: "User's unique identifier"
  }),
  name: import_zod_openapi2.z.string().openapi({
    example: "John Doe",
    description: "User's full name"
  }),
  email: import_zod_openapi2.z.string().email().openapi({
    example: "john@example.com",
    description: "User's email address"
  }),
  role: import_zod_openapi2.z.nativeEnum(UserRole).openapi({
    example: "USER" /* USER */,
    description: "User's role"
  }),
  organization: import_zod_openapi2.z.string().optional().openapi({
    example: "ACME Corp",
    description: "User's organization"
  }),
  department: import_zod_openapi2.z.string().optional().openapi({
    example: "Engineering",
    description: "User's department"
  }),
  phone: import_zod_openapi2.z.string().optional().openapi({
    example: "+1234567890",
    description: "User's phone number"
  }),
  image: import_zod_openapi2.z.string().optional().openapi({
    example: "https://example.com/avatar.jpg",
    description: "User's profile image URL"
  }),
  emailVerified: import_zod_openapi2.z.boolean().openapi({
    example: true,
    description: "Whether the user's email is verified"
  }),
  createdAt: import_zod_openapi2.z.string().openapi({
    example: "2024-03-05T15:31:06.843Z",
    description: "When the user was created"
  }),
  updatedAt: import_zod_openapi2.z.string().openapi({
    example: "2024-03-05T15:31:06.843Z",
    description: "When the user was last updated"
  })
}).openapi("UserResponse");
var userListQuerySchema = import_zod_openapi2.z.object({
  page: import_zod_openapi2.z.string().optional().transform((val) => val ? parseInt(val, 10) : 1).openapi({
    example: "1",
    description: "Page number"
  }),
  limit: import_zod_openapi2.z.string().optional().transform((val) => val ? parseInt(val, 10) : 10).openapi({
    example: "10",
    description: "Number of items per page"
  }),
  search: import_zod_openapi2.z.string().optional().openapi({
    example: "john",
    description: "Search term for name or email"
  }),
  role: import_zod_openapi2.z.nativeEnum(UserRole).optional().openapi({
    example: "USER" /* USER */,
    description: "Filter by user role"
  }),
  sortBy: import_zod_openapi2.z.enum(["name", "email", "role", "createdAt"]).optional().default("createdAt").openapi({
    example: "createdAt",
    description: "Field to sort by"
  }),
  sortOrder: import_zod_openapi2.z.enum(["asc", "desc"]).optional().default("desc").openapi({
    example: "desc",
    description: "Sort order"
  })
}).openapi("UserListQuery");
var userListResponseSchema = import_zod_openapi2.z.object({
  users: import_zod_openapi2.z.array(userResponseSchema).openapi({
    description: "List of users"
  }),
  total: import_zod_openapi2.z.number().openapi({
    example: 100,
    description: "Total number of users"
  }),
  page: import_zod_openapi2.z.number().openapi({
    example: 1,
    description: "Current page number"
  }),
  limit: import_zod_openapi2.z.number().openapi({
    example: 10,
    description: "Number of items per page"
  }),
  totalPages: import_zod_openapi2.z.number().openapi({
    example: 10,
    description: "Total number of pages"
  })
}).openapi("UserListResponse");
var updateUserRoleSchema = import_zod_openapi2.z.object({
  role: import_zod_openapi2.z.nativeEnum(UserRole).openapi({
    example: "USER" /* USER */,
    description: "New role for the user"
  })
}).openapi("UpdateUserRole");

// src/routes/user.routes.ts
var import_http_exception5 = require("hono/http-exception");
var userRouter = new import_zod_openapi3.OpenAPIHono();
userRouter.use("*", (c, next) => {
  console.log("[DEMO MODE] Skipping authentication for user routes");
  c.set("userId", "demo-user-id");
  c.set("userEmail", "demo@example.com");
  c.set("userRole", "ADMIN" /* ADMIN */);
  return next();
});
userRouter.openapi(
  (0, import_zod_openapi3.createRoute)({
    method: "get",
    path: "/profile",
    tags: ["User"],
    description: "Get user profile",
    responses: {
      200: {
        description: "User profile retrieved successfully",
        content: {
          "application/json": {
            schema: userResponseSchema
          }
        }
      }
    }
  }),
  async (c) => {
    const userId = c.var.userId;
    if (!userId) {
      throw new import_http_exception5.HTTPException(401, { message: "Unauthorized" });
    }
    const profile = await userService.getProfile(userId);
    return c.json(profile);
  }
);
userRouter.openapi(
  (0, import_zod_openapi3.createRoute)({
    method: "put",
    path: "/profile",
    tags: ["User"],
    description: "Update user profile",
    request: {
      body: {
        content: {
          "application/json": {
            schema: userProfileSchema
          }
        }
      }
    },
    responses: {
      200: {
        description: "User profile updated successfully",
        content: {
          "application/json": {
            schema: userResponseSchema
          }
        }
      }
    }
  }),
  async (c) => {
    const userId = c.var.userId;
    if (!userId) {
      throw new import_http_exception5.HTTPException(401, { message: "Unauthorized" });
    }
    const data = await c.req.json();
    const updatedProfile = await userService.updateProfile(userId, data);
    return c.json(updatedProfile);
  }
);
userRouter.openapi(
  (0, import_zod_openapi3.createRoute)({
    method: "post",
    path: "/change-password",
    tags: ["User"],
    description: "Change user password",
    request: {
      body: {
        content: {
          "application/json": {
            schema: ChangePasswordSchema
          }
        }
      }
    },
    responses: {
      200: {
        description: "Password changed successfully"
      }
    }
  }),
  async (c) => {
    const userId = c.var.userId;
    if (!userId) {
      throw new import_http_exception5.HTTPException(401, { message: "Unauthorized" });
    }
    const { currentPassword, newPassword } = await c.req.json();
    await userService.changePassword(userId, currentPassword, newPassword);
    return c.json({ message: "Password changed successfully" });
  }
);
var adminRouter = new import_zod_openapi3.OpenAPIHono();
adminRouter.use("*", (c, next) => {
  console.log("[DEMO MODE] Skipping authentication for admin routes");
  c.set("userId", "demo-user-id");
  c.set("userEmail", "demo@example.com");
  c.set("userRole", "ADMIN" /* ADMIN */);
  return next();
});
adminRouter.openapi(
  (0, import_zod_openapi3.createRoute)({
    method: "get",
    path: "/",
    tags: ["Admin"],
    description: "Get all users (admin only)",
    request: {
      query: userListQuerySchema
    },
    responses: {
      200: {
        description: "Users retrieved successfully",
        content: {
          "application/json": {
            schema: userListResponseSchema
          }
        }
      }
    }
  }),
  async (c) => {
    const query = c.req.query();
    const searchQuery = {
      page: parseInt(query.page || "1"),
      limit: parseInt(query.limit || "10"),
      search: query.search,
      role: query.role,
      sortBy: query.sortBy || "createdAt",
      sortOrder: query.sortOrder || "desc"
    };
    const users = await userService.getAllUsers(searchQuery);
    return c.json(users);
  }
);
adminRouter.openapi(
  (0, import_zod_openapi3.createRoute)({
    method: "get",
    path: "/{id}",
    tags: ["Admin"],
    description: "Get user by ID (admin only)",
    request: {
      params: UserIdParamSchema
    },
    responses: {
      200: {
        description: "User retrieved successfully",
        content: {
          "application/json": {
            schema: userResponseSchema
          }
        }
      }
    }
  }),
  async (c) => {
    const { id: id2 } = c.req.param();
    const user = await userService.getUserById(id2);
    return c.json(user);
  }
);
adminRouter.openapi(
  (0, import_zod_openapi3.createRoute)({
    method: "put",
    path: "/{id}/role",
    tags: ["Admin"],
    description: "Update user role (admin only)",
    request: {
      params: UserIdParamSchema,
      body: {
        content: {
          "application/json": {
            schema: updateUserRoleSchema
          }
        }
      }
    },
    responses: {
      200: {
        description: "User role updated successfully",
        content: {
          "application/json": {
            schema: userResponseSchema
          }
        }
      }
    }
  }),
  async (c) => {
    const { id: id2 } = c.req.param();
    const { role } = await c.req.json();
    const updatedUser = await userService.updateUserRole(id2, role);
    return c.json(updatedUser);
  }
);
adminRouter.openapi(
  (0, import_zod_openapi3.createRoute)({
    method: "delete",
    path: "/{id}",
    tags: ["Admin"],
    description: "Delete user (admin only)",
    request: {
      params: UserIdParamSchema
    },
    responses: {
      200: {
        description: "User deleted successfully"
      }
    }
  }),
  async (c) => {
    const { id: id2 } = c.req.param();
    await userService.deleteUser(id2);
    return c.json({ message: "User deleted successfully" });
  }
);
var router = new import_zod_openapi3.OpenAPIHono();
router.route("/", userRouter);
router.route("/admin", adminRouter);
var user_routes_default = router;

// src/routes/metadata.routes.ts
var import_hono2 = require("hono");

// src/services/metadata.service.ts
init_prisma();
var import_http_exception6 = require("hono/http-exception");

// src/services/cache.service.ts
init_redis_service();
var DEFAULT_OPTIONS = {
  ttl: 300,
  // 5 minutes
  useRedis: true,
  useMemory: true,
  prefix: "cache:"
};
var memoryCache = /* @__PURE__ */ new Map();
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of memoryCache.entries()) {
    if (entry.expiresAt < now) {
      memoryCache.delete(key);
    }
  }
}, 60 * 1e3);
function generateKey(key, options) {
  return `${options.prefix}${key}`;
}
function isValid(entry) {
  if (!entry)
    return false;
  return entry.expiresAt > Date.now();
}
var cacheService = {
  /**
   * Get a value from cache
   * @param key Cache key
   * @param options Cache options
   * @returns The cached value or null if not found
   */
  async get(key, options = {}) {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    const fullKey = generateKey(key, mergedOptions);
    if (mergedOptions.useMemory) {
      const memoryEntry = memoryCache.get(fullKey);
      if (memoryEntry && isValid(memoryEntry)) {
        return memoryEntry.value;
      }
    }
    if (mergedOptions.useRedis) {
      try {
        const redisEntry = await redisService.get(fullKey);
        if (redisEntry) {
          const entry = JSON.parse(redisEntry);
          if (isValid(entry)) {
            if (mergedOptions.useMemory) {
              memoryCache.set(fullKey, entry);
            }
            return entry.value;
          }
        }
      } catch (error) {
        console.error("Redis cache error:", error);
      }
    }
    return null;
  },
  /**
   * Set a value in cache
   * @param key Cache key
   * @param value Value to cache
   * @param options Cache options or ttl in seconds
   */
  async set(key, value, optionsOrTtl = {}) {
    const options = typeof optionsOrTtl === "number" ? { ttl: optionsOrTtl } : optionsOrTtl;
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    const fullKey = generateKey(key, mergedOptions);
    const now = Date.now();
    const ttlMs = mergedOptions.ttl * 1e3;
    const entry = {
      value,
      timestamp: now,
      expiresAt: now + ttlMs
    };
    if (mergedOptions.useMemory) {
      memoryCache.set(fullKey, entry);
    }
    if (mergedOptions.useRedis) {
      try {
        await redisService.set(
          fullKey,
          JSON.stringify(entry),
          mergedOptions.ttl
        );
      } catch (error) {
        console.error("Redis cache set error:", error);
      }
    }
  },
  /**
   * Delete a value from cache
   * @param key Cache key
   * @param options Cache options
   */
  async delete(key, options = {}) {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    const fullKey = generateKey(key, mergedOptions);
    if (mergedOptions.useMemory) {
      memoryCache.delete(fullKey);
    }
    if (mergedOptions.useRedis) {
      try {
        await redisService.delete(fullKey);
      } catch (error) {
        console.error("Redis cache delete error:", error);
      }
    }
  },
  /**
   * Clear all cache entries with a specific prefix
   * @param prefix Prefix to match cache keys
   */
  async clearByPrefix(prefix) {
    for (const key of memoryCache.keys()) {
      if (key.startsWith(prefix)) {
        memoryCache.delete(key);
      }
    }
    try {
      await redisService.deleteByPattern(`${prefix}*`);
    } catch (error) {
      console.error("Redis cache clear error:", error);
    }
  }
};

// src/services/metadata.service.ts
var metadataService = {
  /**
   * Get metadata by ID, with caching
   */
  async getMetadataById(id2) {
    const cacheKey = `metadata:${id2}`;
    const cachedMetadata = await cacheService.get(cacheKey);
    if (cachedMetadata) {
      console.log(`Cache hit for metadata ID: ${id2}`);
      return cachedMetadata;
    }
    const metadata2 = await import_db.prisma.metadata.findUnique({
      where: { id: id2 }
    });
    if (!metadata2) {
      throw new ApiError(
        `Metadata with ID ${id2} not found`,
        404,
        "REQ003" /* RESOURCE_NOT_FOUND */
      );
    }
    await cacheService.set(cacheKey, metadata2, 300);
    return metadata2;
  },
  /**
   * List metadata with pagination, filtering and caching
   */
  async listMetadata(params) {
    const {
      page = 1,
      limit = 20,
      search,
      userId,
      sort = "updatedAt",
      order = "desc"
    } = params;
    const skip2 = (page - 1) * limit;
    const cacheKey = `metadata:list:${JSON.stringify({
      page,
      limit,
      search,
      userId,
      sort,
      order
    })}`;
    const cachedResults = await cacheService.get(cacheKey);
    if (cachedResults) {
      console.log(`Cache hit for metadata listing`);
      return cachedResults;
    }
    const where = {};
    if (search) {
      where.OR = [
        { title: { contains: search } }
        // Add other fields to search as needed based on your schema
      ];
    }
    if (userId) {
      where.userId = userId;
    }
    const startTime = Date.now();
    const [total, items] = await Promise.all([
      import_db.prisma.metadata.count({ where }),
      import_db.prisma.metadata.findMany({
        where,
        skip: skip2,
        take: limit,
        orderBy: { [sort]: order }
      })
    ]);
    const queryTime = Date.now() - startTime;
    const totalPages = Math.ceil(total / limit);
    const result = {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages
      },
      meta: {
        queryTime
      }
    };
    await cacheService.set(cacheKey, result, 60);
    return result;
  },
  /**
   * Create new metadata
   */
  async createMetadata(data, userId) {
    const createData = userId ? { ...data, userId } : data;
    const metadata2 = await import_db.prisma.metadata.create({
      data: createData
    });
    await cacheService.clearByPrefix("metadata:list:");
    return metadata2;
  },
  /**
   * Update metadata
   */
  async updateMetadata(id2, data, userId) {
    const exists = await import_db.prisma.metadata.findUnique({ where: { id: id2 } });
    if (!exists) {
      throw new ApiError(
        `Metadata with ID ${id2} not found`,
        404,
        "REQ003" /* RESOURCE_NOT_FOUND */
      );
    }
    if (userId && exists.userId !== userId) {
      throw new ApiError(
        "You don't have permission to update this metadata",
        403,
        "BIZ001" /* BUSINESS_RULE_VIOLATION */
      );
    }
    const metadata2 = await import_db.prisma.metadata.update({
      where: { id: id2 },
      data
    });
    await cacheService.delete(`metadata:${id2}`);
    await cacheService.clearByPrefix("metadata:list:");
    return metadata2;
  },
  /**
   * Delete metadata
   */
  async deleteMetadata(id2, userId) {
    const exists = await import_db.prisma.metadata.findUnique({ where: { id: id2 } });
    if (!exists) {
      throw new ApiError(
        `Metadata with ID ${id2} not found`,
        404,
        "REQ003" /* RESOURCE_NOT_FOUND */
      );
    }
    if (userId && exists.userId !== userId) {
      throw new ApiError(
        "You don't have permission to delete this metadata",
        403,
        "BIZ001" /* BUSINESS_RULE_VIOLATION */
      );
    }
    await import_db.prisma.metadata.delete({ where: { id: id2 } });
    await cacheService.delete(`metadata:${id2}`);
    await cacheService.clearByPrefix("metadata:list:");
    return { success: true };
  },
  /**
   * Search metadata
   */
  searchMetadata: async (searchQuery) => {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      organization,
      author,
      dateFrom,
      dateTo,
      fileFormat,
      search,
      category,
      frameworkType
    } = searchQuery;
    console.log("API searchMetadata called with:", {
      searchQuery,
      table: "metadata"
    });
    const skip2 = (page - 1) * limit;
    const where = {};
    if (frameworkType) {
      where.frameworkType = { equals: frameworkType, mode: "insensitive" };
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { abstract: { contains: search, mode: "insensitive" } },
        { purpose: { contains: search, mode: "insensitive" } },
        { author: { contains: search, mode: "insensitive" } },
        { organization: { contains: search, mode: "insensitive" } },
        { frameworkType: { contains: search, mode: "insensitive" } },
        // Add a search for IDs that start with the search term
        { id: { startsWith: search } }
      ];
    }
    if (category) {
      if (category.toLowerCase() === "vector") {
        where.frameworkType = { equals: "Vector", mode: "insensitive" };
      } else if (category.toLowerCase() === "raster") {
        where.frameworkType = { equals: "Raster", mode: "insensitive" };
      } else if (category.toLowerCase() === "table") {
        where.frameworkType = { equals: "Table", mode: "insensitive" };
      } else {
        where.OR = [
          ...where.OR || [],
          // Search in categories array
          { categories: { has: category } },
          // Search for dataType-related terms in various fields
          { frameworkType: { contains: category, mode: "insensitive" } },
          { title: { contains: category, mode: "insensitive" } },
          { abstract: { contains: category, mode: "insensitive" } }
        ];
      }
      console.log(`Applied category filter: ${category}`, where);
    }
    if (organization) {
      where.organization = { contains: organization, mode: "insensitive" };
    }
    if (dateFrom) {
      where.productionDate = { gte: new Date(dateFrom) };
    }
    if (dateTo) {
      where.productionDate = {
        ...where.productionDate || {},
        lte: new Date(dateTo)
      };
    }
    try {
      console.log("Executing Prisma query with:", {
        where,
        skip: skip2,
        take: limit,
        orderBy: {
          [mapSortField(sortBy)]: sortOrder
        }
      });
      const [metadata2, total] = await Promise.all([
        import_db.prisma.metadata.findMany({
          where,
          skip: skip2,
          take: limit,
          orderBy: {
            // Map frontend sort fields to database fields
            [mapSortField(sortBy)]: sortOrder
          },
          select: {
            id: true,
            title: true,
            author: true,
            organization: true,
            abstract: true,
            purpose: true,
            thumbnailUrl: true,
            dateFrom: true,
            dateTo: true,
            frameworkType: true,
            categories: true,
            fileFormat: true,
            createdAt: true,
            updatedAt: true,
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }),
        import_db.prisma.metadata.count({ where })
      ]);
      console.log("Prisma query results:", {
        metadataCount: metadata2.length,
        total,
        firstItem: metadata2.length > 0 ? metadata2[0] : null
      });
      const mappedMetadata = metadata2.map((item) => ({
        id: item.id,
        title: item.title,
        author: item.author,
        organization: item.organization,
        dateFrom: item.dateFrom?.toString() || null,
        dateTo: item.dateTo?.toString() || null,
        abstract: item.abstract,
        purpose: item.purpose,
        thumbnailUrl: item.thumbnailUrl,
        imageName: null,
        frameworkType: item.frameworkType,
        coordinateUnit: null,
        minLatitude: null,
        minLongitude: null,
        maxLatitude: null,
        maxLongitude: null,
        dataName: null,
        productionDate: null,
        updatedAt: item.updatedAt.toISOString()
      }));
      return {
        metadata: mappedMetadata,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error("Error searching metadata:", error);
      throw new import_http_exception6.HTTPException(500, { message: "Failed to search metadata" });
    }
  },
  /**
   * Get user's metadata
   */
  getUserMetadata: async (userId, query) => {
    const {
      page,
      limit,
      search,
      category,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = query;
    const skip2 = (page - 1) * limit;
    const where = {
      userId,
      ...search ? {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { abstract: { contains: search, mode: "insensitive" } },
          { author: { contains: search, mode: "insensitive" } }
        ]
      } : {},
      ...category ? { categories: { has: category } } : {}
    };
    const [result, total] = await Promise.all([
      import_db.prisma.metadata.findMany({
        where,
        skip: skip2,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder
        }
      }),
      import_db.prisma.metadata.count({ where })
    ]);
    return {
      metadata: result.map((metadata2) => ({
        id: metadata2.id,
        title: metadata2.title,
        author: metadata2.author,
        organization: metadata2.organization,
        dateFrom: metadata2.dateFrom,
        dateTo: metadata2.dateTo,
        abstract: metadata2.abstract,
        purpose: metadata2.purpose,
        thumbnailUrl: metadata2.thumbnailUrl,
        imageName: metadata2.imageName,
        frameworkType: metadata2.frameworkType,
        categories: metadata2.categories,
        coordinateSystem: metadata2.coordinateSystem,
        projection: metadata2.projection,
        scale: metadata2.scale,
        resolution: metadata2.resolution || void 0,
        accuracyLevel: metadata2.accuracyLevel,
        completeness: metadata2.completeness || void 0,
        consistencyCheck: metadata2.consistencyCheck || void 0,
        validationStatus: metadata2.validationStatus || void 0,
        fileFormat: metadata2.fileFormat,
        fileSize: metadata2.fileSize || void 0,
        numFeatures: metadata2.numFeatures || void 0,
        softwareReqs: metadata2.softwareReqs || void 0,
        updateCycle: metadata2.updateCycle || void 0,
        lastUpdate: metadata2.lastUpdate?.toISOString() || void 0,
        nextUpdate: metadata2.nextUpdate?.toISOString() || void 0,
        distributionFormat: metadata2.distributionFormat,
        accessMethod: metadata2.accessMethod,
        downloadUrl: metadata2.downloadUrl || void 0,
        apiEndpoint: metadata2.apiEndpoint || void 0,
        licenseType: metadata2.licenseType,
        usageTerms: metadata2.usageTerms,
        attributionRequirements: metadata2.attributionRequirements,
        accessRestrictions: metadata2.accessRestrictions,
        contactPerson: metadata2.contactPerson,
        email: metadata2.email,
        department: metadata2.department || void 0,
        userId: metadata2.userId,
        createdAt: metadata2.createdAt.toISOString(),
        updatedAt: metadata2.updatedAt.toISOString()
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }
};
function mapSortField(sortBy) {
  switch (sortBy) {
    case "title":
      return "title";
    case "createdAt":
      return "createdAt";
    default:
      return sortBy;
  }
}

// src/routes/metadata.routes.ts
var import_zod_validator2 = require("@hono/zod-validator");
var import_zod2 = require("zod");

// src/types/metadata.types.ts
var import_zod = require("zod");
var metadataSchema = import_zod.z.object({
  title: import_zod.z.string().min(3, "Title must be at least 3 characters"),
  author: import_zod.z.string().min(2, "Author must be at least 2 characters"),
  organization: import_zod.z.string().min(2, "Organization must be at least 2 characters"),
  dateFrom: import_zod.z.string(),
  dateTo: import_zod.z.string(),
  abstract: import_zod.z.string().min(10, "Abstract must be at least 10 characters"),
  purpose: import_zod.z.string().min(10, "Purpose must be at least 10 characters"),
  thumbnailUrl: import_zod.z.string().url("Invalid thumbnail URL"),
  imageName: import_zod.z.string(),
  frameworkType: import_zod.z.string(),
  categories: import_zod.z.array(import_zod.z.string()).default([]),
  coordinateSystem: import_zod.z.string(),
  projection: import_zod.z.string(),
  scale: import_zod.z.number().int().positive("Scale must be a positive integer"),
  resolution: import_zod.z.string().optional(),
  coordinateUnit: import_zod.z.enum(["DD", "DMS"]).default("DD"),
  minLatitude: import_zod.z.number().default(0),
  minLongitude: import_zod.z.number().default(0),
  maxLatitude: import_zod.z.number().default(0),
  maxLongitude: import_zod.z.number().default(0),
  accuracyLevel: import_zod.z.string(),
  completeness: import_zod.z.number().int().min(0).max(100, "Completeness must be between 0 and 100").optional(),
  consistencyCheck: import_zod.z.boolean().optional(),
  validationStatus: import_zod.z.string().optional(),
  fileFormat: import_zod.z.string(),
  fileSize: import_zod.z.number().int().positive("File size must be a positive integer").optional(),
  numFeatures: import_zod.z.number().int().positive("Number of features must be a positive integer").optional(),
  softwareReqs: import_zod.z.string().optional(),
  updateCycle: import_zod.z.string().optional(),
  lastUpdate: import_zod.z.string().optional(),
  nextUpdate: import_zod.z.string().optional(),
  distributionFormat: import_zod.z.string(),
  accessMethod: import_zod.z.string(),
  downloadUrl: import_zod.z.string().url("Invalid download URL").optional(),
  apiEndpoint: import_zod.z.string().url("Invalid API endpoint").optional(),
  licenseType: import_zod.z.string(),
  usageTerms: import_zod.z.string(),
  attributionRequirements: import_zod.z.string(),
  accessRestrictions: import_zod.z.array(import_zod.z.string()).default([]),
  contactPerson: import_zod.z.string(),
  email: import_zod.z.string().email("Invalid email address"),
  department: import_zod.z.string().optional()
});
var MetadataIdParamSchema = import_zod.z.object({
  id: import_zod.z.string().uuid("Invalid metadata ID format")
});
var metadataSearchQuerySchema = import_zod.z.object({
  page: import_zod.z.string().optional().transform((val) => val ? parseInt(val, 10) : 1),
  limit: import_zod.z.string().optional().transform((val) => val ? parseInt(val, 10) : 10),
  search: import_zod.z.string().optional(),
  category: import_zod.z.string().optional(),
  frameworkType: import_zod.z.string().optional(),
  author: import_zod.z.string().optional(),
  organization: import_zod.z.string().optional(),
  dateFrom: import_zod.z.string().optional(),
  dateTo: import_zod.z.string().optional(),
  fileFormat: import_zod.z.string().optional(),
  sortBy: import_zod.z.enum(["title", "author", "organization", "createdAt"]).optional().default("createdAt"),
  sortOrder: import_zod.z.enum(["asc", "desc"]).optional().default("desc")
});

// src/routes/metadata.routes.ts
init_prisma();

// src/utils/json-serializer.ts
function bigIntSerializer(key, value) {
  if (typeof value === "bigint") {
    return value.toString();
  }
  return value;
}
var SafeJSON = {
  stringify: (value, replacer, space) => {
    const effectiveReplacer = replacer ? (key, val) => {
      const processedValue = typeof val === "bigint" ? val.toString() : val;
      return replacer(key, processedValue);
    } : bigIntSerializer;
    return JSON.stringify(value, effectiveReplacer, space);
  },
  // Parse remains the same as the native JSON.parse
  parse: JSON.parse
};

// src/routes/metadata.routes.ts
var metadata = new import_hono2.Hono();
var metadataSchema2 = import_zod2.z.object({
  title: import_zod2.z.string().min(1, "Title is required"),
  author: import_zod2.z.string().min(1, "Author is required"),
  organization: import_zod2.z.string().min(1, "Organization is required"),
  dateFrom: import_zod2.z.string(),
  dateTo: import_zod2.z.string(),
  abstract: import_zod2.z.string().min(1, "Abstract is required"),
  purpose: import_zod2.z.string().min(1, "Purpose is required"),
  thumbnailUrl: import_zod2.z.string().url("Invalid thumbnail URL"),
  imageName: import_zod2.z.string(),
  frameworkType: import_zod2.z.string(),
  categories: import_zod2.z.array(import_zod2.z.string()),
  coordinateSystem: import_zod2.z.string(),
  projection: import_zod2.z.string(),
  scale: import_zod2.z.number().positive("Scale must be positive"),
  resolution: import_zod2.z.string().optional(),
  coordinateUnit: import_zod2.z.enum(["DD", "DMS"]).default("DD"),
  minLatitude: import_zod2.z.number().default(0),
  minLongitude: import_zod2.z.number().default(0),
  maxLatitude: import_zod2.z.number().default(0),
  maxLongitude: import_zod2.z.number().default(0),
  accuracyLevel: import_zod2.z.string(),
  completeness: import_zod2.z.number().min(0).max(100).optional(),
  consistencyCheck: import_zod2.z.boolean().optional(),
  validationStatus: import_zod2.z.string().optional(),
  fileFormat: import_zod2.z.string(),
  fileSize: import_zod2.z.number().positive("File size must be positive").optional(),
  numFeatures: import_zod2.z.number().positive("Number of features must be positive").optional(),
  softwareReqs: import_zod2.z.string().optional(),
  updateCycle: import_zod2.z.string().optional(),
  lastUpdate: import_zod2.z.string().datetime().optional(),
  nextUpdate: import_zod2.z.string().datetime().optional(),
  distributionFormat: import_zod2.z.string(),
  accessMethod: import_zod2.z.string(),
  downloadUrl: import_zod2.z.string().url("Invalid download URL").optional(),
  apiEndpoint: import_zod2.z.string().url("Invalid API endpoint").optional(),
  licenseType: import_zod2.z.string(),
  usageTerms: import_zod2.z.string(),
  attributionRequirements: import_zod2.z.string(),
  accessRestrictions: import_zod2.z.array(import_zod2.z.string()),
  contactPerson: import_zod2.z.string(),
  email: import_zod2.z.string().email("Invalid email format"),
  department: import_zod2.z.string().optional()
});
metadata.use("*", async (c, next) => {
  console.log("[DEMO MODE] Skipping authentication for metadata routes");
  c.set("userId", "demo-user-id");
  c.set("userEmail", "demo@example.com");
  c.set("userRole", "ADMIN" /* ADMIN */);
  return next();
});
metadata.post("/", (0, import_zod_validator2.zValidator)("json", metadataSchema2), async (c) => {
  const userId = c.get("userId");
  const data = await c.req.json();
  const result = await metadataService.createMetadata(data, userId);
  return new Response(SafeJSON.stringify(result), {
    headers: {
      "Content-Type": "application/json"
    }
  });
});
metadata.get("/:id", (0, import_zod_validator2.zValidator)("param", MetadataIdParamSchema), async (c) => {
  const { id: id2 } = c.req.valid("param");
  const metadata2 = await import_db.prisma.metadata.findUnique({
    where: { id: id2 }
  });
  if (!metadata2) {
    return c.json({ error: "Metadata not found" }, 404);
  }
  return new Response(
    SafeJSON.stringify({
      metadata: metadata2
    }),
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
});
metadata.put(
  "/:id",
  (0, import_zod_validator2.zValidator)("param", MetadataIdParamSchema),
  (0, import_zod_validator2.zValidator)("json", metadataSchema2.partial()),
  async (c) => {
    const userId = c.get("userId");
    const { id: id2 } = c.req.valid("param");
    const data = await c.req.json();
    const result = await metadataService.updateMetadata(id2, data, userId);
    return new Response(SafeJSON.stringify(result), {
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
);
metadata.delete(
  "/:id",
  (0, import_zod_validator2.zValidator)("param", MetadataIdParamSchema),
  async (c) => {
    const userId = c.get("userId");
    const { id: id2 } = c.req.valid("param");
    await metadataService.deleteMetadata(id2, userId);
    return c.json({ message: "Metadata deleted successfully" });
  }
);
metadata.get("/search", async (c) => {
  const {
    page = "1",
    limit = "10",
    search,
    category,
    frameworkType,
    dateFrom,
    dateTo
  } = c.req.query();
  const result = await metadataService.searchMetadata({
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    search,
    category,
    frameworkType,
    dateFrom,
    dateTo,
    sortBy: "createdAt",
    sortOrder: "desc"
  });
  return new Response(
    SafeJSON.stringify({
      success: true,
      data: result
    }),
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
});
metadata.get("/user", async (c) => {
  const userId = c.get("userId");
  const { page = "1", limit = "10", search, category } = c.req.query();
  const result = await metadataService.getUserMetadata(userId, {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    search,
    category,
    sortBy: "createdAt",
    sortOrder: "desc"
  });
  return new Response(SafeJSON.stringify(result), {
    headers: {
      "Content-Type": "application/json"
    }
  });
});
var metadata_routes_default = metadata;

// src/routes/search.routes.ts
var import_hono3 = require("hono");
var searchRouter = new import_hono3.Hono();
searchRouter.get("/metadata", async (c) => {
  const {
    page = "1",
    limit = "10",
    search,
    category,
    dateFrom,
    dateTo,
    sortBy = "createdAt",
    sortOrder = "desc"
  } = c.req.query();
  try {
    const result = await metadataService.searchMetadata({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      search,
      category,
      dateFrom,
      dateTo,
      sortBy,
      sortOrder: sortOrder === "asc" ? "asc" : "desc"
    });
    return c.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Public search error:", error);
    return c.json(
      {
        success: false,
        error: "Failed to search metadata"
      },
      500
    );
  }
});
var search_routes_default = searchRouter;

// src/routes/admin.routes.ts
var import_hono4 = require("hono");
var import_zod_validator3 = require("@hono/zod-validator");

// src/db/client.ts
init_prisma_client();

// src/db/repositories/user.repository.ts
var userRepository = {
  /**
   * Find a user by ID
   */
  findById: async (id2) => {
    return import_db.prisma.user.findUnique({
      where: { id: id2 }
    });
  },
  /**
   * Find a user by email
   */
  findByEmail: async (email) => {
    return import_db.prisma.user.findUnique({
      where: { email }
    });
  },
  /**
   * Create a new user
   */
  create: async (data) => {
    return import_db.prisma.user.create({
      data
    });
  },
  /**
   * Update a user
   */
  update: async (id2, data) => {
    return import_db.prisma.user.update({
      where: { id: id2 },
      data
    });
  },
  /**
   * Delete a user
   */
  delete: async (id2) => {
    return import_db.prisma.user.delete({
      where: { id: id2 }
    });
  },
  /**
   * Find all users with pagination and filtering
   */
  findAll: async (query) => {
    const { page, limit, search, role, sortBy, sortOrder } = query;
    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { organization: { contains: search, mode: "insensitive" } }
      ];
    }
    if (role) {
      where.role = role;
    }
    const total = await import_db.prisma.user.count({ where });
    const users = await import_db.prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder
      }
    });
    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  },
  /**
   * Count total users
   */
  count: async () => {
    return import_db.prisma.user.count();
  },
  /**
   * Count users created after a specific date
   */
  countCreatedAfter: async (date) => {
    return import_db.prisma.user.count({
      where: {
        createdAt: {
          gte: date
        }
      }
    });
  },
  /**
   * Count users by role
   */
  countByRole: async () => {
    const usersByRole = await import_db.prisma.user.groupBy({
      by: ["role"],
      _count: {
        role: true
      }
    });
    return usersByRole.reduce(
      (acc, curr) => {
        acc[curr.role] = curr._count.role;
        return acc;
      },
      {}
    );
  }
};

// src/db/repositories/metadata.repository.ts
var metadataRepository = {
  /**
   * Find metadata by ID
   */
  findById: async (id2) => {
    return import_db.prisma.metadata.findUnique({
      where: { id: id2 }
    });
  },
  /**
   * Create new metadata
   */
  create: async (data) => {
    return import_db.prisma.metadata.create({
      data
    });
  },
  /**
   * Update metadata
   */
  update: async (id2, data) => {
    return import_db.prisma.metadata.update({
      where: { id: id2 },
      data
    });
  },
  /**
   * Delete metadata
   */
  delete: async (id2) => {
    return import_db.prisma.metadata.delete({
      where: { id: id2 }
    });
  },
  /**
   * Find all metadata with pagination and filtering
   */
  findAll: async (query) => {
    const {
      page,
      limit,
      search,
      category,
      author,
      organization,
      dateFrom,
      dateTo,
      fileFormat,
      sortBy,
      sortOrder
    } = query;
    const where = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { abstract: { contains: search, mode: "insensitive" } },
        { purpose: { contains: search, mode: "insensitive" } }
      ];
    }
    if (category) {
      where.categories = {
        has: category
      };
    }
    if (author) {
      where.author = {
        contains: author,
        mode: "insensitive"
      };
    }
    if (organization) {
      where.organization = {
        contains: organization,
        mode: "insensitive"
      };
    }
    if (dateFrom) {
      where.dateFrom = {
        gte: dateFrom
      };
    }
    if (dateTo) {
      where.dateTo = {
        lte: dateTo
      };
    }
    if (fileFormat) {
      where.fileFormat = {
        equals: fileFormat,
        mode: "insensitive"
      };
    }
    const total = await import_db.prisma.metadata.count({ where });
    const metadata2 = await import_db.prisma.metadata.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    return {
      metadata: metadata2,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  },
  /**
   * Find metadata by user ID
   */
  findByUserId: async (userId, query) => {
    const { page, limit, search, sortBy, sortOrder } = query;
    const where = {
      userId
    };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { abstract: { contains: search, mode: "insensitive" } }
      ];
    }
    const total = await import_db.prisma.metadata.count({ where });
    const metadata2 = await import_db.prisma.metadata.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder
      }
    });
    return {
      metadata: metadata2,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  },
  /**
   * Count total metadata
   */
  count: async () => {
    return import_db.prisma.metadata.count();
  },
  /**
   * Count metadata created after a specific date
   */
  countCreatedAfter: async (date) => {
    return import_db.prisma.metadata.count({
      where: {
        createdAt: {
          gte: date
        }
      }
    });
  },
  /**
   * Delete all metadata by user ID
   */
  deleteByUserId: async (userId) => {
    return import_db.prisma.metadata.deleteMany({
      where: {
        userId
      }
    });
  }
};

// src/services/admin.service.ts
var adminService = {
  /**
   * Get enhanced admin dashboard statistics
   */
  getAdminDashboardStats: async () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3);
    const [userCount, organizations, metadataCount, activeUsers, pendingCount] = await Promise.all([
      // Total number of users
      import_db.prisma.user.count(),
      // Get unique organizations
      import_db.prisma.user.groupBy({
        by: ["organization"],
        where: {
          organization: {
            not: null
          }
        }
      }),
      // Total metadata entries
      import_db.prisma.metadata.count(),
      // Active users (users with activity in the last 30 days)
      import_db.prisma.user.count({
        where: {
          metadata: {
            some: {
              updatedAt: {
                gte: thirtyDaysAgo
              }
            }
          }
        }
      }),
      // Pending approvals (metadata with 'validationStatus' that is not 'Validated')
      import_db.prisma.metadata.count({
        where: {
          validationStatus: {
            not: "Validated"
          }
        }
      })
    ]);
    const orgCount = organizations.filter(
      (org) => org.organization !== null
    ).length;
    const metadataRatio = metadataCount > 0 ? Math.min(metadataCount / 1e3, 1) : 0;
    const userRatio = userCount > 0 ? Math.min(userCount / 200, 1) : 0;
    const activeRatio = userCount > 0 ? activeUsers / userCount : 0;
    const systemHealth = Math.round(
      (metadataRatio * 0.3 + userRatio * 0.3 + activeRatio * 0.4) * 100
    );
    return {
      userCount,
      orgCount,
      metadataCount,
      activeUsers,
      pendingApprovals: pendingCount,
      systemHealth
    };
  },
  /**
   * Get all users with pagination and filtering
   */
  getAllUsers: async (query) => {
    const result = await userRepository.findAll(query);
    return {
      users: result.users.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name || "",
        role: mapPrismaRoleToAppRole(user.role),
        emailVerified: user.emailVerified !== null,
        organization: user.organization || void 0,
        department: user.department || void 0,
        phone: user.phone || void 0,
        image: user.image || void 0,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
      })),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages
    };
  },
  /**
   * Update user role
   */
  updateUserRole: async (userId, role) => {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError("User not found", 404, "REQ003" /* RESOURCE_NOT_FOUND */);
    }
    const updatedUser = await userRepository.update(userId, {
      role: mapAppRoleToPrismaRole(role)
    });
    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name || "",
      role: mapPrismaRoleToAppRole(updatedUser.role),
      emailVerified: updatedUser.emailVerified !== null,
      organization: updatedUser.organization || void 0,
      department: updatedUser.department || void 0,
      phone: updatedUser.phone || void 0,
      image: updatedUser.image || void 0,
      createdAt: updatedUser.createdAt.toISOString(),
      updatedAt: updatedUser.updatedAt.toISOString()
    };
  },
  /**
   * Delete user
   */
  deleteUser: async (userId) => {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError("User not found", 404, "REQ003" /* RESOURCE_NOT_FOUND */);
    }
    await metadataRepository.deleteByUserId(userId);
    await userRepository.delete(userId);
  },
  /**
   * Get detailed user information
   */
  getUserDetails: async (userId) => {
    let user = await userRepository.findById(userId);
    if (!user) {
      const allUsers = await import_db.prisma.user.findMany({
        take: 100,
        select: { id: true }
      });
      const matchedUser = allUsers.find(
        (u) => u.id.toLowerCase() === userId.toLowerCase()
      );
      if (matchedUser) {
        user = await userRepository.findById(matchedUser.id);
      }
    }
    if (!user) {
      throw new ApiError("User not found", 404, "REQ003" /* RESOURCE_NOT_FOUND */);
    }
    const [metadataCount, recentMetadata] = await Promise.all([
      import_db.prisma.metadata.count({
        where: { userId: user.id }
      }),
      import_db.prisma.metadata.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          updatedAt: true
        }
      })
    ]);
    return {
      id: user.id,
      email: user.email,
      name: user.name || "",
      role: mapPrismaRoleToAppRole(user.role),
      emailVerified: user.emailVerified !== null,
      organization: user.organization || void 0,
      department: user.department || void 0,
      phone: user.phone || void 0,
      image: user.image || void 0,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      metadataCount,
      recentActivity: recentMetadata.map((m) => ({
        id: m.id,
        title: m.title,
        updatedAt: m.updatedAt.toISOString()
      }))
    };
  },
  /**
   * Get all metadata with pagination and filtering
   */
  getAllMetadata: async (query) => {
    const result = await metadataRepository.findAll(query);
    return {
      metadata: result.metadata.map((metadata2) => ({
        id: metadata2.id,
        title: metadata2.title,
        author: metadata2.author,
        organization: metadata2.organization,
        dateFrom: metadata2.dateFrom,
        dateTo: metadata2.dateTo,
        abstract: metadata2.abstract,
        purpose: metadata2.purpose,
        thumbnailUrl: metadata2.thumbnailUrl,
        imageName: metadata2.imageName,
        frameworkType: metadata2.frameworkType,
        categories: metadata2.categories,
        coordinateSystem: metadata2.coordinateSystem,
        projection: metadata2.projection,
        scale: metadata2.scale,
        resolution: metadata2.resolution || void 0,
        accuracyLevel: metadata2.accuracyLevel,
        completeness: metadata2.completeness || void 0,
        consistencyCheck: metadata2.consistencyCheck || void 0,
        validationStatus: metadata2.validationStatus || void 0,
        fileFormat: metadata2.fileFormat,
        fileSize: metadata2.fileSize || void 0,
        numFeatures: metadata2.numFeatures || void 0,
        softwareReqs: metadata2.softwareReqs || void 0,
        updateCycle: metadata2.updateCycle || void 0,
        lastUpdate: metadata2.lastUpdate?.toISOString() || void 0,
        nextUpdate: metadata2.nextUpdate?.toISOString() || void 0,
        distributionFormat: metadata2.distributionFormat,
        accessMethod: metadata2.accessMethod,
        downloadUrl: metadata2.downloadUrl || void 0,
        apiEndpoint: metadata2.apiEndpoint || void 0,
        licenseType: metadata2.licenseType,
        usageTerms: metadata2.usageTerms,
        attributionRequirements: metadata2.attributionRequirements,
        accessRestrictions: metadata2.accessRestrictions,
        contactPerson: metadata2.contactPerson,
        email: metadata2.email,
        department: metadata2.department || void 0,
        userId: metadata2.userId,
        createdAt: metadata2.createdAt.toISOString(),
        updatedAt: metadata2.updatedAt.toISOString()
      })),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages
    };
  },
  /**
   * Delete metadata
   */
  deleteMetadata: async (id2) => {
    const metadata2 = await metadataRepository.findById(id2);
    if (!metadata2) {
      throw new ApiError(
        "Metadata not found",
        404,
        "REQ003" /* RESOURCE_NOT_FOUND */
      );
    }
    await metadataRepository.delete(id2);
  },
  /**
   * Verify user's email manually
   */
  verifyUserEmail: async (userId) => {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError("User not found", 404, "REQ003" /* RESOURCE_NOT_FOUND */);
    }
    const updatedUser = await userRepository.update(userId, {
      emailVerified: /* @__PURE__ */ new Date()
    });
    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name || "",
      role: mapPrismaRoleToAppRole(updatedUser.role),
      emailVerified: updatedUser.emailVerified !== null,
      organization: updatedUser.organization || void 0,
      department: updatedUser.department || void 0,
      phone: updatedUser.phone || void 0,
      image: updatedUser.image || void 0,
      createdAt: updatedUser.createdAt.toISOString(),
      updatedAt: updatedUser.updatedAt.toISOString()
    };
  }
};

// src/routes/admin.routes.ts
init_prisma();

// src/lib/logger.ts
var import_winston = __toESM(require("winston"));
init_config();
var { combine, timestamp, printf, colorize } = import_winston.default.format;
var logFormat = printf(({ level, message, timestamp: timestamp2, ...metadata2 }) => {
  let msg = `${timestamp2} [${level}] : ${message}`;
  if (Object.keys(metadata2).length > 0) {
    msg += JSON.stringify(metadata2);
  }
  return msg;
});
var logger = import_winston.default.createLogger({
  level: config2.env === "development" ? "debug" : "info",
  format: combine(
    colorize(),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    logFormat
  ),
  transports: [
    new import_winston.default.transports.Console({
      format: combine(colorize(), timestamp(), logFormat)
    })
  ]
});
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection", {
    error: reason
  });
});
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception", {
    error
  });
  setTimeout(() => {
    process.exit(1);
  }, 1e3);
});

// src/utils/cache.ts
var MemoryCache = class {
  constructor() {
    this.cache = /* @__PURE__ */ new Map();
  }
  /**
   * Set a value in the cache with a TTL (time-to-live)
   * @param key Cache key
   * @param value Value to store
   * @param ttlMs Time to live in milliseconds
   */
  set(key, value, ttlMs) {
    const expiresAt = Date.now() + ttlMs;
    this.cache.set(key, { value, expiresAt });
  }
  /**
   * Get a value from the cache
   * @param key Cache key
   * @returns The cached value or undefined if not found or expired
   */
  get(key) {
    const item = this.cache.get(key);
    if (!item)
      return void 0;
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return void 0;
    }
    return item.value;
  }
  /**
   * Check if a key exists in the cache and is not expired
   * @param key Cache key
   * @returns Whether the key exists in the cache
   */
  has(key) {
    const item = this.cache.get(key);
    if (!item)
      return false;
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }
  /**
   * Remove a key from the cache
   * @param key Cache key
   */
  delete(key) {
    this.cache.delete(key);
  }
  /**
   * Clear all items from the cache
   */
  clear() {
    this.cache.clear();
  }
  /**
   * Get cache stats
   * @returns Object with cache statistics
   */
  getStats() {
    let validItems = 0;
    let expiredItems = 0;
    this.cache.forEach((item) => {
      if (Date.now() > item.expiresAt) {
        expiredItems++;
      } else {
        validItems++;
      }
    });
    return {
      totalItems: this.cache.size,
      validItems,
      expiredItems
    };
  }
};
var memoryCache2 = new MemoryCache();

// src/routes/admin.routes.ts
var adminRouter2 = new import_hono4.Hono().use("*", async (c, next) => {
  console.log("[DEMO MODE] Skipping authentication for admin routes");
  const mockUser = {
    id: "demo-user-id",
    email: "demo@example.com",
    role: "ADMIN" /* ADMIN */
  };
  c.set("userId", mockUser.id);
  c.set("userEmail", mockUser.email);
  c.set("userRole", mockUser.role);
  c.set("user", mockUser);
  await next();
});
adminRouter2.get("/users", async (c) => {
  const { page = "1", limit = "10", search, role } = c.req.query();
  const cacheKey = `admin-users-${page}-${limit}-${search || ""}-${role || ""}`;
  const cachedResult = memoryCache2.get(cacheKey);
  if (cachedResult && !search) {
    logger.info("Serving admin users from cache");
    return new Response(cachedResult, {
      headers: {
        "Content-Type": "application/json",
        "X-Cache": "HIT"
      }
    });
  }
  const users = await adminService.getAllUsers({
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    search,
    role,
    sortBy: "createdAt",
    sortOrder: "desc"
  });
  const serializedResponse = SafeJSON.stringify({
    success: true,
    data: users
  });
  if (!search) {
    memoryCache2.set(cacheKey, serializedResponse, 12e4);
  }
  return new Response(serializedResponse, {
    headers: {
      "Content-Type": "application/json",
      "X-Cache": "MISS"
    }
  });
});
adminRouter2.put(
  "/users/:id/role",
  (0, import_zod_validator3.zValidator)("param", UserIdParamSchema),
  async (c) => {
    const { id: id2 } = c.req.valid("param");
    const { role } = await c.req.json();
    if (!role || !Object.values(UserRole).includes(role)) {
      return c.json(
        {
          success: false,
          message: "Invalid role"
        },
        400
      );
    }
    try {
      const user = await adminService.updateUserRole(id2, role);
      return c.json({
        success: true,
        message: "User role updated successfully",
        data: user
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return c.json(
          {
            success: false,
            message: error.message
          },
          404
        );
      }
      console.error("Error updating user role:", error);
      return c.json(
        {
          success: false,
          message: "Failed to update user role"
        },
        500
      );
    }
  }
);
adminRouter2.get(
  "/users/:id",
  (0, import_zod_validator3.zValidator)("param", UserIdParamSchema),
  async (c) => {
    const { id: id2 } = c.req.valid("param");
    try {
      console.log(`[API] Fetching details for user ${id2}`);
      const userDetails = await adminService.getUserDetails(id2);
      return c.json({
        success: true,
        data: userDetails
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return c.json(
          {
            success: false,
            message: "User not found"
          },
          404
        );
      }
      console.error("Error fetching user details:", error);
      return c.json(
        {
          success: false,
          message: "Failed to fetch user details"
        },
        500
      );
    }
  }
);
adminRouter2.delete(
  "/users/:id",
  (0, import_zod_validator3.zValidator)("param", UserIdParamSchema),
  async (c) => {
    const { id: id2 } = c.req.valid("param");
    await adminService.deleteUser(id2);
    return c.json({
      success: true,
      message: "User deleted successfully"
    });
  }
);
adminRouter2.post(
  "/users/:id/verify-email",
  (0, import_zod_validator3.zValidator)("param", UserIdParamSchema),
  async (c) => {
    const { id: id2 } = c.req.valid("param");
    const user = await adminService.verifyUserEmail(id2);
    return c.json({
      success: true,
      data: user,
      message: "Email verified successfully"
    });
  }
);
adminRouter2.get("/metadata", async (c) => {
  const {
    page = "1",
    limit = "10",
    search,
    category,
    dateFrom,
    dateTo
  } = c.req.query();
  const cacheKey = `admin-metadata-${page}-${limit}-${search || ""}-${category || ""}-${dateFrom || ""}-${dateTo || ""}`;
  const cachedResult = memoryCache2.get(cacheKey);
  if (cachedResult && !search) {
    logger.info("Serving admin metadata from cache");
    return new Response(cachedResult, {
      headers: {
        "Content-Type": "application/json",
        "X-Cache": "HIT"
      }
    });
  }
  const result = await adminService.getAllMetadata({
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    search,
    category,
    dateFrom,
    dateTo,
    sortBy: "createdAt",
    sortOrder: "desc"
  });
  const serializedResponse = SafeJSON.stringify({
    success: true,
    data: result
  });
  if (!search) {
    memoryCache2.set(cacheKey, serializedResponse, 12e4);
  }
  return new Response(serializedResponse, {
    headers: {
      "Content-Type": "application/json",
      "X-Cache": "MISS"
    }
  });
});
adminRouter2.delete(
  "/metadata/:id",
  (0, import_zod_validator3.zValidator)("param", MetadataIdParamSchema),
  async (c) => {
    const { id: id2 } = c.req.valid("param");
    await adminService.deleteMetadata(id2);
    return c.json({
      success: true,
      message: "Metadata deleted successfully"
    });
  }
);
adminRouter2.get("/dashboard-stats", async (c) => {
  try {
    const user = c.get("user");
    if (!user) {
      throw new ApiError("Unauthorized", 401);
    }
    const cacheKey = `dashboard-stats-${user.id}`;
    const cachedStats = memoryCache2.get(cacheKey);
    if (cachedStats) {
      logger.info("Serving dashboard stats from cache", {
        userId: user.id,
        email: user.email
      });
      return new Response(cachedStats, {
        headers: {
          "Content-Type": "application/json",
          "X-Cache": "HIT"
        }
      });
    }
    logger.info("Fetching dashboard stats", {
      userId: user.id,
      email: user.email
    });
    const [
      totalUsers,
      totalMetadata,
      userRoleDistribution,
      recentMetadata,
      userGrowth,
      metadataByFramework,
      topOrganizations
    ] = await Promise.all([
      // Get total users
      import_db.prisma.user.count(),
      // Get total metadata entries
      import_db.prisma.metadata.count(),
      // Get user role distribution
      import_db.prisma.user.groupBy({
        by: ["role"],
        _count: {
          id: true
        }
      }),
      // Get recent metadata entries with optimized field selection
      import_db.prisma.metadata.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc"
        },
        select: {
          id: true,
          title: true,
          author: true,
          organization: true,
          createdAt: true,
          thumbnailUrl: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        }
      }),
      // Get user growth
      import_db.prisma.user.groupBy({
        by: ["createdAt"],
        _count: {
          id: true
        },
        orderBy: {
          createdAt: "desc"
        },
        take: 30
      }),
      // Get metadata by framework type
      import_db.prisma.metadata.groupBy({
        by: ["frameworkType"],
        _count: {
          id: true
        }
      }),
      // Get top organizations
      import_db.prisma.metadata.groupBy({
        by: ["organization"],
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: "desc"
          }
        },
        take: 5
      })
    ]);
    logger.debug("All dashboard queries completed", {
      totalUsers,
      totalMetadataCount: totalMetadata,
      userRoleDistCount: userRoleDistribution.length,
      recentMetadataCount: recentMetadata.length,
      userGrowthPoints: userGrowth.length,
      metadataByFrameworkCount: metadataByFramework.length,
      topOrganizationsCount: topOrganizations.length
    });
    const stats = {
      totalUsers,
      totalMetadata,
      userRoleDistribution,
      recentMetadata,
      userGrowth,
      metadataByFramework,
      topOrganizations
    };
    const serializedResponse = SafeJSON.stringify(stats);
    memoryCache2.set(cacheKey, serializedResponse, 3e5);
    return new Response(serializedResponse, {
      headers: {
        "Content-Type": "application/json",
        "X-Cache": "MISS"
      }
    });
  } catch (error) {
    logger.error("Error fetching dashboard stats", {
      error,
      userId: c.get("user")?.id,
      email: c.get("user")?.email
    });
    if (error instanceof ApiError) {
      return c.json({ error: error.message }, error.status);
    }
    return c.json(
      {
        error: "Failed to fetch dashboard statistics",
        message: error instanceof Error ? error.message : "Unknown error occurred"
      },
      500
    );
  }
});
adminRouter2.get("/stats", async (c) => {
  try {
    const cacheKey = "admin-system-stats";
    const cachedStats = memoryCache2.get(cacheKey);
    if (cachedStats) {
      logger.info("Serving system stats from cache");
      return new Response(cachedStats, {
        headers: {
          "Content-Type": "application/json",
          "X-Cache": "HIT"
        }
      });
    }
    const stats = await adminService.getAdminDashboardStats();
    const serializedResponse = SafeJSON.stringify({
      success: true,
      data: stats
    });
    memoryCache2.set(cacheKey, serializedResponse, 3e5);
    return new Response(serializedResponse, {
      headers: {
        "Content-Type": "application/json",
        "X-Cache": "MISS"
      }
    });
  } catch (error) {
    logger.error("Error fetching system stats", {
      error,
      userId: c.get("user")?.id,
      email: c.get("user")?.email
    });
    if (error instanceof ApiError) {
      return c.json({ error: error.message }, error.status);
    }
    return c.json(
      {
        success: false,
        message: "Failed to fetch system statistics"
      },
      500
    );
  }
});
var admin_routes_default = adminRouter2;

// src/routes/permissions/index.ts
var import_zod_openapi4 = require("@hono/zod-openapi");
var import_zod4 = require("zod");
init_prisma();

// src/middleware/validation.ts
var import_zod3 = require("zod");

// src/middleware/rate-limit.ts
init_config();

// src/lib/redis.ts
var import_ioredis = __toESM(require("ioredis"));
var redis2 = new import_ioredis.default({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2e3);
    return delay;
  }
});
redis2.on("error", (error) => {
  logger.error({
    message: "Redis connection error",
    error: error.message
  });
});
redis2.on("connect", () => {
  logger.info("Redis connected successfully");
});
var redis_default = redis2;

// src/middleware/rate-limit.ts
async function isRateLimited(key, limit, window2) {
  const now = Date.now();
  const windowKey = Math.floor(now / window2);
  const finalKey = `rate_limit:${key}:${windowKey}`;
  try {
    const multi = redis_default.multi();
    multi.incr(finalKey);
    multi.pexpire(finalKey, window2);
    const [count] = await multi.exec();
    return count > limit;
  } catch (error) {
    logger.error({
      message: "Rate limit check error",
      error: error instanceof Error ? error.message : "Unknown error",
      key
    });
    return false;
  }
}
var rateLimit2 = async (c, next) => {
  try {
    const clientIp = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
    const isLimited = await isRateLimited(
      `${clientIp}:standard`,
      config2.rateLimit.standard.max,
      config2.rateLimit.standard.window
    );
    if (isLimited) {
      logger.warn({
        message: "Rate limit exceeded",
        ip: clientIp,
        path: c.req.path
      });
      return c.json(
        { error: "Too many requests. Please try again later." },
        429
      );
    }
    await next();
  } catch (error) {
    logger.error({
      message: "Rate limit error",
      error: error instanceof Error ? error.message : "Unknown error"
    });
    await next();
  }
};

// src/middleware/permission.middleware.ts
init_prisma();
init_permissions();
function requirePermission(action, subject) {
  return async (c, next) => {
    const user = c.get("user");
    if (!user) {
      throw new AuthError(
        AuthErrorCode.UNAUTHORIZED,
        "User not found in context",
        401
      );
    }
    const clientInfo = {
      ipAddress: c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || c.req.header("cf-connecting-ip") || "unknown",
      userAgent: c.req.header("user-agent") || "unknown"
    };
    const resourceId = c.req.param("id");
    const resource = resourceId ? { id: resourceId } : void 0;
    const result = await hasPermission(user, action, subject, resource);
    await logPermissionCheck(
      user,
      action,
      subject,
      resource,
      result.granted,
      clientInfo.ipAddress,
      clientInfo.userAgent
    );
    if (!result.granted) {
      throw new AuthError(
        "AUTH011" /* FORBIDDEN */,
        result.reason || "Insufficient permissions",
        403
      );
    }
    await next();
  };
}

// src/constants/permissions.ts
var METADATA_CREATE = { action: "create", subject: "metadata" };
var METADATA_READ = { action: "read", subject: "metadata" };
var METADATA_UPDATE = { action: "update", subject: "metadata" };
var METADATA_DELETE = { action: "delete", subject: "metadata" };
var METADATA_APPROVE = { action: "approve", subject: "metadata" };
var METADATA_REJECT = { action: "reject", subject: "metadata" };
var METADATA_PUBLISH = { action: "publish", subject: "metadata" };
var METADATA_UNPUBLISH = { action: "unpublish", subject: "metadata" };
var METADATA_IMPORT = { action: "import", subject: "metadata" };
var METADATA_EXPORT = { action: "export", subject: "metadata" };
var METADATA_SUBMIT_FOR_REVIEW = {
  action: "submit-for-review",
  subject: "metadata"
};
var METADATA_VALIDATE = { action: "validate", subject: "metadata" };
var METADATA_BULK_EDIT = { action: "bulk-edit", subject: "metadata" };
var METADATA_ASSIGN_REVIEWER = {
  action: "assign-reviewer",
  subject: "metadata"
};
var USER_CREATE = { action: "create", subject: "user" };
var USER_READ = { action: "read", subject: "user" };
var USER_UPDATE = { action: "update", subject: "user" };
var USER_DELETE = { action: "delete", subject: "user" };
var USER_MANAGE_ROLES = { action: "manage-roles", subject: "user" };
var ROLE_CREATE = { action: "create", subject: "role" };
var ROLE_READ = { action: "read", subject: "role" };
var ROLE_UPDATE = { action: "update", subject: "role" };
var ROLE_DELETE = { action: "delete", subject: "role" };
var ROLE_ASSIGN = { action: "assign", subject: "role" };
var PERMISSION_CREATE = { action: "create", subject: "permission" };
var PERMISSION_READ = { action: "read", subject: "permission" };
var PERMISSION_UPDATE = { action: "update", subject: "permission" };
var PERMISSION_DELETE = { action: "delete", subject: "permission" };
var PERMISSION_ASSIGN = { action: "assign", subject: "permission" };
var SYSTEM_SETTINGS = { action: "manage", subject: "settings" };
var SYSTEM_LOGS = { action: "view", subject: "logs" };
var SYSTEM_BACKUP = { action: "manage", subject: "backup" };
var DASHBOARD_VIEW = { action: "view", subject: "dashboard" };
var DASHBOARD_ANALYTICS = { action: "view", subject: "analytics" };
var DASHBOARD_REPORTS = { action: "view", subject: "reports" };
var ORGANIZATION_CREATE = { action: "create", subject: "organization" };
var ORGANIZATION_READ = { action: "read", subject: "organization" };
var ORGANIZATION_UPDATE = { action: "update", subject: "organization" };
var ORGANIZATION_DELETE = { action: "delete", subject: "organization" };
var ORGANIZATION_MANAGE_MEMBERS = {
  action: "manage-members",
  subject: "organization"
};
var METADATA_MANAGEMENT = [
  METADATA_CREATE,
  METADATA_READ,
  METADATA_UPDATE,
  METADATA_DELETE,
  METADATA_APPROVE,
  METADATA_REJECT,
  METADATA_PUBLISH,
  METADATA_UNPUBLISH,
  METADATA_IMPORT,
  METADATA_EXPORT,
  METADATA_SUBMIT_FOR_REVIEW,
  METADATA_VALIDATE,
  METADATA_BULK_EDIT,
  METADATA_ASSIGN_REVIEWER
];
var METADATA_AUTHOR_PERMISSIONS = [
  METADATA_CREATE,
  METADATA_READ,
  METADATA_UPDATE,
  METADATA_SUBMIT_FOR_REVIEW
];
var METADATA_REVIEWER_PERMISSIONS = [
  METADATA_READ,
  METADATA_VALIDATE,
  METADATA_APPROVE,
  METADATA_REJECT
];
var METADATA_PUBLISHER_PERMISSIONS = [
  METADATA_READ,
  METADATA_PUBLISH,
  METADATA_UNPUBLISH
];
var METADATA_ADMIN_PERMISSIONS = [
  ...METADATA_MANAGEMENT,
  METADATA_ASSIGN_REVIEWER
];
var USER_MANAGEMENT = [
  USER_CREATE,
  USER_READ,
  USER_UPDATE,
  USER_DELETE,
  USER_MANAGE_ROLES
];
var ROLE_MANAGEMENT = [
  ROLE_CREATE,
  ROLE_READ,
  ROLE_UPDATE,
  ROLE_DELETE,
  ROLE_ASSIGN
];
var PERMISSION_MANAGEMENT = [
  PERMISSION_CREATE,
  PERMISSION_READ,
  PERMISSION_UPDATE,
  PERMISSION_DELETE,
  PERMISSION_ASSIGN
];
var SYSTEM_ADMINISTRATION = [
  SYSTEM_SETTINGS,
  SYSTEM_LOGS,
  SYSTEM_BACKUP
];
var DASHBOARD_ACCESS = [
  DASHBOARD_VIEW,
  DASHBOARD_ANALYTICS,
  DASHBOARD_REPORTS
];
var ORGANIZATION_MANAGEMENT = [
  ORGANIZATION_CREATE,
  ORGANIZATION_READ,
  ORGANIZATION_UPDATE,
  ORGANIZATION_DELETE,
  ORGANIZATION_MANAGE_MEMBERS
];
var ADMIN_PERMISSIONS = [
  ...METADATA_MANAGEMENT,
  ...USER_MANAGEMENT,
  ...ROLE_MANAGEMENT,
  ...PERMISSION_MANAGEMENT,
  ...SYSTEM_ADMINISTRATION,
  ...DASHBOARD_ACCESS,
  ...ORGANIZATION_MANAGEMENT
];
var NODE_OFFICER_PERMISSIONS = [
  ...METADATA_REVIEWER_PERMISSIONS,
  ...METADATA_PUBLISHER_PERMISSIONS,
  METADATA_IMPORT,
  METADATA_EXPORT,
  METADATA_VALIDATE,
  USER_READ,
  USER_CREATE,
  DASHBOARD_VIEW,
  DASHBOARD_ANALYTICS,
  DASHBOARD_REPORTS,
  ORGANIZATION_READ,
  ORGANIZATION_UPDATE
];
var USER_PERMISSIONS = [
  ...METADATA_AUTHOR_PERMISSIONS,
  DASHBOARD_VIEW
];

// src/routes/permissions/index.ts
var permissionsRouter = new import_zod_openapi4.OpenAPIHono();
permissionsRouter.use("*", authMiddleware);
var permissionSchema = import_zod4.z.object({
  name: import_zod4.z.string().min(3).max(100),
  description: import_zod4.z.string().optional(),
  action: import_zod4.z.string().min(1),
  subject: import_zod4.z.string().min(1),
  conditions: import_zod4.z.any().optional()
});
var permissionResponseSchema = import_zod4.z.object({
  id: import_zod4.z.string(),
  name: import_zod4.z.string(),
  description: import_zod4.z.string().nullable(),
  action: import_zod4.z.string(),
  subject: import_zod4.z.string(),
  conditions: import_zod4.z.any().nullable(),
  createdAt: import_zod4.z.string(),
  updatedAt: import_zod4.z.string()
});
permissionsRouter.openapi(
  (0, import_zod_openapi4.createRoute)({
    method: "get",
    path: "/",
    tags: ["Permissions"],
    security: [{ bearerAuth: [] }],
    description: "List all permissions",
    responses: {
      200: {
        description: "List of permissions",
        content: {
          "application/json": {
            schema: import_zod4.z.object({
              permissions: import_zod4.z.array(permissionResponseSchema)
            })
          }
        }
      },
      401: {
        description: "Unauthorized"
      },
      403: {
        description: "Forbidden"
      }
    }
  }),
  async (c) => {
    await requirePermission(PERMISSION_READ.action, PERMISSION_READ.subject)(c, async () => {
    });
    const permissions = await import_db.prisma.permission.findMany({
      orderBy: { name: "asc" }
    });
    return c.json({ permissions });
  }
);
permissionsRouter.openapi(
  (0, import_zod_openapi4.createRoute)({
    method: "get",
    path: "/:id",
    tags: ["Permissions"],
    security: [{ bearerAuth: [] }],
    description: "Get permission by ID",
    request: {
      params: import_zod4.z.object({
        id: import_zod4.z.string()
      })
    },
    responses: {
      200: {
        description: "Permission details",
        content: {
          "application/json": {
            schema: permissionResponseSchema
          }
        }
      },
      401: {
        description: "Unauthorized"
      },
      403: {
        description: "Forbidden"
      },
      404: {
        description: "Permission not found"
      }
    }
  }),
  async (c) => {
    await requirePermission(PERMISSION_READ.action, PERMISSION_READ.subject)(c, async () => {
    });
    const { id: id2 } = c.req.param();
    const permission = await import_db.prisma.permission.findUnique({
      where: { id: id2 }
    });
    if (!permission) {
      return c.json({ error: "Permission not found" }, 404);
    }
    return c.json(permission);
  }
);
permissionsRouter.openapi(
  (0, import_zod_openapi4.createRoute)({
    method: "post",
    path: "/",
    tags: ["Permissions"],
    security: [{ bearerAuth: [] }],
    description: "Create a new permission",
    request: {
      body: {
        content: {
          "application/json": {
            schema: permissionSchema
          }
        }
      }
    },
    responses: {
      201: {
        description: "Permission created",
        content: {
          "application/json": {
            schema: permissionResponseSchema
          }
        }
      },
      400: {
        description: "Invalid input"
      },
      401: {
        description: "Unauthorized"
      },
      403: {
        description: "Forbidden"
      }
    }
  }),
  async (c) => {
    await requirePermission(PERMISSION_CREATE.action, PERMISSION_CREATE.subject)(c, async () => {
    });
    const data = await c.req.json();
    try {
      const permission = await import_db.prisma.permission.create({
        data
      });
      return c.json(permission, 201);
    } catch (error) {
      if (error.code === "P2002") {
        return c.json({ error: "Permission with this action and subject already exists" }, 400);
      }
      return c.json({ error: "Failed to create permission" }, 500);
    }
  }
);
permissionsRouter.openapi(
  (0, import_zod_openapi4.createRoute)({
    method: "put",
    path: "/:id",
    tags: ["Permissions"],
    security: [{ bearerAuth: [] }],
    description: "Update a permission",
    request: {
      params: import_zod4.z.object({
        id: import_zod4.z.string()
      }),
      body: {
        content: {
          "application/json": {
            schema: permissionSchema.partial()
          }
        }
      }
    },
    responses: {
      200: {
        description: "Permission updated",
        content: {
          "application/json": {
            schema: permissionResponseSchema
          }
        }
      },
      400: {
        description: "Invalid input"
      },
      401: {
        description: "Unauthorized"
      },
      403: {
        description: "Forbidden"
      },
      404: {
        description: "Permission not found"
      }
    }
  }),
  async (c) => {
    await requirePermission(PERMISSION_UPDATE.action, PERMISSION_UPDATE.subject)(c, async () => {
    });
    const { id: id2 } = c.req.param();
    const data = await c.req.json();
    try {
      const permission = await import_db.prisma.permission.update({
        where: { id: id2 },
        data
      });
      return c.json(permission);
    } catch (error) {
      if (error.code === "P2025") {
        return c.json({ error: "Permission not found" }, 404);
      }
      if (error.code === "P2002") {
        return c.json({ error: "Permission with this action and subject already exists" }, 400);
      }
      return c.json({ error: "Failed to update permission" }, 500);
    }
  }
);
permissionsRouter.openapi(
  (0, import_zod_openapi4.createRoute)({
    method: "delete",
    path: "/:id",
    tags: ["Permissions"],
    security: [{ bearerAuth: [] }],
    description: "Delete a permission",
    request: {
      params: import_zod4.z.object({
        id: import_zod4.z.string()
      })
    },
    responses: {
      200: {
        description: "Permission deleted",
        content: {
          "application/json": {
            schema: import_zod4.z.object({
              message: import_zod4.z.string()
            })
          }
        }
      },
      401: {
        description: "Unauthorized"
      },
      403: {
        description: "Forbidden"
      },
      404: {
        description: "Permission not found"
      }
    }
  }),
  async (c) => {
    await requirePermission(PERMISSION_DELETE.action, PERMISSION_DELETE.subject)(c, async () => {
    });
    const { id: id2 } = c.req.param();
    try {
      await import_db.prisma.permission.delete({
        where: { id: id2 }
      });
      return c.json({ message: "Permission deleted successfully" });
    } catch (error) {
      if (error.code === "P2025") {
        return c.json({ error: "Permission not found" }, 404);
      }
      return c.json({ error: "Failed to delete permission" }, 500);
    }
  }
);
permissionsRouter.openapi(
  (0, import_zod_openapi4.createRoute)({
    method: "get",
    path: "/subject/:subject",
    tags: ["Permissions"],
    security: [{ bearerAuth: [] }],
    description: "Get permissions by subject",
    request: {
      params: import_zod4.z.object({
        subject: import_zod4.z.string()
      })
    },
    responses: {
      200: {
        description: "List of permissions for the subject",
        content: {
          "application/json": {
            schema: import_zod4.z.object({
              permissions: import_zod4.z.array(permissionResponseSchema)
            })
          }
        }
      },
      401: {
        description: "Unauthorized"
      },
      403: {
        description: "Forbidden"
      }
    }
  }),
  async (c) => {
    await requirePermission(PERMISSION_READ.action, PERMISSION_READ.subject)(c, async () => {
    });
    const { subject } = c.req.param();
    const permissions = await import_db.prisma.permission.findMany({
      where: { subject },
      orderBy: { name: "asc" }
    });
    return c.json({ permissions });
  }
);
permissionsRouter.openapi(
  (0, import_zod_openapi4.createRoute)({
    method: "get",
    path: "/action/:action",
    tags: ["Permissions"],
    security: [{ bearerAuth: [] }],
    description: "Get permissions by action",
    request: {
      params: import_zod4.z.object({
        action: import_zod4.z.string()
      })
    },
    responses: {
      200: {
        description: "List of permissions for the action",
        content: {
          "application/json": {
            schema: import_zod4.z.object({
              permissions: import_zod4.z.array(permissionResponseSchema)
            })
          }
        }
      },
      401: {
        description: "Unauthorized"
      },
      403: {
        description: "Forbidden"
      }
    }
  }),
  async (c) => {
    await requirePermission(PERMISSION_READ.action, PERMISSION_READ.subject)(c, async () => {
    });
    const { action } = c.req.param();
    const permissions = await import_db.prisma.permission.findMany({
      where: { action },
      orderBy: { name: "asc" }
    });
    return c.json({ permissions });
  }
);
var permissions_default = permissionsRouter;

// src/routes/roles/index.ts
var import_zod_openapi5 = require("@hono/zod-openapi");
var import_zod5 = require("zod");
init_prisma();
var rolesRouter = new import_zod_openapi5.OpenAPIHono();
rolesRouter.use("*", authMiddleware);
var roleSchema = import_zod5.z.object({
  name: import_zod5.z.string().min(3).max(100),
  description: import_zod5.z.string().optional(),
  isSystem: import_zod5.z.boolean().optional().default(false)
});
var roleResponseSchema = import_zod5.z.object({
  id: import_zod5.z.string(),
  name: import_zod5.z.string(),
  description: import_zod5.z.string().nullable(),
  isSystem: import_zod5.z.boolean(),
  createdAt: import_zod5.z.string(),
  updatedAt: import_zod5.z.string()
});
var roleWithPermissionsSchema = roleResponseSchema.extend({
  permissions: import_zod5.z.array(import_zod5.z.object({
    id: import_zod5.z.string(),
    name: import_zod5.z.string(),
    action: import_zod5.z.string(),
    subject: import_zod5.z.string()
  }))
});
rolesRouter.openapi(
  (0, import_zod_openapi5.createRoute)({
    method: "get",
    path: "/",
    tags: ["Roles"],
    security: [{ bearerAuth: [] }],
    description: "List all roles",
    responses: {
      200: {
        description: "List of roles",
        content: {
          "application/json": {
            schema: import_zod5.z.object({
              roles: import_zod5.z.array(roleResponseSchema)
            })
          }
        }
      },
      401: {
        description: "Unauthorized"
      },
      403: {
        description: "Forbidden"
      }
    }
  }),
  async (c) => {
    await requirePermission(ROLE_READ.action, ROLE_READ.subject)(c, async () => {
    });
    const roles = await import_db.prisma.role.findMany({
      orderBy: { name: "asc" }
    });
    return c.json({ roles });
  }
);
rolesRouter.openapi(
  (0, import_zod_openapi5.createRoute)({
    method: "get",
    path: "/:id",
    tags: ["Roles"],
    security: [{ bearerAuth: [] }],
    description: "Get role by ID with its permissions",
    request: {
      params: import_zod5.z.object({
        id: import_zod5.z.string()
      })
    },
    responses: {
      200: {
        description: "Role details with permissions",
        content: {
          "application/json": {
            schema: roleWithPermissionsSchema
          }
        }
      },
      401: {
        description: "Unauthorized"
      },
      403: {
        description: "Forbidden"
      },
      404: {
        description: "Role not found"
      }
    }
  }),
  async (c) => {
    await requirePermission(ROLE_READ.action, ROLE_READ.subject)(c, async () => {
    });
    const { id: id2 } = c.req.param();
    const role = await import_db.prisma.role.findUnique({
      where: { id: id2 },
      include: {
        rolePermissions: {
          include: {
            permission: true
          }
        }
      }
    });
    if (!role) {
      return c.json({ error: "Role not found" }, 404);
    }
    const response = {
      ...role,
      permissions: role.rolePermissions.map((rp2) => ({
        id: rp2.permission.id,
        name: rp2.permission.name,
        action: rp2.permission.action,
        subject: rp2.permission.subject
      }))
    };
    delete response.rolePermissions;
    return c.json(response);
  }
);
rolesRouter.openapi(
  (0, import_zod_openapi5.createRoute)({
    method: "post",
    path: "/",
    tags: ["Roles"],
    security: [{ bearerAuth: [] }],
    description: "Create a new role",
    request: {
      body: {
        content: {
          "application/json": {
            schema: roleSchema.extend({
              permissionIds: import_zod5.z.array(import_zod5.z.string()).optional()
            })
          }
        }
      }
    },
    responses: {
      201: {
        description: "Role created",
        content: {
          "application/json": {
            schema: roleWithPermissionsSchema
          }
        }
      },
      400: {
        description: "Invalid input"
      },
      401: {
        description: "Unauthorized"
      },
      403: {
        description: "Forbidden"
      }
    }
  }),
  async (c) => {
    await requirePermission(ROLE_CREATE.action, ROLE_CREATE.subject)(c, async () => {
    });
    const data = await c.req.json();
    const { permissionIds, ...roleData } = data;
    try {
      const role = await import_db.prisma.role.create({
        data: roleData
      });
      if (permissionIds && permissionIds.length > 0) {
        await import_db.prisma.$transaction(
          permissionIds.map(
            (permissionId) => import_db.prisma.rolePermission.create({
              data: {
                roleId: role.id,
                permissionId
              }
            })
          )
        );
      }
      const roleWithPermissions = await import_db.prisma.role.findUnique({
        where: { id: role.id },
        include: {
          rolePermissions: {
            include: {
              permission: true
            }
          }
        }
      });
      const response = {
        ...roleWithPermissions,
        permissions: roleWithPermissions.rolePermissions.map((rp2) => ({
          id: rp2.permission.id,
          name: rp2.permission.name,
          action: rp2.permission.action,
          subject: rp2.permission.subject
        }))
      };
      delete response.rolePermissions;
      return c.json(response, 201);
    } catch (error) {
      if (error.code === "P2002") {
        return c.json({ error: "Role with this name already exists" }, 400);
      }
      return c.json({ error: "Failed to create role" }, 500);
    }
  }
);
rolesRouter.openapi(
  (0, import_zod_openapi5.createRoute)({
    method: "put",
    path: "/:id",
    tags: ["Roles"],
    security: [{ bearerAuth: [] }],
    description: "Update a role",
    request: {
      params: import_zod5.z.object({
        id: import_zod5.z.string()
      }),
      body: {
        content: {
          "application/json": {
            schema: roleSchema.partial().extend({
              permissionIds: import_zod5.z.array(import_zod5.z.string()).optional()
            })
          }
        }
      }
    },
    responses: {
      200: {
        description: "Role updated",
        content: {
          "application/json": {
            schema: roleWithPermissionsSchema
          }
        }
      },
      400: {
        description: "Invalid input"
      },
      401: {
        description: "Unauthorized"
      },
      403: {
        description: "Forbidden"
      },
      404: {
        description: "Role not found"
      }
    }
  }),
  async (c) => {
    await requirePermission(ROLE_UPDATE.action, ROLE_UPDATE.subject)(c, async () => {
    });
    const { id: id2 } = c.req.param();
    const data = await c.req.json();
    const { permissionIds, ...roleData } = data;
    try {
      const existingRole = await import_db.prisma.role.findUnique({
        where: { id: id2 }
      });
      if (!existingRole) {
        return c.json({ error: "Role not found" }, 404);
      }
      if (existingRole.isSystem && data.isSystem === false) {
        return c.json({ error: "Cannot change system role status" }, 400);
      }
      const role = await import_db.prisma.role.update({
        where: { id: id2 },
        data: roleData
      });
      if (permissionIds !== void 0) {
        await import_db.prisma.rolePermission.deleteMany({
          where: { roleId: id2 }
        });
        if (permissionIds.length > 0) {
          await import_db.prisma.$transaction(
            permissionIds.map(
              (permissionId) => import_db.prisma.rolePermission.create({
                data: {
                  roleId: role.id,
                  permissionId
                }
              })
            )
          );
        }
      }
      const roleWithPermissions = await import_db.prisma.role.findUnique({
        where: { id: role.id },
        include: {
          rolePermissions: {
            include: {
              permission: true
            }
          }
        }
      });
      const response = {
        ...roleWithPermissions,
        permissions: roleWithPermissions.rolePermissions.map((rp2) => ({
          id: rp2.permission.id,
          name: rp2.permission.name,
          action: rp2.permission.action,
          subject: rp2.permission.subject
        }))
      };
      delete response.rolePermissions;
      return c.json(response);
    } catch (error) {
      if (error.code === "P2025") {
        return c.json({ error: "Role not found" }, 404);
      }
      if (error.code === "P2002") {
        return c.json({ error: "Role with this name already exists" }, 400);
      }
      return c.json({ error: "Failed to update role" }, 500);
    }
  }
);
rolesRouter.openapi(
  (0, import_zod_openapi5.createRoute)({
    method: "delete",
    path: "/:id",
    tags: ["Roles"],
    security: [{ bearerAuth: [] }],
    description: "Delete a role",
    request: {
      params: import_zod5.z.object({
        id: import_zod5.z.string()
      })
    },
    responses: {
      200: {
        description: "Role deleted",
        content: {
          "application/json": {
            schema: import_zod5.z.object({
              message: import_zod5.z.string()
            })
          }
        }
      },
      400: {
        description: "Cannot delete system role"
      },
      401: {
        description: "Unauthorized"
      },
      403: {
        description: "Forbidden"
      },
      404: {
        description: "Role not found"
      }
    }
  }),
  async (c) => {
    await requirePermission(ROLE_DELETE.action, ROLE_DELETE.subject)(c, async () => {
    });
    const { id: id2 } = c.req.param();
    try {
      const role = await import_db.prisma.role.findUnique({
        where: { id: id2 }
      });
      if (!role) {
        return c.json({ error: "Role not found" }, 404);
      }
      if (role.isSystem) {
        return c.json({ error: "Cannot delete system role" }, 400);
      }
      await import_db.prisma.role.delete({
        where: { id: id2 }
      });
      return c.json({ message: "Role deleted successfully" });
    } catch (error) {
      if (error.code === "P2025") {
        return c.json({ error: "Role not found" }, 404);
      }
      return c.json({ error: "Failed to delete role" }, 500);
    }
  }
);
rolesRouter.openapi(
  (0, import_zod_openapi5.createRoute)({
    method: "post",
    path: "/assign/:roleId/user/:userId",
    tags: ["Roles"],
    security: [{ bearerAuth: [] }],
    description: "Assign a role to a user",
    request: {
      params: import_zod5.z.object({
        roleId: import_zod5.z.string(),
        userId: import_zod5.z.string()
      })
    },
    responses: {
      200: {
        description: "Role assigned to user",
        content: {
          "application/json": {
            schema: import_zod5.z.object({
              message: import_zod5.z.string()
            })
          }
        }
      },
      401: {
        description: "Unauthorized"
      },
      403: {
        description: "Forbidden"
      },
      404: {
        description: "Role or user not found"
      }
    }
  }),
  async (c) => {
    await requirePermission(ROLE_ASSIGN.action, ROLE_ASSIGN.subject)(c, async () => {
    });
    const { roleId, userId } = c.req.param();
    try {
      const role = await import_db.prisma.role.findUnique({
        where: { id: roleId }
      });
      if (!role) {
        return c.json({ error: "Role not found" }, 404);
      }
      const user = await import_db.prisma.user.findUnique({
        where: { id: userId }
      });
      if (!user) {
        return c.json({ error: "User not found" }, 404);
      }
      await import_db.prisma.user.update({
        where: { id: userId },
        data: { roleId }
      });
      return c.json({ message: "Role assigned to user successfully" });
    } catch (error) {
      return c.json({ error: "Failed to assign role to user" }, 500);
    }
  }
);
rolesRouter.openapi(
  (0, import_zod_openapi5.createRoute)({
    method: "get",
    path: "/:id/users",
    tags: ["Roles"],
    security: [{ bearerAuth: [] }],
    description: "Get users with a specific role",
    request: {
      params: import_zod5.z.object({
        id: import_zod5.z.string()
      })
    },
    responses: {
      200: {
        description: "List of users with the role",
        content: {
          "application/json": {
            schema: import_zod5.z.object({
              users: import_zod5.z.array(import_zod5.z.object({
                id: import_zod5.z.string(),
                name: import_zod5.z.string().nullable(),
                email: import_zod5.z.string(),
                role: import_zod5.z.string()
              }))
            })
          }
        }
      },
      401: {
        description: "Unauthorized"
      },
      403: {
        description: "Forbidden"
      },
      404: {
        description: "Role not found"
      }
    }
  }),
  async (c) => {
    await requirePermission(ROLE_READ.action, ROLE_READ.subject)(c, async () => {
    });
    const { id: id2 } = c.req.param();
    try {
      const role = await import_db.prisma.role.findUnique({
        where: { id: id2 }
      });
      if (!role) {
        return c.json({ error: "Role not found" }, 404);
      }
      const users = await import_db.prisma.user.findMany({
        where: { roleId: id2 },
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      });
      return c.json({ users });
    } catch (error) {
      return c.json({ error: "Failed to get users with role" }, 500);
    }
  }
);
var roles_default = rolesRouter;

// src/routes/user-permissions/index.ts
var import_zod_openapi6 = require("@hono/zod-openapi");
var import_zod6 = require("zod");
init_prisma();
init_permissions();
var userPermissionsRouter = new import_zod_openapi6.OpenAPIHono();
userPermissionsRouter.use("*", authMiddleware);
var userPermissionSchema = import_zod6.z.object({
  permissionId: import_zod6.z.string(),
  granted: import_zod6.z.boolean().default(true),
  conditions: import_zod6.z.any().optional(),
  expiresAt: import_zod6.z.string().datetime().optional()
});
var userPermissionResponseSchema = import_zod6.z.object({
  id: import_zod6.z.string(),
  userId: import_zod6.z.string(),
  permissionId: import_zod6.z.string(),
  granted: import_zod6.z.boolean(),
  conditions: import_zod6.z.any().nullable(),
  expiresAt: import_zod6.z.string().datetime().nullable(),
  createdAt: import_zod6.z.string(),
  permission: import_zod6.z.object({
    id: import_zod6.z.string(),
    name: import_zod6.z.string(),
    action: import_zod6.z.string(),
    subject: import_zod6.z.string(),
    description: import_zod6.z.string().nullable()
  })
});
userPermissionsRouter.openapi(
  (0, import_zod_openapi6.createRoute)({
    method: "get",
    path: "/user/:userId",
    tags: ["User Permissions"],
    security: [{ bearerAuth: [] }],
    description: "Get permissions for a user",
    request: {
      params: import_zod6.z.object({
        userId: import_zod6.z.string()
      })
    },
    responses: {
      200: {
        description: "User permissions",
        content: {
          "application/json": {
            schema: import_zod6.z.object({
              directPermissions: import_zod6.z.array(userPermissionResponseSchema),
              allPermissions: import_zod6.z.array(import_zod6.z.object({
                id: import_zod6.z.string(),
                name: import_zod6.z.string(),
                action: import_zod6.z.string(),
                subject: import_zod6.z.string(),
                description: import_zod6.z.string().nullable(),
                source: import_zod6.z.enum(["role", "direct"])
              }))
            })
          }
        }
      },
      401: {
        description: "Unauthorized"
      },
      403: {
        description: "Forbidden"
      },
      404: {
        description: "User not found"
      }
    }
  }),
  async (c) => {
    await requirePermission(PERMISSION_READ.action, PERMISSION_READ.subject)(c, async () => {
    });
    const { userId } = c.req.param();
    try {
      const user = await import_db.prisma.user.findUnique({
        where: { id: userId }
      });
      if (!user) {
        return c.json({ error: "User not found" }, 404);
      }
      const directPermissions = await import_db.prisma.userPermission.findMany({
        where: {
          userId,
          granted: true,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: /* @__PURE__ */ new Date() } }
          ]
        },
        include: {
          permission: true
        }
      });
      const allPermissions = await getAllPermissionsForUser(userId);
      const transformedAllPermissions = allPermissions.map((permission) => {
        const isDirect = directPermissions.some((dp2) => dp2.permissionId === permission.id);
        return {
          ...permission,
          source: isDirect ? "direct" : "role"
        };
      });
      return c.json({
        directPermissions,
        allPermissions: transformedAllPermissions
      });
    } catch (error) {
      return c.json({ error: "Failed to get user permissions" }, 500);
    }
  }
);
userPermissionsRouter.openapi(
  (0, import_zod_openapi6.createRoute)({
    method: "post",
    path: "/user/:userId",
    tags: ["User Permissions"],
    security: [{ bearerAuth: [] }],
    description: "Grant a permission to a user",
    request: {
      params: import_zod6.z.object({
        userId: import_zod6.z.string()
      }),
      body: {
        content: {
          "application/json": {
            schema: userPermissionSchema
          }
        }
      }
    },
    responses: {
      201: {
        description: "Permission granted",
        content: {
          "application/json": {
            schema: userPermissionResponseSchema
          }
        }
      },
      400: {
        description: "Invalid input"
      },
      401: {
        description: "Unauthorized"
      },
      403: {
        description: "Forbidden"
      },
      404: {
        description: "User or permission not found"
      }
    }
  }),
  async (c) => {
    await requirePermission(PERMISSION_ASSIGN.action, PERMISSION_ASSIGN.subject)(c, async () => {
    });
    const { userId } = c.req.param();
    const data = await c.req.json();
    try {
      const user = await import_db.prisma.user.findUnique({
        where: { id: userId }
      });
      if (!user) {
        return c.json({ error: "User not found" }, 404);
      }
      const permission = await import_db.prisma.permission.findUnique({
        where: { id: data.permissionId }
      });
      if (!permission) {
        return c.json({ error: "Permission not found" }, 404);
      }
      const userPermission = await import_db.prisma.userPermission.upsert({
        where: {
          userId_permissionId: {
            userId,
            permissionId: data.permissionId
          }
        },
        update: {
          granted: data.granted,
          conditions: data.conditions,
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : null
        },
        create: {
          userId,
          permissionId: data.permissionId,
          granted: data.granted,
          conditions: data.conditions,
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : null
        },
        include: {
          permission: true
        }
      });
      return c.json(userPermission, 201);
    } catch (error) {
      return c.json({ error: "Failed to grant permission to user" }, 500);
    }
  }
);
userPermissionsRouter.openapi(
  (0, import_zod_openapi6.createRoute)({
    method: "delete",
    path: "/user/:userId/permission/:permissionId",
    tags: ["User Permissions"],
    security: [{ bearerAuth: [] }],
    description: "Revoke a permission from a user",
    request: {
      params: import_zod6.z.object({
        userId: import_zod6.z.string(),
        permissionId: import_zod6.z.string()
      })
    },
    responses: {
      200: {
        description: "Permission revoked",
        content: {
          "application/json": {
            schema: import_zod6.z.object({
              message: import_zod6.z.string()
            })
          }
        }
      },
      401: {
        description: "Unauthorized"
      },
      403: {
        description: "Forbidden"
      },
      404: {
        description: "User permission not found"
      }
    }
  }),
  async (c) => {
    await requirePermission(PERMISSION_ASSIGN.action, PERMISSION_ASSIGN.subject)(c, async () => {
    });
    const { userId, permissionId } = c.req.param();
    try {
      const userPermission = await import_db.prisma.userPermission.findUnique({
        where: {
          userId_permissionId: {
            userId,
            permissionId
          }
        }
      });
      if (!userPermission) {
        return c.json({ error: "User permission not found" }, 404);
      }
      await import_db.prisma.userPermission.delete({
        where: {
          userId_permissionId: {
            userId,
            permissionId
          }
        }
      });
      return c.json({ message: "Permission revoked successfully" });
    } catch (error) {
      return c.json({ error: "Failed to revoke permission from user" }, 500);
    }
  }
);
userPermissionsRouter.openapi(
  (0, import_zod_openapi6.createRoute)({
    method: "post",
    path: "/check",
    tags: ["User Permissions"],
    security: [{ bearerAuth: [] }],
    description: "Check if a user has a specific permission",
    request: {
      body: {
        content: {
          "application/json": {
            schema: import_zod6.z.object({
              userId: import_zod6.z.string(),
              action: import_zod6.z.string(),
              subject: import_zod6.z.string(),
              resource: import_zod6.z.any().optional()
            })
          }
        }
      }
    },
    responses: {
      200: {
        description: "Permission check result",
        content: {
          "application/json": {
            schema: import_zod6.z.object({
              granted: import_zod6.z.boolean(),
              reason: import_zod6.z.string().optional()
            })
          }
        }
      },
      401: {
        description: "Unauthorized"
      },
      403: {
        description: "Forbidden"
      },
      404: {
        description: "User not found"
      }
    }
  }),
  async (c) => {
    await requirePermission(PERMISSION_READ.action, PERMISSION_READ.subject)(c, async () => {
    });
    const { userId, action, subject, resource } = await c.req.json();
    try {
      const user = await import_db.prisma.user.findUnique({
        where: { id: userId }
      });
      if (!user) {
        return c.json({ error: "User not found" }, 404);
      }
      const { hasPermission: hasPermission2 } = await Promise.resolve().then(() => (init_permissions(), permissions_exports));
      const result = await hasPermission2(user, action, subject, resource);
      return c.json(result);
    } catch (error) {
      return c.json({ error: "Failed to check permission" }, 500);
    }
  }
);
var user_permissions_default = userPermissionsRouter;

// src/routes/permission-groups/index.ts
var import_zod_openapi7 = require("@hono/zod-openapi");
var import_zod7 = require("zod");
init_prisma();
var permissionGroupsRouter = new import_zod_openapi7.OpenAPIHono();
permissionGroupsRouter.use("*", authMiddleware);
var permissionGroupSchema = import_zod7.z.object({
  name: import_zod7.z.string().min(3).max(100),
  description: import_zod7.z.string().optional()
});
var permissionGroupResponseSchema = import_zod7.z.object({
  id: import_zod7.z.string(),
  name: import_zod7.z.string(),
  description: import_zod7.z.string().nullable(),
  createdAt: import_zod7.z.string(),
  updatedAt: import_zod7.z.string()
});
var permissionGroupWithPermissionsSchema = permissionGroupResponseSchema.extend({
  permissions: import_zod7.z.array(import_zod7.z.object({
    id: import_zod7.z.string(),
    name: import_zod7.z.string(),
    action: import_zod7.z.string(),
    subject: import_zod7.z.string()
  }))
});
permissionGroupsRouter.openapi(
  (0, import_zod_openapi7.createRoute)({
    method: "get",
    path: "/",
    tags: ["Permission Groups"],
    security: [{ bearerAuth: [] }],
    description: "List all permission groups",
    responses: {
      200: {
        description: "List of permission groups",
        content: {
          "application/json": {
            schema: import_zod7.z.object({
              groups: import_zod7.z.array(permissionGroupResponseSchema)
            })
          }
        }
      },
      401: {
        description: "Unauthorized"
      },
      403: {
        description: "Forbidden"
      }
    }
  }),
  async (c) => {
    await requirePermission(PERMISSION_READ.action, PERMISSION_READ.subject)(c, async () => {
    });
    const groups = await import_db.prisma.permissionGroup.findMany({
      orderBy: { name: "asc" }
    });
    return c.json({ groups });
  }
);
permissionGroupsRouter.openapi(
  (0, import_zod_openapi7.createRoute)({
    method: "get",
    path: "/:id",
    tags: ["Permission Groups"],
    security: [{ bearerAuth: [] }],
    description: "Get permission group by ID with its permissions",
    request: {
      params: import_zod7.z.object({
        id: import_zod7.z.string()
      })
    },
    responses: {
      200: {
        description: "Permission group details with permissions",
        content: {
          "application/json": {
            schema: permissionGroupWithPermissionsSchema
          }
        }
      },
      401: {
        description: "Unauthorized"
      },
      403: {
        description: "Forbidden"
      },
      404: {
        description: "Permission group not found"
      }
    }
  }),
  async (c) => {
    await requirePermission(PERMISSION_READ.action, PERMISSION_READ.subject)(c, async () => {
    });
    const { id: id2 } = c.req.param();
    const group = await import_db.prisma.permissionGroup.findUnique({
      where: { id: id2 },
      include: {
        permissionGroupItems: {
          include: {
            permission: true
          }
        }
      }
    });
    if (!group) {
      return c.json({ error: "Permission group not found" }, 404);
    }
    const response = {
      ...group,
      permissions: group.permissionGroupItems.map((item) => ({
        id: item.permission.id,
        name: item.permission.name,
        action: item.permission.action,
        subject: item.permission.subject
      }))
    };
    delete response.permissionGroupItems;
    return c.json(response);
  }
);
permissionGroupsRouter.openapi(
  (0, import_zod_openapi7.createRoute)({
    method: "post",
    path: "/",
    tags: ["Permission Groups"],
    security: [{ bearerAuth: [] }],
    description: "Create a new permission group",
    request: {
      body: {
        content: {
          "application/json": {
            schema: permissionGroupSchema.extend({
              permissionIds: import_zod7.z.array(import_zod7.z.string()).optional()
            })
          }
        }
      }
    },
    responses: {
      201: {
        description: "Permission group created",
        content: {
          "application/json": {
            schema: permissionGroupWithPermissionsSchema
          }
        }
      },
      400: {
        description: "Invalid input"
      },
      401: {
        description: "Unauthorized"
      },
      403: {
        description: "Forbidden"
      }
    }
  }),
  async (c) => {
    await requirePermission(PERMISSION_CREATE.action, PERMISSION_CREATE.subject)(c, async () => {
    });
    const data = await c.req.json();
    const { permissionIds, ...groupData } = data;
    try {
      const group = await import_db.prisma.permissionGroup.create({
        data: groupData
      });
      if (permissionIds && permissionIds.length > 0) {
        await import_db.prisma.$transaction(
          permissionIds.map(
            (permissionId) => import_db.prisma.permissionGroupItem.create({
              data: {
                groupId: group.id,
                permissionId
              }
            })
          )
        );
      }
      const groupWithPermissions = await import_db.prisma.permissionGroup.findUnique({
        where: { id: group.id },
        include: {
          permissionGroupItems: {
            include: {
              permission: true
            }
          }
        }
      });
      const response = {
        ...groupWithPermissions,
        permissions: groupWithPermissions.permissionGroupItems.map((item) => ({
          id: item.permission.id,
          name: item.permission.name,
          action: item.permission.action,
          subject: item.permission.subject
        }))
      };
      delete response.permissionGroupItems;
      return c.json(response, 201);
    } catch (error) {
      if (error.code === "P2002") {
        return c.json({ error: "Permission group with this name already exists" }, 400);
      }
      return c.json({ error: "Failed to create permission group" }, 500);
    }
  }
);
permissionGroupsRouter.openapi(
  (0, import_zod_openapi7.createRoute)({
    method: "put",
    path: "/:id",
    tags: ["Permission Groups"],
    security: [{ bearerAuth: [] }],
    description: "Update a permission group",
    request: {
      params: import_zod7.z.object({
        id: import_zod7.z.string()
      }),
      body: {
        content: {
          "application/json": {
            schema: permissionGroupSchema.partial().extend({
              permissionIds: import_zod7.z.array(import_zod7.z.string()).optional()
            })
          }
        }
      }
    },
    responses: {
      200: {
        description: "Permission group updated",
        content: {
          "application/json": {
            schema: permissionGroupWithPermissionsSchema
          }
        }
      },
      400: {
        description: "Invalid input"
      },
      401: {
        description: "Unauthorized"
      },
      403: {
        description: "Forbidden"
      },
      404: {
        description: "Permission group not found"
      }
    }
  }),
  async (c) => {
    await requirePermission(PERMISSION_UPDATE.action, PERMISSION_UPDATE.subject)(c, async () => {
    });
    const { id: id2 } = c.req.param();
    const data = await c.req.json();
    const { permissionIds, ...groupData } = data;
    try {
      const existingGroup = await import_db.prisma.permissionGroup.findUnique({
        where: { id: id2 }
      });
      if (!existingGroup) {
        return c.json({ error: "Permission group not found" }, 404);
      }
      const group = await import_db.prisma.permissionGroup.update({
        where: { id: id2 },
        data: groupData
      });
      if (permissionIds !== void 0) {
        await import_db.prisma.permissionGroupItem.deleteMany({
          where: { groupId: id2 }
        });
        if (permissionIds.length > 0) {
          await import_db.prisma.$transaction(
            permissionIds.map(
              (permissionId) => import_db.prisma.permissionGroupItem.create({
                data: {
                  groupId: group.id,
                  permissionId
                }
              })
            )
          );
        }
      }
      const groupWithPermissions = await import_db.prisma.permissionGroup.findUnique({
        where: { id: group.id },
        include: {
          permissionGroupItems: {
            include: {
              permission: true
            }
          }
        }
      });
      const response = {
        ...groupWithPermissions,
        permissions: groupWithPermissions.permissionGroupItems.map((item) => ({
          id: item.permission.id,
          name: item.permission.name,
          action: item.permission.action,
          subject: item.permission.subject
        }))
      };
      delete response.permissionGroupItems;
      return c.json(response);
    } catch (error) {
      if (error.code === "P2025") {
        return c.json({ error: "Permission group not found" }, 404);
      }
      if (error.code === "P2002") {
        return c.json({ error: "Permission group with this name already exists" }, 400);
      }
      return c.json({ error: "Failed to update permission group" }, 500);
    }
  }
);
permissionGroupsRouter.openapi(
  (0, import_zod_openapi7.createRoute)({
    method: "delete",
    path: "/:id",
    tags: ["Permission Groups"],
    security: [{ bearerAuth: [] }],
    description: "Delete a permission group",
    request: {
      params: import_zod7.z.object({
        id: import_zod7.z.string()
      })
    },
    responses: {
      200: {
        description: "Permission group deleted",
        content: {
          "application/json": {
            schema: import_zod7.z.object({
              message: import_zod7.z.string()
            })
          }
        }
      },
      401: {
        description: "Unauthorized"
      },
      403: {
        description: "Forbidden"
      },
      404: {
        description: "Permission group not found"
      }
    }
  }),
  async (c) => {
    await requirePermission(PERMISSION_DELETE.action, PERMISSION_DELETE.subject)(c, async () => {
    });
    const { id: id2 } = c.req.param();
    try {
      const group = await import_db.prisma.permissionGroup.findUnique({
        where: { id: id2 }
      });
      if (!group) {
        return c.json({ error: "Permission group not found" }, 404);
      }
      await import_db.prisma.permissionGroup.delete({
        where: { id: id2 }
      });
      return c.json({ message: "Permission group deleted successfully" });
    } catch (error) {
      if (error.code === "P2025") {
        return c.json({ error: "Permission group not found" }, 404);
      }
      return c.json({ error: "Failed to delete permission group" }, 500);
    }
  }
);
var permission_groups_default = permissionGroupsRouter;

// src/routes/activity-logs/index.ts
var import_zod_openapi8 = require("@hono/zod-openapi");
var import_zod8 = require("zod");
init_prisma();
var activityLogsRouter = new import_zod_openapi8.OpenAPIHono();
activityLogsRouter.use("*", authMiddleware);
var activityLogResponseSchema = import_zod8.z.object({
  id: import_zod8.z.string(),
  userId: import_zod8.z.string(),
  action: import_zod8.z.string(),
  subject: import_zod8.z.string(),
  subjectId: import_zod8.z.string().nullable(),
  metadata: import_zod8.z.any().nullable(),
  ipAddress: import_zod8.z.string().nullable(),
  userAgent: import_zod8.z.string().nullable(),
  createdAt: import_zod8.z.string(),
  user: import_zod8.z.object({
    id: import_zod8.z.string(),
    name: import_zod8.z.string().nullable(),
    email: import_zod8.z.string()
  }).optional()
});
activityLogsRouter.openapi(
  (0, import_zod_openapi8.createRoute)({
    method: "get",
    path: "/",
    tags: ["Activity Logs"],
    security: [{ bearerAuth: [] }],
    description: "List activity logs with pagination and filtering",
    request: {
      query: import_zod8.z.object({
        page: import_zod8.z.string().optional().default("1"),
        limit: import_zod8.z.string().optional().default("20"),
        userId: import_zod8.z.string().optional(),
        action: import_zod8.z.string().optional(),
        subject: import_zod8.z.string().optional(),
        subjectId: import_zod8.z.string().optional(),
        startDate: import_zod8.z.string().optional(),
        endDate: import_zod8.z.string().optional()
      })
    },
    responses: {
      200: {
        description: "List of activity logs",
        content: {
          "application/json": {
            schema: import_zod8.z.object({
              logs: import_zod8.z.array(activityLogResponseSchema),
              pagination: import_zod8.z.object({
                total: import_zod8.z.number(),
                page: import_zod8.z.number(),
                limit: import_zod8.z.number(),
                pages: import_zod8.z.number()
              })
            })
          }
        }
      },
      401: {
        description: "Unauthorized"
      },
      403: {
        description: "Forbidden"
      }
    }
  }),
  async (c) => {
    await requirePermission(SYSTEM_LOGS.action, SYSTEM_LOGS.subject)(c, async () => {
    });
    const query = c.req.query();
    const page = parseInt(query.page || "1");
    const limit = parseInt(query.limit || "20");
    const skip2 = (page - 1) * limit;
    const where = {};
    if (query.userId) {
      where.userId = query.userId;
    }
    if (query.action) {
      where.action = query.action;
    }
    if (query.subject) {
      where.subject = query.subject;
    }
    if (query.subjectId) {
      where.subjectId = query.subjectId;
    }
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        where.createdAt.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.createdAt.lte = new Date(query.endDate);
      }
    }
    const total = await import_db.prisma.activityLog.count({ where });
    const logs = await import_db.prisma.activityLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      skip: skip2,
      take: limit
    });
    return c.json({
      logs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  }
);
activityLogsRouter.openapi(
  (0, import_zod_openapi8.createRoute)({
    method: "get",
    path: "/:id",
    tags: ["Activity Logs"],
    security: [{ bearerAuth: [] }],
    description: "Get activity log by ID",
    request: {
      params: import_zod8.z.object({
        id: import_zod8.z.string()
      })
    },
    responses: {
      200: {
        description: "Activity log details",
        content: {
          "application/json": {
            schema: activityLogResponseSchema
          }
        }
      },
      401: {
        description: "Unauthorized"
      },
      403: {
        description: "Forbidden"
      },
      404: {
        description: "Activity log not found"
      }
    }
  }),
  async (c) => {
    await requirePermission(SYSTEM_LOGS.action, SYSTEM_LOGS.subject)(c, async () => {
    });
    const { id: id2 } = c.req.param();
    const log = await import_db.prisma.activityLog.findUnique({
      where: { id: id2 },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    if (!log) {
      return c.json({ error: "Activity log not found" }, 404);
    }
    return c.json(log);
  }
);
activityLogsRouter.openapi(
  (0, import_zod_openapi8.createRoute)({
    method: "get",
    path: "/user/:userId",
    tags: ["Activity Logs"],
    security: [{ bearerAuth: [] }],
    description: "Get activity logs for a specific user",
    request: {
      params: import_zod8.z.object({
        userId: import_zod8.z.string()
      }),
      query: import_zod8.z.object({
        page: import_zod8.z.string().optional().default("1"),
        limit: import_zod8.z.string().optional().default("20")
      })
    },
    responses: {
      200: {
        description: "User activity logs",
        content: {
          "application/json": {
            schema: import_zod8.z.object({
              logs: import_zod8.z.array(activityLogResponseSchema),
              pagination: import_zod8.z.object({
                total: import_zod8.z.number(),
                page: import_zod8.z.number(),
                limit: import_zod8.z.number(),
                pages: import_zod8.z.number()
              })
            })
          }
        }
      },
      401: {
        description: "Unauthorized"
      },
      403: {
        description: "Forbidden"
      },
      404: {
        description: "User not found"
      }
    }
  }),
  async (c) => {
    await requirePermission(SYSTEM_LOGS.action, SYSTEM_LOGS.subject)(c, async () => {
    });
    const { userId } = c.req.param();
    const query = c.req.query();
    const page = parseInt(query.page || "1");
    const limit = parseInt(query.limit || "20");
    const skip2 = (page - 1) * limit;
    const user = await import_db.prisma.user.findUnique({
      where: { id: userId }
    });
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }
    const total = await import_db.prisma.activityLog.count({
      where: { userId }
    });
    const logs = await import_db.prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip: skip2,
      take: limit
    });
    return c.json({
      logs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  }
);
activityLogsRouter.openapi(
  (0, import_zod_openapi8.createRoute)({
    method: "get",
    path: "/resource/:subject/:subjectId",
    tags: ["Activity Logs"],
    security: [{ bearerAuth: [] }],
    description: "Get activity logs for a specific resource",
    request: {
      params: import_zod8.z.object({
        subject: import_zod8.z.string(),
        subjectId: import_zod8.z.string()
      }),
      query: import_zod8.z.object({
        page: import_zod8.z.string().optional().default("1"),
        limit: import_zod8.z.string().optional().default("20")
      })
    },
    responses: {
      200: {
        description: "Resource activity logs",
        content: {
          "application/json": {
            schema: import_zod8.z.object({
              logs: import_zod8.z.array(activityLogResponseSchema),
              pagination: import_zod8.z.object({
                total: import_zod8.z.number(),
                page: import_zod8.z.number(),
                limit: import_zod8.z.number(),
                pages: import_zod8.z.number()
              })
            })
          }
        }
      },
      401: {
        description: "Unauthorized"
      },
      403: {
        description: "Forbidden"
      }
    }
  }),
  async (c) => {
    await requirePermission(SYSTEM_LOGS.action, SYSTEM_LOGS.subject)(c, async () => {
    });
    const { subject, subjectId } = c.req.param();
    const query = c.req.query();
    const page = parseInt(query.page || "1");
    const limit = parseInt(query.limit || "20");
    const skip2 = (page - 1) * limit;
    const total = await import_db.prisma.activityLog.count({
      where: { subject, subjectId }
    });
    const logs = await import_db.prisma.activityLog.findMany({
      where: { subject, subjectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      skip: skip2,
      take: limit
    });
    return c.json({
      logs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  }
);
activityLogsRouter.openapi(
  (0, import_zod_openapi8.createRoute)({
    method: "get",
    path: "/summary",
    tags: ["Activity Logs"],
    security: [{ bearerAuth: [] }],
    description: "Get activity summary statistics",
    request: {
      query: import_zod8.z.object({
        days: import_zod8.z.string().optional().default("7")
      })
    },
    responses: {
      200: {
        description: "Activity summary",
        content: {
          "application/json": {
            schema: import_zod8.z.object({
              totalActivities: import_zod8.z.number(),
              userActivities: import_zod8.z.array(import_zod8.z.object({
                userId: import_zod8.z.string(),
                userName: import_zod8.z.string().nullable(),
                userEmail: import_zod8.z.string(),
                count: import_zod8.z.number()
              })),
              actionActivities: import_zod8.z.array(import_zod8.z.object({
                action: import_zod8.z.string(),
                count: import_zod8.z.number()
              })),
              subjectActivities: import_zod8.z.array(import_zod8.z.object({
                subject: import_zod8.z.string(),
                count: import_zod8.z.number()
              })),
              dailyActivities: import_zod8.z.array(import_zod8.z.object({
                date: import_zod8.z.string(),
                count: import_zod8.z.number()
              }))
            })
          }
        }
      },
      401: {
        description: "Unauthorized"
      },
      403: {
        description: "Forbidden"
      }
    }
  }),
  async (c) => {
    await requirePermission(SYSTEM_LOGS.action, SYSTEM_LOGS.subject)(c, async () => {
    });
    const query = c.req.query();
    const days = parseInt(query.days || "7");
    const startDate = /* @__PURE__ */ new Date();
    startDate.setDate(startDate.getDate() - days);
    const totalActivities = await import_db.prisma.activityLog.count({
      where: {
        createdAt: {
          gte: startDate
        }
      }
    });
    const userActivities = await import_db.prisma.$queryRaw`
      SELECT 
        "userId", 
        u.name as "userName", 
        u.email as "userEmail", 
        COUNT(*) as count 
      FROM "ActivityLog" a
      JOIN "User" u ON a."userId" = u.id
      WHERE a."createdAt" >= ${startDate}
      GROUP BY "userId", u.name, u.email
      ORDER BY count DESC
      LIMIT 10
    `;
    const actionActivities = await import_db.prisma.$queryRaw`
      SELECT 
        action, 
        COUNT(*) as count 
      FROM "ActivityLog"
      WHERE "createdAt" >= ${startDate}
      GROUP BY action
      ORDER BY count DESC
      LIMIT 10
    `;
    const subjectActivities = await import_db.prisma.$queryRaw`
      SELECT 
        subject, 
        COUNT(*) as count 
      FROM "ActivityLog"
      WHERE "createdAt" >= ${startDate}
      GROUP BY subject
      ORDER BY count DESC
      LIMIT 10
    `;
    const dailyActivities = await import_db.prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('day', "createdAt") as date, 
        COUNT(*) as count 
      FROM "ActivityLog"
      WHERE "createdAt" >= ${startDate}
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY date
    `;
    return c.json({
      totalActivities,
      userActivities,
      actionActivities,
      subjectActivities,
      dailyActivities
    });
  }
);
var activity_logs_default = activityLogsRouter;

// src/index.ts
var import_node_server = require("@hono/node-server");
init_config();
var app = new import_hono5.Hono();
app.get("/health", (c) => {
  console.log("Health check endpoint called");
  return c.json({
    status: "ok",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    version: process.env.npm_package_version || "unknown",
    environment: process.env.NODE_ENV || "development"
  });
});
app.get("/api/health", (c) => {
  console.log("Health check endpoint called via /api/health");
  return c.json({
    status: "ok",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    version: process.env.npm_package_version || "unknown",
    environment: process.env.NODE_ENV || "development"
  });
});
app.use("*", (0, import_logger4.logger)());
app.use(
  "*",
  (0, import_cors.cors)({
    origin: config2.cors.origin,
    allowMethods: config2.cors.methods,
    allowHeaders: config2.cors.allowedHeaders,
    exposeHeaders: ["Content-Length", "X-Request-ID"],
    credentials: true,
    // Allow cookies to be sent with requests
    maxAge: 86400
    // 24 hours
  })
);
app.use("*", (0, import_pretty_json.prettyJSON)());
app.use("*", rateLimit2);
app.use("*", errorMiddleware);
app.use("*", csrf_default());
var apiRouter = new import_zod_openapi9.OpenAPIHono();
apiRouter.route("/auth", auth_routes_default);
apiRouter.route("/users", user_routes_default);
apiRouter.route("/metadata", metadata_routes_default);
apiRouter.route("/search", search_routes_default);
apiRouter.route("/admin", admin_routes_default);
apiRouter.route("/permissions", permissions_default);
apiRouter.route("/roles", roles_default);
apiRouter.route("/user-permissions", user_permissions_default);
apiRouter.route("/permission-groups", permission_groups_default);
apiRouter.route("/activity-logs", activity_logs_default);
app.route("/", apiRouter);
app.route("/api", apiRouter);
app.get(
  "/docs/*",
  (0, import_swagger_ui.swaggerUI)({
    url: "/api/docs"
  })
);
if (process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test") {
  const port = config2.port || 3001;
  try {
    console.log(`API server is running on port ${port}`);
    (0, import_node_server.serve)({
      fetch: app.fetch,
      port
    });
    console.log("API: Server startup complete - ready to accept connections");
  } catch (error) {
    console.error("Failed to start server:", error);
  }
}
var src_default = app;
/*! Bundled license information:

@prisma/client/runtime/library.js:
  (*! Bundled license information:
  
  decimal.js/decimal.mjs:
    (*!
     *  decimal.js v10.5.0
     *  An arbitrary-precision Decimal type for JavaScript.
     *  https://github.com/MikeMcl/decimal.js
     *  Copyright (c) 2025 Michael Mclaughlin <M8ch88l@gmail.com>
     *  MIT Licence
     *)
  *)
*/
//# sourceMappingURL=index.js.map