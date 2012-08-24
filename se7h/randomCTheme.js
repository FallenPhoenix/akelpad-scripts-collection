/// Random Color Theme v0.1
// (с) se7h
//
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=14069#14069
//
// Usage in Toolbar/ContextMenu plugin:
// -"Randomly color theme" Call("Scripts::Main", 1, "randomCTheme.js") Icon("pathToAnyIcon")

var themes = ["Default",
              "Active4D",
              "Bespin",
              "Cobalt",
              "Dawn",
              "Earth",
              "iPlastic",
              "Lazy",
              "Mac Classic",
              "Monokai",
              "Solarized Light",
              "Solarized Dark",
              "SpaceCadet",
              "Sunburst",
              "Twilight",
              "Zenburn"];


var edit = AkelPad.GetEditWnd();

if (edit && AkelPad.IsPluginRunning("Coder::Highlight")){
	var r = getRandomInt(0, themes.length-1);

	AkelPad.Call("Coder::Settings", 5, themes[r]);
}


function getRandomInt(min, max){
	return Math.floor(Math.random() * (max - min + 1)) + min;
}