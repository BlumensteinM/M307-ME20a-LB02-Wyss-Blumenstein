var express = require('express');
var app = express();
var fs = require("fs");
const cors = require('cors');

app.use(cors({ origin: '*' }));

app.use(express.json());

const phoneValid = /^[\+]?[0-9\(\)\s-\\]*$/;
const emailValid = /^\w+(([\.\-\+]|--)?\w+)*@\w+(([\.-]|--)?\w+)*(\.\w{2,20})+$/;

let countries = [];
fs.readFile(__dirname + "/" + "countries.json", (err, data) => {
    if (err) throw err;
    countries = JSON.parse(data);
    console.log('Countries preloaded from countries.json.');
});

app.get('/contacts', function (req, res) {
   fs.readFile( __dirname + "/" + "contacts.json", 'utf8', function (err, data) {
      console.log( 'returning contacts.json' );
      res.end( data );
   });
})
app.post('/contacts', function (req, res) {
    console.log('body = ' + JSON.stringify(req.body));

    // Validations
    const errors = [];
    if (!req.body.firstname) {
        errors.push( 'Please provide a firstname.' );
    }
    if (!req.body.lastname) {
        errors.push( 'Please provide a lastname.' );
    }
    if (req.body.country && !countries.find(country => country.name.common == req.body.country)) {
        errors.push(`"${req.body.country}" is not an officially known country name.`);
    }
    if (!req.body.email) {
        errors.push(`Please provide an email.`);
    } else if (!emailValid.test(req.body.email)) {
        errors.push(`"${req.body.email}" is not a correct email address.`);
    }
    if (!req.body.phone) {
        errors.push(`Please provide an phone nr.`);
    } else if (!phoneValid.test(req.body.phone)) {
        errors.push(`"${req.body.phone}" is not a correct phone nr.`);
    }
    if (req.body.subject && req.body.subject.length < 10) {
        errors.push( 'Subject must be at least 10 characters long.' );
    }
    if (errors.length > 0) {
        const errorMessages = errors.join('\n');
        console.log('Validierungsfehler:\n', errorMessages);
        res.status(400).send({ message: errorMessages });
        return;
    }

    // Save to contacts file
    const contacts = JSON.parse(fs.readFileSync(__dirname + "/" + "contacts.json", 'utf8'));
    contacts.push(req.body);
    fs.writeFile(__dirname + "/" + "contacts.json", JSON.stringify(contacts, undefined, 2) || '[]', () => {
        console.log('File written');
        res.send("{ \"result\": true }");
    });

});

var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("Example app listening at http://%s:%s", host, port)
})