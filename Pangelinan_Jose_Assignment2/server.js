
//Jose Pangelinan
//Assignment 2
//This is the server for store app

//modified from info_server_Ex5.js in Lab13 code
//modified from info_server_EC.js in Lab13 code
//modified from Tiffany Young | chloekamm

/*load product data*/
var products = require(__dirname + '/products.json');
var express = require('express');
var app = express();
var fs = require('fs')
//file system module (login & registration)
const qs = require('querystring');

//user data file
var filename = 'user_data.json';
//store the data from purchase 
var qty_data_obj = {};

if (fs.existsSync(filename)) {
   var data = fs.readFileSync(filename, 'utf-8');
   var users = JSON.parse(data);
} else {
   console.log(`${filename} doesn't exist :(`);
}

//To access inputted data
app.use(express.urlencoded({ extended: true }));


function isNonNegInt(q, returnErrors = false) {
   //If returnErrors is true, array of errors is returned
    //others return true if q is a non-neg int.
   errors = []; // assume no errors
   if (q == '') q = 0  //blank means 0
   if (Number(q) != q) errors.push('<font color="red">Not a number</font>'); //check if value is a number
   if (q < 0) errors.push('<font color="red">Negative value</font>'); // Check if it is non-negative
   if (parseInt(q) != q) errors.push('<font color="red">Not an integer</font>'); // Check if it is an integer

   return returnErrors ? errors : (errors.length == 0);
}

/* ------------------LOGIN FORM------------- */
app.post("/process_login", function (request, response) { //modified from Tiffany Young
   var errors = {};
   //login form info from post
   var user_email = request.body['email'].toLowerCase();
   var the_password = request.body['password']

   //check if username exists, then if entered password matches, lab 13 ex3-4
   if (typeof users[user_email] != 'undefined') {
      //check if entered password matches the stored password
      if (users[user_email].password == the_password) {
         //matches
         qty_data_obj['email'] = user_email;
         qty_data_obj['fullname'] = users[user_email].name;
         //direct to invoice page **need to keep data
         let params = new URLSearchParams(qty_data_obj);
         response.redirect('./invoice.html?' + params.toString());
         return;
      } else {
         //output password doesnt match
         errors['login_err'] = `Wrong Password`;
      }
   } else {
      //output email doesn't exist
      errors['login_err'] = `Wrong Email`;
   }
   //redirect to login with error message
   let params = new URLSearchParams(errors);
   params.append('email', user_email); //put username into params
   response.redirect(`./login.html?` + params.toString());
});

/*----------------REGISTRATION PAGE--------------*/
//regex from assignment 2 resources
app.post("/register", function (request, response) {
   var registration_errors = {};
   //check email
   var reg_email = request.body['email'].toLowerCase();

   //check email fomaatting 'xxx@yyy.com'
   if (/^[a-zA-Z0-9._]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,3}$/.test(request.body.email) == false) {
      registration_errors['email'] = `Please enter a valid email`;
      //console.log(registration_errors['email']);
   } else if (reg_email.length == 0) {
      registration_errors['email'] = `Enter an email`;
   }

   //unique email?
   if (typeof users[reg_email] != 'undefined') {
      registration_errors['email'] = `This email has already been registered`;
   }

   //password greater than 8 characters?
   if (request.body.password.length < 8) {
      registration_errors['password'] = `Minimum 8 characters`;
   } else if (request.body.password.length == 0) { //nothing entered
      registration_errors['password'] = `Enter a password`;
   }

   //check repeated password for matches
   if (request.body['password'] != request.body['repeat_password']) {
      registration_errors['repeat_password'] = `The passwords do not match`;
   }

   //full name validation
   if (/^[A-Za-z, ]+$/.test(request.body['fullname'])) {
      //check if the fullname is correct   
   } else {
      registration_errors['fullname'] = `Please enter your full name`;
   }
   //check if fullname is less than 30 characters
   if (request.body['fullname'].length > 30) {
      registration_errors['fullname'] = `Please enter less than 30 characters`;
   }

   //assignment 2 code examples
   //save new registration data to user_data.json
   if (Object.keys(registration_errors).length == 0) {
      console.log('no registration errors')//store user data in json file
      users[reg_email] = {};
      users[reg_email].password = request.body.password;
      users[reg_email].name = request.body.fullname;

      fs.writeFileSync(filename, JSON.stringify(users), "utf-8");

      qty_data_obj['email'] = reg_email;
      qty_data_obj['fullname'] = users[reg_email]['fullname'];
      let params = new URLSearchParams(qty_data_obj);
      response.redirect('./invoice.html?' + params.toString()); //all good! => to invoice w/data
   } else {
      request.body['registration_errors'] = JSON.stringify(registration_errors);
      let params = new URLSearchParams(request.body);
      response.redirect("./registration.html?" + params.toString());
   }
});

