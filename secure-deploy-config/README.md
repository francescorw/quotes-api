# Deploying quotes-api securely using nginx as reverse proxy
## HTTPS
Certbot using dns challenge

```# ./run-as-root-certbot/do.sh```

## docker-compose
Start the container with

```$ ./start-secure.sh```

This command will build (copy the config file) and start the service

### Changing the config
In order to change the config, edit as you wish the docker-compose.yml and the config/nginx.conf files.
