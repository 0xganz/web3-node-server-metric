import express from 'express';
import path from 'path';
import fs from 'fs';

const app = express();

const port = 9999;


app.use(express.static('report_html'));

app.use('/analys', express.static(path.join(__dirname, '../analys')));


app.get('/list', function (req, res) {
    const dir_path = path.join(__dirname, '../analys')
    const files = fs.readdirSync(dir_path);
    const list: string[] = [];
    const set = new Set()

    files.forEach(file => {
        const mather = file.match(/\d+/)
        if (mather) {
            const value = mather[0];
            if (!set.has(value)) {
                list.push(value);
                set.add(value);
            }
        }
    })

    list.sort((x, y) => parseInt(x) - parseInt(y));
    res.setHeader('Content-Type', 'text/html;charset=utf-8');
    var alist = '';
    list.forEach(data => {
        alist += '<li><a href="/index.html?' + data + '">' + dateFormat(parseInt(data) * 100000) + '</a></li>'
    })

    const content = '<html><body><ul>' +
        alist +
        '</ul></body></html>';
    res.send(content)
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})


function dateFormat(timestamp: number) {
    const date = new Date(timestamp);
    return date.getUTCFullYear() + "-" + (date.getUTCMonth() + 1) + "-" + date.getUTCDay() + " " + date.getUTCHours() + ":" + date.getUTCMinutes()
}
