const http = require('http');

let passed = 0;
let failed = 0;

function check(name, condition) {
    if (condition) { console.log(`✅ ${name}`); passed++; }
    else { console.log(`❌ ${name}`); failed++; }
}

const app = require('./index');

setTimeout(() => {
    http.get('http://localhost:3000/', (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
            const body = JSON.parse(data);
            check('GET / returns 200', res.statusCode === 200);
            check('has message field', !!body.message);

            http.get('http://localhost:3000/health', (res2) => {
                let data2 = '';
                res2.on('data', c => data2 += c);
                res2.on('end', () => {
                    const body2 = JSON.parse(data2);
                    check('health returns 200', res2.statusCode === 200);
                    check('has status field', !!body2.status);

                    console.log(`\n${passed} passed, ${failed} failed`);
                    app.close();
                    process.exit(failed > 0 ? 1 : 0);
                });
            });
        });
    }).on('error', err => {
        console.log('❌ Error:', err.message);
        process.exit(1);
    });
}, 500);
