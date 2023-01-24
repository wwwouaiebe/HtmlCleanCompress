#!/usr/bin/env node

import AppLoader from '../src/AppLoader.js';

export function startHtmlCleanCompress ( options ) {
	new AppLoader ( ).loadApp ( options );
}