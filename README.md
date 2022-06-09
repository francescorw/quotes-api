quotes-api
----------
redis/csv/in memory quote database with an expressive REST API.

Firing it up
------------
```bash
npm start
```

## Building docker image
```
docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v7 -t <username>/<image-name>:<tag> --push .
```

HTTP API
--------

### GET /quotes/random
Response - HTTP 200
```json
{
      "total": 1,
      "id": 1,
      "quote": "<Chuck> guys, I know kung fu"
}
```

### GET /quotes/random?type=re&query=(yeah)
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

### GET /quotes/:id/info
Response - HTTP 200
```json
{
    "nickname": "Ferdi",
    "timestamp": "2016-09-23T14:55:00.000Z",
    "channel": "#support"
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

### PATCH /quotes/:id
Request
```json
{
      "quote": "<jack_ass> we have to go back... <jack_ass> back to the future!",
      "update_by": "Emmett Brown"
}
```
Response - HTTP 200
```json
{
      "success": true
}
```

### DELETE /quotes/:id
Response - HTTP 200
```json
{
    "success": true
}
```
