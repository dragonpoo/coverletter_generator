/*!
 * @copyright &copy; Kartik Visweswaran, Krajee.com, 2014 - 2016
 * @version 1.5.5
 *
 * An extended checkbox plugin for bootstrap with three states and additional styles.
 *
 * For more JQuery/Bootstrap plugins and demos visit http://plugins.krajee.com
 * For more Yii related demos visit http://demos.krajee.com
 */
(function ($) {
    "use strict";
    var listOfNames = [];
    var selectors = [];

    /*var objectArray = [
        { "Name" : "A", "Id" : "1" },
        { "Name" : "B", "Id" : "2" },
        { "Name" : "C", "Id" : "3" },
        { "Name" : "D", "Id" : "4" }
    ];*/

    var RadiobuttonX = function (element, options) {
        var tmpSelectorName;
        var self = this;
        self.$element = $(element);
        tmpSelectorName = "."+self.$element.attr('class');

        if (selectors.indexOf(tmpSelectorName) < 0) {
            selectors.push(tmpSelectorName);
            self.disabled = self.$element.attr('disabled') || self.$element.attr('readonly');
            self.initialValue = self.$element.val();
            self.init(options,tmpSelectorName);
        }
    };

    RadiobuttonX.prototype = {
        constructor: RadiobuttonX,
        init: function (options,selector) {
            var self = this, $el = self.$element;
            $(selector).each(function(){
                self._getRelatives(this);
            });
            self._run();
            self._detect();
            console.log();
        },

        _run: function () {
            var self = this;
            $('.rx-active').removeClass("rx-checked");
            self._findChecked();
        },
        _getRelatives: function (elem) {
            var self = this;
            var $el = $(elem), $name = $el.attr("name");
            if (self._checkExist($name)) {
                self._addElement($name,$el);
            } else {
                listOfNames.push({"name":$name,"elements":[$el]});
            }
            return $name;
        },
        _checkExist: function (check) {
            var result = false;
            $.map(listOfNames, function(val) {
                if (val.name == check) {
                    result = true;
                }
            });
            return result;
        },
        _addElement: function (check, element) {
            $.map(listOfNames, function(val) {
                if (val.name == check) {
                    val.elements.push(element);
                }
            });
        },
        _findChecked: function () {
            var self = this;
            $.map(listOfNames, function(val) {
                val.elements.forEach(function(item) {
                    if ($(item).prop("checked")) {
                        self._draw(item);
                    }
                });

            });
        },
        _detect: function () {
            var self = this;
            $('.radio').on('click',function() {
                var tmpName = $(this).find('input:radio').attr('name');
                $('*[name=tmpName]').prop('checked',false);
                $(this).find('input:radio').prop('checked',true);
                self._run();
            });
        },
        _draw: function (element) {
            $(element).closest('.rx-container').find('.rx-active').addClass('rx-checked');
        }
    };

    $.fn.radiobuttonX = function (option) {
        var args = Array.apply(null, arguments), retvals = [];
        args.shift();
        this.each(function () {
            var $this = $(this), data = $this.data('radiobuttonX'), options = typeof option === 'object' && option;
            if (!data) {
                data = new RadiobuttonX(this, $.extend(true, {}, $.fn.radiobuttonX.defaults, options, $this.data()));
                $this.data('radiobuttonX', data);
            }
            if (typeof option === 'string') {
                retvals.push(data[option].apply(data, args));
            }
        });
        switch (retvals.length) {
            case 0:
                return this;
            case 1:
                return retvals[0];
            default:
                return retvals;
        }
    };

    $.fn.radiobuttonX.defaults = {
        //theme: '',
        //threeState: true,
        //inline: true,
        //iconChecked: '<i class="glyphicon glyphicon-ok"></i>',
        //iconUnchecked: ' ',
        //iconNull: '<div class="rx-icon-null"></div>',
        //valueChecked: '1',
        //valueUnchecked: '0',
        //valueNull: '',
        //size: 'md',
        //enclosedLabel: false,
        //useNative: false,
        //allowThreeValOnInit: false,
        //tabindex: "1000"
    };

    $.fn.radiobuttonX.Constructor = RadiobuttonX;

    $('input[data-toggle="radiobutton-x"]').addClass('rx-loading');

    $(document).ready(function () {
        $('input[data-toggle="radiobutton-x"]').radiobuttonX();
    });
})(window.jQuery);