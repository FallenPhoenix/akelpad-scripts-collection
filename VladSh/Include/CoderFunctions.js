///������-"����������", ���������� ������� ��� ������ � Coder-��������
// � Instructor, F. Phoenix, VladSh
// ScriptURL=unknown
// Version: ? (2012.09.11)

var fCoderHighLight = "Coder::HighLight";
var fCoderSettings = "Coder::Settings";

//*** �������������� ���� ***\\

// ������������� �������������� ���� �� ���������� ����������.
function SetSyntax(pExt)
{
   	AkelPad.Call(fCoderSettings, 1, pExt);
}

// ���������� ��� ������������� coder-�����.
function GetSyntaxFile(hWndEdit)
{
   if (arguments.length == 0) hWndEdit = AkelPad.GetEditWnd();
   if (!hWndEdit) return "";

   var pFile = "", lpFile;
   if (lpFile = AkelPad.MemAlloc(256))
   {
      AkelPad.Call(fCoderSettings, 16, hWndEdit, lpFile, 256);
      pFile = AkelPad.MemRead(lpFile, 1  /*DT_UNICODE*/);
      AkelPad.MemFree(lpFile);
   }
   return pFile;
}

// ���������� ��������� ��������������� �����, �������������� �������
// (����������, �� �������� ��� ��� ����������).
// ���� �� ���� ���� ���������� �������������, ���������� ��� ���������.
function GetSyntaxAlias()
{
   var hWndEdit = AkelPad.GetEditWnd(), hDocEdit = AkelPad.GetEditDoc();
   if (!hWndEdit || !hDocEdit) return "";

   var pAlias = "", lpAlias;
   if (lpAlias = AkelPad.MemAlloc(256 * 2 /*sizeof(wchar_t)*/))
   {
      AkelPad.CallW(fCoderSettings, 18 /*DLLA_CODER_GETALIAS*/, hWndEdit, hDocEdit, lpAlias, 0);
      pAlias = AkelPad.MemRead(lpAlias, 1 /*DT_UNICODE*/);
      AkelPad.MemFree(lpAlias);
   }
   return pAlias;
}

// ���������� ���������� �� ���������� ��������������� �����
function GetSyntaxAliasExtension()
{
	var ext = "";
	var syntaxAlias = GetSyntaxAlias();
	if (syntaxAlias)
		ext = syntaxAlias.match(/\.(.\w*)/)[1];	//�� ����� �����
	return ext;
}

// ��������� ���������� ������� �������������� ���� � ��������� �����������.
function CheckSyntaxExtension(pAlias)
{
   var lpActive;
   var bActive = false;

   if (lpActive = AkelPad.MemAlloc(4 /*sizeof(BOOL)*/))
   {
      AkelPad.CallW(fCoderSettings, 12, pAlias, lpActive);
      bActive = AkelPad.MemRead(lpActive, 3 /*DT_DWORD*/);
      AkelPad.MemFree(lpActive);
   }
   return bActive;
}

// ���������� ������ ���������� ������� �������������� ����.
function GetSyntaxExtensions(hWndEdit)
{
   var pText = AkelPad.ReadFile(AkelPad.GetAkelDir(4) + "\\Coder\\" + GetSyntaxFile(hWndEdit), 0xD).replace(/\r\n?/g, "\n");
   var mSection = pText.match(/^Files:\s*?\n((?:(?:\*\..*?|;.*?|\s*?)\n)+)/m);
   var mResult = mSection[1].match(/^\*\.\w+/gmi);
   for (var i = 0; i < mResult.length; i++) mResult[i] = mResult[i].substr(1);
   return mResult;
}


//*** �������� ���� ***\\

// ������������� �������� ���� �� �����.
function SetColorTheme(pName)
{
   AkelPad.CallW(fCoderSettings, 5, pName);
}

// ���������� ��� �������� �������� ����.
function GetColorTheme(hWndEdit)
{
   var pVarTheme = "";
   var lpVarTheme;

   if (lpVarTheme = AkelPad.MemAlloc(256 * 2 /*sizeof(wchar_t)*/))
   {
      AkelPad.CallW(fCoderSettings, 20, hWndEdit, lpVarTheme, 256);
      pVarTheme = AkelPad.MemRead(lpVarTheme, 1 /*DT_UNICODE*/);
      AkelPad.MemFree(lpVarTheme);
   }
   return pVarTheme;
}

// ��������� ���������� �������� ���� � ��������� ������.
function CheckColorTheme(pName)
{
   var lpActive;
   var bActive = false;

   if (lpActive = AkelPad.MemAlloc(4 /*sizeof(BOOL)*/))
   {
      AkelPad.CallW(fCoderSettings, 14, pName, lpActive);
      bActive = AkelPad.MemRead(lpActive, 3 /*DT_DWORD*/);
      AkelPad.MemFree(lpActive);
   }
   return bActive;
}