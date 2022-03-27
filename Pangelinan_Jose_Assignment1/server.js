//server code: modified from info_server_Ex5.js in Lab13

//create server framework with express
var express = require('express');
var app = express();

//querystring package
var qs = require('querystring');

//To access inputted data from products_display.html
app.use(express.urlencoded({ extended: true }));

//products data
var products = require('./product_data.json');
app.get("/product_data.js", function(request, response) {
    response.type('.js');
    var products_str = `var products = ${JSON.stringify(products)};`;
    response.send(products_str);
});

// monitor all requests; from info_server_Ex5.js in Lab13
app.all('*', function(request, response, next) {
    console.log(request.method + ' to ' + request.path);
    next();
});

// process purchase request (validate quantities, check quantity available)
products.forEach((prod, i) => { prod.total_sold = 0 });

//route to validate quantities on server
app.post("/purchase", function(request, response, next) {
    var errors = []; //start with no errors
    var has_quantity = false; //start with no quantity

    //use loop to validate all product quantities
    for (i in products) {
        //access quantities entered from order form
        let quantity = request.body['quantity_textbox' + i];
        //check if there is a quantity; if not, has_quantity will still be false
        if (quantity.length > 0) {
            has_quantity = true;
        } else {
            continue;
        }

        //check if quantity is a non-negative integer
        if (has_quantity == true && isNonNegInt(quantity)) {
            products[i].total_sold += Number(quantity);
        }
        //if quantity is not a non-negative integer, add error (invalid quantity)
        else {
            errors[`invalid_quantity${i}`] = `Please enter a valid quantity for ${products[i].flavor}! `;
        }
        //check if there is enough in inventory
        //access quantity_available from json file
        let inventory = products[i].quantity_available;

        //if quantity ordered is less than or same as the amount in inventory, reduce inventory by quantity ordered amount 
        if (Number(quantity) <= inventory) {
            products[i].quantity_available -= Number(quantity);
            console.log(`${products[i].quantity_available} is new inventory amount`);
        }
        //if there's not enough in inventory, add error (quantity too large)
        else {
            errors[`invalid_quantity${i}`] = `Please order a smaller amount of ${products[i].flavor}! `;
        }
    }
    //if there are no quantities, send back to order page with message (need quantities)
    if (has_quantity == false) {
        errors['missing_quantities'] = 'Please enter a quantity!';
    }

    // create query string from request.body
    var qstring = qs.stringify(request.body);

    //if there's no errors, create a receipt
    if (Object.keys(errors).length == 0) {
        response.redirect('./invoice.html?' + qstring);
    } else {
        //if there's errors
        //generate error message based on type of error
        let error_string = ''; //start with empty error string
        for (err in errors) {
            error_string += errors[err];
            //for each error, add error message to overall error_string
        }
        //send back to order page with error message
        response.redirect('./products_display.html?' + qstring + `&error_string=${error_string}`);
        console.log(`error_string=${error_string}`);
    }
});

function isNonNegInt(q, returnErrors = false) {
    //If returnErrors is true, array of errors is returned
    //others return true if q is a non-neg int.
    errors = []; // assume no errors at first
    if (q == '') q = 0;
    if (Number(q) != q) errors.push('Not a number!'); // Check if string is a number value
    else {
        if (q < 0) errors.push('Negative value!'); // Check if it is non-negative
        if (parseInt(q) != q) errors.push('Not an integer!'); // Check that it is an integer
    }
    return returnErrors ? errors : (errors.length == 0);
};

// route all other GET requests to files in public 
app.use(express.static('./public'));

// start server
app.listen(8080, () => console.log(`listening on port 8080`));