using System;
using System.IO;
using System.IO.Compression;
using System.Diagnostics;
using System.Reflection;
using System.Windows.Forms;
using System.Drawing;
using System.Drawing.Drawing2D;
using Microsoft.Win32;

namespace AstraFluxHubInstaller
{
    static class Program
    {
        public const string AppName = "AstraFlux-HUB";
        public const string AppDisplayName = "AstraFlux-HUB (星流驱动)";
        public const string AppVersion = "1.1.2";

        [STAThread]
        static void Main(string[] args)
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            bool isSilent = false;
            foreach (var arg in args)
            {
                if (arg.Equals("/S", StringComparison.OrdinalIgnoreCase) || arg.Equals("--silent", StringComparison.OrdinalIgnoreCase))
                {
                    isSilent = true;
                }
            }

            if (isSilent)
            {
                DoSilentInstall();
                return;
            }

            Application.Run(new ModernSetupWizardForm());
        }

        public static string GetDefaultInstallDir()
        {
            try
            {
                using (RegistryKey key = Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Uninstall\AstraFlux-HUB"))
                {
                    if (key != null)
                    {
                        object loc = key.GetValue("InstallLocation");
                        if (loc != null && !string.IsNullOrEmpty(loc.ToString()))
                        {
                            return loc.ToString();
                        }
                    }
                }
            }
            catch { }

            string localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
            return Path.Combine(localAppData, "Programs", "AstraFlux-HUB");
        }

        public static void CreateShortcut(string targetPath, string shortcutPath, string description)
        {
            try
            {
                Type shellType = Type.GetTypeFromProgID("WScript.Shell");
                if (shellType == null) return;
                dynamic shell = Activator.CreateInstance(shellType);
                dynamic shortcut = shell.CreateShortcut(shortcutPath);
                shortcut.TargetPath = targetPath;
                shortcut.WorkingDirectory = Path.GetDirectoryName(targetPath);
                shortcut.Description = description;
                shortcut.Save();
            }
            catch { }
        }

        public static void RegisterUninstall(string installDir, string version)
        {
            try
            {
                string keyPath = @"Software\Microsoft\Windows\CurrentVersion\Uninstall\AstraFlux-HUB";
                using (RegistryKey key = Registry.CurrentUser.CreateSubKey(keyPath))
                {
                    if (key != null)
                    {
                        string exePath = Path.Combine(installDir, "AstraFlux-HUB.exe");
                        key.SetValue("DisplayName", AppDisplayName + " V" + version);
                        key.SetValue("DisplayVersion", version);
                        key.SetValue("Publisher", "Kutaze / AstraFlux Team");
                        key.SetValue("InstallLocation", installDir);
                        key.SetValue("DisplayIcon", exePath);
                        key.SetValue("UninstallString", "\"" + exePath + "\" --uninstall");
                        key.SetValue("NoModify", 1, RegistryValueKind.DWord);
                        key.SetValue("NoRepair", 1, RegistryValueKind.DWord);
                    }
                }
            }
            catch { }
        }

        public static void CloseRunningApp()
        {
            try
            {
                foreach (var p in Process.GetProcessesByName("AstraFlux-HUB"))
                {
                    try
                    {
                        p.CloseMainWindow();
                        if (!p.WaitForExit(1500))
                        {
                            p.Kill();
                        }
                    }
                    catch { }
                }
            }
            catch { }
        }

        public static void DoSilentInstall()
        {
            CloseRunningApp();
            string installDir = GetDefaultInstallDir();
            ExtractPayload(installDir, null);
            string exePath = Path.Combine(installDir, "AstraFlux-HUB.exe");
            string desktopDir = Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory);
            CreateShortcut(exePath, Path.Combine(desktopDir, "AstraFlux-HUB.lnk"), "AstraFlux-HUB 通用磁轴与电竞外设控制中心");
            string startMenuDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.StartMenu), "Programs");
            CreateShortcut(exePath, Path.Combine(startMenuDir, "AstraFlux-HUB.lnk"), "AstraFlux-HUB 通用磁轴与电竞外设控制中心");
            RegisterUninstall(installDir, AppVersion);
        }

        public static void ExtractPayload(string targetDir, Action<int, string> progressCallback)
        {
            if (!Directory.Exists(targetDir))
            {
                Directory.CreateDirectory(targetDir);
            }

            Assembly assembly = Assembly.GetExecutingAssembly();
            using (Stream stream = assembly.GetManifestResourceStream("payload.zip"))
            {
                if (stream == null)
                {
                    throw new Exception("安装包内核数据损坏或未能定位内嵌资源 payload.zip");
                }

                using (ZipArchive archive = new ZipArchive(stream, ZipArchiveMode.Read))
                {
                    int total = archive.Entries.Count;
                    int count = 0;

                    foreach (ZipArchiveEntry entry in archive.Entries)
                    {
                        count++;
                        string fullPath = Path.Combine(targetDir, entry.FullName);

                        if (string.IsNullOrEmpty(entry.Name))
                        {
                            Directory.CreateDirectory(fullPath);
                            continue;
                        }

                        string dir = Path.GetDirectoryName(fullPath);
                        if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir))
                        {
                            Directory.CreateDirectory(dir);
                        }

                        if (progressCallback != null)
                        {
                            int pct = (int)((count / (float)total) * 100);
                            progressCallback(pct, entry.Name);
                        }

                        try
                        {
                            entry.ExtractToFile(fullPath, true);
                        }
                        catch (IOException)
                        {
                            try
                            {
                                string backup = fullPath + ".old";
                                if (File.Exists(backup)) File.Delete(backup);
                                if (File.Exists(fullPath)) File.Move(fullPath, backup);
                                entry.ExtractToFile(fullPath, true);
                            }
                            catch { }
                        }
                    }
                }
            }
        }
    }

    /// <summary>
    /// 标准主流 Inno Setup 风格安装向导 (Modern Setup Wizard)
    /// </summary>
    public class ModernSetupWizardForm : Form
    {
        private Panel headerPanel;
        private Label lblHeaderTitle;
        private Label lblHeaderSubtitle;
        private PictureBox pbHeaderIcon;

        private Panel contentPanel;
        private Panel bottomPanel;
        private Button btnBack;
        private Button btnNext;
        private Button btnCancel;

        // 页码枚举
        private enum WizardStep
        {
            SelectDirectory = 0,
            SelectTasks = 1,
            Installing = 2,
            Finished = 3
        }

        private WizardStep currentStep = WizardStep.SelectDirectory;

        // Step 0: 选择目标位置控件
        private Panel panelDir;
        private TextBox txtInstallPath;
        private Button btnBrowseDir;
        private Label lblSpaceReq;

        // Step 1: 选择附加任务控件 (完全对齐 Easy Bug Manager 主流向导界面)
        private Panel panelTasks;
        private CheckBox chkCreateDesktopShortcut;
        private CheckBox chkCreateStartMenuShortcut;
        private CheckBox chkAutoStartWithWindows;

        // Step 2: 正在安装控件
        private Panel panelInstall;
        private ProgressBar prgInstallProgress;
        private Label lblInstallFileStatus;

        // Step 3: 安装完成控件
        private Panel panelFinished;
        private CheckBox chkRunApplicationNow;

        public ModernSetupWizardForm()
        {
            this.Text = "安装 - AstraFlux-HUB 版本 " + Program.AppVersion;
            this.ClientSize = new Size(502, 362);
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.MinimizeBox = true;
            this.StartPosition = FormStartPosition.CenterScreen;
            this.Font = new Font("Microsoft YaHei UI", 9f, FontStyle.Regular);
            this.BackColor = SystemColors.Control;

            try
            {
                this.Icon = Icon.ExtractAssociatedIcon(Application.ExecutablePath);
            }
            catch { }

            InitWizardControls();
            SwitchToStep(WizardStep.SelectDirectory);
        }

        private void InitWizardControls()
        {
            // 1. 顶部白底横幅 (Header Panel)
            headerPanel = new Panel();
            headerPanel.Dock = DockStyle.Top;
            headerPanel.Height = 58;
            headerPanel.BackColor = Color.White;
            headerPanel.Paint += (s, e) => {
                e.Graphics.DrawLine(new Pen(Color.FromArgb(208, 208, 208)), 0, headerPanel.Height - 1, headerPanel.Width, headerPanel.Height - 1);
            };

            lblHeaderTitle = new Label();
            lblHeaderTitle.Text = "选择附加任务";
            lblHeaderTitle.Font = new Font("Microsoft YaHei UI", 9f, FontStyle.Bold);
            lblHeaderTitle.ForeColor = Color.Black;
            lblHeaderTitle.Location = new Point(20, 10);
            lblHeaderTitle.AutoSize = true;

            lblHeaderSubtitle = new Label();
            lblHeaderSubtitle.Text = "您想要安装程序执行哪些附加任务？";
            lblHeaderSubtitle.Font = new Font("Microsoft YaHei UI", 9f, FontStyle.Regular);
            lblHeaderSubtitle.ForeColor = Color.FromArgb(64, 64, 64);
            lblHeaderSubtitle.Location = new Point(35, 30);
            lblHeaderSubtitle.AutoSize = true;

            pbHeaderIcon = new PictureBox();
            pbHeaderIcon.Size = new Size(38, 38);
            pbHeaderIcon.Location = new Point(445, 9);
            pbHeaderIcon.Paint += DrawSetupIcon;

            headerPanel.Controls.Add(lblHeaderTitle);
            headerPanel.Controls.Add(lblHeaderSubtitle);
            headerPanel.Controls.Add(pbHeaderIcon);
            this.Controls.Add(headerPanel);

            // 2. 底部按钮控制栏 (Bottom Panel)
            bottomPanel = new Panel();
            bottomPanel.Dock = DockStyle.Bottom;
            bottomPanel.Height = 44;
            bottomPanel.BackColor = SystemColors.Control;
            bottomPanel.Paint += (s, e) => {
                e.Graphics.DrawLine(new Pen(Color.FromArgb(208, 208, 208)), 0, 0, bottomPanel.Width, 0);
            };

            btnBack = new Button();
            btnBack.Text = "< 上一步(B)";
            btnBack.Size = new Size(76, 24);
            btnBack.Location = new Point(245, 10);
            btnBack.Click += (s, e) => {
                if (currentStep == WizardStep.SelectTasks) SwitchToStep(WizardStep.SelectDirectory);
            };

            btnNext = new Button();
            btnNext.Text = "下一步(N) >";
            btnNext.Size = new Size(76, 24);
            btnNext.Location = new Point(328, 10);
            btnNext.Click += BtnNext_Click;

            btnCancel = new Button();
            btnCancel.Text = "取消";
            btnCancel.Size = new Size(76, 24);
            btnCancel.Location = new Point(412, 10);
            btnCancel.Click += (s, e) => {
                if (currentStep == WizardStep.Installing)
                {
                    if (MessageBox.Show("安装尚未完成，确定要退出安装程序吗？", "退出安装", MessageBoxButtons.YesNo, MessageBoxIcon.Question) == DialogResult.Yes)
                    {
                        Application.Exit();
                    }
                }
                else
                {
                    Application.Exit();
                }
            };

            bottomPanel.Controls.Add(btnBack);
            bottomPanel.Controls.Add(btnNext);
            bottomPanel.Controls.Add(btnCancel);
            this.Controls.Add(bottomPanel);

            // 3. 中间内容面板容器 (Content Panel)
            contentPanel = new Panel();
            contentPanel.Dock = DockStyle.Fill;
            contentPanel.BackColor = SystemColors.Control;
            this.Controls.Add(contentPanel);

            // ---------------------------------------------------------------------
            // Step 0: 选择目标位置 (panelDir)
            // ---------------------------------------------------------------------
            panelDir = new Panel();
            panelDir.Dock = DockStyle.Fill;

            Label lblDirIntro1 = new Label();
            lblDirIntro1.Text = "安装程序将安装 AstraFlux-HUB 到下列文件夹。";
            lblDirIntro1.Location = new Point(20, 16);
            lblDirIntro1.AutoSize = true;
            panelDir.Controls.Add(lblDirIntro1);

            Label lblDirIntro2 = new Label();
            lblDirIntro2.Text = "单击“下一步”继续。如果您想选择其它文件夹，请单击“浏览”。";
            lblDirIntro2.Location = new Point(20, 38);
            lblDirIntro2.AutoSize = true;
            panelDir.Controls.Add(lblDirIntro2);

            GroupBox gbDir = new GroupBox();
            gbDir.Text = "目标文件夹";
            gbDir.Location = new Point(20, 75);
            gbDir.Size = new Size(462, 70);

            txtInstallPath = new TextBox();
            txtInstallPath.Text = Program.GetDefaultInstallDir();
            txtInstallPath.Location = new Point(16, 26);
            txtInstallPath.Size = new Size(340, 23);
            gbDir.Controls.Add(txtInstallPath);

            btnBrowseDir = new Button();
            btnBrowseDir.Text = "浏览(B)...";
            btnBrowseDir.Location = new Point(366, 25);
            btnBrowseDir.Size = new Size(80, 25);
            btnBrowseDir.Click += (s, e) => {
                using (FolderBrowserDialog fbd = new FolderBrowserDialog())
                {
                    fbd.Description = "请选择 AstraFlux-HUB 的目标安装文件夹：";
                    fbd.SelectedPath = txtInstallPath.Text;
                    if (fbd.ShowDialog() == DialogResult.OK)
                    {
                        txtInstallPath.Text = fbd.SelectedPath;
                    }
                }
            };
            gbDir.Controls.Add(btnBrowseDir);
            panelDir.Controls.Add(gbDir);

            lblSpaceReq = new Label();
            lblSpaceReq.Text = "至少需要约 160.0 MB 的可用磁盘空间。";
            lblSpaceReq.ForeColor = Color.FromArgb(100, 100, 100);
            lblSpaceReq.Location = new Point(20, 160);
            lblSpaceReq.AutoSize = true;
            panelDir.Controls.Add(lblSpaceReq);

            contentPanel.Controls.Add(panelDir);

            // ---------------------------------------------------------------------
            // Step 1: 选择附加任务 (panelTasks) -> 经典 Inno Setup 附加任务界面
            // ---------------------------------------------------------------------
            panelTasks = new Panel();
            panelTasks.Dock = DockStyle.Fill;

            Label lblTaskIntro = new Label();
            lblTaskIntro.Text = "选择您想要安装程序在安装 AstraFlux-HUB 时执行的附加任务，然后单击“下一步”。";
            lblTaskIntro.Location = new Point(20, 20);
            lblTaskIntro.Size = new Size(462, 35);
            panelTasks.Controls.Add(lblTaskIntro);

            Label lblTaskGroup = new Label();
            lblTaskGroup.Text = "附加快捷方式：";
            lblTaskGroup.Location = new Point(20, 70);
            lblTaskGroup.AutoSize = true;
            panelTasks.Controls.Add(lblTaskGroup);

            chkCreateDesktopShortcut = new CheckBox();
            chkCreateDesktopShortcut.Text = "创建桌面快捷方式(D)";
            chkCreateDesktopShortcut.Checked = true;
            chkCreateDesktopShortcut.Location = new Point(26, 96);
            chkCreateDesktopShortcut.AutoSize = true;
            panelTasks.Controls.Add(chkCreateDesktopShortcut);

            chkCreateStartMenuShortcut = new CheckBox();
            chkCreateStartMenuShortcut.Text = "创建开始菜单快捷方式(S)";
            chkCreateStartMenuShortcut.Checked = true;
            chkCreateStartMenuShortcut.Location = new Point(26, 126);
            chkCreateStartMenuShortcut.AutoSize = true;
            panelTasks.Controls.Add(chkCreateStartMenuShortcut);

            chkAutoStartWithWindows = new CheckBox();
            chkAutoStartWithWindows.Text = "开机时静默常驻后台 (推荐，随时响应设备热插拔)";
            chkAutoStartWithWindows.Checked = false;
            chkAutoStartWithWindows.Location = new Point(26, 156);
            chkAutoStartWithWindows.AutoSize = true;
            panelTasks.Controls.Add(chkAutoStartWithWindows);

            contentPanel.Controls.Add(panelTasks);

            // ---------------------------------------------------------------------
            // Step 2: 正在安装 (panelInstall)
            // ---------------------------------------------------------------------
            panelInstall = new Panel();
            panelInstall.Dock = DockStyle.Fill;

            Label lblInstallPrompt = new Label();
            lblInstallPrompt.Text = "正在安装 AstraFlux-HUB 到目标目录，请稍候...";
            lblInstallPrompt.Location = new Point(20, 25);
            lblInstallPrompt.AutoSize = true;
            panelInstall.Controls.Add(lblInstallPrompt);

            prgInstallProgress = new ProgressBar();
            prgInstallProgress.Location = new Point(20, 55);
            prgInstallProgress.Size = new Size(462, 22);
            panelInstall.Controls.Add(prgInstallProgress);

            lblInstallFileStatus = new Label();
            lblInstallFileStatus.Text = "准备解包运行时组件...";
            lblInstallFileStatus.ForeColor = Color.FromArgb(90, 90, 90);
            lblInstallFileStatus.Location = new Point(20, 85);
            lblInstallFileStatus.Size = new Size(462, 22);
            panelInstall.Controls.Add(lblInstallFileStatus);

            contentPanel.Controls.Add(panelInstall);

            // ---------------------------------------------------------------------
            // Step 3: 安装完成 (panelFinished)
            // ---------------------------------------------------------------------
            panelFinished = new Panel();
            panelFinished.Dock = DockStyle.Fill;

            Label lblFinishedTitle = new Label();
            lblFinishedTitle.Text = "AstraFlux-HUB 安装向导完成";
            lblFinishedTitle.Font = new Font("Microsoft YaHei UI", 12f, FontStyle.Bold);
            lblFinishedTitle.Location = new Point(25, 30);
            lblFinishedTitle.AutoSize = true;
            panelFinished.Controls.Add(lblFinishedTitle);

            Label lblFinishedDesc = new Label();
            lblFinishedDesc.Text = "安装程序已在您的计算机上完成了 AstraFlux-HUB 的安装。\n\n可以通过单击安装好的快捷方式图标来启动本程序。\n\n单击“完成”退出安装向导。";
            lblFinishedDesc.Location = new Point(26, 68);
            lblFinishedDesc.Size = new Size(450, 80);
            panelFinished.Controls.Add(lblFinishedDesc);

            chkRunApplicationNow = new CheckBox();
            chkRunApplicationNow.Text = "运行 AstraFlux-HUB(R)";
            chkRunApplicationNow.Checked = true;
            chkRunApplicationNow.Location = new Point(26, 160);
            chkRunApplicationNow.AutoSize = true;
            panelFinished.Controls.Add(chkRunApplicationNow);

            contentPanel.Controls.Add(panelFinished);
        }

        private void DrawSetupIcon(object sender, PaintEventArgs e)
        {
            Graphics g = e.Graphics;
            g.SmoothingMode = SmoothingMode.AntiAlias;

            // 绘制主流安装向导图标：电脑屏幕 + 安装箭头与软盘
            using (Brush screenBrush = new SolidBrush(Color.FromArgb(40, 50, 70)))
            using (Pen borderPen = new Pen(Color.FromArgb(80, 90, 110), 1.5f))
            {
                // 屏幕
                g.FillRectangle(screenBrush, 4, 3, 26, 20);
                g.DrawRectangle(borderPen, 4, 3, 26, 20);

                // 底座
                g.FillRectangle(Brushes.Gray, 14, 23, 6, 4);
                g.FillRectangle(Brushes.Gray, 10, 27, 14, 2);
            }

            // 右下角安装光盘/小包
            using (Brush cdBrush = new SolidBrush(Color.FromArgb(0, 120, 215)))
            {
                g.FillEllipse(cdBrush, 17, 14, 18, 18);
                g.FillEllipse(Brushes.White, 23, 20, 6, 6);
            }

            // 绿色/白色向导安装箭头
            using (Brush arrowBrush = new SolidBrush(Color.FromArgb(16, 185, 129)))
            {
                Point[] pts = new Point[] {
                    new Point(26, 6),
                    new Point(32, 12),
                    new Point(29, 12),
                    new Point(29, 18),
                    new Point(23, 18),
                    new Point(23, 12),
                    new Point(20, 12)
                };
                g.FillPolygon(arrowBrush, pts);
            }
        }

        private void SwitchToStep(WizardStep step)
        {
            currentStep = step;
            panelDir.Visible = (step == WizardStep.SelectDirectory);
            panelTasks.Visible = (step == WizardStep.SelectTasks);
            panelInstall.Visible = (step == WizardStep.Installing);
            panelFinished.Visible = (step == WizardStep.Finished);

            switch (step)
            {
                case WizardStep.SelectDirectory:
                    headerPanel.Visible = true;
                    lblHeaderTitle.Text = "选择目标位置";
                    lblHeaderSubtitle.Text = "安装程序将把 AstraFlux-HUB 安装到下列文件夹。";
                    btnBack.Enabled = false;
                    btnNext.Enabled = true;
                    btnNext.Text = "下一步(N) >";
                    btnCancel.Enabled = true;
                    break;

                case WizardStep.SelectTasks:
                    headerPanel.Visible = true;
                    lblHeaderTitle.Text = "选择附加任务";
                    lblHeaderSubtitle.Text = "您想要安装程序执行哪些附加任务？";
                    btnBack.Enabled = true;
                    btnNext.Enabled = true;
                    btnNext.Text = "下一步(N) >";
                    btnCancel.Enabled = true;
                    break;

                case WizardStep.Installing:
                    headerPanel.Visible = true;
                    lblHeaderTitle.Text = "正在安装";
                    lblHeaderSubtitle.Text = "安装程序正在安装 AstraFlux-HUB 到您的计算机中，请稍候。";
                    btnBack.Enabled = false;
                    btnNext.Enabled = false;
                    btnNext.Text = "安装(I)";
                    btnCancel.Enabled = true;
                    StartExtractInstallation();
                    break;

                case WizardStep.Finished:
                    headerPanel.Visible = false;
                    btnBack.Visible = false;
                    btnNext.Text = "完成(F)";
                    btnNext.Enabled = true;
                    btnCancel.Visible = false;
                    break;
            }
        }

        private void BtnNext_Click(object sender, EventArgs e)
        {
            if (currentStep == WizardStep.SelectDirectory)
            {
                string path = txtInstallPath.Text.Trim();
                if (string.IsNullOrEmpty(path))
                {
                    MessageBox.Show("请指定有效的安装路径！", "提示", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                    return;
                }
                SwitchToStep(WizardStep.SelectTasks);
            }
            else if (currentStep == WizardStep.SelectTasks)
            {
                SwitchToStep(WizardStep.Installing);
            }
            else if (currentStep == WizardStep.Finished)
            {
                if (chkRunApplicationNow.Checked)
                {
                    string targetDir = txtInstallPath.Text.Trim();
                    string exePath = Path.Combine(targetDir, "AstraFlux-HUB.exe");
                    if (File.Exists(exePath))
                    {
                        try
                        {
                            ProcessStartInfo psi = new ProcessStartInfo();
                            psi.FileName = exePath;
                            psi.WorkingDirectory = targetDir;
                            psi.Arguments = "--no-sandbox --disable-gpu --disable-software-rasterizer";
                            Process.Start(psi);
                        }
                        catch { }
                    }
                }
                Application.Exit();
            }
        }

        private async void StartExtractInstallation()
        {
            string targetDir = txtInstallPath.Text.Trim();
            bool createDesk = chkCreateDesktopShortcut.Checked;
            bool createMenu = chkCreateStartMenuShortcut.Checked;
            bool autoStart = chkAutoStartWithWindows.Checked;

            prgInstallProgress.Value = 0;

            try
            {
                await System.Threading.Tasks.Task.Run(() => {
                    // 安装前先礼貌关闭可能正在运行的旧版进程，避免文件锁锁定
                    Program.CloseRunningApp();

                    Program.ExtractPayload(targetDir, (pct, fileName) => {
                        this.Invoke(new Action(() => {
                            if (pct >= 0 && pct <= 100) prgInstallProgress.Value = pct;
                            lblInstallFileStatus.Text = "正在复制文件: " + (fileName.Length > 40 ? fileName.Substring(0, 37) + "..." : fileName);
                        }));
                    });

                    string exePath = Path.Combine(targetDir, "AstraFlux-HUB.exe");

                    if (createDesk)
                    {
                        string desk = Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory);
                        Program.CreateShortcut(exePath, Path.Combine(desk, "AstraFlux-HUB.lnk"), "AstraFlux-HUB 控制中心");
                    }

                    if (createMenu)
                    {
                        string startMenu = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.StartMenu), "Programs");
                        Program.CreateShortcut(exePath, Path.Combine(startMenu, "AstraFlux-HUB.lnk"), "AstraFlux-HUB 控制中心");
                    }

                    if (autoStart)
                    {
                        try
                        {
                            using (RegistryKey runKey = Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Run", true))
                            {
                                if (runKey != null)
                                {
                                    runKey.SetValue("AstraFlux-HUB", "\"" + exePath + "\" --hidden");
                                }
                            }
                        }
                        catch { }
                    }

                    Program.RegisterUninstall(targetDir, Program.AppVersion);
                });

                prgInstallProgress.Value = 100;
                lblInstallFileStatus.Text = "文件解压部署完成！";

                await System.Threading.Tasks.Task.Delay(400);
                SwitchToStep(WizardStep.Finished);
            }
            catch (Exception ex)
            {
                MessageBox.Show("安装过程中发生错误:\n" + ex.Message, "安装失败", MessageBoxButtons.OK, MessageBoxIcon.Error);
                btnCancel.Enabled = true;
            }
        }
    }
}
