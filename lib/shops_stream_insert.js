// const connectionString = 'mongodb://admin:admin@ds055575.mlab.com:55575/soc';
const connectionString = 'mongodb://localhost/soc',
	fileName = '/home/vinzee/code/soc/places_dump_US',
	modelName = 'shop',
	_ = require('underscore-node'),
	mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	fs = require('fs'),
	connection = mongoose.connect(connectionString);
	readline = require('readline'),
    stream = require('stream');

mongoose.Promise = global.Promise;

const shopSchema = new Schema({
	coordinates: { type: [Number], index: '2dsphere', required: true }
},{ strict: false });
const Shop = connection.model(modelName, shopSchema);

var instream = fs.createReadStream(fileName+'.geojson');
var outstream = new stream;
outstream.readable = true;
outstream.writable = true;

var rl = readline.createInterface({
    input: instream,
    output: outstream,
    terminal: false
});

Shop.remove({}, function(err) {
    if (err) console.log(err)
    else{
    	console.log('all documents dropped');
    	var i = 0;

		rl.on('line', function(line) {
		    // console.log(line);

			var old_json = JSON.parse(line);
			var new_json = {};
			new_json.extras = {};

			new_json.coordinates = old_json.geometry.coordinates;
			new_json.type = old_json.type;
			_.each(old_json.properties.classifiers[0], function(v, k){
				new_json[k] = v;
			});
			delete old_json.properties.classifiers;

			_.each(old_json.properties, function(v, k){
				new_json[k] = v;
			});

			delete old_json.geometry.coordinates;
			delete old_json.type;
			delete old_json.properties;

			new_json.extras = old_json;
			var new_shop = new Shop(new_json, false);
			new_shop.save(function (err) {
			  i = i+1;
			  if (err) console.log(i, "Insert Error : ", err);
			  else console.log(i, 'Inserted ');
			});
		});
    }
});