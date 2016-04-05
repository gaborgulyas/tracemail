var mutex=false;
function Tracerouter( etv ) {

    //check OS
    var os = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULRuntime).OS;

    switch (os) {
    case 'Darwin':
        return new Traceroute_Darwin( etv );
        break;
    case 'Linux':
        return new Traceroute_Linux( etv );
        break;
	case 'WINNT':
		return new Traceroute_Windows( etv );
		break;
    default:
        alert("Unknown operation system!");
        return;
    }
}

function Traceroute_Darwin( etv ) {
    this.detect = function(ip, parent, maxhop) {
	
		if (ip == undefined) {
//			var po = new Processobserver(etv,'');
//			po.observe(undefined, undefined, undefined);
			parent.processObserver.observe(undefined, undefined, undefined)
		}
	
        if (!maxhop) maxhop = 10;

        var MY_ID = 'tamas@besenyei.net';

        var em = Components.classes["@mozilla.org/extensions/manager;1"].getService(Components.interfaces.nsIExtensionManager);

        var interpreter = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        interpreter.initWithPath("/bin/sh");

        var traceroute = em.getInstallLocation(MY_ID).getItemFile(MY_ID, "traceroute_darwin.sh");
        var output = em.getInstallLocation(MY_ID).getItemFile(MY_ID, "traceroute");

        var process = Components.classes["@mozilla.org/process/util;1"].createInstance(Components.interfaces.nsIProcess);
        process.init(interpreter);

        var args = [traceroute.path, ip, output.path];
		
		
		process.runAsync(args, args.length, parent.processObserver , false);

    };

    return this;
}

function Traceroute_Linux( etv ) {
    this.detect = function(ip, parent, maxhop) {
	
		if (ip == undefined) {
			var po = new Processobserver(etv,'');
			po.observe(undefined, undefined, undefined);
		}
	
        if (!maxhop) maxhop = 10;

        var MY_ID = 'tamas@besenyei.net';

        var em = Components.classes["@mozilla.org/extensions/manager;1"].getService(Components.interfaces.nsIExtensionManager);

        var interpreter = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        interpreter.initWithPath("/bin/sh");

        var traceroute = em.getInstallLocation(MY_ID).getItemFile(MY_ID, "traceroute_linux.sh");
        var output = em.getInstallLocation(MY_ID).getItemFile(MY_ID, "traceroute");

        var process = Components.classes["@mozilla.org/process/util;1"].createInstance(Components.interfaces.nsIProcess);
        process.init(interpreter);

        var args = [traceroute.path, ip, output.path];
		
		
		process.runAsync(args, args.length, parent.processObserver , false);
    };

    return this;
}

function Traceroute_Windows( etv ) {
    this.detect = function(ip, parent, maxhop) {
	
		if (ip == undefined) {
			//var po = new Processobserver(etv,'');
			//po.observe(undefined, undefined, undefined);
			parent.processObserver.observe(undefined, undefined, undefined)
		}
	
        if (!maxhop) maxhop = 10;

        var MY_ID = 'tamas@besenyei.net';

        var em = Components.classes["@mozilla.org/extensions/manager;1"].getService(Components.interfaces.nsIExtensionManager);

		var traceroute = em.getInstallLocation(MY_ID).getItemFile(MY_ID, "traceroute_windows.vbs");

        var output = em.getInstallLocation(MY_ID).getItemFile(MY_ID, "traceroute");

        var process = Components.classes["@mozilla.org/process/util;1"].createInstance(Components.interfaces.nsIProcess);
        process.init( traceroute );

        var args = [ ip, output.path];
		
		
		
		if(ip!=null)
		{
		process.runAsync(args, args.length, parent.processObserver , false);
		}
    };

    return this;
}