/* -------------Changing user's data -----------------*/
app.post("/newpw", function (request, response) { //modified from Tiffany Young
   var reseterrors = {};

   let login_email = request.body['email'].toLowerCase();
   let login_password = request.body['password'];

   if (/^[a-zA-Z0-9._]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,3}$/.test(login_email) == false) {
      reseterrors['email'] = `Please enter a valid email`;
   } else if (login_email.length == 0) {
      reseterrors['email'] = 'Please enter an email';
   }
   //check repeated password for matches
   if (request.body['newpassword'] != request.body['repeatnewpassword']) {
      reseterrors['repeatnewpassword'] = `The new passwords do not match`;
   }

   if (typeof users[login_email] != 'undefined') {
      if (users[login_email].password == login_password) {
         //validate password > 8 characters
         if (request.body.newpassword.length < 8) {
            reseterrors['newpassword'] = 'Password must have a minimum of 8 characters.';
         }//validate password is correct
         if (users[login_email].password != login_password) {
            reseterrors['password'] = 'Incorrect password';
         }
         //validate both passwords entered are correct
         if (request.body.newpassword != request.body.repeatnewpassword) {
            reseterrors['repeatnewpassword'] = 'Both passwords must match';
         }//validate new password =/= old password
         if (request.body.newpassword || request.body.repeatnewpassword == login_password) {
            reseterrors['newpassword'] = `New password cannot be the same as the old password`;
         }
      } else { //password error output
         reseterrors['password'] = `Incorrect Password`;
      }
   } else { //email error output
      reseterrors['email'] = `Email has not been registered`;
   }

   if (Object.keys(reseterrors).length == 0) {
      //Write data and send to invoice.html
      users[login_email] = {};
      users[login_email].password = request.body.newpassword

      //Writes user information into file
      fs.writeFileSync(filename, JSON.stringify(users), "utf-8");

      //Add email to query
      qty_data_obj['email'] = login_email;
      qty_data_obj['fullname'] = users[login_email]['fullname'];
      let params = new URLSearchParams(qty_data_obj);
      response.redirect('./invoice.html?' + params.toString()); //all good! => to invoice w/data
      return;
   } else {
      //If there are errors, send back to page with errors
      request.body['reseterrors'] = JSON.stringify(reseterrors);
      let params = new URLSearchParams(request.body);
      response.redirect(`./update_info.html?` + params.toString());
   }
});

//products data
app.get("/products.js", function (request, response, next) {
   response.type('.js');
   var products_str = `var products = ${JSON.stringify(products)};`;
   response.send(products_str);
});

// monitor all requests
app.all('*', function (request, response, next) {
   console.log(request.method + ' to ' + request.path);
   next();
});

/* -------------------- PURCHASE PROCESS-----------------*/
// process purchase request (validate quantities, check quantity available)
app.post('/process_form', function (request, response, next) {
   var quantities = request.body['quantity'];
   //assume no errors or no quantity
   var errors = {};
   var check_quantities = false;
   //check for NonNegInt
   for (i in quantities) {
      if (isNonNegInt(quantities[i]) == false) { //check i quantity
         errors['quantity_' + i] = `Please choose a valid quantity for ${products[i].item}.`;
      }
      if (quantities[i] > 0) { //validate if any quantity is selected
         check_quantities = true;
      }
      if (quantities[i] > products[i].quantity_available) { //validate quantity is available
         errors['quantity_available' + i] = `We don't have ${(quantities[i])} ${products[i].item} available.`;
      }
   }
   if (!check_quantities) { //validate quantity selected
      errors['no_quantities'] = `Please select a quantity`;
   }

   let qty_obj = { "quantity": JSON.stringify(quantities) };
   if (Object.keys(errors).length == 0) {
      // remove quantities purchased from inventory quantities
      for (i in products) {
         products[i].quantity_available -= Number(quantities[i]);
      }
      //save quantity data for invoice
      qty_data_obj = qty_obj;
      response.redirect('./login.html');
   }
   else { //if i have errors, take the errors and go back to shop.html
      let errs_obj = { "errors": JSON.stringify(errors) };
      console.log(qs.stringify(qty_obj));
      response.redirect('./shop.html?' + qs.stringify(qty_obj) + '&' + qs.stringify(errs_obj));
   }
});

// route all other GET requests to files in public 
app.use(express.static(__dirname + '/public'));

// start server
app.listen(8080, () => console.log(`listening on port 8080`));
