const CELSIUS_SCALE = 'Celsius';
const FARENHEIT_SCALE = 'Farenheit';
const KELVIN_SCALE = 'Kelvin';

const SCALES_AVAILABLE = [CELSIUS_SCALE, FARENHEIT_SCALE, KELVIN_SCALE];

let temperatureParserHandler = function() {
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

const temperatureParser = new temperatureParserHandler();
temperatureParser.register(CELSIUS_SCALE, KELVIN_SCALE, (degree) => degree + parseFloat(273.15));
temperatureParser.register(KELVIN_SCALE, CELSIUS_SCALE, (degree) => degree - parseFloat(273.15));
temperatureParser.register(CELSIUS_SCALE, FARENHEIT_SCALE, (degree) => (9*degree/5) + 32);
temperatureParser.register(FARENHEIT_SCALE, CELSIUS_SCALE, (degree) => (5*(degree-32)) / 9);
temperatureParser.register(FARENHEIT_SCALE, KELVIN_SCALE, (degree) => (5*(degree-32)) / 9 + parseFloat(273.15));
temperatureParser.register(KELVIN_SCALE, FARENHEIT_SCALE, (degree) => (9*(degree - 273.15)/5) + 32);


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
                }, 500);
            });
        },
    };
};

const WeatherProvider = function(weatherConnector) {
    let _weatherConnector = weatherConnector;
    
    return {
        get: function() {
            return new Promise(function(resolve, reject) {
                _weatherConnector.get().then(res => resolve(res));
            });
        }
    };
};


let model = {
    scales: SCALES_AVAILABLE,
    current: {}
};

const weatherConnector = new FakeWeatherConnector();
const weather = new WeatherProvider(weatherConnector);

let thermometerApp = new Vue({
    el: '#app',
    data: model,
    methods: {
        changeScaleTo: function(newScale) {
            thermometerApp.current.temperature = temperatureParser
                .get(thermometerApp.current.scale, newScale)
                .transform(thermometerApp.current.temperature);
            thermometerApp.current.scale = newScale;
        }
    }
});

weather.get().then(res => thermometerApp.current = res);