
function LOG(text) {
    var t = "";
    if (typeof text == 'object' && text !== null) {
        for (var a in text) {
            t += a+': ';
            try { t += text[a]; } catch (e) { t += 'err'; }
            t += "\n";
        }
    } else {
        t = text;
    }
    var consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
    consoleService.logStringMessage(t);
}

function Ip(attributes) {

	//copy attributes
	for (var i in attributes) {
		this[i] = attributes[i];
	}

    this.my_id = 'epvp@pet-portal.eu';
    this.database = 'iplocator.sqlite';

    //get datas of ipaddr
    //connect to database
    ////
    //var em = Components.classes["@mozilla.org/extensions/manager;1"].
    //getService(Components.interfaces.nsIExtensionManager);
    ////
    
    //get db file
    ////
    //var dbFile = em.getInstallLocation(this.my_id).getItemFile(this.my_id, this.database);
    var dbFile = initFile(this.my_id, this.database);
    ////

    var dbService = Components.classes["@mozilla.org/storage/service;1"].
    getService(Components.interfaces.mozIStorageService);

    var dbConnection;

    if (!dbFile.exists()) {
        alert('The database file not found!');
        return;
    }
    else {
        dbConnection = dbService.openDatabase(dbFile);
    }

    ////-
    //var statement = dbConnection.createStatement("SELECT * FROM ip LEFT JOIN country country ON country.id = ip.country WHERE ip <= :ip ORDER BY ip DESC LIMIT 1");
    try {
    var statement = dbConnection.createStatement("SELECT * FROM ip JOIN location ON location.id = ip.locationid JOIN country ON country.code = location.countrycode WHERE :ip BETWEEN ipStart AND ipEnd LIMIT 1");
    } catch (e) { LOG(e); }
    ////-
    
    //split ip to bytes
    var ipbytes = this.ip.split('.');

    //calculate ip code
    this.ipcode = ((ipbytes[0] * 256 + ipbytes[1] * 1) * 256 + ipbytes[2] * 1) * 256 + ipbytes[3] * 1;
    statement.params.ip = this.ipcode;

    //execute query
    var res = statement.executeStep();

    this.BubbleLink = 'bubblelink';
    this.NodeIP = this.ip;
    ////-
    if (res && statement.row.countryname) {
        this.CountryName = statement.row.countryname;
        this.City = statement.row.city;
        this.Latitude = statement.row.latitude;
        this.Longitude = statement.row.longitude;
        this.DataRet = statement.row.dataretention == '1' ? true : false;
        this.Warrantless = statement.row.warrantless == '1' ? true : false;
        this.DataRetText = statement.row.dataretentiontext;
        this.WarrantlessText = statement.row.warrantlesstext;
    } else {
        this.CountryName = "Reserved";
        this.City = '';
        this.Latitude = '';
        this.Longitude = '';
        this.DataRet = true;
        this.Warrantless = true;
        this.DataRetText = '';
        this.WarrantlessText = '';
    }
    ////-
	this.Comment = '';

//    this.CityName = statement.row.cityname;
//    this.BubbleText = 'bubbletext';
//    this.NodeName = 'nodename';

//    this.Classification = 'classification';
//    this.ClassificationDescription = 'classdescr';
//    this.ClassificationColor = '#222222';
//    this.ClassificationRank = 0;

    return this;
}