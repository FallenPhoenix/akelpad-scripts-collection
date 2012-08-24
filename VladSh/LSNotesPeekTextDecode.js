///LND: Раскодирование текста, скопированного из NotesPeek
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=7982#7982
// Version: 1.0 (2011.04.13)

//eval(AkelPad.ReadFile(AkelPad.GetAkelDir(5) + "\\converter.js"));		//временно закоменчено (ждём выделение функций для конвертации в отдельную библиотеку)

var CP_NOT_CONVERT = -2;
var CP_CURRENT     = -1;
var oSys = AkelPad.SystemFunction();

var pText = AkelPad.GetSelText() || AkelPad.SetSel(0, -1) || AkelPad.GetSelText();

pText = decodeEscapes(pText);
pText = convertToUnicode(pText, 1251);
pText = pText.replace(/\x05/gm, "");		//рубим тупые квадратики
pText = pText.replace(new RegExp('"\r\t"', "gm"), "");		//убираем ненужные разрывы внутри строк

AkelPad.ReplaceSel(pText);


// Infocatcher's code
function decodeEscapes(str) {
/*
	if(customEscapesDecoder)
		return decodeEscapesCustom(str);
*/

	// Keep some escaped chars inside string literals
	// "ab\ncd" => "ab\\ncd" => eval() => "ab\ncd"
	var doubleEscape = function(s) {
		return s.replace(
			/(\\+)([nrt'"])?/g,
			function(s, bs, chr) {
				if(bs.length % 2 == 0 || chr) // \ => \\ (*2)
					return new Array(bs.length + 1).join("\\") + s;
				// \\\ => \\ + \ => (\\)*2 + \
				return new Array(Math.floor(bs.length/2)*2 + 1).join("\\") + s;
			}
		);
	};
	str = str // Single RegExp like /("|')(?:\\\1|[^\1])*\1/g fail
		.replace(/"(?:\\"|[^"\n\r])*"/g, doubleEscape)
		.replace(/'(?:\\'|[^'\n\r])*'/g, doubleEscape);

	var fixEsc = function(s, bs, chr, hex) {
		return bs.length % 2 == 0 && /[^0-9a-f]/i.test(hex)
			? bs + chr + hex
			: s;
	};

	try {
		str = eval(
			'"' +
			str // Make valid string
				.replace(
					/(\\*)["']/g,
					function(s, bs) {
						return bs.length % 2 == 0
							? "\\" + s
							: s;
					}
				)
				.replace(
					/\\+$/, // Fix qwe\ => "qwe\" => eval() error
					function(s) {
						return s.length % 2 != 0
							? "\\" + s
							: s;
					}
				)

				// Fix invalid \u and \x
				.replace(/(\\*)\\(x)([\s\S]{2})/g, fixEsc)
				.replace(/(\\*)\\(u)([\s\S]{4})/g, fixEsc)

				.replace(/\n/g, "\\n")
				.replace(/\r/g, "\\r")
				.replace(/\x00/g, "\\x00")
				.replace(/\u2028/g, "\\u2028")
				.replace(/\u2029/g, "\\u2029") +
			'"'
		);
	}
	catch(e) {
		throw new (e.constructor || SyntaxError)('eval("string") fail\n' + e.message);
	}

	return str;
}

function convertToUnicode(str, cp) {
   if(cp == CP_NOT_CONVERT)
      return str;
   if(cp == CP_CURRENT || cp === undefined)
      cp = AkelPad.GetEditCodePage(0);

   var ret = "";

   if(
      cp == 1200 //UTF-16LE
      || cp == 1201 //UTF-16BE
      || cp == 12000 //UTF-32LE
      || cp == 12001 //UTF-32BE
   ) {
      var isLE = cp == 1200 || cp == 12000;
      var step = cp == 12000 || cp == 12001 ? 4 : 2;
      if(str.length % step != 0)
         throw "Invalid unicode string";
      for(var i = 0, l = str.length; i < l; i += step) {
         var chars = str.substr(i, step);
         if(isLE) {
            var b1 = chars.charCodeAt(0);
            var b2 = chars.charCodeAt(1);
         }
         else {
            var b1 = chars.charCodeAt(step - 1);
            var b2 = chars.charCodeAt(step - 2);
         }
         ret += String.fromCharCode((b2 << 8) + b1);
      }
      return ret;
   }

   // based on Fr0sT's code: http://akelpad.sourceforge.net/forum/viewtopic.php?p=7972#7972

   // current code page is UTF16* or UTF32* - set ansi current code page
   // (WideChar <-> MultiByte functions don't work with this code pages)
   if(cp == 1 || cp == 1200 || cp == 1201 || cp == 12000 || cp == 12001)
      cp = 0;

   try {
      var strLen = str.length;
      var pMBBuf = AkelPad.MemAlloc(strLen * 1 /*sizeof(char)*/);
      if(!pMBBuf)
         throw new Error("MemAlloc fail");
      for(var i = 0; i < strLen; i++)
         AkelPad.MemCopy(pMBBuf + i, str.charCodeAt(i), 5 /*DT_BYTE*/);

      // get required buffer size
      var bufLen = oSys.Call(
         "Kernel32::MultiByteToWideChar",
         cp,       //   __in   UINT CodePage,
         0,        //   __in   DWORD dwFlags,
         pMBBuf,   //   __in   LPCSTR lpMultiByteStr,
         strLen,   //   __in   int cbMultiByte,
         0,        //   __out  LPWSTR lpWideCharStr,
         0         //   __in   int cchWideChar
      );
      if(!bufLen)
         throw new Error("MultiByteToWideChar fail " + oSys.GetLastError());
      bufLen *= 2 /*sizeof(wchar_t)*/;

      var pWCBuf = AkelPad.MemAlloc(bufLen);
      if(!pWCBuf)
         throw new Error("MemAlloc fail");

      // convert buffer
      bufLen = oSys.Call(
         "Kernel32::MultiByteToWideChar",
         cp,       //   __in   UINT CodePage,
         0,        //   __in   DWORD dwFlags,
         pMBBuf,   //   __in   LPCSTR lpMultiByteStr,
         strLen,   //   __in   int cbMultiByte,
         pWCBuf,   //   __out  LPWSTR lpWideCharStr,
         bufLen    //   __in   int cchWideChar
      );
      if(!bufLen)
         throw new Error("MultiByteToWideChar fail " + oSys.GetLastError());

      //ret = AkelPad.MemRead(pWCBuf, 1 /*DT_UNICODE*/);
      for(var pCurr = pWCBuf, bufMax = pWCBuf + bufLen*2; pCurr < bufMax; pCurr += 2)
         ret += String.fromCharCode(AkelPad.MemRead(pCurr, 4 /*DT_WORD*/));
   }
   catch(e) {
      throw e;
   }
   finally {
      pMBBuf && AkelPad.MemFree(pMBBuf);
      pWCBuf && AkelPad.MemFree(pWCBuf);
   }

   return ret;
}