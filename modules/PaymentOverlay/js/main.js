'use strict';

import { Component } from 'barfoos2.0/core.js';
import { VK } from 'barfoos2.0/defs.js';
import { extend, Mix } from 'barfoos2.0/toolkit.js';
import ServerConnection from 'barfoos2.0/serverconnection.js';

import html from '../markup/main.html';
import style from '../style/main.scss';

/*****************************************************************************************************
 *  Payment Overlay for paying services
 *****************************************************************************************************/
class PaymentOverlay extends Mix( Component ).With( ServerConnection ) {
	constructor( input = { }, options = { } ) {
		extend( options ).with({
			name:			'PaymentOverlay',
			location:		'FundingSection',
			tmpl:			html
		}).and( input );

		super( options );

		return this.init();
	}

	async init() {
		await super.init();

		this.nodes[ 'div.thankyou' ].textContent = `Danke für ${ this.amount } Euro!`;

		this.initPayPal();

		this.on( 'down.keys', this.onKeyDown, this );
		this.addNodeEvent( this.nodes.root, 'click', () => {
			if( Math.random() > 0.9 ) {
				this.nodes[ 'div.content' ].classList.add( 'reSwing' );
			}
			return false;
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
		this.addNodeEvent( 'div.prepaymentLabel, div.bitcoinLabel', 'click', this.showPaymentInfo);

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

	showPaymentInfo( event ) {
		if( event.target.parentElement.classList.contains( 'open' ) ) {
			event.target.parentElement.classList.remove( 'open' );
		} else {
			this.nodes[ 'div.prepayment' ].classList.remove( 'open' );
			this.nodes[ 'div.bitcoin' ].classList.remove( 'open' );

			event.target.parentElement.classList.add( 'open' );
		}
	}

	initPayPal() {
		paypal.Button.render({
			env:		ENV_PROD ? 'production'  : 'sandbox', // sandbox | production
			style:		{
				layout: 	'vertical',	// horizontal | vertical
				size:		'responsive',	// medium | large | responsive
				shape:		'rect',		// pill | rect
				color:		'blue',		 // gold | blue | silver | black
				label:		'paypal'
			},
			// - paypal.FUNDING.CARD
			// - paypal.FUNDING.CREDIT
			// - paypal.FUNDING.ELV
			funding:	{
				allowed:	[ paypal.FUNDING.CARD, paypal.FUNDING.ELV ],
				disallowed:	[ ]
			},
			client:		{
				sandbox:	'AWsi8Ge87ljN9sCF8a1-TabrSqS4HSXnnEHLrKspV7CGZH0s4bhyZHnoIS4iudCsJ3jsa77q1xuTcarR',
				production: 'PUBLISH'
			},
			payment:	( data, actions ) => {
				return actions.payment.create({
					payment: {
						transactions: [
							{
								amount: { total: this.amount, currency: 'EUR' }
							}
						]
					}
				});
			},
			onAuthorize: ( data, actions ) => {
				return actions.payment.execute().then( async payment => {
					try {
						let stripped = {
							_id:				payment.id,
							time:				payment.create_time,
							state:				payment.state,
							method:				payment.payer.payment_method,
							payerStatus:		payment.payer.status,
							payerFirstName:		payment.payer.payer_info.first_name,
							payerLastName:		payment.payer.payer_info.last_name,
							payerEmail:			payment.payer.payer_info.email,
							address:			payment.payer.payer_info.shipping_address,
							amount:				payment.transactions[ 0 ].amount.total,
							message:			this.nodes[ 'textarea.message' ].value
						};

						let status = await this.send({
							type:		'paymentInfo',
							payload:	{
								payment:	stripped
							}
						});

						this.fire( 'loadModule', {
							name:		'MessageOverlay',
							params:		{
								location:	'FundingSection',
								msg:		`Vielen Dank ${ stripped.payerFirstName }, für Dein Vertrauen und Deine Unterstützung! Willkommen in der Familie,<br/>Du "guter Mensch" :)`
							}
						});

						this.log( 'paymentInfo: ', status );

						this.destroy();
					} catch( ex ) {
						this.log( ex.message );
					}
				});
			}

		}, 'div.pp_placeholder');
	}
}
/****************************************** cookieConfirmSection End ******************************************/

async function start( ...args ) {
	[ style ].forEach( style => style.use() );

	return await new PaymentOverlay( ...args );
}

export { start };
