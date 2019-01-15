'use strict';

import urlPolyfill from 'url-search-params';
import '@babel/polyfill';
import 'proxy-polyfill/proxy.min.js';
import 'whatwg-fetch';

import { main } from 'barfoos2.0/core.js';
import { doc, win } from 'barfoos2.0/domkit.js';
import { Composition } from 'barfoos2.0/toolkit.js';
import ServerConnection from 'barfoos2.0/serverconnection.js';
import Mediator from 'barfoos2.0/mediator.js';
import LogTools from 'barfoos2.0/logtools.js';
import BrowserKit from 'barfoos2.0/browserkit.js';

import * as StartSection from 'StartSection/js/main.js';
import * as NavSection from 'NavSection/js/main.js';
import * as FeaturesSection from 'FeaturesSection/js/main.js';
import * as FundingSection from 'FundingSection/js/main.js';
import * as ContactSection from 'ContactSection/js/main.js';
import * as LegalSection from 'LegalSection/js/main.js';

if(!('URLSearchParams' in win) ) {
	win.URLSearchParams = urlPolyfill;
}

const	Browser		= new BrowserKit(),
		bgImagePath	= ENV_PUBLIC_PATH + 'images/bonimodel1.jpg';

class BoniHominesCrowdFunding extends Composition( Mediator, LogTools, ServerConnection ) {
	constructor() {
		super( ...arguments );

		Object.assign(this, {
			id:	'App'
		});

		this.init();
	}

	async init() {
		main( false );

		this.on( 'loadModule', this.loadModule, this );
		this.on( 'waitForBackgroundImageLoaded.appEvents', this.waitForBackgroundImageLoaded, this );
		this.on( 'setTitle.appEvents', this.setTitle, this );
		this.on( 'moduleLaunch.appEvents', this.onModuleLaunch, this );
		this.on( 'moduleDestruction.appEvents', this.onModuleDestruction, this );
		this.on( 'connect.server checkSession.appEvents', this.onReconnect, this );
		this.on( 'hashChange.appEvents', this.routeByHash, this );

		this.recv( 'reloadPage', this.onRemotePageReload.bind( this ) );

		this.backgroundImage	= Browser.loadImage( bgImagePath );

		if( this.backgroundImage ) {
			this.backgroundImage.then( objURL => {
				this.fire( 'configApp.core', {
					name:				'Boni Homines - Crowd Funding',
					title:				'Boni Homines - Crowd Funding',
					version:			'0.3.0',
					status:				'alpha',
					background:			{
						gradient:	'radial-gradient(rgba(255, 255, 255, 0.22), rgb(255, 255, 255))',
						objURL:		objURL,
						css:	{
							backgroundSize:		screen.width <= 768 ? 'cover, 70%' : 'cover, 40%',
							backgroundPosition:	'center center, left 10vh'
						}
					}
				});
			});
		}

		this.cookiesAccepted	= localStorage.getItem( 'allowCookies' );

		if(!this.cookiesAccepted ) {
			this.loadModule({ name: 'CookieConfirmSection' });
		}

		await Promise.all( [ NavSection, StartSection, FeaturesSection, FundingSection, ContactSection, LegalSection ].map( async section => section.start() ) );

		await this.routeByHash( await this.fire( 'getHash.appEvents' ) );
	}

	onRemotePageReload() {
		win.location.reload( true );
	}

	onReconnect() {
	}

	waitForBackgroundImageLoaded() {
		return this.backgroundImage;
	}

	setTitle( title = '' ) {
		doc.title = title;
	}

	onModuleLaunch( /*module*/ ) {
	}

	onModuleDestruction( /*module*/ ) {
	}

	async loadModule({ name = '', params = { } }) {
		if( name ) {
			let state = await this.fire( `findModule.${ name }` );

			if( state !== true ) {
				let modRef = await import(
					/* webpackChunkName: "[request]" */
					`./modules/${ name }/js/main.js`
				);
				await modRef.start( params );
			} else {
				this.log( `${ name } already online, aborting launch.` );
			}
		}
	}

	async routeByHash( hash ) {
		if( hash.has( 'debug' ) ) {
			this.loadModule({ name: 'DebugOverlay' });
		} else {
			this.fire( `switchTo.${ win.location.hash.slice( 1 ) }` );
		}
	}
}

new BoniHominesCrowdFunding();
