// FileAndStream_functions.js - ver. 2013-04-07
//
// based on the article: http://www.flexhex.com/docs/articles/alternate-streams.phtml
//
// Contains functions:
// IsSupportStreams()
// IsDriveExists()
// IsDirExists()
// IsFileExists()
// IsStreamExists()
// GetFileAttr()
// FilePropertiesDialog()
// CreateFile()
// CopyFile()
// DeleteFile()
// RenameFile()
// WriteFile()
// EnumStreams()
//
// Usage in script:
// if (! AkelPad.Include("FileAndStream_functions.js")) WScript.Quit();

//------------------------------------------------------------
// bSupport = IsSupportStreams(sDrive)
//
// Argument:
// sDrive - drive name, eg. "D" or "D:" or "D:\"
//
// Return value:
// true if file system supports NTFS streams, otherwise false.
//------------------------------------------------------------
function IsSupportStreams(sDrive)
{
  var lpBuffer = AkelPad.MemAlloc(4);
  var bSupport = false;

  if (sDrive.length == 1)
    sDrive += ":";
  if (sDrive.length == 2)
    sDrive += "\\";

  AkelPad.SystemFunction().Call("kernel32::GetVolumeInformation" + _TCHAR, sDrive, 0, 0, 0, 0, lpBuffer, 0, 0);

  if (AkelPad.MemRead(lpBuffer, 3 /*DT_DWORD*/) & 0x00040000 /*FILE_NAMED_STREAMS*/)
    bSupport = true;

  AkelPad.MemFree(lpBuffer);

  return bSupport;
}

//----------------------------------------------
// bExists = IsDriveExists(sDrive)
//
// Argument:
// sDrive - drive name, eg. "D" or "D:" or "D:\"
//
// Return value:
// true if drive exists, otherwise false.
//----------------------------------------------
function IsDriveExists(sDrive)
{
  if (sDrive.length == 1)
    sDrive += ":";
  if (sDrive.length == 2)
    sDrive += "\\";

  return AkelPad.SystemFunction().Call("Kernel32::GetVolumeInformation" + _TCHAR, sDrive, 0, 0, 0, 0, 0, 0, 0);
}

//---------------------------------------------------
// nAttr = IsDirExists(sDir)
//
// Argument:
// sDir - full directory name, eg. "D:\Text\AkelPad",
//        "D:\Text\AkelPad\", "C:\", "C:", "..\"
//
// Return value:
// number that specifies the directory attributes,
// 0 - if directory does not exist.
//---------------------------------------------------
function IsDirExists(sDir)
{
  var nAttr = GetFileAttr(sDir);

  if (nAttr & 16 /*FILE_ATTRIBUTE_DIRECTORY*/)
    return nAttr;
  else
    return 0;
}

//----------------------------------------------
// nAttr = IsFileExists(sFile)
//
// Argument:
// sFile - full file name, eg. "D:\Text\abc.txt"
//
// Return value:
// number that specifies the file attributes,
// 0 - if file does not exist.
//----------------------------------------------
function IsFileExists(sFile)
{
  var nAttr = GetFileAttr(sFile);

  if (! (nAttr & 16 /*FILE_ATTRIBUTE_DIRECTORY*/))
    return nAttr;
  else
    return 0;
}

//-------------------------------------------------
// bExists = IsStreamExists(sFile, sStream)
//
// Arguments:
// sFile   - full file name, eg. "D:\Text\abc.txt"
// sStream - stream name
//
// Return value:
// true if sFile contains sStream, otherwise false.
//-------------------------------------------------
function IsStreamExists(sFile, sStream)
{
  var oSys    = AkelPad.SystemFunction();
  var hStream = oSys.Call("kernel32::CreateFile" + _TCHAR,
                          sFile + ":" + sStream, //lpFileName
                          0,  //dwDesiredAccess
                          3,  //dwShareMode = FILE_SHARE_READ|FILE_SHARE_WRITE
                          0,  //lpSecurityAttributes
                          3,  //dwCreationDisposition = OPEN_EXISTING
                          0,  //dwFlagsAndAttributes
                          0); //hTemplateFile

  if (hStream != -1) //INVALID_HANDLE_VALUE
  {
    oSys.Call("kernel32::CloseHandle", hStream);
    return true;
  }
  else
    return false;
}

