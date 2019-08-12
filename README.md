# Thermometer project

**Thermometer** project is a web application built in order to practice and learn Vanilla _javascript_ and _Vue.js_. Being able to build an app from the scratch and set a code architecture that can evolve and is easy to understand, those are my goals and think most of them has been reached in this project.

Thermometer project is a SPA (Single Page Application) that lets users get a random temperature and change the scale from Celsius to Farenheit or Kelvin. I tried to keep it simple in order to achieve the goals previously explained but this can grow up adding more and more features just for keeping on practicing and learning.

Some of the techinques applied are:
* _Single Responsability_, the first rule of SOLID paradigm, 
* _MVC pattern_, for managing the application itseld,
* _Currying technique_, used to make code easier to read),
* _Promises_, for simulating API call to get the weather of the user location,
* _Status pattern_, just for knowing if API call has ended.

## Features

**Thermometer** app shows the temperature of the browser based on its location. To get the right coordinates it uses the [Geolocation API](https://w3c.github.io/geolocation-api/#navi-geo) provided as a property in the browser. The _latitude_ and _longitude_ are obtained and passed to the weather API service, in this case I selected [OpenWeatherMap](https://openweathermap.org/api), that returns the weather for that coordinates.

In order to have a better performance and not make lot of calls to the API service, I implemented a _cache_ functionality encapsulating the [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API) (Local and Session) so the application can used them as persistent or volatile ways.


## More stuff

Thermometer project makes me able to write articles about the lessons learned. Here you have the first one:

* _**[Currying to make readable code](https://dev.to/jaloplo/currying-to-improve-javascript-code-3mg9)**_: This article explains how to create code easier to read so easier to maintain.


## Contribute

If you want to contribute adding some more stuff like:

* API call techniques,
* Vue.js best practices,
* HTML structure,
* CSS techniques,
* etc.

Feel free and fork the repository, implement new features and send a pull request.