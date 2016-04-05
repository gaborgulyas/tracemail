function Ip(attributes) {

	//copy attributes
	for (var i in attributes) {
		this[i] = attributes[i];
	}

    this.my_id = 'tamas@besenyei.net';
    this.database = 'iplocator.sqlite';

    //get datas of ipaddr
    //connect to database
    var em = Components.classes["@mozilla.org/extensions/manager;1"].
    getService(Components.interfaces.nsIExtensionManager);

    //get db file
    var dbFile = em.getInstallLocation(this.my_id).getItemFile(this.my_id, this.database);

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

    var statement = dbConnection.createStatement("SELECT * FROM ip LEFT JOIN country country ON country.id = ip.country WHERE ip < :ip ORDER BY ip DESC LIMIT 1");

    //split ip to bytes
    var ipbytes = this.ip.split('.');

    //calculate ip code
    this.ipcode = ((ipbytes[0] * 256 + ipbytes[1] * 1) * 256 + ipbytes[2] * 1) * 256 + ipbytes[3] * 1;
    statement.params.ip = this.ipcode;

    //execute query
    statement.executeStep();


    this.Latitude = statement.row.latitude;
    this.Longitude = statement.row.longitude;
    this.BubbleLink = 'bubblelink';
    this.NodeIP = this.ip;
    this.CountryName = statement.row.countryname;
	this.DataRet = statement.row.dataretention == '1' ? true : false;
	this.DataRetText = statement.row.dataretentiontext;
	this.Warrantless = statement.row.warrantless == '1' ? true : false;
	this.WarrentlessText = statement.row.warrantlesstext;
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