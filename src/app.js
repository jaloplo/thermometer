/* # TransformationService
 * Handle transformation methods from one type to another.
 *
 * ## Example
 * let ts = new TransformationService();
 * ts.register('meter', 'centimeter', (value) => value * 100);
 * let length = ts.get('meter', 'centimer').transform(2); // length value shoudl be 200.
 */
const TransformationService = function() {
    let collection = {};

    return {
        get: function(source, target) {
            if(!collection[source] || !collection[source][target]) {
                // TODO: throw an error
                return null;
            }

            return collection[source][target];
        },

        register: function(source, target, formula) {
            if(!collection[source]) {
                collection[source] = {};
            }
            if(!collection[source][target]) {
                collection[source][target] = {};
            }

            collection[source][target].transform = formula;

            return this;
        }
    };
};

/* # TemperatureTransformationRegister
 * Adds temperature transformation methods from one scale to another to a TransformationService object.
 * Current scales supported are Celsius, Fahrenheit and Kelvin.
 *
 * ## Example
 * let ts = new TransformationService();
 * ts = new TemperatureTransformationRegister(ts);
 * let fahrenheit = ts.get('Celsius', 'Fahrenheit', 32); // fahrenheit should be 89.6
 */
const TemperatureTransformationRegister = function(transformationService) {
    let service = transformationService;

    service.register(TemperatureManager.CelsiusScaleKey, TemperatureManager.KelvinScaleKey, (degree) => degree + 273.15);
    service.register(TemperatureManager.KelvinScaleKey, TemperatureManager.CelsiusScaleKey, (degree) => degree - 273.15);
    service.register(TemperatureManager.CelsiusScaleKey, TemperatureManager.FahrenheitScaleKey, (degree) => (9*degree/5) + 32);
    service.register(TemperatureManager.FahrenheitScaleKey, TemperatureManager.CelsiusScaleKey, (degree) => (5*(degree-32)) / 9);
    service.register(TemperatureManager.FahrenheitScaleKey, TemperatureManager.KelvinScaleKey, (degree) => (5*(degree-32)) / 9 + 273.15);
    service.register(TemperatureManager.KelvinScaleKey, TemperatureManager.FahrenheitScaleKey, (degree) => (9*(degree - 273.15)/5) + 32);

    return service;
};

/* # Converter
 * Converts TransformationService methods to be easier to read.
 * Applies currying technique in order to write code more readable to human beings.
 * 
 * ## Example
 * let ts = new TransformationService();
 * ts = new TemperatureTransformationService(ts);
 * let convert = new Converter(ts);
 * let fahrenheit = convert(32).from('Celsius').to('Fahrenheit'); // fahrenheit should be 89.6
 */
const Converter = function(service) {
    let _service = service;

    return function(value) {
        return {
            from: function(source) {
                return {
                    to: function(target) {
                        return _service.get(source, target).transform(value);
                    }
                };
            }
        };
    };
};

/* # TemperatureManager
 * Manages all temperature features available like all scales availables and the conversion between scales.
 * 
 * ## Example
 * let tManager = new TemperatureManager();
 * tManager.convert(32).from(TemperatureManager.CelsiusScaleKey).to(TemperatureManager.FahrenheitScaleKey); // fahrenheit should be 89.6
 */
const TemperatureManager = function() {
    let transformationService = new TransformationService();
    transformationService = new TemperatureTransformationRegister(transformationService);
    let convert = new Converter(transformationService);

    return {
        convert: convert,

        getAvailableScales: function() {
            return [TemperatureManager.CelsiusScaleKey, 
                TemperatureManager.FahrenheitScaleKey, 
                TemperatureManager.KelvinScaleKey];
        }
    };
};
TemperatureManager.CelsiusScaleKey = 'Celsius';
TemperatureManager.FahrenheitScaleKey = 'Fahrenheit';
TemperatureManager.KelvinScaleKey = 'Kelvin';




/* # FakeWeatherConnector
 * Simulates an API call that returns a value for a temperature an its scale.
 * 
 * ## Example
 * let connector = new FakeWeatherConnector();
 * connector.get().then(res => console.log(res)); // { temperature: 4.192741, scale: 'Celsius' }
 */
