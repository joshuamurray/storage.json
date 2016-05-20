# storage.json
A simple node module, for easily managing application JSON files.

# Installation:

    npm install storage.json

# Usage

config()
    var store = require( 'storage.json' );

    var config = store.config({ data: "your personal config options" }); //Creates "config.json"
~ OR ~
    var config = store.config( 'customName', { data: "your personal config options" }); //Creates "customName.json"

    console.log( config.data );// Outputs "your personal config options"

read()
    var store = require( 'storage.json' );

    console.log( store.read( 'filename' ));// Outputs the contents of filename.json