//-----------------------------------------------------------------------
// nAttr = GetFileAttr(sFile)
//
// Argument:
// sFile - full file or directory name, eg. "D:\Text\abc.txt"
//
// Return value:
// number that specifies the attributes (msdn: File Attribute Constants),
// 0 - if file/directory does not exist.
//-----------------------------------------------------------------------
function GetFileAttr(sFile)
{
  var nAttr = AkelPad.SystemFunction().Call("kernel32::GetFileAttributes" + _TCHAR, sFile);
  var lpBuffer;
  var hFindFile;

  if (nAttr == -1 /*INVALID_FILE_ATTRIBUTES*/)
  {
    if (sFile.slice(-1) == "\\")
      sFile = sFile.slice(0, -1);

    lpBuffer  = AkelPad.MemAlloc(44 + 260 * _TSIZE + 14 * _TSIZE); //sizeof(WIN32_FIND_DATA)
    hFindFile = AkelPad.SystemFunction().Call("kernel32::FindFirstFile" + _TCHAR, sFile, lpBuffer);

    if (hFindFile == -1) //INVALID_HANDLE_VALUE
      nAttr = 0;
    else
    {
      nAttr = AkelPad.MemRead(lpBuffer, 3 /*DT_DWORD*/);
      AkelPad.SystemFunction().Call("kernel32::FindClose", hFindFile);
    }

    AkelPad.MemFree(lpBuffer);
  }

  return nAttr;
}

//------------------------------------------------------------
// Display dialog box with file, directory or drive properties
// FilePropertiesDialog(sFile, hWnd)
//
// Arguments:
// sFile - full file/directory name, eg. "D:\Text\abc.txt"
//         or drive name, eg. "D:"
// hWnd - optional, a handle to the parent window
//
// Return value:
// true if successful, otherwise false.
//------------------------------------------------------------
function FilePropertiesDialog(sFile, hWnd)
{
  var sVerb     = "properties";
  var nInfoSize = 15 * 4;
  var lpInfo    = AkelPad.MemAlloc(nInfoSize); //SHELLEXECUTEINFO
  var lpVerb    = AkelPad.MemAlloc((sVerb.length + 1) * _TSIZE);
  var lpFile    = AkelPad.MemAlloc((sFile.length + 1) * _TSIZE);
  var bSuccess  = false;

  AkelPad.MemCopy(lpVerb, sVerb, _TSTR);
  AkelPad.MemCopy(lpFile, sFile, _TSTR);

  AkelPad.MemCopy(lpInfo, nInfoSize, 3 /*DT_DWORD*/); //cbSize
  AkelPad.MemCopy(lpInfo + 4, 0x0000000C /*SEE_MASK_INVOKEIDLIST*/, 3 /*DT_DWORD*/); //fMask
  if (hWnd)
    AkelPad.MemCopy(lpInfo + 8, hWnd, 3 /*DT_DWORD*/); //hwnd
  AkelPad.MemCopy(lpInfo + 12, lpVerb, 3 /*DT_DWORD*/); //lpVerb
  AkelPad.MemCopy(lpInfo + 16, lpFile, 3 /*DT_DWORD*/); //lpFile
  AkelPad.MemCopy(lpInfo + 28, 5 /*SW_SHOW*/, 3 /*DT_DWORD*/); //nShow

  if (AkelPad.SystemFunction().Call("Shell32::ShellExecuteEx" + _TCHAR, lpInfo))
    bSuccess = true;

  AkelPad.MemFree(lpInfo);
  AkelPad.MemFree(lpVerb);
  AkelPad.MemFree(lpFile);

  return bSuccess;
}

