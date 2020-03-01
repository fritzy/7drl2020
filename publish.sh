#!/bin/zsh

webpack --config ./webpack.prod.config.js
cp -R assets build/
cp -R index.html build/
butler push build fritzy/rise-up:web
