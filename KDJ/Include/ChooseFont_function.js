// ChooseFont_function.js - 2012-06-20
//
// Contains functions:
// ChooseFont() - displays a dialog box with a choice of fonts
// ConvertFontFormat()
//
// Usage:
// AkelPad.Include("ChooseFont_function.js");

//------------------------------------------------------------------------------------------
// vResult = ChooseFont(hWndOwn, nIniType, vIniVal, bEffects, bFixedPitchOnly, nResultType);
//
// Arguments:
// hWndOwn - handle to the window that owns the dialog box of ChooseFont. It can be 0.
// nIniType - type of value in the argument vIniVal, used to initialize the dialog box:
//   0 - no initial, vIniVal is ignored,
//   1 - pointer to LOGFONTW structure,
//   2 - handle to font,
//   3 - array [sFontFace, nFontStyle, nFontSize] as in the method AkelPad.Font(), see below,
//   4 - handle to window from which the font will be used to initialize.
// vIniVal - pointer, handle or array, depending on nIniType value.
// bEffects - 0 or 1, if 1 - dialog box additionally displays the controls with strikeout, underline, and text color options.
// bFixedPitchOnly - 0 or 1, if 1 - displays only fixed-pitch fonts.
// nResultType - type of return value from the function:
//   1 - pointer to LOGFONTW structure,
//   2 - handle to font,
//   3 - array [sFontFace, nFontStyle, nFontSize] as in the method AkelPad.Font():
//       sFontFace - for example "Courier New",
//       nFontStyle:
//         1 - normal,
//         2 - bold,
//         3 - italic,
//         4 - bold italic,
//       nFontSize - font size in pixels.
//
// Return value:
// If you press OK button, the function returns a value depending on the argument nResultType (see above).
// Otherwise, returns 0.
//------------------------------------------------------------------------------------------
function ChooseFont(hWndOwn, nIniType, vIniVal, bEffects, bFixedPitchOnly, nResultType)
{
  var CF_EFFECTS             = 0x00000100;
  var CF_ENABLEHOOK          = 0x00000008;
  var CF_FIXEDPITCHONLY      = 0x00004000;
  var CF_FORCEFONTEXIST      = 0x00010000;
  var CF_INITTOLOGFONTSTRUCT = 0x00000040;
  var CF_SCREENFONTS         = 0x00000001;
  var lpCallback = AkelPad.SystemFunction().RegisterCallback("CFHookProcCallback");
  var nFlags     = CF_ENABLEHOOK | CF_FORCEFONTEXIST | CF_SCREENFONTS;
  var nCFSize    = 60; //sizeof(CHOOSEFONT)
  var lpCF       = AkelPad.MemAlloc(nCFSize);
  var lpLF;
  var vResult;
  var i;

  if (nIniType && vIniVal)
  {
    if (nIniType == 4) //handle to window
      lpLF = ConvertFontFormat(AkelPad.SendMessage(vIniVal, 0x0031 /*WM_GETFONT*/, 0, 0), 2, 1);
    else
      lpLF = ConvertFontFormat(vIniVal, nIniType, 1);
  }

  if (lpLF)
    nFlags |= CF_INITTOLOGFONTSTRUCT;
  else
    lpLF = AkelPad.MemAlloc(28 + 32 * 2 /*sizeof(LOGFONTW)*/);

  if (bEffects)
    nFlags |= CF_EFFECTS;

  if (bFixedPitchOnly)
    nFlags |= CF_FIXEDPITCHONLY;

  AkelPad.MemCopy(lpCF     ,    nCFSize, 3 /*DT_DWORD*/); //lStructSize
  AkelPad.MemCopy(lpCF +  4,    hWndOwn, 3 /*DT_DWORD*/); //hwndOwner
  AkelPad.MemCopy(lpCF +  8,          0, 3 /*DT_DWORD*/); //hDC
  AkelPad.MemCopy(lpCF + 12,       lpLF, 3 /*DT_DWORD*/); //lpLogFont
  AkelPad.MemCopy(lpCF + 16,          0, 3 /*DT_DWORD*/); //iPointSize
  AkelPad.MemCopy(lpCF + 20,     nFlags, 3 /*DT_DWORD*/); //Flags
  AkelPad.MemCopy(lpCF + 24,          0, 3 /*DT_DWORD*/); //rgbColors
  AkelPad.MemCopy(lpCF + 28,          0, 3 /*DT_DWORD*/); //lCustData
  AkelPad.MemCopy(lpCF + 32, lpCallback, 3 /*DT_DWORD*/); //lpfnHook
  AkelPad.MemCopy(lpCF + 36,          0, 3 /*DT_DWORD*/); //lpTemplateName
  AkelPad.MemCopy(lpCF + 40,          0, 3 /*DT_DWORD*/); //hInstance
  AkelPad.MemCopy(lpCF + 44,          0, 3 /*DT_DWORD*/); //lpszStyle
  AkelPad.MemCopy(lpCF + 48,          0, 3 /*DT_DWORD*/); //nFontType
  AkelPad.MemCopy(lpCF + 52,          0, 3 /*DT_DWORD*/); //nSizeMin
  AkelPad.MemCopy(lpCF + 56,          0, 3 /*DT_DWORD*/); //nSizeMax

  if (AkelPad.SystemFunction().Call("Comdlg32::ChooseFontW", lpCF))
  {
    if (nResultType == 1) //pointer to LOGFONTW
      vResult = lpLF;
    else if (nResultType == 2) //handle to font
    {
      vResult = ConvertFontFormat(lpLF, 1, 2);
      AkelPad.MemFree(lpLF);
    }
    else //array
    {
      vResult = ConvertFontFormat(lpLF, 1, 3);
      AkelPad.MemFree(lpLF);
    }
  }
  else
  {
    vResult = 0;
    AkelPad.MemFree(lpLF);
  }

  AkelPad.SystemFunction().UnregisterCallback(lpCallback);
  AkelPad.MemFree(lpCF);
  return vResult;
}

