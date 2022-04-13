var express = require('express');
var app = express();
//javascript modules
var qs = require('querystring'); //querystring module (products display & invoice)
const fs = require('fs'); //file system module (login & registration)

//To access inputted data
app.use(express.urlencoded({ extended: true }));

// monitor all requests; from info_server_Ex5.js in Lab13
app.all('*', function(request, response, next) {
    console.log(request.method + ' to ' + request.path);
    next();
});

//start with user logged out
var user_logged_in = false;

//--------------------products display page--------------------
//products data
var products = require('./product_data.json');
app.get("/product_data.js", function(request, response) {
    response.type('.js');
    var products_str = `var products = ${JSON.stringify(products)};`;
    response.send(products_str);
});

// process purchase request (validate quantities, check quantity available)
products.forEach((prod, i) => { prod.total_sold = 0 });

//variable for purchase data
var purchase_form_data;

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
        if (Number(quantity) <= inventory && isNonNegInt(quantity)) {
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

    //if there's no errors, send to login page
    if (Object.keys(errors).length == 0) {
        purchase_form_data = quantity;
        console.log(purchase_form_data);
        if (user_logged_in == true) {
            response.redirect('./invoice.html' + purchase_form_data);
        } else {
            response.redirect('./login_page.html?');
        }
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

//route for purchase form data
app.get("/purchase_form_data.js", function(request, response) {
    response.type('.js');
    var purchase_str = `var purchase_form_data = ${JSON.stringify(purchase_form_data)};`;
    console.log(purchase_str);
    response.send(purchase_str);
})

//--------------------registration form--------------------
var filename = './user_data.json';
//have reg data file, so read data and parse into user_reg_info object
let data_str = fs.readFileSync(filename, 'utf-8');
var user_reg_info = JSON.parse(data_str);
console.log(user_reg_info);

app.post("/register", function(request, response) {
    //define new username, password, repeat password, and email
    //.toLowerCase makes case insensitive
    var username = request.body.username.toLowerCase();
    var name = request.body['name'];
    var password = request.body['password'];
    var confirm_password = request.body['repeat_password'];
    var email = request.body.email.toLowerCase();
    var reg_errors = {}; //start with no errors

    //validate username value
    //Username length must be minimum 4 characters and maximum 10 characters
    if (username.length < 4 || username.length > 10) {
        reg_errors[`username`] = `Username must be between 4 and 10 characters.`;
    } else if (username.length == 0) {
        reg_errors[`username`] = `Enter a username. `;
    }

    //Username cannot have symbols (only letters and numbers)
    //.match from https://stackoverflow.com/questions/3853543/checking-input-values-for-special-symbols
    if (username.match(/^[a-zA-Z0-9_]+$/) == false) {
        reg_errors[`username`] = `Username can only consist of letters and numbers. `;
    }

    //Username is already taken
    if (typeof user_reg_info[username] != 'undefined') {
        reg_errors[`username`] = `Username is already taken. `;
    }

    //validate name value
    //name cannot be more than 30 characters
    if (name.length == 0) {
        reg_errors[`name`] = `Enter your full name. `;
    } else if (name.length > 30) {
        reg_errors[`name`] = `Name cannot be more than 30 characters. `;
    }

    //name can only have letters
    if (name.match(/^[a-zA-Z_]+$/) == false) {
        reg_errors[`name`] = `Name can only consist of letters. `;
    }

    //validate password value
    //password must be at least 6 characters minimum
    if (password.length == 0) {
        reg_errors[`password`] = `Enter a password. `;
    } else if (password.length < 6) {
        reg_errors[`password`] = `Password is too short. `;
    }

    //confirm password
    if (confirm_password.length == 0) {
        reg_errors[`passwordReenter`] = `Reenter your password. `;
    } else if (password == confirm_password) {
        console.log('passwords match');
    } else {
        reg_errors[`passwordReenter`] = `Passwords do not match, please try again. `;
    }

    //validate email value
    if (email.length == 0) {
        reg_errors[`email`] = `Enter your email. `;
    }
    //.match from https://www.w3resource.com/javascript/form/email-validation.php
    else if (email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
        console.log(`email is ${email}`);
    } else {
        reg_errors[`email`] = `Email is invalid. `;
    }

    //if there's no errors, add registration info to user_data.json, log in user, and redirect to invoice
    if (Object.keys(reg_errors).length == 0) {
        user_reg_info
        user_reg_info[username] = {};
        user_reg_info[username].name = request.body.name;
        user_reg_info[username].password = request.body.password;
        user_reg_info[username].email = request.body.email;
        fs.writeFileSync(filename, JSON.stringify(user_reg_info));
        user_logged_in == true;
        response.redirect(`./invoice.html?`);
    } else {
        let errs_obj = { "reg_errors": JSON.stringify(reg_errors) };
        let params = new URLSearchParams(errs_obj);
        params.append('reg_data', JSON.stringify(request.body)); //put reg data into params
        params.append('username', request.body.username); //put username into params
        response.redirect(`./registration.html?` + params.toString());
    }
});

//--------------------login page--------------------
//Process login form; modified from ex4.js in Lab14

app.post("/login", function(request, response) {
    // Redirect to logged in page if ok, back to login page if not
    let username = request.body['username'].toLowerCase();
    let login_password = request.body['password'];
    let params = new URLSearchParams(request.query);

    var log_errors = []; //start with no errors

    //check if username exists, then check password entered matched password stored
    if (typeof user_reg_info[username] != 'undefined') {
        if (user_reg_info[username].password == login_password) {
            console.log('no log in errors');
        } else {
            log_errors['incorrect_password'] = `Incorrect password for ${username}. Please try again.`;
        }
    } else {
        log_errors['incorrect_username'] = `Username ${username} is incorrect. Please try again.`;
        //response.redirect(`./login?err=${username} does not exist`);
    }
    if (Object.keys(log_errors).length == 0) {
        user_logged_in == true;
        response.redirect('./invoice.html?');
    } else {
        //generate registration error message
        let log_error_string = '';
        for (err in log_errors) {
            log_error_string += log_errors[err];
        }
        //response.send(reg_error_string);
        response.redirect('./login_page.html?' + `&log_error_string=${log_error_string} `);
        console.log(`log_error_string=${log_error_string} `);
    }
});

// route all other GET requests to files in public 
app.use(express.static('./public'));

// start server
app.listen(8080, () => console.log(`listening on port 8080`));