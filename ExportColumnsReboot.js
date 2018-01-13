function enableExtractButton() {
	document.getElementById("extractButton").style.visibility="visible";
}

function getGroups() {
		
	var context = new SP.ClientContext.get_current();
	var website = context.get_web();
	var allWebFields = website.get_fields();
	
	context.load(allWebFields);
	context.executeQueryAsync(successGetGroups, failGetGroups);		

	function successGetGroups() {
		
		var columnGroups = ["no group selected"];
		var listEnumerator = allWebFields.getEnumerator();
	
		while (listEnumerator.moveNext()) {
			if (!columnGroups.includes(listEnumerator.get_current().get_group())) {				
				columnGroups.push(listEnumerator.get_current().get_group());				
			}
		}
		
		populateChoices();
	
		function populateChoices() {
			
			var selection = document.getElementById("selectGroup");
			
			for (i in columnGroups) {
				selection.options[selection.options.length] = new Option(columnGroups[i], i);
			}	
		}
	}
	
	function failGetGroups(sender, args) {
		console.log(args.get_message());
		alert("failGetGroups");
	}
}

function checkFile() {	
		
	var userOutputFile = document.getElementById("userOutputFile").value;
    
	var listTitle = 'Site Assets';
	var fileUrl  = _spPageContextInfo.webAbsoluteUrl + "/siteassets/" + userOutputFile;

	
	var ctx = SP.ClientContext.get_current();
	var list = ctx.get_web().get_lists().getByTitle(listTitle);
	var qry = new SP.CamlQuery();
	qry.set_viewXml('<View Scope="RecursiveAll"><Query><Where><Eq><FieldRef Name="FileRef"/><Value Type="Url">' + fileUrl + '</Value></Eq></Where></Query></View>');
	var items = list.getItems(qry);
	ctx.load(items);
	ctx.executeQueryAsync(successCheckFile, failCheckFile)
	
	function successCheckFile(args) {
		
		if (items.get_count() > 1) {
			alert("File Name in use, please choose another name.");
		}
		else {
			if (userOutputFile.length > 0) {
			document.getElementById("selectGroupHeader").style.visibility="visible";
			document.getElementById("selectGroup").style.visibility="visible";
			document.getElementById("messageToUser").innerHTML="File name OK";
			
			}
		}		
	}
	
	function failCheckFile(args) {
	
		alert("Something went wrong. Please close your browser and try again.");
		
	}		
}

function writeFile() {
	
	var context = new SP.ClientContext.get_current();
	var website = context.get_web();	
	var rootWeb = context.get_site().get_rootWeb();
	var webFields = rootWeb.get_fields();
	var targetList = website.get_lists().getByTitle("Site Assets");
	var userGroupChoiceIndex = document.getElementById("selectGroup").selectedIndex;
	var userGroupChoiceText = document.getElementById("selectGroup").options[userGroupChoiceIndex].text;
	var userOutputFile = document.getElementById("userOutputFile").value;
	var fileContent = "";
	
	//add schemas to file content
	context.load(webFields);
	context.executeQueryAsync(successWriteFile, failWriteFile);
	
	function successWriteFile() {
		
		var fieldEnumerator = webFields.getEnumerator();
		//var allXmlSchemas =  '<Field ID="{e08400f3-c779-4ed2-a18c-ab7f34caa318}" ColName="tp_AppEditor" RowOrdinal="0" ReadOnly="TRUE" Hidden="FALSE" Type="Lookup" List="AppPrincipals" Name="AppEditor" DisplayName="App Modified By" ShowField="Title" JoinColName="Id" SourceID="http://schemas.microsoft.com/sharepoint/v3" StaticName="AppEditor" FromBaseType="TRUE" /><Field ID="{6bfaba20-36bf-44b5-a1b2-eb6346d49716}" ColName="tp_AppAuthor" RowOrdinal="0" ReadOnly="TRUE" Hidden="FALSE" Type="Lookup" List="AppPrincipals" Name="AppAuthor" DisplayName="App Created By" ShowField="Title" JoinColName="Id" SourceID="http://schemas.microsoft.com/sharepoint/v3" StaticName="AppAuthor" FromBaseType="TRUE" />';
		var fileContent ="";
		while (fieldEnumerator.moveNext()) {
			var thisField = fieldEnumerator.get_current();
			var schemaXml = thisField.get_schemaXml();
			var fieldGroup = thisField.get_group();
			var selectedGroup = document.getElementById("selectGroup");
				
			if (fieldGroup == selectedGroup.options[selectedGroup.selectedIndex].text) {
				fileContent += schemaXml;
			}					
		}
		alert("The following content will be written:\n " + fileContent);
			
		//alert("SuccessWriteFile fileContent" + fileContent);
	
		//add new file
		var fileCreateInfo = new SP.FileCreationInformation();
			
		fileCreateInfo.set_url(_spPageContextInfo.webAbsoluteUrl + "/siteassets/"  + userOutputFile);
		fileCreateInfo.set_content(new SP.Base64EncodedByteArray());
				
		for (var i = 0; i < fileContent.length; i++) {
			
			fileCreateInfo.get_content().append(fileContent.charCodeAt(i));
		}
		
		var newFile = targetList.get_rootFolder().get_files().add(fileCreateInfo);
		var newFile = targetList.get_rootFolder().get_files().add(fileCreateInfo);
		
		debugger;
		context.load(newFile);
		context.executeQueryAsync(successSuccessWriteFile, failSuccessWriteFile);	
					
		function successSuccessWriteFile() {
			debugger;
			document.getElementById("messageToUser").innerHTML="File successfully written to " + _spPageContextInfo.webAbsoluteUrl + "/siteassets/" + userOutputFile;
		}
		
		function failSuccessWriteFile() {
			debugger;
			alert('FailsuccessWriteFile WriteFile failed. Please close your browser and try again.');
		}
	}
	
	function failWriteFile() {
		debugger;
		//alert('failWriteFile Check the Site Assets folder for your file.');
	}
}