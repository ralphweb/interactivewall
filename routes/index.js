var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
var request = require('request');
var path = require('path');

// Connection URL
const url = 'mongodb://localhost:27017';
const systemdb = 'SH-dev';
const fetchdb = 'sh-fetch';

router.get('/:topic/rrss', function(req, res, next) {
	var topic = req.params.topic;
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

router.get('/rrss/get/inbox/:page?/:size?', function(req, res, next) {
	var page = req.params.page;
	var size = req.params.size;
	MongoClient.connect(url, function(err, client) {
	  const collection = client.db(fetchdb).collection('statuses');
	  if(page!=undefined&&size!=undefined) {
  		  collection.find({"selected":false,"hidden":false,"created_at":{"$type":9}}).limit(parseInt(size)).skip(parseInt(page)*parseInt(size)).sort({"created_at":-1}).toArray(function(err,docs) {
  	  	  	res.status(200).send(docs);
  	  	  });
	  } else {
  		  collection.find({"selected":false,"hidden":false,"created_at":{"$type":9}}).sort({"created_at":-1}).toArray(function(err,docs) {
  	  	  	res.status(200).send(docs);
  	  	  	docs.forEach(function(doc) {
  	  	  		doc.created_at=new Date(doc.created_at);
  	  	  		console.log(doc.created_at);
  	  	  		collection.save(doc); 
  	  	  	})
  	  	  });
	  }
	  //client.close();
	});
});

router.get('/rrss/:topic/get/inbox/:page?/:size?', function(req, res, next) {
	var page = req.params.page;
	var size = req.params.size;
	var topic = req.params.topic;
	MongoClient.connect(url, function(err, client) {
	  const collection = client.db(fetchdb).collection('statuses');
	  if(page!=undefined&&size!=undefined) {
  		  collection.find({"topic":topic,"selected":false,"hidden":false,"created_at":{"$type":9}}).limit(parseInt(size)).skip(parseInt(page)*parseInt(size)).sort({"created_at":-1}).toArray(function(err,docs) {
  	  	  	res.status(200).send(docs);
  	  	  });
	  } else {
  		  collection.find({"topic":topic,"selected":false,"hidden":false,"created_at":{"$type":9}}).sort({"created_at":-1}).toArray(function(err,docs) {
  	  	  	res.status(200).send(docs);
  	  	  	docs.forEach(function(doc) {
  	  	  		doc.created_at=new Date(doc.created_at);
  	  	  		console.log(doc.created_at);
  	  	  		collection.save(doc); 
  	  	  	})
  	  	  });
	  }
	  //client.close();
	});
});

router.get('/rrss/get/selected/:page?/:size?', function(req, res, next) {
	var page = req.params.page;
	var size = req.params.size;
	MongoClient.connect(url, function(err, client) {
	  const collection = client.db(fetchdb).collection('statuses');
	  if(page!=undefined&&size!=undefined) {
  		  collection.find({"selected":true,"hidden":false,"created_at":{"$type":9}}).limit(parseInt(size)).skip(parseInt(page)*parseInt(size)).toArray(function(err,docs) {
  	  	  	res.status(200).send(docs);
  	  	  });
	  } else {
  		  collection.find({"selected":true,"hidden":false,"created_at":{"$type":9}}).toArray(function(err,docs) {
  	  	  	res.status(200).send(docs);
  	  	  });
	  }
	  client.close();
	});
});

router.get('/rrss/:topic/get/selected/:page?/:size?', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
	var page = req.params.page;
	var size = req.params.size;
	var topic = req.params.topic;
	MongoClient.connect(url, function(err, client) {
	  const collection = client.db(fetchdb).collection('statuses');
	  if(page!=undefined&&size!=undefined) {
  		  collection.find({"topics":topic,"selected":true,"hidden":false})/*.sort({"order":1})*/.limit(parseInt(size)).skip(parseInt(page)*parseInt(size)).toArray(function(err,docs) {
  	  	  	res.status(200).send(docs);
  	  	  });
	  } else {
  		  collection.find({"topics":topic,"selected":true,"hidden":false})/*.sort({"order":1})*/.toArray(function(err,docs) {
  	  	  	res.status(200).send(docs);
  	  	  });
	  }
	  client.close();
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

router.post('/rrss/:topic/post/update/:status?/:field?/:value?', function(req, res, next) {
	///rrss/alangulo/post/update/1005917258114269184/selected/true
	res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
	var status = req.params.status;
	var field = req.params.field;
	var topic = req.params.topic;
	var value = isNaN(parseInt(req.params.value))?(req.params.value == 'true'):parseInt(req.params.value);
	var statusJSON = req.body.status!=undefined?JSON.parse(req.body.status):undefined;
	console.log(status);
	console.log(field);
	console.log(value);
	MongoClient.connect(url, function(err, client) {
	  const collection = client.db(fetchdb).collection('statuses');
	  if(status!=undefined&&field!=undefined&&value!=undefined) {
	  	  //todos los campos se recibieron correctamente
	  	  switch(field) {
	  	  	case 'hidden':
  			  collection.updateOne({"_id":status},{$set:{"hidden":value}},function(err,docs) {
  		  	  	res.status(200).send(docs);
  		  	  });
  		  	  break;
  		  	case 'selected':
				collection.updateOne({"_id":status},{$set:{"selected":value}},function(err,docs) {
					res.status(200).send(docs);
				});
	  		  	break;
   		  	case 'order':
 				collection.updateOne({"_id":status},{$set:{"order":value}},function(err,docs) {
 					res.status(200).send(docs);
 				});
 	  		  	break;
	  	  }
	  } else if(statusJSON!=undefined) {
	  	try {
		  collection.replaceOne({"_id":statusJSON._id},statusJSON);
		  res.status(200).send({replaced:true});
	  	} catch(e) {
	  	  res.status(500).send(e);
	  	}
	  }
	  client.close();
	});
});

/* GET home page. */
router.get('/:topic', function(req, res, next) {
	var topic = req.params.topic;
  res.render('videowall', { topic:topic, title: 'Social-hound | Videowall',layout:'blank_layout' });
});

module.exports = router;