const FakeWeatherConnector = function() {
    return {
        get: function() {
            return new Promise(function(resolve, reject) {
                setTimeout(function() {
                    resolve({
                        body: {
                            "coord": { "lon": 139,"lat": 35},
                            "weather": [{
                                    "id": 800,
                                    "main": "Clear",
                                    "description": "clear sky",
                                    "icon": "01n"
                            }],
                            "base": "stations",
                            "main": {
                                "temp": 289.92,
                                "pressure": 1009,
                                "humidity": 92,
                                "temp_min": 288.71,
                                "temp_max": 290.93
                            },
                            "wind": {
                                "speed": 0.47,
                                "deg": 107.538
                            },
                            "clouds": {
                                "all": 2
                            },
                            "dt": 1560350192,
                            "sys": {
                                "type": 3,
                                "id": 2019346,
                                "message": 0.0065,
                                "country": "JP",
                                "sunrise": 1560281377,
                                "sunset": 1560333478
                            },
                            "timezone": 32400,
                            "id": 1851632,
                            "name": "Shuzenji",
                            "cod": 200
                        }
                    });
                }, 1000);
            });
        },
    };
};


const OpenWeatherApiConnector = function() {
    let options = {
        key: '0ae7fbee8ee8f2df5bfa7f60a367ef18',
        protocol: 'http',
        url: 'api.openweathermap.org/data/2.5',
        method: 'weather',
    };

    function build() {
        return `${options.protocol}://${options.url}/${options.method}?APPID=${options.key}`
    }

    return {
        get: function(latitude, longitude) {
            let apiUri = `${build()}&lat=${latitude}&lon=${longitude}`;
            return superagent.get(apiUri);
        }
    };
};

const CachedApiConnector = function(sourceConnector) {

    let cache = new LocalStorageCacheManager();
    let connector = sourceConnector;

    function buildKey(latitude, longitude) {
        return JSON.stringify({
            latitude: latitude,
            longitude: longitude,
        });
    }

    return {
        get: function(latitude, longitude) {
            let key = buildKey(latitude, longitude);
            
            if(!cache.has(key)) {
                console.log('>>> from api');
                return new Promise(function(resolve, reject) {
                    connector
                        .get(latitude, longitude)
                        .then(res => {
                            let expirationDate = new Date();
                            expirationDate.setMinutes(expirationDate.getMinutes() + 10);
                            let value = {
                                temp: res.body.main.temp
                            };
                            cache.set(key, value, expirationDate);
                            resolve(value);
                        });
                });
            } else {
                console.log('>>> cached');
                return new Promise(function(resolve, reject) {
                    resolve(cache.get(key));
                });
            }
        }
    };
};

const PositionController = function() {
    return {
        getBrowserPosition: function() {
            return new Promise(function(resolve, reject) {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });
        }
    };
};

const WeatherService = function() {

    let positionController = new PositionController();
    // let weatherProvider = new CachedApiConnector(new FakeWeatherConnector());
    let weatherProvider = new CachedApiConnector(new OpenWeatherApiConnector());

    return {
        get: async function() {
            let position = await positionController.getBrowserPosition();
            let latitude = position.coords.latitude;
            let longitude = position.coords.longitude;

            return weatherProvider.get(latitude, longitude);
        }
    };
};

/* # StatusManager
 * Manages the status of the application. 
 + The only two status that are supported are 0 (initialization) and 1 (working).
 */
const StatusManager = function() {
    let current = 0;

    return  {
        get: function() {
            return current;
        },

        update: function(key) {
            current = null === key ? 0 : 1;
        }
    };
};

/* # VueAppController
 * Controls the application implemented with Vue.js.
 * 
 * ## Example
 * let connector = new FakeWeatherConnector();
 * let temperatureManager = new TemperatureManager();
 * let thermometerControllerApp = new VueAppController(temperatureManager, connector);
 */
const VueAppController = function(temperatureManager, weatherConnector) {

    let _temperature = temperatureManager;
    let _statusManager = new StatusManager();
    let _weather = weatherConnector;
    
    return new Vue({
        // app view layer
        el: '#app',
        
        // app model layer
        data: {
            scales: _temperature.getAvailableScales(),
            status: _statusManager.get(),
            value: {},
        },

        // app controller layer
        beforeCreate: function() {
            _weather.get().then(res => {
                this.value = {
                    temperature: res.temp,
                    scale: TemperatureManager.KelvinScaleKey
                };
            });
        },

        methods: {
            changeScaleTo: function(newScale) {
                let currentTemperature = this.value.temperature;
                let currentScale = this.value.scale;

                let newTemperature = _temperature.convert(currentTemperature).from(currentScale).to(newScale);

                this.value.temperature = newTemperature;
                this.value.scale = newScale;
            }
        },

        watch: {
            value: function() {
                _statusManager.update(this.value);
                this.status = _statusManager.get();
            }
        },
    });
};

/* # App
 * Runs the application.
 * 
 * ## Example
 * let thermometerApp = new App(VueAppController).start();
 */
const App = function(controllerObject) {
    let _controller = null;
    return {
        start: function() {
            let connector = new WeatherService();
            let temperatureManager = new TemperatureManager();
            _controller = new controllerObject(temperatureManager, connector);

            return this;
        }
    };
}

let thermometerApp = new App(VueAppController).start();