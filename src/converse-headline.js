// Converse.js (A browser based XMPP chat client)
// http://conversejs.org
//
// Copyright (c) 2012-2016, Jan-Carel Brand <jc@opkode.com>
// Licensed under the Mozilla Public License (MPLv2)
//
/*global define */

(function (root, factory) {
    define("converse-headline", [
            "converse-core",
            "converse-api",
            // TODO: remove this dependency
            "converse-chat"
    ], factory);
}(this, function (converse, converse_api) {
    "use strict";
    var utils = converse_api.env.utils,
        _ = converse_api.env._,
        __ = utils.__.bind(converse);


    converse_api.plugins.add('headline', {

        initialize: function () {
            /* The initialize function gets called as soon as the plugin is
             * loaded by converse.js's plugin machinery.
             */

            converse.HeadlineBoxView = converse.ChatBoxView.extend({
                className: 'chatbox headlines',

                render: function () {
                    this.$el.attr('id', this.model.get('box_id'))
                        .html(converse.templates.chatbox(
                                _.extend(this.model.toJSON(), {
                                        show_toolbar: false,
                                        show_textarea: false,
                                        title: this.model.get('title'),
                                        info_close: __('Close this box'),
                                        info_minimize: __('Minimize this box'),
                                        label_personal_message: __('Personal message') // XXX: Needed?
                                    }
                                )
                            )
                        );
                    this.setWidth();
                    this.$content.on('scroll', _.debounce(this.onScroll.bind(this), 100));
                    converse.emit('headlinesBoxOpened', this);
                    window.setTimeout(utils.refreshWebkit, 50);
                    return this;
                },


            });
        }
    });
}));
