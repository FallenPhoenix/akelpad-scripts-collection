// ChooseFont_function.js - ver. 2013-08-14 (x86/x64)
//
// Contains functions:
// ChooseFont() - displays a dialog box with a choice of fonts
// ConvertFontFormat()
//
// Usage in script:
// if (! AkelPad.Include("ChooseFont_function.js")) WScript.Quit();
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

  var hWndDesk   = AkelPad.SystemFunction().Call("User32::GetDesktopWindow");
  var lpCallback = AkelPad.SystemFunction().RegisterCallback(0, CFCallback, 4);
  var nFlags     = CF_ENABLEHOOK | CF_FORCEFONTEXIST | CF_SCREENFONTS;
  var nCFSize    = _X64 ? 104 : 60; //sizeof(CHOOSEFONT)
  var lpCF       = AkelPad.MemAlloc(nCFSize);
  var lpLF;
  var vResult;
  var i;

  if (! AkelPad.SystemFunction().Call("User32::IsWindow", hWndOwn))
    hWndOwn = hWndDesk;

  if (nIniType && vIniVal)
  {
    if (nIniType == 4) //handle to window
      lpLF = ConvertFontFormat(AkelPad.SystemFunction().Call("User32::SendMessageW", vIniVal, 0x0031 /*WM_GETFONT*/, 0, 0), 2, 1);
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

  AkelPad.MemCopy(lpCF,                       nCFSize, 3 /*DT_DWORD*/); //lStructSize
  AkelPad.MemCopy(lpCF + (_X64 ?  8 :  4),    hWndOwn, 2 /*DT_QWORD*/); //hwndOwner
  AkelPad.MemCopy(lpCF + (_X64 ? 24 : 12),       lpLF, 2 /*DT_QWORD*/); //lpLogFont
  AkelPad.MemCopy(lpCF + (_X64 ? 36 : 20),     nFlags, 3 /*DT_DWORD*/); //Flags
  AkelPad.MemCopy(lpCF + (_X64 ? 56 : 32), lpCallback, 2 /*DT_QWORD*/); //lpfnHook

  if (AkelPad.SystemFunction().Call("Comdlg32::ChooseFontW", lpCF))
  {
    if (nResultType == 1) //pointer to LOGFONTW
      vResult = lpLF;
    else //handle to font or array
    {
      vResult = ConvertFontFormat(lpLF, 1, nResultType);
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

  function CFCallback(hWnd, uMsg, wParam, lParam)
  {
    if (uMsg == 272 /*WM_INITDIALOG*/)
    {
      var lpRect = AkelPad.MemAlloc(16); //sizeof(RECT)
      var sTitle;
      var nTextLen;
      var lpText;
      var nWndX, nWndY, nWndW, nWndH;
      var nOwnX, nOwnY, nOwnW, nOwnH;
      var nDeskW, nDeskH;

      //dialog title
      if (bFixedPitchOnly)
      {
        nTextLen = AkelPad.SystemFunction().Call("User32::SendMessageW", hWnd, 0x000E /*WM_GETTEXTLENGTH*/, 0, 0);
        sTitle   = " [Monospace]";
        lpText   = AkelPad.MemAlloc((nTextLen + sTitle.length + 1) * 2);

        AkelPad.SystemFunction().Call("User32::SendMessageW", hWnd, 0x000D /*WM_GETTEXT*/, nTextLen + 1, lpText);
        AkelPad.MemCopy(lpText + nTextLen * 2, sTitle, 1 /*DT_UNICODE*/);
        AkelPad.SystemFunction().Call("User32::SendMessageW", hWnd, 0x000C /*WM_SETTEXT*/, 0, lpText);
        AkelPad.MemFree(lpText);
      }

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

      AkelPad.SystemFunction().Call("User32::GetWindowRect", hWndDesk, lpRect);
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
    }

    return 0;
  }
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

    AkelPad.MemCopy(lpLF,      nHeight,  3 /*DT_DWORD*/);   //lfHeight
    AkelPad.MemCopy(lpLF + 16, nWeight,  3 /*DT_DWORD*/);   //lfWeight
    AkelPad.MemCopy(lpLF + 20, bItalic,  5 /*DT_BYTE*/);    //lfItalic
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
