var fs = require( "fs" );
var path = require( "path" );

var storage = require( '../index' );
require( 'chai' ).should();

var filename_options = {
    stubs: [
        'app', 'root',
    ],

    paths: [
        'test',
        'test.json',
        'test.json.json',
        'test.json.property',
        'test/test',
        'test/test.json',
        'test/test.json.json',
        'test/test.json.property',
    ],

    fails: [
        false,
        '.json'
    ]
}

/*

describe( 'storage.json', function(){

    //TODO hasStub -> getName

    describe( '#extended()', function(){
        it( 'should return false when no extension within storage.fileExtensions is present', function(){
            storage.extended( 'file' ).should.equal( false );
        });

        it( 'should return true when any extension from storage.fileExtensions is present', function(){
            for( var key in Object.keys( storage.fileExtensions )){
                var index = Object.keys( storage.fileExtensions )[ key ];
                storage.extended( 'file' + storage.fileExtensions[ index ]).should.equal( true );
            }
        });

        it( 'should return true, when the filename already contains an extension', function(){
            storage.extended( 'test.npmignore' ).should.equal( true );
            storage.extended( '.npmignore' ).should.equal( true );
            storage.extended( 'app:.npmignore' ).should.equal( true );
            storage.extended( '/test/.npmignore' ).should.equal( true );

            storage.extended( 'test.gitignore' ).should.equal( true );
            storage.extended( '.gitignore' ).should.equal( true );
            storage.extended( 'app:.gitignore' ).should.equal( true );
            storage.extended( '/test/.gitignore' ).should.equal( true );

            storage.extended( 'test.json' ).should.equal( true );
            storage.extended( '.json' ).should.equal( true );
            storage.extended( 'app:test.json' ).should.equal( true );
            storage.extended( '/test/test.json' ).should.equal( true );
        });
    });

    describe( '#extend()', function(){
        it( 'should add ".json" extension to the filename when no extension within storage.fileExtensions is present', function(){
            storage.extend( 'file' ).should.equal( 'file.json' );
        });

        it( 'should not add ".json" extension to the filename when an extension from storage.fileExtensions is present', function(){
            storage.extend( 'test.npmignore' ).should.equal( 'test.npmignore' );
            storage.extend( '.npmignore' ).should.equal( '.npmignore' );
            storage.extend( 'app:.npmignore' ).should.equal( 'app:.npmignore' );
            storage.extend( '/test/.npmignore' ).should.equal( '/test/.npmignore' );

            storage.extend( 'test.gitignore' ).should.equal( 'test.gitignore' );
            storage.extend( '.gitignore' ).should.equal( '.gitignore' );
            storage.extend( 'app:.gitignore' ).should.equal( 'app:.gitignore' );
            storage.extend( '/test/.gitignore' ).should.equal( '/test/.gitignore' );

            storage.extend( 'test.json' ).should.equal( 'test.json' );
            storage.extend( '.json' ).should.equal( '.json' );
            storage.extend( 'app:test.json' ).should.equal( 'app:test.json' );
            storage.extend( '/test/test.json' ).should.equal( '/test/test.json' );
        });

        it( 'should extract extensions separated using a tilde (~), and apply them before extending', function(){
            storage.extend( 'test~json' ).should.equal( 'test.json' );
            storage.extend( 'test~npmignore' ).should.equal( 'test.npmignore' );
            storage.extend( '~json' ).should.equal( '.json' );
            storage.extend( '~npmignore' ).should.equal( '.npmignore' );
        });
    });

    describe( '#parse()', function(){
        it( 'should return an object mathcing "{ name: false }", if not passed a valid string', function(){
            storage.parse( false ).should.deep.equal({ name: false });
            storage.parse( true ).should.deep.equal({ name: false });
            storage.parse( null ).should.deep.equal({ name: false });
        });

        it( 'should parse file paths which prefix the filename separated by a colon', function(){
            storage.parse( 'root:filename' ).should.deep.equal({ name: 'filename.json', path: storage.directory.root(), prop: '', file: 'root:filename.json' });
        });

        it( 'should return an empty path, if none was present', function(){
            storage.parse( 'filename' ).should.deep.equal({ name: 'filename.json', path: '', prop: '', file: 'filename.json' });
        });

        it( 'should parse "dot" notation within the filename as properties', function(){
            storage.parse( 'filename.property' ).should.deep.equal({ name: 'filename.json', path: '', prop: 'property', file: 'filename.json' });
        });

        it( 'should parse file names with extensions, without adding an extension', function(){
            storage.parse( 'test.npmignore' ).should.deep.equal({ name: 'test.npmignore', path: '', prop: '', file: 'test.npmignore' });
            storage.parse( '.npmignore' ).should.deep.equal({ name: '.npmignore', path: '', prop: '', file: '.npmignore' });
            storage.parse( 'test.json' ).should.deep.equal({ name: 'test.json', path: '', prop: '', file: 'test.json' });
            storage.parse( 'test.json.property' ).should.deep.equal({ name: 'test.json', path: '', prop: 'property', file: 'test.json' });
        });

        it( 'should parse file names which contain only an extension, and return only the extension', function(){
            storage.parse( '.npmignore' ).name.should.equal( '.npmignore' );
            storage.parse( 'root:.npmignore' ).name.should.equal( '.npmignore' );
        });

        it( 'should ignore file extensions when parsing "dot" notation strings', function(){
            for( var key in Object.keys( storage.fileExtensions )){
                var extension = storage.fileExtensions[ Object.keys( storage.fileExtensions )[ key ]];


                //with folders
                storage.parse( 'files/filename' + extension ).should.deep.equal({ name: 'filename' + extension, path: 'files', prop: '', file: 'files/filename' + extension });
                //with path
                storage.parse( 'root:filename' + extension ).should.deep.equal({ name: 'filename' + extension, path: storage.directory.app(), prop: '', file: 'root:filename' + extension });
                //without path
                storage.parse( 'filename' + extension ).should.deep.equal({ name: 'filename' + extension, path: '', prop: '', file: 'filename' + extension });
                //extension only
                storage.parse( extension ).should.deep.equal({ name: extension, path: '', prop: '', file: extension });
            }
        });
    });

    describe( '#resolve()', function(){
        it( 'should resolve the file name with extension', function(){
            storage.resolve( 'filename.json' ).should.equal( path.resolve( 'filename.json' ));
        });

        it( 'should resolve the file name without extension', function(){
            storage.resolve( 'filename' ).should.equal( path.resolve( 'filename.json' ));
        });

        it( 'should resolve the proper path to the current application', function(){
            storage.resolve( 'app:filename.json' ).should.equal( path.resolve([ path.resolve( './' ), 'filename.json' ].join( '/' )));
        });

        it( 'should resolve the proper path to the root directory', function(){
            storage.resolve( 'root:filename.json' ).should.equal( path.resolve( './filename.json' ));
        });

        it( 'should resolve the proper path to the storage.json module', function(){
            storage.resolve( 'storage:filename.json' ).should.equal( path.resolve( './filename.json' ));
        });

        it( 'should resolve the proper path when provided a complete path', function(){
            storage.resolve( '/other/directory/filename.json' ).should.equal( path.resolve( '/other/directory/filename.json' ));
        });

        it( 'should resolve the proper path when provided a complete path ( including "dot" folders like "storage.json" )', function(){
            storage.resolve( '/other/storage.json/filename.json' ).should.equal( path.resolve( '/other/storage.json/filename.json' ));
        });
    });

    describe( '#exists()', function(){
        beforeEach( function(){
            fs.openSync( storage.resolve( 'test' ), 'w' );
        });

        afterEach( function(){
            fs.unlinkSync( storage.resolve( 'test' ));
        });

        it( 'should return false if the file is missing', function(){
            storage.exists( 'missing' ).should.equal( false );
        });

        it( 'should return true if the file is located', function(){
            storage.exists( 'test' ).should.equal( true );
        });

        it( 'should extract the filename from "dot" notation strings before asserting', function(){
            storage.exists( 'test.nested.value' ).should.equal( true );
        });

        it( 'should use the parsed filename ( including extenstion ) to assert existence', function(){
            fs.openSync( storage.resolve( '.gitignore' ), 'w' );

            storage.exists( '.gitignore' ).should.equal( true );

            fs.unlinkSync( storage.resolve( '.gitignore' ));
        });
    });

    describe( '#format()', function(){
        it( 'should apply JSON stringify when the file\'s extension is ".json" OR has been omitted', function(){
            storage.format( 'test', { format: 'format' }).should.equal( JSON.stringify({ format: 'format' }, null, 2 ));
        });

        it( 'should not apply JSON stringify, when the filename contains an extension, other than ".json"', function(){
            var test_files = [ 'test.npmignore', '.npmignore', 'test.gitignore', '.gitignore' ];

            for( var key in Object.keys( test_files )) storage.format( test_files[ Object.keys( test_files )[ key ]], "file contents" ).should.equal( "file contents" );
        });

        it( 'should apply standard JSON spacing (2), when nothing is passed as argument 3', function(){
            storage.format( 'test', { format: 'format' }).should.equal( JSON.stringify({ format: 'format' }, null, 2 ));
        });

        it( 'should apply alertnate JSON spacing, when an integer is passed as argument 3', function(){
            storage.format( 'test', { format: 'format' }, 1 ).should.equal( JSON.stringify({ format: 'format' }, null, 1 ));
            storage.format( 'test', { format: 'format' }, 3 ).should.equal( JSON.stringify({ format: 'format' }, null, 3 ));
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

        it( 'should write only an empty string if any extension other than ".json" is provided', function(){
            storage.exists( '.gitignore' ).should.equal( false );
            storage.build( '.gitignore' );
            storage.exists( '.gitignore' ).should.equal( true );
            storage.read( '.gitignore' ).should.equal( '' );

            storage.delete( 'test' );
        });

        it( 'should ignore "dot" notation strings when creating a new file', function(){
            storage.exists( 'test' ).should.equal( false );
            storage.build( 'test.nested.attribute' );
            storage.exists( 'test' ).should.equal( true );

            storage.delete( 'test' );
        });
    });

    describe( '#insist()', function(){
        afterEach( function(){
            storage.delete( 'test' );
            storage.delete( 'test/test' );
        });

        it( 'should create the file matching filename if it does not exist', function(){
            storage.insist( 'test' );
            storage.exists( 'test' ).should.equal( true );
        });

        it( 'should return the file scoping path', function(){
            //force app to differ from root
            var original = storage.directory.list.app;
            storage.directory.list.app = 'test';
            storage.directory.list.app.should.not.equal( storage.directory.list.root );

            storage.insist( 'test' ).should.equal( 'test.json' );
            storage.insist( 'app:test' ).should.equal( 'app:test.json' );
            storage.insist( 'root:test' ).should.equal( 'root:test.json' );

            //restore original app path
            storage.directory.list.app = original;
        });

        it( 'should ignore any "dot" notation properties within the filename', function(){
            storage.insist( 'test.deeply.nested.property' );
            storage.exists( 'test' ).should.equal( true );
        });

        it( 'should remove any "dot" notation properties from the returned filename', function(){
            storage.insist( 'test.deeply.nested.property' ).should.equal( 'test.json' );
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
        var obj = { first: 'first test', second: 'second test' };

        before( function(){
            storage.build( 'test', obj );
        });

        after( function(){
            storage.delete( 'test' );
        });

        it( 'should return the contents of a non JSON file as a string', function(){
            storage.delete( '.npmignore' );
            storage.build( '.npmignore', 'ignoring...');
            storage.read( '.npmignore' ).should.equal( 'ignoring...' );

            storage.delete( '.npmignore' );
            storage.build( '.npmignore' );
            storage.read( '.npmignore' ).should.equal( '' );

            storage.delete( '.npmignore' );
        });

        it( 'should return the contents of a JSON file as an object', function(){
            storage.read( 'test' ).should.deep.equal( obj );
        });

        it( 'should return the value of "dot" notated properties within the filename', function(){
            storage.read( 'test.first' ).should.equal( 'first test' );
        });

        it( 'should return undefined, if the file was not found', function(){
            var results =  storage.read( 'testing' ) === undefined;

            results.should.equal( true );
        });

        it( 'should return undefined, if the "dot" notated properties were not found', function(){
            var results =  storage.read( 'test.third' ) === undefined;

            results.should.equal( true );
        });
    });

    describe( '#insert()', function(){
        var orig;

        beforeEach( function(){
            orig = { original: { tree: 'tree' }};
        });

        it( 'should assign the value (argument 3) to the "dot" notation property (argument 2) within the object (argument 1)', function(){
            storage.insert( orig, 'test', 'test' ).should.deep.equal({ original: { tree: 'tree' }, test: 'test' });
        });

        it( 'should override the existing value, if present', function(){
            storage.insert( orig, 'original', 'test' ).should.deep.equal({ original: 'test' });
        });

        it( 'should insert the value regardless of "dot" notation property depth', function(){
            storage.insert( orig, 'original.tree.roots.value', 'test' ).should.deep.equal({ original: { tree: { roots: { value: 'test' }}}});
        });

        it( 'should not effect other properties within the same property tree', function(){
            storage.insert( orig, 'original.test', 'test' ).should.deep.equal({ original: { tree: 'tree' , test: 'test' }});
        });
    });

    describe( '#inject()', function(){
        beforeEach( function(){
            storage.build( 'inject' );
            storage.build( 'injectFrom', { injected: "injected", injecting: { deep: 'deep' }});
        });

        afterEach( function(){
            storage.delete( 'inject' );
            storage.delete( 'injectFrom' );
        });

        it( 'should create a new file, if the target file does not exist', function(){
            storage.delete( 'inject' );

            storage.inject( 'injectFrom', 'inject' ).should.equal( true );

            storage.exists( 'inject' ).should.equal( true );
        });

        it( 'should return an object if both arguments are objects', function(){
            storage.inject({ injected: 'injected' }, { existing: 'existing' }).should.deep.equal({ injected: 'injected', existing: 'existing' });
        });

        it( 'should inject properties from object (argument 1) into a file (argument 2)', function(){
            storage.inject({ injected: 'injected' }, 'inject' );

            storage.read( 'inject' ).should.deep.equal({ injected: 'injected' });
        });

        it( 'should inject properties from one file (argument 1), into another (argument 2)', function(){
            storage.inject( 'injectFrom', 'inject' );
            storage.read( 'inject' ).should.deep.equal({ injected: "injected", injecting: { deep: 'deep' }});
        });

        it( 'should extract data from a file when passed a "dot" notation property as argument 1', function(){
            storage.inject( 'injectFrom.injecting', 'inject' );
            storage.read( 'inject' ).should.deep.equal({ deep: 'deep' });
        });

        it( 'should create properties passed with "dot" notation (argument 2), if they do not exist within the file', function(){
            storage.inject( 'injectFrom', 'inject.deep' );
            storage.read( 'inject' ).should.deep.equal({ deep: { injected: "injected", injecting: { deep: 'deep' }}});
        });

        it( 'should assign property values to deep properties when passed "dot" notation as argument 2', function(){
            storage.inject( 'injectFrom', 'inject.newly.created' );
            storage.read( 'inject' ).should.deep.equal({ newly: { created: { injected: "injected", injecting: { deep: 'deep' }}}});
        });

        it( 'should assign a string value (argument 1) to a "dot" notation property (argument 2)', function(){
            storage.inject( 'string', 'inject.string' );
            storage.read( 'inject' ).should.deep.equal({ string: 'string' });
        });

        it( 'should assign a boolean value (argument 1) to a "dot" notation property (argument 2)', function(){
            storage.inject( false, 'inject.string' );
            storage.read( 'inject' ).should.deep.equal({ string: false });
        });

        it( 'should assign a null value (argument 1) to a "dot" notation property (argument 2)', function(){
            storage.inject( null, 'inject.nil' );
            storage.read( 'inject' ).should.deep.equal({ nil: null });
        });
    });

    describe( '#flatten()', function(){
        var full = { a: { deeply: { nested: { property: 'value', string: 'string' }}}};
        var flat = { "a.deeply.nested.property": 'value', "a.deeply.nested.string": 'string' };

        it( 'should remove all nested properties and replace them with "dot" notation strings', function(){
            storage.flatten( full ).should.deep.equal( flat );
        });
    });

    describe( '#inflate()', function(){
        var full = { a: { deeply: { nested: { property: 'value', string: 'string' }}}};
        var flat = { "a.deeply.nested.property": 'value', "a.deeply.nested.string": 'string' };

        it( 'should remove all "dot" notation strings and replace them with nested properties', function(){
            storage.inflate( flat ).should.deep.equal( full );
        });
    });

    describe( '#search()', function(){
        var deeply_nested = { a: { deeply: { nested: { property: 'value' }}}};

        it( 'should return the value of deeply nested properties using "dot" notation', function(){
            var results = storage.search( deeply_nested, 'a.deeply.nested.property' ) === undefined;

            results.should.equal( false );

            storage.search( deeply_nested, 'a.deeply.nested.property' ).should.equal( 'value' );
        });

        it( 'should return undefined if the property was not located/assigned', function(){
            var results = storage.search( deeply_nested, 'a.deeply.nested.prop' ) === undefined;

            results.should.equal( true );
        });
    });

    describe( '#scaffold()', function(){
        it( 'should build a simple object when provided a simple property', function(){
            storage.scaffold( 'property', 'value' ).should.deep.equal({ property: 'value' });
        });

        it( 'should build an object with deeply nested properties using "dot" notation', function(){
            storage.scaffold( 'a.deeply.nested.property', 'value' ).should.deep.equal({ a: { deeply: { nested: { property: 'value' }}}});
        });

        it( 'should not destroy existing properties while injecting the "dot" notation properties', function(){
            storage.scaffold( 'a.deeply.nested.property2', 'scaffolded', { a: { deeply: { nested: { property: 'value' }}}}).should.deep.equal({ a: { deeply: { nested: { property: 'value', property2: 'scaffolded' }}}});
        });

        it( 'should overwrite the existing property value for the provided "dot" notation property', function(){
            storage.scaffold( 'a.deeply.nested.property', 'scaffolded', { a: { deeply: { nested: { property: 'value' }}}}).should.deep.equal({ a: { deeply: { nested: { property: 'scaffolded' }}}});
        });
    });

    describe( '#absorb()', function(){
        var original;

        beforeEach( function(){
            original = { an: { object: { which: { has: { very: { deeply: { nested: { properties: true }}}}}}}};
        });

        it( 'should return an object (argument 1) after it has absorbed the properties of another object (argument 2)', function(){
            var absorb = { an: { object: 7 }};

            storage.absorb( original, absorb ).should.deep.equal( absorb );
        });

        it( 'should contain properties from the absorbed object (argument 2), even when not originally defined within the object (argument 1)', function(){
            var absorb = { newProperty: {}};

            var expect = original;
            expect.newProperty = {};

            storage.absorb( original, absorb ).should.deep.equal( expect );
        });

        it( 'should not effect the properties of the object (argument 1), except when assigned within the absorbed object (argument 2)', function(){
            var absorb = { an: { object: { which: { has: { very: { deeply: { nested: { birds: false }}}}}}}};

            storage.absorb( original, absorb ).should.deep.equal({ an: { object: { which: { has: { very: { deeply: { nested: { properties: true, birds: false }}}}}}}});
        });

        it( 'should overwrite any properties, set within the absorbed object (argument 2), regardless of their depth', function(){
            var absorb = { an: { object: { which: { has: { very: { deeply: { nested: { properties: false }}}}}}}};

            storage.absorb( original, absorb ).should.deep.equal({ an: { object: { which: { has: { very: { deeply: { nested: { properties: false }}}}}}}});
        });

        it( 'should overwrite any properties, set within the absorbed object (argument 2), even when they cause increased depth', function(){
            var absorb = { an: { object: { which: { has: { very: { deeply: { nested: { properties: { which: { are: { now:{ even: { deeper: true }}}}}}}}}}}}};

            storage.absorb( original, absorb ).should.deep.equal( absorb );
        });
    });

    describe( '#extract()', function(){
        it( 'should return the value of an existing property from the object', function(){
            storage.extract({ existing: { exists: 'exists' }}, 'existing' ).should.deep.equal({ exists: 'exists' });
        });

        it( 'should return the value of "revert" if the property is not set AND a value is provided for "revert"', function(){
            storage.extract({ existing: { exists: 'exists' }}, 'missing', { revert: 'revert' }).should.deep.equal({ revert: 'revert' });
        });

        it( 'should return "undefined" if the property is not set within the file AND nothing is passed for "revert"', function(){
            var result = storage.extract({ existing: { exists: 'exists' }}, 'missing' ) === undefined;

            result.should.equal( true );
        });

        it( 'should parse "dot" notation within the "property" to extract deep properties', function(){
            storage.extract({ existing: { exists: 'exists' }}, 'existing.exists' ).should.equal( 'exists' );
        });
    });

    describe( '#pluck()', function(){
        var object = { pluck: "success" };
        it( 'should return the value of the property if assigned within the object', function(){
            storage.pluck( object, 'pluck' ).should.equal( "success" );
        });

        it( 'should return the value of the "revert" argument, if the property was not assigned within the object, and "revert" was defined', function(){
            storage.pluck( object, 'missing', "revert" ).should.equal( "revert" );
        });

        it( 'should return undefined if the property was not assigned within the object, and "revert" argument was not passed', function(){
            var result = storage.pluck( object, 'missing' ) === undefined;

            result.should.equal( true );
        });

        it( 'should throw an error if either argument is invalid', function(){
            try{ storage.pluck( 'not an object', 'missing' ); }
            catch( e ){ e.message.should.equal( 'Invalid argument passed for "storage.pluck()"' ); }

            try{ storage.pluck({}, 100 ); }
            catch( e ){ e.message.should.equal( 'Invalid argument passed for "storage.pluck()"' ); }
        });

        it( 'should affect the original object that was passed ( by reference )', function(){
            var obj = { remove: "failed", pluck: "success" };

            storage.pluck( obj, 'remove' );

            obj.should.deep.equal({ pluck: "success" });
        });


    });

    describe( '#generate()', function(){
        it( 'should generate a file within the current module base directory', function(){
            storage.generate();

            storage.exists( 'app:' + storage.rootFileName ).should.equal( true );

            storage.delete( 'app:' + storage.rootFileName );
        });

        it( 'should accept an object, and use it to populate the module f file', function(){
            storage.generate({ test: 'test' });

            storage.read( 'app:' + storage.rootFileName ).should.deep.equal({ test: 'test' });

            storage.delete( 'app:' + storage.rootFileName );
        });
    });

    describe( '#paths()', function(){
        var expected = function( filename, include ){
            var paths = {};

            for( var key in Object.keys( include )) paths[ include[ Object.keys( include )[ key ]]] = storage.resolve( include[ Object.keys( include )[ key ]] + ':' + filename );

            for( var kee in Object.keys( paths )) if( Object.keys( paths )[ kee ] !== 'root' && paths[ Object.keys( paths )[ kee ]] === paths.root ) delete paths[ Object.keys( paths )[ kee ]];

            return paths;
        };

        it( 'should return all possible paths for the filename (argument 1)', function(){
            storage.paths( 'test' ).should.deep.equal( expected( 'test', [ 'app', 'root', 'storage' ]));
        });

        it( 'should only return paths listed within the list (argument 2)', function(){
            storage.paths( 'test', [ 'app' ]).should.deep.equal( expected( 'test', [ 'app' ]));
        });

        it( 'should only provide paths to "app" and "root" if the filename is an "ignore" file', function(){
            storage.paths( '.npmignore' ).should.deep.equal( expected( '.npmignore', [ 'app', 'root' ]));
        });

        it( 'should not contain paths which were duplicates of the "root" path', function(){
            var paths = storage.paths( 'test' );

            for( var key in Object.keys( paths )) if( Object.keys( paths )[ key ] !== 'root' ) paths[ Object.keys( paths )[ key ]].should.not.equal( paths.root );
        });
    });

    describe( '#ignore()', function(){
        var defaultContents, appIgnorePath, rootIgnorePath, appOriginal, rootOriginal;

        beforeEach( function() {
            defaultContents = "node_modules/\ntest/\ncomponent.json\n.travis.yml\nMakefile";

            appIgnorePath = storage.resolve( 'app:.npmignore' );
            rootIgnorePath = storage.resolve( 'root:.npmignore' );

            // populate the original module file, if it doesn't exist
            if( ! storage.exists( 'app:.npmignore' )){
                fs.openSync( appIgnorePath, 'w' );
                fs.writeFileSync( appIgnorePath, defaultContents, { encoding: 'utf8' });
            }

            // populate the original root file, if it doesn't exist
            if( appIgnorePath !== rootIgnorePath && ! storage.exists( 'root:.npmignore' )){
                fs.openSync( rootIgnorePath, 'w' );
                fs.writeFileSync( rootIgnorePath, defaultContents, { encoding: 'utf8' });
            }

            appOriginal = fs.readFileSync( appIgnorePath, { encoding: "utf8" });
            rootOriginal = fs.readFileSync( rootIgnorePath, { encoding: "utf8" });

            // destroy existing files
            fs.unlinkSync( appIgnorePath );
            if( appIgnorePath !== rootIgnorePath ) fs.unlinkSync( rootIgnorePath );
        });

        it( 'should create a .npmignore file within the module, if none exists', function(){
            storage.ignore( '.npmignore' );
            storage.exists( 'app:.npmignore' ).should.equal( true );
        });

        it( 'should create a .npmignore file within the root, if none exists', function(){
            storage.ignore( '.npmignore' );
            storage.exists( 'root:.npmignore' ).should.equal( true );
        });

        it( 'should append the app filename into the .npmignore files', function(){
            storage.ignore( '.npmignore' );

            var paths = storage.paths( '.npmignore' );

            for( var key in Object.keys( paths )) fs.readFileSync( paths[ Object.keys( paths )[ key ]], { encoding: "utf8" }).indexOf( storage.fileName ).should.not.equal( -1 );
        });

        it( 'should append the root filename into the .npmignore files', function(){
            storage.ignore( '.npmignore' );

            var paths = storage.paths( '.npmignore' );

            for( var key in Object.keys( paths )) fs.readFileSync( paths[ Object.keys( paths )[ key ]], { encoding: "utf8" }).indexOf( storage.rootFileName ).should.not.equal( -1 );
        });

        afterEach( function(){
            if( storage.exists( 'app:.npmignore'  )) fs.unlinkSync( appIgnorePath );
            fs.openSync( appIgnorePath, 'w' );
            fs.writeFileSync( appIgnorePath, appOriginal, { encoding: 'utf8' });

            if( appIgnorePath !== rootIgnorePath ){
                if( storage.exists( 'root:.npmignore' )) fs.unlinkSync( rootIgnorePath );
                fs.openSync( rootIgnorePath, 'w' );
                fs.writeFileSync( rootIgnorePath, rootOriginal, { encoding: 'utf8' } );
            }
        });
    });

    describe( '#include()', function(){
        it( 'should remove references to config filenames from the .npmignore files', function(){
            storage.include( '.npmignore' );

            storage.read( '.npmignore' ).indexOf( storage.fileName ).should.equal( -1 );
            storage.read( '.npmignore' ).indexOf( storage.rootFileName ).should.equal( -1 );
        });

        after( function(){
            var npmignore = "node_modules/\ntest/\ncomponent.json\n.travis.yml\nMakefile";

            fs.writeFileSync( storage.resolve( 'root:.npmignore' ), npmignore, { encoding: "utf8" });
        });
    });

    describe( '#setup()', function(){
        var originals, test_options;

        beforeEach( function(){
            originals = {
                fileName: storage.fileName,
                rootFileName: storage.rootFileName,
                fileExtensions: storage.fileExtensions
            };

            test_options = {
                npmIgnore: true,
                gitIgnore: true,
                fileName: 'file.changed',
                rootFileName: 'root.changed',
                fileExtensions: [ '.npmignore', '.json', '.gitignore' ],
                otherOption: 'other'
            };
        });

        afterEach( function(){
           storage.setup( originals );
        });

        it( 'should return an object, after removing the storage.json specific properties', function(){
            storage.setup( test_options ).should.deep.equal({ otherOption: 'other' });
        });

        it( 'should use the storage.json specific properties, to alter the instance settings', function(){
            storage.directory.list.app = 'test'

            storage.setup( test_options );

            storage.fileName.should.equal( 'file.changed' );
            storage.rootFileName.should.equal( 'root.changed' );

            storage.fileExtensions.should.deep.equal([ '.npmignore', '.json', '.gitignore' ]);
        });
    });

    describe( '#config()', function(){
        beforeEach( function(){});

        afterEach( function(){
            storage.delete( 'app:config' );
            storage.delete( 'root:config' );
            storage.delete( storage.fileName );
            storage.delete( storage.rootFileName );
        });

        describe( 'arg:filename (required)', function(){
            it( 'should accept a string, to be set as rootFileName within "options"', function(){
                storage.config( 'config.json' );
                storage.rootFileName.should.equal( 'config.json' );
            });

            it( 'should accept an object, to be used in place of "options"', function(){
                storage.config({ rootFileName: 'config.json' });
                storage.rootFileName.should.equal( 'config.json' );
            });
        });

        describe( 'arg:options (default:{})', function(){
            it( 'should be optional', function(){
                storage.config( 'config.json' );
                storage.rootFileName.should.equal( 'config.json' );
            });

            it( 'should accept an object, and bootstrap the instance with its values', function(){
                storage.config( 'config.json', { fileName: 'configure.json' });
                storage.fileName.should.equal( 'configure.json' );
            });

            it( 'should accept the "defaults" object, if the "options" object was passed as argument 1', function(){
                storage.config({ fileName: 'config.json' }, { host: '10.0.0.1' });
                storage.read( storage.fileName ).should.deep.equal({ host: '10.0.0.1' });
            });
        });

        describe( 'arg:defaults (default:{})', function(){
            it( 'should be optional', function(){
                storage.config( 'config.json' );
                storage.rootFileName.should.equal( 'config.json' );
            });

            it( 'should accept an object, and inject its properties into the module file ( if previously undefined )', function(){
                storage.config( 'config', { fileName: 'config.json', host: '10.0.0.2', defaults: { host: '10.0.0.1', unique: 'unique' }});
                storage.read( storage.fileName ).should.deep.equal({ host: '10.0.0.2', unique: 'unique' });
            });
        });

        it( 'should generate a file within the root directory, if it does not exist ( filename variable: rootFileName )', function(){
            storage.exists( 'root:config.json' ).should.equal( false );
            storage.config({ rootFileName: 'config.json' });
            storage.exists( 'root:config.json' ).should.equal( true );
        });

        it( 'should generate a file within the module directory, if it does not exist ( filename variable: fileName )', function(){
            storage.exists( 'app:config.json' ).should.equal( false );
            storage.config({ fileName: 'config.json' });
            storage.exists( 'app:config.json' ).should.equal( true );
        });

        it( 'should generate ONLY the root file, if module and root paths are identical', function(){
            var original = storage.directory.app;
            storage.directory.app = storage.directory.root;

            storage.resolve( 'app:config' ).should.equal( storage.resolve( 'root:config' ));

            storage.config({ fileName: 'module', rootFileName: 'config' });

            storage.exists( 'app:module' ).should.equal( false );
            storage.exists( 'root:config.json' ).should.equal( true );

            storage.directory.app = original;
        });

        it( 'should NOT generate the root file if options.rootFileName is set to false', function(){
            storage.exists( 'root:config' ).should.equal( false );

            storage.config({ rootFileName: false });

            if( storage.exists( 'root:config' )) console.log( 'EXISTS AFTER:', storage.read( 'root:config' ));

            storage.exists( 'root:config' ).should.equal( false );
        });

        it( 'should NOT generate the module file if options.fileName is set to false', function(){
            storage.exists( 'app:config.json' ).should.equal( false );
            storage.config({ fileName: false });
            storage.exists( 'app:config.json' ).should.equal( false );
        });

        it( 'should inject default properties into the module file, from the "defaults" object', function(){
            storage.config( 'config.json', { fileName: 'config.json', defaults: { host: '10.0.0.1' }});
            storage.read( storage.fileName ).should.deep.equal({ host: '10.0.0.1' });
        });

        it( 'should NOT overwrite existing properties with default values, in the module file', function(){
            storage.config( 'config', { fileName: 'config.json', host: '10.0.0.2' });
            storage.config( 'config', { fileName: 'config.json', defaults: { host: '10.0.0.1' }});
            storage.read( storage.fileName ).should.deep.equal({ host: '10.0.0.2' });
        });

        it( 'should override default properties within the module file, when assigned within options', function(){
            storage.config({ fileName: 'config.json', host: '10.0.0.2', defaults: { host: '10.0.0.1' }});
            storage.read( storage.fileName ).should.deep.equal({ host: '10.0.0.2' });
        });

        it( 'should copy existing properties into the root file, from the module file, if both files exist', function(){
            storage.config( 'config', { fileName: 'config.json', host: '10.0.0.2', defaults: { host: '10.0.0.1' }});
            storage.read( storage.rootFileName ).should.deep.equal({ host: '10.0.0.2' });
        });

        it( 'should inject properties into the root file, if the module file does not exist', function(){
            storage.config( 'config', { fileName: false, defaults: { host: '10.0.0.1' }});
            storage.read( storage.rootFileName ).should.deep.equal({ host: '10.0.0.1' });
        });
    });

    describe( '#has()', function(){
        before( function(){
            storage.build( 'test', { existing: { exists: 'exists' }});
        });

        after( function(){
            storage.delete( 'test' );
        });
        it( 'should return true if the file exists and contains the "dot" notation properties provided', function(){
            storage.has( 'test' ).should.equal( true );
            storage.has( 'test.existing' ).should.equal( true );
        });

        it( 'should return false if the file does not exist', function(){
            storage.has( 'tests' ).should.equal( false );
        });

        it( 'should return false if the file does not contain the "dot" notation properties', function(){
            storage.has( 'test.missing' ).should.equal( false );
        });
    });

    describe( '#get()', function(){
        var obj = { first: 'first test', second: 'second test' };

        before( function(){
            storage.build( 'test', obj );
        });

        after( function(){
            storage.delete( 'test' );
        });

        it( 'should return the contents of a file as an object', function(){
            storage.get( 'test' ).should.deep.equal( obj );
        });

        it( 'should return the value of "dot" notation properties within a file', function(){
            storage.get( 'test.first' ).should.equal( 'first test' );
        });

        it( 'should return undefined if the file does not exist', function(){
            var results = storage.get( 'missing' ) === undefined;

            results.should.equal( true );
        });

        it( 'should return undefined if the "dot" notation property does not exist within a file', function(){
            var results = storage.get( 'test.missing' ) === undefined;

            results.should.equal( true );
        });

        it( 'should return the value of "revert" if the file OR "dot" notation property did not exist, AND a value was provided for "revert"', function(){
            storage.get( 'missing', { reverted: 'missing file' }).should.deep.equal({ reverted: 'missing file' });

            storage.get( 'test.missing', { reverted: 'missing property' } ).should.deep.equal({ reverted: 'missing property' });
        });
    });

    describe( '#set()', function(){
        var obj, set_to;

        beforeEach( function(){
            obj = { first: 'first test', second: 'second test' };
            set_to = { first: 'first', second: 'second' };
            storage.build( 'test', obj );
        });

        afterEach( function(){
            storage.delete( 'test' );
        });

        it( 'should set the contents of the "dot" notation file property to the value provided', function(){
            storage.set( 'test.imbed', set_to );

            storage.get( 'test.imbed' ).should.deep.equal( set_to );
        });

        it( 'should create a new file if the file does not exist', function(){
            storage.set( 'testing.imbed', set_to );

            storage.exists( 'testing' ).should.equal( true );

            storage.delete( 'testing' );
        });

        it( 'should return true if the file contents were changed', function(){
            var result = storage.set( 'test.imbed', set_to );

            storage.get( 'test.imbed' ).should.deep.equal( set_to );

            result.should.equal( true );
        });

        it( 'should return false if the file contents were not changed', function(){
            var result = storage.set( 'test.first', obj.first );

            storage.get( 'test' ).should.deep.equal( obj );

            result.should.equal( false );
        });
    });
});*/