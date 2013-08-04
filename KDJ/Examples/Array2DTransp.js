// Two-dimensional array transposition function - 2010-12-18
//
// Here is an example of use:

var aArray = [["aaa", "bbb", "ccc"],
              ["111", "222", "333"],
              ["ddd", "eee", "fff"],
              ["444", "555", "666"],
              ["ggg", "hhh", "iii"]];

var aArray1 = Array2DTransp(aArray);

WScript.Echo("Array after transposition:" + "\n" + aArray1[0] + "\n" + aArray1[1] + "\n" + aArray1[2]);


////////////////////////////////////////////////
function Array2DTransp(aArr)
{
  var nLen1 = aArr.length;
  var nLen2 = aArr[0].length;
  var aArr2 = [];
  var i, n;

  aArr2.length = nLen2;

  for (n = 0; n < nLen2; ++n)
  {
    aArr2[n] = [];
    for (i = 0; i < nLen1; ++i)
    {
      aArr2[n].push(aArr[i][n]);
    }
  }

  return aArr2;
}
