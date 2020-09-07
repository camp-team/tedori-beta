import { Component, OnInit, Input } from '@angular/core';
import { Deductions } from 'src/app/interfaces/deductions';
import {
  FormGroup,
  FormBuilder,
  FormArray,
  Validators,
  FormControl,
} from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { ConditionsService } from 'src/app/services/conditions.service';
import { Condition } from 'src/app/interfaces/condition';

@Component({
  selector: 'app-main-form',
  templateUrl: './main-form.component.html',
  styleUrls: ['./main-form.component.scss'],
})
export class MainFormComponent implements OnInit {
  @Input() rate: Deductions;

  user$ = this.authService.afUser$;
  maxLength = this.conditionsService.maxLength;
  uid: string;
  formGroup: FormGroup;
  dependentsCounts = [...Array(7)].map((_, i) => i + 1);

  private conditionsCount = 2;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private conditionsService: ConditionsService
  ) {
    this.buildForm();
  }

  get formConditions(): FormArray {
    return this.formGroup.get('formConditions') as FormArray;
  }

  ngOnInit(): void {}

  buildForm() {
    this.formGroup = this.fb.group({
      formConditions: this.fb.array([]),
      formSelect: [
        'single',
        [Validators.required, Validators.pattern(/single|multi/)],
      ],
    });
    for (let i = 0; i < this.conditionsCount; i++) {
      const conditionGroup = this.conditionsService.conditionGroup;
      this.formConditions.push(conditionGroup);
    }
  }

  transferData(condition: Condition): Condition {
    return this.conditionsService.transferData(condition);
  }

  submit() {
    const formValue = this.formGroup.value;
    const conditions = formValue.formConditions;
    let formData: Condition[];

    if (formValue.formSelect === 'single') {
      formData = [this.transferData(conditions[0])];
    } else {
      formData = conditions.map((condition) => this.transferData(condition));
    }
    this.conditionsService.setConditions(formData);
  }
}