function CFHookProcCallback(hWnd, uMsg, wParam, lParam)
{
  if (uMsg == 272 /*WM_INITDIALOG*/)
  {
    var lpRect  = AkelPad.MemAlloc(16); //sizeof(RECT)
    var hWndOwn = AkelPad.MemRead(lParam + 4, 3 /*DT_DWORD*/) || AkelPad.SystemFunction().Call("user32::GetDesktopWindow");
    var nWndX, nWndY, nWndW, nWndH;
    var nOwnX, nOwnY, nOwnW, nOwnH;
    var nDeskW, nDeskH;
    var sTitle;
    var nTextLen;
    var lpText;

    //center dialog
    AkelPad.SystemFunction().Call("User32::GetWindowRect", hWnd, lpRect);
    nWndX = AkelPad.MemRead(lpRect,      3 /*DT_DWORD*/);
    nWndY = AkelPad.MemRead(lpRect  + 4, 3 /*DT_DWORD*/);
    nWndW = AkelPad.MemRead(lpRect +  8, 3 /*DT_DWORD*/) - nWndX;
    nWndH = AkelPad.MemRead(lpRect + 12, 3 /*DT_DWORD*/) - nWndY;

    AkelPad.SystemFunction().Call("User32::GetWindowRect", hWndOwn, lpRect);
    nOwnX = AkelPad.MemRead(lpRect,      3 /*DT_DWORD*/);
    nOwnY = AkelPad.MemRead(lpRect  + 4, 3 /*DT_DWORD*/);
    nOwnW = AkelPad.MemRead(lpRect +  8, 3 /*DT_DWORD*/) - nOwnX;
    nOwnH = AkelPad.MemRead(lpRect + 12, 3 /*DT_DWORD*/) - nOwnY;

    AkelPad.SystemFunction().Call("User32::GetWindowRect", AkelPad.SystemFunction().Call("User32::GetDesktopWindow"), lpRect);
    nDeskW = AkelPad.MemRead(lpRect +  8, 3 /*DT_DWORD*/);
    nDeskH = AkelPad.MemRead(lpRect + 12, 3 /*DT_DWORD*/);
    AkelPad.MemFree(lpRect);

    nWndX = nOwnX + (nOwnW - nWndW) / 2;
    nWndY = nOwnY + (nOwnH - nWndH) / 2;

    if ((nWndX + nWndW) > nDeskW)
      nWndX = nDeskW - nWndW;
    if (nWndX < 0)
      nWndX = 0;
    if ((nWndY + nWndH) > nDeskH)
      nWndY = nDeskH - nWndH;
    if (nWndY < 0)
      nWndY = 0;

    AkelPad.SystemFunction().Call("User32::MoveWindow", hWnd, nWndX, nWndY, nWndW, nWndH, 0);

    //dialog title
    if (AkelPad.MemRead(lParam + 20 /*offsetof(CHOOSEFONT, Flags)*/, 3 /*DT_DWORD*/) & 0x00004000 /*CF_FIXEDPITCHONLY*/)
    {
      sTitle   = " [Monospace]";
      nTextLen = AkelPad.SendMessage(hWnd, 0x000E /*WM_GETTEXTLENGTH*/, 0, 0) + sTitle.length + 1;
      lpText   = AkelPad.MemAlloc(nTextLen * 2);

      AkelPad.SendMessage(hWnd, 0x000D /*WM_GETTEXT*/, nTextLen, lpText);
      sTitle = AkelPad.MemRead(lpText, 1 /*DT_UNICODE*/) + sTitle;

      AkelPad.MemCopy(lpText, sTitle, 1 /*DT_UNICODE*/);
      AkelPad.SendMessage(hWnd, 0x000C /*WM_SETTEXT*/, 0, lpText);

      AkelPad.MemFree(lpText);
    }
  }

  return 0;
}

