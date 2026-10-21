using System;
using System.IO;
using System.IO.Compression;
using System.Diagnostics;
using System.Reflection;
using System.Windows.Forms;
using System.Drawing;
using Microsoft.Win32;

namespace AstraFluxHubInstaller
{
    static class Program
    {
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

            Application.Run(new InstallerForm());
        }

        public static string GetDefaultInstallDir()
        {
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
                        key.SetValue("DisplayName", "AstraFlux-HUB (星流驱动) V" + version);
                        key.SetValue("DisplayVersion", version);
                        key.SetValue("Publisher", "Kutaze");
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

        public static void DoSilentInstall()
        {
            string installDir = GetDefaultInstallDir();
            ExtractPayload(installDir, null);
            string exePath = Path.Combine(installDir, "AstraFlux-HUB.exe");
            string desktopDir = Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory);
            CreateShortcut(exePath, Path.Combine(desktopDir, "AstraFlux-HUB.lnk"), "AstraFlux-HUB 通用磁轴与电竞外设控制中心");
            RegisterUninstall(installDir, "1.1.0");
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
                            // 如果文件正被运行中进程占用，尝试写入临时重命名
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

    public class InstallerForm : Form
    {
        private TextBox txtPath;
        private Button btnBrowse;
        private CheckBox chkDesktop;
        private CheckBox chkStartMenu;
        private CheckBox chkLaunch;
        private Button btnInstall;
        private ProgressBar progressBar;
        private Label lblStatus;
        private Label lblTitle;
        private Label lblSubtitle;

        public InstallerForm()
        {
            this.Text = "AstraFlux-HUB V1.1.0 安装向导";
            this.Size = new Size(540, 380);
            this.FormBorderStyle = FormBorderStyle.FixedSingle;
            this.MaximizeBox = false;
            this.StartPosition = FormStartPosition.CenterScreen;
            this.BackColor = Color.FromArgb(11, 15, 25);
            this.ForeColor = Color.FromArgb(241, 245, 249);
            this.Font = new Font("Segoe UI", 9.5f, FontStyle.Regular);

            BuildUI();
        }

        private void BuildUI()
        {
            Panel headerPanel = new Panel();
            headerPanel.Location = new Point(0, 0);
            headerPanel.Size = new Size(540, 75);
            headerPanel.BackColor = Color.FromArgb(17, 24, 39);

            lblTitle = new Label();
            lblTitle.Text = "AstraFlux-HUB V1.1.0 安装向导";
            lblTitle.Font = new Font("Segoe UI", 12.5f, FontStyle.Bold);
            lblTitle.ForeColor = Color.FromArgb(0, 240, 255);
            lblTitle.Location = new Point(24, 14);
            lblTitle.AutoSize = true;

            lblSubtitle = new Label();
            lblSubtitle.Text = "通用磁轴与电竞外设开源控制中心 · 8000Hz · 0.01mm RT · WebHID";
            lblSubtitle.Font = new Font("Segoe UI", 8.8f, FontStyle.Regular);
            lblSubtitle.ForeColor = Color.FromArgb(156, 163, 175);
            lblSubtitle.Location = new Point(25, 42);
            lblSubtitle.AutoSize = true;

            headerPanel.Controls.Add(lblTitle);
            headerPanel.Controls.Add(lblSubtitle);
            this.Controls.Add(headerPanel);

            Label lblPath = new Label();
            lblPath.Text = "目标安装目录：";
            lblPath.Location = new Point(24, 95);
            lblPath.AutoSize = true;
            this.Controls.Add(lblPath);

            txtPath = new TextBox();
            txtPath.Text = Program.GetDefaultInstallDir();
            txtPath.Location = new Point(26, 120);
            txtPath.Size = new Size(380, 26);
            txtPath.BackColor = Color.FromArgb(24, 32, 50);
            txtPath.ForeColor = Color.White;
            txtPath.BorderStyle = BorderStyle.FixedSingle;
            this.Controls.Add(txtPath);

            btnBrowse = new Button();
            btnBrowse.Text = "浏览...";
            btnBrowse.Location = new Point(416, 118);
            btnBrowse.Size = new Size(88, 28);
            btnBrowse.FlatStyle = FlatStyle.Flat;
            btnBrowse.FlatAppearance.BorderColor = Color.FromArgb(55, 65, 81);
            btnBrowse.BackColor = Color.FromArgb(31, 41, 55);
            btnBrowse.ForeColor = Color.White;
            btnBrowse.Click += (s, e) => {
                using (FolderBrowserDialog fbd = new FolderBrowserDialog())
                {
                    fbd.SelectedPath = txtPath.Text;
                    if (fbd.ShowDialog() == DialogResult.OK)
                    {
                        txtPath.Text = fbd.SelectedPath;
                    }
                }
            };
            this.Controls.Add(btnBrowse);

            chkDesktop = new CheckBox();
            chkDesktop.Text = "在桌面创建快捷方式";
            chkDesktop.Checked = true;
            chkDesktop.Location = new Point(26, 160);
            chkDesktop.AutoSize = true;
            this.Controls.Add(chkDesktop);

            chkStartMenu = new CheckBox();
            chkStartMenu.Text = "添加到开始菜单程序组";
            chkStartMenu.Checked = true;
            chkStartMenu.Location = new Point(26, 188);
            chkStartMenu.AutoSize = true;
            this.Controls.Add(chkStartMenu);

            chkLaunch = new CheckBox();
            chkLaunch.Text = "安装完成后立即启动 AstraFlux-HUB";
            chkLaunch.Checked = true;
            chkLaunch.Location = new Point(26, 216);
            chkLaunch.AutoSize = true;
            this.Controls.Add(chkLaunch);

            progressBar = new ProgressBar();
            progressBar.Location = new Point(26, 255);
            progressBar.Size = new Size(478, 16);
            progressBar.Visible = false;
            this.Controls.Add(progressBar);

            lblStatus = new Label();
            lblStatus.Text = "就绪，点击「立即安装」开始部署。";
            lblStatus.ForeColor = Color.FromArgb(156, 163, 175);
            lblStatus.Location = new Point(26, 280);
            lblStatus.Size = new Size(350, 20);
            this.Controls.Add(lblStatus);

            btnInstall = new Button();
            btnInstall.Text = "立即安装";
            btnInstall.Location = new Point(390, 280);
            btnInstall.Size = new Size(114, 38);
            btnInstall.FlatStyle = FlatStyle.Flat;
            btnInstall.FlatAppearance.BorderSize = 0;
            btnInstall.BackColor = Color.FromArgb(0, 229, 255);
            btnInstall.ForeColor = Color.FromArgb(10, 15, 29);
            btnInstall.Font = new Font("Segoe UI", 10f, FontStyle.Bold);
            btnInstall.Cursor = Cursors.Hand;
            btnInstall.Click += BtnInstall_Click;
            this.Controls.Add(btnInstall);
        }

        private async void BtnInstall_Click(object sender, EventArgs e)
        {
            string targetDir = txtPath.Text.Trim();
            if (string.IsNullOrEmpty(targetDir)) return;

            btnInstall.Enabled = false;
            btnBrowse.Enabled = false;
            txtPath.Enabled = false;
            chkDesktop.Enabled = false;
            chkStartMenu.Enabled = false;
            chkLaunch.Enabled = false;
            progressBar.Visible = true;
            progressBar.Value = 0;

            bool createDesk = chkDesktop.Checked;
            bool createMenu = chkStartMenu.Checked;
            bool launchNow = chkLaunch.Checked;

            try
            {
                await System.Threading.Tasks.Task.Run(() => {
                    Program.ExtractPayload(targetDir, (pct, fileName) => {
                        this.Invoke(new Action(() => {
                            if (pct >= 0 && pct <= 100) progressBar.Value = pct;
                            lblStatus.Text = "正在解压: " + (fileName.Length > 30 ? fileName.Substring(0, 27) + "..." : fileName);
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

                    Program.RegisterUninstall(targetDir, "1.1.0");

                    if (launchNow && File.Exists(exePath))
                    {
                        ProcessStartInfo psi = new ProcessStartInfo();
                        psi.FileName = exePath;
                        psi.WorkingDirectory = targetDir;
                        psi.Arguments = "--no-sandbox --disable-gpu --disable-software-rasterizer";
                        Process.Start(psi);
                    }
                });

                progressBar.Value = 100;
                lblStatus.ForeColor = Color.FromArgb(16, 185, 129);
                lblStatus.Text = "🎉 安装完成！感谢使用 AstraFlux-HUB。";
                btnInstall.Text = "完成退出";
                btnInstall.Enabled = true;
                btnInstall.Click -= BtnInstall_Click;
                btnInstall.Click += (s, ev) => Application.Exit();
            }
            catch (Exception ex)
            {
                progressBar.Visible = false;
                lblStatus.ForeColor = Color.FromArgb(239, 68, 68);
                lblStatus.Text = "安装失败: " + ex.Message;
                btnInstall.Enabled = true;
            }
        }
    }
}
