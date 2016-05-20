/**
 * Primary module requirements.
 * @type {exports}
 */
var fs = require( "fs" );
var path = require( "path" );

/**
 * Handles storage of trivial data for requiring modules within a JSON file.
 * File will be created if it doesn't exist.
 * Primary functions: config( filename ), read( {PATH=optional}:{FILENAME} )
 * @constructor
 */
var Storage = function(){
    var $this = this;

    /**
     * The name of the file which holds an extending module's
     * configuration data. This will be generated within the
     * base directory of any module that uses storage.json.
     */
    this.configFileName = 'config.storage.json';

    /**
     * Basic methods to return specific directory paths for resolution.
     * @type {{app: Function, root: Function, config: Function, _storage: Function}}
     */
    this.directory = {
        /**
         * The values used when locating paths.
         */
        list: {
            root: '.',
            config: 'node_modules/config/',
            storage: 'node_modules/storage.json/'
        },

        set: function( type, value ){
            if( Object.keys( this.list ).indexOf( type ) === -1 ) return false;

            this.list[ type ] = value;

            return true;
        },

        /**
         * Returns the path to the current Node.js module
         * @returns {*}
         */
        app: function(){
            return __dirname;
        },

        /**
         * Returns the path to the current root directory
         * @returns {*}
         */
        root: function(){
            return path.resolve( this.list.root );
        },

        /**
         * Returns the path to the application's config directory
         * @returns {*}
         */
        config: function(){
            return [ this.root(), this.list.config ].join( '/' );
        },

        /**
         * Returns the path to the storage.json module directory
         * @returns {*}
         */
        storage: function(){
            return [ this.root(), this.list.storage ].join( '/' );
        }
    }

    /**
     * Extracts the path from the filename string, when prefixed and separated with a colon.
     * (e.g. {PATH}:{FILENAME})
     * @param filename
     * @returns {*}
     */
    this.parse = function( filename ){
        var pieces = filename.split( ':' );

        if( pieces.length === 1 ) return { name: pieces[ 0 ]};

        if( pieces.length > 1 ) return { path: pieces[ 0 ], name: pieces[ 1 ]};

        return false;
    }

    /**
     * Returns the resolved path to the file, after
     * adding the ".json" extension, if not present.
     * @param filename
     * @returns {string}
     */
    this.resolve = function( filename, json ){
        json = json !== false;
        var file = $this.parse( filename );

        if( json && file.name.substr( file.name.length - 5 ) != ".json" ) file.name += ".json";

        file.path = file.path === undefined ? [ file.name ] : file.path;

        if( typeof file.path === 'string' ){
            if([ 'app', 'root', 'config', 'storage' ].indexOf( file.path ) !== -1 ) file.path = $this.directory[ file.path ]();

            file.path = file.path.split( '/' )
            file.path.push( file.name );
        }

        return path.resolve( file.path.join( '/' ));
    }

    /**
     * Asserts that a file exists at the provided path.
     * @param filename
     * @returns {boolean}
     */
    this.exists = function( filename, json ){
        json = json !== false;
        var path = $this.resolve( filename, json );

        try {
            if ( fs.lstatSync( path ).isFile()) return true;

            return false;
        } catch (e) {
            return false;
        }
    };

    /**
     * Formats the object into a "human-readable" JSON string.
     * Providing spaces = 0 will dehumanize the string.
     * @param object
     * @param spaces
     */
    this.format = function( object, spaces ){
        spaces = typeof spaces === 'number' ? spaces : 2;

        if( typeof object === 'string' ) object = JSON.parse( object );

        return JSON.stringify( object, null, spaces );
    };

    /**
     * Deletes a file from the path, if the file exists.
     * @param filename
     */
    this.delete = function( filename ){
        var exists = this.exists( filename );

        if( exists ) fs.unlinkSync( this.resolve( filename ));

        if( exists && ! this.exists( filename )) return true;

        return false;
    };

    /**
     * Creates a file at the desired path.
     * @param filename
     * @param contents
     * @param overwrite
     * @returns {boolean}
     */
    this.build = function( filename, contents, overwrite ){
        var path = $this.resolve( filename );
        contents = $this.format( contents === undefined ? {} : contents );

        if( ! $this.exists( filename ) || overwrite === true ){
            fs.openSync( path, 'w' );
            fs.writeFileSync( path, contents, { encoding: "utf8" });

            if( $this.exists( filename )) return true;
        }

        return false;
    };

    /**
     * Updates the contents of the JSON file to match "object"
     * @param filename
     * @param contents
     */
    this.update = function( filename, contents ){
        if( ! this.exists( filename )) return false;

        fs.writeFileSync( $this.resolve( filename ), $this.format( contents ), { encoding: "utf8" });

        return true;
    };

    /**
     * Returns the contents of a file as a parsed Object or Array
     * @param filename
     */
    this.read = function( filename ){
        return $this.exists( filename ) ? JSON.parse( fs.readFileSync( storage.resolve( filename ), { encoding: "utf8" })) : false;
    };

    /**
     * Inject the properties from one file into another,
     * unless those properties already exist. Force an
     * overwrite, by providing true to the forced arg.
     * @param from
     * @param into
     * @param force
     */
    this.inject = function( fileFrom, fileInto, force ){
        force = force === true;

        var from = typeof fileFrom === 'object' ? fileFrom : $this.read( fileFrom );
        var into = $this.read( fileInto );

        for( var property in from )
            if( ! into.hasOwnProperty( property ) || force ) into[ property ] = from[ property ];

        return $this.update( fileInto, into );
    };

    /**
     * Generates the configuration file for a module importing storage.json.
     * @param options
     * @returns {boolean}
     */
    this.generate = function( options ){
        return $this.build( 'app:' + $this.configFileName, options );
    };

    /**
     * Return the contents of the root config file, after
     * ensuring that the app config has been injected.
     * @param {string|object} [filename] - OR options
     * @param {object} [options]
     * @returns {object}
     */
    this.config = function( filename, options ){
        if( ! options && typeof filename === 'object' ) options = filename;
        if( ! filename || typeof filename !== 'string' ) filename = 'config';

        options = typeof options === 'object' ? options : {};

        if( options.npmIgnore !== undefined ) options = $this.ignore( filename, options );

        var rootConfig = 'root:' + filename;
        var appConfig = 'app:' + $this.configFileName;

        if( ! $this.exists( appConfig )) $this.generate( options );
        if( ! $this.exists( rootConfig )) $this.build( rootConfig, $this.read( appConfig ));

        $this.inject( appConfig, rootConfig );

        return $this.read( rootConfig );
    };

    /**
     * Appends the configuration file names to the root/module ".npmignore" file(s).
     * @param {string} filename
     * @param {object} options
     * @returns {*}
     */
    this.ignore = function( filename, options ){
        if( options.npmIgnore !== undefined ){
            if( options.npmIgnore === true ){
                if( filename.substr( filename.length - 5 ) != ".json" ) filename += ".json";

                var app = $this.resolve( 'app:.npmignore', false );
                var root = $this.resolve( 'root:.npmignore', false );

                if ( ! $this.exists( app, false )) fs.openSync( app, 'w' );
                if ( ! $this.exists( root, false )) fs.openSync( root, 'w' );

                var appContents = fs.readFileSync( app, { encoding: "utf8" });
                var rootContents = fs.readFileSync( root, { encoding: "utf8" });

                appContents = appContents.length === 0 ? '' : appContents + "\n";
                rootContents = rootContents.length === 0 ? '': rootContents + "\n";

                appContents = appContents.indexOf( $this.configFileName ) === -1
                    ? appContents + $this.configFileName
                    : appContents;

                rootContents = rootContents.indexOf( filename ) === -1
                    ? rootContents + filename
                    : rootContents;

                if( app === root ) rootContents = appContents.indexOf( filename ) === -1
                    ? appContents + "\n" + filename
                    : appContents;

                fs.writeFileSync( app, appContents.trim(), { encoding: "utf8" });
                fs.writeFileSync( root, rootContents.trim(), { encoding: "utf8" });
            } else if( options.npmIgnore === false ){
                $this.include( filename, options );
            }
        }

        delete options.npmIgnore;

        return options;
    };

    /**
     * Removes storage.json references from all .npmignore files
     * @param filename
     * @param options
     */
    this.include = function( filename, options ){
        filename = typeof filename === 'string' ? filename : 'config';
        if( filename.substr( filename.length - 5 ) != ".json" ) filename += ".json";

        var app = $this.resolve( 'app:.npmignore', false );
        var root = $this.resolve( 'root:.npmignore', false );

        if ( ! $this.exists( 'app:.npmignore', false )) fs.openSync( app, 'w' );
        if ( ! $this.exists( 'root:.npmignore', false )) fs.openSync( root, 'w' );

        var appContents = fs.readFileSync( app, { encoding: "utf8" });
        var rootContents = fs.readFileSync( root, { encoding: "utf8" });

        appContents = appContents.indexOf( "\n" + filename ) !== -1 ? appContents.replace( "\n" + filename, '' ) : appContents;
        rootContents = rootContents.indexOf( "\n" + filename ) !== -1 ? rootContents.replace( "\n" + filename, '' ) : rootContents;

        appContents = appContents.indexOf( "\n" + $this.configFileName ) !== -1 ? appContents.replace( "\n" + $this.configFileName, '' ) : appContents;
        rootContents = rootContents.indexOf( "\n" + $this.configFileName ) !== -1 ? rootContents.replace( "\n" + $this.configFileName, '' ) : rootContents;

        fs.writeFileSync( app, appContents.trim(), { encoding: "utf8" });
        fs.writeFileSync( root, rootContents.trim(), { encoding: "utf8" });
    };
};

/**
 * Exports an instantiation of the Storage module.
 */
var storage = new Storage();

module.exports = storage;