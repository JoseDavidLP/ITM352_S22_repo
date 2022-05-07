

// This function asks the server for a "service" and converts the response to text. 


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
var app = express();


var products_data = require(__dirname + '/products.json');

//E3.js LAB 15 COOKIE and sessions
var cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
var session = require('express-session');
app.use(session({secret: "MySecretKey", resave: true, saveUninitialized: true}));
//nodemailer https://www.w3schools.com/nodejs/nodejs_email.asp
var nodemailer = require('nodemailer');

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

app.all('*', function (request, response, next) {
   console.log(`Got a ${request.method} to path ${request.path}`);
   // need to initialize an object to store the cart in the session. We do it when there is any request so that we don't have to check it exists
   // anytime it's used
   if(typeof request.session.cart == 'undefined') { 
      request.session.cart = {};
    } 
      var backURL=request.header('referer') || "/";
      if (backURL.includes("login") == false && backURL.includes("regist") == false && backURL.includes("newpw") == false && backURL.includes("update_info") == false) {
         request.session.lastpage = backURL;
      }
      console.log(request.session.lastpage,backURL );

   next();
});


app.post("/get_products_data", function (request, response) {
   response.json(products_data);
});


app.post("/add_to_cart", function(request, response) {
      // code below got inspiration from Brandon Marcos
    console.log(request.body);
    let params = new URLSearchParams(request.body);
    // turn request body into usable variables
    var product_key = request.body['products_key'];
    var quantity_submit = request.body['quantity'];

    // assume 0 errors
    var errors = {};

    // now to validate the submitted quantities
    // This checks for whether it passes the isNonNegInt or if we have quantities available or not
    for (i in products_data[product_key]) {
        let q = quantity_submit[i];
        if (isNonNegInt(q) == false) {
            errors[`quantity[${i}]`] = `${q} is not a valid quantity!`;
        } else {
            if (q > products_data[product_key][i]['quantity_available']) {
                errors[`quantity[${i}]`] = `We don't ${q} in stock!`;
            }
        }
    }
    if (Object.keys(errors).length === 0) {
      if (typeof request.session.cart == 'undefined') {
          // establishes a cart if there isn't one in the session
          request.session.cart = {};
      }
      if (typeof request.session.cart[product_key] == 'undefined') {
          // this creates an array in the cart based on the product_key and fills the entirety of it with 0
          request.session.cart[product_key] = new Array(quantity_submit.length).fill(0);
      }
      for (i in request.session.cart[product_key]) {
          // this adds the submitted quantities to the array based on the product key
          request.session.cart[product_key][i] += Number(quantity_submit[i]);
      }
  } else {
      // this is for when theres errors, takes the qty data and error data and puts it into the params and sends it back
      params.append('qty_data', JSON.stringify(request.body));
      params.append('qty_errors', JSON.stringify(errors));
  }
   console.log(request.session);
   response.redirect(`display_products.html?products_key=${product_key}`);
   
});


// This will be used when ever a site needs to get info from the session like the cart or usrname
app.get("/session_data.js", function (request, response, next) {
   response.type('.js');
   // declare a shopping cart if there isn't one
   if (typeof request.session.cart == 'undefined') {
       request.session.cart = {};
   }
   // now to declare the username, email, name 
   // Gonna keep all the data into one long Javascript string with the data as variables
   var session_str = `var user_name = ${JSON.stringify(request.session.name)}; var user_email = ${JSON.stringify(request.session.email)}; var cart_data = ${JSON.stringify(request.session.cart)};`;
   // send the client the session string
   response.send(session_str);
})

app.post("/get_cart", function (request, response) {
   response.json(request.session.cart);

});

app.post("/cart_update", function (request, response, next) {
   console.log(request.body);
   for (product_key in request.session.cart) {
       for (i in request.session.cart[product_key]) {
           // this is to basically skip quantities that are 0
           // because if there is a 0, it creates a blank field in the cart, and thats an error
           if (request.session.cart[product_key][i] == 0) {
               continue;
           }
           request.session.cart[product_key][i] = Number(request.body[`cart_update_${product_key}_${i}`]);
       }
   }
   console.log(request.session);

   response.redirect("./cart.html");
});

