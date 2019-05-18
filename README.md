# Yelpcamp
[![Known Vulnerabilities](https://snyk.io/test/github/nchulani2/yelpcamp/badge.svg)](https://snyk.io/test/github/nchulani2/yelpcamp)  CRUD based web app

**Yelpcamp is a Node.js web application originally developed by Colt Steele on Udemy - [The Web Developer Bootcamp by Colt Steele](https://www.udemy.com/the-web-developer-bootcamp/)**

**A running demo of the app can be found here at - [yelpcampport](https://yelpcampport.herokuapp.com/)

## Features

* **Authentication**
   * User can login with username and password.

* **Authorization**
   * Users cannot edit or delete camps/comments created by other users.
   * User must be signed in to create a camp.

* **CRUD(Create, Read, Update, Delete) based development**
   * Create, edit, update and delete camps/comments
   * Next campground feature **(Previous campground currently disabled)**
  
* **User account functionalities**
   * Password reset via email comfirmation
   * OAuth 2.0 through Google+ and Facebook **(Works locally with appropriate client info)**
      * _To gain privilege for use of Google's and Facebook's OAuth feature, you must submit your app for verification._
 
* **Interactive flash messages to guide users**

* **Responsive web design**


## Dependencies 

* [async](https://caolan.github.io/async/)
* [body-parser](https://www.npmjs.com/package/body-parser)
* [connect-flash](https://github.com/jaredhanson/connect-flash)
* [cookie-session](https://github.com/expressjs/cookie-session)
* [crypto](https://nodejs.org/api/crypto.html#crypto_crypto)
* [dotenv](https://github.com/motdotla/dotenv)
* [ejs](https://github.com/mde/ejs)
* [express](https://expressjs.com/)
* [express-sanitizer](https://github.com/markau/express-sanitizer)
* [method-override](https://www.npmjs.com/package/method-override)
* [moment](https://momentjs.com/)
* [mongoose](https://mongoosejs.com/)
* [node-geocoder](https://www.npmjs.com/package/node-geocoder)
* [nodemailer](https://nodemailer.com/about/)
* [passport](https://github.com/jaredhanson/passport)
* [passport-google-oauth20](https://github.com/jaredhanson/passport-google-oauth2)
* [passport-facebook](https://github.com/jaredhanson/passport-google-oauth2)
* [passport-local](https://github.com/jaredhanson/passport-google-oauth2)
* [passport-local-mongoose](https://github.com/saintedlama/passport-local-mongoose)

## License
* ISC


