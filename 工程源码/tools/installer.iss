; Script generated for Inno Setup 6
#define MyAppName "AstraFlux-HUB"
#define MyAppVersion "1.1.2"
#define MyAppPublisher "Kutaze"
#define MyAppURL "https://github.com/Kutaze/AstraFlux-Hub"
#define MyAppExeName "AstraFlux-HUB.exe"
#define MyAppSourceDir "..\..\软件本体"

[Setup]
; NOTE: The value of AppId uniquely identifies this application.
AppId={{E6B5D71C-6B3A-4F91-9F95-3129486260B1}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={autopf}\{#MyAppName}
DisableProgramGroupPage=yes
OutputDir=..\..\安装包\V1.1.2
OutputBaseFilename=AstraFlux-HUB_Setup_v1.1.2
SetupIconFile=..\electron\icon.ico
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
CloseApplications=force
UninstallDisplayIcon={app}\{#MyAppExeName}
PrivilegesRequiredOverridesAllowed=commandline dialog

[Languages]
Name: "chinesesimplified"; MessagesFile: "compiler:Languages\ChineseSimplified.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"
Name: "startmenuicon"; Description: "创建开始菜单快捷方式(&S)"; GroupDescription: "{cm:AdditionalIcons}"

[Files]
Source: "{#MyAppSourceDir}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs; Excludes: "locales\*"
Source: "{#MyAppSourceDir}\locales\zh-CN.pak"; DestDir: "{app}\locales"; Flags: ignoreversion
Source: "{#MyAppSourceDir}\locales\zh-TW.pak"; DestDir: "{app}\locales"; Flags: ignoreversion
Source: "{#MyAppSourceDir}\locales\en-US.pak"; DestDir: "{app}\locales"; Flags: ignoreversion

[Icons]
Name: "{autoprograms}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: startmenuicon
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent
