import { Button, Container, Element, Label } from 'pcui';

import { Events } from '../events';
import { localize } from './localization';
import cameraFrameSelectionSvg from './svg/camera-frame-selection.svg';
import cameraResetSvg from './svg/camera-reset.svg';
import centersSvg from './svg/centers.svg';
import colorPanelSvg from './svg/color-panel.svg';
import ringsSvg from './svg/rings.svg';
import showHideSplatsSvg from './svg/show-hide-splats.svg';
import { Tooltips } from './tooltips';
import sceneImport from './svg/import.svg';  // 新增导入

const createSvg = (svgString: string) => {
    const decodedStr = decodeURIComponent(svgString.substring('data:image/svg+xml,'.length));
    return new DOMParser().parseFromString(decodedStr, 'image/svg+xml').documentElement;
};

class RightToolbar extends Container {
    constructor(events: Events, tooltips: Tooltips, args = {}) {
        args = {
            ...args,
            id: 'right-toolbar'
        };

        super(args);

        this.dom.addEventListener('pointerdown', (event) => {
            event.stopPropagation();
        });

        const ringsModeToggle = new Button({
            id: 'right-toolbar-mode-toggle',
            class: 'right-toolbar-toggle'
        });

        const showHideSplats = new Button({
            id: 'right-toolbar-show-hide',
            class: ['right-toolbar-toggle', 'active']
        });

        // const cameraFrameSelection = new Button({
        //     id: 'right-toolbar-frame-selection',
        //     class: 'right-toolbar-button'
        // });

        const cameraReset = new Button({
            id: 'right-toolbar-camera-origin',
            class: 'right-toolbar-button'
        });

        // const colorPanel = new Button({
        //     id: 'right-toolbar-color-panel',
        //     class: 'right-toolbar-toggle'
        // });

        // const options = new Button({
        //     id: 'right-toolbar-options',
        //     class: 'right-toolbar-toggle',
        //     icon: 'E283'
        // });

        // 新增导入按钮
        const importButton = new Button({
            id: 'right-toolbar-import',
            class: 'right-toolbar-button'
        });

        // 添加导入图标
        importButton.dom.appendChild(createSvg(sceneImport));

        const centersDom = createSvg(centersSvg);
        const ringsDom = createSvg(ringsSvg);
        ringsDom.style.display = 'none';

        ringsModeToggle.dom.appendChild(centersDom);
        ringsModeToggle.dom.appendChild(ringsDom);
        showHideSplats.dom.appendChild(createSvg(showHideSplatsSvg));
        // cameraFrameSelection.dom.appendChild(createSvg(cameraFrameSelectionSvg));
        cameraReset.dom.appendChild(createSvg(cameraResetSvg));
        // colorPanel.dom.appendChild(createSvg(colorPanelSvg));

        // 在工具栏中添加导入按钮
        this.append(importButton);
        this.append(new Element({ class: 'right-toolbar-separator' }));

        this.append(ringsModeToggle);
        this.append(showHideSplats);
        this.append(new Element({ class: 'right-toolbar-separator' }));
        // this.append(cameraFrameSelection);
        this.append(cameraReset);
        // this.append(colorPanel);
        // this.append(new Element({ class: 'right-toolbar-separator' }));
        // this.append(options);

        tooltips.register(ringsModeToggle, localize('tooltip.splat-mode'), 'left');
        tooltips.register(showHideSplats, localize('tooltip.show-hide'), 'left');
        // tooltips.register(cameraFrameSelection, localize('tooltip.frame-selection'), 'left');
        tooltips.register(cameraReset, localize('tooltip.camera-reset'), 'left');
        // tooltips.register(colorPanel, localize('tooltip.color-panel'), 'left');
        // tooltips.register(options, localize('tooltip.view-options'), 'left');

        // add event handlers

        ringsModeToggle.on('click', () => {
            events.fire('camera.toggleMode');
            events.fire('camera.setOverlay', true);
        });
        showHideSplats.on('click', () => events.fire('camera.toggleOverlay'));
        // cameraFrameSelection.on('click', () => events.fire('camera.focus'));
        cameraReset.on('click', () => events.fire('camera.reset'));
        // colorPanel.on('click', () => events.fire('colorPanel.toggleVisible'));
        // options.on('click', () => events.fire('viewPanel.toggleVisible'));

        events.on('camera.mode', (mode: string) => {
            ringsModeToggle.class[mode === 'rings' ? 'add' : 'remove']('active');
            centersDom.style.display = mode === 'rings' ? 'none' : 'block';
            ringsDom.style.display = mode === 'rings' ? 'block' : 'none';
        });

        events.on('camera.overlay', (value: boolean) => {
            showHideSplats.class[value ? 'add' : 'remove']('active');
        });

        // events.on('colorPanel.visible', (visible: boolean) => {
        //     colorPanel.class[visible ? 'add' : 'remove']('active');
        // });

        // events.on('viewPanel.visible', (visible: boolean) => {
        //     options.class[visible ? 'add' : 'remove']('active');
        // });

    
        // this.append(cameraFrameSelection);
        this.append(cameraReset);

        // 添加工具提示
        tooltips.register(importButton, localize('file.import'), 'left');

        // 添加点击事件
        importButton.on('click', async () => {
            await events.invoke('scene.import');
        });

        events.on('camera.overlay', (value: boolean) => {
            showHideSplats.class[value ? 'add' : 'remove']('active');
        });

        // events.on('colorPanel.visible', (visible: boolean) => {
        //     colorPanel.class[visible ? 'add' : 'remove']('active');
        // });

        // events.on('viewPanel.visible', (visible: boolean) => {
        //     options.class[visible ? 'add' : 'remove']('active');
        // });
    }
}

export { RightToolbar };
