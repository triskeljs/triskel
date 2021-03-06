#!make
SHELL := env PATH=$(shell npm bin):$(PATH) /bin/bash -O extglob

# following does not work well in some environments (like macos) or with some commands (jsdoc)
# SHELL := /bin/bash 
# export PATH := $(shell npm bin):$(PATH)

.DEFAULT_GOAL=default
.PHONY: build dev deploy

# include dotenv (.env)
ifeq ($(wildcard ./.env),./.env)
include .env
export $(shell sed 's/=.*//' .env)
endif

# default environment vars
ifndef NPM_VERSION
  export NPM_VERSION=patch
endif

ifndef FORCE_COLOR
  export FORCE_COLOR=true
endif

ifndef NYC_REPORTERS
  export NYC_REPORTERS=--reporter=text
endif

branch_name = $(shell git symbolic-ref --short HEAD)

dirs=_common,con-text,app,parser,loader,stringify,tinyhtml,template

# common
default: install test build

node_modules:; npm install
install:; npm install
i: install

# testing
lint: node_modules
	eslint {${dirs}} --color

mocha: node_modules
	mocha "{$(dirs)}/{,**/}*.test.js" \
		--require @babel/register \
		--require source-map-support/register \
		--require module-alias/register \
		--full-trace --inline-diffs

nyc-mocha: # p.e: make nyc-mocha NYC_REPORTERS="--reporter=lcov --reporter=text"
	nyc ${NYC_REPORTERS} $(MAKE) mocha

test: lint nyc-mocha

lcov:
	nyc report --reporter=lcov

coveralls:
	nyc report --reporter=text-lcov | coveralls

codecov:
	codecov

codeclimate:
	curl -L https://codeclimate.com/downloads/test-reporter/test-reporter-latest-linux-amd64 > ./cc-test-reporter
		chmod +x ./cc-test-reporter
		./cc-test-reporter format-coverage -t lcov coverage/lcov.info
		./cc-test-reporter upload-coverage

# docs
docs:
	jsdoc --configure .jsdoc.json --verbose {${dirs}} -d docs

# building
build:
	rm -rf dist
	# babel src --out-dir dist --ignore src/**/*.test.js
	# rollup src/con-text.js \
	# 	-c rollup.config.js \
	# 	--output.format umd \
	# 	--output.file dist/con-text.umd.js \
	# 	--output.exports named \
	# 	-n conText
	# uglifyjs dist/con-text.umd.js --compress --mangle -o dist/con-text.min.js

npm.publish:
	git pull --tags
	npm version ${NPM_VERSION}
	git push origin $(git_branch) && git push --tags
	cp package.json dist
	cp package-lock.json dist
	cp README.md dist
	npm publish dist --access public

github.release: export REPOSITORY=triskeljs/con-text
github.release: export PKG_VERSION=$(shell node -e "console.log('v'+require('./package.json').version);")
github.release: export RELEASE_URL=$(shell curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer ${GITHUB_TOKEN}" \
	-d '{"tag_name": "${PKG_VERSION}", "target_commitish": "$(git_branch)", "name": "${PKG_VERSION}", "body": "", "draft": false, "prerelease": false}' \
	-w '%{url_effective}' "https://api.github.com/repos/${REPOSITORY}/releases" )
github.release:
	@echo ${RELEASE_URL}
	@echo "\nhttps://github.com/${REPOSITORY}/releases/tag/${PKG_VERSION}\n"

release: install test build npm.publish github.release
