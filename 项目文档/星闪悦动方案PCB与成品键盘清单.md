# 使用「星闪悦动」方案的产品清单

> 检索时间：2026-10-14 ｜ 仅覆盖公开可查信息 ｜ 「星闪悦动」= 深圳市星闪悦动科技有限公司（SparkLink PlayJoy）的磁轴主控 / 算法 / 灯光方案

---

## 〇、先厘清：此「星闪」非彼「星闪」

| 概念 | 指什么 | 落地形态 |
| :--- | :--- | :--- |
| **星闪（NearLink）** | 华为牵头、国际星闪联盟推动的无线短距通信技术 | 无线鼠标、无线键盘、数字车钥匙等；开源鸿蒙社区的协议栈 2026-07-15 全量开源 |
| **星闪悦动（SparkLink PlayJoy）** | 深圳市星闪悦动科技有限公司，**磁轴键盘方案商** | 提供主控 + 算法 + 网页驱动 + 灯光（EchoRGB）整套方案，**绝大多数产品是有线** |

- 公司主体：深圳市星闪悦动科技有限公司，官网 `sparklinkplayjoy.com`；商标 `SPARKLINK PLAYJOY`（注册号 85028207，2025-10-14 注册公告）。
- ⚠️ **检索陷阱**：搜「星闪 + 键盘 + 开源」会大量命中 TP78v3、FlashKeyboard 等 **NearLink 开源键盘**（用安信可 BS21/BS21E 模组），它们与「星闪悦动」**无关**，本清单不收。
- ⚠️ **未检索到「星闪悦动方案」的开源 PCB 工程** —— 其 PCBA 全部是商用闭源产品。

---

## 一、星闪悦动方案 / 主控体系

| 方案名称 | 架构说明 | 代表落地 | 备注 |
| :--- | :--- | :--- | :--- |
| **双子星（Twin / 双子星 2.0）** | 双 MCU 协同：一颗专做霍尔采样与 RT 运算，一颗负责按键上报与滤波；搭配 **ADC 全键直连**，弃用传统矩阵扫描，每键独立信号通道。指标：256kHz 全键扫描、8K 回报率、RT 精度 0.001mm、延迟约 0.08ms | 狼蛛 F68 RX、维咖 EG75、重力星球 V60 Ultra、星闪悦动 META60、双子星 PCB XS60、WuqueStudio Flux60 HE 等 | 官方未公布具体 MCU 型号，公开资料一律只写"双 MCU" |
| **双子星 Extreme** | **三核**：2 颗旗舰 MCU + 1 颗 ADC「天眼」直连芯片，算力约为普通方案 2 倍 | VGN 闪电 / 闪电 Extreme / Ultra / Pro | VGN × 星闪悦动联合开发（2025-05 福州发布会） |
| **银河 600** | 单旗舰主控，较上代算力 +297%、延迟 −30% | 狼蛛 × BG 联名 BOX63 旗舰版 | 部分媒体写作"星闪**跃**动"，应为同一家 |
| **星闪火星8K / 海王星8K / 天王星** | 入门档 8K 方案 | 七彩虹穿云玄甲 60 系列；维咖 EG75（京东标题写"星闪天王星"） | ⚠️ 只用「星闪 XX8K」作前缀，**是否由星闪悦动提供未获官方明证**，待确认 |

另有 **EchoRGB**：星闪悦动的灯光交互引擎，多款键盘沿用（狼蛛 F68 RX、VICTKONG DV63 的网页驱动等）。

---

## 二、客制化键盘 PCB（方案 / 内胆）

