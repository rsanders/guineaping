/* 
 This file was generated by Dashcode.  
 You may edit this file to customize your widget or web page 
 according to the license.txt file included in the project.
 */

//
// Function: load()
// Called by HTML body element's onload event when the widget is ready to start
//

function load()
{
    // dashcode.setupParts();
    // 
    // pingview.hideScrolldown();
    // 
    pingfm = new PingFMAPI();
     
    setupPingFM();
     
    setupUI();
     
    pingdb.initialize();
}

//
// Function: remove()
// Called when the widget has been removed from the Dashboard
//
function remove()
{
    // Stop any timers to prevent CPU usage
    // Remove any preferences as needed
    // widget.setPreferenceForKey(null, dashcode.createInstancePreferenceKey("your-key"));
}

//
// Function: hide()
// Called when the widget has been hidden
//
function hide()
{
    // Stop any timers to prevent CPU usage
    pingview.preExecute();
}

//
// Function: show()
// Called when the widget has been shown
//
function show()
{
    pingview.preExecute();

    // Restart any timers that were stopped on hide
    setTimeout("checkConfig();", 500);
}

function showFront()
{
	// null
}

function showError(msg)
{
	var html = jQuery('#error').html();
	html = msg + '<br/>' + html;
	jQuery('#error').html(html);
}

function checkConfig()
{
    if (! pingprefs.isConfigured())
    {
        firstTimeConfiguration();
    }
}

function openPingFM(event)
{
    widget.openURL("http://ping.fm/");
}

function openAppSite(event)
{
    widget.openURL("http://code.google.com/p/pingboard");
}


function openAppKeyPage(event)
{
    widget.openURL("http://ping.fm/key/");
}

function doPost(event)
{
	console.log("Posting");
    // pingview.preExecute();
    
    var method = pingview.getPostMethod();
    var body = pingview.getPostBody();

	if (body.length <= 0) {
		showError("You must enter a message to post.");
		return;
	}

    exclude = pingview.getExcludes();
    
    // XXX - this is not common
//    if (jQuery('#svciconbox img').length > 0 && jQuery('#svciconbox img').length <= exclude.length) {
//        pingview.showError("At least one service must be enabled to post!");
//        return false;
//    }

    // keep history
    pingdb.addPing(body, method, {title:'', exclude: exclude});

    // body, method, title, success, failure, excludes
    pingfm.postMessage(body, method, null, null, null, exclude);
    pingview.resetPost();
}


function postTextChange()
{
    var count = jQuery('#post_text').val().length;
    jQuery('#character_count').text(String(count));
}

var pingprefs = {
    _makekey: function(key) {
        return key;
    },
    
    setPref: function(key, value, useglobal) {
		console.log("Setting pref " + key + " to " + value);
		if (!value) {
			air.EncryptedLocalStore.removeItem(this._makekey(key));
		}
		else {
			var data = new air.ByteArray();
			data.writeUTFBytes(value);
			air.EncryptedLocalStore.setItem( this._makekey(key), data );
		}
    },
    
    getPref: function(key, defval, useglobal) {
		console.log("getting pref " + key);
		var data = air.EncryptedLocalStore.getItem( this._makekey(key) );
		if (!data) {
			console.log("could not find " + key + " in ELS");
			return defval;
		}
		var value = data.readUTFBytes( data.bytesAvailable );
		console.log("decoded value for " + key + " is " + value);
		return value;
    },
    
    isConfigured: function() {
        return this.getPref("configured") == "true";
    },
    
    setConfigured: function(val) {
        this.setPref("configured", val ? "true" : "false");
    },
}

function savePrefs()
{
    pingprefs.setPref("pingfm_appkey", pingview.getAppKey(), true);
    pingprefs.setPref("debug", pingview.getDebug());
    pingprefs.setPref("name", pingview.getAccountName());
    
    pingprefs.setPref("configured", "true");
}

function populatePrefs()
{
    pingview.setAppKey(pingprefs.getPref("pingfm_appkey", undefined, true));
    pingview.setDebug(pingprefs.getPref("debug"));
    pingview.setAccountName(pingprefs.getPref("name"));
}

