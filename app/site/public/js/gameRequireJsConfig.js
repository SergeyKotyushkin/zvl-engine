requirejs.config({
    baseUrl: '/js',
    waitSeconds: 0,
    paths: {
        knockout: '../vendor/js/knockout-3.4.0',
        jquery: '../vendor/js/jquery-2.2.3.min',
        bootstrap: '../vendor/js/bootstrap.min',
        countdownPlugin: '../vendor/js/jquery.plugin.min',
        countdownMin: '../vendor/js/jquery.countdown.min',
        countdownLocaleRu: '../vendor/js/jquery.countdown-ru'
    },
    shim: {
        jquery: {
            exports: '$'
        },
        bootstrap: {
            deps: ['jquery']
        },
        countdownPlugin: {
            deps: ['jquery']
        },
        countdownMin: {
            deps: ['jquery', 'countdownPlugin']
        },
        countdownLocaleRu: {
            deps: ['jquery', 'countdownPlugin', 'countdownMin']
        }
    },
    bundles: {
    }
});

require(['./game']);