| 产品名称 / 型号 | 品牌 / 开发者 | 类别 | 芯片或主控方案说明 | 上市 / 开源状态 | 来源 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **星闪悦动 META60** | 星闪悦动（方案商自有型号） | 客制化磁轴 PCB / 内胆 | 内置**双子星**方案；60 配列；上下双灯位 + 空格十灯 + 背部环绕灯带；**板载振动马达**（WASD 震动反馈）；8K / 256K 全键扫描、RT 0.001mm | 已上市，可单独购买 PCB / 内胆（零售） | [什么值得买·组装案例](https://post.m.smzdm.com/p/a6zmg4xe)｜[百度贴吧·PCB 对比](https://static.tieba.baidu.com/p/10955747055)｜[爱企查词条](https://aiqicha.baidu.com/details/ugknowledge?id=2b8eb35b08801cc5b2f4c2ea453d65fa) |
| **双子星 PCB XS60** | 星闪悦动（"双子星 PCB"系列） | 客制化磁轴 PCB | 双 MCU 架构；蓝 / 白双色 PCB；上下灯位、空格区 10 颗灯珠；出厂预装夹层；8K 回报率、256K 全键扫描、RT 0.001mm | 已上市（零售/工作室渠道） | [什么值得买](https://post.m.smzdm.com/zz/p/a440d26w/) |
| **WuqueStudio Flux60 HE**（八宝60HE，型号 WS-FLUX60-HE） | Wuque Studio 无缺工作室 | 客制化磁轴 PCB 模块 | 搭载**星闪悦动双子星方案**；**2mm 铝基板 PCB** + 铝定位板 + 软木夹心棉；8K / 256K、延迟 0.08ms；配套驱动名为 "Polaris Twin OS" | 已上市（官网 + 海外渠道在售） | [Wuque Studio 官网](https://shop.wuquestudio.com/products/ws-flux60-he-the-1st-alumium-hall-effect-pcb)｜[什么值得买](https://post.smzdm.com/p/a46mdkll)｜[MaxGaming](https://maxgaming.com/en/plates-pcb-plates/wuque-studio-flux60-he-pcb) |
| **公版 / 散卖双子星 PCB**（小配列满血版） | 星闪悦动（公版方案） | 客制化磁轴 PCB | 双子星双 MCU，满血版约 300 元/张 | 已流通（淘宝 / 工作室渠道） | [今日头条](https://m.toutiao.com/article/7648097051036713526) |

> ⚠️ **同名混淆**：淘宝另有一款售 59.8 元的「XS60 GH60 PCB」是 **QMK/VIA 机械轴**开源板，与星闪悦动**无关**，勿混为一谈。

---

## 三、成品键盘

| 产品名称 / 型号 | 品牌 / 开发者 | 类别 | 芯片或主控方案说明 | 上市 / 开源状态 | 来源 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **前行者 ES68 破晓** | 前行者 EWEADN | 成品键盘（有线磁轴） | 前行者 × 星闪悦动**联合开发 32K 方案**；32kHz 回报率、256kHz 扫描、实测最低 0.008ms 延迟；高频响应 MCU + 9 路独立 ADC + 第四代霍尔；1.6mm FR4 四层防水 PCB | 已上市，首发 699 元 | [腾讯新闻/快科技](https://news.qq.com/rain/a/20260414A02E9V00)｜[前行者官网](https://www.eweadn.cn/brandNews/detail-31.html) |
| **前行者 ES87** | 前行者 EWEADN | 成品键盘 | "星闪悦动"磁轴方案；RT 0.001mm、延迟 0.08ms；全铝 CNC + 碳纤维定位板 | 已发布（2025-10 发布会公布） | [腾讯新闻/IT之家](https://news.qq.com/rain/a/20251024A03R6800) |
| **前行者 DK63** | 前行者 EWEADN | 成品键盘 | **中关村在线规格页明确标注"方案：星闪悦动"**；全键 32K 扫描、RT 0.005mm；自研 EHUB 驱动 | 在售（约 109~179 元） | [ZOL 规格页](https://detail.zol.com.cn/keyboard/eweadn/s3231/lishui/cheap_pic_5.html) |
| **前行者 DK68（三模）** | 前行者 EWEADN | 成品键盘 | ZOL 规格页同样标注"方案：星闪悦动"；32K 扫描、RT 0.005mm | 在售（约 179 元） | [ZOL 规格页](https://detail.zol.com.cn/keyboard/eweadn/s3231/lishui/cheap_pic_5.html) |
| **狼蛛 AULA F68 RX** | 狼蛛 AULA | 成品键盘（有线磁轴） | 星闪悦动**双子星**；PCB 集成双 MCU + 全键直连 ADC；8kHz / 256kHz、RT 0.001mm、0.08ms；EchoRGB 灯光引擎 | 已上市，299.15 元起 | [网易/IT之家](https://www.163.com/dy/article/KV8F0KP60511B8LM.html)｜[新浪科技](https://tech.sina.cn/2026-06-12/detail-iniceccp0243202.d.html) |
| **狼蛛 × BG 联名 BOX63** | 狼蛛 AULA × BG | 成品键盘 | 标准版下灯位 + 星耀磁轴；**旗舰版双灯位 + 星闪跃动"银河 600"主控**；8K、RT 0.001mm；4 层双面铺铜 PCB、碳纤维定位板 | 已上市，899 元起 / 旗舰 999 元 | [IT之家/腾讯](https://new.qq.com/rain/a/20260808A04F8F00)｜[笔记本评测网](http://m.bjbpc.com/view.php?aid=8341) |
| **维咖 WEIKAV EG75** | 维咖 WEIKAV | 成品键盘（有线磁轴） | 星闪悦动"**双子星**"；8kHz / 256kHz、0.08ms、RT 0.001mm；PCB 纳米防水涂层；FR4 定位板 | 已上市，399~479 元 | [IT之家](https://www.ithome.com/0/937/952.htm)｜[太平洋科技](https://news.pconline.com.cn/2128/21283600.html) |
| **VICTKONG DV63** | VICTKONG | 成品键盘（有线磁轴） | 星闪悦动方案。TTC 神马轴版：RT 0.001mm、32K 全键扫描、256K 通道扫描、0.125ms；凯华神驹轴版：0.005mm、8K、0.15ms | 已上市，299 元起 | [什么值得买](https://post.smzdm.com/p/al3l74xp)｜[什么值得买·方案分档](https://post.smzdm.com/p/ad7dg8wd/) |
| **黑爵 AJAZZ AK680 V3** | 黑爵 AJAZZ | 成品键盘 | **星闪悦动定制方案**；RT 0.001mm 步进、8K 回报率、192K 扫描率、0.125ms；WASD 直连 ADC | 已上市，299 元起 | [新浪](https://www.sina.cn/news/detail/5309360850865522.html)｜[今日头条](https://www.toutiao.com/a7657187614608327206) |
| **重力星球 GravaStar V60 Ultra** | 重力星球 GravaStar | 成品键盘（有线磁轴） | 星闪悦动**双子星**；8kHz、256kHz 全键 + 2304kHz 单键扫描、RT 0.001mm、0.08ms；双灯位 PCB | 已上市，1198 元 | [科技区角](https://m.x-techcon.com/article/170296.html)｜[笔记本评测网](http://m.bjbpc.com/view.php?aid=8223) |
| **VGN 闪电 / 闪电 Extreme / Ultra / Pro** | VGN | 成品键盘 | VGN × 星闪悦动联合开发"**双子星 Extreme**"三核方案（2×MCU + ADC 天眼直连）；RT 0.001mm、8K、256K 全键扫描 | 已上市，约 699~799 元 | [游戏日报](https://news.yxrb.net/2025/0529/5587.html)｜[京东](https://union-click.jd.com/jdc?e=&p=JF8BAUEJK1olXwQAVFZeC00SAl8IGlgUVAcFXVlbAEwUA19MRANLAjZbERscSkAJHTdNTwcKBlMdBgABFksWAG4BGlwcWgAKU11dFxJSXzIGXwRNA1l-AAsFWC5HVWMLdVp7XTZaIic5SwtBQQx1UwZvG1FSMV1fXSxnD2M4H10WWwIDVV9eOEsWAm4JElMcVQQyUFgzCSUXCmpmEwkWCFELVVwKAU1AVDgNHGsVXDZDOl5eDk4SAGgMK1olXQAKVFZdDk8VA2gIHGsVVQIyg_fz3sex19aizOmXbTYyV25tOEsnAF9WdVoSWQIHVFheZhdQBW9fQQlRMwYAUFtdDUMeBl8KGloXXzYyZD4eaAprQiZNSVwULkd8VgMGejcecC52ZSFiD3h7NDBfSh5EZWhAfCR3CV14PBgNf0onA18PHVolXDY) |
| **七彩虹 穿云玄甲 60 / 60 Pro / 60 Ultra** | 七彩虹 Colorful | 成品键盘（有线磁轴） | **星闪火星8K**（60）、**星闪海王星8K**（Pro / Ultra）；8K 有线方案 | 已上市 / 预售中，199 / 249 / 369 元 | [七彩虹官方微博](https://www.weibo.com/7892243139/RcIhVhLVY)｜[天猫](https://s.click.taobao.com/t?e=m%3D2%26s%3DaJtlhUBJ7Llw4vFB6t2Z2ueEDrYVVa64yK8Cckff7TVRAdhuF14FMVgIk1GzeeHcMMgx22UI05abBjBh3LodcDtMDMUFdHxsEga%2Bn4dNFSFW2RGh2%2FLyNYVwhIsr1DlAgb9ZeSZXs4rQ5thPdhAOVJnjcRpNOVfiBmql4c1TJSiMHuv7RoNv0YzeH%2FA0sTcbSDWpHTQEe8FtQKg6ctamqNunD5zZDR1%2BVAwHnr3YqlUU31sSns8GaFS2OujeQjFa5GeTFVAwS4L%2F%2BK%2FGY2Z6j1sKIHoTPeKtfJSWdUmBE94UwKMsvWj7aROGhEUGHWZ8&union_lens=lensId:TAPI@1791917508@213fd72a_148c_1a1369b48f2_b58c@01&skuId=6294673451398) |
| **Keyshowtime G768 / G775** | 索坦创新 Keyshowtime | 成品键盘 | 官方表述"搭载星闪赛事级芯片驱动，**联合星闪悦动自主调校**"；RT 0.001mm、8K、32K 全键扫描、0.125ms | 已上市 | [搜狐转载](https://m.sohu.com/a/1021534362_122744860) |
| **艾石头 IROK MG75 Pro / MG75 MAX** | 艾石头 IROK | 成品键盘 | 星闪悦动方案；Pro 版 RT 0.005mm / 8K；MAX 版"星闪 480 系列"、RT 0.001mm、全铝机身 | 已上市，339~468 元 | [什么值得买百科（二手汇总）](https://wiki.smzdm.com/p/r6er37d) |

---

## 四、待确认 / 存疑项（务必标注）

| 项目 | 疑问点 | 现有证据 |
| :--- | :--- | :--- |
| **VGN 霓虹** | 发布会只明说"闪电"用双子星 Extreme，"霓虹"未点名方案 | 仅"类闪电 ID 设计"的旁证 |
| **七彩虹穿云玄甲系列的"星闪火星8K / 海王星8K"** | 无法确认这两个方案名是星闪悦动出品，还是仅借用"星闪"前缀 | 七彩虹官方微博 + 什么值得买分档文章（后者把其归入"星闪悦动方案第一档"） |
| **维咖 EG75 的方案名** | 官方新闻说"双子星"，京东标题却写"星闪天王星" | 两处口径不一致，可能为销售文案差异 |
| **前行者 DEEP68 Pro / Deep80** | 部分导购文章称其为星闪悦动方案，未见官方标注 | 仅导购汇总页提及 |
| **艾石头 MG75 系列** | 来源为导购百科（用户生成内容），非官方规格页 | 未在艾石头官网查证 |
| **Keyshowtime G768 / G775** | "联合星闪悦动自主调校"是品牌自述，非方案商确认 | 搜狐转载稿 |
| **狼蛛 F68 RX 报道笔误** | IT之家原文后半段把 F68 RX 写成"F98 RX"（"狼蛛在 F98 RX 键盘上提供了四种配置"） | 原文如此，应为笔误 |
| **MCHOSE 迈从 Jet 75 HE** | **很可能是自研方案，非星闪悦动** | 官方标称扫描率 128KHz，与星闪悦动典型 256KHz 不符；未提及星闪悦动 |
| **各方案的具体芯片型号** | 全网公开资料均只写"双 MCU / 三核 MCU"，**没有一家给出具体主控料号** | 若需料号，只能拆机或向厂商索取 |

---

## 五、结论速览

- **成品键盘**是星闪悦动方案的主力战场，目前可直接查证的合作品牌至少 **10 家**：前行者、狼蛛、维咖、VGN、黑爵、重力星球、VICTKONG、七彩虹（待确认）、索坦创新、艾石头（待确认）。
- **客制化 PCB**只有**极少数**：星闪悦动自家的 **META60 / XS60**，以及 WuqueStudio 的 **Flux60 HE**。整体是"方案商出公版板 → 品牌做成品"，而非开源社区路线。
- **全部为有线磁轴键盘**，主打 8K 回报率 / 256kHz 扫描 / RT 0.001mm / 0.08ms 延迟，与「星闪 NearLink 无线」不是同一条技术路线。
