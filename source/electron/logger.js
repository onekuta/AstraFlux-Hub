const { app, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

const MAX_LOG_SIZE = 5 * 1024 * 1024; // 5MB 轮转门禁

class AppLogger {
  constructor() {
    this.logsDir = null;
    this.appLogPath = null;
    this.errorLogPath = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      let userDataDir;
      try {
        userDataDir = (app && typeof app.getPath === 'function') ? app.getPath('userData') : '';
      } catch (e) {}
      if (!userDataDir) {
        userDataDir = process.env.APPDATA 
          ? path.join(process.env.APPDATA, 'AstraFlux-HUB') 
          : path.join(process.cwd(), 'userData');
      }
      this.logsDir = path.join(userDataDir, 'logs');
      if (!fs.existsSync(this.logsDir)) {
        fs.mkdirSync(this.logsDir, { recursive: true });
      }
      this.appLogPath = path.join(this.logsDir, 'app.log');
      this.errorLogPath = path.join(this.logsDir, 'error.log');
      this.initialized = true;

      // 记录启动日志头
      const sysInfo = `=== AstraFlux-HUB 启动 | 驱动版本: ${app.getVersion() || '1.1.3'} | 平台: ${os.platform()} ${os.arch()} (${os.release()}) | Node: ${process.versions.node} | Electron: ${process.versions.electron} ===`;
      this.info('System', sysInfo);

      // 注册主进程全局未捕获异常守护
      process.on('uncaughtException', (err) => {
        this.fatal('MainProcess:uncaughtException', err.message, err.stack);
      });

      process.on('unhandledRejection', (reason) => {
        const msg = reason instanceof Error ? reason.message : String(reason);
        const stack = reason instanceof Error ? reason.stack : '';
        this.error('MainProcess:unhandledRejection', msg, stack);
      });
    } catch (e) {
      console.error('[Logger Init Failed]', e);
    }
  }

  _formatTime() {
    const d = new Date();
    const pad = (n, len = 2) => String(n).padStart(len, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`;
  }

  _rotateIfNeeded(filePath) {
    try {
      if (!fs.existsSync(filePath)) return;
      const stats = fs.statSync(filePath);
      if (stats.size >= MAX_LOG_SIZE) {
        const oldPath = filePath.replace(/\.log$/, '.old.log');
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
        fs.renameSync(filePath, oldPath);
      }
    } catch (e) {
      // 容错忽略
    }
  }

  _writeLine(filePath, line) {
    if (!this.initialized) this.init();
    try {
      this._rotateIfNeeded(filePath);
      fs.appendFileSync(filePath, line + '\n', 'utf-8');
    } catch (e) {
      console.error('[Logger Write Error]', e);
    }
  }

  log(level, source, message, stack = '') {
    const timeStr = this._formatTime();
    const header = `[${timeStr}] [${level.toUpperCase()}] [${source}] ${message}`;
    let fullText = header;
    if (stack) {
      fullText += `\n  Stack: ${stack.replace(/\r?\n/g, '\n  ')}`;
    }

    // 终端实时输出
    if (level === 'ERROR' || level === 'FATAL') {
      console.error(header, stack || '');
    } else if (level === 'WARN') {
      console.warn(header);
    } else {
      console.log(header);
    }

    // 所有日志写入 app.log
    if (this.appLogPath) {
      this._writeLine(this.appLogPath, fullText);
    }

    // 错误日志单独写入 error.log
    if ((level === 'ERROR' || level === 'FATAL' || level === 'WARN') && this.errorLogPath) {
      this._writeLine(this.errorLogPath, fullText);
    }
  }

  info(source, message) {
    this.log('INFO', source, message);
  }

  warn(source, message, stack = '') {
    this.log('WARN', source, message, stack);
  }

  error(source, message, stack = '') {
    this.log('ERROR', source, message, stack);
  }

  fatal(source, message, stack = '') {
    this.log('FATAL', source, message, stack);
  }

  getLogsDir() {
    if (!this.initialized) this.init();
    return this.logsDir;
  }

  async openLogsFolder() {
    if (!this.initialized) this.init();
    if (this.logsDir && fs.existsSync(this.logsDir)) {
      await shell.openPath(this.logsDir);
      return { success: true, path: this.logsDir };
    }
    return { success: false, error: '日志目录不存在' };
  }

  getRecentLogs(maxLines = 100) {
    if (!this.initialized) this.init();
    try {
      let content = '';
      const targetFile = fs.existsSync(this.errorLogPath) && fs.statSync(this.errorLogPath).size > 0 
        ? this.errorLogPath 
        : this.appLogPath;

      if (targetFile && fs.existsSync(targetFile)) {
        const raw = fs.readFileSync(targetFile, 'utf-8');
        const lines = raw.split(/\r?\n/).filter(Boolean);
        const recent = lines.slice(-maxLines);
        content = recent.join('\n');
      }

      const diagInfo = [
        `==================================================`,
        `AstraFlux-HUB 运行诊断报告`,
        `生成时间: ${this._formatTime()}`,
        `驱动版本: ${app.getVersion() || '1.1.3'}`,
        `系统架构: ${os.type()} ${os.release()} (${os.arch()})`,
        `内存概况: 空闲 ${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB / 总计 ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
        `日志路径: ${this.logsDir || '未知'}`,
        `==================================================\n`,
        content || '(暂无异常报错记录，系统运行平稳)'
      ].join('\n');

      return { success: true, report: diagInfo, path: this.logsDir };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
}

const logger = new AppLogger();

module.exports = logger;
