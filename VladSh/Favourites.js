///Export/Replace Favourites-menu
///������ � ���� ����������: ������� / ������ / �������
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=11993#11993
// Version: 1.6 (2011.07.18)
// 
//  -"��������������..." Call("Scripts::Main", 1, "Favourites.js", "1")
//  -"������������� (��������)..." Call("Scripts::Main", 1, "Favourites.js", "2")
//  -"�������� ���������..." Call("Scripts::Main", 1, "Favourites.js", "0") Icon("%a\AkelFiles\Plugs\ContextMenu.dll", 6)

var pDefFileName = "MyFavourites(AkelPad)";
var pDefFileExt = "mnu";
var pFavTextParam = "FavText";

var pMenuFileName = "ContextMenu.ini";
var pMenuFile = AkelPad.GetAkelDir(4) /*ADTYPE_PLUGS*/ + "\\" + pMenuFileName;

if (! AkelPad.Include("INI.js")) WScript.Quit();
if (! oINI.setFile(pMenuFile))
{
	AkelPad.MessageBox(AkelPad.GetMainWnd(), pMenuFileName + " not found...", WScript.ScriptName, 64 /*MB_ICONINFORMATION*/);
	WScript.Quit();
}
if (! WScript.Arguments.length)
{
	AkelPad.MessageBox(AkelPad.GetMainWnd(), "Arguments not found!", WScript.ScriptName, 48 /*MB_ICONEXCLAMATION*/);
	WScript.Quit();
}
var nActn = parseInt(WScript.Arguments(0));

var pFavFile = "";
if (! AkelPad.Include("CommonFunctions.js")) WScript.Quit();

var pFavFileText = oINI.read(pFavTextParam);

if (nActn == 1)		//�������
{
	if (pFavFileText)
	{
		pFavFile = FileDialogDefault(false, pDefFileName, pDefFileExt);
		if (pFavFile)
		{
			pFavFile = CorrectFileNameFull(pFavFile);
			if (pFavFile)
			{
				var nOverwrite = 6 /*IDYES*/;
				if (fso.FileExists(pFavFile) == true)
					nOverwrite = AkelPad.MessageBox(AkelPad.GetMainWnd(), "File already exist. Replace it?", WScript.ScriptName, 32 /*MB_ICONQUESTION*/ + 4 /*MB_YESNO*/);
				
				if (nOverwrite == 6)
				{
					var fc = fso.CreateTextFile(pFavFile, true, true);
					fc.Write(pFavFileText);
					fc.Close();
					AkelPad.MessageBox(AkelPad.GetMainWnd(), "Favourites exported successfully.", WScript.ScriptName, 64 /*MB_ICONINFORMATION*/);
				}
			}
		}
	}
	else
		AkelPad.MessageBox(AkelPad.GetMainWnd(), "Favourites not found...", WScript.ScriptName, 64 /*MB_ICONINFORMATION*/);
}
else		//������ ��� �������
{
	var bRunning = (nActn == 2 || (nActn == 0 && pFavFileText));		//��� ������� �������� ������, � ��� �������, ������ ���� ���� ��� �������
	
	if (bRunning)
	{
		if (pFavFileText)			//������ � ��������������� � ������ ������� ������ �����, ����� ���� ���������� �����
			bRunning = (AkelPad.MessageBox(AkelPad.GetMainWnd(), "Favorites will be replaced, continue?", WScript.ScriptName, 48 /*MB_ICONEXCLAMATION*/ + 4 /*MB_YESNO*/) == 6);
		
		if (bRunning)
		{
			if (nActn == 2)		//������ (������)
			{
				pFavFile = FileDialogDefault(true, pDefFileName, pDefFileExt);
				if (pFavFile)
				{
					pFavFileText = AkelPad.ReadFile(pFavFile);
					if (!pFavFileText)
					{
						AkelPad.MessageBox(AkelPad.GetMainWnd(), "Choosed file is empty!", WScript.ScriptName, 48 /*MB_ICONEXCLAMATION*/);
						WScript.Quit();
					}
				}
				else
					WScript.Quit();		//� ������� ������� "������"
			}
			else		//������� ����� ������
				pFavFileText = "";
			
			//��������� �������������� Favorites-���� � ����������� ������������ ��������� (code from Instructor)
			bRunning = false;
			
			if (AkelPad.IsPluginRunning("ContextMenu::Main")) 
				bRunning = (AkelPad.Call("ContextMenu::Main", 10) != -1);		//��������� ������
			
			oINI.write(pFavTextParam, pFavFileText);
			
			if (bRunning)
				AkelPad.Call("ContextMenu::Main", 10);											//�������� ������
			
			if (nActn == 2)
				AkelPad.MessageBox(AkelPad.GetMainWnd(), "Favourites replaced successfully.", WScript.ScriptName, 64 /*MB_ICONINFORMATION*/);
		}
	}
}