app.post("/cart_checkout", function (request, response) {
   var user_info= JSON.parse(request.cookies["user_info"]);
  // Generate HTML invoice string / this is just to keep the webpage consistant in all pages
  if (user_info["name"] == 'undefined') {
   console.log(`username NOT found`);
   response.redirect('/cart.html?NotLoggedIn');
} else {
console.log(`found a username`);
//test to see if it is working
console.log(user_info["name"]);
    var invoice_str = ` 
</div>Thank you for your order ${user_info["name"]}!<table border><th>Quantity</th><th>Item</th>`;
    var shopping_cart = request.session.cart;
    
    for(product_key in products_data) {
      for(i=0; i<products_data[product_key].length; i++) {
          if(typeof shopping_cart[product_key] == 'undefined') continue;
          qty = shopping_cart[product_key][i];
          if(qty > 0) {
            invoice_str += `<tr><td>${qty}</td><td>${products_data[product_key][i].item}</td><tr>  `;
          }
      }
  }
    invoice_str += '</table>';
    
  // Set up mail server. Only will work on UH Network due to security restrictions
    var transporter = nodemailer.createTransport({
      host: "mail.hawaii.edu",
      port: 25,
      secure: false, // use TLS
      tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false
      }
    });
  
    var user_email = user_info["email"];
    var mailOptions = {
      from: 'phoney_store@bogus.com',
      to: user_email,
      subject: 'Your phoney invoice',
      html: invoice_str
    };
    console.log(user_email);
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        invoice_str += '<br>There was an error and your invoice could not be emailed';
      } else {
        invoice_str += `<br>Your invoice was mailed to ${user_email}`;
      }
      response.redirect(`./invoice.html`);
    });
}
  });

  app.post("/exitinvoice", function (request, response) {
   console.log('got the exit');
   request.session.cart = {};
   console.log(request.session.cart);
   response.redirect('./index.html');
})
  

/* ------------------LOGIN FORM------------- */
app.post("/process_login", function (request, response) { //modified from Tiffany Young
   var errors = {};
   //login form info from post
   var user_email = request.body['email'].toLowerCase();
   var the_password = request.body['password']
   var login_username = request.body['name']
   //check if username exists, then if entered password matches, lab 13 ex3-4
   if (typeof users[user_email] != 'undefined') {
      //check if entered password matches the stored password
      if (users[user_email].password == the_password) {
         //matches
         qty_data_obj['email'] = user_email;
         qty_data_obj['fullname'] = users[user_email].name;
          //Gets variable for cookie to display username on pages
          var user_info = { "email": user_email, "name": qty_data_obj['fullname'], };
          //Gives cookie a expiration time
          response.cookie('user_info', JSON.stringify(user_info), { maxAge: 30 * 60 * 1000 });
         //direct to invoice page **need to keep data
         let params = new URLSearchParams(qty_data_obj);
         console.log(user_info);
  response.redirect(request.session.lastpage);


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
   response.redirect(`./login.html?`);
});

/* ------------------LOGOUT FORM------------- */
app.get("/logout", function (request, response) { //Gets the get request to use logout function
   var user_info = request.cookies["user_info"]; // makes user info javascript so it can be defined 
   console.log(JSON.stringify(user_info));
   if (user_info != undefined) {
       var username = user_info["name"]; //checks to see whos logged in, needed to see if any user is logged in

       logout_msg = `<script>alert('You have logged out! Log back in to continue shopping.'); location.href="./index.html";</script>`; //redirects to index, start of store
       response.clearCookie('user_info'); //destroys cookie and user information
       response.send(logout_msg); //if logged out, send message to user
       request.session.destroy();
       

   } else { //if no user is logged in, then display error message & redirect to index (store entry)
       console.log("in here");
       logouterror_msg = `<script>alert("You are not logged in."); location.href="./index.html";</script>`;
       response.send(logouterror_msg);

   }
});

/*----------------REGISTRATION PAGE--------------*/
//regex from assignment 2 resources
app.post("/register", function (request, response) { //modified from Tiffany Young
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
      response.redirect('./display_products.html?products_key=Whiskey'); //all good! => to whiskey page
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
app.post('/process_form', function (request, response, next) { //modified from Tiffany Young
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
      response.redirect('./display_products.html?' + qs.stringify(qty_obj) + '&' + qs.stringify(errs_obj));
   }
});



// route all other GET requests to files in public 
app.use(express.static(__dirname + '/public'));

// start server
app.listen(8080, () => console.log(`listening on port 8080`));
