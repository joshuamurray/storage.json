# storage.json
A simple node module, for easily managing application JSON files.

# Installation:

    npm install storage.json

# Usage

    #config()
        var store = require( 'storage.json' );

        var config = store.config({ data: "your personal config options" }); //Creates "config.json"
        ~ OR ~
        var config = store.config( 'customName', { data: "your personal config options" }); //Creates "customName.json"

        console.log( config.data );// Outputs "your personal config options"

        You can automatically add the newly created configuration file to your .npmignore file by including "npmIgnore: true" within the data.

            Example:
                var config = store.config({ data: "your data", npmIgnore: true }); // Adds config.json to .npmignore
                ~ OR ~
                var config = store.config( 'customName', { data: "your data", npmIgnore: true }); // Adds customName.json to .npmignore

    #read()
        var store = require( 'storage.json' );

        var contents = store.read( 'filename' );

        console.log( contents );// Outputs the contents of filename.json