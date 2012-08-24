///Auxiliary script; needed to determine the type of commentary for the current file.
// must be placed in ...\Scripts\Include\
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=1653#1653
// Version: 1.7 (2012.04.04)

var cBlockOpen;
var cBlockClose;
var cSimple;

var commentsSets = {
// (c) Infocatcher
	//= extension: [
	//=     [blockCmmStart0, blockCmmStart1],
	//=     [blockCmmEnd0, blockCmmEnd1],
	//=     [lineCmm]
	//= ]
	// Or
	//= otherExtension: "extension"
	//= "extension" must be already defined!
	// Use 'null' (without commas) for unavailable comments type.
	// First string will be used for comments adding (blockCmmStart0 and blockCmmEnd0 in example).
	c: ["/*", "*/", "//"],
	cpp: "c",
	h: "c",
	js: "c",
	java: "c",
	php: "c",
	pas: ["{", "}", "//"],
	dpr: ["{", "}", "//"],
	html: ["<!--", "-->", "//"],		//добавил возможность коментить js-код внутри html
	xhtml: "html",
	htm: "html",
	xml: "html",
	xsl: "html",
	xul: "html",
	rdf: "html",
	dtd: "html",
	css: ["/*", "*/", null],
	tpl: ["{*", "*}", "//"],
	ini: [null, null, ";"],
	asm: "ini",
	mnu: "ini",		//AkelPad menu file
	bat: [null, null, "rem "],
	vbs: [null, null, "'"],
	lss: ["%REM", "%END REM", "'"],
	manifest: [null, null, "#"],
	properties: "manifest",
	coder: "ini",
	spck: "ini"
};


function setComments(ext)
{
	if (ext == "")
		ext = "c";		//by default
	
	var cmmSet = commentsSets[ext];
	if (typeof(cmmSet) == "string")
		cmmSet = commentsSets[cmmSet];
	
	if (cmmSet == undefined)
	{
		AkelPad.MessageBox(AkelPad.GetEditWnd(), 'Для расширения "' + ext + '" комментарии не заданы!', WScript.ScriptName, 48 /*MB_EXCLAMATION*/);
		WScript.Quit();
	}
	
	cBlockOpen = cmmSet[0];
	cBlockClose = cmmSet[1];
	cSimple = cmmSet[2];
}

function getFileExt(pFile)
{
	return pFile.substr(pFile.lastIndexOf(".") + 1);
}