//-------------------------------------------------------
// Create new file or NTFS stream
// bCreated = CreateFile(sFile[, sStream])
//
// Arguments:
// sFile   - full file name, eg. "D:\Text\abc.txt"
// sStream - stream name, optional
//
// Return value:
// true if sFile or sStream was created, otherwise false.
//-------------------------------------------------------
function CreateFile(sFile, sStream)
{
  var oSys    = AkelPad.SystemFunction();
  var hStream = oSys.Call("kernel32::CreateFile" + _TCHAR,
                          sFile + ((sStream) ? (":" + sStream) : ""), //lpFileName
                          0,  //dwDesiredAccess
                          3,  //dwShareMode = FILE_SHARE_READ|FILE_SHARE_WRITE
                          0,  //lpSecurityAttributes
                          1,  //dwCreationDisposition = CREATE_NEW
                          0,  //dwFlagsAndAttributes
                          0); //hTemplateFile

  if (hStream != -1) //INVALID_HANDLE_VALUE
  {
    oSys.Call("kernel32::CloseHandle", hStream);
    return true;
  }
  else
    return false;
}

//------------------------------------------------------------------------
// Copy/move file, directory or NTFS stream
// bCopied = CopyFile(sFromFile, sFromStream, sToFile, sToStream[, bMove])
//
// Arguments:
// sFromFile   - source file or directory full name
// sFromStream - source stream name, if the operation is not performed
//               on the stream may be zero, null or empty string
// sToFile     - target file or directory full name
// sToStream   - target stream name, if the operation is not performed
//               on the stream may be zero, null or empty string
// bMove       - if true, after copying the source will be deleted
//
// Return value:
// true if file/directory/stream was copied/moved, otherwise false.
//-------------------------------------------------------------------------
function CopyFile(sFromFile, sFromStream, sToFile, sToStream, bMove)
{
  var oSys = AkelPad.SystemFunction();
  var bCopied;

  if (sFromStream || sToStream)
  {
    var nAttr = GetFileAttr(sToFile);
    if (nAttr & 1 /*FILE_ATTRIBUTE_READONLY*/)
      oSys.Call("kernel32::SetFileAttributes" + _TCHAR, sToFile, nAttr ^ 1);

    var hFromFile = oSys.Call("kernel32::CreateFile" + _TCHAR,
                              sFromFile + ((sFromStream) ? (":" + sFromStream) : ""), //lpFileName
                              0x80000000, //dwDesiredAccess = GENERIC_READ
                              1,          //dwShareMode = FILE_SHARE_READ
                              0,          //lpSecurityAttributes
                              3,          //dwCreationDisposition = OPEN_EXISTING
                              0x08000000, //dwFlagsAndAttributes = FILE_FLAG_SEQUENTIAL_SCAN
                              0);         //hTemplateFile
    var hToFile = oSys.Call("kernel32::CreateFile" + _TCHAR,
                            sToFile + ((sToStream) ? (":" + sToStream) : ""), //lpFileName
                            0x40000000, //dwDesiredAccess = GENERIC_WRITE
                            1,          //dwShareMode = FILE_SHARE_READ
                            0,          //lpSecurityAttributes
                            2,          //dwCreationDisposition = CREATE_ALWAYS
                            0x08000080, //dwFlagsAndAttributes = FILE_FLAG_SEQUENTIAL_SCAN|FILE_ATTRIBUTE_NORMAL
                            0);         //hTemplateFile

    if ((hFromFile != -1) && (hToFile != -1)) //INVALID_HANDLE_VALUE
    {
      var nBufSize       = 64 * 1024;
      var lpBuffer       = AkelPad.MemAlloc(nBufSize);
      var lpBytesRead    = AkelPad.MemAlloc(4);
      var lpBytesWritten = AkelPad.MemAlloc(4);

      bCopied = true;

      do
      {
        oSys.Call("kernel32::ReadFile", hFromFile, lpBuffer, nBufSize, lpBytesRead, 0);

        if (AkelPad.MemRead(lpBytesRead, 3 /*DT_DWORD*/))
        {
          if (! oSys.Call("kernel32::WriteFile", hToFile, lpBuffer, AkelPad.MemRead(lpBytesRead, 3 /*DT_DWORD*/), lpBytesWritten, 0))
          {
            bCopied = false;
            break;
          }
        }
      }
      while (AkelPad.MemRead(lpBytesRead, 3 /*DT_DWORD*/) == nBufSize);

      AkelPad.MemFree(lpBuffer);
      AkelPad.MemFree(lpBytesRead);
      AkelPad.MemFree(lpBytesWritten);
    }
    else
      bCopied = false;

    oSys.Call("kernel32::CloseHandle", hFromFile);
    oSys.Call("kernel32::CloseHandle", hToFile);

    if (nAttr & 1 /*FILE_ATTRIBUTE_READONLY*/)
      oSys.Call("kernel32::SetFileAttributes" + _TCHAR, sToFile, nAttr);

    if (bMove && bCopied)
      DeleteFile(sFromFile, sFromStream);
  }

  else
  {
    var lpFromFile = AkelPad.MemAlloc((sFromFile.length + 2) * _TSIZE);
    var lpToFile   = AkelPad.MemAlloc((sToFile.length + 2) * _TSIZE);
    var lpBuffer   = AkelPad.MemAlloc(32); //sizeof(SHFILEOPSTRUCT)

    AkelPad.MemCopy(lpFromFile, sFromFile, _TSTR);
    AkelPad.MemCopy(lpToFile, sToFile, _TSTR);

    //wFunc = FO_MOVE or FO_COPY
    AkelPad.MemCopy(lpBuffer + 4, (bMove ? 1 : 2), 3 /*DT_DWORD*/);
    //pFrom = lpFromFile
    AkelPad.MemCopy(lpBuffer + 8, lpFromFile, 3 /*DT_DWORD*/);
    //pTo = lpToFile
    AkelPad.MemCopy(lpBuffer + 12, lpToFile, 3 /*DT_DWORD*/);
    //fFlags = FOF_NOERRORUI|FOF_NOCONFIRMATION|FOF_SILENT
    AkelPad.MemCopy(lpBuffer + 16, 0x0400 | 0x0010 | 0x0004, 3 /*DT_DWORD*/);

    bCopied = ! oSys.Call("Shell32::SHFileOperation" + _TCHAR, lpBuffer);

    AkelPad.MemFree(lpFromFile);
    AkelPad.MemFree(lpToFile);
    AkelPad.MemFree(lpBuffer);
  }

  return bCopied;
}

