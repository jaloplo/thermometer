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

/* # TemperatureTransformationRegister
 * Adds temperature transformation methods from one scale to another to a TransformationService object.
 * Current scales supported are Celsius, Fahrenheit and Kelvin.
 *
 * ## Example
 * let ts = new TransformationService();
 * ts = new TemperatureTransformationRegister(ts);
 * let fahrenheit = ts.get(CELSIUS_SCALE, FAHRENHEIT_SCALE, 32); // fahrenheit should be 89.6
 */
const TemperatureTransformationRegister = function(transformationService) {
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
 * let fahrenheit = convert(32).from(CELSIUS_SCALE).to(FAHRENHEIT_SCALE); // fahrenheit should be 89.6
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


const VueAppController = function(transformer, weatherProvider) {

    let _transformer = transformer;
    let _weatherProvider = weatherProvider;
    
    return new Vue({
        // app view layer
        el: '#app',
        
        // app model layer
        data: {
            scales: SCALES_AVAILABLE,
            current: {},
            status: 0
        },

        // app controller layer
        beforeCreate: function() {
            _weatherProvider.get().then(res => {
                this.current = res;
                this.status = 1;
            });
        },
        methods: {
            changeScaleTo: function(newScale) {
                this.current.temperature = 
                    _transformer(this.current.temperature)
                        .from(this.current.scale)
                        .to(newScale);
                this.current.scale = newScale;
            }
        }
    });
}


let transformationService = new TransformationService();
transformationService = new TemperatureTransformationRegister(transformationService);
let convert = new Converter(transformationService);
let weather = WeatherProviderBuilder.build(new FakeWeatherConnector(), AsyncWeatherProvider);

let thermometerApp = new VueAppController(convert, weather);