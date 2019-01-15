'use strict';

import { Component } from 'barfoos2.0/core.js';
import { moduleLocations } from 'barfoos2.0/defs.js';
import { extend, Mix } from 'barfoos2.0/toolkit.js';
import Speech from 'barfoos2.0/speech.js';

import html from '../markup/main.html';
import style from '../style/main.scss';

/*****************************************************************************************************
 *  Features and content explanation
 *****************************************************************************************************/
class FeaturesSection extends Mix( Component ).With( Speech ) {
	constructor( input = { }, options = { } ) {
		extend( options ).with({
			name:			'FeaturesSection',
			location:		moduleLocations.center,
			tmpl:			html
		}).and( input );

		super( options );

		return this.init();
	}

	async init() {
		await super.init();

		try {
			if( this.speechNotAvailable ) {
				for( let [ name, node ] of Object.entries( this.nodes ) ) {
					if( name.startsWith( 'i.read' ) ) {
						node.remove();
					}
				}
			} else {
				this.nodes[ 'div.content' ].addEventListener( 'click', this.readText.bind( this ), false );
			}
		} catch( ex ) {
			this.log( ex.message );
		}

		return this;
	}

	async destroy() {
		super.destroy && super.destroy();
		[ style ].forEach( s => s.unuse() );
	}

	async readText( event ) {
		if( event.target.classList.contains( 'read' ) ) {
			this.read( event.target.closest( 'div.desc' ).querySelector( 'h2' ).textContent );
		}
	}
}
/****************************************** cookieConfirmSection End ******************************************/

async function start( ...args ) {
	[ style ].forEach( style => style.use() );

	return await new FeaturesSection( ...args );
}

export { start };
