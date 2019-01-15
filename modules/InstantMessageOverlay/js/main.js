'use strict';

import { Component } from 'barfoos2.0/core.js';
import { win } from 'barfoos2.0/domkit.js';
import { VK } from 'barfoos2.0/defs.js';
import { extend, Mix } from 'barfoos2.0/toolkit.js';
import Speech from 'barfoos2.0/speech.js';

import html from '../markup/main.html';
import style from '../style/main.scss';

/*****************************************************************************************************
 *  Instant Message Overlay for small and quick notices
 *****************************************************************************************************/
class InstantMessageOverlay extends Mix( Component ).With( Speech ) {
	constructor( input = { }, options = { } ) {
		extend( options ).with({
			name:				'InstantMessageOverlay',
			tmpl:				html,
			renderData:			{
				msg:	input.msg
			},
			messageDuration:	10000
		}).and( input );

		super( options );

		return this.init();
	}

	async init() {
		await super.init();

		this.on( 'down.keys', this.onKeyDown, this );
		this.addNodeEvent( this.nodes.root, 'click', () => {
			win.clearTimeout( this.removeTimer );

			this.nodes.root.classList.add( 'slideOut' );

			return false;
		});

		this.addNodeEvent( this.nodes.root, 'animationend', event => {
			if( event.animationName === 'slideOut' ) {
				this.destroy();
			}

			if( event.animationName === 'slideIn' ) {
				this.nodes.root.classList.remove( 'slideIn' );
			}

			return false;
		});

		this.removeTimer = win.setTimeout( this.removeMessage.bind( this ), this.messageDuration );

		try {
			let cheer = new Audio( '../audio/applause.mp3' );
			cheer.volume = 0.5;
			cheer.play();

			if( this.speechNotAvailable === false ) {
				win.setTimeout(() => {
					this.activeSpeech = this.read( this.audio );
				}, 4000);
			}
		} catch( ex ) {
			this.log( ex.message );
		}
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

	async removeMessage() {
		await this.activeSpeech;
		this.nodes.root.classList.add( 'slideOut' );
	}
}
/****************************************** cookieConfirmSection End ******************************************/

async function start( ...args ) {
	[ style ].forEach( style => style.use() );

	return await new InstantMessageOverlay( ...args );
}

export { start };
