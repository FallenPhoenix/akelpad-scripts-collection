// InputBox_function.js - 2012-05-27
//
// InputBox with multiple edit value and variable window width.
// Window width adjusts to the length of caption and label.
//
// Usage:
// AkelPad.Include("InputBox_function.js");
// vReturnValue = InputBox(hWndParent, sCaption, vLabel, vEdit, nFocus, sFunction, vFuncArg);
//
// Arguments (all are optional):
// hWndParent (number)
//   Handle to the owner window of the input box. Default is 0.
// sCaption (string)
//   Dialog box title. Default is "".
// vLabel (string or array of strings)
//   Edit boxes labels. Can use "\n" to create multiline labels.
//   Maximum length of label text is 1023 characters. Default is "".
// vEdit (string or array of strings)
//   Edit boxes texts. Maximum length of edit text is 511 characters. Default is "".
//   Maximum number of elements in array is 97.
// nFocus (number)
//   Index of vEdit array item, on which will set keyboard focus, first and default is 0.
// sFunction (string max length = 255 chars)
//   Name of the function used to validate entered data.
//   The function is called when pressed button "OK", but before closing dialog box.
//   To the function are passed two arguments:
//     - handle to dialog box,
//     - array containing all of input strings,
//     - vFuncArg.
//   If input strings are valid, the function should return -1. Otherwise, index of incorrect string in array.
// vFuncArg (boolean, number or string max length = 260 chars)
//   Additional argument passed to sFunction.
//
// Return value:
//   undefined - if pressed Cancel button or Esc key,
//   array of strings - edit boxes texts, if vEdit is array,
//   string -  edit box text, otherwise.

