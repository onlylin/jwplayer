define([
    'providers/default',
    'providers/providers-supported',
    'providers/providers-loaded',
    'utils/underscore'
    ], function(Default, ProvidersSupported, ProvidersLoaded, _) {

    function Providers(config) {
        this.providers = ProvidersSupported.slice();
        this.config = config || {};

        this.reorderProviders();
    }

    Providers.loaders = {
        html5: function(resolvePromise) {
            require.ensure(['providers/html5'], function(require) {
                var provider = require('providers/html5');
                registerProvider(provider);
                resolvePromise(provider);
            }, 'provider.html5');
        },
        flash: function(resolvePromise) {
            require.ensure(['providers/flash'], function(require) {
                var provider = require('providers/flash');
                registerProvider(provider);
                resolvePromise(provider);
            }, 'provider.flash');
        },
        youtube: function(resolvePromise) {
            require.ensure(['providers/youtube'], function(require) {
                var provider = require('providers/youtube');
                registerProvider(provider);
                resolvePromise(provider);
            }, 'provider.youtube');
        }
    };

    var registerProvider =
    Providers.registerProvider = function(provider) {
        var name = provider.getName().name;

        // Only register the provider if it isn't registered already.  This is an issue on pages with multiple embeds.
        if (ProvidersLoaded[name]) {
            return;
        }

        // If there isn't a "supports" val for this guy
        if (! _.find(ProvidersSupported, _.matches({name : name}))) {
            if (!_.isFunction(provider.supports)) {
                throw {
                    message: 'Tried to register a provider with an invalid object'
                };
            }

            // The most recent provider will be in the front of the array, and chosen first
            ProvidersSupported.unshift({
                name : name,
                supports : provider.supports
            });
        }

        var F = function(){};
        F.prototype = Default;
        provider.prototype = new F();

        // After registration, it is loaded
        ProvidersLoaded[name] = provider;
    };

    _.extend(Providers.prototype, {

        load: function(providersToLoad) {
            return Promise.all(_.map(providersToLoad, function(provider) {
                return new Promise(function(resolvePromise) {
                    var providerLoaderMethod = Providers.loaders[provider.name];
                    if (providerLoaderMethod) {
                        providerLoaderMethod(resolvePromise);
                    } else {
                        resolvePromise(/* unknown registered module */);
                    }
                });
            }));
        },

        reorderProviders : function () {
            // Remove the flash provider, and add it in front of the html5 provider
            if (this.config.primary === 'flash') {
                var flashIdx = _.indexOf(this.providers, _.findWhere(this.providers, {name: 'flash'}));
                var flashProvider = this.providers.splice(flashIdx, 1)[0];
                var html5Idx = _.indexOf(this.providers, _.findWhere(this.providers, {name: 'html5'}));
                this.providers.splice(html5Idx, 0, flashProvider);
            }
        },

        providerSupports : function(provider, source) {
            return provider.supports(source);
        },

        required: function(playlist) {
            var _this = this;
            playlist = playlist.slice();
            return _.compact(_.map(this.providers, function(provider) {
                // remove items from copied playlist that can be played by provider
                // remaining providers will be checked against any remaining items
                // provider will be loaded if there are matches
                var loadProvider = false;
                for (var i = playlist.length; i--;) {
                    var item = playlist[i];
                    var supported = _this.providerSupports(provider, item.sources[0]);
                    if (supported) {
                        playlist.splice(i, 1);
                    }
                    loadProvider = loadProvider || supported;
                }
                if (loadProvider) {
                    return provider;
                }
            }));
        },

        // Find the name of the first provider which can support the media source-type
        choose : function(source) {
            // prevent throw on missing source
            source = _.isObject(source) ? source : {};

            var count = this.providers.length;
            for (var i = 0; i < count; i++) {
                var provider = this.providers[i];
                if (this.providerSupports(provider, source)) {
                    // prefer earlier providers
                    var priority = count - i - 1;

                    return {
                        priority: priority,
                        name : provider.name,
                        type: source.type,
                        // If provider isn't loaded, this will be undefined
                        provider : ProvidersLoaded[provider.name]
                    };
                }
            }

            return null;
        }
    });

    return Providers;
});