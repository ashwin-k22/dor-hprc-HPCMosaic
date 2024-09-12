#!/bin/bash
set -eo pipefail
IFS=$'\n\t'

CURRENTDIR=`basename "$PWD"`
CLUSTERNAME=$(clustername)

# Capitalize first letter of CLUSTERNAME
CLUSTERNAME="$(tr '[:lower:]' '[:upper:]' <<< ${CLUSTERNAME:0:1})${CLUSTERNAME:1}"

# Replace cluster-name, app-name, user-name in config.yml
sed -i.bak -e "s/\[cluster-name\]/$CLUSTERNAME/g" -e "s/\[app-name\]/$CURRENTDIR/g" -e "s/\[user-name\]/$USER/g" config.yml

# Replace cluster-name in manifest.yml
sed -i.bak -e "s/\[cluster-name\]/$CLUSTERNAME/g" manifest.yml

# Remove backup file during copy
rm config.yml.bak manifest.yml.bak


python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt



npm install -D babel-loader @babel/core @babel/preset-react
npm run build