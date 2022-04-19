const { response } = require('express');
var express = require('express');
var app = express();
app.use(express.urlencoded({ extended: true }));

app.get('/', function(req, res) {
    res.send(`
        <form action="/process_form" method="POST">
            Name1: <input name></input>
            Name2: <input name></input>
            <input type="submit" name="Submit" value="Send POST Request">
        </form>
        `);
});

app.post("/process_form", function(req, res) {
    if (typeof req.body["Submit"] != "undefined") {
        for (value in req.body) {
                if (value == "Tyler") {
                    res.send("Found him!")
                } else {
                    res.send("I couldn't find Tyler :(")
                }
            }
        }
    }
);

app.listen(8080, () => console.log(`listening on port 8080`));