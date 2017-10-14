const express = require("express");
const app = express();
const routerREST = express.Router();
const port = process.env.PORT || 3000;

let users = [];

users.push({
    id: 1,
    name: 'Alex',
    score: 100
});

// 1
routerREST.get("/users", function (req, res) {
    const limit = parseInt(req.query.limit) || 0;
    const offset = parseInt(req.query.offset) || 0;
    const fields = req.query.fields || 'id,name,score';

    const arFields = fields.split(',');
    res.json(
        users.filter((item, index) => {
            return (offset < index + 1) && ((limit === 0) || (index + 1 <= offset + limit));
        }).map((item) => {
            let result = {};
            if (arFields.includes('id')) {
                result.id = item.id;
            }
            if (arFields.includes('name')) {
                result.name = item.name;
            }
            if (arFields.includes('score')) {
                result.score = item.score;
            }
            return result;
        })
    );
});
routerREST.post("/users", function (req, res) {
    let newId = users.length + 1;
    const name = req.query.name;
    const score = req.query.score;
    if(name || score) {
        users.push({
            id: newId,
            name: name,
            score: score
        });
        res.json({
            success: true,
            newId: newId
        });
    }
    else {
        res.json({
            success: false,
            error: "Name and score are required!"
        });
    }
});
routerREST.get("/users/:id", function (req, res) {
    const id = parseInt(req.params.id);
    const fields = req.query.fields || 'id,name,score';
    const arFields = fields.split(',');
    res.json(
        users.filter((item) => {
            return item.id === id;
        }).map((item) => {
            let result = {};
            if (arFields.includes('id')) {
                result.id = item.id;
            }
            if (arFields.includes('name')) {
                result.name = item.name;
            }
            if (arFields.includes('score')) {
                result.score = item.score;
            }
        })
    );
});
routerREST.put("/users/:id", function (req, res) {
    const id = parseInt(req.params.id);
    let foundId = false;
    users.map((item) => {
        if (item.id === id) {
            item.name = req.query.name;
            item.score = req.query.score;
            foundId = true;
        }
    });
    res.json({
        success: foundId
    });
});
routerREST.delete("/users/:id", function (req, res) {
    const id = parseInt(req.params.id);
    res.json(users.filter((item) => {
        return item.id !== id;
    }));
});
routerREST.delete("/users", function (req, res) {
    users = [];
    res.json({
        success: true
    });
});

app.use("/api/REST/v1", routerREST);

//2

const routerRPC = express.Router();

routerRPC.all("/users", function (req, res, next) {
    if (req.method !== 'POST') {
        res.json({
            jsonrpc: '2.0',
            success: false,
            error: "Wrong request type"
        });
    }
    else {
        next();
    }
});

routerRPC.post("/users", function (req, res) {
    const method = req.query.method;
    let id;
    let response = {
        jsonrpc: '2.0',
        method: method,
        success: true,
        response: ""
    };

    switch (method) {
        case 'add':
            let newId = users.length + 1;
            users.push({
                id: users.length + 1,
                name: req.query.name,
                score: req.query.score
            });
            response.response = {
                newId: newId
            };
            break;
        case 'get':
            id = parseInt(req.params.id);
            response.response = users.filter((item) => {
                return item.id === id;
            });
            break;
        case 'getAll':
            response.response = users;
            break;
        case 'update':
            id = parseInt(req.params.id);
            let foundId = false;
            users.map((item) => {
                if (item.id === id) {
                    item.name = req.query.name;
                    item.score = req.query.score;
                    foundId = true;
                }
            });
            response.response = {
                foundId: foundId
            };
            break;
        case 'delete':
            id = parseInt(req.params.id);
            response.response = users.filter((item) => {
                return item.id !== id;
            });
            break;
        case 'deleteAll':
            users = [];
            break;
        default:
            res.json({
                jsonrpc: '2.0',
                success: false,
                error: "Wrong request type"
            });
            break;
    }

    res.json(response);
});

app.use("/api/RPC/v1", routerRPC);
app.use(function (req, res) {
    res.status(404).send('Not found!');
});

app.listen(port);