# Metrolink Tracker Website

This website uses [Metrolink Times](https://github.com/j616/metrolinkTimes) to provide estimates of tram arrival times at stations on the Manchester Metrolink tram network.

## Docker

A Dockerfile is provided as an easy way to serve the website using nginx + pagespeed. This serves the website on port 80, proxies the api from `http://api:5000` (You should name the api's docker container `api` in your docker-compose for it to be picked up) to `/api/`, and serves a basic healthcheck page on port 8080.

The container can be built with:
```bash
docker build -t mlweb
```

This container can then be run with:
```bash
docker run --name mlWeb -d -p 8080:80 -p 8081:8080 mlweb
```

This will reveal the main website on port 8080 and the healthcheck on port 8081.
