'use strict';

import { Component } from 'barfoos2.0/core.js';
import { moduleLocations } from 'barfoos2.0/defs.js';
import { extend, Mix, getTimePeriod } from 'barfoos2.0/toolkit.js';
import { win } from 'barfoos2.0/domkit.js';
import ServerConnection from 'barfoos2.0/serverconnection.js';

import html from '../markup/main.html';
import listEntryTmpl from '../markup/listentry.html';
import style from '../style/main.scss';
import listEntryStyle from '../style/listentry.scss';

let infoMap	= {
	supporter:			'Du erhältst auf der Community Webseite einen besonderen und einmaligen Benutzer Status.',
	ebook:				'Du bekommst mein E-Book "Die vegane Mangelernährung".',
	veganbasic:			'Du erhältst meinen Ratgeber für eine pflanzenbasierte Lebensweise. Alle Grundlagen die man für eine vegane Lebensweise  benötigt.',
	whatsapp:			'Du bekommst Zugang zu der Boni Homines WhatsApp Gruppe, in der Fragen interaktiv besprochen werden',
	skype:				'Du erhältst ein persönliches Beratungsgespräch mit mir.',
	nutritionplan:		'Ich erstelle Dir einen maßgeschneiderten Ernährungsplan.',
	personaltraining:	'Wir treffen uns und verbringen einen gemeinsamen Tag. Ich zeige Dir, wie meine Lebensweise im Alltag aussieht. Einkaufen, Gespräche, Kochen, Sport etc. pp.',
	premium:			'Du wirst in sämtlichen Publikationen und der Webseite namentlich als Sponsor genannt und erhälst einen gesonderten Status.',
	swag:				'Du wirst ausgestattet mit Kleidung aus dem Boni Homines Shop.'
};

/*****************************************************************************************************
 *	Funding Section
 *****************************************************************************************************/
class FundingSection extends Mix( Component ).With( ServerConnection ) {
	constructor( input = { }, options = { } ) {
		extend( options ).with({
			name:					'FundingSection',
			location:				moduleLocations.center,
			tmpl:					html,
			noSpinner:				true,
			currentFundingStatus:	0,
			fundingGoal:			0,
			fundingData:			Object.create( null ),
			swap:					1
		}).and( input );

		super( options );

		this.runtimeDependencies.push(
			this.fire( 'loadScript.core', 'https://www.paypalobjects.com/api/checkout.js' )
		);

		return this.init();
	}

	async init() {
		await super.init();

		this.addNodeEvent( 'div.goodieContainer', 'click', this.selectBox );
		this.addNodeEvent( 'input.manualValue', 'keydown', this.openPayment );
		this.addNodeEvent( 'div.showAll', 'click', this.showCompleteList );

		this.nodes[ 'div.backersList' ].addEventListener( 'click', this.checkReSort.bind( this ), false );
		this.nodes[ 'div.goodieContainer' ].addEventListener( 'mouseover', this.showTagInfo.bind( this ), false );
		this.nodes[ 'div.goodieContainer' ].addEventListener( 'mouseout', this.hideTagInfo.bind( this ), false );

		this.recv( 'globalPaymentUpdate', this.globalPaymentUpdate.bind( this ) );

		win.setInterval( this.switchSortingDisplay.bind( this ), 15000 );
		this.fundingData = await this.send({ type: 'getFundingStatus' });

		return this;
	}

	async destroy() {
		super.destroy && super.destroy();
		[ style, listEntryStyle ].forEach( s => s.unuse() );
	}

	async inViewport() {
		this.fundingData = await this.send({ type: 'getFundingStatus' });

		this.log( this.fundingData );

		try {
			this.nodes[ 'progress.bar' ].max	= this.fundingData.goal;
			this.fundingGoal					= this.fundingData.goal;

			this.addMoney( this.fundingData.amount );
			this.createFundersList();

			if( this.nodes[ 'div.backersList' ].offsetHeight > this.nodes[ 'div.fundingHistoryContainer' ].offsetHeight ) {
				this.nodes[ 'div.showAll' ].style.display = 'block';
			}
		} catch( ex ) {
			this.log( ex.message );
		}

		this.inViewport = () => {};
	}

	async addMoney( value, step = 15 ) {
		let iter		= this.currentFundingStatus,
			newPeak		= this.currentFundingStatus + value;

		do {
			this.nodes[ 'progress.bar' ].value				= iter;
			this.nodes[ 'div.statusDisplay' ].innerHTML		= `${ this.formatMoney( iter ) }€ <div class="small">von</div> ${ this.formatMoney( this.fundingGoal ) }€`;

			await this.timeout( 10 );

			iter += step;
		} while( iter < newPeak );

		this.currentFundingStatus	= newPeak;

		this.nodes[ 'progress.bar' ].value				= newPeak;
		this.nodes[ 'div.statusDisplay' ].innerHTML		= `${ this.formatMoney( newPeak ) }€ <div class="small">von</div> ${ this.formatMoney( this.fundingGoal ) }€`;
	}

