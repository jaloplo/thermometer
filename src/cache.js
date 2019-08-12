class CacheManager {
    store = {};

    get(key) {
        return this.store[key];
    }

    has(key) {
        return this.store.hasOwnProperty(key);
    }

    set(key, value) {
        this.store[key] = value;
    }
}

class LocalStorageCacheManager extends CacheManager {

    constructor() {
        super();
        this.store = window.localStorage;
    }

    get(key) {
        return this.has(key)
            ? JSON.parse(this.store.getItem(key)).value
            : null;
    }

    has(key) {
        let existsKey = null !== this.store.getItem(key);
        let hasExpired = existsKey 
            ? new Date(JSON.parse(this.store.getItem(key)).expires) < new Date()
            : false;
        return existsKey && !hasExpired;
    }

    set(key, value, expires) {
        let data = {
            value: value,
            expires: expires,
        };
        this.store.setItem(key, JSON.stringify(data));
    }
}

class SessionStorageCacheManager extends LocalStorageCacheManager {

    constructor() {
        super();
        this.store = window.sessionStorage;
    }
}