function InputBox(hWndParent, sCaption, vLabel, vEdit, nFocus, sFunc, vFuncArg)
{
  var nLabelLen = 1023;
  var nEditLen  = 511;
  var nLabels   = 0;
  var lpCallback;
  var aLabel;
  var aEdit;
  var aMatch;
  var lpInitParam;
  var lpTemp;
  var lpItem;
  var lpEdit;
  var vRetVal;
  var i;

  if (lpCallback = AkelPad.SystemFunction().RegisterCallback("InputBoxCallback"))
  {
    if (typeof hWndParent != "number")
      hWndParent = 0;

    if (typeof sCaption != "string")
      sCaption = "";

    if (typeof vLabel == "string")
      aLabel = [vLabel];
    else if ((typeof vLabel == "object") && (vLabel instanceof Array) && vLabel.length)
      aLabel = vLabel.slice(0);
    else
      aLabel = [""];

    if (typeof vEdit == "string")
      aEdit = [vEdit];
    else if ((typeof vEdit == "object") && (vEdit instanceof Array) && vEdit.length)
      aEdit = vEdit.slice(0);
    else
      aEdit = [""];

    if (aLabel.length > 97)
      aLabel.length = 97;

    if (aEdit.length > 97)
      aEdit.length = 97;

    while (aLabel.length < aEdit.length)
      aLabel.push("");

    while (aEdit.length < aLabel.length)
      aEdit.push("");

    for (i = 0; i < aEdit.length; ++i)
    {
      if (! aEdit[i])
        aEdit[i] = "";
      if (! aLabel[i])
        aLabel[i] = "";

      aEdit[i]  = aEdit[i].substr(0, nEditLen);
      aLabel[i] = aLabel[i].substr(0, nLabelLen);

      ++nLabels;
      if (aMatch = aLabel[i].match(/\n/g))
        nLabels += aMatch.length;
    }

    if ((typeof nFocus != "number") || (nFocus < 0))
      nFocus = 0;
    else if (nFocus >= aEdit.length)
      nFocus = aEdit.length - 1;

    if ((typeof sFunc != "string") || (sFunc.length > 255))
      sFunc = "";

    if (typeof vFuncArg == "boolean")
      vFuncArg = "b" + Number(vFuncArg);
    else if (typeof vFuncArg == "number")
      vFuncArg = "n" + vFuncArg;
    else if ((typeof vFuncArg == "string") && (vFuncArg.length <= 260))
      vFuncArg = "s" + vFuncArg;
    else
      vFuncArg = "";

    lpInitParam = AkelPad.MemAlloc(2 +
                                   (sFunc.length + 1 +
                                    vFuncArg.length + 1 +
                                    sCaption.length + 1 +
                                    (nEditLen + 1) * aEdit.length +
                                    (nLabelLen + 1) * aLabel.length) * 2);
    lpTemp = AkelPad.MemAlloc(24 + (4 + aEdit.length + nLabels) * 28);

    //Dialog
    AkelPad.MemCopy(lpTemp,      0x90C80000,  3 /*DT_DWORD*/); //style (WS_POPUP|WS_VISIBLE|WS_CAPTION|WS_SYSMENU)
    AkelPad.MemCopy(lpTemp +  8, 4 + aEdit.length + nLabels, 4 /*DT_WORD*/); //cdit

    //for sFunc and vFuncArg
    lpItem = lpTemp + 24;
    AkelPad.MemCopy(lpItem,      0x40000000, 3 /*DT_DWORD*/); //style (WS_CHILD)
    AkelPad.MemCopy(lpItem + 16, 2998,       4 /*DT_WORD*/);  //id
    AkelPad.MemCopy(lpItem + 18, 0xFFFF,     4 /*DT_WORD*/);  //class
    AkelPad.MemCopy(lpItem + 20, 0x0082,     4 /*DT_WORD*/);  //class ("Static")
    lpItem += 28;
    AkelPad.MemCopy(lpItem,      0x40000000, 3 /*DT_DWORD*/); //style (WS_CHILD)
    AkelPad.MemCopy(lpItem + 16, 2999,       4 /*DT_WORD*/);  //id
    AkelPad.MemCopy(lpItem + 18, 0xFFFF,     4 /*DT_WORD*/);  //class
    AkelPad.MemCopy(lpItem + 20, 0x0082,     4 /*DT_WORD*/);  //class ("Static")

    //Buttons
    lpItem += 28;
    AkelPad.MemCopy(lpItem,      0x50010001, 3 /*DT_DWORD*/); //style (WS_CHILD|WS_VISIBLE|WS_TABSTOP|BS_DEFPUSHBUTTON)
    AkelPad.MemCopy(lpItem + 16, 3000,       4 /*DT_WORD*/);  //id
    AkelPad.MemCopy(lpItem + 18, 0xFFFF,     4 /*DT_WORD*/);  //class
    AkelPad.MemCopy(lpItem + 20, 0x0080,     4 /*DT_WORD*/);  //class ("Button")
    lpItem += 28;
    AkelPad.MemCopy(lpItem,      0x50010000, 3 /*DT_DWORD*/); //style (WS_CHILD|WS_VISIBLE|WS_TABSTOP)
    AkelPad.MemCopy(lpItem + 16, 3001,       4 /*DT_WORD*/);  //id
    AkelPad.MemCopy(lpItem + 18, 0xFFFF,     4 /*DT_WORD*/);  //class
    AkelPad.MemCopy(lpItem + 20, 0x0080,     4 /*DT_WORD*/);  //class ("Button")

    //Edits
    for (i = 0; i < aEdit.length; ++i)
    {
      lpItem += 28;
      AkelPad.MemCopy(lpItem,      0x50010080, 3 /*DT_DWORD*/); //style (WS_CHILD|WS_VISIBLE|WS_TABSTOP|ES_AUTOHSCROLL)
      AkelPad.MemCopy(lpItem +  4, 0x00000200, 3 /*DT_DWORD*/); //dwExtendedStyle (WS_EX_CLIENTEDGE)
      AkelPad.MemCopy(lpItem + 16, 3002 + i,   4 /*DT_WORD*/);  //id
      AkelPad.MemCopy(lpItem + 18, 0xFFFF,     4 /*DT_WORD*/);  //class
      AkelPad.MemCopy(lpItem + 20, 0x0081,     4 /*DT_WORD*/);  //class ("Edit")
    }

    //Labels
    for (i = 0; i < nLabels; ++i)
    {
      lpItem += 28;
      AkelPad.MemCopy(lpItem,      0x5000008C, 3 /*DT_DWORD*/); //style (WS_CHILD|WS_VISIBLE|SS_NOPREFIX|SS_LEFTNOWORDWRAP)
      AkelPad.MemCopy(lpItem + 16, 3100 + i,   4 /*DT_WORD*/);  //id
      AkelPad.MemCopy(lpItem + 18, 0xFFFF,     4 /*DT_WORD*/);  //class
      AkelPad.MemCopy(lpItem + 20, 0x0082,     4 /*DT_WORD*/);  //class ("Static")
    }

    AkelPad.MemCopy(lpInitParam,     aEdit.length, 5 /*DT_BYTE*/);
    AkelPad.MemCopy(lpInitParam + 1, nFocus,       5 /*DT_BYTE*/);
    AkelPad.MemCopy(lpInitParam + 2, sFunc,        1 /*DT_UNICODE*/);

    lpItem = lpInitParam + 2 + (sFunc.length + 1) * 2;
    AkelPad.MemCopy(lpItem, vFuncArg, 1 /*DT_UNICODE*/);

    lpItem = lpItem + (vFuncArg.length + 1) * 2;
    AkelPad.MemCopy(lpItem, sCaption, 1 /*DT_UNICODE*/);

    lpItem = lpItem + (sCaption.length + 1) * 2;
    for (i = 0; i < aEdit.length; ++i)
    {
      AkelPad.MemCopy(lpItem, aEdit[i], 1 /*DT_UNICODE*/);
      lpItem += (nEditLen + 1) * 2;
    }

    for (i = 0; i < aEdit.length; ++i)
    {
      AkelPad.MemCopy(lpItem, aLabel[i], 1 /*DT_UNICODE*/);
      lpItem += (nLabelLen + 1) * 2;
    }

    lpEdit = AkelPad.SystemFunction().Call("user32::DialogBoxIndirectParamW", AkelPad.GetInstanceDll(), lpTemp, hWndParent, lpCallback, lpInitParam);

    if (lpEdit)
    {
      if ((typeof vEdit == "object") && (vEdit instanceof Array))
      {
        for (i = 0; i < aEdit.length; ++i)
          aEdit[i] = AkelPad.MemRead(lpEdit + 1024 * i, 1 /*DT_UNICODE*/);
        vRetVal = aEdit;
      }
      else
        vRetVal = AkelPad.MemRead(lpEdit, 1 /*DT_UNICODE*/);

      AkelPad.MemFree(lpEdit);
    }

    AkelPad.SystemFunction().UnregisterCallback(lpCallback);
    AkelPad.MemFree(lpInitParam);
    AkelPad.MemFree(lpTemp);
  }

  return vRetVal;
}

