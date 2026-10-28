import { ContainerHelper } from './ComponentContainer';
import { SchemaDefinition, SchemaControl } from '../types';

export class SchemaLoader {
  public static load(container: ContainerHelper, schema: SchemaDefinition): void {
    const defaultTarget = schema.target;

    const loadControls = (targetContainer: ContainerHelper, controls: SchemaControl[]) => {
      for (const ctrl of controls) {
        const subControls = ctrl.children || (ctrl as any).controls;

        if (ctrl.type === 'section') {
          const section = (targetContainer as any).addSection(
            ctrl.label || 'Section',
            ctrl.collapsed
          );
          if (ctrl.showIf && section.showIf) {
            section.showIf(ctrl.showIf);
          }
          if (subControls && Array.isArray(subControls)) {
            loadControls(section, subControls);
          }
        } else if (ctrl.type === 'row') {
          const row = (targetContainer as any).addRow();
          if (subControls && Array.isArray(subControls)) {
            loadControls(row, subControls);
          }
        } else {
          const opts = {
            ...ctrl,
            object: ctrl.object !== undefined ? ctrl.object : defaultTarget
          };
          targetContainer.createComponent(opts);
        }
      }
    };

    if (schema.controls && Array.isArray(schema.controls)) {
      loadControls(container, schema.controls);
    }
  }
}
