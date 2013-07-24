REPORTER = spec

all:
	@./node_modules/.bin/mocha \
      	--reporter $(REPORTER) \
      	--ui bdd \
      	--bail \
      	test/*.js

rest:
	@./node_modules/.bin/mocha \
      	--reporter $(REPORTER) \
      	--ui bdd \
      	--bail \
      	test/REST.js

test: all

.PHONY: test