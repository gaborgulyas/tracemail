function LOG(text) {

    var consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
    consoleService.logStringMessage(text);
}

function dump(arr,level) {
	var dumped_text = "";
	if(!level) level = 0;
	
	//The padding given at the beginning of the line.
	var level_padding = "";
	for(var j=0;j<level+1;j++) level_padding += "    ";
	
	if(typeof(arr) == 'object') { //Array/Hashes/Objects 
		for(var item in arr) {
			var value = arr[item];
			
			if(typeof(value) == 'object') { //If it is an array,
				dumped_text += level_padding + "'" + item + "' ...\n";
				dumped_text += dump(value,level+1);
			} else {
				dumped_text += level_padding + "'" + item + "' => \"" + value + "\"\n";
			}
		}
	} else { //Stings/Chars/Numbers etc.
		dumped_text = "===>"+arr+"<===("+typeof(arr)+")";
	}
	return dumped_text;
}

function ETV( client ) {
	
	var _etv = this;
	
	this.client = client;
	
    this.init = function() {

        this.tracerouter = new Tracerouter( this );
		this.processObserver = new ProcessObserver_2( this );
		
		var Prefs = Components.classes["@mozilla.org/preferences-service;1"]  
		                    .getService(Components.interfaces.nsIPrefService);  
		Prefs = Prefs.getBranch("extensions.emailtraceroutevisualizer.");
		
		try {
			var firstrun = Prefs.getBoolPref("firstrun");
			if (firstrun)
			{
				window.setTimeout(function(){ 
					_etv.client.openTab("http://www.privacyinternational.org/");
				}, 1500);
			}
		} catch(e) {
			window.setTimeout(function(){  
				_etv.client.openTab("http://www.privacyinternational.org/");
			}, 1500);
		} finally {
			Prefs.setBoolPref("firstrun",false);
		}
    };

    this.visualize = function( content, id ) {
        if (!this.tracerouter) {
            this.init();
        }

		var em = Components.classes["@mozilla.org/extensions/manager;1"].  
	             getService(Components.interfaces.nsIExtensionManager);
		var MY_ID = "tamas@besenyei.net";  
		var cache = em.getInstallLocation(MY_ID).getItemFile(MY_ID, "content/visualize/"+"visualizer_"+id+".html");
		if ( cache.exists() ) {
			var response = confirm('The route visualization of this message was generated earlier. Would you like to display the result?');
			
			if ( response )
			{
				_etv.client.openTab('chrome://etv/content/visualize/visualizer_'+id+'.html',1);
				return;
			}
		}

		this.messageid = id;

		//split content to header and other content
		var pieces = content.split("\n\n");
		var header = pieces[0];
		
		//split header to lines
		var headerlines = header.split("\n")
		
		//regexp that match received ips
		var ipregexp = /Received:.*[\[ ](\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})[\] ].*/;
		
		//regexp that match X-originating-ip
		var xorigregexp = /X-Originating-IP:.*\[(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\].*/;
		
		//regexp that match X-ETV-Route-Point
		var xroutepointregexp = /X-ETV-Route-Point:.*\[(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\].*/;
		
		//regexp that match address of sender
		var senderregexp = /From:.*?[\< ]([a-zA-Z\.\_\-0-9]*\@[a-zA-Z\.\_\-0-9]*\.[a-z]{1,4})\>?.*/;
		
		//regexp that match date of email
		var dateregexp = /Date:.*, (.*?) \+.*/;

		var ips = new Array();

		//match x-route-point
		for (var i in headerlines)
		{
			var matches = xroutepointregexp.exec(headerlines[i]);
			if (! matches) continue;
			ips.push(new Ip({
				"ip": matches[1],
				"remark": "Routepoint"
				}));
		}
		
		//match x-originating
		if (ips.length == 0) {
			for (var i in headerlines)
			{
				var matches = xorigregexp.exec(headerlines[i]);
				if (! matches) continue;
				ips.push(new Ip({
					"ip": matches[1],
					"remark": "Sender"
					}));
				break;
			}
		}
		
		//match ips
		for (var i in headerlines)
		{
			var matches = ipregexp.exec(headerlines[i]);
			if (! matches) continue;
			ips.push(new Ip({
				"ip":matches[1]
			}));
		}
		
		//match sender
		for (var i in headerlines)
		{
			var matches = senderregexp.exec(headerlines[i]);
			if (! matches) continue;
			_etv.sender = matches[1];
			break;
		}
		
		//match date
		for (var i in headerlines)
		{
			var matches = dateregexp.exec(headerlines[i]);
			if (! matches) continue;
			_etv.date = matches[1];
			break;
		}
		
		this.routeips = ips;

		if(mutex==true)
		{
			alert("Be patient! Other traceroute is running!");
			return;
		}
		mutex=true;
		
		//traceroute
		this.tracerouter.detect( _etv.smtp , _etv );
		
//		alert('Please wait!');
		_etv.client.openTab('chrome://etv/content/visualize/plw.html',1);
    };

	this.save = function() {
		var nsIFilePicker = Components.interfaces.nsIFilePicker;
		var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
		fp.init(window, "Select a file to the result of visualizer", nsIFilePicker.modeSave);
		
		fp.appendFilters(nsIFilePicker.filterHTML);
		
		var res = fp.show();
		if (res == nsIFilePicker.returnOK){
		  var thefile = fp.file;
		alert(thefile);
		}
	}

	this.init();

    return this;
}

//PT: Ezt a fuggvenyt PT irta
function createVisualizerHTML(routeobject, id, offeredname)
{
	// the extension's id from install.rdf  
//	var newname ="visulizer"+Math.random()*10000000000000000+".html";
	var newname ="visualizer_"+id+".html";
    var MY_ID = "tamas@besenyei.net";  
	
	//referenacia szerzese az eredeti allomanyra
    var em = Components.classes["@mozilla.org/extensions/manager;1"].  
             getService(Components.interfaces.nsIExtensionManager);  
    // the path may use forward slash ("/") as the delimiter  
    // returns nsIFile for the extension's install.rdf  
    var originalfile = em.getInstallLocation(MY_ID).getItemFile(MY_ID, "content/visualize/visualizer.html");  
	
	
	//az eredeti fajl tartalmanak felolvasasa
	var is = Components.classes["@mozilla.org/network/file-input-stream;1"]
		.createInstance( Components.interfaces.nsIFileInputStream );
	is.init( originalfile,0x01, 00004, null);
	var sis = Components.classes["@mozilla.org/scriptableinputstream;1"]
		.createInstance( Components.interfaces.nsIScriptableInputStream );
	sis.init( is );
	var originalcontent = sis.read( sis.available() );

	//az eredeti fajl masolasa es igy az uj letrehozasa
	try {
		originalfile.copyTo(null,newname);
	}
	catch (e){
		var temp = em.getInstallLocation(MY_ID).getItemFile(MY_ID, "content/visualize/"+newname);
		temp.remove(false);
		
		originalfile.copyTo(null,newname);
	}
	var newfile = em.getInstallLocation(MY_ID).getItemFile(MY_ID, "content/visualize/"+newname);  
	//alert(newfile.exists());
	
	//a tartalom modositasa
//	var newcontent=originalcontent;
//	newcontent.replace('//initdatas',"init("+JSON.stringify(routeobject)+");")
//	var newcontent=originalcontent+"init(eval("+routeobject.toSource()+"));</script></body></html>";
	var newcontent=originalcontent+"RouteItems = "+routeobject.toSource()+";init();</script></body></html>";
	
	offeredname = offeredname.replace('@','_at_');
	offeredname = offeredname.replace(/\./g,'_dot_');
	offeredname = offeredname.replace(/[ \:]/g,'_');
	newcontent = newcontent.replace('#filename#',offeredname+'.html');
	
	//a modositott tartalom kiirasa
	var outputStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
		.createInstance( Components.interfaces.nsIFileOutputStream );
	outputStream.init( newfile, 0x04 | 0x08 | 0x20, 420, 0 );
	var result = outputStream.write( newcontent, newcontent.length );
	outputStream.close();
	
	mutex=false;
	
	return 'chrome://etv/content/visualize/'+newname;
//	return 'file://'+newfile.path;
}

function ProcessObserver_2( etv )
{
	this.observe = function(subject, topic, data) {
		//route object
		var route = new Array();
		
		var tracerouteRegexp = /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/;
	
		if (subject !=undefined)
		{
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


			//parsing ips
			var ips = etv.routeips;

			for (var i = 1; i < lines.length; i++)
			{
				var traceip = tracerouteRegexp.exec( lines[i] );
				if ( traceip ) {
					ips.push( new Ip({ 
						"ip": traceip[1]
					}) );
				}
			}
		}

		//htmlurl
		var htmlurl=createVisualizerHTML(ips, etv.messageid, etv.date+'_'+etv.sender);

		etv.client.openTab(htmlurl);
		
	  }
	
	return this;
}
