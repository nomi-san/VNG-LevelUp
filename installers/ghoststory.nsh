Function .OnInstSuccess
  CreateShortCut "$INSTDIR\Level Up GhostStory.lnk" "$INSTDIR\Level Up.exe" "--downloadGameOnLaunch=226249373746831366 --installerName=$EXEFILE"
  Exec '"$WINDIR\explorer.exe" "$INSTDIR\Level Up GhostStory.lnk"'
FunctionEnd
