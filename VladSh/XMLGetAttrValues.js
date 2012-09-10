///Receiving appointed attributes of each line of XML-file
///Вытягивание определённых атрибутов из каждой строки файла с XML-структурой
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=11340#11340
// Version: 1.5 (2012.09.10)

if (! AkelPad.Include("ShowMenuEx.js")) WScript.Quit();
if (! AkelPad.Include("ProcessRowText.js")) WScript.Quit();

var arrAttr = getSelectedMenuItem(POS_CURSOR, "0", 0).split(", ");

//создаём структуру искомых тэгов, перечень которых берём из файла параметров
var structAttr = {};
for (var i = 0, l = arrAttr.length; i < l; i++)
	structAttr[arrAttr[i]] = 1;

var pContent = AkelPad.GetTextRange(0, -1);

//вызываем основную функцию обработчика всего файла
var pContent = processRowText(pContent, "\r");

AkelPad.Call("Log::Output", 5, pContent + "\r", -1, 1);


//функция обработки отдельной строки
function processString(rowXML)
{
	var pResult = "";
	var aRES = getAttributesValues(rowXML);
	if (aRES != null)
      pResult = aRES.join(", ");
	return pResult
}

function getAttributesValues(sXML)
{
	var aXML = sXML.split('"');
	
	var sATTR = "";
	var aRES = [];
	var r = 0;
	
	for (var n = 0; n <= aXML.length; n++)
	{
		sATTR = aXML[n].replace(/ /g, "");
		sATTR = sATTR.replace(/=/g, "");
		sATTR = sATTR.replace(/</g, "");
		
		if (structAttr[sATTR] == 1)
		{
			aRES[r] = aXML[n + 1];
			r += 1;
		}
		n += 1;
	}
	
	if (r > 0) return aRES
}

function addToResult(arrOutput, vResult)
{
	if (vResult) arrOutput[arrOutput.length] = vResult;
}