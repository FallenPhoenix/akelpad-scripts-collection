// One or two-dimensional array sorting function - 2010-12-18
//
// Sorted by any field, ascending or descending order, by numbers or by strings.
// This function changes the original array.
// Here is an example of use:

// nField      0      1      2
var aArray = [["ZZZ", "ddd", "aaa"],
              ["999", "ZZZ", "0xF"],
              ["456", "aaa", "0xA"]];

Array2DSort(aArray, 0, 0, 1, 1)

WScript.Echo("Sorted array:" + "\n" + aArray[0] + "\n" + aArray[1] + "\n" + aArray[2]);

////////////////////////////////////////////////
// If nField < 0 - must be one-dimensional array
////////////////////////////////////////////////
function Array2DSort(aArr, nField, bDescending, bNumerical, bIgnoreCase)
{
  if (bNumerical)
  {
    if (bDescending)
    {
      if (nField < 0)
        aArr.sort(function(a, b) {
          if      (Number(a) < Number(b)) return 1;
          else if (Number(a) > Number(b)) return -1;
          else return 0; });
      else
        aArr.sort(function(a, b) {
          if      (Number(a[nField]) < Number(b[nField])) return 1;
          else if (Number(a[nField]) > Number(b[nField])) return -1;
          else return 0; });
    }
    else
    {
      if (nField < 0)
        aArr.sort(function(a, b) {
          if      (Number(a) < Number(b)) return -1;
          else if (Number(a) > Number(b)) return 1;
          else return 0; });
      else
        aArr.sort(function(a, b) {
          if      (Number(a[nField]) < Number(b[nField])) return -1;
          else if (Number(a[nField]) > Number(b[nField])) return 1;
          else return 0; });
    }
  }
  else
  {
    if (bDescending)
    {
      if (bIgnoreCase)
      {
        if (nField < 0)
          aArr.sort(function(a, b) {
            if      (String(a).toUpperCase() < String(b).toUpperCase()) return 1;
            else if (String(a).toUpperCase() > String(b).toUpperCase()) return -1;
            else return 0; });
        else
          aArr.sort(function(a, b) {
            if      (String(a[nField]).toUpperCase() < String(b[nField]).toUpperCase()) return 1;
            else if (String(a[nField]).toUpperCase() > String(b[nField]).toUpperCase()) return -1;
            else return 0; });
      }
      else
      {
        if (nField < 0)
          aArr.sort(function(a, b) {
            if      (String(a) < String(b)) return 1;
            else if (String(a) > String(b)) return -1;
            else return 0; });
        else
          aArr.sort(function(a, b) {
            if      (String(a[nField]) < String(b[nField])) return 1;
            else if (String(a[nField]) > String(b[nField])) return -1;
            else return 0; });
      }
    }
    else
    {
      if (bIgnoreCase)
      {
        if (nField < 0)
          aArr.sort(function(a, b) {
            if      (String(a).toUpperCase() < String(b).toUpperCase()) return -1;
            else if (String(a).toUpperCase() > String(b).toUpperCase()) return 1;
            else return 0; });
        else
          aArr.sort(function(a, b) {
            if      (String(a[nField]).toUpperCase() < String(b[nField]).toUpperCase()) return -1;
            else if (String(a[nField]).toUpperCase() > String(b[nField]).toUpperCase()) return 1;
            else return 0; });
      }
      else
      {
        if (nField < 0)
          aArr.sort(function(a, b) {
            if      (String(a) < String(b)) return -1;
            else if (String(a) > String(b)) return 1;
            else return 0; });
        else
          aArr.sort(function(a, b) {
            if      (String(a[nField]) < String(b[nField])) return -1;
            else if (String(a[nField]) > String(b[nField])) return 1;
            else return 0; });
      }
    }
  }
}