function InputBoxCallback(hWnd, uMsg, wParam, lParam)
{
  switch (uMsg)
  {
    case 272 : //WM_INITDIALOG
      var nFX      = AkelPad.SystemFunction().Call("user32::GetSystemMetrics",  7 /*SM_CXFIXEDFRAME*/);
      var nFY      = AkelPad.SystemFunction().Call("user32::GetSystemMetrics",  8 /*SM_CYFIXEDFRAME*/);
      var nIX      = AkelPad.SystemFunction().Call("user32::GetSystemMetrics", 49 /*SM_CXSMICON*/);
      var nSX      = AkelPad.SystemFunction().Call("user32::GetSystemMetrics", 30 /*SM_CXSIZE*/);
      var nCY      = AkelPad.SystemFunction().Call("user32::GetSystemMetrics",  4 /*SM_CYCAPTION*/);
      var hGuiFont = AkelPad.SystemFunction().Call("gdi32::GetStockObject", 17 /*DEFAULT_GUI_FONT*/);
      var nEdits   = AkelPad.MemRead(lParam,     5 /*DT_BYTE*/);
      var nFocus   = AkelPad.MemRead(lParam + 1, 5 /*DT_BYTE*/);
      var sFunc    = AkelPad.MemRead(lParam + 2, 1 /*DT_UNICODE*/);
      var sFuncArg = AkelPad.MemRead(lParam + 2 + (sFunc.length + 1) * 2, 1 /*DT_UNICODE*/);
      var sCaption = AkelPad.MemRead(lParam + 2 + (sFunc.length + sFuncArg.length + 2) * 2, 1 /*DT_UNICODE*/);
      var aLabel   = new Array(nEdits);
      var lpRect   = AkelPad.MemAlloc(16); //sizeof(RECT)
      var nWndX, nWndY, nWndW, nWndH;
      var nOwnX, nOwnY, nOwnW, nOwnH;
      var nDeskW;
      var nDeskH;
      var nClientW;
      var nClientH;
      var nLabelW;
      var nItemY;
      var lpItem;
      var hIcon;
      var sTxtOK;
      var sTxtCancel;
      var i, k, n;

      switch (AkelPad.GetLangId(0 /*LANGID_FULL*/))
      {
        case 1045 : //Polish
          sTxtOK     = "OK";
          sTxtCancel = "Anuluj";
          break;
        case 1049 : //Russian
          sTxtOK     = "ОК";
          sTxtCancel = "Отмена";
          break;
        case 2052 : //Chinese-Simplified (by cnnnc)
          sTxtOK     = "确定";
          sTxtCancel = "取消";
          break;
        default :
          sTxtOK     = "OK";
          sTxtCancel = "Cancel";
      }

      nClientH = 10 + 23 + 10;
      lpItem   = lParam + 2 + (sFunc.length + sFuncArg.length + sCaption.length + 3) * 2 + 1024 * nEdits;
      for (i = 0; i < nEdits; ++i)
      {
        aLabel[i] = AkelPad.MemRead(lpItem, 1 /*DT_UNICODE*/).split("\n");
        nClientH += 10 + 13 * aLabel[i].length + 5 + 20;
        lpItem   += 2048;
      }

      AkelPad.SystemFunction().Call("user32::GetWindowRect", (AkelPad.SystemFunction().Call("user32::GetParent", hWnd) || AkelPad.SystemFunction().Call("user32::GetDesktopWindow")), lpRect);
      nOwnX = AkelPad.MemRead(lpRect,      3 /*DT_DWORD*/);
      nOwnY = AkelPad.MemRead(lpRect  + 4, 3 /*DT_DWORD*/);
      nOwnW = AkelPad.MemRead(lpRect +  8, 3 /*DT_DWORD*/) - nOwnX;
      nOwnH = AkelPad.MemRead(lpRect + 12, 3 /*DT_DWORD*/) - nOwnY;

      AkelPad.SystemFunction().Call("user32::GetWindowRect", AkelPad.SystemFunction().Call("user32::GetDesktopWindow"), lpRect);
      nDeskW   = AkelPad.MemRead(lpRect +  8, 3 /*DT_DWORD*/);
      nDeskH   = AkelPad.MemRead(lpRect + 12, 3 /*DT_DWORD*/);
      nClientW = GetTextMaxWidth(hWnd, [[sCaption]]) + nIX + nSX;
      nLabelW  = GetTextMaxWidth(hWnd, aLabel, hGuiFont) + 20;

      if (nClientW < nLabelW)
        nClientW = nLabelW;
      if (nClientW < 320)
        nClientW = 320;
      else if (nClientW > nDeskW - nFX * 2)
        nClientW = nDeskW - nFX * 2;

      nWndW = nClientW + nFX * 2;
      nWndH = nClientH + nFY * 2 + nCY;
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

      //Dialog
      AkelPad.SystemFunction().Call("user32::MoveWindow", hWnd, nWndX, nWndY, nWndW, nWndH, 0);
      AkelPad.SystemFunction().Call("user32::SetWindowTextW", hWnd, sCaption);

      //for sFunc
      AkelPad.SystemFunction().Call("user32::SetDlgItemTextW", hWnd, 2998, sFunc);
      AkelPad.SystemFunction().Call("user32::SetDlgItemTextW", hWnd, 2999, sFuncArg);

      //Buttons
      AkelPad.SystemFunction().Call("user32::MoveWindow", AkelPad.SystemFunction().Call("user32::GetDlgItem", hWnd, 3000), nClientW - 175, nClientH - 33, 80, 23, 0);
      AkelPad.SystemFunction().Call("user32::MoveWindow", AkelPad.SystemFunction().Call("user32::GetDlgItem", hWnd, 3001), nClientW -  90, nClientH - 33, 80, 23, 0);
      AkelPad.SystemFunction().Call("user32::SendDlgItemMessageW", hWnd, 3000, 48 /*WM_SETFONT*/, hGuiFont, 0);
      AkelPad.SystemFunction().Call("user32::SendDlgItemMessageW", hWnd, 3001, 48 /*WM_SETFONT*/, hGuiFont, 0);
      AkelPad.SystemFunction().Call("user32::SetDlgItemTextW", hWnd, 3000, sTxtOK);
      AkelPad.SystemFunction().Call("user32::SetDlgItemTextW", hWnd, 3001, sTxtCancel);

      //Edits
      nItemY = -20;
      lpItem = lParam + 2 + (sFunc.length + sFuncArg.length + sCaption.length + 3) * 2;
      for (i = 0; i < nEdits; ++i)
      {
        nItemY += 10 + 13 * aLabel[i].length + 5 + 20;
        AkelPad.SystemFunction().Call("user32::MoveWindow", AkelPad.SystemFunction().Call("user32::GetDlgItem", hWnd, 3002 + i), 10, nItemY, nClientW - 20, 20, 0);
        AkelPad.SystemFunction().Call("user32::SendDlgItemMessageW", hWnd, 3002 + i, 197 /*EM_SETLIMITTEXT*/, 511, 0);
        AkelPad.SystemFunction().Call("user32::SendDlgItemMessageW", hWnd, 3002 + i, 48 /*WM_SETFONT*/, hGuiFont, 0);
        AkelPad.SystemFunction().Call("user32::SetDlgItemTextW", hWnd, 3002 + i, AkelPad.MemRead(lpItem, 1 /*DT_UNICODE*/));
        lpItem += 1024;
      }

      //Labels
      nItemY = -5 - 13 - 20;
      for (i = 0, n = 0; i < nEdits; ++i)
      {
        nItemY += 10 + 5 + 20;
        for (k = 0; k < aLabel[i].length; ++k)
        {
          nItemY += 13;
          AkelPad.SystemFunction().Call("user32::MoveWindow", AkelPad.SystemFunction().Call("user32::GetDlgItem", hWnd, 3100 + n), 10, nItemY, nClientW - 20, 13, 0);
          AkelPad.SystemFunction().Call("user32::SendDlgItemMessageW", hWnd, 3100 + n, 48 /*WM_SETFONT*/, hGuiFont, 0);
          AkelPad.SystemFunction().Call("user32::SetDlgItemTextW", hWnd, 3100 + n, aLabel[i][k]);
          ++n;
        }
      }

      AkelPad.SystemFunction().Call("user32::SetFocus", AkelPad.SystemFunction().Call("user32::GetDlgItem", hWnd, 3002 + nFocus));
      AkelPad.SystemFunction().Call("user32::SendDlgItemMessageW", hWnd, 3002 + nFocus, 177 /*EM_SETSEL*/, 0, -1);

      hIcon = AkelPad.SystemFunction().Call("User32::LoadImageW",
        AkelPad.GetInstanceDll(), //hinst
        101,                      //lpszName
        1,                        //uType=IMAGE_ICON
        0,                        //cxDesired
        0,                        //cyDesired
        0x00000040);              //fuLoad=LR_DEFAULTSIZE
      AkelPad.SendMessage(hWnd, 0x0080 /*WM_SETICON*/, 0 /*ICON_SMALL*/, hIcon);

      AkelPad.MemFree(lpRect);
      break;

    case 273 : //WM_COMMAND
      if (wParam == 3000)
      {
        var lpFunc    = AkelPad.MemAlloc(512 + 524);
        var nEdits    = 0;
        var aEdit     = [];
        var nBadIndex = -1;
        var lpEdit;
        var sFunc;
        var vFuncArg;
        var oCheckFunction;
        var i;

        while ((nEdits < 98) && AkelPad.SystemFunction().Call("user32::GetDlgItem", hWnd, 3002 + nEdits))
          ++nEdits;

        lpEdit = AkelPad.MemAlloc(1024 * nEdits);

        for (i = 0; i < nEdits; ++i)
          AkelPad.SystemFunction().Call("user32::GetDlgItemTextW", hWnd, 3002 + i, lpEdit + 1024 * i, 512);

        AkelPad.SystemFunction().Call("user32::GetDlgItemTextW", hWnd, 2998, lpFunc, 256);

        if (sFunc = AkelPad.MemRead(lpFunc, 1 /*DT_UNICODE*/))
        {
          oCheckFunction = eval(sFunc);

          if (typeof oCheckFunction == "function")
          {
            for (i = 0; i < nEdits; ++i)
              aEdit[i] = AkelPad.MemRead(lpEdit + 1024 * i, 1 /*DT_UNICODE*/);

            AkelPad.SystemFunction().Call("user32::GetDlgItemTextW", hWnd, 2999, lpFunc + 512, 262);
            vFuncArg = AkelPad.MemRead(lpFunc + 512, 1 /*DT_UNICODE*/);

            if (vFuncArg.charAt(0) == "b")
              vFuncArg = Boolean(vFuncArg.substr(1));
            else if (vFuncArg.charAt(0) == "n")
              vFuncArg = Number(vFuncArg.substr(1));
            else if (vFuncArg.charAt(0) == "s")
              vFuncArg = vFuncArg.substr(1);
            else
              vFuncArg = undefined;

            nBadIndex = oCheckFunction(hWnd, aEdit, vFuncArg);

            if ((typeof nBadIndex != "number") || (nBadIndex >= nEdits))
              nBadIndex = -1;
          }
        }

        AkelPad.MemFree(lpFunc);

        if (nBadIndex < 0)
          AkelPad.SystemFunction().Call("user32::PostMessageW", hWnd, 16 /*WM_CLOSE*/, lpEdit, 0);
        else
        {
          AkelPad.MemFree(lpEdit);
          AkelPad.SystemFunction().Call("user32::SetFocus", AkelPad.SystemFunction().Call("user32::GetDlgItem", hWnd, 3002 + nBadIndex));
          AkelPad.SystemFunction().Call("user32::SendDlgItemMessageW", hWnd, 3002 + nBadIndex, 177 /*EM_SETSEL*/, 0, -1);
        }
      }

      else if ((wParam == 3001) || (wParam == 2 /*IDCANCEL*/))
        AkelPad.SystemFunction().Call("user32::PostMessageW", hWnd, 16 /*WM_CLOSE*/, 0, 0);
      break;

    case 16 : //WM_CLOSE
      AkelPad.SystemFunction().Call("user32::DestroyIcon", AkelPad.SendMessage(hWnd, 0x007F /*WM_GETICON*/, 0 /*ICON_SMALL*/, 0));
      AkelPad.SystemFunction().Call("user32::EndDialog", hWnd, wParam);
  }

  return 0;
}

function GetTextMaxWidth(hWnd, aText, hFont)
{
  var hDC    = AkelPad.SystemFunction().Call("user32::GetDC", hWnd);
  var lpSize = AkelPad.MemAlloc(8);
  var nWidth = 0;
  var i, k;

  if (hFont)
    AkelPad.SystemFunction().Call("Gdi32::SelectObject", hDC, hFont);

  AkelPad.SystemFunction().Call("Gdi32::SetMapMode", hDC, 1 /*MM_TEXT*/);

  for (i = 0; i < aText.length; ++i)
  {
    for (k = 0; k < aText[i].length; ++k)
    {
      AkelPad.SystemFunction().Call("Gdi32::GetTextExtentPoint32W", hDC, aText[i][k], aText[i][k].length, lpSize);

      if (nWidth < AkelPad.MemRead(lpSize, 3 /*DT_DWORD*/))
        nWidth = AkelPad.MemRead(lpSize, 3 /*DT_DWORD*/);
    }
  }

  AkelPad.SystemFunction().Call("user32::ReleaseDC", hWnd, hDC); 
  AkelPad.MemFree(lpSize);

  return nWidth;
}
