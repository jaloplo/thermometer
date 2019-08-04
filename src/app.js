const CELSIUS_SCALE = 'Celsius';
const FARENHEIT_SCALE = 'Farenheit';
const KELVIN_SCALE = 'Kelvin';

const SCALES_AVAILABLE = [CELSIUS_SCALE, FARENHEIT_SCALE, KELVIN_SCALE];

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

/* # TemperatureTransformationService
 * Handle temperature transformation methods from one scale to another.
 * Current scales supported are Celsius, Fahrenheit and Kelvin.
 *
 * ## Example
 * let ts = new TransformationService();
 * let temperatureService = new TemperatureTransformationService(ts);
 * let fahrenheit = temperatureService.get(CELSIUS_SCALE, FAHRENHEIT_SCALE, 32); // fahrenheit should be TODO:
 */
const TemperatureTransformationService = function(transformationService) {
    let service = transformationService;

    service.register(CELSIUS_SCALE, KELVIN_SCALE, (degree) => degree + parseFloat(273.15));
    service.register(KELVIN_SCALE, CELSIUS_SCALE, (degree) => degree - parseFloat(273.15));
    service.register(CELSIUS_SCALE, FARENHEIT_SCALE, (degree) => (9*degree/5) + 32);
    service.register(FARENHEIT_SCALE, CELSIUS_SCALE, (degree) => (5*(degree-32)) / 9);
    service.register(FARENHEIT_SCALE, KELVIN_SCALE, (degree) => (5*(degree-32)) / 9 + 273.15);
    service.register(KELVIN_SCALE, FARENHEIT_SCALE, (degree) => (9*(degree - 273.15)/5) + 32);

    return service;
};

/* # Converter
 * Converts TransformationService methods to be easier to read.
 * Applies currying technique in order to write code more readable to human beings.
 * 
 * ## Example
 * let ts = new TransformationService();
 * let temperatureService = new TemperatureTransformationService(ts);
 * let convert = new Converter(temperatureService);
 * let fahrenheit = convert(32).from(CELSIUS_SCALE).to(FAHRENHEIT_SCALE); // fahrenheit should be TODO:
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


const PositionController = function() {
    return {
        getBrowserPosition: function() {
            return new Promise(function(resolve, reject) {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });
        }
    };
};

const FakeWeatherConnector = function() {
    return {
        get: function() {
            return new Promise(function(resolve, reject) {
                setTimeout(function() {
                    resolve({
                        temperature: Math.random() * 20,
                        scale: 'Celsius'
                    });
                }, 1000);
            });
        },
    };
};

const AsyncWeatherProvider = function(weatherConnector) {
    let _weatherConnector = weatherConnector;
    
    return {
        get: function() {
            return new Promise(function(resolve, reject) {
                _weatherConnector.get().then(res => resolve(res));
            });
        }
    };
};

const WeatherProviderBuilder = {
    build: function(connector, provider) {
        return new provider(connector);
    }
};

const AppController = function(transformer, weatherProvider) {
    let _transformer = transformer;
    let _weatherProvider = weatherProvider;

    return {
        changeScaleTo: function(value, source, target) {
            return _transformer(value).from(source).to(target);
        },
        getCurrentTemperature: async function() {
            let response = await _weatherProvider.get()
            return response;
        }
    };
}

const App = function(controller) {
    let _controller = controller;
    let weatherUI = null;
    
    let model = {
        scales: SCALES_AVAILABLE,
        current: {},
        status: 0
    };

    return {
        init: function() {            
            weatherUI = new Vue({
                el: '#app',
                data: model,
                methods: {
                    changeScaleTo: function(newScale) {
                        weatherUI.current.temperature = _controller.changeScaleTo(
                            weatherUI.current.temperature,
                            weatherUI.current.scale,
                            newScale);
                        weatherUI.current.scale = newScale;
                    }
                }
            });
            return this;
        },
        start: async function() {
            let res = await _controller.getCurrentTemperature();
            weatherUI.current = res;
            weatherUI.status = 1;
            return this;
        }
    };
};

let transformationService = new TransformationService();
let temperatureService = new TemperatureTransformationService(transformationService);
let convert = new Converter(temperatureService);
 
let controller = new AppController(
    convert,
    WeatherProviderBuilder.build(new FakeWeatherConnector(), AsyncWeatherProvider));
let thermometerApp = new App(controller);

thermometerApp
    .init()
    .start();