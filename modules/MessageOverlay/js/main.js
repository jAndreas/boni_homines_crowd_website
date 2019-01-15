'use strict';

import { Component } from 'barfoos2.0/core.js';
import { extend } from 'barfoos2.0/toolkit.js';
import { VK } from 'barfoos2.0/defs.js';

import html from '../markup/main.html';
import style from '../style/main.scss';

/*****************************************************************************************************
 *  Message Overlay for hints and notices
 *****************************************************************************************************/
class MessageOverlay extends Component {
	constructor( input = { }, options = { } ) {
		extend( options ).with({
			name:			'MessageOverlay',
			tmpl:			html,
			renderData:		{
				msg:	input.msg
			}
		}).and( input );

		super( options );

		return this.init();
	}

	async init() {
		await super.init();

		this.on( 'down.keys', this.onKeyDown, this );
		this.addNodeEvent( this.nodes.root, 'click', () => {
			this.nodes[ 'div.content' ].classList.add( 'reSwing' );
		});
		this.addNodeEvent( 'div.close', 'click', () => {
			this.destroy();
			return -1;
		});
		this.addNodeEvent( this.nodes[ 'div.content' ], 'animationend', event => {
			if( event.animationName === 'swingback' ) {
				this.nodes[ 'div.content' ].classList.remove( 'swingIn' );
				this.nodes[ 'div.content' ].classList.remove( 'reSwing' );
			}

			if( event.animationName === 'moveIn' ) {
				this.nodes[ 'div.content' ].scrollIntoView();
			}
		});

		return this;
	}

	async destroy() {
		super.destroy && super.destroy();
		[ style ].forEach( s => s.unuse() );
	}

	onKeyDown( vk ) {
		switch( vk ) {
			case VK.ESC:
				this.destroy();
				break;
		}
	}
}
/****************************************** cookieConfirmSection End ******************************************/

async function start( ...args ) {
	[ style ].forEach( style => style.use() );

	return await new MessageOverlay( ...args );
}

export { start };
