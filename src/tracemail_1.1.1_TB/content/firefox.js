function Firefox_connector() {
    var _fc_self = this;

    this.ik = '';
    this.rid = '';
    this.mailids;
	this.plwtab;

    this.observe = function(subject, topic, data) {
        var httpChannel = subject.QueryInterface(Components.interfaces.nsIHttpChannel);
        var url = httpChannel.URI.spec;

        var urlRegexp = /^http[s]?\:\/\/mail\.google\.com\/mail\/(.*)$/;

        if (!urlRegexp.exec(url)) return;

        var pieces = url.split('?');

        if (pieces[1]) {
            var values = pieces[1].split('&');
            var hash = {};
            for (var i = 0; i < values.length; i++) {
                var temp = values[i].split('=');

                hash[temp[0]] = temp[1];
            }

            if (hash['ik']) this.ik = hash['ik'];
            if (hash['rid']) this.rid = hash['rid'];

        }
    }

    this.register = function() {
        Components.classes["@mozilla.org/observer-service;1"].
        getService(Components.interfaces.nsIObserverService).
        addObserver(this, 'http-on-examine-response', false);
    }

    this.init = function() {
        this.epvp = new EPVP( _fc_self );

        gBrowser.addEventListener("hashchange", epvp_fc.onHashChange, true);
    }

    this.onHashChange = function(aEvent) {
        var doc = aEvent.originalTarget;

        var urlRegexp = /^http[s]?\:\/\/mail\.google\.com\/mail\/(.*)$/;
        var matches;
        if (matches = urlRegexp.exec(doc.location)) {

            var maillink = /^.*\/([abcdef0-9]*)$/;

            var mat = maillink.exec(matches[1]);

            if (mat) mat = mat[1];
            else return;

            //			Ez szedi le a leveleket
            var client = new XMLHttpRequest();

            var requrl = 'https://mail.google.com/mail/?ui=2&ik=' + _fc_self.ik + '&view=cv&th=' + mat + '&prf=1&nsc=1&mb=0&rt=j&search=inbox';
            client.open('GET', requrl, false);

            client.send(null);

			try {
	            var idsregexp = /.*\["cs",.*?(\[.*?\])/;
	            var ids = idsregexp.exec(client.responseText);
	            this.mailids = JSON.parse(ids[1]);


				_fc_self.waitforBk(doc, this.mailids);
			}
			catch (e) {}
        }

    },

	this.waitforBk = function(doc, mailids) {
		//ez teszi ki a gombokat
        var gmailDocument = doc.document.getElementById('canvas_frame').contentWindow.document;

        var idSpans = gmailDocument.getElementsByClassName('Bk');

		if (idSpans.length != mailids.length) {
			setTimeout(function() {
				_fc_self.waitforBk(doc,mailids)
			}, 500);
			return;
		}

		for (var i = 0; i < idSpans.length; i++) {
			idSpans[i].id = mailids[i];
			_fc_self.buttonInsert(idSpans[i]);
		}
	},

    this.buttonInsert = function(e) {

        var thismail;

        if (e instanceof MouseEvent) {
            thismail = this;
            thismail.removeEventListener('mousedown', _fc_self.buttonInsert, false);
        }
        else {
            thismail = e;
        }

        var buttonlocation = thismail.getElementsByClassName('HprMsc');

        if (!buttonlocation[0]) {
            setTimeout(function() {
                _fc_self.buttonInsert(thismail);
            },
            500);
            return;
        }

        buttonlocation = buttonlocation[0].getElementsByClassName('gK');

        for (var i = 0; i < buttonlocation.length; i++) {
            if (buttonlocation[i] instanceof HTMLDivElement) {
                buttonlocation = buttonlocation[i];
                break;
            }
        }

        /*buttonlocation.innerHTML = '<span class="EmailTracerouteVisualizerButtonClass iD" idlink="" onclick="event.stopPropagation()"></span> ' + buttonlocation.innerHTML;

        var buttonspan = buttonlocation.getElementsByClassName('EmailTracerouteVisualizerButtonClass')[0];
        var visualizebutton = buttonspan.ownerDocument.createElement('input');
        visualizebutton.type = "button";
        visualizebutton.value = 'Path Visualize';
        visualizebutton.addEventListener('mouseup', function() {
            _fc_self.visualize(thismail.id);
        },
        false);*/
		
		 buttonlocation.innerHTML = '<span class="EmailTracerouteVisualizerButtonClass iD" idlink="" onclick="event.stopPropagation()"></span> ' + buttonlocation.innerHTML;
        var buttonspan = buttonlocation.getElementsByClassName('EmailTracerouteVisualizerButtonClass')[0];
		var visualizebutton = buttonspan.ownerDocument.createElement('a');
        visualizebutton.innerHTML = 'Path Visualize';
        visualizebutton.addEventListener('mouseup', function() {
            _fc_self.visualize(thismail.id);
        },
        false);

        buttonspan.appendChild(visualizebutton);
    },

    this.visualize = function(id) {
        var requrl = 'https://mail.google.com/mail/?ui=2&ik=' + _fc_self.ik + '&view=om&th=' + id;

        var client = new XMLHttpRequest();
        client.open('GET', requrl, false);
        client.send(null);

		//set smtp
		this.epvp.smtp = 'mail.google.com';

        this.epvp.visualize(client.responseText, id);
    },

	this.openTab = function( url, isplw ) {
		
		var mainWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"]
			.getService(Components.interfaces.nsIWindowMediator)
			.getMostRecentWindow("navigator:browser");
		
		
		if (isplw)
		{
			_fc_self.plwtab = mainWindow.gBrowser.addTab(url);
			mainWindow.gBrowser.selectedTab = _fc_self.plwtab;
		}
		else {
			try {
				mainWindow.gBrowser.selectedTab = _fc_self.plwtab;
				mainWindow.gBrowser.removeCurrentTab();
			}
			catch (e) {}
			finally {
				var tab = mainWindow.gBrowser.addTab(url);
				mainWindow.gBrowser.selectedTab = tab;
			}
		}
	}

}

var epvp_fc = new Firefox_connector();

window.addEventListener("load", function() {
    epvp_fc.init();
    epvp_fc.register();
},
false);