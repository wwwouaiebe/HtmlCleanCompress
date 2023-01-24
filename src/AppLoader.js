/*
Copyright - 2021 - wwwouaiebe - Contact: https://www.ouaie.be/

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
/*
Changes:
	- v1.0.0:
		- created
*/
/* ------------------------------------------------------------------------------------------------------------------------- */

import fs from 'fs';
import process from 'process';
import theConfig from './Config.js';

/* ------------------------------------------------------------------------------------------------------------------------- */
/**
Start the app:
- read and validate the arguments
- set the config
- create the source file list
- remove the old documentation if any
*/
/* ------------------------------------------------------------------------------------------------------------------------- */

class AppLoader {

	/**
	The source files names, included the path since theConfig.srcDir
	@type {Array.<String>}
	*/

	#sourceFileNames;

	/**
	A const to use when exit the app due to a bad parameter
	@type {Number}
	*/

	// eslint-disable-next-line no-magic-numbers
	static get #EXIT_BAD_PARAMETER ( ) { return 9; }

	/**
	The version number
	@type {String}
	*/

	static get #version ( ) { return 'v1.0.0'; }

	/**
	The constructor
	*/

	constructor ( ) {
		Object.freeze ( this );
		this.#sourceFileNames = [];
	}

	/**
	Read **recursively** the contains of a directory and store all the html files found in the #sourceFileNames property
	@param {String} dir The directory to read. It's a relative path, starting at theConfig.srcDir ( the path
	given in the --src parameter )
	*/

	#readDir ( dir ) {

		// Searching all files and directories present in the directory
		const fileNames = fs.readdirSync ( theConfig.srcDir + dir );

