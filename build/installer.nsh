
!include LogicLib.nsh

!macro customInstall
  ${ifNot} ${isUpdated}

    File "${BUILD_RESOURCES_DIR}\installers\ViGEmBusSetup_x64.msi"
    ExecWait 'msiexec /i ViGEmBusSetup_x64.msi /qb'
  ${endIf}
!macroend

#!macro customUnInstall
#  ${ifNot} ${isUpdated}
#    MessageBox MB_YESNO "Would you like to remove the Nefarius Virtual Gamepad Emulaton Bus Driver?" IDYES true IDNO false
#    true:
#      File "${BUILD_RESOURCES_DIR}\installers\ViGEmBusSetup_x64.msi"
#      ExecWait 'msiexec /x ViGEmBusSetup_x64.msi /qb'
#    false:
#  ${endIf}
#!macroend