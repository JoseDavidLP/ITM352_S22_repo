var express = require('express');
var app = express();
var products = require('./product_data.json');
products.forEach( (prod,i) => {prod.total_sold = 0}); 

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

var products = require(__dirname + '/product_data.json');

app.get("/product_data.js", function (request, response, next) {
   response.type('.js');
   var products_str = `var products = ${JSON.stringify(products)};`;
   response.send(products_str);
});

app.use(express.urlencoded({ extended: true }));

// Rule to handle process_form request from order_page.html
app.post("/process_form", function (request, response) {
    receipt = '';
    let qtys = request.body[`quantity_textbox`];
    for (i in qtys) {
        q = qtys[i];
        let name = products[i]['name'];
        let brand_price = products[i]['price'];
        if (isNonNegativeInteger(q)) {
            products[i]['total_sold'] += Number(q);
            products[i].errors = q;
            receipt += `<h3>Thank you for purchasing: ${q} ${name}. Your total is \$${q * brand_price}!</h3>`; // render template string
        } else {
            receipt += `<h3><font color="red">${q} is not a valid quantity for ${name}!</font></h3>`;
            products[i].errors = q;
        }
    }
    if (!isNonNegativeInteger(q)) {
        let url = "order_page_multiple.html?error=Invalid%20Quantity&quantity_textbox="
        for (i in products) {
            url += products[i].name + "-" + qtys[i] + "_";
        }
        response.redirect(url);
    }
    response.send(receipt);
    response.end();
 });

// Route to handle just the path /test
app.get('/test', function (request, response, next) {
    response.send('Got a GET request to path: /test');
});

// Handle request for any static file
app.use(express.static('./public'));

app.listen(8080, () => console.log(`listening on port 8080`)); // note the use of an anonymous function here