'use strict';

import { Component } from 'barfoos2.0/core.js';
import { moduleLocations } from 'barfoos2.0/defs.js';
import { extend } from 'barfoos2.0/toolkit.js';
import { win } from 'barfoos2.0/domkit.js';

import html from '../markup/main.html';
import style from '../style/main.scss';

/*****************************************************************************************************
 *  Start Page
 *****************************************************************************************************/
class StartSection extends Component {
	constructor( input = { }, options = { } ) {
		extend( options ).with({
			name:			'StartSection',
			location:		moduleLocations.center,
			tmpl:			html,
			noSpinner:		true
		}).and( input );

		super( options );

		return this.init();
	}

	async init() {
		await super.init();

		this.addNodeEvent( 'input.intro', 'click', this.showIntro );
		this.addNodeEvent( 'input.crowdfunding', 'click', this.showCrowdfunding );

		this.fire( 'loadScript.core', 'https://www.youtube.com/iframe_api' );

		return this;
	}

	async destroy() {
		super.destroy && super.destroy();
		[ style ].forEach( s => s.unuse() );
	}

	async inViewport() {
		this.removeNodes( 'div.quickScrollUp', true );
		//win.location.hash = '';
		try {
			win.history.replaceState( '', document.title, win.location.pathname + win.location.search );
		} catch( ex ) {
			this.log( ex.message );
		}

		super.inViewport && super.inViewport( ...arguments );
	}

	async offViewport() {
		this.addNodes({
			htmlData:	'<div class="quickScrollUp icon-up-open" title="Zurück zum Seitenanfang" onclick="onQuickScrollUpClick" ontouchend="onQuickScrollUpClick"></div>',
			reference:	{
				node:		'root',
				position:	'beforeend'
			}
		});

		super.offViewport && super.offViewport( ...arguments );
	}

	async showIntro() {
		await this.fire( 'loadModule', {
			name:		'VideoOverlay',
			params:		{
				videoId:	'-KbXhpw6K2E'
			}
		});
	}

	async showCrowdfunding() {
		await this.fire( 'loadModule', {
			name:		'VideoOverlay',
			params:		{
				videoId:	'hcL8N4i6FiE'
			}
		});
	}

	// referenced via html markup, interpretated and linked by cacheNodes
	async onQuickScrollUpClick() {
		await this.switchTo();
		this.inViewport();
	}

	/*async onQuickNavClick() {
		this.removeNodes( 'div.quickNav', true );

		await this.fire( 'MobileNavigationSection.launchModule' );
		this.fire( 'requestMobileNavigation.core' );
	}*/
}
/****************************************** cookieConfirmSection End ******************************************/

async function start( ...args ) {
	[ style ].forEach( style => style.use() );

	return await new StartSection( ...args );
}

export { start };