//-------------------------------------------------------
// vResult = ConvertFontFormat(vFont, nInType, nRetType);
//
// Arguments:
// vFont - pointer to LOGFONTW structure, handle to font, or array [sFontName, nFontStyle, nFontSize]
// nInType - vFont type,
// nRetType - vResult type:
//   1 - pointer to LOGFONTW structure
//   2 - handle to font
//   3 - array [sFontName, nFontStyle, nFontSize]
//-------------------------------------------------------
function ConvertFontFormat(vFont, nInType, nRetType)
{
  var nLFSize = 28 + 32 * 2; //sizeof(LOGFONTW)
  var lpLF    = AkelPad.MemAlloc(nLFSize);
  var hFont;
  var hDC;
  var nHeight;
  var nWeight;
  var bItalic;
  var vRetVal;
  var i;

  if (nInType == 1)
  {
    for (i = 0; i < nLFSize; ++i)
      AkelPad.MemCopy(lpLF + i, AkelPad.MemRead(vFont + i, 5 /*DT_BYTE*/), 5 /*DT_BYTE*/);
  }
  else if (nInType == 2)
  {
    if (! vFont)
      vFont = AkelPad.SystemFunction().Call("Gdi32::GetStockObject", 13 /*SYSTEM_FONT*/);

    AkelPad.SystemFunction().Call("Gdi32::GetObjectW", vFont, nLFSize, lpLF);
  }
  else if (nInType == 3)
  {
    hDC     = AkelPad.SystemFunction().Call("User32::GetDC", AkelPad.GetMainWnd());
    nHeight = -AkelPad.SystemFunction().Call("Kernel32::MulDiv", vFont[2], AkelPad.SystemFunction().Call("Gdi32::GetDeviceCaps", hDC, 90 /*LOGPIXELSY*/), 72);
    AkelPad.SystemFunction().Call("User32::ReleaseDC", AkelPad.GetMainWnd(), hDC);

    nWeight = 400;
    bItalic = 0;
    if ((vFont[1] == 2) || (vFont[1] == 4))
      nWeight = 700;
    if (vFont[1] > 2)
      bItalic = 1;

    AkelPad.MemCopy(lpLF     , nHeight, 3 /*DT_DWORD*/); //lfHeight
    AkelPad.MemCopy(lpLF + 16, nWeight, 3 /*DT_DWORD*/); //lfWeight
    AkelPad.MemCopy(lpLF + 20, bItalic, 5 /*DT_BYTE*/);  //lfItalic
    AkelPad.MemCopy(lpLF + 28, vFont[0], 1 /*DT_UNICODE*/); //lfFaceName
  }

  if (nRetType == 1)
    vRetVal = lpLF;
  else if (nRetType == 2)
  {
    vRetVal = AkelPad.SystemFunction().Call("Gdi32::CreateFontIndirectW", lpLF);
    AkelPad.MemFree(lpLF);
  }
  else if (nRetType == 3)
  {
    vRetVal    = [];
    vRetVal[0] = AkelPad.MemRead(lpLF + 28, 1 /*DT_UNICODE*/); //lfFaceName

    nWeight = AkelPad.MemRead(lpLF + 16, 3 /*DT_DWORD*/); //lfWeight
    bItalic = AkelPad.MemRead(lpLF + 20, 5 /*DT_BYTE*/);  //lfItalic

    if (nWeight < 600)
      vRetVal[1] = 1;
    else
      vRetVal[1] = 2;

    if (bItalic)
      vRetVal[1] += 2;

    hDC        = AkelPad.SystemFunction().Call("User32::GetDC", AkelPad.GetMainWnd());
    nHeight    = AkelPad.MemRead(lpLF, 3 /*DT_DWORD*/); //lfHeight
    vRetVal[2] = -AkelPad.SystemFunction().Call("Kernel32::MulDiv", nHeight, 72, AkelPad.SystemFunction().Call("Gdi32::GetDeviceCaps", hDC, 90 /*LOGPIXELSY*/));
    AkelPad.SystemFunction().Call("User32::ReleaseDC", AkelPad.GetMainWnd(), hDC); 
    AkelPad.MemFree(lpLF);
  }

  return vRetVal;
}
