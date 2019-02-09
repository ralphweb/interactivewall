var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
var request = require('request');
var path = require('path');

var cache = {maxID:"none"};

var api ="https://127.0.0.1:9001";

// Connection URL
const url = 'mongodb://159.65.70.51:27017';
const systemdb = 'sh-system';
const fetchdb = 'sh-fetch';

router.get('/:topic/rrss', function(req, res, next) {
	var topic = req.params.topic;
	cache.maxID = "none";

	MongoClient.connect(url, function(err, client) {
		const collection = client.db(systemdb).collection('topics');
		  collection.find({"shortname":topic}).toArray(function(err,docs) {
	  	  	res.render('rrss', { topic:topic, title: docs[0].name+' | Redes Sociales',layout:'layout_rrss',hashtag:docs[0].shortname });
	  	  });
	})
});

router.get('/:topic/sorteo/:size?/:busqueda', function(req, res, next) {
	var topic = req.params.topic;
	var search = req.params.busqueda;
	var size = req.params.size!=undefined?req.params.size:5;
	MongoClient.connect(url, function(err, client) {
		const collection = client.db(systemdb).collection('topics');
		  collection.find({"name":topic}).toArray(function(err,docs) {
	  	  	res.render('sorteo', { size:size, topic:topic, title: docs[0].title+' | Sorteo '+search,layout:'blank_layout',hashtag:docs[0].title,search:search });
	  	  });
	})
});

router.get('/:topic/control', function(req, res, next) {
	var topic = req.params.topic;
	res.render('control', { topic:topic, title: 'Social-hound | Control',layout:'blank_layout' });
});

router.get('/rrss/reset/cacheID',function(req, res, next){
    cache.maxID = "none";
    res.json({status:"success"});
});

router.get('/rrss/:topic/get/inbox/:search?/:page/:size', function(req, res, next) {
    var page = req.params.page;
    var size = req.params.size;
    var topic = req.params.topic;
    var _maxID= cache.maxID || "none";
    let _url ;
    if (req.params.search===undefined){
        _url = api+'/'+topic+'/inbox/'+_maxID+"/"+page+"/"+size+"/";
    }else{
        _url = api+'/'+topic+'/inbox/'+req.params.search+'/'+_maxID+"/"+page+"/"+size+"/";
    }
    var options = { method: 'GET',
        url: _url,
        headers:
            { 'cache-control': 'no-cache' } };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);
       var result = JSON.parse(body);
       cache.maxID = result.maxID;
        res.status(200).json(result.data);
    });
});

router.get('/rrss/:topic/get/selected/:page?/:size?', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    var page = req.params.page;
    var size = req.params.size;
    var topic = req.params.topic;

    var options = { method: 'GET',
        url: api+'/'+topic+'/mentions/selected/true/hidden/false',
        headers:
            { 'cache-control': 'no-cache' } };
    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        //console.log(response);
        res.status(200).json(JSON.parse(body));
        // console.log(body);
    });

});

router.post('/rrss/post/update-media/:status/:media/:show?', function(req, res, next) {
	var status = req.params.status;
	var media = decodeURIComponent(req.params.media);
	var show = (req.params.show == 'true');

	MongoClient.connect(url, function(err, client) {
	  const collection = client.db(fetchdb).collection('statuses');
	  collection.updateOne({"id_str":status,"extended_entities.media.media_url":media},{$set:{"extended_entities.media.$.show":show}},function(err,docs) {
  	  	res.status(200).send(docs);
  	  });
	  client.close();
	});
});

router.get('/rrss/:topic/get/mention/:search', function(req, res, next) {
	var topic = req.params.topic;
	var search = decodeURIComponent(req.params.search);

	MongoClient.connect(url, function(err, client) {
	  const collection = client.db(fetchdb).collection('statuses');
	  collection.find({ "topic":topic,"$text": { "$search": search } }).toArray(function(err,docs) {
  	  	res.status(200).send(docs);
  	  	//client.close();
  	  });
	});
});

router.get('/rrss/:topic/get/contest/:search', function(req, res, next) {
	var topic = req.params.topic;
	var search = decodeURIComponent(req.params.search);
	MongoClient.connect(url, function(err, client) {
	  const collection = client.db(fetchdb).collection('statuses');
	  collection.createIndex( { "text": "text" } );
	  collection.aggregate({ $match: { "$text": { "$search": "\""+search+"\" -RT" } } },
	  	{ $match: {"topic":topic}},
	  	{ $group : { "_id" : { "user": "$user.screen_name", "name": "$user.name", "profile_pic": "$user.profile_image_url_https" }, "count": { "$sum": 1 },"text": { "$push": {"text":"$text","created_at":"$created_at","id_str":"$id_str"} }}},
	  	{ $sort :{ count: -1 }},
	  	{ $skip: 0 },
    	{ $limit: 3 }).toArray(function(err,docs) {
	  		docs.sort(function(a,b) {
	  			return b.count-a.count
	  		});
  	  		res.status(200).send(docs);
  	  	//client.close();
  	  });
	});
});

router.post('/rrss/post/update/:status?/:field?/:value?', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    var status = req.params.status;
    var field = req.params.field;
    //invocar a update

    var value = isNaN(parseInt(req.params.value))?(req.params.value == 'true'):parseInt(req.params.value);
    var statusJSON = req.body.status!=undefined?JSON.parse(req.body.status):undefined;
    console.log(status);
    console.log(field);
    console.log(value);

    ///1061718297840967680/hidden/true
    var url =api+"/"+status;
    if(status!=undefined&&field!=undefined&&value!=undefined) {

        switch (field) {
            case 'hidden':
                url += "/hidden/" + value;
                break;
            case 'selected':
                url += "/selected/" + value;
                break;
            case 'order':
                url += "/order/" + value;
                break;
        }

        var options = {
            method: 'PUT',
            url: url,
            headers:
                {'cache-control': 'no-cache'}
        };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);
            // console.log(response);
            res.status(200).json({detail: JSON.parse(body)});
            // console.log(body);
        });
    }else{
    		res.status(404).json({status:'error', code:404});
		}
});

/* GET home page. */
router.get('/:topic', function(req, res, next) {
	var topic = req.params.topic;
  res.render('videowall', { topic:topic, title: 'Social-hound | Videowall',layout:'blank_layout' });
});

/* GET home page. */
router.get('/:topic/map', function(req, res, next) {
    var topic = req.params.topic;
  res.render('mapa3d', { topic:topic, title: 'Social-hound | Mapa',layout:'blank_layout' });
});

module.exports = router;
