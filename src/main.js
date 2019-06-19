const express = require('express');
const fs = require('fs');

const app = express();
const port = 80;
const pages = './pages/';
const ext = '.html';

app.use(express.json({limit: '50mb'}))

// Methods
function isValidPageName(name) {
    regex = /^[A-Za-z0-9\-\_]+$/;
    return !!name.match(regex)
}

// Routes
app.get('/', (req, res) => {
    res.send(`Welcome to OpenPages.\nMake a POST request to '${req.headers.host}/{something}' with a parameter 'html' containing some HTML, encoded as base64 and that page will host the HTML you submitted.`);
})
app.get('/:page', (req, res) => {
    page = req.params.page;
    if (!isValidPageName(page)) {
        return res.send('Invalid page name.')
    }

    file = pages+page+ext
    if (fs.existsSync(file)) {
        return res.sendFile(file, { root: __dirname })
    }

    res.send();
})
app.post('/:page', (req, res) => {
    page = req.params.page;
    if (!isValidPageName(page)) {
        return res.send('Invalid page name.')
    }

    file = pages+page+ext
    if (fs.existsSync(file)) {
        fs.unlinkSync(file)
    }

    body = Buffer.from(req.body.html, 'base64');
    fs.writeFileSync(file, body)

    res.send(`Page '${page}' was updated. Access '${req.headers.host}/${page}' to view your page.`)
})

app.listen(port, () => console.log(`Server running on port ${port}`))