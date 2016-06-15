# storage.json
**NPM package providing simplified create, read, update, and delete methods for JSON files. Also provides methods which simplify using JSON files to store configuration data.**

---
# Installation:
#### Install:    
    npm install storage.json 

#### Require:
    var storage = require('storage.json' );
---

# File Names and Paths:
Storage.json accepts simplified path names and assumes that the file extension will always be ".json". Because of this, finding the correct file can be done in several ways.
    
#### Name only
    "filename"
#### Name with extension
    "filename.json"
##### With property
    "filename.property"
#### With deep property
    "filename.deeply.nested.property"
#### With extension and property
    "filename.json.property"
#### With complete path
    "/path/to/filename"
#### With complete path and property
    "/path/to/filename.property"
*Note: If your property is "json", you MUST include the extension ( e.g. "/path/to/filename.json.json" )*

# Usage and Examples:

*For the "Finding" and "Reading" examples, assume filename.json contains :*

`{ "property": "This is the value of 'property' from filename.json" }`

## Finding Files and Data
---
### has()
---
**Returns `TRUE` if the filename and/or property exists and has been assigned a value, otherwise returns `FALSE`**

    console.log( storage.has( 'filename' )); // TRUE
    console.log( storage.has( 'filename.property' )); // TRUE
    console.log( storage.has( 'missing_file' )); // FALSE
    console.log( storage.has( 'filename.missing' )); // FALSE  
    
## Reading Files and Data
---
### get()
---
**Returns the files contents or value if found, otherwise returns `undefined`**

        // Read entire file
        var contents = storage.get( 'filename' );
        console.log( contents ); //{ property: "This is the value of 'property' from filename.json" }
        
        // Read property within file
        var contents = storage.get( 'filename.property' );
        console.log( contents ); //"This is the value of 'property' from filename.json"
        
## Writing Files and Data
---
### set()
---
**Merges an Object into a file, OR assigns a value to the property specified**

        // Returns a boolean value asserting that the file was changed.
        var set = storage.set( 'new_file', { property: "value" });
        console.log( set ) //TRUE
        var set = storage.set( 'new_file', { property: "value" });
        console.log( set ) //FALSE
        
        // Creates a new file if the file does not exist
        console.log( storage.exists( 'new_file' )); //FALSE
        storage.set( 'new_file', { property: "value" });
        console.log( storage.exists( 'new_file' )); //TRUE
        
        // It will not overwrite existing properties, unless specified
        console.log( storage.get( 'filename' ) //{ property: "value" };
        storage.set( 'filename', {});
        console.log( storage.get( 'filename' ) //{ property: "value" };
        
        // It will overwrite existing properties, when specified
        console.log( storage.get( 'filename' ) //{ property: "value" };
        
        storage.set( 'filename', { property: "new value" });
        // OR
        storage.set( 'filename.property', "new_value" );
        
        console.log( storage.get( 'filename' ) //{ property: "new_value" };
        
### insist()
---
**Ensures that the file exists and return the filename to simplify inline calls**
    
    var file = storage.insist( 'new_file' );
    console.log( storage.get( file )) //{};

### update()
---
**Overwrites the contents of an EXISTING file, with a new Object.**
    
    // Returns a boolean value
    // File Missing:
    console.log( storage.get( 'filename' ) //undefined
    var updated = storage.update( 'filename', { property: "value" });
    console.log( updated ); //FALSE
    
    // File Exists:
    console.log( storage.get( 'filename' ) //{}
    var updated = storage.update( 'filename', { property: "value" });
    console.log( updated ); //TRUE
    
**It will NOT create a new file if the file does not exist**

    console.log( storage.get( 'filename' ) //undefined
    var updated = storage.update( 'filename', { property: "value" });
    console.log( updated ); //FALSE
    console.log( storage.get( 'filename' ) //undefined
    
    
## Configuration FIles and Data
---
config()
---
**Create configuration files to store values common within an application, which may need to be changed depending upon their usage.**

#### Examples:

    // The default settings Object
    var defaults = { some_prop: true, some_prop_2: false };
    // A dynamic settings Object
    var argument = { some_prop: false };
        
    var config = storage.config( "MyConfigurationFile", argument );
    console.log( config ); //{ "some_prop": "false" }
    console.log( storage.get( "MyConfigurationFile" )); //{ "some_prop": "false" }
        
    var config = storage.config( "MyConfigurationFile", defaults );
    console.log( config ); //{ "some_prop": "true", "some_prop_2": "false" }
    console.log( storage.get( "MyConfigurationFile" )); //{ "some_prop": "true", "some_prop_2": "false" }
        
**If passing in two Objects, the Objects will be merged, and any overlapping properties will be assigned the first Object's assigned value.**

    var config = storage.config( "MyConfigurationFile", argument, defaults );
    console.log( config ); //{ "some_prop": "false", "some_prop_2": "false" }
    console.log( storage.get( "MyConfigurationFile" )); //{ "some_prop": "false", "some_prop_2": "false" }
    
