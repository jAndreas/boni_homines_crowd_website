'use strict';

import urlPolyfill from 'url-search-params';
import 'babel-polyfill';
import 'proxy-polyfill/proxy.min.js';
import 'whatwg-fetch';

import { main } from 'barfoos2.0/core.js';
import { Composition } from 'barfoos2.0/toolkit.js';
import { doc, win } from 'barfoos2.0/domkit.js';
import ServerConnection from 'barfoos2.0/serverconnection.js';
import Mediator from 'barfoos2.0/mediator.js';
import LogTools from 'barfoos2.0/logtools.js';
import BrowserKit from 'barfoos2.0/browserkit.js';

if(!('URLSearchParams' in win) ) {
	win.URLSearchParams = urlPolyfill;
}

const	Browser		= new BrowserKit(),
		bgImagePath	= ENV_PUBLIC_PATH + 'images/background.jpg';

class ExampleWebsite extends Composition( Mediator, LogTools, ServerConnection ) {
	constructor() {
		super( ...arguments );

		Object.assign(this, {
			id:						'App'
		});

		this.init();
	}

	async init() {
		main();

		this.on( 'waitForBackgroundImageLoaded.appEvents', this.waitForBackgroundImageLoaded, this );
		this.on( 'setTitle.appEvents', this.setTitle, this );
		this.on( 'moduleLaunch.appEvents', this.onModuleLaunch, this );
		this.on( 'moduleDestruction.appEvents', this.onModuleDestruction, this );
		this.on( 'connect.server checkSession.appEvents', this.onReconnect, this );

		this.recv( 'reloadPage', this.onRemotePageReload.bind( this ) );

		this.backgroundImage	= Browser.loadImage( bgImagePath );

		if( this.backgroundImage ) {
			this.backgroundImage.then( objURL => {
				this.fire( 'configApp.core', {
					name:				'Example - Website',
					title:				'Example Title',
					version:			'0.1.0',
					status:				'alpha',
					background:			{
						objURL:		objURL,
						css:	{
						}
					}
				});
			});
		}

		this.cookiesAccepted	= localStorage.getItem( 'allowCookies' );

		if(!this.cookiesAccepted ) {
			let cookieConfirmSection = await import( /* webpackChunkName: "cookieConfirmSection" */ 'cookieConfirmSection/js/main.js' );
			cookieConfirmSection.start();
		}
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

	onModuleLaunch( module ) {
	}

	onModuleDestruction( module ) {
	}
}

new ExampleWebsite();
