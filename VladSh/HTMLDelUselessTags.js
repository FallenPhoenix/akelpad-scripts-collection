///Remove unnecessary (heavier page) HTML tags
///Удаление ненужных (перегружающих страницу) тегов HTML
// http://akelpad.sourceforge.net/forum/viewtopic.php?p=1994#1994
// Version: 3.5 (2011.03.22)

if (! AkelPad.Include("selCompleteLine.js")) WScript.Quit();
oCh.runWithRedraw();


function process()
{
   oCh.Text = oCh.getSelTextAll();
   
   oCh.Text = oStr.cleanbyBorders(oCh.Text, '<script', '\\/script>');
   oCh.Text = oStr.cleanbyBorders(oCh.Text, '<link', '>');
   oCh.Text = oStr.cleanbyBorders(oCh.Text, '<img', '>');
   oCh.Text = oStr.cleanbyBorders(oCh.Text, '<span', '>');
   oCh.Text = oStr.cleanbyBorders(oCh.Text, '<\\/span', '>');
   oCh.Text = oStr.cleanbyBorders(oCh.Text, '<body ', '>');
   oCh.Text = oStr.cleanbyBorders(oCh.Text, '<noscript>', '<\\/noscript>');
   oCh.Text = oStr.cleanbyBorders(oCh.Text, '<form method="get"', '\\/form>');
   oCh.Text = oStr.cleanbyBorders(oCh.Text, '<iframe', 'iframe>');
   oCh.Text = oStr.cleanbyBorders(oCh.Text, '<form method="post"', '>');
   oCh.Text = oStr.cleanbyBorders(oCh.Text, '<\\/form', '>');
   oCh.Text = oStr.cleanbyBorders(oCh.Text, '<select', '\\/select>');
   oCh.Text = oStr.cleanbyBorders(oCh.Text, '<input', '>');
   oCh.Text = oStr.cleanbyBorders(oCh.Text, '<a href="#top"', '\\/a>');
   oCh.Text = oStr.cleanbyBorders(oCh.Text, '<a name', '\\/a>');
   oCh.Text = oStr.cleanbyBorders(oCh.Text, '<a href="profile', '\\/a>');
   oCh.Text = oStr.cleanbyBorders(oCh.Text, '<a href="privmsg', '\\/a>');
   oCh.Text = oStr.cleanbyBorders(oCh.Text, '<a href="posting', '\\/a>');
   oCh.Text = oStr.cleanbyBorders(oCh.Text, '<a class="maintitle', '\\/a>');
   oCh.Text = oStr.cleanbyBorders(oCh.Text, '<a href="javascript', '>');
   oCh.Text = oStr.cleanbyBorders(oCh.Text, '<a href="viewtopic', '\\/a>');
   
   oCh.Text = oCh.Text.replace(/\r{3,}/gm, '\r\r');	//гасим ненужные переводы строк
}