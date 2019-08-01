const CELSIUS_SCALE = 'Celsius';
const FARENHEIT_SCALE = 'Farenheit';
const KELVIN_SCALE = 'Kelvin';

const SCALES_AVAILABLE = [CELSIUS_SCALE, FARENHEIT_SCALE, KELVIN_SCALE];

const converters = [];
converters.push({
    source: CELSIUS_SCALE,
    target: KELVIN_SCALE,
    formula: function(degree) {
        return degree + parseFloat(273.15);
    }
});
converters.push({
    source: KELVIN_SCALE,
    target: CELSIUS_SCALE,
    formula: function(degree) {
        return degree - parseFloat(273.15);
    }
});

let temperatureConverter = function(temperature, oldScale, newScale) {
    return converters.filter(c => c.source === oldScale && c.target === newScale)[0].formula(temperature);
}


let model = {
    scales: SCALES_AVAILABLE,
    current: {
        temperature: 14,
        scale: SCALES_AVAILABLE[0]
    }
};

let thermometerApp = new Vue({
    el: '#app',
    data: model,
    methods: {
        changeScaleTo: function(newScale) {
            console.log('changing scale from ' + thermometerApp.current.scale + ' to ' + newScale);
            thermometerApp.current.temperature = temperatureConverter(
                thermometerApp.current.temperature, 
                thermometerApp.current.scale,
                newScale);
            thermometerApp.current.scale = newScale;
        }
    }
});