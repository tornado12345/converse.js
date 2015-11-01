/*global jQuery, templates, escape, Jed, _ */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(["jquery", "underscore", "converse-templates", "locales"], factory);
    } else {
        root.utils = factory(jQuery, _, templates, locales);
    }
}(this, function ($, _, templates, locales) {
    "use strict";

    var XFORM_TYPE_MAP = {
        'text-private': 'password',
        'text-single': 'text',
        'fixed': 'label',
        'boolean': 'checkbox',
        'hidden': 'hidden',
        'jid-multi': 'textarea',
        'list-single': 'dropdown',
        'list-multi': 'dropdown'
    };

    $.expr[':'].emptyVal = function(obj){
        return obj.value === '';
    };

    $.fn.hasScrollBar = function() {
        if (!$.contains(document, this.get(0))) {
            return false;
        }
        if(this.parent().height() < this.get(0).scrollHeight) {
            return true;
        }
        return false;
    };

    $.fn.addHyperlinks = function () {
        if (this.length > 0) {
            this.each(function (i, obj) {
                var x = $(obj).html();
                var list = x.match(/\b(https?:\/\/|www\.|https?:\/\/www\.)[^\s<]{2,200}\b/g );
                if (list) {
                    for (i=0; i<list.length; i++) {
                        var prot = list[i].indexOf('http://') === 0 || list[i].indexOf('https://') === 0 ? '' : 'http://';
                        var escaped_url = encodeURI(decodeURI(list[i])).replace(/[!'()]/g, escape).replace(/\*/g, "%2A");
                        x = x.replace(list[i], "<a target='_blank' href='" + prot + escaped_url + "'>"+ list[i] + "</a>" );
                    }
                }
                $(obj).html(x);
            });
        }
        return this;
    };

    $.fn.addEmoticons = function (allowed) {
        if (allowed) {
            if (this.length > 0) {
                this.each(function (i, obj) {
                    var text = $(obj).html();
                    text = text.replace(/&gt;:\)/g, '<span class="emoticon icon-evil"></span>');
                    text = text.replace(/:\)/g, '<span class="emoticon icon-smiley"></span>');
                    text = text.replace(/:\-\)/g, '<span class="emoticon icon-smiley"></span>');
                    text = text.replace(/;\)/g, '<span class="emoticon icon-wink"></span>');
                    text = text.replace(/;\-\)/g, '<span class="emoticon icon-wink"></span>');
                    text = text.replace(/:D/g, '<span class="emoticon icon-grin"></span>');
                    text = text.replace(/:\-D/g, '<span class="emoticon icon-grin"></span>');
                    text = text.replace(/:P/g, '<span class="emoticon icon-tongue"></span>');
                    text = text.replace(/:\-P/g, '<span class="emoticon icon-tongue"></span>');
                    text = text.replace(/:p/g, '<span class="emoticon icon-tongue"></span>');
                    text = text.replace(/:\-p/g, '<span class="emoticon icon-tongue"></span>');
                    text = text.replace(/8\)/g, '<span class="emoticon icon-cool"></span>');
                    text = text.replace(/:S/g, '<span class="emoticon icon-confused"></span>');
                    text = text.replace(/:\\/g, '<span class="emoticon icon-wondering"></span>');
                    text = text.replace(/:\/ /g, '<span class="emoticon icon-wondering"></span>');
                    text = text.replace(/&gt;:\(/g, '<span class="emoticon icon-angry"></span>');
                    text = text.replace(/:\(/g, '<span class="emoticon icon-sad"></span>');
                    text = text.replace(/:\-\(/g, '<span class="emoticon icon-sad"></span>');
                    text = text.replace(/:O/g, '<span class="emoticon icon-shocked"></span>');
                    text = text.replace(/:\-O/g, '<span class="emoticon icon-shocked"></span>');
                    text = text.replace(/\=\-O/g, '<span class="emoticon icon-shocked"></span>');
                    text = text.replace(/\(\^.\^\)b/g, '<span class="emoticon icon-thumbs-up"></span>');
                    text = text.replace(/&lt;3/g, '<span class="emoticon icon-heart"></span>');
                    $(obj).html(text);
                });
            }
        }
        return this;
    };

    var utils = {
        // Translation machinery
        // ---------------------
        __: function (str) {
            // Translation factory
            if (typeof this.i18n === "undefined") {
                this.i18n = locales.en;
            }
            if (typeof this.i18n === "string") {
                this.i18n = $.parseJSON(this.i18n);
            }
            if (typeof this.jed === "undefined") {
                this.jed = new Jed(this.i18n);
            }
            var t = this.jed.translate(str);
            if (arguments.length>1) {
                return t.fetch.apply(t, [].slice.call(arguments,1));
            } else {
                return t.fetch();
            }
        },

        ___: function (str) {
            /* XXX: This is part of a hack to get gettext to scan strings to be
                * translated. Strings we cannot send to the function above because
                * they require variable interpolation and we don't yet have the
                * variables at scan time.
                *
                * See actionInfoMessages
                */
            return str;
        },

        renderCanvas: function (type, data, dx, dy, dWidth, dHeight) {
            /* Create a HTML canvas element and render an image inside it.
             *
             * Parameters:
             *      (String) type - the image type
             *      (Base64 String) data - the image data
             *      (Number) dx - The X coordinate in the destination canvas at which to
             *                    place the top-left corner of the source image.
             *      (Number) dy - The Y coordinate in the destination canvas at which to
             *                    place the top-left corner of the source image.
             *      (Number) dWidth - The width to draw the image in the destination canvas. This
             *                        allows scaling of the drawn image. If not specified, the
             *                        image is not scaled in width when drawn.
             *      (Number) dHeight - The height to draw the image in the destination canvas.
             *                         This allows scaling of the drawn image. If not specified,
             *                         the image is not scaled in height when drawn.
             */
            var canvas = $('<canvas></canvas>').get(0);
            if (!(canvas.getContext && canvas.getContext('2d'))) {
                return canvas;
            }
            var ctx = canvas.getContext('2d');
            var img = new Image();
            img.onload = function () {
                var ratio;
                if (dHeight && dWidth) {
                    ratio = img.width/img.height;
                    if (ratio < 1) {
                        dHeight = dHeight*(1/ratio);
                    } else if (dHeight) {
                        dHeight = dHeight*ratio;
                    }
                    ctx.drawImage(img, dx, dy, dWidth, dHeight);
                } else {
                    ctx.drawImage(img, dx, dy);
                }
            };
            img.src = 'data:'+type+';base64,'+data;
            return canvas;
        },

        webForm2xForm: function (field) {
            /* Takes an HTML DOM and turns it into an XForm field.
            *
            * Parameters:
            *      (DOMElement) field - the field to convert
            */
            var $input = $(field), value;
            if ($input.is('[type=checkbox]')) {
                value = $input.is(':checked') && 1 || 0;
            } else if ($input.is('textarea')) {
                value = [];
                var lines = $input.val().split('\n');
                for( var vk=0; vk<lines.length; vk++) {
                    var val = $.trim(lines[vk]);
                    if (val === '')
                        continue;
                    value.push(val);
                }
            } else {
                value = $input.val();
            }
            return $(templates.field({
                name: $input.attr('name'),
                value: value
            }))[0];
        },

        xForm2webForm: function xForm2webForm ($field, $stanza) {
            /* Takes a field in XMPP XForm (XEP-004: Data Forms) format
            * and turns it into a HTML DOM field.
            *
            *  Parameters:
            *      (XMLElement) field - the field to convert
            */
            // FIXME: take <required> into consideration
            var options = [], j, $options, $values, value, values;

            if ($field.attr('type') === 'list-single' || $field.attr('type') === 'list-multi') {
                values = [];
                $values = $field.children('value');
                for (j=0; j<$values.length; j++) {
                    values.push($($values[j]).text());
                }
                $options = $field.children('option');
                for (j=0; j<$options.length; j++) {
                    value = $($options[j]).find('value').text();
                    options.push(templates.select_option({
                        value: value,
                        label: $($options[j]).attr('label'),
                        selected: (values.indexOf(value) >= 0),
                        required: $field.find('required').length
                    }));
                }
                return templates.form_select({
                    name: $field.attr('var'),
                    label: $field.attr('label'),
                    options: options.join(''),
                    multiple: ($field.attr('type') === 'list-multi'),
                    required: $field.find('required').length
                });
            } else if ($field.attr('type') === 'fixed') {
                return $('<p class="form-help">').text($field.find('value').text());
            } else if ($field.attr('type') === 'jid-multi') {
                return templates.form_textarea({
                    name: $field.attr('var'),
                    label: $field.attr('label') || '',
                    value: $field.find('value').text(),
                    required: $field.find('required').length
                });
            } else if ($field.attr('type') === 'boolean') {
                return templates.form_checkbox({
                    name: $field.attr('var'),
                    type: XFORM_TYPE_MAP[$field.attr('type')],
                    label: $field.attr('label') || '',
                    checked: $field.find('value').text() === "1" && 'checked="1"' || '',
                    required: $field.find('required').length
                });
            } else if ($field.attr('type') && $field.attr('var') === 'username') {
                return templates.form_username({
                    domain: ' @'+this.domain,
                    name: $field.attr('var'),
                    type: XFORM_TYPE_MAP[$field.attr('type')],
                    label: $field.attr('label') || '',
                    value: $field.find('value').text(),
                    required: $field.find('required').length
                });
            } else if ($field.attr('type')) {
                return templates.form_input({
                    name: $field.attr('var'),
                    type: XFORM_TYPE_MAP[$field.attr('type')],
                    label: $field.attr('label') || '',
                    value: $field.find('value').text(),
                    required: $field.find('required').length
                });
            } else {
                if ($field.attr('var') === 'ocr') { // Captcha
                    return _.reduce(_.map($field.find('uri'),
                            $.proxy(function (uri) {
                                return templates.form_captcha({
                                    label: this.$field.attr('label'),
                                    name: this.$field.attr('var'),
                                    data: this.$stanza.find('data[cid="'+uri.textContent.replace(/^cid:/, '')+'"]').text(),
                                    type: uri.getAttribute('type'),
                                    required: this.$field.find('required').length
                                });
                            }, {'$stanza': $stanza, '$field': $field})
                        ),
                        function (memo, num) { return memo + num; }, ''
                    );
                }
            }
        },

        xml2json: function xml2json (xml, tab) {
            /* This work is licensed under Creative Commons GNU LGPL License.
             * License: http://creativecommons.org/licenses/LGPL/2.1/
             * Version: 0.9
             * Author:  Stefan Goessner/2006
             * Web:     http://goessner.net/ 
             */
            var X = {
                toObj: function(xml) {
                    var n;
                    var o = {};
                    if (xml.nodeType==1) {   // element node ..
                        if (xml.attributes.length)   // element with attributes  ..
                        for (var i=0; i<xml.attributes.length; i++) {
                            o["@"+xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue||"").toString();
                        }
                        if (xml.firstChild) { // element has child nodes ..
                            var textChild=0, cdataChild=0, hasElementChild=false;
                            for (n=xml.firstChild; n; n=n.nextSibling) {
                                if (n.nodeType==1) hasElementChild = true;
                                else if (n.nodeType==3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) textChild++; // non-whitespace text
                                else if (n.nodeType==4) cdataChild++; // cdata section node
                            }
                            if (hasElementChild) {
                                if (textChild < 2 && cdataChild < 2) { // structured element with evtl. a single text or/and cdata node ..
                                    X.removeWhite(xml);
                                    for (n=xml.firstChild; n; n=n.nextSibling) {
                                        if (n.nodeType == 3)  // text node
                                        o["#text"] = X.escape(n.nodeValue);
                                        else if (n.nodeType == 4)  // cdata node
                                        o["#cdata"] = X.escape(n.nodeValue);
                                        else if (o[n.nodeName]) {  // multiple occurence of element ..
                                        if (o[n.nodeName] instanceof Array)
                                            o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
                                        else
                                            o[n.nodeName] = [o[n.nodeName], X.toObj(n)];
                                        }
                                        else  // first occurence of element..
                                        o[n.nodeName] = X.toObj(n);
                                    }
                                }
                                else { // mixed content
                                    if (!xml.attributes.length)
                                        o = X.escape(X.innerXml(xml));
                                    else
                                        o["#text"] = X.escape(X.innerXml(xml));
                                }
                            }
                            else if (textChild) { // pure text
                                if (!xml.attributes.length)
                                    o = X.escape(X.innerXml(xml));
                                else
                                    o["#text"] = X.escape(X.innerXml(xml));
                            }
                            else if (cdataChild) { // cdata
                                if (cdataChild > 1) {
                                    o = X.escape(X.innerXml(xml));
                                } else {
                                    for (n=xml.firstChild; n; n=n.nextSibling)
                                        o["#cdata"] = X.escape(n.nodeValue);
                                }
                            }
                        }
                        if (!xml.attributes.length && !xml.firstChild) o = null;
                    }
                    else if (xml.nodeType==9) { // document.node
                        o = X.toObj(xml.documentElement);
                    }
                    else
                        alert("unhandled node type: " + xml.nodeType);
                    return o;
                },
                toJson: function(o, name, ind) {
                    var json = name ? ("\""+name+"\"") : "";
                    if (o instanceof Array) {
                        for (var i=0,n=o.length; i<n; i++)
                        o[i] = X.toJson(o[i], "", ind+"\t");
                        json += (name?":[":"[") + (o.length > 1 ? ("\n"+ind+"\t"+o.join(",\n"+ind+"\t")+"\n"+ind) : o.join("")) + "]";
                    } else if (o === null) {
                        json += (name&&":") + "null";
                    } else if (typeof(o) === "object") {
                        var arr = [];
                        for (var m in o)
                        arr[arr.length] = X.toJson(o[m], m, ind+"\t");
                        json += (name?":{":"{") + (arr.length > 1 ? ("\n"+ind+"\t"+arr.join(",\n"+ind+"\t")+"\n"+ind) : arr.join("")) + "}";
                    } else if (typeof(o) == "string") {
                        json += (name&&":") + "\"" + o.toString() + "\"";
                    } else {
                        json += (name&&":") + o.toString();
                    }
                    return json;
                },
                innerXml: function(node) {
                    var s = "";
                    if ("innerHTML" in node) {
                        s = node.innerHTML;
                    } else {
                        var asXml = function(n) {
                            var s = "";
                            if (n.nodeType == 1) {
                                s += "<" + n.nodeName;
                                for (var i=0; i<n.attributes.length;i++) {
                                    s += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[i].nodeValue||"").toString() + "\"";
                                }
                                if (n.firstChild) {
                                    s += ">";
                                    for (var c=n.firstChild; c; c=c.nextSibling)
                                        s += asXml(c);
                                    s += "</"+n.nodeName+">";
                                } else {
                                    s += "/>";
                                }
                            } else if (n.nodeType == 3) {
                                s += n.nodeValue;
                            } else if (n.nodeType == 4) {
                                s += "<![CDATA[" + n.nodeValue + "]]>";
                            }
                            return s;
                        };
                        for (var c=node.firstChild; c; c=c.nextSibling) {
                            s += asXml(c);
                        }
                    }
                    return s;
                },
                escape: function(txt) {
                    return txt.replace(/[\\]/g, "\\\\")
                            .replace(/[\"]/g, '\\"')
                            .replace(/[\n]/g, '\\n')
                            .replace(/[\r]/g, '\\r');
                },
                removeWhite: function(e) {
                    e.normalize();
                    for (var n = e.firstChild; n; ) {
                        if (n.nodeType == 3) {  // text node
                            if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) { // pure whitespace text node
                                var nxt = n.nextSibling;
                                e.removeChild(n);
                                n = nxt;
                            } else {
                                n = n.nextSibling;
                            }
                        } else if (n.nodeType == 1) {  // element node
                            X.removeWhite(n);
                            n = n.nextSibling;
                        } else {                    // any other node
                            n = n.nextSibling;
                        }
                    }
                    return e;
                }
            };
            if (xml.nodeType == 9) { // document node
                xml = xml.documentElement;
            }
            var json = X.toJson(X.toObj(X.removeWhite(xml)), xml.nodeName, "\t");
            return "{\n" + tab + (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, "")) + "\n}";
        }
    };
    return utils;
}));
