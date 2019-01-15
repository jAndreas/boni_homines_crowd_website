'use strict';

import { Component } from 'barfoos2.0/core.js';
import { moduleLocations } from 'barfoos2.0/defs.js';
import { extend, Mix } from 'barfoos2.0/toolkit.js';
import ServerConnection from 'barfoos2.0/serverconnection.js';

import html from '../markup/main.html';
import style from '../style/main.scss';

/*****************************************************************************************************
 *  Contact Us!
 *****************************************************************************************************/
class ContactSection extends Mix( Component ).With( ServerConnection ) {
	constructor( input = { }, options = { } ) {
		extend( options ).with({
			name:			'ContactSection',
			location:		moduleLocations.center,
			tmpl:			html
		}).and( input );

		super( options );

		return this.init();
	}

	async init() {
		await super.init();

		this.addNodeEvent( 'form.userContact', 'submit', this.sendMessage );

		return this;
	}

	async destroy() {
		super.destroy && super.destroy();
		[ style ].forEach( s => s.unuse() );
	}

	sendMessage( event ) {
		event.preventDefault();
		event.stopPropagation();

		try {
			let {
				'input.name':		name,
				'input.email':		email,
				'input#question':	question,
				'input#problem':	problem,
				'textarea.content':	content
			} = this.nodes;

			this.send({
				type:		'userMessage',
				payload:	{
					data:	{
						name:		name.value,
						email:		email.value,
						question:	question.checked,
						problem:	problem.checked,
						content:	content.value
					}
				}
			}, {
				simplex: true
			});

			this.fire( 'loadModule', {
				name:		'MessageOverlay',
				params:		{
					location:	this.name,
					msg:		'Danke für Deine Nachricht!<br/>Ich werde mich so schnell wie möglich bei Dir melden.'
				}
			});

			this.nodes[ 'form.userContact' ].reset();
		} catch( ex ) {
			this.log( ex.message );
		}

		return false;
	}
}
/****************************************** cookieConfirmSection End ******************************************/

async function start( ...args ) {
	[ style ].forEach( style => style.use() );

	return await new ContactSection( ...args );
}

export { start };
