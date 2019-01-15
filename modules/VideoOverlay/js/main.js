'use strict';

import { Component } from 'barfoos2.0/core.js';
import { VK } from 'barfoos2.0/defs.js';
import { extend } from 'barfoos2.0/toolkit.js';

import html from '../markup/main.html';
import style from '../style/main.scss';

/*****************************************************************************************************
 *  Video Overlay
 *****************************************************************************************************/
class VideoOverlay extends Component {
	constructor( input = { }, options = { } ) {
		extend( options ).with({
			name:			'VideoOverlay',
			location:		'StartSection',
			tmpl:			html
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
		});

		this.YTplayer = new YT.Player('ytplayer', {
			height:		'410',
			width:		'740',
			videoId:	this.videoId,
			events:		{
				'onReady': 			this.onPlayerReady.bind( this ),
				'onStateChange':	this.onPlayerStateChange.bind( this )
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

	onPlayerReady() {
		this.YTplayer.playVideo();
	}

	async onPlayerStateChange( event ) {
		switch( event.data ) {
			case 0:
				await this.animate({
					node:		this.nodes[ 'div.content' ],
					rules:		{
						timing:		'ease-in-out',
						duration:	1000,
						name:		'moveOut'
					}
				});

				this.destroy();

				break;
		}
	}
}
/****************************************** cookieConfirmSection End ******************************************/

async function start( ...args ) {
	[ style ].forEach( style => style.use() );

	return await new VideoOverlay( ...args );
}

export { start };
