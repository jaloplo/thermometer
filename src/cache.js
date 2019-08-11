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
        return JSON.parse(this.store.getItem(key));
    }

    has(key) {
        return null !== this.store.getItem(key);
    }

    set(key, value) {
        this.store.setItem(key, JSON.stringify(value));
    }
}