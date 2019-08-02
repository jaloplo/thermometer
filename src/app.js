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
            collection[source][target] = formula;
        }
    };
};

const temperatureParser = new temperatureParserHandler();
temperatureParser.register(CELSIUS_SCALE, KELVIN_SCALE, (degree) => degree + parseFloat(273.15));
temperatureParser.register(KELVIN_SCALE, CELSIUS_SCALE, (degree) => degree - parseFloat(273.15));
temperatureParser.register(CELSIUS_SCALE, FARENHEIT_SCALE, (degree) => (9*degree/5) + 32);
temperatureParser.register(FARENHEIT_SCALE, CELSIUS_SCALE, (degree) => (5*(degree-32)) / 9);
temperatureParser.register(FARENHEIT_SCALE, KELVIN_SCALE, (degree) => (5*(degree-32)) / 9 + parseFloat(273.15));
temperatureParser.register(KELVIN_SCALE, FARENHEIT_SCALE, (degree) => (9*(degree - 273,15)/5) + 32);


const PositionController = function() {
    return {
        getBrowserPosition: function() {
            return new Promise(function(resolve, reject) {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });
        }
    };
};

let provider = (function() {
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
        }
    };
})();


let model = {
    scales: SCALES_AVAILABLE,
    current: {}
};

provider.get().then(res => model.current = res);

let thermometerApp = new Vue({
    el: '#app',
    data: model,
    methods: {
        changeScaleTo: function(newScale) {
            console.log('changing scale from ' + thermometerApp.current.scale + ' to ' + newScale);
            // TODO: simplify this call, seems so complex to understand
            thermometerApp.current.temperature = temperatureParser.get(thermometerApp.current.scale, newScale)(thermometerApp.current.temperature);
            thermometerApp.current.scale = newScale;
        }
    }
});