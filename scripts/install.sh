#!/bin/bash

if [[ $PWD == *"/node_modules/sugarcss"* ]]
then
	# move src
	mv src/js/sugar/ js/
	mv src/sass/sugar/ sass/

	# clean repo
	rm -rf src
	rm -rf *.html
	rm -rf pages
	rm -rf assets
	rm -rf config.rb
	rm -rf favicon.ico
	rm -rf .DS_Store
	rm -rf *.coffee
	rm -rf scripts
	rm -rf bower.json
fi