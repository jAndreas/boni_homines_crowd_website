'use strict';

import { Component } from 'barfoos2.0/core.js';
import { VK } from 'barfoos2.0/defs.js';
import { extend, Mix } from 'barfoos2.0/toolkit.js';
import ServerConnection from 'barfoos2.0/serverconnection.js';

import html from '../markup/main.html';
import style from '../style/main.scss';

/*****************************************************************************************************
 *  Debug Overlay
 *****************************************************************************************************/
class DebugOverlay extends Mix( Component ).With( ServerConnection ) {
	constructor( input = { }, options = { } ) {
		extend( options ).with({
			name:			'DebugOverlay',
			location:		'StartSection',
			tmpl:			html
		}).and( input );

		super( options );

		return this.init();
	}

	async init() {
		await super.init();

		this.on( 'down.keys', this.onKeyDown, this );
		this.addNodeEvent( 'button.send', 'click', this.doSomething);

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

	async doSomething() {
		try {
			let stripped = {
				payerFirstName:		this.nodes[ 'input.first' ].value,
				payerLastName:		this.nodes[ 'input.last' ].value,
				amount:				this.nodes[ 'input.amount' ].value,
				message:			this.nodes[ 'input.message' ].value,
				pw:					this.nodes[ 'input.password' ].value
			};

			let status = await this.send({
				type:		'paymentInfoDebug',
				payload:	{
					payment:	stripped
				}
			});

			this.nodes[ 'input.first' ].value = '';
			this.nodes[ 'input.last' ].value = '';
			this.nodes[ 'input.amount' ].value = '';
			this.nodes[ 'input.message' ].value= '';
		} catch( ex ) {
			this.log( ex.message );
		}
	}
}
/****************************************** cookieConfirmSection End ******************************************/

async function start( ...args ) {
	[ style ].forEach( style => style.use() );

	return await new DebugOverlay( ...args );
}

export { start };
