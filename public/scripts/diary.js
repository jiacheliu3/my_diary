function edit_diary(zone) {
    var timeline_body = $(zone).parent().parent().parent();
    console.log('Found timeline body');
    console.log(timeline_body);

    // enable textarea  
    var textarea = timeline_body.find('textarea');
    if (textarea.length == 0) {
        console.log('Error: cannot find textarea');
        return;
    }
    textarea.attr("readonly", false);;

    // display save button


}
function display_message(res){
    var message_box=$("#message-box");
    console.log(message_box);
    if(!message_box){
        console.log("Cannot find message box.");
    }else{
        status=res.success;
        message=res.message;

        if(status=true){
            console.log('Successful: '+res);
            message_box.attr('class', 'panel panel-success');
        }else{
            console.log('Failed: '+res);
            message_box.attr('class', 'panel panel-danger');
        }

        var heading=message_box.find(".panel-heading");
        console.log('Heading: ');
        console.log(heading);
        heading.text(message);
    }
    console.log('Message displayed');
}

function save_diary(zone) {
    // find the contents
    var panel = $(zone).closest('.timeline-panel');
    console.log('Parent of this element:');
    console.log(panel);
    if (panel.length == 0) {
        console.log('No timeline panel found!');
        return;
    }

    // find the id
    var id = $(panel).attr('mongo_id');
    console.log('Mongo id is ' + id);

    // find the username
    var username = $(panel).attr('username');
    console.log('Username: ' + username);

    // find the date
    var heading = panel.find(">:first-child");
    if (heading.length == 0) {
        console.log('No timeline heading found.');
        return;
    }
    var date_zone = heading.find(">:first-child");
    if (date_zone.length == 0) {
        console.log('Date in title not found.');
        return;
    }
    var date = date_zone[0].innerText;
    console.log('Date is ' + date);

    // convert into milliseconds
    var ms = moment(date, 'MMM DD, YYYY');
    console.log('Parsed date: ' + ms);

    // legit way to find the content
    var emo = $(panel).find('textarea');
    if(emo[0]){
        console.log("Try legit way to get text: ");
        console.log(emo[0].emojioneArea.getText());
    } else{
        console.log("Cannot find the text area.");
        return;
    }
    var text = emo[0].emojioneArea.getText();

    // store timer format
    var timer_format = $(panel).attr('timer_format');
    console.log("Located timer format: "+timer_format);

    // wrap the whole thing
    var wrapped = {
        id: id,
        uname: username,
        date: ms,
        content: text,
        timer_format: timer_format
    }

    // send to serve and wait for response
    $.ajax({
            url: "/diary",
            contentType: 'application/json',
            data: JSON.stringify(wrapped),
            method: "POST"
        })
        .done(function(result) {
            console.log('Response from server');
            console.log(result);
            display_message(result);
        })
        .fail(function(jqXHR, exception) {
            console.log('Failed to save diary.');
            // Our error logic here
            var msg = '';
            if (jqXHR.status === 0) {
                msg = 'Not connect.\n Verify Network.';
            } else if (jqXHR.status == 404) {
                msg = 'Requested page not found. [404]';
            } else if (jqXHR.status == 500) {
                msg = 'Internal Server Error [500].';
            } else if (exception === 'parsererror') {
                msg = 'Requested JSON parse failed.';
            } else if (exception === 'timeout') {
                msg = 'Time out error.';
            } else if (exception === 'abort') {
                msg = 'Ajax request aborted.';
            } else {
                msg = 'Uncaught Error.\n' + jqXHR.responseText;
            }
            console.log(msg);
        })
        .always(function() {
            console.log('Save diary call complete.');
        });


}

function change_date(zone, index) {
    // display date time picker 
    var heading = $(zone).parent().parent();
    console.log('index=' + index);

    var picker = heading.find(".form-group");
    console.log('Picker');
    console.log(picker);
    if (picker.length == 0) {
        console.log('Error: Cannot find datetime picker.');
        display_message({
            success: false,
            message: "Cannot find datetime picker."
        });
        return;
    }

    picker = picker[0];
    picker.style.display = 'block';


    // hide the change_date button
    zone.style.display = "none";

    // display the save date button
    var save_date = heading.find('[id^=save_date]');
    if (save_date.length == 0){
        console.log('Error: cannot find save date button');
        display_message({
            success: false,
            message: "Cannot find save date button"
        });
        return;
    }else {
        var save_date_button = save_date[0];
        save_date_button.style.display = "block";
        display_message({   
            success: true,
            message: "Pick the date in the datetime picker. Save date to update."
        });
        return;
    }
}