	async createFundersList( sortMethod ) {
		let units = this.fundingData.units;

		if( Array.isArray( units ) ) {
			this.nodes[ 'div.backersList' ].innerHTML = '';

			if( typeof sortMethod === 'function' ) {
				units.sort( sortMethod );
			} else {
				units.sort( (a, b) => b.amount - a.amount );
			}

			for( let unit of units ) {
				unit.formattedTime = `vor ${ getTimePeriod( +new Date( unit.time ) ) }`;

				this.render({ htmlData:	listEntryTmpl, standalone: true }).with( unit ).at({
					node:		'div.backersList',
					position:	'beforeend'
				});
			}
		}
	}

	async globalPaymentUpdate( data ) {
		this.addMoney( data.amount, 1 );

		data.formattedTime = `vor ${ getTimePeriod( +new Date( data.time ) ) }`;

		this.render({ htmlData:	listEntryTmpl, standalone: true }).with( data ).at({
			node:		'div.backersList',
			position:	'afterbegin'
		});

		this.fundingData.units.push( data );

		this.fire( 'loadModule', {
			name:		'InstantMessageOverlay',
			params:		{
				location:	this.name,
				msg:		`${ data.name } hat das Projekt gerade mit ${ data.amount }€ unterstützt!<br/><sup class="subtitle">${ data.message }</sup>`,
				audio:		data.message || ''
			}
		});
	}

	formatMoney( amount, decimalCount = 2, decimal = ',', thousands = '.' ) {
		try {
			decimalCount = Math.abs(decimalCount);
			decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

			const negativeSign = amount < 0 ? '-' : '';

			let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
			let j = (i.length > 3) ? i.length % 3 : 0;

			return negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + thousands) + (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : '');
		} catch( ex ) {
			this.log( ex );
		}
	}

	switchSortingDisplay() {
		if( this.swap ) {
			this.nodes[ 'div.title' ].textContent = 'Ihr seid die Neuesten...';
			this.createFundersList(( a, b ) => new Date( b.time ) - new Date( a.time ) );
		} else {
			this.nodes[ 'div.title' ].textContent = 'Ihr seid die Besten...';
			this.createFundersList();
		}

		this.swap = this.swap^1;
	}

	checkReSort( event ) {
		if( event.target.classList.contains( 'time' ) ) {
			this.createFundersList(( a, b ) => new Date( b.time ) - new Date( a.time ) );
		}

		if( event.target.classList.contains( 'amount' ) ) {
			this.createFundersList();
		}
	}

	selectBox( event = { } ) {
		let target;

		for(let [ name, node ] of Object.entries( this.nodes ) ) {
			if( name.startsWith( 'div.box' ) ) {
				node.classList.remove( 'selected' );
			}
		}

		if( event.originalTarget ) {
			if( event.originalTarget.classList.contains( 'box' ) ) {
				target = event.originalTarget;
			} else {
				target = event.originalTarget.closest( 'div.box' );
			}
		}

		if( target && target.classList.contains( 'box' ) ) {
			target.classList.add( 'selected' );
		}

		if( target && target.classList.contains( 'help' ) ) {
			target.querySelector( 'input' ).focus();
			target.querySelector( 'input' ).select();
		}

		let total = 10,
			box;

		try {
			if( target ) {
				box		= target.querySelector( 'div.box.selected > div.amount' );

				if( box ) {
					if( box.classList.contains( 'manual' ) ) {
						total	= win.parseFloat( box.querySelector( 'input.manualValue' ).value );
					} else {
						total	= win.parseFloat( box.textContent );
					}
				}
			}
		} catch( ex ) {
			this.log( ex.message );
		}

		if( box ) {
			if( box.classList.contains( 'manual' ) ) {
				if( this.nodes[ 'input.manualValue' ].value ) {
					this.nodes[ 'div.row' ].scrollIntoView();
					this.fire( 'loadModule', {
						name:		'PaymentOverlay',
						params:		{
							amount:	total
						}
					});
				}
			} else {
				this.nodes[ 'div.row' ].scrollIntoView();
				this.fire( 'loadModule', {
					name:		'PaymentOverlay',
					params:		{
						amount:	total
					}
				});
			}
		}

		return false;
	}

	openPayment( event ) {
		if( event.which === 13 ) {
			this.selectBox({ originalTarget: event.target.closest( 'div.box' ) });
		}
	}

	showTagInfo( event ) {
		if( event.target && event.target.classList.contains( 'item' ) ) {
			try {
				this.nodes[ 'div.output' ].innerHTML	= (infoMap[ event.target.dataset.info ] || '') + ' <br/><div class="mini">** Du erhälst das Produkt bzw. den Termin unverzüglich nach Fertigstellung bzw. spätestens nach dem Erreichen des Projektzieles.</div>';
			} catch( ex ) {
				this.log( ex.message );
			}
		}
	}

	hideTagInfo() {
		this.nodes[ 'div.output' ].innerHTML = '';
	}

	showCompleteList() {
		this.nodes[ 'div.fundingHistoryContainer' ].classList.toggle( 'restricted' );
	}
}
/****************************************** cookieConfirmSection End ******************************************/

async function start( ...args ) {
	[ style, listEntryStyle ].forEach( style => style.use() );

	return await new FundingSection( ...args );
}

export { start };
