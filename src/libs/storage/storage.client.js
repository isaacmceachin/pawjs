const obj = {};
/**
 * @todo This can be optimized an should not be used with Object.defineProperty
 * -------
 * Use simple class instead.
 * -------
 */
Object.defineProperty(obj, 'cookieHandler', new (function cookieHandler() {
  const aKeys = []; const
    oStorage = {};

  Object.defineProperty(oStorage, 'clear', {
    value() {
      aKeys.forEach((key) => {
        this.removeItem(key);
      });
    },
    writable: false,
    configurable: false,
    enumerable: false,
  });

  Object.defineProperty(oStorage, 'getItem', {
    value(sKey) {
      return sKey ? this[sKey] : null;
    },
    writable: false,
    configurable: false,
    enumerable: false,
  });
  Object.defineProperty(oStorage, 'key', {
    value(nKeyId) {
      return aKeys[nKeyId];
    },
    writable: false,
    configurable: false,
    enumerable: false,
  });
  Object.defineProperty(oStorage, 'keys', {
    value() {
      return aKeys;
    },
    writable: false,
    configurable: false,
    enumerable: false,
  });

  Object.defineProperty(oStorage, 'setItem', {
    value(sKey, sValue) {
      if (!sKey) {
        return;
      }
      this[sKey] = sValue;
      window.document.cookie = `${encodeURI(sKey)}=${encodeURI(sValue)}; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/`;
    },
    writable: false,
    configurable: false,
    enumerable: false,
  });
  Object.defineProperty(oStorage, 'length', {
    get() {
      return aKeys.length;
    },
    configurable: false,
    enumerable: false,
  });
  Object.defineProperty(oStorage, 'removeItem', {
    value(sKey) {
      if (!sKey) {
        return;
      }
      if (this[sKey]) {
        delete this[sKey];
      }
      document.cookie = `${encodeURI(sKey)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    },
    writable: false,
    configurable: false,
    enumerable: false,
  });
  this.get = function get() {
    let iThisIndx;
    Object.keys(oStorage).forEach((sKey) => {
      iThisIndx = aKeys.indexOf(sKey);
      if (iThisIndx === -1) {
        oStorage.setItem(sKey, oStorage[sKey]);
      } else {
        aKeys.splice(iThisIndx, 1);
      }
      delete oStorage[sKey];
    });
    for (aKeys; aKeys.length > 0; aKeys.splice(0, 1)) {
      oStorage.removeItem(aKeys[0]);
    }
    for (let aCouple, iKey, nIdx = 0, aCouples = document.cookie.split(/\s*;\s*/); nIdx < aCouples.length; nIdx += 1) {
      aCouple = aCouples[nIdx].split(/\s*=\s*/);
      if (aCouple.length > 1) {
        oStorage[iKey = decodeURI(aCouple[0])] = decodeURI(aCouple[1]);
        aKeys.push(iKey);
      }
    }
    return oStorage;
  };
  this.configurable = false;
  this.enumerable = true;
})());
export default obj.cookieHandler;