function update_date(zone) {
    // read the content in the input first
    var heading = $(zone).parent().parent();
    var input = heading.find('input');

    // the input is the 1st found
    if (input.length == 0) {
        console.log('Error! No input element found under heading.');
        display_message({
            success: false,
            message: "No input element found under heading."
        });
        return;
    }

    // update date content in the zone
    var content = input[0].value;
    var headline = heading.find('h4');
    if (headline.length == 0) {
        console.log('Error: no h4 found in the heading');
        display_message({
            success: false,
            message: 'no h4 found in the heading'
        });
        return;
    }
    headline = headline[0];
    headline.innerText = content;

    // hide the datetime picker
    var picker = heading.find('.form-group');
    console.log('Picker');
    console.log(picker);
    if (picker.length == 0) {
        console.log('Error: Cannot find datetime picker.');
        display_message({
            success: false,
            message: 'Cannot find datetime picker'
        });
        return;
    }

    picker = picker[0];
    picker.style.display = 'none';

    // hide the save date button
    zone.style.display = 'none';

    // display the change date button
    var change_date = heading.find('[id^=change_date]');
    if (change_date.length == 0){
        console.log('Error: cannot find change date button');
        display_message({
            success: false,
            message: 'Cannot find change date button'
        });
        return;
    }else {
        var change_date_button = change_date[0];
        change_date_button.style.display = "block";
        display_message({
            success: true,
            message: 'Date updated. Save diary to keep the change.'
        });
        return;
    }

}

function add_diary(uname) {
    // new index
    var index = global_index;
    global_index++;
    console.log('This diary will have index ' + index);

    // new mongo_id
    var mongo_id = "";

    // decide position of diary
    if (uname == magic_names[0]) {
        var inverted = true;
    } else if (uname == magic_names[1]) {
        var inverted = false;
    } else {
        console.log('Uname ' + uname + ' is not identified. Cannot add diary.');
        return;
    }

    // new date
    var date = moment();
    console.log('New date is ' + date);
    var date_str = date.format('MMM D, YYYY');

    // new content
    var content = "";

    // last modified time
    var last_modified = "Last modified on " + date_str;

    var diary_obj = {
        mongo_id: mongo_id,
        uname: uname,
        date_str: date_str,
        content: content,
        last_modified: last_modified,
        inverted: inverted
    }

    var new_diary = create_diary_dom(index, diary_obj);

    // append the diary and activate
    $("#diary_zone").append(new_diary);
    $(new_diary).find('textarea').emojioneArea();

    // activate all datetime pickers
    $("#datetimepicker_" + index).datetimepicker({
        format: 'MMM D, YYYY'
    });

    // detect text change
    $('.emojionearea-editor').on("DOMSubtreeModified", function() {
        // add changed to its class
        $(this).addClass('changed');

        // enable save button

    });

    display_message({
            success: true,
            message: 'Diary added to frond end. Save diary to keep the change.'
    });
    return;
}

function delete_diary(zone) {
    // find id of this diary
    var panel = $(zone).closest('.timeline-panel');
    console.log('Found panel');
    console.log(panel);

    var li = $(panel).closest('li');

    // requried fields
    var uname = panel.attr('username');
    var id = panel.attr('mongo_id');
    console.log('Target id is ' + id);

    var wrapped = {
        id: id,
        uname: uname
    };
    console.log("Wrapped: ");
    console.log(wrapped);

    if(!id){
        console.log('Found no mongo_id for this diary. Cannot delete.');
        display_message({success: false, message: "Failed to locate id for this diary."});
        return;
    }
    if(!uname){
        console.log('Found no username for this diary. Cannot delete.');
        display_message({success: false, message: "Failed to locate username for this diary."});
        return;
    }

    // ajax call
    $.ajax({
            url: "/delete_diary",
            contentType: 'application/json',
            data: JSON.stringify(wrapped),
            method: "POST"
        })
        .done(function(result) {
            console.log('Response from server');
            console.log(result);

            console.log("Remove li from screen");
            console.log(zone);
            var root = $(zone).closest('ul').closest('li');
            console.log(root);
            root.hide();
            console.log("Should be removed.");
            console.log(root);

            display_message(result);
        })
        .fail(function(jqXHR, exception) {
            console.log('Failed to save diary.');
            // Our error logic here
            var msg = '';
            if (jqXHR.status === 0) {
                msg = 'Not connect.\n Verify Network.';
            } else if (jqXHR.status == 404) {
                msg = 'Requested page not found. [404]';
            } else if (jqXHR.status == 500) {
                msg = 'Internal Server Error [500].';
            } else if (exception === 'parsererror') {
                msg = 'Requested JSON parse failed.';
            } else if (exception === 'timeout') {
                msg = 'Time out error.';
            } else if (exception === 'abort') {
                msg = 'Ajax request aborted.';
            } else {
                msg = 'Uncaught Error.\n' + jqXHR.responseText;
            }
            console.log(msg);
        })
        .always(function() {
            console.log('Delete diary call complete.');
        });
}