//---------------------------------------------------------------
// Delete file, directory or NTFS stream
// bDeleted = DeleteFile(sFile, sStream, bRecBin)
//
// Arguments:
// sFile   - full file or directory name, eg. "D:\Text\abc.txt"
// sStream - stream name, can be null or empty string
// bRecBin - if true, file or directory is deleted to Recycle Bin
//
// Return value:
// true if file/directory/stream was deleted, otherwise false.
//---------------------------------------------------------------
function DeleteFile(sFile, sStream, bRecBin)
{
  var oSys = AkelPad.SystemFunction();
  var bDeleted;

  if (sStream)
  {
    var nAttr = GetFileAttr(sFile);

    if (nAttr & 1 /*FILE_ATTRIBUTE_READONLY*/)
      oSys.Call("kernel32::SetFileAttributes" + _TCHAR, sFile, nAttr ^ 1);

    bDeleted = AkelPad.SystemFunction().Call("kernel32::DeleteFile" + _TCHAR, sFile + ":" + sStream);

    if (nAttr & 1 /*FILE_ATTRIBUTE_READONLY*/)
      oSys.Call("kernel32::SetFileAttributes" + _TCHAR, sFile, nAttr);
  }

  else
  {
    var lpBuffer = AkelPad.MemAlloc(32); //sizeof(SHFILEOPSTRUCT)
    var lpFrom   = AkelPad.MemAlloc((sFile.length + 2) * _TSIZE);
    var nFlag    = 0x0400 | 0x0010 | 0x0004; //FOF_NOERRORUI|FOF_NOCONFIRMATION|FOF_SILENT

    if (bRecBin)
      nFlag |= 0x0040; //FOF_ALLOWUNDO

    AkelPad.MemCopy(lpFrom, sFile, _TSTR);

    //wFunc = FO_DELETE
    AkelPad.MemCopy(lpBuffer + 4, 3, 3 /*DT_DWORD*/);
    //pFrom = lpFrom
    AkelPad.MemCopy(lpBuffer + 8, lpFrom, 3 /*DT_DWORD*/);
    //fFlags = nFlag
    AkelPad.MemCopy(lpBuffer + 16, nFlag, 3 /*DT_DWORD*/);

    bDeleted = ! oSys.Call("Shell32::SHFileOperation" + _TCHAR, lpBuffer);

    AkelPad.MemFree(lpBuffer);
    AkelPad.MemFree(lpFrom);
  }

  return bDeleted;
}