function configDone(event)
{
    // reset custom trigger list
    // makePostTypeMenu(null, null);
    
    savePrefs();
    setupPingFM();

    setTimeout(function(){
		setupUI();
	}, 200);

    return showFront(event);
}

function doShowBack(event)
{
    populatePrefs();
    showBack(event);
}

function firstTimeConfiguration()
{
    doShowBack();
}


var pingview = {
  historyNum: -1,
  
  draftping: null,
  
  excludes: new Object(),

  // for use by pingfm
  
  log: function(msg) {
    console.log(msg);
  },
  
  showError: function(msg) {
    jQuery('#back_test_output').val( msg);
    console.log("ERROR: " + msg);
    showError(msg);
  },
  
  showNotice: function(msg) {
    alert(msg);
  },
  
  showResult: function(msg) {
    console.log("RESULT: " + msg);
  },
  
  // for direct app / UI use

  showPrevHistory: function() {
    this.showHistory(Math.min(this.historyNum+1, pingdb.countPings()-1));
  },
  
  showNextHistory: function() {
    this.showHistory(Math.max(-1, this.historyNum-1));
  },
  
  showHistory: function(num, suppressDraft) {
    var ping;
    var showNum;
    if (num == this.historyNum)
        return;
    
    var me = this;
    
    // save draft
    if (this.historyNum == -1 && ! suppressDraft) {
        this.saveDraftPing();
    }
    
    if (num > pingdb.countPings())
    {
        num = -1;
    }
    
    if (num == -1) {
        if (this.draftping)
            ping = this.draftping;
        else
            ping = {message:'', excludes:[]};
        showNum = '';
    }
    else {
        ping = pingdb.getPing(num);
        showNum = String(num+1);
    }
    
    this.historyNum = num;


    if (ping) {
        this.setPostBody(ping.message);
        if (ping.destination) {
            this.setPostMethod(ping.destination);
        }
        if (ping.exclude) {
            this.setExcludes(ping.exclude);
        }
        jQuery('#historyNum').text(showNum);
    }
  },

  getPostMethod: function() {
	return dijit.byId("post_type").getValue();
  },
  
  setPostMethod: function(val) {
	dijit.byId('post_type').setValue(val);
  },
  
  getPostBody: function() {
    var body = dijit.byId("post_text").getValue();
	console.log("body is " + body);
	return body;
  },
  
  setPostBody: function(val) {
	dijit.byId("post_text").setValue(val);
  },
  
  saveDraftPing: function() {
    var ping = {
        message: this.getPostBody(),
        destination: this.getPostMethod(),
        when: new Date(),
        exclude: this.getExcludes()
    };
    
    this.draftping = ping;
  },
  
  getDebug: function() {
    return jQuery('#option_debug').get(0).checked;
  },
  
  setDebug: function(val) {
    jQuery('#option_debug').get(0).checked = val;
    jQuery('#option_debug').change();
  },

  getAppKey: function() {
    return jQuery('#app_key').val();
  },
  
  setAppKey: function(val) {
    jQuery('#app_key').val(val);
  },

  // for the config
  getAccountName: function() {
    return jQuery('#account_name').val();
  },
  
  setAccountName: function(val) {
    jQuery('#account_name').val(val);
  },
  
  setNameDisplay: function(val) {
    jQuery('#name_display').text(val);
  },
  
  resetPost: function(val) {
      this.setPostBody('');

      // don't save draft
      this.showHistory(-1, true);
      // this.selectPreferredPostType();
  },
  
  setVersion: function(version) {
    if (! version) version = this.version;
    
    jQuery('#version').text(String(version));
  },

  selectPreferredPostType: function() {
    if (pingprefs.getPref("post_type"))
    {
        pingview.setPostMethod(pingprefs.getPref("post_type"));
    }

    var type = pingview.getPostMethod();
    this.showPostTypeIcons(type);
  },
  
  exposeScrolldown: function() {
    var item = document.getElementById("scrolldown");

    item.style.display = "block";
  },
  
  hideScrolldown: function() {
    var item = document.getElementById("scrolldown");

    item.style.display = "none";
  },

  isScrolldownExposed: function() {
    var item = document.getElementById("scrolldown");

    return item.style.display != "none";
  },
  
  renderDate: function(date) {
    return prettyDate(date);
  },
  
  _makeQuotable: function(str) {
    return str.replace(/([\"\'])/g, '\\$1');

    //   ' unconfuse dashcode
  },
  
  openServicePage: function(event) {
    var id = event.target.alt;
    var svcmeta = pingfm.getSupportedService(id);
    if (svcmeta && svcmeta.service_url) {
        widget.openURL(svcmeta.service_url);
    }   
  },
  
  renderServiceIcon: function(service, attributes) {
    // fake it 'till you make it
    if (typeof service != 'object') {
        service = { id: service, name: service, methods: ['microblog'] };
    }
    
    if (! attributes)       attributes = {};
    if (! attributes.title) attributes.title = service.name;
    if (! attributes.alt)   attributes.alt = service.id;
    
    system_service = pingfm.getSupportedService(service.id);
    if (system_service) {
        console.log("using system service info for " + service.id);
        attributes.src = system_service.icon_url;
    } else {
        attributes.src = "svcicons/" + service.id + ".png";
    }

    attributes.serviceid = service.id;
    if (! attributes.onclick && false)
        attributes.onclick = "pingview.openServicePage(event);";

    var html = '<img class="svcicon" ';
    for (name in attributes)
    {
        var val = attributes[name];
        if (typeof val == 'function') continue;
        
        html += ' ' + name + '= "' + this._makeQuotable(val) + '" ';
    }
    html += ' />';
    
    return html;
  },
  
  truncateText: function(text, max, ellipsis) {
    if (typeof ellipsis != 'string') ellipsis = '…';
    
    if (text.length > max) {
        text = text.substring(0, max-1).replace(/\s+\w+$/, '') + ellipsis;
    }
    
    return text;
  },

  showPostTypeIcons: function(type) {
  	console.log("showPostTypeIcons");
    var services;
    if (!type) type = pingview.getPostMethod();
    
    if (type == 'default') {
        services = [];
    } else {
        services = pingfm.getServicesFor(type);
    }
    
    pingview.setServiceIcons('#svciconbox', services);
    jQuery('#svciconbox img').unbind('click').
                each(function(item) { this.title = this.title + " - click to toggle"; }).
                bind('click', function(event) { pingview.toggleExclude(event); });
    var idx;
    for (idx = 0; idx < this.getExcludes().length; idx++) {
        
    }
  },

  getExcludes: function() {
    var id;
    var res = [];
    for (id in this.excludes) {
        var val = this.excludes[id];
        if (typeof val == 'function') continue;
        if (val == true) res.push(id);
    }
    return res;
  },
  
  setExcludes: function(excludes) {
    jQuery('#svciconbox img').css('opacity', 1.0);
    this.excludes = {};
    var idx;
    for (idx = 0; idx < excludes.length; idx++) {
        this.setExcluded(excludes[idx],  true);
    }
  },
  
  isExcluded: function(id) {
    return this.excludes[id];
  },
  
  setExcluded: function(id, value) {
    this.excludes[id] = value;

    if (!value) {
        opacity = 1.0;
    } else {
        opacity = 0.2;
    }
    jQuery('#svciconbox [alt='+id+']').css('opacity', opacity);
  },

  toggleExclude: function(event, val) {
    var id = event.target.alt;

    // XXX - this doesn't work if invoked directly as an event handler
    //   so wrap inside a lambda
    this.setExcluded(id, ! this.isExcluded(id));
  },

  setServiceIcons: function(destination, services) {
  	console.log("setServiceIcons");
    if (! services) services = [];
    var html = this.renderServices(services);
    
    jQuery(destination).html(html);
  },
  
  renderServices: function(svclist) {
  	console.log("renderServices");
    var text = '';
    var svc;
    for (idx in svclist) {
        svc = svclist[idx];
        if (typeof svc == 'function') continue;
        
        text += this.renderServiceIcon(svc);
    }
    
    return text;
  },
  
   /* id, method, date, services, body */
  renderMessage: function(item) {
    var itemhtml = '<div class="message">';
    itemhtml += '<div class="message_body">' + this.truncateText(item.body, 160) + '</div>';
    itemhtml += '<div class="message_metadata">';
    itemhtml += '<span class="message_timestamp">' + this.renderDate(item.date) + '</span>';
    itemhtml += '<span class="message_services">' + this.renderServices(item.services) + '</span>';
    // itemhtml += '<span class="message_method">[' + item.method[0] + ']</span>';
    itemhtml += '</div>';
    itemhtml += '</div>';

    return itemhtml;
  },
  
  renderMessagelist: function(list) {
    var container = document.getElementById("msglist");
    
    var count = list.length;
    
    var html = '';
    

    var item, idx;
    var sep = "";
    for (idx in list) {
        item = list[idx];
        if (typeof item == 'function') continue;
        
        html += sep + this.renderMessage(item);
        sep = "<hr/>";
    }
    
    container.innerHTML = html;
    
    jQuery('#msglist').change();
    // jQuery('#scrollArea').get(0).object.refresh();
  },
  
  // reset for execution of the next comment
  preExecute: function() {
    this.hideScrolldown();
  },
  
  version: '0.5',
};

/**
 *
 *
 * See http://webkit.org/misc/DatabaseExample.html
 */ 
var pingdb = {
    db: null,
    
    initialized: false,
    
    available: true,
    
    initialize: function() {
        if (this.initialized)
            return true;

        this.db = [];

        this.initialized = true;
        return true;
    },
    
    clear: function() {
        this.db = [];
    },
    
    addPing: function(message, destination, other) {
        if (! destination) { destination = 'default' };
        if (! other) other = {};
        
        var item = {message: message, destination: destination, when: new Date()};
        var key;
        for (key in other) {
            var val = other[key];
            if (typeof val == 'function' || item.hasOwnProperty(key)) continue;
            item[key] = val;
        }
        this.db.unshift( item );
    },
    
    listPings: function(count) {
        if (! count) count = 10;
        return this.db;
    },
    
    getPing: function(num) {
        if (this.db.length <= num)
            return null;
        else
            return this.db[num];
    },
    
    countPings: function() {
        return this.db.length;
    },
    
    version: '0.5'
}

function makePostTypeMenu(services, triggers)
{
    var options = [
            ['Default', 'default', true],
            ['Status', 'status'],
            ['Micro-blog', 'microblog'],
            ['Blog', 'blog']
        ];
    
    if (triggers) {
        options.push(['----', '----']);
        for (name in triggers)
        {
            var trigger = triggers[name];
            if (typeof(trigger) == 'function') continue;
            
            options.push(['#' + trigger.id + " - [" + trigger.method[0] + "]", "#" + trigger.id]);
        }
    }
    
    if (services)
    {
        options.push(['----', '----']);
        for (name in services)
        {
            var service = services[name];
            if (typeof(service) == 'function') continue;
            if (! service.methods || service.methods.length < 1) continue;
            
            options.push(['@' + service.name + ' - [' + service.methods[0][0] + ']', "@" + service.id]);
        }
    }

	console.log("got array, translating");

	var idx;
	var storeItems=[];
	for (idx in options) {
		var item = options[idx];
		storeItems.push({name: item[1], label: item[0]});
	}

	dijit.byId("post_type").store = new dojo.data.ItemFileReadStore({
			data: {identifier: "name", items: storeItems}
		});
    
    setTimeout(function(){
		pingview.selectPreferredPostType();
	}, 300);
}

function setupUI()
{
	console.log("setupUI");
    // get custom triggers if the user is configured
    if (pingprefs.isConfigured() || true) {
        pingfm.getServices(handleServices, function() { handleServices(null); });
    }
    
    // pingview.setVersion( dashcode.getLocalizedString("Version") + " " + pingview.version );
    
//    var name = pingprefs.getPref("name");
//    if (!name)  name = "";
//    else name = dashcode.getLocalizedString("Account: ") + name;

    pingview.setNameDisplay( name );
    
    // pingview.selectPreferredPostType();
}

function showPrevHistory()
{
    pingview.showPrevHistory();
}

function showNextHistory()
{
    pingview.showNextHistory();
}

function showLatestPosts(event)
{
    pingfm.getLatest(25, null, function(parsed, xml) {
        console.log("got latest!");
        pingview.renderMessagelist(parsed);
      }
    );
}

function hideScrolldown(event)
{
    pingview.hideScrolldown();
}

function openHelp(event)
{
    widget.openURL("http://code.google.com/p/pingboard/wiki/Help");
}