function create_diary_dom(index, diary_obj) {
    console.log('Creating diary object: ');
    console.log(diary_obj);

    // get fields
    var mongo_id = diary_obj.mongo_id;
    var uname = diary_obj.uname;
    var date_str = diary_obj.date_str;
    var content = diary_obj.content;
    var last_modified = diary_obj.last_modified;
    var timer_format = diary_obj.timer_format;
    var inverted = diary_obj.inverted;

    console.log('The diary is inverted: ' + inverted);

    if (inverted) {
        var diary_class = "timeline-inverted";
    } else {
        var diary_class = "timeline";
    }

    // create DOM
    var diary = $('<li class="' + diary_class + '">');
    var timeline_panel = $('<div class="timeline-panel" username="' + uname + '" mongo_id="' + mongo_id + '">');
    var timeline_heading = $('<div class="timeline-heading">');
    var timeline_body = $('<div class="timeline-body">');

    // bold title in heading
    var title = $("<h4 class='timeline-title'></h4>").text(date_str);
    var i = $('<i class="glyphicon glyphicon-time">');

    // last modified date
    var lmd = new moment(last_modified);
    console.log("Parsed to last modified date: ");
    console.log(lmd);
    var lmd_str = " Last modified "+lmd.format('MMM D, YYYY');
    var last_modified_date = $('<small class="text-muted">').append(i, lmd_str);
    var sub = $("<p>").append(last_modified_date);
    timeline_heading.append($('<div class="col-sm-6">').append(title, sub));

    // add datetime picker
    var picker_zone = $('<div class="form-group" style="display:none">');
    var picker = $('<div class="input-group date" id="datetimepicker_' + index + '">');
    picker.append($('<input type="text" class="form-control">'), $('<span class="input-group-addon">').append('<span class="glyphicon glyphicon-calendar">'));
    picker_zone.append(picker);
    // add the thing to the zone
    timeline_heading.append($('<div class="col-sm-4" style="padding: 0">').append(picker_zone));

    // add button to change date
    var change_date = $("<button class='btn btn-primary btn-sm ' id=change_date_" + index + " onclick='change_date(this," + index + ")'></button>").text('Change date');
    var save_date = $("<button class='btn btn-primary btn-sm ' id=save_date_" + index + " onclick='update_date(this)' style='display:none' ></button>").text('Save date');
    var date_btn = $('<div class="col-sm-2 pull-right" style="padding: 0">').append(change_date, save_date);
    timeline_heading.append(date_btn);

    // put a horizontal line
    var line = $('<hr style="clear:both;">');

    // create a timer
    if(timer_format){
        var timer = $('<div class="my-timer" id="timer_'+index+'">');
        var ms = moment(date_str, 'MMM DD, YYYY');
        var the_date = new Date(ms);
        console.log('This diary has a timer');
        timeline_body.append(timer);
    }

    // text area to hold text
    var textarea = $('<textarea id="diary_text_' + index + '" oninput="text_change(this)">');
    timeline_body.append(textarea);

    // add button group to the body
    var button_zone = $('<div class="col-sm-6 btn-zone pull-right">');
    var button_group = $('<div class="btn-group pull-right">');
    var action_button = $('<button type="button" class="btn btn-primary btn-sm dropdown-toggle" data-toggle="dropdown">')
        .append('<i class="glyphicon glyphicon-cog"></i> <span class="caret"></span>');
    var action_dropdown = $('<ul class="dropdown-menu" role="menu">')
        .append('<li><a onclick="delete_diary(this)">Delete this diary</a></li>')
        .append('<li><a onclick="add_timer(this)">Add a timer since this day</a></li>');
    var save_button = $('<button type="button" class="btn btn-primary btn-sm " onclick="save_diary(this)"> style="display:none"')
        .append('<span>Save Diary</span>');
    button_zone.append(button_group.append(save_button, action_button, action_dropdown));
    timeline_body.append(button_zone);

    // put it all together
    timeline_panel.append(timeline_heading, line, timeline_body);
    diary.append(timeline_panel);

    // activate timer
    $(timer).countdown({since: the_date, 
        format: timer_format});

    console.log('Generated new diary');
    console.log(diary);

    return diary;
}

