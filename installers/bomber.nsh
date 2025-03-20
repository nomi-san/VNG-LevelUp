Function .OnInstSuccess
  CreateShortCut "$INSTDIR\Level Up Bomber.lnk" "$INSTDIR\Level Up.exe" "--downloadGameOnLaunch=226249373746831466--installerName=$EXEFILE"
  Exec '"$WINDIR\explorer.exe" "$INSTDIR\Level Up Bomber.lnk"'
FunctionEnd
