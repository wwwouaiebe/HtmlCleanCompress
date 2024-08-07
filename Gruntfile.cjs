/*
Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/

This  program is free software;
you can redistribute it and/or modify it under the terms of the
GNU General Public License as published by the Free Software Foundation;
either version 3 of the License, or any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/

/* eslint-disable no-magic-numbers */

// eslint-disable-next-line no-undef
module.exports = function ( grunt ) {

	grunt.initConfig ( {
		pkg : grunt.file.readJSON ( 'package.json' ),

		// eslint config

		eslint : {
			options : {
				fix : true,
				overrideConfigFile : 'eslint.config.js'
			},
			target : [ 'src/*.js' ]
		}
	} );

	// Build number

	grunt.config.data.pkg.buildNumber = grunt.file.readJSON ( 'buildNumber.json' ).buildNumber;
	grunt.config.data.pkg.buildNumber =
		( '00000' + ( Number.parseInt ( grunt.config.data.pkg.buildNumber ) + 1 ) ).slice ( -5 );
	grunt.file.write ( 'buildNumber.json', '{ "buildNumber" : "' + grunt.config.data.pkg.buildNumber + '"}' );

	grunt.loadNpmTasks ( 'grunt-eslint' );

	grunt.registerTask (
		'default',
		[ 'eslint' ]
	);

	/* eslint-disable no-console */

	console.log ( '-------------------------------------------------------------------------------------------------------' );
	console.log (
		'\n                                     ' +
		grunt.config.data.pkg.name +
		' - ' +
		grunt.config.data.pkg.version +
		' - build: ' + grunt.config.data.pkg.buildNumber +
		' - ' +
		grunt.template.today ( 'isoDateTime' ) + '\n' );
	console.log ( '-------------------------------------------------------------------------------------------------------' );
};