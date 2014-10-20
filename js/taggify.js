/*********************************************
 * Taggify v0.1
 *********************************************
 * Authtor: Adrian Tilita <adrian@tilita.ro>
 ********************************************/
(function ($) {
    $.fn.taggify = function (options) {

        // Declaring settings and options
        var local_settings = {
            separator: ',',
            theme: 'default',
            selector: $(this).selector,
            tags: []
        };
        var settings = $.extend({}, local_settings, options);
        // Converting separator so we can know were a tag has ended
        settings.separator_keychar = settings.separator.charCodeAt(0);

        // Splitting each requested taggify
        return this.each(function() {

            // Hide the element
            $(this).attr('type','hidden');
        
            // Build Methods
            var build = {
                // Generate ID's to avoid element duplicate
                id: function() {
                    var _return = '';
                    var _string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                    var _string_lenght = _string.length;
                    for(var i = 0; i < 7; i++)
                        _return += _string.charAt(Math.floor(Math.random() * _string_lenght));
                    return _return;
                },
                // Build container - Fake input
                replacement: function() {
                    var _container_id = this.id();
                    var _container = $('<div></div>').addClass(settings.theme + ' tagwrap').attr({
                        'id': _container_id 
                    });
                    var _identifier= this.id();
                    var _input     = $('<input />').attr({
                        'type':'text',
                        'class':'input',
                        'name': _identifier,
                        'id':   _identifier
                    })
                    _container.append(_input);
                    $(settings.selector).before(_container);
                    settings.container = $('#' + _container_id)
                    settings.current   = $('#' + _identifier);
                    settings.container.click(function() {
                        settings.current.focus();
                    });
					// Completing with tags if are any
					var _items = $(settings.selector).val();
					if (_items != '') {
						_items = _items.split(',');
						$(settings.selector).val('');
						var _list = new Array;
						for(var tag in _items) {
							_list[tag] = _items[tag].trim();
							build.tag( _items[tag].trim() );
						}
						$(settings.selector).val(_list.join(','));
					}
                },
                // Add The Tag Like Box
                tag: function( _tag_ ) {
                    var _string    = $('<span></span>').html(_tag_);
                    var _close_btn = $('<a></a>').html('x').attr({
                       'href': 'javascript:void(0)',
                       'title':'Remove tag'
                    }).click(function() {
                        $(this).parent().remove();
                        build.remove(_tag_);
                    });
                    var _container = $('<div></div>').addClass(settings.theme + ' tag_container');
                    _container.append(_string);
                    _container.append(_close_btn);
                    settings.current.before(_container);
                },
                remove: function(_tag_) {

                    var _tags = $(settings.selector).val();
                    var _new_list = '';
                    _tags = _tags.split(',');
                    _count= _tags.length;
                    for (var i = 0; i < _count; i++) {
                        if (_tags[i] != _tag_)
                            _new_list += settings.separator + _tags[i];
                    }
                    // Remove the first separator
                    _new_list = _new_list.substr(1);
                    $(settings.selector).val(_new_list);
                },
                // show suggestion box
                show_suggestions: function(_items) {
                    this.hide_suggestions();
                    var _suggestions_box = $('<div></div>').addClass(settings.theme + ' suggestion_container');
                    var _list = $('<ul></ul>');
                    var _item_ct = _items.length;
                    for (var i = 0; i < _item_ct; i++) {
                        var _suggestion = $('<li></li>').html(_items[i]).click(function() {
							settings.container.find('.suggestion_container li').removeClass('selected');
							$(this).addClass('selected');
							settings.current.val($(this).html())
							handlers.addTag();
							build.hide_suggestions();
						});
                        _list.append(_suggestion);
                    }
                    _suggestions_box.append(_list);

                    // position suggestion box relative to input
                    var _position = settings.current.position();
                    var _input_h  = parseInt(settings.current.height());
                    _suggestions_box.css({
                        left: _position.left + 'px',
                        top: _position.top + _input_h + 'px'
                    });
                    settings.current.before(_suggestions_box);
                    // Highlight the first item
                    settings.container.find('.suggestion_container li').eq(0).addClass('selected');
                },
                hide_suggestions: function() {
                    settings.container.find('.suggestion_container').remove();
                }
            };
            build.replacement();
            // Handlers
            var handlers = {
                // Set an "action" variable - it will be used to know if the separator was pressed
                separator_pressed: false,
                // Verify if separator isset
                verify_separator: function(event) {

                    var _key = event.keyCode ? event.keyCode : event.which ? event.which : event.charCode;
                    if (_key == settings.separator_keychar)
                        this.separator_pressed = true;

                }, // end of verify_separator()
                // Handle keyup events
                key: function(event) {
                    var _key = event.keyCode ? event.keyCode : event.which ? event.which : event.charCode;
                    // Action on main keys
                    switch (_key) {
                        case(9): // tab
                            event.preventDefault();
                            this.selectOptions();
                        break;
                    }
                    // Exclude search on tab, arrows and enter
                    if (_key != 9 && _key != 13 && _key != 38 && _key != 40)
                        this.searchSuggestions();
                    // Add tag when the separator key is pressed, actioned before
                    if (this.separator_pressed === true) {
                        this.addTag();
                        this.separator_pressed = false;
                        build.hide_suggestions();
                    }
                }, // end of key
                // Add Tag
                addTag: function() {
                    var _new_tag = settings.current.val().trim().replace(',','');
					if (_new_tag != '') {
						var _current_val = $(settings.selector).val() != '' ?
											$(settings.selector).val() + settings.separator : '';
						$(settings.selector).val(_current_val + _new_tag);
						build.tag(_new_tag);
						// empty current value
						settings.current.val('');
					} else {
						settings.current.val('');
					}
                }, // end of addTag
                // Search for suggestions
                searchSuggestions: function() {
                    var _sug_count = settings.tags.length;
                    var _suggestions = new Array();
                    var _current_search = settings.current.val().toLowerCase();

                    // Disable search for empty valuea
                    if (_current_search == '')
                        return false;

                    for (var i = 0; i < _sug_count; i++) {
                        if (settings.tags[i].toLowerCase().indexOf(_current_search) == 0)
                            _suggestions.push(settings.tags[i]);
                    }
                    if (_suggestions.length != 0)
                        build.show_suggestions(_suggestions);
                    else
                        build.hide_suggestions();
                },
                // Select suggestion
                selectOptions: function() {
                    if (settings.current.val() != '') {

                        var _current_suggestion = settings.container.find('li.selected').html();
                        settings.current.val(_current_suggestion + settings.separator);
                        this.addTag();
                        build.hide_suggestions();
                        
                    }
                }, // end of selectOptions
                changeOption: function( _direction_ ) {
                    // Total Items
                    var _total_items = settings.container.find('li').length - 1; // it counts 1-9, we need 0-9
                    var _current = settings.container.find('li').index( settings.container.find('li.selected') );

                    switch(_direction_) {
                        case('down'):
                            _current++;
                            if (_current > _total_items)
                                _current = 0;
                            settings.container.find('li').removeClass('selected');
                            settings.container.find('li').eq(_current).addClass('selected');
                        break;
                        case('up'):
                            _current--;
                            if (_current < 0)
                                _current = _total_items;
                            settings.container.find('li').removeClass('selected');
                            settings.container.find('li').eq(_current).addClass('selected');
                        break;
                    }
                },
            };
            // After the key was inputed
            settings.current.keyup(function(e) {
                handlers.key(e);
            });
            // Identifyng physical keys
            settings.current.keydown(function(e) {
                var _key = event.keyCode ? event.keyCode : event.which ? event.which : event.charCode;
                switch(_key) {
                    case(9): // tab
                        event.preventDefault();
                        handlers.selectOptions();
                    break;
                    case(13): // I accidently pressed enter and the form submitted, loosing my work
                        event.preventDefault();
                        handlers.selectOptions();
                    break;
                    case(38): // arrow up
                        event.preventDefault();
                        handlers.changeOption('up');
                    break;
                    case(40): // arrow down
                        event.preventDefault();
                        handlers.changeOption('down');
                    break;
                }
            });
            // Keypress - we need the keypress to compare with our separator with the real character
            settings.current.keypress(function(e) {
                handlers.verify_separator(e);
            });
        }); // end of this.each
    }; // end of taggify
})(jQuery);