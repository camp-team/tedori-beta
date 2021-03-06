import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { ConditionsService } from 'src/app/services/conditions.service';
import { NationalTaxService } from 'src/app/services/national-tax.service';

@Component({
  selector: 'app-national-tax-calc',
  templateUrl: './national-tax-calc.component.html',
  styleUrls: ['./national-tax-calc.component.scss'],
})
export class NationalTaxCalcComponent implements OnInit {
  readonly range = {
    min: 0,
    max: 999999999,
  };

  result: number;
  processing = false;

  form = this.fb.group({
    target: [
      '',
      [
        Validators.required,
        Validators.min(this.range.min),
        Validators.max(this.range.max),
        Validators.pattern(/^[0-9]\d*$/),
      ],
    ],
    dependents: 0,
  });

  constructor(
    private fb: FormBuilder,
    public condetionsService: ConditionsService,
    private nationalTaxService: NationalTaxService
  ) {}

  ngOnInit(): void {}

  getNationalTax() {
    this.processing = true;
    const formValue = this.form.value;
    this.result = this.nationalTaxService.getNationalTax(
      formValue.target,
      formValue.dependents
    );
    this.processing = false;
  }
}
