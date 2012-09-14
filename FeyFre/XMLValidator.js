// === [XMLValidator.js] ===
// Validates selected XML fragment or whole document, pointing potential error place 
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=15256#15256 
// http://staynormal.org.ua/akelpad/scripts/XMLValidator.js
// Version: 1.5 (2012.09.14) (c) VladSh Log-plugin integration
// Version: 1.0 (2011.10.25) (c) Panych Y.W. aka FeyFre 
// 
// Arguments: 
//    keep: 
//         • [0 | без параметра] - не сохранять исходное выделение, устанавливая курсор в место ошибки 
//         • 1 - сохранять исходное выделение; если выделения нет, то курсор также будет установлен в место ошибки 
//    log - параметры вывода сообщений: 
//       • [0 | без параметра] - в диалоговое окно (иначе в панель вывода Log-плагина) 
//       • 1 - очищать содержимое панели Log-плагина перед записью 
//       • 2 - не очищать 
// 
// Examples: 
//    Call("Scripts::Main", 1, "XMLValidator.js", `-log=2`) 

var nlog = AkelPad.GetArgValue("log", 0); 
var parserName = "msxml2.DOMDocument"; 
var xml = new ActiveXObject(parserName); 
try { 
   xml.async = false; 
   xml.validateOnParse = true; 
   xml.resolveExternals = false; 
} 
catch (e) { 
   output("Internal parser " + parserName + " error: " + e.description, nlog, 16 /*MB_ICONSTOP*/); 
   WScript.Quit(); 
} 

var text = AkelPad.GetSelText(); 
var selection; 
if (!text) { 
   text = AkelPad.GetTextRange(0, -1); 
   selection = false; 
} 
else 
   selection = true; 

var t = new Date(); 
var extInfo = t.toLocaleTimeString() + " " + (AkelPad.GetEditFile(0) || "*") + " -> "; 

xml.loadXML(text); 
if (xml.parseError.errorCode !== 0) { 
   var err = xml.parseError; 
   if (!selection || !AkelPad.GetArgValue("keep", 0)) { 
      var np = Math.min(AkelPad.GetSelStart(), AkelPad.GetSelEnd()); 
      if (selection) 
         np += err.filepos; 
      else 
         np = err.filepos; 
      AkelPad.SetSel(np, np); 
   } 
   var errInfo = extInfo + "XML validation error:\r(" + err.line + "," + err.linepos + ")\t\t" + err.reason; 
   output(errInfo, nlog, 48 /*MB_ICONEXCLAMATION*/); 
} 
else { 
   // при успешном выполнении не затираем консоль лога, даже если попросили 
   if (nlog == 1) nlog = 2; 
   output(extInfo + "XML fragment is valid.\r", nlog, 64 /*MB_ICONINFORMATION*/); 
} 

function output(msg, nlog, nIcon /*MB_ICON...*/) { 
   switch (nlog) { 
      case 1: 
      case 2: 
         var fLogOutput = "Log::Output"; 
         if (AkelPad.Call(fLogOutput, 1, "", "", "^\\((\\d+),(\\d+)\\)", "/GOTOLINE=$1:$2") != -1) { 
            AkelPad.Call(fLogOutput, 5, msg, -1, nlog - 1); 
            break; 
         } 
      default: 
         AkelPad.MessageBox(AkelPad.GetEditWnd(), msg, WScript.ScriptName, nIcon); 
         break; 
   } 
}