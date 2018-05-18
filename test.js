const testFolder = './';
const fs = require('fs');
const mysql = require('mysql');

var OHLC = [];
var filenames = [];
var data = [];

var connection = mysql.createConnection({
	host : 'localhost',
	user : 'root',
	password : 'secret',
	database : 'my_db'
});

function main(){

	connection.connect(function(err){
		if(err){
			console.log(err.stack);
			return;
		}
		console.log("Successfully connected.");
	});

	readFiles();

	insertIntoDB();

	connection.end();
}

function insertIntoDB() {
	OHLC.forEach(data => {
		console.log(data);
	});
}

function readFiles(){

	var readPromise = new Promise(function(resolve, reject){
		fs.readdir(testFolder, (err, files) => {

			var timestamp = files[0].split('_');
			timestamp = timestamp[0];

			files.forEach(file => {
				temp = file.split('_');

				if(temp[0] == timestamp){
					filenames.push(file);
				}
			});

			filenames.forEach(filename => {
				formatter(filename);
			});	

		});
		resolve("done reading.")
	});

	readPromise.then(function(val){
		console.log(val);
		insertIntoDB();
	}).catch(function(reason){
		console.log("catch: " + reason);
	});

}

function formatter(filename) {

	var myPromise = new Promise(function(resolve, reject){
		fs.readFile(filename, function(err, data) {
			if(err) {
				console.log(err);
			} else {

			var contents = data.toString();

				contents = contents.replace('[[', '');
				contents = contents.replace(']]' , '');
				contents = contents.split('],[');

				for (var i = 0; i < contents.length; i++){

					temp = contents[i].split(',');

					var pair = filename.split('_')[1];
					var open = temp[1].replace(/"/g, '');
					var close = temp[5].replace(/"/g, '');

					OHLC.push({
						Pair :  pair,
						Open_Time : temp[0].replace(/"/g, ''),
						Open : open,
						High : temp[2].replace(/"/g, ''),
						Low : temp[4].replace(/"/g, ''),
						Close : close,
						Volume : temp[6].replace(/"/g, ''),
						Close_Time : temp[7].replace(/"/g, ''),
						Quote_Asset_Volume : temp[8].replace(/"/g, ''),
						Number_of_Trades : temp[9].replace(/"/g, ''),
						Taker_by_base_asset_volume : temp[10].replace(/"/g, '')
					});

					resolve();
				}
			}
		});
	});

	myPromise.then(function(){
		console.log("done.");

	}).catch(function(reason){
		console.log("catch: " + reason);
	});
}

main();





// connection.query('INSERT INTO pairs (pair, open, close) VALUES (' + pair + ', ' + open  +' , ' + close + ');', function(error, results, fields){
// 	if(error){
// 		console.log(error);
// 	}
// 	console.log(results);
// });