function add_timer(zone){
    console.log("Searching up the tree from ");
    console.log(zone);

    // find id of this diary    
    var panel = $(zone).closest('.timeline-panel');
    console.log('Found panel');
    console.log(panel);

    var root = $(panel).closest('li');

    // find the id
    var id = $(panel).attr('mongo_id');
    console.log('Mongo id is ' + id);

    // find the date
    var heading = panel.find(">:first-child");
    if (heading.length == 0) {
        console.log('No timeline heading found.');
        return;
    }
    var date_zone = heading.find(">:first-child");
    if (date_zone.length == 0) {
        console.log('Date in title not found.');
        return;
    }
    var date = date_zone[0].innerText;
    console.log('Date is ' + date);

    // convert into milliseconds
    var ms = moment(date, 'MMM DD, YYYY');
    console.log('Parsed date: ' + ms);

    // create a timer
    var timer = $('<div class="my-timer" id="timer_'+id+'">');
    panel.find(".timeline-body").prepend(timer);

    var timer_format = 'YODHMS';

    var the_date = new Date(ms);
    console.log("Timer counts from ");
    console.log(the_date);
    console.log("Timer object prepended.");
    $(timer).countdown({since: the_date, 
        format: timer_format});

    // put the format
    $(panel).attr('timer_format', timer_format);
    console.log("Stored timer format "+$(panel).attr('timer_format'));

    display_message({
        success: true,
        message: "Timer added. Save diary to keep the change."
    });
    return;
}

function new_year_label(date) {
    var year = date.year();

    var div = $('<div class="timeline-label-year">').append($('<span>').text(year));
    div.append($('<a name="'+year+'"></a>'));
    var label = $('<li>').append(div);
    return label;
}

function new_year_anchor(date){
    var year = date.year();  
    var anchor=$('<li role="presentation">').append($('<a href="#'+year+'">'+year+'</a>'));
    return anchor;
}

var MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function new_month_label(date) {
    var year = date.year();    
    var month = MONTH_NAMES[date.month()];

    var div = $('<div class="timeline-label-month">').append($('<span>').text(month));
    div.append($('<a name="'+year+'_'+month+'"></a>'));
    var label = $('<li>').append(div);
    return label;
}

function new_month_anchor(date){
    var year = date.year();  
    var month = MONTH_NAMES[date.month()];
    var anchor=$('<li role="presentation">').append($('<a href="#'+year+'_'+month+'">'+month+'</a>'));
    return anchor;
}

function text_change(zone) {
    console.log('Text is changed.');
}

