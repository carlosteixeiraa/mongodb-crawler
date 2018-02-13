var Spider = require('node-spider'),
    mongoose = require('mongoose'),
    express = require('express'),
    app = express(),
    porta = 3020;

var spider = new Spider({
	concurrent: 5,
	delay: 1,
	logs: process.stderr,
	allowDuplicates: false,
	catchErrors: true,
	addReferrer: false,
	xhr: false,
	keepAlive: false,
	error: (err, url) => {
	},
	done: () => {
	},

	headers: { 'user-agent': 'mongodb-crawler' },
	encoding: 'utf8'
});

mongoose.connect('mongodb://localhost:27017/crawler', () => {
    console.log('Base de dados ligada.')
});

var urlschema = new mongoose.Schema({
    url:  {
        type: String,
        unique: true
    },
    date: { 
        type: Date, 
        default: Date.now 
    },
});

var Url = mongoose.model('urls', urlschema);

var pedido = (doc) => {
	console.log(doc.res);
    console.log(doc.url);
    
	doc.$('a').each((i, elem) => {
    
        var href = doc.$(elem).attr('href').split('#')[0];
        var url = doc.resolve(href);
            
        var novoUrl = new Url();

        novoUrl.url = url;

        novoUrl.save((err) => {
            if(err) {
                console.log(err);
            } else {
                spider.queue(url, pedido);
            }
        })
    
    });

};

app.get('/', (req, res) => {
    Url.find((err, Urls) => {
        if (err) {
            console.error(err);
        } else {
            res.send(Urls);
        }
    }); 
})

app.listen(porta, () => {
    console.log('Servidor ligado.');
})

app.get('/ligar', (req, res) => {
    var linkq = req.query.link;

    spider.queue(linkq, pedido);

    res.redirect('ooon.online:3020');
})
