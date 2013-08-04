// One-dimensional text array sorting function - 2010-12-18
//
// Sorted by key from nStart to nEnd character in string.
// This function changes the original array.
// Here is an example of use:

var aArray = ["ZZZdddaaa",
              "456aaa0xAcla",
              "999ZZZ0xF"];

ArrayTextSort(aArray, 9, 10, 1, 0, 0)

WScript.Echo("Sorted array:" + "\n" + aArray[0] + "\n" + aArray[1] + "\n" + aArray[2]);


////////////////////////////////////////////////
function ArrayTextSort(aArr, nStart, nEnd, bDescending, bNumerical, bIgnoreCase)
{
  if (bNumerical)
  {
    if (bDescending)
    {
      aArr.sort(function(a, b) {
        if      (Number(a.substring(nStart, nEnd)) < Number(b.substring(nStart, nEnd))) return 1;
        else if (Number(a.substring(nStart, nEnd)) > Number(b.substring(nStart, nEnd))) return -1;
        else return 0; });
    }
    else
    {
      aArr.sort(function(a, b) {
        if      (Number(a.substring(nStart, nEnd)) < Number(b.substring(nStart, nEnd))) return -1;
        else if (Number(a.substring(nStart, nEnd)) > Number(b.substring(nStart, nEnd))) return 1;
        else return 0; });
    }
  }
  else
  {
    if (bDescending)
    {
      if (bIgnoreCase)
      {
        aArr.sort(function(a, b) {
          if      (a.substring(nStart, nEnd).toUpperCase() < b.substring(nStart, nEnd).toUpperCase()) return 1;
          else if (a.substring(nStart, nEnd).toUpperCase() > b.substring(nStart, nEnd).toUpperCase()) return -1;
          else return 0; });
      }
      else
      {
        aArr.sort(function(a, b) {
          if      (a.substring(nStart, nEnd) < b.substring(nStart, nEnd)) return 1;
          else if (a.substring(nStart, nEnd) > b.substring(nStart, nEnd)) return -1;
          else return 0; });
      }
    }
    else
    {
      if (bIgnoreCase)
      {
        aArr.sort(function(a, b) {
          if      (a.substring(nStart, nEnd).toUpperCase() < b.substring(nStart, nEnd).toUpperCase()) return -1;
          else if (a.substring(nStart, nEnd).toUpperCase() > b.substring(nStart, nEnd).toUpperCase()) return 1;
          else return 0; });
      }
      else
      {
        aArr.sort(function(a, b) {
          if      (a.substring(nStart, nEnd) < b.substring(nStart, nEnd)) return -1;
          else if (a.substring(nStart, nEnd) > b.substring(nStart, nEnd)) return 1;
          else return 0; });
      }
    }
  }
}
