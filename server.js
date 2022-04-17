require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// ============================================
// do my work
// pthieu1 16.04.2022
const repository = require('./repository.js');

/**
 * api create url shortener 
 */
app.post("/api/shorturl", (req, res) => {
  try {
    let urlObj = new URL(req.body.url);

    dns.lookup(urlObj.host, (err, address, family) => {
      if(err) {
        res.json({error: "invalid url"});
        return;
      }
      // check if the url is existed
      repository.findDocByUrl(urlObj.href, (err, doc) => {
        if(err) {
          res.json({error: err});
          return;
        } 

        // if exist
        if(doc) {
          res.json({ 
            original_url : urlObj.href, 
            short_url : doc.short
          });
          return;
        }

        // if not exist
        repository.createShortUrl(urlObj.href, urlObj.host, address, family, function(err, shortUrl) {
          if(err) {
            res.json({error: err});
            return;
          } 
  
          res.json({ 
            original_url : urlObj.href, 
            short_url : shortUrl
          });
        });
      });
    });
  } catch {
    res.json({error: "invalid url"});
  }
});

/**
 * access original Url via the shortened link
 */
app.get("/api/shorturl/:shortUrl", (req, res) => {
  let shortUrl = req.params.shortUrl;
  if(shortUrl) {
    repository.findUrlByShort(shortUrl, (err, originalUrl)=> {
      if(err || !originalUrl) {
        res.redirect("/");
      } else {
        res.redirect(originalUrl);
      }
    });
  }
});

// ============================================ 
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
