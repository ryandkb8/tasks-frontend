# Frontend for tasks service

This is the frontend for the tasks service.

## Bringing up local instance
This relies on `tasks-backend` and `tasks-postgresql`. In order to bring up the entire suite run the following:
```
docker-compose build
docker-compose up
```

## Building docker image
To build the docker image run the following: `./build.sh`

## Releasing
To build the docker image and push it to docker hub run the following: `./release.sh`
The image is versioned by the shorted git hash.
