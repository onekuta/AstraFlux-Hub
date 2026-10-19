using System;
using System.IO;
using System.IO.Compression;
using System.Diagnostics;
using System.Reflection;

namespace SparkLinkPublisherLauncher
{
    static class Program
    {
        [STAThread]
        static void Main(string[] args)
        {
            try
            {
                string currentExeDir = AppDomain.CurrentDomain.BaseDirectory;
                string tempRoot = Path.Combine(Path.GetTempPath(), "SparkLink_Publisher_v120");
                string targetExe = Path.Combine(tempRoot, "星闪云端发布工具_core.exe");

                // 如果目标执行程序不存在，解压内嵌资源
                if (!File.Exists(targetExe))
                {
                    if (Directory.Exists(tempRoot))
                    {
                        try { Directory.Delete(tempRoot, true); } catch { }
                    }
                    Directory.CreateDirectory(tempRoot);

                    string tempZip = Path.Combine(tempRoot, "payload.zip");
                    Assembly assembly = Assembly.GetExecutingAssembly();
                    using (Stream stream = assembly.GetManifestResourceStream("publisher_payload.zip"))
                    {
                        if (stream == null)
                        {
                            System.Windows.Forms.MessageBox.Show("错误: 内嵌运行时损坏！", "星闪云端发布工具", System.Windows.Forms.MessageBoxButtons.OK, System.Windows.Forms.MessageBoxIcon.Error);
                            return;
                        }
                        using (FileStream fileStream = new FileStream(tempZip, FileMode.Create, FileAccess.Write))
                        {
                            stream.CopyTo(fileStream);
                        }
                    }

                    ZipFile.ExtractToDirectory(tempZip, tempRoot);
                    try { File.Delete(tempZip); } catch { }
                }

                if (!File.Exists(targetExe))
                {
                    System.Windows.Forms.MessageBox.Show("未能正确定位发布工具内核: " + targetExe, "星闪云端发布工具", System.Windows.Forms.MessageBoxButtons.OK, System.Windows.Forms.MessageBoxIcon.Error);
                    return;
                }

                ProcessStartInfo psi = new ProcessStartInfo();
                psi.FileName = targetExe;
                psi.WorkingDirectory = tempRoot;
                psi.Arguments = "--no-sandbox --disable-gpu --disable-software-rasterizer";
                psi.EnvironmentVariables["PORTABLE_EXECUTABLE_DIR"] = currentExeDir;
                psi.UseShellExecute = false;

                Process proc = Process.Start(psi);
                if (proc != null)
                {
                    proc.WaitForExit();
                }
            }
            catch (Exception ex)
            {
                System.Windows.Forms.MessageBox.Show("启动云端发布工具发生异常: " + ex.Message, "星闪云端发布工具", System.Windows.Forms.MessageBoxButtons.OK, System.Windows.Forms.MessageBoxIcon.Error);
            }
        }
    }
}