		// Loop on the results
		fileNames.forEach (
			fileName => {

				// Searching the stat of the file/directory
				const lstat = fs.lstatSync ( theConfig.srcDir + dir + fileName );

				if ( lstat.isDirectory ( ) ) {

					// It's a directory. Reading this recursively
					this.#readDir ( dir + fileName + '/' );
				}
				else if ( lstat.isFile ( ) ) {

					// it's a file. Adding to the files list with the relative path, if the extension is 'js'
					if ( 'html' === fileName.split ( '.' ).reverse ( )[ 0 ] ) {
						this.#sourceFileNames.push ( dir + fileName );
					}
				}
			}
		);
	}

	/**
	Clean the previously created files, to avoid deprecated files.
	*/

	#cleanOldFiles ( ) {
		try {

			// Removing the complete documentation directory
			fs.rmSync (
				theConfig.destDir,
				{ recursive : true, force : true },
				err => {
					if ( err ) {
						throw err;
					}
				}
			);

			// and then recreating
			fs.mkdirSync ( theConfig.destDir );
		}
		catch {

			// Sometime the cleaning fails due to opened files
			console.error ( `\x1b[31mNot possible to clean the ${theConfig.destDir} folder\x1b[0m` );
		}
	}

	/**
	Show the help on the screen
	*/

	#showHelp ( ) {
		console.error ( '\n\t\x1b[36m--help\x1b[0m : this help\n' );
		console.error ( '\t\x1b[36m--version\x1b[0m : the version number\n' );
		console.error ( '\t\x1b[36m--src\x1b[0m : the path to the directory where the sources are located\n' );
		console.error (
			'\t\x1b[36m--dest\x1b[0m : the path to the directory where' +
			' the html have to be generated\n'
		);
		process.exit ( 0 );
	}

	/**
	Validate a path:
	- Verify that the path exists on the computer
	- verify that the path is a directory
	- complete the path with a \
	@param {String} path The path to validate
	*/

	#validatePath ( path ) {
		let returnPath = path;
		if ( '' === returnPath ) {
			console.error ( 'Invalid or missing \x1b[31m--src or dest\x1b[0m parameter' );
			process.exit ( AppLoader.#EXIT_BAD_PARAMETER );
		}
		let pathSeparator = null;
		try {
			returnPath = fs.realpathSync ( path );

			// path.sep seems not working...
			pathSeparator = -1 === returnPath.indexOf ( '\\' ) ? '/' : '\\';
			const lstat = fs.lstatSync ( returnPath );
			if ( lstat.isFile ( ) ) {
				returnPath = returnPath.substring ( 0, returnPath.lastIndexOf ( pathSeparator ) );
			}
		}
		catch {
			console.error ( 'Invalid path for the --src or --dest parameter \x1b[31m%s\x1b[0m', returnPath );
			process.exit ( AppLoader.#EXIT_BAD_PARAMETER );
		}
		returnPath += pathSeparator;
		return returnPath;
	}

	/**
	Complete theConfig object from the app parameters
	@param {?Object} options The options for the app
	*/

	#createConfig ( options ) {
		if ( options ) {
			theConfig.srcDir = options.src;
			theConfig.destDir = options.dest;
			theConfig.appDir = process.cwd ( ) + '/node_modules/htmlcleancompress/src';
			theConfig.clean = options.clean;
		}
		else {
			process.argv.forEach (
				arg => {
					const argContent = arg.split ( '=' );
					switch ( argContent [ 0 ] ) {
					case '--src' :
						theConfig.srcDir = argContent [ 1 ] || theConfig.srcDir;
						break;
					case '--dest' :
						theConfig.destDir = argContent [ 1 ] || theConfig.destDir;
						break;
					case '--clean' :
						theConfig.clean = true;
						break;
					case '--help' :
						this.#showHelp ( );
						break;
					case '--version' :
						console.error ( `\n\t\x1b[36mVersion : ${AppLoader.#version}\x1b[0m\n` );
						process.exit ( 0 );
						break;
					default :
						break;
					}
				}
			);
			theConfig.appDir = process.argv [ 1 ];
		}
		theConfig.srcDir = this.#validatePath ( theConfig.srcDir );
		theConfig.destDir = this.#validatePath ( theConfig.destDir );
		theConfig.appDir = this.#validatePath ( theConfig.appDir );

		if ( theConfig.srcDir === theConfig.destDir ) {
			console.error ( 'The --src and --dest parameters \x1b[31mare the same\x1b[0m' );
			process.exit ( AppLoader.#EXIT_BAD_PARAMETER );
		}
	}

	#geneateNewFile ( sourceFileName ) {
		fs.writeFileSync (
			theConfig.destDir + sourceFileName,
			fs.readFileSync ( theConfig.srcDir + sourceFileName, 'utf8' )
				.replaceAll ( /<!--.*?-->/g, '' )
				.replaceAll ( /\r\n|\r|\n/g, ' ' )
				.replaceAll ( /\t/g, ' ' )
				.replaceAll ( / {2,}/g, ' ' )
		);
	}

	#generateNewFiles ( ) {
		this.#sourceFileNames.forEach ( this.#geneateNewFile );
	}

	/**
	Load the app, searching all the needed infos to run the app correctly
	@param {?Object} options The options for the app
	*/

	loadApp ( options ) {

		// start time
		const startTime = process.hrtime.bigint ( );

		// config
		this.#createConfig ( options );

		// console.clear ( );
		console.error ( `\nStarting HtmlCleanCompress ${AppLoader.#version}...` );

		// source files list
		this.#readDir ( '' );

		// Cleaning old files
		if ( theConfig.clean ) {
			this.#cleanOldFiles ( );
		}

		// Generating new files
		this.#generateNewFiles ( );

		// end of the process
		const deltaTime = process.hrtime.bigint ( ) - startTime;

		/* eslint-disable-next-line no-magic-numbers */
		const execTime = String ( deltaTime / 1000000000n ) + '.' + String ( deltaTime % 1000000000n ).substring ( 0, 3 );
		console.error ( `\nhtml files generated in ${execTime} seconds in the folder \x1b[36m${theConfig.destDir}\x1b[0m` );
	}
}

export default AppLoader;

/* --- End of file --------------------------------------------------------------------------------------------------------- */