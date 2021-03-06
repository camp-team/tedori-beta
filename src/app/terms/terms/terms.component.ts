import { Component, OnInit } from '@angular/core';
import { SeoService } from 'src/app/services/seo.service';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss'],
})
export class TermsComponent implements OnInit {
  constructor(private seoService: SeoService) {
    this.seoService.setTitleAndMeta('利用規約', 'TEDORIの利用規約です。');
  }

  ngOnInit(): void {}
}
