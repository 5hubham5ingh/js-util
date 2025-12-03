#!/bin/env bash

# Build script for js

## Fetch the QuickJS source code, then build and install the compiler and interpreter in the system.
if ! [ -d "quickjs" ]; then
  echo -e "\e[1;4;33mFetching source code...\e[0m"
  git clone --depth 1 https://github.com/bellard/quickjs.git
  cd quickjs
  make
  sudo make install
  cd ..
else
  echo "\"quickjs\" found, skipping \"quickjs\" download and installation."
fi

## Fetch the required library.
if ! [ -d "qjs-ext-lib" ]; then
  curl -L -o out.zip https://github.com/ctn-malone/qjs-ext-lib/archive/refs/tags/0.12.4.zip
  unzip out.zip
  mv qjs-ext-lib-0.12.4 qjs-ext-lib
  rm out.zip
else
  echo "\"qjs-ext-lib\" found, skipping \"qjs-ext-lib\" download and installation."
fi

## Clone the js-util project
if ! [ -d "js-util" ]; then
  git clone --depth 1 https://github.com/5hubham5ingh/js-util.git
  cd js-util
else
  echo "\"js-util\" found, running \"js-util\" update."
  cd js-util
  git fetch origin
fi

## Build js then install it.
echo -e "\e[1;4;33mBuilding js...\e[0m"
qjsc -D worker.js -o js main.js
echo -e "\e[1;4;33mInstalling js...\e[0m"
sudo cp js /usr/bin/
echo -e "\e[1;32mjs installation completed successfully.\e[0m"
