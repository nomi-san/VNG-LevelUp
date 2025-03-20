Function .OnInstSuccess
  CreateShortCut "$INSTDIR\Level Up.lnk" "$INSTDIR\Level Up.exe"
  Exec '"$WINDIR\explorer.exe" "$INSTDIR\Level Up.lnk"'
FunctionEnd