//--------------------------------------------------------------
// Rename file, directory or NTFS stream
// bRenamed = RenameFile(sFile, sStream, sNewName)
//
// Arguments:
// sFile    - full file or directory name, eg. "D:\Text\abc.txt"
// sStream  - stream name, if the operation is not performed
//            on the stream it may be zero, null or empty string
// sNewName - new name of file/directory/stream, without path
//
// Return value:
// true if file/directory/stream was renamed, otherwise false.
//--------------------------------------------------------------
function RenameFile(sFile, sStream, sNewName)
{
  var bRenamed;

  if (sStream)
    bRenamed = CopyFile(sFile, sStream, sFile, sNewName, 1);
  else
    bRenamed = AkelPad.SystemFunction().Call("kernel32::MoveFile" + _TCHAR, sFile, sFile.substr(0, sFile.lastIndexOf("\\") + 1) + sNewName);

  return bRenamed;
}

//-----------------------------------------------------
// Write file or NTFS stream
// bWritten = WriteFile(sFile, sStream, sData, nType)
//
// Arguments:
// sFile   - full file name, eg. "D:\Text\abc.txt"
// sStream - stream name, can be null or empty string
// sData   - text data to write
// nType   - type of the sData parameter:
//           0 - ANSI
//           1 - UNICODE
//
// Return value:
// bWritten - true if the function succeeds.
//-----------------------------------------------------
function WriteFile(sFile, sStream, sData, nType)
{
  var oSys     = AkelPad.SystemFunction();
  var nAttr    = GetFileAttr(sFile);
  var bWritten = false;
  var hFile;
  var nDisposition;
  var nBufSize;
  var lpBuffer;
  var lpNumBytes;

  if (nAttr)
  {
    nDisposition = 5; //TRUNCATE_EXISTING

    if (nAttr & 1 /*FILE_ATTRIBUTE_READONLY*/)
      oSys.Call("kernel32::SetFileAttributes" + _TCHAR, sFile, nAttr ^ 1);
  }
  else
    nDisposition = 1; //CREATE_NEW

  hFile = oSys.Call("kernel32::CreateFile" + _TCHAR,
                    sFile + ((sStream) ? (":" + sStream) : ""), //lpFileName
                    0x40000000,   //dwDesiredAccess = GENERIC_WRITE
                    3,            //dwShareMode = FILE_SHARE_READ|FILE_SHARE_WRITE
                    0,            //lpSecurityAttributes
                    nDisposition, //dwCreationDisposition
                    0,            //dwFlagsAndAttributes
                    0);           //hTemplateFile

  if (hFile != -1) //INVALID_HANDLE_VALUE
  {
    nBufSize = sData.length + 1;
    if (nType)
      nBufSize = 2 + nBufSize * 2;

    lpBuffer   = AkelPad.MemAlloc(nBufSize);
    lpNumBytes = AkelPad.MemAlloc(4);

    if (nType)
    {
      //BOM UTF-16LE
      AkelPad.MemCopy(lpBuffer,     0xFF, 5 /*DT_BYTE*/);
      AkelPad.MemCopy(lpBuffer + 1, 0xFE, 5 /*DT_BYTE*/);
      AkelPad.MemCopy(lpBuffer + 2, sData, nType);
    }
    else
      AkelPad.MemCopy(lpBuffer, sData, nType);

    bWritten = oSys.Call("kernel32::WriteFile",
                         hFile,                //hFile
                         lpBuffer,             //lpBuffer
                         nBufSize - 1 - nType, //nNumberOfBytesToWrite
                         lpNumBytes,           //lpNumberOfBytesWritten
                         0);                   //lpOverlapped
  
    oSys.Call("kernel32::CloseHandle", hFile);

    AkelPad.MemFree(lpBuffer);
    AkelPad.MemFree(lpNumBytes);
  }

  if (nAttr & 1 /*FILE_ATTRIBUTE_READONLY*/)
    oSys.Call("kernel32::SetFileAttributes" + _TCHAR, sFile, nAttr);

  return bWritten;
}

