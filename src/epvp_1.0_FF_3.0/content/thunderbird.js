function Thunderbird_connector () {
	var _tb_self = this;
	this.etv = new ETV( _tb_self );
	this.plwtab;
	
	this.visualize = function () {
		
		//read selected mail header
        var content = "";
        var MessageURI = gFolderDisplay.selectedMessageUris;
        var MsgService = messenger.messageServiceFromURI(MessageURI);
        var MsgStream = Components.classes["@mozilla.org/network/sync-stream-listener;1"].createInstance();
        var consumer = MsgStream.QueryInterface(Components.interfaces.nsIInputStream);
        var ScriptInput = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance();
        var ScriptInputStream = ScriptInput.QueryInterface(Components.interfaces.nsIScriptableInputStream);
        ScriptInputStream.init(consumer);

        try {
            MsgService.streamMessage(MessageURI, MsgStream, msgWindow, null, false, null);
        } catch(ex) {
            alert("error: " + ex)
        }

        ScriptInputStream.available();
        while (ScriptInputStream.available()) {
            content = content + ScriptInputStream.read(512);
        }
		
		var temp = ''+MessageURI;
		temp = temp.replace(/#/,'');
		var pieces = temp.split('/');
		
		//set smtp
		var prefs = Components.classes["@mozilla.org/preferences-service;1"]
		                      .getService(Components.interfaces.nsIPrefService);
		var branch = prefs.getBranch("mail.smtpserver.smtp1.");
		var smtp = branch.getCharPref("hostname");
		this.etv.smtp = smtp;
		
		this.etv.visualize( content, pieces[ pieces.length -1 ] );
	};
	
	this.openTab = function( url, isplw ) {
		var mainWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"]
		                   .getService(Components.interfaces.nsIWindowMediator)
						.getMostRecentWindow('mail:3pane');

		var tabmail;
		if (mainWindow) {
		     tabmail = mainWindow.document.getElementById("tabmail");  
		     mainWindow.focus();  
		}

		if (tabmail)  {
		   if (isplw) _tb_self.plwtab = tabmail.openTab("contentTab", {contentPage: url });
			else {
				try {
					tabmail.closeTab(_tb_self.plwtab);
				}
				catch(e) {}
				finally {
					tabmail.openTab("contentTab", {contentPage: url });
				}
			}
		}
		else  {
		   if (isplw) _tb_self.plwtab = window.openDialog("chrome://messenger/content/", "_blank",  
		                     "chrome,dialog=no,all", null,  
		                     { tabType: "contentTab",  
		                       tabParams: {contentPage: url} });
			else {
				try {
					tabmail.closeTab(_tb_self.plwtab);
				}
				catch(e) {}
				finally {
					window.openDialog("chrome://messenger/content/", "_blank",  
					                     "chrome,dialog=no,all", null,  
					                     { tabType: "contentTab",  
					                       tabParams: {contentPage: url} });
				}
			}
		}
	};
	
	
	this.observe = function( subject, topic, data ) {
		
		for( var i = 0; i < _tb_self.ips.length; i++)
		{
 			subject.gMsgCompose.compFields.otherRandomHeaders += "X-ETV-Route-Point: ["+ _tb_self.ips[i] +"]\r\n";
		}
		
		//ide body modositas, de nincs benne semmi, de miert???!???!?!?!?!?!??!?!
//		subject.gMsgCompose.compFields.from
//		subject.gMsgCompose.compFields.body
		
	};
	
	
	this.processObserver = new ProcessObserver_1( _tb_self );
	
	//ide kell valami smtp
	_tb_self.etv.tracerouter.detect( this.etv.smtp,  _tb_self);
	
	return this;
}

var etv_tc = new Thunderbird_connector();

var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
observerService.addObserver(etv_tc, "mail:composeOnSend", false);

function ProcessObserver_1( _tb_self )
{
	this.observe = function(subject, topic, data) {
	
		//route object
		var route = new Array();
		
		var tracerouteRegexp = /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/;
	
		    var MY_ID = 'tamas@besenyei.net';
			var output = Components.classes["@mozilla.org/extensions/manager;1"].getService(Components.interfaces.nsIExtensionManager).getInstallLocation(MY_ID).getItemFile(MY_ID, "traceroute");

			// open an input stream from file
	        var istream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
	        istream.init(output, 0x01, 0444, 0);
	        istream.QueryInterface(Components.interfaces.nsILineInputStream);

	        // read lines into array  
			var line = {},
	        lines = [],
	        hasmore;
	        do {
	            hasmore = istream.readLine(line);
	            lines.push(line.value);
	        } while (hasmore);

	        istream.close();

			var ips = new Array();

			for (var i = 1; i < lines.length; i++)
			{
				var traceip = tracerouteRegexp.exec( lines[i] );
				if ( traceip ) {
					ips.push( traceip[1] );
				}
			}
			
			_tb_self.ips = ips;
	  }
	
	return this;
}
