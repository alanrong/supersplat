import './ui/scss/style.scss';
import { version as pcuiVersion, revision as pcuiRevision } from 'pcui';
import { version as engineVersion, revision as engineRevision, ResourceLoader } from 'playcanvas';

import { main } from './main';
import { version as appVersion } from '../package.json';
import { Application, GraphicsDevice, AssetRegistry, EventHandler } from 'playcanvas';
import { AssetLoader } from './asset-loader';

// 重构文件选择器初始化
let filePickerInstance: HTMLInputElement | null = null;

const createFilePicker = () => {
    if (filePickerInstance) {
        console.warn('文件选择器已存在，避免重复创建');
        return filePickerInstance;
    }

    const filePicker = document.createElement('input');
    filePicker.id = 'supersplat-file-picker';
    filePicker.type = 'file';
    filePicker.accept = '.ply,.splat,.zip,.json';
    filePicker.style.display = 'none';

    // 彻底禁用移动端相机模式
    filePicker.setAttribute('data-role', 'none');
    filePicker.setAttribute('data-capture', 'none');
    filePicker.removeAttribute('capture');

    console.group('文件选择器配置详情');
    console.log('基础配置:', {
        id: filePicker.id,
        accept: filePicker.accept,
        multiple: filePicker.multiple
    });

    if (/Android|iPhone|iPad/i.test(navigator.userAgent)) {
        console.log('移动端特殊处理激活');
        filePicker.setAttribute('webkitdirectory', '');
        filePicker.setAttribute('directory', '');
        filePicker.setAttribute('data-mobile', 'true');
    }
    console.groupEnd();

    filePicker.addEventListener('change', (e) => {
        const files = (e.target as HTMLInputElement).files;
        console.groupCollapsed('文件选择结果');
        if (files?.length) {
            console.table(Array.from(files).map(f => ({
                name: f.name,
                type: f.type,
                size: `${(f.size / 1024).toFixed(2)}KB`,
                lastModified: new Date(f.lastModified).toLocaleString()
            })));
        } else {
            console.warn('未选择文件或选择已取消');
        }
        console.groupEnd();
    });

    document.body.appendChild(filePicker);
    filePickerInstance = filePicker;
    return filePicker;
};

// 统一初始化入口
const initFileSelectionSystem = () => {
    console.group('文件选择系统初始化');
    try {
        const picker = createFilePicker();
        const button = document.getElementById('right-toolbar-import');
        
        if (!button) {
            throw new Error('未找到文件选择按钮');
        }

        button.addEventListener('click', () => {
            console.group('文件选择触发流程');
            console.log('当前设备信息:', {
                userAgent: navigator.userAgent,
                platform: navigator.platform
            });
            
            try {
                console.log('重置文件选择器状态');
                picker.value = '';
                
                console.log('触发文件选择对话框');
                picker.click();
                
                console.log('文件选择器已激活');
            } catch (error) {
                console.error('文件选择失败:', error);
                alert('文件选择功能异常，请尝试刷新页面');
            }
            console.groupEnd();
        });
        
        console.log('文件选择系统初始化完成');
    } catch (error) {
        console.error('初始化失败:', error);
    }
    console.groupEnd();
};

// 在DOM加载后初始化
document.addEventListener('DOMContentLoaded', () => {
    initFileSelectionSystem();
});

// 确保没有其他地方的initFilePicker调用
console.log('使用createFilePicker初始化文件选择系统');

// 确保没有其他地方的initFilePicker调用
console.log('移动端文件选择系统初始化完成');

// 创建 PlayCanvas 应用实例
const canvas = document.createElement('canvas');
canvas.style.position = 'absolute';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.width = '100%';
canvas.style.height = '100%';
document.body.appendChild(canvas);
const app = new Application(canvas, {
    graphicsDeviceOptions: {
        alpha: true  // 启用透明度
    }
});

// 获取 GraphicsDevice 实例
const device: GraphicsDevice = app.graphicsDevice;

// 创建 ResourceLoader 实例
// Create ResourceLoader instance with application context
const loader = new ResourceLoader(app);

// 创建 AssetRegistry 实例
const registry = new AssetRegistry(loader);

// 创建 Events 实例（使用 PlayCanvas 的 EventHandler 作为替代）
const events = new EventHandler();

// 修改AssetLoader构造函数调用
const assetLoader = new AssetLoader(device, registry, events as any, 2);

// 更新handleFile函数实现
window.handleFile = function(filePath: string | ArrayBuffer) {
    try {
        if (typeof filePath === 'string') {
            // 浏览器环境 - 直接传递URL
            assetLoader.loadModel({ url: filePath });
        } else {
            // APP环境 - 传递文件内容
            assetLoader.loadModel({ contents: filePath } as any);
        }
        console.log('正在加载文件:', filePath);
    } catch (error) {
        console.error('文件加载出错:', error);
    }
};

// 增强调试日志的文件选择逻辑
const isAppEnvironment = () => {
    const isCordova = !!(window as any).cordova;
    const isCapacitor = !!(window as any).Capacitor;
    const isFileProtocol = window.location.protocol === 'file:';
    
    console.log('Environment check:', {
        isCordova,
        isCapacitor, 
        isFileProtocol,
        userAgent: navigator.userAgent
    });
    
    return isCordova || isCapacitor || isFileProtocol;
};

if (isAppEnvironment()) {
    console.log('APP environment detected, initializing enhanced file picker...');
    
    console.log('Attempting to initialize file picker...');
    try {
        initFileSelectionSystem();
    } catch (e) {
        console.error('Immediate initialization failed, falling back to deviceready:', e);
        document.addEventListener('deviceready', () => {
            console.log('deviceready event received, retrying initialization...');
            initFileSelectionSystem();
        }, false);
    }
}

// 修改ServiceWorker注册逻辑
const isHttps = window.location.protocol === 'https:';
const isFileProtocol = window.location.protocol === 'file:';

if ('serviceWorker' in navigator && isHttps) {
    navigator.serviceWorker.register('/sw.js')
        .then(registration => {
            console.log('ServiceWorker registration successful:', registration);
        })
        .catch(error => {
            console.log('ServiceWorker registration failed:', error);
        });
} else if (isFileProtocol) {
    console.log('ServiceWorker disabled in file protocol (APP environment)');
} else {
    console.log('ServiceWorker disabled in current environment');
}

// print out versions of dependent packages
// NOTE: add dummy style reference to prevent tree shaking
console.log(`SuperSplat v${appVersion} | PCUI v${pcuiVersion} (${pcuiRevision}) | Engine v${engineVersion} (${engineRevision})`);

main();