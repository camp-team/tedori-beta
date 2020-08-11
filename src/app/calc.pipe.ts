import { Pipe, PipeTransform } from '@angular/core';
import { Condition } from './interfaces/condition';
import { Deductions } from './interfaces/deductions';
import { PaymentService } from './services/payment.service';
import { NationalTaxService } from './services/national-tax.service';
import { LaborInsService } from './services/labor-ins.service';
import { SocialInsService } from './services/social-ins.service';

@Pipe({
  name: 'calc',
})
export class CalcPipe implements PipeTransform {
  constructor(
    private paymentServise: PaymentService,
    private nationalTaxService: NationalTaxService,
    private laborInsService: LaborInsService,
    private socialInsService: SocialInsService
  ) {}

  transform(condition: Condition, type: string, rate?: Deductions): string {
    // 総支給額
    const payment = this.paymentServise.getPayment(condition);
    const baseSalary: number = payment.baseSalary;
    const allowance: number = payment.allowance;
    const travelCost: number = payment.travelCost;
    const total: number = baseSalary + allowance + travelCost;

    // 各種保険料率
    const healthInsRateList = rate ? rate.socialIns.healthInsRateList : [];
    const nursingInsRate = rate ? rate.socialIns.nursingInsRate : 0;
    const pensionInsRate = rate ? rate.socialIns.pensionInsRate : 0;
    const childrenInsRate = rate ? rate.socialIns.childrenInsRate : 0;
    const compensationInsRate = rate ? rate.compensationIns.rate : 0;
    const workerBurden = rate ? rate.unemploymentIns.workerBurden : 0;
    const ownerBurden = rate ? rate.unemploymentIns.ownerBurden : 0;

    // 社会保険（健康保険・厚生年金・介護保険・子育て拠出金）
    const healthIns = this.socialInsService.getHealthIns(
      total,
      condition.ins,
      condition.area,
      healthInsRateList
    );
    const healthInsWorder: number = healthIns.healthInsWorder;
    const healthInsOwner: number = healthIns.healthInsOwner;

    const nursingIns = this.socialInsService.getNursingIns(
      total,
      condition.ins,
      condition.age,
      nursingInsRate
    );
    const nursingInsWorker: number = nursingIns.nursingInsWorker;
    const nursingInsOwner: number = nursingIns.nursingInsOwner;

    const pensionIns = this.socialInsService.getPensionIns(
      total,
      condition.ins,
      pensionInsRate
    );
    const pensionInsWorker: number = pensionIns.pensionInsWorker;
    const pensionInsOwner: number = pensionIns.pensionInsOwner;

    const childrenIns: number = this.socialInsService.getChildrenIns(
      total,
      condition.ins,
      childrenInsRate
    );

    // 労働保険（労災保険・雇用保険）
    const compensationIns = this.laborInsService.getCompensationIns(
      total,
      compensationInsRate
    );
    const unemploymentIns = this.laborInsService.getUnemploymentIns(
      total,
      condition.unemploymentIns,
      workerBurden,
      ownerBurden
    );
    const unemploymentInsWorker: number = unemploymentIns.unemploymentInsWorker;
    const unemploymentInsOwner: number = unemploymentIns.unemploymentInsOwner;

    // 社会保険料・雇用保険料 合計
    const insTotal: number =
      healthInsWorder +
      nursingInsWorker +
      pensionInsWorker +
      unemploymentInsWorker;

    // 源泉所得税
    const taxTargetFee: number = baseSalary + allowance - insTotal;
    const nationalTax: number = this.nationalTaxService.getNationalTax(
      taxTargetFee,
      condition.dependents
    );

    // 控除額合計
    const deductionTotal: number =
      insTotal + nationalTax + condition.cityTax + condition.otherDeduction;

    // 差引支給額（手取り額）
    const takeHomeFee: number = total - deductionTotal;

    // 事業者負担合計
    const ownerBurdenTotal: number =
      healthInsOwner +
      nursingInsOwner +
      pensionInsOwner +
      childrenIns +
      compensationIns +
      unemploymentInsOwner;

    // 事業者支出額合計
    const ownerDisbursementTotal: number = total + ownerBurdenTotal;

    // 出力する値
    let target: number;
    switch (type) {
      case 'baseSalary':
        target = baseSalary;
        break;
      case 'travelCost':
        target = travelCost;
        break;
      case 'total':
        target = total;
        break;
      case 'compensationIns':
        target = compensationIns;
        break;
      case 'unemploymentInsWorker':
        target = unemploymentInsWorker;
        break;
      case 'unemploymentInsOwner':
        target = unemploymentInsOwner;
        break;
      case 'childrenIns':
        target = childrenIns;
        break;
      case 'pensionInsWorker':
        target = pensionInsWorker;
        break;
      case 'pensionInsOwner':
        target = pensionInsOwner;
        break;
      case 'nursingInsWorker':
        target = nursingInsWorker;
        break;
      case 'nursingInsOwner':
        target = nursingInsOwner;
        break;
      case 'healthInsWorder':
        target = healthInsWorder;
        break;
      case 'healthInsOwner':
        target = healthInsOwner;
        break;
      case 'nationalTax':
        target = nationalTax;
        break;
      case 'deductionTotal':
        target = deductionTotal;
        break;
      case 'takeHomeFee':
        target = takeHomeFee;
        break;
      case 'ownerBurdenTotal':
        target = ownerBurdenTotal;
        break;
      case 'ownerDisbursementTotal':
        target = ownerDisbursementTotal;
        break;
    }

    return target.toLocaleString();
  }
}
