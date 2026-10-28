import { describe, it, expect, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('CDN dynamic script loading simulation', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    // Clean global
    delete (window as any).RellyUI;
  });

  it('should load IIFE bundle via script tag, execute onload, and expose window.RellyUI', async () => {
    const bundlePath = path.resolve(__dirname, '../dist/relly-ui.iife.js');
    const bundleCode = fs.readFileSync(bundlePath, 'utf-8');

    expect(fs.existsSync(bundlePath)).toBe(true);
    expect((window as any).RellyUI).toBeUndefined();

    let initialized = false;

    // Simulate exact pattern from user prompt:
    const initUI = () => {
      const RellyUIClass = (window as any).RellyUI;
      expect(RellyUIClass).toBeDefined();

      const testState = { counter: 10, active: true };
      const ui = new RellyUIClass({ title: 'CDN Demo GUI' });

      ui.addSlider(testState, 'counter').setMin(0).setMax(100);
      ui.addCheckbox(testState, 'active');

      expect(ui.getElement()).toBeDefined();
      expect(document.body.contains(ui.getHost() || ui.getElement())).toBe(true);

      initialized = true;
      ui.destroy();
    };

    // Inject script code simulating script.src load
    const script = document.createElement('script');
    script.textContent = bundleCode;
    document.body.appendChild(script);

    // Call onload callback
    initUI();

    expect(initialized).toBe(true);
  });

  it('should run full index.html demo setup with tabs and sections from IIFE bundle', () => {
    const bundlePath = path.resolve(__dirname, '../dist/relly-ui.iife.js');
    const bundleCode = fs.readFileSync(bundlePath, 'utf-8');

    const script = document.createElement('script');
    script.textContent = bundleCode;
    document.body.appendChild(script);

    const RellyUI = (window as any).RellyUI;
    expect(RellyUI).toBeDefined();

    const appState = {
      particleCount: 80,
      baseSpeed: 1.5,
      trailAlpha: 0.18,
      particleColor: '#38bdf8',
      particleShape: 'circle',
      enableConnections: true,
      connectionDistance: 120,
      activeParticles: 80,
      gravityCenter: { x: 400, y: 300 },
      gravityPull: 0.05,
      isDevMode: true,
      debugBoundX: 0,
      debugBoundY: 100
    };

    const ui = new RellyUI({
      title: 'Quantum Particles Playground',
      shadowDOM: true,
      searchBar: true,
      sound: false,
      theme: 'cyberpunk',
      width: 330
    });

    const simTab = ui.addTab('Simulation');
    simTab.addSlider(appState, 'particleCount').setMin(10).setMax(300).setStep(1);
    simTab.addCheckbox(appState, 'enableConnections');

    const physTab = ui.addTab('Physics');
    physTab.addPoint2D(appState, 'gravityCenter').setLabel('Gravity Center');

    const devTab = ui.addTab('Dev & JSON');
    devTab.addCheckbox(appState, 'isDevMode').setLabel('Enable DEV Mode');

    const devRow = devTab.addRow();
    devRow.addSlider(appState, 'debugBoundX').setLabel('Min X').showIf(() => appState.isDevMode);
    devRow.addSlider(appState, 'debugBoundY').setLabel('Max X').showIf(() => appState.isDevMode);

    const devSection = devTab.addSection('Secret DEV Metrics').showIf(() => appState.isDevMode);
    devSection.addButton('Benchmark 10,000 Nodes', () => {
      appState.particleCount = 1000;
    });

    devTab.addButton('Export Configuration (JSON)', () => {
      ui.copyJSON();
    });

    expect(ui.getElement()).toBeDefined();
    ui.destroy();
  });
});
