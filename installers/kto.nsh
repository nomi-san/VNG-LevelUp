Function .OnInstSuccess
  CreateShortCut "$INSTDIR\Level Up KTO.lnk" "$INSTDIR\Level Up.exe" "--downloadGameOnLaunch=226249373746831566 --installerName=$EXEFILE"
  Exec '"$WINDIR\explorer.exe" "$INSTDIR\Level Up KTO.lnk"'
FunctionEnd
