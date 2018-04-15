var fs = require('fs'); // require the fs, filesystem module
const CSVFILE = process.argv[2];
var transactions = [];
var moment = require('moment');
moment().toDate();
var data = '';

var startDate = moment(process.argv[3], 'DD/MM/YYYY');
var endDate = moment(process.argv[4], 'DD/MM/YYYY');

function displaytransaction(transaction) {
    console.log('Date: ' + transaction.date.format('DD/MM/YYYY'));
    console.log('Description: ' + transaction.description);
    console.log('Amount: ' + transaction.amount + '\n');
}

function parseText(data) {
    var dateIndex = data.match(/Date:.*(?=\s)/);
    //var descriptionIndex = data.match(/Description:.*(?=\s)/);
    var descriptionIndex = data.match(/Description:.*\s/);
    var amountIndex = data.match(/Amount:.*\.[0-9]{2}/);

    while (dateIndex && descriptionIndex && amountIndex) {
        var transactionDate = moment(dateIndex[0], 'DD/MM/YYYY');
        transactionDate.isValid();
        var transactionDescription = descriptionIndex[0].slice(13);
        var transactionAmount = parseFloat(amountIndex[0].slice(8));

        data = data.slice(amountIndex.index + 1);

        transactions.push({ date: transactionDate, description: transactionDescription, amount: transactionAmount });

        dateIndex = data.match(/Date:.*(?=\s)/);
        descriptionIndex = data.match(/Description:.*(?=\s)/);
        amountIndex = data.match(/Amount:.*\.[0-9]{2}/);
    }

    calculate(transactions, startDate, endDate);
}

function calculate(transactions, startDate, endDate) {
    var input = 0;
    var output = 0;
    transactions.map(transaction => {
        if (transaction.date.isBetween(startDate, endDate, null, '[]')) {
            displaytransaction(transaction);
            transaction.amount >= 0 ? (input += transaction.amount) : (output += transaction.amount);
        }
    });
    console.log('in: ' + input + '\n' + 'out: ' + output + '\n' + 'net: ' + (input + output + 200));
}

var stream = fs.createReadStream(CSVFILE);

stream
    .on('data', function(chunk) {
        data += chunk;
    })
    .on('end', function() {
        parseText(data);
    });

//stream.pipe(csvStream);
