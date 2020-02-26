
#!make
SHELL := /bin/bash 

.DEFAULT_GOAL=default
.PHONY: build dev deploy

# include npm bin folder into $PATH
export PATH := $(shell npm bin):$(PATH)

# include dotenv (.env)
ifeq ($(wildcard ./.env),./.env)
include .env
export $(shell sed 's/=.*//' .env)
endif

# default environment vars
ifndef NPM_VERSION
  export NPM_VERSION=patch
endif

ifndef NYC_REPORTERS
  export NYC_REPORTERS='--reporter=text'
endif

# common
default: install test build

node_modules:; npm install
install:; npm install
i: install

# testing
lint: node_modules
	# eslint {app,con-text,loader}
	eslint app --color

mocha: node_modules
	npx mocha "{_common,con-text,app,parser,loader,stringify,tinyhtml,template}/{,**/}*.test.js" \
		--require @babel/register \
		--require module-alias/register \
		--color --full-trace

nyc-mocha: # make nyc-mocha NYC_REPORTERS="--reporter=lcov --reporter=text"
	nyc ${NYC_REPORTERS} $(MAKE) mocha

test: lint nyc-mocha

coveralls:
	nyc report --reporter=text-lcov | coveralls

codecov:
	nyc report --reporter=lcov && codecov

# building
build:
	rm -rf dist
	# npx babel src --out-dir dist --ignore src/**/*.test.js
	# npx rollup src/con-text.js \
	# 	-c rollup.config.js \
	# 	--output.format umd \
	# 	--output.file dist/con-text.umd.js \
	# 	--output.exports named \
	# 	-n conText
	# npx uglifyjs dist/con-text.umd.js --compress --mangle -o dist/con-text.min.js

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
