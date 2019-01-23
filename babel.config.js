module.exports = function( api ) {
	api.cache( true );

	const presets = [	'@babel/preset-env' ];
	const plugins = [	"@babel/plugin-proposal-class-properties",
						"@babel/plugin-transform-runtime",
						"@babel/plugin-syntax-dynamic-import",
						"@babel/plugin-syntax-async-generators",
						"@babel/plugin-transform-regenerator",
						"@babel/plugin-transform-async-to-generator",
						"@babel/plugin-transform-spread"
					];

	return {
		presets,
		plugins
	};
}
