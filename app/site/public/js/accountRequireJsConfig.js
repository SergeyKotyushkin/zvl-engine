requirejs.config({
    baseUrl: '/js',
    waitSeconds: 0,
    paths: {
        cryptoJS: '../vendor/js/md5',
        knockout: '../vendor/js/knockout-3.4.0',
        jquery: '../vendor/js/jquery-2.2.3.min',
        bootstrap: '../vendor/js/bootstrap.min'
    },
    shim: {
        jquery: {
            exports: '$'
        },
        bootstrap: {
            deps: ['jquery']
        }
    },
    bundles: {
    }
});

require(['./account']);
