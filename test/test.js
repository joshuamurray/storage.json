var fs = require( "fs" );
var path = require( "path" );

var storage = require( '../index' );
var chai = require( 'chai' );
var expect = chai.expect;

chai.should();

describe( 'storage.json', function(){
    describe( '@Constructor', function(){
        it( 'should assign its "file" property a false value if not provided a String', function(){
            storage().file.should.equal( false );
            storage( 0 ).file.should.equal( false );
            storage( 7 ).file.should.equal( false );
            storage( '' ).file.should.equal( false );
            storage( {} ).file.should.equal( false );
            storage( [] ).file.should.equal( false );
            storage( null ).file.should.equal( false );
            storage( true ).file.should.equal( false );
            storage( false ).file.should.equal( false );
            storage( function(){ return 'string' }).file.should.equal( false );
        });

        it( 'should assign "file" property an instantiation of File( Class ) if provided a String', function(){
            var instance = storage( 'filename' );

            instance._file.should.equal( 'filename' );
            ( typeof instance.file.info ).should.equal( 'function' );
        });

        it( 'should assign the "path" property an instance of Path( Class ) while constructing', function(){
            ( typeof storage( 'filename' ).path.resolved ).should.equal( 'function' );
        });
    });

    //TODO REMOVE
    describe( '#function()', function(){
        it( 'should do something', function(){});
    });

    describe( 'Path: Class', function(){
        var Path;

        beforeEach( function(){
            Path = storage( 'filename' ).path;
        });

        describe( '@require()', function(){
            it( 'should return a function', function(){
                ( typeof require( '../lib/Path' )).should.equal( 'function' );
            });

            it( 'should return an instance of the Path Class when called', function(){
                var required = require( '../lib/Path' );

                ( typeof required().slash ).should.equal( 'object' );
                ( typeof required().slash.before ).should.equal( 'function' );
            });

            it( 'should accept the Storage class and set it as its "parent" property', function(){
                var parent = require( '../index' )( 'file' );
                var required = require( '../lib/Path' );
                required( parent ).parent.should.deep.equal( parent );
            });

            it( 'should not set the "parent" property if not provided an instance of the Storage Class', function(){
                var required = require( '../lib/Path' );
                var failures = [ undefined, 0, 7, '', {}, [], null, true, false, function(){ return 'string'; }];

                failures.forEach( function( value ){
                    expect( required( value ).parent ).to.be.undefined;
                });
            });
        });

        describe( '#init()', function(){
            it( 'should assign the "list" and "paths" properties if provided a "parent" ( Storage instance )', function(){
                var parent = require( '../index' )( 'file' );
                var required = require( '../lib/Path' );

                required = required( parent );

                ( typeof required.list ).should.equal( 'object' );
                ( typeof required.paths ).should.equal( 'object' );
            });

            it( 'should not assign the "list" or "paths" properties if not provided a "parent" ( Storage instance )', function(){
                var required = require( '../lib/Path' );

                expect( required().list ).to.be.undefined;
                expect( required().paths ).to.be.undefined;
            });
        });

        describe( '#slash.get()', function(){
            it( 'should return the current value representing a slash', function(){
                Path.slash.get().should.equal( '/' );
            });
        });

        describe( '#slash.get()', function(){
            it( 'should assign a string to the current value representing a slash', function(){
                Path.slash.set( '$' ).slash.get().should.equal( '$' );
            });

            it( 'should default to "/" for the current value representing a slash, if provided an invalid string', function(){
                Path.slash.set().slash.get().should.equal( '/' );
                Path.slash.set( 0 ).slash.get().should.equal( '/' );
                Path.slash.set( 7 ).slash.get().should.equal( '/' );
                Path.slash.set( '' ).slash.get().should.equal( '/' );
                Path.slash.set( {} ).slash.get().should.equal( '/' );
                Path.slash.set( [] ).slash.get().should.equal( '/' );
                Path.slash.set( null ).slash.get().should.equal( '/' );
                Path.slash.set( true ).slash.get().should.equal( '/' );
                Path.slash.set( false ).slash.get().should.equal( '/' );
                Path.slash.set( function(){ return 'string' }).slash.get().should.equal( '/' );
            });
        });

        describe( '#slash.before()', function(){
            it( 'should add a slash to the beginning of the provided string', function(){
                Path.slash.before( 'string' ).should.equal( '/string' );
            });

            it( 'should only have one slash at the beginning of the provided string', function(){
                Path.slash.before( '/string' ).should.equal( '/string' );
            });
        });

        describe( '#slash.after()', function(){
            it( 'should add a slash to the end of the provided string', function(){
                Path.slash.after( 'string' ).should.equal( 'string/' );
            });

            it( 'should only have one slash at the end of the provided string', function(){
                Path.slash.after( 'string/' ).should.equal( 'string/' );
            });
        });

        describe( '#slash.wrap()', function(){
            it( 'should add slashes to the beginning and end of the provided string', function(){
                Path.slash.wrap( 'string' ).should.equal( '/string/' );
            });

            it( 'should only have one slash at the beginning and end of the provided string', function(){
                Path.slash.wrap( '/string/' ).should.equal( '/string/' );
            });
        });

        describe( '#slash.trim()', function(){
            it( 'should remove any slashes from the beginning and end of the provided string', function(){
                Path.slash.trim( '/string' ).should.equal( 'string' );
                Path.slash.trim( 'string/' ).should.equal( 'string' );
                Path.slash.trim( '/string/' ).should.equal( 'string' );
            });

            it( 'should have no slashes at the beginning or end of the provided string', function(){
                Path.slash.trim( '//string//' ).should.equal( 'string' );
            });
        });

        describe( '#slash.clean()', function(){
            it( 'should remove excess slashes from the provided string ( // -> / )', function(){
                Path.slash.clean( 'string//slashed' ).should.equal( 'string/slashed' );
                Path.slash.clean( 'string///slashed' ).should.equal( 'string/slashed' );
            });
        });

        describe( '#resolved()', function(){
            it( 'should not require a colon when provided valid stub values', function(){
                Path.resolved( 'app' ).should.equal( Path.resolved( 'app:' ));
                Path.resolved( 'root' ).should.equal( Path.resolved( 'root:' ));
            });

            it( 'should provide the resolved path, when provided a valid stub', function(){
                Path.resolved( 'app' ).should.equal( '/Users/josh/code/Node Projects/storage.json/' );
                Path.resolved( 'root' ).should.equal( '/Users/josh/code/Node Projects/storage.json/' );
                Path.resolved( 'storage' ).should.equal( '/Users/josh/code/Node Projects/storage.json/' );
            });

            it( 'should provide the root path, when provided an invalid stub', function(){
                Path.resolved( 'invalid:' ).should.equal( Path.resolved( 'root' ));
            });

            it( 'should provide the resolved path, when provided a path', function(){
                Path.resolved( '/Users/josh/code/Node Projects/storage.json/' ).should.equal( '/Users/josh/code/Node Projects/storage.json/' );
                Path.resolved( '/Users/josh/code/Node Projects/storage.json' ).should.equal( '/Users/josh/code/Node Projects/storage.json/' );
                Path.resolved( 'Users/josh/code/Node Projects/storage.json/' ).should.equal( '/Users/josh/code/Node Projects/storage.json/' );
            });

            it( 'should provide the complete path, when provided a combination of stub and path', function(){
                Path.resolved( 'app:tests' ).should.equal( '/Users/josh/code/Node Projects/storage.json/tests/' );
                Path.resolved( 'app:tests/' ).should.equal( '/Users/josh/code/Node Projects/storage.json/tests/' );
                Path.resolved( 'app:/tests' ).should.equal( '/Users/josh/code/Node Projects/storage.json/tests/' );
            });
        });

        describe( '#stubbed()', function(){
            it( 'should provide the stubbed version of the path provided', function(){
                Path.stubbed( Path.resolved( 'app' )).should.equal( 'app:' );
            });
        });
    });

    describe( 'File: Class', function(){

    });

    describe( '@Usage', function(){
        describe( '#require()', function(){

        });

        describe( '#has()', function(){

        });

        describe( '#get()', function(){

        });

        describe( '#set()', function(){

        });

        describe( '#del()', function(){

        });
    });
});