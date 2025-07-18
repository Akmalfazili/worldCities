import { Component } from '@angular/core';
import { FormGroup, AbstractControl } from '@angular/forms';

@Component({
  template:''
})
export abstract class BaseFormComponent {

  form!: FormGroup;

  getErrors(
    control: AbstractControl,
    displayName: string,
    customMessages: {[key:string]:string} | null = null
  ): string[] {
    var errors: string[] = [];
    Object.keys(control.errors || {}).forEach((key) => {
      switch (key) {
        case 'email':
          errors.push(`${displayName} ${customMessages?.[key] ?? "format is invalid."}`);
          break;
        case 'required':
          errors.push(`${displayName} ${customMessages?.[key]?? "is required."}`);
          break;
        case 'pattern':
          errors.push(`${displayName} ${customMessages?.[key]?? "contains invalid characters."}`);
          break;
        case 'isDupeField':
          errors.push(`${displayName} ${customMessages?.[key]??"already exists: please choose another."}`);
          break;
        case 'notSame':
          errors.push(`${displayName} ${customMessages?.[key] ?? "does not match."}`);
          break;
        case 'minLength':
          errors.push(`${displayName} ${customMessages?.[key] ?? "must be at least 8 characters long."}`);
          break;
        case 'uppercase':
          errors.push(`${displayName} ${customMessages?.[key] ?? "must have at least 1 uppercase character."}`);
          break;
        case 'lowercase':
          errors.push(`${displayName} ${customMessages?.[key] ?? "must have at least 1 lowercase character."}`);
          break;
        case 'digit':
          errors.push(`${displayName} ${customMessages?.[key] ?? "must have at least 1 digit."}`);
          break;
        case 'specialChar':
          errors.push(`${displayName} ${customMessages?.[key] ?? "must have at least 1 special character (!@#$%^&*)."}`);
          break;
        default:
          errors.push(`${displayName} is invalid.`);
          break;
      }
    });
    return errors;
  }
  constructor() { }

}
