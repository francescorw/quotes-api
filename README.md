quotes-api
----------
csv-backed quote database with an expressive REST API.

Firing it up
------------
```bash
npm start
```

HTTP API
--------

### GET /quotes/random
Response - HTTP 200
```json
{
      "total": 1,
      "quote": "<Chuck> guys, I know kung fu"
}
```

### GET /quotes/random?type=wildcard&query=(yeah)
Response - HTTP 200
```json
{
      "total": 2,
      "quote": "<Reese> geez, try not to die <Fusco> yeah i love you too"
}
```

### GET /quotes/:id
Response - HTTP 200
```json
{
    "quote": "<piehdd> thats stupid <frw> so's your face man"
}
```

### POST /quotes
Request
```json
{
      "nickname": "kate",
      "channel": "#lostandfound",
      "mask": "kate!kate@abc.go.com",
      "quote": "<jack_ass> we have to go back"
}
```
Response - HTTP 200
```json
{
      "id": "3"
}
```

### DELETE /quotes/:id
Response - HTTP 200
```json
{
    "success": true
}
```