//-----------------------------------------------------------
// aStream = EnumStreams(sFile)
//
// Argument:
// sFile - full file or directory name, eg. "D:\Text\abc.txt"
//
// Return value:
// Array. Each element of array is two-elements array,
// contains information about a single stream:
// aStream[n][0] - stream name,
// aStream[n][1] - stream size in bytes.
//-----------------------------------------------------------
function EnumStreams(sFile)
{
  var oSys    = AkelPad.SystemFunction();
  var aStream = [];
  var nVerLen = 4 * 5 + 128 * _TSIZE;
  var lpOsVer = AkelPad.MemAlloc(nVerLen);
  var nMajorVer;
  var nMinorVer;
  var sStreamName;
  var nStreamSize;

  //Get system version
  AkelPad.MemCopy(lpOsVer, nVerLen, 3 /*DT_DWORD*/);
  oSys.Call("kernel32::GetVersionEx" + _TCHAR, lpOsVer);
  nMajorVer = AkelPad.MemRead(lpOsVer + 4, 3 /*DT_DWORD*/);
  nMinorVer = AkelPad.MemRead(lpOsVer + 8, 3 /*DT_DWORD*/);
  AkelPad.MemFree(lpOsVer);

  //Win-Vista+, Win-Server-2003+
  if ((nMajorVer > 5) || ((nMajorVer == 5) && (nMinorVer >= 2)))
  {
    var lpFindStream = AkelPad.MemAlloc(8 + (260 + 36) * 2);
    var hFindStream  = oSys.Call("kernel32::FindFirstStreamW", sFile, 0 /*FindStreamInfoStandard*/, lpFindStream, 0);

    if (hFindStream != -1) //INVALID_HANDLE_VALUE
    {
      do
      {
        sStreamName = AkelPad.MemRead(lpFindStream + 8, 1 /*DT_UNICODE*/);
        sStreamName = sStreamName.substring(1, sStreamName.lastIndexOf(":"));
        nStreamSize = GetStreamSize(lpFindStream);

        aStream[aStream.length] = [sStreamName, nStreamSize];
      }
      while(oSys.Call("kernel32::FindNextStreamW", hFindStream, lpFindStream));
    }

    oSys.Call("kernel32::FindClose", hFindStream);
    AkelPad.MemFree(lpFindStream);
  }

  //Win-XP
  else
  {
    var nInfoLen = 65536;
    var lpInfo   = AkelPad.MemAlloc(nInfoLen);
    var lpStatus = AkelPad.MemAlloc(8);
    var nFlag    = 0;
    var hFile;
    var lpElement;
    var nNextOffset;
    var nNameLength;

    if (IsDirExists(sFile))
    {
      var lpToken     = AkelPad.MemAlloc(4);
      var lpPrivilege = AkelPad.MemAlloc(16);
      var hToken;

      oSys.Call("Advapi32::OpenProcessToken", oSys.Call("Kernel32::GetCurrentProcess"), 0x0020 /*TOKEN_ADJUST_PRIVILEGES*/, lpToken);
      hToken = AkelPad.MemRead(lpToken, 3 /*DT_DWORD*/);

      AkelPad.MemCopy(lpPrivilege, 1, 3 /*DT_DWORD*/); //PrivilegeCount
      AkelPad.MemCopy(lpPrivilege + 12, 2 /*SE_PRIVILEGE_ENABLED*/, 3 /*DT_DWORD*/); //Attributes

      oSys.Call("Advapi32::LookupPrivilegeValue" + _TCHAR, 0, "SeBackupPrivilege", lpPrivilege + 4);
      oSys.Call("Advapi32::AdjustTokenPrivileges", hToken, 0, lpPrivilege, 16, 0, 0);

      oSys.Call("kernel32::CloseHandle", hToken);
      AkelPad.MemFree(lpToken);
      AkelPad.MemFree(lpPrivilege);

      nFlag = 0x02000000; //FILE_FLAG_BACKUP_SEMANTICS
    }

    hFile = oSys.Call("kernel32::CreateFile" + _TCHAR,
                      sFile, //lpFileName
                      0,     //dwDesiredAccess
                      3,     //dwShareMode = FILE_SHARE_READ|FILE_SHARE_WRITE
                      0,     //lpSecurityAttributes
                      3,     //dwCreationDisposition = OPEN_EXISTING
                      nFlag, //dwFlagsAndAttributes
                      0);    //hTemplateFile

    if (hFile != -1) //INVALID_HANDLE_VALUE
    {
      oSys.Call("ntdll::NtQueryInformationFile",
                hFile,    //FileHandle
                lpStatus, //IoStatusBlock
                lpInfo,   //FileInformation
                nInfoLen, //Length
                22);      //FileInformationClass:FileStreamInformation
                // http://msdn.microsoft.com/en-us/library/cc232090%28v=prot.13%29.aspx

      lpElement   = lpInfo;
      nNextOffset = 0;

      do
      {
        lpElement += nNextOffset;

        if (nNameLength = AkelPad.MemRead(lpElement + 4, 3 /*DT_DWORD*/))
        {
          sStreamName = AkelPad.MemRead(lpElement + 24, 1 /*DT_UNICODE*/, nNameLength / 2);
          sStreamName = sStreamName.substring(1, sStreamName.lastIndexOf(":"));
          nStreamSize = GetStreamSize(lpElement + 8);

          aStream[aStream.length] = [sStreamName, nStreamSize];
        }
      }
      while (nNextOffset = AkelPad.MemRead(lpElement, 3 /*DT_DWORD*/));

      oSys.Call("kernel32::CloseHandle", hFile);
    }

    AkelPad.MemFree(lpInfo);
    AkelPad.MemFree(lpStatus);
  }

  return aStream;

  function GetStreamSize(lpBuffer)
  {
    var sNum = "";
    var sByte;
    var i;

    for (i = 0; i < 8; ++i)
    {
      sByte = AkelPad.MemRead(lpBuffer + i, 5 /*DT_BYTE*/).toString(16);
      if (sByte.length == 1)
        sByte = "0" + sByte;

      sNum = sByte + sNum;
    }

    return parseInt("0x" + sNum);
  }
}
