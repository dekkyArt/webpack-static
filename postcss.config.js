module.exports = {
    map: true,
    plugins: {
        'postcss-assets': {
            basePath: 'src/',
            relative: true,
        },
        'postcss-preset-env': {},
    },
};
