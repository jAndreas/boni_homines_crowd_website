'use strict';

import { Component } from 'barfoos2.0/core.js';
import { moduleLocations } from 'barfoos2.0/defs.js';
import { extend, Mix } from 'barfoos2.0/toolkit.js';
import ServerConnection from 'barfoos2.0/serverconnection.js';

import html from '../markup/main.html';
import style from '../style/main.scss';

/*****************************************************************************************************
 *  Contact Us!
 *****************************************************************************************************/
class LegalSection extends Mix( Component ).With( ServerConnection ) {
	constructor( input = { }, options = { } ) {
		extend( options ).with({
			name:			'LegalSection',
			location:		moduleLocations.center,
			tmpl:			html
		}).and( input );

		super( options );

		return this.init();
	}

	async init() {
		await super.init();

		this.addNodeEvent( 'div.impressum', 'click', this.loadImpressumSection );
		this.addNodeEvent( 'div.privacy', 'click', this.loadPrivacySection );

		return this;
	}

	async destroy() {
		super.destroy && super.destroy();
		[ style ].forEach( s => s.unuse() );
	}

	loadImpressumSection() {
		this.fire( 'loadModule', { name: 'ImpressumSection' }).then( () => this.fire( 'switchTo.ImpressumSection' ) );
		return false;
	}

	loadPrivacySection() {
		this.fire( 'loadModule', { name: 'PrivacySection' }).then( () => this.fire( 'switchTo.PrivacySection' ) );
		return false;
	}
}
/****************************************** cookieConfirmSection End ******************************************/

async function start( ...args ) {
	[ style ].forEach( style => style.use() );

	return await new LegalSection( ...args );
}

export { start };
