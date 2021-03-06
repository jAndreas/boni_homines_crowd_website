'use strict';

import { Component } from 'barfoos2.0/core.js';
import { extend } from 'barfoos2.0/toolkit.js';

import html from '../markup/main.html';
import style from '../style/main.scss';

/*****************************************************************************************************
 *  Privacy declaration dsgvo
 *****************************************************************************************************/
class PrivacySection extends Component {
	constructor( input = { }, options = { } ) {
		extend( options ).with({
			name:			'PrivacySection',
			location:		'LegalSection',
			nodeLocation:	'beforebegin',
			tmpl:			html
		}).and( input );

		super( options );

		return this.init();
	}

	async init() {
		await super.init();

		return this;
	}

	async destroy() {
		super.destroy && super.destroy();
		[ style ].forEach( s => s.unuse() );
	}

	async inViewport() {
		super.inViewport && super.inViewport( ...arguments );

		this.fire( 'updateHash.appEvents', {
			data:	{
				action:		this.name,
				ref:		this.name
			}
		});
	}

	async offViewport() {
		super.offViewport && super.offViewport( ...arguments );
	}
}
/****************************************** privacySection End ******************************************/

async function start( ...args ) {
	[ style ].forEach( style => style.use() );

	return await new PrivacySection( ...args );
}

export { start };