function load_diaries() {
    $.ajax({
            url: "/diary",
            contentType: 'application/json',
            data: JSON.stringify({}),
            method: "GET"
        })
        .done(function(result) {
            console.log(result);

            // display the status
            display_message(result);

            // change contents of the webpage
            if (result.success == true) {
                console.log('Successfully loaded data. Proceed.');

                var raw = result.content;
                var diaries = JSON.parse(raw);
                console.log(diaries.length + " diary pieces loaded.");

                // keep global record
                global_index = diaries.length;

                // clean the panel
                $("#diary_zone").empty();

                // scan all diaries for the date range
                var diary_list = [];
                for (var i = 0; i < diaries.length; i++) {

                    var piece = diaries[i];

                    // find id of this diary
                    var id = piece.id;
                    if (!piece.id) {
                        if(!piece._id){
                            console.log('No index for this one. Ignore the following');
                            console.log(piece);
                            continue;
                        }
                        id = piece._id;
                    }

                    // find the user of this diary
                    var uname = piece.uname;
                    if (!uname) {
                        console.log('No username for this one. Ignore.');
                        continue;
                    }

                    // if marked as deleted, ignore
                    var deleted=piece.deleted;
                    console.log("Is the diary deleted: "+deleted);
                    if(deleted){
                        console.log("The diary is deleted. Ignore.");
                        continue;
                    }

                    // check if the username is expected
                    var name_known = $.inArray(uname, magic_names);
                    if (name_known == -1) {
                        console.log('Username ' + uname + " is not recognized. Ignore.");
                        continue;
                    } else {
                        // male on the right
                        if (uname == magic_names[0]) {
                            var inverted = true;
                        } else if (uname == magic_names[1]) {
                            var inverted = false;
                        } else {
                            console.log('Why am I here?');
                            return;
                        }
                    }


                    // date conversion
                    var date_raw = piece.date;
                    console.log('Date: ' + date_raw);
                    var the_date = moment(date_raw);
                    // format MMM, D, YYYY
                    var date_str = the_date.format('MMM D, YYYY');

                    // content conversion
                    var page = piece.content;
                    var content = page.content;
                    console.log('Full text: ');
                    console.log(content);

                    // last modified date
                    var last_modified = piece.last_modified;
                    console.log('Last modified: '+last_modified);

                    // check timer format
                    var timer_format = piece.timer_format;
                    console.log("Timer format: "+timer_format);

                    diary_list.push({
                        mongo_id: id,
                        uname: uname,
                        the_date: the_date,
                        date_str: date_str,
                        content: content,
                        last_modified: last_modified,
                        timer_format: timer_format,
                        inverted: inverted
                    });
                }

                // date processing
                console.log('Before sorting the diaries.');
                console.log(diary_list);
                diary_list.sort(function(a, b) {
                    var res = moment(b.date_str, 'MMM D, YYYY').isBefore(moment(a.date_str, 'MMM D, YYYY')) ? 1 : -1;
                    console.log("Comparison result: " + res);
                    return res;
                });
                console.log('After sorting.');
                console.log(diary_list);

                // a list of anchors to add
                var anchors=[];

                // generate diaries
                var last_date = moment('Jan 1, 2009', 'MMM DD, YYYY');
                for (var j = 0; j < diary_list.length; j++) {
                    var d = diary_list[j];

                    // diff from the last date
                    var the_date = d.the_date;
                    var year_diff = the_date.diff(last_date, 'years', true);
                    console.log('Year diff by ' + year_diff);
                    var month_diff = the_date.diff(last_date, 'months', true);
                    console.log('Month diff by ' + month_diff);

                    if (year_diff >= 1) {
                        console.log('Diff by >1 year date is '+d.date_str);
                        var year_label = new_year_label(the_date);
                        console.log("Created new year label: ");
                        console.log(year_label);
                        $("#diary_zone").append(year_label);

                        // add year anchor
                        var year_anchor= new_year_anchor(the_date);
                        anchors.push({type: "year", anchor: year_anchor});
                    }
                    if (month_diff >= 1) {
                        console.log("Diff by >1 month date is "+d.date_str);
                        var month_label = new_month_label(the_date);
                        console.log("Created month label ");
                        console.log(month_label);
                        $("#diary_zone").append(month_label);

                        // add month anchor
                        var month_anchor= new_month_anchor(the_date);
                        anchors.push({type: "month", anchor: month_anchor});
                    }
                    last_date = the_date;

                    // create new DOM element
                    var new_diary = create_diary_dom(j, d);

                    // append the diary to the area
                    $("#diary_zone").append(new_diary);

                    // activate the textarea
                    var emo = $(new_diary).find('textarea').emojioneArea({
                        events: {
                            change: function (editor, event) {
                              console.log('event:change');
                            },
                        }
                    });
                    console.log("Emo area: ");
                    console.log(emo[0]);
                    if (emo[0]) {
                        var handle = emo.data('emojioneArea');
                        
                        handle.setText(d.content);
                    }else{
                        console.log("Cannot find emojioneArea??")
                    }                    
                }

                // finished all diaries, now generate anchors
                generate_anchors(anchors);

            } else {
                console.log("Failed to load data. Stop.");
                return;
            }

            // activate all datetime pickers
            $("[id^=datetimepicker_]").datetimepicker({
                format: 'MMM D, YYYY'
            });

        });
}

function generate_anchors(anchors){
    console.log("Anchors: ");
    console.log(anchors);

    // nav field
    var nav=$("#nav");

    for(var i=0; i<anchors.length; i++){
        var a=anchors[i];

        nav.append(a.anchor);
    }

    console.log("Appended "+anchors.length+" anchors");
}

// global vars
var global_index = 0;
var magic_names = ['zjy', 'ljc'];
