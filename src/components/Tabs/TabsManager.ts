import { Tab } from './Tab';
import { BindingEngine } from '../../core/BindingEngine';
import { PresetManager } from '../../core/PresetManager';
import { SoundEngine } from '../../core/SoundEngine';

export class TabsManager {
  public barEl: HTMLElement;
  public bodyEl: HTMLElement;
  private tabs: Tab[] = [];
  private activeTab: Tab | null = null;

  constructor(
    parentHeader: HTMLElement,
    parentBody: HTMLElement,
    private bindingEngine: BindingEngine,
    private presetManager: PresetManager,
    private soundEngine?: SoundEngine
  ) {
    this.barEl = document.createElement('div');
    this.barEl.className = 'relly-tabs-bar';
    this.barEl.style.display = 'none'; // Hidden until first tab is added

    this.bodyEl = parentBody;
    parentHeader.insertAdjacentElement('afterend', this.barEl);
  }

  public addTab(label: string): Tab {
    this.barEl.style.display = 'flex';

    const tab = new Tab(label, this.bindingEngine, this.presetManager, this.soundEngine);
    this.tabs.push(tab);

    this.barEl.appendChild(tab.buttonEl);
    this.bodyEl.appendChild(tab.contentEl);

    tab.buttonEl.addEventListener('click', () => {
      this.switchTab(tab);
    });

    // If first tab, make it active
    if (this.tabs.length === 1) {
      this.switchTab(tab, false);
    }

    return tab;
  }

  public switchTab(tab: Tab, playSound: boolean = true): void {
    if (this.activeTab !== tab && playSound) {
      this.soundEngine?.playTab();
    }
    this.activeTab = tab;
    for (const t of this.tabs) {
      t.setActive(t === tab);
    }
  }

  public getActiveTab(): Tab | null {
    return this.activeTab;
  }

  public getTabs(): Tab[] {
    return this.tabs;
  }

  public destroy(): void {
    for (const tab of this.tabs) {
      tab.destroy();
    }
    this.tabs = [];
    this.barEl.remove();
  }
}
