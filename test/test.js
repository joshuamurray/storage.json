var fs = require( "fs" );
var path = require( "path" );

var storage = require( '../index' );
var should = require( 'chai' ).should();

describe( 'storage.json', function(){
    describe( '#parse()', function(){
        it( 'should parse file paths which prefix the filename separated by a colon', function(){
            storage.parse( 'app:filename' ).should.deep.equal({ name: 'filename', path: 'app' });
        });

        it( 'should return no path, if none was present', function(){
            storage.parse( 'filename' ).should.deep.equal({ name: 'filename' });
        });
    });

    describe( '#resolve', function(){
        it( 'should resolve the file name with extension', function(){
            storage.resolve( 'filename.json' ).should.equal( path.resolve( 'filename.json' ));
        });

        it( 'should resolve the file name without extension', function(){
            storage.resolve( 'filename' ).should.equal( path.resolve( 'filename.json' ));
        });

        it( 'should resolve the path, ignoring the extension if argument 2 is false', function(){
            storage.resolve( 'filename', false ).should.equal( path.resolve( 'filename' ));
        });

        it( 'should resolve the proper path to the current application', function(){
            storage.resolve( 'filename.json', 'app' ).should.equal( path.resolve([ path.resolve( './' ), 'filename.json' ].join( '/' )));
        });

        it( 'should resolve the proper path to the root directory', function(){
            storage.resolve( 'root:filename.json' ).should.equal( path.resolve( './filename.json' ));
        });

        it( 'should resolve the proper path to the config directory', function(){
            storage.resolve( 'config:filename.json' ).should.equal( path.resolve( './node_modules/config/filename.json' ));
        });

        it( 'should resolve the proper path to the storage.js module', function(){
            storage.resolve( 'storage:filename.json' ).should.equal( path.resolve( './node_modules/storage.json/filename.json' ));
        });

        it( 'should resolve the proper path when provided a directory', function(){
            storage.resolve( '/other/directory/filename.json' ).should.equal( path.resolve( '/other/directory/filename.json' ));
        });
    });

    describe( '#exists()', function(){
        var fileExists = function( resolvedPath ){
            try {
                return fs.lstatSync( resolvedPath ).isFile()
            } catch (e) {
                return false;
            }
        }

        it( 'should return false if the file is missing', function(){
            storage.exists( 'test' ).should.equal( false );
        });

        it( 'should return true if the file is located', function(){
            fs.openSync( storage.resolve( 'test' ), 'w' );

            storage.exists( 'test' ).should.equal( true );

            fs.unlinkSync( storage.resolve( 'test' ));
        });

        it( 'should ignore the file extension if argument 2 equals false', function(){
            var ignorePath = storage.resolve( 'app:.npmignore', false );

            var contents = fileExists( ignorePath ) ? fs.readFileSync( ignorePath, { encoding: "utf8" }) : '';
            if( fileExists( ignorePath )) fs.unlinkSync( ignorePath );


            if( ! fileExists( ignorePath )){
                storage.exists( 'app:.npmignore', false ).should.equal( false );

                fs.openSync( ignorePath, 'w' );
                fs.writeFileSync( ignorePath, contents, { encoding: 'utf8' });
            }

            storage.exists( 'app:.npmignore', false ).should.equal( true );

            if( contents === '' ) fs.unlinkSync( ignorePath );
        });
    });

    describe( '#delete()', function(){
        it( 'should delete a json file if it exists', function(){
            fs.openSync( storage.resolve( 'test' ), 'w' );
            storage.exists( 'test' ).should.equal( true );

            storage.delete( 'test' );

            storage.exists( 'test' ).should.equal( false );
        });

        it( 'should return true if a file was deleted', function(){
            fs.openSync( storage.resolve( 'test' ), 'w' );
            storage.exists( 'test' ).should.equal( true );

            storage.delete( 'test' ).should.equal( true );

            storage.exists( 'test' ).should.equal( false );
        });

        it( 'should return false if the file did not exist', function(){
            storage.exists( 'test' ).should.equal( false );

            storage.delete( 'test' ).should.equal( false );
        });
    });

    describe( '#build()', function(){
        it( 'should create a json file if none exists', function(){
            storage.exists( 'test' ).should.equal( false );
            storage.build( 'test' );
            storage.exists( 'test' ).should.equal( true );

            storage.delete( 'test' );
        });

        it( 'should return true if a new file was created', function(){
            storage.exists( 'test' ).should.equal( false );
            storage.build( 'test' ).should.equal( true );
            storage.exists( 'test' ).should.equal( true );

            storage.delete( 'test' );
        });

        it( 'should return false if a new file was not created', function(){
            fs.openSync( storage.resolve( 'test' ), 'w' );
            storage.exists( 'test' ).should.equal( true );

            storage.build( 'test' ).should.equal( false );

            storage.delete( 'test' );
        });

        it( 'should overwrite an existing file when the "overwrite" argument is true', function(){
            fs.openSync( storage.resolve( 'test' ), 'w' );
            storage.exists( 'test' ).should.equal( true );

            storage.build( 'test', undefined, true ).should.equal( true );

            storage.delete( 'test' );
        });

        it( 'should write an empty Object ({}) into the file when nothing is passed as argument 2', function(){
            storage.build( 'test' );
            storage.read( 'test' ).should.deep.equal({});

            storage.delete( 'test' );
        });

        it( 'should write the contents of the Object (argument 2) into the new file', function(){
            var obj = { test: 'test' };

            storage.build( 'test', obj );
            storage.read( 'test' ).should.deep.equal( obj );

            storage.delete( 'test' );
        });
    });

    describe( '#update()', function(){
        it( 'should update a file to contain the contents of the object argument', function(){
            var testObject = {
                first: 'first test',
                second: 'second test'
            };

            storage.build( 'test' );
            storage.update( 'test', testObject ).should.equal( true );

            JSON.parse( fs.readFileSync( storage.resolve( 'test' ), { encoding: "utf8" })).should.deep.equal( testObject );

            storage.delete( 'test' );
        });
    });

    describe( '#read()', function(){
        it( 'should return the contents of a file as an object', function(){
            var obj = { first: 'first test', second: 'second test' };
            storage.build( 'test', obj );

            storage.read( 'test' ).should.deep.equal( obj );

            storage.delete( 'test' );
        });
    });

    describe( '#inject()', function(){
        it( 'should return false, if attempting to inject to a file that does not exist', function(){
            storage.inject({}, 'test' ).should.equal( false );
        });

        it( 'should return true, if the data was injected into the file (argument 2)', function(){
            storage.build( 'test' );

            storage.inject({ injected: 'injected' }, 'test' ).should.equal( true );

            storage.read( 'test' ).should.deep.equal({ injected: 'injected' });

            storage.delete( 'test' );
        });

        it( 'should accept an object as the first argument', function(){
            storage.build( 'test' );

            storage.inject({ injected: 'injected' }, 'test' ).should.equal( true );

            storage.delete( 'test' );
        });

        it( 'should inject properties from object (argument 1 ) into the file (argument 2)', function(){
            storage.build( 'test' );

            storage.inject({ injected: 'injected' }, 'test' );

            storage.read( 'test' ).should.deep.equal({ injected: 'injected' });

            storage.delete( 'test' );
        });

        it( 'should accept a filename as the first argument', function(){
            storage.build( 'test', { injected: "injected" });
            storage.build( 'test2' );

            var result = storage.inject( 'test', 'test2' );

            storage.delete( 'test' );
            storage.delete( 'test2' );
        });

        it( 'should inject properties from one file (argument 1), into another (argument 2)', function(){
            storage.build( 'test', { injected: 'injected' });
            storage.build( 'test2', { original: 'original' });

            storage.inject( 'test', 'test2' );

            storage.read( 'test2' ).should.deep.equal({ injected: 'injected', original: 'original' });

            storage.delete( 'test' );
            storage.delete( 'test2' );
        });
    });

    describe( '#generate()', function(){
        it( 'should generate a file within the current module base directory', function(){
            storage.generate();

            storage.exists( 'app:' + storage.configFileName ).should.equal( true );

            storage.delete( 'app:' + storage.configFileName );
        });

        it( 'should accept an object, and use it to populate the module config file', function(){
            storage.generate({ test: 'test' });

            storage.read( 'app:' + storage.configFileName ).should.deep.equal({ test: 'test' });

            storage.delete( 'app:' + storage.configFileName );
        });
    });

    describe( '#ignore()', function(){
        var defaultContents, appIgnorePath, rootIgnorePath, appOriginal, rootOriginal;

        beforeEach( function() {
            defaultContents = "node_modules/\ntest/\ncomponent.json\n.travis.yml\nMakefile";

            appIgnorePath = storage.resolve( 'app:.npmignore', false );
            rootIgnorePath = storage.resolve( 'root:.npmignore', false );

            // populate the original module file, if it doesn't exist
            if( ! storage.exists( 'app:.npmignore', false )){
                fs.openSync( appIgnorePath, 'w' );
                fs.writeFileSync( appIgnorePath, defaultContents, { encoding: 'utf8' });
                console.log( 'MODULE NPMIGNORE:' );
                console.log( fs.readFileSync( appIgnorePath, { encoding: "utf8" }))
            }

            // populate the original root file, if it doesn't exist
            if( appIgnorePath !== rootIgnorePath && ! storage.exists( 'root:.npmignore', false )){
                fs.openSync( rootIgnorePath, 'w' );
                fs.writeFileSync( rootIgnorePath, defaultContents, { encoding: 'utf8' });
                console.log( 'ROOT NPMIGNORE:' );
                console.log( fs.readFileSync( rootIgnorePath, { encoding: "utf8" }))
            }

            appOriginal = fs.readFileSync( appIgnorePath, { encoding: "utf8" });
            rootOriginal = fs.readFileSync( rootIgnorePath, { encoding: "utf8" });

            // destroy existing files
            fs.unlinkSync( appIgnorePath );
            if( appIgnorePath !== rootIgnorePath ) fs.unlinkSync( rootIgnorePath );
        });

        it( 'should create a .npmignore file within the module, if none exists', function(){
            storage.ignore( "config", { npmIgnore: true });
            storage.exists( 'app:.npmignore', false ).should.equal( true );
        });

        it( 'should create a .npmignore file within the root, if none exists', function(){
            storage.ignore( "config", { npmIgnore: true });
            storage.exists( 'root:.npmignore', false ).should.equal( true );
        });

        it( 'should append the config filename(s) into the .npmignore file, if the object\'s "npmIgnore" property equals true', function(){
            storage.ignore( "config", { npmIgnore: true });
            fs.readFileSync( rootIgnorePath, { encoding: "utf8" }).indexOf( 'config.json' ).should.not.equal( -1 );
        });

        it( 'should rermove the config filename(s) from the .npmignore file, if the object\'s "npmIgnore" property equals false', function(){
            storage.ignore( "config", { npmIgnore: false });
            fs.readFileSync( appIgnorePath, { encoding: "utf8" }).indexOf( 'config.json' ).should.equal( -1 );
            fs.readFileSync( appIgnorePath, { encoding: "utf8" }).indexOf( storage.configFileName ).should.equal( -1 );

            fs.readFileSync( rootIgnorePath, { encoding: "utf8" }).indexOf( 'config.json' ).should.equal( -1 );
            fs.readFileSync( rootIgnorePath, { encoding: "utf8" }).indexOf( storage.configFileName ).should.equal( -1 );
        });

        it( 'should not append the config filename(s) into the .npmignore file, if the object\'s "npmIgnore" property is undefined', function(){
            fs.openSync( rootIgnorePath, 'w' );
            fs.writeFileSync( rootIgnorePath, defaultContents, { encoding: 'utf8' });

            storage.ignore( "config", {});
            fs.readFileSync( rootIgnorePath, { encoding: "utf8" }).indexOf( 'config.json' ).should.equal( -1 );
        });

        it( 'should not append the file(s) into the .npmignore file, if they already exist', function(){
            fs.openSync( rootIgnorePath, 'w' );
            fs.writeFileSync( rootIgnorePath, defaultContents + "\nconfig.json", { encoding: 'utf8' });

            storage.ignore( "config", { npmIgnore: true });
            fs.readFileSync( rootIgnorePath, { encoding: "utf8" }).indexOf( "config.json\nconfig.json" ).should.equal( -1 );
        });

        it( 'should append the default config filename into the module\'s .npmignore file', function(){
            storage.ignore( "config", { npmIgnore: true });
            storage.exists( 'app:.npmignore', false ).should.equal( true );
            fs.readFileSync( appIgnorePath, { encoding: "utf8" }).indexOf( storage.configFileName ).should.not.equal( -1 );
        });

        it( 'should append the root config filename into the root .npmignore file', function(){
            storage.ignore( "config", { npmIgnore: true });
            storage.exists( 'root:.npmignore', false ).should.equal( true );
            fs.readFileSync( rootIgnorePath, { encoding: "utf8" } ).indexOf( 'config.json' ).should.not.equal( -1 );
        });

        afterEach( function(){
            if( storage.exists( 'app:.npmignore', false )) fs.unlinkSync( appIgnorePath );
            fs.openSync( appIgnorePath, 'w' );
            fs.writeFileSync( appIgnorePath, appOriginal, { encoding: 'utf8' });

            if( appIgnorePath !== rootIgnorePath ){
                if( storage.exists( 'root:.npmignore', false ) ) fs.unlinkSync( rootIgnorePath );
                fs.openSync( rootIgnorePath, 'w' );
                fs.writeFileSync( rootIgnorePath, rootOriginal, { encoding: 'utf8' } );
            }
        });
    });

    describe( '#config()', function(){
        it( 'should generate a file named "config.json" in the current module root', function(){
            storage.config();

            storage.exists( 'root:config.json' ).should.equal( true );

            storage.delete( 'root:config.json' );
            storage.delete( 'app:' + storage.configFileName );
        });

        it( 'should generate a file named "{ARGUMENT 1}.json" in the current module root', function(){
            storage.config( 'test_config' );

            storage.exists( 'root:test_config.json' ).should.equal( true );

            storage.delete( 'root:test_config.json' );
            storage.delete( 'app:' + storage.configFileName );
        });

        it( 'should generate the module config file, if it does not exist', function(){
            storage.config();

            storage.exists( 'app:' + storage.configFileName ).should.equal( true );

            storage.delete( 'root:config.json' );
            storage.delete( 'app:' + storage.configFileName );
        });

        it( 'should inject properties from the module config file, into the root config file', function(){
            storage.generate({ test: 'test' });
            storage.config();

            storage.read( 'root:config.json').should.deep.equal({ test: 'test' });

            storage.delete( 'root:config.json' );
            storage.delete( 'app:' + storage.configFileName );
        });

        it( 'should accept an object as argument 1, and inject its properties into the root "config.json" file', function(){
            storage.config({ config: 'config' });

            storage.read( 'root:config.json' ).should.deep.equal({ config: 'config' });

            storage.delete( 'root:config.json' );
            storage.delete( 'app:' + storage.configFileName );
        });

        it( 'should accept an object as argument 2, and inject its properties into the root "{ARGUMENT 1}.json" file', function(){
            storage.config( 'test_config', { test_config: 'test_config' });

            storage.read( 'root:test_config.json' ).should.deep.equal({ test_config: 'test_config' });

            storage.delete( 'root:test_config.json' );
            storage.delete( 'app:' + storage.configFileName );
        });

        it( 'should remove the "npmIgnore" property from the object before injecting into the module config file', function(){
            storage.config({ config: 'config', npmIgnore: true });

            storage.read( 'root:config.json' ).should.deep.equal({ config: 'config' });

            storage.delete( 'root:config.json' );
            storage.delete( 'app:' + storage.configFileName );
        });

        it( 'should apply the "npmIgnore" property to the module\'s .npmignore file, if set to true', function(){
            storage.config({ config: 'config', npmIgnore: true });

            fs.readFileSync( storage.resolve( 'root:.npmignore', false ), { encoding: "utf8" }).indexOf( 'config.json' ).should.not.equal( -1 );
            fs.readFileSync( storage.resolve( 'app:.npmignore', false ), { encoding: "utf8" }).indexOf( storage.configFileName ).should.not.equal( -1 );

            storage.delete( 'root:config.json' );
            storage.delete( 'app:' + storage.configFileName );
        });

        it( 'should remove the "npmIgnore" references from the module\'s .npmignore file, if set to false', function(){
            storage.config({ config: 'config', npmIgnore: false });

            fs.readFileSync( storage.resolve( 'root:.npmignore', false ), { encoding: "utf8" }).indexOf( 'config.json' ).should.equal( -1 );
            fs.readFileSync( storage.resolve( 'app:.npmignore', false ), { encoding: "utf8" }).indexOf( storage.configFileName ).should.equal( -1 );

            storage.delete( 'root:config.json' );
            storage.delete( 'app:' + storage.configFileName );
        });
    });

    describe( '#include()', function(){
        it( 'should remove all storage.config filenames from the .npmignore files when passed options with property "npmIgnore" set to false', function(){
            storage.include();
            fs.readFileSync( storage.resolve( 'app:.npmignore', false ), { encoding: "utf8" }).indexOf( 'config.json' ).should.equal( -1 );
            fs.readFileSync( storage.resolve( 'app:.npmignore', false ), { encoding: "utf8" }).indexOf( storage.configFileName ).should.equal( -1 );

            fs.readFileSync( storage.resolve( 'root:.npmignore', false ), { encoding: "utf8" }).indexOf( 'config.json' ).should.equal( -1 );
            fs.readFileSync( storage.resolve( 'root:.npmignore', false ), { encoding: "utf8" }).indexOf( storage.configFileName ).should.equal( -1 );
        });
    });
});