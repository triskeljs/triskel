
.PHONY: test release

ifndef NPM_VERSION
  export NPM_VERSION=patch
endif

default: install test build

node_modules:; npm install
install:; npm install
i: install

lint: node_modules
	npx eslint con-text

test: lint
	npx mocha {con-text,loader}/*.test.js \
		--require @babel/register \
		--require module-alias/register

build:
	rm -rf dist
	npx babel src --out-dir dist --ignore src/**/*.test.js
	npx rollup src/con-text.js \
		-c rollup.config.js \
		--output.format umd \
		--output.file dist/con-text.umd.js \
		--output.exports named \
		-n conText
	npx uglifyjs dist/con-text.umd.js --compress --mangle -o dist/con-text.min.js

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
