const CELSIUS_SCALE = 'Celsius';
const FARENHEIT_SCALE = 'Farenheit';
const KELVIN_SCALE = 'Kelvin';

const SCALES_AVAILABLE = [CELSIUS_SCALE, FARENHEIT_SCALE, KELVIN_SCALE];

const TemperatureParserHandler = function() {
    let collection = {};

    return {
        get: function(source, target) {
            if(!collection[source]) {
                // TODO: throw an error
                return null;
            }

            // TODO: if target doesn't exist throw an error
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
        }
    };
};

const TemperatureParserBuilder = {
    build: function() {
        let parser = new TemperatureParserHandler();
    
        parser.register(CELSIUS_SCALE, KELVIN_SCALE, (degree) => degree + parseFloat(273.15));
        parser.register(KELVIN_SCALE, CELSIUS_SCALE, (degree) => degree - parseFloat(273.15));
        parser.register(CELSIUS_SCALE, FARENHEIT_SCALE, (degree) => (9*degree/5) + 32);
        parser.register(FARENHEIT_SCALE, CELSIUS_SCALE, (degree) => (5*(degree-32)) / 9);
        parser.register(FARENHEIT_SCALE, KELVIN_SCALE, (degree) => (5*(degree-32)) / 9 + parseFloat(273.15));
        parser.register(KELVIN_SCALE, FARENHEIT_SCALE, (degree) => (9*(degree - 273.15)/5) + 32);
    
        return parser;
    }
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

const App = function() {
    let temperatureParser = null;
    let weatherConnector = null;
    let weatherProvider = null;
    let weatherUI = null;
    
    let model = {
        scales: SCALES_AVAILABLE,
        current: {},
        status: 0
    };

    return {
        init: function() {
            temperatureParser = TemperatureParserBuilder.build();
            
            weatherConnector = new FakeWeatherConnector();
            weatherProvider = new AsyncWeatherProvider(weatherConnector);

            weatherUI = new Vue({
                el: '#app',
                data: model,
                methods: {
                    changeScaleTo: function(newScale) {
                        weatherUI.current.temperature = temperatureParser
                            .get(weatherUI.current.scale, newScale)
                            .transform(weatherUI.current.temperature);
                        weatherUI.current.scale = newScale;
                    }
                }
            });
            return this;
        },
        start: function() {
            weatherProvider.get().then(res => {
                weatherUI.current = res;
                weatherUI.status = 1;
            });
            return this;
        }
    };
};

let thermometerApp = new App();
thermometerApp
    .init()
    .start();