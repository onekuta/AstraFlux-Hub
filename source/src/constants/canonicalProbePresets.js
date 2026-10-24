/**
 * 星闪社区与官方全量键盘硬件标准规范档案库 (Probe Hardware Schema v1.4.1)
 * 每一把键盘均严格遵循探针全量高精硬件规格：
 * meta, hardwareFingerprint, deviceProfile, matrixLayout, lightingTopology, performanceSpec, axisAndCalibration
 */

export const CANONICAL_PROBE_PRESETS = [
  {
    "meta": {
      "probeVersion": "v1.4.1",
      "collectedAt": "2026-10-14T16:41:01.476Z",
      "generator": "SparkLink PlayJoy Community Keyboard Database Registry",
      "isSparklinkDevice": true,
      "verificationStatus": "VERIFIED_SPARKLINK_PLAYJOY",
      "brandName": "iMK 工作室"
    },
    "hardwareFingerprint": {
      "vendorIdHex": "0x1CA6",
      "productIdHex": "0x1B07",
      "vendorIdDec": 7334,
      "productIdDec": 6919,
      "brand": "iMK 工作室",
      "brandName": "iMK 工作室",
      "manufacturerName": "iMK 工作室",
      "productName": "iMK 逐日 Chase 61 星闪客制化磁轴",
      "rawUsbProductName": "Chase 61 逐日",
      "serialNumber": "[未导出/隐私保护脱敏]",
      "hidInterfaces": [
        {
          "usagePage": 65456,
          "usage": 1,
          "usagePageHex": "0xFFB0",
          "usageHex": "0x0001",
          "isSparklinkVendorPort": true,
          "isStandardKeyboardPort": false
        }
      ]
    },
    "deviceProfile": {
      "id": "pcb_0x1ca6_0x1b07",
      "brand": "iMK 工作室",
      "brandName": "iMK 工作室",
      "model": "Chase 61 逐日",
      "name": "iMK 逐日 Chase 61 星闪客制化磁轴",
      "shortName": "Chase 61 逐日",
      "type": "keyboard",
      "layout": "60keys",
      "layoutName": "标准61配列",
      "totalKeyCount": 61,
      "vendorId": 7334,
      "productId": 6919,
      "vendorIdHex": "0x1CA6",
      "productIdHex": "0x1B07",
      "connectionType": "wired",
      "connectionLabel": "USB 极速有线",
      "isWired": true,
      "hasBattery": false,
      "maxPollingRate": 8000,
      "hardRateCeiling": 8000,
      "supportedPollingRates": [
        1000,
        2000,
        4000,
        8000
      ],
      "defaultPollingRate": 8000,
      "minActuationPoint": 0.005,
      "defaultAxis": "佳达隆磁玉 Pro",
      "features": {
        "magneticAxis": true,
        "rtSupport": true,
        "socdSupport": true,
        "furyMode": true,
        "rgbLighting": true,
        "hallCalibration": true,
        "continuousRt": true,
        "doubleLighting": false,
        "stripLighting": true,
        "shakeOptimization": true,
        "spaceMultiLamp": true,
        "dksSupport": true,
        "mptSupport": true
      }
    },
    "matrixLayout": {
      "totalKeys": 61,
      "matrixRows": 5,
      "matrixCols": 14,
      "layoutCategory": "60keys",
      "layoutName": "标准61配列",
      "physicalKeys": [
        {
          "row": 1,
          "col": 0,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Esc"
        },
        {
          "row": 1,
          "col": 1,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "1"
        },
        {
          "row": 1,
          "col": 2,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "2"
        },
        {
          "row": 1,
          "col": 3,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "3"
        },
        {
          "row": 1,
          "col": 4,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "4"
        },
        {
          "row": 1,
          "col": 5,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "5"
        },
        {
          "row": 1,
          "col": 6,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "6"
        },
        {
          "row": 1,
          "col": 7,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "7"
        },
        {
          "row": 1,
          "col": 8,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "8"
        },
        {
          "row": 1,
          "col": 9,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "9"
        },
        {
          "row": 1,
          "col": 10,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "0"
        },
        {
          "row": 1,
          "col": 11,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "-"
        },
        {
          "row": 1,
          "col": 12,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "="
        },
        {
          "row": 1,
          "col": 13,
          "ratio": 2,
          "defaultKeycode": 0,
          "label": "Backspace"
        },
        {
          "row": 2,
          "col": 0,
          "ratio": 1.5,
          "defaultKeycode": 0,
          "label": "Tab"
        },
        {
          "row": 2,
          "col": 1,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Q"
        },
        {
          "row": 2,
          "col": 2,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "W"
        },
        {
          "row": 2,
          "col": 3,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "E"
        },
        {
          "row": 2,
          "col": 4,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "R"
        },
        {
          "row": 2,
          "col": 5,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "T"
        },
        {
          "row": 2,
          "col": 6,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Y"
        },
        {
          "row": 2,
          "col": 7,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "U"
        },
        {
          "row": 2,
          "col": 8,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "I"
        },
        {
          "row": 2,
          "col": 9,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "O"
        },
        {
          "row": 2,
          "col": 10,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "P"
        },
        {
          "row": 2,
          "col": 11,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "["
        },
        {
          "row": 2,
          "col": 12,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "]"
        },
        {
          "row": 2,
          "col": 13,
          "ratio": 1.5,
          "defaultKeycode": 0,
          "label": "\\"
        },
        {
          "row": 3,
          "col": 0,
          "ratio": 1.75,
          "defaultKeycode": 0,
          "label": "Caps"
        },
        {
          "row": 3,
          "col": 1,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "A"
        },
        {
          "row": 3,
          "col": 2,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "S"
        },
        {
          "row": 3,
          "col": 3,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "D"
        },
        {
          "row": 3,
          "col": 4,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F"
        },
        {
          "row": 3,
          "col": 5,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "G"
        },
        {
          "row": 3,
          "col": 6,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "H"
        },
        {
          "row": 3,
          "col": 7,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "J"
        },
        {
          "row": 3,
          "col": 8,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "K"
        },
        {
          "row": 3,
          "col": 9,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "L"
        },
        {
          "row": 3,
          "col": 10,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": ";"
        },
        {
          "row": 3,
          "col": 11,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "'"
        },
        {
          "row": 3,
          "col": 13,
          "ratio": 2.25,
          "defaultKeycode": 0,
          "label": "Enter"
        },
        {
          "row": 4,
          "col": 0,
          "ratio": 2.25,
          "defaultKeycode": 0,
          "label": "Shift"
        },
        {
          "row": 4,
          "col": 2,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Z"
        },
        {
          "row": 4,
          "col": 3,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "X"
        },
        {
          "row": 4,
          "col": 4,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "C"
        },
        {
          "row": 4,
          "col": 5,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "V"
        },
        {
          "row": 4,
          "col": 6,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "B"
        },
        {
          "row": 4,
          "col": 7,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "N"
        },
        {
          "row": 4,
          "col": 8,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "M"
        },
        {
          "row": 4,
          "col": 9,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": ","
        },
        {
          "row": 4,
          "col": 10,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "."
        },
        {
          "row": 4,
          "col": 11,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "/"
        },
        {
          "row": 4,
          "col": 12,
          "ratio": 2.75,
          "defaultKeycode": 0,
          "label": "Shift"
        },
        {
          "row": 5,
          "col": 0,
          "ratio": 1.25,
          "defaultKeycode": 0,
          "label": "Ctrl"
        },
        {
          "row": 5,
          "col": 1,
          "ratio": 1.25,
          "defaultKeycode": 0,
          "label": "Win"
        },
        {
          "row": 5,
          "col": 2,
          "ratio": 1.25,
          "defaultKeycode": 0,
          "label": "Alt"
        },
        {
          "row": 5,
          "col": 6,
          "ratio": 6.25,
          "defaultKeycode": 0,
          "label": "Space"
        },
        {
          "row": 5,
          "col": 9,
          "ratio": 1.25,
          "defaultKeycode": 0,
          "label": "Alt"
        },
        {
          "row": 5,
          "col": 10,
          "ratio": 1.25,
          "defaultKeycode": 0,
          "label": "Win"
        },
        {
          "row": 5,
          "col": 11,
          "ratio": 1.25,
          "defaultKeycode": 0,
          "label": "App"
        },
        {
          "row": 5,
          "col": 12,
          "ratio": 1.25,
          "defaultKeycode": 0,
          "label": "Ctrl"
        }
      ]
    },
    "lightingTopology": {
      "totalLeds": 61,
      "mainMatrixLeds": 61,
      "isDoubleLighting": false,
      "doubleLightingRaw": 0,
      "lampStructure": "常规单灯位",
      "spaceLamps": {
        "hasIndependentSpaceLamps": true,
        "count": 5
      },
      "stripLighting": {
        "hasStrip": true,
        "count": 24,
        "rows": 1,
        "label": "24颗电竞氛围底灯"
      },
      "decorateLighting": {
        "count": 24,
        "rows": 1,
        "label": "24颗电竞氛围底灯"
      },
      "supportedEffects": [
        "Static",
        "Breathing",
        "Neon",
        "Wave",
        "Ripple",
        "SingleLight",
        "Flash",
        "Raindrop"
      ]
    },
    "performanceSpec": {
      "supportedPollingRates": [
        1000,
        2000,
        4000,
        8000
      ],
      "currentPollingRate": 8000,
      "maxPollingRate": 8000,
      "hardwareRateCeiling": 8000,
      "rtPrecisionMm": 0.005,
      "higherKeyCapabilities": {
        "rs": true,
        "socd": true,
        "dks": true,
        "mt": true,
        "tgl": true,
        "mpt": true,
        "end": true
      }
    },
    "axisAndCalibration": {
      "boardAxisList": [
        {
          "id": 1,
          "name": "佳达隆磁玉 Pro",
          "stroke": 3.5,
          "minAp": 0.005,
          "maxAp": 3.4
        },
        {
          "id": 2,
          "name": "凯华知夏磁轴",
          "stroke": 3.8,
          "minAp": 0.005,
          "maxAp": 3.7
        },
        {
          "id": 3,
          "name": "悟空磁轴",
          "stroke": 3.6,
          "minAp": 0.005,
          "maxAp": 3.5
        }
      ],
      "defaultAxis": "佳达隆磁玉 Pro",
      "travelRangeMm": 4,
      "deadzoneMm": 0.005,
      "minActuationMm": 0.005,
      "currentCalibration": {
        "minAdc": 90,
        "maxAdc": 4020,
        "precisionMm": 0.005
      }
    }
  },
  {
    "meta": {
      "probeVersion": "v1.4.1",
      "collectedAt": "2026-10-14T16:41:01.476Z",
      "generator": "SparkLink PlayJoy Community Keyboard Database Registry",
      "isSparklinkDevice": true,
      "verificationStatus": "VERIFIED_SPARKLINK_PLAYJOY",
      "brandName": "VICTKONG"
    },
    "hardwareFingerprint": {
      "vendorIdHex": "0x1CA6",
      "productIdHex": "0x7A02",
      "vendorIdDec": 7334,
      "productIdDec": 31234,
      "brand": "VICTKONG",
      "brandName": "VICTKONG",
      "manufacturerName": "VICTKONG",
      "productName": "VICTKONG DV63 磁轴键盘",
      "rawUsbProductName": "DV63",
      "serialNumber": "[未导出/隐私保护脱敏]",
      "hidInterfaces": [
        {
          "usagePage": 65456,
          "usage": 1,
          "usagePageHex": "0xFFB0",
          "usageHex": "0x0001",
          "isSparklinkVendorPort": true,
          "isStandardKeyboardPort": false
        }
      ]
    },
    "deviceProfile": {
      "id": "pcb_0x1ca6_0x7a02",
      "brand": "VICTKONG",
      "brandName": "VICTKONG",
      "model": "DV63",
      "name": "VICTKONG DV63 磁轴键盘",
      "shortName": "DV63",
      "type": "keyboard",
      "layout": "64keys",
      "layoutName": "左移64配列",
      "totalKeyCount": 64,
      "vendorId": 7334,
      "productId": 31234,
      "vendorIdHex": "0x1CA6",
      "productIdHex": "0x7A02",
      "connectionType": "wired",
      "connectionLabel": "USB 极速有线",
      "isWired": true,
      "hasBattery": false,
      "maxPollingRate": 8000,
      "hardRateCeiling": 8000,
      "supportedPollingRates": [
        1000,
        2000,
        4000,
        8000
      ],
      "defaultPollingRate": 8000,
      "minActuationPoint": 0.01,
      "defaultAxis": "双子星自研马轴",
      "features": {
        "magneticAxis": true,
        "rtSupport": true,
        "socdSupport": true,
        "furyMode": true,
        "rgbLighting": true,
        "hallCalibration": true,
        "continuousRt": false,
        "doubleLighting": false,
        "stripLighting": false,
        "shakeOptimization": true,
        "spaceMultiLamp": false,
        "dksSupport": true,
        "mptSupport": true
      }
    },
    "matrixLayout": {
      "totalKeys": 64,
      "matrixRows": 5,
      "matrixCols": 14,
      "layoutCategory": "64keys",
      "layoutName": "左移64配列",
      "physicalKeys": [
        {
          "row": 1,
          "col": 0,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Esc"
        },
        {
          "row": 1,
          "col": 1,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "1"
        },
        {
          "row": 1,
          "col": 2,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "2"
        },
        {
          "row": 1,
          "col": 3,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "3"
        },
        {
          "row": 1,
          "col": 4,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "4"
        },
        {
          "row": 1,
          "col": 5,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "5"
        },
        {
          "row": 1,
          "col": 6,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "6"
        },
        {
          "row": 1,
          "col": 7,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "7"
        },
        {
          "row": 1,
          "col": 8,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "8"
        },
        {
          "row": 1,
          "col": 9,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "9"
        },
        {
          "row": 1,
          "col": 10,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "0"
        },
        {
          "row": 1,
          "col": 11,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "-"
        },
        {
          "row": 1,
          "col": 12,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "="
        },
        {
          "row": 1,
          "col": 13,
          "ratio": 2,
          "defaultKeycode": 0,
          "label": "Backspace"
        },
        {
          "row": 2,
          "col": 0,
          "ratio": 1.5,
          "defaultKeycode": 0,
          "label": "Tab"
        },
        {
          "row": 2,
          "col": 1,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Q"
        },
        {
          "row": 2,
          "col": 2,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "W"
        },
        {
          "row": 2,
          "col": 3,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "E"
        },
        {
          "row": 2,
          "col": 4,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "R"
        },
        {
          "row": 2,
          "col": 5,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "T"
        },
        {
          "row": 2,
          "col": 6,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Y"
        },
        {
          "row": 2,
          "col": 7,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "U"
        },
        {
          "row": 2,
          "col": 8,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "I"
        },
        {
          "row": 2,
          "col": 9,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "O"
        },
        {
          "row": 2,
          "col": 10,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "P"
        },
        {
          "row": 2,
          "col": 11,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "["
        },
        {
          "row": 2,
          "col": 12,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "]"
        },
        {
          "row": 2,
          "col": 13,
          "ratio": 1.5,
          "defaultKeycode": 0,
          "label": "\\"
        },
        {
          "row": 3,
          "col": 0,
          "ratio": 1.75,
          "defaultKeycode": 0,
          "label": "Caps"
        },
        {
          "row": 3,
          "col": 1,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "A"
        },
        {
          "row": 3,
          "col": 2,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "S"
        },
        {
          "row": 3,
          "col": 3,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "D"
        },
        {
          "row": 3,
          "col": 4,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F"
        },
        {
          "row": 3,
          "col": 5,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "G"
        },
        {
          "row": 3,
          "col": 6,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "H"
        },
        {
          "row": 3,
          "col": 7,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "J"
        },
        {
          "row": 3,
          "col": 8,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "K"
        },
        {
          "row": 3,
          "col": 9,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "L"
        },
        {
          "row": 3,
          "col": 10,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": ";"
        },
        {
          "row": 3,
          "col": 11,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "'"
        },
        {
          "row": 3,
          "col": 13,
          "ratio": 2.25,
          "defaultKeycode": 0,
          "label": "Enter"
        },
        {
          "row": 4,
          "col": 0,
          "ratio": 2,
          "defaultKeycode": 0,
          "label": "Shift"
        },
        {
          "row": 4,
          "col": 2,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Z"
        },
        {
          "row": 4,
          "col": 3,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "X"
        },
        {
          "row": 4,
          "col": 4,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "C"
        },
        {
          "row": 4,
          "col": 5,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "V"
        },
        {
          "row": 4,
          "col": 6,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "B"
        },
        {
          "row": 4,
          "col": 7,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "N"
        },
        {
          "row": 4,
          "col": 8,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "M"
        },
        {
          "row": 4,
          "col": 9,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": ","
        },
        {
          "row": 4,
          "col": 10,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "."
        },
        {
          "row": 4,
          "col": 11,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "/"
        },
        {
          "row": 4,
          "col": 12,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Shift"
        },
        {
          "row": 4,
          "col": 13,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "↑"
        },
        {
          "row": 4,
          "col": 14,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Del"
        },
        {
          "row": 5,
          "col": 0,
          "ratio": 1.25,
          "defaultKeycode": 0,
          "label": "Ctrl"
        },
        {
          "row": 5,
          "col": 1,
          "ratio": 1.25,
          "defaultKeycode": 0,
          "label": "Win"
        },
        {
          "row": 5,
          "col": 2,
          "ratio": 1.25,
          "defaultKeycode": 0,
          "label": "Alt"
        },
        {
          "row": 5,
          "col": 6,
          "ratio": 6.25,
          "defaultKeycode": 0,
          "label": "Space"
        },
        {
          "row": 5,
          "col": 9,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Alt"
        },
        {
          "row": 5,
          "col": 10,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Fn"
        },
        {
          "row": 5,
          "col": 11,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "←"
        },
        {
          "row": 5,
          "col": 12,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "↓"
        },
        {
          "row": 5,
          "col": 13,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "→"
        }
      ]
    },
    "lightingTopology": {
      "totalLeds": 64,
      "mainMatrixLeds": 64,
      "isDoubleLighting": false,
      "doubleLightingRaw": 0,
      "lampStructure": "常规单灯位",
      "spaceLamps": {
        "hasIndependentSpaceLamps": false,
        "count": 1
      },
      "stripLighting": {
        "hasStrip": false
      },
      "supportedEffects": [
        "Static",
        "Breathing",
        "Neon",
        "Wave",
        "Ripple",
        "SingleLight",
        "Flash",
        "Raindrop"
      ]
    },
    "performanceSpec": {
      "supportedPollingRates": [
        1000,
        2000,
        4000,
        8000
      ],
      "currentPollingRate": 8000,
      "maxPollingRate": 8000,
      "hardwareRateCeiling": 8000,
      "rtPrecisionMm": 0.01,
      "shakeOptimizationSwitch": 1,
      "higherKeyCapabilities": {
        "rs": true,
        "socd": true,
        "dks": true,
        "mt": true,
        "tgl": true,
        "mpt": true,
        "end": true
      },
      "boardConfigSlots": {
        "total": 4,
        "current": "Config1",
        "list": [
          "Config1",
          "Config2",
          "Config3",
          "Config4"
        ]
      }
    },
    "axisAndCalibration": {
      "boardAxisList": [
        {
          "id": 1,
          "name": "双子星自研马轴",
          "stroke": 4,
          "minAp": 0.01,
          "maxAp": 3.9
        },
        {
          "id": 2,
          "name": "佳达隆磁玉 Pro",
          "stroke": 3.5,
          "minAp": 0.01,
          "maxAp": 3.4
        },
        {
          "id": 3,
          "name": "凯华知夏磁轴",
          "stroke": 3.8,
          "minAp": 0.01,
          "maxAp": 3.7
        }
      ],
      "defaultAxis": "双子星自研马轴",
      "travelRangeMm": 4,
      "deadzoneMm": 0.02,
      "minActuationMm": 0.01,
      "currentCalibration": {
        "minAdc": 150,
        "maxAdc": 3900,
        "precisionMm": 0.01
      }
    }
  },
  {
    "meta": {
      "probeVersion": "v1.4.1",
      "collectedAt": "2026-10-14T16:41:01.476Z",
      "generator": "SparkLink PlayJoy Community Keyboard Database Registry",
      "isSparklinkDevice": true,
      "verificationStatus": "VERIFIED_SPARKLINK_PLAYJOY",
      "brandName": "前行者 EWEADN"
    },
    "hardwareFingerprint": {
      "vendorIdHex": "0x1CA6",
      "productIdHex": "0x1C24",
      "vendorIdDec": 7334,
      "productIdDec": 7204,
      "brand": "前行者 EWEADN",
      "brandName": "前行者 EWEADN",
      "manufacturerName": "前行者 EWEADN",
      "productName": "前行者 ES68 破晓 磁轴键盘",
      "rawUsbProductName": "EWEADN ES68 Dawn",
      "serialNumber": "[未导出/隐私保护脱敏]",
      "hidInterfaces": [
        {
          "usagePage": 65456,
          "usage": 1,
          "usagePageHex": "0xFFB0",
          "usageHex": "0x0001",
          "isSparklinkVendorPort": true,
          "isStandardKeyboardPort": false
        }
      ]
    },
    "deviceProfile": {
      "id": "pcb_0x1ca6_0x1c24",
      "brand": "前行者 EWEADN",
      "brandName": "前行者 EWEADN",
      "model": "ES68 破晓",
      "name": "前行者 ES68 破晓 磁轴键盘",
      "shortName": "ES68 破晓",
      "type": "keyboard",
      "layout": "68keys",
      "layoutName": "紧凑68配列",
      "totalKeyCount": 68,
      "vendorId": 7334,
      "productId": 7204,
      "vendorIdHex": "0x1CA6",
      "productIdHex": "0x1C24",
      "connectionType": "wired",
      "connectionLabel": "USB 极速有线",
      "isWired": true,
      "hasBattery": false,
      "maxPollingRate": 8000,
      "hardRateCeiling": 32000,
      "supportedPollingRates": [
        1000,
        2000,
        4000,
        8000
      ],
      "defaultPollingRate": 8000,
      "minActuationPoint": 0.001,
      "defaultAxis": "前行者定制磁白轴",
      "features": {
        "magneticAxis": true,
        "rtSupport": true,
        "socdSupport": true,
        "furyMode": true,
        "rgbLighting": true,
        "hallCalibration": true,
        "continuousRt": false,
        "doubleLighting": false,
        "stripLighting": true,
        "shakeOptimization": true,
        "spaceMultiLamp": false,
        "dksSupport": true,
        "mptSupport": true
      }
    },
    "matrixLayout": {
      "totalKeys": 68,
      "matrixRows": 5,
      "matrixCols": 16,
      "layoutCategory": "68keys",
      "layoutName": "紧凑68配列",
      "physicalKeys": [
        {
          "row": 1,
          "col": 0,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Esc"
        },
        {
          "row": 1,
          "col": 1,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "1"
        },
        {
          "row": 1,
          "col": 2,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "2"
        },
        {
          "row": 1,
          "col": 3,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "3"
        },
        {
          "row": 1,
          "col": 4,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "4"
        },
        {
          "row": 1,
          "col": 5,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "5"
        },
        {
          "row": 1,
          "col": 6,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "6"
        },
        {
          "row": 1,
          "col": 7,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "7"
        },
        {
          "row": 1,
          "col": 8,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "8"
        },
        {
          "row": 1,
          "col": 9,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "9"
        },
        {
          "row": 1,
          "col": 10,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "0"
        },
        {
          "row": 1,
          "col": 11,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "-"
        },
        {
          "row": 1,
          "col": 12,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "="
        },
        {
          "row": 1,
          "col": 13,
          "ratio": 2,
          "defaultKeycode": 0,
          "label": "Backspace"
        },
        {
          "row": 1,
          "col": 14,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Del"
        },
        {
          "row": 2,
          "col": 0,
          "ratio": 1.5,
          "defaultKeycode": 0,
          "label": "Tab"
        },
        {
          "row": 2,
          "col": 1,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Q"
        },
        {
          "row": 2,
          "col": 2,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "W"
        },
        {
          "row": 2,
          "col": 3,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "E"
        },
        {
          "row": 2,
          "col": 4,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "R"
        },
        {
          "row": 2,
          "col": 5,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "T"
        },
        {
          "row": 2,
          "col": 6,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Y"
        },
        {
          "row": 2,
          "col": 7,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "U"
        },
        {
          "row": 2,
          "col": 8,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "I"
        },
        {
          "row": 2,
          "col": 9,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "O"
        },
        {
          "row": 2,
          "col": 10,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "P"
        },
        {
          "row": 2,
          "col": 11,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "["
        },
        {
          "row": 2,
          "col": 12,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "]"
        },
        {
          "row": 2,
          "col": 13,
          "ratio": 1.5,
          "defaultKeycode": 0,
          "label": "\\"
        },
        {
          "row": 2,
          "col": 14,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Home"
        },
        {
          "row": 3,
          "col": 0,
          "ratio": 1.75,
          "defaultKeycode": 0,
          "label": "Caps"
        },
        {
          "row": 3,
          "col": 1,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "A"
        },
        {
          "row": 3,
          "col": 2,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "S"
        },
        {
          "row": 3,
          "col": 3,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "D"
        },
        {
          "row": 3,
          "col": 4,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F"
        },
        {
          "row": 3,
          "col": 5,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "G"
        },
        {
          "row": 3,
          "col": 6,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "H"
        },
        {
          "row": 3,
          "col": 7,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "J"
        },
        {
          "row": 3,
          "col": 8,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "K"
        },
        {
          "row": 3,
          "col": 9,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "L"
        },
        {
          "row": 3,
          "col": 10,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": ";"
        },
        {
          "row": 3,
          "col": 11,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "'"
        },
        {
          "row": 3,
          "col": 13,
          "ratio": 2.25,
          "defaultKeycode": 0,
          "label": "Enter"
        },
        {
          "row": 3,
          "col": 14,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "PgUp"
        },
        {
          "row": 4,
          "col": 0,
          "ratio": 2.25,
          "defaultKeycode": 0,
          "label": "Shift"
        },
        {
          "row": 4,
          "col": 2,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Z"
        },
        {
          "row": 4,
          "col": 3,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "X"
        },
        {
          "row": 4,
          "col": 4,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "C"
        },
        {
          "row": 4,
          "col": 5,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "V"
        },
        {
          "row": 4,
          "col": 6,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "B"
        },
        {
          "row": 4,
          "col": 7,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "N"
        },
        {
          "row": 4,
          "col": 8,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "M"
        },
        {
          "row": 4,
          "col": 9,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": ","
        },
        {
          "row": 4,
          "col": 10,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "."
        },
        {
          "row": 4,
          "col": 11,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "/"
        },
        {
          "row": 4,
          "col": 12,
          "ratio": 1.75,
          "defaultKeycode": 0,
          "label": "Shift"
        },
        {
          "row": 4,
          "col": 13,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "↑"
        },
        {
          "row": 4,
          "col": 14,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "PgDn"
        },
        {
          "row": 5,
          "col": 0,
          "ratio": 1.25,
          "defaultKeycode": 0,
          "label": "Ctrl"
        },
        {
          "row": 5,
          "col": 1,
          "ratio": 1.25,
          "defaultKeycode": 0,
          "label": "Win"
        },
        {
          "row": 5,
          "col": 2,
          "ratio": 1.25,
          "defaultKeycode": 0,
          "label": "Alt"
        },
        {
          "row": 5,
          "col": 6,
          "ratio": 5.5,
          "defaultKeycode": 0,
          "label": "Space"
        },
        {
          "row": 5,
          "col": 9,
          "ratio": 1.25,
          "defaultKeycode": 0,
          "label": "Alt"
        },
        {
          "row": 5,
          "col": 10,
          "ratio": 1.25,
          "defaultKeycode": 0,
          "label": "Fn"
        },
        {
          "row": 5,
          "col": 11,
          "ratio": 1.25,
          "defaultKeycode": 0,
          "label": "Ctrl"
        },
        {
          "row": 5,
          "col": 12,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "←"
        },
        {
          "row": 5,
          "col": 13,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "↓"
        },
        {
          "row": 5,
          "col": 14,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "→"
        }
      ]
    },
    "lightingTopology": {
      "totalLeds": 94,
      "mainMatrixLeds": 68,
      "isDoubleLighting": false,
      "doubleLightingRaw": 0,
      "lampStructure": "常规单灯位",
      "spaceLamps": {
        "hasIndependentSpaceLamps": false,
        "count": 1
      },
      "stripLighting": {
        "hasStrip": true,
        "position": "front_through",
        "cols": 26,
        "ledHeight": 10,
        "label": "贯穿式正面灯带 (26列)"
      },
      "decorateLighting": {
        "hasDecorate": true,
        "label": "氛围侧翼灯"
      },
      "supportedEffects": [
        "Static",
        "Breathing",
        "Neon",
        "Wave",
        "Ripple",
        "SingleLight",
        "Flash",
        "Raindrop",
        "CustomMatrix"
      ]
    },
    "performanceSpec": {
      "supportedPollingRates": [
        1000,
        2000,
        4000,
        8000
      ],
      "currentPollingRate": 8000,
      "maxPollingRate": 8000,
      "hardwareRateCeiling": 32000,
      "rtPrecisionMm": 0.001,
      "shakeOptimizationSwitch": 1,
      "higherKeyCapabilities": {
        "rs": true,
        "socd": true,
        "dks": true,
        "mt": true,
        "tgl": true,
        "mpt": true,
        "end": true
      },
      "boardConfigSlots": {
        "total": 4,
        "current": "Config1",
        "list": [
          "Config1",
          "Config2",
          "Config3",
          "Config4"
        ]
      }
    },
    "axisAndCalibration": {
      "boardAxisList": [
        {
          "id": 1,
          "name": "前行者定制磁白轴",
          "stroke": 3.5,
          "minAp": 0.001,
          "maxAp": 3.4
        },
        {
          "id": 2,
          "name": "佳达隆磁玉 Pro",
          "stroke": 3.5,
          "minAp": 0.001,
          "maxAp": 3.4
        },
        {
          "id": 3,
          "name": "凯华知夏磁轴",
          "stroke": 3.8,
          "minAp": 0.001,
          "maxAp": 3.7
        },
        {
          "id": 4,
          "name": "双子星自研马轴",
          "stroke": 4,
          "minAp": 0.001,
          "maxAp": 3.9
        }
      ],
      "defaultAxis": "前行者定制磁白轴",
      "travelRangeMm": 4,
      "deadzoneMm": 0.02,
      "minActuationMm": 0.001,
      "currentCalibration": {
        "minAdc": 120,
        "maxAdc": 3950,
        "precisionMm": 0.001
      }
    }
  },
  {
    "meta": {
      "probeVersion": "v1.4.1",
      "collectedAt": "2026-10-14T16:41:01.476Z",
      "generator": "SparkLink PlayJoy Community Keyboard Database Registry",
      "isSparklinkDevice": true,
      "verificationStatus": "VERIFIED_SPARKLINK_PLAYJOY",
      "brandName": "星闪公版方案"
    },
    "hardwareFingerprint": {
      "vendorIdHex": "0x1CA6",
      "productIdHex": "0x1C33",
      "vendorIdDec": 7334,
      "productIdDec": 7219,
      "brand": "星闪公版方案",
      "brandName": "星闪公版方案",
      "manufacturerName": "星闪公版方案",
      "productName": "星闪 104 键全尺寸磁轴键盘",
      "rawUsbProductName": "NearLink 104",
      "serialNumber": "[未导出/隐私保护脱敏]",
      "hidInterfaces": [
        {
          "usagePage": 65456,
          "usage": 1,
          "usagePageHex": "0xFFB0",
          "usageHex": "0x0001",
          "isSparklinkVendorPort": true,
          "isStandardKeyboardPort": false
        }
      ]
    },
    "deviceProfile": {
      "id": "pcb_0x1ca6_0x1c33",
      "brand": "星闪公版方案",
      "brandName": "星闪公版方案",
      "model": "NearLink 104",
      "name": "星闪 104 键全尺寸磁轴键盘",
      "shortName": "NearLink 104",
      "type": "keyboard",
      "layout": "104keys",
      "layoutName": "104全尺寸办公与电竞配列",
      "totalKeyCount": 104,
      "vendorId": 7334,
      "productId": 7219,
      "vendorIdHex": "0x1CA6",
      "productIdHex": "0x1C33",
      "connectionType": "wired",
      "connectionLabel": "USB 极速有线",
      "isWired": true,
      "hasBattery": false,
      "maxPollingRate": 8000,
      "hardRateCeiling": 8000,
      "supportedPollingRates": [
        1000,
        2000,
        4000,
        8000
      ],
      "defaultPollingRate": 8000,
      "minActuationPoint": 0.01,
      "defaultAxis": "佳达隆磁玉 Pro",
      "features": {
        "magneticAxis": true,
        "rtSupport": true,
        "socdSupport": true,
        "furyMode": true,
        "rgbLighting": true,
        "hallCalibration": true,
        "continuousRt": false,
        "doubleLighting": false,
        "stripLighting": false,
        "shakeOptimization": true,
        "spaceMultiLamp": false
      }
    },
    "matrixLayout": {
      "totalKeys": 104,
      "matrixRows": 6,
      "matrixCols": 21,
      "layoutCategory": "104keys",
      "layoutName": "104全尺寸办公与电竞配列",
      "physicalKeys": [
        {
          "row": 0,
          "col": 0,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Esc"
        },
        {
          "row": 0,
          "col": 1,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F1"
        },
        {
          "row": 0,
          "col": 2,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F2"
        },
        {
          "row": 0,
          "col": 3,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F3"
        },
        {
          "row": 0,
          "col": 4,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F4"
        },
        {
          "row": 0,
          "col": 5,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F5"
        },
        {
          "row": 0,
          "col": 6,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F6"
        },
        {
          "row": 0,
          "col": 7,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F7"
        },
        {
          "row": 0,
          "col": 8,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F8"
        },
        {
          "row": 0,
          "col": 9,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F9"
        },
        {
          "row": 0,
          "col": 10,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F10"
        },
        {
          "row": 0,
          "col": 11,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F11"
        },
        {
          "row": 0,
          "col": 12,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F12"
        },
        {
          "row": 0,
          "col": 13,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "PrSc"
        },
        {
          "row": 0,
          "col": 14,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "ScLk"
        },
        {
          "row": 0,
          "col": 15,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Paus"
        },
        {
          "row": 1,
          "col": 0,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "`"
        },
        {
          "row": 1,
          "col": 1,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "1"
        },
        {
          "row": 1,
          "col": 2,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "2"
        },
        {
          "row": 1,
          "col": 3,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "3"
        },
        {
          "row": 1,
          "col": 4,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "4"
        },
        {
          "row": 1,
          "col": 5,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "5"
        },
        {
          "row": 1,
          "col": 6,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "6"
        },
        {
          "row": 1,
          "col": 7,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "7"
        },
        {
          "row": 1,
          "col": 8,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "8"
        },
        {
          "row": 1,
          "col": 9,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "9"
        },
        {
          "row": 1,
          "col": 10,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "0"
        },
        {
          "row": 1,
          "col": 11,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "-"
        },
        {
          "row": 1,
          "col": 12,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "="
        },
        {
          "row": 1,
          "col": 13,
          "ratio": 2,
          "defaultKeycode": 0,
          "label": "Backspace"
        },
        {
          "row": 1,
          "col": 14,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Ins"
        },
        {
          "row": 1,
          "col": 15,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Home"
        },
        {
          "row": 1,
          "col": 16,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "PgUp"
        },
        {
          "row": 1,
          "col": 17,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Num"
        },
        {
          "row": 1,
          "col": 18,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "/"
        },
        {
          "row": 1,
          "col": 19,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "*"
        },
        {
          "row": 1,
          "col": 20,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "-"
        },
        {
          "row": 2,
          "col": 0,
          "ratio": 1.5,
          "defaultKeycode": 0,
          "label": "Tab"
        },
        {
          "row": 2,
          "col": 1,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Q"
        },
        {
          "row": 2,
          "col": 2,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "W"
        },
        {
          "row": 2,
          "col": 3,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "E"
        },
        {
          "row": 2,
          "col": 4,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "R"
        },
        {
          "row": 2,
          "col": 5,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "T"
        },
        {
          "row": 2,
          "col": 6,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Y"
        },
        {
          "row": 2,
          "col": 7,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "U"
        },
        {
          "row": 2,
          "col": 8,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "I"
        },
        {
          "row": 2,
          "col": 9,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "O"
        },
        {
          "row": 2,
          "col": 10,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "P"
        },
        {
          "row": 2,
          "col": 11,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "["
        },
        {
          "row": 2,
          "col": 12,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "]"
        },
        {
          "row": 2,
          "col": 13,
          "ratio": 1.5,
          "defaultKeycode": 0,
          "label": "\\"
        },
        {
          "row": 2,
          "col": 14,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Del"
        },
        {
          "row": 2,
          "col": 15,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "End"
        },
        {
          "row": 2,
          "col": 16,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "PgDn"
        },
        {
          "row": 2,
          "col": 17,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "7"
        },
        {
          "row": 2,
          "col": 18,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "8"
        },
        {
          "row": 2,
          "col": 19,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "9"
        },
        {
          "row": 2,
          "col": 20,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "+"
        },
        {
          "row": 3,
          "col": 0,
          "ratio": 1.75,
          "defaultKeycode": 0,
          "label": "Caps"
        },
        {
          "row": 3,
          "col": 1,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "A"
        },
        {
          "row": 3,
          "col": 2,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "S"
        },
        {
          "row": 3,
          "col": 3,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "D"
        },
        {
          "row": 3,
          "col": 4,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F"
        },
        {
          "row": 3,
          "col": 5,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "G"
        },
        {
          "row": 3,
          "col": 6,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "H"
        },
        {
          "row": 3,
          "col": 7,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "J"
        },
        {
          "row": 3,
          "col": 8,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "K"
        },
        {
          "row": 3,
          "col": 9,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "L"
        },
        {
          "row": 3,
          "col": 10,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": ";"
        },
        {
          "row": 3,
          "col": 11,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "'"
        },
        {
          "row": 3,
          "col": 13,
          "ratio": 2.25,
          "defaultKeycode": 0,
          "label": "Enter"
        },
        {
          "row": 3,
          "col": 14,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "4"
        },
        {
          "row": 3,
          "col": 15,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "5"
        },
        {
          "row": 3,
          "col": 16,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "6"
        },
        {
          "row": 4,
          "col": 0,
          "ratio": 2.25,
          "defaultKeycode": 0,
          "label": "Shift"
        },
        {
          "row": 4,
          "col": 2,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Z"
        },
        {
          "row": 4,
          "col": 3,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "X"
        },
        {
          "row": 4,
          "col": 4,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "C"
        },
        {
          "row": 4,
          "col": 5,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "V"
        },
        {
          "row": 4,
          "col": 6,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "B"
        },
        {
          "row": 4,
          "col": 7,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "N"
        },
        {
          "row": 4,
          "col": 8,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "M"
        },
        {
          "row": 4,
          "col": 9,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": ","
        },
        {
          "row": 4,
          "col": 10,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "."
        },
        {
          "row": 4,
          "col": 11,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "/"
        },
        {
          "row": 4,
          "col": 12,
          "ratio": 2.75,
          "defaultKeycode": 0,
          "label": "Shift"
        },
        {
          "row": 4,
          "col": 14,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "↑"
        },
        {
          "row": 4,
          "col": 15,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "1"
        },
        {
          "row": 4,
          "col": 16,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "2"
        },
        {
          "row": 4,
          "col": 17,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "3"
        },
        {
          "row": 4,
          "col": 18,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Ent"
        },
        {
          "row": 5,
          "col": 0,
          "ratio": 1.25,
          "defaultKeycode": 0,
          "label": "Ctrl"
        },
        {
          "row": 5,
          "col": 1,
          "ratio": 1.25,
          "defaultKeycode": 0,
          "label": "Win"
        },
        {
          "row": 5,
          "col": 2,
          "ratio": 1.25,
          "defaultKeycode": 0,
          "label": "Alt"
        },
        {
          "row": 5,
          "col": 6,
          "ratio": 6.25,
          "defaultKeycode": 0,
          "label": "Space"
        },
        {
          "row": 5,
          "col": 9,
          "ratio": 1.25,
          "defaultKeycode": 0,
          "label": "Alt"
        },
        {
          "row": 5,
          "col": 10,
          "ratio": 1.25,
          "defaultKeycode": 0,
          "label": "Win"
        },
        {
          "row": 5,
          "col": 11,
          "ratio": 1.25,
          "defaultKeycode": 0,
          "label": "App"
        },
        {
          "row": 5,
          "col": 12,
          "ratio": 1.25,
          "defaultKeycode": 0,
          "label": "Ctrl"
        },
        {
          "row": 5,
          "col": 13,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "←"
        },
        {
          "row": 5,
          "col": 14,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "↓"
        },
        {
          "row": 5,
          "col": 15,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "→"
        },
        {
          "row": 5,
          "col": 16,
          "ratio": 2,
          "defaultKeycode": 0,
          "label": "0"
        },
        {
          "row": 5,
          "col": 17,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "."
        }
      ]
    },
    "lightingTopology": {
      "totalLeds": 104,
      "mainMatrixLeds": 104,
      "isDoubleLighting": false,
      "doubleLightingRaw": 0,
      "lampStructure": "常规单灯位",
      "spaceLamps": {
        "hasIndependentSpaceLamps": false,
        "count": 1
      },
      "stripLighting": {
        "hasStrip": false
      },
      "supportedEffects": [
        "Static",
        "Breathing",
        "Neon",
        "Wave",
        "Ripple",
        "SingleLight",
        "Flash",
        "Raindrop"
      ]
    },
    "performanceSpec": {
      "supportedPollingRates": [
        1000,
        2000,
        4000,
        8000
      ],
      "currentPollingRate": 8000,
      "maxPollingRate": 8000,
      "hardwareRateCeiling": 8000,
      "rtPrecisionMm": 0.01,
      "higherKeyCapabilities": {
        "rs": true,
        "socd": true,
        "dks": true,
        "mt": true,
        "tgl": true,
        "mpt": true,
        "end": true
      }
    },
    "axisAndCalibration": {
      "boardAxisList": [
        {
          "id": 1,
          "name": "佳达隆磁玉 Pro",
          "stroke": 3.5,
          "minAp": 0.01,
          "maxAp": 3.4
        },
        {
          "id": 2,
          "name": "双子星自研马轴",
          "stroke": 4,
          "minAp": 0.01,
          "maxAp": 3.9
        }
      ],
      "defaultAxis": "佳达隆磁玉 Pro",
      "travelRangeMm": 4,
      "deadzoneMm": 0.02,
      "minActuationMm": 0.01,
      "currentCalibration": {
        "minAdc": 140,
        "maxAdc": 3920,
        "precisionMm": 0.01
      }
    }
  },
  {
    "meta": {
      "probeVersion": "v1.4.1",
      "collectedAt": "2026-10-14T16:41:01.476Z",
      "generator": "SparkLink PlayJoy Community Keyboard Database Registry",
      "isSparklinkDevice": true,
      "verificationStatus": "VERIFIED_SPARKLINK_PLAYJOY",
      "brandName": "星闪公版方案"
    },
    "hardwareFingerprint": {
      "vendorIdHex": "0x1CA6",
      "productIdHex": "0x1C30",
      "vendorIdDec": 7334,
      "productIdDec": 7216,
      "brand": "星闪公版方案",
      "brandName": "星闪公版方案",
      "manufacturerName": "星闪公版 / 维咖合作款",
      "productName": "星闪 75% 竞技磁轴键盘",
      "rawUsbProductName": "NearLink 75",
      "serialNumber": "[未导出/隐私保护脱敏]",
      "hidInterfaces": [
        {
          "usagePage": 65456,
          "usage": 1,
          "usagePageHex": "0xFFB0",
          "usageHex": "0x0001",
          "isSparklinkVendorPort": true,
          "isStandardKeyboardPort": false
        }
      ]
    },
    "deviceProfile": {
      "id": "pcb_0x1ca6_0x1c30",
      "brand": "星闪公版方案",
      "brandName": "星闪公版方案",
      "model": "NearLink 75",
      "name": "星闪 75% 竞技磁轴键盘",
      "shortName": "NearLink 75",
      "type": "keyboard",
      "layout": "75keys",
      "layoutName": "75%电竞配列",
      "totalKeyCount": 82,
      "vendorId": 7334,
      "productId": 7216,
      "vendorIdHex": "0x1CA6",
      "productIdHex": "0x1C30",
      "connectionType": "wired",
      "connectionLabel": "USB 极速有线",
      "isWired": true,
      "hasBattery": false,
      "maxPollingRate": 8000,
      "hardRateCeiling": 8000,
      "supportedPollingRates": [
        1000,
        2000,
        4000,
        8000
      ],
      "defaultPollingRate": 8000,
      "minActuationPoint": 0.001,
      "defaultAxis": "佳达隆磁玉 Pro",
      "features": {
        "magneticAxis": true,
        "rtSupport": true,
        "socdSupport": true,
        "furyMode": true,
        "rgbLighting": true,
        "hallCalibration": true,
        "continuousRt": false,
        "doubleLighting": false,
        "stripLighting": false,
        "shakeOptimization": true,
        "spaceMultiLamp": true,
        "dksSupport": true,
        "mptSupport": true
      }
    },
    "matrixLayout": {
      "totalKeys": 82,
      "matrixRows": 6,
      "matrixCols": 16,
      "layoutCategory": "75keys",
      "layoutName": "75%电竞配列",
      "physicalKeys": [
        {
          "row": 0,
          "col": 0,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Esc"
        },
        {
          "row": 0,
          "col": 1,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F1"
        },
        {
          "row": 0,
          "col": 2,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F2"
        },
        {
          "row": 0,
          "col": 3,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F3"
        },
        {
          "row": 0,
          "col": 4,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F4"
        },
        {
          "row": 0,
          "col": 5,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F5"
        },
        {
          "row": 0,
          "col": 6,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F6"
        },
        {
          "row": 0,
          "col": 7,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F7"
        },
        {
          "row": 0,
          "col": 8,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F8"
        },
        {
          "row": 0,
          "col": 9,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F9"
        },
        {
          "row": 0,
          "col": 10,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F10"
        },
        {
          "row": 0,
          "col": 11,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F11"
        },
        {
          "row": 0,
          "col": 12,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F12"
        },
        {
          "row": 0,
          "col": 13,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Del"
        },
        {
          "row": 1,
          "col": 0,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "`"
        },
        {
          "row": 1,
          "col": 1,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "1"
        },
        {
          "row": 1,
          "col": 2,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "2"
        },
        {
          "row": 1,
          "col": 3,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "3"
        },
        {
          "row": 1,
          "col": 4,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "4"
        },
        {
          "row": 1,
          "col": 5,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "5"
        },
        {
          "row": 1,
          "col": 6,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "6"
        },
        {
          "row": 1,
          "col": 7,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "7"
        },
        {
          "row": 1,
          "col": 8,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "8"
        },
        {
          "row": 1,
          "col": 9,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "9"
        },
        {
          "row": 1,
          "col": 10,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "0"
        },
        {
          "row": 1,
          "col": 11,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "-"
        },
        {
          "row": 1,
          "col": 12,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "="
        },
        {
          "row": 1,
          "col": 13,
          "ratio": 2,
          "defaultKeycode": 0,
          "label": "Backspace"
        },
        {
          "row": 1,
          "col": 14,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Home"
        },
        {
          "row": 2,
          "col": 0,
          "ratio": 1.5,
          "defaultKeycode": 0,
          "label": "Tab"
        },
        {
          "row": 2,
          "col": 1,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Q"
        },
        {
          "row": 2,
          "col": 2,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "W"
        },
        {
          "row": 2,
          "col": 3,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "E"
        },
        {
          "row": 2,
          "col": 4,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "R"
        },
        {
          "row": 2,
          "col": 5,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "T"
        },
        {
          "row": 2,
          "col": 6,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Y"
        },
        {
          "row": 2,
          "col": 7,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "U"
        },
        {
          "row": 2,
          "col": 8,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "I"
        },
        {
          "row": 2,
          "col": 9,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "O"
        },
        {
          "row": 2,
          "col": 10,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "P"
        },
        {
          "row": 2,
          "col": 11,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "["
        },
        {
          "row": 2,
          "col": 12,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "]"
        },
        {
          "row": 2,
          "col": 13,
          "ratio": 1.5,
          "defaultKeycode": 0,
          "label": "\\"
        },
        {
          "row": 2,
          "col": 14,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "PgUp"
        },
        {
          "row": 3,
          "col": 0,
          "ratio": 1.75,
          "defaultKeycode": 0,
          "label": "Caps"
        },
        {
          "row": 3,
          "col": 1,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "A"
        },
        {
          "row": 3,
          "col": 2,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "S"
        },
        {
          "row": 3,
          "col": 3,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "D"
        },
        {
          "row": 3,
          "col": 4,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F"
        },
        {
          "row": 3,
          "col": 5,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "G"
        },
        {
          "row": 3,
          "col": 6,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "H"
        },
        {
          "row": 3,
          "col": 7,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "J"
        },
        {
          "row": 3,
          "col": 8,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "K"
        },
        {
          "row": 3,
          "col": 9,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "L"
        },
        {
          "row": 3,
          "col": 10,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": ";"
        },
        {
          "row": 3,
          "col": 11,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "'"
        },
        {
          "row": 3,
          "col": 13,
          "ratio": 2.25,
          "defaultKeycode": 0,
          "label": "Enter"
        },
        {
          "row": 3,
          "col": 14,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "PgDn"
        },
        {
          "row": 4,
          "col": 0,
          "ratio": 2.25,
          "defaultKeycode": 0,
          "label": "Shift"
        },
        {
          "row": 4,
          "col": 2,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Z"
        },
        {
          "row": 4,
          "col": 3,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "X"
        },
        {
          "row": 4,
          "col": 4,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "C"
        },
        {
          "row": 4,
          "col": 5,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "V"
        },
        {
          "row": 4,
          "col": 6,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "B"
        },
        {
          "row": 4,
          "col": 7,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "N"
        },
        {
          "row": 4,
          "col": 8,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "M"
        },
        {
          "row": 4,
          "col": 9,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": ","
        },
        {
          "row": 4,
          "col": 10,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "."
        },
        {
          "row": 4,
          "col": 11,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "/"
        },
        {
          "row": 4,
          "col": 12,
          "ratio": 1.75,
          "defaultKeycode": 0,
          "label": "Shift"
        },
        {
          "row": 4,
          "col": 13,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "↑"
        },
        {
          "row": 4,
          "col": 14,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "End"
        },
        {
          "row": 5,
          "col": 0,
          "ratio": 1.25,
          "defaultKeycode": 0,
          "label": "Ctrl"
        },
        {
          "row": 5,
          "col": 1,
          "ratio": 1.25,
          "defaultKeycode": 0,
          "label": "Win"
        },
        {
          "row": 5,
          "col": 2,
          "ratio": 1.25,
          "defaultKeycode": 0,
          "label": "Alt"
        },
        {
          "row": 5,
          "col": 6,
          "ratio": 6.25,
          "defaultKeycode": 0,
          "label": "Space"
        },
        {
          "row": 5,
          "col": 9,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Alt"
        },
        {
          "row": 5,
          "col": 10,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Fn"
        },
        {
          "row": 5,
          "col": 11,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Ctrl"
        },
        {
          "row": 5,
          "col": 12,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "←"
        },
        {
          "row": 5,
          "col": 13,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "↓"
        },
        {
          "row": 5,
          "col": 14,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "→"
        }
      ]
    },
    "lightingTopology": {
      "totalLeds": 82,
      "mainMatrixLeds": 82,
      "isDoubleLighting": false,
      "doubleLightingRaw": 0,
      "lampStructure": "常规单灯位",
      "spaceLamps": {
        "hasIndependentSpaceLamps": true,
        "count": 5
      },
      "stripLighting": {
        "hasStrip": false
      },
      "supportedEffects": [
        "Static",
        "Breathing",
        "Neon",
        "Wave",
        "Ripple",
        "SingleLight",
        "Flash",
        "Raindrop"
      ]
    },
    "performanceSpec": {
      "supportedPollingRates": [
        1000,
        2000,
        4000,
        8000
      ],
      "currentPollingRate": 8000,
      "maxPollingRate": 8000,
      "hardwareRateCeiling": 8000,
      "rtPrecisionMm": 0.001,
      "shakeOptimizationSwitch": 1,
      "higherKeyCapabilities": {
        "rs": true,
        "socd": true,
        "dks": true,
        "mt": true,
        "tgl": true,
        "mpt": true,
        "end": true
      }
    },
    "axisAndCalibration": {
      "boardAxisList": [
        {
          "id": 1,
          "name": "佳达隆磁玉 Pro",
          "stroke": 3.5,
          "minAp": 0.001,
          "maxAp": 3.4
        },
        {
          "id": 2,
          "name": "双子星自研马轴",
          "stroke": 4,
          "minAp": 0.001,
          "maxAp": 3.9
        },
        {
          "id": 3,
          "name": "凯华知夏磁轴",
          "stroke": 3.8,
          "minAp": 0.001,
          "maxAp": 3.7
        }
      ],
      "defaultAxis": "佳达隆磁玉 Pro",
      "travelRangeMm": 4,
      "deadzoneMm": 0.02,
      "minActuationMm": 0.001,
      "currentCalibration": {
        "minAdc": 120,
        "maxAdc": 3950,
        "precisionMm": 0.001
      }
    }
  },
  {
    "meta": {
      "probeVersion": "v1.4.1",
      "collectedAt": "2026-10-14T16:41:01.476Z",
      "generator": "SparkLink PlayJoy Community Keyboard Database Registry",
      "isSparklinkDevice": true,
      "verificationStatus": "VERIFIED_SPARKLINK_PLAYJOY",
      "brandName": "星闪公版方案"
    },
    "hardwareFingerprint": {
      "vendorIdHex": "0x1CA6",
      "productIdHex": "0x1C31",
      "vendorIdDec": 7334,
      "productIdDec": 7217,
      "brand": "星闪公版方案",
      "brandName": "星闪公版方案",
      "manufacturerName": "星闪公版方案",
      "productName": "星闪 87 键 TKL 磁轴键盘",
      "rawUsbProductName": "NearLink 87",
      "serialNumber": "[未导出/隐私保护脱敏]",
      "hidInterfaces": [
        {
          "usagePage": 65456,
          "usage": 1,
          "usagePageHex": "0xFFB0",
          "usageHex": "0x0001",
          "isSparklinkVendorPort": true,
          "isStandardKeyboardPort": false
        }
      ]
    },
    "deviceProfile": {
      "id": "pcb_0x1ca6_0x1c31",
      "brand": "星闪公版方案",
      "brandName": "星闪公版方案",
      "model": "NearLink 87",
      "name": "星闪 87 键 TKL 磁轴键盘",
      "shortName": "NearLink 87",
      "type": "keyboard",
      "layout": "87keys",
      "layoutName": "87键TKL电竞配列",
      "totalKeyCount": 87,
      "vendorId": 7334,
      "productId": 7217,
      "vendorIdHex": "0x1CA6",
      "productIdHex": "0x1C31",
      "connectionType": "wired",
      "connectionLabel": "USB 极速有线",
      "isWired": true,
      "hasBattery": false,
      "maxPollingRate": 8000,
      "hardRateCeiling": 8000,
      "supportedPollingRates": [
        1000,
        2000,
        4000,
        8000
      ],
      "defaultPollingRate": 8000,
      "minActuationPoint": 0.001,
      "defaultAxis": "佳达隆磁玉 Pro",
      "features": {
        "magneticAxis": true,
        "rtSupport": true,
        "socdSupport": true,
        "furyMode": true,
        "rgbLighting": true,
        "hallCalibration": true,
        "continuousRt": false,
        "doubleLighting": false,
        "stripLighting": false,
        "shakeOptimization": true,
        "spaceMultiLamp": false
      }
    },
    "matrixLayout": {
      "totalKeys": 87,
      "matrixRows": 6,
      "matrixCols": 17,
      "layoutCategory": "87keys",
      "layoutName": "87键TKL电竞配列",
      "physicalKeys": [
        {
          "row": 0,
          "col": 0,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Esc"
        },
        {
          "row": 0,
          "col": 1,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F1"
        },
        {
          "row": 0,
          "col": 2,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F2"
        },
        {
          "row": 0,
          "col": 3,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F3"
        },
        {
          "row": 0,
          "col": 4,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F4"
        },
        {
          "row": 0,
          "col": 5,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F5"
        },
        {
          "row": 0,
          "col": 6,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F6"
        },
        {
          "row": 0,
          "col": 7,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F7"
        },
        {
          "row": 0,
          "col": 8,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F8"
        },
        {
          "row": 0,
          "col": 9,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F9"
        },
        {
          "row": 0,
          "col": 10,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F10"
        },
        {
          "row": 0,
          "col": 11,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F11"
        },
        {
          "row": 0,
          "col": 12,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F12"
        },
        {
          "row": 0,
          "col": 13,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "PrSc"
        },
        {
          "row": 0,
          "col": 14,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "ScLk"
        },
        {
          "row": 0,
          "col": 15,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Paus"
        },
        {
          "row": 1,
          "col": 0,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "`"
        },
        {
          "row": 1,
          "col": 1,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "1"
        },
        {
          "row": 1,
          "col": 2,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "2"
        },
        {
          "row": 1,
          "col": 3,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "3"
        },
        {
          "row": 1,
          "col": 4,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "4"
        },
        {
          "row": 1,
          "col": 5,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "5"
        },
        {
          "row": 1,
          "col": 6,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "6"
        },
        {
          "row": 1,
          "col": 7,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "7"
        },
        {
          "row": 1,
          "col": 8,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "8"
        },
        {
          "row": 1,
          "col": 9,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "9"
        },
        {
          "row": 1,
          "col": 10,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "0"
        },
        {
          "row": 1,
          "col": 11,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "-"
        },
        {
          "row": 1,
          "col": 12,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "="
        },
        {
          "row": 1,
          "col": 13,
          "ratio": 2,
          "defaultKeycode": 0,
          "label": "Backspace"
        },
        {
          "row": 1,
          "col": 14,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Ins"
        },
        {
          "row": 1,
          "col": 15,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Home"
        },
        {
          "row": 1,
          "col": 16,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "PgUp"
        },
        {
          "row": 2,
          "col": 0,
          "ratio": 1.5,
          "defaultKeycode": 0,
          "label": "Tab"
        },
        {
          "row": 2,
          "col": 1,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Q"
        },
        {
          "row": 2,
          "col": 2,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "W"
        },
        {
          "row": 2,
          "col": 3,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "E"
        },
        {
          "row": 2,
          "col": 4,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "R"
        },
        {
          "row": 2,
          "col": 5,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "T"
        },
        {
          "row": 2,
          "col": 6,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Y"
        },
        {
          "row": 2,
          "col": 7,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "U"
        },
        {
          "row": 2,
          "col": 8,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "I"
        },
        {
          "row": 2,
          "col": 9,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "O"
        },
        {
          "row": 2,
          "col": 10,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "P"
        },
        {
          "row": 2,
          "col": 11,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "["
        },
        {
          "row": 2,
          "col": 12,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "]"
        },
        {
          "row": 2,
          "col": 13,
          "ratio": 1.5,
          "defaultKeycode": 0,
          "label": "\\"
        },
        {
          "row": 2,
          "col": 14,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Del"
        },
        {
          "row": 2,
          "col": 15,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "End"
        },
        {
          "row": 2,
          "col": 16,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "PgDn"
        },
        {
          "row": 3,
          "col": 0,
          "ratio": 1.75,
          "defaultKeycode": 0,
          "label": "Caps"
        },
        {
          "row": 3,
          "col": 1,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "A"
        },
        {
          "row": 3,
          "col": 2,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "S"
        },
        {
          "row": 3,
          "col": 3,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "D"
        },
        {
          "row": 3,
          "col": 4,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F"
        },
        {
          "row": 3,
          "col": 5,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "G"
        },
        {
          "row": 3,
          "col": 6,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "H"
        },
        {
          "row": 3,
          "col": 7,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "J"
        },
        {
          "row": 3,
          "col": 8,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "K"
        },
        {
          "row": 3,
          "col": 9,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "L"
        },
        {
          "row": 3,
          "col": 10,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": ";"
        },
        {
          "row": 3,
          "col": 11,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "'"
        },
        {
          "row": 3,
          "col": 13,
          "ratio": 2.25,
          "defaultKeycode": 0,
          "label": "Enter"
        },
        {
          "row": 4,
          "col": 0,
          "ratio": 2.25,
          "defaultKeycode": 0,
          "label": "Shift"
        },
        {
          "row": 4,
          "col": 2,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Z"
        },
        {
          "row": 4,
          "col": 3,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "X"
        },
        {
          "row": 4,
          "col": 4,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "C"
        },
        {
          "row": 4,
          "col": 5,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "V"
        },
        {
          "row": 4,
          "col": 6,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "B"
        },
        {
          "row": 4,
          "col": 7,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "N"
        },
        {
          "row": 4,
          "col": 8,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "M"
        },
        {
          "row": 4,
          "col": 9,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": ","
        },
        {
          "row": 4,
          "col": 10,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "."
        },
        {
          "row": 4,
          "col": 11,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "/"
        },
        {
          "row": 4,
          "col": 12,
          "ratio": 2.75,
          "defaultKeycode": 0,
          "label": "Shift"
        },
        {
          "row": 4,
          "col": 14,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "↑"
        },
        {
          "row": 5,
          "col": 0,
          "ratio": 1.25,
          "defaultKeycode": 0,
          "label": "Ctrl"
        },
        {
          "row": 5,
          "col": 1,
          "ratio": 1.25,
          "defaultKeycode": 0,
          "label": "Win"
        },
        {
          "row": 5,
          "col": 2,
          "ratio": 1.25,
          "defaultKeycode": 0,
          "label": "Alt"
        },
        {
          "row": 5,
          "col": 6,
          "ratio": 6.25,
          "defaultKeycode": 0,
          "label": "Space"
        },
        {
          "row": 5,
          "col": 9,
          "ratio": 1.25,
          "defaultKeycode": 0,
          "label": "Alt"
        },
        {
          "row": 5,
          "col": 10,
          "ratio": 1.25,
          "defaultKeycode": 0,
          "label": "Win"
        },
        {
          "row": 5,
          "col": 11,
          "ratio": 1.25,
          "defaultKeycode": 0,
          "label": "App"
        },
        {
          "row": 5,
          "col": 12,
          "ratio": 1.25,
          "defaultKeycode": 0,
          "label": "Ctrl"
        },
        {
          "row": 5,
          "col": 13,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "←"
        },
        {
          "row": 5,
          "col": 14,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "↓"
        },
        {
          "row": 5,
          "col": 15,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "→"
        }
      ]
    },
    "lightingTopology": {
      "totalLeds": 87,
      "mainMatrixLeds": 87,
      "isDoubleLighting": false,
      "doubleLightingRaw": 0,
      "lampStructure": "常规单灯位",
      "spaceLamps": {
        "hasIndependentSpaceLamps": false,
        "count": 1
      },
      "stripLighting": {
        "hasStrip": false
      },
      "supportedEffects": [
        "Static",
        "Breathing",
        "Neon",
        "Wave",
        "Ripple",
        "SingleLight",
        "Flash",
        "Raindrop"
      ]
    },
    "performanceSpec": {
      "supportedPollingRates": [
        1000,
        2000,
        4000,
        8000
      ],
      "currentPollingRate": 8000,
      "maxPollingRate": 8000,
      "hardwareRateCeiling": 8000,
      "rtPrecisionMm": 0.001,
      "higherKeyCapabilities": {
        "rs": true,
        "socd": true,
        "dks": true,
        "mt": true,
        "tgl": true,
        "mpt": true,
        "end": true
      }
    },
    "axisAndCalibration": {
      "boardAxisList": [
        {
          "id": 1,
          "name": "佳达隆磁玉 Pro",
          "stroke": 3.5,
          "minAp": 0.001,
          "maxAp": 3.4
        },
        {
          "id": 2,
          "name": "双子星自研马轴",
          "stroke": 4,
          "minAp": 0.001,
          "maxAp": 3.9
        }
      ],
      "defaultAxis": "佳达隆磁玉 Pro",
      "travelRangeMm": 4,
      "deadzoneMm": 0.02,
      "minActuationMm": 0.001,
      "currentCalibration": {
        "minAdc": 120,
        "maxAdc": 3950,
        "precisionMm": 0.001
      }
    }
  },
  {
    "meta": {
      "probeVersion": "v1.4.1",
      "collectedAt": "2026-10-14T16:41:01.476Z",
      "generator": "SparkLink PlayJoy Community Keyboard Database Registry",
      "isSparklinkDevice": true,
      "verificationStatus": "VERIFIED_SPARKLINK_PLAYJOY",
      "brandName": "星闪公版方案"
    },
    "hardwareFingerprint": {
      "vendorIdHex": "0x1CA6",
      "productIdHex": "0x1C32",
      "vendorIdDec": 7334,
      "productIdDec": 7218,
      "brand": "星闪公版方案",
      "brandName": "星闪公版方案",
      "manufacturerName": "星闪公版方案",
      "productName": "星闪 98 键紧凑磁轴键盘",
      "rawUsbProductName": "NearLink 98",
      "serialNumber": "[未导出/隐私保护脱敏]",
      "hidInterfaces": [
        {
          "usagePage": 65456,
          "usage": 1,
          "usagePageHex": "0xFFB0",
          "usageHex": "0x0001",
          "isSparklinkVendorPort": true,
          "isStandardKeyboardPort": false
        }
      ]
    },
    "deviceProfile": {
      "id": "pcb_0x1ca6_0x1c32",
      "brand": "星闪公版方案",
      "brandName": "星闪公版方案",
      "model": "NearLink 98",
      "name": "星闪 98 键紧凑磁轴键盘",
      "shortName": "NearLink 98",
      "type": "keyboard",
      "layout": "98keys",
      "layoutName": "98紧凑全功能配列",
      "totalKeyCount": 98,
      "vendorId": 7334,
      "productId": 7218,
      "vendorIdHex": "0x1CA6",
      "productIdHex": "0x1C32",
      "connectionType": "wired",
      "connectionLabel": "USB 极速有线",
      "isWired": true,
      "hasBattery": false,
      "maxPollingRate": 8000,
      "hardRateCeiling": 8000,
      "supportedPollingRates": [
        1000,
        2000,
        4000,
        8000
      ],
      "defaultPollingRate": 8000,
      "minActuationPoint": 0.01,
      "defaultAxis": "佳达隆磁玉 Pro",
      "features": {
        "magneticAxis": true,
        "rtSupport": true,
        "socdSupport": true,
        "furyMode": true,
        "rgbLighting": true,
        "hallCalibration": true,
        "continuousRt": false,
        "doubleLighting": false,
        "stripLighting": false,
        "shakeOptimization": true,
        "spaceMultiLamp": false
      }
    },
    "matrixLayout": {
      "totalKeys": 98,
      "matrixRows": 6,
      "matrixCols": 19,
      "layoutCategory": "98keys",
      "layoutName": "98紧凑全功能配列",
      "physicalKeys": [
        {
          "row": 0,
          "col": 0,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Esc"
        },
        {
          "row": 0,
          "col": 1,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F1"
        },
        {
          "row": 0,
          "col": 2,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F2"
        },
        {
          "row": 0,
          "col": 3,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F3"
        },
        {
          "row": 0,
          "col": 4,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F4"
        },
        {
          "row": 0,
          "col": 5,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F5"
        },
        {
          "row": 0,
          "col": 6,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F6"
        },
        {
          "row": 0,
          "col": 7,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F7"
        },
        {
          "row": 0,
          "col": 8,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F8"
        },
        {
          "row": 0,
          "col": 9,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F9"
        },
        {
          "row": 0,
          "col": 10,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F10"
        },
        {
          "row": 0,
          "col": 11,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F11"
        },
        {
          "row": 0,
          "col": 12,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F12"
        },
        {
          "row": 0,
          "col": 13,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Del"
        },
        {
          "row": 0,
          "col": 14,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Num"
        },
        {
          "row": 0,
          "col": 15,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "/"
        },
        {
          "row": 0,
          "col": 16,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "*"
        },
        {
          "row": 0,
          "col": 17,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "-"
        },
        {
          "row": 1,
          "col": 0,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "`"
        },
        {
          "row": 1,
          "col": 1,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "1"
        },
        {
          "row": 1,
          "col": 2,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "2"
        },
        {
          "row": 1,
          "col": 3,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "3"
        },
        {
          "row": 1,
          "col": 4,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "4"
        },
        {
          "row": 1,
          "col": 5,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "5"
        },
        {
          "row": 1,
          "col": 6,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "6"
        },
        {
          "row": 1,
          "col": 7,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "7"
        },
        {
          "row": 1,
          "col": 8,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "8"
        },
        {
          "row": 1,
          "col": 9,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "9"
        },
        {
          "row": 1,
          "col": 10,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "0"
        },
        {
          "row": 1,
          "col": 11,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "-"
        },
        {
          "row": 1,
          "col": 12,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "="
        },
        {
          "row": 1,
          "col": 13,
          "ratio": 2,
          "defaultKeycode": 0,
          "label": "Backspace"
        },
        {
          "row": 1,
          "col": 14,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "7"
        },
        {
          "row": 1,
          "col": 15,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "8"
        },
        {
          "row": 1,
          "col": 16,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "9"
        },
        {
          "row": 1,
          "col": 17,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "+"
        },
        {
          "row": 2,
          "col": 0,
          "ratio": 1.5,
          "defaultKeycode": 0,
          "label": "Tab"
        },
        {
          "row": 2,
          "col": 1,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Q"
        },
        {
          "row": 2,
          "col": 2,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "W"
        },
        {
          "row": 2,
          "col": 3,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "E"
        },
        {
          "row": 2,
          "col": 4,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "R"
        },
        {
          "row": 2,
          "col": 5,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "T"
        },
        {
          "row": 2,
          "col": 6,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Y"
        },
        {
          "row": 2,
          "col": 7,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "U"
        },
        {
          "row": 2,
          "col": 8,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "I"
        },
        {
          "row": 2,
          "col": 9,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "O"
        },
        {
          "row": 2,
          "col": 10,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "P"
        },
        {
          "row": 2,
          "col": 11,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "["
        },
        {
          "row": 2,
          "col": 12,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "]"
        },
        {
          "row": 2,
          "col": 13,
          "ratio": 1.5,
          "defaultKeycode": 0,
          "label": "\\"
        },
        {
          "row": 2,
          "col": 14,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "4"
        },
        {
          "row": 2,
          "col": 15,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "5"
        },
        {
          "row": 2,
          "col": 16,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "6"
        },
        {
          "row": 3,
          "col": 0,
          "ratio": 1.75,
          "defaultKeycode": 0,
          "label": "Caps"
        },
        {
          "row": 3,
          "col": 1,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "A"
        },
        {
          "row": 3,
          "col": 2,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "S"
        },
        {
          "row": 3,
          "col": 3,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "D"
        },
        {
          "row": 3,
          "col": 4,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F"
        },
        {
          "row": 3,
          "col": 5,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "G"
        },
        {
          "row": 3,
          "col": 6,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "H"
        },
        {
          "row": 3,
          "col": 7,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "J"
        },
        {
          "row": 3,
          "col": 8,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "K"
        },
        {
          "row": 3,
          "col": 9,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "L"
        },
        {
          "row": 3,
          "col": 10,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": ";"
        },
        {
          "row": 3,
          "col": 11,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "'"
        },
        {
          "row": 3,
          "col": 13,
          "ratio": 2.25,
          "defaultKeycode": 0,
          "label": "Enter"
        },
        {
          "row": 3,
          "col": 14,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "1"
        },
        {
          "row": 3,
          "col": 15,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "2"
        },
        {
          "row": 3,
          "col": 16,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "3"
        },
        {
          "row": 3,
          "col": 17,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Ent"
        },
        {
          "row": 4,
          "col": 0,
          "ratio": 2.25,
          "defaultKeycode": 0,
          "label": "Shift"
        },
        {
          "row": 4,
          "col": 2,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Z"
        },
        {
          "row": 4,
          "col": 3,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "X"
        },
        {
          "row": 4,
          "col": 4,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "C"
        },
        {
          "row": 4,
          "col": 5,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "V"
        },
        {
          "row": 4,
          "col": 6,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "B"
        },
        {
          "row": 4,
          "col": 7,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "N"
        },
        {
          "row": 4,
          "col": 8,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "M"
        },
        {
          "row": 4,
          "col": 9,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": ","
        },
        {
          "row": 4,
          "col": 10,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "."
        },
        {
          "row": 4,
          "col": 11,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "/"
        },
        {
          "row": 4,
          "col": 12,
          "ratio": 1.75,
          "defaultKeycode": 0,
          "label": "Shift"
        },
        {
          "row": 4,
          "col": 13,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "↑"
        },
        {
          "row": 4,
          "col": 14,
          "ratio": 2,
          "defaultKeycode": 0,
          "label": "0"
        },
        {
          "row": 4,
          "col": 15,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "."
        },
        {
          "row": 5,
          "col": 0,
          "ratio": 1.25,
          "defaultKeycode": 0,
          "label": "Ctrl"
        },
        {
          "row": 5,
          "col": 1,
          "ratio": 1.25,
          "defaultKeycode": 0,
          "label": "Win"
        },
        {
          "row": 5,
          "col": 2,
          "ratio": 1.25,
          "defaultKeycode": 0,
          "label": "Alt"
        },
        {
          "row": 5,
          "col": 6,
          "ratio": 6.25,
          "defaultKeycode": 0,
          "label": "Space"
        },
        {
          "row": 5,
          "col": 9,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Alt"
        },
        {
          "row": 5,
          "col": 10,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Fn"
        },
        {
          "row": 5,
          "col": 11,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Ctrl"
        },
        {
          "row": 5,
          "col": 12,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "←"
        },
        {
          "row": 5,
          "col": 13,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "↓"
        },
        {
          "row": 5,
          "col": 14,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "→"
        }
      ]
    },
    "lightingTopology": {
      "totalLeds": 98,
      "mainMatrixLeds": 98,
      "isDoubleLighting": false,
      "doubleLightingRaw": 0,
      "lampStructure": "常规单灯位",
      "spaceLamps": {
        "hasIndependentSpaceLamps": false,
        "count": 1
      },
      "stripLighting": {
        "hasStrip": false
      },
      "supportedEffects": [
        "Static",
        "Breathing",
        "Neon",
        "Wave",
        "Ripple",
        "SingleLight",
        "Flash",
        "Raindrop"
      ]
    },
    "performanceSpec": {
      "supportedPollingRates": [
        1000,
        2000,
        4000,
        8000
      ],
      "currentPollingRate": 8000,
      "maxPollingRate": 8000,
      "hardwareRateCeiling": 8000,
      "rtPrecisionMm": 0.01,
      "higherKeyCapabilities": {
        "rs": true,
        "socd": true,
        "dks": true,
        "mt": true,
        "tgl": true,
        "mpt": true,
        "end": true
      }
    },
    "axisAndCalibration": {
      "boardAxisList": [
        {
          "id": 1,
          "name": "佳达隆磁玉 Pro",
          "stroke": 3.5,
          "minAp": 0.01,
          "maxAp": 3.4
        },
        {
          "id": 2,
          "name": "双子星自研马轴",
          "stroke": 4,
          "minAp": 0.01,
          "maxAp": 3.9
        }
      ],
      "defaultAxis": "佳达隆磁玉 Pro",
      "travelRangeMm": 4,
      "deadzoneMm": 0.02,
      "minActuationMm": 0.01,
      "currentCalibration": {
        "minAdc": 140,
        "maxAdc": 3920,
        "precisionMm": 0.01
      }
    }
  },
  {
    "meta": {
      "probeVersion": "v1.4.1",
      "collectedAt": "2026-10-14T16:41:01.476Z",
      "generator": "SparkLink PlayJoy Community Keyboard Database Registry",
      "isSparklinkDevice": true,
      "verificationStatus": "VERIFIED_SPARKLINK_PLAYJOY",
      "brandName": "江湾 Everglide"
    },
    "hardwareFingerprint": {
      "vendorIdHex": "0x1CA6",
      "productIdHex": "0x300D",
      "vendorIdDec": 7334,
      "productIdDec": 12301,
      "brand": "江湾 Everglide",
      "brandName": "江湾 Everglide",
      "manufacturerName": "江湾 Everglide",
      "productName": "江湾 AE64-MAX 磁轴键盘",
      "rawUsbProductName": "AE64-MAX",
      "serialNumber": "[未导出/隐私保护脱敏]",
      "hidInterfaces": [
        {
          "usagePage": 65456,
          "usage": 1,
          "usagePageHex": "0xFFB0",
          "usageHex": "0x0001",
          "isSparklinkVendorPort": true,
          "isStandardKeyboardPort": false
        }
      ]
    },
    "deviceProfile": {
      "id": "pcb_0x1ca6_0x300d",
      "brand": "江湾 Everglide",
      "brandName": "江湾 Everglide",
      "model": "AE64-MAX",
      "name": "江湾 AE64-MAX 磁轴键盘",
      "shortName": "AE64-MAX",
      "type": "keyboard",
      "layout": "64keys",
      "layoutName": "左移64配列",
      "totalKeyCount": 64,
      "vendorId": 7334,
      "productId": 12301,
      "vendorIdHex": "0x1CA6",
      "productIdHex": "0x300D",
      "connectionType": "wired",
      "connectionLabel": "USB 极速有线",
      "isWired": true,
      "hasBattery": false,
      "maxPollingRate": 8000,
      "hardRateCeiling": 8000,
      "supportedPollingRates": [
        1000,
        2000,
        4000,
        8000
      ],
      "defaultPollingRate": 8000,
      "minActuationPoint": 0.001,
      "defaultAxis": "天际线轴",
      "features": {
        "magneticAxis": true,
        "rtSupport": true,
        "socdSupport": true,
        "furyMode": true,
        "rgbLighting": true,
        "hallCalibration": true,
        "continuousRt": true,
        "doubleLighting": true,
        "stripLighting": true,
        "shakeOptimization": true,
        "spaceMultiLamp": true,
        "dksSupport": true,
        "mptSupport": true
      }
    },
    "matrixLayout": {
      "totalKeys": 64,
      "matrixRows": 5,
      "matrixCols": 14,
      "layoutCategory": "64keys",
      "layoutName": "左移64配列",
      "physicalKeys": [
        {
          "row": 1,
          "col": 0,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Esc"
        },
        {
          "row": 1,
          "col": 1,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "1"
        },
        {
          "row": 1,
          "col": 2,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "2"
        },
        {
          "row": 1,
          "col": 3,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "3"
        },
        {
          "row": 1,
          "col": 4,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "4"
        },
        {
          "row": 1,
          "col": 5,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "5"
        },
        {
          "row": 1,
          "col": 6,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "6"
        },
        {
          "row": 1,
          "col": 7,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "7"
        },
        {
          "row": 1,
          "col": 8,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "8"
        },
        {
          "row": 1,
          "col": 9,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "9"
        },
        {
          "row": 1,
          "col": 10,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "0"
        },
        {
          "row": 1,
          "col": 11,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "-"
        },
        {
          "row": 1,
          "col": 12,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "="
        },
        {
          "row": 1,
          "col": 13,
          "ratio": 2,
          "defaultKeycode": 0,
          "label": "Backspace"
        },
        {
          "row": 2,
          "col": 0,
          "ratio": 1.5,
          "defaultKeycode": 0,
          "label": "Tab"
        },
        {
          "row": 2,
          "col": 1,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Q"
        },
        {
          "row": 2,
          "col": 2,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "W"
        },
        {
          "row": 2,
          "col": 3,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "E"
        },
        {
          "row": 2,
          "col": 4,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "R"
        },
        {
          "row": 2,
          "col": 5,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "T"
        },
        {
          "row": 2,
          "col": 6,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Y"
        },
        {
          "row": 2,
          "col": 7,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "U"
        },
        {
          "row": 2,
          "col": 8,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "I"
        },
        {
          "row": 2,
          "col": 9,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "O"
        },
        {
          "row": 2,
          "col": 10,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "P"
        },
        {
          "row": 2,
          "col": 11,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "["
        },
        {
          "row": 2,
          "col": 12,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "]"
        },
        {
          "row": 2,
          "col": 13,
          "ratio": 1.5,
          "defaultKeycode": 0,
          "label": "\\"
        },
        {
          "row": 3,
          "col": 0,
          "ratio": 1.75,
          "defaultKeycode": 0,
          "label": "Caps"
        },
        {
          "row": 3,
          "col": 1,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "A"
        },
        {
          "row": 3,
          "col": 2,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "S"
        },
        {
          "row": 3,
          "col": 3,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "D"
        },
        {
          "row": 3,
          "col": 4,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "F"
        },
        {
          "row": 3,
          "col": 5,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "G"
        },
        {
          "row": 3,
          "col": 6,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "H"
        },
        {
          "row": 3,
          "col": 7,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "J"
        },
        {
          "row": 3,
          "col": 8,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "K"
        },
        {
          "row": 3,
          "col": 9,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "L"
        },
        {
          "row": 3,
          "col": 10,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": ";"
        },
        {
          "row": 3,
          "col": 11,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "'"
        },
        {
          "row": 3,
          "col": 13,
          "ratio": 2.25,
          "defaultKeycode": 0,
          "label": "Enter"
        },
        {
          "row": 4,
          "col": 0,
          "ratio": 2,
          "defaultKeycode": 0,
          "label": "Shift"
        },
        {
          "row": 4,
          "col": 2,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Z"
        },
        {
          "row": 4,
          "col": 3,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "X"
        },
        {
          "row": 4,
          "col": 4,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "C"
        },
        {
          "row": 4,
          "col": 5,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "V"
        },
        {
          "row": 4,
          "col": 6,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "B"
        },
        {
          "row": 4,
          "col": 7,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "N"
        },
        {
          "row": 4,
          "col": 8,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "M"
        },
        {
          "row": 4,
          "col": 9,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": ","
        },
        {
          "row": 4,
          "col": 10,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "."
        },
        {
          "row": 4,
          "col": 11,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "/"
        },
        {
          "row": 4,
          "col": 12,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Shift"
        },
        {
          "row": 4,
          "col": 13,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "↑"
        },
        {
          "row": 4,
          "col": 14,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Del"
        },
        {
          "row": 5,
          "col": 0,
          "ratio": 1.25,
          "defaultKeycode": 0,
          "label": "Ctrl"
        },
        {
          "row": 5,
          "col": 1,
          "ratio": 1.25,
          "defaultKeycode": 0,
          "label": "Win"
        },
        {
          "row": 5,
          "col": 2,
          "ratio": 1.25,
          "defaultKeycode": 0,
          "label": "Alt"
        },
        {
          "row": 5,
          "col": 6,
          "ratio": 6.25,
          "defaultKeycode": 0,
          "label": "Space"
        },
        {
          "row": 5,
          "col": 9,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Alt"
        },
        {
          "row": 5,
          "col": 10,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "Fn"
        },
        {
          "row": 5,
          "col": 12,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "←"
        },
        {
          "row": 5,
          "col": 13,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "↓"
        },
        {
          "row": 5,
          "col": 14,
          "ratio": 1,
          "defaultKeycode": 0,
          "label": "→"
        }
      ]
    },
    "lightingTopology": {
      "totalLeds": 170,
      "mainMatrixLeds": 128,
      "isDoubleLighting": true,
      "doubleLightingRaw": 1,
      "lampStructure": "上下双灯位 (上灯+下灯)",
      "lightingAreas": [
        {
          "areaId": 0,
          "name": "轴体RGB主灯区 (上下双灯位)",
          "count": 128
        },
        {
          "areaId": 1,
          "name": "氛围灯区 (31颗环形底灯)",
          "count": 42
        }
      ],
      "spaceLamps": {
        "hasIndependentSpaceLamps": true,
        "count": 5,
        "coordinates": [
          {
            "index": 1,
            "row": 5,
            "col": 4
          },
          {
            "index": 2,
            "row": 5,
            "col": 5
          },
          {
            "index": 3,
            "row": 5,
            "col": 6
          },
          {
            "index": 4,
            "row": 5,
            "col": 7
          },
          {
            "index": 5,
            "row": 5,
            "col": 8
          }
        ]
      },
      "stripLighting": {
        "hasStrip": true,
        "count": 31,
        "rows": 2,
        "cols": 17,
        "label": "31颗环形氛围底灯 (首行17颗+次行14颗)"
      },
      "supportedEffects": [
        "Static",
        "Breathing",
        "Neon",
        "Wave",
        "Ripple",
        "SingleLight",
        "Flash",
        "Raindrop",
        "CustomMatrix",
        "DualLampLayer"
      ]
    },
    "performanceSpec": {
      "supportedPollingRates": [
        1000,
        2000,
        4000,
        8000
      ],
      "currentPollingRate": 8000,
      "maxPollingRate": 8000,
      "hardwareRateCeiling": 8000,
      "rtPrecisionMm": 0.001,
      "shakeOptimizationSwitch": 1,
      "higherKeyCapabilities": {
        "rs": true,
        "socd": true,
        "dks": true,
        "mt": true,
        "tgl": true,
        "mpt": true,
        "end": true
      },
      "boardConfigSlots": {
        "total": 4,
        "current": "Config1",
        "list": [
          "Config1",
          "Config2",
          "Config3",
          "Config4"
        ]
      }
    },
    "axisAndCalibration": {
      "boardAxisList": [
        {
          "id": 788,
          "name": "天际线轴",
          "stroke": 3.55,
          "minAp": 0.001,
          "maxAp": 3.45
        },
        {
          "id": 1,
          "name": "佳达隆磁玉 Pro",
          "stroke": 3.5,
          "minAp": 0.001,
          "maxAp": 3.4
        },
        {
          "id": 2,
          "name": "库里南轴",
          "stroke": 3.6,
          "minAp": 0.001,
          "maxAp": 3.5
        },
        {
          "id": 3,
          "name": "凯华知夏磁轴",
          "stroke": 3.8,
          "minAp": 0.001,
          "maxAp": 3.7
        }
      ],
      "defaultAxis": "天际线轴",
      "travelRangeMm": 4,
      "deadzoneMm": 0.02,
      "minActuationMm": 0.001,
      "currentCalibration": {
        "minAdc": 100,
        "maxAdc": 4000,
        "precisionMm": 0.001
      }
    }
  },
  {
    "meta": {
      "probeVersion": "v1.3.0",
      "collectedAt": "2026-10-15T05:54:59.520Z",
      "generator": "SparkLink PlayJoy PCB Hardware Reverse-Engineering Probe Engine",
      "probeMode": "WebHID (SparkLink SDK V2)",
      "isSparklinkDevice": true,
      "verificationStatus": "VERIFIED_SPARKLINK_PLAYJOY",
      "snIncluded": false,
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) sparklink-pcb-probe-standalone/1.3.0 Chrome/126.0.6478.234 Electron/31.7.7 Safari/537.36",
      "brandName": "江湾 Everglide"
    },
    "hardwareFingerprint": {
      "vendorIdHex": "0x1CA6",
      "productIdHex": "0x300B",
      "vendorIdDec": 7334,
      "productIdDec": 12299,
      "productName": "江湾 AE61 Pro 磁轴键盘",
      "rawUsbProductName": "AE61 Pro",
      "manufacturerName": "",
      "serialNumber": "[未导出/隐私保护脱敏]",
      "chipInfo": {
        "boardId": 3145739,
        "type": 1,
        "subType": 0,
        "appVersion": "0.0.8.0",
        "pcbVersion": "1-0-0-0",
        "runModeVersion": 0,
        "timestamp": "2026093012:5",
        "sn": "[未导出/隐私保护脱敏]"
      },
      "hidInterfaces": [
        {
          "usagePage": 65456,
          "usage": 1,
          "usagePageHex": "0xFFB0",
          "usageHex": "0x1",
          "isSparklinkVendorPort": true,
          "isCustomVendorPort": false,
          "isStandardKeyboardPort": false
        }
      ],
      "protocolVersion": {
        "mainVersion": 1,
        "subVersion": 2,
        "hardwareVersion": 1,
        "softwareVersion": 0
      },
      "deviceFeatures": {
        "axisType": {
          "mechanical": false,
          "magnetic": true,
          "optical": false,
          "inductive": false,
          "magnetic3D": false
        },
        "connectionMode": {
          "usb": true,
          "mode2_4G": false,
          "ble": false,
          "usb3": false
        },
        "basicFunctions": {
          "rgbLighting": true,
          "knob": false
        },
        "extendedFunctions": {
          "smallScreen": false,
          "fullScreen": false,
          "hapticFeedback": false,
          "voicePlayback": false,
          "voiceRecognition": false,
          "gamepad": false,
          "dotMatrix": false
        }
      },
      "brand": "江湾 Everglide",
      "brandName": "江湾 Everglide"
    },
    "matrixLayout": {
      "totalKeys": 61,
      "matrixRows": 6,
      "matrixCols": 14.75,
      "layoutCategory": "61keys",
      "layoutName": "60%经典配列 (61键)",
      "physicalKeys": [
        {
          "row": 1,
          "col": 0,
          "ratio": 1,
          "type": "key"
        },
        {
          "row": 1,
          "col": 1,
          "ratio": 1,
          "type": "key"
        },
        {
          "row": 1,
          "col": 2,
          "ratio": 1,
          "type": "key"
        },
        {
          "row": 1,
          "col": 3,
          "ratio": 1,
          "type": "key"
        },
        {
          "row": 1,
          "col": 4,
          "ratio": 1,
          "type": "key"
        },
        {
          "row": 1,
          "col": 5,
          "ratio": 1,
          "type": "key"
        },
        {
          "row": 1,
          "col": 6,
          "ratio": 1,
          "type": "key"
        },
        {
          "row": 1,
          "col": 7,
          "ratio": 1,
          "type": "key"
        },
        {
          "row": 1,
          "col": 8,
          "ratio": 1,
          "type": "key"
        },
        {
          "row": 1,
          "col": 9,
          "ratio": 1,
          "type": "key"
        },
        {
          "row": 1,
          "col": 10,
          "ratio": 1,
          "type": "key"
        },
        {
          "row": 1,
          "col": 11,
          "ratio": 1,
          "type": "key"
        },
        {
          "row": 1,
          "col": 12,
          "ratio": 1,
          "type": "key"
        },
        {
          "row": 1,
          "col": 13,
          "ratio": 5,
          "type": "key"
        },
        {
          "row": 2,
          "col": 0,
          "ratio": 3,
          "type": "key"
        },
        {
          "row": 2,
          "col": 1.5,
          "ratio": 1,
          "type": "key"
        },
        {
          "row": 2,
          "col": 2.5,
          "ratio": 1,
          "type": "key"
        },
        {
          "row": 2,
          "col": 3.5,
          "ratio": 1,
          "type": "key"
        },
        {
          "row": 2,
          "col": 4.5,
          "ratio": 1,
          "type": "key"
        },
        {
          "row": 2,
          "col": 5.5,
          "ratio": 1,
          "type": "key"
        },
        {
          "row": 2,
          "col": 6.5,
          "ratio": 1,
          "type": "key"
        },
        {
          "row": 2,
          "col": 7.5,
          "ratio": 1,
          "type": "key"
        },
        {
          "row": 2,
          "col": 8.5,
          "ratio": 1,
          "type": "key"
        },
        {
          "row": 2,
          "col": 9.5,
          "ratio": 1,
          "type": "key"
        },
        {
          "row": 2,
          "col": 10.5,
          "ratio": 1,
          "type": "key"
        },
        {
          "row": 2,
          "col": 11.5,
          "ratio": 1,
          "type": "key"
        },
        {
          "row": 2,
          "col": 12.5,
          "ratio": 1,
          "type": "key"
        },
        {
          "row": 2,
          "col": 13.5,
          "ratio": 3,
          "type": "key"
        },
        {
          "row": 3,
          "col": 0,
          "ratio": 4,
          "type": "key"
        },
        {
          "row": 3,
          "col": 1.75,
          "ratio": 1,
          "type": "key"
        },
        {
          "row": 3,
          "col": 2.75,
          "ratio": 1,
          "type": "key"
        },
        {
          "row": 3,
          "col": 3.75,
          "ratio": 1,
          "type": "key"
        },
        {
          "row": 3,
          "col": 4.75,
          "ratio": 1,
          "type": "key"
        },
        {
          "row": 3,
          "col": 5.75,
          "ratio": 1,
          "type": "key"
        },
        {
          "row": 3,
          "col": 6.75,
          "ratio": 1,
          "type": "key"
        },
        {
          "row": 3,
          "col": 7.75,
          "ratio": 1,
          "type": "key"
        },
        {
          "row": 3,
          "col": 8.75,
          "ratio": 1,
          "type": "key"
        },
        {
          "row": 3,
          "col": 9.75,
          "ratio": 1,
          "type": "key"
        },
        {
          "row": 3,
          "col": 10.75,
          "ratio": 1,
          "type": "key"
        },
        {
          "row": 3,
          "col": 11.75,
          "ratio": 1,
          "type": "key"
        },
        {
          "row": 3,
          "col": 12.75,
          "ratio": 6,
          "type": "key"
        },
        {
          "row": 4,
          "col": 0,
          "ratio": 6,
          "type": "key"
        },
        {
          "row": 4,
          "col": 2.25,
          "ratio": 1,
          "type": "key"
        },
        {
          "row": 4,
          "col": 3.25,
          "ratio": 1,
          "type": "key"
        },
        {
          "row": 4,
          "col": 4.25,
          "ratio": 1,
          "type": "key"
        },
        {
          "row": 4,
          "col": 5.25,
          "ratio": 1,
          "type": "key"
        },
        {
          "row": 4,
          "col": 6.25,
          "ratio": 1,
          "type": "key"
        },
        {
          "row": 4,
          "col": 7.25,
          "ratio": 1,
          "type": "key"
        },
        {
          "row": 4,
          "col": 8.25,
          "ratio": 1,
          "type": "key"
        },
        {
          "row": 4,
          "col": 9.25,
          "ratio": 1,
          "type": "key"
        },
        {
          "row": 4,
          "col": 10.25,
          "ratio": 1,
          "type": "key"
        },
        {
          "row": 4,
          "col": 11.25,
          "ratio": 1,
          "type": "key"
        },
        {
          "row": 4,
          "col": 12.25,
          "ratio": 8,
          "type": "key"
        },
        {
          "row": 5,
          "col": 0,
          "ratio": 2,
          "type": "key"
        },
        {
          "row": 5,
          "col": 1.25,
          "ratio": 2,
          "type": "key"
        },
        {
          "row": 5,
          "col": 2.5,
          "ratio": 2,
          "type": "key"
        },
        {
          "row": 5,
          "col": 3.75,
          "ratio": 9,
          "type": "key"
        },
        {
          "row": 5,
          "col": 10,
          "ratio": 2,
          "type": "key"
        },
        {
          "row": 5,
          "col": 11.25,
          "ratio": 2,
          "type": "key"
        },
        {
          "row": 5,
          "col": 12.5,
          "ratio": 2,
          "type": "key"
        },
        {
          "row": 5,
          "col": 13.75,
          "ratio": 2,
          "type": "key"
        }
      ],
      "rawRowScanDump": [
        {
          "row": 0,
          "keys": [
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            }
          ]
        },
        {
          "row": 1,
          "keys": [
            {
              "row": 1,
              "col": 0,
              "ratio": 1,
              "type": "key"
            },
            {
              "row": 1,
              "col": 1,
              "ratio": 1,
              "type": "key"
            },
            {
              "row": 1,
              "col": 2,
              "ratio": 1,
              "type": "key"
            },
            {
              "row": 1,
              "col": 3,
              "ratio": 1,
              "type": "key"
            },
            {
              "row": 1,
              "col": 4,
              "ratio": 1,
              "type": "key"
            },
            {
              "row": 1,
              "col": 5,
              "ratio": 1,
              "type": "key"
            },
            {
              "row": 1,
              "col": 6,
              "ratio": 1,
              "type": "key"
            },
            {
              "row": 1,
              "col": 7,
              "ratio": 1,
              "type": "key"
            },
            {
              "row": 1,
              "col": 8,
              "ratio": 1,
              "type": "key"
            },
            {
              "row": 1,
              "col": 9,
              "ratio": 1,
              "type": "key"
            },
            {
              "row": 1,
              "col": 10,
              "ratio": 1,
              "type": "key"
            },
            {
              "row": 1,
              "col": 11,
              "ratio": 1,
              "type": "key"
            },
            {
              "row": 1,
              "col": 12,
              "ratio": 1,
              "type": "key"
            },
            {
              "row": 1,
              "col": 13,
              "ratio": 5,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            }
          ]
        },
        {
          "row": 2,
          "keys": [
            {
              "row": 2,
              "col": 0,
              "ratio": 3,
              "type": "key"
            },
            {
              "row": 2,
              "col": 1.5,
              "ratio": 1,
              "type": "key"
            },
            {
              "row": 2,
              "col": 2.5,
              "ratio": 1,
              "type": "key"
            },
            {
              "row": 2,
              "col": 3.5,
              "ratio": 1,
              "type": "key"
            },
            {
              "row": 2,
              "col": 4.5,
              "ratio": 1,
              "type": "key"
            },
            {
              "row": 2,
              "col": 5.5,
              "ratio": 1,
              "type": "key"
            },
            {
              "row": 2,
              "col": 6.5,
              "ratio": 1,
              "type": "key"
            },
            {
              "row": 2,
              "col": 7.5,
              "ratio": 1,
              "type": "key"
            },
            {
              "row": 2,
              "col": 8.5,
              "ratio": 1,
              "type": "key"
            },
            {
              "row": 2,
              "col": 9.5,
              "ratio": 1,
              "type": "key"
            },
            {
              "row": 2,
              "col": 10.5,
              "ratio": 1,
              "type": "key"
            },
            {
              "row": 2,
              "col": 11.5,
              "ratio": 1,
              "type": "key"
            },
            {
              "row": 2,
              "col": 12.5,
              "ratio": 1,
              "type": "key"
            },
            {
              "row": 2,
              "col": 13.5,
              "ratio": 3,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            }
          ]
        },
        {
          "row": 3,
          "keys": [
            {
              "row": 3,
              "col": 0,
              "ratio": 4,
              "type": "key"
            },
            {
              "row": 3,
              "col": 1.75,
              "ratio": 1,
              "type": "key"
            },
            {
              "row": 3,
              "col": 2.75,
              "ratio": 1,
              "type": "key"
            },
            {
              "row": 3,
              "col": 3.75,
              "ratio": 1,
              "type": "key"
            },
            {
              "row": 3,
              "col": 4.75,
              "ratio": 1,
              "type": "key"
            },
            {
              "row": 3,
              "col": 5.75,
              "ratio": 1,
              "type": "key"
            },
            {
              "row": 3,
              "col": 6.75,
              "ratio": 1,
              "type": "key"
            },
            {
              "row": 3,
              "col": 7.75,
              "ratio": 1,
              "type": "key"
            },
            {
              "row": 3,
              "col": 8.75,
              "ratio": 1,
              "type": "key"
            },
            {
              "row": 3,
              "col": 9.75,
              "ratio": 1,
              "type": "key"
            },
            {
              "row": 3,
              "col": 10.75,
              "ratio": 1,
              "type": "key"
            },
            {
              "row": 3,
              "col": 11.75,
              "ratio": 1,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 3,
              "col": 12.75,
              "ratio": 6,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            }
          ]
        },
        {
          "row": 4,
          "keys": [
            {
              "row": 4,
              "col": 0,
              "ratio": 6,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 4,
              "col": 2.25,
              "ratio": 1,
              "type": "key"
            },
            {
              "row": 4,
              "col": 3.25,
              "ratio": 1,
              "type": "key"
            },
            {
              "row": 4,
              "col": 4.25,
              "ratio": 1,
              "type": "key"
            },
            {
              "row": 4,
              "col": 5.25,
              "ratio": 1,
              "type": "key"
            },
            {
              "row": 4,
              "col": 6.25,
              "ratio": 1,
              "type": "key"
            },
            {
              "row": 4,
              "col": 7.25,
              "ratio": 1,
              "type": "key"
            },
            {
              "row": 4,
              "col": 8.25,
              "ratio": 1,
              "type": "key"
            },
            {
              "row": 4,
              "col": 9.25,
              "ratio": 1,
              "type": "key"
            },
            {
              "row": 4,
              "col": 10.25,
              "ratio": 1,
              "type": "key"
            },
            {
              "row": 4,
              "col": 11.25,
              "ratio": 1,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 4,
              "col": 12.25,
              "ratio": 8,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            }
          ]
        },
        {
          "row": 5,
          "keys": [
            {
              "row": 5,
              "col": 0,
              "ratio": 2,
              "type": "key"
            },
            {
              "row": 5,
              "col": 1.25,
              "ratio": 2,
              "type": "key"
            },
            {
              "row": 5,
              "col": 2.5,
              "ratio": 2,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 5,
              "col": 3.75,
              "ratio": 9,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 5,
              "col": 10,
              "ratio": 2,
              "type": "key"
            },
            {
              "row": 5,
              "col": 11.25,
              "ratio": 2,
              "type": "key"
            },
            {
              "row": 5,
              "col": 12.5,
              "ratio": 2,
              "type": "key"
            },
            {
              "row": 5,
              "col": 13.75,
              "ratio": 2,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            }
          ]
        },
        {
          "row": 6,
          "keys": [
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            }
          ]
        },
        {
          "row": 7,
          "keys": [
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            }
          ]
        },
        {
          "row": 8,
          "keys": [
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            }
          ]
        },
        {
          "row": 9,
          "keys": [
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            },
            {
              "row": 0,
              "col": 0,
              "ratio": 0,
              "type": "key"
            }
          ]
        }
      ]
    },
    "lightingTopology": {
      "isDoubleLighting": true,
      "doubleLightingRaw": 1,
      "lampStructure": "上下双灯位 (上灯+下灯)",
      "totalLeds": 165,
      "mainMatrixLeds": 122,
      "lightingAreas": [
        {
          "index": 0,
          "count": 20,
          "rows": 6,
          "cols": 14
        },
        {
          "index": 1,
          "count": 5,
          "rows": 1,
          "cols": 39
        }
      ],
      "spaceLamps": {
        "hasIndependentSpaceLamps": true,
        "count": 5,
        "layoutType": "5-LED",
        "independentEditable": true,
        "description": "空格键包含 5 颗独立可编辑物理灯珠 (Row 5: col 4~8)",
        "coordinates": [
          {
            "index": 1,
            "row": 5,
            "col": 4,
            "desc": "空格灯珠 1 (左侧边缘灯)"
          },
          {
            "index": 2,
            "row": 5,
            "col": 5,
            "desc": "空格灯珠 2 (左中补光灯)"
          },
          {
            "index": 3,
            "row": 5,
            "col": 6,
            "desc": "空格灯珠 3 (中心主轴灯)"
          },
          {
            "index": 4,
            "row": 5,
            "col": 7,
            "desc": "空格灯珠 4 (右中补光灯)"
          },
          {
            "index": 5,
            "row": 5,
            "col": 8,
            "desc": "空格灯珠 5 (右侧边缘灯)"
          }
        ]
      },
      "stripLighting": {
        "hasStrip": true,
        "stripCols": 39,
        "stripRows": 1,
        "totalStripLeds": 39,
        "supportedStripEffects": [
          {
            "id": 1,
            "mode": 0,
            "label": "L1",
            "name": "常亮模式",
            "desc": "全灯带纯色恒亮",
            "supportRainbow": false
          },
          {
            "id": 2,
            "mode": 1,
            "label": "L2",
            "name": "随波逐流",
            "desc": "七彩波浪横向涌动",
            "supportRainbow": true
          },
          {
            "id": 3,
            "mode": 7,
            "label": "L3",
            "name": "闪耀彩虹",
            "desc": "晶莹闪烁耀眼光斑",
            "supportRainbow": true
          },
          {
            "id": 4,
            "mode": 15,
            "label": "L4",
            "name": "流光漫延",
            "desc": "柔和多色渐变过渡",
            "supportRainbow": true
          }
        ]
      },
      "supportedEffects": [
        {
          "id": 1,
          "mode": 0,
          "label": "L1",
          "name": "常亮模式",
          "desc": "全键纯色恒亮",
          "supportRainbow": false
        },
        {
          "id": 2,
          "mode": 1,
          "label": "L2",
          "name": "随波逐流",
          "desc": "七彩波浪横向涌动",
          "supportRainbow": true
        },
        {
          "id": 3,
          "mode": 2,
          "label": "L3",
          "name": "潮起潮落",
          "desc": "色彩平缓起伏呼吸",
          "supportRainbow": true
        },
        {
          "id": 4,
          "mode": 3,
          "label": "L4",
          "name": "涟漪清漾",
          "desc": "按压以同心圆向外扩散",
          "supportRainbow": true
        },
        {
          "id": 5,
          "mode": 4,
          "label": "L5",
          "name": "旋转风暴",
          "desc": "光影如风暴般回旋",
          "supportRainbow": true
        },
        {
          "id": 6,
          "mode": 5,
          "label": "L6",
          "name": "幸运彩虹",
          "desc": "经典全彩横向流动",
          "supportRainbow": true
        },
        {
          "id": 7,
          "mode": 6,
          "label": "L7",
          "name": "彩色漩涡",
          "desc": "光环如漩涡流转",
          "supportRainbow": true
        },
        {
          "id": 8,
          "mode": 7,
          "label": "L8",
          "name": "闪耀彩虹",
          "desc": "晶莹闪烁耀眼光斑",
          "supportRainbow": true
        },
        {
          "id": 9,
          "mode": 8,
          "label": "L9",
          "name": "暗香浮动",
          "desc": "柔和幽光若隐若现",
          "supportRainbow": true
        },
        {
          "id": 10,
          "mode": 9,
          "label": "L10",
          "name": "九宫格",
          "desc": "方块矩阵交替变幻",
          "supportRainbow": true
        },
        {
          "id": 11,
          "mode": 10,
          "label": "L11",
          "name": "川流不息",
          "desc": "光彩如溪流奔涌不息",
          "supportRainbow": true
        },
        {
          "id": 12,
          "mode": 11,
          "label": "L12",
          "name": "正弦曲线",
          "desc": "平滑曲线波动起伏",
          "supportRainbow": true
        },
        {
          "id": 13,
          "mode": 12,
          "label": "L13",
          "name": "霓虹诗篇",
          "desc": "错落有致的多彩光带",
          "supportRainbow": true
        },
        {
          "id": 14,
          "mode": 13,
          "label": "L14",
          "name": "百花争艳",
          "desc": "按键如繁花绽放盛开",
          "supportRainbow": true
        },
        {
          "id": 15,
          "mode": 14,
          "label": "L15",
          "name": "繁星点点",
          "desc": "数码雨滴与随机星芒",
          "supportRainbow": true
        },
        {
          "id": 16,
          "mode": 15,
          "label": "L16",
          "name": "幻彩流光",
          "desc": "柔和多色渐变过渡",
          "supportRainbow": true
        },
        {
          "id": 17,
          "mode": 17,
          "label": "L17",
          "name": "踏雪寻梅",
          "desc": "点按即亮唤醒光点",
          "supportRainbow": true
        },
        {
          "id": 18,
          "mode": 18,
          "label": "L18",
          "name": "峰回路转",
          "desc": "双向激光光波激荡",
          "supportRainbow": true
        },
        {
          "id": 19,
          "mode": 19,
          "label": "L19",
          "name": "水波荡漾",
          "desc": "轻触泛起层层水花",
          "supportRainbow": true
        },
        {
          "id": 20,
          "mode": 20,
          "label": "L20",
          "name": "自定义涂色",
          "desc": "全键单键自定义独立涂色",
          "supportRainbow": false
        }
      ],
      "boardLightingSnapshot": {
        "area": "Keyboard",
        "open": "Open",
        "mode": 1,
        "luminance": 80,
        "speed": 80,
        "direction": "Forward",
        "selectStaticColor": 0
      }
    },
    "performanceSpec": {
      "supportedPollingRates": [
        250,
        500,
        1000,
        2000,
        4000,
        8000
      ],
      "maxPollingRate": 8000,
      "hardwareRateCeiling": 8000,
      "defaultPollingRate": 8000,
      "rtPrecisionMm": 0.001,
      "usbModeStatus": {
        "mode": 0,
        "driverStatus": 0,
        "vid": 0,
        "pid": 0,
        "bootVid": 0,
        "bootPid": 0,
        "needInstallDriver": 0
      },
      "boardConfigSlots": {
        "total": 4,
        "current": "Config1",
        "list": [
          "Config1",
          "Config2",
          "Config3",
          "Config4"
        ]
      },
      "shakeOptimizationSwitch": {
        "enabled": true,
        "status": 1
      },
      "higherKeyCapabilities": {
        "rs": true,
        "socd": true,
        "dks": true,
        "mt": true,
        "tgl": true,
        "mpt": true,
        "end": true
      }
    },
    "axisAndCalibration": {
      "defaultAxis": {
        "id": 1,
        "name": "磁玉 Pro",
        "brand": "佳达隆 (GATERON)",
        "travel": 3.5,
        "badge": "ES68出厂标配/客制化",
        "recommendedAP": 0.4,
        "description": "/ 客制化 PCB 标配首选，高透光上盖，3.5mm 顺滑低抖。"
      },
      "boardAxisSkuList": [],
      "rawBoardAxisIds": [],
      "hallCalibrationSupported": true,
      "currentCalibrationStatus": [
        {
          "row": 0,
          "calibrate": 2,
          "data": [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
          ]
        },
        {
          "row": 1,
          "calibrate": 2,
          "data": [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
          ]
        },
        {
          "row": 2,
          "calibrate": 2,
          "data": [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
          ]
        },
        {
          "row": 3,
          "calibrate": 2,
          "data": [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
          ]
        },
        {
          "row": 4,
          "calibrate": 2,
          "data": [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
          ]
        },
        {
          "row": 5,
          "calibrate": 2,
          "data": [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
          ]
        }
      ],
      "currentRouteData": [
        {
          "row": 0,
          "data": [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
          ]
        },
        {
          "row": 1,
          "data": [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
          ]
        },
        {
          "row": 2,
          "data": [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
          ]
        },
        {
          "row": 3,
          "data": [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
          ]
        },
        {
          "row": 4,
          "data": [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
          ]
        },
        {
          "row": 5,
          "data": [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
          ]
        }
      ],
      "currentADCSamples": [
        {
          "row": 0,
          "adc": 0,
          "data": [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
          ]
        },
        {
          "row": 1,
          "adc": 0,
          "data": [
            2610,
            2388,
            2497,
            2541,
            2630,
            2512,
            2648,
            2570,
            2578,
            2567,
            2575,
            2519,
            2428,
            2577,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
          ]
        },
        {
          "row": 2,
          "adc": 0,
          "data": [
            2651,
            2584,
            2485,
            2611,
            2488,
            2471,
            2527,
            2540,
            2459,
            2544,
            2577,
            2458,
            2582,
            2561,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
          ]
        },
        {
          "row": 3,
          "adc": 0,
          "data": [
            2495,
            2546,
            2507,
            2369,
            2565,
            2656,
            2442,
            2693,
            2360,
            2515,
            2540,
            2496,
            0,
            2480,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
          ]
        },
        {
          "row": 4,
          "adc": 0,
          "data": [
            2559,
            0,
            2552,
            2537,
            2461,
            2536,
            2545,
            2461,
            2523,
            2455,
            2596,
            2452,
            0,
            2544,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
          ]
        },
        {
          "row": 5,
          "adc": 0,
          "data": [
            2635,
            2656,
            2529,
            0,
            0,
            0,
            2418,
            0,
            0,
            0,
            2572,
            2608,
            2608,
            2473,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
          ]
        }
      ]
    },
    "deviceProfile": {
      "id": "pcb_0x1ca6_0x300b",
      "brand": "江湾 Everglide",
      "model": "AE61 Pro",
      "name": "江湾 AE61 Pro 磁轴键盘",
      "shortName": "AE61 Pro",
      "type": "keyboard",
      "layout": "60keys",
      "layoutName": "60%经典配列 (61键)",
      "totalKeyCount": 61,
      "vendorId": 7334,
      "productId": 12299,
      "vendorIdHex": "0x1CA6",
      "productIdHex": "0x300B",
      "connectionType": "wired",
      "connectionLabel": "USB 极速有线",
      "isWired": true,
      "hasBattery": false,
      "maxPollingRate": 8000,
      "hardRateCeiling": 8000,
      "supportedPollingRates": [
        250,
        500,
        1000,
        2000,
        4000,
        8000
      ],
      "defaultPollingRate": 8000,
      "minActuationPoint": 0.001,
      "defaultAxis": "磁玉 Pro",
      "features": {
        "magneticAxis": true,
        "rtSupport": true,
        "socdSupport": true,
        "dksSupport": true,
        "mptSupport": true,
        "furyMode": true,
        "rgbLighting": true,
        "hallCalibration": true,
        "continuousRt": false,
        "doubleLighting": true,
        "stripLighting": true,
        "shakeOptimization": false,
        "spaceMultiLamp": true
      },
      "brandName": "江湾 Everglide",
      "layoutCategory": "61keys"
    },
    "rawSnapshot": {
      "defaultKeyLayout": {
        "normal": [
          {
            "row": 0,
            "keycodes": [
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0
            ]
          },
          {
            "row": 1,
            "keycodes": [
              41,
              30,
              31,
              32,
              33,
              34,
              35,
              36,
              37,
              38,
              39,
              45,
              46,
              42,
              0,
              0,
              0,
              0,
              0,
              0,
              0
            ]
          },
          {
            "row": 2,
            "keycodes": [
              43,
              20,
              26,
              8,
              21,
              23,
              28,
              24,
              12,
              18,
              19,
              47,
              48,
              49,
              0,
              0,
              0,
              0,
              0,
              0,
              0
            ]
          },
          {
            "row": 3,
            "keycodes": [
              57,
              4,
              22,
              7,
              9,
              10,
              11,
              13,
              14,
              15,
              51,
              52,
              0,
              40,
              0,
              0,
              0,
              0,
              0,
              0,
              0
            ]
          },
          {
            "row": 4,
            "keycodes": [
              225,
              0,
              29,
              27,
              6,
              25,
              5,
              17,
              16,
              54,
              55,
              56,
              0,
              229,
              0,
              0,
              0,
              0,
              0,
              0,
              0
            ]
          },
          {
            "row": 5,
            "keycodes": [
              224,
              227,
              226,
              0,
              0,
              0,
              44,
              0,
              0,
              0,
              230,
              61697,
              101,
              228,
              0,
              0,
              0,
              0,
              0,
              0,
              0
            ]
          }
        ],
        "fn": [
          {
            "row": 0,
            "keycodes": [
              1,
              1,
              1,
              1,
              1,
              1,
              1,
              1,
              1,
              1,
              1,
              1,
              1,
              1,
              1,
              1,
              1,
              1,
              1,
              1,
              1
            ]
          },
          {
            "row": 1,
            "keycodes": [
              53,
              58,
              59,
              60,
              61,
              62,
              63,
              64,
              65,
              66,
              67,
              68,
              69,
              8594,
              1,
              1,
              1,
              1,
              1,
              1,
              1
            ]
          },
          {
            "row": 2,
            "keycodes": [
              1,
              1,
              82,
              62215,
              62208,
              62209,
              62231,
              62224,
              62225,
              61952,
              70,
              71,
              72,
              76,
              1,
              1,
              1,
              1,
              1,
              1,
              1
            ]
          },
          {
            "row": 3,
            "keycodes": [
              1,
              80,
              81,
              79,
              8374,
              61957,
              61958,
              61959,
              61960,
              73,
              74,
              77,
              1,
              62210,
              1,
              1,
              1,
              1,
              1,
              1,
              1
            ]
          },
          {
            "row": 4,
            "keycodes": [
              1,
              1,
              8425,
              8426,
              8418,
              8373,
              61962,
              8397,
              61954,
              61953,
              75,
              78,
              1,
              62211,
              1,
              1,
              1,
              1,
              1,
              1,
              1
            ]
          },
          {
            "row": 5,
            "keycodes": [
              1,
              61961,
              1,
              1,
              1,
              1,
              1,
              1,
              1,
              1,
              62213,
              1,
              1,
              62212,
              1,
              1,
              1,
              1,
              1,
              1,
              1
            ]
          }
        ]
      }
    }
  }
];
