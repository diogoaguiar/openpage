const express = require('express');
const fs = require('fs');
const mustacheExpress = require('mustache-express');

const app = express();
const port = 8855;
const pages = './pages/';
const ext = '.html';

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));

app.engine('html', mustacheExpress());

app.set('view engine', 'html');
app.set('views', __dirname + '/views');

// Methods
function isValidPageName(name) {
    let regex = /^[A-Za-z0-9\-\_]+$/;
    return !!name.match(regex);
}

// Routes
app.get('/', (req, res) => {
    console.log(`GET /`);
    res.render('home', {
        base_url: req.headers.host
    });
})
app.get('/favicon.ico', (req, res) => {
    res.sendFile('./favicon.ico', { root: __dirname });
})
app.get('/:page', (req, res) => {
    let page = req.params.page;
    console.log(`GET /${page}`);
    if (!isValidPageName(page)) {
        console.log('Invalid page name.');
        return res.send('Invalid page name.');
    }

    let file = pages+page+ext;
    if (fs.existsSync(file)) {
        console.log('Page exists.');
        return res.sendFile(file, { root: __dirname });
    }

    console.log('Page does not exist.');
    res.send();
})
app.post('/:page', (req, res) => {
    let page, body;

    try {
        page = req.params.page;
        body = Buffer.from(req.body.html, 'base64');
    } catch (e) {
        console.log('Invalid parameters.');
        return res.send('Invalid parameters.')
    }

    console.log(`POST /${page}`);
    if (!isValidPageName(page)) {
        console.log('Invalid page name.');
        return res.send('Invalid page name.');
    }

    let file = pages+page+ext;
    if (fs.existsSync(file)) {
        console.log('Page exists. Will override.');
        fs.unlinkSync(file);
    }

    fs.writeFileSync(file, body);

    console.log('Page updated.');
    res.render('success', {
        base_url: req.headers.host,
        page: page
    });
})

app.listen(port, console.log(`Server running on port ${port}`));