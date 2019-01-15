'use strict';

import { Component } from 'barfoos2.0/core.js';
import { moduleLocations } from 'barfoos2.0/defs.js';
import { extend, isMobileDevice } from 'barfoos2.0/toolkit.js';

import html from '../markup/main.html';
import style from '../style/main.scss';

/*****************************************************************************************************
 *  This module takes care about navigating the site dude, what did you expect?
 *****************************************************************************************************/
class NavSection extends Component {
	constructor( input = { }, options = { } ) {
		extend( options ).with({
			name:			'NavSection',
			location:		moduleLocations.center,
			tmpl:			html
		}).and( input );

		super( options );

		return this.init();
	}

	async init() {
		await super.init();

		if( isMobileDevice ) {
			this.addNodeEvent( 'div.anchors', 'click', this.toggleMenu );
		}

		return this;
	}

	async destroy() {
		super.destroy && super.destroy();
		[ style ].forEach( s => s.unuse() );
	}

	toggleMenu() {
		this.nodes[ 'div.anchors' ].classList.toggle( 'open' );

		return false;
	}

	onCenterScrollCore( scrollTop ) {
		if( scrollTop > 100 ) {
			if( this.nodes[ 'div.content' ].classList.contains( 'fixedTop' ) ) {
				this.log('removing fixed  class...');
				this.nodes[ 'div.content' ].classList.remove( 'fixedTop' );
			}
		}

		if( scrollTop <= 10 ) {
			if(!this.nodes[ 'div.content' ].classList.contains( 'fixedTop' ) ) {
				this.log('adding fixed  class...');
				this.nodes[ 'div.content' ].classList.add( 'fixedTop' );
			}
		}
	}
}
/****************************************** cookieConfirmSection End ******************************************/

async function start( ...args ) {
	[ style ].forEach( style => style.use() );

	return await new NavSection( ...args );
}

export { start };
