#!/bin/bash

set -e

USERNAME=ryandkb8
IMAGE=tasks-frontend

docker build -t $USERNAME/$IMAGE:latest .
