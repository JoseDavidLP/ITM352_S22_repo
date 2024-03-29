var express = require('express');
var app = express();
var myParser = require('body-parser');

function isNonNegativeInteger(inputString, returnErrors = false) {
    // Validate that an input value is a non-negative integer
    // @inputString - input string
    // @returnErrors - how the function returns: true mean return an array, false a boolean
    errors = []; // assume no errors at first
    if(Number(inputString) != inputString) {
        errors.push('Not a number!'); // Check if string is a number value
    }
    else {
        if(inputString < 0) errors.push('Negative value!'); // Check if it is non-negative
        if(parseInt(inputString) != inputString) errors.push('Not an integer!'); // Check that it is an integer
    }
    return returnErrors ? errors : (errors.length == 0);
}

// Route to handle any request; also calls next
app.all('*', function (request, response, next) {
    console.log(request.method + ' to path: ' + request.path);
    next();
});

// Route to handle just the path /test
app.get('/test', function (request, response, next) {
    response.send('Got a GET request to path: /test');
});

// Handle request for any static file
app.use(express.static('./public'));

app.listen(8080, () => console.log(`listening on port 8080`)); // note the use of an anonymous function here