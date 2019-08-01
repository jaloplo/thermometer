const SCALES_AVAILABLE = ['Celsius', 'Farenheit', 'Kelvin'];

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
            console.log('changing scale to ' + newScale);
        }
    }
});