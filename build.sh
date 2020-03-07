#!/bin/bash

webpack --config ./webpack.prod.config.js
cp -R assets build/
cp -R index.html build/
