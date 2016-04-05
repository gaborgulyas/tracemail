var adverttext = "<br>Email Privacy Visualization Project: discover who might have an extra copy of your email!<br>Download this small tool from the webpage of Privacy International: <a href='http://www.tracemail.eu/'>http://www.tracemail.eu/</a>";


var etv_options = {
	load_options : function()
	{
		
		var Prefs = Components.classes["@mozilla.org/preferences-service;1"]  
		                    .getService(Components.interfaces.nsIPrefService);  
		Prefs = Prefs.getBranch("extensions.emailtraceroutevisualizer.");
		if(!Prefs.prefHasUserValue("advertmails"))
		{
			Prefs.setCharPref("advertmails","");
		}

		var advertmails=Prefs.getCharPref("advertmails");
		var activemails=new Array();
		
		//getting active email adresses
		var acctMgr = Components.classes["@mozilla.org/messenger/account-manager;1"].getService(Components.interfaces.nsIMsgAccountManager);
		var accounts = acctMgr.accounts;
		for (var i = 0; i < accounts.Count(); i++) {
			var identities = accounts.QueryElementAt(i, Components.interfaces.nsIMsgAccount).identities;
			for(var j=0;j<identities.Count();j++)
			{
				var identity=identities.QueryElementAt(j, Components.interfaces.nsIMsgIdentity);
				activemails.push(identity.email);
			}
		}
		
		var tbonly=document.getElementById("tbonly");
		tbonly.parentNode.removeChild(tbonly);
		
		
		//building checklist
		for(var i=0;i<activemails.length;i++)
		{
			var newchb=document.createElement("checkbox");
			//<checkbox id="case-sensitive" checked="true" label="Case sensitive"/>
			newchb.setAttribute("id",activemails[i]);
			newchb.setAttribute("label",activemails[i]);
			if(advertmails.search(activemails[i])!=-1)
			{
				newchb.setAttribute("checked",true);
			}
			else
			{
				newchb.setAttribute("checked",false);
			}
			
			document.getElementById("etv-emails").appendChild(newchb);
		}
		
	},
	
	submit_options : function()
	{
		var cbs=document.getElementById("etv-emails").childNodes;
		var toperf="";
		
		var prefs = new Array;
		
		for(var i=1; i<cbs.length; i++)
		{
			if(cbs[i].getAttribute("checked")=="true")
			{
				toperf+=(cbs[i].getAttribute("id")+';');
				prefs[cbs[i].getAttribute("id")] = 1;
			}
			else
			{
				prefs[cbs[i].getAttribute("id")] = 0;
			}
			
		}
		
		//this is ugly
		var ids = new Array;
		
		for (var i=1; i< cbs.length*10; i++)
		{
			var Prefs = Components.classes["@mozilla.org/preferences-service;1"]  
			                    .getService(Components.interfaces.nsIPrefService);  
			var UserMail = Prefs.getBranch("mail.identity.");
			var usermail;
		
			if ( UserMail.prefHasUserValue("id"+i+".useremail") )
			{
				ids.push(i);
			}
		}
		
		
		for (var i=0; i<ids.length; i++)
		{	
			var Prefs = Components.classes["@mozilla.org/preferences-service;1"]  
			                    .getService(Components.interfaces.nsIPrefService);  
			var UserMail = Prefs.getBranch("mail.identity.");
			var usermail;
			
			usermail = UserMail.getCharPref("id"+ids[i]+".useremail");
	
			var Signature = Prefs.getBranch('mail.identity.');
			var signature = '';
		
			if ( Signature.prefHasUserValue("id"+ids[i]+".htmlSigText") ) 
				signature = Signature.getCharPref("id"+ids[i]+".htmlSigText");
		
			signature = signature.replace(adverttext,'');
	
			if (prefs[usermail])
			{	
				Signature.setCharPref("id"+ids[i]+".htmlSigText",signature+adverttext);
			
				var HtmlFormat = Signature.setBoolPref('id'+ids[i]+'.htmlSigFormat',true);
			}
			else {
				Signature.setCharPref("id"+ids[i]+".htmlSigText",signature);
			}

		}
		
		
		var Prefs = Components.classes["@mozilla.org/preferences-service;1"]  
		                    .getService(Components.interfaces.nsIPrefService);  
		Prefs = Prefs.getBranch("extensions.emailtraceroutevisualizer.");
		Prefs.setCharPref("advertmails",toperf);
		
		return true;
	}
};