define([
    'view/components/tooltip',
    'view/components/slider',
    'utils/ui',
    'utils/helpers'/*,
    'utils/underscore'*/
], function(Tooltip, Slider, UI, utils/*, _*/) {
    var VolumeTooltip = Tooltip.extend({
        'constructor' : function(_model, name) {
            this._model = _model;

            Tooltip.call(this, name);

            this.volumeSlider = new Slider('jw-slider-volume jw-volume-tip', 'vertical');
            this.addContent(this.volumeSlider.element());

            this.volumeSlider.on('update', function (evt) {
                this.trigger('update', evt);
            }.bind(this));

            utils.toggleClass(this.el, 'jw-hidden', false);

            new UI(this.el, {'useHover': true}).on('click', this.toggleValue.bind(this))
                .on('tap', this.toggleOpenState.bind(this))
                .on('over', this.openTooltip.bind(this))
                .on('out', this.closeTooltip.bind(this));

            //if(_.isUndefined(window.PointerEvent)){
            //    this.el.addEventListener('mouseover', this.openTooltip.bind(this));
            //    this.el.addEventListener('mouseout', this.closeTooltip.bind(this));
            //} else {
            //    this.el.addEventListener('pointerover', this.openTooltip.bind(this));
            //    this.el.addEventListener('pointerout', this.closeTooltip.bind(this));
            //}

            this._model.on('change:volume', this.onVolume, this);
        },
        toggleValue : function(evt){
            console.log('toggleValue DONE');
            if(evt.target === this.el){
                this.trigger('toggleValue');
            }
        }
    });

    return VolumeTooltip;
});

