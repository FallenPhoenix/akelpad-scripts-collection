///Translates selected text using the Google API
///Перевод текста используя Google-API
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=12612#12612
// Version: 2.5 (2012.03.19)
//
// -"Translate: Auto -> Ru (Google)" Call("Scripts::Main", 1, "TranslateWithGoogleAPI.js", `-lngT="ru" -Msg=1`)		- autodetect source language + display the result in MessageBox
// -"Перевести: Ru -> En (Google)" Call("Scripts::Main", 1, "TranslateWithGoogleAPI.js", `-lngS="ru" -lngT="en" -resType=2`)		- translate ru -> en + source text is replaced by the translation

var resultText;		//в эту переменную возвращается результат в виде текста, иначе undefined
var vn_resultObject = "resultObject";

var langSource = AkelPad.GetArgValue("lngS", "auto");		//autodetect source language
var langTarget = AkelPad.GetArgValue("lngT", "ru");		//target language [ru]
var nMsgBox = AkelPad.GetArgValue("Msg", 0);			//show the result in MessageBox: [0] / 1
//nResultType values (does not make sense with Msg=1):
//0 - copy to clipboard
//1 - selected text is replaced by the translation
//2 - display the result in new tab
//3 - output to Log-plugin console
var nResultType = AkelPad.GetArgValue("resType", 0);

var req = createRequestObject();
if (req)
{
	var selection;
	if (selection = AkelPad.GetSelText(2 /*\n*/))
		selection = selection.replace(/\n/g, "<n>");		//для сохранения переводов строк
	selection = encodeURIComponent(selection);

	var url = "http://translate.google.com/translate_a/t?";
	var params = "client=qlt&langpair=" + langSource + "|" + langTarget + "&q=" + selection + "&callback=" + vn_resultObject;

	req.open("POST", url, false);
	req.onreadystatechange = processReqChange;
	req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	req.send(params);

	if (resultText)
	{
		var nResultAction;
		
		if (nMsgBox == 1)
		{
			if (resultText != selection)
			{
				nResultAction = AkelPad.MessageBox(AkelPad.GetEditWnd(), "Result text:" + "\r\r" + resultText + "\r\r" + "Yes - copy to clipboard" + "\r" + "No - replace selected (source) text", WScript.ScriptName, 32 + 3);
				if (nResultAction == 2) WScript.Quit();
			}
			else
			{
				AkelPad.MessageBox(AkelPad.GetEditWnd(), "Translation for '" + selection + "' is missing.", WScript.ScriptName, 64);
				WScript.Quit();
			}
		}
		else
		{
			switch (nResultType)
			{
				case 2:
					AkelPad.Command(4101);
					break;
				case 3:
					AkelPad.Call("Log::Output", 5, resultText + "\r");
					WScript.Quit();
			}
			nResultAction = nResultType + 6;
		}
		
		switch (nResultAction)
		{
			case 6:
				AkelPad.SetClipboardText(resultText);
				break;
			default:
				AkelPad.ReplaceSel(resultText, true);
				break;
		}
	}
}


function createRequestObject()
{
	if (typeof(XMLHttpRequest) === 'undefined')
	{
		XMLHttpRequest = function()
		{
//			try { return new ActiveXObject("WinHttp.WinHttpRequest.5.1"); }		//Выше генерируется ошибка "Объект не поддерживает свойство или метод"
//				catch(e) {}
			try { return new ActiveXObject("Msxml2.XMLHTTP"); }
				catch(e) {}
			try { return new ActiveXObject("Microsoft.XMLHTTP"); }
				catch(e) {}
			throw new Error("Your system does not support XMLHttpRequest.");
		};
	}
	return new XMLHttpRequest();
}


function processReqChange()
{
	try
	{
		//только при состоянии "complete"
		if (req.readyState == 4)
		{
			//для статуса "OK"
			if (req.status == 200)
			{
				//обработка ответа
				var tmpText = (req.responseText.indexOf(vn_resultObject) != -1) ? req.responseText.replace(vn_resultObject, "var " + vn_resultObject + " = ") : "var " + vn_resultObject + " = " + req.responseText;
//				WScript.Echo(tmpText);		//test message
				eval(tmpText);

				if (!resultObject.sentences)
				{
					if (resultObject.error)
						showErrorMessage(resultObject.error.message + " (" + resultObject.error.code + ")", true);
					else
						showErrorMessage("There is no error output object, possibly changed API format.", true);
				}
				else
				{
					resultText = resultObject.sentences[0].trans;
					for (var i = 1; i < resultObject.sentences.length; ++i)
						resultText += resultObject.sentences[i].trans;
				}
				resultText = resultText.replace(/ {0,1}<n> {0,1}/g, "\n");		//восстановление переводов строк
				resultText = resultText.replace(/&amp;/gm, '&');
				resultText = resultText.replace(/&lt;/gm, '<');
				resultText = resultText.replace(/&gt;/gm, '>');
				resultText = resultText.replace(/&quot;/gm, '"');
			}
			else
				showErrorMessage("Unable to retrieve data (" + req.statusText + ")!", true);
		}
	}
	catch( e )
		{ showErrorMessage("Error: " + e, true); }
}


function showErrorMessage(pText, bQuit)
{
	AkelPad.MessageBox(AkelPad.GetEditWnd(), pText, WScript.ScriptName, 16);
	if (bQuit) WScript.Quit();
}