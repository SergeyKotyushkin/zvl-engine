requirejs.config({
    baseUrl: '/js',
    deps: ['./index'],
    waitSeconds: 0,
    paths: {
        //storage: './tools/storage',
        //localization: './tools/localization',
        constants: './constants',
        //underscore: '../vendor/js/underscore',
        knockout: '../vendor/js/knockout-3.4.0',
        jquery: '../vendor/js/jquery-2.2.3.min',
        'jquery.cookie': '../vendor/js/jquery.cookie',
        //amplify: '../vendor/js/amplify',
        //moment: '../vendor/js/moment-with-locales',
        //purl: '../vendor/js/purl'
    },
    shim: {
        //underscore: {
        //    exports: '_'
        //},
        //amplify: {
        //    deps: ['jquery']
        //},
        jquery: {
            exports: '$'
        },
        'jquery.cookie': {
            deps: ['jquery']
        }
    },
    bundles: {
    }
});
