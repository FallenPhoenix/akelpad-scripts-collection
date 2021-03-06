Program SendData służy do wysyłania danych i naciśnięć klawiszy z otwartego
pliku tekstowego lub arkusza Excela do aktywnego okna innej aplikacji.
W szczególności może być przydatny do wypełniania tabel baz danych.

Do wysyłania danych wykorzystano metodę SendKeys obiektu WshShell:
http://msdn.microsoft.com/en-us/library/8c6yea83%28v=VS.85%29.aspx

W pliku źródłowym możemy wyróżnić dwa rodzaje pól:
- pola zawierające dane,
- pola zawierające klawisze sterujące i opóźnienia.

W pliku tekstowym, pola oddzielamy znakiem: ";", "|" lub TAB. W jednym pliku
należy stosować jeden rodzaj separatora pól.
W arkuszu Excela każde pole umieszczamy w oddzielnej komórce.

Pola danych mogą zawierać dowolny ciąg znaków, który zostanie wysłany do okna
docelowego. Jeśli pierwszym znakiem wysyłanego ciągu ma być backslash "\", to
należy taki ciąg poprzedzić dodatkowym znakiem backslash. Czyli żeby wysłać
"\AbC", należy użyć ciągu "\\AbC".

Pola klawiszy sterujących i opóźnień muszą zaczynać się pojedynczym znakiem
backslash "\".

W celu wysłania klawiszy specjalnych, należy posłużyć się symbolami według
poniższego zestawienia:
Ctrl       : *CTRL
Shift      : *SH
Alt        : *ALT
Enter      : *ENT
Esc        : *ESC
Insert     : *INS
Delete     : *DEL
BackSpace  : *BS
Tab        : *TAB
Down arrow : *DN
Up arrow   : *UP
Right arrow: *RT
Left arrow : *LT
Page Down  : *PGDN
Page Up    : *PGUP
End        : *END
Home       : *HOME
F1         : *F1
F2         : *F2
F3         : *F3
F4         : *F4
F5         : *F5
F6         : *F6
F7         : *F7
F8         : *F8
F9         : *F9
F10        : *F10
F11        : *F11
F12        : *F12
+          : *+
^          : *^
%          : *%
~          : *~
(          : *(
)          : *)
[          : *[
]          : *]
{          : *{
}          : *}

Łączenie klawiszy z Ctrl, Shift i Alt:
\*ALTaso
oznacza wciśnięcie klawisza A przy wciśniętym klawiszu Alt,
a następnie zwolnienie klawisza Alt i wciśnięcie kolejno S i O.
\*ALT(aso)
oznacza wciśnięcie kolejno klawiszy A, S, O przy wciśniętym klawiszu Alt.

Należy używać małych liter dla określenia klawiszy zwracających znak litery.

Opóźnienia:
*n
gdzie n oznacza opóźnienie w milisekundach (liczba całkowita), np:
\*2000 - wstrzymanie wysyłania danych przez 2 sekundy.

W jednym polu można łączyć klawisze i opóźnienia:
\*CTRL(vp)*500ALTw*100*F1*DN*TAB

Uwaga:
Opcja "Zapisz plik" dodatkowo zapisuje parametry ustawione w programie.
W przypadku pliku tekstowego, parametry są zapisywane w strumieniu plikowym NTFS
o nazwie "SendDataParameters". Jeśli system plików nie obsługuje strumieni, to
parametry nie są zapisywane.
W przypadku arkusza Excel, parametry są zapisywane jako komentarz w komórce A1.

Skróty klawiaturowe dostępne w oknie dialogowym programu:
Shift+Alt+Right, Left, Down, Up, End, Home, PgDn, PgUp, C - przesuwa okno,
Esc - zamyka program.
