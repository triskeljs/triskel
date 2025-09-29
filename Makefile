#!make
SHELL := env PATH=./node_modules/.bin:./web/node_modules/.bin:$(PATH) /bin/bash -O extglob

.SILENT:

all: install build test

install:
	npm install

build:
	npm run build

test:
	npm run test
