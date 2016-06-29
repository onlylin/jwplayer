define([
    'test/underscore',
    'providers/html5',
    'providers/flash',
    'providers/tracks-mixin',
    'utils/backbone.events'
], function (_, htmlProvider, flashProvider, Tracks, Events) {
    /* jshint qunit:true */
    var test = QUnit.test.bind(QUnit);
    var provider, model, tracks;

    QUnit.module('Tracks');

    QUnit.testStart(function() {
        // Sideloaded
        tracks = [{
            file: 'http://playertest.longtailvideo.com/assets/os/captions/bunny-en.vtt',
            label: 'VTT1',
            kind: 'captions',
            mode: 'showing'
        }, {
            file: 'https://playertest.longtailvideo.com/assets/os/captions/bunny-en.srt',
            label: 'SRT1',
            kind: 'captions'
        }];

        model = {
            sources: [{
                // file: 'http://playertest.longtailvideo.com/adaptive/bbcc/output.m3u8', // Embedded 608 captions
                file: 'http://content.bitsontherun.com/videos/bkaovAYt-52qL9xLP.mp4',  // Non embedded
                image: 'http://content.bitsontherun.com/thumbs/bkaovAYt-720.jpg',
                primary: 'flash'
            }],
            tracks: tracks
        };

        // HLS Manifest
        //http://wowzaec2demo.streamlock.net/vod-multitrack/_definst_/smil:ElephantsDream/elephantsdream2.smil/playlist.m3u8

        provider = _.extend({
            getName: function() {
                return {name: 'flash'}
            }
        }, Events, Tracks);
        // provider.video = {
        //     textTracks: [],
        //     hasAttribute: function () {},
        //     setAttribute: function () {},
        //     appendChild: function () {}
        // };
        provider.setupSideloadedTracks(tracks);
    });

    test('initialization should not set current track', function(assert) {
        assert.equal(provider.getSubtitlesTrack(), -1, 'current track was set');
    });

    test('should disable all tracks', function(assert) {
        provider.setSubtitlesTrack(0);

        assert.equal(provider.getSubtitlesTrack(), -1, 'current track still set');
    });

    test('should update current track', function(assert) {
        provider.setSubtitlesTrack(2);

        assert.equal(provider.getSubtitlesTrack(), 1, 'current track did not update');
    });

    // test('should update current track2', function(assert) {
    //     provider.textTrackChangeHandler();
    //
    //     assert.equal(provider.getSubtitlesTrack(), 0, 'current track did not update');
    // });
    //
    // test('add cues', function(assert) {
    //     provider.addCuesToTrack({name: tracks[0].file, captions: [{begin: 1, end: 2, text: 'hi'}, {begin: 5, end: 7, text: 'bye'}]});
    //     provider.addCuesToTrack({name: tracks[1].file, captions: [{begin: 10, end: 26, text: 'hello'}]});
    //
    //     assert.equal(tracks[0].data.length, 2, 'two cues were added to the track');
    //     assert.equal(tracks[1].data.length, 1, 'two cues were added to the track');
    // });
});
