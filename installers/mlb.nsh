Function .OnInstSuccess
  CreateShortCut "$INSTDIR\Level Up MLB.lnk" "$INSTDIR\Level Up.exe" "--downloadGameOnLaunch=226249373746831367 --installerName=$EXEFILE"
  Exec '"$WINDIR\explorer.exe" "$INSTDIR\Level Up MLB.lnk"'
FunctionEnd
