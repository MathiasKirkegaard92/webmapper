function MapProperties(container, graph) {
    this._container = container;
    this.graph = graph;
}

MapProperties.prototype = {
    // Initialize the Top Menu Bar Component
    init : function() {
        var _self = this;   // to pass to context of THIS to event handlers

        window.saveLocation = '';        // Where the network will be saved

        $(this._container).append(
            "<div' class='topMenu' style='width:calc(75% - 170px);'>"+
                "<div class='topMenuTitle'><strong>MAP</strong></div>"+
                "<div id='mapPropsDiv' class='topMenuContainer'></div>"+
            "</div>");

        //Add the expression editor
        $('#mapPropsDiv').append(
            "<div id='expression' class='signalControl disabled' style='width:50%; padding-top:5px;'><a href='./doc/expression_syntax.html' target='blank' style='color:white'>Expression:</a>"+
                "<input type='text' id='expression 'class='expression' style='width:calc(100% - 90px); height: 48px'></input>"+
            "</div>"+
            "<div id='ranges' style='width:50%'></div>");

        //Add the range controls
        $('#ranges').append(
            "<div id='srcRange' class='range signalControl disabled'>"+
                "<div style='width:80px'>Src Range:</div>"+
                "<div style='width:calc(100% - 120px)'>"+
                    "<div style='width:24px'></div>"+
                    "<input class='range' id='src_min' style='width:calc(50% - 34px)'></input>"+
                    "<div id='srcRangeSwitch' class='rangeSwitch'></div>"+
                    "<input class='range' id='src_max' style='width:calc(50% - 34px)'></input>"+
                    "<div style='width:24px'></div>"+
                "</div>"+
                "<div id='setLinear' class='setlinear'>Linear</div>"+
            "</div>"+
            "<div id='dstRange' class='range signalControl disabled'>"+
                "<div style='width:80px'>Dest Range:</div>"+
                "<div style='width:calc(100% - 120px)'>"+
                    "<div id='boundaryMin' class='boundary boundaryDown' type='button'></div>"+
                    "<input class='range' id='dst_min' style='width:calc(50% - 34px)'></input>"+
                    "<div id='dstRangeSwitch' class='rangeSwitch'></div>"+
                    "<input class='range' id='dst_max' style='width:calc(50% - 34px)'></input>"+
                    "<div id='boundaryMax' class='boundary boundaryUp' type='button'></div>"+
                "</div>"+
                "<div id='srcCalibrate' class='calibrate'>Calib</div>"+
            "</div>");

        this.addHandlers();
    },

    addHandlers : function() {
        var _self = this;

        $('#networkSelection').on('change', function(e) {
            $(this._container).trigger("selectNetwork", e.currentTarget.value);
        });

        //The expression and range input handlers
        $('.topMenu').on({
            keydown: function(e) {
                e.stopPropagation();
                if (e.which == 13) { //'enter' key
                    _self.setMapProperty($(this).attr('id').split(' ')[0],
                                         this.value);
                }
            },
            click: function(e) { e.stopPropagation(); },
        }, 'input');

        $('.boundary').on('click', function(e) {
            _self.on_boundary(e, _self);
        });

        $('.rangeSwitch').click(function(e) {
            e.stopPropagation();
            _self.setMapProperty(e.currentTarget.id, null);
        });

        $('.calibrate').click(function(e) {
            e.stopPropagation();
            _self.setMapProperty(e.currentTarget.id, null);
        });

        $('body').on('keydown', function(e) {
            if (e.which == 77)
                _self.setMapProperty("muted", null);
        });

        $('.expr_doc_link').click(function(e) {
            // show expression documentation
            $('#status').stop(true, false)
                        .empty()
                        .load('./doc/expression_syntax.html')
                        .css({'left': '20%',
                              'top': 70,
                              'width': '60%',
                              'height': 'calc(100% - 90px)',
                              'opacity': 0.9});
        });
    },

    updateNetworkInterfaces : function() {
        $('#networkSelection').children('*').remove();
        for (var i in this.graph.networkInterfaces.available) {
            let iface = this.graph.networkInterfaces.available[i];
            if (iface == this.graph.networkInterfaces.selected)
                $('#networkSelection').append("<option value='"+iface+"' selected>"+iface+"</option>");
            else
                $('#networkSelection').append("<option value='"+iface+"'>"+iface+"</option>");
        }
    },

    // clears and disables the map properties bar
    clearMapProperties : function() {
        $('.topMenu input').val('');
        $('.boundary').removeAttr('class').addClass('boundary boundaryNone');
        $('.signalControl').children('*').removeClass('disabled');
        $('.signalControl').addClass('disabled');
        $('.calibrate').removeClass('calibratesel');
        $('.setlinear').removeClass('setlinearsel');
        $('.expression').removeClass('waiting');
        $('.ranges').children('*').removeClass('waiting');
    },

    selected : function(map) {
        return map.view && map.view.selected;
    },

    updateMapProperties : function() {
        this.clearMapProperties();

        var expression = null;
        var src_min = null;
        var src_max = null;
        var dst_min = null;
        var dst_max = null;
        var src_calibrating = null;
        var dst_calibrating = null;
        var dst_bound_min = null;
        var dst_bound_max = null;

        $('.signalControl').removeClass('disabled');
        $('.signalControl').children('*').removeClass('disabled');

        this.graph.maps.filter(this.selected).each(function(map) {
            if (expression == null)
                expression = map.expression;
            else if (expression != map.expression)
                expression = 'multiple expressions';

            if (src_min == null)
                src_min = map.src_min;
            else if (src_min != map.src_min)
                src_min = 'multiple';
            if (src_max == null)
                src_max = map.src_max;
            else if (src_max != map.src_max)
                src_max = 'multiple';
            if (src_calibrating == null)
                src_calibrating = map.src_calibrating;
            else if (src_calibrating != map.src_calibrating)
                src_calibrating = 'multiple';

            if (dst_min == null)
                dst_min = map.dst_min;
            else if (dst_min != map.dst_min)
                dst_min = 'multiple';
            if (dst_max == null)
                dst_max = map.dst_max;
            else if (dst_max != map.dst_max)
                dst_max = 'multiple';
            if (dst_calibrating == null)
                dst_calibrating = map.dst_calibrating;
            else if (dst_calibrating != map.dst_calibrating)
                dst_calibrating = 'multiple';

            if (dst_bound_min == null)
                dst_bound_min = map.dst_bound_min;
            else if (dst_bound_min != map.dst_bound_min)
                dst_bound_min = 'multiple';
            if (dst_bound_max == null)
                dst_bound_max = map.dst_bound_max;
            else if (dst_bound_max != map.dst_bound_max)
                dst_bound_max = 'multiple';
        });

        if (expression != null) {
            $(".expression").removeClass('waiting');
            $(".expression").val(expression);
            if (expression == 'multiple expressions')
                $(".expression").css({'font-style': 'italic'});
            else
                $(".expression").css({'font-style': 'normal'});
        }

        if (src_min != null) {
            $("#src_min").removeClass('waiting');
            if (src_min != 'multiple')
                $("#src_min").val(src_min);
        }
        if (src_max != null) {
            $("#src_max").removeClass('waiting');
            if (src_max != 'multiple')
                $("#src_max").val(src_max);
        }
        if (dst_min != null) {
            $("#dst_min").removeClass('waiting');
            if (dst_min != 'multiple')
                $("#dst_min").val(dst_min);
        }
        if (dst_max != null) {
            $("#dst_max").removeClass('waiting');
            if (dst_max != 'multiple')
                $("#dst_max").val(dst_max);
        }

        if (src_calibrating == true)
            $("#srcCalibrate").addClass("calibratesel");
        else if (src_calibrating == false)
            $("#srcCalibrate").removeClass("calibratesel");
        if (dst_calibrating == true)
            $("#dstCalibrate").addClass("calibratesel");
        else if (dst_calibrating == false)
            $("#dstCalibrate").removeClass("calibratesel");

        if (dst_bound_min != null)
            this.set_boundary($("#boundaryMin"), dst_bound_min, 0);
        if (dst_bound_max != null)
            this.set_boundary($("#boundaryMax"), dst_bound_max, 1);
    },

    // object with arguments for the map
    updateMapPropertiesFor : function(key) {
        // check if map is selected
        var map = this.graph.maps.find(key);
        if (this.selected(map))
            this.updateMapProperties();
    },

    setMapProperty : function(key, value) {
        let container = $(this._container);
        this.graph.maps.filter(this.selected).each(function(map) {
            if (map[key] == value || map[key] == parseFloat(value))
                return;

            var msg = {};

            // set the property being modified
            switch (key) {
            case 'srcRangeSwitch':
                msg['src_max'] = String(map['src_min']);
                msg['src_min'] = String(map['src_max']);
                break;
            case 'dstRangeSwitch':
                msg['dst_max'] = String(map['dst_min']);
                msg['dst_min'] = String(map['dst_max']);
                break;
            case 'muted':
                msg['muted'] = !map['muted'];
                break;
            case 'expression':
                if (value == map.expression)
                    return;
                msg['expression'] = value;
                $(".expression").addClass('waiting');
                break;
            case 'src_min':
                if (value == map.src_min)
                    return;
                msg['src_min'] = value;
                $("#src_min").addClass('waiting');
                break;
            case 'src_max':
                if (value == map.src_max)
                    return;
                msg['src_max'] = value;
                $("#src_max").addClass('waiting');
                break;
            case 'dst_min':
                if (value == map.dst_min)
                    return;
                msg['dst_min'] = value;
                $("#dst_min").addClass('waiting');
                break;
            case 'dst_max':
                if (value == map.dst_max)
                    return;
                msg['dst_max'] = value;
                $("#dst_max").addClass('waiting');
                break;

            default:
                msg[key] = value;
            }

            // copy src and dst names
            msg['src'] = map['src'].key;
            msg['dst'] = map['dst'].key;

            // send the command, should receive a /mapped message after.
            container.trigger("setMap", [msg]);
        });
    },

    on_load : function() {
        var _self = this;

        //A quick fix for now to get #container out of the way of the load dialogs
        var body = document.getElementsByTagName('body')[0];
        var iframe = document.createElement('iframe');
        iframe.name = 'file_upload';
        iframe.style.visibility = 'hidden';
        body.appendChild(iframe);

        var form = document.createElement('form');
        form.innerHTML = '<input id="file" type="file"                   \
                           name="mapping_json" size="40" accept="json">  \
                          <input type="submit" style="display: none;">   \
                          <input type="button" value="Cancel" id="cancel">';
        form.method = 'POST';
        form.enctype = 'multipart/form-data';
        form.action = '/load';
        form.target = 'file_upload';

        var l = document.createElement('li');
        l.appendChild(form);
        $('.topMenu').append(l);

        iframe.onload = function() {
//            var t = $(iframe.contentDocument.body).text();
//            if (t.search('Success:') == -1 && t.search('Error:') == -1)
//                return;
            _self.notify($(iframe.contentDocument.body).text());
            $(l).remove();
            body.removeChild(iframe);
        };

        $('#cancel', form).click(function() {
            $(l).remove();
            $('#container').removeClass('onLoad');
            body.removeChild(iframe);
        });

        form.firstChild.onchange = function() {

            var fn = document.createElement('input');
            fn.type = 'hidden';
            fn.name = 'filename';
            fn.value = form.firstChild.value;
            form.appendChild(fn);

            // The devices currently in focused
            var devs = view.get_focused_devices();

            // Split them into sources and destinations
            var srcdevs = [];
            var dstdevs = [];
            this.graph.devices.each(function(dev) {
                if (devs.includes(dev.name)) {
                    if (dev.num_outputs)
                        srcdevs.push(dev.name);
                    if (dev.num_inputs)
                        dstdevs.push(dev.name);
                }
            });

            // So that the monitor can see which devices are being looked at
            var srcs = document.createElement('input');
            srcs.type = 'hidden';
            srcs.name = 'sources';
            srcs.value = srcdevs.join();
            form.appendChild(srcs);

            var dsts = document.createElement('input');
            dsts.type = 'hidden';
            dsts.name = 'destinations';
            dsts.value = dstdevs.join();
            form.appendChild(dsts);

            form.submit();
        };
        return false;
    },

    notify : function(msg) {
        var li = document.createElement('li');
        li.className = 'notification';
        li.innerHTML = msg;
        $('.topMenu').append(li);
        setTimeout(function() {
            $(li).fadeOut('slow', function() { $(li).remove();});
        }, 5000);
    },

    set_boundary : function (boundaryElement, value, ismax) {
        for (var i in this.boundaryIcons)
            boundaryElement.removeClass("boundary"+this.boundaryIcons[i]);

        if (value == 'None') { // special case, icon depends on direction
            if (ismax)
                boundaryElement.addClass('boundaryRight');
            else
                boundaryElement.addClass('boundaryLeft');
        }
        else if (value == 'Fold') { // special case, icon depends on direction
            if (ismax)
                boundaryElement.addClass('boundaryLeft');
            else
                boundaryElement.addClass('boundaryRight');
        }
        else if (value != null) {
            boundaryElement.addClass('boundary'+value);
        }
    },

    /**
     * Updates the save/loading functions based on the view's state
     * currently set up for the list view only
     */
    updateSaveLocation : function(location) {
        // get the save location
        if (location) {
            window.saveLocation = location;
        }
        else {
            window.saveLocation = '';
        }

        // update the save button's link
        $('#saveButton').attr('href', window.saveLocation);

        // if saving is not ready, disable the save button
        if (window.saveLocation == '') {
            $('#saveButton, #loadButton').addClass('disabled');
        }
        // if saving is ready, enable the save button
        else {
            $('#saveButton, #loadButton').removeClass('disabled');
        }
    }
};
